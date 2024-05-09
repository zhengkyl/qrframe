import { Button } from "@kobalte/core/button";
import type { JSX } from "solid-js";

type Props = {
  class?: string;
  onClick: () => void;
  children: JSX.Element;
};
export function FlatButton(props: Props) {
  return (
    <Button
      class={`inline-flex justify-center items-center gap-1 border rounded-md px-3 py-2 hover:bg-fore-base/5 ${
        props.class ? props.class : ""
      }`}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}
