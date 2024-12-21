import { Toast, toaster } from "@kobalte/core/toast";
import X from "lucide-solid/icons/x";
import { type JSX } from "solid-js";

export const clearToasts = () => toaster.clear();

export const toastError = (title: JSX.Element, description: JSX.Element) => {
  toaster.clear();
  toaster.show((props) => (
    <Toast
      class="border rounded-md p-2 text-white bg-red-900 data-[swipe=move]:translate-x-[var(--kb-toast-swipe-move-x)] data-[swipe=cancel]:(translate-x-0 transition-transform duration-200 ease-out) data-[swipe=end]:animate-swipe-out data-[opened]:animate-slide-in data-[closed]:animate-fade-out"
      toastId={props.toastId}
      persistent
    >
      <div class="flex justify-between">
        <Toast.Title class="toast__title font-bold">{title}</Toast.Title>
        <Toast.CloseButton class="toast__close-button">
          <X />
        </Toast.CloseButton>
      </div>
      <Toast.Description class="toast__description">
        {description}
      </Toast.Description>
    </Toast>
  ));
};

export function ErrorToasts() {
  return (
    <Toast.Region>
      <Toast.List class="fixed bottom-0 right-0 z-10 w-100 max-w-screen p-4 flex flex-col gap-2" />
    </Toast.Region>
  );
}
