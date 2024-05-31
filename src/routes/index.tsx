import { For, Show, batch, createSignal, type JSX } from "solid-js";
import { clientOnly } from "@solidjs/start";
import init from "fuqr";

import { ButtonGroup, ButtonGroupItem } from "~/components/ButtonGroup";
import { ModeTextInput } from "~/components/ModeTextInput";
import { NumberInput } from "~/components/NumberInput";
import { ColorInput } from "~/components/ColorInput";
import { FlatButton, ToggleButton } from "~/components/Button";
import { createStore } from "solid-js/store";
import { Switch } from "~/components/Switch";
import { ImageInput } from "~/components/ImageInput";
import {
  type ModeName,
  type ECLName,
  type MaskName,
  ECL_LABELS,
  MASK_KEY,
  MODE_VALUE,
  ECL_VALUE,
  MASK_VALUE,
  ECL_NAMES,
} from "~/lib/options";
import { Editor } from "~/components/Editor";

const QRCode = clientOnly(async () => {
  await init();
  return import("../components/qr/SvgPreview");
});

const MODULE_NAMES = [
  "Data",
  "Finder",
  "Alignment",
  "Timing",
  "Format",
  "Version",
] as const;

export default function Home() {
  return (
    <main class="max-w-screen-lg mx-auto">
      <div class="flex gap-4 flex-wrap">
        <Editor />
        <div class="flex-1 min-w-200px sticky top-0 self-start p-4">
          <QRCode />
        </div>
      </div>
    </main>
  );
}
