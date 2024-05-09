type Props = {
  color: string;
  setColor: (c: String) => void;
};
export function ColorInput(props: Props) {
  return (
    <label>
      {props.color}
      <input
        type="color"
        value={props.color}
        onInput={(e) => props.setColor(e.target.value)}
        // onChange={(e) => props.setColor(e.target.value)}
      />
    </label>
  );
}
