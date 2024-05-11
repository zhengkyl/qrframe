import { For, Show, createMemo, createSignal, type JSX } from "solid-js";
import { clientOnly } from "@solidjs/start";
import init, { ECL, FinderPattern, Mode, Module } from "fuqr";

import { ButtonGroup, ButtonGroupItem } from "~/components/ButtonGroup";
import { ModeTextInput } from "~/components/ModeTextInput";
import { NumberInput } from "~/components/NumberInput";
import { ColorInput } from "~/components/ColorInput";
import { ToggleButton } from "~/components/Button";
import { createStore } from "solid-js/store";

const QRCode = clientOnly(async () => {
  await init();
  return import("../components/QRCode");
});

const ECL_VALUE = {
  Low: ECL.Low,
  Medium: ECL.Medium,
  Quartile: ECL.Quartile,
  High: ECL.High,
};

const MODE_NAME = {
  [Mode.Numeric]: "Numeric",
  [Mode.Alphanumeric]: "Alphanumeric",
  [Mode.Byte]: "Byte",
};

const MODULES = ["Data", "Finder", "Alignment", "Timing", "Format", "Version"];

export default function Home() {
  const [minVersion, setMinVersion] = createSignal(1);
  const [margin, setMargin] = createSignal(2);
  const [ecl, setEcl] = createSignal<keyof typeof ECL_VALUE>("Low");
  const [mask, setMask] = createSignal("0");
  const [finderPattern, setFinderPattern] = createSignal(
    FinderPattern.Square.toString()
  );
  const [finderRoundness, setFinderRoundness] = createSignal(0);
  const [moduleScale, setModuleScale] = createSignal(1);

  const [foreground, setForeground] = createSignal("#000000");
  const [background, setBackground] = createSignal("#ffffff");

  const [input, setInput] = createSignal("Greetings traveler");
  const [mode, setMode] = createSignal(Mode.Byte);

  const [renderedPixels, setRenderedPixels] = createStore(
    MODULES.map(() => true)
  );

  // TODO TEMPORARY FIX TO PREVENT CRASHING UNTIL I ADD SIZE ADJUSTMENT TO FUQR
  const version = createMemo(() =>
    min_version(input(), mode(), minVersion(), ECL_VALUE[ecl()])
  );

  const valid_mode = createMemo(() => {
    let s = input();
    if (mode() === Mode.Numeric) {
      for (let i = 0; i < s.length; i++) {
        if (s[i] < "0" || s[i] > "9") return false;
      }
    } else if (mode() === Mode.Alphanumeric) {
      for (let i = 0; i < s.length; i++) {
        if (
          (s[i] >= "A" && s[i] <= "Z") ||
          (s[i] >= "0" && s[i] <= "9") ||
          s[i] === ":" ||
          s[i] === " " ||
          s[i] === "$" ||
          s[i] === "*" ||
          s[i] === "+" ||
          s[i] === "-" ||
          s[i] === "." ||
          s[i] === "/"
        ) {
        } else {
          return false;
        }
      }
    } else {
      for (let i = 0; i < s.length; i++) {
        if (s.charCodeAt(i) > 255) return false;
      }
    }

    return true;
  });

  return (
    <main class="text-center max-w-screen-lg mx-auto my-16 p-4">
      <div class="flex gap-4 flex-wrap">
        <div class="flex flex-col gap-2 flex-1">
          <ModeTextInput
            // textarea does not have a controlled value, input is only default value
            input={"Greetings travelers"}
            setInput={setInput}
            mode={MODE_NAME[mode()]}
            setMode={setMode}
          />
          <Row title="Min version">
            <NumberInput
              min={1}
              max={40}
              value={minVersion()}
              setValue={setMinVersion}
            />
          </Row>
          <Row title="Error correction">
            <ButtonGroup value={ecl()} setValue={setEcl}>
              <ButtonGroupItem value="Low" title>
                L
              </ButtonGroupItem>
              <ButtonGroupItem value="Medium" title>
                M
              </ButtonGroupItem>
              <ButtonGroupItem value="Quartile" title>
                Q
              </ButtonGroupItem>
              <ButtonGroupItem value="High" title>
                H
              </ButtonGroupItem>
            </ButtonGroup>
          </Row>
          <Row title="Mask pattern">
            <ButtonGroup value={mask()} setValue={setMask}>
              <For each={["0", "1", "2", "3", "4", "5", "6", "7"]}>
                {(value) => (
                  <ButtonGroupItem value={value}>{value}</ButtonGroupItem>
                )}
              </For>
            </ButtonGroup>
          </Row>
          <Row title="Finder pattern">
            <ButtonGroup value={finderPattern()} setValue={setFinderPattern}>
              <For
                each={[FinderPattern.Square, FinderPattern.Cross].map((e) =>
                  e.toString()
                )}
              >
                {(value, i) => (
                  <ButtonGroupItem value={value}>
                    {["Square", "Cross"][i()]}
                  </ButtonGroupItem>
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
          <Row title="Data pixel scale">
            <NumberInput
              min={0}
              max={2}
              step={0.05}
              value={moduleScale()}
              setValue={setModuleScale}
            />
          </Row>
          <Row title="Foreground">
            <ColorInput color={foreground()} setColor={setForeground} />
          </Row>
          <Row title="Background">
            <ColorInput color={background()} setColor={setBackground} />
          </Row>

          <div class="flex mt-2">
            <span class="w-30 text-left text-sm flex-shrink-0">
              Rendered pixels
            </span>
            <div class="flex flex-wrap gap-2 text-sm leading-tight">
              <For each={renderedPixels}>
                {(value, i) => (
                  <ToggleButton
                    value={value}
                    onClick={() => setRenderedPixels(i(), !value)}
                  >
                    {MODULES[i()]}
                  </ToggleButton>
                )}
              </For>
            </div>
          </div>
        </div>
        <div class="flex-1 min-w-200px">
          <Show
            when={valid_mode() && version() < 41}
            fallback={
              <div class="aspect-[1/1] border rounded-md flex justify-center items-center">
                {valid_mode()
                  ? "Data exceeds max capacity"
                  : `Input cannot be encoded using ${MODE_NAME[mode()]} mode`}
              </div>
            }
          >
            <QRCode
              input={input()}
              mode={mode()}
              version={version()}
              ecl={ECL_VALUE[ecl()]}
              mask={parseInt(mask())}
              finderPattern={parseInt(finderPattern())}
              finderRoundness={finderRoundness()}
              margin={margin()}
              moduleSize={moduleScale()}
              foreground={foreground()}
              background={background()}
              renderedPixels={renderedPixels}
            />
          </Show>
        </div>
      </div>
    </main>
  );
}

function Row(props: { title: string; children: JSX.Element }) {
  // clicking <label/> sometimes selects first button
  return (
    <div class="flex items-center">
      <span class="w-30 text-left text-sm flex-shrink-0">{props.title}</span>
      {props.children}
    </div>
  );
}
// TODO remember to do this
// TEMPORARY FIX TO PREVENT CRASHING UNTIL I ADD SIZE ADJUSTMENT TO FUQR
// THIS DUPLICATES LOGIC FROM FUQR
const numECCodewords = {
  [ECL.Low]: [
    0, 7, 10, 15, 20, 26, 36, 40, 48, 60, 72, 80, 96, 104, 120, 132, 144, 168,
    180, 196, 224, 224, 252, 270, 300, 312, 336, 360, 390, 420, 450, 480, 510,
    540, 570, 570, 600, 630, 660, 720, 750,
  ],
  [ECL.Medium]: [
    0, 10, 16, 26, 36, 48, 64, 72, 88, 110, 130, 150, 176, 198, 216, 240, 280,
    308, 338, 364, 416, 442, 476, 504, 560, 588, 644, 700, 728, 784, 812, 868,
    924, 980, 1036, 1064, 1120, 1204, 1260, 1316, 1372,
  ],
  [ECL.Quartile]: [
    0, 13, 22, 36, 52, 72, 96, 108, 132, 160, 192, 224, 260, 288, 320, 360, 408,
    448, 504, 546, 600, 644, 690, 750, 810, 870, 952, 1020, 1050, 1140, 1200,
    1290, 1350, 1440, 1530, 1590, 1680, 1770, 1860, 1950, 2040,
  ],
  [ECL.High]: [
    0, 17, 28, 44, 64, 88, 112, 130, 156, 192, 224, 264, 308, 352, 384, 432,
    480, 532, 588, 650, 700, 750, 816, 900, 960, 1050, 1110, 1200, 1260, 1350,
    1440, 1530, 1620, 1710, 1800, 1890, 1980, 2100, 2220, 2310, 2430,
  ],
};
const numDataModules = [
  0, 208, 359, 567, 807, 1079, 1383, 1568, 1936, 2336, 2768, 3232, 3728, 4256,
  4651, 5243, 5867, 6523, 7211, 7931, 8683, 9252, 10068, 10916, 11796, 12708,
  13652, 14628, 15371, 16411, 17483, 18587, 19723, 20891, 22091, 23008, 24272,
  25568, 26896, 28256, 29648,
];

function min_version(input: string, mode: Mode, version: number, ecl: ECL) {
  let bits = 4;
  if (mode === Mode.Numeric) {
    bits += 10 + (input.length / 3) * 10;
    if (input.length % 3 == 1) {
      bits += 4;
    } else if (input.length % 3 == 2) {
      bits += 7;
    }
  } else if (mode == Mode.Alphanumeric) {
    bits += 9 + (input.length / 2) * 11 + (input.length % 2) * 6;
  } else {
    bits += 8 + input.length * 8;
  }

  if (mode == Mode.Byte && version > 9) {
    bits += 8;
  } else if (version > 26) {
    bits += 4;
  } else if (version > 9) {
    bits += 2;
  }

  while (
    version <= 40 &&
    (bits + 7) / 8 > numDataModules[version] / 8 - numECCodewords[ecl][version]
  ) {
    if (mode == Mode.Byte && version == 9) {
      bits += 8;
    } else if (version == 26) {
      bits += 4;
    } else if (version == 9) {
      bits += 2;
    }
    version++;
  }

  return version;
}
