import { isServer, Portal } from "solid-js/web";

import { Editor } from "~/components/editor/QrEditor";
import { ErrorToasts } from "~/components/ErrorToasts";
import { QrPreview } from "~/components/preview/QrPreview";
import { RenderContextProvider } from "~/lib/RenderContext";
import { createSignal, onCleanup, onMount } from "solid-js";
import { QrContextProvider } from "~/lib/QrContext";

export default function Home() {
  return (
    <QrContextProvider>
      <RenderContextProvider>
        <Temp />
      </RenderContextProvider>
    </QrContextProvider>
  );
}

function Temp() {
  // tracking mediaquery in js b/c rendering step draws to all mounted elements
  const [desktop, setDesktop] = createSignal(false);

  onMount(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const callback = (e) => setDesktop(e.matches);
    mql.addEventListener("change", callback);
    setDesktop(mql.matches);

    const viewport = window.visualViewport!;
    let prevHeight = viewport.height;
    const detectMobileKeyboard = () => {
      const prev = prevHeight;
      prevHeight = viewport.height;
      if (desktop() || !textFocused()) return;
      if (viewport.height === prev) return;
      if (viewport.height > prev) {
        // closing mobile keyboard
        textRef.blur();
      }
    };
    viewport.addEventListener("resize", detectMobileKeyboard);

    onCleanup(() => {
      mql.removeEventListener("change", callback);
      window.removeEventListener("resize", detectMobileKeyboard);
    });
  });

  let qrPreview: HTMLDivElement;
  let textRef: HTMLTextAreaElement;

  const [textFocused, setTextFocused] = createSignal(false);
  const onFocus = () => {
    setTextFocused(true);
  };
  const onBlur = () => {
    if (!desktop()) {
      // firefox scrolls input behind sticky QrPreview
      // adding/removing sticky + this scroll + animation
      // gives roughly equivalent ux as chrome default
      const before = `${qrPreview.getBoundingClientRect().top}px`;
      qrPreview.animate([{ top: before }, { top: 0 }], {
        // slow animation to prevent bounce
        duration: 1000,
        easing: "ease-out",
      });
      window.scroll({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
    setTextFocused(false);
  };

  return (
    <main class="max-w-screen-2xl mx-auto">
      <div class="flex flex-col-reverse md:flex-row">
        <Editor
          class="flex-1 flex-grow-3 flex flex-col gap-2 px-4 py-4 md:py-8"
          onTextFocus={onFocus}
          onTextBlur={onBlur}
          textRef={(ref) => (textRef = ref)}
        />
        <QrPreview
          ref={qrPreview!}
          classList={{
            "top-0 flex flex-col gap-4 px-4": true,
            "py-4 rounded-b-[1rem] border-b shadow-2xl bg-back-base z-10 [transition:top]":
              !desktop(),
            sticky: !desktop() && !textFocused(),
            "md:(sticky flex-1 flex-grow-2 min-w-300px self-start py-8)": true,
          }}
          compact={!desktop()}
        />
      </div>
      <Portal>
        <ErrorToasts />
      </Portal>
    </main>
  );
}
