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

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachedFloat64Memory0 = null;

function getFloat64Memory0() {
    if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
        cachedFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachedFloat64Memory0;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

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

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

let WASM_VECTOR_LEN = 0;

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

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
/**
* @param {string} input
* @param {QrOptions} qr_options
* @returns {Matrix}
*/
export function get_matrix(input, qr_options) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passStringToWasm0(input, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(qr_options, QrOptions);
        var ptr1 = qr_options.__destroy_into_raw();
        wasm.get_matrix(retptr, ptr0, len0, ptr1);
        var r0 = getInt32Memory0()[retptr / 4 + 0];
        var r1 = getInt32Memory0()[retptr / 4 + 1];
        var r2 = getInt32Memory0()[retptr / 4 + 2];
        if (r2) {
            throw takeObject(r1);
        }
        return Matrix.__wrap(r0);
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
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
export const Mask = Object.freeze({ M0:0,"0":"M0",M1:1,"1":"M1",M2:2,"2":"M2",M3:3,"3":"M3",M4:4,"4":"M4",M5:5,"5":"M5",M6:6,"6":"M6",M7:7,"7":"M7", });
/**
*/
export const Mode = Object.freeze({ Numeric:0,"0":"Numeric",Alphanumeric:1,"1":"Alphanumeric",Byte:2,"2":"Byte", });
/**
*/
export const Toggle = Object.freeze({ Background:0,"0":"Background",BackgroundPixels:1,"1":"BackgroundPixels",ForegroundPixels:2,"2":"ForegroundPixels", });
/**
*/
export const QrError = Object.freeze({ InvalidEncoding:0,"0":"InvalidEncoding",ExceedsMaxCapacity:1,"1":"ExceedsMaxCapacity", });
/**
*/
export const Module = Object.freeze({ DataOFF:0,"0":"DataOFF",DataON:1,"1":"DataON",FinderOFF:2,"2":"FinderOFF",FinderON:3,"3":"FinderON",AlignmentOFF:4,"4":"AlignmentOFF",AlignmentON:5,"5":"AlignmentON",TimingOFF:6,"6":"TimingOFF",TimingON:7,"7":"TimingON",FormatOFF:8,"8":"FormatOFF",FormatON:9,"9":"FormatON",VersionOFF:10,"10":"VersionOFF",VersionON:11,"11":"VersionON",Unset:12,"12":"Unset", });

const MarginFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_margin_free(ptr >>> 0));
/**
*/
export class Margin {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Margin.prototype);
        obj.__wbg_ptr = ptr;
        MarginFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MarginFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_margin_free(ptr);
    }
    /**
    * @returns {number}
    */
    get top() {
        const ret = wasm.__wbg_get_margin_top(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set top(arg0) {
        wasm.__wbg_set_margin_top(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get right() {
        const ret = wasm.__wbg_get_margin_right(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set right(arg0) {
        wasm.__wbg_set_margin_right(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get bottom() {
        const ret = wasm.__wbg_get_margin_bottom(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set bottom(arg0) {
        wasm.__wbg_set_margin_bottom(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get left() {
        const ret = wasm.__wbg_get_margin_left(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set left(arg0) {
        wasm.__wbg_set_margin_left(this.__wbg_ptr, arg0);
    }
    /**
    * @param {number} margin
    */
    constructor(margin) {
        const ret = wasm.margin_new(margin);
        this.__wbg_ptr = ret >>> 0;
        return this;
    }
    /**
    * @param {number} top
    * @returns {Margin}
    */
    setTop(top) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.margin_setTop(ptr, top);
        return Margin.__wrap(ret);
    }
    /**
    * @param {number} right
    * @returns {Margin}
    */
    setRight(right) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.margin_setRight(ptr, right);
        return Margin.__wrap(ret);
    }
    /**
    * @param {number} bottom
    * @returns {Margin}
    */
    setBottom(bottom) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.margin_setBottom(ptr, bottom);
        return Margin.__wrap(ret);
    }
    /**
    * @param {number} left
    * @returns {Margin}
    */
    setLeft(left) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.margin_setLeft(ptr, left);
        return Margin.__wrap(ret);
    }
    /**
    * @param {number} y
    * @returns {Margin}
    */
    y(y) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.margin_y(ptr, y);
        return Margin.__wrap(ret);
    }
    /**
    * @param {number} x
    * @returns {Margin}
    */
    x(x) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.margin_x(ptr, x);
        return Margin.__wrap(ret);
    }
}

const MatrixFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_matrix_free(ptr >>> 0));
/**
*/
export class Matrix {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Matrix.prototype);
        obj.__wbg_ptr = ptr;
        MatrixFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        MatrixFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_matrix_free(ptr);
    }
    /**
    * @returns {any[]}
    */
    get value() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.__wbg_get_matrix_value(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @param {any[]} arg0
    */
    set value(arg0) {
        const ptr0 = passArrayJsValueToWasm0(arg0, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.__wbg_set_matrix_value(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @returns {Margin}
    */
    get margin() {
        const ret = wasm.__wbg_get_matrix_margin(this.__wbg_ptr);
        return Margin.__wrap(ret);
    }
    /**
    * @param {Margin} arg0
    */
    set margin(arg0) {
        _assertClass(arg0, Margin);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_matrix_margin(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Mode}
    */
    get mode() {
        const ret = wasm.__wbg_get_matrix_mode(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Mode} arg0
    */
    set mode(arg0) {
        wasm.__wbg_set_matrix_mode(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Version}
    */
    get version() {
        const ret = wasm.__wbg_get_matrix_version(this.__wbg_ptr);
        return Version.__wrap(ret);
    }
    /**
    * @param {Version} arg0
    */
    set version(arg0) {
        _assertClass(arg0, Version);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_matrix_version(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {ECL}
    */
    get ecl() {
        const ret = wasm.__wbg_get_matrix_ecl(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {ECL} arg0
    */
    set ecl(arg0) {
        wasm.__wbg_set_matrix_ecl(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {Mask}
    */
    get mask() {
        const ret = wasm.__wbg_get_matrix_mask(this.__wbg_ptr);
        return ret;
    }
    /**
    * @param {Mask} arg0
    */
    set mask(arg0) {
        wasm.__wbg_set_matrix_mask(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    width() {
        const ret = wasm.matrix_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @returns {number}
    */
    height() {
        const ret = wasm.matrix_height(this.__wbg_ptr);
        return ret >>> 0;
    }
}

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
    /**
    * @param {Margin} margin
    * @returns {QrOptions}
    */
    margin(margin) {
        const ptr = this.__destroy_into_raw();
        _assertClass(margin, Margin);
        var ptr0 = margin.__destroy_into_raw();
        const ret = wasm.qroptions_margin(ptr, ptr0);
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
    * @param {number} unit
    * @returns {SvgOptions}
    */
    unit(unit) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.svgoptions_unit(ptr, unit);
        return SvgOptions.__wrap(ret);
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
    * @param {Uint8Array | undefined} [scale_x_matrix]
    * @returns {SvgOptions}
    */
    scale_x_matrix(scale_x_matrix) {
        const ptr = this.__destroy_into_raw();
        var ptr0 = isLikeNone(scale_x_matrix) ? 0 : passArray8ToWasm0(scale_x_matrix, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.svgoptions_scale_x_matrix(ptr, ptr0, len0);
        return SvgOptions.__wrap(ret);
    }
    /**
    * @param {Uint8Array | undefined} [scale_y_matrix]
    * @returns {SvgOptions}
    */
    scale_y_matrix(scale_y_matrix) {
        const ptr = this.__destroy_into_raw();
        var ptr0 = isLikeNone(scale_y_matrix) ? 0 : passArray8ToWasm0(scale_y_matrix, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
        const ret = wasm.svgoptions_scale_y_matrix(ptr, ptr0, len0);
        return SvgOptions.__wrap(ret);
    }
    /**
    * @param {Uint8Array | undefined} [scale_matrix]
    * @returns {SvgOptions}
    */
    scale_matrix(scale_matrix) {
        const ptr = this.__destroy_into_raw();
        var ptr0 = isLikeNone(scale_matrix) ? 0 : passArray8ToWasm0(scale_matrix, wasm.__wbindgen_malloc);
        var len0 = WASM_VECTOR_LEN;
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
    imports.wbg.__wbindgen_try_into_number = function(arg0) {
        let result;
    try { result = +getObject(arg0) } catch (e) { result = e }
    const ret = result;
    return addHeapObject(ret);
};
imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
    const obj = getObject(arg1);
    const ret = typeof(obj) === 'number' ? obj : undefined;
    getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
    getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
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
    cachedFloat64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
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
