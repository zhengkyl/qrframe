export const Bubbles = `// Based on QRBTF's Bubble style
// https://github.com/CPunisher/react-qrbtf/blob/master/src/components/QRBubble.tsx
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
    default: "#141e92",
  },
  "Large circle": {
    type: "Color",
    default: "#10a8e9",
  },
  "Medium circle": {
    type: "Color",
    default: "#1aa8cc",
  },
  "Small circle": {
    type: "Color",
    default: "#0f8bdd",
  },
  "Tiny circle": {
    type: "Color",
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

function splitmix32(a) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

export function renderSVG(qr, params) {
  const seededRand = splitmix32(params["Seed"]);

  const rand = params["Randomize circle size"]
    ? (min, max) =>
        Math.trunc(100 * (seededRand() * (max - min) + min)) / 100
    : (min, max) => (max - min) / 2 + min;

  const matrixWidth = qr.version * 4 + 17;
  const margin = params["Margin"];
  const bg = params["Background"];

  const size = matrixWidth + 2 * margin;

  let svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${size} \${size}" fill="\${params["Tiny circle"]}">\`;
  svg += \`<rect width="\${size}" height="\${size}" fill="\${bg}"/>\`;

  let botLayer = \`<g fill="none" stroke="\${params["Large circle"]}" stroke-width="0.6">\`;
  let midLayer = \`<g fill="none" stroke="\${params["Medium circle"]}" stroke-width="0.5">\`;
  let topLayer = \`<g fill="none" stroke="\${params["Small circle"]}" stroke-width="0.4">\`;

  function matrix(x, y) {
    return qr.matrix[y * matrixWidth + x];
  }

  const visitedMatrix = Array(matrixWidth * matrixWidth).fill(false);
  function visited(x, y) {
    return visitedMatrix[y * matrixWidth + x];
  }
  function setVisited(x, y) {
    visitedMatrix[y * matrixWidth + x] = true;
  }

  const fc = params["Finder"];
  for (const [x, y] of [
    [margin, margin],
    [margin + matrixWidth - 7, margin],
    [margin, margin + matrixWidth - 7],
  ]) {
    svg += \`<circle cx="\${x + 3.5}" cy="\${
      y + 3.5
    }" r="3" fill="none" stroke="\${fc}" stroke-width="1"/>\`;
    svg += \`<circle cx="\${x + 3.5}" cy="\${y + 3.5}" r="1.5" fill="\${fc}"/>\`;
  }

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = matrix(x, y);
      if ((module | 1) === Module.FinderON) continue;
      if (visited(x, y)) continue;

      if (
        y < matrixWidth - 2 &&
        x < matrixWidth - 2 &&
        matrix(x + 1, y) &
          matrix(x, y + 1) &
          matrix(x + 2, y + 1) &
          matrix(x + 1, y + 2) &
          1
      ) {
        if (
          !visited(x + 1, y) &&
          !visited(x + 2, y) &&
          !visited(x + 1, y + 1) &&
          !visited(x + 2, y + 1)
        ) {
          botLayer += \`<circle cx="\${x + margin + 1.5}" cy="\${
            y + margin + 1.5
          }" r="\${rand(0.8, 1.2)}"/>\`;

          setVisited(x + 1, y);
          setVisited(x, y + 1);
          setVisited(x + 2, y + 1);
          setVisited(x + 1, y + 2);
          continue;
        }
      }
      if (!(module & 1)) continue;
      setVisited(x, y);

      if (
        y < matrixWidth - 1 &&
        x < matrixWidth - 1 &&
        matrix(x + 1, y) & matrix(x, y + 1) & matrix(x + 1, y + 1) & 1
      ) {
        if (!visited(x + 1, y) && !visited(x + 1, y + 1)) {
          midLayer += \`<circle cx="\${x + margin + 1}" cy="\${
            y + margin + 1
          }" r="\${rand(0.4, 0.6)}"/>\`;
          setVisited(x + 1, y);
          setVisited(x, y + 1);
          setVisited(x + 1, y + 1);
          continue;
        }
      }
      if (x < matrixWidth - 1 && matrix(x + 1, y) & 1 && !visited(x + 1, y)) {
        topLayer += \`<circle cx="\${x + margin + 1}" cy="\${
          y + margin + 0.5
        }" r="\${rand(0.4, 0.6)}"/>\`;
        setVisited(x + 1, y);
        continue;
      }
      if (y < matrixWidth - 1 && matrix(x, y + 1) & 1 && !visited(x, y + 1)) {
        topLayer += \`<circle cx="\${x + margin + 0.5}" cy="\${
          y + margin + 1
        }" r="\${rand(0.3, 0.5)}"/>\`;
        setVisited(x, y + 1);
        continue;
      }

      svg += \`<circle cx="\${x + margin + 0.5}" cy="\${
        y + margin + 0.5
      }" r="\${rand(0.2, 0.4)}"/>\`;
    }
  }

  botLayer += \`</g>\`;
  svg += botLayer;
  midLayer += \`</g>\`;
  svg += midLayer;
  topLayer += \`</g>\`;
  svg += topLayer;
  svg += \`</svg>\`;

  return svg;
}
`
