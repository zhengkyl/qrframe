import { For, Show, createMemo, createSignal, type JSX } from "solid-js";
import { ButtonGroup, ButtonGroupItem } from "~/components/ButtonGroup";
import { ModeTextInput } from "~/components/ModeTextInput";
import { NumberInput } from "~/components/NumberInput";
import { ECL, FinderPattern, Mode } from "fuqr";
import QRCode, { min_version } from "~/components/QRCode";
import { ColorInput } from "~/components/ColorInput";

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

export default function Home() {
  const [version, setVersion] = createSignal(1);
  const [margin, setMargin] = createSignal(2);
  const [ecl, setEcl] = createSignal<keyof typeof ECL_VALUE>("Low");
  const [mask, setMask] = createSignal("0");
  const [finderPattern, setFinderPattern] = createSignal(
    FinderPattern.Square.toString()
  );
  const [finderRoundness, setFinderRoundness] = createSignal(1);
  const [moduleScale, setModuleScale] = createSignal(1);

  const [foreground, setForeground] = createSignal("#000000");
  const [background, setBackground] = createSignal("#ffffff");

  const [input, setInput] = createSignal("Greetings traveler12345678");
  const [mode, setMode] = createSignal(Mode.Byte);

  // TODO TEMPORARY FIX TO PREVENT CRASHING UNTIL I ADD SIZE ADJUSTMENT TO FUQR
  const min_v = createMemo(() =>
    min_version(input(), mode(), version(), ECL_VALUE[ecl()])
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
          {/* <textarea class="bg-back-subtle min-h-[80px] px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"></textarea> */}
          <ModeTextInput
            input={input()}
            setInput={setInput}
            mode={MODE_NAME[mode()]}
            setMode={setMode}
          />
          <Row title="Version">
            <NumberInput
              min={1}
              max={40}
              value={version()}
              setValue={setVersion}
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
        </div>
        <div class="flex-1 min-w-200px">
          <Show
            when={valid_mode() && min_v() < 41}
            fallback={
              valid_mode() ? (
                <span>Data exceeds max capacity</span>
              ) : (
                <span>
                  Text cannot be encoded using {MODE_NAME[mode()]} mode
                </span>
              )
            }
          >
            <QRCode
              input={input()}
              mode={mode()}
              version={min_v()}
              ecl={ECL_VALUE[ecl()]}
              mask={parseInt(mask())}
              finderPattern={parseInt(finderPattern())}
              finderRoundness={finderRoundness()}
              margin={margin()}
              moduleSize={moduleScale()}
              foreground={foreground()}
              background={background()}
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
      <span class="w-50 text-left">{props.title}</span>
      {props.children}
    </div>
  );
}
