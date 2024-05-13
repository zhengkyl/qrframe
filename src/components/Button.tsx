import { Button } from "@kobalte/core/button";
import { type JSX } from "solid-js";

type Props = {
  class?: string;
  onClick?: () => void;
  onMouseDown?: () => void;
  children: JSX.Element;
};
export function FlatButton(props: Props) {
  return (
    <Button
      class={`inline-flex justify-center items-center gap-1 border rounded-md hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) ${
        props.class || "px-3 py-2"
      }`}
      onMouseDown={props.onMouseDown}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}

type ToggleProps = {
  value: boolean;
  onClick?: () => void;
  onMouseDown?: () => void;
  children: JSX.Element;
};

export function ToggleButton(props: ToggleProps) {
  return (
    <Button
      class="px-3 py-2 border rounded-md text-fore-subtle aria-pressed:(bg-fore-base/10 text-fore-base) hover:bg-fore-base/10 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
      onClick={props.onClick}
      onMouseDown={props.onMouseDown}
      aria-pressed={props.value}
    >
      {props.children}
    </Button>
  );
}
