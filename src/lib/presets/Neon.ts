export const Neon = `import { Module, getSeededRand } from "https://qrframe.kylezhe.ng/utils.js";

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

  const qrWidth = qr.version * 4 + 17;
  const matrixWidth = qrWidth + 2 * margin;

  const newMatrix = Array(matrixWidth * matrixWidth).fill(0);
  const visited = new Uint16Array(matrixWidth * matrixWidth);

  // Copy qr to matrix with margin and randomly set pixels in margin
  for (let y = 0; y < margin - 1; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (rand() > 0.5) newMatrix[y * matrixWidth + x] = Module.ON;
    }
  }
  for (let y = margin - 1; y < margin + qrWidth + 1; y++) {
    for (let x = 0; x < margin - 1; x++) {
      if (rand() > 0.5) newMatrix[y * matrixWidth + x] = Module.ON;
    }
    if (y >= margin && y < margin + qrWidth) {
      for (let x = margin; x < matrixWidth - margin; x++) {
        newMatrix[y * matrixWidth + x] =
          qr.matrix[(y - margin) * qrWidth + x - margin];
      }
    }
    for (let x = margin + qrWidth + 1; x < matrixWidth; x++) {
      if (rand() > 0.5) newMatrix[y * matrixWidth + x] = Module.ON;
    }
  }
  for (let y = margin + qrWidth + 1; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      if (rand() > 0.5) newMatrix[y * matrixWidth + x] = Module.ON;
    }
  }
  if (params["Quiet zone"] === "Minimal") {
    for (let x = margin + 8; x < matrixWidth - margin - 8; x++) {
      if (rand() > 0.5) newMatrix[(margin - 1) * matrixWidth + x] = Module.ON;
    }
    for (let y = margin + 8; y < matrixWidth - margin; y++) {
      if (y < matrixWidth - margin - 8) {
        if (rand() > 0.5) newMatrix[y * matrixWidth + margin - 1] = Module.ON;
      }
      if (rand() > 0.5)
        newMatrix[y * matrixWidth + matrixWidth - margin] = Module.ON;
    }
    for (let x = margin + 8; x < matrixWidth - margin + 1; x++) {
      if (rand() > 0.5)
        newMatrix[(matrixWidth - margin) * matrixWidth + x] = Module.ON;
    }
  }

  const unit = 4;
  let thin = params["Line thickness"];
  let offset = (unit - thin) / 2;
  const size = matrixWidth * unit - 2 * offset;

  let svg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="\${offset} \${offset} \${size} \${size}">\`;

  svg += \`<filter id="glow">
  <feGaussianBlur stdDeviation="\${params["Glow strength"]}"/>
  <feComposite in2="SourceGraphic" operator="over"/>
</filter>\`;

  svg += \`<rect x="\${offset}" y="\${offset}" width="\${size}" height="\${size}" fill="\${bg}"/>\`;

  const xMax = matrixWidth - 1;
  const yMax = matrixWidth - 1;

  let baseX;
  let baseY;

  const on = params["Invert"]
    ? (x, y) => (newMatrix[y * matrixWidth + x] & Module.ON) === 0
    : (x, y) => (newMatrix[y * matrixWidth + x] & Module.ON) !== 0;

  function goRight(x, y, shape, cw) {
    let sx = x;

    let vert = false;
    visited[y * matrixWidth + x] = shape;
    while (x < xMax) {
      const right = on(x + 1, y);
      const vertRight = y > 0 && on(x + 1, y - 1);
      if (!right || vertRight) {
        vert = right && vertRight;
        break;
      }
      x++;
      visited[y * matrixWidth + x] = shape;
    }

    if (vert) {
      paths[shape] += \`h\${(x - sx + 1) * unit}v\${-2 * offset}\`;
      goUp(x + 1, y - 1, shape, cw);
    } else {
      paths[shape] += \`h\${(x - sx) * unit + thin}\`;
      goDown(x, y, shape, cw);
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

    if (vert) {
      paths[shape] += \`h\${(x - sx - 1) * unit}v\${2 * offset}\`;
      goDown(x - 1, y + 1, shape, cw);
    } else {
      paths[shape] += \`h\${(x - sx) * unit - thin}\`;
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

    if (horz) {
      paths[shape] += \`v\${(y - sy - 1) * unit}h\${-2 * offset}\`;
      goLeft(x - 1, y - 1, shape, cw);
    } else {
      paths[shape] += \`v\${(y - sy) * unit - thin}\`;
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

    if (horz) {
      paths[shape] += \`v\${(y - sy + 1) * unit}h\${2 * offset}\`;
      goRight(x + 1, y + 1, shape, cw);
    } else {
      paths[shape] += \`v\${(y - sy) * unit + thin}\`;
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

      if (newMatrix[y * matrixWidth + x] & Module.FINDER) {
        thin = params["Finder thickness"];
        offset = (unit - thin) / 2;
      } else {
        thin = params["Line thickness"];
        offset = (unit - thin) / 2;
      }

      if (!on(x, y)) {
        const shape = visited[y * matrixWidth + x - 1];
        paths[shape] +=
          \`M\${x * unit - offset},\${y * unit - offset}v\${2 * offset}\`;

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

      const color = colors[Math.floor(rand() * colors.length)];
      paths.push(
        \`<path fill="\${color}" filter="url(#glow)" d="M\${x * unit + offset},\${y * unit + offset}\`
      );

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
  svg += \`</svg>\`;
  return svg;
}
`
