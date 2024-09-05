# qrframe

framework for making qr codes

Blatantly inspired by [QRBTF](https://qrbtf.com) and [Anthony Fu's QR Toolkit](https://qrcode.antfu.me).

## Examples

I'm working on more examples.

<table>
  <tbody>
    <tr>
      <th colspan="3">Creative possibilities</th>
    </tr>
    <tr>
      <td>
        <img src="./examples/quantum.svg" width="300"/>
      </td>
      <td>
        <img src="./examples/mondrian.svg" width="300"/>
      </td>
      <td>
        <img src="./examples/glass.svg" width="300"/>
      </td>
    </tr>
    <tr>
      <td>
        <img src="./examples/tile.png"/>
      </td>
      <td>
        <img src="./examples/dots.svg" width="300"/>
      </td>
      <td>
        <img src="./examples/camo.svg" width="300"/>
      </td>
    </tr>
    <tr>
      <td>
        <img src="./examples/neon.svg" width="300"/>
      </td>
    </tr>
    <tr>
      <th colspan="3">Import external libs, fetch external files, etc </th>
    </tr>
    <td>
      <img src="./examples/drawing1.png"/>
    </td>
    <td>
      <img src="./examples/drawing2.png"/>
    </td>
      <td>
        <img src="./examples/halftone.png" width="300"/>
      </td>
    <tr>
      <th colspan="3">Styles copied from <a href="https://qrbtf.com">QRBTF</a></th>
    </tr>
    <tr>
      <td>
        <img src="./examples/blocks.svg" width="300"/>
      </td>
      <td>
        <img src="./examples/bubbles.svg" width="300"/>
      </td>
      <td>
        <img src="./examples/alien.svg" width="300"/>
      </td>
    <tr>
      <th colspan="3">Boring options are available</th>
    </tr>
    <tr>
      <td>
        <img src="./examples/boring1.png"/>
      </td>
      <td>
        <img src="./examples/boring2.png"/>
      </td>
      <td>
        <img src="./examples/boring3.png"/>
      </td>
    </tr>

  </tbody>
</table>

## Features

- Customize data:

  - encoding mode, version, error tolerance, mask pattern
  - powered by [`fuqr`](https://github.com/zhengkyl/fuqr), my own Rust library imported as WASM. (i use windows, btw)

- Customize appearance:
  - Choose any preset, customize or even create a new one from scratch via code editor.
  - Define arbitrary UI parameters in code
  - Supports SVG and PNG
  - All code runs _directly_ in browser in a web worker with no restrictions.
    - There is no sandbox, whitelist, blacklist, or anything besides a 5s timeout to stop infinite loops.
    - Generated SVGs are not sanitized. This is an impossible task and attempting it breaks perfectly fine SVGs, makes debugging harder, and adds latency to previewing changes.
    - These should be non-issues, but even if you copy-and-paste and run malware there's no secrets to leak.

### Use existing presets

![style select ui](./examples/ui1.png)

### Customizable parameters defined in code

![code and parameter editor ui](./examples/ui2.png)

## Creating a preset

A preset must export `paramsSchema` and either `renderSVG` or `renderCanvas`

## `paramsSchema`

This schema defines the UI components whose values are passed into `renderSVG` or `renderCanvas` via the `params` object.

All properties besides `type` are optional, except
- type `select` must have a nonempty options array
- type `array` must have a valid `props` value.

In this example, `default` is set explicitly to the implicit default value.
```js
export const paramsSchema = {
  Example1: {
    type: "number"
    min: 0,
    max: 10,
    step: 0.1,
    default: 0,
  },
  Example2: {
    type: "boolean",
    default: false,
  },
  Example3: {
    type: "color",
    default: "#000000"
  },
  Example4: {
    type: "select",
    options: ["I'm feeling", 22]
    default: "I'm feeling",
  },
  Example5: {
    type: "file",
    accept: ".jpeg, .jpg, .png"
    default: null,
  },
  Example6: {
    type: "array",
    props: {
      type: "number" // any type except "array"
      // corresponding props
    },
    resizable: true,
    defaultLength: 5, // overridden by default
    default: [], // overrides defaultLength
  }
}
```

## `renderSVG` and `renderCanvas`

```ts
type renderSVG = (qr: Qr, params: Params) => string;

type renderCanvas = (qr: Qr, params: Params, canvas: OffscreenCanvas) => void;
```

`params` is an object with all the keys of `paramsSchema` paired with the value from their respective input component.

`qr` contains the final QR code in `matrix`. This represents a square where one side is `version * 4 + 17` wide, and modules (aka pixels) are stored from the left to right, top to bottom.

```ts
type Qr = {
  matrix: Module[] // see below
  version: number; // 1- 40
  mask: number; // 0 - 8,
  ecl: number; // 0 - 3, Low, Medium, Quartile, High
  mode: number; // 0 - 2, Numeric, Alphanumeric, Byte
};

enum Module {
  DataOFF = 0,
  DataON = 1,
  FinderOFF = 2,
  FinderON = 3,
  AlignmentOFF = 4,
  AlignmentON = 5,
  TimingOFF = 6,
  TimingON = 7,
  FormatOFF = 8,
  FormatON = 9,
  VersionOFF = 10,
  VersionON = 11,
  SeparatorOFF = 12,
}
```

