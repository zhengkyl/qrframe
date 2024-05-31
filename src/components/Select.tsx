import { Select as KSelect } from "@kobalte/core/select";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import Check from "lucide-solid/icons/check";

type Props<T extends string> = {
  values: T[];
  value: T;
  setValue: (v: T) => void;
};

export function Select<T extends string>(props: Props<T>) {
  return (
    <KSelect
      value={props.value}
      onChange={props.setValue}
      class="w-[160px]"
      options={props.values}
      itemComponent={(itemProps) => (
        <KSelect.Item
          class="flex justify-between items-center pl-2 pr-1 py-2 rounded select-none data-[highlighted]:(bg-fore-base/10 outline-none)"
          item={itemProps.item}
        >
          <KSelect.Label>{itemProps.item.rawValue}</KSelect.Label>
          <KSelect.ItemIndicator>
            <Check class="h-4 w-4" />
          </KSelect.ItemIndicator>
        </KSelect.Item>
      )}
    >
      <KSelect.Trigger class="leading-tight w-full inline-flex justify-between items-center rounded-md border pl-3 pr-2 py-2 focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) hover:bg-fore-base/5">
        <KSelect.Value>
          {(state) => state.selectedOption() as string}
        </KSelect.Value>
        <KSelect.Icon>
          <ChevronsUpDown class="h-4 w-4" />
        </KSelect.Icon>
      </KSelect.Trigger>
      <KSelect.Portal>
        <KSelect.Content class="bg-back-base rounded-md border p-1">
          <KSelect.Listbox />
        </KSelect.Content>
      </KSelect.Portal>
    </KSelect>
  );
}
