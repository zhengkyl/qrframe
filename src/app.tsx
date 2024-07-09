import "@unocss/reset/tailwind.css";
import "virtual:uno.css";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

export default function App() {
  return (
    <>
      <Router root={(props) => <Suspense>{props.children}</Suspense>}>
        <FileRoutes />
      </Router>
      <footer class="text-sm text-center px-4 py-8">
        made with ⬛⬜ by{" "}
        <a
          class="font-semibold hover:text-fore-base/80 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
          href="https://kylezhe.ng"
          target="_blank"
        >
          @zhengkyl
        </a>
      </footer>
    </>
  );
}
