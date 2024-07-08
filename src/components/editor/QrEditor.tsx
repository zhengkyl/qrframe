import { For, Show, createSignal, onMount, type JSX } from "solid-js";
import { useQrContext, type RenderFunc } from "~/lib/QrContext";
import {
  ECL_NAMES,
  ECL_VALUE,
  MASK_KEY,
  MASK_NAMES,
  MASK_VALUE,
  MODE_KEY,
  MODE_NAMES,
  MODE_VALUE,
} from "~/lib/options";
import { ButtonGroup, ButtonGroupItem } from "../ButtonGroup";
import { TextInput, TextareaInput } from "../TextInput";
import { NumberInput } from "../NumberInput";
import { GroupedSelect, Select } from "../Select";

import { createStore } from "solid-js/store";
import { CodeInput } from "../CodeInput";
import Trash2 from "lucide-solid/icons/trash-2";
import Pencil from "lucide-solid/icons/pencil";
import { IconButtonDialog } from "../Dialog";
import { FillButton, FlatButton } from "../Button";
import { Collapsible } from "../Collapsible";

type Props = {
  class?: string;
};

const ADD_NEW_FUNC_KEY = "Add new function";
const USER_FUNC_KEYS_KEY = "userFuncKeys";

export function Editor(props: Props) {
  const { inputQr, setInputQr, setRenderFunc } = useQrContext();
  const [code, setCode] = createSignal(PRESET_FUNCS.Square);

  const [compileError, setCompileError] = createSignal<string | null>(null);

  const [userFuncKeys, setUserFuncKeys] = createStore<string[]>([]);
  const [funcKey, setFuncKey] = createSignal("Square");

  onMount(() => {
    const storedFuncKeys = localStorage.getItem(USER_FUNC_KEYS_KEY);
    if (storedFuncKeys == null) return;

    const keys = storedFuncKeys.split(",");
    for (const key of keys) {
      const funcCode = localStorage.getItem(key);
      if (funcCode == null) continue;
      setUserFuncKeys(userFuncKeys.length, key);
    }
  });

  const trySetCode = (newCode: string) => {
    try {
      const render = new Function("qr", "ctx", newCode) as RenderFunc;
      setCode(newCode);
      setRenderFunc(() => render);
      setCompileError(null);

      if (!PRESET_FUNCS.hasOwnProperty(funcKey())) {
        localStorage.setItem(funcKey(), newCode);
      }
    } catch (e) {
      setCompileError(e!.toString());
    }
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
    setFuncKey(key);
    trySetCode(code);
  };

  return (
    <div class={props.class}>
      <TextareaInput
        placeholder="https://qrcode.kylezhe.ng"
        setValue={(s) => setInputQr("text", s)}
      />
      <Collapsible trigger="Settings" defaultOpen>
        <div class="flex justify-between">
          <div class="text-sm py-2">Encoding mode</div>
          <Select
            options={MODE_NAMES}
            value={MODE_KEY[inputQr.mode!]}
            setValue={(name) => setInputQr("mode", MODE_VALUE[name])}
          />
        </div>
        <Row title="Min version">
          <NumberInput
            min={1}
            max={40}
            value={inputQr.minVersion}
            setValue={(v) => setInputQr("minVersion", v)}
          />
        </Row>
        <Row title="Min error tolerance">
          <ButtonGroup
            value={ECL_NAMES[inputQr.minEcl]}
            setValue={(v) => setInputQr("minEcl", ECL_VALUE[v])}
          >
            <For each={ECL_NAMES}>
              {(name) => <ButtonGroupItem value={name}>{name}</ButtonGroupItem>}
            </For>
          </ButtonGroup>
        </Row>
        <Row title="Mask pattern">
          <ButtonGroup
            value={MASK_KEY[inputQr.mask!]}
            setValue={(name) => setInputQr("mask", MASK_VALUE[name])}
          >
            <For each={MASK_NAMES}>
              {(value) => (
                <ButtonGroupItem value={value}>{value}</ButtonGroupItem>
              )}
            </For>
          </ButtonGroup>
        </Row>
        <Row title="Margin">
          <NumberInput
            min={0}
            max={10}
            step={1}
            value={inputQr.margin.top}
            setValue={(v) =>
              setInputQr("margin", { top: v, bottom: v, left: v, right: v })
            }
          />
        </Row>
      </Collapsible>
      <Collapsible trigger="Rendering">
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
              value={funcKey()}
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
                  setFuncKey(key);
                  trySetCode(storedCode);
                }
              }}
            />
            <Show when={userFuncKeys.includes(funcKey())}>
              <IconButtonDialog
                title={`Rename ${funcKey()}`}
                triggerTitle="Rename"
                triggerChildren={<Pencil class="w-5 h-5" />}
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                {(close) => {
                  const [rename, setRename] = createSignal(funcKey());
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
                        placeholder={funcKey()}
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
                          if (rename() === funcKey()) return close();

                          if (
                            Object.keys(PRESET_FUNCS).includes(rename()) ||
                            userFuncKeys.includes(rename())
                          ) {
                            setDuplicate(true);
                          } else {
                            localStorage.removeItem(funcKey());
                            localStorage.setItem(rename(), code());
                            setUserFuncKeys(
                              userFuncKeys.indexOf(funcKey()),
                              rename()
                            );
                            localStorage.setItem(
                              USER_FUNC_KEYS_KEY,
                              userFuncKeys.join(",")
                            );

                            setFuncKey(rename());
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
                title={`Delete ${funcKey()}`}
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
                            keys.filter((key) => key !== funcKey())
                          );
                          localStorage.removeItem(funcKey());
                          setFuncKey("Square");

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
        <CodeInput
          initialValue={code()}
          onSave={(code) => {
            if (Object.keys(PRESET_FUNCS).includes(funcKey())){
              createAndSelectFunc(funcKey(), code)
            } else {
              trySetCode(code)
            }
          }}
          error={compileError()}
          clearError={() => setCompileError(null)}
        />
      </Collapsible>
    </div>
  );
}

function Row(props: {
  tooltip?: string;
  title: string;
  children: JSX.Element;
}) {
  // This should be <label/> but clicking selects first button in buttongroup
  return (
    <div>
      <div class="text-sm py-2" title={props.tooltip}>
        {props.title}
      </div>
      {props.children}
    </div>
  );
}

const PRESET_FUNCS = {
  Square: `// qr, ctx are args
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
`,
  Circle: `// qr, ctx are args
const Module = {
  DataOFF: 0,
  DataON: 1,
  FinderOFF: 2,
  FinderON: 3,
  AlignmentOFF: 4,
  AlignmentON: 5,
  TimingOFF: 6,
  TimingON: 7,
  FormatOFF: 8,
  FormatON: 9,
  VersionOFF: 10,
  VersionON: 11,
  Unset: 12,
}

const pixelSize = 10;
ctx.canvas.width = qr.matrixWidth * pixelSize;
ctx.canvas.height = qr.matrixHeight * pixelSize;

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

ctx.fillStyle = "rgb(0, 0, 0)";

const radius = pixelSize / 2;

const finderPos = [
  [qr.margin.left, qr.margin.top],
  [qr.matrixWidth - qr.margin.right - 7, qr.margin.top],
  [qr.margin.left, qr.matrixHeight - qr.margin.bottom - 7],
];

for (const [x, y] of finderPos) {
  ctx.beginPath();
  ctx.arc((x + 3.5) * pixelSize, (y + 3.5) * pixelSize, 3.5 * pixelSize, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.beginPath();
  ctx.arc((x + 3.5) * pixelSize, (y + 3.5) * pixelSize, 2.5 * pixelSize, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.beginPath();
  ctx.arc((x + 3.5) * pixelSize, (y + 3.5) * pixelSize, 1.5 * pixelSize, 0, 2 * Math.PI);
  ctx.fill();
}

for (let y = 0; y < qr.matrixHeight; y++) {
  for (let x = 0; x < qr.matrixWidth; x++) {
    const module = qr.matrix[y * qr.matrixWidth + x];

    if (module & 1) {
      if (module === Module.FinderON) continue;
      
      const xCenter = x * pixelSize + radius;
      const yCenter = y * pixelSize + radius;

      ctx.beginPath();
      ctx.arc(xCenter, yCenter, radius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
`,
};
