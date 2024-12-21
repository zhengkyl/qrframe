import { Module, getSeededRand } from "https://qrframe.kylezhe.ng/utils.js";

export const paramsSchema = {
  Foreground: {
    type: "array",
    props: {
      type: "color",
    },
    resizable: true,
    default: ["#fb51dd", "#f2cffa", "#aefdfd", "#54a9fe"],
  },
  Background: {
    type: "color",
    default: "#101529",
  },
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 4,
  },
  "Quiet zone": {
    type: "select",
    options: ["Minimal", "Full"],
  },
  Invert: {
    type: "boolean",
  },
  "Line thickness": {
    type: "number",
    min: 1,
    max: 4,
    default: 2,
  },
  "Finder thickness": {
    type: "number",
    min: 1,
    max: 4,
    default: 4,
  },
  "Glow strength": {
    type: "number",
    min: 0,
    max: 4,
    step: 0.1,
    default: 2,
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
  const colors = params["Foreground"];
  const bg = params["Background"];

  const qrRowLen = qr.version * 4 + 17;
  const rowLen = qrRowLen + 2 * margin;

  const newMatrix = Array(rowLen * rowLen).fill(0);
  const visited = new Uint16Array(rowLen * rowLen);

  // Copy qr to matrix with margin and randomly set pixels in margin
  for (let y = 0; y < margin - 1; y++) {
    for (let x = 0; x < rowLen; x++) {
      if (rand() > 0.5) newMatrix[y * rowLen + x] = Module.ON;
    }
  }
  for (let y = margin - 1; y < margin + qrRowLen + 1; y++) {
    for (let x = 0; x < margin - 1; x++) {
      if (rand() > 0.5) newMatrix[y * rowLen + x] = Module.ON;
    }
    if (y >= margin && y < margin + qrRowLen) {
      for (let x = margin; x < rowLen - margin; x++) {
        newMatrix[y * rowLen + x] =
          qr.matrix[(y - margin) * qrRowLen + x - margin];
      }
    }
    for (let x = margin + qrRowLen + 1; x < rowLen; x++) {
      if (rand() > 0.5) newMatrix[y * rowLen + x] = Module.ON;
    }
  }
  for (let y = margin + qrRowLen + 1; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      if (rand() > 0.5) newMatrix[y * rowLen + x] = Module.ON;
    }
  }
  if (params["Quiet zone"] === "Minimal") {
    for (let x = margin + 8; x < rowLen - margin - 8; x++) {
      if (rand() > 0.5) newMatrix[(margin - 1) * rowLen + x] = Module.ON;
    }
    for (let y = margin + 8; y < rowLen - margin; y++) {
      if (y < rowLen - margin - 8) {
        if (rand() > 0.5) newMatrix[y * rowLen + margin - 1] = Module.ON;
      }
      if (rand() > 0.5) newMatrix[y * rowLen + rowLen - margin] = Module.ON;
    }
    for (let x = margin + 8; x < rowLen - margin + 1; x++) {
      if (rand() > 0.5) newMatrix[(rowLen - margin) * rowLen + x] = Module.ON;
    }
  }

  const unit = 4;
  let thin = params["Line thickness"];
  let offset = (unit - thin) / 2;
  const size = rowLen * unit - 2 * offset;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${offset} ${offset} ${size} ${size}">`;

  svg += `<filter id="glow">
  <feGaussianBlur stdDeviation="${params["Glow strength"]}"/>
  <feComposite in2="SourceGraphic" operator="over"/>
</filter>`;

  svg += `<rect x="${offset}" y="${offset}" width="${size}" height="${size}" fill="${bg}"/>`;

  const xMax = rowLen - 1;
  const yMax = rowLen - 1;

  let baseX;
  let baseY;

  const on = params["Invert"]
    ? (x, y) => (newMatrix[y * rowLen + x] & Module.ON) === 0
    : (x, y) => (newMatrix[y * rowLen + x] & Module.ON) !== 0;

  function go(x, y, dx, dy, path, cw) {
    visited[y * rowLen + x] = path;
    let concave = false;

    let nx = x + dx;
    let ny = y + dy;
    while (nx >= 0 && nx <= xMax && ny >= 0 && ny <= yMax) {
      const next = on(nx, ny);
      const cx = nx + dy;
      const cy = ny - dx;
      const diag = cx >= 0 && cx <= xMax && cy >= 0 && cy <= yMax && on(cx, cy);
      if (!next || diag) {
        concave = next && diag;
        break;
      }
      visited[ny * rowLen + nx] = path;
      nx += dx;
      ny += dy;
    }

    if (nx - dx === baseX && ny - dy === baseY) {
      if ((cw && dy === -1) || (!cw && dx === -1)) {
        paths[path] += "z";
        return;
      }
    }

    if (concave) {
      if (dx) {
        paths[path] += `h${(nx - x) * unit}v${-dx * 2 * offset}`;
      } else {
        paths[path] += `v${(ny - y) * unit}h${dy * 2 * offset}`;
      }
      go(nx + dy, ny - dx, dy, -dx, path, cw);
    } else {
      if (dx) {
        paths[path] += `h${(nx - x - dx) * unit + dx * thin}`;
      } else {
        paths[path] += `v${(ny - y - dy) * unit + dy * thin}`;
      }
      go(nx - dx, ny - dy, -dy, dx, path, cw);
    }
  }

  const stack = [];
  for (let x = 0; x < rowLen; x++) {
    if (!on(x, 0)) stack.push([x, 0]);
  }
  for (let y = 1; y < yMax; y++) {
    if (!on(0, y)) stack.push([0, y]);
    if (!on(xMax, y)) stack.push([xMax, y]);
  }
  for (let x = 0; x < rowLen; x++) {
    if (!on(x, yMax)) stack.push([x, yMax]);
  }

  // visit all whitespace connected to edges
  function dfsOff() {
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (visited[y * rowLen + x]) continue;
      visited[y * rowLen + x] = 1;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue;
          let nx = x + dx;
          let ny = y + dy;
          if (nx < 0 || nx > xMax || ny < 0 || ny > yMax) continue;
          if (on(nx, ny)) continue;
          stack.push([nx, ny]);
        }
      }
    }
  }
  dfsOff();

  const paths = [""];
  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      if (visited[y * rowLen + x]) continue;

      if (newMatrix[y * rowLen + x] & Module.FINDER) {
        thin = params["Finder thickness"];
        offset = (unit - thin) / 2;
      } else {
        thin = params["Line thickness"];
        offset = (unit - thin) / 2;
      }

      if (!on(x, y)) {
        const path = visited[y * rowLen + x - 1];
        paths[path] +=
          `M${x * unit - offset},${y * unit - offset}v${2 * offset}`;

        baseY = y - 1;
        baseX = x;
        go(x - 1, y, 0, 1, path, false);
        stack.push([x, y]);
        dfsOff();
        continue;
      }

      if (y > 0 && on(x, y - 1) && visited[(y - 1) * rowLen + x]) {
        visited[y * rowLen + x] = visited[(y - 1) * rowLen + x];
        continue;
      }
      if (x > 0 && on(x - 1, y) && visited[y * rowLen + x - 1]) {
        visited[y * rowLen + x] = visited[y * rowLen + x - 1];
        continue;
      }

      const color = colors[Math.floor(rand() * colors.length)];
      paths.push(
        `<path fill="${color}" filter="url(#glow)" d="M${x * unit + offset},${y * unit + offset}`
      );
      baseY = y;
      baseX = x;
      go(x, y, 1, 0, paths.length - 1, true);
    }
  }

  paths.forEach((path, i) => {
    if (i === 0) return;
    svg += path;
    svg += `"/>`;
  });
  svg += `</svg>`;
  return svg;
}
