// Based on QRBTF's Line style
// https://github.com/CPunisher/react-qrbtf/blob/master/src/components/QRLine.tsx
import { Module, getSeededRand } from "https://qrframe.kylezhe.ng/utils.js";

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
  Dots: {
    type: "color",
    default: "#000000",
  },
  Lines: {
    type: "color",
    default: "#000000",
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
};

export function renderSVG(qr, params) {
  const rand = getSeededRand(params["Seed"]);
  const rangeStr = (min, max) => (rand() * (max - min) + min).toFixed(2);

  const rowLen = qr.version * 4 + 17;
  const margin = params["Margin"];
  const bg = params["Background"];
  const dots = params["Dots"];
  const lines = params["Lines"];

  const size = rowLen + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  let linesLayer = `<g stroke="${lines}">`;
  let dotsLayer = `<g fill="${dots}">`;

  function matrix(x, y) {
    return qr.matrix[y * rowLen + x];
  }

  const rightVisited = Array(rowLen * rowLen).fill(false);
  const leftVisited = Array(rowLen * rowLen).fill(false);
  function visited1(x, y) {
    return rightVisited[y * rowLen + x];
  }
  function visited2(x, y) {
    return leftVisited[y * rowLen + x];
  }
  function setVisited1(x, y) {
    rightVisited[y * rowLen + x] = true;
  }
  function setVisited2(x, y) {
    leftVisited[y * rowLen + x] = true;
  }

  for (const [x, y] of [
    [0, 0],
    [rowLen - 7, 0],
    [0, rowLen - 7],
  ]) {
    dotsLayer += `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5"/>`;

    dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.5"/>`;
    dotsLayer += `<circle cx="${x + 3.5}" cy="${y + 0.5}" r="0.5"/>`;
    dotsLayer += `<circle cx="${x + 6.5}" cy="${y + 0.5}" r="0.5"/>`;

    dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 3.5}" r="0.5"/>`;
    dotsLayer += `<circle cx="${x + 6.5}" cy="${y + 3.5}" r="0.5"/>`;

    dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 6.5}" r="0.5"/>`;
    dotsLayer += `<circle cx="${x + 3.5}" cy="${y + 6.5}" r="0.5"/>`;
    dotsLayer += `<circle cx="${x + 6.5}" cy="${y + 6.5}" r="0.5"/>`;

    linesLayer += `<line x1="${x + 0.5}" y1="${y + 0.5}" x2="${x + 6.5}" y2="${y + 6.5}" stroke-width="${rangeStr(0.3, 0.6)}"/>`;
    linesLayer += `<line x1="${x + 6.5}" y1="${y + 0.5}" x2="${x + 0.5}" y2="${y + 6.5}" stroke-width="${rangeStr(0.3, 0.6)}"/>`;
  }

  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      const module = matrix(x, y);
      if (module & Module.FINDER) continue;

      if (!(module & Module.ON)) continue;
      dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${rangeStr(0.2, 0.4)}"/>`;

      if (!visited1(x, y)) {
        let nx = x + 1;
        let ny = y + 1;
        while (
          nx < rowLen &&
          ny < rowLen &&
          matrix(nx, ny) & Module.ON &&
          !visited1(nx, ny)
        ) {
          setVisited1(nx, ny);
          nx++;
          ny++;
        }
        if (ny - y > 1) {
          linesLayer += `<line x1="${x + 0.5}" y1="${y + 0.5}" x2="${nx - 0.5}" y2="${ny - 0.5}" stroke-width="${rangeStr(0.1, 0.3)}"/>`;
        }
      }

      if (!visited2(x, y)) {
        let nx = x - 1;
        let ny = y + 1;
        while (
          nx >= 0 &&
          ny < rowLen &&
          matrix(nx, ny) & Module.ON &&
          !visited2(nx, ny)
        ) {
          setVisited2(nx, ny);
          nx--;
          ny++;
        }
        if (ny - y > 1) {
          linesLayer += `<line x1="${x + 0.5}" y1="${y + 0.5}" x2="${nx + 1.5}" y2="${ny - 0.5}" stroke-width="${rangeStr(0.1, 0.3)}"/>`;
        }
      }
    }
  }

  linesLayer += `</g>`;
  svg += linesLayer;
  dotsLayer += `</g>`;
  svg += dotsLayer;
  svg += `</svg>`;

  return svg;
}
