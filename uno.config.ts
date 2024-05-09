// uno.config.ts
import { defineConfig } from "unocss";
import transformerVariantGroup from "@unocss/transformer-variant-group";
export default defineConfig({
  transformers: [transformerVariantGroup()],
  theme: {
    colors: {
      fore: {
        base: "#fafafa",
        subtle: "#858c8a",
        border: "#4c4f4e",
      },
      back: {
        base: "#0e0f0f",
        subtle: "#1a1b1c",
      },
    },
  },
  preflights: [
    {
      getCSS: ({ theme }) =>
        `*{--un-default-border-color:${theme.colors.fore.border};}`,
    },
  ],
});
