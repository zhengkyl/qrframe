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
  const {
    inputQr,
    setInputQr,
    setRenderFunc,
    renderFuncKey,
    setRenderFuncKey,
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
  });

  const trySetCode = (newCode: string) => {
    try {
      const render = new Function("qr", "ctx", newCode) as RenderFunc;
      setCode(newCode);
      setRenderFunc(() => render);
      setCompileError(null);

      if (!PRESET_FUNCS.hasOwnProperty(renderFuncKey())) {
        localStorage.setItem(renderFuncKey(), newCode);
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
    setRenderFuncKey(key);
    trySetCode(code);
  };

  return (
    <div class={props.class}>
      <TextareaInput
        placeholder="https://qrcode.kylezhe.ng"
        setValue={(s) => setInputQr("text", s)}
      />
      <Collapsible trigger="Settings">
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
        <CodeInput
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

function Row(props: {
  tooltip?: string;
  title: string;
  children: JSX.Element;
}) {
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

const gradient = ctx.createRadialGradient(
  ctx.canvas.width / 2,
  ctx.canvas.height / 2,
  2 * pixelSize,
  ctx.canvas.width / 2,
  ctx.canvas.height / 2,
  20 * pixelSize,
);

gradient.addColorStop(0, "red");
gradient.addColorStop(1, "blue");

ctx.fillStyle = gradient;

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
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc((x + 3.5) * pixelSize, (y + 3.5) * pixelSize, 1.5 * pixelSize, 0, 2 * Math.PI);
  ctx.fill();
}

const xMid = qr.matrixWidth / 2;
const yMid = qr.matrixHeight / 2;
const maxDist = Math.sqrt(xMid * xMid + yMid + yMid);
        
for (let y = 0; y < qr.matrixHeight; y++) {
  for (let x = 0; x < qr.matrixWidth; x++) {
    const module = qr.matrix[y * qr.matrixWidth + x];

    if (module & 1) {
      if (module === Module.FinderON) continue;
      if (module === Module.AlignmentON) {
        // Find top left corner of alignment square
        if (qr.matrix[(y - 1) * qr.matrixWidth + x] !== Module.AlignmentON &&
            qr.matrix[y * qr.matrixWidth + x - 1] !== Module.AlignmentON && 
            qr.matrix[y * qr.matrixWidth + x + 1] === Module.AlignmentON
           ) {
          ctx.beginPath();
          ctx.arc((x + 2.5) * pixelSize, (y + 2.5) * pixelSize, 2.5 * pixelSize, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = "rgb(255, 255, 255)";
          ctx.beginPath();
          ctx.arc((x + 2.5) * pixelSize, (y + 2.5) * pixelSize, 1.5 * pixelSize, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc((x + 2.5) * pixelSize, (y + 2.5) * pixelSize, 0.5 * pixelSize, 0, 2 * Math.PI);
          ctx.fill();
        }
        continue; 
      };

      const xCenter = x * pixelSize + radius;
      const yCenter = y * pixelSize + radius;

      const xDist = Math.abs(xMid - x);
      const yDist = Math.abs(yMid - y);
      const scale = Math.sqrt(xDist * xDist + yDist * yDist) / maxDist * 0.7 + 0.5;
      
      ctx.beginPath();
      ctx.arc(xCenter, yCenter, radius * scale, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
`,
  "Camouflage": `// qr, ctx are args
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

function splitmix32(a) {
 return function() {
   a |= 0;
   a = a + 0x9e3779b9 | 0;
   let t = a ^ a >>> 16;
   t = Math.imul(t, 0x21f0aaad);
   t = t ^ t >>> 15;
   t = Math.imul(t, 0x735a2d97);
   return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  }
}

const seededRand = splitmix32(1 /* change seed to change pattern */);

// Randomly set pixels in margin
for (let y = 0; y < qr.matrixHeight; y++) {
  for (let x = 0; x < qr.matrixWidth; x++) {
    if (y > qr.margin.top - 2 &&
        y < qr.matrixHeight - qr.margin.bottom + 1 &&
        x > qr.margin.left - 2 &&
        x < qr.matrixWidth - qr.margin.right + 1) {
       continue; 
    }

    if (seededRand() > 0.5) qr.matrix[y * qr.matrixWidth + x] = Module.DataON;
  }
}

const pixelSize = 20;
const radius = pixelSize / 2;
ctx.canvas.width = qr.matrixWidth * pixelSize;
ctx.canvas.height = qr.matrixHeight * pixelSize;

const fg = "rgb(40, 70, 10)";
const bg = "rgb(200, 200, 100)";

ctx.fillStyle = bg;
ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

const xMax = qr.matrixWidth - 1;
const yMax = qr.matrixHeight - 1;

for (let y = 0; y < qr.matrixHeight; y++) {
  for (let x = 0; x < qr.matrixWidth; x++) {
    const module = qr.matrix[y * qr.matrixWidth + x];

    const top = y > 0 && (qr.matrix[(y - 1) * qr.matrixWidth + x] & 1);
    const bottom = y < yMax && (qr.matrix[(y + 1) * qr.matrixWidth + x] & 1);
    const left = x > 0 && (qr.matrix[y * qr.matrixWidth + x - 1] & 1);
    const right = x < xMax && (qr.matrix[y * qr.matrixWidth + x + 1] & 1);

    ctx.fillStyle = fg;
    
    if (module & 1) {
      ctx.beginPath();
      ctx.roundRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize,
        [
          !left && !top && radius,
          !top && !right && radius,
          !right && !bottom && radius,
          !bottom && !left && radius,
        ]
      );
      ctx.fill();
    } else {
      // Draw rounded concave corners
      const topLeft = y > 0 && x > 0 && (qr.matrix[(y - 1) * qr.matrixWidth + x - 1] & 1);
      const topRight = y > 0 && x < xMax && (qr.matrix[(y - 1) * qr.matrixWidth + x + 1] & 1);
      const bottomRight = y < yMax && x < xMax && (qr.matrix[(y + 1) * qr.matrixWidth + x + 1] & 1);
      const bottomLeft = y < yMax && x > 0 && (qr.matrix[(y + 1) * qr.matrixWidth + x - 1] & 1);
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      
      ctx.beginPath();
      ctx.fillStyle = bg;
      ctx.roundRect(
        x * pixelSize,
        y * pixelSize,
        pixelSize,
        pixelSize,
        [
          left && top && topLeft && radius,
          top && right && topRight && radius,
          right && bottom && bottomRight && radius,
          bottom && left && bottomLeft && radius,
        ]
      );
      ctx.fill();
    }
  }
}
`,
  Minimal: `// qr, ctx are args
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

const pixelSize = 12;
ctx.canvas.width = qr.matrixWidth * pixelSize;
ctx.canvas.height = qr.matrixHeight * pixelSize;

const finderPos = [
  [qr.margin.left, qr.margin.top],
  [qr.matrixWidth - qr.margin.right - 7, qr.margin.top],
  [qr.margin.left, qr.matrixHeight - qr.margin.bottom - 7],
];

ctx.fillStyle = "rgb(0, 0, 0)";

for (const [x, y] of finderPos) {
  ctx.fillRect((x + 3) * pixelSize, y * pixelSize, pixelSize, pixelSize);
  ctx.fillRect((x + 3) * pixelSize, (y + 6) * pixelSize, pixelSize, pixelSize);
  ctx.fillRect(x * pixelSize, (y + 3) * pixelSize, pixelSize, pixelSize);
  ctx.fillRect((x + 6) * pixelSize, (y + 3) * pixelSize, pixelSize, pixelSize);
  
  ctx.fillRect((x + 2) * pixelSize, (y + 2) * pixelSize, 3 * pixelSize, 3 * pixelSize);
}

const minSize = pixelSize / 2;
const offset = (pixelSize - minSize) / 2;

for (let y = 0; y < qr.matrixHeight; y++) {
  for (let x = 0; x < qr.matrixWidth; x++) {
    const module = qr.matrix[y * qr.matrixWidth + x];
    if ((module | 1) === Module.FinderON) {
      continue;
    }
    
    if (module & 1) {
      ctx.fillRect(x * pixelSize + offset, y * pixelSize + offset, minSize, minSize);
    }
  }
}
`,
  "Lover (Animated)": `// qr, ctx are args
const pixelSize = 10;
ctx.canvas.width = qr.matrixWidth * pixelSize;
ctx.canvas.height = qr.matrixHeight * pixelSize;

const period = 3000; // ms
const amplitude = 0.8; // maxSize - minSize
const minSize = 0.6;

let counter = 0; 
let prevTimestamp;

let req;
function frame(timestamp) {
  // performance.now() and requestAnimationFrame's timestamp are not consistent together
  if (prevTimestamp != null) {
    counter += timestamp - prevTimestamp;
  }
  
  prevTimestamp = timestamp;
  
  if (counter >= period) {
    counter -= period;
  }
  
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  for (let y = 0; y < qr.matrixHeight; y++) {
    for (let x = 0; x < qr.matrixWidth; x++) {
      const module = qr.matrix[y * qr.matrixWidth + x];
      if ((module & 1) === 0) continue;

      const xBias = Math.abs(5 - (x % 10));
      const biasCounter = counter + (x + y) * (period / 20) + xBias * (period / 10);
      
      const ratio = Math.abs((period / 2) - (biasCounter % period)) / (period / 2);
      
      const size = (ratio * amplitude + minSize) * pixelSize;
      
      const offset = (pixelSize - size) / 2;
      
      ctx.fillStyle = \`rgb(\${100 + ratio * 150}, \${200 + xBias * 10}, 255)\`;
      ctx.fillRect(x * pixelSize + offset, y * pixelSize + offset, size, size);
    }
  }
  req = requestAnimationFrame(frame);
}

req = requestAnimationFrame(frame);

return () => cancelAnimationFrame(req);`,
};
