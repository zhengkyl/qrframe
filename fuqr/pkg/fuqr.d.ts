/* tslint:disable */
/* eslint-disable */
/**
* @param {string} text
* @param {QrOptions} svg_options
* @param {SvgOptions} render_options
* @returns {string}
*/
export function get_svg(text: string, svg_options: QrOptions, render_options: SvgOptions): string;
/**
*/
export enum Toggle {
  Background = 0,
  Invert = 1,
  FinderForeground = 2,
  FinderBackground = 3,
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
  Separator = 12,
  Unset = 13,
}
/**
*/
export enum FinderPattern {
  Square = 0,
  Cross = 1,
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
export class QrOptions {
  free(): void;
/**
*/
  constructor();
/**
* @param {Mode} mode
* @returns {QrOptions}
*/
  mode(mode: Mode): QrOptions;
/**
* @param {Version} version
* @returns {QrOptions}
*/
  version(version: Version): QrOptions;
/**
* @param {ECL} ecl
* @returns {QrOptions}
*/
  ecl(ecl: ECL): QrOptions;
/**
* @param {Mask} mask
* @returns {QrOptions}
*/
  mask(mask: Mask): QrOptions;
}
/**
*/
export class SvgOptions {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} margin
* @returns {SvgOptions}
*/
  margin(margin: number): SvgOptions;
/**
* @param {number} unit
* @returns {SvgOptions}
*/
  unit(unit: number): SvgOptions;
/**
* @param {number} module_size
* @returns {SvgOptions}
*/
  fg_module_size(module_size: number): SvgOptions;
/**
* @param {number} module_size
* @returns {SvgOptions}
*/
  bg_module_size(module_size: number): SvgOptions;
/**
* @param {FinderPattern} finder_pattern
* @returns {SvgOptions}
*/
  finder_pattern(finder_pattern: FinderPattern): SvgOptions;
/**
* @param {number} finder_roundness
* @returns {SvgOptions}
*/
  finder_roundness(finder_roundness: number): SvgOptions;
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
* @param {Module} module
* @returns {SvgOptions}
*/
  toggle_render(module: Module): SvgOptions;
/**
* @param {Module} module
* @returns {SvgOptions}
*/
  toggle_scale(module: Module): SvgOptions;
/**
* @param {Module} module
* @returns {boolean}
*/
  render(module: Module): boolean;
/**
* @param {Module} module
* @returns {boolean}
*/
  scale(module: Module): boolean;
/**
* @param {Toggle} toggle
* @returns {SvgOptions}
*/
  toggle(toggle: Toggle): SvgOptions;
/**
* @param {Toggle} option
* @returns {boolean}
*/
  get(option: Toggle): boolean;
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
  readonly __wbg_svgoptions_free: (a: number) => void;
  readonly svgoptions_new: () => number;
  readonly svgoptions_margin: (a: number, b: number) => number;
  readonly svgoptions_unit: (a: number, b: number) => number;
  readonly svgoptions_fg_module_size: (a: number, b: number) => number;
  readonly svgoptions_bg_module_size: (a: number, b: number) => number;
  readonly svgoptions_finder_pattern: (a: number, b: number) => number;
  readonly svgoptions_finder_roundness: (a: number, b: number) => number;
  readonly svgoptions_foreground: (a: number, b: number, c: number) => number;
  readonly svgoptions_background: (a: number, b: number, c: number) => number;
  readonly svgoptions_toggle_render: (a: number, b: number) => number;
  readonly svgoptions_toggle_scale: (a: number, b: number) => number;
  readonly svgoptions_render: (a: number, b: number) => number;
  readonly svgoptions_scale: (a: number, b: number) => number;
  readonly svgoptions_toggle: (a: number, b: number) => number;
  readonly svgoptions_get: (a: number, b: number) => number;
  readonly __wbg_version_free: (a: number) => void;
  readonly __wbg_get_version_0: (a: number) => number;
  readonly __wbg_set_version_0: (a: number, b: number) => void;
  readonly version_new: (a: number) => number;
  readonly __wbg_qroptions_free: (a: number) => void;
  readonly qroptions_new: () => number;
  readonly qroptions_mode: (a: number, b: number) => number;
  readonly qroptions_version: (a: number, b: number) => number;
  readonly qroptions_ecl: (a: number, b: number) => number;
  readonly qroptions_mask: (a: number, b: number) => number;
  readonly get_svg: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
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
