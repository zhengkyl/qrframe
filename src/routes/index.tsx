import { createSignal } from "solid-js";
import { clientOnly } from "@solidjs/start";
import { Editor } from "~/components/editor/QrEditor";
import { FlatButton } from "~/components/Button";
import QrPreview from "~/components/preview/QrPreview";
import init from "fuqr";

const QrContextProvider = clientOnly(async () => {
  await init();
  return {
    default: (await import("../lib/QrContext")).QrContextProvider,
  };
});

export default function Home() {
  return (
    <QrContextProvider>
        <main class="max-w-screen-2xl mx-auto p-4">
          <div class="flex gap-4 flex-wrap">
            <Editor />
            <div class="flex-grow-1 min-w-200px sticky top-0 self-start p-4">
              <QrPreview />
            </div>
          </div>
        </main>
    </QrContextProvider>
  );
}
