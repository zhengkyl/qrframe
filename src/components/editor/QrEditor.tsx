import Pencil from "lucide-solid/icons/pencil";
import Trash2 from "lucide-solid/icons/trash-2";
import { For, Show, batch, createSignal, onMount, type JSX } from "solid-js";
import { createStore } from "solid-js/store";
import {
  deepEqualObj,
  defaultParams,
  parseParamsSchema,
  type ParamsSchema,
} from "~/lib/params";
import { PRESET_CODE } from "~/lib/presets";
import { useQrContext } from "~/lib/QrContext";
import { useRenderContext, type RenderType } from "~/lib/RenderContext";
import Tutorial from "../../../presets/Tutorial?raw";
import { FillButton, FlatButton } from "../Button";
import { Collapsible } from "../Collapsible";
import { ContentMenuTrigger, ContextMenuProvider } from "../ContextMenu";
import { ControlledDialog, DialogButton } from "../Dialog";
import { TextInput, TextareaInput } from "../TextInput";
import { CodeEditor } from "./CodeEditor";
import { ParamsEditor } from "./ParamsEditor";
import { Settings } from "./Settings";

import "virtual:blob-rewriter";

type Props = {
  class?: string;
  onTextFocus: () => void;
  onTextBlur: () => void;
  textRef: (ref: HTMLTextAreaElement) => void;
};

const FUNC_KEYS = "funcKeys";

const VERSION = 2;
const PRESETS_VERSION = "presetsVersion";

const LOADING_THUMB = `data:image/svg+xml,<svg viewBox="-12 -12 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"><animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite"/></path></svg>`;

type Thumbs = { [T in keyof typeof PRESET_CODE]: string } & {
  [key: string]: string;
};

const presetKeys = Object.keys(PRESET_CODE);
function isPreset(key: string): key is keyof typeof PRESET_CODE {
  return presetKeys.includes(key);
}

export function Editor(props: Props) {
  const { setInputQr } = useQrContext();
  const {
    paramsSchema,
    setParamsSchema,
    setParams,
    renderKey,
    setRenderKey,
    setRender,
    setError,
  } = useRenderContext();

  const [code, setCode] = createSignal(PRESET_CODE.Basic);
  const [funcKeys, _setFuncKeys] = createStore<string[]>([]);
  const [thumbs, setThumbs] = createStore<Thumbs>({} as Thumbs);

  // Dialog open state must be separate from render state,
  // to allow animating in/out of existence
  const [renameOpen, setRenameOpen] = createSignal(false);
  const [deleteOpen, setDeleteOpen] = createSignal(false);
  const [dialogKey, setDialogKey] = createSignal<string>("");

  let thumbWorker: Worker | null = null;
  const timeoutIdMap = new Map<NodeJS.Timeout, string>();

  onMount(async () => {
    async function updatePresetThumbnail(key: keyof typeof PRESET_CODE) {
      // preset CAN error out, e.g. when importing 3rd party dep
      try {
        const { type, url, parsedParamsSchema } = await importCode(
          PRESET_CODE[key]
        );
        asyncUpdateThumbnail(key, type, url, parsedParamsSchema);
      } catch (e) {
        // skippa
      }
    }
    const storedVersion = localStorage.getItem(PRESETS_VERSION);
    const upToDate =
      storedVersion != null && parseInt(storedVersion) >= VERSION;
    if (!upToDate) {
      localStorage.setItem(PRESETS_VERSION, VERSION.toString());
      for (const key of presetKeys) {
        updatePresetThumbnail(key as keyof typeof PRESET_CODE);
      }
    }

    const storedFuncKeys = localStorage.getItem(FUNC_KEYS);
    let keys;
    if (storedFuncKeys == null || storedFuncKeys === "") {
      keys = presetKeys;
    } else {
      keys = presetKeys.concat(storedFuncKeys.split(","));
    }
    setFuncKeys(keys);
    setExistingKey(keys[0]);

    for (const key of keys) {
      // don't override asynchronously set thumbnails above
      if (!upToDate && isPreset(key)) continue;

      const tryThumb = localStorage.getItem(`${key}_thumb`);
      if (tryThumb != null) {
        setThumbs(key, tryThumb);
        continue;
      }
      if (isPreset(key)) updatePresetThumbnail(key);
    }
  });

  const setFuncKeys: typeof _setFuncKeys = (...args: any[]) => {
    // @ts-expect-error this is fine
    _setFuncKeys(...args);
    localStorage.setItem(
      FUNC_KEYS,
      funcKeys.filter((key) => !presetKeys.includes(key)).join(",")
    );
  };

  const setExistingKey = (key: string) => {
    setRenderKey(key);
    if (isPreset(key)) {
      saveAndRun(PRESET_CODE[key], false, false);
    } else {
      let storedCode = localStorage.getItem(key);
      if (storedCode == null) {
        storedCode = `Failed to load ${key}`;
      }
      saveAndRun(storedCode, false, false);
    }
  };

  const importCode = async (code: string) => {
    const blob = new Blob([code], { type: "text/javascript" });
    // This url is cleaned up in trySetCode()
    const url = URL.createObjectURL(blob);

    const {
      renderSVG,
      renderCanvas,
      paramsSchema: rawParamsSchema,
    } = await import(/* @vite-ignore */ url);

    let type = "" as RenderType;
    if (typeof renderSVG === "function") {
      type = "svg";
    }
    if (typeof renderCanvas === "function") {
      if (type) {
        throw new Error("renderSVG and renderCanvas cannot both be exported");
      }
      type = "canvas";
    }
    if (!type) {
      throw new Error("renderSVG or renderCanvas must be exported");
    }

    // TODO see impl, user set default and props might be wrong
    const parsedParamsSchema = parseParamsSchema(rawParamsSchema);

    return { type, url, parsedParamsSchema };
  };

  const saveAndRun = async (
    code: string,
    save: boolean,
    thumbnail: boolean
  ) => {
    try {
      setCode(code);
      if (save) {
        localStorage.setItem(renderKey(), code);
      }

      const { type, url, parsedParamsSchema } = await importCode(code);
      setError(null);

      // batched b/c trigger rendering effect
      batch(() => {
        if (!deepEqualObj(parsedParamsSchema, paramsSchema())) {
          setParams(defaultParams(parsedParamsSchema));
        }
        setParamsSchema(parsedParamsSchema); // always update in case different property order
        setRender((prev) => {
          // TODO consider caching for faster switching?
          if (prev != null) {
            URL.revokeObjectURL(prev.url);
          }
          return { type, url };
        });
      });

      if (thumbnail) {
        asyncUpdateThumbnail(renderKey(), type, url, parsedParamsSchema);
      }
    } catch (e) {
      console.error("e", e!.toString());
      setError(e!.toString());
    }
  };

  const asyncUpdateThumbnail = (
    key: string,
    type: "svg" | "canvas",
    url: string,
    parsedParamsSchema: ParamsSchema
  ) => {
    if (thumbWorker == null) setupThumbWorker();

    const timeoutId = setTimeout(() => {
      console.error(
        `Thumbnail took longer than 5 seconds, timed out!`,
        timeoutId
      );
      timeoutIdMap.delete(timeoutId);
      if (thumbWorker != null) {
        thumbWorker.terminate();
        thumbWorker = null;
      }
    }, 5000);
    timeoutIdMap.set(timeoutId, key);

    thumbWorker!.postMessage({
      type,
      url,
      params: defaultParams(parsedParamsSchema),
      timeoutId,
    });
  };

  const setupThumbWorker = () => {
    console.log("Starting thumbnailWorker");
    thumbWorker = new Worker("thumbnailWorker.js", { type: "module" });

    thumbWorker.onmessage = (e) => {
      clearTimeout(e.data.timeoutId);
      const key = timeoutIdMap.get(e.data.timeoutId)!;
      timeoutIdMap.delete(e.data.timeoutId);

      let thumbnail;
      switch (e.data.type) {
        case "svg":
          thumbnail = "data:image/svg+xml," + e.data.svg.replaceAll("#", "%23");
          break;
        case "canvas":
          const size = 96;
          const smallCanvas = document.createElement("canvas");

          smallCanvas.width = size;
          smallCanvas.height = size;
          const smallCtx = smallCanvas.getContext("2d")!;
          smallCtx.drawImage(e.data.bitmap, 0, 0, size, size);
          e.data.bitmap.close();

          thumbnail = smallCanvas.toDataURL("image/jpeg", 0.5);
          break;
        case "error":
          console.error(e.data.error);
          return;
      }

      localStorage.setItem(`${key}_thumb`, thumbnail!);
      setThumbs(key, thumbnail!);
    };
  };

  const createAndSelectFunc = (name: string, code: string) => {
    let count = 1;
    let key = `${name} ${count}`;
    while (funcKeys.includes(key)) {
      count++;
      key = `${name} ${count}`;
    }
    setFuncKeys(funcKeys.length, key);

    setThumbs(key, LOADING_THUMB);
    setRenderKey(key);
    saveAndRun(code, true, true);
  };

  return (
    <div class={props.class}>
      <TextareaInput
        placeholder="https://qrframe.kylezhe.ng"
        setValue={(s) => setInputQr("text", s || "https://qrframe.kylezhe.ng")}
        onFocus={props.onTextFocus}
        onBlur={props.onTextBlur}
        ref={props.textRef}
      />
      <Collapsible trigger="Data">
        <Settings />
      </Collapsible>
      <Collapsible trigger="Render" defaultOpen>
        <ControlledDialog
          open={renameOpen()}
          setOpen={setRenameOpen}
          title={`Rename ${dialogKey()}`}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {(close) => {
            const key = dialogKey();
            const [rename, setRename] = createSignal(key);
            const [duplicate, setDuplicate] = createSignal(false);

            let ref: HTMLInputElement;
            onMount(() => ref.focus());

            const onSubmit = () => {
              if (rename() === key) return close();

              if (funcKeys.includes(rename())) {
                setDuplicate(true);
                return;
              }

              const thumb = thumbs[key];
              localStorage.setItem(rename(), code());
              localStorage.setItem(`${rename()}_thumb`, thumb);

              localStorage.removeItem(key);
              localStorage.removeItem(`${key}_thumb`);

              setThumbs(rename(), thumb);
              setThumbs(key, undefined!);

              setFuncKeys(funcKeys.indexOf(key), rename());

              setRenderKey(rename());
              close();
            };
            return (
              <>
                <TextInput
                  class="mt-2"
                  ref={ref!}
                  defaultValue={rename()}
                  onInput={(s) => {
                    if (duplicate()) setDuplicate(false);
                    setRename(s);
                  }}
                  placeholder={key}
                  onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                />
                <div class="absolute p-1 text-sm text-red-600">
                  <Show when={duplicate()}>{rename()} already exists.</Show>
                </div>
                <FillButton
                  class="px-3 py-2 float-right mt-4"
                  // input onChange runs after focus lost, so onMouseDown is too early
                  onClick={onSubmit}
                >
                  Confirm
                </FillButton>
              </>
            );
          }}
        </ControlledDialog>
        <ControlledDialog
          open={deleteOpen()}
          // This is controlled, so it will never be called with true
          setOpen={setDeleteOpen}
          title={`Delete ${dialogKey()}`}
        >
          {(close) => {
            const key = dialogKey();
            return (
              <>
                <p class="mb-4 text-sm">
                  Are you sure you want to delete this function?
                </p>
                <div class="flex justify-end gap-2">
                  <FillButton
                    onMouseDown={() => {
                      localStorage.removeItem(key);
                      localStorage.removeItem(`${key}_thumb`);
                      setThumbs(key, undefined!);

                      setFuncKeys((keys) => keys.filter((k) => k !== key));

                      setExistingKey(funcKeys[0]);
                      close();
                    }}
                  >
                    Confirm
                  </FillButton>
                  <FlatButton onMouseDown={close}>Cancel</FlatButton>
                </div>
              </>
            );
          }}
        </ControlledDialog>
        <div class="py-4">
          <div class="mb-4 h-[180px] md:(h-unset)">
            <div class="flex justify-between">
              <div class="text-sm py-2 border border-transparent">Presets</div>
              <div class="flex gap-2">
                <div class="flex items-center font-bold">{renderKey()}</div>
                <Show when={!presetKeys.includes(renderKey())}>
                  <DialogButton
                    title="Rename"
                    onClick={() => {
                      batch(() => {
                        setDialogKey(renderKey());
                        setRenameOpen(true);
                      });
                    }}
                  >
                    <Pencil class="w-5 h-5" />
                  </DialogButton>
                  <DialogButton
                    title="Delete"
                    onClick={() => {
                      batch(() => {
                        setDialogKey(renderKey());
                        setDeleteOpen(true);
                      });
                    }}
                  >
                    <Trash2 class="w-5 h-5" />
                  </DialogButton>
                </Show>
              </div>
            </div>
            <div class="flex gap-3 pt-2 pb-4 md:(flex-wrap static ml-0 px-0 overflow-x-visible) absolute max-w-full overflow-x-auto -ml-6 px-6">
              <ContextMenuProvider
                disabled={isPreset(dialogKey())}
                onRename={() => setRenameOpen(true)}
                onDelete={() => setDeleteOpen(true)}
              >
                <For each={funcKeys}>
                  {(key) => (
                    <ContentMenuTrigger>
                      <Preview
                        onContextMenu={() => setDialogKey(key)}
                        onClick={() => setExistingKey(key)}
                        label={key}
                        active={renderKey() === key}
                      >
                        <img class="rounded-sm" src={thumbs[key]} />
                      </Preview>
                    </ContentMenuTrigger>
                  )}
                </For>
              </ContextMenuProvider>
              <Preview
                onClick={() => createAndSelectFunc("custom", Tutorial)}
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
          <ParamsEditor />
          <CodeEditor
            initialValue={code()}
            onSave={(code, updateThumbnail) => {
              if (presetKeys.includes(renderKey())) {
                createAndSelectFunc(renderKey(), code);
              } else {
                saveAndRun(code, true, updateThumbnail);
              }
            }}
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
  onContextMenu?: () => void;
};
function Preview(props: PreviewProps) {
  return (
    <button
      class="rounded-sm focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
      onClick={props.onClick}
      onContextMenu={props.onContextMenu}
    >
      <div
        classList={{
          "h-24 w-24 rounded-sm checkerboard": true,
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
