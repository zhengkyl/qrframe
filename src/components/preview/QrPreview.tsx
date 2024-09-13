import { QrError } from "fuqr";
import Download from "lucide-solid/icons/download";
import { Match, Show, Switch, createEffect, createSignal } from "solid-js";
import { useQrContext, type OutputQr } from "~/lib/QrContext";
import {
  ECL_LABELS,
  ECL_NAMES,
  MASK_KEY,
  MODE_KEY,
  MODE_NAMES,
} from "~/lib/options";
import type { Params } from "~/lib/params";
import { FlatButton } from "../Button";
import { toastError } from "../ErrorToasts";
import { unwrap } from "solid-js/store";
import { SplitButton } from "../SplitButton";

function download(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

type Props = {
  class?: string;
};

export default function QrPreview(props: Props) {
  const { inputQr, outputQr } = useQrContext();

  return (
    <div class={props.class}>
      <Show
        when={typeof outputQr() !== "number"}
        fallback={
          <div class="aspect-[1/1] border rounded-md p-2">
            <Switch>
              <Match when={outputQr() === QrError.ExceedsMaxCapacity}>
                Data exceeds max capacity
              </Match>
              <Match when={outputQr() === QrError.InvalidEncoding}>
                {`Input cannot be encoded in ${
                  // @ts-expect-error props.mode not null b/c InvalidEncoding requires mode
                  MODE_NAMES[inputQr.mode + 1]
                } mode`}
              </Match>
            </Switch>
          </div>
        }
      >
        <RenderedQrCode />
      </Show>
    </div>
  );
}

/** This component assumes outputQr() is not QrError, this simplifies effects and types
 *
 *  Original problem:
 *  When using Show, effects tracking the when signal run before refs inside Show become valid.
 *  The result was no effect running after initial mount, so no render.
 *  Running the effect in the ref function caused double rendering for future mounts.
 */
function RenderedQrCode() {
  const {
    outputQr: _outputQr,
    render,
    params,
    paramsSchema,
    error,
    setError,
  } = useQrContext();
  const outputQr = _outputQr as () => OutputQr;

  let svgParent: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  const [canvasDims, setCanvasDims] = createSignal({ width: 0, height: 0 });

  let worker: Worker | null = null;
  const timeoutIdSet = new Set<NodeJS.Timeout>();

  createEffect(async () => {
    const r = render();

    // Track store without leaking extra params
    const paramsCopy: Params = {};
    const unwrapped = unwrap(params);
    Object.keys(paramsSchema()).forEach((key) => {
      paramsCopy[key] = unwrapped[key];

      // access to track
      params[key];
      if (Array.isArray(unwrapped[key])) {
        params[key].forEach((_: any) => {});
      }
    });

    // all reactive deps must be above early return!
    // true on page load
    if (r == null) return;

    if (worker == null) setupWorker();

    const timeoutId = setTimeout(() => {
      console.error(
        `Preview took longer than 5 seconds, timed out!`,
        timeoutId
      );
      timeoutIdSet.delete(timeoutId);
      if (worker != null) {
        worker.terminate();
        worker = null;
      }
    }, 5000);
    timeoutIdSet.add(timeoutId);

    worker!.postMessage({
      type: r.type,
      url: r.url,
      qr: outputQr(),
      params: paramsCopy,
      timeoutId,
    });

    return () => {
      worker?.terminate();
      timeoutIdSet.forEach((timeout) => clearTimeout(timeout));
    };
  });

  const setupWorker = () => {
    console.log("Starting previewWorker");
    worker = new Worker("previewWorker.js", { type: "module" });

    worker.onmessage = (e) => {
      clearTimeout(e.data.timeoutId);
      timeoutIdSet.delete(e.data.timeoutId);

      switch (e.data.type) {
        case "svg":
          svgParent.innerHTML = e.data.svg;
          setError(null);
          break;
        case "canvas":
          canvas
            .getContext("bitmaprenderer")!
            .transferFromImageBitmap(e.data.bitmap);
          setCanvasDims({ width: canvas.width, height: canvas.height });
          setError(null);
          break;
        case "error":
          console.error(e.data.error);
          setError(e.data.error.toString());
          break;
        // case "canceled":
        //   break;
      }
    };
  };

  const filename = () => {
    const s = outputQr().text.slice(0, 32);
    // : and / are not valid filename chars, so it looks bad
    return s.startsWith("https://") ? s.slice(8, 28) : s.slice(0, 20);
  };

  return (
    <>
      <div class="checkboard aspect-[1/1] border rounded-md grid [&>*]:[grid-area:1/1] overflow-hidden">
        <Switch>
          <Match when={render()?.type === "svg"}>
            <div ref={svgParent!}></div>
          </Match>
          <Match when={render()?.type === "canvas"}>
            <canvas
              class="w-full h-full image-render-pixel"
              ref={canvas!}
            ></canvas>
          </Match>
        </Switch>
        <Show when={error()}>
          <div class="bg-back-base/50 p-2">{error()}</div>
        </Show>
      </div>
      <Show when={render()?.type === "canvas"}>
        <div class="text-center">
          {canvasDims().width}x{canvasDims().height} px
        </div>
      </Show>
      <div>
        <div class="font-bold text-sm pb-2">Downloads</div>
        <div class="grid grid-cols-2 gap-2">
          <SplitButton
            onClick={async (resizeWidth, resizeHeight) => {
              let outCanvas;
              if (render()?.type === "canvas") {
                if (resizeWidth === 0 && resizeHeight === 0) {
                  outCanvas = canvas;
                } else {
                  const bmp = await createImageBitmap(canvas, {
                    // resizeQuality unsupported in ff 8/31/24
                    // https://developer.mozilla.org/en-US/docs/Web/API/createImageBitmap
                    resizeQuality: "pixelated",
                    resizeWidth,
                    resizeHeight,
                  });
                  outCanvas = document.createElement("canvas");
                  outCanvas.width = resizeWidth;
                  outCanvas.height = resizeHeight;
                  const ctx = outCanvas.getContext("bitmaprenderer")!;
                  ctx.transferFromImageBitmap(bmp);
                }
              } else {
                if (resizeWidth === 0 && resizeHeight === 0) {
                  resizeWidth = 300;
                  resizeHeight = 300;
                }
                outCanvas = document.createElement("canvas");
                outCanvas.width = resizeWidth;
                outCanvas.height = resizeHeight;
                const ctx = outCanvas.getContext("2d")!;

                const url = URL.createObjectURL(
                  new Blob([svgParent.innerHTML], { type: "image/svg+xml" })
                );
                const img = new Image();
                img.src = url;
                await img.decode();
                ctx.drawImage(img, 0, 0, resizeWidth, resizeHeight);
                URL.revokeObjectURL(url);
              }

              outCanvas.toBlob((blob) => {
                if (blob == null) {
                  toastError(
                    "Failed to create image",
                    "idk bro this shouldn't happen"
                  );
                  return;
                }
                const url = URL.createObjectURL(blob);
                download(url, `${filename()}.png`);
                URL.revokeObjectURL(url);
              });
            }}
          />
          <Show when={render()?.type === "svg"}>
            <FlatButton
              class="inline-flex justify-center items-center gap-1 px-6 py-2"
              onClick={async () => {
                const url = URL.createObjectURL(
                  new Blob([svgParent.innerHTML], { type: "image/svg+xml" })
                );
                download(url, `${filename()}.svg`);
                URL.revokeObjectURL(url);
              }}
            >
              <Download size={20} />
              SVG
            </FlatButton>
          </Show>
        </div>
      </div>
      <div>
        <div class="font-bold text-sm pb-2">QR Metadata</div>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="">
            Version
            <div class="font-bold text-base">
              {outputQr().version} ({outputQr().version * 4 + 17}x
              {outputQr().version * 4 + 17} matrix)
            </div>
          </div>
          <div class="">
            Error tolerance{" "}
            <div class="font-bold text-base whitespace-pre">
              {ECL_NAMES[outputQr().ecl]} ({ECL_LABELS[outputQr().ecl]})
            </div>
          </div>
          <div class="">
            Mask{" "}
            <span class="font-bold text-base">{MASK_KEY[outputQr().mask]}</span>
          </div>
          <div class="">
            Encoding{" "}
            <span class="font-bold text-base">{MODE_KEY[outputQr().mode]}</span>
          </div>
        </div>
      </div>
    </>
  );
}
