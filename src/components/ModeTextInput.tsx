type Props = {
  setValue: (i: string) => void;
};

/** No `value` prop b/c textarea cannot be controlled  */
export function TextInput(props: Props) {
  const onInput = debounce(props.setValue, 300);
  return (
    <div class="flex flex-col gap-2">
      <textarea
        class="bg-back-subtle min-h-[80px] px-3 py-2 rounded-md border focus:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
        onInput={(e) => onInput(e.target.value)}
        onChange={(e) => props.setValue(e.target.value)}
      ></textarea>
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
