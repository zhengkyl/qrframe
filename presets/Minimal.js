import { Module } from "https://qrframe.kylezhe.ng/utils.js";

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
};

export function renderSVG(qr, params) {
  const rowLen = qr.version * 4 + 17;
  const unit = 10;
  const dataSize = params["Data pixel size"];
  const margin = params["Margin"] * unit;

  const fg = "#000";
  const bg = "#fff";

  const size = rowLen * unit + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  if (params["Background"]) {
    svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;
  }
  svg += `<path fill="${fg}" d="`;

  for (const [x, y] of [
    [0, 0],
    [rowLen - 7, 0],
    [0, rowLen - 7],
  ]) {
    svg += `M${(x + 3) * unit},${y * unit}h${unit}v${unit}h-${unit}z`;
    svg += `M${x * unit},${(y + 3) * unit}h${unit}v${unit}h-${unit}z`;
    svg += `M${(x + 6) * unit},${(y + 3) * unit}h${unit}v${unit}h-${unit}z`;
    svg += `M${(x + 3) * unit},${(y + 6) * unit}h${unit}v${unit}h-${unit}z`;

    svg += `M${(x + 2) * unit},${(y + 2) * unit}h${unit * 3}v${unit * 3}h-${unit * 3}z`;
  }

  const offset = (unit - dataSize) / 2;
  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      const module = qr.matrix[y * rowLen + x];

      if (module & Module.FINDER) {
        continue;
      }

      if (module & Module.ON) {
        const sx = x * unit + offset;
        const sy = y * unit + offset;
        svg += `M${sx},${sy}h${dataSize}v${dataSize}h-${dataSize}z`;
      }
    }
  }
  svg += `"/></svg>`;

  return svg;
}
