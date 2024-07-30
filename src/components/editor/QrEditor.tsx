import Pencil from "lucide-solid/icons/pencil";
import Trash2 from "lucide-solid/icons/trash-2";
import { For, Show, batch, createSignal, onMount, type JSX } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";
import {
  PARAM_COMPONENTS,
  paramsEqual,
  parseParamsSchema,
  type RawParamsSchema,
  type Params,
  type ParamsSchema,
  defaultParams,
} from "~/lib/params";
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
import { PRESET_MODULES } from "~/lib/presets";

type Props = {
  class?: string;
};

const ADD_NEW_FUNC_KEY = "Add new function";
const USER_FUNC_KEYS_KEY = "userFuncKeys";

// TODO temp fallback thumb
const FALLBACK_THUMB =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";

type PresetThumbs = { [T in keyof typeof PRESET_MODULES]: string };

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

  const [code, setCode] = createSignal(PRESET_MODULES.Square.code);

  const [compileError, setCompileError] = createSignal<string | null>(null);

  const [userFuncs, setUserFuncs] = createStore<
    { key: string; thumb: string }[]
  >([]);

  const [presetThumbs, setPresetThumbs] = createSignal<PresetThumbs>({
    Square: "",
    Circle: "",
    Camo: "",
    Halftone: "",
    Minimal: "",
  });

  onMount(async () => {
    const storedFuncKeys = localStorage.getItem(USER_FUNC_KEYS_KEY);
    if (storedFuncKeys != null) {
      const keys = storedFuncKeys.split(",");
      for (const key of keys) {
        const funcCode = localStorage.getItem(key);
        if (funcCode == null) continue;

        const thumb = localStorage.getItem(`${key}_thumb`) ?? FALLBACK_THUMB;
        setUserFuncs(userFuncs.length, { key, thumb });
      }
    }

    // @ts-expect-error adding keys below
    const thumbs: PresetThumbs = {};
    for (const key of Object.keys(PRESET_MODULES)) {
      const tryThumb = localStorage.getItem(`${key}_thumb`);
      if (tryThumb == null) {
        const preset = PRESET_MODULES[key as keyof typeof PRESET_MODULES];
        await updateThumbnail(
          key,
          // @ts-expect-error ts might stop if more than one renderSVG
          preset.renderSVG,
          preset.renderCanvas,
          parseParamsSchema(preset.paramsSchema) // TODO ts not erroring when passing raw
        );
      }
      const thumb = localStorage.getItem(`${key}_thumb`) ?? FALLBACK_THUMB;
      thumbs[key as keyof typeof PRESET_MODULES] = thumb;
    }
    setPresetThumbs(thumbs);
  });

  const internalSetCode = ({
    renderSVG,
    renderCanvas,
    paramsSchema: rawParamsSchema,
    code,
  }: {
    renderSVG: RenderSVG | undefined;
    renderCanvas: RenderCanvas | undefined;
    paramsSchema: RawParamsSchema;
    code: string;
  }) => {
    setCode(code);

    // TODO see impl, user set default and props might be wrong
    const parsedParamsSchema = parseParamsSchema(rawParamsSchema);

    // batched b/c trigger rendering effect
    batch(() => {
      if (!paramsEqual(parsedParamsSchema, paramsSchema())) {
        setParams(defaultParams(parsedParamsSchema));
      }
      setParamsSchema(parsedParamsSchema); // always update in case different property order

      setRenderSVG(() => renderSVG ?? null);
      setRenderCanvas(() => renderCanvas ?? null);
    });

    return parsedParamsSchema;
  };

  const userSetCode = async (code: string, changed: boolean) => {
    let url;
    try {
      const blob = new Blob([code], { type: "text/javascript" });
      url = URL.createObjectURL(blob);

      const { renderSVG, renderCanvas, paramsSchema } = await import(
        /* @vite-ignore */ url
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

      const parsedParamsSchema = internalSetCode({
        renderSVG,
        renderCanvas,
        paramsSchema,
        code,
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
    URL.revokeObjectURL(url!);
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

      const funcIndex = userFuncs.findIndex((func) => func.key === renderKey);
      if (funcIndex !== -1) {
        setUserFuncs(funcIndex, "thumb", thumbnail);
      }
    } catch (e) {
      console.error(`${renderKey} thumbnail render:`, e);
    }
  };

  const createAndSelectFunc = (name: string, code: string) => {
    let count = 1;
    let key = `${name} ${count}`;
    const keys = userFuncs.map((func) => func.key);
    while (keys.includes(key)) {
      count++;
      key = `${name} ${count}`;
    }
    keys.push(key);

    // TODO double setting thumbs
    setUserFuncs(userFuncs.length, { key, thumb: FALLBACK_THUMB });
    localStorage.setItem(USER_FUNC_KEYS_KEY, keys.join(","));
    setRenderFuncKey(key);
    userSetCode(code, true);
  };

  return (
    <div class={props.class}>
      <TextareaInput
        placeholder="https://qrframe.kylezhe.ng"
        setValue={(s) => setInputQr("text", s)}
      />
      <Collapsible trigger="Data">
        <Settings />
      </Collapsible>
      <Collapsible trigger="Render" defaultOpen>
        <div class="py-4">
          <div class="mb-4 h-[180px] md:(h-unset)">
            <div class="flex justify-between">
              <div class="text-sm py-2 border border-transparent">Render function</div>
              <Show
                when={!Object.keys(PRESET_MODULES).includes(renderFuncKey())}
              >
                <div class="flex gap-1">
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

                              const userFuncKeys = Object.values(userFuncs).map(
                                (func) => func.key
                              );

                              if (
                                Object.keys(PRESET_MODULES).includes(
                                  rename()
                                ) ||
                                userFuncKeys.includes(rename())
                              ) {
                                setDuplicate(true);
                              } else {
                                localStorage.removeItem(renderFuncKey());
                                localStorage.setItem(rename(), code());
                                setUserFuncs(
                                  userFuncKeys.indexOf(renderFuncKey()),
                                  "key",
                                  rename()
                                );
                                localStorage.setItem(
                                  USER_FUNC_KEYS_KEY,
                                  userFuncKeys.join(",")
                                );

                                setRenderFuncKey(rename());
                                close();
                              }
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
                              const userFuncKeys = Object.values(userFuncs).map(
                                (func) => func.key
                              );

                              setUserFuncs((funcs) =>
                                funcs.filter(
                                  (func) => func.key !== renderFuncKey()
                                )
                              );
                              localStorage.removeItem(renderFuncKey());

                              localStorage.setItem(
                                USER_FUNC_KEYS_KEY,
                                userFuncKeys.join(",")
                              );

                              setRenderFuncKey("Square");
                              // @ts-expect-error renderSVG narrow to wider is fine b/c valid params
                              internalSetCode(PRESET_MODULES.Square);

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
                </div>
              </Show>
            </div>
            <div class="flex gap-3 pt-2 pb-4 md:(flex-wrap static ml-0 px-0 overflow-x-visible) absolute max-w-full overflow-x-auto -ml-6 px-6">
              <For each={Object.entries(PRESET_MODULES)}>
                {([key, preset]) => (
                  <Preview
                    onClick={() => {
                      setRenderFuncKey(key);
                      // @ts-expect-error assigning narrow to wider is ok b/c params validated
                      internalSetCode(preset);
                    }}
                    label={key}
                    active={renderFuncKey() === key}
                  >
                    <img
                      class="rounded-sm"
                      src={presetThumbs()[key as keyof typeof PRESET_MODULES]}
                    />
                  </Preview>
                )}
              </For>
              <For each={userFuncs}>
                {(func) => (
                  <Preview
                    onClick={() => {
                      let storedCode = localStorage.getItem(func.key);
                      if (storedCode == null) {
                        storedCode = `Failed to load ${func.key}`;
                      }
                      setRenderFuncKey(func.key);
                      userSetCode(storedCode, false);
                    }}
                    label={func.key}
                    active={renderFuncKey() === func.key}
                  >
                    <img class="rounded-sm" src={func.thumb} />
                  </Preview>
                )}
              </For>
              <Preview
                onClick={() =>
                  createAndSelectFunc("custom", PRESET_MODULES.Square.code)
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
              if (Object.keys(PRESET_MODULES).includes(renderFuncKey())) {
                createAndSelectFunc(renderFuncKey(), code);
              } else {
                userSetCode(code, true);
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
