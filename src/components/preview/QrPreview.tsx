import Download from "lucide-solid/icons/download";
import Share2 from "lucide-solid/icons/share-2";
import Info from "lucide-solid/icons/info";
import { Match, onCleanup, Show, Switch, type JSX } from "solid-js";
import { QrState, useQrContext } from "~/lib/QrContext";
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
  ref: HTMLDivElement;
};

export function QrPreview(props: Props) {
  const { inputQr, output } = useQrContext();

  return (
    <div classList={props.classList} ref={props.ref}>
      <div class="max-w-[300px] md:max-w-full w-full self-center">
        <Show
          when={output().state === QrState.Ready}
          fallback={
            <div class="checkerboard aspect-[1/1] border rounded-md p-2 text-black">
              <Switch>
                <Match when={output().state === QrState.Loading}>
                  <svg
                    viewBox="-12 -12 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        dur="0.75s"
                        values="0 12 12;360 12 12"
                        repeatCount="indefinite"
                      />
                    </path>
                  </svg>
                </Match>
                <Match when={output().state === QrState.ExceedsMaxCapacity}>
                  Data exceeds max capacity
                </Match>
                <Match when={output().state === QrState.InvalidEncoding}>
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
      <DownloadButtons />
      <Metadata class="hidden md:block" />
    </div>
  );
}

function RenderedQrCode() {
  const {
    render,
    error,
    svgParentRefs,
    addSvgParentRef,
    canvasRefs,
    addCanvasRef,
  } = useRenderContext();

  let i = svgParentRefs.length;
  let j = canvasRefs.length;
  onCleanup(() => {
    svgParentRefs.splice(i, 1);
    canvasRefs.splice(j, 1);
  });

  return (
    <>
      <div class="checkerboard aspect-[1/1] border rounded-md grid [&>*]:[grid-area:1/1] overflow-hidden">
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

type MetadataProps = {
  class?: string;
};

function Metadata(props: MetadataProps) {
  const { output } = useQrContext();
  return (
    <div class={props.class}>
      <div class="font-bold text-sm pb-2">QR Metadata</div>
      <Show when={output().state === QrState.Ready}>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="">
            Version
            <div class="font-bold text-base">
              {output().qr!.version} ({output().qr!.version * 4 + 17}x
              {output().qr!.version * 4 + 17} matrix)
            </div>
          </div>
          <div class="">
            Error tolerance{" "}
            <div class="font-bold text-base whitespace-pre">
              {ECL_NAMES[output().qr!.ecl]} ({ECL_LABELS[output().qr!.ecl]})
            </div>
          </div>
          <div class="">
            Mask{" "}
            <span class="font-bold text-base">
              {MASK_KEY[output().qr!.mask]}
            </span>
          </div>
          <div class="">
            Encoding{" "}
            <span class="font-bold text-base">
              {MODE_KEY[output().qr!.mode]}
            </span>
          </div>
        </div>
      </Show>
    </div>
  );
}

function DownloadButtons() {
  const { output } = useQrContext();
  const { render, svgParentRefs, canvasRefs } = useRenderContext();
  const filename = () => output().qr!.text.slice(0, 32);
  const disabled = () => output().state !== QrState.Ready;

  const pngBlob = async (resizeWidth, resizeHeight) => {
    // roughly 20px per module, ranges from 500 to 3620px
    const minWidth = (output().qr!.version * 4 + 17 + 4) * 20;

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
      <div class="font-bold text-sm pb-2 md:hidden">Downloads</div>
      <div class="flex gap-2 md:(grid grid-cols-2)">
        <SplitButton
          disabled={disabled()}
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
        <Show when={render()?.type === "svg"}>
          <FlatButton
            class="hidden md:inline-flex flex-1 justify-center items-center gap-1 px-3 py-2"
            disabled={disabled()}
            onClick={downloadSvg}
          >
            <Download size={20} />
            SVG
          </FlatButton>
        </Show>
        <FlatButton
          class="md:hidden inline-flex justify-center items-center gap-1 px-6 py-2"
          disabled={disabled()}
          title="Share"
          onClick={async () => {
            let blob;
            try {
              blob = await pngBlob(0, 0);
              if (blob == null) throw "toBlob returned null";
            } catch (e) {
              toastError(
                "Failed to create image",
                typeof e === "string" ? e : "pngBlob failed"
              );
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
              if (!navigator.canShare(shareData)) {
                throw new Error();
              }
              navigator.share(shareData);
            } catch (e) {
              console.log(e);
              toastError(
                "Native sharing failed",
                "File sharing not supported by browser"
              );
            }
          }}
        >
          <Share2 size={20} />
        </FlatButton>
        <Popover gutter={4}>
          <Popover.Trigger
            class="md:hidden border rounded-md hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) p-2 disabled:(pointer-events-none opacity-50)"
            disabled={disabled()}
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
