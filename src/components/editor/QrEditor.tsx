import { For, createSignal, onCleanup, onMount, type JSX } from "solid-js";
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
import { FlatButton } from "../Button";
import { ButtonGroup, ButtonGroupItem } from "../ButtonGroup";
import { TextInput, TextareaInput } from "../TextInput";
import { NumberInput } from "../NumberInput";
import { GroupedSelect, Select } from "../Select";

import { createStore } from "solid-js/store";
import { CodeInput } from "../CodeInput";
import { Switch } from "../Switch";
import type { EditorView } from "codemirror";

type Props = {
  class?: string;
};

const ADD_NEW_FUNC_KEY = "Add new function";
const USER_FUNC_KEYS_KEY = "userFuncKeys";

export function Editor(props: Props) {
  let editorView: EditorView;
  const { inputQr, setInputQr, setRenderFunc } = useQrContext();
  const [code, setCode] = createSignal(PRESET_FUNCS.Square);
  const [dirty, setDirty] = createSignal(false);
  // const [savedCode, setSavedCode] = createSignal(code());
  // const [codeKey, setCodeKey] = createSignal("render function 1");

  const [compileError, setCompileError] = createSignal<string | null>(null);

  const [userFuncKeys, setUserFuncKeys] = createStore<string[]>([]);
  const [currFunc, setCurrFunc] = createSignal("Square");

  const [vimMode, setVimMode] = createSignal(false);

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

  // onCleanup(()=> {
  //   localStorage.setItem("renderCodes", codes.join(","))
  // })

  const trySaveCode = (newCode: string) => {
    try {
      const render = new Function("qr", "ctx", newCode) as RenderFunc;
      setCode(newCode);
      setRenderFunc(() => render);
      setCompileError(null);
      setDirty(false)

      if (!PRESET_FUNCS.hasOwnProperty(currFunc())) {
        localStorage.setItem(currFunc(), newCode);
      }
    } catch (e) {
      setCompileError(e!.toString());
    }
  };

  return (
    <div class={props.class}>
      <TextareaInput setValue={(s) => setInputQr("text", s)} />
      <div class="flex justify-between">
        <div class="text-sm py-2" title="Also known as Mode">
          Encoding
        </div>
        <Select
          options={MODE_NAMES}
          value={MODE_KEY[inputQr.mode!]}
          setValue={(name) => setInputQr("mode", MODE_VALUE[name])}
        />
      </div>
      <Row title="Min symbol size" tooltip="Also known as Version">
        <NumberInput
          min={1}
          max={40}
          value={inputQr.minVersion}
          setValue={(v) => setInputQr("minVersion", v)}
        />
      </Row>
      <Row
        title="Min error tolerance"
        tooltip="Also known as Error Correction Level"
      >
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
      <div>
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
            value={currFunc()}
            setValue={(key) => {
              let storedCode;
              if (key === ADD_NEW_FUNC_KEY) {
                let count = userFuncKeys.length + 1;
                key = `render function ${count}`;
                while (userFuncKeys.includes(key)) {
                  count++;
                  key = `render function ${count}`;
                }

                setUserFuncKeys(userFuncKeys.length, key);
                localStorage.setItem(
                  USER_FUNC_KEYS_KEY,
                  userFuncKeys.join(",")
                );
                storedCode = PRESET_FUNCS.Square;
              } else {
                if (PRESET_FUNCS.hasOwnProperty(key)) {
                  storedCode = PRESET_FUNCS[key as keyof typeof PRESET_FUNCS];
                } else {
                  storedCode = localStorage.getItem(key);
                  if (storedCode == null) {
                    storedCode = `Failed to load ${key}`;
                  }
                }
              }

              setCurrFunc(key);
              setCode(storedCode);
              trySaveCode(storedCode);
            }}
          />
          <FlatButton
            class="px-3 py-1 min-w-150px"
            disabled={!dirty()}
            onMouseDown={() => trySaveCode(editorView.state.doc.toString())}
          >
            {dirty() ? "Save" : "No changes"}
          </FlatButton>
        </div>
        <div class="flex py-2">
          <Switch label="Vim mode" value={vimMode()} setValue={setVimMode} />
        </div>

        <div>{compileError()}</div>
        <div class="py-2">
          <CodeInput
            editorView={(ref) => (editorView = ref)}
            initialValue={code()}
            onSave={trySaveCode}
            vimMode={vimMode()}
            onDirty={setDirty}
          />
        </div>
      </div>
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
    <div title={props.tooltip}>
      <div class="text-sm py-2">{props.title}</div>
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
const pixelSize = 10;
ctx.canvas.width = qr.matrixWidth * pixelSize;
ctx.canvas.height = qr.matrixHeight * pixelSize;

ctx.fillStyle = "rgb(255, 255, 255)";
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

ctx.fillStyle = "rgb(0, 0, 0)";

const radius = pixelSize / 2;

for (let y = 0; y < qr.matrixHeight; y++) {
  for (let x = 0; x < qr.matrixWidth; x++) {
    const module = qr.matrix[y * qr.matrixWidth + x];

    if (module & 1) {
      const xCenter = x * pixelSize + radius;
      const yCenter = y * pixelSize + radius;

      ctx.beginPath();
      ctx.arc(xCenter, yCenter, radius, 0, 2 * Math.PI);
      ctx.fill();

      // ctx.stroke(); 
    }
  }
}
`,
};
