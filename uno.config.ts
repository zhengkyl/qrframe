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
      "fade-in": {
        from: {
          opacity: 0,
        },
        to: {
          opacity: 1,
        },
      },
      "fade-out": {
        from: {
          opacity: 1,
        },
        to: {
          opacity: 0,
        },
      },
      "grow-in": {
        from: {
          opacity: 0,
          transform: "scale(0.96);",
        },
        to: {
          opacity: 1,
        },
      },
      "shrink-out": {
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
