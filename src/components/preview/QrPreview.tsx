import { QrError } from "fuqr";
import Download from "lucide-solid/icons/download";
import Share2 from "lucide-solid/icons/share-2";
import Info from "lucide-solid/icons/info";
import { Match, Show, Switch, type JSX } from "solid-js";
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
import { Popover } from "@kobalte/core/popover";

type Props = {
  classList: JSX.CustomAttributes<HTMLDivElement>["classList"];
  compact: boolean;
};

export function QrPreview(props: Props) {
  const { inputQr, outputQr } = useQrContext();

  return (
    <div classList={props.classList}>
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
        <div classList={{ "max-w-[300px] w-full self-center": props.compact }}>
          <RenderedQrCode />
        </div>
        <DownloadButtons title={!props.compact} compact={props.compact} />
        <Show when={!props.compact}>
          <Metadata />
        </Show>
      </Show>
    </div>
  );
}

function RenderedQrCode() {
  const { render, error, addSvgParentRef, addCanvasRef } = useRenderContext();
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

type DownloadProps = {
  title?: boolean;
  compact: boolean;
};

function DownloadButtons(props: DownloadProps) {
  const { outputQr } = useQrContext() as { outputQr: () => OutputQr };
  const { render, svgParentRefs, canvasRefs } = useRenderContext();

  const filename = () => outputQr().text.slice(0, 32);

  const pngBlob = async (resizeWidth, resizeHeight) => {
    // 10px per module assuming 2 module margin
    const minWidth = (outputQr().version * 4 + 17 + 4) * 10;

    let outCanvas: HTMLCanvasElement;
    if (render()?.type === "canvas") {
      if (resizeWidth === 0 && resizeHeight === 0) {
        const size = Math.max(canvasRefs[0].width, minWidth);
        resizeWidth = size;
        resizeHeight = size;
      }
      // less blurry than ctx.drawImage w/ imageSmoothingEnabled = false
      const bitmap = await createImageBitmap(canvasRefs[0], {
        // resizeQuality not supported in ff, but output is passable
        resizeQuality: "pixelated",
        resizeWidth,
        resizeHeight,
      });
      outCanvas = document.createElement("canvas");
      outCanvas.width = resizeWidth;
      outCanvas.height = resizeHeight;
      const ctx = outCanvas.getContext("bitmaprenderer")!;
      ctx.transferFromImageBitmap(bitmap);
    } else {
      if (resizeWidth === 0 && resizeHeight === 0) {
        resizeWidth = minWidth;
        resizeHeight = minWidth;
      }
      outCanvas = document.createElement("canvas");
      outCanvas.width = resizeWidth;
      outCanvas.height = resizeHeight;
      const ctx = outCanvas.getContext("2d")!;

      const url = URL.createObjectURL(
        new Blob([svgParentRefs[0].innerHTML], {
          type: "image/svg+xml",
        })
      );
      const img = new Image();
      img.src = url;
      await img.decode();
      ctx.drawImage(img, 0, 0, resizeWidth, resizeHeight);
      URL.revokeObjectURL(url);
    }

    return new Promise((resolve) =>
      outCanvas.toBlob(resolve)
    ) as Promise<Blob | null>;
  };

  const downloadSvg = async () => {
    const url = URL.createObjectURL(
      new Blob([svgParentRefs[0].innerHTML], {
        type: "image/svg+xml",
      })
    );
    download(url, `${filename()}.svg`);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <Show when={props.title}>
        <div class="font-bold text-sm pb-2">Downloads</div>
      </Show>
      <div class={props.compact ? "flex gap-2" : "grid grid-cols-2 gap-2"}>
        <SplitButton
          compact={props.compact}
          onPng={async (resizeWidth, resizeHeight) => {
            try {
              const blob = await pngBlob(resizeWidth, resizeHeight);
              if (blob == null) throw "toBlob returned null";

              const url = URL.createObjectURL(blob);
              download(url, `${filename()}.png`);
              URL.revokeObjectURL(url);
            } catch (e) {
              toastError("Failed to create image", e as string);
              return;
            }
          }}
          onSvg={downloadSvg}
        />
        <Show when={!props.compact && render()?.type === "svg"}>
          <FlatButton
            class="flex-1 inline-flex justify-center items-center gap-1 px-3 py-2"
            onClick={downloadSvg}
          >
            <Download size={20} />
            SVG
          </FlatButton>
        </Show>
        <Show when={props.compact}>
          <FlatButton
            class="inline-flex justify-center items-center gap-1 px-6 py-2"
            title="Share"
            onClick={async () => {
              let blob;
              try {
                blob = await pngBlob(0, 0);
                if (blob == null) throw "toBlob returned null";
              } catch (e) {
                toastError("Failed to create image", e as string);
                return;
              }
              try {
                const shareData = {
                  files: [
                    new File([blob], `${filename()}.png`, {
                      type: "image/png",
                    }),
                  ],
                };
                navigator.share(shareData);
              } catch (e) {
                console.log(e);
                toastError(
                  "Native sharing failed",
                  "Unsupported in this browser"
                );
              }
            }}
          >
            <Share2 size={20} />
          </FlatButton>
        </Show>
        <Show when={props.compact}>
          <Popover gutter={4}>
            <Popover.Trigger
              class="border rounded-md hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) p-2"
              title="QR Metadata"
            >
              <Info size={20} />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content class="z-50 bg-back-base rounded-md border p-2 outline-none min-w-150px leading-tight">
                <Metadata />
              </Popover.Content>
            </Popover.Portal>
          </Popover>
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
