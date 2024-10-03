import { Module, getSeededRand } from "https://qrframe.kylezhe.ng/utils.js";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  Foreground: {
    type: "color",
    default: "#000000",
  },
  Background: {
    type: "color",
    default: "#fcb9ff",
  },
  Shapes: {
    type: "number",
    min: 1,
    max: 400,
    default: 100,
  },
  "Stroke width": {
    type: "number",
    min: 0,
    max: 4,
    step: 0.1,
    default: 1.5,
  },
  "Shape gap": {
    type: "number",
    min: -4,
    max: 4,
    default: 0,
  },
  "Shape opacity": {
    type: "number",
    min: 0,
    max: 1,
    step: 0.1,
    default: 0.3,
  },
  "QR layer": {
    type: "select",
    options: ["Above", "Below"],
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
  const margin = params["Margin"];

  const unit = 4;
  const offset = params["Shape gap"] / 2;
  const thin = unit - params["Shape gap"];
  const matrixWidth = qr.version * 4 + 17 + 2 * margin;
  const size = matrixWidth * unit;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="${params["Background"]}"/>`;

  function getRGB() {
    const r = Math.floor(rand() * 255);
    const g = Math.floor(rand() * 255);
    const b = Math.floor(rand() * 255);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }

  const groups = params["Shapes"];

  let groupLayer = "";

  const group = Array.from({ length: matrixWidth * matrixWidth }).fill(0);
  const visited = Array.from({ length: matrixWidth * matrixWidth }).fill(false);

  const queue = [];
  while (queue.length < groups) {
    const x = Math.floor(rand() * matrixWidth);
    const y = Math.floor(rand() * matrixWidth);
    if (queue.some((seed) => seed.x === x && seed.y === y)) {
      continue;
    }
    queue.push([x, y]);
    group[y * matrixWidth + x] = queue.length;
  }
  while (queue.length) {
    const [x, y] = queue.shift();
    const id = group[y * matrixWidth + x];
    if (x > 0 && !group[y * matrixWidth + x - 1]) {
      queue.push([x - 1, y]);
      group[y * matrixWidth + x - 1] = id;
    }
    if (y > 0 && !group[(y - 1) * matrixWidth + x]) {
      queue.push([x, y - 1]);
      group[(y - 1) * matrixWidth + x] = id;
    }
    if (x < matrixWidth - 1 && !group[y * matrixWidth + x + 1]) {
      queue.push([x + 1, y]);
      group[y * matrixWidth + x + 1] = id;
    }
    if (y < matrixWidth - 1 && !group[(y + 1) * matrixWidth + x]) {
      queue.push([x, y + 1]);
      group[(y + 1) * matrixWidth + x] = id;
    }
  }

  const xMax = matrixWidth - 1;
  const yMax = matrixWidth - 1;

  let baseX;
  let baseY;

  function goRight(x, y, id) {
    let sx = x;
    let vert = false;
    visited[y * matrixWidth + x] = true;
    while (x < xMax) {
      const right = group[x + 1 + y * matrixWidth] === id;
      const vertRight = y > 0 && group[x + 1 + (y - 1) * matrixWidth] === id;
      if (!right || vertRight) {
        vert = right && vertRight;
        break;
      }
      x++;
      visited[y * matrixWidth + x] = true;
    }
    if (vert) {
      groupLayer += `h${(x - sx + 1) * unit}v${-2 * offset}`;
      goUp(x + 1, y - 1, id);
    } else {
      groupLayer += `h${(x - sx) * unit + thin}`;
      goDown(x, y, id);
    }
  }

  function goLeft(x, y, id) {
    let sx = x;
    let vert = false;
    visited[y * matrixWidth + x] = true;
    while (x > 0) {
      const left = group[x - 1 + y * matrixWidth] === id;
      const vertLeft = y < yMax && group[x - 1 + (y + 1) * matrixWidth] === id;
      if (!left || vertLeft) {
        vert = left && vertLeft;
        break;
      }
      x--;
      visited[y * matrixWidth + x] = true;
    }
    if (vert) {
      groupLayer += `h${(x - sx - 1) * unit}v${2 * offset}`;
      goDown(x - 1, y + 1, id);
    } else {
      groupLayer += `h${(x - sx) * unit - thin}`;
      goUp(x, y, id);
    }
  }

  function goUp(x, y, id) {
    let sy = y;
    let horz = false;
    visited[y * matrixWidth + x] = true;
    while (y > 0) {
      const up = group[x + (y - 1) * matrixWidth] === id;
      const horzUp = x > 0 && group[x - 1 + (y - 1) * matrixWidth] === id;
      if (!up || horzUp) {
        horz = up && horzUp;
        break;
      }
      y--;
      visited[y * matrixWidth + x] = true;
    }

    if (x === baseX && y === baseY) {
      groupLayer += "z";
      return;
    }
    if (horz) {
      groupLayer += `v${(y - sy - 1) * unit}h${-2 * offset}`;
      goLeft(x - 1, y - 1, id);
    } else {
      groupLayer += `v${(y - sy) * unit - thin}`;
      goRight(x, y, id);
    }
  }

  function goDown(x, y, id) {
    let sy = y;
    let horz = false;
    visited[y * matrixWidth + x] = true;
    while (y < yMax) {
      const down = group[x + (y + 1) * matrixWidth] === id;
      const horzDown = x < xMax && group[x + 1 + (y + 1) * matrixWidth] === id;
      if (!down || horzDown) {
        horz = down && horzDown;
        break;
      }
      y++;
      visited[y * matrixWidth + x] = true;
    }
    if (horz) {
      groupLayer += `v${(y - sy + 1) * unit}h${2 * offset}`;
      goRight(x + 1, y + 1, id);
    } else {
      groupLayer += `v${(y - sy) * unit + thin}`;
      goLeft(x, y, id);
    }
  }

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

  let qrLayer = `<path fill="${params["Foreground"]}" d="`;

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (matrix[y * matrixWidth + x] & Module.ON) {
        qrLayer += `M${x * unit},${y * unit}h${unit}v${unit}h-${unit}z`;
      }

      if (visited[y * matrixWidth + x]) continue;

      const id = group[y * matrixWidth + x];

      if (
        y > 0 &&
        group[(y - 1) * matrixWidth + x] === id &&
        visited[(y - 1) * matrixWidth + x]
      ) {
        visited[y * matrixWidth + x] = true;
        continue;
      }
      if (
        x > 0 &&
        group[y * matrixWidth + x - 1] === id &&
        visited[y * matrixWidth + x - 1]
      ) {
        visited[y * matrixWidth + x] = true;
        continue;
      }

      const color = getRGB();
      groupLayer += `<path stroke="${params["Foreground"]}" stroke-width="${params["Stroke width"]}" fill="${color}" fill-opacity="${params["Shape opacity"]}" d="M${x * unit + offset},${y * unit + offset}`;
      baseX = x;
      baseY = y;
      goRight(x, y, id);
      groupLayer += `"/>`;
    }
  }
  if (params["QR layer"] === "Below") svg += qrLayer + `"/>`;
  svg += groupLayer;
  if (params["QR layer"] === "Above") svg += qrLayer + `"/>`;
  svg += `</svg>`;

  return svg;
}
