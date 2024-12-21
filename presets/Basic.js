import { Module } from "https://qrframe.kylezhe.ng/utils.js";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 2,
  },
  Foreground: {
    type: "color",
    default: "#000000",
  },
  Background: {
    type: "color",
    default: "#ffffff",
  },
  Shape: {
    type: "select",
    options: ["Square-Circle", "Diamond-Squircle"],
  },
  Frame: {
    type: "select",
    options: ["None", "Corners"],
  },
  Roundness: {
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  "Pixel size": {
    type: "number",
    min: 0.5,
    max: 1.5,
    step: 0.1,
    default: 1,
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
};

export async function renderSVG(qr, params) {
  const rowLen = qr.version * 4 + 17;
  const margin = params["Margin"];
  const fg = params["Foreground"];
  const bg = params["Background"];
  const defaultShape = params["Shape"] === "Square-Circle";
  const roundness = params["Roundness"];
  const file = params["Logo"];
  const logoRatio = params["Logo size"];
  const showLogoData = params["Show data behind logo"];

  const size = rowLen + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  svg += `<g fill="${fg}">`;

  if (params["Frame"] === "Corners") {
    const bracketRadius = 2.2 * roundness;
    const bracketStraight = 5 + margin / 2 - bracketRadius;
    svg += brackets(
      -margin / 2,
      -margin / 2,
      size - margin,
      bracketRadius,
      bracketStraight,
      fg
    );
  }

  svg += `<path d="`;
  const lgRadius = 3.5 * roundness;
  const mdRadius = 2.5 * roundness;
  const smRadius = 1.5 * roundness;

  for (const [x, y] of [
    [0, 0],
    [rowLen - 7, 0],
    [0, rowLen - 7],
  ]) {
    if (defaultShape) {
      svg += roundedRect(x, y, 7, lgRadius, true);
      svg += roundedRect(x + 1, y + 1, 5, mdRadius, false);
      svg += roundedRect(x + 2, y + 2, 3, smRadius, true);
    } else {
      svg += squircle(x, y, 7, lgRadius, true);
      svg += squircle(x + 1, y + 1, 5, mdRadius, false);
      svg += squircle(x + 2, y + 2, 3, smRadius, true);
    }
  }
  svg += `"/>`;

  const dataSize = params["Pixel size"];
  const dataRadius = (roundness * dataSize) / 2;
  const dataOffset = (1 - dataSize) / 2;

  if (!defaultShape || !roundness) svg += `<path d="`;

  const logoInner = Math.floor(((1 - logoRatio) * size) / 2 - margin);
  const logoUpper = rowLen - logoInner;

  for (let y = 0; y < rowLen; y++) {
    for (let x = 0; x < rowLen; x++) {
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
      const module = qr.matrix[y * rowLen + x];
      if (!(module & Module.ON)) continue;
      if (module & Module.FINDER) continue;

      if (defaultShape) {
        if (roundness) {
          svg += `<rect x="${fmt(x + dataOffset)}" y="${fmt(y + dataOffset)}" width="${dataSize}" height="${dataSize}" rx="${fmt(dataRadius)}"/>`;
        } else {
          svg += `M${x + dataOffset},${y + dataOffset}h${dataSize}v${dataSize}h-${dataSize}z`;
        }
      } else {
        svg += squircle(
          x + dataOffset,
          y + dataOffset,
          dataSize,
          dataRadius,
          true
        );
      }
    }
  }
  if (!defaultShape || !roundness) svg += `"/>`;
  svg += `</g>`;

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

// reduce file bloat from floating point math
const fmt = (n) => n.toFixed(2).replace(/.00$/, "");

function squircle(x, y, width, handle, cw) {
  const half = fmt(width / 2);

  if (handle === 0) {
    return cw
      ? `M${fmt(x + width / 2)},${fmt(y)}l${half},${half}l-${half},${half}l-${half},-${half}z`
      : `M${fmt(x + width / 2)},${fmt(y)}l-${half},${half}l${half},${half}l${half},-${half}z`;
  }

  const h = fmt(handle);
  const hInv1 = fmt(half - handle);
  const hInv2 = fmt(-(half - handle));
  return cw
    ? `M${fmt(x + width / 2)},${fmt(y)}c${h},0 ${half},${hInv1} ${half},${half}s${hInv2},${half} -${half},${half}s-${half},${hInv2} -${half},-${half}s${hInv1},-${half} ${half},-${half}`
    : `M${fmt(x + width / 2)},${fmt(y)}c-${h},0 -${half},${hInv1} -${half},${half}s${hInv1},${half} ${half},${half}s${half},${hInv2} ${half},-${half}s${hInv2},-${half} -${half},-${half}`;
}

function roundedRect(x, y, width, radius, cw) {
  if (radius === 0) {
    return cw
      ? `M${fmt(x)},${fmt(y)}h${width}v${width}h-${width}z`
      : `M${fmt(x)},${fmt(y)}v${width}h${width}v-${width}z`;
  }

  if (radius === width / 2) {
    const r = fmt(radius);
    const cwFlag = cw ? "1" : "0";
    return `M${fmt(x + radius)},${fmt(y)}a${r},${r} 0,0,${cwFlag} 0,${width}a${r},${r} 0,0,${cwFlag} ${0},-${width}`;
  }

  const r = fmt(radius);
  const side = fmt(width - 2 * radius);
  return cw
    ? `M${fmt(x + radius)},${fmt(y)}h${side}a${r},${r} 0,0,1 ${r},${r}v${side}a${r},${r} 0,0,1 -${r},${r}h-${side}a${r},${r} 0,0,1 -${r},-${r}v-${side}a${r},${r} 0,0,1 ${r},-${r}`
    : `M${fmt(x + radius)},${fmt(y)}a${r},${r} 0,0,0 -${r},${r}v${side}a${r},${r} 0,0,0 ${r},${r}h${side}a${r},${r} 0,0,0 ${r},-${r}v-${side}a${r},${r} 0,0,0 -${r},-${r}`;
}

function brackets(x, y, width, radius, straight, stroke) {
  const bracket = radius + straight;
  const side = fmt(width - 2 * bracket);
  const r = fmt(radius);

  const cap = radius === 0 ? "square" : "round";

  let svg = `<path fill="none" stroke="${stroke}" stroke-linecap="${cap}" d="`;
  svg += `M${x},${fmt(y + bracket)}`;
  svg += `v-${straight}a${r},${r} 0,0,1 ${r},-${r}h${straight}m${side},0`;
  svg += `h${straight}a${r},${r} 0,0,1 ${r},${r}v${straight}m0,${side}`;
  svg += `v${straight}a${r},${r} 0,0,1 -${r},${r}h-${straight}m-${side},0`;
  svg += `h-${straight}a${r},${r} 0,0,1 -${r},-${r}v-${straight}`;
  svg += `"/>`;
  return svg;
}
