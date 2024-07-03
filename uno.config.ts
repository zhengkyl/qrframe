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
    animation: {
      "content-show": {
        from: {
          opacity: 0,
          transform: "scale(0.96);",
        },
        to: {
          opacity: 1,
        },
      },
      "content-hide": {
        from: {
          opacity: 1,
        },
        to: {
          opacity: 0,
          transform: "scale(0.96);",
        },
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
