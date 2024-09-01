export const Alien = `// Based on QRBTF's Line style
// https://github.com/CPunisher/react-qrbtf/blob/master/src/components/QRLine.tsx
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
  const rand = splitmix32(params["Seed"]);
  const rangeStr = (min, max) => (rand() * (max - min) + min).toFixed(2);

  const matrixWidth = qr.version * 4 + 17;
  const margin = params["Margin"];
  const bg = params["Background"];
  const dots = params["Dots"];
  const lines = params["Lines"];

  const size = matrixWidth + 2 * margin;
  let svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="\${-margin} \${-margin} \${size} \${size}">\`;
  svg += \`<rect x="\${-margin}" y="\${-margin}" width="\${size}" height="\${size}" fill="\${bg}"/>\`;

  let linesLayer = \`<g stroke="\${lines}">\`;
  let dotsLayer = \`<g fill="\${dots}">\`;

  function matrix(x, y) {
    return qr.matrix[y * matrixWidth + x];
  }

  const rightVisited = Array(matrixWidth * matrixWidth).fill(false);
  const leftVisited = Array(matrixWidth * matrixWidth).fill(false);
  function visited1(x, y) {
    return rightVisited[y * matrixWidth + x];
  }
  function visited2(x, y) {
    return leftVisited[y * matrixWidth + x];
  }
  function setVisited1(x, y) {
    rightVisited[y * matrixWidth + x] = true;
  }
  function setVisited2(x, y) {
    leftVisited[y * matrixWidth + x] = true;
  }

  for (const [x, y] of [
    [0, 0],
    [matrixWidth - 7, 0],
    [0, matrixWidth - 7],
  ]) {
    dotsLayer += \`<circle cx="\${x + 3.5}" cy="\${y + 3.5}" r="1.5"/>\`;

    dotsLayer += \`<circle cx="\${x + 0.5}" cy="\${y + 0.5}" r="0.5"/>\`;
    dotsLayer += \`<circle cx="\${x + 3.5}" cy="\${y + 0.5}" r="0.5"/>\`;
    dotsLayer += \`<circle cx="\${x + 6.5}" cy="\${y + 0.5}" r="0.5"/>\`;

    dotsLayer += \`<circle cx="\${x + 0.5}" cy="\${y + 3.5}" r="0.5"/>\`;
    dotsLayer += \`<circle cx="\${x + 6.5}" cy="\${y + 3.5}" r="0.5"/>\`;

    dotsLayer += \`<circle cx="\${x + 0.5}" cy="\${y + 6.5}" r="0.5"/>\`;
    dotsLayer += \`<circle cx="\${x + 3.5}" cy="\${y + 6.5}" r="0.5"/>\`;
    dotsLayer += \`<circle cx="\${x + 6.5}" cy="\${y + 6.5}" r="0.5"/>\`;

    linesLayer += \`<line x1="\${x + 0.5}" y1="\${y + 0.5}" x2="\${x + 6.5}" y2="\${y + 6.5}" stroke-width="\${rangeStr(0.3, 0.6)}"/>\`;
    linesLayer += \`<line x1="\${x + 6.5}" y1="\${y + 0.5}" x2="\${x + 0.5}" y2="\${y + 6.5}" stroke-width="\${rangeStr(0.3, 0.6)}"/>\`;
  }

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = matrix(x, y);
      if ((module | 1) === Module.FinderON) continue;

      if (!(module & 1)) continue;
      dotsLayer += \`<circle cx="\${x + 0.5}" cy="\${y + 0.5}" r="\${rangeStr(0.2, 0.4)}"/>\`;

      if (!visited1(x, y)) {
        let nx = x + 1;
        let ny = y + 1;
        while (
          nx < matrixWidth &&
          ny < matrixWidth &&
          matrix(nx, ny) & 1 &&
          !visited1(nx, ny)
        ) {
          setVisited1(nx, ny);
          nx++;
          ny++;
        }
        if (ny - y > 1) {
          linesLayer += \`<line x1="\${x + 0.5}" y1="\${y + 0.5}" x2="\${nx - 0.5}" y2="\${ny - 0.5}" stroke-width="\${rangeStr(0.1, 0.3)}"/>\`;
        }
      }

      if (!visited2(x, y)) {
        let nx = x - 1;
        let ny = y + 1;
        while (
          nx >= 0 &&
          ny < matrixWidth &&
          matrix(nx, ny) & 1 &&
          !visited2(nx, ny)
        ) {
          setVisited2(nx, ny);
          nx--;
          ny++;
        }
        if (ny - y > 1) {
          linesLayer += \`<line x1="\${x + 0.5}" y1="\${y + 0.5}" x2="\${nx + 1.5}" y2="\${ny - 0.5}" stroke-width="\${rangeStr(0.1, 0.3)}"/>\`;
        }
      }
    }
  }

  linesLayer += \`</g>\`;
  svg += linesLayer;
  dotsLayer += \`</g>\`;
  svg += dotsLayer;
  svg += \`</svg>\`;

  return svg;
}
`
