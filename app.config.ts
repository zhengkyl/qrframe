import { defineConfig } from "@solidjs/start/config";
import UnoCSS from "unocss/vite";
import wasmpack from "vite-plugin-wasm-pack";

export default defineConfig({
  server: {
    preset: "static",
  },
  ssr: true,
  vite: {
    plugins: [UnoCSS(), wasmpack([], ["fuqr"]), blobRewriter()],
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

        const devOrigin =
          process.env.DEV_ORIGIN || "http://localhost:3000";
        const prodOrigin =
          process.env.PROD_ORIGIN || "https://qrframe.kylezhe.ng";

        return `
          if (!import.meta.env.SSR) {
            const originalBlob = window.Blob;
            window.Blob = function(array, options) {
              if (options.type === "text/javascript") {
                array = array.map(item => {
                  return item.replace("${prodOrigin}", "${devOrigin}");
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
