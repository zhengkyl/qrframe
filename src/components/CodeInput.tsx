import { createEffect, createSignal, onMount, Show } from "solid-js";

import { basicSetup } from "codemirror";
import { historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting } from "@codemirror/language";
import { Compartment, Transaction } from "@codemirror/state";
import { EditorView, keymap, type ViewUpdate } from "@codemirror/view";
import {
  oneDarkHighlightStyle,
  oneDarkTheme,
} from "@codemirror/theme-one-dark";
import { vim } from "@replit/codemirror-vim";

import { Button } from "@kobalte/core/button";
import { debounce } from "~/lib/util";
import { Switch } from "./Switch";

type Props = {
  onSave: (s: string) => void;
  initialValue: string;
  error: string | null;
};

export function CodeInput(props: Props) {
  let parent: HTMLDivElement;
  let view: EditorView;
  let modeComp = new Compartment();
  // let undoComp = new Compartment();

  const [vimMode, _setVimMode] = createSignal(false);
  const setVimMode = (v: boolean) => {
    _setVimMode(v);
    view.dispatch({
      effects: modeComp.reconfigure(v ? vim() : []),
    });
  };

  const [dirty, setDirty] = createSignal(false);

  onMount(() => {
    view = new EditorView({
      extensions: [
        modeComp.of(vimMode() ? vim() : []),
        basicSetup,
        // undoComp.of(history()),
        keymap.of([
          indentWithTab,
          {
            win: "Mod-Shift-z",
            // Dirty hack, but undo/redo commands are not exposed
            run: historyKeymap[1].run,
          },
          {
            key: "Mod-s",
            linux: "Ctrl-s", // untested, but might be necessary
            run: (view) => {
              props.onSave(view.state.doc.toString());
              return true;
            },
          },
        ]),
        javascript(),
        oneDarkTheme,
        syntaxHighlighting(oneDarkHighlightStyle),
        EditorView.updateListener.of(
          debounce((u: ViewUpdate) => {
            // docChanged (aka changes.empty) doesn't work when debounced
            // if (!u.docChanged) return;
            const newDirty = u.state.doc.toString() !== props.initialValue;
            setDirty(newDirty);
          }, 300)
        ),
      ],
      parent,
    });
  });

  createEffect(() => {
    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: props.initialValue,
      },
      annotations: Transaction.addToHistory.of(false),
    });

    // view.dispatch({
    //   effects: undoComp.reconfigure([]),
    // });
    // view.dispatch({
    //   effects: undoComp.reconfigure(history()),
    // });
  });

  return (
    <div>
      <div class="flex justify-between py-2">
        <Switch label="Vim mode" value={vimMode()} setValue={setVimMode} />
        <Button
          disabled={!dirty()}
          onMouseDown={() => props.onSave(view.state.doc.toString())}
          class="bg-green-700 border rounded-md hover:bg-green-700/90 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) disabled:(bg-transparent text-fore-base pointer-events-none opacity-50) transition-colors px-3 py-1 min-w-150px"
        >
          {dirty() ? "Save" : "No changes"}
        </Button>
      </div>
      <Show when={props.error}>
        <div class="text-red-100 bg-red-950 px-2 py-1 rounded-md mb-1">
          {props.error}
        </div>
      </Show>
      <div ref={parent!}></div>
    </div>
  );
}
