import type { RawParamsSchema, Params } from "../params";
import type { OutputQr } from "../QrContext";
import { objString } from "../util";

const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 3,
  },
  "Quiet zone": {
    type: "number",
    min: 0,
    max: 10,
    default: 1,
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
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

function splitmix32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

function renderCanvas(
  qr: OutputQr,
  params: Params<typeof paramsSchema>,
  ctx: CanvasRenderingContext2D
) {
  const seededRand = splitmix32(params["Seed"]);
  const margin = params["Margin"];
  const quietZone = params["Quiet zone"];

  const pixelSize = 10;
  const radius = pixelSize / 2;
  const qrWidth = qr.version * 4 + 17;
  const matrixWidth = qrWidth + 2 * margin;
  const canvasSize = matrixWidth * pixelSize;

  const newMatrix = Array(matrixWidth * matrixWidth).fill(Module.SeparatorOFF);

  // Copy qr to matrix with margin and randomly set pixels in margin
  for (let y = 0; y < margin - quietZone; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (seededRand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }
  for (let y = margin - quietZone; y < margin + qrWidth + quietZone; y++) {
    for (let x = 0; x < margin - quietZone; x++) {
      if (seededRand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
    if (y >= margin && y < margin + qrWidth) {
      for (let x = margin; x < matrixWidth - margin; x++) {
        newMatrix[y * matrixWidth + x] =
          qr.matrix[(y - margin) * qrWidth + x - margin];
      }
    }
    for (let x = margin + qrWidth + quietZone; x < matrixWidth; x++) {
      if (seededRand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }
  for (let y = margin + qrWidth + quietZone; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (seededRand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }

  const fg = "rgb(40, 70, 10)";
  const bg = "rgb(200, 200, 100)";

  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const xMax = matrixWidth - 1;
  const yMax = matrixWidth - 1;

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = newMatrix[y * matrixWidth + x];

      const top = y > 0 && newMatrix[(y - 1) * matrixWidth + x] & 1;
      const bottom = y < yMax && newMatrix[(y + 1) * matrixWidth + x] & 1;
      const left = x > 0 && newMatrix[y * matrixWidth + x - 1] & 1;
      const right = x < xMax && newMatrix[y * matrixWidth + x + 1] & 1;

      ctx.fillStyle = fg;

      if (module & 1) {
        ctx.beginPath();
        ctx.roundRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize, [
          (!left && !top && radius) || 0,
          (!top && !right && radius) || 0,
          (!right && !bottom && radius) || 0,
          (!bottom && !left && radius) || 0,
        ]);
        ctx.fill();
      } else {
        // Draw rounded concave corners
        const topLeft =
          y > 0 && x > 0 && newMatrix[(y - 1) * matrixWidth + x - 1] & 1;
        const topRight =
          y > 0 && x < xMax && newMatrix[(y - 1) * matrixWidth + x + 1] & 1;
        const bottomRight =
          y < yMax && x < xMax && newMatrix[(y + 1) * matrixWidth + x + 1] & 1;
        const bottomLeft =
          y < yMax && x > 0 && newMatrix[(y + 1) * matrixWidth + x - 1] & 1;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

        ctx.beginPath();
        ctx.fillStyle = bg;
        ctx.roundRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize, [
          (left && top && topLeft && radius) || 0,
          (top && right && topRight && radius) || 0,
          (right && bottom && bottomRight && radius) || 0,
          (bottom && left && bottomLeft && radius) || 0,
        ]);
        ctx.fill();
      }
    }
  }
}

const code = `export const paramsSchema = ${objString(paramsSchema)};

const Module = ${objString(Module)};

${splitmix32.toString()}

export ${renderCanvas.toString()}
`;

export default {
  paramsSchema,
  renderSVG: undefined,
  renderCanvas,
  code,
};
