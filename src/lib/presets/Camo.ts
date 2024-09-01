export const Camo = `export const paramsSchema = {
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
  const margin = params["Margin"];
  const quietZone = params["Quiet zone"];
  const fg = params["Foreground"];
  const bg = params["Background"];

  const qrWidth = qr.version * 4 + 17;
  const matrixWidth = qrWidth + 2 * margin;

  const newMatrix = Array(matrixWidth * matrixWidth).fill(Module.DataOFF);
  const visited = new Uint16Array(matrixWidth * matrixWidth);

  // Copy qr to matrix with margin and randomly set pixels in margin
  for (let y = 0; y < margin - quietZone; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (rand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }
  for (let y = margin - quietZone; y < margin + qrWidth + quietZone; y++) {
    for (let x = 0; x < margin - quietZone; x++) {
      if (rand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
    if (y >= margin && y < margin + qrWidth) {
      for (let x = margin; x < matrixWidth - margin; x++) {
        newMatrix[y * matrixWidth + x] =
          qr.matrix[(y - margin) * qrWidth + x - margin];
      }
    }
    for (let x = margin + qrWidth + quietZone; x < matrixWidth; x++) {
      if (rand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }
  for (let y = margin + qrWidth + quietZone; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (rand() > 0.5) newMatrix[y * matrixWidth + x] = Module.DataON;
    }
  }

  let svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${matrixWidth} \${matrixWidth}">\`;
  svg += \`<rect width="\${matrixWidth}" height="\${matrixWidth}" fill="\${bg}"/>\`;
  svg += \`<g fill="\${fg}">\`;

  const xMax = matrixWidth - 1;
  const yMax = matrixWidth - 1;

  let baseX;
  let baseY;

  const on = params["Invert"]
    ? (x, y) => (newMatrix[y * matrixWidth + x] & 1) === 0
    : (x, y) => (newMatrix[y * matrixWidth + x] & 1) === 1;

  function goRight(x, y, path, cw) {
    let sx = x;
    let vert = false;
    visited[y * matrixWidth + x] = path;
    while (x < xMax) {
      const right = on(x + 1, y);
      const vertRight = y > 0 && on(x + 1, y - 1);
      if (!right || vertRight) {
        vert = right && vertRight;
        break;
      }
      x++;
      visited[y * matrixWidth + x] = path;
    }
    paths[path] += \`h\${x - sx}\`;
    if (vert) {
      paths[path] += \`a.5.5 0,0,0 .5-.5\`;
      goUp(x + 1, y - 1, path, cw);
    } else {
      paths[path] += \`a.5.5 0,0,1 .5.5\`;
      goDown(x, y, path, cw);
    }
  }

  function goLeft(x, y, shape, cw) {
    let sx = x;
    let vert = false;
    visited[y * matrixWidth + x] = shape;
    while (x > 0) {
      const left = on(x - 1, y);
      const vertLeft = y < yMax && on(x - 1, y + 1);
      if (!left || vertLeft) {
        vert = left && vertLeft;
        break;
      }
      x--;
      visited[y * matrixWidth + x] = shape;
    }
    if (!cw && x === baseX && y === baseY) {
      paths[shape] += "z";
      return;
    }
    paths[shape] += \`h\${x - sx}\`;

    if (vert) {
      paths[shape] += \`a.5.5 0,0,0 -.5.5\`;
      goDown(x - 1, y + 1, shape, cw);
    } else {
      paths[shape] += \`a.5.5 0,0,1 -.5-.5\`;
      goUp(x, y, shape, cw);
    }
  }

  function goUp(x, y, shape, cw) {
    let sy = y;
    let horz = false;
    visited[y * matrixWidth + x] = shape;
    while (y > 0) {
      const up = on(x, y - 1);
      const horzUp = x > 0 && on(x - 1, y - 1);
      if (!up || horzUp) {
        horz = up && horzUp;
        break;
      }
      y--;
      visited[y * matrixWidth + x] = shape;
    }

    if (cw && x === baseX && y === baseY) {
      paths[shape] += "z";
      return;
    }
    paths[shape] += \`v\${y - sy}\`;
    if (horz) {
      paths[shape] += \`a.5.5 0,0,0 -.5-.5\`;
      goLeft(x - 1, y - 1, shape, cw);
    } else {
      paths[shape] += \`a.5.5 0,0,1 .5-.5\`;
      goRight(x, y, shape, cw);
    }
  }

  function goDown(x, y, shape, cw) {
    let sy = y;
    let horz = false;
    visited[y * matrixWidth + x] = shape;
    while (y < yMax) {
      const down = on(x, y + 1);
      const horzDown = x < xMax && on(x + 1, y + 1);
      if (!down || horzDown) {
        horz = down && horzDown;
        break;
      }
      y++;
      visited[y * matrixWidth + x] = shape;
    }
    paths[shape] += \`v\${y - sy}\`;
    if (horz) {
      paths[shape] += \`a.5.5 0,0,0 .5.5\`;
      goRight(x + 1, y + 1, shape, cw);
    } else {
      paths[shape] += \`a.5.5 0,0,1 -.5.5\`;
      goLeft(x, y, shape, cw);
    }
  }

  const stack = [];
  for (let x = 0; x < matrixWidth; x++) {
    if (!on(x, 0)) stack.push([x, 0]);
  }
  for (let y = 1; y < yMax; y++) {
    if (!on(0, y)) stack.push([0, y]);
    if (!on(xMax, y)) stack.push([xMax, y]);
  }
  for (let x = 0; x < matrixWidth; x++) {
    if (!on(x, yMax)) stack.push([x, yMax]);
  }

  // recursion dfs limited to ~4000
  // visit all whitespace connected to edges
  function dfsOff() {
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (visited[y * matrixWidth + x]) continue;
      visited[y * matrixWidth + x] = 1;
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
  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (visited[y * matrixWidth + x]) continue;

      if (!on(x, y)) {
        const shape = visited[y * matrixWidth + x - 1];
        paths[shape] += \`M\${x + 0.5},\${y}a.5.5 0,0,0 -.5.5\`;

        // these indexes are correct, think about it
        baseY = y - 1;
        baseX = x;
        goDown(x - 1, y, shape, false);
        stack.push([x, y]);
        dfsOff();
        continue;
      }

      if (y > 0 && on(x, y - 1) && visited[(y - 1) * matrixWidth + x]) {
        visited[y * matrixWidth + x] = visited[(y - 1) * matrixWidth + x];
        continue;
      }
      if (x > 0 && on(x - 1, y) && visited[y * matrixWidth + x - 1]) {
        visited[y * matrixWidth + x] = visited[y * matrixWidth + x - 1];
        continue;
      }

      paths.push(\`<path d="M\${x},\${y + 0.5}a.5.5 0,0,1 .5-.5\`);

      baseY = y;
      baseX = x;

      goRight(x, y, paths.length - 1, true);
    }
  }

  paths.forEach((path, i) => {
    if (i === 0) return;
    svg += path;
    svg += \`"/>\`;
  });

  svg += \`</g></svg>\`;

  return svg;
}
`
