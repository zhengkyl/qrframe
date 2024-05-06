import { For, createSignal, type JSX } from "solid-js";
import { ButtonGroup, ButtonGroupItem } from "~/components/ButtonGroup";
import { ModeTextInput } from "~/components/ModeTextInput";
import { NumberInput } from "~/components/NumberInput";

export default function Home() {
  const [version, setVersion] = createSignal(1);
  const [errorCorrection, setErrorCorrection] = createSignal("Low");
  const [maskPattern, setMaskPattern] = createSignal("0");

  return (
    <main class="text-center max-w-screen-lg mx-auto p-4">
      <h1 class="max-6-xs text-6xl font-bold my-16">QR Frame</h1>
      <div class="flex">
        <div class="w-full flex flex-col gap-2">
          {/* <textarea class="bg-back-subtle min-h-[80px] px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"></textarea> */}
          <ModeTextInput />
          <Row title="Version">
            <NumberInput
              min={1}
              max={40}
              value={version()}
              setValue={setVersion}
            />
          </Row>
          <Row title="Error correction">
            <ButtonGroup
              value={errorCorrection()}
              setValue={setErrorCorrection}
            >
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
            <ButtonGroup value={maskPattern()} setValue={setMaskPattern}>
              <For each={["0", "1", "2", "3", "4", "5", "6", "7"]}>
                {(value) => (
                  <ButtonGroupItem value={value}>{value}</ButtonGroupItem>
                )}
              </For>
            </ButtonGroup>
          </Row>
        </div>
        <div class="w-full flex flex-col gap-2">qr code here</div>
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
