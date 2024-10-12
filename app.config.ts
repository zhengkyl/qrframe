import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import wasmpack from "vite-plugin-wasm-pack";

export default defineConfig({
  server: {
    preset: "cloudflare-pages",
    rollupConfig: {
      external: ["node:async_hooks"]
    }
  },
  ssr: true,
  vite: {
    plugins: [UnoCSS(), wasmpack([], ["fuqr"]), blobRewriter()],
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

// Rewrites imports inside blobs in dev mode
function blobRewriter() {
  const virtualModuleId = "virtual:blob-rewriter";
  const resolvedVirtualModuleId = "\0" + virtualModuleId;

  return {
    name: "blob-rewriter",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        if (process.env.NODE_ENV !== "development") {
          return "export {}";
        }

        return `
          if (!import.meta.env.SSR) {
            const originalBlob = window.Blob;
            window.Blob = function(array, options) {
              if (options.type === "text/javascript") {
                array = array.map(item => {
                  return item.replace("https://qrframe.kylezhe.ng", "http://localhost:3000");
                });
              }
              return new originalBlob(array, options);
            }
          }
        `;
      }
    },
  };
}
