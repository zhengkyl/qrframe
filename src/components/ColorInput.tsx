import { createEffect } from "solid-js";
import Coloris from "@melloware/coloris";
import "../coloris.css";

Coloris.init();

type Props = {
  value: string;
  setValue: (c: string) => void;
};

export default function ColorInput(props: Props) {
  let input: HTMLInputElement;
  createEffect(() => {
    if (props.value !== input.value) {
      input.value = props.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  return (
    <div class="w-full">
      <input
        class="text-white pl-9 font-mono w-full bg-back-subtle leading-none px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
        type="button"
        on:input={(e) => {
          props.setValue(e.target.value);
        }}
        ref={(ref) => {
          ref.value = props.value;
          Coloris({
            el: ref,
            alpha: true,
            formatToggle: true,
            focusInput: false,
            theme: "large",
            themeMode: "auto",
          });
          input = ref;
        }}
      />
    </div>
  );
}
