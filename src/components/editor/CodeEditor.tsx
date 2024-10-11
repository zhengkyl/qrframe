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
import { AllowPasteDialog } from "./AllowPasteDialog";

type Props = {
  onSave: (s: string, thumbnail: boolean) => void;
  initialValue: string;
};

const VIM_MODE_KEY = "vimMode";
const ALLOW_PASTE_KEY = "allowPaste";

export function CodeEditor(props: Props) {
  let parent: HTMLDivElement;
  let view: EditorView;
  let modeComp = new Compartment();
  let allowPaste;

  const [vimMode, _setVimMode] = createSignal(false);
  const setVimMode = (v: boolean) => {
    _setVimMode(v);
    view.dispatch({
      effects: modeComp.reconfigure(v ? vim() : []),
    });
    localStorage.setItem(VIM_MODE_KEY, v ? "true" : "false");
  };

  const [updateThumbnail, setUpdateThumbnail] = createSignal(true);

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
          props.onSave(view.state.doc.toString(), updateThumbnail());
          return true;
        },
      },
      {
        key: "Mod-v",
        run: () => {
          if (allowPaste) return false;
          setShowDialog(true);
          return true;
        },
      },
    ]),
    EditorView.domEventHandlers({
      paste() {
        if (allowPaste) return false;
        setShowDialog(true);
        return true;
      },
    }),
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

    allowPaste = localStorage.getItem(ALLOW_PASTE_KEY) === "true";
  });

  // Track props.initialValue
  createEffect(() => {
    setDirty(false);

    // Saving should not reset editor state (cursor pos etc)
    if (view.state.doc.toString() === props.initialValue) return;

    view.setState(
      EditorState.create({
        doc: props.initialValue,
        extensions,
        selection: {
          head: 0,
          anchor: 0,
        },
      })
    );

    const currVimMode = untrack(vimMode);
    if (currVimMode) {
      view.dispatch({
        effects: modeComp.reconfigure(vim()),
      });
    }

    // These 2 lines partially fix auto-scroll to cursor issue (focusing, then switching code, then scrolling down)
    // But causes blurring then scrolling to be weird
    view.contentDOM.focus({ preventScroll: true });
    view.contentDOM.blur();
  });

  const [showCode, setShowCode] = createSignal(false);
  const [showDialog, setShowDialog] = createSignal(false);

  return (
    <>
      <div class="py-2">
        <Switch label="Code editor" value={showCode()} setValue={setShowCode} />
      </div>
      <div>
        <AllowPasteDialog
          open={showDialog()}
          setClosed={() => {
            setShowDialog(false);
          }}
          onAllow={() => {
            allowPaste = true;
            localStorage.setItem(ALLOW_PASTE_KEY, "true");
          }}
        />
        <div class="flex justify-end gap-4 pb-2 h-11">
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
            <label class="flex items-center gap-1 text-sm">
              Update thumbnail
              <input
                class="h-4 w-4"
                type="checkbox"
                checked={updateThumbnail()}
                onChange={(e) => setUpdateThumbnail(e.target.checked)}
              />
            </label>
            <Button
              disabled={!dirty()}
              onMouseDown={() =>
                props.onSave(view.state.doc.toString(), updateThumbnail())
              }
              class="bg-green-700 border rounded-md hover:bg-green-700/90 focus-visible:(outline-none ring-2 ring-fore-base ring-offset-2 ring-offset-back-base) disabled:(bg-transparent text-fore-base pointer-events-none opacity-50) transition-colors px-3 min-w-150px"
            >
              {dirty() ? "Save" : "No changes"}
            </Button>
          </Show>
        </div>
        <div ref={parent!} classList={{ hidden: !showCode() }}></div>
      </div>
    </>
  );
}
