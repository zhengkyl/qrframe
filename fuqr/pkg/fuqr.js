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

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
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

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8Memory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
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
* @param {SvgOptions} svg_options
* @returns {SvgResult}
*/
export function get_svg(input, qr_options, svg_options) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(qr_options, QrOptions);
        var ptr1 = qr_options.__destroy_into_raw();
        _assertClass(svg_options, SvgOptions);
        var ptr2 = svg_options.__destroy_into_raw();
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
export const ECL = Object.freeze({ Low:0,"0":"Low",Medium:1,"1":"Medium",Quartile:2,"2":"Quartile",High:3,"3":"High", });
/**
*/
export const Module = Object.freeze({ DataOFF:0,"0":"DataOFF",DataON:1,"1":"DataON",FinderOFF:2,"2":"FinderOFF",FinderON:3,"3":"FinderON",AlignmentOFF:4,"4":"AlignmentOFF",AlignmentON:5,"5":"AlignmentON",TimingOFF:6,"6":"TimingOFF",TimingON:7,"7":"TimingON",FormatOFF:8,"8":"FormatOFF",FormatON:9,"9":"FormatON",VersionOFF:10,"10":"VersionOFF",VersionON:11,"11":"VersionON",Unset:12,"12":"Unset", });
/**
*/
export const Mask = Object.freeze({ M0:0,"0":"M0",M1:1,"1":"M1",M2:2,"2":"M2",M3:3,"3":"M3",M4:4,"4":"M4",M5:5,"5":"M5",M6:6,"6":"M6",M7:7,"7":"M7", });
/**
*/
export const Toggle = Object.freeze({ Background:0,"0":"Background",FinderForeground:1,"1":"FinderForeground",FinderBackground:2,"2":"FinderBackground",OtherForeground:3,"3":"OtherForeground",OtherBackground:4,"4":"OtherBackground", });
/**
*/
export const SvgError = Object.freeze({ InvalidEncoding:0,"0":"InvalidEncoding",ExceedsMaxCapacity:1,"1":"ExceedsMaxCapacity", });
/**
*/
export const Mode = Object.freeze({ Numeric:0,"0":"Numeric",Alphanumeric:1,"1":"Alphanumeric",Byte:2,"2":"Byte", });

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
    * @param {string} foreground
    * @returns {SvgOptions}
    */
    foreground(foreground) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(foreground, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.svgoptions_foreground(ptr, ptr0, len0);
        return SvgOptions.__wrap(ret);
    }
    /**
    * @param {string} background
    * @returns {SvgOptions}
    */
    background(background) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passStringToWasm0(background, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.svgoptions_background(ptr, ptr0, len0);
        return SvgOptions.__wrap(ret);
    }
    /**
    * @param {Uint8Array} scale_matrix
    * @returns {SvgOptions}
    */
    scale_matrix(scale_matrix) {
        const ptr = this.__destroy_into_raw();
        const ptr0 = passArray8ToWasm0(scale_matrix, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.svgoptions_scale_matrix(ptr, ptr0, len0);
        return SvgOptions.__wrap(ret);
    }
    /**
    * @param {Toggle} toggle
    * @returns {SvgOptions}
    */
    toggle(toggle) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgoptions_toggle(ptr, toggle);
        return SvgOptions.__wrap(ret);
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
