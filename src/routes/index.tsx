import { For, Show, batch, createSignal, type JSX } from "solid-js";
import { clientOnly } from "@solidjs/start";
import init from "fuqr";

import { ButtonGroup, ButtonGroupItem } from "~/components/ButtonGroup";
import { ModeTextInput } from "~/components/ModeTextInput";
import { NumberInput } from "~/components/NumberInput";
import { ColorInput } from "~/components/ColorInput";
import { FlatButton, ToggleButton } from "~/components/Button";
import { createStore } from "solid-js/store";
import { Switch } from "~/components/Switch";
import { ImageInput } from "~/components/ImageInput";
import {
  type ModeName,
  type ECLName,
  type MaskName,
  type FinderPatternName,
  ECL_LABELS,
  MASK_NAMES,
  FINDER_PATTERN_NAMES,
  MODE_VALUE,
  ECL_VALUE,
  MASK_VALUE,
  FINDER_PATTERN_VALUE,
  ECL_NAMES,
} from "~/lib/options";

const QRCode = clientOnly(async () => {
  await init();
  return import("../components/QRCode");
});

const MODULE_NAMES = [
  "Data",
  "Finder",
  "Alignment",
  "Timing",
  "Format",
  "Version",
] as const;

export default function Home() {
  const [minVersion, setMinVersion] = createSignal(1);
  const [ecl, setEcl] = createSignal<ECLName>("Low");
  const [mode, setMode] = createSignal<ModeName>("Auto");
  const [mask, setMask] = createSignal<MaskName>("Auto");
  const [margin, setMargin] = createSignal(2);

  const [finderPattern, setFinderPattern] =
    createSignal<FinderPatternName>("Square");

  const [finderRoundness, setFinderRoundness] = createSignal(0);
  const [fgModuleScale, setFgModuleScale] = createSignal(1);
  const [bgModuleScale, setBgModuleScale] = createSignal(0);

  const [foreground, setForeground] = createSignal("#000000");
  const [background, setBackground] = createSignal("#ffffff");
  const [backgroundImage, setBackgroundImage] = createSignal(null);
  const [pixelate, setPixelate] = createSignal(false);
  const [logoImage, setLogoImage] = createSignal(null);
  const [logoSize, setLogoSize] = createSignal(25);

  const [input, setInput] = createSignal("Greetings traveler");

  const [renderedPixels, setRenderedPixels] = createStore(
    MODULE_NAMES.map(() => true)
  );
  const [scaledPixels, setScaledPixels] = createStore(
    MODULE_NAMES.map(() => true)
  );

  const [finderForeground, setFinderForeground] = createSignal(false);
  const [finderBackground, setFinderBackground] = createSignal(false);

  return (
    <main class="max-w-screen-lg mx-auto">
      <div class="flex gap-4 flex-wrap">
        <div class="flex flex-col gap-2 flex-1 p-4">
          <ModeTextInput setInput={setInput} mode={mode()} setMode={setMode} />
          <Row title="Min version">
            <NumberInput
              min={1}
              max={40}
              value={minVersion()}
              setValue={setMinVersion}
            />
          </Row>
          <Row title="Min error tolerance">
            <ButtonGroup value={ecl()} setValue={setEcl}>
              <For each={ECL_NAMES}>
                {(value) => (
                  <ButtonGroupItem value={value}>{value}</ButtonGroupItem>
                )}
              </For>
            </ButtonGroup>
          </Row>
          <Row title="Mask pattern">
            <ButtonGroup value={mask()} setValue={setMask}>
              <For each={MASK_NAMES}>
                {(value) => (
                  <ButtonGroupItem value={value}>{value}</ButtonGroupItem>
                )}
              </For>
            </ButtonGroup>
          </Row>
          <Row title="Finder pattern">
            <ButtonGroup value={finderPattern()} setValue={setFinderPattern}>
              <For each={FINDER_PATTERN_NAMES}>
                {(value) => (
                  <ButtonGroupItem value={value}>{value}</ButtonGroupItem>
                )}
              </For>
            </ButtonGroup>
          </Row>
          <Row title="Finder roundness">
            <NumberInput
              min={0}
              max={1}
              step={0.05}
              value={finderRoundness()}
              setValue={setFinderRoundness}
            />
          </Row>
          <Row title="Margin">
            <NumberInput
              min={0}
              max={10}
              step={1}
              value={margin()}
              setValue={setMargin}
            />
          </Row>
          <Row title="Foreground pixel scale" sparkle>
            <NumberInput
              min={0}
              max={2}
              step={0.05}
              value={fgModuleScale()}
              setValue={setFgModuleScale}
            />
          </Row>
          <Row title="Background pixel scale">
            <NumberInput
              min={0}
              max={2}
              step={0.05}
              value={bgModuleScale()}
              setValue={setBgModuleScale}
            />
          </Row>
          <Row title="Foreground">
            <ColorInput color={foreground()} setColor={setForeground} />
            <FlatButton
              class="text-sm px-2 py-2"
              onMouseDown={() => {
                batch(() => {
                  let tmp = foreground();
                  setForeground(background());
                  setBackground(tmp);
                });
              }}
            >
              Swap
            </FlatButton>
          </Row>
          <Row title="Background">
            <div class="flex flex-col items-start gap-1">
              <ColorInput color={background()} setColor={setBackground} />
              <ImageInput
                value={backgroundImage()}
                setValue={setBackgroundImage}
              />
              <Switch
                value={pixelate()}
                setValue={setPixelate}
                label="Disable smoothing"
              />
            </div>
          </Row>
          <Row title="Render options" sparkle>
            <div class="flex gap-8">
              <Switch
                value={finderBackground()}
                setValue={setFinderBackground}
                label="Finder BG"
              />
              <Switch
                value={finderForeground()}
                setValue={setFinderForeground}
                label="Finder FG"
              />
            </div>
          </Row>
          <Row title="Visible pixels">
            <div class="flex flex-wrap gap-2 text-sm leading-tight">
              <For each={renderedPixels}>
                {(value, i) => (
                  <ToggleButton
                    value={value}
                    onMouseDown={() => setRenderedPixels(i(), !value)}
                  >
                    {MODULE_NAMES[i()]}
                  </ToggleButton>
                )}
              </For>
            </div>
          </Row>
          <Row title="Scaled pixels">
            <div class="flex flex-wrap gap-2 text-sm leading-tight">
              <For each={scaledPixels}>
                {(value, i) => (
                  <ToggleButton
                    value={value}
                    onMouseDown={() => setScaledPixels(i(), !value)}
                  >
                    {MODULE_NAMES[i()]}
                  </ToggleButton>
                )}
              </For>
            </div>
          </Row>
          <Row title="Logo">
            <div class="flex flex-col gap-1 w-full">
              <ImageInput value={logoImage()} setValue={setLogoImage} />
              <NumberInput
                min={0}
                max={100}
                step={0.1}
                value={logoSize()}
                setValue={setLogoSize}
              />
            </div>
          </Row>
        </div>
        <div class="flex-1 min-w-200px sticky top-0 self-start p-4">
          <QRCode
            input={input()}
            version={minVersion()}
            margin={margin()}
            mode={MODE_VALUE[mode()]}
            ecl={ECL_VALUE[ecl()]}
            mask={MASK_VALUE[mask()]}
            finderPattern={FINDER_PATTERN_VALUE[finderPattern()]}
            finderRoundness={finderRoundness()}
            fgModuleSize={fgModuleScale()}
            bgModuleSize={bgModuleScale()}
            foreground={foreground()}
            background={background()}
            backgroundImage={backgroundImage()}
            pixelate={pixelate()}
            logoImage={logoImage()}
            logoSize={logoSize()}
            renderedPixels={renderedPixels}
            scaledPixels={scaledPixels}
            finderBackground={finderBackground()}
            finderForeground={finderForeground()}
          />
        </div>
      </div>
    </main>
  );
}

function Row(props: {
  title: string;
  children: JSX.Element;
  sparkle?: boolean;
}) {
  // clicking <label/> sometimes selects first button
  return (
    <div class="flex gap-2">
      <Show when={props.sparkle}>
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
      </Show>
      <span class="w-30 py-2 text-left text-sm flex-shrink-0">
        {props.title}
      </span>
      {props.children}
    </div>
  );
}
