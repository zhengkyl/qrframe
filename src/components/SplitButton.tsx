import { Button } from "@kobalte/core/button";
import { NumberField } from "@kobalte/core/number-field";
import { Popover } from "@kobalte/core/popover";
import ChevronDown from "lucide-solid/icons/chevron-down";
import Download from "lucide-solid/icons/download";
import { createSignal } from "solid-js";
import { FillButton } from "./Button";

type Props = {
  onClick: (resizeWidth, resizeHeight) => void;
};
export function SplitButton(props: Props) {
  const [customWidth, setCustomWidth] = createSignal(1000);
  const [customHeight, setCustomHeight] = createSignal(1000);

  const onClick = (resizeWidth, resizeHeight) => {
    props.onClick(resizeWidth, resizeHeight);
    setOpen(false);
  };
  const [open, setOpen] = createSignal(false);
  return (
    <div class="leading-tight flex">
      <Button
        class="border border-e-none rounded-md rounded-e-none hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) inline-flex justify-center items-center gap-1 flex-1 px-6 py-2"
        onClick={() => onClick(0, 0)}
      >
        <Download size={20} />
        PNG
      </Button>
      <Popover gutter={4} open={open()} onOpenChange={setOpen}>
        <Popover.Trigger class="group border rounded-md rounded-s-none hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) p-2">
          <ChevronDown
            size={20}
            class="block group-data-[expanded]:rotate-180 transition-transform"
          />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content class="bg-back-base rounded-md border p-2 outline-none min-w-150px leading-tight">
            <div class="flex flex-col gap-2">
              <div class="text-sm font-bold">Select size</div>
              <FillButton class="w-full p-2" onClick={() => onClick(300, 300)}>
                300x300
              </FillButton>
              <FillButton class="w-full p-2" onClick={() => onClick(500, 500)}>
                500x500
              </FillButton>
              <hr />
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
          </Popover.Content>
        </Popover.Portal>
      </Popover>
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

  const safeSetValue = (value) => {
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
      />
    </NumberField>
  );
}
