/* tslint:disable */
/* eslint-disable */
/**
* @param {string} input
* @param {QrOptions} qr_options
* @returns {Matrix}
*/
export function get_matrix(input: string, qr_options: QrOptions): Matrix;
/**
* @param {string} input
* @param {QrOptions} qr_options
* @param {SvgOptions} svg_options
* @returns {SvgResult}
*/
export function get_svg(input: string, qr_options: QrOptions, svg_options: SvgOptions): SvgResult;
/**
*/
export enum ECL {
  Low = 0,
  Medium = 1,
  Quartile = 2,
  High = 3,
}
/**
*/
export enum Mask {
  M0 = 0,
  M1 = 1,
  M2 = 2,
  M3 = 3,
  M4 = 4,
  M5 = 5,
  M6 = 6,
  M7 = 7,
}
/**
*/
export enum Mode {
  Numeric = 0,
  Alphanumeric = 1,
  Byte = 2,
}
/**
*/
export enum Toggle {
  Background = 0,
  BackgroundPixels = 1,
  ForegroundPixels = 2,
}
/**
*/
export enum QrError {
  InvalidEncoding = 0,
  ExceedsMaxCapacity = 1,
}
/**
*/
export enum Module {
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
  Unset = 12,
}
/**
*/
export class Margin {
  free(): void;
/**
* @param {number} margin
*/
  constructor(margin: number);
/**
* @param {number} top
* @returns {Margin}
*/
  setTop(top: number): Margin;
/**
* @param {number} right
* @returns {Margin}
*/
  setRight(right: number): Margin;
/**
* @param {number} bottom
* @returns {Margin}
*/
  setBottom(bottom: number): Margin;
/**
* @param {number} left
* @returns {Margin}
*/
  setLeft(left: number): Margin;
/**
* @param {number} y
* @returns {Margin}
*/
  y(y: number): Margin;
/**
* @param {number} x
* @returns {Margin}
*/
  x(x: number): Margin;
/**
*/
  bottom: number;
/**
*/
  left: number;
/**
*/
  right: number;
/**
*/
  top: number;
}
/**
*/
export class Matrix {
  free(): void;
/**
* @returns {number}
*/
  width(): number;
/**
* @returns {number}
*/
  height(): number;
/**
*/
  ecl: ECL;
/**
*/
  margin: Margin;
/**
*/
  mask: Mask;
/**
*/
  mode: Mode;
/**
*/
  value: any[];
/**
*/
  version: Version;
}
/**
*/
export class QrOptions {
  free(): void;
/**
*/
  constructor();
/**
* @param {Version} version
* @returns {QrOptions}
*/
  min_version(version: Version): QrOptions;
/**
* @param {ECL} ecl
* @returns {QrOptions}
*/
  min_ecl(ecl: ECL): QrOptions;
/**
* @param {Mode | undefined} [mode]
* @returns {QrOptions}
*/
  mode(mode?: Mode): QrOptions;
/**
* @param {Mask | undefined} [mask]
* @returns {QrOptions}
*/
  mask(mask?: Mask): QrOptions;
/**
* @param {Margin} margin
* @returns {QrOptions}
*/
  margin(margin: Margin): QrOptions;
}
/**
*/
export class SvgOptions {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} unit
* @returns {SvgOptions}
*/
  unit(unit: number): SvgOptions;
/**
* @param {string} foreground
* @returns {SvgOptions}
*/
  foreground(foreground: string): SvgOptions;
/**
* @param {string} background
* @returns {SvgOptions}
*/
  background(background: string): SvgOptions;
/**
* @param {Uint8Array | undefined} [scale_x_matrix]
* @returns {SvgOptions}
*/
  scale_x_matrix(scale_x_matrix?: Uint8Array): SvgOptions;
/**
* @param {Uint8Array | undefined} [scale_y_matrix]
* @returns {SvgOptions}
*/
  scale_y_matrix(scale_y_matrix?: Uint8Array): SvgOptions;
/**
* @param {Uint8Array | undefined} [scale_matrix]
* @returns {SvgOptions}
*/
  scale_matrix(scale_matrix?: Uint8Array): SvgOptions;
/**
* @param {Toggle} toggle
* @returns {SvgOptions}
*/
  toggle(toggle: Toggle): SvgOptions;
}
/**
*/
export class SvgResult {
  free(): void;
/**
*/
  ecl: ECL;
/**
*/
  mask: Mask;
/**
*/
  mode: Mode;
/**
*/
  svg: string;
/**
*/
  version: Version;
}
/**
*/
export class Version {
  free(): void;
/**
* @param {number} version
*/
  constructor(version: number);
/**
*/
  0: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_margin_free: (a: number) => void;
  readonly __wbg_get_margin_top: (a: number) => number;
  readonly __wbg_set_margin_top: (a: number, b: number) => void;
  readonly __wbg_get_margin_right: (a: number) => number;
  readonly __wbg_set_margin_right: (a: number, b: number) => void;
  readonly __wbg_get_margin_bottom: (a: number) => number;
  readonly __wbg_set_margin_bottom: (a: number, b: number) => void;
  readonly __wbg_get_margin_left: (a: number) => number;
  readonly __wbg_set_margin_left: (a: number, b: number) => void;
  readonly margin_new: (a: number) => number;
  readonly margin_setTop: (a: number, b: number) => number;
  readonly margin_setRight: (a: number, b: number) => number;
  readonly margin_setBottom: (a: number, b: number) => number;
  readonly margin_setLeft: (a: number, b: number) => number;
  readonly margin_y: (a: number, b: number) => number;
  readonly margin_x: (a: number, b: number) => number;
  readonly __wbg_matrix_free: (a: number) => void;
  readonly __wbg_get_matrix_value: (a: number, b: number) => void;
  readonly __wbg_set_matrix_value: (a: number, b: number, c: number) => void;
  readonly __wbg_get_matrix_margin: (a: number) => number;
  readonly __wbg_set_matrix_margin: (a: number, b: number) => void;
  readonly __wbg_get_matrix_mode: (a: number) => number;
  readonly __wbg_set_matrix_mode: (a: number, b: number) => void;
  readonly __wbg_get_matrix_version: (a: number) => number;
  readonly __wbg_set_matrix_version: (a: number, b: number) => void;
  readonly __wbg_get_matrix_ecl: (a: number) => number;
  readonly __wbg_set_matrix_ecl: (a: number, b: number) => void;
  readonly __wbg_get_matrix_mask: (a: number) => number;
  readonly __wbg_set_matrix_mask: (a: number, b: number) => void;
  readonly matrix_width: (a: number) => number;
  readonly matrix_height: (a: number) => number;
  readonly __wbg_version_free: (a: number) => void;
  readonly __wbg_get_version_0: (a: number) => number;
  readonly __wbg_set_version_0: (a: number, b: number) => void;
  readonly version_new: (a: number) => number;
  readonly __wbg_qroptions_free: (a: number) => void;
  readonly qroptions_new: () => number;
  readonly qroptions_min_version: (a: number, b: number) => number;
  readonly qroptions_min_ecl: (a: number, b: number) => number;
  readonly qroptions_mode: (a: number, b: number) => number;
  readonly qroptions_mask: (a: number, b: number) => number;
  readonly qroptions_margin: (a: number, b: number) => number;
  readonly __wbg_svgoptions_free: (a: number) => void;
  readonly svgoptions_new: () => number;
  readonly svgoptions_unit: (a: number, b: number) => number;
  readonly svgoptions_foreground: (a: number, b: number, c: number) => number;
  readonly svgoptions_background: (a: number, b: number, c: number) => number;
  readonly svgoptions_scale_x_matrix: (a: number, b: number, c: number) => number;
  readonly svgoptions_scale_y_matrix: (a: number, b: number, c: number) => number;
  readonly svgoptions_scale_matrix: (a: number, b: number, c: number) => number;
  readonly svgoptions_toggle: (a: number, b: number) => number;
  readonly __wbg_svgresult_free: (a: number) => void;
  readonly __wbg_get_svgresult_svg: (a: number, b: number) => void;
  readonly __wbg_set_svgresult_svg: (a: number, b: number, c: number) => void;
  readonly __wbg_get_svgresult_mode: (a: number) => number;
  readonly __wbg_set_svgresult_mode: (a: number, b: number) => void;
  readonly __wbg_get_svgresult_ecl: (a: number) => number;
  readonly __wbg_set_svgresult_ecl: (a: number, b: number) => void;
  readonly __wbg_get_svgresult_version: (a: number) => number;
  readonly __wbg_set_svgresult_version: (a: number, b: number) => void;
  readonly __wbg_get_svgresult_mask: (a: number) => number;
  readonly __wbg_set_svgresult_mask: (a: number, b: number) => void;
  readonly get_matrix: (a: number, b: number, c: number, d: number) => void;
  readonly get_svg: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
