import {
  createContext,
  createEffect,
  createSignal,
  useContext,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import { createStore, unwrap, type SetStoreFunction } from "solid-js/store";
import { type Params, type ParamsSchema } from "./params";
import { clearToasts, toastError } from "~/components/ErrorToasts";
import { QrState, useQrContext, type OutputQr } from "./QrContext";

export const RenderContext = createContext<{
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
  svgParentRefs: HTMLDivElement[];
  addSvgParentRef: (ref: HTMLDivElement) => void;
  canvasRefs: HTMLCanvasElement[];
  addCanvasRef: (ref: HTMLCanvasElement) => void;
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

export function RenderContextProvider(props: { children: JSX.Element }) {
  const { output } = useQrContext();

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

  const canvasRefs: HTMLCanvasElement[] = [];
  const addCanvasRef = (ref) => {
    canvasRefs.push(ref);
  };
  const svgParentRefs: HTMLDivElement[] = [];
  const addSvgParentRef = (ref) => {
    svgParentRefs.push(ref);
  };

  let worker: Worker | null = null;
  const timeoutIdSet = new Set<NodeJS.Timeout>();

  // This *almost* doesn't need to be an effect
  // BUT in QrEditor's `saveAndRun` there are 3 signals
  // that need to be set for one render, and `batch` lets that happen
  // I could expose multiple versions of the set functions
  // but that seems much less maintainable that this
  createEffect(async () => {
    if (output().state !== QrState.Ready) return
    const r = render();

    // Track store without leaking extra params
    const paramsCopy: Params = {};
    const unwrapped = unwrap(params);
    Object.keys(paramsSchema()).forEach((key) => {
      paramsCopy[key] = unwrapped[key];

      // access to track
      params[key];
      if (Array.isArray(unwrapped[key])) {
        params[key].forEach((_: any) => {});
      }
    });

    // all reactive deps must be above early return!
    // true on page load
    if (r == null) return;

    if (worker == null) setupWorker();

    const timeoutId = setTimeout(() => {
      console.error(
        `Preview took longer than 5 seconds, timed out!`,
        timeoutId
      );
      timeoutIdSet.delete(timeoutId);
      if (worker != null) {
        worker.terminate();
        worker = null;
      }
    }, 5000);
    timeoutIdSet.add(timeoutId);

    worker!.postMessage({
      type: r.type,
      url: r.url,
      qr: output().qr,
      params: paramsCopy,
      timeoutId,
    });

    return () => {
      worker?.terminate();
      timeoutIdSet.forEach((timeout) => clearTimeout(timeout));
    };
  });

  const setupWorker = () => {
    console.log("Starting previewWorker");
    worker = new Worker("previewWorker.js", { type: "module" });

    worker.onmessage = (e) => {
      clearTimeout(e.data.timeoutId);
      timeoutIdSet.delete(e.data.timeoutId);

      switch (e.data.type) {
        case "svg":
          svgParentRefs.forEach((svgParent) => {
            svgParent.innerHTML = e.data.svg;
          });
          setError(null);
          break;
        case "canvas":
          let first: HTMLCanvasElement | null = null;
          canvasRefs.forEach((canvas) => {
            if (first == null) {
              first = canvas;
              canvas
                .getContext("bitmaprenderer")!
                .transferFromImageBitmap(e.data.bitmap);
            } else {
              canvas.getContext("2d")!.drawImage(first, 0, 0);
            }
          });
          setError(null);
          break;
        case "error":
          console.error(e.data.error);
          setError(e.data.error.toString());
          break;
        // case "canceled":
        //   break;
      }
    };
  };

  return (
    <RenderContext.Provider
      value={{
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
        svgParentRefs,
        addSvgParentRef,
        canvasRefs,
        addCanvasRef,
      }}
    >
      {props.children}
    </RenderContext.Provider>
  );
}

export function useRenderContext() {
  const context = useContext(RenderContext);
  if (!context) {
    throw new Error("useRenderContext: used outside RenderContextProvider");
  }
  return context;
}
