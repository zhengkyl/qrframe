import {
  createContext,
  createSignal,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import { ECL, Mode, Mask, QrError } from "fuqr";
import { createStore, type SetStoreFunction } from "solid-js/store";

type InputQr = {
  text: string;
  minVersion: number;
  minEcl: ECL;
  mode: Mode | null;
  mask: Mask | null;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

export type OutputQr = {
  text: string;
  /** Stored as value b/c Version is a ptr which becomes null after use */
  version: number;
  ecl: ECL;
  mode: Mode;
  mask: Mask;
  /** Stored as value b/c Margin is a ptr which becomes null after use */
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

export const QrContext = createContext<{
  inputQr: InputQr;
  setInputQr: SetStoreFunction<InputQr>;
  outputQr: Accessor<OutputQr | QrError>;
  setOutputQr: Setter<OutputQr | QrError>;
}>();

export function QrContextProvider(props: { children: JSX.Element }) {
  const [inputQr, setInputQr] = createStore<InputQr>({
    text: "Greetings traveler",
    minVersion: 1,
    minEcl: ECL.Low,
    mode: null,
    mask: null,
    margin: {
      top: 2,
      right: 2,
      bottom: 2,
      left: 2,
    },
  });

  const [outputQr, setOutputQr] = createSignal<OutputQr | QrError>(
    QrError.InvalidEncoding
  );

  return (
    <QrContext.Provider value={{ inputQr, setInputQr, outputQr, setOutputQr }}>
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
