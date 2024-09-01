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
  Roundness: {
    type: "number",
    min: 0,
    max: 1,
    step: 0.01,
    default: 0,
  },
  "Data size": {
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

// unformatted floats can bloat file size
const fmt = (n) => n.toFixed(2).replace(/\.00$/, "");

export async function renderSVG(qr, params) {
  const matrixWidth = qr.version * 4 + 17;
  const margin = params["Margin"];
  const fg = params["Foreground"];
  const bg = params["Background"];
  const roundness = params["Roundness"];
  const file = params["Logo"];

  const size = matrixWidth + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  svg += `<g fill="${fg}">`;
  svg += `<path d="`;
  const lgRadius = 3.5 * roundness;
  const mdRadius = 2.5 * roundness;
  const smRadius = 1.5 * roundness;
  const lgSide = fmt(7 - 2 * lgRadius);
  const mdSide = fmt(5 - 2 * mdRadius);
  const smSide = fmt(3 - 2 * smRadius);

  const corner = (radius, xDir, yDir, cw) =>
    `a${fmt(radius)},${fmt(radius)} 0,0,${cw ? "1" : "0"} ${fmt(xDir * radius)},${fmt(yDir * radius)}`;

  for (const [x, y] of [
    [0, 0],
    [matrixWidth - 7, 0],
    [0, matrixWidth - 7],
  ]) {
    svg += `M${fmt(x + lgRadius)},${y}h${lgSide}${corner(lgRadius, 1, 1, true)}v${lgSide}${corner(lgRadius, -1, 1, true)}h-${lgSide}${corner(lgRadius, -1, -1, true)}v-${lgSide}${corner(lgRadius, 1, -1, true)}`;

    svg += `M${fmt(x + 1 + mdRadius)},${y + 1}${corner(mdRadius, -1, 1, false)}v${mdSide}${corner(mdRadius, 1, 1, false)}h${mdSide}${corner(mdRadius, 1, -1, false)}v-${mdSide}${corner(mdRadius, -1, -1, false)}`;

    svg += `M${fmt(x + 2 + smRadius)},${y + 2}h${smSide}${corner(smRadius, 1, 1, true)}v${smSide}${corner(smRadius, -1, 1, true)}h-${smSide}${corner(smRadius, -1, -1, true)}v-${smSide}${corner(smRadius, 1, -1, true)}`;
  }
  svg += `"/>`;

  const dataSize = params["Data size"];
  const dataRadius = fmt((roundness * dataSize) / 2);
  const dataOffset = (1 - dataSize) / 2;
  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];
      if (module & 1) {
        if (module === Module.FinderON) continue;
        svg += `<rect x="${fmt(x + dataOffset)}" y="${fmt(y + dataOffset)}" width="${dataSize}" height="${dataSize}" rx="${dataRadius}"/>`;
      }
    }
  }
  svg += `</g>`;

  if (file != null) {
    const bytes = await file.bytes();
    const b64 = btoa(
      Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("")
    );
    const logoSize = fmt(params["Logo size"] * size);
    const logoOffset = fmt(((1 - params["Logo size"]) * size) / 2 - margin);
    svg += `<image x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}" href="data:${file.type};base64,${b64}"/>`;
  }

  svg += `</svg>`;
  return svg;
}
