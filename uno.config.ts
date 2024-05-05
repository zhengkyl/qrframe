// uno.config.ts
import { defineConfig } from "unocss";
import transformerVariantGroup from "@unocss/transformer-variant-group";
export default defineConfig({
  transformers: [transformerVariantGroup()],
  theme: {
    colors: {
      fore: {
        base: "#fafafa",
        subtle: "#adb5b2",
      },
      back: {
        base: "#09090b",
        subtle: "#2e3130",
        hover: "#5b625f",
      },
    },
  },
});
