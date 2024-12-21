// Based on QRBTF's A1P style
// https://github.com/CPunisher/react-qrbtf/blob/master/src/components/QRNormal.tsx
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
  Foreground: {
    type: "color",
    default: "#000000",
  },
  "Finder pattern": {
    type: "select",
    options: ["Atom", "Planet"],
  },
  Particles: {
    type: "boolean",
    default: true,
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
  const range = (min, max) =>
    Math.trunc(100 * (rand() * (max - min) + min)) / 100;

  const rowLen = qr.version * 4 + 17;
  const margin = params["Margin"];
  const bg = params["Background"];
  const fg = params["Foreground"];

  const size = rowLen + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  for (const [x, y] of [
    [0, 0],
    [rowLen - 7, 0],
    [0, rowLen - 7],
  ]) {
    svg += `<g fill="${fg}">`;
    svg += `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5"/>`;
    svg += `<circle cx="${x + 3.5}" cy="${y + 0.5}" r="0.5"/>`;
    svg += `<circle cx="${x + 0.5}" cy="${y + 3.5}" r="0.5"/>`;
    svg += `<circle cx="${x + 6.5}" cy="${y + 3.5}" r="0.5"/>`;
    svg += `<circle cx="${x + 3.5}" cy="${y + 6.5}" r="0.5"/>`;

    switch (params["Finder pattern"]) {
      case "Atom":
        let r1 = 0.98;
        let r2 = 1.5;

        const a = 0.87 * r2;
        const b = 0.5 * r2;
        svg += `<path fill="none" stroke-width="0.1" stroke="${fg}" d="`;
        svg += `M${x + 3.5 + 3 * a},${y + 3.5 - 3 * b}a${r1},${r2} 60,0,1 ${-6 * a},${6 * b}a${r1},${r2} 60,0,1 ${6 * a},${-6 * b}`;
        svg += `M${x + 3.5 + 3 * a},${y + 3.5 + 3 * b}a${r2},${r1} 30,0,1 ${-6 * a},${-6 * b}a${r2},${r1} 30,0,1 ${6 * a},${6 * b}`;

        svg += `M${x + 3.5},${y + 3.5 - 3 * r2}a${r1},${r2} 0,0,1 0,${6 * r2}a${r1},${r2} 0,0,1 0,${-6 * r2}`;
        break;

      case "Planet":
        svg += `<path fill="none" stroke-width="0.1" stroke="${fg}" stroke-dasharray="0.5 0.65" d="`;
        svg += `M${x + 3.5},${y + 0.5}a3,3 0,0,1 0,6a3,3 0,0,1 0-6`;
        break;
    }
    svg += `"/></g>`;
  }

  let linesLayer = `<g stroke="${fg}"><path fill="none" stroke-width="0.1" d="`;
  let dotsLayer = `<g fill="${fg}">`;

  function on(x, y) {
    return (qr.matrix[y * rowLen + x] & Module.ON) !== 0;
  }

  const visitArray = Array.from({ length: rowLen * rowLen }).fill(false);

  function visited(x, y) {
    return visitArray[y * rowLen + x];
  }
  function visitCenter(x, y) {
    visitArray[y * rowLen + x] = true;
    dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${range(0.3, 0.5)}"/>`;
  }
  function visit(x, y) {
    visitArray[y * rowLen + x] = true;
    dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.2"/>`;
  }

  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      const module = qr.matrix[y * rowLen + x];
      if (module & Module.FINDER) continue;

      if (params["Particles"] && y < rowLen - 2 && x < rowLen - 2) {
        let xCross = false;
        let tCross = false;

        let a = range(-10, 10);
        if (
          on(x, y) &&
          !visited(x, y) &&
          on(x + 2, y) &&
          !visited(x + 2, y) &&
          on(x + 1, y + 1) &&
          !visited(x + 1, y + 1) &&
          on(x, y + 2) &&
          !visited(x, y + 2) &&
          on(x + 2, y + 2) &&
          !visited(x + 2, y + 2)
        ) {
          linesLayer += `M${x + 0.5},${y + 0.5}a1.4,.35 ${45 + a},0,1 2,2a1.4,.35 ${45 + a},0,1 -2,-2`;
          linesLayer += `M${x + 2.5},${y + 0.5}a.35,1.4 ${45 + a},0,1 -2,2a.35,1.4 ${45 + a},0,1 2,-2`;
          xCross = true;
        }
        if (
          on(x + 1, y) &&
          !visited(x + 1, y) &&
          on(x, y + 1) &&
          !visited(x, y + 1) &&
          on(x + 1, y + 1) &&
          !visited(x + 1, y + 1) &&
          on(x + 2, y + 1) &&
          !visited(x + 2, y + 1) &&
          on(x + 1, y + 2) &&
          !visited(x + 1, y + 2)
        ) {
          linesLayer += `M${x},${y + 1.55}a1,.35 ${a},0,1 3,0a1,.35 ${a},0,1 -3,0`;
          linesLayer += `M${x + 1.5},${y}a.35,1 ${a},0,1 0,3a.35,1 ${a},0,1 0,-3`;
          tCross = true;
        }
        if (xCross) {
          visit(x, y);
          visit(x + 2, y);
          visitCenter(x + 1, y + 1);
          visit(x, y + 2);
          visit(x + 2, y + 2);
        }
        if (tCross) {
          visit(x + 1, y);
          visit(x, y + 1);
          visitCenter(x + 1, y + 1);
          visit(x + 2, y + 1);
          visit(x + 1, y + 2);
        }
      }

      if (!visited(x, y) && on(x, y)) {
        dotsLayer += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${range(0.3, 0.5)}"/>`;
      }
    }
  }

  linesLayer += `"/></g>`;
  svg += linesLayer;
  dotsLayer += `</g>`;
  svg += dotsLayer;
  svg += `</svg>`;

  return svg;
}
