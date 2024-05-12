import { QrOptions, SvgOptions, Version, get_svg } from "fuqr";

import { FlatButton } from "~/components/Button";
import Download from "lucide-solid/icons/download";

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
        svgOptions = svgOptions.toggle_render_modules(1 + 2 * i);
      }
    });

    if (props.invertSVG) {
      svgOptions = svgOptions.toggle_invert_modules();
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

  return (
    <>
      <div
        class="aspect-[1/1] border rounded-md overflow-hidden"
        innerHTML={svg()}
      ></div>
      <div class="p-4">Version {props.version}</div>
      <div class="flex gap-2">
        <FlatButton
          class="flex-1"
          onClick={() => {
            const size = (4 * props.version + 17) * 20;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            ctx!.imageSmoothingEnabled = false;
            const image = new Image();
            image.addEventListener("load", () => {
              ctx!.drawImage(image, 0, 0, size, size);
              download(
                canvas.toDataURL("image/png"),
                `${props.input.slice(0, 10).trim()}.svg`
              );
            });
            image.src = `data:image/svg+xml;base64,${btoa(svg())}`;
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
