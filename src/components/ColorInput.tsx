type Props = {
  value: string;
  setValue: (c: string) => void;
};
export function ColorInput(props: Props) {
  return (
    <label class="border rounded-md font-mono inline-flex items-center py-1.5 px-2 gap-2 cursor-pointer hover:bg-fore-base/5">
      {props.value}
      <input
        class="rounded-sm border-none w-6 h-6 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
        type="color"
        value={props.value}
        onInput={(e) => props.setValue(e.target.value)}
      />
    </label>
  );
}
