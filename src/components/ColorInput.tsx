type Props = {
  value: string;
  setValue: (c: string) => void;
};
export function ColorInput(props: Props) {
  return (
    <label class="border rounded-md font-mono inline-flex items-center py-1.5 px-2 gap-1 cursor-pointer bg-back-base hover:bg-fore-base/5 focus-within:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)">
      {props.value}
      <input
        class="w-0 h-0"
        type="color"
        value={props.value}
        onInput={(e) => props.setValue(e.target.value)}
      />
      <div
        class="rounded-sm border w-6 h-6"
        style={{ background: props.value }}
      ></div>
    </label>
  );
}
