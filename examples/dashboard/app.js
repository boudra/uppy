(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Adapted from https://github.com/Flet/prettier-bytes/
// Changing 1000 bytes to 1024, so we can keep uppercase KB vs kB
// ISC License (c) Dan Flettre https://github.com/Flet/prettier-bytes/blob/master/LICENSE
module.exports = function prettierBytes (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num)
  }

  var neg = num < 0
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  if (neg) {
    num = -num
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1)
  num = Number(num / Math.pow(1024, exponent))
  var unit = units[exponent]

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit
  }
}

},{}],2:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],3:[function(require,module,exports){
(function (Buffer){(function (){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this)}).call(this,require("buffer").Buffer)

},{"base64-js":2,"buffer":3,"ieee754":7}],4:[function(require,module,exports){
/*!
  Copyright (c) 2018 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {
	'use strict';

	var hasOwn = {}.hasOwnProperty;

	function classNames() {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg)) {
				if (arg.length) {
					var inner = classNames.apply(null, arg);
					if (inner) {
						classes.push(inner);
					}
				}
			} else if (argType === 'object') {
				if (arg.toString === Object.prototype.toString) {
					for (var key in arg) {
						if (hasOwn.call(arg, key) && arg[key]) {
							classes.push(key);
						}
					}
				} else {
					classes.push(arg.toString());
				}
			}
		}

		return classes.join(' ');
	}

	if (typeof module !== 'undefined' && module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
		// register as 'classnames', consistent with npm package name
		define('classnames', [], function () {
			return classNames;
		});
	} else {
		window.classNames = classNames;
	}
}());

},{}],5:[function(require,module,exports){
/*!
 * Cropper.js v1.5.7
 * https://fengyuanchen.github.io/cropperjs
 *
 * Copyright 2015-present Chen Fengyuan
 * Released under the MIT license
 *
 * Date: 2020-05-23T05:23:00.081Z
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Cropper = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';
  var WINDOW = IS_BROWSER ? window : {};
  var IS_TOUCH_DEVICE = IS_BROWSER && WINDOW.document.documentElement ? 'ontouchstart' in WINDOW.document.documentElement : false;
  var HAS_POINTER_EVENT = IS_BROWSER ? 'PointerEvent' in WINDOW : false;
  var NAMESPACE = 'cropper'; // Actions

  var ACTION_ALL = 'all';
  var ACTION_CROP = 'crop';
  var ACTION_MOVE = 'move';
  var ACTION_ZOOM = 'zoom';
  var ACTION_EAST = 'e';
  var ACTION_WEST = 'w';
  var ACTION_SOUTH = 's';
  var ACTION_NORTH = 'n';
  var ACTION_NORTH_EAST = 'ne';
  var ACTION_NORTH_WEST = 'nw';
  var ACTION_SOUTH_EAST = 'se';
  var ACTION_SOUTH_WEST = 'sw'; // Classes

  var CLASS_CROP = "".concat(NAMESPACE, "-crop");
  var CLASS_DISABLED = "".concat(NAMESPACE, "-disabled");
  var CLASS_HIDDEN = "".concat(NAMESPACE, "-hidden");
  var CLASS_HIDE = "".concat(NAMESPACE, "-hide");
  var CLASS_INVISIBLE = "".concat(NAMESPACE, "-invisible");
  var CLASS_MODAL = "".concat(NAMESPACE, "-modal");
  var CLASS_MOVE = "".concat(NAMESPACE, "-move"); // Data keys

  var DATA_ACTION = "".concat(NAMESPACE, "Action");
  var DATA_PREVIEW = "".concat(NAMESPACE, "Preview"); // Drag modes

  var DRAG_MODE_CROP = 'crop';
  var DRAG_MODE_MOVE = 'move';
  var DRAG_MODE_NONE = 'none'; // Events

  var EVENT_CROP = 'crop';
  var EVENT_CROP_END = 'cropend';
  var EVENT_CROP_MOVE = 'cropmove';
  var EVENT_CROP_START = 'cropstart';
  var EVENT_DBLCLICK = 'dblclick';
  var EVENT_TOUCH_START = IS_TOUCH_DEVICE ? 'touchstart' : 'mousedown';
  var EVENT_TOUCH_MOVE = IS_TOUCH_DEVICE ? 'touchmove' : 'mousemove';
  var EVENT_TOUCH_END = IS_TOUCH_DEVICE ? 'touchend touchcancel' : 'mouseup';
  var EVENT_POINTER_DOWN = HAS_POINTER_EVENT ? 'pointerdown' : EVENT_TOUCH_START;
  var EVENT_POINTER_MOVE = HAS_POINTER_EVENT ? 'pointermove' : EVENT_TOUCH_MOVE;
  var EVENT_POINTER_UP = HAS_POINTER_EVENT ? 'pointerup pointercancel' : EVENT_TOUCH_END;
  var EVENT_READY = 'ready';
  var EVENT_RESIZE = 'resize';
  var EVENT_WHEEL = 'wheel';
  var EVENT_ZOOM = 'zoom'; // Mime types

  var MIME_TYPE_JPEG = 'image/jpeg'; // RegExps

  var REGEXP_ACTIONS = /^e|w|s|n|se|sw|ne|nw|all|crop|move|zoom$/;
  var REGEXP_DATA_URL = /^data:/;
  var REGEXP_DATA_URL_JPEG = /^data:image\/jpeg;base64,/;
  var REGEXP_TAG_NAME = /^img|canvas$/i; // Misc

  var DEFAULTS = {
    // Define the view mode of the cropper
    viewMode: 0,
    // 0, 1, 2, 3
    // Define the dragging mode of the cropper
    dragMode: DRAG_MODE_CROP,
    // 'crop', 'move' or 'none'
    // Define the initial aspect ratio of the crop box
    initialAspectRatio: NaN,
    // Define the aspect ratio of the crop box
    aspectRatio: NaN,
    // An object with the previous cropping result data
    data: null,
    // A selector for adding extra containers to preview
    preview: '',
    // Re-render the cropper when resize the window
    responsive: true,
    // Restore the cropped area after resize the window
    restore: true,
    // Check if the current image is a cross-origin image
    checkCrossOrigin: true,
    // Check the current image's Exif Orientation information
    checkOrientation: true,
    // Show the black modal
    modal: true,
    // Show the dashed lines for guiding
    guides: true,
    // Show the center indicator for guiding
    center: true,
    // Show the white modal to highlight the crop box
    highlight: true,
    // Show the grid background
    background: true,
    // Enable to crop the image automatically when initialize
    autoCrop: true,
    // Define the percentage of automatic cropping area when initializes
    autoCropArea: 0.8,
    // Enable to move the image
    movable: true,
    // Enable to rotate the image
    rotatable: true,
    // Enable to scale the image
    scalable: true,
    // Enable to zoom the image
    zoomable: true,
    // Enable to zoom the image by dragging touch
    zoomOnTouch: true,
    // Enable to zoom the image by wheeling mouse
    zoomOnWheel: true,
    // Define zoom ratio when zoom the image by wheeling mouse
    wheelZoomRatio: 0.1,
    // Enable to move the crop box
    cropBoxMovable: true,
    // Enable to resize the crop box
    cropBoxResizable: true,
    // Toggle drag mode between "crop" and "move" when click twice on the cropper
    toggleDragModeOnDblclick: true,
    // Size limitation
    minCanvasWidth: 0,
    minCanvasHeight: 0,
    minCropBoxWidth: 0,
    minCropBoxHeight: 0,
    minContainerWidth: 200,
    minContainerHeight: 100,
    // Shortcuts of events
    ready: null,
    cropstart: null,
    cropmove: null,
    cropend: null,
    crop: null,
    zoom: null
  };

  var TEMPLATE = '<div class="cropper-container" touch-action="none">' + '<div class="cropper-wrap-box">' + '<div class="cropper-canvas"></div>' + '</div>' + '<div class="cropper-drag-box"></div>' + '<div class="cropper-crop-box">' + '<span class="cropper-view-box"></span>' + '<span class="cropper-dashed dashed-h"></span>' + '<span class="cropper-dashed dashed-v"></span>' + '<span class="cropper-center"></span>' + '<span class="cropper-face"></span>' + '<span class="cropper-line line-e" data-cropper-action="e"></span>' + '<span class="cropper-line line-n" data-cropper-action="n"></span>' + '<span class="cropper-line line-w" data-cropper-action="w"></span>' + '<span class="cropper-line line-s" data-cropper-action="s"></span>' + '<span class="cropper-point point-e" data-cropper-action="e"></span>' + '<span class="cropper-point point-n" data-cropper-action="n"></span>' + '<span class="cropper-point point-w" data-cropper-action="w"></span>' + '<span class="cropper-point point-s" data-cropper-action="s"></span>' + '<span class="cropper-point point-ne" data-cropper-action="ne"></span>' + '<span class="cropper-point point-nw" data-cropper-action="nw"></span>' + '<span class="cropper-point point-sw" data-cropper-action="sw"></span>' + '<span class="cropper-point point-se" data-cropper-action="se"></span>' + '</div>' + '</div>';

  /**
   * Check if the given value is not a number.
   */

  var isNaN = Number.isNaN || WINDOW.isNaN;
  /**
   * Check if the given value is a number.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a number, else `false`.
   */

  function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
  }
  /**
   * Check if the given value is a positive number.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a positive number, else `false`.
   */

  var isPositiveNumber = function isPositiveNumber(value) {
    return value > 0 && value < Infinity;
  };
  /**
   * Check if the given value is undefined.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is undefined, else `false`.
   */

  function isUndefined(value) {
    return typeof value === 'undefined';
  }
  /**
   * Check if the given value is an object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is an object, else `false`.
   */

  function isObject(value) {
    return _typeof(value) === 'object' && value !== null;
  }
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  /**
   * Check if the given value is a plain object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
   */

  function isPlainObject(value) {
    if (!isObject(value)) {
      return false;
    }

    try {
      var _constructor = value.constructor;
      var prototype = _constructor.prototype;
      return _constructor && prototype && hasOwnProperty.call(prototype, 'isPrototypeOf');
    } catch (error) {
      return false;
    }
  }
  /**
   * Check if the given value is a function.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a function, else `false`.
   */

  function isFunction(value) {
    return typeof value === 'function';
  }
  var slice = Array.prototype.slice;
  /**
   * Convert array-like or iterable object to an array.
   * @param {*} value - The value to convert.
   * @returns {Array} Returns a new array.
   */

  function toArray(value) {
    return Array.from ? Array.from(value) : slice.call(value);
  }
  /**
   * Iterate the given data.
   * @param {*} data - The data to iterate.
   * @param {Function} callback - The process function for each element.
   * @returns {*} The original data.
   */

  function forEach(data, callback) {
    if (data && isFunction(callback)) {
      if (Array.isArray(data) || isNumber(data.length)
      /* array-like */
      ) {
          toArray(data).forEach(function (value, key) {
            callback.call(data, value, key, data);
          });
        } else if (isObject(data)) {
        Object.keys(data).forEach(function (key) {
          callback.call(data, data[key], key, data);
        });
      }
    }

    return data;
  }
  /**
   * Extend the given object.
   * @param {*} target - The target object to extend.
   * @param {*} args - The rest objects for merging to the target object.
   * @returns {Object} The extended object.
   */

  var assign = Object.assign || function assign(target) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (isObject(target) && args.length > 0) {
      args.forEach(function (arg) {
        if (isObject(arg)) {
          Object.keys(arg).forEach(function (key) {
            target[key] = arg[key];
          });
        }
      });
    }

    return target;
  };
  var REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/;
  /**
   * Normalize decimal number.
   * Check out {@link https://0.30000000000000004.com/}
   * @param {number} value - The value to normalize.
   * @param {number} [times=100000000000] - The times for normalizing.
   * @returns {number} Returns the normalized number.
   */

  function normalizeDecimalNumber(value) {
    var times = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100000000000;
    return REGEXP_DECIMALS.test(value) ? Math.round(value * times) / times : value;
  }
  var REGEXP_SUFFIX = /^width|height|left|top|marginLeft|marginTop$/;
  /**
   * Apply styles to the given element.
   * @param {Element} element - The target element.
   * @param {Object} styles - The styles for applying.
   */

  function setStyle(element, styles) {
    var style = element.style;
    forEach(styles, function (value, property) {
      if (REGEXP_SUFFIX.test(property) && isNumber(value)) {
        value = "".concat(value, "px");
      }

      style[property] = value;
    });
  }
  /**
   * Check if the given element has a special class.
   * @param {Element} element - The element to check.
   * @param {string} value - The class to search.
   * @returns {boolean} Returns `true` if the special class was found.
   */

  function hasClass(element, value) {
    return element.classList ? element.classList.contains(value) : element.className.indexOf(value) > -1;
  }
  /**
   * Add classes to the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be added.
   */

  function addClass(element, value) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        addClass(elem, value);
      });
      return;
    }

    if (element.classList) {
      element.classList.add(value);
      return;
    }

    var className = element.className.trim();

    if (!className) {
      element.className = value;
    } else if (className.indexOf(value) < 0) {
      element.className = "".concat(className, " ").concat(value);
    }
  }
  /**
   * Remove classes from the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be removed.
   */

  function removeClass(element, value) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        removeClass(elem, value);
      });
      return;
    }

    if (element.classList) {
      element.classList.remove(value);
      return;
    }

    if (element.className.indexOf(value) >= 0) {
      element.className = element.className.replace(value, '');
    }
  }
  /**
   * Add or remove classes from the given element.
   * @param {Element} element - The target element.
   * @param {string} value - The classes to be toggled.
   * @param {boolean} added - Add only.
   */

  function toggleClass(element, value, added) {
    if (!value) {
      return;
    }

    if (isNumber(element.length)) {
      forEach(element, function (elem) {
        toggleClass(elem, value, added);
      });
      return;
    } // IE10-11 doesn't support the second parameter of `classList.toggle`


    if (added) {
      addClass(element, value);
    } else {
      removeClass(element, value);
    }
  }
  var REGEXP_CAMEL_CASE = /([a-z\d])([A-Z])/g;
  /**
   * Transform the given string from camelCase to kebab-case
   * @param {string} value - The value to transform.
   * @returns {string} The transformed value.
   */

  function toParamCase(value) {
    return value.replace(REGEXP_CAMEL_CASE, '$1-$2').toLowerCase();
  }
  /**
   * Get data from the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to get.
   * @returns {string} The data value.
   */

  function getData(element, name) {
    if (isObject(element[name])) {
      return element[name];
    }

    if (element.dataset) {
      return element.dataset[name];
    }

    return element.getAttribute("data-".concat(toParamCase(name)));
  }
  /**
   * Set data to the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to set.
   * @param {string} data - The data value.
   */

  function setData(element, name, data) {
    if (isObject(data)) {
      element[name] = data;
    } else if (element.dataset) {
      element.dataset[name] = data;
    } else {
      element.setAttribute("data-".concat(toParamCase(name)), data);
    }
  }
  /**
   * Remove data from the given element.
   * @param {Element} element - The target element.
   * @param {string} name - The data key to remove.
   */

  function removeData(element, name) {
    if (isObject(element[name])) {
      try {
        delete element[name];
      } catch (error) {
        element[name] = undefined;
      }
    } else if (element.dataset) {
      // #128 Safari not allows to delete dataset property
      try {
        delete element.dataset[name];
      } catch (error) {
        element.dataset[name] = undefined;
      }
    } else {
      element.removeAttribute("data-".concat(toParamCase(name)));
    }
  }
  var REGEXP_SPACES = /\s\s*/;

  var onceSupported = function () {
    var supported = false;

    if (IS_BROWSER) {
      var once = false;

      var listener = function listener() {};

      var options = Object.defineProperty({}, 'once', {
        get: function get() {
          supported = true;
          return once;
        },

        /**
         * This setter can fix a `TypeError` in strict mode
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Getter_only}
         * @param {boolean} value - The value to set
         */
        set: function set(value) {
          once = value;
        }
      });
      WINDOW.addEventListener('test', listener, options);
      WINDOW.removeEventListener('test', listener, options);
    }

    return supported;
  }();
  /**
   * Remove event listener from the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */


  function removeListener(element, type, listener) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var handler = listener;
    type.trim().split(REGEXP_SPACES).forEach(function (event) {
      if (!onceSupported) {
        var listeners = element.listeners;

        if (listeners && listeners[event] && listeners[event][listener]) {
          handler = listeners[event][listener];
          delete listeners[event][listener];

          if (Object.keys(listeners[event]).length === 0) {
            delete listeners[event];
          }

          if (Object.keys(listeners).length === 0) {
            delete element.listeners;
          }
        }
      }

      element.removeEventListener(event, handler, options);
    });
  }
  /**
   * Add event listener to the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */

  function addListener(element, type, listener) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var _handler = listener;
    type.trim().split(REGEXP_SPACES).forEach(function (event) {
      if (options.once && !onceSupported) {
        var _element$listeners = element.listeners,
            listeners = _element$listeners === void 0 ? {} : _element$listeners;

        _handler = function handler() {
          delete listeners[event][listener];
          element.removeEventListener(event, _handler, options);

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          listener.apply(element, args);
        };

        if (!listeners[event]) {
          listeners[event] = {};
        }

        if (listeners[event][listener]) {
          element.removeEventListener(event, listeners[event][listener], options);
        }

        listeners[event][listener] = _handler;
        element.listeners = listeners;
      }

      element.addEventListener(event, _handler, options);
    });
  }
  /**
   * Dispatch event on the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Object} data - The additional event data.
   * @returns {boolean} Indicate if the event is default prevented or not.
   */

  function dispatchEvent(element, type, data) {
    var event; // Event and CustomEvent on IE9-11 are global objects, not constructors

    if (isFunction(Event) && isFunction(CustomEvent)) {
      event = new CustomEvent(type, {
        detail: data,
        bubbles: true,
        cancelable: true
      });
    } else {
      event = document.createEvent('CustomEvent');
      event.initCustomEvent(type, true, true, data);
    }

    return element.dispatchEvent(event);
  }
  /**
   * Get the offset base on the document.
   * @param {Element} element - The target element.
   * @returns {Object} The offset data.
   */

  function getOffset(element) {
    var box = element.getBoundingClientRect();
    return {
      left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
      top: box.top + (window.pageYOffset - document.documentElement.clientTop)
    };
  }
  var location = WINDOW.location;
  var REGEXP_ORIGINS = /^(\w+:)\/\/([^:/?#]*):?(\d*)/i;
  /**
   * Check if the given URL is a cross origin URL.
   * @param {string} url - The target URL.
   * @returns {boolean} Returns `true` if the given URL is a cross origin URL, else `false`.
   */

  function isCrossOriginURL(url) {
    var parts = url.match(REGEXP_ORIGINS);
    return parts !== null && (parts[1] !== location.protocol || parts[2] !== location.hostname || parts[3] !== location.port);
  }
  /**
   * Add timestamp to the given URL.
   * @param {string} url - The target URL.
   * @returns {string} The result URL.
   */

  function addTimestamp(url) {
    var timestamp = "timestamp=".concat(new Date().getTime());
    return url + (url.indexOf('?') === -1 ? '?' : '&') + timestamp;
  }
  /**
   * Get transforms base on the given object.
   * @param {Object} obj - The target object.
   * @returns {string} A string contains transform values.
   */

  function getTransforms(_ref) {
    var rotate = _ref.rotate,
        scaleX = _ref.scaleX,
        scaleY = _ref.scaleY,
        translateX = _ref.translateX,
        translateY = _ref.translateY;
    var values = [];

    if (isNumber(translateX) && translateX !== 0) {
      values.push("translateX(".concat(translateX, "px)"));
    }

    if (isNumber(translateY) && translateY !== 0) {
      values.push("translateY(".concat(translateY, "px)"));
    } // Rotate should come first before scale to match orientation transform


    if (isNumber(rotate) && rotate !== 0) {
      values.push("rotate(".concat(rotate, "deg)"));
    }

    if (isNumber(scaleX) && scaleX !== 1) {
      values.push("scaleX(".concat(scaleX, ")"));
    }

    if (isNumber(scaleY) && scaleY !== 1) {
      values.push("scaleY(".concat(scaleY, ")"));
    }

    var transform = values.length ? values.join(' ') : 'none';
    return {
      WebkitTransform: transform,
      msTransform: transform,
      transform: transform
    };
  }
  /**
   * Get the max ratio of a group of pointers.
   * @param {string} pointers - The target pointers.
   * @returns {number} The result ratio.
   */

  function getMaxZoomRatio(pointers) {
    var pointers2 = _objectSpread2({}, pointers);

    var ratios = [];
    forEach(pointers, function (pointer, pointerId) {
      delete pointers2[pointerId];
      forEach(pointers2, function (pointer2) {
        var x1 = Math.abs(pointer.startX - pointer2.startX);
        var y1 = Math.abs(pointer.startY - pointer2.startY);
        var x2 = Math.abs(pointer.endX - pointer2.endX);
        var y2 = Math.abs(pointer.endY - pointer2.endY);
        var z1 = Math.sqrt(x1 * x1 + y1 * y1);
        var z2 = Math.sqrt(x2 * x2 + y2 * y2);
        var ratio = (z2 - z1) / z1;
        ratios.push(ratio);
      });
    });
    ratios.sort(function (a, b) {
      return Math.abs(a) < Math.abs(b);
    });
    return ratios[0];
  }
  /**
   * Get a pointer from an event object.
   * @param {Object} event - The target event object.
   * @param {boolean} endOnly - Indicates if only returns the end point coordinate or not.
   * @returns {Object} The result pointer contains start and/or end point coordinates.
   */

  function getPointer(_ref2, endOnly) {
    var pageX = _ref2.pageX,
        pageY = _ref2.pageY;
    var end = {
      endX: pageX,
      endY: pageY
    };
    return endOnly ? end : _objectSpread2({
      startX: pageX,
      startY: pageY
    }, end);
  }
  /**
   * Get the center point coordinate of a group of pointers.
   * @param {Object} pointers - The target pointers.
   * @returns {Object} The center point coordinate.
   */

  function getPointersCenter(pointers) {
    var pageX = 0;
    var pageY = 0;
    var count = 0;
    forEach(pointers, function (_ref3) {
      var startX = _ref3.startX,
          startY = _ref3.startY;
      pageX += startX;
      pageY += startY;
      count += 1;
    });
    pageX /= count;
    pageY /= count;
    return {
      pageX: pageX,
      pageY: pageY
    };
  }
  /**
   * Get the max sizes in a rectangle under the given aspect ratio.
   * @param {Object} data - The original sizes.
   * @param {string} [type='contain'] - The adjust type.
   * @returns {Object} The result sizes.
   */

  function getAdjustedSizes(_ref4) // or 'cover'
  {
    var aspectRatio = _ref4.aspectRatio,
        height = _ref4.height,
        width = _ref4.width;
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'contain';
    var isValidWidth = isPositiveNumber(width);
    var isValidHeight = isPositiveNumber(height);

    if (isValidWidth && isValidHeight) {
      var adjustedWidth = height * aspectRatio;

      if (type === 'contain' && adjustedWidth > width || type === 'cover' && adjustedWidth < width) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }
    } else if (isValidWidth) {
      height = width / aspectRatio;
    } else if (isValidHeight) {
      width = height * aspectRatio;
    }

    return {
      width: width,
      height: height
    };
  }
  /**
   * Get the new sizes of a rectangle after rotated.
   * @param {Object} data - The original sizes.
   * @returns {Object} The result sizes.
   */

  function getRotatedSizes(_ref5) {
    var width = _ref5.width,
        height = _ref5.height,
        degree = _ref5.degree;
    degree = Math.abs(degree) % 180;

    if (degree === 90) {
      return {
        width: height,
        height: width
      };
    }

    var arc = degree % 90 * Math.PI / 180;
    var sinArc = Math.sin(arc);
    var cosArc = Math.cos(arc);
    var newWidth = width * cosArc + height * sinArc;
    var newHeight = width * sinArc + height * cosArc;
    return degree > 90 ? {
      width: newHeight,
      height: newWidth
    } : {
      width: newWidth,
      height: newHeight
    };
  }
  /**
   * Get a canvas which drew the given image.
   * @param {HTMLImageElement} image - The image for drawing.
   * @param {Object} imageData - The image data.
   * @param {Object} canvasData - The canvas data.
   * @param {Object} options - The options.
   * @returns {HTMLCanvasElement} The result canvas.
   */

  function getSourceCanvas(image, _ref6, _ref7, _ref8) {
    var imageAspectRatio = _ref6.aspectRatio,
        imageNaturalWidth = _ref6.naturalWidth,
        imageNaturalHeight = _ref6.naturalHeight,
        _ref6$rotate = _ref6.rotate,
        rotate = _ref6$rotate === void 0 ? 0 : _ref6$rotate,
        _ref6$scaleX = _ref6.scaleX,
        scaleX = _ref6$scaleX === void 0 ? 1 : _ref6$scaleX,
        _ref6$scaleY = _ref6.scaleY,
        scaleY = _ref6$scaleY === void 0 ? 1 : _ref6$scaleY;
    var aspectRatio = _ref7.aspectRatio,
        naturalWidth = _ref7.naturalWidth,
        naturalHeight = _ref7.naturalHeight;
    var _ref8$fillColor = _ref8.fillColor,
        fillColor = _ref8$fillColor === void 0 ? 'transparent' : _ref8$fillColor,
        _ref8$imageSmoothingE = _ref8.imageSmoothingEnabled,
        imageSmoothingEnabled = _ref8$imageSmoothingE === void 0 ? true : _ref8$imageSmoothingE,
        _ref8$imageSmoothingQ = _ref8.imageSmoothingQuality,
        imageSmoothingQuality = _ref8$imageSmoothingQ === void 0 ? 'low' : _ref8$imageSmoothingQ,
        _ref8$maxWidth = _ref8.maxWidth,
        maxWidth = _ref8$maxWidth === void 0 ? Infinity : _ref8$maxWidth,
        _ref8$maxHeight = _ref8.maxHeight,
        maxHeight = _ref8$maxHeight === void 0 ? Infinity : _ref8$maxHeight,
        _ref8$minWidth = _ref8.minWidth,
        minWidth = _ref8$minWidth === void 0 ? 0 : _ref8$minWidth,
        _ref8$minHeight = _ref8.minHeight,
        minHeight = _ref8$minHeight === void 0 ? 0 : _ref8$minHeight;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var maxSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: maxWidth,
      height: maxHeight
    });
    var minSizes = getAdjustedSizes({
      aspectRatio: aspectRatio,
      width: minWidth,
      height: minHeight
    }, 'cover');
    var width = Math.min(maxSizes.width, Math.max(minSizes.width, naturalWidth));
    var height = Math.min(maxSizes.height, Math.max(minSizes.height, naturalHeight)); // Note: should always use image's natural sizes for drawing as
    // imageData.naturalWidth === canvasData.naturalHeight when rotate % 180 === 90

    var destMaxSizes = getAdjustedSizes({
      aspectRatio: imageAspectRatio,
      width: maxWidth,
      height: maxHeight
    });
    var destMinSizes = getAdjustedSizes({
      aspectRatio: imageAspectRatio,
      width: minWidth,
      height: minHeight
    }, 'cover');
    var destWidth = Math.min(destMaxSizes.width, Math.max(destMinSizes.width, imageNaturalWidth));
    var destHeight = Math.min(destMaxSizes.height, Math.max(destMinSizes.height, imageNaturalHeight));
    var params = [-destWidth / 2, -destHeight / 2, destWidth, destHeight];
    canvas.width = normalizeDecimalNumber(width);
    canvas.height = normalizeDecimalNumber(height);
    context.fillStyle = fillColor;
    context.fillRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(rotate * Math.PI / 180);
    context.scale(scaleX, scaleY);
    context.imageSmoothingEnabled = imageSmoothingEnabled;
    context.imageSmoothingQuality = imageSmoothingQuality;
    context.drawImage.apply(context, [image].concat(_toConsumableArray(params.map(function (param) {
      return Math.floor(normalizeDecimalNumber(param));
    }))));
    context.restore();
    return canvas;
  }
  var fromCharCode = String.fromCharCode;
  /**
   * Get string from char code in data view.
   * @param {DataView} dataView - The data view for read.
   * @param {number} start - The start index.
   * @param {number} length - The read length.
   * @returns {string} The read result.
   */

  function getStringFromCharCode(dataView, start, length) {
    var str = '';
    length += start;

    for (var i = start; i < length; i += 1) {
      str += fromCharCode(dataView.getUint8(i));
    }

    return str;
  }
  var REGEXP_DATA_URL_HEAD = /^data:.*,/;
  /**
   * Transform Data URL to array buffer.
   * @param {string} dataURL - The Data URL to transform.
   * @returns {ArrayBuffer} The result array buffer.
   */

  function dataURLToArrayBuffer(dataURL) {
    var base64 = dataURL.replace(REGEXP_DATA_URL_HEAD, '');
    var binary = atob(base64);
    var arrayBuffer = new ArrayBuffer(binary.length);
    var uint8 = new Uint8Array(arrayBuffer);
    forEach(uint8, function (value, i) {
      uint8[i] = binary.charCodeAt(i);
    });
    return arrayBuffer;
  }
  /**
   * Transform array buffer to Data URL.
   * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
   * @param {string} mimeType - The mime type of the Data URL.
   * @returns {string} The result Data URL.
   */

  function arrayBufferToDataURL(arrayBuffer, mimeType) {
    var chunks = []; // Chunk Typed Array for better performance (#435)

    var chunkSize = 8192;
    var uint8 = new Uint8Array(arrayBuffer);

    while (uint8.length > 0) {
      // XXX: Babel's `toConsumableArray` helper will throw error in IE or Safari 9
      // eslint-disable-next-line prefer-spread
      chunks.push(fromCharCode.apply(null, toArray(uint8.subarray(0, chunkSize))));
      uint8 = uint8.subarray(chunkSize);
    }

    return "data:".concat(mimeType, ";base64,").concat(btoa(chunks.join('')));
  }
  /**
   * Get orientation value from given array buffer.
   * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
   * @returns {number} The read orientation value.
   */

  function resetAndGetOrientation(arrayBuffer) {
    var dataView = new DataView(arrayBuffer);
    var orientation; // Ignores range error when the image does not have correct Exif information

    try {
      var littleEndian;
      var app1Start;
      var ifdStart; // Only handle JPEG image (start by 0xFFD8)

      if (dataView.getUint8(0) === 0xFF && dataView.getUint8(1) === 0xD8) {
        var length = dataView.byteLength;
        var offset = 2;

        while (offset + 1 < length) {
          if (dataView.getUint8(offset) === 0xFF && dataView.getUint8(offset + 1) === 0xE1) {
            app1Start = offset;
            break;
          }

          offset += 1;
        }
      }

      if (app1Start) {
        var exifIDCode = app1Start + 4;
        var tiffOffset = app1Start + 10;

        if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
          var endianness = dataView.getUint16(tiffOffset);
          littleEndian = endianness === 0x4949;

          if (littleEndian || endianness === 0x4D4D
          /* bigEndian */
          ) {
              if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002A) {
                var firstIFDOffset = dataView.getUint32(tiffOffset + 4, littleEndian);

                if (firstIFDOffset >= 0x00000008) {
                  ifdStart = tiffOffset + firstIFDOffset;
                }
              }
            }
        }
      }

      if (ifdStart) {
        var _length = dataView.getUint16(ifdStart, littleEndian);

        var _offset;

        var i;

        for (i = 0; i < _length; i += 1) {
          _offset = ifdStart + i * 12 + 2;

          if (dataView.getUint16(_offset, littleEndian) === 0x0112
          /* Orientation */
          ) {
              // 8 is the offset of the current tag's value
              _offset += 8; // Get the original orientation value

              orientation = dataView.getUint16(_offset, littleEndian); // Override the orientation with its default value

              dataView.setUint16(_offset, 1, littleEndian);
              break;
            }
        }
      }
    } catch (error) {
      orientation = 1;
    }

    return orientation;
  }
  /**
   * Parse Exif Orientation value.
   * @param {number} orientation - The orientation to parse.
   * @returns {Object} The parsed result.
   */

  function parseOrientation(orientation) {
    var rotate = 0;
    var scaleX = 1;
    var scaleY = 1;

    switch (orientation) {
      // Flip horizontal
      case 2:
        scaleX = -1;
        break;
      // Rotate left 180°

      case 3:
        rotate = -180;
        break;
      // Flip vertical

      case 4:
        scaleY = -1;
        break;
      // Flip vertical and rotate right 90°

      case 5:
        rotate = 90;
        scaleY = -1;
        break;
      // Rotate right 90°

      case 6:
        rotate = 90;
        break;
      // Flip horizontal and rotate right 90°

      case 7:
        rotate = 90;
        scaleX = -1;
        break;
      // Rotate left 90°

      case 8:
        rotate = -90;
        break;
    }

    return {
      rotate: rotate,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var render = {
    render: function render() {
      this.initContainer();
      this.initCanvas();
      this.initCropBox();
      this.renderCanvas();

      if (this.cropped) {
        this.renderCropBox();
      }
    },
    initContainer: function initContainer() {
      var element = this.element,
          options = this.options,
          container = this.container,
          cropper = this.cropper;
      addClass(cropper, CLASS_HIDDEN);
      removeClass(element, CLASS_HIDDEN);
      var containerData = {
        width: Math.max(container.offsetWidth, Number(options.minContainerWidth) || 200),
        height: Math.max(container.offsetHeight, Number(options.minContainerHeight) || 100)
      };
      this.containerData = containerData;
      setStyle(cropper, {
        width: containerData.width,
        height: containerData.height
      });
      addClass(element, CLASS_HIDDEN);
      removeClass(cropper, CLASS_HIDDEN);
    },
    // Canvas (image wrapper)
    initCanvas: function initCanvas() {
      var containerData = this.containerData,
          imageData = this.imageData;
      var viewMode = this.options.viewMode;
      var rotated = Math.abs(imageData.rotate) % 180 === 90;
      var naturalWidth = rotated ? imageData.naturalHeight : imageData.naturalWidth;
      var naturalHeight = rotated ? imageData.naturalWidth : imageData.naturalHeight;
      var aspectRatio = naturalWidth / naturalHeight;
      var canvasWidth = containerData.width;
      var canvasHeight = containerData.height;

      if (containerData.height * aspectRatio > containerData.width) {
        if (viewMode === 3) {
          canvasWidth = containerData.height * aspectRatio;
        } else {
          canvasHeight = containerData.width / aspectRatio;
        }
      } else if (viewMode === 3) {
        canvasHeight = containerData.width / aspectRatio;
      } else {
        canvasWidth = containerData.height * aspectRatio;
      }

      var canvasData = {
        aspectRatio: aspectRatio,
        naturalWidth: naturalWidth,
        naturalHeight: naturalHeight,
        width: canvasWidth,
        height: canvasHeight
      };
      canvasData.left = (containerData.width - canvasWidth) / 2;
      canvasData.top = (containerData.height - canvasHeight) / 2;
      canvasData.oldLeft = canvasData.left;
      canvasData.oldTop = canvasData.top;
      this.canvasData = canvasData;
      this.limited = viewMode === 1 || viewMode === 2;
      this.limitCanvas(true, true);
      this.initialImageData = assign({}, imageData);
      this.initialCanvasData = assign({}, canvasData);
    },
    limitCanvas: function limitCanvas(sizeLimited, positionLimited) {
      var options = this.options,
          containerData = this.containerData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;
      var viewMode = options.viewMode;
      var aspectRatio = canvasData.aspectRatio;
      var cropped = this.cropped && cropBoxData;

      if (sizeLimited) {
        var minCanvasWidth = Number(options.minCanvasWidth) || 0;
        var minCanvasHeight = Number(options.minCanvasHeight) || 0;

        if (viewMode > 1) {
          minCanvasWidth = Math.max(minCanvasWidth, containerData.width);
          minCanvasHeight = Math.max(minCanvasHeight, containerData.height);

          if (viewMode === 3) {
            if (minCanvasHeight * aspectRatio > minCanvasWidth) {
              minCanvasWidth = minCanvasHeight * aspectRatio;
            } else {
              minCanvasHeight = minCanvasWidth / aspectRatio;
            }
          }
        } else if (viewMode > 0) {
          if (minCanvasWidth) {
            minCanvasWidth = Math.max(minCanvasWidth, cropped ? cropBoxData.width : 0);
          } else if (minCanvasHeight) {
            minCanvasHeight = Math.max(minCanvasHeight, cropped ? cropBoxData.height : 0);
          } else if (cropped) {
            minCanvasWidth = cropBoxData.width;
            minCanvasHeight = cropBoxData.height;

            if (minCanvasHeight * aspectRatio > minCanvasWidth) {
              minCanvasWidth = minCanvasHeight * aspectRatio;
            } else {
              minCanvasHeight = minCanvasWidth / aspectRatio;
            }
          }
        }

        var _getAdjustedSizes = getAdjustedSizes({
          aspectRatio: aspectRatio,
          width: minCanvasWidth,
          height: minCanvasHeight
        });

        minCanvasWidth = _getAdjustedSizes.width;
        minCanvasHeight = _getAdjustedSizes.height;
        canvasData.minWidth = minCanvasWidth;
        canvasData.minHeight = minCanvasHeight;
        canvasData.maxWidth = Infinity;
        canvasData.maxHeight = Infinity;
      }

      if (positionLimited) {
        if (viewMode > (cropped ? 0 : 1)) {
          var newCanvasLeft = containerData.width - canvasData.width;
          var newCanvasTop = containerData.height - canvasData.height;
          canvasData.minLeft = Math.min(0, newCanvasLeft);
          canvasData.minTop = Math.min(0, newCanvasTop);
          canvasData.maxLeft = Math.max(0, newCanvasLeft);
          canvasData.maxTop = Math.max(0, newCanvasTop);

          if (cropped && this.limited) {
            canvasData.minLeft = Math.min(cropBoxData.left, cropBoxData.left + (cropBoxData.width - canvasData.width));
            canvasData.minTop = Math.min(cropBoxData.top, cropBoxData.top + (cropBoxData.height - canvasData.height));
            canvasData.maxLeft = cropBoxData.left;
            canvasData.maxTop = cropBoxData.top;

            if (viewMode === 2) {
              if (canvasData.width >= containerData.width) {
                canvasData.minLeft = Math.min(0, newCanvasLeft);
                canvasData.maxLeft = Math.max(0, newCanvasLeft);
              }

              if (canvasData.height >= containerData.height) {
                canvasData.minTop = Math.min(0, newCanvasTop);
                canvasData.maxTop = Math.max(0, newCanvasTop);
              }
            }
          }
        } else {
          canvasData.minLeft = -canvasData.width;
          canvasData.minTop = -canvasData.height;
          canvasData.maxLeft = containerData.width;
          canvasData.maxTop = containerData.height;
        }
      }
    },
    renderCanvas: function renderCanvas(changed, transformed) {
      var canvasData = this.canvasData,
          imageData = this.imageData;

      if (transformed) {
        var _getRotatedSizes = getRotatedSizes({
          width: imageData.naturalWidth * Math.abs(imageData.scaleX || 1),
          height: imageData.naturalHeight * Math.abs(imageData.scaleY || 1),
          degree: imageData.rotate || 0
        }),
            naturalWidth = _getRotatedSizes.width,
            naturalHeight = _getRotatedSizes.height;

        var width = canvasData.width * (naturalWidth / canvasData.naturalWidth);
        var height = canvasData.height * (naturalHeight / canvasData.naturalHeight);
        canvasData.left -= (width - canvasData.width) / 2;
        canvasData.top -= (height - canvasData.height) / 2;
        canvasData.width = width;
        canvasData.height = height;
        canvasData.aspectRatio = naturalWidth / naturalHeight;
        canvasData.naturalWidth = naturalWidth;
        canvasData.naturalHeight = naturalHeight;
        this.limitCanvas(true, false);
      }

      if (canvasData.width > canvasData.maxWidth || canvasData.width < canvasData.minWidth) {
        canvasData.left = canvasData.oldLeft;
      }

      if (canvasData.height > canvasData.maxHeight || canvasData.height < canvasData.minHeight) {
        canvasData.top = canvasData.oldTop;
      }

      canvasData.width = Math.min(Math.max(canvasData.width, canvasData.minWidth), canvasData.maxWidth);
      canvasData.height = Math.min(Math.max(canvasData.height, canvasData.minHeight), canvasData.maxHeight);
      this.limitCanvas(false, true);
      canvasData.left = Math.min(Math.max(canvasData.left, canvasData.minLeft), canvasData.maxLeft);
      canvasData.top = Math.min(Math.max(canvasData.top, canvasData.minTop), canvasData.maxTop);
      canvasData.oldLeft = canvasData.left;
      canvasData.oldTop = canvasData.top;
      setStyle(this.canvas, assign({
        width: canvasData.width,
        height: canvasData.height
      }, getTransforms({
        translateX: canvasData.left,
        translateY: canvasData.top
      })));
      this.renderImage(changed);

      if (this.cropped && this.limited) {
        this.limitCropBox(true, true);
      }
    },
    renderImage: function renderImage(changed) {
      var canvasData = this.canvasData,
          imageData = this.imageData;
      var width = imageData.naturalWidth * (canvasData.width / canvasData.naturalWidth);
      var height = imageData.naturalHeight * (canvasData.height / canvasData.naturalHeight);
      assign(imageData, {
        width: width,
        height: height,
        left: (canvasData.width - width) / 2,
        top: (canvasData.height - height) / 2
      });
      setStyle(this.image, assign({
        width: imageData.width,
        height: imageData.height
      }, getTransforms(assign({
        translateX: imageData.left,
        translateY: imageData.top
      }, imageData))));

      if (changed) {
        this.output();
      }
    },
    initCropBox: function initCropBox() {
      var options = this.options,
          canvasData = this.canvasData;
      var aspectRatio = options.aspectRatio || options.initialAspectRatio;
      var autoCropArea = Number(options.autoCropArea) || 0.8;
      var cropBoxData = {
        width: canvasData.width,
        height: canvasData.height
      };

      if (aspectRatio) {
        if (canvasData.height * aspectRatio > canvasData.width) {
          cropBoxData.height = cropBoxData.width / aspectRatio;
        } else {
          cropBoxData.width = cropBoxData.height * aspectRatio;
        }
      }

      this.cropBoxData = cropBoxData;
      this.limitCropBox(true, true); // Initialize auto crop area

      cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
      cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight); // The width/height of auto crop area must large than "minWidth/Height"

      cropBoxData.width = Math.max(cropBoxData.minWidth, cropBoxData.width * autoCropArea);
      cropBoxData.height = Math.max(cropBoxData.minHeight, cropBoxData.height * autoCropArea);
      cropBoxData.left = canvasData.left + (canvasData.width - cropBoxData.width) / 2;
      cropBoxData.top = canvasData.top + (canvasData.height - cropBoxData.height) / 2;
      cropBoxData.oldLeft = cropBoxData.left;
      cropBoxData.oldTop = cropBoxData.top;
      this.initialCropBoxData = assign({}, cropBoxData);
    },
    limitCropBox: function limitCropBox(sizeLimited, positionLimited) {
      var options = this.options,
          containerData = this.containerData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData,
          limited = this.limited;
      var aspectRatio = options.aspectRatio;

      if (sizeLimited) {
        var minCropBoxWidth = Number(options.minCropBoxWidth) || 0;
        var minCropBoxHeight = Number(options.minCropBoxHeight) || 0;
        var maxCropBoxWidth = limited ? Math.min(containerData.width, canvasData.width, canvasData.width + canvasData.left, containerData.width - canvasData.left) : containerData.width;
        var maxCropBoxHeight = limited ? Math.min(containerData.height, canvasData.height, canvasData.height + canvasData.top, containerData.height - canvasData.top) : containerData.height; // The min/maxCropBoxWidth/Height must be less than container's width/height

        minCropBoxWidth = Math.min(minCropBoxWidth, containerData.width);
        minCropBoxHeight = Math.min(minCropBoxHeight, containerData.height);

        if (aspectRatio) {
          if (minCropBoxWidth && minCropBoxHeight) {
            if (minCropBoxHeight * aspectRatio > minCropBoxWidth) {
              minCropBoxHeight = minCropBoxWidth / aspectRatio;
            } else {
              minCropBoxWidth = minCropBoxHeight * aspectRatio;
            }
          } else if (minCropBoxWidth) {
            minCropBoxHeight = minCropBoxWidth / aspectRatio;
          } else if (minCropBoxHeight) {
            minCropBoxWidth = minCropBoxHeight * aspectRatio;
          }

          if (maxCropBoxHeight * aspectRatio > maxCropBoxWidth) {
            maxCropBoxHeight = maxCropBoxWidth / aspectRatio;
          } else {
            maxCropBoxWidth = maxCropBoxHeight * aspectRatio;
          }
        } // The minWidth/Height must be less than maxWidth/Height


        cropBoxData.minWidth = Math.min(minCropBoxWidth, maxCropBoxWidth);
        cropBoxData.minHeight = Math.min(minCropBoxHeight, maxCropBoxHeight);
        cropBoxData.maxWidth = maxCropBoxWidth;
        cropBoxData.maxHeight = maxCropBoxHeight;
      }

      if (positionLimited) {
        if (limited) {
          cropBoxData.minLeft = Math.max(0, canvasData.left);
          cropBoxData.minTop = Math.max(0, canvasData.top);
          cropBoxData.maxLeft = Math.min(containerData.width, canvasData.left + canvasData.width) - cropBoxData.width;
          cropBoxData.maxTop = Math.min(containerData.height, canvasData.top + canvasData.height) - cropBoxData.height;
        } else {
          cropBoxData.minLeft = 0;
          cropBoxData.minTop = 0;
          cropBoxData.maxLeft = containerData.width - cropBoxData.width;
          cropBoxData.maxTop = containerData.height - cropBoxData.height;
        }
      }
    },
    renderCropBox: function renderCropBox() {
      var options = this.options,
          containerData = this.containerData,
          cropBoxData = this.cropBoxData;

      if (cropBoxData.width > cropBoxData.maxWidth || cropBoxData.width < cropBoxData.minWidth) {
        cropBoxData.left = cropBoxData.oldLeft;
      }

      if (cropBoxData.height > cropBoxData.maxHeight || cropBoxData.height < cropBoxData.minHeight) {
        cropBoxData.top = cropBoxData.oldTop;
      }

      cropBoxData.width = Math.min(Math.max(cropBoxData.width, cropBoxData.minWidth), cropBoxData.maxWidth);
      cropBoxData.height = Math.min(Math.max(cropBoxData.height, cropBoxData.minHeight), cropBoxData.maxHeight);
      this.limitCropBox(false, true);
      cropBoxData.left = Math.min(Math.max(cropBoxData.left, cropBoxData.minLeft), cropBoxData.maxLeft);
      cropBoxData.top = Math.min(Math.max(cropBoxData.top, cropBoxData.minTop), cropBoxData.maxTop);
      cropBoxData.oldLeft = cropBoxData.left;
      cropBoxData.oldTop = cropBoxData.top;

      if (options.movable && options.cropBoxMovable) {
        // Turn to move the canvas when the crop box is equal to the container
        setData(this.face, DATA_ACTION, cropBoxData.width >= containerData.width && cropBoxData.height >= containerData.height ? ACTION_MOVE : ACTION_ALL);
      }

      setStyle(this.cropBox, assign({
        width: cropBoxData.width,
        height: cropBoxData.height
      }, getTransforms({
        translateX: cropBoxData.left,
        translateY: cropBoxData.top
      })));

      if (this.cropped && this.limited) {
        this.limitCanvas(true, true);
      }

      if (!this.disabled) {
        this.output();
      }
    },
    output: function output() {
      this.preview();
      dispatchEvent(this.element, EVENT_CROP, this.getData());
    }
  };

  var preview = {
    initPreview: function initPreview() {
      var element = this.element,
          crossOrigin = this.crossOrigin;
      var preview = this.options.preview;
      var url = crossOrigin ? this.crossOriginUrl : this.url;
      var alt = element.alt || 'The image to preview';
      var image = document.createElement('img');

      if (crossOrigin) {
        image.crossOrigin = crossOrigin;
      }

      image.src = url;
      image.alt = alt;
      this.viewBox.appendChild(image);
      this.viewBoxImage = image;

      if (!preview) {
        return;
      }

      var previews = preview;

      if (typeof preview === 'string') {
        previews = element.ownerDocument.querySelectorAll(preview);
      } else if (preview.querySelector) {
        previews = [preview];
      }

      this.previews = previews;
      forEach(previews, function (el) {
        var img = document.createElement('img'); // Save the original size for recover

        setData(el, DATA_PREVIEW, {
          width: el.offsetWidth,
          height: el.offsetHeight,
          html: el.innerHTML
        });

        if (crossOrigin) {
          img.crossOrigin = crossOrigin;
        }

        img.src = url;
        img.alt = alt;
        /**
         * Override img element styles
         * Add `display:block` to avoid margin top issue
         * Add `height:auto` to override `height` attribute on IE8
         * (Occur only when margin-top <= -height)
         */

        img.style.cssText = 'display:block;' + 'width:100%;' + 'height:auto;' + 'min-width:0!important;' + 'min-height:0!important;' + 'max-width:none!important;' + 'max-height:none!important;' + 'image-orientation:0deg!important;"';
        el.innerHTML = '';
        el.appendChild(img);
      });
    },
    resetPreview: function resetPreview() {
      forEach(this.previews, function (element) {
        var data = getData(element, DATA_PREVIEW);
        setStyle(element, {
          width: data.width,
          height: data.height
        });
        element.innerHTML = data.html;
        removeData(element, DATA_PREVIEW);
      });
    },
    preview: function preview() {
      var imageData = this.imageData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;
      var cropBoxWidth = cropBoxData.width,
          cropBoxHeight = cropBoxData.height;
      var width = imageData.width,
          height = imageData.height;
      var left = cropBoxData.left - canvasData.left - imageData.left;
      var top = cropBoxData.top - canvasData.top - imageData.top;

      if (!this.cropped || this.disabled) {
        return;
      }

      setStyle(this.viewBoxImage, assign({
        width: width,
        height: height
      }, getTransforms(assign({
        translateX: -left,
        translateY: -top
      }, imageData))));
      forEach(this.previews, function (element) {
        var data = getData(element, DATA_PREVIEW);
        var originalWidth = data.width;
        var originalHeight = data.height;
        var newWidth = originalWidth;
        var newHeight = originalHeight;
        var ratio = 1;

        if (cropBoxWidth) {
          ratio = originalWidth / cropBoxWidth;
          newHeight = cropBoxHeight * ratio;
        }

        if (cropBoxHeight && newHeight > originalHeight) {
          ratio = originalHeight / cropBoxHeight;
          newWidth = cropBoxWidth * ratio;
          newHeight = originalHeight;
        }

        setStyle(element, {
          width: newWidth,
          height: newHeight
        });
        setStyle(element.getElementsByTagName('img')[0], assign({
          width: width * ratio,
          height: height * ratio
        }, getTransforms(assign({
          translateX: -left * ratio,
          translateY: -top * ratio
        }, imageData))));
      });
    }
  };

  var events = {
    bind: function bind() {
      var element = this.element,
          options = this.options,
          cropper = this.cropper;

      if (isFunction(options.cropstart)) {
        addListener(element, EVENT_CROP_START, options.cropstart);
      }

      if (isFunction(options.cropmove)) {
        addListener(element, EVENT_CROP_MOVE, options.cropmove);
      }

      if (isFunction(options.cropend)) {
        addListener(element, EVENT_CROP_END, options.cropend);
      }

      if (isFunction(options.crop)) {
        addListener(element, EVENT_CROP, options.crop);
      }

      if (isFunction(options.zoom)) {
        addListener(element, EVENT_ZOOM, options.zoom);
      }

      addListener(cropper, EVENT_POINTER_DOWN, this.onCropStart = this.cropStart.bind(this));

      if (options.zoomable && options.zoomOnWheel) {
        addListener(cropper, EVENT_WHEEL, this.onWheel = this.wheel.bind(this), {
          passive: false,
          capture: true
        });
      }

      if (options.toggleDragModeOnDblclick) {
        addListener(cropper, EVENT_DBLCLICK, this.onDblclick = this.dblclick.bind(this));
      }

      addListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove = this.cropMove.bind(this));
      addListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd = this.cropEnd.bind(this));

      if (options.responsive) {
        addListener(window, EVENT_RESIZE, this.onResize = this.resize.bind(this));
      }
    },
    unbind: function unbind() {
      var element = this.element,
          options = this.options,
          cropper = this.cropper;

      if (isFunction(options.cropstart)) {
        removeListener(element, EVENT_CROP_START, options.cropstart);
      }

      if (isFunction(options.cropmove)) {
        removeListener(element, EVENT_CROP_MOVE, options.cropmove);
      }

      if (isFunction(options.cropend)) {
        removeListener(element, EVENT_CROP_END, options.cropend);
      }

      if (isFunction(options.crop)) {
        removeListener(element, EVENT_CROP, options.crop);
      }

      if (isFunction(options.zoom)) {
        removeListener(element, EVENT_ZOOM, options.zoom);
      }

      removeListener(cropper, EVENT_POINTER_DOWN, this.onCropStart);

      if (options.zoomable && options.zoomOnWheel) {
        removeListener(cropper, EVENT_WHEEL, this.onWheel, {
          passive: false,
          capture: true
        });
      }

      if (options.toggleDragModeOnDblclick) {
        removeListener(cropper, EVENT_DBLCLICK, this.onDblclick);
      }

      removeListener(element.ownerDocument, EVENT_POINTER_MOVE, this.onCropMove);
      removeListener(element.ownerDocument, EVENT_POINTER_UP, this.onCropEnd);

      if (options.responsive) {
        removeListener(window, EVENT_RESIZE, this.onResize);
      }
    }
  };

  var handlers = {
    resize: function resize() {
      if (this.disabled) {
        return;
      }

      var options = this.options,
          container = this.container,
          containerData = this.containerData;
      var ratio = container.offsetWidth / containerData.width; // Resize when width changed or height changed

      if (ratio !== 1 || container.offsetHeight !== containerData.height) {
        var canvasData;
        var cropBoxData;

        if (options.restore) {
          canvasData = this.getCanvasData();
          cropBoxData = this.getCropBoxData();
        }

        this.render();

        if (options.restore) {
          this.setCanvasData(forEach(canvasData, function (n, i) {
            canvasData[i] = n * ratio;
          }));
          this.setCropBoxData(forEach(cropBoxData, function (n, i) {
            cropBoxData[i] = n * ratio;
          }));
        }
      }
    },
    dblclick: function dblclick() {
      if (this.disabled || this.options.dragMode === DRAG_MODE_NONE) {
        return;
      }

      this.setDragMode(hasClass(this.dragBox, CLASS_CROP) ? DRAG_MODE_MOVE : DRAG_MODE_CROP);
    },
    wheel: function wheel(event) {
      var _this = this;

      var ratio = Number(this.options.wheelZoomRatio) || 0.1;
      var delta = 1;

      if (this.disabled) {
        return;
      }

      event.preventDefault(); // Limit wheel speed to prevent zoom too fast (#21)

      if (this.wheeling) {
        return;
      }

      this.wheeling = true;
      setTimeout(function () {
        _this.wheeling = false;
      }, 50);

      if (event.deltaY) {
        delta = event.deltaY > 0 ? 1 : -1;
      } else if (event.wheelDelta) {
        delta = -event.wheelDelta / 120;
      } else if (event.detail) {
        delta = event.detail > 0 ? 1 : -1;
      }

      this.zoom(-delta * ratio, event);
    },
    cropStart: function cropStart(event) {
      var buttons = event.buttons,
          button = event.button;

      if (this.disabled // Handle mouse event and pointer event and ignore touch event
      || (event.type === 'mousedown' || event.type === 'pointerdown' && event.pointerType === 'mouse') && ( // No primary button (Usually the left button)
      isNumber(buttons) && buttons !== 1 || isNumber(button) && button !== 0 // Open context menu
      || event.ctrlKey)) {
        return;
      }

      var options = this.options,
          pointers = this.pointers;
      var action;

      if (event.changedTouches) {
        // Handle touch event
        forEach(event.changedTouches, function (touch) {
          pointers[touch.identifier] = getPointer(touch);
        });
      } else {
        // Handle mouse event and pointer event
        pointers[event.pointerId || 0] = getPointer(event);
      }

      if (Object.keys(pointers).length > 1 && options.zoomable && options.zoomOnTouch) {
        action = ACTION_ZOOM;
      } else {
        action = getData(event.target, DATA_ACTION);
      }

      if (!REGEXP_ACTIONS.test(action)) {
        return;
      }

      if (dispatchEvent(this.element, EVENT_CROP_START, {
        originalEvent: event,
        action: action
      }) === false) {
        return;
      } // This line is required for preventing page zooming in iOS browsers


      event.preventDefault();
      this.action = action;
      this.cropping = false;

      if (action === ACTION_CROP) {
        this.cropping = true;
        addClass(this.dragBox, CLASS_MODAL);
      }
    },
    cropMove: function cropMove(event) {
      var action = this.action;

      if (this.disabled || !action) {
        return;
      }

      var pointers = this.pointers;
      event.preventDefault();

      if (dispatchEvent(this.element, EVENT_CROP_MOVE, {
        originalEvent: event,
        action: action
      }) === false) {
        return;
      }

      if (event.changedTouches) {
        forEach(event.changedTouches, function (touch) {
          // The first parameter should not be undefined (#432)
          assign(pointers[touch.identifier] || {}, getPointer(touch, true));
        });
      } else {
        assign(pointers[event.pointerId || 0] || {}, getPointer(event, true));
      }

      this.change(event);
    },
    cropEnd: function cropEnd(event) {
      if (this.disabled) {
        return;
      }

      var action = this.action,
          pointers = this.pointers;

      if (event.changedTouches) {
        forEach(event.changedTouches, function (touch) {
          delete pointers[touch.identifier];
        });
      } else {
        delete pointers[event.pointerId || 0];
      }

      if (!action) {
        return;
      }

      event.preventDefault();

      if (!Object.keys(pointers).length) {
        this.action = '';
      }

      if (this.cropping) {
        this.cropping = false;
        toggleClass(this.dragBox, CLASS_MODAL, this.cropped && this.options.modal);
      }

      dispatchEvent(this.element, EVENT_CROP_END, {
        originalEvent: event,
        action: action
      });
    }
  };

  var change = {
    change: function change(event) {
      var options = this.options,
          canvasData = this.canvasData,
          containerData = this.containerData,
          cropBoxData = this.cropBoxData,
          pointers = this.pointers;
      var action = this.action;
      var aspectRatio = options.aspectRatio;
      var left = cropBoxData.left,
          top = cropBoxData.top,
          width = cropBoxData.width,
          height = cropBoxData.height;
      var right = left + width;
      var bottom = top + height;
      var minLeft = 0;
      var minTop = 0;
      var maxWidth = containerData.width;
      var maxHeight = containerData.height;
      var renderable = true;
      var offset; // Locking aspect ratio in "free mode" by holding shift key

      if (!aspectRatio && event.shiftKey) {
        aspectRatio = width && height ? width / height : 1;
      }

      if (this.limited) {
        minLeft = cropBoxData.minLeft;
        minTop = cropBoxData.minTop;
        maxWidth = minLeft + Math.min(containerData.width, canvasData.width, canvasData.left + canvasData.width);
        maxHeight = minTop + Math.min(containerData.height, canvasData.height, canvasData.top + canvasData.height);
      }

      var pointer = pointers[Object.keys(pointers)[0]];
      var range = {
        x: pointer.endX - pointer.startX,
        y: pointer.endY - pointer.startY
      };

      var check = function check(side) {
        switch (side) {
          case ACTION_EAST:
            if (right + range.x > maxWidth) {
              range.x = maxWidth - right;
            }

            break;

          case ACTION_WEST:
            if (left + range.x < minLeft) {
              range.x = minLeft - left;
            }

            break;

          case ACTION_NORTH:
            if (top + range.y < minTop) {
              range.y = minTop - top;
            }

            break;

          case ACTION_SOUTH:
            if (bottom + range.y > maxHeight) {
              range.y = maxHeight - bottom;
            }

            break;
        }
      };

      switch (action) {
        // Move crop box
        case ACTION_ALL:
          left += range.x;
          top += range.y;
          break;
        // Resize crop box

        case ACTION_EAST:
          if (range.x >= 0 && (right >= maxWidth || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
            renderable = false;
            break;
          }

          check(ACTION_EAST);
          width += range.x;

          if (width < 0) {
            action = ACTION_WEST;
            width = -width;
            left -= width;
          }

          if (aspectRatio) {
            height = width / aspectRatio;
            top += (cropBoxData.height - height) / 2;
          }

          break;

        case ACTION_NORTH:
          if (range.y <= 0 && (top <= minTop || aspectRatio && (left <= minLeft || right >= maxWidth))) {
            renderable = false;
            break;
          }

          check(ACTION_NORTH);
          height -= range.y;
          top += range.y;

          if (height < 0) {
            action = ACTION_SOUTH;
            height = -height;
            top -= height;
          }

          if (aspectRatio) {
            width = height * aspectRatio;
            left += (cropBoxData.width - width) / 2;
          }

          break;

        case ACTION_WEST:
          if (range.x <= 0 && (left <= minLeft || aspectRatio && (top <= minTop || bottom >= maxHeight))) {
            renderable = false;
            break;
          }

          check(ACTION_WEST);
          width -= range.x;
          left += range.x;

          if (width < 0) {
            action = ACTION_EAST;
            width = -width;
            left -= width;
          }

          if (aspectRatio) {
            height = width / aspectRatio;
            top += (cropBoxData.height - height) / 2;
          }

          break;

        case ACTION_SOUTH:
          if (range.y >= 0 && (bottom >= maxHeight || aspectRatio && (left <= minLeft || right >= maxWidth))) {
            renderable = false;
            break;
          }

          check(ACTION_SOUTH);
          height += range.y;

          if (height < 0) {
            action = ACTION_NORTH;
            height = -height;
            top -= height;
          }

          if (aspectRatio) {
            width = height * aspectRatio;
            left += (cropBoxData.width - width) / 2;
          }

          break;

        case ACTION_NORTH_EAST:
          if (aspectRatio) {
            if (range.y <= 0 && (top <= minTop || right >= maxWidth)) {
              renderable = false;
              break;
            }

            check(ACTION_NORTH);
            height -= range.y;
            top += range.y;
            width = height * aspectRatio;
          } else {
            check(ACTION_NORTH);
            check(ACTION_EAST);

            if (range.x >= 0) {
              if (right < maxWidth) {
                width += range.x;
              } else if (range.y <= 0 && top <= minTop) {
                renderable = false;
              }
            } else {
              width += range.x;
            }

            if (range.y <= 0) {
              if (top > minTop) {
                height -= range.y;
                top += range.y;
              }
            } else {
              height -= range.y;
              top += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_SOUTH_WEST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_NORTH_WEST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_SOUTH_EAST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_NORTH_WEST:
          if (aspectRatio) {
            if (range.y <= 0 && (top <= minTop || left <= minLeft)) {
              renderable = false;
              break;
            }

            check(ACTION_NORTH);
            height -= range.y;
            top += range.y;
            width = height * aspectRatio;
            left += cropBoxData.width - width;
          } else {
            check(ACTION_NORTH);
            check(ACTION_WEST);

            if (range.x <= 0) {
              if (left > minLeft) {
                width -= range.x;
                left += range.x;
              } else if (range.y <= 0 && top <= minTop) {
                renderable = false;
              }
            } else {
              width -= range.x;
              left += range.x;
            }

            if (range.y <= 0) {
              if (top > minTop) {
                height -= range.y;
                top += range.y;
              }
            } else {
              height -= range.y;
              top += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_SOUTH_EAST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_NORTH_EAST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_SOUTH_WEST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_SOUTH_WEST:
          if (aspectRatio) {
            if (range.x <= 0 && (left <= minLeft || bottom >= maxHeight)) {
              renderable = false;
              break;
            }

            check(ACTION_WEST);
            width -= range.x;
            left += range.x;
            height = width / aspectRatio;
          } else {
            check(ACTION_SOUTH);
            check(ACTION_WEST);

            if (range.x <= 0) {
              if (left > minLeft) {
                width -= range.x;
                left += range.x;
              } else if (range.y >= 0 && bottom >= maxHeight) {
                renderable = false;
              }
            } else {
              width -= range.x;
              left += range.x;
            }

            if (range.y >= 0) {
              if (bottom < maxHeight) {
                height += range.y;
              }
            } else {
              height += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_NORTH_EAST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_SOUTH_EAST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_NORTH_WEST;
            height = -height;
            top -= height;
          }

          break;

        case ACTION_SOUTH_EAST:
          if (aspectRatio) {
            if (range.x >= 0 && (right >= maxWidth || bottom >= maxHeight)) {
              renderable = false;
              break;
            }

            check(ACTION_EAST);
            width += range.x;
            height = width / aspectRatio;
          } else {
            check(ACTION_SOUTH);
            check(ACTION_EAST);

            if (range.x >= 0) {
              if (right < maxWidth) {
                width += range.x;
              } else if (range.y >= 0 && bottom >= maxHeight) {
                renderable = false;
              }
            } else {
              width += range.x;
            }

            if (range.y >= 0) {
              if (bottom < maxHeight) {
                height += range.y;
              }
            } else {
              height += range.y;
            }
          }

          if (width < 0 && height < 0) {
            action = ACTION_NORTH_WEST;
            height = -height;
            width = -width;
            top -= height;
            left -= width;
          } else if (width < 0) {
            action = ACTION_SOUTH_WEST;
            width = -width;
            left -= width;
          } else if (height < 0) {
            action = ACTION_NORTH_EAST;
            height = -height;
            top -= height;
          }

          break;
        // Move canvas

        case ACTION_MOVE:
          this.move(range.x, range.y);
          renderable = false;
          break;
        // Zoom canvas

        case ACTION_ZOOM:
          this.zoom(getMaxZoomRatio(pointers), event);
          renderable = false;
          break;
        // Create crop box

        case ACTION_CROP:
          if (!range.x || !range.y) {
            renderable = false;
            break;
          }

          offset = getOffset(this.cropper);
          left = pointer.startX - offset.left;
          top = pointer.startY - offset.top;
          width = cropBoxData.minWidth;
          height = cropBoxData.minHeight;

          if (range.x > 0) {
            action = range.y > 0 ? ACTION_SOUTH_EAST : ACTION_NORTH_EAST;
          } else if (range.x < 0) {
            left -= width;
            action = range.y > 0 ? ACTION_SOUTH_WEST : ACTION_NORTH_WEST;
          }

          if (range.y < 0) {
            top -= height;
          } // Show the crop box if is hidden


          if (!this.cropped) {
            removeClass(this.cropBox, CLASS_HIDDEN);
            this.cropped = true;

            if (this.limited) {
              this.limitCropBox(true, true);
            }
          }

          break;
      }

      if (renderable) {
        cropBoxData.width = width;
        cropBoxData.height = height;
        cropBoxData.left = left;
        cropBoxData.top = top;
        this.action = action;
        this.renderCropBox();
      } // Override


      forEach(pointers, function (p) {
        p.startX = p.endX;
        p.startY = p.endY;
      });
    }
  };

  var methods = {
    // Show the crop box manually
    crop: function crop() {
      if (this.ready && !this.cropped && !this.disabled) {
        this.cropped = true;
        this.limitCropBox(true, true);

        if (this.options.modal) {
          addClass(this.dragBox, CLASS_MODAL);
        }

        removeClass(this.cropBox, CLASS_HIDDEN);
        this.setCropBoxData(this.initialCropBoxData);
      }

      return this;
    },
    // Reset the image and crop box to their initial states
    reset: function reset() {
      if (this.ready && !this.disabled) {
        this.imageData = assign({}, this.initialImageData);
        this.canvasData = assign({}, this.initialCanvasData);
        this.cropBoxData = assign({}, this.initialCropBoxData);
        this.renderCanvas();

        if (this.cropped) {
          this.renderCropBox();
        }
      }

      return this;
    },
    // Clear the crop box
    clear: function clear() {
      if (this.cropped && !this.disabled) {
        assign(this.cropBoxData, {
          left: 0,
          top: 0,
          width: 0,
          height: 0
        });
        this.cropped = false;
        this.renderCropBox();
        this.limitCanvas(true, true); // Render canvas after crop box rendered

        this.renderCanvas();
        removeClass(this.dragBox, CLASS_MODAL);
        addClass(this.cropBox, CLASS_HIDDEN);
      }

      return this;
    },

    /**
     * Replace the image's src and rebuild the cropper
     * @param {string} url - The new URL.
     * @param {boolean} [hasSameSize] - Indicate if the new image has the same size as the old one.
     * @returns {Cropper} this
     */
    replace: function replace(url) {
      var hasSameSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!this.disabled && url) {
        if (this.isImg) {
          this.element.src = url;
        }

        if (hasSameSize) {
          this.url = url;
          this.image.src = url;

          if (this.ready) {
            this.viewBoxImage.src = url;
            forEach(this.previews, function (element) {
              element.getElementsByTagName('img')[0].src = url;
            });
          }
        } else {
          if (this.isImg) {
            this.replaced = true;
          }

          this.options.data = null;
          this.uncreate();
          this.load(url);
        }
      }

      return this;
    },
    // Enable (unfreeze) the cropper
    enable: function enable() {
      if (this.ready && this.disabled) {
        this.disabled = false;
        removeClass(this.cropper, CLASS_DISABLED);
      }

      return this;
    },
    // Disable (freeze) the cropper
    disable: function disable() {
      if (this.ready && !this.disabled) {
        this.disabled = true;
        addClass(this.cropper, CLASS_DISABLED);
      }

      return this;
    },

    /**
     * Destroy the cropper and remove the instance from the image
     * @returns {Cropper} this
     */
    destroy: function destroy() {
      var element = this.element;

      if (!element[NAMESPACE]) {
        return this;
      }

      element[NAMESPACE] = undefined;

      if (this.isImg && this.replaced) {
        element.src = this.originalUrl;
      }

      this.uncreate();
      return this;
    },

    /**
     * Move the canvas with relative offsets
     * @param {number} offsetX - The relative offset distance on the x-axis.
     * @param {number} [offsetY=offsetX] - The relative offset distance on the y-axis.
     * @returns {Cropper} this
     */
    move: function move(offsetX) {
      var offsetY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : offsetX;
      var _this$canvasData = this.canvasData,
          left = _this$canvasData.left,
          top = _this$canvasData.top;
      return this.moveTo(isUndefined(offsetX) ? offsetX : left + Number(offsetX), isUndefined(offsetY) ? offsetY : top + Number(offsetY));
    },

    /**
     * Move the canvas to an absolute point
     * @param {number} x - The x-axis coordinate.
     * @param {number} [y=x] - The y-axis coordinate.
     * @returns {Cropper} this
     */
    moveTo: function moveTo(x) {
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : x;
      var canvasData = this.canvasData;
      var changed = false;
      x = Number(x);
      y = Number(y);

      if (this.ready && !this.disabled && this.options.movable) {
        if (isNumber(x)) {
          canvasData.left = x;
          changed = true;
        }

        if (isNumber(y)) {
          canvasData.top = y;
          changed = true;
        }

        if (changed) {
          this.renderCanvas(true);
        }
      }

      return this;
    },

    /**
     * Zoom the canvas with a relative ratio
     * @param {number} ratio - The target ratio.
     * @param {Event} _originalEvent - The original event if any.
     * @returns {Cropper} this
     */
    zoom: function zoom(ratio, _originalEvent) {
      var canvasData = this.canvasData;
      ratio = Number(ratio);

      if (ratio < 0) {
        ratio = 1 / (1 - ratio);
      } else {
        ratio = 1 + ratio;
      }

      return this.zoomTo(canvasData.width * ratio / canvasData.naturalWidth, null, _originalEvent);
    },

    /**
     * Zoom the canvas to an absolute ratio
     * @param {number} ratio - The target ratio.
     * @param {Object} pivot - The zoom pivot point coordinate.
     * @param {Event} _originalEvent - The original event if any.
     * @returns {Cropper} this
     */
    zoomTo: function zoomTo(ratio, pivot, _originalEvent) {
      var options = this.options,
          canvasData = this.canvasData;
      var width = canvasData.width,
          height = canvasData.height,
          naturalWidth = canvasData.naturalWidth,
          naturalHeight = canvasData.naturalHeight;
      ratio = Number(ratio);

      if (ratio >= 0 && this.ready && !this.disabled && options.zoomable) {
        var newWidth = naturalWidth * ratio;
        var newHeight = naturalHeight * ratio;

        if (dispatchEvent(this.element, EVENT_ZOOM, {
          ratio: ratio,
          oldRatio: width / naturalWidth,
          originalEvent: _originalEvent
        }) === false) {
          return this;
        }

        if (_originalEvent) {
          var pointers = this.pointers;
          var offset = getOffset(this.cropper);
          var center = pointers && Object.keys(pointers).length ? getPointersCenter(pointers) : {
            pageX: _originalEvent.pageX,
            pageY: _originalEvent.pageY
          }; // Zoom from the triggering point of the event

          canvasData.left -= (newWidth - width) * ((center.pageX - offset.left - canvasData.left) / width);
          canvasData.top -= (newHeight - height) * ((center.pageY - offset.top - canvasData.top) / height);
        } else if (isPlainObject(pivot) && isNumber(pivot.x) && isNumber(pivot.y)) {
          canvasData.left -= (newWidth - width) * ((pivot.x - canvasData.left) / width);
          canvasData.top -= (newHeight - height) * ((pivot.y - canvasData.top) / height);
        } else {
          // Zoom from the center of the canvas
          canvasData.left -= (newWidth - width) / 2;
          canvasData.top -= (newHeight - height) / 2;
        }

        canvasData.width = newWidth;
        canvasData.height = newHeight;
        this.renderCanvas(true);
      }

      return this;
    },

    /**
     * Rotate the canvas with a relative degree
     * @param {number} degree - The rotate degree.
     * @returns {Cropper} this
     */
    rotate: function rotate(degree) {
      return this.rotateTo((this.imageData.rotate || 0) + Number(degree));
    },

    /**
     * Rotate the canvas to an absolute degree
     * @param {number} degree - The rotate degree.
     * @returns {Cropper} this
     */
    rotateTo: function rotateTo(degree) {
      degree = Number(degree);

      if (isNumber(degree) && this.ready && !this.disabled && this.options.rotatable) {
        this.imageData.rotate = degree % 360;
        this.renderCanvas(true, true);
      }

      return this;
    },

    /**
     * Scale the image on the x-axis.
     * @param {number} scaleX - The scale ratio on the x-axis.
     * @returns {Cropper} this
     */
    scaleX: function scaleX(_scaleX) {
      var scaleY = this.imageData.scaleY;
      return this.scale(_scaleX, isNumber(scaleY) ? scaleY : 1);
    },

    /**
     * Scale the image on the y-axis.
     * @param {number} scaleY - The scale ratio on the y-axis.
     * @returns {Cropper} this
     */
    scaleY: function scaleY(_scaleY) {
      var scaleX = this.imageData.scaleX;
      return this.scale(isNumber(scaleX) ? scaleX : 1, _scaleY);
    },

    /**
     * Scale the image
     * @param {number} scaleX - The scale ratio on the x-axis.
     * @param {number} [scaleY=scaleX] - The scale ratio on the y-axis.
     * @returns {Cropper} this
     */
    scale: function scale(scaleX) {
      var scaleY = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : scaleX;
      var imageData = this.imageData;
      var transformed = false;
      scaleX = Number(scaleX);
      scaleY = Number(scaleY);

      if (this.ready && !this.disabled && this.options.scalable) {
        if (isNumber(scaleX)) {
          imageData.scaleX = scaleX;
          transformed = true;
        }

        if (isNumber(scaleY)) {
          imageData.scaleY = scaleY;
          transformed = true;
        }

        if (transformed) {
          this.renderCanvas(true, true);
        }
      }

      return this;
    },

    /**
     * Get the cropped area position and size data (base on the original image)
     * @param {boolean} [rounded=false] - Indicate if round the data values or not.
     * @returns {Object} The result cropped data.
     */
    getData: function getData() {
      var rounded = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var options = this.options,
          imageData = this.imageData,
          canvasData = this.canvasData,
          cropBoxData = this.cropBoxData;
      var data;

      if (this.ready && this.cropped) {
        data = {
          x: cropBoxData.left - canvasData.left,
          y: cropBoxData.top - canvasData.top,
          width: cropBoxData.width,
          height: cropBoxData.height
        };
        var ratio = imageData.width / imageData.naturalWidth;
        forEach(data, function (n, i) {
          data[i] = n / ratio;
        });

        if (rounded) {
          // In case rounding off leads to extra 1px in right or bottom border
          // we should round the top-left corner and the dimension (#343).
          var bottom = Math.round(data.y + data.height);
          var right = Math.round(data.x + data.width);
          data.x = Math.round(data.x);
          data.y = Math.round(data.y);
          data.width = right - data.x;
          data.height = bottom - data.y;
        }
      } else {
        data = {
          x: 0,
          y: 0,
          width: 0,
          height: 0
        };
      }

      if (options.rotatable) {
        data.rotate = imageData.rotate || 0;
      }

      if (options.scalable) {
        data.scaleX = imageData.scaleX || 1;
        data.scaleY = imageData.scaleY || 1;
      }

      return data;
    },

    /**
     * Set the cropped area position and size with new data
     * @param {Object} data - The new data.
     * @returns {Cropper} this
     */
    setData: function setData(data) {
      var options = this.options,
          imageData = this.imageData,
          canvasData = this.canvasData;
      var cropBoxData = {};

      if (this.ready && !this.disabled && isPlainObject(data)) {
        var transformed = false;

        if (options.rotatable) {
          if (isNumber(data.rotate) && data.rotate !== imageData.rotate) {
            imageData.rotate = data.rotate;
            transformed = true;
          }
        }

        if (options.scalable) {
          if (isNumber(data.scaleX) && data.scaleX !== imageData.scaleX) {
            imageData.scaleX = data.scaleX;
            transformed = true;
          }

          if (isNumber(data.scaleY) && data.scaleY !== imageData.scaleY) {
            imageData.scaleY = data.scaleY;
            transformed = true;
          }
        }

        if (transformed) {
          this.renderCanvas(true, true);
        }

        var ratio = imageData.width / imageData.naturalWidth;

        if (isNumber(data.x)) {
          cropBoxData.left = data.x * ratio + canvasData.left;
        }

        if (isNumber(data.y)) {
          cropBoxData.top = data.y * ratio + canvasData.top;
        }

        if (isNumber(data.width)) {
          cropBoxData.width = data.width * ratio;
        }

        if (isNumber(data.height)) {
          cropBoxData.height = data.height * ratio;
        }

        this.setCropBoxData(cropBoxData);
      }

      return this;
    },

    /**
     * Get the container size data.
     * @returns {Object} The result container data.
     */
    getContainerData: function getContainerData() {
      return this.ready ? assign({}, this.containerData) : {};
    },

    /**
     * Get the image position and size data.
     * @returns {Object} The result image data.
     */
    getImageData: function getImageData() {
      return this.sized ? assign({}, this.imageData) : {};
    },

    /**
     * Get the canvas position and size data.
     * @returns {Object} The result canvas data.
     */
    getCanvasData: function getCanvasData() {
      var canvasData = this.canvasData;
      var data = {};

      if (this.ready) {
        forEach(['left', 'top', 'width', 'height', 'naturalWidth', 'naturalHeight'], function (n) {
          data[n] = canvasData[n];
        });
      }

      return data;
    },

    /**
     * Set the canvas position and size with new data.
     * @param {Object} data - The new canvas data.
     * @returns {Cropper} this
     */
    setCanvasData: function setCanvasData(data) {
      var canvasData = this.canvasData;
      var aspectRatio = canvasData.aspectRatio;

      if (this.ready && !this.disabled && isPlainObject(data)) {
        if (isNumber(data.left)) {
          canvasData.left = data.left;
        }

        if (isNumber(data.top)) {
          canvasData.top = data.top;
        }

        if (isNumber(data.width)) {
          canvasData.width = data.width;
          canvasData.height = data.width / aspectRatio;
        } else if (isNumber(data.height)) {
          canvasData.height = data.height;
          canvasData.width = data.height * aspectRatio;
        }

        this.renderCanvas(true);
      }

      return this;
    },

    /**
     * Get the crop box position and size data.
     * @returns {Object} The result crop box data.
     */
    getCropBoxData: function getCropBoxData() {
      var cropBoxData = this.cropBoxData;
      var data;

      if (this.ready && this.cropped) {
        data = {
          left: cropBoxData.left,
          top: cropBoxData.top,
          width: cropBoxData.width,
          height: cropBoxData.height
        };
      }

      return data || {};
    },

    /**
     * Set the crop box position and size with new data.
     * @param {Object} data - The new crop box data.
     * @returns {Cropper} this
     */
    setCropBoxData: function setCropBoxData(data) {
      var cropBoxData = this.cropBoxData;
      var aspectRatio = this.options.aspectRatio;
      var widthChanged;
      var heightChanged;

      if (this.ready && this.cropped && !this.disabled && isPlainObject(data)) {
        if (isNumber(data.left)) {
          cropBoxData.left = data.left;
        }

        if (isNumber(data.top)) {
          cropBoxData.top = data.top;
        }

        if (isNumber(data.width) && data.width !== cropBoxData.width) {
          widthChanged = true;
          cropBoxData.width = data.width;
        }

        if (isNumber(data.height) && data.height !== cropBoxData.height) {
          heightChanged = true;
          cropBoxData.height = data.height;
        }

        if (aspectRatio) {
          if (widthChanged) {
            cropBoxData.height = cropBoxData.width / aspectRatio;
          } else if (heightChanged) {
            cropBoxData.width = cropBoxData.height * aspectRatio;
          }
        }

        this.renderCropBox();
      }

      return this;
    },

    /**
     * Get a canvas drawn the cropped image.
     * @param {Object} [options={}] - The config options.
     * @returns {HTMLCanvasElement} - The result canvas.
     */
    getCroppedCanvas: function getCroppedCanvas() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (!this.ready || !window.HTMLCanvasElement) {
        return null;
      }

      var canvasData = this.canvasData;
      var source = getSourceCanvas(this.image, this.imageData, canvasData, options); // Returns the source canvas if it is not cropped.

      if (!this.cropped) {
        return source;
      }

      var _this$getData = this.getData(),
          initialX = _this$getData.x,
          initialY = _this$getData.y,
          initialWidth = _this$getData.width,
          initialHeight = _this$getData.height;

      var ratio = source.width / Math.floor(canvasData.naturalWidth);

      if (ratio !== 1) {
        initialX *= ratio;
        initialY *= ratio;
        initialWidth *= ratio;
        initialHeight *= ratio;
      }

      var aspectRatio = initialWidth / initialHeight;
      var maxSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.maxWidth || Infinity,
        height: options.maxHeight || Infinity
      });
      var minSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.minWidth || 0,
        height: options.minHeight || 0
      }, 'cover');

      var _getAdjustedSizes = getAdjustedSizes({
        aspectRatio: aspectRatio,
        width: options.width || (ratio !== 1 ? source.width : initialWidth),
        height: options.height || (ratio !== 1 ? source.height : initialHeight)
      }),
          width = _getAdjustedSizes.width,
          height = _getAdjustedSizes.height;

      width = Math.min(maxSizes.width, Math.max(minSizes.width, width));
      height = Math.min(maxSizes.height, Math.max(minSizes.height, height));
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');
      canvas.width = normalizeDecimalNumber(width);
      canvas.height = normalizeDecimalNumber(height);
      context.fillStyle = options.fillColor || 'transparent';
      context.fillRect(0, 0, width, height);
      var _options$imageSmoothi = options.imageSmoothingEnabled,
          imageSmoothingEnabled = _options$imageSmoothi === void 0 ? true : _options$imageSmoothi,
          imageSmoothingQuality = options.imageSmoothingQuality;
      context.imageSmoothingEnabled = imageSmoothingEnabled;

      if (imageSmoothingQuality) {
        context.imageSmoothingQuality = imageSmoothingQuality;
      } // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.drawImage


      var sourceWidth = source.width;
      var sourceHeight = source.height; // Source canvas parameters

      var srcX = initialX;
      var srcY = initialY;
      var srcWidth;
      var srcHeight; // Destination canvas parameters

      var dstX;
      var dstY;
      var dstWidth;
      var dstHeight;

      if (srcX <= -initialWidth || srcX > sourceWidth) {
        srcX = 0;
        srcWidth = 0;
        dstX = 0;
        dstWidth = 0;
      } else if (srcX <= 0) {
        dstX = -srcX;
        srcX = 0;
        srcWidth = Math.min(sourceWidth, initialWidth + srcX);
        dstWidth = srcWidth;
      } else if (srcX <= sourceWidth) {
        dstX = 0;
        srcWidth = Math.min(initialWidth, sourceWidth - srcX);
        dstWidth = srcWidth;
      }

      if (srcWidth <= 0 || srcY <= -initialHeight || srcY > sourceHeight) {
        srcY = 0;
        srcHeight = 0;
        dstY = 0;
        dstHeight = 0;
      } else if (srcY <= 0) {
        dstY = -srcY;
        srcY = 0;
        srcHeight = Math.min(sourceHeight, initialHeight + srcY);
        dstHeight = srcHeight;
      } else if (srcY <= sourceHeight) {
        dstY = 0;
        srcHeight = Math.min(initialHeight, sourceHeight - srcY);
        dstHeight = srcHeight;
      }

      var params = [srcX, srcY, srcWidth, srcHeight]; // Avoid "IndexSizeError"

      if (dstWidth > 0 && dstHeight > 0) {
        var scale = width / initialWidth;
        params.push(dstX * scale, dstY * scale, dstWidth * scale, dstHeight * scale);
      } // All the numerical parameters should be integer for `drawImage`
      // https://github.com/fengyuanchen/cropper/issues/476


      context.drawImage.apply(context, [source].concat(_toConsumableArray(params.map(function (param) {
        return Math.floor(normalizeDecimalNumber(param));
      }))));
      return canvas;
    },

    /**
     * Change the aspect ratio of the crop box.
     * @param {number} aspectRatio - The new aspect ratio.
     * @returns {Cropper} this
     */
    setAspectRatio: function setAspectRatio(aspectRatio) {
      var options = this.options;

      if (!this.disabled && !isUndefined(aspectRatio)) {
        // 0 -> NaN
        options.aspectRatio = Math.max(0, aspectRatio) || NaN;

        if (this.ready) {
          this.initCropBox();

          if (this.cropped) {
            this.renderCropBox();
          }
        }
      }

      return this;
    },

    /**
     * Change the drag mode.
     * @param {string} mode - The new drag mode.
     * @returns {Cropper} this
     */
    setDragMode: function setDragMode(mode) {
      var options = this.options,
          dragBox = this.dragBox,
          face = this.face;

      if (this.ready && !this.disabled) {
        var croppable = mode === DRAG_MODE_CROP;
        var movable = options.movable && mode === DRAG_MODE_MOVE;
        mode = croppable || movable ? mode : DRAG_MODE_NONE;
        options.dragMode = mode;
        setData(dragBox, DATA_ACTION, mode);
        toggleClass(dragBox, CLASS_CROP, croppable);
        toggleClass(dragBox, CLASS_MOVE, movable);

        if (!options.cropBoxMovable) {
          // Sync drag mode to crop box when it is not movable
          setData(face, DATA_ACTION, mode);
          toggleClass(face, CLASS_CROP, croppable);
          toggleClass(face, CLASS_MOVE, movable);
        }
      }

      return this;
    }
  };

  var AnotherCropper = WINDOW.Cropper;

  var Cropper = /*#__PURE__*/function () {
    /**
     * Create a new Cropper.
     * @param {Element} element - The target element for cropping.
     * @param {Object} [options={}] - The configuration options.
     */
    function Cropper(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      _classCallCheck(this, Cropper);

      if (!element || !REGEXP_TAG_NAME.test(element.tagName)) {
        throw new Error('The first argument is required and must be an <img> or <canvas> element.');
      }

      this.element = element;
      this.options = assign({}, DEFAULTS, isPlainObject(options) && options);
      this.cropped = false;
      this.disabled = false;
      this.pointers = {};
      this.ready = false;
      this.reloading = false;
      this.replaced = false;
      this.sized = false;
      this.sizing = false;
      this.init();
    }

    _createClass(Cropper, [{
      key: "init",
      value: function init() {
        var element = this.element;
        var tagName = element.tagName.toLowerCase();
        var url;

        if (element[NAMESPACE]) {
          return;
        }

        element[NAMESPACE] = this;

        if (tagName === 'img') {
          this.isImg = true; // e.g.: "img/picture.jpg"

          url = element.getAttribute('src') || '';
          this.originalUrl = url; // Stop when it's a blank image

          if (!url) {
            return;
          } // e.g.: "https://example.com/img/picture.jpg"


          url = element.src;
        } else if (tagName === 'canvas' && window.HTMLCanvasElement) {
          url = element.toDataURL();
        }

        this.load(url);
      }
    }, {
      key: "load",
      value: function load(url) {
        var _this = this;

        if (!url) {
          return;
        }

        this.url = url;
        this.imageData = {};
        var element = this.element,
            options = this.options;

        if (!options.rotatable && !options.scalable) {
          options.checkOrientation = false;
        } // Only IE10+ supports Typed Arrays


        if (!options.checkOrientation || !window.ArrayBuffer) {
          this.clone();
          return;
        } // Detect the mime type of the image directly if it is a Data URL


        if (REGEXP_DATA_URL.test(url)) {
          // Read ArrayBuffer from Data URL of JPEG images directly for better performance
          if (REGEXP_DATA_URL_JPEG.test(url)) {
            this.read(dataURLToArrayBuffer(url));
          } else {
            // Only a JPEG image may contains Exif Orientation information,
            // the rest types of Data URLs are not necessary to check orientation at all.
            this.clone();
          }

          return;
        } // 1. Detect the mime type of the image by a XMLHttpRequest.
        // 2. Load the image as ArrayBuffer for reading orientation if its a JPEG image.


        var xhr = new XMLHttpRequest();
        var clone = this.clone.bind(this);
        this.reloading = true;
        this.xhr = xhr; // 1. Cross origin requests are only supported for protocol schemes:
        // http, https, data, chrome, chrome-extension.
        // 2. Access to XMLHttpRequest from a Data URL will be blocked by CORS policy
        // in some browsers as IE11 and Safari.

        xhr.onabort = clone;
        xhr.onerror = clone;
        xhr.ontimeout = clone;

        xhr.onprogress = function () {
          // Abort the request directly if it not a JPEG image for better performance
          if (xhr.getResponseHeader('content-type') !== MIME_TYPE_JPEG) {
            xhr.abort();
          }
        };

        xhr.onload = function () {
          _this.read(xhr.response);
        };

        xhr.onloadend = function () {
          _this.reloading = false;
          _this.xhr = null;
        }; // Bust cache when there is a "crossOrigin" property to avoid browser cache error


        if (options.checkCrossOrigin && isCrossOriginURL(url) && element.crossOrigin) {
          url = addTimestamp(url);
        }

        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';
        xhr.withCredentials = element.crossOrigin === 'use-credentials';
        xhr.send();
      }
    }, {
      key: "read",
      value: function read(arrayBuffer) {
        var options = this.options,
            imageData = this.imageData; // Reset the orientation value to its default value 1
        // as some iOS browsers will render image with its orientation

        var orientation = resetAndGetOrientation(arrayBuffer);
        var rotate = 0;
        var scaleX = 1;
        var scaleY = 1;

        if (orientation > 1) {
          // Generate a new URL which has the default orientation value
          this.url = arrayBufferToDataURL(arrayBuffer, MIME_TYPE_JPEG);

          var _parseOrientation = parseOrientation(orientation);

          rotate = _parseOrientation.rotate;
          scaleX = _parseOrientation.scaleX;
          scaleY = _parseOrientation.scaleY;
        }

        if (options.rotatable) {
          imageData.rotate = rotate;
        }

        if (options.scalable) {
          imageData.scaleX = scaleX;
          imageData.scaleY = scaleY;
        }

        this.clone();
      }
    }, {
      key: "clone",
      value: function clone() {
        var element = this.element,
            url = this.url;
        var crossOrigin = element.crossOrigin;
        var crossOriginUrl = url;

        if (this.options.checkCrossOrigin && isCrossOriginURL(url)) {
          if (!crossOrigin) {
            crossOrigin = 'anonymous';
          } // Bust cache when there is not a "crossOrigin" property (#519)


          crossOriginUrl = addTimestamp(url);
        }

        this.crossOrigin = crossOrigin;
        this.crossOriginUrl = crossOriginUrl;
        var image = document.createElement('img');

        if (crossOrigin) {
          image.crossOrigin = crossOrigin;
        }

        image.src = crossOriginUrl || url;
        image.alt = element.alt || 'The image to crop';
        this.image = image;
        image.onload = this.start.bind(this);
        image.onerror = this.stop.bind(this);
        addClass(image, CLASS_HIDE);
        element.parentNode.insertBefore(image, element.nextSibling);
      }
    }, {
      key: "start",
      value: function start() {
        var _this2 = this;

        var image = this.image;
        image.onload = null;
        image.onerror = null;
        this.sizing = true; // Match all browsers that use WebKit as the layout engine in iOS devices,
        // such as Safari for iOS, Chrome for iOS, and in-app browsers.

        var isIOSWebKit = WINDOW.navigator && /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(WINDOW.navigator.userAgent);

        var done = function done(naturalWidth, naturalHeight) {
          assign(_this2.imageData, {
            naturalWidth: naturalWidth,
            naturalHeight: naturalHeight,
            aspectRatio: naturalWidth / naturalHeight
          });
          _this2.sizing = false;
          _this2.sized = true;

          _this2.build();
        }; // Most modern browsers (excepts iOS WebKit)


        if (image.naturalWidth && !isIOSWebKit) {
          done(image.naturalWidth, image.naturalHeight);
          return;
        }

        var sizingImage = document.createElement('img');
        var body = document.body || document.documentElement;
        this.sizingImage = sizingImage;

        sizingImage.onload = function () {
          done(sizingImage.width, sizingImage.height);

          if (!isIOSWebKit) {
            body.removeChild(sizingImage);
          }
        };

        sizingImage.src = image.src; // iOS WebKit will convert the image automatically
        // with its orientation once append it into DOM (#279)

        if (!isIOSWebKit) {
          sizingImage.style.cssText = 'left:0;' + 'max-height:none!important;' + 'max-width:none!important;' + 'min-height:0!important;' + 'min-width:0!important;' + 'opacity:0;' + 'position:absolute;' + 'top:0;' + 'z-index:-1;';
          body.appendChild(sizingImage);
        }
      }
    }, {
      key: "stop",
      value: function stop() {
        var image = this.image;
        image.onload = null;
        image.onerror = null;
        image.parentNode.removeChild(image);
        this.image = null;
      }
    }, {
      key: "build",
      value: function build() {
        if (!this.sized || this.ready) {
          return;
        }

        var element = this.element,
            options = this.options,
            image = this.image; // Create cropper elements

        var container = element.parentNode;
        var template = document.createElement('div');
        template.innerHTML = TEMPLATE;
        var cropper = template.querySelector(".".concat(NAMESPACE, "-container"));
        var canvas = cropper.querySelector(".".concat(NAMESPACE, "-canvas"));
        var dragBox = cropper.querySelector(".".concat(NAMESPACE, "-drag-box"));
        var cropBox = cropper.querySelector(".".concat(NAMESPACE, "-crop-box"));
        var face = cropBox.querySelector(".".concat(NAMESPACE, "-face"));
        this.container = container;
        this.cropper = cropper;
        this.canvas = canvas;
        this.dragBox = dragBox;
        this.cropBox = cropBox;
        this.viewBox = cropper.querySelector(".".concat(NAMESPACE, "-view-box"));
        this.face = face;
        canvas.appendChild(image); // Hide the original image

        addClass(element, CLASS_HIDDEN); // Inserts the cropper after to the current image

        container.insertBefore(cropper, element.nextSibling); // Show the image if is hidden

        if (!this.isImg) {
          removeClass(image, CLASS_HIDE);
        }

        this.initPreview();
        this.bind();
        options.initialAspectRatio = Math.max(0, options.initialAspectRatio) || NaN;
        options.aspectRatio = Math.max(0, options.aspectRatio) || NaN;
        options.viewMode = Math.max(0, Math.min(3, Math.round(options.viewMode))) || 0;
        addClass(cropBox, CLASS_HIDDEN);

        if (!options.guides) {
          addClass(cropBox.getElementsByClassName("".concat(NAMESPACE, "-dashed")), CLASS_HIDDEN);
        }

        if (!options.center) {
          addClass(cropBox.getElementsByClassName("".concat(NAMESPACE, "-center")), CLASS_HIDDEN);
        }

        if (options.background) {
          addClass(cropper, "".concat(NAMESPACE, "-bg"));
        }

        if (!options.highlight) {
          addClass(face, CLASS_INVISIBLE);
        }

        if (options.cropBoxMovable) {
          addClass(face, CLASS_MOVE);
          setData(face, DATA_ACTION, ACTION_ALL);
        }

        if (!options.cropBoxResizable) {
          addClass(cropBox.getElementsByClassName("".concat(NAMESPACE, "-line")), CLASS_HIDDEN);
          addClass(cropBox.getElementsByClassName("".concat(NAMESPACE, "-point")), CLASS_HIDDEN);
        }

        this.render();
        this.ready = true;
        this.setDragMode(options.dragMode);

        if (options.autoCrop) {
          this.crop();
        }

        this.setData(options.data);

        if (isFunction(options.ready)) {
          addListener(element, EVENT_READY, options.ready, {
            once: true
          });
        }

        dispatchEvent(element, EVENT_READY);
      }
    }, {
      key: "unbuild",
      value: function unbuild() {
        if (!this.ready) {
          return;
        }

        this.ready = false;
        this.unbind();
        this.resetPreview();
        this.cropper.parentNode.removeChild(this.cropper);
        removeClass(this.element, CLASS_HIDDEN);
      }
    }, {
      key: "uncreate",
      value: function uncreate() {
        if (this.ready) {
          this.unbuild();
          this.ready = false;
          this.cropped = false;
        } else if (this.sizing) {
          this.sizingImage.onload = null;
          this.sizing = false;
          this.sized = false;
        } else if (this.reloading) {
          this.xhr.onabort = null;
          this.xhr.abort();
        } else if (this.image) {
          this.stop();
        }
      }
      /**
       * Get the no conflict cropper class.
       * @returns {Cropper} The cropper class.
       */

    }], [{
      key: "noConflict",
      value: function noConflict() {
        window.Cropper = AnotherCropper;
        return Cropper;
      }
      /**
       * Change the default options.
       * @param {Object} options - The new default options.
       */

    }, {
      key: "setDefaults",
      value: function setDefaults(options) {
        assign(DEFAULTS, isPlainObject(options) && options);
      }
    }]);

    return Cropper;
  }();

  assign(Cropper.prototype, render, preview, events, handlers, change, methods);

  return Cropper;

})));

},{}],6:[function(require,module,exports){
(function (process,global,Buffer){(function (){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define("exifr",["exports"],t):t((e="undefined"!=typeof globalThis?globalThis:e||self).exifr={})}(this,(function(e){"use strict";function t(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function r(e,t,r){return t&&n(e.prototype,t),r&&n(e,r),e}function i(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}});var n=["prototype","__proto__","caller","arguments","length","name"];Object.getOwnPropertyNames(t).forEach((function(r){-1===n.indexOf(r)&&e[r]!==t[r]&&(e[r]=t[r])})),t&&u(e,t)}function s(e){return(s=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function u(e,t){return(u=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function o(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function f(e,t,n){return(f=o()?Reflect.construct:function(e,t,n){var r=[null];r.push.apply(r,t);var i=new(Function.bind.apply(e,r));return n&&u(i,n.prototype),i}).apply(null,arguments)}function c(e){var t="function"==typeof Map?new Map:void 0;return(c=function(e){if(null===e||(n=e,-1===Function.toString.call(n).indexOf("[native code]")))return e;var n;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(e))return t.get(e);t.set(e,r)}function r(){return f(e,arguments,s(this).constructor)}return r.prototype=Object.create(e.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),u(r,e)})(e)}function h(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function l(e,t){return!t||"object"!=typeof t&&"function"!=typeof t?h(e):t}function d(e){var t=o();return function(){var n,r=s(e);if(t){var i=s(this).constructor;n=Reflect.construct(r,arguments,i)}else n=r.apply(this,arguments);return l(this,n)}}function v(e,t,n){return(v="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var r=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=s(e)););return e}(e,t);if(r){var i=Object.getOwnPropertyDescriptor(r,t);return i.get?i.get.call(n):i.value}})(e,t,n||e)}var p=Object.values||function(e){var t=[];for(var n in e)t.push(e[n]);return t},y=Object.entries||function(e){var t=[];for(var n in e)t.push([n,e[n]]);return t},g=Object.assign||function(e){for(var t=arguments.length,n=new Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];return n.forEach((function(t){for(var n in t)e[n]=t[n]})),e},k=Object.fromEntries||function(e){var t={};return m(e).forEach((function(e){var n=e[0],r=e[1];t[n]=r})),t},m=Array.from||function(e){if(e instanceof P){var t=[];return e.forEach((function(e,n){return t.push([n,e])})),t}return Array.prototype.slice.call(e)};function b(e){return-1!==this.indexOf(e)}Array.prototype.includes||(Array.prototype.includes=b),String.prototype.includes||(String.prototype.includes=b),String.prototype.startsWith||(String.prototype.startsWith=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;return this.substring(t,t+e.length)===e}),String.prototype.endsWith||(String.prototype.endsWith=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.length;return this.substring(t-e.length,t)===e});var A="undefined"!=typeof self?self:global,w=A.fetch||function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return new Promise((function(n,r){var i=new XMLHttpRequest;if(i.open("get",e,!0),i.responseType="arraybuffer",i.onerror=r,t.headers)for(var a in t.headers)i.setRequestHeader(a,t.headers[a]);i.onload=function(){n({ok:i.status>=200&&i.status<300,status:i.status,arrayBuffer:function(){return Promise.resolve(i.response)}})},i.send(null)}))},O=function(e){var t=[];if(Object.defineProperties(t,{size:{get:function(){return this.length}},has:{value:function(e){return-1!==this.indexOf(e)}},add:{value:function(e){this.has(e)||this.push(e)}},delete:{value:function(e){if(this.has(e)){var t=this.indexOf(e);this.splice(t,1)}}}}),Array.isArray(e))for(var n=0;n<e.length;n++)t.add(e[n]);return t},S=function(e){return new P(e)},P=void 0!==A.Map&&void 0!==A.Map.prototype.keys?A.Map:function(){function e(n){if(t(this,e),this.clear(),n)for(var r=0;r<n.length;r++)this.set(n[r][0],n[r][1])}return r(e,[{key:"clear",value:function(){this._map={},this._keys=[]}},{key:"size",get:function(){return this._keys.length}},{key:"get",value:function(e){return this._map["map_"+e]}},{key:"set",value:function(e,t){return this._map["map_"+e]=t,this._keys.indexOf(e)<0&&this._keys.push(e),this}},{key:"has",value:function(e){return this._keys.indexOf(e)>=0}},{key:"delete",value:function(e){var t=this._keys.indexOf(e);return!(t<0)&&(delete this._map["map_"+e],this._keys.splice(t,1),!0)}},{key:"keys",value:function(){return this._keys.slice(0)}},{key:"values",value:function(){var e=this;return this._keys.map((function(t){return e.get(t)}))}},{key:"entries",value:function(){var e=this;return this._keys.map((function(t){return[t,e.get(t)]}))}},{key:"forEach",value:function(e,t){for(var n=0;n<this._keys.length;n++)e.call(t,this._map["map_"+this._keys[n]],this._keys[n],this)}}]),e}(),U="undefined"!=typeof self?self:global,x="undefined"!=typeof navigator,C=x&&"undefined"==typeof HTMLImageElement,B=!("undefined"==typeof global||"undefined"==typeof process||!process.versions||!process.versions.node),j=U.Buffer,_=!!j;var V=function(e){return void 0!==e};function I(e){return void 0===e||(e instanceof P?0===e.size:0===p(e).filter(V).length)}function L(e){var t=new Error(e);throw delete t.stack,t}function T(e){var t=function(e){var t=0;return e.ifd0.enabled&&(t+=1024),e.exif.enabled&&(t+=2048),e.makerNote&&(t+=2048),e.userComment&&(t+=1024),e.gps.enabled&&(t+=512),e.interop.enabled&&(t+=100),e.ifd1.enabled&&(t+=1024),t+2048}(e);return e.jfif.enabled&&(t+=50),e.xmp.enabled&&(t+=2e4),e.iptc.enabled&&(t+=14e3),e.icc.enabled&&(t+=6e3),t}var z=function(e){return String.fromCharCode.apply(null,e)},F="undefined"!=typeof TextDecoder?new TextDecoder("utf-8"):void 0;function E(e){return F?F.decode(e):_?Buffer.from(e).toString("utf8"):decodeURIComponent(escape(z(e)))}var D=function(){function e(n){var r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,i=arguments.length>2?arguments[2]:void 0,a=arguments.length>3?arguments[3]:void 0;if(t(this,e),"boolean"==typeof a&&(this.le=a),Array.isArray(n)&&(n=new Uint8Array(n)),0===n)this.byteOffset=0,this.byteLength=0;else if(n instanceof ArrayBuffer){void 0===i&&(i=n.byteLength-r);var s=new DataView(n,r,i);this._swapDataView(s)}else if(n instanceof Uint8Array||n instanceof DataView||n instanceof e){void 0===i&&(i=n.byteLength-r),(r+=n.byteOffset)+i>n.byteOffset+n.byteLength&&L("Creating view outside of available memory in ArrayBuffer");var u=new DataView(n.buffer,r,i);this._swapDataView(u)}else if("number"==typeof n){var o=new DataView(new ArrayBuffer(n));this._swapDataView(o)}else L("Invalid input argument for BufferView: "+n)}return r(e,[{key:"_swapArrayBuffer",value:function(e){this._swapDataView(new DataView(e))}},{key:"_swapBuffer",value:function(e){this._swapDataView(new DataView(e.buffer,e.byteOffset,e.byteLength))}},{key:"_swapDataView",value:function(e){this.dataView=e,this.buffer=e.buffer,this.byteOffset=e.byteOffset,this.byteLength=e.byteLength}},{key:"_lengthToEnd",value:function(e){return this.byteLength-e}},{key:"set",value:function(t,n){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e;t instanceof DataView||t instanceof e?t=new Uint8Array(t.buffer,t.byteOffset,t.byteLength):t instanceof ArrayBuffer&&(t=new Uint8Array(t)),t instanceof Uint8Array||L("BufferView.set(): Invalid data argument.");var i=this.toUint8();return i.set(t,n),new r(this,n,t.byteLength)}},{key:"subarray",value:function(t,n){return new e(this,t,n=n||this._lengthToEnd(t))}},{key:"toUint8",value:function(){return new Uint8Array(this.buffer,this.byteOffset,this.byteLength)}},{key:"getUint8Array",value:function(e,t){return new Uint8Array(this.buffer,this.byteOffset+e,t)}},{key:"getString",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.byteLength,n=this.getUint8Array(e,t);return E(n)}},{key:"getLatin1String",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.byteLength,n=this.getUint8Array(e,t);return z(n)}},{key:"getUnicodeString",value:function(){for(var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.byteLength,n=[],r=0;r<t&&e+r<this.byteLength;r+=2)n.push(this.getUint16(e+r));return z(n)}},{key:"getInt8",value:function(e){return this.dataView.getInt8(e)}},{key:"getUint8",value:function(e){return this.dataView.getUint8(e)}},{key:"getInt16",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.le;return this.dataView.getInt16(e,t)}},{key:"getInt32",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.le;return this.dataView.getInt32(e,t)}},{key:"getUint16",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.le;return this.dataView.getUint16(e,t)}},{key:"getUint32",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.le;return this.dataView.getUint32(e,t)}},{key:"getFloat32",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.le;return this.dataView.getFloat32(e,t)}},{key:"getFloat64",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.le;return this.dataView.getFloat64(e,t)}},{key:"getFloat",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.le;return this.dataView.getFloat32(e,t)}},{key:"getDouble",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this.le;return this.dataView.getFloat64(e,t)}},{key:"getUintBytes",value:function(e,t,n){switch(t){case 1:return this.getUint8(e,n);case 2:return this.getUint16(e,n);case 4:return this.getUint32(e,n);case 8:return this.getUint64&&this.getUint64(e,n)}}},{key:"getUint",value:function(e,t,n){switch(t){case 8:return this.getUint8(e,n);case 16:return this.getUint16(e,n);case 32:return this.getUint32(e,n);case 64:return this.getUint64&&this.getUint64(e,n)}}},{key:"toString",value:function(e){return this.dataView.toString(e,this.constructor.name)}},{key:"ensureChunk",value:function(){}}],[{key:"from",value:function(t,n){return t instanceof this&&t.le===n?t:new e(t,void 0,void 0,n)}}]),e}();function R(e,t){L("".concat(e," '").concat(t,"' was not loaded, try using full build of exifr."))}var N=function(e){a(i,e);var n=d(i);function i(e){var r;return t(this,i),(r=n.call(this)).kind=e,r}return r(i,[{key:"get",value:function(e,t){return this.has(e)||R(this.kind,e),t&&(e in t||function(e,t){L("Unknown ".concat(e," '").concat(t,"'."))}(this.kind,e),t[e].enabled||R(this.kind,e)),v(s(i.prototype),"get",this).call(this,e)}},{key:"keyList",value:function(){return m(this.keys())}}]),i}(c(P)),M=new N("file parser"),W=new N("segment parser"),K=new N("file reader");function H(e){return function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];try{return Promise.resolve(e.apply(this,t))}catch(e){return Promise.reject(e)}}}function X(e,t,n){return n?t?t(e):e:(e&&e.then||(e=Promise.resolve(e)),t?e.then(t):e)}var Y=H((function(e){return new Promise((function(t,n){var r=new FileReader;r.onloadend=function(){return t(r.result||new ArrayBuffer)},r.onerror=n,r.readAsArrayBuffer(e)}))})),G=H((function(e){return w(e).then((function(e){return e.arrayBuffer()}))})),J=H((function(e,t){return X(t(e),(function(e){return new D(e)}))})),q=H((function(e,t,n){var r=new(K.get(n))(e,t);return X(r.read(),(function(){return r}))})),Q=H((function(e,t,n,r){return K.has(n)?q(e,t,n):r?J(e,r):(L("Parser ".concat(n," is not loaded")),X())})),Z="Invalid input argument";function $(e,t){return(n=e).startsWith("data:")||n.length>1e4?q(e,t,"base64"):x?Q(e,t,"url",G):B?q(e,t,"fs"):void L(Z);var n}var ee=function(e){a(i,e);var n=d(i);function i(){return t(this,i),n.apply(this,arguments)}return r(i,[{key:"tagKeys",get:function(){return this.allKeys||(this.allKeys=m(this.keys())),this.allKeys}},{key:"tagValues",get:function(){return this.allValues||(this.allValues=m(this.values())),this.allValues}}]),i}(c(P));function te(e,t,n){var r=new ee,i=n;Array.isArray(i)||("function"==typeof i.entries&&(i=i.entries()),i=m(i));for(var a=0;a<i.length;a++){var s=i[a],u=s[0],o=s[1];r.set(u,o)}if(Array.isArray(t)){var f=t;Array.isArray(f)||("function"==typeof f.entries&&(f=f.entries()),f=m(f));for(var c=0;c<f.length;c++){var h=f[c];e.set(h,r)}}else e.set(t,r);return r}function ne(e,t,n){var r,i=e.get(t),a=n;Array.isArray(a)||("function"==typeof a.entries&&(a=a.entries()),a=m(a));for(var s=0;s<a.length;s++)r=a[s],i.set(r[0],r[1])}var re=S(),ie=S(),ae=S(),se=37500,ue=37510,oe=33723,fe=34675,ce=34665,he=34853,le=40965,de=["chunked","firstChunkSize","firstChunkSizeNode","firstChunkSizeBrowser","chunkSize","chunkLimit"],ve=["jfif","xmp","icc","iptc","ihdr"],pe=["tiff"].concat(ve),ye=["ifd0","ifd1","exif","gps","interop"],ge=[].concat(pe,ye),ke=["makerNote","userComment"],me=["translateKeys","translateValues","reviveValues","multiSegment"],be=[].concat(me,["sanitize","mergeOutput","silentErrors"]),Ae=function(){function e(){t(this,e)}return r(e,[{key:"translate",get:function(){return this.translateKeys||this.translateValues||this.reviveValues}}]),e}(),we=function(e){a(s,e);var n=d(s);function s(e,r,a,u){var o;if(t(this,s),i(h(o=n.call(this)),"enabled",!1),i(h(o),"skip",O()),i(h(o),"pick",O()),i(h(o),"deps",O()),i(h(o),"translateKeys",!1),i(h(o),"translateValues",!1),i(h(o),"reviveValues",!1),o.key=e,o.enabled=r,o.parse=o.enabled,o.applyInheritables(u),o.canBeFiltered=ye.includes(e),o.canBeFiltered&&(o.dict=re.get(e)),void 0!==a)if(Array.isArray(a))o.parse=o.enabled=!0,o.canBeFiltered&&a.length>0&&o.translateTagSet(a,o.pick);else if("object"==typeof a){if(o.enabled=!0,o.parse=!1!==a.parse,o.canBeFiltered){var f=a.pick,c=a.skip;f&&f.length>0&&o.translateTagSet(f,o.pick),c&&c.length>0&&o.translateTagSet(c,o.skip)}o.applyInheritables(a)}else!0===a||!1===a?o.parse=o.enabled=a:L("Invalid options argument: ".concat(a));return o}return r(s,[{key:"needed",get:function(){return this.enabled||this.deps.size>0}},{key:"applyInheritables",value:function(e){var t,n,r=me;Array.isArray(r)||("function"==typeof r.entries&&(r=r.entries()),r=m(r));for(var i=0;i<r.length;i++)void 0!==(n=e[t=r[i]])&&(this[t]=n)}},{key:"translateTagSet",value:function(e,t){if(this.dict){var n,r,i=this.dict,a=i.tagKeys,s=i.tagValues,u=e;Array.isArray(u)||("function"==typeof u.entries&&(u=u.entries()),u=m(u));for(var o=0;o<u.length;o++)"string"==typeof(n=u[o])?(-1===(r=s.indexOf(n))&&(r=a.indexOf(Number(n))),-1!==r&&t.add(Number(a[r]))):t.add(n)}else{var f=e;Array.isArray(f)||("function"==typeof f.entries&&(f=f.entries()),f=m(f));for(var c=0;c<f.length;c++){var h=f[c];t.add(h)}}}},{key:"finalizeFilters",value:function(){!this.enabled&&this.deps.size>0?(this.enabled=!0,Ce(this.pick,this.deps)):this.enabled&&this.pick.size>0&&Ce(this.pick,this.deps)}}]),s}(Ae),Oe={jfif:!1,tiff:!0,xmp:!1,icc:!1,iptc:!1,ifd0:!0,ifd1:!1,exif:!0,gps:!0,interop:!1,ihdr:void 0,makerNote:!1,userComment:!1,multiSegment:!1,skip:[],pick:[],translateKeys:!0,translateValues:!0,reviveValues:!0,sanitize:!0,mergeOutput:!0,silentErrors:!0,chunked:!0,firstChunkSize:void 0,firstChunkSizeNode:512,firstChunkSizeBrowser:65536,chunkSize:65536,chunkLimit:5},Se=S(),Pe=function(e){a(i,e);var n=d(i);function i(e){var r;return t(this,i),r=n.call(this),!0===e?r.setupFromTrue():void 0===e?r.setupFromUndefined():Array.isArray(e)?r.setupFromArray(e):"object"==typeof e?r.setupFromObject(e):L("Invalid options argument ".concat(e)),void 0===r.firstChunkSize&&(r.firstChunkSize=x?r.firstChunkSizeBrowser:r.firstChunkSizeNode),r.mergeOutput&&(r.ifd1.enabled=!1),r.filterNestedSegmentTags(),r.traverseTiffDependencyTree(),r.checkLoadedPlugins(),r}return r(i,[{key:"setupFromUndefined",value:function(){var e,t=de;Array.isArray(t)||("function"==typeof t.entries&&(t=t.entries()),t=m(t));for(var n=0;n<t.length;n++)this[e=t[n]]=Oe[e];var r=be;Array.isArray(r)||("function"==typeof r.entries&&(r=r.entries()),r=m(r));for(var i=0;i<r.length;i++)this[e=r[i]]=Oe[e];var a=ke;Array.isArray(a)||("function"==typeof a.entries&&(a=a.entries()),a=m(a));for(var s=0;s<a.length;s++)this[e=a[s]]=Oe[e];var u=ge;Array.isArray(u)||("function"==typeof u.entries&&(u=u.entries()),u=m(u));for(var o=0;o<u.length;o++)this[e=u[o]]=new we(e,Oe[e],void 0,this)}},{key:"setupFromTrue",value:function(){var e,t=de;Array.isArray(t)||("function"==typeof t.entries&&(t=t.entries()),t=m(t));for(var n=0;n<t.length;n++)this[e=t[n]]=Oe[e];var r=be;Array.isArray(r)||("function"==typeof r.entries&&(r=r.entries()),r=m(r));for(var i=0;i<r.length;i++)this[e=r[i]]=Oe[e];var a=ke;Array.isArray(a)||("function"==typeof a.entries&&(a=a.entries()),a=m(a));for(var s=0;s<a.length;s++)this[e=a[s]]=!0;var u=ge;Array.isArray(u)||("function"==typeof u.entries&&(u=u.entries()),u=m(u));for(var o=0;o<u.length;o++)this[e=u[o]]=new we(e,!0,void 0,this)}},{key:"setupFromArray",value:function(e){var t,n=de;Array.isArray(n)||("function"==typeof n.entries&&(n=n.entries()),n=m(n));for(var r=0;r<n.length;r++)this[t=n[r]]=Oe[t];var i=be;Array.isArray(i)||("function"==typeof i.entries&&(i=i.entries()),i=m(i));for(var a=0;a<i.length;a++)this[t=i[a]]=Oe[t];var s=ke;Array.isArray(s)||("function"==typeof s.entries&&(s=s.entries()),s=m(s));for(var u=0;u<s.length;u++)this[t=s[u]]=Oe[t];var o=ge;Array.isArray(o)||("function"==typeof o.entries&&(o=o.entries()),o=m(o));for(var f=0;f<o.length;f++)this[t=o[f]]=new we(t,!1,void 0,this);this.setupGlobalFilters(e,void 0,ye)}},{key:"setupFromObject",value:function(e){var t;ye.ifd0=ye.ifd0||ye.image,ye.ifd1=ye.ifd1||ye.thumbnail,g(this,e);var n=de;Array.isArray(n)||("function"==typeof n.entries&&(n=n.entries()),n=m(n));for(var r=0;r<n.length;r++)this[t=n[r]]=xe(e[t],Oe[t]);var i=be;Array.isArray(i)||("function"==typeof i.entries&&(i=i.entries()),i=m(i));for(var a=0;a<i.length;a++)this[t=i[a]]=xe(e[t],Oe[t]);var s=ke;Array.isArray(s)||("function"==typeof s.entries&&(s=s.entries()),s=m(s));for(var u=0;u<s.length;u++)this[t=s[u]]=xe(e[t],Oe[t]);var o=pe;Array.isArray(o)||("function"==typeof o.entries&&(o=o.entries()),o=m(o));for(var f=0;f<o.length;f++)this[t=o[f]]=new we(t,Oe[t],e[t],this);var c=ye;Array.isArray(c)||("function"==typeof c.entries&&(c=c.entries()),c=m(c));for(var h=0;h<c.length;h++)this[t=c[h]]=new we(t,Oe[t],e[t],this.tiff);this.setupGlobalFilters(e.pick,e.skip,ye,ge),!0===e.tiff?this.batchEnableWithBool(ye,!0):!1===e.tiff?this.batchEnableWithUserValue(ye,e):Array.isArray(e.tiff)?this.setupGlobalFilters(e.tiff,void 0,ye):"object"==typeof e.tiff&&this.setupGlobalFilters(e.tiff.pick,e.tiff.skip,ye)}},{key:"batchEnableWithBool",value:function(e,t){var n=e;Array.isArray(n)||("function"==typeof n.entries&&(n=n.entries()),n=m(n));for(var r=0;r<n.length;r++){this[n[r]].enabled=t}}},{key:"batchEnableWithUserValue",value:function(e,t){var n=e;Array.isArray(n)||("function"==typeof n.entries&&(n=n.entries()),n=m(n));for(var r=0;r<n.length;r++){var i=n[r],a=t[i];this[i].enabled=!1!==a&&void 0!==a}}},{key:"setupGlobalFilters",value:function(e,t,n){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:n;if(e&&e.length){var i=r;Array.isArray(i)||("function"==typeof i.entries&&(i=i.entries()),i=m(i));for(var a=0;a<i.length;a++){var s=i[a];this[s].enabled=!1}var u=Ue(e,n),o=u;Array.isArray(o)||("function"==typeof o.entries&&(o=o.entries()),o=m(o));for(var f=0;f<o.length;f++){var c=o[f],h=c[0],l=c[1];Ce(this[h].pick,l),this[h].enabled=!0}}else if(t&&t.length){var d=Ue(t,n),v=d;Array.isArray(v)||("function"==typeof v.entries&&(v=v.entries()),v=m(v));for(var p=0;p<v.length;p++){var y=v[p],g=y[0],k=y[1];Ce(this[g].skip,k)}}}},{key:"filterNestedSegmentTags",value:function(){var e=this.ifd0,t=this.exif,n=this.xmp,r=this.iptc,i=this.icc;this.makerNote?t.deps.add(se):t.skip.add(se),this.userComment?t.deps.add(ue):t.skip.add(ue),n.enabled||e.skip.add(700),r.enabled||e.skip.add(oe),i.enabled||e.skip.add(fe)}},{key:"traverseTiffDependencyTree",value:function(){var e=this,t=this.ifd0,n=this.exif,r=this.gps;this.interop.needed&&(n.deps.add(le),t.deps.add(le)),n.needed&&t.deps.add(ce),r.needed&&t.deps.add(he),this.tiff.enabled=ye.some((function(t){return!0===e[t].enabled}))||this.makerNote||this.userComment;var i=ye;Array.isArray(i)||("function"==typeof i.entries&&(i=i.entries()),i=m(i));for(var a=0;a<i.length;a++){this[i[a]].finalizeFilters()}}},{key:"onlyTiff",get:function(){var e=this;return!ve.map((function(t){return e[t].enabled})).some((function(e){return!0===e}))&&this.tiff.enabled}},{key:"checkLoadedPlugins",value:function(){var e=pe;Array.isArray(e)||("function"==typeof e.entries&&(e=e.entries()),e=m(e));for(var t=0;t<e.length;t++){var n=e[t];this[n].enabled&&!W.has(n)&&R("segment parser",n)}}}],[{key:"useCached",value:function(e){var t=Se.get(e);return void 0!==t||(t=new this(e),Se.set(e,t)),t}}]),i}(Ae);function Ue(e,t){var n,r,i,a=[],s=t;Array.isArray(s)||("function"==typeof s.entries&&(s=s.entries()),s=m(s));for(var u=0;u<s.length;u++){r=s[u],n=[];var o=re.get(r);Array.isArray(o)||("function"==typeof o.entries&&(o=o.entries()),o=m(o));for(var f=0;f<o.length;f++)i=o[f],(e.includes(i[0])||e.includes(i[1]))&&n.push(i[0]);n.length&&a.push([r,n])}return a}function xe(e,t){return void 0!==e?e:void 0!==t?t:void 0}function Ce(e,t){var n=t;Array.isArray(n)||("function"==typeof n.entries&&(n=n.entries()),n=m(n));for(var r=0;r<n.length;r++){var i=n[r];e.add(i)}}function Be(e,t,n){return n?t?t(e):e:(e&&e.then||(e=Promise.resolve(e)),t?e.then(t):e)}function je(){}function _e(e,t){if(!t)return e&&e.then?e.then(je):Promise.resolve()}function Ve(e,t){var n=e();return n&&n.then?n.then(t):t(n)}i(Pe,"default",Oe);var Ie=function(){function e(n){t(this,e),i(this,"parsers",{}),this.options=Pe.useCached(n)}return r(e,[{key:"setup",value:function(){if(!this.fileParser){var e=this.file,t=e.getUint16(0),n=M;Array.isArray(n)||("function"==typeof n.entries&&(n=n.entries()),n=m(n));for(var r=0;r<n.length;r++){var i=n[r],a=i[0],s=i[1];if(s.canHandle(e,t))return this.fileParser=new s(this.options,this.file,this.parsers),e[a]=!0}L("Unknown file format")}}},{key:"read",value:function(e){try{var t=this;return Be(function(e,t){return"string"==typeof e?$(e,t):x&&!C&&e instanceof HTMLImageElement?$(e.src,t):e instanceof Uint8Array||e instanceof ArrayBuffer||e instanceof DataView?new D(e):x&&e instanceof Blob?Q(e,t,"blob",Y):void L(Z)}(e,t.options),(function(e){t.file=e}))}catch(e){return Promise.reject(e)}}},{key:"parse",value:function(){try{var e=this;e.setup();var t={},n=[];return Ve((function(){return e.options.silentErrors?Be(e.doParse(t,n).catch((function(e){return n.push(e)})),(function(){n.push.apply(n,e.fileParser.errors)})):_e(e.doParse(t,n))}),(function(){return e.file.close&&e.file.close(),e.options.silentErrors&&n.length>0&&(t.errors=n),I(r=t)?void 0:r;var r}))}catch(e){return Promise.reject(e)}}},{key:"doParse",value:function(e,t){try{var n=this;return Be(n.fileParser.parse(),(function(){var r,i=p(n.parsers).map((r=function(t){return Be(t.parse(),(function(n){t.assignToOutput(e,n)}))},function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];try{return Promise.resolve(r.apply(this,e))}catch(e){return Promise.reject(e)}}));if(n.options.silentErrors){var a=function(e){return t.push(e)};i=i.map((function(e){return e.catch(a)}))}return _e(Promise.all(i))}))}catch(e){return Promise.reject(e)}}},{key:"extractThumbnail",value:function(){try{var e=this;e.setup();var t,n=e.options,r=e.file,i=W.get("tiff",n);return Ve((function(){if(!r.tiff)return function(e){var t=e();if(t&&t.then)return t.then(je)}((function(){if(r.jpeg)return Be(e.fileParser.getOrFindSegment("tiff"),(function(e){t=e}))}));t={start:0,type:"tiff"}}),(function(){if(void 0!==t)return Be(e.fileParser.ensureSegmentChunk(t),(function(t){return Be((e.parsers.tiff=new i(t,n,r)).extractThumbnail(),(function(e){return r.close&&r.close(),e}))}))}))}catch(e){return Promise.reject(e)}}}]),e}();var Le,Te=(Le=function(e,t){var n,r,i,a=new Ie(t);return n=a.read(e),r=function(){return a.parse()},i?r?r(n):n:(n&&n.then||(n=Promise.resolve(n)),r?n.then(r):n)},function(){for(var e=[],t=0;t<arguments.length;t++)e[t]=arguments[t];try{return Promise.resolve(Le.apply(this,e))}catch(e){return Promise.reject(e)}}),ze=Object.freeze({__proto__:null,parse:Te,Exifr:Ie,fileParsers:M,segmentParsers:W,fileReaders:K,tagKeys:re,tagValues:ie,tagRevivers:ae,createDictionary:te,extendDictionary:ne,fetchUrlAsArrayBuffer:G,readBlobAsArrayBuffer:Y,chunkedProps:de,otherSegments:ve,segments:pe,tiffBlocks:ye,segmentsAndBlocks:ge,tiffExtractables:ke,inheritables:me,allFormatters:be,Options:Pe});function Fe(){}var Ee=function(){function e(n,r,a){var s=this;t(this,e),i(this,"errors",[]),i(this,"ensureSegmentChunk",function(e){return function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];try{return Promise.resolve(e.apply(this,t))}catch(e){return Promise.reject(e)}}}((function(e){var t,n,r,i=e.start,a=e.size||65536;return t=function(){if(s.file.chunked)return function(e){var t=e();if(t&&t.then)return t.then(Fe)}((function(){if(!s.file.available(i,a))return function(e){if(e&&e.then)return e.then(Fe)}(function(e,t){try{var n=e()}catch(e){return t(e)}return n&&n.then?n.then(void 0,t):n}((function(){return t=s.file.readChunk(i,a),n=function(t){e.chunk=t},r?n?n(t):t:(t&&t.then||(t=Promise.resolve(t)),n?t.then(n):t);var t,n,r}),(function(t){L("Couldn't read segment: ".concat(JSON.stringify(e),". ").concat(t.message))})));e.chunk=s.file.subarray(i,a)}));s.file.byteLength>i+a?e.chunk=s.file.subarray(i,a):void 0===e.size?e.chunk=s.file.subarray(i):L("Segment unreachable: "+JSON.stringify(e))},n=function(){return e.chunk},(r=t())&&r.then?r.then(n):n(r)}))),this.extendOptions&&this.extendOptions(n),this.options=n,this.file=r,this.parsers=a}return r(e,[{key:"injectSegment",value:function(e,t){this.options[e].enabled&&this.createParser(e,t)}},{key:"createParser",value:function(e,t){var n=new(W.get(e))(t,this.options,this.file);return this.parsers[e]=n}},{key:"createParsers",value:function(e){var t=e;Array.isArray(t)||("function"==typeof t.entries&&(t=t.entries()),t=m(t));for(var n=0;n<t.length;n++){var r=t[n],i=r.type,a=r.chunk,s=this.options[i];if(s&&s.enabled){var u=this.parsers[i];u&&u.append||u||this.createParser(i,a)}}}},{key:"readSegments",value:function(e){try{var t=e.map(this.ensureSegmentChunk);return function(e,t){if(!t)return e&&e.then?e.then(Fe):Promise.resolve()}(Promise.all(t))}catch(e){return Promise.reject(e)}}}]),e}(),De=function(){function e(n){var r=this,a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},s=arguments.length>2?arguments[2]:void 0;t(this,e),i(this,"errors",[]),i(this,"raw",S()),i(this,"handleError",(function(e){if(!r.options.silentErrors)throw e;r.errors.push(e.message)})),this.chunk=this.normalizeInput(n),this.file=s,this.type=this.constructor.type,this.globalOptions=this.options=a,this.localOptions=a[this.type],this.canTranslate=this.localOptions&&this.localOptions.translate}return r(e,[{key:"normalizeInput",value:function(e){return e instanceof D?e:new D(e)}},{key:"translate",value:function(){this.canTranslate&&(this.translated=this.translateBlock(this.raw,this.type))}},{key:"output",get:function(){return this.translated?this.translated:this.raw?k(this.raw):void 0}},{key:"translateBlock",value:function(e,t){var n=ae.get(t),r=ie.get(t),i=re.get(t),a=this.options[t],s=a.reviveValues&&!!n,u=a.translateValues&&!!r,o=a.translateKeys&&!!i,f={},c=e;Array.isArray(c)||("function"==typeof c.entries&&(c=c.entries()),c=m(c));for(var h=0;h<c.length;h++){var l=c[h],d=l[0],v=l[1];s&&n.has(d)?v=n.get(d)(v):u&&r.has(d)&&(v=this.translateValue(v,r.get(d))),o&&i.has(d)&&(d=i.get(d)||d),f[d]=v}return f}},{key:"translateValue",value:function(e,t){return t[e]||t.DEFAULT||e}},{key:"assignToOutput",value:function(e,t){this.assignObjectToOutput(e,this.constructor.type,t)}},{key:"assignObjectToOutput",value:function(e,t,n){if(this.globalOptions.mergeOutput)return g(e,n);e[t]?g(e[t],n):e[t]=n}}],[{key:"findPosition",value:function(e,t){var n=e.getUint16(t+2)+2,r="function"==typeof this.headerLength?this.headerLength(e,t,n):this.headerLength,i=t+r,a=n-r;return{offset:t,length:n,headerLength:r,start:i,size:a,end:i+a}}},{key:"parse",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=new Pe(i({},this.type,t)),r=new this(e,n);return r.parse()}}]),e}();function Re(e,t,n){return n?t?t(e):e:(e&&e.then||(e=Promise.resolve(e)),t?e.then(t):e)}i(De,"headerLength",4),i(De,"type",void 0),i(De,"multiSegment",!1),i(De,"canHandle",(function(){return!1}));function Ne(){}function Me(e,t){if(!t)return e&&e.then?e.then(Ne):Promise.resolve()}function We(e){var t=e();if(t&&t.then)return t.then(Ne)}function Ke(e,t){var n=e();return n&&n.then?n.then(t):t(n)}function He(e,t,n){if(!e.s){if(n instanceof Xe){if(!n.s)return void(n.o=He.bind(null,e,t));1&t&&(t=n.s),n=n.v}if(n&&n.then)return void n.then(He.bind(null,e,t),He.bind(null,e,2));e.s=t,e.v=n;var r=e.o;r&&r(e)}}var Xe=function(){function e(){}return e.prototype.then=function(t,n){var r=new e,i=this.s;if(i){var a=1&i?t:n;if(a){try{He(r,1,a(this.v))}catch(e){He(r,2,e)}return r}return this}return this.o=function(e){try{var i=e.v;1&e.s?He(r,1,t?t(i):i):n?He(r,1,n(i)):He(r,2,i)}catch(e){He(r,2,e)}},r},e}();function Ye(e){return e instanceof Xe&&1&e.s}function Ge(e,t,n){for(var r;;){var i=e();if(Ye(i)&&(i=i.v),!i)return a;if(i.then){r=0;break}var a=n();if(a&&a.then){if(!Ye(a)){r=1;break}a=a.s}if(t){var s=t();if(s&&s.then&&!Ye(s)){r=2;break}}}var u=new Xe,o=He.bind(null,u,2);return(0===r?i.then(c):1===r?a.then(f):s.then(h)).then(void 0,o),u;function f(r){a=r;do{if(t&&(s=t())&&s.then&&!Ye(s))return void s.then(h).then(void 0,o);if(!(i=e())||Ye(i)&&!i.v)return void He(u,1,a);if(i.then)return void i.then(c).then(void 0,o);Ye(a=n())&&(a=a.v)}while(!a||!a.then);a.then(f).then(void 0,o)}function c(e){e?(a=n())&&a.then?a.then(f).then(void 0,o):f(a):He(u,1,a)}function h(){(i=e())?i.then?i.then(c).then(void 0,o):c(i):He(u,1,a)}}function Je(e){return 192===e||194===e||196===e||219===e||221===e||218===e||254===e}function qe(e){return e>=224&&e<=239}function Qe(e,t,n){var r=W;Array.isArray(r)||("function"==typeof r.entries&&(r=r.entries()),r=m(r));for(var i=0;i<r.length;i++){var a=r[i],s=a[0];if(a[1].canHandle(e,t,n))return s}}var Ze=function(e){a(s,e);var n=d(s);function s(){var e;t(this,s);for(var r=arguments.length,a=new Array(r),u=0;u<r;u++)a[u]=arguments[u];return i(h(e=n.call.apply(n,[this].concat(a))),"appSegments",[]),i(h(e),"jpegSegments",[]),i(h(e),"unknownSegments",[]),e}return r(s,[{key:"parse",value:function(){try{var e=this;return Re(e.findAppSegments(),(function(){return Re(e.readSegments(e.appSegments),(function(){e.mergeMultiSegments(),e.createParsers(e.mergedAppSegments||e.appSegments)}))}))}catch(e){return Promise.reject(e)}}},{key:"setupSegmentFinderArgs",value:function(e){var t=this;!0===e?(this.findAll=!0,this.wanted=O(W.keyList())):(e=void 0===e?W.keyList().filter((function(e){return t.options[e].enabled})):e.filter((function(e){return t.options[e].enabled&&W.has(e)})),this.findAll=!1,this.remaining=O(e),this.wanted=O(e)),this.unfinishedMultiSegment=!1}},{key:"findAppSegments",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1?arguments[1]:void 0;try{var n=this;n.setupSegmentFinderArgs(t);var r=n.file,i=n.findAll,a=n.wanted,s=n.remaining;return Ke((function(){if(!i&&n.file.chunked)return i=m(a).some((function(e){var t=W.get(e),r=n.options[e];return t.multiSegment&&r.multiSegment})),We((function(){if(i)return Me(n.file.readWhole())}))}),(function(){var t=!1;if(e=n.findAppSegmentsInRange(e,r.byteLength),!n.options.onlyTiff)return function(){if(r.chunked){var i=!1;return Ge((function(){return!t&&s.size>0&&!i&&(!!r.canReadNextChunk||!!n.unfinishedMultiSegment)}),void 0,(function(){var a=r.nextChunkOffset,s=n.appSegments.some((function(e){return!n.file.available(e.offset||e.start,e.length||e.size)}));return Ke((function(){return e>a&&!s?Re(r.readNextChunk(e),(function(e){i=!e})):Re(r.readNextChunk(a),(function(e){i=!e}))}),(function(){void 0===(e=n.findAppSegmentsInRange(e,r.byteLength))&&(t=!0)}))}))}}()}))}catch(e){return Promise.reject(e)}}},{key:"findAppSegmentsInRange",value:function(e,t){t-=2;for(var n,r,i,a,s,u,o=this.file,f=this.findAll,c=this.wanted,h=this.remaining,l=this.options;e<t;e++)if(255===o.getUint8(e))if(qe(n=o.getUint8(e+1))){if(r=o.getUint16(e+2),(i=Qe(o,e,r))&&c.has(i)&&(s=(a=W.get(i)).findPosition(o,e),u=l[i],s.type=i,this.appSegments.push(s),!f&&(a.multiSegment&&u.multiSegment?(this.unfinishedMultiSegment=s.chunkNumber<s.chunkCount,this.unfinishedMultiSegment||h.delete(i)):h.delete(i),0===h.size)))break;l.recordUnknownSegments&&((s=De.findPosition(o,e)).marker=n,this.unknownSegments.push(s)),e+=r+1}else if(Je(n)){if(r=o.getUint16(e+2),218===n&&!1!==l.stopAfterSos)return;l.recordJpegSegments&&this.jpegSegments.push({offset:e,length:r,marker:n}),e+=r+1}return e}},{key:"mergeMultiSegments",value:function(){var e=this;if(this.appSegments.some((function(e){return e.multiSegment}))){var t=function(e,t){for(var n,r,i,a=S(),s=0;s<e.length;s++)r=(n=e[s])[t],a.has(r)?i=a.get(r):a.set(r,i=[]),i.push(n);return m(a)}(this.appSegments,"type");this.mergedAppSegments=t.map((function(t){var n=t[0],r=t[1],i=W.get(n,e.options);return i.handleMultiSegments?{type:n,chunk:i.handleMultiSegments(r)}:r[0]}))}}},{key:"getSegment",value:function(e){return this.appSegments.find((function(t){return t.type===e}))}},{key:"getOrFindSegment",value:function(e){try{var t=this,n=t.getSegment(e);return Ke((function(){if(void 0===n)return Re(t.findAppSegments(0,[e]),(function(){n=t.getSegment(e)}))}),(function(){return n}))}catch(e){return Promise.reject(e)}}}],[{key:"canHandle",value:function(e,t){return 65496===t}}]),s}(Ee);function $e(){}i(Ze,"type","jpeg"),M.set("jpeg",Ze);function et(e,t){if(!t)return e&&e.then?e.then($e):Promise.resolve()}function tt(e,t){var n=e();return n&&n.then?n.then(t):t(n)}var nt=[void 0,1,1,2,4,8,1,1,2,4,8,4,8,4];var rt=function(e){a(i,e);var n=d(i);function i(){return t(this,i),n.apply(this,arguments)}return r(i,[{key:"parse",value:function(){try{var e=this;e.parseHeader();var t=e.options;return tt((function(){if(t.ifd0.enabled)return et(e.parseIfd0Block())}),(function(){return tt((function(){if(t.exif.enabled)return et(e.safeParse("parseExifBlock"))}),(function(){return tt((function(){if(t.gps.enabled)return et(e.safeParse("parseGpsBlock"))}),(function(){return tt((function(){if(t.interop.enabled)return et(e.safeParse("parseInteropBlock"))}),(function(){return tt((function(){if(t.ifd1.enabled)return et(e.safeParse("parseThumbnailBlock"))}),(function(){return e.createOutput()}))}))}))}))}))}catch(e){return Promise.reject(e)}}},{key:"safeParse",value:function(e){var t=this[e]();return void 0!==t.catch&&(t=t.catch(this.handleError)),t}},{key:"findIfd0Offset",value:function(){void 0===this.ifd0Offset&&(this.ifd0Offset=this.chunk.getUint32(4))}},{key:"findIfd1Offset",value:function(){if(void 0===this.ifd1Offset){this.findIfd0Offset();var e=this.chunk.getUint16(this.ifd0Offset),t=this.ifd0Offset+2+12*e;this.ifd1Offset=this.chunk.getUint32(t)}}},{key:"parseBlock",value:function(e,t){var n=S();return this[t]=n,this.parseTags(e,t,n),n}},{key:"parseIfd0Block",value:function(){try{var e=this;if(e.ifd0)return;var t=e.file;return e.findIfd0Offset(),e.ifd0Offset<8&&L("Malformed EXIF data"),!t.chunked&&e.ifd0Offset>t.byteLength&&L("IFD0 offset points to outside of file.\nthis.ifd0Offset: ".concat(e.ifd0Offset,", file.byteLength: ").concat(t.byteLength)),tt((function(){if(t.tiff)return et(t.ensureChunk(e.ifd0Offset,T(e.options)))}),(function(){var t=e.parseBlock(e.ifd0Offset,"ifd0");if(0!==t.size)return e.exifOffset=t.get(ce),e.interopOffset=t.get(le),e.gpsOffset=t.get(he),e.xmp=t.get(700),e.iptc=t.get(oe),e.icc=t.get(fe),e.options.sanitize&&(t.delete(ce),t.delete(le),t.delete(he),t.delete(700),t.delete(oe),t.delete(fe)),t}))}catch(e){return Promise.reject(e)}}},{key:"parseExifBlock",value:function(){try{var e=this;if(e.exif)return;return tt((function(){if(!e.ifd0)return et(e.parseIfd0Block())}),(function(){if(void 0!==e.exifOffset)return tt((function(){if(e.file.tiff)return et(e.file.ensureChunk(e.exifOffset,T(e.options)))}),(function(){var t=e.parseBlock(e.exifOffset,"exif");return e.interopOffset||(e.interopOffset=t.get(le)),e.makerNote=t.get(se),e.userComment=t.get(ue),e.options.sanitize&&(t.delete(le),t.delete(se),t.delete(ue)),e.unpack(t,41728),e.unpack(t,41729),t}))}))}catch(e){return Promise.reject(e)}}},{key:"unpack",value:function(e,t){var n=e.get(t);n&&1===n.length&&e.set(t,n[0])}},{key:"parseGpsBlock",value:function(){try{var e=this;if(e.gps)return;return tt((function(){if(!e.ifd0)return et(e.parseIfd0Block())}),(function(){if(void 0!==e.gpsOffset){var t=e.parseBlock(e.gpsOffset,"gps");return t&&t.has(2)&&t.has(4)&&(t.set("latitude",it.apply(void 0,t.get(2).concat([t.get(1)]))),t.set("longitude",it.apply(void 0,t.get(4).concat([t.get(3)])))),t}}))}catch(e){return Promise.reject(e)}}},{key:"parseInteropBlock",value:function(){try{var e=this;if(e.interop)return;return tt((function(){if(!e.ifd0)return et(e.parseIfd0Block())}),(function(){return tt((function(){if(void 0===e.interopOffset&&!e.exif)return et(e.parseExifBlock())}),(function(){if(void 0!==e.interopOffset)return e.parseBlock(e.interopOffset,"interop")}))}))}catch(e){return Promise.reject(e)}}},{key:"parseThumbnailBlock",value:function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];try{var t=this;if(t.ifd1||t.ifd1Parsed)return;if(t.options.mergeOutput&&!e)return;return t.findIfd1Offset(),t.ifd1Offset>0&&(t.parseBlock(t.ifd1Offset,"ifd1"),t.ifd1Parsed=!0),t.ifd1}catch(e){return Promise.reject(e)}}},{key:"extractThumbnail",value:function(){try{var e=this;return e.headerParsed||e.parseHeader(),tt((function(){if(!e.ifd1Parsed)return et(e.parseThumbnailBlock(!0))}),(function(){if(void 0!==e.ifd1){var t=e.ifd1.get(513),n=e.ifd1.get(514);return e.chunk.getUint8Array(t,n)}}))}catch(e){return Promise.reject(e)}}},{key:"image",get:function(){return this.ifd0}},{key:"thumbnail",get:function(){return this.ifd1}},{key:"createOutput",value:function(){var e,t,n,r={},i=ye;Array.isArray(i)||("function"==typeof i.entries&&(i=i.entries()),i=m(i));for(var a=0;a<i.length;a++)if(!I(e=this[t=i[a]]))if(n=this.canTranslate?this.translateBlock(e,t):k(e),this.options.mergeOutput){if("ifd1"===t)continue;g(r,n)}else r[t]=n;return this.makerNote&&(r.makerNote=this.makerNote),this.userComment&&(r.userComment=this.userComment),r}},{key:"assignToOutput",value:function(e,t){if(this.globalOptions.mergeOutput)g(e,t);else{var n=y(t);Array.isArray(n)||("function"==typeof n.entries&&(n=n.entries()),n=m(n));for(var r=0;r<n.length;r++){var i=n[r],a=i[0],s=i[1];this.assignObjectToOutput(e,a,s)}}}}],[{key:"canHandle",value:function(e,t){return 225===e.getUint8(t+1)&&1165519206===e.getUint32(t+4)&&0===e.getUint16(t+8)}}]),i}(function(e){a(i,e);var n=d(i);function i(){return t(this,i),n.apply(this,arguments)}return r(i,[{key:"parseHeader",value:function(){var e=this.chunk.getUint16();18761===e?this.le=!0:19789===e&&(this.le=!1),this.chunk.le=this.le,this.headerParsed=!0}},{key:"parseTags",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:S(),r=this.options[t],i=r.pick,a=r.skip,s=(i=O(i)).size>0,u=0===a.size,o=this.chunk.getUint16(e);e+=2;for(var f=0;f<o;f++){var c=this.chunk.getUint16(e);if(s){if(i.has(c)&&(n.set(c,this.parseTag(e,c,t)),i.delete(c),0===i.size))break}else!u&&a.has(c)||n.set(c,this.parseTag(e,c,t));e+=12}return n}},{key:"parseTag",value:function(e,t,n){var r,i=this.chunk,a=i.getUint16(e+2),s=i.getUint32(e+4),u=nt[a];if(u*s<=4?e+=8:e=i.getUint32(e+8),(a<1||a>13)&&L("Invalid TIFF value type. block: ".concat(n.toUpperCase(),", tag: ").concat(t.toString(16),", type: ").concat(a,", offset ").concat(e)),e>i.byteLength&&L("Invalid TIFF value offset. block: ".concat(n.toUpperCase(),", tag: ").concat(t.toString(16),", type: ").concat(a,", offset ").concat(e," is outside of chunk size ").concat(i.byteLength)),1===a)return i.getUint8Array(e,s);if(2===a)return""===(r=function(e){for(;e.endsWith("\0");)e=e.slice(0,-1);return e}(r=i.getString(e,s)).trim())?void 0:r;if(7===a)return i.getUint8Array(e,s);if(1===s)return this.parseTagValue(a,e);for(var o=new(function(e){switch(e){case 1:return Uint8Array;case 3:return Uint16Array;case 4:return Uint32Array;case 5:return Array;case 6:return Int8Array;case 8:return Int16Array;case 9:return Int32Array;case 10:return Array;case 11:return Float32Array;case 12:return Float64Array;default:return Array}}(a))(s),f=u,c=0;c<s;c++)o[c]=this.parseTagValue(a,e),e+=f;return o}},{key:"parseTagValue",value:function(e,t){var n=this.chunk;switch(e){case 1:return n.getUint8(t);case 3:return n.getUint16(t);case 4:return n.getUint32(t);case 5:return n.getUint32(t)/n.getUint32(t+4);case 6:return n.getInt8(t);case 8:return n.getInt16(t);case 9:return n.getInt32(t);case 10:return n.getInt32(t)/n.getInt32(t+4);case 11:return n.getFloat(t);case 12:return n.getDouble(t);case 13:return n.getUint32(t);default:L("Invalid tiff type ".concat(e))}}}]),i}(De));function it(e,t,n,r){var i=e+t/60+n/3600;return"S"!==r&&"W"!==r||(i*=-1),i}i(rt,"type","tiff"),i(rt,"headerLength",10),W.set("tiff",rt);var at=Object.freeze({__proto__:null,default:ze,Exifr:Ie,fileParsers:M,segmentParsers:W,fileReaders:K,tagKeys:re,tagValues:ie,tagRevivers:ae,createDictionary:te,extendDictionary:ne,fetchUrlAsArrayBuffer:G,readBlobAsArrayBuffer:Y,chunkedProps:de,otherSegments:ve,segments:pe,tiffBlocks:ye,segmentsAndBlocks:ge,tiffExtractables:ke,inheritables:me,allFormatters:be,Options:Pe,parse:Te});function st(e,t,n){return n?t?t(e):e:(e&&e.then||(e=Promise.resolve(e)),t?e.then(t):e)}function ut(e){return function(){for(var t=[],n=0;n<arguments.length;n++)t[n]=arguments[n];try{return Promise.resolve(e.apply(this,t))}catch(e){return Promise.reject(e)}}}var ot=ut((function(e){var t=new Ie(vt);return st(t.read(e),(function(){return st(t.parse(),(function(e){if(e&&e.ifd0)return e.ifd0[274]}))}))})),ft=ut((function(e){var t=new Ie(dt);return st(t.read(e),(function(){return st(t.parse(),(function(e){if(e&&e.gps){var t=e.gps;return{latitude:t.latitude,longitude:t.longitude}}}))}))})),ct=ut((function(e){return st(this.thumbnail(e),(function(e){if(void 0!==e){var t=new Blob([e]);return URL.createObjectURL(t)}}))})),ht=ut((function(e){var t=new Ie(pt);return st(t.read(e),(function(){return st(t.extractThumbnail(),(function(e){return e&&_?j.from(e):e}))}))})),lt={ifd0:!1,ifd1:!1,exif:!1,gps:!1,interop:!1,sanitize:!1,reviveValues:!0,translateKeys:!1,translateValues:!1,mergeOutput:!1},dt=g({},lt,{firstChunkSize:4e4,gps:[1,2,3,4]}),vt=g({},lt,{firstChunkSize:4e4,ifd0:[274]}),pt=g({},lt,{tiff:!1,ifd1:!0,mergeOutput:!1}),yt=Object.freeze({1:{dimensionSwapped:!1,scaleX:1,scaleY:1,deg:0,rad:0},2:{dimensionSwapped:!1,scaleX:-1,scaleY:1,deg:0,rad:0},3:{dimensionSwapped:!1,scaleX:1,scaleY:1,deg:180,rad:180*Math.PI/180},4:{dimensionSwapped:!1,scaleX:-1,scaleY:1,deg:180,rad:180*Math.PI/180},5:{dimensionSwapped:!0,scaleX:1,scaleY:-1,deg:90,rad:90*Math.PI/180},6:{dimensionSwapped:!0,scaleX:1,scaleY:1,deg:90,rad:90*Math.PI/180},7:{dimensionSwapped:!0,scaleX:1,scaleY:-1,deg:270,rad:270*Math.PI/180},8:{dimensionSwapped:!0,scaleX:1,scaleY:1,deg:270,rad:270*Math.PI/180}});if(e.rotateCanvas=!0,e.rotateCss=!0,"object"==typeof navigator){var gt=navigator.userAgent;if(gt.includes("iPad")||gt.includes("iPhone")){var kt=gt.match(/OS (\d+)_(\d+)/);if(kt){var mt=kt[1],bt=kt[2],At=Number(mt)+.1*Number(bt);e.rotateCanvas=At<13.4,e.rotateCss=!1}}else if(gt.includes("OS X 10")){var wt=gt.match(/OS X 10[_.](\d+)/)[1];e.rotateCanvas=e.rotateCss=Number(wt)<15}if(gt.includes("Chrome/")){var Ot=gt.match(/Chrome\/(\d+)/)[1];e.rotateCanvas=e.rotateCss=Number(Ot)<81}else if(gt.includes("Firefox/")){var St=gt.match(/Firefox\/(\d+)/)[1];e.rotateCanvas=e.rotateCss=Number(St)<77}}function Pt(){}var Ut=function(e){a(u,e);var n=d(u);function u(){var e;t(this,u);for(var r=arguments.length,a=new Array(r),s=0;s<r;s++)a[s]=arguments[s];return i(h(e=n.call.apply(n,[this].concat(a))),"ranges",new xt),0!==e.byteLength&&e.ranges.add(0,e.byteLength),e}return r(u,[{key:"_tryExtend",value:function(e,t,n){if(0===e&&0===this.byteLength&&n){var r=new DataView(n.buffer||n,n.byteOffset,n.byteLength);this._swapDataView(r)}else{var i=e+t;if(i>this.byteLength){var a=this._extend(i).dataView;this._swapDataView(a)}}}},{key:"_extend",value:function(e){var t;t=_?j.allocUnsafe(e):new Uint8Array(e);var n=new DataView(t.buffer,t.byteOffset,t.byteLength);return t.set(new Uint8Array(this.buffer,this.byteOffset,this.byteLength),0),{uintView:t,dataView:n}}},{key:"subarray",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];return t=t||this._lengthToEnd(e),n&&this._tryExtend(e,t),this.ranges.add(e,t),v(s(u.prototype),"subarray",this).call(this,e,t)}},{key:"set",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];n&&this._tryExtend(t,e.byteLength,e);var r=v(s(u.prototype),"set",this).call(this,e,t);return this.ranges.add(t,r.byteLength),r}},{key:"ensureChunk",value:function(e,t){try{var n=this;if(!n.chunked)return;if(n.ranges.available(e,t))return;return function(e,t){if(!t)return e&&e.then?e.then(Pt):Promise.resolve()}(n.readChunk(e,t))}catch(e){return Promise.reject(e)}}},{key:"available",value:function(e,t){return this.ranges.available(e,t)}}]),u}(D),xt=function(){function e(){t(this,e),i(this,"list",[])}return r(e,[{key:"length",get:function(){return this.list.length}},{key:"add",value:function(e,t){var n=e+t,r=this.list.filter((function(t){return Ct(e,t.offset,n)||Ct(e,t.end,n)}));if(r.length>0){e=Math.min.apply(Math,[e].concat(r.map((function(e){return e.offset})))),t=(n=Math.max.apply(Math,[n].concat(r.map((function(e){return e.end})))))-e;var i=r.shift();i.offset=e,i.length=t,i.end=n,this.list=this.list.filter((function(e){return!r.includes(e)}))}else this.list.push({offset:e,length:t,end:n})}},{key:"available",value:function(e,t){var n=e+t;return this.list.some((function(t){return t.offset<=e&&n<=t.end}))}}]),e}();function Ct(e,t,n){return e<=t&&t<=n}function Bt(){}function jt(e,t){if(!t)return e&&e.then?e.then(Bt):Promise.resolve()}function _t(e,t,n){return n?t?t(e):e:(e&&e.then||(e=Promise.resolve(e)),t?e.then(t):e)}var Vt=function(e){a(i,e);var n=d(i);function i(){return t(this,i),n.apply(this,arguments)}return r(i,[{key:"readWhole",value:function(){try{var e=this;return e.chunked=!1,_t(Y(e.input),(function(t){e._swapArrayBuffer(t)}))}catch(e){return Promise.reject(e)}}},{key:"readChunked",value:function(){return this.chunked=!0,this.size=this.input.size,v(s(i.prototype),"readChunked",this).call(this)}},{key:"_readChunk",value:function(e,t){try{var n=this,r=t?e+t:void 0,i=n.input.slice(e,r);return _t(Y(i),(function(t){return n.set(t,e,!0)}))}catch(e){return Promise.reject(e)}}}]),i}(function(e){a(s,e);var n=d(s);function s(e,r){var a;return t(this,s),i(h(a=n.call(this,0)),"chunksRead",0),a.input=e,a.options=r,a}return r(s,[{key:"readWhole",value:function(){try{var e=this;return e.chunked=!1,jt(e.readChunk(e.nextChunkOffset))}catch(e){return Promise.reject(e)}}},{key:"readChunked",value:function(){try{var e=this;return e.chunked=!0,jt(e.readChunk(0,e.options.firstChunkSize))}catch(e){return Promise.reject(e)}}},{key:"readNextChunk",value:function(e){try{var t=this;if(void 0===e&&(e=t.nextChunkOffset),t.fullyRead)return t.chunksRead++,!1;var n=t.options.chunkSize;return r=t.readChunk(e,n),i=function(e){return!!e&&e.byteLength===n},a?i?i(r):r:(r&&r.then||(r=Promise.resolve(r)),i?r.then(i):r)}catch(e){return Promise.reject(e)}var r,i,a}},{key:"readChunk",value:function(e,t){try{var n=this;if(n.chunksRead++,0===(t=n.safeWrapAddress(e,t)))return;return n._readChunk(e,t)}catch(e){return Promise.reject(e)}}},{key:"safeWrapAddress",value:function(e,t){return void 0!==this.size&&e+t>this.size?Math.max(0,this.size-e):t}},{key:"nextChunkOffset",get:function(){if(0!==this.ranges.list.length)return this.ranges.list[0].length}},{key:"canReadNextChunk",get:function(){return this.chunksRead<this.options.chunkLimit}},{key:"fullyRead",get:function(){return void 0!==this.size&&this.nextChunkOffset===this.size}},{key:"read",value:function(){return this.options.chunked?this.readChunked():this.readWhole()}},{key:"close",value:function(){}}]),s}(Ut));K.set("blob",Vt),e.Exifr=Ie,e.Options=Pe,e.allFormatters=be,e.chunkedProps=de,e.createDictionary=te,e.default=at,e.disableAllOptions=lt,e.extendDictionary=ne,e.fetchUrlAsArrayBuffer=G,e.fileParsers=M,e.fileReaders=K,e.gps=ft,e.gpsOnlyOptions=dt,e.inheritables=me,e.orientation=ot,e.orientationOnlyOptions=vt,e.otherSegments=ve,e.parse=Te,e.readBlobAsArrayBuffer=Y,e.rotation=function(t){return st(ot(t),(function(t){return g({canvas:e.rotateCanvas,css:e.rotateCss},yt[t])}))},e.rotations=yt,e.segmentParsers=W,e.segments=pe,e.segmentsAndBlocks=ge,e.tagKeys=re,e.tagRevivers=ae,e.tagValues=ie,e.thumbnail=ht,e.thumbnailOnlyOptions=pt,e.thumbnailUrl=ct,e.tiffBlocks=ye,e.tiffExtractables=ke,Object.defineProperty(e,"__esModule",{value:!0})}));

}).call(this)}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)

},{"_process":19,"buffer":3}],7:[function(require,module,exports){
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],8:[function(require,module,exports){
module.exports = function isShallowEqual (a, b) {
  if (a === b) return true
  for (var i in a) if (!(i in b)) return false
  for (var i in b) if (a[i] !== b[i]) return false
  return true
}

},{}],9:[function(require,module,exports){
(function (global){(function (){
/*
 *  base64.js
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory(global)
        : typeof define === 'function' && define.amd
        ? define(factory) : factory(global)
}((
    typeof self !== 'undefined' ? self
        : typeof window !== 'undefined' ? window
        : typeof global !== 'undefined' ? global
: this
), function(global) {
    'use strict';
    // existing version for noConflict()
    global = global || {};
    var _Base64 = global.Base64;
    var version = "2.6.4";
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa && typeof global.btoa == 'function'
        ? function(b){ return global.btoa(b) } : function(b) {
        if (b.match(/[^\x00-\xFF]/)) throw new RangeError(
            'The string contains invalid characters.'
        );
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = function(u) {
        return btoa(utob(String(u)));
    };
    var mkUriSafe = function (b64) {
        return b64.replace(/[+\/]/g, function(m0) {
            return m0 == '+' ? '-' : '_';
        }).replace(/=/g, '');
    };
    var encode = function(u, urisafe) {
        return urisafe ? mkUriSafe(_encode(u)) : _encode(u);
    };
    var encodeURI = function(u) { return encode(u, true) };
    var fromUint8Array;
    if (global.Uint8Array) fromUint8Array = function(a, urisafe) {
        // return btoa(fromCharCode.apply(null, a));
        var b64 = '';
        for (var i = 0, l = a.length; i < l; i += 3) {
            var a0 = a[i], a1 = a[i+1], a2 = a[i+2];
            var ord = a0 << 16 | a1 << 8 | a2;
            b64 +=    b64chars.charAt( ord >>> 18)
                +     b64chars.charAt((ord >>> 12) & 63)
                + ( typeof a1 != 'undefined'
                    ? b64chars.charAt((ord >>>  6) & 63) : '=')
                + ( typeof a2 != 'undefined'
                    ? b64chars.charAt( ord         & 63) : '=');
        }
        return urisafe ? mkUriSafe(b64) : b64;
    };
    // decoder stuff
    var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var _atob = global.atob && typeof global.atob == 'function'
        ? function(a){ return global.atob(a) } : function(a){
        return a.replace(/\S{1,4}/g, cb_decode);
    };
    var atob = function(a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
    var _decode = function(a) { return btou(_atob(a)) };
    var _fromURI = function(a) {
        return String(a).replace(/[-_]/g, function(m0) {
            return m0 == '-' ? '+' : '/'
        }).replace(/[^A-Za-z0-9\+\/]/g, '');
    };
    var decode = function(a){
        return _decode(_fromURI(a));
    };
    var toUint8Array;
    if (global.Uint8Array) toUint8Array = function(a) {
        return Uint8Array.from(atob(_fromURI(a)), function(c) {
            return c.charCodeAt(0);
        });
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict,
        fromUint8Array: fromUint8Array,
        toUint8Array: toUint8Array
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
        Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function(){ return global.Base64 });
    }
    // that's it!
    return {Base64: global.Base64}
}));

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],10:[function(require,module,exports){
(function (global){(function (){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = debounce;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],11:[function(require,module,exports){
(function (global){(function (){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as the `TypeError` message for "Functions" methods. */
var FUNC_ERROR_TEXT = 'Expected a function';

/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/** Used to match leading and trailing whitespace. */
var reTrim = /^\s+|\s+$/g;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max,
    nativeMin = Math.min;

/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return root.Date.now();
};

/**
 * Creates a debounced function that delays invoking `func` until after `wait`
 * milliseconds have elapsed since the last time the debounced function was
 * invoked. The debounced function comes with a `cancel` method to cancel
 * delayed `func` invocations and a `flush` method to immediately invoke them.
 * Provide `options` to indicate whether `func` should be invoked on the
 * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
 * with the last arguments provided to the debounced function. Subsequent
 * calls to the debounced function return the result of the last `func`
 * invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the debounced function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.debounce` and `_.throttle`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to debounce.
 * @param {number} [wait=0] The number of milliseconds to delay.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=false]
 *  Specify invoking on the leading edge of the timeout.
 * @param {number} [options.maxWait]
 *  The maximum time `func` is allowed to be delayed before it's invoked.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // Avoid costly calculations while the window size is in flux.
 * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
 *
 * // Invoke `sendMail` when clicked, debouncing subsequent calls.
 * jQuery(element).on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * }));
 *
 * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
 * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
 * var source = new EventSource('/stream');
 * jQuery(source).on('message', debounced);
 *
 * // Cancel the trailing debounced invocation.
 * jQuery(window).on('popstate', debounced.cancel);
 */
function debounce(func, wait, options) {
  var lastArgs,
      lastThis,
      maxWait,
      result,
      timerId,
      lastCallTime,
      lastInvokeTime = 0,
      leading = false,
      maxing = false,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  wait = toNumber(wait) || 0;
  if (isObject(options)) {
    leading = !!options.leading;
    maxing = 'maxWait' in options;
    maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }

  function invokeFunc(time) {
    var args = lastArgs,
        thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    // Reset any `maxWait` timer.
    lastInvokeTime = time;
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait);
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime,
        result = wait - timeSinceLastCall;

    return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
  }

  function shouldInvoke(time) {
    var timeSinceLastCall = time - lastCallTime,
        timeSinceLastInvoke = time - lastInvokeTime;

    // Either this is the first call, activity has stopped and we're at the
    // trailing edge, the system time has gone backwards and we're treating
    // it as the trailing edge, or we've hit the `maxWait` limit.
    return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
      (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
  }

  function timerExpired() {
    var time = now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timerId = undefined;

    // Only invoke if we have `lastArgs` which means `func` has been
    // debounced at least once.
    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timerId = undefined;
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(now());
  }

  function debounced() {
    var time = now(),
        isInvoking = shouldInvoke(time);

    lastArgs = arguments;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait);
    }
    return result;
  }
  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Creates a throttled function that only invokes `func` at most once per
 * every `wait` milliseconds. The throttled function comes with a `cancel`
 * method to cancel delayed `func` invocations and a `flush` method to
 * immediately invoke them. Provide `options` to indicate whether `func`
 * should be invoked on the leading and/or trailing edge of the `wait`
 * timeout. The `func` is invoked with the last arguments provided to the
 * throttled function. Subsequent calls to the throttled function return the
 * result of the last `func` invocation.
 *
 * **Note:** If `leading` and `trailing` options are `true`, `func` is
 * invoked on the trailing edge of the timeout only if the throttled function
 * is invoked more than once during the `wait` timeout.
 *
 * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
 * until to the next tick, similar to `setTimeout` with a timeout of `0`.
 *
 * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
 * for details over the differences between `_.throttle` and `_.debounce`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to throttle.
 * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
 * @param {Object} [options={}] The options object.
 * @param {boolean} [options.leading=true]
 *  Specify invoking on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true]
 *  Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // Avoid excessively updating the position while scrolling.
 * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
 *
 * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
 * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
 * jQuery(element).on('click', throttled);
 *
 * // Cancel the trailing throttled invocation.
 * jQuery(window).on('popstate', throttled.cancel);
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (typeof func != 'function') {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  if (isObject(options)) {
    leading = 'leading' in options ? !!options.leading : leading;
    trailing = 'trailing' in options ? !!options.trailing : trailing;
  }
  return debounce(func, wait, {
    'leading': leading,
    'maxWait': wait,
    'trailing': trailing
  });
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && objectToString.call(value) == symbolTag);
}

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if (isSymbol(value)) {
    return NAN;
  }
  if (isObject(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = isObject(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = value.replace(reTrim, '');
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

module.exports = throttle;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],12:[function(require,module,exports){
'use strict';

var safeIsNaN = Number.isNaN ||
    function ponyfill(value) {
        return typeof value === 'number' && value !== value;
    };
function isEqual(first, second) {
    if (first === second) {
        return true;
    }
    if (safeIsNaN(first) && safeIsNaN(second)) {
        return true;
    }
    return false;
}
function areInputsEqual(newInputs, lastInputs) {
    if (newInputs.length !== lastInputs.length) {
        return false;
    }
    for (var i = 0; i < newInputs.length; i++) {
        if (!isEqual(newInputs[i], lastInputs[i])) {
            return false;
        }
    }
    return true;
}

function memoizeOne(resultFn, isEqual) {
    if (isEqual === void 0) { isEqual = areInputsEqual; }
    var lastThis;
    var lastArgs = [];
    var lastResult;
    var calledOnce = false;
    function memoized() {
        var newArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            newArgs[_i] = arguments[_i];
        }
        if (calledOnce && lastThis === this && isEqual(newArgs, lastArgs)) {
            return lastResult;
        }
        lastResult = resultFn.apply(this, newArgs);
        calledOnce = true;
        lastThis = this;
        lastArgs = newArgs;
        return lastResult;
    }
    return memoized;
}

module.exports = memoizeOne;

},{}],13:[function(require,module,exports){
var wildcard = require('wildcard');
var reMimePartSplit = /[\/\+\.]/;

/**
  # mime-match

  A simple function to checker whether a target mime type matches a mime-type
  pattern (e.g. image/jpeg matches image/jpeg OR image/*).

  ## Example Usage

  <<< example.js

**/
module.exports = function(target, pattern) {
  function test(pattern) {
    var result = wildcard(pattern, target, reMimePartSplit);

    // ensure that we have a valid mime type (should have two parts)
    return result && result.length >= 2;
  }

  return pattern ? test(pattern.split(';')[0]) : test;
};

},{"wildcard":14}],14:[function(require,module,exports){
/* jshint node: true */
'use strict';

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  While the library works in Node, if you are are looking for file-based
  wildcard matching then you should have a look at:

  <https://github.com/isaacs/node-glob>
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = ~text.indexOf('*');
  this.separator = separator;
  this.parts = text.split(separator);
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};

},{}],15:[function(require,module,exports){
/**
* Create an event emitter with namespaces
* @name createNamespaceEmitter
* @example
* var emitter = require('./index')()
*
* emitter.on('*', function () {
*   console.log('all events emitted', this.event)
* })
*
* emitter.on('example', function () {
*   console.log('example event emitted')
* })
*/
module.exports = function createNamespaceEmitter () {
  var emitter = {}
  var _fns = emitter._fns = {}

  /**
  * Emit an event. Optionally namespace the event. Handlers are fired in the order in which they were added with exact matches taking precedence. Separate the namespace and event with a `:`
  * @name emit
  * @param {String} event – the name of the event, with optional namespace
  * @param {...*} data – up to 6 arguments that are passed to the event listener
  * @example
  * emitter.emit('example')
  * emitter.emit('demo:test')
  * emitter.emit('data', { example: true}, 'a string', 1)
  */
  emitter.emit = function emit (event, arg1, arg2, arg3, arg4, arg5, arg6) {
    var toEmit = getListeners(event)

    if (toEmit.length) {
      emitAll(event, toEmit, [arg1, arg2, arg3, arg4, arg5, arg6])
    }
  }

  /**
  * Create en event listener.
  * @name on
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.on('example', function () {})
  * emitter.on('demo', function () {})
  */
  emitter.on = function on (event, fn) {
    if (!_fns[event]) {
      _fns[event] = []
    }

    _fns[event].push(fn)
  }

  /**
  * Create en event listener that fires once.
  * @name once
  * @param {String} event
  * @param {Function} fn
  * @example
  * emitter.once('example', function () {})
  * emitter.once('demo', function () {})
  */
  emitter.once = function once (event, fn) {
    function one () {
      fn.apply(this, arguments)
      emitter.off(event, one)
    }
    this.on(event, one)
  }

  /**
  * Stop listening to an event. Stop all listeners on an event by only passing the event name. Stop a single listener by passing that event handler as a callback.
  * You must be explicit about what will be unsubscribed: `emitter.off('demo')` will unsubscribe an `emitter.on('demo')` listener,
  * `emitter.off('demo:example')` will unsubscribe an `emitter.on('demo:example')` listener
  * @name off
  * @param {String} event
  * @param {Function} [fn] – the specific handler
  * @example
  * emitter.off('example')
  * emitter.off('demo', function () {})
  */
  emitter.off = function off (event, fn) {
    var keep = []

    if (event && fn) {
      var fns = this._fns[event]
      var i = 0
      var l = fns ? fns.length : 0

      for (i; i < l; i++) {
        if (fns[i] !== fn) {
          keep.push(fns[i])
        }
      }
    }

    keep.length ? this._fns[event] = keep : delete this._fns[event]
  }

  function getListeners (e) {
    var out = _fns[e] ? _fns[e] : []
    var idx = e.indexOf(':')
    var args = (idx === -1) ? [e] : [e.substring(0, idx), e.substring(idx + 1)]

    var keys = Object.keys(_fns)
    var i = 0
    var l = keys.length

    for (i; i < l; i++) {
      var key = keys[i]
      if (key === '*') {
        out = out.concat(_fns[key])
      }

      if (args.length === 2 && args[0] === key) {
        out = out.concat(_fns[key])
        break
      }
    }

    return out
  }

  function emitAll (e, fns, args) {
    var i = 0
    var l = fns.length

    for (i; i < l; i++) {
      if (!fns[i]) break
      fns[i].event = e
      fns[i].apply(fns[i], args)
    }
  }

  return emitter
}

},{}],16:[function(require,module,exports){
(function (process){(function (){
let { urlAlphabet } = require('./url-alphabet/index.cjs')
if (process.env.NODE_ENV !== 'production') {
  if (
    typeof navigator !== 'undefined' &&
    navigator.product === 'ReactNative' &&
    typeof crypto === 'undefined'
  ) {
    throw new Error(
      'React Native does not have a built-in secure random generator. ' +
        'If you don’t need unpredictable IDs use `nanoid/non-secure`. ' +
        'For secure IDs, import `react-native-get-random-values` ' +
        'before Nano ID.'
    )
  }
  if (typeof msCrypto !== 'undefined' && typeof crypto === 'undefined') {
    throw new Error(
      'Import file with `if (!window.crypto) window.crypto = window.msCrypto`' +
        ' before importing Nano ID to fix IE 11 support'
    )
  }
  if (typeof crypto === 'undefined') {
    throw new Error(
      'Your browser does not have secure random generator. ' +
        'If you don’t need unpredictable IDs, you can use nanoid/non-secure.'
    )
  }
}
let random = bytes => crypto.getRandomValues(new Uint8Array(bytes))
let customRandom = (alphabet, size, getRandom) => {
  let mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1
  let step = -~((1.6 * mask * size) / alphabet.length)
  return () => {
    let id = ''
    while (true) {
      let bytes = getRandom(step)
      let j = step
      while (j--) {
        id += alphabet[bytes[j] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}
let customAlphabet = (alphabet, size) => customRandom(alphabet, size, random)
let nanoid = (size = 21) => {
  let id = ''
  let bytes = crypto.getRandomValues(new Uint8Array(size))
  while (size--) {
    let byte = bytes[size] & 63
    if (byte < 36) {
      id += byte.toString(36)
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase()
    } else if (byte < 63) {
      id += '_'
    } else {
      id += '-'
    }
  }
  return id
}
module.exports = { nanoid, customAlphabet, customRandom, urlAlphabet, random }

}).call(this)}).call(this,require('_process'))

},{"./url-alphabet/index.cjs":17,"_process":19}],17:[function(require,module,exports){
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
module.exports = { urlAlphabet }

},{}],18:[function(require,module,exports){
var n,l,u,t,i,r,o,f,e={},c=[],s=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a(n,l){for(var u in l)n[u]=l[u];return n}function v(n){var l=n.parentNode;l&&l.removeChild(n)}function h(l,u,t){var i,r,o,f={};for(o in u)"key"==o?i=u[o]:"ref"==o?r=u[o]:f[o]=u[o];if(arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):t),"function"==typeof l&&null!=l.defaultProps)for(o in l.defaultProps)void 0===f[o]&&(f[o]=l.defaultProps[o]);return p(l,f,i,r,null)}function p(n,t,i,r,o){var f={type:n,props:t,key:i,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++u:o};return null==o&&null!=l.vnode&&l.vnode(f),f}function y(n){return n.children}function d(n,l){this.props=n,this.context=l}function _(n,l){if(null==l)return n.__?_(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?_(n):null}function k(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return k(n)}}function x(n){(!n.__d&&(n.__d=!0)&&i.push(n)&&!b.__r++||o!==l.debounceRendering)&&((o=l.debounceRendering)||r)(b)}function b(){for(var n;b.__r=i.length;)n=i.sort(function(n,l){return n.__v.__b-l.__v.__b}),i=[],n.some(function(n){var l,u,t,i,r,o;n.__d&&(r=(i=(l=n).__v).__e,(o=l.__P)&&(u=[],(t=a({},i)).__v=i.__v+1,I(o,i,t,l.__n,void 0!==o.ownerSVGElement,null!=i.__h?[r]:null,u,null==r?_(i):r,i.__h),T(u,i),i.__e!=r&&k(i)))})}function m(n,l,u,t,i,r,o,f,s,a){var v,h,d,k,x,b,m,A=t&&t.__k||c,P=A.length;for(u.__k=[],v=0;v<l.length;v++)if(null!=(k=u.__k[v]=null==(k=l[v])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k||"bigint"==typeof k?p(null,k,null,null,k):Array.isArray(k)?p(y,{children:k},null,null,null):k.__b>0?p(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(d=A[v])||d&&k.key==d.key&&k.type===d.type)A[v]=void 0;else for(h=0;h<P;h++){if((d=A[h])&&k.key==d.key&&k.type===d.type){A[h]=void 0;break}d=null}I(n,k,d=d||e,i,r,o,f,s,a),x=k.__e,(h=k.ref)&&d.ref!=h&&(m||(m=[]),d.ref&&m.push(d.ref,null,k),m.push(h,k.__c||x,k)),null!=x?(null==b&&(b=x),"function"==typeof k.type&&k.__k===d.__k?k.__d=s=g(k,s,n):s=w(n,k,d,A,x,s),"function"==typeof u.type&&(u.__d=s)):s&&d.__e==s&&s.parentNode!=n&&(s=_(d))}for(u.__e=b,v=P;v--;)null!=A[v]&&("function"==typeof u.type&&null!=A[v].__e&&A[v].__e==u.__d&&(u.__d=_(t,v+1)),L(A[v],A[v]));if(m)for(v=0;v<m.length;v++)z(m[v],m[++v],m[++v])}function g(n,l,u){for(var t,i=n.__k,r=0;i&&r<i.length;r++)(t=i[r])&&(t.__=n,l="function"==typeof t.type?g(t,l,u):w(u,t,t,i,t.__e,l));return l}function w(n,l,u,t,i,r){var o,f,e;if(void 0!==l.__d)o=l.__d,l.__d=void 0;else if(null==u||i!=r||null==i.parentNode)n:if(null==r||r.parentNode!==n)n.appendChild(i),o=null;else{for(f=r,e=0;(f=f.nextSibling)&&e<t.length;e+=2)if(f==i)break n;n.insertBefore(i,r),o=r}return void 0!==o?o:i.nextSibling}function A(n,l,u,t,i){var r;for(r in u)"children"===r||"key"===r||r in l||C(n,r,null,u[r],t);for(r in l)i&&"function"!=typeof l[r]||"children"===r||"key"===r||"value"===r||"checked"===r||u[r]===l[r]||C(n,r,l[r],u[r],t)}function P(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||s.test(l)?u:u+"px"}function C(n,l,u,t,i){var r;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof t&&(n.style.cssText=t=""),t)for(l in t)u&&l in u||P(n.style,l,"");if(u)for(l in u)t&&u[l]===t[l]||P(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])r=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+r]=u,u?t||n.addEventListener(l,r?H:$,r):n.removeEventListener(l,r?H:$,r);else if("dangerouslySetInnerHTML"!==l){if(i)l=l.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l))}}function $(n){this.l[n.type+!1](l.event?l.event(n):n)}function H(n){this.l[n.type+!0](l.event?l.event(n):n)}function I(n,u,t,i,r,o,f,e,c){var s,v,h,p,_,k,x,b,g,w,A,P=u.type;if(void 0!==u.constructor)return null;null!=t.__h&&(c=t.__h,e=u.__e=t.__e,u.__h=null,o=[e]),(s=l.__b)&&s(u);try{n:if("function"==typeof P){if(b=u.props,g=(s=P.contextType)&&i[s.__c],w=s?g?g.props.value:s.__:i,t.__c?x=(v=u.__c=t.__c).__=v.__E:("prototype"in P&&P.prototype.render?u.__c=v=new P(b,w):(u.__c=v=new d(b,w),v.constructor=P,v.render=M),g&&g.sub(v),v.props=b,v.state||(v.state={}),v.context=w,v.__n=i,h=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=P.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=a({},v.__s)),a(v.__s,P.getDerivedStateFromProps(b,v.__s))),p=v.props,_=v.state,h)null==P.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else{if(null==P.getDerivedStateFromProps&&b!==p&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(b,w),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(b,v.__s,w)||u.__v===t.__v){v.props=b,v.state=v.__s,u.__v!==t.__v&&(v.__d=!1),v.__v=u,u.__e=t.__e,u.__k=t.__k,u.__k.forEach(function(n){n&&(n.__=u)}),v.__h.length&&f.push(v);break n}null!=v.componentWillUpdate&&v.componentWillUpdate(b,v.__s,w),null!=v.componentDidUpdate&&v.__h.push(function(){v.componentDidUpdate(p,_,k)})}v.context=w,v.props=b,v.state=v.__s,(s=l.__r)&&s(u),v.__d=!1,v.__v=u,v.__P=n,s=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(i=a(a({},i),v.getChildContext())),h||null==v.getSnapshotBeforeUpdate||(k=v.getSnapshotBeforeUpdate(p,_)),A=null!=s&&s.type===y&&null==s.key?s.props.children:s,m(n,Array.isArray(A)?A:[A],u,t,i,r,o,f,e,c),v.base=u.__e,u.__h=null,v.__h.length&&f.push(v),x&&(v.__E=v.__=null),v.__e=!1}else null==o&&u.__v===t.__v?(u.__k=t.__k,u.__e=t.__e):u.__e=j(t.__e,u,t,i,r,o,f,c);(s=l.diffed)&&s(u)}catch(n){u.__v=null,(c||null!=o)&&(u.__e=e,u.__h=!!c,o[o.indexOf(e)]=null),l.__e(n,u,t)}}function T(n,u){l.__c&&l.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u)})}catch(n){l.__e(n,u.__v)}})}function j(l,u,t,i,r,o,f,c){var s,a,h,p=t.props,y=u.props,d=u.type,k=0;if("svg"===d&&(r=!0),null!=o)for(;k<o.length;k++)if((s=o[k])&&(s===l||(d?s.localName==d:3==s.nodeType))){l=s,o[k]=null;break}if(null==l){if(null===d)return document.createTextNode(y);l=r?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,y.is&&y),o=null,c=!1}if(null===d)p===y||c&&l.data===y||(l.data=y);else{if(o=o&&n.call(l.childNodes),a=(p=t.props||e).dangerouslySetInnerHTML,h=y.dangerouslySetInnerHTML,!c){if(null!=o)for(p={},k=0;k<l.attributes.length;k++)p[l.attributes[k].name]=l.attributes[k].value;(h||a)&&(h&&(a&&h.__html==a.__html||h.__html===l.innerHTML)||(l.innerHTML=h&&h.__html||""))}if(A(l,y,p,r,c),h)u.__k=[];else if(k=u.props.children,m(l,Array.isArray(k)?k:[k],u,t,i,r&&"foreignObject"!==d,o,f,o?o[0]:t.__k&&_(t,0),c),null!=o)for(k=o.length;k--;)null!=o[k]&&v(o[k]);c||("value"in y&&void 0!==(k=y.value)&&(k!==l.value||"progress"===d&&!k)&&C(l,"value",k,p.value,!1),"checked"in y&&void 0!==(k=y.checked)&&k!==l.checked&&C(l,"checked",k,p.checked,!1))}return l}function z(n,u,t){try{"function"==typeof n?n(u):n.current=u}catch(n){l.__e(n,t)}}function L(n,u,t){var i,r;if(l.unmount&&l.unmount(n),(i=n.ref)&&(i.current&&i.current!==n.__e||z(i,null,u)),null!=(i=n.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(n){l.__e(n,u)}i.base=i.__P=null}if(i=n.__k)for(r=0;r<i.length;r++)i[r]&&L(i[r],u,"function"!=typeof n.type);t||null==n.__e||v(n.__e),n.__e=n.__d=void 0}function M(n,l,u){return this.constructor(n,u)}function N(u,t,i){var r,o,f;l.__&&l.__(u,t),o=(r="function"==typeof i)?null:i&&i.__k||t.__k,f=[],I(t,u=(!r&&i||t).__k=h(y,null,[u]),o||e,e,void 0!==t.ownerSVGElement,!r&&i?[i]:o?null:t.firstChild?n.call(t.childNodes):null,f,!r&&i?i:o?o.__e:t.firstChild,r),T(f,u)}n=c.slice,l={__e:function(n,l){for(var u,t,i;l=l.__;)if((u=l.__c)&&!u.__)try{if((t=u.constructor)&&null!=t.getDerivedStateFromError&&(u.setState(t.getDerivedStateFromError(n)),i=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),i=u.__d),i)return u.__E=u}catch(l){n=l}throw n}},u=0,t=function(n){return null!=n&&void 0===n.constructor},d.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a({},this.state),"function"==typeof n&&(n=n(a({},u),this.props)),n&&a(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),x(this))},d.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),x(this))},d.prototype.render=y,i=[],r="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,b.__r=0,f=0,exports.render=N,exports.hydrate=function n(l,u){N(l,u,n)},exports.createElement=h,exports.h=h,exports.Fragment=y,exports.createRef=function(){return{current:null}},exports.isValidElement=t,exports.Component=d,exports.cloneElement=function(l,u,t){var i,r,o,f=a({},l.props);for(o in u)"key"==o?i=u[o]:"ref"==o?r=u[o]:f[o]=u[o];return arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):t),p(l.type,f,i||l.key,r||l.ref,null)},exports.createContext=function(n,l){var u={__c:l="__cC"+f++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,t;return this.getChildContext||(u=[],(t={})[l]=this,this.getChildContext=function(){return t},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(x)},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u},exports.toChildArray=function n(l,u){return u=u||[],null==l||"boolean"==typeof l||(Array.isArray(l)?l.some(function(l){n(l,u)}):u.push(l)),u},exports.options=l;


},{}],19:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],20:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty
  , undef;

/**
 * Decode a URI encoded string.
 *
 * @param {String} input The URI encoded string.
 * @returns {String|Null} The decoded string.
 * @api private
 */
function decode(input) {
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (e) {
    return null;
  }
}

/**
 * Attempts to encode a given input.
 *
 * @param {String} input The string that needs to be encoded.
 * @returns {String|Null} The encoded string.
 * @api private
 */
function encode(input) {
  try {
    return encodeURIComponent(input);
  } catch (e) {
    return null;
  }
}

/**
 * Simple query string parser.
 *
 * @param {String} query The query string that needs to be parsed.
 * @returns {Object}
 * @api public
 */
function querystring(query) {
  var parser = /([^=?#&]+)=?([^&]*)/g
    , result = {}
    , part;

  while (part = parser.exec(query)) {
    var key = decode(part[1])
      , value = decode(part[2]);

    //
    // Prevent overriding of existing properties. This ensures that build-in
    // methods like `toString` or __proto__ are not overriden by malicious
    // querystrings.
    //
    // In the case if failed decoding, we want to omit the key/value pairs
    // from the result.
    //
    if (key === null || value === null || key in result) continue;
    result[key] = value;
  }

  return result;
}

/**
 * Transform a query string to an object.
 *
 * @param {Object} obj Object that should be transformed.
 * @param {String} prefix Optional prefix.
 * @returns {String}
 * @api public
 */
function querystringify(obj, prefix) {
  prefix = prefix || '';

  var pairs = []
    , value
    , key;

  //
  // Optionally prefix with a '?' if needed
  //
  if ('string' !== typeof prefix) prefix = '?';

  for (key in obj) {
    if (has.call(obj, key)) {
      value = obj[key];

      //
      // Edge cases where we actually want to encode the value to an empty
      // string instead of the stringified value.
      //
      if (!value && (value === null || value === undef || isNaN(value))) {
        value = '';
      }

      key = encode(key);
      value = encode(value);

      //
      // If we failed to encode the strings, we should bail out as we don't
      // want to add invalid strings to the query.
      //
      if (key === null || value === null) continue;
      pairs.push(key +'='+ value);
    }
  }

  return pairs.length ? prefix + pairs.join('&') : '';
}

//
// Expose the module.
//
exports.stringify = querystringify;
exports.parse = querystring;

},{}],21:[function(require,module,exports){
'use strict';

/**
 * Check if we're required to add a port number.
 *
 * @see https://url.spec.whatwg.org/#default-port
 * @param {Number|String} port Port number we need to check
 * @param {String} protocol Protocol we need to check against.
 * @returns {Boolean} Is it a default port for the given protocol
 * @api private
 */
module.exports = function required(port, protocol) {
  protocol = protocol.split(':')[0];
  port = +port;

  if (!port) return false;

  switch (protocol) {
    case 'http':
    case 'ws':
    return port !== 80;

    case 'https':
    case 'wss':
    return port !== 443;

    case 'ftp':
    return port !== 21;

    case 'gopher':
    return port !== 70;

    case 'file':
    return false;
  }

  return port !== 0;
};

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isReactNative = _interopRequireDefault(require("./isReactNative"));

var _uriToBlob = _interopRequireDefault(require("./uriToBlob"));

var _isCordova = _interopRequireDefault(require("./isCordova"));

var _readAsByteArray = _interopRequireDefault(require("./readAsByteArray"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

var FileSource = /*#__PURE__*/function () {
  // Make this.size a method
  function FileSource(file) {
    _classCallCheck(this, FileSource);

    this._file = file;
    this.size = file.size;
  }

  _createClass(FileSource, [{
    key: "slice",
    value: function slice(start, end) {
      // In Apache Cordova applications, a File must be resolved using
      // FileReader instances, see
      // https://cordova.apache.org/docs/en/8.x/reference/cordova-plugin-file/index.html#read-a-file
      if ((0, _isCordova.default)()) {
        return (0, _readAsByteArray.default)(this._file.slice(start, end));
      }

      var value = this._file.slice(start, end);

      return Promise.resolve({
        value: value
      });
    }
  }, {
    key: "close",
    value: function close() {// Nothing to do here since we don't need to release any resources.
    }
  }]);

  return FileSource;
}();

var StreamSource = /*#__PURE__*/function () {
  function StreamSource(reader, chunkSize) {
    _classCallCheck(this, StreamSource);

    this._chunkSize = chunkSize;
    this._buffer = undefined;
    this._bufferOffset = 0;
    this._reader = reader;
    this._done = false;
  }

  _createClass(StreamSource, [{
    key: "slice",
    value: function slice(start, end) {
      if (start < this._bufferOffset) {
        return Promise.reject(new Error("Requested data is before the reader's current offset"));
      }

      return this._readUntilEnoughDataOrDone(start, end);
    }
  }, {
    key: "_readUntilEnoughDataOrDone",
    value: function _readUntilEnoughDataOrDone(start, end) {
      var _this = this;

      var hasEnoughData = end <= this._bufferOffset + len(this._buffer);

      if (this._done || hasEnoughData) {
        var value = this._getDataFromBuffer(start, end);

        var done = value == null ? this._done : false;
        return Promise.resolve({
          value: value,
          done: done
        });
      }

      return this._reader.read().then(function (_ref) {
        var value = _ref.value,
            done = _ref.done;

        if (done) {
          _this._done = true;
        } else if (_this._buffer === undefined) {
          _this._buffer = value;
        } else {
          _this._buffer = concat(_this._buffer, value);
        }

        return _this._readUntilEnoughDataOrDone(start, end);
      });
    }
  }, {
    key: "_getDataFromBuffer",
    value: function _getDataFromBuffer(start, end) {
      // Remove data from buffer before `start`.
      // Data might be reread from the buffer if an upload fails, so we can only
      // safely delete data when it comes *before* what is currently being read.
      if (start > this._bufferOffset) {
        this._buffer = this._buffer.slice(start - this._bufferOffset);
        this._bufferOffset = start;
      } // If the buffer is empty after removing old data, all data has been read.


      var hasAllDataBeenRead = len(this._buffer) === 0;

      if (this._done && hasAllDataBeenRead) {
        return null;
      } // We already removed data before `start`, so we just return the first
      // chunk from the buffer.


      return this._buffer.slice(0, end - start);
    }
  }, {
    key: "close",
    value: function close() {
      if (this._reader.cancel) {
        this._reader.cancel();
      }
    }
  }]);

  return StreamSource;
}();

function len(blobOrArray) {
  if (blobOrArray === undefined) return 0;
  if (blobOrArray.size !== undefined) return blobOrArray.size;
  return blobOrArray.length;
}
/*
  Typed arrays and blobs don't have a concat method.
  This function helps StreamSource accumulate data to reach chunkSize.
*/


function concat(a, b) {
  if (a.concat) {
    // Is `a` an Array?
    return a.concat(b);
  }

  if (a instanceof Blob) {
    return new Blob([a, b], {
      type: a.type
    });
  }

  if (a.set) {
    // Is `a` a typed array?
    var c = new a.constructor(a.length + b.length);
    c.set(a);
    c.set(b, a.length);
    return c;
  }

  throw new Error('Unknown data type');
}

var FileReader = /*#__PURE__*/function () {
  function FileReader() {
    _classCallCheck(this, FileReader);
  }

  _createClass(FileReader, [{
    key: "openFile",
    value: function openFile(input, chunkSize) {
      // In React Native, when user selects a file, instead of a File or Blob,
      // you usually get a file object {} with a uri property that contains
      // a local path to the file. We use XMLHttpRequest to fetch
      // the file blob, before uploading with tus.
      if ((0, _isReactNative.default)() && input && typeof input.uri !== 'undefined') {
        return (0, _uriToBlob.default)(input.uri).then(function (blob) {
          return new FileSource(blob);
        })["catch"](function (err) {
          throw new Error("tus: cannot fetch `file.uri` as Blob, make sure the uri is correct and accessible. ".concat(err));
        });
      } // Since we emulate the Blob type in our tests (not all target browsers
      // support it), we cannot use `instanceof` for testing whether the input value
      // can be handled. Instead, we simply check is the slice() function and the
      // size property are available.


      if (typeof input.slice === 'function' && typeof input.size !== 'undefined') {
        return Promise.resolve(new FileSource(input));
      }

      if (typeof input.read === 'function') {
        chunkSize = +chunkSize;

        if (!isFinite(chunkSize)) {
          return Promise.reject(new Error('cannot create source for stream without a finite value for the `chunkSize` option'));
        }

        return Promise.resolve(new StreamSource(input, chunkSize));
      }

      return Promise.reject(new Error('source object may only be an instance of File, Blob, or Reader in this environment'));
    }
  }]);

  return FileReader;
}();

exports.default = FileReader;
},{"./isCordova":26,"./isReactNative":27,"./readAsByteArray":28,"./uriToBlob":29}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fingerprint;

var _isReactNative = _interopRequireDefault(require("./isReactNative"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: Differenciate between input types

/**
 * Generate a fingerprint for a file which will be used the store the endpoint
 *
 * @param {File} file
 * @param {Object} options
 * @param {Function} callback
 */
function fingerprint(file, options) {
  if ((0, _isReactNative.default)()) {
    return Promise.resolve(reactNativeFingerprint(file, options));
  }

  return Promise.resolve(['tus-br', file.name, file.type, file.size, file.lastModified, options.endpoint].join('-'));
}

function reactNativeFingerprint(file, options) {
  var exifHash = file.exif ? hashCode(JSON.stringify(file.exif)) : 'noexif';
  return ['tus-rn', file.name || 'noname', file.size || 'nosize', exifHash, options.endpoint].join('/');
}

function hashCode(str) {
  // from https://stackoverflow.com/a/8831937/151666
  var hash = 0;

  if (str.length === 0) {
    return hash;
  }

  for (var i = 0; i < str.length; i++) {
    var _char = str.charCodeAt(i);

    hash = (hash << 5) - hash + _char;
    hash &= hash; // Convert to 32bit integer
  }

  return hash;
}
},{"./isReactNative":27}],24:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
/* global window */


var XHRHttpStack = /*#__PURE__*/function () {
  function XHRHttpStack() {
    _classCallCheck(this, XHRHttpStack);
  }

  _createClass(XHRHttpStack, [{
    key: "createRequest",
    value: function createRequest(method, url) {
      return new Request(method, url);
    }
  }, {
    key: "getName",
    value: function getName() {
      return 'XHRHttpStack';
    }
  }]);

  return XHRHttpStack;
}();

exports.default = XHRHttpStack;

var Request = /*#__PURE__*/function () {
  function Request(method, url) {
    _classCallCheck(this, Request);

    this._xhr = new XMLHttpRequest();

    this._xhr.open(method, url, true);

    this._method = method;
    this._url = url;
    this._headers = {};
  }

  _createClass(Request, [{
    key: "getMethod",
    value: function getMethod() {
      return this._method;
    }
  }, {
    key: "getURL",
    value: function getURL() {
      return this._url;
    }
  }, {
    key: "setHeader",
    value: function setHeader(header, value) {
      this._xhr.setRequestHeader(header, value);

      this._headers[header] = value;
    }
  }, {
    key: "getHeader",
    value: function getHeader(header) {
      return this._headers[header];
    }
  }, {
    key: "setProgressHandler",
    value: function setProgressHandler(progressHandler) {
      // Test support for progress events before attaching an event listener
      if (!('upload' in this._xhr)) {
        return;
      }

      this._xhr.upload.onprogress = function (e) {
        if (!e.lengthComputable) {
          return;
        }

        progressHandler(e.loaded);
      };
    }
  }, {
    key: "send",
    value: function send() {
      var _this = this;

      var body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      return new Promise(function (resolve, reject) {
        _this._xhr.onload = function () {
          resolve(new Response(_this._xhr));
        };

        _this._xhr.onerror = function (err) {
          reject(err);
        };

        _this._xhr.send(body);
      });
    }
  }, {
    key: "abort",
    value: function abort() {
      this._xhr.abort();

      return Promise.resolve();
    }
  }, {
    key: "getUnderlyingObject",
    value: function getUnderlyingObject() {
      return this._xhr;
    }
  }]);

  return Request;
}();

var Response = /*#__PURE__*/function () {
  function Response(xhr) {
    _classCallCheck(this, Response);

    this._xhr = xhr;
  }

  _createClass(Response, [{
    key: "getStatus",
    value: function getStatus() {
      return this._xhr.status;
    }
  }, {
    key: "getHeader",
    value: function getHeader(header) {
      return this._xhr.getResponseHeader(header);
    }
  }, {
    key: "getBody",
    value: function getBody() {
      return this._xhr.responseText;
    }
  }, {
    key: "getUnderlyingObject",
    value: function getUnderlyingObject() {
      return this._xhr;
    }
  }]);

  return Response;
}();
},{}],25:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "enableDebugLog", {
  enumerable: true,
  get: function () {
    return _logger.enableDebugLog;
  }
});
Object.defineProperty(exports, "canStoreURLs", {
  enumerable: true,
  get: function () {
    return _urlStorage.canStoreURLs;
  }
});
Object.defineProperty(exports, "HttpStack", {
  enumerable: true,
  get: function () {
    return _httpStack.default;
  }
});
exports.isSupported = exports.defaultOptions = exports.Upload = void 0;

var _upload = _interopRequireDefault(require("../upload"));

var _noopUrlStorage = _interopRequireDefault(require("../noopUrlStorage"));

var _logger = require("../logger");

var _urlStorage = require("./urlStorage");

var _httpStack = _interopRequireDefault(require("./httpStack"));

var _fileReader = _interopRequireDefault(require("./fileReader"));

var _fingerprint = _interopRequireDefault(require("./fingerprint"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _createSuper(Derived) {
  return function () {
    var Super = _getPrototypeOf(Derived),
        result;

    if (_isNativeReflectConstruct()) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}
/* global window */


var defaultOptions = _objectSpread({}, _upload.default.defaultOptions, {
  httpStack: new _httpStack.default(),
  fileReader: new _fileReader.default(),
  urlStorage: _urlStorage.canStoreURLs ? new _urlStorage.WebStorageUrlStorage() : new _noopUrlStorage.default(),
  fingerprint: _fingerprint.default
});

exports.defaultOptions = defaultOptions;

var Upload = /*#__PURE__*/function (_BaseUpload) {
  _inherits(Upload, _BaseUpload);

  var _super = _createSuper(Upload);

  function Upload() {
    var file = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Upload);

    options = _objectSpread({}, defaultOptions, {}, options);
    return _super.call(this, file, options);
  }

  _createClass(Upload, null, [{
    key: "terminate",
    value: function terminate(url, options, cb) {
      options = _objectSpread({}, defaultOptions, {}, options);
      return _upload.default.terminate(url, options, cb);
    }
  }]);

  return Upload;
}(_upload.default);

exports.Upload = Upload;
var _window = window,
    XMLHttpRequest = _window.XMLHttpRequest,
    Blob = _window.Blob;
var isSupported = XMLHttpRequest && Blob && typeof Blob.prototype.slice === 'function';
exports.isSupported = isSupported;
},{"../logger":32,"../noopUrlStorage":33,"../upload":34,"./fileReader":22,"./fingerprint":23,"./httpStack":24,"./urlStorage":30}],26:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var isCordova = function isCordova() {
  return typeof window != 'undefined' && (typeof window.PhoneGap != 'undefined' || typeof window.Cordova != 'undefined' || typeof window.cordova != 'undefined');
};

var _default = isCordova;
exports.default = _default;
},{}],27:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var isReactNative = function isReactNative() {
  return typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';
};

var _default = isReactNative;
exports.default = _default;
},{}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = readAsByteArray;

/**
 * readAsByteArray converts a File object to a Uint8Array.
 * This function is only used on the Apache Cordova platform.
 * See https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html#read-a-file
 */
function readAsByteArray(chunk) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();

    reader.onload = function () {
      var value = new Uint8Array(reader.result);
      resolve({
        value: value
      });
    };

    reader.onerror = function (err) {
      reject(err);
    };

    reader.readAsArrayBuffer(chunk);
  });
}
},{}],29:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = uriToBlob;

/**
 * uriToBlob resolves a URI to a Blob object. This is used for
 * React Native to retrieve a file (identified by a file://
 * URI) as a blob.
 */
function uriToBlob(uri) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';

    xhr.onload = function () {
      var blob = xhr.response;
      resolve(blob);
    };

    xhr.onerror = function (err) {
      reject(err);
    };

    xhr.open('GET', uri);
    xhr.send();
  });
}
},{}],30:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebStorageUrlStorage = exports.canStoreURLs = void 0;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
/* global window, localStorage */


var hasStorage = false;

try {
  hasStorage = 'localStorage' in window; // Attempt to store and read entries from the local storage to detect Private
  // Mode on Safari on iOS (see #49)

  var key = 'tusSupport';
  localStorage.setItem(key, localStorage.getItem(key));
} catch (e) {
  // If we try to access localStorage inside a sandboxed iframe, a SecurityError
  // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
  // thrown (see #49)
  if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
    hasStorage = false;
  } else {
    throw e;
  }
}

var canStoreURLs = hasStorage;
exports.canStoreURLs = canStoreURLs;

var WebStorageUrlStorage = /*#__PURE__*/function () {
  function WebStorageUrlStorage() {
    _classCallCheck(this, WebStorageUrlStorage);
  }

  _createClass(WebStorageUrlStorage, [{
    key: "findAllUploads",
    value: function findAllUploads() {
      var results = this._findEntries('tus::');

      return Promise.resolve(results);
    }
  }, {
    key: "findUploadsByFingerprint",
    value: function findUploadsByFingerprint(fingerprint) {
      var results = this._findEntries("tus::".concat(fingerprint, "::"));

      return Promise.resolve(results);
    }
  }, {
    key: "removeUpload",
    value: function removeUpload(urlStorageKey) {
      localStorage.removeItem(urlStorageKey);
      return Promise.resolve();
    }
  }, {
    key: "addUpload",
    value: function addUpload(fingerprint, upload) {
      var id = Math.round(Math.random() * 1e12);
      var key = "tus::".concat(fingerprint, "::").concat(id);
      localStorage.setItem(key, JSON.stringify(upload));
      return Promise.resolve(key);
    }
  }, {
    key: "_findEntries",
    value: function _findEntries(prefix) {
      var results = [];

      for (var i = 0; i < localStorage.length; i++) {
        var _key = localStorage.key(i);

        if (_key.indexOf(prefix) !== 0) continue;

        try {
          var upload = JSON.parse(localStorage.getItem(_key));
          upload.urlStorageKey = _key;
          results.push(upload);
        } catch (e) {// The JSON parse error is intentionally ignored here, so a malformed
          // entry in the storage cannot prevent an upload.
        }
      }

      return results;
    }
  }]);

  return WebStorageUrlStorage;
}();

exports.WebStorageUrlStorage = WebStorageUrlStorage;
},{}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _createSuper(Derived) {
  return function () {
    var Super = _getPrototypeOf(Derived),
        result;

    if (_isNativeReflectConstruct()) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

var DetailedError = /*#__PURE__*/function (_Error) {
  _inherits(DetailedError, _Error);

  var _super = _createSuper(DetailedError);

  function DetailedError(message) {
    var _this;

    var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var req = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var res = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

    _classCallCheck(this, DetailedError);

    _this = _super.call(this, message);
    _this.originalRequest = req;
    _this.originalResponse = res;
    _this.causingError = causingErr;

    if (causingErr != null) {
      message += ", caused by ".concat(causingErr.toString());
    }

    if (req != null) {
      var requestId = req.getHeader('X-Request-ID') || 'n/a';
      var method = req.getMethod();
      var url = req.getURL();
      var status = res ? res.getStatus() : 'n/a';
      var body = res ? res.getBody() || '' : 'n/a';
      message += ", originated from request (method: ".concat(method, ", url: ").concat(url, ", response code: ").concat(status, ", response text: ").concat(body, ", request id: ").concat(requestId, ")");
    }

    _this.message = message;
    return _this;
  }

  return DetailedError;
}( /*#__PURE__*/_wrapNativeSuper(Error));

var _default = DetailedError;
exports.default = _default;
},{}],32:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enableDebugLog = enableDebugLog;
exports.log = log;

/* eslint no-console: "off" */
var isEnabled = false;

function enableDebugLog() {
  isEnabled = true;
}

function log(msg) {
  if (!isEnabled) return;
  console.log(msg);
}
},{}],33:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
/* eslint no-unused-vars: "off" */


var NoopUrlStorage = /*#__PURE__*/function () {
  function NoopUrlStorage() {
    _classCallCheck(this, NoopUrlStorage);
  }

  _createClass(NoopUrlStorage, [{
    key: "listAllUploads",
    value: function listAllUploads() {
      return Promise.resolve([]);
    }
  }, {
    key: "findUploadsByFingerprint",
    value: function findUploadsByFingerprint(fingerprint) {
      return Promise.resolve([]);
    }
  }, {
    key: "removeUpload",
    value: function removeUpload(urlStorageKey) {
      return Promise.resolve();
    }
  }, {
    key: "addUpload",
    value: function addUpload(fingerprint, upload) {
      return Promise.resolve(null);
    }
  }]);

  return NoopUrlStorage;
}();

exports.default = NoopUrlStorage;
},{}],34:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _jsBase = require("js-base64");

var _urlParse = _interopRequireDefault(require("url-parse"));

var _error = _interopRequireDefault(require("./error"));

var _logger = require("./logger");

var _uuid = _interopRequireDefault(require("./uuid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
/* global window */


var defaultOptions = {
  endpoint: null,
  uploadUrl: null,
  metadata: {},
  fingerprint: null,
  uploadSize: null,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  _onUploadUrlAvailable: null,
  overridePatchMethod: false,
  headers: {},
  addRequestId: false,
  onBeforeRequest: null,
  onAfterResponse: null,
  onShouldRetry: null,
  chunkSize: Infinity,
  retryDelays: [0, 1000, 3000, 5000],
  parallelUploads: 1,
  storeFingerprintForResuming: true,
  removeFingerprintOnSuccess: false,
  uploadLengthDeferred: false,
  uploadDataDuringCreation: false,
  urlStorage: null,
  fileReader: null,
  httpStack: null
};

var BaseUpload = /*#__PURE__*/function () {
  function BaseUpload(file, options) {
    _classCallCheck(this, BaseUpload); // Warn about removed options from previous versions


    if ('resume' in options) {
      console.log('tus: The `resume` option has been removed in tus-js-client v2. Please use the URL storage API instead.'); // eslint-disable-line no-console
    } // The default options will already be added from the wrapper classes.


    this.options = options; // The storage module used to store URLs

    this._urlStorage = this.options.urlStorage; // The underlying File/Blob object

    this.file = file; // The URL against which the file will be uploaded

    this.url = null; // The underlying request object for the current PATCH request

    this._req = null; // The fingerpinrt for the current file (set after start())

    this._fingerprint = null; // The key that the URL storage returned when saving an URL with a fingerprint,

    this._urlStorageKey = null; // The offset used in the current PATCH request

    this._offset = null; // True if the current PATCH request has been aborted

    this._aborted = false; // The file's size in bytes

    this._size = null; // The Source object which will wrap around the given file and provides us
    // with a unified interface for getting its size and slice chunks from its
    // content allowing us to easily handle Files, Blobs, Buffers and Streams.

    this._source = null; // The current count of attempts which have been made. Zero indicates none.

    this._retryAttempt = 0; // The timeout's ID which is used to delay the next retry

    this._retryTimeout = null; // The offset of the remote upload before the latest attempt was started.

    this._offsetBeforeRetry = 0; // An array of BaseUpload instances which are used for uploading the different
    // parts, if the parallelUploads option is used.

    this._parallelUploads = null; // An array of upload URLs which are used for uploading the different
    // parts, if the parallelUploads option is used.

    this._parallelUploadUrls = null;
  }
  /**
   * Use the Termination extension to delete an upload from the server by sending a DELETE
   * request to the specified upload URL. This is only possible if the server supports the
   * Termination extension. If the `options.retryDelays` property is set, the method will
   * also retry if an error ocurrs.
   *
   * @param {String} url The upload's URL which will be terminated.
   * @param {object} options Optional options for influencing HTTP requests.
   * @return {Promise} The Promise will be resolved/rejected when the requests finish.
   */


  _createClass(BaseUpload, [{
    key: "findPreviousUploads",
    value: function findPreviousUploads() {
      var _this = this;

      return this.options.fingerprint(this.file, this.options).then(function (fingerprint) {
        return _this._urlStorage.findUploadsByFingerprint(fingerprint);
      });
    }
  }, {
    key: "resumeFromPreviousUpload",
    value: function resumeFromPreviousUpload(previousUpload) {
      this.url = previousUpload.uploadUrl || null;
      this._parallelUploadUrls = previousUpload.parallelUploadUrls || null;
      this._urlStorageKey = previousUpload.urlStorageKey;
    }
  }, {
    key: "start",
    value: function start() {
      var _this2 = this;

      var file = this.file;

      if (!file) {
        this._emitError(new Error('tus: no file or stream to upload provided'));

        return;
      }

      if (!this.options.endpoint && !this.options.uploadUrl) {
        this._emitError(new Error('tus: neither an endpoint or an upload URL is provided'));

        return;
      }

      var retryDelays = this.options.retryDelays;

      if (retryDelays != null && Object.prototype.toString.call(retryDelays) !== '[object Array]') {
        this._emitError(new Error('tus: the `retryDelays` option must either be an array or null'));

        return;
      }

      if (this.options.parallelUploads > 1) {
        // Test which options are incompatible with parallel uploads.
        ['uploadUrl', 'uploadSize', 'uploadLengthDeferred'].forEach(function (optionName) {
          if (_this2.options[optionName]) {
            _this2._emitError(new Error("tus: cannot use the ".concat(optionName, " option when parallelUploads is enabled")));
          }
        });
      }

      this.options.fingerprint(file, this.options).then(function (fingerprint) {
        if (fingerprint == null) {
          (0, _logger.log)('No fingerprint was calculated meaning that the upload cannot be stored in the URL storage.');
        } else {
          (0, _logger.log)("Calculated fingerprint: ".concat(fingerprint));
        }

        _this2._fingerprint = fingerprint;

        if (_this2._source) {
          return _this2._source;
        }

        return _this2.options.fileReader.openFile(file, _this2.options.chunkSize);
      }).then(function (source) {
        _this2._source = source; // If the upload was configured to use multiple requests or if we resume from
        // an upload which used multiple requests, we start a parallel upload.

        if (_this2.options.parallelUploads > 1 || _this2._parallelUploadUrls != null) {
          _this2._startParallelUpload();
        } else {
          _this2._startSingleUpload();
        }
      })["catch"](function (err) {
        _this2._emitError(err);
      });
    }
    /**
     * Initiate the uploading procedure for a parallelized upload, where one file is split into
     * multiple request which are run in parallel.
     *
     * @api private
     */

  }, {
    key: "_startParallelUpload",
    value: function _startParallelUpload() {
      var _this3 = this;

      var totalSize = this._size = this._source.size;
      var totalProgress = 0;
      this._parallelUploads = [];
      var partCount = this._parallelUploadUrls != null ? this._parallelUploadUrls.length : this.options.parallelUploads; // The input file will be split into multiple slices which are uploaded in separate
      // requests. Here we generate the start and end position for the slices.

      var parts = splitSizeIntoParts(this._source.size, partCount, this._parallelUploadUrls); // Create an empty list for storing the upload URLs

      this._parallelUploadUrls = new Array(parts.length); // Generate a promise for each slice that will be resolve if the respective
      // upload is completed.

      var uploads = parts.map(function (part, index) {
        var lastPartProgress = 0;
        return _this3._source.slice(part.start, part.end).then(function (_ref) {
          var value = _ref.value;
          return new Promise(function (resolve, reject) {
            // Merge with the user supplied options but overwrite some values.
            var options = _objectSpread({}, _this3.options, {
              // If available, the partial upload should be resumed from a previous URL.
              uploadUrl: part.uploadUrl || null,
              // We take manually care of resuming for partial uploads, so they should
              // not be stored in the URL storage.
              storeFingerprintForResuming: false,
              removeFingerprintOnSuccess: false,
              // Reset the parallelUploads option to not cause recursion.
              parallelUploads: 1,
              metadata: {},
              // Add the header to indicate the this is a partial upload.
              headers: _objectSpread({}, _this3.options.headers, {
                'Upload-Concat': 'partial'
              }),
              // Reject or resolve the promise if the upload errors or completes.
              onSuccess: resolve,
              onError: reject,
              // Based in the progress for this partial upload, calculate the progress
              // for the entire final upload.
              onProgress: function onProgress(newPartProgress) {
                totalProgress = totalProgress - lastPartProgress + newPartProgress;
                lastPartProgress = newPartProgress;

                _this3._emitProgress(totalProgress, totalSize);
              },
              // Wait until every partial upload has an upload URL, so we can add
              // them to the URL storage.
              _onUploadUrlAvailable: function _onUploadUrlAvailable() {
                _this3._parallelUploadUrls[index] = upload.url; // Test if all uploads have received an URL

                if (_this3._parallelUploadUrls.filter(function (u) {
                  return !!u;
                }).length === parts.length) {
                  _this3._saveUploadInUrlStorage();
                }
              }
            });

            var upload = new BaseUpload(value, options);
            upload.start(); // Store the upload in an array, so we can later abort them if necessary.

            _this3._parallelUploads.push(upload);
          });
        });
      });
      var req; // Wait until all partial uploads are finished and we can send the POST request for
      // creating the final upload.

      Promise.all(uploads).then(function () {
        req = _this3._openRequest('POST', _this3.options.endpoint);
        req.setHeader('Upload-Concat', "final;".concat(_this3._parallelUploadUrls.join(' '))); // Add metadata if values have been added

        var metadata = encodeMetadata(_this3.options.metadata);

        if (metadata !== '') {
          req.setHeader('Upload-Metadata', metadata);
        }

        return _this3._sendRequest(req, null);
      }).then(function (res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this3._emitHttpError(req, res, 'tus: unexpected response while creating upload');

          return;
        }

        var location = res.getHeader('Location');

        if (location == null) {
          _this3._emitHttpError(req, res, 'tus: invalid or missing Location header');

          return;
        }

        _this3.url = resolveUrl(_this3.options.endpoint, location);
        (0, _logger.log)("Created upload at ".concat(_this3.url));

        _this3._emitSuccess();
      })["catch"](function (err) {
        _this3._emitError(err);
      });
    }
    /**
     * Initiate the uploading procedure for a non-parallel upload. Here the entire file is
     * uploaded in a sequential matter.
     *
     * @api private
     */

  }, {
    key: "_startSingleUpload",
    value: function _startSingleUpload() {
      // First, we look at the uploadLengthDeferred option.
      // Next, we check if the caller has supplied a manual upload size.
      // Finally, we try to use the calculated size from the source object.
      if (this.options.uploadLengthDeferred) {
        this._size = null;
      } else if (this.options.uploadSize != null) {
        this._size = +this.options.uploadSize;

        if (isNaN(this._size)) {
          this._emitError(new Error('tus: cannot convert `uploadSize` option into a number'));

          return;
        }
      } else {
        this._size = this._source.size;

        if (this._size == null) {
          this._emitError(new Error("tus: cannot automatically derive upload's size from input and must be specified manually using the `uploadSize` option"));

          return;
        }
      } // Reset the aborted flag when the upload is started or else the
      // _performUpload will stop before sending a request if the upload has been
      // aborted previously.


      this._aborted = false; // The upload had been started previously and we should reuse this URL.

      if (this.url != null) {
        (0, _logger.log)("Resuming upload from previous URL: ".concat(this.url));

        this._resumeUpload();

        return;
      } // A URL has manually been specified, so we try to resume


      if (this.options.uploadUrl != null) {
        (0, _logger.log)("Resuming upload from provided URL: ".concat(this.options.url));
        this.url = this.options.uploadUrl;

        this._resumeUpload();

        return;
      } // An upload has not started for the file yet, so we start a new one


      (0, _logger.log)('Creating a new upload');

      this._createUpload();
    }
    /**
     * Abort any running request and stop the current upload. After abort is called, no event
     * handler will be invoked anymore. You can use the `start` method to resume the upload
     * again.
     * If `shouldTerminate` is true, the `terminate` function will be called to remove the
     * current upload from the server.
     *
     * @param {boolean} shouldTerminate True if the upload should be deleted from the server.
     * @return {Promise} The Promise will be resolved/rejected when the requests finish.
     */

  }, {
    key: "abort",
    value: function abort(shouldTerminate) {
      var _this4 = this; // Count the number of arguments to see if a callback is being provided in the old style required by tus-js-client 1.x, then throw an error if it is.
      // `arguments` is a JavaScript built-in variable that contains all of the function's arguments.


      if (arguments.length > 1 && typeof arguments[1] === 'function') {
        throw new Error('tus: the abort function does not accept a callback since v2 anymore; please use the returned Promise instead');
      } // Stop any parallel partial uploads, that have been started in _startParallelUploads.


      if (this._parallelUploads != null) {
        this._parallelUploads.forEach(function (upload) {
          upload.abort(shouldTerminate);
        });
      } // Stop any current running request.


      if (this._req !== null) {
        this._req.abort();

        this._source.close();
      }

      this._aborted = true; // Stop any timeout used for initiating a retry.

      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = null;
      }

      if (!shouldTerminate || this.url == null) {
        return Promise.resolve();
      }

      return BaseUpload.terminate(this.url, this.options) // Remove entry from the URL storage since the upload URL is no longer valid.
      .then(function () {
        return _this4._removeFromUrlStorage();
      });
    }
  }, {
    key: "_emitHttpError",
    value: function _emitHttpError(req, res, message, causingErr) {
      this._emitError(new _error.default(message, causingErr, req, res));
    }
  }, {
    key: "_emitError",
    value: function _emitError(err) {
      var _this5 = this; // Do not emit errors, e.g. from aborted HTTP requests, if the upload has been stopped.


      if (this._aborted) return; // Check if we should retry, when enabled, before sending the error to the user.

      if (this.options.retryDelays != null) {
        // We will reset the attempt counter if
        // - we were already able to connect to the server (offset != null) and
        // - we were able to upload a small chunk of data to the server
        var shouldResetDelays = this._offset != null && this._offset > this._offsetBeforeRetry;

        if (shouldResetDelays) {
          this._retryAttempt = 0;
        }

        if (shouldRetry(err, this._retryAttempt, this.options)) {
          var delay = this.options.retryDelays[this._retryAttempt++];
          this._offsetBeforeRetry = this._offset;
          this._retryTimeout = setTimeout(function () {
            _this5.start();
          }, delay);
          return;
        }
      }

      if (typeof this.options.onError === 'function') {
        this.options.onError(err);
      } else {
        throw err;
      }
    }
    /**
     * Publishes notification if the upload has been successfully completed.
     *
     * @api private
     */

  }, {
    key: "_emitSuccess",
    value: function _emitSuccess() {
      if (this.options.removeFingerprintOnSuccess) {
        // Remove stored fingerprint and corresponding endpoint. This causes
        // new uploads of the same file to be treated as a different file.
        this._removeFromUrlStorage();
      }

      if (typeof this.options.onSuccess === 'function') {
        this.options.onSuccess();
      }
    }
    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     *
     * @param {number} bytesSent  Number of bytes sent to the server.
     * @param {number} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */

  }, {
    key: "_emitProgress",
    value: function _emitProgress(bytesSent, bytesTotal) {
      if (typeof this.options.onProgress === 'function') {
        this.options.onProgress(bytesSent, bytesTotal);
      }
    }
    /**
     * Publishes notification when a chunk of data has been sent to the server
     * and accepted by the server.
     * @param {number} chunkSize  Size of the chunk that was accepted by the server.
     * @param {number} bytesAccepted Total number of bytes that have been
     *                                accepted by the server.
     * @param {number} bytesTotal Total number of bytes to be sent to the server.
     * @api private
     */

  }, {
    key: "_emitChunkComplete",
    value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
      if (typeof this.options.onChunkComplete === 'function') {
        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
      }
    }
    /**
     * Create a new upload using the creation extension by sending a POST
     * request to the endpoint. After successful creation the file will be
     * uploaded
     *
     * @api private
     */

  }, {
    key: "_createUpload",
    value: function _createUpload() {
      var _this6 = this;

      if (!this.options.endpoint) {
        this._emitError(new Error('tus: unable to create upload because no endpoint is provided'));

        return;
      }

      var req = this._openRequest('POST', this.options.endpoint);

      if (this.options.uploadLengthDeferred) {
        req.setHeader('Upload-Defer-Length', 1);
      } else {
        req.setHeader('Upload-Length', this._size);
      } // Add metadata if values have been added


      var metadata = encodeMetadata(this.options.metadata);

      if (metadata !== '') {
        req.setHeader('Upload-Metadata', metadata);
      }

      var promise;

      if (this.options.uploadDataDuringCreation && !this.options.uploadLengthDeferred) {
        this._offset = 0;
        promise = this._addChunkToRequest(req);
      } else {
        promise = this._sendRequest(req, null);
      }

      promise.then(function (res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this6._emitHttpError(req, res, 'tus: unexpected response while creating upload');

          return;
        }

        var location = res.getHeader('Location');

        if (location == null) {
          _this6._emitHttpError(req, res, 'tus: invalid or missing Location header');

          return;
        }

        _this6.url = resolveUrl(_this6.options.endpoint, location);
        (0, _logger.log)("Created upload at ".concat(_this6.url));

        if (typeof _this6.options._onUploadUrlAvailable === 'function') {
          _this6.options._onUploadUrlAvailable();
        }

        if (_this6._size === 0) {
          // Nothing to upload and file was successfully created
          _this6._emitSuccess();

          _this6._source.close();

          return;
        }

        _this6._saveUploadInUrlStorage();

        if (_this6.options.uploadDataDuringCreation) {
          _this6._handleUploadResponse(req, res);
        } else {
          _this6._offset = 0;

          _this6._performUpload();
        }
      })["catch"](function (err) {
        _this6._emitHttpError(req, null, 'tus: failed to create upload', err);
      });
    }
    /*
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */

  }, {
    key: "_resumeUpload",
    value: function _resumeUpload() {
      var _this7 = this;

      var req = this._openRequest('HEAD', this.url);

      var promise = this._sendRequest(req, null);

      promise.then(function (res) {
        var status = res.getStatus();

        if (!inStatusCategory(status, 200)) {
          if (inStatusCategory(status, 400)) {
            // Remove stored fingerprint and corresponding endpoint,
            // on client errors since the file can not be found
            _this7._removeFromUrlStorage();
          } // If the upload is locked (indicated by the 423 Locked status code), we
          // emit an error instead of directly starting a new upload. This way the
          // retry logic can catch the error and will retry the upload. An upload
          // is usually locked for a short period of time and will be available
          // afterwards.


          if (status === 423) {
            _this7._emitHttpError(req, res, 'tus: upload is currently locked; retry later');

            return;
          }

          if (!_this7.options.endpoint) {
            // Don't attempt to create a new upload if no endpoint is provided.
            _this7._emitHttpError(req, res, 'tus: unable to resume upload (new upload cannot be created without an endpoint)');

            return;
          } // Try to create a new upload


          _this7.url = null;

          _this7._createUpload();

          return;
        }

        var offset = parseInt(res.getHeader('Upload-Offset'), 10);

        if (isNaN(offset)) {
          _this7._emitHttpError(req, res, 'tus: invalid or missing offset value');

          return;
        }

        var length = parseInt(res.getHeader('Upload-Length'), 10);

        if (isNaN(length) && !_this7.options.uploadLengthDeferred) {
          _this7._emitHttpError(req, res, 'tus: invalid or missing length value');

          return;
        }

        if (typeof _this7.options._onUploadUrlAvailable === 'function') {
          _this7.options._onUploadUrlAvailable();
        } // Upload has already been completed and we do not need to send additional
        // data to the server


        if (offset === length) {
          _this7._emitProgress(length, length);

          _this7._emitSuccess();

          return;
        }

        _this7._offset = offset;

        _this7._performUpload();
      })["catch"](function (err) {
        _this7._emitHttpError(req, null, 'tus: failed to resume upload', err);
      });
    }
    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */

  }, {
    key: "_performUpload",
    value: function _performUpload() {
      var _this8 = this; // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.


      if (this._aborted) {
        return;
      }

      var req; // Some browser and servers may not support the PATCH method. For those
      // cases, you can tell tus-js-client to use a POST request with the
      // X-HTTP-Method-Override header for simulating a PATCH request.

      if (this.options.overridePatchMethod) {
        req = this._openRequest('POST', this.url);
        req.setHeader('X-HTTP-Method-Override', 'PATCH');
      } else {
        req = this._openRequest('PATCH', this.url);
      }

      req.setHeader('Upload-Offset', this._offset);

      var promise = this._addChunkToRequest(req);

      promise.then(function (res) {
        if (!inStatusCategory(res.getStatus(), 200)) {
          _this8._emitHttpError(req, res, 'tus: unexpected response while uploading chunk');

          return;
        }

        _this8._handleUploadResponse(req, res);
      })["catch"](function (err) {
        // Don't emit an error if the upload was aborted manually
        if (_this8._aborted) {
          return;
        }

        _this8._emitHttpError(req, null, "tus: failed to upload chunk at offset ".concat(_this8._offset), err);
      });
    }
    /**
     * _addChunktoRequest reads a chunk from the source and sends it using the
     * supplied request object. It will not handle the response.
     *
     * @api private
     */

  }, {
    key: "_addChunkToRequest",
    value: function _addChunkToRequest(req) {
      var _this9 = this;

      var start = this._offset;
      var end = this._offset + this.options.chunkSize;
      req.setProgressHandler(function (bytesSent) {
        _this9._emitProgress(start + bytesSent, _this9._size);
      });
      req.setHeader('Content-Type', 'application/offset+octet-stream'); // The specified chunkSize may be Infinity or the calcluated end position
      // may exceed the file's size. In both cases, we limit the end position to
      // the input's total size for simpler calculations and correctness.

      if ((end === Infinity || end > this._size) && !this.options.uploadLengthDeferred) {
        end = this._size;
      }

      return this._source.slice(start, end).then(function (_ref2) {
        var value = _ref2.value,
            done = _ref2.done; // If the upload length is deferred, the upload size was not specified during
        // upload creation. So, if the file reader is done reading, we know the total
        // upload size and can tell the tus server.

        if (_this9.options.uploadLengthDeferred && done) {
          _this9._size = _this9._offset + (value && value.size ? value.size : 0);
          req.setHeader('Upload-Length', _this9._size);
        }

        if (value === null) {
          return _this9._sendRequest(req);
        }

        _this9._emitProgress(_this9._offset, _this9._size);

        return _this9._sendRequest(req, value);
      });
    }
    /**
     * _handleUploadResponse is used by requests that haven been sent using _addChunkToRequest
     * and already have received a response.
     *
     * @api private
     */

  }, {
    key: "_handleUploadResponse",
    value: function _handleUploadResponse(req, res) {
      var offset = parseInt(res.getHeader('Upload-Offset'), 10);

      if (isNaN(offset)) {
        this._emitHttpError(req, res, 'tus: invalid or missing offset value');

        return;
      }

      this._emitProgress(offset, this._size);

      this._emitChunkComplete(offset - this._offset, offset, this._size);

      this._offset = offset;

      if (offset == this._size) {
        // Yay, finally done :)
        this._emitSuccess();

        this._source.close();

        return;
      }

      this._performUpload();
    }
    /**
     * Create a new HTTP request object with the given method and URL.
     *
     * @api private
     */

  }, {
    key: "_openRequest",
    value: function _openRequest(method, url) {
      var req = openRequest(method, url, this.options);
      this._req = req;
      return req;
    }
    /**
     * Remove the entry in the URL storage, if it has been saved before.
     *
     * @api private
     */

  }, {
    key: "_removeFromUrlStorage",
    value: function _removeFromUrlStorage() {
      var _this10 = this;

      if (!this._urlStorageKey) return;

      this._urlStorage.removeUpload(this._urlStorageKey)["catch"](function (err) {
        _this10._emitError(err);
      });

      this._urlStorageKey = null;
    }
    /**
     * Add the upload URL to the URL storage, if possible.
     *
     * @api private
     */

  }, {
    key: "_saveUploadInUrlStorage",
    value: function _saveUploadInUrlStorage() {
      var _this11 = this; // Only if a fingerprint was calculated for the input (i.e. not a stream), we can store the upload URL.


      if (!this.options.storeFingerprintForResuming || !this._fingerprint) {
        return;
      }

      var storedUpload = {
        size: this._size,
        metadata: this.options.metadata,
        creationTime: new Date().toString()
      };

      if (this._parallelUploads) {
        // Save multiple URLs if the parallelUploads option is used ...
        storedUpload.parallelUploadUrls = this._parallelUploadUrls;
      } else {
        // ... otherwise we just save the one available URL.
        storedUpload.uploadUrl = this.url;
      }

      this._urlStorage.addUpload(this._fingerprint, storedUpload).then(function (urlStorageKey) {
        return _this11._urlStorageKey = urlStorageKey;
      })["catch"](function (err) {
        _this11._emitError(err);
      });
    }
    /**
     * Send a request with the provided body.
     *
     * @api private
     */

  }, {
    key: "_sendRequest",
    value: function _sendRequest(req) {
      var body = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      return sendRequest(req, body, this.options);
    }
  }], [{
    key: "terminate",
    value: function terminate(url, options) {
      // Count the number of arguments to see if a callback is being provided as the last
      // argument in the old style required by tus-js-client 1.x, then throw an error if it is.
      // `arguments` is a JavaScript built-in variable that contains all of the function's arguments.
      if (arguments.length > 1 && typeof arguments[arguments.length - 1] === 'function') {
        throw new Error('tus: the terminate function does not accept a callback since v2 anymore; please use the returned Promise instead');
      } // Note that in order for the trick above to work, a default value cannot be set for `options`,
      // so the check below replaces the old default `{}`.


      if (options === undefined) {
        options = {};
      }

      var req = openRequest('DELETE', url, options);
      return sendRequest(req, null, options).then(function (res) {
        // A 204 response indicates a successfull request
        if (res.getStatus() === 204) {
          return;
        }

        throw new _error.default('tus: unexpected response while terminating upload', null, req, res);
      })["catch"](function (err) {
        if (!(err instanceof _error.default)) {
          err = new _error.default('tus: failed to terminate upload', err, req, null);
        }

        if (!shouldRetry(err, 0, options)) {
          throw err;
        } // Instead of keeping track of the retry attempts, we remove the first element from the delays
        // array. If the array is empty, all retry attempts are used up and we will bubble up the error.
        // We recursively call the terminate function will removing elements from the retryDelays array.


        var delay = options.retryDelays[0];
        var remainingDelays = options.retryDelays.slice(1);

        var newOptions = _objectSpread({}, options, {
          retryDelays: remainingDelays
        });

        return new Promise(function (resolve) {
          return setTimeout(resolve, delay);
        }).then(function () {
          return BaseUpload.terminate(url, newOptions);
        });
      });
    }
  }]);

  return BaseUpload;
}();

function encodeMetadata(metadata) {
  var encoded = [];

  for (var key in metadata) {
    encoded.push("".concat(key, " ").concat(_jsBase.Base64.encode(metadata[key])));
  }

  return encoded.join(',');
}
/**
 * Checks whether a given status is in the range of the expected category.
 * For example, only a status between 200 and 299 will satisfy the category 200.
 *
 * @api private
 */


function inStatusCategory(status, category) {
  return status >= category && status < category + 100;
}
/**
 * Create a new HTTP request with the specified method and URL.
 * The necessary headers that are included in every request
 * will be added, including the request ID.
 *
 * @api private
 */


function openRequest(method, url, options) {
  var req = options.httpStack.createRequest(method, url);
  req.setHeader('Tus-Resumable', '1.0.0');
  var headers = options.headers || {};

  for (var name in headers) {
    req.setHeader(name, headers[name]);
  }

  if (options.addRequestId) {
    var requestId = (0, _uuid.default)();
    req.setHeader('X-Request-ID', requestId);
  }

  return req;
}
/**
 * Send a request with the provided body while invoking the onBeforeRequest
 * and onAfterResponse callbacks.
 *
 * @api private
 */


function sendRequest(req, body, options) {
  var onBeforeRequestPromise = typeof options.onBeforeRequest === 'function' ? Promise.resolve(options.onBeforeRequest(req)) : Promise.resolve();
  return onBeforeRequestPromise.then(function () {
    return req.send(body).then(function (res) {
      var onAfterResponsePromise = typeof options.onAfterResponse === 'function' ? Promise.resolve(options.onAfterResponse(req, res)) : Promise.resolve();
      return onAfterResponsePromise.then(function () {
        return res;
      });
    });
  });
}
/**
 * Checks whether the browser running this code has internet access.
 * This function will always return true in the node.js environment
 *
 * @api private
 */


function isOnline() {
  var online = true;

  if (typeof window !== 'undefined' && 'navigator' in window && window.navigator.onLine === false) {
    online = false;
  }

  return online;
}
/**
 * Checks whether or not it is ok to retry a request.
 * @param {Error} err the error returned from the last request
 * @param {number} retryAttempt the number of times the request has already been retried
 * @param {object} options tus Upload options
 *
 * @api private
 */


function shouldRetry(err, retryAttempt, options) {
  // We only attempt a retry if
  // - retryDelays option is set
  // - we didn't exceed the maxium number of retries, yet, and
  // - this error was caused by a request or it's response and
  // - the error is server error (i.e. not a status 4xx except a 409 or 423) or
  // a onShouldRetry is specified and returns true
  // - the browser does not indicate that we are offline
  if (options.retryDelays == null || retryAttempt >= options.retryDelays.length || err.originalRequest == null) {
    return false;
  }

  if (options && typeof options.onShouldRetry === 'function') {
    return options.onShouldRetry(err, retryAttempt, options);
  }

  var status = err.originalResponse ? err.originalResponse.getStatus() : 0;
  return (!inStatusCategory(status, 400) || status === 409 || status === 423) && isOnline();
}
/**
 * Resolve a relative link given the origin as source. For example,
 * if a HTTP request to http://example.com/files/ returns a Location
 * header with the value /upload/abc, the resolved URL will be:
 * http://example.com/upload/abc
 */


function resolveUrl(origin, link) {
  return new _urlParse.default(link, origin).toString();
}
/**
 * Calculate the start and end positions for the parts if an upload
 * is split into multiple parallel requests.
 *
 * @param {number} totalSize The byte size of the upload, which will be split.
 * @param {number} partCount The number in how many parts the upload will be split.
 * @param {string[]} previousUrls The upload URLs for previous parts.
 * @return {object[]}
 * @api private
 */


function splitSizeIntoParts(totalSize, partCount, previousUrls) {
  var partSize = Math.floor(totalSize / partCount);
  var parts = [];

  for (var i = 0; i < partCount; i++) {
    parts.push({
      start: partSize * i,
      end: partSize * (i + 1)
    });
  }

  parts[partCount - 1].end = totalSize; // Attach URLs from previous uploads, if available.

  if (previousUrls) {
    parts.forEach(function (part, index) {
      part.uploadUrl = previousUrls[index] || null;
    });
  }

  return parts;
}

BaseUpload.defaultOptions = defaultOptions;
var _default = BaseUpload;
exports.default = _default;
},{"./error":31,"./logger":32,"./uuid":35,"js-base64":9,"url-parse":36}],35:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = uuid;

/**
 * Generate a UUID v4 based on random numbers. We intentioanlly use the less
 * secure Math.random function here since the more secure crypto.getRandomNumbers
 * is not available on all platforms.
 * This is not a problem for us since we use the UUID only for generating a
 * request ID, so we can correlate server logs to client errors.
 *
 * This function is taken from following site:
 * https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 *
 * @return {string} The generate UUID
 */
function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}
},{}],36:[function(require,module,exports){
(function (global){(function (){
'use strict';

var required = require('requires-port')
  , qs = require('querystringify')
  , slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
  , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\\/]+)?([\S\s]*)/i
  , windowsDriveLetter = /^[a-zA-Z]:/
  , whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]'
  , left = new RegExp('^'+ whitespace +'+');

/**
 * Trim a given string.
 *
 * @param {String} str String to trim.
 * @public
 */
function trimLeft(str) {
  return (str ? str : '').toString().replace(left, '');
}

/**
 * These are the parse rules for the URL parser, it informs the parser
 * about:
 *
 * 0. The char it Needs to parse, if it's a string it should be done using
 *    indexOf, RegExp using exec and NaN means set as current value.
 * 1. The property we should set when parsing this value.
 * 2. Indication if it's backwards or forward parsing, when set as number it's
 *    the value of extra chars that should be split off.
 * 3. Inherit from location if non existing in the parser.
 * 4. `toLowerCase` the resulting value.
 */
var rules = [
  ['#', 'hash'],                        // Extract from the back.
  ['?', 'query'],                       // Extract from the back.
  function sanitize(address, url) {     // Sanitize what is left of the address
    return isSpecial(url.protocol) ? address.replace(/\\/g, '/') : address;
  },
  ['/', 'pathname'],                    // Extract from the back.
  ['@', 'auth', 1],                     // Extract from the front.
  [NaN, 'host', undefined, 1, 1],       // Set left over value.
  [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
  [NaN, 'hostname', undefined, 1, 1]    // Set left over.
];

/**
 * These properties should not be copied or inherited from. This is only needed
 * for all non blob URL's as a blob URL does not include a hash, only the
 * origin.
 *
 * @type {Object}
 * @private
 */
var ignore = { hash: 1, query: 1 };

/**
 * The location object differs when your code is loaded through a normal page,
 * Worker or through a worker using a blob. And with the blobble begins the
 * trouble as the location object will contain the URL of the blob, not the
 * location of the page where our code is loaded in. The actual origin is
 * encoded in the `pathname` so we can thankfully generate a good "default"
 * location from it so we can generate proper relative URL's again.
 *
 * @param {Object|String} loc Optional default location object.
 * @returns {Object} lolcation object.
 * @public
 */
function lolcation(loc) {
  var globalVar;

  if (typeof window !== 'undefined') globalVar = window;
  else if (typeof global !== 'undefined') globalVar = global;
  else if (typeof self !== 'undefined') globalVar = self;
  else globalVar = {};

  var location = globalVar.location || {};
  loc = loc || location;

  var finaldestination = {}
    , type = typeof loc
    , key;

  if ('blob:' === loc.protocol) {
    finaldestination = new Url(unescape(loc.pathname), {});
  } else if ('string' === type) {
    finaldestination = new Url(loc, {});
    for (key in ignore) delete finaldestination[key];
  } else if ('object' === type) {
    for (key in loc) {
      if (key in ignore) continue;
      finaldestination[key] = loc[key];
    }

    if (finaldestination.slashes === undefined) {
      finaldestination.slashes = slashes.test(loc.href);
    }
  }

  return finaldestination;
}

/**
 * Check whether a protocol scheme is special.
 *
 * @param {String} The protocol scheme of the URL
 * @return {Boolean} `true` if the protocol scheme is special, else `false`
 * @private
 */
function isSpecial(scheme) {
  return (
    scheme === 'file:' ||
    scheme === 'ftp:' ||
    scheme === 'http:' ||
    scheme === 'https:' ||
    scheme === 'ws:' ||
    scheme === 'wss:'
  );
}

/**
 * @typedef ProtocolExtract
 * @type Object
 * @property {String} protocol Protocol matched in the URL, in lowercase.
 * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
 * @property {String} rest Rest of the URL that is not part of the protocol.
 */

/**
 * Extract protocol information from a URL with/without double slash ("//").
 *
 * @param {String} address URL we want to extract from.
 * @param {Object} location
 * @return {ProtocolExtract} Extracted information.
 * @private
 */
function extractProtocol(address, location) {
  address = trimLeft(address);
  location = location || {};

  var match = protocolre.exec(address);
  var protocol = match[1] ? match[1].toLowerCase() : '';
  var forwardSlashes = !!match[2];
  var otherSlashes = !!match[3];
  var slashesCount = 0;
  var rest;

  if (forwardSlashes) {
    if (otherSlashes) {
      rest = match[2] + match[3] + match[4];
      slashesCount = match[2].length + match[3].length;
    } else {
      rest = match[2] + match[4];
      slashesCount = match[2].length;
    }
  } else {
    if (otherSlashes) {
      rest = match[3] + match[4];
      slashesCount = match[3].length;
    } else {
      rest = match[4]
    }
  }

  if (protocol === 'file:') {
    if (slashesCount >= 2) {
      rest = rest.slice(2);
    }
  } else if (isSpecial(protocol)) {
    rest = match[4];
  } else if (protocol) {
    if (forwardSlashes) {
      rest = rest.slice(2);
    }
  } else if (slashesCount >= 2 && isSpecial(location.protocol)) {
    rest = match[4];
  }

  return {
    protocol: protocol,
    slashes: forwardSlashes || isSpecial(protocol),
    slashesCount: slashesCount,
    rest: rest
  };
}

/**
 * Resolve a relative URL pathname against a base URL pathname.
 *
 * @param {String} relative Pathname of the relative URL.
 * @param {String} base Pathname of the base URL.
 * @return {String} Resolved pathname.
 * @private
 */
function resolve(relative, base) {
  if (relative === '') return base;

  var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
    , i = path.length
    , last = path[i - 1]
    , unshift = false
    , up = 0;

  while (i--) {
    if (path[i] === '.') {
      path.splice(i, 1);
    } else if (path[i] === '..') {
      path.splice(i, 1);
      up++;
    } else if (up) {
      if (i === 0) unshift = true;
      path.splice(i, 1);
      up--;
    }
  }

  if (unshift) path.unshift('');
  if (last === '.' || last === '..') path.push('');

  return path.join('/');
}

/**
 * The actual URL instance. Instead of returning an object we've opted-in to
 * create an actual constructor as it's much more memory efficient and
 * faster and it pleases my OCD.
 *
 * It is worth noting that we should not use `URL` as class name to prevent
 * clashes with the global URL instance that got introduced in browsers.
 *
 * @constructor
 * @param {String} address URL we want to parse.
 * @param {Object|String} [location] Location defaults for relative paths.
 * @param {Boolean|Function} [parser] Parser for the query string.
 * @private
 */
function Url(address, location, parser) {
  address = trimLeft(address);

  if (!(this instanceof Url)) {
    return new Url(address, location, parser);
  }

  var relative, extracted, parse, instruction, index, key
    , instructions = rules.slice()
    , type = typeof location
    , url = this
    , i = 0;

  //
  // The following if statements allows this module two have compatibility with
  // 2 different API:
  //
  // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
  //    where the boolean indicates that the query string should also be parsed.
  //
  // 2. The `URL` interface of the browser which accepts a URL, object as
  //    arguments. The supplied object will be used as default values / fall-back
  //    for relative paths.
  //
  if ('object' !== type && 'string' !== type) {
    parser = location;
    location = null;
  }

  if (parser && 'function' !== typeof parser) parser = qs.parse;

  location = lolcation(location);

  //
  // Extract protocol information before running the instructions.
  //
  extracted = extractProtocol(address || '', location);
  relative = !extracted.protocol && !extracted.slashes;
  url.slashes = extracted.slashes || relative && location.slashes;
  url.protocol = extracted.protocol || location.protocol || '';
  address = extracted.rest;

  //
  // When the authority component is absent the URL starts with a path
  // component.
  //
  if (
    extracted.protocol === 'file:' && (
      extracted.slashesCount !== 2 || windowsDriveLetter.test(address)) ||
    (!extracted.slashes &&
      (extracted.protocol ||
        extracted.slashesCount < 2 ||
        !isSpecial(url.protocol)))
  ) {
    instructions[3] = [/(.*)/, 'pathname'];
  }

  for (; i < instructions.length; i++) {
    instruction = instructions[i];

    if (typeof instruction === 'function') {
      address = instruction(address, url);
      continue;
    }

    parse = instruction[0];
    key = instruction[1];

    if (parse !== parse) {
      url[key] = address;
    } else if ('string' === typeof parse) {
      if (~(index = address.indexOf(parse))) {
        if ('number' === typeof instruction[2]) {
          url[key] = address.slice(0, index);
          address = address.slice(index + instruction[2]);
        } else {
          url[key] = address.slice(index);
          address = address.slice(0, index);
        }
      }
    } else if ((index = parse.exec(address))) {
      url[key] = index[1];
      address = address.slice(0, index.index);
    }

    url[key] = url[key] || (
      relative && instruction[3] ? location[key] || '' : ''
    );

    //
    // Hostname, host and protocol should be lowercased so they can be used to
    // create a proper `origin`.
    //
    if (instruction[4]) url[key] = url[key].toLowerCase();
  }

  //
  // Also parse the supplied query string in to an object. If we're supplied
  // with a custom parser as function use that instead of the default build-in
  // parser.
  //
  if (parser) url.query = parser(url.query);

  //
  // If the URL is relative, resolve the pathname against the base URL.
  //
  if (
      relative
    && location.slashes
    && url.pathname.charAt(0) !== '/'
    && (url.pathname !== '' || location.pathname !== '')
  ) {
    url.pathname = resolve(url.pathname, location.pathname);
  }

  //
  // Default to a / for pathname if none exists. This normalizes the URL
  // to always have a /
  //
  if (url.pathname.charAt(0) !== '/' && isSpecial(url.protocol)) {
    url.pathname = '/' + url.pathname;
  }

  //
  // We should not add port numbers if they are already the default port number
  // for a given protocol. As the host also contains the port number we're going
  // override it with the hostname which contains no port number.
  //
  if (!required(url.port, url.protocol)) {
    url.host = url.hostname;
    url.port = '';
  }

  //
  // Parse down the `auth` for the username and password.
  //
  url.username = url.password = '';
  if (url.auth) {
    instruction = url.auth.split(':');
    url.username = instruction[0] || '';
    url.password = instruction[1] || '';
  }

  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
    ? url.protocol +'//'+ url.host
    : 'null';

  //
  // The href is just the compiled result.
  //
  url.href = url.toString();
}

/**
 * This is convenience method for changing properties in the URL instance to
 * insure that they all propagate correctly.
 *
 * @param {String} part          Property we need to adjust.
 * @param {Mixed} value          The newly assigned value.
 * @param {Boolean|Function} fn  When setting the query, it will be the function
 *                               used to parse the query.
 *                               When setting the protocol, double slash will be
 *                               removed from the final url if it is true.
 * @returns {URL} URL instance for chaining.
 * @public
 */
function set(part, value, fn) {
  var url = this;

  switch (part) {
    case 'query':
      if ('string' === typeof value && value.length) {
        value = (fn || qs.parse)(value);
      }

      url[part] = value;
      break;

    case 'port':
      url[part] = value;

      if (!required(value, url.protocol)) {
        url.host = url.hostname;
        url[part] = '';
      } else if (value) {
        url.host = url.hostname +':'+ value;
      }

      break;

    case 'hostname':
      url[part] = value;

      if (url.port) value += ':'+ url.port;
      url.host = value;
      break;

    case 'host':
      url[part] = value;

      if (/:\d+$/.test(value)) {
        value = value.split(':');
        url.port = value.pop();
        url.hostname = value.join(':');
      } else {
        url.hostname = value;
        url.port = '';
      }

      break;

    case 'protocol':
      url.protocol = value.toLowerCase();
      url.slashes = !fn;
      break;

    case 'pathname':
    case 'hash':
      if (value) {
        var char = part === 'pathname' ? '/' : '#';
        url[part] = value.charAt(0) !== char ? char + value : value;
      } else {
        url[part] = value;
      }
      break;

    default:
      url[part] = value;
  }

  for (var i = 0; i < rules.length; i++) {
    var ins = rules[i];

    if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
  }

  url.origin = url.protocol !== 'file:' && isSpecial(url.protocol) && url.host
    ? url.protocol +'//'+ url.host
    : 'null';

  url.href = url.toString();

  return url;
}

/**
 * Transform the properties back in to a valid and full URL string.
 *
 * @param {Function} stringify Optional query stringify function.
 * @returns {String} Compiled version of the URL.
 * @public
 */
function toString(stringify) {
  if (!stringify || 'function' !== typeof stringify) stringify = qs.stringify;

  var query
    , url = this
    , protocol = url.protocol;

  if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

  var result = protocol + (url.slashes || isSpecial(url.protocol) ? '//' : '');

  if (url.username) {
    result += url.username;
    if (url.password) result += ':'+ url.password;
    result += '@';
  }

  result += url.host + url.pathname;

  query = 'object' === typeof url.query ? stringify(url.query) : url.query;
  if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

  if (url.hash) result += url.hash;

  return result;
}

Url.prototype = { set: set, toString: toString };

//
// Expose the URL parser and some additional properties that might be useful for
// others or testing.
//
Url.extractProtocol = extractProtocol;
Url.location = lolcation;
Url.trimLeft = trimLeft;
Url.qs = qs;

module.exports = Url;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"querystringify":20,"requires-port":21}],37:[function(require,module,exports){
'use strict';

class AuthError extends Error {
  constructor() {
    super('Authorization required');
    this.name = 'AuthError';
    this.isAuthError = true;
  }

}

module.exports = AuthError;

},{}],38:[function(require,module,exports){
'use strict';

const RequestClient = require('./RequestClient');

const tokenStorage = require('./tokenStorage');

const getName = id => {
  return id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
};

module.exports = class Provider extends RequestClient {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.provider = opts.provider;
    this.id = this.provider;
    this.name = this.opts.name || getName(this.id);
    this.pluginId = this.opts.pluginId;
    this.tokenKey = `companion-${this.pluginId}-auth-token`;
    this.companionKeysParams = this.opts.companionKeysParams;
    this.preAuthToken = null;
  }

  headers() {
    return Promise.all([super.headers(), this.getAuthToken()]).then(([headers, token]) => {
      const authHeaders = {};

      if (token) {
        authHeaders['uppy-auth-token'] = token;
      }

      if (this.companionKeysParams) {
        authHeaders['uppy-credentials-params'] = btoa(JSON.stringify({
          params: this.companionKeysParams
        }));
      }

      return { ...headers,
        ...authHeaders
      };
    });
  }

  onReceiveResponse(response) {
    response = super.onReceiveResponse(response);
    const plugin = this.uppy.getPlugin(this.pluginId);
    const oldAuthenticated = plugin.getPluginState().authenticated;
    const authenticated = oldAuthenticated ? response.status !== 401 : response.status < 400;
    plugin.setPluginState({
      authenticated
    });
    return response;
  }

  setAuthToken(token) {
    return this.uppy.getPlugin(this.pluginId).storage.setItem(this.tokenKey, token);
  }

  getAuthToken() {
    return this.uppy.getPlugin(this.pluginId).storage.getItem(this.tokenKey);
  }

  authUrl(queries = {}) {
    if (this.preAuthToken) {
      queries.uppyPreAuthToken = this.preAuthToken;
    }

    return `${this.hostname}/${this.id}/connect?${new URLSearchParams(queries)}`;
  }

  fileUrl(id) {
    return `${this.hostname}/${this.id}/get/${id}`;
  }

  fetchPreAuthToken() {
    if (!this.companionKeysParams) {
      return Promise.resolve();
    }

    return this.post(`${this.id}/preauth/`, {
      params: this.companionKeysParams
    }).then(res => {
      this.preAuthToken = res.token;
    }).catch(err => {
      this.uppy.log(`[CompanionClient] unable to fetch preAuthToken ${err}`, 'warning');
    });
  }

  list(directory) {
    return this.get(`${this.id}/list/${directory || ''}`);
  }

  logout() {
    return this.get(`${this.id}/logout`).then(response => Promise.all([response, this.uppy.getPlugin(this.pluginId).storage.removeItem(this.tokenKey)])).then(([response]) => response);
  }

  static initPlugin(plugin, opts, defaultOpts) {
    plugin.type = 'acquirer';
    plugin.files = [];

    if (defaultOpts) {
      plugin.opts = { ...defaultOpts,
        ...opts
      };
    }

    if (opts.serverUrl || opts.serverPattern) {
      throw new Error('`serverUrl` and `serverPattern` have been renamed to `companionUrl` and `companionAllowedHosts` respectively in the 0.30.5 release. Please consult the docs (for example, https://uppy.io/docs/instagram/ for the Instagram plugin) and use the updated options.`');
    }

    if (opts.companionAllowedHosts) {
      const pattern = opts.companionAllowedHosts; // validate companionAllowedHosts param

      if (typeof pattern !== 'string' && !Array.isArray(pattern) && !(pattern instanceof RegExp)) {
        throw new TypeError(`${plugin.id}: the option "companionAllowedHosts" must be one of string, Array, RegExp`);
      }

      plugin.opts.companionAllowedHosts = pattern;
    } else if (/^(?!https?:\/\/).*$/i.test(opts.companionUrl)) {
      // does not start with https://
      plugin.opts.companionAllowedHosts = `https://${opts.companionUrl.replace(/^\/\//, '')}`;
    } else {
      plugin.opts.companionAllowedHosts = new URL(opts.companionUrl).origin;
    }

    plugin.storage = plugin.opts.storage || tokenStorage;
  }

};

},{"./RequestClient":39,"./tokenStorage":43}],39:[function(require,module,exports){
'use strict';

var _class, _getPostResponseFunc, _getUrl, _errorHandler, _temp;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const fetchWithNetworkError = require('./../../utils/lib/fetchWithNetworkError');

const AuthError = require('./AuthError'); // Remove the trailing slash so we can always safely append /xyz.


function stripSlash(url) {
  return url.replace(/\/$/, '');
}

async function handleJSONResponse(res) {
  if (res.status === 401) {
    throw new AuthError();
  }

  const jsonPromise = res.json();

  if (res.status < 200 || res.status > 300) {
    let errMsg = `Failed request with status: ${res.status}. ${res.statusText}`;

    try {
      const errData = await jsonPromise;
      errMsg = errData.message ? `${errMsg} message: ${errData.message}` : errMsg;
      errMsg = errData.requestId ? `${errMsg} request-Id: ${errData.requestId}` : errMsg;
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      throw new Error(errMsg);
    }
  }

  return jsonPromise;
}

module.exports = (_temp = (_getPostResponseFunc = /*#__PURE__*/_classPrivateFieldLooseKey("getPostResponseFunc"), _getUrl = /*#__PURE__*/_classPrivateFieldLooseKey("getUrl"), _errorHandler = /*#__PURE__*/_classPrivateFieldLooseKey("errorHandler"), _class = class RequestClient {
  // eslint-disable-next-line global-require
  constructor(uppy, opts) {
    Object.defineProperty(this, _errorHandler, {
      value: _errorHandler2
    });
    Object.defineProperty(this, _getUrl, {
      value: _getUrl2
    });
    Object.defineProperty(this, _getPostResponseFunc, {
      writable: true,
      value: skip => response => skip ? response : this.onReceiveResponse(response)
    });
    this.uppy = uppy;
    this.opts = opts;
    this.onReceiveResponse = this.onReceiveResponse.bind(this);
    this.allowedHeaders = ['accept', 'content-type', 'uppy-auth-token'];
    this.preflightDone = false;
  }

  get hostname() {
    const {
      companion
    } = this.uppy.getState();
    const host = this.opts.companionUrl;
    return stripSlash(companion && companion[host] ? companion[host] : host);
  }

  headers() {
    const userHeaders = this.opts.companionHeaders || {};
    return Promise.resolve({ ...RequestClient.defaultHeaders,
      ...userHeaders
    });
  }

  onReceiveResponse(response) {
    const state = this.uppy.getState();
    const companion = state.companion || {};
    const host = this.opts.companionUrl;
    const {
      headers
    } = response; // Store the self-identified domain name for the Companion instance we just hit.

    if (headers.has('i-am') && headers.get('i-am') !== companion[host]) {
      this.uppy.setState({
        companion: { ...companion,
          [host]: headers.get('i-am')
        }
      });
    }

    return response;
  }

  preflight(path) {
    if (this.preflightDone) {
      return Promise.resolve(this.allowedHeaders.slice());
    }

    return fetch(_classPrivateFieldLooseBase(this, _getUrl)[_getUrl](path), {
      method: 'OPTIONS'
    }).then(response => {
      if (response.headers.has('access-control-allow-headers')) {
        this.allowedHeaders = response.headers.get('access-control-allow-headers').split(',').map(headerName => headerName.trim().toLowerCase());
      }

      this.preflightDone = true;
      return this.allowedHeaders.slice();
    }).catch(err => {
      this.uppy.log(`[CompanionClient] unable to make preflight request ${err}`, 'warning');
      this.preflightDone = true;
      return this.allowedHeaders.slice();
    });
  }

  preflightAndHeaders(path) {
    return Promise.all([this.preflight(path), this.headers()]).then(([allowedHeaders, headers]) => {
      // filter to keep only allowed Headers
      Object.keys(headers).forEach(header => {
        if (!allowedHeaders.includes(header.toLowerCase())) {
          this.uppy.log(`[CompanionClient] excluding disallowed header ${header}`);
          delete headers[header]; // eslint-disable-line no-param-reassign
        }
      });
      return headers;
    });
  }

  get(path, skipPostResponse) {
    const method = 'get';
    return this.preflightAndHeaders(path).then(headers => fetchWithNetworkError(_classPrivateFieldLooseBase(this, _getUrl)[_getUrl](path), {
      method,
      headers,
      credentials: this.opts.companionCookiesRule || 'same-origin'
    })).then(_classPrivateFieldLooseBase(this, _getPostResponseFunc)[_getPostResponseFunc](skipPostResponse)).then(handleJSONResponse).catch(_classPrivateFieldLooseBase(this, _errorHandler)[_errorHandler](method, path));
  }

  post(path, data, skipPostResponse) {
    const method = 'post';
    return this.preflightAndHeaders(path).then(headers => fetchWithNetworkError(_classPrivateFieldLooseBase(this, _getUrl)[_getUrl](path), {
      method,
      headers,
      credentials: this.opts.companionCookiesRule || 'same-origin',
      body: JSON.stringify(data)
    })).then(_classPrivateFieldLooseBase(this, _getPostResponseFunc)[_getPostResponseFunc](skipPostResponse)).then(handleJSONResponse).catch(_classPrivateFieldLooseBase(this, _errorHandler)[_errorHandler](method, path));
  }

  delete(path, data, skipPostResponse) {
    const method = 'delete';
    return this.preflightAndHeaders(path).then(headers => fetchWithNetworkError(`${this.hostname}/${path}`, {
      method,
      headers,
      credentials: this.opts.companionCookiesRule || 'same-origin',
      body: data ? JSON.stringify(data) : null
    })).then(_classPrivateFieldLooseBase(this, _getPostResponseFunc)[_getPostResponseFunc](skipPostResponse)).then(handleJSONResponse).catch(_classPrivateFieldLooseBase(this, _errorHandler)[_errorHandler](method, path));
  }

}), _class.VERSION = "2.0.3", _class.defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'Uppy-Versions': `@uppy/companion-client=${_class.VERSION}`
}, _temp);

function _getUrl2(url) {
  if (/^(https?:|)\/\//.test(url)) {
    return url;
  }

  return `${this.hostname}/${url}`;
}

function _errorHandler2(method, path) {
  return err => {
    var _err;

    if (!((_err = err) != null && _err.isAuthError)) {
      const error = new Error(`Could not ${method} ${_classPrivateFieldLooseBase(this, _getUrl)[_getUrl](path)}`);
      error.cause = err;
      err = error; // eslint-disable-line no-param-reassign
    }

    return Promise.reject(err);
  };
}

},{"./../../utils/lib/fetchWithNetworkError":152,"./AuthError":37}],40:[function(require,module,exports){
'use strict';

const RequestClient = require('./RequestClient');

const getName = id => {
  return id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
};

module.exports = class SearchProvider extends RequestClient {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.provider = opts.provider;
    this.id = this.provider;
    this.name = this.opts.name || getName(this.id);
    this.pluginId = this.opts.pluginId;
  }

  fileUrl(id) {
    return `${this.hostname}/search/${this.id}/get/${id}`;
  }

  search(text, queries) {
    queries = queries ? `&${queries}` : '';
    return this.get(`search/${this.id}/list?q=${encodeURIComponent(text)}${queries}`);
  }

};

},{"./RequestClient":39}],41:[function(require,module,exports){
"use strict";

var _queued, _emitter, _isOpen, _socket, _handleMessage;

let _Symbol$for, _Symbol$for2;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const ee = require('namespace-emitter');

module.exports = (_queued = /*#__PURE__*/_classPrivateFieldLooseKey("queued"), _emitter = /*#__PURE__*/_classPrivateFieldLooseKey("emitter"), _isOpen = /*#__PURE__*/_classPrivateFieldLooseKey("isOpen"), _socket = /*#__PURE__*/_classPrivateFieldLooseKey("socket"), _handleMessage = /*#__PURE__*/_classPrivateFieldLooseKey("handleMessage"), _Symbol$for = Symbol.for('uppy test: getSocket'), _Symbol$for2 = Symbol.for('uppy test: getQueued'), class UppySocket {
  constructor(opts) {
    Object.defineProperty(this, _queued, {
      writable: true,
      value: []
    });
    Object.defineProperty(this, _emitter, {
      writable: true,
      value: ee()
    });
    Object.defineProperty(this, _isOpen, {
      writable: true,
      value: false
    });
    Object.defineProperty(this, _socket, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _handleMessage, {
      writable: true,
      value: e => {
        try {
          const message = JSON.parse(e.data);
          this.emit(message.action, message.payload);
        } catch (err) {
          // TODO: use a more robust error handler.
          console.log(err); // eslint-disable-line no-console
        }
      }
    });
    this.opts = opts;

    if (!opts || opts.autoOpen !== false) {
      this.open();
    }
  }

  get isOpen() {
    return _classPrivateFieldLooseBase(this, _isOpen)[_isOpen];
  }

  [_Symbol$for]() {
    return _classPrivateFieldLooseBase(this, _socket)[_socket];
  }

  [_Symbol$for2]() {
    return _classPrivateFieldLooseBase(this, _queued)[_queued];
  }

  open() {
    _classPrivateFieldLooseBase(this, _socket)[_socket] = new WebSocket(this.opts.target);

    _classPrivateFieldLooseBase(this, _socket)[_socket].onopen = () => {
      _classPrivateFieldLooseBase(this, _isOpen)[_isOpen] = true;

      while (_classPrivateFieldLooseBase(this, _queued)[_queued].length > 0 && _classPrivateFieldLooseBase(this, _isOpen)[_isOpen]) {
        const first = _classPrivateFieldLooseBase(this, _queued)[_queued].shift();

        this.send(first.action, first.payload);
      }
    };

    _classPrivateFieldLooseBase(this, _socket)[_socket].onclose = () => {
      _classPrivateFieldLooseBase(this, _isOpen)[_isOpen] = false;
    };

    _classPrivateFieldLooseBase(this, _socket)[_socket].onmessage = _classPrivateFieldLooseBase(this, _handleMessage)[_handleMessage];
  }

  close() {
    var _classPrivateFieldLoo;

    (_classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _socket)[_socket]) == null ? void 0 : _classPrivateFieldLoo.close();
  }

  send(action, payload) {
    // attach uuid
    if (!_classPrivateFieldLooseBase(this, _isOpen)[_isOpen]) {
      _classPrivateFieldLooseBase(this, _queued)[_queued].push({
        action,
        payload
      });

      return;
    }

    _classPrivateFieldLooseBase(this, _socket)[_socket].send(JSON.stringify({
      action,
      payload
    }));
  }

  on(action, handler) {
    _classPrivateFieldLooseBase(this, _emitter)[_emitter].on(action, handler);
  }

  emit(action, payload) {
    _classPrivateFieldLooseBase(this, _emitter)[_emitter].emit(action, payload);
  }

  once(action, handler) {
    _classPrivateFieldLooseBase(this, _emitter)[_emitter].once(action, handler);
  }

});

},{"namespace-emitter":15}],42:[function(require,module,exports){
'use strict';
/**
 * Manages communications with Companion
 */

const RequestClient = require('./RequestClient');

const Provider = require('./Provider');

const SearchProvider = require('./SearchProvider');

const Socket = require('./Socket');

module.exports = {
  RequestClient,
  Provider,
  SearchProvider,
  Socket
};

},{"./Provider":38,"./RequestClient":39,"./SearchProvider":40,"./Socket":41}],43:[function(require,module,exports){
'use strict';
/**
 * This module serves as an Async wrapper for LocalStorage
 */

module.exports.setItem = (key, value) => {
  return new Promise(resolve => {
    localStorage.setItem(key, value);
    resolve();
  });
};

module.exports.getItem = key => {
  return Promise.resolve(localStorage.getItem(key));
};

module.exports.removeItem = key => {
  return new Promise(resolve => {
    localStorage.removeItem(key);
    resolve();
  });
};

},{}],44:[function(require,module,exports){
"use strict";

/**
 * Core plugin logic that all plugins share.
 *
 * BasePlugin does not contain DOM rendering so it can be used for plugins
 * without a user interface.
 *
 * See `Plugin` for the extended version with Preact rendering for interfaces.
 */
const Translator = require('./../../utils/lib/Translator');

module.exports = class BasePlugin {
  constructor(uppy, opts = {}) {
    this.uppy = uppy;
    this.opts = opts;
  }

  getPluginState() {
    const {
      plugins
    } = this.uppy.getState();
    return plugins[this.id] || {};
  }

  setPluginState(update) {
    const {
      plugins
    } = this.uppy.getState();
    this.uppy.setState({
      plugins: { ...plugins,
        [this.id]: { ...plugins[this.id],
          ...update
        }
      }
    });
  }

  setOptions(newOpts) {
    this.opts = { ...this.opts,
      ...newOpts
    };
    this.setPluginState(); // so that UI re-renders with new options

    this.i18nInit();
  }

  i18nInit() {
    const translator = new Translator([this.defaultLocale, this.uppy.locale, this.opts.locale]);
    this.i18n = translator.translate.bind(translator);
    this.i18nArray = translator.translateArray.bind(translator);
    this.setPluginState(); // so that UI re-renders and we see the updated locale
  }
  /**
   * Extendable methods
   * ==================
   * These methods are here to serve as an overview of the extendable methods as well as
   * making them not conditional in use, such as `if (this.afterUpdate)`.
   */
  // eslint-disable-next-line class-methods-use-this


  addTarget() {
    throw new Error('Extend the addTarget method to add your plugin to another plugin\'s target');
  } // eslint-disable-next-line class-methods-use-this


  install() {} // eslint-disable-next-line class-methods-use-this


  uninstall() {}
  /**
   * Called when plugin is mounted, whether in DOM or into another plugin.
   * Needed because sometimes plugins are mounted separately/after `install`,
   * so this.el and this.parent might not be available in `install`.
   * This is the case with @uppy/react plugins, for example.
   */


  render() {
    throw new Error('Extend the render method to add your plugin to a DOM element');
  } // eslint-disable-next-line class-methods-use-this


  update() {} // Called after every state update, after everything's mounted. Debounced.
  // eslint-disable-next-line class-methods-use-this


  afterUpdate() {}

};

},{"./../../utils/lib/Translator":148}],45:[function(require,module,exports){
"use strict";

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  render
} = require('preact');

const findDOMElement = require('./../../utils/lib/findDOMElement');

const BasePlugin = require('./BasePlugin');
/**
 * Defer a frequent call to the microtask queue.
 *
 * @param {() => T} fn
 * @returns {Promise<T>}
 */


function debounce(fn) {
  let calling = null;
  let latestArgs = null;
  return (...args) => {
    latestArgs = args;

    if (!calling) {
      calling = Promise.resolve().then(() => {
        calling = null; // At this point `args` may be different from the most
        // recent state, if multiple calls happened since this task
        // was queued. So we use the `latestArgs`, which definitely
        // is the most recent call.

        return fn(...latestArgs);
      });
    }

    return calling;
  };
}
/**
 * UIPlugin is the extended version of BasePlugin to incorporate rendering with Preact.
 * Use this for plugins that need a user interface.
 *
 * For plugins without an user interface, see BasePlugin.
 */


var _updateUI = /*#__PURE__*/_classPrivateFieldLooseKey("updateUI");

class UIPlugin extends BasePlugin {
  constructor(...args) {
    super(...args);
    Object.defineProperty(this, _updateUI, {
      writable: true,
      value: void 0
    });
  }

  /**
   * Check if supplied `target` is a DOM element or an `object`.
   * If it’s an object — target is a plugin, and we search `plugins`
   * for a plugin with same name and return its target.
   */
  mount(target, plugin) {
    const callerPluginName = plugin.id;
    const targetElement = findDOMElement(target);

    if (targetElement) {
      this.isTargetDOMEl = true; // When target is <body> with a single <div> element,
      // Preact thinks it’s the Uppy root element in there when doing a diff,
      // and destroys it. So we are creating a fragment (could be empty div)

      const uppyRootElement = document.createDocumentFragment(); // API for plugins that require a synchronous rerender.

      _classPrivateFieldLooseBase(this, _updateUI)[_updateUI] = debounce(state => {
        // plugin could be removed, but this.rerender is debounced below,
        // so it could still be called even after uppy.removePlugin or uppy.close
        // hence the check
        if (!this.uppy.getPlugin(this.id)) return;
        render(this.render(state), uppyRootElement);
        this.afterUpdate();
      });
      this.uppy.log(`Installing ${callerPluginName} to a DOM element '${target}'`);

      if (this.opts.replaceTargetContent) {
        // Doing render(h(null), targetElement), which should have been
        // a better way, since because the component might need to do additional cleanup when it is removed,
        // stopped working — Preact just adds null into target, not replacing
        targetElement.innerHTML = '';
      }

      render(this.render(this.uppy.getState()), uppyRootElement);
      this.el = uppyRootElement.firstElementChild;
      targetElement.appendChild(uppyRootElement);
      this.onMount();
      return this.el;
    }

    let targetPlugin;

    if (typeof target === 'object' && target instanceof UIPlugin) {
      // Targeting a plugin *instance*
      targetPlugin = target;
    } else if (typeof target === 'function') {
      // Targeting a plugin type
      const Target = target; // Find the target plugin instance.

      this.uppy.iteratePlugins(p => {
        if (p instanceof Target) {
          targetPlugin = p;
          return false;
        }
      });
    }

    if (targetPlugin) {
      this.uppy.log(`Installing ${callerPluginName} to ${targetPlugin.id}`);
      this.parent = targetPlugin;
      this.el = targetPlugin.addTarget(plugin);
      this.onMount();
      return this.el;
    }

    this.uppy.log(`Not installing ${callerPluginName}`);
    let message = `Invalid target option given to ${callerPluginName}.`;

    if (typeof target === 'function') {
      message += ' The given target is not a Plugin class. ' + 'Please check that you\'re not specifying a React Component instead of a plugin. ' + 'If you are using @uppy/* packages directly, make sure you have only 1 version of @uppy/core installed: ' + 'run `npm ls @uppy/core` on the command line and verify that all the versions match and are deduped correctly.';
    } else {
      message += 'If you meant to target an HTML element, please make sure that the element exists. ' + 'Check that the <script> tag initializing Uppy is right before the closing </body> tag at the end of the page. ' + '(see https://github.com/transloadit/uppy/issues/1042)\n\n' + 'If you meant to target a plugin, please confirm that your `import` statements or `require` calls are correct.';
    }

    throw new Error(message);
  }

  update(state) {
    if (this.el != null) {
      var _classPrivateFieldLoo, _classPrivateFieldLoo2;

      (_classPrivateFieldLoo = (_classPrivateFieldLoo2 = _classPrivateFieldLooseBase(this, _updateUI))[_updateUI]) == null ? void 0 : _classPrivateFieldLoo.call(_classPrivateFieldLoo2, state);
    }
  }

  unmount() {
    if (this.isTargetDOMEl) {
      var _this$el;

      (_this$el = this.el) == null ? void 0 : _this$el.remove();
    }

    this.onUnmount();
  } // eslint-disable-next-line class-methods-use-this


  onMount() {} // eslint-disable-next-line class-methods-use-this


  onUnmount() {}

}

module.exports = UIPlugin;

},{"./../../utils/lib/findDOMElement":154,"./BasePlugin":44,"preact":18}],46:[function(require,module,exports){
/* global AggregateError */
'use strict';

let _Symbol$for, _Symbol$for2;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const Translator = require('./../../utils/lib/Translator');

const ee = require('namespace-emitter');

const {
  nanoid
} = require('nanoid');

const throttle = require('lodash.throttle');

const prettierBytes = require('@transloadit/prettier-bytes');

const match = require('mime-match');

const DefaultStore = require('./../../store-default');

const getFileType = require('./../../utils/lib/getFileType');

const getFileNameAndExtension = require('./../../utils/lib/getFileNameAndExtension');

const generateFileID = require('./../../utils/lib/generateFileID');

const supportsUploadProgress = require('./supportsUploadProgress');

const getFileName = require('./getFileName');

const {
  justErrorsLogger,
  debugLogger
} = require('./loggers');

const locale = require('./locale'); // Exported from here.


class RestrictionError extends Error {
  constructor(...args) {
    super(...args);
    this.isRestriction = true;
  }

}

if (typeof AggregateError === 'undefined') {
  // eslint-disable-next-line no-global-assign
  globalThis.AggregateError = class AggregateError extends Error {
    constructor(errors, message) {
      super(message);
      this.errors = errors;
    }

  };
}

class AggregateRestrictionError extends AggregateError {
  constructor(...args) {
    super(...args);
    this.isRestriction = true;
  }

}
/**
 * Uppy Core module.
 * Manages plugins, state updates, acts as an event bus,
 * adds/removes files and metadata.
 */


var _plugins = /*#__PURE__*/_classPrivateFieldLooseKey("plugins");

var _storeUnsubscribe = /*#__PURE__*/_classPrivateFieldLooseKey("storeUnsubscribe");

var _emitter = /*#__PURE__*/_classPrivateFieldLooseKey("emitter");

var _preProcessors = /*#__PURE__*/_classPrivateFieldLooseKey("preProcessors");

var _uploaders = /*#__PURE__*/_classPrivateFieldLooseKey("uploaders");

var _postProcessors = /*#__PURE__*/_classPrivateFieldLooseKey("postProcessors");

var _checkRestrictions = /*#__PURE__*/_classPrivateFieldLooseKey("checkRestrictions");

var _checkMinNumberOfFiles = /*#__PURE__*/_classPrivateFieldLooseKey("checkMinNumberOfFiles");

var _checkRequiredMetaFieldsOnFile = /*#__PURE__*/_classPrivateFieldLooseKey("checkRequiredMetaFieldsOnFile");

var _checkRequiredMetaFields = /*#__PURE__*/_classPrivateFieldLooseKey("checkRequiredMetaFields");

var _showOrLogErrorAndThrow = /*#__PURE__*/_classPrivateFieldLooseKey("showOrLogErrorAndThrow");

var _assertNewUploadAllowed = /*#__PURE__*/_classPrivateFieldLooseKey("assertNewUploadAllowed");

var _checkAndCreateFileStateObject = /*#__PURE__*/_classPrivateFieldLooseKey("checkAndCreateFileStateObject");

var _startIfAutoProceed = /*#__PURE__*/_classPrivateFieldLooseKey("startIfAutoProceed");

var _addListeners = /*#__PURE__*/_classPrivateFieldLooseKey("addListeners");

var _updateOnlineStatus = /*#__PURE__*/_classPrivateFieldLooseKey("updateOnlineStatus");

var _createUpload = /*#__PURE__*/_classPrivateFieldLooseKey("createUpload");

var _getUpload = /*#__PURE__*/_classPrivateFieldLooseKey("getUpload");

var _removeUpload = /*#__PURE__*/_classPrivateFieldLooseKey("removeUpload");

var _runUpload = /*#__PURE__*/_classPrivateFieldLooseKey("runUpload");

_Symbol$for = Symbol.for('uppy test: getPlugins');
_Symbol$for2 = Symbol.for('uppy test: createUpload');

class Uppy {
  // eslint-disable-next-line global-require

  /** @type {Record<string, BasePlugin[]>} */

  /**
   * Instantiate Uppy
   *
   * @param {object} opts — Uppy options
   */
  constructor(_opts) {
    Object.defineProperty(this, _runUpload, {
      value: _runUpload2
    });
    Object.defineProperty(this, _removeUpload, {
      value: _removeUpload2
    });
    Object.defineProperty(this, _getUpload, {
      value: _getUpload2
    });
    Object.defineProperty(this, _createUpload, {
      value: _createUpload2
    });
    Object.defineProperty(this, _addListeners, {
      value: _addListeners2
    });
    Object.defineProperty(this, _startIfAutoProceed, {
      value: _startIfAutoProceed2
    });
    Object.defineProperty(this, _checkAndCreateFileStateObject, {
      value: _checkAndCreateFileStateObject2
    });
    Object.defineProperty(this, _assertNewUploadAllowed, {
      value: _assertNewUploadAllowed2
    });
    Object.defineProperty(this, _showOrLogErrorAndThrow, {
      value: _showOrLogErrorAndThrow2
    });
    Object.defineProperty(this, _checkRequiredMetaFields, {
      value: _checkRequiredMetaFields2
    });
    Object.defineProperty(this, _checkRequiredMetaFieldsOnFile, {
      value: _checkRequiredMetaFieldsOnFile2
    });
    Object.defineProperty(this, _checkMinNumberOfFiles, {
      value: _checkMinNumberOfFiles2
    });
    Object.defineProperty(this, _checkRestrictions, {
      value: _checkRestrictions2
    });
    Object.defineProperty(this, _plugins, {
      writable: true,
      value: Object.create(null)
    });
    Object.defineProperty(this, _storeUnsubscribe, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _emitter, {
      writable: true,
      value: ee()
    });
    Object.defineProperty(this, _preProcessors, {
      writable: true,
      value: new Set()
    });
    Object.defineProperty(this, _uploaders, {
      writable: true,
      value: new Set()
    });
    Object.defineProperty(this, _postProcessors, {
      writable: true,
      value: new Set()
    });
    Object.defineProperty(this, _updateOnlineStatus, {
      writable: true,
      value: this.updateOnlineStatus.bind(this)
    });
    this.defaultLocale = locale;
    const defaultOptions = {
      id: 'uppy',
      autoProceed: false,

      /**
       * @deprecated The method should not be used
       */
      allowMultipleUploads: true,
      allowMultipleUploadBatches: true,
      debug: false,
      restrictions: {
        maxFileSize: null,
        minFileSize: null,
        maxTotalFileSize: null,
        maxNumberOfFiles: null,
        minNumberOfFiles: null,
        allowedFileTypes: null,
        requiredMetaFields: []
      },
      meta: {},
      onBeforeFileAdded: currentFile => currentFile,
      onBeforeUpload: files => files,
      store: DefaultStore(),
      logger: justErrorsLogger,
      infoTimeout: 5000
    }; // Merge default options with the ones set by user,
    // making sure to merge restrictions too

    this.opts = { ...defaultOptions,
      ..._opts,
      restrictions: { ...defaultOptions.restrictions,
        ...(_opts && _opts.restrictions)
      }
    }; // Support debug: true for backwards-compatability, unless logger is set in opts
    // opts instead of this.opts to avoid comparing objects — we set logger: justErrorsLogger in defaultOptions

    if (_opts && _opts.logger && _opts.debug) {
      this.log('You are using a custom `logger`, but also set `debug: true`, which uses built-in logger to output logs to console. Ignoring `debug: true` and using your custom `logger`.', 'warning');
    } else if (_opts && _opts.debug) {
      this.opts.logger = debugLogger;
    }

    this.log(`Using Core v${this.constructor.VERSION}`);

    if (this.opts.restrictions.allowedFileTypes && this.opts.restrictions.allowedFileTypes !== null && !Array.isArray(this.opts.restrictions.allowedFileTypes)) {
      throw new TypeError('`restrictions.allowedFileTypes` must be an array');
    }

    this.i18nInit(); // ___Why throttle at 500ms?
    //    - We must throttle at >250ms for superfocus in Dashboard to work well
    //    (because animation takes 0.25s, and we want to wait for all animations to be over before refocusing).
    //    [Practical Check]: if thottle is at 100ms, then if you are uploading a file,
    //    and click 'ADD MORE FILES', - focus won't activate in Firefox.
    //    - We must throttle at around >500ms to avoid performance lags.
    //    [Practical Check] Firefox, try to upload a big file for a prolonged period of time. Laptop will start to heat up.

    this.calculateProgress = throttle(this.calculateProgress.bind(this), 500, {
      leading: true,
      trailing: true
    });
    this.store = this.opts.store;
    this.setState({
      plugins: {},
      files: {},
      currentUploads: {},
      allowNewUpload: true,
      capabilities: {
        uploadProgress: supportsUploadProgress(),
        individualCancellation: true,
        resumableUploads: false
      },
      totalProgress: 0,
      meta: { ...this.opts.meta
      },
      info: [],
      recoveredState: null
    });
    _classPrivateFieldLooseBase(this, _storeUnsubscribe)[_storeUnsubscribe] = this.store.subscribe((prevState, nextState, patch) => {
      this.emit('state-update', prevState, nextState, patch);
      this.updateAll(nextState);
    }); // Exposing uppy object on window for debugging and testing

    if (this.opts.debug && typeof window !== 'undefined') {
      window[this.opts.id] = this;
    }

    _classPrivateFieldLooseBase(this, _addListeners)[_addListeners]();
  }

  emit(event, ...args) {
    _classPrivateFieldLooseBase(this, _emitter)[_emitter].emit(event, ...args);
  }

  on(event, callback) {
    _classPrivateFieldLooseBase(this, _emitter)[_emitter].on(event, callback);

    return this;
  }

  once(event, callback) {
    _classPrivateFieldLooseBase(this, _emitter)[_emitter].once(event, callback);

    return this;
  }

  off(event, callback) {
    _classPrivateFieldLooseBase(this, _emitter)[_emitter].off(event, callback);

    return this;
  }
  /**
   * Iterate on all plugins and run `update` on them.
   * Called each time state changes.
   *
   */


  updateAll(state) {
    this.iteratePlugins(plugin => {
      plugin.update(state);
    });
  }
  /**
   * Updates state with a patch
   *
   * @param {object} patch {foo: 'bar'}
   */


  setState(patch) {
    this.store.setState(patch);
  }
  /**
   * Returns current state.
   *
   * @returns {object}
   */


  getState() {
    return this.store.getState();
  }
  /**
   * Back compat for when uppy.state is used instead of uppy.getState().
   *
   * @deprecated
   */


  get state() {
    // Here, state is a non-enumerable property.
    return this.getState();
  }
  /**
   * Shorthand to set state for a specific file.
   */


  setFileState(fileID, state) {
    if (!this.getState().files[fileID]) {
      throw new Error(`Can’t set state for ${fileID} (the file could have been removed)`);
    }

    this.setState({
      files: { ...this.getState().files,
        [fileID]: { ...this.getState().files[fileID],
          ...state
        }
      }
    });
  }

  i18nInit() {
    const translator = new Translator([this.defaultLocale, this.opts.locale]);
    this.i18n = translator.translate.bind(translator);
    this.i18nArray = translator.translateArray.bind(translator);
    this.locale = translator.locale;
  }

  setOptions(newOpts) {
    this.opts = { ...this.opts,
      ...newOpts,
      restrictions: { ...this.opts.restrictions,
        ...(newOpts && newOpts.restrictions)
      }
    };

    if (newOpts.meta) {
      this.setMeta(newOpts.meta);
    }

    this.i18nInit();

    if (newOpts.locale) {
      this.iteratePlugins(plugin => {
        plugin.setOptions();
      });
    } // Note: this is not the preact `setState`, it's an internal function that has the same name.


    this.setState(); // so that UI re-renders with new options
  }

  resetProgress() {
    const defaultProgress = {
      percentage: 0,
      bytesUploaded: 0,
      uploadComplete: false,
      uploadStarted: null
    };
    const files = { ...this.getState().files
    };
    const updatedFiles = {};
    Object.keys(files).forEach(fileID => {
      const updatedFile = { ...files[fileID]
      };
      updatedFile.progress = { ...updatedFile.progress,
        ...defaultProgress
      };
      updatedFiles[fileID] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      totalProgress: 0
    });
    this.emit('reset-progress');
  }

  addPreProcessor(fn) {
    _classPrivateFieldLooseBase(this, _preProcessors)[_preProcessors].add(fn);
  }

  removePreProcessor(fn) {
    return _classPrivateFieldLooseBase(this, _preProcessors)[_preProcessors].delete(fn);
  }

  addPostProcessor(fn) {
    _classPrivateFieldLooseBase(this, _postProcessors)[_postProcessors].add(fn);
  }

  removePostProcessor(fn) {
    return _classPrivateFieldLooseBase(this, _postProcessors)[_postProcessors].delete(fn);
  }

  addUploader(fn) {
    _classPrivateFieldLooseBase(this, _uploaders)[_uploaders].add(fn);
  }

  removeUploader(fn) {
    return _classPrivateFieldLooseBase(this, _uploaders)[_uploaders].delete(fn);
  }

  setMeta(data) {
    const updatedMeta = { ...this.getState().meta,
      ...data
    };
    const updatedFiles = { ...this.getState().files
    };
    Object.keys(updatedFiles).forEach(fileID => {
      updatedFiles[fileID] = { ...updatedFiles[fileID],
        meta: { ...updatedFiles[fileID].meta,
          ...data
        }
      };
    });
    this.log('Adding metadata:');
    this.log(data);
    this.setState({
      meta: updatedMeta,
      files: updatedFiles
    });
  }

  setFileMeta(fileID, data) {
    const updatedFiles = { ...this.getState().files
    };

    if (!updatedFiles[fileID]) {
      this.log('Was trying to set metadata for a file that has been removed: ', fileID);
      return;
    }

    const newMeta = { ...updatedFiles[fileID].meta,
      ...data
    };
    updatedFiles[fileID] = { ...updatedFiles[fileID],
      meta: newMeta
    };
    this.setState({
      files: updatedFiles
    });
  }
  /**
   * Get a file object.
   *
   * @param {string} fileID The ID of the file object to return.
   */


  getFile(fileID) {
    return this.getState().files[fileID];
  }
  /**
   * Get all files in an array.
   */


  getFiles() {
    const {
      files
    } = this.getState();
    return Object.values(files);
  }

  getObjectOfFilesPerState() {
    const {
      files: filesObject,
      totalProgress,
      error
    } = this.getState();
    const files = Object.values(filesObject);
    const inProgressFiles = files.filter(({
      progress
    }) => !progress.uploadComplete && progress.uploadStarted);
    const newFiles = files.filter(file => !file.progress.uploadStarted);
    const startedFiles = files.filter(file => file.progress.uploadStarted || file.progress.preprocess || file.progress.postprocess);
    const uploadStartedFiles = files.filter(file => file.progress.uploadStarted);
    const pausedFiles = files.filter(file => file.isPaused);
    const completeFiles = files.filter(file => file.progress.uploadComplete);
    const erroredFiles = files.filter(file => file.error);
    const inProgressNotPausedFiles = inProgressFiles.filter(file => !file.isPaused);
    const processingFiles = files.filter(file => file.progress.preprocess || file.progress.postprocess);
    return {
      newFiles,
      startedFiles,
      uploadStartedFiles,
      pausedFiles,
      completeFiles,
      erroredFiles,
      inProgressFiles,
      inProgressNotPausedFiles,
      processingFiles,
      isUploadStarted: uploadStartedFiles.length > 0,
      isAllComplete: totalProgress === 100 && completeFiles.length === files.length && processingFiles.length === 0,
      isAllErrored: !!error && erroredFiles.length === files.length,
      isAllPaused: inProgressFiles.length !== 0 && pausedFiles.length === inProgressFiles.length,
      isUploadInProgress: inProgressFiles.length > 0,
      isSomeGhost: files.some(file => file.isGhost)
    };
  }
  /**
   * A public wrapper for _checkRestrictions — checks if a file passes a set of restrictions.
   * For use in UI pluigins (like Providers), to disallow selecting files that won’t pass restrictions.
   *
   * @param {object} file object to check
   * @param {Array} [files] array to check maxNumberOfFiles and maxTotalFileSize
   * @returns {object} { result: true/false, reason: why file didn’t pass restrictions }
   */


  validateRestrictions(file, files) {
    try {
      _classPrivateFieldLooseBase(this, _checkRestrictions)[_checkRestrictions](file, files);

      return {
        result: true
      };
    } catch (err) {
      return {
        result: false,
        reason: err.message
      };
    }
  }
  /**
   * Check if file passes a set of restrictions set in options: maxFileSize, minFileSize,
   * maxNumberOfFiles and allowedFileTypes.
   *
   * @param {object} file object to check
   * @param {Array} [files] array to check maxNumberOfFiles and maxTotalFileSize
   * @private
   */


  checkIfFileAlreadyExists(fileID) {
    const {
      files
    } = this.getState();

    if (files[fileID] && !files[fileID].isGhost) {
      return true;
    }

    return false;
  }
  /**
   * Create a file state object based on user-provided `addFile()` options.
   *
   * Note this is extremely side-effectful and should only be done when a file state object
   * will be added to state immediately afterward!
   *
   * The `files` value is passed in because it may be updated by the caller without updating the store.
   */


  /**
   * Add a new file to `state.files`. This will run `onBeforeFileAdded`,
   * try to guess file type in a clever way, check file against restrictions,
   * and start an upload if `autoProceed === true`.
   *
   * @param {object} file object to add
   * @returns {string} id for the added file
   */
  addFile(file) {
    _classPrivateFieldLooseBase(this, _assertNewUploadAllowed)[_assertNewUploadAllowed](file);

    const {
      files
    } = this.getState();

    let newFile = _classPrivateFieldLooseBase(this, _checkAndCreateFileStateObject)[_checkAndCreateFileStateObject](files, file); // Users are asked to re-select recovered files without data,
    // and to keep the progress, meta and everthing else, we only replace said data


    if (files[newFile.id] && files[newFile.id].isGhost) {
      newFile = { ...files[newFile.id],
        data: file.data,
        isGhost: false
      };
      this.log(`Replaced the blob in the restored ghost file: ${newFile.name}, ${newFile.id}`);
    }

    this.setState({
      files: { ...files,
        [newFile.id]: newFile
      }
    });
    this.emit('file-added', newFile);
    this.emit('files-added', [newFile]);
    this.log(`Added file: ${newFile.name}, ${newFile.id}, mime type: ${newFile.type}`);

    _classPrivateFieldLooseBase(this, _startIfAutoProceed)[_startIfAutoProceed]();

    return newFile.id;
  }
  /**
   * Add multiple files to `state.files`. See the `addFile()` documentation.
   *
   * If an error occurs while adding a file, it is logged and the user is notified.
   * This is good for UI plugins, but not for programmatic use.
   * Programmatic users should usually still use `addFile()` on individual files.
   */


  addFiles(fileDescriptors) {
    _classPrivateFieldLooseBase(this, _assertNewUploadAllowed)[_assertNewUploadAllowed](); // create a copy of the files object only once


    const files = { ...this.getState().files
    };
    const newFiles = [];
    const errors = [];

    for (let i = 0; i < fileDescriptors.length; i++) {
      try {
        let newFile = _classPrivateFieldLooseBase(this, _checkAndCreateFileStateObject)[_checkAndCreateFileStateObject](files, fileDescriptors[i]); // Users are asked to re-select recovered files without data,
        // and to keep the progress, meta and everthing else, we only replace said data


        if (files[newFile.id] && files[newFile.id].isGhost) {
          newFile = { ...files[newFile.id],
            data: fileDescriptors[i].data,
            isGhost: false
          };
          this.log(`Replaced blob in a ghost file: ${newFile.name}, ${newFile.id}`);
        }

        files[newFile.id] = newFile;
        newFiles.push(newFile);
      } catch (err) {
        if (!err.isRestriction) {
          errors.push(err);
        }
      }
    }

    this.setState({
      files
    });
    newFiles.forEach(newFile => {
      this.emit('file-added', newFile);
    });
    this.emit('files-added', newFiles);

    if (newFiles.length > 5) {
      this.log(`Added batch of ${newFiles.length} files`);
    } else {
      Object.keys(newFiles).forEach(fileID => {
        this.log(`Added file: ${newFiles[fileID].name}\n id: ${newFiles[fileID].id}\n type: ${newFiles[fileID].type}`);
      });
    }

    if (newFiles.length > 0) {
      _classPrivateFieldLooseBase(this, _startIfAutoProceed)[_startIfAutoProceed]();
    }

    if (errors.length > 0) {
      let message = 'Multiple errors occurred while adding files:\n';
      errors.forEach(subError => {
        message += `\n * ${subError.message}`;
      });
      this.info({
        message: this.i18n('addBulkFilesFailed', {
          smart_count: errors.length
        }),
        details: message
      }, 'error', this.opts.infoTimeout);

      if (typeof AggregateError === 'function') {
        throw new AggregateError(errors, message);
      } else {
        const err = new Error(message);
        err.errors = errors;
        throw err;
      }
    }
  }

  removeFiles(fileIDs, reason) {
    const {
      files,
      currentUploads
    } = this.getState();
    const updatedFiles = { ...files
    };
    const updatedUploads = { ...currentUploads
    };
    const removedFiles = Object.create(null);
    fileIDs.forEach(fileID => {
      if (files[fileID]) {
        removedFiles[fileID] = files[fileID];
        delete updatedFiles[fileID];
      }
    }); // Remove files from the `fileIDs` list in each upload.

    function fileIsNotRemoved(uploadFileID) {
      return removedFiles[uploadFileID] === undefined;
    }

    Object.keys(updatedUploads).forEach(uploadID => {
      const newFileIDs = currentUploads[uploadID].fileIDs.filter(fileIsNotRemoved); // Remove the upload if no files are associated with it anymore.

      if (newFileIDs.length === 0) {
        delete updatedUploads[uploadID];
        return;
      }

      updatedUploads[uploadID] = { ...currentUploads[uploadID],
        fileIDs: newFileIDs
      };
    });
    const stateUpdate = {
      currentUploads: updatedUploads,
      files: updatedFiles
    }; // If all files were removed - allow new uploads,
    // and clear recoveredState

    if (Object.keys(updatedFiles).length === 0) {
      stateUpdate.allowNewUpload = true;
      stateUpdate.error = null;
      stateUpdate.recoveredState = null;
    }

    this.setState(stateUpdate);
    this.calculateTotalProgress();
    const removedFileIDs = Object.keys(removedFiles);
    removedFileIDs.forEach(fileID => {
      this.emit('file-removed', removedFiles[fileID], reason);
    });

    if (removedFileIDs.length > 5) {
      this.log(`Removed ${removedFileIDs.length} files`);
    } else {
      this.log(`Removed files: ${removedFileIDs.join(', ')}`);
    }
  }

  removeFile(fileID, reason = null) {
    this.removeFiles([fileID], reason);
  }

  pauseResume(fileID) {
    if (!this.getState().capabilities.resumableUploads || this.getFile(fileID).uploadComplete) {
      return undefined;
    }

    const wasPaused = this.getFile(fileID).isPaused || false;
    const isPaused = !wasPaused;
    this.setFileState(fileID, {
      isPaused
    });
    this.emit('upload-pause', fileID, isPaused);
    return isPaused;
  }

  pauseAll() {
    const updatedFiles = { ...this.getState().files
    };
    const inProgressUpdatedFiles = Object.keys(updatedFiles).filter(file => {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });
    inProgressUpdatedFiles.forEach(file => {
      const updatedFile = { ...updatedFiles[file],
        isPaused: true
      };
      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles
    });
    this.emit('pause-all');
  }

  resumeAll() {
    const updatedFiles = { ...this.getState().files
    };
    const inProgressUpdatedFiles = Object.keys(updatedFiles).filter(file => {
      return !updatedFiles[file].progress.uploadComplete && updatedFiles[file].progress.uploadStarted;
    });
    inProgressUpdatedFiles.forEach(file => {
      const updatedFile = { ...updatedFiles[file],
        isPaused: false,
        error: null
      };
      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles
    });
    this.emit('resume-all');
  }

  retryAll() {
    const updatedFiles = { ...this.getState().files
    };
    const filesToRetry = Object.keys(updatedFiles).filter(file => {
      return updatedFiles[file].error;
    });
    filesToRetry.forEach(file => {
      const updatedFile = { ...updatedFiles[file],
        isPaused: false,
        error: null
      };
      updatedFiles[file] = updatedFile;
    });
    this.setState({
      files: updatedFiles,
      error: null
    });
    this.emit('retry-all', filesToRetry);

    if (filesToRetry.length === 0) {
      return Promise.resolve({
        successful: [],
        failed: []
      });
    }

    const uploadID = _classPrivateFieldLooseBase(this, _createUpload)[_createUpload](filesToRetry, {
      forceAllowNewUpload: true // create new upload even if allowNewUpload: false

    });

    return _classPrivateFieldLooseBase(this, _runUpload)[_runUpload](uploadID);
  }

  cancelAll() {
    this.emit('cancel-all');
    const {
      files
    } = this.getState();
    const fileIDs = Object.keys(files);

    if (fileIDs.length) {
      this.removeFiles(fileIDs, 'cancel-all');
    }

    this.setState({
      totalProgress: 0,
      error: null,
      recoveredState: null
    });
  }

  retryUpload(fileID) {
    this.setFileState(fileID, {
      error: null,
      isPaused: false
    });
    this.emit('upload-retry', fileID);

    const uploadID = _classPrivateFieldLooseBase(this, _createUpload)[_createUpload]([fileID], {
      forceAllowNewUpload: true // create new upload even if allowNewUpload: false

    });

    return _classPrivateFieldLooseBase(this, _runUpload)[_runUpload](uploadID);
  }

  reset() {
    this.cancelAll();
  }

  logout() {
    this.iteratePlugins(plugin => {
      if (plugin.provider && plugin.provider.logout) {
        plugin.provider.logout();
      }
    });
  }

  calculateProgress(file, data) {
    if (!this.getFile(file.id)) {
      this.log(`Not setting progress for a file that has been removed: ${file.id}`);
      return;
    } // bytesTotal may be null or zero; in that case we can't divide by it


    const canHavePercentage = Number.isFinite(data.bytesTotal) && data.bytesTotal > 0;
    this.setFileState(file.id, {
      progress: { ...this.getFile(file.id).progress,
        bytesUploaded: data.bytesUploaded,
        bytesTotal: data.bytesTotal,
        percentage: canHavePercentage ? Math.round(data.bytesUploaded / data.bytesTotal * 100) : 0
      }
    });
    this.calculateTotalProgress();
  }

  calculateTotalProgress() {
    // calculate total progress, using the number of files currently uploading,
    // multiplied by 100 and the summ of individual progress of each file
    const files = this.getFiles();
    const inProgress = files.filter(file => {
      return file.progress.uploadStarted || file.progress.preprocess || file.progress.postprocess;
    });

    if (inProgress.length === 0) {
      this.emit('progress', 0);
      this.setState({
        totalProgress: 0
      });
      return;
    }

    const sizedFiles = inProgress.filter(file => file.progress.bytesTotal != null);
    const unsizedFiles = inProgress.filter(file => file.progress.bytesTotal == null);

    if (sizedFiles.length === 0) {
      const progressMax = inProgress.length * 100;
      const currentProgress = unsizedFiles.reduce((acc, file) => {
        return acc + file.progress.percentage;
      }, 0);
      const totalProgress = Math.round(currentProgress / progressMax * 100);
      this.setState({
        totalProgress
      });
      return;
    }

    let totalSize = sizedFiles.reduce((acc, file) => {
      return acc + file.progress.bytesTotal;
    }, 0);
    const averageSize = totalSize / sizedFiles.length;
    totalSize += averageSize * unsizedFiles.length;
    let uploadedSize = 0;
    sizedFiles.forEach(file => {
      uploadedSize += file.progress.bytesUploaded;
    });
    unsizedFiles.forEach(file => {
      uploadedSize += averageSize * (file.progress.percentage || 0) / 100;
    });
    let totalProgress = totalSize === 0 ? 0 : Math.round(uploadedSize / totalSize * 100); // hot fix, because:
    // uploadedSize ended up larger than totalSize, resulting in 1325% total

    if (totalProgress > 100) {
      totalProgress = 100;
    }

    this.setState({
      totalProgress
    });
    this.emit('progress', totalProgress);
  }
  /**
   * Registers listeners for all global actions, like:
   * `error`, `file-removed`, `upload-progress`
   */


  updateOnlineStatus() {
    const online = typeof window.navigator.onLine !== 'undefined' ? window.navigator.onLine : true;

    if (!online) {
      this.emit('is-offline');
      this.info(this.i18n('noInternetConnection'), 'error', 0);
      this.wasOffline = true;
    } else {
      this.emit('is-online');

      if (this.wasOffline) {
        this.emit('back-online');
        this.info(this.i18n('connectedToInternet'), 'success', 3000);
        this.wasOffline = false;
      }
    }
  }

  getID() {
    return this.opts.id;
  }
  /**
   * Registers a plugin with Core.
   *
   * @param {object} Plugin object
   * @param {object} [opts] object with options to be passed to Plugin
   * @returns {object} self for chaining
   */
  // eslint-disable-next-line no-shadow


  use(Plugin, opts) {
    if (typeof Plugin !== 'function') {
      const msg = `Expected a plugin class, but got ${Plugin === null ? 'null' : typeof Plugin}.` + ' Please verify that the plugin was imported and spelled correctly.';
      throw new TypeError(msg);
    } // Instantiate


    const plugin = new Plugin(this, opts);
    const pluginId = plugin.id;

    if (!pluginId) {
      throw new Error('Your plugin must have an id');
    }

    if (!plugin.type) {
      throw new Error('Your plugin must have a type');
    }

    const existsPluginAlready = this.getPlugin(pluginId);

    if (existsPluginAlready) {
      const msg = `Already found a plugin named '${existsPluginAlready.id}'. ` + `Tried to use: '${pluginId}'.\n` + 'Uppy plugins must have unique `id` options. See https://uppy.io/docs/plugins/#id.';
      throw new Error(msg);
    }

    if (Plugin.VERSION) {
      this.log(`Using ${pluginId} v${Plugin.VERSION}`);
    }

    if (plugin.type in _classPrivateFieldLooseBase(this, _plugins)[_plugins]) {
      _classPrivateFieldLooseBase(this, _plugins)[_plugins][plugin.type].push(plugin);
    } else {
      _classPrivateFieldLooseBase(this, _plugins)[_plugins][plugin.type] = [plugin];
    }

    plugin.install();
    return this;
  }
  /**
   * Find one Plugin by name.
   *
   * @param {string} id plugin id
   * @returns {BasePlugin|undefined}
   */


  getPlugin(id) {
    for (const plugins of Object.values(_classPrivateFieldLooseBase(this, _plugins)[_plugins])) {
      const foundPlugin = plugins.find(plugin => plugin.id === id);
      if (foundPlugin != null) return foundPlugin;
    }

    return undefined;
  }

  [_Symbol$for](type) {
    return _classPrivateFieldLooseBase(this, _plugins)[_plugins][type];
  }
  /**
   * Iterate through all `use`d plugins.
   *
   * @param {Function} method that will be run on each plugin
   */


  iteratePlugins(method) {
    Object.values(_classPrivateFieldLooseBase(this, _plugins)[_plugins]).flat(1).forEach(method);
  }
  /**
   * Uninstall and remove a plugin.
   *
   * @param {object} instance The plugin instance to remove.
   */


  removePlugin(instance) {
    this.log(`Removing plugin ${instance.id}`);
    this.emit('plugin-remove', instance);

    if (instance.uninstall) {
      instance.uninstall();
    }

    const list = _classPrivateFieldLooseBase(this, _plugins)[_plugins][instance.type]; // list.indexOf failed here, because Vue3 converted the plugin instance
    // to a Proxy object, which failed the strict comparison test:
    // obj !== objProxy


    const index = list.findIndex(item => item.id === instance.id);

    if (index !== -1) {
      list.splice(index, 1);
    }

    const state = this.getState();
    const updatedState = {
      plugins: { ...state.plugins,
        [instance.id]: undefined
      }
    };
    this.setState(updatedState);
  }
  /**
   * Uninstall all plugins and close down this Uppy instance.
   */


  close() {
    this.log(`Closing Uppy instance ${this.opts.id}: removing all files and uninstalling plugins`);
    this.reset();

    _classPrivateFieldLooseBase(this, _storeUnsubscribe)[_storeUnsubscribe]();

    this.iteratePlugins(plugin => {
      this.removePlugin(plugin);
    });

    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener('online', _classPrivateFieldLooseBase(this, _updateOnlineStatus)[_updateOnlineStatus]);
      window.removeEventListener('offline', _classPrivateFieldLooseBase(this, _updateOnlineStatus)[_updateOnlineStatus]);
    }
  }

  hideInfo() {
    const {
      info
    } = this.getState();
    this.setState({
      info: info.slice(1)
    });
    this.emit('info-hidden');
  }
  /**
   * Set info message in `state.info`, so that UI plugins like `Informer`
   * can display the message.
   *
   * @param {string | object} message Message to be displayed by the informer
   * @param {string} [type]
   * @param {number} [duration]
   */


  info(message, type = 'info', duration = 3000) {
    const isComplexMessage = typeof message === 'object';
    this.setState({
      info: [...this.getState().info, {
        type,
        message: isComplexMessage ? message.message : message,
        details: isComplexMessage ? message.details : null
      }]
    });
    setTimeout(() => this.hideInfo(), duration);
    this.emit('info-visible');
  }
  /**
   * Passes messages to a function, provided in `opts.logger`.
   * If `opts.logger: Uppy.debugLogger` or `opts.debug: true`, logs to the browser console.
   *
   * @param {string|object} message to log
   * @param {string} [type] optional `error` or `warning`
   */


  log(message, type) {
    const {
      logger
    } = this.opts;

    switch (type) {
      case 'error':
        logger.error(message);
        break;

      case 'warning':
        logger.warn(message);
        break;

      default:
        logger.debug(message);
        break;
    }
  }
  /**
   * Restore an upload by its ID.
   */


  restore(uploadID) {
    this.log(`Core: attempting to restore upload "${uploadID}"`);

    if (!this.getState().currentUploads[uploadID]) {
      _classPrivateFieldLooseBase(this, _removeUpload)[_removeUpload](uploadID);

      return Promise.reject(new Error('Nonexistent upload'));
    }

    return _classPrivateFieldLooseBase(this, _runUpload)[_runUpload](uploadID);
  }
  /**
   * Create an upload for a bunch of files.
   *
   * @param {Array<string>} fileIDs File IDs to include in this upload.
   * @returns {string} ID of this upload.
   */


  [_Symbol$for2](...args) {
    return _classPrivateFieldLooseBase(this, _createUpload)[_createUpload](...args);
  }

  /**
   * Add data to an upload's result object.
   *
   * @param {string} uploadID The ID of the upload.
   * @param {object} data Data properties to add to the result object.
   */
  addResultData(uploadID, data) {
    if (!_classPrivateFieldLooseBase(this, _getUpload)[_getUpload](uploadID)) {
      this.log(`Not setting result for an upload that has been removed: ${uploadID}`);
      return;
    }

    const {
      currentUploads
    } = this.getState();
    const currentUpload = { ...currentUploads[uploadID],
      result: { ...currentUploads[uploadID].result,
        ...data
      }
    };
    this.setState({
      currentUploads: { ...currentUploads,
        [uploadID]: currentUpload
      }
    });
  }
  /**
   * Remove an upload, eg. if it has been canceled or completed.
   *
   * @param {string} uploadID The ID of the upload.
   */


  /**
   * Start an upload for all the files that are not currently being uploaded.
   *
   * @returns {Promise}
   */
  upload() {
    var _classPrivateFieldLoo;

    if (!((_classPrivateFieldLoo = _classPrivateFieldLooseBase(this, _plugins)[_plugins].uploader) != null && _classPrivateFieldLoo.length)) {
      this.log('No uploader type plugins are used', 'warning');
    }

    let {
      files
    } = this.getState();
    const onBeforeUploadResult = this.opts.onBeforeUpload(files);

    if (onBeforeUploadResult === false) {
      return Promise.reject(new Error('Not starting the upload because onBeforeUpload returned false'));
    }

    if (onBeforeUploadResult && typeof onBeforeUploadResult === 'object') {
      files = onBeforeUploadResult; // Updating files in state, because uploader plugins receive file IDs,
      // and then fetch the actual file object from state

      this.setState({
        files
      });
    }

    return Promise.resolve().then(() => {
      _classPrivateFieldLooseBase(this, _checkMinNumberOfFiles)[_checkMinNumberOfFiles](files);

      _classPrivateFieldLooseBase(this, _checkRequiredMetaFields)[_checkRequiredMetaFields](files);
    }).catch(err => {
      _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](err);
    }).then(() => {
      const {
        currentUploads
      } = this.getState(); // get a list of files that are currently assigned to uploads

      const currentlyUploadingFiles = Object.values(currentUploads).flatMap(curr => curr.fileIDs);
      const waitingFileIDs = [];
      Object.keys(files).forEach(fileID => {
        const file = this.getFile(fileID); // if the file hasn't started uploading and hasn't already been assigned to an upload..

        if (!file.progress.uploadStarted && currentlyUploadingFiles.indexOf(fileID) === -1) {
          waitingFileIDs.push(file.id);
        }
      });

      const uploadID = _classPrivateFieldLooseBase(this, _createUpload)[_createUpload](waitingFileIDs);

      return _classPrivateFieldLooseBase(this, _runUpload)[_runUpload](uploadID);
    }).catch(err => {
      _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](err, {
        showInformer: false
      });
    });
  }

}

function _checkRestrictions2(file, files = this.getFiles()) {
  const {
    maxFileSize,
    minFileSize,
    maxTotalFileSize,
    maxNumberOfFiles,
    allowedFileTypes
  } = this.opts.restrictions;

  if (maxNumberOfFiles) {
    if (files.length + 1 > maxNumberOfFiles) {
      throw new RestrictionError(`${this.i18n('youCanOnlyUploadX', {
        smart_count: maxNumberOfFiles
      })}`);
    }
  }

  if (allowedFileTypes) {
    const isCorrectFileType = allowedFileTypes.some(type => {
      // check if this is a mime-type
      if (type.indexOf('/') > -1) {
        if (!file.type) return false;
        return match(file.type.replace(/;.*?$/, ''), type);
      } // otherwise this is likely an extension


      if (type[0] === '.' && file.extension) {
        return file.extension.toLowerCase() === type.substr(1).toLowerCase();
      }

      return false;
    });

    if (!isCorrectFileType) {
      const allowedFileTypesString = allowedFileTypes.join(', ');
      throw new RestrictionError(this.i18n('youCanOnlyUploadFileTypes', {
        types: allowedFileTypesString
      }));
    }
  } // We can't check maxTotalFileSize if the size is unknown.


  if (maxTotalFileSize && file.size != null) {
    let totalFilesSize = 0;
    totalFilesSize += file.size;
    files.forEach(f => {
      totalFilesSize += f.size;
    });

    if (totalFilesSize > maxTotalFileSize) {
      throw new RestrictionError(this.i18n('exceedsSize', {
        size: prettierBytes(maxTotalFileSize),
        file: file.name
      }));
    }
  } // We can't check maxFileSize if the size is unknown.


  if (maxFileSize && file.size != null) {
    if (file.size > maxFileSize) {
      throw new RestrictionError(this.i18n('exceedsSize', {
        size: prettierBytes(maxFileSize),
        file: file.name
      }));
    }
  } // We can't check minFileSize if the size is unknown.


  if (minFileSize && file.size != null) {
    if (file.size < minFileSize) {
      throw new RestrictionError(this.i18n('inferiorSize', {
        size: prettierBytes(minFileSize)
      }));
    }
  }
}

function _checkMinNumberOfFiles2(files) {
  const {
    minNumberOfFiles
  } = this.opts.restrictions;

  if (Object.keys(files).length < minNumberOfFiles) {
    throw new RestrictionError(`${this.i18n('youHaveToAtLeastSelectX', {
      smart_count: minNumberOfFiles
    })}`);
  }
}

function _checkRequiredMetaFieldsOnFile2(file) {
  const {
    requiredMetaFields
  } = this.opts.restrictions;
  const {
    hasOwnProperty
  } = Object.prototype;
  const errors = [];
  const missingFields = [];

  for (let i = 0; i < requiredMetaFields.length; i++) {
    if (!hasOwnProperty.call(file.meta, requiredMetaFields[i]) || file.meta[requiredMetaFields[i]] === '') {
      const err = new RestrictionError(`${this.i18n('missingRequiredMetaFieldOnFile', {
        fileName: file.name
      })}`);
      errors.push(err);
      missingFields.push(requiredMetaFields[i]);

      _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](err, {
        file,
        showInformer: false,
        throwErr: false
      });
    }
  }

  this.setFileState(file.id, {
    missingRequiredMetaFields: missingFields
  });
  return errors;
}

function _checkRequiredMetaFields2(files) {
  const errors = Object.keys(files).flatMap(fileID => {
    const file = this.getFile(fileID);
    return _classPrivateFieldLooseBase(this, _checkRequiredMetaFieldsOnFile)[_checkRequiredMetaFieldsOnFile](file);
  });

  if (errors.length) {
    throw new AggregateRestrictionError(errors, `${this.i18n('missingRequiredMetaField')}`);
  }
}

function _showOrLogErrorAndThrow2(err, {
  showInformer = true,
  file = null,
  throwErr = true
} = {}) {
  const message = typeof err === 'object' ? err.message : err;
  const details = typeof err === 'object' && err.details ? err.details : ''; // Restriction errors should be logged, but not as errors,
  // as they are expected and shown in the UI.

  let logMessageWithDetails = message;

  if (details) {
    logMessageWithDetails += ` ${details}`;
  }

  if (err.isRestriction) {
    this.log(logMessageWithDetails);
    this.emit('restriction-failed', file, err);
  } else {
    this.log(logMessageWithDetails, 'error');
  } // Sometimes informer has to be shown manually by the developer,
  // for example, in `onBeforeFileAdded`.


  if (showInformer) {
    this.info({
      message,
      details
    }, 'error', this.opts.infoTimeout);
  }

  if (throwErr) {
    throw typeof err === 'object' ? err : new Error(err);
  }
}

function _assertNewUploadAllowed2(file) {
  const {
    allowNewUpload
  } = this.getState();

  if (allowNewUpload === false) {
    _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](new RestrictionError(this.i18n('noMoreFilesAllowed')), {
      file
    });
  }
}

function _checkAndCreateFileStateObject2(files, fileDescriptor) {
  const fileType = getFileType(fileDescriptor);
  const fileName = getFileName(fileType, fileDescriptor);
  const fileExtension = getFileNameAndExtension(fileName).extension;
  const isRemote = Boolean(fileDescriptor.isRemote);
  const fileID = generateFileID({ ...fileDescriptor,
    type: fileType
  });

  if (this.checkIfFileAlreadyExists(fileID)) {
    const error = new RestrictionError(this.i18n('noDuplicates', {
      fileName
    }));

    _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](error, {
      file: fileDescriptor
    });
  }

  const meta = fileDescriptor.meta || {};
  meta.name = fileName;
  meta.type = fileType; // `null` means the size is unknown.

  const size = Number.isFinite(fileDescriptor.data.size) ? fileDescriptor.data.size : null;
  let newFile = {
    source: fileDescriptor.source || '',
    id: fileID,
    name: fileName,
    extension: fileExtension || '',
    meta: { ...this.getState().meta,
      ...meta
    },
    type: fileType,
    data: fileDescriptor.data,
    progress: {
      percentage: 0,
      bytesUploaded: 0,
      bytesTotal: size,
      uploadComplete: false,
      uploadStarted: null
    },
    size,
    isRemote,
    remote: fileDescriptor.remote || '',
    preview: fileDescriptor.preview
  };
  const onBeforeFileAddedResult = this.opts.onBeforeFileAdded(newFile, files);

  if (onBeforeFileAddedResult === false) {
    // Don’t show UI info for this error, as it should be done by the developer
    _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](new RestrictionError('Cannot add the file because onBeforeFileAdded returned false.'), {
      showInformer: false,
      fileDescriptor
    });
  } else if (typeof onBeforeFileAddedResult === 'object' && onBeforeFileAddedResult !== null) {
    newFile = onBeforeFileAddedResult;
  }

  try {
    const filesArray = Object.keys(files).map(i => files[i]);

    _classPrivateFieldLooseBase(this, _checkRestrictions)[_checkRestrictions](newFile, filesArray);
  } catch (err) {
    _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](err, {
      file: newFile
    });
  }

  return newFile;
}

function _startIfAutoProceed2() {
  if (this.opts.autoProceed && !this.scheduledAutoProceed) {
    this.scheduledAutoProceed = setTimeout(() => {
      this.scheduledAutoProceed = null;
      this.upload().catch(err => {
        if (!err.isRestriction) {
          this.log(err.stack || err.message || err);
        }
      });
    }, 4);
  }
}

function _addListeners2() {
  /**
   * @param {Error} error
   * @param {object} [file]
   * @param {object} [response]
   */
  const errorHandler = (error, file, response) => {
    let errorMsg = error.message || 'Unknown error';

    if (error.details) {
      errorMsg += ` ${error.details}`;
    }

    this.setState({
      error: errorMsg
    });

    if (file != null && file.id in this.getState().files) {
      this.setFileState(file.id, {
        error: errorMsg,
        response
      });
    }
  };

  this.on('error', errorHandler);
  this.on('upload-error', (file, error, response) => {
    errorHandler(error, file, response);

    if (typeof error === 'object' && error.message) {
      const newError = new Error(error.message);
      newError.details = error.message;

      if (error.details) {
        newError.details += ` ${error.details}`;
      }

      newError.message = this.i18n('failedToUpload', {
        file: file.name
      });

      _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](newError, {
        throwErr: false
      });
    } else {
      _classPrivateFieldLooseBase(this, _showOrLogErrorAndThrow)[_showOrLogErrorAndThrow](error, {
        throwErr: false
      });
    }
  });
  this.on('upload', () => {
    this.setState({
      error: null
    });
  });
  this.on('upload-started', file => {
    if (!this.getFile(file.id)) {
      this.log(`Not setting progress for a file that has been removed: ${file.id}`);
      return;
    }

    this.setFileState(file.id, {
      progress: {
        uploadStarted: Date.now(),
        uploadComplete: false,
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size
      }
    });
  });
  this.on('upload-progress', this.calculateProgress);
  this.on('upload-success', (file, uploadResp) => {
    if (!this.getFile(file.id)) {
      this.log(`Not setting progress for a file that has been removed: ${file.id}`);
      return;
    }

    const currentProgress = this.getFile(file.id).progress;
    this.setFileState(file.id, {
      progress: { ...currentProgress,
        postprocess: _classPrivateFieldLooseBase(this, _postProcessors)[_postProcessors].size > 0 ? {
          mode: 'indeterminate'
        } : null,
        uploadComplete: true,
        percentage: 100,
        bytesUploaded: currentProgress.bytesTotal
      },
      response: uploadResp,
      uploadURL: uploadResp.uploadURL,
      isPaused: false
    }); // Remote providers sometimes don't tell us the file size,
    // but we can know how many bytes we uploaded once the upload is complete.

    if (file.size == null) {
      this.setFileState(file.id, {
        size: uploadResp.bytesUploaded || currentProgress.bytesTotal
      });
    }

    this.calculateTotalProgress();
  });
  this.on('preprocess-progress', (file, progress) => {
    if (!this.getFile(file.id)) {
      this.log(`Not setting progress for a file that has been removed: ${file.id}`);
      return;
    }

    this.setFileState(file.id, {
      progress: { ...this.getFile(file.id).progress,
        preprocess: progress
      }
    });
  });
  this.on('preprocess-complete', file => {
    if (!this.getFile(file.id)) {
      this.log(`Not setting progress for a file that has been removed: ${file.id}`);
      return;
    }

    const files = { ...this.getState().files
    };
    files[file.id] = { ...files[file.id],
      progress: { ...files[file.id].progress
      }
    };
    delete files[file.id].progress.preprocess;
    this.setState({
      files
    });
  });
  this.on('postprocess-progress', (file, progress) => {
    if (!this.getFile(file.id)) {
      this.log(`Not setting progress for a file that has been removed: ${file.id}`);
      return;
    }

    this.setFileState(file.id, {
      progress: { ...this.getState().files[file.id].progress,
        postprocess: progress
      }
    });
  });
  this.on('postprocess-complete', file => {
    if (!this.getFile(file.id)) {
      this.log(`Not setting progress for a file that has been removed: ${file.id}`);
      return;
    }

    const files = { ...this.getState().files
    };
    files[file.id] = { ...files[file.id],
      progress: { ...files[file.id].progress
      }
    };
    delete files[file.id].progress.postprocess;
    this.setState({
      files
    });
  });
  this.on('restored', () => {
    // Files may have changed--ensure progress is still accurate.
    this.calculateTotalProgress();
  });
  this.on('dashboard:file-edit-complete', file => {
    if (file) {
      _classPrivateFieldLooseBase(this, _checkRequiredMetaFieldsOnFile)[_checkRequiredMetaFieldsOnFile](file);
    }
  }); // show informer if offline

  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', _classPrivateFieldLooseBase(this, _updateOnlineStatus)[_updateOnlineStatus]);
    window.addEventListener('offline', _classPrivateFieldLooseBase(this, _updateOnlineStatus)[_updateOnlineStatus]);
    setTimeout(_classPrivateFieldLooseBase(this, _updateOnlineStatus)[_updateOnlineStatus], 3000);
  }
}

function _createUpload2(fileIDs, opts = {}) {
  // uppy.retryAll sets this to true — when retrying we want to ignore `allowNewUpload: false`
  const {
    forceAllowNewUpload = false
  } = opts;
  const {
    allowNewUpload,
    currentUploads
  } = this.getState();

  if (!allowNewUpload && !forceAllowNewUpload) {
    throw new Error('Cannot create a new upload: already uploading.');
  }

  const uploadID = nanoid();
  this.emit('upload', {
    id: uploadID,
    fileIDs
  });
  this.setState({
    allowNewUpload: this.opts.allowMultipleUploadBatches !== false && this.opts.allowMultipleUploads !== false,
    currentUploads: { ...currentUploads,
      [uploadID]: {
        fileIDs,
        step: 0,
        result: {}
      }
    }
  });
  return uploadID;
}

function _getUpload2(uploadID) {
  const {
    currentUploads
  } = this.getState();
  return currentUploads[uploadID];
}

function _removeUpload2(uploadID) {
  const currentUploads = { ...this.getState().currentUploads
  };
  delete currentUploads[uploadID];
  this.setState({
    currentUploads
  });
}

async function _runUpload2(uploadID) {
  let {
    currentUploads
  } = this.getState();
  let currentUpload = currentUploads[uploadID];
  const restoreStep = currentUpload.step || 0;
  const steps = [...Array.from(_classPrivateFieldLooseBase(this, _preProcessors)[_preProcessors]), ...Array.from(_classPrivateFieldLooseBase(this, _uploaders)[_uploaders]), ...Array.from(_classPrivateFieldLooseBase(this, _postProcessors)[_postProcessors])];

  try {
    for (let step = restoreStep; step < steps.length; step++) {
      if (!currentUpload) {
        break;
      }

      const fn = steps[step];
      const updatedUpload = { ...currentUpload,
        step
      };
      this.setState({
        currentUploads: { ...currentUploads,
          [uploadID]: updatedUpload
        }
      }); // TODO give this the `updatedUpload` object as its only parameter maybe?
      // Otherwise when more metadata may be added to the upload this would keep getting more parameters

      await fn(updatedUpload.fileIDs, uploadID); // Update currentUpload value in case it was modified asynchronously.

      currentUploads = this.getState().currentUploads;
      currentUpload = currentUploads[uploadID];
    }
  } catch (err) {
    this.emit('error', err);

    _classPrivateFieldLooseBase(this, _removeUpload)[_removeUpload](uploadID);

    throw err;
  } // Set result data.


  if (currentUpload) {
    // Mark postprocessing step as complete if necessary; this addresses a case where we might get
    // stuck in the postprocessing UI while the upload is fully complete.
    // If the postprocessing steps do not do any work, they may not emit postprocessing events at
    // all, and never mark the postprocessing as complete. This is fine on its own but we
    // introduced code in the @uppy/core upload-success handler to prepare postprocessing progress
    // state if any postprocessors are registered. That is to avoid a "flash of completed state"
    // before the postprocessing plugins can emit events.
    //
    // So, just in case an upload with postprocessing plugins *has* completed *without* emitting
    // postprocessing completion, we do it instead.
    currentUpload.fileIDs.forEach(fileID => {
      const file = this.getFile(fileID);

      if (file && file.progress.postprocess) {
        this.emit('postprocess-complete', file);
      }
    });
    const files = currentUpload.fileIDs.map(fileID => this.getFile(fileID));
    const successful = files.filter(file => !file.error);
    const failed = files.filter(file => file.error);
    await this.addResultData(uploadID, {
      successful,
      failed,
      uploadID
    }); // Update currentUpload value in case it was modified asynchronously.

    currentUploads = this.getState().currentUploads;
    currentUpload = currentUploads[uploadID];
  } // Emit completion events.
  // This is in a separate function so that the `currentUploads` variable
  // always refers to the latest state. In the handler right above it refers
  // to an outdated object without the `.result` property.


  let result;

  if (currentUpload) {
    result = currentUpload.result;
    this.emit('complete', result);

    _classPrivateFieldLooseBase(this, _removeUpload)[_removeUpload](uploadID);
  }

  if (result == null) {
    this.log(`Not setting result for an upload that has been removed: ${uploadID}`);
  }

  return result;
}

Uppy.VERSION = "2.1.2";
module.exports = Uppy;

},{"./../../store-default":135,"./../../utils/lib/Translator":148,"./../../utils/lib/generateFileID":155,"./../../utils/lib/getFileNameAndExtension":162,"./../../utils/lib/getFileType":163,"./getFileName":47,"./locale":49,"./loggers":50,"./supportsUploadProgress":51,"@transloadit/prettier-bytes":1,"lodash.throttle":11,"mime-match":13,"namespace-emitter":15,"nanoid":16}],47:[function(require,module,exports){
"use strict";

module.exports = function getFileName(fileType, fileDescriptor) {
  if (fileDescriptor.name) {
    return fileDescriptor.name;
  }

  if (fileType.split('/')[0] === 'image') {
    return `${fileType.split('/')[0]}.${fileType.split('/')[1]}`;
  }

  return 'noname';
};

},{}],48:[function(require,module,exports){
'use strict';

const Uppy = require('./Uppy');

const UIPlugin = require('./UIPlugin');

const BasePlugin = require('./BasePlugin');

const {
  debugLogger
} = require('./loggers');

module.exports = Uppy;
module.exports.Uppy = Uppy;
module.exports.UIPlugin = UIPlugin;
module.exports.BasePlugin = BasePlugin;
module.exports.debugLogger = debugLogger;

},{"./BasePlugin":44,"./UIPlugin":45,"./Uppy":46,"./loggers":50}],49:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    addBulkFilesFailed: {
      0: 'Failed to add %{smart_count} file due to an internal error',
      1: 'Failed to add %{smart_count} files due to internal errors'
    },
    youCanOnlyUploadX: {
      0: 'You can only upload %{smart_count} file',
      1: 'You can only upload %{smart_count} files'
    },
    youHaveToAtLeastSelectX: {
      0: 'You have to select at least %{smart_count} file',
      1: 'You have to select at least %{smart_count} files'
    },
    exceedsSize: '%{file} exceeds maximum allowed size of %{size}',
    missingRequiredMetaField: 'Missing required meta fields',
    missingRequiredMetaFieldOnFile: 'Missing required meta fields in %{fileName}',
    inferiorSize: 'This file is smaller than the allowed size of %{size}',
    youCanOnlyUploadFileTypes: 'You can only upload: %{types}',
    noMoreFilesAllowed: 'Cannot add more files',
    noDuplicates: "Cannot add the duplicate file '%{fileName}', it already exists",
    companionError: 'Connection with Companion failed',
    authAborted: 'Authentication aborted',
    companionUnauthorizeHint: 'To unauthorize to your %{provider} account, please go to %{url}',
    failedToUpload: 'Failed to upload %{file}',
    noInternetConnection: 'No Internet connection',
    connectedToInternet: 'Connected to the Internet',
    // Strings for remote providers
    noFilesFound: 'You have no files or folders here',
    selectX: {
      0: 'Select %{smart_count}',
      1: 'Select %{smart_count}'
    },
    allFilesFromFolderNamed: 'All files from folder %{name}',
    openFolderNamed: 'Open folder %{name}',
    cancel: 'Cancel',
    logOut: 'Log out',
    filter: 'Filter',
    resetFilter: 'Reset filter',
    loading: 'Loading...',
    authenticateWithTitle: 'Please authenticate with %{pluginName} to select files',
    authenticateWith: 'Connect to %{pluginName}',
    signInWithGoogle: 'Sign in with Google',
    searchImages: 'Search for images',
    enterTextToSearch: 'Enter text to search for images',
    backToSearch: 'Back to Search',
    emptyFolderAdded: 'No files were added from empty folder',
    folderAlreadyAdded: 'The folder "%{folder}" was already added',
    folderAdded: {
      0: 'Added %{smart_count} file from %{folder}',
      1: 'Added %{smart_count} files from %{folder}'
    }
  }
};

},{}],50:[function(require,module,exports){
"use strict";

/* eslint-disable no-console */
const getTimeStamp = require('./../../utils/lib/getTimeStamp'); // Swallow all logs, except errors.
// default if logger is not set or debug: false


const justErrorsLogger = {
  debug: () => {},
  warn: () => {},
  error: (...args) => console.error(`[Uppy] [${getTimeStamp()}]`, ...args)
}; // Print logs to console with namespace + timestamp,
// set by logger: Uppy.debugLogger or debug: true

const debugLogger = {
  debug: (...args) => console.debug(`[Uppy] [${getTimeStamp()}]`, ...args),
  warn: (...args) => console.warn(`[Uppy] [${getTimeStamp()}]`, ...args),
  error: (...args) => console.error(`[Uppy] [${getTimeStamp()}]`, ...args)
};
module.exports = {
  justErrorsLogger,
  debugLogger
};

},{"./../../utils/lib/getTimeStamp":168}],51:[function(require,module,exports){
"use strict";

// Edge 15.x does not fire 'progress' events on uploads.
// See https://github.com/transloadit/uppy/issues/945
// And https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/12224510/
module.exports = function supportsUploadProgress(userAgent) {
  // Allow passing in userAgent for tests
  if (userAgent == null) {
    userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
  } // Assume it works because basically everything supports progress events.


  if (!userAgent) return true;
  const m = /Edge\/(\d+\.\d+)/.exec(userAgent);
  if (!m) return true;
  const edgeVersion = m[1];
  let [major, minor] = edgeVersion.split('.');
  major = parseInt(major, 10);
  minor = parseInt(minor, 10); // Worked before:
  // Edge 40.15063.0.0
  // Microsoft EdgeHTML 15.15063

  if (major < 15 || major === 15 && minor < 15063) {
    return true;
  } // Fixed in:
  // Microsoft EdgeHTML 18.18218


  if (major > 18 || major === 18 && minor >= 18218) {
    return true;
  } // other versions don't work.


  return false;
};

},{}],52:[function(require,module,exports){
"use strict";

let _Symbol$for;

const {
  h,
  Component
} = require('preact');

_Symbol$for = Symbol.for('uppy test: disable unused locale key warning');

class AddFiles extends Component {
  constructor(...args) {
    super(...args);

    this.triggerFileInputClick = () => {
      this.fileInput.click();
    };

    this.triggerFolderInputClick = () => {
      this.folderInput.click();
    };

    this.onFileInputChange = event => {
      this.props.handleInputChange(event); // We clear the input after a file is selected, because otherwise
      // change event is not fired in Chrome and Safari when a file
      // with the same name is selected.
      // ___Why not use value="" on <input/> instead?
      //    Because if we use that method of clearing the input,
      //    Chrome will not trigger change if we drop the same file twice (Issue #768).

      event.target.value = null;
    };

    this.renderHiddenInput = (isFolder, refCallback) => {
      return h("input", {
        className: "uppy-Dashboard-input",
        hidden: true,
        "aria-hidden": "true",
        tabIndex: -1,
        webkitdirectory: isFolder,
        type: "file",
        name: "files[]",
        multiple: this.props.maxNumberOfFiles !== 1,
        onChange: this.onFileInputChange,
        accept: this.props.allowedFileTypes,
        ref: refCallback
      });
    };

    this.renderMyDeviceAcquirer = () => {
      return h("div", {
        className: "uppy-DashboardTab",
        role: "presentation",
        "data-uppy-acquirer-id": "MyDevice"
      }, h("button", {
        type: "button",
        className: "uppy-u-reset uppy-c-btn uppy-DashboardTab-btn",
        role: "tab",
        tabIndex: 0,
        "data-uppy-super-focusable": true,
        onClick: this.triggerFileInputClick
      }, h("svg", {
        "aria-hidden": "true",
        focusable: "false",
        width: "32",
        height: "32",
        viewBox: "0 0 32 32"
      }, h("g", {
        fill: "none",
        fillRule: "evenodd"
      }, h("rect", {
        className: "uppy-ProviderIconBg",
        width: "32",
        height: "32",
        rx: "16",
        fill: "#2275D7"
      }), h("path", {
        d: "M21.973 21.152H9.863l-1.108-5.087h14.464l-1.246 5.087zM9.935 11.37h3.958l.886 1.444a.673.673 0 0 0 .585.316h6.506v1.37H9.935v-3.13zm14.898 3.44a.793.793 0 0 0-.616-.31h-.978v-2.126c0-.379-.275-.613-.653-.613H15.75l-.886-1.445a.673.673 0 0 0-.585-.316H9.232c-.378 0-.667.209-.667.587V14.5h-.782a.793.793 0 0 0-.61.303.795.795 0 0 0-.155.663l1.45 6.633c.078.36.396.618.764.618h13.354c.36 0 .674-.246.76-.595l1.631-6.636a.795.795 0 0 0-.144-.675z",
        fill: "#FFF"
      }))), h("div", {
        className: "uppy-DashboardTab-name"
      }, this.props.i18n('myDevice'))));
    };

    this.renderBrowseButton = (text, onClickFn) => {
      const numberOfAcquirers = this.props.acquirers.length;
      return h("button", {
        type: "button",
        className: "uppy-u-reset uppy-Dashboard-browse",
        onClick: onClickFn,
        "data-uppy-super-focusable": numberOfAcquirers === 0
      }, text);
    };

    this.renderDropPasteBrowseTagline = () => {
      const numberOfAcquirers = this.props.acquirers.length;
      const browseFiles = this.renderBrowseButton(this.props.i18n('browseFiles'), this.triggerFileInputClick);
      const browseFolders = this.renderBrowseButton(this.props.i18n('browseFolders'), this.triggerFolderInputClick); // in order to keep the i18n CamelCase and options lower (as are defaults) we will want to transform a lower
      // to Camel

      const lowerFMSelectionType = this.props.fileManagerSelectionType;
      const camelFMSelectionType = lowerFMSelectionType.charAt(0).toUpperCase() + lowerFMSelectionType.slice(1);
      return h("div", {
        class: "uppy-Dashboard-AddFiles-title"
      }, // eslint-disable-next-line no-nested-ternary
      this.props.disableLocalFiles ? this.props.i18n('importFiles') : numberOfAcquirers > 0 ? this.props.i18nArray(`dropPasteImport${camelFMSelectionType}`, {
        browseFiles,
        browseFolders,
        browse: browseFiles
      }) : this.props.i18nArray(`dropPaste${camelFMSelectionType}`, {
        browseFiles,
        browseFolders,
        browse: browseFiles
      }));
    };

    this.renderAcquirer = acquirer => {
      return h("div", {
        className: "uppy-DashboardTab",
        role: "presentation",
        "data-uppy-acquirer-id": acquirer.id
      }, h("button", {
        type: "button",
        className: "uppy-u-reset uppy-c-btn uppy-DashboardTab-btn",
        role: "tab",
        tabIndex: 0,
        "aria-controls": `uppy-DashboardContent-panel--${acquirer.id}`,
        "aria-selected": this.props.activePickerPanel.id === acquirer.id,
        "data-uppy-super-focusable": true,
        onClick: () => this.props.showPanel(acquirer.id)
      }, acquirer.icon(), h("div", {
        className: "uppy-DashboardTab-name"
      }, acquirer.name)));
    };

    this.renderAcquirers = (acquirers, disableLocalFiles) => {
      // Group last two buttons, so we don’t end up with
      // just one button on a new line
      const acquirersWithoutLastTwo = [...acquirers];
      const lastTwoAcquirers = acquirersWithoutLastTwo.splice(acquirers.length - 2, acquirers.length);
      return h("div", {
        className: "uppy-Dashboard-AddFiles-list",
        role: "tablist"
      }, !disableLocalFiles && this.renderMyDeviceAcquirer(), acquirersWithoutLastTwo.map(acquirer => this.renderAcquirer(acquirer)), h("span", {
        role: "presentation",
        style: {
          'white-space': 'nowrap'
        }
      }, lastTwoAcquirers.map(acquirer => this.renderAcquirer(acquirer))));
    };
  }

  [_Symbol$for]() {
    // Those are actually used in `renderDropPasteBrowseTagline` method.
    this.props.i18nArray('dropPasteBoth');
    this.props.i18nArray('dropPasteFiles');
    this.props.i18nArray('dropPasteFolders');
    this.props.i18nArray('dropPasteImportBoth');
    this.props.i18nArray('dropPasteImportFiles');
    this.props.i18nArray('dropPasteImportFolders');
  }

  renderPoweredByUppy() {
    const {
      i18nArray
    } = this.props;
    const uppyBranding = h("span", null, h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      className: "uppy-c-icon uppy-Dashboard-poweredByIcon",
      width: "11",
      height: "11",
      viewBox: "0 0 11 11"
    }, h("path", {
      d: "M7.365 10.5l-.01-4.045h2.612L5.5.806l-4.467 5.65h2.604l.01 4.044h3.718z",
      fillRule: "evenodd"
    })), h("span", {
      className: "uppy-Dashboard-poweredByUppy"
    }, "Uppy"));
    const linkText = i18nArray('poweredBy', {
      uppy: uppyBranding
    });
    return h("a", {
      tabIndex: "-1",
      href: "https://uppy.io",
      rel: "noreferrer noopener",
      target: "_blank",
      className: "uppy-Dashboard-poweredBy"
    }, linkText);
  }

  render() {
    return h("div", {
      className: "uppy-Dashboard-AddFiles"
    }, this.renderHiddenInput(false, ref => {
      this.fileInput = ref;
    }), this.renderHiddenInput(true, ref => {
      this.folderInput = ref;
    }), this.renderDropPasteBrowseTagline(), this.props.acquirers.length > 0 && this.renderAcquirers(this.props.acquirers, this.props.disableLocalFiles), h("div", {
      className: "uppy-Dashboard-AddFiles-info"
    }, this.props.note && h("div", {
      className: "uppy-Dashboard-note"
    }, this.props.note), this.props.proudlyDisplayPoweredByUppy && this.renderPoweredByUppy(this.props)));
  }

}

module.exports = AddFiles;

},{"preact":18}],53:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const classNames = require('classnames');

const AddFiles = require('./AddFiles');

const AddFilesPanel = props => {
  return h("div", {
    className: classNames('uppy-Dashboard-AddFilesPanel', props.className),
    "data-uppy-panelType": "AddFiles",
    "aria-hidden": props.showAddFilesPanel
  }, h("div", {
    className: "uppy-DashboardContent-bar"
  }, h("div", {
    className: "uppy-DashboardContent-title",
    role: "heading",
    "aria-level": "1"
  }, props.i18n('addingMoreFiles')), h("button", {
    className: "uppy-DashboardContent-back",
    type: "button",
    onClick: () => props.toggleAddFilesPanel(false)
  }, props.i18n('back'))), h(AddFiles, props));
};

module.exports = AddFilesPanel;

},{"./AddFiles":52,"classnames":4,"preact":18}],54:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const {
  h
} = require('preact');

const classNames = require('classnames');

const isDragDropSupported = require('./../../../utils/lib/isDragDropSupported');

const FileList = require('./FileList');

const AddFiles = require('./AddFiles');

const AddFilesPanel = require('./AddFilesPanel');

const PickerPanelContent = require('./PickerPanelContent');

const EditorPanel = require('./EditorPanel');

const PanelTopBar = require('./PickerPanelTopBar');

const FileCard = require('./FileCard');

const Slide = require('./Slide'); // http://dev.edenspiekermann.com/2016/02/11/introducing-accessible-modal-dialog
// https://github.com/ghosh/micromodal


const WIDTH_XL = 900;
const WIDTH_LG = 700;
const WIDTH_MD = 576;
const HEIGHT_MD = 400;

module.exports = function Dashboard(props) {
  const noFiles = props.totalFileCount === 0;
  const isSizeMD = props.containerWidth > WIDTH_MD;
  const wrapperClassName = classNames({
    'uppy-Root': props.isTargetDOMEl
  });
  const dashboardClassName = classNames({
    'uppy-Dashboard': true,
    'uppy-Dashboard--isDisabled': props.disabled,
    'uppy-Dashboard--animateOpenClose': props.animateOpenClose,
    'uppy-Dashboard--isClosing': props.isClosing,
    'uppy-Dashboard--isDraggingOver': props.isDraggingOver,
    'uppy-Dashboard--modal': !props.inline,
    'uppy-size--md': props.containerWidth > WIDTH_MD,
    'uppy-size--lg': props.containerWidth > WIDTH_LG,
    'uppy-size--xl': props.containerWidth > WIDTH_XL,
    'uppy-size--height-md': props.containerHeight > HEIGHT_MD,
    'uppy-Dashboard--isAddFilesPanelVisible': props.showAddFilesPanel,
    'uppy-Dashboard--isInnerWrapVisible': props.areInsidesReadyToBeVisible
  }); // Important: keep these in sync with the percent width values in `src/components/FileItem/index.scss`.

  let itemsPerRow = 1; // mobile

  if (props.containerWidth > WIDTH_XL) {
    itemsPerRow = 5;
  } else if (props.containerWidth > WIDTH_LG) {
    itemsPerRow = 4;
  } else if (props.containerWidth > WIDTH_MD) {
    itemsPerRow = 3;
  }

  const showFileList = props.showSelectedFiles && !noFiles;
  const numberOfFilesForRecovery = props.recoveredState ? Object.keys(props.recoveredState.files).length : null;
  const numberOfGhosts = props.files ? Object.keys(props.files).filter(fileID => props.files[fileID].isGhost).length : null;

  const renderRestoredText = () => {
    if (numberOfGhosts > 0) {
      return props.i18n('recoveredXFiles', {
        smart_count: numberOfGhosts
      });
    }

    return props.i18n('recoveredAllFiles');
  };

  const dashboard = h("div", {
    className: dashboardClassName,
    "data-uppy-theme": props.theme,
    "data-uppy-num-acquirers": props.acquirers.length,
    "data-uppy-drag-drop-supported": !props.disableLocalFiles && isDragDropSupported(),
    "aria-hidden": props.inline ? 'false' : props.isHidden,
    "aria-disabled": props.disabled,
    "aria-label": !props.inline ? props.i18n('dashboardWindowTitle') : props.i18n('dashboardTitle'),
    onPaste: props.handlePaste,
    onDragOver: props.handleDragOver,
    onDragLeave: props.handleDragLeave,
    onDrop: props.handleDrop
  }, h("div", {
    "aria-hidden": "true",
    className: "uppy-Dashboard-overlay",
    tabIndex: -1,
    onClick: props.handleClickOutside
  }), h("div", {
    className: "uppy-Dashboard-inner",
    "aria-modal": !props.inline && 'true',
    role: !props.inline && 'dialog',
    style: {
      width: props.inline && props.width ? props.width : '',
      height: props.inline && props.height ? props.height : ''
    }
  }, !props.inline ? h("button", {
    className: "uppy-u-reset uppy-Dashboard-close",
    type: "button",
    "aria-label": props.i18n('closeModal'),
    title: props.i18n('closeModal'),
    onClick: props.closeModal
  }, h("span", {
    "aria-hidden": "true"
  }, "\xD7")) : null, h("div", {
    className: "uppy-Dashboard-innerWrap"
  }, h("div", {
    className: "uppy-Dashboard-dropFilesHereHint"
  }, props.i18n('dropHint')), showFileList && h(PanelTopBar, props), numberOfFilesForRecovery && h("div", {
    className: "uppy-Dashboard-serviceMsg"
  }, h("svg", {
    className: "uppy-Dashboard-serviceMsg-icon",
    "aria-hidden": "true",
    focusable: "false",
    width: "21",
    height: "16",
    viewBox: "0 0 24 19"
  }, h("g", {
    transform: "translate(0 -1)",
    fill: "none",
    fillRule: "evenodd"
  }, h("path", {
    d: "M12.857 1.43l10.234 17.056A1 1 0 0122.234 20H1.766a1 1 0 01-.857-1.514L11.143 1.429a1 1 0 011.714 0z",
    fill: "#FFD300"
  }), h("path", {
    fill: "#000",
    d: "M11 6h2l-.3 8h-1.4z"
  }), h("circle", {
    fill: "#000",
    cx: "12",
    cy: "17",
    r: "1"
  }))), h("strong", {
    className: "uppy-Dashboard-serviceMsg-title"
  }, props.i18n('sessionRestored')), h("div", {
    className: "uppy-Dashboard-serviceMsg-text"
  }, renderRestoredText())), showFileList ? h(FileList, _extends({}, props, {
    itemsPerRow: itemsPerRow
  })) : h(AddFiles, _extends({}, props, {
    isSizeMD: isSizeMD
  })), h(Slide, null, props.showAddFilesPanel ? h(AddFilesPanel, _extends({
    key: "AddFiles"
  }, props, {
    isSizeMD: isSizeMD
  })) : null), h(Slide, null, props.fileCardFor ? h(FileCard, _extends({
    key: "FileCard"
  }, props)) : null), h(Slide, null, props.activePickerPanel ? h(PickerPanelContent, _extends({
    key: "Picker"
  }, props)) : null), h(Slide, null, props.showFileEditor ? h(EditorPanel, _extends({
    key: "Editor"
  }, props)) : null), h("div", {
    className: "uppy-Dashboard-progressindicators"
  }, props.progressindicators.map(target => {
    return props.uppy.getPlugin(target.id).render(props.state);
  })))));
  return (// Wrap it for RTL language support
    h("div", {
      className: wrapperClassName,
      dir: props.direction
    }, dashboard)
  );
};

},{"./../../../utils/lib/isDragDropSupported":171,"./AddFiles":52,"./AddFilesPanel":53,"./EditorPanel":55,"./FileCard":56,"./FileList":63,"./PickerPanelContent":65,"./PickerPanelTopBar":66,"./Slide":67,"classnames":4,"preact":18}],55:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const classNames = require('classnames');

function EditorPanel(props) {
  const file = props.files[props.fileCardFor];
  return h("div", {
    className: classNames('uppy-DashboardContent-panel', props.className),
    role: "tabpanel",
    "data-uppy-panelType": "FileEditor",
    id: "uppy-DashboardContent-panel--editor"
  }, h("div", {
    className: "uppy-DashboardContent-bar"
  }, h("div", {
    className: "uppy-DashboardContent-title",
    role: "heading",
    "aria-level": "1"
  }, props.i18nArray('editing', {
    file: h("span", {
      className: "uppy-DashboardContent-titleFile"
    }, file.meta ? file.meta.name : file.name)
  })), h("button", {
    className: "uppy-DashboardContent-back",
    type: "button",
    onClick: props.hideAllPanels
  }, props.i18n('cancel')), h("button", {
    className: "uppy-DashboardContent-save",
    type: "button",
    onClick: props.saveFileEditor
  }, props.i18n('save'))), h("div", {
    className: "uppy-DashboardContent-panelBody"
  }, props.editors.map(target => {
    return props.uppy.getPlugin(target.id).render(props.state);
  })));
}

module.exports = EditorPanel;

},{"classnames":4,"preact":18}],56:[function(require,module,exports){
"use strict";

const {
  h,
  Component
} = require('preact');

const classNames = require('classnames');

const {
  nanoid
} = require('nanoid');

const getFileTypeIcon = require('../../utils/getFileTypeIcon');

const ignoreEvent = require('../../utils/ignoreEvent.js');

const FilePreview = require('../FilePreview');

class FileCard extends Component {
  constructor(props) {
    super(props);
    this.form = document.createElement('form');

    this.updateMeta = (newVal, name) => {
      this.setState(({
        formState
      }) => ({
        formState: { ...formState,
          [name]: newVal
        }
      }));
    };

    this.handleSave = e => {
      e.preventDefault();
      const fileID = this.props.fileCardFor;
      this.props.saveFileCard(this.state.formState, fileID);
    };

    this.handleCancel = () => {
      this.props.toggleFileCard(false);
    };

    this.saveOnEnter = ev => {
      if (ev.keyCode === 13) {
        ev.stopPropagation();
        ev.preventDefault();
        const file = this.props.files[this.props.fileCardFor];
        this.props.saveFileCard(this.state.formState, file.id);
      }
    };

    this.renderMetaFields = () => {
      const metaFields = this.getMetaFields() || [];
      const fieldCSSClasses = {
        text: 'uppy-u-reset uppy-c-textInput uppy-Dashboard-FileCard-input'
      };
      return metaFields.map(field => {
        const id = `uppy-Dashboard-FileCard-input-${field.id}`;
        const required = this.props.requiredMetaFields.includes(field.id);
        return h("fieldset", {
          key: field.id,
          className: "uppy-Dashboard-FileCard-fieldset"
        }, h("label", {
          className: "uppy-Dashboard-FileCard-label",
          htmlFor: id
        }, field.name), field.render !== undefined ? field.render({
          value: this.state.formState[field.id],
          onChange: newVal => this.updateMeta(newVal, field.id),
          fieldCSSClasses,
          required,
          form: this.form.id
        }, h) : h("input", {
          className: fieldCSSClasses.text,
          id: id,
          form: this.form.id,
          type: field.type || 'text',
          required: required,
          value: this.state.formState[field.id],
          placeholder: field.placeholder // If `form` attribute is not supported, we need to capture pressing Enter to avoid bubbling in case Uppy is
          // embedded inside a <form>.
          ,
          onKeyUp: 'form' in HTMLInputElement.prototype ? undefined : this.saveOnEnter,
          onKeyDown: 'form' in HTMLInputElement.prototype ? undefined : this.saveOnEnter,
          onKeyPress: 'form' in HTMLInputElement.prototype ? undefined : this.saveOnEnter,
          onInput: ev => this.updateMeta(ev.target.value, field.id),
          "data-uppy-super-focusable": true
        }));
      });
    };

    const _file = this.props.files[this.props.fileCardFor];

    const _metaFields = this.getMetaFields() || [];

    const storedMetaData = {};

    _metaFields.forEach(field => {
      storedMetaData[field.id] = _file.meta[field.id] || '';
    });

    this.state = {
      formState: storedMetaData
    };
    this.form.id = nanoid();
  } // TODO(aduh95): move this to `UNSAFE_componentWillMount` when updating to Preact X+.


  componentWillMount() {
    // eslint-disable-line react/no-deprecated
    this.form.addEventListener('submit', this.handleSave);
    document.body.appendChild(this.form);
  }

  componentWillUnmount() {
    this.form.removeEventListener('submit', this.handleSave);
    document.body.removeChild(this.form);
  }

  getMetaFields() {
    return typeof this.props.metaFields === 'function' ? this.props.metaFields(this.props.files[this.props.fileCardFor]) : this.props.metaFields;
  }

  render() {
    const file = this.props.files[this.props.fileCardFor];
    const showEditButton = this.props.canEditFile(file);
    return h("div", {
      className: classNames('uppy-Dashboard-FileCard', this.props.className),
      "data-uppy-panelType": "FileCard",
      onDragOver: ignoreEvent,
      onDragLeave: ignoreEvent,
      onDrop: ignoreEvent,
      onPaste: ignoreEvent
    }, h("div", {
      className: "uppy-DashboardContent-bar"
    }, h("div", {
      className: "uppy-DashboardContent-title",
      role: "heading",
      "aria-level": "1"
    }, this.props.i18nArray('editing', {
      file: h("span", {
        className: "uppy-DashboardContent-titleFile"
      }, file.meta ? file.meta.name : file.name)
    })), h("button", {
      className: "uppy-DashboardContent-back",
      type: "button",
      form: this.form.id,
      title: this.props.i18n('finishEditingFile'),
      onClick: this.handleCancel
    }, this.props.i18n('cancel'))), h("div", {
      className: "uppy-Dashboard-FileCard-inner"
    }, h("div", {
      className: "uppy-Dashboard-FileCard-preview",
      style: {
        backgroundColor: getFileTypeIcon(file.type).color
      }
    }, h(FilePreview, {
      file: file
    }), showEditButton && h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn uppy-Dashboard-FileCard-edit",
      onClick: () => this.props.openFileEditor(file),
      form: this.form.id
    }, this.props.i18n('editFile'))), h("div", {
      className: "uppy-Dashboard-FileCard-info"
    }, this.renderMetaFields()), h("div", {
      className: "uppy-Dashboard-FileCard-actions"
    }, h("button", {
      className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Dashboard-FileCard-actionsBtn" // If `form` attribute is supported, we want a submit button to trigger the form validation.
      // Otherwise, fallback to a classic button with a onClick event handler.
      ,
      type: 'form' in HTMLButtonElement.prototype ? 'submit' : 'button',
      onClick: 'form' in HTMLButtonElement.prototype ? undefined : this.handleSave,
      form: this.form.id
    }, this.props.i18n('saveChanges')), h("button", {
      className: "uppy-u-reset uppy-c-btn uppy-c-btn-link uppy-Dashboard-FileCard-actionsBtn",
      type: "button",
      onClick: this.handleCancel,
      form: this.form.id
    }, this.props.i18n('cancel')))));
  }

}

module.exports = FileCard;

},{"../../utils/getFileTypeIcon":74,"../../utils/ignoreEvent.js":75,"../FilePreview":64,"classnames":4,"nanoid":16,"preact":18}],57:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const copyToClipboard = require('../../../utils/copyToClipboard');

function EditButton({
  file,
  uploadInProgressOrComplete,
  metaFields,
  canEditFile,
  i18n,
  onClick
}) {
  if (!uploadInProgressOrComplete && metaFields && metaFields.length > 0 || !uploadInProgressOrComplete && canEditFile(file)) {
    return h("button", {
      className: "uppy-u-reset uppy-Dashboard-Item-action uppy-Dashboard-Item-action--edit",
      type: "button",
      "aria-label": i18n('editFileWithFilename', {
        file: file.meta.name
      }),
      title: i18n('editFileWithFilename', {
        file: file.meta.name
      }),
      onClick: () => onClick()
    }, h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      className: "uppy-c-icon",
      width: "14",
      height: "14",
      viewBox: "0 0 14 14"
    }, h("g", {
      fillRule: "evenodd"
    }, h("path", {
      d: "M1.5 10.793h2.793A1 1 0 0 0 5 10.5L11.5 4a1 1 0 0 0 0-1.414L9.707.793a1 1 0 0 0-1.414 0l-6.5 6.5A1 1 0 0 0 1.5 8v2.793zm1-1V8L9 1.5l1.793 1.793-6.5 6.5H2.5z",
      fillRule: "nonzero"
    }), h("rect", {
      x: "1",
      y: "12.293",
      width: "11",
      height: "1",
      rx: ".5"
    }), h("path", {
      fillRule: "nonzero",
      d: "M6.793 2.5L9.5 5.207l.707-.707L7.5 1.793z"
    }))));
  }

  return null;
}

function RemoveButton({
  i18n,
  onClick,
  file
}) {
  return h("button", {
    className: "uppy-u-reset uppy-Dashboard-Item-action uppy-Dashboard-Item-action--remove",
    type: "button",
    "aria-label": i18n('removeFile', {
      file: file.meta.name
    }),
    title: i18n('removeFile', {
      file: file.meta.name
    }),
    onClick: () => onClick()
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "18",
    height: "18",
    viewBox: "0 0 18 18"
  }, h("path", {
    d: "M9 0C4.034 0 0 4.034 0 9s4.034 9 9 9 9-4.034 9-9-4.034-9-9-9z"
  }), h("path", {
    fill: "#FFF",
    d: "M13 12.222l-.778.778L9 9.778 5.778 13 5 12.222 8.222 9 5 5.778 5.778 5 9 8.222 12.222 5l.778.778L9.778 9z"
  })));
}

const copyLinkToClipboard = (event, props) => {
  copyToClipboard(props.file.uploadURL, props.i18n('copyLinkToClipboardFallback')).then(() => {
    props.uppy.log('Link copied to clipboard.');
    props.uppy.info(props.i18n('copyLinkToClipboardSuccess'), 'info', 3000);
  }).catch(props.uppy.log) // avoid losing focus
  .then(() => event.target.focus({
    preventScroll: true
  }));
};

function CopyLinkButton(props) {
  const {
    i18n
  } = props;
  return h("button", {
    className: "uppy-u-reset uppy-Dashboard-Item-action uppy-Dashboard-Item-action--copyLink",
    type: "button",
    "aria-label": i18n('copyLink'),
    title: i18n('copyLink'),
    onClick: event => copyLinkToClipboard(event, props)
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "14",
    height: "14",
    viewBox: "0 0 14 12"
  }, h("path", {
    d: "M7.94 7.703a2.613 2.613 0 0 1-.626 2.681l-.852.851a2.597 2.597 0 0 1-1.849.766A2.616 2.616 0 0 1 2.764 7.54l.852-.852a2.596 2.596 0 0 1 2.69-.625L5.267 7.099a1.44 1.44 0 0 0-.833.407l-.852.851a1.458 1.458 0 0 0 1.03 2.486c.39 0 .755-.152 1.03-.426l.852-.852c.231-.231.363-.522.406-.824l1.04-1.038zm4.295-5.937A2.596 2.596 0 0 0 10.387 1c-.698 0-1.355.272-1.849.766l-.852.851a2.614 2.614 0 0 0-.624 2.688l1.036-1.036c.041-.304.173-.6.407-.833l.852-.852c.275-.275.64-.426 1.03-.426a1.458 1.458 0 0 1 1.03 2.486l-.852.851a1.442 1.442 0 0 1-.824.406l-1.04 1.04a2.596 2.596 0 0 0 2.683-.628l.851-.85a2.616 2.616 0 0 0 0-3.697zm-6.88 6.883a.577.577 0 0 0 .82 0l3.474-3.474a.579.579 0 1 0-.819-.82L5.355 7.83a.579.579 0 0 0 0 .819z"
  })));
}

module.exports = function Buttons(props) {
  const {
    uppy,
    file,
    uploadInProgressOrComplete,
    canEditFile,
    metaFields,
    showLinkToFileUploadResult,
    showRemoveButton,
    i18n,
    toggleFileCard,
    openFileEditor
  } = props;

  const editAction = () => {
    if (metaFields && metaFields.length > 0) {
      toggleFileCard(true, file.id);
    } else {
      openFileEditor(file);
    }
  };

  return h("div", {
    className: "uppy-Dashboard-Item-actionWrapper"
  }, h(EditButton, {
    i18n: i18n,
    file: file,
    uploadInProgressOrComplete: uploadInProgressOrComplete,
    canEditFile: canEditFile,
    metaFields: metaFields,
    onClick: editAction
  }), showLinkToFileUploadResult && file.uploadURL ? h(CopyLinkButton, {
    file: file,
    uppy: uppy,
    i18n: i18n
  }) : null, showRemoveButton ? h(RemoveButton, {
    i18n: i18n,
    file: file,
    uppy: uppy,
    onClick: () => props.uppy.removeFile(file.id, 'removed-by-user')
  }) : null);
};

},{"../../../utils/copyToClipboard":71,"preact":18}],58:[function(require,module,exports){
"use strict";

const {
  h,
  Fragment
} = require('preact');

const prettierBytes = require('@transloadit/prettier-bytes');

const MetaErrorMessage = require('../MetaErrorMessage');

const truncateString = require('./../../../../../utils/lib/truncateString');

const renderFileName = props => {
  const {
    author,
    name
  } = props.file.meta;

  function getMaxNameLength() {
    if (props.containerWidth <= 352) {
      return 35;
    }

    if (props.containerWidth <= 576) {
      return 60;
    } // When `author` is present, we want to make sure
    // the file name fits on one line so we can place
    // the author on the second line.


    return author ? 20 : 30;
  }

  return h("div", {
    className: "uppy-Dashboard-Item-name",
    title: name
  }, truncateString(name, getMaxNameLength()));
};

const renderAuthor = props => {
  const {
    author
  } = props.file.meta;
  const {
    providerName
  } = props.file.remote;
  const dot = `\u00B7`;

  if (!author) {
    return null;
  }

  return h("div", {
    className: "uppy-Dashboard-Item-author"
  }, h("a", {
    href: `${author.url}?utm_source=Companion&utm_medium=referral`,
    target: "_blank",
    rel: "noopener noreferrer"
  }, truncateString(author.name, 13)), providerName ? h(Fragment, null, ` ${dot} `, providerName) : null);
};

const renderFileSize = props => props.file.size && h("div", {
  className: "uppy-Dashboard-Item-statusSize"
}, prettierBytes(props.file.size));

const ReSelectButton = props => props.file.isGhost && h("span", null, ' \u2022 ', h("button", {
  className: "uppy-u-reset uppy-c-btn uppy-Dashboard-Item-reSelect",
  type: "button",
  onClick: props.toggleAddFilesPanel
}, props.i18n('reSelect')));

const ErrorButton = ({
  file,
  onClick
}) => {
  if (file.error) {
    return h("button", {
      className: "uppy-u-reset uppy-Dashboard-Item-errorDetails",
      "aria-label": file.error,
      "data-microtip-position": "bottom",
      "data-microtip-size": "medium",
      onClick: onClick,
      type: "button"
    }, "?");
  }

  return null;
};

module.exports = function FileInfo(props) {
  const {
    file
  } = props;
  return h("div", {
    className: "uppy-Dashboard-Item-fileInfo",
    "data-uppy-file-source": file.source
  }, h("div", {
    className: "uppy-Dashboard-Item-fileName"
  }, renderFileName(props), h(ErrorButton, {
    file: props.file // eslint-disable-next-line no-alert
    ,
    onClick: () => alert(props.file.error) // TODO: move to a custom alert implementation

  })), h("div", {
    className: "uppy-Dashboard-Item-status"
  }, renderAuthor(props), renderFileSize(props), ReSelectButton(props)), h(MetaErrorMessage, {
    file: props.file,
    i18n: props.i18n,
    toggleFileCard: props.toggleFileCard,
    metaFields: props.metaFields
  }));
};

},{"../MetaErrorMessage":61,"./../../../../../utils/lib/truncateString":181,"@transloadit/prettier-bytes":1,"preact":18}],59:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const FilePreview = require('../../FilePreview');

const MetaErrorMessage = require('../MetaErrorMessage');

const getFileTypeIcon = require('../../../utils/getFileTypeIcon');

module.exports = function FilePreviewAndLink(props) {
  return h("div", {
    className: "uppy-Dashboard-Item-previewInnerWrap",
    style: {
      backgroundColor: getFileTypeIcon(props.file.type).color
    }
  }, props.showLinkToFileUploadResult && props.file.uploadURL && h("a", {
    className: "uppy-Dashboard-Item-previewLink",
    href: props.file.uploadURL,
    rel: "noreferrer noopener",
    target: "_blank",
    "aria-label": props.file.meta.name
  }, h("span", {
    hidden: true
  }, props.file.meta.name)), h(FilePreview, {
    file: props.file
  }), h(MetaErrorMessage, {
    file: props.file,
    i18n: props.i18n,
    toggleFileCard: props.toggleFileCard,
    metaFields: props.metaFields
  }));
};

},{"../../../utils/getFileTypeIcon":74,"../../FilePreview":64,"../MetaErrorMessage":61,"preact":18}],60:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

function onPauseResumeCancelRetry(props) {
  if (props.isUploaded) return;

  if (props.error && !props.hideRetryButton) {
    props.uppy.retryUpload(props.file.id);
    return;
  }

  if (props.resumableUploads && !props.hidePauseResumeButton) {
    props.uppy.pauseResume(props.file.id);
  } else if (props.individualCancellation && !props.hideCancelButton) {
    props.uppy.removeFile(props.file.id);
  }
}

function progressIndicatorTitle(props) {
  if (props.isUploaded) {
    return props.i18n('uploadComplete');
  }

  if (props.error) {
    return props.i18n('retryUpload');
  }

  if (props.resumableUploads) {
    if (props.file.isPaused) {
      return props.i18n('resumeUpload');
    }

    return props.i18n('pauseUpload');
  }

  if (props.individualCancellation) {
    return props.i18n('cancelUpload');
  }

  return '';
}

function ProgressIndicatorButton(props) {
  return h("div", {
    className: "uppy-Dashboard-Item-progress"
  }, h("button", {
    className: "uppy-u-reset uppy-Dashboard-Item-progressIndicator",
    type: "button",
    "aria-label": progressIndicatorTitle(props),
    title: progressIndicatorTitle(props),
    onClick: () => onPauseResumeCancelRetry(props)
  }, props.children));
}

function ProgressCircleContainer({
  children
}) {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    width: "70",
    height: "70",
    viewBox: "0 0 36 36",
    className: "uppy-c-icon uppy-Dashboard-Item-progressIcon--circle"
  }, children);
}

function ProgressCircle({
  progress
}) {
  // circle length equals 2 * PI * R
  const circleLength = 2 * Math.PI * 15;
  return h("g", null, h("circle", {
    className: "uppy-Dashboard-Item-progressIcon--bg",
    r: "15",
    cx: "18",
    cy: "18",
    "stroke-width": "2",
    fill: "none"
  }), h("circle", {
    className: "uppy-Dashboard-Item-progressIcon--progress",
    r: "15",
    cx: "18",
    cy: "18",
    transform: "rotate(-90, 18, 18)",
    fill: "none",
    "stroke-width": "2",
    "stroke-dasharray": circleLength,
    "stroke-dashoffset": circleLength - circleLength / 100 * progress
  }));
}

module.exports = function FileProgress(props) {
  // Nothing if upload has not started
  if (!props.file.progress.uploadStarted) {
    return null;
  } // Green checkmark when complete


  if (props.isUploaded) {
    return h("div", {
      className: "uppy-Dashboard-Item-progress"
    }, h("div", {
      className: "uppy-Dashboard-Item-progressIndicator"
    }, h(ProgressCircleContainer, null, h("circle", {
      r: "15",
      cx: "18",
      cy: "18",
      fill: "#1bb240"
    }), h("polygon", {
      className: "uppy-Dashboard-Item-progressIcon--check",
      transform: "translate(2, 3)",
      points: "14 22.5 7 15.2457065 8.99985857 13.1732815 14 18.3547104 22.9729883 9 25 11.1005634"
    }))));
  }

  if (props.recoveredState) {
    return;
  } // Retry button for error


  if (props.error && !props.hideRetryButton) {
    return h(ProgressIndicatorButton, props, h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      className: "uppy-c-icon uppy-Dashboard-Item-progressIcon--retry",
      width: "28",
      height: "31",
      viewBox: "0 0 16 19"
    }, h("path", {
      d: "M16 11a8 8 0 1 1-8-8v2a6 6 0 1 0 6 6h2z"
    }), h("path", {
      d: "M7.9 3H10v2H7.9z"
    }), h("path", {
      d: "M8.536.5l3.535 3.536-1.414 1.414L7.12 1.914z"
    }), h("path", {
      d: "M10.657 2.621l1.414 1.415L8.536 7.57 7.12 6.157z"
    })));
  } // Pause/resume button for resumable uploads


  if (props.resumableUploads && !props.hidePauseResumeButton) {
    return h(ProgressIndicatorButton, props, h(ProgressCircleContainer, null, h(ProgressCircle, {
      progress: props.file.progress.percentage
    }), props.file.isPaused ? h("polygon", {
      className: "uppy-Dashboard-Item-progressIcon--play",
      transform: "translate(3, 3)",
      points: "12 20 12 10 20 15"
    }) : h("g", {
      className: "uppy-Dashboard-Item-progressIcon--pause",
      transform: "translate(14.5, 13)"
    }, h("rect", {
      x: "0",
      y: "0",
      width: "2",
      height: "10",
      rx: "0"
    }), h("rect", {
      x: "5",
      y: "0",
      width: "2",
      height: "10",
      rx: "0"
    }))));
  } // Cancel button for non-resumable uploads if individualCancellation is supported (not bundled)


  if (!props.resumableUploads && props.individualCancellation && !props.hideCancelButton) {
    return h(ProgressIndicatorButton, props, h(ProgressCircleContainer, null, h(ProgressCircle, {
      progress: props.file.progress.percentage
    }), h("polygon", {
      className: "cancel",
      transform: "translate(2, 2)",
      points: "19.8856516 11.0625 16 14.9481516 12.1019737 11.0625 11.0625 12.1143484 14.9481516 16 11.0625 19.8980263 12.1019737 20.9375 16 17.0518484 19.8856516 20.9375 20.9375 19.8980263 17.0518484 16 20.9375 12"
    })));
  } // Just progress when buttons are disabled


  return h("div", {
    className: "uppy-Dashboard-Item-progress"
  }, h("div", {
    className: "uppy-Dashboard-Item-progressIndicator"
  }, h(ProgressCircleContainer, null, h(ProgressCircle, {
    progress: props.file.progress.percentage
  }))));
};

},{"preact":18}],61:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const metaFieldIdToName = (metaFieldId, metaFields) => {
  const field = metaFields.filter(f => f.id === metaFieldId);
  return field[0].name;
};

module.exports = function renderMissingMetaFieldsError(props) {
  const {
    file,
    toggleFileCard,
    i18n,
    metaFields
  } = props;
  const {
    missingRequiredMetaFields
  } = file;

  if (!(missingRequiredMetaFields != null && missingRequiredMetaFields.length)) {
    return null;
  }

  const metaFieldsString = missingRequiredMetaFields.map(missingMetaField => metaFieldIdToName(missingMetaField, metaFields)).join(', ');
  return h("div", {
    className: "uppy-Dashboard-Item-errorMessage"
  }, i18n('missingRequiredMetaFields', {
    smart_count: missingRequiredMetaFields.length,
    fields: metaFieldsString
  }), ' ', h("button", {
    type: "button",
    class: "uppy-u-reset uppy-Dashboard-Item-errorMessageBtn",
    onClick: () => toggleFileCard(true, file.id)
  }, i18n('editFile')));
};

},{"preact":18}],62:[function(require,module,exports){
"use strict";

const {
  h,
  Component
} = require('preact');

const classNames = require('classnames');

const shallowEqual = require('is-shallow-equal');

const FilePreviewAndLink = require('./FilePreviewAndLink');

const FileProgress = require('./FileProgress');

const FileInfo = require('./FileInfo');

const Buttons = require('./Buttons');

module.exports = class FileItem extends Component {
  componentDidMount() {
    const {
      file
    } = this.props;

    if (!file.preview) {
      this.props.handleRequestThumbnail(file);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !shallowEqual(this.props, nextProps);
  } // VirtualList mounts FileItems again and they emit `thumbnail:request`
  // Otherwise thumbnails are broken or missing after Golden Retriever restores files


  componentDidUpdate() {
    const {
      file
    } = this.props;

    if (!file.preview) {
      this.props.handleRequestThumbnail(file);
    }
  }

  componentWillUnmount() {
    const {
      file
    } = this.props;

    if (!file.preview) {
      this.props.handleCancelThumbnail(file);
    }
  }

  render() {
    const {
      file
    } = this.props;
    const isProcessing = file.progress.preprocess || file.progress.postprocess;
    const isUploaded = file.progress.uploadComplete && !isProcessing && !file.error;
    const uploadInProgressOrComplete = file.progress.uploadStarted || isProcessing;
    const uploadInProgress = file.progress.uploadStarted && !file.progress.uploadComplete || isProcessing;
    const error = file.error || false; // File that Golden Retriever was able to partly restore (only meta, not blob),
    // users still need to re-add it, so it’s a ghost

    const {
      isGhost
    } = file;
    let showRemoveButton = this.props.individualCancellation ? !isUploaded : !uploadInProgress && !isUploaded;

    if (isUploaded && this.props.showRemoveButtonAfterComplete) {
      showRemoveButton = true;
    }

    const dashboardItemClass = classNames({
      'uppy-Dashboard-Item': true,
      'is-inprogress': uploadInProgress && !this.props.recoveredState,
      'is-processing': isProcessing,
      'is-complete': isUploaded,
      'is-error': !!error,
      'is-resumable': this.props.resumableUploads,
      'is-noIndividualCancellation': !this.props.individualCancellation,
      'is-ghost': isGhost
    });
    return h("div", {
      className: dashboardItemClass,
      id: `uppy_${file.id}`,
      role: this.props.role
    }, h("div", {
      className: "uppy-Dashboard-Item-preview"
    }, h(FilePreviewAndLink, {
      file: file,
      showLinkToFileUploadResult: this.props.showLinkToFileUploadResult,
      i18n: this.props.i18n,
      toggleFileCard: this.props.toggleFileCard,
      metaFields: this.props.metaFields
    }), h(FileProgress, {
      uppy: this.props.uppy,
      file: file,
      error: error,
      isUploaded: isUploaded,
      hideRetryButton: this.props.hideRetryButton,
      hideCancelButton: this.props.hideCancelButton,
      hidePauseResumeButton: this.props.hidePauseResumeButton,
      recoveredState: this.props.recoveredState,
      showRemoveButtonAfterComplete: this.props.showRemoveButtonAfterComplete,
      resumableUploads: this.props.resumableUploads,
      individualCancellation: this.props.individualCancellation,
      i18n: this.props.i18n
    })), h("div", {
      className: "uppy-Dashboard-Item-fileInfoAndButtons"
    }, h(FileInfo, {
      file: file,
      id: this.props.id,
      acquirers: this.props.acquirers,
      containerWidth: this.props.containerWidth,
      i18n: this.props.i18n,
      toggleAddFilesPanel: this.props.toggleAddFilesPanel,
      toggleFileCard: this.props.toggleFileCard,
      metaFields: this.props.metaFields
    }), h(Buttons, {
      file: file,
      metaFields: this.props.metaFields,
      showLinkToFileUploadResult: this.props.showLinkToFileUploadResult,
      showRemoveButton: showRemoveButton,
      canEditFile: this.props.canEditFile,
      uploadInProgressOrComplete: uploadInProgressOrComplete,
      toggleFileCard: this.props.toggleFileCard,
      openFileEditor: this.props.openFileEditor,
      uppy: this.props.uppy,
      i18n: this.props.i18n
    })));
  }

};

},{"./Buttons":57,"./FileInfo":58,"./FilePreviewAndLink":59,"./FileProgress":60,"classnames":4,"is-shallow-equal":8,"preact":18}],63:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const classNames = require('classnames');

const {
  h
} = require('preact');

const FileItem = require('./FileItem/index.js');

const VirtualList = require('./VirtualList');

function chunks(list, size) {
  const chunked = [];
  let currentChunk = [];
  list.forEach(item => {
    if (currentChunk.length < size) {
      currentChunk.push(item);
    } else {
      chunked.push(currentChunk);
      currentChunk = [item];
    }
  });
  if (currentChunk.length) chunked.push(currentChunk);
  return chunked;
}

module.exports = props => {
  const noFiles = props.totalFileCount === 0;
  const dashboardFilesClass = classNames('uppy-Dashboard-files', {
    'uppy-Dashboard-files--noFiles': noFiles
  }); // It's not great that this is hardcoded!
  // It's ESPECIALLY not great that this is checking against `itemsPerRow`!

  const rowHeight = props.itemsPerRow === 1 // Mobile
  ? 71 // 190px height + 2 * 5px margin
  : 200;
  const fileProps = {
    // FIXME This is confusing, it's actually the Dashboard's plugin ID
    id: props.id,
    error: props.error,
    // TODO move this to context
    i18n: props.i18n,
    uppy: props.uppy,
    // features
    acquirers: props.acquirers,
    resumableUploads: props.resumableUploads,
    individualCancellation: props.individualCancellation,
    // visual options
    hideRetryButton: props.hideRetryButton,
    hidePauseResumeButton: props.hidePauseResumeButton,
    hideCancelButton: props.hideCancelButton,
    showLinkToFileUploadResult: props.showLinkToFileUploadResult,
    showRemoveButtonAfterComplete: props.showRemoveButtonAfterComplete,
    isWide: props.isWide,
    metaFields: props.metaFields,
    recoveredState: props.recoveredState,
    // callbacks
    toggleFileCard: props.toggleFileCard,
    handleRequestThumbnail: props.handleRequestThumbnail,
    handleCancelThumbnail: props.handleCancelThumbnail
  };

  const sortByGhostComesFirst = (file1, file2) => {
    return props.files[file2].isGhost - props.files[file1].isGhost;
  }; // Sort files by file.isGhost, ghost files first, only if recoveredState is present


  const files = Object.keys(props.files);
  if (props.recoveredState) files.sort(sortByGhostComesFirst);
  const rows = chunks(files, props.itemsPerRow);

  const renderRow = row => // The `role="presentation` attribute ensures that the list items are properly
  // associated with the `VirtualList` element.
  // We use the first file ID as the key—this should not change across scroll rerenders
  h("div", {
    role: "presentation",
    key: row[0]
  }, row.map(fileID => h(FileItem, _extends({
    key: fileID,
    uppy: props.uppy
  }, fileProps, {
    role: "listitem",
    openFileEditor: props.openFileEditor,
    canEditFile: props.canEditFile,
    toggleAddFilesPanel: props.toggleAddFilesPanel,
    file: props.files[fileID]
  }))));

  return h(VirtualList, {
    class: dashboardFilesClass,
    role: "list",
    data: rows,
    renderRow: renderRow,
    rowHeight: rowHeight
  });
};

},{"./FileItem/index.js":62,"./VirtualList":68,"classnames":4,"preact":18}],64:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const getFileTypeIcon = require('../utils/getFileTypeIcon');

module.exports = function FilePreview(props) {
  const {
    file
  } = props;

  if (file.preview) {
    return h("img", {
      className: "uppy-Dashboard-Item-previewImg",
      alt: file.name,
      src: file.preview
    });
  }

  const {
    color,
    icon
  } = getFileTypeIcon(file.type);
  return h("div", {
    className: "uppy-Dashboard-Item-previewIconWrap"
  }, h("span", {
    className: "uppy-Dashboard-Item-previewIcon",
    style: {
      color
    }
  }, icon), h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-Dashboard-Item-previewIconBg",
    width: "58",
    height: "76",
    viewBox: "0 0 58 76"
  }, h("rect", {
    fill: "#FFF",
    width: "58",
    height: "76",
    rx: "3",
    fillRule: "evenodd"
  })));
};

},{"../utils/getFileTypeIcon":74,"preact":18}],65:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const classNames = require('classnames');

const ignoreEvent = require('../utils/ignoreEvent.js');

function PickerPanelContent(props) {
  return h("div", {
    className: classNames('uppy-DashboardContent-panel', props.className),
    role: "tabpanel",
    "data-uppy-panelType": "PickerPanel",
    id: `uppy-DashboardContent-panel--${props.activePickerPanel.id}`,
    onDragOver: ignoreEvent,
    onDragLeave: ignoreEvent,
    onDrop: ignoreEvent,
    onPaste: ignoreEvent
  }, h("div", {
    className: "uppy-DashboardContent-bar"
  }, h("div", {
    className: "uppy-DashboardContent-title",
    role: "heading",
    "aria-level": "1"
  }, props.i18n('importFrom', {
    name: props.activePickerPanel.name
  })), h("button", {
    className: "uppy-DashboardContent-back",
    type: "button",
    onClick: props.hideAllPanels
  }, props.i18n('cancel'))), h("div", {
    className: "uppy-DashboardContent-panelBody"
  }, props.uppy.getPlugin(props.activePickerPanel.id).render(props.state)));
}

module.exports = PickerPanelContent;

},{"../utils/ignoreEvent.js":75,"classnames":4,"preact":18}],66:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const uploadStates = {
  STATE_ERROR: 'error',
  STATE_WAITING: 'waiting',
  STATE_PREPROCESSING: 'preprocessing',
  STATE_UPLOADING: 'uploading',
  STATE_POSTPROCESSING: 'postprocessing',
  STATE_COMPLETE: 'complete',
  STATE_PAUSED: 'paused'
};

function getUploadingState(isAllErrored, isAllComplete, isAllPaused, files = {}) {
  if (isAllErrored) {
    return uploadStates.STATE_ERROR;
  }

  if (isAllComplete) {
    return uploadStates.STATE_COMPLETE;
  }

  if (isAllPaused) {
    return uploadStates.STATE_PAUSED;
  }

  let state = uploadStates.STATE_WAITING;
  const fileIDs = Object.keys(files);

  for (let i = 0; i < fileIDs.length; i++) {
    const {
      progress
    } = files[fileIDs[i]]; // If ANY files are being uploaded right now, show the uploading state.

    if (progress.uploadStarted && !progress.uploadComplete) {
      return uploadStates.STATE_UPLOADING;
    } // If files are being preprocessed AND postprocessed at this time, we show the
    // preprocess state. If any files are being uploaded we show uploading.


    if (progress.preprocess && state !== uploadStates.STATE_UPLOADING) {
      state = uploadStates.STATE_PREPROCESSING;
    } // If NO files are being preprocessed or uploaded right now, but some files are
    // being postprocessed, show the postprocess state.


    if (progress.postprocess && state !== uploadStates.STATE_UPLOADING && state !== uploadStates.STATE_PREPROCESSING) {
      state = uploadStates.STATE_POSTPROCESSING;
    }
  }

  return state;
}

function UploadStatus(props) {
  const uploadingState = getUploadingState(props.isAllErrored, props.isAllComplete, props.isAllPaused, props.files);

  switch (uploadingState) {
    case 'uploading':
      return props.i18n('uploadingXFiles', {
        smart_count: props.inProgressNotPausedFiles.length
      });

    case 'preprocessing':
    case 'postprocessing':
      return props.i18n('processingXFiles', {
        smart_count: props.processingFiles.length
      });

    case 'paused':
      return props.i18n('uploadPaused');

    case 'waiting':
      return props.i18n('xFilesSelected', {
        smart_count: props.newFiles.length
      });

    case 'complete':
      return props.i18n('uploadComplete');
  }
}

function PanelTopBar(props) {
  let {
    allowNewUpload
  } = props; // TODO maybe this should be done in ../index.js, then just pass that down as `allowNewUpload`

  if (allowNewUpload && props.maxNumberOfFiles) {
    allowNewUpload = props.totalFileCount < props.maxNumberOfFiles;
  }

  return h("div", {
    className: "uppy-DashboardContent-bar"
  }, !props.isAllComplete && !props.hideCancelButton ? h("button", {
    className: "uppy-DashboardContent-back",
    type: "button",
    onClick: () => props.uppy.cancelAll()
  }, props.i18n('cancel')) : h("div", null), h("div", {
    className: "uppy-DashboardContent-title",
    role: "heading",
    "aria-level": "1"
  }, h(UploadStatus, props)), allowNewUpload ? h("button", {
    className: "uppy-DashboardContent-addMore",
    type: "button",
    "aria-label": props.i18n('addMoreFiles'),
    title: props.i18n('addMoreFiles'),
    onClick: () => props.toggleAddFilesPanel(true)
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "15",
    height: "15",
    viewBox: "0 0 15 15"
  }, h("path", {
    d: "M8 6.5h6a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H8v6a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V8h-6a.5.5 0 0 1-.5-.5V7a.5.5 0 0 1 .5-.5h6v-6A.5.5 0 0 1 7 0h.5a.5.5 0 0 1 .5.5v6z"
  })), h("span", {
    className: "uppy-DashboardContent-addMoreCaption"
  }, props.i18n('addMore'))) : h("div", null));
}

module.exports = PanelTopBar;

},{"preact":18}],67:[function(require,module,exports){
"use strict";

const {
  cloneElement,
  Component,
  toChildArray
} = require('preact');

const classNames = require('classnames');

const transitionName = 'uppy-transition-slideDownUp';
const duration = 250;
/**
 * Vertical slide transition.
 *
 * This can take a _single_ child component, which _must_ accept a `className` prop.
 *
 * Currently this is specific to the `uppy-transition-slideDownUp` transition,
 * but it should be simple to extend this for any type of single-element
 * transition by setting the CSS name and duration as props.
 */

class Slide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cachedChildren: null,
      className: ''
    };
  } // TODO: refactor to stable lifecycle method
  // eslint-disable-next-line


  componentWillUpdate(nextProps) {
    const {
      cachedChildren
    } = this.state;
    const child = toChildArray(nextProps.children)[0];
    if (cachedChildren === child) return null;
    const patch = {
      cachedChildren: child
    }; // Enter transition

    if (child && !cachedChildren) {
      patch.className = `${transitionName}-enter`;
      cancelAnimationFrame(this.animationFrame);
      clearTimeout(this.leaveTimeout);
      this.leaveTimeout = undefined;
      this.animationFrame = requestAnimationFrame(() => {
        // Force it to render before we add the active class
        // this.base.getBoundingClientRect()
        this.setState({
          className: `${transitionName}-enter ${transitionName}-enter-active`
        });
        this.enterTimeout = setTimeout(() => {
          this.setState({
            className: ''
          });
        }, duration);
      });
    } // Leave transition


    if (cachedChildren && !child && this.leaveTimeout === undefined) {
      patch.cachedChildren = cachedChildren;
      patch.className = `${transitionName}-leave`;
      cancelAnimationFrame(this.animationFrame);
      clearTimeout(this.enterTimeout);
      this.enterTimeout = undefined;
      this.animationFrame = requestAnimationFrame(() => {
        this.setState({
          className: `${transitionName}-leave ${transitionName}-leave-active`
        });
        this.leaveTimeout = setTimeout(() => {
          this.setState({
            cachedChildren: null,
            className: ''
          });
        }, duration);
      });
    } // eslint-disable-next-line


    this.setState(patch);
  }

  render() {
    const {
      cachedChildren,
      className
    } = this.state;

    if (!cachedChildren) {
      return null;
    }

    return cloneElement(cachedChildren, {
      className: classNames(className, cachedChildren.props.className)
    });
  }

}

module.exports = Slide;

},{"classnames":4,"preact":18}],68:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/**
 * Adapted from preact-virtual-list: https://github.com/developit/preact-virtual-list
 *
 * © 2016 Jason Miller
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Adaptations:
 * - Added role=presentation to helper elements
 * - Tweaked styles for Uppy's Dashboard use case
 */
const {
  h,
  Component
} = require('preact');

const STYLE_INNER = {
  position: 'relative',
  // Disabled for our use case: the wrapper elements around FileList already deal with overflow,
  // and this additional property would hide things that we want to show.
  //
  // overflow: 'hidden',
  width: '100%',
  minHeight: '100%'
};
const STYLE_CONTENT = {
  position: 'absolute',
  top: 0,
  left: 0,
  // Because the `top` value gets set to some offset, this `height` being 100% would make the scrollbar
  // stretch far beyond the content. For our use case, the content div actually can get its height from
  // the elements inside it, so we don't need to specify a `height` property at all.
  //
  // height: '100%',
  width: '100%',
  overflow: 'visible'
};

class VirtualList extends Component {
  constructor(props) {
    super(props); // The currently focused node, used to retain focus when the visible rows change.
    // To avoid update loops, this should not cause state updates, so it's kept as a plain property.

    this.handleScroll = () => {
      this.setState({
        offset: this.base.scrollTop
      });
    };

    this.handleResize = () => {
      this.resize();
    };

    this.focusElement = null;
    this.state = {
      offset: 0,
      height: 0
    };
  }

  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.handleResize);
  } // TODO: refactor to stable lifecycle method
  // eslint-disable-next-line


  componentWillUpdate() {
    if (this.base.contains(document.activeElement)) {
      this.focusElement = document.activeElement;
    }
  }

  componentDidUpdate() {
    // Maintain focus when rows are added and removed.
    if (this.focusElement && this.focusElement.parentNode && document.activeElement !== this.focusElement) {
      this.focusElement.focus();
    }

    this.focusElement = null;
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  resize() {
    const {
      height
    } = this.state;

    if (height !== this.base.offsetHeight) {
      this.setState({
        height: this.base.offsetHeight
      });
    }
  }

  render({
    data,
    rowHeight,
    renderRow,
    overscanCount = 10,
    ...props
  }) {
    const {
      offset,
      height
    } = this.state; // first visible row index

    let start = Math.floor(offset / rowHeight); // actual number of visible rows (without overscan)

    let visibleRowCount = Math.floor(height / rowHeight); // Overscan: render blocks of rows modulo an overscan row count
    // This dramatically reduces DOM writes during scrolling

    if (overscanCount) {
      start = Math.max(0, start - start % overscanCount);
      visibleRowCount += overscanCount;
    } // last visible + overscan row index + padding to allow keyboard focus to travel past the visible area


    const end = start + visibleRowCount + 4; // data slice currently in viewport plus overscan items

    const selection = data.slice(start, end);
    const styleInner = { ...STYLE_INNER,
      height: data.length * rowHeight
    };
    const styleContent = { ...STYLE_CONTENT,
      top: start * rowHeight
    }; // The `role="presentation"` attributes ensure that these wrapper elements are not treated as list
    // items by accessibility and outline tools.

    return h("div", _extends({
      onScroll: this.handleScroll
    }, props), h("div", {
      role: "presentation",
      style: styleInner
    }, h("div", {
      role: "presentation",
      style: styleContent
    }, selection.map(renderRow))));
  }

}

module.exports = VirtualList;

},{"preact":18}],69:[function(require,module,exports){
"use strict";

var _class, _openFileEditorWhenFilesAdded, _attachRenderFunctionToTarget, _isTargetSupported, _getAcquirers, _getProgressIndicators, _getEditors, _temp;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  h
} = require('preact');

const {
  UIPlugin
} = require('./../../core');

const StatusBar = require('./../../status-bar');

const Informer = require('./../../informer');

const ThumbnailGenerator = require('./../../thumbnail-generator');

const findAllDOMElements = require('./../../utils/lib/findAllDOMElements');

const toArray = require('./../../utils/lib/toArray');

const getDroppedFiles = require('./../../utils/lib/getDroppedFiles');

const getTextDirection = require('./../../utils/lib/getTextDirection');

const {
  nanoid
} = require('nanoid');

const trapFocus = require('./utils/trapFocus');

const createSuperFocus = require('./utils/createSuperFocus');

const memoize = require('memoize-one').default || require('memoize-one');

const FOCUSABLE_ELEMENTS = require('./../../utils/lib/FOCUSABLE_ELEMENTS');

const DashboardUI = require('./components/Dashboard');

const locale = require('./locale');

const TAB_KEY = 9;
const ESC_KEY = 27;

function createPromise() {
  const o = {};
  o.promise = new Promise((resolve, reject) => {
    o.resolve = resolve;
    o.reject = reject;
  });
  return o;
}

function defaultPickerIcon() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    width: "30",
    height: "30",
    viewBox: "0 0 30 30"
  }, h("path", {
    d: "M15 30c8.284 0 15-6.716 15-15 0-8.284-6.716-15-15-15C6.716 0 0 6.716 0 15c0 8.284 6.716 15 15 15zm4.258-12.676v6.846h-8.426v-6.846H5.204l9.82-12.364 9.82 12.364H19.26z"
  }));
}
/**
 * Dashboard UI with previews, metadata editing, tabs for various services and more
 */


module.exports = (_temp = (_openFileEditorWhenFilesAdded = /*#__PURE__*/_classPrivateFieldLooseKey("openFileEditorWhenFilesAdded"), _attachRenderFunctionToTarget = /*#__PURE__*/_classPrivateFieldLooseKey("attachRenderFunctionToTarget"), _isTargetSupported = /*#__PURE__*/_classPrivateFieldLooseKey("isTargetSupported"), _getAcquirers = /*#__PURE__*/_classPrivateFieldLooseKey("getAcquirers"), _getProgressIndicators = /*#__PURE__*/_classPrivateFieldLooseKey("getProgressIndicators"), _getEditors = /*#__PURE__*/_classPrivateFieldLooseKey("getEditors"), _class = class Dashboard extends UIPlugin {
  constructor(uppy, _opts) {
    super(uppy, _opts);

    this.removeTarget = plugin => {
      const pluginState = this.getPluginState(); // filter out the one we want to remove

      const newTargets = pluginState.targets.filter(target => target.id !== plugin.id);
      this.setPluginState({
        targets: newTargets
      });
    };

    this.addTarget = plugin => {
      const callerPluginId = plugin.id || plugin.constructor.name;
      const callerPluginName = plugin.title || callerPluginId;
      const callerPluginType = plugin.type;

      if (callerPluginType !== 'acquirer' && callerPluginType !== 'progressindicator' && callerPluginType !== 'editor') {
        const msg = 'Dashboard: can only be targeted by plugins of types: acquirer, progressindicator, editor';
        this.uppy.log(msg, 'error');
        return;
      }

      const target = {
        id: callerPluginId,
        name: callerPluginName,
        type: callerPluginType
      };
      const state = this.getPluginState();
      const newTargets = state.targets.slice();
      newTargets.push(target);
      this.setPluginState({
        targets: newTargets
      });
      return this.el;
    };

    this.hideAllPanels = () => {
      const state = this.getPluginState();
      const update = {
        activePickerPanel: false,
        showAddFilesPanel: false,
        activeOverlayType: null,
        fileCardFor: null,
        showFileEditor: false
      };

      if (state.activePickerPanel === update.activePickerPanel && state.showAddFilesPanel === update.showAddFilesPanel && state.showFileEditor === update.showFileEditor && state.activeOverlayType === update.activeOverlayType) {
        // avoid doing a state update if nothing changed
        return;
      }

      this.setPluginState(update);
    };

    this.showPanel = id => {
      const {
        targets
      } = this.getPluginState();
      const activePickerPanel = targets.filter(target => {
        return target.type === 'acquirer' && target.id === id;
      })[0];
      this.setPluginState({
        activePickerPanel,
        activeOverlayType: 'PickerPanel'
      });
    };

    this.canEditFile = file => {
      const {
        targets
      } = this.getPluginState();

      const editors = _classPrivateFieldLooseBase(this, _getEditors)[_getEditors](targets);

      return editors.some(target => this.uppy.getPlugin(target.id).canEditFile(file));
    };

    this.openFileEditor = file => {
      const {
        targets
      } = this.getPluginState();

      const editors = _classPrivateFieldLooseBase(this, _getEditors)[_getEditors](targets);

      this.setPluginState({
        showFileEditor: true,
        fileCardFor: file.id || null,
        activeOverlayType: 'FileEditor'
      });
      editors.forEach(editor => {
        this.uppy.getPlugin(editor.id).selectFile(file);
      });
    };

    this.saveFileEditor = () => {
      const {
        targets
      } = this.getPluginState();

      const editors = _classPrivateFieldLooseBase(this, _getEditors)[_getEditors](targets);

      editors.forEach(editor => {
        this.uppy.getPlugin(editor.id).save();
      });
      this.hideAllPanels();
    };

    this.openModal = () => {
      const {
        promise,
        resolve
      } = createPromise(); // save scroll position

      this.savedScrollPosition = window.pageYOffset; // save active element, so we can restore focus when modal is closed

      this.savedActiveElement = document.activeElement;

      if (this.opts.disablePageScrollWhenModalOpen) {
        document.body.classList.add('uppy-Dashboard-isFixed');
      }

      if (this.opts.animateOpenClose && this.getPluginState().isClosing) {
        const handler = () => {
          this.setPluginState({
            isHidden: false
          });
          this.el.removeEventListener('animationend', handler, false);
          resolve();
        };

        this.el.addEventListener('animationend', handler, false);
      } else {
        this.setPluginState({
          isHidden: false
        });
        resolve();
      }

      if (this.opts.browserBackButtonClose) {
        this.updateBrowserHistory();
      } // handle ESC and TAB keys in modal dialog


      document.addEventListener('keydown', this.handleKeyDownInModal);
      this.uppy.emit('dashboard:modal-open');
      return promise;
    };

    this.closeModal = (opts = {}) => {
      const {
        // Whether the modal is being closed by the user (`true`) or by other means (e.g. browser back button)
        manualClose = true
      } = opts;
      const {
        isHidden,
        isClosing
      } = this.getPluginState();

      if (isHidden || isClosing) {
        // short-circuit if animation is ongoing
        return;
      }

      const {
        promise,
        resolve
      } = createPromise();

      if (this.opts.disablePageScrollWhenModalOpen) {
        document.body.classList.remove('uppy-Dashboard-isFixed');
      }

      if (this.opts.animateOpenClose) {
        this.setPluginState({
          isClosing: true
        });

        const handler = () => {
          this.setPluginState({
            isHidden: true,
            isClosing: false
          });
          this.superFocus.cancel();
          this.savedActiveElement.focus();
          this.el.removeEventListener('animationend', handler, false);
          resolve();
        };

        this.el.addEventListener('animationend', handler, false);
      } else {
        this.setPluginState({
          isHidden: true
        });
        this.superFocus.cancel();
        this.savedActiveElement.focus();
        resolve();
      } // handle ESC and TAB keys in modal dialog


      document.removeEventListener('keydown', this.handleKeyDownInModal);

      if (manualClose) {
        if (this.opts.browserBackButtonClose) {
          var _history$state;

          // Make sure that the latest entry in the history state is our modal name
          // eslint-disable-next-line no-restricted-globals
          if ((_history$state = history.state) != null && _history$state[this.modalName]) {
            // Go back in history to clear out the entry we created (ultimately closing the modal)
            // eslint-disable-next-line no-restricted-globals
            history.back();
          }
        }
      }

      this.uppy.emit('dashboard:modal-closed');
      return promise;
    };

    this.isModalOpen = () => {
      return !this.getPluginState().isHidden || false;
    };

    this.requestCloseModal = () => {
      if (this.opts.onRequestCloseModal) {
        return this.opts.onRequestCloseModal();
      }

      return this.closeModal();
    };

    this.setDarkModeCapability = isDarkModeOn => {
      const {
        capabilities
      } = this.uppy.getState();
      this.uppy.setState({
        capabilities: { ...capabilities,
          darkMode: isDarkModeOn
        }
      });
    };

    this.handleSystemDarkModeChange = event => {
      const isDarkModeOnNow = event.matches;
      this.uppy.log(`[Dashboard] Dark mode is ${isDarkModeOnNow ? 'on' : 'off'}`);
      this.setDarkModeCapability(isDarkModeOnNow);
    };

    this.toggleFileCard = (show, fileID) => {
      const file = this.uppy.getFile(fileID);

      if (show) {
        this.uppy.emit('dashboard:file-edit-start', file);
      } else {
        this.uppy.emit('dashboard:file-edit-complete', file);
      }

      this.setPluginState({
        fileCardFor: show ? fileID : null,
        activeOverlayType: show ? 'FileCard' : null
      });
    };

    this.toggleAddFilesPanel = show => {
      this.setPluginState({
        showAddFilesPanel: show,
        activeOverlayType: show ? 'AddFiles' : null
      });
    };

    this.addFiles = files => {
      const descriptors = files.map(file => ({
        source: this.id,
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          // path of the file relative to the ancestor directory the user selected.
          // e.g. 'docs/Old Prague/airbnb.pdf'
          relativePath: file.relativePath || null
        }
      }));

      try {
        this.uppy.addFiles(descriptors);
      } catch (err) {
        this.uppy.log(err);
      }
    };

    this.startListeningToResize = () => {
      // Watch for Dashboard container (`.uppy-Dashboard-inner`) resize
      // and update containerWidth/containerHeight in plugin state accordingly.
      // Emits first event on initialization.
      this.resizeObserver = new ResizeObserver(entries => {
        const uppyDashboardInnerEl = entries[0];
        const {
          width,
          height
        } = uppyDashboardInnerEl.contentRect;
        this.uppy.log(`[Dashboard] resized: ${width} / ${height}`, 'debug');
        this.setPluginState({
          containerWidth: width,
          containerHeight: height,
          areInsidesReadyToBeVisible: true
        });
      });
      this.resizeObserver.observe(this.el.querySelector('.uppy-Dashboard-inner')); // If ResizeObserver fails to emit an event telling us what size to use - default to the mobile view

      this.makeDashboardInsidesVisibleAnywayTimeout = setTimeout(() => {
        const pluginState = this.getPluginState();
        const isModalAndClosed = !this.opts.inline && pluginState.isHidden;

        if ( // if ResizeObserver hasn't yet fired,
        !pluginState.areInsidesReadyToBeVisible // and it's not due to the modal being closed
        && !isModalAndClosed) {
          this.uppy.log("[Dashboard] resize event didn't fire on time: defaulted to mobile layout", 'debug');
          this.setPluginState({
            areInsidesReadyToBeVisible: true
          });
        }
      }, 1000);
    };

    this.stopListeningToResize = () => {
      this.resizeObserver.disconnect();
      clearTimeout(this.makeDashboardInsidesVisibleAnywayTimeout);
    };

    this.recordIfFocusedOnUppyRecently = event => {
      if (this.el.contains(event.target)) {
        this.ifFocusedOnUppyRecently = true;
      } else {
        this.ifFocusedOnUppyRecently = false; // ___Why run this.superFocus.cancel here when it already runs in superFocusOnEachUpdate?
        //    Because superFocus is debounced, when we move from Uppy to some other element on the page,
        //    previously run superFocus sometimes hits and moves focus back to Uppy.

        this.superFocus.cancel();
      }
    };

    this.disableAllFocusableElements = disable => {
      const focusableNodes = toArray(this.el.querySelectorAll(FOCUSABLE_ELEMENTS));

      if (disable) {
        focusableNodes.forEach(node => {
          // save previous tabindex in a data-attribute, to restore when enabling
          const currentTabIndex = node.getAttribute('tabindex');

          if (currentTabIndex) {
            node.dataset.inertTabindex = currentTabIndex;
          }

          node.setAttribute('tabindex', '-1');
        });
      } else {
        focusableNodes.forEach(node => {
          if ('inertTabindex' in node.dataset) {
            node.setAttribute('tabindex', node.dataset.inertTabindex);
          } else {
            node.removeAttribute('tabindex');
          }
        });
      }

      this.dashboardIsDisabled = disable;
    };

    this.updateBrowserHistory = () => {
      var _history$state2;

      // Ensure history state does not already contain our modal name to avoid double-pushing
      // eslint-disable-next-line no-restricted-globals
      if (!((_history$state2 = history.state) != null && _history$state2[this.modalName])) {
        // Push to history so that the page is not lost on browser back button press
        // eslint-disable-next-line no-restricted-globals
        history.pushState({ // eslint-disable-next-line no-restricted-globals
          ...history.state,
          [this.modalName]: true
        }, '');
      } // Listen for back button presses


      window.addEventListener('popstate', this.handlePopState, false);
    };

    this.handlePopState = event => {
      var _event$state;

      // Close the modal if the history state no longer contains our modal name
      if (this.isModalOpen() && (!event.state || !event.state[this.modalName])) {
        this.closeModal({
          manualClose: false
        });
      } // When the browser back button is pressed and uppy is now the latest entry
      // in the history but the modal is closed, fix the history by removing the
      // uppy history entry.
      // This occurs when another entry is added into the history state while the
      // modal is open, and then the modal gets manually closed.
      // Solves PR #575 (https://github.com/transloadit/uppy/pull/575)


      if (!this.isModalOpen() && (_event$state = event.state) != null && _event$state[this.modalName]) {
        // eslint-disable-next-line no-restricted-globals
        history.back();
      }
    };

    this.handleKeyDownInModal = event => {
      // close modal on esc key press
      if (event.keyCode === ESC_KEY) this.requestCloseModal(event); // trap focus on tab key press

      if (event.keyCode === TAB_KEY) trapFocus.forModal(event, this.getPluginState().activeOverlayType, this.el);
    };

    this.handleClickOutside = () => {
      if (this.opts.closeModalOnClickOutside) this.requestCloseModal();
    };

    this.handlePaste = event => {
      // Let any acquirer plugin (Url/Webcam/etc.) handle pastes to the root
      this.uppy.iteratePlugins(plugin => {
        if (plugin.type === 'acquirer') {
          // Every Plugin with .type acquirer can define handleRootPaste(event)
          plugin.handleRootPaste == null ? void 0 : plugin.handleRootPaste(event);
        }
      }); // Add all dropped files

      const files = toArray(event.clipboardData.files);

      if (files.length > 0) {
        this.uppy.log('[Dashboard] Files pasted');
        this.addFiles(files);
      }
    };

    this.handleInputChange = event => {
      event.preventDefault();
      const files = toArray(event.target.files);

      if (files.length > 0) {
        this.uppy.log('[Dashboard] Files selected through input');
        this.addFiles(files);
      }
    };

    this.handleDragOver = event => {
      var _this$opts$onDragOver, _this$opts;

      event.preventDefault();
      event.stopPropagation(); // Check if some plugin can handle the datatransfer without files —
      // for instance, the Url plugin can import a url

      const canSomePluginHandleRootDrop = () => {
        let somePluginCanHandleRootDrop = true;
        this.uppy.iteratePlugins(plugin => {
          if (plugin.canHandleRootDrop != null && plugin.canHandleRootDrop(event)) {
            somePluginCanHandleRootDrop = true;
          }
        });
        return somePluginCanHandleRootDrop;
      }; // Check if the "type" of the datatransfer object includes files


      const doesEventHaveFiles = () => {
        const {
          types
        } = event.dataTransfer;
        return types.some(type => type === 'Files');
      }; // Deny drop, if no plugins can handle datatransfer, there are no files,
      // or when opts.disabled is set, or new uploads are not allowed


      const somePluginCanHandleRootDrop = canSomePluginHandleRootDrop(event);
      const hasFiles = doesEventHaveFiles(event);

      if (!somePluginCanHandleRootDrop && !hasFiles || this.opts.disabled // opts.disableLocalFiles should only be taken into account if no plugins
      // can handle the datatransfer
      || this.opts.disableLocalFiles && (hasFiles || !somePluginCanHandleRootDrop) || !this.uppy.getState().allowNewUpload) {
        event.dataTransfer.dropEffect = 'none';
        clearTimeout(this.removeDragOverClassTimeout);
        return;
      } // Add a small (+) icon on drop
      // (and prevent browsers from interpreting this as files being _moved_ into the
      // browser, https://github.com/transloadit/uppy/issues/1978).


      event.dataTransfer.dropEffect = 'copy';
      clearTimeout(this.removeDragOverClassTimeout);
      this.setPluginState({
        isDraggingOver: true
      });
      (_this$opts$onDragOver = (_this$opts = this.opts).onDragOver) == null ? void 0 : _this$opts$onDragOver.call(_this$opts, event);
    };

    this.handleDragLeave = event => {
      var _this$opts$onDragLeav, _this$opts2;

      event.preventDefault();
      event.stopPropagation();
      clearTimeout(this.removeDragOverClassTimeout); // Timeout against flickering, this solution is taken from drag-drop library.
      // Solution with 'pointer-events: none' didn't work across browsers.

      this.removeDragOverClassTimeout = setTimeout(() => {
        this.setPluginState({
          isDraggingOver: false
        });
      }, 50);
      (_this$opts$onDragLeav = (_this$opts2 = this.opts).onDragLeave) == null ? void 0 : _this$opts$onDragLeav.call(_this$opts2, event);
    };

    this.handleDrop = async event => {
      var _this$opts$onDrop, _this$opts3;

      event.preventDefault();
      event.stopPropagation();
      clearTimeout(this.removeDragOverClassTimeout);
      this.setPluginState({
        isDraggingOver: false
      }); // Let any acquirer plugin (Url/Webcam/etc.) handle drops to the root

      this.uppy.iteratePlugins(plugin => {
        if (plugin.type === 'acquirer') {
          // Every Plugin with .type acquirer can define handleRootDrop(event)
          plugin.handleRootDrop == null ? void 0 : plugin.handleRootDrop(event);
        }
      }); // Add all dropped files

      let executedDropErrorOnce = false;

      const logDropError = error => {
        this.uppy.log(error, 'error'); // In practice all drop errors are most likely the same,
        // so let's just show one to avoid overwhelming the user

        if (!executedDropErrorOnce) {
          this.uppy.info(error.message, 'error');
          executedDropErrorOnce = true;
        }
      }; // Add all dropped files


      const files = await getDroppedFiles(event.dataTransfer, {
        logDropError
      });

      if (files.length > 0) {
        this.uppy.log('[Dashboard] Files dropped');
        this.addFiles(files);
      }

      (_this$opts$onDrop = (_this$opts3 = this.opts).onDrop) == null ? void 0 : _this$opts$onDrop.call(_this$opts3, event);
    };

    this.handleRequestThumbnail = file => {
      if (!this.opts.waitForThumbnailsBeforeUpload) {
        this.uppy.emit('thumbnail:request', file);
      }
    };

    this.handleCancelThumbnail = file => {
      if (!this.opts.waitForThumbnailsBeforeUpload) {
        this.uppy.emit('thumbnail:cancel', file);
      }
    };

    this.handleKeyDownInInline = event => {
      // Trap focus on tab key press.
      if (event.keyCode === TAB_KEY) trapFocus.forInline(event, this.getPluginState().activeOverlayType, this.el);
    };

    this.handlePasteOnBody = event => {
      const isFocusInOverlay = this.el.contains(document.activeElement);

      if (isFocusInOverlay) {
        this.handlePaste(event);
      }
    };

    this.handleComplete = ({
      failed
    }) => {
      if (this.opts.closeAfterFinish && failed.length === 0) {
        // All uploads are done
        this.requestCloseModal();
      }
    };

    this.handleCancelRestore = () => {
      this.uppy.emit('restore-canceled');
    };

    Object.defineProperty(this, _openFileEditorWhenFilesAdded, {
      writable: true,
      value: files => {
        const firstFile = files[0];

        if (this.canEditFile(firstFile)) {
          this.openFileEditor(firstFile);
        }
      }
    });

    this.initEvents = () => {
      // Modal open button
      if (this.opts.trigger && !this.opts.inline) {
        const showModalTrigger = findAllDOMElements(this.opts.trigger);

        if (showModalTrigger) {
          showModalTrigger.forEach(trigger => trigger.addEventListener('click', this.openModal));
        } else {
          this.uppy.log('Dashboard modal trigger not found. Make sure `trigger` is set in Dashboard options, unless you are planning to call `dashboard.openModal()` method yourself', 'warning');
        }
      }

      this.startListeningToResize();
      document.addEventListener('paste', this.handlePasteOnBody);
      this.uppy.on('plugin-remove', this.removeTarget);
      this.uppy.on('file-added', this.hideAllPanels);
      this.uppy.on('dashboard:modal-closed', this.hideAllPanels);
      this.uppy.on('file-editor:complete', this.hideAllPanels);
      this.uppy.on('complete', this.handleComplete); // ___Why fire on capture?
      //    Because this.ifFocusedOnUppyRecently needs to change before onUpdate() fires.

      document.addEventListener('focus', this.recordIfFocusedOnUppyRecently, true);
      document.addEventListener('click', this.recordIfFocusedOnUppyRecently, true);

      if (this.opts.inline) {
        this.el.addEventListener('keydown', this.handleKeyDownInInline);
      }

      if (this.opts.autoOpenFileEditor) {
        this.uppy.on('files-added', _classPrivateFieldLooseBase(this, _openFileEditorWhenFilesAdded)[_openFileEditorWhenFilesAdded]);
      }
    };

    this.removeEvents = () => {
      const showModalTrigger = findAllDOMElements(this.opts.trigger);

      if (!this.opts.inline && showModalTrigger) {
        showModalTrigger.forEach(trigger => trigger.removeEventListener('click', this.openModal));
      }

      this.stopListeningToResize();
      document.removeEventListener('paste', this.handlePasteOnBody);
      window.removeEventListener('popstate', this.handlePopState, false);
      this.uppy.off('plugin-remove', this.removeTarget);
      this.uppy.off('file-added', this.hideAllPanels);
      this.uppy.off('dashboard:modal-closed', this.hideAllPanels);
      this.uppy.off('file-editor:complete', this.hideAllPanels);
      this.uppy.off('complete', this.handleComplete);
      document.removeEventListener('focus', this.recordIfFocusedOnUppyRecently);
      document.removeEventListener('click', this.recordIfFocusedOnUppyRecently);

      if (this.opts.inline) {
        this.el.removeEventListener('keydown', this.handleKeyDownInInline);
      }

      if (this.opts.autoOpenFileEditor) {
        this.uppy.off('files-added', _classPrivateFieldLooseBase(this, _openFileEditorWhenFilesAdded)[_openFileEditorWhenFilesAdded]);
      }
    };

    this.superFocusOnEachUpdate = () => {
      const isFocusInUppy = this.el.contains(document.activeElement); // When focus is lost on the page (== focus is on body for most browsers, or focus is null for IE11)

      const isFocusNowhere = document.activeElement === document.body || document.activeElement === null;
      const isInformerHidden = this.uppy.getState().info.isHidden;
      const isModal = !this.opts.inline;

      if ( // If update is connected to showing the Informer - let the screen reader calmly read it.
      isInformerHidden && ( // If we are in a modal - always superfocus without concern for other elements
      // on the page (user is unlikely to want to interact with the rest of the page)
      isModal // If we are already inside of Uppy, or
      || isFocusInUppy // If we are not focused on anything BUT we have already, at least once, focused on uppy
      //   1. We focus when isFocusNowhere, because when the element we were focused
      //      on disappears (e.g. an overlay), - focus gets lost. If user is typing
      //      something somewhere else on the page, - focus won't be 'nowhere'.
      //   2. We only focus when focus is nowhere AND this.ifFocusedOnUppyRecently,
      //      to avoid focus jumps if we do something else on the page.
      //   [Practical check] Without '&& this.ifFocusedOnUppyRecently', in Safari, in inline mode,
      //                     when file is uploading, - navigate via tab to the checkbox,
      //                     try to press space multiple times. Focus will jump to Uppy.
      || isFocusNowhere && this.ifFocusedOnUppyRecently)) {
        this.superFocus(this.el, this.getPluginState().activeOverlayType);
      } else {
        this.superFocus.cancel();
      }
    };

    this.afterUpdate = () => {
      if (this.opts.disabled && !this.dashboardIsDisabled) {
        this.disableAllFocusableElements(true);
        return;
      }

      if (!this.opts.disabled && this.dashboardIsDisabled) {
        this.disableAllFocusableElements(false);
      }

      this.superFocusOnEachUpdate();
    };

    this.saveFileCard = (meta, fileID) => {
      this.uppy.setFileMeta(fileID, meta);
      this.toggleFileCard(false, fileID);
    };

    Object.defineProperty(this, _attachRenderFunctionToTarget, {
      writable: true,
      value: target => {
        const plugin = this.uppy.getPlugin(target.id);
        return { ...target,
          icon: plugin.icon || this.opts.defaultPickerIcon,
          render: plugin.render
        };
      }
    });
    Object.defineProperty(this, _isTargetSupported, {
      writable: true,
      value: target => {
        const plugin = this.uppy.getPlugin(target.id); // If the plugin does not provide a `supported` check, assume the plugin works everywhere.

        if (typeof plugin.isSupported !== 'function') {
          return true;
        }

        return plugin.isSupported();
      }
    });
    Object.defineProperty(this, _getAcquirers, {
      writable: true,
      value: memoize(targets => {
        return targets.filter(target => target.type === 'acquirer' && _classPrivateFieldLooseBase(this, _isTargetSupported)[_isTargetSupported](target)).map(_classPrivateFieldLooseBase(this, _attachRenderFunctionToTarget)[_attachRenderFunctionToTarget]);
      })
    });
    Object.defineProperty(this, _getProgressIndicators, {
      writable: true,
      value: memoize(targets => {
        return targets.filter(target => target.type === 'progressindicator').map(_classPrivateFieldLooseBase(this, _attachRenderFunctionToTarget)[_attachRenderFunctionToTarget]);
      })
    });
    Object.defineProperty(this, _getEditors, {
      writable: true,
      value: memoize(targets => {
        return targets.filter(target => target.type === 'editor').map(_classPrivateFieldLooseBase(this, _attachRenderFunctionToTarget)[_attachRenderFunctionToTarget]);
      })
    });

    this.render = state => {
      const pluginState = this.getPluginState();
      const {
        files,
        capabilities,
        allowNewUpload
      } = state;
      const {
        newFiles,
        uploadStartedFiles,
        completeFiles,
        erroredFiles,
        inProgressFiles,
        inProgressNotPausedFiles,
        processingFiles,
        isUploadStarted,
        isAllComplete,
        isAllErrored,
        isAllPaused
      } = this.uppy.getObjectOfFilesPerState();

      const acquirers = _classPrivateFieldLooseBase(this, _getAcquirers)[_getAcquirers](pluginState.targets);

      const progressindicators = _classPrivateFieldLooseBase(this, _getProgressIndicators)[_getProgressIndicators](pluginState.targets);

      const editors = _classPrivateFieldLooseBase(this, _getEditors)[_getEditors](pluginState.targets);

      let theme;

      if (this.opts.theme === 'auto') {
        theme = capabilities.darkMode ? 'dark' : 'light';
      } else {
        theme = this.opts.theme;
      }

      if (['files', 'folders', 'both'].indexOf(this.opts.fileManagerSelectionType) < 0) {
        this.opts.fileManagerSelectionType = 'files'; // eslint-disable-next-line no-console

        console.warn(`Unsupported option for "fileManagerSelectionType". Using default of "${this.opts.fileManagerSelectionType}".`);
      }

      return DashboardUI({
        state,
        isHidden: pluginState.isHidden,
        files,
        newFiles,
        uploadStartedFiles,
        completeFiles,
        erroredFiles,
        inProgressFiles,
        inProgressNotPausedFiles,
        processingFiles,
        isUploadStarted,
        isAllComplete,
        isAllErrored,
        isAllPaused,
        totalFileCount: Object.keys(files).length,
        totalProgress: state.totalProgress,
        allowNewUpload,
        acquirers,
        theme,
        disabled: this.opts.disabled,
        disableLocalFiles: this.opts.disableLocalFiles,
        direction: this.opts.direction,
        activePickerPanel: pluginState.activePickerPanel,
        showFileEditor: pluginState.showFileEditor,
        saveFileEditor: this.saveFileEditor,
        disableAllFocusableElements: this.disableAllFocusableElements,
        animateOpenClose: this.opts.animateOpenClose,
        isClosing: pluginState.isClosing,
        progressindicators,
        editors,
        autoProceed: this.uppy.opts.autoProceed,
        id: this.id,
        closeModal: this.requestCloseModal,
        handleClickOutside: this.handleClickOutside,
        handleInputChange: this.handleInputChange,
        handlePaste: this.handlePaste,
        inline: this.opts.inline,
        showPanel: this.showPanel,
        hideAllPanels: this.hideAllPanels,
        i18n: this.i18n,
        i18nArray: this.i18nArray,
        uppy: this.uppy,
        note: this.opts.note,
        recoveredState: state.recoveredState,
        metaFields: pluginState.metaFields,
        resumableUploads: capabilities.resumableUploads || false,
        individualCancellation: capabilities.individualCancellation,
        isMobileDevice: capabilities.isMobileDevice,
        fileCardFor: pluginState.fileCardFor,
        toggleFileCard: this.toggleFileCard,
        toggleAddFilesPanel: this.toggleAddFilesPanel,
        showAddFilesPanel: pluginState.showAddFilesPanel,
        saveFileCard: this.saveFileCard,
        openFileEditor: this.openFileEditor,
        canEditFile: this.canEditFile,
        width: this.opts.width,
        height: this.opts.height,
        showLinkToFileUploadResult: this.opts.showLinkToFileUploadResult,
        fileManagerSelectionType: this.opts.fileManagerSelectionType,
        proudlyDisplayPoweredByUppy: this.opts.proudlyDisplayPoweredByUppy,
        hideCancelButton: this.opts.hideCancelButton,
        hideRetryButton: this.opts.hideRetryButton,
        hidePauseResumeButton: this.opts.hidePauseResumeButton,
        showRemoveButtonAfterComplete: this.opts.showRemoveButtonAfterComplete,
        containerWidth: pluginState.containerWidth,
        containerHeight: pluginState.containerHeight,
        areInsidesReadyToBeVisible: pluginState.areInsidesReadyToBeVisible,
        isTargetDOMEl: this.isTargetDOMEl,
        parentElement: this.el,
        allowedFileTypes: this.uppy.opts.restrictions.allowedFileTypes,
        maxNumberOfFiles: this.uppy.opts.restrictions.maxNumberOfFiles,
        requiredMetaFields: this.uppy.opts.restrictions.requiredMetaFields,
        showSelectedFiles: this.opts.showSelectedFiles,
        handleCancelRestore: this.handleCancelRestore,
        handleRequestThumbnail: this.handleRequestThumbnail,
        handleCancelThumbnail: this.handleCancelThumbnail,
        // drag props
        isDraggingOver: pluginState.isDraggingOver,
        handleDragOver: this.handleDragOver,
        handleDragLeave: this.handleDragLeave,
        handleDrop: this.handleDrop
      });
    };

    this.discoverProviderPlugins = () => {
      this.uppy.iteratePlugins(plugin => {
        if (plugin && !plugin.target && plugin.opts && plugin.opts.target === this.constructor) {
          this.addTarget(plugin);
        }
      });
    };

    this.install = () => {
      // Set default state for Dashboard
      this.setPluginState({
        isHidden: true,
        fileCardFor: null,
        activeOverlayType: null,
        showAddFilesPanel: false,
        activePickerPanel: false,
        showFileEditor: false,
        metaFields: this.opts.metaFields,
        targets: [],
        // We'll make them visible once .containerWidth is determined
        areInsidesReadyToBeVisible: false,
        isDraggingOver: false
      });
      const {
        inline,
        closeAfterFinish
      } = this.opts;

      if (inline && closeAfterFinish) {
        throw new Error('[Dashboard] `closeAfterFinish: true` cannot be used on an inline Dashboard, because an inline Dashboard cannot be closed at all. Either set `inline: false`, or disable the `closeAfterFinish` option.');
      }

      const {
        allowMultipleUploads,
        allowMultipleUploadBatches
      } = this.uppy.opts;

      if ((allowMultipleUploads || allowMultipleUploadBatches) && closeAfterFinish) {
        this.uppy.log('[Dashboard] When using `closeAfterFinish`, we recommended setting the `allowMultipleUploadBatches` option to `false` in the Uppy constructor. See https://uppy.io/docs/uppy/#allowMultipleUploads-true', 'warning');
      }

      const {
        target
      } = this.opts;

      if (target) {
        this.mount(target, this);
      }

      const plugins = this.opts.plugins || [];
      plugins.forEach(pluginID => {
        const plugin = this.uppy.getPlugin(pluginID);

        if (plugin) {
          plugin.mount(this, plugin);
        }
      });

      if (!this.opts.disableStatusBar) {
        this.uppy.use(StatusBar, {
          id: `${this.id}:StatusBar`,
          target: this,
          hideUploadButton: this.opts.hideUploadButton,
          hideRetryButton: this.opts.hideRetryButton,
          hidePauseResumeButton: this.opts.hidePauseResumeButton,
          hideCancelButton: this.opts.hideCancelButton,
          showProgressDetails: this.opts.showProgressDetails,
          hideAfterFinish: this.opts.hideProgressAfterFinish,
          locale: this.opts.locale,
          doneButtonHandler: this.opts.doneButtonHandler
        });
      }

      if (!this.opts.disableInformer) {
        this.uppy.use(Informer, {
          id: `${this.id}:Informer`,
          target: this
        });
      }

      if (!this.opts.disableThumbnailGenerator) {
        this.uppy.use(ThumbnailGenerator, {
          id: `${this.id}:ThumbnailGenerator`,
          thumbnailWidth: this.opts.thumbnailWidth,
          thumbnailType: this.opts.thumbnailType,
          waitForThumbnailsBeforeUpload: this.opts.waitForThumbnailsBeforeUpload,
          // If we don't block on thumbnails, we can lazily generate them
          lazy: !this.opts.waitForThumbnailsBeforeUpload
        });
      } // Dark Mode / theme


      this.darkModeMediaQuery = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
      const isDarkModeOnFromTheStart = this.darkModeMediaQuery ? this.darkModeMediaQuery.matches : false;
      this.uppy.log(`[Dashboard] Dark mode is ${isDarkModeOnFromTheStart ? 'on' : 'off'}`);
      this.setDarkModeCapability(isDarkModeOnFromTheStart);

      if (this.opts.theme === 'auto') {
        this.darkModeMediaQuery.addListener(this.handleSystemDarkModeChange);
      }

      this.discoverProviderPlugins();
      this.initEvents();
    };

    this.uninstall = () => {
      if (!this.opts.disableInformer) {
        const informer = this.uppy.getPlugin(`${this.id}:Informer`); // Checking if this plugin exists, in case it was removed by uppy-core
        // before the Dashboard was.

        if (informer) this.uppy.removePlugin(informer);
      }

      if (!this.opts.disableStatusBar) {
        const statusBar = this.uppy.getPlugin(`${this.id}:StatusBar`);
        if (statusBar) this.uppy.removePlugin(statusBar);
      }

      if (!this.opts.disableThumbnailGenerator) {
        const thumbnail = this.uppy.getPlugin(`${this.id}:ThumbnailGenerator`);
        if (thumbnail) this.uppy.removePlugin(thumbnail);
      }

      const plugins = this.opts.plugins || [];
      plugins.forEach(pluginID => {
        const plugin = this.uppy.getPlugin(pluginID);
        if (plugin) plugin.unmount();
      });

      if (this.opts.theme === 'auto') {
        this.darkModeMediaQuery.removeListener(this.handleSystemDarkModeChange);
      }

      this.unmount();
      this.removeEvents();
    };

    this.id = this.opts.id || 'Dashboard';
    this.title = 'Dashboard';
    this.type = 'orchestrator';
    this.modalName = `uppy-Dashboard-${nanoid()}`;
    this.defaultLocale = locale; // set default options

    const defaultOptions = {
      target: 'body',
      metaFields: [],
      trigger: null,
      inline: false,
      width: 750,
      height: 550,
      thumbnailWidth: 280,
      thumbnailType: 'image/jpeg',
      waitForThumbnailsBeforeUpload: false,
      defaultPickerIcon,
      showLinkToFileUploadResult: false,
      showProgressDetails: false,
      hideUploadButton: false,
      hideCancelButton: false,
      hideRetryButton: false,
      hidePauseResumeButton: false,
      hideProgressAfterFinish: false,
      doneButtonHandler: () => {
        this.uppy.reset();
        this.requestCloseModal();
      },
      note: null,
      closeModalOnClickOutside: false,
      closeAfterFinish: false,
      disableStatusBar: false,
      disableInformer: false,
      disableThumbnailGenerator: false,
      disablePageScrollWhenModalOpen: true,
      animateOpenClose: true,
      fileManagerSelectionType: 'files',
      proudlyDisplayPoweredByUppy: true,
      onRequestCloseModal: () => this.closeModal(),
      showSelectedFiles: true,
      showRemoveButtonAfterComplete: false,
      browserBackButtonClose: false,
      theme: 'light',
      autoOpenFileEditor: false,
      disabled: false,
      disableLocalFiles: false
    }; // merge default options with the ones set by user

    this.opts = { ...defaultOptions,
      ..._opts
    };
    this.i18nInit();
    this.superFocus = createSuperFocus();
    this.ifFocusedOnUppyRecently = false; // Timeouts

    this.makeDashboardInsidesVisibleAnywayTimeout = null;
    this.removeDragOverClassTimeout = null;
  }

  onMount() {
    // Set the text direction if the page has not defined one.
    const element = this.el;
    const direction = getTextDirection(element);

    if (!direction) {
      element.dir = 'ltr';
    }
  }

}), _class.VERSION = "2.1.1", _temp);

},{"./../../core":48,"./../../informer":94,"./../../status-bar":133,"./../../thumbnail-generator":136,"./../../utils/lib/FOCUSABLE_ELEMENTS":145,"./../../utils/lib/findAllDOMElements":153,"./../../utils/lib/getDroppedFiles":157,"./../../utils/lib/getTextDirection":167,"./../../utils/lib/toArray":180,"./components/Dashboard":54,"./locale":70,"./utils/createSuperFocus":72,"./utils/trapFocus":76,"memoize-one":12,"nanoid":16,"preact":18}],70:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    // When `inline: false`, used as the screen reader label for the button that closes the modal.
    closeModal: 'Close Modal',
    // Used as the screen reader label for the plus (+) button that shows the “Add more files” screen
    addMoreFiles: 'Add more files',
    addingMoreFiles: 'Adding more files',
    // Used as the header for import panels, e.g., “Import from Google Drive”.
    importFrom: 'Import from %{name}',
    // When `inline: false`, used as the screen reader label for the dashboard modal.
    dashboardWindowTitle: 'Uppy Dashboard Window (Press escape to close)',
    // When `inline: true`, used as the screen reader label for the dashboard area.
    dashboardTitle: 'Uppy Dashboard',
    // Shown in the Informer when a link to a file was copied to the clipboard.
    copyLinkToClipboardSuccess: 'Link copied to clipboard.',
    // Used when a link cannot be copied automatically — the user has to select the text from the
    // input element below this string.
    copyLinkToClipboardFallback: 'Copy the URL below',
    // Used as the hover title and screen reader label for buttons that copy a file link.
    copyLink: 'Copy link',
    back: 'Back',
    // Used as the screen reader label for buttons that remove a file.
    removeFile: 'Remove file',
    // Used as the screen reader label for buttons that open the metadata editor panel for a file.
    editFile: 'Edit file',
    // Shown in the panel header for the metadata editor. Rendered as “Editing image.png”.
    editing: 'Editing %{file}',
    // Used as the screen reader label for the button that saves metadata edits and returns to the
    // file list view.
    finishEditingFile: 'Finish editing file',
    saveChanges: 'Save changes',
    // Used as the label for the tab button that opens the system file selection dialog.
    myDevice: 'My Device',
    dropHint: 'Drop your files here',
    // Used as the hover text and screen reader label for file progress indicators when
    // they have been fully uploaded.
    uploadComplete: 'Upload complete',
    uploadPaused: 'Upload paused',
    // Used as the hover text and screen reader label for the buttons to resume paused uploads.
    resumeUpload: 'Resume upload',
    // Used as the hover text and screen reader label for the buttons to pause uploads.
    pauseUpload: 'Pause upload',
    // Used as the hover text and screen reader label for the buttons to retry failed uploads.
    retryUpload: 'Retry upload',
    // Used as the hover text and screen reader label for the buttons to cancel uploads.
    cancelUpload: 'Cancel upload',
    // Used in a title, how many files are currently selected
    xFilesSelected: {
      0: '%{smart_count} file selected',
      1: '%{smart_count} files selected'
    },
    uploadingXFiles: {
      0: 'Uploading %{smart_count} file',
      1: 'Uploading %{smart_count} files'
    },
    processingXFiles: {
      0: 'Processing %{smart_count} file',
      1: 'Processing %{smart_count} files'
    },
    // The "powered by Uppy" link at the bottom of the Dashboard.
    poweredBy: 'Powered by %{uppy}',
    addMore: 'Add more',
    editFileWithFilename: 'Edit file %{file}',
    save: 'Save',
    cancel: 'Cancel',
    dropPasteFiles: 'Drop files here or %{browseFiles}',
    dropPasteFolders: 'Drop files here or %{browseFolders}',
    dropPasteBoth: 'Drop files here, %{browseFiles} or %{browseFolders}',
    dropPasteImportFiles: 'Drop files here, %{browseFiles} or import from:',
    dropPasteImportFolders: 'Drop files here, %{browseFolders} or import from:',
    dropPasteImportBoth: 'Drop files here, %{browseFiles}, %{browseFolders} or import from:',
    importFiles: 'Import files from:',
    browseFiles: 'browse files',
    browseFolders: 'browse folders',
    recoveredXFiles: {
      0: 'We could not fully recover 1 file. Please re-select it and resume the upload.',
      1: 'We could not fully recover %{smart_count} files. Please re-select them and resume the upload.'
    },
    recoveredAllFiles: 'We restored all files. You can now resume the upload.',
    sessionRestored: 'Session restored',
    reSelect: 'Re-select',
    missingRequiredMetaFields: {
      0: 'Missing required meta field: %{fields}.',
      1: 'Missing required meta fields: %{fields}.'
    }
  }
};

},{}],71:[function(require,module,exports){
"use strict";

/**
 * Copies text to clipboard by creating an almost invisible textarea,
 * adding text there, then running execCommand('copy').
 * Falls back to prompt() when the easy way fails (hello, Safari!)
 * From http://stackoverflow.com/a/30810322
 *
 * @param {string} textToCopy
 * @param {string} fallbackString
 * @returns {Promise}
 */
module.exports = function copyToClipboard(textToCopy, fallbackString) {
  fallbackString = fallbackString || 'Copy the URL below';
  return new Promise(resolve => {
    const textArea = document.createElement('textarea');
    textArea.setAttribute('style', {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '2em',
      height: '2em',
      padding: 0,
      border: 'none',
      outline: 'none',
      boxShadow: 'none',
      background: 'transparent'
    });
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();

    const magicCopyFailed = () => {
      document.body.removeChild(textArea); // eslint-disable-next-line no-alert

      window.prompt(fallbackString, textToCopy);
      resolve();
    };

    try {
      const successful = document.execCommand('copy');

      if (!successful) {
        return magicCopyFailed('copy command unavailable');
      }

      document.body.removeChild(textArea);
      return resolve();
    } catch (err) {
      document.body.removeChild(textArea);
      return magicCopyFailed(err);
    }
  });
};

},{}],72:[function(require,module,exports){
"use strict";

const debounce = require('lodash.debounce');

const FOCUSABLE_ELEMENTS = require('./../../../utils/lib/FOCUSABLE_ELEMENTS');

const getActiveOverlayEl = require('./getActiveOverlayEl');
/*
  Focuses on some element in the currently topmost overlay.

  1. If there are some [data-uppy-super-focusable] elements rendered already - focuses
     on the first superfocusable element, and leaves focus up to the control of
     a user (until currently focused element disappears from the screen [which
     can happen when overlay changes, or, e.g., when we click on a folder in googledrive]).
  2. If there are no [data-uppy-super-focusable] elements yet (or ever) - focuses
     on the first focusable element, but switches focus if superfocusable elements appear on next render.
*/


module.exports = function createSuperFocus() {
  let lastFocusWasOnSuperFocusableEl = false;

  const superFocus = (dashboardEl, activeOverlayType) => {
    const overlayEl = getActiveOverlayEl(dashboardEl, activeOverlayType);
    const isFocusInOverlay = overlayEl.contains(document.activeElement); // If focus is already in the topmost overlay, AND on last update we focused on the superfocusable
    // element - then leave focus up to the user.
    // [Practical check] without this line, typing in the search input in googledrive overlay won't work.

    if (isFocusInOverlay && lastFocusWasOnSuperFocusableEl) return;
    const superFocusableEl = overlayEl.querySelector('[data-uppy-super-focusable]'); // If we are already in the topmost overlay, AND there are no super focusable elements yet, - leave focus up to the user.
    // [Practical check] without this line, if you are in an empty folder in google drive, and something's uploading in the
    // bg, - focus will be jumping to Done all the time.

    if (isFocusInOverlay && !superFocusableEl) return;

    if (superFocusableEl) {
      superFocusableEl.focus({
        preventScroll: true
      });
      lastFocusWasOnSuperFocusableEl = true;
    } else {
      const firstEl = overlayEl.querySelector(FOCUSABLE_ELEMENTS);
      firstEl == null ? void 0 : firstEl.focus({
        preventScroll: true
      });
      lastFocusWasOnSuperFocusableEl = false;
    }
  }; // ___Why do we need to debounce?
  //    1. To deal with animations: overlay changes via animations, which results in the DOM updating AFTER plugin.update()
  //       already executed.
  //    [Practical check] without debounce, if we open the Url overlay, and click 'Done', Dashboard won't get focused again.
  //    [Practical check] if we delay 250ms instead of 260ms - IE11 won't get focused in same situation.
  //    2. Performance: there can be many state update()s in a second, and this function is called every time.


  return debounce(superFocus, 260);
};

},{"./../../../utils/lib/FOCUSABLE_ELEMENTS":145,"./getActiveOverlayEl":73,"lodash.debounce":10}],73:[function(require,module,exports){
"use strict";

/**
 * @returns {HTMLElement} - either dashboard element, or the overlay that's most on top
 */
module.exports = function getActiveOverlayEl(dashboardEl, activeOverlayType) {
  if (activeOverlayType) {
    const overlayEl = dashboardEl.querySelector(`[data-uppy-paneltype="${activeOverlayType}"]`); // if an overlay is already mounted

    if (overlayEl) return overlayEl;
  }

  return dashboardEl;
};

},{}],74:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

function iconImage() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    width: "25",
    height: "25",
    viewBox: "0 0 25 25"
  }, h("g", {
    fill: "#686DE0",
    fillRule: "evenodd"
  }, h("path", {
    d: "M5 7v10h15V7H5zm0-1h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z",
    fillRule: "nonzero"
  }), h("path", {
    d: "M6.35 17.172l4.994-5.026a.5.5 0 0 1 .707 0l2.16 2.16 3.505-3.505a.5.5 0 0 1 .707 0l2.336 2.31-.707.72-1.983-1.97-3.505 3.505a.5.5 0 0 1-.707 0l-2.16-2.159-3.938 3.939-1.409.026z",
    fillRule: "nonzero"
  }), h("circle", {
    cx: "7.5",
    cy: "9.5",
    r: "1.5"
  })));
}

function iconAudio() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "25",
    height: "25",
    viewBox: "0 0 25 25"
  }, h("path", {
    d: "M9.5 18.64c0 1.14-1.145 2-2.5 2s-2.5-.86-2.5-2c0-1.14 1.145-2 2.5-2 .557 0 1.079.145 1.5.396V7.25a.5.5 0 0 1 .379-.485l9-2.25A.5.5 0 0 1 18.5 5v11.64c0 1.14-1.145 2-2.5 2s-2.5-.86-2.5-2c0-1.14 1.145-2 2.5-2 .557 0 1.079.145 1.5.396V8.67l-8 2v7.97zm8-11v-2l-8 2v2l8-2zM7 19.64c.855 0 1.5-.484 1.5-1s-.645-1-1.5-1-1.5.484-1.5 1 .645 1 1.5 1zm9-2c.855 0 1.5-.484 1.5-1s-.645-1-1.5-1-1.5.484-1.5 1 .645 1 1.5 1z",
    fill: "#049BCF",
    fillRule: "nonzero"
  }));
}

function iconVideo() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "25",
    height: "25",
    viewBox: "0 0 25 25"
  }, h("path", {
    d: "M16 11.834l4.486-2.691A1 1 0 0 1 22 10v6a1 1 0 0 1-1.514.857L16 14.167V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2.834zM15 9H5v8h10V9zm1 4l5 3v-6l-5 3z",
    fill: "#19AF67",
    fillRule: "nonzero"
  }));
}

function iconPDF() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "25",
    height: "25",
    viewBox: "0 0 25 25"
  }, h("path", {
    d: "M9.766 8.295c-.691-1.843-.539-3.401.747-3.726 1.643-.414 2.505.938 2.39 3.299-.039.79-.194 1.662-.537 3.148.324.49.66.967 1.055 1.51.17.231.382.488.629.757 1.866-.128 3.653.114 4.918.655 1.487.635 2.192 1.685 1.614 2.84-.566 1.133-1.839 1.084-3.416.249-1.141-.604-2.457-1.634-3.51-2.707a13.467 13.467 0 0 0-2.238.426c-1.392 4.051-4.534 6.453-5.707 4.572-.986-1.58 1.38-4.206 4.914-5.375.097-.322.185-.656.264-1.001.08-.353.306-1.31.407-1.737-.678-1.059-1.2-2.031-1.53-2.91zm2.098 4.87c-.033.144-.068.287-.104.427l.033-.01-.012.038a14.065 14.065 0 0 1 1.02-.197l-.032-.033.052-.004a7.902 7.902 0 0 1-.208-.271c-.197-.27-.38-.526-.555-.775l-.006.028-.002-.003c-.076.323-.148.632-.186.8zm5.77 2.978c1.143.605 1.832.632 2.054.187.26-.519-.087-1.034-1.113-1.473-.911-.39-2.175-.608-3.55-.608.845.766 1.787 1.459 2.609 1.894zM6.559 18.789c.14.223.693.16 1.425-.413.827-.648 1.61-1.747 2.208-3.206-2.563 1.064-4.102 2.867-3.633 3.62zm5.345-10.97c.088-1.793-.351-2.48-1.146-2.28-.473.119-.564 1.05-.056 2.405.213.566.52 1.188.908 1.859.18-.858.268-1.453.294-1.984z",
    fill: "#E2514A",
    fillRule: "nonzero"
  }));
}

function iconArchive() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    width: "25",
    height: "25",
    viewBox: "0 0 25 25"
  }, h("path", {
    d: "M10.45 2.05h1.05a.5.5 0 0 1 .5.5v.024a.5.5 0 0 1-.5.5h-1.05a.5.5 0 0 1-.5-.5V2.55a.5.5 0 0 1 .5-.5zm2.05 1.024h1.05a.5.5 0 0 1 .5.5V3.6a.5.5 0 0 1-.5.5H12.5a.5.5 0 0 1-.5-.5v-.025a.5.5 0 0 1 .5-.5v-.001zM10.45 0h1.05a.5.5 0 0 1 .5.5v.025a.5.5 0 0 1-.5.5h-1.05a.5.5 0 0 1-.5-.5V.5a.5.5 0 0 1 .5-.5zm2.05 1.025h1.05a.5.5 0 0 1 .5.5v.024a.5.5 0 0 1-.5.5H12.5a.5.5 0 0 1-.5-.5v-.024a.5.5 0 0 1 .5-.5zm-2.05 3.074h1.05a.5.5 0 0 1 .5.5v.025a.5.5 0 0 1-.5.5h-1.05a.5.5 0 0 1-.5-.5v-.025a.5.5 0 0 1 .5-.5zm2.05 1.025h1.05a.5.5 0 0 1 .5.5v.024a.5.5 0 0 1-.5.5H12.5a.5.5 0 0 1-.5-.5v-.024a.5.5 0 0 1 .5-.5zm-2.05 1.024h1.05a.5.5 0 0 1 .5.5v.025a.5.5 0 0 1-.5.5h-1.05a.5.5 0 0 1-.5-.5v-.025a.5.5 0 0 1 .5-.5zm2.05 1.025h1.05a.5.5 0 0 1 .5.5v.025a.5.5 0 0 1-.5.5H12.5a.5.5 0 0 1-.5-.5v-.025a.5.5 0 0 1 .5-.5zm-2.05 1.025h1.05a.5.5 0 0 1 .5.5v.025a.5.5 0 0 1-.5.5h-1.05a.5.5 0 0 1-.5-.5v-.025a.5.5 0 0 1 .5-.5zm2.05 1.025h1.05a.5.5 0 0 1 .5.5v.024a.5.5 0 0 1-.5.5H12.5a.5.5 0 0 1-.5-.5v-.024a.5.5 0 0 1 .5-.5zm-1.656 3.074l-.82 5.946c.52.302 1.174.458 1.976.458.803 0 1.455-.156 1.975-.458l-.82-5.946h-2.311zm0-1.025h2.312c.512 0 .946.378 1.015.885l.82 5.946c.056.412-.142.817-.501 1.026-.686.398-1.515.597-2.49.597-.974 0-1.804-.199-2.49-.597a1.025 1.025 0 0 1-.5-1.026l.819-5.946c.07-.507.503-.885 1.015-.885zm.545 6.6a.5.5 0 0 1-.397-.561l.143-.999a.5.5 0 0 1 .495-.429h.74a.5.5 0 0 1 .495.43l.143.998a.5.5 0 0 1-.397.561c-.404.08-.819.08-1.222 0z",
    fill: "#00C469",
    fillRule: "nonzero"
  }));
}

function iconFile() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "25",
    height: "25",
    viewBox: "0 0 25 25"
  }, h("g", {
    fill: "#A7AFB7",
    fillRule: "nonzero"
  }, h("path", {
    d: "M5.5 22a.5.5 0 0 1-.5-.5v-18a.5.5 0 0 1 .5-.5h10.719a.5.5 0 0 1 .367.16l3.281 3.556a.5.5 0 0 1 .133.339V21.5a.5.5 0 0 1-.5.5h-14zm.5-1h13V7.25L16 4H6v17z"
  }), h("path", {
    d: "M15 4v3a1 1 0 0 0 1 1h3V7h-3V4h-1z"
  })));
}

function iconText() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "25",
    height: "25",
    viewBox: "0 0 25 25"
  }, h("path", {
    d: "M4.5 7h13a.5.5 0 1 1 0 1h-13a.5.5 0 0 1 0-1zm0 3h15a.5.5 0 1 1 0 1h-15a.5.5 0 1 1 0-1zm0 3h15a.5.5 0 1 1 0 1h-15a.5.5 0 1 1 0-1zm0 3h10a.5.5 0 1 1 0 1h-10a.5.5 0 1 1 0-1z",
    fill: "#5A5E69",
    fillRule: "nonzero"
  }));
}

module.exports = function getIconByMime(fileType) {
  const defaultChoice = {
    color: '#838999',
    icon: iconFile()
  };
  if (!fileType) return defaultChoice;
  const fileTypeGeneral = fileType.split('/')[0];
  const fileTypeSpecific = fileType.split('/')[1]; // Text

  if (fileTypeGeneral === 'text') {
    return {
      color: '#5a5e69',
      icon: iconText()
    };
  } // Image


  if (fileTypeGeneral === 'image') {
    return {
      color: '#686de0',
      icon: iconImage()
    };
  } // Audio


  if (fileTypeGeneral === 'audio') {
    return {
      color: '#068dbb',
      icon: iconAudio()
    };
  } // Video


  if (fileTypeGeneral === 'video') {
    return {
      color: '#19af67',
      icon: iconVideo()
    };
  } // PDF


  if (fileTypeGeneral === 'application' && fileTypeSpecific === 'pdf') {
    return {
      color: '#e25149',
      icon: iconPDF()
    };
  } // Archive


  const archiveTypes = ['zip', 'x-7z-compressed', 'x-rar-compressed', 'x-tar', 'x-gzip', 'x-apple-diskimage'];

  if (fileTypeGeneral === 'application' && archiveTypes.indexOf(fileTypeSpecific) !== -1) {
    return {
      color: '#00C469',
      icon: iconArchive()
    };
  }

  return defaultChoice;
};

},{"preact":18}],75:[function(require,module,exports){
"use strict";

// ignore drop/paste events if they are not in input or textarea —
// otherwise when Url plugin adds drop/paste listeners to this.el,
// draging UI elements or pasting anything into any field triggers those events —
// Url treats them as URLs that need to be imported
function ignoreEvent(ev) {
  const {
    tagName
  } = ev.target;

  if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
    ev.stopPropagation();
    return;
  }

  ev.preventDefault();
  ev.stopPropagation();
}

module.exports = ignoreEvent;

},{}],76:[function(require,module,exports){
"use strict";

const toArray = require('./../../../utils/lib/toArray');

const FOCUSABLE_ELEMENTS = require('./../../../utils/lib/FOCUSABLE_ELEMENTS');

const getActiveOverlayEl = require('./getActiveOverlayEl');

function focusOnFirstNode(event, nodes) {
  const node = nodes[0];

  if (node) {
    node.focus();
    event.preventDefault();
  }
}

function focusOnLastNode(event, nodes) {
  const node = nodes[nodes.length - 1];

  if (node) {
    node.focus();
    event.preventDefault();
  }
} // ___Why not just use (focusedItemIndex === -1)?
//    Firefox thinks <ul> is focusable, but we don't have <ul>s in our FOCUSABLE_ELEMENTS. Which means that if we tab into
//    the <ul>, code will think that we are not in the active overlay, and we should focusOnFirstNode() of the currently
//    active overlay!
//    [Practical check] if we use (focusedItemIndex === -1), instagram provider in firefox will never get focus on its pics
//    in the <ul>.


function isFocusInOverlay(activeOverlayEl) {
  return activeOverlayEl.contains(document.activeElement);
}

function trapFocus(event, activeOverlayType, dashboardEl) {
  const activeOverlayEl = getActiveOverlayEl(dashboardEl, activeOverlayType);
  const focusableNodes = toArray(activeOverlayEl.querySelectorAll(FOCUSABLE_ELEMENTS));
  const focusedItemIndex = focusableNodes.indexOf(document.activeElement); // If we pressed tab, and focus is not yet within the current overlay - focus on
  // the first element within the current overlay.
  // This is a safety measure (for when user returns from another tab e.g.), most
  // plugins will try to focus on some important element as it loads.

  if (!isFocusInOverlay(activeOverlayEl)) {
    focusOnFirstNode(event, focusableNodes); // If we pressed shift + tab, and we're on the first element of a modal
  } else if (event.shiftKey && focusedItemIndex === 0) {
    focusOnLastNode(event, focusableNodes); // If we pressed tab, and we're on the last element of the modal
  } else if (!event.shiftKey && focusedItemIndex === focusableNodes.length - 1) {
    focusOnFirstNode(event, focusableNodes);
  }
}

module.exports = {
  // Traps focus inside of the currently open overlay (e.g. Dashboard, or e.g. Instagram),
  // never lets focus disappear from the modal.
  forModal: (event, activeOverlayType, dashboardEl) => {
    trapFocus(event, activeOverlayType, dashboardEl);
  },
  // Traps focus inside of the currently open overlay, unless overlay is null - then let the user tab away.
  forInline: (event, activeOverlayType, dashboardEl) => {
    // ___When we're in the bare 'Drop files here, paste, browse or import from' screen
    if (activeOverlayType === null) {// Do nothing and let the browser handle it, user can tab away from Uppy to other elements on the page
      // ___When there is some overlay with 'Done' button
    } else {
      // Trap the focus inside this overlay!
      // User can close the overlay (click 'Done') if they want to travel away from Uppy.
      trapFocus(event, activeOverlayType, dashboardEl);
    }
  }
};

},{"./../../../utils/lib/FOCUSABLE_ELEMENTS":145,"./../../../utils/lib/toArray":180,"./getActiveOverlayEl":73}],77:[function(require,module,exports){
"use strict";

var _class, _temp;

const BasePlugin = require('./../../core/lib/BasePlugin');

const getDroppedFiles = require('./../../utils/lib/getDroppedFiles');

const toArray = require('./../../utils/lib/toArray');
/**
 * Drop Target plugin
 *
 */


module.exports = (_temp = _class = class DropTarget extends BasePlugin {
  constructor(uppy, opts) {
    super(uppy, opts);

    this.addFiles = files => {
      const descriptors = files.map(file => ({
        source: this.id,
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          // path of the file relative to the ancestor directory the user selected.
          // e.g. 'docs/Old Prague/airbnb.pdf'
          relativePath: file.relativePath || null
        }
      }));

      try {
        this.uppy.addFiles(descriptors);
      } catch (err) {
        this.uppy.log(err);
      }
    };

    this.handleDrop = async event => {
      var _this$opts$onDrop, _this$opts;

      event.preventDefault();
      event.stopPropagation();
      clearTimeout(this.removeDragOverClassTimeout); // Remove dragover class

      event.currentTarget.classList.remove('uppy-is-drag-over');
      this.setPluginState({
        isDraggingOver: false
      }); // Let any acquirer plugin (Url/Webcam/etc.) handle drops to the root

      this.uppy.iteratePlugins(plugin => {
        if (plugin.type === 'acquirer') {
          // Every Plugin with .type acquirer can define handleRootDrop(event)
          plugin.handleRootDrop == null ? void 0 : plugin.handleRootDrop(event);
        }
      }); // Add all dropped files, handle errors

      let executedDropErrorOnce = false;

      const logDropError = error => {
        this.uppy.log(error, 'error'); // In practice all drop errors are most likely the same,
        // so let's just show one to avoid overwhelming the user

        if (!executedDropErrorOnce) {
          this.uppy.info(error.message, 'error');
          executedDropErrorOnce = true;
        }
      };

      const files = await getDroppedFiles(event.dataTransfer, {
        logDropError
      });

      if (files.length > 0) {
        this.uppy.log('[DropTarget] Files were dropped');
        this.addFiles(files);
      }

      (_this$opts$onDrop = (_this$opts = this.opts).onDrop) == null ? void 0 : _this$opts$onDrop.call(_this$opts, event);
    };

    this.handleDragOver = event => {
      var _this$opts$onDragOver, _this$opts2;

      event.preventDefault();
      event.stopPropagation(); // Add a small (+) icon on drop
      // (and prevent browsers from interpreting this as files being _moved_ into the browser,
      // https://github.com/transloadit/uppy/issues/1978)

      event.dataTransfer.dropEffect = 'copy';
      clearTimeout(this.removeDragOverClassTimeout);
      event.currentTarget.classList.add('uppy-is-drag-over');
      this.setPluginState({
        isDraggingOver: true
      });
      (_this$opts$onDragOver = (_this$opts2 = this.opts).onDragOver) == null ? void 0 : _this$opts$onDragOver.call(_this$opts2, event);
    };

    this.handleDragLeave = event => {
      var _this$opts$onDragLeav, _this$opts3;

      event.preventDefault();
      event.stopPropagation();
      const {
        currentTarget
      } = event;
      clearTimeout(this.removeDragOverClassTimeout); // Timeout against flickering, this solution is taken from drag-drop library.
      // Solution with 'pointer-events: none' didn't work across browsers.

      this.removeDragOverClassTimeout = setTimeout(() => {
        currentTarget.classList.remove('uppy-is-drag-over');
        this.setPluginState({
          isDraggingOver: false
        });
      }, 50);
      (_this$opts$onDragLeav = (_this$opts3 = this.opts).onDragLeave) == null ? void 0 : _this$opts$onDragLeav.call(_this$opts3, event);
    };

    this.addListeners = () => {
      const {
        target
      } = this.opts;

      if (target instanceof Element) {
        this.nodes = [target];
      } else if (typeof target === 'string') {
        this.nodes = toArray(document.querySelectorAll(target));
      }

      if (!this.nodes && !this.nodes.length > 0) {
        throw new Error(`"${target}" does not match any HTML elements`);
      }

      this.nodes.forEach(node => {
        node.addEventListener('dragover', this.handleDragOver, false);
        node.addEventListener('dragleave', this.handleDragLeave, false);
        node.addEventListener('drop', this.handleDrop, false);
      });
    };

    this.removeListeners = () => {
      if (this.nodes) {
        this.nodes.forEach(node => {
          node.removeEventListener('dragover', this.handleDragOver, false);
          node.removeEventListener('dragleave', this.handleDragLeave, false);
          node.removeEventListener('drop', this.handleDrop, false);
        });
      }
    };

    this.type = 'acquirer';
    this.id = this.opts.id || 'DropTarget';
    this.title = 'Drop Target'; // Default options

    const defaultOpts = {
      target: null
    }; // Merge default options with the ones set by user

    this.opts = { ...defaultOpts,
      ...opts
    };
    this.removeDragOverClassTimeout = null;
  }

  install() {
    this.setPluginState({
      isDraggingOver: false
    });
    this.addListeners();
  }

  uninstall() {
    this.removeListeners();
  }

}, _class.VERSION = "1.1.1", _temp);

},{"./../../core/lib/BasePlugin":44,"./../../utils/lib/getDroppedFiles":157,"./../../utils/lib/toArray":180}],78:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  Provider
} = require('./../../companion-client');

const {
  ProviderViews
} = require('./../../provider-views');

const {
  h
} = require('preact');

const locale = require('./locale');

module.exports = (_temp = _class = class Dropbox extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'Dropbox';
    Provider.initPlugin(this, opts);
    this.title = this.opts.title || 'Dropbox';

    this.icon = () => h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "32",
      height: "32",
      viewBox: "0 0 32 32"
    }, h("g", {
      fill: "none",
      fillRule: "evenodd"
    }, h("rect", {
      className: "uppy-ProviderIconBg",
      fill: "#0D2481",
      width: "32",
      height: "32",
      rx: "16"
    }), h("path", {
      d: "M11 8l5 3.185-5 3.186-5-3.186L11 8zm10 0l5 3.185-5 3.186-5-3.186L21 8zM6 17.556l5-3.185 5 3.185-5 3.186-5-3.186zm15-3.185l5 3.185-5 3.186-5-3.186 5-3.185zm-10 7.432l5-3.185 5 3.185-5 3.186-5-3.186z",
      fill: "#FFF",
      fillRule: "nonzero"
    })));

    this.provider = new Provider(uppy, {
      companionUrl: this.opts.companionUrl,
      companionHeaders: this.opts.companionHeaders,
      companionKeysParams: this.opts.companionKeysParams,
      companionCookiesRule: this.opts.companionCookiesRule,
      provider: 'dropbox',
      pluginId: this.id
    });
    this.defaultLocale = locale;
    this.i18nInit();
    this.title = this.i18n('pluginNameDropbox');
    this.onFirstRender = this.onFirstRender.bind(this);
    this.render = this.render.bind(this);
  }

  install() {
    this.view = new ProviderViews(this, {
      provider: this.provider
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.view.tearDown();
    this.unmount();
  }

  onFirstRender() {
    return Promise.all([this.provider.fetchPreAuthToken(), this.view.getFolder()]);
  }

  render(state) {
    return this.view.render(state);
  }

}, _class.VERSION = "2.0.4", _temp);

},{"./../../companion-client":42,"./../../core":48,"./../../provider-views":120,"./locale":79,"preact":18}],79:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    pluginNameDropbox: 'Dropbox'
  }
};

},{}],80:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  Provider
} = require('./../../companion-client');

const {
  ProviderViews
} = require('./../../provider-views');

const {
  h
} = require('preact');

const locale = require('./locale.js');

module.exports = (_temp = _class = class Facebook extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'Facebook';
    Provider.initPlugin(this, opts);
    this.title = this.opts.title || 'Facebook';

    this.icon = () => h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "32",
      height: "32",
      viewBox: "0 0 32 32"
    }, h("g", {
      fill: "none",
      fillRule: "evenodd"
    }, h("rect", {
      className: "uppy-ProviderIconBg",
      width: "32",
      height: "32",
      rx: "16",
      fill: "#3C5A99"
    }), h("path", {
      d: "M17.842 26v-8.667h2.653l.398-3.377h-3.051v-2.157c0-.978.248-1.644 1.527-1.644H21V7.132A19.914 19.914 0 0 0 18.623 7c-2.352 0-3.963 1.574-3.963 4.465v2.49H12v3.378h2.66V26h3.182z",
      fill: "#FFF",
      fillRule: "nonzero"
    })));

    this.provider = new Provider(uppy, {
      companionUrl: this.opts.companionUrl,
      companionHeaders: this.opts.companionHeaders,
      companionKeysParams: this.opts.companionKeysParams,
      companionCookiesRule: this.opts.companionCookiesRule,
      provider: 'facebook',
      pluginId: this.id
    });
    this.defaultLocale = locale;
    this.i18nInit();
    this.title = this.i18n('pluginNameFacebook');
    this.onFirstRender = this.onFirstRender.bind(this);
    this.render = this.render.bind(this);
  }

  install() {
    this.view = new ProviderViews(this, {
      provider: this.provider
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.view.tearDown();
    this.unmount();
  }

  onFirstRender() {
    return Promise.all([this.provider.fetchPreAuthToken(), this.view.getFolder()]);
  }

  render(state) {
    const viewOptions = {};

    if (this.getPluginState().files.length && !this.getPluginState().folders.length) {
      viewOptions.viewType = 'grid';
      viewOptions.showFilter = false;
      viewOptions.showTitles = false;
    }

    return this.view.render(state, viewOptions);
  }

}, _class.VERSION = "2.0.4", _temp);

},{"./../../companion-client":42,"./../../core":48,"./../../provider-views":120,"./locale.js":81,"preact":18}],81:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    pluginNameFacebook: 'Facebook'
  }
};

},{}],82:[function(require,module,exports){
"use strict";

const indexedDB = typeof window !== 'undefined' && (window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB);
const isSupported = !!indexedDB;
const DB_NAME = 'uppy-blobs';
const STORE_NAME = 'files'; // maybe have a thumbnail store in the future

const DEFAULT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

const DB_VERSION = 3; // Set default `expires` dates on existing stored blobs.

function migrateExpiration(store) {
  const request = store.openCursor();

  request.onsuccess = event => {
    const cursor = event.target.result;

    if (!cursor) {
      return;
    }

    const entry = cursor.value;
    entry.expires = Date.now() + DEFAULT_EXPIRY;
    cursor.update(entry);
  };
}

function connect(dbName) {
  const request = indexedDB.open(dbName, DB_VERSION);
  return new Promise((resolve, reject) => {
    request.onupgradeneeded = event => {
      const db = event.target.result;
      const {
        transaction
      } = event.currentTarget;

      if (event.oldVersion < 2) {
        // Added in v2: DB structure changed to a single shared object store
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id'
        });
        store.createIndex('store', 'store', {
          unique: false
        });
      }

      if (event.oldVersion < 3) {
        // Added in v3
        const store = transaction.objectStore(STORE_NAME);
        store.createIndex('expires', 'expires', {
          unique: false
        });
        migrateExpiration(store);
      }

      transaction.oncomplete = () => {
        resolve(db);
      };
    };

    request.onsuccess = event => {
      resolve(event.target.result);
    };

    request.onerror = reject;
  });
}

function waitForRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = event => {
      resolve(event.target.result);
    };

    request.onerror = reject;
  });
}

let cleanedUp = false;

class IndexedDBStore {
  constructor(opts) {
    this.opts = {
      dbName: DB_NAME,
      storeName: 'default',
      expires: DEFAULT_EXPIRY,
      // 24 hours
      maxFileSize: 10 * 1024 * 1024,
      // 10 MB
      maxTotalSize: 300 * 1024 * 1024,
      // 300 MB
      ...opts
    };
    this.name = this.opts.storeName;

    const createConnection = () => {
      return connect(this.opts.dbName);
    };

    if (!cleanedUp) {
      cleanedUp = true;
      this.ready = IndexedDBStore.cleanup().then(createConnection, createConnection);
    } else {
      this.ready = createConnection();
    }
  }

  key(fileID) {
    return `${this.name}!${fileID}`;
  }
  /**
   * List all file blobs currently in the store.
   */


  list() {
    return this.ready.then(db => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.index('store').getAll(IDBKeyRange.only(this.name));
      return waitForRequest(request);
    }).then(files => {
      const result = {};
      files.forEach(file => {
        result[file.fileID] = file.data;
      });
      return result;
    });
  }
  /**
   * Get one file blob from the store.
   */


  get(fileID) {
    return this.ready.then(db => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const request = transaction.objectStore(STORE_NAME).get(this.key(fileID));
      return waitForRequest(request);
    }).then(result => ({
      id: result.data.fileID,
      data: result.data.data
    }));
  }
  /**
   * Get the total size of all stored files.
   *
   * @private
   */


  getSize() {
    return this.ready.then(db => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.index('store').openCursor(IDBKeyRange.only(this.name));
      return new Promise((resolve, reject) => {
        let size = 0;

        request.onsuccess = event => {
          const cursor = event.target.result;

          if (cursor) {
            size += cursor.value.data.size;
            cursor.continue();
          } else {
            resolve(size);
          }
        };

        request.onerror = () => {
          reject(new Error('Could not retrieve stored blobs size'));
        };
      });
    });
  }
  /**
   * Save a file in the store.
   */


  put(file) {
    if (file.data.size > this.opts.maxFileSize) {
      return Promise.reject(new Error('File is too big to store.'));
    }

    return this.getSize().then(size => {
      if (size > this.opts.maxTotalSize) {
        return Promise.reject(new Error('No space left'));
      }

      return this.ready;
    }).then(db => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const request = transaction.objectStore(STORE_NAME).add({
        id: this.key(file.id),
        fileID: file.id,
        store: this.name,
        expires: Date.now() + this.opts.expires,
        data: file.data
      });
      return waitForRequest(request);
    });
  }
  /**
   * Delete a file blob from the store.
   */


  delete(fileID) {
    return this.ready.then(db => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const request = transaction.objectStore(STORE_NAME).delete(this.key(fileID));
      return waitForRequest(request);
    });
  }
  /**
   * Delete all stored blobs that have an expiry date that is before Date.now().
   * This is a static method because it deletes expired blobs from _all_ Uppy instances.
   */


  static cleanup() {
    return connect(DB_NAME).then(db => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.index('expires').openCursor(IDBKeyRange.upperBound(Date.now()));
      return new Promise((resolve, reject) => {
        request.onsuccess = event => {
          const cursor = event.target.result;

          if (cursor) {
            cursor.delete(); // Ignoring return value … it's not terrible if this goes wrong.

            cursor.continue();
          } else {
            resolve(db);
          }
        };

        request.onerror = reject;
      });
    }).then(db => {
      db.close();
    });
  }

}

IndexedDBStore.isSupported = isSupported;
module.exports = IndexedDBStore;

},{}],83:[function(require,module,exports){
"use strict";

/**
 * Get uppy instance IDs for which state is stored.
 */
function findUppyInstances() {
  const instances = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (/^uppyState:/.test(key)) {
      instances.push(key.slice('uppyState:'.length));
    }
  }

  return instances;
}
/**
 * Try to JSON-parse a string, return null on failure.
 */


function maybeParse(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    return null;
  }
}

let cleanedUp = false;
module.exports = class MetaDataStore {
  constructor(opts) {
    this.opts = {
      expires: 24 * 60 * 60 * 1000,
      // 24 hours
      ...opts
    };
    this.name = `uppyState:${opts.storeName}`;

    if (!cleanedUp) {
      cleanedUp = true;
      MetaDataStore.cleanup();
    }
  }
  /**
   *
   */


  load() {
    const savedState = localStorage.getItem(this.name);
    if (!savedState) return null;
    const data = maybeParse(savedState);
    if (!data) return null; // Upgrade pre-0.20.0 uppyState: it used to be just a flat object,
    // without `expires`.

    if (!data.metadata) {
      this.save(data);
      return data;
    }

    return data.metadata;
  }

  save(metadata) {
    const expires = Date.now() + this.opts.expires;
    const state = JSON.stringify({
      metadata,
      expires
    });
    localStorage.setItem(this.name, state);
  }
  /**
   * Remove all expired state.
   */


  static cleanup(instanceID) {
    if (instanceID) {
      localStorage.removeItem(`uppyState:${instanceID}`);
      return;
    }

    const instanceIDs = findUppyInstances();
    const now = Date.now();
    instanceIDs.forEach(id => {
      const data = localStorage.getItem(`uppyState:${id}`);
      if (!data) return null;
      const obj = maybeParse(data);
      if (!obj) return null;

      if (obj.expires && obj.expires < now) {
        localStorage.removeItem(`uppyState:${id}`);
      }
    });
  }

};

},{}],84:[function(require,module,exports){
"use strict";

/*eslint-disable */
const isSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

function waitForServiceWorker() {
  return new Promise((resolve, reject) => {
    if (!isSupported) {
      reject(new Error('Unsupported'));
    } else if (navigator.serviceWorker.controller) {
      // A serviceWorker is already registered and active.
      resolve();
    } else {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve();
      });
    }
  });
}

class ServiceWorkerStore {
  constructor(opts) {
    this.ready = waitForServiceWorker();
    this.name = opts.storeName;
  }

  list() {
    const defer = {};
    const promise = new Promise((resolve, reject) => {
      defer.resolve = resolve;
      defer.reject = reject;
    });
    console.log('Loading stored blobs from Service Worker');

    const onMessage = event => {
      if (event.data.store !== this.name) {
        return;
      }

      switch (event.data.type) {
        case 'uppy/ALL_FILES':
          defer.resolve(event.data.files);
          navigator.serviceWorker.removeEventListener('message', onMessage);
          break;

        default:
          defer.reject();
      }
    };

    this.ready.then(() => {
      navigator.serviceWorker.addEventListener('message', onMessage);
      navigator.serviceWorker.controller.postMessage({
        type: 'uppy/GET_FILES',
        store: this.name
      });
    });
    return promise;
  }

  put(file) {
    return this.ready.then(() => {
      navigator.serviceWorker.controller.postMessage({
        type: 'uppy/ADD_FILE',
        store: this.name,
        file: file
      });
    });
  }

  delete(fileID) {
    return this.ready.then(() => {
      navigator.serviceWorker.controller.postMessage({
        type: 'uppy/REMOVE_FILE',
        store: this.name,
        fileID: fileID
      });
    });
  }

}

ServiceWorkerStore.isSupported = isSupported;
module.exports = ServiceWorkerStore;

},{}],85:[function(require,module,exports){
"use strict";

var _class, _temp;

const throttle = require('lodash.throttle');

const BasePlugin = require('./../../core/lib/BasePlugin');

const ServiceWorkerStore = require('./ServiceWorkerStore');

const IndexedDBStore = require('./IndexedDBStore');

const MetaDataStore = require('./MetaDataStore');
/**
 * The GoldenRetriever plugin — restores selected files and resumes uploads
 * after a closed tab or a browser crash!
 *
 * Uses localStorage, IndexedDB and ServiceWorker to do its magic, read more:
 * https://uppy.io/blog/2017/07/golden-retriever/
 */


module.exports = (_temp = _class = class GoldenRetriever extends BasePlugin {
  constructor(uppy, opts) {
    super(uppy, opts);

    this.addBlobToStores = file => {
      if (file.isRemote) return;

      if (this.ServiceWorkerStore) {
        this.ServiceWorkerStore.put(file).catch(err => {
          this.uppy.log('[GoldenRetriever] Could not store file', 'warning');
          this.uppy.log(err);
        });
      }

      this.IndexedDBStore.put(file).catch(err => {
        this.uppy.log('[GoldenRetriever] Could not store file', 'warning');
        this.uppy.log(err);
      });
    };

    this.removeBlobFromStores = file => {
      if (this.ServiceWorkerStore) {
        this.ServiceWorkerStore.delete(file.id).catch(err => {
          this.uppy.log('[GoldenRetriever] Failed to remove file', 'warning');
          this.uppy.log(err);
        });
      }

      this.IndexedDBStore.delete(file.id).catch(err => {
        this.uppy.log('[GoldenRetriever] Failed to remove file', 'warning');
        this.uppy.log(err);
      });
    };

    this.replaceBlobInStores = file => {
      this.removeBlobFromStores(file);
      this.addBlobToStores(file);
    };

    this.handleRestoreConfirmed = () => {
      this.uppy.log('[GoldenRetriever] Restore confirmed, proceeding...'); // start all uploads again when file blobs are restored

      const {
        currentUploads
      } = this.uppy.getState();

      if (currentUploads) {
        Object.keys(currentUploads).forEach(uploadId => {
          this.uppy.restore(uploadId, currentUploads[uploadId]);
        });
        this.uppy.resumeAll();
      }

      this.uppy.upload();
      this.uppy.setState({
        recoveredState: null
      });
    };

    this.abortRestore = () => {
      this.uppy.log('[GoldenRetriever] Aborting restore...');
      const fileIDs = Object.keys(this.uppy.getState().files);
      this.deleteBlobs(fileIDs).then(() => {
        this.uppy.log(`[GoldenRetriever] Removed ${fileIDs.length} files`);
      }).catch(err => {
        this.uppy.log(`[GoldenRetriever] Could not remove ${fileIDs.length} files`, 'warning');
        this.uppy.log(err);
      });
      this.uppy.cancelAll();
      this.uppy.setState({
        recoveredState: null
      });
      MetaDataStore.cleanup(this.uppy.opts.id);
    };

    this.handleComplete = ({
      successful
    }) => {
      const fileIDs = successful.map(file => file.id);
      this.deleteBlobs(fileIDs).then(() => {
        this.uppy.log(`[GoldenRetriever] Removed ${successful.length} files that finished uploading`);
      }).catch(err => {
        this.uppy.log(`[GoldenRetriever] Could not remove ${successful.length} files that finished uploading`, 'warning');
        this.uppy.log(err);
      });
      this.uppy.setState({
        recoveredState: null
      });
      MetaDataStore.cleanup(this.uppy.opts.id);
    };

    this.restoreBlobs = () => {
      if (this.uppy.getFiles().length > 0) {
        Promise.all([this.loadFileBlobsFromServiceWorker(), this.loadFileBlobsFromIndexedDB()]).then(resultingArrayOfObjects => {
          const blobs = { ...resultingArrayOfObjects[0],
            ...resultingArrayOfObjects[1]
          };
          this.onBlobsLoaded(blobs);
        });
      } else {
        this.uppy.log('[GoldenRetriever] No files need to be loaded, only restoring processing state...');
        this.onBlobsLoaded([]);
      }
    };

    this.type = 'debugger';
    this.id = this.opts.id || 'GoldenRetriever';
    this.title = 'Golden Retriever';
    const defaultOptions = {
      expires: 24 * 60 * 60 * 1000,
      // 24 hours
      serviceWorker: false
    };
    this.opts = { ...defaultOptions,
      ...opts
    };
    this.MetaDataStore = new MetaDataStore({
      expires: this.opts.expires,
      storeName: uppy.getID()
    });
    this.ServiceWorkerStore = null;

    if (this.opts.serviceWorker) {
      this.ServiceWorkerStore = new ServiceWorkerStore({
        storeName: uppy.getID()
      });
    }

    this.IndexedDBStore = new IndexedDBStore({
      expires: this.opts.expires,
      ...(this.opts.indexedDB || {}),
      storeName: uppy.getID()
    });
    this.saveFilesStateToLocalStorage = throttle(this.saveFilesStateToLocalStorage.bind(this), 500, {
      leading: true,
      trailing: true
    });
    this.restoreState = this.restoreState.bind(this);
    this.loadFileBlobsFromServiceWorker = this.loadFileBlobsFromServiceWorker.bind(this);
    this.loadFileBlobsFromIndexedDB = this.loadFileBlobsFromIndexedDB.bind(this);
    this.onBlobsLoaded = this.onBlobsLoaded.bind(this);
  }

  restoreState() {
    const savedState = this.MetaDataStore.load();

    if (savedState) {
      this.uppy.log('[GoldenRetriever] Recovered some state from Local Storage');
      this.uppy.setState({
        currentUploads: savedState.currentUploads || {},
        files: savedState.files || {},
        recoveredState: savedState
      });
      this.savedPluginData = savedState.pluginData;
    }
  }
  /**
   * Get file objects that are currently waiting: they've been selected,
   * but aren't yet being uploaded.
   */


  getWaitingFiles() {
    const waitingFiles = {};
    this.uppy.getFiles().forEach(file => {
      if (!file.progress || !file.progress.uploadStarted) {
        waitingFiles[file.id] = file;
      }
    });
    return waitingFiles;
  }
  /**
   * Get file objects that are currently being uploaded. If a file has finished
   * uploading, but the other files in the same batch have not, the finished
   * file is also returned.
   */


  getUploadingFiles() {
    const uploadingFiles = {};
    const {
      currentUploads
    } = this.uppy.getState();

    if (currentUploads) {
      const uploadIDs = Object.keys(currentUploads);
      uploadIDs.forEach(uploadID => {
        const filesInUpload = currentUploads[uploadID].fileIDs;
        filesInUpload.forEach(fileID => {
          uploadingFiles[fileID] = this.uppy.getFile(fileID);
        });
      });
    }

    return uploadingFiles;
  }

  saveFilesStateToLocalStorage() {
    const filesToSave = { ...this.getWaitingFiles(),
      ...this.getUploadingFiles()
    }; // If all files have been removed by the user, clear recovery state

    if (Object.keys(filesToSave).length === 0) {
      this.uppy.setState({
        recoveredState: null
      });
      MetaDataStore.cleanup(this.uppy.opts.id);
      return;
    } // We dont’t need to store file.data on local files, because the actual blob will be restored later,
    // and we want to avoid having weird properties in the serialized object.
    // Also adding file.isRestored to all files, since they will be restored from local storage


    const filesToSaveWithoutData = {};
    Object.keys(filesToSave).forEach(file => {
      if (filesToSave[file].isRemote) {
        filesToSaveWithoutData[file] = { ...filesToSave[file],
          isRestored: true
        };
      } else {
        filesToSaveWithoutData[file] = { ...filesToSave[file],
          isRestored: true,
          data: null,
          preview: null
        };
      }
    });
    const pluginData = {}; // TODO Find a better way to do this?
    // Other plugins can attach a restore:get-data listener that receives this callback.
    // Plugins can then use this callback (sync) to provide data to be stored.

    this.uppy.emit('restore:get-data', data => {
      Object.assign(pluginData, data);
    });
    const {
      currentUploads
    } = this.uppy.getState();
    this.MetaDataStore.save({
      currentUploads,
      files: filesToSaveWithoutData,
      pluginData
    });
  }

  loadFileBlobsFromServiceWorker() {
    if (!this.ServiceWorkerStore) {
      return Promise.resolve({});
    }

    return this.ServiceWorkerStore.list().then(blobs => {
      const files = this.uppy.getFiles();
      const localFilesOnly = files.filter(file => {
        // maybe && !file.progress.uploadComplete
        return !file.isRemote;
      });
      const numberOfFilesRecovered = Object.keys(blobs).length;
      const numberOfFilesTryingToRecover = localFilesOnly.length;

      if (numberOfFilesRecovered === numberOfFilesTryingToRecover) {
        this.uppy.log(`[GoldenRetriever] Successfully recovered ${numberOfFilesRecovered} blobs from Service Worker!`);
        return blobs;
      }

      this.uppy.log('[GoldenRetriever] No blobs found in Service Worker, trying IndexedDB now...');
      return {};
    }).catch(err => {
      this.uppy.log('[GoldenRetriever] Failed to recover blobs from Service Worker', 'warning');
      this.uppy.log(err);
      return {};
    });
  }

  loadFileBlobsFromIndexedDB() {
    return this.IndexedDBStore.list().then(blobs => {
      const numberOfFilesRecovered = Object.keys(blobs).length;

      if (numberOfFilesRecovered > 0) {
        this.uppy.log(`[GoldenRetriever] Successfully recovered ${numberOfFilesRecovered} blobs from IndexedDB!`);
        return blobs;
      }

      this.uppy.log('[GoldenRetriever] No blobs found in IndexedDB');
      return {};
    }).catch(err => {
      this.uppy.log('[GoldenRetriever] Failed to recover blobs from IndexedDB', 'warning');
      this.uppy.log(err);
      return {};
    });
  }

  onBlobsLoaded(blobs) {
    const obsoleteBlobs = [];
    const updatedFiles = { ...this.uppy.getState().files
    }; // Loop through blobs that we can restore, add blobs to file objects

    Object.keys(blobs).forEach(fileID => {
      const originalFile = this.uppy.getFile(fileID);

      if (!originalFile) {
        obsoleteBlobs.push(fileID);
        return;
      }

      const cachedData = blobs[fileID];
      const updatedFileData = {
        data: cachedData,
        isRestored: true,
        isGhost: false
      };
      updatedFiles[fileID] = { ...originalFile,
        ...updatedFileData
      };
    }); // Loop through files that we can’t restore fully — we only have meta, not blobs,
    // set .isGhost on them, also set isRestored to all files

    Object.keys(updatedFiles).forEach(fileID => {
      if (updatedFiles[fileID].data === null) {
        updatedFiles[fileID] = { ...updatedFiles[fileID],
          isGhost: true
        };
      }
    });
    this.uppy.setState({
      files: updatedFiles
    });
    this.uppy.emit('restored', this.savedPluginData);

    if (obsoleteBlobs.length) {
      this.deleteBlobs(obsoleteBlobs).then(() => {
        this.uppy.log(`[GoldenRetriever] Cleaned up ${obsoleteBlobs.length} old files`);
      }).catch(err => {
        this.uppy.log(`[GoldenRetriever] Could not clean up ${obsoleteBlobs.length} old files`, 'warning');
        this.uppy.log(err);
      });
    }
  }

  deleteBlobs(fileIDs) {
    const promises = [];
    fileIDs.forEach(id => {
      if (this.ServiceWorkerStore) {
        promises.push(this.ServiceWorkerStore.delete(id));
      }

      if (this.IndexedDBStore) {
        promises.push(this.IndexedDBStore.delete(id));
      }
    });
    return Promise.all(promises);
  }

  install() {
    this.restoreState();
    this.restoreBlobs();
    this.uppy.on('file-added', this.addBlobToStores);
    this.uppy.on('file-editor:complete', this.replaceBlobInStores);
    this.uppy.on('file-removed', this.removeBlobFromStores);
    this.uppy.on('state-update', this.saveFilesStateToLocalStorage);
    this.uppy.on('restore-confirmed', this.handleRestoreConfirmed);
    this.uppy.on('restore-canceled', this.abortRestore);
    this.uppy.on('complete', this.handleComplete);
  }

  uninstall() {
    this.uppy.off('file-added', this.addBlobToStores);
    this.uppy.off('file-editor:complete', this.replaceBlobInStores);
    this.uppy.off('file-removed', this.removeBlobFromStores);
    this.uppy.off('state-update', this.saveFilesStateToLocalStorage);
    this.uppy.off('restore-confirmed', this.handleRestoreConfirmed);
    this.uppy.off('restore-canceled', this.abortRestore);
    this.uppy.off('complete', this.handleComplete);
  }

}, _class.VERSION = "2.0.5", _temp);

},{"./../../core/lib/BasePlugin":44,"./IndexedDBStore":82,"./MetaDataStore":83,"./ServiceWorkerStore":84,"lodash.throttle":11}],86:[function(require,module,exports){
"use strict";

const {
  ProviderViews
} = require('./../../provider-views');

module.exports = class DriveProviderViews extends ProviderViews {
  toggleCheckbox(e, file) {
    e.stopPropagation();
    e.preventDefault(); // Shared Drives aren't selectable; for all else, defer to the base ProviderView.

    if (!file.custom.isSharedDrive) {
      super.toggleCheckbox(e, file);
    }
  }

};

},{"./../../provider-views":120}],87:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  Provider
} = require('./../../companion-client');

const {
  h
} = require('preact');

const DriveProviderViews = require('./DriveProviderViews');

const locale = require('./locale');

module.exports = (_temp = _class = class GoogleDrive extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'GoogleDrive';
    this.title = this.opts.title || 'Google Drive';
    Provider.initPlugin(this, opts);
    this.title = this.opts.title || 'Google Drive';

    this.icon = () => h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "32",
      height: "32",
      viewBox: "0 0 32 32"
    }, h("g", {
      fill: "none",
      fillRule: "evenodd"
    }, h("rect", {
      className: "uppy-ProviderIconBg",
      fill: "#4285F4",
      width: "32",
      height: "32",
      rx: "16"
    }), h("path", {
      d: "M25.216 17.736L19.043 7h-6.086l6.175 10.736h6.084zm-11.275.896L10.9 24h11.723l3.04-5.368H13.942zm-1.789-10.29l-5.816 10.29L9.38 24l5.905-10.29-3.132-5.369z",
      fill: "#FFF"
    })));

    this.provider = new Provider(uppy, {
      companionUrl: this.opts.companionUrl,
      companionHeaders: this.opts.companionHeaders,
      companionKeysParams: this.opts.companionKeysParams,
      companionCookiesRule: this.opts.companionCookiesRule,
      provider: 'drive',
      pluginId: this.id
    });
    this.defaultLocale = locale;
    this.i18nInit();
    this.title = this.i18n('pluginNameGoogleDrive');
    this.onFirstRender = this.onFirstRender.bind(this);
    this.render = this.render.bind(this);
  }

  install() {
    this.view = new DriveProviderViews(this, {
      provider: this.provider
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.view.tearDown();
    this.unmount();
  }

  onFirstRender() {
    return Promise.all([this.provider.fetchPreAuthToken(), this.view.getFolder('root', '/')]);
  }

  render(state) {
    return this.view.render(state);
  }

}, _class.VERSION = "2.0.4", _temp);

},{"./../../companion-client":42,"./../../core":48,"./DriveProviderViews":86,"./locale":88,"preact":18}],88:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    pluginNameGoogleDrive: 'Google Drive'
  }
};

},{}],89:[function(require,module,exports){
"use strict";

const CropperImport = require('cropperjs');

const {
  h,
  Component
} = require('preact'); // @TODO A silly hack that we can get rid of when moving to ESM.
// eslint-disable-next-line no-underscore-dangle


const Cropper = CropperImport.__esModule ? CropperImport.default : CropperImport;
module.exports = class Editor extends Component {
  constructor(props) {
    super(props);

    this.save = () => {
      const {
        opts,
        save,
        currentImage
      } = this.props;
      this.cropper.getCroppedCanvas(opts.cropperOptions.croppedCanvasOptions).toBlob(blob => save(blob), currentImage.type, opts.quality);
    };

    this.granularRotateOnChange = ev => {
      const {
        rotationAngle,
        rotationDelta
      } = this.state;
      const pendingRotationDelta = Number(ev.target.value) - rotationDelta;
      cancelAnimationFrame(this.granularRotateOnInputNextFrame);

      if (pendingRotationDelta !== 0) {
        const pendingRotationAngle = rotationAngle + pendingRotationDelta;
        this.granularRotateOnInputNextFrame = requestAnimationFrame(() => {
          this.cropper.rotateTo(pendingRotationAngle);
        });
      }
    };

    this.state = {
      rotationAngle: 0,
      rotationDelta: 0
    };
  }

  componentDidMount() {
    const {
      opts,
      storeCropperInstance
    } = this.props;
    this.cropper = new Cropper(this.imgElement, opts.cropperOptions);
    storeCropperInstance(this.cropper);

    if (opts.actions.granularRotate) {
      this.imgElement.addEventListener('crop', ev => {
        const rotationAngle = ev.detail.rotate;
        this.setState({
          rotationAngle,
          // 405 == 360 + 45
          rotationDelta: (rotationAngle + 405) % 90 - 45
        });
      });
    }
  }

  componentWillUnmount() {
    this.cropper.destroy();
  }

  renderGranularRotate() {
    const {
      i18n
    } = this.props;
    const {
      rotationDelta,
      rotationAngle
    } = this.state;
    return (// eslint-disable-next-line jsx-a11y/label-has-associated-control
      h("label", {
        "data-microtip-position": "top",
        role: "tooltip",
        "aria-label": `${rotationAngle}º`,
        className: "uppy-ImageCropper-rangeWrapper uppy-u-reset"
      }, h("input", {
        className: "uppy-ImageCropper-range uppy-u-reset",
        type: "range",
        onInput: this.granularRotateOnChange,
        onChange: this.granularRotateOnChange,
        value: rotationDelta,
        min: "-45",
        max: "44",
        "aria-label": i18n('rotate')
      }))
    );
  }

  renderRevert() {
    const {
      i18n
    } = this.props;
    return h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn",
      "aria-label": i18n('revert'),
      "data-microtip-position": "top",
      onClick: () => {
        this.cropper.reset();
        this.cropper.setAspectRatio(0);
      }
    }, h("svg", {
      "aria-hidden": "true",
      className: "uppy-c-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, h("path", {
      d: "M0 0h24v24H0z",
      fill: "none"
    }), h("path", {
      d: "M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"
    })));
  }

  renderRotate() {
    const {
      i18n
    } = this.props;
    return h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn",
      onClick: () => this.cropper.rotate(-90),
      "aria-label": i18n('rotate'),
      "data-microtip-position": "top"
    }, h("svg", {
      "aria-hidden": "true",
      className: "uppy-c-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, h("path", {
      d: "M0 0h24v24H0V0zm0 0h24v24H0V0z",
      fill: "none"
    }), h("path", {
      d: "M14 10a2 2 0 012 2v7a2 2 0 01-2 2H6a2 2 0 01-2-2v-7a2 2 0 012-2h8zm0 1.75H6a.25.25 0 00-.243.193L5.75 12v7a.25.25 0 00.193.243L6 19.25h8a.25.25 0 00.243-.193L14.25 19v-7a.25.25 0 00-.193-.243L14 11.75zM12 .76V4c2.3 0 4.61.88 6.36 2.64a8.95 8.95 0 012.634 6.025L21 13a1 1 0 01-1.993.117L19 13h-.003a6.979 6.979 0 00-2.047-4.95 6.97 6.97 0 00-4.652-2.044L12 6v3.24L7.76 5 12 .76z"
    })));
  }

  renderFlip() {
    const {
      i18n
    } = this.props;
    return h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn",
      "aria-label": i18n('flipHorizontal'),
      "data-microtip-position": "top",
      onClick: () => this.cropper.scaleX(-this.cropper.getData().scaleX || -1)
    }, h("svg", {
      "aria-hidden": "true",
      className: "uppy-c-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, h("path", {
      d: "M0 0h24v24H0z",
      fill: "none"
    }), h("path", {
      d: "M15 21h2v-2h-2v2zm4-12h2V7h-2v2zM3 5v14c0 1.1.9 2 2 2h4v-2H5V5h4V3H5c-1.1 0-2 .9-2 2zm16-2v2h2c0-1.1-.9-2-2-2zm-8 20h2V1h-2v22zm8-6h2v-2h-2v2zM15 5h2V3h-2v2zm4 8h2v-2h-2v2zm0 8c1.1 0 2-.9 2-2h-2v2z"
    })));
  }

  renderZoomIn() {
    const {
      i18n
    } = this.props;
    return h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn",
      "aria-label": i18n('zoomIn'),
      "data-microtip-position": "top",
      onClick: () => this.cropper.zoom(0.1)
    }, h("svg", {
      "aria-hidden": "true",
      className: "uppy-c-icon",
      height: "24",
      viewBox: "0 0 24 24",
      width: "24"
    }, h("path", {
      d: "M0 0h24v24H0V0z",
      fill: "none"
    }), h("path", {
      d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
    }), h("path", {
      d: "M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"
    })));
  }

  renderZoomOut() {
    const {
      i18n
    } = this.props;
    return h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn",
      "aria-label": i18n('zoomOut'),
      "data-microtip-position": "top",
      onClick: () => this.cropper.zoom(-0.1)
    }, h("svg", {
      "aria-hidden": "true",
      className: "uppy-c-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, h("path", {
      d: "M0 0h24v24H0V0z",
      fill: "none"
    }), h("path", {
      d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z"
    })));
  }

  renderCropSquare() {
    const {
      i18n
    } = this.props;
    return h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn",
      "aria-label": i18n('aspectRatioSquare'),
      "data-microtip-position": "top",
      onClick: () => this.cropper.setAspectRatio(1)
    }, h("svg", {
      "aria-hidden": "true",
      className: "uppy-c-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, h("path", {
      d: "M0 0h24v24H0z",
      fill: "none"
    }), h("path", {
      d: "M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
    })));
  }

  renderCropWidescreen() {
    const {
      i18n
    } = this.props;
    return h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn",
      "aria-label": i18n('aspectRatioLandscape'),
      "data-microtip-position": "top",
      onClick: () => this.cropper.setAspectRatio(16 / 9)
    }, h("svg", {
      "aria-hidden": "true",
      className: "uppy-c-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, h("path", {
      d: "M 19,4.9999992 V 17.000001 H 4.9999998 V 6.9999992 H 19 m 0,-2 H 4.9999998 c -1.0999999,0 -1.9999999,0.9000001 -1.9999999,2 V 17.000001 c 0,1.1 0.9,2 1.9999999,2 H 19 c 1.1,0 2,-0.9 2,-2 V 6.9999992 c 0,-1.0999999 -0.9,-2 -2,-2 z"
    }), h("path", {
      fill: "none",
      d: "M0 0h24v24H0z"
    })));
  }

  renderCropWidescreenVertical() {
    const {
      i18n
    } = this.props;
    return h("button", {
      type: "button",
      className: "uppy-u-reset uppy-c-btn",
      "aria-label": i18n('aspectRatioPortrait'),
      "data-microtip-position": "top",
      onClick: () => this.cropper.setAspectRatio(9 / 16)
    }, h("svg", {
      "aria-hidden": "true",
      className: "uppy-c-icon",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, h("path", {
      d: "M 19.000001,19 H 6.999999 V 5 h 10.000002 v 14 m 2,0 V 5 c 0,-1.0999999 -0.9,-1.9999999 -2,-1.9999999 H 6.999999 c -1.1,0 -2,0.9 -2,1.9999999 v 14 c 0,1.1 0.9,2 2,2 h 10.000002 c 1.1,0 2,-0.9 2,-2 z"
    }), h("path", {
      d: "M0 0h24v24H0z",
      fill: "none"
    })));
  }

  render() {
    const {
      currentImage,
      opts
    } = this.props;
    const {
      actions
    } = opts;
    const imageURL = URL.createObjectURL(currentImage.data);
    return h("div", {
      className: "uppy-ImageCropper"
    }, h("div", {
      className: "uppy-ImageCropper-container"
    }, h("img", {
      className: "uppy-ImageCropper-image",
      alt: currentImage.name,
      src: imageURL,
      ref: ref => {
        this.imgElement = ref;
      }
    })), h("div", {
      className: "uppy-ImageCropper-controls"
    }, actions.revert && this.renderRevert(), actions.rotate && this.renderRotate(), actions.granularRotate && this.renderGranularRotate(), actions.flip && this.renderFlip(), actions.zoomIn && this.renderZoomIn(), actions.zoomOut && this.renderZoomOut(), actions.cropSquare && this.renderCropSquare(), actions.cropWidescreen && this.renderCropWidescreen(), actions.cropWidescreenVertical && this.renderCropWidescreenVertical()));
  }

};

},{"cropperjs":5,"preact":18}],90:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  h
} = require('preact');

const Editor = require('./Editor');

const locale = require('./locale.js');

module.exports = (_temp = _class = class ImageEditor extends UIPlugin {
  // eslint-disable-next-line global-require
  constructor(uppy, opts) {
    super(uppy, opts);

    this.save = () => {
      const saveBlobCallback = blob => {
        const {
          currentImage
        } = this.getPluginState();
        this.uppy.setFileState(currentImage.id, {
          data: blob,
          size: blob.size,
          preview: null
        });
        const updatedFile = this.uppy.getFile(currentImage.id);
        this.uppy.emit('thumbnail:request', updatedFile);
        this.setPluginState({
          currentImage: updatedFile
        });
        this.uppy.emit('file-editor:complete', updatedFile);
      };

      const {
        currentImage
      } = this.getPluginState();
      this.cropper.getCroppedCanvas().toBlob(saveBlobCallback, currentImage.type, this.opts.quality);
    };

    this.storeCropperInstance = cropper => {
      this.cropper = cropper;
    };

    this.selectFile = file => {
      this.uppy.emit('file-editor:start', file);
      this.setPluginState({
        currentImage: file
      });
    };

    this.id = this.opts.id || 'ImageEditor';
    this.title = 'Image Editor';
    this.type = 'editor';
    this.defaultLocale = locale;
    const defaultCropperOptions = {
      viewMode: 1,
      background: false,
      autoCropArea: 1,
      responsive: true,
      croppedCanvasOptions: {}
    };
    const defaultActions = {
      revert: true,
      rotate: true,
      granularRotate: true,
      flip: true,
      zoomIn: true,
      zoomOut: true,
      cropSquare: true,
      cropWidescreen: true,
      cropWidescreenVertical: true
    };
    const defaultOptions = {
      quality: 0.8
    };
    this.opts = { ...defaultOptions,
      ...opts,
      actions: { ...defaultActions,
        ...opts.actions
      },
      cropperOptions: { ...defaultCropperOptions,
        ...opts.cropperOptions
      }
    };
    this.i18nInit();
  } // eslint-disable-next-line class-methods-use-this


  canEditFile(file) {
    if (!file.type || file.isRemote) {
      return false;
    }

    const fileTypeSpecific = file.type.split('/')[1];

    if (/^(jpe?g|gif|png|bmp|webp)$/.test(fileTypeSpecific)) {
      return true;
    }

    return false;
  }

  install() {
    this.setPluginState({
      currentImage: null
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.unmount();
  }

  render() {
    const {
      currentImage
    } = this.getPluginState();

    if (currentImage === null || currentImage.isRemote) {
      return null;
    }

    return h(Editor, {
      currentImage: currentImage,
      storeCropperInstance: this.storeCropperInstance,
      save: this.save,
      opts: this.opts,
      i18n: this.i18n
    });
  }

}, _class.VERSION = "1.0.4", _temp);

},{"./../../core":48,"./Editor":89,"./locale.js":91,"preact":18}],91:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    revert: 'Revert',
    rotate: 'Rotate',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    flipHorizontal: 'Flip horizontal',
    aspectRatioSquare: 'Crop square',
    aspectRatioLandscape: 'Crop landscape (16:9)',
    aspectRatioPortrait: 'Crop portrait (9:16)'
  }
};

},{}],92:[function(require,module,exports){
"use strict";

const {
  h,
  Component,
  createRef
} = require('preact');

const TRANSITION_MS = 300;
module.exports = class FadeIn extends Component {
  constructor(...args) {
    super(...args);
    this.ref = createRef();
  }

  componentWillEnter(callback) {
    this.ref.current.style.opacity = '1';
    this.ref.current.style.transform = 'none';
    setTimeout(callback, TRANSITION_MS);
  }

  componentWillLeave(callback) {
    this.ref.current.style.opacity = '0';
    this.ref.current.style.transform = 'translateY(350%)';
    setTimeout(callback, TRANSITION_MS);
  }

  render() {
    const {
      children
    } = this.props;
    return h("div", {
      className: "uppy-Informer-animated",
      ref: this.ref
    }, children);
  }

};

},{"preact":18}],93:[function(require,module,exports){
/* eslint-disable */

/**
 * @source https://github.com/developit/preact-transition-group
 */
'use strict';

const {
  Component,
  cloneElement,
  h,
  toChildArray
} = require('preact');

function assign(obj, props) {
  return Object.assign(obj, props);
}

function getKey(vnode, fallback) {
  var _vnode$key;

  return (_vnode$key = vnode == null ? void 0 : vnode.key) != null ? _vnode$key : fallback;
}

function linkRef(component, name) {
  const cache = component._ptgLinkedRefs || (component._ptgLinkedRefs = {});
  return cache[name] || (cache[name] = c => {
    component.refs[name] = c;
  });
}

function getChildMapping(children) {
  const out = {};

  for (let i = 0; i < children.length; i++) {
    if (children[i] != null) {
      const key = getKey(children[i], i.toString(36));
      out[key] = children[i];
    }
  }

  return out;
}

function mergeChildMappings(prev, next) {
  prev = prev || {};
  next = next || {};

  const getValueForKey = key => next.hasOwnProperty(key) ? next[key] : prev[key]; // For each key of `next`, the list of keys to insert before that key in
  // the combined list


  const nextKeysPending = {};
  let pendingKeys = [];

  for (const prevKey in prev) {
    if (next.hasOwnProperty(prevKey)) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = pendingKeys;
        pendingKeys = [];
      }
    } else {
      pendingKeys.push(prevKey);
    }
  }

  const childMapping = {};

  for (const nextKey in next) {
    if (nextKeysPending.hasOwnProperty(nextKey)) {
      for (let i = 0; i < nextKeysPending[nextKey].length; i++) {
        const pendingNextKey = nextKeysPending[nextKey][i];
        childMapping[nextKeysPending[nextKey][i]] = getValueForKey(pendingNextKey);
      }
    }

    childMapping[nextKey] = getValueForKey(nextKey);
  } // Finally, add the keys which didn't appear before any key in `next`


  for (let i = 0; i < pendingKeys.length; i++) {
    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
  }

  return childMapping;
}

const identity = i => i;

class TransitionGroup extends Component {
  constructor(props, context) {
    super(props, context);
    this.refs = {};
    this.state = {
      children: getChildMapping(toChildArray(toChildArray(this.props.children)) || [])
    };
    this.performAppear = this.performAppear.bind(this);
    this.performEnter = this.performEnter.bind(this);
    this.performLeave = this.performLeave.bind(this);
  }

  componentWillMount() {
    this.currentlyTransitioningKeys = {};
    this.keysToAbortLeave = [];
    this.keysToEnter = [];
    this.keysToLeave = [];
  }

  componentDidMount() {
    const initialChildMapping = this.state.children;

    for (const key in initialChildMapping) {
      if (initialChildMapping[key]) {
        // this.performAppear(getKey(initialChildMapping[key], key));
        this.performAppear(key);
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    const nextChildMapping = getChildMapping(toChildArray(nextProps.children) || []);
    const prevChildMapping = this.state.children;
    this.setState(prevState => ({
      children: mergeChildMappings(prevState.children, nextChildMapping)
    }));
    let key;

    for (key in nextChildMapping) {
      if (nextChildMapping.hasOwnProperty(key)) {
        const hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key); // We should re-enter the component and abort its leave function

        if (nextChildMapping[key] && hasPrev && this.currentlyTransitioningKeys[key]) {
          this.keysToEnter.push(key);
          this.keysToAbortLeave.push(key);
        } else if (nextChildMapping[key] && !hasPrev && !this.currentlyTransitioningKeys[key]) {
          this.keysToEnter.push(key);
        }
      }
    }

    for (key in prevChildMapping) {
      if (prevChildMapping.hasOwnProperty(key)) {
        const hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);

        if (prevChildMapping[key] && !hasNext && !this.currentlyTransitioningKeys[key]) {
          this.keysToLeave.push(key);
        }
      }
    }
  }

  componentDidUpdate() {
    const {
      keysToEnter
    } = this;
    this.keysToEnter = [];
    keysToEnter.forEach(this.performEnter);
    const {
      keysToLeave
    } = this;
    this.keysToLeave = [];
    keysToLeave.forEach(this.performLeave);
  }

  _finishAbort(key) {
    const idx = this.keysToAbortLeave.indexOf(key);

    if (idx !== -1) {
      this.keysToAbortLeave.splice(idx, 1);
    }
  }

  performAppear(key) {
    this.currentlyTransitioningKeys[key] = true;
    const component = this.refs[key];

    if (component.componentWillAppear) {
      component.componentWillAppear(this._handleDoneAppearing.bind(this, key));
    } else {
      this._handleDoneAppearing(key);
    }
  }

  _handleDoneAppearing(key) {
    const component = this.refs[key];

    if (component.componentDidAppear) {
      component.componentDidAppear();
    }

    delete this.currentlyTransitioningKeys[key];

    this._finishAbort(key);

    const currentChildMapping = getChildMapping(toChildArray(this.props.children) || []);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully appeared. Remove it.
      this.performLeave(key);
    }
  }

  performEnter(key) {
    this.currentlyTransitioningKeys[key] = true;
    const component = this.refs[key];

    if (component.componentWillEnter) {
      component.componentWillEnter(this._handleDoneEntering.bind(this, key));
    } else {
      this._handleDoneEntering(key);
    }
  }

  _handleDoneEntering(key) {
    const component = this.refs[key];

    if (component.componentDidEnter) {
      component.componentDidEnter();
    }

    delete this.currentlyTransitioningKeys[key];

    this._finishAbort(key);

    const currentChildMapping = getChildMapping(toChildArray(this.props.children) || []);

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully entered. Remove it.
      this.performLeave(key);
    }
  }

  performLeave(key) {
    // If we should immediately abort this leave function,
    // don't run the leave transition at all.
    const idx = this.keysToAbortLeave.indexOf(key);

    if (idx !== -1) {
      return;
    }

    this.currentlyTransitioningKeys[key] = true;
    const component = this.refs[key];

    if (component.componentWillLeave) {
      component.componentWillLeave(this._handleDoneLeaving.bind(this, key));
    } else {
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      this._handleDoneLeaving(key);
    }
  }

  _handleDoneLeaving(key) {
    // If we should immediately abort the leave,
    // then skip this altogether
    const idx = this.keysToAbortLeave.indexOf(key);

    if (idx !== -1) {
      return;
    }

    const component = this.refs[key];

    if (component.componentDidLeave) {
      component.componentDidLeave();
    }

    delete this.currentlyTransitioningKeys[key];
    const currentChildMapping = getChildMapping(toChildArray(this.props.children) || []);

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      this.performEnter(key);
    } else {
      const children = assign({}, this.state.children);
      delete children[key];
      this.setState({
        children
      });
    }
  }

  render({
    childFactory,
    transitionLeave,
    transitionName,
    transitionAppear,
    transitionEnter,
    transitionLeaveTimeout,
    transitionEnterTimeout,
    transitionAppearTimeout,
    component,
    ...props
  }, {
    children
  }) {
    // TODO: we could get rid of the need for the wrapper node
    // by cloning a single child
    const childrenToRender = [];

    for (const key in children) {
      if (children.hasOwnProperty(key)) {
        const child = children[key];

        if (child) {
          const ref = linkRef(this, key),
                el = cloneElement(childFactory(child), {
            ref,
            key
          });
          childrenToRender.push(el);
        }
      }
    }

    return h(component, props, childrenToRender);
  }

}

TransitionGroup.defaultProps = {
  component: 'span',
  childFactory: identity
};
module.exports = TransitionGroup;

},{"preact":18}],94:[function(require,module,exports){
"use strict";

var _class, _temp;

/* eslint-disable jsx-a11y/no-noninteractive-element-interactions  */

/* eslint-disable jsx-a11y/click-events-have-key-events */
const {
  h
} = require('preact');

const {
  UIPlugin
} = require('./../../core');

const FadeIn = require('./FadeIn');

const TransitionGroup = require('./TransitionGroup');
/**
 * Informer
 * Shows rad message bubbles
 * used like this: `uppy.info('hello world', 'info', 5000)`
 * or for errors: `uppy.info('Error uploading img.jpg', 'error', 5000)`
 *
 */


module.exports = (_temp = _class = class Informer extends UIPlugin {
  // eslint-disable-next-line global-require
  constructor(uppy, opts) {
    super(uppy, opts);

    this.render = state => {
      return h("div", {
        className: "uppy uppy-Informer"
      }, h(TransitionGroup, null, state.info.map(info => h(FadeIn, {
        key: info.message
      }, h("p", {
        role: "alert"
      }, info.message, ' ', info.details && h("span", {
        "aria-label": info.details,
        "data-microtip-position": "top-left",
        "data-microtip-size": "medium",
        role: "tooltip" // eslint-disable-next-line no-alert
        ,
        onClick: () => alert(`${info.message} \n\n ${info.details}`)
      }, "?"))))));
    };

    this.type = 'progressindicator';
    this.id = this.opts.id || 'Informer';
    this.title = 'Informer'; // set default options

    const defaultOptions = {}; // merge default options with the ones set by user

    this.opts = { ...defaultOptions,
      ...opts
    };
  }

  install() {
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

}, _class.VERSION = "2.0.4", _temp);

},{"./../../core":48,"./FadeIn":92,"./TransitionGroup":93,"preact":18}],95:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  Provider
} = require('./../../companion-client');

const {
  ProviderViews
} = require('./../../provider-views');

const {
  h
} = require('preact');

const locale = require('./locale.js');

module.exports = (_temp = _class = class Instagram extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'Instagram';
    Provider.initPlugin(this, opts);

    this.icon = () => h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "32",
      height: "32",
      viewBox: "0 0 32 32"
    }, h("g", {
      fill: "none",
      fillRule: "evenodd"
    }, h("rect", {
      className: "uppy-ProviderIconBg",
      fill: "#E1306C",
      width: "32",
      height: "32",
      rx: "16"
    }), h("path", {
      d: "M16 8.622c2.403 0 2.688.009 3.637.052.877.04 1.354.187 1.67.31.392.144.745.374 1.036.673.299.29.529.644.673 1.035.123.317.27.794.31 1.671.043.95.052 1.234.052 3.637s-.009 2.688-.052 3.637c-.04.877-.187 1.354-.31 1.671a2.98 2.98 0 0 1-1.708 1.708c-.317.123-.794.27-1.671.31-.95.043-1.234.053-3.637.053s-2.688-.01-3.637-.053c-.877-.04-1.354-.187-1.671-.31a2.788 2.788 0 0 1-1.035-.673 2.788 2.788 0 0 1-.673-1.035c-.123-.317-.27-.794-.31-1.671-.043-.949-.052-1.234-.052-3.637s.009-2.688.052-3.637c.04-.877.187-1.354.31-1.67.144-.392.374-.745.673-1.036.29-.299.644-.529 1.035-.673.317-.123.794-.27 1.671-.31.95-.043 1.234-.052 3.637-.052zM16 7c-2.444 0-2.75.01-3.71.054-.959.044-1.613.196-2.185.419-.6.225-1.145.58-1.594 1.038-.458.45-.813.993-1.039 1.594-.222.572-.374 1.226-.418 2.184C7.01 13.25 7 13.556 7 16s.01 2.75.054 3.71c.044.959.196 1.613.419 2.185.226.6.58 1.145 1.038 1.594.45.458.993.813 1.594 1.038.572.223 1.227.375 2.184.419.96.044 1.267.054 3.711.054s2.75-.01 3.71-.054c.959-.044 1.613-.196 2.185-.419a4.602 4.602 0 0 0 2.632-2.632c.223-.572.375-1.226.419-2.184.044-.96.054-1.267.054-3.711s-.01-2.75-.054-3.71c-.044-.959-.196-1.613-.419-2.185A4.412 4.412 0 0 0 23.49 8.51a4.412 4.412 0 0 0-1.594-1.039c-.572-.222-1.226-.374-2.184-.418C18.75 7.01 18.444 7 16 7zm0 4.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zm0 7.421a2.921 2.921 0 1 1 0-5.842 2.921 2.921 0 0 1 0 5.842zm4.875-6.671a1.125 1.125 0 1 1 0-2.25 1.125 1.125 0 0 1 0 2.25z",
      fill: "#FFF"
    })));

    this.defaultLocale = locale;
    this.i18nInit();
    this.title = this.i18n('pluginNameInstagram');
    this.provider = new Provider(uppy, {
      companionUrl: this.opts.companionUrl,
      companionHeaders: this.opts.companionHeaders,
      companionKeysParams: this.opts.companionKeysParams,
      companionCookiesRule: this.opts.companionCookiesRule,
      provider: 'instagram',
      pluginId: this.id
    });
    this.onFirstRender = this.onFirstRender.bind(this);
    this.render = this.render.bind(this);
  }

  install() {
    this.view = new ProviderViews(this, {
      provider: this.provider,
      viewType: 'grid',
      showTitles: false,
      showFilter: false,
      showBreadcrumbs: false
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.view.tearDown();
    this.unmount();
  }

  onFirstRender() {
    return Promise.all([this.provider.fetchPreAuthToken(), this.view.getFolder('recent')]);
  }

  render(state) {
    return this.view.render(state);
  }

}, _class.VERSION = "2.0.4", _temp);

},{"./../../companion-client":42,"./../../core":48,"./../../provider-views":120,"./locale.js":96,"preact":18}],96:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    pluginNameInstagram: 'Instagram'
  }
};

},{}],97:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  Provider
} = require('./../../companion-client');

const {
  ProviderViews
} = require('./../../provider-views');

const {
  h
} = require('preact');

const locale = require('./locale');

module.exports = (_temp = _class = class OneDrive extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'OneDrive';
    Provider.initPlugin(this, opts);
    this.title = this.opts.title || 'OneDrive';

    this.icon = () => h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "32",
      height: "32",
      viewBox: "0 0 32 32"
    }, h("g", {
      fill: "none",
      fillRule: "evenodd"
    }, h("rect", {
      className: "uppy-ProviderIconBg",
      width: "32",
      height: "32",
      rx: "16",
      fill: "#0262C0"
    }), h("g", {
      fill: "#FFF",
      fillRule: "nonzero"
    }, h("path", {
      d: "M24.157 22s1.492-.205 1.79-1.655a2.624 2.624 0 0 0 .03-.878c-.22-1.64-1.988-2.01-1.988-2.01s.307-1.765-1.312-2.69c-1.62-.925-3.1 0-3.1 0S18.711 13 16.366 13c-3.016 0-3.519 3.448-3.519 3.448S10 16.618 10 19.14c0 2.523 2.597 2.86 2.597 2.86h11.56z"
    }), h("path", {
      d: "M9.421 19.246c0-2.197 1.606-3.159 2.871-3.472.44-1.477 1.654-3.439 4.135-3.439H16.445c1.721 0 2.79.823 3.368 1.476a3.99 3.99 0 0 1 1.147-.171h.01l.03.002C21.017 13.5 20.691 10 16.757 10c-2.69 0-3.639 2.345-3.639 2.345s-1.95-1.482-3.955.567c-1.028 1.052-.79 2.669-.79 2.669S6 15.824 6 18.412C6 20.757 8.452 21 8.452 21h1.372a3.77 3.77 0 0 1-.403-1.754z"
    }))));

    this.provider = new Provider(uppy, {
      companionUrl: this.opts.companionUrl,
      companionHeaders: this.opts.companionHeaders,
      companionCookiesRule: this.opts.companionCookiesRule,
      provider: 'onedrive',
      pluginId: this.id
    });
    this.defaultLocale = locale;
    this.i18nInit();
    this.title = this.i18n('pluginNameOneDrive');
    this.onFirstRender = this.onFirstRender.bind(this);
    this.render = this.render.bind(this);
  }

  install() {
    this.view = new ProviderViews(this, {
      provider: this.provider
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.view.tearDown();
    this.unmount();
  }

  onFirstRender() {
    return Promise.all([this.provider.fetchPreAuthToken(), this.view.getFolder()]);
  }

  render(state) {
    return this.view.render(state);
  }

}, _class.VERSION = "2.0.4", _temp);

},{"./../../companion-client":42,"./../../core":48,"./../../provider-views":120,"./locale":98,"preact":18}],98:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    pluginNameOneDrive: 'OneDrive'
  }
};

},{}],99:[function(require,module,exports){
"use strict";

const {
  h,
  Fragment
} = require('preact');

const Breadcrumb = props => {
  const {
    getFolder,
    title,
    isLast
  } = props;
  return h(Fragment, null, h("button", {
    type: "button",
    className: "uppy-u-reset",
    onClick: getFolder
  }, title), !isLast ? ' / ' : '');
};

module.exports = props => {
  const {
    getFolder,
    title,
    breadcrumbsIcon,
    directories
  } = props;
  return h("div", {
    className: "uppy-Provider-breadcrumbs"
  }, h("div", {
    className: "uppy-Provider-breadcrumbsIcon"
  }, breadcrumbsIcon), directories.map((directory, i) => h(Breadcrumb, {
    key: directory.id,
    getFolder: () => getFolder(directory.id),
    title: i === 0 ? title : directory.title,
    isLast: i + 1 === directories.length
  })));
};

},{"preact":18}],100:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const classNames = require('classnames');

const remoteFileObjToLocal = require('./../../utils/lib/remoteFileObjToLocal');

const Filter = require('./Filter');

const FooterActions = require('./FooterActions');

const Item = require('./Item/index');

const VIRTUAL_SHARED_DIR = 'shared-with-me';

function Browser(props) {
  const {
    currentSelection,
    folders,
    files,
    uppyFiles,
    viewType,
    headerComponent,
    showBreadcrumbs,
    isChecked,
    toggleCheckbox,
    handleScroll,
    showTitles,
    i18n,
    validateRestrictions,
    showFilter,
    filterQuery,
    filterInput,
    getNextFolder,
    cancel,
    done,
    columns
  } = props;
  const selected = currentSelection.length;
  return h("div", {
    className: classNames('uppy-ProviderBrowser', `uppy-ProviderBrowser-viewType--${viewType}`)
  }, h("div", {
    className: "uppy-ProviderBrowser-header"
  }, h("div", {
    className: classNames('uppy-ProviderBrowser-headerBar', !showBreadcrumbs && 'uppy-ProviderBrowser-headerBar--simple')
  }, headerComponent)), showFilter && h(Filter, {
    i18n: i18n,
    filterQuery: filterQuery,
    filterInput: filterInput
  }), (() => {
    if (!folders.length && !files.length) {
      return h("div", {
        className: "uppy-Provider-empty"
      }, props.i18n('noFilesFound'));
    }

    return h("div", {
      className: "uppy-ProviderBrowser-body"
    }, h("ul", {
      className: "uppy-ProviderBrowser-list",
      onScroll: handleScroll,
      role: "listbox" // making <ul> not focusable for firefox
      ,
      tabIndex: "-1"
    }, folders.map(folder => {
      var _isChecked;

      return Item({
        columns,
        showTitles,
        viewType,
        i18n,
        id: folder.id,
        title: folder.name,
        getItemIcon: () => folder.icon,
        isChecked: isChecked(folder),
        toggleCheckbox: event => toggleCheckbox(event, folder),
        type: 'folder',
        isDisabled: (_isChecked = isChecked(folder)) == null ? void 0 : _isChecked.loading,
        isCheckboxDisabled: folder.id === VIRTUAL_SHARED_DIR,
        handleFolderClick: () => getNextFolder(folder)
      });
    }), files.map(file => {
      const validated = validateRestrictions(remoteFileObjToLocal(file), [...uppyFiles, ...currentSelection]);
      return Item({
        id: file.id,
        title: file.name,
        author: file.author,
        getItemIcon: () => file.icon,
        isChecked: isChecked(file),
        toggleCheckbox: event => toggleCheckbox(event, file),
        columns,
        showTitles,
        viewType,
        i18n,
        type: 'file',
        isDisabled: !validated.result && !isChecked(file),
        restrictionReason: validated.reason
      });
    })));
  })(), selected > 0 && h(FooterActions, {
    selected: selected,
    done: done,
    cancel: cancel,
    i18n: i18n
  }));
}

module.exports = Browser;

},{"./../../utils/lib/remoteFileObjToLocal":177,"./Filter":102,"./FooterActions":103,"./Item/index":107,"classnames":4,"preact":18}],101:[function(require,module,exports){
"use strict";

const {
  Component,
  toChildArray
} = require('preact');

module.exports = class CloseWrapper extends Component {
  componentWillUnmount() {
    const {
      onUnmount
    } = this.props;
    onUnmount();
  }

  render() {
    const {
      children
    } = this.props;
    return toChildArray(children)[0];
  }

};

},{"preact":18}],102:[function(require,module,exports){
"use strict";

const {
  h,
  Component
} = require('preact');

module.exports = class Filter extends Component {
  constructor(props) {
    super(props);
    this.preventEnterPress = this.preventEnterPress.bind(this);
  }

  preventEnterPress(ev) {
    if (ev.keyCode === 13) {
      ev.stopPropagation();
      ev.preventDefault();
    }
  }

  render() {
    return h("div", {
      className: "uppy-ProviderBrowser-search"
    }, h("input", {
      className: "uppy-u-reset uppy-ProviderBrowser-searchInput",
      type: "text",
      placeholder: this.props.i18n('filter'),
      "aria-label": this.props.i18n('filter'),
      onKeyUp: this.preventEnterPress,
      onKeyDown: this.preventEnterPress,
      onKeyPress: this.preventEnterPress,
      onInput: e => this.props.filterQuery(e),
      value: this.props.filterInput
    }), h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      className: "uppy-c-icon uppy-ProviderBrowser-searchIcon",
      width: "12",
      height: "12",
      viewBox: "0 0 12 12"
    }, h("path", {
      d: "M8.638 7.99l3.172 3.172a.492.492 0 1 1-.697.697L7.91 8.656a4.977 4.977 0 0 1-2.983.983C2.206 9.639 0 7.481 0 4.819 0 2.158 2.206 0 4.927 0c2.721 0 4.927 2.158 4.927 4.82a4.74 4.74 0 0 1-1.216 3.17zm-3.71.685c2.176 0 3.94-1.726 3.94-3.856 0-2.129-1.764-3.855-3.94-3.855C2.75.964.984 2.69.984 4.819c0 2.13 1.765 3.856 3.942 3.856z"
    })), this.props.filterInput && h("button", {
      className: "uppy-u-reset uppy-ProviderBrowser-searchClose",
      type: "button",
      "aria-label": this.props.i18n('resetFilter'),
      title: this.props.i18n('resetFilter'),
      onClick: this.props.filterQuery
    }, h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      className: "uppy-c-icon",
      viewBox: "0 0 19 19"
    }, h("path", {
      d: "M17.318 17.232L9.94 9.854 9.586 9.5l-.354.354-7.378 7.378h.707l-.62-.62v.706L9.318 9.94l.354-.354-.354-.354L1.94 1.854v.707l.62-.62h-.706l7.378 7.378.354.354.354-.354 7.378-7.378h-.707l.622.62v-.706L9.854 9.232l-.354.354.354.354 7.378 7.378.708-.707-7.38-7.378v.708l7.38-7.38.353-.353-.353-.353-.622-.622-.353-.353-.354.352-7.378 7.38h.708L2.56 1.23 2.208.88l-.353.353-.622.62-.353.355.352.353 7.38 7.38v-.708l-7.38 7.38-.353.353.352.353.622.622.353.353.354-.353 7.38-7.38h-.708l7.38 7.38z"
    }))));
  }

};

},{"preact":18}],103:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = props => {
  return h("div", {
    className: "uppy-ProviderBrowser-footer"
  }, h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary",
    onClick: props.done,
    type: "button"
  }, props.i18n('selectX', {
    smart_count: props.selected
  })), h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-link",
    onClick: props.cancel,
    type: "button"
  }, props.i18n('cancel')));
};

},{"preact":18}],104:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

function GridListItem(props) {
  const {
    className,
    isDisabled,
    restrictionReason,
    isChecked,
    title,
    itemIconEl,
    showTitles,
    toggleCheckbox,
    id,
    children
  } = props;
  return h("li", {
    className: className,
    title: isDisabled ? restrictionReason : null
  }, h("input", {
    type: "checkbox",
    className: `uppy-u-reset uppy-ProviderBrowserItem-checkbox ${isChecked ? 'uppy-ProviderBrowserItem-checkbox--is-checked' : ''} uppy-ProviderBrowserItem-checkbox--grid`,
    onChange: toggleCheckbox,
    name: "listitem",
    id: id,
    checked: isChecked,
    disabled: isDisabled,
    "data-uppy-super-focusable": true
  }), h("label", {
    htmlFor: id,
    "aria-label": title,
    className: "uppy-u-reset uppy-ProviderBrowserItem-inner"
  }, h("span", {
    className: "uppy-ProviderBrowserItem-inner-relative"
  }, itemIconEl, showTitles && title, children)));
}

module.exports = GridListItem;

},{"preact":18}],105:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

function FileIcon() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: 11,
    height: 14.5,
    viewBox: "0 0 44 58"
  }, h("path", {
    d: "M27.437.517a1 1 0 0 0-.094.03H4.25C2.037.548.217 2.368.217 4.58v48.405c0 2.212 1.82 4.03 4.03 4.03H39.03c2.21 0 4.03-1.818 4.03-4.03V15.61a1 1 0 0 0-.03-.28 1 1 0 0 0 0-.093 1 1 0 0 0-.03-.032 1 1 0 0 0 0-.03 1 1 0 0 0-.032-.063 1 1 0 0 0-.03-.063 1 1 0 0 0-.032 0 1 1 0 0 0-.03-.063 1 1 0 0 0-.032-.03 1 1 0 0 0-.03-.063 1 1 0 0 0-.063-.062l-14.593-14a1 1 0 0 0-.062-.062A1 1 0 0 0 28 .708a1 1 0 0 0-.374-.157 1 1 0 0 0-.156 0 1 1 0 0 0-.03-.03l-.003-.003zM4.25 2.547h22.218v9.97c0 2.21 1.82 4.03 4.03 4.03h10.564v36.438a2.02 2.02 0 0 1-2.032 2.032H4.25c-1.13 0-2.032-.9-2.032-2.032V4.58c0-1.13.902-2.032 2.03-2.032zm24.218 1.345l10.375 9.937.75.718H30.5c-1.13 0-2.032-.9-2.032-2.03V3.89z"
  }));
}

function FolderIcon() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    style: {
      minWidth: 16,
      marginRight: 3
    },
    viewBox: "0 0 276.157 276.157"
  }, h("path", {
    d: "M273.08 101.378c-3.3-4.65-8.86-7.32-15.254-7.32h-24.34V67.59c0-10.2-8.3-18.5-18.5-18.5h-85.322c-3.63 0-9.295-2.875-11.436-5.805l-6.386-8.735c-4.982-6.814-15.104-11.954-23.546-11.954H58.73c-9.292 0-18.638 6.608-21.737 15.372l-2.033 5.752c-.958 2.71-4.72 5.37-7.596 5.37H18.5C8.3 49.09 0 57.39 0 67.59v167.07c0 .886.16 1.73.443 2.52.152 3.306 1.18 6.424 3.053 9.064 3.3 4.652 8.86 7.32 15.255 7.32h188.487c11.395 0 23.27-8.425 27.035-19.18l40.677-116.188c2.11-6.035 1.43-12.164-1.87-16.816zM18.5 64.088h8.864c9.295 0 18.64-6.607 21.738-15.37l2.032-5.75c.96-2.712 4.722-5.373 7.597-5.373h29.565c3.63 0 9.295 2.876 11.437 5.806l6.386 8.735c4.982 6.815 15.104 11.954 23.546 11.954h85.322c1.898 0 3.5 1.602 3.5 3.5v26.47H69.34c-11.395 0-23.27 8.423-27.035 19.178L15 191.23V67.59c0-1.898 1.603-3.5 3.5-3.5zm242.29 49.15l-40.676 116.188c-1.674 4.78-7.812 9.135-12.877 9.135H18.75c-1.447 0-2.576-.372-3.02-.997-.442-.625-.422-1.814.057-3.18l40.677-116.19c1.674-4.78 7.812-9.134 12.877-9.134h188.487c1.448 0 2.577.372 3.02.997.443.625.423 1.814-.056 3.18z"
  }));
}

function VideoIcon() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    style: {
      width: 16,
      marginRight: 4
    },
    viewBox: "0 0 58 58"
  }, h("path", {
    d: "M36.537 28.156l-11-7a1.005 1.005 0 0 0-1.02-.033C24.2 21.3 24 21.635 24 22v14a1 1 0 0 0 1.537.844l11-7a1.002 1.002 0 0 0 0-1.688zM26 34.18V23.82L34.137 29 26 34.18z"
  }), h("path", {
    d: "M57 6H1a1 1 0 0 0-1 1v44a1 1 0 0 0 1 1h56a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM10 28H2v-9h8v9zm-8 2h8v9H2v-9zm10 10V8h34v42H12V40zm44-12h-8v-9h8v9zm-8 2h8v9h-8v-9zm8-22v9h-8V8h8zM2 8h8v9H2V8zm0 42v-9h8v9H2zm54 0h-8v-9h8v9z"
  }));
}

module.exports = props => {
  if (props.itemIconString === null) return;

  switch (props.itemIconString) {
    case 'file':
      return h(FileIcon, null);

    case 'folder':
      return h(FolderIcon, null);

    case 'video':
      return h(VideoIcon, null);

    default:
      return h("img", {
        src: props.itemIconString,
        alt: props.alt
      });
  }
};

},{"preact":18}],106:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact'); // if folder:
//   + checkbox (selects all files from folder)
//   + folder name (opens folder)
// if file:
//   + checkbox (selects file)
//   + file name (selects file)


function ListItem(props) {
  const {
    className,
    isDisabled,
    restrictionReason,
    isCheckboxDisabled,
    isChecked,
    toggleCheckbox,
    type,
    id,
    itemIconEl,
    title,
    handleFolderClick,
    showTitles,
    i18n
  } = props;
  return h("li", {
    className: className,
    title: isDisabled ? restrictionReason : null
  }, !isCheckboxDisabled ? h("input", {
    type: "checkbox",
    className: `uppy-u-reset uppy-ProviderBrowserItem-checkbox ${isChecked ? 'uppy-ProviderBrowserItem-checkbox--is-checked' : ''}`,
    onChange: toggleCheckbox // for the <label/>
    ,
    name: "listitem",
    id: id,
    checked: isChecked,
    "aria-label": type === 'file' ? null : i18n('allFilesFromFolderNamed', {
      name: title
    }),
    disabled: isDisabled,
    "data-uppy-super-focusable": true
  }) : null, type === 'file' ? // label for a checkbox
  h("label", {
    htmlFor: id,
    className: "uppy-u-reset uppy-ProviderBrowserItem-inner"
  }, h("div", {
    className: "uppy-ProviderBrowserItem-iconWrap"
  }, itemIconEl), showTitles && title) : // button to open a folder
  h("button", {
    type: "button",
    className: "uppy-u-reset uppy-ProviderBrowserItem-inner",
    onClick: handleFolderClick,
    "aria-label": i18n('openFolderNamed', {
      name: title
    })
  }, h("div", {
    className: "uppy-ProviderBrowserItem-iconWrap"
  }, itemIconEl), showTitles && h("span", null, title)));
}

module.exports = ListItem;

},{"preact":18}],107:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const {
  h
} = require('preact');

const classNames = require('classnames');

const ItemIcon = require('./components/ItemIcon');

const GridListItem = require('./components/GridLi');

const ListItem = require('./components/ListLi');

module.exports = props => {
  const {
    author
  } = props;
  const itemIconString = props.getItemIcon();
  const className = classNames('uppy-ProviderBrowserItem', {
    'uppy-ProviderBrowserItem--selected': props.isChecked
  }, {
    'uppy-ProviderBrowserItem--disabled': props.isDisabled
  }, {
    'uppy-ProviderBrowserItem--noPreview': itemIconString === 'video'
  });
  const itemIconEl = h(ItemIcon, {
    itemIconString: itemIconString
  });

  switch (props.viewType) {
    case 'grid':
      return h(GridListItem, _extends({}, props, {
        className: className,
        itemIconEl: itemIconEl
      }));

    case 'list':
      return h(ListItem, _extends({}, props, {
        className: className,
        itemIconEl: itemIconEl
      }));

    case 'unsplash':
      return h(GridListItem, _extends({}, props, {
        className: className,
        itemIconEl: itemIconEl
      }), h("a", {
        href: `${author.url}?utm_source=Companion&utm_medium=referral`,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "uppy-ProviderBrowserItem-author"
      }, author.name));

    default:
      throw new Error(`There is no such type ${props.viewType}`);
  }
};

},{"./components/GridLi":104,"./components/ItemIcon":105,"./components/ListLi":106,"classnames":4,"preact":18}],108:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = props => {
  return h("div", {
    className: "uppy-Provider-loading"
  }, h("span", null, props.i18n('loading')));
};

},{"preact":18}],109:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

function GoogleIcon() {
  return h("svg", {
    width: "26",
    height: "26",
    viewBox: "0 0 26 26",
    xmlns: "http://www.w3.org/2000/svg"
  }, h("g", {
    fill: "none",
    "fill-rule": "evenodd"
  }, h("circle", {
    fill: "#FFF",
    cx: "13",
    cy: "13",
    r: "13"
  }), h("path", {
    d: "M21.64 13.205c0-.639-.057-1.252-.164-1.841H13v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z",
    fill: "#4285F4",
    "fill-rule": "nonzero"
  }), h("path", {
    d: "M13 22c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H4.957v2.332A8.997 8.997 0 0013 22z",
    fill: "#34A853",
    "fill-rule": "nonzero"
  }), h("path", {
    d: "M7.964 14.71A5.41 5.41 0 017.682 13c0-.593.102-1.17.282-1.71V8.958H4.957A8.996 8.996 0 004 13c0 1.452.348 2.827.957 4.042l3.007-2.332z",
    fill: "#FBBC05",
    "fill-rule": "nonzero"
  }), h("path", {
    d: "M13 7.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C17.463 4.891 15.426 4 13 4a8.997 8.997 0 00-8.043 4.958l3.007 2.332C8.672 9.163 10.656 7.58 13 7.58z",
    fill: "#EA4335",
    "fill-rule": "nonzero"
  }), h("path", {
    d: "M4 4h18v18H4z"
  })));
}

function AuthView(props) {
  const {
    pluginName,
    pluginIcon,
    i18nArray,
    handleAuth
  } = props; // In order to comply with Google's brand we need to create a different button
  // for the Google Drive plugin

  const isGoogleDrive = pluginName === 'Google Drive';
  const pluginNameComponent = h("span", {
    className: "uppy-Provider-authTitleName"
  }, pluginName, h("br", null));
  return h("div", {
    className: "uppy-Provider-auth"
  }, h("div", {
    className: "uppy-Provider-authIcon"
  }, pluginIcon()), h("div", {
    className: "uppy-Provider-authTitle"
  }, i18nArray('authenticateWithTitle', {
    pluginName: pluginNameComponent
  })), isGoogleDrive ? h("button", {
    type: "button",
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Provider-authBtn uppy-Provider-btn-google",
    onClick: handleAuth,
    "data-uppy-super-focusable": true
  }, h(GoogleIcon, null), i18nArray('signInWithGoogle')) : h("button", {
    type: "button",
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Provider-authBtn",
    onClick: handleAuth,
    "data-uppy-super-focusable": true
  }, i18nArray('authenticateWith', {
    pluginName
  })));
}

module.exports = AuthView;

},{"preact":18}],110:[function(require,module,exports){
"use strict";

const User = require('./User');

const Breadcrumbs = require('../Breadcrumbs');

module.exports = props => {
  const components = [];

  if (props.showBreadcrumbs) {
    components.push(Breadcrumbs({
      getFolder: props.getFolder,
      directories: props.directories,
      breadcrumbsIcon: props.pluginIcon && props.pluginIcon(),
      title: props.title
    }));
  }

  components.push(User({
    logout: props.logout,
    username: props.username,
    i18n: props.i18n
  }));
  return components;
};

},{"../Breadcrumbs":99,"./User":112}],111:[function(require,module,exports){
"use strict";

var _class, _updateFilesAndFolders, _isOriginAllowed, _temp;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  h
} = require('preact');

const AuthView = require('./AuthView');

const Header = require('./Header');

const Browser = require('../Browser');

const LoaderView = require('../Loader');

const CloseWrapper = require('../CloseWrapper');

const View = require('../View');

function getOrigin() {
  // eslint-disable-next-line no-restricted-globals
  return location.origin;
}
/**
 * Class to easily generate generic views for Provider plugins
 */


module.exports = (_temp = (_updateFilesAndFolders = /*#__PURE__*/_classPrivateFieldLooseKey("updateFilesAndFolders"), _isOriginAllowed = /*#__PURE__*/_classPrivateFieldLooseKey("isOriginAllowed"), _class = class ProviderView extends View {
  /**
   * @param {object} plugin instance of the plugin
   * @param {object} opts
   */
  constructor(plugin, opts) {
    super(plugin, opts); // set default options

    Object.defineProperty(this, _isOriginAllowed, {
      value: _isOriginAllowed2
    });
    Object.defineProperty(this, _updateFilesAndFolders, {
      value: _updateFilesAndFolders2
    });
    const defaultOptions = {
      viewType: 'list',
      showTitles: true,
      showFilter: true,
      showBreadcrumbs: true
    }; // merge default options with the ones set by user

    this.opts = { ...defaultOptions,
      ...opts
    }; // Logic

    this.filterQuery = this.filterQuery.bind(this);
    this.getFolder = this.getFolder.bind(this);
    this.getNextFolder = this.getNextFolder.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuth = this.handleAuth.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.listAllFiles = this.listAllFiles.bind(this);
    this.donePicking = this.donePicking.bind(this); // Visual

    this.render = this.render.bind(this); // Set default state for the plugin

    this.plugin.setPluginState({
      authenticated: false,
      files: [],
      folders: [],
      directories: [],
      filterInput: '',
      isSearchVisible: false,
      currentSelection: []
    });
  }

  tearDown() {// Nothing.
  }

  /**
   * Based on folder ID, fetch a new folder and update it to state
   *
   * @param  {string} id Folder id
   * @returns {Promise}   Folders/files in folder
   */
  getFolder(id, name) {
    return this.sharedHandler.loaderWrapper(this.provider.list(id), res => {
      const folders = [];
      const files = [];
      let updatedDirectories;
      const state = this.plugin.getPluginState();
      const index = state.directories.findIndex(dir => id === dir.id);

      if (index !== -1) {
        updatedDirectories = state.directories.slice(0, index + 1);
      } else {
        updatedDirectories = state.directories.concat([{
          id,
          title: name
        }]);
      }

      this.username = res.username || this.username;

      _classPrivateFieldLooseBase(this, _updateFilesAndFolders)[_updateFilesAndFolders](res, files, folders);

      this.plugin.setPluginState({
        directories: updatedDirectories
      });
    }, this.handleError);
  }
  /**
   * Fetches new folder
   *
   * @param  {object} folder
   */


  getNextFolder(folder) {
    this.getFolder(folder.requestPath, folder.name);
    this.lastCheckbox = undefined;
  }
  /**
   * Removes session token on client side.
   */


  logout() {
    this.provider.logout().then(res => {
      if (res.ok) {
        if (!res.revoked) {
          const message = this.plugin.uppy.i18n('companionUnauthorizeHint', {
            provider: this.plugin.title,
            url: res.manual_revoke_url
          });
          this.plugin.uppy.info(message, 'info', 7000);
        }

        const newState = {
          authenticated: false,
          files: [],
          folders: [],
          directories: []
        };
        this.plugin.setPluginState(newState);
      }
    }).catch(this.handleError);
  }

  filterQuery(e) {
    const state = this.plugin.getPluginState();
    this.plugin.setPluginState({ ...state,
      filterInput: e ? e.target.value : ''
    });
  }
  /**
   * Adds all files found inside of specified folder.
   *
   * Uses separated state while folder contents are being fetched and
   * mantains list of selected folders, which are separated from files.
   */


  addFolder(folder) {
    const folderId = this.providerFileToId(folder);
    const state = this.plugin.getPluginState();
    const folders = { ...state.selectedFolders
    };

    if (folderId in folders && folders[folderId].loading) {
      return;
    }

    folders[folderId] = {
      loading: true,
      files: []
    };
    this.plugin.setPluginState({
      selectedFolders: { ...folders
      }
    }); // eslint-disable-next-line consistent-return

    return this.listAllFiles(folder.requestPath).then(files => {
      let count = 0; // If the same folder is added again, we don't want to send
      // X amount of duplicate file notifications, we want to say
      // the folder was already added. This checks if all files are duplicate,
      // if that's the case, we don't add the files.

      files.forEach(file => {
        const id = this.providerFileToId(file);

        if (!this.plugin.uppy.checkIfFileAlreadyExists(id)) {
          count++;
        }
      });

      if (count > 0) {
        files.forEach(file => this.addFile(file));
      }

      const ids = files.map(this.providerFileToId);
      folders[folderId] = {
        loading: false,
        files: ids
      };
      this.plugin.setPluginState({
        selectedFolders: folders
      });
      let message;

      if (count === 0) {
        message = this.plugin.uppy.i18n('folderAlreadyAdded', {
          folder: folder.name
        });
      } else if (files.length) {
        message = this.plugin.uppy.i18n('folderAdded', {
          smart_count: count,
          folder: folder.name
        });
      } else {
        message = this.plugin.uppy.i18n('emptyFolderAdded');
      }

      this.plugin.uppy.info(message);
    }).catch(e => {
      const state = this.plugin.getPluginState();
      const selectedFolders = { ...state.selectedFolders
      };
      delete selectedFolders[folderId];
      this.plugin.setPluginState({
        selectedFolders
      });
      this.handleError(e);
    });
  }

  handleAuth() {
    const authState = btoa(JSON.stringify({
      origin: getOrigin()
    }));
    const clientVersion = `@uppy/provider-views=${ProviderView.VERSION}`;
    const link = this.provider.authUrl({
      state: authState,
      uppyVersions: clientVersion
    });
    const authWindow = window.open(link, '_blank');

    const handleToken = e => {
      if (!_classPrivateFieldLooseBase(this, _isOriginAllowed)[_isOriginAllowed](e.origin, this.plugin.opts.companionAllowedHosts) || e.source !== authWindow) {
        this.plugin.uppy.log(`rejecting event from ${e.origin} vs allowed pattern ${this.plugin.opts.companionAllowedHosts}`);
        return;
      } // Check if it's a string before doing the JSON.parse to maintain support
      // for older Companion versions that used object references


      const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;

      if (data.error) {
        this.plugin.uppy.log('auth aborted');
        const {
          uppy
        } = this.plugin;
        const message = uppy.i18n('authAborted');
        uppy.info({
          message
        }, 'warning', 5000);
        return;
      }

      if (!data.token) {
        this.plugin.uppy.log('did not receive token from auth window');
        return;
      }

      authWindow.close();
      window.removeEventListener('message', handleToken);
      this.provider.setAuthToken(data.token);
      this.preFirstRender();
    };

    window.addEventListener('message', handleToken);
  }

  async handleScroll(event) {
    const path = this.nextPagePath || null;

    if (this.shouldHandleScroll(event) && path) {
      this.isHandlingScroll = true;

      try {
        const response = await this.provider.list(path);
        const {
          files,
          folders
        } = this.plugin.getPluginState();

        _classPrivateFieldLooseBase(this, _updateFilesAndFolders)[_updateFilesAndFolders](response, files, folders);
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isHandlingScroll = false;
      }
    }
  }

  listAllFiles(path, files = null) {
    files = files || [];
    return new Promise((resolve, reject) => {
      this.provider.list(path).then(res => {
        res.items.forEach(item => {
          if (!item.isFolder) {
            files.push(item);
          } else {
            this.addFolder(item);
          }
        });
        const moreFiles = res.nextPagePath || null;

        if (moreFiles) {
          return this.listAllFiles(moreFiles, files).then(files => resolve(files)).catch(e => reject(e));
        }

        return resolve(files);
      }).catch(e => reject(e));
    });
  }

  donePicking() {
    const {
      currentSelection
    } = this.plugin.getPluginState();
    const promises = currentSelection.map(file => {
      if (file.isFolder) {
        return this.addFolder(file);
      }

      return this.addFile(file);
    });
    this.sharedHandler.loaderWrapper(Promise.all(promises), () => {
      this.clearSelection();
    }, () => {});
  }

  render(state, viewOptions = {}) {
    const {
      authenticated,
      didFirstRender
    } = this.plugin.getPluginState();

    if (!didFirstRender) {
      this.preFirstRender();
    }

    const targetViewOptions = { ...this.opts,
      ...viewOptions
    };
    const {
      files,
      folders,
      filterInput,
      loading,
      currentSelection
    } = this.plugin.getPluginState();
    const {
      isChecked,
      toggleCheckbox,
      filterItems
    } = this.sharedHandler;
    const hasInput = filterInput !== '';
    const headerProps = {
      showBreadcrumbs: targetViewOptions.showBreadcrumbs,
      getFolder: this.getFolder,
      directories: this.plugin.getPluginState().directories,
      pluginIcon: this.plugin.icon,
      title: this.plugin.title,
      logout: this.logout,
      username: this.username,
      i18n: this.plugin.uppy.i18n
    };
    const browserProps = {
      isChecked,
      toggleCheckbox,
      currentSelection,
      files: hasInput ? filterItems(files) : files,
      folders: hasInput ? filterItems(folders) : folders,
      username: this.username,
      getNextFolder: this.getNextFolder,
      getFolder: this.getFolder,
      filterItems: this.sharedHandler.filterItems,
      filterQuery: this.filterQuery,
      logout: this.logout,
      handleScroll: this.handleScroll,
      listAllFiles: this.listAllFiles,
      done: this.donePicking,
      cancel: this.cancelPicking,
      headerComponent: Header(headerProps),
      title: this.plugin.title,
      viewType: targetViewOptions.viewType,
      showTitles: targetViewOptions.showTitles,
      showFilter: targetViewOptions.showFilter,
      showBreadcrumbs: targetViewOptions.showBreadcrumbs,
      pluginIcon: this.plugin.icon,
      i18n: this.plugin.uppy.i18n,
      uppyFiles: this.plugin.uppy.getFiles(),
      validateRestrictions: (...args) => this.plugin.uppy.validateRestrictions(...args)
    };

    if (loading) {
      return h(CloseWrapper, {
        onUnmount: this.clearSelection
      }, h(LoaderView, {
        i18n: this.plugin.uppy.i18n
      }));
    }

    if (!authenticated) {
      return h(CloseWrapper, {
        onUnmount: this.clearSelection
      }, h(AuthView, {
        pluginName: this.plugin.title,
        pluginIcon: this.plugin.icon,
        handleAuth: this.handleAuth,
        i18n: this.plugin.uppy.i18n,
        i18nArray: this.plugin.uppy.i18nArray
      }));
    }

    return h(CloseWrapper, {
      onUnmount: this.clearSelection
    }, h(Browser, browserProps));
  }

}), _class.VERSION = "2.0.5", _temp);

function _updateFilesAndFolders2(res, files, folders) {
  this.nextPagePath = res.nextPagePath;
  res.items.forEach(item => {
    if (item.isFolder) {
      folders.push(item);
    } else {
      files.push(item);
    }
  });
  this.plugin.setPluginState({
    folders,
    files
  });
}

function _isOriginAllowed2(origin, allowedOrigin) {
  const getRegex = value => {
    if (typeof value === 'string') {
      return new RegExp(`^${value}$`);
    }

    if (value instanceof RegExp) {
      return value;
    }
  };

  const patterns = Array.isArray(allowedOrigin) ? allowedOrigin.map(getRegex) : [getRegex(allowedOrigin)];
  return patterns.filter(pattern => pattern != null) // loose comparison to catch undefined
  .some(pattern => pattern.test(origin) || pattern.test(`${origin}/`)); // allowing for trailing '/'
}

},{"../Browser":100,"../CloseWrapper":101,"../Loader":108,"../View":119,"./AuthView":109,"./Header":110,"preact":18}],112:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = props => {
  return [h("span", {
    className: "uppy-ProviderBrowser-user",
    key: "username"
  }, props.username), h("button", {
    type: "button",
    onClick: props.logout,
    className: "uppy-u-reset uppy-ProviderBrowser-userLogout",
    key: "logout"
  }, props.i18n('logOut'))];
};

},{"preact":18}],113:[function(require,module,exports){
"use strict";

module.exports = require('./ProviderView');

},{"./ProviderView":111}],114:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = props => {
  return h("button", {
    type: "button",
    onClick: props.triggerSearchInput,
    className: "uppy-u-reset uppy-ProviderBrowser-userLogout"
  }, props.i18n('backToSearch'));
};

},{"preact":18}],115:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = props => {
  let input;

  const handleKeyPress = ev => {
    if (ev.keyCode === 13) {
      validateAndSearch();
    }
  };

  const validateAndSearch = () => {
    if (input.value) {
      props.search(input.value);
    }
  };

  return h("div", {
    className: "uppy-SearchProvider"
  }, h("input", {
    className: "uppy-u-reset uppy-c-textInput uppy-SearchProvider-input",
    type: "text",
    "aria-label": props.i18n('enterTextToSearch'),
    placeholder: props.i18n('enterTextToSearch'),
    onKeyUp: handleKeyPress,
    ref: input_ => {
      input = input_;
    },
    "data-uppy-super-focusable": true
  }), h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-SearchProvider-searchButton",
    type: "button",
    onClick: validateAndSearch
  }, props.i18n('searchImages')));
};

},{"preact":18}],116:[function(require,module,exports){
"use strict";

var _class, _searchTerm, _updateFilesAndInputMode, _temp;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  h
} = require('preact');

const SearchInput = require('./InputView');

const Browser = require('../Browser');

const LoaderView = require('../Loader');

const Header = require('./Header');

const CloseWrapper = require('../CloseWrapper');

const View = require('../View');
/**
 * Class to easily generate generic views for Provider plugins
 */


module.exports = (_temp = (_searchTerm = /*#__PURE__*/_classPrivateFieldLooseKey("searchTerm"), _updateFilesAndInputMode = /*#__PURE__*/_classPrivateFieldLooseKey("updateFilesAndInputMode"), _class = class SearchProviderView extends View {
  /**
   * @param {object} plugin instance of the plugin
   * @param {object} opts
   */
  constructor(plugin, opts) {
    super(plugin, opts); // set default options

    Object.defineProperty(this, _updateFilesAndInputMode, {
      value: _updateFilesAndInputMode2
    });
    Object.defineProperty(this, _searchTerm, {
      writable: true,
      value: void 0
    });
    const defaultOptions = {
      viewType: 'grid',
      showTitles: false,
      showFilter: false,
      showBreadcrumbs: false
    }; // merge default options with the ones set by user

    this.opts = { ...defaultOptions,
      ...opts
    }; // Logic

    this.search = this.search.bind(this);
    this.triggerSearchInput = this.triggerSearchInput.bind(this);
    this.addFile = this.addFile.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.donePicking = this.donePicking.bind(this); // Visual

    this.render = this.render.bind(this); // Set default state for the plugin

    this.plugin.setPluginState({
      isInputMode: true,
      files: [],
      folders: [],
      directories: [],
      filterInput: '',
      isSearchVisible: false,
      currentSelection: []
    });
  }

  tearDown() {// Nothing.
  }

  search(query) {
    if (query && query === _classPrivateFieldLooseBase(this, _searchTerm)[_searchTerm]) {
      // no need to search again as this is the same as the previous search
      this.plugin.setPluginState({
        isInputMode: false
      });
      return;
    }

    return this.sharedHandler.loaderWrapper(this.provider.search(query), res => {
      _classPrivateFieldLooseBase(this, _updateFilesAndInputMode)[_updateFilesAndInputMode](res, []);
    }, this.handleError);
  }

  triggerSearchInput() {
    this.plugin.setPluginState({
      isInputMode: true
    });
  }

  async handleScroll(event) {
    const query = this.nextPageQuery || null;

    if (this.shouldHandleScroll(event) && query) {
      this.isHandlingScroll = true;

      try {
        const response = await this.provider.search(_classPrivateFieldLooseBase(this, _searchTerm)[_searchTerm], query);
        const {
          files
        } = this.plugin.getPluginState();

        _classPrivateFieldLooseBase(this, _updateFilesAndInputMode)[_updateFilesAndInputMode](response, files);
      } catch (error) {
        this.handleError(error);
      } finally {
        this.isHandlingScroll = false;
      }
    }
  }

  donePicking() {
    const {
      currentSelection
    } = this.plugin.getPluginState();
    const promises = currentSelection.map(file => this.addFile(file));
    this.sharedHandler.loaderWrapper(Promise.all(promises), () => {
      this.clearSelection();
    }, () => {});
  }

  render(state, viewOptions = {}) {
    const {
      didFirstRender,
      isInputMode
    } = this.plugin.getPluginState();

    if (!didFirstRender) {
      this.preFirstRender();
    }

    const targetViewOptions = { ...this.opts,
      ...viewOptions
    };
    const {
      files,
      folders,
      filterInput,
      loading,
      currentSelection
    } = this.plugin.getPluginState();
    const {
      isChecked,
      toggleCheckbox,
      filterItems
    } = this.sharedHandler;
    const hasInput = filterInput !== '';
    const browserProps = {
      isChecked,
      toggleCheckbox,
      currentSelection,
      files: hasInput ? filterItems(files) : files,
      folders: hasInput ? filterItems(folders) : folders,
      handleScroll: this.handleScroll,
      done: this.donePicking,
      cancel: this.cancelPicking,
      headerComponent: Header({
        triggerSearchInput: this.triggerSearchInput,
        i18n: this.plugin.uppy.i18n
      }),
      title: this.plugin.title,
      viewType: targetViewOptions.viewType,
      showTitles: targetViewOptions.showTitles,
      showFilter: targetViewOptions.showFilter,
      showBreadcrumbs: targetViewOptions.showBreadcrumbs,
      pluginIcon: this.plugin.icon,
      i18n: this.plugin.uppy.i18n,
      uppyFiles: this.plugin.uppy.getFiles(),
      validateRestrictions: (...args) => this.plugin.uppy.validateRestrictions(...args)
    };

    if (loading) {
      return h(CloseWrapper, {
        onUnmount: this.clearSelection
      }, h(LoaderView, {
        i18n: this.plugin.uppy.i18n
      }));
    }

    if (isInputMode) {
      return h(CloseWrapper, {
        onUnmount: this.clearSelection
      }, h(SearchInput, {
        search: this.search,
        i18n: this.plugin.uppy.i18n
      }));
    }

    return h(CloseWrapper, {
      onUnmount: this.clearSelection
    }, h(Browser, browserProps));
  }

}), _class.VERSION = "2.0.5", _temp);

function _updateFilesAndInputMode2(res, files) {
  this.nextPageQuery = res.nextPageQuery;
  _classPrivateFieldLooseBase(this, _searchTerm)[_searchTerm] = res.searchedFor;
  res.items.forEach(item => {
    files.push(item);
  });
  this.plugin.setPluginState({
    isInputMode: false,
    files
  });
}

},{"../Browser":100,"../CloseWrapper":101,"../Loader":108,"../View":119,"./Header":114,"./InputView":115,"preact":18}],117:[function(require,module,exports){
"use strict";

module.exports = require('./SearchProviderView');

},{"./SearchProviderView":116}],118:[function(require,module,exports){
"use strict";

const remoteFileObjToLocal = require('./../../utils/lib/remoteFileObjToLocal');

module.exports = class SharedHandler {
  constructor(plugin) {
    this.plugin = plugin;
    this.filterItems = this.filterItems.bind(this);
    this.toggleCheckbox = this.toggleCheckbox.bind(this);
    this.isChecked = this.isChecked.bind(this);
    this.loaderWrapper = this.loaderWrapper.bind(this);
  }

  filterItems(items) {
    const state = this.plugin.getPluginState();

    if (!state.filterInput || state.filterInput === '') {
      return items;
    }

    return items.filter(folder => {
      return folder.name.toLowerCase().indexOf(state.filterInput.toLowerCase()) !== -1;
    });
  }
  /**
   * Toggles file/folder checkbox to on/off state while updating files list.
   *
   * Note that some extra complexity comes from supporting shift+click to
   * toggle multiple checkboxes at once, which is done by getting all files
   * in between last checked file and current one.
   */


  toggleCheckbox(e, file) {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.focus();
    const {
      folders,
      files
    } = this.plugin.getPluginState();
    const items = this.filterItems(folders.concat(files)); // Shift-clicking selects a single consecutive list of items
    // starting at the previous click and deselects everything else.

    if (this.lastCheckbox && e.shiftKey) {
      const prevIndex = items.indexOf(this.lastCheckbox);
      const currentIndex = items.indexOf(file);
      const currentSelection = prevIndex < currentIndex ? items.slice(prevIndex, currentIndex + 1) : items.slice(currentIndex, prevIndex + 1);
      const reducedCurrentSelection = []; // Check restrictions on each file in currentSelection,
      // reduce it to only contain files that pass restrictions

      for (const item of currentSelection) {
        const {
          uppy
        } = this.plugin;
        const validatedRestrictions = uppy.validateRestrictions(remoteFileObjToLocal(item), [...uppy.getFiles(), ...reducedCurrentSelection]);

        if (validatedRestrictions.result) {
          reducedCurrentSelection.push(item);
        } else {
          uppy.info({
            message: validatedRestrictions.reason
          }, 'error', uppy.opts.infoTimeout);
        }
      }

      this.plugin.setPluginState({
        currentSelection: reducedCurrentSelection
      });
      return;
    }

    this.lastCheckbox = file;
    const {
      currentSelection
    } = this.plugin.getPluginState();

    if (this.isChecked(file)) {
      this.plugin.setPluginState({
        currentSelection: currentSelection.filter(item => item.id !== file.id)
      });
    } else {
      this.plugin.setPluginState({
        currentSelection: currentSelection.concat([file])
      });
    }
  }

  isChecked(file) {
    const {
      currentSelection
    } = this.plugin.getPluginState(); // comparing id instead of the file object, because the reference to the object
    // changes when we switch folders, and the file list is updated

    return currentSelection.some(item => item.id === file.id);
  }

  loaderWrapper(promise, then, catch_) {
    promise.then(result => {
      this.plugin.setPluginState({
        loading: false
      });
      then(result);
    }).catch(err => {
      this.plugin.setPluginState({
        loading: false
      });
      catch_(err);
    });
    this.plugin.setPluginState({
      loading: true
    });
  }

};

},{"./../../utils/lib/remoteFileObjToLocal":177}],119:[function(require,module,exports){
"use strict";

const getFileType = require('./../../utils/lib/getFileType');

const isPreviewSupported = require('./../../utils/lib/isPreviewSupported');

const generateFileID = require('./../../utils/lib/generateFileID'); // TODO: now that we have a shared `View` class,
// `SharedHandler` could be cleaned up and moved into here


const SharedHandler = require('./SharedHandler');

module.exports = class View {
  constructor(plugin, opts) {
    this.plugin = plugin;
    this.provider = opts.provider;
    this.sharedHandler = new SharedHandler(plugin);
    this.isHandlingScroll = false;
    this.preFirstRender = this.preFirstRender.bind(this);
    this.handleError = this.handleError.bind(this);
    this.addFile = this.addFile.bind(this);
    this.clearSelection = this.clearSelection.bind(this);
    this.cancelPicking = this.cancelPicking.bind(this);
  } // eslint-disable-next-line class-methods-use-this


  providerFileToId(file) {
    return generateFileID({
      data: file,
      name: file.name || file.id,
      type: file.mimetype
    });
  }

  preFirstRender() {
    this.plugin.setPluginState({
      didFirstRender: true
    });
    this.plugin.onFirstRender();
  } // eslint-disable-next-line class-methods-use-this


  shouldHandleScroll(event) {
    const {
      scrollHeight,
      scrollTop,
      offsetHeight
    } = event.target;
    const scrollPosition = scrollHeight - (scrollTop + offsetHeight);
    return scrollPosition < 50 && !this.isHandlingScroll;
  }

  clearSelection() {
    this.plugin.setPluginState({
      currentSelection: []
    });
  }

  cancelPicking() {
    this.clearSelection();
    const dashboard = this.plugin.uppy.getPlugin('Dashboard');

    if (dashboard) {
      dashboard.hideAllPanels();
    }
  }

  handleError(error) {
    const {
      uppy
    } = this.plugin;
    const message = uppy.i18n('companionError');
    uppy.log(error.toString());

    if (error.isAuthError) {
      return;
    }

    uppy.info({
      message,
      details: error.toString()
    }, 'error', 5000);
  }

  addFile(file) {
    const tagFile = {
      id: this.providerFileToId(file),
      source: this.plugin.id,
      data: file,
      name: file.name || file.id,
      type: file.mimeType,
      isRemote: true,
      meta: {},
      body: {
        fileId: file.id
      },
      remote: {
        companionUrl: this.plugin.opts.companionUrl,
        url: `${this.provider.fileUrl(file.requestPath)}`,
        body: {
          fileId: file.id
        },
        providerOptions: this.provider.opts,
        providerName: this.provider.name
      }
    };
    const fileType = getFileType(tagFile); // TODO Should we just always use the thumbnail URL if it exists?

    if (fileType && isPreviewSupported(fileType)) {
      tagFile.preview = file.thumbnail;
    }

    if (file.author) {
      tagFile.meta.author = file.author;
    }

    this.plugin.uppy.log('Adding remote file');

    try {
      this.plugin.uppy.addFile(tagFile);
      return true;
    } catch (err) {
      if (!err.isRestriction) {
        this.plugin.uppy.log(err);
      }

      return false;
    }
  }

};

},{"./../../utils/lib/generateFileID":155,"./../../utils/lib/getFileType":163,"./../../utils/lib/isPreviewSupported":174,"./SharedHandler":118}],120:[function(require,module,exports){
"use strict";

const ProviderViews = require('./ProviderView');

const SearchProviderViews = require('./SearchProviderView');

module.exports = {
  ProviderViews,
  SearchProviderViews
};

},{"./ProviderView":113,"./SearchProviderView":117}],121:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const {
  h,
  Component
} = require('preact');

const RecordButton = require('./RecordButton');

const SubmitButton = require('./SubmitButton');

const StopWatch = require('./StopWatch');

const StreamStatus = require('./StreamStatus');

class RecorderScreen extends Component {
  componentWillUnmount() {
    this.props.onStop();
  }

  render() {
    const {
      recording,
      stream: videoStream,
      recordedVideo
    } = this.props;
    const videoProps = {
      playsinline: true
    }; // show stream

    if (recording || !recordedVideo && !recording) {
      videoProps.muted = true;
      videoProps.autoplay = true;
      videoProps.srcObject = videoStream;
    } // show preview


    if (recordedVideo && !recording) {
      videoProps.muted = false;
      videoProps.controls = true;
      videoProps.src = recordedVideo; // reset srcObject in dom. If not resetted, stream sticks in element

      if (this.videoElement) {
        this.videoElement.srcObject = undefined;
      }
    }

    return h("div", {
      className: "uppy uppy-ScreenCapture-container"
    }, h("div", {
      className: "uppy-ScreenCapture-videoContainer"
    }, h(StreamStatus, this.props), h("video", _extends({
      ref: videoElement => {
        this.videoElement = videoElement;
      },
      className: "uppy-ScreenCapture-video"
    }, videoProps)), h(StopWatch, this.props)), h("div", {
      className: "uppy-ScreenCapture-buttonContainer"
    }, h(RecordButton, this.props), h(SubmitButton, this.props)));
  }

}

module.exports = RecorderScreen;

},{"./RecordButton":122,"./StopWatch":124,"./StreamStatus":125,"./SubmitButton":126,"preact":18}],122:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');
/**
 * Control screen capture recording. Will show record or stop button.
 */


module.exports = function RecordButton({
  recording,
  onStartRecording,
  onStopRecording,
  i18n
}) {
  if (recording) {
    return h("button", {
      className: "uppy-u-reset uppy-c-btn uppy-ScreenCapture-button uppy-ScreenCapture-button--video uppy-ScreenCapture-button--stop-rec",
      type: "button",
      title: i18n('stopCapturing'),
      "aria-label": i18n('stopCapturing'),
      onClick: onStopRecording,
      "data-uppy-super-focusable": true
    }, h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      className: "uppy-c-icon",
      width: "100",
      height: "100",
      viewBox: "0 0 100 100"
    }, h("rect", {
      x: "15",
      y: "15",
      width: "70",
      height: "70"
    })));
  }

  return h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-ScreenCapture-button uppy-ScreenCapture-button--video",
    type: "button",
    title: i18n('startCapturing'),
    "aria-label": i18n('startCapturing'),
    onClick: onStartRecording,
    "data-uppy-super-focusable": true
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "100",
    height: "100",
    viewBox: "0 0 100 100"
  }, h("circle", {
    cx: "50",
    cy: "50",
    r: "40"
  })));
};

},{"preact":18}],123:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = () => {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    width: "32",
    height: "32",
    viewBox: "0 0 32 32"
  }, h("g", {
    fill: "none",
    fillRule: "evenodd"
  }, h("rect", {
    className: "uppy-ProviderIconBg",
    fill: "#2C3E50",
    width: "32",
    height: "32",
    rx: "16"
  }), h("path", {
    d: "M24.182 9H7.818C6.81 9 6 9.742 6 10.667v10c0 .916.81 1.666 1.818 1.666h4.546V24h7.272v-1.667h4.546c1 0 1.809-.75 1.809-1.666l.009-10C26 9.742 25.182 9 24.182 9zM24 21H8V11h16v10z",
    fill: "#FFF",
    fillRule: "nonzero"
  }), h("circle", {
    fill: "#FFF",
    cx: "16",
    cy: "16",
    r: "2"
  })));
};

},{"preact":18}],124:[function(require,module,exports){
"use strict";

const {
  h,
  Component
} = require('preact');

class Stopwatch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      elapsedTime: 0
    };
    this.wrapperStyle = {
      width: '100%',
      height: '100%',
      display: 'flex'
    };
    this.overlayStyle = {
      position: 'absolute',
      width: '100%',
      height: '100%',
      background: 'black',
      opacity: 0.7
    };
    this.infoContainerStyle = {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginTop: 'auto',
      marginBottom: 'auto',
      zIndex: 1,
      color: 'white'
    };
    this.infotextStyle = {
      marginLeft: 'auto',
      marginRight: 'auto',
      marginBottom: '1rem',
      fontSize: '1.5rem'
    };
    this.timeStyle = {
      display: 'block',
      fontWeight: 'bold',
      marginLeft: 'auto',
      marginRight: 'auto',
      fontSize: '3rem',
      fontFamily: 'Courier New'
    };
  }

  startTimer() {
    this.timerTick();
    this.timerRunning = true;
  }

  resetTimer() {
    clearTimeout(this.timer);
    this.setState({
      elapsedTime: 0
    });
    this.timerRunning = false;
  }

  timerTick() {
    this.timer = setTimeout(() => {
      this.setState(state => ({
        elapsedTime: state.elapsedTime + 1
      }));
      this.timerTick();
    }, 1000);
  }

  fmtMSS(s) {
    // eslint-disable-next-line no-return-assign
    return (s - (s %= 60)) / 60 + (s > 9 ? ':' : ':0') + s;
  }

  render() {
    const {
      recording,
      i18n
    } = { ...this.props
    }; // second to minutes and seconds

    const minAndSec = this.fmtMSS(this.state.elapsedTime);

    if (recording && !this.timerRunning) {
      this.startTimer();
    }

    if (!recording && this.timerRunning) {
      this.resetTimer();
    }

    if (recording) {
      return h("div", {
        style: this.wrapperStyle
      }, h("div", {
        style: this.overlayStyle
      }), h("div", {
        style: this.infoContainerStyle
      }, h("div", {
        style: this.infotextStyle
      }, i18n('recording')), h("div", {
        style: this.timeStyle
      }, minAndSec)));
    }

    return null;
  }

}

module.exports = Stopwatch;

},{"preact":18}],125:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = ({
  streamActive,
  i18n
}) => {
  if (streamActive) {
    return h("div", {
      title: i18n('streamActive'),
      "aria-label": i18n('streamActive'),
      className: "uppy-ScreenCapture-icon--stream uppy-ScreenCapture-icon--streamActive"
    }, h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24"
    }, h("path", {
      d: "M0 0h24v24H0z",
      opacity: ".1",
      fill: "none"
    }), h("path", {
      d: "M0 0h24v24H0z",
      fill: "none"
    }), h("path", {
      d: "M1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm18-7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7zM1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11zm20-7H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"
    })));
  }

  return h("div", {
    title: i18n('streamPassive'),
    "aria-label": i18n('streamPassive'),
    className: "uppy-ScreenCapture-icon--stream"
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    width: "24",
    height: "24",
    viewBox: "0 0 24 24"
  }, h("path", {
    d: "M0 0h24v24H0z",
    opacity: ".1",
    fill: "none"
  }), h("path", {
    d: "M0 0h24v24H0z",
    fill: "none"
  }), h("path", {
    d: "M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM1 18v3h3c0-1.66-1.34-3-3-3zm0-4v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7zm0-4v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"
  })));
};

},{"preact":18}],126:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');
/**
 * Submit recorded video to uppy. Enabled when file is available
 */


module.exports = function SubmitButton({
  recording,
  recordedVideo,
  onSubmit,
  i18n
}) {
  if (recordedVideo && !recording) {
    return h("button", {
      className: "uppy-u-reset uppy-c-btn uppy-ScreenCapture-button uppy-ScreenCapture-button--submit",
      type: "button",
      title: i18n('submitRecordedFile'),
      "aria-label": i18n('submitRecordedFile'),
      onClick: onSubmit,
      "data-uppy-super-focusable": true
    }, h("svg", {
      width: "12",
      height: "9",
      viewBox: "0 0 12 9",
      xmlns: "http://www.w3.org/2000/svg",
      "aria-hidden": "true",
      focusable: "false",
      className: "uppy-c-icon"
    }, h("path", {
      fill: "#fff",
      fillRule: "nonzero",
      d: "M10.66 0L12 1.31 4.136 9 0 4.956l1.34-1.31L4.136 6.38z"
    })));
  }

  return null;
};

},{"preact":18}],127:[function(require,module,exports){
"use strict";

var _class, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const {
  h
} = require('preact');

const {
  UIPlugin
} = require('./../../core');

const getFileTypeExtension = require('./../../utils/lib/getFileTypeExtension');

const ScreenRecIcon = require('./ScreenRecIcon');

const CaptureScreen = require('./CaptureScreen');

const locale = require('./locale'); // Adapted from: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia


function getMediaDevices() {
  // check if screen capturing is supported
  return window.MediaRecorder && navigator.mediaDevices; // eslint-disable-line compat/compat
}
/**
 * Screen capture
 */


module.exports = (_temp = _class = class ScreenCapture extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.mediaDevices = getMediaDevices(); // eslint-disable-next-line no-restricted-globals

    this.protocol = location.protocol === 'https:' ? 'https' : 'http';
    this.id = this.opts.id || 'ScreenCapture';
    this.title = this.opts.title || 'Screencast';
    this.type = 'acquirer';
    this.icon = ScreenRecIcon;
    this.defaultLocale = locale; // set default options
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints

    const defaultOptions = {
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#Properties_of_shared_screen_tracks
      displayMediaConstraints: {
        video: {
          width: 1280,
          height: 720,
          frameRate: {
            ideal: 3,
            max: 5
          },
          cursor: 'motion',
          displaySurface: 'monitor'
        }
      },
      // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints/audio
      userMediaConstraints: {
        audio: true
      },
      preferredVideoMimeType: 'video/webm'
    }; // merge default options with the ones set by user

    this.opts = { ...defaultOptions,
      ...opts
    }; // i18n

    this.i18nInit(); // uppy plugin class related

    this.install = this.install.bind(this);
    this.setPluginState = this.setPluginState.bind(this);
    this.render = this.render.bind(this); // screen capturer related

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.submit = this.submit.bind(this);
    this.streamInterrupted = this.streamInactivated.bind(this); // initialize

    this.captureActive = false;
    this.capturedMediaFile = null;
  }

  install() {
    // Return if browser doesn’t support getDisplayMedia and
    if (!this.mediaDevices) {
      this.uppy.log('Screen recorder access is not supported', 'error');
      return null;
    }

    this.setPluginState({
      streamActive: false,
      audioStreamActive: false
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    if (this.videoStream) {
      this.stop();
    }

    this.unmount();
  }

  start() {
    if (!this.mediaDevices) {
      return Promise.reject(new Error('Screen recorder access not supported'));
    }

    this.captureActive = true;
    this.selectAudioStreamSource();
    this.selectVideoStreamSource().then(res => {
      // something happened in start -> return
      if (res === false) {
        // Close the Dashboard panel if plugin is installed
        // into Dashboard (could be other parent UI plugin)
        if (this.parent && this.parent.hideAllPanels) {
          this.parent.hideAllPanels();
          this.captureActive = false;
        }
      }
    });
  }

  selectVideoStreamSource() {
    // if active stream available, return it
    if (this.videoStream) {
      return new Promise(resolve => resolve(this.videoStream));
    } // ask user to select source to record and get mediastream from that
    // eslint-disable-next-line compat/compat


    return this.mediaDevices.getDisplayMedia(this.opts.displayMediaConstraints).then(videoStream => {
      this.videoStream = videoStream; // add event listener to stop recording if stream is interrupted

      this.videoStream.addEventListener('inactive', () => {
        this.streamInactivated();
      });
      this.setPluginState({
        streamActive: true
      });
      return videoStream;
    }).catch(err => {
      this.setPluginState({
        screenRecError: err
      });
      this.userDenied = true;
      setTimeout(() => {
        this.userDenied = false;
      }, 1000);
      return false;
    });
  }

  selectAudioStreamSource() {
    // if active stream available, return it
    if (this.audioStream) {
      return new Promise(resolve => resolve(this.audioStream));
    } // ask user to select source to record and get mediastream from that
    // eslint-disable-next-line compat/compat


    return this.mediaDevices.getUserMedia(this.opts.userMediaConstraints).then(audioStream => {
      this.audioStream = audioStream;
      this.setPluginState({
        audioStreamActive: true
      });
      return audioStream;
    }).catch(err => {
      if (err.name === 'NotAllowedError') {
        this.uppy.info(this.i18n('micDisabled'), 'error', 5000);
      }

      return false;
    });
  }

  startRecording() {
    const options = {};
    this.capturedMediaFile = null;
    this.recordingChunks = [];
    const {
      preferredVideoMimeType
    } = this.opts;
    this.selectVideoStreamSource().then(videoStream => {
      // Attempt to use the passed preferredVideoMimeType (if any) during recording.
      // If the browser doesn't support it, we'll fall back to the browser default instead
      if (preferredVideoMimeType && MediaRecorder.isTypeSupported(preferredVideoMimeType) && getFileTypeExtension(preferredVideoMimeType)) {
        options.mimeType = preferredVideoMimeType;
      } // prepare tracks


      const tracks = [videoStream.getVideoTracks()[0]]; // merge audio if exits

      if (this.audioStream) {
        tracks.push(this.audioStream.getAudioTracks()[0]);
      } // create new stream from video and audio
      // eslint-disable-next-line compat/compat


      this.outputStream = new MediaStream(tracks); // initialize mediarecorder
      // eslint-disable-next-line compat/compat

      this.recorder = new MediaRecorder(this.outputStream, options); // push data to buffer when data available

      this.recorder.addEventListener('dataavailable', event => {
        this.recordingChunks.push(event.data);
      }); // start recording

      this.recorder.start(); // set plugin state to recording

      this.setPluginState({
        recording: true
      });
    }).catch(err => {
      this.uppy.log(err, 'error');
    });
  }

  streamInactivated() {
    // get screen recorder state
    const {
      recordedVideo,
      recording
    } = { ...this.getPluginState()
    };

    if (!recordedVideo && !recording) {
      // Close the Dashboard panel if plugin is installed
      // into Dashboard (could be other parent UI plugin)
      if (this.parent && this.parent.hideAllPanels) {
        this.parent.hideAllPanels();
      }
    } else if (recording) {
      // stop recorder if it is active
      this.uppy.log('Capture stream inactive — stop recording');
      this.stopRecording();
    }

    this.videoStream = null;
    this.audioStream = null;
    this.setPluginState({
      streamActive: false,
      audioStreamActive: false
    });
  }

  stopRecording() {
    const stopped = new Promise(resolve => {
      this.recorder.addEventListener('stop', () => {
        resolve();
      });
      this.recorder.stop();
    });
    return stopped.then(() => {
      // recording stopped
      this.setPluginState({
        recording: false
      }); // get video file after recorder stopped

      return this.getVideo();
    }).then(file => {
      // store media file
      this.capturedMediaFile = file; // create object url for capture result preview

      this.setPluginState({
        // eslint-disable-next-line compat/compat
        recordedVideo: URL.createObjectURL(file.data)
      });
    }).then(() => {
      this.recordingChunks = null;
      this.recorder = null;
    }, error => {
      this.recordingChunks = null;
      this.recorder = null;
      throw error;
    });
  }

  submit() {
    try {
      // add recorded file to uppy
      if (this.capturedMediaFile) {
        this.uppy.addFile(this.capturedMediaFile);
      }
    } catch (err) {
      // Logging the error, exept restrictions, which is handled in Core
      if (!err.isRestriction) {
        this.uppy.log(err, 'error');
      }
    }
  }

  stop() {
    // flush video stream
    if (this.videoStream) {
      this.videoStream.getVideoTracks().forEach(track => {
        track.stop();
      });
      this.videoStream.getAudioTracks().forEach(track => {
        track.stop();
      });
      this.videoStream = null;
    } // flush audio stream


    if (this.audioStream) {
      this.audioStream.getAudioTracks().forEach(track => {
        track.stop();
      });
      this.audioStream.getVideoTracks().forEach(track => {
        track.stop();
      });
      this.audioStream = null;
    } // flush output stream


    if (this.outputStream) {
      this.outputStream.getAudioTracks().forEach(track => {
        track.stop();
      });
      this.outputStream.getVideoTracks().forEach(track => {
        track.stop();
      });
      this.outputStream = null;
    } // remove preview video


    this.setPluginState({
      recordedVideo: null
    });
    this.captureActive = false;
  }

  getVideo() {
    const mimeType = this.recordingChunks[0].type;
    const fileExtension = getFileTypeExtension(mimeType);

    if (!fileExtension) {
      return Promise.reject(new Error(`Could not retrieve recording: Unsupported media type "${mimeType}"`));
    }

    const name = `screencap-${Date.now()}.${fileExtension}`;
    const blob = new Blob(this.recordingChunks, {
      type: mimeType
    });
    const file = {
      source: this.id,
      name,
      data: new Blob([blob], {
        type: mimeType
      }),
      type: mimeType
    };
    return Promise.resolve(file);
  }

  render() {
    // get screen recorder state
    const recorderState = this.getPluginState();

    if (!recorderState.streamActive && !this.captureActive && !this.userDenied) {
      this.start();
    }

    return h(CaptureScreen, _extends({}, recorderState, {
      onStartRecording: this.startRecording,
      onStopRecording: this.stopRecording,
      onStop: this.stop,
      onSubmit: this.submit,
      i18n: this.i18n,
      stream: this.videoStream
    }));
  }

}, _class.VERSION = "2.0.4", _temp);

},{"./../../core":48,"./../../utils/lib/getFileTypeExtension":164,"./CaptureScreen":121,"./ScreenRecIcon":123,"./locale":128,"preact":18}],128:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    startCapturing: 'Begin screen capturing',
    stopCapturing: 'Stop screen capturing',
    submitRecordedFile: 'Submit recorded file',
    streamActive: 'Stream active',
    streamPassive: 'Stream passive',
    micDisabled: 'Microphone access denied by user',
    recording: 'Recording'
  }
};

},{}],129:[function(require,module,exports){
"use strict";

const classNames = require('classnames');

const throttle = require('lodash.throttle');

const prettierBytes = require('@transloadit/prettier-bytes');

const prettyETA = require('./../../utils/lib/prettyETA');

const {
  h
} = require('preact');

const statusBarStates = require('./StatusBarStates');

const DOT = `\u00B7`;

const renderDot = () => ` ${DOT} `;

function UploadBtn(props) {
  const {
    newFiles,
    isUploadStarted,
    recoveredState,
    i18n,
    uploadState,
    isSomeGhost,
    startUpload
  } = props;
  const uploadBtnClassNames = classNames('uppy-u-reset', 'uppy-c-btn', 'uppy-StatusBar-actionBtn', 'uppy-StatusBar-actionBtn--upload', {
    'uppy-c-btn-primary': uploadState === statusBarStates.STATE_WAITING
  }, {
    'uppy-StatusBar-actionBtn--disabled': isSomeGhost
  });
  const uploadBtnText = newFiles && isUploadStarted && !recoveredState ? i18n('uploadXNewFiles', {
    smart_count: newFiles
  }) : i18n('uploadXFiles', {
    smart_count: newFiles
  });
  return h("button", {
    type: "button",
    className: uploadBtnClassNames,
    "aria-label": i18n('uploadXFiles', {
      smart_count: newFiles
    }),
    onClick: startUpload,
    disabled: isSomeGhost,
    "data-uppy-super-focusable": true
  }, uploadBtnText);
}

function RetryBtn(props) {
  const {
    i18n,
    uppy
  } = props;
  return h("button", {
    type: "button",
    className: "uppy-u-reset uppy-c-btn uppy-StatusBar-actionBtn uppy-StatusBar-actionBtn--retry",
    "aria-label": i18n('retryUpload'),
    onClick: () => uppy.retryAll(),
    "data-uppy-super-focusable": true
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "8",
    height: "10",
    viewBox: "0 0 8 10"
  }, h("path", {
    d: "M4 2.408a2.75 2.75 0 1 0 2.75 2.75.626.626 0 0 1 1.25.018v.023a4 4 0 1 1-4-4.041V.25a.25.25 0 0 1 .389-.208l2.299 1.533a.25.25 0 0 1 0 .416l-2.3 1.533A.25.25 0 0 1 4 3.316v-.908z"
  })), i18n('retry'));
}

function CancelBtn(props) {
  const {
    i18n,
    uppy
  } = props;
  return h("button", {
    type: "button",
    className: "uppy-u-reset uppy-StatusBar-actionCircleBtn",
    title: i18n('cancel'),
    "aria-label": i18n('cancel'),
    onClick: () => uppy.cancelAll(),
    "data-uppy-super-focusable": true
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16"
  }, h("g", {
    fill: "none",
    fillRule: "evenodd"
  }, h("circle", {
    fill: "#888",
    cx: "8",
    cy: "8",
    r: "8"
  }), h("path", {
    fill: "#FFF",
    d: "M9.283 8l2.567 2.567-1.283 1.283L8 9.283 5.433 11.85 4.15 10.567 6.717 8 4.15 5.433 5.433 4.15 8 6.717l2.567-2.567 1.283 1.283z"
  }))));
}

function PauseResumeButton(props) {
  const {
    isAllPaused,
    i18n,
    isAllComplete,
    resumableUploads,
    uppy
  } = props;
  const title = isAllPaused ? i18n('resume') : i18n('pause');

  function togglePauseResume() {
    if (isAllComplete) return null;

    if (!resumableUploads) {
      return uppy.cancelAll();
    }

    if (isAllPaused) {
      return uppy.resumeAll();
    }

    return uppy.pauseAll();
  }

  return h("button", {
    title: title,
    "aria-label": title,
    className: "uppy-u-reset uppy-StatusBar-actionCircleBtn",
    type: "button",
    onClick: togglePauseResume,
    "data-uppy-super-focusable": true
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "16",
    height: "16",
    viewBox: "0 0 16 16"
  }, h("g", {
    fill: "none",
    fillRule: "evenodd"
  }, h("circle", {
    fill: "#888",
    cx: "8",
    cy: "8",
    r: "8"
  }), h("path", {
    fill: "#FFF",
    d: isAllPaused ? 'M6 4.25L11.5 8 6 11.75z' : 'M5 4.5h2v7H5v-7zm4 0h2v7H9v-7z'
  }))));
}

function DoneBtn(props) {
  const {
    i18n,
    doneButtonHandler
  } = props;
  return h("button", {
    type: "button",
    className: "uppy-u-reset uppy-c-btn uppy-StatusBar-actionBtn uppy-StatusBar-actionBtn--done",
    onClick: doneButtonHandler,
    "data-uppy-super-focusable": true
  }, i18n('done'));
}

function LoadingSpinner() {
  return h("svg", {
    className: "uppy-StatusBar-spinner",
    "aria-hidden": "true",
    focusable: "false",
    width: "14",
    height: "14"
  }, h("path", {
    d: "M13.983 6.547c-.12-2.509-1.64-4.893-3.939-5.936-2.48-1.127-5.488-.656-7.556 1.094C.524 3.367-.398 6.048.162 8.562c.556 2.495 2.46 4.52 4.94 5.183 2.932.784 5.61-.602 7.256-3.015-1.493 1.993-3.745 3.309-6.298 2.868-2.514-.434-4.578-2.349-5.153-4.84a6.226 6.226 0 0 1 2.98-6.778C6.34.586 9.74 1.1 11.373 3.493c.407.596.693 1.282.842 1.988.127.598.073 1.197.161 1.794.078.525.543 1.257 1.15.864.525-.341.49-1.05.456-1.592-.007-.15.02.3 0 0",
    fillRule: "evenodd"
  }));
}

function ProgressBarProcessing(props) {
  const {
    progress
  } = props;
  const {
    value,
    mode,
    message
  } = progress;
  const roundedValue = Math.round(value * 100);
  const dot = `\u00B7`;
  return h("div", {
    className: "uppy-StatusBar-content"
  }, h(LoadingSpinner, null), mode === 'determinate' ? `${roundedValue}% ${dot} ` : '', message);
}

function ProgressDetails(props) {
  const {
    numUploads,
    complete,
    totalUploadedSize,
    totalSize,
    totalETA,
    i18n
  } = props;
  const ifShowFilesUploadedOfTotal = numUploads > 1;
  return h("div", {
    className: "uppy-StatusBar-statusSecondary"
  }, ifShowFilesUploadedOfTotal && i18n('filesUploadedOfTotal', {
    complete,
    smart_count: numUploads
  }), h("span", {
    className: "uppy-StatusBar-additionalInfo"
  }, ifShowFilesUploadedOfTotal && renderDot(), i18n('dataUploadedOfTotal', {
    complete: prettierBytes(totalUploadedSize),
    total: prettierBytes(totalSize)
  }), renderDot(), i18n('xTimeLeft', {
    time: prettyETA(totalETA)
  })));
}

function FileUploadCount(props) {
  const {
    i18n,
    complete,
    numUploads
  } = props;
  return h("div", {
    className: "uppy-StatusBar-statusSecondary"
  }, i18n('filesUploadedOfTotal', {
    complete,
    smart_count: numUploads
  }));
}

function UploadNewlyAddedFiles(props) {
  const {
    i18n,
    newFiles,
    startUpload
  } = props;
  const uploadBtnClassNames = classNames('uppy-u-reset', 'uppy-c-btn', 'uppy-StatusBar-actionBtn', 'uppy-StatusBar-actionBtn--uploadNewlyAdded');
  return h("div", {
    className: "uppy-StatusBar-statusSecondary"
  }, h("div", {
    className: "uppy-StatusBar-statusSecondaryHint"
  }, i18n('xMoreFilesAdded', {
    smart_count: newFiles
  })), h("button", {
    type: "button",
    className: uploadBtnClassNames,
    "aria-label": i18n('uploadXFiles', {
      smart_count: newFiles
    }),
    onClick: startUpload
  }, i18n('upload')));
}

const ThrottledProgressDetails = throttle(ProgressDetails, 500, {
  leading: true,
  trailing: true
});

function ProgressBarUploading(props) {
  const {
    i18n,
    supportsUploadProgress,
    totalProgress,
    showProgressDetails,
    isUploadStarted,
    isAllComplete,
    isAllPaused,
    newFiles,
    numUploads,
    complete,
    totalUploadedSize,
    totalSize,
    totalETA,
    startUpload
  } = props;
  const showUploadNewlyAddedFiles = newFiles && isUploadStarted;

  if (!isUploadStarted || isAllComplete) {
    return null;
  }

  const title = isAllPaused ? i18n('paused') : i18n('uploading');

  function renderProgressDetails() {
    if (!isAllPaused && !showUploadNewlyAddedFiles && showProgressDetails) {
      if (supportsUploadProgress) {
        return h(ThrottledProgressDetails, {
          numUploads: numUploads,
          complete: complete,
          totalUploadedSize: totalUploadedSize,
          totalSize: totalSize,
          totalETA: totalETA,
          i18n: i18n
        });
      }

      return h(FileUploadCount, {
        i18n: i18n,
        complete: complete,
        numUploads: numUploads
      });
    }

    return null;
  }

  return h("div", {
    className: "uppy-StatusBar-content",
    "aria-label": title,
    title: title
  }, !isAllPaused ? h(LoadingSpinner, null) : null, h("div", {
    className: "uppy-StatusBar-status"
  }, h("div", {
    className: "uppy-StatusBar-statusPrimary"
  }, supportsUploadProgress ? `${title}: ${totalProgress}%` : title), renderProgressDetails(), showUploadNewlyAddedFiles ? h(UploadNewlyAddedFiles, {
    i18n: i18n,
    newFiles: newFiles,
    startUpload: startUpload
  }) : null));
}

function ProgressBarComplete(props) {
  const {
    i18n
  } = props;
  return h("div", {
    className: "uppy-StatusBar-content",
    role: "status",
    title: i18n('complete')
  }, h("div", {
    className: "uppy-StatusBar-status"
  }, h("div", {
    className: "uppy-StatusBar-statusPrimary"
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-StatusBar-statusIndicator uppy-c-icon",
    width: "15",
    height: "11",
    viewBox: "0 0 15 11"
  }, h("path", {
    d: "M.414 5.843L1.627 4.63l3.472 3.472L13.202 0l1.212 1.213L5.1 10.528z"
  })), i18n('complete'))));
}

function ProgressBarError(props) {
  const {
    error,
    i18n,
    complete,
    numUploads
  } = props;

  function displayErrorAlert() {
    const errorMessage = `${i18n('uploadFailed')} \n\n ${error}`; // eslint-disable-next-line no-alert

    alert(errorMessage); // TODO: move to custom alert implementation
  }

  return h("div", {
    className: "uppy-StatusBar-content",
    title: i18n('uploadFailed')
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-StatusBar-statusIndicator uppy-c-icon",
    width: "11",
    height: "11",
    viewBox: "0 0 11 11"
  }, h("path", {
    d: "M4.278 5.5L0 1.222 1.222 0 5.5 4.278 9.778 0 11 1.222 6.722 5.5 11 9.778 9.778 11 5.5 6.722 1.222 11 0 9.778z"
  })), h("div", {
    className: "uppy-StatusBar-status"
  }, h("div", {
    className: "uppy-StatusBar-statusPrimary"
  }, i18n('uploadFailed'), h("button", {
    className: "uppy-u-reset uppy-StatusBar-details",
    "aria-label": i18n('showErrorDetails'),
    "data-microtip-position": "top-right",
    "data-microtip-size": "medium",
    onClick: displayErrorAlert,
    type: "button"
  }, "?")), h(FileUploadCount, {
    i18n: i18n,
    complete: complete,
    numUploads: numUploads
  })));
}

module.exports = {
  UploadBtn,
  RetryBtn,
  CancelBtn,
  PauseResumeButton,
  DoneBtn,
  LoadingSpinner,
  ProgressDetails,
  ProgressBarProcessing,
  ProgressBarError,
  ProgressBarUploading,
  ProgressBarComplete
};

},{"./../../utils/lib/prettyETA":176,"./StatusBarStates":131,"@transloadit/prettier-bytes":1,"classnames":4,"lodash.throttle":11,"preact":18}],130:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const classNames = require('classnames');

const statusBarStates = require('./StatusBarStates');

const calculateProcessingProgress = require('./calculateProcessingProgress');

const {
  UploadBtn,
  RetryBtn,
  CancelBtn,
  PauseResumeButton,
  DoneBtn,
  ProgressBarProcessing,
  ProgressBarError,
  ProgressBarUploading,
  ProgressBarComplete
} = require('./Components');

const {
  STATE_ERROR,
  STATE_WAITING,
  STATE_PREPROCESSING,
  STATE_UPLOADING,
  STATE_POSTPROCESSING,
  STATE_COMPLETE
} = statusBarStates;
module.exports = StatusBar;

function StatusBar(props) {
  const {
    newFiles,
    allowNewUpload,
    isUploadInProgress,
    isAllPaused,
    resumableUploads,
    error,
    hideUploadButton,
    hidePauseResumeButton,
    hideCancelButton,
    hideRetryButton,
    recoveredState,
    uploadState,
    totalProgress,
    files,
    supportsUploadProgress,
    hideAfterFinish,
    isSomeGhost,
    isTargetDOMEl,
    doneButtonHandler,
    isUploadStarted,
    i18n,
    startUpload,
    uppy,
    isAllComplete,
    showProgressDetails,
    numUploads,
    complete,
    totalSize,
    totalETA,
    totalUploadedSize
  } = props;

  function getProgressValue() {
    switch (uploadState) {
      case STATE_POSTPROCESSING:
      case STATE_PREPROCESSING:
        {
          const progress = calculateProcessingProgress(files);

          if (progress.mode === 'determinate') {
            return progress.value * 100;
          }

          return totalProgress;
        }

      case STATE_ERROR:
        {
          return null;
        }

      case STATE_UPLOADING:
        {
          if (!supportsUploadProgress) {
            return null;
          }

          return totalProgress;
        }

      default:
        return totalProgress;
    }
  }

  function getIsIndeterminate() {
    switch (uploadState) {
      case STATE_POSTPROCESSING:
      case STATE_PREPROCESSING:
        {
          const {
            mode
          } = calculateProcessingProgress(files);
          return mode === 'indeterminate';
        }

      case STATE_UPLOADING:
        {
          if (!supportsUploadProgress) {
            return true;
          }

          return false;
        }

      default:
        return false;
    }
  }

  function getIsHidden() {
    if (recoveredState) {
      return false;
    }

    switch (uploadState) {
      case STATE_WAITING:
        return hideUploadButton || newFiles === 0;

      case STATE_COMPLETE:
        return hideAfterFinish;

      default:
        return false;
    }
  }

  const progressValue = getProgressValue();
  const isHidden = getIsHidden();
  const width = progressValue != null ? progressValue : 100;
  const showUploadBtn = !error && newFiles && !isUploadInProgress && !isAllPaused && allowNewUpload && !hideUploadButton;
  const showCancelBtn = !hideCancelButton && uploadState !== STATE_WAITING && uploadState !== STATE_COMPLETE;
  const showPauseResumeBtn = resumableUploads && !hidePauseResumeButton && uploadState === STATE_UPLOADING;
  const showRetryBtn = error && !isAllComplete && !hideRetryButton;
  const showDoneBtn = doneButtonHandler && uploadState === STATE_COMPLETE;
  const progressClassNames = classNames('uppy-StatusBar-progress', {
    'is-indeterminate': getIsIndeterminate()
  });
  const statusBarClassNames = classNames({
    'uppy-Root': isTargetDOMEl
  }, 'uppy-StatusBar', `is-${uploadState}`, {
    'has-ghosts': isSomeGhost
  });
  return h("div", {
    className: statusBarClassNames,
    "aria-hidden": isHidden
  }, h("div", {
    className: progressClassNames,
    style: {
      width: `${width}%`
    },
    role: "progressbar",
    "aria-label": `${width}%`,
    "aria-valuetext": `${width}%`,
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": progressValue
  }), (() => {
    switch (uploadState) {
      case STATE_PREPROCESSING:
      case STATE_POSTPROCESSING:
        return h(ProgressBarProcessing, {
          progress: calculateProcessingProgress(files)
        });

      case STATE_COMPLETE:
        return h(ProgressBarComplete, {
          i18n: i18n
        });

      case STATE_ERROR:
        return h(ProgressBarError, {
          error: error,
          i18n: i18n,
          numUploads: numUploads,
          complete: complete
        });

      case STATE_UPLOADING:
        return h(ProgressBarUploading, {
          i18n: i18n,
          supportsUploadProgress: supportsUploadProgress,
          totalProgress: totalProgress,
          showProgressDetails: showProgressDetails,
          isUploadStarted: isUploadStarted,
          isAllComplete: isAllComplete,
          isAllPaused: isAllPaused,
          newFiles: newFiles,
          numUploads: numUploads,
          complete: complete,
          totalUploadedSize: totalUploadedSize,
          totalSize: totalSize,
          totalETA: totalETA,
          startUpload: startUpload
        });

      default:
        return null;
    }
  })(), h("div", {
    className: "uppy-StatusBar-actions"
  }, recoveredState || showUploadBtn ? h(UploadBtn, {
    newFiles: newFiles,
    isUploadStarted: isUploadStarted,
    recoveredState: recoveredState,
    i18n: i18n,
    isSomeGhost: isSomeGhost,
    startUpload: startUpload,
    uploadState: uploadState
  }) : null, showRetryBtn ? h(RetryBtn, {
    i18n: i18n,
    uppy: uppy
  }) : null, showPauseResumeBtn ? h(PauseResumeButton, {
    isAllPaused: isAllPaused,
    i18n: i18n,
    isAllComplete: isAllComplete,
    resumableUploads: resumableUploads,
    uppy: uppy
  }) : null, showCancelBtn ? h(CancelBtn, {
    i18n: i18n,
    uppy: uppy
  }) : null, showDoneBtn ? h(DoneBtn, {
    i18n: i18n,
    doneButtonHandler: doneButtonHandler
  }) : null));
}

},{"./Components":129,"./StatusBarStates":131,"./calculateProcessingProgress":132,"classnames":4,"preact":18}],131:[function(require,module,exports){
"use strict";

module.exports = {
  STATE_ERROR: 'error',
  STATE_WAITING: 'waiting',
  STATE_PREPROCESSING: 'preprocessing',
  STATE_UPLOADING: 'uploading',
  STATE_POSTPROCESSING: 'postprocessing',
  STATE_COMPLETE: 'complete'
};

},{}],132:[function(require,module,exports){
"use strict";

module.exports = function calculateProcessingProgress(files) {
  const values = [];
  let mode;
  let message;

  for (const {
    progress
  } of Object.values(files)) {
    const {
      preprocess,
      postprocess
    } = progress; // In the future we should probably do this differently. For now we'll take the
    // mode and message from the first file…

    if (message == null && (preprocess || postprocess)) {
      ({
        mode,
        message
      } = preprocess || postprocess);
    }

    if ((preprocess == null ? void 0 : preprocess.mode) === 'determinate') values.push(preprocess.value);
    if ((postprocess == null ? void 0 : postprocess.mode) === 'determinate') values.push(postprocess.value);
  }

  const value = values.reduce((total, progressValue) => {
    return total + progressValue / values.length;
  }, 0);
  return {
    mode,
    message,
    value
  };
};

},{}],133:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const getSpeed = require('./../../utils/lib/getSpeed');

const getBytesRemaining = require('./../../utils/lib/getBytesRemaining');

const getTextDirection = require('./../../utils/lib/getTextDirection');

const statusBarStates = require('./StatusBarStates');

const StatusBarUI = require('./StatusBar');

const locale = require('./locale.js');
/**
 * StatusBar: renders a status bar with upload/pause/resume/cancel/retry buttons,
 * progress percentage and time remaining.
 */


module.exports = (_temp = _class = class StatusBar extends UIPlugin {
  // eslint-disable-next-line global-require
  constructor(uppy, opts) {
    super(uppy, opts);

    this.startUpload = () => {
      const {
        recoveredState
      } = this.uppy.getState();

      if (recoveredState) {
        this.uppy.emit('restore-confirmed');
        return undefined;
      }

      return this.uppy.upload().catch(() => {// Error logged in Core
      });
    };

    this.id = this.opts.id || 'StatusBar';
    this.title = 'StatusBar';
    this.type = 'progressindicator';
    this.defaultLocale = locale; // set default options

    const defaultOptions = {
      target: 'body',
      hideUploadButton: false,
      hideRetryButton: false,
      hidePauseResumeButton: false,
      hideCancelButton: false,
      showProgressDetails: false,
      hideAfterFinish: true,
      doneButtonHandler: null
    };
    this.opts = { ...defaultOptions,
      ...opts
    };
    this.i18nInit();
    this.render = this.render.bind(this);
    this.install = this.install.bind(this);
  }

  render(state) {
    const {
      capabilities,
      files,
      allowNewUpload,
      totalProgress,
      error,
      recoveredState
    } = state;
    const {
      newFiles,
      startedFiles,
      completeFiles,
      inProgressNotPausedFiles,
      isUploadStarted,
      isAllComplete,
      isAllErrored,
      isAllPaused,
      isUploadInProgress,
      isSomeGhost
    } = this.uppy.getObjectOfFilesPerState(); // If some state was recovered, we want to show Upload button/counter
    // for all the files, because in this case it’s not an Upload button,
    // but “Confirm Restore Button”

    const newFilesOrRecovered = recoveredState ? Object.values(files) : newFiles;
    const totalETA = getTotalETA(inProgressNotPausedFiles);
    const resumableUploads = !!capabilities.resumableUploads;
    const supportsUploadProgress = capabilities.uploadProgress !== false;
    let totalSize = 0;
    let totalUploadedSize = 0;
    startedFiles.forEach(file => {
      totalSize += file.progress.bytesTotal || 0;
      totalUploadedSize += file.progress.bytesUploaded || 0;
    });
    return StatusBarUI({
      error,
      uploadState: getUploadingState(error, isAllComplete, recoveredState, state.files || {}),
      allowNewUpload,
      totalProgress,
      totalSize,
      totalUploadedSize,
      isAllComplete: false,
      isAllPaused,
      isAllErrored,
      isUploadStarted,
      isUploadInProgress,
      isSomeGhost,
      recoveredState,
      complete: completeFiles.length,
      newFiles: newFilesOrRecovered.length,
      numUploads: startedFiles.length,
      totalETA,
      files,
      i18n: this.i18n,
      uppy: this.uppy,
      startUpload: this.startUpload,
      doneButtonHandler: this.opts.doneButtonHandler,
      resumableUploads,
      supportsUploadProgress,
      showProgressDetails: this.opts.showProgressDetails,
      hideUploadButton: this.opts.hideUploadButton,
      hideRetryButton: this.opts.hideRetryButton,
      hidePauseResumeButton: this.opts.hidePauseResumeButton,
      hideCancelButton: this.opts.hideCancelButton,
      hideAfterFinish: this.opts.hideAfterFinish,
      isTargetDOMEl: this.isTargetDOMEl
    });
  }

  onMount() {
    // Set the text direction if the page has not defined one.
    const element = this.el;
    const direction = getTextDirection(element);

    if (!direction) {
      element.dir = 'ltr';
    }
  }

  install() {
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.unmount();
  }

}, _class.VERSION = "2.1.1", _temp);

function getTotalSpeed(files) {
  let totalSpeed = 0;
  files.forEach(file => {
    totalSpeed += getSpeed(file.progress);
  });
  return totalSpeed;
}

function getTotalETA(files) {
  const totalSpeed = getTotalSpeed(files);

  if (totalSpeed === 0) {
    return 0;
  }

  const totalBytesRemaining = files.reduce((total, file) => {
    return total + getBytesRemaining(file.progress);
  }, 0);
  return Math.round(totalBytesRemaining / totalSpeed * 10) / 10;
}

function getUploadingState(error, isAllComplete, recoveredState, files) {
  if (error && !isAllComplete) {
    return statusBarStates.STATE_ERROR;
  }

  if (isAllComplete) {
    return statusBarStates.STATE_COMPLETE;
  }

  if (recoveredState) {
    return statusBarStates.STATE_WAITING;
  }

  let state = statusBarStates.STATE_WAITING;
  const fileIDs = Object.keys(files);

  for (let i = 0; i < fileIDs.length; i++) {
    const {
      progress
    } = files[fileIDs[i]]; // If ANY files are being uploaded right now, show the uploading state.

    if (progress.uploadStarted && !progress.uploadComplete) {
      return statusBarStates.STATE_UPLOADING;
    } // If files are being preprocessed AND postprocessed at this time, we show the
    // preprocess state. If any files are being uploaded we show uploading.


    if (progress.preprocess && state !== statusBarStates.STATE_UPLOADING) {
      state = statusBarStates.STATE_PREPROCESSING;
    } // If NO files are being preprocessed or uploaded right now, but some files are
    // being postprocessed, show the postprocess state.


    if (progress.postprocess && state !== statusBarStates.STATE_UPLOADING && state !== statusBarStates.STATE_PREPROCESSING) {
      state = statusBarStates.STATE_POSTPROCESSING;
    }
  }

  return state;
}

},{"./../../core":48,"./../../utils/lib/getBytesRemaining":156,"./../../utils/lib/getSpeed":166,"./../../utils/lib/getTextDirection":167,"./StatusBar":130,"./StatusBarStates":131,"./locale.js":134}],134:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    // Shown in the status bar while files are being uploaded.
    uploading: 'Uploading',
    // Shown in the status bar once all files have been uploaded.
    complete: 'Complete',
    // Shown in the status bar if an upload failed.
    uploadFailed: 'Upload failed',
    // Shown in the status bar while the upload is paused.
    paused: 'Paused',
    // Used as the label for the button that retries an upload.
    retry: 'Retry',
    // Used as the label for the button that cancels an upload.
    cancel: 'Cancel',
    // Used as the label for the button that pauses an upload.
    pause: 'Pause',
    // Used as the label for the button that resumes an upload.
    resume: 'Resume',
    // Used as the label for the button that resets the upload state after an upload
    done: 'Done',
    // When `showProgressDetails` is set, shows the number of files that have been fully uploaded so far.
    filesUploadedOfTotal: {
      0: '%{complete} of %{smart_count} file uploaded',
      1: '%{complete} of %{smart_count} files uploaded'
    },
    // When `showProgressDetails` is set, shows the amount of bytes that have been uploaded so far.
    dataUploadedOfTotal: '%{complete} of %{total}',
    // When `showProgressDetails` is set, shows an estimation of how long the upload will take to complete.
    xTimeLeft: '%{time} left',
    // Used as the label for the button that starts an upload.
    uploadXFiles: {
      0: 'Upload %{smart_count} file',
      1: 'Upload %{smart_count} files'
    },
    // Used as the label for the button that starts an upload, if another upload has been started in the past
    // and new files were added later.
    uploadXNewFiles: {
      0: 'Upload +%{smart_count} file',
      1: 'Upload +%{smart_count} files'
    },
    upload: 'Upload',
    retryUpload: 'Retry upload',
    xMoreFilesAdded: {
      0: '%{smart_count} more file added',
      1: '%{smart_count} more files added'
    },
    showErrorDetails: 'Show error details'
  }
};

},{}],135:[function(require,module,exports){
"use strict";

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var _publish = /*#__PURE__*/_classPrivateFieldLooseKey("publish");

/**
 * Default store that keeps state in a simple object.
 */
class DefaultStore {
  constructor() {
    Object.defineProperty(this, _publish, {
      value: _publish2
    });
    this.state = {};
    this.callbacks = [];
  }

  getState() {
    return this.state;
  }

  setState(patch) {
    const prevState = { ...this.state
    };
    const nextState = { ...this.state,
      ...patch
    };
    this.state = nextState;

    _classPrivateFieldLooseBase(this, _publish)[_publish](prevState, nextState, patch);
  }

  subscribe(listener) {
    this.callbacks.push(listener);
    return () => {
      // Remove the listener.
      this.callbacks.splice(this.callbacks.indexOf(listener), 1);
    };
  }

}

function _publish2(...args) {
  this.callbacks.forEach(listener => {
    listener(...args);
  });
}

DefaultStore.VERSION = "2.0.2";

module.exports = function defaultStore() {
  return new DefaultStore();
};

},{}],136:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const dataURItoBlob = require('./../../utils/lib/dataURItoBlob');

const isObjectURL = require('./../../utils/lib/isObjectURL');

const isPreviewSupported = require('./../../utils/lib/isPreviewSupported');

const exifr = require('exifr/dist/mini.legacy.umd.js');

const locale = require('./locale');
/**
 * The Thumbnail Generator plugin
 */


module.exports = (_temp = _class = class ThumbnailGenerator extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);

    this.onFileAdded = file => {
      if (!file.preview && file.data && isPreviewSupported(file.type) && !file.isRemote) {
        this.addToQueue(file.id);
      }
    };

    this.onCancelRequest = file => {
      const index = this.queue.indexOf(file.id);

      if (index !== -1) {
        this.queue.splice(index, 1);
      }
    };

    this.onFileRemoved = file => {
      const index = this.queue.indexOf(file.id);

      if (index !== -1) {
        this.queue.splice(index, 1);
      } // Clean up object URLs.


      if (file.preview && isObjectURL(file.preview)) {
        URL.revokeObjectURL(file.preview);
      }
    };

    this.onRestored = () => {
      const restoredFiles = this.uppy.getFiles().filter(file => file.isRestored);
      restoredFiles.forEach(file => {
        // Only add blob URLs; they are likely invalid after being restored.
        if (!file.preview || isObjectURL(file.preview)) {
          this.addToQueue(file.id);
        }
      });
    };

    this.waitUntilAllProcessed = fileIDs => {
      fileIDs.forEach(fileID => {
        const file = this.uppy.getFile(fileID);
        this.uppy.emit('preprocess-progress', file, {
          mode: 'indeterminate',
          message: this.i18n('generatingThumbnails')
        });
      });

      const emitPreprocessCompleteForAll = () => {
        fileIDs.forEach(fileID => {
          const file = this.uppy.getFile(fileID);
          this.uppy.emit('preprocess-complete', file);
        });
      };

      return new Promise(resolve => {
        if (this.queueProcessing) {
          this.uppy.once('thumbnail:all-generated', () => {
            emitPreprocessCompleteForAll();
            resolve();
          });
        } else {
          emitPreprocessCompleteForAll();
          resolve();
        }
      });
    };

    this.type = 'modifier';
    this.id = this.opts.id || 'ThumbnailGenerator';
    this.title = 'Thumbnail Generator';
    this.queue = [];
    this.queueProcessing = false;
    this.defaultThumbnailDimension = 200;
    this.thumbnailType = this.opts.thumbnailType || 'image/jpeg';
    this.defaultLocale = locale;
    const defaultOptions = {
      thumbnailWidth: null,
      thumbnailHeight: null,
      waitForThumbnailsBeforeUpload: false,
      lazy: false
    };
    this.opts = { ...defaultOptions,
      ...opts
    };
    this.i18nInit();

    if (this.opts.lazy && this.opts.waitForThumbnailsBeforeUpload) {
      throw new Error('ThumbnailGenerator: The `lazy` and `waitForThumbnailsBeforeUpload` options are mutually exclusive. Please ensure at most one of them is set to `true`.');
    }
  }
  /**
   * Create a thumbnail for the given Uppy file object.
   *
   * @param {{data: Blob}} file
   * @param {number} targetWidth
   * @param {number} targetHeight
   * @returns {Promise}
   */


  createThumbnail(file, targetWidth, targetHeight) {
    const originalUrl = URL.createObjectURL(file.data);
    const onload = new Promise((resolve, reject) => {
      const image = new Image();
      image.src = originalUrl;
      image.addEventListener('load', () => {
        URL.revokeObjectURL(originalUrl);
        resolve(image);
      });
      image.addEventListener('error', event => {
        URL.revokeObjectURL(originalUrl);
        reject(event.error || new Error('Could not create thumbnail'));
      });
    });
    const orientationPromise = exifr.rotation(file.data).catch(() => 1);
    return Promise.all([onload, orientationPromise]).then(([image, orientation]) => {
      const dimensions = this.getProportionalDimensions(image, targetWidth, targetHeight, orientation.deg);
      const rotatedImage = this.rotateImage(image, orientation);
      const resizedImage = this.resizeImage(rotatedImage, dimensions.width, dimensions.height);
      return this.canvasToBlob(resizedImage, this.thumbnailType, 80);
    }).then(blob => {
      return URL.createObjectURL(blob);
    });
  }
  /**
   * Get the new calculated dimensions for the given image and a target width
   * or height. If both width and height are given, only width is taken into
   * account. If neither width nor height are given, the default dimension
   * is used.
   */


  getProportionalDimensions(img, width, height, rotation) {
    let aspect = img.width / img.height;

    if (rotation === 90 || rotation === 270) {
      aspect = img.height / img.width;
    }

    if (width != null) {
      return {
        width,
        height: Math.round(width / aspect)
      };
    }

    if (height != null) {
      return {
        width: Math.round(height * aspect),
        height
      };
    }

    return {
      width: this.defaultThumbnailDimension,
      height: Math.round(this.defaultThumbnailDimension / aspect)
    };
  }
  /**
   * Make sure the image doesn’t exceed browser/device canvas limits.
   * For ios with 256 RAM and ie
   */


  protect(image) {
    // https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element
    const ratio = image.width / image.height;
    const maxSquare = 5000000; // ios max canvas square

    const maxSize = 4096; // ie max canvas dimensions

    let maxW = Math.floor(Math.sqrt(maxSquare * ratio));
    let maxH = Math.floor(maxSquare / Math.sqrt(maxSquare * ratio));

    if (maxW > maxSize) {
      maxW = maxSize;
      maxH = Math.round(maxW / ratio);
    }

    if (maxH > maxSize) {
      maxH = maxSize;
      maxW = Math.round(ratio * maxH);
    }

    if (image.width > maxW) {
      const canvas = document.createElement('canvas');
      canvas.width = maxW;
      canvas.height = maxH;
      canvas.getContext('2d').drawImage(image, 0, 0, maxW, maxH);
      image = canvas;
    }

    return image;
  }
  /**
   * Resize an image to the target `width` and `height`.
   *
   * Returns a Canvas with the resized image on it.
   */


  resizeImage(image, targetWidth, targetHeight) {
    // Resizing in steps refactored to use a solution from
    // https://blog.uploadcare.com/image-resize-in-browsers-is-broken-e38eed08df01
    image = this.protect(image);
    let steps = Math.ceil(Math.log2(image.width / targetWidth));

    if (steps < 1) {
      steps = 1;
    }

    let sW = targetWidth * 2 ** (steps - 1);
    let sH = targetHeight * 2 ** (steps - 1);
    const x = 2;

    while (steps--) {
      const canvas = document.createElement('canvas');
      canvas.width = sW;
      canvas.height = sH;
      canvas.getContext('2d').drawImage(image, 0, 0, sW, sH);
      image = canvas;
      sW = Math.round(sW / x);
      sH = Math.round(sH / x);
    }

    return image;
  }

  rotateImage(image, translate) {
    let w = image.width;
    let h = image.height;

    if (translate.deg === 90 || translate.deg === 270) {
      w = image.height;
      h = image.width;
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const context = canvas.getContext('2d');
    context.translate(w / 2, h / 2);

    if (translate.canvas) {
      context.rotate(translate.rad);
      context.scale(translate.scaleX, translate.scaleY);
    }

    context.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height);
    return canvas;
  }
  /**
   * Save a <canvas> element's content to a Blob object.
   *
   * @param {HTMLCanvasElement} canvas
   * @returns {Promise}
   */


  canvasToBlob(canvas, type, quality) {
    try {
      canvas.getContext('2d').getImageData(0, 0, 1, 1);
    } catch (err) {
      if (err.code === 18) {
        return Promise.reject(new Error('cannot read image, probably an svg with external resources'));
      }
    }

    if (canvas.toBlob) {
      return new Promise(resolve => {
        canvas.toBlob(resolve, type, quality);
      }).then(blob => {
        if (blob === null) {
          throw new Error('cannot read image, probably an svg with external resources');
        }

        return blob;
      });
    }

    return Promise.resolve().then(() => {
      return dataURItoBlob(canvas.toDataURL(type, quality), {});
    }).then(blob => {
      if (blob === null) {
        throw new Error('could not extract blob, probably an old browser');
      }

      return blob;
    });
  }
  /**
   * Set the preview URL for a file.
   */


  setPreviewURL(fileID, preview) {
    this.uppy.setFileState(fileID, {
      preview
    });
  }

  addToQueue(item) {
    this.queue.push(item);

    if (this.queueProcessing === false) {
      this.processQueue();
    }
  }

  processQueue() {
    this.queueProcessing = true;

    if (this.queue.length > 0) {
      const current = this.uppy.getFile(this.queue.shift());

      if (!current) {
        this.uppy.log('[ThumbnailGenerator] file was removed before a thumbnail could be generated, but not removed from the queue. This is probably a bug', 'error');
        return;
      }

      return this.requestThumbnail(current).catch(() => {}) // eslint-disable-line node/handle-callback-err
      .then(() => this.processQueue());
    }

    this.queueProcessing = false;
    this.uppy.log('[ThumbnailGenerator] Emptied thumbnail queue');
    this.uppy.emit('thumbnail:all-generated');
  }

  requestThumbnail(file) {
    if (isPreviewSupported(file.type) && !file.isRemote) {
      return this.createThumbnail(file, this.opts.thumbnailWidth, this.opts.thumbnailHeight).then(preview => {
        this.setPreviewURL(file.id, preview);
        this.uppy.log(`[ThumbnailGenerator] Generated thumbnail for ${file.id}`);
        this.uppy.emit('thumbnail:generated', this.uppy.getFile(file.id), preview);
      }).catch(err => {
        this.uppy.log(`[ThumbnailGenerator] Failed thumbnail for ${file.id}:`, 'warning');
        this.uppy.log(err, 'warning');
        this.uppy.emit('thumbnail:error', this.uppy.getFile(file.id), err);
      });
    }

    return Promise.resolve();
  }

  install() {
    this.uppy.on('file-removed', this.onFileRemoved);

    if (this.opts.lazy) {
      this.uppy.on('thumbnail:request', this.onFileAdded);
      this.uppy.on('thumbnail:cancel', this.onCancelRequest);
    } else {
      this.uppy.on('file-added', this.onFileAdded);
      this.uppy.on('restored', this.onRestored);
    }

    if (this.opts.waitForThumbnailsBeforeUpload) {
      this.uppy.addPreProcessor(this.waitUntilAllProcessed);
    }
  }

  uninstall() {
    this.uppy.off('file-removed', this.onFileRemoved);

    if (this.opts.lazy) {
      this.uppy.off('thumbnail:request', this.onFileAdded);
      this.uppy.off('thumbnail:cancel', this.onCancelRequest);
    } else {
      this.uppy.off('file-added', this.onFileAdded);
      this.uppy.off('restored', this.onRestored);
    }

    if (this.opts.waitForThumbnailsBeforeUpload) {
      this.uppy.removePreProcessor(this.waitUntilAllProcessed);
    }
  }

}, _class.VERSION = "2.0.5", _temp);

},{"./../../core":48,"./../../utils/lib/dataURItoBlob":150,"./../../utils/lib/isObjectURL":173,"./../../utils/lib/isPreviewSupported":174,"./locale":137,"exifr/dist/mini.legacy.umd.js":6}],137:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    generatingThumbnails: 'Generating thumbnails...'
  }
};

},{}],138:[function(require,module,exports){
"use strict";

const tus = require('tus-js-client');

function isCordova() {
  return typeof window !== 'undefined' && (typeof window.PhoneGap !== 'undefined' || typeof window.Cordova !== 'undefined' || typeof window.cordova !== 'undefined');
}

function isReactNative() {
  return typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative';
} // We override tus fingerprint to uppy’s `file.id`, since the `file.id`
// now also includes `relativePath` for files added from folders.
// This means you can add 2 identical files, if one is in folder a,
// the other in folder b — `a/file.jpg` and `b/file.jpg`, when added
// together with a folder, will be treated as 2 separate files.
//
// For React Native and Cordova, we let tus-js-client’s default
// fingerprint handling take charge.


module.exports = function getFingerprint(uppyFileObj) {
  return (file, options) => {
    if (isCordova() || isReactNative()) {
      return tus.defaultOptions.fingerprint(file, options);
    }

    const uppyFingerprint = ['tus', uppyFileObj.id, options.endpoint].join('-');
    return Promise.resolve(uppyFingerprint);
  };
};

},{"tus-js-client":25}],139:[function(require,module,exports){
"use strict";

var _class, _temp;

const BasePlugin = require('./../../core/lib/BasePlugin');

const tus = require('tus-js-client');

const {
  Provider,
  RequestClient,
  Socket
} = require('./../../companion-client');

const emitSocketProgress = require('./../../utils/lib/emitSocketProgress');

const getSocketHost = require('./../../utils/lib/getSocketHost');

const settle = require('./../../utils/lib/settle');

const EventTracker = require('./../../utils/lib/EventTracker');

const NetworkError = require('./../../utils/lib/NetworkError');

const isNetworkError = require('./../../utils/lib/isNetworkError');

const {
  RateLimitedQueue
} = require('./../../utils/lib/RateLimitedQueue');

const hasProperty = require('./../../utils/lib/hasProperty');

const getFingerprint = require('./getFingerprint');
/** @typedef {import('..').TusOptions} TusOptions */

/** @typedef {import('tus-js-client').UploadOptions} RawTusOptions */

/** @typedef {import('@uppy/core').Uppy} Uppy */

/** @typedef {import('@uppy/core').UppyFile} UppyFile */

/** @typedef {import('@uppy/core').FailedUppyFile<{}>} FailedUppyFile */

/**
 * Extracted from https://github.com/tus/tus-js-client/blob/master/lib/upload.js#L13
 * excepted we removed 'fingerprint' key to avoid adding more dependencies
 *
 * @type {RawTusOptions}
 */


const tusDefaultOptions = {
  endpoint: '',
  uploadUrl: null,
  metadata: {},
  uploadSize: null,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  overridePatchMethod: false,
  headers: {},
  addRequestId: false,
  chunkSize: Infinity,
  retryDelays: [0, 1000, 3000, 5000],
  parallelUploads: 1,
  removeFingerprintOnSuccess: false,
  uploadLengthDeferred: false,
  uploadDataDuringCreation: false
};
/**
 * Tus resumable file uploader
 */

module.exports = (_temp = _class = class Tus extends BasePlugin {
  /**
   * @param {Uppy} uppy
   * @param {TusOptions} opts
   */
  constructor(uppy, opts) {
    super(uppy, opts);
    this.type = 'uploader';
    this.id = this.opts.id || 'Tus';
    this.title = 'Tus'; // set default options

    const defaultOptions = {
      useFastRemoteRetry: true,
      limit: 5,
      retryDelays: [0, 1000, 3000, 5000],
      withCredentials: false
    }; // merge default options with the ones set by user

    /** @type {import("..").TusOptions} */

    this.opts = { ...defaultOptions,
      ...opts
    };

    if ('autoRetry' in opts) {
      throw new Error('The `autoRetry` option was deprecated and has been removed.');
    }
    /**
     * Simultaneous upload limiting is shared across all uploads with this plugin.
     *
     * @type {RateLimitedQueue}
     */


    this.requests = new RateLimitedQueue(this.opts.limit);
    this.uploaders = Object.create(null);
    this.uploaderEvents = Object.create(null);
    this.uploaderSockets = Object.create(null);
    this.handleResetProgress = this.handleResetProgress.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
  }

  handleResetProgress() {
    const files = { ...this.uppy.getState().files
    };
    Object.keys(files).forEach(fileID => {
      // Only clone the file object if it has a Tus `uploadUrl` attached.
      if (files[fileID].tus && files[fileID].tus.uploadUrl) {
        const tusState = { ...files[fileID].tus
        };
        delete tusState.uploadUrl;
        files[fileID] = { ...files[fileID],
          tus: tusState
        };
      }
    });
    this.uppy.setState({
      files
    });
  }
  /**
   * Clean up all references for a file's upload: the tus.Upload instance,
   * any events related to the file, and the Companion WebSocket connection.
   *
   * @param {string} fileID
   */


  resetUploaderReferences(fileID, opts = {}) {
    if (this.uploaders[fileID]) {
      const uploader = this.uploaders[fileID];
      uploader.abort();

      if (opts.abort) {
        uploader.abort(true);
      }

      this.uploaders[fileID] = null;
    }

    if (this.uploaderEvents[fileID]) {
      this.uploaderEvents[fileID].remove();
      this.uploaderEvents[fileID] = null;
    }

    if (this.uploaderSockets[fileID]) {
      this.uploaderSockets[fileID].close();
      this.uploaderSockets[fileID] = null;
    }
  }
  /**
   * Create a new Tus upload.
   *
   * A lot can happen during an upload, so this is quite hard to follow!
   * - First, the upload is started. If the file was already paused by the time the upload starts, nothing should happen.
   *   If the `limit` option is used, the upload must be queued onto the `this.requests` queue.
   *   When an upload starts, we store the tus.Upload instance, and an EventTracker instance that manages the event listeners
   *   for pausing, cancellation, removal, etc.
   * - While the upload is in progress, it may be paused or cancelled.
   *   Pausing aborts the underlying tus.Upload, and removes the upload from the `this.requests` queue. All other state is
   *   maintained.
   *   Cancelling removes the upload from the `this.requests` queue, and completely aborts the upload-- the `tus.Upload`
   *   instance is aborted and discarded, the EventTracker instance is destroyed (removing all listeners).
   *   Resuming the upload uses the `this.requests` queue as well, to prevent selectively pausing and resuming uploads from
   *   bypassing the limit.
   * - After completing an upload, the tus.Upload and EventTracker instances are cleaned up, and the upload is marked as done
   *   in the `this.requests` queue.
   * - When an upload completed with an error, the same happens as on successful completion, but the `upload()` promise is
   *   rejected.
   *
   * When working on this function, keep in mind:
   *  - When an upload is completed or cancelled for any reason, the tus.Upload and EventTracker instances need to be cleaned
   *    up using this.resetUploaderReferences().
   *  - When an upload is cancelled or paused, for any reason, it needs to be removed from the `this.requests` queue using
   *    `queuedRequest.abort()`.
   *  - When an upload is completed for any reason, including errors, it needs to be marked as such using
   *    `queuedRequest.done()`.
   *  - When an upload is started or resumed, it needs to go through the `this.requests` queue. The `queuedRequest` variable
   *    must be updated so the other uses of it are valid.
   *  - Before replacing the `queuedRequest` variable, the previous `queuedRequest` must be aborted, else it will keep taking
   *    up a spot in the queue.
   *
   * @param {UppyFile} file for use with upload
   * @param {number} current file in a queue
   * @param {number} total number of files in a queue
   * @returns {Promise<void>}
   */


  upload(file) {
    this.resetUploaderReferences(file.id); // Create a new tus upload

    return new Promise((resolve, reject) => {
      this.uppy.emit('upload-started', file);
      const opts = { ...this.opts,
        ...(file.tus || {})
      };

      if (typeof opts.headers === 'function') {
        opts.headers = opts.headers(file);
      }
      /** @type {RawTusOptions} */


      const uploadOptions = { ...tusDefaultOptions,
        ...opts
      }; // We override tus fingerprint to uppy’s `file.id`, since the `file.id`
      // now also includes `relativePath` for files added from folders.
      // This means you can add 2 identical files, if one is in folder a,
      // the other in folder b.

      uploadOptions.fingerprint = getFingerprint(file);

      uploadOptions.onBeforeRequest = req => {
        const xhr = req.getUnderlyingObject();
        xhr.withCredentials = !!opts.withCredentials;

        if (typeof opts.onBeforeRequest === 'function') {
          opts.onBeforeRequest(req);
        }
      };

      uploadOptions.onError = err => {
        this.uppy.log(err);
        const xhr = err.originalRequest ? err.originalRequest.getUnderlyingObject() : null;

        if (isNetworkError(xhr)) {
          err = new NetworkError(err, xhr);
        }

        this.resetUploaderReferences(file.id);
        queuedRequest.done();
        this.uppy.emit('upload-error', file, err);
        reject(err);
      };

      uploadOptions.onProgress = (bytesUploaded, bytesTotal) => {
        this.onReceiveUploadUrl(file, upload.url);
        this.uppy.emit('upload-progress', file, {
          uploader: this,
          bytesUploaded,
          bytesTotal
        });
      };

      uploadOptions.onSuccess = () => {
        const uploadResp = {
          uploadURL: upload.url
        };
        this.resetUploaderReferences(file.id);
        queuedRequest.done();
        this.uppy.emit('upload-success', file, uploadResp);

        if (upload.url) {
          this.uppy.log(`Download ${upload.file.name} from ${upload.url}`);
        }

        resolve(upload);
      };

      const copyProp = (obj, srcProp, destProp) => {
        if (hasProperty(obj, srcProp) && !hasProperty(obj, destProp)) {
          obj[destProp] = obj[srcProp];
        }
      };
      /** @type {Record<string, string>} */


      const meta = {};
      const metaFields = Array.isArray(opts.metaFields) ? opts.metaFields // Send along all fields by default.
      : Object.keys(file.meta);
      metaFields.forEach(item => {
        meta[item] = file.meta[item];
      }); // tusd uses metadata fields 'filetype' and 'filename'

      copyProp(meta, 'type', 'filetype');
      copyProp(meta, 'name', 'filename');
      uploadOptions.metadata = meta;
      const upload = new tus.Upload(file.data, uploadOptions);
      this.uploaders[file.id] = upload;
      this.uploaderEvents[file.id] = new EventTracker(this.uppy);
      upload.findPreviousUploads().then(previousUploads => {
        const previousUpload = previousUploads[0];

        if (previousUpload) {
          this.uppy.log(`[Tus] Resuming upload of ${file.id} started at ${previousUpload.creationTime}`);
          upload.resumeFromPreviousUpload(previousUpload);
        }
      });
      let queuedRequest = this.requests.run(() => {
        if (!file.isPaused) {
          upload.start();
        } // Don't do anything here, the caller will take care of cancelling the upload itself
        // using resetUploaderReferences(). This is because resetUploaderReferences() has to be
        // called when this request is still in the queue, and has not been started yet, too. At
        // that point this cancellation function is not going to be called.
        // Also, we need to remove the request from the queue _without_ destroying everything
        // related to this upload to handle pauses.


        return () => {};
      });
      this.onFileRemove(file.id, targetFileID => {
        queuedRequest.abort();
        this.resetUploaderReferences(file.id, {
          abort: !!upload.url
        });
        resolve(`upload ${targetFileID} was removed`);
      });
      this.onPause(file.id, isPaused => {
        if (isPaused) {
          // Remove this file from the queue so another file can start in its place.
          queuedRequest.abort();
          upload.abort();
        } else {
          // Resuming an upload should be queued, else you could pause and then
          // resume a queued upload to make it skip the queue.
          queuedRequest.abort();
          queuedRequest = this.requests.run(() => {
            upload.start();
            return () => {};
          });
        }
      });
      this.onPauseAll(file.id, () => {
        queuedRequest.abort();
        upload.abort();
      });
      this.onCancelAll(file.id, () => {
        queuedRequest.abort();
        this.resetUploaderReferences(file.id, {
          abort: !!upload.url
        });
        resolve(`upload ${file.id} was canceled`);
      });
      this.onResumeAll(file.id, () => {
        queuedRequest.abort();

        if (file.error) {
          upload.abort();
        }

        queuedRequest = this.requests.run(() => {
          upload.start();
          return () => {};
        });
      });
    }).catch(err => {
      this.uppy.emit('upload-error', file, err);
      throw err;
    });
  }
  /**
   * @param {UppyFile} file for use with upload
   * @param {number} current file in a queue
   * @param {number} total number of files in a queue
   * @returns {Promise<void>}
   */


  uploadRemote(file) {
    this.resetUploaderReferences(file.id);
    const opts = { ...this.opts
    };

    if (file.tus) {
      // Install file-specific upload overrides.
      Object.assign(opts, file.tus);
    }

    this.uppy.emit('upload-started', file);
    this.uppy.log(file.remote.url);

    if (file.serverToken) {
      return this.connectToServerSocket(file);
    }

    return new Promise((resolve, reject) => {
      const Client = file.remote.providerOptions.provider ? Provider : RequestClient;
      const client = new Client(this.uppy, file.remote.providerOptions); // !! cancellation is NOT supported at this stage yet

      client.post(file.remote.url, { ...file.remote.body,
        endpoint: opts.endpoint,
        uploadUrl: opts.uploadUrl,
        protocol: 'tus',
        size: file.data.size,
        headers: opts.headers,
        metadata: file.meta
      }).then(res => {
        this.uppy.setFileState(file.id, {
          serverToken: res.token
        });
        file = this.uppy.getFile(file.id);
        return this.connectToServerSocket(file);
      }).then(() => {
        resolve();
      }).catch(err => {
        this.uppy.emit('upload-error', file, err);
        reject(err);
      });
    });
  }
  /**
   * See the comment on the upload() method.
   *
   * Additionally, when an upload is removed, completed, or cancelled, we need to close the WebSocket connection. This is
   * handled by the resetUploaderReferences() function, so the same guidelines apply as in upload().
   *
   * @param {UppyFile} file
   */


  connectToServerSocket(file) {
    return new Promise((resolve, reject) => {
      const token = file.serverToken;
      const host = getSocketHost(file.remote.companionUrl);
      const socket = new Socket({
        target: `${host}/api/${token}`,
        autoOpen: false
      });
      this.uploaderSockets[file.id] = socket;
      this.uploaderEvents[file.id] = new EventTracker(this.uppy);
      this.onFileRemove(file.id, () => {
        queuedRequest.abort();
        socket.send('cancel', {});
        this.resetUploaderReferences(file.id);
        resolve(`upload ${file.id} was removed`);
      });
      this.onPause(file.id, isPaused => {
        if (isPaused) {
          // Remove this file from the queue so another file can start in its place.
          queuedRequest.abort();
          socket.send('pause', {});
        } else {
          // Resuming an upload should be queued, else you could pause and then
          // resume a queued upload to make it skip the queue.
          queuedRequest.abort();
          queuedRequest = this.requests.run(() => {
            socket.send('resume', {});
            return () => {};
          });
        }
      });
      this.onPauseAll(file.id, () => {
        queuedRequest.abort();
        socket.send('pause', {});
      });
      this.onCancelAll(file.id, () => {
        queuedRequest.abort();
        socket.send('cancel', {});
        this.resetUploaderReferences(file.id);
        resolve(`upload ${file.id} was canceled`);
      });
      this.onResumeAll(file.id, () => {
        queuedRequest.abort();

        if (file.error) {
          socket.send('pause', {});
        }

        queuedRequest = this.requests.run(() => {
          socket.send('resume', {});
          return () => {};
        });
      });
      this.onRetry(file.id, () => {
        // Only do the retry if the upload is actually in progress;
        // else we could try to send these messages when the upload is still queued.
        // We may need a better check for this since the socket may also be closed
        // for other reasons, like network failures.
        if (socket.isOpen) {
          socket.send('pause', {});
          socket.send('resume', {});
        }
      });
      this.onRetryAll(file.id, () => {
        // See the comment in the onRetry() call
        if (socket.isOpen) {
          socket.send('pause', {});
          socket.send('resume', {});
        }
      });
      socket.on('progress', progressData => emitSocketProgress(this, progressData, file));
      socket.on('error', errData => {
        const {
          message
        } = errData.error;
        const error = Object.assign(new Error(message), {
          cause: errData.error
        }); // If the remote retry optimisation should not be used,
        // close the socket—this will tell companion to clear state and delete the file.

        if (!this.opts.useFastRemoteRetry) {
          this.resetUploaderReferences(file.id); // Remove the serverToken so that a new one will be created for the retry.

          this.uppy.setFileState(file.id, {
            serverToken: null
          });
        } else {
          socket.close();
        }

        this.uppy.emit('upload-error', file, error);
        queuedRequest.done();
        reject(error);
      });
      socket.on('success', data => {
        const uploadResp = {
          uploadURL: data.url
        };
        this.uppy.emit('upload-success', file, uploadResp);
        this.resetUploaderReferences(file.id);
        queuedRequest.done();
        resolve();
      });
      let queuedRequest = this.requests.run(() => {
        socket.open();

        if (file.isPaused) {
          socket.send('pause', {});
        } // Don't do anything here, the caller will take care of cancelling the upload itself
        // using resetUploaderReferences(). This is because resetUploaderReferences() has to be
        // called when this request is still in the queue, and has not been started yet, too. At
        // that point this cancellation function is not going to be called.
        // Also, we need to remove the request from the queue _without_ destroying everything
        // related to this upload to handle pauses.


        return () => {};
      });
    });
  }
  /**
   * Store the uploadUrl on the file options, so that when Golden Retriever
   * restores state, we will continue uploading to the correct URL.
   *
   * @param {UppyFile} file
   * @param {string} uploadURL
   */


  onReceiveUploadUrl(file, uploadURL) {
    const currentFile = this.uppy.getFile(file.id);
    if (!currentFile) return; // Only do the update if we didn't have an upload URL yet.

    if (!currentFile.tus || currentFile.tus.uploadUrl !== uploadURL) {
      this.uppy.log('[Tus] Storing upload url');
      this.uppy.setFileState(currentFile.id, {
        tus: { ...currentFile.tus,
          uploadUrl: uploadURL
        }
      });
    }
  }
  /**
   * @param {string} fileID
   * @param {function(string): void} cb
   */


  onFileRemove(fileID, cb) {
    this.uploaderEvents[fileID].on('file-removed', file => {
      if (fileID === file.id) cb(file.id);
    });
  }
  /**
   * @param {string} fileID
   * @param {function(boolean): void} cb
   */


  onPause(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-pause', (targetFileID, isPaused) => {
      if (fileID === targetFileID) {
        // const isPaused = this.uppy.pauseResume(fileID)
        cb(isPaused);
      }
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */


  onRetry(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-retry', targetFileID => {
      if (fileID === targetFileID) {
        cb();
      }
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */


  onRetryAll(fileID, cb) {
    this.uploaderEvents[fileID].on('retry-all', () => {
      if (!this.uppy.getFile(fileID)) return;
      cb();
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */


  onPauseAll(fileID, cb) {
    this.uploaderEvents[fileID].on('pause-all', () => {
      if (!this.uppy.getFile(fileID)) return;
      cb();
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */


  onCancelAll(fileID, cb) {
    this.uploaderEvents[fileID].on('cancel-all', () => {
      if (!this.uppy.getFile(fileID)) return;
      cb();
    });
  }
  /**
   * @param {string} fileID
   * @param {function(): void} cb
   */


  onResumeAll(fileID, cb) {
    this.uploaderEvents[fileID].on('resume-all', () => {
      if (!this.uppy.getFile(fileID)) return;
      cb();
    });
  }
  /**
   * @param {(UppyFile | FailedUppyFile)[]} files
   */


  uploadFiles(files) {
    const promises = files.map((file, i) => {
      const current = i + 1;
      const total = files.length;

      if ('error' in file && file.error) {
        return Promise.reject(new Error(file.error));
      }

      if (file.isRemote) {
        // We emit upload-started here, so that it's also emitted for files
        // that have to wait due to the `limit` option.
        // Don't double-emit upload-started for Golden Retriever-restored files that were already started
        if (!file.progress.uploadStarted || !file.isRestored) {
          this.uppy.emit('upload-started', file);
        }

        return this.uploadRemote(file, current, total);
      } // Don't double-emit upload-started for Golden Retriever-restored files that were already started


      if (!file.progress.uploadStarted || !file.isRestored) {
        this.uppy.emit('upload-started', file);
      }

      return this.upload(file, current, total);
    });
    return settle(promises);
  }
  /**
   * @param {string[]} fileIDs
   */


  handleUpload(fileIDs) {
    if (fileIDs.length === 0) {
      this.uppy.log('[Tus] No files to upload');
      return Promise.resolve();
    }

    if (this.opts.limit === 0) {
      this.uppy.log('[Tus] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues: https://uppy.io/docs/tus/#limit-0', 'warning');
    }

    this.uppy.log('[Tus] Uploading...');
    const filesToUpload = fileIDs.map(fileID => this.uppy.getFile(fileID));
    return this.uploadFiles(filesToUpload).then(() => null);
  }

  install() {
    this.uppy.setState({
      capabilities: { ...this.uppy.getState().capabilities,
        resumableUploads: true
      }
    });
    this.uppy.addUploader(this.handleUpload);
    this.uppy.on('reset-progress', this.handleResetProgress);
  }

  uninstall() {
    this.uppy.setState({
      capabilities: { ...this.uppy.getState().capabilities,
        resumableUploads: false
      }
    });
    this.uppy.removeUploader(this.handleUpload);
  }

}, _class.VERSION = "2.1.1", _temp);

},{"./../../companion-client":42,"./../../core/lib/BasePlugin":44,"./../../utils/lib/EventTracker":144,"./../../utils/lib/NetworkError":146,"./../../utils/lib/RateLimitedQueue":147,"./../../utils/lib/emitSocketProgress":151,"./../../utils/lib/getSocketHost":165,"./../../utils/lib/hasProperty":169,"./../../utils/lib/isNetworkError":172,"./../../utils/lib/settle":179,"./getFingerprint":138,"tus-js-client":25}],140:[function(require,module,exports){
"use strict";

const {
  h,
  Component
} = require('preact');

class UrlUI extends Component {
  constructor(props) {
    super(props);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    this.input.value = '';
  }

  handleKeyPress(ev) {
    if (ev.keyCode === 13) {
      this.props.addFile(this.input.value);
    }
  }

  handleClick() {
    this.props.addFile(this.input.value);
  }

  render() {
    return h("div", {
      className: "uppy-Url"
    }, h("input", {
      className: "uppy-u-reset uppy-c-textInput uppy-Url-input",
      type: "text",
      "aria-label": this.props.i18n('enterUrlToImport'),
      placeholder: this.props.i18n('enterUrlToImport'),
      onKeyUp: this.handleKeyPress,
      ref: input => {
        this.input = input;
      },
      "data-uppy-super-focusable": true
    }), h("button", {
      className: "uppy-u-reset uppy-c-btn uppy-c-btn-primary uppy-Url-importButton",
      type: "button",
      onClick: this.handleClick
    }, this.props.i18n('import')));
  }

}

module.exports = UrlUI;

},{"preact":18}],141:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  h
} = require('preact');

const {
  RequestClient
} = require('./../../companion-client');

const UrlUI = require('./UrlUI.js');

const toArray = require('./../../utils/lib/toArray');

const forEachDroppedOrPastedUrl = require('./utils/forEachDroppedOrPastedUrl');

const locale = require('./locale');

function UrlIcon() {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    width: "32",
    height: "32",
    viewBox: "0 0 32 32"
  }, h("g", {
    fill: "none",
    fillRule: "evenodd"
  }, h("rect", {
    className: "uppy-ProviderIconBg",
    fill: "#FF753E",
    width: "32",
    height: "32",
    rx: "16"
  }), h("path", {
    d: "M22.788 15.389l-2.199 2.19a3.184 3.184 0 0 1-.513.437c-.806.584-1.686.876-2.638.876a4.378 4.378 0 0 1-3.519-1.752c-.22-.292-.146-.802.147-1.021.293-.22.806-.146 1.026.146.953 1.313 2.785 1.532 4.105.583a.571.571 0 0 0 .293-.292l2.199-2.189c1.1-1.167 1.1-2.992-.073-4.086a2.976 2.976 0 0 0-4.105 0l-1.246 1.24a.71.71 0 0 1-1.026 0 .703.703 0 0 1 0-1.022l1.246-1.24a4.305 4.305 0 0 1 6.083 0c1.833 1.605 1.906 4.451.22 6.13zm-7.183 5.035l-1.246 1.24a2.976 2.976 0 0 1-4.105 0c-1.172-1.094-1.172-2.991-.073-4.086l2.2-2.19.292-.291c.66-.438 1.393-.657 2.2-.584.805.146 1.465.51 1.905 1.168.22.292.733.365 1.026.146.293-.22.367-.73.147-1.022-.733-.949-1.76-1.532-2.859-1.678-1.1-.22-2.272.073-3.225.802l-.44.438-2.199 2.19c-1.686 1.75-1.612 4.524.074 6.202.88.803 1.979 1.241 3.078 1.241 1.1 0 2.199-.438 3.079-1.24l1.246-1.241a.703.703 0 0 0 0-1.022c-.294-.292-.807-.365-1.1-.073z",
    fill: "#FFF",
    fillRule: "nonzero"
  })));
}
/**
 * Url
 *
 */


module.exports = (_temp = _class = class Url extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'Url';
    this.title = this.opts.title || 'Link';
    this.type = 'acquirer';

    this.icon = () => h(UrlIcon, null); // Set default options and locale


    this.defaultLocale = locale;
    const defaultOptions = {};
    this.opts = { ...defaultOptions,
      ...opts
    };
    this.i18nInit();
    this.hostname = this.opts.companionUrl;

    if (!this.hostname) {
      throw new Error('Companion hostname is required, please consult https://uppy.io/docs/companion');
    } // Bind all event handlers for referencability


    this.getMeta = this.getMeta.bind(this);
    this.addFile = this.addFile.bind(this);
    this.handleRootDrop = this.handleRootDrop.bind(this);
    this.handleRootPaste = this.handleRootPaste.bind(this);
    this.client = new RequestClient(uppy, {
      companionUrl: this.opts.companionUrl,
      companionHeaders: this.opts.companionHeaders,
      companionCookiesRule: this.opts.companionCookiesRule
    });
  }

  getFileNameFromUrl(url) {
    return url.substring(url.lastIndexOf('/') + 1);
  }

  checkIfCorrectURL(url) {
    if (!url) return false;
    const protocol = url.match(/^([a-z0-9]+):\/\//)[1];

    if (protocol !== 'http' && protocol !== 'https') {
      return false;
    }

    return true;
  }

  addProtocolToURL(url) {
    const protocolRegex = /^[a-z0-9]+:\/\//;
    const defaultProtocol = 'http://';

    if (protocolRegex.test(url)) {
      return url;
    }

    return defaultProtocol + url;
  }

  getMeta(url) {
    return this.client.post('url/meta', {
      url
    }).then(res => {
      if (res.error) {
        this.uppy.log('[URL] Error:');
        this.uppy.log(res.error);
        throw new Error('Failed to fetch the file');
      }

      return res;
    });
  }

  addFile(url) {
    url = this.addProtocolToURL(url);

    if (!this.checkIfCorrectURL(url)) {
      this.uppy.log(`[URL] Incorrect URL entered: ${url}`);
      this.uppy.info(this.i18n('enterCorrectUrl'), 'error', 4000);
      return;
    }

    return this.getMeta(url).then(meta => {
      const tagFile = {
        source: this.id,
        name: this.getFileNameFromUrl(url),
        type: meta.type,
        data: {
          size: meta.size
        },
        isRemote: true,
        body: {
          url
        },
        remote: {
          companionUrl: this.opts.companionUrl,
          url: `${this.hostname}/url/get`,
          body: {
            fileId: url,
            url
          },
          providerOptions: this.client.opts
        }
      };
      return tagFile;
    }).then(tagFile => {
      this.uppy.log('[Url] Adding remote file');

      try {
        return this.uppy.addFile(tagFile);
      } catch (err) {
        if (!err.isRestriction) {
          this.uppy.log(err);
        }

        return err;
      }
    }).catch(err => {
      this.uppy.log(err);
      this.uppy.info({
        message: this.i18n('failedToFetch'),
        details: err
      }, 'error', 4000);
      return err;
    });
  }

  canHandleRootDrop(e) {
    const items = toArray(e.dataTransfer.items);
    const urls = items.filter(item => item.kind === 'string' && item.type === 'text/uri-list');
    return urls.length > 0;
  }

  handleRootDrop(e) {
    forEachDroppedOrPastedUrl(e.dataTransfer, 'drop', url => {
      this.uppy.log(`[URL] Adding file from dropped url: ${url}`);
      this.addFile(url);
    });
  }

  handleRootPaste(e) {
    forEachDroppedOrPastedUrl(e.clipboardData, 'paste', url => {
      this.uppy.log(`[URL] Adding file from pasted url: ${url}`);
      this.addFile(url);
    });
  }

  render() {
    return h(UrlUI, {
      i18n: this.i18n,
      addFile: this.addFile
    });
  }

  install() {
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.unmount();
  }

}, _class.VERSION = "2.0.4", _temp);

},{"./../../companion-client":42,"./../../core":48,"./../../utils/lib/toArray":180,"./UrlUI.js":140,"./locale":142,"./utils/forEachDroppedOrPastedUrl":143,"preact":18}],142:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    // Label for the "Import" button.
    import: 'Import',
    // Placeholder text for the URL input.
    enterUrlToImport: 'Enter URL to import a file',
    // Error message shown if Companion could not load a URL.
    failedToFetch: 'Companion failed to fetch this URL, please make sure it’s correct',
    // Error message shown if the input does not look like a URL.
    enterCorrectUrl: 'Incorrect URL: Please make sure you are entering a direct link to a file'
  }
};

},{}],143:[function(require,module,exports){
"use strict";

const toArray = require('./../../../utils/lib/toArray');
/*
  SITUATION

    1. Cross-browser dataTransfer.items

      paste in chrome [Copy Image]:
      0: {kind: "file", type: "image/png"}
      1: {kind: "string", type: "text/html"}
      paste in safari [Copy Image]:
      0: {kind: "file", type: "image/png"}
      1: {kind: "string", type: "text/html"}
      2: {kind: "string", type: "text/plain"}
      3: {kind: "string", type: "text/uri-list"}
      paste in firefox [Copy Image]:
      0: {kind: "file", type: "image/png"}
      1: {kind: "string", type: "text/html"}

      paste in chrome [Copy Image Address]:
      0: {kind: "string", type: "text/plain"}
      paste in safari [Copy Image Address]:
      0: {kind: "string", type: "text/plain"}
      1: {kind: "string", type: "text/uri-list"}
      paste in firefox [Copy Image Address]:
      0: {kind: "string", type: "text/plain"}

      drop in chrome [from browser]:
      0: {kind: "string", type: "text/uri-list"}
      1: {kind: "string", type: "text/html"}
      drop in safari [from browser]:
      0: {kind: "string", type: "text/uri-list"}
      1: {kind: "string", type: "text/html"}
      2: {kind: "file", type: "image/png"}
      drop in firefox [from browser]:
      0: {kind: "string", type: "text/uri-list"}
      1: {kind: "string", type: "text/x-moz-url"}
      2: {kind: "string", type: "text/plain"}

    2. We can determine if it's a 'copypaste' or a 'drop', but we can't discern between [Copy Image] and [Copy Image Address]

  CONCLUSION

    1. 'paste' ([Copy Image] or [Copy Image Address], we can't discern between these two)
      Don't do anything if there is 'file' item. .handlePaste in the DashboardPlugin will deal with all 'file' items.
      If there are no 'file' items - handle 'text/plain' items.

    2. 'drop'
      Take 'text/uri-list' items. Safari has an additional item of .kind === 'file', and you may worry about the item being
      duplicated (first by DashboardPlugin, and then by UrlPlugin, now), but don't. Directory handling code won't pay
      attention to this particular item of kind 'file'.
*/

/**
 * Finds all links dropped/pasted from one browser window to another.
 *
 * @param {object} dataTransfer - DataTransfer instance, e.g. e.clipboardData, or e.dataTransfer
 * @param {string} isDropOrPaste - either 'drop' or 'paste'
 * @param {Function} callback - (urlString) => {}
 */


module.exports = function forEachDroppedOrPastedUrl(dataTransfer, isDropOrPaste, callback) {
  const items = toArray(dataTransfer.items);
  let urlItems;

  switch (isDropOrPaste) {
    case 'paste':
      {
        const atLeastOneFileIsDragged = items.some(item => item.kind === 'file');

        if (atLeastOneFileIsDragged) {
          return;
        }

        urlItems = items.filter(item => item.kind === 'string' && item.type === 'text/plain');
        break;
      }

    case 'drop':
      {
        urlItems = items.filter(item => item.kind === 'string' && item.type === 'text/uri-list');
        break;
      }

    default:
      {
        throw new Error(`isDropOrPaste must be either 'drop' or 'paste', but it's ${isDropOrPaste}`);
      }
  }

  urlItems.forEach(item => {
    item.getAsString(urlString => callback(urlString));
  });
};

},{"./../../../utils/lib/toArray":180}],144:[function(require,module,exports){
"use strict";

var _emitter, _events;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

/**
 * Create a wrapper around an event emitter with a `remove` method to remove
 * all events that were added using the wrapped emitter.
 */
module.exports = (_emitter = /*#__PURE__*/_classPrivateFieldLooseKey("emitter"), _events = /*#__PURE__*/_classPrivateFieldLooseKey("events"), class EventTracker {
  constructor(emitter) {
    Object.defineProperty(this, _emitter, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _events, {
      writable: true,
      value: []
    });
    _classPrivateFieldLooseBase(this, _emitter)[_emitter] = emitter;
  }

  on(event, fn) {
    _classPrivateFieldLooseBase(this, _events)[_events].push([event, fn]);

    return _classPrivateFieldLooseBase(this, _emitter)[_emitter].on(event, fn);
  }

  remove() {
    for (const [event, fn] of _classPrivateFieldLooseBase(this, _events)[_events].splice(0)) {
      _classPrivateFieldLooseBase(this, _emitter)[_emitter].off(event, fn);
    }
  }

});

},{}],145:[function(require,module,exports){
"use strict";

module.exports = ['a[href]:not([tabindex^="-"]):not([inert]):not([aria-hidden])', 'area[href]:not([tabindex^="-"]):not([inert]):not([aria-hidden])', 'input:not([disabled]):not([inert]):not([aria-hidden])', 'select:not([disabled]):not([inert]):not([aria-hidden])', 'textarea:not([disabled]):not([inert]):not([aria-hidden])', 'button:not([disabled]):not([inert]):not([aria-hidden])', 'iframe:not([tabindex^="-"]):not([inert]):not([aria-hidden])', 'object:not([tabindex^="-"]):not([inert]):not([aria-hidden])', 'embed:not([tabindex^="-"]):not([inert]):not([aria-hidden])', '[contenteditable]:not([tabindex^="-"]):not([inert]):not([aria-hidden])', '[tabindex]:not([tabindex^="-"]):not([inert]):not([aria-hidden])'];

},{}],146:[function(require,module,exports){
"use strict";

class NetworkError extends Error {
  constructor(error, xhr = null) {
    super(`This looks like a network error, the endpoint might be blocked by an internet provider or a firewall.`);
    this.cause = error;
    this.isNetworkError = true;
    this.request = xhr;
  }

}

module.exports = NetworkError;

},{}],147:[function(require,module,exports){
"use strict";

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

function createCancelError() {
  return new Error('Cancelled');
}

var _activeRequests = /*#__PURE__*/_classPrivateFieldLooseKey("activeRequests");

var _queuedHandlers = /*#__PURE__*/_classPrivateFieldLooseKey("queuedHandlers");

var _call = /*#__PURE__*/_classPrivateFieldLooseKey("call");

var _queueNext = /*#__PURE__*/_classPrivateFieldLooseKey("queueNext");

var _next = /*#__PURE__*/_classPrivateFieldLooseKey("next");

var _queue = /*#__PURE__*/_classPrivateFieldLooseKey("queue");

var _dequeue = /*#__PURE__*/_classPrivateFieldLooseKey("dequeue");

class RateLimitedQueue {
  constructor(limit) {
    Object.defineProperty(this, _dequeue, {
      value: _dequeue2
    });
    Object.defineProperty(this, _queue, {
      value: _queue2
    });
    Object.defineProperty(this, _next, {
      value: _next2
    });
    Object.defineProperty(this, _queueNext, {
      value: _queueNext2
    });
    Object.defineProperty(this, _call, {
      value: _call2
    });
    Object.defineProperty(this, _activeRequests, {
      writable: true,
      value: 0
    });
    Object.defineProperty(this, _queuedHandlers, {
      writable: true,
      value: []
    });

    if (typeof limit !== 'number' || limit === 0) {
      this.limit = Infinity;
    } else {
      this.limit = limit;
    }
  }

  run(fn, queueOptions) {
    if (_classPrivateFieldLooseBase(this, _activeRequests)[_activeRequests] < this.limit) {
      return _classPrivateFieldLooseBase(this, _call)[_call](fn);
    }

    return _classPrivateFieldLooseBase(this, _queue)[_queue](fn, queueOptions);
  }

  wrapPromiseFunction(fn, queueOptions) {
    return (...args) => {
      let queuedRequest;
      const outerPromise = new Promise((resolve, reject) => {
        queuedRequest = this.run(() => {
          let cancelError;
          let innerPromise;

          try {
            innerPromise = Promise.resolve(fn(...args));
          } catch (err) {
            innerPromise = Promise.reject(err);
          }

          innerPromise.then(result => {
            if (cancelError) {
              reject(cancelError);
            } else {
              queuedRequest.done();
              resolve(result);
            }
          }, err => {
            if (cancelError) {
              reject(cancelError);
            } else {
              queuedRequest.done();
              reject(err);
            }
          });
          return () => {
            cancelError = createCancelError();
          };
        }, queueOptions);
      });

      outerPromise.abort = () => {
        queuedRequest.abort();
      };

      return outerPromise;
    };
  }

}

function _call2(fn) {
  _classPrivateFieldLooseBase(this, _activeRequests)[_activeRequests] += 1;
  let done = false;
  let cancelActive;

  try {
    cancelActive = fn();
  } catch (err) {
    _classPrivateFieldLooseBase(this, _activeRequests)[_activeRequests] -= 1;
    throw err;
  }

  return {
    abort: () => {
      if (done) return;
      done = true;
      _classPrivateFieldLooseBase(this, _activeRequests)[_activeRequests] -= 1;
      cancelActive();

      _classPrivateFieldLooseBase(this, _queueNext)[_queueNext]();
    },
    done: () => {
      if (done) return;
      done = true;
      _classPrivateFieldLooseBase(this, _activeRequests)[_activeRequests] -= 1;

      _classPrivateFieldLooseBase(this, _queueNext)[_queueNext]();
    }
  };
}

function _queueNext2() {
  // Do it soon but not immediately, this allows clearing out the entire queue synchronously
  // one by one without continuously _advancing_ it (and starting new tasks before immediately
  // aborting them)
  queueMicrotask(() => _classPrivateFieldLooseBase(this, _next)[_next]());
}

function _next2() {
  if (_classPrivateFieldLooseBase(this, _activeRequests)[_activeRequests] >= this.limit) {
    return;
  }

  if (_classPrivateFieldLooseBase(this, _queuedHandlers)[_queuedHandlers].length === 0) {
    return;
  } // Dispatch the next request, and update the abort/done handlers
  // so that cancelling it does the Right Thing (and doesn't just try
  // to dequeue an already-running request).


  const next = _classPrivateFieldLooseBase(this, _queuedHandlers)[_queuedHandlers].shift();

  const handler = _classPrivateFieldLooseBase(this, _call)[_call](next.fn);

  next.abort = handler.abort;
  next.done = handler.done;
}

function _queue2(fn, options = {}) {
  const handler = {
    fn,
    priority: options.priority || 0,
    abort: () => {
      _classPrivateFieldLooseBase(this, _dequeue)[_dequeue](handler);
    },
    done: () => {
      throw new Error('Cannot mark a queued request as done: this indicates a bug');
    }
  };

  const index = _classPrivateFieldLooseBase(this, _queuedHandlers)[_queuedHandlers].findIndex(other => {
    return handler.priority > other.priority;
  });

  if (index === -1) {
    _classPrivateFieldLooseBase(this, _queuedHandlers)[_queuedHandlers].push(handler);
  } else {
    _classPrivateFieldLooseBase(this, _queuedHandlers)[_queuedHandlers].splice(index, 0, handler);
  }

  return handler;
}

function _dequeue2(handler) {
  const index = _classPrivateFieldLooseBase(this, _queuedHandlers)[_queuedHandlers].indexOf(handler);

  if (index !== -1) {
    _classPrivateFieldLooseBase(this, _queuedHandlers)[_queuedHandlers].splice(index, 1);
  }
}

module.exports = {
  RateLimitedQueue,
  internalRateLimitedQueue: Symbol('__queue')
};

},{}],148:[function(require,module,exports){
"use strict";

var _apply;

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const has = require('./hasProperty');

function insertReplacement(source, rx, replacement) {
  const newParts = [];
  source.forEach(chunk => {
    // When the source contains multiple placeholders for interpolation,
    // we should ignore chunks that are not strings, because those
    // can be JSX objects and will be otherwise incorrectly turned into strings.
    // Without this condition we’d get this: [object Object] hello [object Object] my <button>
    if (typeof chunk !== 'string') {
      return newParts.push(chunk);
    }

    return rx[Symbol.split](chunk).forEach((raw, i, list) => {
      if (raw !== '') {
        newParts.push(raw);
      } // Interlace with the `replacement` value


      if (i < list.length - 1) {
        newParts.push(replacement);
      }
    });
  });
  return newParts;
}
/**
 * Takes a string with placeholder variables like `%{smart_count} file selected`
 * and replaces it with values from options `{smart_count: 5}`
 *
 * @license https://github.com/airbnb/polyglot.js/blob/master/LICENSE
 * taken from https://github.com/airbnb/polyglot.js/blob/master/lib/polyglot.js#L299
 *
 * @param {string} phrase that needs interpolation, with placeholders
 * @param {object} options with values that will be used to replace placeholders
 * @returns {any[]} interpolated
 */


function interpolate(phrase, options) {
  const dollarRegex = /\$/g;
  const dollarBillsYall = '$$$$';
  let interpolated = [phrase];
  if (options == null) return interpolated;

  for (const arg of Object.keys(options)) {
    if (arg !== '_') {
      // Ensure replacement value is escaped to prevent special $-prefixed
      // regex replace tokens. the "$$$$" is needed because each "$" needs to
      // be escaped with "$" itself, and we need two in the resulting output.
      let replacement = options[arg];

      if (typeof replacement === 'string') {
        replacement = dollarRegex[Symbol.replace](replacement, dollarBillsYall);
      } // We create a new `RegExp` each time instead of using a more-efficient
      // string replace so that the same argument can be replaced multiple times
      // in the same phrase.


      interpolated = insertReplacement(interpolated, new RegExp(`%\\{${arg}\\}`, 'g'), replacement);
    }
  }

  return interpolated;
}
/**
 * Translates strings with interpolation & pluralization support.
 * Extensible with custom dictionaries and pluralization functions.
 *
 * Borrows heavily from and inspired by Polyglot https://github.com/airbnb/polyglot.js,
 * basically a stripped-down version of it. Differences: pluralization functions are not hardcoded
 * and can be easily added among with dictionaries, nested objects are used for pluralization
 * as opposed to `||||` delimeter
 *
 * Usage example: `translator.translate('files_chosen', {smart_count: 3})`
 */


module.exports = (_apply = /*#__PURE__*/_classPrivateFieldLooseKey("apply"), class Translator {
  /**
   * @param {object|Array<object>} locales - locale or list of locales.
   */
  constructor(locales) {
    Object.defineProperty(this, _apply, {
      value: _apply2
    });
    this.locale = {
      strings: {},

      pluralize(n) {
        if (n === 1) {
          return 0;
        }

        return 1;
      }

    };

    if (Array.isArray(locales)) {
      locales.forEach(_classPrivateFieldLooseBase(this, _apply)[_apply], this);
    } else {
      _classPrivateFieldLooseBase(this, _apply)[_apply](locales);
    }
  }

  /**
   * Public translate method
   *
   * @param {string} key
   * @param {object} options with values that will be used later to replace placeholders in string
   * @returns {string} translated (and interpolated)
   */
  translate(key, options) {
    return this.translateArray(key, options).join('');
  }
  /**
   * Get a translation and return the translated and interpolated parts as an array.
   *
   * @param {string} key
   * @param {object} options with values that will be used to replace placeholders
   * @returns {Array} The translated and interpolated parts, in order.
   */


  translateArray(key, options) {
    if (!has(this.locale.strings, key)) {
      throw new Error(`missing string: ${key}`);
    }

    const string = this.locale.strings[key];
    const hasPluralForms = typeof string === 'object';

    if (hasPluralForms) {
      if (options && typeof options.smart_count !== 'undefined') {
        const plural = this.locale.pluralize(options.smart_count);
        return interpolate(string[plural], options);
      }

      throw new Error('Attempted to use a string with plural forms, but no value was given for %{smart_count}');
    }

    return interpolate(string, options);
  }

});

function _apply2(locale) {
  if (!(locale != null && locale.strings)) {
    return;
  }

  const prevLocale = this.locale;
  this.locale = { ...prevLocale,
    strings: { ...prevLocale.strings,
      ...locale.strings
    }
  };
  this.locale.pluralize = locale.pluralize || prevLocale.pluralize;
}

},{"./hasProperty":169}],149:[function(require,module,exports){
"use strict";

/**
 * Save a <canvas> element's content to a Blob object.
 *
 * @param {HTMLCanvasElement} canvas
 * @returns {Promise}
 */
module.exports = function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => {
    canvas.toBlob(resolve, type, quality);
  });
};

},{}],150:[function(require,module,exports){
"use strict";

const DATA_URL_PATTERN = /^data:([^/]+\/[^,;]+(?:[^,]*?))(;base64)?,([\s\S]*)$/;

module.exports = function dataURItoBlob(dataURI, opts, toFile) {
  var _ref, _opts$mimeType;

  // get the base64 data
  const dataURIData = DATA_URL_PATTERN.exec(dataURI); // user may provide mime type, if not get it from data URI

  const mimeType = (_ref = (_opts$mimeType = opts.mimeType) != null ? _opts$mimeType : dataURIData == null ? void 0 : dataURIData[1]) != null ? _ref : 'plain/text';
  let data;

  if (dataURIData[2] != null) {
    const binary = atob(decodeURIComponent(dataURIData[3]));
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    data = [bytes];
  } else {
    data = [decodeURIComponent(dataURIData[3])];
  } // Convert to a File?


  if (toFile) {
    return new File(data, opts.name || '', {
      type: mimeType
    });
  }

  return new Blob(data, {
    type: mimeType
  });
};

},{}],151:[function(require,module,exports){
"use strict";

const throttle = require('lodash.throttle');

function emitSocketProgress(uploader, progressData, file) {
  const {
    progress,
    bytesUploaded,
    bytesTotal
  } = progressData;

  if (progress) {
    uploader.uppy.log(`Upload progress: ${progress}`);
    uploader.uppy.emit('upload-progress', file, {
      uploader,
      bytesUploaded,
      bytesTotal
    });
  }
}

module.exports = throttle(emitSocketProgress, 300, {
  leading: true,
  trailing: true
});

},{"lodash.throttle":11}],152:[function(require,module,exports){
"use strict";

const NetworkError = require('./NetworkError');
/**
 * Wrapper around window.fetch that throws a NetworkError when appropriate
 */


module.exports = function fetchWithNetworkError(...options) {
  return fetch(...options).catch(err => {
    if (err.name === 'AbortError') {
      throw err;
    } else {
      throw new NetworkError(err);
    }
  });
};

},{"./NetworkError":146}],153:[function(require,module,exports){
"use strict";

const isDOMElement = require('./isDOMElement');
/**
 * Find one or more DOM elements.
 *
 * @param {string|Node} element
 * @returns {Node[]|null}
 */


module.exports = function findAllDOMElements(element) {
  if (typeof element === 'string') {
    const elements = document.querySelectorAll(element);
    return elements.length === 0 ? null : Array.from(elements);
  }

  if (typeof element === 'object' && isDOMElement(element)) {
    return [element];
  }

  return null;
};

},{"./isDOMElement":170}],154:[function(require,module,exports){
"use strict";

const isDOMElement = require('./isDOMElement');
/**
 * Find a DOM element.
 *
 * @param {Node|string} element
 * @returns {Node|null}
 */


module.exports = function findDOMElement(element, context = document) {
  if (typeof element === 'string') {
    return context.querySelector(element);
  }

  if (isDOMElement(element)) {
    return element;
  }

  return null;
};

},{"./isDOMElement":170}],155:[function(require,module,exports){
"use strict";

function encodeCharacter(character) {
  return character.charCodeAt(0).toString(32);
}

function encodeFilename(name) {
  let suffix = '';
  return name.replace(/[^A-Z0-9]/ig, character => {
    suffix += `-${encodeCharacter(character)}`;
    return '/';
  }) + suffix;
}
/**
 * Takes a file object and turns it into fileID, by converting file.name to lowercase,
 * removing extra characters and adding type, size and lastModified
 *
 * @param {object} file
 * @returns {string} the fileID
 */


module.exports = function generateFileID(file) {
  // It's tempting to do `[items].filter(Boolean).join('-')` here, but that
  // is slower! simple string concatenation is fast
  let id = 'uppy';

  if (typeof file.name === 'string') {
    id += `-${encodeFilename(file.name.toLowerCase())}`;
  }

  if (file.type !== undefined) {
    id += `-${file.type}`;
  }

  if (file.meta && typeof file.meta.relativePath === 'string') {
    id += `-${encodeFilename(file.meta.relativePath.toLowerCase())}`;
  }

  if (file.data.size !== undefined) {
    id += `-${file.data.size}`;
  }

  if (file.data.lastModified !== undefined) {
    id += `-${file.data.lastModified}`;
  }

  return id;
};

},{}],156:[function(require,module,exports){
"use strict";

module.exports = function getBytesRemaining(fileProgress) {
  return fileProgress.bytesTotal - fileProgress.bytesUploaded;
};

},{}],157:[function(require,module,exports){
"use strict";

const webkitGetAsEntryApi = require('./utils/webkitGetAsEntryApi/index');

const fallbackApi = require('./utils/fallbackApi');
/**
 * Returns a promise that resolves to the array of dropped files (if a folder is
 * dropped, and browser supports folder parsing - promise resolves to the flat
 * array of all files in all directories).
 * Each file has .relativePath prop appended to it (e.g. "/docs/Prague/ticket_from_prague_to_ufa.pdf")
 * if browser supports it. Otherwise it's undefined.
 *
 * @param {DataTransfer} dataTransfer
 * @param {Function} logDropError - a function that's called every time some
 * folder or some file error out (e.g. because of the folder name being too long
 * on Windows). Notice that resulting promise will always be resolved anyway.
 *
 * @returns {Promise} - Array<File>
 */


module.exports = function getDroppedFiles(dataTransfer, {
  logDropError = () => {}
} = {}) {
  var _dataTransfer$items;

  // Get all files from all subdirs. Works (at least) in Chrome, Mozilla, and Safari
  if ((_dataTransfer$items = dataTransfer.items) != null && _dataTransfer$items[0] && 'webkitGetAsEntry' in dataTransfer.items[0]) {
    return webkitGetAsEntryApi(dataTransfer, logDropError); // Otherwise just return all first-order files
  }

  return fallbackApi(dataTransfer);
};

},{"./utils/fallbackApi":158,"./utils/webkitGetAsEntryApi/index":161}],158:[function(require,module,exports){
"use strict";

const toArray = require('../../toArray'); // .files fallback, should be implemented in any browser


module.exports = function fallbackApi(dataTransfer) {
  const files = toArray(dataTransfer.files);
  return Promise.resolve(files);
};

},{"../../toArray":180}],159:[function(require,module,exports){
"use strict";

/**
 * Recursive function, calls the original callback() when the directory is entirely parsed.
 *
 * @param {FileSystemDirectoryReader} directoryReader
 * @param {Array} oldEntries
 * @param {Function} logDropError
 * @param {Function} callback - called with ([ all files and directories in that directoryReader ])
 */
module.exports = function getFilesAndDirectoriesFromDirectory(directoryReader, oldEntries, logDropError, {
  onSuccess
}) {
  directoryReader.readEntries(entries => {
    const newEntries = [...oldEntries, ...entries]; // According to the FileSystem API spec, getFilesAndDirectoriesFromDirectory()
    // must be called until it calls the onSuccess with an empty array.

    if (entries.length) {
      setTimeout(() => {
        getFilesAndDirectoriesFromDirectory(directoryReader, newEntries, logDropError, {
          onSuccess
        });
      }, 0); // Done iterating this particular directory
    } else {
      onSuccess(newEntries);
    }
  }, // Make sure we resolve on error anyway, it's fine if only one directory couldn't be parsed!
  error => {
    logDropError(error);
    onSuccess(oldEntries);
  });
};

},{}],160:[function(require,module,exports){
"use strict";

/**
 * Get the relative path from the FileEntry#fullPath, because File#webkitRelativePath is always '', at least onDrop.
 *
 * @param {FileEntry} fileEntry
 *
 * @returns {string|null} - if file is not in a folder - return null (this is to
 * be consistent with .relativePath-s of files selected from My Device). If file
 * is in a folder - return its fullPath, e.g. '/simpsons/hi.jpeg'.
 */
module.exports = function getRelativePath(fileEntry) {
  // fileEntry.fullPath - "/simpsons/hi.jpeg" or undefined (for browsers that don't support it)
  // fileEntry.name - "hi.jpeg"
  if (!fileEntry.fullPath || fileEntry.fullPath === `/${fileEntry.name}`) {
    return null;
  }

  return fileEntry.fullPath;
};

},{}],161:[function(require,module,exports){
"use strict";

const toArray = require('../../../toArray');

const getRelativePath = require('./getRelativePath');

const getFilesAndDirectoriesFromDirectory = require('./getFilesAndDirectoriesFromDirectory');

module.exports = function webkitGetAsEntryApi(dataTransfer, logDropError) {
  const files = [];
  const rootPromises = [];
  /**
   * Returns a resolved promise, when :files array is enhanced
   *
   * @param {(FileSystemFileEntry|FileSystemDirectoryEntry)} entry
   * @returns {Promise} - empty promise that resolves when :files is enhanced with a file
   */

  const createPromiseToAddFileOrParseDirectory = entry => new Promise(resolve => {
    // This is a base call
    if (entry.isFile) {
      // Creates a new File object which can be used to read the file.
      entry.file(file => {
        // eslint-disable-next-line no-param-reassign
        file.relativePath = getRelativePath(entry);
        files.push(file);
        resolve();
      }, // Make sure we resolve on error anyway, it's fine if only one file couldn't be read!
      error => {
        logDropError(error);
        resolve();
      }); // This is a recursive call
    } else if (entry.isDirectory) {
      const directoryReader = entry.createReader();
      getFilesAndDirectoriesFromDirectory(directoryReader, [], logDropError, {
        onSuccess: entries => resolve(Promise.all(entries.map(createPromiseToAddFileOrParseDirectory)))
      });
    }
  }); // For each dropped item, - make sure it's a file/directory, and start deepening in!


  toArray(dataTransfer.items).forEach(item => {
    const entry = item.webkitGetAsEntry(); // :entry can be null when we drop the url e.g.

    if (entry) {
      rootPromises.push(createPromiseToAddFileOrParseDirectory(entry));
    }
  });
  return Promise.all(rootPromises).then(() => files);
};

},{"../../../toArray":180,"./getFilesAndDirectoriesFromDirectory":159,"./getRelativePath":160}],162:[function(require,module,exports){
"use strict";

/**
 * Takes a full filename string and returns an object {name, extension}
 *
 * @param {string} fullFileName
 * @returns {object} {name, extension}
 */
module.exports = function getFileNameAndExtension(fullFileName) {
  const lastDot = fullFileName.lastIndexOf('.'); // these count as no extension: "no-dot", "trailing-dot."

  if (lastDot === -1 || lastDot === fullFileName.length - 1) {
    return {
      name: fullFileName,
      extension: undefined
    };
  }

  return {
    name: fullFileName.slice(0, lastDot),
    extension: fullFileName.slice(lastDot + 1)
  };
};

},{}],163:[function(require,module,exports){
"use strict";

const getFileNameAndExtension = require('./getFileNameAndExtension');

const mimeTypes = require('./mimeTypes');

module.exports = function getFileType(file) {
  var _getFileNameAndExtens;

  if (file.type) return file.type;
  const fileExtension = file.name ? (_getFileNameAndExtens = getFileNameAndExtension(file.name).extension) == null ? void 0 : _getFileNameAndExtens.toLowerCase() : null;

  if (fileExtension && fileExtension in mimeTypes) {
    // else, see if we can map extension to a mime type
    return mimeTypes[fileExtension];
  } // if all fails, fall back to a generic byte stream type


  return 'application/octet-stream';
};

},{"./getFileNameAndExtension":162,"./mimeTypes":175}],164:[function(require,module,exports){
"use strict";

const mimeToExtensions = {
  'audio/mp3': 'mp3',
  'audio/mp4': 'mp4',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'video/mp4': 'mp4',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-matroska': 'mkv',
  'video/x-msvideo': 'avi'
};

module.exports = function getFileTypeExtension(mimeType) {
  // Remove the ; bit in 'video/x-matroska;codecs=avc1'
  // eslint-disable-next-line no-param-reassign
  [mimeType] = mimeType.split(';', 1);
  return mimeToExtensions[mimeType] || null;
};

},{}],165:[function(require,module,exports){
"use strict";

module.exports = function getSocketHost(url) {
  // get the host domain
  const regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/i;
  const host = regex.exec(url)[1];
  const socketProtocol = /^http:\/\//i.test(url) ? 'ws' : 'wss';
  return `${socketProtocol}://${host}`;
};

},{}],166:[function(require,module,exports){
"use strict";

module.exports = function getSpeed(fileProgress) {
  if (!fileProgress.bytesUploaded) return 0;
  const timeElapsed = Date.now() - fileProgress.uploadStarted;
  const uploadSpeed = fileProgress.bytesUploaded / (timeElapsed / 1000);
  return uploadSpeed;
};

},{}],167:[function(require,module,exports){
"use strict";

/**
 * Get the declared text direction for an element.
 *
 * @param {Node} element
 * @returns {string|undefined}
 */
function getTextDirection(element) {
  var _element;

  // There is another way to determine text direction using getComputedStyle(), as done here:
  // https://github.com/pencil-js/text-direction/blob/2a235ce95089b3185acec3b51313cbba921b3811/text-direction.js
  //
  // We do not use that approach because we are interested specifically in the _declared_ text direction.
  // If no text direction is declared, we have to provide our own explicit text direction so our
  // bidirectional CSS style sheets work.
  while (element && !element.dir) {
    // eslint-disable-next-line no-param-reassign
    element = element.parentNode;
  }

  return (_element = element) == null ? void 0 : _element.dir;
}

module.exports = getTextDirection;

},{}],168:[function(require,module,exports){
"use strict";

/**
 * Adds zero to strings shorter than two characters.
 *
 * @param {number} number
 * @returns {string}
 */
function pad(number) {
  return number < 10 ? `0${number}` : number.toString();
}
/**
 * Returns a timestamp in the format of `hours:minutes:seconds`
 */


module.exports = function getTimeStamp() {
  const date = new Date();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
};

},{}],169:[function(require,module,exports){
"use strict";

module.exports = function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
};

},{}],170:[function(require,module,exports){
"use strict";

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return (obj == null ? void 0 : obj.nodeType) === Node.ELEMENT_NODE;
};

},{}],171:[function(require,module,exports){
"use strict";

/**
 * Checks if the browser supports Drag & Drop (not supported on mobile devices, for example).
 *
 * @returns {boolean}
 */
module.exports = function isDragDropSupported() {
  const div = document.body;

  if (!('draggable' in div) || !('ondragstart' in div && 'ondrop' in div)) {
    return false;
  }

  if (!('FormData' in window)) {
    return false;
  }

  if (!('FileReader' in window)) {
    return false;
  }

  return true;
};

},{}],172:[function(require,module,exports){
"use strict";

function isNetworkError(xhr) {
  if (!xhr) {
    return false;
  }

  return xhr.readyState !== 0 && xhr.readyState !== 4 || xhr.status === 0;
}

module.exports = isNetworkError;

},{}],173:[function(require,module,exports){
"use strict";

/**
 * Check if a URL string is an object URL from `URL.createObjectURL`.
 *
 * @param {string} url
 * @returns {boolean}
 */
module.exports = function isObjectURL(url) {
  return url.startsWith('blob:');
};

},{}],174:[function(require,module,exports){
"use strict";

module.exports = function isPreviewSupported(fileType) {
  if (!fileType) return false; // list of images that browsers can preview

  return /^[^/]+\/(jpe?g|gif|png|svg|svg\+xml|bmp|webp|avif)$/.test(fileType);
};

},{}],175:[function(require,module,exports){
"use strict";

// ___Why not add the mime-types package?
//    It's 19.7kB gzipped, and we only need mime types for well-known extensions (for file previews).
// ___Where to take new extensions from?
//    https://github.com/jshttp/mime-db/blob/master/db.json
module.exports = {
  md: 'text/markdown',
  markdown: 'text/markdown',
  mp4: 'video/mp4',
  mp3: 'audio/mp3',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  tab: 'text/tab-separated-values',
  avi: 'video/x-msvideo',
  mks: 'video/x-matroska',
  mkv: 'video/x-matroska',
  mov: 'video/quicktime',
  doc: 'application/msword',
  docm: 'application/vnd.ms-word.document.macroenabled.12',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  dot: 'application/msword',
  dotm: 'application/vnd.ms-word.template.macroenabled.12',
  dotx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  xla: 'application/vnd.ms-excel',
  xlam: 'application/vnd.ms-excel.addin.macroenabled.12',
  xlc: 'application/vnd.ms-excel',
  xlf: 'application/x-xliff+xml',
  xlm: 'application/vnd.ms-excel',
  xls: 'application/vnd.ms-excel',
  xlsb: 'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  xlsm: 'application/vnd.ms-excel.sheet.macroenabled.12',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xlt: 'application/vnd.ms-excel',
  xltm: 'application/vnd.ms-excel.template.macroenabled.12',
  xltx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  xlw: 'application/vnd.ms-excel',
  txt: 'text/plain',
  text: 'text/plain',
  conf: 'text/plain',
  log: 'text/plain',
  pdf: 'application/pdf',
  zip: 'application/zip',
  '7z': 'application/x-7z-compressed',
  rar: 'application/x-rar-compressed',
  tar: 'application/x-tar',
  gz: 'application/gzip',
  dmg: 'application/x-apple-diskimage'
};

},{}],176:[function(require,module,exports){
"use strict";

const secondsToTime = require('./secondsToTime');

module.exports = function prettyETA(seconds) {
  const time = secondsToTime(seconds); // Only display hours and minutes if they are greater than 0 but always
  // display minutes if hours is being displayed
  // Display a leading zero if the there is a preceding unit: 1m 05s, but 5s

  const hoursStr = time.hours === 0 ? '' : `${time.hours}h`;
  const minutesStr = time.minutes === 0 ? '' : `${time.hours === 0 ? time.minutes : ` ${time.minutes.toString(10).padStart(2, '0')}`}m`;
  const secondsStr = time.hours !== 0 ? '' : `${time.minutes === 0 ? time.seconds : ` ${time.seconds.toString(10).padStart(2, '0')}`}s`;
  return `${hoursStr}${minutesStr}${secondsStr}`;
};

},{"./secondsToTime":178}],177:[function(require,module,exports){
"use strict";

const getFileNameAndExtension = require('./getFileNameAndExtension');

module.exports = function remoteFileObjToLocal(file) {
  return { ...file,
    type: file.mimeType,
    extension: file.name ? getFileNameAndExtension(file.name).extension : null
  };
};

},{"./getFileNameAndExtension":162}],178:[function(require,module,exports){
"use strict";

module.exports = function secondsToTime(rawSeconds) {
  const hours = Math.floor(rawSeconds / 3600) % 24;
  const minutes = Math.floor(rawSeconds / 60) % 60;
  const seconds = Math.floor(rawSeconds % 60);
  return {
    hours,
    minutes,
    seconds
  };
};

},{}],179:[function(require,module,exports){
"use strict";

module.exports = function settle(promises) {
  const resolutions = [];
  const rejections = [];

  function resolved(value) {
    resolutions.push(value);
  }

  function rejected(error) {
    rejections.push(error);
  }

  const wait = Promise.all(promises.map(promise => promise.then(resolved, rejected)));
  return wait.then(() => {
    return {
      successful: resolutions,
      failed: rejections
    };
  });
};

},{}],180:[function(require,module,exports){
"use strict";

/**
 * Converts list into array
 */
module.exports = Array.from;

},{}],181:[function(require,module,exports){
"use strict";

/**
 * Truncates a string to the given number of chars (maxLength) by inserting '...' in the middle of that string.
 * Partially taken from https://stackoverflow.com/a/5723274/3192470.
 *
 * @param {string} string - string to be truncated
 * @param {number} maxLength - maximum size of the resulting string
 * @returns {string}
 */
const separator = '...';

module.exports = function truncateString(string, maxLength) {
  // Return the empty string if maxLength is zero
  if (maxLength === 0) return ''; // Return original string if it's already shorter than maxLength

  if (string.length <= maxLength) return string; // Return truncated substring appended of the ellipsis char if string can't be meaningfully truncated

  if (maxLength <= separator.length + 1) return `${string.slice(0, maxLength - 1)}…`;
  const charsToShow = maxLength - separator.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return string.slice(0, frontChars) + separator + string.slice(-backChars);
};

},{}],182:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = () => {
  return h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    fill: "#0097DC",
    width: "66",
    height: "55",
    viewBox: "0 0 66 55"
  }, h("path", {
    d: "M57.3 8.433c4.59 0 8.1 3.51 8.1 8.1v29.7c0 4.59-3.51 8.1-8.1 8.1H8.7c-4.59 0-8.1-3.51-8.1-8.1v-29.7c0-4.59 3.51-8.1 8.1-8.1h9.45l4.59-7.02c.54-.54 1.35-1.08 2.16-1.08h16.2c.81 0 1.62.54 2.16 1.08l4.59 7.02h9.45zM33 14.64c-8.62 0-15.393 6.773-15.393 15.393 0 8.62 6.773 15.393 15.393 15.393 8.62 0 15.393-6.773 15.393-15.393 0-8.62-6.773-15.393-15.393-15.393zM33 40c-5.648 0-9.966-4.319-9.966-9.967 0-5.647 4.318-9.966 9.966-9.966s9.966 4.319 9.966 9.966C42.966 35.681 38.648 40 33 40z",
    fillRule: "evenodd"
  }));
};

},{"preact":18}],183:[function(require,module,exports){
"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/* eslint-disable jsx-a11y/media-has-caption */
const {
  h,
  Component
} = require('preact');

const SnapshotButton = require('./SnapshotButton');

const RecordButton = require('./RecordButton');

const RecordingLength = require('./RecordingLength');

const VideoSourceSelect = require('./VideoSourceSelect');

const SubmitButton = require('./SubmitButton');

const DiscardButton = require('./DiscardButton');

function isModeAvailable(modes, mode) {
  return modes.indexOf(mode) !== -1;
}

class CameraScreen extends Component {
  componentDidMount() {
    const {
      onFocus
    } = this.props;
    onFocus();
  }

  componentWillUnmount() {
    const {
      onStop
    } = this.props;
    onStop();
  }

  render() {
    const {
      src,
      recordedVideo,
      recording,
      modes,
      supportsRecording,
      videoSources,
      showVideoSourceDropdown,
      showRecordingLength,
      onSubmit,
      i18n,
      mirror,
      onSnapshot,
      onStartRecording,
      onStopRecording,
      onDiscardRecordedVideo,
      recordingLengthSeconds
    } = this.props;
    const hasRecordedVideo = !!recordedVideo;
    const shouldShowRecordButton = !hasRecordedVideo && supportsRecording && (isModeAvailable(modes, 'video-only') || isModeAvailable(modes, 'audio-only') || isModeAvailable(modes, 'video-audio'));
    const shouldShowSnapshotButton = !hasRecordedVideo && isModeAvailable(modes, 'picture');
    const shouldShowRecordingLength = supportsRecording && showRecordingLength;
    const shouldShowVideoSourceDropdown = showVideoSourceDropdown && videoSources && videoSources.length > 1;
    const videoProps = {
      playsinline: true
    };

    if (recordedVideo) {
      videoProps.muted = false;
      videoProps.controls = true;
      videoProps.src = recordedVideo; // reset srcObject in dom. If not resetted, stream sticks in element

      if (this.videoElement) {
        this.videoElement.srcObject = undefined;
      }
    } else {
      videoProps.muted = true;
      videoProps.autoplay = true;
      videoProps.srcObject = src;
    }

    return h("div", {
      className: "uppy uppy-Webcam-container"
    }, h("div", {
      className: "uppy-Webcam-videoContainer"
    }, h("video", _extends({
      /* eslint-disable-next-line no-return-assign */
      ref: videoElement => this.videoElement = videoElement,
      className: `uppy-Webcam-video  ${mirror ? 'uppy-Webcam-video--mirrored' : ''}`
      /* eslint-disable-next-line react/jsx-props-no-spreading */

    }, videoProps))), h("div", {
      className: "uppy-Webcam-footer"
    }, h("div", {
      className: "uppy-Webcam-videoSourceContainer"
    }, shouldShowVideoSourceDropdown ? VideoSourceSelect(this.props) : null), h("div", {
      className: "uppy-Webcam-buttonContainer"
    }, shouldShowSnapshotButton && h(SnapshotButton, {
      onSnapshot: onSnapshot,
      i18n: i18n
    }), shouldShowRecordButton && h(RecordButton, {
      recording: recording,
      onStartRecording: onStartRecording,
      onStopRecording: onStopRecording,
      i18n: i18n
    }), hasRecordedVideo && h(SubmitButton, {
      onSubmit: onSubmit,
      i18n: i18n
    }), hasRecordedVideo && h(DiscardButton, {
      onDiscard: onDiscardRecordedVideo,
      i18n: i18n
    })), shouldShowRecordingLength && h("div", {
      className: "uppy-Webcam-recordingLength"
    }, h(RecordingLength, {
      recordingLengthSeconds: recordingLengthSeconds,
      i18n: i18n
    }))));
  }

}

module.exports = CameraScreen;

},{"./DiscardButton":184,"./RecordButton":186,"./RecordingLength":187,"./SnapshotButton":188,"./SubmitButton":189,"./VideoSourceSelect":190,"preact":18}],184:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

function DiscardButton({
  onDiscard,
  i18n
}) {
  return h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-Webcam-button uppy-Webcam-button--discard",
    type: "button",
    title: i18n('discardRecordedFile'),
    "aria-label": i18n('discardRecordedFile'),
    onClick: onDiscard,
    "data-uppy-super-focusable": true
  }, h("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 13 13",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon"
  }, h("g", {
    fill: "#FFF",
    fillRule: "evenodd"
  }, h("path", {
    d: "M.496 11.367L11.103.76l1.414 1.414L1.911 12.781z"
  }), h("path", {
    d: "M11.104 12.782L.497 2.175 1.911.76l10.607 10.606z"
  }))));
}

module.exports = DiscardButton;

},{"preact":18}],185:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = props => {
  return h("div", {
    className: "uppy-Webcam-permissons"
  }, h("div", {
    className: "uppy-Webcam-permissonsIcon"
  }, props.icon()), h("h1", {
    className: "uppy-Webcam-title"
  }, props.hasCamera ? props.i18n('allowAccessTitle') : props.i18n('noCameraTitle')), h("p", null, props.hasCamera ? props.i18n('allowAccessDescription') : props.i18n('noCameraDescription')));
};

},{"preact":18}],186:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = function RecordButton({
  recording,
  onStartRecording,
  onStopRecording,
  i18n
}) {
  if (recording) {
    return h("button", {
      className: "uppy-u-reset uppy-c-btn uppy-Webcam-button",
      type: "button",
      title: i18n('stopRecording'),
      "aria-label": i18n('stopRecording'),
      onClick: onStopRecording,
      "data-uppy-super-focusable": true
    }, h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      className: "uppy-c-icon",
      width: "100",
      height: "100",
      viewBox: "0 0 100 100"
    }, h("rect", {
      x: "15",
      y: "15",
      width: "70",
      height: "70"
    })));
  }

  return h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-Webcam-button",
    type: "button",
    title: i18n('startRecording'),
    "aria-label": i18n('startRecording'),
    onClick: onStartRecording,
    "data-uppy-super-focusable": true
  }, h("svg", {
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon",
    width: "100",
    height: "100",
    viewBox: "0 0 100 100"
  }, h("circle", {
    cx: "50",
    cy: "50",
    r: "40"
  })));
};

},{"preact":18}],187:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const formatSeconds = require('./formatSeconds');

module.exports = function RecordingLength({
  recordingLengthSeconds,
  i18n
}) {
  const formattedRecordingLengthSeconds = formatSeconds(recordingLengthSeconds);
  return h("span", {
    "aria-label": i18n('recordingLength', {
      recording_length: formattedRecordingLengthSeconds
    })
  }, formattedRecordingLengthSeconds);
};

},{"./formatSeconds":191,"preact":18}],188:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

const CameraIcon = require('./CameraIcon');

module.exports = ({
  onSnapshot,
  i18n
}) => {
  return h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-Webcam-button uppy-Webcam-button--picture",
    type: "button",
    title: i18n('takePicture'),
    "aria-label": i18n('takePicture'),
    onClick: onSnapshot,
    "data-uppy-super-focusable": true
  }, CameraIcon());
};

},{"./CameraIcon":182,"preact":18}],189:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

function SubmitButton({
  onSubmit,
  i18n
}) {
  return h("button", {
    className: "uppy-u-reset uppy-c-btn uppy-Webcam-button uppy-Webcam-button--submit",
    type: "button",
    title: i18n('submitRecordedFile'),
    "aria-label": i18n('submitRecordedFile'),
    onClick: onSubmit,
    "data-uppy-super-focusable": true
  }, h("svg", {
    width: "12",
    height: "9",
    viewBox: "0 0 12 9",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    focusable: "false",
    className: "uppy-c-icon"
  }, h("path", {
    fill: "#fff",
    fillRule: "nonzero",
    d: "M10.66 0L12 1.31 4.136 9 0 4.956l1.34-1.31L4.136 6.38z"
  })));
}

module.exports = SubmitButton;

},{"preact":18}],190:[function(require,module,exports){
"use strict";

const {
  h
} = require('preact');

module.exports = ({
  currentDeviceId,
  videoSources,
  onChangeVideoSource
}) => {
  return h("div", {
    className: "uppy-Webcam-videoSource"
  }, h("select", {
    className: "uppy-u-reset uppy-Webcam-videoSource-select",
    onChange: event => {
      onChangeVideoSource(event.target.value);
    }
  }, videoSources.map(videoSource => h("option", {
    key: videoSource.deviceId,
    value: videoSource.deviceId,
    selected: videoSource.deviceId === currentDeviceId
  }, videoSource.label))));
};

},{"preact":18}],191:[function(require,module,exports){
"use strict";

/**
 * Takes an Integer value of seconds (e.g. 83) and converts it into a human-readable formatted string (e.g. '1:23').
 *
 * @param {Integer} seconds
 * @returns {string} the formatted seconds (e.g. '1:23' for 1 minute and 23 seconds)
 *
 */
module.exports = function formatSeconds(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, 0)}`;
};

},{}],192:[function(require,module,exports){
"use strict";

var _class, _enableMirror, _temp;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

const {
  h
} = require('preact');

const {
  UIPlugin
} = require('./../../core');

const getFileTypeExtension = require('./../../utils/lib/getFileTypeExtension');

const mimeTypes = require('./../../utils/lib/mimeTypes');

const canvasToBlob = require('./../../utils/lib/canvasToBlob');

const supportsMediaRecorder = require('./supportsMediaRecorder');

const CameraIcon = require('./CameraIcon');

const CameraScreen = require('./CameraScreen');

const PermissionsScreen = require('./PermissionsScreen');

const locale = require('./locale.js');
/**
 * Normalize a MIME type or file extension into a MIME type.
 *
 * @param {string} fileType - MIME type or a file extension prefixed with `.`.
 * @returns {string|undefined} The MIME type or `undefined` if the fileType is an extension and is not known.
 */


function toMimeType(fileType) {
  if (fileType[0] === '.') {
    return mimeTypes[fileType.slice(1)];
  }

  return fileType;
}
/**
 * Is this MIME type a video?
 *
 * @param {string} mimeType - MIME type.
 * @returns {boolean}
 */


function isVideoMimeType(mimeType) {
  return /^video\/[^*]+$/.test(mimeType);
}
/**
 * Is this MIME type an image?
 *
 * @param {string} mimeType - MIME type.
 * @returns {boolean}
 */


function isImageMimeType(mimeType) {
  return /^image\/[^*]+$/.test(mimeType);
}

function getMediaDevices() {
  // bug in the compatibility data
  // eslint-disable-next-line compat/compat
  return navigator.mediaDevices;
}
/**
 * Webcam
 */


module.exports = (_temp = (_enableMirror = /*#__PURE__*/_classPrivateFieldLooseKey("enableMirror"), _class = class Webcam extends UIPlugin {
  // eslint-disable-next-line global-require
  // enableMirror is used to toggle mirroring, for instance when discarding the video,
  // while `opts.mirror` is used to remember the initial user setting
  constructor(uppy, opts) {
    super(uppy, opts);
    Object.defineProperty(this, _enableMirror, {
      writable: true,
      value: void 0
    });
    this.mediaDevices = getMediaDevices();
    this.supportsUserMedia = !!this.mediaDevices; // eslint-disable-next-line no-restricted-globals

    this.protocol = location.protocol.match(/https/i) ? 'https' : 'http';
    this.id = this.opts.id || 'Webcam';
    this.type = 'acquirer';
    this.capturedMediaFile = null;

    this.icon = () => h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "32",
      height: "32",
      viewBox: "0 0 32 32"
    }, h("g", {
      fill: "none",
      fillRule: "evenodd"
    }, h("rect", {
      className: "uppy-ProviderIconBg",
      fill: "#03BFEF",
      width: "32",
      height: "32",
      rx: "16"
    }), h("path", {
      d: "M22 11c1.133 0 2 .867 2 2v7.333c0 1.134-.867 2-2 2H10c-1.133 0-2-.866-2-2V13c0-1.133.867-2 2-2h2.333l1.134-1.733C13.6 9.133 13.8 9 14 9h4c.2 0 .4.133.533.267L19.667 11H22zm-6 1.533a3.764 3.764 0 0 0-3.8 3.8c0 2.129 1.672 3.801 3.8 3.801s3.8-1.672 3.8-3.8c0-2.13-1.672-3.801-3.8-3.801zm0 6.261c-1.395 0-2.46-1.066-2.46-2.46 0-1.395 1.065-2.461 2.46-2.461s2.46 1.066 2.46 2.46c0 1.395-1.065 2.461-2.46 2.461z",
      fill: "#FFF",
      fillRule: "nonzero"
    })));

    this.defaultLocale = locale; // set default options

    const defaultOptions = {
      onBeforeSnapshot: () => Promise.resolve(),
      countdown: false,
      modes: ['video-audio', 'video-only', 'audio-only', 'picture'],
      mirror: true,
      showVideoSourceDropdown: false,
      facingMode: 'user',
      preferredImageMimeType: null,
      preferredVideoMimeType: null,
      showRecordingLength: false
    };
    this.opts = { ...defaultOptions,
      ...opts
    };
    this.i18nInit();
    this.title = this.i18n('pluginNameCamera');
    _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror] = this.opts.mirror;
    this.install = this.install.bind(this);
    this.setPluginState = this.setPluginState.bind(this);
    this.render = this.render.bind(this); // Camera controls

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.takeSnapshot = this.takeSnapshot.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.discardRecordedVideo = this.discardRecordedVideo.bind(this);
    this.submit = this.submit.bind(this);
    this.oneTwoThreeSmile = this.oneTwoThreeSmile.bind(this);
    this.focus = this.focus.bind(this);
    this.changeVideoSource = this.changeVideoSource.bind(this);
    this.webcamActive = false;

    if (this.opts.countdown) {
      this.opts.onBeforeSnapshot = this.oneTwoThreeSmile;
    }

    this.setPluginState({
      hasCamera: false,
      cameraReady: false,
      cameraError: null,
      recordingLengthSeconds: 0,
      videoSources: [],
      currentDeviceId: null
    });
  }

  setOptions(newOpts) {
    super.setOptions({ ...newOpts,
      videoConstraints: { // May be undefined but ... handles that
        ...this.opts.videoConstraints,
        ...(newOpts == null ? void 0 : newOpts.videoConstraints)
      }
    });
  }

  hasCameraCheck() {
    if (!this.mediaDevices) {
      return Promise.resolve(false);
    }

    return this.mediaDevices.enumerateDevices().then(devices => {
      return devices.some(device => device.kind === 'videoinput');
    });
  }

  isAudioOnly() {
    return this.opts.modes.length === 1 && this.opts.modes[0] === 'audio-only';
  }

  getConstraints(deviceId = null) {
    const acceptsAudio = this.opts.modes.indexOf('video-audio') !== -1 || this.opts.modes.indexOf('audio-only') !== -1;
    const acceptsVideo = !this.isAudioOnly() && (this.opts.modes.indexOf('video-audio') !== -1 || this.opts.modes.indexOf('video-only') !== -1 || this.opts.modes.indexOf('picture') !== -1);
    const videoConstraints = { ...(this.opts.videoConstraints || {
        facingMode: this.opts.facingMode
      }),
      // facingMode takes precedence over deviceId, and not needed
      // when specific device is selected
      ...(deviceId ? {
        deviceId,
        facingMode: null
      } : {})
    };
    return {
      audio: acceptsAudio,
      video: acceptsVideo ? videoConstraints : false
    };
  } // eslint-disable-next-line consistent-return


  start(options = null) {
    if (!this.supportsUserMedia) {
      return Promise.reject(new Error('Webcam access not supported'));
    }

    this.webcamActive = true;

    if (this.opts.mirror) {
      _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror] = true;
    }

    const constraints = this.getConstraints(options && options.deviceId ? options.deviceId : null);
    this.hasCameraCheck().then(hasCamera => {
      this.setPluginState({
        hasCamera
      }); // ask user for access to their camera

      return this.mediaDevices.getUserMedia(constraints).then(stream => {
        this.stream = stream;
        let currentDeviceId = null;
        const tracks = this.isAudioOnly() ? stream.getAudioTracks() : stream.getVideoTracks();

        if (!options || !options.deviceId) {
          currentDeviceId = tracks[0].getSettings().deviceId;
        } else {
          tracks.forEach(track => {
            if (track.getSettings().deviceId === options.deviceId) {
              currentDeviceId = track.getSettings().deviceId;
            }
          });
        } // Update the sources now, so we can access the names.


        this.updateVideoSources();
        this.setPluginState({
          currentDeviceId,
          cameraReady: true
        });
      }).catch(err => {
        this.setPluginState({
          cameraReady: false,
          cameraError: err
        });
        this.uppy.info(err.message, 'error');
      });
    });
  }
  /**
   * @returns {object}
   */


  getMediaRecorderOptions() {
    const options = {}; // Try to use the `opts.preferredVideoMimeType` or one of the `allowedFileTypes` for the recording.
    // If the browser doesn't support it, we'll fall back to the browser default instead.
    // Safari doesn't have the `isTypeSupported` API.

    if (MediaRecorder.isTypeSupported) {
      const {
        restrictions
      } = this.uppy.opts;
      let preferredVideoMimeTypes = [];

      if (this.opts.preferredVideoMimeType) {
        preferredVideoMimeTypes = [this.opts.preferredVideoMimeType];
      } else if (restrictions.allowedFileTypes) {
        preferredVideoMimeTypes = restrictions.allowedFileTypes.map(toMimeType).filter(isVideoMimeType);
      }

      const filterSupportedTypes = candidateType => MediaRecorder.isTypeSupported(candidateType) && getFileTypeExtension(candidateType);

      const acceptableMimeTypes = preferredVideoMimeTypes.filter(filterSupportedTypes);

      if (acceptableMimeTypes.length > 0) {
        // eslint-disable-next-line prefer-destructuring
        options.mimeType = acceptableMimeTypes[0];
      }
    }

    return options;
  }

  startRecording() {
    // only used if supportsMediaRecorder() returned true
    // eslint-disable-next-line compat/compat
    this.recorder = new MediaRecorder(this.stream, this.getMediaRecorderOptions());
    this.recordingChunks = [];
    let stoppingBecauseOfMaxSize = false;
    this.recorder.addEventListener('dataavailable', event => {
      this.recordingChunks.push(event.data);
      const {
        restrictions
      } = this.uppy.opts;

      if (this.recordingChunks.length > 1 && restrictions.maxFileSize != null && !stoppingBecauseOfMaxSize) {
        const totalSize = this.recordingChunks.reduce((acc, chunk) => acc + chunk.size, 0); // Exclude the initial chunk from the average size calculation because it is likely to be a very small outlier

        const averageChunkSize = (totalSize - this.recordingChunks[0].size) / (this.recordingChunks.length - 1);
        const expectedEndChunkSize = averageChunkSize * 3;
        const maxSize = Math.max(0, restrictions.maxFileSize - expectedEndChunkSize);

        if (totalSize > maxSize) {
          stoppingBecauseOfMaxSize = true;
          this.uppy.info(this.i18n('recordingStoppedMaxSize'), 'warning', 4000);
          this.stopRecording();
        }
      }
    }); // use a "time slice" of 500ms: ondataavailable will be called each 500ms
    // smaller time slices mean we can more accurately check the max file size restriction

    this.recorder.start(500);

    if (this.opts.showRecordingLength) {
      // Start the recordingLengthTimer if we are showing the recording length.
      this.recordingLengthTimer = setInterval(() => {
        const currentRecordingLength = this.getPluginState().recordingLengthSeconds;
        this.setPluginState({
          recordingLengthSeconds: currentRecordingLength + 1
        });
      }, 1000);
    }

    this.setPluginState({
      isRecording: true
    });
  }

  stopRecording() {
    const stopped = new Promise(resolve => {
      this.recorder.addEventListener('stop', () => {
        resolve();
      });
      this.recorder.stop();

      if (this.opts.showRecordingLength) {
        // Stop the recordingLengthTimer if we are showing the recording length.
        clearInterval(this.recordingLengthTimer);
        this.setPluginState({
          recordingLengthSeconds: 0
        });
      }
    });
    return stopped.then(() => {
      this.setPluginState({
        isRecording: false
      });
      return this.getVideo();
    }).then(file => {
      try {
        this.capturedMediaFile = file; // create object url for capture result preview

        this.setPluginState({
          // eslint-disable-next-line compat/compat
          recordedVideo: URL.createObjectURL(file.data)
        });
        _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror] = false;
      } catch (err) {
        // Logging the error, exept restrictions, which is handled in Core
        if (!err.isRestriction) {
          this.uppy.log(err);
        }
      }
    }).then(() => {
      this.recordingChunks = null;
      this.recorder = null;
    }, error => {
      this.recordingChunks = null;
      this.recorder = null;
      throw error;
    });
  }

  discardRecordedVideo() {
    this.setPluginState({
      recordedVideo: null
    });

    if (this.opts.mirror) {
      _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror] = true;
    }

    this.capturedMediaFile = null;
  }

  submit() {
    try {
      if (this.capturedMediaFile) {
        this.uppy.addFile(this.capturedMediaFile);
      }
    } catch (err) {
      // Logging the error, exept restrictions, which is handled in Core
      if (!err.isRestriction) {
        this.uppy.log(err, 'error');
      }
    }
  }

  async stop() {
    if (this.stream) {
      const audioTracks = this.stream.getAudioTracks();
      const videoTracks = this.stream.getVideoTracks();
      audioTracks.concat(videoTracks).forEach(track => track.stop());
    }

    if (this.recorder) {
      await new Promise(resolve => {
        this.recorder.addEventListener('stop', resolve, {
          once: true
        });
        this.recorder.stop();

        if (this.opts.showRecordingLength) {
          clearInterval(this.recordingLengthTimer);
        }
      });
    }

    this.recordingChunks = null;
    this.recorder = null;
    this.webcamActive = false;
    this.stream = null;
    this.setPluginState({
      recordedVideo: null,
      isRecording: false,
      recordingLengthSeconds: 0
    });
  }

  getVideoElement() {
    return this.el.querySelector('.uppy-Webcam-video');
  }

  oneTwoThreeSmile() {
    return new Promise((resolve, reject) => {
      let count = this.opts.countdown; // eslint-disable-next-line consistent-return

      const countDown = setInterval(() => {
        if (!this.webcamActive) {
          clearInterval(countDown);
          this.captureInProgress = false;
          return reject(new Error('Webcam is not active'));
        }

        if (count > 0) {
          this.uppy.info(`${count}...`, 'warning', 800);
          count--;
        } else {
          clearInterval(countDown);
          this.uppy.info(this.i18n('smile'), 'success', 1500);
          setTimeout(() => resolve(), 1500);
        }
      }, 1000);
    });
  }

  takeSnapshot() {
    if (this.captureInProgress) return;
    this.captureInProgress = true;
    this.opts.onBeforeSnapshot().catch(err => {
      const message = typeof err === 'object' ? err.message : err;
      this.uppy.info(message, 'error', 5000);
      return Promise.reject(new Error(`onBeforeSnapshot: ${message}`));
    }).then(() => {
      return this.getImage();
    }).then(tagFile => {
      this.captureInProgress = false;

      try {
        this.uppy.addFile(tagFile);
      } catch (err) {
        // Logging the error, except restrictions, which is handled in Core
        if (!err.isRestriction) {
          this.uppy.log(err);
        }
      }
    }, error => {
      this.captureInProgress = false;
      throw error;
    });
  }

  getImage() {
    const video = this.getVideoElement();

    if (!video) {
      return Promise.reject(new Error('No video element found, likely due to the Webcam tab being closed.'));
    }

    const width = video.videoWidth;
    const height = video.videoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const {
      restrictions
    } = this.uppy.opts;
    let preferredImageMimeTypes = [];

    if (this.opts.preferredImageMimeType) {
      preferredImageMimeTypes = [this.opts.preferredImageMimeType];
    } else if (restrictions.allowedFileTypes) {
      preferredImageMimeTypes = restrictions.allowedFileTypes.map(toMimeType).filter(isImageMimeType);
    }

    const mimeType = preferredImageMimeTypes[0] || 'image/jpeg';
    const ext = getFileTypeExtension(mimeType) || 'jpg';
    const name = `cam-${Date.now()}.${ext}`;
    return canvasToBlob(canvas, mimeType).then(blob => {
      return {
        source: this.id,
        name,
        data: new Blob([blob], {
          type: mimeType
        }),
        type: mimeType
      };
    });
  }

  getVideo() {
    // Sometimes in iOS Safari, Blobs (especially the first Blob in the recordingChunks Array)
    // have empty 'type' attributes (e.g. '') so we need to find a Blob that has a defined 'type'
    // attribute in order to determine the correct MIME type.
    const mimeType = this.recordingChunks.find(blob => {
      var _blob$type;

      return ((_blob$type = blob.type) == null ? void 0 : _blob$type.length) > 0;
    }).type;
    const fileExtension = getFileTypeExtension(mimeType);

    if (!fileExtension) {
      return Promise.reject(new Error(`Could not retrieve recording: Unsupported media type "${mimeType}"`));
    }

    const name = `webcam-${Date.now()}.${fileExtension}`;
    const blob = new Blob(this.recordingChunks, {
      type: mimeType
    });
    const file = {
      source: this.id,
      name,
      data: new Blob([blob], {
        type: mimeType
      }),
      type: mimeType
    };
    return Promise.resolve(file);
  }

  focus() {
    if (!this.opts.countdown) return;
    setTimeout(() => {
      this.uppy.info(this.i18n('smile'), 'success', 1500);
    }, 1000);
  }

  changeVideoSource(deviceId) {
    this.stop();
    this.start({
      deviceId
    });
  }

  updateVideoSources() {
    this.mediaDevices.enumerateDevices().then(devices => {
      this.setPluginState({
        videoSources: devices.filter(device => device.kind === 'videoinput')
      });
    });
  }

  render() {
    if (!this.webcamActive) {
      this.start();
    }

    const webcamState = this.getPluginState();

    if (!webcamState.cameraReady || !webcamState.hasCamera) {
      return h(PermissionsScreen, {
        icon: CameraIcon,
        i18n: this.i18n,
        hasCamera: webcamState.hasCamera
      });
    }

    return h(CameraScreen // eslint-disable-next-line react/jsx-props-no-spreading
    , _extends({}, webcamState, {
      onChangeVideoSource: this.changeVideoSource,
      onSnapshot: this.takeSnapshot,
      onStartRecording: this.startRecording,
      onStopRecording: this.stopRecording,
      onDiscardRecordedVideo: this.discardRecordedVideo,
      onSubmit: this.submit,
      onFocus: this.focus,
      onStop: this.stop,
      i18n: this.i18n,
      modes: this.opts.modes,
      showRecordingLength: this.opts.showRecordingLength,
      showVideoSourceDropdown: this.opts.showVideoSourceDropdown,
      supportsRecording: supportsMediaRecorder(),
      recording: webcamState.isRecording,
      mirror: _classPrivateFieldLooseBase(this, _enableMirror)[_enableMirror],
      src: this.stream
    }));
  }

  install() {
    this.setPluginState({
      cameraReady: false,
      recordingLengthSeconds: 0
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }

    if (this.mediaDevices) {
      this.updateVideoSources();

      this.mediaDevices.ondevicechange = () => {
        this.updateVideoSources();

        if (this.stream) {
          let restartStream = true;
          const {
            videoSources,
            currentDeviceId
          } = this.getPluginState();
          videoSources.forEach(videoSource => {
            if (currentDeviceId === videoSource.deviceId) {
              restartStream = false;
            }
          });

          if (restartStream) {
            this.stop();
            this.start();
          }
        }
      };
    }
  }

  uninstall() {
    this.stop();
    this.unmount();
  }

  onUnmount() {
    this.stop();
  }

}), _class.VERSION = "2.0.4", _temp);

},{"./../../core":48,"./../../utils/lib/canvasToBlob":149,"./../../utils/lib/getFileTypeExtension":164,"./../../utils/lib/mimeTypes":175,"./CameraIcon":182,"./CameraScreen":183,"./PermissionsScreen":185,"./locale.js":193,"./supportsMediaRecorder":194,"preact":18}],193:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    pluginNameCamera: 'Camera',
    noCameraTitle: 'Camera Not Available',
    noCameraDescription: 'In order to take pictures or record video, please connect a camera device',
    recordingStoppedMaxSize: 'Recording stopped because the file size is about to exceed the limit',
    submitRecordedFile: 'Submit recorded file',
    discardRecordedFile: 'Discard recorded file',
    // Shown before a picture is taken when the `countdown` option is set.
    smile: 'Smile!',
    // Used as the label for the button that takes a picture.
    // This is not visibly rendered but is picked up by screen readers.
    takePicture: 'Take a picture',
    // Used as the label for the button that starts a video recording.
    // This is not visibly rendered but is picked up by screen readers.
    startRecording: 'Begin video recording',
    // Used as the label for the button that stops a video recording.
    // This is not visibly rendered but is picked up by screen readers.
    stopRecording: 'Stop video recording',
    // Used as the label for the recording length counter. See the showRecordingLength option.
    // This is not visibly rendered but is picked up by screen readers.
    recordingLength: 'Recording length %{recording_length}',
    // Title on the “allow access” screen
    allowAccessTitle: 'Please allow access to your camera',
    // Description on the “allow access” screen
    allowAccessDescription: 'In order to take pictures or record video with your camera, please allow camera access for this site.'
  }
};

},{}],194:[function(require,module,exports){
"use strict";

module.exports = function supportsMediaRecorder() {
  /* eslint-disable compat/compat */
  return typeof MediaRecorder === 'function' && !!MediaRecorder.prototype && typeof MediaRecorder.prototype.start === 'function';
  /* eslint-enable compat/compat */
};

},{}],195:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  Provider
} = require('./../../companion-client');

const {
  ProviderViews
} = require('./../../provider-views');

const {
  h
} = require('preact');

const locale = require('./locale');

module.exports = (_temp = _class = class Zoom extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'Zoom';
    Provider.initPlugin(this, opts);
    this.title = this.opts.title || 'Zoom';

    this.icon = () => h("svg", {
      "aria-hidden": "true",
      focusable: "false",
      width: "32",
      height: "32",
      viewBox: "0 0 32 32"
    }, h("rect", {
      className: "uppy-ProviderIconBg",
      width: "32",
      height: "32",
      rx: "16",
      fill: "#0E71EB"
    }), h("g", {
      fill: "none",
      fillRule: "evenodd"
    }, h("path", {
      fill: "#fff",
      d: "M29,31H14c-1.657,0-3-1.343-3-3V17h15c1.657,0,3,1.343,3,3V31z",
      style: {
        transform: 'translate(-5px, -5px) scale(0.9)'
      }
    }), h("polygon", {
      fill: "#fff",
      points: "37,31 31,27 31,21 37,17",
      style: {
        transform: 'translate(-5px, -5px) scale(0.9)'
      }
    })));

    this.provider = new Provider(uppy, {
      companionUrl: this.opts.companionUrl,
      companionHeaders: this.opts.companionHeaders,
      companionKeysParams: this.opts.companionKeysParams,
      companionCookiesRule: this.opts.companionCookiesRule,
      provider: 'zoom',
      pluginId: this.id
    });
    this.defaultLocale = locale;
    this.i18nInit();
    this.title = this.i18n('pluginNameZoom');
    this.onFirstRender = this.onFirstRender.bind(this);
    this.render = this.render.bind(this);
  }

  install() {
    this.view = new ProviderViews(this, {
      provider: this.provider
    });
    const {
      target
    } = this.opts;

    if (target) {
      this.mount(target, this);
    }
  }

  uninstall() {
    this.view.tearDown();
    this.unmount();
  }

  onFirstRender() {
    return Promise.all([this.provider.fetchPreAuthToken(), this.view.getFolder()]);
  }

  render(state) {
    return this.view.render(state);
  }

}, _class.VERSION = "1.0.4", _temp);

},{"./../../companion-client":42,"./../../core":48,"./../../provider-views":120,"./locale":196,"preact":18}],196:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    pluginNameZoom: 'Zoom'
  }
};

},{}],197:[function(require,module,exports){
"use strict";

const Uppy = require('./../../../../packages/@uppy/core');

const Dashboard = require('./../../../../packages/@uppy/dashboard');

const GoogleDrive = require('./../../../../packages/@uppy/google-drive');

const Dropbox = require('./../../../../packages/@uppy/dropbox');

const Instagram = require('./../../../../packages/@uppy/instagram');

const Facebook = require('./../../../../packages/@uppy/facebook');

const OneDrive = require('./../../../../packages/@uppy/onedrive');

const Zoom = require('./../../../../packages/@uppy/zoom'); // const Box = require('@uppy/box')


const ImageEditor = require('./../../../../packages/@uppy/image-editor');

const Url = require('./../../../../packages/@uppy/url');

const Webcam = require('./../../../../packages/@uppy/webcam');

const ScreenCapture = require('./../../../../packages/@uppy/screen-capture');

const Tus = require('./../../../../packages/@uppy/tus');

const DropTarget = require('./../../../../packages/@uppy/drop-target');

const GoldenRetriever = require('./../../../../packages/@uppy/golden-retriever');

const localeList = require('../locale_list.json');

const COMPANION = require('../env');

const RTL_LOCALES = ['ar_SA', 'fa_IR', 'he_IL'];

if (typeof window !== 'undefined' && typeof window.Uppy === 'undefined') {
  window.Uppy = {
    locales: {}
  };
}

function uppyInit() {
  if (window.uppy) {
    window.uppy.close();
  }

  const opts = window.uppyOptions;
  const uppy = new Uppy({
    logger: Uppy.debugLogger
  });
  uppy.use(Tus, {
    endpoint: 'https://tusd.tusdemo.net/files/'
  });
  uppy.on('complete', result => {
    console.log('successful files:');
    console.log(result.successful);
    console.log('failed files:');
    console.log(result.failed);
  });
  uppy.use(Dashboard, {
    trigger: '.UppyModalOpenerBtn',
    target: opts.DashboardInline ? '.DashboardContainer' : 'body',
    inline: opts.DashboardInline,
    height: 470,
    showProgressDetails: true,
    metaFields: [{
      id: 'name',
      name: 'Name',
      placeholder: 'file name'
    }, {
      id: 'caption',
      name: 'Caption',
      placeholder: 'add description'
    }]
  });
  window.uppy = uppy;
}

function uppySetOptions() {
  const opts = window.uppyOptions;
  const defaultNullRestrictions = {
    maxFileSize: null,
    minFileSize: null,
    maxNumberOfFiles: null,
    minNumberOfFiles: null,
    allowedFileTypes: null
  };
  const restrictions = {
    maxFileSize: 1000000,
    maxNumberOfFiles: 3,
    minNumberOfFiles: 2,
    allowedFileTypes: ['image/*', 'video/*'],
    requiredMetaFields: ['caption']
  };
  window.uppy.setOptions({
    autoProceed: opts.autoProceed,
    restrictions: opts.restrictions ? restrictions : defaultNullRestrictions
  });
  window.uppy.getPlugin('Dashboard').setOptions({
    note: opts.restrictions ? 'Images and video only, 2–3 files, up to 1 MB' : '',
    theme: opts.darkMode ? 'dark' : 'light',
    disabled: opts.disabled
  });
  const googleDriveInstance = window.uppy.getPlugin('GoogleDrive');

  if (opts.GoogleDrive && !googleDriveInstance) {
    window.uppy.use(GoogleDrive, {
      target: Dashboard,
      companionUrl: COMPANION
    });
  }

  if (!opts.GoogleDrive && googleDriveInstance) {
    window.uppy.removePlugin(googleDriveInstance);
  }

  const dropboxInstance = window.uppy.getPlugin('Dropbox');

  if (opts.Dropbox && !dropboxInstance) {
    window.uppy.use(Dropbox, {
      target: Dashboard,
      companionUrl: COMPANION
    });
  }

  if (!opts.Dropbox && dropboxInstance) {
    window.uppy.removePlugin(dropboxInstance);
  }

  const instagramInstance = window.uppy.getPlugin('Instagram');

  if (opts.Instagram && !instagramInstance) {
    window.uppy.use(Instagram, {
      target: Dashboard,
      companionUrl: COMPANION
    });
  }

  if (!opts.Instagram && instagramInstance) {
    window.uppy.removePlugin(instagramInstance);
  }

  const urlInstance = window.uppy.getPlugin('Url');

  if (opts.Url && !urlInstance) {
    window.uppy.use(Url, {
      target: Dashboard,
      companionUrl: COMPANION
    });
  }

  if (!opts.Url && urlInstance) {
    window.uppy.removePlugin(urlInstance);
  }

  const facebookInstance = window.uppy.getPlugin('Facebook');

  if (opts.Facebook && !facebookInstance) {
    window.uppy.use(Facebook, {
      target: Dashboard,
      companionUrl: COMPANION
    });
  }

  if (!opts.Facebook && facebookInstance) {
    window.uppy.removePlugin(facebookInstance);
  }

  const oneDriveInstance = window.uppy.getPlugin('OneDrive');

  if (opts.OneDrive && !oneDriveInstance) {
    window.uppy.use(OneDrive, {
      target: Dashboard,
      companionUrl: COMPANION
    });
  }

  if (!opts.OneDrive && oneDriveInstance) {
    window.uppy.removePlugin(oneDriveInstance);
  }

  const zoomInstance = window.uppy.getPlugin('Zoom');

  if (opts.Zoom && !zoomInstance) {
    window.uppy.use(Zoom, {
      target: Dashboard,
      companionUrl: 'https://intense-meadow-61813.herokuapp.com/'
    });
  }

  if (!opts.Zoom && zoomInstance) {
    window.uppy.removePlugin(zoomInstance);
  } //   const boxInstance = window.uppy.getPlugin('Box')
  //   if (opts.Box && !boxInstance) {
  //     window.uppy.use(Box, { target: Dashboard, companionUrl: COMPANION })
  //   }
  //   if (!opts.Box && boxInstance) {
  //     window.uppy.removePlugin(boxInstance)
  //   }


  const webcamInstance = window.uppy.getPlugin('Webcam');

  if (opts.Webcam && !webcamInstance) {
    window.uppy.use(Webcam, {
      target: Dashboard,
      showVideoSourceDropdown: true
    });
  }

  if (!opts.Webcam && webcamInstance) {
    window.uppy.removePlugin(webcamInstance);
  }

  const screenCaptureInstance = window.uppy.getPlugin('ScreenCapture');

  if (opts.ScreenCapture && !screenCaptureInstance) {
    window.uppy.use(ScreenCapture, {
      target: Dashboard
    });
  }

  if (!opts.ScreenCapture && screenCaptureInstance) {
    window.uppy.removePlugin(screenCaptureInstance);
  }

  const imageEditorInstance = window.uppy.getPlugin('ImageEditor');

  if (opts.imageEditor && !imageEditorInstance) {
    window.uppy.use(ImageEditor, {
      target: Dashboard
    });
  }

  if (!opts.imageEditor && imageEditorInstance) {
    window.uppy.removePlugin(imageEditorInstance);
  }

  const dropTargetInstance = window.uppy.getPlugin('DropTarget');

  if (opts.DropTarget && !dropTargetInstance) {
    window.uppy.use(DropTarget, {
      target: document.body
    });
  }

  if (!opts.DropTarget && dropTargetInstance) {
    window.uppy.removePlugin(dropTargetInstance);
  }

  const goldenRetrieverInstance = window.uppy.getPlugin('GoldenRetriever');

  if (opts.GoldenRetriever && !goldenRetrieverInstance) {
    window.uppy.use(GoldenRetriever);
  }

  if (!opts.GoldenRetriever && goldenRetrieverInstance) {
    window.uppy.removePlugin(goldenRetrieverInstance);
  }
}

function whenLocaleAvailable(localeName, callback) {
  const interval = 100; // ms

  const loop = setInterval(() => {
    if (window.Uppy && window.Uppy.locales && window.Uppy.locales[localeName]) {
      clearInterval(loop);
      callback(window.Uppy.locales[localeName]);
    }
  }, interval);
}

function loadLocaleFromCDN(localeName) {
  const head = document.getElementsByTagName('head')[0];
  const js = document.createElement('script');
  js.type = 'text/javascript';
  js.src = `https://releases.transloadit.com/uppy/locales/v2.0.3/${localeName}.min.js`;
  head.appendChild(js);
}

function setLocale(localeName) {
  if (typeof window.Uppy.locales[localeName] === 'undefined') {
    loadLocaleFromCDN(localeName);
  }

  whenLocaleAvailable(localeName, localeObj => {
    const direction = RTL_LOCALES.indexOf(localeName) !== -1 ? 'rtl' : 'ltr';
    window.uppy.setOptions({
      locale: localeObj
    });
    window.uppy.getPlugin('Dashboard').setOptions({
      direction
    });
  });
}

function populateLocaleSelect() {
  const localeSelect = document.getElementById('localeList');
  Object.keys(localeList).forEach(localeName => {
    if (localeName === 'en_US') return;
    localeSelect.innerHTML += `<option value="${localeName}">${localeList[localeName]} — (${localeName})</option>`;
  });
  localeSelect.addEventListener('change', event => {
    const localeName = event.target.value;
    setLocale(localeName);
  });
}

window.uppySetOptions = uppySetOptions;
window.uppyInit = uppyInit;
window.uppySetLocale = setLocale;
populateLocaleSelect();
uppyInit();
uppySetOptions();

},{"../env":198,"../locale_list.json":199,"./../../../../packages/@uppy/core":48,"./../../../../packages/@uppy/dashboard":69,"./../../../../packages/@uppy/drop-target":77,"./../../../../packages/@uppy/dropbox":78,"./../../../../packages/@uppy/facebook":80,"./../../../../packages/@uppy/golden-retriever":85,"./../../../../packages/@uppy/google-drive":87,"./../../../../packages/@uppy/image-editor":90,"./../../../../packages/@uppy/instagram":95,"./../../../../packages/@uppy/onedrive":97,"./../../../../packages/@uppy/screen-capture":127,"./../../../../packages/@uppy/tus":139,"./../../../../packages/@uppy/url":141,"./../../../../packages/@uppy/webcam":192,"./../../../../packages/@uppy/zoom":195}],198:[function(require,module,exports){
"use strict";

let companionEndpoint = 'http://localhost:3020'; // eslint-disable-next-line no-restricted-globals

if (location.hostname === 'uppy.io' || /--uppy\.netlify\.app$/.test(location.hostname)) {
  companionEndpoint = '//companion.uppy.io';
}

const COMPANION = companionEndpoint;
module.exports = COMPANION;

},{}],199:[function(require,module,exports){
module.exports={"ar_SA":"Arabic (Saudi Arabia)","bg_BG":"Bulgarian (Bulgaria)","cs_CZ":"Czech (Czechia)","da_DK":"Danish (Denmark)","de_DE":"German (Germany)","el_GR":"Greek (Greece)","en_US":"English (United States)","es_ES":"Spanish (Spain)","fa_IR":"Persian (Iran)","fi_FI":"Finnish (Finland)","fr_FR":"French (France)","gl_ES":"Galician (Spain)","he_IL":"Hebrew (Israel)","hr_HR":"Croatian (Croatia)","hu_HU":"Hungarian (Hungary)","id_ID":"Indonesian (Indonesia)","is_IS":"Icelandic (Iceland)","it_IT":"Italian (Italy)","ja_JP":"Japanese (Japan)","ko_KR":"Korean (South Korea)","nb_NO":"Norwegian Bokmål (Norway)","nl_NL":"Dutch (Netherlands)","pl_PL":"Polish (Poland)","pt_BR":"Portuguese (Brazil)","pt_PT":"Portuguese (Portugal)","ro_RO":"Romanian (Romania)","ru_RU":"Russian (Russia)","sk_SK":"Slovak (Slovakia)","sr_RS_Cyrillic":"Serbian (Serbia, Cyrillic)","sr_RS_Latin":"Serbian (Serbia, Latin)","sv_SE":"Swedish (Sweden)","th_TH":"Thai (Thailand)","tr_TR":"Turkish (Turkey)","uk_UA":"Ukrainian (Ukraine)","vi_VN":"Vietnamese (Vietnam)","zh_CN":"Chinese (China)","zh_TW":"Chinese (Taiwan)"}
},{}]},{},[197])