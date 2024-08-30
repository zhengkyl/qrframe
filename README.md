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
    <td>
      <img src="./examples/tile.png"/>
    </td>
    <td>
      <img src="./examples/dots.svg" width="300"/>
    </td>
    <tr>
    </tr>
    <tr>
      <th colspan="3">Extending with noise</th>
    </tr>
    <tr>
      <td>
        <img src="./examples/circle.svg" width="300"/>
      </td>
      <td>
        <img src="./examples/camo.svg" width="300"/>
      </td>
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
    </tr>

  </tbody>
</table>

## Features

- Customize data:

  - encoding mode, version, error tolerance, mask pattern
  - powered by [`fuqr`](https://github.com/zhengkyl/fuqr), my own Rust library imported as WASM. (i use windows, btw)

- Customize appearance:
  - Choose any preset, customize or even create a new one from scratch via code editor.
  - Define arbitrary ui parameters in code
  - Supports SVG (string) and PNG (canvas)
  - All code runs _directly_ in browser in a web worker with no restrictions.

## Use existing presets

![style select ui](./examples/ui1.png)

## Customizable parameters defined in code

![code and parameter editor ui](./examples/ui2.png)
