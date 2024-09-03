import { Dialog } from "@kobalte/core/dialog";
import X from "lucide-solid/icons/x";
import { type JSX } from "solid-js";
import { FlatButton } from "./Button";

type Props = {
  title: string;
  children: (close: () => void) => JSX.Element;
  onOpenAutoFocus?: (event: Event) => void;
  open: boolean;
  setOpen: (b: boolean) => void;
};
export function ControlledDialog(props: Props) {
  return (
    <Dialog open={props.open} onOpenChange={props.setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-10 bg-black/20" />
        <div class="fixed inset-0 z-10 flex justify-center items-center">
          <Dialog.Content
            class="border rounded-md p-4 m-4 min-w-[min(calc(100vw-16px),400px)] bg-back-base"
            onOpenAutoFocus={props.onOpenAutoFocus}
          >
            <div class="flex justify-between items-center -mt-2 -mr-2">
              <Dialog.Title class="text-lg font-semibold">
                {props.title}
              </Dialog.Title>
              <Dialog.CloseButton class="p-2">
                <X />
              </Dialog.CloseButton>
            </div>
            {props.children(() => props.setOpen(false))}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}

type ButtonProps = {
  title: string;
  children: JSX.Element;
  onClick?: () => void;
};
// Dialog.Trigger toggles the open state, so
// it cannot be used with onClick that modifies the open state
export function DialogButton(props: ButtonProps) {
  return (
    <FlatButton title={props.title} class="p-2" onClick={props.onClick}>
      {props.children}
    </FlatButton>
  );
}
