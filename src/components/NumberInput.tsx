import { NumberField } from "@kobalte/core/number-field";
import { Slider } from "@kobalte/core/slider";
import ChevronUp from "lucide-solid/icons/chevron-up";
import ChevronDown from "lucide-solid/icons/chevron-down";
import { createSignal } from "solid-js";

type Props = {
  min: number;
  max: number;
  step?: number;
  value: number;
  setValue: (v: number) => void;
};

export function NumberInput(props: Props) {
  const [rawValue, setRawValue] = createSignal(props.value);

  const safeSetValue = (value: number) => {
    setRawValue(value);
    if (value < props.min || value > props.max || isNaN(value)) {
      return;
    }

    if (value !== props.value) {
      props.setValue(value);
    }
  };

  const [focused, setFocused] = createSignal(false);

  return (
    <div class="flex items-center gap-4 w-full">
      <Slider
        class="w-full"
        step={props.step}
        minValue={props.min}
        maxValue={props.max}
        value={[props.value]}
        onChange={(values) => props.setValue(values[0])}
      >
        <Slider.Track class="relative h-2 bg-back-subtle rounded-full">
          <div class="absolute w-4 h-full bg-fore-base rounded-full"></div>
          <div class="relative h-full mx-[0.5rem] w-[calc(100%-1rem)]">
            <Slider.Fill class="absolute h-full bg-fore-base rounded-full" />
            <Slider.Thumb class="h-4 w-4 -top-1 bg-back-base rounded-full border-2 border-fore-base cursor-pointer focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)">
              <Slider.Input class="" />
            </Slider.Thumb>
          </div>
        </Slider.Track>
      </Slider>
      <NumberField
        class="relative rounded-md focus-within:(ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) bg-back-base hover:bg-fore-base/5"
        minValue={props.min}
        maxValue={props.max}
        step={props.step}
        rawValue={focused() ? rawValue() : props.value}
        onRawValueChange={safeSetValue}
      >
        <NumberField.Input
          class="w-20 text-sm rounded-md px-3 py-2 border bg-transparent focus:outline-none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <NumberField.IncrementTrigger
          aria-label="Increment"
          class="absolute right-1 top-1 h-3 w-3 bg-back-subtle rounded-t hover:(bg-fore-base/10)"
        >
          <ChevronUp size={12} />
        </NumberField.IncrementTrigger>
        <NumberField.DecrementTrigger
          aria-label="Decrement"
          class="absolute right-1 bottom-1 h-3 w-3 bg-back-subtle rounded-b hover:(bg-fore-base/10)"
        >
          <ChevronDown size={12} />
        </NumberField.DecrementTrigger>
      </NumberField>
    </div>
  );
}
