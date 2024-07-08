import { debounce } from "~/lib/util";

type TextareaProps = {
  setValue: (i: string) => void;
  placeholder?: string
};

/** No `value` prop b/c textarea cannot be controlled  */
export function TextareaInput(props: TextareaProps) {
  const onInput = debounce(props.setValue, 300);
  return (
    <textarea
      class="bg-back-subtle min-h-[80px] px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) placeholder:text-fore-subtle"
      onInput={(e) => onInput(e.target.value)}
      onChange={(e) => props.setValue(e.target.value)}
      placeholder={props.placeholder}
    ></textarea>
  );
}

type InputProps = {
  placeholder?: string;
  defaultValue: string;
  onChange: (s: string) => void;
  onInput: (s: string) => void;
  ref?: HTMLInputElement;
  class?: string
};

/** UNCONTROLLED */
export function TextInput(props: InputProps) {
  return (
    <input
      ref={props.ref}
      class={`${props.class ?? ''} w-full bg-back-subtle leading-none px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)`}
      type="text"
      value={props.defaultValue}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange(e.target.value)}
      onInput={(e) => props.onInput(e.target.value)}
    />
  );
}
