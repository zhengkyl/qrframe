import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import { ECL, Mode, Mask, QrError, QrOptions, Version, generate } from "fuqr";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { type Params, type ParamsSchema } from "./params";
import { clearToasts, toastError } from "~/components/ErrorToasts";

type InputQr = {
  text: string;
  minVersion: number;
  strictVersion: boolean;
  minEcl: ECL;
  strictEcl: boolean;
  mode: Mode | null;
  mask: Mask | null;
};

export type OutputQr = Readonly<{
  text: string;
  version: number;
  ecl: ECL;
  mode: Mode;
  mask: Mask;
  matrix: Uint8Array;
}>;

export const QrContext = createContext<{
  inputQr: InputQr;
  setInputQr: SetStoreFunction<InputQr>;
  outputQr: Accessor<OutputQr | QrError>;
  render: Accessor<Render | null>;
  setRender: Setter<Render | null>;
  renderKey: Accessor<string>;
  setRenderKey: Setter<string>;
  params: Params;
  setParams: SetStoreFunction<Params>;
  paramsSchema: Accessor<ParamsSchema>;
  setParamsSchema: Setter<ParamsSchema>;
  error: Accessor<string | null>;
  setError: Setter<string | null>;
}>();

export type RenderCanvas = (
  qr: OutputQr,
  params: Params,
  ctx: CanvasRenderingContext2D
) => void;

export type RenderSVG = (qr: OutputQr, params: Params) => string;

const renderTypes = ["svg", "canvas"] as const;
export type RenderType = (typeof renderTypes)[number];

type Render = {
  type: RenderType;
  url: string;
};

export function QrContextProvider(props: { children: JSX.Element }) {
  const [inputQr, setInputQr] = createStore<InputQr>({
    text: "https://qrframe.kylezhe.ng",
    minVersion: 1,
    strictVersion: false,
    minEcl: ECL.Low,
    strictEcl: false,
    mode: null,
    mask: null,
  });

  const [renderKey, setRenderKey] = createSignal<string>("Square");
  const [render, setRender] = createSignal<Render | null>(null);

  const [paramsSchema, setParamsSchema] = createSignal<ParamsSchema>({});
  const [params, setParams] = createStore({});

  const [error, _setError] = createSignal<string | null>(null);
  const setError = (e) => {
    if (e == null) {
      clearToasts();
    } else {
      toastError("Render failed", e);
    }
    _setError(e);
  };

  const outputQr = createMemo(() => {
    // can't skip first render, b/c need to track deps
    try {
      // NOTE: WASM ptrs (QrOptions, Version) become null after leaving scope
      // They can't be reused or stored

      const qrOptions = new QrOptions()
        .min_version(new Version(inputQr.minVersion))
        .strict_version(inputQr.strictVersion)
        .min_ecl(inputQr.minEcl)
        .strict_ecl(inputQr.strictEcl)
        .mask(inputQr.mask!) // null instead of undefined (wasm-pack type)
        .mode(inputQr.mode!); // null instead of undefined (wasm-pack type)

      return  {
        text: inputQr.text,
        ...generate(inputQr.text, qrOptions),
      };
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
        render,
        setRender,
        renderKey,
        setRenderKey,
        params,
        setParams,
        paramsSchema,
        setParamsSchema,
        error,
        setError,
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
