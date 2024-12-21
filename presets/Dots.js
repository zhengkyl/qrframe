import { Module, getSeededRand } from "https://qrframe.kylezhe.ng/utils.js";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 2,
  },
  Density: {
    type: "number",
    min: 2,
    max: 10,
    default: 4,
  },
  "Finder clarity": {
    type: "number",
    min: 1,
    max: 1.5,
    step: 0.1,
    default: 1.3,
  },
  Foreground: {
    type: "array",
    resizable: true,
    props: {
      type: "color",
    },
    default: ["#f7158b", "#02d1fd", "#1f014b"],
  },
  Background: {
    type: "color",
    default: "#ffffff",
  },
  // See browser compatibility issues here
  // https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
  "Mix blend mode": {
    type: "select",
    options: [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
      "hue",
      "saturation",
      "color",
      "luminosity",
      "plus-darker",
      "plus-lighter",
    ],
  },
  Seed: {
    type: "number",
    min: 1,
    max: 100,
    default: 1,
  },
};

export function renderSVG(qr, params) {
  const unit = params["Density"];

  const rand = getSeededRand(params["Seed"]);
  const rangeStr = (min, max) => (rand() * (max - min) + min).toFixed(2);
  const rowLen = qr.version * 4 + 17;
  const margin = params["Margin"] * unit;
  const colors = params["Foreground"];
  const bg = params["Background"];

  const size = rowLen * unit + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;

  const center = (rowLen * unit) / 2;
  svg += `<defs><g id="dots">`;

  const dotRadius = 1;
  const dotSpace = 2.2;
  const maxRadius = Math.sqrt((unit * unit * rowLen * rowLen) / 2);
  for (let r = 0.1; r < maxRadius; r += dotSpace) {
    const angleInc = dotSpace / r;
    for (let theta = 0; theta < 2 * Math.PI - angleInc / 2; theta += angleInc) {
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const qx = Math.floor((x + center) / unit);
      const qy = Math.floor((y + center) / unit);
      if (qx >= 0 && qx < rowLen && qy >= 0 && qy < rowLen) {
        if (qr.matrix[qy * rowLen + qx] & Module.ON) {
          const rad =
            qr.matrix[qy * rowLen + qx] & Module.FINDER
              ? params["Finder clarity"]
              : dotRadius;
          svg += `<circle cx="${(center + x).toFixed(2)}" cy="${(center + y).toFixed(2)}" r="${rad}" />`;
        }
      }
    }
  }
  svg += `</g></defs>`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  svg += `<g style="mix-blend-mode:${params["Mix blend mode"]}">`;
  colors.forEach(
    (color) =>
      (svg += `<use href="#dots" fill="${color}" fill-opacity="0.75" transform="translate(${rangeStr(-1, 1)},${rangeStr(-1, 1)}) rotate(${rangeStr(-1, 1)})" transform-origin="${center} ${center}"/>`)
  );
  svg += `</g>`;

  svg += `</svg>`;
  return svg;
}
