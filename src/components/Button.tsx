import { Button } from "@kobalte/core/button";
import type { JSX } from "solid-js";
import { ToggleButton as KToggleButton } from "@kobalte/core/toggle-button";

type Props = {
  class?: string;
  onClick: () => void;
  children: JSX.Element;
};
export function FlatButton(props: Props) {
  return (
    <Button
      class={`inline-flex justify-center items-center gap-1 border rounded-md px-3 py-2 hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) ${
        props.class ? props.class : ""
      }`}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}

type ToggleProps = {
  value: boolean;
  onClick: () => void;
  children: JSX.Element;
};

export function ToggleButton(props: ToggleProps) {
  return (
    <KToggleButton
      class="px-3 py-2 border rounded-md text-fore-subtle data-[pressed]:(bg-fore-base/10 text-fore-base) hover:bg-fore-base/10 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
      pressed={props.value}
      onChange={props.onClick}
    >
      {props.children}
    </KToggleButton>
  );
}
