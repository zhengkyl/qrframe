import { ToggleGroup } from "@kobalte/core/toggle-group";
import { type JSX } from "solid-js";

type Props = {
  value: string;
  setValue: (v: string) => void;
  children: JSX.Element;
};

export function ButtonGroup(props: Props) {
  return (
    <ToggleGroup
      class="border rounded-md flex"
      defaultValue={props.value}
      value={props.value}
      onChange={(v) => v && props.setValue(v)}
    >
      {props.children}
    </ToggleGroup>
  );
}

type ItemProps = {
  value: string;
  ariaLabel?: string;
  title?: boolean;
  children: JSX.Element;
};

export function ButtonGroupItem(props: ItemProps) {
  return (
    <ToggleGroup.Item
      class="w-8 h-8 border-l first:(border-none rounded-l-md) last:rounded-r-md text-fore-subtle aria-pressed:(bg-back-active text-fore-base) hover:bg-back-active"
      value={props.value}
      aria-label={props.value ?? props.ariaLabel}
      title={props.title ? props.value ?? props.ariaLabel : undefined}
    >
      {props.children}
    </ToggleGroup.Item>
  );
}
