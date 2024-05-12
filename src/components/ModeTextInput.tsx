import { Select } from "@kobalte/core/select";
import ChevronsUpDown from "lucide-solid/icons/chevrons-up-down";
import Check from "lucide-solid/icons/check";
const MODE_VALUE = {
  Numeric: 0,
  Alphanumeric: 1,
  Byte: 2,
};
type Props = {
  mode: string;
  setInput: (i: string) => void;
  setMode: (m: number) => void;
};
export function ModeTextInput(props: Props) {
  const onInput = debounce(props.setInput, 300);
  return (
    <div class="flex flex-col gap-2">
      <textarea
        class="bg-back-subtle min-h-[80px] px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
        onInput={(e) => onInput(e.target.value)}
        onChange={(e) => props.setInput(e.target.value)}
      ></textarea>
      <div class="flex justify-between items-center">
        <span class="text-sm">Encoding</span>
        <Select
          value={props.mode}
          onChange={(v) =>
            props.setMode(MODE_VALUE[v as keyof typeof MODE_VALUE])
          }
          class="w-[160px]"
          options={["Numeric", "Alphanumeric", "Byte"]}
          itemComponent={(itemProps) => (
            <Select.Item
              class="flex justify-between items-center pl-2 pr-1 py-2 rounded select-none data-[highlighted]:(bg-fore-base/10 outline-none)"
              item={itemProps.item}
            >
              <Select.Label>{itemProps.item.rawValue}</Select.Label>
              <Select.ItemIndicator>
                <Check class="h-4 w-4" />
              </Select.ItemIndicator>
            </Select.Item>
          )}
        >
          <Select.Trigger class="leading-tight w-full inline-flex justify-between items-center rounded-md border pl-3 pr-2 py-2 focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) hover:bg-fore-base/5">
            <Select.Value>
              {(state) => state.selectedOption() as string}
            </Select.Value>
            <Select.Icon>
              <ChevronsUpDown class="h-4 w-4" />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content class="bg-back-base rounded-md border p-1">
              <Select.Listbox />
            </Select.Content>
          </Select.Portal>
        </Select>
      </div>
    </div>
  );
}

function debounce(func: any, delay: number) {
  let timer: any;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}
