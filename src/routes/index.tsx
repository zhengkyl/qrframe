import { createSignal, type Component, type JSX } from "solid-js";
import NumberInput from "~/components/NumberInput";

export default function Home() {
  const [minVersion, setMinVersion] = createSignal(1);
  const [maxVersion, setMaxVersion] = createSignal(40);

  return (
    <main class="text-center max-w-screen-lg mx-auto p-4">
      <h1 class="max-6-xs text-6xl font-bold my-16">QR Frame</h1>
      <div class="flex">
        <div class="w-full flex flex-col gap-2">
          <Row title="Min version">
            <NumberInput
              min={1}
              max={40}
              value={minVersion()}
              setValue={setMinVersion}
            />
          </Row>
          <Row title="Max version">
            <NumberInput
              min={1}
              max={40}
              value={maxVersion()}
              setValue={setMaxVersion}
            />
          </Row>
        </div>
        <div class="w-full flex flex-col gap-2">qr code here</div>
      </div>
    </main>
  );
}

function Row(props: { title: string; children: JSX.Element }) {
  return (
    <label class="flex items-center">
      <span class="w-40 text-left">{props.title}</span>
      {props.children}
    </label>
  );
}
