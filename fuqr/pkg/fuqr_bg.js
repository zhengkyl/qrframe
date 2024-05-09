let wasm;
export function __wbg_set_wasm(val) {
    wasm = val;
}


const lTextDecoder = typeof TextDecoder === 'undefined' ? (0, module.require)('util').TextDecoder : TextDecoder;

let cachedTextDecoder = new lTextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const lTextEncoder = typeof TextEncoder === 'undefined' ? (0, module.require)('util').TextEncoder : TextEncoder;

let cachedTextEncoder = new lTextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
/**
* @param {string} text
* @param {SvgOptions} svg_options
* @param {RenderOptions} render_options
* @returns {string}
*/
export function get_svg(text, svg_options, render_options) {
    let deferred4_0;
    let deferred4_1;
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(text, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(svg_options, SvgOptions);
        var ptr1 = svg_options.__destroy_into_raw();
        _assertClass(render_options, RenderOptions);
        var ptr2 = render_options.__destroy_into_raw();
        wasm.get_svg(retptr, ptr0, len0, ptr1, ptr2);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        deferred4_0 = r0;
        deferred4_1 = r1;
        return getStringFromWasm0(r0, r1);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
        wasm.__wbindgen_free(deferred4_0, deferred4_1, 1);
    }
}

/**
*/
export const FinderPattern = Object.freeze({ Square:0,"0":"Square",Circle:1,"1":"Circle",Cross:2,"2":"Cross", });
/**
*/
export const Module = Object.freeze({ DataOFF:0,"0":"DataOFF",DataON:1,"1":"DataON",FinderOFF:2,"2":"FinderOFF",FinderON:3,"3":"FinderON",AlignmentOFF:4,"4":"AlignmentOFF",AlignmentON:5,"5":"AlignmentON",TimingOFF:6,"6":"TimingOFF",TimingON:7,"7":"TimingON",FormatOFF:8,"8":"FormatOFF",FormatON:9,"9":"FormatON",VersionOFF:10,"10":"VersionOFF",VersionON:11,"11":"VersionON",Separator:12,"12":"Separator",Unset:13,"13":"Unset", });
/**
*/
export const Mode = Object.freeze({ Numeric:0,"0":"Numeric",Alphanumeric:1,"1":"Alphanumeric",Byte:2,"2":"Byte", });
/**
*/
export const ECL = Object.freeze({ Low:1,"1":"Low",Medium:0,"0":"Medium",Quartile:3,"3":"Quartile",High:2,"2":"High", });

const MaskFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_mask_free(ptr >>> 0));
/**
*/
export class Mask {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MaskFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_mask_free(ptr);
    }
    /**
    * @returns {number}
    */
    get 0() {
        const ret = wasm.__wbg_get_mask_0(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {number} arg0
    */
    set 0(arg0) {
        wasm.__wbg_set_mask_0(this.__wbg_ptr, arg0);
    }
    /**
    * @param {number} mask
    */
    constructor(mask) {
        const ret = wasm.mask_new(mask);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}

const RenderOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_renderoptions_free(ptr >>> 0));
/**
*/
export class RenderOptions {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(RenderOptions.prototype);
        obj.__wbg_ptr = ptr;
        RenderOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        RenderOptionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_renderoptions_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.renderoptions_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {number} margin
    * @returns {RenderOptions}
    */
    margin(margin) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.renderoptions_margin(ptr, margin);
        return RenderOptions.__wrap(ret);
    }
    /**
    * @param {number} scale
    * @returns {RenderOptions}
    */
    scale(scale) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.renderoptions_scale(ptr, scale);
        return RenderOptions.__wrap(ret);
    }
    /**
    * @param {number} module_size
    * @returns {RenderOptions}
    */
    module_size(module_size) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.renderoptions_module_size(ptr, module_size);
        return RenderOptions.__wrap(ret);
    }
    /**
    * @param {FinderPattern} finder_pattern
    * @returns {RenderOptions}
    */
    finder_pattern(finder_pattern) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.renderoptions_finder_pattern(ptr, finder_pattern);
        return RenderOptions.__wrap(ret);
    }
    /**
    * @param {number} finder_roundness
    * @returns {RenderOptions}
    */
    finder_roundness(finder_roundness) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.renderoptions_finder_roundness(ptr, finder_roundness);
        return RenderOptions.__wrap(ret);
    }
    /**
    * @param {string} foreground
    * @returns {RenderOptions}
    */
    foreground(foreground) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(foreground, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.renderoptions_foreground(ptr, ptr0, len0);
        return RenderOptions.__wrap(ret);
    }
    /**
    * @param {string} background
    * @returns {RenderOptions}
    */
    background(background) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(background, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.renderoptions_background(ptr, ptr0, len0);
        return RenderOptions.__wrap(ret);
    }
    /**
    * @param {Module} module
    * @returns {RenderOptions}
    */
    toggle_render_type(module) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.renderoptions_toggle_render_type(ptr, module);
        return RenderOptions.__wrap(ret);
    }
}

const SvgOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_svgoptions_free(ptr >>> 0));
/**
*/
export class SvgOptions {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SvgOptions.prototype);
        obj.__wbg_ptr = ptr;
        SvgOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SvgOptionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_svgoptions_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.svgoptions_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {Mode} mode
    * @returns {SvgOptions}
    */
    mode(mode) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgoptions_mode(ptr, mode);
        return SvgOptions.__wrap(ret);
    }
    /**
    * @param {Version} version
    * @returns {SvgOptions}
    */
    version(version) {
        const ptr = this.__destroy_into_raw();
        _assertClass(version, Version);
        var ptr0 = version.__destroy_into_raw();
        const ret = wasm.svgoptions_version(ptr, ptr0);
        return SvgOptions.__wrap(ret);
    }
    /**
    * @param {ECL} ecl
    * @returns {SvgOptions}
    */
    ecl(ecl) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgoptions_ecl(ptr, ecl);
        return SvgOptions.__wrap(ret);
    }
    /**
    * @param {Mask} mask
    * @returns {SvgOptions}
    */
    mask(mask) {
        const ptr = this.__destroy_into_raw();
        _assertClass(mask, Mask);
        var ptr0 = mask.__destroy_into_raw();
        const ret = wasm.svgoptions_mask(ptr, ptr0);
        return SvgOptions.__wrap(ret);
    }
}

const VersionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_version_free(ptr >>> 0));
/**
*/
export class Version {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VersionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_version_free(ptr);
    }
    /**
    * @returns {number}
    */
    get 0() {
        const ret = wasm.__wbg_get_version_0(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set 0(arg0) {
        wasm.__wbg_set_version_0(this.__wbg_ptr, arg0);
    }
    /**
    * @param {number} version
    */
    constructor(version) {
        const ret = wasm.version_new(version);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
}

export function __wbindgen_throw(arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
};

