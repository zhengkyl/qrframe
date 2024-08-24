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
import { clearToasts, toastError } from "../ErrorToasts";

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
          <div class="aspect-[1/1] border rounded-md flex justify-center items-center">
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
    renderKey,
    params,
    paramsSchema,
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
    Object.keys(paramsSchema()).forEach((key) => {
      paramsCopy[key] = params[key];
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
          clearToasts();
          break;
        case "canvas":
          canvas
            .getContext("bitmaprenderer")!
            .transferFromImageBitmap(e.data.bitmap);
          setCanvasDims({ width: canvas.width, height: canvas.height });
          clearToasts();
          break;
        case "error":
          toastError("Render failed", e.data.error.toString());
          console.error(e.data.error);
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
      <div class="checkboard aspect-[1/1] border rounded-md relative overflow-hidden">
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
      </div>
      <Show when={render()?.type === "canvas"}>
        <div class="text-center">
          {canvasDims().width}x{canvasDims().height} px
        </div>
      </Show>
      <div class="px-2 grid grid-cols-2 gap-y-2 text-sm">
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
      <div class="flex gap-2">
        <FlatButton
          class="inline-flex justify-center items-center gap-1 flex-1 px-3 py-2"
          onClick={async () => {
            if (canvas != null) {
              download(canvas.toDataURL("image/png"), `${filename()}.png`);
            } else {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d")!;
              // TODO allow adjust resolution/aspect ratio
              const size = 300; //(outputQr().version * 4 + 17) * 10;
              canvas.width = size;
              canvas.height = size;

              const url = URL.createObjectURL(
                new Blob([svgParent.innerHTML], { type: "image/svg+xml" })
              );
              const img = new Image();
              img.src = url;
              await img.decode();
              ctx.drawImage(img, 0, 0, size, size);

              download(canvas.toDataURL("image/png"), `${filename()}.png`);
              URL.revokeObjectURL(url);
            }
          }}
        >
          <Download size={20} />
          Download PNG
        </FlatButton>
        <Show when={render()?.type === "svg"}>
          <FlatButton
            class="inline-flex justify-center items-center gap-1 flex-1 px-3 py-2"
            onClick={async () => {
              const url = URL.createObjectURL(
                new Blob([svgParent.innerHTML], { type: "image/svg+xml" })
              );
              download(url, `${filename()}.svg`);
              URL.revokeObjectURL(url);
            }}
          >
            <Download size={20} />
            Download SVG
          </FlatButton>
        </Show>
      </div>
    </>
  );
}
