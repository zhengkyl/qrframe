import { Button } from "@kobalte/core/button";
import { type JSX, type Ref } from "solid-js";

type Props = {
  class?: string;
  onClick?: () => void;
  onMouseDown?: () => void;
  children: JSX.Element;
  title?: string;
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
};
export function FlatButton(props: Props) {
  return (
    <Button
      title={props.title}
      classList={{
        "leading-tight border rounded-md hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) disabled:(pointer-events-none opacity-50)":
          true,
        [props.class ?? "px-3 py-2"]: true,
      }}
      onMouseDown={props.onMouseDown}
      onClick={props.onClick}
      disabled={props.disabled}
      ref={props.ref}
    >
      {props.children}
    </Button>
  );
}

export function FillButton(props: Props) {
  return (
    <Button
      title={props.title}
      classList={{
        "leading-tight bg-fore-base text-back-base border rounded-md hover:bg-fore-base/90 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) disabled:(pointer-events-none opacity-50)":
          true,
        [props.class ?? "px-3 py-2"]: true,
      }}
      onMouseDown={props.onMouseDown}
      onClick={props.onClick}
      disabled={props.disabled}
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
