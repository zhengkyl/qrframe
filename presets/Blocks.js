// Based on QRBTF's DSJ style
// https://github.com/CPunisher/react-qrbtf/blob/master/src/components/QRDsj.tsx
import { Module } from "https://qrframe.kylezhe.ng/utils.js";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 2,
  },
  Background: {
    type: "color",
    default: "#ffffff",
  },
  Finder: {
    type: "color",
    default: "#131d87",
  },
  Horizontal: {
    type: "color",
    default: "#dc9c07",
  },
  Vertical: {
    type: "color",
    default: "#d21313",
  },
  Cross: {
    type: "color",
    default: "#131d87",
  },
  "Horizontal thickness": {
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.7,
  },
  "Vertical thickness": {
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.7,
  },
  "Cross thickness": {
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.7,
  },
};

export function renderSVG(qr, params) {
  const rowLen = qr.version * 4 + 17;
  const margin = params["Margin"];
  const bg = params["Background"];
  const fc = params["Finder"];

  const hc = params["Horizontal"];
  const ht = params["Horizontal thickness"];
  const ho = (1 - ht) / 2;

  const vc = params["Vertical"];
  const vt = params["Vertical thickness"];
  const vo = (1 - vt) / 2;

  const cc = params["Cross"];
  const ct = params["Cross thickness"];
  const co = ct / Math.sqrt(8); // offset

  const size = rowLen + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  let crossLayer = `<g stroke-width="${ct}" stroke="${cc}">`;
  let vLayer = `<g fill="${vc}">`;
  let hLayer = `<g fill="${hc}">`;

  function matrix(x, y) {
    return qr.matrix[y * rowLen + x];
  }

  const visitedMatrix = Array(rowLen * rowLen).fill(false);
  function visited(x, y) {
    return visitedMatrix[y * rowLen + x];
  }
  function setVisited(x, y) {
    visitedMatrix[y * rowLen + x] = true;
  }

  svg += `<g fill="${fc}">`;
  for (const [x, y] of [
    [0, 0],
    [rowLen - 7, 0],
    [0, rowLen - 7],
  ]) {
    svg += `<rect x="${x + 2}" y="${y}" width="3" height="1"/>`;
    svg += `<rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
    svg += `<rect x="${x}" y="${y + 2}" width="1" height="3"/>`;
    svg += `<rect x="${x + 6}" y="${y + 2}" width="1" height="3"/>`;
    svg += `<rect x="${x + 2}" y="${y + 6}" width="3" height="1"/>`;
  }
  svg += `</g>`;

  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      const module = matrix(x, y);
      if (module & Module.FINDER) continue;
      if (!(module & Module.ON)) continue;
      if (visited(x, y)) continue;
      setVisited(x, y);

      if (
        y < rowLen - 2 &&
        x < rowLen - 2 &&
        matrix(x + 2, y) &
          matrix(x, y + 2) &
          matrix(x + 1, y + 1) &
          matrix(x + 2, y + 2) &
          1
      ) {
        if (
          !visited(x + 1, y) &&
          !visited(x + 2, y) &&
          !visited(x, y + 1) &&
          !visited(x + 2, y + 1)
        ) {
          crossLayer += `<g>`;
          crossLayer += `<line x1="${x + co}" y1="${y + co}" x2="${x + 3 - co}" y2="${y + 3 - co}"/>`;
          crossLayer += `<line x1="${x + 3 - co}" y1="${y + co}" x2="${x + co}" y2="${y + 3 - co}"/>`;
          crossLayer += `</g>`;

          setVisited(x + 2, y);
          setVisited(x, y + 2);
          setVisited(x + 1, y + 1);
          setVisited(x + 2, y + 2);
          continue;
        }
      }
      if (
        y < rowLen - 1 &&
        x < rowLen - 1 &&
        matrix(x + 1, y) & matrix(x, y + 1) & matrix(x + 1, y + 1) & Module.ON
      ) {
        if (
          !visited(x + 1, y) &&
          !visited(x + 1, y + 1) &&
          !visited(x, y + 1)
        ) {
          crossLayer += `<g>`;
          crossLayer += `<line x1="${x + co}" y1="${y + co}" x2="${x + 2 - co}" y2="${y + 2 - co}"/>`;
          crossLayer += `<line x1="${x + 2 - co}" y1="${y + co}" x2="${x + co}" y2="${y + 2 - co}"/>`;
          crossLayer += `</g>`;

          setVisited(x + 1, y);
          setVisited(x, y + 1);
          setVisited(x + 1, y + 1);
          continue;
        }
      }

      let ny = y + 1;
      while (ny < rowLen && matrix(x, ny) & Module.ON && !visited(x, ny)) {
        ny++;
      }
      if (ny - y > 2) {
        vLayer += `<rect x="${x + vo}" y="${y + vo}" width="${vt}" height="${ny - y - 1 - 2 * vo}" fill="${vc}"/>`;
        vLayer += `<rect x="${x + vo}" y="${ny - 1 + vo}" width="${vt}" height="${1 - 2 * vo}" fill="${vc}"/>`;
        for (let i = y + 1; i < ny; i++) {
          setVisited(x, i);
        }
        continue;
      }

      let nx = x + 1;
      while (nx < rowLen && matrix(nx, y) & Module.ON && !visited(nx, y)) {
        setVisited(nx, y);
        nx++;
      }
      hLayer += `<rect x="${x + ho}" y="${y + ho}" width="${nx - x - 2 * ho}" height="${ht}" fill="${hc}"/>`;
    }
  }

  vLayer += `</g>`;
  svg += vLayer;
  hLayer += `</g>`;
  svg += hLayer;
  crossLayer += `</g>`;
  svg += crossLayer;

  svg += `</svg>`;

  return svg;
}
