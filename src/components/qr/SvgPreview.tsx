import {
  QrOptions,
  SvgOptions,
  Version,
  get_svg,
  SvgError,
  SvgResult,
} from "fuqr";

import { FlatButton } from "~/components/Button";
import Download from "lucide-solid/icons/download";
import { Match, Show, Switch, createMemo, createSignal } from "solid-js";
import {
  ECL_LABELS,
  ECL_NAMES,
  MASK_KEY,
  MODE_KEY,
  MODE_NAMES,
} from "~/lib/options";
import { createStore } from "solid-js/store";
import { RenderGrid } from "../RenderGrid";
import { useQrContext } from "~/lib/QrContext";
import { useSvgContext } from "~/lib/SvgContext";

const PIXELS_PER_MODULE = 20;

export default function SvgPreview() {
  const { inputQr } = useQrContext();

  const { svgOptions } = useSvgContext();

  const [grid, setGrid] = createStore(Array(177 * 177).fill(100));
  const svgResult = createMemo(() => {
    console.log("svgResult", inputQr);
    const qrOptions = new QrOptions()
      .min_version(new Version(inputQr.minVersion))
      .min_ecl(inputQr.minEcl)
      .mask(inputQr.mask!) // null makes more sense than undefined
      .mode(inputQr.mode!); // null makes more sense than undefined

    let svgOpts = new SvgOptions()
      // .finder_pattern(props.finderPattern)
      // .finder_roundness(props.finderRoundness)
      // .margin(margin)
      .foreground(svgOptions.fgColor)
      .background(svgOptions.bgColor)
      .scale_matrix(grid);

    let t;
    try {
      t = get_svg(inputQr.text, qrOptions, svgOpts);
    } catch (e) {
      // <Show> doesn't play nicely with unions
      // this requires one "as any" instead of 20
      t = e as SvgResult;
    }
    console.log(typeof t);
    return t;
  });

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

  const fullWidth = () =>
    svgResult().version["0"] * 4 + 17 + 2 * svgOptions.margin;

  const checkerboardPixel = () => (1 / fullWidth()) * 100;

  const [color, setColor] = createSignal(0);

  // createEffect(() => {
  //   console.log("effect", svgResult());
  // });

  return (
    <>
      <Show
        when={typeof svgResult() != "number" && svgResult() != null}
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
          <div class="relative" innerHTML={svgResult().svg}></div>
          <Show when={svgOptions.fgImgFile != null}>
            <img
              class="absolute top-0 bottom-0 left-0 right-0 m-auto"
              src={logoSrc()}
              ref={fgImg}
              style={{
                // TODO
                width: `${25}%`,
                "image-rendering": svgOptions.pixelateFgImg
                  ? "pixelated"
                  : undefined,
              }}
            />
          </Show>
          <RenderGrid
            width={fullWidth()}
            height={fullWidth()}
            color={color()}
            grid={grid}
            setGrid={setGrid}
          />
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
              {MODE_KEY[svgResult().mode]}
            </span>
          </div>
          <div class="">
            Mask{" "}
            <span class="font-bold text-base">
              {MASK_KEY[svgResult().mask]}
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

              if (svgOptions.bgImgFile != null) {
                ctx!.imageSmoothingEnabled = !svgOptions.pixelateBgImg;
                const bgImg = new Image();
                bgImg.src = bgSrc();
                await bgImg.decode();
                ctx!.drawImage(bgImg, 0, 0, size, size);
              }

              const svgImg = new Image();
              svgImg.src = `data:image/svg+xml;base64,${btoa(svgResult().svg)}`;
              await svgImg.decode();
              ctx!.drawImage(svgImg, 0, 0, size, size);

              if (svgOptions.fgImgFile != null) {
                ctx!.imageSmoothingEnabled = !svgOptions.pixelateFgImg;
                const logoImg = new Image();
                logoImg.src = logoSrc();
                await logoImg.decode();
                // TODO logoSize
                const logoSize = (fullWidth() / 4) * PIXELS_PER_MODULE;
                const offset = (size - logoSize) / 2;
                ctx!.drawImage(logoImg, offset, offset, logoSize, logoSize);
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
                  new Blob([svgResult().svg], { type: "image/svg" })
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
