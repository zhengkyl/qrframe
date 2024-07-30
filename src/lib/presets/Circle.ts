import type { RawParamsSchema, Params } from "../params";
import type { OutputQr } from "../QrContext";
import { objString } from "../util";

const paramsSchema = {
  "Circular finder pattern": {
    type: "boolean",
    default: true,
  },
  "Circular alignment pattern": {
    type: "boolean",
    default: true,
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

function renderCanvas(
  qr: OutputQr,
  params: Params<typeof paramsSchema>,
  ctx: CanvasRenderingContext2D
) {
  const pixelSize = 10;
  const margin = 2;
  const matrixWidth = qr.version * 4 + 17;
  const canvasSize = (matrixWidth + 2 * margin) * pixelSize;
  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const gradient = ctx.createRadialGradient(
    ctx.canvas.width / 2,
    ctx.canvas.height / 2,
    2 * pixelSize,
    ctx.canvas.width / 2,
    ctx.canvas.height / 2,
    20 * pixelSize
  );

  gradient.addColorStop(0, "red");
  gradient.addColorStop(1, "blue");

  ctx.fillStyle = gradient;

  const radius = pixelSize / 2;

  const finderPos = [
    [margin, margin],
    [margin + matrixWidth - 7, margin],
    [margin, margin + matrixWidth - 7],
  ];

  if (params["Circular finder pattern"]) {
    for (const [x, y] of finderPos) {
      ctx.beginPath();
      ctx.arc(
        (x + 3.5) * pixelSize,
        (y + 3.5) * pixelSize,
        3.5 * pixelSize,
        0,
        2 * Math.PI
      );
      ctx.fill();

      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.beginPath();
      ctx.arc(
        (x + 3.5) * pixelSize,
        (y + 3.5) * pixelSize,
        2.5 * pixelSize,
        0,
        2 * Math.PI
      );
      ctx.fill();

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        (x + 3.5) * pixelSize,
        (y + 3.5) * pixelSize,
        1.5 * pixelSize,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  const xMid = matrixWidth / 2;
  const yMid = matrixWidth / 2;
  const maxDist = Math.sqrt(xMid * xMid + yMid * yMid);

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];

      if (module & 1) {
        if (params["Circular finder pattern"] && module === Module.FinderON)
          continue;
        if (
          params["Circular alignment pattern"] &&
          module === Module.AlignmentON
        ) {
          // Find top left corner of alignment square
          if (
            qr.matrix[(y - 1) * matrixWidth + x] !== Module.AlignmentON &&
            qr.matrix[y * matrixWidth + x - 1] !== Module.AlignmentON &&
            qr.matrix[y * matrixWidth + x + 1] === Module.AlignmentON
          ) {
            const xPos = x + 2.5 + margin;
            const yPos = y + 2.5 + margin;

            ctx.beginPath();
            ctx.arc(
              xPos * pixelSize,
              yPos * pixelSize,
              2.5 * pixelSize,
              0,
              2 * Math.PI
            );
            ctx.fill();

            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.arc(
              xPos * pixelSize,
              yPos * pixelSize,
              1.5 * pixelSize,
              0,
              2 * Math.PI
            );
            ctx.fill();

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
              xPos * pixelSize,
              yPos * pixelSize,
              0.5 * pixelSize,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
          continue;
        }

        const xCenter = (x + margin) * pixelSize + radius;
        const yCenter = (y + margin) * pixelSize + radius;

        const xDist = Math.abs(xMid - x);
        const yDist = Math.abs(yMid - y);
        const scale =
          (Math.sqrt(xDist * xDist + yDist * yDist) / maxDist) * 0.7 + 0.5;

        ctx.beginPath();
        ctx.arc(xCenter, yCenter, radius * scale, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}

const code = `export const paramsSchema = ${objString(paramsSchema)};

const Module = ${objString(Module)};

export function renderCanvas(qr, params, ctx) {
  const pixelSize = 10;
  const margin = 2;
  const matrixWidth = qr.version * 4 + 17;
  const canvasSize = (matrixWidth + 2 * margin) * pixelSize;
  ctx.canvas.width = canvasSize;
  ctx.canvas.height = canvasSize;

  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  const gradient = ctx.createRadialGradient(
    ctx.canvas.width / 2,
    ctx.canvas.height / 2,
    2 * pixelSize,
    ctx.canvas.width / 2,
    ctx.canvas.height / 2,
    20 * pixelSize
  );

  gradient.addColorStop(0, "red");
  gradient.addColorStop(1, "blue");

  ctx.fillStyle = gradient;

  const radius = pixelSize / 2;

  const finderPos = [
    [margin, margin],
    [margin + matrixWidth - 7, margin],
    [margin, margin + matrixWidth - 7],
  ];

  if (params["Circular finder pattern"]) {
    for (const [x, y] of finderPos) {
      ctx.beginPath();
      ctx.arc(
        (x + 3.5) * pixelSize,
        (y + 3.5) * pixelSize,
        3.5 * pixelSize,
        0,
        2 * Math.PI
      );
      ctx.fill();

      ctx.fillStyle = "rgb(255, 255, 255)";
      ctx.beginPath();
      ctx.arc(
        (x + 3.5) * pixelSize,
        (y + 3.5) * pixelSize,
        2.5 * pixelSize,
        0,
        2 * Math.PI
      );
      ctx.fill();

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        (x + 3.5) * pixelSize,
        (y + 3.5) * pixelSize,
        1.5 * pixelSize,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }
  }

  const xMid = matrixWidth / 2;
  const yMid = matrixWidth / 2;
  const maxDist = Math.sqrt(xMid * xMid + yMid * yMid);

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];

      if (module & 1) {
        if (params["Circular finder pattern"] && module === Module.FinderON)
          continue;
        if (
          params["Circular alignment pattern"] &&
          module === Module.AlignmentON
        ) {
          // Find top left corner of alignment square
          if (
            qr.matrix[(y - 1) * matrixWidth + x] !== Module.AlignmentON &&
            qr.matrix[y * matrixWidth + x - 1] !== Module.AlignmentON &&
            qr.matrix[y * matrixWidth + x + 1] === Module.AlignmentON
          ) {
            const xPos = x + 2.5 + margin;
            const yPos = y + 2.5 + margin;

            ctx.beginPath();
            ctx.arc(
              xPos * pixelSize,
              yPos * pixelSize,
              2.5 * pixelSize,
              0,
              2 * Math.PI
            );
            ctx.fill();

            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.beginPath();
            ctx.arc(
              xPos * pixelSize,
              yPos * pixelSize,
              1.5 * pixelSize,
              0,
              2 * Math.PI
            );
            ctx.fill();

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
              xPos * pixelSize,
              yPos * pixelSize,
              0.5 * pixelSize,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }
          continue;
        }

        const xCenter = (x + margin) * pixelSize + radius;
        const yCenter = (y + margin) * pixelSize + radius;

        const xDist = Math.abs(xMid - x);
        const yDist = Math.abs(yMid - y);
        const scale =
          (Math.sqrt(xDist * xDist + yDist * yDist) / maxDist) * 0.7 + 0.5;

        ctx.beginPath();
        ctx.arc(xCenter, yCenter, radius * scale, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}
`;

export default {
  paramsSchema,
  renderSVG: undefined,
  renderCanvas,
  code,
};
