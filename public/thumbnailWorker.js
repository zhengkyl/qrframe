// pre-generated thumbnail qrcode
const PREVIEW_OUTPUTQR = {
  text: "https://qrfra.me",
  // prettier-ignore
  matrix: [3,3,3,3,3,3,3,12,8,1,1,0,0,12,3,3,3,3,3,3,3,3,2,2,2,2,2,3,12,9,1,0,1,1,12,3,2,2,2,2,2,3,3,2,3,3,3,2,3,12,9,0,0,0,0,12,3,2,3,3,3,2,3,3,2,3,3,3,2,3,12,8,0,0,1,1,12,3,2,3,3,3,2,3,3,2,3,3,3,2,3,12,8,0,0,1,0,12,3,2,3,3,3,2,3,3,2,2,2,2,2,3,12,8,0,1,1,0,12,3,2,2,2,2,2,3,3,3,3,3,3,3,3,12,7,6,7,6,7,12,3,3,3,3,3,3,3,12,12,12,12,12,12,12,12,8,1,1,0,0,12,12,12,12,12,12,12,12,8,9,9,9,8,9,7,8,8,0,0,1,1,8,8,8,8,8,9,9,8,1,1,0,1,0,0,6,0,1,1,1,1,1,0,1,1,1,0,0,0,1,1,1,1,1,1,1,7,1,0,0,1,0,0,1,1,1,0,1,0,1,1,1,0,1,0,1,0,6,1,0,1,1,0,1,0,0,1,1,1,0,1,0,1,0,1,0,0,0,7,0,1,0,1,1,0,0,1,1,0,1,0,1,0,12,12,12,12,12,12,12,12,9,0,1,0,1,1,0,0,1,0,0,1,0,3,3,3,3,3,3,3,12,8,1,1,1,0,1,0,1,1,1,0,0,0,3,2,2,2,2,2,3,12,9,1,1,0,1,0,0,1,1,1,1,1,0,3,2,3,3,3,2,3,12,8,0,0,1,1,0,1,1,1,1,1,0,0,3,2,3,3,3,2,3,12,9,1,1,1,0,0,1,0,0,1,1,1,0,3,2,3,3,3,2,3,12,9,1,0,0,1,0,1,0,0,1,1,0,0,3,2,2,2,2,2,3,12,9,1,0,0,0,1,0,0,1,0,0,0,1,3,3,3,3,3,3,3,12,8,1,1,0,0,1,0,0,1,0,1,0,0],
  version: 1,
  ecl: 2, //ECL.Quartile
  mode: 2, // Mode.Byte
  mask: 3, // Mask.M3
};

onmessage = async ({ data: { type, url, params, timeoutId } }) => {
  try {
    switch (type) {
      case "svg": {
        const { renderSVG } = await import(url);
        const svg = await renderSVG(PREVIEW_OUTPUTQR, params);

        postMessage({ type, svg, timeoutId });
        break;
      }
      case "canvas": {
        const { renderCanvas } = await import(url);
        const canvas = new OffscreenCanvas(0, 0);
        await renderCanvas(PREVIEW_OUTPUTQR, params, canvas);

        const bitmap = canvas.transferToImageBitmap();
        postMessage({ type, bitmap, timeoutId }, [bitmap]);
        break;
      }
    }
  } catch (error) {
    postMessage({
      type: "error",
      error,
      timeoutId,
    });
  }
};
