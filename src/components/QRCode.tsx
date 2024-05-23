import {
  QrOptions,
  SvgBuilder,
  Version,
  get_svg,
  Toggle,
  SvgError,
  SvgResult,
  Mask,
  Mode,
} from "fuqr";

import { FlatButton } from "~/components/Button";
import Download from "lucide-solid/icons/download";
import { Match, Show, Switch, createMemo } from "solid-js";
import { ECL_LABELS, ECL_NAMES, MASK_NAMES, MODE_NAMES } from "~/lib/options";

const PIXELS_PER_MODULE = 20;

type Props = {
  mode: Mode | null;
  mask: Mask | null;
  [key: string]: any;
};
export default function QRCode(props: Props) {
  const svgResult = createMemo(() => {
    console.log("svgResult");
    const qrOptions = new QrOptions()
      .min_version(new Version(props.version))
      .min_ecl(props.ecl)
      // @ts-expect-error null is valid input
      .mask(props.mask)
      // @ts-expect-error null is valid input
      .mode(props.mode);

    let svgOptions = new SvgBuilder()
      .finder_pattern(props.finderPattern)
      .finder_roundness(props.finderRoundness)
      .margin(props.margin)
      .fg_module_size(props.fgModuleSize)
      .bg_module_size(props.bgModuleSize)
      .foreground(props.foreground)
      .background(props.background);

    props.renderedPixels.forEach((v: boolean, i: number) => {
      if (!v) {
        svgOptions = svgOptions.toggle_render(1 + 2 * i);
      }
    });
    props.scaledPixels.forEach((v: boolean, i: number) => {
      if (!v) {
        svgOptions = svgOptions.toggle_scale(1 + 2 * i);
      }
    });

    if (props.invert) {
      svgOptions = svgOptions.toggle(Toggle.Invert);
    }
    if (props.finderForeground) {
      svgOptions = svgOptions.toggle(Toggle.FinderForeground);
    }
    if (props.finderBackground) {
      svgOptions = svgOptions.toggle(Toggle.FinderBackground);
    }
    if (props.backgroundImage) {
      svgOptions = svgOptions.toggle(Toggle.Background);
    }

    try {
      return get_svg(props.input, qrOptions, svgOptions);
    } catch (e) {
      // <Show> doesn't play nicely with unions
      // this requires one "as any" as opposed to 20
      return e as SvgResult;
    }
  });

  function download(href: string, name: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  let bgImg: HTMLImageElement;
  let logoImg: HTMLImageElement;
  const bgSrc = () => URL.createObjectURL(props.backgroundImage);
  const logoSrc = () => URL.createObjectURL(props.logoImage);

  const fullWidth = () => props.version * 4 + 17 + 2 * props.margin;

  const checkerboardPixel = () => (1 / fullWidth()) * 100;
  return (
    <>
      <Show
        when={typeof svgResult() != "number"}
        fallback={
          <div class="aspect-[1/1] border rounded-md flex justify-center items-center">
            <Switch>
              <Match
                when={(svgResult() as any) === SvgError.ExceedsMaxCapacity}
              >
                Data exceeds max capacity
              </Match>
              <Match when={(svgResult() as any) === SvgError.InvalidEncoding}>
                {`Input cannot be encoded in ${
                  // @ts-expect-error props.mode not null b/c InvalidEncoding implies mode
                  MODE_NAMES[props.mode + 1]
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
            "background-size": `${checkerboardPixel()}% ${checkerboardPixel()}%`,
          }}
        >
          <Show when={props.backgroundImage}>
            <img
              src={bgSrc()}
              // @ts-expect-error i'm right
              ref={bgImg}
              class="absolute h-full w-full"
              style={{
                "image-rendering": props.pixelate ? "pixelated" : undefined,
              }}
            />
          </Show>
          <div class="relative" innerHTML={svgResult().svg}></div>
          <Show when={props.logoImage}>
            <img
              class="absolute top-0 bottom-0 left-0 right-0 m-auto"
              src={logoSrc()}
              // @ts-expect-error i'm right
              ref={logoImg}
              style={{
                width: `${props.logoSize}%`,
              }}
            />
          </Show>
        </div>
        <div class="p-4 grid grid-cols-2 gap-y-2 text-sm text-left">
          <div class="">
            Version{" "}
            <span class="font-bold text-base whitespace-pre">
              {svgResult().version["0"]} ({svgResult().version["0"] * 4 + 17}x
              {svgResult().version["0"] * 4 + 17} pixels)
            </span>
          </div>
          <div class="">
            Error tolerance{" "}
            <span class="font-bold text-base whitespace-pre">
              {ECL_NAMES[svgResult().ecl]} ({ECL_LABELS[svgResult().ecl]})
            </span>
          </div>
          <div class="">
            Encoding{" "}
            <span class="font-bold text-base">
              {MODE_NAMES[svgResult().mode + 1]}
            </span>
          </div>
          <div class="">
            Mask{" "}
            <span class="font-bold text-base">
              {MASK_NAMES[svgResult().mask + 1]}
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <FlatButton
            class="flex-1 px-3 py-2"
            onClick={async () => {
              const size = fullWidth() * PIXELS_PER_MODULE;
              const canvas = document.createElement("canvas");
              canvas.width = size;
              canvas.height = size;
              const ctx = canvas.getContext("2d");

              if (props.pixelate) {
                ctx!.imageSmoothingEnabled = false;
              }

              if (props.backgroundImage) {
                const bgImg = new Image();
                bgImg.src = bgSrc();
                await bgImg.decode();
                ctx!.drawImage(bgImg, 0, 0, size, size);
              }

              const svgImg = new Image();
              svgImg.src = `data:image/svg+xml;base64,${btoa(svgResult().svg)}`;
              await svgImg.decode();
              ctx!.drawImage(svgImg, 0, 0, size, size);

              if (props.logoImage) {
                const logoImg = new Image();
                logoImg.src = logoSrc();
                await logoImg.decode();
                const logoSize = props.logoSize * PIXELS_PER_MODULE;
                const offset = (size - logoSize) / 2;
                ctx!.drawImage(logoImg, offset, offset, logoSize, logoSize);
              }

              download(
                canvas.toDataURL("image/png"),
                `${props.input.slice(0, 15).trim()}.svg`
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
                  new Blob([svgResult().svg], { type: "image/svg" })
                ),
                `${props.input.slice(0, 10).trim()}.svg`
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
