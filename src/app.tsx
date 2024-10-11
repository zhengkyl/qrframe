import "@unocss/reset/tailwind.css";
import "virtual:uno.css";
import "./app.css";

import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";

export default function App() {
  return (
    <>
      <Router root={(props) => <Suspense>{props.children}</Suspense>}>
        <FileRoutes />
      </Router>
      <footer class="text-sm flex justify-center gap-4 px-4 py-8">
        <a
          class="font-semibold hover:text-fore-base/80 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
          href="./bugs"
          target="_blank"
        >
          report bugs
        </a>
        <a
          class="font-semibold hover:text-fore-base/80 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
          href="https://github.com/zhengkyl/qrframe"
          target="_blank"
        >
          source code
        </a>
        <a
          class="font-semibold hover:text-fore-base/80 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
          href="https://kylezhe.ng/posts/crafting_qr_codes"
          target="_blank"
        >
          blog post
        </a>
      </footer>
    </>
  );
}
