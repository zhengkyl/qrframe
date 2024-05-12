type Props = {
  color: string;
  setColor: (c: String) => void;
};
export function ColorInput(props: Props) {
  return (
    <label class="border rounded-md font-mono inline-flex items-center p-1.5 gap-2 cursor-pointer hover:bg-fore-base/5">
      {props.color}
      <input
        class="rounded-sm border-none w-6 h-6 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
        type="color"
        value={props.color}
        onInput={(e) => props.setColor(e.target.value)}
      />
    </label>
  );
}
