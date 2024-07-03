import { ToggleGroup } from "@kobalte/core/toggle-group";
import { type JSX } from "solid-js";

type Props<T extends string> = {
  value?: T;
  setValue: (v: T) => void;
  children: JSX.Element;
};

export function ButtonGroup<T extends string>(props: Props<T>) {
  return (
    <ToggleGroup
      class="border rounded-md flex"
      value={props.value}
      onChange={(v) => v && props.setValue(v as T)}
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
      class="flex-grow-1 px-3 py-2 min-w-8 leading-tight border-l first:(border-none rounded-l-md) last:rounded-r-md text-fore-subtle aria-pressed:(bg-fore-base/10 text-fore-base) hover:bg-fore-base/10 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
      value={props.value}
      aria-label={props.value ?? props.ariaLabel}
      title={props.title ? props.value ?? props.ariaLabel : undefined}
    >
      {props.children}
    </ToggleGroup.Item>
  );
}
