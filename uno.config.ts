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
      keyframes: {
        // "fade-in": {
        //   from: {
        //     opacity: 0,
        //   },
        //   to: {
        //     opacity: 1,
        //   },
        // },
        // "fade-out": {
        //   from: {
        //     opacity: 1,
        //   },
        //   to: {
        //     opacity: 0,
        //   },
        // },
        // "zoom-in": {
        //   from: {
        //     opacity: 0,
        //     transform: "scale(0.96);",
        //   },
        //   to: {
        //     opacity: 1,
        //   },
        // },
        // "zoom-out": {
        //   from: {
        //     opacity: 1,
        //   },
        //   to: {
        //     opacity: 0,
        //     transform: "scale(0.96);",
        //   },
        // },
        "collapsible-exit":
          "{ from { height: var(--kb-collapsible-content-height); } to { height: 0; } }",
        "collapsible-enter":
          "{ from { height: 0; } to { height: var(--kb-collapsible-content-height); } }",
      },
      durations: {
        "collapsible-exit": "300ms",
        "collapsible-enter": "300ms",
      },
      timingFns: {
        "collapsible-exit": "ease-out",
        "collapsible-enter": "ease-out",
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
