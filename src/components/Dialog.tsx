import { Dialog } from "@kobalte/core/dialog";
import X from "lucide-solid/icons/x";
import { createSignal, type JSX } from "solid-js";

type Props = {
  triggerTitle: string;
  triggerChildren: JSX.Element;
  title: string;
  children: (close: () => void) => JSX.Element;
  onOpenAutoFocus?: (event: Event) => void;
};

export function IconButtonDialog(props: Props) {
  const [open, setOpen] = createSignal(false);

  return (
    <Dialog open={open()} onOpenChange={setOpen}>
      <Dialog.Trigger
        title={props.triggerTitle}
        class="border rounded-md hover:bg-fore-base/5 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) disabled:(pointer-events-none opacity-50) p-2"
      >
        {props.triggerChildren}
      </Dialog.Trigger>
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
            {props.children(() => setOpen(false))}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog>
  );
}
