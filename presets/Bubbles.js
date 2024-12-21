// Based on QRBTF's Bubble style
// https://github.com/CPunisher/react-qrbtf/blob/master/src/components/QRBubble.tsx
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
  Finder: {
    type: "color",
    default: "#141e92",
  },
  "Large circle": {
    type: "color",
    default: "#10a8e9",
  },
  "Medium circle": {
    type: "color",
    default: "#1aa8cc",
  },
  "Small circle": {
    type: "color",
    default: "#0f8bdd",
  },
  "Tiny circle": {
    type: "color",
    default: "#012c8f",
  },
  "Randomize circle size": {
    type: "boolean",
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

  const rangeStr = params["Randomize circle size"]
    ? (min, max) => (rand() * (max - min) + min).toFixed(2)
    : (min, max) => ((max - min) / 2 + min).toFixed(2);

  const rowLen = qr.version * 4 + 17;
  const margin = params["Margin"];
  const bg = params["Background"];

  const size = rowLen + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  let layer1 = `<g fill="none" stroke="${params["Large circle"]}" stroke-width="0.6">`;
  let layer2 = `<g fill="none" stroke="${params["Medium circle"]}" stroke-width="0.5">`;
  let layer3 = `<g fill="none" stroke="${params["Small circle"]}" stroke-width="0.4">`;
  let layer4 = `<g fill="${params["Tiny circle"]}">`;

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

  const fc = params["Finder"];
  for (const [x, y] of [
    [0, 0],
    [rowLen - 7, 0],
    [0, rowLen - 7],
  ]) {
    svg += `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="3" fill="none" stroke="${fc}" stroke-width="1"/>`;
    svg += `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5" fill="${fc}"/>`;
  }

  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      const module = matrix(x, y);
      if (module & Module.FINDER) continue;
      if (visited(x, y)) continue;

      if (
        y < rowLen - 2 &&
        x < rowLen - 2 &&
        matrix(x + 1, y) &
          matrix(x, y + 1) &
          matrix(x + 2, y + 1) &
          matrix(x + 1, y + 2) &
          1 &&
        !visited(x + 1, y) &&
        !visited(x + 2, y) &&
        !visited(x + 1, y + 1) &&
        !visited(x + 2, y + 1)
      ) {
        layer1 += `<circle cx="${x + 1.5}" cy="${y + 1.5}" r="${rangeStr(0.8, 1.2)}"/>`;

        setVisited(x + 1, y);
        setVisited(x, y + 1);
        setVisited(x + 2, y + 1);
        setVisited(x + 1, y + 2);
        continue;
      }
      if (!(module & Module.ON)) continue;
      setVisited(x, y);

      if (
        y < rowLen - 1 &&
        x < rowLen - 1 &&
        matrix(x + 1, y) &
          matrix(x, y + 1) &
          matrix(x + 1, y + 1) &
          Module.ON &&
        !visited(x + 1, y) &&
        !visited(x + 1, y + 1)
      ) {
        layer2 += `<circle cx="${x + 1}" cy="${y + 1}" r="${rangeStr(0.4, 0.6)}"/>`;
        setVisited(x + 1, y);
        setVisited(x, y + 1);
        setVisited(x + 1, y + 1);
        continue;
      }
      if (
        x < rowLen - 1 &&
        matrix(x + 1, y) & Module.ON &&
        !visited(x + 1, y)
      ) {
        layer3 += `<circle cx="${x + 1}" cy="${y + 0.5}" r="${rangeStr(0.4, 0.6)}"/>`;
        setVisited(x + 1, y);
        continue;
      }
      if (
        y < rowLen - 1 &&
        matrix(x, y + 1) & Module.ON &&
        !visited(x, y + 1)
      ) {
        layer3 += `<circle cx="${x + 0.5}" cy="${y + 1}" r="${rangeStr(0.3, 0.5)}"/>`;
        setVisited(x, y + 1);
        continue;
      }

      layer4 += `<circle cx="${x + 0.5}" cy="${y + 0.5}" r="${rangeStr(0.2, 0.4)}"/>`;
    }
  }

  layer1 += `</g>`;
  svg += layer1;
  layer2 += `</g>`;
  svg += layer2;
  layer3 += `</g>`;
  svg += layer3;
  layer4 += `</g>`;
  svg += layer4;

  svg += `</svg>`;

  return svg;
}
