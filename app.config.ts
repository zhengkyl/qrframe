import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  server: { preset: "vercel" },
  ssr: false,
  vite: {
    plugins: [UnoCSS(), wasm()],
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
  },
});
