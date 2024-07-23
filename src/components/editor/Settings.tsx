import { For, type JSX } from "solid-js";
import { useQrContext } from "~/lib/QrContext";
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
import { NumberInput } from "../NumberInput";
import { Select } from "../Select";

export function Settings() {
  const { inputQr, setInputQr } = useQrContext();

  return (
    <>
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
    </>
  );
}

function Row(props: {
  title: string;
  children: JSX.Element;
}) {
  return (
    <div>
      <div class="text-sm py-2">
        {props.title}
      </div>
      {props.children}
    </div>
  );
}
