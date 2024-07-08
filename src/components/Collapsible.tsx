import { Collapsible as KCollapsible } from "@kobalte/core/collapsible";
import ChevronDown from "lucide-solid/icons/chevron-down";
import type { JSX } from "solid-js";

type Props = {
  trigger: string;
  children: JSX.Element;
};
export function Collapsible(props: Props) {
  return (
    <KCollapsible class="">
      <KCollapsible.Trigger class="group font-bold w-full inline-flex justify-between leading-tight focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) disabled:(pointer-events-none opacity-50) py-4">
        {props.trigger}
        <ChevronDown class="w-5 h-5 group-data-[expanded]:rotate-180 transition-transform duration-300" />
      </KCollapsible.Trigger>
      <KCollapsible.Content class="overflow-hidden animate-collapsible-exit data-[expanded]:animate-collapsible-enter">
        {props.children}
      </KCollapsible.Content>
    </KCollapsible>
  );
}
