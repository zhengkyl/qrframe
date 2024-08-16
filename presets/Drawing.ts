import type { Params, RawParamsSchema } from "~/lib/params";
import type { OutputQr } from "~/lib/QrContext";
// @ts-expect-error not bundled
import rough from "https://esm.sh/roughjs";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    default: 2,
  },
  "Fill style": {
    type: "Select",
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
    type: "Color",
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
    type: "Color",
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
    type: "Color",
    default: "#000000",
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
} satisfies RawParamsSchema;

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

function splitmix32(a: number) {
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

const domMock = {
  ownerDocument: {
    createElementNS: (_ns: string, tagName: string) => {
      const children: any[] = [];
      const attributes: any = {};
      return {
        tagName,
        attributes,
        setAttribute: (key: string, value: string) => (attributes[key] = value),
        appendChild: (node: any) => children.push(node),
        children,
      };
    },
  },
};

export function renderSVG(qr: OutputQr, params: Params<typeof paramsSchema>) {
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

  let matrix = qr.matrix as any;
  let matrixWidth = qr.version * 4 + 17;

  if (params["Invert"]) {
    matrixWidth += 2;
    matrix = [];
    for (let y = 0; y < matrixWidth; y++) {
      for (let x = 0; x < matrixWidth; x++) {
        if (
          x === 0 ||
          y === 0 ||
          x === matrixWidth - 1 ||
          y === matrixWidth - 1
        ) {
          matrix.push(Module.DataOFF);
        } else {
          matrix.push(qr.matrix[(y - 1) * (matrixWidth - 2) + x - 1]);
        }
      }
    }
  }

  const visited = new Uint16Array(matrixWidth * matrixWidth);
  const unit = 10;
  const margin = params["Margin"] * unit;
  const size = matrixWidth * unit + 2 * margin;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;

  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${params["Background"]}"/>`;

  const xMax = matrixWidth - 1;
  const yMax = matrixWidth - 1;

  let baseX: number;
  let baseY: number;

  const on = params["Invert"]
    ? (x: number, y: number) => (matrix[y * matrixWidth + x] & 1) === 0
    : (x: number, y: number) => (matrix[y * matrixWidth + x] & 1) === 1;

  function goRight(x: number, y: number, shape: number, cw: boolean) {
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

    paths[shape] += `h${(x - sx + 1) * unit}`;
    if (vert) {
      goUp(x + 1, y - 1, shape, cw);
    } else {
      goDown(x, y, shape, cw);
    }
  }

  function goLeft(x: number, y: number, shape: number, cw: boolean) {
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

    paths[shape] += `h${(x - sx - 1) * unit}`;
    if (vert) {
      goDown(x - 1, y + 1, shape, cw);
    } else {
      goUp(x, y, shape, cw);
    }
  }

  function goUp(x: number, y: number, shape: number, cw: boolean) {
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

    paths[shape] += `v${(y - sy - 1) * unit}`;
    if (horz) {
      goLeft(x - 1, y - 1, shape, cw);
    } else {
      goRight(x, y, shape, cw);
    }
  }

  function goDown(x: number, y: number, shape: number, cw: boolean) {
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

    paths[shape] += `v${(y - sy + 1) * unit}`;
    if (horz) {
      goRight(x + 1, y + 1, shape, cw);
    } else {
      goLeft(x, y, shape, cw);
    }
  }

  const stack: [number, number][] = [];
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
      const [x, y] = stack.pop()!;
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
        paths[shape] += `M${x * unit},${y * unit}`;

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

      paths.push(`M${x * unit},${y * unit}`);

      baseY = y;
      baseX = x;

      goRight(x, y, paths.length - 1, true);
    }
  }

  function domToString(node: any) {
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
    console.log(g);
    domToString(g);
  });

  svg += `</svg>`;
  return svg;
}
