import X from "lucide-solid/icons/x";
import { Show } from "solid-js";
import { FlatButton } from "./Button";

type Props = {
  value: File | null;
  setValue: (f: File | null) => void;
  accept?: string;
};

export function FileInput(props: Props) {
  let input: HTMLInputElement;
  return (
    <div class="inline-flex items-center gap-1">
      <input
        class="w-full border rounded-md text-sm px-1 py-2 file:(bg-transparent border-none text-fore-base) bg-back-base hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base)"
        ref={input!}
        type="file"
        accept={props.accept}
        onChange={(e) => {
          // @ts-expect-error onChange is called so files exists
          props.setValue(e.target.files[0]);
        }}
      />
      <Show when={props.value}>
        <FlatButton
          class="p-1"
          onClick={() => {
            input.value = "";
            props.setValue(null);
          }}
        >
          <X size={20} />
        </FlatButton>
      </Show>
    </div>
  );
}
