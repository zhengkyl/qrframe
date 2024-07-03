import { Combobox } from "@kobalte/core/combobox";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import Check from "lucide-solid/icons/check";

type Group<T> = { label: string; options: T[] };

type Props<T extends string> = {
  options: Group<T>[];
  value: T;
  setValue: (v: T) => void;
};

export function Selector<T extends string>(props: Props<T>) {
  return (
    <Combobox<T, Group<T>>
      options={props.options}
      defaultFilter={(_option, _input) => true}
      optionGroupChildren="options"
      placeholder="Select a function..."
      triggerMode="input"
      itemComponent={(props) => (
        <Combobox.Item item={props.item}>
          <Combobox.ItemLabel>{props.item.rawValue}</Combobox.ItemLabel>
          <Combobox.ItemIndicator>
            <Check />
          </Combobox.ItemIndicator>
        </Combobox.Item>
      )}
      sectionComponent={(props) => (
        <Combobox.Section>{props.section.rawValue.label}</Combobox.Section>
      )}
    >
      <Combobox.Control
        class="bg-back-subtle rounded-md focus-within:(ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) hover:bg-fore-base/5"
        aria-label="Functions"
      >
        <Combobox.Input class="bg-transparent px-3 py-2 rounded-l-md border focus:(outline-none)"/>
        <Combobox.Trigger>
          <Combobox.Icon>
            <ChevronsUpDown />
          </Combobox.Icon>
        </Combobox.Trigger>
      </Combobox.Control>
      <Combobox.Portal>
        <Combobox.Content class="bg-back-base">
          <Combobox.Listbox />
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox>
  );
}
