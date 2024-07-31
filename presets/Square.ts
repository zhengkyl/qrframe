import type { Params, RawParamsSchema } from "../src/lib/params";
import type { OutputQr } from "../src/lib/QrContext";

export const paramsSchema = {
  Margin: {
    type: "number",
    min: 0,
    max: 10,
    step: 0.1,
    default: 2,
  },
  Foreground: {
    type: "Color",
    default: "#000000",
  },
  Background: {
    type: "Color",
    default: "#ffffff",
  },
} satisfies RawParamsSchema;

export function renderSVG(qr: OutputQr, params: Params<typeof paramsSchema>) {
  const matrixWidth = qr.version * 4 + 17;
  const margin = params["Margin"];
  const fg = params["Foreground"];
  const bg = params["Background"];

  const size = matrixWidth + 2 * margin;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="${bg}"/>`;
  svg += `<path fill="${fg}" d="`;

  for (let y = 0; y < matrixWidth; y++) {
    for (let x = 0; x < matrixWidth; x++) {
      const module = qr.matrix[y * matrixWidth + x];
      if (module & 1) {
        svg += `M${x + margin},${y + margin}h1v1h-1z`;
      }
    }
  }
  svg += `"/></svg>`;

  return svg;
}
