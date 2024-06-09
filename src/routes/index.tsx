import { Switch, Match, createSignal } from "solid-js";
import { clientOnly } from "@solidjs/start";
import init from "fuqr";
import { Editor } from "~/components/Editor";
import SvgPreview from "~/components/qr/SvgPreview";
import { SvgContextProvider } from "~/lib/SvgContext";

const QrContextProvider = clientOnly(async () => {
  await init();
  return {
    default: (await import("../lib/QrContext")).QrContextProvider,
  };
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
    <QrContextProvider>
      <SvgContextProvider>
        <main class="max-w-screen-lg mx-auto">
          <Switch>
            <Match when={stage() == Stage.Create}>
              <div class="flex gap-4 flex-wrap">
                <Editor />
                <div class="flex-1 min-w-200px sticky top-0 self-start p-4">
                  <SvgPreview />
                </div>
              </div>
            </Match>
            {/* <Match when={stage() == Stage.Customize}></Match> */}
          </Switch>
        </main>
      </SvgContextProvider>
    </QrContextProvider>
  );
}
