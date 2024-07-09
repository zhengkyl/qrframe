import { QrError } from "fuqr";

import { Match, Show, Switch, createEffect, createSignal, untrack } from "solid-js";
import { useQrContext, type OutputQr } from "~/lib/QrContext";
import {
  ECL_LABELS,
  ECL_NAMES,
  MASK_KEY,
  MODE_KEY,
  MODE_NAMES,
} from "~/lib/options";
import { FlatButton } from "../Button";
import Download from "lucide-solid/icons/download";

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
  const { inputQr, outputQr, renderFuncKey } = useQrContext();

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
  const { outputQr: _outputQr, renderFunc, renderFuncKey } = useQrContext();
  const outputQr = _outputQr as () => OutputQr;

  const fullWidth = () => {
    const output = outputQr();
    return output.version * 4 + 17 + output.margin.left + output.margin.right;
  };
  const fullHeight = () => {
    const output = outputQr();
    return output.version * 4 + 17 + output.margin.top + output.margin.bottom;
  };

  let qrCanvas: HTMLCanvasElement;

  const [runtimeError, setRuntimeError] = createSignal<string | null>(null);
  const [cleanupError, setCleanupError] = createSignal<string | null>(null);

  const [canvasDims, setCanvasDims] = createSignal({ width: 0, height: 0 });

  let cleanupFunc: void | (() => void);
  let cleanupFuncKey = ""
  let prevFuncKey = ""

  createEffect(() => {
    try {
      if (typeof cleanupFunc === "function") {
        cleanupFunc();
      }
      setCleanupError(null);
    } catch (e) {
      setCleanupError(e!.toString());
      cleanupFuncKey = prevFuncKey
      console.error(`${cleanupFuncKey} cleanup:`, e)
    }

    const ctx = qrCanvas.getContext("2d")!;
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);

    prevFuncKey = untrack(renderFuncKey)
    try {
      cleanupFunc = renderFunc()(outputQr(), ctx);
      setRuntimeError(null);
    } catch (e) {
      setRuntimeError(e!.toString());
      console.error(`${prevFuncKey} render:`, e)
    }

    setCanvasDims({ width: qrCanvas.width, height: qrCanvas.height });
  });

  return (
    <>
      <div
        class="aspect-[1/1] border rounded-md relative overflow-hidden"
        style={{
          "background-image":
            "repeating-conic-gradient(#ddd 0% 25%, #aaa 25% 50%)",
          "background-position": "50%",
          "background-size": `${(1 / fullWidth()) * 100}% ${
            (1 / fullHeight()) * 100
          }%`,
        }}
      >
        <canvas class="w-full h-full" ref={qrCanvas!}></canvas>
      </div>
      <Show when={cleanupError() != null}>
        <div class="text-purple-100 bg-purple-950 px-2 py-1 rounded-md">
          <div class="font-bold">{cleanupFuncKey} cleanup</div>
          {cleanupError()}
        </div>
      </Show>
      <Show when={runtimeError() != null}>
        <div class="text-red-100 bg-red-950 px-2 py-1 rounded-md">
          {runtimeError()}
        </div>
      </Show>
      <div class="text-center">
        {canvasDims().width}x{canvasDims().height} px
      </div>
      <div class="px-2 grid grid-cols-3 gap-y-2 text-sm">
        <div class="">
          Version <span class="font-bold text-base">{outputQr().version}</span>
        </div>
        <div class="">
          Mask{" "}
          <span class="font-bold text-base">{MASK_KEY[outputQr().mask]}</span>
        </div>
        <div class="">
          Encoding{" "}
          <span class="font-bold text-base">{MODE_KEY[outputQr().mode]}</span>
        </div>
        <div class="">
          Symbol size{" "}
          <div class="font-bold text-base whitespace-pre">
            {outputQr().version * 4 + 17}x{outputQr().version * 4 + 17}
          </div>
        </div>
        <div class="">
          Size incl. margin{" "}
          <div class="font-bold text-base whitespace-pre">
            {outputQr().matrixWidth}x{outputQr().matrixHeight}
          </div>
        </div>
        <div class="">
          Error tolerance{" "}
          <div class="font-bold text-base whitespace-pre">
            {ECL_NAMES[outputQr().ecl]} ({ECL_LABELS[outputQr().ecl]})
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <FlatButton
          class="inline-flex justify-center items-center gap-1 flex-1 px-3 py-2"
          onClick={async () => {
            download(
              qrCanvas.toDataURL("image/png"),
              `${outputQr().text.slice(0, 15).trim()}.png`
            );
          }}
        >
          <Download size={20} />
          Download PNG
        </FlatButton>
      </div>
    </>
  );
}
