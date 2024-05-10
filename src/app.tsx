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
      <footer class="text-sm text-center p-4">
        made with ⬛⬜ by{" "}
        <a
          class="font-semibold hover:text-fore-base/80"
          href="https://kylezhe.ng"
          target="_blank"
        >
          @zhengkyl
        </a>
      </footer>
    </>
  );
}
