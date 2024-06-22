import { QrError } from "fuqr";

import Download from "lucide-solid/icons/download";
import { Match, Show, Switch, createSignal } from "solid-js";
import { FlatButton } from "~/components/Button";
import { useQrContext, type OutputQr } from "~/lib/QrContext";
import { useSvgContext } from "~/lib/SvgContext";
import {
  ECL_LABELS,
  ECL_NAMES,
  MASK_KEY,
  MODE_KEY,
  MODE_NAMES,
} from "~/lib/options";
import { RenderGrid } from "../RenderGrid";

const PIXELS_PER_MODULE = 20;

export default function SvgPreview() {
  const { inputQr, outputQr, setOutputQr } = useQrContext();
  const { svgOptions, svgResult, logoSize } = useSvgContext();

  function download(href: string, name: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  let bgImg!: HTMLImageElement;
  let fgImg!: HTMLImageElement;

  const bgSrc = () => URL.createObjectURL(svgOptions.bgImgFile!);
  const logoSrc = () => URL.createObjectURL(svgOptions.fgImgFile!);

  const fullWidth = () => {
    const output = outputQr() as OutputQr;
    return output.version * 4 + 17 + output.margin.left + output.margin.right;
  };
  const fullHeight = () => {
    const output = outputQr() as OutputQr;
    return output.version * 4 + 17 + output.margin.top + output.margin.bottom;
  };

  const [color, setColor] = createSignal(0);

  return (
    <>
      <Show
        when={svgResult() != null}
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
          <Show when={svgOptions.bgImgFile != null}>
            <img
              src={bgSrc()}
              ref={bgImg}
              class="absolute h-full w-full"
              style={{
                "image-rendering": svgOptions.pixelateBgImg
                  ? "pixelated"
                  : undefined,
              }}
            />
          </Show>
          <div class="relative" innerHTML={svgResult()!.svg}></div>
          <Show when={svgOptions.fgImgFile != null}>
            <img
              class="absolute top-0 bottom-0 left-0 right-0 m-auto"
              src={logoSrc()}
              ref={fgImg}
              style={{
                width: `${logoSize()}%`,
                "image-rendering": svgOptions.pixelateFgImg
                  ? "pixelated"
                  : undefined,
              }}
            />
          </Show>
          <RenderGrid
            width={fullWidth()}
            height={fullHeight()}
            color={color()}
          />
        </div>
        <div class="p-4 grid grid-cols-2 gap-y-2 text-sm text-left">
          <div class="">
            Version{" "}
            <span class="font-bold text-base whitespace-pre">
              {svgResult()!.version["0"]} ({svgResult()!.version["0"] * 4 + 17}x
              {svgResult()!.version["0"] * 4 + 17} pixels)
            </span>
          </div>
          <div class="">
            Error tolerance{" "}
            <span class="font-bold text-base whitespace-pre">
              {ECL_NAMES[svgResult()!.ecl]} ({ECL_LABELS[svgResult()!.ecl]})
            </span>
          </div>
          <div class="">
            Encoding{" "}
            <span class="font-bold text-base">
              {MODE_KEY[svgResult()!.mode]}
            </span>
          </div>
          <div class="">
            Mask{" "}
            <span class="font-bold text-base">
              {MASK_KEY[svgResult()!.mask]}
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <FlatButton
            class="flex-1 px-3 py-2"
            onClick={async () => {
              const width = fullWidth() * PIXELS_PER_MODULE;
              const height = fullHeight() * PIXELS_PER_MODULE;
              const canvas = document.createElement("canvas");
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");

              if (svgOptions.bgImgFile != null) {
                ctx!.imageSmoothingEnabled = !svgOptions.pixelateBgImg;
                const bgImg = new Image();
                bgImg.src = bgSrc();
                await bgImg.decode();
                ctx!.drawImage(bgImg, 0, 0, width, height);
              }

              const svgImg = new Image();
              svgImg.src = `data:image/svg+xml;base64,${btoa(
                svgResult()!.svg
              )}`;
              await svgImg.decode();
              ctx!.drawImage(svgImg, 0, 0, width, height);

              if (svgOptions.fgImgFile != null) {
                ctx!.imageSmoothingEnabled = !svgOptions.pixelateFgImg;
                const logoImg = new Image();
                logoImg.src = logoSrc();
                await logoImg.decode();
                const logoWidth = (fullWidth() / 4) * PIXELS_PER_MODULE;
                const logoHeight =
                  (logoWidth * logoImg.naturalHeight) / logoImg.naturalWidth;
                const xOffset = (width - logoWidth) / 2;
                const yOffset = (height - logoHeight) / 2;

                ctx!.drawImage(
                  logoImg,
                  xOffset,
                  yOffset,
                  logoWidth,
                  logoHeight
                );
              }

              download(
                canvas.toDataURL("image/png"),
                `${inputQr.text.slice(0, 15).trim()}.svg`
              );
            }}
          >
            <Download size={20} />
            Download PNG
          </FlatButton>
          <FlatButton
            onClick={() => {
              download(
                URL.createObjectURL(
                  new Blob([svgResult()!.svg], { type: "image/svg" })
                ),
                `${inputQr.text.slice(0, 10).trim()}.svg`
              );
            }}
          >
            <Download size={20} />
            SVG
          </FlatButton>
        </div>
      </Show>
    </>
  );
}
