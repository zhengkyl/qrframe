import { QrOptions, SvgOptions, Version, get_svg, Toggle } from "fuqr";

import { FlatButton } from "~/components/Button";
import Download from "lucide-solid/icons/download";
import { Show } from "solid-js";

const PIXELS_PER_MODULE = 20;

export default function QRCode(props: any) {
  const svg = () => {
    const qrOptions = new QrOptions()
      .version(new Version(props.version))
      .ecl(props.ecl)
      .mask(props.mask)
      .mode(props.mode);
    let svgOptions = new SvgOptions()
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

    return get_svg(props.input, qrOptions, svgOptions);
  };

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

  return (
    <>
      <div class="aspect-[1/1] border rounded-md relative overflow-hidden">
        <Show when={props.logoImage}>
          <img
            class="absolute top-0 bottom-0 left-0 right-0 m-auto"
            src={logoSrc()}
            // @ts-expect-error i'm right
            ref={logoImg}
            style={{
              width: `${(props.logoSize / fullWidth()) * 100}%`,
            }}
          />
        </Show>
        <Show when={props.backgroundImage}>
          <img
            src={bgSrc()}
            // @ts-expect-error i'm right
            ref={bgImg}
            class="absolute h-full w-full -z-1"
            style={{
              "image-rendering": props.pixelate ? "pixelated" : undefined,
            }}
          />
        </Show>
        <div innerHTML={svg()}></div>
      </div>
      <div class="p-4">Version {props.version}</div>
      <div class="flex gap-2">
        <FlatButton
          class="flex-1 px-3 py-2"
          onClick={async () => {
            const size = fullWidth() * PIXELS_PER_MODULE;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d", { alpha: false });

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
            svgImg.src = `data:image/svg+xml;base64,${btoa(svg())}`;
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
              URL.createObjectURL(new Blob([svg()], { type: "image/svg" })),
              `${props.input.slice(0, 10).trim()}.svg`
            );
          }}
        >
          <Download size={20} />
          SVG
        </FlatButton>
      </div>
    </>
  );
}
