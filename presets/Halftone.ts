import type { Params, RawParamsSchema } from "~/lib/params";
import type { OutputQr } from "~/lib/QrContext";

export const paramsSchema = {
  Image: {
    type: "File",
  },
  Contrast: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 1,
  },
  Brightness: {
    type: "number",
    min: 0,
    max: 5,
    step: 0.1,
    default: 1.8,
  },
  "QR background": {
    type: "boolean",
  },
  "Alignment pattern": {
    type: "boolean",
    default: true,
  },
  "Timing pattern": {
    type: "boolean",
  },
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  Foreground: {
    type: "Color",
    default: "#000000",
  },
  Background: {
    type: "Color",
    default: "#ffffff",
  },
} satisfies RawParamsSchema;

const Module = {
  DataOFF: 0,
  DataON: 1,
  FinderOFF: 2,
  FinderON: 3,
  AlignmentOFF: 4,
  AlignmentON: 5,
  TimingOFF: 6,
  TimingON: 7,
  FormatOFF: 8,
  FormatON: 9,
  VersionOFF: 10,
  VersionON: 11,
  SeparatorOFF: 12,
};

export async function renderCanvas(
  qr: OutputQr,
  params: Params<typeof paramsSchema>,
  ctx: CanvasRenderingContext2D
) {
  const moduleSize = 3;
  const pixelSize = 1;

  const matrixWidth = qr.version * 4 + 17;
  const margin = params["Margin"];
  const fg = params["Foreground"];
  const bg = params["Background"];
  const alignment = params["Alignment pattern"];
  const timing = params["Timing pattern"];
  const file = params["Image"];

  const pixelWidth = matrixWidth + 2 * margin;
  const canvasSize = pixelWidth * moduleSize;
  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  if (params["QR background"]) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = fg;
    for (let y = 0; y < matrixWidth; y++) {
      for (let x = 0; x < matrixWidth; x++) {
        const module = qr.matrix[y * matrixWidth + x];
        if (module & 1) {
          const px = x + margin;
          const py = y + margin;
          ctx.fillRect(
            px * moduleSize,
            py * moduleSize,
            moduleSize,
            moduleSize
          );
        }
      }
    }
  }

  const image = new Image();

  if (file != null) {
    image.src = URL.createObjectURL(file);
  } else {
    // if canvas tainted, need to reload
    // https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image
    image.crossOrigin = "anonymous";
    image.src =
      "https://upload.wikimedia.org/wikipedia/commons/1/14/The_Widow_%28Boston_Public_Library%29_%28cropped%29.jpg";
  }
  await image.decode();

  ctx.filter = `brightness(${params["Brightness"]}) contrast(${params["Contrast"]})`;
  ctx.drawImage(image, 0, 0, canvasSize, canvasSize);
  ctx.filter = "none";

  if (file != null) {
    URL.revokeObjectURL(image.src);
  }

  const imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
  const data = imageData.data;

  for (let y = 0; y < canvasSize; y++) {
    for (let x = 0; x < canvasSize; x++) {
      const i = (y * canvasSize + x) * 4;

      if (data[i + 3] === 0) continue;
      // Convert to grayscale and normalize to 0-255
      const oldPixel =
        (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0;

      let newPixel;
      if (oldPixel < 128) {
        newPixel = 0;
        ctx.fillStyle = fg;
      } else {
        newPixel = 255;
        ctx.fillStyle = bg;
      }
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

      data[i] = data[i + 1] = data[i + 2] = newPixel;
      const error = oldPixel - newPixel;

      // Distribute error to neighboring pixels
      if (x < canvasSize - 1) {
        data[i + 4] += (error * 7) / 16;
      }
      if (y < canvasSize - 1) {
        if (x > 0) {
          data[i + canvasSize * 4 - 4] += (error * 3) / 16;
        }
        data[i + canvasSize * 4] += (error * 5) / 16;
        if (x < canvasSize - 1) {
          data[i + canvasSize * 4 + 4] += (error * 1) / 16;
        }
      }
    }
  }

  const dataOffset = (moduleSize - pixelSize) / 2;

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];
      if (module & 1) {
        ctx.fillStyle = fg;
      } else {
        ctx.fillStyle = bg;
      }

      const px = x + margin;
      const py = y + margin;

      const type = module | 1;
      if (
        type === Module.FinderON ||
        (alignment && type === Module.AlignmentON) ||
        (timing && type === Module.TimingON)
      ) {
        ctx.fillRect(px * moduleSize, py * moduleSize, moduleSize, moduleSize);
      } else {
        ctx.fillRect(
          px * moduleSize + dataOffset,
          py * moduleSize + dataOffset,
          pixelSize,
          pixelSize
        );
      }
    }
  }
}
