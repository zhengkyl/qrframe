import { clientOnly } from "@solidjs/start";
import { isServer, Portal } from "solid-js/web";
import init from "fuqr";

import { Editor } from "~/components/editor/QrEditor";
import { ErrorToasts } from "~/components/ErrorToasts";
import { QrPreview } from "~/components/preview/QrPreview";
import { RenderContextProvider } from "~/lib/RenderContext";
import { createSignal, onCleanup } from "solid-js";

const QrContextProvider = clientOnly(async () => {
  await init();
  return {
    default: (await import("../lib/QrContext")).QrContextProvider,
  };
});

export default function Home() {
  // tracking mediaquery in js b/c rendering step draws to all mounted elements
  let desktop;
  if (isServer) {
    desktop = () => false;
  } else {
    const mql = window.matchMedia("(min-width: 768px)");
    const [matches, setMatches] = createSignal(mql.matches);
    const callback = (e) => setMatches(e.matches);
    mql.addEventListener("change", callback);
    onCleanup(() => {
      mql.removeEventListener("change", callback);
    });
    desktop = matches;
  }

  return (
    <QrContextProvider>
      <RenderContextProvider>
        <main class="max-w-screen-2xl mx-auto">
          <div class="flex flex-col-reverse md:flex-row">
            <Editor class="flex-1 flex-grow-3 flex flex-col gap-2 px-4 py-4 md:py-8" />
            <QrPreview
              classList={{
                "flex flex-col gap-4 px-4": true,
                "sticky top-0 py-4 rounded-b-[1rem] border-b shadow-2xl bg-back-base z-10":
                  !desktop(),
                "flex-1 flex-grow-2 min-w-300px self-start py-8": desktop(),
              }}
              compact={!desktop()}
            />
          </div>
          <Portal>
            <ErrorToasts />
          </Portal>
        </main>
      </RenderContextProvider>
    </QrContextProvider>
  );
}
