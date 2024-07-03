import { createEffect, onCleanup, onMount } from "solid-js";

import { indentWithTab, history } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { Compartment, EditorState, Transaction } from "@codemirror/state";
import { EditorView, keymap, type ViewUpdate } from "@codemirror/view";
import { vim } from "@replit/codemirror-vim";
import { basicSetup } from "codemirror";
import { syntaxHighlighting } from "@codemirror/language";
import {
  oneDarkTheme,
  oneDarkHighlightStyle,
} from "@codemirror/theme-one-dark";
import { debounce } from "~/lib/util";

type Props = {
  editorView: (e: EditorView) => void,
  onSave: (s: string) => void;
  onDirty: (d: boolean) => void;
  initialValue: string;
  vimMode: boolean;
};

export function CodeInput(props: Props) {
  let view: EditorView;
  let modeComp = new Compartment();
  // let undoComp = new Compartment();

  let dirty = false;

  onMount(() => {
    view = new EditorView({
      extensions: [
        modeComp.of(props.vimMode ? vim() : []),
        basicSetup,
        // undoComp.of(history()),
        keymap.of([
          indentWithTab,
          {
            key: "Mod-s",
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
            if (newDirty !== dirty) {
              dirty = newDirty;
              props.onDirty(newDirty);
            }
          }, 300)
        ),
      ],
      parent: ref,
    });
    props.editorView(view)
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

  createEffect((prev) => {
    if (props.vimMode === prev) return;
    view.dispatch({
      effects: modeComp.reconfigure(props.vimMode ? vim() : []),
    });
  }, props.vimMode);

  // is view.destroy() needed?
  // page is just being closed

  let ref: HTMLDivElement;
  return <div ref={ref!}></div>;
}
