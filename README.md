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
  - No safeguards whatsoever. All code runs directly in browser. This is a hammer, not a toy for babies 🤡.

## Use existing presets

![style select ui](./examples/ui1.png)

## Customizable parameters defined in code

![code and parameter editor ui](./examples/ui2.png)

## Examples

I'm working on more examples.

<table>
  <thead>
    <tr>
      <th colspan="3">Basic styles</th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td>
      <img src="./examples/circle.png"/>
    </td>
    <td>
      <img src="./examples/camo.png"/>
    </td>
    <td>
      <img src="./examples/halftone.png" width="290" style="image-rendering:pixelated"/>
    </td>
  </tr>
  </tbody>
</table>

<table>
  <thead>
    <tr>
      <th colspan="3">Implementing styles from <a href="https://qrbtf.com" target="_blank">QRBTF</a></th>
    </tr>
  </thead>
  <tbody>
  <tr>
    <td>
      <img src="./examples/blocks.svg" width="100%"/>
    </td>
    <td>
      <img src="./examples/bubbles.svg" width="100%"/>
    </td>
    <td>
      <img src="./examples/alien.svg" width="100%"/>
    </td>
  </tr>
  </tbody>
</table>
