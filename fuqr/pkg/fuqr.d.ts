/* tslint:disable */
/* eslint-disable */
/**
* @param {string} input
* @param {QrOptions} qr_options
* @param {SvgBuilder} render_options
* @returns {SvgResult}
*/
export function get_svg(input: string, qr_options: QrOptions, render_options: SvgBuilder): SvgResult;
/**
*/
export enum FinderPattern {
  Square = 0,
  Cross = 1,
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
export enum ECL {
  Low = 0,
  Medium = 1,
  Quartile = 2,
  High = 3,
}
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
export enum Mode {
  Numeric = 0,
  Alphanumeric = 1,
  Byte = 2,
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
export enum SvgError {
  InvalidEncoding = 0,
  ExceedsMaxCapacity = 1,
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
}
/**
*/
export class SvgBuilder {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} margin
* @returns {SvgBuilder}
*/
  margin(margin: number): SvgBuilder;
/**
* @param {number} unit
* @returns {SvgBuilder}
*/
  unit(unit: number): SvgBuilder;
/**
* @param {number} module_size
* @returns {SvgBuilder}
*/
  fg_module_size(module_size: number): SvgBuilder;
/**
* @param {number} module_size
* @returns {SvgBuilder}
*/
  bg_module_size(module_size: number): SvgBuilder;
/**
* @param {FinderPattern} finder_pattern
* @returns {SvgBuilder}
*/
  finder_pattern(finder_pattern: FinderPattern): SvgBuilder;
/**
* @param {number} finder_roundness
* @returns {SvgBuilder}
*/
  finder_roundness(finder_roundness: number): SvgBuilder;
/**
* @param {string} foreground
* @returns {SvgBuilder}
*/
  foreground(foreground: string): SvgBuilder;
/**
* @param {string} background
* @returns {SvgBuilder}
*/
  background(background: string): SvgBuilder;
/**
* @param {Module} module
* @returns {SvgBuilder}
*/
  toggle_render(module: Module): SvgBuilder;
/**
* @param {Module} module
* @returns {SvgBuilder}
*/
  toggle_scale(module: Module): SvgBuilder;
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
* @returns {SvgBuilder}
*/
  toggle(toggle: Toggle): SvgBuilder;
/**
* @param {Toggle} option
* @returns {boolean}
*/
  get(option: Toggle): boolean;
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
  readonly __wbg_svgbuilder_free: (a: number) => void;
  readonly svgbuilder_new: () => number;
  readonly svgbuilder_margin: (a: number, b: number) => number;
  readonly svgbuilder_unit: (a: number, b: number) => number;
  readonly svgbuilder_fg_module_size: (a: number, b: number) => number;
  readonly svgbuilder_bg_module_size: (a: number, b: number) => number;
  readonly svgbuilder_finder_pattern: (a: number, b: number) => number;
  readonly svgbuilder_finder_roundness: (a: number, b: number) => number;
  readonly svgbuilder_foreground: (a: number, b: number, c: number) => number;
  readonly svgbuilder_background: (a: number, b: number, c: number) => number;
  readonly svgbuilder_toggle_render: (a: number, b: number) => number;
  readonly svgbuilder_toggle_scale: (a: number, b: number) => number;
  readonly svgbuilder_render: (a: number, b: number) => number;
  readonly svgbuilder_scale: (a: number, b: number) => number;
  readonly svgbuilder_toggle: (a: number, b: number) => number;
  readonly svgbuilder_get: (a: number, b: number) => number;
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
