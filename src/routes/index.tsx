import { Switch, Match, createSignal } from "solid-js";
import { clientOnly } from "@solidjs/start";
import init from "fuqr";
import { Editor } from "~/components/Editor";

const QRCode = clientOnly(async () => {
  await init();
  return import("../components/qr/SvgPreview");
});

// const MODULE_NAMES = [
//   "Data",
//   "Finder",
//   "Alignment",
//   "Timing",
//   "Format",
//   "Version",
// ] as const;

enum Stage {
  Create,
  Customize,
}
export default function Home() {
  const [stage, setStage] = createSignal(Stage.Create);
  return (
    <main class="max-w-screen-lg mx-auto">
      <Switch>
        <Match when={stage() == Stage.Create}>
          <div class="flex gap-4 flex-wrap">
            <Editor />
            <div class="flex-1 min-w-200px sticky top-0 self-start p-4">
              <QRCode />
            </div>
          </div>
        </Match>
        {/* <Match when={stage() == Stage.Customize}></Match> */}
      </Switch>
    </main>
  );
}
