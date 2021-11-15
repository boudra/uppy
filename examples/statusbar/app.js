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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"wildcard":6}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./url-alphabet/index.cjs":9,"_process":11}],9:[function(require,module,exports){
let urlAlphabet =
  'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
module.exports = { urlAlphabet }

},{}],10:[function(require,module,exports){
var n,l,u,t,i,r,o,f,e={},c=[],s=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;function a(n,l){for(var u in l)n[u]=l[u];return n}function v(n){var l=n.parentNode;l&&l.removeChild(n)}function h(l,u,t){var i,r,o,f={};for(o in u)"key"==o?i=u[o]:"ref"==o?r=u[o]:f[o]=u[o];if(arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):t),"function"==typeof l&&null!=l.defaultProps)for(o in l.defaultProps)void 0===f[o]&&(f[o]=l.defaultProps[o]);return p(l,f,i,r,null)}function p(n,t,i,r,o){var f={type:n,props:t,key:i,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:null==o?++u:o};return null==o&&null!=l.vnode&&l.vnode(f),f}function y(n){return n.children}function d(n,l){this.props=n,this.context=l}function _(n,l){if(null==l)return n.__?_(n.__,n.__.__k.indexOf(n)+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?_(n):null}function k(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return k(n)}}function x(n){(!n.__d&&(n.__d=!0)&&i.push(n)&&!b.__r++||o!==l.debounceRendering)&&((o=l.debounceRendering)||r)(b)}function b(){for(var n;b.__r=i.length;)n=i.sort(function(n,l){return n.__v.__b-l.__v.__b}),i=[],n.some(function(n){var l,u,t,i,r,o;n.__d&&(r=(i=(l=n).__v).__e,(o=l.__P)&&(u=[],(t=a({},i)).__v=i.__v+1,I(o,i,t,l.__n,void 0!==o.ownerSVGElement,null!=i.__h?[r]:null,u,null==r?_(i):r,i.__h),T(u,i),i.__e!=r&&k(i)))})}function m(n,l,u,t,i,r,o,f,s,a){var v,h,d,k,x,b,m,A=t&&t.__k||c,P=A.length;for(u.__k=[],v=0;v<l.length;v++)if(null!=(k=u.__k[v]=null==(k=l[v])||"boolean"==typeof k?null:"string"==typeof k||"number"==typeof k||"bigint"==typeof k?p(null,k,null,null,k):Array.isArray(k)?p(y,{children:k},null,null,null):k.__b>0?p(k.type,k.props,k.key,null,k.__v):k)){if(k.__=u,k.__b=u.__b+1,null===(d=A[v])||d&&k.key==d.key&&k.type===d.type)A[v]=void 0;else for(h=0;h<P;h++){if((d=A[h])&&k.key==d.key&&k.type===d.type){A[h]=void 0;break}d=null}I(n,k,d=d||e,i,r,o,f,s,a),x=k.__e,(h=k.ref)&&d.ref!=h&&(m||(m=[]),d.ref&&m.push(d.ref,null,k),m.push(h,k.__c||x,k)),null!=x?(null==b&&(b=x),"function"==typeof k.type&&k.__k===d.__k?k.__d=s=g(k,s,n):s=w(n,k,d,A,x,s),"function"==typeof u.type&&(u.__d=s)):s&&d.__e==s&&s.parentNode!=n&&(s=_(d))}for(u.__e=b,v=P;v--;)null!=A[v]&&("function"==typeof u.type&&null!=A[v].__e&&A[v].__e==u.__d&&(u.__d=_(t,v+1)),L(A[v],A[v]));if(m)for(v=0;v<m.length;v++)z(m[v],m[++v],m[++v])}function g(n,l,u){for(var t,i=n.__k,r=0;i&&r<i.length;r++)(t=i[r])&&(t.__=n,l="function"==typeof t.type?g(t,l,u):w(u,t,t,i,t.__e,l));return l}function w(n,l,u,t,i,r){var o,f,e;if(void 0!==l.__d)o=l.__d,l.__d=void 0;else if(null==u||i!=r||null==i.parentNode)n:if(null==r||r.parentNode!==n)n.appendChild(i),o=null;else{for(f=r,e=0;(f=f.nextSibling)&&e<t.length;e+=2)if(f==i)break n;n.insertBefore(i,r),o=r}return void 0!==o?o:i.nextSibling}function A(n,l,u,t,i){var r;for(r in u)"children"===r||"key"===r||r in l||C(n,r,null,u[r],t);for(r in l)i&&"function"!=typeof l[r]||"children"===r||"key"===r||"value"===r||"checked"===r||u[r]===l[r]||C(n,r,l[r],u[r],t)}function P(n,l,u){"-"===l[0]?n.setProperty(l,u):n[l]=null==u?"":"number"!=typeof u||s.test(l)?u:u+"px"}function C(n,l,u,t,i){var r;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof t&&(n.style.cssText=t=""),t)for(l in t)u&&l in u||P(n.style,l,"");if(u)for(l in u)t&&u[l]===t[l]||P(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])r=l!==(l=l.replace(/Capture$/,"")),l=l.toLowerCase()in n?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+r]=u,u?t||n.addEventListener(l,r?H:$,r):n.removeEventListener(l,r?H:$,r);else if("dangerouslySetInnerHTML"!==l){if(i)l=l.replace(/xlink[H:h]/,"h").replace(/sName$/,"s");else if("href"!==l&&"list"!==l&&"form"!==l&&"tabIndex"!==l&&"download"!==l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null!=u&&(!1!==u||"a"===l[0]&&"r"===l[1])?n.setAttribute(l,u):n.removeAttribute(l))}}function $(n){this.l[n.type+!1](l.event?l.event(n):n)}function H(n){this.l[n.type+!0](l.event?l.event(n):n)}function I(n,u,t,i,r,o,f,e,c){var s,v,h,p,_,k,x,b,g,w,A,P=u.type;if(void 0!==u.constructor)return null;null!=t.__h&&(c=t.__h,e=u.__e=t.__e,u.__h=null,o=[e]),(s=l.__b)&&s(u);try{n:if("function"==typeof P){if(b=u.props,g=(s=P.contextType)&&i[s.__c],w=s?g?g.props.value:s.__:i,t.__c?x=(v=u.__c=t.__c).__=v.__E:("prototype"in P&&P.prototype.render?u.__c=v=new P(b,w):(u.__c=v=new d(b,w),v.constructor=P,v.render=M),g&&g.sub(v),v.props=b,v.state||(v.state={}),v.context=w,v.__n=i,h=v.__d=!0,v.__h=[]),null==v.__s&&(v.__s=v.state),null!=P.getDerivedStateFromProps&&(v.__s==v.state&&(v.__s=a({},v.__s)),a(v.__s,P.getDerivedStateFromProps(b,v.__s))),p=v.props,_=v.state,h)null==P.getDerivedStateFromProps&&null!=v.componentWillMount&&v.componentWillMount(),null!=v.componentDidMount&&v.__h.push(v.componentDidMount);else{if(null==P.getDerivedStateFromProps&&b!==p&&null!=v.componentWillReceiveProps&&v.componentWillReceiveProps(b,w),!v.__e&&null!=v.shouldComponentUpdate&&!1===v.shouldComponentUpdate(b,v.__s,w)||u.__v===t.__v){v.props=b,v.state=v.__s,u.__v!==t.__v&&(v.__d=!1),v.__v=u,u.__e=t.__e,u.__k=t.__k,u.__k.forEach(function(n){n&&(n.__=u)}),v.__h.length&&f.push(v);break n}null!=v.componentWillUpdate&&v.componentWillUpdate(b,v.__s,w),null!=v.componentDidUpdate&&v.__h.push(function(){v.componentDidUpdate(p,_,k)})}v.context=w,v.props=b,v.state=v.__s,(s=l.__r)&&s(u),v.__d=!1,v.__v=u,v.__P=n,s=v.render(v.props,v.state,v.context),v.state=v.__s,null!=v.getChildContext&&(i=a(a({},i),v.getChildContext())),h||null==v.getSnapshotBeforeUpdate||(k=v.getSnapshotBeforeUpdate(p,_)),A=null!=s&&s.type===y&&null==s.key?s.props.children:s,m(n,Array.isArray(A)?A:[A],u,t,i,r,o,f,e,c),v.base=u.__e,u.__h=null,v.__h.length&&f.push(v),x&&(v.__E=v.__=null),v.__e=!1}else null==o&&u.__v===t.__v?(u.__k=t.__k,u.__e=t.__e):u.__e=j(t.__e,u,t,i,r,o,f,c);(s=l.diffed)&&s(u)}catch(n){u.__v=null,(c||null!=o)&&(u.__e=e,u.__h=!!c,o[o.indexOf(e)]=null),l.__e(n,u,t)}}function T(n,u){l.__c&&l.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u)})}catch(n){l.__e(n,u.__v)}})}function j(l,u,t,i,r,o,f,c){var s,a,h,p=t.props,y=u.props,d=u.type,k=0;if("svg"===d&&(r=!0),null!=o)for(;k<o.length;k++)if((s=o[k])&&(s===l||(d?s.localName==d:3==s.nodeType))){l=s,o[k]=null;break}if(null==l){if(null===d)return document.createTextNode(y);l=r?document.createElementNS("http://www.w3.org/2000/svg",d):document.createElement(d,y.is&&y),o=null,c=!1}if(null===d)p===y||c&&l.data===y||(l.data=y);else{if(o=o&&n.call(l.childNodes),a=(p=t.props||e).dangerouslySetInnerHTML,h=y.dangerouslySetInnerHTML,!c){if(null!=o)for(p={},k=0;k<l.attributes.length;k++)p[l.attributes[k].name]=l.attributes[k].value;(h||a)&&(h&&(a&&h.__html==a.__html||h.__html===l.innerHTML)||(l.innerHTML=h&&h.__html||""))}if(A(l,y,p,r,c),h)u.__k=[];else if(k=u.props.children,m(l,Array.isArray(k)?k:[k],u,t,i,r&&"foreignObject"!==d,o,f,o?o[0]:t.__k&&_(t,0),c),null!=o)for(k=o.length;k--;)null!=o[k]&&v(o[k]);c||("value"in y&&void 0!==(k=y.value)&&(k!==l.value||"progress"===d&&!k)&&C(l,"value",k,p.value,!1),"checked"in y&&void 0!==(k=y.checked)&&k!==l.checked&&C(l,"checked",k,p.checked,!1))}return l}function z(n,u,t){try{"function"==typeof n?n(u):n.current=u}catch(n){l.__e(n,t)}}function L(n,u,t){var i,r;if(l.unmount&&l.unmount(n),(i=n.ref)&&(i.current&&i.current!==n.__e||z(i,null,u)),null!=(i=n.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(n){l.__e(n,u)}i.base=i.__P=null}if(i=n.__k)for(r=0;r<i.length;r++)i[r]&&L(i[r],u,"function"!=typeof n.type);t||null==n.__e||v(n.__e),n.__e=n.__d=void 0}function M(n,l,u){return this.constructor(n,u)}function N(u,t,i){var r,o,f;l.__&&l.__(u,t),o=(r="function"==typeof i)?null:i&&i.__k||t.__k,f=[],I(t,u=(!r&&i||t).__k=h(y,null,[u]),o||e,e,void 0!==t.ownerSVGElement,!r&&i?[i]:o?null:t.firstChild?n.call(t.childNodes):null,f,!r&&i?i:o?o.__e:t.firstChild,r),T(f,u)}n=c.slice,l={__e:function(n,l){for(var u,t,i;l=l.__;)if((u=l.__c)&&!u.__)try{if((t=u.constructor)&&null!=t.getDerivedStateFromError&&(u.setState(t.getDerivedStateFromError(n)),i=u.__d),null!=u.componentDidCatch&&(u.componentDidCatch(n),i=u.__d),i)return u.__E=u}catch(l){n=l}throw n}},u=0,t=function(n){return null!=n&&void 0===n.constructor},d.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=a({},this.state),"function"==typeof n&&(n=n(a({},u),this.props)),n&&a(u,n),null!=n&&this.__v&&(l&&this.__h.push(l),x(this))},d.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),x(this))},d.prototype.render=y,i=[],r="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,b.__r=0,f=0,exports.render=N,exports.hydrate=function n(l,u){N(l,u,n)},exports.createElement=h,exports.h=h,exports.Fragment=y,exports.createRef=function(){return{current:null}},exports.isValidElement=t,exports.Component=d,exports.cloneElement=function(l,u,t){var i,r,o,f=a({},l.props);for(o in u)"key"==o?i=u[o]:"ref"==o?r=u[o]:f[o]=u[o];return arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):t),p(l.type,f,i||l.key,r||l.ref,null)},exports.createContext=function(n,l){var u={__c:l="__cC"+f++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,t;return this.getChildContext||(u=[],(t={})[l]=this,this.getChildContext=function(){return t},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(x)},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u},exports.toChildArray=function n(l,u){return u=u||[],null==l||"boolean"==typeof l||(Array.isArray(l)?l.some(function(l){n(l,u)}):u.push(l)),u},exports.options=l;


},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
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
},{"./isCordova":18,"./isReactNative":19,"./readAsByteArray":20,"./uriToBlob":21}],15:[function(require,module,exports){
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
},{"./isReactNative":19}],16:[function(require,module,exports){
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
},{}],17:[function(require,module,exports){
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
},{"../logger":24,"../noopUrlStorage":25,"../upload":26,"./fileReader":14,"./fingerprint":15,"./httpStack":16,"./urlStorage":22}],18:[function(require,module,exports){
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
},{}],19:[function(require,module,exports){
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
},{}],20:[function(require,module,exports){
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
},{}],21:[function(require,module,exports){
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
},{}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
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
},{}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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
},{"./error":23,"./logger":24,"./uuid":27,"js-base64":3,"url-parse":28}],27:[function(require,module,exports){
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
},{}],28:[function(require,module,exports){
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

},{"querystringify":12,"requires-port":13}],29:[function(require,module,exports){
'use strict';

class AuthError extends Error {
  constructor() {
    super('Authorization required');
    this.name = 'AuthError';
    this.isAuthError = true;
  }

}

module.exports = AuthError;

},{}],30:[function(require,module,exports){
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

},{"./RequestClient":31,"./tokenStorage":35}],31:[function(require,module,exports){
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

},{"./../../utils/lib/fetchWithNetworkError":60,"./AuthError":29}],32:[function(require,module,exports){
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

},{"./RequestClient":31}],33:[function(require,module,exports){
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

},{"namespace-emitter":7}],34:[function(require,module,exports){
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

},{"./Provider":30,"./RequestClient":31,"./SearchProvider":32,"./Socket":33}],35:[function(require,module,exports){
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

},{}],36:[function(require,module,exports){
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

},{"./../../utils/lib/Translator":58}],37:[function(require,module,exports){
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

},{"./../../utils/lib/findDOMElement":61,"./BasePlugin":36,"preact":10}],38:[function(require,module,exports){
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

},{"./../../store-default":52,"./../../utils/lib/Translator":58,"./../../utils/lib/generateFileID":62,"./../../utils/lib/getFileNameAndExtension":64,"./../../utils/lib/getFileType":65,"./getFileName":39,"./locale":41,"./loggers":42,"./supportsUploadProgress":43,"@transloadit/prettier-bytes":1,"lodash.throttle":4,"mime-match":5,"namespace-emitter":7,"nanoid":8}],39:[function(require,module,exports){
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

},{}],40:[function(require,module,exports){
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

},{"./BasePlugin":36,"./UIPlugin":37,"./Uppy":38,"./loggers":42}],41:[function(require,module,exports){
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

},{}],42:[function(require,module,exports){
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

},{"./../../utils/lib/getTimeStamp":69}],43:[function(require,module,exports){
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

},{}],44:[function(require,module,exports){
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

},{"./../../core":40,"./../../utils/lib/toArray":77,"./locale":45,"preact":10}],45:[function(require,module,exports){
"use strict";

module.exports = {
  strings: {
    // The same key is used for the same purpose by @uppy/robodog's `form()` API, but our
    // locale pack scripts can't access it in Robodog. If it is updated here, it should
    // also be updated there!
    chooseFiles: 'Choose files'
  }
};

},{}],46:[function(require,module,exports){
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

},{"./../../utils/lib/prettyETA":74,"./StatusBarStates":48,"@transloadit/prettier-bytes":1,"classnames":2,"lodash.throttle":4,"preact":10}],47:[function(require,module,exports){
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

},{"./Components":46,"./StatusBarStates":48,"./calculateProcessingProgress":49,"classnames":2,"preact":10}],48:[function(require,module,exports){
"use strict";

module.exports = {
  STATE_ERROR: 'error',
  STATE_WAITING: 'waiting',
  STATE_PREPROCESSING: 'preprocessing',
  STATE_UPLOADING: 'uploading',
  STATE_POSTPROCESSING: 'postprocessing',
  STATE_COMPLETE: 'complete'
};

},{}],49:[function(require,module,exports){
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

},{}],50:[function(require,module,exports){
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

},{"./../../core":40,"./../../utils/lib/getBytesRemaining":63,"./../../utils/lib/getSpeed":67,"./../../utils/lib/getTextDirection":68,"./StatusBar":47,"./StatusBarStates":48,"./locale.js":51}],51:[function(require,module,exports){
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

},{}],52:[function(require,module,exports){
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

},{}],53:[function(require,module,exports){
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

},{"tus-js-client":17}],54:[function(require,module,exports){
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

},{"./../../companion-client":34,"./../../core/lib/BasePlugin":36,"./../../utils/lib/EventTracker":55,"./../../utils/lib/NetworkError":56,"./../../utils/lib/RateLimitedQueue":57,"./../../utils/lib/emitSocketProgress":59,"./../../utils/lib/getSocketHost":66,"./../../utils/lib/hasProperty":70,"./../../utils/lib/isNetworkError":72,"./../../utils/lib/settle":76,"./getFingerprint":53,"tus-js-client":17}],55:[function(require,module,exports){
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

},{}],56:[function(require,module,exports){
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

},{}],57:[function(require,module,exports){
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

},{}],58:[function(require,module,exports){
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

},{"./hasProperty":70}],59:[function(require,module,exports){
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

},{"lodash.throttle":4}],60:[function(require,module,exports){
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

},{"./NetworkError":56}],61:[function(require,module,exports){
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

},{"./isDOMElement":71}],62:[function(require,module,exports){
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

},{}],63:[function(require,module,exports){
"use strict";

module.exports = function getBytesRemaining(fileProgress) {
  return fileProgress.bytesTotal - fileProgress.bytesUploaded;
};

},{}],64:[function(require,module,exports){
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

},{}],65:[function(require,module,exports){
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

},{"./getFileNameAndExtension":64,"./mimeTypes":73}],66:[function(require,module,exports){
"use strict";

module.exports = function getSocketHost(url) {
  // get the host domain
  const regex = /^(?:https?:\/\/|\/\/)?(?:[^@\n]+@)?(?:www\.)?([^\n]+)/i;
  const host = regex.exec(url)[1];
  const socketProtocol = /^http:\/\//i.test(url) ? 'ws' : 'wss';
  return `${socketProtocol}://${host}`;
};

},{}],67:[function(require,module,exports){
"use strict";

module.exports = function getSpeed(fileProgress) {
  if (!fileProgress.bytesUploaded) return 0;
  const timeElapsed = Date.now() - fileProgress.uploadStarted;
  const uploadSpeed = fileProgress.bytesUploaded / (timeElapsed / 1000);
  return uploadSpeed;
};

},{}],68:[function(require,module,exports){
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

},{}],69:[function(require,module,exports){
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

},{}],70:[function(require,module,exports){
"use strict";

module.exports = function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
};

},{}],71:[function(require,module,exports){
"use strict";

/**
 * Check if an object is a DOM element. Duck-typing based on `nodeType`.
 *
 * @param {*} obj
 */
module.exports = function isDOMElement(obj) {
  return (obj == null ? void 0 : obj.nodeType) === Node.ELEMENT_NODE;
};

},{}],72:[function(require,module,exports){
"use strict";

function isNetworkError(xhr) {
  if (!xhr) {
    return false;
  }

  return xhr.readyState !== 0 && xhr.readyState !== 4 || xhr.status === 0;
}

module.exports = isNetworkError;

},{}],73:[function(require,module,exports){
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

},{}],74:[function(require,module,exports){
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

},{"./secondsToTime":75}],75:[function(require,module,exports){
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

},{}],76:[function(require,module,exports){
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

},{}],77:[function(require,module,exports){
"use strict";

/**
 * Converts list into array
 */
module.exports = Array.from;

},{}],78:[function(require,module,exports){
"use strict";

const Uppy = require('./../../../../packages/@uppy/core');

const FileInput = require('./../../../../packages/@uppy/file-input');

const StatusBar = require('./../../../../packages/@uppy/status-bar');

const Tus = require('./../../../../packages/@uppy/tus');

const uppyOne = new Uppy({
  debug: true,
  autoProceed: true
});
uppyOne.use(FileInput, {
  target: '.UppyInput',
  pretty: false
}).use(Tus, {
  endpoint: 'https://tusd.tusdemo.net/files/'
}).use(StatusBar, {
  target: '.UppyInput-Progress',
  hideUploadButton: true,
  hideAfterFinish: false
});

},{"./../../../../packages/@uppy/core":40,"./../../../../packages/@uppy/file-input":44,"./../../../../packages/@uppy/status-bar":50,"./../../../../packages/@uppy/tus":54}]},{},[78])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvQHRyYW5zbG9hZGl0L3ByZXR0aWVyLWJ5dGVzL3ByZXR0aWVyQnl0ZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY2xhc3NuYW1lcy9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9qcy1iYXNlNjQvYmFzZTY0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC50aHJvdHRsZS9pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9taW1lLW1hdGNoL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL21pbWUtbWF0Y2gvbm9kZV9tb2R1bGVzL3dpbGRjYXJkL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL25hbWVzcGFjZS1lbWl0dGVyL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL25hbm9pZC9pbmRleC5icm93c2VyLmNqcyIsIi4uL25vZGVfbW9kdWxlcy9uYW5vaWQvdXJsLWFscGhhYmV0L2luZGV4LmNqcyIsIi4uL25vZGVfbW9kdWxlcy9wcmVhY3QvZGlzdC9wcmVhY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3F1ZXJ5c3RyaW5naWZ5L2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3JlcXVpcmVzLXBvcnQvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvZmlsZVJlYWRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy90dXMtanMtY2xpZW50L2xpYi5lczUvYnJvd3Nlci9maW5nZXJwcmludC5qcyIsIi4uL25vZGVfbW9kdWxlcy90dXMtanMtY2xpZW50L2xpYi5lczUvYnJvd3Nlci9odHRwU3RhY2suanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvaW5kZXguanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvaXNDb3Jkb3ZhLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9icm93c2VyL2lzUmVhY3ROYXRpdmUuanMiLCIuLi9ub2RlX21vZHVsZXMvdHVzLWpzLWNsaWVudC9saWIuZXM1L2Jyb3dzZXIvcmVhZEFzQnl0ZUFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9icm93c2VyL3VyaVRvQmxvYi5qcyIsIi4uL25vZGVfbW9kdWxlcy90dXMtanMtY2xpZW50L2xpYi5lczUvYnJvd3Nlci91cmxTdG9yYWdlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9lcnJvci5qcyIsIi4uL25vZGVfbW9kdWxlcy90dXMtanMtY2xpZW50L2xpYi5lczUvbG9nZ2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS9ub29wVXJsU3RvcmFnZS5qcyIsIi4uL25vZGVfbW9kdWxlcy90dXMtanMtY2xpZW50L2xpYi5lczUvdXBsb2FkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R1cy1qcy1jbGllbnQvbGliLmVzNS91dWlkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3VybC1wYXJzZS9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvc3JjL0F1dGhFcnJvci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvc3JjL1Byb3ZpZGVyLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvUmVxdWVzdENsaWVudC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvbXBhbmlvbi1jbGllbnQvc3JjL1NlYXJjaFByb3ZpZGVyLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvU29ja2V0LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29tcGFuaW9uLWNsaWVudC9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb21wYW5pb24tY2xpZW50L3NyYy90b2tlblN0b3JhZ2UuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9CYXNlUGx1Z2luLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvVUlQbHVnaW4uanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9VcHB5LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvY29yZS9zcmMvZ2V0RmlsZU5hbWUuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL2xvY2FsZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L2NvcmUvc3JjL2xvZ2dlcnMuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9jb3JlL3NyYy9zdXBwb3J0c1VwbG9hZFByb2dyZXNzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvZmlsZS1pbnB1dC9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9maWxlLWlucHV0L3NyYy9sb2NhbGUuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdGF0dXMtYmFyL3NyYy9Db21wb25lbnRzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc3RhdHVzLWJhci9zcmMvU3RhdHVzQmFyLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc3RhdHVzLWJhci9zcmMvU3RhdHVzQmFyU3RhdGVzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc3RhdHVzLWJhci9zcmMvY2FsY3VsYXRlUHJvY2Vzc2luZ1Byb2dyZXNzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvc3RhdHVzLWJhci9zcmMvaW5kZXguanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdGF0dXMtYmFyL3NyYy9sb2NhbGUuanMiLCIuLi9wYWNrYWdlcy9AdXBweS9zdG9yZS1kZWZhdWx0L3NyYy9pbmRleC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3R1cy9zcmMvZ2V0RmluZ2VycHJpbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS90dXMvc3JjL2luZGV4LmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL0V2ZW50VHJhY2tlci5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9OZXR3b3JrRXJyb3IuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvUmF0ZUxpbWl0ZWRRdWV1ZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9UcmFuc2xhdG9yLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2VtaXRTb2NrZXRQcm9ncmVzcy5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9mZXRjaFdpdGhOZXR3b3JrRXJyb3IuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZmluZERPTUVsZW1lbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZ2VuZXJhdGVGaWxlSUQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZ2V0Qnl0ZXNSZW1haW5pbmcuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZ2V0RmlsZU5hbWVBbmRFeHRlbnNpb24uanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZ2V0RmlsZVR5cGUuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvZ2V0U29ja2V0SG9zdC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRTcGVlZC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9nZXRUZXh0RGlyZWN0aW9uLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL2dldFRpbWVTdGFtcC5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9oYXNQcm9wZXJ0eS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9pc0RPTUVsZW1lbnQuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvaXNOZXR3b3JrRXJyb3IuanMiLCIuLi9wYWNrYWdlcy9AdXBweS91dGlscy9zcmMvbWltZVR5cGVzLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL3ByZXR0eUVUQS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy9zZWNvbmRzVG9UaW1lLmpzIiwiLi4vcGFja2FnZXMvQHVwcHkvdXRpbHMvc3JjL3NldHRsZS5qcyIsIi4uL3BhY2thZ2VzL0B1cHB5L3V0aWxzL3NyYy90b0FycmF5LmpzIiwic3JjL2V4YW1wbGVzL3N0YXR1c2Jhci9hcHAuZXM2Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUN0T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3ZiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0cENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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ZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvLyBBZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL0ZsZXQvcHJldHRpZXItYnl0ZXMvXG4vLyBDaGFuZ2luZyAxMDAwIGJ5dGVzIHRvIDEwMjQsIHNvIHdlIGNhbiBrZWVwIHVwcGVyY2FzZSBLQiB2cyBrQlxuLy8gSVNDIExpY2Vuc2UgKGMpIERhbiBGbGV0dHJlIGh0dHBzOi8vZ2l0aHViLmNvbS9GbGV0L3ByZXR0aWVyLWJ5dGVzL2Jsb2IvbWFzdGVyL0xJQ0VOU0Vcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcHJldHRpZXJCeXRlcyAobnVtKSB7XG4gIGlmICh0eXBlb2YgbnVtICE9PSAnbnVtYmVyJyB8fCBpc05hTihudW0pKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBudW1iZXIsIGdvdCAnICsgdHlwZW9mIG51bSlcbiAgfVxuXG4gIHZhciBuZWcgPSBudW0gPCAwXG4gIHZhciB1bml0cyA9IFsnQicsICdLQicsICdNQicsICdHQicsICdUQicsICdQQicsICdFQicsICdaQicsICdZQiddXG5cbiAgaWYgKG5lZykge1xuICAgIG51bSA9IC1udW1cbiAgfVxuXG4gIGlmIChudW0gPCAxKSB7XG4gICAgcmV0dXJuIChuZWcgPyAnLScgOiAnJykgKyBudW0gKyAnIEInXG4gIH1cblxuICB2YXIgZXhwb25lbnQgPSBNYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKG51bSkgLyBNYXRoLmxvZygxMDI0KSksIHVuaXRzLmxlbmd0aCAtIDEpXG4gIG51bSA9IE51bWJlcihudW0gLyBNYXRoLnBvdygxMDI0LCBleHBvbmVudCkpXG4gIHZhciB1bml0ID0gdW5pdHNbZXhwb25lbnRdXG5cbiAgaWYgKG51bSA+PSAxMCB8fCBudW0gJSAxID09PSAwKSB7XG4gICAgLy8gRG8gbm90IHNob3cgZGVjaW1hbHMgd2hlbiB0aGUgbnVtYmVyIGlzIHR3by1kaWdpdCwgb3IgaWYgdGhlIG51bWJlciBoYXMgbm9cbiAgICAvLyBkZWNpbWFsIGNvbXBvbmVudC5cbiAgICByZXR1cm4gKG5lZyA/ICctJyA6ICcnKSArIG51bS50b0ZpeGVkKDApICsgJyAnICsgdW5pdFxuICB9IGVsc2Uge1xuICAgIHJldHVybiAobmVnID8gJy0nIDogJycpICsgbnVtLnRvRml4ZWQoMSkgKyAnICcgKyB1bml0XG4gIH1cbn1cbiIsIi8qIVxuICBDb3B5cmlnaHQgKGMpIDIwMTggSmVkIFdhdHNvbi5cbiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlIChNSVQpLCBzZWVcbiAgaHR0cDovL2plZHdhdHNvbi5naXRodWIuaW8vY2xhc3NuYW1lc1xuKi9cbi8qIGdsb2JhbCBkZWZpbmUgKi9cblxuKGZ1bmN0aW9uICgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBoYXNPd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuXHRmdW5jdGlvbiBjbGFzc05hbWVzKCkge1xuXHRcdHZhciBjbGFzc2VzID0gW107XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGFyZyA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdGlmICghYXJnKSBjb250aW51ZTtcblxuXHRcdFx0dmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuXG5cdFx0XHRpZiAoYXJnVHlwZSA9PT0gJ3N0cmluZycgfHwgYXJnVHlwZSA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0Y2xhc3Nlcy5wdXNoKGFyZyk7XG5cdFx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuXHRcdFx0XHRpZiAoYXJnLmxlbmd0aCkge1xuXHRcdFx0XHRcdHZhciBpbm5lciA9IGNsYXNzTmFtZXMuYXBwbHkobnVsbCwgYXJnKTtcblx0XHRcdFx0XHRpZiAoaW5uZXIpIHtcblx0XHRcdFx0XHRcdGNsYXNzZXMucHVzaChpbm5lcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGFyZ1R5cGUgPT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdGlmIChhcmcudG9TdHJpbmcgPT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcpIHtcblx0XHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gYXJnKSB7XG5cdFx0XHRcdFx0XHRpZiAoaGFzT3duLmNhbGwoYXJnLCBrZXkpICYmIGFyZ1trZXldKSB7XG5cdFx0XHRcdFx0XHRcdGNsYXNzZXMucHVzaChrZXkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjbGFzc2VzLnB1c2goYXJnLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNsYXNzZXMuam9pbignICcpO1xuXHR9XG5cblx0aWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0Y2xhc3NOYW1lcy5kZWZhdWx0ID0gY2xhc3NOYW1lcztcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGNsYXNzTmFtZXM7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PT0gJ29iamVjdCcgJiYgZGVmaW5lLmFtZCkge1xuXHRcdC8vIHJlZ2lzdGVyIGFzICdjbGFzc25hbWVzJywgY29uc2lzdGVudCB3aXRoIG5wbSBwYWNrYWdlIG5hbWVcblx0XHRkZWZpbmUoJ2NsYXNzbmFtZXMnLCBbXSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGNsYXNzTmFtZXM7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0d2luZG93LmNsYXNzTmFtZXMgPSBjbGFzc05hbWVzO1xuXHR9XG59KCkpO1xuIiwiLypcbiAqICBiYXNlNjQuanNcbiAqXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIEJTRCAzLUNsYXVzZSBMaWNlbnNlLlxuICogICAgaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICpcbiAqICBSZWZlcmVuY2VzOlxuICogICAgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9CYXNlNjRcbiAqL1xuOyhmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KGdsb2JhbClcbiAgICAgICAgOiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWRcbiAgICAgICAgPyBkZWZpbmUoZmFjdG9yeSkgOiBmYWN0b3J5KGdsb2JhbClcbn0oKFxuICAgIHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGZcbiAgICAgICAgOiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvd1xuICAgICAgICA6IHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnID8gZ2xvYmFsXG46IHRoaXNcbiksIGZ1bmN0aW9uKGdsb2JhbCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBleGlzdGluZyB2ZXJzaW9uIGZvciBub0NvbmZsaWN0KClcbiAgICBnbG9iYWwgPSBnbG9iYWwgfHwge307XG4gICAgdmFyIF9CYXNlNjQgPSBnbG9iYWwuQmFzZTY0O1xuICAgIHZhciB2ZXJzaW9uID0gXCIyLjYuNFwiO1xuICAgIC8vIGNvbnN0YW50c1xuICAgIHZhciBiNjRjaGFyc1xuICAgICAgICA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcbiAgICB2YXIgYjY0dGFiID0gZnVuY3Rpb24oYmluKSB7XG4gICAgICAgIHZhciB0ID0ge307XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYmluLmxlbmd0aDsgaSA8IGw7IGkrKykgdFtiaW4uY2hhckF0KGkpXSA9IGk7XG4gICAgICAgIHJldHVybiB0O1xuICAgIH0oYjY0Y2hhcnMpO1xuICAgIHZhciBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuICAgIC8vIGVuY29kZXIgc3R1ZmZcbiAgICB2YXIgY2JfdXRvYiA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgaWYgKGMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdmFyIGNjID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgcmV0dXJuIGNjIDwgMHg4MCA/IGNcbiAgICAgICAgICAgICAgICA6IGNjIDwgMHg4MDAgPyAoZnJvbUNoYXJDb2RlKDB4YzAgfCAoY2MgPj4+IDYpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKGNjICYgMHgzZikpKVxuICAgICAgICAgICAgICAgIDogKGZyb21DaGFyQ29kZSgweGUwIHwgKChjYyA+Pj4gMTIpICYgMHgwZikpXG4gICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoKGNjID4+PiAgNikgJiAweDNmKSlcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICggY2MgICAgICAgICAmIDB4M2YpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgY2MgPSAweDEwMDAwXG4gICAgICAgICAgICAgICAgKyAoYy5jaGFyQ29kZUF0KDApIC0gMHhEODAwKSAqIDB4NDAwXG4gICAgICAgICAgICAgICAgKyAoYy5jaGFyQ29kZUF0KDEpIC0gMHhEQzAwKTtcbiAgICAgICAgICAgIHJldHVybiAoZnJvbUNoYXJDb2RlKDB4ZjAgfCAoKGNjID4+PiAxOCkgJiAweDA3KSlcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICgoY2MgPj4+IDEyKSAmIDB4M2YpKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKChjYyA+Pj4gIDYpICYgMHgzZikpXG4gICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoIGNjICAgICAgICAgJiAweDNmKSkpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgcmVfdXRvYiA9IC9bXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZGXXxbXlxceDAwLVxceDdGXS9nO1xuICAgIHZhciB1dG9iID0gZnVuY3Rpb24odSkge1xuICAgICAgICByZXR1cm4gdS5yZXBsYWNlKHJlX3V0b2IsIGNiX3V0b2IpO1xuICAgIH07XG4gICAgdmFyIGNiX2VuY29kZSA9IGZ1bmN0aW9uKGNjYykge1xuICAgICAgICB2YXIgcGFkbGVuID0gWzAsIDIsIDFdW2NjYy5sZW5ndGggJSAzXSxcbiAgICAgICAgb3JkID0gY2NjLmNoYXJDb2RlQXQoMCkgPDwgMTZcbiAgICAgICAgICAgIHwgKChjY2MubGVuZ3RoID4gMSA/IGNjYy5jaGFyQ29kZUF0KDEpIDogMCkgPDwgOClcbiAgICAgICAgICAgIHwgKChjY2MubGVuZ3RoID4gMiA/IGNjYy5jaGFyQ29kZUF0KDIpIDogMCkpLFxuICAgICAgICBjaGFycyA9IFtcbiAgICAgICAgICAgIGI2NGNoYXJzLmNoYXJBdCggb3JkID4+PiAxOCksXG4gICAgICAgICAgICBiNjRjaGFycy5jaGFyQXQoKG9yZCA+Pj4gMTIpICYgNjMpLFxuICAgICAgICAgICAgcGFkbGVuID49IDIgPyAnPScgOiBiNjRjaGFycy5jaGFyQXQoKG9yZCA+Pj4gNikgJiA2MyksXG4gICAgICAgICAgICBwYWRsZW4gPj0gMSA/ICc9JyA6IGI2NGNoYXJzLmNoYXJBdChvcmQgJiA2MylcbiAgICAgICAgXTtcbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH07XG4gICAgdmFyIGJ0b2EgPSBnbG9iYWwuYnRvYSAmJiB0eXBlb2YgZ2xvYmFsLmJ0b2EgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IGZ1bmN0aW9uKGIpeyByZXR1cm4gZ2xvYmFsLmJ0b2EoYikgfSA6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgaWYgKGIubWF0Y2goL1teXFx4MDAtXFx4RkZdLykpIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICAgICAgJ1RoZSBzdHJpbmcgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzLidcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIGIucmVwbGFjZSgvW1xcc1xcU117MSwzfS9nLCBjYl9lbmNvZGUpO1xuICAgIH07XG4gICAgdmFyIF9lbmNvZGUgPSBmdW5jdGlvbih1KSB7XG4gICAgICAgIHJldHVybiBidG9hKHV0b2IoU3RyaW5nKHUpKSk7XG4gICAgfTtcbiAgICB2YXIgbWtVcmlTYWZlID0gZnVuY3Rpb24gKGI2NCkge1xuICAgICAgICByZXR1cm4gYjY0LnJlcGxhY2UoL1srXFwvXS9nLCBmdW5jdGlvbihtMCkge1xuICAgICAgICAgICAgcmV0dXJuIG0wID09ICcrJyA/ICctJyA6ICdfJztcbiAgICAgICAgfSkucmVwbGFjZSgvPS9nLCAnJyk7XG4gICAgfTtcbiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24odSwgdXJpc2FmZSkge1xuICAgICAgICByZXR1cm4gdXJpc2FmZSA/IG1rVXJpU2FmZShfZW5jb2RlKHUpKSA6IF9lbmNvZGUodSk7XG4gICAgfTtcbiAgICB2YXIgZW5jb2RlVVJJID0gZnVuY3Rpb24odSkgeyByZXR1cm4gZW5jb2RlKHUsIHRydWUpIH07XG4gICAgdmFyIGZyb21VaW50OEFycmF5O1xuICAgIGlmIChnbG9iYWwuVWludDhBcnJheSkgZnJvbVVpbnQ4QXJyYXkgPSBmdW5jdGlvbihhLCB1cmlzYWZlKSB7XG4gICAgICAgIC8vIHJldHVybiBidG9hKGZyb21DaGFyQ29kZS5hcHBseShudWxsLCBhKSk7XG4gICAgICAgIHZhciBiNjQgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhLmxlbmd0aDsgaSA8IGw7IGkgKz0gMykge1xuICAgICAgICAgICAgdmFyIGEwID0gYVtpXSwgYTEgPSBhW2krMV0sIGEyID0gYVtpKzJdO1xuICAgICAgICAgICAgdmFyIG9yZCA9IGEwIDw8IDE2IHwgYTEgPDwgOCB8IGEyO1xuICAgICAgICAgICAgYjY0ICs9ICAgIGI2NGNoYXJzLmNoYXJBdCggb3JkID4+PiAxOClcbiAgICAgICAgICAgICAgICArICAgICBiNjRjaGFycy5jaGFyQXQoKG9yZCA+Pj4gMTIpICYgNjMpXG4gICAgICAgICAgICAgICAgKyAoIHR5cGVvZiBhMSAhPSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICA/IGI2NGNoYXJzLmNoYXJBdCgob3JkID4+PiAgNikgJiA2MykgOiAnPScpXG4gICAgICAgICAgICAgICAgKyAoIHR5cGVvZiBhMiAhPSAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICAgICA/IGI2NGNoYXJzLmNoYXJBdCggb3JkICAgICAgICAgJiA2MykgOiAnPScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cmlzYWZlID8gbWtVcmlTYWZlKGI2NCkgOiBiNjQ7XG4gICAgfTtcbiAgICAvLyBkZWNvZGVyIHN0dWZmXG4gICAgdmFyIHJlX2J0b3UgPSAvW1xceEMwLVxceERGXVtcXHg4MC1cXHhCRl18W1xceEUwLVxceEVGXVtcXHg4MC1cXHhCRl17Mn18W1xceEYwLVxceEY3XVtcXHg4MC1cXHhCRl17M30vZztcbiAgICB2YXIgY2JfYnRvdSA9IGZ1bmN0aW9uKGNjY2MpIHtcbiAgICAgICAgc3dpdGNoKGNjY2MubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIHZhciBjcCA9ICgoMHgwNyAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgMTgpXG4gICAgICAgICAgICAgICAgfCAgICAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDEyKVxuICAgICAgICAgICAgICAgIHwgICAgKCgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKSA8PCAgNilcbiAgICAgICAgICAgICAgICB8ICAgICAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgzKSksXG4gICAgICAgICAgICBvZmZzZXQgPSBjcCAtIDB4MTAwMDA7XG4gICAgICAgICAgICByZXR1cm4gKGZyb21DaGFyQ29kZSgob2Zmc2V0ICA+Pj4gMTApICsgMHhEODAwKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgob2Zmc2V0ICYgMHgzRkYpICsgMHhEQzAwKSk7XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICAgICAgKCgweDBmICYgY2NjYy5jaGFyQ29kZUF0KDApKSA8PCAxMilcbiAgICAgICAgICAgICAgICAgICAgfCAoKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpIDw8IDYpXG4gICAgICAgICAgICAgICAgICAgIHwgICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDIpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiAgZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgICAgICgoMHgxZiAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgNilcbiAgICAgICAgICAgICAgICAgICAgfCAgKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMSkpXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgYnRvdSA9IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgcmV0dXJuIGIucmVwbGFjZShyZV9idG91LCBjYl9idG91KTtcbiAgICB9O1xuICAgIHZhciBjYl9kZWNvZGUgPSBmdW5jdGlvbihjY2NjKSB7XG4gICAgICAgIHZhciBsZW4gPSBjY2NjLmxlbmd0aCxcbiAgICAgICAgcGFkbGVuID0gbGVuICUgNCxcbiAgICAgICAgbiA9IChsZW4gPiAwID8gYjY0dGFiW2NjY2MuY2hhckF0KDApXSA8PCAxOCA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAxID8gYjY0dGFiW2NjY2MuY2hhckF0KDEpXSA8PCAxMiA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAyID8gYjY0dGFiW2NjY2MuY2hhckF0KDIpXSA8PCAgNiA6IDApXG4gICAgICAgICAgICB8IChsZW4gPiAzID8gYjY0dGFiW2NjY2MuY2hhckF0KDMpXSAgICAgICA6IDApLFxuICAgICAgICBjaGFycyA9IFtcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSggbiA+Pj4gMTYpLFxuICAgICAgICAgICAgZnJvbUNoYXJDb2RlKChuID4+PiAgOCkgJiAweGZmKSxcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSggbiAgICAgICAgICYgMHhmZilcbiAgICAgICAgXTtcbiAgICAgICAgY2hhcnMubGVuZ3RoIC09IFswLCAwLCAyLCAxXVtwYWRsZW5dO1xuICAgICAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gICAgfTtcbiAgICB2YXIgX2F0b2IgPSBnbG9iYWwuYXRvYiAmJiB0eXBlb2YgZ2xvYmFsLmF0b2IgPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IGZ1bmN0aW9uKGEpeyByZXR1cm4gZ2xvYmFsLmF0b2IoYSkgfSA6IGZ1bmN0aW9uKGEpe1xuICAgICAgICByZXR1cm4gYS5yZXBsYWNlKC9cXFN7MSw0fS9nLCBjYl9kZWNvZGUpO1xuICAgIH07XG4gICAgdmFyIGF0b2IgPSBmdW5jdGlvbihhKSB7XG4gICAgICAgIHJldHVybiBfYXRvYihTdHJpbmcoYSkucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csICcnKSk7XG4gICAgfTtcbiAgICB2YXIgX2RlY29kZSA9IGZ1bmN0aW9uKGEpIHsgcmV0dXJuIGJ0b3UoX2F0b2IoYSkpIH07XG4gICAgdmFyIF9mcm9tVVJJID0gZnVuY3Rpb24oYSkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKGEpLnJlcGxhY2UoL1stX10vZywgZnVuY3Rpb24obTApIHtcbiAgICAgICAgICAgIHJldHVybiBtMCA9PSAnLScgPyAnKycgOiAnLydcbiAgICAgICAgfSkucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9dL2csICcnKTtcbiAgICB9O1xuICAgIHZhciBkZWNvZGUgPSBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIF9kZWNvZGUoX2Zyb21VUkkoYSkpO1xuICAgIH07XG4gICAgdmFyIHRvVWludDhBcnJheTtcbiAgICBpZiAoZ2xvYmFsLlVpbnQ4QXJyYXkpIHRvVWludDhBcnJheSA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkuZnJvbShhdG9iKF9mcm9tVVJJKGEpKSwgZnVuY3Rpb24oYykge1xuICAgICAgICAgICAgcmV0dXJuIGMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICB2YXIgbm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgQmFzZTY0ID0gZ2xvYmFsLkJhc2U2NDtcbiAgICAgICAgZ2xvYmFsLkJhc2U2NCA9IF9CYXNlNjQ7XG4gICAgICAgIHJldHVybiBCYXNlNjQ7XG4gICAgfTtcbiAgICAvLyBleHBvcnQgQmFzZTY0XG4gICAgZ2xvYmFsLkJhc2U2NCA9IHtcbiAgICAgICAgVkVSU0lPTjogdmVyc2lvbixcbiAgICAgICAgYXRvYjogYXRvYixcbiAgICAgICAgYnRvYTogYnRvYSxcbiAgICAgICAgZnJvbUJhc2U2NDogZGVjb2RlLFxuICAgICAgICB0b0Jhc2U2NDogZW5jb2RlLFxuICAgICAgICB1dG9iOiB1dG9iLFxuICAgICAgICBlbmNvZGU6IGVuY29kZSxcbiAgICAgICAgZW5jb2RlVVJJOiBlbmNvZGVVUkksXG4gICAgICAgIGJ0b3U6IGJ0b3UsXG4gICAgICAgIGRlY29kZTogZGVjb2RlLFxuICAgICAgICBub0NvbmZsaWN0OiBub0NvbmZsaWN0LFxuICAgICAgICBmcm9tVWludDhBcnJheTogZnJvbVVpbnQ4QXJyYXksXG4gICAgICAgIHRvVWludDhBcnJheTogdG9VaW50OEFycmF5XG4gICAgfTtcbiAgICAvLyBpZiBFUzUgaXMgYXZhaWxhYmxlLCBtYWtlIEJhc2U2NC5leHRlbmRTdHJpbmcoKSBhdmFpbGFibGVcbiAgICBpZiAodHlwZW9mIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgbm9FbnVtID0gZnVuY3Rpb24odil7XG4gICAgICAgICAgICByZXR1cm4ge3ZhbHVlOnYsZW51bWVyYWJsZTpmYWxzZSx3cml0YWJsZTp0cnVlLGNvbmZpZ3VyYWJsZTp0cnVlfTtcbiAgICAgICAgfTtcbiAgICAgICAgZ2xvYmFsLkJhc2U2NC5leHRlbmRTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoXG4gICAgICAgICAgICAgICAgU3RyaW5nLnByb3RvdHlwZSwgJ2Zyb21CYXNlNjQnLCBub0VudW0oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVjb2RlKHRoaXMpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICd0b0Jhc2U2NCcsIG5vRW51bShmdW5jdGlvbiAodXJpc2FmZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlKHRoaXMsIHVyaXNhZmUpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICd0b0Jhc2U2NFVSSScsIG5vRW51bShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbmNvZGUodGhpcywgdHJ1ZSlcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8vXG4gICAgLy8gZXhwb3J0IEJhc2U2NCB0byB0aGUgbmFtZXNwYWNlXG4gICAgLy9cbiAgICBpZiAoZ2xvYmFsWydNZXRlb3InXSkgeyAvLyBNZXRlb3IuanNcbiAgICAgICAgQmFzZTY0ID0gZ2xvYmFsLkJhc2U2NDtcbiAgICB9XG4gICAgLy8gbW9kdWxlLmV4cG9ydHMgYW5kIEFNRCBhcmUgbXV0dWFsbHkgZXhjbHVzaXZlLlxuICAgIC8vIG1vZHVsZS5leHBvcnRzIGhhcyBwcmVjZWRlbmNlLlxuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy5CYXNlNjQgPSBnbG9iYWwuQmFzZTY0O1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCl7IHJldHVybiBnbG9iYWwuQmFzZTY0IH0pO1xuICAgIH1cbiAgICAvLyB0aGF0J3MgaXQhXG4gICAgcmV0dXJuIHtCYXNlNjQ6IGdsb2JhbC5CYXNlNjR9XG59KSk7XG4iLCIvKipcbiAqIGxvZGFzaCAoQ3VzdG9tIEJ1aWxkKSA8aHR0cHM6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgZXhwb3J0cz1cIm5wbVwiIC1vIC4vYFxuICogQ29weXJpZ2h0IGpRdWVyeSBGb3VuZGF0aW9uIGFuZCBvdGhlciBjb250cmlidXRvcnMgPGh0dHBzOi8vanF1ZXJ5Lm9yZy8+XG4gKiBSZWxlYXNlZCB1bmRlciBNSVQgbGljZW5zZSA8aHR0cHM6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuOC4zIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKi9cblxuLyoqIFVzZWQgYXMgdGhlIGBUeXBlRXJyb3JgIG1lc3NhZ2UgZm9yIFwiRnVuY3Rpb25zXCIgbWV0aG9kcy4gKi9cbnZhciBGVU5DX0VSUk9SX1RFWFQgPSAnRXhwZWN0ZWQgYSBmdW5jdGlvbic7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE5BTiA9IDAgLyAwO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UuICovXG52YXIgcmVUcmltID0gL15cXHMrfFxccyskL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBiYWQgc2lnbmVkIGhleGFkZWNpbWFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JhZEhleCA9IC9eWy0rXTB4WzAtOWEtZl0rJC9pO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgYmluYXJ5IHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc0JpbmFyeSA9IC9eMGJbMDFdKyQvaTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG9jdGFsIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVJc09jdGFsID0gL14wb1swLTddKyQvaTtcblxuLyoqIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHdpdGhvdXQgYSBkZXBlbmRlbmN5IG9uIGByb290YC4gKi9cbnZhciBmcmVlUGFyc2VJbnQgPSBwYXJzZUludDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4LFxuICAgIG5hdGl2ZU1pbiA9IE1hdGgubWluO1xuXG4vKipcbiAqIEdldHMgdGhlIHRpbWVzdGFtcCBvZiB0aGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGF0IGhhdmUgZWxhcHNlZCBzaW5jZVxuICogdGhlIFVuaXggZXBvY2ggKDEgSmFudWFyeSAxOTcwIDAwOjAwOjAwIFVUQykuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAyLjQuMFxuICogQGNhdGVnb3J5IERhdGVcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIHRpbWVzdGFtcC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5kZWZlcihmdW5jdGlvbihzdGFtcCkge1xuICogICBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApO1xuICogfSwgXy5ub3coKSk7XG4gKiAvLyA9PiBMb2dzIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIGl0IHRvb2sgZm9yIHRoZSBkZWZlcnJlZCBpbnZvY2F0aW9uLlxuICovXG52YXIgbm93ID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiByb290LkRhdGUubm93KCk7XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdGhhdCBkZWxheXMgaW52b2tpbmcgYGZ1bmNgIHVudGlsIGFmdGVyIGB3YWl0YFxuICogbWlsbGlzZWNvbmRzIGhhdmUgZWxhcHNlZCBzaW5jZSB0aGUgbGFzdCB0aW1lIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2FzXG4gKiBpbnZva2VkLiBUaGUgZGVib3VuY2VkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYCBtZXRob2QgdG8gY2FuY2VsXG4gKiBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS5cbiAqIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uIHRoZVxuICogbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFRoZSBgZnVuY2AgaXMgaW52b2tlZFxuICogd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbi4gU3Vic2VxdWVudFxuICogY2FsbHMgdG8gdGhlIGRlYm91bmNlZCBmdW5jdGlvbiByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2BcbiAqIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8uZGVib3VuY2VgIGFuZCBgXy50aHJvdHRsZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byBkZWxheS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPWZhbHNlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIGxlYWRpbmcgZWRnZSBvZiB0aGUgdGltZW91dC5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy5tYXhXYWl0XVxuICogIFRoZSBtYXhpbXVtIHRpbWUgYGZ1bmNgIGlzIGFsbG93ZWQgdG8gYmUgZGVsYXllZCBiZWZvcmUgaXQncyBpbnZva2VkLlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXguXG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCkpO1xuICpcbiAqIC8vIEludm9rZSBgc2VuZE1haWxgIHdoZW4gY2xpY2tlZCwgZGVib3VuY2luZyBzdWJzZXF1ZW50IGNhbGxzLlxuICogalF1ZXJ5KGVsZW1lbnQpLm9uKCdjbGljaycsIF8uZGVib3VuY2Uoc2VuZE1haWwsIDMwMCwge1xuICogICAnbGVhZGluZyc6IHRydWUsXG4gKiAgICd0cmFpbGluZyc6IGZhbHNlXG4gKiB9KSk7XG4gKlxuICogLy8gRW5zdXJlIGBiYXRjaExvZ2AgaXMgaW52b2tlZCBvbmNlIGFmdGVyIDEgc2Vjb25kIG9mIGRlYm91bmNlZCBjYWxscy5cbiAqIHZhciBkZWJvdW5jZWQgPSBfLmRlYm91bmNlKGJhdGNoTG9nLCAyNTAsIHsgJ21heFdhaXQnOiAxMDAwIH0pO1xuICogdmFyIHNvdXJjZSA9IG5ldyBFdmVudFNvdXJjZSgnL3N0cmVhbScpO1xuICogalF1ZXJ5KHNvdXJjZSkub24oJ21lc3NhZ2UnLCBkZWJvdW5jZWQpO1xuICpcbiAqIC8vIENhbmNlbCB0aGUgdHJhaWxpbmcgZGVib3VuY2VkIGludm9jYXRpb24uXG4gKiBqUXVlcnkod2luZG93KS5vbigncG9wc3RhdGUnLCBkZWJvdW5jZWQuY2FuY2VsKTtcbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICB2YXIgbGFzdEFyZ3MsXG4gICAgICBsYXN0VGhpcyxcbiAgICAgIG1heFdhaXQsXG4gICAgICByZXN1bHQsXG4gICAgICB0aW1lcklkLFxuICAgICAgbGFzdENhbGxUaW1lLFxuICAgICAgbGFzdEludm9rZVRpbWUgPSAwLFxuICAgICAgbGVhZGluZyA9IGZhbHNlLFxuICAgICAgbWF4aW5nID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKEZVTkNfRVJST1JfVEVYVCk7XG4gIH1cbiAgd2FpdCA9IHRvTnVtYmVyKHdhaXQpIHx8IDA7XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAhIW9wdGlvbnMubGVhZGluZztcbiAgICBtYXhpbmcgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucztcbiAgICBtYXhXYWl0ID0gbWF4aW5nID8gbmF0aXZlTWF4KHRvTnVtYmVyKG9wdGlvbnMubWF4V2FpdCkgfHwgMCwgd2FpdCkgOiBtYXhXYWl0O1xuICAgIHRyYWlsaW5nID0gJ3RyYWlsaW5nJyBpbiBvcHRpb25zID8gISFvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cblxuICBmdW5jdGlvbiBpbnZva2VGdW5jKHRpbWUpIHtcbiAgICB2YXIgYXJncyA9IGxhc3RBcmdzLFxuICAgICAgICB0aGlzQXJnID0gbGFzdFRoaXM7XG5cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIGxhc3RJbnZva2VUaW1lID0gdGltZTtcbiAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBsZWFkaW5nRWRnZSh0aW1lKSB7XG4gICAgLy8gUmVzZXQgYW55IGBtYXhXYWl0YCB0aW1lci5cbiAgICBsYXN0SW52b2tlVGltZSA9IHRpbWU7XG4gICAgLy8gU3RhcnQgdGhlIHRpbWVyIGZvciB0aGUgdHJhaWxpbmcgZWRnZS5cbiAgICB0aW1lcklkID0gc2V0VGltZW91dCh0aW1lckV4cGlyZWQsIHdhaXQpO1xuICAgIC8vIEludm9rZSB0aGUgbGVhZGluZyBlZGdlLlxuICAgIHJldHVybiBsZWFkaW5nID8gaW52b2tlRnVuYyh0aW1lKSA6IHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlbWFpbmluZ1dhaXQodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWUsXG4gICAgICAgIHJlc3VsdCA9IHdhaXQgLSB0aW1lU2luY2VMYXN0Q2FsbDtcblxuICAgIHJldHVybiBtYXhpbmcgPyBuYXRpdmVNaW4ocmVzdWx0LCBtYXhXYWl0IC0gdGltZVNpbmNlTGFzdEludm9rZSkgOiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBzaG91bGRJbnZva2UodGltZSkge1xuICAgIHZhciB0aW1lU2luY2VMYXN0Q2FsbCA9IHRpbWUgLSBsYXN0Q2FsbFRpbWUsXG4gICAgICAgIHRpbWVTaW5jZUxhc3RJbnZva2UgPSB0aW1lIC0gbGFzdEludm9rZVRpbWU7XG5cbiAgICAvLyBFaXRoZXIgdGhpcyBpcyB0aGUgZmlyc3QgY2FsbCwgYWN0aXZpdHkgaGFzIHN0b3BwZWQgYW5kIHdlJ3JlIGF0IHRoZVxuICAgIC8vIHRyYWlsaW5nIGVkZ2UsIHRoZSBzeXN0ZW0gdGltZSBoYXMgZ29uZSBiYWNrd2FyZHMgYW5kIHdlJ3JlIHRyZWF0aW5nXG4gICAgLy8gaXQgYXMgdGhlIHRyYWlsaW5nIGVkZ2UsIG9yIHdlJ3ZlIGhpdCB0aGUgYG1heFdhaXRgIGxpbWl0LlxuICAgIHJldHVybiAobGFzdENhbGxUaW1lID09PSB1bmRlZmluZWQgfHwgKHRpbWVTaW5jZUxhc3RDYWxsID49IHdhaXQpIHx8XG4gICAgICAodGltZVNpbmNlTGFzdENhbGwgPCAwKSB8fCAobWF4aW5nICYmIHRpbWVTaW5jZUxhc3RJbnZva2UgPj0gbWF4V2FpdCkpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGltZXJFeHBpcmVkKCkge1xuICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgaWYgKHNob3VsZEludm9rZSh0aW1lKSkge1xuICAgICAgcmV0dXJuIHRyYWlsaW5nRWRnZSh0aW1lKTtcbiAgICB9XG4gICAgLy8gUmVzdGFydCB0aGUgdGltZXIuXG4gICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCByZW1haW5pbmdXYWl0KHRpbWUpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyYWlsaW5nRWRnZSh0aW1lKSB7XG4gICAgdGltZXJJZCA9IHVuZGVmaW5lZDtcblxuICAgIC8vIE9ubHkgaW52b2tlIGlmIHdlIGhhdmUgYGxhc3RBcmdzYCB3aGljaCBtZWFucyBgZnVuY2AgaGFzIGJlZW5cbiAgICAvLyBkZWJvdW5jZWQgYXQgbGVhc3Qgb25jZS5cbiAgICBpZiAodHJhaWxpbmcgJiYgbGFzdEFyZ3MpIHtcbiAgICAgIHJldHVybiBpbnZva2VGdW5jKHRpbWUpO1xuICAgIH1cbiAgICBsYXN0QXJncyA9IGxhc3RUaGlzID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgaWYgKHRpbWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgIH1cbiAgICBsYXN0SW52b2tlVGltZSA9IDA7XG4gICAgbGFzdEFyZ3MgPSBsYXN0Q2FsbFRpbWUgPSBsYXN0VGhpcyA9IHRpbWVySWQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBmdW5jdGlvbiBmbHVzaCgpIHtcbiAgICByZXR1cm4gdGltZXJJZCA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogdHJhaWxpbmdFZGdlKG5vdygpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlYm91bmNlZCgpIHtcbiAgICB2YXIgdGltZSA9IG5vdygpLFxuICAgICAgICBpc0ludm9raW5nID0gc2hvdWxkSW52b2tlKHRpbWUpO1xuXG4gICAgbGFzdEFyZ3MgPSBhcmd1bWVudHM7XG4gICAgbGFzdFRoaXMgPSB0aGlzO1xuICAgIGxhc3RDYWxsVGltZSA9IHRpbWU7XG5cbiAgICBpZiAoaXNJbnZva2luZykge1xuICAgICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gbGVhZGluZ0VkZ2UobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChtYXhpbmcpIHtcbiAgICAgICAgLy8gSGFuZGxlIGludm9jYXRpb25zIGluIGEgdGlnaHQgbG9vcC5cbiAgICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICAgICAgcmV0dXJuIGludm9rZUZ1bmMobGFzdENhbGxUaW1lKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHRpbWVySWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGltZXJJZCA9IHNldFRpbWVvdXQodGltZXJFeHBpcmVkLCB3YWl0KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBkZWJvdW5jZWQuY2FuY2VsID0gY2FuY2VsO1xuICBkZWJvdW5jZWQuZmx1c2ggPSBmbHVzaDtcbiAgcmV0dXJuIGRlYm91bmNlZDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgdGhyb3R0bGVkIGZ1bmN0aW9uIHRoYXQgb25seSBpbnZva2VzIGBmdW5jYCBhdCBtb3N0IG9uY2UgcGVyXG4gKiBldmVyeSBgd2FpdGAgbWlsbGlzZWNvbmRzLiBUaGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGNvbWVzIHdpdGggYSBgY2FuY2VsYFxuICogbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0b1xuICogaW1tZWRpYXRlbHkgaW52b2tlIHRoZW0uIFByb3ZpZGUgYG9wdGlvbnNgIHRvIGluZGljYXRlIHdoZXRoZXIgYGZ1bmNgXG4gKiBzaG91bGQgYmUgaW52b2tlZCBvbiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgXG4gKiB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlXG4gKiB0aHJvdHRsZWQgZnVuY3Rpb24uIFN1YnNlcXVlbnQgY2FsbHMgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbiByZXR1cm4gdGhlXG4gKiByZXN1bHQgb2YgdGhlIGxhc3QgYGZ1bmNgIGludm9jYXRpb24uXG4gKlxuICogKipOb3RlOioqIElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpc1xuICogaW52b2tlZCBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb25cbiAqIGlzIGludm9rZWQgbW9yZSB0aGFuIG9uY2UgZHVyaW5nIHRoZSBgd2FpdGAgdGltZW91dC5cbiAqXG4gKiBJZiBgd2FpdGAgaXMgYDBgIGFuZCBgbGVhZGluZ2AgaXMgYGZhbHNlYCwgYGZ1bmNgIGludm9jYXRpb24gaXMgZGVmZXJyZWRcbiAqIHVudGlsIHRvIHRoZSBuZXh0IHRpY2ssIHNpbWlsYXIgdG8gYHNldFRpbWVvdXRgIHdpdGggYSB0aW1lb3V0IG9mIGAwYC5cbiAqXG4gKiBTZWUgW0RhdmlkIENvcmJhY2hvJ3MgYXJ0aWNsZV0oaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9kZWJvdW5jaW5nLXRocm90dGxpbmctZXhwbGFpbmVkLWV4YW1wbGVzLylcbiAqIGZvciBkZXRhaWxzIG92ZXIgdGhlIGRpZmZlcmVuY2VzIGJldHdlZW4gYF8udGhyb3R0bGVgIGFuZCBgXy5kZWJvdW5jZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IEZ1bmN0aW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB0aHJvdHRsZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbd2FpdD0wXSBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0byB0aHJvdHRsZSBpbnZvY2F0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV0gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdXG4gKiAgU3BlY2lmeSBpbnZva2luZyBvbiB0aGUgbGVhZGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy50cmFpbGluZz10cnVlXVxuICogIFNwZWNpZnkgaW52b2tpbmcgb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyB0aHJvdHRsZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIEF2b2lkIGV4Y2Vzc2l2ZWx5IHVwZGF0aW5nIHRoZSBwb3NpdGlvbiB3aGlsZSBzY3JvbGxpbmcuXG4gKiBqUXVlcnkod2luZG93KS5vbignc2Nyb2xsJywgXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKSk7XG4gKlxuICogLy8gSW52b2tlIGByZW5ld1Rva2VuYCB3aGVuIHRoZSBjbGljayBldmVudCBpcyBmaXJlZCwgYnV0IG5vdCBtb3JlIHRoYW4gb25jZSBldmVyeSA1IG1pbnV0ZXMuXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZShyZW5ld1Rva2VuLCAzMDAwMDAsIHsgJ3RyYWlsaW5nJzogZmFsc2UgfSk7XG4gKiBqUXVlcnkoZWxlbWVudCkub24oJ2NsaWNrJywgdGhyb3R0bGVkKTtcbiAqXG4gKiAvLyBDYW5jZWwgdGhlIHRyYWlsaW5nIHRocm90dGxlZCBpbnZvY2F0aW9uLlxuICogalF1ZXJ5KHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhyb3R0bGVkLmNhbmNlbCk7XG4gKi9cbmZ1bmN0aW9uIHRocm90dGxlKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgdmFyIGxlYWRpbmcgPSB0cnVlLFxuICAgICAgdHJhaWxpbmcgPSB0cnVlO1xuXG4gIGlmICh0eXBlb2YgZnVuYyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy5sZWFkaW5nIDogbGVhZGluZztcbiAgICB0cmFpbGluZyA9ICd0cmFpbGluZycgaW4gb3B0aW9ucyA/ICEhb3B0aW9ucy50cmFpbGluZyA6IHRyYWlsaW5nO1xuICB9XG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCB7XG4gICAgJ2xlYWRpbmcnOiBsZWFkaW5nLFxuICAgICdtYXhXYWl0Jzogd2FpdCxcbiAgICAndHJhaWxpbmcnOiB0cmFpbGluZ1xuICB9KTtcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAhIXZhbHVlICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgU3ltYm9sYCBwcmltaXRpdmUgb3Igb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgc3ltYm9sLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNTeW1ib2woU3ltYm9sLml0ZXJhdG9yKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzU3ltYm9sKCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3ltYm9sKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N5bWJvbCcgfHxcbiAgICAoaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSA9PSBzeW1ib2xUYWcpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBudW1iZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHByb2Nlc3MuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBudW1iZXIuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udG9OdW1iZXIoMy4yKTtcbiAqIC8vID0+IDMuMlxuICpcbiAqIF8udG9OdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiA1ZS0zMjRcbiAqXG4gKiBfLnRvTnVtYmVyKEluZmluaXR5KTtcbiAqIC8vID0+IEluZmluaXR5XG4gKlxuICogXy50b051bWJlcignMy4yJyk7XG4gKiAvLyA9PiAzLjJcbiAqL1xuZnVuY3Rpb24gdG9OdW1iZXIodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNTeW1ib2wodmFsdWUpKSB7XG4gICAgcmV0dXJuIE5BTjtcbiAgfVxuICBpZiAoaXNPYmplY3QodmFsdWUpKSB7XG4gICAgdmFyIG90aGVyID0gdHlwZW9mIHZhbHVlLnZhbHVlT2YgPT0gJ2Z1bmN0aW9uJyA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xuICAgIHZhbHVlID0gaXNPYmplY3Qob3RoZXIpID8gKG90aGVyICsgJycpIDogb3RoZXI7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gMCA/IHZhbHVlIDogK3ZhbHVlO1xuICB9XG4gIHZhbHVlID0gdmFsdWUucmVwbGFjZShyZVRyaW0sICcnKTtcbiAgdmFyIGlzQmluYXJ5ID0gcmVJc0JpbmFyeS50ZXN0KHZhbHVlKTtcbiAgcmV0dXJuIChpc0JpbmFyeSB8fCByZUlzT2N0YWwudGVzdCh2YWx1ZSkpXG4gICAgPyBmcmVlUGFyc2VJbnQodmFsdWUuc2xpY2UoMiksIGlzQmluYXJ5ID8gMiA6IDgpXG4gICAgOiAocmVJc0JhZEhleC50ZXN0KHZhbHVlKSA/IE5BTiA6ICt2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdGhyb3R0bGU7XG4iLCJ2YXIgd2lsZGNhcmQgPSByZXF1aXJlKCd3aWxkY2FyZCcpO1xudmFyIHJlTWltZVBhcnRTcGxpdCA9IC9bXFwvXFwrXFwuXS87XG5cbi8qKlxuICAjIG1pbWUtbWF0Y2hcblxuICBBIHNpbXBsZSBmdW5jdGlvbiB0byBjaGVja2VyIHdoZXRoZXIgYSB0YXJnZXQgbWltZSB0eXBlIG1hdGNoZXMgYSBtaW1lLXR5cGVcbiAgcGF0dGVybiAoZS5nLiBpbWFnZS9qcGVnIG1hdGNoZXMgaW1hZ2UvanBlZyBPUiBpbWFnZS8qKS5cblxuICAjIyBFeGFtcGxlIFVzYWdlXG5cbiAgPDw8IGV4YW1wbGUuanNcblxuKiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgcGF0dGVybikge1xuICBmdW5jdGlvbiB0ZXN0KHBhdHRlcm4pIHtcbiAgICB2YXIgcmVzdWx0ID0gd2lsZGNhcmQocGF0dGVybiwgdGFyZ2V0LCByZU1pbWVQYXJ0U3BsaXQpO1xuXG4gICAgLy8gZW5zdXJlIHRoYXQgd2UgaGF2ZSBhIHZhbGlkIG1pbWUgdHlwZSAoc2hvdWxkIGhhdmUgdHdvIHBhcnRzKVxuICAgIHJldHVybiByZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+PSAyO1xuICB9XG5cbiAgcmV0dXJuIHBhdHRlcm4gPyB0ZXN0KHBhdHRlcm4uc3BsaXQoJzsnKVswXSkgOiB0ZXN0O1xufTtcbiIsIi8qIGpzaGludCBub2RlOiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICAjIHdpbGRjYXJkXG5cbiAgVmVyeSBzaW1wbGUgd2lsZGNhcmQgbWF0Y2hpbmcsIHdoaWNoIGlzIGRlc2lnbmVkIHRvIHByb3ZpZGUgdGhlIHNhbWVcbiAgZnVuY3Rpb25hbGl0eSB0aGF0IGlzIGZvdW5kIGluIHRoZVxuICBbZXZlXShodHRwczovL2dpdGh1Yi5jb20vYWRvYmUtd2VicGxhdGZvcm0vZXZlKSBldmVudGluZyBsaWJyYXJ5LlxuXG4gICMjIFVzYWdlXG5cbiAgSXQgd29ya3Mgd2l0aCBzdHJpbmdzOlxuXG4gIDw8PCBleGFtcGxlcy9zdHJpbmdzLmpzXG5cbiAgQXJyYXlzOlxuXG4gIDw8PCBleGFtcGxlcy9hcnJheXMuanNcblxuICBPYmplY3RzIChtYXRjaGluZyBhZ2FpbnN0IGtleXMpOlxuXG4gIDw8PCBleGFtcGxlcy9vYmplY3RzLmpzXG5cbiAgV2hpbGUgdGhlIGxpYnJhcnkgd29ya3MgaW4gTm9kZSwgaWYgeW91IGFyZSBhcmUgbG9va2luZyBmb3IgZmlsZS1iYXNlZFxuICB3aWxkY2FyZCBtYXRjaGluZyB0aGVuIHlvdSBzaG91bGQgaGF2ZSBhIGxvb2sgYXQ6XG5cbiAgPGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS1nbG9iPlxuKiovXG5cbmZ1bmN0aW9uIFdpbGRjYXJkTWF0Y2hlcih0ZXh0LCBzZXBhcmF0b3IpIHtcbiAgdGhpcy50ZXh0ID0gdGV4dCA9IHRleHQgfHwgJyc7XG4gIHRoaXMuaGFzV2lsZCA9IH50ZXh0LmluZGV4T2YoJyonKTtcbiAgdGhpcy5zZXBhcmF0b3IgPSBzZXBhcmF0b3I7XG4gIHRoaXMucGFydHMgPSB0ZXh0LnNwbGl0KHNlcGFyYXRvcik7XG59XG5cbldpbGRjYXJkTWF0Y2hlci5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihpbnB1dCkge1xuICB2YXIgbWF0Y2hlcyA9IHRydWU7XG4gIHZhciBwYXJ0cyA9IHRoaXMucGFydHM7XG4gIHZhciBpaTtcbiAgdmFyIHBhcnRzQ291bnQgPSBwYXJ0cy5sZW5ndGg7XG4gIHZhciB0ZXN0UGFydHM7XG5cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSAnc3RyaW5nJyB8fCBpbnB1dCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgIGlmICghdGhpcy5oYXNXaWxkICYmIHRoaXMudGV4dCAhPSBpbnB1dCkge1xuICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXN0UGFydHMgPSAoaW5wdXQgfHwgJycpLnNwbGl0KHRoaXMuc2VwYXJhdG9yKTtcbiAgICAgIGZvciAoaWkgPSAwOyBtYXRjaGVzICYmIGlpIDwgcGFydHNDb3VudDsgaWkrKykge1xuICAgICAgICBpZiAocGFydHNbaWldID09PSAnKicpICB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaWkgPCB0ZXN0UGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IHBhcnRzW2lpXSA9PT0gdGVzdFBhcnRzW2lpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtYXRjaGVzID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbWF0Y2hlcywgdGhlbiByZXR1cm4gdGhlIGNvbXBvbmVudCBwYXJ0c1xuICAgICAgbWF0Y2hlcyA9IG1hdGNoZXMgJiYgdGVzdFBhcnRzO1xuICAgIH1cbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgaW5wdXQuc3BsaWNlID09ICdmdW5jdGlvbicpIHtcbiAgICBtYXRjaGVzID0gW107XG5cbiAgICBmb3IgKGlpID0gaW5wdXQubGVuZ3RoOyBpaS0tOyApIHtcbiAgICAgIGlmICh0aGlzLm1hdGNoKGlucHV0W2lpXSkpIHtcbiAgICAgICAgbWF0Y2hlc1ttYXRjaGVzLmxlbmd0aF0gPSBpbnB1dFtpaV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBpbnB1dCA9PSAnb2JqZWN0Jykge1xuICAgIG1hdGNoZXMgPSB7fTtcblxuICAgIGZvciAodmFyIGtleSBpbiBpbnB1dCkge1xuICAgICAgaWYgKHRoaXMubWF0Y2goa2V5KSkge1xuICAgICAgICBtYXRjaGVzW2tleV0gPSBpbnB1dFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXRjaGVzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih0ZXh0LCB0ZXN0LCBzZXBhcmF0b3IpIHtcbiAgdmFyIG1hdGNoZXIgPSBuZXcgV2lsZGNhcmRNYXRjaGVyKHRleHQsIHNlcGFyYXRvciB8fCAvW1xcL1xcLl0vKTtcbiAgaWYgKHR5cGVvZiB0ZXN0ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIG1hdGNoZXIubWF0Y2godGVzdCk7XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlcjtcbn07XG4iLCIvKipcbiogQ3JlYXRlIGFuIGV2ZW50IGVtaXR0ZXIgd2l0aCBuYW1lc3BhY2VzXG4qIEBuYW1lIGNyZWF0ZU5hbWVzcGFjZUVtaXR0ZXJcbiogQGV4YW1wbGVcbiogdmFyIGVtaXR0ZXIgPSByZXF1aXJlKCcuL2luZGV4JykoKVxuKlxuKiBlbWl0dGVyLm9uKCcqJywgZnVuY3Rpb24gKCkge1xuKiAgIGNvbnNvbGUubG9nKCdhbGwgZXZlbnRzIGVtaXR0ZWQnLCB0aGlzLmV2ZW50KVxuKiB9KVxuKlxuKiBlbWl0dGVyLm9uKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge1xuKiAgIGNvbnNvbGUubG9nKCdleGFtcGxlIGV2ZW50IGVtaXR0ZWQnKVxuKiB9KVxuKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlTmFtZXNwYWNlRW1pdHRlciAoKSB7XG4gIHZhciBlbWl0dGVyID0ge31cbiAgdmFyIF9mbnMgPSBlbWl0dGVyLl9mbnMgPSB7fVxuXG4gIC8qKlxuICAqIEVtaXQgYW4gZXZlbnQuIE9wdGlvbmFsbHkgbmFtZXNwYWNlIHRoZSBldmVudC4gSGFuZGxlcnMgYXJlIGZpcmVkIGluIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IHdlcmUgYWRkZWQgd2l0aCBleGFjdCBtYXRjaGVzIHRha2luZyBwcmVjZWRlbmNlLiBTZXBhcmF0ZSB0aGUgbmFtZXNwYWNlIGFuZCBldmVudCB3aXRoIGEgYDpgXG4gICogQG5hbWUgZW1pdFxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCDigJMgdGhlIG5hbWUgb2YgdGhlIGV2ZW50LCB3aXRoIG9wdGlvbmFsIG5hbWVzcGFjZVxuICAqIEBwYXJhbSB7Li4uKn0gZGF0YSDigJMgdXAgdG8gNiBhcmd1bWVudHMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZSBldmVudCBsaXN0ZW5lclxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5lbWl0KCdleGFtcGxlJylcbiAgKiBlbWl0dGVyLmVtaXQoJ2RlbW86dGVzdCcpXG4gICogZW1pdHRlci5lbWl0KCdkYXRhJywgeyBleGFtcGxlOiB0cnVlfSwgJ2Egc3RyaW5nJywgMSlcbiAgKi9cbiAgZW1pdHRlci5lbWl0ID0gZnVuY3Rpb24gZW1pdCAoZXZlbnQsIGFyZzEsIGFyZzIsIGFyZzMsIGFyZzQsIGFyZzUsIGFyZzYpIHtcbiAgICB2YXIgdG9FbWl0ID0gZ2V0TGlzdGVuZXJzKGV2ZW50KVxuXG4gICAgaWYgKHRvRW1pdC5sZW5ndGgpIHtcbiAgICAgIGVtaXRBbGwoZXZlbnQsIHRvRW1pdCwgW2FyZzEsIGFyZzIsIGFyZzMsIGFyZzQsIGFyZzUsIGFyZzZdKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAqIENyZWF0ZSBlbiBldmVudCBsaXN0ZW5lci5cbiAgKiBAbmFtZSBvblxuICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gICogQGV4YW1wbGVcbiAgKiBlbWl0dGVyLm9uKCdleGFtcGxlJywgZnVuY3Rpb24gKCkge30pXG4gICogZW1pdHRlci5vbignZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9uID0gZnVuY3Rpb24gb24gKGV2ZW50LCBmbikge1xuICAgIGlmICghX2Zuc1tldmVudF0pIHtcbiAgICAgIF9mbnNbZXZlbnRdID0gW11cbiAgICB9XG5cbiAgICBfZm5zW2V2ZW50XS5wdXNoKGZuKVxuICB9XG5cbiAgLyoqXG4gICogQ3JlYXRlIGVuIGV2ZW50IGxpc3RlbmVyIHRoYXQgZmlyZXMgb25jZS5cbiAgKiBAbmFtZSBvbmNlXG4gICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgKiBAZXhhbXBsZVxuICAqIGVtaXR0ZXIub25jZSgnZXhhbXBsZScsIGZ1bmN0aW9uICgpIHt9KVxuICAqIGVtaXR0ZXIub25jZSgnZGVtbycsIGZ1bmN0aW9uICgpIHt9KVxuICAqL1xuICBlbWl0dGVyLm9uY2UgPSBmdW5jdGlvbiBvbmNlIChldmVudCwgZm4pIHtcbiAgICBmdW5jdGlvbiBvbmUgKCkge1xuICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgZW1pdHRlci5vZmYoZXZlbnQsIG9uZSlcbiAgICB9XG4gICAgdGhpcy5vbihldmVudCwgb25lKVxuICB9XG5cbiAgLyoqXG4gICogU3RvcCBsaXN0ZW5pbmcgdG8gYW4gZXZlbnQuIFN0b3AgYWxsIGxpc3RlbmVycyBvbiBhbiBldmVudCBieSBvbmx5IHBhc3NpbmcgdGhlIGV2ZW50IG5hbWUuIFN0b3AgYSBzaW5nbGUgbGlzdGVuZXIgYnkgcGFzc2luZyB0aGF0IGV2ZW50IGhhbmRsZXIgYXMgYSBjYWxsYmFjay5cbiAgKiBZb3UgbXVzdCBiZSBleHBsaWNpdCBhYm91dCB3aGF0IHdpbGwgYmUgdW5zdWJzY3JpYmVkOiBgZW1pdHRlci5vZmYoJ2RlbW8nKWAgd2lsbCB1bnN1YnNjcmliZSBhbiBgZW1pdHRlci5vbignZGVtbycpYCBsaXN0ZW5lcixcbiAgKiBgZW1pdHRlci5vZmYoJ2RlbW86ZXhhbXBsZScpYCB3aWxsIHVuc3Vic2NyaWJlIGFuIGBlbWl0dGVyLm9uKCdkZW1vOmV4YW1wbGUnKWAgbGlzdGVuZXJcbiAgKiBAbmFtZSBvZmZcbiAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbZm5dIOKAkyB0aGUgc3BlY2lmaWMgaGFuZGxlclxuICAqIEBleGFtcGxlXG4gICogZW1pdHRlci5vZmYoJ2V4YW1wbGUnKVxuICAqIGVtaXR0ZXIub2ZmKCdkZW1vJywgZnVuY3Rpb24gKCkge30pXG4gICovXG4gIGVtaXR0ZXIub2ZmID0gZnVuY3Rpb24gb2ZmIChldmVudCwgZm4pIHtcbiAgICB2YXIga2VlcCA9IFtdXG5cbiAgICBpZiAoZXZlbnQgJiYgZm4pIHtcbiAgICAgIHZhciBmbnMgPSB0aGlzLl9mbnNbZXZlbnRdXG4gICAgICB2YXIgaSA9IDBcbiAgICAgIHZhciBsID0gZm5zID8gZm5zLmxlbmd0aCA6IDBcblxuICAgICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGlmIChmbnNbaV0gIT09IGZuKSB7XG4gICAgICAgICAga2VlcC5wdXNoKGZuc1tpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGtlZXAubGVuZ3RoID8gdGhpcy5fZm5zW2V2ZW50XSA9IGtlZXAgOiBkZWxldGUgdGhpcy5fZm5zW2V2ZW50XVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGlzdGVuZXJzIChlKSB7XG4gICAgdmFyIG91dCA9IF9mbnNbZV0gPyBfZm5zW2VdIDogW11cbiAgICB2YXIgaWR4ID0gZS5pbmRleE9mKCc6JylcbiAgICB2YXIgYXJncyA9IChpZHggPT09IC0xKSA/IFtlXSA6IFtlLnN1YnN0cmluZygwLCBpZHgpLCBlLnN1YnN0cmluZyhpZHggKyAxKV1cblxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoX2ZucylcbiAgICB2YXIgaSA9IDBcbiAgICB2YXIgbCA9IGtleXMubGVuZ3RoXG5cbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldXG4gICAgICBpZiAoa2V5ID09PSAnKicpIHtcbiAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChfZm5zW2tleV0pXG4gICAgICB9XG5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMiAmJiBhcmdzWzBdID09PSBrZXkpIHtcbiAgICAgICAgb3V0ID0gb3V0LmNvbmNhdChfZm5zW2tleV0pXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbiAgZnVuY3Rpb24gZW1pdEFsbCAoZSwgZm5zLCBhcmdzKSB7XG4gICAgdmFyIGkgPSAwXG4gICAgdmFyIGwgPSBmbnMubGVuZ3RoXG5cbiAgICBmb3IgKGk7IGkgPCBsOyBpKyspIHtcbiAgICAgIGlmICghZm5zW2ldKSBicmVha1xuICAgICAgZm5zW2ldLmV2ZW50ID0gZVxuICAgICAgZm5zW2ldLmFwcGx5KGZuc1tpXSwgYXJncylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZW1pdHRlclxufVxuIiwibGV0IHsgdXJsQWxwaGFiZXQgfSA9IHJlcXVpcmUoJy4vdXJsLWFscGhhYmV0L2luZGV4LmNqcycpXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICBpZiAoXG4gICAgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ1JlYWN0TmF0aXZlJyAmJlxuICAgIHR5cGVvZiBjcnlwdG8gPT09ICd1bmRlZmluZWQnXG4gICkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdSZWFjdCBOYXRpdmUgZG9lcyBub3QgaGF2ZSBhIGJ1aWx0LWluIHNlY3VyZSByYW5kb20gZ2VuZXJhdG9yLiAnICtcbiAgICAgICAgJ0lmIHlvdSBkb27igJl0IG5lZWQgdW5wcmVkaWN0YWJsZSBJRHMgdXNlIGBuYW5vaWQvbm9uLXNlY3VyZWAuICcgK1xuICAgICAgICAnRm9yIHNlY3VyZSBJRHMsIGltcG9ydCBgcmVhY3QtbmF0aXZlLWdldC1yYW5kb20tdmFsdWVzYCAnICtcbiAgICAgICAgJ2JlZm9yZSBOYW5vIElELidcbiAgICApXG4gIH1cbiAgaWYgKHR5cGVvZiBtc0NyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNyeXB0byA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnSW1wb3J0IGZpbGUgd2l0aCBgaWYgKCF3aW5kb3cuY3J5cHRvKSB3aW5kb3cuY3J5cHRvID0gd2luZG93Lm1zQ3J5cHRvYCcgK1xuICAgICAgICAnIGJlZm9yZSBpbXBvcnRpbmcgTmFubyBJRCB0byBmaXggSUUgMTEgc3VwcG9ydCdcbiAgICApXG4gIH1cbiAgaWYgKHR5cGVvZiBjcnlwdG8gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ1lvdXIgYnJvd3NlciBkb2VzIG5vdCBoYXZlIHNlY3VyZSByYW5kb20gZ2VuZXJhdG9yLiAnICtcbiAgICAgICAgJ0lmIHlvdSBkb27igJl0IG5lZWQgdW5wcmVkaWN0YWJsZSBJRHMsIHlvdSBjYW4gdXNlIG5hbm9pZC9ub24tc2VjdXJlLidcbiAgICApXG4gIH1cbn1cbmxldCByYW5kb20gPSBieXRlcyA9PiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KGJ5dGVzKSlcbmxldCBjdXN0b21SYW5kb20gPSAoYWxwaGFiZXQsIHNpemUsIGdldFJhbmRvbSkgPT4ge1xuICBsZXQgbWFzayA9ICgyIDw8IChNYXRoLmxvZyhhbHBoYWJldC5sZW5ndGggLSAxKSAvIE1hdGguTE4yKSkgLSAxXG4gIGxldCBzdGVwID0gLX4oKDEuNiAqIG1hc2sgKiBzaXplKSAvIGFscGhhYmV0Lmxlbmd0aClcbiAgcmV0dXJuICgpID0+IHtcbiAgICBsZXQgaWQgPSAnJ1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBsZXQgYnl0ZXMgPSBnZXRSYW5kb20oc3RlcClcbiAgICAgIGxldCBqID0gc3RlcFxuICAgICAgd2hpbGUgKGotLSkge1xuICAgICAgICBpZCArPSBhbHBoYWJldFtieXRlc1tqXSAmIG1hc2tdIHx8ICcnXG4gICAgICAgIGlmIChpZC5sZW5ndGggPT09IHNpemUpIHJldHVybiBpZFxuICAgICAgfVxuICAgIH1cbiAgfVxufVxubGV0IGN1c3RvbUFscGhhYmV0ID0gKGFscGhhYmV0LCBzaXplKSA9PiBjdXN0b21SYW5kb20oYWxwaGFiZXQsIHNpemUsIHJhbmRvbSlcbmxldCBuYW5vaWQgPSAoc2l6ZSA9IDIxKSA9PiB7XG4gIGxldCBpZCA9ICcnXG4gIGxldCBieXRlcyA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoc2l6ZSkpXG4gIHdoaWxlIChzaXplLS0pIHtcbiAgICBsZXQgYnl0ZSA9IGJ5dGVzW3NpemVdICYgNjNcbiAgICBpZiAoYnl0ZSA8IDM2KSB7XG4gICAgICBpZCArPSBieXRlLnRvU3RyaW5nKDM2KVxuICAgIH0gZWxzZSBpZiAoYnl0ZSA8IDYyKSB7XG4gICAgICBpZCArPSAoYnl0ZSAtIDI2KS50b1N0cmluZygzNikudG9VcHBlckNhc2UoKVxuICAgIH0gZWxzZSBpZiAoYnl0ZSA8IDYzKSB7XG4gICAgICBpZCArPSAnXydcbiAgICB9IGVsc2Uge1xuICAgICAgaWQgKz0gJy0nXG4gICAgfVxuICB9XG4gIHJldHVybiBpZFxufVxubW9kdWxlLmV4cG9ydHMgPSB7IG5hbm9pZCwgY3VzdG9tQWxwaGFiZXQsIGN1c3RvbVJhbmRvbSwgdXJsQWxwaGFiZXQsIHJhbmRvbSB9XG4iLCJsZXQgdXJsQWxwaGFiZXQgPVxuICAndXNlYW5kb20tMjZUMTk4MzQwUFg3NXB4SkFDS1ZFUllNSU5EQlVTSFdPTEZfR1FaYmZnaGprbHF2d3l6cmljdCdcbm1vZHVsZS5leHBvcnRzID0geyB1cmxBbHBoYWJldCB9XG4iLCJ2YXIgbixsLHUsdCxpLHIsbyxmLGU9e30sYz1bXSxzPS9hY2l0fGV4KD86c3xnfG58cHwkKXxycGh8Z3JpZHxvd3N8bW5jfG50d3xpbmVbY2hdfHpvb3xeb3JkfGl0ZXJhL2k7ZnVuY3Rpb24gYShuLGwpe2Zvcih2YXIgdSBpbiBsKW5bdV09bFt1XTtyZXR1cm4gbn1mdW5jdGlvbiB2KG4pe3ZhciBsPW4ucGFyZW50Tm9kZTtsJiZsLnJlbW92ZUNoaWxkKG4pfWZ1bmN0aW9uIGgobCx1LHQpe3ZhciBpLHIsbyxmPXt9O2ZvcihvIGluIHUpXCJrZXlcIj09bz9pPXVbb106XCJyZWZcIj09bz9yPXVbb106ZltvXT11W29dO2lmKGFyZ3VtZW50cy5sZW5ndGg+MiYmKGYuY2hpbGRyZW49YXJndW1lbnRzLmxlbmd0aD4zP24uY2FsbChhcmd1bWVudHMsMik6dCksXCJmdW5jdGlvblwiPT10eXBlb2YgbCYmbnVsbCE9bC5kZWZhdWx0UHJvcHMpZm9yKG8gaW4gbC5kZWZhdWx0UHJvcHMpdm9pZCAwPT09ZltvXSYmKGZbb109bC5kZWZhdWx0UHJvcHNbb10pO3JldHVybiBwKGwsZixpLHIsbnVsbCl9ZnVuY3Rpb24gcChuLHQsaSxyLG8pe3ZhciBmPXt0eXBlOm4scHJvcHM6dCxrZXk6aSxyZWY6cixfX2s6bnVsbCxfXzpudWxsLF9fYjowLF9fZTpudWxsLF9fZDp2b2lkIDAsX19jOm51bGwsX19oOm51bGwsY29uc3RydWN0b3I6dm9pZCAwLF9fdjpudWxsPT1vPysrdTpvfTtyZXR1cm4gbnVsbD09byYmbnVsbCE9bC52bm9kZSYmbC52bm9kZShmKSxmfWZ1bmN0aW9uIHkobil7cmV0dXJuIG4uY2hpbGRyZW59ZnVuY3Rpb24gZChuLGwpe3RoaXMucHJvcHM9bix0aGlzLmNvbnRleHQ9bH1mdW5jdGlvbiBfKG4sbCl7aWYobnVsbD09bClyZXR1cm4gbi5fXz9fKG4uX18sbi5fXy5fX2suaW5kZXhPZihuKSsxKTpudWxsO2Zvcih2YXIgdTtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSlyZXR1cm4gdS5fX2U7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2Ygbi50eXBlP18obik6bnVsbH1mdW5jdGlvbiBrKG4pe3ZhciBsLHU7aWYobnVsbCE9KG49bi5fXykmJm51bGwhPW4uX19jKXtmb3Iobi5fX2U9bi5fX2MuYmFzZT1udWxsLGw9MDtsPG4uX19rLmxlbmd0aDtsKyspaWYobnVsbCE9KHU9bi5fX2tbbF0pJiZudWxsIT11Ll9fZSl7bi5fX2U9bi5fX2MuYmFzZT11Ll9fZTticmVha31yZXR1cm4gayhuKX19ZnVuY3Rpb24geChuKXsoIW4uX19kJiYobi5fX2Q9ITApJiZpLnB1c2gobikmJiFiLl9fcisrfHxvIT09bC5kZWJvdW5jZVJlbmRlcmluZykmJigobz1sLmRlYm91bmNlUmVuZGVyaW5nKXx8cikoYil9ZnVuY3Rpb24gYigpe2Zvcih2YXIgbjtiLl9fcj1pLmxlbmd0aDspbj1pLnNvcnQoZnVuY3Rpb24obixsKXtyZXR1cm4gbi5fX3YuX19iLWwuX192Ll9fYn0pLGk9W10sbi5zb21lKGZ1bmN0aW9uKG4pe3ZhciBsLHUsdCxpLHIsbztuLl9fZCYmKHI9KGk9KGw9bikuX192KS5fX2UsKG89bC5fX1ApJiYodT1bXSwodD1hKHt9LGkpKS5fX3Y9aS5fX3YrMSxJKG8saSx0LGwuX19uLHZvaWQgMCE9PW8ub3duZXJTVkdFbGVtZW50LG51bGwhPWkuX19oP1tyXTpudWxsLHUsbnVsbD09cj9fKGkpOnIsaS5fX2gpLFQodSxpKSxpLl9fZSE9ciYmayhpKSkpfSl9ZnVuY3Rpb24gbShuLGwsdSx0LGkscixvLGYscyxhKXt2YXIgdixoLGQsayx4LGIsbSxBPXQmJnQuX19rfHxjLFA9QS5sZW5ndGg7Zm9yKHUuX19rPVtdLHY9MDt2PGwubGVuZ3RoO3YrKylpZihudWxsIT0oaz11Ll9fa1t2XT1udWxsPT0oaz1sW3ZdKXx8XCJib29sZWFuXCI9PXR5cGVvZiBrP251bGw6XCJzdHJpbmdcIj09dHlwZW9mIGt8fFwibnVtYmVyXCI9PXR5cGVvZiBrfHxcImJpZ2ludFwiPT10eXBlb2Ygaz9wKG51bGwsayxudWxsLG51bGwsayk6QXJyYXkuaXNBcnJheShrKT9wKHkse2NoaWxkcmVuOmt9LG51bGwsbnVsbCxudWxsKTprLl9fYj4wP3Aoay50eXBlLGsucHJvcHMsay5rZXksbnVsbCxrLl9fdik6aykpe2lmKGsuX189dSxrLl9fYj11Ll9fYisxLG51bGw9PT0oZD1BW3ZdKXx8ZCYmay5rZXk9PWQua2V5JiZrLnR5cGU9PT1kLnR5cGUpQVt2XT12b2lkIDA7ZWxzZSBmb3IoaD0wO2g8UDtoKyspe2lmKChkPUFbaF0pJiZrLmtleT09ZC5rZXkmJmsudHlwZT09PWQudHlwZSl7QVtoXT12b2lkIDA7YnJlYWt9ZD1udWxsfUkobixrLGQ9ZHx8ZSxpLHIsbyxmLHMsYSkseD1rLl9fZSwoaD1rLnJlZikmJmQucmVmIT1oJiYobXx8KG09W10pLGQucmVmJiZtLnB1c2goZC5yZWYsbnVsbCxrKSxtLnB1c2goaCxrLl9fY3x8eCxrKSksbnVsbCE9eD8obnVsbD09YiYmKGI9eCksXCJmdW5jdGlvblwiPT10eXBlb2Ygay50eXBlJiZrLl9faz09PWQuX19rP2suX19kPXM9ZyhrLHMsbik6cz13KG4sayxkLEEseCxzKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiB1LnR5cGUmJih1Ll9fZD1zKSk6cyYmZC5fX2U9PXMmJnMucGFyZW50Tm9kZSE9biYmKHM9XyhkKSl9Zm9yKHUuX19lPWIsdj1QO3YtLTspbnVsbCE9QVt2XSYmKFwiZnVuY3Rpb25cIj09dHlwZW9mIHUudHlwZSYmbnVsbCE9QVt2XS5fX2UmJkFbdl0uX19lPT11Ll9fZCYmKHUuX19kPV8odCx2KzEpKSxMKEFbdl0sQVt2XSkpO2lmKG0pZm9yKHY9MDt2PG0ubGVuZ3RoO3YrKyl6KG1bdl0sbVsrK3ZdLG1bKyt2XSl9ZnVuY3Rpb24gZyhuLGwsdSl7Zm9yKHZhciB0LGk9bi5fX2sscj0wO2kmJnI8aS5sZW5ndGg7cisrKSh0PWlbcl0pJiYodC5fXz1uLGw9XCJmdW5jdGlvblwiPT10eXBlb2YgdC50eXBlP2codCxsLHUpOncodSx0LHQsaSx0Ll9fZSxsKSk7cmV0dXJuIGx9ZnVuY3Rpb24gdyhuLGwsdSx0LGkscil7dmFyIG8sZixlO2lmKHZvaWQgMCE9PWwuX19kKW89bC5fX2QsbC5fX2Q9dm9pZCAwO2Vsc2UgaWYobnVsbD09dXx8aSE9cnx8bnVsbD09aS5wYXJlbnROb2RlKW46aWYobnVsbD09cnx8ci5wYXJlbnROb2RlIT09biluLmFwcGVuZENoaWxkKGkpLG89bnVsbDtlbHNle2ZvcihmPXIsZT0wOyhmPWYubmV4dFNpYmxpbmcpJiZlPHQubGVuZ3RoO2UrPTIpaWYoZj09aSlicmVhayBuO24uaW5zZXJ0QmVmb3JlKGksciksbz1yfXJldHVybiB2b2lkIDAhPT1vP286aS5uZXh0U2libGluZ31mdW5jdGlvbiBBKG4sbCx1LHQsaSl7dmFyIHI7Zm9yKHIgaW4gdSlcImNoaWxkcmVuXCI9PT1yfHxcImtleVwiPT09cnx8ciBpbiBsfHxDKG4scixudWxsLHVbcl0sdCk7Zm9yKHIgaW4gbClpJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBsW3JdfHxcImNoaWxkcmVuXCI9PT1yfHxcImtleVwiPT09cnx8XCJ2YWx1ZVwiPT09cnx8XCJjaGVja2VkXCI9PT1yfHx1W3JdPT09bFtyXXx8QyhuLHIsbFtyXSx1W3JdLHQpfWZ1bmN0aW9uIFAobixsLHUpe1wiLVwiPT09bFswXT9uLnNldFByb3BlcnR5KGwsdSk6bltsXT1udWxsPT11P1wiXCI6XCJudW1iZXJcIiE9dHlwZW9mIHV8fHMudGVzdChsKT91OnUrXCJweFwifWZ1bmN0aW9uIEMobixsLHUsdCxpKXt2YXIgcjtuOmlmKFwic3R5bGVcIj09PWwpaWYoXCJzdHJpbmdcIj09dHlwZW9mIHUpbi5zdHlsZS5jc3NUZXh0PXU7ZWxzZXtpZihcInN0cmluZ1wiPT10eXBlb2YgdCYmKG4uc3R5bGUuY3NzVGV4dD10PVwiXCIpLHQpZm9yKGwgaW4gdCl1JiZsIGluIHV8fFAobi5zdHlsZSxsLFwiXCIpO2lmKHUpZm9yKGwgaW4gdSl0JiZ1W2xdPT09dFtsXXx8UChuLnN0eWxlLGwsdVtsXSl9ZWxzZSBpZihcIm9cIj09PWxbMF0mJlwiblwiPT09bFsxXSlyPWwhPT0obD1sLnJlcGxhY2UoL0NhcHR1cmUkLyxcIlwiKSksbD1sLnRvTG93ZXJDYXNlKClpbiBuP2wudG9Mb3dlckNhc2UoKS5zbGljZSgyKTpsLnNsaWNlKDIpLG4ubHx8KG4ubD17fSksbi5sW2wrcl09dSx1P3R8fG4uYWRkRXZlbnRMaXN0ZW5lcihsLHI/SDokLHIpOm4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihsLHI/SDokLHIpO2Vsc2UgaWYoXCJkYW5nZXJvdXNseVNldElubmVySFRNTFwiIT09bCl7aWYoaSlsPWwucmVwbGFjZSgveGxpbmtbSDpoXS8sXCJoXCIpLnJlcGxhY2UoL3NOYW1lJC8sXCJzXCIpO2Vsc2UgaWYoXCJocmVmXCIhPT1sJiZcImxpc3RcIiE9PWwmJlwiZm9ybVwiIT09bCYmXCJ0YWJJbmRleFwiIT09bCYmXCJkb3dubG9hZFwiIT09bCYmbCBpbiBuKXRyeXtuW2xdPW51bGw9PXU/XCJcIjp1O2JyZWFrIG59Y2F0Y2gobil7fVwiZnVuY3Rpb25cIj09dHlwZW9mIHV8fChudWxsIT11JiYoITEhPT11fHxcImFcIj09PWxbMF0mJlwiclwiPT09bFsxXSk/bi5zZXRBdHRyaWJ1dGUobCx1KTpuLnJlbW92ZUF0dHJpYnV0ZShsKSl9fWZ1bmN0aW9uICQobil7dGhpcy5sW24udHlwZSshMV0obC5ldmVudD9sLmV2ZW50KG4pOm4pfWZ1bmN0aW9uIEgobil7dGhpcy5sW24udHlwZSshMF0obC5ldmVudD9sLmV2ZW50KG4pOm4pfWZ1bmN0aW9uIEkobix1LHQsaSxyLG8sZixlLGMpe3ZhciBzLHYsaCxwLF8sayx4LGIsZyx3LEEsUD11LnR5cGU7aWYodm9pZCAwIT09dS5jb25zdHJ1Y3RvcilyZXR1cm4gbnVsbDtudWxsIT10Ll9faCYmKGM9dC5fX2gsZT11Ll9fZT10Ll9fZSx1Ll9faD1udWxsLG89W2VdKSwocz1sLl9fYikmJnModSk7dHJ5e246aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgUCl7aWYoYj11LnByb3BzLGc9KHM9UC5jb250ZXh0VHlwZSkmJmlbcy5fX2NdLHc9cz9nP2cucHJvcHMudmFsdWU6cy5fXzppLHQuX19jP3g9KHY9dS5fX2M9dC5fX2MpLl9fPXYuX19FOihcInByb3RvdHlwZVwiaW4gUCYmUC5wcm90b3R5cGUucmVuZGVyP3UuX19jPXY9bmV3IFAoYix3KToodS5fX2M9dj1uZXcgZChiLHcpLHYuY29uc3RydWN0b3I9UCx2LnJlbmRlcj1NKSxnJiZnLnN1Yih2KSx2LnByb3BzPWIsdi5zdGF0ZXx8KHYuc3RhdGU9e30pLHYuY29udGV4dD13LHYuX19uPWksaD12Ll9fZD0hMCx2Ll9faD1bXSksbnVsbD09di5fX3MmJih2Ll9fcz12LnN0YXRlKSxudWxsIT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmKHYuX19zPT12LnN0YXRlJiYodi5fX3M9YSh7fSx2Ll9fcykpLGEodi5fX3MsUC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMoYix2Ll9fcykpKSxwPXYucHJvcHMsXz12LnN0YXRlLGgpbnVsbD09UC5nZXREZXJpdmVkU3RhdGVGcm9tUHJvcHMmJm51bGwhPXYuY29tcG9uZW50V2lsbE1vdW50JiZ2LmNvbXBvbmVudFdpbGxNb3VudCgpLG51bGwhPXYuY29tcG9uZW50RGlkTW91bnQmJnYuX19oLnB1c2godi5jb21wb25lbnREaWRNb3VudCk7ZWxzZXtpZihudWxsPT1QLmdldERlcml2ZWRTdGF0ZUZyb21Qcm9wcyYmYiE9PXAmJm51bGwhPXYuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyYmdi5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKGIsdyksIXYuX19lJiZudWxsIT12LnNob3VsZENvbXBvbmVudFVwZGF0ZSYmITE9PT12LnNob3VsZENvbXBvbmVudFVwZGF0ZShiLHYuX19zLHcpfHx1Ll9fdj09PXQuX192KXt2LnByb3BzPWIsdi5zdGF0ZT12Ll9fcyx1Ll9fdiE9PXQuX192JiYodi5fX2Q9ITEpLHYuX192PXUsdS5fX2U9dC5fX2UsdS5fX2s9dC5fX2ssdS5fX2suZm9yRWFjaChmdW5jdGlvbihuKXtuJiYobi5fXz11KX0pLHYuX19oLmxlbmd0aCYmZi5wdXNoKHYpO2JyZWFrIG59bnVsbCE9di5jb21wb25lbnRXaWxsVXBkYXRlJiZ2LmNvbXBvbmVudFdpbGxVcGRhdGUoYix2Ll9fcyx3KSxudWxsIT12LmNvbXBvbmVudERpZFVwZGF0ZSYmdi5fX2gucHVzaChmdW5jdGlvbigpe3YuY29tcG9uZW50RGlkVXBkYXRlKHAsXyxrKX0pfXYuY29udGV4dD13LHYucHJvcHM9Yix2LnN0YXRlPXYuX19zLChzPWwuX19yKSYmcyh1KSx2Ll9fZD0hMSx2Ll9fdj11LHYuX19QPW4scz12LnJlbmRlcih2LnByb3BzLHYuc3RhdGUsdi5jb250ZXh0KSx2LnN0YXRlPXYuX19zLG51bGwhPXYuZ2V0Q2hpbGRDb250ZXh0JiYoaT1hKGEoe30saSksdi5nZXRDaGlsZENvbnRleHQoKSkpLGh8fG51bGw9PXYuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGV8fChrPXYuZ2V0U25hcHNob3RCZWZvcmVVcGRhdGUocCxfKSksQT1udWxsIT1zJiZzLnR5cGU9PT15JiZudWxsPT1zLmtleT9zLnByb3BzLmNoaWxkcmVuOnMsbShuLEFycmF5LmlzQXJyYXkoQSk/QTpbQV0sdSx0LGkscixvLGYsZSxjKSx2LmJhc2U9dS5fX2UsdS5fX2g9bnVsbCx2Ll9faC5sZW5ndGgmJmYucHVzaCh2KSx4JiYodi5fX0U9di5fXz1udWxsKSx2Ll9fZT0hMX1lbHNlIG51bGw9PW8mJnUuX192PT09dC5fX3Y/KHUuX19rPXQuX19rLHUuX19lPXQuX19lKTp1Ll9fZT1qKHQuX19lLHUsdCxpLHIsbyxmLGMpOyhzPWwuZGlmZmVkKSYmcyh1KX1jYXRjaChuKXt1Ll9fdj1udWxsLChjfHxudWxsIT1vKSYmKHUuX19lPWUsdS5fX2g9ISFjLG9bby5pbmRleE9mKGUpXT1udWxsKSxsLl9fZShuLHUsdCl9fWZ1bmN0aW9uIFQobix1KXtsLl9fYyYmbC5fX2ModSxuKSxuLnNvbWUoZnVuY3Rpb24odSl7dHJ5e249dS5fX2gsdS5fX2g9W10sbi5zb21lKGZ1bmN0aW9uKG4pe24uY2FsbCh1KX0pfWNhdGNoKG4pe2wuX19lKG4sdS5fX3YpfX0pfWZ1bmN0aW9uIGoobCx1LHQsaSxyLG8sZixjKXt2YXIgcyxhLGgscD10LnByb3BzLHk9dS5wcm9wcyxkPXUudHlwZSxrPTA7aWYoXCJzdmdcIj09PWQmJihyPSEwKSxudWxsIT1vKWZvcig7azxvLmxlbmd0aDtrKyspaWYoKHM9b1trXSkmJihzPT09bHx8KGQ/cy5sb2NhbE5hbWU9PWQ6Mz09cy5ub2RlVHlwZSkpKXtsPXMsb1trXT1udWxsO2JyZWFrfWlmKG51bGw9PWwpe2lmKG51bGw9PT1kKXJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh5KTtsPXI/ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixkKTpkb2N1bWVudC5jcmVhdGVFbGVtZW50KGQseS5pcyYmeSksbz1udWxsLGM9ITF9aWYobnVsbD09PWQpcD09PXl8fGMmJmwuZGF0YT09PXl8fChsLmRhdGE9eSk7ZWxzZXtpZihvPW8mJm4uY2FsbChsLmNoaWxkTm9kZXMpLGE9KHA9dC5wcm9wc3x8ZSkuZGFuZ2Vyb3VzbHlTZXRJbm5lckhUTUwsaD15LmRhbmdlcm91c2x5U2V0SW5uZXJIVE1MLCFjKXtpZihudWxsIT1vKWZvcihwPXt9LGs9MDtrPGwuYXR0cmlidXRlcy5sZW5ndGg7aysrKXBbbC5hdHRyaWJ1dGVzW2tdLm5hbWVdPWwuYXR0cmlidXRlc1trXS52YWx1ZTsoaHx8YSkmJihoJiYoYSYmaC5fX2h0bWw9PWEuX19odG1sfHxoLl9faHRtbD09PWwuaW5uZXJIVE1MKXx8KGwuaW5uZXJIVE1MPWgmJmguX19odG1sfHxcIlwiKSl9aWYoQShsLHkscCxyLGMpLGgpdS5fX2s9W107ZWxzZSBpZihrPXUucHJvcHMuY2hpbGRyZW4sbShsLEFycmF5LmlzQXJyYXkoayk/azpba10sdSx0LGksciYmXCJmb3JlaWduT2JqZWN0XCIhPT1kLG8sZixvP29bMF06dC5fX2smJl8odCwwKSxjKSxudWxsIT1vKWZvcihrPW8ubGVuZ3RoO2stLTspbnVsbCE9b1trXSYmdihvW2tdKTtjfHwoXCJ2YWx1ZVwiaW4geSYmdm9pZCAwIT09KGs9eS52YWx1ZSkmJihrIT09bC52YWx1ZXx8XCJwcm9ncmVzc1wiPT09ZCYmIWspJiZDKGwsXCJ2YWx1ZVwiLGsscC52YWx1ZSwhMSksXCJjaGVja2VkXCJpbiB5JiZ2b2lkIDAhPT0oaz15LmNoZWNrZWQpJiZrIT09bC5jaGVja2VkJiZDKGwsXCJjaGVja2VkXCIsayxwLmNoZWNrZWQsITEpKX1yZXR1cm4gbH1mdW5jdGlvbiB6KG4sdSx0KXt0cnl7XCJmdW5jdGlvblwiPT10eXBlb2Ygbj9uKHUpOm4uY3VycmVudD11fWNhdGNoKG4pe2wuX19lKG4sdCl9fWZ1bmN0aW9uIEwobix1LHQpe3ZhciBpLHI7aWYobC51bm1vdW50JiZsLnVubW91bnQobiksKGk9bi5yZWYpJiYoaS5jdXJyZW50JiZpLmN1cnJlbnQhPT1uLl9fZXx8eihpLG51bGwsdSkpLG51bGwhPShpPW4uX19jKSl7aWYoaS5jb21wb25lbnRXaWxsVW5tb3VudCl0cnl7aS5jb21wb25lbnRXaWxsVW5tb3VudCgpfWNhdGNoKG4pe2wuX19lKG4sdSl9aS5iYXNlPWkuX19QPW51bGx9aWYoaT1uLl9faylmb3Iocj0wO3I8aS5sZW5ndGg7cisrKWlbcl0mJkwoaVtyXSx1LFwiZnVuY3Rpb25cIiE9dHlwZW9mIG4udHlwZSk7dHx8bnVsbD09bi5fX2V8fHYobi5fX2UpLG4uX19lPW4uX19kPXZvaWQgMH1mdW5jdGlvbiBNKG4sbCx1KXtyZXR1cm4gdGhpcy5jb25zdHJ1Y3RvcihuLHUpfWZ1bmN0aW9uIE4odSx0LGkpe3ZhciByLG8sZjtsLl9fJiZsLl9fKHUsdCksbz0ocj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBpKT9udWxsOmkmJmkuX19rfHx0Ll9fayxmPVtdLEkodCx1PSghciYmaXx8dCkuX19rPWgoeSxudWxsLFt1XSksb3x8ZSxlLHZvaWQgMCE9PXQub3duZXJTVkdFbGVtZW50LCFyJiZpP1tpXTpvP251bGw6dC5maXJzdENoaWxkP24uY2FsbCh0LmNoaWxkTm9kZXMpOm51bGwsZiwhciYmaT9pOm8/by5fX2U6dC5maXJzdENoaWxkLHIpLFQoZix1KX1uPWMuc2xpY2UsbD17X19lOmZ1bmN0aW9uKG4sbCl7Zm9yKHZhciB1LHQsaTtsPWwuX187KWlmKCh1PWwuX19jKSYmIXUuX18pdHJ5e2lmKCh0PXUuY29uc3RydWN0b3IpJiZudWxsIT10LmdldERlcml2ZWRTdGF0ZUZyb21FcnJvciYmKHUuc2V0U3RhdGUodC5nZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IobikpLGk9dS5fX2QpLG51bGwhPXUuY29tcG9uZW50RGlkQ2F0Y2gmJih1LmNvbXBvbmVudERpZENhdGNoKG4pLGk9dS5fX2QpLGkpcmV0dXJuIHUuX19FPXV9Y2F0Y2gobCl7bj1sfXRocm93IG59fSx1PTAsdD1mdW5jdGlvbihuKXtyZXR1cm4gbnVsbCE9biYmdm9pZCAwPT09bi5jb25zdHJ1Y3Rvcn0sZC5wcm90b3R5cGUuc2V0U3RhdGU9ZnVuY3Rpb24obixsKXt2YXIgdTt1PW51bGwhPXRoaXMuX19zJiZ0aGlzLl9fcyE9PXRoaXMuc3RhdGU/dGhpcy5fX3M6dGhpcy5fX3M9YSh7fSx0aGlzLnN0YXRlKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBuJiYobj1uKGEoe30sdSksdGhpcy5wcm9wcykpLG4mJmEodSxuKSxudWxsIT1uJiZ0aGlzLl9fdiYmKGwmJnRoaXMuX19oLnB1c2gobCkseCh0aGlzKSl9LGQucHJvdG90eXBlLmZvcmNlVXBkYXRlPWZ1bmN0aW9uKG4pe3RoaXMuX192JiYodGhpcy5fX2U9ITAsbiYmdGhpcy5fX2gucHVzaChuKSx4KHRoaXMpKX0sZC5wcm90b3R5cGUucmVuZGVyPXksaT1bXSxyPVwiZnVuY3Rpb25cIj09dHlwZW9mIFByb21pc2U/UHJvbWlzZS5wcm90b3R5cGUudGhlbi5iaW5kKFByb21pc2UucmVzb2x2ZSgpKTpzZXRUaW1lb3V0LGIuX19yPTAsZj0wLGV4cG9ydHMucmVuZGVyPU4sZXhwb3J0cy5oeWRyYXRlPWZ1bmN0aW9uIG4obCx1KXtOKGwsdSxuKX0sZXhwb3J0cy5jcmVhdGVFbGVtZW50PWgsZXhwb3J0cy5oPWgsZXhwb3J0cy5GcmFnbWVudD15LGV4cG9ydHMuY3JlYXRlUmVmPWZ1bmN0aW9uKCl7cmV0dXJue2N1cnJlbnQ6bnVsbH19LGV4cG9ydHMuaXNWYWxpZEVsZW1lbnQ9dCxleHBvcnRzLkNvbXBvbmVudD1kLGV4cG9ydHMuY2xvbmVFbGVtZW50PWZ1bmN0aW9uKGwsdSx0KXt2YXIgaSxyLG8sZj1hKHt9LGwucHJvcHMpO2ZvcihvIGluIHUpXCJrZXlcIj09bz9pPXVbb106XCJyZWZcIj09bz9yPXVbb106ZltvXT11W29dO3JldHVybiBhcmd1bWVudHMubGVuZ3RoPjImJihmLmNoaWxkcmVuPWFyZ3VtZW50cy5sZW5ndGg+Mz9uLmNhbGwoYXJndW1lbnRzLDIpOnQpLHAobC50eXBlLGYsaXx8bC5rZXkscnx8bC5yZWYsbnVsbCl9LGV4cG9ydHMuY3JlYXRlQ29udGV4dD1mdW5jdGlvbihuLGwpe3ZhciB1PXtfX2M6bD1cIl9fY0NcIitmKyssX186bixDb25zdW1lcjpmdW5jdGlvbihuLGwpe3JldHVybiBuLmNoaWxkcmVuKGwpfSxQcm92aWRlcjpmdW5jdGlvbihuKXt2YXIgdSx0O3JldHVybiB0aGlzLmdldENoaWxkQ29udGV4dHx8KHU9W10sKHQ9e30pW2xdPXRoaXMsdGhpcy5nZXRDaGlsZENvbnRleHQ9ZnVuY3Rpb24oKXtyZXR1cm4gdH0sdGhpcy5zaG91bGRDb21wb25lbnRVcGRhdGU9ZnVuY3Rpb24obil7dGhpcy5wcm9wcy52YWx1ZSE9PW4udmFsdWUmJnUuc29tZSh4KX0sdGhpcy5zdWI9ZnVuY3Rpb24obil7dS5wdXNoKG4pO3ZhciBsPW4uY29tcG9uZW50V2lsbFVubW91bnQ7bi5jb21wb25lbnRXaWxsVW5tb3VudD1mdW5jdGlvbigpe3Uuc3BsaWNlKHUuaW5kZXhPZihuKSwxKSxsJiZsLmNhbGwobil9fSksbi5jaGlsZHJlbn19O3JldHVybiB1LlByb3ZpZGVyLl9fPXUuQ29uc3VtZXIuY29udGV4dFR5cGU9dX0sZXhwb3J0cy50b0NoaWxkQXJyYXk9ZnVuY3Rpb24gbihsLHUpe3JldHVybiB1PXV8fFtdLG51bGw9PWx8fFwiYm9vbGVhblwiPT10eXBlb2YgbHx8KEFycmF5LmlzQXJyYXkobCk/bC5zb21lKGZ1bmN0aW9uKGwpe24obCx1KX0pOnUucHVzaChsKSksdX0sZXhwb3J0cy5vcHRpb25zPWw7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1wcmVhY3QuanMubWFwXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eVxuICAsIHVuZGVmO1xuXG4vKipcbiAqIERlY29kZSBhIFVSSSBlbmNvZGVkIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIFVSSSBlbmNvZGVkIHN0cmluZy5cbiAqIEByZXR1cm5zIHtTdHJpbmd8TnVsbH0gVGhlIGRlY29kZWQgc3RyaW5nLlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGRlY29kZShpbnB1dCkge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoaW5wdXQucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuLyoqXG4gKiBBdHRlbXB0cyB0byBlbmNvZGUgYSBnaXZlbiBpbnB1dC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyB0aGF0IG5lZWRzIHRvIGJlIGVuY29kZWQuXG4gKiBAcmV0dXJucyB7U3RyaW5nfE51bGx9IFRoZSBlbmNvZGVkIHN0cmluZy5cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBlbmNvZGUoaW5wdXQpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGlucHV0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8qKlxuICogU2ltcGxlIHF1ZXJ5IHN0cmluZyBwYXJzZXIuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHF1ZXJ5IFRoZSBxdWVyeSBzdHJpbmcgdGhhdCBuZWVkcyB0byBiZSBwYXJzZWQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gcXVlcnlzdHJpbmcocXVlcnkpIHtcbiAgdmFyIHBhcnNlciA9IC8oW149PyMmXSspPT8oW14mXSopL2dcbiAgICAsIHJlc3VsdCA9IHt9XG4gICAgLCBwYXJ0O1xuXG4gIHdoaWxlIChwYXJ0ID0gcGFyc2VyLmV4ZWMocXVlcnkpKSB7XG4gICAgdmFyIGtleSA9IGRlY29kZShwYXJ0WzFdKVxuICAgICAgLCB2YWx1ZSA9IGRlY29kZShwYXJ0WzJdKTtcblxuICAgIC8vXG4gICAgLy8gUHJldmVudCBvdmVycmlkaW5nIG9mIGV4aXN0aW5nIHByb3BlcnRpZXMuIFRoaXMgZW5zdXJlcyB0aGF0IGJ1aWxkLWluXG4gICAgLy8gbWV0aG9kcyBsaWtlIGB0b1N0cmluZ2Agb3IgX19wcm90b19fIGFyZSBub3Qgb3ZlcnJpZGVuIGJ5IG1hbGljaW91c1xuICAgIC8vIHF1ZXJ5c3RyaW5ncy5cbiAgICAvL1xuICAgIC8vIEluIHRoZSBjYXNlIGlmIGZhaWxlZCBkZWNvZGluZywgd2Ugd2FudCB0byBvbWl0IHRoZSBrZXkvdmFsdWUgcGFpcnNcbiAgICAvLyBmcm9tIHRoZSByZXN1bHQuXG4gICAgLy9cbiAgICBpZiAoa2V5ID09PSBudWxsIHx8IHZhbHVlID09PSBudWxsIHx8IGtleSBpbiByZXN1bHQpIGNvbnRpbnVlO1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybSBhIHF1ZXJ5IHN0cmluZyB0byBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiBPYmplY3QgdGhhdCBzaG91bGQgYmUgdHJhbnNmb3JtZWQuXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJlZml4IE9wdGlvbmFsIHByZWZpeC5cbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5mdW5jdGlvbiBxdWVyeXN0cmluZ2lmeShvYmosIHByZWZpeCkge1xuICBwcmVmaXggPSBwcmVmaXggfHwgJyc7XG5cbiAgdmFyIHBhaXJzID0gW11cbiAgICAsIHZhbHVlXG4gICAgLCBrZXk7XG5cbiAgLy9cbiAgLy8gT3B0aW9uYWxseSBwcmVmaXggd2l0aCBhICc/JyBpZiBuZWVkZWRcbiAgLy9cbiAgaWYgKCdzdHJpbmcnICE9PSB0eXBlb2YgcHJlZml4KSBwcmVmaXggPSAnPyc7XG5cbiAgZm9yIChrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhcy5jYWxsKG9iaiwga2V5KSkge1xuICAgICAgdmFsdWUgPSBvYmpba2V5XTtcblxuICAgICAgLy9cbiAgICAgIC8vIEVkZ2UgY2FzZXMgd2hlcmUgd2UgYWN0dWFsbHkgd2FudCB0byBlbmNvZGUgdGhlIHZhbHVlIHRvIGFuIGVtcHR5XG4gICAgICAvLyBzdHJpbmcgaW5zdGVhZCBvZiB0aGUgc3RyaW5naWZpZWQgdmFsdWUuXG4gICAgICAvL1xuICAgICAgaWYgKCF2YWx1ZSAmJiAodmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmIHx8IGlzTmFOKHZhbHVlKSkpIHtcbiAgICAgICAgdmFsdWUgPSAnJztcbiAgICAgIH1cblxuICAgICAga2V5ID0gZW5jb2RlKGtleSk7XG4gICAgICB2YWx1ZSA9IGVuY29kZSh2YWx1ZSk7XG5cbiAgICAgIC8vXG4gICAgICAvLyBJZiB3ZSBmYWlsZWQgdG8gZW5jb2RlIHRoZSBzdHJpbmdzLCB3ZSBzaG91bGQgYmFpbCBvdXQgYXMgd2UgZG9uJ3RcbiAgICAgIC8vIHdhbnQgdG8gYWRkIGludmFsaWQgc3RyaW5ncyB0byB0aGUgcXVlcnkuXG4gICAgICAvL1xuICAgICAgaWYgKGtleSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gbnVsbCkgY29udGludWU7XG4gICAgICBwYWlycy5wdXNoKGtleSArJz0nKyB2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhaXJzLmxlbmd0aCA/IHByZWZpeCArIHBhaXJzLmpvaW4oJyYnKSA6ICcnO1xufVxuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBxdWVyeXN0cmluZ2lmeTtcbmV4cG9ydHMucGFyc2UgPSBxdWVyeXN0cmluZztcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBDaGVjayBpZiB3ZSdyZSByZXF1aXJlZCB0byBhZGQgYSBwb3J0IG51bWJlci5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vdXJsLnNwZWMud2hhdHdnLm9yZy8jZGVmYXVsdC1wb3J0XG4gKiBAcGFyYW0ge051bWJlcnxTdHJpbmd9IHBvcnQgUG9ydCBudW1iZXIgd2UgbmVlZCB0byBjaGVja1xuICogQHBhcmFtIHtTdHJpbmd9IHByb3RvY29sIFByb3RvY29sIHdlIG5lZWQgdG8gY2hlY2sgYWdhaW5zdC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJcyBpdCBhIGRlZmF1bHQgcG9ydCBmb3IgdGhlIGdpdmVuIHByb3RvY29sXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiByZXF1aXJlZChwb3J0LCBwcm90b2NvbCkge1xuICBwcm90b2NvbCA9IHByb3RvY29sLnNwbGl0KCc6JylbMF07XG4gIHBvcnQgPSArcG9ydDtcblxuICBpZiAoIXBvcnQpIHJldHVybiBmYWxzZTtcblxuICBzd2l0Y2ggKHByb3RvY29sKSB7XG4gICAgY2FzZSAnaHR0cCc6XG4gICAgY2FzZSAnd3MnOlxuICAgIHJldHVybiBwb3J0ICE9PSA4MDtcblxuICAgIGNhc2UgJ2h0dHBzJzpcbiAgICBjYXNlICd3c3MnOlxuICAgIHJldHVybiBwb3J0ICE9PSA0NDM7XG5cbiAgICBjYXNlICdmdHAnOlxuICAgIHJldHVybiBwb3J0ICE9PSAyMTtcblxuICAgIGNhc2UgJ2dvcGhlcic6XG4gICAgcmV0dXJuIHBvcnQgIT09IDcwO1xuXG4gICAgY2FzZSAnZmlsZSc6XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHBvcnQgIT09IDA7XG59O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG5cbnZhciBfaXNSZWFjdE5hdGl2ZSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXNSZWFjdE5hdGl2ZVwiKSk7XG5cbnZhciBfdXJpVG9CbG9iID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi91cmlUb0Jsb2JcIikpO1xuXG52YXIgX2lzQ29yZG92YSA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vaXNDb3Jkb3ZhXCIpKTtcblxudmFyIF9yZWFkQXNCeXRlQXJyYXkgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3JlYWRBc0J5dGVBcnJheVwiKSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlQ2xhc3MoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gIGlmIChwcm90b1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICBpZiAoc3RhdGljUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gIHJldHVybiBDb25zdHJ1Y3Rvcjtcbn1cblxudmFyIEZpbGVTb3VyY2UgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICAvLyBNYWtlIHRoaXMuc2l6ZSBhIG1ldGhvZFxuICBmdW5jdGlvbiBGaWxlU291cmNlKGZpbGUpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRmlsZVNvdXJjZSk7XG5cbiAgICB0aGlzLl9maWxlID0gZmlsZTtcbiAgICB0aGlzLnNpemUgPSBmaWxlLnNpemU7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoRmlsZVNvdXJjZSwgW3tcbiAgICBrZXk6IFwic2xpY2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2xpY2Uoc3RhcnQsIGVuZCkge1xuICAgICAgLy8gSW4gQXBhY2hlIENvcmRvdmEgYXBwbGljYXRpb25zLCBhIEZpbGUgbXVzdCBiZSByZXNvbHZlZCB1c2luZ1xuICAgICAgLy8gRmlsZVJlYWRlciBpbnN0YW5jZXMsIHNlZVxuICAgICAgLy8gaHR0cHM6Ly9jb3Jkb3ZhLmFwYWNoZS5vcmcvZG9jcy9lbi84LngvcmVmZXJlbmNlL2NvcmRvdmEtcGx1Z2luLWZpbGUvaW5kZXguaHRtbCNyZWFkLWEtZmlsZVxuICAgICAgaWYgKCgwLCBfaXNDb3Jkb3ZhLmRlZmF1bHQpKCkpIHtcbiAgICAgICAgcmV0dXJuICgwLCBfcmVhZEFzQnl0ZUFycmF5LmRlZmF1bHQpKHRoaXMuX2ZpbGUuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICAgICAgfVxuXG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLl9maWxlLnNsaWNlKHN0YXJ0LCBlbmQpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2xvc2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7Ly8gTm90aGluZyB0byBkbyBoZXJlIHNpbmNlIHdlIGRvbid0IG5lZWQgdG8gcmVsZWFzZSBhbnkgcmVzb3VyY2VzLlxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBGaWxlU291cmNlO1xufSgpO1xuXG52YXIgU3RyZWFtU291cmNlID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gU3RyZWFtU291cmNlKHJlYWRlciwgY2h1bmtTaXplKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFN0cmVhbVNvdXJjZSk7XG5cbiAgICB0aGlzLl9jaHVua1NpemUgPSBjaHVua1NpemU7XG4gICAgdGhpcy5fYnVmZmVyID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2J1ZmZlck9mZnNldCA9IDA7XG4gICAgdGhpcy5fcmVhZGVyID0gcmVhZGVyO1xuICAgIHRoaXMuX2RvbmUgPSBmYWxzZTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhTdHJlYW1Tb3VyY2UsIFt7XG4gICAga2V5OiBcInNsaWNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNsaWNlKHN0YXJ0LCBlbmQpIHtcbiAgICAgIGlmIChzdGFydCA8IHRoaXMuX2J1ZmZlck9mZnNldCkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiUmVxdWVzdGVkIGRhdGEgaXMgYmVmb3JlIHRoZSByZWFkZXIncyBjdXJyZW50IG9mZnNldFwiKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLl9yZWFkVW50aWxFbm91Z2hEYXRhT3JEb25lKHN0YXJ0LCBlbmQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfcmVhZFVudGlsRW5vdWdoRGF0YU9yRG9uZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfcmVhZFVudGlsRW5vdWdoRGF0YU9yRG9uZShzdGFydCwgZW5kKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgaGFzRW5vdWdoRGF0YSA9IGVuZCA8PSB0aGlzLl9idWZmZXJPZmZzZXQgKyBsZW4odGhpcy5fYnVmZmVyKTtcblxuICAgICAgaWYgKHRoaXMuX2RvbmUgfHwgaGFzRW5vdWdoRGF0YSkge1xuICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl9nZXREYXRhRnJvbUJ1ZmZlcihzdGFydCwgZW5kKTtcblxuICAgICAgICB2YXIgZG9uZSA9IHZhbHVlID09IG51bGwgPyB0aGlzLl9kb25lIDogZmFsc2U7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICBkb25lOiBkb25lXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5fcmVhZGVyLnJlYWQoKS50aGVuKGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IF9yZWYudmFsdWUsXG4gICAgICAgICAgICBkb25lID0gX3JlZi5kb25lO1xuXG4gICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgX3RoaXMuX2RvbmUgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKF90aGlzLl9idWZmZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIF90aGlzLl9idWZmZXIgPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfdGhpcy5fYnVmZmVyID0gY29uY2F0KF90aGlzLl9idWZmZXIsIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfdGhpcy5fcmVhZFVudGlsRW5vdWdoRGF0YU9yRG9uZShzdGFydCwgZW5kKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfZ2V0RGF0YUZyb21CdWZmZXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2dldERhdGFGcm9tQnVmZmVyKHN0YXJ0LCBlbmQpIHtcbiAgICAgIC8vIFJlbW92ZSBkYXRhIGZyb20gYnVmZmVyIGJlZm9yZSBgc3RhcnRgLlxuICAgICAgLy8gRGF0YSBtaWdodCBiZSByZXJlYWQgZnJvbSB0aGUgYnVmZmVyIGlmIGFuIHVwbG9hZCBmYWlscywgc28gd2UgY2FuIG9ubHlcbiAgICAgIC8vIHNhZmVseSBkZWxldGUgZGF0YSB3aGVuIGl0IGNvbWVzICpiZWZvcmUqIHdoYXQgaXMgY3VycmVudGx5IGJlaW5nIHJlYWQuXG4gICAgICBpZiAoc3RhcnQgPiB0aGlzLl9idWZmZXJPZmZzZXQpIHtcbiAgICAgICAgdGhpcy5fYnVmZmVyID0gdGhpcy5fYnVmZmVyLnNsaWNlKHN0YXJ0IC0gdGhpcy5fYnVmZmVyT2Zmc2V0KTtcbiAgICAgICAgdGhpcy5fYnVmZmVyT2Zmc2V0ID0gc3RhcnQ7XG4gICAgICB9IC8vIElmIHRoZSBidWZmZXIgaXMgZW1wdHkgYWZ0ZXIgcmVtb3Zpbmcgb2xkIGRhdGEsIGFsbCBkYXRhIGhhcyBiZWVuIHJlYWQuXG5cblxuICAgICAgdmFyIGhhc0FsbERhdGFCZWVuUmVhZCA9IGxlbih0aGlzLl9idWZmZXIpID09PSAwO1xuXG4gICAgICBpZiAodGhpcy5fZG9uZSAmJiBoYXNBbGxEYXRhQmVlblJlYWQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IC8vIFdlIGFscmVhZHkgcmVtb3ZlZCBkYXRhIGJlZm9yZSBgc3RhcnRgLCBzbyB3ZSBqdXN0IHJldHVybiB0aGUgZmlyc3RcbiAgICAgIC8vIGNodW5rIGZyb20gdGhlIGJ1ZmZlci5cblxuXG4gICAgICByZXR1cm4gdGhpcy5fYnVmZmVyLnNsaWNlKDAsIGVuZCAtIHN0YXJ0KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiY2xvc2VcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5fcmVhZGVyLmNhbmNlbCkge1xuICAgICAgICB0aGlzLl9yZWFkZXIuY2FuY2VsKCk7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFN0cmVhbVNvdXJjZTtcbn0oKTtcblxuZnVuY3Rpb24gbGVuKGJsb2JPckFycmF5KSB7XG4gIGlmIChibG9iT3JBcnJheSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gMDtcbiAgaWYgKGJsb2JPckFycmF5LnNpemUgIT09IHVuZGVmaW5lZCkgcmV0dXJuIGJsb2JPckFycmF5LnNpemU7XG4gIHJldHVybiBibG9iT3JBcnJheS5sZW5ndGg7XG59XG4vKlxuICBUeXBlZCBhcnJheXMgYW5kIGJsb2JzIGRvbid0IGhhdmUgYSBjb25jYXQgbWV0aG9kLlxuICBUaGlzIGZ1bmN0aW9uIGhlbHBzIFN0cmVhbVNvdXJjZSBhY2N1bXVsYXRlIGRhdGEgdG8gcmVhY2ggY2h1bmtTaXplLlxuKi9cblxuXG5mdW5jdGlvbiBjb25jYXQoYSwgYikge1xuICBpZiAoYS5jb25jYXQpIHtcbiAgICAvLyBJcyBgYWAgYW4gQXJyYXk/XG4gICAgcmV0dXJuIGEuY29uY2F0KGIpO1xuICB9XG5cbiAgaWYgKGEgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgcmV0dXJuIG5ldyBCbG9iKFthLCBiXSwge1xuICAgICAgdHlwZTogYS50eXBlXG4gICAgfSk7XG4gIH1cblxuICBpZiAoYS5zZXQpIHtcbiAgICAvLyBJcyBgYWAgYSB0eXBlZCBhcnJheT9cbiAgICB2YXIgYyA9IG5ldyBhLmNvbnN0cnVjdG9yKGEubGVuZ3RoICsgYi5sZW5ndGgpO1xuICAgIGMuc2V0KGEpO1xuICAgIGMuc2V0KGIsIGEubGVuZ3RoKTtcbiAgICByZXR1cm4gYztcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignVW5rbm93biBkYXRhIHR5cGUnKTtcbn1cblxudmFyIEZpbGVSZWFkZXIgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBGaWxlUmVhZGVyKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBGaWxlUmVhZGVyKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhGaWxlUmVhZGVyLCBbe1xuICAgIGtleTogXCJvcGVuRmlsZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvcGVuRmlsZShpbnB1dCwgY2h1bmtTaXplKSB7XG4gICAgICAvLyBJbiBSZWFjdCBOYXRpdmUsIHdoZW4gdXNlciBzZWxlY3RzIGEgZmlsZSwgaW5zdGVhZCBvZiBhIEZpbGUgb3IgQmxvYixcbiAgICAgIC8vIHlvdSB1c3VhbGx5IGdldCBhIGZpbGUgb2JqZWN0IHt9IHdpdGggYSB1cmkgcHJvcGVydHkgdGhhdCBjb250YWluc1xuICAgICAgLy8gYSBsb2NhbCBwYXRoIHRvIHRoZSBmaWxlLiBXZSB1c2UgWE1MSHR0cFJlcXVlc3QgdG8gZmV0Y2hcbiAgICAgIC8vIHRoZSBmaWxlIGJsb2IsIGJlZm9yZSB1cGxvYWRpbmcgd2l0aCB0dXMuXG4gICAgICBpZiAoKDAsIF9pc1JlYWN0TmF0aXZlLmRlZmF1bHQpKCkgJiYgaW5wdXQgJiYgdHlwZW9mIGlucHV0LnVyaSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuICgwLCBfdXJpVG9CbG9iLmRlZmF1bHQpKGlucHV0LnVyaSkudGhlbihmdW5jdGlvbiAoYmxvYikge1xuICAgICAgICAgIHJldHVybiBuZXcgRmlsZVNvdXJjZShibG9iKTtcbiAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHVzOiBjYW5ub3QgZmV0Y2ggYGZpbGUudXJpYCBhcyBCbG9iLCBtYWtlIHN1cmUgdGhlIHVyaSBpcyBjb3JyZWN0IGFuZCBhY2Nlc3NpYmxlLiBcIi5jb25jYXQoZXJyKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSAvLyBTaW5jZSB3ZSBlbXVsYXRlIHRoZSBCbG9iIHR5cGUgaW4gb3VyIHRlc3RzIChub3QgYWxsIHRhcmdldCBicm93c2Vyc1xuICAgICAgLy8gc3VwcG9ydCBpdCksIHdlIGNhbm5vdCB1c2UgYGluc3RhbmNlb2ZgIGZvciB0ZXN0aW5nIHdoZXRoZXIgdGhlIGlucHV0IHZhbHVlXG4gICAgICAvLyBjYW4gYmUgaGFuZGxlZC4gSW5zdGVhZCwgd2Ugc2ltcGx5IGNoZWNrIGlzIHRoZSBzbGljZSgpIGZ1bmN0aW9uIGFuZCB0aGVcbiAgICAgIC8vIHNpemUgcHJvcGVydHkgYXJlIGF2YWlsYWJsZS5cblxuXG4gICAgICBpZiAodHlwZW9mIGlucHV0LnNsaWNlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBpbnB1dC5zaXplICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBGaWxlU291cmNlKGlucHV0KSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgaW5wdXQucmVhZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjaHVua1NpemUgPSArY2h1bmtTaXplO1xuXG4gICAgICAgIGlmICghaXNGaW5pdGUoY2h1bmtTaXplKSkge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ2Nhbm5vdCBjcmVhdGUgc291cmNlIGZvciBzdHJlYW0gd2l0aG91dCBhIGZpbml0ZSB2YWx1ZSBmb3IgdGhlIGBjaHVua1NpemVgIG9wdGlvbicpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IFN0cmVhbVNvdXJjZShpbnB1dCwgY2h1bmtTaXplKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoJ3NvdXJjZSBvYmplY3QgbWF5IG9ubHkgYmUgYW4gaW5zdGFuY2Ugb2YgRmlsZSwgQmxvYiwgb3IgUmVhZGVyIGluIHRoaXMgZW52aXJvbm1lbnQnKSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEZpbGVSZWFkZXI7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IEZpbGVSZWFkZXI7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSBmaW5nZXJwcmludDtcblxudmFyIF9pc1JlYWN0TmF0aXZlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9pc1JlYWN0TmF0aXZlXCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuLy8gVE9ETzogRGlmZmVyZW5jaWF0ZSBiZXR3ZWVuIGlucHV0IHR5cGVzXG5cbi8qKlxuICogR2VuZXJhdGUgYSBmaW5nZXJwcmludCBmb3IgYSBmaWxlIHdoaWNoIHdpbGwgYmUgdXNlZCB0aGUgc3RvcmUgdGhlIGVuZHBvaW50XG4gKlxuICogQHBhcmFtIHtGaWxlfSBmaWxlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gZmluZ2VycHJpbnQoZmlsZSwgb3B0aW9ucykge1xuICBpZiAoKDAsIF9pc1JlYWN0TmF0aXZlLmRlZmF1bHQpKCkpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlYWN0TmF0aXZlRmluZ2VycHJpbnQoZmlsZSwgb3B0aW9ucykpO1xuICB9XG5cbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbJ3R1cy1icicsIGZpbGUubmFtZSwgZmlsZS50eXBlLCBmaWxlLnNpemUsIGZpbGUubGFzdE1vZGlmaWVkLCBvcHRpb25zLmVuZHBvaW50XS5qb2luKCctJykpO1xufVxuXG5mdW5jdGlvbiByZWFjdE5hdGl2ZUZpbmdlcnByaW50KGZpbGUsIG9wdGlvbnMpIHtcbiAgdmFyIGV4aWZIYXNoID0gZmlsZS5leGlmID8gaGFzaENvZGUoSlNPTi5zdHJpbmdpZnkoZmlsZS5leGlmKSkgOiAnbm9leGlmJztcbiAgcmV0dXJuIFsndHVzLXJuJywgZmlsZS5uYW1lIHx8ICdub25hbWUnLCBmaWxlLnNpemUgfHwgJ25vc2l6ZScsIGV4aWZIYXNoLCBvcHRpb25zLmVuZHBvaW50XS5qb2luKCcvJyk7XG59XG5cbmZ1bmN0aW9uIGhhc2hDb2RlKHN0cikge1xuICAvLyBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84ODMxOTM3LzE1MTY2NlxuICB2YXIgaGFzaCA9IDA7XG5cbiAgaWYgKHN0ci5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gaGFzaDtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIF9jaGFyID0gc3RyLmNoYXJDb2RlQXQoaSk7XG5cbiAgICBoYXNoID0gKGhhc2ggPDwgNSkgLSBoYXNoICsgX2NoYXI7XG4gICAgaGFzaCAmPSBoYXNoOyAvLyBDb252ZXJ0IHRvIDMyYml0IGludGVnZXJcbiAgfVxuXG4gIHJldHVybiBoYXNoO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG4vKiBnbG9iYWwgd2luZG93ICovXG5cblxudmFyIFhIUkh0dHBTdGFjayA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFhIUkh0dHBTdGFjaygpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgWEhSSHR0cFN0YWNrKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhYSFJIdHRwU3RhY2ssIFt7XG4gICAga2V5OiBcImNyZWF0ZVJlcXVlc3RcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlUmVxdWVzdChtZXRob2QsIHVybCkge1xuICAgICAgcmV0dXJuIG5ldyBSZXF1ZXN0KG1ldGhvZCwgdXJsKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0TmFtZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXROYW1lKCkge1xuICAgICAgcmV0dXJuICdYSFJIdHRwU3RhY2snO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBYSFJIdHRwU3RhY2s7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFhIUkh0dHBTdGFjaztcblxudmFyIFJlcXVlc3QgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBSZXF1ZXN0KG1ldGhvZCwgdXJsKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlcXVlc3QpO1xuXG4gICAgdGhpcy5feGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICB0aGlzLl94aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG5cbiAgICB0aGlzLl9tZXRob2QgPSBtZXRob2Q7XG4gICAgdGhpcy5fdXJsID0gdXJsO1xuICAgIHRoaXMuX2hlYWRlcnMgPSB7fTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhSZXF1ZXN0LCBbe1xuICAgIGtleTogXCJnZXRNZXRob2RcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0TWV0aG9kKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX21ldGhvZDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0VVJMXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFVSTCgpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cmw7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInNldEhlYWRlclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZXRIZWFkZXIoaGVhZGVyLCB2YWx1ZSkge1xuICAgICAgdGhpcy5feGhyLnNldFJlcXVlc3RIZWFkZXIoaGVhZGVyLCB2YWx1ZSk7XG5cbiAgICAgIHRoaXMuX2hlYWRlcnNbaGVhZGVyXSA9IHZhbHVlO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRIZWFkZXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SGVhZGVyKGhlYWRlcikge1xuICAgICAgcmV0dXJuIHRoaXMuX2hlYWRlcnNbaGVhZGVyXTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwic2V0UHJvZ3Jlc3NIYW5kbGVyXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldFByb2dyZXNzSGFuZGxlcihwcm9ncmVzc0hhbmRsZXIpIHtcbiAgICAgIC8vIFRlc3Qgc3VwcG9ydCBmb3IgcHJvZ3Jlc3MgZXZlbnRzIGJlZm9yZSBhdHRhY2hpbmcgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgIGlmICghKCd1cGxvYWQnIGluIHRoaXMuX3hocikpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl94aHIudXBsb2FkLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoIWUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb2dyZXNzSGFuZGxlcihlLmxvYWRlZCk7XG4gICAgICB9O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzZW5kXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmQoKSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICB2YXIgYm9keSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogbnVsbDtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIF90aGlzLl94aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKF90aGlzLl94aHIpKTtcbiAgICAgICAgfTtcblxuICAgICAgICBfdGhpcy5feGhyLm9uZXJyb3IgPSBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgIH07XG5cbiAgICAgICAgX3RoaXMuX3hoci5zZW5kKGJvZHkpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImFib3J0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFib3J0KCkge1xuICAgICAgdGhpcy5feGhyLmFib3J0KCk7XG5cbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0VW5kZXJseWluZ09iamVjdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRVbmRlcmx5aW5nT2JqZWN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3hocjtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUmVxdWVzdDtcbn0oKTtcblxudmFyIFJlc3BvbnNlID0gLyojX19QVVJFX18qL2Z1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gUmVzcG9uc2UoeGhyKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFJlc3BvbnNlKTtcblxuICAgIHRoaXMuX3hociA9IHhocjtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhSZXNwb25zZSwgW3tcbiAgICBrZXk6IFwiZ2V0U3RhdHVzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldFN0YXR1cygpIHtcbiAgICAgIHJldHVybiB0aGlzLl94aHIuc3RhdHVzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRIZWFkZXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0SGVhZGVyKGhlYWRlcikge1xuICAgICAgcmV0dXJuIHRoaXMuX3hoci5nZXRSZXNwb25zZUhlYWRlcihoZWFkZXIpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJnZXRCb2R5XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGdldEJvZHkoKSB7XG4gICAgICByZXR1cm4gdGhpcy5feGhyLnJlc3BvbnNlVGV4dDtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZ2V0VW5kZXJseWluZ09iamVjdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRVbmRlcmx5aW5nT2JqZWN0KCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3hocjtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gUmVzcG9uc2U7XG59KCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJlbmFibGVEZWJ1Z0xvZ1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfbG9nZ2VyLmVuYWJsZURlYnVnTG9nO1xuICB9XG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcImNhblN0b3JlVVJMc1wiLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfdXJsU3RvcmFnZS5jYW5TdG9yZVVSTHM7XG4gIH1cbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiSHR0cFN0YWNrXCIsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIF9odHRwU3RhY2suZGVmYXVsdDtcbiAgfVxufSk7XG5leHBvcnRzLmlzU3VwcG9ydGVkID0gZXhwb3J0cy5kZWZhdWx0T3B0aW9ucyA9IGV4cG9ydHMuVXBsb2FkID0gdm9pZCAwO1xuXG52YXIgX3VwbG9hZCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4uL3VwbG9hZFwiKSk7XG5cbnZhciBfbm9vcFVybFN0b3JhZ2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuLi9ub29wVXJsU3RvcmFnZVwiKSk7XG5cbnZhciBfbG9nZ2VyID0gcmVxdWlyZShcIi4uL2xvZ2dlclwiKTtcblxudmFyIF91cmxTdG9yYWdlID0gcmVxdWlyZShcIi4vdXJsU3RvcmFnZVwiKTtcblxudmFyIF9odHRwU3RhY2sgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2h0dHBTdGFja1wiKSk7XG5cbnZhciBfZmlsZVJlYWRlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZShcIi4vZmlsZVJlYWRlclwiKSk7XG5cbnZhciBfZmluZ2VycHJpbnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL2ZpbmdlcnByaW50XCIpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgXCJAYmFiZWwvaGVscGVycyAtIHR5cGVvZlwiO1xuXG4gIGlmICh0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIikge1xuICAgIF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBfdHlwZW9mID0gZnVuY3Rpb24gX3R5cGVvZihvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gX3R5cGVvZihvYmopO1xufVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7XG59XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7XG4gIF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgIG8uX19wcm90b19fID0gcDtcbiAgICByZXR1cm4gbztcbiAgfTtcblxuICByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApO1xufVxuXG5mdW5jdGlvbiBfY3JlYXRlU3VwZXIoRGVyaXZlZCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBTdXBlciA9IF9nZXRQcm90b3R5cGVPZihEZXJpdmVkKSxcbiAgICAgICAgcmVzdWx0O1xuXG4gICAgaWYgKF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSkge1xuICAgICAgdmFyIE5ld1RhcmdldCA9IF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3RvcjtcblxuICAgICAgcmVzdWx0ID0gUmVmbGVjdC5jb25zdHJ1Y3QoU3VwZXIsIGFyZ3VtZW50cywgTmV3VGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0ID0gU3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgcmVzdWx0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4oc2VsZiwgY2FsbCkge1xuICBpZiAoY2FsbCAmJiAoX3R5cGVvZihjYWxsKSA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgIHJldHVybiBjYWxsO1xuICB9XG5cbiAgcmV0dXJuIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7XG59XG5cbmZ1bmN0aW9uIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZikge1xuICBpZiAoc2VsZiA9PT0gdm9pZCAwKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIHNlbGY7XG59XG5cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7XG4gIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTtcbiAgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTtcblxuICB0cnkge1xuICAgIERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoRGF0ZSwgW10sIGZ1bmN0aW9uICgpIHt9KSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgX2dldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LmdldFByb3RvdHlwZU9mIDogZnVuY3Rpb24gX2dldFByb3RvdHlwZU9mKG8pIHtcbiAgICByZXR1cm4gby5fX3Byb3RvX18gfHwgT2JqZWN0LmdldFByb3RvdHlwZU9mKG8pO1xuICB9O1xuICByZXR1cm4gX2dldFByb3RvdHlwZU9mKG8pO1xufVxuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpO1xuXG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7XG4gICAgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkge1xuICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7XG4gICAgfSk7XG4gICAga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpO1xuICB9XG5cbiAgcmV0dXJuIGtleXM7XG59XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307XG5cbiAgICBpZiAoaSAlIDIpIHtcbiAgICAgIG93bktleXMoT2JqZWN0KHNvdXJjZSksIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBfZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG93bktleXMoT2JqZWN0KHNvdXJjZSkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG5cbnZhciBkZWZhdWx0T3B0aW9ucyA9IF9vYmplY3RTcHJlYWQoe30sIF91cGxvYWQuZGVmYXVsdC5kZWZhdWx0T3B0aW9ucywge1xuICBodHRwU3RhY2s6IG5ldyBfaHR0cFN0YWNrLmRlZmF1bHQoKSxcbiAgZmlsZVJlYWRlcjogbmV3IF9maWxlUmVhZGVyLmRlZmF1bHQoKSxcbiAgdXJsU3RvcmFnZTogX3VybFN0b3JhZ2UuY2FuU3RvcmVVUkxzID8gbmV3IF91cmxTdG9yYWdlLldlYlN0b3JhZ2VVcmxTdG9yYWdlKCkgOiBuZXcgX25vb3BVcmxTdG9yYWdlLmRlZmF1bHQoKSxcbiAgZmluZ2VycHJpbnQ6IF9maW5nZXJwcmludC5kZWZhdWx0XG59KTtcblxuZXhwb3J0cy5kZWZhdWx0T3B0aW9ucyA9IGRlZmF1bHRPcHRpb25zO1xuXG52YXIgVXBsb2FkID0gLyojX19QVVJFX18qL2Z1bmN0aW9uIChfQmFzZVVwbG9hZCkge1xuICBfaW5oZXJpdHMoVXBsb2FkLCBfQmFzZVVwbG9hZCk7XG5cbiAgdmFyIF9zdXBlciA9IF9jcmVhdGVTdXBlcihVcGxvYWQpO1xuXG4gIGZ1bmN0aW9uIFVwbG9hZCgpIHtcbiAgICB2YXIgZmlsZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzBdIDogbnVsbDtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVXBsb2FkKTtcblxuICAgIG9wdGlvbnMgPSBfb2JqZWN0U3ByZWFkKHt9LCBkZWZhdWx0T3B0aW9ucywge30sIG9wdGlvbnMpO1xuICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBmaWxlLCBvcHRpb25zKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhVcGxvYWQsIG51bGwsIFt7XG4gICAga2V5OiBcInRlcm1pbmF0ZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0ZXJtaW5hdGUodXJsLCBvcHRpb25zLCBjYikge1xuICAgICAgb3B0aW9ucyA9IF9vYmplY3RTcHJlYWQoe30sIGRlZmF1bHRPcHRpb25zLCB7fSwgb3B0aW9ucyk7XG4gICAgICByZXR1cm4gX3VwbG9hZC5kZWZhdWx0LnRlcm1pbmF0ZSh1cmwsIG9wdGlvbnMsIGNiKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gVXBsb2FkO1xufShfdXBsb2FkLmRlZmF1bHQpO1xuXG5leHBvcnRzLlVwbG9hZCA9IFVwbG9hZDtcbnZhciBfd2luZG93ID0gd2luZG93LFxuICAgIFhNTEh0dHBSZXF1ZXN0ID0gX3dpbmRvdy5YTUxIdHRwUmVxdWVzdCxcbiAgICBCbG9iID0gX3dpbmRvdy5CbG9iO1xudmFyIGlzU3VwcG9ydGVkID0gWE1MSHR0cFJlcXVlc3QgJiYgQmxvYiAmJiB0eXBlb2YgQmxvYi5wcm90b3R5cGUuc2xpY2UgPT09ICdmdW5jdGlvbic7XG5leHBvcnRzLmlzU3VwcG9ydGVkID0gaXNTdXBwb3J0ZWQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG5cbnZhciBpc0NvcmRvdmEgPSBmdW5jdGlvbiBpc0NvcmRvdmEoKSB7XG4gIHJldHVybiB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmICh0eXBlb2Ygd2luZG93LlBob25lR2FwICE9ICd1bmRlZmluZWQnIHx8IHR5cGVvZiB3aW5kb3cuQ29yZG92YSAhPSAndW5kZWZpbmVkJyB8fCB0eXBlb2Ygd2luZG93LmNvcmRvdmEgIT0gJ3VuZGVmaW5lZCcpO1xufTtcblxudmFyIF9kZWZhdWx0ID0gaXNDb3Jkb3ZhO1xuZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG5cbnZhciBpc1JlYWN0TmF0aXZlID0gZnVuY3Rpb24gaXNSZWFjdE5hdGl2ZSgpIHtcbiAgcmV0dXJuIHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBuYXZpZ2F0b3IucHJvZHVjdCA9PT0gJ3N0cmluZycgJiYgbmF2aWdhdG9yLnByb2R1Y3QudG9Mb3dlckNhc2UoKSA9PT0gJ3JlYWN0bmF0aXZlJztcbn07XG5cbnZhciBfZGVmYXVsdCA9IGlzUmVhY3ROYXRpdmU7XG5leHBvcnRzLmRlZmF1bHQgPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHJlYWRBc0J5dGVBcnJheTtcblxuLyoqXG4gKiByZWFkQXNCeXRlQXJyYXkgY29udmVydHMgYSBGaWxlIG9iamVjdCB0byBhIFVpbnQ4QXJyYXkuXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIG9ubHkgdXNlZCBvbiB0aGUgQXBhY2hlIENvcmRvdmEgcGxhdGZvcm0uXG4gKiBTZWUgaHR0cHM6Ly9jb3Jkb3ZhLmFwYWNoZS5vcmcvZG9jcy9lbi9sYXRlc3QvcmVmZXJlbmNlL2NvcmRvdmEtcGx1Z2luLWZpbGUvaW5kZXguaHRtbCNyZWFkLWEtZmlsZVxuICovXG5mdW5jdGlvbiByZWFkQXNCeXRlQXJyYXkoY2h1bmspIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdmFsdWUgPSBuZXcgVWludDhBcnJheShyZWFkZXIucmVzdWx0KTtcbiAgICAgIHJlc29sdmUoe1xuICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH07XG5cbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoY2h1bmspO1xuICB9KTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHVyaVRvQmxvYjtcblxuLyoqXG4gKiB1cmlUb0Jsb2IgcmVzb2x2ZXMgYSBVUkkgdG8gYSBCbG9iIG9iamVjdC4gVGhpcyBpcyB1c2VkIGZvclxuICogUmVhY3QgTmF0aXZlIHRvIHJldHJpZXZlIGEgZmlsZSAoaWRlbnRpZmllZCBieSBhIGZpbGU6Ly9cbiAqIFVSSSkgYXMgYSBibG9iLlxuICovXG5mdW5jdGlvbiB1cmlUb0Jsb2IodXJpKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYic7XG5cbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGJsb2IgPSB4aHIucmVzcG9uc2U7XG4gICAgICByZXNvbHZlKGJsb2IpO1xuICAgIH07XG5cbiAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH07XG5cbiAgICB4aHIub3BlbignR0VUJywgdXJpKTtcbiAgICB4aHIuc2VuZCgpO1xuICB9KTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuV2ViU3RvcmFnZVVybFN0b3JhZ2UgPSBleHBvcnRzLmNhblN0b3JlVVJMcyA9IHZvaWQgMDtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgcmV0dXJuIENvbnN0cnVjdG9yO1xufVxuLyogZ2xvYmFsIHdpbmRvdywgbG9jYWxTdG9yYWdlICovXG5cblxudmFyIGhhc1N0b3JhZ2UgPSBmYWxzZTtcblxudHJ5IHtcbiAgaGFzU3RvcmFnZSA9ICdsb2NhbFN0b3JhZ2UnIGluIHdpbmRvdzsgLy8gQXR0ZW1wdCB0byBzdG9yZSBhbmQgcmVhZCBlbnRyaWVzIGZyb20gdGhlIGxvY2FsIHN0b3JhZ2UgdG8gZGV0ZWN0IFByaXZhdGVcbiAgLy8gTW9kZSBvbiBTYWZhcmkgb24gaU9TIChzZWUgIzQ5KVxuXG4gIHZhciBrZXkgPSAndHVzU3VwcG9ydCc7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSk7XG59IGNhdGNoIChlKSB7XG4gIC8vIElmIHdlIHRyeSB0byBhY2Nlc3MgbG9jYWxTdG9yYWdlIGluc2lkZSBhIHNhbmRib3hlZCBpZnJhbWUsIGEgU2VjdXJpdHlFcnJvclxuICAvLyBpcyB0aHJvd24uIFdoZW4gaW4gcHJpdmF0ZSBtb2RlIG9uIGlPUyBTYWZhcmksIGEgUXVvdGFFeGNlZWRlZEVycm9yIGlzXG4gIC8vIHRocm93biAoc2VlICM0OSlcbiAgaWYgKGUuY29kZSA9PT0gZS5TRUNVUklUWV9FUlIgfHwgZS5jb2RlID09PSBlLlFVT1RBX0VYQ0VFREVEX0VSUikge1xuICAgIGhhc1N0b3JhZ2UgPSBmYWxzZTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbnZhciBjYW5TdG9yZVVSTHMgPSBoYXNTdG9yYWdlO1xuZXhwb3J0cy5jYW5TdG9yZVVSTHMgPSBjYW5TdG9yZVVSTHM7XG5cbnZhciBXZWJTdG9yYWdlVXJsU3RvcmFnZSA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFdlYlN0b3JhZ2VVcmxTdG9yYWdlKCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBXZWJTdG9yYWdlVXJsU3RvcmFnZSk7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoV2ViU3RvcmFnZVVybFN0b3JhZ2UsIFt7XG4gICAga2V5OiBcImZpbmRBbGxVcGxvYWRzXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmRBbGxVcGxvYWRzKCkge1xuICAgICAgdmFyIHJlc3VsdHMgPSB0aGlzLl9maW5kRW50cmllcygndHVzOjonKTtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHRzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZmluZFVwbG9hZHNCeUZpbmdlcnByaW50XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGZpbmRVcGxvYWRzQnlGaW5nZXJwcmludChmaW5nZXJwcmludCkge1xuICAgICAgdmFyIHJlc3VsdHMgPSB0aGlzLl9maW5kRW50cmllcyhcInR1czo6XCIuY29uY2F0KGZpbmdlcnByaW50LCBcIjo6XCIpKTtcblxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXN1bHRzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicmVtb3ZlVXBsb2FkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVVwbG9hZCh1cmxTdG9yYWdlS2V5KSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSh1cmxTdG9yYWdlS2V5KTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiYWRkVXBsb2FkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFVwbG9hZChmaW5nZXJwcmludCwgdXBsb2FkKSB7XG4gICAgICB2YXIgaWQgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxZTEyKTtcbiAgICAgIHZhciBrZXkgPSBcInR1czo6XCIuY29uY2F0KGZpbmdlcnByaW50LCBcIjo6XCIpLmNvbmNhdChpZCk7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIEpTT04uc3RyaW5naWZ5KHVwbG9hZCkpO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShrZXkpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJfZmluZEVudHJpZXNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2ZpbmRFbnRyaWVzKHByZWZpeCkge1xuICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb2NhbFN0b3JhZ2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIF9rZXkgPSBsb2NhbFN0b3JhZ2Uua2V5KGkpO1xuXG4gICAgICAgIGlmIChfa2V5LmluZGV4T2YocHJlZml4KSAhPT0gMCkgY29udGludWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgdXBsb2FkID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShfa2V5KSk7XG4gICAgICAgICAgdXBsb2FkLnVybFN0b3JhZ2VLZXkgPSBfa2V5O1xuICAgICAgICAgIHJlc3VsdHMucHVzaCh1cGxvYWQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7Ly8gVGhlIEpTT04gcGFyc2UgZXJyb3IgaXMgaW50ZW50aW9uYWxseSBpZ25vcmVkIGhlcmUsIHNvIGEgbWFsZm9ybWVkXG4gICAgICAgICAgLy8gZW50cnkgaW4gdGhlIHN0b3JhZ2UgY2Fubm90IHByZXZlbnQgYW4gdXBsb2FkLlxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBXZWJTdG9yYWdlVXJsU3RvcmFnZTtcbn0oKTtcblxuZXhwb3J0cy5XZWJTdG9yYWdlVXJsU3RvcmFnZSA9IFdlYlN0b3JhZ2VVcmxTdG9yYWdlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7XG4gICAgX3R5cGVvZiA9IGZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iajtcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIF90eXBlb2YgPSBmdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykge1xuICBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09IFwiZnVuY3Rpb25cIiAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIF9zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcyk7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVTdXBlcihEZXJpdmVkKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIFN1cGVyID0gX2dldFByb3RvdHlwZU9mKERlcml2ZWQpLFxuICAgICAgICByZXN1bHQ7XG5cbiAgICBpZiAoX2lzTmF0aXZlUmVmbGVjdENvbnN0cnVjdCgpKSB7XG4gICAgICB2YXIgTmV3VGFyZ2V0ID0gX2dldFByb3RvdHlwZU9mKHRoaXMpLmNvbnN0cnVjdG9yO1xuXG4gICAgICByZXN1bHQgPSBSZWZsZWN0LmNvbnN0cnVjdChTdXBlciwgYXJndW1lbnRzLCBOZXdUYXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQgPSBTdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHJldHVybiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybih0aGlzLCByZXN1bHQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7XG4gIGlmIChjYWxsICYmIChfdHlwZW9mKGNhbGwpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpKSB7XG4gICAgcmV0dXJuIGNhbGw7XG4gIH1cblxuICByZXR1cm4gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKTtcbn1cblxuZnVuY3Rpb24gX2Fzc2VydFRoaXNJbml0aWFsaXplZChzZWxmKSB7XG4gIGlmIChzZWxmID09PSB2b2lkIDApIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gc2VsZjtcbn1cblxuZnVuY3Rpb24gX3dyYXBOYXRpdmVTdXBlcihDbGFzcykge1xuICB2YXIgX2NhY2hlID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiID8gbmV3IE1hcCgpIDogdW5kZWZpbmVkO1xuXG4gIF93cmFwTmF0aXZlU3VwZXIgPSBmdW5jdGlvbiBfd3JhcE5hdGl2ZVN1cGVyKENsYXNzKSB7XG4gICAgaWYgKENsYXNzID09PSBudWxsIHx8ICFfaXNOYXRpdmVGdW5jdGlvbihDbGFzcykpIHJldHVybiBDbGFzcztcblxuICAgIGlmICh0eXBlb2YgQ2xhc3MgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgX2NhY2hlICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICBpZiAoX2NhY2hlLmhhcyhDbGFzcykpIHJldHVybiBfY2FjaGUuZ2V0KENsYXNzKTtcblxuICAgICAgX2NhY2hlLnNldChDbGFzcywgV3JhcHBlcik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gV3JhcHBlcigpIHtcbiAgICAgIHJldHVybiBfY29uc3RydWN0KENsYXNzLCBhcmd1bWVudHMsIF9nZXRQcm90b3R5cGVPZih0aGlzKS5jb25zdHJ1Y3Rvcik7XG4gICAgfVxuXG4gICAgV3JhcHBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKENsYXNzLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IFdyYXBwZXIsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIF9zZXRQcm90b3R5cGVPZihXcmFwcGVyLCBDbGFzcyk7XG4gIH07XG5cbiAgcmV0dXJuIF93cmFwTmF0aXZlU3VwZXIoQ2xhc3MpO1xufVxuXG5mdW5jdGlvbiBfY29uc3RydWN0KFBhcmVudCwgYXJncywgQ2xhc3MpIHtcbiAgaWYgKF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSkge1xuICAgIF9jb25zdHJ1Y3QgPSBSZWZsZWN0LmNvbnN0cnVjdDtcbiAgfSBlbHNlIHtcbiAgICBfY29uc3RydWN0ID0gZnVuY3Rpb24gX2NvbnN0cnVjdChQYXJlbnQsIGFyZ3MsIENsYXNzKSB7XG4gICAgICB2YXIgYSA9IFtudWxsXTtcbiAgICAgIGEucHVzaC5hcHBseShhLCBhcmdzKTtcbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IEZ1bmN0aW9uLmJpbmQuYXBwbHkoUGFyZW50LCBhKTtcbiAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBDb25zdHJ1Y3RvcigpO1xuICAgICAgaWYgKENsYXNzKSBfc2V0UHJvdG90eXBlT2YoaW5zdGFuY2UsIENsYXNzLnByb3RvdHlwZSk7XG4gICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfY29uc3RydWN0LmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIF9pc05hdGl2ZVJlZmxlY3RDb25zdHJ1Y3QoKSB7XG4gIGlmICh0eXBlb2YgUmVmbGVjdCA9PT0gXCJ1bmRlZmluZWRcIiB8fCAhUmVmbGVjdC5jb25zdHJ1Y3QpIHJldHVybiBmYWxzZTtcbiAgaWYgKFJlZmxlY3QuY29uc3RydWN0LnNoYW0pIHJldHVybiBmYWxzZTtcbiAgaWYgKHR5cGVvZiBQcm94eSA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdHJ1ZTtcblxuICB0cnkge1xuICAgIERhdGUucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoUmVmbGVjdC5jb25zdHJ1Y3QoRGF0ZSwgW10sIGZ1bmN0aW9uICgpIHt9KSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2lzTmF0aXZlRnVuY3Rpb24oZm4pIHtcbiAgcmV0dXJuIEZ1bmN0aW9uLnRvU3RyaW5nLmNhbGwoZm4pLmluZGV4T2YoXCJbbmF0aXZlIGNvZGVdXCIpICE9PSAtMTtcbn1cblxuZnVuY3Rpb24gX3NldFByb3RvdHlwZU9mKG8sIHApIHtcbiAgX3NldFByb3RvdHlwZU9mID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8IGZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7XG4gICAgby5fX3Byb3RvX18gPSBwO1xuICAgIHJldHVybiBvO1xuICB9O1xuXG4gIHJldHVybiBfc2V0UHJvdG90eXBlT2YobywgcCk7XG59XG5cbmZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gIF9nZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5nZXRQcm90b3R5cGVPZiA6IGZ1bmN0aW9uIF9nZXRQcm90b3R5cGVPZihvKSB7XG4gICAgcmV0dXJuIG8uX19wcm90b19fIHx8IE9iamVjdC5nZXRQcm90b3R5cGVPZihvKTtcbiAgfTtcbiAgcmV0dXJuIF9nZXRQcm90b3R5cGVPZihvKTtcbn1cblxudmFyIERldGFpbGVkRXJyb3IgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKF9FcnJvcikge1xuICBfaW5oZXJpdHMoRGV0YWlsZWRFcnJvciwgX0Vycm9yKTtcblxuICB2YXIgX3N1cGVyID0gX2NyZWF0ZVN1cGVyKERldGFpbGVkRXJyb3IpO1xuXG4gIGZ1bmN0aW9uIERldGFpbGVkRXJyb3IobWVzc2FnZSkge1xuICAgIHZhciBfdGhpcztcblxuICAgIHZhciBjYXVzaW5nRXJyID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiBudWxsO1xuICAgIHZhciByZXEgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHVuZGVmaW5lZCA/IGFyZ3VtZW50c1syXSA6IG51bGw7XG4gICAgdmFyIHJlcyA9IGFyZ3VtZW50cy5sZW5ndGggPiAzICYmIGFyZ3VtZW50c1szXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzNdIDogbnVsbDtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBEZXRhaWxlZEVycm9yKTtcblxuICAgIF90aGlzID0gX3N1cGVyLmNhbGwodGhpcywgbWVzc2FnZSk7XG4gICAgX3RoaXMub3JpZ2luYWxSZXF1ZXN0ID0gcmVxO1xuICAgIF90aGlzLm9yaWdpbmFsUmVzcG9uc2UgPSByZXM7XG4gICAgX3RoaXMuY2F1c2luZ0Vycm9yID0gY2F1c2luZ0VycjtcblxuICAgIGlmIChjYXVzaW5nRXJyICE9IG51bGwpIHtcbiAgICAgIG1lc3NhZ2UgKz0gXCIsIGNhdXNlZCBieSBcIi5jb25jYXQoY2F1c2luZ0Vyci50b1N0cmluZygpKTtcbiAgICB9XG5cbiAgICBpZiAocmVxICE9IG51bGwpIHtcbiAgICAgIHZhciByZXF1ZXN0SWQgPSByZXEuZ2V0SGVhZGVyKCdYLVJlcXVlc3QtSUQnKSB8fCAnbi9hJztcbiAgICAgIHZhciBtZXRob2QgPSByZXEuZ2V0TWV0aG9kKCk7XG4gICAgICB2YXIgdXJsID0gcmVxLmdldFVSTCgpO1xuICAgICAgdmFyIHN0YXR1cyA9IHJlcyA/IHJlcy5nZXRTdGF0dXMoKSA6ICduL2EnO1xuICAgICAgdmFyIGJvZHkgPSByZXMgPyByZXMuZ2V0Qm9keSgpIHx8ICcnIDogJ24vYSc7XG4gICAgICBtZXNzYWdlICs9IFwiLCBvcmlnaW5hdGVkIGZyb20gcmVxdWVzdCAobWV0aG9kOiBcIi5jb25jYXQobWV0aG9kLCBcIiwgdXJsOiBcIikuY29uY2F0KHVybCwgXCIsIHJlc3BvbnNlIGNvZGU6IFwiKS5jb25jYXQoc3RhdHVzLCBcIiwgcmVzcG9uc2UgdGV4dDogXCIpLmNvbmNhdChib2R5LCBcIiwgcmVxdWVzdCBpZDogXCIpLmNvbmNhdChyZXF1ZXN0SWQsIFwiKVwiKTtcbiAgICB9XG5cbiAgICBfdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICByZXR1cm4gX3RoaXM7XG4gIH1cblxuICByZXR1cm4gRGV0YWlsZWRFcnJvcjtcbn0oIC8qI19fUFVSRV9fKi9fd3JhcE5hdGl2ZVN1cGVyKEVycm9yKSk7XG5cbnZhciBfZGVmYXVsdCA9IERldGFpbGVkRXJyb3I7XG5leHBvcnRzLmRlZmF1bHQgPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZW5hYmxlRGVidWdMb2cgPSBlbmFibGVEZWJ1Z0xvZztcbmV4cG9ydHMubG9nID0gbG9nO1xuXG4vKiBlc2xpbnQgbm8tY29uc29sZTogXCJvZmZcIiAqL1xudmFyIGlzRW5hYmxlZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBlbmFibGVEZWJ1Z0xvZygpIHtcbiAgaXNFbmFibGVkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gbG9nKG1zZykge1xuICBpZiAoIWlzRW5hYmxlZCkgcmV0dXJuO1xuICBjb25zb2xlLmxvZyhtc2cpO1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG4vKiBlc2xpbnQgbm8tdW51c2VkLXZhcnM6IFwib2ZmXCIgKi9cblxuXG52YXIgTm9vcFVybFN0b3JhZ2UgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBOb29wVXJsU3RvcmFnZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTm9vcFVybFN0b3JhZ2UpO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKE5vb3BVcmxTdG9yYWdlLCBbe1xuICAgIGtleTogXCJsaXN0QWxsVXBsb2Fkc1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsaXN0QWxsVXBsb2FkcygpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJmaW5kVXBsb2Fkc0J5RmluZ2VycHJpbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZmluZFVwbG9hZHNCeUZpbmdlcnByaW50KGZpbmdlcnByaW50KSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwicmVtb3ZlVXBsb2FkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZVVwbG9hZCh1cmxTdG9yYWdlS2V5KSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImFkZFVwbG9hZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRVcGxvYWQoZmluZ2VycHJpbnQsIHVwbG9hZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gTm9vcFVybFN0b3JhZ2U7XG59KCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IE5vb3BVcmxTdG9yYWdlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgX2pzQmFzZSA9IHJlcXVpcmUoXCJqcy1iYXNlNjRcIik7XG5cbnZhciBfdXJsUGFyc2UgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCJ1cmwtcGFyc2VcIikpO1xuXG52YXIgX2Vycm9yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKFwiLi9lcnJvclwiKSk7XG5cbnZhciBfbG9nZ2VyID0gcmVxdWlyZShcIi4vbG9nZ2VyXCIpO1xuXG52YXIgX3V1aWQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KHJlcXVpcmUoXCIuL3V1aWRcIikpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBvd25LZXlzKG9iamVjdCwgZW51bWVyYWJsZU9ubHkpIHtcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhvYmplY3QpO1xuXG4gIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gICAgdmFyIHN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG9iamVjdCk7XG4gICAgaWYgKGVudW1lcmFibGVPbmx5KSBzeW1ib2xzID0gc3ltYm9scy5maWx0ZXIoZnVuY3Rpb24gKHN5bSkge1xuICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBzeW0pLmVudW1lcmFibGU7XG4gICAgfSk7XG4gICAga2V5cy5wdXNoLmFwcGx5KGtleXMsIHN5bWJvbHMpO1xuICB9XG5cbiAgcmV0dXJuIGtleXM7XG59XG5cbmZ1bmN0aW9uIF9vYmplY3RTcHJlYWQodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXSAhPSBudWxsID8gYXJndW1lbnRzW2ldIDoge307XG5cbiAgICBpZiAoaSAlIDIpIHtcbiAgICAgIG93bktleXMoT2JqZWN0KHNvdXJjZSksIHRydWUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBfZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHNvdXJjZVtrZXldKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcnMoc291cmNlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG93bktleXMoT2JqZWN0KHNvdXJjZSkpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc291cmNlLCBrZXkpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIF9kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUNsYXNzKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICBpZiAocHJvdG9Qcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgaWYgKHN0YXRpY1Byb3BzKSBfZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICByZXR1cm4gQ29uc3RydWN0b3I7XG59XG4vKiBnbG9iYWwgd2luZG93ICovXG5cblxudmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICBlbmRwb2ludDogbnVsbCxcbiAgdXBsb2FkVXJsOiBudWxsLFxuICBtZXRhZGF0YToge30sXG4gIGZpbmdlcnByaW50OiBudWxsLFxuICB1cGxvYWRTaXplOiBudWxsLFxuICBvblByb2dyZXNzOiBudWxsLFxuICBvbkNodW5rQ29tcGxldGU6IG51bGwsXG4gIG9uU3VjY2VzczogbnVsbCxcbiAgb25FcnJvcjogbnVsbCxcbiAgX29uVXBsb2FkVXJsQXZhaWxhYmxlOiBudWxsLFxuICBvdmVycmlkZVBhdGNoTWV0aG9kOiBmYWxzZSxcbiAgaGVhZGVyczoge30sXG4gIGFkZFJlcXVlc3RJZDogZmFsc2UsXG4gIG9uQmVmb3JlUmVxdWVzdDogbnVsbCxcbiAgb25BZnRlclJlc3BvbnNlOiBudWxsLFxuICBvblNob3VsZFJldHJ5OiBudWxsLFxuICBjaHVua1NpemU6IEluZmluaXR5LFxuICByZXRyeURlbGF5czogWzAsIDEwMDAsIDMwMDAsIDUwMDBdLFxuICBwYXJhbGxlbFVwbG9hZHM6IDEsXG4gIHN0b3JlRmluZ2VycHJpbnRGb3JSZXN1bWluZzogdHJ1ZSxcbiAgcmVtb3ZlRmluZ2VycHJpbnRPblN1Y2Nlc3M6IGZhbHNlLFxuICB1cGxvYWRMZW5ndGhEZWZlcnJlZDogZmFsc2UsXG4gIHVwbG9hZERhdGFEdXJpbmdDcmVhdGlvbjogZmFsc2UsXG4gIHVybFN0b3JhZ2U6IG51bGwsXG4gIGZpbGVSZWFkZXI6IG51bGwsXG4gIGh0dHBTdGFjazogbnVsbFxufTtcblxudmFyIEJhc2VVcGxvYWQgPSAvKiNfX1BVUkVfXyovZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBCYXNlVXBsb2FkKGZpbGUsIG9wdGlvbnMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQmFzZVVwbG9hZCk7IC8vIFdhcm4gYWJvdXQgcmVtb3ZlZCBvcHRpb25zIGZyb20gcHJldmlvdXMgdmVyc2lvbnNcblxuXG4gICAgaWYgKCdyZXN1bWUnIGluIG9wdGlvbnMpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0dXM6IFRoZSBgcmVzdW1lYCBvcHRpb24gaGFzIGJlZW4gcmVtb3ZlZCBpbiB0dXMtanMtY2xpZW50IHYyLiBQbGVhc2UgdXNlIHRoZSBVUkwgc3RvcmFnZSBBUEkgaW5zdGVhZC4nKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfSAvLyBUaGUgZGVmYXVsdCBvcHRpb25zIHdpbGwgYWxyZWFkeSBiZSBhZGRlZCBmcm9tIHRoZSB3cmFwcGVyIGNsYXNzZXMuXG5cblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7IC8vIFRoZSBzdG9yYWdlIG1vZHVsZSB1c2VkIHRvIHN0b3JlIFVSTHNcblxuICAgIHRoaXMuX3VybFN0b3JhZ2UgPSB0aGlzLm9wdGlvbnMudXJsU3RvcmFnZTsgLy8gVGhlIHVuZGVybHlpbmcgRmlsZS9CbG9iIG9iamVjdFxuXG4gICAgdGhpcy5maWxlID0gZmlsZTsgLy8gVGhlIFVSTCBhZ2FpbnN0IHdoaWNoIHRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWRcblxuICAgIHRoaXMudXJsID0gbnVsbDsgLy8gVGhlIHVuZGVybHlpbmcgcmVxdWVzdCBvYmplY3QgZm9yIHRoZSBjdXJyZW50IFBBVENIIHJlcXVlc3RcblxuICAgIHRoaXMuX3JlcSA9IG51bGw7IC8vIFRoZSBmaW5nZXJwaW5ydCBmb3IgdGhlIGN1cnJlbnQgZmlsZSAoc2V0IGFmdGVyIHN0YXJ0KCkpXG5cbiAgICB0aGlzLl9maW5nZXJwcmludCA9IG51bGw7IC8vIFRoZSBrZXkgdGhhdCB0aGUgVVJMIHN0b3JhZ2UgcmV0dXJuZWQgd2hlbiBzYXZpbmcgYW4gVVJMIHdpdGggYSBmaW5nZXJwcmludCxcblxuICAgIHRoaXMuX3VybFN0b3JhZ2VLZXkgPSBudWxsOyAvLyBUaGUgb2Zmc2V0IHVzZWQgaW4gdGhlIGN1cnJlbnQgUEFUQ0ggcmVxdWVzdFxuXG4gICAgdGhpcy5fb2Zmc2V0ID0gbnVsbDsgLy8gVHJ1ZSBpZiB0aGUgY3VycmVudCBQQVRDSCByZXF1ZXN0IGhhcyBiZWVuIGFib3J0ZWRcblxuICAgIHRoaXMuX2Fib3J0ZWQgPSBmYWxzZTsgLy8gVGhlIGZpbGUncyBzaXplIGluIGJ5dGVzXG5cbiAgICB0aGlzLl9zaXplID0gbnVsbDsgLy8gVGhlIFNvdXJjZSBvYmplY3Qgd2hpY2ggd2lsbCB3cmFwIGFyb3VuZCB0aGUgZ2l2ZW4gZmlsZSBhbmQgcHJvdmlkZXMgdXNcbiAgICAvLyB3aXRoIGEgdW5pZmllZCBpbnRlcmZhY2UgZm9yIGdldHRpbmcgaXRzIHNpemUgYW5kIHNsaWNlIGNodW5rcyBmcm9tIGl0c1xuICAgIC8vIGNvbnRlbnQgYWxsb3dpbmcgdXMgdG8gZWFzaWx5IGhhbmRsZSBGaWxlcywgQmxvYnMsIEJ1ZmZlcnMgYW5kIFN0cmVhbXMuXG5cbiAgICB0aGlzLl9zb3VyY2UgPSBudWxsOyAvLyBUaGUgY3VycmVudCBjb3VudCBvZiBhdHRlbXB0cyB3aGljaCBoYXZlIGJlZW4gbWFkZS4gWmVybyBpbmRpY2F0ZXMgbm9uZS5cblxuICAgIHRoaXMuX3JldHJ5QXR0ZW1wdCA9IDA7IC8vIFRoZSB0aW1lb3V0J3MgSUQgd2hpY2ggaXMgdXNlZCB0byBkZWxheSB0aGUgbmV4dCByZXRyeVxuXG4gICAgdGhpcy5fcmV0cnlUaW1lb3V0ID0gbnVsbDsgLy8gVGhlIG9mZnNldCBvZiB0aGUgcmVtb3RlIHVwbG9hZCBiZWZvcmUgdGhlIGxhdGVzdCBhdHRlbXB0IHdhcyBzdGFydGVkLlxuXG4gICAgdGhpcy5fb2Zmc2V0QmVmb3JlUmV0cnkgPSAwOyAvLyBBbiBhcnJheSBvZiBCYXNlVXBsb2FkIGluc3RhbmNlcyB3aGljaCBhcmUgdXNlZCBmb3IgdXBsb2FkaW5nIHRoZSBkaWZmZXJlbnRcbiAgICAvLyBwYXJ0cywgaWYgdGhlIHBhcmFsbGVsVXBsb2FkcyBvcHRpb24gaXMgdXNlZC5cblxuICAgIHRoaXMuX3BhcmFsbGVsVXBsb2FkcyA9IG51bGw7IC8vIEFuIGFycmF5IG9mIHVwbG9hZCBVUkxzIHdoaWNoIGFyZSB1c2VkIGZvciB1cGxvYWRpbmcgdGhlIGRpZmZlcmVudFxuICAgIC8vIHBhcnRzLCBpZiB0aGUgcGFyYWxsZWxVcGxvYWRzIG9wdGlvbiBpcyB1c2VkLlxuXG4gICAgdGhpcy5fcGFyYWxsZWxVcGxvYWRVcmxzID0gbnVsbDtcbiAgfVxuICAvKipcbiAgICogVXNlIHRoZSBUZXJtaW5hdGlvbiBleHRlbnNpb24gdG8gZGVsZXRlIGFuIHVwbG9hZCBmcm9tIHRoZSBzZXJ2ZXIgYnkgc2VuZGluZyBhIERFTEVURVxuICAgKiByZXF1ZXN0IHRvIHRoZSBzcGVjaWZpZWQgdXBsb2FkIFVSTC4gVGhpcyBpcyBvbmx5IHBvc3NpYmxlIGlmIHRoZSBzZXJ2ZXIgc3VwcG9ydHMgdGhlXG4gICAqIFRlcm1pbmF0aW9uIGV4dGVuc2lvbi4gSWYgdGhlIGBvcHRpb25zLnJldHJ5RGVsYXlzYCBwcm9wZXJ0eSBpcyBzZXQsIHRoZSBtZXRob2Qgd2lsbFxuICAgKiBhbHNvIHJldHJ5IGlmIGFuIGVycm9yIG9jdXJycy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHVybCBUaGUgdXBsb2FkJ3MgVVJMIHdoaWNoIHdpbGwgYmUgdGVybWluYXRlZC5cbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgT3B0aW9uYWwgb3B0aW9ucyBmb3IgaW5mbHVlbmNpbmcgSFRUUCByZXF1ZXN0cy5cbiAgICogQHJldHVybiB7UHJvbWlzZX0gVGhlIFByb21pc2Ugd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCB3aGVuIHRoZSByZXF1ZXN0cyBmaW5pc2guXG4gICAqL1xuXG5cbiAgX2NyZWF0ZUNsYXNzKEJhc2VVcGxvYWQsIFt7XG4gICAga2V5OiBcImZpbmRQcmV2aW91c1VwbG9hZHNcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZmluZFByZXZpb3VzVXBsb2FkcygpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMuZmluZ2VycHJpbnQodGhpcy5maWxlLCB0aGlzLm9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKGZpbmdlcnByaW50KSB7XG4gICAgICAgIHJldHVybiBfdGhpcy5fdXJsU3RvcmFnZS5maW5kVXBsb2Fkc0J5RmluZ2VycHJpbnQoZmluZ2VycHJpbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInJlc3VtZUZyb21QcmV2aW91c1VwbG9hZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZXN1bWVGcm9tUHJldmlvdXNVcGxvYWQocHJldmlvdXNVcGxvYWQpIHtcbiAgICAgIHRoaXMudXJsID0gcHJldmlvdXNVcGxvYWQudXBsb2FkVXJsIHx8IG51bGw7XG4gICAgICB0aGlzLl9wYXJhbGxlbFVwbG9hZFVybHMgPSBwcmV2aW91c1VwbG9hZC5wYXJhbGxlbFVwbG9hZFVybHMgfHwgbnVsbDtcbiAgICAgIHRoaXMuX3VybFN0b3JhZ2VLZXkgPSBwcmV2aW91c1VwbG9hZC51cmxTdG9yYWdlS2V5O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJzdGFydFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzdGFydCgpIHtcbiAgICAgIHZhciBfdGhpczIgPSB0aGlzO1xuXG4gICAgICB2YXIgZmlsZSA9IHRoaXMuZmlsZTtcblxuICAgICAgaWYgKCFmaWxlKSB7XG4gICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoJ3R1czogbm8gZmlsZSBvciBzdHJlYW0gdG8gdXBsb2FkIHByb3ZpZGVkJykpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuZW5kcG9pbnQgJiYgIXRoaXMub3B0aW9ucy51cGxvYWRVcmwpIHtcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcigndHVzOiBuZWl0aGVyIGFuIGVuZHBvaW50IG9yIGFuIHVwbG9hZCBVUkwgaXMgcHJvdmlkZWQnKSk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmV0cnlEZWxheXMgPSB0aGlzLm9wdGlvbnMucmV0cnlEZWxheXM7XG5cbiAgICAgIGlmIChyZXRyeURlbGF5cyAhPSBudWxsICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChyZXRyeURlbGF5cykgIT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcigndHVzOiB0aGUgYHJldHJ5RGVsYXlzYCBvcHRpb24gbXVzdCBlaXRoZXIgYmUgYW4gYXJyYXkgb3IgbnVsbCcpKTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGFyYWxsZWxVcGxvYWRzID4gMSkge1xuICAgICAgICAvLyBUZXN0IHdoaWNoIG9wdGlvbnMgYXJlIGluY29tcGF0aWJsZSB3aXRoIHBhcmFsbGVsIHVwbG9hZHMuXG4gICAgICAgIFsndXBsb2FkVXJsJywgJ3VwbG9hZFNpemUnLCAndXBsb2FkTGVuZ3RoRGVmZXJyZWQnXS5mb3JFYWNoKGZ1bmN0aW9uIChvcHRpb25OYW1lKSB7XG4gICAgICAgICAgaWYgKF90aGlzMi5vcHRpb25zW29wdGlvbk5hbWVdKSB7XG4gICAgICAgICAgICBfdGhpczIuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IGNhbm5vdCB1c2UgdGhlIFwiLmNvbmNhdChvcHRpb25OYW1lLCBcIiBvcHRpb24gd2hlbiBwYXJhbGxlbFVwbG9hZHMgaXMgZW5hYmxlZFwiKSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMub3B0aW9ucy5maW5nZXJwcmludChmaWxlLCB0aGlzLm9wdGlvbnMpLnRoZW4oZnVuY3Rpb24gKGZpbmdlcnByaW50KSB7XG4gICAgICAgIGlmIChmaW5nZXJwcmludCA9PSBudWxsKSB7XG4gICAgICAgICAgKDAsIF9sb2dnZXIubG9nKSgnTm8gZmluZ2VycHJpbnQgd2FzIGNhbGN1bGF0ZWQgbWVhbmluZyB0aGF0IHRoZSB1cGxvYWQgY2Fubm90IGJlIHN0b3JlZCBpbiB0aGUgVVJMIHN0b3JhZ2UuJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgKDAsIF9sb2dnZXIubG9nKShcIkNhbGN1bGF0ZWQgZmluZ2VycHJpbnQ6IFwiLmNvbmNhdChmaW5nZXJwcmludCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMyLl9maW5nZXJwcmludCA9IGZpbmdlcnByaW50O1xuXG4gICAgICAgIGlmIChfdGhpczIuX3NvdXJjZSkge1xuICAgICAgICAgIHJldHVybiBfdGhpczIuX3NvdXJjZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBfdGhpczIub3B0aW9ucy5maWxlUmVhZGVyLm9wZW5GaWxlKGZpbGUsIF90aGlzMi5vcHRpb25zLmNodW5rU2l6ZSk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgICAgX3RoaXMyLl9zb3VyY2UgPSBzb3VyY2U7IC8vIElmIHRoZSB1cGxvYWQgd2FzIGNvbmZpZ3VyZWQgdG8gdXNlIG11bHRpcGxlIHJlcXVlc3RzIG9yIGlmIHdlIHJlc3VtZSBmcm9tXG4gICAgICAgIC8vIGFuIHVwbG9hZCB3aGljaCB1c2VkIG11bHRpcGxlIHJlcXVlc3RzLCB3ZSBzdGFydCBhIHBhcmFsbGVsIHVwbG9hZC5cblxuICAgICAgICBpZiAoX3RoaXMyLm9wdGlvbnMucGFyYWxsZWxVcGxvYWRzID4gMSB8fCBfdGhpczIuX3BhcmFsbGVsVXBsb2FkVXJscyAhPSBudWxsKSB7XG4gICAgICAgICAgX3RoaXMyLl9zdGFydFBhcmFsbGVsVXBsb2FkKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgX3RoaXMyLl9zdGFydFNpbmdsZVVwbG9hZCgpO1xuICAgICAgICB9XG4gICAgICB9KVtcImNhdGNoXCJdKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgX3RoaXMyLl9lbWl0RXJyb3IoZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBJbml0aWF0ZSB0aGUgdXBsb2FkaW5nIHByb2NlZHVyZSBmb3IgYSBwYXJhbGxlbGl6ZWQgdXBsb2FkLCB3aGVyZSBvbmUgZmlsZSBpcyBzcGxpdCBpbnRvXG4gICAgICogbXVsdGlwbGUgcmVxdWVzdCB3aGljaCBhcmUgcnVuIGluIHBhcmFsbGVsLlxuICAgICAqXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJfc3RhcnRQYXJhbGxlbFVwbG9hZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfc3RhcnRQYXJhbGxlbFVwbG9hZCgpIHtcbiAgICAgIHZhciBfdGhpczMgPSB0aGlzO1xuXG4gICAgICB2YXIgdG90YWxTaXplID0gdGhpcy5fc2l6ZSA9IHRoaXMuX3NvdXJjZS5zaXplO1xuICAgICAgdmFyIHRvdGFsUHJvZ3Jlc3MgPSAwO1xuICAgICAgdGhpcy5fcGFyYWxsZWxVcGxvYWRzID0gW107XG4gICAgICB2YXIgcGFydENvdW50ID0gdGhpcy5fcGFyYWxsZWxVcGxvYWRVcmxzICE9IG51bGwgPyB0aGlzLl9wYXJhbGxlbFVwbG9hZFVybHMubGVuZ3RoIDogdGhpcy5vcHRpb25zLnBhcmFsbGVsVXBsb2FkczsgLy8gVGhlIGlucHV0IGZpbGUgd2lsbCBiZSBzcGxpdCBpbnRvIG11bHRpcGxlIHNsaWNlcyB3aGljaCBhcmUgdXBsb2FkZWQgaW4gc2VwYXJhdGVcbiAgICAgIC8vIHJlcXVlc3RzLiBIZXJlIHdlIGdlbmVyYXRlIHRoZSBzdGFydCBhbmQgZW5kIHBvc2l0aW9uIGZvciB0aGUgc2xpY2VzLlxuXG4gICAgICB2YXIgcGFydHMgPSBzcGxpdFNpemVJbnRvUGFydHModGhpcy5fc291cmNlLnNpemUsIHBhcnRDb3VudCwgdGhpcy5fcGFyYWxsZWxVcGxvYWRVcmxzKTsgLy8gQ3JlYXRlIGFuIGVtcHR5IGxpc3QgZm9yIHN0b3JpbmcgdGhlIHVwbG9hZCBVUkxzXG5cbiAgICAgIHRoaXMuX3BhcmFsbGVsVXBsb2FkVXJscyA9IG5ldyBBcnJheShwYXJ0cy5sZW5ndGgpOyAvLyBHZW5lcmF0ZSBhIHByb21pc2UgZm9yIGVhY2ggc2xpY2UgdGhhdCB3aWxsIGJlIHJlc29sdmUgaWYgdGhlIHJlc3BlY3RpdmVcbiAgICAgIC8vIHVwbG9hZCBpcyBjb21wbGV0ZWQuXG5cbiAgICAgIHZhciB1cGxvYWRzID0gcGFydHMubWFwKGZ1bmN0aW9uIChwYXJ0LCBpbmRleCkge1xuICAgICAgICB2YXIgbGFzdFBhcnRQcm9ncmVzcyA9IDA7XG4gICAgICAgIHJldHVybiBfdGhpczMuX3NvdXJjZS5zbGljZShwYXJ0LnN0YXJ0LCBwYXJ0LmVuZCkudGhlbihmdW5jdGlvbiAoX3JlZikge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IF9yZWYudmFsdWU7XG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIC8vIE1lcmdlIHdpdGggdGhlIHVzZXIgc3VwcGxpZWQgb3B0aW9ucyBidXQgb3ZlcndyaXRlIHNvbWUgdmFsdWVzLlxuICAgICAgICAgICAgdmFyIG9wdGlvbnMgPSBfb2JqZWN0U3ByZWFkKHt9LCBfdGhpczMub3B0aW9ucywge1xuICAgICAgICAgICAgICAvLyBJZiBhdmFpbGFibGUsIHRoZSBwYXJ0aWFsIHVwbG9hZCBzaG91bGQgYmUgcmVzdW1lZCBmcm9tIGEgcHJldmlvdXMgVVJMLlxuICAgICAgICAgICAgICB1cGxvYWRVcmw6IHBhcnQudXBsb2FkVXJsIHx8IG51bGwsXG4gICAgICAgICAgICAgIC8vIFdlIHRha2UgbWFudWFsbHkgY2FyZSBvZiByZXN1bWluZyBmb3IgcGFydGlhbCB1cGxvYWRzLCBzbyB0aGV5IHNob3VsZFxuICAgICAgICAgICAgICAvLyBub3QgYmUgc3RvcmVkIGluIHRoZSBVUkwgc3RvcmFnZS5cbiAgICAgICAgICAgICAgc3RvcmVGaW5nZXJwcmludEZvclJlc3VtaW5nOiBmYWxzZSxcbiAgICAgICAgICAgICAgcmVtb3ZlRmluZ2VycHJpbnRPblN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICAgICAgICAvLyBSZXNldCB0aGUgcGFyYWxsZWxVcGxvYWRzIG9wdGlvbiB0byBub3QgY2F1c2UgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICBwYXJhbGxlbFVwbG9hZHM6IDEsXG4gICAgICAgICAgICAgIG1ldGFkYXRhOiB7fSxcbiAgICAgICAgICAgICAgLy8gQWRkIHRoZSBoZWFkZXIgdG8gaW5kaWNhdGUgdGhlIHRoaXMgaXMgYSBwYXJ0aWFsIHVwbG9hZC5cbiAgICAgICAgICAgICAgaGVhZGVyczogX29iamVjdFNwcmVhZCh7fSwgX3RoaXMzLm9wdGlvbnMuaGVhZGVycywge1xuICAgICAgICAgICAgICAgICdVcGxvYWQtQ29uY2F0JzogJ3BhcnRpYWwnXG4gICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAvLyBSZWplY3Qgb3IgcmVzb2x2ZSB0aGUgcHJvbWlzZSBpZiB0aGUgdXBsb2FkIGVycm9ycyBvciBjb21wbGV0ZXMuXG4gICAgICAgICAgICAgIG9uU3VjY2VzczogcmVzb2x2ZSxcbiAgICAgICAgICAgICAgb25FcnJvcjogcmVqZWN0LFxuICAgICAgICAgICAgICAvLyBCYXNlZCBpbiB0aGUgcHJvZ3Jlc3MgZm9yIHRoaXMgcGFydGlhbCB1cGxvYWQsIGNhbGN1bGF0ZSB0aGUgcHJvZ3Jlc3NcbiAgICAgICAgICAgICAgLy8gZm9yIHRoZSBlbnRpcmUgZmluYWwgdXBsb2FkLlxuICAgICAgICAgICAgICBvblByb2dyZXNzOiBmdW5jdGlvbiBvblByb2dyZXNzKG5ld1BhcnRQcm9ncmVzcykge1xuICAgICAgICAgICAgICAgIHRvdGFsUHJvZ3Jlc3MgPSB0b3RhbFByb2dyZXNzIC0gbGFzdFBhcnRQcm9ncmVzcyArIG5ld1BhcnRQcm9ncmVzcztcbiAgICAgICAgICAgICAgICBsYXN0UGFydFByb2dyZXNzID0gbmV3UGFydFByb2dyZXNzO1xuXG4gICAgICAgICAgICAgICAgX3RoaXMzLl9lbWl0UHJvZ3Jlc3ModG90YWxQcm9ncmVzcywgdG90YWxTaXplKTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgLy8gV2FpdCB1bnRpbCBldmVyeSBwYXJ0aWFsIHVwbG9hZCBoYXMgYW4gdXBsb2FkIFVSTCwgc28gd2UgY2FuIGFkZFxuICAgICAgICAgICAgICAvLyB0aGVtIHRvIHRoZSBVUkwgc3RvcmFnZS5cbiAgICAgICAgICAgICAgX29uVXBsb2FkVXJsQXZhaWxhYmxlOiBmdW5jdGlvbiBfb25VcGxvYWRVcmxBdmFpbGFibGUoKSB7XG4gICAgICAgICAgICAgICAgX3RoaXMzLl9wYXJhbGxlbFVwbG9hZFVybHNbaW5kZXhdID0gdXBsb2FkLnVybDsgLy8gVGVzdCBpZiBhbGwgdXBsb2FkcyBoYXZlIHJlY2VpdmVkIGFuIFVSTFxuXG4gICAgICAgICAgICAgICAgaWYgKF90aGlzMy5fcGFyYWxsZWxVcGxvYWRVcmxzLmZpbHRlcihmdW5jdGlvbiAodSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuICEhdTtcbiAgICAgICAgICAgICAgICB9KS5sZW5ndGggPT09IHBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgX3RoaXMzLl9zYXZlVXBsb2FkSW5VcmxTdG9yYWdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdmFyIHVwbG9hZCA9IG5ldyBCYXNlVXBsb2FkKHZhbHVlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHVwbG9hZC5zdGFydCgpOyAvLyBTdG9yZSB0aGUgdXBsb2FkIGluIGFuIGFycmF5LCBzbyB3ZSBjYW4gbGF0ZXIgYWJvcnQgdGhlbSBpZiBuZWNlc3NhcnkuXG5cbiAgICAgICAgICAgIF90aGlzMy5fcGFyYWxsZWxVcGxvYWRzLnB1c2godXBsb2FkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHZhciByZXE7IC8vIFdhaXQgdW50aWwgYWxsIHBhcnRpYWwgdXBsb2FkcyBhcmUgZmluaXNoZWQgYW5kIHdlIGNhbiBzZW5kIHRoZSBQT1NUIHJlcXVlc3QgZm9yXG4gICAgICAvLyBjcmVhdGluZyB0aGUgZmluYWwgdXBsb2FkLlxuXG4gICAgICBQcm9taXNlLmFsbCh1cGxvYWRzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmVxID0gX3RoaXMzLl9vcGVuUmVxdWVzdCgnUE9TVCcsIF90aGlzMy5vcHRpb25zLmVuZHBvaW50KTtcbiAgICAgICAgcmVxLnNldEhlYWRlcignVXBsb2FkLUNvbmNhdCcsIFwiZmluYWw7XCIuY29uY2F0KF90aGlzMy5fcGFyYWxsZWxVcGxvYWRVcmxzLmpvaW4oJyAnKSkpOyAvLyBBZGQgbWV0YWRhdGEgaWYgdmFsdWVzIGhhdmUgYmVlbiBhZGRlZFxuXG4gICAgICAgIHZhciBtZXRhZGF0YSA9IGVuY29kZU1ldGFkYXRhKF90aGlzMy5vcHRpb25zLm1ldGFkYXRhKTtcblxuICAgICAgICBpZiAobWV0YWRhdGEgIT09ICcnKSB7XG4gICAgICAgICAgcmVxLnNldEhlYWRlcignVXBsb2FkLU1ldGFkYXRhJywgbWV0YWRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIF90aGlzMy5fc2VuZFJlcXVlc3QocmVxLCBudWxsKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBpZiAoIWluU3RhdHVzQ2F0ZWdvcnkocmVzLmdldFN0YXR1cygpLCAyMDApKSB7XG4gICAgICAgICAgX3RoaXMzLl9lbWl0SHR0cEVycm9yKHJlcSwgcmVzLCAndHVzOiB1bmV4cGVjdGVkIHJlc3BvbnNlIHdoaWxlIGNyZWF0aW5nIHVwbG9hZCcpO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvY2F0aW9uID0gcmVzLmdldEhlYWRlcignTG9jYXRpb24nKTtcblxuICAgICAgICBpZiAobG9jYXRpb24gPT0gbnVsbCkge1xuICAgICAgICAgIF90aGlzMy5fZW1pdEh0dHBFcnJvcihyZXEsIHJlcywgJ3R1czogaW52YWxpZCBvciBtaXNzaW5nIExvY2F0aW9uIGhlYWRlcicpO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXMzLnVybCA9IHJlc29sdmVVcmwoX3RoaXMzLm9wdGlvbnMuZW5kcG9pbnQsIGxvY2F0aW9uKTtcbiAgICAgICAgKDAsIF9sb2dnZXIubG9nKShcIkNyZWF0ZWQgdXBsb2FkIGF0IFwiLmNvbmNhdChfdGhpczMudXJsKSk7XG5cbiAgICAgICAgX3RoaXMzLl9lbWl0U3VjY2VzcygpO1xuICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIF90aGlzMy5fZW1pdEVycm9yKGVycik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogSW5pdGlhdGUgdGhlIHVwbG9hZGluZyBwcm9jZWR1cmUgZm9yIGEgbm9uLXBhcmFsbGVsIHVwbG9hZC4gSGVyZSB0aGUgZW50aXJlIGZpbGUgaXNcbiAgICAgKiB1cGxvYWRlZCBpbiBhIHNlcXVlbnRpYWwgbWF0dGVyLlxuICAgICAqXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJfc3RhcnRTaW5nbGVVcGxvYWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX3N0YXJ0U2luZ2xlVXBsb2FkKCkge1xuICAgICAgLy8gRmlyc3QsIHdlIGxvb2sgYXQgdGhlIHVwbG9hZExlbmd0aERlZmVycmVkIG9wdGlvbi5cbiAgICAgIC8vIE5leHQsIHdlIGNoZWNrIGlmIHRoZSBjYWxsZXIgaGFzIHN1cHBsaWVkIGEgbWFudWFsIHVwbG9hZCBzaXplLlxuICAgICAgLy8gRmluYWxseSwgd2UgdHJ5IHRvIHVzZSB0aGUgY2FsY3VsYXRlZCBzaXplIGZyb20gdGhlIHNvdXJjZSBvYmplY3QuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZExlbmd0aERlZmVycmVkKSB7XG4gICAgICAgIHRoaXMuX3NpemUgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3NpemUgPSArdGhpcy5vcHRpb25zLnVwbG9hZFNpemU7XG5cbiAgICAgICAgaWYgKGlzTmFOKHRoaXMuX3NpemUpKSB7XG4gICAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcigndHVzOiBjYW5ub3QgY29udmVydCBgdXBsb2FkU2l6ZWAgb3B0aW9uIGludG8gYSBudW1iZXInKSk7XG5cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NpemUgPSB0aGlzLl9zb3VyY2Uuc2l6ZTtcblxuICAgICAgICBpZiAodGhpcy5fc2l6ZSA9PSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogY2Fubm90IGF1dG9tYXRpY2FsbHkgZGVyaXZlIHVwbG9hZCdzIHNpemUgZnJvbSBpbnB1dCBhbmQgbXVzdCBiZSBzcGVjaWZpZWQgbWFudWFsbHkgdXNpbmcgdGhlIGB1cGxvYWRTaXplYCBvcHRpb25cIikpO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IC8vIFJlc2V0IHRoZSBhYm9ydGVkIGZsYWcgd2hlbiB0aGUgdXBsb2FkIGlzIHN0YXJ0ZWQgb3IgZWxzZSB0aGVcbiAgICAgIC8vIF9wZXJmb3JtVXBsb2FkIHdpbGwgc3RvcCBiZWZvcmUgc2VuZGluZyBhIHJlcXVlc3QgaWYgdGhlIHVwbG9hZCBoYXMgYmVlblxuICAgICAgLy8gYWJvcnRlZCBwcmV2aW91c2x5LlxuXG5cbiAgICAgIHRoaXMuX2Fib3J0ZWQgPSBmYWxzZTsgLy8gVGhlIHVwbG9hZCBoYWQgYmVlbiBzdGFydGVkIHByZXZpb3VzbHkgYW5kIHdlIHNob3VsZCByZXVzZSB0aGlzIFVSTC5cblxuICAgICAgaWYgKHRoaXMudXJsICE9IG51bGwpIHtcbiAgICAgICAgKDAsIF9sb2dnZXIubG9nKShcIlJlc3VtaW5nIHVwbG9hZCBmcm9tIHByZXZpb3VzIFVSTDogXCIuY29uY2F0KHRoaXMudXJsKSk7XG5cbiAgICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSAvLyBBIFVSTCBoYXMgbWFudWFsbHkgYmVlbiBzcGVjaWZpZWQsIHNvIHdlIHRyeSB0byByZXN1bWVcblxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZFVybCAhPSBudWxsKSB7XG4gICAgICAgICgwLCBfbG9nZ2VyLmxvZykoXCJSZXN1bWluZyB1cGxvYWQgZnJvbSBwcm92aWRlZCBVUkw6IFwiLmNvbmNhdCh0aGlzLm9wdGlvbnMudXJsKSk7XG4gICAgICAgIHRoaXMudXJsID0gdGhpcy5vcHRpb25zLnVwbG9hZFVybDtcblxuICAgICAgICB0aGlzLl9yZXN1bWVVcGxvYWQoKTtcblxuICAgICAgICByZXR1cm47XG4gICAgICB9IC8vIEFuIHVwbG9hZCBoYXMgbm90IHN0YXJ0ZWQgZm9yIHRoZSBmaWxlIHlldCwgc28gd2Ugc3RhcnQgYSBuZXcgb25lXG5cblxuICAgICAgKDAsIF9sb2dnZXIubG9nKSgnQ3JlYXRpbmcgYSBuZXcgdXBsb2FkJyk7XG5cbiAgICAgIHRoaXMuX2NyZWF0ZVVwbG9hZCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBBYm9ydCBhbnkgcnVubmluZyByZXF1ZXN0IGFuZCBzdG9wIHRoZSBjdXJyZW50IHVwbG9hZC4gQWZ0ZXIgYWJvcnQgaXMgY2FsbGVkLCBubyBldmVudFxuICAgICAqIGhhbmRsZXIgd2lsbCBiZSBpbnZva2VkIGFueW1vcmUuIFlvdSBjYW4gdXNlIHRoZSBgc3RhcnRgIG1ldGhvZCB0byByZXN1bWUgdGhlIHVwbG9hZFxuICAgICAqIGFnYWluLlxuICAgICAqIElmIGBzaG91bGRUZXJtaW5hdGVgIGlzIHRydWUsIHRoZSBgdGVybWluYXRlYCBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCB0byByZW1vdmUgdGhlXG4gICAgICogY3VycmVudCB1cGxvYWQgZnJvbSB0aGUgc2VydmVyLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtib29sZWFufSBzaG91bGRUZXJtaW5hdGUgVHJ1ZSBpZiB0aGUgdXBsb2FkIHNob3VsZCBiZSBkZWxldGVkIGZyb20gdGhlIHNlcnZlci5cbiAgICAgKiBAcmV0dXJuIHtQcm9taXNlfSBUaGUgUHJvbWlzZSB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIHdoZW4gdGhlIHJlcXVlc3RzIGZpbmlzaC5cbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImFib3J0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFib3J0KHNob3VsZFRlcm1pbmF0ZSkge1xuICAgICAgdmFyIF90aGlzNCA9IHRoaXM7IC8vIENvdW50IHRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHNlZSBpZiBhIGNhbGxiYWNrIGlzIGJlaW5nIHByb3ZpZGVkIGluIHRoZSBvbGQgc3R5bGUgcmVxdWlyZWQgYnkgdHVzLWpzLWNsaWVudCAxLngsIHRoZW4gdGhyb3cgYW4gZXJyb3IgaWYgaXQgaXMuXG4gICAgICAvLyBgYXJndW1lbnRzYCBpcyBhIEphdmFTY3JpcHQgYnVpbHQtaW4gdmFyaWFibGUgdGhhdCBjb250YWlucyBhbGwgb2YgdGhlIGZ1bmN0aW9uJ3MgYXJndW1lbnRzLlxuXG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzWzFdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndHVzOiB0aGUgYWJvcnQgZnVuY3Rpb24gZG9lcyBub3QgYWNjZXB0IGEgY2FsbGJhY2sgc2luY2UgdjIgYW55bW9yZTsgcGxlYXNlIHVzZSB0aGUgcmV0dXJuZWQgUHJvbWlzZSBpbnN0ZWFkJyk7XG4gICAgICB9IC8vIFN0b3AgYW55IHBhcmFsbGVsIHBhcnRpYWwgdXBsb2FkcywgdGhhdCBoYXZlIGJlZW4gc3RhcnRlZCBpbiBfc3RhcnRQYXJhbGxlbFVwbG9hZHMuXG5cblxuICAgICAgaWYgKHRoaXMuX3BhcmFsbGVsVXBsb2FkcyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3BhcmFsbGVsVXBsb2Fkcy5mb3JFYWNoKGZ1bmN0aW9uICh1cGxvYWQpIHtcbiAgICAgICAgICB1cGxvYWQuYWJvcnQoc2hvdWxkVGVybWluYXRlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IC8vIFN0b3AgYW55IGN1cnJlbnQgcnVubmluZyByZXF1ZXN0LlxuXG5cbiAgICAgIGlmICh0aGlzLl9yZXEgIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fcmVxLmFib3J0KCk7XG5cbiAgICAgICAgdGhpcy5fc291cmNlLmNsb3NlKCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2Fib3J0ZWQgPSB0cnVlOyAvLyBTdG9wIGFueSB0aW1lb3V0IHVzZWQgZm9yIGluaXRpYXRpbmcgYSByZXRyeS5cblxuICAgICAgaWYgKHRoaXMuX3JldHJ5VGltZW91dCAhPSBudWxsKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9yZXRyeVRpbWVvdXQpO1xuICAgICAgICB0aGlzLl9yZXRyeVRpbWVvdXQgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXNob3VsZFRlcm1pbmF0ZSB8fCB0aGlzLnVybCA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIEJhc2VVcGxvYWQudGVybWluYXRlKHRoaXMudXJsLCB0aGlzLm9wdGlvbnMpIC8vIFJlbW92ZSBlbnRyeSBmcm9tIHRoZSBVUkwgc3RvcmFnZSBzaW5jZSB0aGUgdXBsb2FkIFVSTCBpcyBubyBsb25nZXIgdmFsaWQuXG4gICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfdGhpczQuX3JlbW92ZUZyb21VcmxTdG9yYWdlKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2VtaXRIdHRwRXJyb3JcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2VtaXRIdHRwRXJyb3IocmVxLCByZXMsIG1lc3NhZ2UsIGNhdXNpbmdFcnIpIHtcbiAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgX2Vycm9yLmRlZmF1bHQobWVzc2FnZSwgY2F1c2luZ0VyciwgcmVxLCByZXMpKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiX2VtaXRFcnJvclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfZW1pdEVycm9yKGVycikge1xuICAgICAgdmFyIF90aGlzNSA9IHRoaXM7IC8vIERvIG5vdCBlbWl0IGVycm9ycywgZS5nLiBmcm9tIGFib3J0ZWQgSFRUUCByZXF1ZXN0cywgaWYgdGhlIHVwbG9hZCBoYXMgYmVlbiBzdG9wcGVkLlxuXG5cbiAgICAgIGlmICh0aGlzLl9hYm9ydGVkKSByZXR1cm47IC8vIENoZWNrIGlmIHdlIHNob3VsZCByZXRyeSwgd2hlbiBlbmFibGVkLCBiZWZvcmUgc2VuZGluZyB0aGUgZXJyb3IgdG8gdGhlIHVzZXIuXG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucmV0cnlEZWxheXMgIT0gbnVsbCkge1xuICAgICAgICAvLyBXZSB3aWxsIHJlc2V0IHRoZSBhdHRlbXB0IGNvdW50ZXIgaWZcbiAgICAgICAgLy8gLSB3ZSB3ZXJlIGFscmVhZHkgYWJsZSB0byBjb25uZWN0IHRvIHRoZSBzZXJ2ZXIgKG9mZnNldCAhPSBudWxsKSBhbmRcbiAgICAgICAgLy8gLSB3ZSB3ZXJlIGFibGUgdG8gdXBsb2FkIGEgc21hbGwgY2h1bmsgb2YgZGF0YSB0byB0aGUgc2VydmVyXG4gICAgICAgIHZhciBzaG91bGRSZXNldERlbGF5cyA9IHRoaXMuX29mZnNldCAhPSBudWxsICYmIHRoaXMuX29mZnNldCA+IHRoaXMuX29mZnNldEJlZm9yZVJldHJ5O1xuXG4gICAgICAgIGlmIChzaG91bGRSZXNldERlbGF5cykge1xuICAgICAgICAgIHRoaXMuX3JldHJ5QXR0ZW1wdCA9IDA7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2hvdWxkUmV0cnkoZXJyLCB0aGlzLl9yZXRyeUF0dGVtcHQsIHRoaXMub3B0aW9ucykpIHtcbiAgICAgICAgICB2YXIgZGVsYXkgPSB0aGlzLm9wdGlvbnMucmV0cnlEZWxheXNbdGhpcy5fcmV0cnlBdHRlbXB0KytdO1xuICAgICAgICAgIHRoaXMuX29mZnNldEJlZm9yZVJldHJ5ID0gdGhpcy5fb2Zmc2V0O1xuICAgICAgICAgIHRoaXMuX3JldHJ5VGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgX3RoaXM1LnN0YXJ0KCk7XG4gICAgICAgICAgfSwgZGVsYXkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkVycm9yKGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFB1Ymxpc2hlcyBub3RpZmljYXRpb24gaWYgdGhlIHVwbG9hZCBoYXMgYmVlbiBzdWNjZXNzZnVsbHkgY29tcGxldGVkLlxuICAgICAqXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJfZW1pdFN1Y2Nlc3NcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2VtaXRTdWNjZXNzKCkge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZW1vdmVGaW5nZXJwcmludE9uU3VjY2Vzcykge1xuICAgICAgICAvLyBSZW1vdmUgc3RvcmVkIGZpbmdlcnByaW50IGFuZCBjb3JyZXNwb25kaW5nIGVuZHBvaW50LiBUaGlzIGNhdXNlc1xuICAgICAgICAvLyBuZXcgdXBsb2FkcyBvZiB0aGUgc2FtZSBmaWxlIHRvIGJlIHRyZWF0ZWQgYXMgYSBkaWZmZXJlbnQgZmlsZS5cbiAgICAgICAgdGhpcy5fcmVtb3ZlRnJvbVVybFN0b3JhZ2UoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25TdWNjZXNzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vblN1Y2Nlc3MoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIG5vdGlmaWNhdGlvbiB3aGVuIGRhdGEgaGFzIGJlZW4gc2VudCB0byB0aGUgc2VydmVyLiBUaGlzXG4gICAgICogZGF0YSBtYXkgbm90IGhhdmUgYmVlbiBhY2NlcHRlZCBieSB0aGUgc2VydmVyIHlldC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBieXRlc1NlbnQgIE51bWJlciBvZiBieXRlcyBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGJ5dGVzVG90YWwgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9lbWl0UHJvZ3Jlc3NcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2VtaXRQcm9ncmVzcyhieXRlc1NlbnQsIGJ5dGVzVG90YWwpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uUHJvZ3Jlc3MgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uUHJvZ3Jlc3MoYnl0ZXNTZW50LCBieXRlc1RvdGFsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogUHVibGlzaGVzIG5vdGlmaWNhdGlvbiB3aGVuIGEgY2h1bmsgb2YgZGF0YSBoYXMgYmVlbiBzZW50IHRvIHRoZSBzZXJ2ZXJcbiAgICAgKiBhbmQgYWNjZXB0ZWQgYnkgdGhlIHNlcnZlci5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gY2h1bmtTaXplICBTaXplIG9mIHRoZSBjaHVuayB0aGF0IHdhcyBhY2NlcHRlZCBieSB0aGUgc2VydmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBieXRlc0FjY2VwdGVkIFRvdGFsIG51bWJlciBvZiBieXRlcyB0aGF0IGhhdmUgYmVlblxuICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHRlZCBieSB0aGUgc2VydmVyLlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBieXRlc1RvdGFsIFRvdGFsIG51bWJlciBvZiBieXRlcyB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJfZW1pdENodW5rQ29tcGxldGVcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2VtaXRDaHVua0NvbXBsZXRlKGNodW5rU2l6ZSwgYnl0ZXNBY2NlcHRlZCwgYnl0ZXNUb3RhbCkge1xuICAgICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DaHVua0NvbXBsZXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5vbkNodW5rQ29tcGxldGUoY2h1bmtTaXplLCBieXRlc0FjY2VwdGVkLCBieXRlc1RvdGFsKTtcbiAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGEgbmV3IHVwbG9hZCB1c2luZyB0aGUgY3JlYXRpb24gZXh0ZW5zaW9uIGJ5IHNlbmRpbmcgYSBQT1NUXG4gICAgICogcmVxdWVzdCB0byB0aGUgZW5kcG9pbnQuIEFmdGVyIHN1Y2Nlc3NmdWwgY3JlYXRpb24gdGhlIGZpbGUgd2lsbCBiZVxuICAgICAqIHVwbG9hZGVkXG4gICAgICpcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9jcmVhdGVVcGxvYWRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gX2NyZWF0ZVVwbG9hZCgpIHtcbiAgICAgIHZhciBfdGhpczYgPSB0aGlzO1xuXG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmRwb2ludCkge1xuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKCd0dXM6IHVuYWJsZSB0byBjcmVhdGUgdXBsb2FkIGJlY2F1c2Ugbm8gZW5kcG9pbnQgaXMgcHJvdmlkZWQnKSk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxID0gdGhpcy5fb3BlblJlcXVlc3QoJ1BPU1QnLCB0aGlzLm9wdGlvbnMuZW5kcG9pbnQpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwbG9hZExlbmd0aERlZmVycmVkKSB7XG4gICAgICAgIHJlcS5zZXRIZWFkZXIoJ1VwbG9hZC1EZWZlci1MZW5ndGgnLCAxKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcS5zZXRIZWFkZXIoJ1VwbG9hZC1MZW5ndGgnLCB0aGlzLl9zaXplKTtcbiAgICAgIH0gLy8gQWRkIG1ldGFkYXRhIGlmIHZhbHVlcyBoYXZlIGJlZW4gYWRkZWRcblxuXG4gICAgICB2YXIgbWV0YWRhdGEgPSBlbmNvZGVNZXRhZGF0YSh0aGlzLm9wdGlvbnMubWV0YWRhdGEpO1xuXG4gICAgICBpZiAobWV0YWRhdGEgIT09ICcnKSB7XG4gICAgICAgIHJlcS5zZXRIZWFkZXIoJ1VwbG9hZC1NZXRhZGF0YScsIG1ldGFkYXRhKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHByb21pc2U7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkRGF0YUR1cmluZ0NyZWF0aW9uICYmICF0aGlzLm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcbiAgICAgICAgdGhpcy5fb2Zmc2V0ID0gMDtcbiAgICAgICAgcHJvbWlzZSA9IHRoaXMuX2FkZENodW5rVG9SZXF1ZXN0KHJlcSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwcm9taXNlID0gdGhpcy5fc2VuZFJlcXVlc3QocmVxLCBudWxsKTtcbiAgICAgIH1cblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHJlcy5nZXRTdGF0dXMoKSwgMjAwKSkge1xuICAgICAgICAgIF90aGlzNi5fZW1pdEh0dHBFcnJvcihyZXEsIHJlcywgJ3R1czogdW5leHBlY3RlZCByZXNwb25zZSB3aGlsZSBjcmVhdGluZyB1cGxvYWQnKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2NhdGlvbiA9IHJlcy5nZXRIZWFkZXIoJ0xvY2F0aW9uJyk7XG5cbiAgICAgICAgaWYgKGxvY2F0aW9uID09IG51bGwpIHtcbiAgICAgICAgICBfdGhpczYuX2VtaXRIdHRwRXJyb3IocmVxLCByZXMsICd0dXM6IGludmFsaWQgb3IgbWlzc2luZyBMb2NhdGlvbiBoZWFkZXInKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzNi51cmwgPSByZXNvbHZlVXJsKF90aGlzNi5vcHRpb25zLmVuZHBvaW50LCBsb2NhdGlvbik7XG4gICAgICAgICgwLCBfbG9nZ2VyLmxvZykoXCJDcmVhdGVkIHVwbG9hZCBhdCBcIi5jb25jYXQoX3RoaXM2LnVybCkpO1xuXG4gICAgICAgIGlmICh0eXBlb2YgX3RoaXM2Lm9wdGlvbnMuX29uVXBsb2FkVXJsQXZhaWxhYmxlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgX3RoaXM2Lm9wdGlvbnMuX29uVXBsb2FkVXJsQXZhaWxhYmxlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoX3RoaXM2Ll9zaXplID09PSAwKSB7XG4gICAgICAgICAgLy8gTm90aGluZyB0byB1cGxvYWQgYW5kIGZpbGUgd2FzIHN1Y2Nlc3NmdWxseSBjcmVhdGVkXG4gICAgICAgICAgX3RoaXM2Ll9lbWl0U3VjY2VzcygpO1xuXG4gICAgICAgICAgX3RoaXM2Ll9zb3VyY2UuY2xvc2UoKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzNi5fc2F2ZVVwbG9hZEluVXJsU3RvcmFnZSgpO1xuXG4gICAgICAgIGlmIChfdGhpczYub3B0aW9ucy51cGxvYWREYXRhRHVyaW5nQ3JlYXRpb24pIHtcbiAgICAgICAgICBfdGhpczYuX2hhbmRsZVVwbG9hZFJlc3BvbnNlKHJlcSwgcmVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBfdGhpczYuX29mZnNldCA9IDA7XG5cbiAgICAgICAgICBfdGhpczYuX3BlcmZvcm1VcGxvYWQoKTtcbiAgICAgICAgfVxuICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIF90aGlzNi5fZW1pdEh0dHBFcnJvcihyZXEsIG51bGwsICd0dXM6IGZhaWxlZCB0byBjcmVhdGUgdXBsb2FkJywgZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKlxuICAgICAqIFRyeSB0byByZXN1bWUgYW4gZXhpc3RpbmcgdXBsb2FkLiBGaXJzdCBhIEhFQUQgcmVxdWVzdCB3aWxsIGJlIHNlbnRcbiAgICAgKiB0byByZXRyaWV2ZSB0aGUgb2Zmc2V0LiBJZiB0aGUgcmVxdWVzdCBmYWlscyBhIG5ldyB1cGxvYWQgd2lsbCBiZVxuICAgICAqIGNyZWF0ZWQuIEluIHRoZSBjYXNlIG9mIGEgc3VjY2Vzc2Z1bCByZXNwb25zZSB0aGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkLlxuICAgICAqXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJfcmVzdW1lVXBsb2FkXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9yZXN1bWVVcGxvYWQoKSB7XG4gICAgICB2YXIgX3RoaXM3ID0gdGhpcztcblxuICAgICAgdmFyIHJlcSA9IHRoaXMuX29wZW5SZXF1ZXN0KCdIRUFEJywgdGhpcy51cmwpO1xuXG4gICAgICB2YXIgcHJvbWlzZSA9IHRoaXMuX3NlbmRSZXF1ZXN0KHJlcSwgbnVsbCk7XG5cbiAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSByZXMuZ2V0U3RhdHVzKCk7XG5cbiAgICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHN0YXR1cywgMjAwKSkge1xuICAgICAgICAgIGlmIChpblN0YXR1c0NhdGVnb3J5KHN0YXR1cywgNDAwKSkge1xuICAgICAgICAgICAgLy8gUmVtb3ZlIHN0b3JlZCBmaW5nZXJwcmludCBhbmQgY29ycmVzcG9uZGluZyBlbmRwb2ludCxcbiAgICAgICAgICAgIC8vIG9uIGNsaWVudCBlcnJvcnMgc2luY2UgdGhlIGZpbGUgY2FuIG5vdCBiZSBmb3VuZFxuICAgICAgICAgICAgX3RoaXM3Ll9yZW1vdmVGcm9tVXJsU3RvcmFnZSgpO1xuICAgICAgICAgIH0gLy8gSWYgdGhlIHVwbG9hZCBpcyBsb2NrZWQgKGluZGljYXRlZCBieSB0aGUgNDIzIExvY2tlZCBzdGF0dXMgY29kZSksIHdlXG4gICAgICAgICAgLy8gZW1pdCBhbiBlcnJvciBpbnN0ZWFkIG9mIGRpcmVjdGx5IHN0YXJ0aW5nIGEgbmV3IHVwbG9hZC4gVGhpcyB3YXkgdGhlXG4gICAgICAgICAgLy8gcmV0cnkgbG9naWMgY2FuIGNhdGNoIHRoZSBlcnJvciBhbmQgd2lsbCByZXRyeSB0aGUgdXBsb2FkLiBBbiB1cGxvYWRcbiAgICAgICAgICAvLyBpcyB1c3VhbGx5IGxvY2tlZCBmb3IgYSBzaG9ydCBwZXJpb2Qgb2YgdGltZSBhbmQgd2lsbCBiZSBhdmFpbGFibGVcbiAgICAgICAgICAvLyBhZnRlcndhcmRzLlxuXG5cbiAgICAgICAgICBpZiAoc3RhdHVzID09PSA0MjMpIHtcbiAgICAgICAgICAgIF90aGlzNy5fZW1pdEh0dHBFcnJvcihyZXEsIHJlcywgJ3R1czogdXBsb2FkIGlzIGN1cnJlbnRseSBsb2NrZWQ7IHJldHJ5IGxhdGVyJyk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIV90aGlzNy5vcHRpb25zLmVuZHBvaW50KSB7XG4gICAgICAgICAgICAvLyBEb24ndCBhdHRlbXB0IHRvIGNyZWF0ZSBhIG5ldyB1cGxvYWQgaWYgbm8gZW5kcG9pbnQgaXMgcHJvdmlkZWQuXG4gICAgICAgICAgICBfdGhpczcuX2VtaXRIdHRwRXJyb3IocmVxLCByZXMsICd0dXM6IHVuYWJsZSB0byByZXN1bWUgdXBsb2FkIChuZXcgdXBsb2FkIGNhbm5vdCBiZSBjcmVhdGVkIHdpdGhvdXQgYW4gZW5kcG9pbnQpJyk7XG5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IC8vIFRyeSB0byBjcmVhdGUgYSBuZXcgdXBsb2FkXG5cblxuICAgICAgICAgIF90aGlzNy51cmwgPSBudWxsO1xuXG4gICAgICAgICAgX3RoaXM3Ll9jcmVhdGVVcGxvYWQoKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvZmZzZXQgPSBwYXJzZUludChyZXMuZ2V0SGVhZGVyKCdVcGxvYWQtT2Zmc2V0JyksIDEwKTtcblxuICAgICAgICBpZiAoaXNOYU4ob2Zmc2V0KSkge1xuICAgICAgICAgIF90aGlzNy5fZW1pdEh0dHBFcnJvcihyZXEsIHJlcywgJ3R1czogaW52YWxpZCBvciBtaXNzaW5nIG9mZnNldCB2YWx1ZScpO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IHBhcnNlSW50KHJlcy5nZXRIZWFkZXIoJ1VwbG9hZC1MZW5ndGgnKSwgMTApO1xuXG4gICAgICAgIGlmIChpc05hTihsZW5ndGgpICYmICFfdGhpczcub3B0aW9ucy51cGxvYWRMZW5ndGhEZWZlcnJlZCkge1xuICAgICAgICAgIF90aGlzNy5fZW1pdEh0dHBFcnJvcihyZXEsIHJlcywgJ3R1czogaW52YWxpZCBvciBtaXNzaW5nIGxlbmd0aCB2YWx1ZScpO1xuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBfdGhpczcub3B0aW9ucy5fb25VcGxvYWRVcmxBdmFpbGFibGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBfdGhpczcub3B0aW9ucy5fb25VcGxvYWRVcmxBdmFpbGFibGUoKTtcbiAgICAgICAgfSAvLyBVcGxvYWQgaGFzIGFscmVhZHkgYmVlbiBjb21wbGV0ZWQgYW5kIHdlIGRvIG5vdCBuZWVkIHRvIHNlbmQgYWRkaXRpb25hbFxuICAgICAgICAvLyBkYXRhIHRvIHRoZSBzZXJ2ZXJcblxuXG4gICAgICAgIGlmIChvZmZzZXQgPT09IGxlbmd0aCkge1xuICAgICAgICAgIF90aGlzNy5fZW1pdFByb2dyZXNzKGxlbmd0aCwgbGVuZ3RoKTtcblxuICAgICAgICAgIF90aGlzNy5fZW1pdFN1Y2Nlc3MoKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzNy5fb2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgICAgIF90aGlzNy5fcGVyZm9ybVVwbG9hZCgpO1xuICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIF90aGlzNy5fZW1pdEh0dHBFcnJvcihyZXEsIG51bGwsICd0dXM6IGZhaWxlZCB0byByZXN1bWUgdXBsb2FkJywgZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBTdGFydCB1cGxvYWRpbmcgdGhlIGZpbGUgdXNpbmcgUEFUQ0ggcmVxdWVzdHMuIFRoZSBmaWxlIHdpbGwgYmUgZGl2aWRlZFxuICAgICAqIGludG8gY2h1bmtzIGFzIHNwZWNpZmllZCBpbiB0aGUgY2h1bmtTaXplIG9wdGlvbi4gRHVyaW5nIHRoZSB1cGxvYWRcbiAgICAgKiB0aGUgb25Qcm9ncmVzcyBldmVudCBoYW5kbGVyIG1heSBiZSBpbnZva2VkIG11bHRpcGxlIHRpbWVzLlxuICAgICAqXG4gICAgICogQGFwaSBwcml2YXRlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJfcGVyZm9ybVVwbG9hZFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfcGVyZm9ybVVwbG9hZCgpIHtcbiAgICAgIHZhciBfdGhpczggPSB0aGlzOyAvLyBJZiB0aGUgdXBsb2FkIGhhcyBiZWVuIGFib3J0ZWQsIHdlIHdpbGwgbm90IHNlbmQgdGhlIG5leHQgUEFUQ0ggcmVxdWVzdC5cbiAgICAgIC8vIFRoaXMgaXMgaW1wb3J0YW50IGlmIHRoZSBhYm9ydCBtZXRob2Qgd2FzIGNhbGxlZCBkdXJpbmcgYSBjYWxsYmFjaywgc3VjaFxuICAgICAgLy8gYXMgb25DaHVua0NvbXBsZXRlIG9yIG9uUHJvZ3Jlc3MuXG5cblxuICAgICAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxOyAvLyBTb21lIGJyb3dzZXIgYW5kIHNlcnZlcnMgbWF5IG5vdCBzdXBwb3J0IHRoZSBQQVRDSCBtZXRob2QuIEZvciB0aG9zZVxuICAgICAgLy8gY2FzZXMsIHlvdSBjYW4gdGVsbCB0dXMtanMtY2xpZW50IHRvIHVzZSBhIFBPU1QgcmVxdWVzdCB3aXRoIHRoZVxuICAgICAgLy8gWC1IVFRQLU1ldGhvZC1PdmVycmlkZSBoZWFkZXIgZm9yIHNpbXVsYXRpbmcgYSBQQVRDSCByZXF1ZXN0LlxuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJyaWRlUGF0Y2hNZXRob2QpIHtcbiAgICAgICAgcmVxID0gdGhpcy5fb3BlblJlcXVlc3QoJ1BPU1QnLCB0aGlzLnVybCk7XG4gICAgICAgIHJlcS5zZXRIZWFkZXIoJ1gtSFRUUC1NZXRob2QtT3ZlcnJpZGUnLCAnUEFUQ0gnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcSA9IHRoaXMuX29wZW5SZXF1ZXN0KCdQQVRDSCcsIHRoaXMudXJsKTtcbiAgICAgIH1cblxuICAgICAgcmVxLnNldEhlYWRlcignVXBsb2FkLU9mZnNldCcsIHRoaXMuX29mZnNldCk7XG5cbiAgICAgIHZhciBwcm9taXNlID0gdGhpcy5fYWRkQ2h1bmtUb1JlcXVlc3QocmVxKTtcblxuICAgICAgcHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHJlcy5nZXRTdGF0dXMoKSwgMjAwKSkge1xuICAgICAgICAgIF90aGlzOC5fZW1pdEh0dHBFcnJvcihyZXEsIHJlcywgJ3R1czogdW5leHBlY3RlZCByZXNwb25zZSB3aGlsZSB1cGxvYWRpbmcgY2h1bmsnKTtcblxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzOC5faGFuZGxlVXBsb2FkUmVzcG9uc2UocmVxLCByZXMpO1xuICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIC8vIERvbid0IGVtaXQgYW4gZXJyb3IgaWYgdGhlIHVwbG9hZCB3YXMgYWJvcnRlZCBtYW51YWxseVxuICAgICAgICBpZiAoX3RoaXM4Ll9hYm9ydGVkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgX3RoaXM4Ll9lbWl0SHR0cEVycm9yKHJlcSwgbnVsbCwgXCJ0dXM6IGZhaWxlZCB0byB1cGxvYWQgY2h1bmsgYXQgb2Zmc2V0IFwiLmNvbmNhdChfdGhpczguX29mZnNldCksIGVycik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogX2FkZENodW5rdG9SZXF1ZXN0IHJlYWRzIGEgY2h1bmsgZnJvbSB0aGUgc291cmNlIGFuZCBzZW5kcyBpdCB1c2luZyB0aGVcbiAgICAgKiBzdXBwbGllZCByZXF1ZXN0IG9iamVjdC4gSXQgd2lsbCBub3QgaGFuZGxlIHRoZSByZXNwb25zZS5cbiAgICAgKlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX2FkZENodW5rVG9SZXF1ZXN0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9hZGRDaHVua1RvUmVxdWVzdChyZXEpIHtcbiAgICAgIHZhciBfdGhpczkgPSB0aGlzO1xuXG4gICAgICB2YXIgc3RhcnQgPSB0aGlzLl9vZmZzZXQ7XG4gICAgICB2YXIgZW5kID0gdGhpcy5fb2Zmc2V0ICsgdGhpcy5vcHRpb25zLmNodW5rU2l6ZTtcbiAgICAgIHJlcS5zZXRQcm9ncmVzc0hhbmRsZXIoZnVuY3Rpb24gKGJ5dGVzU2VudCkge1xuICAgICAgICBfdGhpczkuX2VtaXRQcm9ncmVzcyhzdGFydCArIGJ5dGVzU2VudCwgX3RoaXM5Ll9zaXplKTtcbiAgICAgIH0pO1xuICAgICAgcmVxLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL29mZnNldCtvY3RldC1zdHJlYW0nKTsgLy8gVGhlIHNwZWNpZmllZCBjaHVua1NpemUgbWF5IGJlIEluZmluaXR5IG9yIHRoZSBjYWxjbHVhdGVkIGVuZCBwb3NpdGlvblxuICAgICAgLy8gbWF5IGV4Y2VlZCB0aGUgZmlsZSdzIHNpemUuIEluIGJvdGggY2FzZXMsIHdlIGxpbWl0IHRoZSBlbmQgcG9zaXRpb24gdG9cbiAgICAgIC8vIHRoZSBpbnB1dCdzIHRvdGFsIHNpemUgZm9yIHNpbXBsZXIgY2FsY3VsYXRpb25zIGFuZCBjb3JyZWN0bmVzcy5cblxuICAgICAgaWYgKChlbmQgPT09IEluZmluaXR5IHx8IGVuZCA+IHRoaXMuX3NpemUpICYmICF0aGlzLm9wdGlvbnMudXBsb2FkTGVuZ3RoRGVmZXJyZWQpIHtcbiAgICAgICAgZW5kID0gdGhpcy5fc2l6ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuX3NvdXJjZS5zbGljZShzdGFydCwgZW5kKS50aGVuKGZ1bmN0aW9uIChfcmVmMikge1xuICAgICAgICB2YXIgdmFsdWUgPSBfcmVmMi52YWx1ZSxcbiAgICAgICAgICAgIGRvbmUgPSBfcmVmMi5kb25lOyAvLyBJZiB0aGUgdXBsb2FkIGxlbmd0aCBpcyBkZWZlcnJlZCwgdGhlIHVwbG9hZCBzaXplIHdhcyBub3Qgc3BlY2lmaWVkIGR1cmluZ1xuICAgICAgICAvLyB1cGxvYWQgY3JlYXRpb24uIFNvLCBpZiB0aGUgZmlsZSByZWFkZXIgaXMgZG9uZSByZWFkaW5nLCB3ZSBrbm93IHRoZSB0b3RhbFxuICAgICAgICAvLyB1cGxvYWQgc2l6ZSBhbmQgY2FuIHRlbGwgdGhlIHR1cyBzZXJ2ZXIuXG5cbiAgICAgICAgaWYgKF90aGlzOS5vcHRpb25zLnVwbG9hZExlbmd0aERlZmVycmVkICYmIGRvbmUpIHtcbiAgICAgICAgICBfdGhpczkuX3NpemUgPSBfdGhpczkuX29mZnNldCArICh2YWx1ZSAmJiB2YWx1ZS5zaXplID8gdmFsdWUuc2l6ZSA6IDApO1xuICAgICAgICAgIHJlcS5zZXRIZWFkZXIoJ1VwbG9hZC1MZW5ndGgnLCBfdGhpczkuX3NpemUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzOS5fc2VuZFJlcXVlc3QocmVxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF90aGlzOS5fZW1pdFByb2dyZXNzKF90aGlzOS5fb2Zmc2V0LCBfdGhpczkuX3NpemUpO1xuXG4gICAgICAgIHJldHVybiBfdGhpczkuX3NlbmRSZXF1ZXN0KHJlcSwgdmFsdWUpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIF9oYW5kbGVVcGxvYWRSZXNwb25zZSBpcyB1c2VkIGJ5IHJlcXVlc3RzIHRoYXQgaGF2ZW4gYmVlbiBzZW50IHVzaW5nIF9hZGRDaHVua1RvUmVxdWVzdFxuICAgICAqIGFuZCBhbHJlYWR5IGhhdmUgcmVjZWl2ZWQgYSByZXNwb25zZS5cbiAgICAgKlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX2hhbmRsZVVwbG9hZFJlc3BvbnNlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9oYW5kbGVVcGxvYWRSZXNwb25zZShyZXEsIHJlcykge1xuICAgICAgdmFyIG9mZnNldCA9IHBhcnNlSW50KHJlcy5nZXRIZWFkZXIoJ1VwbG9hZC1PZmZzZXQnKSwgMTApO1xuXG4gICAgICBpZiAoaXNOYU4ob2Zmc2V0KSkge1xuICAgICAgICB0aGlzLl9lbWl0SHR0cEVycm9yKHJlcSwgcmVzLCAndHVzOiBpbnZhbGlkIG9yIG1pc3Npbmcgb2Zmc2V0IHZhbHVlJyk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbWl0UHJvZ3Jlc3Mob2Zmc2V0LCB0aGlzLl9zaXplKTtcblxuICAgICAgdGhpcy5fZW1pdENodW5rQ29tcGxldGUob2Zmc2V0IC0gdGhpcy5fb2Zmc2V0LCBvZmZzZXQsIHRoaXMuX3NpemUpO1xuXG4gICAgICB0aGlzLl9vZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICAgIGlmIChvZmZzZXQgPT0gdGhpcy5fc2l6ZSkge1xuICAgICAgICAvLyBZYXksIGZpbmFsbHkgZG9uZSA6KVxuICAgICAgICB0aGlzLl9lbWl0U3VjY2VzcygpO1xuXG4gICAgICAgIHRoaXMuX3NvdXJjZS5jbG9zZSgpO1xuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGVyZm9ybVVwbG9hZCgpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYSBuZXcgSFRUUCByZXF1ZXN0IG9iamVjdCB3aXRoIHRoZSBnaXZlbiBtZXRob2QgYW5kIFVSTC5cbiAgICAgKlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX29wZW5SZXF1ZXN0XCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9vcGVuUmVxdWVzdChtZXRob2QsIHVybCkge1xuICAgICAgdmFyIHJlcSA9IG9wZW5SZXF1ZXN0KG1ldGhvZCwgdXJsLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgdGhpcy5fcmVxID0gcmVxO1xuICAgICAgcmV0dXJuIHJlcTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogUmVtb3ZlIHRoZSBlbnRyeSBpbiB0aGUgVVJMIHN0b3JhZ2UsIGlmIGl0IGhhcyBiZWVuIHNhdmVkIGJlZm9yZS5cbiAgICAgKlxuICAgICAqIEBhcGkgcHJpdmF0ZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiX3JlbW92ZUZyb21VcmxTdG9yYWdlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9yZW1vdmVGcm9tVXJsU3RvcmFnZSgpIHtcbiAgICAgIHZhciBfdGhpczEwID0gdGhpcztcblxuICAgICAgaWYgKCF0aGlzLl91cmxTdG9yYWdlS2V5KSByZXR1cm47XG5cbiAgICAgIHRoaXMuX3VybFN0b3JhZ2UucmVtb3ZlVXBsb2FkKHRoaXMuX3VybFN0b3JhZ2VLZXkpW1wiY2F0Y2hcIl0oZnVuY3Rpb24gKGVycikge1xuICAgICAgICBfdGhpczEwLl9lbWl0RXJyb3IoZXJyKTtcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl91cmxTdG9yYWdlS2V5ID0gbnVsbDtcbiAgICB9XG4gICAgLyoqXG4gICAgICogQWRkIHRoZSB1cGxvYWQgVVJMIHRvIHRoZSBVUkwgc3RvcmFnZSwgaWYgcG9zc2libGUuXG4gICAgICpcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9zYXZlVXBsb2FkSW5VcmxTdG9yYWdlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIF9zYXZlVXBsb2FkSW5VcmxTdG9yYWdlKCkge1xuICAgICAgdmFyIF90aGlzMTEgPSB0aGlzOyAvLyBPbmx5IGlmIGEgZmluZ2VycHJpbnQgd2FzIGNhbGN1bGF0ZWQgZm9yIHRoZSBpbnB1dCAoaS5lLiBub3QgYSBzdHJlYW0pLCB3ZSBjYW4gc3RvcmUgdGhlIHVwbG9hZCBVUkwuXG5cblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3RvcmVGaW5nZXJwcmludEZvclJlc3VtaW5nIHx8ICF0aGlzLl9maW5nZXJwcmludCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBzdG9yZWRVcGxvYWQgPSB7XG4gICAgICAgIHNpemU6IHRoaXMuX3NpemUsXG4gICAgICAgIG1ldGFkYXRhOiB0aGlzLm9wdGlvbnMubWV0YWRhdGEsXG4gICAgICAgIGNyZWF0aW9uVGltZTogbmV3IERhdGUoKS50b1N0cmluZygpXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5fcGFyYWxsZWxVcGxvYWRzKSB7XG4gICAgICAgIC8vIFNhdmUgbXVsdGlwbGUgVVJMcyBpZiB0aGUgcGFyYWxsZWxVcGxvYWRzIG9wdGlvbiBpcyB1c2VkIC4uLlxuICAgICAgICBzdG9yZWRVcGxvYWQucGFyYWxsZWxVcGxvYWRVcmxzID0gdGhpcy5fcGFyYWxsZWxVcGxvYWRVcmxzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gLi4uIG90aGVyd2lzZSB3ZSBqdXN0IHNhdmUgdGhlIG9uZSBhdmFpbGFibGUgVVJMLlxuICAgICAgICBzdG9yZWRVcGxvYWQudXBsb2FkVXJsID0gdGhpcy51cmw7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3VybFN0b3JhZ2UuYWRkVXBsb2FkKHRoaXMuX2ZpbmdlcnByaW50LCBzdG9yZWRVcGxvYWQpLnRoZW4oZnVuY3Rpb24gKHVybFN0b3JhZ2VLZXkpIHtcbiAgICAgICAgcmV0dXJuIF90aGlzMTEuX3VybFN0b3JhZ2VLZXkgPSB1cmxTdG9yYWdlS2V5O1xuICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIF90aGlzMTEuX2VtaXRFcnJvcihlcnIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFNlbmQgYSByZXF1ZXN0IHdpdGggdGhlIHByb3ZpZGVkIGJvZHkuXG4gICAgICpcbiAgICAgKiBAYXBpIHByaXZhdGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcIl9zZW5kUmVxdWVzdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBfc2VuZFJlcXVlc3QocmVxKSB7XG4gICAgICB2YXIgYm9keSA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDogbnVsbDtcbiAgICAgIHJldHVybiBzZW5kUmVxdWVzdChyZXEsIGJvZHksIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuICB9XSwgW3tcbiAgICBrZXk6IFwidGVybWluYXRlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRlcm1pbmF0ZSh1cmwsIG9wdGlvbnMpIHtcbiAgICAgIC8vIENvdW50IHRoZSBudW1iZXIgb2YgYXJndW1lbnRzIHRvIHNlZSBpZiBhIGNhbGxiYWNrIGlzIGJlaW5nIHByb3ZpZGVkIGFzIHRoZSBsYXN0XG4gICAgICAvLyBhcmd1bWVudCBpbiB0aGUgb2xkIHN0eWxlIHJlcXVpcmVkIGJ5IHR1cy1qcy1jbGllbnQgMS54LCB0aGVuIHRocm93IGFuIGVycm9yIGlmIGl0IGlzLlxuICAgICAgLy8gYGFyZ3VtZW50c2AgaXMgYSBKYXZhU2NyaXB0IGJ1aWx0LWluIHZhcmlhYmxlIHRoYXQgY29udGFpbnMgYWxsIG9mIHRoZSBmdW5jdGlvbidzIGFyZ3VtZW50cy5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSAmJiB0eXBlb2YgYXJndW1lbnRzW2FyZ3VtZW50cy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3R1czogdGhlIHRlcm1pbmF0ZSBmdW5jdGlvbiBkb2VzIG5vdCBhY2NlcHQgYSBjYWxsYmFjayBzaW5jZSB2MiBhbnltb3JlOyBwbGVhc2UgdXNlIHRoZSByZXR1cm5lZCBQcm9taXNlIGluc3RlYWQnKTtcbiAgICAgIH0gLy8gTm90ZSB0aGF0IGluIG9yZGVyIGZvciB0aGUgdHJpY2sgYWJvdmUgdG8gd29yaywgYSBkZWZhdWx0IHZhbHVlIGNhbm5vdCBiZSBzZXQgZm9yIGBvcHRpb25zYCxcbiAgICAgIC8vIHNvIHRoZSBjaGVjayBiZWxvdyByZXBsYWNlcyB0aGUgb2xkIGRlZmF1bHQgYHt9YC5cblxuXG4gICAgICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICAgIH1cblxuICAgICAgdmFyIHJlcSA9IG9wZW5SZXF1ZXN0KCdERUxFVEUnLCB1cmwsIG9wdGlvbnMpO1xuICAgICAgcmV0dXJuIHNlbmRSZXF1ZXN0KHJlcSwgbnVsbCwgb3B0aW9ucykudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIC8vIEEgMjA0IHJlc3BvbnNlIGluZGljYXRlcyBhIHN1Y2Nlc3NmdWxsIHJlcXVlc3RcbiAgICAgICAgaWYgKHJlcy5nZXRTdGF0dXMoKSA9PT0gMjA0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhyb3cgbmV3IF9lcnJvci5kZWZhdWx0KCd0dXM6IHVuZXhwZWN0ZWQgcmVzcG9uc2Ugd2hpbGUgdGVybWluYXRpbmcgdXBsb2FkJywgbnVsbCwgcmVxLCByZXMpO1xuICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGlmICghKGVyciBpbnN0YW5jZW9mIF9lcnJvci5kZWZhdWx0KSkge1xuICAgICAgICAgIGVyciA9IG5ldyBfZXJyb3IuZGVmYXVsdCgndHVzOiBmYWlsZWQgdG8gdGVybWluYXRlIHVwbG9hZCcsIGVyciwgcmVxLCBudWxsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghc2hvdWxkUmV0cnkoZXJyLCAwLCBvcHRpb25zKSkge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfSAvLyBJbnN0ZWFkIG9mIGtlZXBpbmcgdHJhY2sgb2YgdGhlIHJldHJ5IGF0dGVtcHRzLCB3ZSByZW1vdmUgdGhlIGZpcnN0IGVsZW1lbnQgZnJvbSB0aGUgZGVsYXlzXG4gICAgICAgIC8vIGFycmF5LiBJZiB0aGUgYXJyYXkgaXMgZW1wdHksIGFsbCByZXRyeSBhdHRlbXB0cyBhcmUgdXNlZCB1cCBhbmQgd2Ugd2lsbCBidWJibGUgdXAgdGhlIGVycm9yLlxuICAgICAgICAvLyBXZSByZWN1cnNpdmVseSBjYWxsIHRoZSB0ZXJtaW5hdGUgZnVuY3Rpb24gd2lsbCByZW1vdmluZyBlbGVtZW50cyBmcm9tIHRoZSByZXRyeURlbGF5cyBhcnJheS5cblxuXG4gICAgICAgIHZhciBkZWxheSA9IG9wdGlvbnMucmV0cnlEZWxheXNbMF07XG4gICAgICAgIHZhciByZW1haW5pbmdEZWxheXMgPSBvcHRpb25zLnJldHJ5RGVsYXlzLnNsaWNlKDEpO1xuXG4gICAgICAgIHZhciBuZXdPcHRpb25zID0gX29iamVjdFNwcmVhZCh7fSwgb3B0aW9ucywge1xuICAgICAgICAgIHJldHJ5RGVsYXlzOiByZW1haW5pbmdEZWxheXNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQocmVzb2x2ZSwgZGVsYXkpO1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gQmFzZVVwbG9hZC50ZXJtaW5hdGUodXJsLCBuZXdPcHRpb25zKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQmFzZVVwbG9hZDtcbn0oKTtcblxuZnVuY3Rpb24gZW5jb2RlTWV0YWRhdGEobWV0YWRhdGEpIHtcbiAgdmFyIGVuY29kZWQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gbWV0YWRhdGEpIHtcbiAgICBlbmNvZGVkLnB1c2goXCJcIi5jb25jYXQoa2V5LCBcIiBcIikuY29uY2F0KF9qc0Jhc2UuQmFzZTY0LmVuY29kZShtZXRhZGF0YVtrZXldKSkpO1xuICB9XG5cbiAgcmV0dXJuIGVuY29kZWQuam9pbignLCcpO1xufVxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIHN0YXR1cyBpcyBpbiB0aGUgcmFuZ2Ugb2YgdGhlIGV4cGVjdGVkIGNhdGVnb3J5LlxuICogRm9yIGV4YW1wbGUsIG9ubHkgYSBzdGF0dXMgYmV0d2VlbiAyMDAgYW5kIDI5OSB3aWxsIHNhdGlzZnkgdGhlIGNhdGVnb3J5IDIwMC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5cbmZ1bmN0aW9uIGluU3RhdHVzQ2F0ZWdvcnkoc3RhdHVzLCBjYXRlZ29yeSkge1xuICByZXR1cm4gc3RhdHVzID49IGNhdGVnb3J5ICYmIHN0YXR1cyA8IGNhdGVnb3J5ICsgMTAwO1xufVxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgSFRUUCByZXF1ZXN0IHdpdGggdGhlIHNwZWNpZmllZCBtZXRob2QgYW5kIFVSTC5cbiAqIFRoZSBuZWNlc3NhcnkgaGVhZGVycyB0aGF0IGFyZSBpbmNsdWRlZCBpbiBldmVyeSByZXF1ZXN0XG4gKiB3aWxsIGJlIGFkZGVkLCBpbmNsdWRpbmcgdGhlIHJlcXVlc3QgSUQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuXG5mdW5jdGlvbiBvcGVuUmVxdWVzdChtZXRob2QsIHVybCwgb3B0aW9ucykge1xuICB2YXIgcmVxID0gb3B0aW9ucy5odHRwU3RhY2suY3JlYXRlUmVxdWVzdChtZXRob2QsIHVybCk7XG4gIHJlcS5zZXRIZWFkZXIoJ1R1cy1SZXN1bWFibGUnLCAnMS4wLjAnKTtcbiAgdmFyIGhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgfHwge307XG5cbiAgZm9yICh2YXIgbmFtZSBpbiBoZWFkZXJzKSB7XG4gICAgcmVxLnNldEhlYWRlcihuYW1lLCBoZWFkZXJzW25hbWVdKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmFkZFJlcXVlc3RJZCkge1xuICAgIHZhciByZXF1ZXN0SWQgPSAoMCwgX3V1aWQuZGVmYXVsdCkoKTtcbiAgICByZXEuc2V0SGVhZGVyKCdYLVJlcXVlc3QtSUQnLCByZXF1ZXN0SWQpO1xuICB9XG5cbiAgcmV0dXJuIHJlcTtcbn1cbi8qKlxuICogU2VuZCBhIHJlcXVlc3Qgd2l0aCB0aGUgcHJvdmlkZWQgYm9keSB3aGlsZSBpbnZva2luZyB0aGUgb25CZWZvcmVSZXF1ZXN0XG4gKiBhbmQgb25BZnRlclJlc3BvbnNlIGNhbGxiYWNrcy5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5cbmZ1bmN0aW9uIHNlbmRSZXF1ZXN0KHJlcSwgYm9keSwgb3B0aW9ucykge1xuICB2YXIgb25CZWZvcmVSZXF1ZXN0UHJvbWlzZSA9IHR5cGVvZiBvcHRpb25zLm9uQmVmb3JlUmVxdWVzdCA9PT0gJ2Z1bmN0aW9uJyA/IFByb21pc2UucmVzb2x2ZShvcHRpb25zLm9uQmVmb3JlUmVxdWVzdChyZXEpKSA6IFByb21pc2UucmVzb2x2ZSgpO1xuICByZXR1cm4gb25CZWZvcmVSZXF1ZXN0UHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gcmVxLnNlbmQoYm9keSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICB2YXIgb25BZnRlclJlc3BvbnNlUHJvbWlzZSA9IHR5cGVvZiBvcHRpb25zLm9uQWZ0ZXJSZXNwb25zZSA9PT0gJ2Z1bmN0aW9uJyA/IFByb21pc2UucmVzb2x2ZShvcHRpb25zLm9uQWZ0ZXJSZXNwb25zZShyZXEsIHJlcykpIDogUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICByZXR1cm4gb25BZnRlclJlc3BvbnNlUHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgdGhlIGJyb3dzZXIgcnVubmluZyB0aGlzIGNvZGUgaGFzIGludGVybmV0IGFjY2Vzcy5cbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBhbHdheXMgcmV0dXJuIHRydWUgaW4gdGhlIG5vZGUuanMgZW52aXJvbm1lbnRcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5cbmZ1bmN0aW9uIGlzT25saW5lKCkge1xuICB2YXIgb25saW5lID0gdHJ1ZTtcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ25hdmlnYXRvcicgaW4gd2luZG93ICYmIHdpbmRvdy5uYXZpZ2F0b3Iub25MaW5lID09PSBmYWxzZSkge1xuICAgIG9ubGluZSA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIG9ubGluZTtcbn1cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgb3Igbm90IGl0IGlzIG9rIHRvIHJldHJ5IGEgcmVxdWVzdC5cbiAqIEBwYXJhbSB7RXJyb3J9IGVyciB0aGUgZXJyb3IgcmV0dXJuZWQgZnJvbSB0aGUgbGFzdCByZXF1ZXN0XG4gKiBAcGFyYW0ge251bWJlcn0gcmV0cnlBdHRlbXB0IHRoZSBudW1iZXIgb2YgdGltZXMgdGhlIHJlcXVlc3QgaGFzIGFscmVhZHkgYmVlbiByZXRyaWVkXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB0dXMgVXBsb2FkIG9wdGlvbnNcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5cbmZ1bmN0aW9uIHNob3VsZFJldHJ5KGVyciwgcmV0cnlBdHRlbXB0LCBvcHRpb25zKSB7XG4gIC8vIFdlIG9ubHkgYXR0ZW1wdCBhIHJldHJ5IGlmXG4gIC8vIC0gcmV0cnlEZWxheXMgb3B0aW9uIGlzIHNldFxuICAvLyAtIHdlIGRpZG4ndCBleGNlZWQgdGhlIG1heGl1bSBudW1iZXIgb2YgcmV0cmllcywgeWV0LCBhbmRcbiAgLy8gLSB0aGlzIGVycm9yIHdhcyBjYXVzZWQgYnkgYSByZXF1ZXN0IG9yIGl0J3MgcmVzcG9uc2UgYW5kXG4gIC8vIC0gdGhlIGVycm9yIGlzIHNlcnZlciBlcnJvciAoaS5lLiBub3QgYSBzdGF0dXMgNHh4IGV4Y2VwdCBhIDQwOSBvciA0MjMpIG9yXG4gIC8vIGEgb25TaG91bGRSZXRyeSBpcyBzcGVjaWZpZWQgYW5kIHJldHVybnMgdHJ1ZVxuICAvLyAtIHRoZSBicm93c2VyIGRvZXMgbm90IGluZGljYXRlIHRoYXQgd2UgYXJlIG9mZmxpbmVcbiAgaWYgKG9wdGlvbnMucmV0cnlEZWxheXMgPT0gbnVsbCB8fCByZXRyeUF0dGVtcHQgPj0gb3B0aW9ucy5yZXRyeURlbGF5cy5sZW5ndGggfHwgZXJyLm9yaWdpbmFsUmVxdWVzdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMub25TaG91bGRSZXRyeSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBvcHRpb25zLm9uU2hvdWxkUmV0cnkoZXJyLCByZXRyeUF0dGVtcHQsIG9wdGlvbnMpO1xuICB9XG5cbiAgdmFyIHN0YXR1cyA9IGVyci5vcmlnaW5hbFJlc3BvbnNlID8gZXJyLm9yaWdpbmFsUmVzcG9uc2UuZ2V0U3RhdHVzKCkgOiAwO1xuICByZXR1cm4gKCFpblN0YXR1c0NhdGVnb3J5KHN0YXR1cywgNDAwKSB8fCBzdGF0dXMgPT09IDQwOSB8fCBzdGF0dXMgPT09IDQyMykgJiYgaXNPbmxpbmUoKTtcbn1cbi8qKlxuICogUmVzb2x2ZSBhIHJlbGF0aXZlIGxpbmsgZ2l2ZW4gdGhlIG9yaWdpbiBhcyBzb3VyY2UuIEZvciBleGFtcGxlLFxuICogaWYgYSBIVFRQIHJlcXVlc3QgdG8gaHR0cDovL2V4YW1wbGUuY29tL2ZpbGVzLyByZXR1cm5zIGEgTG9jYXRpb25cbiAqIGhlYWRlciB3aXRoIHRoZSB2YWx1ZSAvdXBsb2FkL2FiYywgdGhlIHJlc29sdmVkIFVSTCB3aWxsIGJlOlxuICogaHR0cDovL2V4YW1wbGUuY29tL3VwbG9hZC9hYmNcbiAqL1xuXG5cbmZ1bmN0aW9uIHJlc29sdmVVcmwob3JpZ2luLCBsaW5rKSB7XG4gIHJldHVybiBuZXcgX3VybFBhcnNlLmRlZmF1bHQobGluaywgb3JpZ2luKS50b1N0cmluZygpO1xufVxuLyoqXG4gKiBDYWxjdWxhdGUgdGhlIHN0YXJ0IGFuZCBlbmQgcG9zaXRpb25zIGZvciB0aGUgcGFydHMgaWYgYW4gdXBsb2FkXG4gKiBpcyBzcGxpdCBpbnRvIG11bHRpcGxlIHBhcmFsbGVsIHJlcXVlc3RzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3RhbFNpemUgVGhlIGJ5dGUgc2l6ZSBvZiB0aGUgdXBsb2FkLCB3aGljaCB3aWxsIGJlIHNwbGl0LlxuICogQHBhcmFtIHtudW1iZXJ9IHBhcnRDb3VudCBUaGUgbnVtYmVyIGluIGhvdyBtYW55IHBhcnRzIHRoZSB1cGxvYWQgd2lsbCBiZSBzcGxpdC5cbiAqIEBwYXJhbSB7c3RyaW5nW119IHByZXZpb3VzVXJscyBUaGUgdXBsb2FkIFVSTHMgZm9yIHByZXZpb3VzIHBhcnRzLlxuICogQHJldHVybiB7b2JqZWN0W119XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5cbmZ1bmN0aW9uIHNwbGl0U2l6ZUludG9QYXJ0cyh0b3RhbFNpemUsIHBhcnRDb3VudCwgcHJldmlvdXNVcmxzKSB7XG4gIHZhciBwYXJ0U2l6ZSA9IE1hdGguZmxvb3IodG90YWxTaXplIC8gcGFydENvdW50KTtcbiAgdmFyIHBhcnRzID0gW107XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0Q291bnQ7IGkrKykge1xuICAgIHBhcnRzLnB1c2goe1xuICAgICAgc3RhcnQ6IHBhcnRTaXplICogaSxcbiAgICAgIGVuZDogcGFydFNpemUgKiAoaSArIDEpXG4gICAgfSk7XG4gIH1cblxuICBwYXJ0c1twYXJ0Q291bnQgLSAxXS5lbmQgPSB0b3RhbFNpemU7IC8vIEF0dGFjaCBVUkxzIGZyb20gcHJldmlvdXMgdXBsb2FkcywgaWYgYXZhaWxhYmxlLlxuXG4gIGlmIChwcmV2aW91c1VybHMpIHtcbiAgICBwYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJ0LCBpbmRleCkge1xuICAgICAgcGFydC51cGxvYWRVcmwgPSBwcmV2aW91c1VybHNbaW5kZXhdIHx8IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbkJhc2VVcGxvYWQuZGVmYXVsdE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcbnZhciBfZGVmYXVsdCA9IEJhc2VVcGxvYWQ7XG5leHBvcnRzLmRlZmF1bHQgPSBfZGVmYXVsdDsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuZGVmYXVsdCA9IHV1aWQ7XG5cbi8qKlxuICogR2VuZXJhdGUgYSBVVUlEIHY0IGJhc2VkIG9uIHJhbmRvbSBudW1iZXJzLiBXZSBpbnRlbnRpb2FubGx5IHVzZSB0aGUgbGVzc1xuICogc2VjdXJlIE1hdGgucmFuZG9tIGZ1bmN0aW9uIGhlcmUgc2luY2UgdGhlIG1vcmUgc2VjdXJlIGNyeXB0by5nZXRSYW5kb21OdW1iZXJzXG4gKiBpcyBub3QgYXZhaWxhYmxlIG9uIGFsbCBwbGF0Zm9ybXMuXG4gKiBUaGlzIGlzIG5vdCBhIHByb2JsZW0gZm9yIHVzIHNpbmNlIHdlIHVzZSB0aGUgVVVJRCBvbmx5IGZvciBnZW5lcmF0aW5nIGFcbiAqIHJlcXVlc3QgSUQsIHNvIHdlIGNhbiBjb3JyZWxhdGUgc2VydmVyIGxvZ3MgdG8gY2xpZW50IGVycm9ycy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIHRha2VuIGZyb20gZm9sbG93aW5nIHNpdGU6XG4gKiBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMDUwMzQvY3JlYXRlLWd1aWQtdXVpZC1pbi1qYXZhc2NyaXB0XG4gKlxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgZ2VuZXJhdGUgVVVJRFxuICovXG5mdW5jdGlvbiB1dWlkKCkge1xuICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbiAoYykge1xuICAgIHZhciByID0gTWF0aC5yYW5kb20oKSAqIDE2IHwgMCxcbiAgICAgICAgdiA9IGMgPT0gJ3gnID8gciA6IHIgJiAweDMgfCAweDg7XG4gICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICB9KTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbnZhciByZXF1aXJlZCA9IHJlcXVpcmUoJ3JlcXVpcmVzLXBvcnQnKVxuICAsIHFzID0gcmVxdWlyZSgncXVlcnlzdHJpbmdpZnknKVxuICAsIHNsYXNoZXMgPSAvXltBLVphLXpdW0EtWmEtejAtOSstLl0qOlxcL1xcLy9cbiAgLCBwcm90b2NvbHJlID0gL14oW2Etel1bYS16MC05ListXSo6KT8oXFwvXFwvKT8oW1xcXFwvXSspPyhbXFxTXFxzXSopL2lcbiAgLCB3aW5kb3dzRHJpdmVMZXR0ZXIgPSAvXlthLXpBLVpdOi9cbiAgLCB3aGl0ZXNwYWNlID0gJ1tcXFxceDA5XFxcXHgwQVxcXFx4MEJcXFxceDBDXFxcXHgwRFxcXFx4MjBcXFxceEEwXFxcXHUxNjgwXFxcXHUxODBFXFxcXHUyMDAwXFxcXHUyMDAxXFxcXHUyMDAyXFxcXHUyMDAzXFxcXHUyMDA0XFxcXHUyMDA1XFxcXHUyMDA2XFxcXHUyMDA3XFxcXHUyMDA4XFxcXHUyMDA5XFxcXHUyMDBBXFxcXHUyMDJGXFxcXHUyMDVGXFxcXHUzMDAwXFxcXHUyMDI4XFxcXHUyMDI5XFxcXHVGRUZGXSdcbiAgLCBsZWZ0ID0gbmV3IFJlZ0V4cCgnXicrIHdoaXRlc3BhY2UgKycrJyk7XG5cbi8qKlxuICogVHJpbSBhIGdpdmVuIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFN0cmluZyB0byB0cmltLlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiB0cmltTGVmdChzdHIpIHtcbiAgcmV0dXJuIChzdHIgPyBzdHIgOiAnJykudG9TdHJpbmcoKS5yZXBsYWNlKGxlZnQsICcnKTtcbn1cblxuLyoqXG4gKiBUaGVzZSBhcmUgdGhlIHBhcnNlIHJ1bGVzIGZvciB0aGUgVVJMIHBhcnNlciwgaXQgaW5mb3JtcyB0aGUgcGFyc2VyXG4gKiBhYm91dDpcbiAqXG4gKiAwLiBUaGUgY2hhciBpdCBOZWVkcyB0byBwYXJzZSwgaWYgaXQncyBhIHN0cmluZyBpdCBzaG91bGQgYmUgZG9uZSB1c2luZ1xuICogICAgaW5kZXhPZiwgUmVnRXhwIHVzaW5nIGV4ZWMgYW5kIE5hTiBtZWFucyBzZXQgYXMgY3VycmVudCB2YWx1ZS5cbiAqIDEuIFRoZSBwcm9wZXJ0eSB3ZSBzaG91bGQgc2V0IHdoZW4gcGFyc2luZyB0aGlzIHZhbHVlLlxuICogMi4gSW5kaWNhdGlvbiBpZiBpdCdzIGJhY2t3YXJkcyBvciBmb3J3YXJkIHBhcnNpbmcsIHdoZW4gc2V0IGFzIG51bWJlciBpdCdzXG4gKiAgICB0aGUgdmFsdWUgb2YgZXh0cmEgY2hhcnMgdGhhdCBzaG91bGQgYmUgc3BsaXQgb2ZmLlxuICogMy4gSW5oZXJpdCBmcm9tIGxvY2F0aW9uIGlmIG5vbiBleGlzdGluZyBpbiB0aGUgcGFyc2VyLlxuICogNC4gYHRvTG93ZXJDYXNlYCB0aGUgcmVzdWx0aW5nIHZhbHVlLlxuICovXG52YXIgcnVsZXMgPSBbXG4gIFsnIycsICdoYXNoJ10sICAgICAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBiYWNrLlxuICBbJz8nLCAncXVlcnknXSwgICAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgYmFjay5cbiAgZnVuY3Rpb24gc2FuaXRpemUoYWRkcmVzcywgdXJsKSB7ICAgICAvLyBTYW5pdGl6ZSB3aGF0IGlzIGxlZnQgb2YgdGhlIGFkZHJlc3NcbiAgICByZXR1cm4gaXNTcGVjaWFsKHVybC5wcm90b2NvbCkgPyBhZGRyZXNzLnJlcGxhY2UoL1xcXFwvZywgJy8nKSA6IGFkZHJlc3M7XG4gIH0sXG4gIFsnLycsICdwYXRobmFtZSddLCAgICAgICAgICAgICAgICAgICAgLy8gRXh0cmFjdCBmcm9tIHRoZSBiYWNrLlxuICBbJ0AnLCAnYXV0aCcsIDFdLCAgICAgICAgICAgICAgICAgICAgIC8vIEV4dHJhY3QgZnJvbSB0aGUgZnJvbnQuXG4gIFtOYU4sICdob3N0JywgdW5kZWZpbmVkLCAxLCAxXSwgICAgICAgLy8gU2V0IGxlZnQgb3ZlciB2YWx1ZS5cbiAgWy86KFxcZCspJC8sICdwb3J0JywgdW5kZWZpbmVkLCAxXSwgICAgLy8gUmVnRXhwIHRoZSBiYWNrLlxuICBbTmFOLCAnaG9zdG5hbWUnLCB1bmRlZmluZWQsIDEsIDFdICAgIC8vIFNldCBsZWZ0IG92ZXIuXG5dO1xuXG4vKipcbiAqIFRoZXNlIHByb3BlcnRpZXMgc2hvdWxkIG5vdCBiZSBjb3BpZWQgb3IgaW5oZXJpdGVkIGZyb20uIFRoaXMgaXMgb25seSBuZWVkZWRcbiAqIGZvciBhbGwgbm9uIGJsb2IgVVJMJ3MgYXMgYSBibG9iIFVSTCBkb2VzIG5vdCBpbmNsdWRlIGEgaGFzaCwgb25seSB0aGVcbiAqIG9yaWdpbi5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICogQHByaXZhdGVcbiAqL1xudmFyIGlnbm9yZSA9IHsgaGFzaDogMSwgcXVlcnk6IDEgfTtcblxuLyoqXG4gKiBUaGUgbG9jYXRpb24gb2JqZWN0IGRpZmZlcnMgd2hlbiB5b3VyIGNvZGUgaXMgbG9hZGVkIHRocm91Z2ggYSBub3JtYWwgcGFnZSxcbiAqIFdvcmtlciBvciB0aHJvdWdoIGEgd29ya2VyIHVzaW5nIGEgYmxvYi4gQW5kIHdpdGggdGhlIGJsb2JibGUgYmVnaW5zIHRoZVxuICogdHJvdWJsZSBhcyB0aGUgbG9jYXRpb24gb2JqZWN0IHdpbGwgY29udGFpbiB0aGUgVVJMIG9mIHRoZSBibG9iLCBub3QgdGhlXG4gKiBsb2NhdGlvbiBvZiB0aGUgcGFnZSB3aGVyZSBvdXIgY29kZSBpcyBsb2FkZWQgaW4uIFRoZSBhY3R1YWwgb3JpZ2luIGlzXG4gKiBlbmNvZGVkIGluIHRoZSBgcGF0aG5hbWVgIHNvIHdlIGNhbiB0aGFua2Z1bGx5IGdlbmVyYXRlIGEgZ29vZCBcImRlZmF1bHRcIlxuICogbG9jYXRpb24gZnJvbSBpdCBzbyB3ZSBjYW4gZ2VuZXJhdGUgcHJvcGVyIHJlbGF0aXZlIFVSTCdzIGFnYWluLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gbG9jIE9wdGlvbmFsIGRlZmF1bHQgbG9jYXRpb24gb2JqZWN0LlxuICogQHJldHVybnMge09iamVjdH0gbG9sY2F0aW9uIG9iamVjdC5cbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gbG9sY2F0aW9uKGxvYykge1xuICB2YXIgZ2xvYmFsVmFyO1xuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgZ2xvYmFsVmFyID0gd2luZG93O1xuICBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykgZ2xvYmFsVmFyID0gZ2xvYmFsO1xuICBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIGdsb2JhbFZhciA9IHNlbGY7XG4gIGVsc2UgZ2xvYmFsVmFyID0ge307XG5cbiAgdmFyIGxvY2F0aW9uID0gZ2xvYmFsVmFyLmxvY2F0aW9uIHx8IHt9O1xuICBsb2MgPSBsb2MgfHwgbG9jYXRpb247XG5cbiAgdmFyIGZpbmFsZGVzdGluYXRpb24gPSB7fVxuICAgICwgdHlwZSA9IHR5cGVvZiBsb2NcbiAgICAsIGtleTtcblxuICBpZiAoJ2Jsb2I6JyA9PT0gbG9jLnByb3RvY29sKSB7XG4gICAgZmluYWxkZXN0aW5hdGlvbiA9IG5ldyBVcmwodW5lc2NhcGUobG9jLnBhdGhuYW1lKSwge30pO1xuICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlKSB7XG4gICAgZmluYWxkZXN0aW5hdGlvbiA9IG5ldyBVcmwobG9jLCB7fSk7XG4gICAgZm9yIChrZXkgaW4gaWdub3JlKSBkZWxldGUgZmluYWxkZXN0aW5hdGlvbltrZXldO1xuICB9IGVsc2UgaWYgKCdvYmplY3QnID09PSB0eXBlKSB7XG4gICAgZm9yIChrZXkgaW4gbG9jKSB7XG4gICAgICBpZiAoa2V5IGluIGlnbm9yZSkgY29udGludWU7XG4gICAgICBmaW5hbGRlc3RpbmF0aW9uW2tleV0gPSBsb2Nba2V5XTtcbiAgICB9XG5cbiAgICBpZiAoZmluYWxkZXN0aW5hdGlvbi5zbGFzaGVzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGZpbmFsZGVzdGluYXRpb24uc2xhc2hlcyA9IHNsYXNoZXMudGVzdChsb2MuaHJlZik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZpbmFsZGVzdGluYXRpb247XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhIHByb3RvY29sIHNjaGVtZSBpcyBzcGVjaWFsLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBUaGUgcHJvdG9jb2wgc2NoZW1lIG9mIHRoZSBVUkxcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgcHJvdG9jb2wgc2NoZW1lIGlzIHNwZWNpYWwsIGVsc2UgYGZhbHNlYFxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaXNTcGVjaWFsKHNjaGVtZSkge1xuICByZXR1cm4gKFxuICAgIHNjaGVtZSA9PT0gJ2ZpbGU6JyB8fFxuICAgIHNjaGVtZSA9PT0gJ2Z0cDonIHx8XG4gICAgc2NoZW1lID09PSAnaHR0cDonIHx8XG4gICAgc2NoZW1lID09PSAnaHR0cHM6JyB8fFxuICAgIHNjaGVtZSA9PT0gJ3dzOicgfHxcbiAgICBzY2hlbWUgPT09ICd3c3M6J1xuICApO1xufVxuXG4vKipcbiAqIEB0eXBlZGVmIFByb3RvY29sRXh0cmFjdFxuICogQHR5cGUgT2JqZWN0XG4gKiBAcHJvcGVydHkge1N0cmluZ30gcHJvdG9jb2wgUHJvdG9jb2wgbWF0Y2hlZCBpbiB0aGUgVVJMLCBpbiBsb3dlcmNhc2UuXG4gKiBAcHJvcGVydHkge0Jvb2xlYW59IHNsYXNoZXMgYHRydWVgIGlmIHByb3RvY29sIGlzIGZvbGxvd2VkIGJ5IFwiLy9cIiwgZWxzZSBgZmFsc2VgLlxuICogQHByb3BlcnR5IHtTdHJpbmd9IHJlc3QgUmVzdCBvZiB0aGUgVVJMIHRoYXQgaXMgbm90IHBhcnQgb2YgdGhlIHByb3RvY29sLlxuICovXG5cbi8qKlxuICogRXh0cmFjdCBwcm90b2NvbCBpbmZvcm1hdGlvbiBmcm9tIGEgVVJMIHdpdGgvd2l0aG91dCBkb3VibGUgc2xhc2ggKFwiLy9cIikuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGFkZHJlc3MgVVJMIHdlIHdhbnQgdG8gZXh0cmFjdCBmcm9tLlxuICogQHBhcmFtIHtPYmplY3R9IGxvY2F0aW9uXG4gKiBAcmV0dXJuIHtQcm90b2NvbEV4dHJhY3R9IEV4dHJhY3RlZCBpbmZvcm1hdGlvbi5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RQcm90b2NvbChhZGRyZXNzLCBsb2NhdGlvbikge1xuICBhZGRyZXNzID0gdHJpbUxlZnQoYWRkcmVzcyk7XG4gIGxvY2F0aW9uID0gbG9jYXRpb24gfHwge307XG5cbiAgdmFyIG1hdGNoID0gcHJvdG9jb2xyZS5leGVjKGFkZHJlc3MpO1xuICB2YXIgcHJvdG9jb2wgPSBtYXRjaFsxXSA/IG1hdGNoWzFdLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgdmFyIGZvcndhcmRTbGFzaGVzID0gISFtYXRjaFsyXTtcbiAgdmFyIG90aGVyU2xhc2hlcyA9ICEhbWF0Y2hbM107XG4gIHZhciBzbGFzaGVzQ291bnQgPSAwO1xuICB2YXIgcmVzdDtcblxuICBpZiAoZm9yd2FyZFNsYXNoZXMpIHtcbiAgICBpZiAob3RoZXJTbGFzaGVzKSB7XG4gICAgICByZXN0ID0gbWF0Y2hbMl0gKyBtYXRjaFszXSArIG1hdGNoWzRdO1xuICAgICAgc2xhc2hlc0NvdW50ID0gbWF0Y2hbMl0ubGVuZ3RoICsgbWF0Y2hbM10ubGVuZ3RoO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN0ID0gbWF0Y2hbMl0gKyBtYXRjaFs0XTtcbiAgICAgIHNsYXNoZXNDb3VudCA9IG1hdGNoWzJdLmxlbmd0aDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKG90aGVyU2xhc2hlcykge1xuICAgICAgcmVzdCA9IG1hdGNoWzNdICsgbWF0Y2hbNF07XG4gICAgICBzbGFzaGVzQ291bnQgPSBtYXRjaFszXS5sZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlc3QgPSBtYXRjaFs0XVxuICAgIH1cbiAgfVxuXG4gIGlmIChwcm90b2NvbCA9PT0gJ2ZpbGU6Jykge1xuICAgIGlmIChzbGFzaGVzQ291bnQgPj0gMikge1xuICAgICAgcmVzdCA9IHJlc3Quc2xpY2UoMik7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzU3BlY2lhbChwcm90b2NvbCkpIHtcbiAgICByZXN0ID0gbWF0Y2hbNF07XG4gIH0gZWxzZSBpZiAocHJvdG9jb2wpIHtcbiAgICBpZiAoZm9yd2FyZFNsYXNoZXMpIHtcbiAgICAgIHJlc3QgPSByZXN0LnNsaWNlKDIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChzbGFzaGVzQ291bnQgPj0gMiAmJiBpc1NwZWNpYWwobG9jYXRpb24ucHJvdG9jb2wpKSB7XG4gICAgcmVzdCA9IG1hdGNoWzRdO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwcm90b2NvbDogcHJvdG9jb2wsXG4gICAgc2xhc2hlczogZm9yd2FyZFNsYXNoZXMgfHwgaXNTcGVjaWFsKHByb3RvY29sKSxcbiAgICBzbGFzaGVzQ291bnQ6IHNsYXNoZXNDb3VudCxcbiAgICByZXN0OiByZXN0XG4gIH07XG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIHJlbGF0aXZlIFVSTCBwYXRobmFtZSBhZ2FpbnN0IGEgYmFzZSBVUkwgcGF0aG5hbWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHJlbGF0aXZlIFBhdGhuYW1lIG9mIHRoZSByZWxhdGl2ZSBVUkwuXG4gKiBAcGFyYW0ge1N0cmluZ30gYmFzZSBQYXRobmFtZSBvZiB0aGUgYmFzZSBVUkwuXG4gKiBAcmV0dXJuIHtTdHJpbmd9IFJlc29sdmVkIHBhdGhuYW1lLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZShyZWxhdGl2ZSwgYmFzZSkge1xuICBpZiAocmVsYXRpdmUgPT09ICcnKSByZXR1cm4gYmFzZTtcblxuICB2YXIgcGF0aCA9IChiYXNlIHx8ICcvJykuc3BsaXQoJy8nKS5zbGljZSgwLCAtMSkuY29uY2F0KHJlbGF0aXZlLnNwbGl0KCcvJykpXG4gICAgLCBpID0gcGF0aC5sZW5ndGhcbiAgICAsIGxhc3QgPSBwYXRoW2kgLSAxXVxuICAgICwgdW5zaGlmdCA9IGZhbHNlXG4gICAgLCB1cCA9IDA7XG5cbiAgd2hpbGUgKGktLSkge1xuICAgIGlmIChwYXRoW2ldID09PSAnLicpIHtcbiAgICAgIHBhdGguc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAocGF0aFtpXSA9PT0gJy4uJykge1xuICAgICAgcGF0aC5zcGxpY2UoaSwgMSk7XG4gICAgICB1cCsrO1xuICAgIH0gZWxzZSBpZiAodXApIHtcbiAgICAgIGlmIChpID09PSAwKSB1bnNoaWZ0ID0gdHJ1ZTtcbiAgICAgIHBhdGguc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICBpZiAodW5zaGlmdCkgcGF0aC51bnNoaWZ0KCcnKTtcbiAgaWYgKGxhc3QgPT09ICcuJyB8fCBsYXN0ID09PSAnLi4nKSBwYXRoLnB1c2goJycpO1xuXG4gIHJldHVybiBwYXRoLmpvaW4oJy8nKTtcbn1cblxuLyoqXG4gKiBUaGUgYWN0dWFsIFVSTCBpbnN0YW5jZS4gSW5zdGVhZCBvZiByZXR1cm5pbmcgYW4gb2JqZWN0IHdlJ3ZlIG9wdGVkLWluIHRvXG4gKiBjcmVhdGUgYW4gYWN0dWFsIGNvbnN0cnVjdG9yIGFzIGl0J3MgbXVjaCBtb3JlIG1lbW9yeSBlZmZpY2llbnQgYW5kXG4gKiBmYXN0ZXIgYW5kIGl0IHBsZWFzZXMgbXkgT0NELlxuICpcbiAqIEl0IGlzIHdvcnRoIG5vdGluZyB0aGF0IHdlIHNob3VsZCBub3QgdXNlIGBVUkxgIGFzIGNsYXNzIG5hbWUgdG8gcHJldmVudFxuICogY2xhc2hlcyB3aXRoIHRoZSBnbG9iYWwgVVJMIGluc3RhbmNlIHRoYXQgZ290IGludHJvZHVjZWQgaW4gYnJvd3NlcnMuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1N0cmluZ30gYWRkcmVzcyBVUkwgd2Ugd2FudCB0byBwYXJzZS5cbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gW2xvY2F0aW9uXSBMb2NhdGlvbiBkZWZhdWx0cyBmb3IgcmVsYXRpdmUgcGF0aHMuXG4gKiBAcGFyYW0ge0Jvb2xlYW58RnVuY3Rpb259IFtwYXJzZXJdIFBhcnNlciBmb3IgdGhlIHF1ZXJ5IHN0cmluZy5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIFVybChhZGRyZXNzLCBsb2NhdGlvbiwgcGFyc2VyKSB7XG4gIGFkZHJlc3MgPSB0cmltTGVmdChhZGRyZXNzKTtcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgVXJsKSkge1xuICAgIHJldHVybiBuZXcgVXJsKGFkZHJlc3MsIGxvY2F0aW9uLCBwYXJzZXIpO1xuICB9XG5cbiAgdmFyIHJlbGF0aXZlLCBleHRyYWN0ZWQsIHBhcnNlLCBpbnN0cnVjdGlvbiwgaW5kZXgsIGtleVxuICAgICwgaW5zdHJ1Y3Rpb25zID0gcnVsZXMuc2xpY2UoKVxuICAgICwgdHlwZSA9IHR5cGVvZiBsb2NhdGlvblxuICAgICwgdXJsID0gdGhpc1xuICAgICwgaSA9IDA7XG5cbiAgLy9cbiAgLy8gVGhlIGZvbGxvd2luZyBpZiBzdGF0ZW1lbnRzIGFsbG93cyB0aGlzIG1vZHVsZSB0d28gaGF2ZSBjb21wYXRpYmlsaXR5IHdpdGhcbiAgLy8gMiBkaWZmZXJlbnQgQVBJOlxuICAvL1xuICAvLyAxLiBOb2RlLmpzJ3MgYHVybC5wYXJzZWAgYXBpIHdoaWNoIGFjY2VwdHMgYSBVUkwsIGJvb2xlYW4gYXMgYXJndW1lbnRzXG4gIC8vICAgIHdoZXJlIHRoZSBib29sZWFuIGluZGljYXRlcyB0aGF0IHRoZSBxdWVyeSBzdHJpbmcgc2hvdWxkIGFsc28gYmUgcGFyc2VkLlxuICAvL1xuICAvLyAyLiBUaGUgYFVSTGAgaW50ZXJmYWNlIG9mIHRoZSBicm93c2VyIHdoaWNoIGFjY2VwdHMgYSBVUkwsIG9iamVjdCBhc1xuICAvLyAgICBhcmd1bWVudHMuIFRoZSBzdXBwbGllZCBvYmplY3Qgd2lsbCBiZSB1c2VkIGFzIGRlZmF1bHQgdmFsdWVzIC8gZmFsbC1iYWNrXG4gIC8vICAgIGZvciByZWxhdGl2ZSBwYXRocy5cbiAgLy9cbiAgaWYgKCdvYmplY3QnICE9PSB0eXBlICYmICdzdHJpbmcnICE9PSB0eXBlKSB7XG4gICAgcGFyc2VyID0gbG9jYXRpb247XG4gICAgbG9jYXRpb24gPSBudWxsO1xuICB9XG5cbiAgaWYgKHBhcnNlciAmJiAnZnVuY3Rpb24nICE9PSB0eXBlb2YgcGFyc2VyKSBwYXJzZXIgPSBxcy5wYXJzZTtcblxuICBsb2NhdGlvbiA9IGxvbGNhdGlvbihsb2NhdGlvbik7XG5cbiAgLy9cbiAgLy8gRXh0cmFjdCBwcm90b2NvbCBpbmZvcm1hdGlvbiBiZWZvcmUgcnVubmluZyB0aGUgaW5zdHJ1Y3Rpb25zLlxuICAvL1xuICBleHRyYWN0ZWQgPSBleHRyYWN0UHJvdG9jb2woYWRkcmVzcyB8fCAnJywgbG9jYXRpb24pO1xuICByZWxhdGl2ZSA9ICFleHRyYWN0ZWQucHJvdG9jb2wgJiYgIWV4dHJhY3RlZC5zbGFzaGVzO1xuICB1cmwuc2xhc2hlcyA9IGV4dHJhY3RlZC5zbGFzaGVzIHx8IHJlbGF0aXZlICYmIGxvY2F0aW9uLnNsYXNoZXM7XG4gIHVybC5wcm90b2NvbCA9IGV4dHJhY3RlZC5wcm90b2NvbCB8fCBsb2NhdGlvbi5wcm90b2NvbCB8fCAnJztcbiAgYWRkcmVzcyA9IGV4dHJhY3RlZC5yZXN0O1xuXG4gIC8vXG4gIC8vIFdoZW4gdGhlIGF1dGhvcml0eSBjb21wb25lbnQgaXMgYWJzZW50IHRoZSBVUkwgc3RhcnRzIHdpdGggYSBwYXRoXG4gIC8vIGNvbXBvbmVudC5cbiAgLy9cbiAgaWYgKFxuICAgIGV4dHJhY3RlZC5wcm90b2NvbCA9PT0gJ2ZpbGU6JyAmJiAoXG4gICAgICBleHRyYWN0ZWQuc2xhc2hlc0NvdW50ICE9PSAyIHx8IHdpbmRvd3NEcml2ZUxldHRlci50ZXN0KGFkZHJlc3MpKSB8fFxuICAgICghZXh0cmFjdGVkLnNsYXNoZXMgJiZcbiAgICAgIChleHRyYWN0ZWQucHJvdG9jb2wgfHxcbiAgICAgICAgZXh0cmFjdGVkLnNsYXNoZXNDb3VudCA8IDIgfHxcbiAgICAgICAgIWlzU3BlY2lhbCh1cmwucHJvdG9jb2wpKSlcbiAgKSB7XG4gICAgaW5zdHJ1Y3Rpb25zWzNdID0gWy8oLiopLywgJ3BhdGhuYW1lJ107XG4gIH1cblxuICBmb3IgKDsgaSA8IGluc3RydWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgIGluc3RydWN0aW9uID0gaW5zdHJ1Y3Rpb25zW2ldO1xuXG4gICAgaWYgKHR5cGVvZiBpbnN0cnVjdGlvbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYWRkcmVzcyA9IGluc3RydWN0aW9uKGFkZHJlc3MsIHVybCk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBwYXJzZSA9IGluc3RydWN0aW9uWzBdO1xuICAgIGtleSA9IGluc3RydWN0aW9uWzFdO1xuXG4gICAgaWYgKHBhcnNlICE9PSBwYXJzZSkge1xuICAgICAgdXJsW2tleV0gPSBhZGRyZXNzO1xuICAgIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBwYXJzZSkge1xuICAgICAgaWYgKH4oaW5kZXggPSBhZGRyZXNzLmluZGV4T2YocGFyc2UpKSkge1xuICAgICAgICBpZiAoJ251bWJlcicgPT09IHR5cGVvZiBpbnN0cnVjdGlvblsyXSkge1xuICAgICAgICAgIHVybFtrZXldID0gYWRkcmVzcy5zbGljZSgwLCBpbmRleCk7XG4gICAgICAgICAgYWRkcmVzcyA9IGFkZHJlc3Muc2xpY2UoaW5kZXggKyBpbnN0cnVjdGlvblsyXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdXJsW2tleV0gPSBhZGRyZXNzLnNsaWNlKGluZGV4KTtcbiAgICAgICAgICBhZGRyZXNzID0gYWRkcmVzcy5zbGljZSgwLCBpbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKChpbmRleCA9IHBhcnNlLmV4ZWMoYWRkcmVzcykpKSB7XG4gICAgICB1cmxba2V5XSA9IGluZGV4WzFdO1xuICAgICAgYWRkcmVzcyA9IGFkZHJlc3Muc2xpY2UoMCwgaW5kZXguaW5kZXgpO1xuICAgIH1cblxuICAgIHVybFtrZXldID0gdXJsW2tleV0gfHwgKFxuICAgICAgcmVsYXRpdmUgJiYgaW5zdHJ1Y3Rpb25bM10gPyBsb2NhdGlvbltrZXldIHx8ICcnIDogJydcbiAgICApO1xuXG4gICAgLy9cbiAgICAvLyBIb3N0bmFtZSwgaG9zdCBhbmQgcHJvdG9jb2wgc2hvdWxkIGJlIGxvd2VyY2FzZWQgc28gdGhleSBjYW4gYmUgdXNlZCB0b1xuICAgIC8vIGNyZWF0ZSBhIHByb3BlciBgb3JpZ2luYC5cbiAgICAvL1xuICAgIGlmIChpbnN0cnVjdGlvbls0XSkgdXJsW2tleV0gPSB1cmxba2V5XS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgLy9cbiAgLy8gQWxzbyBwYXJzZSB0aGUgc3VwcGxpZWQgcXVlcnkgc3RyaW5nIGluIHRvIGFuIG9iamVjdC4gSWYgd2UncmUgc3VwcGxpZWRcbiAgLy8gd2l0aCBhIGN1c3RvbSBwYXJzZXIgYXMgZnVuY3Rpb24gdXNlIHRoYXQgaW5zdGVhZCBvZiB0aGUgZGVmYXVsdCBidWlsZC1pblxuICAvLyBwYXJzZXIuXG4gIC8vXG4gIGlmIChwYXJzZXIpIHVybC5xdWVyeSA9IHBhcnNlcih1cmwucXVlcnkpO1xuXG4gIC8vXG4gIC8vIElmIHRoZSBVUkwgaXMgcmVsYXRpdmUsIHJlc29sdmUgdGhlIHBhdGhuYW1lIGFnYWluc3QgdGhlIGJhc2UgVVJMLlxuICAvL1xuICBpZiAoXG4gICAgICByZWxhdGl2ZVxuICAgICYmIGxvY2F0aW9uLnNsYXNoZXNcbiAgICAmJiB1cmwucGF0aG5hbWUuY2hhckF0KDApICE9PSAnLydcbiAgICAmJiAodXJsLnBhdGhuYW1lICE9PSAnJyB8fCBsb2NhdGlvbi5wYXRobmFtZSAhPT0gJycpXG4gICkge1xuICAgIHVybC5wYXRobmFtZSA9IHJlc29sdmUodXJsLnBhdGhuYW1lLCBsb2NhdGlvbi5wYXRobmFtZSk7XG4gIH1cblxuICAvL1xuICAvLyBEZWZhdWx0IHRvIGEgLyBmb3IgcGF0aG5hbWUgaWYgbm9uZSBleGlzdHMuIFRoaXMgbm9ybWFsaXplcyB0aGUgVVJMXG4gIC8vIHRvIGFsd2F5cyBoYXZlIGEgL1xuICAvL1xuICBpZiAodXJsLnBhdGhuYW1lLmNoYXJBdCgwKSAhPT0gJy8nICYmIGlzU3BlY2lhbCh1cmwucHJvdG9jb2wpKSB7XG4gICAgdXJsLnBhdGhuYW1lID0gJy8nICsgdXJsLnBhdGhuYW1lO1xuICB9XG5cbiAgLy9cbiAgLy8gV2Ugc2hvdWxkIG5vdCBhZGQgcG9ydCBudW1iZXJzIGlmIHRoZXkgYXJlIGFscmVhZHkgdGhlIGRlZmF1bHQgcG9ydCBudW1iZXJcbiAgLy8gZm9yIGEgZ2l2ZW4gcHJvdG9jb2wuIEFzIHRoZSBob3N0IGFsc28gY29udGFpbnMgdGhlIHBvcnQgbnVtYmVyIHdlJ3JlIGdvaW5nXG4gIC8vIG92ZXJyaWRlIGl0IHdpdGggdGhlIGhvc3RuYW1lIHdoaWNoIGNvbnRhaW5zIG5vIHBvcnQgbnVtYmVyLlxuICAvL1xuICBpZiAoIXJlcXVpcmVkKHVybC5wb3J0LCB1cmwucHJvdG9jb2wpKSB7XG4gICAgdXJsLmhvc3QgPSB1cmwuaG9zdG5hbWU7XG4gICAgdXJsLnBvcnQgPSAnJztcbiAgfVxuXG4gIC8vXG4gIC8vIFBhcnNlIGRvd24gdGhlIGBhdXRoYCBmb3IgdGhlIHVzZXJuYW1lIGFuZCBwYXNzd29yZC5cbiAgLy9cbiAgdXJsLnVzZXJuYW1lID0gdXJsLnBhc3N3b3JkID0gJyc7XG4gIGlmICh1cmwuYXV0aCkge1xuICAgIGluc3RydWN0aW9uID0gdXJsLmF1dGguc3BsaXQoJzonKTtcbiAgICB1cmwudXNlcm5hbWUgPSBpbnN0cnVjdGlvblswXSB8fCAnJztcbiAgICB1cmwucGFzc3dvcmQgPSBpbnN0cnVjdGlvblsxXSB8fCAnJztcbiAgfVxuXG4gIHVybC5vcmlnaW4gPSB1cmwucHJvdG9jb2wgIT09ICdmaWxlOicgJiYgaXNTcGVjaWFsKHVybC5wcm90b2NvbCkgJiYgdXJsLmhvc3RcbiAgICA/IHVybC5wcm90b2NvbCArJy8vJysgdXJsLmhvc3RcbiAgICA6ICdudWxsJztcblxuICAvL1xuICAvLyBUaGUgaHJlZiBpcyBqdXN0IHRoZSBjb21waWxlZCByZXN1bHQuXG4gIC8vXG4gIHVybC5ocmVmID0gdXJsLnRvU3RyaW5nKCk7XG59XG5cbi8qKlxuICogVGhpcyBpcyBjb252ZW5pZW5jZSBtZXRob2QgZm9yIGNoYW5naW5nIHByb3BlcnRpZXMgaW4gdGhlIFVSTCBpbnN0YW5jZSB0b1xuICogaW5zdXJlIHRoYXQgdGhleSBhbGwgcHJvcGFnYXRlIGNvcnJlY3RseS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFydCAgICAgICAgICBQcm9wZXJ0eSB3ZSBuZWVkIHRvIGFkanVzdC5cbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlICAgICAgICAgIFRoZSBuZXdseSBhc3NpZ25lZCB2YWx1ZS5cbiAqIEBwYXJhbSB7Qm9vbGVhbnxGdW5jdGlvbn0gZm4gIFdoZW4gc2V0dGluZyB0aGUgcXVlcnksIGl0IHdpbGwgYmUgdGhlIGZ1bmN0aW9uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VkIHRvIHBhcnNlIHRoZSBxdWVyeS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFdoZW4gc2V0dGluZyB0aGUgcHJvdG9jb2wsIGRvdWJsZSBzbGFzaCB3aWxsIGJlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkIGZyb20gdGhlIGZpbmFsIHVybCBpZiBpdCBpcyB0cnVlLlxuICogQHJldHVybnMge1VSTH0gVVJMIGluc3RhbmNlIGZvciBjaGFpbmluZy5cbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gc2V0KHBhcnQsIHZhbHVlLCBmbikge1xuICB2YXIgdXJsID0gdGhpcztcblxuICBzd2l0Y2ggKHBhcnQpIHtcbiAgICBjYXNlICdxdWVyeSc6XG4gICAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiB2YWx1ZSAmJiB2YWx1ZS5sZW5ndGgpIHtcbiAgICAgICAgdmFsdWUgPSAoZm4gfHwgcXMucGFyc2UpKHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgdXJsW3BhcnRdID0gdmFsdWU7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3BvcnQnOlxuICAgICAgdXJsW3BhcnRdID0gdmFsdWU7XG5cbiAgICAgIGlmICghcmVxdWlyZWQodmFsdWUsIHVybC5wcm90b2NvbCkpIHtcbiAgICAgICAgdXJsLmhvc3QgPSB1cmwuaG9zdG5hbWU7XG4gICAgICAgIHVybFtwYXJ0XSA9ICcnO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSkge1xuICAgICAgICB1cmwuaG9zdCA9IHVybC5ob3N0bmFtZSArJzonKyB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdob3N0bmFtZSc6XG4gICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcblxuICAgICAgaWYgKHVybC5wb3J0KSB2YWx1ZSArPSAnOicrIHVybC5wb3J0O1xuICAgICAgdXJsLmhvc3QgPSB2YWx1ZTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnaG9zdCc6XG4gICAgICB1cmxbcGFydF0gPSB2YWx1ZTtcblxuICAgICAgaWYgKC86XFxkKyQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUuc3BsaXQoJzonKTtcbiAgICAgICAgdXJsLnBvcnQgPSB2YWx1ZS5wb3AoKTtcbiAgICAgICAgdXJsLmhvc3RuYW1lID0gdmFsdWUuam9pbignOicpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdXJsLmhvc3RuYW1lID0gdmFsdWU7XG4gICAgICAgIHVybC5wb3J0ID0gJyc7XG4gICAgICB9XG5cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncHJvdG9jb2wnOlxuICAgICAgdXJsLnByb3RvY29sID0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIHVybC5zbGFzaGVzID0gIWZuO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdwYXRobmFtZSc6XG4gICAgY2FzZSAnaGFzaCc6XG4gICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdmFyIGNoYXIgPSBwYXJ0ID09PSAncGF0aG5hbWUnID8gJy8nIDogJyMnO1xuICAgICAgICB1cmxbcGFydF0gPSB2YWx1ZS5jaGFyQXQoMCkgIT09IGNoYXIgPyBjaGFyICsgdmFsdWUgOiB2YWx1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVybFtwYXJ0XSA9IHZhbHVlO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdXJsW3BhcnRdID0gdmFsdWU7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHJ1bGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGlucyA9IHJ1bGVzW2ldO1xuXG4gICAgaWYgKGluc1s0XSkgdXJsW2luc1sxXV0gPSB1cmxbaW5zWzFdXS50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgdXJsLm9yaWdpbiA9IHVybC5wcm90b2NvbCAhPT0gJ2ZpbGU6JyAmJiBpc1NwZWNpYWwodXJsLnByb3RvY29sKSAmJiB1cmwuaG9zdFxuICAgID8gdXJsLnByb3RvY29sICsnLy8nKyB1cmwuaG9zdFxuICAgIDogJ251bGwnO1xuXG4gIHVybC5ocmVmID0gdXJsLnRvU3RyaW5nKCk7XG5cbiAgcmV0dXJuIHVybDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm0gdGhlIHByb3BlcnRpZXMgYmFjayBpbiB0byBhIHZhbGlkIGFuZCBmdWxsIFVSTCBzdHJpbmcuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5naWZ5IE9wdGlvbmFsIHF1ZXJ5IHN0cmluZ2lmeSBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtTdHJpbmd9IENvbXBpbGVkIHZlcnNpb24gb2YgdGhlIFVSTC5cbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gdG9TdHJpbmcoc3RyaW5naWZ5KSB7XG4gIGlmICghc3RyaW5naWZ5IHx8ICdmdW5jdGlvbicgIT09IHR5cGVvZiBzdHJpbmdpZnkpIHN0cmluZ2lmeSA9IHFzLnN0cmluZ2lmeTtcblxuICB2YXIgcXVlcnlcbiAgICAsIHVybCA9IHRoaXNcbiAgICAsIHByb3RvY29sID0gdXJsLnByb3RvY29sO1xuXG4gIGlmIChwcm90b2NvbCAmJiBwcm90b2NvbC5jaGFyQXQocHJvdG9jb2wubGVuZ3RoIC0gMSkgIT09ICc6JykgcHJvdG9jb2wgKz0gJzonO1xuXG4gIHZhciByZXN1bHQgPSBwcm90b2NvbCArICh1cmwuc2xhc2hlcyB8fCBpc1NwZWNpYWwodXJsLnByb3RvY29sKSA/ICcvLycgOiAnJyk7XG5cbiAgaWYgKHVybC51c2VybmFtZSkge1xuICAgIHJlc3VsdCArPSB1cmwudXNlcm5hbWU7XG4gICAgaWYgKHVybC5wYXNzd29yZCkgcmVzdWx0ICs9ICc6JysgdXJsLnBhc3N3b3JkO1xuICAgIHJlc3VsdCArPSAnQCc7XG4gIH1cblxuICByZXN1bHQgKz0gdXJsLmhvc3QgKyB1cmwucGF0aG5hbWU7XG5cbiAgcXVlcnkgPSAnb2JqZWN0JyA9PT0gdHlwZW9mIHVybC5xdWVyeSA/IHN0cmluZ2lmeSh1cmwucXVlcnkpIDogdXJsLnF1ZXJ5O1xuICBpZiAocXVlcnkpIHJlc3VsdCArPSAnPycgIT09IHF1ZXJ5LmNoYXJBdCgwKSA/ICc/JysgcXVlcnkgOiBxdWVyeTtcblxuICBpZiAodXJsLmhhc2gpIHJlc3VsdCArPSB1cmwuaGFzaDtcblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5VcmwucHJvdG90eXBlID0geyBzZXQ6IHNldCwgdG9TdHJpbmc6IHRvU3RyaW5nIH07XG5cbi8vXG4vLyBFeHBvc2UgdGhlIFVSTCBwYXJzZXIgYW5kIHNvbWUgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIHRoYXQgbWlnaHQgYmUgdXNlZnVsIGZvclxuLy8gb3RoZXJzIG9yIHRlc3RpbmcuXG4vL1xuVXJsLmV4dHJhY3RQcm90b2NvbCA9IGV4dHJhY3RQcm90b2NvbDtcblVybC5sb2NhdGlvbiA9IGxvbGNhdGlvbjtcblVybC50cmltTGVmdCA9IHRyaW1MZWZ0O1xuVXJsLnFzID0gcXM7XG5cbm1vZHVsZS5leHBvcnRzID0gVXJsO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmNsYXNzIEF1dGhFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKCdBdXRob3JpemF0aW9uIHJlcXVpcmVkJylcbiAgICB0aGlzLm5hbWUgPSAnQXV0aEVycm9yJ1xuICAgIHRoaXMuaXNBdXRoRXJyb3IgPSB0cnVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBdXRoRXJyb3JcbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50JylcbmNvbnN0IHRva2VuU3RvcmFnZSA9IHJlcXVpcmUoJy4vdG9rZW5TdG9yYWdlJylcblxuY29uc3QgZ2V0TmFtZSA9IChpZCkgPT4ge1xuICByZXR1cm4gaWQuc3BsaXQoJy0nKS5tYXAoKHMpID0+IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnNsaWNlKDEpKS5qb2luKCcgJylcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBQcm92aWRlciBleHRlbmRzIFJlcXVlc3RDbGllbnQge1xuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHN1cGVyKHVwcHksIG9wdHMpXG4gICAgdGhpcy5wcm92aWRlciA9IG9wdHMucHJvdmlkZXJcbiAgICB0aGlzLmlkID0gdGhpcy5wcm92aWRlclxuICAgIHRoaXMubmFtZSA9IHRoaXMub3B0cy5uYW1lIHx8IGdldE5hbWUodGhpcy5pZClcbiAgICB0aGlzLnBsdWdpbklkID0gdGhpcy5vcHRzLnBsdWdpbklkXG4gICAgdGhpcy50b2tlbktleSA9IGBjb21wYW5pb24tJHt0aGlzLnBsdWdpbklkfS1hdXRoLXRva2VuYFxuICAgIHRoaXMuY29tcGFuaW9uS2V5c1BhcmFtcyA9IHRoaXMub3B0cy5jb21wYW5pb25LZXlzUGFyYW1zXG4gICAgdGhpcy5wcmVBdXRoVG9rZW4gPSBudWxsXG4gIH1cblxuICBoZWFkZXJzICgpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwoW3N1cGVyLmhlYWRlcnMoKSwgdGhpcy5nZXRBdXRoVG9rZW4oKV0pXG4gICAgICAudGhlbigoW2hlYWRlcnMsIHRva2VuXSkgPT4ge1xuICAgICAgICBjb25zdCBhdXRoSGVhZGVycyA9IHt9XG4gICAgICAgIGlmICh0b2tlbikge1xuICAgICAgICAgIGF1dGhIZWFkZXJzWyd1cHB5LWF1dGgtdG9rZW4nXSA9IHRva2VuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jb21wYW5pb25LZXlzUGFyYW1zKSB7XG4gICAgICAgICAgYXV0aEhlYWRlcnNbJ3VwcHktY3JlZGVudGlhbHMtcGFyYW1zJ10gPSBidG9hKFxuICAgICAgICAgICAgSlNPTi5zdHJpbmdpZnkoeyBwYXJhbXM6IHRoaXMuY29tcGFuaW9uS2V5c1BhcmFtcyB9KSxcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHsgLi4uaGVhZGVycywgLi4uYXV0aEhlYWRlcnMgfVxuICAgICAgfSlcbiAgfVxuXG4gIG9uUmVjZWl2ZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIHJlc3BvbnNlID0gc3VwZXIub25SZWNlaXZlUmVzcG9uc2UocmVzcG9uc2UpXG4gICAgY29uc3QgcGx1Z2luID0gdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKVxuICAgIGNvbnN0IG9sZEF1dGhlbnRpY2F0ZWQgPSBwbHVnaW4uZ2V0UGx1Z2luU3RhdGUoKS5hdXRoZW50aWNhdGVkXG4gICAgY29uc3QgYXV0aGVudGljYXRlZCA9IG9sZEF1dGhlbnRpY2F0ZWQgPyByZXNwb25zZS5zdGF0dXMgIT09IDQwMSA6IHJlc3BvbnNlLnN0YXR1cyA8IDQwMFxuICAgIHBsdWdpbi5zZXRQbHVnaW5TdGF0ZSh7IGF1dGhlbnRpY2F0ZWQgfSlcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHNldEF1dGhUb2tlbiAodG9rZW4pIHtcbiAgICByZXR1cm4gdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLnNldEl0ZW0odGhpcy50b2tlbktleSwgdG9rZW4pXG4gIH1cblxuICBnZXRBdXRoVG9rZW4gKCkge1xuICAgIHJldHVybiB0aGlzLnVwcHkuZ2V0UGx1Z2luKHRoaXMucGx1Z2luSWQpLnN0b3JhZ2UuZ2V0SXRlbSh0aGlzLnRva2VuS2V5KVxuICB9XG5cbiAgYXV0aFVybCAocXVlcmllcyA9IHt9KSB7XG4gICAgaWYgKHRoaXMucHJlQXV0aFRva2VuKSB7XG4gICAgICBxdWVyaWVzLnVwcHlQcmVBdXRoVG9rZW4gPSB0aGlzLnByZUF1dGhUb2tlblxuICAgIH1cblxuICAgIHJldHVybiBgJHt0aGlzLmhvc3RuYW1lfS8ke3RoaXMuaWR9L2Nvbm5lY3Q/JHtuZXcgVVJMU2VhcmNoUGFyYW1zKHF1ZXJpZXMpfWBcbiAgfVxuXG4gIGZpbGVVcmwgKGlkKSB7XG4gICAgcmV0dXJuIGAke3RoaXMuaG9zdG5hbWV9LyR7dGhpcy5pZH0vZ2V0LyR7aWR9YFxuICB9XG5cbiAgZmV0Y2hQcmVBdXRoVG9rZW4gKCkge1xuICAgIGlmICghdGhpcy5jb21wYW5pb25LZXlzUGFyYW1zKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5wb3N0KGAke3RoaXMuaWR9L3ByZWF1dGgvYCwgeyBwYXJhbXM6IHRoaXMuY29tcGFuaW9uS2V5c1BhcmFtcyB9KVxuICAgICAgLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICB0aGlzLnByZUF1dGhUb2tlbiA9IHJlcy50b2tlblxuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLnVwcHkubG9nKGBbQ29tcGFuaW9uQ2xpZW50XSB1bmFibGUgdG8gZmV0Y2ggcHJlQXV0aFRva2VuICR7ZXJyfWAsICd3YXJuaW5nJylcbiAgICAgIH0pXG4gIH1cblxuICBsaXN0IChkaXJlY3RvcnkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoYCR7dGhpcy5pZH0vbGlzdC8ke2RpcmVjdG9yeSB8fCAnJ31gKVxuICB9XG5cbiAgbG9nb3V0ICgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoYCR7dGhpcy5pZH0vbG9nb3V0YClcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gUHJvbWlzZS5hbGwoW1xuICAgICAgICByZXNwb25zZSxcbiAgICAgICAgdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLnBsdWdpbklkKS5zdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy50b2tlbktleSksXG4gICAgICBdKSkudGhlbigoW3Jlc3BvbnNlXSkgPT4gcmVzcG9uc2UpXG4gIH1cblxuICBzdGF0aWMgaW5pdFBsdWdpbiAocGx1Z2luLCBvcHRzLCBkZWZhdWx0T3B0cykge1xuICAgIHBsdWdpbi50eXBlID0gJ2FjcXVpcmVyJ1xuICAgIHBsdWdpbi5maWxlcyA9IFtdXG4gICAgaWYgKGRlZmF1bHRPcHRzKSB7XG4gICAgICBwbHVnaW4ub3B0cyA9IHsgLi4uZGVmYXVsdE9wdHMsIC4uLm9wdHMgfVxuICAgIH1cblxuICAgIGlmIChvcHRzLnNlcnZlclVybCB8fCBvcHRzLnNlcnZlclBhdHRlcm4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignYHNlcnZlclVybGAgYW5kIGBzZXJ2ZXJQYXR0ZXJuYCBoYXZlIGJlZW4gcmVuYW1lZCB0byBgY29tcGFuaW9uVXJsYCBhbmQgYGNvbXBhbmlvbkFsbG93ZWRIb3N0c2AgcmVzcGVjdGl2ZWx5IGluIHRoZSAwLjMwLjUgcmVsZWFzZS4gUGxlYXNlIGNvbnN1bHQgdGhlIGRvY3MgKGZvciBleGFtcGxlLCBodHRwczovL3VwcHkuaW8vZG9jcy9pbnN0YWdyYW0vIGZvciB0aGUgSW5zdGFncmFtIHBsdWdpbikgYW5kIHVzZSB0aGUgdXBkYXRlZCBvcHRpb25zLmAnKVxuICAgIH1cblxuICAgIGlmIChvcHRzLmNvbXBhbmlvbkFsbG93ZWRIb3N0cykge1xuICAgICAgY29uc3QgcGF0dGVybiA9IG9wdHMuY29tcGFuaW9uQWxsb3dlZEhvc3RzXG4gICAgICAvLyB2YWxpZGF0ZSBjb21wYW5pb25BbGxvd2VkSG9zdHMgcGFyYW1cbiAgICAgIGlmICh0eXBlb2YgcGF0dGVybiAhPT0gJ3N0cmluZycgJiYgIUFycmF5LmlzQXJyYXkocGF0dGVybikgJiYgIShwYXR0ZXJuIGluc3RhbmNlb2YgUmVnRXhwKSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGAke3BsdWdpbi5pZH06IHRoZSBvcHRpb24gXCJjb21wYW5pb25BbGxvd2VkSG9zdHNcIiBtdXN0IGJlIG9uZSBvZiBzdHJpbmcsIEFycmF5LCBSZWdFeHBgKVxuICAgICAgfVxuICAgICAgcGx1Z2luLm9wdHMuY29tcGFuaW9uQWxsb3dlZEhvc3RzID0gcGF0dGVyblxuICAgIH0gZWxzZSBpZiAoL14oPyFodHRwcz86XFwvXFwvKS4qJC9pLnRlc3Qob3B0cy5jb21wYW5pb25VcmwpKSB7XG4gICAgICAvLyBkb2VzIG5vdCBzdGFydCB3aXRoIGh0dHBzOi8vXG4gICAgICBwbHVnaW4ub3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMgPSBgaHR0cHM6Ly8ke29wdHMuY29tcGFuaW9uVXJsLnJlcGxhY2UoL15cXC9cXC8vLCAnJyl9YFxuICAgIH0gZWxzZSB7XG4gICAgICBwbHVnaW4ub3B0cy5jb21wYW5pb25BbGxvd2VkSG9zdHMgPSBuZXcgVVJMKG9wdHMuY29tcGFuaW9uVXJsKS5vcmlnaW5cbiAgICB9XG5cbiAgICBwbHVnaW4uc3RvcmFnZSA9IHBsdWdpbi5vcHRzLnN0b3JhZ2UgfHwgdG9rZW5TdG9yYWdlXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBmZXRjaFdpdGhOZXR3b3JrRXJyb3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZmV0Y2hXaXRoTmV0d29ya0Vycm9yJylcbmNvbnN0IEF1dGhFcnJvciA9IHJlcXVpcmUoJy4vQXV0aEVycm9yJylcblxuLy8gUmVtb3ZlIHRoZSB0cmFpbGluZyBzbGFzaCBzbyB3ZSBjYW4gYWx3YXlzIHNhZmVseSBhcHBlbmQgL3h5ei5cbmZ1bmN0aW9uIHN0cmlwU2xhc2ggKHVybCkge1xuICByZXR1cm4gdXJsLnJlcGxhY2UoL1xcLyQvLCAnJylcbn1cblxuYXN5bmMgZnVuY3Rpb24gaGFuZGxlSlNPTlJlc3BvbnNlIChyZXMpIHtcbiAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMSkge1xuICAgIHRocm93IG5ldyBBdXRoRXJyb3IoKVxuICB9XG5cbiAgY29uc3QganNvblByb21pc2UgPSByZXMuanNvbigpXG5cbiAgaWYgKHJlcy5zdGF0dXMgPCAyMDAgfHwgcmVzLnN0YXR1cyA+IDMwMCkge1xuICAgIGxldCBlcnJNc2cgPSBgRmFpbGVkIHJlcXVlc3Qgd2l0aCBzdGF0dXM6ICR7cmVzLnN0YXR1c30uICR7cmVzLnN0YXR1c1RleHR9YFxuICAgIHRyeSB7XG4gICAgICBjb25zdCBlcnJEYXRhID0gYXdhaXQganNvblByb21pc2VcbiAgICAgIGVyck1zZyA9IGVyckRhdGEubWVzc2FnZSA/IGAke2Vyck1zZ30gbWVzc2FnZTogJHtlcnJEYXRhLm1lc3NhZ2V9YCA6IGVyck1zZ1xuICAgICAgZXJyTXNnID0gZXJyRGF0YS5yZXF1ZXN0SWQgPyBgJHtlcnJNc2d9IHJlcXVlc3QtSWQ6ICR7ZXJyRGF0YS5yZXF1ZXN0SWR9YCA6IGVyck1zZ1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5zYWZlLWZpbmFsbHlcbiAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpXG4gICAgfVxuICB9XG4gIHJldHVybiBqc29uUHJvbWlzZVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFJlcXVlc3RDbGllbnQge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZ2xvYmFsLXJlcXVpcmVcbiAgc3RhdGljIFZFUlNJT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uXG5cbiAgI2dldFBvc3RSZXNwb25zZUZ1bmMgPSBza2lwID0+IHJlc3BvbnNlID0+IChza2lwID8gcmVzcG9uc2UgOiB0aGlzLm9uUmVjZWl2ZVJlc3BvbnNlKHJlc3BvbnNlKSlcblxuICBjb25zdHJ1Y3RvciAodXBweSwgb3B0cykge1xuICAgIHRoaXMudXBweSA9IHVwcHlcbiAgICB0aGlzLm9wdHMgPSBvcHRzXG4gICAgdGhpcy5vblJlY2VpdmVSZXNwb25zZSA9IHRoaXMub25SZWNlaXZlUmVzcG9uc2UuYmluZCh0aGlzKVxuICAgIHRoaXMuYWxsb3dlZEhlYWRlcnMgPSBbJ2FjY2VwdCcsICdjb250ZW50LXR5cGUnLCAndXBweS1hdXRoLXRva2VuJ11cbiAgICB0aGlzLnByZWZsaWdodERvbmUgPSBmYWxzZVxuICB9XG5cbiAgZ2V0IGhvc3RuYW1lICgpIHtcbiAgICBjb25zdCB7IGNvbXBhbmlvbiB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmNvbXBhbmlvblVybFxuICAgIHJldHVybiBzdHJpcFNsYXNoKGNvbXBhbmlvbiAmJiBjb21wYW5pb25baG9zdF0gPyBjb21wYW5pb25baG9zdF0gOiBob3N0KVxuICB9XG5cbiAgc3RhdGljIGRlZmF1bHRIZWFkZXJzID17XG4gICAgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAnVXBweS1WZXJzaW9ucyc6IGBAdXBweS9jb21wYW5pb24tY2xpZW50PSR7UmVxdWVzdENsaWVudC5WRVJTSU9OfWAsXG4gIH1cblxuICBoZWFkZXJzICgpIHtcbiAgICBjb25zdCB1c2VySGVhZGVycyA9IHRoaXMub3B0cy5jb21wYW5pb25IZWFkZXJzIHx8IHt9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAuLi5SZXF1ZXN0Q2xpZW50LmRlZmF1bHRIZWFkZXJzLFxuICAgICAgLi4udXNlckhlYWRlcnMsXG4gICAgfSlcbiAgfVxuXG4gIG9uUmVjZWl2ZVJlc3BvbnNlIChyZXNwb25zZSkge1xuICAgIGNvbnN0IHN0YXRlID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICBjb25zdCBjb21wYW5pb24gPSBzdGF0ZS5jb21wYW5pb24gfHwge31cbiAgICBjb25zdCBob3N0ID0gdGhpcy5vcHRzLmNvbXBhbmlvblVybFxuICAgIGNvbnN0IHsgaGVhZGVycyB9ID0gcmVzcG9uc2VcbiAgICAvLyBTdG9yZSB0aGUgc2VsZi1pZGVudGlmaWVkIGRvbWFpbiBuYW1lIGZvciB0aGUgQ29tcGFuaW9uIGluc3RhbmNlIHdlIGp1c3QgaGl0LlxuICAgIGlmIChoZWFkZXJzLmhhcygnaS1hbScpICYmIGhlYWRlcnMuZ2V0KCdpLWFtJykgIT09IGNvbXBhbmlvbltob3N0XSkge1xuICAgICAgdGhpcy51cHB5LnNldFN0YXRlKHtcbiAgICAgICAgY29tcGFuaW9uOiB7IC4uLmNvbXBhbmlvbiwgW2hvc3RdOiBoZWFkZXJzLmdldCgnaS1hbScpIH0sXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gICNnZXRVcmwgKHVybCkge1xuICAgIGlmICgvXihodHRwcz86fClcXC9cXC8vLnRlc3QodXJsKSkge1xuICAgICAgcmV0dXJuIHVybFxuICAgIH1cbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vJHt1cmx9YFxuICB9XG5cbiAgI2Vycm9ySGFuZGxlciAobWV0aG9kLCBwYXRoKSB7XG4gICAgcmV0dXJuIChlcnIpID0+IHtcbiAgICAgIGlmICghZXJyPy5pc0F1dGhFcnJvcikge1xuICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihgQ291bGQgbm90ICR7bWV0aG9kfSAke3RoaXMuI2dldFVybChwYXRoKX1gKVxuICAgICAgICBlcnJvci5jYXVzZSA9IGVyclxuICAgICAgICBlcnIgPSBlcnJvciAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICB9XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKVxuICAgIH1cbiAgfVxuXG4gIHByZWZsaWdodCAocGF0aCkge1xuICAgIGlmICh0aGlzLnByZWZsaWdodERvbmUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5hbGxvd2VkSGVhZGVycy5zbGljZSgpKVxuICAgIH1cblxuICAgIHJldHVybiBmZXRjaCh0aGlzLiNnZXRVcmwocGF0aCksIHtcbiAgICAgIG1ldGhvZDogJ09QVElPTlMnLFxuICAgIH0pXG4gICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLmhlYWRlcnMuaGFzKCdhY2Nlc3MtY29udHJvbC1hbGxvdy1oZWFkZXJzJykpIHtcbiAgICAgICAgICB0aGlzLmFsbG93ZWRIZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ2FjY2Vzcy1jb250cm9sLWFsbG93LWhlYWRlcnMnKVxuICAgICAgICAgICAgLnNwbGl0KCcsJykubWFwKChoZWFkZXJOYW1lKSA9PiBoZWFkZXJOYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlZmxpZ2h0RG9uZSA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxsb3dlZEhlYWRlcnMuc2xpY2UoKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5sb2coYFtDb21wYW5pb25DbGllbnRdIHVuYWJsZSB0byBtYWtlIHByZWZsaWdodCByZXF1ZXN0ICR7ZXJyfWAsICd3YXJuaW5nJylcbiAgICAgICAgdGhpcy5wcmVmbGlnaHREb25lID0gdHJ1ZVxuICAgICAgICByZXR1cm4gdGhpcy5hbGxvd2VkSGVhZGVycy5zbGljZSgpXG4gICAgICB9KVxuICB9XG5cbiAgcHJlZmxpZ2h0QW5kSGVhZGVycyAocGF0aCkge1xuICAgIHJldHVybiBQcm9taXNlLmFsbChbdGhpcy5wcmVmbGlnaHQocGF0aCksIHRoaXMuaGVhZGVycygpXSlcbiAgICAgIC50aGVuKChbYWxsb3dlZEhlYWRlcnMsIGhlYWRlcnNdKSA9PiB7XG4gICAgICAgIC8vIGZpbHRlciB0byBrZWVwIG9ubHkgYWxsb3dlZCBIZWFkZXJzXG4gICAgICAgIE9iamVjdC5rZXlzKGhlYWRlcnMpLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgICAgICAgIGlmICghYWxsb3dlZEhlYWRlcnMuaW5jbHVkZXMoaGVhZGVyLnRvTG93ZXJDYXNlKCkpKSB7XG4gICAgICAgICAgICB0aGlzLnVwcHkubG9nKGBbQ29tcGFuaW9uQ2xpZW50XSBleGNsdWRpbmcgZGlzYWxsb3dlZCBoZWFkZXIgJHtoZWFkZXJ9YClcbiAgICAgICAgICAgIGRlbGV0ZSBoZWFkZXJzW2hlYWRlcl0gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICByZXR1cm4gaGVhZGVyc1xuICAgICAgfSlcbiAgfVxuXG4gIGdldCAocGF0aCwgc2tpcFBvc3RSZXNwb25zZSkge1xuICAgIGNvbnN0IG1ldGhvZCA9ICdnZXQnXG4gICAgcmV0dXJuIHRoaXMucHJlZmxpZ2h0QW5kSGVhZGVycyhwYXRoKVxuICAgICAgLnRoZW4oKGhlYWRlcnMpID0+IGZldGNoV2l0aE5ldHdvcmtFcnJvcih0aGlzLiNnZXRVcmwocGF0aCksIHtcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjcmVkZW50aWFsczogdGhpcy5vcHRzLmNvbXBhbmlvbkNvb2tpZXNSdWxlIHx8ICdzYW1lLW9yaWdpbicsXG4gICAgICB9KSlcbiAgICAgIC50aGVuKHRoaXMuI2dldFBvc3RSZXNwb25zZUZ1bmMoc2tpcFBvc3RSZXNwb25zZSkpXG4gICAgICAudGhlbihoYW5kbGVKU09OUmVzcG9uc2UpXG4gICAgICAuY2F0Y2godGhpcy4jZXJyb3JIYW5kbGVyKG1ldGhvZCwgcGF0aCkpXG4gIH1cblxuICBwb3N0IChwYXRoLCBkYXRhLCBza2lwUG9zdFJlc3BvbnNlKSB7XG4gICAgY29uc3QgbWV0aG9kID0gJ3Bvc3QnXG4gICAgcmV0dXJuIHRoaXMucHJlZmxpZ2h0QW5kSGVhZGVycyhwYXRoKVxuICAgICAgLnRoZW4oKGhlYWRlcnMpID0+IGZldGNoV2l0aE5ldHdvcmtFcnJvcih0aGlzLiNnZXRVcmwocGF0aCksIHtcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjcmVkZW50aWFsczogdGhpcy5vcHRzLmNvbXBhbmlvbkNvb2tpZXNSdWxlIHx8ICdzYW1lLW9yaWdpbicsXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgICAgfSkpXG4gICAgICAudGhlbih0aGlzLiNnZXRQb3N0UmVzcG9uc2VGdW5jKHNraXBQb3N0UmVzcG9uc2UpKVxuICAgICAgLnRoZW4oaGFuZGxlSlNPTlJlc3BvbnNlKVxuICAgICAgLmNhdGNoKHRoaXMuI2Vycm9ySGFuZGxlcihtZXRob2QsIHBhdGgpKVxuICB9XG5cbiAgZGVsZXRlIChwYXRoLCBkYXRhLCBza2lwUG9zdFJlc3BvbnNlKSB7XG4gICAgY29uc3QgbWV0aG9kID0gJ2RlbGV0ZSdcbiAgICByZXR1cm4gdGhpcy5wcmVmbGlnaHRBbmRIZWFkZXJzKHBhdGgpXG4gICAgICAudGhlbigoaGVhZGVycykgPT4gZmV0Y2hXaXRoTmV0d29ya0Vycm9yKGAke3RoaXMuaG9zdG5hbWV9LyR7cGF0aH1gLCB7XG4gICAgICAgIG1ldGhvZCxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY3JlZGVudGlhbHM6IHRoaXMub3B0cy5jb21wYW5pb25Db29raWVzUnVsZSB8fCAnc2FtZS1vcmlnaW4nLFxuICAgICAgICBib2R5OiBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiBudWxsLFxuICAgICAgfSkpXG4gICAgICAudGhlbih0aGlzLiNnZXRQb3N0UmVzcG9uc2VGdW5jKHNraXBQb3N0UmVzcG9uc2UpKVxuICAgICAgLnRoZW4oaGFuZGxlSlNPTlJlc3BvbnNlKVxuICAgICAgLmNhdGNoKHRoaXMuI2Vycm9ySGFuZGxlcihtZXRob2QsIHBhdGgpKVxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgUmVxdWVzdENsaWVudCA9IHJlcXVpcmUoJy4vUmVxdWVzdENsaWVudCcpXG5cbmNvbnN0IGdldE5hbWUgPSAoaWQpID0+IHtcbiAgcmV0dXJuIGlkLnNwbGl0KCctJykubWFwKChzKSA9PiBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKSkuam9pbignICcpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2VhcmNoUHJvdmlkZXIgZXh0ZW5kcyBSZXF1ZXN0Q2xpZW50IHtcbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMucHJvdmlkZXIgPSBvcHRzLnByb3ZpZGVyXG4gICAgdGhpcy5pZCA9IHRoaXMucHJvdmlkZXJcbiAgICB0aGlzLm5hbWUgPSB0aGlzLm9wdHMubmFtZSB8fCBnZXROYW1lKHRoaXMuaWQpXG4gICAgdGhpcy5wbHVnaW5JZCA9IHRoaXMub3B0cy5wbHVnaW5JZFxuICB9XG5cbiAgZmlsZVVybCAoaWQpIHtcbiAgICByZXR1cm4gYCR7dGhpcy5ob3N0bmFtZX0vc2VhcmNoLyR7dGhpcy5pZH0vZ2V0LyR7aWR9YFxuICB9XG5cbiAgc2VhcmNoICh0ZXh0LCBxdWVyaWVzKSB7XG4gICAgcXVlcmllcyA9IHF1ZXJpZXMgPyBgJiR7cXVlcmllc31gIDogJydcbiAgICByZXR1cm4gdGhpcy5nZXQoYHNlYXJjaC8ke3RoaXMuaWR9L2xpc3Q/cT0ke2VuY29kZVVSSUNvbXBvbmVudCh0ZXh0KX0ke3F1ZXJpZXN9YClcbiAgfVxufVxuIiwiY29uc3QgZWUgPSByZXF1aXJlKCduYW1lc3BhY2UtZW1pdHRlcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVXBweVNvY2tldCB7XG4gICNxdWV1ZWQgPSBbXVxuXG4gICNlbWl0dGVyID0gZWUoKVxuXG4gICNpc09wZW4gPSBmYWxzZVxuXG4gICNzb2NrZXRcblxuICBjb25zdHJ1Y3RvciAob3B0cykge1xuICAgIHRoaXMub3B0cyA9IG9wdHNcblxuICAgIGlmICghb3B0cyB8fCBvcHRzLmF1dG9PcGVuICE9PSBmYWxzZSkge1xuICAgICAgdGhpcy5vcGVuKClcbiAgICB9XG4gIH1cblxuICBnZXQgaXNPcGVuICgpIHsgcmV0dXJuIHRoaXMuI2lzT3BlbiB9XG5cbiAgW1N5bWJvbC5mb3IoJ3VwcHkgdGVzdDogZ2V0U29ja2V0JyldICgpIHsgcmV0dXJuIHRoaXMuI3NvY2tldCB9XG5cbiAgW1N5bWJvbC5mb3IoJ3VwcHkgdGVzdDogZ2V0UXVldWVkJyldICgpIHsgcmV0dXJuIHRoaXMuI3F1ZXVlZCB9XG5cbiAgb3BlbiAoKSB7XG4gICAgdGhpcy4jc29ja2V0ID0gbmV3IFdlYlNvY2tldCh0aGlzLm9wdHMudGFyZ2V0KVxuXG4gICAgdGhpcy4jc29ja2V0Lm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuI2lzT3BlbiA9IHRydWVcblxuICAgICAgd2hpbGUgKHRoaXMuI3F1ZXVlZC5sZW5ndGggPiAwICYmIHRoaXMuI2lzT3Blbikge1xuICAgICAgICBjb25zdCBmaXJzdCA9IHRoaXMuI3F1ZXVlZC5zaGlmdCgpXG4gICAgICAgIHRoaXMuc2VuZChmaXJzdC5hY3Rpb24sIGZpcnN0LnBheWxvYWQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy4jc29ja2V0Lm9uY2xvc2UgPSAoKSA9PiB7XG4gICAgICB0aGlzLiNpc09wZW4gPSBmYWxzZVxuICAgIH1cblxuICAgIHRoaXMuI3NvY2tldC5vbm1lc3NhZ2UgPSB0aGlzLiNoYW5kbGVNZXNzYWdlXG4gIH1cblxuICBjbG9zZSAoKSB7XG4gICAgdGhpcy4jc29ja2V0Py5jbG9zZSgpXG4gIH1cblxuICBzZW5kIChhY3Rpb24sIHBheWxvYWQpIHtcbiAgICAvLyBhdHRhY2ggdXVpZFxuXG4gICAgaWYgKCF0aGlzLiNpc09wZW4pIHtcbiAgICAgIHRoaXMuI3F1ZXVlZC5wdXNoKHsgYWN0aW9uLCBwYXlsb2FkIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLiNzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICBhY3Rpb24sXG4gICAgICBwYXlsb2FkLFxuICAgIH0pKVxuICB9XG5cbiAgb24gKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuI2VtaXR0ZXIub24oYWN0aW9uLCBoYW5kbGVyKVxuICB9XG5cbiAgZW1pdCAoYWN0aW9uLCBwYXlsb2FkKSB7XG4gICAgdGhpcy4jZW1pdHRlci5lbWl0KGFjdGlvbiwgcGF5bG9hZClcbiAgfVxuXG4gIG9uY2UgKGFjdGlvbiwgaGFuZGxlcikge1xuICAgIHRoaXMuI2VtaXR0ZXIub25jZShhY3Rpb24sIGhhbmRsZXIpXG4gIH1cblxuICAjaGFuZGxlTWVzc2FnZT0gKGUpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UoZS5kYXRhKVxuICAgICAgdGhpcy5lbWl0KG1lc3NhZ2UuYWN0aW9uLCBtZXNzYWdlLnBheWxvYWQpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBUT0RPOiB1c2UgYSBtb3JlIHJvYnVzdCBlcnJvciBoYW5kbGVyLlxuICAgICAgY29uc29sZS5sb2coZXJyKSAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICB9XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKipcbiAqIE1hbmFnZXMgY29tbXVuaWNhdGlvbnMgd2l0aCBDb21wYW5pb25cbiAqL1xuXG5jb25zdCBSZXF1ZXN0Q2xpZW50ID0gcmVxdWlyZSgnLi9SZXF1ZXN0Q2xpZW50JylcbmNvbnN0IFByb3ZpZGVyID0gcmVxdWlyZSgnLi9Qcm92aWRlcicpXG5jb25zdCBTZWFyY2hQcm92aWRlciA9IHJlcXVpcmUoJy4vU2VhcmNoUHJvdmlkZXInKVxuY29uc3QgU29ja2V0ID0gcmVxdWlyZSgnLi9Tb2NrZXQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgUmVxdWVzdENsaWVudCxcbiAgUHJvdmlkZXIsXG4gIFNlYXJjaFByb3ZpZGVyLFxuICBTb2NrZXQsXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyoqXG4gKiBUaGlzIG1vZHVsZSBzZXJ2ZXMgYXMgYW4gQXN5bmMgd3JhcHBlciBmb3IgTG9jYWxTdG9yYWdlXG4gKi9cbm1vZHVsZS5leHBvcnRzLnNldEl0ZW0gPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKVxuICAgIHJlc29sdmUoKVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRJdGVtID0gKGtleSkgPT4ge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpXG59XG5cbm1vZHVsZS5leHBvcnRzLnJlbW92ZUl0ZW0gPSAoa2V5KSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSlcbiAgICByZXNvbHZlKClcbiAgfSlcbn1cbiIsIi8qKlxuICogQ29yZSBwbHVnaW4gbG9naWMgdGhhdCBhbGwgcGx1Z2lucyBzaGFyZS5cbiAqXG4gKiBCYXNlUGx1Z2luIGRvZXMgbm90IGNvbnRhaW4gRE9NIHJlbmRlcmluZyBzbyBpdCBjYW4gYmUgdXNlZCBmb3IgcGx1Z2luc1xuICogd2l0aG91dCBhIHVzZXIgaW50ZXJmYWNlLlxuICpcbiAqIFNlZSBgUGx1Z2luYCBmb3IgdGhlIGV4dGVuZGVkIHZlcnNpb24gd2l0aCBQcmVhY3QgcmVuZGVyaW5nIGZvciBpbnRlcmZhY2VzLlxuICovXG5cbmNvbnN0IFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQmFzZVBsdWdpbiB7XG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzID0ge30pIHtcbiAgICB0aGlzLnVwcHkgPSB1cHB5XG4gICAgdGhpcy5vcHRzID0gb3B0c1xuICB9XG5cbiAgZ2V0UGx1Z2luU3RhdGUgKCkge1xuICAgIGNvbnN0IHsgcGx1Z2lucyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcbiAgICByZXR1cm4gcGx1Z2luc1t0aGlzLmlkXSB8fCB7fVxuICB9XG5cbiAgc2V0UGx1Z2luU3RhdGUgKHVwZGF0ZSkge1xuICAgIGNvbnN0IHsgcGx1Z2lucyB9ID0gdGhpcy51cHB5LmdldFN0YXRlKClcblxuICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICBwbHVnaW5zOiB7XG4gICAgICAgIC4uLnBsdWdpbnMsXG4gICAgICAgIFt0aGlzLmlkXToge1xuICAgICAgICAgIC4uLnBsdWdpbnNbdGhpcy5pZF0sXG4gICAgICAgICAgLi4udXBkYXRlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KVxuICB9XG5cbiAgc2V0T3B0aW9ucyAobmV3T3B0cykge1xuICAgIHRoaXMub3B0cyA9IHsgLi4udGhpcy5vcHRzLCAuLi5uZXdPcHRzIH1cbiAgICB0aGlzLnNldFBsdWdpblN0YXRlKCkgLy8gc28gdGhhdCBVSSByZS1yZW5kZXJzIHdpdGggbmV3IG9wdGlvbnNcbiAgICB0aGlzLmkxOG5Jbml0KClcbiAgfVxuXG4gIGkxOG5Jbml0ICgpIHtcbiAgICBjb25zdCB0cmFuc2xhdG9yID0gbmV3IFRyYW5zbGF0b3IoW3RoaXMuZGVmYXVsdExvY2FsZSwgdGhpcy51cHB5LmxvY2FsZSwgdGhpcy5vcHRzLmxvY2FsZV0pXG4gICAgdGhpcy5pMThuID0gdHJhbnNsYXRvci50cmFuc2xhdGUuYmluZCh0cmFuc2xhdG9yKVxuICAgIHRoaXMuaTE4bkFycmF5ID0gdHJhbnNsYXRvci50cmFuc2xhdGVBcnJheS5iaW5kKHRyYW5zbGF0b3IpXG4gICAgdGhpcy5zZXRQbHVnaW5TdGF0ZSgpIC8vIHNvIHRoYXQgVUkgcmUtcmVuZGVycyBhbmQgd2Ugc2VlIHRoZSB1cGRhdGVkIGxvY2FsZVxuICB9XG5cbiAgLyoqXG4gICAqIEV4dGVuZGFibGUgbWV0aG9kc1xuICAgKiA9PT09PT09PT09PT09PT09PT1cbiAgICogVGhlc2UgbWV0aG9kcyBhcmUgaGVyZSB0byBzZXJ2ZSBhcyBhbiBvdmVydmlldyBvZiB0aGUgZXh0ZW5kYWJsZSBtZXRob2RzIGFzIHdlbGwgYXNcbiAgICogbWFraW5nIHRoZW0gbm90IGNvbmRpdGlvbmFsIGluIHVzZSwgc3VjaCBhcyBgaWYgKHRoaXMuYWZ0ZXJVcGRhdGUpYC5cbiAgICovXG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgYWRkVGFyZ2V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4dGVuZCB0aGUgYWRkVGFyZ2V0IG1ldGhvZCB0byBhZGQgeW91ciBwbHVnaW4gdG8gYW5vdGhlciBwbHVnaW5cXCdzIHRhcmdldCcpXG4gIH1cblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2xhc3MtbWV0aG9kcy11c2UtdGhpc1xuICBpbnN0YWxsICgpIHt9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgdW5pbnN0YWxsICgpIHt9XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIHBsdWdpbiBpcyBtb3VudGVkLCB3aGV0aGVyIGluIERPTSBvciBpbnRvIGFub3RoZXIgcGx1Z2luLlxuICAgKiBOZWVkZWQgYmVjYXVzZSBzb21ldGltZXMgcGx1Z2lucyBhcmUgbW91bnRlZCBzZXBhcmF0ZWx5L2FmdGVyIGBpbnN0YWxsYCxcbiAgICogc28gdGhpcy5lbCBhbmQgdGhpcy5wYXJlbnQgbWlnaHQgbm90IGJlIGF2YWlsYWJsZSBpbiBgaW5zdGFsbGAuXG4gICAqIFRoaXMgaXMgdGhlIGNhc2Ugd2l0aCBAdXBweS9yZWFjdCBwbHVnaW5zLCBmb3IgZXhhbXBsZS5cbiAgICovXG4gIHJlbmRlciAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHRlbmQgdGhlIHJlbmRlciBtZXRob2QgdG8gYWRkIHlvdXIgcGx1Z2luIHRvIGEgRE9NIGVsZW1lbnQnKVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgdXBkYXRlICgpIHt9XG5cbiAgLy8gQ2FsbGVkIGFmdGVyIGV2ZXJ5IHN0YXRlIHVwZGF0ZSwgYWZ0ZXIgZXZlcnl0aGluZydzIG1vdW50ZWQuIERlYm91bmNlZC5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgYWZ0ZXJVcGRhdGUgKCkge31cbn1cbiIsImNvbnN0IHsgcmVuZGVyIH0gPSByZXF1aXJlKCdwcmVhY3QnKVxuY29uc3QgZmluZERPTUVsZW1lbnQgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZmluZERPTUVsZW1lbnQnKVxuXG5jb25zdCBCYXNlUGx1Z2luID0gcmVxdWlyZSgnLi9CYXNlUGx1Z2luJylcblxuLyoqXG4gKiBEZWZlciBhIGZyZXF1ZW50IGNhbGwgdG8gdGhlIG1pY3JvdGFzayBxdWV1ZS5cbiAqXG4gKiBAcGFyYW0geygpID0+IFR9IGZuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAqL1xuZnVuY3Rpb24gZGVib3VuY2UgKGZuKSB7XG4gIGxldCBjYWxsaW5nID0gbnVsbFxuICBsZXQgbGF0ZXN0QXJncyA9IG51bGxcbiAgcmV0dXJuICguLi5hcmdzKSA9PiB7XG4gICAgbGF0ZXN0QXJncyA9IGFyZ3NcbiAgICBpZiAoIWNhbGxpbmcpIHtcbiAgICAgIGNhbGxpbmcgPSBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcbiAgICAgICAgY2FsbGluZyA9IG51bGxcbiAgICAgICAgLy8gQXQgdGhpcyBwb2ludCBgYXJnc2AgbWF5IGJlIGRpZmZlcmVudCBmcm9tIHRoZSBtb3N0XG4gICAgICAgIC8vIHJlY2VudCBzdGF0ZSwgaWYgbXVsdGlwbGUgY2FsbHMgaGFwcGVuZWQgc2luY2UgdGhpcyB0YXNrXG4gICAgICAgIC8vIHdhcyBxdWV1ZWQuIFNvIHdlIHVzZSB0aGUgYGxhdGVzdEFyZ3NgLCB3aGljaCBkZWZpbml0ZWx5XG4gICAgICAgIC8vIGlzIHRoZSBtb3N0IHJlY2VudCBjYWxsLlxuICAgICAgICByZXR1cm4gZm4oLi4ubGF0ZXN0QXJncylcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBjYWxsaW5nXG4gIH1cbn1cblxuLyoqXG4gKiBVSVBsdWdpbiBpcyB0aGUgZXh0ZW5kZWQgdmVyc2lvbiBvZiBCYXNlUGx1Z2luIHRvIGluY29ycG9yYXRlIHJlbmRlcmluZyB3aXRoIFByZWFjdC5cbiAqIFVzZSB0aGlzIGZvciBwbHVnaW5zIHRoYXQgbmVlZCBhIHVzZXIgaW50ZXJmYWNlLlxuICpcbiAqIEZvciBwbHVnaW5zIHdpdGhvdXQgYW4gdXNlciBpbnRlcmZhY2UsIHNlZSBCYXNlUGx1Z2luLlxuICovXG5jbGFzcyBVSVBsdWdpbiBleHRlbmRzIEJhc2VQbHVnaW4ge1xuICAjdXBkYXRlVUlcblxuICAvKipcbiAgICogQ2hlY2sgaWYgc3VwcGxpZWQgYHRhcmdldGAgaXMgYSBET00gZWxlbWVudCBvciBhbiBgb2JqZWN0YC5cbiAgICogSWYgaXTigJlzIGFuIG9iamVjdCDigJQgdGFyZ2V0IGlzIGEgcGx1Z2luLCBhbmQgd2Ugc2VhcmNoIGBwbHVnaW5zYFxuICAgKiBmb3IgYSBwbHVnaW4gd2l0aCBzYW1lIG5hbWUgYW5kIHJldHVybiBpdHMgdGFyZ2V0LlxuICAgKi9cbiAgbW91bnQgKHRhcmdldCwgcGx1Z2luKSB7XG4gICAgY29uc3QgY2FsbGVyUGx1Z2luTmFtZSA9IHBsdWdpbi5pZFxuXG4gICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IGZpbmRET01FbGVtZW50KHRhcmdldClcblxuICAgIGlmICh0YXJnZXRFbGVtZW50KSB7XG4gICAgICB0aGlzLmlzVGFyZ2V0RE9NRWwgPSB0cnVlXG4gICAgICAvLyBXaGVuIHRhcmdldCBpcyA8Ym9keT4gd2l0aCBhIHNpbmdsZSA8ZGl2PiBlbGVtZW50LFxuICAgICAgLy8gUHJlYWN0IHRoaW5rcyBpdOKAmXMgdGhlIFVwcHkgcm9vdCBlbGVtZW50IGluIHRoZXJlIHdoZW4gZG9pbmcgYSBkaWZmLFxuICAgICAgLy8gYW5kIGRlc3Ryb3lzIGl0LiBTbyB3ZSBhcmUgY3JlYXRpbmcgYSBmcmFnbWVudCAoY291bGQgYmUgZW1wdHkgZGl2KVxuICAgICAgY29uc3QgdXBweVJvb3RFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG5cbiAgICAgIC8vIEFQSSBmb3IgcGx1Z2lucyB0aGF0IHJlcXVpcmUgYSBzeW5jaHJvbm91cyByZXJlbmRlci5cbiAgICAgIHRoaXMuI3VwZGF0ZVVJID0gZGVib3VuY2UoKHN0YXRlKSA9PiB7XG4gICAgICAgIC8vIHBsdWdpbiBjb3VsZCBiZSByZW1vdmVkLCBidXQgdGhpcy5yZXJlbmRlciBpcyBkZWJvdW5jZWQgYmVsb3csXG4gICAgICAgIC8vIHNvIGl0IGNvdWxkIHN0aWxsIGJlIGNhbGxlZCBldmVuIGFmdGVyIHVwcHkucmVtb3ZlUGx1Z2luIG9yIHVwcHkuY2xvc2VcbiAgICAgICAgLy8gaGVuY2UgdGhlIGNoZWNrXG4gICAgICAgIGlmICghdGhpcy51cHB5LmdldFBsdWdpbih0aGlzLmlkKSkgcmV0dXJuXG4gICAgICAgIHJlbmRlcih0aGlzLnJlbmRlcihzdGF0ZSksIHVwcHlSb290RWxlbWVudClcbiAgICAgICAgdGhpcy5hZnRlclVwZGF0ZSgpXG4gICAgICB9KVxuXG4gICAgICB0aGlzLnVwcHkubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gYSBET00gZWxlbWVudCAnJHt0YXJnZXR9J2ApXG5cbiAgICAgIGlmICh0aGlzLm9wdHMucmVwbGFjZVRhcmdldENvbnRlbnQpIHtcbiAgICAgICAgLy8gRG9pbmcgcmVuZGVyKGgobnVsbCksIHRhcmdldEVsZW1lbnQpLCB3aGljaCBzaG91bGQgaGF2ZSBiZWVuXG4gICAgICAgIC8vIGEgYmV0dGVyIHdheSwgc2luY2UgYmVjYXVzZSB0aGUgY29tcG9uZW50IG1pZ2h0IG5lZWQgdG8gZG8gYWRkaXRpb25hbCBjbGVhbnVwIHdoZW4gaXQgaXMgcmVtb3ZlZCxcbiAgICAgICAgLy8gc3RvcHBlZCB3b3JraW5nIOKAlCBQcmVhY3QganVzdCBhZGRzIG51bGwgaW50byB0YXJnZXQsIG5vdCByZXBsYWNpbmdcbiAgICAgICAgdGFyZ2V0RWxlbWVudC5pbm5lckhUTUwgPSAnJ1xuICAgICAgfVxuXG4gICAgICByZW5kZXIodGhpcy5yZW5kZXIodGhpcy51cHB5LmdldFN0YXRlKCkpLCB1cHB5Um9vdEVsZW1lbnQpXG4gICAgICB0aGlzLmVsID0gdXBweVJvb3RFbGVtZW50LmZpcnN0RWxlbWVudENoaWxkXG4gICAgICB0YXJnZXRFbGVtZW50LmFwcGVuZENoaWxkKHVwcHlSb290RWxlbWVudClcblxuICAgICAgdGhpcy5vbk1vdW50KClcblxuICAgICAgcmV0dXJuIHRoaXMuZWxcbiAgICB9XG5cbiAgICBsZXQgdGFyZ2V0UGx1Z2luXG4gICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHRhcmdldCBpbnN0YW5jZW9mIFVJUGx1Z2luKSB7XG4gICAgICAvLyBUYXJnZXRpbmcgYSBwbHVnaW4gKmluc3RhbmNlKlxuICAgICAgdGFyZ2V0UGx1Z2luID0gdGFyZ2V0XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBUYXJnZXRpbmcgYSBwbHVnaW4gdHlwZVxuICAgICAgY29uc3QgVGFyZ2V0ID0gdGFyZ2V0XG4gICAgICAvLyBGaW5kIHRoZSB0YXJnZXQgcGx1Z2luIGluc3RhbmNlLlxuICAgICAgdGhpcy51cHB5Lml0ZXJhdGVQbHVnaW5zKHAgPT4ge1xuICAgICAgICBpZiAocCBpbnN0YW5jZW9mIFRhcmdldCkge1xuICAgICAgICAgIHRhcmdldFBsdWdpbiA9IHBcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAodGFyZ2V0UGx1Z2luKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKGBJbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX0gdG8gJHt0YXJnZXRQbHVnaW4uaWR9YClcbiAgICAgIHRoaXMucGFyZW50ID0gdGFyZ2V0UGx1Z2luXG4gICAgICB0aGlzLmVsID0gdGFyZ2V0UGx1Z2luLmFkZFRhcmdldChwbHVnaW4pXG5cbiAgICAgIHRoaXMub25Nb3VudCgpXG4gICAgICByZXR1cm4gdGhpcy5lbFxuICAgIH1cblxuICAgIHRoaXMudXBweS5sb2coYE5vdCBpbnN0YWxsaW5nICR7Y2FsbGVyUGx1Z2luTmFtZX1gKVxuXG4gICAgbGV0IG1lc3NhZ2UgPSBgSW52YWxpZCB0YXJnZXQgb3B0aW9uIGdpdmVuIHRvICR7Y2FsbGVyUGx1Z2luTmFtZX0uYFxuICAgIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBtZXNzYWdlICs9ICcgVGhlIGdpdmVuIHRhcmdldCBpcyBub3QgYSBQbHVnaW4gY2xhc3MuICdcbiAgICAgICAgKyAnUGxlYXNlIGNoZWNrIHRoYXQgeW91XFwncmUgbm90IHNwZWNpZnlpbmcgYSBSZWFjdCBDb21wb25lbnQgaW5zdGVhZCBvZiBhIHBsdWdpbi4gJ1xuICAgICAgICArICdJZiB5b3UgYXJlIHVzaW5nIEB1cHB5LyogcGFja2FnZXMgZGlyZWN0bHksIG1ha2Ugc3VyZSB5b3UgaGF2ZSBvbmx5IDEgdmVyc2lvbiBvZiBAdXBweS9jb3JlIGluc3RhbGxlZDogJ1xuICAgICAgICArICdydW4gYG5wbSBscyBAdXBweS9jb3JlYCBvbiB0aGUgY29tbWFuZCBsaW5lIGFuZCB2ZXJpZnkgdGhhdCBhbGwgdGhlIHZlcnNpb25zIG1hdGNoIGFuZCBhcmUgZGVkdXBlZCBjb3JyZWN0bHkuJ1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlICs9ICdJZiB5b3UgbWVhbnQgdG8gdGFyZ2V0IGFuIEhUTUwgZWxlbWVudCwgcGxlYXNlIG1ha2Ugc3VyZSB0aGF0IHRoZSBlbGVtZW50IGV4aXN0cy4gJ1xuICAgICAgICArICdDaGVjayB0aGF0IHRoZSA8c2NyaXB0PiB0YWcgaW5pdGlhbGl6aW5nIFVwcHkgaXMgcmlnaHQgYmVmb3JlIHRoZSBjbG9zaW5nIDwvYm9keT4gdGFnIGF0IHRoZSBlbmQgb2YgdGhlIHBhZ2UuICdcbiAgICAgICAgKyAnKHNlZSBodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXMvMTA0MilcXG5cXG4nXG4gICAgICAgICsgJ0lmIHlvdSBtZWFudCB0byB0YXJnZXQgYSBwbHVnaW4sIHBsZWFzZSBjb25maXJtIHRoYXQgeW91ciBgaW1wb3J0YCBzdGF0ZW1lbnRzIG9yIGByZXF1aXJlYCBjYWxscyBhcmUgY29ycmVjdC4nXG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKVxuICB9XG5cbiAgdXBkYXRlIChzdGF0ZSkge1xuICAgIGlmICh0aGlzLmVsICE9IG51bGwpIHtcbiAgICAgIHRoaXMuI3VwZGF0ZVVJPy4oc3RhdGUpXG4gICAgfVxuICB9XG5cbiAgdW5tb3VudCAoKSB7XG4gICAgaWYgKHRoaXMuaXNUYXJnZXRET01FbCkge1xuICAgICAgdGhpcy5lbD8ucmVtb3ZlKClcbiAgICB9XG4gICAgdGhpcy5vblVubW91bnQoKVxuICB9XG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGNsYXNzLW1ldGhvZHMtdXNlLXRoaXNcbiAgb25Nb3VudCAoKSB7fVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjbGFzcy1tZXRob2RzLXVzZS10aGlzXG4gIG9uVW5tb3VudCAoKSB7fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFVJUGx1Z2luXG4iLCIvKiBnbG9iYWwgQWdncmVnYXRlRXJyb3IgKi9cblxuJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IFRyYW5zbGF0b3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvVHJhbnNsYXRvcicpXG5jb25zdCBlZSA9IHJlcXVpcmUoJ25hbWVzcGFjZS1lbWl0dGVyJylcbmNvbnN0IHsgbmFub2lkIH0gPSByZXF1aXJlKCduYW5vaWQnKVxuY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuY29uc3QgcHJldHRpZXJCeXRlcyA9IHJlcXVpcmUoJ0B0cmFuc2xvYWRpdC9wcmV0dGllci1ieXRlcycpXG5jb25zdCBtYXRjaCA9IHJlcXVpcmUoJ21pbWUtbWF0Y2gnKVxuY29uc3QgRGVmYXVsdFN0b3JlID0gcmVxdWlyZSgnQHVwcHkvc3RvcmUtZGVmYXVsdCcpXG5jb25zdCBnZXRGaWxlVHlwZSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlVHlwZScpXG5jb25zdCBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbiA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbicpXG5jb25zdCBnZW5lcmF0ZUZpbGVJRCA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9nZW5lcmF0ZUZpbGVJRCcpXG5jb25zdCBzdXBwb3J0c1VwbG9hZFByb2dyZXNzID0gcmVxdWlyZSgnLi9zdXBwb3J0c1VwbG9hZFByb2dyZXNzJylcbmNvbnN0IGdldEZpbGVOYW1lID0gcmVxdWlyZSgnLi9nZXRGaWxlTmFtZScpXG5jb25zdCB7IGp1c3RFcnJvcnNMb2dnZXIsIGRlYnVnTG9nZ2VyIH0gPSByZXF1aXJlKCcuL2xvZ2dlcnMnKVxuXG5jb25zdCBsb2NhbGUgPSByZXF1aXJlKCcuL2xvY2FsZScpXG5cbi8vIEV4cG9ydGVkIGZyb20gaGVyZS5cbmNsYXNzIFJlc3RyaWN0aW9uRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yICguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncylcbiAgICB0aGlzLmlzUmVzdHJpY3Rpb24gPSB0cnVlXG4gIH1cbn1cbmlmICh0eXBlb2YgQWdncmVnYXRlRXJyb3IgPT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1nbG9iYWwtYXNzaWduXG4gIGdsb2JhbFRoaXMuQWdncmVnYXRlRXJyb3IgPSBjbGFzcyBBZ2dyZWdhdGVFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgICBjb25zdHJ1Y3RvciAoZXJyb3JzLCBtZXNzYWdlKSB7XG4gICAgICBzdXBlcihtZXNzYWdlKVxuICAgICAgdGhpcy5lcnJvcnMgPSBlcnJvcnNcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgQWdncmVnYXRlUmVzdHJpY3Rpb25FcnJvciBleHRlbmRzIEFnZ3JlZ2F0ZUVycm9yIHtcbiAgY29uc3RydWN0b3IgKC4uLmFyZ3MpIHtcbiAgICBzdXBlciguLi5hcmdzKVxuICAgIHRoaXMuaXNSZXN0cmljdGlvbiA9IHRydWVcbiAgfVxufVxuXG4vKipcbiAqIFVwcHkgQ29yZSBtb2R1bGUuXG4gKiBNYW5hZ2VzIHBsdWdpbnMsIHN0YXRlIHVwZGF0ZXMsIGFjdHMgYXMgYW4gZXZlbnQgYnVzLFxuICogYWRkcy9yZW1vdmVzIGZpbGVzIGFuZCBtZXRhZGF0YS5cbiAqL1xuY2xhc3MgVXBweSB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBnbG9iYWwtcmVxdWlyZVxuICBzdGF0aWMgVkVSU0lPTiA9IHJlcXVpcmUoJy4uL3BhY2thZ2UuanNvbicpLnZlcnNpb25cblxuICAvKiogQHR5cGUge1JlY29yZDxzdHJpbmcsIEJhc2VQbHVnaW5bXT59ICovXG4gICNwbHVnaW5zID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gICNzdG9yZVVuc3Vic2NyaWJlXG5cbiAgI2VtaXR0ZXIgPSBlZSgpXG5cbiAgI3ByZVByb2Nlc3NvcnMgPSBuZXcgU2V0KClcblxuICAjdXBsb2FkZXJzID0gbmV3IFNldCgpXG5cbiAgI3Bvc3RQcm9jZXNzb3JzID0gbmV3IFNldCgpXG5cbiAgLyoqXG4gICAqIEluc3RhbnRpYXRlIFVwcHlcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHMg4oCUIFVwcHkgb3B0aW9uc1xuICAgKi9cbiAgY29uc3RydWN0b3IgKG9wdHMpIHtcbiAgICB0aGlzLmRlZmF1bHRMb2NhbGUgPSBsb2NhbGVcblxuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgaWQ6ICd1cHB5JyxcbiAgICAgIGF1dG9Qcm9jZWVkOiBmYWxzZSxcbiAgICAgIC8qKlxuICAgICAgICogQGRlcHJlY2F0ZWQgVGhlIG1ldGhvZCBzaG91bGQgbm90IGJlIHVzZWRcbiAgICAgICAqL1xuICAgICAgYWxsb3dNdWx0aXBsZVVwbG9hZHM6IHRydWUsXG4gICAgICBhbGxvd011bHRpcGxlVXBsb2FkQmF0Y2hlczogdHJ1ZSxcbiAgICAgIGRlYnVnOiBmYWxzZSxcbiAgICAgIHJlc3RyaWN0aW9uczoge1xuICAgICAgICBtYXhGaWxlU2l6ZTogbnVsbCxcbiAgICAgICAgbWluRmlsZVNpemU6IG51bGwsXG4gICAgICAgIG1heFRvdGFsRmlsZVNpemU6IG51bGwsXG4gICAgICAgIG1heE51bWJlck9mRmlsZXM6IG51bGwsXG4gICAgICAgIG1pbk51bWJlck9mRmlsZXM6IG51bGwsXG4gICAgICAgIGFsbG93ZWRGaWxlVHlwZXM6IG51bGwsXG4gICAgICAgIHJlcXVpcmVkTWV0YUZpZWxkczogW10sXG4gICAgICB9LFxuICAgICAgbWV0YToge30sXG4gICAgICBvbkJlZm9yZUZpbGVBZGRlZDogKGN1cnJlbnRGaWxlKSA9PiBjdXJyZW50RmlsZSxcbiAgICAgIG9uQmVmb3JlVXBsb2FkOiAoZmlsZXMpID0+IGZpbGVzLFxuICAgICAgc3RvcmU6IERlZmF1bHRTdG9yZSgpLFxuICAgICAgbG9nZ2VyOiBqdXN0RXJyb3JzTG9nZ2VyLFxuICAgICAgaW5mb1RpbWVvdXQ6IDUwMDAsXG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgZGVmYXVsdCBvcHRpb25zIHdpdGggdGhlIG9uZXMgc2V0IGJ5IHVzZXIsXG4gICAgLy8gbWFraW5nIHN1cmUgdG8gbWVyZ2UgcmVzdHJpY3Rpb25zIHRvb1xuICAgIHRoaXMub3B0cyA9IHtcbiAgICAgIC4uLmRlZmF1bHRPcHRpb25zLFxuICAgICAgLi4ub3B0cyxcbiAgICAgIHJlc3RyaWN0aW9uczoge1xuICAgICAgICAuLi5kZWZhdWx0T3B0aW9ucy5yZXN0cmljdGlvbnMsXG4gICAgICAgIC4uLihvcHRzICYmIG9wdHMucmVzdHJpY3Rpb25zKSxcbiAgICAgIH0sXG4gICAgfVxuXG4gICAgLy8gU3VwcG9ydCBkZWJ1ZzogdHJ1ZSBmb3IgYmFja3dhcmRzLWNvbXBhdGFiaWxpdHksIHVubGVzcyBsb2dnZXIgaXMgc2V0IGluIG9wdHNcbiAgICAvLyBvcHRzIGluc3RlYWQgb2YgdGhpcy5vcHRzIHRvIGF2b2lkIGNvbXBhcmluZyBvYmplY3RzIOKAlCB3ZSBzZXQgbG9nZ2VyOiBqdXN0RXJyb3JzTG9nZ2VyIGluIGRlZmF1bHRPcHRpb25zXG4gICAgaWYgKG9wdHMgJiYgb3B0cy5sb2dnZXIgJiYgb3B0cy5kZWJ1Zykge1xuICAgICAgdGhpcy5sb2coJ1lvdSBhcmUgdXNpbmcgYSBjdXN0b20gYGxvZ2dlcmAsIGJ1dCBhbHNvIHNldCBgZGVidWc6IHRydWVgLCB3aGljaCB1c2VzIGJ1aWx0LWluIGxvZ2dlciB0byBvdXRwdXQgbG9ncyB0byBjb25zb2xlLiBJZ25vcmluZyBgZGVidWc6IHRydWVgIGFuZCB1c2luZyB5b3VyIGN1c3RvbSBgbG9nZ2VyYC4nLCAnd2FybmluZycpXG4gICAgfSBlbHNlIGlmIChvcHRzICYmIG9wdHMuZGVidWcpIHtcbiAgICAgIHRoaXMub3B0cy5sb2dnZXIgPSBkZWJ1Z0xvZ2dlclxuICAgIH1cblxuICAgIHRoaXMubG9nKGBVc2luZyBDb3JlIHYke3RoaXMuY29uc3RydWN0b3IuVkVSU0lPTn1gKVxuXG4gICAgaWYgKHRoaXMub3B0cy5yZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlc1xuICAgICAgICAmJiB0aGlzLm9wdHMucmVzdHJpY3Rpb25zLmFsbG93ZWRGaWxlVHlwZXMgIT09IG51bGxcbiAgICAgICAgJiYgIUFycmF5LmlzQXJyYXkodGhpcy5vcHRzLnJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYHJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzYCBtdXN0IGJlIGFuIGFycmF5JylcbiAgICB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIC8vIF9fX1doeSB0aHJvdHRsZSBhdCA1MDBtcz9cbiAgICAvLyAgICAtIFdlIG11c3QgdGhyb3R0bGUgYXQgPjI1MG1zIGZvciBzdXBlcmZvY3VzIGluIERhc2hib2FyZCB0byB3b3JrIHdlbGxcbiAgICAvLyAgICAoYmVjYXVzZSBhbmltYXRpb24gdGFrZXMgMC4yNXMsIGFuZCB3ZSB3YW50IHRvIHdhaXQgZm9yIGFsbCBhbmltYXRpb25zIHRvIGJlIG92ZXIgYmVmb3JlIHJlZm9jdXNpbmcpLlxuICAgIC8vICAgIFtQcmFjdGljYWwgQ2hlY2tdOiBpZiB0aG90dGxlIGlzIGF0IDEwMG1zLCB0aGVuIGlmIHlvdSBhcmUgdXBsb2FkaW5nIGEgZmlsZSxcbiAgICAvLyAgICBhbmQgY2xpY2sgJ0FERCBNT1JFIEZJTEVTJywgLSBmb2N1cyB3b24ndCBhY3RpdmF0ZSBpbiBGaXJlZm94LlxuICAgIC8vICAgIC0gV2UgbXVzdCB0aHJvdHRsZSBhdCBhcm91bmQgPjUwMG1zIHRvIGF2b2lkIHBlcmZvcm1hbmNlIGxhZ3MuXG4gICAgLy8gICAgW1ByYWN0aWNhbCBDaGVja10gRmlyZWZveCwgdHJ5IHRvIHVwbG9hZCBhIGJpZyBmaWxlIGZvciBhIHByb2xvbmdlZCBwZXJpb2Qgb2YgdGltZS4gTGFwdG9wIHdpbGwgc3RhcnQgdG8gaGVhdCB1cC5cbiAgICB0aGlzLmNhbGN1bGF0ZVByb2dyZXNzID0gdGhyb3R0bGUodGhpcy5jYWxjdWxhdGVQcm9ncmVzcy5iaW5kKHRoaXMpLCA1MDAsIHsgbGVhZGluZzogdHJ1ZSwgdHJhaWxpbmc6IHRydWUgfSlcblxuICAgIHRoaXMuc3RvcmUgPSB0aGlzLm9wdHMuc3RvcmVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHBsdWdpbnM6IHt9LFxuICAgICAgZmlsZXM6IHt9LFxuICAgICAgY3VycmVudFVwbG9hZHM6IHt9LFxuICAgICAgYWxsb3dOZXdVcGxvYWQ6IHRydWUsXG4gICAgICBjYXBhYmlsaXRpZXM6IHtcbiAgICAgICAgdXBsb2FkUHJvZ3Jlc3M6IHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MoKSxcbiAgICAgICAgaW5kaXZpZHVhbENhbmNlbGxhdGlvbjogdHJ1ZSxcbiAgICAgICAgcmVzdW1hYmxlVXBsb2FkczogZmFsc2UsXG4gICAgICB9LFxuICAgICAgdG90YWxQcm9ncmVzczogMCxcbiAgICAgIG1ldGE6IHsgLi4udGhpcy5vcHRzLm1ldGEgfSxcbiAgICAgIGluZm86IFtdLFxuICAgICAgcmVjb3ZlcmVkU3RhdGU6IG51bGwsXG4gICAgfSlcblxuICAgIHRoaXMuI3N0b3JlVW5zdWJzY3JpYmUgPSB0aGlzLnN0b3JlLnN1YnNjcmliZSgocHJldlN0YXRlLCBuZXh0U3RhdGUsIHBhdGNoKSA9PiB7XG4gICAgICB0aGlzLmVtaXQoJ3N0YXRlLXVwZGF0ZScsIHByZXZTdGF0ZSwgbmV4dFN0YXRlLCBwYXRjaClcbiAgICAgIHRoaXMudXBkYXRlQWxsKG5leHRTdGF0ZSlcbiAgICB9KVxuXG4gICAgLy8gRXhwb3NpbmcgdXBweSBvYmplY3Qgb24gd2luZG93IGZvciBkZWJ1Z2dpbmcgYW5kIHRlc3RpbmdcbiAgICBpZiAodGhpcy5vcHRzLmRlYnVnICYmIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3dbdGhpcy5vcHRzLmlkXSA9IHRoaXNcbiAgICB9XG5cbiAgICB0aGlzLiNhZGRMaXN0ZW5lcnMoKVxuICB9XG5cbiAgZW1pdCAoZXZlbnQsIC4uLmFyZ3MpIHtcbiAgICB0aGlzLiNlbWl0dGVyLmVtaXQoZXZlbnQsIC4uLmFyZ3MpXG4gIH1cblxuICBvbiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy4jZW1pdHRlci5vbihldmVudCwgY2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG9uY2UgKGV2ZW50LCBjYWxsYmFjaykge1xuICAgIHRoaXMuI2VtaXR0ZXIub25jZShldmVudCwgY2FsbGJhY2spXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG9mZiAoZXZlbnQsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy4jZW1pdHRlci5vZmYoZXZlbnQsIGNhbGxiYWNrKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSBvbiBhbGwgcGx1Z2lucyBhbmQgcnVuIGB1cGRhdGVgIG9uIHRoZW0uXG4gICAqIENhbGxlZCBlYWNoIHRpbWUgc3RhdGUgY2hhbmdlcy5cbiAgICpcbiAgICovXG4gIHVwZGF0ZUFsbCAoc3RhdGUpIHtcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKHBsdWdpbiA9PiB7XG4gICAgICBwbHVnaW4udXBkYXRlKHN0YXRlKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyBzdGF0ZSB3aXRoIGEgcGF0Y2hcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IHBhdGNoIHtmb286ICdiYXInfVxuICAgKi9cbiAgc2V0U3RhdGUgKHBhdGNoKSB7XG4gICAgdGhpcy5zdG9yZS5zZXRTdGF0ZShwYXRjaClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGN1cnJlbnQgc3RhdGUuXG4gICAqXG4gICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAqL1xuICBnZXRTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RvcmUuZ2V0U3RhdGUoKVxuICB9XG5cbiAgLyoqXG4gICAqIEJhY2sgY29tcGF0IGZvciB3aGVuIHVwcHkuc3RhdGUgaXMgdXNlZCBpbnN0ZWFkIG9mIHVwcHkuZ2V0U3RhdGUoKS5cbiAgICpcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIGdldCBzdGF0ZSAoKSB7XG4gICAgLy8gSGVyZSwgc3RhdGUgaXMgYSBub24tZW51bWVyYWJsZSBwcm9wZXJ0eS5cbiAgICByZXR1cm4gdGhpcy5nZXRTdGF0ZSgpXG4gIH1cblxuICAvKipcbiAgICogU2hvcnRoYW5kIHRvIHNldCBzdGF0ZSBmb3IgYSBzcGVjaWZpYyBmaWxlLlxuICAgKi9cbiAgc2V0RmlsZVN0YXRlIChmaWxlSUQsIHN0YXRlKSB7XG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW7igJl0IHNldCBzdGF0ZSBmb3IgJHtmaWxlSUR9ICh0aGUgZmlsZSBjb3VsZCBoYXZlIGJlZW4gcmVtb3ZlZClgKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHsgLi4udGhpcy5nZXRTdGF0ZSgpLmZpbGVzLCBbZmlsZUlEXTogeyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXNbZmlsZUlEXSwgLi4uc3RhdGUgfSB9LFxuICAgIH0pXG4gIH1cblxuICBpMThuSW5pdCAoKSB7XG4gICAgY29uc3QgdHJhbnNsYXRvciA9IG5ldyBUcmFuc2xhdG9yKFt0aGlzLmRlZmF1bHRMb2NhbGUsIHRoaXMub3B0cy5sb2NhbGVdKVxuICAgIHRoaXMuaTE4biA9IHRyYW5zbGF0b3IudHJhbnNsYXRlLmJpbmQodHJhbnNsYXRvcilcbiAgICB0aGlzLmkxOG5BcnJheSA9IHRyYW5zbGF0b3IudHJhbnNsYXRlQXJyYXkuYmluZCh0cmFuc2xhdG9yKVxuICAgIHRoaXMubG9jYWxlID0gdHJhbnNsYXRvci5sb2NhbGVcbiAgfVxuXG4gIHNldE9wdGlvbnMgKG5ld09wdHMpIHtcbiAgICB0aGlzLm9wdHMgPSB7XG4gICAgICAuLi50aGlzLm9wdHMsXG4gICAgICAuLi5uZXdPcHRzLFxuICAgICAgcmVzdHJpY3Rpb25zOiB7XG4gICAgICAgIC4uLnRoaXMub3B0cy5yZXN0cmljdGlvbnMsXG4gICAgICAgIC4uLihuZXdPcHRzICYmIG5ld09wdHMucmVzdHJpY3Rpb25zKSxcbiAgICAgIH0sXG4gICAgfVxuXG4gICAgaWYgKG5ld09wdHMubWV0YSkge1xuICAgICAgdGhpcy5zZXRNZXRhKG5ld09wdHMubWV0YSlcbiAgICB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIGlmIChuZXdPcHRzLmxvY2FsZSkge1xuICAgICAgdGhpcy5pdGVyYXRlUGx1Z2lucygocGx1Z2luKSA9PiB7XG4gICAgICAgIHBsdWdpbi5zZXRPcHRpb25zKClcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8gTm90ZTogdGhpcyBpcyBub3QgdGhlIHByZWFjdCBgc2V0U3RhdGVgLCBpdCdzIGFuIGludGVybmFsIGZ1bmN0aW9uIHRoYXQgaGFzIHRoZSBzYW1lIG5hbWUuXG4gICAgdGhpcy5zZXRTdGF0ZSgpIC8vIHNvIHRoYXQgVUkgcmUtcmVuZGVycyB3aXRoIG5ldyBvcHRpb25zXG4gIH1cblxuICByZXNldFByb2dyZXNzICgpIHtcbiAgICBjb25zdCBkZWZhdWx0UHJvZ3Jlc3MgPSB7XG4gICAgICBwZXJjZW50YWdlOiAwLFxuICAgICAgYnl0ZXNVcGxvYWRlZDogMCxcbiAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgIHVwbG9hZFN0YXJ0ZWQ6IG51bGwsXG4gICAgfVxuICAgIGNvbnN0IGZpbGVzID0geyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMgfVxuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IHt9XG4gICAgT2JqZWN0LmtleXMoZmlsZXMpLmZvckVhY2goZmlsZUlEID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0geyAuLi5maWxlc1tmaWxlSURdIH1cbiAgICAgIHVwZGF0ZWRGaWxlLnByb2dyZXNzID0geyAuLi51cGRhdGVkRmlsZS5wcm9ncmVzcywgLi4uZGVmYXVsdFByb2dyZXNzIH1cbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlSURdID0gdXBkYXRlZEZpbGVcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzLFxuICAgICAgdG90YWxQcm9ncmVzczogMCxcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdyZXNldC1wcm9ncmVzcycpXG4gIH1cblxuICBhZGRQcmVQcm9jZXNzb3IgKGZuKSB7XG4gICAgdGhpcy4jcHJlUHJvY2Vzc29ycy5hZGQoZm4pXG4gIH1cblxuICByZW1vdmVQcmVQcm9jZXNzb3IgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuI3ByZVByb2Nlc3NvcnMuZGVsZXRlKGZuKVxuICB9XG5cbiAgYWRkUG9zdFByb2Nlc3NvciAoZm4pIHtcbiAgICB0aGlzLiNwb3N0UHJvY2Vzc29ycy5hZGQoZm4pXG4gIH1cblxuICByZW1vdmVQb3N0UHJvY2Vzc29yIChmbikge1xuICAgIHJldHVybiB0aGlzLiNwb3N0UHJvY2Vzc29ycy5kZWxldGUoZm4pXG4gIH1cblxuICBhZGRVcGxvYWRlciAoZm4pIHtcbiAgICB0aGlzLiN1cGxvYWRlcnMuYWRkKGZuKVxuICB9XG5cbiAgcmVtb3ZlVXBsb2FkZXIgKGZuKSB7XG4gICAgcmV0dXJuIHRoaXMuI3VwbG9hZGVycy5kZWxldGUoZm4pXG4gIH1cblxuICBzZXRNZXRhIChkYXRhKSB7XG4gICAgY29uc3QgdXBkYXRlZE1ldGEgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5tZXRhLCAuLi5kYXRhIH1cbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5maWxlcyB9XG5cbiAgICBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZvckVhY2goKGZpbGVJRCkgPT4ge1xuICAgICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB7IC4uLnVwZGF0ZWRGaWxlc1tmaWxlSURdLCBtZXRhOiB7IC4uLnVwZGF0ZWRGaWxlc1tmaWxlSURdLm1ldGEsIC4uLmRhdGEgfSB9XG4gICAgfSlcblxuICAgIHRoaXMubG9nKCdBZGRpbmcgbWV0YWRhdGE6JylcbiAgICB0aGlzLmxvZyhkYXRhKVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBtZXRhOiB1cGRhdGVkTWV0YSxcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXMsXG4gICAgfSlcbiAgfVxuXG4gIHNldEZpbGVNZXRhIChmaWxlSUQsIGRhdGEpIHtcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5maWxlcyB9XG4gICAgaWYgKCF1cGRhdGVkRmlsZXNbZmlsZUlEXSkge1xuICAgICAgdGhpcy5sb2coJ1dhcyB0cnlpbmcgdG8gc2V0IG1ldGFkYXRhIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAnLCBmaWxlSUQpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgY29uc3QgbmV3TWV0YSA9IHsgLi4udXBkYXRlZEZpbGVzW2ZpbGVJRF0ubWV0YSwgLi4uZGF0YSB9XG4gICAgdXBkYXRlZEZpbGVzW2ZpbGVJRF0gPSB7IC4uLnVwZGF0ZWRGaWxlc1tmaWxlSURdLCBtZXRhOiBuZXdNZXRhIH1cbiAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IHVwZGF0ZWRGaWxlcyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGZpbGUgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlEIFRoZSBJRCBvZiB0aGUgZmlsZSBvYmplY3QgdG8gcmV0dXJuLlxuICAgKi9cbiAgZ2V0RmlsZSAoZmlsZUlEKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlSURdXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBmaWxlcyBpbiBhbiBhcnJheS5cbiAgICovXG4gIGdldEZpbGVzICgpIHtcbiAgICBjb25zdCB7IGZpbGVzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICByZXR1cm4gT2JqZWN0LnZhbHVlcyhmaWxlcylcbiAgfVxuXG4gIGdldE9iamVjdE9mRmlsZXNQZXJTdGF0ZSAoKSB7XG4gICAgY29uc3QgeyBmaWxlczogZmlsZXNPYmplY3QsIHRvdGFsUHJvZ3Jlc3MsIGVycm9yIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBjb25zdCBmaWxlcyA9IE9iamVjdC52YWx1ZXMoZmlsZXNPYmplY3QpXG4gICAgY29uc3QgaW5Qcm9ncmVzc0ZpbGVzID0gZmlsZXMuZmlsdGVyKCh7IHByb2dyZXNzIH0pID0+ICFwcm9ncmVzcy51cGxvYWRDb21wbGV0ZSAmJiBwcm9ncmVzcy51cGxvYWRTdGFydGVkKVxuICAgIGNvbnN0IG5ld0ZpbGVzID0gIGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gIWZpbGUucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZClcbiAgICBjb25zdCBzdGFydGVkRmlsZXMgPSBmaWxlcy5maWx0ZXIoXG4gICAgICBmaWxlID0+IGZpbGUucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZCB8fCBmaWxlLnByb2dyZXNzLnByZXByb2Nlc3MgfHwgZmlsZS5wcm9ncmVzcy5wb3N0cHJvY2VzcyxcbiAgICApXG4gICAgY29uc3QgdXBsb2FkU3RhcnRlZEZpbGVzID0gZmlsZXMuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQpXG4gICAgY29uc3QgcGF1c2VkRmlsZXMgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUuaXNQYXVzZWQpXG4gICAgY29uc3QgY29tcGxldGVGaWxlcyA9IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gZmlsZS5wcm9ncmVzcy51cGxvYWRDb21wbGV0ZSlcbiAgICBjb25zdCBlcnJvcmVkRmlsZXMgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUuZXJyb3IpXG4gICAgY29uc3QgaW5Qcm9ncmVzc05vdFBhdXNlZEZpbGVzID0gaW5Qcm9ncmVzc0ZpbGVzLmZpbHRlcigoZmlsZSkgPT4gIWZpbGUuaXNQYXVzZWQpXG4gICAgY29uc3QgcHJvY2Vzc2luZ0ZpbGVzID0gZmlsZXMuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLnByZXByb2Nlc3MgfHwgZmlsZS5wcm9ncmVzcy5wb3N0cHJvY2VzcylcblxuICAgIHJldHVybiB7XG4gICAgICBuZXdGaWxlcyxcbiAgICAgIHN0YXJ0ZWRGaWxlcyxcbiAgICAgIHVwbG9hZFN0YXJ0ZWRGaWxlcyxcbiAgICAgIHBhdXNlZEZpbGVzLFxuICAgICAgY29tcGxldGVGaWxlcyxcbiAgICAgIGVycm9yZWRGaWxlcyxcbiAgICAgIGluUHJvZ3Jlc3NGaWxlcyxcbiAgICAgIGluUHJvZ3Jlc3NOb3RQYXVzZWRGaWxlcyxcbiAgICAgIHByb2Nlc3NpbmdGaWxlcyxcblxuICAgICAgaXNVcGxvYWRTdGFydGVkOiB1cGxvYWRTdGFydGVkRmlsZXMubGVuZ3RoID4gMCxcbiAgICAgIGlzQWxsQ29tcGxldGU6IHRvdGFsUHJvZ3Jlc3MgPT09IDEwMFxuICAgICAgICAmJiBjb21wbGV0ZUZpbGVzLmxlbmd0aCA9PT0gZmlsZXMubGVuZ3RoXG4gICAgICAgICYmIHByb2Nlc3NpbmdGaWxlcy5sZW5ndGggPT09IDAsXG4gICAgICBpc0FsbEVycm9yZWQ6ICEhZXJyb3IgJiYgZXJyb3JlZEZpbGVzLmxlbmd0aCA9PT0gZmlsZXMubGVuZ3RoLFxuICAgICAgaXNBbGxQYXVzZWQ6IGluUHJvZ3Jlc3NGaWxlcy5sZW5ndGggIT09IDAgJiYgcGF1c2VkRmlsZXMubGVuZ3RoID09PSBpblByb2dyZXNzRmlsZXMubGVuZ3RoLFxuICAgICAgaXNVcGxvYWRJblByb2dyZXNzOiBpblByb2dyZXNzRmlsZXMubGVuZ3RoID4gMCxcbiAgICAgIGlzU29tZUdob3N0OiBmaWxlcy5zb21lKGZpbGUgPT4gZmlsZS5pc0dob3N0KSxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBwdWJsaWMgd3JhcHBlciBmb3IgX2NoZWNrUmVzdHJpY3Rpb25zIOKAlCBjaGVja3MgaWYgYSBmaWxlIHBhc3NlcyBhIHNldCBvZiByZXN0cmljdGlvbnMuXG4gICAqIEZvciB1c2UgaW4gVUkgcGx1aWdpbnMgKGxpa2UgUHJvdmlkZXJzKSwgdG8gZGlzYWxsb3cgc2VsZWN0aW5nIGZpbGVzIHRoYXQgd29u4oCZdCBwYXNzIHJlc3RyaWN0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGZpbGUgb2JqZWN0IHRvIGNoZWNrXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtmaWxlc10gYXJyYXkgdG8gY2hlY2sgbWF4TnVtYmVyT2ZGaWxlcyBhbmQgbWF4VG90YWxGaWxlU2l6ZVxuICAgKiBAcmV0dXJucyB7b2JqZWN0fSB7IHJlc3VsdDogdHJ1ZS9mYWxzZSwgcmVhc29uOiB3aHkgZmlsZSBkaWRu4oCZdCBwYXNzIHJlc3RyaWN0aW9ucyB9XG4gICAqL1xuICB2YWxpZGF0ZVJlc3RyaWN0aW9ucyAoZmlsZSwgZmlsZXMpIHtcbiAgICB0cnkge1xuICAgICAgdGhpcy4jY2hlY2tSZXN0cmljdGlvbnMoZmlsZSwgZmlsZXMpXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN1bHQ6IHRydWUsXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByZXN1bHQ6IGZhbHNlLFxuICAgICAgICByZWFzb246IGVyci5tZXNzYWdlLFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBmaWxlIHBhc3NlcyBhIHNldCBvZiByZXN0cmljdGlvbnMgc2V0IGluIG9wdGlvbnM6IG1heEZpbGVTaXplLCBtaW5GaWxlU2l6ZSxcbiAgICogbWF4TnVtYmVyT2ZGaWxlcyBhbmQgYWxsb3dlZEZpbGVUeXBlcy5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IGZpbGUgb2JqZWN0IHRvIGNoZWNrXG4gICAqIEBwYXJhbSB7QXJyYXl9IFtmaWxlc10gYXJyYXkgdG8gY2hlY2sgbWF4TnVtYmVyT2ZGaWxlcyBhbmQgbWF4VG90YWxGaWxlU2l6ZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI2NoZWNrUmVzdHJpY3Rpb25zIChmaWxlLCBmaWxlcyA9IHRoaXMuZ2V0RmlsZXMoKSkge1xuICAgIGNvbnN0IHsgbWF4RmlsZVNpemUsIG1pbkZpbGVTaXplLCBtYXhUb3RhbEZpbGVTaXplLCBtYXhOdW1iZXJPZkZpbGVzLCBhbGxvd2VkRmlsZVR5cGVzIH0gPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zXG5cbiAgICBpZiAobWF4TnVtYmVyT2ZGaWxlcykge1xuICAgICAgaWYgKGZpbGVzLmxlbmd0aCArIDEgPiBtYXhOdW1iZXJPZkZpbGVzKSB7XG4gICAgICAgIHRocm93IG5ldyBSZXN0cmljdGlvbkVycm9yKGAke3RoaXMuaTE4bigneW91Q2FuT25seVVwbG9hZFgnLCB7IHNtYXJ0X2NvdW50OiBtYXhOdW1iZXJPZkZpbGVzIH0pfWApXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGFsbG93ZWRGaWxlVHlwZXMpIHtcbiAgICAgIGNvbnN0IGlzQ29ycmVjdEZpbGVUeXBlID0gYWxsb3dlZEZpbGVUeXBlcy5zb21lKCh0eXBlKSA9PiB7XG4gICAgICAgIC8vIGNoZWNrIGlmIHRoaXMgaXMgYSBtaW1lLXR5cGVcbiAgICAgICAgaWYgKHR5cGUuaW5kZXhPZignLycpID4gLTEpIHtcbiAgICAgICAgICBpZiAoIWZpbGUudHlwZSkgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgcmV0dXJuIG1hdGNoKGZpbGUudHlwZS5yZXBsYWNlKC87Lio/JC8sICcnKSwgdHlwZSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG90aGVyd2lzZSB0aGlzIGlzIGxpa2VseSBhbiBleHRlbnNpb25cbiAgICAgICAgaWYgKHR5cGVbMF0gPT09ICcuJyAmJiBmaWxlLmV4dGVuc2lvbikge1xuICAgICAgICAgIHJldHVybiBmaWxlLmV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpID09PSB0eXBlLnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9KVxuXG4gICAgICBpZiAoIWlzQ29ycmVjdEZpbGVUeXBlKSB7XG4gICAgICAgIGNvbnN0IGFsbG93ZWRGaWxlVHlwZXNTdHJpbmcgPSBhbGxvd2VkRmlsZVR5cGVzLmpvaW4oJywgJylcbiAgICAgICAgdGhyb3cgbmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCd5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzJywgeyB0eXBlczogYWxsb3dlZEZpbGVUeXBlc1N0cmluZyB9KSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBXZSBjYW4ndCBjaGVjayBtYXhUb3RhbEZpbGVTaXplIGlmIHRoZSBzaXplIGlzIHVua25vd24uXG4gICAgaWYgKG1heFRvdGFsRmlsZVNpemUgJiYgZmlsZS5zaXplICE9IG51bGwpIHtcbiAgICAgIGxldCB0b3RhbEZpbGVzU2l6ZSA9IDBcbiAgICAgIHRvdGFsRmlsZXNTaXplICs9IGZpbGUuc2l6ZVxuICAgICAgZmlsZXMuZm9yRWFjaCgoZikgPT4ge1xuICAgICAgICB0b3RhbEZpbGVzU2l6ZSArPSBmLnNpemVcbiAgICAgIH0pXG4gICAgICBpZiAodG90YWxGaWxlc1NpemUgPiBtYXhUb3RhbEZpbGVTaXplKSB7XG4gICAgICAgIHRocm93IG5ldyBSZXN0cmljdGlvbkVycm9yKHRoaXMuaTE4bignZXhjZWVkc1NpemUnLCB7XG4gICAgICAgICAgc2l6ZTogcHJldHRpZXJCeXRlcyhtYXhUb3RhbEZpbGVTaXplKSxcbiAgICAgICAgICBmaWxlOiBmaWxlLm5hbWUsXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdlIGNhbid0IGNoZWNrIG1heEZpbGVTaXplIGlmIHRoZSBzaXplIGlzIHVua25vd24uXG4gICAgaWYgKG1heEZpbGVTaXplICYmIGZpbGUuc2l6ZSAhPSBudWxsKSB7XG4gICAgICBpZiAoZmlsZS5zaXplID4gbWF4RmlsZVNpemUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCdleGNlZWRzU2l6ZScsIHtcbiAgICAgICAgICBzaXplOiBwcmV0dGllckJ5dGVzKG1heEZpbGVTaXplKSxcbiAgICAgICAgICBmaWxlOiBmaWxlLm5hbWUsXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFdlIGNhbid0IGNoZWNrIG1pbkZpbGVTaXplIGlmIHRoZSBzaXplIGlzIHVua25vd24uXG4gICAgaWYgKG1pbkZpbGVTaXplICYmIGZpbGUuc2l6ZSAhPSBudWxsKSB7XG4gICAgICBpZiAoZmlsZS5zaXplIDwgbWluRmlsZVNpemUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCdpbmZlcmlvclNpemUnLCB7XG4gICAgICAgICAgc2l6ZTogcHJldHRpZXJCeXRlcyhtaW5GaWxlU2l6ZSksXG4gICAgICAgIH0pKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBtaW5OdW1iZXJPZkZpbGVzIHJlc3RyaWN0aW9uIGlzIHJlYWNoZWQgYmVmb3JlIHVwbG9hZGluZy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gICNjaGVja01pbk51bWJlck9mRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3QgeyBtaW5OdW1iZXJPZkZpbGVzIH0gPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zXG4gICAgaWYgKE9iamVjdC5rZXlzKGZpbGVzKS5sZW5ndGggPCBtaW5OdW1iZXJPZkZpbGVzKSB7XG4gICAgICB0aHJvdyBuZXcgUmVzdHJpY3Rpb25FcnJvcihgJHt0aGlzLmkxOG4oJ3lvdUhhdmVUb0F0TGVhc3RTZWxlY3RYJywgeyBzbWFydF9jb3VudDogbWluTnVtYmVyT2ZGaWxlcyB9KX1gKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiByZXF1aXJlZE1ldGFGaWVsZCByZXN0cmljdGlvbiBpcyBtZXQgZm9yIGEgc3BlY2lmaWMgZmlsZS5cbiAgICpcbiAgICovXG4gICNjaGVja1JlcXVpcmVkTWV0YUZpZWxkc09uRmlsZSAoZmlsZSkge1xuICAgIGNvbnN0IHsgcmVxdWlyZWRNZXRhRmllbGRzIH0gPSB0aGlzLm9wdHMucmVzdHJpY3Rpb25zXG4gICAgY29uc3QgeyBoYXNPd25Qcm9wZXJ0eSB9ID0gT2JqZWN0LnByb3RvdHlwZVxuXG4gICAgY29uc3QgZXJyb3JzID0gW11cbiAgICBjb25zdCBtaXNzaW5nRmllbGRzID0gW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcXVpcmVkTWV0YUZpZWxkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKCFoYXNPd25Qcm9wZXJ0eS5jYWxsKGZpbGUubWV0YSwgcmVxdWlyZWRNZXRhRmllbGRzW2ldKSB8fCBmaWxlLm1ldGFbcmVxdWlyZWRNZXRhRmllbGRzW2ldXSA9PT0gJycpIHtcbiAgICAgICAgY29uc3QgZXJyID0gbmV3IFJlc3RyaWN0aW9uRXJyb3IoYCR7dGhpcy5pMThuKCdtaXNzaW5nUmVxdWlyZWRNZXRhRmllbGRPbkZpbGUnLCB7IGZpbGVOYW1lOiBmaWxlLm5hbWUgfSl9YClcbiAgICAgICAgZXJyb3JzLnB1c2goZXJyKVxuICAgICAgICBtaXNzaW5nRmllbGRzLnB1c2gocmVxdWlyZWRNZXRhRmllbGRzW2ldKVxuICAgICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KGVyciwgeyBmaWxlLCBzaG93SW5mb3JtZXI6IGZhbHNlLCB0aHJvd0VycjogZmFsc2UgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwgeyBtaXNzaW5nUmVxdWlyZWRNZXRhRmllbGRzOiBtaXNzaW5nRmllbGRzIH0pXG4gICAgcmV0dXJuIGVycm9yc1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHJlcXVpcmVkTWV0YUZpZWxkIHJlc3RyaWN0aW9uIGlzIG1ldCBiZWZvcmUgdXBsb2FkaW5nLlxuICAgKlxuICAgKi9cbiAgI2NoZWNrUmVxdWlyZWRNZXRhRmllbGRzIChmaWxlcykge1xuICAgIGNvbnN0IGVycm9ycyA9IE9iamVjdC5rZXlzKGZpbGVzKS5mbGF0TWFwKChmaWxlSUQpID0+IHtcbiAgICAgIGNvbnN0IGZpbGUgPSB0aGlzLmdldEZpbGUoZmlsZUlEKVxuICAgICAgcmV0dXJuIHRoaXMuI2NoZWNrUmVxdWlyZWRNZXRhRmllbGRzT25GaWxlKGZpbGUpXG4gICAgfSlcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgQWdncmVnYXRlUmVzdHJpY3Rpb25FcnJvcihlcnJvcnMsIGAke3RoaXMuaTE4bignbWlzc2luZ1JlcXVpcmVkTWV0YUZpZWxkJyl9YClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTG9ncyBhbiBlcnJvciwgc2V0cyBJbmZvcm1lciBtZXNzYWdlLCB0aGVuIHRocm93cyB0aGUgZXJyb3IuXG4gICAqIEVtaXRzIGEgJ3Jlc3RyaWN0aW9uLWZhaWxlZCcgZXZlbnQgaWYgaXTigJlzIGEgcmVzdHJpY3Rpb24gZXJyb3JcbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3QgfCBzdHJpbmd9IGVyciDigJQgRXJyb3Igb2JqZWN0IG9yIHBsYWluIHN0cmluZyBtZXNzYWdlXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5zaG93SW5mb3JtZXI9dHJ1ZV0g4oCUIFNvbWV0aW1lcyBkZXZlbG9wZXIgbWlnaHQgd2FudCB0byBzaG93IEluZm9ybWVyIG1hbnVhbGx5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy5maWxlPW51bGxdIOKAlCBGaWxlIG9iamVjdCB1c2VkIHRvIGVtaXQgdGhlIHJlc3RyaWN0aW9uIGVycm9yXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudGhyb3dFcnI9dHJ1ZV0g4oCUIEVycm9ycyBzaG91bGRu4oCZdCBiZSB0aHJvd24sIGZvciBleGFtcGxlLCBpbiBgdXBsb2FkLWVycm9yYCBldmVudFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgI3Nob3dPckxvZ0Vycm9yQW5kVGhyb3cgKGVyciwgeyBzaG93SW5mb3JtZXIgPSB0cnVlLCBmaWxlID0gbnVsbCwgdGhyb3dFcnIgPSB0cnVlIH0gPSB7fSkge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSB0eXBlb2YgZXJyID09PSAnb2JqZWN0JyA/IGVyci5tZXNzYWdlIDogZXJyXG4gICAgY29uc3QgZGV0YWlscyA9ICh0eXBlb2YgZXJyID09PSAnb2JqZWN0JyAmJiBlcnIuZGV0YWlscykgPyBlcnIuZGV0YWlscyA6ICcnXG5cbiAgICAvLyBSZXN0cmljdGlvbiBlcnJvcnMgc2hvdWxkIGJlIGxvZ2dlZCwgYnV0IG5vdCBhcyBlcnJvcnMsXG4gICAgLy8gYXMgdGhleSBhcmUgZXhwZWN0ZWQgYW5kIHNob3duIGluIHRoZSBVSS5cbiAgICBsZXQgbG9nTWVzc2FnZVdpdGhEZXRhaWxzID0gbWVzc2FnZVxuICAgIGlmIChkZXRhaWxzKSB7XG4gICAgICBsb2dNZXNzYWdlV2l0aERldGFpbHMgKz0gYCAke2RldGFpbHN9YFxuICAgIH1cbiAgICBpZiAoZXJyLmlzUmVzdHJpY3Rpb24pIHtcbiAgICAgIHRoaXMubG9nKGxvZ01lc3NhZ2VXaXRoRGV0YWlscylcbiAgICAgIHRoaXMuZW1pdCgncmVzdHJpY3Rpb24tZmFpbGVkJywgZmlsZSwgZXJyKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmxvZyhsb2dNZXNzYWdlV2l0aERldGFpbHMsICdlcnJvcicpXG4gICAgfVxuXG4gICAgLy8gU29tZXRpbWVzIGluZm9ybWVyIGhhcyB0byBiZSBzaG93biBtYW51YWxseSBieSB0aGUgZGV2ZWxvcGVyLFxuICAgIC8vIGZvciBleGFtcGxlLCBpbiBgb25CZWZvcmVGaWxlQWRkZWRgLlxuICAgIGlmIChzaG93SW5mb3JtZXIpIHtcbiAgICAgIHRoaXMuaW5mbyh7IG1lc3NhZ2UsIGRldGFpbHMgfSwgJ2Vycm9yJywgdGhpcy5vcHRzLmluZm9UaW1lb3V0KVxuICAgIH1cblxuICAgIGlmICh0aHJvd0Vycikge1xuICAgICAgdGhyb3cgKHR5cGVvZiBlcnIgPT09ICdvYmplY3QnID8gZXJyIDogbmV3IEVycm9yKGVycikpXG4gICAgfVxuICB9XG5cbiAgI2Fzc2VydE5ld1VwbG9hZEFsbG93ZWQgKGZpbGUpIHtcbiAgICBjb25zdCB7IGFsbG93TmV3VXBsb2FkIH0gPSB0aGlzLmdldFN0YXRlKClcblxuICAgIGlmIChhbGxvd05ld1VwbG9hZCA9PT0gZmFsc2UpIHtcbiAgICAgIHRoaXMuI3Nob3dPckxvZ0Vycm9yQW5kVGhyb3cobmV3IFJlc3RyaWN0aW9uRXJyb3IodGhpcy5pMThuKCdub01vcmVGaWxlc0FsbG93ZWQnKSksIHsgZmlsZSB9KVxuICAgIH1cbiAgfVxuXG4gIGNoZWNrSWZGaWxlQWxyZWFkeUV4aXN0cyAoZmlsZUlEKSB7XG4gICAgY29uc3QgeyBmaWxlcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG5cbiAgICBpZiAoZmlsZXNbZmlsZUlEXSAmJiAhZmlsZXNbZmlsZUlEXS5pc0dob3N0KSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBmaWxlIHN0YXRlIG9iamVjdCBiYXNlZCBvbiB1c2VyLXByb3ZpZGVkIGBhZGRGaWxlKClgIG9wdGlvbnMuXG4gICAqXG4gICAqIE5vdGUgdGhpcyBpcyBleHRyZW1lbHkgc2lkZS1lZmZlY3RmdWwgYW5kIHNob3VsZCBvbmx5IGJlIGRvbmUgd2hlbiBhIGZpbGUgc3RhdGUgb2JqZWN0XG4gICAqIHdpbGwgYmUgYWRkZWQgdG8gc3RhdGUgaW1tZWRpYXRlbHkgYWZ0ZXJ3YXJkIVxuICAgKlxuICAgKiBUaGUgYGZpbGVzYCB2YWx1ZSBpcyBwYXNzZWQgaW4gYmVjYXVzZSBpdCBtYXkgYmUgdXBkYXRlZCBieSB0aGUgY2FsbGVyIHdpdGhvdXQgdXBkYXRpbmcgdGhlIHN0b3JlLlxuICAgKi9cbiAgI2NoZWNrQW5kQ3JlYXRlRmlsZVN0YXRlT2JqZWN0IChmaWxlcywgZmlsZURlc2NyaXB0b3IpIHtcbiAgICBjb25zdCBmaWxlVHlwZSA9IGdldEZpbGVUeXBlKGZpbGVEZXNjcmlwdG9yKVxuICAgIGNvbnN0IGZpbGVOYW1lID0gZ2V0RmlsZU5hbWUoZmlsZVR5cGUsIGZpbGVEZXNjcmlwdG9yKVxuICAgIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlTmFtZSkuZXh0ZW5zaW9uXG4gICAgY29uc3QgaXNSZW1vdGUgPSBCb29sZWFuKGZpbGVEZXNjcmlwdG9yLmlzUmVtb3RlKVxuICAgIGNvbnN0IGZpbGVJRCA9IGdlbmVyYXRlRmlsZUlEKHtcbiAgICAgIC4uLmZpbGVEZXNjcmlwdG9yLFxuICAgICAgdHlwZTogZmlsZVR5cGUsXG4gICAgfSlcblxuICAgIGlmICh0aGlzLmNoZWNrSWZGaWxlQWxyZWFkeUV4aXN0cyhmaWxlSUQpKSB7XG4gICAgICBjb25zdCBlcnJvciA9IG5ldyBSZXN0cmljdGlvbkVycm9yKHRoaXMuaTE4bignbm9EdXBsaWNhdGVzJywgeyBmaWxlTmFtZSB9KSlcbiAgICAgIHRoaXMuI3Nob3dPckxvZ0Vycm9yQW5kVGhyb3coZXJyb3IsIHsgZmlsZTogZmlsZURlc2NyaXB0b3IgfSlcbiAgICB9XG5cbiAgICBjb25zdCBtZXRhID0gZmlsZURlc2NyaXB0b3IubWV0YSB8fCB7fVxuICAgIG1ldGEubmFtZSA9IGZpbGVOYW1lXG4gICAgbWV0YS50eXBlID0gZmlsZVR5cGVcblxuICAgIC8vIGBudWxsYCBtZWFucyB0aGUgc2l6ZSBpcyB1bmtub3duLlxuICAgIGNvbnN0IHNpemUgPSBOdW1iZXIuaXNGaW5pdGUoZmlsZURlc2NyaXB0b3IuZGF0YS5zaXplKSA/IGZpbGVEZXNjcmlwdG9yLmRhdGEuc2l6ZSA6IG51bGxcblxuICAgIGxldCBuZXdGaWxlID0ge1xuICAgICAgc291cmNlOiBmaWxlRGVzY3JpcHRvci5zb3VyY2UgfHwgJycsXG4gICAgICBpZDogZmlsZUlELFxuICAgICAgbmFtZTogZmlsZU5hbWUsXG4gICAgICBleHRlbnNpb246IGZpbGVFeHRlbnNpb24gfHwgJycsXG4gICAgICBtZXRhOiB7XG4gICAgICAgIC4uLnRoaXMuZ2V0U3RhdGUoKS5tZXRhLFxuICAgICAgICAuLi5tZXRhLFxuICAgICAgfSxcbiAgICAgIHR5cGU6IGZpbGVUeXBlLFxuICAgICAgZGF0YTogZmlsZURlc2NyaXB0b3IuZGF0YSxcbiAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgIGJ5dGVzVXBsb2FkZWQ6IDAsXG4gICAgICAgIGJ5dGVzVG90YWw6IHNpemUsXG4gICAgICAgIHVwbG9hZENvbXBsZXRlOiBmYWxzZSxcbiAgICAgICAgdXBsb2FkU3RhcnRlZDogbnVsbCxcbiAgICAgIH0sXG4gICAgICBzaXplLFxuICAgICAgaXNSZW1vdGUsXG4gICAgICByZW1vdGU6IGZpbGVEZXNjcmlwdG9yLnJlbW90ZSB8fCAnJyxcbiAgICAgIHByZXZpZXc6IGZpbGVEZXNjcmlwdG9yLnByZXZpZXcsXG4gICAgfVxuXG4gICAgY29uc3Qgb25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPSB0aGlzLm9wdHMub25CZWZvcmVGaWxlQWRkZWQobmV3RmlsZSwgZmlsZXMpXG5cbiAgICBpZiAob25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICAvLyBEb27igJl0IHNob3cgVUkgaW5mbyBmb3IgdGhpcyBlcnJvciwgYXMgaXQgc2hvdWxkIGJlIGRvbmUgYnkgdGhlIGRldmVsb3BlclxuICAgICAgdGhpcy4jc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhuZXcgUmVzdHJpY3Rpb25FcnJvcignQ2Fubm90IGFkZCB0aGUgZmlsZSBiZWNhdXNlIG9uQmVmb3JlRmlsZUFkZGVkIHJldHVybmVkIGZhbHNlLicpLCB7IHNob3dJbmZvcm1lcjogZmFsc2UsIGZpbGVEZXNjcmlwdG9yIH0pXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb25CZWZvcmVGaWxlQWRkZWRSZXN1bHQgPT09ICdvYmplY3QnICYmIG9uQmVmb3JlRmlsZUFkZGVkUmVzdWx0ICE9PSBudWxsKSB7XG4gICAgICBuZXdGaWxlID0gb25CZWZvcmVGaWxlQWRkZWRSZXN1bHRcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgY29uc3QgZmlsZXNBcnJheSA9IE9iamVjdC5rZXlzKGZpbGVzKS5tYXAoaSA9PiBmaWxlc1tpXSlcbiAgICAgIHRoaXMuI2NoZWNrUmVzdHJpY3Rpb25zKG5ld0ZpbGUsIGZpbGVzQXJyYXkpXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KGVyciwgeyBmaWxlOiBuZXdGaWxlIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ld0ZpbGVcbiAgfVxuXG4gIC8vIFNjaGVkdWxlIGFuIHVwbG9hZCBpZiBgYXV0b1Byb2NlZWRgIGlzIGVuYWJsZWQuXG4gICNzdGFydElmQXV0b1Byb2NlZWQgKCkge1xuICAgIGlmICh0aGlzLm9wdHMuYXV0b1Byb2NlZWQgJiYgIXRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQpIHtcbiAgICAgIHRoaXMuc2NoZWR1bGVkQXV0b1Byb2NlZWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgdGhpcy5zY2hlZHVsZWRBdXRvUHJvY2VlZCA9IG51bGxcbiAgICAgICAgdGhpcy51cGxvYWQoKS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgaWYgKCFlcnIuaXNSZXN0cmljdGlvbikge1xuICAgICAgICAgICAgdGhpcy5sb2coZXJyLnN0YWNrIHx8IGVyci5tZXNzYWdlIHx8IGVycilcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9LCA0KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgYSBuZXcgZmlsZSB0byBgc3RhdGUuZmlsZXNgLiBUaGlzIHdpbGwgcnVuIGBvbkJlZm9yZUZpbGVBZGRlZGAsXG4gICAqIHRyeSB0byBndWVzcyBmaWxlIHR5cGUgaW4gYSBjbGV2ZXIgd2F5LCBjaGVjayBmaWxlIGFnYWluc3QgcmVzdHJpY3Rpb25zLFxuICAgKiBhbmQgc3RhcnQgYW4gdXBsb2FkIGlmIGBhdXRvUHJvY2VlZCA9PT0gdHJ1ZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlIG9iamVjdCB0byBhZGRcbiAgICogQHJldHVybnMge3N0cmluZ30gaWQgZm9yIHRoZSBhZGRlZCBmaWxlXG4gICAqL1xuICBhZGRGaWxlIChmaWxlKSB7XG4gICAgdGhpcy4jYXNzZXJ0TmV3VXBsb2FkQWxsb3dlZChmaWxlKVxuXG4gICAgY29uc3QgeyBmaWxlcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG4gICAgbGV0IG5ld0ZpbGUgPSB0aGlzLiNjaGVja0FuZENyZWF0ZUZpbGVTdGF0ZU9iamVjdChmaWxlcywgZmlsZSlcblxuICAgIC8vIFVzZXJzIGFyZSBhc2tlZCB0byByZS1zZWxlY3QgcmVjb3ZlcmVkIGZpbGVzIHdpdGhvdXQgZGF0YSxcbiAgICAvLyBhbmQgdG8ga2VlcCB0aGUgcHJvZ3Jlc3MsIG1ldGEgYW5kIGV2ZXJ0aGluZyBlbHNlLCB3ZSBvbmx5IHJlcGxhY2Ugc2FpZCBkYXRhXG4gICAgaWYgKGZpbGVzW25ld0ZpbGUuaWRdICYmIGZpbGVzW25ld0ZpbGUuaWRdLmlzR2hvc3QpIHtcbiAgICAgIG5ld0ZpbGUgPSB7XG4gICAgICAgIC4uLmZpbGVzW25ld0ZpbGUuaWRdLFxuICAgICAgICBkYXRhOiBmaWxlLmRhdGEsXG4gICAgICAgIGlzR2hvc3Q6IGZhbHNlLFxuICAgICAgfVxuICAgICAgdGhpcy5sb2coYFJlcGxhY2VkIHRoZSBibG9iIGluIHRoZSByZXN0b3JlZCBnaG9zdCBmaWxlOiAke25ld0ZpbGUubmFtZX0sICR7bmV3RmlsZS5pZH1gKVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgZmlsZXM6IHtcbiAgICAgICAgLi4uZmlsZXMsXG4gICAgICAgIFtuZXdGaWxlLmlkXTogbmV3RmlsZSxcbiAgICAgIH0sXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgnZmlsZS1hZGRlZCcsIG5ld0ZpbGUpXG4gICAgdGhpcy5lbWl0KCdmaWxlcy1hZGRlZCcsIFtuZXdGaWxlXSlcbiAgICB0aGlzLmxvZyhgQWRkZWQgZmlsZTogJHtuZXdGaWxlLm5hbWV9LCAke25ld0ZpbGUuaWR9LCBtaW1lIHR5cGU6ICR7bmV3RmlsZS50eXBlfWApXG5cbiAgICB0aGlzLiNzdGFydElmQXV0b1Byb2NlZWQoKVxuXG4gICAgcmV0dXJuIG5ld0ZpbGUuaWRcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgbXVsdGlwbGUgZmlsZXMgdG8gYHN0YXRlLmZpbGVzYC4gU2VlIHRoZSBgYWRkRmlsZSgpYCBkb2N1bWVudGF0aW9uLlxuICAgKlxuICAgKiBJZiBhbiBlcnJvciBvY2N1cnMgd2hpbGUgYWRkaW5nIGEgZmlsZSwgaXQgaXMgbG9nZ2VkIGFuZCB0aGUgdXNlciBpcyBub3RpZmllZC5cbiAgICogVGhpcyBpcyBnb29kIGZvciBVSSBwbHVnaW5zLCBidXQgbm90IGZvciBwcm9ncmFtbWF0aWMgdXNlLlxuICAgKiBQcm9ncmFtbWF0aWMgdXNlcnMgc2hvdWxkIHVzdWFsbHkgc3RpbGwgdXNlIGBhZGRGaWxlKClgIG9uIGluZGl2aWR1YWwgZmlsZXMuXG4gICAqL1xuICBhZGRGaWxlcyAoZmlsZURlc2NyaXB0b3JzKSB7XG4gICAgdGhpcy4jYXNzZXJ0TmV3VXBsb2FkQWxsb3dlZCgpXG5cbiAgICAvLyBjcmVhdGUgYSBjb3B5IG9mIHRoZSBmaWxlcyBvYmplY3Qgb25seSBvbmNlXG4gICAgY29uc3QgZmlsZXMgPSB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5maWxlcyB9XG4gICAgY29uc3QgbmV3RmlsZXMgPSBbXVxuICAgIGNvbnN0IGVycm9ycyA9IFtdXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmaWxlRGVzY3JpcHRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBuZXdGaWxlID0gdGhpcy4jY2hlY2tBbmRDcmVhdGVGaWxlU3RhdGVPYmplY3QoZmlsZXMsIGZpbGVEZXNjcmlwdG9yc1tpXSlcbiAgICAgICAgLy8gVXNlcnMgYXJlIGFza2VkIHRvIHJlLXNlbGVjdCByZWNvdmVyZWQgZmlsZXMgd2l0aG91dCBkYXRhLFxuICAgICAgICAvLyBhbmQgdG8ga2VlcCB0aGUgcHJvZ3Jlc3MsIG1ldGEgYW5kIGV2ZXJ0aGluZyBlbHNlLCB3ZSBvbmx5IHJlcGxhY2Ugc2FpZCBkYXRhXG4gICAgICAgIGlmIChmaWxlc1tuZXdGaWxlLmlkXSAmJiBmaWxlc1tuZXdGaWxlLmlkXS5pc0dob3N0KSB7XG4gICAgICAgICAgbmV3RmlsZSA9IHtcbiAgICAgICAgICAgIC4uLmZpbGVzW25ld0ZpbGUuaWRdLFxuICAgICAgICAgICAgZGF0YTogZmlsZURlc2NyaXB0b3JzW2ldLmRhdGEsXG4gICAgICAgICAgICBpc0dob3N0OiBmYWxzZSxcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5sb2coYFJlcGxhY2VkIGJsb2IgaW4gYSBnaG9zdCBmaWxlOiAke25ld0ZpbGUubmFtZX0sICR7bmV3RmlsZS5pZH1gKVxuICAgICAgICB9XG4gICAgICAgIGZpbGVzW25ld0ZpbGUuaWRdID0gbmV3RmlsZVxuICAgICAgICBuZXdGaWxlcy5wdXNoKG5ld0ZpbGUpXG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgaWYgKCFlcnIuaXNSZXN0cmljdGlvbikge1xuICAgICAgICAgIGVycm9ycy5wdXNoKGVycilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlcyB9KVxuXG4gICAgbmV3RmlsZXMuZm9yRWFjaCgobmV3RmlsZSkgPT4ge1xuICAgICAgdGhpcy5lbWl0KCdmaWxlLWFkZGVkJywgbmV3RmlsZSlcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdmaWxlcy1hZGRlZCcsIG5ld0ZpbGVzKVxuXG4gICAgaWYgKG5ld0ZpbGVzLmxlbmd0aCA+IDUpIHtcbiAgICAgIHRoaXMubG9nKGBBZGRlZCBiYXRjaCBvZiAke25ld0ZpbGVzLmxlbmd0aH0gZmlsZXNgKVxuICAgIH0gZWxzZSB7XG4gICAgICBPYmplY3Qua2V5cyhuZXdGaWxlcykuZm9yRWFjaChmaWxlSUQgPT4ge1xuICAgICAgICB0aGlzLmxvZyhgQWRkZWQgZmlsZTogJHtuZXdGaWxlc1tmaWxlSURdLm5hbWV9XFxuIGlkOiAke25ld0ZpbGVzW2ZpbGVJRF0uaWR9XFxuIHR5cGU6ICR7bmV3RmlsZXNbZmlsZUlEXS50eXBlfWApXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChuZXdGaWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLiNzdGFydElmQXV0b1Byb2NlZWQoKVxuICAgIH1cblxuICAgIGlmIChlcnJvcnMubGVuZ3RoID4gMCkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSAnTXVsdGlwbGUgZXJyb3JzIG9jY3VycmVkIHdoaWxlIGFkZGluZyBmaWxlczpcXG4nXG4gICAgICBlcnJvcnMuZm9yRWFjaCgoc3ViRXJyb3IpID0+IHtcbiAgICAgICAgbWVzc2FnZSArPSBgXFxuICogJHtzdWJFcnJvci5tZXNzYWdlfWBcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMuaW5mbyh7XG4gICAgICAgIG1lc3NhZ2U6IHRoaXMuaTE4bignYWRkQnVsa0ZpbGVzRmFpbGVkJywgeyBzbWFydF9jb3VudDogZXJyb3JzLmxlbmd0aCB9KSxcbiAgICAgICAgZGV0YWlsczogbWVzc2FnZSxcbiAgICAgIH0sICdlcnJvcicsIHRoaXMub3B0cy5pbmZvVGltZW91dClcblxuICAgICAgaWYgKHR5cGVvZiBBZ2dyZWdhdGVFcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgQWdncmVnYXRlRXJyb3IoZXJyb3JzLCBtZXNzYWdlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpXG4gICAgICAgIGVyci5lcnJvcnMgPSBlcnJvcnNcbiAgICAgICAgdGhyb3cgZXJyXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVtb3ZlRmlsZXMgKGZpbGVJRHMsIHJlYXNvbikge1xuICAgIGNvbnN0IHsgZmlsZXMsIGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBjb25zdCB1cGRhdGVkRmlsZXMgPSB7IC4uLmZpbGVzIH1cbiAgICBjb25zdCB1cGRhdGVkVXBsb2FkcyA9IHsgLi4uY3VycmVudFVwbG9hZHMgfVxuXG4gICAgY29uc3QgcmVtb3ZlZEZpbGVzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIGZpbGVJRHMuZm9yRWFjaCgoZmlsZUlEKSA9PiB7XG4gICAgICBpZiAoZmlsZXNbZmlsZUlEXSkge1xuICAgICAgICByZW1vdmVkRmlsZXNbZmlsZUlEXSA9IGZpbGVzW2ZpbGVJRF1cbiAgICAgICAgZGVsZXRlIHVwZGF0ZWRGaWxlc1tmaWxlSURdXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIFJlbW92ZSBmaWxlcyBmcm9tIHRoZSBgZmlsZUlEc2AgbGlzdCBpbiBlYWNoIHVwbG9hZC5cbiAgICBmdW5jdGlvbiBmaWxlSXNOb3RSZW1vdmVkICh1cGxvYWRGaWxlSUQpIHtcbiAgICAgIHJldHVybiByZW1vdmVkRmlsZXNbdXBsb2FkRmlsZUlEXSA9PT0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXModXBkYXRlZFVwbG9hZHMpLmZvckVhY2goKHVwbG9hZElEKSA9PiB7XG4gICAgICBjb25zdCBuZXdGaWxlSURzID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdLmZpbGVJRHMuZmlsdGVyKGZpbGVJc05vdFJlbW92ZWQpXG5cbiAgICAgIC8vIFJlbW92ZSB0aGUgdXBsb2FkIGlmIG5vIGZpbGVzIGFyZSBhc3NvY2lhdGVkIHdpdGggaXQgYW55bW9yZS5cbiAgICAgIGlmIChuZXdGaWxlSURzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBkZWxldGUgdXBkYXRlZFVwbG9hZHNbdXBsb2FkSURdXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICB1cGRhdGVkVXBsb2Fkc1t1cGxvYWRJRF0gPSB7XG4gICAgICAgIC4uLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSxcbiAgICAgICAgZmlsZUlEczogbmV3RmlsZUlEcyxcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY29uc3Qgc3RhdGVVcGRhdGUgPSB7XG4gICAgICBjdXJyZW50VXBsb2FkczogdXBkYXRlZFVwbG9hZHMsXG4gICAgICBmaWxlczogdXBkYXRlZEZpbGVzLFxuICAgIH1cblxuICAgIC8vIElmIGFsbCBmaWxlcyB3ZXJlIHJlbW92ZWQgLSBhbGxvdyBuZXcgdXBsb2FkcyxcbiAgICAvLyBhbmQgY2xlYXIgcmVjb3ZlcmVkU3RhdGVcbiAgICBpZiAoT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5sZW5ndGggPT09IDApIHtcbiAgICAgIHN0YXRlVXBkYXRlLmFsbG93TmV3VXBsb2FkID0gdHJ1ZVxuICAgICAgc3RhdGVVcGRhdGUuZXJyb3IgPSBudWxsXG4gICAgICBzdGF0ZVVwZGF0ZS5yZWNvdmVyZWRTdGF0ZSA9IG51bGxcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHN0YXRlVXBkYXRlKVxuICAgIHRoaXMuY2FsY3VsYXRlVG90YWxQcm9ncmVzcygpXG5cbiAgICBjb25zdCByZW1vdmVkRmlsZUlEcyA9IE9iamVjdC5rZXlzKHJlbW92ZWRGaWxlcylcbiAgICByZW1vdmVkRmlsZUlEcy5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgIHRoaXMuZW1pdCgnZmlsZS1yZW1vdmVkJywgcmVtb3ZlZEZpbGVzW2ZpbGVJRF0sIHJlYXNvbilcbiAgICB9KVxuXG4gICAgaWYgKHJlbW92ZWRGaWxlSURzLmxlbmd0aCA+IDUpIHtcbiAgICAgIHRoaXMubG9nKGBSZW1vdmVkICR7cmVtb3ZlZEZpbGVJRHMubGVuZ3RofSBmaWxlc2ApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubG9nKGBSZW1vdmVkIGZpbGVzOiAke3JlbW92ZWRGaWxlSURzLmpvaW4oJywgJyl9YClcbiAgICB9XG4gIH1cblxuICByZW1vdmVGaWxlIChmaWxlSUQsIHJlYXNvbiA9IG51bGwpIHtcbiAgICB0aGlzLnJlbW92ZUZpbGVzKFtmaWxlSURdLCByZWFzb24pXG4gIH1cblxuICBwYXVzZVJlc3VtZSAoZmlsZUlEKSB7XG4gICAgaWYgKCF0aGlzLmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLnJlc3VtYWJsZVVwbG9hZHNcbiAgICAgICAgIHx8IHRoaXMuZ2V0RmlsZShmaWxlSUQpLnVwbG9hZENvbXBsZXRlKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgY29uc3Qgd2FzUGF1c2VkID0gdGhpcy5nZXRGaWxlKGZpbGVJRCkuaXNQYXVzZWQgfHwgZmFsc2VcbiAgICBjb25zdCBpc1BhdXNlZCA9ICF3YXNQYXVzZWRcblxuICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGVJRCwge1xuICAgICAgaXNQYXVzZWQsXG4gICAgfSlcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkLXBhdXNlJywgZmlsZUlELCBpc1BhdXNlZClcblxuICAgIHJldHVybiBpc1BhdXNlZFxuICB9XG5cbiAgcGF1c2VBbGwgKCkge1xuICAgIGNvbnN0IHVwZGF0ZWRGaWxlcyA9IHsgLi4udGhpcy5nZXRTdGF0ZSgpLmZpbGVzIH1cbiAgICBjb25zdCBpblByb2dyZXNzVXBkYXRlZEZpbGVzID0gT2JqZWN0LmtleXModXBkYXRlZEZpbGVzKS5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiAhdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZENvbXBsZXRlXG4gICAgICAgICAgICAgJiYgdXBkYXRlZEZpbGVzW2ZpbGVdLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICB9KVxuXG4gICAgaW5Qcm9ncmVzc1VwZGF0ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICBjb25zdCB1cGRhdGVkRmlsZSA9IHsgLi4udXBkYXRlZEZpbGVzW2ZpbGVdLCBpc1BhdXNlZDogdHJ1ZSB9XG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG5cbiAgICB0aGlzLnNldFN0YXRlKHsgZmlsZXM6IHVwZGF0ZWRGaWxlcyB9KVxuICAgIHRoaXMuZW1pdCgncGF1c2UtYWxsJylcbiAgfVxuXG4gIHJlc3VtZUFsbCAoKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0geyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMgfVxuICAgIGNvbnN0IGluUHJvZ3Jlc3NVcGRhdGVkRmlsZXMgPSBPYmplY3Qua2V5cyh1cGRhdGVkRmlsZXMpLmZpbHRlcigoZmlsZSkgPT4ge1xuICAgICAgcmV0dXJuICF1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkQ29tcGxldGVcbiAgICAgICAgICAgICAmJiB1cGRhdGVkRmlsZXNbZmlsZV0ucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZFxuICAgIH0pXG5cbiAgICBpblByb2dyZXNzVXBkYXRlZEZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIGNvbnN0IHVwZGF0ZWRGaWxlID0ge1xuICAgICAgICAuLi51cGRhdGVkRmlsZXNbZmlsZV0sXG4gICAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICAgICAgZXJyb3I6IG51bGwsXG4gICAgICB9XG4gICAgICB1cGRhdGVkRmlsZXNbZmlsZV0gPSB1cGRhdGVkRmlsZVxuICAgIH0pXG4gICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzOiB1cGRhdGVkRmlsZXMgfSlcblxuICAgIHRoaXMuZW1pdCgncmVzdW1lLWFsbCcpXG4gIH1cblxuICByZXRyeUFsbCAoKSB7XG4gICAgY29uc3QgdXBkYXRlZEZpbGVzID0geyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMgfVxuICAgIGNvbnN0IGZpbGVzVG9SZXRyeSA9IE9iamVjdC5rZXlzKHVwZGF0ZWRGaWxlcykuZmlsdGVyKGZpbGUgPT4ge1xuICAgICAgcmV0dXJuIHVwZGF0ZWRGaWxlc1tmaWxlXS5lcnJvclxuICAgIH0pXG5cbiAgICBmaWxlc1RvUmV0cnkuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgICAgY29uc3QgdXBkYXRlZEZpbGUgPSB7XG4gICAgICAgIC4uLnVwZGF0ZWRGaWxlc1tmaWxlXSxcbiAgICAgICAgaXNQYXVzZWQ6IGZhbHNlLFxuICAgICAgICBlcnJvcjogbnVsbCxcbiAgICAgIH1cbiAgICAgIHVwZGF0ZWRGaWxlc1tmaWxlXSA9IHVwZGF0ZWRGaWxlXG4gICAgfSlcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGZpbGVzOiB1cGRhdGVkRmlsZXMsXG4gICAgICBlcnJvcjogbnVsbCxcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCdyZXRyeS1hbGwnLCBmaWxlc1RvUmV0cnkpXG5cbiAgICBpZiAoZmlsZXNUb1JldHJ5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgICAgIHN1Y2Nlc3NmdWw6IFtdLFxuICAgICAgICBmYWlsZWQ6IFtdLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuI2NyZWF0ZVVwbG9hZChmaWxlc1RvUmV0cnksIHtcbiAgICAgIGZvcmNlQWxsb3dOZXdVcGxvYWQ6IHRydWUsIC8vIGNyZWF0ZSBuZXcgdXBsb2FkIGV2ZW4gaWYgYWxsb3dOZXdVcGxvYWQ6IGZhbHNlXG4gICAgfSlcbiAgICByZXR1cm4gdGhpcy4jcnVuVXBsb2FkKHVwbG9hZElEKVxuICB9XG5cbiAgY2FuY2VsQWxsICgpIHtcbiAgICB0aGlzLmVtaXQoJ2NhbmNlbC1hbGwnKVxuXG4gICAgY29uc3QgeyBmaWxlcyB9ID0gdGhpcy5nZXRTdGF0ZSgpXG5cbiAgICBjb25zdCBmaWxlSURzID0gT2JqZWN0LmtleXMoZmlsZXMpXG4gICAgaWYgKGZpbGVJRHMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnJlbW92ZUZpbGVzKGZpbGVJRHMsICdjYW5jZWwtYWxsJylcbiAgICB9XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHRvdGFsUHJvZ3Jlc3M6IDAsXG4gICAgICBlcnJvcjogbnVsbCxcbiAgICAgIHJlY292ZXJlZFN0YXRlOiBudWxsLFxuICAgIH0pXG4gIH1cblxuICByZXRyeVVwbG9hZCAoZmlsZUlEKSB7XG4gICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZUlELCB7XG4gICAgICBlcnJvcjogbnVsbCxcbiAgICAgIGlzUGF1c2VkOiBmYWxzZSxcbiAgICB9KVxuXG4gICAgdGhpcy5lbWl0KCd1cGxvYWQtcmV0cnknLCBmaWxlSUQpXG5cbiAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuI2NyZWF0ZVVwbG9hZChbZmlsZUlEXSwge1xuICAgICAgZm9yY2VBbGxvd05ld1VwbG9hZDogdHJ1ZSwgLy8gY3JlYXRlIG5ldyB1cGxvYWQgZXZlbiBpZiBhbGxvd05ld1VwbG9hZDogZmFsc2VcbiAgICB9KVxuICAgIHJldHVybiB0aGlzLiNydW5VcGxvYWQodXBsb2FkSUQpXG4gIH1cblxuICByZXNldCAoKSB7XG4gICAgdGhpcy5jYW5jZWxBbGwoKVxuICB9XG5cbiAgbG9nb3V0ICgpIHtcbiAgICB0aGlzLml0ZXJhdGVQbHVnaW5zKHBsdWdpbiA9PiB7XG4gICAgICBpZiAocGx1Z2luLnByb3ZpZGVyICYmIHBsdWdpbi5wcm92aWRlci5sb2dvdXQpIHtcbiAgICAgICAgcGx1Z2luLnByb3ZpZGVyLmxvZ291dCgpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNhbGN1bGF0ZVByb2dyZXNzIChmaWxlLCBkYXRhKSB7XG4gICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBieXRlc1RvdGFsIG1heSBiZSBudWxsIG9yIHplcm87IGluIHRoYXQgY2FzZSB3ZSBjYW4ndCBkaXZpZGUgYnkgaXRcbiAgICBjb25zdCBjYW5IYXZlUGVyY2VudGFnZSA9IE51bWJlci5pc0Zpbml0ZShkYXRhLmJ5dGVzVG90YWwpICYmIGRhdGEuYnl0ZXNUb3RhbCA+IDBcbiAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICBwcm9ncmVzczoge1xuICAgICAgICAuLi50aGlzLmdldEZpbGUoZmlsZS5pZCkucHJvZ3Jlc3MsXG4gICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGRhdGEuYnl0ZXNVcGxvYWRlZCxcbiAgICAgICAgYnl0ZXNUb3RhbDogZGF0YS5ieXRlc1RvdGFsLFxuICAgICAgICBwZXJjZW50YWdlOiBjYW5IYXZlUGVyY2VudGFnZVxuICAgICAgICAgID8gTWF0aC5yb3VuZCgoZGF0YS5ieXRlc1VwbG9hZGVkIC8gZGF0YS5ieXRlc1RvdGFsKSAqIDEwMClcbiAgICAgICAgICA6IDAsXG4gICAgICB9LFxuICAgIH0pXG5cbiAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICB9XG5cbiAgY2FsY3VsYXRlVG90YWxQcm9ncmVzcyAoKSB7XG4gICAgLy8gY2FsY3VsYXRlIHRvdGFsIHByb2dyZXNzLCB1c2luZyB0aGUgbnVtYmVyIG9mIGZpbGVzIGN1cnJlbnRseSB1cGxvYWRpbmcsXG4gICAgLy8gbXVsdGlwbGllZCBieSAxMDAgYW5kIHRoZSBzdW1tIG9mIGluZGl2aWR1YWwgcHJvZ3Jlc3Mgb2YgZWFjaCBmaWxlXG4gICAgY29uc3QgZmlsZXMgPSB0aGlzLmdldEZpbGVzKClcblxuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IHtcbiAgICAgIHJldHVybiBmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWRcbiAgICAgICAgfHwgZmlsZS5wcm9ncmVzcy5wcmVwcm9jZXNzXG4gICAgICAgIHx8IGZpbGUucHJvZ3Jlc3MucG9zdHByb2Nlc3NcbiAgICB9KVxuXG4gICAgaWYgKGluUHJvZ3Jlc3MubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLmVtaXQoJ3Byb2dyZXNzJywgMClcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzOiAwIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBzaXplZEZpbGVzID0gaW5Qcm9ncmVzcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUucHJvZ3Jlc3MuYnl0ZXNUb3RhbCAhPSBudWxsKVxuICAgIGNvbnN0IHVuc2l6ZWRGaWxlcyA9IGluUHJvZ3Jlc3MuZmlsdGVyKChmaWxlKSA9PiBmaWxlLnByb2dyZXNzLmJ5dGVzVG90YWwgPT0gbnVsbClcblxuICAgIGlmIChzaXplZEZpbGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc3QgcHJvZ3Jlc3NNYXggPSBpblByb2dyZXNzLmxlbmd0aCAqIDEwMFxuICAgICAgY29uc3QgY3VycmVudFByb2dyZXNzID0gdW5zaXplZEZpbGVzLnJlZHVjZSgoYWNjLCBmaWxlKSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgKyBmaWxlLnByb2dyZXNzLnBlcmNlbnRhZ2VcbiAgICAgIH0sIDApXG4gICAgICBjb25zdCB0b3RhbFByb2dyZXNzID0gTWF0aC5yb3VuZCgoY3VycmVudFByb2dyZXNzIC8gcHJvZ3Jlc3NNYXgpICogMTAwKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IHRvdGFsUHJvZ3Jlc3MgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCB0b3RhbFNpemUgPSBzaXplZEZpbGVzLnJlZHVjZSgoYWNjLCBmaWxlKSA9PiB7XG4gICAgICByZXR1cm4gYWNjICsgZmlsZS5wcm9ncmVzcy5ieXRlc1RvdGFsXG4gICAgfSwgMClcbiAgICBjb25zdCBhdmVyYWdlU2l6ZSA9IHRvdGFsU2l6ZSAvIHNpemVkRmlsZXMubGVuZ3RoXG4gICAgdG90YWxTaXplICs9IGF2ZXJhZ2VTaXplICogdW5zaXplZEZpbGVzLmxlbmd0aFxuXG4gICAgbGV0IHVwbG9hZGVkU2l6ZSA9IDBcbiAgICBzaXplZEZpbGVzLmZvckVhY2goKGZpbGUpID0+IHtcbiAgICAgIHVwbG9hZGVkU2l6ZSArPSBmaWxlLnByb2dyZXNzLmJ5dGVzVXBsb2FkZWRcbiAgICB9KVxuICAgIHVuc2l6ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICB1cGxvYWRlZFNpemUgKz0gKGF2ZXJhZ2VTaXplICogKGZpbGUucHJvZ3Jlc3MucGVyY2VudGFnZSB8fCAwKSkgLyAxMDBcbiAgICB9KVxuXG4gICAgbGV0IHRvdGFsUHJvZ3Jlc3MgPSB0b3RhbFNpemUgPT09IDBcbiAgICAgID8gMFxuICAgICAgOiBNYXRoLnJvdW5kKCh1cGxvYWRlZFNpemUgLyB0b3RhbFNpemUpICogMTAwKVxuXG4gICAgLy8gaG90IGZpeCwgYmVjYXVzZTpcbiAgICAvLyB1cGxvYWRlZFNpemUgZW5kZWQgdXAgbGFyZ2VyIHRoYW4gdG90YWxTaXplLCByZXN1bHRpbmcgaW4gMTMyNSUgdG90YWxcbiAgICBpZiAodG90YWxQcm9ncmVzcyA+IDEwMCkge1xuICAgICAgdG90YWxQcm9ncmVzcyA9IDEwMFxuICAgIH1cblxuICAgIHRoaXMuc2V0U3RhdGUoeyB0b3RhbFByb2dyZXNzIH0pXG4gICAgdGhpcy5lbWl0KCdwcm9ncmVzcycsIHRvdGFsUHJvZ3Jlc3MpXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGxpc3RlbmVycyBmb3IgYWxsIGdsb2JhbCBhY3Rpb25zLCBsaWtlOlxuICAgKiBgZXJyb3JgLCBgZmlsZS1yZW1vdmVkYCwgYHVwbG9hZC1wcm9ncmVzc2BcbiAgICovXG4gICNhZGRMaXN0ZW5lcnMgKCkge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yXG4gICAgICogQHBhcmFtIHtvYmplY3R9IFtmaWxlXVxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbcmVzcG9uc2VdXG4gICAgICovXG4gICAgY29uc3QgZXJyb3JIYW5kbGVyID0gKGVycm9yLCBmaWxlLCByZXNwb25zZSkgPT4ge1xuICAgICAgbGV0IGVycm9yTXNnID0gZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvcidcbiAgICAgIGlmIChlcnJvci5kZXRhaWxzKSB7XG4gICAgICAgIGVycm9yTXNnICs9IGAgJHtlcnJvci5kZXRhaWxzfWBcbiAgICAgIH1cblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBlcnJvck1zZyB9KVxuXG4gICAgICBpZiAoZmlsZSAhPSBudWxsICYmIGZpbGUuaWQgaW4gdGhpcy5nZXRTdGF0ZSgpLmZpbGVzKSB7XG4gICAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgICBlcnJvcjogZXJyb3JNc2csXG4gICAgICAgICAgcmVzcG9uc2UsXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vbignZXJyb3InLCBlcnJvckhhbmRsZXIpXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtZXJyb3InLCAoZmlsZSwgZXJyb3IsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBlcnJvckhhbmRsZXIoZXJyb3IsIGZpbGUsIHJlc3BvbnNlKVxuXG4gICAgICBpZiAodHlwZW9mIGVycm9yID09PSAnb2JqZWN0JyAmJiBlcnJvci5tZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IG5ld0Vycm9yID0gbmV3IEVycm9yKGVycm9yLm1lc3NhZ2UpXG4gICAgICAgIG5ld0Vycm9yLmRldGFpbHMgPSBlcnJvci5tZXNzYWdlXG4gICAgICAgIGlmIChlcnJvci5kZXRhaWxzKSB7XG4gICAgICAgICAgbmV3RXJyb3IuZGV0YWlscyArPSBgICR7ZXJyb3IuZGV0YWlsc31gXG4gICAgICAgIH1cbiAgICAgICAgbmV3RXJyb3IubWVzc2FnZSA9IHRoaXMuaTE4bignZmFpbGVkVG9VcGxvYWQnLCB7IGZpbGU6IGZpbGUubmFtZSB9KVxuICAgICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KG5ld0Vycm9yLCB7XG4gICAgICAgICAgdGhyb3dFcnI6IGZhbHNlLFxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4jc2hvd09yTG9nRXJyb3JBbmRUaHJvdyhlcnJvciwge1xuICAgICAgICAgIHRocm93RXJyOiBmYWxzZSxcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdGhpcy5vbigndXBsb2FkJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGVycm9yOiBudWxsIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3VwbG9hZC1zdGFydGVkJywgKGZpbGUpID0+IHtcbiAgICAgIGlmICghdGhpcy5nZXRGaWxlKGZpbGUuaWQpKSB7XG4gICAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyBwcm9ncmVzcyBmb3IgYSBmaWxlIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHtmaWxlLmlkfWApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBwcm9ncmVzczoge1xuICAgICAgICAgIHVwbG9hZFN0YXJ0ZWQ6IERhdGUubm93KCksXG4gICAgICAgICAgdXBsb2FkQ29tcGxldGU6IGZhbHNlLFxuICAgICAgICAgIHBlcmNlbnRhZ2U6IDAsXG4gICAgICAgICAgYnl0ZXNVcGxvYWRlZDogMCxcbiAgICAgICAgICBieXRlc1RvdGFsOiBmaWxlLnNpemUsXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCd1cGxvYWQtcHJvZ3Jlc3MnLCB0aGlzLmNhbGN1bGF0ZVByb2dyZXNzKVxuXG4gICAgdGhpcy5vbigndXBsb2FkLXN1Y2Nlc3MnLCAoZmlsZSwgdXBsb2FkUmVzcCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGN1cnJlbnRQcm9ncmVzcyA9IHRoaXMuZ2V0RmlsZShmaWxlLmlkKS5wcm9ncmVzc1xuICAgICAgdGhpcy5zZXRGaWxlU3RhdGUoZmlsZS5pZCwge1xuICAgICAgICBwcm9ncmVzczoge1xuICAgICAgICAgIC4uLmN1cnJlbnRQcm9ncmVzcyxcbiAgICAgICAgICBwb3N0cHJvY2VzczogdGhpcy4jcG9zdFByb2Nlc3NvcnMuc2l6ZSA+IDAgPyB7XG4gICAgICAgICAgICBtb2RlOiAnaW5kZXRlcm1pbmF0ZScsXG4gICAgICAgICAgfSA6IG51bGwsXG4gICAgICAgICAgdXBsb2FkQ29tcGxldGU6IHRydWUsXG4gICAgICAgICAgcGVyY2VudGFnZTogMTAwLFxuICAgICAgICAgIGJ5dGVzVXBsb2FkZWQ6IGN1cnJlbnRQcm9ncmVzcy5ieXRlc1RvdGFsLFxuICAgICAgICB9LFxuICAgICAgICByZXNwb25zZTogdXBsb2FkUmVzcCxcbiAgICAgICAgdXBsb2FkVVJMOiB1cGxvYWRSZXNwLnVwbG9hZFVSTCxcbiAgICAgICAgaXNQYXVzZWQ6IGZhbHNlLFxuICAgICAgfSlcblxuICAgICAgLy8gUmVtb3RlIHByb3ZpZGVycyBzb21ldGltZXMgZG9uJ3QgdGVsbCB1cyB0aGUgZmlsZSBzaXplLFxuICAgICAgLy8gYnV0IHdlIGNhbiBrbm93IGhvdyBtYW55IGJ5dGVzIHdlIHVwbG9hZGVkIG9uY2UgdGhlIHVwbG9hZCBpcyBjb21wbGV0ZS5cbiAgICAgIGlmIChmaWxlLnNpemUgPT0gbnVsbCkge1xuICAgICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgICAgc2l6ZTogdXBsb2FkUmVzcC5ieXRlc1VwbG9hZGVkIHx8IGN1cnJlbnRQcm9ncmVzcy5ieXRlc1RvdGFsLFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICB0aGlzLmNhbGN1bGF0ZVRvdGFsUHJvZ3Jlc3MoKVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwcmVwcm9jZXNzLXByb2dyZXNzJywgKGZpbGUsIHByb2dyZXNzKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgcHJvZ3Jlc3M6IHsgLi4udGhpcy5nZXRGaWxlKGZpbGUuaWQpLnByb2dyZXNzLCBwcmVwcm9jZXNzOiBwcm9ncmVzcyB9LFxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgdGhpcy5vbigncHJlcHJvY2Vzcy1jb21wbGV0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbGVzID0geyAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMgfVxuICAgICAgZmlsZXNbZmlsZS5pZF0gPSB7IC4uLmZpbGVzW2ZpbGUuaWRdLCBwcm9ncmVzczogeyAuLi5maWxlc1tmaWxlLmlkXS5wcm9ncmVzcyB9IH1cbiAgICAgIGRlbGV0ZSBmaWxlc1tmaWxlLmlkXS5wcm9ncmVzcy5wcmVwcm9jZXNzXG5cbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBmaWxlcyB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwb3N0cHJvY2Vzcy1wcm9ncmVzcycsIChmaWxlLCBwcm9ncmVzcykgPT4ge1xuICAgICAgaWYgKCF0aGlzLmdldEZpbGUoZmlsZS5pZCkpIHtcbiAgICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHByb2dyZXNzIGZvciBhIGZpbGUgdGhhdCBoYXMgYmVlbiByZW1vdmVkOiAke2ZpbGUuaWR9YClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB0aGlzLnNldEZpbGVTdGF0ZShmaWxlLmlkLCB7XG4gICAgICAgIHByb2dyZXNzOiB7IC4uLnRoaXMuZ2V0U3RhdGUoKS5maWxlc1tmaWxlLmlkXS5wcm9ncmVzcywgcG9zdHByb2Nlc3M6IHByb2dyZXNzIH0sXG4gICAgICB9KVxuICAgIH0pXG5cbiAgICB0aGlzLm9uKCdwb3N0cHJvY2Vzcy1jb21wbGV0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuZ2V0RmlsZShmaWxlLmlkKSkge1xuICAgICAgICB0aGlzLmxvZyhgTm90IHNldHRpbmcgcHJvZ3Jlc3MgZm9yIGEgZmlsZSB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7ZmlsZS5pZH1gKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGNvbnN0IGZpbGVzID0ge1xuICAgICAgICAuLi50aGlzLmdldFN0YXRlKCkuZmlsZXMsXG4gICAgICB9XG4gICAgICBmaWxlc1tmaWxlLmlkXSA9IHtcbiAgICAgICAgLi4uZmlsZXNbZmlsZS5pZF0sXG4gICAgICAgIHByb2dyZXNzOiB7XG4gICAgICAgICAgLi4uZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MsXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgICBkZWxldGUgZmlsZXNbZmlsZS5pZF0ucHJvZ3Jlc3MucG9zdHByb2Nlc3NcblxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IGZpbGVzIH0pXG4gICAgfSlcblxuICAgIHRoaXMub24oJ3Jlc3RvcmVkJywgKCkgPT4ge1xuICAgICAgLy8gRmlsZXMgbWF5IGhhdmUgY2hhbmdlZC0tZW5zdXJlIHByb2dyZXNzIGlzIHN0aWxsIGFjY3VyYXRlLlxuICAgICAgdGhpcy5jYWxjdWxhdGVUb3RhbFByb2dyZXNzKClcbiAgICB9KVxuXG4gICAgdGhpcy5vbignZGFzaGJvYXJkOmZpbGUtZWRpdC1jb21wbGV0ZScsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoZmlsZSkge1xuICAgICAgICB0aGlzLiNjaGVja1JlcXVpcmVkTWV0YUZpZWxkc09uRmlsZShmaWxlKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBzaG93IGluZm9ybWVyIGlmIG9mZmxpbmVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdvbmxpbmUnLCB0aGlzLiN1cGRhdGVPbmxpbmVTdGF0dXMpXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsIHRoaXMuI3VwZGF0ZU9ubGluZVN0YXR1cylcbiAgICAgIHNldFRpbWVvdXQodGhpcy4jdXBkYXRlT25saW5lU3RhdHVzLCAzMDAwKVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZU9ubGluZVN0YXR1cyAoKSB7XG4gICAgY29uc3Qgb25saW5lID0gdHlwZW9mIHdpbmRvdy5uYXZpZ2F0b3Iub25MaW5lICE9PSAndW5kZWZpbmVkJ1xuICAgICAgPyB3aW5kb3cubmF2aWdhdG9yLm9uTGluZVxuICAgICAgOiB0cnVlXG4gICAgaWYgKCFvbmxpbmUpIHtcbiAgICAgIHRoaXMuZW1pdCgnaXMtb2ZmbGluZScpXG4gICAgICB0aGlzLmluZm8odGhpcy5pMThuKCdub0ludGVybmV0Q29ubmVjdGlvbicpLCAnZXJyb3InLCAwKVxuICAgICAgdGhpcy53YXNPZmZsaW5lID0gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVtaXQoJ2lzLW9ubGluZScpXG4gICAgICBpZiAodGhpcy53YXNPZmZsaW5lKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnYmFjay1vbmxpbmUnKVxuICAgICAgICB0aGlzLmluZm8odGhpcy5pMThuKCdjb25uZWN0ZWRUb0ludGVybmV0JyksICdzdWNjZXNzJywgMzAwMClcbiAgICAgICAgdGhpcy53YXNPZmZsaW5lID0gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAjdXBkYXRlT25saW5lU3RhdHVzID0gdGhpcy51cGRhdGVPbmxpbmVTdGF0dXMuYmluZCh0aGlzKVxuXG4gIGdldElEICgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRzLmlkXG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXJzIGEgcGx1Z2luIHdpdGggQ29yZS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IFBsdWdpbiBvYmplY3RcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRzXSBvYmplY3Qgd2l0aCBvcHRpb25zIHRvIGJlIHBhc3NlZCB0byBQbHVnaW5cbiAgICogQHJldHVybnMge29iamVjdH0gc2VsZiBmb3IgY2hhaW5pbmdcbiAgICovXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcbiAgdXNlIChQbHVnaW4sIG9wdHMpIHtcbiAgICBpZiAodHlwZW9mIFBsdWdpbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgbXNnID0gYEV4cGVjdGVkIGEgcGx1Z2luIGNsYXNzLCBidXQgZ290ICR7UGx1Z2luID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIFBsdWdpbn0uYFxuICAgICAgICArICcgUGxlYXNlIHZlcmlmeSB0aGF0IHRoZSBwbHVnaW4gd2FzIGltcG9ydGVkIGFuZCBzcGVsbGVkIGNvcnJlY3RseS4nXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZylcbiAgICB9XG5cbiAgICAvLyBJbnN0YW50aWF0ZVxuICAgIGNvbnN0IHBsdWdpbiA9IG5ldyBQbHVnaW4odGhpcywgb3B0cylcbiAgICBjb25zdCBwbHVnaW5JZCA9IHBsdWdpbi5pZFxuXG4gICAgaWYgKCFwbHVnaW5JZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdZb3VyIHBsdWdpbiBtdXN0IGhhdmUgYW4gaWQnKVxuICAgIH1cblxuICAgIGlmICghcGx1Z2luLnR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignWW91ciBwbHVnaW4gbXVzdCBoYXZlIGEgdHlwZScpXG4gICAgfVxuXG4gICAgY29uc3QgZXhpc3RzUGx1Z2luQWxyZWFkeSA9IHRoaXMuZ2V0UGx1Z2luKHBsdWdpbklkKVxuICAgIGlmIChleGlzdHNQbHVnaW5BbHJlYWR5KSB7XG4gICAgICBjb25zdCBtc2cgPSBgQWxyZWFkeSBmb3VuZCBhIHBsdWdpbiBuYW1lZCAnJHtleGlzdHNQbHVnaW5BbHJlYWR5LmlkfScuIGBcbiAgICAgICAgKyBgVHJpZWQgdG8gdXNlOiAnJHtwbHVnaW5JZH0nLlxcbmBcbiAgICAgICAgKyAnVXBweSBwbHVnaW5zIG11c3QgaGF2ZSB1bmlxdWUgYGlkYCBvcHRpb25zLiBTZWUgaHR0cHM6Ly91cHB5LmlvL2RvY3MvcGx1Z2lucy8jaWQuJ1xuICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZylcbiAgICB9XG5cbiAgICBpZiAoUGx1Z2luLlZFUlNJT04pIHtcbiAgICAgIHRoaXMubG9nKGBVc2luZyAke3BsdWdpbklkfSB2JHtQbHVnaW4uVkVSU0lPTn1gKVxuICAgIH1cblxuICAgIGlmIChwbHVnaW4udHlwZSBpbiB0aGlzLiNwbHVnaW5zKSB7XG4gICAgICB0aGlzLiNwbHVnaW5zW3BsdWdpbi50eXBlXS5wdXNoKHBsdWdpbilcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4jcGx1Z2luc1twbHVnaW4udHlwZV0gPSBbcGx1Z2luXVxuICAgIH1cbiAgICBwbHVnaW4uaW5zdGFsbCgpXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmQgb25lIFBsdWdpbiBieSBuYW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaWQgcGx1Z2luIGlkXG4gICAqIEByZXR1cm5zIHtCYXNlUGx1Z2lufHVuZGVmaW5lZH1cbiAgICovXG4gIGdldFBsdWdpbiAoaWQpIHtcbiAgICBmb3IgKGNvbnN0IHBsdWdpbnMgb2YgT2JqZWN0LnZhbHVlcyh0aGlzLiNwbHVnaW5zKSkge1xuICAgICAgY29uc3QgZm91bmRQbHVnaW4gPSBwbHVnaW5zLmZpbmQocGx1Z2luID0+IHBsdWdpbi5pZCA9PT0gaWQpXG4gICAgICBpZiAoZm91bmRQbHVnaW4gIT0gbnVsbCkgcmV0dXJuIGZvdW5kUGx1Z2luXG4gICAgfVxuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIFtTeW1ib2wuZm9yKCd1cHB5IHRlc3Q6IGdldFBsdWdpbnMnKV0gKHR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy4jcGx1Z2luc1t0eXBlXVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgdGhyb3VnaCBhbGwgYHVzZWBkIHBsdWdpbnMuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZCB0aGF0IHdpbGwgYmUgcnVuIG9uIGVhY2ggcGx1Z2luXG4gICAqL1xuICBpdGVyYXRlUGx1Z2lucyAobWV0aG9kKSB7XG4gICAgT2JqZWN0LnZhbHVlcyh0aGlzLiNwbHVnaW5zKS5mbGF0KDEpLmZvckVhY2gobWV0aG9kKVxuICB9XG5cbiAgLyoqXG4gICAqIFVuaW5zdGFsbCBhbmQgcmVtb3ZlIGEgcGx1Z2luLlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gaW5zdGFuY2UgVGhlIHBsdWdpbiBpbnN0YW5jZSB0byByZW1vdmUuXG4gICAqL1xuICByZW1vdmVQbHVnaW4gKGluc3RhbmNlKSB7XG4gICAgdGhpcy5sb2coYFJlbW92aW5nIHBsdWdpbiAke2luc3RhbmNlLmlkfWApXG4gICAgdGhpcy5lbWl0KCdwbHVnaW4tcmVtb3ZlJywgaW5zdGFuY2UpXG5cbiAgICBpZiAoaW5zdGFuY2UudW5pbnN0YWxsKSB7XG4gICAgICBpbnN0YW5jZS51bmluc3RhbGwoKVxuICAgIH1cblxuICAgIGNvbnN0IGxpc3QgPSB0aGlzLiNwbHVnaW5zW2luc3RhbmNlLnR5cGVdXG4gICAgLy8gbGlzdC5pbmRleE9mIGZhaWxlZCBoZXJlLCBiZWNhdXNlIFZ1ZTMgY29udmVydGVkIHRoZSBwbHVnaW4gaW5zdGFuY2VcbiAgICAvLyB0byBhIFByb3h5IG9iamVjdCwgd2hpY2ggZmFpbGVkIHRoZSBzdHJpY3QgY29tcGFyaXNvbiB0ZXN0OlxuICAgIC8vIG9iaiAhPT0gb2JqUHJveHlcbiAgICBjb25zdCBpbmRleCA9IGxpc3QuZmluZEluZGV4KGl0ZW0gPT4gaXRlbS5pZCA9PT0gaW5zdGFuY2UuaWQpXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgbGlzdC5zcGxpY2UoaW5kZXgsIDEpXG4gICAgfVxuXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmdldFN0YXRlKClcbiAgICBjb25zdCB1cGRhdGVkU3RhdGUgPSB7XG4gICAgICBwbHVnaW5zOiB7XG4gICAgICAgIC4uLnN0YXRlLnBsdWdpbnMsXG4gICAgICAgIFtpbnN0YW5jZS5pZF06IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfVxuICAgIHRoaXMuc2V0U3RhdGUodXBkYXRlZFN0YXRlKVxuICB9XG5cbiAgLyoqXG4gICAqIFVuaW5zdGFsbCBhbGwgcGx1Z2lucyBhbmQgY2xvc2UgZG93biB0aGlzIFVwcHkgaW5zdGFuY2UuXG4gICAqL1xuICBjbG9zZSAoKSB7XG4gICAgdGhpcy5sb2coYENsb3NpbmcgVXBweSBpbnN0YW5jZSAke3RoaXMub3B0cy5pZH06IHJlbW92aW5nIGFsbCBmaWxlcyBhbmQgdW5pbnN0YWxsaW5nIHBsdWdpbnNgKVxuXG4gICAgdGhpcy5yZXNldCgpXG5cbiAgICB0aGlzLiNzdG9yZVVuc3Vic2NyaWJlKClcblxuICAgIHRoaXMuaXRlcmF0ZVBsdWdpbnMoKHBsdWdpbikgPT4ge1xuICAgICAgdGhpcy5yZW1vdmVQbHVnaW4ocGx1Z2luKVxuICAgIH0pXG5cbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdvbmxpbmUnLCB0aGlzLiN1cGRhdGVPbmxpbmVTdGF0dXMpXG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcignb2ZmbGluZScsIHRoaXMuI3VwZGF0ZU9ubGluZVN0YXR1cylcbiAgICB9XG4gIH1cblxuICBoaWRlSW5mbyAoKSB7XG4gICAgY29uc3QgeyBpbmZvIH0gPSB0aGlzLmdldFN0YXRlKClcblxuICAgIHRoaXMuc2V0U3RhdGUoeyBpbmZvOiBpbmZvLnNsaWNlKDEpIH0pXG5cbiAgICB0aGlzLmVtaXQoJ2luZm8taGlkZGVuJylcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgaW5mbyBtZXNzYWdlIGluIGBzdGF0ZS5pbmZvYCwgc28gdGhhdCBVSSBwbHVnaW5zIGxpa2UgYEluZm9ybWVyYFxuICAgKiBjYW4gZGlzcGxheSB0aGUgbWVzc2FnZS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmcgfCBvYmplY3R9IG1lc3NhZ2UgTWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgYnkgdGhlIGluZm9ybWVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbdHlwZV1cbiAgICogQHBhcmFtIHtudW1iZXJ9IFtkdXJhdGlvbl1cbiAgICovXG4gIGluZm8gKG1lc3NhZ2UsIHR5cGUgPSAnaW5mbycsIGR1cmF0aW9uID0gMzAwMCkge1xuICAgIGNvbnN0IGlzQ29tcGxleE1lc3NhZ2UgPSB0eXBlb2YgbWVzc2FnZSA9PT0gJ29iamVjdCdcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgaW5mbzogW1xuICAgICAgICAuLi50aGlzLmdldFN0YXRlKCkuaW5mbyxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgbWVzc2FnZTogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UubWVzc2FnZSA6IG1lc3NhZ2UsXG4gICAgICAgICAgZGV0YWlsczogaXNDb21wbGV4TWVzc2FnZSA/IG1lc3NhZ2UuZGV0YWlscyA6IG51bGwsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pXG5cbiAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuaGlkZUluZm8oKSwgZHVyYXRpb24pXG5cbiAgICB0aGlzLmVtaXQoJ2luZm8tdmlzaWJsZScpXG4gIH1cblxuICAvKipcbiAgICogUGFzc2VzIG1lc3NhZ2VzIHRvIGEgZnVuY3Rpb24sIHByb3ZpZGVkIGluIGBvcHRzLmxvZ2dlcmAuXG4gICAqIElmIGBvcHRzLmxvZ2dlcjogVXBweS5kZWJ1Z0xvZ2dlcmAgb3IgYG9wdHMuZGVidWc6IHRydWVgLCBsb2dzIHRvIHRoZSBicm93c2VyIGNvbnNvbGUuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gbWVzc2FnZSB0byBsb2dcbiAgICogQHBhcmFtIHtzdHJpbmd9IFt0eXBlXSBvcHRpb25hbCBgZXJyb3JgIG9yIGB3YXJuaW5nYFxuICAgKi9cbiAgbG9nIChtZXNzYWdlLCB0eXBlKSB7XG4gICAgY29uc3QgeyBsb2dnZXIgfSA9IHRoaXMub3B0c1xuICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgY2FzZSAnZXJyb3InOiBsb2dnZXIuZXJyb3IobWVzc2FnZSk7IGJyZWFrXG4gICAgICBjYXNlICd3YXJuaW5nJzogbG9nZ2VyLndhcm4obWVzc2FnZSk7IGJyZWFrXG4gICAgICBkZWZhdWx0OiBsb2dnZXIuZGVidWcobWVzc2FnZSk7IGJyZWFrXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgYW4gdXBsb2FkIGJ5IGl0cyBJRC5cbiAgICovXG4gIHJlc3RvcmUgKHVwbG9hZElEKSB7XG4gICAgdGhpcy5sb2coYENvcmU6IGF0dGVtcHRpbmcgdG8gcmVzdG9yZSB1cGxvYWQgXCIke3VwbG9hZElEfVwiYClcblxuICAgIGlmICghdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSkge1xuICAgICAgdGhpcy4jcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcignTm9uZXhpc3RlbnQgdXBsb2FkJykpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuI3J1blVwbG9hZCh1cGxvYWRJRClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gdXBsb2FkIGZvciBhIGJ1bmNoIG9mIGZpbGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5PHN0cmluZz59IGZpbGVJRHMgRmlsZSBJRHMgdG8gaW5jbHVkZSBpbiB0aGlzIHVwbG9hZC5cbiAgICogQHJldHVybnMge3N0cmluZ30gSUQgb2YgdGhpcyB1cGxvYWQuXG4gICAqL1xuICAjY3JlYXRlVXBsb2FkIChmaWxlSURzLCBvcHRzID0ge30pIHtcbiAgICAvLyB1cHB5LnJldHJ5QWxsIHNldHMgdGhpcyB0byB0cnVlIOKAlCB3aGVuIHJldHJ5aW5nIHdlIHdhbnQgdG8gaWdub3JlIGBhbGxvd05ld1VwbG9hZDogZmFsc2VgXG4gICAgY29uc3QgeyBmb3JjZUFsbG93TmV3VXBsb2FkID0gZmFsc2UgfSA9IG9wdHNcblxuICAgIGNvbnN0IHsgYWxsb3dOZXdVcGxvYWQsIGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBpZiAoIWFsbG93TmV3VXBsb2FkICYmICFmb3JjZUFsbG93TmV3VXBsb2FkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjcmVhdGUgYSBuZXcgdXBsb2FkOiBhbHJlYWR5IHVwbG9hZGluZy4nKVxuICAgIH1cblxuICAgIGNvbnN0IHVwbG9hZElEID0gbmFub2lkKClcblxuICAgIHRoaXMuZW1pdCgndXBsb2FkJywge1xuICAgICAgaWQ6IHVwbG9hZElELFxuICAgICAgZmlsZUlEcyxcbiAgICB9KVxuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBhbGxvd05ld1VwbG9hZDogdGhpcy5vcHRzLmFsbG93TXVsdGlwbGVVcGxvYWRCYXRjaGVzICE9PSBmYWxzZSAmJiB0aGlzLm9wdHMuYWxsb3dNdWx0aXBsZVVwbG9hZHMgIT09IGZhbHNlLFxuXG4gICAgICBjdXJyZW50VXBsb2Fkczoge1xuICAgICAgICAuLi5jdXJyZW50VXBsb2FkcyxcbiAgICAgICAgW3VwbG9hZElEXToge1xuICAgICAgICAgIGZpbGVJRHMsXG4gICAgICAgICAgc3RlcDogMCxcbiAgICAgICAgICByZXN1bHQ6IHt9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIHVwbG9hZElEXG4gIH1cblxuICBbU3ltYm9sLmZvcigndXBweSB0ZXN0OiBjcmVhdGVVcGxvYWQnKV0gKC4uLmFyZ3MpIHsgcmV0dXJuIHRoaXMuI2NyZWF0ZVVwbG9hZCguLi5hcmdzKSB9XG5cbiAgI2dldFVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcblxuICAgIHJldHVybiBjdXJyZW50VXBsb2Fkc1t1cGxvYWRJRF1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgZGF0YSB0byBhbiB1cGxvYWQncyByZXN1bHQgb2JqZWN0LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdXBsb2FkSUQgVGhlIElEIG9mIHRoZSB1cGxvYWQuXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhIERhdGEgcHJvcGVydGllcyB0byBhZGQgdG8gdGhlIHJlc3VsdCBvYmplY3QuXG4gICAqL1xuICBhZGRSZXN1bHREYXRhICh1cGxvYWRJRCwgZGF0YSkge1xuICAgIGlmICghdGhpcy4jZ2V0VXBsb2FkKHVwbG9hZElEKSkge1xuICAgICAgdGhpcy5sb2coYE5vdCBzZXR0aW5nIHJlc3VsdCBmb3IgYW4gdXBsb2FkIHRoYXQgaGFzIGJlZW4gcmVtb3ZlZDogJHt1cGxvYWRJRH1gKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgIGNvbnN0IGN1cnJlbnRVcGxvYWQgPSB7IC4uLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXSwgcmVzdWx0OiB7IC4uLmN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXS5yZXN1bHQsIC4uLmRhdGEgfSB9XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBjdXJyZW50VXBsb2FkczogeyAuLi5jdXJyZW50VXBsb2FkcywgW3VwbG9hZElEXTogY3VycmVudFVwbG9hZCB9LFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGFuIHVwbG9hZCwgZWcuIGlmIGl0IGhhcyBiZWVuIGNhbmNlbGVkIG9yIGNvbXBsZXRlZC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwbG9hZElEIFRoZSBJRCBvZiB0aGUgdXBsb2FkLlxuICAgKi9cbiAgI3JlbW92ZVVwbG9hZCAodXBsb2FkSUQpIHtcbiAgICBjb25zdCBjdXJyZW50VXBsb2FkcyA9IHsgLi4udGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzIH1cbiAgICBkZWxldGUgY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIGN1cnJlbnRVcGxvYWRzLFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUnVuIGFuIHVwbG9hZC4gVGhpcyBwaWNrcyB1cCB3aGVyZSBpdCBsZWZ0IG9mZiBpbiBjYXNlIHRoZSB1cGxvYWQgaXMgYmVpbmcgcmVzdG9yZWQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBhc3luYyAjcnVuVXBsb2FkICh1cGxvYWRJRCkge1xuICAgIGxldCB7IGN1cnJlbnRVcGxvYWRzIH0gPSB0aGlzLmdldFN0YXRlKClcbiAgICBsZXQgY3VycmVudFVwbG9hZCA9IGN1cnJlbnRVcGxvYWRzW3VwbG9hZElEXVxuICAgIGNvbnN0IHJlc3RvcmVTdGVwID0gY3VycmVudFVwbG9hZC5zdGVwIHx8IDBcblxuICAgIGNvbnN0IHN0ZXBzID0gW1xuICAgICAgLi4uQXJyYXkuZnJvbSh0aGlzLiNwcmVQcm9jZXNzb3JzKSxcbiAgICAgIC4uLkFycmF5LmZyb20odGhpcy4jdXBsb2FkZXJzKSxcbiAgICAgIC4uLkFycmF5LmZyb20odGhpcy4jcG9zdFByb2Nlc3NvcnMpLFxuICAgIF1cbiAgICB0cnkge1xuICAgICAgZm9yIChsZXQgc3RlcCA9IHJlc3RvcmVTdGVwOyBzdGVwIDwgc3RlcHMubGVuZ3RoOyBzdGVwKyspIHtcbiAgICAgICAgaWYgKCFjdXJyZW50VXBsb2FkKSB7XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBmbiA9IHN0ZXBzW3N0ZXBdXG5cbiAgICAgICAgY29uc3QgdXBkYXRlZFVwbG9hZCA9IHtcbiAgICAgICAgICAuLi5jdXJyZW50VXBsb2FkLFxuICAgICAgICAgIHN0ZXAsXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBjdXJyZW50VXBsb2Fkczoge1xuICAgICAgICAgICAgLi4uY3VycmVudFVwbG9hZHMsXG4gICAgICAgICAgICBbdXBsb2FkSURdOiB1cGRhdGVkVXBsb2FkLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gVE9ETyBnaXZlIHRoaXMgdGhlIGB1cGRhdGVkVXBsb2FkYCBvYmplY3QgYXMgaXRzIG9ubHkgcGFyYW1ldGVyIG1heWJlP1xuICAgICAgICAvLyBPdGhlcndpc2Ugd2hlbiBtb3JlIG1ldGFkYXRhIG1heSBiZSBhZGRlZCB0byB0aGUgdXBsb2FkIHRoaXMgd291bGQga2VlcCBnZXR0aW5nIG1vcmUgcGFyYW1ldGVyc1xuICAgICAgICBhd2FpdCBmbih1cGRhdGVkVXBsb2FkLmZpbGVJRHMsIHVwbG9hZElEKVxuXG4gICAgICAgIC8vIFVwZGF0ZSBjdXJyZW50VXBsb2FkIHZhbHVlIGluIGNhc2UgaXQgd2FzIG1vZGlmaWVkIGFzeW5jaHJvbm91c2x5LlxuICAgICAgICBjdXJyZW50VXBsb2FkcyA9IHRoaXMuZ2V0U3RhdGUoKS5jdXJyZW50VXBsb2Fkc1xuICAgICAgICBjdXJyZW50VXBsb2FkID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyKVxuICAgICAgdGhpcy4jcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgLy8gU2V0IHJlc3VsdCBkYXRhLlxuICAgIGlmIChjdXJyZW50VXBsb2FkKSB7XG4gICAgICAvLyBNYXJrIHBvc3Rwcm9jZXNzaW5nIHN0ZXAgYXMgY29tcGxldGUgaWYgbmVjZXNzYXJ5OyB0aGlzIGFkZHJlc3NlcyBhIGNhc2Ugd2hlcmUgd2UgbWlnaHQgZ2V0XG4gICAgICAvLyBzdHVjayBpbiB0aGUgcG9zdHByb2Nlc3NpbmcgVUkgd2hpbGUgdGhlIHVwbG9hZCBpcyBmdWxseSBjb21wbGV0ZS5cbiAgICAgIC8vIElmIHRoZSBwb3N0cHJvY2Vzc2luZyBzdGVwcyBkbyBub3QgZG8gYW55IHdvcmssIHRoZXkgbWF5IG5vdCBlbWl0IHBvc3Rwcm9jZXNzaW5nIGV2ZW50cyBhdFxuICAgICAgLy8gYWxsLCBhbmQgbmV2ZXIgbWFyayB0aGUgcG9zdHByb2Nlc3NpbmcgYXMgY29tcGxldGUuIFRoaXMgaXMgZmluZSBvbiBpdHMgb3duIGJ1dCB3ZVxuICAgICAgLy8gaW50cm9kdWNlZCBjb2RlIGluIHRoZSBAdXBweS9jb3JlIHVwbG9hZC1zdWNjZXNzIGhhbmRsZXIgdG8gcHJlcGFyZSBwb3N0cHJvY2Vzc2luZyBwcm9ncmVzc1xuICAgICAgLy8gc3RhdGUgaWYgYW55IHBvc3Rwcm9jZXNzb3JzIGFyZSByZWdpc3RlcmVkLiBUaGF0IGlzIHRvIGF2b2lkIGEgXCJmbGFzaCBvZiBjb21wbGV0ZWQgc3RhdGVcIlxuICAgICAgLy8gYmVmb3JlIHRoZSBwb3N0cHJvY2Vzc2luZyBwbHVnaW5zIGNhbiBlbWl0IGV2ZW50cy5cbiAgICAgIC8vXG4gICAgICAvLyBTbywganVzdCBpbiBjYXNlIGFuIHVwbG9hZCB3aXRoIHBvc3Rwcm9jZXNzaW5nIHBsdWdpbnMgKmhhcyogY29tcGxldGVkICp3aXRob3V0KiBlbWl0dGluZ1xuICAgICAgLy8gcG9zdHByb2Nlc3NpbmcgY29tcGxldGlvbiwgd2UgZG8gaXQgaW5zdGVhZC5cbiAgICAgIGN1cnJlbnRVcGxvYWQuZmlsZUlEcy5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMuZ2V0RmlsZShmaWxlSUQpXG4gICAgICAgIGlmIChmaWxlICYmIGZpbGUucHJvZ3Jlc3MucG9zdHByb2Nlc3MpIHtcbiAgICAgICAgICB0aGlzLmVtaXQoJ3Bvc3Rwcm9jZXNzLWNvbXBsZXRlJywgZmlsZSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgY29uc3QgZmlsZXMgPSBjdXJyZW50VXBsb2FkLmZpbGVJRHMubWFwKChmaWxlSUQpID0+IHRoaXMuZ2V0RmlsZShmaWxlSUQpKVxuICAgICAgY29uc3Qgc3VjY2Vzc2Z1bCA9IGZpbGVzLmZpbHRlcigoZmlsZSkgPT4gIWZpbGUuZXJyb3IpXG4gICAgICBjb25zdCBmYWlsZWQgPSBmaWxlcy5maWx0ZXIoKGZpbGUpID0+IGZpbGUuZXJyb3IpXG4gICAgICBhd2FpdCB0aGlzLmFkZFJlc3VsdERhdGEodXBsb2FkSUQsIHsgc3VjY2Vzc2Z1bCwgZmFpbGVkLCB1cGxvYWRJRCB9KVxuXG4gICAgICAvLyBVcGRhdGUgY3VycmVudFVwbG9hZCB2YWx1ZSBpbiBjYXNlIGl0IHdhcyBtb2RpZmllZCBhc3luY2hyb25vdXNseS5cbiAgICAgIGN1cnJlbnRVcGxvYWRzID0gdGhpcy5nZXRTdGF0ZSgpLmN1cnJlbnRVcGxvYWRzXG4gICAgICBjdXJyZW50VXBsb2FkID0gY3VycmVudFVwbG9hZHNbdXBsb2FkSURdXG4gICAgfVxuICAgIC8vIEVtaXQgY29tcGxldGlvbiBldmVudHMuXG4gICAgLy8gVGhpcyBpcyBpbiBhIHNlcGFyYXRlIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIGBjdXJyZW50VXBsb2Fkc2AgdmFyaWFibGVcbiAgICAvLyBhbHdheXMgcmVmZXJzIHRvIHRoZSBsYXRlc3Qgc3RhdGUuIEluIHRoZSBoYW5kbGVyIHJpZ2h0IGFib3ZlIGl0IHJlZmVyc1xuICAgIC8vIHRvIGFuIG91dGRhdGVkIG9iamVjdCB3aXRob3V0IHRoZSBgLnJlc3VsdGAgcHJvcGVydHkuXG4gICAgbGV0IHJlc3VsdFxuICAgIGlmIChjdXJyZW50VXBsb2FkKSB7XG4gICAgICByZXN1bHQgPSBjdXJyZW50VXBsb2FkLnJlc3VsdFxuICAgICAgdGhpcy5lbWl0KCdjb21wbGV0ZScsIHJlc3VsdClcblxuICAgICAgdGhpcy4jcmVtb3ZlVXBsb2FkKHVwbG9hZElEKVxuICAgIH1cbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHRoaXMubG9nKGBOb3Qgc2V0dGluZyByZXN1bHQgZm9yIGFuIHVwbG9hZCB0aGF0IGhhcyBiZWVuIHJlbW92ZWQ6ICR7dXBsb2FkSUR9YClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IGFuIHVwbG9hZCBmb3IgYWxsIHRoZSBmaWxlcyB0aGF0IGFyZSBub3QgY3VycmVudGx5IGJlaW5nIHVwbG9hZGVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAgICovXG4gIHVwbG9hZCAoKSB7XG4gICAgaWYgKCF0aGlzLiNwbHVnaW5zLnVwbG9hZGVyPy5sZW5ndGgpIHtcbiAgICAgIHRoaXMubG9nKCdObyB1cGxvYWRlciB0eXBlIHBsdWdpbnMgYXJlIHVzZWQnLCAnd2FybmluZycpXG4gICAgfVxuXG4gICAgbGV0IHsgZmlsZXMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuXG4gICAgY29uc3Qgb25CZWZvcmVVcGxvYWRSZXN1bHQgPSB0aGlzLm9wdHMub25CZWZvcmVVcGxvYWQoZmlsZXMpXG5cbiAgICBpZiAob25CZWZvcmVVcGxvYWRSZXN1bHQgPT09IGZhbHNlKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKCdOb3Qgc3RhcnRpbmcgdGhlIHVwbG9hZCBiZWNhdXNlIG9uQmVmb3JlVXBsb2FkIHJldHVybmVkIGZhbHNlJykpXG4gICAgfVxuXG4gICAgaWYgKG9uQmVmb3JlVXBsb2FkUmVzdWx0ICYmIHR5cGVvZiBvbkJlZm9yZVVwbG9hZFJlc3VsdCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZpbGVzID0gb25CZWZvcmVVcGxvYWRSZXN1bHRcbiAgICAgIC8vIFVwZGF0aW5nIGZpbGVzIGluIHN0YXRlLCBiZWNhdXNlIHVwbG9hZGVyIHBsdWdpbnMgcmVjZWl2ZSBmaWxlIElEcyxcbiAgICAgIC8vIGFuZCB0aGVuIGZldGNoIHRoZSBhY3R1YWwgZmlsZSBvYmplY3QgZnJvbSBzdGF0ZVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgIGZpbGVzLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgdGhpcy4jY2hlY2tNaW5OdW1iZXJPZkZpbGVzKGZpbGVzKVxuICAgICAgICB0aGlzLiNjaGVja1JlcXVpcmVkTWV0YUZpZWxkcyhmaWxlcylcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KGVycilcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudFVwbG9hZHMgfSA9IHRoaXMuZ2V0U3RhdGUoKVxuICAgICAgICAvLyBnZXQgYSBsaXN0IG9mIGZpbGVzIHRoYXQgYXJlIGN1cnJlbnRseSBhc3NpZ25lZCB0byB1cGxvYWRzXG4gICAgICAgIGNvbnN0IGN1cnJlbnRseVVwbG9hZGluZ0ZpbGVzID0gT2JqZWN0LnZhbHVlcyhjdXJyZW50VXBsb2FkcykuZmxhdE1hcChjdXJyID0+IGN1cnIuZmlsZUlEcylcblxuICAgICAgICBjb25zdCB3YWl0aW5nRmlsZUlEcyA9IFtdXG4gICAgICAgIE9iamVjdC5rZXlzKGZpbGVzKS5mb3JFYWNoKChmaWxlSUQpID0+IHtcbiAgICAgICAgICBjb25zdCBmaWxlID0gdGhpcy5nZXRGaWxlKGZpbGVJRClcbiAgICAgICAgICAvLyBpZiB0aGUgZmlsZSBoYXNuJ3Qgc3RhcnRlZCB1cGxvYWRpbmcgYW5kIGhhc24ndCBhbHJlYWR5IGJlZW4gYXNzaWduZWQgdG8gYW4gdXBsb2FkLi5cbiAgICAgICAgICBpZiAoKCFmaWxlLnByb2dyZXNzLnVwbG9hZFN0YXJ0ZWQpICYmIChjdXJyZW50bHlVcGxvYWRpbmdGaWxlcy5pbmRleE9mKGZpbGVJRCkgPT09IC0xKSkge1xuICAgICAgICAgICAgd2FpdGluZ0ZpbGVJRHMucHVzaChmaWxlLmlkKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCB1cGxvYWRJRCA9IHRoaXMuI2NyZWF0ZVVwbG9hZCh3YWl0aW5nRmlsZUlEcylcbiAgICAgICAgcmV0dXJuIHRoaXMuI3J1blVwbG9hZCh1cGxvYWRJRClcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNzaG93T3JMb2dFcnJvckFuZFRocm93KGVyciwge1xuICAgICAgICAgIHNob3dJbmZvcm1lcjogZmFsc2UsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVXBweVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRGaWxlTmFtZSAoZmlsZVR5cGUsIGZpbGVEZXNjcmlwdG9yKSB7XG4gIGlmIChmaWxlRGVzY3JpcHRvci5uYW1lKSB7XG4gICAgcmV0dXJuIGZpbGVEZXNjcmlwdG9yLm5hbWVcbiAgfVxuXG4gIGlmIChmaWxlVHlwZS5zcGxpdCgnLycpWzBdID09PSAnaW1hZ2UnKSB7XG4gICAgcmV0dXJuIGAke2ZpbGVUeXBlLnNwbGl0KCcvJylbMF19LiR7ZmlsZVR5cGUuc3BsaXQoJy8nKVsxXX1gXG4gIH1cblxuICByZXR1cm4gJ25vbmFtZSdcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBVcHB5ID0gcmVxdWlyZSgnLi9VcHB5JylcbmNvbnN0IFVJUGx1Z2luID0gcmVxdWlyZSgnLi9VSVBsdWdpbicpXG5jb25zdCBCYXNlUGx1Z2luID0gcmVxdWlyZSgnLi9CYXNlUGx1Z2luJylcbmNvbnN0IHsgZGVidWdMb2dnZXIgfSA9IHJlcXVpcmUoJy4vbG9nZ2VycycpXG5cbm1vZHVsZS5leHBvcnRzID0gVXBweVxubW9kdWxlLmV4cG9ydHMuVXBweSA9IFVwcHlcbm1vZHVsZS5leHBvcnRzLlVJUGx1Z2luID0gVUlQbHVnaW5cbm1vZHVsZS5leHBvcnRzLkJhc2VQbHVnaW4gPSBCYXNlUGx1Z2luXG5tb2R1bGUuZXhwb3J0cy5kZWJ1Z0xvZ2dlciA9IGRlYnVnTG9nZ2VyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgc3RyaW5nczoge1xuICAgIGFkZEJ1bGtGaWxlc0ZhaWxlZDoge1xuICAgICAgMDogJ0ZhaWxlZCB0byBhZGQgJXtzbWFydF9jb3VudH0gZmlsZSBkdWUgdG8gYW4gaW50ZXJuYWwgZXJyb3InLFxuICAgICAgMTogJ0ZhaWxlZCB0byBhZGQgJXtzbWFydF9jb3VudH0gZmlsZXMgZHVlIHRvIGludGVybmFsIGVycm9ycycsXG4gICAgfSxcbiAgICB5b3VDYW5Pbmx5VXBsb2FkWDoge1xuICAgICAgMDogJ1lvdSBjYW4gb25seSB1cGxvYWQgJXtzbWFydF9jb3VudH0gZmlsZScsXG4gICAgICAxOiAnWW91IGNhbiBvbmx5IHVwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlcycsXG4gICAgfSxcbiAgICB5b3VIYXZlVG9BdExlYXN0U2VsZWN0WDoge1xuICAgICAgMDogJ1lvdSBoYXZlIHRvIHNlbGVjdCBhdCBsZWFzdCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgIDE6ICdZb3UgaGF2ZSB0byBzZWxlY3QgYXQgbGVhc3QgJXtzbWFydF9jb3VudH0gZmlsZXMnLFxuICAgIH0sXG4gICAgZXhjZWVkc1NpemU6ICcle2ZpbGV9IGV4Y2VlZHMgbWF4aW11bSBhbGxvd2VkIHNpemUgb2YgJXtzaXplfScsXG4gICAgbWlzc2luZ1JlcXVpcmVkTWV0YUZpZWxkOiAnTWlzc2luZyByZXF1aXJlZCBtZXRhIGZpZWxkcycsXG4gICAgbWlzc2luZ1JlcXVpcmVkTWV0YUZpZWxkT25GaWxlOlxuICAgICAgJ01pc3NpbmcgcmVxdWlyZWQgbWV0YSBmaWVsZHMgaW4gJXtmaWxlTmFtZX0nLFxuICAgIGluZmVyaW9yU2l6ZTogJ1RoaXMgZmlsZSBpcyBzbWFsbGVyIHRoYW4gdGhlIGFsbG93ZWQgc2l6ZSBvZiAle3NpemV9JyxcbiAgICB5b3VDYW5Pbmx5VXBsb2FkRmlsZVR5cGVzOiAnWW91IGNhbiBvbmx5IHVwbG9hZDogJXt0eXBlc30nLFxuICAgIG5vTW9yZUZpbGVzQWxsb3dlZDogJ0Nhbm5vdCBhZGQgbW9yZSBmaWxlcycsXG4gICAgbm9EdXBsaWNhdGVzOlxuICAgICAgXCJDYW5ub3QgYWRkIHRoZSBkdXBsaWNhdGUgZmlsZSAnJXtmaWxlTmFtZX0nLCBpdCBhbHJlYWR5IGV4aXN0c1wiLFxuICAgIGNvbXBhbmlvbkVycm9yOiAnQ29ubmVjdGlvbiB3aXRoIENvbXBhbmlvbiBmYWlsZWQnLFxuICAgIGF1dGhBYm9ydGVkOiAnQXV0aGVudGljYXRpb24gYWJvcnRlZCcsXG4gICAgY29tcGFuaW9uVW5hdXRob3JpemVIaW50OlxuICAgICAgJ1RvIHVuYXV0aG9yaXplIHRvIHlvdXIgJXtwcm92aWRlcn0gYWNjb3VudCwgcGxlYXNlIGdvIHRvICV7dXJsfScsXG4gICAgZmFpbGVkVG9VcGxvYWQ6ICdGYWlsZWQgdG8gdXBsb2FkICV7ZmlsZX0nLFxuICAgIG5vSW50ZXJuZXRDb25uZWN0aW9uOiAnTm8gSW50ZXJuZXQgY29ubmVjdGlvbicsXG4gICAgY29ubmVjdGVkVG9JbnRlcm5ldDogJ0Nvbm5lY3RlZCB0byB0aGUgSW50ZXJuZXQnLFxuICAgIC8vIFN0cmluZ3MgZm9yIHJlbW90ZSBwcm92aWRlcnNcbiAgICBub0ZpbGVzRm91bmQ6ICdZb3UgaGF2ZSBubyBmaWxlcyBvciBmb2xkZXJzIGhlcmUnLFxuICAgIHNlbGVjdFg6IHtcbiAgICAgIDA6ICdTZWxlY3QgJXtzbWFydF9jb3VudH0nLFxuICAgICAgMTogJ1NlbGVjdCAle3NtYXJ0X2NvdW50fScsXG4gICAgfSxcbiAgICBhbGxGaWxlc0Zyb21Gb2xkZXJOYW1lZDogJ0FsbCBmaWxlcyBmcm9tIGZvbGRlciAle25hbWV9JyxcbiAgICBvcGVuRm9sZGVyTmFtZWQ6ICdPcGVuIGZvbGRlciAle25hbWV9JyxcbiAgICBjYW5jZWw6ICdDYW5jZWwnLFxuICAgIGxvZ091dDogJ0xvZyBvdXQnLFxuICAgIGZpbHRlcjogJ0ZpbHRlcicsXG4gICAgcmVzZXRGaWx0ZXI6ICdSZXNldCBmaWx0ZXInLFxuICAgIGxvYWRpbmc6ICdMb2FkaW5nLi4uJyxcbiAgICBhdXRoZW50aWNhdGVXaXRoVGl0bGU6XG4gICAgICAnUGxlYXNlIGF1dGhlbnRpY2F0ZSB3aXRoICV7cGx1Z2luTmFtZX0gdG8gc2VsZWN0IGZpbGVzJyxcbiAgICBhdXRoZW50aWNhdGVXaXRoOiAnQ29ubmVjdCB0byAle3BsdWdpbk5hbWV9JyxcbiAgICBzaWduSW5XaXRoR29vZ2xlOiAnU2lnbiBpbiB3aXRoIEdvb2dsZScsXG4gICAgc2VhcmNoSW1hZ2VzOiAnU2VhcmNoIGZvciBpbWFnZXMnLFxuICAgIGVudGVyVGV4dFRvU2VhcmNoOiAnRW50ZXIgdGV4dCB0byBzZWFyY2ggZm9yIGltYWdlcycsXG4gICAgYmFja1RvU2VhcmNoOiAnQmFjayB0byBTZWFyY2gnLFxuICAgIGVtcHR5Rm9sZGVyQWRkZWQ6ICdObyBmaWxlcyB3ZXJlIGFkZGVkIGZyb20gZW1wdHkgZm9sZGVyJyxcbiAgICBmb2xkZXJBbHJlYWR5QWRkZWQ6ICdUaGUgZm9sZGVyIFwiJXtmb2xkZXJ9XCIgd2FzIGFscmVhZHkgYWRkZWQnLFxuICAgIGZvbGRlckFkZGVkOiB7XG4gICAgICAwOiAnQWRkZWQgJXtzbWFydF9jb3VudH0gZmlsZSBmcm9tICV7Zm9sZGVyfScsXG4gICAgICAxOiAnQWRkZWQgJXtzbWFydF9jb3VudH0gZmlsZXMgZnJvbSAle2ZvbGRlcn0nLFxuICAgIH0sXG4gIH0sXG59XG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG5jb25zdCBnZXRUaW1lU3RhbXAgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0VGltZVN0YW1wJylcblxuLy8gU3dhbGxvdyBhbGwgbG9ncywgZXhjZXB0IGVycm9ycy5cbi8vIGRlZmF1bHQgaWYgbG9nZ2VyIGlzIG5vdCBzZXQgb3IgZGVidWc6IGZhbHNlXG5jb25zdCBqdXN0RXJyb3JzTG9nZ2VyID0ge1xuICBkZWJ1ZzogKCkgPT4ge30sXG4gIHdhcm46ICgpID0+IHt9LFxuICBlcnJvcjogKC4uLmFyZ3MpID0+IGNvbnNvbGUuZXJyb3IoYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncyksXG59XG5cbi8vIFByaW50IGxvZ3MgdG8gY29uc29sZSB3aXRoIG5hbWVzcGFjZSArIHRpbWVzdGFtcCxcbi8vIHNldCBieSBsb2dnZXI6IFVwcHkuZGVidWdMb2dnZXIgb3IgZGVidWc6IHRydWVcbmNvbnN0IGRlYnVnTG9nZ2VyID0ge1xuICBkZWJ1ZzogKC4uLmFyZ3MpID0+IGNvbnNvbGUuZGVidWcoYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncyksXG4gIHdhcm46ICguLi5hcmdzKSA9PiBjb25zb2xlLndhcm4oYFtVcHB5XSBbJHtnZXRUaW1lU3RhbXAoKX1dYCwgLi4uYXJncyksXG4gIGVycm9yOiAoLi4uYXJncykgPT4gY29uc29sZS5lcnJvcihgW1VwcHldIFske2dldFRpbWVTdGFtcCgpfV1gLCAuLi5hcmdzKSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGp1c3RFcnJvcnNMb2dnZXIsXG4gIGRlYnVnTG9nZ2VyLFxufVxuIiwiLy8gRWRnZSAxNS54IGRvZXMgbm90IGZpcmUgJ3Byb2dyZXNzJyBldmVudHMgb24gdXBsb2Fkcy5cbi8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdHJhbnNsb2FkaXQvdXBweS9pc3N1ZXMvOTQ1XG4vLyBBbmQgaHR0cHM6Ly9kZXZlbG9wZXIubWljcm9zb2Z0LmNvbS9lbi11cy9taWNyb3NvZnQtZWRnZS9wbGF0Zm9ybS9pc3N1ZXMvMTIyMjQ1MTAvXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MgKHVzZXJBZ2VudCkge1xuICAvLyBBbGxvdyBwYXNzaW5nIGluIHVzZXJBZ2VudCBmb3IgdGVzdHNcbiAgaWYgKHVzZXJBZ2VudCA9PSBudWxsKSB7XG4gICAgdXNlckFnZW50ID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgPyBuYXZpZ2F0b3IudXNlckFnZW50IDogbnVsbFxuICB9XG4gIC8vIEFzc3VtZSBpdCB3b3JrcyBiZWNhdXNlIGJhc2ljYWxseSBldmVyeXRoaW5nIHN1cHBvcnRzIHByb2dyZXNzIGV2ZW50cy5cbiAgaWYgKCF1c2VyQWdlbnQpIHJldHVybiB0cnVlXG5cbiAgY29uc3QgbSA9IC9FZGdlXFwvKFxcZCtcXC5cXGQrKS8uZXhlYyh1c2VyQWdlbnQpXG4gIGlmICghbSkgcmV0dXJuIHRydWVcblxuICBjb25zdCBlZGdlVmVyc2lvbiA9IG1bMV1cbiAgbGV0IFttYWpvciwgbWlub3JdID0gZWRnZVZlcnNpb24uc3BsaXQoJy4nKVxuICBtYWpvciA9IHBhcnNlSW50KG1ham9yLCAxMClcbiAgbWlub3IgPSBwYXJzZUludChtaW5vciwgMTApXG5cbiAgLy8gV29ya2VkIGJlZm9yZTpcbiAgLy8gRWRnZSA0MC4xNTA2My4wLjBcbiAgLy8gTWljcm9zb2Z0IEVkZ2VIVE1MIDE1LjE1MDYzXG4gIGlmIChtYWpvciA8IDE1IHx8IChtYWpvciA9PT0gMTUgJiYgbWlub3IgPCAxNTA2MykpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLy8gRml4ZWQgaW46XG4gIC8vIE1pY3Jvc29mdCBFZGdlSFRNTCAxOC4xODIxOFxuICBpZiAobWFqb3IgPiAxOCB8fCAobWFqb3IgPT09IDE4ICYmIG1pbm9yID49IDE4MjE4KSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyBvdGhlciB2ZXJzaW9ucyBkb24ndCB3b3JrLlxuICByZXR1cm4gZmFsc2Vcbn1cbiIsImNvbnN0IHsgVUlQbHVnaW4gfSA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUnKVxuY29uc3QgdG9BcnJheSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi90b0FycmF5JylcbmNvbnN0IHsgaCB9ID0gcmVxdWlyZSgncHJlYWN0JylcblxuY29uc3QgbG9jYWxlID0gcmVxdWlyZSgnLi9sb2NhbGUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEZpbGVJbnB1dCBleHRlbmRzIFVJUGx1Z2luIHtcbiAgc3RhdGljIFZFUlNJT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uXG5cbiAgY29uc3RydWN0b3IgKHVwcHksIG9wdHMpIHtcbiAgICBzdXBlcih1cHB5LCBvcHRzKVxuICAgIHRoaXMuaWQgPSB0aGlzLm9wdHMuaWQgfHwgJ0ZpbGVJbnB1dCdcbiAgICB0aGlzLnRpdGxlID0gJ0ZpbGUgSW5wdXQnXG4gICAgdGhpcy50eXBlID0gJ2FjcXVpcmVyJ1xuXG4gICAgdGhpcy5kZWZhdWx0TG9jYWxlID0gbG9jYWxlXG5cbiAgICAvLyBEZWZhdWx0IG9wdGlvbnNcbiAgICBjb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICAgIHRhcmdldDogbnVsbCxcbiAgICAgIHByZXR0eTogdHJ1ZSxcbiAgICAgIGlucHV0TmFtZTogJ2ZpbGVzW10nLFxuICAgIH1cblxuICAgIC8vIE1lcmdlIGRlZmF1bHQgb3B0aW9ucyB3aXRoIHRoZSBvbmVzIHNldCBieSB1c2VyXG4gICAgdGhpcy5vcHRzID0geyAuLi5kZWZhdWx0T3B0aW9ucywgLi4ub3B0cyB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIHRoaXMucmVuZGVyID0gdGhpcy5yZW5kZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuaGFuZGxlSW5wdXRDaGFuZ2UgPSB0aGlzLmhhbmRsZUlucHV0Q2hhbmdlLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZUNsaWNrID0gdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpXG4gIH1cblxuICBhZGRGaWxlcyAoZmlsZXMpIHtcbiAgICBjb25zdCBkZXNjcmlwdG9ycyA9IGZpbGVzLm1hcCgoZmlsZSkgPT4gKHtcbiAgICAgIHNvdXJjZTogdGhpcy5pZCxcbiAgICAgIG5hbWU6IGZpbGUubmFtZSxcbiAgICAgIHR5cGU6IGZpbGUudHlwZSxcbiAgICAgIGRhdGE6IGZpbGUsXG4gICAgfSkpXG5cbiAgICB0cnkge1xuICAgICAgdGhpcy51cHB5LmFkZEZpbGVzKGRlc2NyaXB0b3JzKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy51cHB5LmxvZyhlcnIpXG4gICAgfVxuICB9XG5cbiAgaGFuZGxlSW5wdXRDaGFuZ2UgKGV2ZW50KSB7XG4gICAgdGhpcy51cHB5LmxvZygnW0ZpbGVJbnB1dF0gU29tZXRoaW5nIHNlbGVjdGVkIHRocm91Z2ggaW5wdXQuLi4nKVxuICAgIGNvbnN0IGZpbGVzID0gdG9BcnJheShldmVudC50YXJnZXQuZmlsZXMpXG4gICAgdGhpcy5hZGRGaWxlcyhmaWxlcylcblxuICAgIC8vIFdlIGNsZWFyIHRoZSBpbnB1dCBhZnRlciBhIGZpbGUgaXMgc2VsZWN0ZWQsIGJlY2F1c2Ugb3RoZXJ3aXNlXG4gICAgLy8gY2hhbmdlIGV2ZW50IGlzIG5vdCBmaXJlZCBpbiBDaHJvbWUgYW5kIFNhZmFyaSB3aGVuIGEgZmlsZVxuICAgIC8vIHdpdGggdGhlIHNhbWUgbmFtZSBpcyBzZWxlY3RlZC5cbiAgICAvLyBfX19XaHkgbm90IHVzZSB2YWx1ZT1cIlwiIG9uIDxpbnB1dC8+IGluc3RlYWQ/XG4gICAgLy8gICAgQmVjYXVzZSBpZiB3ZSB1c2UgdGhhdCBtZXRob2Qgb2YgY2xlYXJpbmcgdGhlIGlucHV0LFxuICAgIC8vICAgIENocm9tZSB3aWxsIG5vdCB0cmlnZ2VyIGNoYW5nZSBpZiB3ZSBkcm9wIHRoZSBzYW1lIGZpbGUgdHdpY2UgKElzc3VlICM3NjgpLlxuICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IG51bGxcbiAgfVxuXG4gIGhhbmRsZUNsaWNrICgpIHtcbiAgICB0aGlzLmlucHV0LmNsaWNrKClcbiAgfVxuXG4gIHJlbmRlciAoKSB7XG4gICAgLyogaHR0cDovL3R5bXBhbnVzLm5ldC9jb2Ryb3BzLzIwMTUvMDkvMTUvc3R5bGluZy1jdXN0b21pemluZy1maWxlLWlucHV0cy1zbWFydC13YXkvICovXG4gICAgY29uc3QgaGlkZGVuSW5wdXRTdHlsZSA9IHtcbiAgICAgIHdpZHRoOiAnMC4xcHgnLFxuICAgICAgaGVpZ2h0OiAnMC4xcHgnLFxuICAgICAgb3BhY2l0eTogMCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJyxcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgekluZGV4OiAtMSxcbiAgICB9XG5cbiAgICBjb25zdCB7IHJlc3RyaWN0aW9ucyB9ID0gdGhpcy51cHB5Lm9wdHNcbiAgICBjb25zdCBhY2NlcHQgPSByZXN0cmljdGlvbnMuYWxsb3dlZEZpbGVUeXBlcyA/IHJlc3RyaWN0aW9ucy5hbGxvd2VkRmlsZVR5cGVzLmpvaW4oJywnKSA6IG51bGxcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInVwcHktUm9vdCB1cHB5LUZpbGVJbnB1dC1jb250YWluZXJcIj5cbiAgICAgICAgPGlucHV0XG4gICAgICAgICAgY2xhc3NOYW1lPVwidXBweS1GaWxlSW5wdXQtaW5wdXRcIlxuICAgICAgICAgIHN0eWxlPXt0aGlzLm9wdHMucHJldHR5ICYmIGhpZGRlbklucHV0U3R5bGV9XG4gICAgICAgICAgdHlwZT1cImZpbGVcIlxuICAgICAgICAgIG5hbWU9e3RoaXMub3B0cy5pbnB1dE5hbWV9XG4gICAgICAgICAgb25DaGFuZ2U9e3RoaXMuaGFuZGxlSW5wdXRDaGFuZ2V9XG4gICAgICAgICAgbXVsdGlwbGU9e3Jlc3RyaWN0aW9ucy5tYXhOdW1iZXJPZkZpbGVzICE9PSAxfVxuICAgICAgICAgIGFjY2VwdD17YWNjZXB0fVxuICAgICAgICAgIHJlZj17KGlucHV0KSA9PiB7IHRoaXMuaW5wdXQgPSBpbnB1dCB9fVxuICAgICAgICAvPlxuICAgICAgICB7dGhpcy5vcHRzLnByZXR0eVxuICAgICAgICAgICYmIChcbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ1cHB5LUZpbGVJbnB1dC1idG5cIlxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHt0aGlzLmkxOG4oJ2Nob29zZUZpbGVzJyl9XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIGNvbnN0IHsgdGFyZ2V0IH0gPSB0aGlzLm9wdHNcbiAgICBpZiAodGFyZ2V0KSB7XG4gICAgICB0aGlzLm1vdW50KHRhcmdldCwgdGhpcylcbiAgICB9XG4gIH1cblxuICB1bmluc3RhbGwgKCkge1xuICAgIHRoaXMudW5tb3VudCgpXG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBzdHJpbmdzOiB7XG4gICAgLy8gVGhlIHNhbWUga2V5IGlzIHVzZWQgZm9yIHRoZSBzYW1lIHB1cnBvc2UgYnkgQHVwcHkvcm9ib2RvZydzIGBmb3JtKClgIEFQSSwgYnV0IG91clxuICAgIC8vIGxvY2FsZSBwYWNrIHNjcmlwdHMgY2FuJ3QgYWNjZXNzIGl0IGluIFJvYm9kb2cuIElmIGl0IGlzIHVwZGF0ZWQgaGVyZSwgaXQgc2hvdWxkXG4gICAgLy8gYWxzbyBiZSB1cGRhdGVkIHRoZXJlIVxuICAgIGNob29zZUZpbGVzOiAnQ2hvb3NlIGZpbGVzJyxcbiAgfSxcbn1cbiIsImNvbnN0IGNsYXNzTmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJylcbmNvbnN0IHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLnRocm90dGxlJylcbmNvbnN0IHByZXR0aWVyQnl0ZXMgPSByZXF1aXJlKCdAdHJhbnNsb2FkaXQvcHJldHRpZXItYnl0ZXMnKVxuY29uc3QgcHJldHR5RVRBID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL3ByZXR0eUVUQScpXG5jb25zdCB7IGggfSA9IHJlcXVpcmUoJ3ByZWFjdCcpXG5cbmNvbnN0IHN0YXR1c0JhclN0YXRlcyA9IHJlcXVpcmUoJy4vU3RhdHVzQmFyU3RhdGVzJylcblxuY29uc3QgRE9UID0gYFxcdTAwQjdgXG5jb25zdCByZW5kZXJEb3QgPSAoKSA9PiBgICR7RE9UfSBgXG5cbmZ1bmN0aW9uIFVwbG9hZEJ0biAocHJvcHMpIHtcbiAgY29uc3Qge1xuICAgIG5ld0ZpbGVzLFxuICAgIGlzVXBsb2FkU3RhcnRlZCxcbiAgICByZWNvdmVyZWRTdGF0ZSxcbiAgICBpMThuLFxuICAgIHVwbG9hZFN0YXRlLFxuICAgIGlzU29tZUdob3N0LFxuICAgIHN0YXJ0VXBsb2FkLFxuICB9ID0gcHJvcHNcblxuICBjb25zdCB1cGxvYWRCdG5DbGFzc05hbWVzID0gY2xhc3NOYW1lcyhcbiAgICAndXBweS11LXJlc2V0JyxcbiAgICAndXBweS1jLWJ0bicsXG4gICAgJ3VwcHktU3RhdHVzQmFyLWFjdGlvbkJ0bicsXG4gICAgJ3VwcHktU3RhdHVzQmFyLWFjdGlvbkJ0bi0tdXBsb2FkJyxcbiAgICB7XG4gICAgICAndXBweS1jLWJ0bi1wcmltYXJ5JzogdXBsb2FkU3RhdGUgPT09IHN0YXR1c0JhclN0YXRlcy5TVEFURV9XQUlUSU5HLFxuICAgIH0sXG4gICAgeyAndXBweS1TdGF0dXNCYXItYWN0aW9uQnRuLS1kaXNhYmxlZCc6IGlzU29tZUdob3N0IH0sXG4gIClcblxuICBjb25zdCB1cGxvYWRCdG5UZXh0ID0gbmV3RmlsZXMgJiYgaXNVcGxvYWRTdGFydGVkICYmICFyZWNvdmVyZWRTdGF0ZVxuICAgID8gaTE4bigndXBsb2FkWE5ld0ZpbGVzJywgeyBzbWFydF9jb3VudDogbmV3RmlsZXMgfSlcbiAgICA6IGkxOG4oJ3VwbG9hZFhGaWxlcycsIHsgc21hcnRfY291bnQ6IG5ld0ZpbGVzIH0pXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT17dXBsb2FkQnRuQ2xhc3NOYW1lc31cbiAgICAgIGFyaWEtbGFiZWw9e2kxOG4oJ3VwbG9hZFhGaWxlcycsIHsgc21hcnRfY291bnQ6IG5ld0ZpbGVzIH0pfVxuICAgICAgb25DbGljaz17c3RhcnRVcGxvYWR9XG4gICAgICBkaXNhYmxlZD17aXNTb21lR2hvc3R9XG4gICAgICBkYXRhLXVwcHktc3VwZXItZm9jdXNhYmxlXG4gICAgPlxuICAgICAge3VwbG9hZEJ0blRleHR9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gUmV0cnlCdG4gKHByb3BzKSB7XG4gIGNvbnN0IHsgaTE4biwgdXBweSB9ID0gcHJvcHNcblxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPVwidXBweS11LXJlc2V0IHVwcHktYy1idG4gdXBweS1TdGF0dXNCYXItYWN0aW9uQnRuIHVwcHktU3RhdHVzQmFyLWFjdGlvbkJ0bi0tcmV0cnlcIlxuICAgICAgYXJpYS1sYWJlbD17aTE4bigncmV0cnlVcGxvYWQnKX1cbiAgICAgIG9uQ2xpY2s9eygpID0+IHVwcHkucmV0cnlBbGwoKX1cbiAgICAgIGRhdGEtdXBweS1zdXBlci1mb2N1c2FibGVcbiAgICA+XG4gICAgICA8c3ZnXG4gICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidXBweS1jLWljb25cIlxuICAgICAgICB3aWR0aD1cIjhcIlxuICAgICAgICBoZWlnaHQ9XCIxMFwiXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgOCAxMFwiXG4gICAgICA+XG4gICAgICAgIDxwYXRoIGQ9XCJNNCAyLjQwOGEyLjc1IDIuNzUgMCAxIDAgMi43NSAyLjc1LjYyNi42MjYgMCAwIDEgMS4yNS4wMTh2LjAyM2E0IDQgMCAxIDEtNC00LjA0MVYuMjVhLjI1LjI1IDAgMCAxIC4zODktLjIwOGwyLjI5OSAxLjUzM2EuMjUuMjUgMCAwIDEgMCAuNDE2bC0yLjMgMS41MzNBLjI1LjI1IDAgMCAxIDQgMy4zMTZ2LS45MDh6XCIgLz5cbiAgICAgIDwvc3ZnPlxuICAgICAge2kxOG4oJ3JldHJ5Jyl9XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gQ2FuY2VsQnRuIChwcm9wcykge1xuICBjb25zdCB7IGkxOG4sIHVwcHkgfSA9IHByb3BzXG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgIGNsYXNzTmFtZT1cInVwcHktdS1yZXNldCB1cHB5LVN0YXR1c0Jhci1hY3Rpb25DaXJjbGVCdG5cIlxuICAgICAgdGl0bGU9e2kxOG4oJ2NhbmNlbCcpfVxuICAgICAgYXJpYS1sYWJlbD17aTE4bignY2FuY2VsJyl9XG4gICAgICBvbkNsaWNrPXsoKSA9PiB1cHB5LmNhbmNlbEFsbCgpfVxuICAgICAgZGF0YS11cHB5LXN1cGVyLWZvY3VzYWJsZVxuICAgID5cbiAgICAgIDxzdmdcbiAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgICAgZm9jdXNhYmxlPVwiZmFsc2VcIlxuICAgICAgICBjbGFzc05hbWU9XCJ1cHB5LWMtaWNvblwiXG4gICAgICAgIHdpZHRoPVwiMTZcIlxuICAgICAgICBoZWlnaHQ9XCIxNlwiXG4gICAgICAgIHZpZXdCb3g9XCIwIDAgMTYgMTZcIlxuICAgICAgPlxuICAgICAgICA8ZyBmaWxsPVwibm9uZVwiIGZpbGxSdWxlPVwiZXZlbm9kZFwiPlxuICAgICAgICAgIDxjaXJjbGUgZmlsbD1cIiM4ODhcIiBjeD1cIjhcIiBjeT1cIjhcIiByPVwiOFwiIC8+XG4gICAgICAgICAgPHBhdGhcbiAgICAgICAgICAgIGZpbGw9XCIjRkZGXCJcbiAgICAgICAgICAgIGQ9XCJNOS4yODMgOGwyLjU2NyAyLjU2Ny0xLjI4MyAxLjI4M0w4IDkuMjgzIDUuNDMzIDExLjg1IDQuMTUgMTAuNTY3IDYuNzE3IDggNC4xNSA1LjQzMyA1LjQzMyA0LjE1IDggNi43MTdsMi41NjctMi41NjcgMS4yODMgMS4yODN6XCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2c+XG4gICAgICA8L3N2Zz5cbiAgICA8L2J1dHRvbj5cbiAgKVxufVxuXG5mdW5jdGlvbiBQYXVzZVJlc3VtZUJ1dHRvbiAocHJvcHMpIHtcbiAgY29uc3QgeyBpc0FsbFBhdXNlZCwgaTE4biwgaXNBbGxDb21wbGV0ZSwgcmVzdW1hYmxlVXBsb2FkcywgdXBweSB9ID0gcHJvcHNcbiAgY29uc3QgdGl0bGUgPSBpc0FsbFBhdXNlZCA/IGkxOG4oJ3Jlc3VtZScpIDogaTE4bigncGF1c2UnKVxuXG4gIGZ1bmN0aW9uIHRvZ2dsZVBhdXNlUmVzdW1lICgpIHtcbiAgICBpZiAoaXNBbGxDb21wbGV0ZSkgcmV0dXJuIG51bGxcblxuICAgIGlmICghcmVzdW1hYmxlVXBsb2Fkcykge1xuICAgICAgcmV0dXJuIHVwcHkuY2FuY2VsQWxsKClcbiAgICB9XG5cbiAgICBpZiAoaXNBbGxQYXVzZWQpIHtcbiAgICAgIHJldHVybiB1cHB5LnJlc3VtZUFsbCgpXG4gICAgfVxuXG4gICAgcmV0dXJuIHVwcHkucGF1c2VBbGwoKVxuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8YnV0dG9uXG4gICAgICB0aXRsZT17dGl0bGV9XG4gICAgICBhcmlhLWxhYmVsPXt0aXRsZX1cbiAgICAgIGNsYXNzTmFtZT1cInVwcHktdS1yZXNldCB1cHB5LVN0YXR1c0Jhci1hY3Rpb25DaXJjbGVCdG5cIlxuICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICBvbkNsaWNrPXt0b2dnbGVQYXVzZVJlc3VtZX1cbiAgICAgIGRhdGEtdXBweS1zdXBlci1mb2N1c2FibGVcbiAgICA+XG4gICAgICA8c3ZnXG4gICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidXBweS1jLWljb25cIlxuICAgICAgICB3aWR0aD1cIjE2XCJcbiAgICAgICAgaGVpZ2h0PVwiMTZcIlxuICAgICAgICB2aWV3Qm94PVwiMCAwIDE2IDE2XCJcbiAgICAgID5cbiAgICAgICAgPGcgZmlsbD1cIm5vbmVcIiBmaWxsUnVsZT1cImV2ZW5vZGRcIj5cbiAgICAgICAgICA8Y2lyY2xlIGZpbGw9XCIjODg4XCIgY3g9XCI4XCIgY3k9XCI4XCIgcj1cIjhcIiAvPlxuICAgICAgICAgIDxwYXRoXG4gICAgICAgICAgICBmaWxsPVwiI0ZGRlwiXG4gICAgICAgICAgICBkPXtcbiAgICAgICAgICAgICAgaXNBbGxQYXVzZWRcbiAgICAgICAgICAgICAgICA/ICdNNiA0LjI1TDExLjUgOCA2IDExLjc1eidcbiAgICAgICAgICAgICAgICA6ICdNNSA0LjVoMnY3SDV2LTd6bTQgMGgydjdIOXYtN3onXG4gICAgICAgICAgICB9XG4gICAgICAgICAgLz5cbiAgICAgICAgPC9nPlxuICAgICAgPC9zdmc+XG4gICAgPC9idXR0b24+XG4gIClcbn1cblxuZnVuY3Rpb24gRG9uZUJ0biAocHJvcHMpIHtcbiAgY29uc3QgeyBpMThuLCBkb25lQnV0dG9uSGFuZGxlciB9ID0gcHJvcHNcblxuICByZXR1cm4gKFxuICAgIDxidXR0b25cbiAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgY2xhc3NOYW1lPVwidXBweS11LXJlc2V0IHVwcHktYy1idG4gdXBweS1TdGF0dXNCYXItYWN0aW9uQnRuIHVwcHktU3RhdHVzQmFyLWFjdGlvbkJ0bi0tZG9uZVwiXG4gICAgICBvbkNsaWNrPXtkb25lQnV0dG9uSGFuZGxlcn1cbiAgICAgIGRhdGEtdXBweS1zdXBlci1mb2N1c2FibGVcbiAgICA+XG4gICAgICB7aTE4bignZG9uZScpfVxuICAgIDwvYnV0dG9uPlxuICApXG59XG5cbmZ1bmN0aW9uIExvYWRpbmdTcGlubmVyICgpIHtcbiAgcmV0dXJuIChcbiAgICA8c3ZnXG4gICAgICBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1zcGlubmVyXCJcbiAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICBmb2N1c2FibGU9XCJmYWxzZVwiXG4gICAgICB3aWR0aD1cIjE0XCJcbiAgICAgIGhlaWdodD1cIjE0XCJcbiAgICA+XG4gICAgICA8cGF0aFxuICAgICAgICBkPVwiTTEzLjk4MyA2LjU0N2MtLjEyLTIuNTA5LTEuNjQtNC44OTMtMy45MzktNS45MzYtMi40OC0xLjEyNy01LjQ4OC0uNjU2LTcuNTU2IDEuMDk0Qy41MjQgMy4zNjctLjM5OCA2LjA0OC4xNjIgOC41NjJjLjU1NiAyLjQ5NSAyLjQ2IDQuNTIgNC45NCA1LjE4MyAyLjkzMi43ODQgNS42MS0uNjAyIDcuMjU2LTMuMDE1LTEuNDkzIDEuOTkzLTMuNzQ1IDMuMzA5LTYuMjk4IDIuODY4LTIuNTE0LS40MzQtNC41NzgtMi4zNDktNS4xNTMtNC44NGE2LjIyNiA2LjIyNiAwIDAgMSAyLjk4LTYuNzc4QzYuMzQuNTg2IDkuNzQgMS4xIDExLjM3MyAzLjQ5M2MuNDA3LjU5Ni42OTMgMS4yODIuODQyIDEuOTg4LjEyNy41OTguMDczIDEuMTk3LjE2MSAxLjc5NC4wNzguNTI1LjU0MyAxLjI1NyAxLjE1Ljg2NC41MjUtLjM0MS40OS0xLjA1LjQ1Ni0xLjU5Mi0uMDA3LS4xNS4wMi4zIDAgMFwiXG4gICAgICAgIGZpbGxSdWxlPVwiZXZlbm9kZFwiXG4gICAgICAvPlxuICAgIDwvc3ZnPlxuICApXG59XG5cbmZ1bmN0aW9uIFByb2dyZXNzQmFyUHJvY2Vzc2luZyAocHJvcHMpIHtcbiAgY29uc3QgeyBwcm9ncmVzcyB9ID0gcHJvcHNcbiAgY29uc3QgeyB2YWx1ZSwgbW9kZSwgbWVzc2FnZSB9ID0gcHJvZ3Jlc3NcbiAgY29uc3Qgcm91bmRlZFZhbHVlID0gTWF0aC5yb3VuZCh2YWx1ZSAqIDEwMClcbiAgY29uc3QgZG90ID0gYFxcdTAwQjdgXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInVwcHktU3RhdHVzQmFyLWNvbnRlbnRcIj5cbiAgICAgIDxMb2FkaW5nU3Bpbm5lciAvPlxuICAgICAge21vZGUgPT09ICdkZXRlcm1pbmF0ZScgPyBgJHtyb3VuZGVkVmFsdWV9JSAke2RvdH0gYCA6ICcnfVxuICAgICAge21lc3NhZ2V9XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gUHJvZ3Jlc3NEZXRhaWxzIChwcm9wcykge1xuICBjb25zdCB7XG4gICAgbnVtVXBsb2FkcyxcbiAgICBjb21wbGV0ZSxcbiAgICB0b3RhbFVwbG9hZGVkU2l6ZSxcbiAgICB0b3RhbFNpemUsXG4gICAgdG90YWxFVEEsXG4gICAgaTE4bixcbiAgfSA9IHByb3BzXG5cbiAgY29uc3QgaWZTaG93RmlsZXNVcGxvYWRlZE9mVG90YWwgPSBudW1VcGxvYWRzID4gMVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1zdGF0dXNTZWNvbmRhcnlcIj5cbiAgICAgIHtpZlNob3dGaWxlc1VwbG9hZGVkT2ZUb3RhbFxuICAgICAgICAmJiBpMThuKCdmaWxlc1VwbG9hZGVkT2ZUb3RhbCcsIHtcbiAgICAgICAgICBjb21wbGV0ZSxcbiAgICAgICAgICBzbWFydF9jb3VudDogbnVtVXBsb2FkcyxcbiAgICAgICAgfSl9XG4gICAgICA8c3BhbiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1hZGRpdGlvbmFsSW5mb1wiPlxuICAgICAgICB7LyogV2hlbiBzaG91bGQgd2UgcmVuZGVyIHRoaXMgZG90P1xuICAgICAgICAgIDEuIC4tYWRkaXRpb25hbEluZm8gaXMgc2hvd24gKGhhcHBlbnMgb25seSBvbiBkZXNrdG9wcylcbiAgICAgICAgICAyLiBBTkQgJ2ZpbGVzVXBsb2FkZWRPZlRvdGFsJyB3YXMgc2hvd25cbiAgICAgICAgKi99XG4gICAgICAgIHtpZlNob3dGaWxlc1VwbG9hZGVkT2ZUb3RhbCAmJiByZW5kZXJEb3QoKX1cblxuICAgICAgICB7aTE4bignZGF0YVVwbG9hZGVkT2ZUb3RhbCcsIHtcbiAgICAgICAgICBjb21wbGV0ZTogcHJldHRpZXJCeXRlcyh0b3RhbFVwbG9hZGVkU2l6ZSksXG4gICAgICAgICAgdG90YWw6IHByZXR0aWVyQnl0ZXModG90YWxTaXplKSxcbiAgICAgICAgfSl9XG5cbiAgICAgICAge3JlbmRlckRvdCgpfVxuXG4gICAgICAgIHtpMThuKCd4VGltZUxlZnQnLCB7XG4gICAgICAgICAgdGltZTogcHJldHR5RVRBKHRvdGFsRVRBKSxcbiAgICAgICAgfSl9XG4gICAgICA8L3NwYW4+XG4gICAgPC9kaXY+XG4gIClcbn1cblxuZnVuY3Rpb24gRmlsZVVwbG9hZENvdW50IChwcm9wcykge1xuICBjb25zdCB7IGkxOG4sIGNvbXBsZXRlLCBudW1VcGxvYWRzIH0gPSBwcm9wc1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1zdGF0dXNTZWNvbmRhcnlcIj5cbiAgICAgIHtpMThuKCdmaWxlc1VwbG9hZGVkT2ZUb3RhbCcsIHsgY29tcGxldGUsIHNtYXJ0X2NvdW50OiBudW1VcGxvYWRzIH0pfVxuICAgIDwvZGl2PlxuICApXG59XG5cbmZ1bmN0aW9uIFVwbG9hZE5ld2x5QWRkZWRGaWxlcyAocHJvcHMpIHtcbiAgY29uc3QgeyBpMThuLCBuZXdGaWxlcywgc3RhcnRVcGxvYWQgfSA9IHByb3BzXG4gIGNvbnN0IHVwbG9hZEJ0bkNsYXNzTmFtZXMgPSBjbGFzc05hbWVzKFxuICAgICd1cHB5LXUtcmVzZXQnLFxuICAgICd1cHB5LWMtYnRuJyxcbiAgICAndXBweS1TdGF0dXNCYXItYWN0aW9uQnRuJyxcbiAgICAndXBweS1TdGF0dXNCYXItYWN0aW9uQnRuLS11cGxvYWROZXdseUFkZGVkJyxcbiAgKVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1zdGF0dXNTZWNvbmRhcnlcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidXBweS1TdGF0dXNCYXItc3RhdHVzU2Vjb25kYXJ5SGludFwiPlxuICAgICAgICB7aTE4bigneE1vcmVGaWxlc0FkZGVkJywgeyBzbWFydF9jb3VudDogbmV3RmlsZXMgfSl9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxidXR0b25cbiAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgIGNsYXNzTmFtZT17dXBsb2FkQnRuQ2xhc3NOYW1lc31cbiAgICAgICAgYXJpYS1sYWJlbD17aTE4bigndXBsb2FkWEZpbGVzJywgeyBzbWFydF9jb3VudDogbmV3RmlsZXMgfSl9XG4gICAgICAgIG9uQ2xpY2s9e3N0YXJ0VXBsb2FkfVxuICAgICAgPlxuICAgICAgICB7aTE4bigndXBsb2FkJyl9XG4gICAgICA8L2J1dHRvbj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5jb25zdCBUaHJvdHRsZWRQcm9ncmVzc0RldGFpbHMgPSB0aHJvdHRsZShQcm9ncmVzc0RldGFpbHMsIDUwMCwge1xuICBsZWFkaW5nOiB0cnVlLFxuICB0cmFpbGluZzogdHJ1ZSxcbn0pXG5cbmZ1bmN0aW9uIFByb2dyZXNzQmFyVXBsb2FkaW5nIChwcm9wcykge1xuICBjb25zdCB7XG4gICAgaTE4bixcbiAgICBzdXBwb3J0c1VwbG9hZFByb2dyZXNzLFxuICAgIHRvdGFsUHJvZ3Jlc3MsXG4gICAgc2hvd1Byb2dyZXNzRGV0YWlscyxcbiAgICBpc1VwbG9hZFN0YXJ0ZWQsXG4gICAgaXNBbGxDb21wbGV0ZSxcbiAgICBpc0FsbFBhdXNlZCxcbiAgICBuZXdGaWxlcyxcbiAgICBudW1VcGxvYWRzLFxuICAgIGNvbXBsZXRlLFxuICAgIHRvdGFsVXBsb2FkZWRTaXplLFxuICAgIHRvdGFsU2l6ZSxcbiAgICB0b3RhbEVUQSxcbiAgICBzdGFydFVwbG9hZCxcbiAgfSA9IHByb3BzXG4gIGNvbnN0IHNob3dVcGxvYWROZXdseUFkZGVkRmlsZXMgPSBuZXdGaWxlcyAmJiBpc1VwbG9hZFN0YXJ0ZWRcblxuICBpZiAoIWlzVXBsb2FkU3RhcnRlZCB8fCBpc0FsbENvbXBsZXRlKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IHRpdGxlID0gaXNBbGxQYXVzZWQgPyBpMThuKCdwYXVzZWQnKSA6IGkxOG4oJ3VwbG9hZGluZycpXG5cbiAgZnVuY3Rpb24gcmVuZGVyUHJvZ3Jlc3NEZXRhaWxzICgpIHtcbiAgICBpZiAoIWlzQWxsUGF1c2VkICYmICFzaG93VXBsb2FkTmV3bHlBZGRlZEZpbGVzICYmIHNob3dQcm9ncmVzc0RldGFpbHMpIHtcbiAgICAgIGlmIChzdXBwb3J0c1VwbG9hZFByb2dyZXNzKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPFRocm90dGxlZFByb2dyZXNzRGV0YWlsc1xuICAgICAgICAgICAgbnVtVXBsb2Fkcz17bnVtVXBsb2Fkc31cbiAgICAgICAgICAgIGNvbXBsZXRlPXtjb21wbGV0ZX1cbiAgICAgICAgICAgIHRvdGFsVXBsb2FkZWRTaXplPXt0b3RhbFVwbG9hZGVkU2l6ZX1cbiAgICAgICAgICAgIHRvdGFsU2l6ZT17dG90YWxTaXplfVxuICAgICAgICAgICAgdG90YWxFVEE9e3RvdGFsRVRBfVxuICAgICAgICAgICAgaTE4bj17aTE4bn1cbiAgICAgICAgICAvPlxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8RmlsZVVwbG9hZENvdW50XG4gICAgICAgICAgaTE4bj17aTE4bn1cbiAgICAgICAgICBjb21wbGV0ZT17Y29tcGxldGV9XG4gICAgICAgICAgbnVtVXBsb2Fkcz17bnVtVXBsb2Fkc31cbiAgICAgICAgLz5cbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1jb250ZW50XCIgYXJpYS1sYWJlbD17dGl0bGV9IHRpdGxlPXt0aXRsZX0+XG4gICAgICB7IWlzQWxsUGF1c2VkID8gPExvYWRpbmdTcGlubmVyIC8+IDogbnVsbH1cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwidXBweS1TdGF0dXNCYXItc3RhdHVzXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidXBweS1TdGF0dXNCYXItc3RhdHVzUHJpbWFyeVwiPlxuICAgICAgICAgIHtzdXBwb3J0c1VwbG9hZFByb2dyZXNzID8gYCR7dGl0bGV9OiAke3RvdGFsUHJvZ3Jlc3N9JWAgOiB0aXRsZX1cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAge3JlbmRlclByb2dyZXNzRGV0YWlscygpfVxuXG4gICAgICAgIHtzaG93VXBsb2FkTmV3bHlBZGRlZEZpbGVzID8gKFxuICAgICAgICAgIDxVcGxvYWROZXdseUFkZGVkRmlsZXNcbiAgICAgICAgICAgIGkxOG49e2kxOG59XG4gICAgICAgICAgICBuZXdGaWxlcz17bmV3RmlsZXN9XG4gICAgICAgICAgICBzdGFydFVwbG9hZD17c3RhcnRVcGxvYWR9XG4gICAgICAgICAgLz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBQcm9ncmVzc0JhckNvbXBsZXRlIChwcm9wcykge1xuICBjb25zdCB7IGkxOG4gfSA9IHByb3BzXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2XG4gICAgICBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1jb250ZW50XCJcbiAgICAgIHJvbGU9XCJzdGF0dXNcIlxuICAgICAgdGl0bGU9e2kxOG4oJ2NvbXBsZXRlJyl9XG4gICAgPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1zdGF0dXNcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1zdGF0dXNQcmltYXJ5XCI+XG4gICAgICAgICAgPHN2Z1xuICAgICAgICAgICAgYXJpYS1oaWRkZW49XCJ0cnVlXCJcbiAgICAgICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInVwcHktU3RhdHVzQmFyLXN0YXR1c0luZGljYXRvciB1cHB5LWMtaWNvblwiXG4gICAgICAgICAgICB3aWR0aD1cIjE1XCJcbiAgICAgICAgICAgIGhlaWdodD1cIjExXCJcbiAgICAgICAgICAgIHZpZXdCb3g9XCIwIDAgMTUgMTFcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxwYXRoIGQ9XCJNLjQxNCA1Ljg0M0wxLjYyNyA0LjYzbDMuNDcyIDMuNDcyTDEzLjIwMiAwbDEuMjEyIDEuMjEzTDUuMSAxMC41Mjh6XCIgLz5cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICB7aTE4bignY29tcGxldGUnKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuXG5mdW5jdGlvbiBQcm9ncmVzc0JhckVycm9yIChwcm9wcykge1xuICBjb25zdCB7IGVycm9yLCBpMThuLCBjb21wbGV0ZSwgbnVtVXBsb2FkcyB9ID0gcHJvcHNcblxuICBmdW5jdGlvbiBkaXNwbGF5RXJyb3JBbGVydCAoKSB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gYCR7aTE4bigndXBsb2FkRmFpbGVkJyl9IFxcblxcbiAke2Vycm9yfWBcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYWxlcnRcbiAgICBhbGVydChlcnJvck1lc3NhZ2UpIC8vIFRPRE86IG1vdmUgdG8gY3VzdG9tIGFsZXJ0IGltcGxlbWVudGF0aW9uXG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwidXBweS1TdGF0dXNCYXItY29udGVudFwiIHRpdGxlPXtpMThuKCd1cGxvYWRGYWlsZWQnKX0+XG4gICAgICA8c3ZnXG4gICAgICAgIGFyaWEtaGlkZGVuPVwidHJ1ZVwiXG4gICAgICAgIGZvY3VzYWJsZT1cImZhbHNlXCJcbiAgICAgICAgY2xhc3NOYW1lPVwidXBweS1TdGF0dXNCYXItc3RhdHVzSW5kaWNhdG9yIHVwcHktYy1pY29uXCJcbiAgICAgICAgd2lkdGg9XCIxMVwiXG4gICAgICAgIGhlaWdodD1cIjExXCJcbiAgICAgICAgdmlld0JveD1cIjAgMCAxMSAxMVwiXG4gICAgICA+XG4gICAgICAgIDxwYXRoIGQ9XCJNNC4yNzggNS41TDAgMS4yMjIgMS4yMjIgMCA1LjUgNC4yNzggOS43NzggMCAxMSAxLjIyMiA2LjcyMiA1LjUgMTEgOS43NzggOS43NzggMTEgNS41IDYuNzIyIDEuMjIyIDExIDAgOS43Nzh6XCIgLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1zdGF0dXNcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ1cHB5LVN0YXR1c0Jhci1zdGF0dXNQcmltYXJ5XCI+XG4gICAgICAgICAge2kxOG4oJ3VwbG9hZEZhaWxlZCcpfVxuXG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidXBweS11LXJlc2V0IHVwcHktU3RhdHVzQmFyLWRldGFpbHNcIlxuICAgICAgICAgICAgYXJpYS1sYWJlbD17aTE4bignc2hvd0Vycm9yRGV0YWlscycpfVxuICAgICAgICAgICAgZGF0YS1taWNyb3RpcC1wb3NpdGlvbj1cInRvcC1yaWdodFwiXG4gICAgICAgICAgICBkYXRhLW1pY3JvdGlwLXNpemU9XCJtZWRpdW1cIlxuICAgICAgICAgICAgb25DbGljaz17ZGlzcGxheUVycm9yQWxlcnR9XG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA/XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIDxGaWxlVXBsb2FkQ291bnQgaTE4bj17aTE4bn0gY29tcGxldGU9e2NvbXBsZXRlfSBudW1VcGxvYWRzPXtudW1VcGxvYWRzfSAvPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIClcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFVwbG9hZEJ0bixcbiAgUmV0cnlCdG4sXG4gIENhbmNlbEJ0bixcbiAgUGF1c2VSZXN1bWVCdXR0b24sXG4gIERvbmVCdG4sXG4gIExvYWRpbmdTcGlubmVyLFxuICBQcm9ncmVzc0RldGFpbHMsXG4gIFByb2dyZXNzQmFyUHJvY2Vzc2luZyxcbiAgUHJvZ3Jlc3NCYXJFcnJvcixcbiAgUHJvZ3Jlc3NCYXJVcGxvYWRpbmcsXG4gIFByb2dyZXNzQmFyQ29tcGxldGUsXG59XG4iLCJjb25zdCB7IGggfSA9IHJlcXVpcmUoJ3ByZWFjdCcpXG5jb25zdCBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpXG5jb25zdCBzdGF0dXNCYXJTdGF0ZXMgPSByZXF1aXJlKCcuL1N0YXR1c0JhclN0YXRlcycpXG5jb25zdCBjYWxjdWxhdGVQcm9jZXNzaW5nUHJvZ3Jlc3MgPSByZXF1aXJlKCcuL2NhbGN1bGF0ZVByb2Nlc3NpbmdQcm9ncmVzcycpXG5cbmNvbnN0IHtcbiAgVXBsb2FkQnRuLFxuICBSZXRyeUJ0bixcbiAgQ2FuY2VsQnRuLFxuICBQYXVzZVJlc3VtZUJ1dHRvbixcbiAgRG9uZUJ0bixcbiAgUHJvZ3Jlc3NCYXJQcm9jZXNzaW5nLFxuICBQcm9ncmVzc0JhckVycm9yLFxuICBQcm9ncmVzc0JhclVwbG9hZGluZyxcbiAgUHJvZ3Jlc3NCYXJDb21wbGV0ZSxcbn0gPSByZXF1aXJlKCcuL0NvbXBvbmVudHMnKVxuXG5jb25zdCB7XG4gIFNUQVRFX0VSUk9SLFxuICBTVEFURV9XQUlUSU5HLFxuICBTVEFURV9QUkVQUk9DRVNTSU5HLFxuICBTVEFURV9VUExPQURJTkcsXG4gIFNUQVRFX1BPU1RQUk9DRVNTSU5HLFxuICBTVEFURV9DT01QTEVURSxcbn0gPSBzdGF0dXNCYXJTdGF0ZXNcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0dXNCYXJcblxuZnVuY3Rpb24gU3RhdHVzQmFyIChwcm9wcykge1xuICBjb25zdCB7XG4gICAgbmV3RmlsZXMsXG4gICAgYWxsb3dOZXdVcGxvYWQsXG4gICAgaXNVcGxvYWRJblByb2dyZXNzLFxuICAgIGlzQWxsUGF1c2VkLFxuICAgIHJlc3VtYWJsZVVwbG9hZHMsXG4gICAgZXJyb3IsXG4gICAgaGlkZVVwbG9hZEJ1dHRvbixcbiAgICBoaWRlUGF1c2VSZXN1bWVCdXR0b24sXG4gICAgaGlkZUNhbmNlbEJ1dHRvbixcbiAgICBoaWRlUmV0cnlCdXR0b24sXG4gICAgcmVjb3ZlcmVkU3RhdGUsXG4gICAgdXBsb2FkU3RhdGUsXG4gICAgdG90YWxQcm9ncmVzcyxcbiAgICBmaWxlcyxcbiAgICBzdXBwb3J0c1VwbG9hZFByb2dyZXNzLFxuICAgIGhpZGVBZnRlckZpbmlzaCxcbiAgICBpc1NvbWVHaG9zdCxcbiAgICBpc1RhcmdldERPTUVsLFxuICAgIGRvbmVCdXR0b25IYW5kbGVyLFxuICAgIGlzVXBsb2FkU3RhcnRlZCxcbiAgICBpMThuLFxuICAgIHN0YXJ0VXBsb2FkLFxuICAgIHVwcHksXG4gICAgaXNBbGxDb21wbGV0ZSxcbiAgICBzaG93UHJvZ3Jlc3NEZXRhaWxzLFxuICAgIG51bVVwbG9hZHMsXG4gICAgY29tcGxldGUsXG4gICAgdG90YWxTaXplLFxuICAgIHRvdGFsRVRBLFxuICAgIHRvdGFsVXBsb2FkZWRTaXplLFxuICB9ID0gcHJvcHNcblxuICBmdW5jdGlvbiBnZXRQcm9ncmVzc1ZhbHVlICgpIHtcbiAgICBzd2l0Y2ggKHVwbG9hZFN0YXRlKSB7XG4gICAgICBjYXNlIFNUQVRFX1BPU1RQUk9DRVNTSU5HOlxuICAgICAgY2FzZSBTVEFURV9QUkVQUk9DRVNTSU5HOiB7XG4gICAgICAgIGNvbnN0IHByb2dyZXNzID0gY2FsY3VsYXRlUHJvY2Vzc2luZ1Byb2dyZXNzKGZpbGVzKVxuXG4gICAgICAgIGlmIChwcm9ncmVzcy5tb2RlID09PSAnZGV0ZXJtaW5hdGUnKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2dyZXNzLnZhbHVlICogMTAwXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvdGFsUHJvZ3Jlc3NcbiAgICAgIH1cbiAgICAgIGNhc2UgU1RBVEVfRVJST1I6IHtcbiAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgIH1cbiAgICAgIGNhc2UgU1RBVEVfVVBMT0FESU5HOiB7XG4gICAgICAgIGlmICghc3VwcG9ydHNVcGxvYWRQcm9ncmVzcykge1xuICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRvdGFsUHJvZ3Jlc3NcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiB0b3RhbFByb2dyZXNzXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SXNJbmRldGVybWluYXRlICgpIHtcbiAgICBzd2l0Y2ggKHVwbG9hZFN0YXRlKSB7XG4gICAgICBjYXNlIFNUQVRFX1BPU1RQUk9DRVNTSU5HOlxuICAgICAgY2FzZSBTVEFURV9QUkVQUk9DRVNTSU5HOiB7XG4gICAgICAgIGNvbnN0IHsgbW9kZSB9ID0gY2FsY3VsYXRlUHJvY2Vzc2luZ1Byb2dyZXNzKGZpbGVzKVxuICAgICAgICByZXR1cm4gbW9kZSA9PT0gJ2luZGV0ZXJtaW5hdGUnXG4gICAgICB9XG4gICAgICBjYXNlIFNUQVRFX1VQTE9BRElORzoge1xuICAgICAgICBpZiAoIXN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SXNIaWRkZW4gKCkge1xuICAgIGlmIChyZWNvdmVyZWRTdGF0ZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgc3dpdGNoICh1cGxvYWRTdGF0ZSkge1xuICAgICAgY2FzZSBTVEFURV9XQUlUSU5HOlxuICAgICAgICByZXR1cm4gaGlkZVVwbG9hZEJ1dHRvbiB8fCBuZXdGaWxlcyA9PT0gMFxuICAgICAgY2FzZSBTVEFURV9DT01QTEVURTpcbiAgICAgICAgcmV0dXJuIGhpZGVBZnRlckZpbmlzaFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgY29uc3QgcHJvZ3Jlc3NWYWx1ZSA9IGdldFByb2dyZXNzVmFsdWUoKVxuXG4gIGNvbnN0IGlzSGlkZGVuID0gZ2V0SXNIaWRkZW4oKVxuXG4gIGNvbnN0IHdpZHRoID0gcHJvZ3Jlc3NWYWx1ZSA/PyAxMDBcblxuICBjb25zdCBzaG93VXBsb2FkQnRuID0gIWVycm9yXG4gICAgJiYgbmV3RmlsZXNcbiAgICAmJiAhaXNVcGxvYWRJblByb2dyZXNzXG4gICAgJiYgIWlzQWxsUGF1c2VkXG4gICAgJiYgYWxsb3dOZXdVcGxvYWRcbiAgICAmJiAhaGlkZVVwbG9hZEJ1dHRvblxuXG4gIGNvbnN0IHNob3dDYW5jZWxCdG4gPSAhaGlkZUNhbmNlbEJ1dHRvblxuICAgICYmIHVwbG9hZFN0YXRlICE9PSBTVEFURV9XQUlUSU5HXG4gICAgJiYgdXBsb2FkU3RhdGUgIT09IFNUQVRFX0NPTVBMRVRFXG5cbiAgY29uc3Qgc2hvd1BhdXNlUmVzdW1lQnRuID0gcmVzdW1hYmxlVXBsb2Fkc1xuICAgICYmICFoaWRlUGF1c2VSZXN1bWVCdXR0b25cbiAgICAmJiB1cGxvYWRTdGF0ZSA9PT0gU1RBVEVfVVBMT0FESU5HXG5cbiAgY29uc3Qgc2hvd1JldHJ5QnRuID0gZXJyb3IgJiYgIWlzQWxsQ29tcGxldGUgJiYgIWhpZGVSZXRyeUJ1dHRvblxuXG4gIGNvbnN0IHNob3dEb25lQnRuID0gZG9uZUJ1dHRvbkhhbmRsZXIgJiYgdXBsb2FkU3RhdGUgPT09IFNUQVRFX0NPTVBMRVRFXG5cbiAgY29uc3QgcHJvZ3Jlc3NDbGFzc05hbWVzID0gY2xhc3NOYW1lcygndXBweS1TdGF0dXNCYXItcHJvZ3Jlc3MnLCB7XG4gICAgJ2lzLWluZGV0ZXJtaW5hdGUnOiBnZXRJc0luZGV0ZXJtaW5hdGUoKSxcbiAgfSlcblxuICBjb25zdCBzdGF0dXNCYXJDbGFzc05hbWVzID0gY2xhc3NOYW1lcyhcbiAgICB7ICd1cHB5LVJvb3QnOiBpc1RhcmdldERPTUVsIH0sXG4gICAgJ3VwcHktU3RhdHVzQmFyJyxcbiAgICBgaXMtJHt1cGxvYWRTdGF0ZX1gLFxuICAgIHsgJ2hhcy1naG9zdHMnOiBpc1NvbWVHaG9zdCB9LFxuICApXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17c3RhdHVzQmFyQ2xhc3NOYW1lc30gYXJpYS1oaWRkZW49e2lzSGlkZGVufT5cbiAgICAgIDxkaXZcbiAgICAgICAgY2xhc3NOYW1lPXtwcm9ncmVzc0NsYXNzTmFtZXN9XG4gICAgICAgIHN0eWxlPXt7IHdpZHRoOiBgJHt3aWR0aH0lYCB9fVxuICAgICAgICByb2xlPVwicHJvZ3Jlc3NiYXJcIlxuICAgICAgICBhcmlhLWxhYmVsPXtgJHt3aWR0aH0lYH1cbiAgICAgICAgYXJpYS12YWx1ZXRleHQ9e2Ake3dpZHRofSVgfVxuICAgICAgICBhcmlhLXZhbHVlbWluPVwiMFwiXG4gICAgICAgIGFyaWEtdmFsdWVtYXg9XCIxMDBcIlxuICAgICAgICBhcmlhLXZhbHVlbm93PXtwcm9ncmVzc1ZhbHVlfVxuICAgICAgLz5cblxuICAgICAgeygoKSA9PiB7XG4gICAgICAgIHN3aXRjaCAodXBsb2FkU3RhdGUpIHtcbiAgICAgICAgICBjYXNlIFNUQVRFX1BSRVBST0NFU1NJTkc6XG4gICAgICAgICAgY2FzZSBTVEFURV9QT1NUUFJPQ0VTU0lORzpcbiAgICAgICAgICAgIHJldHVybiA8UHJvZ3Jlc3NCYXJQcm9jZXNzaW5nIHByb2dyZXNzPXtjYWxjdWxhdGVQcm9jZXNzaW5nUHJvZ3Jlc3MoZmlsZXMpfSAvPlxuICAgICAgICAgIGNhc2UgU1RBVEVfQ09NUExFVEU6XG4gICAgICAgICAgICByZXR1cm4gPFByb2dyZXNzQmFyQ29tcGxldGUgaTE4bj17aTE4bn0gLz5cbiAgICAgICAgICBjYXNlIFNUQVRFX0VSUk9SOlxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPFByb2dyZXNzQmFyRXJyb3JcbiAgICAgICAgICAgICAgICBlcnJvcj17ZXJyb3J9XG4gICAgICAgICAgICAgICAgaTE4bj17aTE4bn1cbiAgICAgICAgICAgICAgICBudW1VcGxvYWRzPXtudW1VcGxvYWRzfVxuICAgICAgICAgICAgICAgIGNvbXBsZXRlPXtjb21wbGV0ZX1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIClcbiAgICAgICAgICBjYXNlIFNUQVRFX1VQTE9BRElORzpcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxQcm9ncmVzc0JhclVwbG9hZGluZ1xuICAgICAgICAgICAgICAgIGkxOG49e2kxOG59XG4gICAgICAgICAgICAgICAgc3VwcG9ydHNVcGxvYWRQcm9ncmVzcz17c3VwcG9ydHNVcGxvYWRQcm9ncmVzc31cbiAgICAgICAgICAgICAgICB0b3RhbFByb2dyZXNzPXt0b3RhbFByb2dyZXNzfVxuICAgICAgICAgICAgICAgIHNob3dQcm9ncmVzc0RldGFpbHM9e3Nob3dQcm9ncmVzc0RldGFpbHN9XG4gICAgICAgICAgICAgICAgaXNVcGxvYWRTdGFydGVkPXtpc1VwbG9hZFN0YXJ0ZWR9XG4gICAgICAgICAgICAgICAgaXNBbGxDb21wbGV0ZT17aXNBbGxDb21wbGV0ZX1cbiAgICAgICAgICAgICAgICBpc0FsbFBhdXNlZD17aXNBbGxQYXVzZWR9XG4gICAgICAgICAgICAgICAgbmV3RmlsZXM9e25ld0ZpbGVzfVxuICAgICAgICAgICAgICAgIG51bVVwbG9hZHM9e251bVVwbG9hZHN9XG4gICAgICAgICAgICAgICAgY29tcGxldGU9e2NvbXBsZXRlfVxuICAgICAgICAgICAgICAgIHRvdGFsVXBsb2FkZWRTaXplPXt0b3RhbFVwbG9hZGVkU2l6ZX1cbiAgICAgICAgICAgICAgICB0b3RhbFNpemU9e3RvdGFsU2l6ZX1cbiAgICAgICAgICAgICAgICB0b3RhbEVUQT17dG90YWxFVEF9XG4gICAgICAgICAgICAgICAgc3RhcnRVcGxvYWQ9e3N0YXJ0VXBsb2FkfVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKVxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG4gICAgICB9KSgpfVxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInVwcHktU3RhdHVzQmFyLWFjdGlvbnNcIj5cbiAgICAgICAge3JlY292ZXJlZFN0YXRlIHx8IHNob3dVcGxvYWRCdG4gPyAoXG4gICAgICAgICAgPFVwbG9hZEJ0blxuICAgICAgICAgICAgbmV3RmlsZXM9e25ld0ZpbGVzfVxuICAgICAgICAgICAgaXNVcGxvYWRTdGFydGVkPXtpc1VwbG9hZFN0YXJ0ZWR9XG4gICAgICAgICAgICByZWNvdmVyZWRTdGF0ZT17cmVjb3ZlcmVkU3RhdGV9XG4gICAgICAgICAgICBpMThuPXtpMThufVxuICAgICAgICAgICAgaXNTb21lR2hvc3Q9e2lzU29tZUdob3N0fVxuICAgICAgICAgICAgc3RhcnRVcGxvYWQ9e3N0YXJ0VXBsb2FkfVxuICAgICAgICAgICAgdXBsb2FkU3RhdGU9e3VwbG9hZFN0YXRlfVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHtzaG93UmV0cnlCdG4gPyA8UmV0cnlCdG4gaTE4bj17aTE4bn0gdXBweT17dXBweX0gLz4gOiBudWxsfVxuXG4gICAgICAgIHtzaG93UGF1c2VSZXN1bWVCdG4gPyAoXG4gICAgICAgICAgPFBhdXNlUmVzdW1lQnV0dG9uXG4gICAgICAgICAgICBpc0FsbFBhdXNlZD17aXNBbGxQYXVzZWR9XG4gICAgICAgICAgICBpMThuPXtpMThufVxuICAgICAgICAgICAgaXNBbGxDb21wbGV0ZT17aXNBbGxDb21wbGV0ZX1cbiAgICAgICAgICAgIHJlc3VtYWJsZVVwbG9hZHM9e3Jlc3VtYWJsZVVwbG9hZHN9XG4gICAgICAgICAgICB1cHB5PXt1cHB5fVxuICAgICAgICAgIC8+XG4gICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgIHtzaG93Q2FuY2VsQnRuID8gPENhbmNlbEJ0biBpMThuPXtpMThufSB1cHB5PXt1cHB5fSAvPiA6IG51bGx9XG5cbiAgICAgICAge3Nob3dEb25lQnRuID8gKFxuICAgICAgICAgIDxEb25lQnRuIGkxOG49e2kxOG59IGRvbmVCdXR0b25IYW5kbGVyPXtkb25lQnV0dG9uSGFuZGxlcn0gLz5cbiAgICAgICAgKSA6IG51bGx9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKVxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIFNUQVRFX0VSUk9SOiAnZXJyb3InLFxuICBTVEFURV9XQUlUSU5HOiAnd2FpdGluZycsXG4gIFNUQVRFX1BSRVBST0NFU1NJTkc6ICdwcmVwcm9jZXNzaW5nJyxcbiAgU1RBVEVfVVBMT0FESU5HOiAndXBsb2FkaW5nJyxcbiAgU1RBVEVfUE9TVFBST0NFU1NJTkc6ICdwb3N0cHJvY2Vzc2luZycsXG4gIFNUQVRFX0NPTVBMRVRFOiAnY29tcGxldGUnLFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjYWxjdWxhdGVQcm9jZXNzaW5nUHJvZ3Jlc3MgKGZpbGVzKSB7XG4gIGNvbnN0IHZhbHVlcyA9IFtdXG4gIGxldCBtb2RlXG4gIGxldCBtZXNzYWdlXG5cbiAgZm9yIChjb25zdCB7IHByb2dyZXNzIH0gb2YgT2JqZWN0LnZhbHVlcyhmaWxlcykpIHtcbiAgICBjb25zdCB7IHByZXByb2Nlc3MsIHBvc3Rwcm9jZXNzIH0gPSBwcm9ncmVzc1xuICAgIC8vIEluIHRoZSBmdXR1cmUgd2Ugc2hvdWxkIHByb2JhYmx5IGRvIHRoaXMgZGlmZmVyZW50bHkuIEZvciBub3cgd2UnbGwgdGFrZSB0aGVcbiAgICAvLyBtb2RlIGFuZCBtZXNzYWdlIGZyb20gdGhlIGZpcnN0IGZpbGXigKZcbiAgICBpZiAobWVzc2FnZSA9PSBudWxsICYmIChwcmVwcm9jZXNzIHx8IHBvc3Rwcm9jZXNzKSkge1xuICAgICAgKHsgbW9kZSwgbWVzc2FnZSB9ID0gcHJlcHJvY2VzcyB8fCBwb3N0cHJvY2VzcylcbiAgICB9XG4gICAgaWYgKHByZXByb2Nlc3M/Lm1vZGUgPT09ICdkZXRlcm1pbmF0ZScpIHZhbHVlcy5wdXNoKHByZXByb2Nlc3MudmFsdWUpXG4gICAgaWYgKHBvc3Rwcm9jZXNzPy5tb2RlID09PSAnZGV0ZXJtaW5hdGUnKSB2YWx1ZXMucHVzaChwb3N0cHJvY2Vzcy52YWx1ZSlcbiAgfVxuXG4gIGNvbnN0IHZhbHVlID0gdmFsdWVzLnJlZHVjZSgodG90YWwsIHByb2dyZXNzVmFsdWUpID0+IHtcbiAgICByZXR1cm4gdG90YWwgKyBwcm9ncmVzc1ZhbHVlIC8gdmFsdWVzLmxlbmd0aFxuICB9LCAwKVxuXG4gIHJldHVybiB7XG4gICAgbW9kZSxcbiAgICBtZXNzYWdlLFxuICAgIHZhbHVlLFxuICB9XG59XG4iLCJjb25zdCB7IFVJUGx1Z2luIH0gPSByZXF1aXJlKCdAdXBweS9jb3JlJylcbmNvbnN0IGdldFNwZWVkID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldFNwZWVkJylcbmNvbnN0IGdldEJ5dGVzUmVtYWluaW5nID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldEJ5dGVzUmVtYWluaW5nJylcbmNvbnN0IGdldFRleHREaXJlY3Rpb24gPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvZ2V0VGV4dERpcmVjdGlvbicpXG5jb25zdCBzdGF0dXNCYXJTdGF0ZXMgPSByZXF1aXJlKCcuL1N0YXR1c0JhclN0YXRlcycpXG5jb25zdCBTdGF0dXNCYXJVSSA9IHJlcXVpcmUoJy4vU3RhdHVzQmFyJylcblxuY29uc3QgbG9jYWxlID0gcmVxdWlyZSgnLi9sb2NhbGUuanMnKVxuXG4vKipcbiAqIFN0YXR1c0JhcjogcmVuZGVycyBhIHN0YXR1cyBiYXIgd2l0aCB1cGxvYWQvcGF1c2UvcmVzdW1lL2NhbmNlbC9yZXRyeSBidXR0b25zLFxuICogcHJvZ3Jlc3MgcGVyY2VudGFnZSBhbmQgdGltZSByZW1haW5pbmcuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU3RhdHVzQmFyIGV4dGVuZHMgVUlQbHVnaW4ge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZ2xvYmFsLXJlcXVpcmVcbiAgc3RhdGljIFZFUlNJT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uO1xuXG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgc3VwZXIodXBweSwgb3B0cylcbiAgICB0aGlzLmlkID0gdGhpcy5vcHRzLmlkIHx8ICdTdGF0dXNCYXInXG4gICAgdGhpcy50aXRsZSA9ICdTdGF0dXNCYXInXG4gICAgdGhpcy50eXBlID0gJ3Byb2dyZXNzaW5kaWNhdG9yJ1xuXG4gICAgdGhpcy5kZWZhdWx0TG9jYWxlID0gbG9jYWxlXG5cbiAgICAvLyBzZXQgZGVmYXVsdCBvcHRpb25zXG4gICAgY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICB0YXJnZXQ6ICdib2R5JyxcbiAgICAgIGhpZGVVcGxvYWRCdXR0b246IGZhbHNlLFxuICAgICAgaGlkZVJldHJ5QnV0dG9uOiBmYWxzZSxcbiAgICAgIGhpZGVQYXVzZVJlc3VtZUJ1dHRvbjogZmFsc2UsXG4gICAgICBoaWRlQ2FuY2VsQnV0dG9uOiBmYWxzZSxcbiAgICAgIHNob3dQcm9ncmVzc0RldGFpbHM6IGZhbHNlLFxuICAgICAgaGlkZUFmdGVyRmluaXNoOiB0cnVlLFxuICAgICAgZG9uZUJ1dHRvbkhhbmRsZXI6IG51bGwsXG4gICAgfVxuXG4gICAgdGhpcy5vcHRzID0geyAuLi5kZWZhdWx0T3B0aW9ucywgLi4ub3B0cyB9XG5cbiAgICB0aGlzLmkxOG5Jbml0KClcblxuICAgIHRoaXMucmVuZGVyID0gdGhpcy5yZW5kZXIuYmluZCh0aGlzKVxuICAgIHRoaXMuaW5zdGFsbCA9IHRoaXMuaW5zdGFsbC5iaW5kKHRoaXMpXG4gIH1cblxuICBzdGFydFVwbG9hZCA9ICgpID0+IHtcbiAgICBjb25zdCB7IHJlY292ZXJlZFN0YXRlIH0gPSB0aGlzLnVwcHkuZ2V0U3RhdGUoKVxuXG4gICAgaWYgKHJlY292ZXJlZFN0YXRlKSB7XG4gICAgICB0aGlzLnVwcHkuZW1pdCgncmVzdG9yZS1jb25maXJtZWQnKVxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnVwcHkudXBsb2FkKCkuY2F0Y2goKCkgPT4ge1xuICAgICAgLy8gRXJyb3IgbG9nZ2VkIGluIENvcmVcbiAgICB9KVxuICB9O1xuXG4gIHJlbmRlciAoc3RhdGUpIHtcbiAgICBjb25zdCB7XG4gICAgICBjYXBhYmlsaXRpZXMsXG4gICAgICBmaWxlcyxcbiAgICAgIGFsbG93TmV3VXBsb2FkLFxuICAgICAgdG90YWxQcm9ncmVzcyxcbiAgICAgIGVycm9yLFxuICAgICAgcmVjb3ZlcmVkU3RhdGUsXG4gICAgfSA9IHN0YXRlXG5cbiAgICBjb25zdCB7XG4gICAgICBuZXdGaWxlcyxcbiAgICAgIHN0YXJ0ZWRGaWxlcyxcbiAgICAgIGNvbXBsZXRlRmlsZXMsXG4gICAgICBpblByb2dyZXNzTm90UGF1c2VkRmlsZXMsXG5cbiAgICAgIGlzVXBsb2FkU3RhcnRlZCxcbiAgICAgIGlzQWxsQ29tcGxldGUsXG4gICAgICBpc0FsbEVycm9yZWQsXG4gICAgICBpc0FsbFBhdXNlZCxcbiAgICAgIGlzVXBsb2FkSW5Qcm9ncmVzcyxcbiAgICAgIGlzU29tZUdob3N0LFxuICAgIH0gPSB0aGlzLnVwcHkuZ2V0T2JqZWN0T2ZGaWxlc1BlclN0YXRlKClcblxuICAgIC8vIElmIHNvbWUgc3RhdGUgd2FzIHJlY292ZXJlZCwgd2Ugd2FudCB0byBzaG93IFVwbG9hZCBidXR0b24vY291bnRlclxuICAgIC8vIGZvciBhbGwgdGhlIGZpbGVzLCBiZWNhdXNlIGluIHRoaXMgY2FzZSBpdOKAmXMgbm90IGFuIFVwbG9hZCBidXR0b24sXG4gICAgLy8gYnV0IOKAnENvbmZpcm0gUmVzdG9yZSBCdXR0b27igJ1cbiAgICBjb25zdCBuZXdGaWxlc09yUmVjb3ZlcmVkID0gcmVjb3ZlcmVkU3RhdGVcbiAgICAgID8gT2JqZWN0LnZhbHVlcyhmaWxlcylcbiAgICAgIDogbmV3RmlsZXNcbiAgICBjb25zdCB0b3RhbEVUQSA9IGdldFRvdGFsRVRBKGluUHJvZ3Jlc3NOb3RQYXVzZWRGaWxlcylcbiAgICBjb25zdCByZXN1bWFibGVVcGxvYWRzID0gISFjYXBhYmlsaXRpZXMucmVzdW1hYmxlVXBsb2Fkc1xuICAgIGNvbnN0IHN1cHBvcnRzVXBsb2FkUHJvZ3Jlc3MgPSBjYXBhYmlsaXRpZXMudXBsb2FkUHJvZ3Jlc3MgIT09IGZhbHNlXG5cbiAgICBsZXQgdG90YWxTaXplID0gMFxuICAgIGxldCB0b3RhbFVwbG9hZGVkU2l6ZSA9IDBcblxuICAgIHN0YXJ0ZWRGaWxlcy5mb3JFYWNoKChmaWxlKSA9PiB7XG4gICAgICB0b3RhbFNpemUgKz0gZmlsZS5wcm9ncmVzcy5ieXRlc1RvdGFsIHx8IDBcbiAgICAgIHRvdGFsVXBsb2FkZWRTaXplICs9IGZpbGUucHJvZ3Jlc3MuYnl0ZXNVcGxvYWRlZCB8fCAwXG4gICAgfSlcblxuICAgIHJldHVybiBTdGF0dXNCYXJVSSh7XG4gICAgICBlcnJvcixcbiAgICAgIHVwbG9hZFN0YXRlOiBnZXRVcGxvYWRpbmdTdGF0ZShcbiAgICAgICAgZXJyb3IsXG4gICAgICAgIGlzQWxsQ29tcGxldGUsXG4gICAgICAgIHJlY292ZXJlZFN0YXRlLFxuICAgICAgICBzdGF0ZS5maWxlcyB8fCB7fSxcbiAgICAgICksXG4gICAgICBhbGxvd05ld1VwbG9hZCxcbiAgICAgIHRvdGFsUHJvZ3Jlc3MsXG4gICAgICB0b3RhbFNpemUsXG4gICAgICB0b3RhbFVwbG9hZGVkU2l6ZSxcbiAgICAgIGlzQWxsQ29tcGxldGU6IGZhbHNlLFxuICAgICAgaXNBbGxQYXVzZWQsXG4gICAgICBpc0FsbEVycm9yZWQsXG4gICAgICBpc1VwbG9hZFN0YXJ0ZWQsXG4gICAgICBpc1VwbG9hZEluUHJvZ3Jlc3MsXG4gICAgICBpc1NvbWVHaG9zdCxcbiAgICAgIHJlY292ZXJlZFN0YXRlLFxuICAgICAgY29tcGxldGU6IGNvbXBsZXRlRmlsZXMubGVuZ3RoLFxuICAgICAgbmV3RmlsZXM6IG5ld0ZpbGVzT3JSZWNvdmVyZWQubGVuZ3RoLFxuICAgICAgbnVtVXBsb2Fkczogc3RhcnRlZEZpbGVzLmxlbmd0aCxcbiAgICAgIHRvdGFsRVRBLFxuICAgICAgZmlsZXMsXG4gICAgICBpMThuOiB0aGlzLmkxOG4sXG4gICAgICB1cHB5OiB0aGlzLnVwcHksXG4gICAgICBzdGFydFVwbG9hZDogdGhpcy5zdGFydFVwbG9hZCxcbiAgICAgIGRvbmVCdXR0b25IYW5kbGVyOiB0aGlzLm9wdHMuZG9uZUJ1dHRvbkhhbmRsZXIsXG4gICAgICByZXN1bWFibGVVcGxvYWRzLFxuICAgICAgc3VwcG9ydHNVcGxvYWRQcm9ncmVzcyxcbiAgICAgIHNob3dQcm9ncmVzc0RldGFpbHM6IHRoaXMub3B0cy5zaG93UHJvZ3Jlc3NEZXRhaWxzLFxuICAgICAgaGlkZVVwbG9hZEJ1dHRvbjogdGhpcy5vcHRzLmhpZGVVcGxvYWRCdXR0b24sXG4gICAgICBoaWRlUmV0cnlCdXR0b246IHRoaXMub3B0cy5oaWRlUmV0cnlCdXR0b24sXG4gICAgICBoaWRlUGF1c2VSZXN1bWVCdXR0b246IHRoaXMub3B0cy5oaWRlUGF1c2VSZXN1bWVCdXR0b24sXG4gICAgICBoaWRlQ2FuY2VsQnV0dG9uOiB0aGlzLm9wdHMuaGlkZUNhbmNlbEJ1dHRvbixcbiAgICAgIGhpZGVBZnRlckZpbmlzaDogdGhpcy5vcHRzLmhpZGVBZnRlckZpbmlzaCxcbiAgICAgIGlzVGFyZ2V0RE9NRWw6IHRoaXMuaXNUYXJnZXRET01FbCxcbiAgICB9KVxuICB9XG5cbiAgb25Nb3VudCAoKSB7XG4gICAgLy8gU2V0IHRoZSB0ZXh0IGRpcmVjdGlvbiBpZiB0aGUgcGFnZSBoYXMgbm90IGRlZmluZWQgb25lLlxuICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmVsXG4gICAgY29uc3QgZGlyZWN0aW9uID0gZ2V0VGV4dERpcmVjdGlvbihlbGVtZW50KVxuICAgIGlmICghZGlyZWN0aW9uKSB7XG4gICAgICBlbGVtZW50LmRpciA9ICdsdHInXG4gICAgfVxuICB9XG5cbiAgaW5zdGFsbCAoKSB7XG4gICAgY29uc3QgeyB0YXJnZXQgfSA9IHRoaXMub3B0c1xuICAgIGlmICh0YXJnZXQpIHtcbiAgICAgIHRoaXMubW91bnQodGFyZ2V0LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIHVuaW5zdGFsbCAoKSB7XG4gICAgdGhpcy51bm1vdW50KClcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRUb3RhbFNwZWVkIChmaWxlcykge1xuICBsZXQgdG90YWxTcGVlZCA9IDBcbiAgZmlsZXMuZm9yRWFjaCgoZmlsZSkgPT4ge1xuICAgIHRvdGFsU3BlZWQgKz0gZ2V0U3BlZWQoZmlsZS5wcm9ncmVzcylcbiAgfSlcbiAgcmV0dXJuIHRvdGFsU3BlZWRcbn1cblxuZnVuY3Rpb24gZ2V0VG90YWxFVEEgKGZpbGVzKSB7XG4gIGNvbnN0IHRvdGFsU3BlZWQgPSBnZXRUb3RhbFNwZWVkKGZpbGVzKVxuICBpZiAodG90YWxTcGVlZCA9PT0gMCkge1xuICAgIHJldHVybiAwXG4gIH1cblxuICBjb25zdCB0b3RhbEJ5dGVzUmVtYWluaW5nID0gZmlsZXMucmVkdWNlKCh0b3RhbCwgZmlsZSkgPT4ge1xuICAgIHJldHVybiB0b3RhbCArIGdldEJ5dGVzUmVtYWluaW5nKGZpbGUucHJvZ3Jlc3MpXG4gIH0sIDApXG5cbiAgcmV0dXJuIE1hdGgucm91bmQoKHRvdGFsQnl0ZXNSZW1haW5pbmcgLyB0b3RhbFNwZWVkKSAqIDEwKSAvIDEwXG59XG5cbmZ1bmN0aW9uIGdldFVwbG9hZGluZ1N0YXRlIChlcnJvciwgaXNBbGxDb21wbGV0ZSwgcmVjb3ZlcmVkU3RhdGUsIGZpbGVzKSB7XG4gIGlmIChlcnJvciAmJiAhaXNBbGxDb21wbGV0ZSkge1xuICAgIHJldHVybiBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfRVJST1JcbiAgfVxuXG4gIGlmIChpc0FsbENvbXBsZXRlKSB7XG4gICAgcmV0dXJuIHN0YXR1c0JhclN0YXRlcy5TVEFURV9DT01QTEVURVxuICB9XG5cbiAgaWYgKHJlY292ZXJlZFN0YXRlKSB7XG4gICAgcmV0dXJuIHN0YXR1c0JhclN0YXRlcy5TVEFURV9XQUlUSU5HXG4gIH1cblxuICBsZXQgc3RhdGUgPSBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfV0FJVElOR1xuICBjb25zdCBmaWxlSURzID0gT2JqZWN0LmtleXMoZmlsZXMpXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZmlsZUlEcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHsgcHJvZ3Jlc3MgfSA9IGZpbGVzW2ZpbGVJRHNbaV1dXG4gICAgLy8gSWYgQU5ZIGZpbGVzIGFyZSBiZWluZyB1cGxvYWRlZCByaWdodCBub3csIHNob3cgdGhlIHVwbG9hZGluZyBzdGF0ZS5cbiAgICBpZiAocHJvZ3Jlc3MudXBsb2FkU3RhcnRlZCAmJiAhcHJvZ3Jlc3MudXBsb2FkQ29tcGxldGUpIHtcbiAgICAgIHJldHVybiBzdGF0dXNCYXJTdGF0ZXMuU1RBVEVfVVBMT0FESU5HXG4gICAgfVxuICAgIC8vIElmIGZpbGVzIGFyZSBiZWluZyBwcmVwcm9jZXNzZWQgQU5EIHBvc3Rwcm9jZXNzZWQgYXQgdGhpcyB0aW1lLCB3ZSBzaG93IHRoZVxuICAgIC8vIHByZXByb2Nlc3Mgc3RhdGUuIElmIGFueSBmaWxlcyBhcmUgYmVpbmcgdXBsb2FkZWQgd2Ugc2hvdyB1cGxvYWRpbmcuXG4gICAgaWYgKHByb2dyZXNzLnByZXByb2Nlc3MgJiYgc3RhdGUgIT09IHN0YXR1c0JhclN0YXRlcy5TVEFURV9VUExPQURJTkcpIHtcbiAgICAgIHN0YXRlID0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX1BSRVBST0NFU1NJTkdcbiAgICB9XG4gICAgLy8gSWYgTk8gZmlsZXMgYXJlIGJlaW5nIHByZXByb2Nlc3NlZCBvciB1cGxvYWRlZCByaWdodCBub3csIGJ1dCBzb21lIGZpbGVzIGFyZVxuICAgIC8vIGJlaW5nIHBvc3Rwcm9jZXNzZWQsIHNob3cgdGhlIHBvc3Rwcm9jZXNzIHN0YXRlLlxuICAgIGlmIChcbiAgICAgIHByb2dyZXNzLnBvc3Rwcm9jZXNzXG4gICAgICAmJiBzdGF0ZSAhPT0gc3RhdHVzQmFyU3RhdGVzLlNUQVRFX1VQTE9BRElOR1xuICAgICAgJiYgc3RhdGUgIT09IHN0YXR1c0JhclN0YXRlcy5TVEFURV9QUkVQUk9DRVNTSU5HXG4gICAgKSB7XG4gICAgICBzdGF0ZSA9IHN0YXR1c0JhclN0YXRlcy5TVEFURV9QT1NUUFJPQ0VTU0lOR1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RhdGVcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBzdHJpbmdzOiB7XG4gICAgLy8gU2hvd24gaW4gdGhlIHN0YXR1cyBiYXIgd2hpbGUgZmlsZXMgYXJlIGJlaW5nIHVwbG9hZGVkLlxuICAgIHVwbG9hZGluZzogJ1VwbG9hZGluZycsXG4gICAgLy8gU2hvd24gaW4gdGhlIHN0YXR1cyBiYXIgb25jZSBhbGwgZmlsZXMgaGF2ZSBiZWVuIHVwbG9hZGVkLlxuICAgIGNvbXBsZXRlOiAnQ29tcGxldGUnLFxuICAgIC8vIFNob3duIGluIHRoZSBzdGF0dXMgYmFyIGlmIGFuIHVwbG9hZCBmYWlsZWQuXG4gICAgdXBsb2FkRmFpbGVkOiAnVXBsb2FkIGZhaWxlZCcsXG4gICAgLy8gU2hvd24gaW4gdGhlIHN0YXR1cyBiYXIgd2hpbGUgdGhlIHVwbG9hZCBpcyBwYXVzZWQuXG4gICAgcGF1c2VkOiAnUGF1c2VkJyxcbiAgICAvLyBVc2VkIGFzIHRoZSBsYWJlbCBmb3IgdGhlIGJ1dHRvbiB0aGF0IHJldHJpZXMgYW4gdXBsb2FkLlxuICAgIHJldHJ5OiAnUmV0cnknLFxuICAgIC8vIFVzZWQgYXMgdGhlIGxhYmVsIGZvciB0aGUgYnV0dG9uIHRoYXQgY2FuY2VscyBhbiB1cGxvYWQuXG4gICAgY2FuY2VsOiAnQ2FuY2VsJyxcbiAgICAvLyBVc2VkIGFzIHRoZSBsYWJlbCBmb3IgdGhlIGJ1dHRvbiB0aGF0IHBhdXNlcyBhbiB1cGxvYWQuXG4gICAgcGF1c2U6ICdQYXVzZScsXG4gICAgLy8gVXNlZCBhcyB0aGUgbGFiZWwgZm9yIHRoZSBidXR0b24gdGhhdCByZXN1bWVzIGFuIHVwbG9hZC5cbiAgICByZXN1bWU6ICdSZXN1bWUnLFxuICAgIC8vIFVzZWQgYXMgdGhlIGxhYmVsIGZvciB0aGUgYnV0dG9uIHRoYXQgcmVzZXRzIHRoZSB1cGxvYWQgc3RhdGUgYWZ0ZXIgYW4gdXBsb2FkXG4gICAgZG9uZTogJ0RvbmUnLFxuICAgIC8vIFdoZW4gYHNob3dQcm9ncmVzc0RldGFpbHNgIGlzIHNldCwgc2hvd3MgdGhlIG51bWJlciBvZiBmaWxlcyB0aGF0IGhhdmUgYmVlbiBmdWxseSB1cGxvYWRlZCBzbyBmYXIuXG4gICAgZmlsZXNVcGxvYWRlZE9mVG90YWw6IHtcbiAgICAgIDA6ICcle2NvbXBsZXRlfSBvZiAle3NtYXJ0X2NvdW50fSBmaWxlIHVwbG9hZGVkJyxcbiAgICAgIDE6ICcle2NvbXBsZXRlfSBvZiAle3NtYXJ0X2NvdW50fSBmaWxlcyB1cGxvYWRlZCcsXG4gICAgfSxcbiAgICAvLyBXaGVuIGBzaG93UHJvZ3Jlc3NEZXRhaWxzYCBpcyBzZXQsIHNob3dzIHRoZSBhbW91bnQgb2YgYnl0ZXMgdGhhdCBoYXZlIGJlZW4gdXBsb2FkZWQgc28gZmFyLlxuICAgIGRhdGFVcGxvYWRlZE9mVG90YWw6ICcle2NvbXBsZXRlfSBvZiAle3RvdGFsfScsXG4gICAgLy8gV2hlbiBgc2hvd1Byb2dyZXNzRGV0YWlsc2AgaXMgc2V0LCBzaG93cyBhbiBlc3RpbWF0aW9uIG9mIGhvdyBsb25nIHRoZSB1cGxvYWQgd2lsbCB0YWtlIHRvIGNvbXBsZXRlLlxuICAgIHhUaW1lTGVmdDogJyV7dGltZX0gbGVmdCcsXG4gICAgLy8gVXNlZCBhcyB0aGUgbGFiZWwgZm9yIHRoZSBidXR0b24gdGhhdCBzdGFydHMgYW4gdXBsb2FkLlxuICAgIHVwbG9hZFhGaWxlczoge1xuICAgICAgMDogJ1VwbG9hZCAle3NtYXJ0X2NvdW50fSBmaWxlJyxcbiAgICAgIDE6ICdVcGxvYWQgJXtzbWFydF9jb3VudH0gZmlsZXMnLFxuICAgIH0sXG4gICAgLy8gVXNlZCBhcyB0aGUgbGFiZWwgZm9yIHRoZSBidXR0b24gdGhhdCBzdGFydHMgYW4gdXBsb2FkLCBpZiBhbm90aGVyIHVwbG9hZCBoYXMgYmVlbiBzdGFydGVkIGluIHRoZSBwYXN0XG4gICAgLy8gYW5kIG5ldyBmaWxlcyB3ZXJlIGFkZGVkIGxhdGVyLlxuICAgIHVwbG9hZFhOZXdGaWxlczoge1xuICAgICAgMDogJ1VwbG9hZCArJXtzbWFydF9jb3VudH0gZmlsZScsXG4gICAgICAxOiAnVXBsb2FkICsle3NtYXJ0X2NvdW50fSBmaWxlcycsXG4gICAgfSxcbiAgICB1cGxvYWQ6ICdVcGxvYWQnLFxuICAgIHJldHJ5VXBsb2FkOiAnUmV0cnkgdXBsb2FkJyxcbiAgICB4TW9yZUZpbGVzQWRkZWQ6IHtcbiAgICAgIDA6ICcle3NtYXJ0X2NvdW50fSBtb3JlIGZpbGUgYWRkZWQnLFxuICAgICAgMTogJyV7c21hcnRfY291bnR9IG1vcmUgZmlsZXMgYWRkZWQnLFxuICAgIH0sXG4gICAgc2hvd0Vycm9yRGV0YWlsczogJ1Nob3cgZXJyb3IgZGV0YWlscycsXG4gIH0sXG59XG4iLCIvKipcbiAqIERlZmF1bHQgc3RvcmUgdGhhdCBrZWVwcyBzdGF0ZSBpbiBhIHNpbXBsZSBvYmplY3QuXG4gKi9cbmNsYXNzIERlZmF1bHRTdG9yZSB7XG4gIHN0YXRpYyBWRVJTSU9OID0gcmVxdWlyZSgnLi4vcGFja2FnZS5qc29uJykudmVyc2lvblxuXG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICB0aGlzLnN0YXRlID0ge31cbiAgICB0aGlzLmNhbGxiYWNrcyA9IFtdXG4gIH1cblxuICBnZXRTdGF0ZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGVcbiAgfVxuXG4gIHNldFN0YXRlIChwYXRjaCkge1xuICAgIGNvbnN0IHByZXZTdGF0ZSA9IHsgLi4udGhpcy5zdGF0ZSB9XG4gICAgY29uc3QgbmV4dFN0YXRlID0geyAuLi50aGlzLnN0YXRlLCAuLi5wYXRjaCB9XG5cbiAgICB0aGlzLnN0YXRlID0gbmV4dFN0YXRlXG4gICAgdGhpcy4jcHVibGlzaChwcmV2U3RhdGUsIG5leHRTdGF0ZSwgcGF0Y2gpXG4gIH1cblxuICBzdWJzY3JpYmUgKGxpc3RlbmVyKSB7XG4gICAgdGhpcy5jYWxsYmFja3MucHVzaChsaXN0ZW5lcilcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgLy8gUmVtb3ZlIHRoZSBsaXN0ZW5lci5cbiAgICAgIHRoaXMuY2FsbGJhY2tzLnNwbGljZShcbiAgICAgICAgdGhpcy5jYWxsYmFja3MuaW5kZXhPZihsaXN0ZW5lciksXG4gICAgICAgIDEsXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgI3B1Ymxpc2ggKC4uLmFyZ3MpIHtcbiAgICB0aGlzLmNhbGxiYWNrcy5mb3JFYWNoKChsaXN0ZW5lcikgPT4ge1xuICAgICAgbGlzdGVuZXIoLi4uYXJncylcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmYXVsdFN0b3JlICgpIHtcbiAgcmV0dXJuIG5ldyBEZWZhdWx0U3RvcmUoKVxufVxuIiwiY29uc3QgdHVzID0gcmVxdWlyZSgndHVzLWpzLWNsaWVudCcpXG5cbmZ1bmN0aW9uIGlzQ29yZG92YSAoKSB7XG4gIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiAoXG4gICAgdHlwZW9mIHdpbmRvdy5QaG9uZUdhcCAhPT0gJ3VuZGVmaW5lZCdcbiAgICB8fCB0eXBlb2Ygd2luZG93LkNvcmRvdmEgIT09ICd1bmRlZmluZWQnXG4gICAgfHwgdHlwZW9mIHdpbmRvdy5jb3Jkb3ZhICE9PSAndW5kZWZpbmVkJ1xuICApXG59XG5cbmZ1bmN0aW9uIGlzUmVhY3ROYXRpdmUgKCkge1xuICByZXR1cm4gdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB0eXBlb2YgbmF2aWdhdG9yLnByb2R1Y3QgPT09ICdzdHJpbmcnXG4gICAgJiYgbmF2aWdhdG9yLnByb2R1Y3QudG9Mb3dlckNhc2UoKSA9PT0gJ3JlYWN0bmF0aXZlJ1xufVxuXG4vLyBXZSBvdmVycmlkZSB0dXMgZmluZ2VycHJpbnQgdG8gdXBweeKAmXMgYGZpbGUuaWRgLCBzaW5jZSB0aGUgYGZpbGUuaWRgXG4vLyBub3cgYWxzbyBpbmNsdWRlcyBgcmVsYXRpdmVQYXRoYCBmb3IgZmlsZXMgYWRkZWQgZnJvbSBmb2xkZXJzLlxuLy8gVGhpcyBtZWFucyB5b3UgY2FuIGFkZCAyIGlkZW50aWNhbCBmaWxlcywgaWYgb25lIGlzIGluIGZvbGRlciBhLFxuLy8gdGhlIG90aGVyIGluIGZvbGRlciBiIOKAlCBgYS9maWxlLmpwZ2AgYW5kIGBiL2ZpbGUuanBnYCwgd2hlbiBhZGRlZFxuLy8gdG9nZXRoZXIgd2l0aCBhIGZvbGRlciwgd2lsbCBiZSB0cmVhdGVkIGFzIDIgc2VwYXJhdGUgZmlsZXMuXG4vL1xuLy8gRm9yIFJlYWN0IE5hdGl2ZSBhbmQgQ29yZG92YSwgd2UgbGV0IHR1cy1qcy1jbGllbnTigJlzIGRlZmF1bHRcbi8vIGZpbmdlcnByaW50IGhhbmRsaW5nIHRha2UgY2hhcmdlLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRGaW5nZXJwcmludCAodXBweUZpbGVPYmopIHtcbiAgcmV0dXJuIChmaWxlLCBvcHRpb25zKSA9PiB7XG4gICAgaWYgKGlzQ29yZG92YSgpIHx8IGlzUmVhY3ROYXRpdmUoKSkge1xuICAgICAgcmV0dXJuIHR1cy5kZWZhdWx0T3B0aW9ucy5maW5nZXJwcmludChmaWxlLCBvcHRpb25zKVxuICAgIH1cblxuICAgIGNvbnN0IHVwcHlGaW5nZXJwcmludCA9IFtcbiAgICAgICd0dXMnLFxuICAgICAgdXBweUZpbGVPYmouaWQsXG4gICAgICBvcHRpb25zLmVuZHBvaW50LFxuICAgIF0uam9pbignLScpXG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVwcHlGaW5nZXJwcmludClcbiAgfVxufVxuIiwiY29uc3QgQmFzZVBsdWdpbiA9IHJlcXVpcmUoJ0B1cHB5L2NvcmUvbGliL0Jhc2VQbHVnaW4nKVxuY29uc3QgdHVzID0gcmVxdWlyZSgndHVzLWpzLWNsaWVudCcpXG5jb25zdCB7IFByb3ZpZGVyLCBSZXF1ZXN0Q2xpZW50LCBTb2NrZXQgfSA9IHJlcXVpcmUoJ0B1cHB5L2NvbXBhbmlvbi1jbGllbnQnKVxuY29uc3QgZW1pdFNvY2tldFByb2dyZXNzID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2VtaXRTb2NrZXRQcm9ncmVzcycpXG5jb25zdCBnZXRTb2NrZXRIb3N0ID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL2dldFNvY2tldEhvc3QnKVxuY29uc3Qgc2V0dGxlID0gcmVxdWlyZSgnQHVwcHkvdXRpbHMvbGliL3NldHRsZScpXG5jb25zdCBFdmVudFRyYWNrZXIgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvRXZlbnRUcmFja2VyJylcbmNvbnN0IE5ldHdvcmtFcnJvciA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9OZXR3b3JrRXJyb3InKVxuY29uc3QgaXNOZXR3b3JrRXJyb3IgPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvaXNOZXR3b3JrRXJyb3InKVxuY29uc3QgeyBSYXRlTGltaXRlZFF1ZXVlIH0gPSByZXF1aXJlKCdAdXBweS91dGlscy9saWIvUmF0ZUxpbWl0ZWRRdWV1ZScpXG5jb25zdCBoYXNQcm9wZXJ0eSA9IHJlcXVpcmUoJ0B1cHB5L3V0aWxzL2xpYi9oYXNQcm9wZXJ0eScpXG5jb25zdCBnZXRGaW5nZXJwcmludCA9IHJlcXVpcmUoJy4vZ2V0RmluZ2VycHJpbnQnKVxuXG4vKiogQHR5cGVkZWYge2ltcG9ydCgnLi4nKS5UdXNPcHRpb25zfSBUdXNPcHRpb25zICovXG4vKiogQHR5cGVkZWYge2ltcG9ydCgndHVzLWpzLWNsaWVudCcpLlVwbG9hZE9wdGlvbnN9IFJhd1R1c09wdGlvbnMgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCdAdXBweS9jb3JlJykuVXBweX0gVXBweSAqL1xuLyoqIEB0eXBlZGVmIHtpbXBvcnQoJ0B1cHB5L2NvcmUnKS5VcHB5RmlsZX0gVXBweUZpbGUgKi9cbi8qKiBAdHlwZWRlZiB7aW1wb3J0KCdAdXBweS9jb3JlJykuRmFpbGVkVXBweUZpbGU8e30+fSBGYWlsZWRVcHB5RmlsZSAqL1xuXG4vKipcbiAqIEV4dHJhY3RlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS90dXMvdHVzLWpzLWNsaWVudC9ibG9iL21hc3Rlci9saWIvdXBsb2FkLmpzI0wxM1xuICogZXhjZXB0ZWQgd2UgcmVtb3ZlZCAnZmluZ2VycHJpbnQnIGtleSB0byBhdm9pZCBhZGRpbmcgbW9yZSBkZXBlbmRlbmNpZXNcbiAqXG4gKiBAdHlwZSB7UmF3VHVzT3B0aW9uc31cbiAqL1xuY29uc3QgdHVzRGVmYXVsdE9wdGlvbnMgPSB7XG4gIGVuZHBvaW50OiAnJyxcblxuICB1cGxvYWRVcmw6IG51bGwsXG4gIG1ldGFkYXRhOiB7fSxcbiAgdXBsb2FkU2l6ZTogbnVsbCxcblxuICBvblByb2dyZXNzOiBudWxsLFxuICBvbkNodW5rQ29tcGxldGU6IG51bGwsXG4gIG9uU3VjY2VzczogbnVsbCxcbiAgb25FcnJvcjogbnVsbCxcblxuICBvdmVycmlkZVBhdGNoTWV0aG9kOiBmYWxzZSxcbiAgaGVhZGVyczoge30sXG4gIGFkZFJlcXVlc3RJZDogZmFsc2UsXG5cbiAgY2h1bmtTaXplOiBJbmZpbml0eSxcbiAgcmV0cnlEZWxheXM6IFswLCAxMDAwLCAzMDAwLCA1MDAwXSxcbiAgcGFyYWxsZWxVcGxvYWRzOiAxLFxuICByZW1vdmVGaW5nZXJwcmludE9uU3VjY2VzczogZmFsc2UsXG4gIHVwbG9hZExlbmd0aERlZmVycmVkOiBmYWxzZSxcbiAgdXBsb2FkRGF0YUR1cmluZ0NyZWF0aW9uOiBmYWxzZSxcbn1cblxuLyoqXG4gKiBUdXMgcmVzdW1hYmxlIGZpbGUgdXBsb2FkZXJcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBUdXMgZXh0ZW5kcyBCYXNlUGx1Z2luIHtcbiAgc3RhdGljIFZFUlNJT04gPSByZXF1aXJlKCcuLi9wYWNrYWdlLmpzb24nKS52ZXJzaW9uXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VXBweX0gdXBweVxuICAgKiBAcGFyYW0ge1R1c09wdGlvbnN9IG9wdHNcbiAgICovXG4gIGNvbnN0cnVjdG9yICh1cHB5LCBvcHRzKSB7XG4gICAgc3VwZXIodXBweSwgb3B0cylcbiAgICB0aGlzLnR5cGUgPSAndXBsb2FkZXInXG4gICAgdGhpcy5pZCA9IHRoaXMub3B0cy5pZCB8fCAnVHVzJ1xuICAgIHRoaXMudGl0bGUgPSAnVHVzJ1xuXG4gICAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICAgIGNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICAgICAgdXNlRmFzdFJlbW90ZVJldHJ5OiB0cnVlLFxuICAgICAgbGltaXQ6IDUsXG4gICAgICByZXRyeURlbGF5czogWzAsIDEwMDAsIDMwMDAsIDUwMDBdLFxuICAgICAgd2l0aENyZWRlbnRpYWxzOiBmYWxzZSxcbiAgICB9XG5cbiAgICAvLyBtZXJnZSBkZWZhdWx0IG9wdGlvbnMgd2l0aCB0aGUgb25lcyBzZXQgYnkgdXNlclxuICAgIC8qKiBAdHlwZSB7aW1wb3J0KFwiLi5cIikuVHVzT3B0aW9uc30gKi9cbiAgICB0aGlzLm9wdHMgPSB7IC4uLmRlZmF1bHRPcHRpb25zLCAuLi5vcHRzIH1cblxuICAgIGlmICgnYXV0b1JldHJ5JyBpbiBvcHRzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBgYXV0b1JldHJ5YCBvcHRpb24gd2FzIGRlcHJlY2F0ZWQgYW5kIGhhcyBiZWVuIHJlbW92ZWQuJylcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTaW11bHRhbmVvdXMgdXBsb2FkIGxpbWl0aW5nIGlzIHNoYXJlZCBhY3Jvc3MgYWxsIHVwbG9hZHMgd2l0aCB0aGlzIHBsdWdpbi5cbiAgICAgKlxuICAgICAqIEB0eXBlIHtSYXRlTGltaXRlZFF1ZXVlfVxuICAgICAqL1xuICAgIHRoaXMucmVxdWVzdHMgPSBuZXcgUmF0ZUxpbWl0ZWRRdWV1ZSh0aGlzLm9wdHMubGltaXQpXG5cbiAgICB0aGlzLnVwbG9hZGVycyA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgIHRoaXMudXBsb2FkZXJTb2NrZXRzID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuXG4gICAgdGhpcy5oYW5kbGVSZXNldFByb2dyZXNzID0gdGhpcy5oYW5kbGVSZXNldFByb2dyZXNzLmJpbmQodGhpcylcbiAgICB0aGlzLmhhbmRsZVVwbG9hZCA9IHRoaXMuaGFuZGxlVXBsb2FkLmJpbmQodGhpcylcbiAgfVxuXG4gIGhhbmRsZVJlc2V0UHJvZ3Jlc3MgKCkge1xuICAgIGNvbnN0IGZpbGVzID0geyAuLi50aGlzLnVwcHkuZ2V0U3RhdGUoKS5maWxlcyB9XG4gICAgT2JqZWN0LmtleXMoZmlsZXMpLmZvckVhY2goKGZpbGVJRCkgPT4ge1xuICAgICAgLy8gT25seSBjbG9uZSB0aGUgZmlsZSBvYmplY3QgaWYgaXQgaGFzIGEgVHVzIGB1cGxvYWRVcmxgIGF0dGFjaGVkLlxuICAgICAgaWYgKGZpbGVzW2ZpbGVJRF0udHVzICYmIGZpbGVzW2ZpbGVJRF0udHVzLnVwbG9hZFVybCkge1xuICAgICAgICBjb25zdCB0dXNTdGF0ZSA9IHsgLi4uZmlsZXNbZmlsZUlEXS50dXMgfVxuICAgICAgICBkZWxldGUgdHVzU3RhdGUudXBsb2FkVXJsXG4gICAgICAgIGZpbGVzW2ZpbGVJRF0gPSB7IC4uLmZpbGVzW2ZpbGVJRF0sIHR1czogdHVzU3RhdGUgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnVwcHkuc2V0U3RhdGUoeyBmaWxlcyB9KVxuICB9XG5cbiAgLyoqXG4gICAqIENsZWFuIHVwIGFsbCByZWZlcmVuY2VzIGZvciBhIGZpbGUncyB1cGxvYWQ6IHRoZSB0dXMuVXBsb2FkIGluc3RhbmNlLFxuICAgKiBhbnkgZXZlbnRzIHJlbGF0ZWQgdG8gdGhlIGZpbGUsIGFuZCB0aGUgQ29tcGFuaW9uIFdlYlNvY2tldCBjb25uZWN0aW9uLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gZmlsZUlEXG4gICAqL1xuICByZXNldFVwbG9hZGVyUmVmZXJlbmNlcyAoZmlsZUlELCBvcHRzID0ge30pIHtcbiAgICBpZiAodGhpcy51cGxvYWRlcnNbZmlsZUlEXSkge1xuICAgICAgY29uc3QgdXBsb2FkZXIgPSB0aGlzLnVwbG9hZGVyc1tmaWxlSURdXG5cbiAgICAgIHVwbG9hZGVyLmFib3J0KClcblxuICAgICAgaWYgKG9wdHMuYWJvcnQpIHtcbiAgICAgICAgdXBsb2FkZXIuYWJvcnQodHJ1ZSlcbiAgICAgIH1cblxuICAgICAgdGhpcy51cGxvYWRlcnNbZmlsZUlEXSA9IG51bGxcbiAgICB9XG4gICAgaWYgKHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXSkge1xuICAgICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLnJlbW92ZSgpXG4gICAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0gPSBudWxsXG4gICAgfVxuICAgIGlmICh0aGlzLnVwbG9hZGVyU29ja2V0c1tmaWxlSURdKSB7XG4gICAgICB0aGlzLnVwbG9hZGVyU29ja2V0c1tmaWxlSURdLmNsb3NlKClcbiAgICAgIHRoaXMudXBsb2FkZXJTb2NrZXRzW2ZpbGVJRF0gPSBudWxsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBUdXMgdXBsb2FkLlxuICAgKlxuICAgKiBBIGxvdCBjYW4gaGFwcGVuIGR1cmluZyBhbiB1cGxvYWQsIHNvIHRoaXMgaXMgcXVpdGUgaGFyZCB0byBmb2xsb3chXG4gICAqIC0gRmlyc3QsIHRoZSB1cGxvYWQgaXMgc3RhcnRlZC4gSWYgdGhlIGZpbGUgd2FzIGFscmVhZHkgcGF1c2VkIGJ5IHRoZSB0aW1lIHRoZSB1cGxvYWQgc3RhcnRzLCBub3RoaW5nIHNob3VsZCBoYXBwZW4uXG4gICAqICAgSWYgdGhlIGBsaW1pdGAgb3B0aW9uIGlzIHVzZWQsIHRoZSB1cGxvYWQgbXVzdCBiZSBxdWV1ZWQgb250byB0aGUgYHRoaXMucmVxdWVzdHNgIHF1ZXVlLlxuICAgKiAgIFdoZW4gYW4gdXBsb2FkIHN0YXJ0cywgd2Ugc3RvcmUgdGhlIHR1cy5VcGxvYWQgaW5zdGFuY2UsIGFuZCBhbiBFdmVudFRyYWNrZXIgaW5zdGFuY2UgdGhhdCBtYW5hZ2VzIHRoZSBldmVudCBsaXN0ZW5lcnNcbiAgICogICBmb3IgcGF1c2luZywgY2FuY2VsbGF0aW9uLCByZW1vdmFsLCBldGMuXG4gICAqIC0gV2hpbGUgdGhlIHVwbG9hZCBpcyBpbiBwcm9ncmVzcywgaXQgbWF5IGJlIHBhdXNlZCBvciBjYW5jZWxsZWQuXG4gICAqICAgUGF1c2luZyBhYm9ydHMgdGhlIHVuZGVybHlpbmcgdHVzLlVwbG9hZCwgYW5kIHJlbW92ZXMgdGhlIHVwbG9hZCBmcm9tIHRoZSBgdGhpcy5yZXF1ZXN0c2AgcXVldWUuIEFsbCBvdGhlciBzdGF0ZSBpc1xuICAgKiAgIG1haW50YWluZWQuXG4gICAqICAgQ2FuY2VsbGluZyByZW1vdmVzIHRoZSB1cGxvYWQgZnJvbSB0aGUgYHRoaXMucmVxdWVzdHNgIHF1ZXVlLCBhbmQgY29tcGxldGVseSBhYm9ydHMgdGhlIHVwbG9hZC0tIHRoZSBgdHVzLlVwbG9hZGBcbiAgICogICBpbnN0YW5jZSBpcyBhYm9ydGVkIGFuZCBkaXNjYXJkZWQsIHRoZSBFdmVudFRyYWNrZXIgaW5zdGFuY2UgaXMgZGVzdHJveWVkIChyZW1vdmluZyBhbGwgbGlzdGVuZXJzKS5cbiAgICogICBSZXN1bWluZyB0aGUgdXBsb2FkIHVzZXMgdGhlIGB0aGlzLnJlcXVlc3RzYCBxdWV1ZSBhcyB3ZWxsLCB0byBwcmV2ZW50IHNlbGVjdGl2ZWx5IHBhdXNpbmcgYW5kIHJlc3VtaW5nIHVwbG9hZHMgZnJvbVxuICAgKiAgIGJ5cGFzc2luZyB0aGUgbGltaXQuXG4gICAqIC0gQWZ0ZXIgY29tcGxldGluZyBhbiB1cGxvYWQsIHRoZSB0dXMuVXBsb2FkIGFuZCBFdmVudFRyYWNrZXIgaW5zdGFuY2VzIGFyZSBjbGVhbmVkIHVwLCBhbmQgdGhlIHVwbG9hZCBpcyBtYXJrZWQgYXMgZG9uZVxuICAgKiAgIGluIHRoZSBgdGhpcy5yZXF1ZXN0c2AgcXVldWUuXG4gICAqIC0gV2hlbiBhbiB1cGxvYWQgY29tcGxldGVkIHdpdGggYW4gZXJyb3IsIHRoZSBzYW1lIGhhcHBlbnMgYXMgb24gc3VjY2Vzc2Z1bCBjb21wbGV0aW9uLCBidXQgdGhlIGB1cGxvYWQoKWAgcHJvbWlzZSBpc1xuICAgKiAgIHJlamVjdGVkLlxuICAgKlxuICAgKiBXaGVuIHdvcmtpbmcgb24gdGhpcyBmdW5jdGlvbiwga2VlcCBpbiBtaW5kOlxuICAgKiAgLSBXaGVuIGFuIHVwbG9hZCBpcyBjb21wbGV0ZWQgb3IgY2FuY2VsbGVkIGZvciBhbnkgcmVhc29uLCB0aGUgdHVzLlVwbG9hZCBhbmQgRXZlbnRUcmFja2VyIGluc3RhbmNlcyBuZWVkIHRvIGJlIGNsZWFuZWRcbiAgICogICAgdXAgdXNpbmcgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcygpLlxuICAgKiAgLSBXaGVuIGFuIHVwbG9hZCBpcyBjYW5jZWxsZWQgb3IgcGF1c2VkLCBmb3IgYW55IHJlYXNvbiwgaXQgbmVlZHMgdG8gYmUgcmVtb3ZlZCBmcm9tIHRoZSBgdGhpcy5yZXF1ZXN0c2AgcXVldWUgdXNpbmdcbiAgICogICAgYHF1ZXVlZFJlcXVlc3QuYWJvcnQoKWAuXG4gICAqICAtIFdoZW4gYW4gdXBsb2FkIGlzIGNvbXBsZXRlZCBmb3IgYW55IHJlYXNvbiwgaW5jbHVkaW5nIGVycm9ycywgaXQgbmVlZHMgdG8gYmUgbWFya2VkIGFzIHN1Y2ggdXNpbmdcbiAgICogICAgYHF1ZXVlZFJlcXVlc3QuZG9uZSgpYC5cbiAgICogIC0gV2hlbiBhbiB1cGxvYWQgaXMgc3RhcnRlZCBvciByZXN1bWVkLCBpdCBuZWVkcyB0byBnbyB0aHJvdWdoIHRoZSBgdGhpcy5yZXF1ZXN0c2AgcXVldWUuIFRoZSBgcXVldWVkUmVxdWVzdGAgdmFyaWFibGVcbiAgICogICAgbXVzdCBiZSB1cGRhdGVkIHNvIHRoZSBvdGhlciB1c2VzIG9mIGl0IGFyZSB2YWxpZC5cbiAgICogIC0gQmVmb3JlIHJlcGxhY2luZyB0aGUgYHF1ZXVlZFJlcXVlc3RgIHZhcmlhYmxlLCB0aGUgcHJldmlvdXMgYHF1ZXVlZFJlcXVlc3RgIG11c3QgYmUgYWJvcnRlZCwgZWxzZSBpdCB3aWxsIGtlZXAgdGFraW5nXG4gICAqICAgIHVwIGEgc3BvdCBpbiB0aGUgcXVldWUuXG4gICAqXG4gICAqIEBwYXJhbSB7VXBweUZpbGV9IGZpbGUgZm9yIHVzZSB3aXRoIHVwbG9hZFxuICAgKiBAcGFyYW0ge251bWJlcn0gY3VycmVudCBmaWxlIGluIGEgcXVldWVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsIG51bWJlciBvZiBmaWxlcyBpbiBhIHF1ZXVlXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgdXBsb2FkIChmaWxlKSB7XG4gICAgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkKVxuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IHR1cyB1cGxvYWRcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdGFydGVkJywgZmlsZSlcblxuICAgICAgY29uc3Qgb3B0cyA9IHtcbiAgICAgICAgLi4udGhpcy5vcHRzLFxuICAgICAgICAuLi4oZmlsZS50dXMgfHwge30pLFxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG9wdHMuaGVhZGVycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBvcHRzLmhlYWRlcnMgPSBvcHRzLmhlYWRlcnMoZmlsZSlcbiAgICAgIH1cblxuICAgICAgLyoqIEB0eXBlIHtSYXdUdXNPcHRpb25zfSAqL1xuICAgICAgY29uc3QgdXBsb2FkT3B0aW9ucyA9IHtcbiAgICAgICAgLi4udHVzRGVmYXVsdE9wdGlvbnMsXG4gICAgICAgIC4uLm9wdHMsXG4gICAgICB9XG5cbiAgICAgIC8vIFdlIG92ZXJyaWRlIHR1cyBmaW5nZXJwcmludCB0byB1cHB54oCZcyBgZmlsZS5pZGAsIHNpbmNlIHRoZSBgZmlsZS5pZGBcbiAgICAgIC8vIG5vdyBhbHNvIGluY2x1ZGVzIGByZWxhdGl2ZVBhdGhgIGZvciBmaWxlcyBhZGRlZCBmcm9tIGZvbGRlcnMuXG4gICAgICAvLyBUaGlzIG1lYW5zIHlvdSBjYW4gYWRkIDIgaWRlbnRpY2FsIGZpbGVzLCBpZiBvbmUgaXMgaW4gZm9sZGVyIGEsXG4gICAgICAvLyB0aGUgb3RoZXIgaW4gZm9sZGVyIGIuXG4gICAgICB1cGxvYWRPcHRpb25zLmZpbmdlcnByaW50ID0gZ2V0RmluZ2VycHJpbnQoZmlsZSlcblxuICAgICAgdXBsb2FkT3B0aW9ucy5vbkJlZm9yZVJlcXVlc3QgPSAocmVxKSA9PiB7XG4gICAgICAgIGNvbnN0IHhociA9IHJlcS5nZXRVbmRlcmx5aW5nT2JqZWN0KClcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9ICEhb3B0cy53aXRoQ3JlZGVudGlhbHNcblxuICAgICAgICBpZiAodHlwZW9mIG9wdHMub25CZWZvcmVSZXF1ZXN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgb3B0cy5vbkJlZm9yZVJlcXVlc3QocmVxKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHVwbG9hZE9wdGlvbnMub25FcnJvciA9IChlcnIpID0+IHtcbiAgICAgICAgdGhpcy51cHB5LmxvZyhlcnIpXG5cbiAgICAgICAgY29uc3QgeGhyID0gZXJyLm9yaWdpbmFsUmVxdWVzdCA/IGVyci5vcmlnaW5hbFJlcXVlc3QuZ2V0VW5kZXJseWluZ09iamVjdCgpIDogbnVsbFxuICAgICAgICBpZiAoaXNOZXR3b3JrRXJyb3IoeGhyKSkge1xuICAgICAgICAgIGVyciA9IG5ldyBOZXR3b3JrRXJyb3IoZXJyLCB4aHIpXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKGZpbGUuaWQpXG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG5cbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1lcnJvcicsIGZpbGUsIGVycilcblxuICAgICAgICByZWplY3QoZXJyKVxuICAgICAgfVxuXG4gICAgICB1cGxvYWRPcHRpb25zLm9uUHJvZ3Jlc3MgPSAoYnl0ZXNVcGxvYWRlZCwgYnl0ZXNUb3RhbCkgPT4ge1xuICAgICAgICB0aGlzLm9uUmVjZWl2ZVVwbG9hZFVybChmaWxlLCB1cGxvYWQudXJsKVxuICAgICAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXByb2dyZXNzJywgZmlsZSwge1xuICAgICAgICAgIHVwbG9hZGVyOiB0aGlzLFxuICAgICAgICAgIGJ5dGVzVXBsb2FkZWQsXG4gICAgICAgICAgYnl0ZXNUb3RhbCxcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgdXBsb2FkT3B0aW9ucy5vblN1Y2Nlc3MgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHVwbG9hZFJlc3AgPSB7XG4gICAgICAgICAgdXBsb2FkVVJMOiB1cGxvYWQudXJsLFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkKVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuXG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3VjY2VzcycsIGZpbGUsIHVwbG9hZFJlc3ApXG5cbiAgICAgICAgaWYgKHVwbG9hZC51cmwpIHtcbiAgICAgICAgICB0aGlzLnVwcHkubG9nKGBEb3dubG9hZCAke3VwbG9hZC5maWxlLm5hbWV9IGZyb20gJHt1cGxvYWQudXJsfWApXG4gICAgICAgIH1cblxuICAgICAgICByZXNvbHZlKHVwbG9hZClcbiAgICAgIH1cblxuICAgICAgY29uc3QgY29weVByb3AgPSAob2JqLCBzcmNQcm9wLCBkZXN0UHJvcCkgPT4ge1xuICAgICAgICBpZiAoaGFzUHJvcGVydHkob2JqLCBzcmNQcm9wKSAmJiAhaGFzUHJvcGVydHkob2JqLCBkZXN0UHJvcCkpIHtcbiAgICAgICAgICBvYmpbZGVzdFByb3BdID0gb2JqW3NyY1Byb3BdXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLyoqIEB0eXBlIHtSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+fSAqL1xuICAgICAgY29uc3QgbWV0YSA9IHt9XG4gICAgICBjb25zdCBtZXRhRmllbGRzID0gQXJyYXkuaXNBcnJheShvcHRzLm1ldGFGaWVsZHMpXG4gICAgICAgID8gb3B0cy5tZXRhRmllbGRzXG4gICAgICAgIC8vIFNlbmQgYWxvbmcgYWxsIGZpZWxkcyBieSBkZWZhdWx0LlxuICAgICAgICA6IE9iamVjdC5rZXlzKGZpbGUubWV0YSlcbiAgICAgIG1ldGFGaWVsZHMuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgICBtZXRhW2l0ZW1dID0gZmlsZS5tZXRhW2l0ZW1dXG4gICAgICB9KVxuXG4gICAgICAvLyB0dXNkIHVzZXMgbWV0YWRhdGEgZmllbGRzICdmaWxldHlwZScgYW5kICdmaWxlbmFtZSdcbiAgICAgIGNvcHlQcm9wKG1ldGEsICd0eXBlJywgJ2ZpbGV0eXBlJylcbiAgICAgIGNvcHlQcm9wKG1ldGEsICduYW1lJywgJ2ZpbGVuYW1lJylcblxuICAgICAgdXBsb2FkT3B0aW9ucy5tZXRhZGF0YSA9IG1ldGFcblxuICAgICAgY29uc3QgdXBsb2FkID0gbmV3IHR1cy5VcGxvYWQoZmlsZS5kYXRhLCB1cGxvYWRPcHRpb25zKVxuICAgICAgdGhpcy51cGxvYWRlcnNbZmlsZS5pZF0gPSB1cGxvYWRcbiAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0gPSBuZXcgRXZlbnRUcmFja2VyKHRoaXMudXBweSlcblxuICAgICAgdXBsb2FkLmZpbmRQcmV2aW91c1VwbG9hZHMoKS50aGVuKChwcmV2aW91c1VwbG9hZHMpID0+IHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNVcGxvYWQgPSBwcmV2aW91c1VwbG9hZHNbMF1cbiAgICAgICAgaWYgKHByZXZpb3VzVXBsb2FkKSB7XG4gICAgICAgICAgdGhpcy51cHB5LmxvZyhgW1R1c10gUmVzdW1pbmcgdXBsb2FkIG9mICR7ZmlsZS5pZH0gc3RhcnRlZCBhdCAke3ByZXZpb3VzVXBsb2FkLmNyZWF0aW9uVGltZX1gKVxuICAgICAgICAgIHVwbG9hZC5yZXN1bWVGcm9tUHJldmlvdXNVcGxvYWQocHJldmlvdXNVcGxvYWQpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIGxldCBxdWV1ZWRSZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0cy5ydW4oKCkgPT4ge1xuICAgICAgICBpZiAoIWZpbGUuaXNQYXVzZWQpIHtcbiAgICAgICAgICB1cGxvYWQuc3RhcnQoKVxuICAgICAgICB9XG4gICAgICAgIC8vIERvbid0IGRvIGFueXRoaW5nIGhlcmUsIHRoZSBjYWxsZXIgd2lsbCB0YWtlIGNhcmUgb2YgY2FuY2VsbGluZyB0aGUgdXBsb2FkIGl0c2VsZlxuICAgICAgICAvLyB1c2luZyByZXNldFVwbG9hZGVyUmVmZXJlbmNlcygpLiBUaGlzIGlzIGJlY2F1c2UgcmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoKSBoYXMgdG8gYmVcbiAgICAgICAgLy8gY2FsbGVkIHdoZW4gdGhpcyByZXF1ZXN0IGlzIHN0aWxsIGluIHRoZSBxdWV1ZSwgYW5kIGhhcyBub3QgYmVlbiBzdGFydGVkIHlldCwgdG9vLiBBdFxuICAgICAgICAvLyB0aGF0IHBvaW50IHRoaXMgY2FuY2VsbGF0aW9uIGZ1bmN0aW9uIGlzIG5vdCBnb2luZyB0byBiZSBjYWxsZWQuXG4gICAgICAgIC8vIEFsc28sIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSByZXF1ZXN0IGZyb20gdGhlIHF1ZXVlIF93aXRob3V0XyBkZXN0cm95aW5nIGV2ZXJ5dGhpbmdcbiAgICAgICAgLy8gcmVsYXRlZCB0byB0aGlzIHVwbG9hZCB0byBoYW5kbGUgcGF1c2VzLlxuICAgICAgICByZXR1cm4gKCkgPT4ge31cbiAgICAgIH0pXG5cbiAgICAgIHRoaXMub25GaWxlUmVtb3ZlKGZpbGUuaWQsICh0YXJnZXRGaWxlSUQpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZCwgeyBhYm9ydDogISF1cGxvYWQudXJsIH0pXG4gICAgICAgIHJlc29sdmUoYHVwbG9hZCAke3RhcmdldEZpbGVJRH0gd2FzIHJlbW92ZWRgKVxuICAgICAgfSlcblxuICAgICAgdGhpcy5vblBhdXNlKGZpbGUuaWQsIChpc1BhdXNlZCkgPT4ge1xuICAgICAgICBpZiAoaXNQYXVzZWQpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgdGhpcyBmaWxlIGZyb20gdGhlIHF1ZXVlIHNvIGFub3RoZXIgZmlsZSBjYW4gc3RhcnQgaW4gaXRzIHBsYWNlLlxuICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgICAgIHVwbG9hZC5hYm9ydCgpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gUmVzdW1pbmcgYW4gdXBsb2FkIHNob3VsZCBiZSBxdWV1ZWQsIGVsc2UgeW91IGNvdWxkIHBhdXNlIGFuZCB0aGVuXG4gICAgICAgICAgLy8gcmVzdW1lIGEgcXVldWVkIHVwbG9hZCB0byBtYWtlIGl0IHNraXAgdGhlIHF1ZXVlLlxuICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgICAgIHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICB1cGxvYWQuc3RhcnQoKVxuICAgICAgICAgICAgcmV0dXJuICgpID0+IHt9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgdGhpcy5vblBhdXNlQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIHVwbG9hZC5hYm9ydCgpXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uQ2FuY2VsQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIHRoaXMucmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoZmlsZS5pZCwgeyBhYm9ydDogISF1cGxvYWQudXJsIH0pXG4gICAgICAgIHJlc29sdmUoYHVwbG9hZCAke2ZpbGUuaWR9IHdhcyBjYW5jZWxlZGApXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uUmVzdW1lQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIGlmIChmaWxlLmVycm9yKSB7XG4gICAgICAgICAgdXBsb2FkLmFib3J0KClcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0ID0gdGhpcy5yZXF1ZXN0cy5ydW4oKCkgPT4ge1xuICAgICAgICAgIHVwbG9hZC5zdGFydCgpXG4gICAgICAgICAgcmV0dXJuICgpID0+IHt9XG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnIpXG4gICAgICB0aHJvdyBlcnJcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7VXBweUZpbGV9IGZpbGUgZm9yIHVzZSB3aXRoIHVwbG9hZFxuICAgKiBAcGFyYW0ge251bWJlcn0gY3VycmVudCBmaWxlIGluIGEgcXVldWVcbiAgICogQHBhcmFtIHtudW1iZXJ9IHRvdGFsIG51bWJlciBvZiBmaWxlcyBpbiBhIHF1ZXVlXG4gICAqIEByZXR1cm5zIHtQcm9taXNlPHZvaWQ+fVxuICAgKi9cbiAgdXBsb2FkUmVtb3RlIChmaWxlKSB7XG4gICAgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkKVxuXG4gICAgY29uc3Qgb3B0cyA9IHsgLi4udGhpcy5vcHRzIH1cbiAgICBpZiAoZmlsZS50dXMpIHtcbiAgICAgIC8vIEluc3RhbGwgZmlsZS1zcGVjaWZpYyB1cGxvYWQgb3ZlcnJpZGVzLlxuICAgICAgT2JqZWN0LmFzc2lnbihvcHRzLCBmaWxlLnR1cylcbiAgICB9XG5cbiAgICB0aGlzLnVwcHkuZW1pdCgndXBsb2FkLXN0YXJ0ZWQnLCBmaWxlKVxuICAgIHRoaXMudXBweS5sb2coZmlsZS5yZW1vdGUudXJsKVxuXG4gICAgaWYgKGZpbGUuc2VydmVyVG9rZW4pIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbm5lY3RUb1NlcnZlclNvY2tldChmaWxlKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBDbGllbnQgPSBmaWxlLnJlbW90ZS5wcm92aWRlck9wdGlvbnMucHJvdmlkZXIgPyBQcm92aWRlciA6IFJlcXVlc3RDbGllbnRcbiAgICAgIGNvbnN0IGNsaWVudCA9IG5ldyBDbGllbnQodGhpcy51cHB5LCBmaWxlLnJlbW90ZS5wcm92aWRlck9wdGlvbnMpXG5cbiAgICAgIC8vICEhIGNhbmNlbGxhdGlvbiBpcyBOT1Qgc3VwcG9ydGVkIGF0IHRoaXMgc3RhZ2UgeWV0XG4gICAgICBjbGllbnQucG9zdChmaWxlLnJlbW90ZS51cmwsIHtcbiAgICAgICAgLi4uZmlsZS5yZW1vdGUuYm9keSxcbiAgICAgICAgZW5kcG9pbnQ6IG9wdHMuZW5kcG9pbnQsXG4gICAgICAgIHVwbG9hZFVybDogb3B0cy51cGxvYWRVcmwsXG4gICAgICAgIHByb3RvY29sOiAndHVzJyxcbiAgICAgICAgc2l6ZTogZmlsZS5kYXRhLnNpemUsXG4gICAgICAgIGhlYWRlcnM6IG9wdHMuaGVhZGVycyxcbiAgICAgICAgbWV0YWRhdGE6IGZpbGUubWV0YSxcbiAgICAgIH0pLnRoZW4oKHJlcykgPT4ge1xuICAgICAgICB0aGlzLnVwcHkuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHsgc2VydmVyVG9rZW46IHJlcy50b2tlbiB9KVxuICAgICAgICBmaWxlID0gdGhpcy51cHB5LmdldEZpbGUoZmlsZS5pZClcbiAgICAgICAgcmV0dXJuIHRoaXMuY29ubmVjdFRvU2VydmVyU29ja2V0KGZpbGUpXG4gICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnIpXG4gICAgICAgIHJlamVjdChlcnIpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2VlIHRoZSBjb21tZW50IG9uIHRoZSB1cGxvYWQoKSBtZXRob2QuXG4gICAqXG4gICAqIEFkZGl0aW9uYWxseSwgd2hlbiBhbiB1cGxvYWQgaXMgcmVtb3ZlZCwgY29tcGxldGVkLCBvciBjYW5jZWxsZWQsIHdlIG5lZWQgdG8gY2xvc2UgdGhlIFdlYlNvY2tldCBjb25uZWN0aW9uLiBUaGlzIGlzXG4gICAqIGhhbmRsZWQgYnkgdGhlIHJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKCkgZnVuY3Rpb24sIHNvIHRoZSBzYW1lIGd1aWRlbGluZXMgYXBwbHkgYXMgaW4gdXBsb2FkKCkuXG4gICAqXG4gICAqIEBwYXJhbSB7VXBweUZpbGV9IGZpbGVcbiAgICovXG4gIGNvbm5lY3RUb1NlcnZlclNvY2tldCAoZmlsZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0b2tlbiA9IGZpbGUuc2VydmVyVG9rZW5cbiAgICAgIGNvbnN0IGhvc3QgPSBnZXRTb2NrZXRIb3N0KGZpbGUucmVtb3RlLmNvbXBhbmlvblVybClcbiAgICAgIGNvbnN0IHNvY2tldCA9IG5ldyBTb2NrZXQoeyB0YXJnZXQ6IGAke2hvc3R9L2FwaS8ke3Rva2VufWAsIGF1dG9PcGVuOiBmYWxzZSB9KVxuICAgICAgdGhpcy51cGxvYWRlclNvY2tldHNbZmlsZS5pZF0gPSBzb2NrZXRcbiAgICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZS5pZF0gPSBuZXcgRXZlbnRUcmFja2VyKHRoaXMudXBweSlcblxuICAgICAgdGhpcy5vbkZpbGVSZW1vdmUoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgc29ja2V0LnNlbmQoJ2NhbmNlbCcsIHt9KVxuICAgICAgICB0aGlzLnJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKGZpbGUuaWQpXG4gICAgICAgIHJlc29sdmUoYHVwbG9hZCAke2ZpbGUuaWR9IHdhcyByZW1vdmVkYClcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMub25QYXVzZShmaWxlLmlkLCAoaXNQYXVzZWQpID0+IHtcbiAgICAgICAgaWYgKGlzUGF1c2VkKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIHRoaXMgZmlsZSBmcm9tIHRoZSBxdWV1ZSBzbyBhbm90aGVyIGZpbGUgY2FuIHN0YXJ0IGluIGl0cyBwbGFjZS5cbiAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBSZXN1bWluZyBhbiB1cGxvYWQgc2hvdWxkIGJlIHF1ZXVlZCwgZWxzZSB5b3UgY291bGQgcGF1c2UgYW5kIHRoZW5cbiAgICAgICAgICAvLyByZXN1bWUgYSBxdWV1ZWQgdXBsb2FkIHRvIG1ha2UgaXQgc2tpcCB0aGUgcXVldWUuXG4gICAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgICAgcXVldWVkUmVxdWVzdCA9IHRoaXMucmVxdWVzdHMucnVuKCgpID0+IHtcbiAgICAgICAgICAgIHNvY2tldC5zZW5kKCdyZXN1bWUnLCB7fSlcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7fVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHRoaXMub25QYXVzZUFsbChmaWxlLmlkLCAoKSA9PiB7XG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMub25DYW5jZWxBbGwoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmFib3J0KClcbiAgICAgICAgc29ja2V0LnNlbmQoJ2NhbmNlbCcsIHt9KVxuICAgICAgICB0aGlzLnJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKGZpbGUuaWQpXG4gICAgICAgIHJlc29sdmUoYHVwbG9hZCAke2ZpbGUuaWR9IHdhcyBjYW5jZWxlZGApXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uUmVzdW1lQWxsKGZpbGUuaWQsICgpID0+IHtcbiAgICAgICAgcXVldWVkUmVxdWVzdC5hYm9ydCgpXG4gICAgICAgIGlmIChmaWxlLmVycm9yKSB7XG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3BhdXNlJywge30pXG4gICAgICAgIH1cbiAgICAgICAgcXVldWVkUmVxdWVzdCA9IHRoaXMucmVxdWVzdHMucnVuKCgpID0+IHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncmVzdW1lJywge30pXG4gICAgICAgICAgcmV0dXJuICgpID0+IHt9XG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uUmV0cnkoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICAvLyBPbmx5IGRvIHRoZSByZXRyeSBpZiB0aGUgdXBsb2FkIGlzIGFjdHVhbGx5IGluIHByb2dyZXNzO1xuICAgICAgICAvLyBlbHNlIHdlIGNvdWxkIHRyeSB0byBzZW5kIHRoZXNlIG1lc3NhZ2VzIHdoZW4gdGhlIHVwbG9hZCBpcyBzdGlsbCBxdWV1ZWQuXG4gICAgICAgIC8vIFdlIG1heSBuZWVkIGEgYmV0dGVyIGNoZWNrIGZvciB0aGlzIHNpbmNlIHRoZSBzb2NrZXQgbWF5IGFsc28gYmUgY2xvc2VkXG4gICAgICAgIC8vIGZvciBvdGhlciByZWFzb25zLCBsaWtlIG5ldHdvcmsgZmFpbHVyZXMuXG4gICAgICAgIGlmIChzb2NrZXQuaXNPcGVuKSB7XG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3BhdXNlJywge30pXG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3Jlc3VtZScsIHt9KVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICB0aGlzLm9uUmV0cnlBbGwoZmlsZS5pZCwgKCkgPT4ge1xuICAgICAgICAvLyBTZWUgdGhlIGNvbW1lbnQgaW4gdGhlIG9uUmV0cnkoKSBjYWxsXG4gICAgICAgIGlmIChzb2NrZXQuaXNPcGVuKSB7XG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3BhdXNlJywge30pXG4gICAgICAgICAgc29ja2V0LnNlbmQoJ3Jlc3VtZScsIHt9KVxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBzb2NrZXQub24oJ3Byb2dyZXNzJywgKHByb2dyZXNzRGF0YSkgPT4gZW1pdFNvY2tldFByb2dyZXNzKHRoaXMsIHByb2dyZXNzRGF0YSwgZmlsZSkpXG5cbiAgICAgIHNvY2tldC5vbignZXJyb3InLCAoZXJyRGF0YSkgPT4ge1xuICAgICAgICBjb25zdCB7IG1lc3NhZ2UgfSA9IGVyckRhdGEuZXJyb3JcbiAgICAgICAgY29uc3QgZXJyb3IgPSBPYmplY3QuYXNzaWduKG5ldyBFcnJvcihtZXNzYWdlKSwgeyBjYXVzZTogZXJyRGF0YS5lcnJvciB9KVxuXG4gICAgICAgIC8vIElmIHRoZSByZW1vdGUgcmV0cnkgb3B0aW1pc2F0aW9uIHNob3VsZCBub3QgYmUgdXNlZCxcbiAgICAgICAgLy8gY2xvc2UgdGhlIHNvY2tldOKAlHRoaXMgd2lsbCB0ZWxsIGNvbXBhbmlvbiB0byBjbGVhciBzdGF0ZSBhbmQgZGVsZXRlIHRoZSBmaWxlLlxuICAgICAgICBpZiAoIXRoaXMub3B0cy51c2VGYXN0UmVtb3RlUmV0cnkpIHtcbiAgICAgICAgICB0aGlzLnJlc2V0VXBsb2FkZXJSZWZlcmVuY2VzKGZpbGUuaWQpXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSBzZXJ2ZXJUb2tlbiBzbyB0aGF0IGEgbmV3IG9uZSB3aWxsIGJlIGNyZWF0ZWQgZm9yIHRoZSByZXRyeS5cbiAgICAgICAgICB0aGlzLnVwcHkuc2V0RmlsZVN0YXRlKGZpbGUuaWQsIHtcbiAgICAgICAgICAgIHNlcnZlclRva2VuOiBudWxsLFxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc29ja2V0LmNsb3NlKClcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtZXJyb3InLCBmaWxlLCBlcnJvcilcbiAgICAgICAgcXVldWVkUmVxdWVzdC5kb25lKClcbiAgICAgICAgcmVqZWN0KGVycm9yKVxuICAgICAgfSlcblxuICAgICAgc29ja2V0Lm9uKCdzdWNjZXNzJywgKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgdXBsb2FkUmVzcCA9IHtcbiAgICAgICAgICB1cGxvYWRVUkw6IGRhdGEudXJsLFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdWNjZXNzJywgZmlsZSwgdXBsb2FkUmVzcClcbiAgICAgICAgdGhpcy5yZXNldFVwbG9hZGVyUmVmZXJlbmNlcyhmaWxlLmlkKVxuICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSlcblxuICAgICAgbGV0IHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJlcXVlc3RzLnJ1bigoKSA9PiB7XG4gICAgICAgIHNvY2tldC5vcGVuKClcbiAgICAgICAgaWYgKGZpbGUuaXNQYXVzZWQpIHtcbiAgICAgICAgICBzb2NrZXQuc2VuZCgncGF1c2UnLCB7fSlcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIERvbid0IGRvIGFueXRoaW5nIGhlcmUsIHRoZSBjYWxsZXIgd2lsbCB0YWtlIGNhcmUgb2YgY2FuY2VsbGluZyB0aGUgdXBsb2FkIGl0c2VsZlxuICAgICAgICAvLyB1c2luZyByZXNldFVwbG9hZGVyUmVmZXJlbmNlcygpLiBUaGlzIGlzIGJlY2F1c2UgcmVzZXRVcGxvYWRlclJlZmVyZW5jZXMoKSBoYXMgdG8gYmVcbiAgICAgICAgLy8gY2FsbGVkIHdoZW4gdGhpcyByZXF1ZXN0IGlzIHN0aWxsIGluIHRoZSBxdWV1ZSwgYW5kIGhhcyBub3QgYmVlbiBzdGFydGVkIHlldCwgdG9vLiBBdFxuICAgICAgICAvLyB0aGF0IHBvaW50IHRoaXMgY2FuY2VsbGF0aW9uIGZ1bmN0aW9uIGlzIG5vdCBnb2luZyB0byBiZSBjYWxsZWQuXG4gICAgICAgIC8vIEFsc28sIHdlIG5lZWQgdG8gcmVtb3ZlIHRoZSByZXF1ZXN0IGZyb20gdGhlIHF1ZXVlIF93aXRob3V0XyBkZXN0cm95aW5nIGV2ZXJ5dGhpbmdcbiAgICAgICAgLy8gcmVsYXRlZCB0byB0aGlzIHVwbG9hZCB0byBoYW5kbGUgcGF1c2VzLlxuICAgICAgICByZXR1cm4gKCkgPT4ge31cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTdG9yZSB0aGUgdXBsb2FkVXJsIG9uIHRoZSBmaWxlIG9wdGlvbnMsIHNvIHRoYXQgd2hlbiBHb2xkZW4gUmV0cmlldmVyXG4gICAqIHJlc3RvcmVzIHN0YXRlLCB3ZSB3aWxsIGNvbnRpbnVlIHVwbG9hZGluZyB0byB0aGUgY29ycmVjdCBVUkwuXG4gICAqXG4gICAqIEBwYXJhbSB7VXBweUZpbGV9IGZpbGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHVwbG9hZFVSTFxuICAgKi9cbiAgb25SZWNlaXZlVXBsb2FkVXJsIChmaWxlLCB1cGxvYWRVUkwpIHtcbiAgICBjb25zdCBjdXJyZW50RmlsZSA9IHRoaXMudXBweS5nZXRGaWxlKGZpbGUuaWQpXG4gICAgaWYgKCFjdXJyZW50RmlsZSkgcmV0dXJuXG4gICAgLy8gT25seSBkbyB0aGUgdXBkYXRlIGlmIHdlIGRpZG4ndCBoYXZlIGFuIHVwbG9hZCBVUkwgeWV0LlxuICAgIGlmICghY3VycmVudEZpbGUudHVzIHx8IGN1cnJlbnRGaWxlLnR1cy51cGxvYWRVcmwgIT09IHVwbG9hZFVSTCkge1xuICAgICAgdGhpcy51cHB5LmxvZygnW1R1c10gU3RvcmluZyB1cGxvYWQgdXJsJylcbiAgICAgIHRoaXMudXBweS5zZXRGaWxlU3RhdGUoY3VycmVudEZpbGUuaWQsIHtcbiAgICAgICAgdHVzOiB7IC4uLmN1cnJlbnRGaWxlLnR1cywgdXBsb2FkVXJsOiB1cGxvYWRVUkwgfSxcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbihzdHJpbmcpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25GaWxlUmVtb3ZlIChmaWxlSUQsIGNiKSB7XG4gICAgdGhpcy51cGxvYWRlckV2ZW50c1tmaWxlSURdLm9uKCdmaWxlLXJlbW92ZWQnLCAoZmlsZSkgPT4ge1xuICAgICAgaWYgKGZpbGVJRCA9PT0gZmlsZS5pZCkgY2IoZmlsZS5pZClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbihib29sZWFuKTogdm9pZH0gY2JcbiAgICovXG4gIG9uUGF1c2UgKGZpbGVJRCwgY2IpIHtcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ3VwbG9hZC1wYXVzZScsICh0YXJnZXRGaWxlSUQsIGlzUGF1c2VkKSA9PiB7XG4gICAgICBpZiAoZmlsZUlEID09PSB0YXJnZXRGaWxlSUQpIHtcbiAgICAgICAgLy8gY29uc3QgaXNQYXVzZWQgPSB0aGlzLnVwcHkucGF1c2VSZXN1bWUoZmlsZUlEKVxuICAgICAgICBjYihpc1BhdXNlZClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25SZXRyeSAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigndXBsb2FkLXJldHJ5JywgKHRhcmdldEZpbGVJRCkgPT4ge1xuICAgICAgaWYgKGZpbGVJRCA9PT0gdGFyZ2V0RmlsZUlEKSB7XG4gICAgICAgIGNiKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25SZXRyeUFsbCAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigncmV0cnktYWxsJywgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnVwcHkuZ2V0RmlsZShmaWxlSUQpKSByZXR1cm5cbiAgICAgIGNiKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25QYXVzZUFsbCAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigncGF1c2UtYWxsJywgKCkgPT4ge1xuICAgICAgaWYgKCF0aGlzLnVwcHkuZ2V0RmlsZShmaWxlSUQpKSByZXR1cm5cbiAgICAgIGNiKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlSURcbiAgICogQHBhcmFtIHtmdW5jdGlvbigpOiB2b2lkfSBjYlxuICAgKi9cbiAgb25DYW5jZWxBbGwgKGZpbGVJRCwgY2IpIHtcbiAgICB0aGlzLnVwbG9hZGVyRXZlbnRzW2ZpbGVJRF0ub24oJ2NhbmNlbC1hbGwnLCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMudXBweS5nZXRGaWxlKGZpbGVJRCkpIHJldHVyblxuICAgICAgY2IoKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZpbGVJRFxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCk6IHZvaWR9IGNiXG4gICAqL1xuICBvblJlc3VtZUFsbCAoZmlsZUlELCBjYikge1xuICAgIHRoaXMudXBsb2FkZXJFdmVudHNbZmlsZUlEXS5vbigncmVzdW1lLWFsbCcsICgpID0+IHtcbiAgICAgIGlmICghdGhpcy51cHB5LmdldEZpbGUoZmlsZUlEKSkgcmV0dXJuXG4gICAgICBjYigpXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0geyhVcHB5RmlsZSB8IEZhaWxlZFVwcHlGaWxlKVtdfSBmaWxlc1xuICAgKi9cbiAgdXBsb2FkRmlsZXMgKGZpbGVzKSB7XG4gICAgY29uc3QgcHJvbWlzZXMgPSBmaWxlcy5tYXAoKGZpbGUsIGkpID0+IHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBpICsgMVxuICAgICAgY29uc3QgdG90YWwgPSBmaWxlcy5sZW5ndGhcblxuICAgICAgaWYgKCdlcnJvcicgaW4gZmlsZSAmJiBmaWxlLmVycm9yKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoZmlsZS5lcnJvcikpXG4gICAgICB9IGlmIChmaWxlLmlzUmVtb3RlKSB7XG4gICAgICAgIC8vIFdlIGVtaXQgdXBsb2FkLXN0YXJ0ZWQgaGVyZSwgc28gdGhhdCBpdCdzIGFsc28gZW1pdHRlZCBmb3IgZmlsZXNcbiAgICAgICAgLy8gdGhhdCBoYXZlIHRvIHdhaXQgZHVlIHRvIHRoZSBgbGltaXRgIG9wdGlvbi5cbiAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWVtaXQgdXBsb2FkLXN0YXJ0ZWQgZm9yIEdvbGRlbiBSZXRyaWV2ZXItcmVzdG9yZWQgZmlsZXMgdGhhdCB3ZXJlIGFscmVhZHkgc3RhcnRlZFxuICAgICAgICBpZiAoIWZpbGUucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZCB8fCAhZmlsZS5pc1Jlc3RvcmVkKSB7XG4gICAgICAgICAgdGhpcy51cHB5LmVtaXQoJ3VwbG9hZC1zdGFydGVkJywgZmlsZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy51cGxvYWRSZW1vdGUoZmlsZSwgY3VycmVudCwgdG90YWwpXG4gICAgICB9XG4gICAgICAvLyBEb24ndCBkb3VibGUtZW1pdCB1cGxvYWQtc3RhcnRlZCBmb3IgR29sZGVuIFJldHJpZXZlci1yZXN0b3JlZCBmaWxlcyB0aGF0IHdlcmUgYWxyZWFkeSBzdGFydGVkXG4gICAgICBpZiAoIWZpbGUucHJvZ3Jlc3MudXBsb2FkU3RhcnRlZCB8fCAhZmlsZS5pc1Jlc3RvcmVkKSB7XG4gICAgICAgIHRoaXMudXBweS5lbWl0KCd1cGxvYWQtc3RhcnRlZCcsIGZpbGUpXG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy51cGxvYWQoZmlsZSwgY3VycmVudCwgdG90YWwpXG4gICAgfSlcblxuICAgIHJldHVybiBzZXR0bGUocHJvbWlzZXMpXG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gZmlsZUlEc1xuICAgKi9cbiAgaGFuZGxlVXBsb2FkIChmaWxlSURzKSB7XG4gICAgaWYgKGZpbGVJRHMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLnVwcHkubG9nKCdbVHVzXSBObyBmaWxlcyB0byB1cGxvYWQnKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0cy5saW1pdCA9PT0gMCkge1xuICAgICAgdGhpcy51cHB5LmxvZyhcbiAgICAgICAgJ1tUdXNdIFdoZW4gdXBsb2FkaW5nIG11bHRpcGxlIGZpbGVzIGF0IG9uY2UsIGNvbnNpZGVyIHNldHRpbmcgdGhlIGBsaW1pdGAgb3B0aW9uICh0byBgMTBgIGZvciBleGFtcGxlKSwgdG8gbGltaXQgdGhlIG51bWJlciBvZiBjb25jdXJyZW50IHVwbG9hZHMsIHdoaWNoIGhlbHBzIHByZXZlbnQgbWVtb3J5IGFuZCBuZXR3b3JrIGlzc3VlczogaHR0cHM6Ly91cHB5LmlvL2RvY3MvdHVzLyNsaW1pdC0wJyxcbiAgICAgICAgJ3dhcm5pbmcnLFxuICAgICAgKVxuICAgIH1cblxuICAgIHRoaXMudXBweS5sb2coJ1tUdXNdIFVwbG9hZGluZy4uLicpXG4gICAgY29uc3QgZmlsZXNUb1VwbG9hZCA9IGZpbGVJRHMubWFwKChmaWxlSUQpID0+IHRoaXMudXBweS5nZXRGaWxlKGZpbGVJRCkpXG5cbiAgICByZXR1cm4gdGhpcy51cGxvYWRGaWxlcyhmaWxlc1RvVXBsb2FkKVxuICAgICAgLnRoZW4oKCkgPT4gbnVsbClcbiAgfVxuXG4gIGluc3RhbGwgKCkge1xuICAgIHRoaXMudXBweS5zZXRTdGF0ZSh7XG4gICAgICBjYXBhYmlsaXRpZXM6IHsgLi4udGhpcy51cHB5LmdldFN0YXRlKCkuY2FwYWJpbGl0aWVzLCByZXN1bWFibGVVcGxvYWRzOiB0cnVlIH0sXG4gICAgfSlcbiAgICB0aGlzLnVwcHkuYWRkVXBsb2FkZXIodGhpcy5oYW5kbGVVcGxvYWQpXG5cbiAgICB0aGlzLnVwcHkub24oJ3Jlc2V0LXByb2dyZXNzJywgdGhpcy5oYW5kbGVSZXNldFByb2dyZXNzKVxuICB9XG5cbiAgdW5pbnN0YWxsICgpIHtcbiAgICB0aGlzLnVwcHkuc2V0U3RhdGUoe1xuICAgICAgY2FwYWJpbGl0aWVzOiB7IC4uLnRoaXMudXBweS5nZXRTdGF0ZSgpLmNhcGFiaWxpdGllcywgcmVzdW1hYmxlVXBsb2FkczogZmFsc2UgfSxcbiAgICB9KVxuICAgIHRoaXMudXBweS5yZW1vdmVVcGxvYWRlcih0aGlzLmhhbmRsZVVwbG9hZClcbiAgfVxufVxuIiwiLyoqXG4gKiBDcmVhdGUgYSB3cmFwcGVyIGFyb3VuZCBhbiBldmVudCBlbWl0dGVyIHdpdGggYSBgcmVtb3ZlYCBtZXRob2QgdG8gcmVtb3ZlXG4gKiBhbGwgZXZlbnRzIHRoYXQgd2VyZSBhZGRlZCB1c2luZyB0aGUgd3JhcHBlZCBlbWl0dGVyLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEV2ZW50VHJhY2tlciB7XG4gICNlbWl0dGVyXG5cbiAgI2V2ZW50cyA9IFtdXG5cbiAgY29uc3RydWN0b3IgKGVtaXR0ZXIpIHtcbiAgICB0aGlzLiNlbWl0dGVyID0gZW1pdHRlclxuICB9XG5cbiAgb24gKGV2ZW50LCBmbikge1xuICAgIHRoaXMuI2V2ZW50cy5wdXNoKFtldmVudCwgZm5dKVxuICAgIHJldHVybiB0aGlzLiNlbWl0dGVyLm9uKGV2ZW50LCBmbilcbiAgfVxuXG4gIHJlbW92ZSAoKSB7XG4gICAgZm9yIChjb25zdCBbZXZlbnQsIGZuXSBvZiB0aGlzLiNldmVudHMuc3BsaWNlKDApKSB7XG4gICAgICB0aGlzLiNlbWl0dGVyLm9mZihldmVudCwgZm4pXG4gICAgfVxuICB9XG59XG4iLCJjbGFzcyBOZXR3b3JrRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yIChlcnJvciwgeGhyID0gbnVsbCkge1xuICAgIHN1cGVyKGBUaGlzIGxvb2tzIGxpa2UgYSBuZXR3b3JrIGVycm9yLCB0aGUgZW5kcG9pbnQgbWlnaHQgYmUgYmxvY2tlZCBieSBhbiBpbnRlcm5ldCBwcm92aWRlciBvciBhIGZpcmV3YWxsLmApXG5cbiAgICB0aGlzLmNhdXNlID0gZXJyb3JcbiAgICB0aGlzLmlzTmV0d29ya0Vycm9yID0gdHJ1ZVxuICAgIHRoaXMucmVxdWVzdCA9IHhoclxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTmV0d29ya0Vycm9yXG4iLCJmdW5jdGlvbiBjcmVhdGVDYW5jZWxFcnJvciAoKSB7XG4gIHJldHVybiBuZXcgRXJyb3IoJ0NhbmNlbGxlZCcpXG59XG5cbmNsYXNzIFJhdGVMaW1pdGVkUXVldWUge1xuICAjYWN0aXZlUmVxdWVzdHMgPSAwXG5cbiAgI3F1ZXVlZEhhbmRsZXJzID0gW11cblxuICBjb25zdHJ1Y3RvciAobGltaXQpIHtcbiAgICBpZiAodHlwZW9mIGxpbWl0ICE9PSAnbnVtYmVyJyB8fCBsaW1pdCA9PT0gMCkge1xuICAgICAgdGhpcy5saW1pdCA9IEluZmluaXR5XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGltaXQgPSBsaW1pdFxuICAgIH1cbiAgfVxuXG4gICNjYWxsIChmbikge1xuICAgIHRoaXMuI2FjdGl2ZVJlcXVlc3RzICs9IDFcblxuICAgIGxldCBkb25lID0gZmFsc2VcblxuICAgIGxldCBjYW5jZWxBY3RpdmVcbiAgICB0cnkge1xuICAgICAgY2FuY2VsQWN0aXZlID0gZm4oKVxuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdGhpcy4jYWN0aXZlUmVxdWVzdHMgLT0gMVxuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFib3J0OiAoKSA9PiB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm5cbiAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgdGhpcy4jYWN0aXZlUmVxdWVzdHMgLT0gMVxuICAgICAgICBjYW5jZWxBY3RpdmUoKVxuICAgICAgICB0aGlzLiNxdWV1ZU5leHQoKVxuICAgICAgfSxcblxuICAgICAgZG9uZTogKCkgPT4ge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuXG4gICAgICAgIGRvbmUgPSB0cnVlXG4gICAgICAgIHRoaXMuI2FjdGl2ZVJlcXVlc3RzIC09IDFcbiAgICAgICAgdGhpcy4jcXVldWVOZXh0KClcbiAgICAgIH0sXG4gICAgfVxuICB9XG5cbiAgI3F1ZXVlTmV4dCAoKSB7XG4gICAgLy8gRG8gaXQgc29vbiBidXQgbm90IGltbWVkaWF0ZWx5LCB0aGlzIGFsbG93cyBjbGVhcmluZyBvdXQgdGhlIGVudGlyZSBxdWV1ZSBzeW5jaHJvbm91c2x5XG4gICAgLy8gb25lIGJ5IG9uZSB3aXRob3V0IGNvbnRpbnVvdXNseSBfYWR2YW5jaW5nXyBpdCAoYW5kIHN0YXJ0aW5nIG5ldyB0YXNrcyBiZWZvcmUgaW1tZWRpYXRlbHlcbiAgICAvLyBhYm9ydGluZyB0aGVtKVxuICAgIHF1ZXVlTWljcm90YXNrKCgpID0+IHRoaXMuI25leHQoKSlcbiAgfVxuXG4gICNuZXh0ICgpIHtcbiAgICBpZiAodGhpcy4jYWN0aXZlUmVxdWVzdHMgPj0gdGhpcy5saW1pdCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmICh0aGlzLiNxdWV1ZWRIYW5kbGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIERpc3BhdGNoIHRoZSBuZXh0IHJlcXVlc3QsIGFuZCB1cGRhdGUgdGhlIGFib3J0L2RvbmUgaGFuZGxlcnNcbiAgICAvLyBzbyB0aGF0IGNhbmNlbGxpbmcgaXQgZG9lcyB0aGUgUmlnaHQgVGhpbmcgKGFuZCBkb2Vzbid0IGp1c3QgdHJ5XG4gICAgLy8gdG8gZGVxdWV1ZSBhbiBhbHJlYWR5LXJ1bm5pbmcgcmVxdWVzdCkuXG4gICAgY29uc3QgbmV4dCA9IHRoaXMuI3F1ZXVlZEhhbmRsZXJzLnNoaWZ0KClcbiAgICBjb25zdCBoYW5kbGVyID0gdGhpcy4jY2FsbChuZXh0LmZuKVxuICAgIG5leHQuYWJvcnQgPSBoYW5kbGVyLmFib3J0XG4gICAgbmV4dC5kb25lID0gaGFuZGxlci5kb25lXG4gIH1cblxuICAjcXVldWUgKGZuLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBoYW5kbGVyID0ge1xuICAgICAgZm4sXG4gICAgICBwcmlvcml0eTogb3B0aW9ucy5wcmlvcml0eSB8fCAwLFxuICAgICAgYWJvcnQ6ICgpID0+IHtcbiAgICAgICAgdGhpcy4jZGVxdWV1ZShoYW5kbGVyKVxuICAgICAgfSxcbiAgICAgIGRvbmU6ICgpID0+IHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgbWFyayBhIHF1ZXVlZCByZXF1ZXN0IGFzIGRvbmU6IHRoaXMgaW5kaWNhdGVzIGEgYnVnJylcbiAgICAgIH0sXG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLiNxdWV1ZWRIYW5kbGVycy5maW5kSW5kZXgoKG90aGVyKSA9PiB7XG4gICAgICByZXR1cm4gaGFuZGxlci5wcmlvcml0eSA+IG90aGVyLnByaW9yaXR5XG4gICAgfSlcbiAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICB0aGlzLiNxdWV1ZWRIYW5kbGVycy5wdXNoKGhhbmRsZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuI3F1ZXVlZEhhbmRsZXJzLnNwbGljZShpbmRleCwgMCwgaGFuZGxlcilcbiAgICB9XG4gICAgcmV0dXJuIGhhbmRsZXJcbiAgfVxuXG4gICNkZXF1ZXVlIChoYW5kbGVyKSB7XG4gICAgY29uc3QgaW5kZXggPSB0aGlzLiNxdWV1ZWRIYW5kbGVycy5pbmRleE9mKGhhbmRsZXIpXG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgdGhpcy4jcXVldWVkSGFuZGxlcnMuc3BsaWNlKGluZGV4LCAxKVxuICAgIH1cbiAgfVxuXG4gIHJ1biAoZm4sIHF1ZXVlT3B0aW9ucykge1xuICAgIGlmICh0aGlzLiNhY3RpdmVSZXF1ZXN0cyA8IHRoaXMubGltaXQpIHtcbiAgICAgIHJldHVybiB0aGlzLiNjYWxsKGZuKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy4jcXVldWUoZm4sIHF1ZXVlT3B0aW9ucylcbiAgfVxuXG4gIHdyYXBQcm9taXNlRnVuY3Rpb24gKGZuLCBxdWV1ZU9wdGlvbnMpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgIGxldCBxdWV1ZWRSZXF1ZXN0XG4gICAgICBjb25zdCBvdXRlclByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHF1ZXVlZFJlcXVlc3QgPSB0aGlzLnJ1bigoKSA9PiB7XG4gICAgICAgICAgbGV0IGNhbmNlbEVycm9yXG4gICAgICAgICAgbGV0IGlubmVyUHJvbWlzZVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpbm5lclByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoZm4oLi4uYXJncykpXG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpbm5lclByb21pc2UgPSBQcm9taXNlLnJlamVjdChlcnIpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaW5uZXJQcm9taXNlLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNhbmNlbEVycm9yKSB7XG4gICAgICAgICAgICAgIHJlamVjdChjYW5jZWxFcnJvcilcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHF1ZXVlZFJlcXVlc3QuZG9uZSgpXG4gICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIChlcnIpID0+IHtcbiAgICAgICAgICAgIGlmIChjYW5jZWxFcnJvcikge1xuICAgICAgICAgICAgICByZWplY3QoY2FuY2VsRXJyb3IpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBxdWV1ZWRSZXF1ZXN0LmRvbmUoKVxuICAgICAgICAgICAgICByZWplY3QoZXJyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgY2FuY2VsRXJyb3IgPSBjcmVhdGVDYW5jZWxFcnJvcigpXG4gICAgICAgICAgfVxuICAgICAgICB9LCBxdWV1ZU9wdGlvbnMpXG4gICAgICB9KVxuXG4gICAgICBvdXRlclByb21pc2UuYWJvcnQgPSAoKSA9PiB7XG4gICAgICAgIHF1ZXVlZFJlcXVlc3QuYWJvcnQoKVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0ZXJQcm9taXNlXG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBSYXRlTGltaXRlZFF1ZXVlLFxuICBpbnRlcm5hbFJhdGVMaW1pdGVkUXVldWU6IFN5bWJvbCgnX19xdWV1ZScpLFxufVxuIiwiY29uc3QgaGFzID0gcmVxdWlyZSgnLi9oYXNQcm9wZXJ0eScpXG5cbmZ1bmN0aW9uIGluc2VydFJlcGxhY2VtZW50IChzb3VyY2UsIHJ4LCByZXBsYWNlbWVudCkge1xuICBjb25zdCBuZXdQYXJ0cyA9IFtdXG4gIHNvdXJjZS5mb3JFYWNoKChjaHVuaykgPT4ge1xuICAgIC8vIFdoZW4gdGhlIHNvdXJjZSBjb250YWlucyBtdWx0aXBsZSBwbGFjZWhvbGRlcnMgZm9yIGludGVycG9sYXRpb24sXG4gICAgLy8gd2Ugc2hvdWxkIGlnbm9yZSBjaHVua3MgdGhhdCBhcmUgbm90IHN0cmluZ3MsIGJlY2F1c2UgdGhvc2VcbiAgICAvLyBjYW4gYmUgSlNYIG9iamVjdHMgYW5kIHdpbGwgYmUgb3RoZXJ3aXNlIGluY29ycmVjdGx5IHR1cm5lZCBpbnRvIHN0cmluZ3MuXG4gICAgLy8gV2l0aG91dCB0aGlzIGNvbmRpdGlvbiB3ZeKAmWQgZ2V0IHRoaXM6IFtvYmplY3QgT2JqZWN0XSBoZWxsbyBbb2JqZWN0IE9iamVjdF0gbXkgPGJ1dHRvbj5cbiAgICBpZiAodHlwZW9mIGNodW5rICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIG5ld1BhcnRzLnB1c2goY2h1bmspXG4gICAgfVxuXG4gICAgcmV0dXJuIHJ4W1N5bWJvbC5zcGxpdF0oY2h1bmspLmZvckVhY2goKHJhdywgaSwgbGlzdCkgPT4ge1xuICAgICAgaWYgKHJhdyAhPT0gJycpIHtcbiAgICAgICAgbmV3UGFydHMucHVzaChyYXcpXG4gICAgICB9XG5cbiAgICAgIC8vIEludGVybGFjZSB3aXRoIHRoZSBgcmVwbGFjZW1lbnRgIHZhbHVlXG4gICAgICBpZiAoaSA8IGxpc3QubGVuZ3RoIC0gMSkge1xuICAgICAgICBuZXdQYXJ0cy5wdXNoKHJlcGxhY2VtZW50KVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG4gIHJldHVybiBuZXdQYXJ0c1xufVxuXG4vKipcbiAqIFRha2VzIGEgc3RyaW5nIHdpdGggcGxhY2Vob2xkZXIgdmFyaWFibGVzIGxpa2UgYCV7c21hcnRfY291bnR9IGZpbGUgc2VsZWN0ZWRgXG4gKiBhbmQgcmVwbGFjZXMgaXQgd2l0aCB2YWx1ZXMgZnJvbSBvcHRpb25zIGB7c21hcnRfY291bnQ6IDV9YFxuICpcbiAqIEBsaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS9haXJibmIvcG9seWdsb3QuanMvYmxvYi9tYXN0ZXIvTElDRU5TRVxuICogdGFrZW4gZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYWlyYm5iL3BvbHlnbG90LmpzL2Jsb2IvbWFzdGVyL2xpYi9wb2x5Z2xvdC5qcyNMMjk5XG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBocmFzZSB0aGF0IG5lZWRzIGludGVycG9sYXRpb24sIHdpdGggcGxhY2Vob2xkZXJzXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyB3aXRoIHZhbHVlcyB0aGF0IHdpbGwgYmUgdXNlZCB0byByZXBsYWNlIHBsYWNlaG9sZGVyc1xuICogQHJldHVybnMge2FueVtdfSBpbnRlcnBvbGF0ZWRcbiAqL1xuZnVuY3Rpb24gaW50ZXJwb2xhdGUgKHBocmFzZSwgb3B0aW9ucykge1xuICBjb25zdCBkb2xsYXJSZWdleCA9IC9cXCQvZ1xuICBjb25zdCBkb2xsYXJCaWxsc1lhbGwgPSAnJCQkJCdcbiAgbGV0IGludGVycG9sYXRlZCA9IFtwaHJhc2VdXG5cbiAgaWYgKG9wdGlvbnMgPT0gbnVsbCkgcmV0dXJuIGludGVycG9sYXRlZFxuXG4gIGZvciAoY29uc3QgYXJnIG9mIE9iamVjdC5rZXlzKG9wdGlvbnMpKSB7XG4gICAgaWYgKGFyZyAhPT0gJ18nKSB7XG4gICAgICAvLyBFbnN1cmUgcmVwbGFjZW1lbnQgdmFsdWUgaXMgZXNjYXBlZCB0byBwcmV2ZW50IHNwZWNpYWwgJC1wcmVmaXhlZFxuICAgICAgLy8gcmVnZXggcmVwbGFjZSB0b2tlbnMuIHRoZSBcIiQkJCRcIiBpcyBuZWVkZWQgYmVjYXVzZSBlYWNoIFwiJFwiIG5lZWRzIHRvXG4gICAgICAvLyBiZSBlc2NhcGVkIHdpdGggXCIkXCIgaXRzZWxmLCBhbmQgd2UgbmVlZCB0d28gaW4gdGhlIHJlc3VsdGluZyBvdXRwdXQuXG4gICAgICBsZXQgcmVwbGFjZW1lbnQgPSBvcHRpb25zW2FyZ11cbiAgICAgIGlmICh0eXBlb2YgcmVwbGFjZW1lbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJlcGxhY2VtZW50ID0gZG9sbGFyUmVnZXhbU3ltYm9sLnJlcGxhY2VdKHJlcGxhY2VtZW50LCBkb2xsYXJCaWxsc1lhbGwpXG4gICAgICB9XG4gICAgICAvLyBXZSBjcmVhdGUgYSBuZXcgYFJlZ0V4cGAgZWFjaCB0aW1lIGluc3RlYWQgb2YgdXNpbmcgYSBtb3JlLWVmZmljaWVudFxuICAgICAgLy8gc3RyaW5nIHJlcGxhY2Ugc28gdGhhdCB0aGUgc2FtZSBhcmd1bWVudCBjYW4gYmUgcmVwbGFjZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgIC8vIGluIHRoZSBzYW1lIHBocmFzZS5cbiAgICAgIGludGVycG9sYXRlZCA9IGluc2VydFJlcGxhY2VtZW50KGludGVycG9sYXRlZCwgbmV3IFJlZ0V4cChgJVxcXFx7JHthcmd9XFxcXH1gLCAnZycpLCByZXBsYWNlbWVudClcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW50ZXJwb2xhdGVkXG59XG5cbi8qKlxuICogVHJhbnNsYXRlcyBzdHJpbmdzIHdpdGggaW50ZXJwb2xhdGlvbiAmIHBsdXJhbGl6YXRpb24gc3VwcG9ydC5cbiAqIEV4dGVuc2libGUgd2l0aCBjdXN0b20gZGljdGlvbmFyaWVzIGFuZCBwbHVyYWxpemF0aW9uIGZ1bmN0aW9ucy5cbiAqXG4gKiBCb3Jyb3dzIGhlYXZpbHkgZnJvbSBhbmQgaW5zcGlyZWQgYnkgUG9seWdsb3QgaHR0cHM6Ly9naXRodWIuY29tL2FpcmJuYi9wb2x5Z2xvdC5qcyxcbiAqIGJhc2ljYWxseSBhIHN0cmlwcGVkLWRvd24gdmVyc2lvbiBvZiBpdC4gRGlmZmVyZW5jZXM6IHBsdXJhbGl6YXRpb24gZnVuY3Rpb25zIGFyZSBub3QgaGFyZGNvZGVkXG4gKiBhbmQgY2FuIGJlIGVhc2lseSBhZGRlZCBhbW9uZyB3aXRoIGRpY3Rpb25hcmllcywgbmVzdGVkIG9iamVjdHMgYXJlIHVzZWQgZm9yIHBsdXJhbGl6YXRpb25cbiAqIGFzIG9wcG9zZWQgdG8gYHx8fHxgIGRlbGltZXRlclxuICpcbiAqIFVzYWdlIGV4YW1wbGU6IGB0cmFuc2xhdG9yLnRyYW5zbGF0ZSgnZmlsZXNfY2hvc2VuJywge3NtYXJ0X2NvdW50OiAzfSlgXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVHJhbnNsYXRvciB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge29iamVjdHxBcnJheTxvYmplY3Q+fSBsb2NhbGVzIC0gbG9jYWxlIG9yIGxpc3Qgb2YgbG9jYWxlcy5cbiAgICovXG4gIGNvbnN0cnVjdG9yIChsb2NhbGVzKSB7XG4gICAgdGhpcy5sb2NhbGUgPSB7XG4gICAgICBzdHJpbmdzOiB7fSxcbiAgICAgIHBsdXJhbGl6ZSAobikge1xuICAgICAgICBpZiAobiA9PT0gMSkge1xuICAgICAgICAgIHJldHVybiAwXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH0sXG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobG9jYWxlcykpIHtcbiAgICAgIGxvY2FsZXMuZm9yRWFjaCh0aGlzLiNhcHBseSwgdGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy4jYXBwbHkobG9jYWxlcylcbiAgICB9XG4gIH1cblxuICAjYXBwbHkgKGxvY2FsZSkge1xuICAgIGlmICghbG9jYWxlPy5zdHJpbmdzKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBwcmV2TG9jYWxlID0gdGhpcy5sb2NhbGVcbiAgICB0aGlzLmxvY2FsZSA9IHsgLi4ucHJldkxvY2FsZSwgc3RyaW5nczogeyAuLi5wcmV2TG9jYWxlLnN0cmluZ3MsIC4uLmxvY2FsZS5zdHJpbmdzIH0gfVxuICAgIHRoaXMubG9jYWxlLnBsdXJhbGl6ZSA9IGxvY2FsZS5wbHVyYWxpemUgfHwgcHJldkxvY2FsZS5wbHVyYWxpemVcbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaWMgdHJhbnNsYXRlIG1ldGhvZFxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIGxhdGVyIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzIGluIHN0cmluZ1xuICAgKiBAcmV0dXJucyB7c3RyaW5nfSB0cmFuc2xhdGVkIChhbmQgaW50ZXJwb2xhdGVkKVxuICAgKi9cbiAgdHJhbnNsYXRlIChrZXksIG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50cmFuc2xhdGVBcnJheShrZXksIG9wdGlvbnMpLmpvaW4oJycpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgdHJhbnNsYXRpb24gYW5kIHJldHVybiB0aGUgdHJhbnNsYXRlZCBhbmQgaW50ZXJwb2xhdGVkIHBhcnRzIGFzIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIHdpdGggdmFsdWVzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIHJlcGxhY2UgcGxhY2Vob2xkZXJzXG4gICAqIEByZXR1cm5zIHtBcnJheX0gVGhlIHRyYW5zbGF0ZWQgYW5kIGludGVycG9sYXRlZCBwYXJ0cywgaW4gb3JkZXIuXG4gICAqL1xuICB0cmFuc2xhdGVBcnJheSAoa2V5LCBvcHRpb25zKSB7XG4gICAgaWYgKCFoYXModGhpcy5sb2NhbGUuc3RyaW5ncywga2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBtaXNzaW5nIHN0cmluZzogJHtrZXl9YClcbiAgICB9XG5cbiAgICBjb25zdCBzdHJpbmcgPSB0aGlzLmxvY2FsZS5zdHJpbmdzW2tleV1cbiAgICBjb25zdCBoYXNQbHVyYWxGb3JtcyA9IHR5cGVvZiBzdHJpbmcgPT09ICdvYmplY3QnXG5cbiAgICBpZiAoaGFzUGx1cmFsRm9ybXMpIHtcbiAgICAgIGlmIChvcHRpb25zICYmIHR5cGVvZiBvcHRpb25zLnNtYXJ0X2NvdW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zdCBwbHVyYWwgPSB0aGlzLmxvY2FsZS5wbHVyYWxpemUob3B0aW9ucy5zbWFydF9jb3VudClcbiAgICAgICAgcmV0dXJuIGludGVycG9sYXRlKHN0cmluZ1twbHVyYWxdLCBvcHRpb25zKVxuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBdHRlbXB0ZWQgdG8gdXNlIGEgc3RyaW5nIHdpdGggcGx1cmFsIGZvcm1zLCBidXQgbm8gdmFsdWUgd2FzIGdpdmVuIGZvciAle3NtYXJ0X2NvdW50fScpXG4gICAgfVxuXG4gICAgcmV0dXJuIGludGVycG9sYXRlKHN0cmluZywgb3B0aW9ucylcbiAgfVxufVxuIiwiY29uc3QgdGhyb3R0bGUgPSByZXF1aXJlKCdsb2Rhc2gudGhyb3R0bGUnKVxuXG5mdW5jdGlvbiBlbWl0U29ja2V0UHJvZ3Jlc3MgKHVwbG9hZGVyLCBwcm9ncmVzc0RhdGEsIGZpbGUpIHtcbiAgY29uc3QgeyBwcm9ncmVzcywgYnl0ZXNVcGxvYWRlZCwgYnl0ZXNUb3RhbCB9ID0gcHJvZ3Jlc3NEYXRhXG4gIGlmIChwcm9ncmVzcykge1xuICAgIHVwbG9hZGVyLnVwcHkubG9nKGBVcGxvYWQgcHJvZ3Jlc3M6ICR7cHJvZ3Jlc3N9YClcbiAgICB1cGxvYWRlci51cHB5LmVtaXQoJ3VwbG9hZC1wcm9ncmVzcycsIGZpbGUsIHtcbiAgICAgIHVwbG9hZGVyLFxuICAgICAgYnl0ZXNVcGxvYWRlZCxcbiAgICAgIGJ5dGVzVG90YWwsXG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlKGVtaXRTb2NrZXRQcm9ncmVzcywgMzAwLCB7XG4gIGxlYWRpbmc6IHRydWUsXG4gIHRyYWlsaW5nOiB0cnVlLFxufSlcbiIsImNvbnN0IE5ldHdvcmtFcnJvciA9IHJlcXVpcmUoJy4vTmV0d29ya0Vycm9yJylcblxuLyoqXG4gKiBXcmFwcGVyIGFyb3VuZCB3aW5kb3cuZmV0Y2ggdGhhdCB0aHJvd3MgYSBOZXR3b3JrRXJyb3Igd2hlbiBhcHByb3ByaWF0ZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZldGNoV2l0aE5ldHdvcmtFcnJvciAoLi4ub3B0aW9ucykge1xuICByZXR1cm4gZmV0Y2goLi4ub3B0aW9ucylcbiAgICAuY2F0Y2goKGVycikgPT4ge1xuICAgICAgaWYgKGVyci5uYW1lID09PSAnQWJvcnRFcnJvcicpIHtcbiAgICAgICAgdGhyb3cgZXJyXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgTmV0d29ya0Vycm9yKGVycilcbiAgICAgIH1cbiAgICB9KVxufVxuIiwiY29uc3QgaXNET01FbGVtZW50ID0gcmVxdWlyZSgnLi9pc0RPTUVsZW1lbnQnKVxuXG4vKipcbiAqIEZpbmQgYSBET00gZWxlbWVudC5cbiAqXG4gKiBAcGFyYW0ge05vZGV8c3RyaW5nfSBlbGVtZW50XG4gKiBAcmV0dXJucyB7Tm9kZXxudWxsfVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGZpbmRET01FbGVtZW50IChlbGVtZW50LCBjb250ZXh0ID0gZG9jdW1lbnQpIHtcbiAgaWYgKHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudClcbiAgfVxuXG4gIGlmIChpc0RPTUVsZW1lbnQoZWxlbWVudCkpIHtcbiAgICByZXR1cm4gZWxlbWVudFxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn1cbiIsImZ1bmN0aW9uIGVuY29kZUNoYXJhY3RlciAoY2hhcmFjdGVyKSB7XG4gIHJldHVybiBjaGFyYWN0ZXIuY2hhckNvZGVBdCgwKS50b1N0cmluZygzMilcbn1cblxuZnVuY3Rpb24gZW5jb2RlRmlsZW5hbWUgKG5hbWUpIHtcbiAgbGV0IHN1ZmZpeCA9ICcnXG4gIHJldHVybiBuYW1lLnJlcGxhY2UoL1teQS1aMC05XS9pZywgKGNoYXJhY3RlcikgPT4ge1xuICAgIHN1ZmZpeCArPSBgLSR7ZW5jb2RlQ2hhcmFjdGVyKGNoYXJhY3Rlcil9YFxuICAgIHJldHVybiAnLydcbiAgfSkgKyBzdWZmaXhcbn1cblxuLyoqXG4gKiBUYWtlcyBhIGZpbGUgb2JqZWN0IGFuZCB0dXJucyBpdCBpbnRvIGZpbGVJRCwgYnkgY29udmVydGluZyBmaWxlLm5hbWUgdG8gbG93ZXJjYXNlLFxuICogcmVtb3ZpbmcgZXh0cmEgY2hhcmFjdGVycyBhbmQgYWRkaW5nIHR5cGUsIHNpemUgYW5kIGxhc3RNb2RpZmllZFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlXG4gKiBAcmV0dXJucyB7c3RyaW5nfSB0aGUgZmlsZUlEXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2VuZXJhdGVGaWxlSUQgKGZpbGUpIHtcbiAgLy8gSXQncyB0ZW1wdGluZyB0byBkbyBgW2l0ZW1zXS5maWx0ZXIoQm9vbGVhbikuam9pbignLScpYCBoZXJlLCBidXQgdGhhdFxuICAvLyBpcyBzbG93ZXIhIHNpbXBsZSBzdHJpbmcgY29uY2F0ZW5hdGlvbiBpcyBmYXN0XG5cbiAgbGV0IGlkID0gJ3VwcHknXG4gIGlmICh0eXBlb2YgZmlsZS5uYW1lID09PSAnc3RyaW5nJykge1xuICAgIGlkICs9IGAtJHtlbmNvZGVGaWxlbmFtZShmaWxlLm5hbWUudG9Mb3dlckNhc2UoKSl9YFxuICB9XG5cbiAgaWYgKGZpbGUudHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWQgKz0gYC0ke2ZpbGUudHlwZX1gXG4gIH1cblxuICBpZiAoZmlsZS5tZXRhICYmIHR5cGVvZiBmaWxlLm1ldGEucmVsYXRpdmVQYXRoID09PSAnc3RyaW5nJykge1xuICAgIGlkICs9IGAtJHtlbmNvZGVGaWxlbmFtZShmaWxlLm1ldGEucmVsYXRpdmVQYXRoLnRvTG93ZXJDYXNlKCkpfWBcbiAgfVxuXG4gIGlmIChmaWxlLmRhdGEuc2l6ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWQgKz0gYC0ke2ZpbGUuZGF0YS5zaXplfWBcbiAgfVxuICBpZiAoZmlsZS5kYXRhLmxhc3RNb2RpZmllZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaWQgKz0gYC0ke2ZpbGUuZGF0YS5sYXN0TW9kaWZpZWR9YFxuICB9XG5cbiAgcmV0dXJuIGlkXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEJ5dGVzUmVtYWluaW5nIChmaWxlUHJvZ3Jlc3MpIHtcbiAgcmV0dXJuIGZpbGVQcm9ncmVzcy5ieXRlc1RvdGFsIC0gZmlsZVByb2dyZXNzLmJ5dGVzVXBsb2FkZWRcbn1cbiIsIi8qKlxuICogVGFrZXMgYSBmdWxsIGZpbGVuYW1lIHN0cmluZyBhbmQgcmV0dXJucyBhbiBvYmplY3Qge25hbWUsIGV4dGVuc2lvbn1cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZnVsbEZpbGVOYW1lXG4gKiBAcmV0dXJucyB7b2JqZWN0fSB7bmFtZSwgZXh0ZW5zaW9ufVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uIChmdWxsRmlsZU5hbWUpIHtcbiAgY29uc3QgbGFzdERvdCA9IGZ1bGxGaWxlTmFtZS5sYXN0SW5kZXhPZignLicpXG4gIC8vIHRoZXNlIGNvdW50IGFzIG5vIGV4dGVuc2lvbjogXCJuby1kb3RcIiwgXCJ0cmFpbGluZy1kb3QuXCJcbiAgaWYgKGxhc3REb3QgPT09IC0xIHx8IGxhc3REb3QgPT09IGZ1bGxGaWxlTmFtZS5sZW5ndGggLSAxKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGZ1bGxGaWxlTmFtZSxcbiAgICAgIGV4dGVuc2lvbjogdW5kZWZpbmVkLFxuICAgIH1cbiAgfVxuICByZXR1cm4ge1xuICAgIG5hbWU6IGZ1bGxGaWxlTmFtZS5zbGljZSgwLCBsYXN0RG90KSxcbiAgICBleHRlbnNpb246IGZ1bGxGaWxlTmFtZS5zbGljZShsYXN0RG90ICsgMSksXG4gIH1cbn1cbiIsImNvbnN0IGdldEZpbGVOYW1lQW5kRXh0ZW5zaW9uID0gcmVxdWlyZSgnLi9nZXRGaWxlTmFtZUFuZEV4dGVuc2lvbicpXG5jb25zdCBtaW1lVHlwZXMgPSByZXF1aXJlKCcuL21pbWVUeXBlcycpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0RmlsZVR5cGUgKGZpbGUpIHtcbiAgaWYgKGZpbGUudHlwZSkgcmV0dXJuIGZpbGUudHlwZVxuXG4gIGNvbnN0IGZpbGVFeHRlbnNpb24gPSBmaWxlLm5hbWUgPyBnZXRGaWxlTmFtZUFuZEV4dGVuc2lvbihmaWxlLm5hbWUpLmV4dGVuc2lvbj8udG9Mb3dlckNhc2UoKSA6IG51bGxcbiAgaWYgKGZpbGVFeHRlbnNpb24gJiYgZmlsZUV4dGVuc2lvbiBpbiBtaW1lVHlwZXMpIHtcbiAgICAvLyBlbHNlLCBzZWUgaWYgd2UgY2FuIG1hcCBleHRlbnNpb24gdG8gYSBtaW1lIHR5cGVcbiAgICByZXR1cm4gbWltZVR5cGVzW2ZpbGVFeHRlbnNpb25dXG4gIH1cbiAgLy8gaWYgYWxsIGZhaWxzLCBmYWxsIGJhY2sgdG8gYSBnZW5lcmljIGJ5dGUgc3RyZWFtIHR5cGVcbiAgcmV0dXJuICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFNvY2tldEhvc3QgKHVybCkge1xuICAvLyBnZXQgdGhlIGhvc3QgZG9tYWluXG4gIGNvbnN0IHJlZ2V4ID0gL14oPzpodHRwcz86XFwvXFwvfFxcL1xcLyk/KD86W15AXFxuXStAKT8oPzp3d3dcXC4pPyhbXlxcbl0rKS9pXG4gIGNvbnN0IGhvc3QgPSByZWdleC5leGVjKHVybClbMV1cbiAgY29uc3Qgc29ja2V0UHJvdG9jb2wgPSAvXmh0dHA6XFwvXFwvL2kudGVzdCh1cmwpID8gJ3dzJyA6ICd3c3MnXG5cbiAgcmV0dXJuIGAke3NvY2tldFByb3RvY29sfTovLyR7aG9zdH1gXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldFNwZWVkIChmaWxlUHJvZ3Jlc3MpIHtcbiAgaWYgKCFmaWxlUHJvZ3Jlc3MuYnl0ZXNVcGxvYWRlZCkgcmV0dXJuIDBcblxuICBjb25zdCB0aW1lRWxhcHNlZCA9IERhdGUubm93KCkgLSBmaWxlUHJvZ3Jlc3MudXBsb2FkU3RhcnRlZFxuICBjb25zdCB1cGxvYWRTcGVlZCA9IGZpbGVQcm9ncmVzcy5ieXRlc1VwbG9hZGVkIC8gKHRpbWVFbGFwc2VkIC8gMTAwMClcbiAgcmV0dXJuIHVwbG9hZFNwZWVkXG59XG4iLCIvKipcbiAqIEdldCB0aGUgZGVjbGFyZWQgdGV4dCBkaXJlY3Rpb24gZm9yIGFuIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKiBAcmV0dXJucyB7c3RyaW5nfHVuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBnZXRUZXh0RGlyZWN0aW9uIChlbGVtZW50KSB7XG4gIC8vIFRoZXJlIGlzIGFub3RoZXIgd2F5IHRvIGRldGVybWluZSB0ZXh0IGRpcmVjdGlvbiB1c2luZyBnZXRDb21wdXRlZFN0eWxlKCksIGFzIGRvbmUgaGVyZTpcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3BlbmNpbC1qcy90ZXh0LWRpcmVjdGlvbi9ibG9iLzJhMjM1Y2U5NTA4OWIzMTg1YWNlYzNiNTEzMTNjYmJhOTIxYjM4MTEvdGV4dC1kaXJlY3Rpb24uanNcbiAgLy9cbiAgLy8gV2UgZG8gbm90IHVzZSB0aGF0IGFwcHJvYWNoIGJlY2F1c2Ugd2UgYXJlIGludGVyZXN0ZWQgc3BlY2lmaWNhbGx5IGluIHRoZSBfZGVjbGFyZWRfIHRleHQgZGlyZWN0aW9uLlxuICAvLyBJZiBubyB0ZXh0IGRpcmVjdGlvbiBpcyBkZWNsYXJlZCwgd2UgaGF2ZSB0byBwcm92aWRlIG91ciBvd24gZXhwbGljaXQgdGV4dCBkaXJlY3Rpb24gc28gb3VyXG4gIC8vIGJpZGlyZWN0aW9uYWwgQ1NTIHN0eWxlIHNoZWV0cyB3b3JrLlxuICB3aGlsZSAoZWxlbWVudCAmJiAhZWxlbWVudC5kaXIpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnROb2RlXG4gIH1cbiAgcmV0dXJuIGVsZW1lbnQ/LmRpclxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFRleHREaXJlY3Rpb25cbiIsIi8qKlxuICogQWRkcyB6ZXJvIHRvIHN0cmluZ3Mgc2hvcnRlciB0aGFuIHR3byBjaGFyYWN0ZXJzLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXJcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHBhZCAobnVtYmVyKSB7XG4gIHJldHVybiBudW1iZXIgPCAxMCA/IGAwJHtudW1iZXJ9YCA6IG51bWJlci50b1N0cmluZygpXG59XG5cbi8qKlxuICogUmV0dXJucyBhIHRpbWVzdGFtcCBpbiB0aGUgZm9ybWF0IG9mIGBob3VyczptaW51dGVzOnNlY29uZHNgXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0VGltZVN0YW1wICgpIHtcbiAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKClcbiAgY29uc3QgaG91cnMgPSBwYWQoZGF0ZS5nZXRIb3VycygpKVxuICBjb25zdCBtaW51dGVzID0gcGFkKGRhdGUuZ2V0TWludXRlcygpKVxuICBjb25zdCBzZWNvbmRzID0gcGFkKGRhdGUuZ2V0U2Vjb25kcygpKVxuICByZXR1cm4gYCR7aG91cnN9OiR7bWludXRlc306JHtzZWNvbmRzfWBcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaGFzIChvYmplY3QsIGtleSkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KVxufVxuIiwiLyoqXG4gKiBDaGVjayBpZiBhbiBvYmplY3QgaXMgYSBET00gZWxlbWVudC4gRHVjay10eXBpbmcgYmFzZWQgb24gYG5vZGVUeXBlYC5cbiAqXG4gKiBAcGFyYW0geyp9IG9ialxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzRE9NRWxlbWVudCAob2JqKSB7XG4gIHJldHVybiBvYmo/Lm5vZGVUeXBlID09PSBOb2RlLkVMRU1FTlRfTk9ERVxufVxuIiwiZnVuY3Rpb24gaXNOZXR3b3JrRXJyb3IgKHhocikge1xuICBpZiAoIXhocikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiAoeGhyLnJlYWR5U3RhdGUgIT09IDAgJiYgeGhyLnJlYWR5U3RhdGUgIT09IDQpIHx8IHhoci5zdGF0dXMgPT09IDBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc05ldHdvcmtFcnJvclxuIiwiLy8gX19fV2h5IG5vdCBhZGQgdGhlIG1pbWUtdHlwZXMgcGFja2FnZT9cbi8vICAgIEl0J3MgMTkuN2tCIGd6aXBwZWQsIGFuZCB3ZSBvbmx5IG5lZWQgbWltZSB0eXBlcyBmb3Igd2VsbC1rbm93biBleHRlbnNpb25zIChmb3IgZmlsZSBwcmV2aWV3cykuXG4vLyBfX19XaGVyZSB0byB0YWtlIG5ldyBleHRlbnNpb25zIGZyb20/XG4vLyAgICBodHRwczovL2dpdGh1Yi5jb20vanNodHRwL21pbWUtZGIvYmxvYi9tYXN0ZXIvZGIuanNvblxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgbWQ6ICd0ZXh0L21hcmtkb3duJyxcbiAgbWFya2Rvd246ICd0ZXh0L21hcmtkb3duJyxcbiAgbXA0OiAndmlkZW8vbXA0JyxcbiAgbXAzOiAnYXVkaW8vbXAzJyxcbiAgc3ZnOiAnaW1hZ2Uvc3ZnK3htbCcsXG4gIGpwZzogJ2ltYWdlL2pwZWcnLFxuICBwbmc6ICdpbWFnZS9wbmcnLFxuICBnaWY6ICdpbWFnZS9naWYnLFxuICBoZWljOiAnaW1hZ2UvaGVpYycsXG4gIGhlaWY6ICdpbWFnZS9oZWlmJyxcbiAgeWFtbDogJ3RleHQveWFtbCcsXG4gIHltbDogJ3RleHQveWFtbCcsXG4gIGNzdjogJ3RleHQvY3N2JyxcbiAgdHN2OiAndGV4dC90YWItc2VwYXJhdGVkLXZhbHVlcycsXG4gIHRhYjogJ3RleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXMnLFxuICBhdmk6ICd2aWRlby94LW1zdmlkZW8nLFxuICBta3M6ICd2aWRlby94LW1hdHJvc2thJyxcbiAgbWt2OiAndmlkZW8veC1tYXRyb3NrYScsXG4gIG1vdjogJ3ZpZGVvL3F1aWNrdGltZScsXG4gIGRvYzogJ2FwcGxpY2F0aW9uL21zd29yZCcsXG4gIGRvY206ICdhcHBsaWNhdGlvbi92bmQubXMtd29yZC5kb2N1bWVudC5tYWNyb2VuYWJsZWQuMTInLFxuICBkb2N4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LndvcmRwcm9jZXNzaW5nbWwuZG9jdW1lbnQnLFxuICBkb3Q6ICdhcHBsaWNhdGlvbi9tc3dvcmQnLFxuICBkb3RtOiAnYXBwbGljYXRpb24vdm5kLm1zLXdvcmQudGVtcGxhdGUubWFjcm9lbmFibGVkLjEyJyxcbiAgZG90eDogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLnRlbXBsYXRlJyxcbiAgeGxhOiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgeGxhbTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC5hZGRpbi5tYWNyb2VuYWJsZWQuMTInLFxuICB4bGM6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB4bGY6ICdhcHBsaWNhdGlvbi94LXhsaWZmK3htbCcsXG4gIHhsbTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gIHhsczogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCcsXG4gIHhsc2I6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQuYmluYXJ5Lm1hY3JvZW5hYmxlZC4xMicsXG4gIHhsc206ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwuc2hlZXQubWFjcm9lbmFibGVkLjEyJyxcbiAgeGxzeDogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0JyxcbiAgeGx0OiAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJyxcbiAgeGx0bTogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbC50ZW1wbGF0ZS5tYWNyb2VuYWJsZWQuMTInLFxuICB4bHR4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwudGVtcGxhdGUnLFxuICB4bHc6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB0eHQ6ICd0ZXh0L3BsYWluJyxcbiAgdGV4dDogJ3RleHQvcGxhaW4nLFxuICBjb25mOiAndGV4dC9wbGFpbicsXG4gIGxvZzogJ3RleHQvcGxhaW4nLFxuICBwZGY6ICdhcHBsaWNhdGlvbi9wZGYnLFxuICB6aXA6ICdhcHBsaWNhdGlvbi96aXAnLFxuICAnN3onOiAnYXBwbGljYXRpb24veC03ei1jb21wcmVzc2VkJyxcbiAgcmFyOiAnYXBwbGljYXRpb24veC1yYXItY29tcHJlc3NlZCcsXG4gIHRhcjogJ2FwcGxpY2F0aW9uL3gtdGFyJyxcbiAgZ3o6ICdhcHBsaWNhdGlvbi9nemlwJyxcbiAgZG1nOiAnYXBwbGljYXRpb24veC1hcHBsZS1kaXNraW1hZ2UnLFxufVxuIiwiY29uc3Qgc2Vjb25kc1RvVGltZSA9IHJlcXVpcmUoJy4vc2Vjb25kc1RvVGltZScpXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcHJldHR5RVRBIChzZWNvbmRzKSB7XG4gIGNvbnN0IHRpbWUgPSBzZWNvbmRzVG9UaW1lKHNlY29uZHMpXG5cbiAgLy8gT25seSBkaXNwbGF5IGhvdXJzIGFuZCBtaW51dGVzIGlmIHRoZXkgYXJlIGdyZWF0ZXIgdGhhbiAwIGJ1dCBhbHdheXNcbiAgLy8gZGlzcGxheSBtaW51dGVzIGlmIGhvdXJzIGlzIGJlaW5nIGRpc3BsYXllZFxuICAvLyBEaXNwbGF5IGEgbGVhZGluZyB6ZXJvIGlmIHRoZSB0aGVyZSBpcyBhIHByZWNlZGluZyB1bml0OiAxbSAwNXMsIGJ1dCA1c1xuICBjb25zdCBob3Vyc1N0ciA9IHRpbWUuaG91cnMgPT09IDAgPyAnJyA6IGAke3RpbWUuaG91cnN9aGBcbiAgY29uc3QgbWludXRlc1N0ciA9IHRpbWUubWludXRlcyA9PT0gMCA/ICcnIDogYCR7dGltZS5ob3VycyA9PT0gMCA/IHRpbWUubWludXRlcyA6IGAgJHt0aW1lLm1pbnV0ZXMudG9TdHJpbmcoMTApLnBhZFN0YXJ0KDIsICcwJyl9YH1tYFxuICBjb25zdCBzZWNvbmRzU3RyID0gdGltZS5ob3VycyAhPT0gMCA/ICcnIDogYCR7dGltZS5taW51dGVzID09PSAwID8gdGltZS5zZWNvbmRzIDogYCAke3RpbWUuc2Vjb25kcy50b1N0cmluZygxMCkucGFkU3RhcnQoMiwgJzAnKX1gfXNgXG5cbiAgcmV0dXJuIGAke2hvdXJzU3RyfSR7bWludXRlc1N0cn0ke3NlY29uZHNTdHJ9YFxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzZWNvbmRzVG9UaW1lIChyYXdTZWNvbmRzKSB7XG4gIGNvbnN0IGhvdXJzID0gTWF0aC5mbG9vcihyYXdTZWNvbmRzIC8gMzYwMCkgJSAyNFxuICBjb25zdCBtaW51dGVzID0gTWF0aC5mbG9vcihyYXdTZWNvbmRzIC8gNjApICUgNjBcbiAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IocmF3U2Vjb25kcyAlIDYwKVxuXG4gIHJldHVybiB7IGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2V0dGxlIChwcm9taXNlcykge1xuICBjb25zdCByZXNvbHV0aW9ucyA9IFtdXG4gIGNvbnN0IHJlamVjdGlvbnMgPSBbXVxuICBmdW5jdGlvbiByZXNvbHZlZCAodmFsdWUpIHtcbiAgICByZXNvbHV0aW9ucy5wdXNoKHZhbHVlKVxuICB9XG4gIGZ1bmN0aW9uIHJlamVjdGVkIChlcnJvcikge1xuICAgIHJlamVjdGlvbnMucHVzaChlcnJvcilcbiAgfVxuXG4gIGNvbnN0IHdhaXQgPSBQcm9taXNlLmFsbChcbiAgICBwcm9taXNlcy5tYXAoKHByb21pc2UpID0+IHByb21pc2UudGhlbihyZXNvbHZlZCwgcmVqZWN0ZWQpKSxcbiAgKVxuXG4gIHJldHVybiB3YWl0LnRoZW4oKCkgPT4ge1xuICAgIHJldHVybiB7XG4gICAgICBzdWNjZXNzZnVsOiByZXNvbHV0aW9ucyxcbiAgICAgIGZhaWxlZDogcmVqZWN0aW9ucyxcbiAgICB9XG4gIH0pXG59XG4iLCIvKipcbiAqIENvbnZlcnRzIGxpc3QgaW50byBhcnJheVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmZyb21cbiIsImNvbnN0IFVwcHkgPSByZXF1aXJlKCdAdXBweS9jb3JlJylcbmNvbnN0IEZpbGVJbnB1dCA9IHJlcXVpcmUoJ0B1cHB5L2ZpbGUtaW5wdXQnKVxuY29uc3QgU3RhdHVzQmFyID0gcmVxdWlyZSgnQHVwcHkvc3RhdHVzLWJhcicpXG5jb25zdCBUdXMgPSByZXF1aXJlKCdAdXBweS90dXMnKVxuXG5jb25zdCB1cHB5T25lID0gbmV3IFVwcHkoe2RlYnVnOiB0cnVlLCBhdXRvUHJvY2VlZDogdHJ1ZX0pXG51cHB5T25lXG4gIC51c2UoRmlsZUlucHV0LCB7IHRhcmdldDogJy5VcHB5SW5wdXQnLCBwcmV0dHk6IGZhbHNlIH0pXG4gIC51c2UoVHVzLCB7IGVuZHBvaW50OiAnaHR0cHM6Ly90dXNkLnR1c2RlbW8ubmV0L2ZpbGVzLycgfSlcbiAgLnVzZShTdGF0dXNCYXIsIHtcbiAgICB0YXJnZXQ6ICcuVXBweUlucHV0LVByb2dyZXNzJyxcbiAgICBoaWRlVXBsb2FkQnV0dG9uOiB0cnVlLFxuICAgIGhpZGVBZnRlckZpbmlzaDogZmFsc2VcbiAgfSlcbiJdfQ==
