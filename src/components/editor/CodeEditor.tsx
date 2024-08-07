import { createEffect, createSignal, onMount, Show, untrack } from "solid-js";

import { basicSetup } from "codemirror";
import { historyKeymap, indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap, type ViewUpdate } from "@codemirror/view";
import {
  oneDarkHighlightStyle,
  oneDarkTheme,
} from "@codemirror/theme-one-dark";
import { vim } from "@replit/codemirror-vim";

import { Button } from "@kobalte/core/button";
import { debounce } from "~/lib/util";
import { Switch } from "../Switch";

type Props = {
  onSave: (s: string) => void;
  initialValue: string;
  error: string | null;
  clearError: () => void;
};

const VIM_MODE_KEY = "vimMode";

export function CodeEditor(props: Props) {
  let parent: HTMLDivElement;
  let view: EditorView;
  let modeComp = new Compartment();

  const [vimMode, _setVimMode] = createSignal(false);
  const setVimMode = (v: boolean) => {
    _setVimMode(v);
    view.dispatch({
      effects: modeComp.reconfigure(v ? vim() : []),
    });
    localStorage.setItem(VIM_MODE_KEY, v ? "true" : "false");
  };

  const [dirty, setDirty] = createSignal(false);

  const extensions = [
    modeComp.of(vimMode() ? vim() : []),
    basicSetup,
    EditorView.lineWrapping,
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

        if (!newDirty && props.error) {
          props.clearError();
        }
      }, 300)
    ),
  ];

  onMount(() => {
    view = new EditorView({
      extensions,
      parent,
    });

    const saved = localStorage.getItem(VIM_MODE_KEY);
    if (saved === "true") {
      _setVimMode(true);
      view.dispatch({
        effects: modeComp.reconfigure(vim()),
      });
    }
  });

  // Track props.initialValue
  createEffect(() => {
    setDirty(false);

    // Saving should not reset editor state (cursor pos etc)
    if (view.state.doc.toString() === props.initialValue) return;

    view.setState(EditorState.create({ doc: props.initialValue, extensions }));

    const currVimMode = untrack(vimMode);
    if (currVimMode) {
      view.dispatch({
        effects: modeComp.reconfigure(vim()),
      });
    }
  });

  const [showCode, setShowCode] = createSignal(false);

  return (
    <div>
      <div class="flex justify-between pb-2 h-11">
        <Switch label="Show code" value={showCode()} setValue={setShowCode} />
        <Show when={showCode()}>
          <label class="flex items-center gap-1 text-sm">
            Vim mode
            <input
              class="h-4 w-4"
              type="checkbox"
              checked={vimMode()}
              onChange={(e) => setVimMode(e.target.checked)}
            />
          </label>
          <Button
            disabled={!dirty()}
            onMouseDown={() => props.onSave(view.state.doc.toString())}
            class="bg-green-700 border rounded-md hover:bg-green-700/90 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) disabled:(bg-transparent text-fore-base pointer-events-none opacity-50) transition-colors px-3 min-w-150px"
          >
            {dirty() ? "Save" : "No changes"}
          </Button>
        </Show>
      </div>
      <Show when={props.error}>
        <div class="text-red-100 bg-red-950 px-2 py-1 rounded-md mb-1">
          {props.error}
        </div>
      </Show>
      <div ref={parent!} classList={{ hidden: !showCode() }}></div>
    </div>
  );
}
