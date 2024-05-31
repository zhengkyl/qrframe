import { createContext, useContext, type JSX } from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

type SvgOptions = {
  margin: number;
  bgColor: string;
  fgColor: string;
  bgImgFile: File | null;
  fgImgFile: File | null;
  pixelateBgImg: boolean;
  pixelateFgImg: boolean;
};

export const SvgContext = createContext<{
  svgOptions: SvgOptions;
  setSvgOptions: SetStoreFunction<SvgOptions>;
}>();

export function SvgContextProvider(props: { children: JSX.Element }) {
  const [svgOptions, setSvgOptions] = createStore<SvgOptions>({
    margin: 2,
    bgColor: "#ffffff",
    fgColor: "#000000",
    bgImgFile: null,
    fgImgFile: null,
    pixelateFgImg: false,
    pixelateBgImg: false,
  });

  return (
    <SvgContext.Provider
      value={{
        svgOptions: svgOptions,
        setSvgOptions: setSvgOptions,
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
