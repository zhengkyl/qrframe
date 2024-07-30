import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import {
  ECL,
  Mode,
  Mask,
  QrError,
  Module,
  QrOptions,
  Version,
  get_matrix,
} from "fuqr";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { defaultParams, type Params, type ParamsSchema } from "./params";
import { PRESET_MODULES } from "./presets";

type InputQr = {
  text: string;
  minVersion: number;
  minEcl: ECL;
  mode: Mode | null;
  mask: Mask | null;
};

export type OutputQr = Readonly<{
  text: string;
  version: number;
  ecl: ECL;
  mode: Mode;
  mask: Mask;
  matrix: ReadonlyArray<Module>;
}>;

export const QrContext = createContext<{
  inputQr: InputQr;
  setInputQr: SetStoreFunction<InputQr>;
  outputQr: Accessor<OutputQr | QrError>;

  getRenderSVG: Accessor<RenderSVG | null>;
  setRenderSVG: Setter<RenderSVG | null>;
  getRenderCanvas: Accessor<RenderCanvas | null>;
  setRenderCanvas: Setter<RenderCanvas | null>;

  renderFuncKey: Accessor<string>;
  setRenderFuncKey: Setter<string>;
  params: Params;
  setParams: SetStoreFunction<Params>;
  paramsSchema: Accessor<ParamsSchema>;
  setParamsSchema: Setter<ParamsSchema>;
}>();

export type RenderCanvas = (
  qr: OutputQr,
  params: Params,
  ctx: CanvasRenderingContext2D
) => void;

export type RenderSVG = (qr: OutputQr, params: Params) => string;

export function QrContextProvider(props: { children: JSX.Element }) {
  const [inputQr, setInputQr] = createStore<InputQr>({
    text: "https://qrframe.kylezhe.ng",
    minVersion: 1,
    minEcl: ECL.Low,
    mode: null,
    mask: null,
  });

  const [renderCanvas, setRenderCanvas] = createSignal<RenderCanvas | null>(
    null
  );

  const [renderSVG, setRenderSVG] = createSignal<RenderSVG | null>(
    // @ts-ignore narrow to wider is fine b/c we pass valid params
    PRESET_MODULES.Square.renderSVG
  );
  const [renderFuncKey, setRenderFuncKey] = createSignal("Square");

  const [paramsSchema, setParamsSchema] = createSignal<ParamsSchema>(
    PRESET_MODULES.Square.paramsSchema
  );
  const [params, setParams] = createStore(defaultParams(PRESET_MODULES.Square.paramsSchema));

  const outputQr = createMemo(() => {
    // can't skip first render, b/c need to track deps
    try {
      // NOTE: WASM ptrs (QrOptions, Version, Matrix) become null after leaving scope
      // They can't be reused or stored

      let qrOptions = new QrOptions()
        .min_version(new Version(inputQr.minVersion))
        .min_ecl(inputQr.minEcl)
        .mask(inputQr.mask!) // null instead of undefined (wasm-pack type)
        .mode(inputQr.mode!); // null instead of undefined (wasm-pack type)

      let m = get_matrix(inputQr.text, qrOptions);

      // outputQr is passed as param to renderFunc
      // must either freeze or pass new copy for each render
      return Object.freeze({
        text: inputQr.text,
        matrix: Object.freeze(m.value),
        version: m.version["0"],
        ecl: m.ecl,
        mode: m.mode,
        mask: m.mask,
      });
    } catch (e) {
      return e as QrError;
    }
  });

  return (
    <QrContext.Provider
      value={{
        inputQr,
        setInputQr,
        outputQr,
        getRenderSVG: renderSVG,
        setRenderSVG,
        getRenderCanvas: renderCanvas,
        setRenderCanvas,
        renderFuncKey,
        setRenderFuncKey,
        params,
        setParams,
        paramsSchema,
        setParamsSchema,
      }}
    >
      {props.children}
    </QrContext.Provider>
  );
}

export function useQrContext() {
  const context = useContext(QrContext);
  if (!context) {
    throw new Error("useQrContext: used outside QrContextProvider");
  }
  return context;
}

// pre generated b/c needed often for thumbnails (generated on every save/load)
export const PREVIEW_OUTPUTQR = {
  text: "https://qrfra.me",
  // prettier-ignore
  matrix: [3,3,3,3,3,3,3,12,8,0,0,0,0,12,3,3,3,3,3,3,3,3,2,2,2,2,2,3,12,9,0,0,1,1,12,3,2,2,2,2,2,3,3,2,3,3,3,2,3,12,8,1,0,1,1,12,3,2,3,3,3,2,3,3,2,3,3,3,2,3,12,9,1,0,1,0,12,3,2,3,3,3,2,3,3,2,3,3,3,2,3,12,8,0,1,0,0,12,3,2,3,3,3,2,3,3,2,2,2,2,2,3,12,9,1,1,1,1,12,3,2,2,2,2,2,3,3,3,3,3,3,3,3,12,7,6,7,6,7,12,3,3,3,3,3,3,3,12,12,12,12,12,12,12,12,8,0,1,0,0,12,12,12,12,12,12,12,12,9,9,9,9,9,8,7,9,9,1,0,1,0,9,8,9,8,9,8,9,8,0,0,0,1,0,0,6,1,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,0,7,1,0,0,1,0,1,1,1,1,0,0,1,1,0,0,1,1,0,0,0,6,0,0,1,1,1,1,1,0,0,1,1,1,0,0,1,0,0,1,0,0,7,1,1,0,0,0,1,1,1,0,1,1,0,0,1,12,12,12,12,12,12,12,12,9,1,0,0,0,0,0,1,1,1,1,0,1,3,3,3,3,3,3,3,12,9,1,1,1,1,1,0,1,0,0,1,1,0,3,2,2,2,2,2,3,12,8,1,0,0,0,1,0,1,1,1,1,0,0,3,2,3,3,3,2,3,12,9,0,0,0,1,1,1,1,1,1,0,0,0,3,2,3,3,3,2,3,12,9,0,1,1,0,0,0,0,1,0,1,1,0,3,2,3,3,3,2,3,12,9,1,1,1,1,0,1,1,0,0,1,0,0,3,2,2,2,2,2,3,12,9,0,0,0,0,1,0,0,1,1,1,0,0,3,3,3,3,3,3,3,12,9,1,0,1,1,0,1,1,0,1,0,1,0],
  version: 1,
  ecl: ECL.Low,
  mode: Mode.Byte,
  mask: Mask.M2,
};
