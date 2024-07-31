import type { RawParamsSchema, Params } from "../src/lib/params";
import type { OutputQr } from "../src/lib/QrContext";

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
  const margin = params["Margin"];
  const dataSize = params["Data pixel size"];
  const moduleSize = 10;
  const fg = "#000";
  const bg = "#fff";

  const finderPos = [
    [margin, margin],
    [matrixWidth + margin - 7, margin],
    [margin, matrixWidth + margin - 7],
  ];

  const svgSize = (matrixWidth + 2 * margin) * moduleSize;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}">`;
  if (params["Background"]) {
    svg += `<rect width="${svgSize}" height="${svgSize}" fill="${bg}"/>`;
  }
  svg += `<path fill="${fg}" d="`;

  for (const [x, y] of finderPos) {
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
        const sx = (x + margin) * moduleSize + offset;
        const sy = (y + margin) * moduleSize + offset;
        svg += `M${sx},${sy}h${dataSize}v${dataSize}h-${dataSize}z`;
      }
    }
  }
  svg += `"/></svg>`;

  return svg;
}
