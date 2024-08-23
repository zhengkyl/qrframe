export const Circle = `export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 20,
    step: 0.1,
    default: 5,
  },
  "Radius offset": {
    type: "number",
    min: -10,
    max: 10,
    default: 0,
  },
  Foreground: {
    type: "Color",
    default: "#000000",
  },
  Background: {
    type: "Color",
    default: "#ffffff",
  },
  "Finder pattern": {
    type: "Select",
    options: ["Default", "Circle", "Square"],
  },
  "Alignment pattern": {
    type: "Select",
    options: ["Default", "Circle", "Square"],
  },
  "Scale direction": {
    type: "Select",
    options: ["None", "Center", "Edge"],
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
  const matrixWidth = qr.version * 4 + 17;
  const margin = params["Margin"];
  const fg = params["Foreground"];
  const bg = params["Background"];
  const rOffset = params["Radius offset"];
  const rand = splitmix32(params["Seed"]);

  const size = matrixWidth + 2 * margin;

  let svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="\${-margin} \${-margin} \${size} \${size}">\`;
  svg += \`<rect x="\${-margin}" y="\${-margin}" width="\${size}" height="\${size}" fill="\${bg}"/>\`;

  if (params["Finder pattern"] !== "Default") {
    for (const [x, y] of [
      [0, 0],
      [matrixWidth - 7, 0],
      [0, matrixWidth - 7],
    ]) {
      if (params["Finder pattern"] === "Circle") {
        svg += \`<circle cx="\${x + 3.5}" cy="\${y + 3.5}" r="3" fill="none" stroke="\${fg}" stroke-width="1"/>\`;
        svg += \`<circle cx="\${x + 3.5}" cy="\${y + 3.5}" r="1.5" fill="\${fg}"/>\`;
      } else {
        svg += \`<path d="M\${x},\${y}h7v7h-7zM\${x + 1},\${y + 1}v5h5v-5zM\${x + 2},\${y + 2}h3v3h-3z"/>\`;
      }
    }
  }
  svg += \`<path fill="\${fg}" d="\`;

  const maxDist = Math.sqrt(2) * (matrixWidth / 2);

  // nearest odd number
  let diameter = Math.round(Math.sqrt(2) * matrixWidth) + 2 * rOffset;
  if (!(diameter & 1)) diameter += 1;

  const overflow = (diameter - matrixWidth) / 2;
  for (let y = -overflow; y < diameter - overflow; y++) {
    for (let x = -overflow; x < diameter - overflow; x++) {
      // Quiet zone around qr

      const xRange1 = x >= -1 && x < 8;
      const yRange1 = y >= -1 && y < 8;
      const yRange2 = y > matrixWidth - 9 && y <= matrixWidth;
      const xRange2 = x > matrixWidth - 9 && x <= matrixWidth;
      if (
        (x === -1 && (yRange1 || yRange2)) ||
        (y === -1 && (xRange1 || xRange2)) ||
        (x === matrixWidth && yRange1) ||
        (y === matrixWidth && xRange1)
      ) {
        continue;
      }

      const dx = x - (matrixWidth - 1) / 2;
      const dy = y - (matrixWidth - 1) / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixWidth) {
        const module = qr.matrix[y * matrixWidth + x];
        if (!(module & 1)) continue;

        if (
          params["Finder pattern"] !== "Default" &&
          (module | 1) === Module.FinderON
        ) {
          continue;
        }
        if (
          params["Alignment pattern"] !== "Default" &&
          module === Module.AlignmentON
        ) {
          if (
            !(
              (qr.matrix[(y - 1) * matrixWidth + x] |
                qr.matrix[y * matrixWidth + x + 1] |
                qr.matrix[(y + 1) * matrixWidth + x]) &
              1
            )
          ) {
            if (params["Alignment pattern"] === "Circle") {
              svg += \`M\${x + 0.5},\${y - 2}a2.5,2.5 0,0,0 0,5a2.5,2.5 0,0,0 0,-5\`;
              svg += \`M\${x + 0.5},\${y - 1}a1.5,1.5 0,0,1 0,3a1.5,1.5 0,0,1 0,-3\`;
              svg += \`M\${x + 0.5},\${y}a.5,.5 0,0,0 0,1a.5,.5 0,0,0 0,-1\`;
            } else {
              svg += \`M\${x - 2},\${y - 2}h5v5h-5zM\${x - 1},\${y - 1}v3h3v-3zM\${x},\${y}h1v1h-1z\`;
            }
          }
          continue;
        }
      } else if (dist > diameter / 2) {
        continue;
      } else if (rand() > 0.5) {
        continue;
      }

      let ratio;
      switch (params["Scale direction"]) {
        case "Center":
          ratio = 1 - dist / maxDist + 0.8;
          break;
        case "Edge":
          ratio = dist / maxDist + 0.8;
          break;
        default:
          ratio = 1;
      }

      const radius = Math.trunc(100 * 0.5 * ratio) / 100;

      svg += \`M\${x + 0.5},\${y + 0.5 - radius}a\${radius},\${radius} 0,0,0 0,\${2 * radius}a\${radius},\${radius} 0,0,0 0,\${-2 * radius}\`;
    }
  }
  svg += \`"/></svg>\`;

  return svg;
}
`
