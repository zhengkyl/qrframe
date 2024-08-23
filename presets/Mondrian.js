export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  Dark1: {
    type: "Color",
    default: "#ad1010",
  },
  Dark2: {
    type: "Color",
    default: "#172fce",
  },
  Dark3: {
    type: "Color",
    default: "#b39906",
  },
  Light: {
    type: "Color",
    default: "#ffffff",
  },
  Lines: {
    type: "Color",
    default: "#000000",
  },
  "Line thickness": {
    type: "number",
    min: 0,
    max: 10,
    default: 3,
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
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
  const margin = params["Margin"];

  const unit = 16;
  const matrixWidth = qr.version * 4 + 17 + 2 * margin;
  const size = matrixWidth * unit;

  const gap = params["Line thickness"];
  const offset = gap / 2;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="${params["Lines"]}"/>`;

  let lightLayer = `<path fill="${params["Light"]}" d="`;
  const darkLayers = [
    `<path fill="${params["Dark1"]}" d="`,
    `<path fill="${params["Dark2"]}" d="`,
    `<path fill="${params["Dark3"]}" d="`,
    `<path fill="${params["Dark4"]}" d="`,
  ];

  const visited = Array.from({ length: matrixWidth * matrixWidth }).fill(false);
  const matrix = Array.from({ length: matrixWidth * matrixWidth }).fill(0);
  const qrWidth = qr.version * 4 + 17;

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (
        y >= margin &&
        y < matrixWidth - margin &&
        x >= margin &&
        x < matrixWidth - margin
      ) {
        matrix[y * matrixWidth + x] =
          qr.matrix[(y - margin) * qrWidth + (x - margin)];
      }
    }
  }

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = matrix[y * matrixWidth + x];
      if (visited[y * matrixWidth + x]) continue;

      let layer = "";
      const on = module & 1;
      visited[y * matrixWidth + x] = true;

      let width = 1;
      let height = 1;

      while (
        x + width < matrixWidth &&
        (matrix[y * matrixWidth + x + width] & 1) === on &&
        !visited[y * matrixWidth + x + width]
      ) {
        visited[y * matrixWidth + x + width] = true;
        width++;
      }

      outer: while (y + height < matrixWidth) {
        for (let i = 0; i < width; i++) {
          if ((matrix[(y + height) * matrixWidth + x + i] & 1) !== on) {
            break outer;
          }
        }

        for (let i = 0; i < width; i++) {
          visited[(y + height) * matrixWidth + x + i] = true;
        }
        height++;
      }

      const hSide = width * unit - gap;
      const vSide = height * unit - gap;
      layer += `M${x * unit + offset},${y * unit + offset}h${hSide}v${vSide}h-${hSide}z`;

      if (on) {
        darkLayers[Math.floor(rand() * 3)] += layer;
      } else {
        lightLayer += layer;
      }
    }
  }
  svg += darkLayers[0] + `"/>`;
  svg += darkLayers[1] + `"/>`;
  svg += darkLayers[2] + `"/>`;
  svg += lightLayer + `"/>`;
  svg += `</svg>`;

  return svg;
}
