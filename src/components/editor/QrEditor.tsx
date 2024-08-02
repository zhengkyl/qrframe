import Pencil from "lucide-solid/icons/pencil";
import Trash2 from "lucide-solid/icons/trash-2";
import { For, Show, batch, createSignal, onMount, type JSX } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";
import {
  PARAM_COMPONENTS,
  defaultParams,
  paramsEqual,
  parseParamsSchema,
  type Params,
  type ParamsSchema,
} from "~/lib/params";
import { PRESET_CODE } from "~/lib/presets";
import {
  PREVIEW_OUTPUTQR,
  useQrContext,
  type RenderCanvas,
  type RenderSVG,
} from "~/lib/QrContext";
import { FillButton, FlatButton } from "../Button";
import { Collapsible } from "../Collapsible";
import { IconButtonDialog } from "../Dialog";
import { TextInput, TextareaInput } from "../TextInput";
import { CodeEditor } from "./CodeEditor";
import { Settings } from "./Settings";

type Props = {
  class?: string;
};

const FUNC_KEYS_KEY = "funcKeys";

// TODO temp fallback thumb
const FALLBACK_THUMB =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";

type Thumbs = { [T in keyof typeof PRESET_CODE]: string } & {
  [key: string]: string;
};

type t<T> = {
  [K in keyof T]: string;
};

const presetKeys = Object.keys(PRESET_CODE);
// 'in' doesn't work b/c key can overlap with inherited properties
function isPreset(key: string): key is keyof typeof PRESET_CODE {
  return presetKeys.includes(key);
}

export function Editor(props: Props) {
  const {
    setInputQr,
    setRenderSVG,
    setRenderCanvas,
    renderFuncKey,
    setRenderFuncKey,
    paramsSchema,
    setParamsSchema,
    params,
    setParams,
  } = useQrContext();

  const [code, setCode] = createSignal(PRESET_CODE.Square);

  const [compileError, setCompileError] = createSignal<string | null>(null);

  const [funcKeys, setFuncKeys] = createStore<string[]>([]);

  const [thumbs, setThumbs] = createStore<Thumbs>({
    Square: "",
    Circle: "",
    Camo: "",
    Halftone: "",
    Minimal: "",
  });

  onMount(async () => {
    const storedFuncKeys = localStorage.getItem(FUNC_KEYS_KEY);
    let keys;
    if (storedFuncKeys == null || storedFuncKeys === "") {
      localStorage.setItem(FUNC_KEYS_KEY, presetKeys.join(","));
      keys = presetKeys;
    } else {
      keys = storedFuncKeys.split(",");
    }
    setExistingKey(keys[0]);

    setFuncKeys(keys);
    for (const key of keys) {
      if (isPreset(key)) {
        const tryThumb = localStorage.getItem(`${key}_thumb`);
        if (tryThumb != null) {
          setThumbs(key, tryThumb);
          continue;
        } else {
          // No try-catch b/c presets should not have errors
          const { renderSVG, renderCanvas, parsedParamsSchema } =
            await importCode(PRESET_CODE[key]);
          await updateThumbnail(
            key,
            renderSVG,
            renderCanvas,
            parsedParamsSchema
          );
        }
      }

      const thumb = localStorage.getItem(`${key}_thumb`) ?? FALLBACK_THUMB;
      setThumbs(key, thumb);
    }
  });

  const setExistingKey = (key: string) => {
    setRenderFuncKey(key);
    if (isPreset(key)) {
      trySetCode(PRESET_CODE[key], false);
    } else {
      let storedCode = localStorage.getItem(key);
      if (storedCode == null) {
        storedCode = `Failed to load ${key}`;
      }
      trySetCode(storedCode, false);
    }
  };

  const importCode = async (code: string) => {
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);

    // TODO check perf of caching functions
    const {
      renderSVG,
      renderCanvas,
      paramsSchema: rawParamsSchema,
    } = await import(/* @vite-ignore */ url).finally(() =>
      URL.revokeObjectURL(url)
    );

    if (typeof renderCanvas !== "function" && typeof renderSVG !== "function") {
      throw new Error("renderSVG or renderCanvas must be exported");
    } else if (
      typeof renderCanvas === "function" &&
      typeof renderSVG === "function"
    ) {
      throw new Error("renderSVG and renderCanvas cannot both be exported");
    }

    // TODO see impl, user set default and props might be wrong
    const parsedParamsSchema = parseParamsSchema(rawParamsSchema);

    return { renderSVG, renderCanvas, parsedParamsSchema };
  };

  const trySetCode = async (code: string, changed: boolean) => {
    try {
      const { renderSVG, renderCanvas, parsedParamsSchema } = await importCode(
        code
      );
      if (
        typeof renderCanvas !== "function" &&
        typeof renderSVG !== "function"
      ) {
        throw new Error("renderSVG or renderCanvas must be exported");
      } else if (
        typeof renderCanvas === "function" &&
        typeof renderSVG === "function"
      ) {
        throw new Error("renderSVG and renderCanvas cannot both be exported");
      }
      setCompileError(null);
      setCode(code);

      // batched b/c trigger rendering effect
      batch(() => {
        if (!paramsEqual(parsedParamsSchema, paramsSchema())) {
          setParams(defaultParams(parsedParamsSchema));
        }
        setParamsSchema(parsedParamsSchema); // always update in case different property order

        setRenderSVG(() => renderSVG ?? null);
        setRenderCanvas(() => renderCanvas ?? null);
      });

      if (changed) {
        localStorage.setItem(renderFuncKey(), code);
        updateThumbnail(
          renderFuncKey(),
          renderSVG,
          renderCanvas,
          parsedParamsSchema
        );
      }
    } catch (e) {
      console.log("e", e!.toString());
      setCompileError(e!.toString());
    }
  };

  const updateThumbnail = async (
    renderKey: string,
    renderSVG: RenderSVG | undefined,
    renderCanvas: RenderCanvas | undefined,
    parsedParamsSchema: ParamsSchema
  ) => {
    try {
      const defaultParams: Params = {};
      Object.entries(parsedParamsSchema).forEach(([label, props]) => {
        defaultParams[label] = props.default;
      });

      let thumbnail;
      if (renderSVG != null) {
        // https://www.phpied.com/truth-encoding-svg-data-uris/
        // Only need to encode #
        thumbnail =
          "data:image/svg+xml," +
          (await renderSVG(PREVIEW_OUTPUTQR, defaultParams).replaceAll(
            "#",
            "%23"
          ));
      } else {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d")!;
        await renderCanvas!(PREVIEW_OUTPUTQR, defaultParams, ctx);

        const smallCanvas = document.createElement("canvas");
        const size = 96;
        smallCanvas.width = size;
        smallCanvas.height = size;
        const smallCtx = smallCanvas.getContext("2d")!;
        smallCtx.drawImage(canvas, 0, 0, size, size);
        thumbnail = smallCanvas.toDataURL("image/jpeg", 0.5);
      }

      localStorage.setItem(`${renderKey}_thumb`, thumbnail);

      if (!presetKeys.includes(renderKey)) {
        setThumbs(renderKey, thumbnail);
      }
    } catch (e) {
      console.error(`${renderKey} thumbnail render:`, e);
    }
  };

  const createAndSelectFunc = (name: string, code: string) => {
    let count = 1;
    let key = `${name} ${count}`;
    while (funcKeys.includes(key)) {
      count++;
      key = `${name} ${count}`;
    }
    setFuncKeys(funcKeys.length, key);
    localStorage.setItem(FUNC_KEYS_KEY, funcKeys.join(","));

    // TODO double setting thumbs
    setThumbs(key, FALLBACK_THUMB);
    setRenderFuncKey(key);
    trySetCode(code, true);
  };

  return (
    <div class={props.class}>
      <TextareaInput
        placeholder="https://qrframe.kylezhe.ng"
        setValue={(s) => setInputQr("text", s || "https://qrframe.kylezhe.ng")}
      />
      <Collapsible trigger="Data">
        <Settings />
      </Collapsible>
      <Collapsible trigger="Render" defaultOpen>
        <div class="py-4">
          <div class="mb-4 h-[180px] md:(h-unset)">
            <div class="flex justify-between">
              <div class="text-sm py-2 border border-transparent">
                Render function
              </div>
              <div class="flex gap-2">
                <div class="flex items-center font-bold">{renderFuncKey()}</div>
                <Show when={!presetKeys.includes(renderFuncKey())}>
                  <IconButtonDialog
                    title={`Rename ${renderFuncKey()}`}
                    triggerTitle="Rename"
                    triggerChildren={<Pencil class="w-5 h-5" />}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    {(close) => {
                      const [rename, setRename] = createSignal(renderFuncKey());
                      const [duplicate, setDuplicate] = createSignal(false);

                      let ref: HTMLInputElement;
                      onMount(() => ref.focus());
                      return (
                        <>
                          <TextInput
                            class="mt-2"
                            ref={ref!}
                            defaultValue={rename()}
                            onChange={setRename}
                            onInput={() => duplicate() && setDuplicate(false)}
                            placeholder={renderFuncKey()}
                          />
                          <div class="absolute p-1 text-sm text-red-600">
                            <Show when={duplicate()}>
                              {rename()} already exists.
                            </Show>
                          </div>
                          <FillButton
                            class="px-3 py-2 float-right mt-4"
                            // input onChange runs after focus lost, so onMouseDown is too early
                            onClick={() => {
                              if (rename() === renderFuncKey()) return close();

                              if (funcKeys.includes(rename())) {
                                setDuplicate(true);
                                return;
                              }

                              localStorage.removeItem(renderFuncKey());
                              localStorage.removeItem(
                                `${renderFuncKey()}_thumb`
                              );

                              const thumb = thumbs[renderFuncKey()];
                              localStorage.setItem(rename(), code());
                              localStorage.setItem(`${rename()}_thumb`, thumb);
                              setThumbs(rename(), thumb);
                              setThumbs(renderFuncKey(), undefined!);

                              setFuncKeys(
                                funcKeys.indexOf(renderFuncKey()),
                                rename()
                              );
                              localStorage.setItem(
                                FUNC_KEYS_KEY,
                                funcKeys.join(",")
                              );

                              setRenderFuncKey(rename());
                              close();
                            }}
                          >
                            Confirm
                          </FillButton>
                        </>
                      );
                    }}
                  </IconButtonDialog>
                  <IconButtonDialog
                    title={`Delete ${renderFuncKey()}`}
                    triggerTitle="Delete"
                    triggerChildren={<Trash2 class="w-5 h-5" />}
                  >
                    {(close) => (
                      <>
                        <p class="mb-4 text-sm">
                          Are you sure you want to delete this function?
                        </p>
                        <div class="flex justify-end gap-2">
                          <FillButton
                            onMouseDown={() => {
                              localStorage.removeItem(renderFuncKey());

                              localStorage.removeItem(
                                `${renderFuncKey()}_thumb`
                              );
                              setThumbs(renderFuncKey(), undefined!);

                              setFuncKeys((keys) =>
                                keys.filter((key) => key !== renderFuncKey())
                              );
                              localStorage.setItem(
                                FUNC_KEYS_KEY,
                                funcKeys.join(",")
                              );

                              setExistingKey(funcKeys[0]);
                              close();
                            }}
                          >
                            Confirm
                          </FillButton>
                          <FlatButton onMouseDown={close}>Cancel</FlatButton>
                        </div>
                      </>
                    )}
                  </IconButtonDialog>
                </Show>
              </div>
            </div>
            <div class="flex gap-3 pt-2 pb-4 md:(flex-wrap static ml-0 px-0 overflow-x-visible) absolute max-w-full overflow-x-auto -ml-6 px-6">
              <For each={funcKeys}>
                {(key) => (
                  <Preview
                    onClick={() => setExistingKey(key)}
                    label={key}
                    active={renderFuncKey() === key}
                  >
                    <img class="rounded-sm" src={thumbs[key]} />
                  </Preview>
                )}
              </For>
              <Preview
                onClick={() =>
                  createAndSelectFunc("custom", PRESET_CODE.Square)
                }
                label="Create new"
                active={false}
              >
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <path style="fill:#222" d="M0 0h100v100H0z" />
                  <path
                    style="fill:#fff"
                    d="m55 25-10 1v17H26v13l1 1h19l1 18v1l10-1h1l-1-18h23V43H56V26l-1-1z"
                  />
                </svg>
              </Preview>
            </div>
          </div>
          <div class="flex flex-col gap-2 mb-4">
            <For each={Object.entries(paramsSchema())}>
              {([label, { type, ...props }]) => {
                return (
                  <>
                    <div class="flex justify-between">
                      <div class="text-sm py-2 w-48">{label}</div>
                      {/* @ts-expect-error lose type b/c type and props destructured */}
                      <Dynamic
                        component={PARAM_COMPONENTS[type]}
                        {...props}
                        value={params[label]}
                        setValue={(v: any) => setParams(label, v)}
                      />
                    </div>
                  </>
                );
              }}
            </For>
          </div>
          <CodeEditor
            initialValue={code()}
            onSave={(code) => {
              if (presetKeys.includes(renderFuncKey())) {
                createAndSelectFunc(renderFuncKey(), code);
              } else {
                trySetCode(code, true);
              }
            }}
            error={compileError()}
            clearError={() => setCompileError(null)}
          />
        </div>
      </Collapsible>
    </div>
  );
}

type PreviewProps = {
  label: string;
  children: JSX.Element;
  onClick: () => void;
  active: boolean;
};
function Preview(props: PreviewProps) {
  return (
    <button
      class="rounded-sm focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
      onClick={props.onClick}
    >
      <div
        classList={{
          "h-24 w-24 rounded-sm checkboard": true,
          "ring-2 ring-fore-base ring-offset-4 ring-offset-back-base":
            props.active,
        }}
      >
        {props.children}
      </div>
      <div class="pt-1 text-center text-sm w-24 whitespace-pre overflow-hidden text-ellipsis">
        {props.label}
      </div>
    </button>
  );
}
