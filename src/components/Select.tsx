import { Select as KSelect } from "@kobalte/core/select";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import { createSignal } from "solid-js";
import { FilledDot } from "./svg";

type Props = {
  options: string[];
  value: string;
  setValue: (v: string) => void;
};

export function Select(props: Props) {
  // props.value changes on focus/highlight for quick preview
  // but the old value should be restored on esc/unfocus
  const [retainedValue, setRetainedValue] = createSignal(props.value);
  return (
    <KSelect
      value={retainedValue()}
      onChange={(v) => {
        if (v != null) {
          props.setValue(v);
          setRetainedValue(v);
        }
      }}
      onOpenChange={(isOpen) => {
        if (!isOpen && props.value !== retainedValue()) {
          props.setValue(retainedValue());
        }
      }}
      // @ts-expect-error e is typed wtf
      onKeyDown={(e) => {
        const index = props.options.indexOf(props.value);
        switch (e.key) {
          case "ArrowDown":
            props.setValue(
              props.options[Math.min(index + 1, props.options.length - 1)]
            );
            break;
          case "ArrowUp":
            props.setValue(props.options[Math.max(index - 1, 0)]);
            break;
          case "Home":
            props.setValue(props.options[0]);
            break;
          case "End":
            props.setValue(props.options[props.options.length - 1]);
            break;
        }
      }}
      class="w-[160px]"
      options={props.options}
      gutter={4}
      itemComponent={(itemProps) => (
        <KSelect.Item
          class="flex justify-between items-center p-2 rounded select-none data-[highlighted]:(bg-fore-base/10 outline-none)"
          item={itemProps.item}
          onMouseEnter={() => {
            props.setValue(itemProps.item.key);
          }}
        >
          <KSelect.Label>{itemProps.item.rawValue}</KSelect.Label>
          <KSelect.ItemIndicator>
            <FilledDot size={20} class="-me-1"/>
          </KSelect.ItemIndicator>
        </KSelect.Item>
      )}
    >
      <KSelect.Trigger class="leading-tight w-full inline-flex justify-between items-center rounded-md border pl-3 pr-2 py-2 focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) hover:bg-fore-base/5">
        <KSelect.Value>
          {(state) => state.selectedOption() as string}
        </KSelect.Value>
        <KSelect.Icon>
          <ChevronsUpDown size={16}/>
        </KSelect.Icon>
      </KSelect.Trigger>
      <KSelect.Portal>
        <KSelect.Content class="leading-tight bg-back-base rounded-md border p-1">
          <KSelect.Listbox />
        </KSelect.Content>
      </KSelect.Portal>
    </KSelect>
  );
}