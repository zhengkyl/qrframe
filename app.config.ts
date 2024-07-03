import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import wasmpack from "vite-plugin-wasm-pack";

// b/c I'm using vite() instead of static config object
// getting a new plugin each time vite() runs messes up unocss styles on the `body`
const SharedUnoCss = UnoCSS();

export default defineConfig({
  server: { preset: "vercel" },
  ssr: true,
  vite({ router }) {

    return {
      plugins:
        // https://github.com/nksaraf/vinxi/issues/262
        // wasmpack copies pkg to node_modules asynchronously so triggering buildStart 3 times causes errors
        router === "client"
          ? [SharedUnoCss, wasmpack(["./fuqr"])]
          : [SharedUnoCss],
      resolve: {
        alias: {
          // https://christopher.engineering/en/blog/lucide-icons-with-vite-dev-server/
          "lucide-solid/icons": fileURLToPath(
            new URL(
              "./node_modules/lucide-solid/dist/source/icons",
              import.meta.url
            )
          ),
        },
      },
    };
  },
});
