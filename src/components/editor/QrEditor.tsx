import { For, createSignal, type JSX } from "solid-js";
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
import { TextInput } from "../ModeTextInput";
import { NumberInput } from "../NumberInput";
import { Select } from "../Select";

import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import { CodeInput } from "@srsholmes/solid-code-input";

import "../../styles/atom-one-dark.css";

hljs.registerLanguage("javascript", javascript);

export function Editor(props: any) {
  const { inputQr, setInputQr, setRenderFunc } = useQrContext();

  const [code, setCode] = createSignal(` // qr, ctx are args
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
`);
  const [prevCode, setPrevCode] = createSignal(code());

  const saveCode = () => {
    setRenderFunc(() => new Function("qr", "ctx", code()) as RenderFunc);
  };

  return (
    <div class="flex flex-col gap-2 flex-1 p-4">
      <TextInput setValue={(s) => setInputQr("text", s)} />
      <Row title="Encoding" tooltip="Also known as Mode">
        <Select
          values={MODE_NAMES}
          value={MODE_KEY[inputQr.mode!]}
          setValue={(name) => setInputQr("mode", MODE_VALUE[name])}
        />
      </Row>
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
        <div class="flex justify-between my-2">
          <div class="text-sm py-2">Render function</div>
          <FlatButton class="px-3 py-1" disabled={prevCode() === code()} onMouseDown={saveCode}>
            {prevCode() === code() ? "Saved" : "Save"}
          </FlatButton>
        </div>
        <div
          class="hljs-wrapper"
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === "s") {
              e.preventDefault();
              saveCode();
            }
          }}
        >
          <CodeInput
            autoHeight={true}
            value={code()}
            onChange={setCode}
            highlightjs={hljs}
            language="javascript"
            resize="both"
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
