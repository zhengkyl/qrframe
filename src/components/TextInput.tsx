import { debounce } from "~/lib/util";

type TextareaProps = {
  setValue: (i: string) => void;
};

/** No `value` prop b/c textarea cannot be controlled  */
export function TextareaInput(props: TextareaProps) {
  const onInput = debounce(props.setValue, 300);
  return (
    // <div class="flex flex-col gap-2">
    <textarea
      class="bg-back-subtle min-h-[80px] px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
      onInput={(e) => onInput(e.target.value)}
      onChange={(e) => props.setValue(e.target.value)}
    ></textarea>
    // </div>
  );
}

type InputProps = {
  placeholder?: string;
  value: string;
  setValue: (s: string) => void;
};

/** UNCONTROLLED */
export function TextInput(props: InputProps) {
  return (
    <input
      class="bg-back-subtle leading-none px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
      type="text"
      value={props.value}
      placeholder={props.placeholder}
      onChange={(e) => props.setValue(e.target.value)}
    />
  );
}
