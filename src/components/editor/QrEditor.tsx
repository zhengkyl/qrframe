import Pencil from "lucide-solid/icons/pencil";
import Trash2 from "lucide-solid/icons/trash-2";
import { For, Show, batch, createSignal, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic } from "solid-js/web";
import {
  PARAM_COMPONENTS,
  PARAM_DEFAULTS,
  PARAM_TYPES,
  type Params,
  type ParamsSchema,
} from "~/lib/params";
import { PRESET_FUNCS } from "~/lib/presetFuncs";
import { useQrContext } from "~/lib/QrContext";
import { FillButton, FlatButton } from "../Button";
import { Collapsible } from "../Collapsible";
import { IconButtonDialog } from "../Dialog";
import { GroupedSelect } from "../Select";
import { TextInput, TextareaInput } from "../TextInput";
import { CodeEditor } from "./CodeEditor";
import { Settings } from "./Settings";

type Props = {
  class?: string;
};

const ADD_NEW_FUNC_KEY = "Add new function";
const USER_FUNC_KEYS_KEY = "userFuncKeys";

export function Editor(props: Props) {
  const {
    setInputQr,
    setRenderFunc,
    renderFuncKey,
    setRenderFuncKey,
    paramsSchema,
    setParamsSchema,
    params,
    setParams,
  } = useQrContext();

  const [code, setCode] = createSignal(PRESET_FUNCS.Square);

  const [compileError, setCompileError] = createSignal<string | null>(null);

  const [userFuncKeys, setUserFuncKeys] = createStore<string[]>([]);

  onMount(() => {
    const storedFuncKeys = localStorage.getItem(USER_FUNC_KEYS_KEY);
    if (storedFuncKeys == null) return;

    const keys = storedFuncKeys.split(",");
    for (const key of keys) {
      const funcCode = localStorage.getItem(key);
      if (funcCode == null) continue;
      setUserFuncKeys(userFuncKeys.length, key);
    }

    trySetCode(PRESET_FUNCS.Square)
  });

  const trySetCode = async (newCode: string) => {
    let url;
    try {
      const blob = new Blob([newCode], { type: "text/javascript" });
      url = URL.createObjectURL(blob);

      const {
        renderCanvas,
        renderSVG,
        paramsSchema: rawParamsSchema,
      } = await import(/* @vite-ignore */ url);

      if (renderCanvas == null && renderSVG == null) {
        throw new Error("One of renderCanvas and renderSVG must be exported");
      } else if (renderCanvas != null && renderSVG != null) {
        throw new Error("renderCanvas and renderSVG cannot both be exported");
      }

      // TODO
      // refactor to parsing instead of validating...
      // maybe use zod?
      // for now this is easier and prevents obvious accidental crashing
      let parsedParamsSchema: ParamsSchema = {};
      if (typeof rawParamsSchema === "object") {
        for (const [key, value] of Object.entries(rawParamsSchema)) {
          if (
            value == null ||
            typeof value !== "object" ||
            !("type" in value) ||
            typeof value.type !== "string" ||
            !PARAM_TYPES.includes(value.type)
          ) {
            continue;
          } else if (value.type === "Select") {
            if (
              !("options" in value) ||
              !Array.isArray(value.options) ||
              value.options.length === 0
            ) {
              continue;
            }
          }

          // @ts-expect-error prop types aren't validated yet, see above TODO
          parsedParamsSchema[key] = value;
        }
      }

      setCode(newCode);
      setParamsSchema(parsedParamsSchema);

      batch(() => {
        const defaultParams: Params = {};
        Object.entries(parsedParamsSchema).forEach(([label, props]) => {
          // null is a valid default value for ImageInput
          if (props.default !== undefined) {
            defaultParams[label] = props.default;
          } else if (props.type === "Select") {
            defaultParams[label] = props.options[0];
          } else {
            defaultParams[label] = PARAM_DEFAULTS[props.type];
          }
        });
        // todo we shouldn't override if paramSchema doesn't change
        setParams(defaultParams); // todo init with default values from schema
        setRenderFunc(() => renderCanvas);
      });

      if (!PRESET_FUNCS.hasOwnProperty(renderFuncKey())) {
        localStorage.setItem(renderFuncKey(), newCode);
      }

      setCompileError(null);
    } catch (e) {
      console.log("e", e!.toString());
      setCompileError(e!.toString());
    }
    URL.revokeObjectURL(url!);
  };

  const createAndSelectFunc = (name: string, code: string) => {
    let count = 1;
    let key = `${name} ${count}`;
    while (userFuncKeys.includes(key)) {
      count++;
      key = `${name} ${count}`;
    }

    setUserFuncKeys(userFuncKeys.length, key);
    localStorage.setItem(USER_FUNC_KEYS_KEY, userFuncKeys.join(","));
    setRenderFuncKey(key);
    trySetCode(code);
  };

  return (
    <div class={props.class}>
      <TextareaInput
        placeholder="https://qrcode.kylezhe.ng"
        setValue={(s) => setInputQr("text", s)}
      />
      <Collapsible trigger="QR Code">
        <Settings />
      </Collapsible>
      <Collapsible trigger="Rendering" defaultOpen>
        <div class="mb-4">
          <div class="text-sm py-2">Render function</div>
          <div class="flex gap-2">
            <GroupedSelect
              options={[
                {
                  label: "Presets",
                  options: Object.keys(PRESET_FUNCS),
                },
                {
                  label: "Custom",
                  options: [...userFuncKeys, ADD_NEW_FUNC_KEY],
                },
              ]}
              value={renderFuncKey()}
              setValue={(key) => {
                if (key === ADD_NEW_FUNC_KEY) {
                  createAndSelectFunc("render function", PRESET_FUNCS.Square);
                } else {
                  let storedCode;
                  if (PRESET_FUNCS.hasOwnProperty(key)) {
                    storedCode = PRESET_FUNCS[key as keyof typeof PRESET_FUNCS];
                  } else {
                    storedCode = localStorage.getItem(key);
                    if (storedCode == null) {
                      storedCode = `Failed to load ${key}`;
                    }
                  }
                  setRenderFuncKey(key);
                  trySetCode(storedCode);
                }
              }}
            />
            <Show when={userFuncKeys.includes(renderFuncKey())}>
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

                          if (
                            Object.keys(PRESET_FUNCS).includes(rename()) ||
                            userFuncKeys.includes(rename())
                          ) {
                            setDuplicate(true);
                          } else {
                            localStorage.removeItem(renderFuncKey());
                            localStorage.setItem(rename(), code());
                            setUserFuncKeys(
                              userFuncKeys.indexOf(renderFuncKey()),
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
                          setUserFuncKeys((keys) =>
                            keys.filter((key) => key !== renderFuncKey())
                          );
                          localStorage.removeItem(renderFuncKey());
                          setRenderFuncKey("Square");

                          localStorage.setItem(
                            USER_FUNC_KEYS_KEY,
                            userFuncKeys.join(",")
                          );

                          trySetCode(PRESET_FUNCS.Square);

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
            if (Object.keys(PRESET_FUNCS).includes(renderFuncKey())) {
              createAndSelectFunc(renderFuncKey(), code);
            } else {
              trySetCode(code);
            }
          }}
          error={compileError()}
          clearError={() => setCompileError(null)}
        />
      </Collapsible>
    </div>
  );
}
