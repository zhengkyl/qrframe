import { Button } from "@kobalte/core/button";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import { NumberField } from "@kobalte/core/number-field";
import ChevronDown from "lucide-solid/icons/chevron-down";
import Download from "lucide-solid/icons/download";
import { createSignal } from "solid-js";
import { FillButton } from "./Button";

type Props = {
  onClick: (width: number, height: number) => void;
};
export function SplitButton(props: Props) {
  const [customWidth, setCustomWidth] = createSignal(1000);
  const [customHeight, setCustomHeight] = createSignal(1000);

  const onClick = (width: number, height: number) => {
    props.onClick(width, height);
    setOpen(false)
  };
  const [open, setOpen] = createSignal(false);
  return (
    <div class="leading-tight flex">
      <Button class="border border-e-none rounded-md rounded-e-none hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) inline-flex justify-center items-center gap-1 flex-1 px-6 py-2">
        <Download size={20} />
        PNG
      </Button>
      <DropdownMenu gutter={4} open={open()} onOpenChange={setOpen}>
        <DropdownMenu.Trigger
          class="dropdown-menu__trigger border rounded-md rounded-s-none hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) p-2"
        >
          <DropdownMenu.Icon class="block data-[expanded]:rotate-180 transition-transform">
            <ChevronDown size={20} />
          </DropdownMenu.Icon>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content class="dropdown-menu__content bg-back-base rounded-md border p-2 outline-none min-w-150px leading-tight">
            <div class="flex flex-col gap-2">
              <div class="text-sm font-bold">Select size</div>
              <FillButton
                class="w-full p-2"
                onClick={() => onClick(300, 300)}
              >
                300x300
              </FillButton>
              <FillButton
                class="w-full p-2"
                onClick={() => onClick(500, 500)}
              >
                500x500
              </FillButton>
              <DropdownMenu.Separator class="dropdown-menu__separator" />
              <div class="text-sm font-bold">Custom</div>
              <div class="flex gap-2">
                <MenuNumberInput
                  min={1}
                  max={10000}
                  value={customWidth()}
                  setValue={setCustomWidth}
                />
                <MenuNumberInput
                  min={1}
                  max={10000}
                  value={customHeight()}
                  setValue={setCustomHeight}
                />
              </div>
              <FillButton
                class="w-full p-2"
                onClick={() => onClick(customWidth(), customHeight())}
              >
                Download custom
              </FillButton>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu>
    </div>
  );
}

type NumberProps = {
  min: number;
  max: number;
  value: number;
  setValue: (v: number) => void;
};

function MenuNumberInput(props: NumberProps) {
  const [rawValue, setRawValue] = createSignal(props.value);

  const safeSetValue = (value: number) => {
    setRawValue(value);
    if (
      value < props.min ||
      value > props.max ||
      isNaN(value) ||
      !Number.isInteger(value)
    ) {
      return;
    }

    if (value !== props.value) {
      props.setValue(value);
    }
  };

  const [focused, setFocused] = createSignal(false);
  return (
    <NumberField
      formatOptions={{ useGrouping: false }}
      class="relative rounded-md focus-within:(ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
      minValue={props.min}
      maxValue={props.max}
      rawValue={focused() ? rawValue() : props.value}
      onRawValueChange={safeSetValue}
    >
      <NumberField.Input
        class="w-20 text-sm rounded-md px-3 py-2 border bg-transparent focus:outline-none"
        onFocus={[setFocused, true]}
        onBlur={[setFocused, false]}
        onFocusOut={() => console.log("focout")}
      />
    </NumberField>
  );
}
