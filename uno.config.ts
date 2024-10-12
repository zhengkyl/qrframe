import { defineConfig } from "unocss";
import transformerVariantGroup from "@unocss/transformer-variant-group";
export default defineConfig({
  blocklist: ["m55", "resize"],
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
        distinct: "#3d3e3e"
      },
    },
    animation: {
      keyframes: {
        "collapsible-exit":
          "{ from { height: var(--kb-collapsible-content-height); } to { height: 0; } }",
        "collapsible-enter":
          "{ from { height: 0; } to { height: var(--kb-collapsible-content-height); } }",
        "slide-in":
          "{ from { transform: translateX(calc(100% + 16px)); } to { transform: translateX(0); } }",
        "swipe-out":
          "{ from { transform: translateX(var(--kb-toast-swipe-end-x)); } to { transform: translateX(calc(100% + 16px)); } }",
        "fade-out": "{ from { opacity: 0.5; } to { opacity: 0; } }",
      },
      durations: {
        "collapsible-exit": "300ms",
        "collapsible-enter": "300ms",
        "swipe-out": "200ms",
        "slide-in": "100ms",
        "fade-out": "100ms",
      },
      timingFns: {
        "collapsible-exit": "ease-out",
        "collapsible-enter": "ease-out",
        "swipe-out": "ease-out",
        "slide-in": "ease-in",
        "fade-out": "ease-in",
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
