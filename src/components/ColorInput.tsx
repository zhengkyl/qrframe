type Props = {
  color: string;
  setColor: (c: String) => void;
};
export function ColorInput(props: Props) {
  return (
    <label class="border rounded-md font-mono inline-flex items-center p-1.5 gap-2 cursor-pointer hover:bg-fore-base/5">
      {props.color}
      <input
        class="rounded-sm border-none w-6 h-6"
        type="color"
        value={props.color}
        onInput={(e) => props.setColor(e.target.value)}
      />
    </label>
  );
}
