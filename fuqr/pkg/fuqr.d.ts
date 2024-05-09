/* tslint:disable */
/* eslint-disable */
/**
* @param {string} text
* @param {SvgOptions} svg_options
* @param {RenderOptions} render_options
* @returns {string}
*/
export function get_svg(text: string, svg_options: SvgOptions, render_options: RenderOptions): string;
/**
*/
export enum FinderPattern {
  Square = 0,
  Circle = 1,
  Cross = 2,
}
/**
*/
export enum ECL {
  Low = 1,
  Medium = 0,
  Quartile = 3,
  High = 2,
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
export enum Mode {
  Numeric = 0,
  Alphanumeric = 1,
  Byte = 2,
}
/**
*/
export class Mask {
  free(): void;
/**
* @param {number} mask
*/
  constructor(mask: number);
/**
*/
  0: number;
}
/**
*/
export class RenderOptions {
  free(): void;
/**
*/
  constructor();
/**
* @param {number} margin
* @returns {RenderOptions}
*/
  margin(margin: number): RenderOptions;
/**
* @param {number} scale
* @returns {RenderOptions}
*/
  scale(scale: number): RenderOptions;
/**
* @param {number} module_size
* @returns {RenderOptions}
*/
  module_size(module_size: number): RenderOptions;
/**
* @param {FinderPattern} finder_pattern
* @returns {RenderOptions}
*/
  finder_pattern(finder_pattern: FinderPattern): RenderOptions;
/**
* @param {number} finder_roundness
* @returns {RenderOptions}
*/
  finder_roundness(finder_roundness: number): RenderOptions;
/**
* @param {string} foreground
* @returns {RenderOptions}
*/
  foreground(foreground: string): RenderOptions;
/**
* @param {string} background
* @returns {RenderOptions}
*/
  background(background: string): RenderOptions;
/**
* @param {Module} module
* @returns {RenderOptions}
*/
  toggle_render_type(module: Module): RenderOptions;
}
/**
*/
export class SvgOptions {
  free(): void;
/**
*/
  constructor();
/**
* @param {Mode} mode
* @returns {SvgOptions}
*/
  mode(mode: Mode): SvgOptions;
/**
* @param {Version} version
* @returns {SvgOptions}
*/
  version(version: Version): SvgOptions;
/**
* @param {ECL} ecl
* @returns {SvgOptions}
*/
  ecl(ecl: ECL): SvgOptions;
/**
* @param {Mask} mask
* @returns {SvgOptions}
*/
  mask(mask: Mask): SvgOptions;
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
  readonly __wbg_renderoptions_free: (a: number) => void;
  readonly renderoptions_new: () => number;
  readonly renderoptions_margin: (a: number, b: number) => number;
  readonly renderoptions_scale: (a: number, b: number) => number;
  readonly renderoptions_module_size: (a: number, b: number) => number;
  readonly renderoptions_finder_pattern: (a: number, b: number) => number;
  readonly renderoptions_finder_roundness: (a: number, b: number) => number;
  readonly renderoptions_foreground: (a: number, b: number, c: number) => number;
  readonly renderoptions_background: (a: number, b: number, c: number) => number;
  readonly renderoptions_toggle_render_type: (a: number, b: number) => number;
  readonly __wbg_get_version_0: (a: number) => number;
  readonly __wbg_set_version_0: (a: number, b: number) => void;
  readonly version_new: (a: number) => number;
  readonly __wbg_mask_free: (a: number) => void;
  readonly __wbg_get_mask_0: (a: number) => number;
  readonly __wbg_set_mask_0: (a: number, b: number) => void;
  readonly mask_new: (a: number) => number;
  readonly __wbg_version_free: (a: number) => void;
  readonly __wbg_svgoptions_free: (a: number) => void;
  readonly svgoptions_new: () => number;
  readonly svgoptions_mode: (a: number, b: number) => number;
  readonly svgoptions_version: (a: number, b: number) => number;
  readonly svgoptions_ecl: (a: number, b: number) => number;
  readonly svgoptions_mask: (a: number, b: number) => number;
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
