import {
  createContext,
  createMemo,
  createSignal,
  useContext,
  type Accessor,
  type JSX,
} from "solid-js";
import init, {
  ECL,
  Mode,
  Mask,
  QrError,
  QrOptions,
  Version,
  generate,
} from "fuqr";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { isServer } from "solid-js/web";

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

type Output =
  | {
      state: QrState.Ready;
      qr: Readonly<{
        text: string;
        version: number;
        ecl: ECL;
        mode: Mode;
        mask: Mask;
        matrix: Uint8Array;
      }>;
    }
  | {
      state:
        | QrState.Loading
        | QrState.InvalidEncoding
        | QrState.ExceedsMaxCapacity;
      qr: null;
    };

export enum QrState {
  InvalidEncoding = QrError.InvalidEncoding,
  ExceedsMaxCapacity = QrError.ExceedsMaxCapacity,
  Loading = 2,
  Ready = 3,
}

export const QrContext = createContext<{
  inputQr: InputQr;
  setInputQr: SetStoreFunction<InputQr>;
  output: Accessor<Output>;
}>();

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

  const [initDone, setInitDone] = createSignal(false);

  if (!isServer) {
    init().then(() => {
      setInitDone(true);
    });
  }

  const output = createMemo(() => {
    if (!initDone()) {
      return {
        state: QrState.Loading,
        qr: null,
      };
    }

    try {
      // NOTE: WASM ptrs (QrOptions, Version) become null after leaving scope
      const qrOptions = new QrOptions()
        .min_version(new Version(inputQr.minVersion))
        .strict_version(inputQr.strictVersion)
        .min_ecl(inputQr.minEcl)
        .strict_ecl(inputQr.strictEcl)
        .mask(inputQr.mask!) // null instead of undefined (wasm-pack type)
        .mode(inputQr.mode!); // null instead of undefined (wasm-pack type)

      return {
        state: QrState.Ready,
        qr: {
          text: inputQr.text,
          ...generate(inputQr.text, qrOptions),
        },
      };
    } catch (e) {
      return {
        state: e as QrState,
        qr: null,
      };
    }
  });

  return (
    <QrContext.Provider
      value={{
        inputQr,
        setInputQr,
        output,
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
