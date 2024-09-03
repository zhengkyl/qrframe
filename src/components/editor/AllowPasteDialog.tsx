import { AlertDialog } from "@kobalte/core/alert-dialog";
import X from "lucide-solid/icons/x";
import { FillButton, FlatButton } from "../Button";

type Props = {
  open: boolean;
  setClosed: () => void;
  onAllow: () => void;
};

export function AllowPasteDialog(props: Props) {
  return (
    <AlertDialog open={props.open} onOpenChange={props.setClosed}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay class="fixed inset-0 z-10 bg-black/20" />
        <div class="fixed inset-0 z-10 flex justify-center items-center">
          <AlertDialog.Content class="border rounded-md p-4 m-4 min-w-[min(calc(100vw-16px),400px)] max-w-[600px] bg-back-base">
            <div class="flex justify-between items-center -mt-2 -mr-2">
              <AlertDialog.Title class="text-lg font-semibold">
                Allow pasting code?
              </AlertDialog.Title>
              <AlertDialog.CloseButton class="p-2">
                <X />
              </AlertDialog.CloseButton>
            </div>
            <div class="flex flex-col gap-2 mb-4 text-sm">
              <p>Using code you don't understand could be dangerous.</p>
              <p>
                There are no secrets or passwords that can be leaked from this
                website, but you may be trolled. The page may break, you could
                be redirected to another URL, or any number of things could
                happen.
              </p>
              <p>Do you accept these risks?</p>
            </div>
            <div class="flex justify-end gap-2">
              <FillButton
                onMouseDown={() => {
                  props.onAllow();
                  props.setClosed();
                }}
              >
                Yes
              </FillButton>
              <FlatButton onMouseDown={props.setClosed}>
                No, I'm sorry I wasted your time
              </FlatButton>
            </div>
          </AlertDialog.Content>
        </div>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
