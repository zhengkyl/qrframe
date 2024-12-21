import { Module } from "https://qrframe.kylezhe.ng/utils.js";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 20,
    default: 10,
  },
  "Inner square": {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  "Outer square": {
    type: "number",
    min: 0,
    max: 10,
    default: 6,
  },
  Foreground: {
    type: "color",
    default: "#000000",
  },
  Background: {
    type: "color",
    default: "#ffffff",
  },
  Grout: {
    type: "color",
    default: "#b3b8fd",
  },
};

export function renderSVG(qr, params) {
  const unit = 16;
  const gap = 2;
  const offset = gap / 2;

  const margin = params["Margin"];
  const qrRowLen = qr.version * 4 + 17;
  const rowLen = qrRowLen + 2 * margin;

  const fg = params["Foreground"];
  const bg = params["Background"];
  const grout = params["Grout"];

  const newMatrix = Array.from({ length: rowLen * rowLen }).fill(0);

  const start = margin;
  const end = rowLen - 1 - margin;
  const inner = params["Inner square"];
  const outer = params["Outer square"];
  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      // outer square
      if (y === start - outer && x >= start - outer && x <= end + outer) {
        newMatrix[y * rowLen + x] = Module.ON;
      } else if (
        (x === start - outer || x === end + outer) &&
        y >= start - outer + 1 &&
        y <= end + outer - 1
      ) {
        newMatrix[y * rowLen + x] = Module.ON;
        newMatrix[y * rowLen + x] = Module.ON;
      } else if (y === end + outer && x >= start - outer && x <= end + outer) {
        newMatrix[y * rowLen + x] = Module.ON;
      }
      // inner square
      else if (y === start - inner && x >= start - inner && x <= end + inner) {
        newMatrix[y * rowLen + x] = Module.ON;
      } else if (
        (x === start - inner || x === end + inner) &&
        y >= start - inner + 1 &&
        y <= end + inner - 1
      ) {
        newMatrix[y * rowLen + x] = Module.ON;
        newMatrix[y * rowLen + x] = Module.ON;
      } else if (y === end + inner && x >= start - inner && x <= end + inner) {
        newMatrix[y * rowLen + x] = Module.ON;
      }
      // qr code w/ quiet zone
      else if (
        y >= margin - inner &&
        y < rowLen - margin + inner &&
        x >= margin - inner &&
        x < rowLen - margin + inner
      ) {
        if (
          y >= margin &&
          y < rowLen - margin &&
          x >= margin &&
          x < rowLen - margin
        ) {
          newMatrix[y * rowLen + x] =
            qr.matrix[(y - margin) * qrRowLen + x - margin];
        }
      }
      // between squares
      else if (
        y > start - outer &&
        y < end + outer &&
        x > start - outer &&
        x < end + outer
      ) {
        if ((x + y) & 1) {
          newMatrix[y * rowLen + x] = Module.ON;
        }
        // outside squares
      } else {
        if (x % 4 && y % 4) {
          if ((x % 8 < 4 && y % 8 < 4) || (x % 8 > 4 && y % 8 > 4)) {
            newMatrix[y * rowLen + x] = Module.ON;
          }
        } else {
          newMatrix[y * rowLen + x] = Module.ON;
        }
      }
    }
  }

  const size = rowLen * unit;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="${grout}"/>`;
  svg += `<path fill="${fg}" d="`;
  let layer = `<path fill="${bg}" d="`;

  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      const module = newMatrix[y * rowLen + x];
      let tiles;
      if (module & Module.ON) {
        if (module & Module.FINDER) {
          svg += `M${x * unit},${y * unit}h${unit}v${unit}h-${unit}z`;
          continue;
        }
        tiles = 1;
      } else {
        tiles = 2;
      }

      const tile = (unit - tiles * gap) / tiles;
      for (let dy = 0; dy < tiles; dy++) {
        const ny = y * unit + offset + dy * (tile + gap);
        for (let dx = 0; dx < tiles; dx++) {
          const nx = x * unit + offset + dx * (tile + gap);
          if (module & Module.ON) {
            svg += `M${nx},${ny}h${tile}v${tile}h-${tile}z`;
          } else {
            layer += `M${nx},${ny}h${tile}v${tile}h-${tile}z`;
          }
        }
      }
    }
  }
  svg += `"/>`;
  svg += layer + `"/>`;
  svg += `</svg>`;

  return svg;
}
