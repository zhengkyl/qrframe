# qrframe

framework for making qr codes

Blatantly inspired by [QRBTF](https://qrbtf.com) and [Anthony Fu's QR Toolkit](https://qrcode.antfu.me).

## Features

- Customize data:
  - encoding mode, version, error tolerance, mask pattern
  - powered by [`fuqr`](https://github.com/zhengkyl/fuqr), my own Rust library imported as WASM. (i use windows, btw)

- Customize appearance:
  - Choose any preset, customize or even create a new one from scratch via code editor.
  - Define arbitrary ui parameters in code
  - Supports SVG and PNG (canvas)
  - All code runs *directly* in browser. There are no safeguards except that which browser vendors have bestowed upon us.

## Use existing presets

![style select ui](./examples/ui1.png)

## Customizable parameters defined in code

![code and parameter editor ui](./examples/ui2.png)

## Examples

I'm working on more examples.

<table>
  <thead>
    <tr>
      <th colspan="3">Extending with noise</th>
    </tr>
  </thead>
  <tbody>
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
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="3">Styles from <a href="https://qrbtf.com">QRBTF</a></th>
    </tr>
  </thead>
  <tbody>
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
