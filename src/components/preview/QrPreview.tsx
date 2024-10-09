import { QrError } from "fuqr";
import Download from "lucide-solid/icons/download";
import { Match, Show, Switch } from "solid-js";
import { useQrContext, type OutputQr } from "~/lib/QrContext";
import {
  ECL_LABELS,
  ECL_NAMES,
  MASK_KEY,
  MODE_KEY,
  MODE_NAMES,
} from "~/lib/options";
import { FlatButton } from "../Button";
import { toastError } from "../ErrorToasts";
import { SplitButton } from "../SplitButton";
import { useRenderContext } from "~/lib/RenderContext";

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
        <Metadata />
        <DownloadButtons />
      </Show>
    </div>
  );
}

function RenderedQrCode() {
  const { render, addSvgParentRef, addCanvasRef, error } = useRenderContext();
  return (
    <>
      <div class="checkboard aspect-[1/1] border rounded-md grid [&>*]:[grid-area:1/1] overflow-hidden">
        <div
          classList={{
            hidden: render()?.type !== "svg",
          }}
          ref={addSvgParentRef}
        ></div>
        <canvas
          classList={{
            "w-full h-full image-render-pixel": true,
            hidden: render()?.type !== "canvas",
          }}
          ref={addCanvasRef}
        ></canvas>
        <Show when={error()}>
          <div class="bg-back-base/50 p-2">{error()}</div>
        </Show>
      </div>
      {/* <Show when={render()?.type === "canvas"}>
        <div class="text-center">
          {canvasDims().width}x{canvasDims().height} px
        </div>
      </Show> */}
    </>
  );
}

function Metadata() {
  const { outputQr } = useQrContext() as { outputQr: () => OutputQr };

  return (
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
  );
}

function DownloadButtons() {
  const { outputQr } = useQrContext() as { outputQr: () => OutputQr };
  const { render, svgParentRefs, canvasRefs } = useRenderContext();

  const filename = () => {
    const s = outputQr().text.slice(0, 32);
    // : and / are not valid filename chars, so it looks bad
    return s.startsWith("https://") ? s.slice(8, 28) : s.slice(0, 20);
  };

  return (
    <div>
      <div class="font-bold text-sm pb-2">Downloads</div>
      <div class="grid grid-cols-2 gap-2">
        <SplitButton
          onClick={async (resizeWidth, resizeHeight) => {
            let outCanvas;
            if (render()?.type === "canvas") {
              if (resizeWidth === 0 && resizeHeight === 0) {
                canvasRefs()[0];
              } else {
                const bmp = await createImageBitmap(canvasRefs()[0], {
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
                new Blob([svgParentRefs()[0].innerHTML], {
                  type: "image/svg+xml",
                })
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
                new Blob([svgParentRefs()[0].innerHTML], {
                  type: "image/svg+xml",
                })
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
  );
}

function download(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
