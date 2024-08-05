import { clientOnly } from "@solidjs/start";
import { Editor } from "~/components/editor/QrEditor";
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
      <main class="max-w-screen-2xl mx-auto">
        <div class="md:flex py-8">
          <Editor class="flex-1 flex-grow-3 flex flex-col gap-2 px-4" />
          <QrPreview class="flex-1 flex-grow-2 min-w-300px sticky top-8 self-start px-4 flex flex-col gap-4" />
        </div>
      </main>
    </QrContextProvider>
  );
}
