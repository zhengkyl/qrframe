import {
  createContext,
  createSignal,
  useContext,
  type JSX,
  type Setter,
} from "solid-js";
import { ECL, Mode, Mask } from "fuqr";
import { createStore, type SetStoreFunction } from "solid-js/store";

type InputQr = {
  text: string;
  minVersion: number;
  minEcl: ECL;
  mode: Mode | null;
  mask: Mask | null;
};

type OutputQr = {
  text: string;
  version: number;
  ecl: ECL;
  mode: Mode;
  mask: Mask;
};

export const QrContext = createContext<{
  inputQr: InputQr;
  setInputQr: SetStoreFunction<InputQr>;
  outputQr: OutputQr | null;
  setOutputQr: Setter<OutputQr | null>;
}>();

export function QrContextProvider(props: { children: JSX.Element }) {
  const [inputQr, setInputQr] = createStore<InputQr>({
    text: "Greetings traveler",
    minVersion: 1,
    minEcl: ECL.Low,
    mode: null,
    mask: null,
  });

  const [outputQr, setOutputQr] = createSignal<OutputQr | null>(null);

  return (
    <QrContext.Provider
      value={{ inputQr, setInputQr, outputQr: outputQr(), setOutputQr }}
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
