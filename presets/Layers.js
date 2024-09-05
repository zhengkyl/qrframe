export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 2,
  },
  Background: {
    type: "color",
    default: "#163157",
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
    default: "difference",
  },
  Foreground: {
    type: "array",
    resizable: true,
    props: {
      type: "color",
    },
    default: ["#e80004", "#000000", "#ca70cf", "#000000", "#ffffff"],
  },
  "Offset x": {
    type: "array",
    resizable: true,
    props: {
      type: "number",
      min: -1,
      step: 0.1,
      max: 1,
    },
    default: [0.6, 0.4, 0.2, 0, -0.2],
  },
  "Offset y": {
    type: "array",
    resizable: true,
    props: {
      type: "number",
      min: -1,
      step: 0.1,
      max: 1,
    },
    default: [0.6, 0.4, 0.2, 0, -0.2],
  },
};

export function renderSVG(qr, params) {
  const matrixWidth = qr.version * 4 + 17;
  const margin = params["Margin"];
  const colors = params["Foreground"];
  const offsetX = params["Offset x"];
  const offsetY = params["Offset y"];
  const bg = params["Background"];

  const size = matrixWidth + 2 * margin;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-margin} ${-margin} ${size} ${size}">`;
  svg += `<rect x="${-margin}" y="${-margin}" width="${size}" height="${size}" fill="${bg}"/>`;

  svg += `<defs>`;
  svg += `<path id="base" d="`;
  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];
      if (module & 1) {
        svg += `M${x},${y}h1v1h-1z`;
      }
    }
  }
  svg += `"/>`;
  svg += `</defs>`;

  svg += `<g style="mix-blend-mode:${params["Mix blend mode"]}">`;
  colors.forEach((color, i) => {
    svg += `<use fill="${color}" transform="translate(${offsetX[i]},${offsetY[i]})" href="#base"/>`;
  });
  svg += `</g>`;
  svg += `</svg>`;
  return svg;
}
