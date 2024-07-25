import {
  createContext,
  createEffect,
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
import type { Params, ParamsSchema } from "./params";

type InputQr = {
  text: string;
  minVersion: number;
  minEcl: ECL;
  mode: Mode | null;
  mask: Mask | null;
};

export type OutputQr = {
  text: string;
  /** Stored as value b/c Version is a ptr which becomes null after use */
  version: number;
  ecl: ECL;
  mode: Mode;
  mask: Mask;
  /** Stored as value b/c Matrix is a ptr which becomes null after use */
  matrix: Module[];
};

export const QrContext = createContext<{
  inputQr: InputQr;
  setInputQr: SetStoreFunction<InputQr>;
  outputQr: Accessor<OutputQr | QrError>;
  setOutputQr: Setter<OutputQr | QrError>;
  renderFunc: Accessor<RenderFunc>;
  setRenderFunc: Setter<RenderFunc>;
  renderFuncKey: Accessor<string>;
  setRenderFuncKey: Setter<string>;
  params: Params;
  setParams: SetStoreFunction<Params>;
  paramsSchema: Accessor<ParamsSchema>;
  setParamsSchema: Setter<ParamsSchema>;
}>();

export type RenderFunc = (
  qr: OutputQr,
  params: {},
  ctx: CanvasRenderingContext2D
) => void | (() => void);

export function QrContextProvider(props: { children: JSX.Element }) {
  const [inputQr, setInputQr] = createStore<InputQr>({
    text: "https://qrcode.kylezhe.ng",
    minVersion: 1,
    minEcl: ECL.Low,
    mode: null,
    mask: null,
  });

  const [outputQr, setOutputQr] = createSignal<OutputQr | QrError>(
    QrError.InvalidEncoding
  );

  const [renderFunc, setRenderFunc] = createSignal<RenderFunc>(()=>{});
  const [renderFuncKey, setRenderFuncKey] = createSignal("Square");

  const [paramsSchema, setParamsSchema] = createSignal<ParamsSchema>({});
  const [params, setParams] = createStore({});

  createEffect(() => {
    try {
      // NOTE: Version and Margin cannot be reused, so must be created each time
      let qrOptions = new QrOptions()
        .min_version(new Version(inputQr.minVersion))
        .min_ecl(inputQr.minEcl)
        .mask(inputQr.mask!) // null makes more sense than undefined
        .mode(inputQr.mode!) // null makes more sense than undefined

      let m = get_matrix(inputQr.text, qrOptions);

      setOutputQr({
        text: inputQr.text,
        matrix: m.value,
        version: m.version["0"],
        ecl: m.ecl,
        mode: m.mode,
        mask: m.mask,
      });
    } catch (e) {
      setOutputQr(e as QrError);
    }
  });

  return (
    <QrContext.Provider
      value={{
        inputQr,
        setInputQr,
        outputQr,
        setOutputQr,
        renderFunc,
        setRenderFunc,
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