import { debounce } from "~/lib/util";

type TextareaProps = {
  setValue: (i: string) => void;
  placeholder?: string;
  onFocus: () => void;
  onBlur: () => void;
  ref: HTMLTextAreaElement | ((el: HTMLTextAreaElement) => void);
};

/** No `value` prop b/c textarea cannot be controlled  */
export function TextareaInput(props: TextareaProps) {
  const onInput = debounce(props.setValue, 300);
  return (
    <textarea
      class="bg-back-subtle min-h-[41.6px] px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) placeholder:text-fore-subtle"
      onInput={(e) => onInput(e.target.value)}
      onChange={(e) => props.setValue(e.target.value)}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      ref={props.ref}
      placeholder={props.placeholder}
    ></textarea>
  );
}

type InputProps = {
  placeholder?: string;
  defaultValue: string;
  onInput: (s: string) => void;
  ref?: HTMLInputElement;
  class?: string;
  onKeyDown?: (e: KeyboardEvent) => void;
};

/** UNCONTROLLED */
export function TextInput(props: InputProps) {
  return (
    <input
      ref={props.ref}
      class={`${
        props.class ?? ""
      } w-full bg-back-subtle leading-none px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)`}
      type="text"
      value={props.defaultValue}
      placeholder={props.placeholder}
      onInput={(e) => props.onInput(e.target.value)}
      onKeyDown={props.onKeyDown}
    />
  );
}
