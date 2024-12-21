import { Module, getSeededRand } from "https://qrframe.kylezhe.ng/utils.js";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 20,
    step: 0.1,
    default: 8,
  },
  "Radius offset": {
    type: "number",
    min: -10,
    max: 10,
    default: 0,
  },
  Foreground: {
    type: "color",
    default: "#000000",
  },
  Background: {
    type: "color",
    default: "#ffffff",
  },
  "Frame thickness": {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
  },
  "Finder pattern": {
    type: "select",
    options: ["Default", "Circle", "Square"],
  },
  "Alignment pattern": {
    type: "select",
    options: ["Default", "Circle", "Square"],
  },
  Logo: {
    type: "file",
    accept: ".jpeg, .jpg, .png, .svg",
  },
  "Logo size": {
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0.25,
  },
  "Show data behind logo": {
    type: "boolean",
  },
  "Pixel size": {
    type: "select",
    options: ["None", "Center", "Edge", "Random"],
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
};

const fmt = (n) => n.toFixed(2).replace(/.00$/, "");

export async function renderSVG(qr, params) {
  const rowLen = qr.version * 4 + 17;
  const margin = params["Margin"];
  const fg = params["Foreground"];
  const bg = params["Background"];
  const rOffset = params["Radius offset"];
  const file = params["Logo"];
  const logoRatio = params["Logo size"];
  const showLogoData = params["Show data behind logo"];
  const rand = getSeededRand(params["Seed"]);
  const range = (min, max) => rand() * (max - min) + min;

  const size = rowLen + 2 * margin;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  // nearest odd number
  let diameter = Math.round(Math.sqrt(2) * rowLen) + 2 * rOffset;
  if (!(diameter & 1)) diameter += 1;

  const frameThick = params["Frame thickness"];
  if (frameThick) {
    const frameR = diameter / 2 + 1 + frameThick / 2;
    svg += `<circle cx="${rowLen / 2}" cy="${rowLen / 2}" r="${frameR}" fill="none" stroke="${fg}" stroke-width="${frameThick}"/>`;
    if (rOffset < -1) {
      const c = rowLen / 2;
      const offset = (frameR * Math.sqrt(2)) / 2;
      const r = (-rOffset + 1) * Math.max(frameThick / 2, 1);
      svg += `<circle cx="${c - offset}" cy="${c - offset}" r="${r}" fill="${bg}"/>`;
      svg += `<circle cx="${c + offset}" cy="${c - offset}" r="${r}" fill="${bg}"/>`;
      svg += `<circle cx="${c - offset}" cy="${c + offset}" r="${r}" fill="${bg}"/>`;
      if (rOffset < -2) {
        svg += `<circle cx="${c + offset}" cy="${c + offset}" r="${r}" fill="${bg}"/>`;
      }
    }
  }

  if (params["Finder pattern"] !== "Default") {
    for (const [x, y] of [
      [0, 0],
      [rowLen - 7, 0],
      [0, rowLen - 7],
    ]) {
      if (params["Finder pattern"] === "Circle") {
        svg += `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="3" fill="none" stroke="${fg}" stroke-width="1"/>`;
        svg += `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5" fill="${fg}"/>`;
      } else {
        svg += `<path d="M${x},${y}h7v7h-7zM${x + 1},${y + 1}v5h5v-5zM${x + 2},${y + 2}h3v3h-3z"/>`;
      }
    }
  }
  svg += `<path fill="${fg}" d="`;

  const maxDist = Math.sqrt(2) * (rowLen / 2);
  const lower = Math.min(-(diameter - rowLen) / 2, 0);
  const upper = Math.max(diameter - lower, rowLen);

  const logoInner = Math.floor(((1 - logoRatio) * size) / 2 - margin);
  const logoUpper = rowLen - logoInner;
  for (let y = lower; y < upper; y++) {
    for (let x = lower; x < upper; x++) {
      if (
        file &&
        !showLogoData &&
        x >= logoInner &&
        y >= logoInner &&
        x < logoUpper &&
        y < logoUpper
      ) {
        continue;
      }

      // Quiet zone around qr
      const xRange1 = x >= -1 && x < 8;
      const yRange1 = y >= -1 && y < 8;
      const yRange2 = y > rowLen - 9 && y <= rowLen;
      const xRange2 = x > rowLen - 9 && x <= rowLen;
      if (
        (x === -1 && (yRange1 || yRange2)) ||
        (y === -1 && (xRange1 || xRange2)) ||
        (x === rowLen && yRange1) ||
        (y === rowLen && xRange1)
      ) {
        continue;
      }

      const dx = x - (rowLen - 1) / 2;
      const dy = y - (rowLen - 1) / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (x >= 0 && x < rowLen && y >= 0 && y < rowLen) {
        const module = qr.matrix[y * rowLen + x];
        if (!(module & Module.ON)) continue;

        if (params["Finder pattern"] !== "Default" && module & Module.FINDER) {
          continue;
        }
        if (
          params["Alignment pattern"] !== "Default" &&
          module & Module.ALIGNMENT
        ) {
          if (module & Module.MODIFIER) {
            if (params["Alignment pattern"] === "Circle") {
              svg += `M${x + 0.5},${y - 2}a2.5,2.5 0,0,0 0,5a2.5,2.5 0,0,0 0,-5`;
              svg += `M${x + 0.5},${y - 1}a1.5,1.5 0,0,1 0,3a1.5,1.5 0,0,1 0,-3`;
              svg += `M${x + 0.5},${y}a.5,.5 0,0,0 0,1a.5,.5 0,0,0 0,-1`;
            } else {
              svg += `M${x - 2},${y - 2}h5v5h-5zM${x - 1},${y - 1}v3h3v-3zM${x},${y}h1v1h-1z`;
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
      switch (params["Pixel size"]) {
        case "Center":
          ratio = 1 - dist / maxDist + 0.8;
          break;
        case "Edge":
          ratio = dist / maxDist + 0.8;
          break;
        case "Random":
          ratio = range(0.8, 1.2);
          break;
        default:
          ratio = 1;
      }

      const radius = fmt(0.5 * ratio);

      svg += `M${x + 0.5},${y + 0.5 - radius}a${radius},${radius} 0,0,0 0,${2 * radius}a${radius},${radius} 0,0,0 0,${-2 * radius}`;
    }
  }
  svg += `"/>`;

  if (file != null) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const b64 = btoa(
      Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("")
    );
    const logoSize = fmt(logoRatio * size);
    const logoOffset = fmt(((1 - logoRatio) * size) / 2 - margin);
    svg += `<image x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}" href="data:${file.type};base64,${b64}"/>`;
  }
  svg += `</svg>`;

  return svg;
}
