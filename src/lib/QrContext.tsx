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
  Margin,
  get_matrix,
} from "fuqr";
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
  /** Stored as value b/c Matrix is a ptr which becomes null after use */
  matrix: Module[];
  matrixWidth: number;
  matrixHeight: number;
};

export const QrContext = createContext<{
  inputQr: InputQr;
  setInputQr: SetStoreFunction<InputQr>;
  outputQr: Accessor<OutputQr | QrError>;
  setOutputQr: Setter<OutputQr | QrError>;
  renderFunc: Accessor<RenderFunc>;
  setRenderFunc: Setter<RenderFunc>;
}>();

export type RenderFunc = (qr: OutputQr, ctx: CanvasRenderingContext2D) => void;

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

  const [renderFunc, setRenderFunc] = createSignal<RenderFunc>(defaultRender);

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
        matrix: m.value,
        matrixWidth: m.version["0"] * 4 + 17 + m.margin.left + m.margin.right,
        matrixHeight: m.version["0"] * 4 + 17 + m.margin.top + m.margin.bottom,
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

function defaultRender(qr: OutputQr, ctx: CanvasRenderingContext2D) {
  const pixelSize = 10;
  ctx.canvas.width = qr.matrixWidth * pixelSize;
  ctx.canvas.height = qr.matrixHeight * pixelSize;

  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "rgb(0, 0, 0)";
  
  for (let y = 0; y < qr.matrixHeight; y++) {
    for (let x = 0; x < qr.matrixWidth; x++) {
      const module = qr.matrix[y * qr.matrixWidth + x];

      if (module & 1) {
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}
