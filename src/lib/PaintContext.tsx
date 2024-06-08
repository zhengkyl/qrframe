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
import { useQrContext } from "./QrContext";
import { useSvgContext } from "./SvgContext";
import { Margin, QrOptions, Version, get_matrix, type QrError } from "fuqr";

export type BoxSelection = {
  top: number;
  bot: number;
  left: number;
  right: number;
};

export const PaintContext = createContext<{
  selections: Accessor<BoxSelection[]>;
  setSelectionsInPlace: Setter<BoxSelection[]>;
  scaleX: Accessor<number[]>;
  setScaleXInPlace: Setter<number[]>;
  scaleY: Accessor<number[]>;
  setScaleYInPlace: Setter<number[]>;
}>();

export function PaintContextProvider(props: { children: JSX.Element }) {
  const { inputQr, outputQr, setOutputQr } = useQrContext();
  const { svgOptions } = useSvgContext();

  const [selections, setSelectionsInPlace] = createSignal<BoxSelection[]>([], {
    equals: false,
  });

  const [scaleX, setScaleXInPlace] = createSignal<number[]>([], {
    equals: false,
  });
  const [scaleY, setScaleYInPlace] = createSignal<number[]>([], {
    equals: false,
  });

  createEffect(() => {
    try {
      // NOTE: Version and Margin cannot be reused, so must be created each time
      const qrOptions = new QrOptions()
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
      if (matrixLength === untrack(scaleX).length) return;

      setSelectionsInPlace([]);
      setScaleXInPlace(Array(matrixLength).fill(100));
      setScaleYInPlace(Array(matrixLength).fill(100));
    } catch (e) {
      setOutputQr(e as QrError);
    }
  });

  return (
    <PaintContext.Provider
      value={{
        selections,
        setSelectionsInPlace,
        scaleX,
        setScaleXInPlace,
        scaleY,
        setScaleYInPlace,
      }}
    >
      {props.children}
    </PaintContext.Provider>
  );
}

export function usePaintContext() {
  const context = useContext(PaintContext);
  if (!context) {
    throw new Error("usePaintContext: used outside PaintContextProvider");
  }
  return context;
}
