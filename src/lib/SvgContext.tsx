import {
  createContext,
  createEffect,
  createSignal,
  untrack,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import {
  QrOptions,
  Version,
  Margin,
  get_matrix,
  SvgOptions,
  get_svg,
  type QrError,
  type SvgResult,
} from "fuqr";
import { useQrContext } from "./QrContext";

type RenderOptions = {
  bgColor: string;
  fgColor: string;
  bgImgFile: File | null;
  fgImgFile: File | null;
  pixelateBgImg: boolean;
  pixelateFgImg: boolean;
};

export type BoxSelection = {
  top: number;
  bot: number;
  left: number;
  right: number;
};

export const SvgContext = createContext<{
  svgOptions: RenderOptions;
  setSvgOptions: SetStoreFunction<RenderOptions>;
  selections: Accessor<BoxSelection[]>;
  setSelectionsInPlace: Setter<BoxSelection[]>;
  scaleX: Accessor<number[]>;
  setScaleXInPlace: Setter<number[]>;
  scaleY: Accessor<number[]>;
  setScaleYInPlace: Setter<number[]>;
  svgResult: Accessor<SvgResult | null>;
  setSvgResult: Setter<SvgResult | null>;
}>();

export function SvgContextProvider(props: { children: JSX.Element }) {
  const [svgOptions, setSvgOptions] = createStore<RenderOptions>({
    bgColor: "#ffffff",
    fgColor: "#000000",
    bgImgFile: null,
    fgImgFile: null,
    pixelateFgImg: false,
    pixelateBgImg: false,
  });
  const { inputQr, outputQr, setOutputQr } = useQrContext();

  const [selections, setSelectionsInPlace] = createSignal<BoxSelection[]>([], {
    equals: false,
  });

  const [scaleX, setScaleXInPlace] = createSignal<number[]>([], {
    equals: false,
  });
  const [scaleY, setScaleYInPlace] = createSignal<number[]>([], {
    equals: false,
  });

  const [svgResult, setSvgResult] = createSignal<SvgResult | null>(null);

  createEffect(() => {
    try {
      // NOTE: Version and Margin cannot be reused, so must be created each time
      let qrOptions = new QrOptions()
        .min_version(new Version(inputQr.minVersion))
        .min_ecl(inputQr.minEcl)
        .mask(inputQr.mask!) // null makes more sense than undefined
        .mode(inputQr.mode!) // null makes more sense than undefined
        .margin(new Margin(10))
        .margin(
          new Margin(0)
            .setTop(inputQr.margin.top)
            .setRight(inputQr.margin.right)
            .setBottom(inputQr.margin.bottom)
            .setLeft(inputQr.margin.left)
        );

      let m = get_matrix(inputQr.text, qrOptions);
      setOutputQr({
        text: inputQr.text,
        version: m.version["0"],
        ecl: m.ecl,
        mode: m.mode,
        mask: m.mask,
        margin: {
          top: m.margin.top,
          right: m.margin.right,
          bottom: m.margin.bottom,
          left: m.margin.left,
        },
      });
      const matrixLength = m.width() * m.height();
      if (matrixLength !== untrack(scaleX).length) {
        console.log("setScale");
        setSelectionsInPlace([]);
        setScaleXInPlace(Array(matrixLength).fill(100));
        setScaleYInPlace(Array(matrixLength).fill(100));
      }

      qrOptions = new QrOptions()
        .min_version(new Version(m.version[0]))
        .min_ecl(m.ecl)
        .mask(m.mask)
        .mode(m.mode);

      let svgOpts = new SvgOptions()
        .foreground(svgOptions.fgColor)
        .background(svgOptions.bgColor)
        .scale_x_matrix(new Uint8Array(scaleX()))
        .scale_y_matrix(new Uint8Array(scaleY()));

      // infallible b/c outputQr contains successful options
      setSvgResult(get_svg(inputQr.text, qrOptions, svgOpts));
    } catch (e) {
      setOutputQr(e as QrError);
      setSvgResult(null);
    }
  });

  return (
    <SvgContext.Provider
      value={{
        svgOptions,
        setSvgOptions,
        svgResult,
        setSvgResult,
        selections,
        setSelectionsInPlace,
        scaleX,
        setScaleXInPlace,
        scaleY,
        setScaleYInPlace,
      }}
    >
      {props.children}
    </SvgContext.Provider>
  );
}

export function useSvgContext() {
  const context = useContext(SvgContext);
  if (!context) {
    throw new Error("useSvgContext: used outside SvgContextProvider");
  }
  return context;
}
