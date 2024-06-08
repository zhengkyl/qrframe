import { For, Show, batch, createSignal, type JSX } from "solid-js";
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
import { FlatButton } from "./Button";
import { ButtonGroup, ButtonGroupItem } from "./ButtonGroup";
import { ColorInput } from "./ColorInput";
import { ImageInput } from "./ImageInput";
import { ModeTextInput } from "./ModeTextInput";
import { NumberInput } from "./NumberInput";
import { Select } from "./Select";
import { Switch } from "./Switch";
import { useSvgContext } from "~/lib/SvgContext";
import { usePaintContext } from "~/lib/PaintContext";
import { qroptions_margin } from "../../fuqr/pkg/fuqr_bg.wasm";

export function Editor(props: any) {
  const { inputQr, setInputQr, outputQr } = useQrContext();
  const { svgOptions, setSvgOptions } = useSvgContext();
  const { selections, scaleX, scaleY, setScaleXInPlace, setScaleYInPlace } =
    usePaintContext();

  // const [logoSize, setLogoSize] = createSignal(25);

  return (
    <div>
      <div class="flex flex-col gap-2 flex-1 p-4">
        <ModeTextInput setValue={(s) => setInputQr("text", s)} />
        <Row title="Mode">
          <Select
            values={MODE_NAMES}
            value={MODE_KEY[inputQr.mode!]}
            setValue={(name) => setInputQr("mode", MODE_VALUE[name])}
          />
        </Row>
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
        {/* <Row title="Margin">
          <NumberInput
            min={0}
            max={10}
            step={1}
            value={inputQr.margin.top}
            setValue={(v) => setInputQr("margin", (prev) => prev.setTop(v))}
          />
        </Row> */}
        <Row title="Foreground">
          <ColorInput
            color={svgOptions.fgColor}
            setColor={(v) => setSvgOptions("fgColor", v)}
          />
          <Switch
            value={svgOptions.pixelateFgImg}
            setValue={(v) => setSvgOptions("pixelateFgImg", v)}
            label="Disable smoothing"
          />
          <FlatButton
            class="text-sm px-2 py-2"
            onMouseDown={() => {
              batch(() => {
                let tmp = svgOptions.fgColor;
                setSvgOptions("fgColor", svgOptions.bgColor);
                setSvgOptions("bgColor", tmp);
              });
            }}
          >
            Swap
          </FlatButton>
        </Row>
        <Row title="Background">
          <div class="flex flex-col items-start gap-1">
            <ColorInput
              color={svgOptions.bgColor}
              setColor={(v) => setSvgOptions("bgColor", v)}
            />
            <ImageInput
              value={svgOptions.bgImgFile}
              setValue={(v) => setSvgOptions("bgImgFile", v)}
            />
            <Switch
              value={svgOptions.pixelateBgImg}
              setValue={(v) => setSvgOptions("pixelateBgImg", v)}
              label="Disable smoothing"
            />
          </div>
        </Row>
        <Row title="Logo">
          <div class="flex flex-col gap-1 w-full">
            <ImageInput
              value={svgOptions.fgImgFile}
              setValue={(v) => setSvgOptions("fgImgFile", v)}
            />
            {/* TODO need better img management than just size */}
            {/* <NumberInput
              min={0}
              max={100}
              step={0.1}
              value={logoSize()}
              setValue={setLogoSize}
            /> */}
          </div>
        </Row>
        <Row title="Scale X">
          <NumberInput
            min={0}
            max={200}
            step={1}
            value={
              selections().length
                ? scaleX()[
                    selections()[0].top * Math.sqrt(scaleX().length) +
                      selections()[0].left
                  ]
                : 100
            }
            setValue={(v) => {
              if (!selections().length) return
              setScaleXInPlace((prev) => {
                let width = Math.sqrt(prev.length);
                selections().forEach((sel) => {
                  for (let i = sel.top; i < sel.bot; i++) {
                    for (let j = sel.left; j < sel.right; j++) {
                      prev[i * width + j] = v;
                    }
                  }
                });
                return prev;
              });
            }}
          />
        </Row>
        <Row title="Scale Y">
          <NumberInput
            min={0}
            max={200}
            step={1}
            value={
              selections().length
                ? scaleY()[
                    selections()[0].top * Math.sqrt(scaleY().length) +
                      selections()[0].left
                  ]
                : 100
            }
            setValue={(v) => {
              if (!selections().length) return
              setScaleYInPlace((prev) => {
                let width = Math.sqrt(prev.length);
                selections().forEach((sel) => {
                  for (let i = sel.top; i < sel.bot; i++) {
                    for (let j = sel.left; j < sel.right; j++) {
                      prev[i * width + j] = v;
                    }
                  }
                });
                return prev;
              });
            }}
          />
        </Row>
      </div>
    </div>
  );
}

function Row(props: {
  title: string;
  children: JSX.Element;
  sparkle?: boolean;
}) {
  // This should be <label/> but clicking selects first button in buttongroup
  return (
    <div class="flex gap-2">
      <Show when={props.sparkle}>
        <AnimatedSparkle />
      </Show>
      <span class="w-30 py-2 text-left text-sm flex-shrink-0">
        {props.title}
      </span>
      {props.children}
    </div>
  );
}

function AnimatedSparkle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 29 29"
      class="w-5 h-5 absolute -translate-x-full mt-2"
    >
      <path
        d="M14.6 5.8c.5 0 .8 7.4 1.2 7.8.4.4 7.9.5 7.9 1 0 .6-7.5.9-7.8 1.3-.4.4-.5 7.8-1 7.9-.6 0-1-7.5-1.3-7.9-.4-.4-7.9-.5-7.9-1 0-.6 7.5-.9 7.9-1.3.3-.4.4-7.8 1-7.8z"
        style="fill:#fca4a4"
        class="animate-pulse"
      />
      <path
        d="M25.5 7.5c.1.3-2.3.6-2.4.8-.2.2-.3 2.6-.5 2.7-.3 0-.5-2.3-.7-2.5-.3-.2-2.7-.2-2.8-.5 0-.2 2.3-.5 2.5-.7.2-.2.2-2.7.5-2.7.2 0 .5 2.3.7 2.4.2.2 2.7.3 2.7.5z"
        style="fill:#fca4a4"
        class="animate-pulse"
      />
      <path
        d="M11.3 21.9c0 .3-3 .1-3.2.3-.2.3 0 3.2-.3 3.2s-.1-3-.4-3.2c-.2-.2-3 0-3-.3s2.8-.1 3-.3c.3-.3 0-3.2.4-3.2.3 0 .1 3 .3 3.2.3.2 3.2 0 3.2.3z"
        style="fill:#fca4a4"
        class="animate-pulse"
      />
    </svg>
  );
}
