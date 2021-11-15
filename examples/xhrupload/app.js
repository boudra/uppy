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

},{}],3:[function(require,module,exports){
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

},{"wildcard":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./url-alphabet/index.cjs":7,"_process":9}],7:[function(require,module,exports){
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
module.exports = { urlAlphabet }

},{}],8:[function(require,module,exports){
var n,l,u,t,i,r,o,f,e={},c=[],s=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a(n,l){for(var u in l)n[u]=l[u];return n}function v(n){var l=n.parentNode;l&&l.removeChild(n)}function h(l,u,t){var i,r,o,f={};for(o in u)"key"==o?i=u[o]:"ref"==o?r=u[o]:f[o]=u[o];if(arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):t),"function"==typeof l&&null!=l.defaultProps)for(o in l.defaultProps)void 0===f[o]&&(f[o]=l.defaultProps[o]);return p(l,f,i,r,null)}function p(n,t,i,r,o){var f={type:n,props:t,key:i,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++u:o};return null==o&&null!=l.vnode&&l.vnode(f),f}function y(n){return n.children}function d(n,l){this.props=n,this.context=l}function _(n,l){if(null==l)return n.__?_(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?_(n):null}function k(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return k(n)}}function x(n){(!n.__d&&(n.__d=!0)&&i.push(n)&&!b.__r++||o!==l.debounceRendering)&&((o=l.debounceRendering)||r)(b)}function b(){for(var n;b.__r=i.length;)n=i.sort(function(n,l){return n.__v.__b-l.__v.__b}),i=[],n.some(function(n){var l,u,t,i,r,o;n.__d&&(r=(i=(l=n).__v).__e,(o=l.__P)&&(u=[],(t=a({},i)).__v=i.__v+1,I(o,i,t,l.__n,void 0!==o.ownerSVGElement,null!=i.__h?[r]:null,u,null==r?_(i):r,i.__h),T(u,i),i.__e!=r&&k(i)))})}function m(n,l,u,t,i,r,o,f,s,a){var v,h,d,k,x,b,m,A=t&&t.__k||c,P=A.length;for(u.__k=[],v=0;v<l.length;v++)if(null!=(k=u.__k[v]=null==(k=l[v])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k||"bigint"==typeof k?p(null,k,null,null,k):Array.isArray(k)?p(y,{children:k},null,null,null):k.__b>0?p(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(d=A[v])||d&&k.key==d.key&&k.type===d.type)A[v]=void 0;else for(h=0;h<P;h++){if((d=A[h])&&k.key==d.key&&k.type===d.type){A[h]=void 0;break}d=null}I(n,k,d=d||e,i,r,o,f,s,a),x=k.__e,(h=k.ref)&&d.ref!=h&&(m||(m=[]),d.ref&&m.push(d.ref,null,k),m.push(h,k.__c||x,k)),null!=x?(null==b&&(b=x),"function"==typeof k.type&&k.__k===d.__k?k.__d=s=g(k,s,n):s=w(n,k,d,A,x,s),"function"==typeof u.type&&(u.__d=s)):s&&d.__e==s&&s.parentNode!=n&&(s=_(d))}for(u.__e=b,v=P;v--;)null!=A[v]&&("function"==typeof u.type&&null!=A[v].__e&&A[v].__e==u.__d&&(u.__d=_(t,v+1)),L(A[v],A[v]));if(m)for(v=0;v<m.length;v++)z(m[v],m[++v],m[++v])}function g(n,l,u){for(var t,i=n.__k,r=0;i&&r<i.length;r++)(t=i[r])&&(t.__=n,l="function"==typeof t.type?g(t,l,u):w(u,t,t,i,t.__e,l));return l}function w(n,l,u,t,i,r){var o,f,e;if(void 0!==l.__d)o=l.__d,l.__d=void 0;else if(null==u||i!=r||null==i.parentNode)n:if(null==r||r.parentNode!==n)n.appendChild(i),o=null;else{for(f=r,e=0;(f=f.nextSibling)&&e<t.length;e+=2)if(f==i)break n;n.insertBefore(i,r),o=r}return void 0!==o?o:i.nextSibling}function A(n,l,u,t,i){var r;for(r in u)"children"===r||"key"===r||r in l||C(n,r,null,u[r],t);for(r in l)i&&"function"!=typeof l[r]||"children"===r||"key"===r||"value"===r||"checked"===r||u[r]===l[r]||C(n,r,l[r],u[r],t)}function P(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||s.test(l)?u:u+"px"}function C(n,l,u,t,i){var r;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof t&&(n.style.cssText=t=""),t)for(l in t)u&&l in u||P(n.style,l,"");if(u)for(l in u)t&&u[l]===t[l]||P(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])r=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+r]=u,u?t||n.addEventListener(l,r?H:$,r):n.removeEventListener(l,r?H:$,r);else if("dangerouslySetInnerHTML"!==l){if(i)l=l.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l))}}function $(n){this.l[n.type+!1](l.event?l.event(n):n)}function H(n){this.l[n.type+!0](l.event?l.event(n):n)}function I(n,u,t,i,r,o,f,e,c){var s,v,h,p,_,k,x,b,g,w,A,P=u.type;if(void 0!==u.constructor)return null;null!=t.__h&&(c=t.__h,e=u.__e=t.__e,u.__h=null,o=[e]),(s=l.__b)&&s(u);try{n:if("function"==typeof P){if(b=u.props,g=(s=P.contextType)&&i[s.__c],w=s?g?g.props.value:s.__:i,t.__c?x=(v=u.__c=t.__c).__=v.__E:("prototype"in P&&P.prototype.render?u.__c=v=new P(b,w):(u.__c=v=new d(b,w),v.constructor=P,v.render=M),g&&g.sub(v),v.props=b,v.state||(v.state={}),v.context=w,v.__n=i,h=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=P.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=a({},v.__s)),a(v.__s,P.getDerivedStateFromProps(b,v.__s))),p=v.props,_=v.state,h)null==P.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else{if(null==P.getDerivedStateFromProps&&b!==p&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(b,w),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(b,v.__s,w)||u.__v===t.__v){v.props=b,v.state=v.__s,u.__v!==t.__v&&(v.__d=!1),v.__v=u,u.__e=t.__e,u.__k=t.__k,u.__k.forEach(function(n){n&&(n.__=u)}),v.__h.length&&f.push(v);break n}null!=v.componentWillUpdate&&v.componentWillUpdate(b,v.__s,w),null!=v.componentDidUpdate&&v.__h.push(function(){v.componentDidUpdate(p,_,k)})}v.context=w,v.props=b,v.state=v.__s,(s=l.__r)&&s(u),v.__d=!1,v.__v=u,v.__P=n,s=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(i=a(a({},i),v.getChildContext())),h||null==v.getSnapshotBeforeUpdate||(k=v.getSnapshotBeforeUpdate(p,_)),A=null!=s&&s.type===y&&null==s.key?s.props.children:s,m(n,Array.isArray(A)?A:[A],u,t,i,r,o,f,e,c),v.base=u.__e,u.__h=null,v.__h.length&&f.push(v),x&&(v.__E=v.__=null),v.__e=!1}else null==o&&u.__v===t.__v?(u.__k=t.__k,u.__e=t.__e):u.__e=j(t.__e,u,t,i,r,o,f,c);(s=l.diffed)&&s(u)}catch(n){u.__v=null,(c||null!=o)&&(u.__e=e,u.__h=!!c,o[o.indexOf(e)]=null),l.__e(n,u,t)}}function T(n,u){l.__c&&l.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u)})}catch(n){l.__e(n,u.__v)}})}function j(l,u,t,i,r,o,f,c){var s,a,h,p=t.props,y=u.props,d=u.type,k=0;if("svg"===d&&(r=!0),null!=o)for(;k<o.length;k++)if((s=o[k])&&(s===l||(d?s.localName==d:3==s.nodeType))){l=s,o[k]=null;break}if(null==l){if(null===d)return document.createTextNode(y);l=r?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,y.is&&y),o=null,c=!1}if(null===d)p===y||c&&l.data===y||(l.data=y);else{if(o=o&&n.call(l.childNodes),a=(p=t.props||e).dangerouslySetInnerHTML,h=y.dangerouslySetInnerHTML,!c){if(null!=o)for(p={},k=0;k<l.attributes.length;k++)p[l.attributes[k].name]=l.attributes[k].value;(h||a)&&(h&&(a&&h.__html==a.__html||h.__html===l.innerHTML)||(l.innerHTML=h&&h.__html||""))}if(A(l,y,p,r,c),h)u.__k=[];else if(k=u.props.children,m(l,Array.isArray(k)?k:[k],u,t,i,r&&"foreignObject"!==d,o,f,o?o[0]:t.__k&&_(t,0),c),null!=o)for(k=o.length;k--;)null!=o[k]&&v(o[k]);c||("value"in y&&void 0!==(k=y.value)&&(k!==l.value||"progress"===d&&!k)&&C(l,"value",k,p.value,!1),"checked"in y&&void 0!==(k=y.checked)&&k!==l.checked&&C(l,"checked",k,p.checked,!1))}return l}function z(n,u,t){try{"function"==typeof n?n(u):n.current=u}catch(n){l.__e(n,t)}}function L(n,u,t){var i,r;if(l.unmount&&l.unmount(n),(i=n.ref)&&(i.current&&i.current!==n.__e||z(i,null,u)),null!=(i=n.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(n){l.__e(n,u)}i.base=i.__P=null}if(i=n.__k)for(r=0;r<i.length;r++)i[r]&&L(i[r],u,"function"!=typeof n.type);t||null==n.__e||v(n.__e),n.__e=n.__d=void 0}function M(n,l,u){return this.constructor(n,u)}function N(u,t,i){var r,o,f;l.__&&l.__(u,t),o=(r="function"==typeof i)?null:i&&i.__k||t.__k,f=[],I(t,u=(!r&&i||t).__k=h(y,null,[u]),o||e,e,void 0!==t.ownerSVGElement,!r&&i?[i]:o?null:t.firstChild?n.call(t.childNodes):null,f,!r&&i?i:o?o.__e:t.firstChild,r),T(f,u)}n=c.slice,l={__e:function(n,l){for(var u,t,i;l=l.__;)if((u=l.__c)&&!u.__)try{if((t=u.constructor)&&null!=t.getDerivedStateFromError&&(u.setState(t.getDerivedStateFromError(n)),i=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),i=u.__d),i)return u.__E=u}catch(l){n=l}throw n}},u=0,t=function(n){return null!=n&&void 0===n.constructor},d.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a({},this.state),"function"==typeof n&&(n=n(a({},u),this.props)),n&&a(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),x(this))},d.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),x(this))},d.prototype.render=y,i=[],r="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,b.__r=0,f=0,exports.render=N,exports.hydrate=function n(l,u){N(l,u,n)},exports.createElement=h,exports.h=h,exports.Fragment=y,exports.createRef=function(){return{current:null}},exports.isValidElement=t,exports.Component=d,exports.cloneElement=function(l,u,t){var i,r,o,f=a({},l.props);for(o in u)"key"==o?i=u[o]:"ref"==o?r=u[o]:f[o]=u[o];return arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):t),p(l.type,f,i||l.key,r||l.ref,null)},exports.createContext=function(n,l){var u={__c:l="__cC"+f++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,t;return this.getChildContext||(u=[],(t={})[l]=this,this.getChildContext=function(){return t},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(x)},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u},exports.toChildArray=function n(l,u){return u=u||[],null==l||"boolean"==typeof l||(Array.isArray(l)?l.some(function(l){n(l,u)}):u.push(l)),u},exports.options=l;


},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';

class AuthError extends Error {
  constructor() {
    super('Authorization required');
    this.name = 'AuthError';
    this.isAuthError = true;
  }

}

module.exports = AuthError;

},{}],11:[function(require,module,exports){
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

},{"./RequestClient":12,"./tokenStorage":16}],12:[function(require,module,exports){
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

},{"./../../utils/lib/fetchWithNetworkError":35,"./AuthError":10}],13:[function(require,module,exports){
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

},{"./RequestClient":12}],14:[function(require,module,exports){
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

},{"namespace-emitter":5}],15:[function(require,module,exports){
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

},{"./Provider":11,"./RequestClient":12,"./SearchProvider":13,"./Socket":14}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
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

},{"./../../utils/lib/Translator":33}],18:[function(require,module,exports){
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

},{"./../../utils/lib/findDOMElement":36,"./BasePlugin":17,"preact":8}],19:[function(require,module,exports){
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

},{"./../../store-default":28,"./../../utils/lib/Translator":33,"./../../utils/lib/generateFileID":37,"./../../utils/lib/getFileNameAndExtension":38,"./../../utils/lib/getFileType":39,"./getFileName":20,"./locale":22,"./loggers":23,"./supportsUploadProgress":24,"@transloadit/prettier-bytes":1,"lodash.throttle":2,"mime-match":3,"namespace-emitter":5,"nanoid":6}],20:[function(require,module,exports){
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

},{}],21:[function(require,module,exports){
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

},{"./BasePlugin":17,"./UIPlugin":18,"./Uppy":19,"./loggers":23}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"./../../utils/lib/getTimeStamp":41}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const toArray = require('./../../utils/lib/toArray');

const {
  h
} = require('preact');

const locale = require('./locale');

module.exports = (_temp = _class = class FileInput extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'FileInput';
    this.title = 'File Input';
    this.type = 'acquirer';
    this.defaultLocale = locale; // Default options

    const defaultOptions = {
      target: null,
      pretty: true,
      inputName: 'files[]'
    }; // Merge default options with the ones set by user

    this.opts = { ...defaultOptions,
      ...opts
    };
    this.i18nInit();
    this.render = this.render.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  addFiles(files) {
    const descriptors = files.map(file => ({
      source: this.id,
      name: file.name,
      type: file.type,
      data: file
    }));

    try {
      this.uppy.addFiles(descriptors);
    } catch (err) {
      this.uppy.log(err);
    }
  }

  handleInputChange(event) {
    this.uppy.log('[FileInput] Something selected through input...');
    const files = toArray(event.target.files);
    this.addFiles(files); // We clear the input after a file is selected, because otherwise
    // change event is not fired in Chrome and Safari when a file
    // with the same name is selected.
    // ___Why not use value="" on <input/> instead?
    //    Because if we use that method of clearing the input,
    //    Chrome will not trigger change if we drop the same file twice (Issue #768).

    event.target.value = null;
  }

  handleClick() {
    this.input.click();
  }

  render() {
    /* http://tympanus.net/codrops/2015/09/15/styling-customizing-file-inputs-smart-way/ */
    const hiddenInputStyle = {
      width: '0.1px',
      height: '0.1px',
      opacity: 0,
      overflow: 'hidden',
      position: 'absolute',
      zIndex: -1
    };
    const {
      restrictions
    } = this.uppy.opts;
    const accept = restrictions.allowedFileTypes ? restrictions.allowedFileTypes.join(',') : null;
    return h("div", {
      className: "uppy-Root uppy-FileInput-container"
    }, h("input", {
      className: "uppy-FileInput-input",
      style: this.opts.pretty && hiddenInputStyle,
      type: "file",
      name: this.opts.inputName,
      onChange: this.handleInputChange,
      multiple: restrictions.maxNumberOfFiles !== 1,
      accept: accept,
      ref: input => {
        this.input = input;
      }
    }), this.opts.pretty && h("button", {
      className: "uppy-FileInput-btn",
      type: "button",
      onClick: this.handleClick
    }, this.i18n('chooseFiles')));
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

},{"./../../core":21,"./../../utils/lib/toArray":47,"./locale":26,"preact":8}],26:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    // The same key is used for the same purpose by @uppy/robodog's `form()` API, but our
    // locale pack scripts can't access it in Robodog. If it is updated here, it should
    // also be updated there!
    chooseFiles: 'Choose files'
  }
};

},{}],27:[function(require,module,exports){
"use strict";

var _class, _temp;

const {
  UIPlugin
} = require('./../../core');

const {
  h
} = require('preact');
/**
 * Progress bar
 *
 */


module.exports = (_temp = _class = class ProgressBar extends UIPlugin {
  constructor(uppy, opts) {
    super(uppy, opts);
    this.id = this.opts.id || 'ProgressBar';
    this.title = 'Progress Bar';
    this.type = 'progressindicator'; // set default options

    const defaultOptions = {
      target: 'body',
      fixed: false,
      hideAfterFinish: true
    }; // merge default options with the ones set by user

    this.opts = { ...defaultOptions,
      ...opts
    };
    this.render = this.render.bind(this);
  }

  render(state) {
    const progress = state.totalProgress || 0; // before starting and after finish should be hidden if specified in the options

    const isHidden = (progress === 0 || progress === 100) && this.opts.hideAfterFinish;
    return h("div", {
      className: "uppy uppy-ProgressBar",
      style: {
        position: this.opts.fixed ? 'fixed' : 'initial'
      },
      "aria-hidden": isHidden
    }, h("div", {
      className: "uppy-ProgressBar-inner",
      style: {
        width: `${progress}%`
      }
    }), h("div", {
      className: "uppy-ProgressBar-percentage"
    }, progress));
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

},{"./../../core":21,"preact":8}],28:[function(require,module,exports){
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

},{}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
"use strict";

function _classPrivateFieldLooseBase(receiver, privateKey) { if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) { throw new TypeError("attempted to use private field on non-instance"); } return receiver; }

var id = 0;

function _classPrivateFieldLooseKey(name) { return "__private_" + id++ + "_" + name; }

var _aliveTimer = /*#__PURE__*/_classPrivateFieldLooseKey("aliveTimer");

var _isDone = /*#__PURE__*/_classPrivateFieldLooseKey("isDone");

var _onTimedOut = /*#__PURE__*/_classPrivateFieldLooseKey("onTimedOut");

var _timeout = /*#__PURE__*/_classPrivateFieldLooseKey("timeout");

/**
 * Helper to abort upload requests if there has not been any progress for `timeout` ms.
 * Create an instance using `timer = new ProgressTimeout(10000, onTimeout)`
 * Call `timer.progress()` to signal that there has been progress of any kind.
 * Call `timer.done()` when the upload has completed.
 */
class ProgressTimeout {
  constructor(timeout, timeoutHandler) {
    Object.defineProperty(this, _aliveTimer, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _isDone, {
      writable: true,
      value: false
    });
    Object.defineProperty(this, _onTimedOut, {
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, _timeout, {
      writable: true,
      value: void 0
    });
    _classPrivateFieldLooseBase(this, _timeout)[_timeout] = timeout;
    _classPrivateFieldLooseBase(this, _onTimedOut)[_onTimedOut] = timeoutHandler;
  }

  progress() {
    // Some browsers fire another progress event when the upload is
    // cancelled, so we have to ignore progress after the timer was
    // told to stop.
    if (_classPrivateFieldLooseBase(this, _isDone)[_isDone]) return;

    if (_classPrivateFieldLooseBase(this, _timeout)[_timeout] > 0) {
      clearTimeout(_classPrivateFieldLooseBase(this, _aliveTimer)[_aliveTimer]);
      _classPrivateFieldLooseBase(this, _aliveTimer)[_aliveTimer] = setTimeout(_classPrivateFieldLooseBase(this, _onTimedOut)[_onTimedOut], _classPrivateFieldLooseBase(this, _timeout)[_timeout]);
    }
  }

  done() {
    if (!_classPrivateFieldLooseBase(this, _isDone)[_isDone]) {
      clearTimeout(_classPrivateFieldLooseBase(this, _aliveTimer)[_aliveTimer]);
      _classPrivateFieldLooseBase(this, _aliveTimer)[_aliveTimer] = null;
      _classPrivateFieldLooseBase(this, _isDone)[_isDone] = true;
    }
  }

}

module.exports = ProgressTimeout;

},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

},{"./hasProperty":42}],34:[function(require,module,exports){
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

},{"lodash.throttle":2}],35:[function(require,module,exports){
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

},{"./NetworkError":30}],36:[function(require,module,exports){
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

},{"./isDOMElement":43}],37:[function(require,module,exports){
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

},{}],38:[function(require,module,exports){
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

},{}],39:[function(require,module,exports){
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

},{"./getFileNameAndExtension":38,"./mimeTypes":45}],40:[function(require,module,exports){
"use strict";

module.exports = function getSocketHost(url) {
  // get the host domain
  const regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/i;
  const host = regex.exec(url)[1];
  const socketProtocol = /^http:\/\//i.test(url) ? 'ws' : 'wss';
  return `${socketProtocol}://${host}`;
};

},{}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
"use strict";

module.exports = function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
};

},{}],43:[function(require,module,exports){
"use strict";

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return (obj == null ? void 0 : obj.nodeType) === Node.ELEMENT_NODE;
};

},{}],44:[function(require,module,exports){
"use strict";

function isNetworkError(xhr) {
  if (!xhr) {
    return false;
  }

  return xhr.readyState !== 0 && xhr.readyState !== 4 || xhr.status === 0;
}

module.exports = isNetworkError;

},{}],45:[function(require,module,exports){
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

},{}],46:[function(require,module,exports){
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

},{}],47:[function(require,module,exports){
"use strict";

/**
 * Converts list into array
 */
module.exports = Array.from;

},{}],48:[function(require,module,exports){
"use strict";

var _class, _temp;

const BasePlugin = require('./../../core/lib/BasePlugin');

const {
  nanoid
} = require('nanoid');

const {
  Provider,
  RequestClient,
  Socket
} = require('./../../companion-client');

const emitSocketProgress = require('./../../utils/lib/emitSocketProgress');

const getSocketHost = require('./../../utils/lib/getSocketHost');

const settle = require('./../../utils/lib/settle');

const EventTracker = require('./../../utils/lib/EventTracker');

const ProgressTimeout = require('./../../utils/lib/ProgressTimeout');

const {
  RateLimitedQueue,
  internalRateLimitedQueue
} = require('./../../utils/lib/RateLimitedQueue');

const NetworkError = require('./../../utils/lib/NetworkError');

const isNetworkError = require('./../../utils/lib/isNetworkError');

const locale = require('./locale');

function buildResponseError(xhr, err) {
  let error = err; // No error message

  if (!error) error = new Error('Upload error'); // Got an error message string

  if (typeof error === 'string') error = new Error(error); // Got something else

  if (!(error instanceof Error)) {
    error = Object.assign(new Error('Upload error'), {
      data: error
    });
  }

  if (isNetworkError(xhr)) {
    error = new NetworkError(error, xhr);
    return error;
  }

  error.request = xhr;
  return error;
}
/**
 * Set `data.type` in the blob to `file.meta.type`,
 * because we might have detected a more accurate file type in Uppy
 * https://stackoverflow.com/a/50875615
 *
 * @param {object} file File object with `data`, `size` and `meta` properties
 * @returns {object} blob updated with the new `type` set from `file.meta.type`
 */


function setTypeInBlob(file) {
  const dataWithUpdatedType = file.data.slice(0, file.data.size, file.meta.type);
  return dataWithUpdatedType;
}

module.exports = (_temp = _class = class XHRUpload extends BasePlugin {
  // eslint-disable-next-line global-require
  constructor(uppy, opts) {
    super(uppy, opts);
    this.type = 'uploader';
    this.id = this.opts.id || 'XHRUpload';
    this.title = 'XHRUpload';
    this.defaultLocale = locale; // Default options

    const defaultOptions = {
      formData: true,
      fieldName: opts.bundle ? 'files[]' : 'file',
      method: 'post',
      metaFields: null,
      responseUrlFieldName: 'url',
      bundle: false,
      headers: {},
      timeout: 30 * 1000,
      limit: 5,
      withCredentials: false,
      responseType: '',

      /**
       * @typedef respObj
       * @property {string} responseText
       * @property {number} status
       * @property {string} statusText
       * @property {object.<string, string>} headers
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseData(responseText) {
        let parsedResponse = {};

        try {
          parsedResponse = JSON.parse(responseText);
        } catch (err) {
          uppy.log(err);
        }

        return parsedResponse;
      },

      /**
       *
       * @param {string} responseText the response body string
       * @param {XMLHttpRequest | respObj} response the response object (XHR or similar)
       */
      getResponseError(_, response) {
        let error = new Error('Upload error');

        if (isNetworkError(response)) {
          error = new NetworkError(error, response);
        }

        return error;
      },

      /**
       * Check if the response from the upload endpoint indicates that the upload was successful.
       *
       * @param {number} status the response status code
       */
      validateStatus(status) {
        return status >= 200 && status < 300;
      }

    };
    this.opts = { ...defaultOptions,
      ...opts
    };
    this.i18nInit();
    this.handleUpload = this.handleUpload.bind(this); // Simultaneous upload limiting is shared across all uploads with this plugin.

    if (internalRateLimitedQueue in this.opts) {
      this.requests = this.opts[internalRateLimitedQueue];
    } else {
      this.requests = new RateLimitedQueue(this.opts.limit);
    }

    if (this.opts.bundle && !this.opts.formData) {
      throw new Error('`opts.formData` must be true when `opts.bundle` is enabled.');
    }

    this.uploaderEvents = Object.create(null);
  }

  getOptions(file) {
    const overrides = this.uppy.getState().xhrUpload;
    const {
      headers
    } = this.opts;
    const opts = { ...this.opts,
      ...(overrides || {}),
      ...(file.xhrUpload || {}),
      headers: {}
    }; // Support for `headers` as a function, only in the XHRUpload settings.
    // Options set by other plugins in Uppy state or on the files themselves are still merged in afterward.
    //
    // ```js
    // headers: (file) => ({ expires: file.meta.expires })
    // ```

    if (typeof headers === 'function') {
      opts.headers = headers(file);
    } else {
      Object.assign(opts.headers, this.opts.headers);
    }

    if (overrides) {
      Object.assign(opts.headers, overrides.headers);
    }

    if (file.xhrUpload) {
      Object.assign(opts.headers, file.xhrUpload.headers);
    }

    return opts;
  } // eslint-disable-next-line class-methods-use-this


  addMetadata(formData, meta, opts) {
    const metaFields = Array.isArray(opts.metaFields) ? opts.metaFields : Object.keys(meta); // Send along all fields by default.

    metaFields.forEach(item => {
      formData.append(item, meta[item]);
    });
  }

  createFormDataUpload(file, opts) {
    const formPost = new FormData();
    this.addMetadata(formPost, file.meta, opts);
    const dataWithUpdatedType = setTypeInBlob(file);

    if (file.name) {
      formPost.append(opts.fieldName, dataWithUpdatedType, file.meta.name);
    } else {
      formPost.append(opts.fieldName, dataWithUpdatedType);
    }

    return formPost;
  }

  createBundledUpload(files, opts) {
    const formPost = new FormData();
    const {
      meta
    } = this.uppy.getState();
    this.addMetadata(formPost, meta, opts);
    files.forEach(file => {
      const options = this.getOptions(file);
      const dataWithUpdatedType = setTypeInBlob(file);

      if (file.name) {
        formPost.append(options.fieldName, dataWithUpdatedType, file.name);
      } else {
        formPost.append(options.fieldName, dataWithUpdatedType);
      }
    });
    return formPost;
  }

  upload(file, current, total) {
    const opts = this.getOptions(file);
    this.uppy.log(`uploading ${current} of ${total}`);
    return new Promise((resolve, reject) => {
      this.uppy.emit('upload-started', file);
      const data = opts.formData ? this.createFormDataUpload(file, opts) : file.data;
      const xhr = new XMLHttpRequest();
      this.uploaderEvents[file.id] = new EventTracker(this.uppy);
      const timer = new ProgressTimeout(opts.timeout, () => {
        xhr.abort();
        queuedRequest.done();
        const error = new Error(this.i18n('timedOut', {
          seconds: Math.ceil(opts.timeout / 1000)
        }));
        this.uppy.emit('upload-error', file, error);
        reject(error);
      });
      const id = nanoid();
      xhr.upload.addEventListener('loadstart', () => {
        this.uppy.log(`[XHRUpload] ${id} started`);
      });
      xhr.upload.addEventListener('progress', ev => {
        this.uppy.log(`[XHRUpload] ${id} progress: ${ev.loaded} / ${ev.total}`); // Begin checking for timeouts when progress starts, instead of loading,
        // to avoid timing out requests on browser concurrency queue

        timer.progress();

        if (ev.lengthComputable) {
          this.uppy.emit('upload-progress', file, {
            uploader: this,
            bytesUploaded: ev.loaded,
            bytesTotal: ev.total
          });
        }
      });
      xhr.addEventListener('load', ev => {
        this.uppy.log(`[XHRUpload] ${id} finished`);
        timer.done();
        queuedRequest.done();

        if (this.uploaderEvents[file.id]) {
          this.uploaderEvents[file.id].remove();
          this.uploaderEvents[file.id] = null;
        }

        if (opts.validateStatus(ev.target.status, xhr.responseText, xhr)) {
          const body = opts.getResponseData(xhr.responseText, xhr);
          const uploadURL = body[opts.responseUrlFieldName];
          const uploadResp = {
            status: ev.target.status,
            body,
            uploadURL
          };
          this.uppy.emit('upload-success', file, uploadResp);

          if (uploadURL) {
            this.uppy.log(`Download ${file.name} from ${uploadURL}`);
          }

          return resolve(file);
        }

        const body = opts.getResponseData(xhr.responseText, xhr);
        const error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));
        const response = {
          status: ev.target.status,
          body
        };
        this.uppy.emit('upload-error', file, error, response);
        return reject(error);
      });
      xhr.addEventListener('error', () => {
        this.uppy.log(`[XHRUpload] ${id} errored`);
        timer.done();
        queuedRequest.done();

        if (this.uploaderEvents[file.id]) {
          this.uploaderEvents[file.id].remove();
          this.uploaderEvents[file.id] = null;
        }

        const error = buildResponseError(xhr, opts.getResponseError(xhr.responseText, xhr));
        this.uppy.emit('upload-error', file, error);
        return reject(error);
      });
      xhr.open(opts.method.toUpperCase(), opts.endpoint, true); // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.

      xhr.withCredentials = opts.withCredentials;

      if (opts.responseType !== '') {
        xhr.responseType = opts.responseType;
      }

      const queuedRequest = this.requests.run(() => {
        this.uppy.emit('upload-started', file); // When using an authentication system like JWT, the bearer token goes as a header. This
        // header needs to be fresh each time the token is refreshed so computing and setting the
        // headers just before the upload starts enables this kind of authentication to work properly.
        // Otherwise, half-way through the list of uploads the token could be stale and the upload would fail.

        const currentOpts = this.getOptions(file);
        Object.keys(currentOpts.headers).forEach(header => {
          xhr.setRequestHeader(header, currentOpts.headers[header]);
        });
        xhr.send(data);
        return () => {
          timer.done();
          xhr.abort();
        };
      });
      this.onFileRemove(file.id, () => {
        queuedRequest.abort();
        reject(new Error('File removed'));
      });
      this.onCancelAll(file.id, () => {
        queuedRequest.abort();
        reject(new Error('Upload cancelled'));
      });
    });
  }

  uploadRemote(file) {
    const opts = this.getOptions(file);
    return new Promise((resolve, reject) => {
      this.uppy.emit('upload-started', file);
      const fields = {};
      const metaFields = Array.isArray(opts.metaFields) ? opts.metaFields // Send along all fields by default.
      : Object.keys(file.meta);
      metaFields.forEach(name => {
        fields[name] = file.meta[name];
      });
      const Client = file.remote.providerOptions.provider ? Provider : RequestClient;
      const client = new Client(this.uppy, file.remote.providerOptions);
      client.post(file.remote.url, { ...file.remote.body,
        endpoint: opts.endpoint,
        size: file.data.size,
        fieldname: opts.fieldName,
        metadata: fields,
        httpMethod: opts.method,
        useFormData: opts.formData,
        headers: opts.headers
      }).then(res => {
        const {
          token
        } = res;
        const host = getSocketHost(file.remote.companionUrl);
        const socket = new Socket({
          target: `${host}/api/${token}`,
          autoOpen: false
        });
        this.uploaderEvents[file.id] = new EventTracker(this.uppy);
        this.onFileRemove(file.id, () => {
          socket.send('cancel', {});
          queuedRequest.abort();
          resolve(`upload ${file.id} was removed`);
        });
        this.onCancelAll(file.id, () => {
          socket.send('cancel', {});
          queuedRequest.abort();
          resolve(`upload ${file.id} was canceled`);
        });
        this.onRetry(file.id, () => {
          socket.send('pause', {});
          socket.send('resume', {});
        });
        this.onRetryAll(file.id, () => {
          socket.send('pause', {});
          socket.send('resume', {});
        });
        socket.on('progress', progressData => emitSocketProgress(this, progressData, file));
        socket.on('success', data => {
          const body = opts.getResponseData(data.response.responseText, data.response);
          const uploadURL = body[opts.responseUrlFieldName];
          const uploadResp = {
            status: data.response.status,
            body,
            uploadURL
          };
          this.uppy.emit('upload-success', file, uploadResp);
          queuedRequest.done();

          if (this.uploaderEvents[file.id]) {
            this.uploaderEvents[file.id].remove();
            this.uploaderEvents[file.id] = null;
          }

          return resolve();
        });
        socket.on('error', errData => {
          const resp = errData.response;
          const error = resp ? opts.getResponseError(resp.responseText, resp) : Object.assign(new Error(errData.error.message), {
            cause: errData.error
          });
          this.uppy.emit('upload-error', file, error);
          queuedRequest.done();

          if (this.uploaderEvents[file.id]) {
            this.uploaderEvents[file.id].remove();
            this.uploaderEvents[file.id] = null;
          }

          reject(error);
        });
        const queuedRequest = this.requests.run(() => {
          socket.open();

          if (file.isPaused) {
            socket.send('pause', {});
          }

          return () => socket.close();
        });
      }).catch(err => {
        this.uppy.emit('upload-error', file, err);
        reject(err);
      });
    });
  }

  uploadBundle(files) {
    return new Promise((resolve, reject) => {
      const {
        endpoint
      } = this.opts;
      const {
        method
      } = this.opts;
      const optsFromState = this.uppy.getState().xhrUpload;
      const formData = this.createBundledUpload(files, { ...this.opts,
        ...(optsFromState || {})
      });
      const xhr = new XMLHttpRequest();
      const timer = new ProgressTimeout(this.opts.timeout, () => {
        xhr.abort();
        const error = new Error(this.i18n('timedOut', {
          seconds: Math.ceil(this.opts.timeout / 1000)
        }));
        emitError(error);
        reject(error);
      });

      const emitError = error => {
        files.forEach(file => {
          this.uppy.emit('upload-error', file, error);
        });
      };

      xhr.upload.addEventListener('loadstart', () => {
        this.uppy.log('[XHRUpload] started uploading bundle');
        timer.progress();
      });
      xhr.upload.addEventListener('progress', ev => {
        timer.progress();
        if (!ev.lengthComputable) return;
        files.forEach(file => {
          this.uppy.emit('upload-progress', file, {
            uploader: this,
            bytesUploaded: ev.loaded / ev.total * file.size,
            bytesTotal: file.size
          });
        });
      });
      xhr.addEventListener('load', ev => {
        timer.done();

        if (this.opts.validateStatus(ev.target.status, xhr.responseText, xhr)) {
          const body = this.opts.getResponseData(xhr.responseText, xhr);
          const uploadResp = {
            status: ev.target.status,
            body
          };
          files.forEach(file => {
            this.uppy.emit('upload-success', file, uploadResp);
          });
          return resolve();
        }

        const error = this.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        error.request = xhr;
        emitError(error);
        return reject(error);
      });
      xhr.addEventListener('error', () => {
        timer.done();
        const error = this.opts.getResponseError(xhr.responseText, xhr) || new Error('Upload error');
        emitError(error);
        return reject(error);
      });
      this.uppy.on('cancel-all', () => {
        timer.done();
        xhr.abort();
      });
      xhr.open(method.toUpperCase(), endpoint, true); // IE10 does not allow setting `withCredentials` and `responseType`
      // before `open()` is called.

      xhr.withCredentials = this.opts.withCredentials;

      if (this.opts.responseType !== '') {
        xhr.responseType = this.opts.responseType;
      }

      Object.keys(this.opts.headers).forEach(header => {
        xhr.setRequestHeader(header, this.opts.headers[header]);
      });
      xhr.send(formData);
      files.forEach(file => {
        this.uppy.emit('upload-started', file);
      });
    });
  }

  uploadFiles(files) {
    const promises = files.map((file, i) => {
      const current = parseInt(i, 10) + 1;
      const total = files.length;

      if (file.error) {
        return Promise.reject(new Error(file.error));
      }

      if (file.isRemote) {
        return this.uploadRemote(file, current, total);
      }

      return this.upload(file, current, total);
    });
    return settle(promises);
  }

  onFileRemove(fileID, cb) {
    this.uploaderEvents[fileID].on('file-removed', file => {
      if (fileID === file.id) cb(file.id);
    });
  }

  onRetry(fileID, cb) {
    this.uploaderEvents[fileID].on('upload-retry', targetFileID => {
      if (fileID === targetFileID) {
        cb();
      }
    });
  }

  onRetryAll(fileID, cb) {
    this.uploaderEvents[fileID].on('retry-all', () => {
      if (!this.uppy.getFile(fileID)) return;
      cb();
    });
  }

  onCancelAll(fileID, cb) {
    this.uploaderEvents[fileID].on('cancel-all', () => {
      if (!this.uppy.getFile(fileID)) return;
      cb();
    });
  }

  handleUpload(fileIDs) {
    if (fileIDs.length === 0) {
      this.uppy.log('[XHRUpload] No files to upload!');
      return Promise.resolve();
    } // No limit configured by the user, and no RateLimitedQueue passed in by a "parent" plugin
    // (basically just AwsS3) using the internal symbol


    if (this.opts.limit === 0 && !this.opts[internalRateLimitedQueue]) {
      this.uppy.log('[XHRUpload] When uploading multiple files at once, consider setting the `limit` option (to `10` for example), to limit the number of concurrent uploads, which helps prevent memory and network issues: https://uppy.io/docs/xhr-upload/#limit-0', 'warning');
    }

    this.uppy.log('[XHRUpload] Uploading...');
    const files = fileIDs.map(fileID => this.uppy.getFile(fileID));

    if (this.opts.bundle) {
      // if bundle: true, we don’t support remote uploads
      const isSomeFileRemote = files.some(file => file.isRemote);

      if (isSomeFileRemote) {
        throw new Error('Can’t upload remote files when the `bundle: true` option is set');
      }

      if (typeof this.opts.headers === 'function') {
        throw new TypeError('`headers` may not be a function when the `bundle: true` option is set');
      }

      return this.uploadBundle(files);
    }

    return this.uploadFiles(files).then(() => null);
  }

  install() {
    if (this.opts.bundle) {
      const {
        capabilities
      } = this.uppy.getState();
      this.uppy.setState({
        capabilities: { ...capabilities,
          individualCancellation: false
        }
      });
    }

    this.uppy.addUploader(this.handleUpload);
  }

  uninstall() {
    if (this.opts.bundle) {
      const {
        capabilities
      } = this.uppy.getState();
      this.uppy.setState({
        capabilities: { ...capabilities,
          individualCancellation: true
        }
      });
    }

    this.uppy.removeUploader(this.handleUpload);
  }

}, _class.VERSION = "2.0.5", _temp);

},{"./../../companion-client":15,"./../../core/lib/BasePlugin":17,"./../../utils/lib/EventTracker":29,"./../../utils/lib/NetworkError":30,"./../../utils/lib/ProgressTimeout":31,"./../../utils/lib/RateLimitedQueue":32,"./../../utils/lib/emitSocketProgress":34,"./../../utils/lib/getSocketHost":40,"./../../utils/lib/isNetworkError":44,"./../../utils/lib/settle":46,"./locale":49,"nanoid":6}],49:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    // Shown in the Informer if an upload is being canceled because it stalled for too long.
    timedOut: 'Upload stalled for %{seconds} seconds, aborting.'
  }
};

},{}],50:[function(require,module,exports){
"use strict";

const Uppy = require('./../../../../packages/@uppy/core');

const FileInput = require('./../../../../packages/@uppy/file-input');

const XHRUpload = require('./../../../../packages/@uppy/xhr-upload');

const ProgressBar = require('./../../../../packages/@uppy/progress-bar');

document.querySelector('.Uppy').innerHTML = '';
const uppy = new Uppy({
  debug: true,
  autoProceed: true
});
uppy.use(FileInput, {
  target: '.Uppy'
});
uppy.use(ProgressBar, {
  target: '.UppyProgressBar',
  hideAfterFinish: false
});
uppy.use(XHRUpload, {
  endpoint: 'https://xhr-server.herokuapp.com/upload',
  formData: true,
  fieldName: 'files[]'
}); // And display uploaded files

uppy.on('upload-success', (file, response) => {
  const url = response.uploadURL;
  const fileName = file.name;
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.appendChild(document.createTextNode(fileName));
  li.appendChild(a);
  document.querySelector('.uploaded-files ol').appendChild(li);
});

},{"./../../../../packages/@uppy/core":21,"./../../../../packages/@uppy/file-input":25,"./../../../../packages/@uppy/progress-bar":27,"./../../../../packages/@uppy/xhr-upload":48}]},{},[50])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvQHRyYW5zbG9hZGl0L3ByZXR0aWVyLWJ5dGVzL3ByZXR0aWVyQnl0ZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoLnRocm90dGxlL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL21pbWUtbWF0Y2gvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbWltZS1tYXRjaC9ub2RlX21vZHVsZXMvd2lsZGNhcmQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbmFtZXNwYWNlLWVtaXR0ZXIvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvbmFub2lkL2luZGV4LmJyb3dzZXIuY2pzIiwiLi4vbm9kZV9tb2R1bGVzL25hbm9pZC91cmwtYWxwaGFiZXQvaW5kZXguY2pzIiwiLi4vbm9kZV9tb2R1bGVzL3ByZWFjdC9kaXN0L3ByZWFjdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9BdXRoRXJyb3IuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9Qcm92aWRlci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvc3JjL1JlcXVlc3RDbGllbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy9TZWFyY2hQcm92aWRlci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvc3JjL1NvY2tldC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvdG9rZW5TdG9yYWdlLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvQmFzZVBsdWdpbi5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL1VJUGx1Z2luLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvVXBweS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL2dldEZpbGVOYW1lLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9sb2NhbGUuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9sb2dnZXJzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvc3VwcG9ydHNVcGxvYWRQcm9ncmVzcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2ZpbGUtaW5wdXQvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvZmlsZS1pbnB1dC9zcmMvbG9jYWxlLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvcHJvZ3Jlc3MtYmFyL3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3N0b3JlLWRlZmF1bHQvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL0V2ZW50VHJhY2tlci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9OZXR3b3JrRXJyb3IuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvUHJvZ3Jlc3NUaW1lb3V0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL1JhdGVMaW1pdGVkUXVldWUuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvVHJhbnNsYXRvci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9lbWl0U29ja2V0UHJvZ3Jlc3MuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZmV0Y2hXaXRoTmV0d29ya0Vycm9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2ZpbmRET01FbGVtZW50LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dlbmVyYXRlRmlsZUlELmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldEZpbGVOYW1lQW5kRXh0ZW5zaW9uLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldEZpbGVUeXBlLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldFNvY2tldEhvc3QuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZ2V0VGltZVN0YW1wLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2hhc1Byb3BlcnR5LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2lzRE9NRWxlbWVudC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9pc05ldHdvcmtFcnJvci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9taW1lVHlwZXMuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvc2V0dGxlLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL3RvQXJyYXkuanMiLCIuLi9wYWNrYWdlcy9AdXBweS94aHItdXBsb2FkL3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3hoci11cGxvYWQvc3JjL2xvY2FsZS5qcyIsInNyYy9leGFtcGxlcy94aHJ1cGxvYWQvYXBwLmVzNiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdmJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LElBQUksQ0FBQyxHQUFMLENBQVMsU0FBVCxFQUFvQjtBQUNsQixFQUFBLFFBQVEsRUFBRSx5Q0FEUTtBQUVsQixFQUFBLFFBQVEsRUFBRSxJQUZRO0FBR2xCLEVBQUEsU0FBUyxFQUFFO0FBSE8sQ0FBcEIsRSxDQU1BOztBQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsZ0JBQVIsRUFBMEIsQ0FBQyxJQUFELEVBQU8sUUFBUCxLQUFvQjtBQUM1QyxRQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBckI7QUFDQSxRQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBdEI7QUFFQSxRQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBVCxDQUF1QixJQUF2QixDQUFYO0FBQ0EsUUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLGFBQVQsQ0FBdUIsR0FBdkIsQ0FBVjtBQUNBLEVBQUEsQ0FBQyxDQUFDLElBQUYsR0FBUyxHQUFUO0FBQ0EsRUFBQSxDQUFDLENBQUMsTUFBRixHQUFXLFFBQVg7QUFDQSxFQUFBLENBQUMsQ0FBQyxXQUFGLENBQWMsUUFBUSxDQUFDLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBZDtBQUNBLEVBQUEsRUFBRSxDQUFDLFdBQUgsQ0FBZSxDQUFmO0FBRUEsRUFBQSxRQUFRLENBQUMsYUFBVCxDQUF1QixvQkFBdkIsRUFBNkMsV0FBN0MsQ0FBeUQsRUFBekQ7QUFDRCxDQVpEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9GbGV0L3ByZXR0aWVyLWJ5dGVzL1xuLy8gQ2hhbmdpbmcgMTAwMCBieXRlcyB0byAxMDI0LCBzbyB3ZSBjYW4ga2VlcCB1cHBlcmNhc2UgS0IgdnMga0Jcbi8vIElTQyBMaWNlbnNlIChjKSBEYW4gRmxldHRyZSBodHRwczovL2dpdGh1Yi5jb20vRmxldC9wcmV0dGllci1ieXRlcy9ibG9iL21hc3Rlci9MSUNFTlNFXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHByZXR0aWVyQnl0ZXMgKG51bSkge1xuICBpZiAodHlwZW9mIG51bSAhPT0gJ251bWJlcicgfHwgaXNOYU4obnVtKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgbnVtYmVyLCBnb3QgJyArIHR5cGVvZiBudW0pXG4gIH1cblxuICB2YXIgbmVnID0gbnVtIDwgMFxuICB2YXIgdW5pdHMgPSBbJ0InLCAnS0InLCAnTUInLCAnR0InLCAnVEInLCAnUEInLCAnRUInLCAnWkInLCAnWUInXVxuXG4gIGlmIChuZWcpIHtcbiAgICBudW0gPSAtbnVtXG4gIH1cblxuICBpZiAobnVtIDwgMSkge1xuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtICsgJyBCJ1xuICB9XG5cbiAgdmFyIGV4cG9uZW50ID0gTWF0aC5taW4oTWF0aC5mbG9vcihNYXRoLmxvZyhudW0pIC8gTWF0aC5sb2coMTAyNCkpLCB1bml0cy5sZW5ndGggLSAxKVxuICBudW0gPSBOdW1iZXIobnVtIC8gTWF0aC5wb3coMTAyNCwgZXhwb25lbnQpKVxuICB2YXIgdW5pdCA9IHVuaXRzW2V4cG9uZW50XVxuXG4gIGlmIChudW0gPj0gMTAgfHwgbnVtICUgMSA9PT0gMCkge1xuICAgIC8vIERvIG5vdCBzaG93IGRlY2ltYWxzIHdoZW4gdGhlIG51bWJlciBpcyB0d28tZGlnaXQsIG9yIGlmIHRoZSBudW1iZXIgaGFzIG5vXG4gICAgLy8gZGVjaW1hbCBjb21wb25lbnQuXG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0udG9GaXhlZCgwKSArICcgJyArIHVuaXRcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bS50b0ZpeGVkKDEpICsgJyAnICsgdW5pdFxuICB9XG59XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltID0gL15cXHMrfFxccyskL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiYWQgc2lnbmVkIGhleGFkZWNpbWFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmluYXJ5IHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JpbmFyeSA9IC9eMGJbMDFdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc09jdGFsID0gL14wb1swLTddKyQvaTtcblxuLyoqIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHdpdGhvdXQgYSBkZXBlbmRlbmN5IG9uIGByb290YC4gKi9cbnZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIEdldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IGhhdmUgZWxhcHNlZCBzaW5jZVxuICogdGhlIFVuaXggZXBvY2ggKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IERhdGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVzdGFtcC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBMb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBpbnZvY2F0aW9uLlxuICovXG52YXIgbm93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiByb290LkRhdGUubm93KCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGhyb3R0bGVkIGZ1bmN0aW9uIHRoYXQgb25seSBpbnZva2VzIGBmdW5jYCBhdCBtb3N0IG9uY2UgcGVyXG4gKiBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBUaGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYFxuICogbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0b1xuICogaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgXG4gKiB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlXG4gKiB0aHJvdHRsZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiByZXR1cm4gdGhlXG4gKiByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8udGhyb3R0bGVgIGFuZCBgXy5kZWJvdW5jZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBpbnZvY2F0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmcuXG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKSk7XG4gKlxuICogLy8gSW52b2tlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXMuXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHsgJ3RyYWlsaW5nJzogZmFsc2UgfSk7XG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIHRocm90dGxlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhyb3R0bGVkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCB7XG4gICAgJ2xlYWRpbmcnOiBsZWFkaW5nLFxuICAgICdtYXhXYWl0Jzogd2FpdCxcbiAgICAndHJhaWxpbmcnOiB0cmFpbGluZ1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCJ2YXIgd2lsZGNhcmQgPSByZXF1aXJlKCd3aWxkY2FyZCcpO1xudmFyIHJlTWltZVBhcnRTcGxpdCA9IC9bXFwvXFwrXFwuXS87XG5cbi8qKlxuICAjIG1pbWUtbWF0Y2hcblxuICBBIHNpbXBsZSBmdW5jdGlvbiB0byBjaGVja2VyIHdoZXRoZXIgYSB0YXJnZXQgbWltZSB0eXBlIG1hdGNoZXMgYSBtaW1lLXR5cGVcbiAgcGF0dGVybiAoZS5nLiBpbWFnZS9qcGVnIG1hdGNoZXMgaW1hZ2UvanBlZyBPUiBpbWFnZS8qKS5cblxuICAjIyBFeGFtcGxlIFVzYWdlXG5cbiAgPDw8IGV4YW1wbGUuanNcblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgcGF0dGVybikge1xuICBmdW5jdGlvbiB0ZXN0KHBhdHRlcm4pIHtcbiAgICB2YXIgcmVzdWx0ID0gd2lsZGNhcmQocGF0dGVybiwgdGFyZ2V0LCByZU1pbWVQYXJ0U3BsaXQpO1xuXG4gICAgLy8gZW5zdXJlIHRoYXQgd2UgaGF2ZSBhIHZhbGlkIG1pbWUgdHlwZSAoc2hvdWxkIGhhdmUgdHdvIHBhcnRzKVxuICAgIHJldHVybiByZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+PSAyO1xuICB9XG5cbiAgcmV0dXJuIHBhdHRlcm4gPyB0ZXN0KHBhdHRlcm4uc3BsaXQoJzsnKVswXSkgOiB0ZXN0O1xufTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICAjIHdpbGRjYXJkXG5cbiAgVmVyeSBzaW1wbGUgd2lsZGNhcmQgbWF0Y2hpbmcsIHdoaWNoIGlzIGRlc2lnbmVkIHRvIHByb3ZpZGUgdGhlIHNhbWVcbiAgZnVuY3Rpb25hbGl0eSB0aGF0IGlzIGZvdW5kIGluIHRoZVxuICBbZXZlXShodHRwczovL2dpdGh1Yi5jb20vYWRvYmUtd2VicGxhdGZvcm0vZXZlKSBldmVudGluZyBsaWJyYXJ5LlxuXG4gICMjIFVzYWdlXG5cbiAgSXQgd29ya3Mgd2l0aCBzdHJpbmdzOlxuXG4gIDw8PCBleGFtcGxlcy9zdHJpbmdzLmpzXG5cbiAgQXJyYXlzOlxuXG4gIDw8PCBleGFtcGxlcy9hcnJheXMuanNcblxuICBPYmplY3RzIChtYXRjaGluZyBhZ2FpbnN0IGtleXMpOlxuXG4gIDw8PCBleGFtcGxlcy9vYmplY3RzLmpzXG5cbiAgV2hpbGUgdGhlIGxpYnJhcnkgd29ya3MgaW4gTm9kZSwgaWYgeW91IGFyZSBhcmUgbG9va2luZyBmb3IgZmlsZS1iYXNlZFxuICB3aWxkY2FyZCBtYXRjaGluZyB0aGVuIHlvdSBzaG91bGQgaGF2ZSBhIGxvb2sgYXQ6XG5cbiAgPGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS1nbG9iPlxuKiovXG5cbmZ1bmN0aW9uIFdpbGRjYXJkTWF0Y2hlcih0ZXh0LCBzZXBhcmF0b3IpIHtcbiAgdGhpcy50ZXh0ID0gdGV4dCA9IHRleHQgfHwgJyc7XG4gIHRoaXMuaGFzV2lsZCA9IH50ZXh0LmluZGV4T2YoJyonKTtcbiAgdGhpcy5zZXBhcmF0b3IgPSBzZXBhcmF0b3I7XG4gIHRoaXMucGFydHMgPSB0ZXh0LnNwbGl0KHNlcGFyYXRvcik7XG59XG5cbldpbGRjYXJkTWF0Y2hlci5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihpbnB1dCkge1xuICB2YXIgbWF0Y2hlcyA9IHRydWU7XG4gIHZhciBwYXJ0cyA9IHRoaXMucGFydHM7XG4gIHZhciBpaTtcbiAgdmFyIHBhcnRzQ291bnQgPSBwYXJ0cy5sZW5ndGg7XG4gIHZhciB0ZXN0UGFydHM7XG5cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSAnc3RyaW5nJyB8fCBpbnB1dCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgIGlmICghdGhpcy5oYXNXaWxkICYmIHRoaXMudGV4dCAhPSBpbnB1dCkge1xuICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXN0UGFydHMgPSAoaW5wdXQgfHwgJycpLnNwbGl0KHRoaXMuc2VwYXJhdG9yKTtcbiAgICAgIGZvciAoaWkgPSAwOyBtYXRjaGVzICYmIGlpIDwgcGFydHNDb3VudDsgaWkrKykge1xuICAgICAgICBpZiAocGFydHNbaWldID09PSAnKicpICB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaWkgPCB0ZXN0UGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IHBhcnRzW2lpXSA9PT0gdGVzdFBhcnRzW2lpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRjaGVzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbWF0Y2hlcywgdGhlbiByZXR1cm4gdGhlIGNvbXBvbmVudCBwYXJ0c1xuICAgICAgbWF0Y2hlcyA9IG1hdGNoZXMgJiYgdGVzdFBhcnRzO1xuICAgIH1cbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgaW5wdXQuc3BsaWNlID09ICdmdW5jdGlvbicpIHtcbiAgICBtYXRjaGVzID0gW107XG5cbiAgICBmb3IgKGlpID0gaW5wdXQubGVuZ3RoOyBpaS0tOyApIHtcbiAgICAgIGlmICh0aGlzLm1hdGNoKGlucHV0W2lpXSkpIHtcbiAgICAgICAgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aF0gPSBpbnB1dFtpaV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PSAnb2JqZWN0Jykge1xuICAgIG1hdGNoZXMgPSB7fTtcblxuICAgIGZvciAodmFyIGtleSBpbiBpbnB1dCkge1xuICAgICAgaWYgKHRoaXMubWF0Y2goa2V5KSkge1xuICAgICAgICBtYXRjaGVzW2tleV0gPSBpbnB1dFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXRjaGVzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0ZXh0LCB0ZXN0LCBzZXBhcmF0b3IpIHtcbiAgdmFyIG1hdGNoZXIgPSBuZXcgV2lsZGNhcmRNYXRjaGVyKHRleHQsIHNlcGFyYXRvciB8fCAvW1xcL1xcLl0vKTtcbiAgaWYgKHR5cGVvZiB0ZXN0ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIG1hdGNoZXIubWF0Y2godGVzdCk7XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlcjtcbn07XG4iLCIvKipcbiogQ3JlYXRlIGFuIGV2ZW50IGVtaXR0ZXIgd2l0aCBuYW1lc3BhY2VzXG4qIEBuYW1lIGNyZWF0ZU5hbWVzcGFjZUVtaXR0ZXJcbiogQGV4YW1wbGVcbiogdmFyIGVtaXR0ZXIgPSByZXF1aXJlKCcuL2luZGV4JykoKVxuKlxuKiBlbWl0dGVyLm9uKCcqJywgZnVuY3Rpb24gKCkge1xuKiAgIGNvbnNvbGUubG9nKCdhbGwgZXZlbnRzIGVtaXR0ZWQnLCB0aGlzLmV2ZW50KVxuKiB9KVxuKlxuKiBlbWl0dGVyLm9uKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge1xuKiAgIGNvbnNvbGUubG9nKCdleGFtcGxlIGV2ZW50IGVtaXR0ZWQnKVxuKiB9KVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlTmFtZXNwYWNlRW1pdHRlciAoKSB7XG4gIHZhciBlbWl0dGVyID0ge31cbiAgdmFyIF9mbnMgPSBlbWl0dGVyLl9mbnMgPSB7fVxuXG4gIC8qKlxuICAqIEVtaXQgYW4gZXZlbnQuIE9wdGlvbmFsbHkgbmFtZXNwYWNlIHRoZSBldmVudC4gSGFuZGxlcnMgYXJlIGZpcmVkIGluIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IHdlcmUgYWRkZWQgd2l0aCBleGFjdCBtYXRjaGVzIHRha2luZyBwcmVjZWRlbmNlLiBTZXBhcmF0ZSB0aGUgbmFtZXNwYWNlIGFuZCBldmVudCB3aXRoIGEgYDpgXG4gICogQG5hbWUgZW1pdFxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCDigJMgdGhlIG5hbWUgb2YgdGhlIGV2ZW50LCB3aXRoIG9wdGlvbmFsIG5hbWVzcGFjZVxuICAqIEBwYXJhbSB7Li4uKn0gZGF0YSDigJMgdXAgdG8gNiBhcmd1bWVudHMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBldmVudCBsaXN0ZW5lclxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5lbWl0KCdleGFtcGxlJylcbiAgKiBlbWl0dGVyLmVtaXQoJ2RlbW86dGVzdCcpXG4gICogZW1pdHRlci5lbWl0KCdkYXRhJywgeyBleGFtcGxlOiB0cnVlfSwgJ2Egc3RyaW5nJywgMSlcbiAgKi9cbiAgZW1pdHRlci5lbWl0ID0gZnVuY3Rpb24gZW1pdCAoZXZlbnQsIGFyZzEsIGFyZzIsIGFyZzMsIGFyZzQsIGFyZzUsIGFyZzYpIHtcbiAgICB2YXIgdG9FbWl0ID0gZ2V0TGlzdGVuZXJzKGV2ZW50KVxuXG4gICAgaWYgKHRvRW1pdC5sZW5ndGgpIHtcbiAgICAgIGVtaXRBbGwoZXZlbnQsIHRvRW1pdCwgW2FyZzEsIGFyZzIsIGFyZzMsIGFyZzQsIGFyZzUsIGFyZzZdKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZSBlbiBldmVudCBsaXN0ZW5lci5cbiAgKiBAbmFtZSBvblxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9uKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge30pXG4gICogZW1pdHRlci5vbignZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9uID0gZnVuY3Rpb24gb24gKGV2ZW50LCBmbikge1xuICAgIGlmICghX2Zuc1tldmVudF0pIHtcbiAgICAgIF9mbnNbZXZlbnRdID0gW11cbiAgICB9XG5cbiAgICBfZm5zW2V2ZW50XS5wdXNoKGZuKVxuICB9XG5cbiAgLyoqXG4gICogQ3JlYXRlIGVuIGV2ZW50IGxpc3RlbmVyIHRoYXQgZmlyZXMgb25jZS5cbiAgKiBAbmFtZSBvbmNlXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub25jZSgnZXhhbXBsZScsIGZ1bmN0aW9uICgpIHt9KVxuICAqIGVtaXR0ZXIub25jZSgnZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9uY2UgPSBmdW5jdGlvbiBvbmNlIChldmVudCwgZm4pIHtcbiAgICBmdW5jdGlvbiBvbmUgKCkge1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgZW1pdHRlci5vZmYoZXZlbnQsIG9uZSlcbiAgICB9XG4gICAgdGhpcy5vbihldmVudCwgb25lKVxuICB9XG5cbiAgLyoqXG4gICogU3RvcCBsaXN0ZW5pbmcgdG8gYW4gZXZlbnQuIFN0b3AgYWxsIGxpc3RlbmVycyBvbiBhbiBldmVudCBieSBvbmx5IHBhc3NpbmcgdGhlIGV2ZW50IG5hbWUuIFN0b3AgYSBzaW5nbGUgbGlzdGVuZXIgYnkgcGFzc2luZyB0aGF0IGV2ZW50IGhhbmRsZXIgYXMgYSBjYWxsYmFjay5cbiAgKiBZb3UgbXVzdCBiZSBleHBsaWNpdCBhYm91dCB3aGF0IHdpbGwgYmUgdW5zdWJzY3JpYmVkOiBgZW1pdHRlci5vZmYoJ2RlbW8nKWAgd2lsbCB1bnN1YnNjcmliZSBhbiBgZW1pdHRlci5vbignZGVtbycpYCBsaXN0ZW5lcixcbiAgKiBgZW1pdHRlci5vZmYoJ2RlbW86ZXhhbXBsZScpYCB3aWxsIHVuc3Vic2NyaWJlIGFuIGBlbWl0dGVyLm9uKCdkZW1vOmV4YW1wbGUnKWAgbGlzdGVuZXJcbiAgKiBAbmFtZSBvZmZcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dIOKAkyB0aGUgc3BlY2lmaWMgaGFuZGxlclxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vZmYoJ2V4YW1wbGUnKVxuICAqIGVtaXR0ZXIub2ZmKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub2ZmID0gZnVuY3Rpb24gb2ZmIChldmVudCwgZm4pIHtcbiAgICB2YXIga2VlcCA9IFtdXG5cbiAgICBpZiAoZXZlbnQgJiYgZm4pIHtcbiAgICAgIHZhciBmbnMgPSB0aGlzLl9mbnNbZXZlbnRdXG4gICAgICB2YXIgaSA9IDBcbiAgICAgIHZhciBsID0gZm5zID8gZm5zLmxlbmd0aCA6IDBcblxuICAgICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChmbnNbaV0gIT09IGZuKSB7XG4gICAgICAgICAga2VlcC5wdXNoKGZuc1tpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGtlZXAubGVuZ3RoID8gdGhpcy5fZm5zW2V2ZW50XSA9IGtlZXAgOiBkZWxldGUgdGhpcy5fZm5zW2V2ZW50XVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGlzdGVuZXJzIChlKSB7XG4gICAgdmFyIG91dCA9IF9mbnNbZV0gPyBfZm5zW2VdIDogW11cbiAgICB2YXIgaWR4ID0gZS5pbmRleE9mKCc6JylcbiAgICB2YXIgYXJncyA9IChpZHggPT09IC0xKSA/IFtlXSA6IFtlLnN1YnN0cmluZygwLCBpZHgpLCBlLnN1YnN0cmluZyhpZHggKyAxKV1cblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoX2ZucylcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbCA9IGtleXMubGVuZ3RoXG5cbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICBpZiAoa2V5ID09PSAnKicpIHtcbiAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChfZm5zW2tleV0pXG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMiAmJiBhcmdzWzBdID09PSBrZXkpIHtcbiAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChfZm5zW2tleV0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdEFsbCAoZSwgZm5zLCBhcmdzKSB7XG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIGwgPSBmbnMubGVuZ3RoXG5cbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICghZm5zW2ldKSBicmVha1xuICAgICAgZm5zW2ldLmV2ZW50ID0gZVxuICAgICAgZm5zW2ldLmFwcGx5KGZuc1tpXSwgYXJncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZW1pdHRlclxufVxuIiwibGV0IHsgdXJsQWxwaGFiZXQgfSA9IHJlcXVpcmUoJy4vdXJsLWFscGhhYmV0L2luZGV4LmNqcycpXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBpZiAoXG4gICAgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyAmJlxuICAgIHR5cGVvZiBjcnlwdG8gPT09ICd1bmRlZmluZWQnXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdSZWFjdCBOYXRpdmUgZG9lcyBub3QgaGF2ZSBhIGJ1aWx0LWluIHNlY3VyZSByYW5kb20gZ2VuZXJhdG9yLiAnICtcbiAgICAgICAgJ0lmIHlvdSBkb27igJl0IG5lZWQgdW5wcmVkaWN0YWJsZSBJRHMgdXNlIGBuYW5vaWQvbm9uLXNlY3VyZWAuICcgK1xuICAgICAgICAnRm9yIHNlY3VyZSBJRHMsIGltcG9ydCBgcmVhY3QtbmF0aXZlLWdldC1yYW5kb20tdmFsdWVzYCAnICtcbiAgICAgICAgJ2JlZm9yZSBOYW5vIElELidcbiAgICApXG4gIH1cbiAgaWYgKHR5cGVvZiBtc0NyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNyeXB0byA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnSW1wb3J0IGZpbGUgd2l0aCBgaWYgKCF3aW5kb3cuY3J5cHRvKSB3aW5kb3cuY3J5cHRvID0gd2luZG93Lm1zQ3J5cHRvYCcgK1xuICAgICAgICAnIGJlZm9yZSBpbXBvcnRpbmcgTmFubyBJRCB0byBmaXggSUUgMTEgc3VwcG9ydCdcbiAgICApXG4gIH1cbiAgaWYgKHR5cGVvZiBjcnlwdG8gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1lvdXIgYnJvd3NlciBkb2VzIG5vdCBoYXZlIHNlY3VyZSByYW5kb20gZ2VuZXJhdG9yLiAnICtcbiAgICAgICAgJ0lmIHlvdSBkb27igJl0IG5lZWQgdW5wcmVkaWN0YWJsZSBJRHMsIHlvdSBjYW4gdXNlIG5hbm9pZC9ub24tc2VjdXJlLidcbiAgICApXG4gIH1cbn1cbmxldCByYW5kb20gPSBieXRlcyA9PiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KGJ5dGVzKSlcbmxldCBjdXN0b21SYW5kb20gPSAoYWxwaGFiZXQsIHNpemUsIGdldFJhbmRvbSkgPT4ge1xuICBsZXQgbWFzayA9ICgyIDw8IChNYXRoLmxvZyhhbHBoYWJldC5sZW5ndGggLSAxKSAvIE1hdGguTE4yKSkgLSAxXG4gIGxldCBzdGVwID0gLX4oKDEuNiAqIG1hc2sgKiBzaXplKSAvIGFscGhhYmV0Lmxlbmd0aClcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgaWQgPSAnJ1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgYnl0ZXMgPSBnZXRSYW5kb20oc3RlcClcbiAgICAgIGxldCBqID0gc3RlcFxuICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICBpZCArPSBhbHBoYWJldFtieXRlc1tqXSAmIG1hc2tdIHx8ICcnXG4gICAgICAgIGlmIChpZC5sZW5ndGggPT09IHNpemUpIHJldHVybiBpZFxuICAgICAgfVxuICAgIH1cbiAgfVxufVxubGV0IGN1c3RvbUFscGhhYmV0ID0gKGFscGhhYmV0LCBzaXplKSA9PiBjdXN0b21SYW5kb20oYWxwaGFiZXQsIHNpemUsIHJhbmRvbSlcbmxldCBuYW5vaWQgPSAoc2l6ZSA9IDIxKSA9PiB7XG4gIGxldCBpZCA9ICcnXG4gIGxldCBieXRlcyA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoc2l6ZSkpXG4gIHdoaWxlIChzaXplLS0pIHtcbiAgICBsZXQgYnl0ZSA9IGJ5dGVzW3NpemVdICYgNjNcbiAgICBpZiAoYnl0ZSA8IDM2KSB7XG4gICAgICBpZCArPSBieXRlLnRvU3RyaW5nKDM2KVxuICAgIH0gZWxzZSBpZiAoYnl0ZSA8IDYyKSB7XG4gICAgICBpZCArPSAoYnl0ZSAtIDI2KS50b1N0cmluZygzNikudG9VcHBlckNhc2UoKVxuICAgIH0gZWxzZSBpZiAoYnl0ZSA8IDYzKSB7XG4gICAgICBpZCArPSAnXydcbiAgICB9IGVsc2Uge1xuICAgICAgaWQgKz0gJy0nXG4gICAgfVxuICB9XG4gIHJldHVybiBpZFxufVxubW9kdWxlLmV4cG9ydHMgPSB7IG5hbm9pZCwgY3VzdG9tQWxwaGFiZXQsIGN1c3RvbVJhbmRvbSwgdXJsQWxwaGFiZXQsIHJhbmRvbSB9XG4iLCJsZXQgdXJsQWxwaGFiZXQgPVxuICAndXNlYW5kb20tMjZUMTk4MzQwUFg3NXB4SkFDS1ZFUllNSU5EQlVTSFdPTEZfR1FaYmZnaGprbHF2d3l6cmljdCdcbm1vZHVsZS5leHBvcnRzID0geyB1cmxBbHBoYWJldCB9XG4iLCJ2YXIgbixsLHUsdCxpLHIsbyxmLGU9e30sYz1bXSxzPS9hY2l0fGV4KD86c3xnfG58cHwkKXxycGh8Z3JpZHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkfGl0ZXJhL2k7ZnVuY3Rpb24gYShuLGwpe2Zvcih2YXIgdSBpbiBsKW5bdV09bFt1XTtyZXR1cm4gbn1mdW5jdGlvbiB2KG4pe3ZhciBsPW4ucGFyZW50Tm9kZTtsJiZsLnJlbW92ZUNoaWxkKG4pfWZ1bmN0aW9uIGgobCx1LHQpe3ZhciBpLHIsbyxmPXt9O2ZvcihvIGluIHUpXCJrZXlcIj09bz9pPXVbb106XCJyZWZcIj09bz9yPXVbb106ZltvXT11W29dO2lmKGFyZ3VtZW50cy5sZW5ndGg+MiYmKGYuY2hpbGRyZW49YXJndW1lbnRzLmxlbmd0aD4zP24uY2FsbChhcmd1bWVudHMsMik6dCksXCJmdW5jdGlvblwiPT10eXBlb2YgbCYmbnVsbCE9bC5kZWZhdWx0UHJvcHMpZm9yKG8gaW4gbC5kZWZhdWx0UHJvcHMpdm9pZCAwPT09ZltvXSYmKGZbb109bC5kZWZhdWx0UHJvcHNbb10pO3JldHVybiBwKGwsZixpLHIsbnVsbCl9ZnVuY3Rpb24gcChuLHQsaSxyLG8pe3ZhciBmPXt0eXBlOm4scHJvcHM6dCxrZXk6aSxyZWY6cixfX2s6bnVsbCxfXzpudWxsLF9fYjowLF9fZTpudWxsLF9fZDp2b2lkIDAsX19jOm51bGwsX19oOm51bGwsY29uc3RydWN0b3I6dm9pZCAwLF9fdjpudWxsPT1vPysrdTpvfTtyZXR1cm4gbnVsbD09byYmbnVsbCE9bC52bm9kZSYmbC52bm9kZShmKSxmfWZ1bmN0aW9uIHkobil7cmV0dXJuIG4uY2hpbGRyZW59ZnVuY3Rpb24gZChuLGwpe3RoaXMucHJvcHM9bix0aGlzLmNvbnRleHQ9bH1mdW5jdGlvbiBfKG4sbCl7aWYobnVsbD09bClyZXR1cm4gbi5fXz9fKG4uX18sbi5fXy5fX2suaW5kZXhPZihuKSsxKTpudWxsO2Zvcih2YXIgdTtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSlyZXR1cm4gdS5fX2U7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbi50eXBlP18obik6bnVsbH1mdW5jdGlvbiBrKG4pe3ZhciBsLHU7aWYobnVsbCE9KG49bi5fXykmJm51bGwhPW4uX19jKXtmb3Iobi5fX2U9bi5fX2MuYmFzZT1udWxsLGw9MDtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSl7bi5fX2U9bi5fX2MuYmFzZT11Ll9fZTticmVha31yZXR1cm4gayhuKX19ZnVuY3Rpb24geChuKXsoIW4uX19kJiYobi5fX2Q9ITApJiZpLnB1c2gobikmJiFiLl9fcisrfHxvIT09bC5kZWJvdW5jZVJlbmRlcmluZykmJigobz1sLmRlYm91bmNlUmVuZGVyaW5nKXx8cikoYil9ZnVuY3Rpb24gYigpe2Zvcih2YXIgbjtiLl9fcj1pLmxlbmd0aDspbj1pLnNvcnQoZnVuY3Rpb24obixsKXtyZXR1cm4gbi5fX3YuX19iLWwuX192Ll9fYn0pLGk9W10sbi5zb21lKGZ1bmN0aW9uKG4pe3ZhciBsLHUsdCxpLHIsbztuLl9fZCYmKHI9KGk9KGw9bikuX192KS5fX2UsKG89bC5fX1ApJiYodT1bXSwodD1hKHt9LGkpKS5fX3Y9aS5fX3YrMSxJKG8saSx0LGwuX19uLHZvaWQgMCE9PW8ub3duZXJTVkdFbGVtZW50LG51bGwhPWkuX19oP1tyXTpudWxsLHUsbnVsbD09cj9fKGkpOnIsaS5fX2gpLFQodSxpKSxpLl9fZSE9ciYmayhpKSkpfSl9ZnVuY3Rpb24gbShuLGwsdSx0LGkscixvLGYscyxhKXt2YXIgdixoLGQsayx4LGIsbSxBPXQmJnQuX19rfHxjLFA9QS5sZW5ndGg7Zm9yKHUuX19rPVtdLHY9MDt2PGwubGVuZ3RoO3YrKylpZihudWxsIT0oaz11Ll9fa1t2XT1udWxsPT0oaz1sW3ZdKXx8XCJib29sZWFuXCI9PXR5cGVvZiBrP251bGw6XCJzdHJpbmdcIj09dHlwZW9mIGt8fFwibnVtYmVyXCI9PXR5cGVvZiBrfHxcImJpZ2ludFwiPT10eXBlb2Ygaz9wKG51bGwsayxudWxsLG51bGwsayk6QXJyYXkuaXNBcnJheShrKT9wKHkse2NoaWxkcmVuOmt9LG51bGwsbnVsbCxudWxsKTprLl9fYj4wP3Aoay50eXBlLGsucHJvcHMsay5rZXksbnVsbCxrLl9fdik6aykpe2lmKGsuX189dSxrLl9fYj11Ll9fYisxLG51bGw9PT0oZD1BW3ZdKXx8ZCYmay5rZXk9PWQua2V5JiZrLnR5cGU9PT1kLnR5cGUpQVt2XT12b2lkIDA7ZWxzZSBmb3IoaD0wO2g8UDtoKyspe2lmKChkPUFbaF0pJiZrLmtleT09ZC5rZXkmJmsudHlwZT09PWQudHlwZSl7QVtoXT12b2lkIDA7YnJlYWt9ZD1udWxsfUkobixrLGQ9ZHx8ZSxpLHIsbyxmLHMsYSkseD1rLl9fZSwoaD1rLnJlZikmJmQucmVmIT1oJiYobXx8KG09W10pLGQucmVmJiZtLnB1c2goZC5yZWYsbnVsbCxrKSxtLnB1c2goaCxrLl9fY3x8eCxrKSksbnVsbCE9eD8obnVsbD09YiYmKGI9eCksXCJmdW5jdGlvblwiPT10eXBlb2Ygay50eXBlJiZrLl9faz09PWQuX19rP2suX19kPXM9ZyhrLHMsbik6cz13KG4sayxkLEEseCxzKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LnR5cGUmJih1Ll9fZD1zKSk6cyYmZC5fX2U9PXMmJnMucGFyZW50Tm9kZSE9biYmKHM9XyhkKSl9Zm9yKHUuX19lPWIsdj1QO3YtLTspbnVsbCE9QVt2XSYmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHUudHlwZSYmbnVsbCE9QVt2XS5fX2UmJkFbdl0uX19lPT11Ll9fZCYmKHUuX19kPV8odCx2KzEpKSxMKEFbdl0sQVt2XSkpO2lmKG0pZm9yKHY9MDt2PG0ubGVuZ3RoO3YrKyl6KG1bdl0sbVsrK3ZdLG1bKyt2XSl9ZnVuY3Rpb24gZyhuLGwsdSl7Zm9yKHZhciB0LGk9bi5fX2sscj0wO2kmJnI8aS5sZW5ndGg7cisrKSh0PWlbcl0pJiYodC5fXz1uLGw9XCJmdW5jdGlvblwiPT10eXBlb2YgdC50eXBlP2codCxsLHUpOncodSx0LHQsaSx0Ll9fZSxsKSk7cmV0dXJuIGx9ZnVuY3Rpb24gdyhuLGwsdSx0LGkscil7dmFyIG8sZixlO2lmKHZvaWQgMCE9PWwuX19kKW89bC5fX2QsbC5fX2Q9dm9pZCAwO2Vsc2UgaWYobnVsbD09dXx8aSE9cnx8bnVsbD09aS5wYXJlbnROb2RlKW46aWYobnVsbD09cnx8ci5wYXJlbnROb2RlIT09biluLmFwcGVuZENoaWxkKGkpLG89bnVsbDtlbHNle2ZvcihmPXIsZT0wOyhmPWYubmV4dFNpYmxpbmcpJiZlPHQubGVuZ3RoO2UrPTIpaWYoZj09aSlicmVhayBuO24uaW5zZXJ0QmVmb3JlKGksciksbz1yfXJldHVybiB2b2lkIDAhPT1vP286aS5uZXh0U2libGluZ31mdW5jdGlvbiBBKG4sbCx1LHQsaSl7dmFyIHI7Zm9yKHIgaW4gdSlcImNoaWxkcmVuXCI9PT1yfHxcImtleVwiPT09cnx8ciBpbiBsfHxDKG4scixudWxsLHVbcl0sdCk7Zm9yKHIgaW4gbClpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBsW3JdfHxcImNoaWxkcmVuXCI9PT1yfHxcImtleVwiPT09cnx8XCJ2YWx1ZVwiPT09cnx8XCJjaGVja2VkXCI9PT1yfHx1W3JdPT09bFtyXXx8QyhuLHIsbFtyXSx1W3JdLHQpfWZ1bmN0aW9uIFAobixsLHUpe1wiLVwiPT09bFswXT9uLnNldFByb3BlcnR5KGwsdSk6bltsXT1udWxsPT11P1wiXCI6XCJudW1iZXJcIiE9dHlwZW9mIHV8fHMudGVzdChsKT91OnUrXCJweFwifWZ1bmN0aW9uIEMobixsLHUsdCxpKXt2YXIgcjtuOmlmKFwic3R5bGVcIj09PWwpaWYoXCJzdHJpbmdcIj09dHlwZW9mIHUpbi5zdHlsZS5jc3NUZXh0PXU7ZWxzZXtpZihcInN0cmluZ1wiPT10eXBlb2YgdCYmKG4uc3R5bGUuY3NzVGV4dD10PVwiXCIpLHQpZm9yKGwgaW4gdCl1JiZsIGluIHV8fFAobi5zdHlsZSxsLFwiXCIpO2lmKHUpZm9yKGwgaW4gdSl0JiZ1W2xdPT09dFtsXXx8UChuLnN0eWxlLGwsdVtsXSl9ZWxzZSBpZihcIm9cIj09PWxbMF0mJlwiblwiPT09bFsxXSlyPWwhPT0obD1sLnJlcGxhY2UoL0NhcHR1cmUkLyxcIlwiKSksbD1sLnRvTG93ZXJDYXNlKClpbiBuP2wudG9Mb3dlckNhc2UoKS5zbGljZSgyKTpsLnNsaWNlKDIpLG4ubHx8KG4ubD17fSksbi5sW2wrcl09dSx1P3R8fG4uYWRkRXZlbnRMaXN0ZW5lcihsLHI/SDokLHIpOm4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihsLHI/SDokLHIpO2Vsc2UgaWYoXCJkYW5nZXJvdXNseVNldElubmVySFRNTFwiIT09bCl7aWYoaSlsPWwucmVwbGFjZSgveGxpbmtbSDpoXS8sXCJoXCIpLnJlcGxhY2UoL3NOYW1lJC8sXCJzXCIpO2Vsc2UgaWYoXCJocmVmXCIhPT1sJiZcImxpc3RcIiE9PWwmJlwiZm9ybVwiIT09bCYmXCJ0YWJJbmRleFwiIT09bCYmXCJkb3dubG9hZFwiIT09bCYmbCBpbiBuKXRyeXtuW2xdPW51bGw9PXU/XCJcIjp1O2JyZWFrIG59Y2F0Y2gobil7fVwiZnVuY3Rpb25cIj09dHlwZW9mIHV8fChudWxsIT11JiYoITEhPT11fHxcImFcIj09PWxbMF0mJlwiclwiPT09bFsxXSk/bi5zZXRBdHRyaWJ1dGUobCx1KTpuLnJlbW92ZUF0dHJpYnV0ZShsKSl9fWZ1bmN0aW9uICQobil7dGhpcy5sW24udHlwZSshMV0obC5ldmVudD9sLmV2ZW50KG4pOm4pfWZ1bmN0aW9uIEgobil7dGhpcy5sW24udHlwZSshMF0obC5ldmVudD9sLmV2ZW50KG4pOm4pfWZ1bmN0aW9uIEkobix1LHQsaSxyLG8sZixlLGMpe3ZhciBzLHYsaCxwLF8sayx4LGIsZyx3LEEsUD11LnR5cGU7aWYodm9pZCAwIT09dS5jb25zdHJ1Y3RvcilyZXR1cm4gbnVsbDtudWxsIT10Ll9faCYmKGM9dC5fX2gsZT11Ll9fZT10Ll9fZSx1Ll9faD1udWxsLG89W2VdKSwocz1sLl9fYikmJnModSk7dHJ5e246aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUCl7aWYoYj11LnByb3BzLGc9KHM9UC5jb250ZXh0VHlwZSkmJmlbcy5fX2NdLHc9cz9nP2cucHJvcHMudmFsdWU6cy5fXzppLHQuX19jP3g9KHY9dS5fX2M9dC5fX2MpLl9fPXYuX19FOihcInByb3RvdHlwZVwiaW4gUCYmUC5wcm90b3R5cGUucmVuZGVyP3UuX19jPXY9bmV3IFAoYix3KToodS5fX2M9dj1uZXcgZChiLHcpLHYuY29uc3RydWN0b3I9UCx2LnJlbmRlcj1NKSxnJiZnLnN1Yih2KSx2LnByb3BzPWIsdi5zdGF0ZXx8KHYuc3RhdGU9e30pLHYuY29udGV4dD13LHYuX19uPWksaD12Ll9fZD0hMCx2Ll9faD1bXSksbnVsbD09di5fX3MmJih2Ll9fcz12LnN0YXRlKSxudWxsIT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmKHYuX19zPT12LnN0YXRlJiYodi5fX3M9YSh7fSx2Ll9fcykpLGEodi5fX3MsUC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoYix2Ll9fcykpKSxwPXYucHJvcHMsXz12LnN0YXRlLGgpbnVsbD09UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm51bGwhPXYuY29tcG9uZW50V2lsbE1vdW50JiZ2LmNvbXBvbmVudFdpbGxNb3VudCgpLG51bGwhPXYuY29tcG9uZW50RGlkTW91bnQmJnYuX19oLnB1c2godi5jb21wb25lbnREaWRNb3VudCk7ZWxzZXtpZihudWxsPT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmYiE9PXAmJm51bGwhPXYuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyYmdi5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKGIsdyksIXYuX19lJiZudWxsIT12LnNob3VsZENvbXBvbmVudFVwZGF0ZSYmITE9PT12LnNob3VsZENvbXBvbmVudFVwZGF0ZShiLHYuX19zLHcpfHx1Ll9fdj09PXQuX192KXt2LnByb3BzPWIsdi5zdGF0ZT12Ll9fcyx1Ll9fdiE9PXQuX192JiYodi5fX2Q9ITEpLHYuX192PXUsdS5fX2U9dC5fX2UsdS5fX2s9dC5fX2ssdS5fX2suZm9yRWFjaChmdW5jdGlvbihuKXtuJiYobi5fXz11KX0pLHYuX19oLmxlbmd0aCYmZi5wdXNoKHYpO2JyZWFrIG59bnVsbCE9di5jb21wb25lbnRXaWxsVXBkYXRlJiZ2LmNvbXBvbmVudFdpbGxVcGRhdGUoYix2Ll9fcyx3KSxudWxsIT12LmNvbXBvbmVudERpZFVwZGF0ZSYmdi5fX2gucHVzaChmdW5jdGlvbigpe3YuY29tcG9uZW50RGlkVXBkYXRlKHAsXyxrKX0pfXYuY29udGV4dD13LHYucHJvcHM9Yix2LnN0YXRlPXYuX19zLChzPWwuX19yKSYmcyh1KSx2Ll9fZD0hMSx2Ll9fdj11LHYuX19QPW4scz12LnJlbmRlcih2LnByb3BzLHYuc3RhdGUsdi5jb250ZXh0KSx2LnN0YXRlPXYuX19zLG51bGwhPXYuZ2V0Q2hpbGRDb250ZXh0JiYoaT1hKGEoe30saSksdi5nZXRDaGlsZENvbnRleHQoKSkpLGh8fG51bGw9PXYuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGV8fChrPXYuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUocCxfKSksQT1udWxsIT1zJiZzLnR5cGU9PT15JiZudWxsPT1zLmtleT9zLnByb3BzLmNoaWxkcmVuOnMsbShuLEFycmF5LmlzQXJyYXkoQSk/QTpbQV0sdSx0LGkscixvLGYsZSxjKSx2LmJhc2U9dS5fX2UsdS5fX2g9bnVsbCx2Ll9faC5sZW5ndGgmJmYucHVzaCh2KSx4JiYodi5fX0U9di5fXz1udWxsKSx2Ll9fZT0hMX1lbHNlIG51bGw9PW8mJnUuX192PT09dC5fX3Y/KHUuX19rPXQuX19rLHUuX19lPXQuX19lKTp1Ll9fZT1qKHQuX19lLHUsdCxpLHIsbyxmLGMpOyhzPWwuZGlmZmVkKSYmcyh1KX1jYXRjaChuKXt1Ll9fdj1udWxsLChjfHxudWxsIT1vKSYmKHUuX19lPWUsdS5fX2g9ISFjLG9bby5pbmRleE9mKGUpXT1udWxsKSxsLl9fZShuLHUsdCl9fWZ1bmN0aW9uIFQobix1KXtsLl9fYyYmbC5fX2ModSxuKSxuLnNvbWUoZnVuY3Rpb24odSl7dHJ5e249dS5fX2gsdS5fX2g9W10sbi5zb21lKGZ1bmN0aW9uKG4pe24uY2FsbCh1KX0pfWNhdGNoKG4pe2wuX19lKG4sdS5fX3YpfX0pfWZ1bmN0aW9uIGoobCx1LHQsaSxyLG8sZixjKXt2YXIgcyxhLGgscD10LnByb3BzLHk9dS5wcm9wcyxkPXUudHlwZSxrPTA7aWYoXCJzdmdcIj09PWQmJihyPSEwKSxudWxsIT1vKWZvcig7azxvLmxlbmd0aDtrKyspaWYoKHM9b1trXSkmJihzPT09bHx8KGQ/cy5sb2NhbE5hbWU9PWQ6Mz09cy5ub2RlVHlwZSkpKXtsPXMsb1trXT1udWxsO2JyZWFrfWlmKG51bGw9PWwpe2lmKG51bGw9PT1kKXJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh5KTtsPXI/ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixkKTpkb2N1bWVudC5jcmVhdGVFbGVtZW50KGQseS5pcyYmeSksbz1udWxsLGM9ITF9aWYobnVsbD09PWQpcD09PXl8fGMmJmwuZGF0YT09PXl8fChsLmRhdGE9eSk7ZWxzZXtpZihvPW8mJm4uY2FsbChsLmNoaWxkTm9kZXMpLGE9KHA9dC5wcm9wc3x8ZSkuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwsaD15LmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLCFjKXtpZihudWxsIT1vKWZvcihwPXt9LGs9MDtrPGwuYXR0cmlidXRlcy5sZW5ndGg7aysrKXBbbC5hdHRyaWJ1dGVzW2tdLm5hbWVdPWwuYXR0cmlidXRlc1trXS52YWx1ZTsoaHx8YSkmJihoJiYoYSYmaC5fX2h0bWw9PWEuX19odG1sfHxoLl9faHRtbD09PWwuaW5uZXJIVE1MKXx8KGwuaW5uZXJIVE1MPWgmJmguX19odG1sfHxcIlwiKSl9aWYoQShsLHkscCxyLGMpLGgpdS5fX2s9W107ZWxzZSBpZihrPXUucHJvcHMuY2hpbGRyZW4sbShsLEFycmF5LmlzQXJyYXkoayk/azpba10sdSx0LGksciYmXCJmb3JlaWduT2JqZWN0XCIhPT1kLG8sZixvP29bMF06dC5fX2smJl8odCwwKSxjKSxudWxsIT1vKWZvcihrPW8ubGVuZ3RoO2stLTspbnVsbCE9b1trXSYmdihvW2tdKTtjfHwoXCJ2YWx1ZVwiaW4geSYmdm9pZCAwIT09KGs9eS52YWx1ZSkmJihrIT09bC52YWx1ZXx8XCJwcm9ncmVzc1wiPT09ZCYmIWspJiZDKGwsXCJ2YWx1ZVwiLGsscC52YWx1ZSwhMSksXCJjaGVja2VkXCJpbiB5JiZ2b2lkIDAhPT0oaz15LmNoZWNrZWQpJiZrIT09bC5jaGVja2VkJiZDKGwsXCJjaGVja2VkXCIsayxwLmNoZWNrZWQsITEpKX1yZXR1cm4gbH1mdW5jdGlvbiB6KG4sdSx0KXt0cnl7XCJmdW5jdGlvblwiPT10eXBlb2Ygbj9uKHUpOm4uY3VycmVudD11fWNhdGNoKG4pe2wuX19lKG4sdCl9fWZ1bmN0aW9uIEwobix1LHQpe3ZhciBpLHI7aWYobC51bm1vdW50JiZsLnVubW91bnQobiksKGk9bi5yZWYpJiYoaS5jdXJyZW50JiZpLmN1cnJlbnQhPT1uLl9fZXx8eihpLG51bGwsdSkpLG51bGwhPShpPW4uX19jKSl7aWYoaS5jb21wb25lbnRXaWxsVW5tb3VudCl0cnl7aS5jb21wb25lbnRXaWxsVW5tb3VudCgpfWNhdGNoKG4pe2wuX19lKG4sdSl9aS5iYXNlPWkuX19QPW51bGx9aWYoaT1uLl9faylmb3Iocj0wO3I8aS5sZW5ndGg7cisrKWlbcl0mJkwoaVtyXSx1LFwiZnVuY3Rpb25cIiE9dHlwZW9mIG4udHlwZSk7dHx8bnVsbD09bi5fX2V8fHYobi5fX2UpLG4uX19lPW4uX19kPXZvaWQgMH1mdW5jdGlvbiBNKG4sbCx1KXtyZXR1cm4gdGhpcy5jb25zdHJ1Y3RvcihuLHUpfWZ1bmN0aW9uIE4odSx0LGkpe3ZhciByLG8sZjtsLl9fJiZsLl9fKHUsdCksbz0ocj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpKT9udWxsOmkmJmkuX19rfHx0Ll9fayxmPVtdLEkodCx1PSghciYmaXx8dCkuX19rPWgoeSxudWxsLFt1XSksb3x8ZSxlLHZvaWQgMCE9PXQub3duZXJTVkdFbGVtZW50LCFyJiZpP1tpXTpvP251bGw6dC5maXJzdENoaWxkP24uY2FsbCh0LmNoaWxkTm9kZXMpOm51bGwsZiwhciYmaT9pOm8/by5fX2U6dC5maXJzdENoaWxkLHIpLFQoZix1KX1uPWMuc2xpY2UsbD17X19lOmZ1bmN0aW9uKG4sbCl7Zm9yKHZhciB1LHQsaTtsPWwuX187KWlmKCh1PWwuX19jKSYmIXUuX18pdHJ5e2lmKCh0PXUuY29uc3RydWN0b3IpJiZudWxsIT10LmdldERlcml2ZWRTdGF0ZUZyb21FcnJvciYmKHUuc2V0U3RhdGUodC5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IobikpLGk9dS5fX2QpLG51bGwhPXUuY29tcG9uZW50RGlkQ2F0Y2gmJih1LmNvbXBvbmVudERpZENhdGNoKG4pLGk9dS5fX2QpLGkpcmV0dXJuIHUuX19FPXV9Y2F0Y2gobCl7bj1sfXRocm93IG59fSx1PTAsdD1mdW5jdGlvbihuKXtyZXR1cm4gbnVsbCE9biYmdm9pZCAwPT09bi5jb25zdHJ1Y3Rvcn0sZC5wcm90b3R5cGUuc2V0U3RhdGU9ZnVuY3Rpb24obixsKXt2YXIgdTt1PW51bGwhPXRoaXMuX19zJiZ0aGlzLl9fcyE9PXRoaXMuc3RhdGU/dGhpcy5fX3M6dGhpcy5fX3M9YSh7fSx0aGlzLnN0YXRlKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBuJiYobj1uKGEoe30sdSksdGhpcy5wcm9wcykpLG4mJmEodSxuKSxudWxsIT1uJiZ0aGlzLl9fdiYmKGwmJnRoaXMuX19oLnB1c2gobCkseCh0aGlzKSl9LGQucHJvdG90eXBlLmZvcmNlVXBkYXRlPWZ1bmN0aW9uKG4pe3RoaXMuX192JiYodGhpcy5fX2U9ITAsbiYmdGhpcy5fX2gucHVzaChuKSx4KHRoaXMpKX0sZC5wcm90b3R5cGUucmVuZGVyPXksaT1bXSxyPVwiZnVuY3Rpb25cIj09dHlwZW9mIFByb21pc2U/UHJvbWlzZS5wcm90b3R5cGUudGhlbi5iaW5kKFByb21pc2UucmVzb2x2ZSgpKTpzZXRUaW1lb3V0LGIuX19yPTAsZj0wLGV4cG9ydHMucmVuZGVyPU4sZXhwb3J0cy5oeWRyYXRlPWZ1bmN0aW9uIG4obCx1KXtOKGwsdSxuKX0sZXhwb3J0cy5jcmVhdGVFbGVtZW50PWgsZXhwb3J0cy5oPWgsZXhwb3J0cy5GcmFnbWVudD15LGV4cG9ydHMuY3JlYXRlUmVmPWZ1bmN0aW9uKCl7cmV0dXJue2N1cnJlbnQ6bnVsbH19LGV4cG9ydHMuaXNWYWxpZEVsZW1lbnQ9dCxleHBvcnRzLkNvbXBvbmVudD1kLGV4cG9ydHMuY2xvbmVFbGVtZW50PWZ1bmN0aW9uKGwsdSx0KXt2YXIgaSxyLG8sZj1hKHt9LGwucHJvcHMpO2ZvcihvIGluIHUpXCJrZXlcIj09bz9pPXVbb106XCJyZWZcIj09bz9yPXVbb106ZltvXT11W29dO3JldHVybiBhcmd1bWVudHMubGVuZ3RoPjImJihmLmNoaWxkcmVuPWFyZ3VtZW50cy5sZW5ndGg+Mz9uLmNhbGwoYXJndW1lbnRzLDIpOnQpLHAobC50eXBlLGYsaXx8bC5rZXkscnx8bC5yZWYsbnVsbCl9LGV4cG9ydHMuY3JlYXRlQ29udGV4dD1mdW5jdGlvbihuLGwpe3ZhciB1PXtfX2M6bD1cIl9fY0NcIitmKyssX186bixDb25zdW1lcjpmdW5jdGlvbihuLGwpe3JldHVybiBuLmNoaWxkcmVuKGwpfSxQcm92aWRlcjpmdW5jdGlvbihuKXt2YXIgdSx0O3JldHVybiB0aGlzLmdldENoaWxkQ29udGV4dHx8KHU9W10sKHQ9e30pW2xdPXRoaXMsdGhpcy5nZXRDaGlsZENvbnRleHQ9ZnVuY3Rpb24oKXtyZXR1cm4gdH0sdGhpcy5zaG91bGRDb21wb25lbnRVcGRhdGU9ZnVuY3Rpb24obil7dGhpcy5wcm9wcy52YWx1ZSE9PW4udmFsdWUmJnUuc29tZSh4KX0sdGhpcy5zdWI9ZnVuY3Rpb24obil7dS5wdXNoKG4pO3ZhciBsPW4uY29tcG9uZW50V2lsbFVubW91bnQ7bi5jb21wb25lbnRXaWxsVW5tb3VudD1mdW5jdGlvbigpe3Uuc3BsaWNlKHUuaW5kZXhPZihuKSwxKSxsJiZsLmNhbGwobil9fSksbi5jaGlsZHJlbn19O3JldHVybiB1LlByb3ZpZGVyLl9fPXUuQ29uc3VtZXIuY29udGV4dFR5cGU9dX0sZXhwb3J0cy50b0NoaWxkQXJyYXk9ZnVuY3Rpb24gbihsLHUpe3JldHVybiB1PXV8fFtdLG51bGw9PWx8fFwiYm9vbGVhblwiPT10eXBlb2YgbHx8KEFycmF5LmlzQXJyYXkobCk/bC5zb21lKGZ1bmN0aW9uKGwpe24obCx1KX0pOnUucHVzaChsKSksdX0sZXhwb3J0cy5vcHRpb25zPWw7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QuanMubWFwXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmNsYXNzIEF1dGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKCdBdXRob3JpemF0aW9uIHJlcXVpcmVkJylcbiAgICB0aGlzLm5hbWUgPSAnQXV0aEVycm9yJ1xuICAgIHRoaXMuaXNBdXRoRXJyb3IgPSB0cnVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoRXJyb3JcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50JylcbmNvbnN0IHRva2VuU3RvcmFnZSA9IHJlcXVpcmUoJy4vdG9rZW5TdG9yYWdlJylcblxuY29uc3QgZ2V0TmFtZSA9IChpZCkgPT4ge1xuICByZXR1cm4gaWQuc3BsaXQoJy0nKS5tYXAoKHMpID0+IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpKS5qb2luKCcgJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQcm92aWRlciBleHRlbmRzIFJlcXVlc3RDbGllbnQge1xuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy5wcm92aWRlciA9IG9wdHMucHJvdmlkZXJcbiAgICB0aGlzLmlkID0gdGhpcy5wcm92aWRlclxuICAgIHRoaXMubmFtZSA9IHRoaXMub3B0cy5uYW1lIHx8IGdldE5hbWUodGhpcy5pZClcbiAgICB0aGlzLnBsdWdpbklkID0gdGhpcy5vcHRzLnBsdWdpbklkXG4gICAgdGhpcy50b2tlbktleSA9IGBjb21wYW5pb24tJHt0aGlzLnBsdWdpbklkfS1hdXRoLXRva2VuYFxuICAgIHRoaXMuY29tcGFuaW9uS2V5c1BhcmFtcyA9IHRoaXMub3B0cy5jb21wYW5pb25LZXlzUGFyYW1zXG4gICAgdGhpcy5wcmVBdXRoVG9rZW4gPSBudWxsXG4gIH1cblxuICBoZWFkZXJzICgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3N1cGVyLmhlYWRlcnMoKSwgdGhpcy5nZXRBdXRoVG9rZW4oKV0pXG4gICAgICAudGhlbigoW2hlYWRlcnMsIHRva2VuXSkgPT4ge1xuICAgICAgICBjb25zdCBhdXRoSGVhZGVycyA9IHt9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIGF1dGhIZWFkZXJzWyd1cHB5LWF1dGgtdG9rZW4nXSA9IHRva2VuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jb21wYW5pb25LZXlzUGFyYW1zKSB7XG4gICAgICAgICAgYXV0aEhlYWRlcnNbJ3VwcHktY3JlZGVudGlhbHMtcGFyYW1zJ10gPSBidG9hKFxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoeyBwYXJhbXM6IHRoaXMuY29tcGFuaW9uS2V5c1BhcmFtcyB9KSxcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgLi4uaGVhZGVycywgLi4uYXV0aEhlYWRlcnMgfVxuICAgICAgfSlcbiAgfVxuXG4gIG9uUmVjZWl2ZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIHJlc3BvbnNlID0gc3VwZXIub25SZWNlaXZlUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgY29uc3QgcGx1Z2luID0gdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKVxuICAgIGNvbnN0IG9sZEF1dGhlbnRpY2F0ZWQgPSBwbHVnaW4uZ2V0UGx1Z2luU3RhdGUoKS5hdXRoZW50aWNhdGVkXG4gICAgY29uc3QgYXV0aGVudGljYXRlZCA9IG9sZEF1dGhlbnRpY2F0ZWQgPyByZXNwb25zZS5zdGF0dXMgIT09IDQwMSA6IHJlc3BvbnNlLnN0YXR1cyA8IDQwMFxuICAgIHBsdWdpbi5zZXRQbHVnaW5TdGF0ZSh7IGF1dGhlbnRpY2F0ZWQgfSlcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHNldEF1dGhUb2tlbiAodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLnNldEl0ZW0odGhpcy50b2tlbktleSwgdG9rZW4pXG4gIH1cblxuICBnZXRBdXRoVG9rZW4gKCkge1xuICAgIHJldHVybiB0aGlzLnVwcHkuZ2V0UGx1Z2luKHRoaXMucGx1Z2luSWQpLnN0b3JhZ2UuZ2V0SXRlbSh0aGlzLnRva2VuS2V5KVxuICB9XG5cbiAgYXV0aFVybCAocXVlcmllcyA9IHt9KSB7XG4gICAgaWYgKHRoaXMucHJlQXV0aFRva2VuKSB7XG4gICAgICBxdWVyaWVzLnVwcHlQcmVBdXRoVG9rZW4gPSB0aGlzLnByZUF1dGhUb2tlblxuICAgIH1cblxuICAgIHJldHVybiBgJHt0aGlzLmhvc3RuYW1lfS8ke3RoaXMuaWR9L2Nvbm5lY3Q/JHtuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJpZXMpfWBcbiAgfVxuXG4gIGZpbGVVcmwgKGlkKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuaG9zdG5hbWV9LyR7dGhpcy5pZH0vZ2V0LyR7aWR9YFxuICB9XG5cbiAgZmV0Y2hQcmVBdXRoVG9rZW4gKCkge1xuICAgIGlmICghdGhpcy5jb21wYW5pb25LZXlzUGFyYW1zKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KGAke3RoaXMuaWR9L3ByZWF1dGgvYCwgeyBwYXJhbXM6IHRoaXMuY29tcGFuaW9uS2V5c1BhcmFtcyB9KVxuICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICB0aGlzLnByZUF1dGhUb2tlbiA9IHJlcy50b2tlblxuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGBbQ29tcGFuaW9uQ2xpZW50XSB1bmFibGUgdG8gZmV0Y2ggcHJlQXV0aFRva2VuICR7ZXJyfWAsICd3YXJuaW5nJylcbiAgICAgIH0pXG4gIH1cblxuICBsaXN0IChkaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoYCR7dGhpcy5pZH0vbGlzdC8ke2RpcmVjdG9yeSB8fCAnJ31gKVxuICB9XG5cbiAgbG9nb3V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoYCR7dGhpcy5pZH0vbG9nb3V0YClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gUHJvbWlzZS5hbGwoW1xuICAgICAgICByZXNwb25zZSxcbiAgICAgICAgdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy50b2tlbktleSksXG4gICAgICBdKSkudGhlbigoW3Jlc3BvbnNlXSkgPT4gcmVzcG9uc2UpXG4gIH1cblxuICBzdGF0aWMgaW5pdFBsdWdpbiAocGx1Z2luLCBvcHRzLCBkZWZhdWx0T3B0cykge1xuICAgIHBsdWdpbi50eXBlID0gJ2FjcXVpcmVyJ1xuICAgIHBsdWdpbi5maWxlcyA9IFtdXG4gICAgaWYgKGRlZmF1bHRPcHRzKSB7XG4gICAgICBwbHVnaW4ub3B0cyA9IHsgLi4uZGVmYXVsdE9wdHMsIC4uLm9wdHMgfVxuICAgIH1cblxuICAgIGlmIChvcHRzLnNlcnZlclVybCB8fCBvcHRzLnNlcnZlclBhdHRlcm4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYHNlcnZlclVybGAgYW5kIGBzZXJ2ZXJQYXR0ZXJuYCBoYXZlIGJlZW4gcmVuYW1lZCB0byBgY29tcGFuaW9uVXJsYCBhbmQgYGNvbXBhbmlvbkFsbG93ZWRIb3N0c2AgcmVzcGVjdGl2ZWx5IGluIHRoZSAwLjMwLjUgcmVsZWFzZS4gUGxlYXNlIGNvbnN1bHQgdGhlIGRvY3MgKGZvciBleGFtcGxlLCBodHRwczovL3VwcHkuaW8vZG9jcy9pbnN0YWdyYW0vIGZvciB0aGUgSW5zdGFncmFtIHBsdWdpbikgYW5kIHVzZSB0aGUgdXBkYXRlZCBvcHRpb25zLmAnKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmNvbXBhbmlvbkFsbG93ZWRIb3N0cykge1xuICAgICAgY29uc3QgcGF0dGVybiA9IG9wdHMuY29tcGFuaW9uQWxsb3dlZEhvc3RzXG4gICAgICAvLyB2YWxpZGF0ZSBjb21wYW5pb25BbGxvd2VkSG9zdHMgcGFyYW1cbiAgICAgIGlmICh0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycgJiYgIUFycmF5LmlzQXJyYXkocGF0dGVybikgJiYgIShwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke3BsdWdpbi5pZH06IHRoZSBvcHRpb24gXCJjb21wYW5pb25BbGxvd2VkSG9zdHNcIiBtdXN0IGJlIG9uZSBvZiBzdHJpbmcsIEFycmF5LCBSZWdFeHBgKVxuICAgICAgfVxuICAgICAgcGx1Z2luLm9wdHMuY29tcGFuaW9uQWxsb3dlZEhvc3RzID0gcGF0dGVyblxuICAgIH0gZWxzZSBpZiAoL14oPyFodHRwcz86XFwvXFwvKS4qJC9pLnRlc3Qob3B0cy5jb21wYW5pb25VcmwpKSB7XG4gICAgICAvLyBkb2VzIG5vdCBzdGFydCB3aXRoIGh0dHBzOi8vXG4gICAgICBwbHVnaW4ub3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMgPSBgaHR0cHM6Ly8ke29wdHMuY29tcGFuaW9uVXJsLnJlcGxhY2UoL15cXC9cXC8vLCAnJyl9YFxuICAgIH0gZWxzZSB7XG4gICAgICBwbHVnaW4ub3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMgPSBuZXcgVVJMKG9wdHMuY29tcGFuaW9uVXJsKS5vcmlnaW5cbiAgICB9XG5cbiAgICBwbHVnaW4uc3RvcmFnZSA9IHBsdWdpbi5vcHRzLnN0b3JhZ2UgfHwgdG9rZW5TdG9yYWdlXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBmZXRjaFdpdGhOZXR3b3JrRXJyb3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZmV0Y2hXaXRoTmV0d29ya0Vycm9yJylcbmNvbnN0IEF1dGhFcnJvciA9IHJlcXVpcmUoJy4vQXV0aEVycm9yJylcblxuLy8gUmVtb3ZlIHRoZSB0cmFpbGluZyBzbGFzaCBzbyB3ZSBjYW4gYWx3YXlzIHNhZmVseSBhcHBlbmQgL3h5ei5cbmZ1bmN0aW9uIHN0cmlwU2xhc2ggKHVybCkge1xuICByZXR1cm4gdXJsLnJlcGxhY2UoL1xcLyQvLCAnJylcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSlNPTlJlc3BvbnNlIChyZXMpIHtcbiAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMSkge1xuICAgIHRocm93IG5ldyBBdXRoRXJyb3IoKVxuICB9XG5cbiAgY29uc3QganNvblByb21pc2UgPSByZXMuanNvbigpXG5cbiAgaWYgKHJlcy5zdGF0dXMgPCAyMDAgfHwgcmVzLnN0YXR1cyA+IDMwMCkge1xuICAgIGxldCBlcnJNc2cgPSBgRmFpbGVkIHJlcXVlc3Qgd2l0aCBzdGF0dXM6ICR7cmVzLnN0YXR1c30uICR7cmVzLnN0YXR1c1RleHR9YFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlcnJEYXRhID0gYXdhaXQganNvblByb21pc2VcbiAgICAgIGVyck1zZyA9IGVyckRhdGEubWVzc2FnZSA/IGAke2Vyck1zZ30gbWVzc2FnZTogJHtlcnJEYXRhLm1lc3NhZ2V9YCA6IGVyck1zZ1xuICAgICAgZXJyTXNnID0gZXJyRGF0YS5yZXF1ZXN0SWQgPyBgJHtlcnJNc2d9IHJlcXVlc3QtSWQ6ICR7ZXJyRGF0YS5yZXF1ZXN0SWR9YCA6IGVyck1zZ1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5zYWZlLWZpbmFsbHlcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpXG4gICAgfVxuICB9XG4gIHJldHVybiBqc29uUHJvbWlzZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFJlcXVlc3RDbGllbnQge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZ2xvYmFsLXJlcXVpcmVcbiAgc3RhdGljIFZFUlNJT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uXG5cbiAgI2dldFBvc3RSZXNwb25zZUZ1bmMgPSBza2lwID0+IHJlc3BvbnNlID0+IChza2lwID8gcmVzcG9uc2UgOiB0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlKHJlc3BvbnNlKSlcblxuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHRoaXMudXBweSA9IHVwcHlcbiAgICB0aGlzLm9wdHMgPSBvcHRzXG4gICAgdGhpcy5vblJlY2VpdmVSZXNwb25zZSA9IHRoaXMub25SZWNlaXZlUmVzcG9uc2UuYmluZCh0aGlzKVxuICAgIHRoaXMuYWxsb3dlZEhlYWRlcnMgPSBbJ2FjY2VwdCcsICdjb250ZW50LXR5cGUnLCAndXBweS1hdXRoLXRva2VuJ11cbiAgICB0aGlzLnByZWZsaWdodERvbmUgPSBmYWxzZVxuICB9XG5cbiAgZ2V0IGhvc3RuYW1lICgpIHtcbiAgICBjb25zdCB7IGNvbXBhbmlvbiB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmNvbXBhbmlvblVybFxuICAgIHJldHVybiBzdHJpcFNsYXNoKGNvbXBhbmlvbiAmJiBjb21wYW5pb25baG9zdF0gPyBjb21wYW5pb25baG9zdF0gOiBob3N0KVxuICB9XG5cbiAgc3RhdGljIGRlZmF1bHRIZWFkZXJzID17XG4gICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAnVXBweS1WZXJzaW9ucyc6IGBAdXBweS9jb21wYW5pb24tY2xpZW50PSR7UmVxdWVzdENsaWVudC5WRVJTSU9OfWAsXG4gIH1cblxuICBoZWFkZXJzICgpIHtcbiAgICBjb25zdCB1c2VySGVhZGVycyA9IHRoaXMub3B0cy5jb21wYW5pb25IZWFkZXJzIHx8IHt9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAuLi5SZXF1ZXN0Q2xpZW50LmRlZmF1bHRIZWFkZXJzLFxuICAgICAgLi4udXNlckhlYWRlcnMsXG4gICAgfSlcbiAgfVxuXG4gIG9uUmVjZWl2ZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICBjb25zdCBjb21wYW5pb24gPSBzdGF0ZS5jb21wYW5pb24gfHwge31cbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmNvbXBhbmlvblVybFxuICAgIGNvbnN0IHsgaGVhZGVycyB9ID0gcmVzcG9uc2VcbiAgICAvLyBTdG9yZSB0aGUgc2VsZi1pZGVudGlmaWVkIGRvbWFpbiBuYW1lIGZvciB0aGUgQ29tcGFuaW9uIGluc3RhbmNlIHdlIGp1c3QgaGl0LlxuICAgIGlmIChoZWFkZXJzLmhhcygnaS1hbScpICYmIGhlYWRlcnMuZ2V0KCdpLWFtJykgIT09IGNvbXBhbmlvbltob3N0XSkge1xuICAgICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgICAgY29tcGFuaW9uOiB7IC4uLmNvbXBhbmlvbiwgW2hvc3RdOiBoZWFkZXJzLmdldCgnaS1hbScpIH0sXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gICNnZXRVcmwgKHVybCkge1xuICAgIGlmICgvXihodHRwcz86fClcXC9cXC8vLnRlc3QodXJsKSkge1xuICAgICAgcmV0dXJuIHVybFxuICAgIH1cbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vJHt1cmx9YFxuICB9XG5cbiAgI2Vycm9ySGFuZGxlciAobWV0aG9kLCBwYXRoKSB7XG4gICAgcmV0dXJuIChlcnIpID0+IHtcbiAgICAgIGlmICghZXJyPy5pc0F1dGhFcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgQ291bGQgbm90ICR7bWV0aG9kfSAke3RoaXMuI2dldFVybChwYXRoKX1gKVxuICAgICAgICBlcnJvci5jYXVzZSA9IGVyclxuICAgICAgICBlcnIgPSBlcnJvciAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKVxuICAgIH1cbiAgfVxuXG4gIHByZWZsaWdodCAocGF0aCkge1xuICAgIGlmICh0aGlzLnByZWZsaWdodERvbmUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5hbGxvd2VkSGVhZGVycy5zbGljZSgpKVxuICAgIH1cblxuICAgIHJldHVybiBmZXRjaCh0aGlzLiNnZXRVcmwocGF0aCksIHtcbiAgICAgIG1ldGhvZDogJ09QVElPTlMnLFxuICAgIH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMuaGFzKCdhY2Nlc3MtY29udHJvbC1hbGxvdy1oZWFkZXJzJykpIHtcbiAgICAgICAgICB0aGlzLmFsbG93ZWRIZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2FjY2Vzcy1jb250cm9sLWFsbG93LWhlYWRlcnMnKVxuICAgICAgICAgICAgLnNwbGl0KCcsJykubWFwKChoZWFkZXJOYW1lKSA9PiBoZWFkZXJOYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlZmxpZ2h0RG9uZSA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsb3dlZEhlYWRlcnMuc2xpY2UoKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coYFtDb21wYW5pb25DbGllbnRdIHVuYWJsZSB0byBtYWtlIHByZWZsaWdodCByZXF1ZXN0ICR7ZXJyfWAsICd3YXJuaW5nJylcbiAgICAgICAgdGhpcy5wcmVmbGlnaHREb25lID0gdHJ1ZVxuICAgICAgICByZXR1cm4gdGhpcy5hbGxvd2VkSGVhZGVycy5zbGljZSgpXG4gICAgICB9KVxuICB9XG5cbiAgcHJlZmxpZ2h0QW5kSGVhZGVycyAocGF0aCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbdGhpcy5wcmVmbGlnaHQocGF0aCksIHRoaXMuaGVhZGVycygpXSlcbiAgICAgIC50aGVuKChbYWxsb3dlZEhlYWRlcnMsIGhlYWRlcnNdKSA9PiB7XG4gICAgICAgIC8vIGZpbHRlciB0byBrZWVwIG9ubHkgYWxsb3dlZCBIZWFkZXJzXG4gICAgICAgIE9iamVjdC5rZXlzKGhlYWRlcnMpLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgICAgICAgIGlmICghYWxsb3dlZEhlYWRlcnMuaW5jbHVkZXMoaGVhZGVyLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICB0aGlzLnVwcHkubG9nKGBbQ29tcGFuaW9uQ2xpZW50XSBleGNsdWRpbmcgZGlzYWxsb3dlZCBoZWFkZXIgJHtoZWFkZXJ9YClcbiAgICAgICAgICAgIGRlbGV0ZSBoZWFkZXJzW2hlYWRlcl0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gaGVhZGVyc1xuICAgICAgfSlcbiAgfVxuXG4gIGdldCAocGF0aCwgc2tpcFBvc3RSZXNwb25zZSkge1xuICAgIGNvbnN0IG1ldGhvZCA9ICdnZXQnXG4gICAgcmV0dXJuIHRoaXMucHJlZmxpZ2h0QW5kSGVhZGVycyhwYXRoKVxuICAgICAgLnRoZW4oKGhlYWRlcnMpID0+IGZldGNoV2l0aE5ldHdvcmtFcnJvcih0aGlzLiNnZXRVcmwocGF0aCksIHtcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjcmVkZW50aWFsczogdGhpcy5vcHRzLmNvbXBhbmlvbkNvb2tpZXNSdWxlIHx8ICdzYW1lLW9yaWdpbicsXG4gICAgICB9KSlcbiAgICAgIC50aGVuKHRoaXMuI2dldFBvc3RSZXNwb25zZUZ1bmMoc2tpcFBvc3RSZXNwb25zZSkpXG4gICAgICAudGhlbihoYW5kbGVKU09OUmVzcG9uc2UpXG4gICAgICAuY2F0Y2godGhpcy4jZXJyb3JIYW5kbGVyKG1ldGhvZCwgcGF0aCkpXG4gIH1cblxuICBwb3N0IChwYXRoLCBkYXRhLCBza2lwUG9zdFJlc3BvbnNlKSB7XG4gICAgY29uc3QgbWV0aG9kID0gJ3Bvc3QnXG4gICAgcmV0dXJuIHRoaXMucHJlZmxpZ2h0QW5kSGVhZGVycyhwYXRoKVxuICAgICAgLnRoZW4oKGhlYWRlcnMpID0+IGZldGNoV2l0aE5ldHdvcmtFcnJvcih0aGlzLiNnZXRVcmwocGF0aCksIHtcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjcmVkZW50aWFsczogdGhpcy5vcHRzLmNvbXBhbmlvbkNvb2tpZXNSdWxlIHx8ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgfSkpXG4gICAgICAudGhlbih0aGlzLiNnZXRQb3N0UmVzcG9uc2VGdW5jKHNraXBQb3N0UmVzcG9uc2UpKVxuICAgICAgLnRoZW4oaGFuZGxlSlNPTlJlc3BvbnNlKVxuICAgICAgLmNhdGNoKHRoaXMuI2Vycm9ySGFuZGxlcihtZXRob2QsIHBhdGgpKVxuICB9XG5cbiAgZGVsZXRlIChwYXRoLCBkYXRhLCBza2lwUG9zdFJlc3BvbnNlKSB7XG4gICAgY29uc3QgbWV0aG9kID0gJ2RlbGV0ZSdcbiAgICByZXR1cm4gdGhpcy5wcmVmbGlnaHRBbmRIZWFkZXJzKHBhdGgpXG4gICAgICAudGhlbigoaGVhZGVycykgPT4gZmV0Y2hXaXRoTmV0d29ya0Vycm9yKGAke3RoaXMuaG9zdG5hbWV9LyR7cGF0aH1gLCB7XG4gICAgICAgIG1ldGhvZCxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY3JlZGVudGlhbHM6IHRoaXMub3B0cy5jb21wYW5pb25Db29raWVzUnVsZSB8fCAnc2FtZS1vcmlnaW4nLFxuICAgICAgICBib2R5OiBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBudWxsLFxuICAgICAgfSkpXG4gICAgICAudGhlbih0aGlzLiNnZXRQb3N0UmVzcG9uc2VGdW5jKHNraXBQb3N0UmVzcG9uc2UpKVxuICAgICAgLnRoZW4oaGFuZGxlSlNPTlJlc3BvbnNlKVxuICAgICAgLmNhdGNoKHRoaXMuI2Vycm9ySGFuZGxlcihtZXRob2QsIHBhdGgpKVxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgUmVxdWVzdENsaWVudCA9IHJlcXVpcmUoJy4vUmVxdWVzdENsaWVudCcpXG5cbmNvbnN0IGdldE5hbWUgPSAoaWQpID0+IHtcbiAgcmV0dXJuIGlkLnNwbGl0KCctJykubWFwKChzKSA9PiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKSkuam9pbignICcpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2VhcmNoUHJvdmlkZXIgZXh0ZW5kcyBSZXF1ZXN0Q2xpZW50IHtcbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMucHJvdmlkZXIgPSBvcHRzLnByb3ZpZGVyXG4gICAgdGhpcy5pZCA9IHRoaXMucHJvdmlkZXJcbiAgICB0aGlzLm5hbWUgPSB0aGlzLm9wdHMubmFtZSB8fCBnZXROYW1lKHRoaXMuaWQpXG4gICAgdGhpcy5wbHVnaW5JZCA9IHRoaXMub3B0cy5wbHVnaW5JZFxuICB9XG5cbiAgZmlsZVVybCAoaWQpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vc2VhcmNoLyR7dGhpcy5pZH0vZ2V0LyR7aWR9YFxuICB9XG5cbiAgc2VhcmNoICh0ZXh0LCBxdWVyaWVzKSB7XG4gICAgcXVlcmllcyA9IHF1ZXJpZXMgPyBgJiR7cXVlcmllc31gIDogJydcbiAgICByZXR1cm4gdGhpcy5nZXQoYHNlYXJjaC8ke3RoaXMuaWR9L2xpc3Q/cT0ke2VuY29kZVVSSUNvbXBvbmVudCh0ZXh0KX0ke3F1ZXJpZXN9YClcbiAgfVxufVxuIiwiY29uc3QgZWUgPSByZXF1aXJlKCduYW1lc3BhY2UtZW1pdHRlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVXBweVNvY2tldCB7XG4gICNxdWV1ZWQgPSBbXVxuXG4gICNlbWl0dGVyID0gZWUoKVxuXG4gICNpc09wZW4gPSBmYWxzZVxuXG4gICNzb2NrZXRcblxuICBjb25zdHJ1Y3RvciAob3B0cykge1xuICAgIHRoaXMub3B0cyA9IG9wdHNcblxuICAgIGlmICghb3B0cyB8fCBvcHRzLmF1dG9PcGVuICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5vcGVuKClcbiAgICB9XG4gIH1cblxuICBnZXQgaXNPcGVuICgpIHsgcmV0dXJuIHRoaXMuI2lzT3BlbiB9XG5cbiAgW1N5bWJvbC5mb3IoJ3VwcHkgdGVzdDogZ2V0U29ja2V0JyldICgpIHsgcmV0dXJuIHRoaXMuI3NvY2tldCB9XG5cbiAgW1N5bWJvbC5mb3IoJ3VwcHkgdGVzdDogZ2V0UXVldWVkJyldICgpIHsgcmV0dXJuIHRoaXMuI3F1ZXVlZCB9XG5cbiAgb3BlbiAoKSB7XG4gICAgdGhpcy4jc29ja2V0ID0gbmV3IFdlYlNvY2tldCh0aGlzLm9wdHMudGFyZ2V0KVxuXG4gICAgdGhpcy4jc29ja2V0Lm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuI2lzT3BlbiA9IHRydWVcblxuICAgICAgd2hpbGUgKHRoaXMuI3F1ZXVlZC5sZW5ndGggPiAwICYmIHRoaXMuI2lzT3Blbikge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHRoaXMuI3F1ZXVlZC5zaGlmdCgpXG4gICAgICAgIHRoaXMuc2VuZChmaXJzdC5hY3Rpb24sIGZpcnN0LnBheWxvYWQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy4jc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLiNpc09wZW4gPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuI3NvY2tldC5vbm1lc3NhZ2UgPSB0aGlzLiNoYW5kbGVNZXNzYWdlXG4gIH1cblxuICBjbG9zZSAoKSB7XG4gICAgdGhpcy4jc29ja2V0Py5jbG9zZSgpXG4gIH1cblxuICBzZW5kIChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICAvLyBhdHRhY2ggdXVpZFxuXG4gICAgaWYgKCF0aGlzLiNpc09wZW4pIHtcbiAgICAgIHRoaXMuI3F1ZXVlZC5wdXNoKHsgYWN0aW9uLCBwYXlsb2FkIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLiNzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICBhY3Rpb24sXG4gICAgICBwYXlsb2FkLFxuICAgIH0pKVxuICB9XG5cbiAgb24gKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuI2VtaXR0ZXIub24oYWN0aW9uLCBoYW5kbGVyKVxuICB9XG5cbiAgZW1pdCAoYWN0aW9uLCBwYXlsb2FkKSB7XG4gICAgdGhpcy4jZW1pdHRlci5lbWl0KGFjdGlvbiwgcGF5bG9hZClcbiAgfVxuXG4gIG9uY2UgKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuI2VtaXR0ZXIub25jZShhY3Rpb24sIGhhbmRsZXIpXG4gIH1cblxuICAjaGFuZGxlTWVzc2FnZT0gKGUpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UoZS5kYXRhKVxuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UuYWN0aW9uLCBtZXNzYWdlLnBheWxvYWQpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBUT0RPOiB1c2UgYSBtb3JlIHJvYnVzdCBlcnJvciBoYW5kbGVyLlxuICAgICAgY29uc29sZS5sb2coZXJyKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIE1hbmFnZXMgY29tbXVuaWNhdGlvbnMgd2l0aCBDb21wYW5pb25cbiAqL1xuXG5jb25zdCBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50JylcbmNvbnN0IFByb3ZpZGVyID0gcmVxdWlyZSgnLi9Qcm92aWRlcicpXG5jb25zdCBTZWFyY2hQcm92aWRlciA9IHJlcXVpcmUoJy4vU2VhcmNoUHJvdmlkZXInKVxuY29uc3QgU29ja2V0ID0gcmVxdWlyZSgnLi9Tb2NrZXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUmVxdWVzdENsaWVudCxcbiAgUHJvdmlkZXIsXG4gIFNlYXJjaFByb3ZpZGVyLFxuICBTb2NrZXQsXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBUaGlzIG1vZHVsZSBzZXJ2ZXMgYXMgYW4gQXN5bmMgd3JhcHBlciBmb3IgTG9jYWxTdG9yYWdlXG4gKi9cbm1vZHVsZS5leHBvcnRzLnNldEl0ZW0gPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKVxuICAgIHJlc29sdmUoKVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRJdGVtID0gKGtleSkgPT4ge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpXG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZUl0ZW0gPSAoa2V5KSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICByZXNvbHZlKClcbiAgfSlcbn1cbiIsIi8qKlxuICogQ29yZSBwbHVnaW4gbG9naWMgdGhhdCBhbGwgcGx1Z2lucyBzaGFyZS5cbiAqXG4gKiBCYXNlUGx1Z2luIGRvZXMgbm90IGNvbnRhaW4gRE9NIHJlbmRlcmluZyBzbyBpdCBjYW4gYmUgdXNlZCBmb3IgcGx1Z2luc1xuICogd2l0aG91dCBhIHVzZXIgaW50ZXJmYWNlLlxuICpcbiAqIFNlZSBgUGx1Z2luYCBmb3IgdGhlIGV4dGVuZGVkIHZlcnNpb24gd2l0aCBQcmVhY3QgcmVuZGVyaW5nIGZvciBpbnRlcmZhY2VzLlxuICovXG5cbmNvbnN0IFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQmFzZVBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzID0ge30pIHtcbiAgICB0aGlzLnVwcHkgPSB1cHB5XG4gICAgdGhpcy5vcHRzID0gb3B0c1xuICB9XG5cbiAgZ2V0UGx1Z2luU3RhdGUgKCkge1xuICAgIGNvbnN0IHsgcGx1Z2lucyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICByZXR1cm4gcGx1Z2luc1t0aGlzLmlkXSB8fCB7fVxuICB9XG5cbiAgc2V0UGx1Z2luU3RhdGUgKHVwZGF0ZSkge1xuICAgIGNvbnN0IHsgcGx1Z2lucyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcblxuICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICBwbHVnaW5zOiB7XG4gICAgICAgIC4uLnBsdWdpbnMsXG4gICAgICAgIFt0aGlzLmlkXToge1xuICAgICAgICAgIC4uLnBsdWdpbnNbdGhpcy5pZF0sXG4gICAgICAgICAgLi4udXBkYXRlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KVxuICB9XG5cbiAgc2V0T3B0aW9ucyAobmV3T3B0cykge1xuICAgIHRoaXMub3B0cyA9IHsgLi4udGhpcy5vcHRzLCAuLi5uZXdPcHRzIH1cbiAgICB0aGlzLnNldFBsdWdpblN0YXRlKCkgLy8gc28gdGhhdCBVSSByZS1yZW5kZXJzIHdpdGggbmV3IG9wdGlvbnNcbiAgICB0aGlzLmkxOG5Jbml0KClcbiAgfVxuXG4gIGkxOG5Jbml0ICgpIHtcbiAgICBjb25zdCB0cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3IoW3RoaXMuZGVmYXVsdExvY2FsZSwgdGhpcy51cHB5LmxvY2FsZSwgdGhpcy5vcHRzLmxvY2FsZV0pXG4gICAgdGhpcy5pMThuID0gdHJhbnNsYXRvci50cmFuc2xhdGUuYmluZCh0cmFuc2xhdG9yKVxuICAgIHRoaXMuaTE4bkFycmF5ID0gdHJhbnNsYXRvci50cmFuc2xhdGVBcnJheS5iaW5kKHRyYW5zbGF0b3IpXG4gICAgdGhpcy5zZXRQbHVnaW5TdGF0ZSgpIC8vIHNvIHRoYXQgVUkgcmUtcmVuZGVycyBhbmQgd2Ugc2VlIHRoZSB1cGRhdGVkIGxvY2FsZVxuICB9XG5cbiAgLyoqXG4gICAqIEV4dGVuZGFibGUgbWV0aG9kc1xuICAgKiA9PT09PT09PT09PT09PT09PT1cbiAgICogVGhlc2UgbWV0aG9kcyBhcmUgaGVyZSB0byBzZXJ2ZSBhcyBhbiBvdmVydmlldyBvZiB0aGUgZXh0ZW5kYWJsZSBtZXRob2RzIGFzIHdlbGwgYXNcbiAgICogbWFraW5nIHRoZW0gbm90IGNvbmRpdGlvbmFsIGluIHVzZSwgc3VjaCBhcyBgaWYgKHRoaXMuYWZ0ZXJVcGRhdGUpYC5cbiAgICovXG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgYWRkVGFyZ2V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4dGVuZCB0aGUgYWRkVGFyZ2V0IG1ldGhvZCB0byBhZGQgeW91ciBwbHVnaW4gdG8gYW5vdGhlciBwbHVnaW5cXCdzIHRhcmdldCcpXG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2xhc3MtbWV0aG9kcy11c2UtdGhpc1xuICBpbnN0YWxsICgpIHt9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgdW5pbnN0YWxsICgpIHt9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHBsdWdpbiBpcyBtb3VudGVkLCB3aGV0aGVyIGluIERPTSBvciBpbnRvIGFub3RoZXIgcGx1Z2luLlxuICAgKiBOZWVkZWQgYmVjYXVzZSBzb21ldGltZXMgcGx1Z2lucyBhcmUgbW91bnRlZCBzZXBhcmF0ZWx5L2FmdGVyIGBpbnN0YWxsYCxcbiAgICogc28gdGhpcy5lbCBhbmQgdGhpcy5wYXJlbnQgbWlnaHQgbm90IGJlIGF2YWlsYWJsZSBpbiBgaW5zdGFsbGAuXG4gICAqIFRoaXMgaXMgdGhlIGNhc2Ugd2l0aCBAdXBweS9yZWFjdCBwbHVnaW5zLCBmb3IgZXhhbXBsZS5cbiAgICovXG4gIHJlbmRlciAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHRlbmQgdGhlIHJlbmRlciBtZXRob2QgdG8gYWRkIHlvdXIgcGx1Z2luIHRvIGEgRE9NIGVsZW1lbnQnKVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgdXBkYXRlICgpIHt9XG5cbiAgLy8gQ2FsbGVkIGFmdGVyIGV2ZXJ5IHN0YXRlIHVwZGF0ZSwgYWZ0ZXIgZXZlcnl0aGluZydzIG1vdW50ZWQuIERlYm91bmNlZC5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgYWZ0ZXJVcGRhdGUgKCkge31cbn1cbiIsImNvbnN0IHsgcmVuZGVyIH0gPSByZXF1aXJlKCdwcmVhY3QnKVxuY29uc3QgZmluZERPTUVsZW1lbnQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZmluZERPTUVsZW1lbnQnKVxuXG5jb25zdCBCYXNlUGx1Z2luID0gcmVxdWlyZSgnLi9CYXNlUGx1Z2luJylcblxuLyoqXG4gKiBEZWZlciBhIGZyZXF1ZW50IGNhbGwgdG8gdGhlIG1pY3JvdGFzayBxdWV1ZS5cbiAqXG4gKiBAcGFyYW0geygpID0+IFR9IGZuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UgKGZuKSB7XG4gIGxldCBjYWxsaW5nID0gbnVsbFxuICBsZXQgbGF0ZXN0QXJncyA9IG51bGxcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgbGF0ZXN0QXJncyA9IGFyZ3NcbiAgICBpZiAoIWNhbGxpbmcpIHtcbiAgICAgIGNhbGxpbmcgPSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgY2FsbGluZyA9IG51bGxcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCBgYXJnc2AgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBtb3N0XG4gICAgICAgIC8vIHJlY2VudCBzdGF0ZSwgaWYgbXVsdGlwbGUgY2FsbHMgaGFwcGVuZWQgc2luY2UgdGhpcyB0YXNrXG4gICAgICAgIC8vIHdhcyBxdWV1ZWQuIFNvIHdlIHVzZSB0aGUgYGxhdGVzdEFyZ3NgLCB3aGljaCBkZWZpbml0ZWx5XG4gICAgICAgIC8vIGlzIHRoZSBtb3N0IHJlY2VudCBjYWxsLlxuICAgICAgICByZXR1cm4gZm4oLi4ubGF0ZXN0QXJncylcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBjYWxsaW5nXG4gIH1cbn1cblxuLyoqXG4gKiBVSVBsdWdpbiBpcyB0aGUgZXh0ZW5kZWQgdmVyc2lvbiBvZiBCYXNlUGx1Z2luIHRvIGluY29ycG9yYXRlIHJlbmRlcmluZyB3aXRoIFByZWFjdC5cbiAqIFVzZSB0aGlzIGZvciBwbHVnaW5zIHRoYXQgbmVlZCBhIHVzZXIgaW50ZXJmYWNlLlxuICpcbiAqIEZvciBwbHVnaW5zIHdpdGhvdXQgYW4gdXNlciBpbnRlcmZhY2UsIHNlZSBCYXNlUGx1Z2luLlxuICovXG5jbGFzcyBVSVBsdWdpbiBleHRlbmRzIEJhc2VQbHVnaW4ge1xuICAjdXBkYXRlVUlcblxuICAvKipcbiAgICogQ2hlY2sgaWYgc3VwcGxpZWQgYHRhcmdldGAgaXMgYSBET00gZWxlbWVudCBvciBhbiBgb2JqZWN0YC5cbiAgICogSWYgaXTigJlzIGFuIG9iamVjdCDigJQgdGFyZ2V0IGlzIGEgcGx1Z2luLCBhbmQgd2Ugc2VhcmNoIGBwbHVnaW5zYFxuICAgKiBmb3IgYSBwbHVnaW4gd2l0aCBzYW1lIG5hbWUgYW5kIHJldHVybiBpdHMgdGFyZ2V0LlxuICAgKi9cbiAgbW91bnQgKHRhcmdldCwgcGx1Z2luKSB7XG4gICAgY29uc3QgY2FsbGVyUGx1Z2luTmFtZSA9IHBsdWdpbi5pZFxuXG4gICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IGZpbmRET01FbGVtZW50KHRhcmdldClcblxuICAgIGlmICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICB0aGlzLmlzVGFyZ2V0RE9NRWwgPSB0cnVlXG4gICAgICAvLyBXaGVuIHRhcmdldCBpcyA8Ym9keT4gd2l0aCBhIHNpbmdsZSA8ZGl2PiBlbGVtZW50LFxuICAgICAgLy8gUHJlYWN0IHRoaW5rcyBpdOKAmXMgdGhlIFVwcHkgcm9vdCBlbGVtZW50IGluIHRoZXJlIHdoZW4gZG9pbmcgYSBkaWZmLFxuICAgICAgLy8gYW5kIGRlc3Ryb3lzIGl0LiBTbyB3ZSBhcmUgY3JlYXRpbmcgYSBmcmFnbWVudCAoY291bGQgYmUgZW1wdHkgZGl2KVxuICAgICAgY29uc3QgdXBweVJvb3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cbiAgICAgIC8vIEFQSSBmb3IgcGx1Z2lucyB0aGF0IHJlcXVpcmUgYSBzeW5jaHJvbm91cyByZXJlbmRlci5cbiAgICAgIHRoaXMuI3VwZGF0ZVVJID0gZGVib3VuY2UoKHN0YXRlKSA9PiB7XG4gICAgICAgIC8vIHBsdWdpbiBjb3VsZCBiZSByZW1vdmVkLCBidXQgdGhpcy5yZXJlbmRlciBpcyBkZWJvdW5jZWQgYmVsb3csXG4gICAgICAgIC8vIHNvIGl0IGNvdWxkIHN0aWxsIGJlIGNhbGxlZCBldmVuIGFmdGVyIHVwcHkucmVtb3ZlUGx1Z2luIG9yIHVwcHkuY2xvc2VcbiAgICAgICAgLy8gaGVuY2UgdGhlIGNoZWNrXG4gICAgICAgIGlmICghdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLmlkKSkgcmV0dXJuXG4gICAgICAgIHJlbmRlcih0aGlzLnJlbmRlcihzdGF0ZSksIHVwcHlSb290RWxlbWVudClcbiAgICAgICAgdGhpcy5hZnRlclVwZGF0ZSgpXG4gICAgICB9KVxuXG4gICAgICB0aGlzLnVwcHkubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gYSBET00gZWxlbWVudCAnJHt0YXJnZXR9J2ApXG5cbiAgICAgIGlmICh0aGlzLm9wdHMucmVwbGFjZVRhcmdldENvbnRlbnQpIHtcbiAgICAgICAgLy8gRG9pbmcgcmVuZGVyKGgobnVsbCksIHRhcmdldEVsZW1lbnQpLCB3aGljaCBzaG91bGQgaGF2ZSBiZWVuXG4gICAgICAgIC8vIGEgYmV0dGVyIHdheSwgc2luY2UgYmVjYXVzZSB0aGUgY29tcG9uZW50IG1pZ2h0IG5lZWQgdG8gZG8gYWRkaXRpb25hbCBjbGVhbnVwIHdoZW4gaXQgaXMgcmVtb3ZlZCxcbiAgICAgICAgLy8gc3RvcHBlZCB3b3JraW5nIOKAlCBQcmVhY3QganVzdCBhZGRzIG51bGwgaW50byB0YXJnZXQsIG5vdCByZXBsYWNpbmdcbiAgICAgICAgdGFyZ2V0RWxlbWVudC5pbm5lckhUTUwgPSAnJ1xuICAgICAgfVxuXG4gICAgICByZW5kZXIodGhpcy5yZW5kZXIodGhpcy51cHB5LmdldFN0YXRlKCkpLCB1cHB5Um9vdEVsZW1lbnQpXG4gICAgICB0aGlzLmVsID0gdXBweVJvb3RFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkXG4gICAgICB0YXJnZXRFbGVtZW50LmFwcGVuZENoaWxkKHVwcHlSb290RWxlbWVudClcblxuICAgICAgdGhpcy5vbk1vdW50KClcblxuICAgICAgcmV0dXJuIHRoaXMuZWxcbiAgICB9XG5cbiAgICBsZXQgdGFyZ2V0UGx1Z2luXG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHRhcmdldCBpbnN0YW5jZW9mIFVJUGx1Z2luKSB7XG4gICAgICAvLyBUYXJnZXRpbmcgYSBwbHVnaW4gKmluc3RhbmNlKlxuICAgICAgdGFyZ2V0UGx1Z2luID0gdGFyZ2V0XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUYXJnZXRpbmcgYSBwbHVnaW4gdHlwZVxuICAgICAgY29uc3QgVGFyZ2V0ID0gdGFyZ2V0XG4gICAgICAvLyBGaW5kIHRoZSB0YXJnZXQgcGx1Z2luIGluc3RhbmNlLlxuICAgICAgdGhpcy51cHB5Lml0ZXJhdGVQbHVnaW5zKHAgPT4ge1xuICAgICAgICBpZiAocCBpbnN0YW5jZW9mIFRhcmdldCkge1xuICAgICAgICAgIHRhcmdldFBsdWdpbiA9IHBcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0UGx1Z2luKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gJHt0YXJnZXRQbHVnaW4uaWR9YClcbiAgICAgIHRoaXMucGFyZW50ID0gdGFyZ2V0UGx1Z2luXG4gICAgICB0aGlzLmVsID0gdGFyZ2V0UGx1Z2luLmFkZFRhcmdldChwbHVnaW4pXG5cbiAgICAgIHRoaXMub25Nb3VudCgpXG4gICAgICByZXR1cm4gdGhpcy5lbFxuICAgIH1cblxuICAgIHRoaXMudXBweS5sb2coYE5vdCBpbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX1gKVxuXG4gICAgbGV0IG1lc3NhZ2UgPSBgSW52YWxpZCB0YXJnZXQgb3B0aW9uIGdpdmVuIHRvICR7Y2FsbGVyUGx1Z2luTmFtZX0uYFxuICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBtZXNzYWdlICs9ICcgVGhlIGdpdmVuIHRhcmdldCBpcyBub3QgYSBQbHVnaW4gY2xhc3MuICdcbiAgICAgICAgKyAnUGxlYXNlIGNoZWNrIHRoYXQgeW91XFwncmUgbm90IHNwZWNpZnlpbmcgYSBSZWFjdCBDb21wb25lbnQgaW5zdGVhZCBvZiBhIHBsdWdpbi4gJ1xuICAgICAgICArICdJZiB5b3UgYXJlIHVzaW5nIEB1cHB5LyogcGFja2FnZXMgZGlyZWN0bHksIG1ha2Ugc3VyZSB5b3UgaGF2ZSBvbmx5IDEgdmVyc2lvbiBvZiBAdXBweS9jb3JlIGluc3RhbGxlZDogJ1xuICAgICAgICArICdydW4gYG5wbSBscyBAdXBweS9jb3JlYCBvbiB0aGUgY29tbWFuZCBsaW5lIGFuZCB2ZXJpZnkgdGhhdCBhbGwgdGhlIHZlcnNpb25zIG1hdGNoIGFuZCBhcmUgZGVkdXBlZCBjb3JyZWN0bHkuJ1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlICs9ICdJZiB5b3UgbWVhbnQgdG8gdGFyZ2V0IGFuIEhUTUwgZWxlbWVudCwgcGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHRoZSBlbGVtZW50IGV4aXN0cy4gJ1xuICAgICAgICArICdDaGVjayB0aGF0IHRoZSA8c2NyaXB0PiB0YWcgaW5pdGlhbGl6aW5nIFVwcHkgaXMgcmlnaHQgYmVmb3JlIHRoZSBjbG9zaW5nIDwvYm9keT4gdGFnIGF0IHRoZSBlbmQgb2YgdGhlIHBhZ2UuICdcbiAgICAgICAgKyAnKHNlZSBodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXMvMTA0MilcXG5cXG4nXG4gICAgICAgICsgJ0lmIHlvdSBtZWFudCB0byB0YXJnZXQgYSBwbHVnaW4sIHBsZWFzZSBjb25maXJtIHRoYXQgeW91ciBgaW1wb3J0YCBzdGF0ZW1lbnRzIG9yIGByZXF1aXJlYCBjYWxscyBhcmUgY29ycmVjdC4nXG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKVxuICB9XG5cbiAgdXBkYXRlIChzdGF0ZSkge1xuICAgIGlmICh0aGlzLmVsICE9IG51bGwpIHtcbiAgICAgIHRoaXMuI3VwZGF0ZVVJPy4oc3RhdGUpXG4gICAgfVxuICB9XG5cbiAgdW5tb3VudCAoKSB7XG4gICAgaWYgKHRoaXMuaXNUYXJnZXRET01FbCkge1xuICAgICAgdGhpcy5lbD8ucmVtb3ZlKClcbiAgICB9XG4gICAgdGhpcy5vblVubW91bnQoKVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgb25Nb3VudCAoKSB7fVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzXG4gIG9uVW5tb3VudCAoKSB7fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVJUGx1Z2luXG4iLCIvKiBnbG9iYWwgQWdncmVnYXRlRXJyb3IgKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpXG5jb25zdCBlZSA9IHJlcXVpcmUoJ25hbWVzcGFjZS1lbWl0dGVyJylcbmNvbnN0IHsgbmFub2lkIH0gPSByZXF1aXJlKCduYW5vaWQnKVxuY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuY29uc3QgcHJldHRpZXJCeXRlcyA9IHJlcXVpcmUoJ0B0cmFuc2xvYWRpdC9wcmV0dGllci1ieXRlcycpXG5jb25zdCBtYXRjaCA9IHJlcXVpcmUoJ21pbWUtbWF0Y2gnKVxuY29uc3QgRGVmYXVsdFN0b3JlID0gcmVxdWlyZSgnQHVwcHkvc3RvcmUtZGVmYXVsdCcpXG5jb25zdCBnZXRGaWxlVHlwZSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlVHlwZScpXG5jb25zdCBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbiA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbicpXG5jb25zdCBnZW5lcmF0ZUZpbGVJRCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZW5lcmF0ZUZpbGVJRCcpXG5jb25zdCBzdXBwb3J0c1VwbG9hZFByb2dyZXNzID0gcmVxdWlyZSgnLi9zdXBwb3J0c1VwbG9hZFByb2dyZXNzJylcbmNvbnN0IGdldEZpbGVOYW1lID0gcmVxdWlyZSgnLi9nZXRGaWxlTmFtZScpXG5jb25zdCB7IGp1c3RFcnJvcnNMb2dnZXIsIGRlYnVnTG9nZ2VyIH0gPSByZXF1aXJlKCcuL2xvZ2dlcnMnKVxuXG5jb25zdCBsb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpXG5cbi8vIEV4cG9ydGVkIGZyb20gaGVyZS5cbmNsYXNzIFJlc3RyaWN0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgICB0aGlzLmlzUmVzdHJpY3Rpb24gPSB0cnVlXG4gIH1cbn1cbmlmICh0eXBlb2YgQWdncmVnYXRlRXJyb3IgPT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1nbG9iYWwtYXNzaWduXG4gIGdsb2JhbFRoaXMuQWdncmVnYXRlRXJyb3IgPSBjbGFzcyBBZ2dyZWdhdGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvciAoZXJyb3JzLCBtZXNzYWdlKSB7XG4gICAgICBzdXBlcihtZXNzYWdlKVxuICAgICAgdGhpcy5lcnJvcnMgPSBlcnJvcnNcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQWdncmVnYXRlUmVzdHJpY3Rpb25FcnJvciBleHRlbmRzIEFnZ3JlZ2F0ZUVycm9yIHtcbiAgY29uc3RydWN0b3IgKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKVxuICAgIHRoaXMuaXNSZXN0cmljdGlvbiA9IHRydWVcbiAgfVxufVxuXG4vKipcbiAqIFVwcHkgQ29yZSBtb2R1bGUuXG4gKiBNYW5hZ2VzIHBsdWdpbnMsIHN0YXRlIHVwZGF0ZXMsIGFjdHMgYXMgYW4gZXZlbnQgYnVzLFxuICogYWRkcy9yZW1vdmVzIGZpbGVzIGFuZCBtZXRhZGF0YS5cbiAqL1xuY2xhc3MgVXBweSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBnbG9iYWwtcmVxdWlyZVxuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIEJhc2VQbHVnaW5bXT59ICovXG4gICNwbHVnaW5zID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gICNzdG9yZVVuc3Vic2NyaWJlXG5cbiAgI2VtaXR0ZXIgPSBlZSgpXG5cbiAgI3ByZVByb2Nlc3NvcnMgPSBuZXcgU2V0KClcblxuICAjdXBsb2FkZXJzID0gbmV3IFNldCgpXG5cbiAgI3Bvc3RQcm9jZXNzb3JzID0gbmV3IFNldCgpXG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIFVwcHlcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHMg4oCUIFVwcHkgb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IgKG9wdHMpIHtcbiAgICB0aGlzLmRlZmF1bHRMb2NhbGUgPSBsb2NhbGVcblxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgaWQ6ICd1cHB5JyxcbiAgICAgIGF1dG9Qcm9jZWVkOiBmYWxzZSxcbiAgICAgIC8qKlxuICAgICAgICogQGRlcHJlY2F0ZWQgVGhlIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWRcbiAgICAgICAqL1xuICAgICAgYWxsb3dNdWx0aXBsZVVwbG9hZHM6IHRydWUsXG4gICAgICBhbGxvd011bHRpcGxlVXBsb2FkQmF0Y2hlczogdHJ1ZSxcbiAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgIHJlc3RyaWN0aW9uczoge1xuICAgICAgICBtYXhGaWxlU2l6ZTogbnVsbCxcbiAgICAgICAgbWluRmlsZVNpemU6IG51bGwsXG4gICAgICAgIG1heFRvdGFsRmlsZVNpemU6IG51bGwsXG4gICAgICAgIG1heE51bWJlck9mRmlsZXM6IG51bGwsXG4gICAgICAgIG1pbk51bWJlck9mRmlsZXM6IG51bGwsXG4gICAgICAgIGFsbG93ZWRGaWxlVHlwZXM6IG51bGwsXG4gICAgICAgIHJlcXVpcmVkTWV0YUZpZWxkczogW10sXG4gICAgICB9LFxuICAgICAgbWV0YToge30sXG4gICAgICBvbkJlZm9yZUZpbGVBZGRlZDogKGN1cnJlbnRGaWxlKSA9PiBjdXJyZW50RmlsZSxcbiAgICAgIG9uQmVmb3JlVXBsb2FkOiAoZmlsZXMpID0+IGZpbGVzLFxuICAgICAgc3RvcmU6IERlZmF1bHRTdG9yZSgpLFxuICAgICAgbG9nZ2VyOiBqdXN0RXJyb3JzTG9nZ2VyLFxuICAgICAgaW5mb1RpbWVvdXQ6IDUwMDAsXG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXIsXG4gICAgLy8gbWFraW5nIHN1cmUgdG8gbWVyZ2UgcmVzdHJpY3Rpb25zIHRvb1xuICAgIHRoaXMub3B0cyA9IHtcbiAgICAgIC4uLmRlZmF1bHRPcHRpb25zLFxuICAgICAgLi4ub3B0cyxcbiAgICAgIHJlc3RyaWN0aW9uczoge1xuICAgICAgICAuLi5kZWZhdWx0T3B0aW9ucy5yZXN0cmljdGlvbnMsXG4gICAgICAgIC4uLihvcHRzICYmIG9wdHMucmVzdHJpY3Rpb25zKSxcbiAgICAgIH0sXG4gICAgfVxuXG4gICAgLy8gU3VwcG9ydCBkZWJ1ZzogdHJ1ZSBmb3IgYmFja3dhcmRzLWNvbXBhdGFiaWxpdHksIHVubGVzcyBsb2dnZXIgaXMgc2V0IGluIG9wdHNcbiAgICAvLyBvcHRzIGluc3RlYWQgb2YgdGhpcy5vcHRzIHRvIGF2b2lkIGNvbXBhcmluZyBvYmplY3RzIOKAlCB3ZSBzZXQgbG9nZ2VyOiBqdXN0RXJyb3JzTG9nZ2VyIGluIGRlZmF1bHRPcHRpb25zXG4gICAgaWYgKG9wdHMgJiYgb3B0cy5sb2dnZXIgJiYgb3B0cy5kZWJ1Zykge1xuICAgICAgdGhpcy5sb2coJ1lvdSBhcmUgdXNpbmcgYSBjdXN0b20gYGxvZ2dlcmAsIGJ1dCBhbHNvIHNldCBgZGVidWc6IHRydWVgLCB3aGljaCB1c2VzIGJ1aWx0LWluIGxvZ2dlciB0byBvdXRwdXQgbG9ncyB0byBjb25zb2xlLiBJZ25vcmluZyBgZGVidWc6IHRydWVgIGFuZCB1c2luZyB5b3VyIGN1c3RvbSBgbG9nZ2VyYC4nLCAnd2FybmluZycpXG4gICAgfSBlbHNlIGlmIChvcHRzICYmIG9wdHMuZGVidWcpIHtcbiAgICAgIHRoaXMub3B0cy5sb2dnZXIgPSBkZWJ1Z0xvZ2dlclxuICAgIH1cblxuICAgIHRoaXMubG9nKGBVc2luZyBDb3JlIHYke3RoaXMuY29uc3RydWN0b3IuVkVSU0lPTn1gKVxuXG4gICAgaWYgKHRoaXMub3B0cy5yZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlc1xuICAgICAgICAmJiB0aGlzLm9wdHMucmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMgIT09IG51bGxcbiAgICAgICAgJiYgIUFycmF5LmlzQXJyYXkodGhpcy5vcHRzLnJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYHJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzYCBtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIC8vIF9fX1doeSB0aHJvdHRsZSBhdCA1MDBtcz9cbiAgICAvLyAgICAtIFdlIG11c3QgdGhyb3R0bGUgYXQgPjI1MG1zIGZvciBzdXBlcmZvY3VzIGluIERhc2hib2FyZCB0byB3b3JrIHdlbGxcbiAgICAvLyAgICAoYmVjYXVzZSBhbmltYXRpb24gdGFrZXMgMC4yNXMsIGFuZCB3ZSB3YW50IHRvIHdhaXQgZm9yIGFsbCBhbmltYXRpb25zIHRvIGJlIG92ZXIgYmVmb3JlIHJlZm9jdXNpbmcpLlxuICAgIC8vICAgIFtQcmFjdGljYWwgQ2hlY2tdOiBpZiB0aG90dGxlIGlzIGF0IDEwMG1zLCB0aGVuIGlmIHlvdSBhcmUgdXBsb2FkaW5nIGEgZmlsZSxcbiAgICAvLyAgICBhbmQgY2xpY2sgJ0FERCBNT1JFIEZJTEVTJywgLSBmb2N1cyB3b24ndCBhY3RpdmF0ZSBpbiBGaXJlZm94LlxuICAgIC8vICAgIC0gV2UgbXVzdCB0aHJvdHRsZSBhdCBhcm91bmQgPjUwMG1zIHRvIGF2b2lkIHBlcmZvcm1hbmNlIGxhZ3MuXG4gICAgLy8gICAgW1ByYWN0aWNhbCBDaGVja10gRmlyZWZveCwgdHJ5IHRvIHVwbG9hZCBhIGJpZyBmaWxlIGZvciBhIHByb2xvbmdlZCBwZXJpb2Qgb2YgdGltZS4gTGFwdG9wIHdpbGwgc3RhcnQgdG8gaGVhdCB1cC5cbiAgICB0aGlzLmNhbGN1bGF0ZVByb2dyZXNzID0gdGhyb3R0bGUodGhpcy5jYWxjdWxhdGVQcm9ncmVzcy5iaW5kKHRoaXMpLCA1MDAsIHsgbGVhZGluZzogdHJ1ZSwgdHJhaWxpbmc6IHRydWUgfSlcblxuICAgIHRoaXMuc3RvcmUgPSB0aGlzLm9wdHMuc3RvcmVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHBsdWdpbnM6IHt9LFxuICAgICAgZmlsZXM6IHt9LFxuICAgICAgY3VycmVudFVwbG9hZHM6IHt9LFxuICAgICAgYWxsb3dOZXdVcGxvYWQ6IHRydWUsXG4gICAgICBjYXBhYmlsaXRpZXM6IHtcbiAgICAgICAgdXBsb2FkUHJvZ3Jlc3M6IHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MoKSxcbiAgICAgICAgaW5kaXZpZHVhbENhbmNlbGxhdGlvbjogdHJ1ZSxcbiAgICAgICAgcmVzdW1hYmxlVXBsb2FkczogZmFsc2UsXG4gICAgICB9LFxuICAgICAgdG90YWxQcm9ncmVzczogMCxcbiAgICAgIG1ldGE6IHsgLi4udGhpcy5vcHRzLm1ldGEgfSxcbiAgICAgIGluZm86IFtdLFxuICAgICAgcmVjb3ZlcmVkU3RhdGU6IG51bGwsXG4gICAgfSlcblxuICAgIHRoaXMuI3N0b3JlVW5zdWJzY3JpYmUgPSB0aGlzLnN0b3JlLnN1YnNjcmliZSgocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoJ3N0YXRlLXVwZGF0ZScsIHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwYXRjaClcbiAgICAgIHRoaXMudXBkYXRlQWxsKG5leHRTdGF0ZSlcbiAgICB9KVxuXG4gICAgLy8gRXhwb3NpbmcgdXBweSBvYmplY3Qgb24gd2luZG93IGZvciBkZWJ1Z2dpbmcgYW5kIHRlc3RpbmdcbiAgICBpZiAodGhpcy5vcHRzLmRlYnVnICYmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3dbdGhpcy5vcHRzLmlkXSA9IHRoaXNcbiAgICB9XG5cbiAgICB0aGlzLiNhZGRMaXN0ZW5lcnMoKVxuICB9XG5cbiAgZW1pdCAoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLiNlbWl0dGVyLmVtaXQoZXZlbnQsIC4uLmFyZ3MpXG4gIH1cblxuICBvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy4jZW1pdHRlci5vbihldmVudCwgY2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG9uY2UgKGV2ZW50LCBjYWxsYmFjaykge1xuICAgIHRoaXMuI2VtaXR0ZXIub25jZShldmVudCwgY2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG9mZiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy4jZW1pdHRlci5vZmYoZXZlbnQsIGNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSBvbiBhbGwgcGx1Z2lucyBhbmQgcnVuIGB1cGRhdGVgIG9uIHRoZW0uXG4gICAqIENhbGxlZCBlYWNoIHRpbWUgc3RhdGUgY2hhbmdlcy5cbiAgICpcbiAgICovXG4gIHVwZGF0ZUFsbCAoc3RhdGUpIHtcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKHBsdWdpbiA9PiB7XG4gICAgICBwbHVnaW4udXBkYXRlKHN0YXRlKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBzdGF0ZSB3aXRoIGEgcGF0Y2hcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBhdGNoIHtmb286ICdiYXInfVxuICAgKi9cbiAgc2V0U3RhdGUgKHBhdGNoKSB7XG4gICAgdGhpcy5zdG9yZS5zZXRTdGF0ZShwYXRjaClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGN1cnJlbnQgc3RhdGUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAqL1xuICBnZXRTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIEJhY2sgY29tcGF0IGZvciB3aGVuIHVwcHkuc3RhdGUgaXMgdXNlZCBpbnN0ZWFkIG9mIHVwcHkuZ2V0U3RhdGUoKS5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCBzdGF0ZSAoKSB7XG4gICAgLy8gSGVyZSwgc3RhdGUgaXMgYSBub24tZW51bWVyYWJsZSBwcm9wZXJ0eS5cbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpXG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIHRvIHNldCBzdGF0ZSBmb3IgYSBzcGVjaWZpYyBmaWxlLlxuICAgKi9cbiAgc2V0RmlsZVN0YXRlIChmaWxlSUQsIHN0YXRlKSB7XG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW7igJl0IHNldCBzdGF0ZSBmb3IgJHtmaWxlSUR9ICh0aGUgZmlsZSBjb3VsZCBoYXZlIGJlZW4gcmVtb3ZlZClgKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHsgLi4udGhpcy5nZXRTdGF0ZSgpLmZpbGVzLCBbZmlsZUlEXTogeyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXSwgLi4uc3RhdGUgfSB9LFxuICAgIH0pXG4gIH1cblxuICBpMThuSW5pdCAoKSB7XG4gICAgY29uc3QgdHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKFt0aGlzLmRlZmF1bHRMb2NhbGUsIHRoaXMub3B0cy5sb2NhbGVdKVxuICAgIHRoaXMuaTE4biA9IHRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodHJhbnNsYXRvcilcbiAgICB0aGlzLmkxOG5BcnJheSA9IHRyYW5zbGF0b3IudHJhbnNsYXRlQXJyYXkuYmluZCh0cmFuc2xhdG9yKVxuICAgIHRoaXMubG9jYWxlID0gdHJhbnNsYXRvci5sb2NhbGVcbiAgfVxuXG4gIHNldE9wdGlvbnMgKG5ld09wdHMpIHtcbiAgICB0aGlzLm9wdHMgPSB7XG4gICAgICAuLi50aGlzLm9wdHMsXG4gICAgICAuLi5uZXdPcHRzLFxuICAgICAgcmVzdHJpY3Rpb25zOiB7XG4gICAgICAgIC4uLnRoaXMub3B0cy5yZXN0cmljdGlvbnMsXG4gICAgICAgIC4uLihuZXdPcHRzICYmIG5ld09wdHMucmVzdHJpY3Rpb25zKSxcbiAgICAgIH0sXG4gICAgfVxuXG4gICAgaWYgKG5ld09wdHMubWV0YSkge1xuICAgICAgdGhpcy5zZXRNZXRhKG5ld09wdHMubWV0YSlcbiAgICB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIGlmIChuZXdPcHRzLmxvY2FsZSkge1xuICAgICAgdGhpcy5pdGVyYXRlUGx1Z2lucygocGx1Z2luKSA9PiB7XG4gICAgICAgIHBsdWdpbi5zZXRPcHRpb25zKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gTm90ZTogdGhpcyBpcyBub3QgdGhlIHByZWFjdCBgc2V0U3RhdGVgLCBpdCdzIGFuIGludGVybmFsIGZ1bmN0aW9uIHRoYXQgaGFzIHRoZSBzYW1lIG5hbWUuXG4gICAgdGhpcy5zZXRTdGF0ZSgpIC8vIHNvIHRoYXQgVUkgcmUtcmVuZGVycyB3aXRoIG5ldyBvcHRpb25zXG4gIH1cblxuICByZXNldFByb2dyZXNzICgpIHtcbiAgICBjb25zdCBkZWZhdWx0UHJvZ3Jlc3MgPSB7XG4gICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgYnl0ZXNVcGxvYWRlZDogMCxcbiAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgIHVwbG9hZFN0YXJ0ZWQ6IG51bGwsXG4gICAgfVxuICAgIGNvbnN0IGZpbGVzID0geyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMgfVxuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IHt9XG4gICAgT2JqZWN0LmtleXMoZmlsZXMpLmZvckVhY2goZmlsZUlEID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0geyAuLi5maWxlc1tmaWxlSURdIH1cbiAgICAgIHVwZGF0ZWRGaWxlLnByb2dyZXNzID0geyAuLi51cGRhdGVkRmlsZS5wcm9ncmVzcywgLi4uZGVmYXVsdFByb2dyZXNzIH1cbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gdXBkYXRlZEZpbGVcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzLFxuICAgICAgdG90YWxQcm9ncmVzczogMCxcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdyZXNldC1wcm9ncmVzcycpXG4gIH1cblxuICBhZGRQcmVQcm9jZXNzb3IgKGZuKSB7XG4gICAgdGhpcy4jcHJlUHJvY2Vzc29ycy5hZGQoZm4pXG4gIH1cblxuICByZW1vdmVQcmVQcm9jZXNzb3IgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuI3ByZVByb2Nlc3NvcnMuZGVsZXRlKGZuKVxuICB9XG5cbiAgYWRkUG9zdFByb2Nlc3NvciAoZm4pIHtcbiAgICB0aGlzLiNwb3N0UHJvY2Vzc29ycy5hZGQoZm4pXG4gIH1cblxuICByZW1vdmVQb3N0UHJvY2Vzc29yIChmbikge1xuICAgIHJldHVybiB0aGlzLiNwb3N0UHJvY2Vzc29ycy5kZWxldGUoZm4pXG4gIH1cblxuICBhZGRVcGxvYWRlciAoZm4pIHtcbiAgICB0aGlzLiN1cGxvYWRlcnMuYWRkKGZuKVxuICB9XG5cbiAgcmVtb3ZlVXBsb2FkZXIgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuI3VwbG9hZGVycy5kZWxldGUoZm4pXG4gIH1cblxuICBzZXRNZXRhIChkYXRhKSB7XG4gICAgY29uc3QgdXBkYXRlZE1ldGEgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5tZXRhLCAuLi5kYXRhIH1cbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5maWxlcyB9XG5cbiAgICBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZvckVhY2goKGZpbGVJRCkgPT4ge1xuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB7IC4uLnVwZGF0ZWRGaWxlc1tmaWxlSURdLCBtZXRhOiB7IC4uLnVwZGF0ZWRGaWxlc1tmaWxlSURdLm1ldGEsIC4uLmRhdGEgfSB9XG4gICAgfSlcblxuICAgIHRoaXMubG9nKCdBZGRpbmcgbWV0YWRhdGE6JylcbiAgICB0aGlzLmxvZyhkYXRhKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtZXRhOiB1cGRhdGVkTWV0YSxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXMsXG4gICAgfSlcbiAgfVxuXG4gIHNldEZpbGVNZXRhIChmaWxlSUQsIGRhdGEpIHtcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5maWxlcyB9XG4gICAgaWYgKCF1cGRhdGVkRmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhpcy5sb2coJ1dhcyB0cnlpbmcgdG8gc2V0IG1ldGFkYXRhIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAnLCBmaWxlSUQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgbmV3TWV0YSA9IHsgLi4udXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgLi4uZGF0YSB9XG4gICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB7IC4uLnVwZGF0ZWRGaWxlc1tmaWxlSURdLCBtZXRhOiBuZXdNZXRhIH1cbiAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IHVwZGF0ZWRGaWxlcyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGZpbGUgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlEIFRoZSBJRCBvZiB0aGUgZmlsZSBvYmplY3QgdG8gcmV0dXJuLlxuICAgKi9cbiAgZ2V0RmlsZSAoZmlsZUlEKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBmaWxlcyBpbiBhbiBhcnJheS5cbiAgICovXG4gIGdldEZpbGVzICgpIHtcbiAgICBjb25zdCB7IGZpbGVzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhmaWxlcylcbiAgfVxuXG4gIGdldE9iamVjdE9mRmlsZXNQZXJTdGF0ZSAoKSB7XG4gICAgY29uc3QgeyBmaWxlczogZmlsZXNPYmplY3QsIHRvdGFsUHJvZ3Jlc3MsIGVycm9yIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBjb25zdCBmaWxlcyA9IE9iamVjdC52YWx1ZXMoZmlsZXNPYmplY3QpXG4gICAgY29uc3QgaW5Qcm9ncmVzc0ZpbGVzID0gZmlsZXMuZmlsdGVyKCh7IHByb2dyZXNzIH0pID0+ICFwcm9ncmVzcy51cGxvYWRDb21wbGV0ZSAmJiBwcm9ncmVzcy51cGxvYWRTdGFydGVkKVxuICAgIGNvbnN0IG5ld0ZpbGVzID0gIGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gIWZpbGUucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZClcbiAgICBjb25zdCBzdGFydGVkRmlsZXMgPSBmaWxlcy5maWx0ZXIoXG4gICAgICBmaWxlID0+IGZpbGUucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZCB8fCBmaWxlLnByb2dyZXNzLnByZXByb2Nlc3MgfHwgZmlsZS5wcm9ncmVzcy5wb3N0cHJvY2VzcyxcbiAgICApXG4gICAgY29uc3QgdXBsb2FkU3RhcnRlZEZpbGVzID0gZmlsZXMuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQpXG4gICAgY29uc3QgcGF1c2VkRmlsZXMgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUuaXNQYXVzZWQpXG4gICAgY29uc3QgY29tcGxldGVGaWxlcyA9IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gZmlsZS5wcm9ncmVzcy51cGxvYWRDb21wbGV0ZSlcbiAgICBjb25zdCBlcnJvcmVkRmlsZXMgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUuZXJyb3IpXG4gICAgY29uc3QgaW5Qcm9ncmVzc05vdFBhdXNlZEZpbGVzID0gaW5Qcm9ncmVzc0ZpbGVzLmZpbHRlcigoZmlsZSkgPT4gIWZpbGUuaXNQYXVzZWQpXG4gICAgY29uc3QgcHJvY2Vzc2luZ0ZpbGVzID0gZmlsZXMuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLnByZXByb2Nlc3MgfHwgZmlsZS5wcm9ncmVzcy5wb3N0cHJvY2VzcylcblxuICAgIHJldHVybiB7XG4gICAgICBuZXdGaWxlcyxcbiAgICAgIHN0YXJ0ZWRGaWxlcyxcbiAgICAgIHVwbG9hZFN0YXJ0ZWRGaWxlcyxcbiAgICAgIHBhdXNlZEZpbGVzLFxuICAgICAgY29tcGxldGVGaWxlcyxcbiAgICAgIGVycm9yZWRGaWxlcyxcbiAgICAgIGluUHJvZ3Jlc3NGaWxlcyxcbiAgICAgIGluUHJvZ3Jlc3NOb3RQYXVzZWRGaWxlcyxcbiAgICAgIHByb2Nlc3NpbmdGaWxlcyxcblxuICAgICAgaXNVcGxvYWRTdGFydGVkOiB1cGxvYWRTdGFydGVkRmlsZXMubGVuZ3RoID4gMCxcbiAgICAgIGlzQWxsQ29tcGxldGU6IHRvdGFsUHJvZ3Jlc3MgPT09IDEwMFxuICAgICAgICAmJiBjb21wbGV0ZUZpbGVzLmxlbmd0aCA9PT0gZmlsZXMubGVuZ3RoXG4gICAgICAgICYmIHByb2Nlc3NpbmdGaWxlcy5sZW5ndGggPT09IDAsXG4gICAgICBpc0FsbEVycm9yZWQ6ICEhZXJyb3IgJiYgZXJyb3JlZEZpbGVzLmxlbmd0aCA9PT0gZmlsZXMubGVuZ3RoLFxuICAgICAgaXNBbGxQYXVzZWQ6IGluUHJvZ3Jlc3NGaWxlcy5sZW5ndGggIT09IDAgJiYgcGF1c2VkRmlsZXMubGVuZ3RoID09PSBpblByb2dyZXNzRmlsZXMubGVuZ3RoLFxuICAgICAgaXNVcGxvYWRJblByb2dyZXNzOiBpblByb2dyZXNzRmlsZXMubGVuZ3RoID4gMCxcbiAgICAgIGlzU29tZUdob3N0OiBmaWxlcy5zb21lKGZpbGUgPT4gZmlsZS5pc0dob3N0KSxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBwdWJsaWMgd3JhcHBlciBmb3IgX2NoZWNrUmVzdHJpY3Rpb25zIOKAlCBjaGVja3MgaWYgYSBmaWxlIHBhc3NlcyBhIHNldCBvZiByZXN0cmljdGlvbnMuXG4gICAqIEZvciB1c2UgaW4gVUkgcGx1aWdpbnMgKGxpa2UgUHJvdmlkZXJzKSwgdG8gZGlzYWxsb3cgc2VsZWN0aW5nIGZpbGVzIHRoYXQgd29u4oCZdCBwYXNzIHJlc3RyaWN0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGZpbGUgb2JqZWN0IHRvIGNoZWNrXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtmaWxlc10gYXJyYXkgdG8gY2hlY2sgbWF4TnVtYmVyT2ZGaWxlcyBhbmQgbWF4VG90YWxGaWxlU2l6ZVxuICAgKiBAcmV0dXJucyB7b2JqZWN0fSB7IHJlc3VsdDogdHJ1ZS9mYWxzZSwgcmVhc29uOiB3aHkgZmlsZSBkaWRu4oCZdCBwYXNzIHJlc3RyaWN0aW9ucyB9XG4gICAqL1xuICB2YWxpZGF0ZVJlc3RyaWN0aW9ucyAoZmlsZSwgZmlsZXMpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy4jY2hlY2tSZXN0cmljdGlvbnMoZmlsZSwgZmlsZXMpXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN1bHQ6IHRydWUsXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN1bHQ6IGZhbHNlLFxuICAgICAgICByZWFzb246IGVyci5tZXNzYWdlLFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBmaWxlIHBhc3NlcyBhIHNldCBvZiByZXN0cmljdGlvbnMgc2V0IGluIG9wdGlvbnM6IG1heEZpbGVTaXplLCBtaW5GaWxlU2l6ZSxcbiAgICogbWF4TnVtYmVyT2ZGaWxlcyBhbmQgYWxsb3dlZEZpbGVUeXBlcy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGZpbGUgb2JqZWN0IHRvIGNoZWNrXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtmaWxlc10gYXJyYXkgdG8gY2hlY2sgbWF4TnVtYmVyT2ZGaWxlcyBhbmQgbWF4VG90YWxGaWxlU2l6ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI2NoZWNrUmVzdHJpY3Rpb25zIChmaWxlLCBmaWxlcyA9IHRoaXMuZ2V0RmlsZXMoKSkge1xuICAgIGNvbnN0IHsgbWF4RmlsZVNpemUsIG1pbkZpbGVTaXplLCBtYXhUb3RhbEZpbGVTaXplLCBtYXhOdW1iZXJPZkZpbGVzLCBhbGxvd2VkRmlsZVR5cGVzIH0gPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zXG5cbiAgICBpZiAobWF4TnVtYmVyT2ZGaWxlcykge1xuICAgICAgaWYgKGZpbGVzLmxlbmd0aCArIDEgPiBtYXhOdW1iZXJPZkZpbGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBSZXN0cmljdGlvbkVycm9yKGAke3RoaXMuaTE4bigneW91Q2FuT25seVVwbG9hZFgnLCB7IHNtYXJ0X2NvdW50OiBtYXhOdW1iZXJPZkZpbGVzIH0pfWApXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFsbG93ZWRGaWxlVHlwZXMpIHtcbiAgICAgIGNvbnN0IGlzQ29ycmVjdEZpbGVUeXBlID0gYWxsb3dlZEZpbGVUeXBlcy5zb21lKCh0eXBlKSA9PiB7XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoaXMgaXMgYSBtaW1lLXR5cGVcbiAgICAgICAgaWYgKHR5cGUuaW5kZXhPZignLycpID4gLTEpIHtcbiAgICAgICAgICBpZiAoIWZpbGUudHlwZSkgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgcmV0dXJuIG1hdGNoKGZpbGUudHlwZS5yZXBsYWNlKC87Lio/JC8sICcnKSwgdHlwZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGlzIGlzIGxpa2VseSBhbiBleHRlbnNpb25cbiAgICAgICAgaWYgKHR5cGVbMF0gPT09ICcuJyAmJiBmaWxlLmV4dGVuc2lvbikge1xuICAgICAgICAgIHJldHVybiBmaWxlLmV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSB0eXBlLnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9KVxuXG4gICAgICBpZiAoIWlzQ29ycmVjdEZpbGVUeXBlKSB7XG4gICAgICAgIGNvbnN0IGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgPSBhbGxvd2VkRmlsZVR5cGVzLmpvaW4oJywgJylcbiAgICAgICAgdGhyb3cgbmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCd5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzJywgeyB0eXBlczogYWxsb3dlZEZpbGVUeXBlc1N0cmluZyB9KSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBjYW4ndCBjaGVjayBtYXhUb3RhbEZpbGVTaXplIGlmIHRoZSBzaXplIGlzIHVua25vd24uXG4gICAgaWYgKG1heFRvdGFsRmlsZVNpemUgJiYgZmlsZS5zaXplICE9IG51bGwpIHtcbiAgICAgIGxldCB0b3RhbEZpbGVzU2l6ZSA9IDBcbiAgICAgIHRvdGFsRmlsZXNTaXplICs9IGZpbGUuc2l6ZVxuICAgICAgZmlsZXMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgICB0b3RhbEZpbGVzU2l6ZSArPSBmLnNpemVcbiAgICAgIH0pXG4gICAgICBpZiAodG90YWxGaWxlc1NpemUgPiBtYXhUb3RhbEZpbGVTaXplKSB7XG4gICAgICAgIHRocm93IG5ldyBSZXN0cmljdGlvbkVycm9yKHRoaXMuaTE4bignZXhjZWVkc1NpemUnLCB7XG4gICAgICAgICAgc2l6ZTogcHJldHRpZXJCeXRlcyhtYXhUb3RhbEZpbGVTaXplKSxcbiAgICAgICAgICBmaWxlOiBmaWxlLm5hbWUsXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdlIGNhbid0IGNoZWNrIG1heEZpbGVTaXplIGlmIHRoZSBzaXplIGlzIHVua25vd24uXG4gICAgaWYgKG1heEZpbGVTaXplICYmIGZpbGUuc2l6ZSAhPSBudWxsKSB7XG4gICAgICBpZiAoZmlsZS5zaXplID4gbWF4RmlsZVNpemUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCdleGNlZWRzU2l6ZScsIHtcbiAgICAgICAgICBzaXplOiBwcmV0dGllckJ5dGVzKG1heEZpbGVTaXplKSxcbiAgICAgICAgICBmaWxlOiBmaWxlLm5hbWUsXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdlIGNhbid0IGNoZWNrIG1pbkZpbGVTaXplIGlmIHRoZSBzaXplIGlzIHVua25vd24uXG4gICAgaWYgKG1pbkZpbGVTaXplICYmIGZpbGUuc2l6ZSAhPSBudWxsKSB7XG4gICAgICBpZiAoZmlsZS5zaXplIDwgbWluRmlsZVNpemUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCdpbmZlcmlvclNpemUnLCB7XG4gICAgICAgICAgc2l6ZTogcHJldHRpZXJCeXRlcyhtaW5GaWxlU2l6ZSksXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBtaW5OdW1iZXJPZkZpbGVzIHJlc3RyaWN0aW9uIGlzIHJlYWNoZWQgYmVmb3JlIHVwbG9hZGluZy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gICNjaGVja01pbk51bWJlck9mRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3QgeyBtaW5OdW1iZXJPZkZpbGVzIH0gPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zXG4gICAgaWYgKE9iamVjdC5rZXlzKGZpbGVzKS5sZW5ndGggPCBtaW5OdW1iZXJPZkZpbGVzKSB7XG4gICAgICB0aHJvdyBuZXcgUmVzdHJpY3Rpb25FcnJvcihgJHt0aGlzLmkxOG4oJ3lvdUhhdmVUb0F0TGVhc3RTZWxlY3RYJywgeyBzbWFydF9jb3VudDogbWluTnVtYmVyT2ZGaWxlcyB9KX1gKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiByZXF1aXJlZE1ldGFGaWVsZCByZXN0cmljdGlvbiBpcyBtZXQgZm9yIGEgc3BlY2lmaWMgZmlsZS5cbiAgICpcbiAgICovXG4gICNjaGVja1JlcXVpcmVkTWV0YUZpZWxkc09uRmlsZSAoZmlsZSkge1xuICAgIGNvbnN0IHsgcmVxdWlyZWRNZXRhRmllbGRzIH0gPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zXG4gICAgY29uc3QgeyBoYXNPd25Qcm9wZXJ0eSB9ID0gT2JqZWN0LnByb3RvdHlwZVxuXG4gICAgY29uc3QgZXJyb3JzID0gW11cbiAgICBjb25zdCBtaXNzaW5nRmllbGRzID0gW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcXVpcmVkTWV0YUZpZWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKGZpbGUubWV0YSwgcmVxdWlyZWRNZXRhRmllbGRzW2ldKSB8fCBmaWxlLm1ldGFbcmVxdWlyZWRNZXRhRmllbGRzW2ldXSA9PT0gJycpIHtcbiAgICAgICAgY29uc3QgZXJyID0gbmV3IFJlc3RyaWN0aW9uRXJyb3IoYCR7dGhpcy5pMThuKCdtaXNzaW5nUmVxdWlyZWRNZXRhRmllbGRPbkZpbGUnLCB7IGZpbGVOYW1lOiBmaWxlLm5hbWUgfSl9YClcbiAgICAgICAgZXJyb3JzLnB1c2goZXJyKVxuICAgICAgICBtaXNzaW5nRmllbGRzLnB1c2gocmVxdWlyZWRNZXRhRmllbGRzW2ldKVxuICAgICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KGVyciwgeyBmaWxlLCBzaG93SW5mb3JtZXI6IGZhbHNlLCB0aHJvd0VycjogZmFsc2UgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwgeyBtaXNzaW5nUmVxdWlyZWRNZXRhRmllbGRzOiBtaXNzaW5nRmllbGRzIH0pXG4gICAgcmV0dXJuIGVycm9yc1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHJlcXVpcmVkTWV0YUZpZWxkIHJlc3RyaWN0aW9uIGlzIG1ldCBiZWZvcmUgdXBsb2FkaW5nLlxuICAgKlxuICAgKi9cbiAgI2NoZWNrUmVxdWlyZWRNZXRhRmllbGRzIChmaWxlcykge1xuICAgIGNvbnN0IGVycm9ycyA9IE9iamVjdC5rZXlzKGZpbGVzKS5mbGF0TWFwKChmaWxlSUQpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmdldEZpbGUoZmlsZUlEKVxuICAgICAgcmV0dXJuIHRoaXMuI2NoZWNrUmVxdWlyZWRNZXRhRmllbGRzT25GaWxlKGZpbGUpXG4gICAgfSlcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgQWdncmVnYXRlUmVzdHJpY3Rpb25FcnJvcihlcnJvcnMsIGAke3RoaXMuaTE4bignbWlzc2luZ1JlcXVpcmVkTWV0YUZpZWxkJyl9YClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBhbiBlcnJvciwgc2V0cyBJbmZvcm1lciBtZXNzYWdlLCB0aGVuIHRocm93cyB0aGUgZXJyb3IuXG4gICAqIEVtaXRzIGEgJ3Jlc3RyaWN0aW9uLWZhaWxlZCcgZXZlbnQgaWYgaXTigJlzIGEgcmVzdHJpY3Rpb24gZXJyb3JcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3QgfCBzdHJpbmd9IGVyciDigJQgRXJyb3Igb2JqZWN0IG9yIHBsYWluIHN0cmluZyBtZXNzYWdlXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zaG93SW5mb3JtZXI9dHJ1ZV0g4oCUIFNvbWV0aW1lcyBkZXZlbG9wZXIgbWlnaHQgd2FudCB0byBzaG93IEluZm9ybWVyIG1hbnVhbGx5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5maWxlPW51bGxdIOKAlCBGaWxlIG9iamVjdCB1c2VkIHRvIGVtaXQgdGhlIHJlc3RyaWN0aW9uIGVycm9yXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudGhyb3dFcnI9dHJ1ZV0g4oCUIEVycm9ycyBzaG91bGRu4oCZdCBiZSB0aHJvd24sIGZvciBleGFtcGxlLCBpbiBgdXBsb2FkLWVycm9yYCBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI3Nob3dPckxvZ0Vycm9yQW5kVGhyb3cgKGVyciwgeyBzaG93SW5mb3JtZXIgPSB0cnVlLCBmaWxlID0gbnVsbCwgdGhyb3dFcnIgPSB0cnVlIH0gPSB7fSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgZXJyID09PSAnb2JqZWN0JyA/IGVyci5tZXNzYWdlIDogZXJyXG4gICAgY29uc3QgZGV0YWlscyA9ICh0eXBlb2YgZXJyID09PSAnb2JqZWN0JyAmJiBlcnIuZGV0YWlscykgPyBlcnIuZGV0YWlscyA6ICcnXG5cbiAgICAvLyBSZXN0cmljdGlvbiBlcnJvcnMgc2hvdWxkIGJlIGxvZ2dlZCwgYnV0IG5vdCBhcyBlcnJvcnMsXG4gICAgLy8gYXMgdGhleSBhcmUgZXhwZWN0ZWQgYW5kIHNob3duIGluIHRoZSBVSS5cbiAgICBsZXQgbG9nTWVzc2FnZVdpdGhEZXRhaWxzID0gbWVzc2FnZVxuICAgIGlmIChkZXRhaWxzKSB7XG4gICAgICBsb2dNZXNzYWdlV2l0aERldGFpbHMgKz0gYCAke2RldGFpbHN9YFxuICAgIH1cbiAgICBpZiAoZXJyLmlzUmVzdHJpY3Rpb24pIHtcbiAgICAgIHRoaXMubG9nKGxvZ01lc3NhZ2VXaXRoRGV0YWlscylcbiAgICAgIHRoaXMuZW1pdCgncmVzdHJpY3Rpb24tZmFpbGVkJywgZmlsZSwgZXJyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZyhsb2dNZXNzYWdlV2l0aERldGFpbHMsICdlcnJvcicpXG4gICAgfVxuXG4gICAgLy8gU29tZXRpbWVzIGluZm9ybWVyIGhhcyB0byBiZSBzaG93biBtYW51YWxseSBieSB0aGUgZGV2ZWxvcGVyLFxuICAgIC8vIGZvciBleGFtcGxlLCBpbiBgb25CZWZvcmVGaWxlQWRkZWRgLlxuICAgIGlmIChzaG93SW5mb3JtZXIpIHtcbiAgICAgIHRoaXMuaW5mbyh7IG1lc3NhZ2UsIGRldGFpbHMgfSwgJ2Vycm9yJywgdGhpcy5vcHRzLmluZm9UaW1lb3V0KVxuICAgIH1cblxuICAgIGlmICh0aHJvd0Vycikge1xuICAgICAgdGhyb3cgKHR5cGVvZiBlcnIgPT09ICdvYmplY3QnID8gZXJyIDogbmV3IEVycm9yKGVycikpXG4gICAgfVxuICB9XG5cbiAgI2Fzc2VydE5ld1VwbG9hZEFsbG93ZWQgKGZpbGUpIHtcbiAgICBjb25zdCB7IGFsbG93TmV3VXBsb2FkIH0gPSB0aGlzLmdldFN0YXRlKClcblxuICAgIGlmIChhbGxvd05ld1VwbG9hZCA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuI3Nob3dPckxvZ0Vycm9yQW5kVGhyb3cobmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCdub01vcmVGaWxlc0FsbG93ZWQnKSksIHsgZmlsZSB9KVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrSWZGaWxlQWxyZWFkeUV4aXN0cyAoZmlsZUlEKSB7XG4gICAgY29uc3QgeyBmaWxlcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG5cbiAgICBpZiAoZmlsZXNbZmlsZUlEXSAmJiAhZmlsZXNbZmlsZUlEXS5pc0dob3N0KSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBmaWxlIHN0YXRlIG9iamVjdCBiYXNlZCBvbiB1c2VyLXByb3ZpZGVkIGBhZGRGaWxlKClgIG9wdGlvbnMuXG4gICAqXG4gICAqIE5vdGUgdGhpcyBpcyBleHRyZW1lbHkgc2lkZS1lZmZlY3RmdWwgYW5kIHNob3VsZCBvbmx5IGJlIGRvbmUgd2hlbiBhIGZpbGUgc3RhdGUgb2JqZWN0XG4gICAqIHdpbGwgYmUgYWRkZWQgdG8gc3RhdGUgaW1tZWRpYXRlbHkgYWZ0ZXJ3YXJkIVxuICAgKlxuICAgKiBUaGUgYGZpbGVzYCB2YWx1ZSBpcyBwYXNzZWQgaW4gYmVjYXVzZSBpdCBtYXkgYmUgdXBkYXRlZCBieSB0aGUgY2FsbGVyIHdpdGhvdXQgdXBkYXRpbmcgdGhlIHN0b3JlLlxuICAgKi9cbiAgI2NoZWNrQW5kQ3JlYXRlRmlsZVN0YXRlT2JqZWN0IChmaWxlcywgZmlsZURlc2NyaXB0b3IpIHtcbiAgICBjb25zdCBmaWxlVHlwZSA9IGdldEZpbGVUeXBlKGZpbGVEZXNjcmlwdG9yKVxuICAgIGNvbnN0IGZpbGVOYW1lID0gZ2V0RmlsZU5hbWUoZmlsZVR5cGUsIGZpbGVEZXNjcmlwdG9yKVxuICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlTmFtZSkuZXh0ZW5zaW9uXG4gICAgY29uc3QgaXNSZW1vdGUgPSBCb29sZWFuKGZpbGVEZXNjcmlwdG9yLmlzUmVtb3RlKVxuICAgIGNvbnN0IGZpbGVJRCA9IGdlbmVyYXRlRmlsZUlEKHtcbiAgICAgIC4uLmZpbGVEZXNjcmlwdG9yLFxuICAgICAgdHlwZTogZmlsZVR5cGUsXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmNoZWNrSWZGaWxlQWxyZWFkeUV4aXN0cyhmaWxlSUQpKSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBSZXN0cmljdGlvbkVycm9yKHRoaXMuaTE4bignbm9EdXBsaWNhdGVzJywgeyBmaWxlTmFtZSB9KSlcbiAgICAgIHRoaXMuI3Nob3dPckxvZ0Vycm9yQW5kVGhyb3coZXJyb3IsIHsgZmlsZTogZmlsZURlc2NyaXB0b3IgfSlcbiAgICB9XG5cbiAgICBjb25zdCBtZXRhID0gZmlsZURlc2NyaXB0b3IubWV0YSB8fCB7fVxuICAgIG1ldGEubmFtZSA9IGZpbGVOYW1lXG4gICAgbWV0YS50eXBlID0gZmlsZVR5cGVcblxuICAgIC8vIGBudWxsYCBtZWFucyB0aGUgc2l6ZSBpcyB1bmtub3duLlxuICAgIGNvbnN0IHNpemUgPSBOdW1iZXIuaXNGaW5pdGUoZmlsZURlc2NyaXB0b3IuZGF0YS5zaXplKSA/IGZpbGVEZXNjcmlwdG9yLmRhdGEuc2l6ZSA6IG51bGxcblxuICAgIGxldCBuZXdGaWxlID0ge1xuICAgICAgc291cmNlOiBmaWxlRGVzY3JpcHRvci5zb3VyY2UgfHwgJycsXG4gICAgICBpZDogZmlsZUlELFxuICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICBleHRlbnNpb246IGZpbGVFeHRlbnNpb24gfHwgJycsXG4gICAgICBtZXRhOiB7XG4gICAgICAgIC4uLnRoaXMuZ2V0U3RhdGUoKS5tZXRhLFxuICAgICAgICAuLi5tZXRhLFxuICAgICAgfSxcbiAgICAgIHR5cGU6IGZpbGVUeXBlLFxuICAgICAgZGF0YTogZmlsZURlc2NyaXB0b3IuZGF0YSxcbiAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICAgIGJ5dGVzVG90YWw6IHNpemUsXG4gICAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgdXBsb2FkU3RhcnRlZDogbnVsbCxcbiAgICAgIH0sXG4gICAgICBzaXplLFxuICAgICAgaXNSZW1vdGUsXG4gICAgICByZW1vdGU6IGZpbGVEZXNjcmlwdG9yLnJlbW90ZSB8fCAnJyxcbiAgICAgIHByZXZpZXc6IGZpbGVEZXNjcmlwdG9yLnByZXZpZXcsXG4gICAgfVxuXG4gICAgY29uc3Qgb25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPSB0aGlzLm9wdHMub25CZWZvcmVGaWxlQWRkZWQobmV3RmlsZSwgZmlsZXMpXG5cbiAgICBpZiAob25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAvLyBEb27igJl0IHNob3cgVUkgaW5mbyBmb3IgdGhpcyBlcnJvciwgYXMgaXQgc2hvdWxkIGJlIGRvbmUgYnkgdGhlIGRldmVsb3BlclxuICAgICAgdGhpcy4jc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhuZXcgUmVzdHJpY3Rpb25FcnJvcignQ2Fubm90IGFkZCB0aGUgZmlsZSBiZWNhdXNlIG9uQmVmb3JlRmlsZUFkZGVkIHJldHVybmVkIGZhbHNlLicpLCB7IHNob3dJbmZvcm1lcjogZmFsc2UsIGZpbGVEZXNjcmlwdG9yIH0pXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPT09ICdvYmplY3QnICYmIG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICBuZXdGaWxlID0gb25CZWZvcmVGaWxlQWRkZWRSZXN1bHRcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXNBcnJheSA9IE9iamVjdC5rZXlzKGZpbGVzKS5tYXAoaSA9PiBmaWxlc1tpXSlcbiAgICAgIHRoaXMuI2NoZWNrUmVzdHJpY3Rpb25zKG5ld0ZpbGUsIGZpbGVzQXJyYXkpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KGVyciwgeyBmaWxlOiBuZXdGaWxlIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld0ZpbGVcbiAgfVxuXG4gIC8vIFNjaGVkdWxlIGFuIHVwbG9hZCBpZiBgYXV0b1Byb2NlZWRgIGlzIGVuYWJsZWQuXG4gICNzdGFydElmQXV0b1Byb2NlZWQgKCkge1xuICAgIGlmICh0aGlzLm9wdHMuYXV0b1Byb2NlZWQgJiYgIXRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZWRBdXRvUHJvY2VlZCA9IG51bGxcbiAgICAgICAgdGhpcy51cGxvYWQoKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKCFlcnIuaXNSZXN0cmljdGlvbikge1xuICAgICAgICAgICAgdGhpcy5sb2coZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlIHx8IGVycilcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9LCA0KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBuZXcgZmlsZSB0byBgc3RhdGUuZmlsZXNgLiBUaGlzIHdpbGwgcnVuIGBvbkJlZm9yZUZpbGVBZGRlZGAsXG4gICAqIHRyeSB0byBndWVzcyBmaWxlIHR5cGUgaW4gYSBjbGV2ZXIgd2F5LCBjaGVjayBmaWxlIGFnYWluc3QgcmVzdHJpY3Rpb25zLFxuICAgKiBhbmQgc3RhcnQgYW4gdXBsb2FkIGlmIGBhdXRvUHJvY2VlZCA9PT0gdHJ1ZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlIG9iamVjdCB0byBhZGRcbiAgICogQHJldHVybnMge3N0cmluZ30gaWQgZm9yIHRoZSBhZGRlZCBmaWxlXG4gICAqL1xuICBhZGRGaWxlIChmaWxlKSB7XG4gICAgdGhpcy4jYXNzZXJ0TmV3VXBsb2FkQWxsb3dlZChmaWxlKVxuXG4gICAgY29uc3QgeyBmaWxlcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgbGV0IG5ld0ZpbGUgPSB0aGlzLiNjaGVja0FuZENyZWF0ZUZpbGVTdGF0ZU9iamVjdChmaWxlcywgZmlsZSlcblxuICAgIC8vIFVzZXJzIGFyZSBhc2tlZCB0byByZS1zZWxlY3QgcmVjb3ZlcmVkIGZpbGVzIHdpdGhvdXQgZGF0YSxcbiAgICAvLyBhbmQgdG8ga2VlcCB0aGUgcHJvZ3Jlc3MsIG1ldGEgYW5kIGV2ZXJ0aGluZyBlbHNlLCB3ZSBvbmx5IHJlcGxhY2Ugc2FpZCBkYXRhXG4gICAgaWYgKGZpbGVzW25ld0ZpbGUuaWRdICYmIGZpbGVzW25ld0ZpbGUuaWRdLmlzR2hvc3QpIHtcbiAgICAgIG5ld0ZpbGUgPSB7XG4gICAgICAgIC4uLmZpbGVzW25ld0ZpbGUuaWRdLFxuICAgICAgICBkYXRhOiBmaWxlLmRhdGEsXG4gICAgICAgIGlzR2hvc3Q6IGZhbHNlLFxuICAgICAgfVxuICAgICAgdGhpcy5sb2coYFJlcGxhY2VkIHRoZSBibG9iIGluIHRoZSByZXN0b3JlZCBnaG9zdCBmaWxlOiAke25ld0ZpbGUubmFtZX0sICR7bmV3RmlsZS5pZH1gKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgLi4uZmlsZXMsXG4gICAgICAgIFtuZXdGaWxlLmlkXTogbmV3RmlsZSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgnZmlsZS1hZGRlZCcsIG5ld0ZpbGUpXG4gICAgdGhpcy5lbWl0KCdmaWxlcy1hZGRlZCcsIFtuZXdGaWxlXSlcbiAgICB0aGlzLmxvZyhgQWRkZWQgZmlsZTogJHtuZXdGaWxlLm5hbWV9LCAke25ld0ZpbGUuaWR9LCBtaW1lIHR5cGU6ICR7bmV3RmlsZS50eXBlfWApXG5cbiAgICB0aGlzLiNzdGFydElmQXV0b1Byb2NlZWQoKVxuXG4gICAgcmV0dXJuIG5ld0ZpbGUuaWRcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgbXVsdGlwbGUgZmlsZXMgdG8gYHN0YXRlLmZpbGVzYC4gU2VlIHRoZSBgYWRkRmlsZSgpYCBkb2N1bWVudGF0aW9uLlxuICAgKlxuICAgKiBJZiBhbiBlcnJvciBvY2N1cnMgd2hpbGUgYWRkaW5nIGEgZmlsZSwgaXQgaXMgbG9nZ2VkIGFuZCB0aGUgdXNlciBpcyBub3RpZmllZC5cbiAgICogVGhpcyBpcyBnb29kIGZvciBVSSBwbHVnaW5zLCBidXQgbm90IGZvciBwcm9ncmFtbWF0aWMgdXNlLlxuICAgKiBQcm9ncmFtbWF0aWMgdXNlcnMgc2hvdWxkIHVzdWFsbHkgc3RpbGwgdXNlIGBhZGRGaWxlKClgIG9uIGluZGl2aWR1YWwgZmlsZXMuXG4gICAqL1xuICBhZGRGaWxlcyAoZmlsZURlc2NyaXB0b3JzKSB7XG4gICAgdGhpcy4jYXNzZXJ0TmV3VXBsb2FkQWxsb3dlZCgpXG5cbiAgICAvLyBjcmVhdGUgYSBjb3B5IG9mIHRoZSBmaWxlcyBvYmplY3Qgb25seSBvbmNlXG4gICAgY29uc3QgZmlsZXMgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5maWxlcyB9XG4gICAgY29uc3QgbmV3RmlsZXMgPSBbXVxuICAgIGNvbnN0IGVycm9ycyA9IFtdXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlRGVzY3JpcHRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBuZXdGaWxlID0gdGhpcy4jY2hlY2tBbmRDcmVhdGVGaWxlU3RhdGVPYmplY3QoZmlsZXMsIGZpbGVEZXNjcmlwdG9yc1tpXSlcbiAgICAgICAgLy8gVXNlcnMgYXJlIGFza2VkIHRvIHJlLXNlbGVjdCByZWNvdmVyZWQgZmlsZXMgd2l0aG91dCBkYXRhLFxuICAgICAgICAvLyBhbmQgdG8ga2VlcCB0aGUgcHJvZ3Jlc3MsIG1ldGEgYW5kIGV2ZXJ0aGluZyBlbHNlLCB3ZSBvbmx5IHJlcGxhY2Ugc2FpZCBkYXRhXG4gICAgICAgIGlmIChmaWxlc1tuZXdGaWxlLmlkXSAmJiBmaWxlc1tuZXdGaWxlLmlkXS5pc0dob3N0KSB7XG4gICAgICAgICAgbmV3RmlsZSA9IHtcbiAgICAgICAgICAgIC4uLmZpbGVzW25ld0ZpbGUuaWRdLFxuICAgICAgICAgICAgZGF0YTogZmlsZURlc2NyaXB0b3JzW2ldLmRhdGEsXG4gICAgICAgICAgICBpc0dob3N0OiBmYWxzZSxcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sb2coYFJlcGxhY2VkIGJsb2IgaW4gYSBnaG9zdCBmaWxlOiAke25ld0ZpbGUubmFtZX0sICR7bmV3RmlsZS5pZH1gKVxuICAgICAgICB9XG4gICAgICAgIGZpbGVzW25ld0ZpbGUuaWRdID0gbmV3RmlsZVxuICAgICAgICBuZXdGaWxlcy5wdXNoKG5ld0ZpbGUpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKCFlcnIuaXNSZXN0cmljdGlvbikge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGVycilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlcyB9KVxuXG4gICAgbmV3RmlsZXMuZm9yRWFjaCgobmV3RmlsZSkgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdmaWxlLWFkZGVkJywgbmV3RmlsZSlcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdmaWxlcy1hZGRlZCcsIG5ld0ZpbGVzKVxuXG4gICAgaWYgKG5ld0ZpbGVzLmxlbmd0aCA+IDUpIHtcbiAgICAgIHRoaXMubG9nKGBBZGRlZCBiYXRjaCBvZiAke25ld0ZpbGVzLmxlbmd0aH0gZmlsZXNgKVxuICAgIH0gZWxzZSB7XG4gICAgICBPYmplY3Qua2V5cyhuZXdGaWxlcykuZm9yRWFjaChmaWxlSUQgPT4ge1xuICAgICAgICB0aGlzLmxvZyhgQWRkZWQgZmlsZTogJHtuZXdGaWxlc1tmaWxlSURdLm5hbWV9XFxuIGlkOiAke25ld0ZpbGVzW2ZpbGVJRF0uaWR9XFxuIHR5cGU6ICR7bmV3RmlsZXNbZmlsZUlEXS50eXBlfWApXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChuZXdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiNzdGFydElmQXV0b1Byb2NlZWQoKVxuICAgIH1cblxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnTXVsdGlwbGUgZXJyb3JzIG9jY3VycmVkIHdoaWxlIGFkZGluZyBmaWxlczpcXG4nXG4gICAgICBlcnJvcnMuZm9yRWFjaCgoc3ViRXJyb3IpID0+IHtcbiAgICAgICAgbWVzc2FnZSArPSBgXFxuICogJHtzdWJFcnJvci5tZXNzYWdlfWBcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuaW5mbyh7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuaTE4bignYWRkQnVsa0ZpbGVzRmFpbGVkJywgeyBzbWFydF9jb3VudDogZXJyb3JzLmxlbmd0aCB9KSxcbiAgICAgICAgZGV0YWlsczogbWVzc2FnZSxcbiAgICAgIH0sICdlcnJvcicsIHRoaXMub3B0cy5pbmZvVGltZW91dClcblxuICAgICAgaWYgKHR5cGVvZiBBZ2dyZWdhdGVFcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgQWdncmVnYXRlRXJyb3IoZXJyb3JzLCBtZXNzYWdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICAgIGVyci5lcnJvcnMgPSBlcnJvcnNcbiAgICAgICAgdGhyb3cgZXJyXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlRmlsZXMgKGZpbGVJRHMsIHJlYXNvbikge1xuICAgIGNvbnN0IHsgZmlsZXMsIGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7IC4uLmZpbGVzIH1cbiAgICBjb25zdCB1cGRhdGVkVXBsb2FkcyA9IHsgLi4uY3VycmVudFVwbG9hZHMgfVxuXG4gICAgY29uc3QgcmVtb3ZlZEZpbGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIGZpbGVJRHMuZm9yRWFjaCgoZmlsZUlEKSA9PiB7XG4gICAgICBpZiAoZmlsZXNbZmlsZUlEXSkge1xuICAgICAgICByZW1vdmVkRmlsZXNbZmlsZUlEXSA9IGZpbGVzW2ZpbGVJRF1cbiAgICAgICAgZGVsZXRlIHVwZGF0ZWRGaWxlc1tmaWxlSURdXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFJlbW92ZSBmaWxlcyBmcm9tIHRoZSBgZmlsZUlEc2AgbGlzdCBpbiBlYWNoIHVwbG9hZC5cbiAgICBmdW5jdGlvbiBmaWxlSXNOb3RSZW1vdmVkICh1cGxvYWRGaWxlSUQpIHtcbiAgICAgIHJldHVybiByZW1vdmVkRmlsZXNbdXBsb2FkRmlsZUlEXSA9PT0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXModXBkYXRlZFVwbG9hZHMpLmZvckVhY2goKHVwbG9hZElEKSA9PiB7XG4gICAgICBjb25zdCBuZXdGaWxlSURzID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLmZpbGVJRHMuZmlsdGVyKGZpbGVJc05vdFJlbW92ZWQpXG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgdXBsb2FkIGlmIG5vIGZpbGVzIGFyZSBhc3NvY2lhdGVkIHdpdGggaXQgYW55bW9yZS5cbiAgICAgIGlmIChuZXdGaWxlSURzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBkZWxldGUgdXBkYXRlZFVwbG9hZHNbdXBsb2FkSURdXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB1cGRhdGVkVXBsb2Fkc1t1cGxvYWRJRF0gPSB7XG4gICAgICAgIC4uLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSxcbiAgICAgICAgZmlsZUlEczogbmV3RmlsZUlEcyxcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uc3Qgc3RhdGVVcGRhdGUgPSB7XG4gICAgICBjdXJyZW50VXBsb2FkczogdXBkYXRlZFVwbG9hZHMsXG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzLFxuICAgIH1cblxuICAgIC8vIElmIGFsbCBmaWxlcyB3ZXJlIHJlbW92ZWQgLSBhbGxvdyBuZXcgdXBsb2FkcyxcbiAgICAvLyBhbmQgY2xlYXIgcmVjb3ZlcmVkU3RhdGVcbiAgICBpZiAoT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHN0YXRlVXBkYXRlLmFsbG93TmV3VXBsb2FkID0gdHJ1ZVxuICAgICAgc3RhdGVVcGRhdGUuZXJyb3IgPSBudWxsXG4gICAgICBzdGF0ZVVwZGF0ZS5yZWNvdmVyZWRTdGF0ZSA9IG51bGxcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHN0YXRlVXBkYXRlKVxuICAgIHRoaXMuY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG5cbiAgICBjb25zdCByZW1vdmVkRmlsZUlEcyA9IE9iamVjdC5rZXlzKHJlbW92ZWRGaWxlcylcbiAgICByZW1vdmVkRmlsZUlEcy5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnZmlsZS1yZW1vdmVkJywgcmVtb3ZlZEZpbGVzW2ZpbGVJRF0sIHJlYXNvbilcbiAgICB9KVxuXG4gICAgaWYgKHJlbW92ZWRGaWxlSURzLmxlbmd0aCA+IDUpIHtcbiAgICAgIHRoaXMubG9nKGBSZW1vdmVkICR7cmVtb3ZlZEZpbGVJRHMubGVuZ3RofSBmaWxlc2ApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nKGBSZW1vdmVkIGZpbGVzOiAke3JlbW92ZWRGaWxlSURzLmpvaW4oJywgJyl9YClcbiAgICB9XG4gIH1cblxuICByZW1vdmVGaWxlIChmaWxlSUQsIHJlYXNvbiA9IG51bGwpIHtcbiAgICB0aGlzLnJlbW92ZUZpbGVzKFtmaWxlSURdLCByZWFzb24pXG4gIH1cblxuICBwYXVzZVJlc3VtZSAoZmlsZUlEKSB7XG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLnJlc3VtYWJsZVVwbG9hZHNcbiAgICAgICAgIHx8IHRoaXMuZ2V0RmlsZShmaWxlSUQpLnVwbG9hZENvbXBsZXRlKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgY29uc3Qgd2FzUGF1c2VkID0gdGhpcy5nZXRGaWxlKGZpbGVJRCkuaXNQYXVzZWQgfHwgZmFsc2VcbiAgICBjb25zdCBpc1BhdXNlZCA9ICF3YXNQYXVzZWRcblxuICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGVJRCwge1xuICAgICAgaXNQYXVzZWQsXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkLXBhdXNlJywgZmlsZUlELCBpc1BhdXNlZClcblxuICAgIHJldHVybiBpc1BhdXNlZFxuICB9XG5cbiAgcGF1c2VBbGwgKCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IHsgLi4udGhpcy5nZXRTdGF0ZSgpLmZpbGVzIH1cbiAgICBjb25zdCBpblByb2dyZXNzVXBkYXRlZEZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiAhdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlXG4gICAgICAgICAgICAgJiYgdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICB9KVxuXG4gICAgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IHsgLi4udXBkYXRlZEZpbGVzW2ZpbGVdLCBpc1BhdXNlZDogdHJ1ZSB9XG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG5cbiAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IHVwZGF0ZWRGaWxlcyB9KVxuICAgIHRoaXMuZW1pdCgncGF1c2UtYWxsJylcbiAgfVxuXG4gIHJlc3VtZUFsbCAoKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0geyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMgfVxuICAgIGNvbnN0IGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMgPSBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuICF1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkQ29tcGxldGVcbiAgICAgICAgICAgICAmJiB1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZFxuICAgIH0pXG5cbiAgICBpblByb2dyZXNzVXBkYXRlZEZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0ge1xuICAgICAgICAuLi51cGRhdGVkRmlsZXNbZmlsZV0sXG4gICAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICB9XG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiB1cGRhdGVkRmlsZXMgfSlcblxuICAgIHRoaXMuZW1pdCgncmVzdW1lLWFsbCcpXG4gIH1cblxuICByZXRyeUFsbCAoKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0geyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMgfVxuICAgIGNvbnN0IGZpbGVzVG9SZXRyeSA9IE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgcmV0dXJuIHVwZGF0ZWRGaWxlc1tmaWxlXS5lcnJvclxuICAgIH0pXG5cbiAgICBmaWxlc1RvUmV0cnkuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSB7XG4gICAgICAgIC4uLnVwZGF0ZWRGaWxlc1tmaWxlXSxcbiAgICAgICAgaXNQYXVzZWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgIH1cbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXSA9IHVwZGF0ZWRGaWxlXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXMsXG4gICAgICBlcnJvcjogbnVsbCxcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdyZXRyeS1hbGwnLCBmaWxlc1RvUmV0cnkpXG5cbiAgICBpZiAoZmlsZXNUb1JldHJ5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIHN1Y2Nlc3NmdWw6IFtdLFxuICAgICAgICBmYWlsZWQ6IFtdLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuI2NyZWF0ZVVwbG9hZChmaWxlc1RvUmV0cnksIHtcbiAgICAgIGZvcmNlQWxsb3dOZXdVcGxvYWQ6IHRydWUsIC8vIGNyZWF0ZSBuZXcgdXBsb2FkIGV2ZW4gaWYgYWxsb3dOZXdVcGxvYWQ6IGZhbHNlXG4gICAgfSlcbiAgICByZXR1cm4gdGhpcy4jcnVuVXBsb2FkKHVwbG9hZElEKVxuICB9XG5cbiAgY2FuY2VsQWxsICgpIHtcbiAgICB0aGlzLmVtaXQoJ2NhbmNlbC1hbGwnKVxuXG4gICAgY29uc3QgeyBmaWxlcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG5cbiAgICBjb25zdCBmaWxlSURzID0gT2JqZWN0LmtleXMoZmlsZXMpXG4gICAgaWYgKGZpbGVJRHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnJlbW92ZUZpbGVzKGZpbGVJRHMsICdjYW5jZWwtYWxsJylcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDAsXG4gICAgICBlcnJvcjogbnVsbCxcbiAgICAgIHJlY292ZXJlZFN0YXRlOiBudWxsLFxuICAgIH0pXG4gIH1cblxuICByZXRyeVVwbG9hZCAoZmlsZUlEKSB7XG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZUlELCB7XG4gICAgICBlcnJvcjogbnVsbCxcbiAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCd1cGxvYWQtcmV0cnknLCBmaWxlSUQpXG5cbiAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuI2NyZWF0ZVVwbG9hZChbZmlsZUlEXSwge1xuICAgICAgZm9yY2VBbGxvd05ld1VwbG9hZDogdHJ1ZSwgLy8gY3JlYXRlIG5ldyB1cGxvYWQgZXZlbiBpZiBhbGxvd05ld1VwbG9hZDogZmFsc2VcbiAgICB9KVxuICAgIHJldHVybiB0aGlzLiNydW5VcGxvYWQodXBsb2FkSUQpXG4gIH1cblxuICByZXNldCAoKSB7XG4gICAgdGhpcy5jYW5jZWxBbGwoKVxuICB9XG5cbiAgbG9nb3V0ICgpIHtcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKHBsdWdpbiA9PiB7XG4gICAgICBpZiAocGx1Z2luLnByb3ZpZGVyICYmIHBsdWdpbi5wcm92aWRlci5sb2dvdXQpIHtcbiAgICAgICAgcGx1Z2luLnByb3ZpZGVyLmxvZ291dCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNhbGN1bGF0ZVByb2dyZXNzIChmaWxlLCBkYXRhKSB7XG4gICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBieXRlc1RvdGFsIG1heSBiZSBudWxsIG9yIHplcm87IGluIHRoYXQgY2FzZSB3ZSBjYW4ndCBkaXZpZGUgYnkgaXRcbiAgICBjb25zdCBjYW5IYXZlUGVyY2VudGFnZSA9IE51bWJlci5pc0Zpbml0ZShkYXRhLmJ5dGVzVG90YWwpICYmIGRhdGEuYnl0ZXNUb3RhbCA+IDBcbiAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICBwcm9ncmVzczoge1xuICAgICAgICAuLi50aGlzLmdldEZpbGUoZmlsZS5pZCkucHJvZ3Jlc3MsXG4gICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGRhdGEuYnl0ZXNVcGxvYWRlZCxcbiAgICAgICAgYnl0ZXNUb3RhbDogZGF0YS5ieXRlc1RvdGFsLFxuICAgICAgICBwZXJjZW50YWdlOiBjYW5IYXZlUGVyY2VudGFnZVxuICAgICAgICAgID8gTWF0aC5yb3VuZCgoZGF0YS5ieXRlc1VwbG9hZGVkIC8gZGF0YS5ieXRlc1RvdGFsKSAqIDEwMClcbiAgICAgICAgICA6IDAsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICB9XG5cbiAgY2FsY3VsYXRlVG90YWxQcm9ncmVzcyAoKSB7XG4gICAgLy8gY2FsY3VsYXRlIHRvdGFsIHByb2dyZXNzLCB1c2luZyB0aGUgbnVtYmVyIG9mIGZpbGVzIGN1cnJlbnRseSB1cGxvYWRpbmcsXG4gICAgLy8gbXVsdGlwbGllZCBieSAxMDAgYW5kIHRoZSBzdW1tIG9mIGluZGl2aWR1YWwgcHJvZ3Jlc3Mgb2YgZWFjaCBmaWxlXG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldEZpbGVzKClcblxuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICAgICAgfHwgZmlsZS5wcm9ncmVzcy5wcmVwcm9jZXNzXG4gICAgICAgIHx8IGZpbGUucHJvZ3Jlc3MucG9zdHByb2Nlc3NcbiAgICB9KVxuXG4gICAgaWYgKGluUHJvZ3Jlc3MubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzJywgMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzOiAwIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzaXplZEZpbGVzID0gaW5Qcm9ncmVzcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbCAhPSBudWxsKVxuICAgIGNvbnN0IHVuc2l6ZWRGaWxlcyA9IGluUHJvZ3Jlc3MuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLmJ5dGVzVG90YWwgPT0gbnVsbClcblxuICAgIGlmIChzaXplZEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgcHJvZ3Jlc3NNYXggPSBpblByb2dyZXNzLmxlbmd0aCAqIDEwMFxuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdW5zaXplZEZpbGVzLnJlZHVjZSgoYWNjLCBmaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgKyBmaWxlLnByb2dyZXNzLnBlcmNlbnRhZ2VcbiAgICAgIH0sIDApXG4gICAgICBjb25zdCB0b3RhbFByb2dyZXNzID0gTWF0aC5yb3VuZCgoY3VycmVudFByb2dyZXNzIC8gcHJvZ3Jlc3NNYXgpICogMTAwKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRvdGFsUHJvZ3Jlc3MgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCB0b3RhbFNpemUgPSBzaXplZEZpbGVzLnJlZHVjZSgoYWNjLCBmaWxlKSA9PiB7XG4gICAgICByZXR1cm4gYWNjICsgZmlsZS5wcm9ncmVzcy5ieXRlc1RvdGFsXG4gICAgfSwgMClcbiAgICBjb25zdCBhdmVyYWdlU2l6ZSA9IHRvdGFsU2l6ZSAvIHNpemVkRmlsZXMubGVuZ3RoXG4gICAgdG90YWxTaXplICs9IGF2ZXJhZ2VTaXplICogdW5zaXplZEZpbGVzLmxlbmd0aFxuXG4gICAgbGV0IHVwbG9hZGVkU2l6ZSA9IDBcbiAgICBzaXplZEZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIHVwbG9hZGVkU2l6ZSArPSBmaWxlLnByb2dyZXNzLmJ5dGVzVXBsb2FkZWRcbiAgICB9KVxuICAgIHVuc2l6ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICB1cGxvYWRlZFNpemUgKz0gKGF2ZXJhZ2VTaXplICogKGZpbGUucHJvZ3Jlc3MucGVyY2VudGFnZSB8fCAwKSkgLyAxMDBcbiAgICB9KVxuXG4gICAgbGV0IHRvdGFsUHJvZ3Jlc3MgPSB0b3RhbFNpemUgPT09IDBcbiAgICAgID8gMFxuICAgICAgOiBNYXRoLnJvdW5kKCh1cGxvYWRlZFNpemUgLyB0b3RhbFNpemUpICogMTAwKVxuXG4gICAgLy8gaG90IGZpeCwgYmVjYXVzZTpcbiAgICAvLyB1cGxvYWRlZFNpemUgZW5kZWQgdXAgbGFyZ2VyIHRoYW4gdG90YWxTaXplLCByZXN1bHRpbmcgaW4gMTMyNSUgdG90YWxcbiAgICBpZiAodG90YWxQcm9ncmVzcyA+IDEwMCkge1xuICAgICAgdG90YWxQcm9ncmVzcyA9IDEwMFxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgdGhpcy5lbWl0KCdwcm9ncmVzcycsIHRvdGFsUHJvZ3Jlc3MpXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgYWxsIGdsb2JhbCBhY3Rpb25zLCBsaWtlOlxuICAgKiBgZXJyb3JgLCBgZmlsZS1yZW1vdmVkYCwgYHVwbG9hZC1wcm9ncmVzc2BcbiAgICovXG4gICNhZGRMaXN0ZW5lcnMgKCkge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtmaWxlXVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbcmVzcG9uc2VdXG4gICAgICovXG4gICAgY29uc3QgZXJyb3JIYW5kbGVyID0gKGVycm9yLCBmaWxlLCByZXNwb25zZSkgPT4ge1xuICAgICAgbGV0IGVycm9yTXNnID0gZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcidcbiAgICAgIGlmIChlcnJvci5kZXRhaWxzKSB7XG4gICAgICAgIGVycm9yTXNnICs9IGAgJHtlcnJvci5kZXRhaWxzfWBcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBlcnJvck1zZyB9KVxuXG4gICAgICBpZiAoZmlsZSAhPSBudWxsICYmIGZpbGUuaWQgaW4gdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKSB7XG4gICAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vbignZXJyb3InLCBlcnJvckhhbmRsZXIpXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtZXJyb3InLCAoZmlsZSwgZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBlcnJvckhhbmRsZXIoZXJyb3IsIGZpbGUsIHJlc3BvbnNlKVxuXG4gICAgICBpZiAodHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IG5ld0Vycm9yID0gbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpXG4gICAgICAgIG5ld0Vycm9yLmRldGFpbHMgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGlmIChlcnJvci5kZXRhaWxzKSB7XG4gICAgICAgICAgbmV3RXJyb3IuZGV0YWlscyArPSBgICR7ZXJyb3IuZGV0YWlsc31gXG4gICAgICAgIH1cbiAgICAgICAgbmV3RXJyb3IubWVzc2FnZSA9IHRoaXMuaTE4bignZmFpbGVkVG9VcGxvYWQnLCB7IGZpbGU6IGZpbGUubmFtZSB9KVxuICAgICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KG5ld0Vycm9yLCB7XG4gICAgICAgICAgdGhyb3dFcnI6IGZhbHNlLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4jc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhlcnJvciwge1xuICAgICAgICAgIHRocm93RXJyOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZC1zdGFydGVkJywgKGZpbGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBwcm9ncmVzczoge1xuICAgICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgdXBsb2FkQ29tcGxldGU6IGZhbHNlLFxuICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogMCxcbiAgICAgICAgICBieXRlc1RvdGFsOiBmaWxlLnNpemUsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtcHJvZ3Jlc3MnLCB0aGlzLmNhbGN1bGF0ZVByb2dyZXNzKVxuXG4gICAgdGhpcy5vbigndXBsb2FkLXN1Y2Nlc3MnLCAoZmlsZSwgdXBsb2FkUmVzcCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnJlbnRQcm9ncmVzcyA9IHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzc1xuICAgICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBwcm9ncmVzczoge1xuICAgICAgICAgIC4uLmN1cnJlbnRQcm9ncmVzcyxcbiAgICAgICAgICBwb3N0cHJvY2VzczogdGhpcy4jcG9zdFByb2Nlc3NvcnMuc2l6ZSA+IDAgPyB7XG4gICAgICAgICAgICBtb2RlOiAnaW5kZXRlcm1pbmF0ZScsXG4gICAgICAgICAgfSA6IG51bGwsXG4gICAgICAgICAgdXBsb2FkQ29tcGxldGU6IHRydWUsXG4gICAgICAgICAgcGVyY2VudGFnZTogMTAwLFxuICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGN1cnJlbnRQcm9ncmVzcy5ieXRlc1RvdGFsLFxuICAgICAgICB9LFxuICAgICAgICByZXNwb25zZTogdXBsb2FkUmVzcCxcbiAgICAgICAgdXBsb2FkVVJMOiB1cGxvYWRSZXNwLnVwbG9hZFVSTCxcbiAgICAgICAgaXNQYXVzZWQ6IGZhbHNlLFxuICAgICAgfSlcblxuICAgICAgLy8gUmVtb3RlIHByb3ZpZGVycyBzb21ldGltZXMgZG9uJ3QgdGVsbCB1cyB0aGUgZmlsZSBzaXplLFxuICAgICAgLy8gYnV0IHdlIGNhbiBrbm93IGhvdyBtYW55IGJ5dGVzIHdlIHVwbG9hZGVkIG9uY2UgdGhlIHVwbG9hZCBpcyBjb21wbGV0ZS5cbiAgICAgIGlmIChmaWxlLnNpemUgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgICAgc2l6ZTogdXBsb2FkUmVzcC5ieXRlc1VwbG9hZGVkIHx8IGN1cnJlbnRQcm9ncmVzcy5ieXRlc1RvdGFsLFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLXByb2dyZXNzJywgKGZpbGUsIHByb2dyZXNzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IHsgLi4udGhpcy5nZXRGaWxlKGZpbGUuaWQpLnByb2dyZXNzLCBwcmVwcm9jZXNzOiBwcm9ncmVzcyB9LFxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigncHJlcHJvY2Vzcy1jb21wbGV0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbGVzID0geyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMgfVxuICAgICAgZmlsZXNbZmlsZS5pZF0gPSB7IC4uLmZpbGVzW2ZpbGUuaWRdLCBwcm9ncmVzczogeyAuLi5maWxlc1tmaWxlLmlkXS5wcm9ncmVzcyB9IH1cbiAgICAgIGRlbGV0ZSBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcy5wcmVwcm9jZXNzXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlcyB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwb3N0cHJvY2Vzcy1wcm9ncmVzcycsIChmaWxlLCBwcm9ncmVzcykgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlLmlkXS5wcm9ncmVzcywgcG9zdHByb2Nlc3M6IHByb2dyZXNzIH0sXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwb3N0cHJvY2Vzcy1jb21wbGV0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbGVzID0ge1xuICAgICAgICAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMsXG4gICAgICB9XG4gICAgICBmaWxlc1tmaWxlLmlkXSA9IHtcbiAgICAgICAgLi4uZmlsZXNbZmlsZS5pZF0sXG4gICAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgICAgLi4uZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgICBkZWxldGUgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MucG9zdHByb2Nlc3NcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3Jlc3RvcmVkJywgKCkgPT4ge1xuICAgICAgLy8gRmlsZXMgbWF5IGhhdmUgY2hhbmdlZC0tZW5zdXJlIHByb2dyZXNzIGlzIHN0aWxsIGFjY3VyYXRlLlxuICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFByb2dyZXNzKClcbiAgICB9KVxuXG4gICAgdGhpcy5vbignZGFzaGJvYXJkOmZpbGUtZWRpdC1jb21wbGV0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoZmlsZSkge1xuICAgICAgICB0aGlzLiNjaGVja1JlcXVpcmVkTWV0YUZpZWxkc09uRmlsZShmaWxlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBzaG93IGluZm9ybWVyIGlmIG9mZmxpbmVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCB0aGlzLiN1cGRhdGVPbmxpbmVTdGF0dXMpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsIHRoaXMuI3VwZGF0ZU9ubGluZVN0YXR1cylcbiAgICAgIHNldFRpbWVvdXQodGhpcy4jdXBkYXRlT25saW5lU3RhdHVzLCAzMDAwKVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZU9ubGluZVN0YXR1cyAoKSB7XG4gICAgY29uc3Qgb25saW5lID0gdHlwZW9mIHdpbmRvdy5uYXZpZ2F0b3Iub25MaW5lICE9PSAndW5kZWZpbmVkJ1xuICAgICAgPyB3aW5kb3cubmF2aWdhdG9yLm9uTGluZVxuICAgICAgOiB0cnVlXG4gICAgaWYgKCFvbmxpbmUpIHtcbiAgICAgIHRoaXMuZW1pdCgnaXMtb2ZmbGluZScpXG4gICAgICB0aGlzLmluZm8odGhpcy5pMThuKCdub0ludGVybmV0Q29ubmVjdGlvbicpLCAnZXJyb3InLCAwKVxuICAgICAgdGhpcy53YXNPZmZsaW5lID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVtaXQoJ2lzLW9ubGluZScpXG4gICAgICBpZiAodGhpcy53YXNPZmZsaW5lKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnYmFjay1vbmxpbmUnKVxuICAgICAgICB0aGlzLmluZm8odGhpcy5pMThuKCdjb25uZWN0ZWRUb0ludGVybmV0JyksICdzdWNjZXNzJywgMzAwMClcbiAgICAgICAgdGhpcy53YXNPZmZsaW5lID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAjdXBkYXRlT25saW5lU3RhdHVzID0gdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMuYmluZCh0aGlzKVxuXG4gIGdldElEICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRzLmlkXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgcGx1Z2luIHdpdGggQ29yZS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IFBsdWdpbiBvYmplY3RcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRzXSBvYmplY3Qgd2l0aCBvcHRpb25zIHRvIGJlIHBhc3NlZCB0byBQbHVnaW5cbiAgICogQHJldHVybnMge29iamVjdH0gc2VsZiBmb3IgY2hhaW5pbmdcbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcbiAgdXNlIChQbHVnaW4sIG9wdHMpIHtcbiAgICBpZiAodHlwZW9mIFBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgbXNnID0gYEV4cGVjdGVkIGEgcGx1Z2luIGNsYXNzLCBidXQgZ290ICR7UGx1Z2luID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIFBsdWdpbn0uYFxuICAgICAgICArICcgUGxlYXNlIHZlcmlmeSB0aGF0IHRoZSBwbHVnaW4gd2FzIGltcG9ydGVkIGFuZCBzcGVsbGVkIGNvcnJlY3RseS4nXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZylcbiAgICB9XG5cbiAgICAvLyBJbnN0YW50aWF0ZVxuICAgIGNvbnN0IHBsdWdpbiA9IG5ldyBQbHVnaW4odGhpcywgb3B0cylcbiAgICBjb25zdCBwbHVnaW5JZCA9IHBsdWdpbi5pZFxuXG4gICAgaWYgKCFwbHVnaW5JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHBsdWdpbiBtdXN0IGhhdmUgYW4gaWQnKVxuICAgIH1cblxuICAgIGlmICghcGx1Z2luLnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBwbHVnaW4gbXVzdCBoYXZlIGEgdHlwZScpXG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RzUGx1Z2luQWxyZWFkeSA9IHRoaXMuZ2V0UGx1Z2luKHBsdWdpbklkKVxuICAgIGlmIChleGlzdHNQbHVnaW5BbHJlYWR5KSB7XG4gICAgICBjb25zdCBtc2cgPSBgQWxyZWFkeSBmb3VuZCBhIHBsdWdpbiBuYW1lZCAnJHtleGlzdHNQbHVnaW5BbHJlYWR5LmlkfScuIGBcbiAgICAgICAgKyBgVHJpZWQgdG8gdXNlOiAnJHtwbHVnaW5JZH0nLlxcbmBcbiAgICAgICAgKyAnVXBweSBwbHVnaW5zIG11c3QgaGF2ZSB1bmlxdWUgYGlkYCBvcHRpb25zLiBTZWUgaHR0cHM6Ly91cHB5LmlvL2RvY3MvcGx1Z2lucy8jaWQuJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZylcbiAgICB9XG5cbiAgICBpZiAoUGx1Z2luLlZFUlNJT04pIHtcbiAgICAgIHRoaXMubG9nKGBVc2luZyAke3BsdWdpbklkfSB2JHtQbHVnaW4uVkVSU0lPTn1gKVxuICAgIH1cblxuICAgIGlmIChwbHVnaW4udHlwZSBpbiB0aGlzLiNwbHVnaW5zKSB7XG4gICAgICB0aGlzLiNwbHVnaW5zW3BsdWdpbi50eXBlXS5wdXNoKHBsdWdpbilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4jcGx1Z2luc1twbHVnaW4udHlwZV0gPSBbcGx1Z2luXVxuICAgIH1cbiAgICBwbHVnaW4uaW5zdGFsbCgpXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgb25lIFBsdWdpbiBieSBuYW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgcGx1Z2luIGlkXG4gICAqIEByZXR1cm5zIHtCYXNlUGx1Z2lufHVuZGVmaW5lZH1cbiAgICovXG4gIGdldFBsdWdpbiAoaWQpIHtcbiAgICBmb3IgKGNvbnN0IHBsdWdpbnMgb2YgT2JqZWN0LnZhbHVlcyh0aGlzLiNwbHVnaW5zKSkge1xuICAgICAgY29uc3QgZm91bmRQbHVnaW4gPSBwbHVnaW5zLmZpbmQocGx1Z2luID0+IHBsdWdpbi5pZCA9PT0gaWQpXG4gICAgICBpZiAoZm91bmRQbHVnaW4gIT0gbnVsbCkgcmV0dXJuIGZvdW5kUGx1Z2luXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIFtTeW1ib2wuZm9yKCd1cHB5IHRlc3Q6IGdldFBsdWdpbnMnKV0gKHR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy4jcGx1Z2luc1t0eXBlXVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgdGhyb3VnaCBhbGwgYHVzZWBkIHBsdWdpbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZCB0aGF0IHdpbGwgYmUgcnVuIG9uIGVhY2ggcGx1Z2luXG4gICAqL1xuICBpdGVyYXRlUGx1Z2lucyAobWV0aG9kKSB7XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLiNwbHVnaW5zKS5mbGF0KDEpLmZvckVhY2gobWV0aG9kKVxuICB9XG5cbiAgLyoqXG4gICAqIFVuaW5zdGFsbCBhbmQgcmVtb3ZlIGEgcGx1Z2luLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgVGhlIHBsdWdpbiBpbnN0YW5jZSB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVQbHVnaW4gKGluc3RhbmNlKSB7XG4gICAgdGhpcy5sb2coYFJlbW92aW5nIHBsdWdpbiAke2luc3RhbmNlLmlkfWApXG4gICAgdGhpcy5lbWl0KCdwbHVnaW4tcmVtb3ZlJywgaW5zdGFuY2UpXG5cbiAgICBpZiAoaW5zdGFuY2UudW5pbnN0YWxsKSB7XG4gICAgICBpbnN0YW5jZS51bmluc3RhbGwoKVxuICAgIH1cblxuICAgIGNvbnN0IGxpc3QgPSB0aGlzLiNwbHVnaW5zW2luc3RhbmNlLnR5cGVdXG4gICAgLy8gbGlzdC5pbmRleE9mIGZhaWxlZCBoZXJlLCBiZWNhdXNlIFZ1ZTMgY29udmVydGVkIHRoZSBwbHVnaW4gaW5zdGFuY2VcbiAgICAvLyB0byBhIFByb3h5IG9iamVjdCwgd2hpY2ggZmFpbGVkIHRoZSBzdHJpY3QgY29tcGFyaXNvbiB0ZXN0OlxuICAgIC8vIG9iaiAhPT0gb2JqUHJveHlcbiAgICBjb25zdCBpbmRleCA9IGxpc3QuZmluZEluZGV4KGl0ZW0gPT4gaXRlbS5pZCA9PT0gaW5zdGFuY2UuaWQpXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmdldFN0YXRlKClcbiAgICBjb25zdCB1cGRhdGVkU3RhdGUgPSB7XG4gICAgICBwbHVnaW5zOiB7XG4gICAgICAgIC4uLnN0YXRlLnBsdWdpbnMsXG4gICAgICAgIFtpbnN0YW5jZS5pZF06IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUodXBkYXRlZFN0YXRlKVxuICB9XG5cbiAgLyoqXG4gICAqIFVuaW5zdGFsbCBhbGwgcGx1Z2lucyBhbmQgY2xvc2UgZG93biB0aGlzIFVwcHkgaW5zdGFuY2UuXG4gICAqL1xuICBjbG9zZSAoKSB7XG4gICAgdGhpcy5sb2coYENsb3NpbmcgVXBweSBpbnN0YW5jZSAke3RoaXMub3B0cy5pZH06IHJlbW92aW5nIGFsbCBmaWxlcyBhbmQgdW5pbnN0YWxsaW5nIHBsdWdpbnNgKVxuXG4gICAgdGhpcy5yZXNldCgpXG5cbiAgICB0aGlzLiNzdG9yZVVuc3Vic2NyaWJlKClcblxuICAgIHRoaXMuaXRlcmF0ZVBsdWdpbnMoKHBsdWdpbikgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVQbHVnaW4ocGx1Z2luKVxuICAgIH0pXG5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdvbmxpbmUnLCB0aGlzLiN1cGRhdGVPbmxpbmVTdGF0dXMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsIHRoaXMuI3VwZGF0ZU9ubGluZVN0YXR1cylcbiAgICB9XG4gIH1cblxuICBoaWRlSW5mbyAoKSB7XG4gICAgY29uc3QgeyBpbmZvIH0gPSB0aGlzLmdldFN0YXRlKClcblxuICAgIHRoaXMuc2V0U3RhdGUoeyBpbmZvOiBpbmZvLnNsaWNlKDEpIH0pXG5cbiAgICB0aGlzLmVtaXQoJ2luZm8taGlkZGVuJylcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgaW5mbyBtZXNzYWdlIGluIGBzdGF0ZS5pbmZvYCwgc28gdGhhdCBVSSBwbHVnaW5zIGxpa2UgYEluZm9ybWVyYFxuICAgKiBjYW4gZGlzcGxheSB0aGUgbWVzc2FnZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBvYmplY3R9IG1lc3NhZ2UgTWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGluZm9ybWVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbdHlwZV1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtkdXJhdGlvbl1cbiAgICovXG4gIGluZm8gKG1lc3NhZ2UsIHR5cGUgPSAnaW5mbycsIGR1cmF0aW9uID0gMzAwMCkge1xuICAgIGNvbnN0IGlzQ29tcGxleE1lc3NhZ2UgPSB0eXBlb2YgbWVzc2FnZSA9PT0gJ29iamVjdCdcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaW5mbzogW1xuICAgICAgICAuLi50aGlzLmdldFN0YXRlKCkuaW5mbyxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgbWVzc2FnZTogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UubWVzc2FnZSA6IG1lc3NhZ2UsXG4gICAgICAgICAgZGV0YWlsczogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UuZGV0YWlscyA6IG51bGwsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGlkZUluZm8oKSwgZHVyYXRpb24pXG5cbiAgICB0aGlzLmVtaXQoJ2luZm8tdmlzaWJsZScpXG4gIH1cblxuICAvKipcbiAgICogUGFzc2VzIG1lc3NhZ2VzIHRvIGEgZnVuY3Rpb24sIHByb3ZpZGVkIGluIGBvcHRzLmxvZ2dlcmAuXG4gICAqIElmIGBvcHRzLmxvZ2dlcjogVXBweS5kZWJ1Z0xvZ2dlcmAgb3IgYG9wdHMuZGVidWc6IHRydWVgLCBsb2dzIHRvIHRoZSBicm93c2VyIGNvbnNvbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gbWVzc2FnZSB0byBsb2dcbiAgICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXSBvcHRpb25hbCBgZXJyb3JgIG9yIGB3YXJuaW5nYFxuICAgKi9cbiAgbG9nIChtZXNzYWdlLCB0eXBlKSB7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IHRoaXMub3B0c1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnZXJyb3InOiBsb2dnZXIuZXJyb3IobWVzc2FnZSk7IGJyZWFrXG4gICAgICBjYXNlICd3YXJuaW5nJzogbG9nZ2VyLndhcm4obWVzc2FnZSk7IGJyZWFrXG4gICAgICBkZWZhdWx0OiBsb2dnZXIuZGVidWcobWVzc2FnZSk7IGJyZWFrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgYW4gdXBsb2FkIGJ5IGl0cyBJRC5cbiAgICovXG4gIHJlc3RvcmUgKHVwbG9hZElEKSB7XG4gICAgdGhpcy5sb2coYENvcmU6IGF0dGVtcHRpbmcgdG8gcmVzdG9yZSB1cGxvYWQgXCIke3VwbG9hZElEfVwiYClcblxuICAgIGlmICghdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSkge1xuICAgICAgdGhpcy4jcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTm9uZXhpc3RlbnQgdXBsb2FkJykpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuI3J1blVwbG9hZCh1cGxvYWRJRClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gdXBsb2FkIGZvciBhIGJ1bmNoIG9mIGZpbGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5PHN0cmluZz59IGZpbGVJRHMgRmlsZSBJRHMgdG8gaW5jbHVkZSBpbiB0aGlzIHVwbG9hZC5cbiAgICogQHJldHVybnMge3N0cmluZ30gSUQgb2YgdGhpcyB1cGxvYWQuXG4gICAqL1xuICAjY3JlYXRlVXBsb2FkIChmaWxlSURzLCBvcHRzID0ge30pIHtcbiAgICAvLyB1cHB5LnJldHJ5QWxsIHNldHMgdGhpcyB0byB0cnVlIOKAlCB3aGVuIHJldHJ5aW5nIHdlIHdhbnQgdG8gaWdub3JlIGBhbGxvd05ld1VwbG9hZDogZmFsc2VgXG4gICAgY29uc3QgeyBmb3JjZUFsbG93TmV3VXBsb2FkID0gZmFsc2UgfSA9IG9wdHNcblxuICAgIGNvbnN0IHsgYWxsb3dOZXdVcGxvYWQsIGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBpZiAoIWFsbG93TmV3VXBsb2FkICYmICFmb3JjZUFsbG93TmV3VXBsb2FkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgYSBuZXcgdXBsb2FkOiBhbHJlYWR5IHVwbG9hZGluZy4nKVxuICAgIH1cblxuICAgIGNvbnN0IHVwbG9hZElEID0gbmFub2lkKClcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkJywge1xuICAgICAgaWQ6IHVwbG9hZElELFxuICAgICAgZmlsZUlEcyxcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhbGxvd05ld1VwbG9hZDogdGhpcy5vcHRzLmFsbG93TXVsdGlwbGVVcGxvYWRCYXRjaGVzICE9PSBmYWxzZSAmJiB0aGlzLm9wdHMuYWxsb3dNdWx0aXBsZVVwbG9hZHMgIT09IGZhbHNlLFxuXG4gICAgICBjdXJyZW50VXBsb2Fkczoge1xuICAgICAgICAuLi5jdXJyZW50VXBsb2FkcyxcbiAgICAgICAgW3VwbG9hZElEXToge1xuICAgICAgICAgIGZpbGVJRHMsXG4gICAgICAgICAgc3RlcDogMCxcbiAgICAgICAgICByZXN1bHQ6IHt9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIHVwbG9hZElEXG4gIH1cblxuICBbU3ltYm9sLmZvcigndXBweSB0ZXN0OiBjcmVhdGVVcGxvYWQnKV0gKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMuI2NyZWF0ZVVwbG9hZCguLi5hcmdzKSB9XG5cbiAgI2dldFVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcblxuICAgIHJldHVybiBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZGF0YSB0byBhbiB1cGxvYWQncyByZXN1bHQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXBsb2FkSUQgVGhlIElEIG9mIHRoZSB1cGxvYWQuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIERhdGEgcHJvcGVydGllcyB0byBhZGQgdG8gdGhlIHJlc3VsdCBvYmplY3QuXG4gICAqL1xuICBhZGRSZXN1bHREYXRhICh1cGxvYWRJRCwgZGF0YSkge1xuICAgIGlmICghdGhpcy4jZ2V0VXBsb2FkKHVwbG9hZElEKSkge1xuICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHJlc3VsdCBmb3IgYW4gdXBsb2FkIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHt1cGxvYWRJRH1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IGN1cnJlbnRVcGxvYWQgPSB7IC4uLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwgcmVzdWx0OiB7IC4uLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXS5yZXN1bHQsIC4uLmRhdGEgfSB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogeyAuLi5jdXJyZW50VXBsb2FkcywgW3VwbG9hZElEXTogY3VycmVudFVwbG9hZCB9LFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIHVwbG9hZCwgZWcuIGlmIGl0IGhhcyBiZWVuIGNhbmNlbGVkIG9yIGNvbXBsZXRlZC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwbG9hZElEIFRoZSBJRCBvZiB0aGUgdXBsb2FkLlxuICAgKi9cbiAgI3JlbW92ZVVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCBjdXJyZW50VXBsb2FkcyA9IHsgLi4udGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzIH1cbiAgICBkZWxldGUgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzLFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUnVuIGFuIHVwbG9hZC4gVGhpcyBwaWNrcyB1cCB3aGVyZSBpdCBsZWZ0IG9mZiBpbiBjYXNlIHRoZSB1cGxvYWQgaXMgYmVpbmcgcmVzdG9yZWQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3luYyAjcnVuVXBsb2FkICh1cGxvYWRJRCkge1xuICAgIGxldCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBsZXQgY3VycmVudFVwbG9hZCA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgIGNvbnN0IHJlc3RvcmVTdGVwID0gY3VycmVudFVwbG9hZC5zdGVwIHx8IDBcblxuICAgIGNvbnN0IHN0ZXBzID0gW1xuICAgICAgLi4uQXJyYXkuZnJvbSh0aGlzLiNwcmVQcm9jZXNzb3JzKSxcbiAgICAgIC4uLkFycmF5LmZyb20odGhpcy4jdXBsb2FkZXJzKSxcbiAgICAgIC4uLkFycmF5LmZyb20odGhpcy4jcG9zdFByb2Nlc3NvcnMpLFxuICAgIF1cbiAgICB0cnkge1xuICAgICAgZm9yIChsZXQgc3RlcCA9IHJlc3RvcmVTdGVwOyBzdGVwIDwgc3RlcHMubGVuZ3RoOyBzdGVwKyspIHtcbiAgICAgICAgaWYgKCFjdXJyZW50VXBsb2FkKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmbiA9IHN0ZXBzW3N0ZXBdXG5cbiAgICAgICAgY29uc3QgdXBkYXRlZFVwbG9hZCA9IHtcbiAgICAgICAgICAuLi5jdXJyZW50VXBsb2FkLFxuICAgICAgICAgIHN0ZXAsXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBjdXJyZW50VXBsb2Fkczoge1xuICAgICAgICAgICAgLi4uY3VycmVudFVwbG9hZHMsXG4gICAgICAgICAgICBbdXBsb2FkSURdOiB1cGRhdGVkVXBsb2FkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gVE9ETyBnaXZlIHRoaXMgdGhlIGB1cGRhdGVkVXBsb2FkYCBvYmplY3QgYXMgaXRzIG9ubHkgcGFyYW1ldGVyIG1heWJlP1xuICAgICAgICAvLyBPdGhlcndpc2Ugd2hlbiBtb3JlIG1ldGFkYXRhIG1heSBiZSBhZGRlZCB0byB0aGUgdXBsb2FkIHRoaXMgd291bGQga2VlcCBnZXR0aW5nIG1vcmUgcGFyYW1ldGVyc1xuICAgICAgICBhd2FpdCBmbih1cGRhdGVkVXBsb2FkLmZpbGVJRHMsIHVwbG9hZElEKVxuXG4gICAgICAgIC8vIFVwZGF0ZSBjdXJyZW50VXBsb2FkIHZhbHVlIGluIGNhc2UgaXQgd2FzIG1vZGlmaWVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICBjdXJyZW50VXBsb2FkcyA9IHRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2Fkc1xuICAgICAgICBjdXJyZW50VXBsb2FkID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKVxuICAgICAgdGhpcy4jcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgLy8gU2V0IHJlc3VsdCBkYXRhLlxuICAgIGlmIChjdXJyZW50VXBsb2FkKSB7XG4gICAgICAvLyBNYXJrIHBvc3Rwcm9jZXNzaW5nIHN0ZXAgYXMgY29tcGxldGUgaWYgbmVjZXNzYXJ5OyB0aGlzIGFkZHJlc3NlcyBhIGNhc2Ugd2hlcmUgd2UgbWlnaHQgZ2V0XG4gICAgICAvLyBzdHVjayBpbiB0aGUgcG9zdHByb2Nlc3NpbmcgVUkgd2hpbGUgdGhlIHVwbG9hZCBpcyBmdWxseSBjb21wbGV0ZS5cbiAgICAgIC8vIElmIHRoZSBwb3N0cHJvY2Vzc2luZyBzdGVwcyBkbyBub3QgZG8gYW55IHdvcmssIHRoZXkgbWF5IG5vdCBlbWl0IHBvc3Rwcm9jZXNzaW5nIGV2ZW50cyBhdFxuICAgICAgLy8gYWxsLCBhbmQgbmV2ZXIgbWFyayB0aGUgcG9zdHByb2Nlc3NpbmcgYXMgY29tcGxldGUuIFRoaXMgaXMgZmluZSBvbiBpdHMgb3duIGJ1dCB3ZVxuICAgICAgLy8gaW50cm9kdWNlZCBjb2RlIGluIHRoZSBAdXBweS9jb3JlIHVwbG9hZC1zdWNjZXNzIGhhbmRsZXIgdG8gcHJlcGFyZSBwb3N0cHJvY2Vzc2luZyBwcm9ncmVzc1xuICAgICAgLy8gc3RhdGUgaWYgYW55IHBvc3Rwcm9jZXNzb3JzIGFyZSByZWdpc3RlcmVkLiBUaGF0IGlzIHRvIGF2b2lkIGEgXCJmbGFzaCBvZiBjb21wbGV0ZWQgc3RhdGVcIlxuICAgICAgLy8gYmVmb3JlIHRoZSBwb3N0cHJvY2Vzc2luZyBwbHVnaW5zIGNhbiBlbWl0IGV2ZW50cy5cbiAgICAgIC8vXG4gICAgICAvLyBTbywganVzdCBpbiBjYXNlIGFuIHVwbG9hZCB3aXRoIHBvc3Rwcm9jZXNzaW5nIHBsdWdpbnMgKmhhcyogY29tcGxldGVkICp3aXRob3V0KiBlbWl0dGluZ1xuICAgICAgLy8gcG9zdHByb2Nlc3NpbmcgY29tcGxldGlvbiwgd2UgZG8gaXQgaW5zdGVhZC5cbiAgICAgIGN1cnJlbnRVcGxvYWQuZmlsZUlEcy5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuZ2V0RmlsZShmaWxlSUQpXG4gICAgICAgIGlmIChmaWxlICYmIGZpbGUucHJvZ3Jlc3MucG9zdHByb2Nlc3MpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ3Bvc3Rwcm9jZXNzLWNvbXBsZXRlJywgZmlsZSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc3QgZmlsZXMgPSBjdXJyZW50VXBsb2FkLmZpbGVJRHMubWFwKChmaWxlSUQpID0+IHRoaXMuZ2V0RmlsZShmaWxlSUQpKVxuICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gIWZpbGUuZXJyb3IpXG4gICAgICBjb25zdCBmYWlsZWQgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUuZXJyb3IpXG4gICAgICBhd2FpdCB0aGlzLmFkZFJlc3VsdERhdGEodXBsb2FkSUQsIHsgc3VjY2Vzc2Z1bCwgZmFpbGVkLCB1cGxvYWRJRCB9KVxuXG4gICAgICAvLyBVcGRhdGUgY3VycmVudFVwbG9hZCB2YWx1ZSBpbiBjYXNlIGl0IHdhcyBtb2RpZmllZCBhc3luY2hyb25vdXNseS5cbiAgICAgIGN1cnJlbnRVcGxvYWRzID0gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzXG4gICAgICBjdXJyZW50VXBsb2FkID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG4gICAgfVxuICAgIC8vIEVtaXQgY29tcGxldGlvbiBldmVudHMuXG4gICAgLy8gVGhpcyBpcyBpbiBhIHNlcGFyYXRlIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIGBjdXJyZW50VXBsb2Fkc2AgdmFyaWFibGVcbiAgICAvLyBhbHdheXMgcmVmZXJzIHRvIHRoZSBsYXRlc3Qgc3RhdGUuIEluIHRoZSBoYW5kbGVyIHJpZ2h0IGFib3ZlIGl0IHJlZmVyc1xuICAgIC8vIHRvIGFuIG91dGRhdGVkIG9iamVjdCB3aXRob3V0IHRoZSBgLnJlc3VsdGAgcHJvcGVydHkuXG4gICAgbGV0IHJlc3VsdFxuICAgIGlmIChjdXJyZW50VXBsb2FkKSB7XG4gICAgICByZXN1bHQgPSBjdXJyZW50VXBsb2FkLnJlc3VsdFxuICAgICAgdGhpcy5lbWl0KCdjb21wbGV0ZScsIHJlc3VsdClcblxuICAgICAgdGhpcy4jcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgIH1cbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyByZXN1bHQgZm9yIGFuIHVwbG9hZCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7dXBsb2FkSUR9YClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGFuIHVwbG9hZCBmb3IgYWxsIHRoZSBmaWxlcyB0aGF0IGFyZSBub3QgY3VycmVudGx5IGJlaW5nIHVwbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gIHVwbG9hZCAoKSB7XG4gICAgaWYgKCF0aGlzLiNwbHVnaW5zLnVwbG9hZGVyPy5sZW5ndGgpIHtcbiAgICAgIHRoaXMubG9nKCdObyB1cGxvYWRlciB0eXBlIHBsdWdpbnMgYXJlIHVzZWQnLCAnd2FybmluZycpXG4gICAgfVxuXG4gICAgbGV0IHsgZmlsZXMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuXG4gICAgY29uc3Qgb25CZWZvcmVVcGxvYWRSZXN1bHQgPSB0aGlzLm9wdHMub25CZWZvcmVVcGxvYWQoZmlsZXMpXG5cbiAgICBpZiAob25CZWZvcmVVcGxvYWRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdOb3Qgc3RhcnRpbmcgdGhlIHVwbG9hZCBiZWNhdXNlIG9uQmVmb3JlVXBsb2FkIHJldHVybmVkIGZhbHNlJykpXG4gICAgfVxuXG4gICAgaWYgKG9uQmVmb3JlVXBsb2FkUmVzdWx0ICYmIHR5cGVvZiBvbkJlZm9yZVVwbG9hZFJlc3VsdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZpbGVzID0gb25CZWZvcmVVcGxvYWRSZXN1bHRcbiAgICAgIC8vIFVwZGF0aW5nIGZpbGVzIGluIHN0YXRlLCBiZWNhdXNlIHVwbG9hZGVyIHBsdWdpbnMgcmVjZWl2ZSBmaWxlIElEcyxcbiAgICAgIC8vIGFuZCB0aGVuIGZldGNoIHRoZSBhY3R1YWwgZmlsZSBvYmplY3QgZnJvbSBzdGF0ZVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGZpbGVzLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy4jY2hlY2tNaW5OdW1iZXJPZkZpbGVzKGZpbGVzKVxuICAgICAgICB0aGlzLiNjaGVja1JlcXVpcmVkTWV0YUZpZWxkcyhmaWxlcylcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KGVycilcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgICAgICAvLyBnZXQgYSBsaXN0IG9mIGZpbGVzIHRoYXQgYXJlIGN1cnJlbnRseSBhc3NpZ25lZCB0byB1cGxvYWRzXG4gICAgICAgIGNvbnN0IGN1cnJlbnRseVVwbG9hZGluZ0ZpbGVzID0gT2JqZWN0LnZhbHVlcyhjdXJyZW50VXBsb2FkcykuZmxhdE1hcChjdXJyID0+IGN1cnIuZmlsZUlEcylcblxuICAgICAgICBjb25zdCB3YWl0aW5nRmlsZUlEcyA9IFtdXG4gICAgICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5nZXRGaWxlKGZpbGVJRClcbiAgICAgICAgICAvLyBpZiB0aGUgZmlsZSBoYXNuJ3Qgc3RhcnRlZCB1cGxvYWRpbmcgYW5kIGhhc24ndCBhbHJlYWR5IGJlZW4gYXNzaWduZWQgdG8gYW4gdXBsb2FkLi5cbiAgICAgICAgICBpZiAoKCFmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQpICYmIChjdXJyZW50bHlVcGxvYWRpbmdGaWxlcy5pbmRleE9mKGZpbGVJRCkgPT09IC0xKSkge1xuICAgICAgICAgICAgd2FpdGluZ0ZpbGVJRHMucHVzaChmaWxlLmlkKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuI2NyZWF0ZVVwbG9hZCh3YWl0aW5nRmlsZUlEcylcbiAgICAgICAgcmV0dXJuIHRoaXMuI3J1blVwbG9hZCh1cGxvYWRJRClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KGVyciwge1xuICAgICAgICAgIHNob3dJbmZvcm1lcjogZmFsc2UsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXBweVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRGaWxlTmFtZSAoZmlsZVR5cGUsIGZpbGVEZXNjcmlwdG9yKSB7XG4gIGlmIChmaWxlRGVzY3JpcHRvci5uYW1lKSB7XG4gICAgcmV0dXJuIGZpbGVEZXNjcmlwdG9yLm5hbWVcbiAgfVxuXG4gIGlmIChmaWxlVHlwZS5zcGxpdCgnLycpWzBdID09PSAnaW1hZ2UnKSB7XG4gICAgcmV0dXJuIGAke2ZpbGVUeXBlLnNwbGl0KCcvJylbMF19LiR7ZmlsZVR5cGUuc3BsaXQoJy8nKVsxXX1gXG4gIH1cblxuICByZXR1cm4gJ25vbmFtZSdcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBVcHB5ID0gcmVxdWlyZSgnLi9VcHB5JylcbmNvbnN0IFVJUGx1Z2luID0gcmVxdWlyZSgnLi9VSVBsdWdpbicpXG5jb25zdCBCYXNlUGx1Z2luID0gcmVxdWlyZSgnLi9CYXNlUGx1Z2luJylcbmNvbnN0IHsgZGVidWdMb2dnZXIgfSA9IHJlcXVpcmUoJy4vbG9nZ2VycycpXG5cbm1vZHVsZS5leHBvcnRzID0gVXBweVxubW9kdWxlLmV4cG9ydHMuVXBweSA9IFVwcHlcbm1vZHVsZS5leHBvcnRzLlVJUGx1Z2luID0gVUlQbHVnaW5cbm1vZHVsZS5leHBvcnRzLkJhc2VQbHVnaW4gPSBCYXNlUGx1Z2luXG5tb2R1bGUuZXhwb3J0cy5kZWJ1Z0xvZ2dlciA9IGRlYnVnTG9nZ2VyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RyaW5nczoge1xuICAgIGFkZEJ1bGtGaWxlc0ZhaWxlZDoge1xuICAgICAgMDogJ0ZhaWxlZCB0byBhZGQgJXtzbWFydF9jb3VudH0gZmlsZSBkdWUgdG8gYW4gaW50ZXJuYWwgZXJyb3InLFxuICAgICAgMTogJ0ZhaWxlZCB0byBhZGQgJXtzbWFydF9jb3VudH0gZmlsZXMgZHVlIHRvIGludGVybmFsIGVycm9ycycsXG4gICAgfSxcbiAgICB5b3VDYW5Pbmx5VXBsb2FkWDoge1xuICAgICAgMDogJ1lvdSBjYW4gb25seSB1cGxvYWQgJXtzbWFydF9jb3VudH0gZmlsZScsXG4gICAgICAxOiAnWW91IGNhbiBvbmx5IHVwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlcycsXG4gICAgfSxcbiAgICB5b3VIYXZlVG9BdExlYXN0U2VsZWN0WDoge1xuICAgICAgMDogJ1lvdSBoYXZlIHRvIHNlbGVjdCBhdCBsZWFzdCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgIDE6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZXMnLFxuICAgIH0sXG4gICAgZXhjZWVkc1NpemU6ICcle2ZpbGV9IGV4Y2VlZHMgbWF4aW11bSBhbGxvd2VkIHNpemUgb2YgJXtzaXplfScsXG4gICAgbWlzc2luZ1JlcXVpcmVkTWV0YUZpZWxkOiAnTWlzc2luZyByZXF1aXJlZCBtZXRhIGZpZWxkcycsXG4gICAgbWlzc2luZ1JlcXVpcmVkTWV0YUZpZWxkT25GaWxlOlxuICAgICAgJ01pc3NpbmcgcmVxdWlyZWQgbWV0YSBmaWVsZHMgaW4gJXtmaWxlTmFtZX0nLFxuICAgIGluZmVyaW9yU2l6ZTogJ1RoaXMgZmlsZSBpcyBzbWFsbGVyIHRoYW4gdGhlIGFsbG93ZWQgc2l6ZSBvZiAle3NpemV9JyxcbiAgICB5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzOiAnWW91IGNhbiBvbmx5IHVwbG9hZDogJXt0eXBlc30nLFxuICAgIG5vTW9yZUZpbGVzQWxsb3dlZDogJ0Nhbm5vdCBhZGQgbW9yZSBmaWxlcycsXG4gICAgbm9EdXBsaWNhdGVzOlxuICAgICAgXCJDYW5ub3QgYWRkIHRoZSBkdXBsaWNhdGUgZmlsZSAnJXtmaWxlTmFtZX0nLCBpdCBhbHJlYWR5IGV4aXN0c1wiLFxuICAgIGNvbXBhbmlvbkVycm9yOiAnQ29ubmVjdGlvbiB3aXRoIENvbXBhbmlvbiBmYWlsZWQnLFxuICAgIGF1dGhBYm9ydGVkOiAnQXV0aGVudGljYXRpb24gYWJvcnRlZCcsXG4gICAgY29tcGFuaW9uVW5hdXRob3JpemVIaW50OlxuICAgICAgJ1RvIHVuYXV0aG9yaXplIHRvIHlvdXIgJXtwcm92aWRlcn0gYWNjb3VudCwgcGxlYXNlIGdvIHRvICV7dXJsfScsXG4gICAgZmFpbGVkVG9VcGxvYWQ6ICdGYWlsZWQgdG8gdXBsb2FkICV7ZmlsZX0nLFxuICAgIG5vSW50ZXJuZXRDb25uZWN0aW9uOiAnTm8gSW50ZXJuZXQgY29ubmVjdGlvbicsXG4gICAgY29ubmVjdGVkVG9JbnRlcm5ldDogJ0Nvbm5lY3RlZCB0byB0aGUgSW50ZXJuZXQnLFxuICAgIC8vIFN0cmluZ3MgZm9yIHJlbW90ZSBwcm92aWRlcnNcbiAgICBub0ZpbGVzRm91bmQ6ICdZb3UgaGF2ZSBubyBmaWxlcyBvciBmb2xkZXJzIGhlcmUnLFxuICAgIHNlbGVjdFg6IHtcbiAgICAgIDA6ICdTZWxlY3QgJXtzbWFydF9jb3VudH0nLFxuICAgICAgMTogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fScsXG4gICAgfSxcbiAgICBhbGxGaWxlc0Zyb21Gb2xkZXJOYW1lZDogJ0FsbCBmaWxlcyBmcm9tIGZvbGRlciAle25hbWV9JyxcbiAgICBvcGVuRm9sZGVyTmFtZWQ6ICdPcGVuIGZvbGRlciAle25hbWV9JyxcbiAgICBjYW5jZWw6ICdDYW5jZWwnLFxuICAgIGxvZ091dDogJ0xvZyBvdXQnLFxuICAgIGZpbHRlcjogJ0ZpbHRlcicsXG4gICAgcmVzZXRGaWx0ZXI6ICdSZXNldCBmaWx0ZXInLFxuICAgIGxvYWRpbmc6ICdMb2FkaW5nLi4uJyxcbiAgICBhdXRoZW50aWNhdGVXaXRoVGl0bGU6XG4gICAgICAnUGxlYXNlIGF1dGhlbnRpY2F0ZSB3aXRoICV7cGx1Z2luTmFtZX0gdG8gc2VsZWN0IGZpbGVzJyxcbiAgICBhdXRoZW50aWNhdGVXaXRoOiAnQ29ubmVjdCB0byAle3BsdWdpbk5hbWV9JyxcbiAgICBzaWduSW5XaXRoR29vZ2xlOiAnU2lnbiBpbiB3aXRoIEdvb2dsZScsXG4gICAgc2VhcmNoSW1hZ2VzOiAnU2VhcmNoIGZvciBpbWFnZXMnLFxuICAgIGVudGVyVGV4dFRvU2VhcmNoOiAnRW50ZXIgdGV4dCB0byBzZWFyY2ggZm9yIGltYWdlcycsXG4gICAgYmFja1RvU2VhcmNoOiAnQmFjayB0byBTZWFyY2gnLFxuICAgIGVtcHR5Rm9sZGVyQWRkZWQ6ICdObyBmaWxlcyB3ZXJlIGFkZGVkIGZyb20gZW1wdHkgZm9sZGVyJyxcbiAgICBmb2xkZXJBbHJlYWR5QWRkZWQ6ICdUaGUgZm9sZGVyIFwiJXtmb2xkZXJ9XCIgd2FzIGFscmVhZHkgYWRkZWQnLFxuICAgIGZvbGRlckFkZGVkOiB7XG4gICAgICAwOiAnQWRkZWQgJXtzbWFydF9jb3VudH0gZmlsZSBmcm9tICV7Zm9sZGVyfScsXG4gICAgICAxOiAnQWRkZWQgJXtzbWFydF9jb3VudH0gZmlsZXMgZnJvbSAle2ZvbGRlcn0nLFxuICAgIH0sXG4gIH0sXG59XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5jb25zdCBnZXRUaW1lU3RhbXAgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0VGltZVN0YW1wJylcblxuLy8gU3dhbGxvdyBhbGwgbG9ncywgZXhjZXB0IGVycm9ycy5cbi8vIGRlZmF1bHQgaWYgbG9nZ2VyIGlzIG5vdCBzZXQgb3IgZGVidWc6IGZhbHNlXG5jb25zdCBqdXN0RXJyb3JzTG9nZ2VyID0ge1xuICBkZWJ1ZzogKCkgPT4ge30sXG4gIHdhcm46ICgpID0+IHt9LFxuICBlcnJvcjogKC4uLmFyZ3MpID0+IGNvbnNvbGUuZXJyb3IoYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncyksXG59XG5cbi8vIFByaW50IGxvZ3MgdG8gY29uc29sZSB3aXRoIG5hbWVzcGFjZSArIHRpbWVzdGFtcCxcbi8vIHNldCBieSBsb2dnZXI6IFVwcHkuZGVidWdMb2dnZXIgb3IgZGVidWc6IHRydWVcbmNvbnN0IGRlYnVnTG9nZ2VyID0ge1xuICBkZWJ1ZzogKC4uLmFyZ3MpID0+IGNvbnNvbGUuZGVidWcoYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncyksXG4gIHdhcm46ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gY29uc29sZS5lcnJvcihgW1VwcHldIFske2dldFRpbWVTdGFtcCgpfV1gLCAuLi5hcmdzKSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGp1c3RFcnJvcnNMb2dnZXIsXG4gIGRlYnVnTG9nZ2VyLFxufVxuIiwiLy8gRWRnZSAxNS54IGRvZXMgbm90IGZpcmUgJ3Byb2dyZXNzJyBldmVudHMgb24gdXBsb2Fkcy5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXMvOTQ1XG4vLyBBbmQgaHR0cHM6Ly9kZXZlbG9wZXIubWljcm9zb2Z0LmNvbS9lbi11cy9taWNyb3NvZnQtZWRnZS9wbGF0Zm9ybS9pc3N1ZXMvMTIyMjQ1MTAvXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MgKHVzZXJBZ2VudCkge1xuICAvLyBBbGxvdyBwYXNzaW5nIGluIHVzZXJBZ2VudCBmb3IgdGVzdHNcbiAgaWYgKHVzZXJBZ2VudCA9PSBudWxsKSB7XG4gICAgdXNlckFnZW50ID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IudXNlckFnZW50IDogbnVsbFxuICB9XG4gIC8vIEFzc3VtZSBpdCB3b3JrcyBiZWNhdXNlIGJhc2ljYWxseSBldmVyeXRoaW5nIHN1cHBvcnRzIHByb2dyZXNzIGV2ZW50cy5cbiAgaWYgKCF1c2VyQWdlbnQpIHJldHVybiB0cnVlXG5cbiAgY29uc3QgbSA9IC9FZGdlXFwvKFxcZCtcXC5cXGQrKS8uZXhlYyh1c2VyQWdlbnQpXG4gIGlmICghbSkgcmV0dXJuIHRydWVcblxuICBjb25zdCBlZGdlVmVyc2lvbiA9IG1bMV1cbiAgbGV0IFttYWpvciwgbWlub3JdID0gZWRnZVZlcnNpb24uc3BsaXQoJy4nKVxuICBtYWpvciA9IHBhcnNlSW50KG1ham9yLCAxMClcbiAgbWlub3IgPSBwYXJzZUludChtaW5vciwgMTApXG5cbiAgLy8gV29ya2VkIGJlZm9yZTpcbiAgLy8gRWRnZSA0MC4xNTA2My4wLjBcbiAgLy8gTWljcm9zb2Z0IEVkZ2VIVE1MIDE1LjE1MDYzXG4gIGlmIChtYWpvciA8IDE1IHx8IChtYWpvciA9PT0gMTUgJiYgbWlub3IgPCAxNTA2MykpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gRml4ZWQgaW46XG4gIC8vIE1pY3Jvc29mdCBFZGdlSFRNTCAxOC4xODIxOFxuICBpZiAobWFqb3IgPiAxOCB8fCAobWFqb3IgPT09IDE4ICYmIG1pbm9yID49IDE4MjE4KSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyBvdGhlciB2ZXJzaW9ucyBkb24ndCB3b3JrLlxuICByZXR1cm4gZmFsc2Vcbn1cbiIsImNvbnN0IHsgVUlQbHVnaW4gfSA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUnKVxuY29uc3QgdG9BcnJheSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi90b0FycmF5JylcbmNvbnN0IHsgaCB9ID0gcmVxdWlyZSgncHJlYWN0JylcblxuY29uc3QgbG9jYWxlID0gcmVxdWlyZSgnLi9sb2NhbGUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZpbGVJbnB1dCBleHRlbmRzIFVJUGx1Z2luIHtcbiAgc3RhdGljIFZFUlNJT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uXG5cbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMuaWQgPSB0aGlzLm9wdHMuaWQgfHwgJ0ZpbGVJbnB1dCdcbiAgICB0aGlzLnRpdGxlID0gJ0ZpbGUgSW5wdXQnXG4gICAgdGhpcy50eXBlID0gJ2FjcXVpcmVyJ1xuXG4gICAgdGhpcy5kZWZhdWx0TG9jYWxlID0gbG9jYWxlXG5cbiAgICAvLyBEZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgIHByZXR0eTogdHJ1ZSxcbiAgICAgIGlucHV0TmFtZTogJ2ZpbGVzW10nLFxuICAgIH1cblxuICAgIC8vIE1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgdGhpcy5vcHRzID0geyAuLi5kZWZhdWx0T3B0aW9ucywgLi4ub3B0cyB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIHRoaXMucmVuZGVyID0gdGhpcy5yZW5kZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlSW5wdXRDaGFuZ2UgPSB0aGlzLmhhbmRsZUlucHV0Q2hhbmdlLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUNsaWNrID0gdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpXG4gIH1cblxuICBhZGRGaWxlcyAoZmlsZXMpIHtcbiAgICBjb25zdCBkZXNjcmlwdG9ycyA9IGZpbGVzLm1hcCgoZmlsZSkgPT4gKHtcbiAgICAgIHNvdXJjZTogdGhpcy5pZCxcbiAgICAgIG5hbWU6IGZpbGUubmFtZSxcbiAgICAgIHR5cGU6IGZpbGUudHlwZSxcbiAgICAgIGRhdGE6IGZpbGUsXG4gICAgfSkpXG5cbiAgICB0cnkge1xuICAgICAgdGhpcy51cHB5LmFkZEZpbGVzKGRlc2NyaXB0b3JzKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy51cHB5LmxvZyhlcnIpXG4gICAgfVxuICB9XG5cbiAgaGFuZGxlSW5wdXRDaGFuZ2UgKGV2ZW50KSB7XG4gICAgdGhpcy51cHB5LmxvZygnW0ZpbGVJbnB1dF0gU29tZXRoaW5nIHNlbGVjdGVkIHRocm91Z2ggaW5wdXQuLi4nKVxuICAgIGNvbnN0IGZpbGVzID0gdG9BcnJheShldmVudC50YXJnZXQuZmlsZXMpXG4gICAgdGhpcy5hZGRGaWxlcyhmaWxlcylcblxuICAgIC8vIFdlIGNsZWFyIHRoZSBpbnB1dCBhZnRlciBhIGZpbGUgaXMgc2VsZWN0ZWQsIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgLy8gY2hhbmdlIGV2ZW50IGlzIG5vdCBmaXJlZCBpbiBDaHJvbWUgYW5kIFNhZmFyaSB3aGVuIGEgZmlsZVxuICAgIC8vIHdpdGggdGhlIHNhbWUgbmFtZSBpcyBzZWxlY3RlZC5cbiAgICAvLyBfX19XaHkgbm90IHVzZSB2YWx1ZT1cIlwiIG9uIDxpbnB1dC8+IGluc3RlYWQ/XG4gICAgLy8gICAgQmVjYXVzZSBpZiB3ZSB1c2UgdGhhdCBtZXRob2Qgb2YgY2xlYXJpbmcgdGhlIGlucHV0LFxuICAgIC8vICAgIENocm9tZSB3aWxsIG5vdCB0cmlnZ2VyIGNoYW5nZSBpZiB3ZSBkcm9wIHRoZSBzYW1lIGZpbGUgdHdpY2UgKElzc3VlICM3NjgpLlxuICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IG51bGxcbiAgfVxuXG4gIGhhbmRsZUNsaWNrICgpIHtcbiAgICB0aGlzLmlucHV0LmNsaWNrKClcbiAgfVxuXG4gIHJlbmRlciAoKSB7XG4gICAgLyogaHR0cDovL3R5bXBhbnVzLm5ldC9jb2Ryb3BzLzIwMTUvMDkvMTUvc3R5bGluZy1jdXN0b21pemluZy1maWxlLWlucHV0cy1zbWFydC13YXkvICovXG4gICAgY29uc3QgaGlkZGVuSW5wdXRTdHlsZSA9IHtcbiAgICAgIHdpZHRoOiAnMC4xcHgnLFxuICAgICAgaGVpZ2h0OiAnMC4xcHgnLFxuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgekluZGV4OiAtMSxcbiAgICB9XG5cbiAgICBjb25zdCB7IHJlc3RyaWN0aW9ucyB9ID0gdGhpcy51cHB5Lm9wdHNcbiAgICBjb25zdCBhY2NlcHQgPSByZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlcyA/IHJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzLmpvaW4oJywnKSA6IG51bGxcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInVwcHktUm9vdCB1cHB5LUZpbGVJbnB1dC1jb250YWluZXJcIj5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2xhc3NOYW1lPVwidXBweS1GaWxlSW5wdXQtaW5wdXRcIlxuICAgICAgICAgIHN0eWxlPXt0aGlzLm9wdHMucHJldHR5ICYmIGhpZGRlbklucHV0U3R5bGV9XG4gICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgIG5hbWU9e3RoaXMub3B0cy5pbnB1dE5hbWV9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuaGFuZGxlSW5wdXRDaGFuZ2V9XG4gICAgICAgICAgbXVsdGlwbGU9e3Jlc3RyaWN0aW9ucy5tYXhOdW1iZXJPZkZpbGVzICE9PSAxfVxuICAgICAgICAgIGFjY2VwdD17YWNjZXB0fVxuICAgICAgICAgIHJlZj17KGlucHV0KSA9PiB7IHRoaXMuaW5wdXQgPSBpbnB1dCB9fVxuICAgICAgICAvPlxuICAgICAgICB7dGhpcy5vcHRzLnByZXR0eVxuICAgICAgICAgICYmIChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ1cHB5LUZpbGVJbnB1dC1idG5cIlxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt0aGlzLmkxOG4oJ2Nob29zZUZpbGVzJyl9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSB0aGlzLm9wdHNcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLm1vdW50KHRhcmdldCwgdGhpcylcbiAgICB9XG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIHRoaXMudW5tb3VudCgpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBzdHJpbmdzOiB7XG4gICAgLy8gVGhlIHNhbWUga2V5IGlzIHVzZWQgZm9yIHRoZSBzYW1lIHB1cnBvc2UgYnkgQHVwcHkvcm9ib2RvZydzIGBmb3JtKClgIEFQSSwgYnV0IG91clxuICAgIC8vIGxvY2FsZSBwYWNrIHNjcmlwdHMgY2FuJ3QgYWNjZXNzIGl0IGluIFJvYm9kb2cuIElmIGl0IGlzIHVwZGF0ZWQgaGVyZSwgaXQgc2hvdWxkXG4gICAgLy8gYWxzbyBiZSB1cGRhdGVkIHRoZXJlIVxuICAgIGNob29zZUZpbGVzOiAnQ2hvb3NlIGZpbGVzJyxcbiAgfSxcbn1cbiIsImNvbnN0IHsgVUlQbHVnaW4gfSA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUnKVxuY29uc3QgeyBoIH0gPSByZXF1aXJlKCdwcmVhY3QnKVxuXG4vKipcbiAqIFByb2dyZXNzIGJhclxuICpcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQcm9ncmVzc0JhciBleHRlbmRzIFVJUGx1Z2luIHtcbiAgc3RhdGljIFZFUlNJT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uXG5cbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMuaWQgPSB0aGlzLm9wdHMuaWQgfHwgJ1Byb2dyZXNzQmFyJ1xuICAgIHRoaXMudGl0bGUgPSAnUHJvZ3Jlc3MgQmFyJ1xuICAgIHRoaXMudHlwZSA9ICdwcm9ncmVzc2luZGljYXRvcidcblxuICAgIC8vIHNldCBkZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIHRhcmdldDogJ2JvZHknLFxuICAgICAgZml4ZWQ6IGZhbHNlLFxuICAgICAgaGlkZUFmdGVyRmluaXNoOiB0cnVlLFxuICAgIH1cblxuICAgIC8vIG1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgdGhpcy5vcHRzID0geyAuLi5kZWZhdWx0T3B0aW9ucywgLi4ub3B0cyB9XG5cbiAgICB0aGlzLnJlbmRlciA9IHRoaXMucmVuZGVyLmJpbmQodGhpcylcbiAgfVxuXG4gIHJlbmRlciAoc3RhdGUpIHtcbiAgICBjb25zdCBwcm9ncmVzcyA9IHN0YXRlLnRvdGFsUHJvZ3Jlc3MgfHwgMFxuICAgIC8vIGJlZm9yZSBzdGFydGluZyBhbmQgYWZ0ZXIgZmluaXNoIHNob3VsZCBiZSBoaWRkZW4gaWYgc3BlY2lmaWVkIGluIHRoZSBvcHRpb25zXG4gICAgY29uc3QgaXNIaWRkZW4gPSAocHJvZ3Jlc3MgPT09IDAgfHwgcHJvZ3Jlc3MgPT09IDEwMCkgJiYgdGhpcy5vcHRzLmhpZGVBZnRlckZpbmlzaFxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cInVwcHkgdXBweS1Qcm9ncmVzc0JhclwiXG4gICAgICAgIHN0eWxlPXt7IHBvc2l0aW9uOiB0aGlzLm9wdHMuZml4ZWQgPyAnZml4ZWQnIDogJ2luaXRpYWwnIH19XG4gICAgICAgIGFyaWEtaGlkZGVuPXtpc0hpZGRlbn1cbiAgICAgID5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVByb2dyZXNzQmFyLWlubmVyXCIgc3R5bGU9e3sgd2lkdGg6IGAke3Byb2dyZXNzfSVgIH19IC8+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidXBweS1Qcm9ncmVzc0Jhci1wZXJjZW50YWdlXCI+e3Byb2dyZXNzfTwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG4gICAgY29uc3QgeyB0YXJnZXQgfSA9IHRoaXMub3B0c1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubW91bnQodGFyZ2V0LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxufVxuIiwiLyoqXG4gKiBEZWZhdWx0IHN0b3JlIHRoYXQga2VlcHMgc3RhdGUgaW4gYSBzaW1wbGUgb2JqZWN0LlxuICovXG5jbGFzcyBEZWZhdWx0U3RvcmUge1xuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHt9XG4gICAgdGhpcy5jYWxsYmFja3MgPSBbXVxuICB9XG5cbiAgZ2V0U3RhdGUgKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXRlXG4gIH1cblxuICBzZXRTdGF0ZSAocGF0Y2gpIHtcbiAgICBjb25zdCBwcmV2U3RhdGUgPSB7IC4uLnRoaXMuc3RhdGUgfVxuICAgIGNvbnN0IG5leHRTdGF0ZSA9IHsgLi4udGhpcy5zdGF0ZSwgLi4ucGF0Y2ggfVxuXG4gICAgdGhpcy5zdGF0ZSA9IG5leHRTdGF0ZVxuICAgIHRoaXMuI3B1Ymxpc2gocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKVxuICB9XG5cbiAgc3Vic2NyaWJlIChsaXN0ZW5lcikge1xuICAgIHRoaXMuY2FsbGJhY2tzLnB1c2gobGlzdGVuZXIpXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIC8vIFJlbW92ZSB0aGUgbGlzdGVuZXIuXG4gICAgICB0aGlzLmNhbGxiYWNrcy5zcGxpY2UoXG4gICAgICAgIHRoaXMuY2FsbGJhY2tzLmluZGV4T2YobGlzdGVuZXIpLFxuICAgICAgICAxLFxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gICNwdWJsaXNoICguLi5hcmdzKSB7XG4gICAgdGhpcy5jYWxsYmFja3MuZm9yRWFjaCgobGlzdGVuZXIpID0+IHtcbiAgICAgIGxpc3RlbmVyKC4uLmFyZ3MpXG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmF1bHRTdG9yZSAoKSB7XG4gIHJldHVybiBuZXcgRGVmYXVsdFN0b3JlKClcbn1cbiIsIi8qKlxuICogQ3JlYXRlIGEgd3JhcHBlciBhcm91bmQgYW4gZXZlbnQgZW1pdHRlciB3aXRoIGEgYHJlbW92ZWAgbWV0aG9kIHRvIHJlbW92ZVxuICogYWxsIGV2ZW50cyB0aGF0IHdlcmUgYWRkZWQgdXNpbmcgdGhlIHdyYXBwZWQgZW1pdHRlci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBFdmVudFRyYWNrZXIge1xuICAjZW1pdHRlclxuXG4gICNldmVudHMgPSBbXVxuXG4gIGNvbnN0cnVjdG9yIChlbWl0dGVyKSB7XG4gICAgdGhpcy4jZW1pdHRlciA9IGVtaXR0ZXJcbiAgfVxuXG4gIG9uIChldmVudCwgZm4pIHtcbiAgICB0aGlzLiNldmVudHMucHVzaChbZXZlbnQsIGZuXSlcbiAgICByZXR1cm4gdGhpcy4jZW1pdHRlci5vbihldmVudCwgZm4pXG4gIH1cblxuICByZW1vdmUgKCkge1xuICAgIGZvciAoY29uc3QgW2V2ZW50LCBmbl0gb2YgdGhpcy4jZXZlbnRzLnNwbGljZSgwKSkge1xuICAgICAgdGhpcy4jZW1pdHRlci5vZmYoZXZlbnQsIGZuKVxuICAgIH1cbiAgfVxufVxuIiwiY2xhc3MgTmV0d29ya0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvciAoZXJyb3IsIHhociA9IG51bGwpIHtcbiAgICBzdXBlcihgVGhpcyBsb29rcyBsaWtlIGEgbmV0d29yayBlcnJvciwgdGhlIGVuZHBvaW50IG1pZ2h0IGJlIGJsb2NrZWQgYnkgYW4gaW50ZXJuZXQgcHJvdmlkZXIgb3IgYSBmaXJld2FsbC5gKVxuXG4gICAgdGhpcy5jYXVzZSA9IGVycm9yXG4gICAgdGhpcy5pc05ldHdvcmtFcnJvciA9IHRydWVcbiAgICB0aGlzLnJlcXVlc3QgPSB4aHJcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE5ldHdvcmtFcnJvclxuIiwiLyoqXG4gKiBIZWxwZXIgdG8gYWJvcnQgdXBsb2FkIHJlcXVlc3RzIGlmIHRoZXJlIGhhcyBub3QgYmVlbiBhbnkgcHJvZ3Jlc3MgZm9yIGB0aW1lb3V0YCBtcy5cbiAqIENyZWF0ZSBhbiBpbnN0YW5jZSB1c2luZyBgdGltZXIgPSBuZXcgUHJvZ3Jlc3NUaW1lb3V0KDEwMDAwLCBvblRpbWVvdXQpYFxuICogQ2FsbCBgdGltZXIucHJvZ3Jlc3MoKWAgdG8gc2lnbmFsIHRoYXQgdGhlcmUgaGFzIGJlZW4gcHJvZ3Jlc3Mgb2YgYW55IGtpbmQuXG4gKiBDYWxsIGB0aW1lci5kb25lKClgIHdoZW4gdGhlIHVwbG9hZCBoYXMgY29tcGxldGVkLlxuICovXG5jbGFzcyBQcm9ncmVzc1RpbWVvdXQge1xuICAjYWxpdmVUaW1lcjtcblxuICAjaXNEb25lID0gZmFsc2U7XG5cbiAgI29uVGltZWRPdXQ7XG5cbiAgI3RpbWVvdXQ7XG5cbiAgY29uc3RydWN0b3IgKHRpbWVvdXQsIHRpbWVvdXRIYW5kbGVyKSB7XG4gICAgdGhpcy4jdGltZW91dCA9IHRpbWVvdXRcbiAgICB0aGlzLiNvblRpbWVkT3V0ID0gdGltZW91dEhhbmRsZXJcbiAgfVxuXG4gIHByb2dyZXNzICgpIHtcbiAgICAvLyBTb21lIGJyb3dzZXJzIGZpcmUgYW5vdGhlciBwcm9ncmVzcyBldmVudCB3aGVuIHRoZSB1cGxvYWQgaXNcbiAgICAvLyBjYW5jZWxsZWQsIHNvIHdlIGhhdmUgdG8gaWdub3JlIHByb2dyZXNzIGFmdGVyIHRoZSB0aW1lciB3YXNcbiAgICAvLyB0b2xkIHRvIHN0b3AuXG4gICAgaWYgKHRoaXMuI2lzRG9uZSkgcmV0dXJuXG5cbiAgICBpZiAodGhpcy4jdGltZW91dCA+IDApIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLiNhbGl2ZVRpbWVyKVxuICAgICAgdGhpcy4jYWxpdmVUaW1lciA9IHNldFRpbWVvdXQodGhpcy4jb25UaW1lZE91dCwgdGhpcy4jdGltZW91dClcbiAgICB9XG4gIH1cblxuICBkb25lICgpIHtcbiAgICBpZiAoIXRoaXMuI2lzRG9uZSkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuI2FsaXZlVGltZXIpXG4gICAgICB0aGlzLiNhbGl2ZVRpbWVyID0gbnVsbFxuICAgICAgdGhpcy4jaXNEb25lID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2dyZXNzVGltZW91dFxuIiwiZnVuY3Rpb24gY3JlYXRlQ2FuY2VsRXJyb3IgKCkge1xuICByZXR1cm4gbmV3IEVycm9yKCdDYW5jZWxsZWQnKVxufVxuXG5jbGFzcyBSYXRlTGltaXRlZFF1ZXVlIHtcbiAgI2FjdGl2ZVJlcXVlc3RzID0gMFxuXG4gICNxdWV1ZWRIYW5kbGVycyA9IFtdXG5cbiAgY29uc3RydWN0b3IgKGxpbWl0KSB7XG4gICAgaWYgKHR5cGVvZiBsaW1pdCAhPT0gJ251bWJlcicgfHwgbGltaXQgPT09IDApIHtcbiAgICAgIHRoaXMubGltaXQgPSBJbmZpbml0eVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxpbWl0ID0gbGltaXRcbiAgICB9XG4gIH1cblxuICAjY2FsbCAoZm4pIHtcbiAgICB0aGlzLiNhY3RpdmVSZXF1ZXN0cyArPSAxXG5cbiAgICBsZXQgZG9uZSA9IGZhbHNlXG5cbiAgICBsZXQgY2FuY2VsQWN0aXZlXG4gICAgdHJ5IHtcbiAgICAgIGNhbmNlbEFjdGl2ZSA9IGZuKClcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIHRoaXMuI2FjdGl2ZVJlcXVlc3RzIC09IDFcbiAgICAgIHRocm93IGVyclxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBhYm9ydDogKCkgPT4ge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuXG4gICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgIHRoaXMuI2FjdGl2ZVJlcXVlc3RzIC09IDFcbiAgICAgICAgY2FuY2VsQWN0aXZlKClcbiAgICAgICAgdGhpcy4jcXVldWVOZXh0KClcbiAgICAgIH0sXG5cbiAgICAgIGRvbmU6ICgpID0+IHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVyblxuICAgICAgICBkb25lID0gdHJ1ZVxuICAgICAgICB0aGlzLiNhY3RpdmVSZXF1ZXN0cyAtPSAxXG4gICAgICAgIHRoaXMuI3F1ZXVlTmV4dCgpXG4gICAgICB9LFxuICAgIH1cbiAgfVxuXG4gICNxdWV1ZU5leHQgKCkge1xuICAgIC8vIERvIGl0IHNvb24gYnV0IG5vdCBpbW1lZGlhdGVseSwgdGhpcyBhbGxvd3MgY2xlYXJpbmcgb3V0IHRoZSBlbnRpcmUgcXVldWUgc3luY2hyb25vdXNseVxuICAgIC8vIG9uZSBieSBvbmUgd2l0aG91dCBjb250aW51b3VzbHkgX2FkdmFuY2luZ18gaXQgKGFuZCBzdGFydGluZyBuZXcgdGFza3MgYmVmb3JlIGltbWVkaWF0ZWx5XG4gICAgLy8gYWJvcnRpbmcgdGhlbSlcbiAgICBxdWV1ZU1pY3JvdGFzaygoKSA9PiB0aGlzLiNuZXh0KCkpXG4gIH1cblxuICAjbmV4dCAoKSB7XG4gICAgaWYgKHRoaXMuI2FjdGl2ZVJlcXVlc3RzID49IHRoaXMubGltaXQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy4jcXVldWVkSGFuZGxlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgbmV4dCByZXF1ZXN0LCBhbmQgdXBkYXRlIHRoZSBhYm9ydC9kb25lIGhhbmRsZXJzXG4gICAgLy8gc28gdGhhdCBjYW5jZWxsaW5nIGl0IGRvZXMgdGhlIFJpZ2h0IFRoaW5nIChhbmQgZG9lc24ndCBqdXN0IHRyeVxuICAgIC8vIHRvIGRlcXVldWUgYW4gYWxyZWFkeS1ydW5uaW5nIHJlcXVlc3QpLlxuICAgIGNvbnN0IG5leHQgPSB0aGlzLiNxdWV1ZWRIYW5kbGVycy5zaGlmdCgpXG4gICAgY29uc3QgaGFuZGxlciA9IHRoaXMuI2NhbGwobmV4dC5mbilcbiAgICBuZXh0LmFib3J0ID0gaGFuZGxlci5hYm9ydFxuICAgIG5leHQuZG9uZSA9IGhhbmRsZXIuZG9uZVxuICB9XG5cbiAgI3F1ZXVlIChmbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgaGFuZGxlciA9IHtcbiAgICAgIGZuLFxuICAgICAgcHJpb3JpdHk6IG9wdGlvbnMucHJpb3JpdHkgfHwgMCxcbiAgICAgIGFib3J0OiAoKSA9PiB7XG4gICAgICAgIHRoaXMuI2RlcXVldWUoaGFuZGxlcilcbiAgICAgIH0sXG4gICAgICBkb25lOiAoKSA9PiB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IG1hcmsgYSBxdWV1ZWQgcmVxdWVzdCBhcyBkb25lOiB0aGlzIGluZGljYXRlcyBhIGJ1ZycpXG4gICAgICB9LFxuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gdGhpcy4jcXVldWVkSGFuZGxlcnMuZmluZEluZGV4KChvdGhlcikgPT4ge1xuICAgICAgcmV0dXJuIGhhbmRsZXIucHJpb3JpdHkgPiBvdGhlci5wcmlvcml0eVxuICAgIH0pXG4gICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgdGhpcy4jcXVldWVkSGFuZGxlcnMucHVzaChoYW5kbGVyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLiNxdWV1ZWRIYW5kbGVycy5zcGxpY2UoaW5kZXgsIDAsIGhhbmRsZXIpXG4gICAgfVxuICAgIHJldHVybiBoYW5kbGVyXG4gIH1cblxuICAjZGVxdWV1ZSAoaGFuZGxlcikge1xuICAgIGNvbnN0IGluZGV4ID0gdGhpcy4jcXVldWVkSGFuZGxlcnMuaW5kZXhPZihoYW5kbGVyKVxuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIHRoaXMuI3F1ZXVlZEhhbmRsZXJzLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG4gIH1cblxuICBydW4gKGZuLCBxdWV1ZU9wdGlvbnMpIHtcbiAgICBpZiAodGhpcy4jYWN0aXZlUmVxdWVzdHMgPCB0aGlzLmxpbWl0KSB7XG4gICAgICByZXR1cm4gdGhpcy4jY2FsbChmbilcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuI3F1ZXVlKGZuLCBxdWV1ZU9wdGlvbnMpXG4gIH1cblxuICB3cmFwUHJvbWlzZUZ1bmN0aW9uIChmbiwgcXVldWVPcHRpb25zKSB7XG4gICAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgICBsZXQgcXVldWVkUmVxdWVzdFxuICAgICAgY29uc3Qgb3V0ZXJQcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBxdWV1ZWRSZXF1ZXN0ID0gdGhpcy5ydW4oKCkgPT4ge1xuICAgICAgICAgIGxldCBjYW5jZWxFcnJvclxuICAgICAgICAgIGxldCBpbm5lclByb21pc2VcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaW5uZXJQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKGZuKC4uLmFyZ3MpKVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgaW5uZXJQcm9taXNlID0gUHJvbWlzZS5yZWplY3QoZXJyKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlubmVyUHJvbWlzZS50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgIGlmIChjYW5jZWxFcnJvcikge1xuICAgICAgICAgICAgICByZWplY3QoY2FuY2VsRXJyb3IpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2FuY2VsRXJyb3IpIHtcbiAgICAgICAgICAgICAgcmVqZWN0KGNhbmNlbEVycm9yKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcXVldWVkUmVxdWVzdC5kb25lKClcbiAgICAgICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIGNhbmNlbEVycm9yID0gY3JlYXRlQ2FuY2VsRXJyb3IoKVxuICAgICAgICAgIH1cbiAgICAgICAgfSwgcXVldWVPcHRpb25zKVxuICAgICAgfSlcblxuICAgICAgb3V0ZXJQcm9taXNlLmFib3J0ID0gKCkgPT4ge1xuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dGVyUHJvbWlzZVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUmF0ZUxpbWl0ZWRRdWV1ZSxcbiAgaW50ZXJuYWxSYXRlTGltaXRlZFF1ZXVlOiBTeW1ib2woJ19fcXVldWUnKSxcbn1cbiIsImNvbnN0IGhhcyA9IHJlcXVpcmUoJy4vaGFzUHJvcGVydHknKVxuXG5mdW5jdGlvbiBpbnNlcnRSZXBsYWNlbWVudCAoc291cmNlLCByeCwgcmVwbGFjZW1lbnQpIHtcbiAgY29uc3QgbmV3UGFydHMgPSBbXVxuICBzb3VyY2UuZm9yRWFjaCgoY2h1bmspID0+IHtcbiAgICAvLyBXaGVuIHRoZSBzb3VyY2UgY29udGFpbnMgbXVsdGlwbGUgcGxhY2Vob2xkZXJzIGZvciBpbnRlcnBvbGF0aW9uLFxuICAgIC8vIHdlIHNob3VsZCBpZ25vcmUgY2h1bmtzIHRoYXQgYXJlIG5vdCBzdHJpbmdzLCBiZWNhdXNlIHRob3NlXG4gICAgLy8gY2FuIGJlIEpTWCBvYmplY3RzIGFuZCB3aWxsIGJlIG90aGVyd2lzZSBpbmNvcnJlY3RseSB0dXJuZWQgaW50byBzdHJpbmdzLlxuICAgIC8vIFdpdGhvdXQgdGhpcyBjb25kaXRpb24gd2XigJlkIGdldCB0aGlzOiBbb2JqZWN0IE9iamVjdF0gaGVsbG8gW29iamVjdCBPYmplY3RdIG15IDxidXR0b24+XG4gICAgaWYgKHR5cGVvZiBjaHVuayAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiBuZXdQYXJ0cy5wdXNoKGNodW5rKVxuICAgIH1cblxuICAgIHJldHVybiByeFtTeW1ib2wuc3BsaXRdKGNodW5rKS5mb3JFYWNoKChyYXcsIGksIGxpc3QpID0+IHtcbiAgICAgIGlmIChyYXcgIT09ICcnKSB7XG4gICAgICAgIG5ld1BhcnRzLnB1c2gocmF3KVxuICAgICAgfVxuXG4gICAgICAvLyBJbnRlcmxhY2Ugd2l0aCB0aGUgYHJlcGxhY2VtZW50YCB2YWx1ZVxuICAgICAgaWYgKGkgPCBsaXN0Lmxlbmd0aCAtIDEpIHtcbiAgICAgICAgbmV3UGFydHMucHVzaChyZXBsYWNlbWVudClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuICByZXR1cm4gbmV3UGFydHNcbn1cblxuLyoqXG4gKiBUYWtlcyBhIHN0cmluZyB3aXRoIHBsYWNlaG9sZGVyIHZhcmlhYmxlcyBsaWtlIGAle3NtYXJ0X2NvdW50fSBmaWxlIHNlbGVjdGVkYFxuICogYW5kIHJlcGxhY2VzIGl0IHdpdGggdmFsdWVzIGZyb20gb3B0aW9ucyBge3NtYXJ0X2NvdW50OiA1fWBcbiAqXG4gKiBAbGljZW5zZSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL0xJQ0VOU0VcbiAqIHRha2VuIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcy9ibG9iL21hc3Rlci9saWIvcG9seWdsb3QuanMjTDI5OVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwaHJhc2UgdGhhdCBuZWVkcyBpbnRlcnBvbGF0aW9uLCB3aXRoIHBsYWNlaG9sZGVyc1xuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgd2l0aCB2YWx1ZXMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gcmVwbGFjZSBwbGFjZWhvbGRlcnNcbiAqIEByZXR1cm5zIHthbnlbXX0gaW50ZXJwb2xhdGVkXG4gKi9cbmZ1bmN0aW9uIGludGVycG9sYXRlIChwaHJhc2UsIG9wdGlvbnMpIHtcbiAgY29uc3QgZG9sbGFyUmVnZXggPSAvXFwkL2dcbiAgY29uc3QgZG9sbGFyQmlsbHNZYWxsID0gJyQkJCQnXG4gIGxldCBpbnRlcnBvbGF0ZWQgPSBbcGhyYXNlXVxuXG4gIGlmIChvcHRpb25zID09IG51bGwpIHJldHVybiBpbnRlcnBvbGF0ZWRcblxuICBmb3IgKGNvbnN0IGFyZyBvZiBPYmplY3Qua2V5cyhvcHRpb25zKSkge1xuICAgIGlmIChhcmcgIT09ICdfJykge1xuICAgICAgLy8gRW5zdXJlIHJlcGxhY2VtZW50IHZhbHVlIGlzIGVzY2FwZWQgdG8gcHJldmVudCBzcGVjaWFsICQtcHJlZml4ZWRcbiAgICAgIC8vIHJlZ2V4IHJlcGxhY2UgdG9rZW5zLiB0aGUgXCIkJCQkXCIgaXMgbmVlZGVkIGJlY2F1c2UgZWFjaCBcIiRcIiBuZWVkcyB0b1xuICAgICAgLy8gYmUgZXNjYXBlZCB3aXRoIFwiJFwiIGl0c2VsZiwgYW5kIHdlIG5lZWQgdHdvIGluIHRoZSByZXN1bHRpbmcgb3V0cHV0LlxuICAgICAgbGV0IHJlcGxhY2VtZW50ID0gb3B0aW9uc1thcmddXG4gICAgICBpZiAodHlwZW9mIHJlcGxhY2VtZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXBsYWNlbWVudCA9IGRvbGxhclJlZ2V4W1N5bWJvbC5yZXBsYWNlXShyZXBsYWNlbWVudCwgZG9sbGFyQmlsbHNZYWxsKVxuICAgICAgfVxuICAgICAgLy8gV2UgY3JlYXRlIGEgbmV3IGBSZWdFeHBgIGVhY2ggdGltZSBpbnN0ZWFkIG9mIHVzaW5nIGEgbW9yZS1lZmZpY2llbnRcbiAgICAgIC8vIHN0cmluZyByZXBsYWNlIHNvIHRoYXQgdGhlIHNhbWUgYXJndW1lbnQgY2FuIGJlIHJlcGxhY2VkIG11bHRpcGxlIHRpbWVzXG4gICAgICAvLyBpbiB0aGUgc2FtZSBwaHJhc2UuXG4gICAgICBpbnRlcnBvbGF0ZWQgPSBpbnNlcnRSZXBsYWNlbWVudChpbnRlcnBvbGF0ZWQsIG5ldyBSZWdFeHAoYCVcXFxceyR7YXJnfVxcXFx9YCwgJ2cnKSwgcmVwbGFjZW1lbnQpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGludGVycG9sYXRlZFxufVxuXG4vKipcbiAqIFRyYW5zbGF0ZXMgc3RyaW5ncyB3aXRoIGludGVycG9sYXRpb24gJiBwbHVyYWxpemF0aW9uIHN1cHBvcnQuXG4gKiBFeHRlbnNpYmxlIHdpdGggY3VzdG9tIGRpY3Rpb25hcmllcyBhbmQgcGx1cmFsaXphdGlvbiBmdW5jdGlvbnMuXG4gKlxuICogQm9ycm93cyBoZWF2aWx5IGZyb20gYW5kIGluc3BpcmVkIGJ5IFBvbHlnbG90IGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcG9seWdsb3QuanMsXG4gKiBiYXNpY2FsbHkgYSBzdHJpcHBlZC1kb3duIHZlcnNpb24gb2YgaXQuIERpZmZlcmVuY2VzOiBwbHVyYWxpemF0aW9uIGZ1bmN0aW9ucyBhcmUgbm90IGhhcmRjb2RlZFxuICogYW5kIGNhbiBiZSBlYXNpbHkgYWRkZWQgYW1vbmcgd2l0aCBkaWN0aW9uYXJpZXMsIG5lc3RlZCBvYmplY3RzIGFyZSB1c2VkIGZvciBwbHVyYWxpemF0aW9uXG4gKiBhcyBvcHBvc2VkIHRvIGB8fHx8YCBkZWxpbWV0ZXJcbiAqXG4gKiBVc2FnZSBleGFtcGxlOiBgdHJhbnNsYXRvci50cmFuc2xhdGUoJ2ZpbGVzX2Nob3NlbicsIHtzbWFydF9jb3VudDogM30pYFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFRyYW5zbGF0b3Ige1xuICAvKipcbiAgICogQHBhcmFtIHtvYmplY3R8QXJyYXk8b2JqZWN0Pn0gbG9jYWxlcyAtIGxvY2FsZSBvciBsaXN0IG9mIGxvY2FsZXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvciAobG9jYWxlcykge1xuICAgIHRoaXMubG9jYWxlID0ge1xuICAgICAgc3RyaW5nczoge30sXG4gICAgICBwbHVyYWxpemUgKG4pIHtcbiAgICAgICAgaWYgKG4gPT09IDEpIHtcbiAgICAgICAgICByZXR1cm4gMFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9LFxuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KGxvY2FsZXMpKSB7XG4gICAgICBsb2NhbGVzLmZvckVhY2godGhpcy4jYXBwbHksIHRoaXMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuI2FwcGx5KGxvY2FsZXMpXG4gICAgfVxuICB9XG5cbiAgI2FwcGx5IChsb2NhbGUpIHtcbiAgICBpZiAoIWxvY2FsZT8uc3RyaW5ncykge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgcHJldkxvY2FsZSA9IHRoaXMubG9jYWxlXG4gICAgdGhpcy5sb2NhbGUgPSB7IC4uLnByZXZMb2NhbGUsIHN0cmluZ3M6IHsgLi4ucHJldkxvY2FsZS5zdHJpbmdzLCAuLi5sb2NhbGUuc3RyaW5ncyB9IH1cbiAgICB0aGlzLmxvY2FsZS5wbHVyYWxpemUgPSBsb2NhbGUucGx1cmFsaXplIHx8IHByZXZMb2NhbGUucGx1cmFsaXplXG4gIH1cblxuICAvKipcbiAgICogUHVibGljIHRyYW5zbGF0ZSBtZXRob2RcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCBsYXRlciB0byByZXBsYWNlIHBsYWNlaG9sZGVycyBpbiBzdHJpbmdcbiAgICogQHJldHVybnMge3N0cmluZ30gdHJhbnNsYXRlZCAoYW5kIGludGVycG9sYXRlZClcbiAgICovXG4gIHRyYW5zbGF0ZSAoa2V5LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudHJhbnNsYXRlQXJyYXkoa2V5LCBvcHRpb25zKS5qb2luKCcnKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHRyYW5zbGF0aW9uIGFuZCByZXR1cm4gdGhlIHRyYW5zbGF0ZWQgYW5kIGludGVycG9sYXRlZCBwYXJ0cyBhcyBhbiBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVyc1xuICAgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSB0cmFuc2xhdGVkIGFuZCBpbnRlcnBvbGF0ZWQgcGFydHMsIGluIG9yZGVyLlxuICAgKi9cbiAgdHJhbnNsYXRlQXJyYXkgKGtleSwgb3B0aW9ucykge1xuICAgIGlmICghaGFzKHRoaXMubG9jYWxlLnN0cmluZ3MsIGtleSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbWlzc2luZyBzdHJpbmc6ICR7a2V5fWApXG4gICAgfVxuXG4gICAgY29uc3Qgc3RyaW5nID0gdGhpcy5sb2NhbGUuc3RyaW5nc1trZXldXG4gICAgY29uc3QgaGFzUGx1cmFsRm9ybXMgPSB0eXBlb2Ygc3RyaW5nID09PSAnb2JqZWN0J1xuXG4gICAgaWYgKGhhc1BsdXJhbEZvcm1zKSB7XG4gICAgICBpZiAob3B0aW9ucyAmJiB0eXBlb2Ygb3B0aW9ucy5zbWFydF9jb3VudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgY29uc3QgcGx1cmFsID0gdGhpcy5sb2NhbGUucGx1cmFsaXplKG9wdGlvbnMuc21hcnRfY291bnQpXG4gICAgICAgIHJldHVybiBpbnRlcnBvbGF0ZShzdHJpbmdbcGx1cmFsXSwgb3B0aW9ucylcbiAgICAgIH1cbiAgICAgIHRocm93IG5ldyBFcnJvcignQXR0ZW1wdGVkIHRvIHVzZSBhIHN0cmluZyB3aXRoIHBsdXJhbCBmb3JtcywgYnV0IG5vIHZhbHVlIHdhcyBnaXZlbiBmb3IgJXtzbWFydF9jb3VudH0nKVxuICAgIH1cblxuICAgIHJldHVybiBpbnRlcnBvbGF0ZShzdHJpbmcsIG9wdGlvbnMpXG4gIH1cbn1cbiIsImNvbnN0IHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJylcblxuZnVuY3Rpb24gZW1pdFNvY2tldFByb2dyZXNzICh1cGxvYWRlciwgcHJvZ3Jlc3NEYXRhLCBmaWxlKSB7XG4gIGNvbnN0IHsgcHJvZ3Jlc3MsIGJ5dGVzVXBsb2FkZWQsIGJ5dGVzVG90YWwgfSA9IHByb2dyZXNzRGF0YVxuICBpZiAocHJvZ3Jlc3MpIHtcbiAgICB1cGxvYWRlci51cHB5LmxvZyhgVXBsb2FkIHByb2dyZXNzOiAke3Byb2dyZXNzfWApXG4gICAgdXBsb2FkZXIudXBweS5lbWl0KCd1cGxvYWQtcHJvZ3Jlc3MnLCBmaWxlLCB7XG4gICAgICB1cGxvYWRlcixcbiAgICAgIGJ5dGVzVXBsb2FkZWQsXG4gICAgICBieXRlc1RvdGFsLFxuICAgIH0pXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0aHJvdHRsZShlbWl0U29ja2V0UHJvZ3Jlc3MsIDMwMCwge1xuICBsZWFkaW5nOiB0cnVlLFxuICB0cmFpbGluZzogdHJ1ZSxcbn0pXG4iLCJjb25zdCBOZXR3b3JrRXJyb3IgPSByZXF1aXJlKCcuL05ldHdvcmtFcnJvcicpXG5cbi8qKlxuICogV3JhcHBlciBhcm91bmQgd2luZG93LmZldGNoIHRoYXQgdGhyb3dzIGEgTmV0d29ya0Vycm9yIHdoZW4gYXBwcm9wcmlhdGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmZXRjaFdpdGhOZXR3b3JrRXJyb3IgKC4uLm9wdGlvbnMpIHtcbiAgcmV0dXJuIGZldGNoKC4uLm9wdGlvbnMpXG4gICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIGlmIChlcnIubmFtZSA9PT0gJ0Fib3J0RXJyb3InKSB7XG4gICAgICAgIHRocm93IGVyclxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IE5ldHdvcmtFcnJvcihlcnIpXG4gICAgICB9XG4gICAgfSlcbn1cbiIsImNvbnN0IGlzRE9NRWxlbWVudCA9IHJlcXVpcmUoJy4vaXNET01FbGVtZW50JylcblxuLyoqXG4gKiBGaW5kIGEgRE9NIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtOb2RlfHN0cmluZ30gZWxlbWVudFxuICogQHJldHVybnMge05vZGV8bnVsbH1cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBmaW5kRE9NRWxlbWVudCAoZWxlbWVudCwgY29udGV4dCA9IGRvY3VtZW50KSB7XG4gIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY29udGV4dC5xdWVyeVNlbGVjdG9yKGVsZW1lbnQpXG4gIH1cblxuICBpZiAoaXNET01FbGVtZW50KGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxuXG4gIHJldHVybiBudWxsXG59XG4iLCJmdW5jdGlvbiBlbmNvZGVDaGFyYWN0ZXIgKGNoYXJhY3Rlcikge1xuICByZXR1cm4gY2hhcmFjdGVyLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMzIpXG59XG5cbmZ1bmN0aW9uIGVuY29kZUZpbGVuYW1lIChuYW1lKSB7XG4gIGxldCBzdWZmaXggPSAnJ1xuICByZXR1cm4gbmFtZS5yZXBsYWNlKC9bXkEtWjAtOV0vaWcsIChjaGFyYWN0ZXIpID0+IHtcbiAgICBzdWZmaXggKz0gYC0ke2VuY29kZUNoYXJhY3RlcihjaGFyYWN0ZXIpfWBcbiAgICByZXR1cm4gJy8nXG4gIH0pICsgc3VmZml4XG59XG5cbi8qKlxuICogVGFrZXMgYSBmaWxlIG9iamVjdCBhbmQgdHVybnMgaXQgaW50byBmaWxlSUQsIGJ5IGNvbnZlcnRpbmcgZmlsZS5uYW1lIHRvIGxvd2VyY2FzZSxcbiAqIHJlbW92aW5nIGV4dHJhIGNoYXJhY3RlcnMgYW5kIGFkZGluZyB0eXBlLCBzaXplIGFuZCBsYXN0TW9kaWZpZWRcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gZmlsZVxuICogQHJldHVybnMge3N0cmluZ30gdGhlIGZpbGVJRFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdlbmVyYXRlRmlsZUlEIChmaWxlKSB7XG4gIC8vIEl0J3MgdGVtcHRpbmcgdG8gZG8gYFtpdGVtc10uZmlsdGVyKEJvb2xlYW4pLmpvaW4oJy0nKWAgaGVyZSwgYnV0IHRoYXRcbiAgLy8gaXMgc2xvd2VyISBzaW1wbGUgc3RyaW5nIGNvbmNhdGVuYXRpb24gaXMgZmFzdFxuXG4gIGxldCBpZCA9ICd1cHB5J1xuICBpZiAodHlwZW9mIGZpbGUubmFtZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZCArPSBgLSR7ZW5jb2RlRmlsZW5hbWUoZmlsZS5uYW1lLnRvTG93ZXJDYXNlKCkpfWBcbiAgfVxuXG4gIGlmIChmaWxlLnR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlkICs9IGAtJHtmaWxlLnR5cGV9YFxuICB9XG5cbiAgaWYgKGZpbGUubWV0YSAmJiB0eXBlb2YgZmlsZS5tZXRhLnJlbGF0aXZlUGF0aCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZCArPSBgLSR7ZW5jb2RlRmlsZW5hbWUoZmlsZS5tZXRhLnJlbGF0aXZlUGF0aC50b0xvd2VyQ2FzZSgpKX1gXG4gIH1cblxuICBpZiAoZmlsZS5kYXRhLnNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlkICs9IGAtJHtmaWxlLmRhdGEuc2l6ZX1gXG4gIH1cbiAgaWYgKGZpbGUuZGF0YS5sYXN0TW9kaWZpZWQgIT09IHVuZGVmaW5lZCkge1xuICAgIGlkICs9IGAtJHtmaWxlLmRhdGEubGFzdE1vZGlmaWVkfWBcbiAgfVxuXG4gIHJldHVybiBpZFxufVxuIiwiLyoqXG4gKiBUYWtlcyBhIGZ1bGwgZmlsZW5hbWUgc3RyaW5nIGFuZCByZXR1cm5zIGFuIG9iamVjdCB7bmFtZSwgZXh0ZW5zaW9ufVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmdWxsRmlsZU5hbWVcbiAqIEByZXR1cm5zIHtvYmplY3R9IHtuYW1lLCBleHRlbnNpb259XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24gKGZ1bGxGaWxlTmFtZSkge1xuICBjb25zdCBsYXN0RG90ID0gZnVsbEZpbGVOYW1lLmxhc3RJbmRleE9mKCcuJylcbiAgLy8gdGhlc2UgY291bnQgYXMgbm8gZXh0ZW5zaW9uOiBcIm5vLWRvdFwiLCBcInRyYWlsaW5nLWRvdC5cIlxuICBpZiAobGFzdERvdCA9PT0gLTEgfHwgbGFzdERvdCA9PT0gZnVsbEZpbGVOYW1lLmxlbmd0aCAtIDEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogZnVsbEZpbGVOYW1lLFxuICAgICAgZXh0ZW5zaW9uOiB1bmRlZmluZWQsXG4gICAgfVxuICB9XG4gIHJldHVybiB7XG4gICAgbmFtZTogZnVsbEZpbGVOYW1lLnNsaWNlKDAsIGxhc3REb3QpLFxuICAgIGV4dGVuc2lvbjogZnVsbEZpbGVOYW1lLnNsaWNlKGxhc3REb3QgKyAxKSxcbiAgfVxufVxuIiwiY29uc3QgZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24gPSByZXF1aXJlKCcuL2dldEZpbGVOYW1lQW5kRXh0ZW5zaW9uJylcbmNvbnN0IG1pbWVUeXBlcyA9IHJlcXVpcmUoJy4vbWltZVR5cGVzJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRGaWxlVHlwZSAoZmlsZSkge1xuICBpZiAoZmlsZS50eXBlKSByZXR1cm4gZmlsZS50eXBlXG5cbiAgY29uc3QgZmlsZUV4dGVuc2lvbiA9IGZpbGUubmFtZSA/IGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uKGZpbGUubmFtZSkuZXh0ZW5zaW9uPy50b0xvd2VyQ2FzZSgpIDogbnVsbFxuICBpZiAoZmlsZUV4dGVuc2lvbiAmJiBmaWxlRXh0ZW5zaW9uIGluIG1pbWVUeXBlcykge1xuICAgIC8vIGVsc2UsIHNlZSBpZiB3ZSBjYW4gbWFwIGV4dGVuc2lvbiB0byBhIG1pbWUgdHlwZVxuICAgIHJldHVybiBtaW1lVHlwZXNbZmlsZUV4dGVuc2lvbl1cbiAgfVxuICAvLyBpZiBhbGwgZmFpbHMsIGZhbGwgYmFjayB0byBhIGdlbmVyaWMgYnl0ZSBzdHJlYW0gdHlwZVxuICByZXR1cm4gJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSdcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0U29ja2V0SG9zdCAodXJsKSB7XG4gIC8vIGdldCB0aGUgaG9zdCBkb21haW5cbiAgY29uc3QgcmVnZXggPSAvXig/Omh0dHBzPzpcXC9cXC98XFwvXFwvKT8oPzpbXkBcXG5dK0ApPyg/Ond3d1xcLik/KFteXFxuXSspL2lcbiAgY29uc3QgaG9zdCA9IHJlZ2V4LmV4ZWModXJsKVsxXVxuICBjb25zdCBzb2NrZXRQcm90b2NvbCA9IC9eaHR0cDpcXC9cXC8vaS50ZXN0KHVybCkgPyAnd3MnIDogJ3dzcydcblxuICByZXR1cm4gYCR7c29ja2V0UHJvdG9jb2x9Oi8vJHtob3N0fWBcbn1cbiIsIi8qKlxuICogQWRkcyB6ZXJvIHRvIHN0cmluZ3Mgc2hvcnRlciB0aGFuIHR3byBjaGFyYWN0ZXJzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHBhZCAobnVtYmVyKSB7XG4gIHJldHVybiBudW1iZXIgPCAxMCA/IGAwJHtudW1iZXJ9YCA6IG51bWJlci50b1N0cmluZygpXG59XG5cbi8qKlxuICogUmV0dXJucyBhIHRpbWVzdGFtcCBpbiB0aGUgZm9ybWF0IG9mIGBob3VyczptaW51dGVzOnNlY29uZHNgXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0VGltZVN0YW1wICgpIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKClcbiAgY29uc3QgaG91cnMgPSBwYWQoZGF0ZS5nZXRIb3VycygpKVxuICBjb25zdCBtaW51dGVzID0gcGFkKGRhdGUuZ2V0TWludXRlcygpKVxuICBjb25zdCBzZWNvbmRzID0gcGFkKGRhdGUuZ2V0U2Vjb25kcygpKVxuICByZXR1cm4gYCR7aG91cnN9OiR7bWludXRlc306JHtzZWNvbmRzfWBcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzIChvYmplY3QsIGtleSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KVxufVxuIiwiLyoqXG4gKiBDaGVjayBpZiBhbiBvYmplY3QgaXMgYSBET00gZWxlbWVudC4gRHVjay10eXBpbmcgYmFzZWQgb24gYG5vZGVUeXBlYC5cbiAqXG4gKiBAcGFyYW0geyp9IG9ialxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzRE9NRWxlbWVudCAob2JqKSB7XG4gIHJldHVybiBvYmo/Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERVxufVxuIiwiZnVuY3Rpb24gaXNOZXR3b3JrRXJyb3IgKHhocikge1xuICBpZiAoIXhocikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiAoeGhyLnJlYWR5U3RhdGUgIT09IDAgJiYgeGhyLnJlYWR5U3RhdGUgIT09IDQpIHx8IHhoci5zdGF0dXMgPT09IDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc05ldHdvcmtFcnJvclxuIiwiLy8gX19fV2h5IG5vdCBhZGQgdGhlIG1pbWUtdHlwZXMgcGFja2FnZT9cbi8vICAgIEl0J3MgMTkuN2tCIGd6aXBwZWQsIGFuZCB3ZSBvbmx5IG5lZWQgbWltZSB0eXBlcyBmb3Igd2VsbC1rbm93biBleHRlbnNpb25zIChmb3IgZmlsZSBwcmV2aWV3cykuXG4vLyBfX19XaGVyZSB0byB0YWtlIG5ldyBleHRlbnNpb25zIGZyb20/XG4vLyAgICBodHRwczovL2dpdGh1Yi5jb20vanNodHRwL21pbWUtZGIvYmxvYi9tYXN0ZXIvZGIuanNvblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWQ6ICd0ZXh0L21hcmtkb3duJyxcbiAgbWFya2Rvd246ICd0ZXh0L21hcmtkb3duJyxcbiAgbXA0OiAndmlkZW8vbXA0JyxcbiAgbXAzOiAnYXVkaW8vbXAzJyxcbiAgc3ZnOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gIGpwZzogJ2ltYWdlL2pwZWcnLFxuICBwbmc6ICdpbWFnZS9wbmcnLFxuICBnaWY6ICdpbWFnZS9naWYnLFxuICBoZWljOiAnaW1hZ2UvaGVpYycsXG4gIGhlaWY6ICdpbWFnZS9oZWlmJyxcbiAgeWFtbDogJ3RleHQveWFtbCcsXG4gIHltbDogJ3RleHQveWFtbCcsXG4gIGNzdjogJ3RleHQvY3N2JyxcbiAgdHN2OiAndGV4dC90YWItc2VwYXJhdGVkLXZhbHVlcycsXG4gIHRhYjogJ3RleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXMnLFxuICBhdmk6ICd2aWRlby94LW1zdmlkZW8nLFxuICBta3M6ICd2aWRlby94LW1hdHJvc2thJyxcbiAgbWt2OiAndmlkZW8veC1tYXRyb3NrYScsXG4gIG1vdjogJ3ZpZGVvL3F1aWNrdGltZScsXG4gIGRvYzogJ2FwcGxpY2F0aW9uL21zd29yZCcsXG4gIGRvY206ICdhcHBsaWNhdGlvbi92bmQubXMtd29yZC5kb2N1bWVudC5tYWNyb2VuYWJsZWQuMTInLFxuICBkb2N4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnLFxuICBkb3Q6ICdhcHBsaWNhdGlvbi9tc3dvcmQnLFxuICBkb3RtOiAnYXBwbGljYXRpb24vdm5kLm1zLXdvcmQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyJyxcbiAgZG90eDogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLnRlbXBsYXRlJyxcbiAgeGxhOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgeGxhbTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5hZGRpbi5tYWNyb2VuYWJsZWQuMTInLFxuICB4bGM6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB4bGY6ICdhcHBsaWNhdGlvbi94LXhsaWZmK3htbCcsXG4gIHhsbTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gIHhsczogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gIHhsc2I6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQuYmluYXJ5Lm1hY3JvZW5hYmxlZC4xMicsXG4gIHhsc206ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQubWFjcm9lbmFibGVkLjEyJyxcbiAgeGxzeDogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0JyxcbiAgeGx0OiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgeGx0bTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTInLFxuICB4bHR4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwudGVtcGxhdGUnLFxuICB4bHc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB0eHQ6ICd0ZXh0L3BsYWluJyxcbiAgdGV4dDogJ3RleHQvcGxhaW4nLFxuICBjb25mOiAndGV4dC9wbGFpbicsXG4gIGxvZzogJ3RleHQvcGxhaW4nLFxuICBwZGY6ICdhcHBsaWNhdGlvbi9wZGYnLFxuICB6aXA6ICdhcHBsaWNhdGlvbi96aXAnLFxuICAnN3onOiAnYXBwbGljYXRpb24veC03ei1jb21wcmVzc2VkJyxcbiAgcmFyOiAnYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZCcsXG4gIHRhcjogJ2FwcGxpY2F0aW9uL3gtdGFyJyxcbiAgZ3o6ICdhcHBsaWNhdGlvbi9nemlwJyxcbiAgZG1nOiAnYXBwbGljYXRpb24veC1hcHBsZS1kaXNraW1hZ2UnLFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZXR0bGUgKHByb21pc2VzKSB7XG4gIGNvbnN0IHJlc29sdXRpb25zID0gW11cbiAgY29uc3QgcmVqZWN0aW9ucyA9IFtdXG4gIGZ1bmN0aW9uIHJlc29sdmVkICh2YWx1ZSkge1xuICAgIHJlc29sdXRpb25zLnB1c2godmFsdWUpXG4gIH1cbiAgZnVuY3Rpb24gcmVqZWN0ZWQgKGVycm9yKSB7XG4gICAgcmVqZWN0aW9ucy5wdXNoKGVycm9yKVxuICB9XG5cbiAgY29uc3Qgd2FpdCA9IFByb21pc2UuYWxsKFxuICAgIHByb21pc2VzLm1hcCgocHJvbWlzZSkgPT4gcHJvbWlzZS50aGVuKHJlc29sdmVkLCByZWplY3RlZCkpLFxuICApXG5cbiAgcmV0dXJuIHdhaXQudGhlbigoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN1Y2Nlc3NmdWw6IHJlc29sdXRpb25zLFxuICAgICAgZmFpbGVkOiByZWplY3Rpb25zLFxuICAgIH1cbiAgfSlcbn1cbiIsIi8qKlxuICogQ29udmVydHMgbGlzdCBpbnRvIGFycmF5XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuZnJvbVxuIiwiY29uc3QgQmFzZVBsdWdpbiA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUvbGliL0Jhc2VQbHVnaW4nKVxuY29uc3QgeyBuYW5vaWQgfSA9IHJlcXVpcmUoJ25hbm9pZCcpXG5jb25zdCB7IFByb3ZpZGVyLCBSZXF1ZXN0Q2xpZW50LCBTb2NrZXQgfSA9IHJlcXVpcmUoJ0B1cHB5L2NvbXBhbmlvbi1jbGllbnQnKVxuY29uc3QgZW1pdFNvY2tldFByb2dyZXNzID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2VtaXRTb2NrZXRQcm9ncmVzcycpXG5jb25zdCBnZXRTb2NrZXRIb3N0ID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldFNvY2tldEhvc3QnKVxuY29uc3Qgc2V0dGxlID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL3NldHRsZScpXG5jb25zdCBFdmVudFRyYWNrZXIgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvRXZlbnRUcmFja2VyJylcbmNvbnN0IFByb2dyZXNzVGltZW91dCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9Qcm9ncmVzc1RpbWVvdXQnKVxuY29uc3QgeyBSYXRlTGltaXRlZFF1ZXVlLCBpbnRlcm5hbFJhdGVMaW1pdGVkUXVldWUgfSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9SYXRlTGltaXRlZFF1ZXVlJylcbmNvbnN0IE5ldHdvcmtFcnJvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9OZXR3b3JrRXJyb3InKVxuY29uc3QgaXNOZXR3b3JrRXJyb3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvaXNOZXR3b3JrRXJyb3InKVxuXG5jb25zdCBsb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpXG5cbmZ1bmN0aW9uIGJ1aWxkUmVzcG9uc2VFcnJvciAoeGhyLCBlcnIpIHtcbiAgbGV0IGVycm9yID0gZXJyXG4gIC8vIE5vIGVycm9yIG1lc3NhZ2VcbiAgaWYgKCFlcnJvcikgZXJyb3IgPSBuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpXG4gIC8vIEdvdCBhbiBlcnJvciBtZXNzYWdlIHN0cmluZ1xuICBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykgZXJyb3IgPSBuZXcgRXJyb3IoZXJyb3IpXG4gIC8vIEdvdCBzb21ldGhpbmcgZWxzZVxuICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIEVycm9yKSkge1xuICAgIGVycm9yID0gT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpLCB7IGRhdGE6IGVycm9yIH0pXG4gIH1cblxuICBpZiAoaXNOZXR3b3JrRXJyb3IoeGhyKSkge1xuICAgIGVycm9yID0gbmV3IE5ldHdvcmtFcnJvcihlcnJvciwgeGhyKVxuICAgIHJldHVybiBlcnJvclxuICB9XG5cbiAgZXJyb3IucmVxdWVzdCA9IHhoclxuICByZXR1cm4gZXJyb3Jcbn1cblxuLyoqXG4gKiBTZXQgYGRhdGEudHlwZWAgaW4gdGhlIGJsb2IgdG8gYGZpbGUubWV0YS50eXBlYCxcbiAqIGJlY2F1c2Ugd2UgbWlnaHQgaGF2ZSBkZXRlY3RlZCBhIG1vcmUgYWNjdXJhdGUgZmlsZSB0eXBlIGluIFVwcHlcbiAqIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81MDg3NTYxNVxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlIEZpbGUgb2JqZWN0IHdpdGggYGRhdGFgLCBgc2l6ZWAgYW5kIGBtZXRhYCBwcm9wZXJ0aWVzXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBibG9iIHVwZGF0ZWQgd2l0aCB0aGUgbmV3IGB0eXBlYCBzZXQgZnJvbSBgZmlsZS5tZXRhLnR5cGVgXG4gKi9cbmZ1bmN0aW9uIHNldFR5cGVJbkJsb2IgKGZpbGUpIHtcbiAgY29uc3QgZGF0YVdpdGhVcGRhdGVkVHlwZSA9IGZpbGUuZGF0YS5zbGljZSgwLCBmaWxlLmRhdGEuc2l6ZSwgZmlsZS5tZXRhLnR5cGUpXG4gIHJldHVybiBkYXRhV2l0aFVwZGF0ZWRUeXBlXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgWEhSVXBsb2FkIGV4dGVuZHMgQmFzZVBsdWdpbiB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBnbG9iYWwtcmVxdWlyZVxuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy50eXBlID0gJ3VwbG9hZGVyJ1xuICAgIHRoaXMuaWQgPSB0aGlzLm9wdHMuaWQgfHwgJ1hIUlVwbG9hZCdcbiAgICB0aGlzLnRpdGxlID0gJ1hIUlVwbG9hZCdcblxuICAgIHRoaXMuZGVmYXVsdExvY2FsZSA9IGxvY2FsZVxuXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBmb3JtRGF0YTogdHJ1ZSxcbiAgICAgIGZpZWxkTmFtZTogb3B0cy5idW5kbGUgPyAnZmlsZXNbXScgOiAnZmlsZScsXG4gICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgIG1ldGFGaWVsZHM6IG51bGwsXG4gICAgICByZXNwb25zZVVybEZpZWxkTmFtZTogJ3VybCcsXG4gICAgICBidW5kbGU6IGZhbHNlLFxuICAgICAgaGVhZGVyczoge30sXG4gICAgICB0aW1lb3V0OiAzMCAqIDEwMDAsXG4gICAgICBsaW1pdDogNSxcbiAgICAgIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gICAgICByZXNwb25zZVR5cGU6ICcnLFxuICAgICAgLyoqXG4gICAgICAgKiBAdHlwZWRlZiByZXNwT2JqXG4gICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gcmVzcG9uc2VUZXh0XG4gICAgICAgKiBAcHJvcGVydHkge251bWJlcn0gc3RhdHVzXG4gICAgICAgKiBAcHJvcGVydHkge3N0cmluZ30gc3RhdHVzVGV4dFxuICAgICAgICogQHByb3BlcnR5IHtvYmplY3QuPHN0cmluZywgc3RyaW5nPn0gaGVhZGVyc1xuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSByZXNwb25zZVRleHQgdGhlIHJlc3BvbnNlIGJvZHkgc3RyaW5nXG4gICAgICAgKiBAcGFyYW0ge1hNTEh0dHBSZXF1ZXN0IHwgcmVzcE9ian0gcmVzcG9uc2UgdGhlIHJlc3BvbnNlIG9iamVjdCAoWEhSIG9yIHNpbWlsYXIpXG4gICAgICAgKi9cbiAgICAgIGdldFJlc3BvbnNlRGF0YSAocmVzcG9uc2VUZXh0KSB7XG4gICAgICAgIGxldCBwYXJzZWRSZXNwb25zZSA9IHt9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcGFyc2VkUmVzcG9uc2UgPSBKU09OLnBhcnNlKHJlc3BvbnNlVGV4dClcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdXBweS5sb2coZXJyKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHBhcnNlZFJlc3BvbnNlXG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtzdHJpbmd9IHJlc3BvbnNlVGV4dCB0aGUgcmVzcG9uc2UgYm9keSBzdHJpbmdcbiAgICAgICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3QgfCByZXNwT2JqfSByZXNwb25zZSB0aGUgcmVzcG9uc2Ugb2JqZWN0IChYSFIgb3Igc2ltaWxhcilcbiAgICAgICAqL1xuICAgICAgZ2V0UmVzcG9uc2VFcnJvciAoXywgcmVzcG9uc2UpIHtcbiAgICAgICAgbGV0IGVycm9yID0gbmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKVxuXG4gICAgICAgIGlmIChpc05ldHdvcmtFcnJvcihyZXNwb25zZSkpIHtcbiAgICAgICAgICBlcnJvciA9IG5ldyBOZXR3b3JrRXJyb3IoZXJyb3IsIHJlc3BvbnNlKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGVycm9yXG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKiBDaGVjayBpZiB0aGUgcmVzcG9uc2UgZnJvbSB0aGUgdXBsb2FkIGVuZHBvaW50IGluZGljYXRlcyB0aGF0IHRoZSB1cGxvYWQgd2FzIHN1Y2Nlc3NmdWwuXG4gICAgICAgKlxuICAgICAgICogQHBhcmFtIHtudW1iZXJ9IHN0YXR1cyB0aGUgcmVzcG9uc2Ugc3RhdHVzIGNvZGVcbiAgICAgICAqL1xuICAgICAgdmFsaWRhdGVTdGF0dXMgKHN0YXR1cykge1xuICAgICAgICByZXR1cm4gc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDBcbiAgICAgIH0sXG4gICAgfVxuXG4gICAgdGhpcy5vcHRzID0geyAuLi5kZWZhdWx0T3B0aW9ucywgLi4ub3B0cyB9XG4gICAgdGhpcy5pMThuSW5pdCgpXG5cbiAgICB0aGlzLmhhbmRsZVVwbG9hZCA9IHRoaXMuaGFuZGxlVXBsb2FkLmJpbmQodGhpcylcblxuICAgIC8vIFNpbXVsdGFuZW91cyB1cGxvYWQgbGltaXRpbmcgaXMgc2hhcmVkIGFjcm9zcyBhbGwgdXBsb2FkcyB3aXRoIHRoaXMgcGx1Z2luLlxuICAgIGlmIChpbnRlcm5hbFJhdGVMaW1pdGVkUXVldWUgaW4gdGhpcy5vcHRzKSB7XG4gICAgICB0aGlzLnJlcXVlc3RzID0gdGhpcy5vcHRzW2ludGVybmFsUmF0ZUxpbWl0ZWRRdWV1ZV1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZXF1ZXN0cyA9IG5ldyBSYXRlTGltaXRlZFF1ZXVlKHRoaXMub3B0cy5saW1pdClcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRzLmJ1bmRsZSAmJiAhdGhpcy5vcHRzLmZvcm1EYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BvcHRzLmZvcm1EYXRhYCBtdXN0IGJlIHRydWUgd2hlbiBgb3B0cy5idW5kbGVgIGlzIGVuYWJsZWQuJylcbiAgICB9XG5cbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICB9XG5cbiAgZ2V0T3B0aW9ucyAoZmlsZSkge1xuICAgIGNvbnN0IG92ZXJyaWRlcyA9IHRoaXMudXBweS5nZXRTdGF0ZSgpLnhoclVwbG9hZFxuICAgIGNvbnN0IHsgaGVhZGVycyB9ID0gdGhpcy5vcHRzXG5cbiAgICBjb25zdCBvcHRzID0ge1xuICAgICAgLi4udGhpcy5vcHRzLFxuICAgICAgLi4uKG92ZXJyaWRlcyB8fCB7fSksXG4gICAgICAuLi4oZmlsZS54aHJVcGxvYWQgfHwge30pLFxuICAgICAgaGVhZGVyczoge30sXG4gICAgfVxuICAgIC8vIFN1cHBvcnQgZm9yIGBoZWFkZXJzYCBhcyBhIGZ1bmN0aW9uLCBvbmx5IGluIHRoZSBYSFJVcGxvYWQgc2V0dGluZ3MuXG4gICAgLy8gT3B0aW9ucyBzZXQgYnkgb3RoZXIgcGx1Z2lucyBpbiBVcHB5IHN0YXRlIG9yIG9uIHRoZSBmaWxlcyB0aGVtc2VsdmVzIGFyZSBzdGlsbCBtZXJnZWQgaW4gYWZ0ZXJ3YXJkLlxuICAgIC8vXG4gICAgLy8gYGBganNcbiAgICAvLyBoZWFkZXJzOiAoZmlsZSkgPT4gKHsgZXhwaXJlczogZmlsZS5tZXRhLmV4cGlyZXMgfSlcbiAgICAvLyBgYGBcbiAgICBpZiAodHlwZW9mIGhlYWRlcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9wdHMuaGVhZGVycyA9IGhlYWRlcnMoZmlsZSlcbiAgICB9IGVsc2Uge1xuICAgICAgT2JqZWN0LmFzc2lnbihvcHRzLmhlYWRlcnMsIHRoaXMub3B0cy5oZWFkZXJzKVxuICAgIH1cblxuICAgIGlmIChvdmVycmlkZXMpIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ob3B0cy5oZWFkZXJzLCBvdmVycmlkZXMuaGVhZGVycylcbiAgICB9XG4gICAgaWYgKGZpbGUueGhyVXBsb2FkKSB7XG4gICAgICBPYmplY3QuYXNzaWduKG9wdHMuaGVhZGVycywgZmlsZS54aHJVcGxvYWQuaGVhZGVycylcbiAgICB9XG5cbiAgICByZXR1cm4gb3B0c1xuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgYWRkTWV0YWRhdGEgKGZvcm1EYXRhLCBtZXRhLCBvcHRzKSB7XG4gICAgY29uc3QgbWV0YUZpZWxkcyA9IEFycmF5LmlzQXJyYXkob3B0cy5tZXRhRmllbGRzKVxuICAgICAgPyBvcHRzLm1ldGFGaWVsZHNcbiAgICAgIDogT2JqZWN0LmtleXMobWV0YSkgLy8gU2VuZCBhbG9uZyBhbGwgZmllbGRzIGJ5IGRlZmF1bHQuXG5cbiAgICBtZXRhRmllbGRzLmZvckVhY2goKGl0ZW0pID0+IHtcbiAgICAgIGZvcm1EYXRhLmFwcGVuZChpdGVtLCBtZXRhW2l0ZW1dKVxuICAgIH0pXG4gIH1cblxuICBjcmVhdGVGb3JtRGF0YVVwbG9hZCAoZmlsZSwgb3B0cykge1xuICAgIGNvbnN0IGZvcm1Qb3N0ID0gbmV3IEZvcm1EYXRhKClcblxuICAgIHRoaXMuYWRkTWV0YWRhdGEoZm9ybVBvc3QsIGZpbGUubWV0YSwgb3B0cylcblxuICAgIGNvbnN0IGRhdGFXaXRoVXBkYXRlZFR5cGUgPSBzZXRUeXBlSW5CbG9iKGZpbGUpXG5cbiAgICBpZiAoZmlsZS5uYW1lKSB7XG4gICAgICBmb3JtUG9zdC5hcHBlbmQob3B0cy5maWVsZE5hbWUsIGRhdGFXaXRoVXBkYXRlZFR5cGUsIGZpbGUubWV0YS5uYW1lKVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3JtUG9zdC5hcHBlbmQob3B0cy5maWVsZE5hbWUsIGRhdGFXaXRoVXBkYXRlZFR5cGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIGZvcm1Qb3N0XG4gIH1cblxuICBjcmVhdGVCdW5kbGVkVXBsb2FkIChmaWxlcywgb3B0cykge1xuICAgIGNvbnN0IGZvcm1Qb3N0ID0gbmV3IEZvcm1EYXRhKClcblxuICAgIGNvbnN0IHsgbWV0YSB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICB0aGlzLmFkZE1ldGFkYXRhKGZvcm1Qb3N0LCBtZXRhLCBvcHRzKVxuXG4gICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMuZ2V0T3B0aW9ucyhmaWxlKVxuXG4gICAgICBjb25zdCBkYXRhV2l0aFVwZGF0ZWRUeXBlID0gc2V0VHlwZUluQmxvYihmaWxlKVxuXG4gICAgICBpZiAoZmlsZS5uYW1lKSB7XG4gICAgICAgIGZvcm1Qb3N0LmFwcGVuZChvcHRpb25zLmZpZWxkTmFtZSwgZGF0YVdpdGhVcGRhdGVkVHlwZSwgZmlsZS5uYW1lKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9ybVBvc3QuYXBwZW5kKG9wdGlvbnMuZmllbGROYW1lLCBkYXRhV2l0aFVwZGF0ZWRUeXBlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gZm9ybVBvc3RcbiAgfVxuXG4gIHVwbG9hZCAoZmlsZSwgY3VycmVudCwgdG90YWwpIHtcbiAgICBjb25zdCBvcHRzID0gdGhpcy5nZXRPcHRpb25zKGZpbGUpXG5cbiAgICB0aGlzLnVwcHkubG9nKGB1cGxvYWRpbmcgJHtjdXJyZW50fSBvZiAke3RvdGFsfWApXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpXG5cbiAgICAgIGNvbnN0IGRhdGEgPSBvcHRzLmZvcm1EYXRhXG4gICAgICAgID8gdGhpcy5jcmVhdGVGb3JtRGF0YVVwbG9hZChmaWxlLCBvcHRzKVxuICAgICAgICA6IGZpbGUuZGF0YVxuXG4gICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXSA9IG5ldyBFdmVudFRyYWNrZXIodGhpcy51cHB5KVxuXG4gICAgICBjb25zdCB0aW1lciA9IG5ldyBQcm9ncmVzc1RpbWVvdXQob3B0cy50aW1lb3V0LCAoKSA9PiB7XG4gICAgICAgIHhoci5hYm9ydCgpXG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKHRoaXMuaTE4bigndGltZWRPdXQnLCB7IHNlY29uZHM6IE1hdGguY2VpbChvcHRzLnRpbWVvdXQgLyAxMDAwKSB9KSlcbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKVxuICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICB9KVxuXG4gICAgICBjb25zdCBpZCA9IG5hbm9pZCgpXG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcignbG9hZHN0YXJ0JywgKCkgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGBbWEhSVXBsb2FkXSAke2lkfSBzdGFydGVkYClcbiAgICAgIH0pXG5cbiAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCAoZXYpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmxvZyhgW1hIUlVwbG9hZF0gJHtpZH0gcHJvZ3Jlc3M6ICR7ZXYubG9hZGVkfSAvICR7ZXYudG90YWx9YClcbiAgICAgICAgLy8gQmVnaW4gY2hlY2tpbmcgZm9yIHRpbWVvdXRzIHdoZW4gcHJvZ3Jlc3Mgc3RhcnRzLCBpbnN0ZWFkIG9mIGxvYWRpbmcsXG4gICAgICAgIC8vIHRvIGF2b2lkIHRpbWluZyBvdXQgcmVxdWVzdHMgb24gYnJvd3NlciBjb25jdXJyZW5jeSBxdWV1ZVxuICAgICAgICB0aW1lci5wcm9ncmVzcygpXG5cbiAgICAgICAgaWYgKGV2Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgICAgICAgdXBsb2FkZXI6IHRoaXMsXG4gICAgICAgICAgICBieXRlc1VwbG9hZGVkOiBldi5sb2FkZWQsXG4gICAgICAgICAgICBieXRlc1RvdGFsOiBldi50b3RhbCxcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICB4aHIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIChldikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGBbWEhSVXBsb2FkXSAke2lkfSBmaW5pc2hlZGApXG4gICAgICAgIHRpbWVyLmRvbmUoKVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICBpZiAodGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXSkge1xuICAgICAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0ucmVtb3ZlKClcbiAgICAgICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdID0gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG9wdHMudmFsaWRhdGVTdGF0dXMoZXYudGFyZ2V0LnN0YXR1cywgeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSkge1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSBvcHRzLmdldFJlc3BvbnNlRGF0YSh4aHIucmVzcG9uc2VUZXh0LCB4aHIpXG4gICAgICAgICAgY29uc3QgdXBsb2FkVVJMID0gYm9keVtvcHRzLnJlc3BvbnNlVXJsRmllbGROYW1lXVxuXG4gICAgICAgICAgY29uc3QgdXBsb2FkUmVzcCA9IHtcbiAgICAgICAgICAgIHN0YXR1czogZXYudGFyZ2V0LnN0YXR1cyxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICB1cGxvYWRVUkwsXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcblxuICAgICAgICAgIGlmICh1cGxvYWRVUkwpIHtcbiAgICAgICAgICAgIHRoaXMudXBweS5sb2coYERvd25sb2FkICR7ZmlsZS5uYW1lfSBmcm9tICR7dXBsb2FkVVJMfWApXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoZmlsZSlcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBib2R5ID0gb3B0cy5nZXRSZXNwb25zZURhdGEoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKVxuICAgICAgICBjb25zdCBlcnJvciA9IGJ1aWxkUmVzcG9uc2VFcnJvcih4aHIsIG9wdHMuZ2V0UmVzcG9uc2VFcnJvcih4aHIucmVzcG9uc2VUZXh0LCB4aHIpKVxuXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICAgIHN0YXR1czogZXYudGFyZ2V0LnN0YXR1cyxcbiAgICAgICAgICBib2R5LFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yLCByZXNwb25zZSlcbiAgICAgICAgcmV0dXJuIHJlamVjdChlcnJvcilcbiAgICAgIH0pXG5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsICgpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmxvZyhgW1hIUlVwbG9hZF0gJHtpZH0gZXJyb3JlZGApXG4gICAgICAgIHRpbWVyLmRvbmUoKVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICBpZiAodGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXSkge1xuICAgICAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0ucmVtb3ZlKClcbiAgICAgICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdID0gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZXJyb3IgPSBidWlsZFJlc3BvbnNlRXJyb3IoeGhyLCBvcHRzLmdldFJlc3BvbnNlRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSlcbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuICAgICAgfSlcblxuICAgICAgeGhyLm9wZW4ob3B0cy5tZXRob2QudG9VcHBlckNhc2UoKSwgb3B0cy5lbmRwb2ludCwgdHJ1ZSlcbiAgICAgIC8vIElFMTAgZG9lcyBub3QgYWxsb3cgc2V0dGluZyBgd2l0aENyZWRlbnRpYWxzYCBhbmQgYHJlc3BvbnNlVHlwZWBcbiAgICAgIC8vIGJlZm9yZSBgb3BlbigpYCBpcyBjYWxsZWQuXG4gICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gb3B0cy53aXRoQ3JlZGVudGlhbHNcbiAgICAgIGlmIChvcHRzLnJlc3BvbnNlVHlwZSAhPT0gJycpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IG9wdHMucmVzcG9uc2VUeXBlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzLnJ1bigoKSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpXG5cbiAgICAgICAgLy8gV2hlbiB1c2luZyBhbiBhdXRoZW50aWNhdGlvbiBzeXN0ZW0gbGlrZSBKV1QsIHRoZSBiZWFyZXIgdG9rZW4gZ29lcyBhcyBhIGhlYWRlci4gVGhpc1xuICAgICAgICAvLyBoZWFkZXIgbmVlZHMgdG8gYmUgZnJlc2ggZWFjaCB0aW1lIHRoZSB0b2tlbiBpcyByZWZyZXNoZWQgc28gY29tcHV0aW5nIGFuZCBzZXR0aW5nIHRoZVxuICAgICAgICAvLyBoZWFkZXJzIGp1c3QgYmVmb3JlIHRoZSB1cGxvYWQgc3RhcnRzIGVuYWJsZXMgdGhpcyBraW5kIG9mIGF1dGhlbnRpY2F0aW9uIHRvIHdvcmsgcHJvcGVybHkuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgaGFsZi13YXkgdGhyb3VnaCB0aGUgbGlzdCBvZiB1cGxvYWRzIHRoZSB0b2tlbiBjb3VsZCBiZSBzdGFsZSBhbmQgdGhlIHVwbG9hZCB3b3VsZCBmYWlsLlxuICAgICAgICBjb25zdCBjdXJyZW50T3B0cyA9IHRoaXMuZ2V0T3B0aW9ucyhmaWxlKVxuXG4gICAgICAgIE9iamVjdC5rZXlzKGN1cnJlbnRPcHRzLmhlYWRlcnMpLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKGhlYWRlciwgY3VycmVudE9wdHMuaGVhZGVyc1toZWFkZXJdKVxuICAgICAgICB9KVxuXG4gICAgICAgIHhoci5zZW5kKGRhdGEpXG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICB0aW1lci5kb25lKClcbiAgICAgICAgICB4aHIuYWJvcnQoKVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uRmlsZVJlbW92ZShmaWxlLmlkLCAoKSA9PiB7XG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdGaWxlIHJlbW92ZWQnKSlcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMub25DYW5jZWxBbGwoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignVXBsb2FkIGNhbmNlbGxlZCcpKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgdXBsb2FkUmVtb3RlIChmaWxlKSB7XG4gICAgY29uc3Qgb3B0cyA9IHRoaXMuZ2V0T3B0aW9ucyhmaWxlKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXN0YXJ0ZWQnLCBmaWxlKVxuXG4gICAgICBjb25zdCBmaWVsZHMgPSB7fVxuICAgICAgY29uc3QgbWV0YUZpZWxkcyA9IEFycmF5LmlzQXJyYXkob3B0cy5tZXRhRmllbGRzKVxuICAgICAgICA/IG9wdHMubWV0YUZpZWxkc1xuICAgICAgICAvLyBTZW5kIGFsb25nIGFsbCBmaWVsZHMgYnkgZGVmYXVsdC5cbiAgICAgICAgOiBPYmplY3Qua2V5cyhmaWxlLm1ldGEpXG5cbiAgICAgIG1ldGFGaWVsZHMuZm9yRWFjaCgobmFtZSkgPT4ge1xuICAgICAgICBmaWVsZHNbbmFtZV0gPSBmaWxlLm1ldGFbbmFtZV1cbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IENsaWVudCA9IGZpbGUucmVtb3RlLnByb3ZpZGVyT3B0aW9ucy5wcm92aWRlciA/IFByb3ZpZGVyIDogUmVxdWVzdENsaWVudFxuICAgICAgY29uc3QgY2xpZW50ID0gbmV3IENsaWVudCh0aGlzLnVwcHksIGZpbGUucmVtb3RlLnByb3ZpZGVyT3B0aW9ucylcbiAgICAgIGNsaWVudC5wb3N0KGZpbGUucmVtb3RlLnVybCwge1xuICAgICAgICAuLi5maWxlLnJlbW90ZS5ib2R5LFxuICAgICAgICBlbmRwb2ludDogb3B0cy5lbmRwb2ludCxcbiAgICAgICAgc2l6ZTogZmlsZS5kYXRhLnNpemUsXG4gICAgICAgIGZpZWxkbmFtZTogb3B0cy5maWVsZE5hbWUsXG4gICAgICAgIG1ldGFkYXRhOiBmaWVsZHMsXG4gICAgICAgIGh0dHBNZXRob2Q6IG9wdHMubWV0aG9kLFxuICAgICAgICB1c2VGb3JtRGF0YTogb3B0cy5mb3JtRGF0YSxcbiAgICAgICAgaGVhZGVyczogb3B0cy5oZWFkZXJzLFxuICAgICAgfSkudGhlbigocmVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgdG9rZW4gfSA9IHJlc1xuICAgICAgICBjb25zdCBob3N0ID0gZ2V0U29ja2V0SG9zdChmaWxlLnJlbW90ZS5jb21wYW5pb25VcmwpXG4gICAgICAgIGNvbnN0IHNvY2tldCA9IG5ldyBTb2NrZXQoeyB0YXJnZXQ6IGAke2hvc3R9L2FwaS8ke3Rva2VufWAsIGF1dG9PcGVuOiBmYWxzZSB9KVxuICAgICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGUuaWRdID0gbmV3IEV2ZW50VHJhY2tlcih0aGlzLnVwcHkpXG5cbiAgICAgICAgdGhpcy5vbkZpbGVSZW1vdmUoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICAgIHNvY2tldC5zZW5kKCdjYW5jZWwnLCB7fSlcbiAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgICByZXNvbHZlKGB1cGxvYWQgJHtmaWxlLmlkfSB3YXMgcmVtb3ZlZGApXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5vbkNhbmNlbEFsbChmaWxlLmlkLCAoKSA9PiB7XG4gICAgICAgICAgc29ja2V0LnNlbmQoJ2NhbmNlbCcsIHt9KVxuICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgICAgIHJlc29sdmUoYHVwbG9hZCAke2ZpbGUuaWR9IHdhcyBjYW5jZWxlZGApXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5vblJldHJ5KGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncmVzdW1lJywge30pXG4gICAgICAgIH0pXG5cbiAgICAgICAgdGhpcy5vblJldHJ5QWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncmVzdW1lJywge30pXG4gICAgICAgIH0pXG5cbiAgICAgICAgc29ja2V0Lm9uKCdwcm9ncmVzcycsIChwcm9ncmVzc0RhdGEpID0+IGVtaXRTb2NrZXRQcm9ncmVzcyh0aGlzLCBwcm9ncmVzc0RhdGEsIGZpbGUpKVxuXG4gICAgICAgIHNvY2tldC5vbignc3VjY2VzcycsIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3QgYm9keSA9IG9wdHMuZ2V0UmVzcG9uc2VEYXRhKGRhdGEucmVzcG9uc2UucmVzcG9uc2VUZXh0LCBkYXRhLnJlc3BvbnNlKVxuICAgICAgICAgIGNvbnN0IHVwbG9hZFVSTCA9IGJvZHlbb3B0cy5yZXNwb25zZVVybEZpZWxkTmFtZV1cblxuICAgICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgICBzdGF0dXM6IGRhdGEucmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICAgIHVwbG9hZFVSTCxcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXN1Y2Nlc3MnLCBmaWxlLCB1cGxvYWRSZXNwKVxuICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG4gICAgICAgICAgaWYgKHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0pIHtcbiAgICAgICAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0ucmVtb3ZlKClcbiAgICAgICAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0gPSBudWxsXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgfSlcblxuICAgICAgICBzb2NrZXQub24oJ2Vycm9yJywgKGVyckRhdGEpID0+IHtcbiAgICAgICAgICBjb25zdCByZXNwID0gZXJyRGF0YS5yZXNwb25zZVxuICAgICAgICAgIGNvbnN0IGVycm9yID0gcmVzcFxuICAgICAgICAgICAgPyBvcHRzLmdldFJlc3BvbnNlRXJyb3IocmVzcC5yZXNwb25zZVRleHQsIHJlc3ApXG4gICAgICAgICAgICA6IE9iamVjdC5hc3NpZ24obmV3IEVycm9yKGVyckRhdGEuZXJyb3IubWVzc2FnZSksIHsgY2F1c2U6IGVyckRhdGEuZXJyb3IgfSlcbiAgICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLWVycm9yJywgZmlsZSwgZXJyb3IpXG4gICAgICAgICAgcXVldWVkUmVxdWVzdC5kb25lKClcbiAgICAgICAgICBpZiAodGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXSkge1xuICAgICAgICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXS5yZW1vdmUoKVxuICAgICAgICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlLmlkXSA9IG51bGxcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgICB9KVxuXG4gICAgICAgIGNvbnN0IHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzLnJ1bigoKSA9PiB7XG4gICAgICAgICAgc29ja2V0Lm9wZW4oKVxuICAgICAgICAgIGlmIChmaWxlLmlzUGF1c2VkKSB7XG4gICAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gKCkgPT4gc29ja2V0LmNsb3NlKClcbiAgICAgICAgfSlcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycilcbiAgICAgICAgcmVqZWN0KGVycilcbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHVwbG9hZEJ1bmRsZSAoZmlsZXMpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgeyBlbmRwb2ludCB9ID0gdGhpcy5vcHRzXG4gICAgICBjb25zdCB7IG1ldGhvZCB9ID0gdGhpcy5vcHRzXG5cbiAgICAgIGNvbnN0IG9wdHNGcm9tU3RhdGUgPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKS54aHJVcGxvYWRcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gdGhpcy5jcmVhdGVCdW5kbGVkVXBsb2FkKGZpbGVzLCB7XG4gICAgICAgIC4uLnRoaXMub3B0cyxcbiAgICAgICAgLi4uKG9wdHNGcm9tU3RhdGUgfHwge30pLFxuICAgICAgfSlcblxuICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgY29uc3QgdGltZXIgPSBuZXcgUHJvZ3Jlc3NUaW1lb3V0KHRoaXMub3B0cy50aW1lb3V0LCAoKSA9PiB7XG4gICAgICAgIHhoci5hYm9ydCgpXG4gICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKHRoaXMuaTE4bigndGltZWRPdXQnLCB7IHNlY29uZHM6IE1hdGguY2VpbCh0aGlzLm9wdHMudGltZW91dCAvIDEwMDApIH0pKVxuICAgICAgICBlbWl0RXJyb3IoZXJyb3IpXG4gICAgICAgIHJlamVjdChlcnJvcilcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGVtaXRFcnJvciA9IChlcnJvcikgPT4ge1xuICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycm9yKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB4aHIudXBsb2FkLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRzdGFydCcsICgpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmxvZygnW1hIUlVwbG9hZF0gc3RhcnRlZCB1cGxvYWRpbmcgYnVuZGxlJylcbiAgICAgICAgdGltZXIucHJvZ3Jlc3MoKVxuICAgICAgfSlcblxuICAgICAgeGhyLnVwbG9hZC5hZGRFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIChldikgPT4ge1xuICAgICAgICB0aW1lci5wcm9ncmVzcygpXG5cbiAgICAgICAgaWYgKCFldi5sZW5ndGhDb21wdXRhYmxlKSByZXR1cm5cblxuICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1wcm9ncmVzcycsIGZpbGUsIHtcbiAgICAgICAgICAgIHVwbG9hZGVyOiB0aGlzLFxuICAgICAgICAgICAgYnl0ZXNVcGxvYWRlZDogZXYubG9hZGVkIC8gZXYudG90YWwgKiBmaWxlLnNpemUsXG4gICAgICAgICAgICBieXRlc1RvdGFsOiBmaWxlLnNpemUsXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgKGV2KSA9PiB7XG4gICAgICAgIHRpbWVyLmRvbmUoKVxuXG4gICAgICAgIGlmICh0aGlzLm9wdHMudmFsaWRhdGVTdGF0dXMoZXYudGFyZ2V0LnN0YXR1cywgeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSkge1xuICAgICAgICAgIGNvbnN0IGJvZHkgPSB0aGlzLm9wdHMuZ2V0UmVzcG9uc2VEYXRhKHhoci5yZXNwb25zZVRleHQsIHhocilcbiAgICAgICAgICBjb25zdCB1cGxvYWRSZXNwID0ge1xuICAgICAgICAgICAgc3RhdHVzOiBldi50YXJnZXQuc3RhdHVzLFxuICAgICAgICAgICAgYm9keSxcbiAgICAgICAgICB9XG4gICAgICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiByZXNvbHZlKClcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGVycm9yID0gdGhpcy5vcHRzLmdldFJlc3BvbnNlRXJyb3IoeGhyLnJlc3BvbnNlVGV4dCwgeGhyKSB8fCBuZXcgRXJyb3IoJ1VwbG9hZCBlcnJvcicpXG4gICAgICAgIGVycm9yLnJlcXVlc3QgPSB4aHJcbiAgICAgICAgZW1pdEVycm9yKGVycm9yKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycm9yKVxuICAgICAgfSlcblxuICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgKCkgPT4ge1xuICAgICAgICB0aW1lci5kb25lKClcblxuICAgICAgICBjb25zdCBlcnJvciA9IHRoaXMub3B0cy5nZXRSZXNwb25zZUVycm9yKHhoci5yZXNwb25zZVRleHQsIHhocikgfHwgbmV3IEVycm9yKCdVcGxvYWQgZXJyb3InKVxuICAgICAgICBlbWl0RXJyb3IoZXJyb3IpXG4gICAgICAgIHJldHVybiByZWplY3QoZXJyb3IpXG4gICAgICB9KVxuXG4gICAgICB0aGlzLnVwcHkub24oJ2NhbmNlbC1hbGwnLCAoKSA9PiB7XG4gICAgICAgIHRpbWVyLmRvbmUoKVxuICAgICAgICB4aHIuYWJvcnQoKVxuICAgICAgfSlcblxuICAgICAgeGhyLm9wZW4obWV0aG9kLnRvVXBwZXJDYXNlKCksIGVuZHBvaW50LCB0cnVlKVxuICAgICAgLy8gSUUxMCBkb2VzIG5vdCBhbGxvdyBzZXR0aW5nIGB3aXRoQ3JlZGVudGlhbHNgIGFuZCBgcmVzcG9uc2VUeXBlYFxuICAgICAgLy8gYmVmb3JlIGBvcGVuKClgIGlzIGNhbGxlZC5cbiAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0aGlzLm9wdHMud2l0aENyZWRlbnRpYWxzXG4gICAgICBpZiAodGhpcy5vcHRzLnJlc3BvbnNlVHlwZSAhPT0gJycpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9IHRoaXMub3B0cy5yZXNwb25zZVR5cGVcbiAgICAgIH1cblxuICAgICAgT2JqZWN0LmtleXModGhpcy5vcHRzLmhlYWRlcnMpLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihoZWFkZXIsIHRoaXMub3B0cy5oZWFkZXJzW2hlYWRlcl0pXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZChmb3JtRGF0YSlcblxuICAgICAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXN0YXJ0ZWQnLCBmaWxlKVxuICAgICAgfSlcbiAgICB9KVxuICB9XG5cbiAgdXBsb2FkRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBmaWxlcy5tYXAoKGZpbGUsIGkpID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBwYXJzZUludChpLCAxMCkgKyAxXG4gICAgICBjb25zdCB0b3RhbCA9IGZpbGVzLmxlbmd0aFxuXG4gICAgICBpZiAoZmlsZS5lcnJvcikge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGZpbGUuZXJyb3IpKVxuICAgICAgfSBpZiAoZmlsZS5pc1JlbW90ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy51cGxvYWRSZW1vdGUoZmlsZSwgY3VycmVudCwgdG90YWwpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy51cGxvYWQoZmlsZSwgY3VycmVudCwgdG90YWwpXG4gICAgfSlcblxuICAgIHJldHVybiBzZXR0bGUocHJvbWlzZXMpXG4gIH1cblxuICBvbkZpbGVSZW1vdmUgKGZpbGVJRCwgY2IpIHtcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ2ZpbGUtcmVtb3ZlZCcsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoZmlsZUlEID09PSBmaWxlLmlkKSBjYihmaWxlLmlkKVxuICAgIH0pXG4gIH1cblxuICBvblJldHJ5IChmaWxlSUQsIGNiKSB7XG4gICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLm9uKCd1cGxvYWQtcmV0cnknLCAodGFyZ2V0RmlsZUlEKSA9PiB7XG4gICAgICBpZiAoZmlsZUlEID09PSB0YXJnZXRGaWxlSUQpIHtcbiAgICAgICAgY2IoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBvblJldHJ5QWxsIChmaWxlSUQsIGNiKSB7XG4gICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLm9uKCdyZXRyeS1hbGwnLCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMudXBweS5nZXRGaWxlKGZpbGVJRCkpIHJldHVyblxuICAgICAgY2IoKVxuICAgIH0pXG4gIH1cblxuICBvbkNhbmNlbEFsbCAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbignY2FuY2VsLWFsbCcsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy51cHB5LmdldEZpbGUoZmlsZUlEKSkgcmV0dXJuXG4gICAgICBjYigpXG4gICAgfSlcbiAgfVxuXG4gIGhhbmRsZVVwbG9hZCAoZmlsZUlEcykge1xuICAgIGlmIChmaWxlSURzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy51cHB5LmxvZygnW1hIUlVwbG9hZF0gTm8gZmlsZXMgdG8gdXBsb2FkIScpXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9XG5cbiAgICAvLyBObyBsaW1pdCBjb25maWd1cmVkIGJ5IHRoZSB1c2VyLCBhbmQgbm8gUmF0ZUxpbWl0ZWRRdWV1ZSBwYXNzZWQgaW4gYnkgYSBcInBhcmVudFwiIHBsdWdpblxuICAgIC8vIChiYXNpY2FsbHkganVzdCBBd3NTMykgdXNpbmcgdGhlIGludGVybmFsIHN5bWJvbFxuICAgIGlmICh0aGlzLm9wdHMubGltaXQgPT09IDAgJiYgIXRoaXMub3B0c1tpbnRlcm5hbFJhdGVMaW1pdGVkUXVldWVdKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKFxuICAgICAgICAnW1hIUlVwbG9hZF0gV2hlbiB1cGxvYWRpbmcgbXVsdGlwbGUgZmlsZXMgYXQgb25jZSwgY29uc2lkZXIgc2V0dGluZyB0aGUgYGxpbWl0YCBvcHRpb24gKHRvIGAxMGAgZm9yIGV4YW1wbGUpLCB0byBsaW1pdCB0aGUgbnVtYmVyIG9mIGNvbmN1cnJlbnQgdXBsb2Fkcywgd2hpY2ggaGVscHMgcHJldmVudCBtZW1vcnkgYW5kIG5ldHdvcmsgaXNzdWVzOiBodHRwczovL3VwcHkuaW8vZG9jcy94aHItdXBsb2FkLyNsaW1pdC0wJyxcbiAgICAgICAgJ3dhcm5pbmcnLFxuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMudXBweS5sb2coJ1tYSFJVcGxvYWRdIFVwbG9hZGluZy4uLicpXG4gICAgY29uc3QgZmlsZXMgPSBmaWxlSURzLm1hcCgoZmlsZUlEKSA9PiB0aGlzLnVwcHkuZ2V0RmlsZShmaWxlSUQpKVxuXG4gICAgaWYgKHRoaXMub3B0cy5idW5kbGUpIHtcbiAgICAgIC8vIGlmIGJ1bmRsZTogdHJ1ZSwgd2UgZG9u4oCZdCBzdXBwb3J0IHJlbW90ZSB1cGxvYWRzXG4gICAgICBjb25zdCBpc1NvbWVGaWxlUmVtb3RlID0gZmlsZXMuc29tZShmaWxlID0+IGZpbGUuaXNSZW1vdGUpXG4gICAgICBpZiAoaXNTb21lRmlsZVJlbW90ZSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbuKAmXQgdXBsb2FkIHJlbW90ZSBmaWxlcyB3aGVuIHRoZSBgYnVuZGxlOiB0cnVlYCBvcHRpb24gaXMgc2V0JylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdHMuaGVhZGVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdgaGVhZGVyc2AgbWF5IG5vdCBiZSBhIGZ1bmN0aW9uIHdoZW4gdGhlIGBidW5kbGU6IHRydWVgIG9wdGlvbiBpcyBzZXQnKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy51cGxvYWRCdW5kbGUoZmlsZXMpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudXBsb2FkRmlsZXMoZmlsZXMpLnRoZW4oKCkgPT4gbnVsbClcbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIGlmICh0aGlzLm9wdHMuYnVuZGxlKSB7XG4gICAgICBjb25zdCB7IGNhcGFiaWxpdGllcyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICAgIGNhcGFiaWxpdGllczoge1xuICAgICAgICAgIC4uLmNhcGFiaWxpdGllcyxcbiAgICAgICAgICBpbmRpdmlkdWFsQ2FuY2VsbGF0aW9uOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy51cHB5LmFkZFVwbG9hZGVyKHRoaXMuaGFuZGxlVXBsb2FkKVxuICB9XG5cbiAgdW5pbnN0YWxsICgpIHtcbiAgICBpZiAodGhpcy5vcHRzLmJ1bmRsZSkge1xuICAgICAgY29uc3QgeyBjYXBhYmlsaXRpZXMgfSA9IHRoaXMudXBweS5nZXRTdGF0ZSgpXG4gICAgICB0aGlzLnVwcHkuc2V0U3RhdGUoe1xuICAgICAgICBjYXBhYmlsaXRpZXM6IHtcbiAgICAgICAgICAuLi5jYXBhYmlsaXRpZXMsXG4gICAgICAgICAgaW5kaXZpZHVhbENhbmNlbGxhdGlvbjogdHJ1ZSxcbiAgICAgICAgfSxcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy51cHB5LnJlbW92ZVVwbG9hZGVyKHRoaXMuaGFuZGxlVXBsb2FkKVxuICB9XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RyaW5nczoge1xuICAgIC8vIFNob3duIGluIHRoZSBJbmZvcm1lciBpZiBhbiB1cGxvYWQgaXMgYmVpbmcgY2FuY2VsZWQgYmVjYXVzZSBpdCBzdGFsbGVkIGZvciB0b28gbG9uZy5cbiAgICB0aW1lZE91dDogJ1VwbG9hZCBzdGFsbGVkIGZvciAle3NlY29uZHN9IHNlY29uZHMsIGFib3J0aW5nLicsXG4gIH0sXG59XG4iLCJjb25zdCBVcHB5ID0gcmVxdWlyZSgnQHVwcHkvY29yZScpXG5jb25zdCBGaWxlSW5wdXQgPSByZXF1aXJlKCdAdXBweS9maWxlLWlucHV0JylcbmNvbnN0IFhIUlVwbG9hZCA9IHJlcXVpcmUoJ0B1cHB5L3hoci11cGxvYWQnKVxuY29uc3QgUHJvZ3Jlc3NCYXIgPSByZXF1aXJlKCdAdXBweS9wcm9ncmVzcy1iYXInKVxuXG5kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuVXBweScpLmlubmVySFRNTCA9ICcnXG5cbmNvbnN0IHVwcHkgPSBuZXcgVXBweSh7IGRlYnVnOiB0cnVlLCBhdXRvUHJvY2VlZDogdHJ1ZSB9KVxudXBweS51c2UoRmlsZUlucHV0LCB7XG4gIHRhcmdldDogJy5VcHB5Jyxcbn0pXG51cHB5LnVzZShQcm9ncmVzc0Jhciwge1xuICB0YXJnZXQ6ICcuVXBweVByb2dyZXNzQmFyJyxcbiAgaGlkZUFmdGVyRmluaXNoOiBmYWxzZSxcbn0pXG51cHB5LnVzZShYSFJVcGxvYWQsIHtcbiAgZW5kcG9pbnQ6ICdodHRwczovL3hoci1zZXJ2ZXIuaGVyb2t1YXBwLmNvbS91cGxvYWQnLFxuICBmb3JtRGF0YTogdHJ1ZSxcbiAgZmllbGROYW1lOiAnZmlsZXNbXScsXG59KVxuXG4vLyBBbmQgZGlzcGxheSB1cGxvYWRlZCBmaWxlc1xudXBweS5vbigndXBsb2FkLXN1Y2Nlc3MnLCAoZmlsZSwgcmVzcG9uc2UpID0+IHtcbiAgY29uc3QgdXJsID0gcmVzcG9uc2UudXBsb2FkVVJMXG4gIGNvbnN0IGZpbGVOYW1lID0gZmlsZS5uYW1lXG5cbiAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpXG4gIGNvbnN0IGEgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgYS5ocmVmID0gdXJsXG4gIGEudGFyZ2V0ID0gJ19ibGFuaydcbiAgYS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShmaWxlTmFtZSkpXG4gIGxpLmFwcGVuZENoaWxkKGEpXG5cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnVwbG9hZGVkLWZpbGVzIG9sJykuYXBwZW5kQ2hpbGQobGkpXG59KVxuIl19
