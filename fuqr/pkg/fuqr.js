let wasm;

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

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

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

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

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}
/**
* @param {string} input
* @param {QrOptions} qr_options
* @param {SvgBuilder} render_options
* @returns {SvgResult}
*/
export function get_svg(input, qr_options, render_options) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(qr_options, QrOptions);
        var ptr1 = qr_options.__destroy_into_raw();
        _assertClass(render_options, SvgBuilder);
        var ptr2 = render_options.__destroy_into_raw();
        wasm.get_svg(retptr, ptr0, len0, ptr1, ptr2);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return SvgResult.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
*/
export const FinderPattern = Object.freeze({ Square:0,"0":"Square",Cross:1,"1":"Cross", });
/**
*/
export const Module = Object.freeze({ DataOFF:0,"0":"DataOFF",DataON:1,"1":"DataON",FinderOFF:2,"2":"FinderOFF",FinderON:3,"3":"FinderON",AlignmentOFF:4,"4":"AlignmentOFF",AlignmentON:5,"5":"AlignmentON",TimingOFF:6,"6":"TimingOFF",TimingON:7,"7":"TimingON",FormatOFF:8,"8":"FormatOFF",FormatON:9,"9":"FormatON",VersionOFF:10,"10":"VersionOFF",VersionON:11,"11":"VersionON",Separator:12,"12":"Separator",Unset:13,"13":"Unset", });
/**
*/
export const ECL = Object.freeze({ Low:0,"0":"Low",Medium:1,"1":"Medium",Quartile:2,"2":"Quartile",High:3,"3":"High", });
/**
*/
export const Toggle = Object.freeze({ Background:0,"0":"Background",Invert:1,"1":"Invert",FinderForeground:2,"2":"FinderForeground",FinderBackground:3,"3":"FinderBackground", });
/**
*/
export const Mode = Object.freeze({ Numeric:0,"0":"Numeric",Alphanumeric:1,"1":"Alphanumeric",Byte:2,"2":"Byte", });
/**
*/
export const Mask = Object.freeze({ M0:0,"0":"M0",M1:1,"1":"M1",M2:2,"2":"M2",M3:3,"3":"M3",M4:4,"4":"M4",M5:5,"5":"M5",M6:6,"6":"M6",M7:7,"7":"M7", });
/**
*/
export const SvgError = Object.freeze({ InvalidEncoding:0,"0":"InvalidEncoding",ExceedsMaxCapacity:1,"1":"ExceedsMaxCapacity", });

const QrOptionsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_qroptions_free(ptr >>> 0));
/**
*/
export class QrOptions {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(QrOptions.prototype);
        obj.__wbg_ptr = ptr;
        QrOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        QrOptionsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_qroptions_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.qroptions_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {Version} version
    * @returns {QrOptions}
    */
    min_version(version) {
        const ptr = this.__destroy_into_raw();
        _assertClass(version, Version);
        var ptr0 = version.__destroy_into_raw();
        const ret = wasm.qroptions_min_version(ptr, ptr0);
        return QrOptions.__wrap(ret);
    }
    /**
    * @param {ECL} ecl
    * @returns {QrOptions}
    */
    min_ecl(ecl) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.qroptions_min_ecl(ptr, ecl);
        return QrOptions.__wrap(ret);
    }
    /**
    * @param {Mode | undefined} [mode]
    * @returns {QrOptions}
    */
    mode(mode) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.qroptions_mode(ptr, isLikeNone(mode) ? 3 : mode);
        return QrOptions.__wrap(ret);
    }
    /**
    * @param {Mask | undefined} [mask]
    * @returns {QrOptions}
    */
    mask(mask) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.qroptions_mask(ptr, isLikeNone(mask) ? 8 : mask);
        return QrOptions.__wrap(ret);
    }
}

const SvgBuilderFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_svgbuilder_free(ptr >>> 0));
/**
*/
export class SvgBuilder {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SvgBuilder.prototype);
        obj.__wbg_ptr = ptr;
        SvgBuilderFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SvgBuilderFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_svgbuilder_free(ptr);
    }
    /**
    */
    constructor() {
        const ret = wasm.svgbuilder_new();
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {number} margin
    * @returns {SvgBuilder}
    */
    margin(margin) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_margin(ptr, margin);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {number} unit
    * @returns {SvgBuilder}
    */
    unit(unit) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_unit(ptr, unit);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {number} module_size
    * @returns {SvgBuilder}
    */
    fg_module_size(module_size) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_fg_module_size(ptr, module_size);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {number} module_size
    * @returns {SvgBuilder}
    */
    bg_module_size(module_size) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_bg_module_size(ptr, module_size);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {FinderPattern} finder_pattern
    * @returns {SvgBuilder}
    */
    finder_pattern(finder_pattern) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_finder_pattern(ptr, finder_pattern);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {number} finder_roundness
    * @returns {SvgBuilder}
    */
    finder_roundness(finder_roundness) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_finder_roundness(ptr, finder_roundness);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {string} foreground
    * @returns {SvgBuilder}
    */
    foreground(foreground) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(foreground, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.svgbuilder_foreground(ptr, ptr0, len0);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {string} background
    * @returns {SvgBuilder}
    */
    background(background) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(background, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.svgbuilder_background(ptr, ptr0, len0);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {Module} module
    * @returns {SvgBuilder}
    */
    toggle_render(module) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_toggle_render(ptr, module);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {Module} module
    * @returns {SvgBuilder}
    */
    toggle_scale(module) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_toggle_scale(ptr, module);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {Module} module
    * @returns {boolean}
    */
    render(module) {
        const ret = wasm.svgbuilder_render(this.__wbg_ptr, module);
        return ret !== 0;
    }
    /**
    * @param {Module} module
    * @returns {boolean}
    */
    scale(module) {
        const ret = wasm.svgbuilder_scale(this.__wbg_ptr, module);
        return ret !== 0;
    }
    /**
    * @param {Toggle} toggle
    * @returns {SvgBuilder}
    */
    toggle(toggle) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgbuilder_toggle(ptr, toggle);
        return SvgBuilder.__wrap(ret);
    }
    /**
    * @param {Toggle} option
    * @returns {boolean}
    */
    get(option) {
        const ret = wasm.svgbuilder_get(this.__wbg_ptr, option);
        return ret !== 0;
    }
}

const SvgResultFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_svgresult_free(ptr >>> 0));
/**
*/
export class SvgResult {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(SvgResult.prototype);
        obj.__wbg_ptr = ptr;
        SvgResultFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SvgResultFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_svgresult_free(ptr);
    }
    /**
    * @returns {string}
    */
    get svg() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_svgresult_svg(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
    * @param {string} arg0
    */
    set svg(arg0) {
        const ptr0 = passStringToWasm0(arg0, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_svgresult_svg(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {Mode}
    */
    get mode() {
        const ret = wasm.__wbg_get_svgresult_mode(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Mode} arg0
    */
    set mode(arg0) {
        wasm.__wbg_set_svgresult_mode(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {ECL}
    */
    get ecl() {
        const ret = wasm.__wbg_get_svgresult_ecl(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {ECL} arg0
    */
    set ecl(arg0) {
        wasm.__wbg_set_svgresult_ecl(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Version}
    */
    get version() {
        const ret = wasm.__wbg_get_svgresult_version(this.__wbg_ptr);
        return Version.__wrap(ret);
    }
    /**
    * @param {Version} arg0
    */
    set version(arg0) {
        _assertClass(arg0, Version);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_svgresult_version(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Mask}
    */
    get mask() {
        const ret = wasm.__wbg_get_svgresult_mask(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Mask} arg0
    */
    set mask(arg0) {
        wasm.__wbg_set_svgresult_mask(this.__wbg_ptr, arg0);
    }
}

const VersionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_version_free(ptr >>> 0));
/**
*/
export class Version {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Version.prototype);
        obj.__wbg_ptr = ptr;
        VersionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

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

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbg_new_abda76e883ba8a5f = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_658279fe44541cf6 = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_error_f851667af71bcfc6 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedInt32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('fuqr_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
