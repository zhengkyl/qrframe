// pre-generated unscannable thumbnail qrcode
const PREVIEW_OUTPUTQR = {
  text: "thumbnail",
  // prettier-ignore
  matrix: [ 5,5,5,5,5,5,5,0,33,2,3,2,3,0,5,5,5,5,5,5,5,5,4,4,4,4,4,5,0,33,3,2,2,3,0,5,4,4,4,4,4,5,5,4,133,133,133,4,5,0,33,2,3,2,2,0,5,4,133,133,133,4,5,5,4,133,133,133,4,5,0,33,3,2,3,2,0,5,4,133,133,133,4,5,5,4,133,133,133,4,5,0,33,2,2,2,2,0,5,4,133,133,133,4,5,5,4,4,4,4,4,5,0,32,2,2,3,2,0,5,4,4,4,4,4,5,5,5,5,5,5,5,5,0,17,16,17,16,17,0,5,5,5,5,5,5,5,0,0,0,0,0,0,0,0,33,3,3,3,2,0,0,0,0,0,0,0,0,32,33,33,32,33,32,17,33,32,2,3,3,3,160,161,160,161,161,161,161,161,2,3,2,2,2,2,16,2,3,2,3,3,2,2,3,2,3,2,3,2,3,3,3,2,3,3,2,17,3,3,2,3,3,2,3,2,3,2,2,2,3,2,3,3,3,2,2,2,16,2,2,3,2,2,3,3,2,3,2,3,2,2,2,2,2,3,3,2,2,17,2,3,3,3,3,3,2,3,2,2,3,3,3,2,0,0,0,0,0,0,0,0,161,2,3,3,3,3,3,2,3,3,2,3,3,5,5,5,5,5,5,5,0,161,3,2,3,2,2,2,3,2,3,2,3,2,5,4,4,4,4,4,5,0,160,2,3,2,2,2,2,2,3,3,2,3,2,5,4,133,133,133,4,5,0,161,2,2,2,3,2,2,3,3,2,3,2,3,5,4,133,133,133,4,5,0,160,3,2,3,2,3,3,2,3,3,3,2,2,5,4,133,133,133,4,5,0,161,2,2,2,2,2,3,3,2,3,2,2,2,5,4,4,4,4,4,5,0,161,3,2,3,2,3,3,2,3,3,2,2,2,5,5,5,5,5,5,5,0,160,3,2,2,2,2,2,2,2,2,3,3,2],
  version: 1,
  ecl: 2, //ECL.Quartile
  mode: 2, // Mode.Byte
  mask: 4, // Mask.M4
};

onmessage = async ({ data: { type,url,params,timeoutId } }) => {
  try {
    switch (type) {
      case "svg": {
        const { renderSVG } = await import(url);
        const svg = await renderSVG(PREVIEW_OUTPUTQR,params);

        postMessage({ type,svg,timeoutId });
        break;
      }
      case "canvas": {
        const { renderCanvas } = await import(url);
        const canvas = new OffscreenCanvas(0,0);
        await renderCanvas(PREVIEW_OUTPUTQR,params,canvas);

        const bitmap = canvas.transferToImageBitmap();
        postMessage({ type,bitmap,timeoutId },[bitmap]);
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
