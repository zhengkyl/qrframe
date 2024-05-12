import { Switch as KSwitch } from "@kobalte/core/switch";

type Props = {
  value: boolean;
  setValue: (b: boolean) => void;
};

export function Switch(props: Props) {
  return (
    <KSwitch
      class="inline-flex items-center"
      checked={props.value}
      onChange={props.setValue}
    >
      <KSwitch.Input class="peer" />
      <KSwitch.Control class="inline-flex items-center w-11 h-6 px-0.5 bg-fore-base/20 data-[checked]:bg-fore-base transition-colors border rounded-3 peer-focus:(ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)">
        <KSwitch.Thumb class="h-5 w-5 rounded-2.5 bg-back-base data-[checked]:translate-x-[calc(100%-1px)] transition-transform" />
      </KSwitch.Control>
    </KSwitch>
  );
}
