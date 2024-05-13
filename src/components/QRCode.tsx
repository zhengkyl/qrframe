import { QrOptions, SvgOptions, Version, get_svg } from "fuqr";

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
      .module_size(props.moduleSize)
      .foreground(props.foreground)
      .background(props.background);

    props.renderedPixels.forEach((v: boolean, i: number) => {
      if (!v) {
        svgOptions = svgOptions.toggle_modules(1 + 2 * i);
      }
    });

    if (props.negative) {
      svgOptions = svgOptions.toggle_negative();
    }
    if (props.invert) {
      svgOptions = svgOptions.toggle_invert();
    }
    if (props.backgroundImage) {
      svgOptions = svgOptions.toggle_background();
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
  const bgSrc = () => URL.createObjectURL(props.backgroundImage);

  return (
    <>
      <div class="aspect-[1/1] border rounded-md relative overflow-hidden">
        <Show when={props.backgroundImage}>
          {/* @ts-expect-error i'm right */}
          <img src={bgSrc()} ref={bgImg} class="absolute h-full w-full -z-1" />
        </Show>
        <div innerHTML={svg()}></div>
      </div>
      <div class="p-4">Version {props.version}</div>
      <div class="flex gap-2">
        <FlatButton
          class="flex-1 px-3 py-2"
          onClick={() => {
            const size = (4 * props.version + 17) * PIXELS_PER_MODULE;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d", { alpha: false });

            const drawSvg = () => {
              const svgImg = new Image();
              svgImg.addEventListener("load", () => {
                ctx!.drawImage(svgImg, 0, 0, size, size);
                download(
                  canvas.toDataURL("image/png"),
                  `${props.input.slice(0, 10).trim()}.svg`
                );
              });
              svgImg.src = `data:image/svg+xml;base64,${btoa(svg())}`;
            };

            if (props.backgroundImage) {
              const bgImg = new Image();
              bgImg.addEventListener("load", () => {
                ctx!.drawImage(bgImg, 0, 0, size, size);
                drawSvg();
              });
              bgImg.src = URL.createObjectURL(props.backgroundImage);
            } else {
              drawSvg();
            }
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
