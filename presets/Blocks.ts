import type { Params, RawParamsSchema } from "~/lib/params";
import type { OutputQr } from "~/lib/QrContext";

// Based on QRBTF's DSJ style
// https://github.com/CPunisher/react-qrbtf/blob/master/src/components/QRDsj.tsx
export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 2,
  },
  Background: {
    type: "Color",
    default: "#ffffff",
  },
  Finder: {
    type: "Color",
    default: "#131d87",
  },
  Horizontal: {
    type: "Color",
    default: "#dc9c07",
  },
  Vertical: {
    type: "Color",
    default: "#d21313",
  },
  Cross: {
    type: "Color",
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

  const size = matrixWidth + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  let topLayer = `<g>`;

  function matrix(x: number, y: number) {
    return qr.matrix[y * matrixWidth + x];
  }

  const visitedMatrix = Array(matrixWidth * matrixWidth).fill(false);
  function visited(x: number, y: number) {
    return visitedMatrix[y * matrixWidth + x];
  }
  function setVisited(x: number, y: number) {
    visitedMatrix[y * matrixWidth + x] = true;
  }

  for (const [x, y] of [
    [0, 0],
    [matrixWidth - 7, 0],
    [0, matrixWidth - 7],
  ]) {
    svg += `<rect x="${x + 2}" y="${y}" width="3" height="1" fill="${fc}"/>`;
    svg += `<rect x="${x + 2}" y="${
      y + 2
    }" width="3" height="3" fill="${fc}"/>`;
    svg += `<rect x="${x}" y="${y + 2}" width="1" height="3" fill="${fc}"/>`;
    svg += `<rect x="${x + 6}" y="${
      y + 2
    }" width="1" height="3" fill="${fc}"/>`;
    svg += `<rect x="${x + 2}" y="${
      y + 6
    }" width="3" height="1" fill="${fc}"/>`;
  }

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = matrix(x, y);
      if ((module | 1) === Module.FinderON) continue;
      if (!(module & 1)) continue;
      if (visited(x, y)) continue;
      setVisited(x, y);

      if (
        y < matrixWidth - 2 &&
        x < matrixWidth - 2 &&
        matrix(x + 2, y) &
          matrix(x, y + 2) &
          matrix(x + 1, y + 1) &
          matrix(x + 2, y + 2) &
          1
      ) {
        if (
          !visited(x + 1, y) &&
          !visited(x + 2, y) &&
          !visited(x + 1, y + 1) &&
          !visited(x + 2, y + 1)
        ) {
          topLayer += `<g stroke-width="${ct}" stroke="${cc}">`;
          topLayer += `<line x1="${x + co}" y1="${y + co}" x2="${
            x + 3 - co
          }" y2="${y + 3 - co}"/>`;
          topLayer += `<line x1="${x + 3 - co}" y1="${y + co}" x2="${
            x + co
          }" y2="${y + 3 - co}"/>`;
          topLayer += `</g>`;

          setVisited(x + 2, y);
          setVisited(x, y + 2);
          setVisited(x + 1, y + 1);
          setVisited(x + 2, y + 2);
          continue;
        }
      }
      if (
        y < matrixWidth - 1 &&
        x < matrixWidth - 1 &&
        matrix(x + 1, y) & matrix(x, y + 1) & matrix(x + 1, y + 1) & 1
      ) {
        if (!visited(x + 1, y) && !visited(x + 1, y + 1)) {
          topLayer += `<g stroke-width="${ct}" stroke="${cc}">`;
          topLayer += `<line x1="${x + co}" y1="${y + co}" x2="${
            x + 2 - co
          }" y2="${y + 2 - co}"/>`;
          topLayer += `<line x1="${x + 2 - co}" y1="${y + co}" x2="${
            x + co
          }" y2="${y + 2 - co}"/>`;
          topLayer += `</g>`;

          setVisited(x + 1, y);
          setVisited(x, y + 1);
          setVisited(x + 1, y + 1);
          continue;
        }
      }

      let ny = y + 1;
      while (ny < matrixWidth && matrix(x, ny) & 1 && !visited(x, ny)) {
        ny++;
      }
      if (ny - y > 2) {
        svg += `<rect x="${x + vo}" y="${y + vo}" width="${vt}" height="${
          ny - y - 1 - 2 * vo
        }" fill="${vc}"/>`;
        svg += `<rect x="${x + vo}" y="${ny - 1 + vo}" width="${vt}" height="${
          1 - 2 * vo
        }" fill="${vc}"/>`;
        for (let i = y + 1; i < ny; i++) {
          setVisited(x, i);
        }
        continue;
      }

      let nx = x + 1;
      while (nx < matrixWidth && matrix(nx, y) & 1 && !visited(nx, y)) {
        setVisited(nx, y);
        nx++;
      }
      svg += `<rect x="${x + ho}" y="${y + ho}" width="${
        nx - x - 2 * ho
      }" height="${ht}" fill="${hc}"/>`;
    }
  }

  topLayer += `</g>`;
  svg += topLayer;
  svg += `</svg>`;

  return svg;
}
