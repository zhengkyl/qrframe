import type { Params, RawParamsSchema } from "~/lib/params";
import type { OutputQr } from "~/lib/QrContext";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  "Data pixel size": {
    type: "number",
    min: 1,
    max: 20,
    default: 3,
  },
  Background: {
    type: "boolean",
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

export function renderSVG(qr: OutputQr, params: Params<typeof paramsSchema>) {
  const matrixWidth = qr.version * 4 + 17;
  const moduleSize = 10;
  const dataSize = params["Data pixel size"];
  const margin = params["Margin"] * moduleSize;

  const fg = "#000";
  const bg = "#fff";

  const size = matrixWidth * moduleSize + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  if (params["Background"]) {
    svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;
  }
  svg += `<path fill="${fg}" d="`;

  for (const [x, y] of [
    [0, 0],
    [matrixWidth - 7, 0],
    [0, matrixWidth - 7],
  ]) {
    svg += `M${(x + 3) * moduleSize},${
      y * moduleSize
    }h${moduleSize}v${moduleSize}h-${moduleSize}z`;
    svg += `M${x * moduleSize},${
      (y + 3) * moduleSize
    }h${moduleSize}v${moduleSize}h-${moduleSize}z`;
    svg += `M${(x + 6) * moduleSize},${
      (y + 3) * moduleSize
    }h${moduleSize}v${moduleSize}h-${moduleSize}z`;
    svg += `M${(x + 3) * moduleSize},${
      (y + 6) * moduleSize
    }h${moduleSize}v${moduleSize}h-${moduleSize}z`;

    svg += `M${(x + 2) * moduleSize},${(y + 2) * moduleSize}h${
      moduleSize * 3
    }v${moduleSize * 3}h-${moduleSize * 3}z`;
  }

  const offset = (moduleSize - dataSize) / 2;
  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];

      if ((module | 1) === Module.FinderON) {
        continue;
      }

      if (module & 1) {
        const sx = x * moduleSize + offset;
        const sy = y * moduleSize + offset;
        svg += `M${sx},${sy}h${dataSize}v${dataSize}h-${dataSize}z`;
      }
    }
  }
  svg += `"/></svg>`;

  return svg;
}
