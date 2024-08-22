let prevToken = { canceled: true };

onmessage = async ({ data: { type, url, qr, params, timeoutId } }) => {
  prevToken.canceled = true;
  const token = { canceled: false };
  prevToken = token;

  try {
    switch (type) {
      case "svg": {
        const { renderSVG } = await import(url);
        const svg = await renderSVG(qr, params);
        if (token.canceled) {
          return postMessage({ type: "canceled", timeoutId });
        }

        postMessage({ type, svg, timeoutId });
        break;
      }
      case "canvas": {
        const { renderCanvas } = await import(url);
        const canvas = new OffscreenCanvas(0, 0);
        await renderCanvas(qr, params, canvas);
        if (token.canceled) {
          return postMessage({ type: "canceled", timeoutId });
        }

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
