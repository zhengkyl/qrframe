import { QrError } from "fuqr";
import Download from "lucide-solid/icons/download";
import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  untrack,
} from "solid-js";
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
                  // @ts-expect-error props.mode not null b/c InvalidEncoding implies mode
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
    getRenderSVG,
    getRenderCanvas,
    renderFuncKey,
    params,
    paramsSchema,
  } = useQrContext();
  const outputQr = _outputQr as () => OutputQr;

  let svgParent: HTMLDivElement;
  let canvas: HTMLCanvasElement;

  const [runtimeError, setRuntimeError] = createSignal<string | null>(null);

  const [canvasDims, setCanvasDims] = createSignal({ width: 0, height: 0 });

  let prevFuncKey = "";

  let renderCount = 0;
  createEffect(async () => {
    const render = getRenderSVG();
    const fallbackRender = getRenderCanvas();

    // Track store without passing store into function and leaking extra params
    const paramsCopy: Params = {};
    Object.keys(paramsSchema()).forEach((key) => {
      paramsCopy[key] = params[key];
    });

    if (render == null && fallbackRender == null) return; // only true on page load
    const currentRender = ++renderCount;

    console.log("render run", currentRender);

    prevFuncKey = untrack(renderFuncKey);
    try {
      // users can arbitrarily manipulate function args
      // outputQr (big) is frozen, and params (small) is copied

      if (render != null) {
        const svgString = await render(outputQr(), paramsCopy);
        if (currentRender !== renderCount) {
          // unrealistic, but easy to prevent race conditions
          return;
        }

        // alternative if need to manipulate nodes
        // const frag = document.createRange().createContextualFragment(svgString)
        svgParent.innerHTML = svgString;
      } else {
        const ctx = canvas.getContext("2d")!;
        ctx.reset();

        // race condition is unrealistic (maybe with http requests)
        // and can't be solved without double buffering
        await fallbackRender!(outputQr(), paramsCopy, ctx);
      }

      setRuntimeError(null);
    } catch (e) {
      setRuntimeError(e!.toString());
      console.error(`${prevFuncKey} render:`, e);
    }
  });

  return (
    <>
      <div class="checkboard aspect-[1/1] border rounded-md relative overflow-hidden">
        <Show when={getRenderSVG() != null}>
          <div ref={svgParent!}></div>
        </Show>
        <Show when={getRenderCanvas() != null}>
          <canvas
            class="w-full h-full image-render-pixel"
            ref={canvas!}
          ></canvas>
        </Show>
      </div>
      <Show when={runtimeError() != null}>
        <div class="text-red-100 bg-red-950 px-2 py-1 rounded-md">
          {runtimeError()}
        </div>
      </Show>
      <div class="text-center">
        {canvasDims().width}x{canvasDims().height} px
      </div>
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
            download(
              canvas.toDataURL("image/png"),
              `${outputQr().text.slice(0, 15).trim()}.png`
            );
          }}
        >
          <Download size={20} />
          Download PNG
        </FlatButton>
        <Show when={getRenderSVG() != null}>
          <FlatButton
            class="inline-flex justify-center items-center gap-1 flex-1 px-3 py-2"
            onClick={async () => {
              download(
                URL.createObjectURL(
                  new Blob([svgParent.innerHTML], { type: "image/svg" })
                ),
                `${outputQr().text.slice(0, 15).trim()}.svg`
              );
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
