import { Module, getSeededRand } from "https://qrframe.kylezhe.ng/utils.js";
import rough from "https://esm.sh/roughjs";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  "Fill style": {
    type: "select",
    options: [
      "Hachure",
      "Solid",
      "Zigzag",
      "Cross-hatch",
      "Dots",
      "Dashed",
      "Zigzag-line",
    ],
    default: "Zigzag",
  },
  Fill: {
    type: "color",
    default: "#ffffff",
  },
  "Fill weight": {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  "Fill gap": {
    type: "number",
    min: 1,
    max: 10,
    default: 4,
  },
  Stroke: {
    type: "color",
    default: "#ffffff",
  },
  "Stroke width": {
    type: "number",
    min: 0,
    max: 10,
    default: 1,
  },
  Invert: {
    type: "boolean",
    default: true,
  },
  Roughness: {
    type: "number",
    min: 0,
    max: 10,
    default: 1,
  },
  Bowing: {
    type: "number",
    min: 0,
    max: 10,
    default: 1,
  },
  Background: {
    type: "color",
    default: "#222222",
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
};

const domMock = {
  ownerDocument: {
    createElementNS: (_ns, tagName) => {
      const children = [];
      const attributes = {};
      return {
        tagName,
        attributes,
        setAttribute: (key, value) => (attributes[key] = value),
        appendChild: (node) => children.push(node),
        children,
      };
    },
  },
};

export function renderSVG(qr, params) {
  const roughSVG = rough.svg(domMock, {
    options: {
      roughness: params["Roughness"],
      bowing: params["Bowing"],
      fillStyle: params["Fill style"].toLowerCase(),
      fillWeight: params["Fill weight"],
      fill: params["Fill weight"] === 0 ? "none" : params["Fill"],
      strokeWidth: params["Stroke width"],
      stroke: params["Stroke width"] === 0 ? "none" : params["Stroke"],
      hachureGap: params["Fill gap"],
      seed: params["Seed"],
      fixedDecimalPlaceDigits: 2,
    },
  });

  let matrix = qr.matrix;
  let rowLen = qr.version * 4 + 17;

  if (params["Invert"]) {
    rowLen += 2;
    matrix = [];
    for (let y = 0; y < rowLen; y++) {
      for (let x = 0; x < rowLen; x++) {
        if (x === 0 || y === 0 || x === rowLen - 1 || y === rowLen - 1) {
          matrix.push(0);
        } else {
          matrix.push(qr.matrix[(y - 1) * (rowLen - 2) + x - 1]);
        }
      }
    }
  }

  const visited = new Uint16Array(rowLen * rowLen);
  const unit = 10;
  const margin = params["Margin"] * unit;
  const size = rowLen * unit + 2 * margin;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${params["Background"]}"/>`;

  const xMax = rowLen - 1;
  const yMax = rowLen - 1;

  let baseX;
  let baseY;

  const on = params["Invert"]
    ? (x, y) => (matrix[y * rowLen + x] & Module.ON) === 0
    : (x, y) => (matrix[y * rowLen + x] & Module.ON) !== 0;

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
      paths[path] += `h${(nx - x) * unit}`;
    } else {
      paths[path] += `v${(ny - y) * unit}`;
    }

    if (concave) {
      go(nx + dy, ny - dx, dy, -dx, path, cw);
    } else {
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
        paths[path] += `M${x * unit},${y * unit}`;

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

      paths.push(`M${x * unit},${y * unit}`);
      baseY = y;
      baseX = x;
      go(x, y, 1, 0, paths.length - 1, true);
    }
  }

  function domToString(node) {
    const attrs = Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
    svg += `<${node.tagName} ${attrs}>`;
    node.children.forEach(domToString);
    svg += `</${node.tagName}>`;
  }

  paths.forEach((path, i) => {
    if (i === 0) return;
    const g = roughSVG.path(path);
    domToString(g);
  });

  svg += `</svg>`;
  return svg;
}
