import { Module, getSeededRand } from "https://qrframe.kylezhe.ng/utils.js";

export const paramsSchema = {
  Foreground: {
    type: "color",
    default: "#1c4a1a",
  },
  Background: {
    type: "color",
    default: "#e3d68a",
  },
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 3,
  },
  "Quiet zone": {
    type: "number",
    min: 0,
    max: 10,
    default: 1,
  },
  Invert: {
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
  const margin = params["Margin"];
  const quietZone = params["Quiet zone"];
  const fg = params["Foreground"];
  const bg = params["Background"];

  const qrRowLen = qr.version * 4 + 17;
  const rowLen = qrRowLen + 2 * margin;

  const newMatrix = Array(rowLen * rowLen).fill(0);
  const visited = new Uint16Array(rowLen * rowLen);

  // Copy qr to matrix with margin and randomly set pixels in margin
  for (let y = 0; y < margin - quietZone; y++) {
    for (let x = 0; x < rowLen; x++) {
      if (rand() > 0.5) newMatrix[y * rowLen + x] = Module.ON;
    }
  }
  for (let y = margin - quietZone; y < margin + qrRowLen + quietZone; y++) {
    for (let x = 0; x < margin - quietZone; x++) {
      if (rand() > 0.5) newMatrix[y * rowLen + x] = Module.ON;
    }
    if (y >= margin && y < margin + qrRowLen) {
      for (let x = margin; x < rowLen - margin; x++) {
        newMatrix[y * rowLen + x] =
          qr.matrix[(y - margin) * qrRowLen + x - margin];
      }
    }
    for (let x = margin + qrRowLen + quietZone; x < rowLen; x++) {
      if (rand() > 0.5) newMatrix[y * rowLen + x] = Module.ON;
    }
  }
  for (let y = margin + qrRowLen + quietZone; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
      if (rand() > 0.5) newMatrix[y * rowLen + x] = Module.ON;
    }
  }
  if (quietZone === 0 && margin > 0) {
    for (let x = margin; x < margin + 7; x++) {
      newMatrix[(margin - 1) * rowLen + x] = 0;
      newMatrix[(margin - 1) * rowLen + x + qrRowLen - 7] = 0;
    }
    for (let y = margin; y < margin + 7; y++) {
      newMatrix[y * rowLen + margin - 1] = 0;
      newMatrix[y * rowLen + rowLen - margin] = 0;
    }
    for (let y = margin + qrRowLen - 7; y < margin + qrRowLen; y++) {
      newMatrix[y * rowLen + margin - 1] = 0;
    }
    for (let x = margin; x < margin + 7; x++) {
      newMatrix[(rowLen - margin) * rowLen + x] = 0;
    }
  }

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${rowLen} ${rowLen}">`;
  svg += `<rect width="${rowLen}" height="${rowLen}" fill="${bg}"/>`;
  svg += `<g fill="${fg}">`;

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

    if (dx !== 0) {
      const dist = nx - x - dx * 2 * 0.5;
      if (dist) paths[path] += `h${dist}`;
    } else {
      const dist = ny - y - dy * 2 * 0.5;
      if (dist) paths[path] += `v${dist}`;
    }

    if (concave) {
      paths[path] += `a.5.5 0,0,0 ${(dx + dy) * 0.5},${(dy - dx) * 0.5}`;
      go(nx + dy, ny - dx, dy, -dx, path, cw);
    } else {
      paths[path] += `a.5.5 0,0,1 ${(dx - dy) * 0.5},${(dy + dx) * 0.5}`;
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

      if (!on(x, y)) {
        const path = visited[y * rowLen + x - 1];
        paths[path] += `M${x + 0.5},${y}a.5.5 0,0,0 -.5.5`;

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

      paths.push(`<path d="M${x},${y + 0.5}a.5.5 0,0,1 .5-.5`);
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

  svg += `</g></svg>`;
  return svg;
}
