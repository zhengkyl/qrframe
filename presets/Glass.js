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
  const rowLen = qr.version * 4 + 17 + 2 * margin;
  const size = rowLen * unit;

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

  const group = Array.from({ length: rowLen * rowLen }).fill(0);
  const visited = Array.from({ length: rowLen * rowLen }).fill(false);

  const queue = [];
  while (queue.length < groups) {
    const x = Math.floor(rand() * rowLen);
    const y = Math.floor(rand() * rowLen);
    if (queue.some((seed) => seed.x === x && seed.y === y)) {
      continue;
    }
    queue.push([x, y]);
    group[y * rowLen + x] = queue.length;
  }
  while (queue.length) {
    const [x, y] = queue.shift();
    const id = group[y * rowLen + x];
    if (x > 0 && !group[y * rowLen + x - 1]) {
      queue.push([x - 1, y]);
      group[y * rowLen + x - 1] = id;
    }
    if (y > 0 && !group[(y - 1) * rowLen + x]) {
      queue.push([x, y - 1]);
      group[(y - 1) * rowLen + x] = id;
    }
    if (x < rowLen - 1 && !group[y * rowLen + x + 1]) {
      queue.push([x + 1, y]);
      group[y * rowLen + x + 1] = id;
    }
    if (y < rowLen - 1 && !group[(y + 1) * rowLen + x]) {
      queue.push([x, y + 1]);
      group[(y + 1) * rowLen + x] = id;
    }
  }

  const xMax = rowLen - 1;
  const yMax = rowLen - 1;

  let baseX;
  let baseY;

  const on = (x, y, id) => group[y * rowLen + x] === id;

  function go(x, y, dx, dy, id) {
    visited[y * rowLen + x] = true;
    let concave = false;

    let nx = x + dx;
    let ny = y + dy;
    while (nx >= 0 && nx <= xMax && ny >= 0 && ny <= yMax) {
      const next = on(nx, ny, id);
      const cx = nx + dy;
      const cy = ny - dx;
      const diag =
        cx >= 0 && cx <= xMax && cy >= 0 && cy <= yMax && on(cx, cy, id);
      if (!next || diag) {
        concave = next && diag;
        break;
      }
      visited[ny * rowLen + nx] = true;
      nx += dx;
      ny += dy;
    }

    if (nx - dx === baseX && ny - dy === baseY) {
      if (dy === -1) {
        groupLayer += "z";
        return;
      }
    }

    if (concave) {
      if (dx) {
        groupLayer += `h${(nx - x) * unit}v${-dx * 2 * offset}`;
      } else {
        groupLayer += `v${(ny - y) * unit}h${dy * 2 * offset}`;
      }
      go(nx + dy, ny - dx, dy, -dx, id);
    } else {
      if (dx) {
        groupLayer += `h${(nx - x - dx) * unit + dx * thin}`;
      } else {
        groupLayer += `v${(ny - y - dy) * unit + dy * thin}`;
      }
      go(nx - dx, ny - dy, -dy, dx, id);
    }
  }

  const matrix = Array.from({ length: rowLen * rowLen }).fill(0);
  const qrWidth = qr.version * 4 + 17;

  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      if (
        y >= margin &&
        y < rowLen - margin &&
        x >= margin &&
        x < rowLen - margin
      ) {
        matrix[y * rowLen + x] =
          qr.matrix[(y - margin) * qrWidth + (x - margin)];
      }
    }
  }

  let qrLayer = `<path fill="${params["Foreground"]}" d="`;

  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      if (matrix[y * rowLen + x] & Module.ON) {
        qrLayer += `M${x * unit},${y * unit}h${unit}v${unit}h-${unit}z`;
      }

      if (visited[y * rowLen + x]) continue;

      const id = group[y * rowLen + x];

      if (
        y > 0 &&
        group[(y - 1) * rowLen + x] === id &&
        visited[(y - 1) * rowLen + x]
      ) {
        visited[y * rowLen + x] = true;
        continue;
      }
      if (
        x > 0 &&
        group[y * rowLen + x - 1] === id &&
        visited[y * rowLen + x - 1]
      ) {
        visited[y * rowLen + x] = true;
        continue;
      }

      const color = getRGB();
      groupLayer += `<path stroke="${params["Foreground"]}" stroke-width="${params["Stroke width"]}" fill="${color}" fill-opacity="${params["Shape opacity"]}" d="M${x * unit + offset},${y * unit + offset}`;
      baseX = x;
      baseY = y;
      go(x, y, 1, 0, id);
      groupLayer += `"/>`;
    }
  }
  if (params["QR layer"] === "Below") svg += qrLayer + `"/>`;
  svg += groupLayer;
  if (params["QR layer"] === "Above") svg += qrLayer + `"/>`;
  svg += `</svg>`;

  return svg;
}
