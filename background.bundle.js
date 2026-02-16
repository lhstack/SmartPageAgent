var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// node_modules/crypto-js/core.js
var require_core = __commonJS({
  "node_modules/crypto-js/core.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory();
      } else if (typeof define === "function" && define.amd) {
        define([], factory);
      } else {
        root.CryptoJS = factory();
      }
    })(exports, function() {
      var CryptoJS2 = CryptoJS2 || (function(Math2, undefined2) {
        var crypto2;
        if (typeof window !== "undefined" && window.crypto) {
          crypto2 = window.crypto;
        }
        if (typeof self !== "undefined" && self.crypto) {
          crypto2 = self.crypto;
        }
        if (typeof globalThis !== "undefined" && globalThis.crypto) {
          crypto2 = globalThis.crypto;
        }
        if (!crypto2 && typeof window !== "undefined" && window.msCrypto) {
          crypto2 = window.msCrypto;
        }
        if (!crypto2 && typeof global !== "undefined" && global.crypto) {
          crypto2 = global.crypto;
        }
        if (!crypto2 && typeof __require === "function") {
          try {
            crypto2 = require_crypto();
          } catch (err) {
          }
        }
        var cryptoSecureRandomInt = function() {
          if (crypto2) {
            if (typeof crypto2.getRandomValues === "function") {
              try {
                return crypto2.getRandomValues(new Uint32Array(1))[0];
              } catch (err) {
              }
            }
            if (typeof crypto2.randomBytes === "function") {
              try {
                return crypto2.randomBytes(4).readInt32LE();
              } catch (err) {
              }
            }
          }
          throw new Error("Native crypto module could not be used to get secure random number.");
        };
        var create = Object.create || /* @__PURE__ */ (function() {
          function F() {
          }
          return function(obj) {
            var subtype;
            F.prototype = obj;
            subtype = new F();
            F.prototype = null;
            return subtype;
          };
        })();
        var C = {};
        var C_lib = C.lib = {};
        var Base = C_lib.Base = /* @__PURE__ */ (function() {
          return {
            /**
             * Creates a new object that inherits from this object.
             *
             * @param {Object} overrides Properties to copy into the new object.
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         field: 'value',
             *
             *         method: function () {
             *         }
             *     });
             */
            extend: function(overrides) {
              var subtype = create(this);
              if (overrides) {
                subtype.mixIn(overrides);
              }
              if (!subtype.hasOwnProperty("init") || this.init === subtype.init) {
                subtype.init = function() {
                  subtype.$super.init.apply(this, arguments);
                };
              }
              subtype.init.prototype = subtype;
              subtype.$super = this;
              return subtype;
            },
            /**
             * Extends this object and runs the init method.
             * Arguments to create() will be passed to init().
             *
             * @return {Object} The new object.
             *
             * @static
             *
             * @example
             *
             *     var instance = MyType.create();
             */
            create: function() {
              var instance = this.extend();
              instance.init.apply(instance, arguments);
              return instance;
            },
            /**
             * Initializes a newly created object.
             * Override this method to add some logic when your objects are created.
             *
             * @example
             *
             *     var MyType = CryptoJS.lib.Base.extend({
             *         init: function () {
             *             // ...
             *         }
             *     });
             */
            init: function() {
            },
            /**
             * Copies properties into this object.
             *
             * @param {Object} properties The properties to mix in.
             *
             * @example
             *
             *     MyType.mixIn({
             *         field: 'value'
             *     });
             */
            mixIn: function(properties) {
              for (var propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                  this[propertyName] = properties[propertyName];
                }
              }
              if (properties.hasOwnProperty("toString")) {
                this.toString = properties.toString;
              }
            },
            /**
             * Creates a copy of this object.
             *
             * @return {Object} The clone.
             *
             * @example
             *
             *     var clone = instance.clone();
             */
            clone: function() {
              return this.init.prototype.extend(this);
            }
          };
        })();
        var WordArray = C_lib.WordArray = Base.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of 32-bit words.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.create();
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
           *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
           */
          init: function(words, sigBytes) {
            words = this.words = words || [];
            if (sigBytes != undefined2) {
              this.sigBytes = sigBytes;
            } else {
              this.sigBytes = words.length * 4;
            }
          },
          /**
           * Converts this word array to a string.
           *
           * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
           *
           * @return {string} The stringified word array.
           *
           * @example
           *
           *     var string = wordArray + '';
           *     var string = wordArray.toString();
           *     var string = wordArray.toString(CryptoJS.enc.Utf8);
           */
          toString: function(encoder) {
            return (encoder || Hex).stringify(this);
          },
          /**
           * Concatenates a word array to this word array.
           *
           * @param {WordArray} wordArray The word array to append.
           *
           * @return {WordArray} This word array.
           *
           * @example
           *
           *     wordArray1.concat(wordArray2);
           */
          concat: function(wordArray) {
            var thisWords = this.words;
            var thatWords = wordArray.words;
            var thisSigBytes = this.sigBytes;
            var thatSigBytes = wordArray.sigBytes;
            this.clamp();
            if (thisSigBytes % 4) {
              for (var i = 0; i < thatSigBytes; i++) {
                var thatByte = thatWords[i >>> 2] >>> 24 - i % 4 * 8 & 255;
                thisWords[thisSigBytes + i >>> 2] |= thatByte << 24 - (thisSigBytes + i) % 4 * 8;
              }
            } else {
              for (var j = 0; j < thatSigBytes; j += 4) {
                thisWords[thisSigBytes + j >>> 2] = thatWords[j >>> 2];
              }
            }
            this.sigBytes += thatSigBytes;
            return this;
          },
          /**
           * Removes insignificant bits.
           *
           * @example
           *
           *     wordArray.clamp();
           */
          clamp: function() {
            var words = this.words;
            var sigBytes = this.sigBytes;
            words[sigBytes >>> 2] &= 4294967295 << 32 - sigBytes % 4 * 8;
            words.length = Math2.ceil(sigBytes / 4);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {WordArray} The clone.
           *
           * @example
           *
           *     var clone = wordArray.clone();
           */
          clone: function() {
            var clone = Base.clone.call(this);
            clone.words = this.words.slice(0);
            return clone;
          },
          /**
           * Creates a word array filled with random bytes.
           *
           * @param {number} nBytes The number of random bytes to generate.
           *
           * @return {WordArray} The random word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.lib.WordArray.random(16);
           */
          random: function(nBytes) {
            var words = [];
            for (var i = 0; i < nBytes; i += 4) {
              words.push(cryptoSecureRandomInt());
            }
            return new WordArray.init(words, nBytes);
          }
        });
        var C_enc = C.enc = {};
        var Hex = C_enc.Hex = {
          /**
           * Converts a word array to a hex string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The hex string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var hexChars = [];
            for (var i = 0; i < sigBytes; i++) {
              var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              hexChars.push((bite >>> 4).toString(16));
              hexChars.push((bite & 15).toString(16));
            }
            return hexChars.join("");
          },
          /**
           * Converts a hex string to a word array.
           *
           * @param {string} hexStr The hex string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
           */
          parse: function(hexStr) {
            var hexStrLength = hexStr.length;
            var words = [];
            for (var i = 0; i < hexStrLength; i += 2) {
              words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << 24 - i % 8 * 4;
            }
            return new WordArray.init(words, hexStrLength / 2);
          }
        };
        var Latin1 = C_enc.Latin1 = {
          /**
           * Converts a word array to a Latin1 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Latin1 string.
           *
           * @static
           *
           * @example
           *
           *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var latin1Chars = [];
            for (var i = 0; i < sigBytes; i++) {
              var bite = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              latin1Chars.push(String.fromCharCode(bite));
            }
            return latin1Chars.join("");
          },
          /**
           * Converts a Latin1 string to a word array.
           *
           * @param {string} latin1Str The Latin1 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
           */
          parse: function(latin1Str) {
            var latin1StrLength = latin1Str.length;
            var words = [];
            for (var i = 0; i < latin1StrLength; i++) {
              words[i >>> 2] |= (latin1Str.charCodeAt(i) & 255) << 24 - i % 4 * 8;
            }
            return new WordArray.init(words, latin1StrLength);
          }
        };
        var Utf8 = C_enc.Utf8 = {
          /**
           * Converts a word array to a UTF-8 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-8 string.
           *
           * @static
           *
           * @example
           *
           *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
           */
          stringify: function(wordArray) {
            try {
              return decodeURIComponent(escape(Latin1.stringify(wordArray)));
            } catch (e) {
              throw new Error("Malformed UTF-8 data");
            }
          },
          /**
           * Converts a UTF-8 string to a word array.
           *
           * @param {string} utf8Str The UTF-8 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
           */
          parse: function(utf8Str) {
            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
          }
        };
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
          /**
           * Resets this block algorithm's data buffer to its initial state.
           *
           * @example
           *
           *     bufferedBlockAlgorithm.reset();
           */
          reset: function() {
            this._data = new WordArray.init();
            this._nDataBytes = 0;
          },
          /**
           * Adds new data to this block algorithm's buffer.
           *
           * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
           *
           * @example
           *
           *     bufferedBlockAlgorithm._append('data');
           *     bufferedBlockAlgorithm._append(wordArray);
           */
          _append: function(data) {
            if (typeof data == "string") {
              data = Utf8.parse(data);
            }
            this._data.concat(data);
            this._nDataBytes += data.sigBytes;
          },
          /**
           * Processes available data blocks.
           *
           * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
           *
           * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
           *
           * @return {WordArray} The processed data.
           *
           * @example
           *
           *     var processedData = bufferedBlockAlgorithm._process();
           *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
           */
          _process: function(doFlush) {
            var processedWords;
            var data = this._data;
            var dataWords = data.words;
            var dataSigBytes = data.sigBytes;
            var blockSize = this.blockSize;
            var blockSizeBytes = blockSize * 4;
            var nBlocksReady = dataSigBytes / blockSizeBytes;
            if (doFlush) {
              nBlocksReady = Math2.ceil(nBlocksReady);
            } else {
              nBlocksReady = Math2.max((nBlocksReady | 0) - this._minBufferSize, 0);
            }
            var nWordsReady = nBlocksReady * blockSize;
            var nBytesReady = Math2.min(nWordsReady * 4, dataSigBytes);
            if (nWordsReady) {
              for (var offset = 0; offset < nWordsReady; offset += blockSize) {
                this._doProcessBlock(dataWords, offset);
              }
              processedWords = dataWords.splice(0, nWordsReady);
              data.sigBytes -= nBytesReady;
            }
            return new WordArray.init(processedWords, nBytesReady);
          },
          /**
           * Creates a copy of this object.
           *
           * @return {Object} The clone.
           *
           * @example
           *
           *     var clone = bufferedBlockAlgorithm.clone();
           */
          clone: function() {
            var clone = Base.clone.call(this);
            clone._data = this._data.clone();
            return clone;
          },
          _minBufferSize: 0
        });
        var Hasher = C_lib.Hasher = BufferedBlockAlgorithm.extend({
          /**
           * Configuration options.
           */
          cfg: Base.extend(),
          /**
           * Initializes a newly created hasher.
           *
           * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
           *
           * @example
           *
           *     var hasher = CryptoJS.algo.SHA256.create();
           */
          init: function(cfg) {
            this.cfg = this.cfg.extend(cfg);
            this.reset();
          },
          /**
           * Resets this hasher to its initial state.
           *
           * @example
           *
           *     hasher.reset();
           */
          reset: function() {
            BufferedBlockAlgorithm.reset.call(this);
            this._doReset();
          },
          /**
           * Updates this hasher with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {Hasher} This hasher.
           *
           * @example
           *
           *     hasher.update('message');
           *     hasher.update(wordArray);
           */
          update: function(messageUpdate) {
            this._append(messageUpdate);
            this._process();
            return this;
          },
          /**
           * Finalizes the hash computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The hash.
           *
           * @example
           *
           *     var hash = hasher.finalize();
           *     var hash = hasher.finalize('message');
           *     var hash = hasher.finalize(wordArray);
           */
          finalize: function(messageUpdate) {
            if (messageUpdate) {
              this._append(messageUpdate);
            }
            var hash = this._doFinalize();
            return hash;
          },
          blockSize: 512 / 32,
          /**
           * Creates a shortcut function to a hasher's object interface.
           *
           * @param {Hasher} hasher The hasher to create a helper for.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
           */
          _createHelper: function(hasher) {
            return function(message, cfg) {
              return new hasher.init(cfg).finalize(message);
            };
          },
          /**
           * Creates a shortcut function to the HMAC's object interface.
           *
           * @param {Hasher} hasher The hasher to use in this HMAC helper.
           *
           * @return {Function} The shortcut function.
           *
           * @static
           *
           * @example
           *
           *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
           */
          _createHmacHelper: function(hasher) {
            return function(message, key) {
              return new C_algo.HMAC.init(hasher, key).finalize(message);
            };
          }
        });
        var C_algo = C.algo = {};
        return C;
      })(Math);
      return CryptoJS2;
    });
  }
});

// node_modules/crypto-js/x64-core.js
var require_x64_core = __commonJS({
  "node_modules/crypto-js/x64-core.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function(undefined2) {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var X32WordArray = C_lib.WordArray;
        var C_x64 = C.x64 = {};
        var X64Word = C_x64.Word = Base.extend({
          /**
           * Initializes a newly created 64-bit word.
           *
           * @param {number} high The high 32 bits.
           * @param {number} low The low 32 bits.
           *
           * @example
           *
           *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
           */
          init: function(high, low) {
            this.high = high;
            this.low = low;
          }
          /**
           * Bitwise NOTs this word.
           *
           * @return {X64Word} A new x64-Word object after negating.
           *
           * @example
           *
           *     var negated = x64Word.not();
           */
          // not: function () {
          // var high = ~this.high;
          // var low = ~this.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ANDs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to AND with this word.
           *
           * @return {X64Word} A new x64-Word object after ANDing.
           *
           * @example
           *
           *     var anded = x64Word.and(anotherX64Word);
           */
          // and: function (word) {
          // var high = this.high & word.high;
          // var low = this.low & word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise ORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to OR with this word.
           *
           * @return {X64Word} A new x64-Word object after ORing.
           *
           * @example
           *
           *     var ored = x64Word.or(anotherX64Word);
           */
          // or: function (word) {
          // var high = this.high | word.high;
          // var low = this.low | word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Bitwise XORs this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to XOR with this word.
           *
           * @return {X64Word} A new x64-Word object after XORing.
           *
           * @example
           *
           *     var xored = x64Word.xor(anotherX64Word);
           */
          // xor: function (word) {
          // var high = this.high ^ word.high;
          // var low = this.low ^ word.low;
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the left.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftL(25);
           */
          // shiftL: function (n) {
          // if (n < 32) {
          // var high = (this.high << n) | (this.low >>> (32 - n));
          // var low = this.low << n;
          // } else {
          // var high = this.low << (n - 32);
          // var low = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Shifts this word n bits to the right.
           *
           * @param {number} n The number of bits to shift.
           *
           * @return {X64Word} A new x64-Word object after shifting.
           *
           * @example
           *
           *     var shifted = x64Word.shiftR(7);
           */
          // shiftR: function (n) {
          // if (n < 32) {
          // var low = (this.low >>> n) | (this.high << (32 - n));
          // var high = this.high >>> n;
          // } else {
          // var low = this.high >>> (n - 32);
          // var high = 0;
          // }
          // return X64Word.create(high, low);
          // },
          /**
           * Rotates this word n bits to the left.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotL(25);
           */
          // rotL: function (n) {
          // return this.shiftL(n).or(this.shiftR(64 - n));
          // },
          /**
           * Rotates this word n bits to the right.
           *
           * @param {number} n The number of bits to rotate.
           *
           * @return {X64Word} A new x64-Word object after rotating.
           *
           * @example
           *
           *     var rotated = x64Word.rotR(7);
           */
          // rotR: function (n) {
          // return this.shiftR(n).or(this.shiftL(64 - n));
          // },
          /**
           * Adds this word with the passed word.
           *
           * @param {X64Word} word The x64-Word to add with this word.
           *
           * @return {X64Word} A new x64-Word object after adding.
           *
           * @example
           *
           *     var added = x64Word.add(anotherX64Word);
           */
          // add: function (word) {
          // var low = (this.low + word.low) | 0;
          // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
          // var high = (this.high + word.high + carry) | 0;
          // return X64Word.create(high, low);
          // }
        });
        var X64WordArray = C_x64.WordArray = Base.extend({
          /**
           * Initializes a newly created word array.
           *
           * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
           * @param {number} sigBytes (Optional) The number of significant bytes in the words.
           *
           * @example
           *
           *     var wordArray = CryptoJS.x64.WordArray.create();
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ]);
           *
           *     var wordArray = CryptoJS.x64.WordArray.create([
           *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
           *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
           *     ], 10);
           */
          init: function(words, sigBytes) {
            words = this.words = words || [];
            if (sigBytes != undefined2) {
              this.sigBytes = sigBytes;
            } else {
              this.sigBytes = words.length * 8;
            }
          },
          /**
           * Converts this 64-bit word array to a 32-bit word array.
           *
           * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
           *
           * @example
           *
           *     var x32WordArray = x64WordArray.toX32();
           */
          toX32: function() {
            var x64Words = this.words;
            var x64WordsLength = x64Words.length;
            var x32Words = [];
            for (var i = 0; i < x64WordsLength; i++) {
              var x64Word = x64Words[i];
              x32Words.push(x64Word.high);
              x32Words.push(x64Word.low);
            }
            return X32WordArray.create(x32Words, this.sigBytes);
          },
          /**
           * Creates a copy of this word array.
           *
           * @return {X64WordArray} The clone.
           *
           * @example
           *
           *     var clone = x64WordArray.clone();
           */
          clone: function() {
            var clone = Base.clone.call(this);
            var words = clone.words = this.words.slice(0);
            var wordsLength = words.length;
            for (var i = 0; i < wordsLength; i++) {
              words[i] = words[i].clone();
            }
            return clone;
          }
        });
      })();
      return CryptoJS2;
    });
  }
});

// node_modules/crypto-js/lib-typedarrays.js
var require_lib_typedarrays = __commonJS({
  "node_modules/crypto-js/lib-typedarrays.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        if (typeof ArrayBuffer != "function") {
          return;
        }
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var superInit = WordArray.init;
        var subInit = WordArray.init = function(typedArray) {
          if (typedArray instanceof ArrayBuffer) {
            typedArray = new Uint8Array(typedArray);
          }
          if (typedArray instanceof Int8Array || typeof Uint8ClampedArray !== "undefined" && typedArray instanceof Uint8ClampedArray || typedArray instanceof Int16Array || typedArray instanceof Uint16Array || typedArray instanceof Int32Array || typedArray instanceof Uint32Array || typedArray instanceof Float32Array || typedArray instanceof Float64Array) {
            typedArray = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
          }
          if (typedArray instanceof Uint8Array) {
            var typedArrayByteLength = typedArray.byteLength;
            var words = [];
            for (var i = 0; i < typedArrayByteLength; i++) {
              words[i >>> 2] |= typedArray[i] << 24 - i % 4 * 8;
            }
            superInit.call(this, words, typedArrayByteLength);
          } else {
            superInit.apply(this, arguments);
          }
        };
        subInit.prototype = WordArray;
      })();
      return CryptoJS2.lib.WordArray;
    });
  }
});

// node_modules/crypto-js/enc-utf16.js
var require_enc_utf16 = __commonJS({
  "node_modules/crypto-js/enc-utf16.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Utf16BE = C_enc.Utf16 = C_enc.Utf16BE = {
          /**
           * Converts a word array to a UTF-16 BE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 BE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16String = CryptoJS.enc.Utf16.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var utf16Chars = [];
            for (var i = 0; i < sigBytes; i += 2) {
              var codePoint = words[i >>> 2] >>> 16 - i % 4 * 8 & 65535;
              utf16Chars.push(String.fromCharCode(codePoint));
            }
            return utf16Chars.join("");
          },
          /**
           * Converts a UTF-16 BE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 BE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16.parse(utf16String);
           */
          parse: function(utf16Str) {
            var utf16StrLength = utf16Str.length;
            var words = [];
            for (var i = 0; i < utf16StrLength; i++) {
              words[i >>> 1] |= utf16Str.charCodeAt(i) << 16 - i % 2 * 16;
            }
            return WordArray.create(words, utf16StrLength * 2);
          }
        };
        C_enc.Utf16LE = {
          /**
           * Converts a word array to a UTF-16 LE string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The UTF-16 LE string.
           *
           * @static
           *
           * @example
           *
           *     var utf16Str = CryptoJS.enc.Utf16LE.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var utf16Chars = [];
            for (var i = 0; i < sigBytes; i += 2) {
              var codePoint = swapEndian(words[i >>> 2] >>> 16 - i % 4 * 8 & 65535);
              utf16Chars.push(String.fromCharCode(codePoint));
            }
            return utf16Chars.join("");
          },
          /**
           * Converts a UTF-16 LE string to a word array.
           *
           * @param {string} utf16Str The UTF-16 LE string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Utf16LE.parse(utf16Str);
           */
          parse: function(utf16Str) {
            var utf16StrLength = utf16Str.length;
            var words = [];
            for (var i = 0; i < utf16StrLength; i++) {
              words[i >>> 1] |= swapEndian(utf16Str.charCodeAt(i) << 16 - i % 2 * 16);
            }
            return WordArray.create(words, utf16StrLength * 2);
          }
        };
        function swapEndian(word) {
          return word << 8 & 4278255360 | word >>> 8 & 16711935;
        }
      })();
      return CryptoJS2.enc.Utf16;
    });
  }
});

// node_modules/crypto-js/enc-base64.js
var require_enc_base64 = __commonJS({
  "node_modules/crypto-js/enc-base64.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Base64 = C_enc.Base64 = {
          /**
           * Converts a word array to a Base64 string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @return {string} The Base64 string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
           */
          stringify: function(wordArray) {
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = this._map;
            wordArray.clamp();
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
              var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
              var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
              var triplet = byte1 << 16 | byte2 << 8 | byte3;
              for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
                base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              while (base64Chars.length % 4) {
                base64Chars.push(paddingChar);
              }
            }
            return base64Chars.join("");
          },
          /**
           * Converts a Base64 string to a word array.
           *
           * @param {string} base64Str The Base64 string.
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
           */
          parse: function(base64Str) {
            var base64StrLength = base64Str.length;
            var map = this._map;
            var reverseMap = this._reverseMap;
            if (!reverseMap) {
              reverseMap = this._reverseMap = [];
              for (var j = 0; j < map.length; j++) {
                reverseMap[map.charCodeAt(j)] = j;
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              var paddingIndex = base64Str.indexOf(paddingChar);
              if (paddingIndex !== -1) {
                base64StrLength = paddingIndex;
              }
            }
            return parseLoop(base64Str, base64StrLength, reverseMap);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        };
        function parseLoop(base64Str, base64StrLength, reverseMap) {
          var words = [];
          var nBytes = 0;
          for (var i = 0; i < base64StrLength; i++) {
            if (i % 4) {
              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << i % 4 * 2;
              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> 6 - i % 4 * 2;
              var bitsCombined = bits1 | bits2;
              words[nBytes >>> 2] |= bitsCombined << 24 - nBytes % 4 * 8;
              nBytes++;
            }
          }
          return WordArray.create(words, nBytes);
        }
      })();
      return CryptoJS2.enc.Base64;
    });
  }
});

// node_modules/crypto-js/enc-base64url.js
var require_enc_base64url = __commonJS({
  "node_modules/crypto-js/enc-base64url.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_enc = C.enc;
        var Base64url = C_enc.Base64url = {
          /**
           * Converts a word array to a Base64url string.
           *
           * @param {WordArray} wordArray The word array.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {string} The Base64url string.
           *
           * @static
           *
           * @example
           *
           *     var base64String = CryptoJS.enc.Base64url.stringify(wordArray);
           */
          stringify: function(wordArray, urlSafe) {
            if (urlSafe === void 0) {
              urlSafe = true;
            }
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;
            var map = urlSafe ? this._safe_map : this._map;
            wordArray.clamp();
            var base64Chars = [];
            for (var i = 0; i < sigBytes; i += 3) {
              var byte1 = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
              var byte2 = words[i + 1 >>> 2] >>> 24 - (i + 1) % 4 * 8 & 255;
              var byte3 = words[i + 2 >>> 2] >>> 24 - (i + 2) % 4 * 8 & 255;
              var triplet = byte1 << 16 | byte2 << 8 | byte3;
              for (var j = 0; j < 4 && i + j * 0.75 < sigBytes; j++) {
                base64Chars.push(map.charAt(triplet >>> 6 * (3 - j) & 63));
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              while (base64Chars.length % 4) {
                base64Chars.push(paddingChar);
              }
            }
            return base64Chars.join("");
          },
          /**
           * Converts a Base64url string to a word array.
           *
           * @param {string} base64Str The Base64url string.
           *
           * @param {boolean} urlSafe Whether to use url safe
           *
           * @return {WordArray} The word array.
           *
           * @static
           *
           * @example
           *
           *     var wordArray = CryptoJS.enc.Base64url.parse(base64String);
           */
          parse: function(base64Str, urlSafe) {
            if (urlSafe === void 0) {
              urlSafe = true;
            }
            var base64StrLength = base64Str.length;
            var map = urlSafe ? this._safe_map : this._map;
            var reverseMap = this._reverseMap;
            if (!reverseMap) {
              reverseMap = this._reverseMap = [];
              for (var j = 0; j < map.length; j++) {
                reverseMap[map.charCodeAt(j)] = j;
              }
            }
            var paddingChar = map.charAt(64);
            if (paddingChar) {
              var paddingIndex = base64Str.indexOf(paddingChar);
              if (paddingIndex !== -1) {
                base64StrLength = paddingIndex;
              }
            }
            return parseLoop(base64Str, base64StrLength, reverseMap);
          },
          _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
          _safe_map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
        };
        function parseLoop(base64Str, base64StrLength, reverseMap) {
          var words = [];
          var nBytes = 0;
          for (var i = 0; i < base64StrLength; i++) {
            if (i % 4) {
              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << i % 4 * 2;
              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> 6 - i % 4 * 2;
              var bitsCombined = bits1 | bits2;
              words[nBytes >>> 2] |= bitsCombined << 24 - nBytes % 4 * 8;
              nBytes++;
            }
          }
          return WordArray.create(words, nBytes);
        }
      })();
      return CryptoJS2.enc.Base64url;
    });
  }
});

// node_modules/crypto-js/md5.js
var require_md5 = __commonJS({
  "node_modules/crypto-js/md5.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function(Math2) {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var T = [];
        (function() {
          for (var i = 0; i < 64; i++) {
            T[i] = Math2.abs(Math2.sin(i + 1)) * 4294967296 | 0;
          }
        })();
        var MD5 = C_algo.MD5 = Hasher.extend({
          _doReset: function() {
            this._hash = new WordArray.init([
              1732584193,
              4023233417,
              2562383102,
              271733878
            ]);
          },
          _doProcessBlock: function(M, offset) {
            for (var i = 0; i < 16; i++) {
              var offset_i = offset + i;
              var M_offset_i = M[offset_i];
              M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
            }
            var H = this._hash.words;
            var M_offset_0 = M[offset + 0];
            var M_offset_1 = M[offset + 1];
            var M_offset_2 = M[offset + 2];
            var M_offset_3 = M[offset + 3];
            var M_offset_4 = M[offset + 4];
            var M_offset_5 = M[offset + 5];
            var M_offset_6 = M[offset + 6];
            var M_offset_7 = M[offset + 7];
            var M_offset_8 = M[offset + 8];
            var M_offset_9 = M[offset + 9];
            var M_offset_10 = M[offset + 10];
            var M_offset_11 = M[offset + 11];
            var M_offset_12 = M[offset + 12];
            var M_offset_13 = M[offset + 13];
            var M_offset_14 = M[offset + 14];
            var M_offset_15 = M[offset + 15];
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            a = FF(a, b, c, d, M_offset_0, 7, T[0]);
            d = FF(d, a, b, c, M_offset_1, 12, T[1]);
            c = FF(c, d, a, b, M_offset_2, 17, T[2]);
            b = FF(b, c, d, a, M_offset_3, 22, T[3]);
            a = FF(a, b, c, d, M_offset_4, 7, T[4]);
            d = FF(d, a, b, c, M_offset_5, 12, T[5]);
            c = FF(c, d, a, b, M_offset_6, 17, T[6]);
            b = FF(b, c, d, a, M_offset_7, 22, T[7]);
            a = FF(a, b, c, d, M_offset_8, 7, T[8]);
            d = FF(d, a, b, c, M_offset_9, 12, T[9]);
            c = FF(c, d, a, b, M_offset_10, 17, T[10]);
            b = FF(b, c, d, a, M_offset_11, 22, T[11]);
            a = FF(a, b, c, d, M_offset_12, 7, T[12]);
            d = FF(d, a, b, c, M_offset_13, 12, T[13]);
            c = FF(c, d, a, b, M_offset_14, 17, T[14]);
            b = FF(b, c, d, a, M_offset_15, 22, T[15]);
            a = GG(a, b, c, d, M_offset_1, 5, T[16]);
            d = GG(d, a, b, c, M_offset_6, 9, T[17]);
            c = GG(c, d, a, b, M_offset_11, 14, T[18]);
            b = GG(b, c, d, a, M_offset_0, 20, T[19]);
            a = GG(a, b, c, d, M_offset_5, 5, T[20]);
            d = GG(d, a, b, c, M_offset_10, 9, T[21]);
            c = GG(c, d, a, b, M_offset_15, 14, T[22]);
            b = GG(b, c, d, a, M_offset_4, 20, T[23]);
            a = GG(a, b, c, d, M_offset_9, 5, T[24]);
            d = GG(d, a, b, c, M_offset_14, 9, T[25]);
            c = GG(c, d, a, b, M_offset_3, 14, T[26]);
            b = GG(b, c, d, a, M_offset_8, 20, T[27]);
            a = GG(a, b, c, d, M_offset_13, 5, T[28]);
            d = GG(d, a, b, c, M_offset_2, 9, T[29]);
            c = GG(c, d, a, b, M_offset_7, 14, T[30]);
            b = GG(b, c, d, a, M_offset_12, 20, T[31]);
            a = HH(a, b, c, d, M_offset_5, 4, T[32]);
            d = HH(d, a, b, c, M_offset_8, 11, T[33]);
            c = HH(c, d, a, b, M_offset_11, 16, T[34]);
            b = HH(b, c, d, a, M_offset_14, 23, T[35]);
            a = HH(a, b, c, d, M_offset_1, 4, T[36]);
            d = HH(d, a, b, c, M_offset_4, 11, T[37]);
            c = HH(c, d, a, b, M_offset_7, 16, T[38]);
            b = HH(b, c, d, a, M_offset_10, 23, T[39]);
            a = HH(a, b, c, d, M_offset_13, 4, T[40]);
            d = HH(d, a, b, c, M_offset_0, 11, T[41]);
            c = HH(c, d, a, b, M_offset_3, 16, T[42]);
            b = HH(b, c, d, a, M_offset_6, 23, T[43]);
            a = HH(a, b, c, d, M_offset_9, 4, T[44]);
            d = HH(d, a, b, c, M_offset_12, 11, T[45]);
            c = HH(c, d, a, b, M_offset_15, 16, T[46]);
            b = HH(b, c, d, a, M_offset_2, 23, T[47]);
            a = II(a, b, c, d, M_offset_0, 6, T[48]);
            d = II(d, a, b, c, M_offset_7, 10, T[49]);
            c = II(c, d, a, b, M_offset_14, 15, T[50]);
            b = II(b, c, d, a, M_offset_5, 21, T[51]);
            a = II(a, b, c, d, M_offset_12, 6, T[52]);
            d = II(d, a, b, c, M_offset_3, 10, T[53]);
            c = II(c, d, a, b, M_offset_10, 15, T[54]);
            b = II(b, c, d, a, M_offset_1, 21, T[55]);
            a = II(a, b, c, d, M_offset_8, 6, T[56]);
            d = II(d, a, b, c, M_offset_15, 10, T[57]);
            c = II(c, d, a, b, M_offset_6, 15, T[58]);
            b = II(b, c, d, a, M_offset_13, 21, T[59]);
            a = II(a, b, c, d, M_offset_4, 6, T[60]);
            d = II(d, a, b, c, M_offset_11, 10, T[61]);
            c = II(c, d, a, b, M_offset_2, 15, T[62]);
            b = II(b, c, d, a, M_offset_9, 21, T[63]);
            H[0] = H[0] + a | 0;
            H[1] = H[1] + b | 0;
            H[2] = H[2] + c | 0;
            H[3] = H[3] + d | 0;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            var nBitsTotalH = Math2.floor(nBitsTotal / 4294967296);
            var nBitsTotalL = nBitsTotal;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = (nBitsTotalH << 8 | nBitsTotalH >>> 24) & 16711935 | (nBitsTotalH << 24 | nBitsTotalH >>> 8) & 4278255360;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotalL << 8 | nBitsTotalL >>> 24) & 16711935 | (nBitsTotalL << 24 | nBitsTotalL >>> 8) & 4278255360;
            data.sigBytes = (dataWords.length + 1) * 4;
            this._process();
            var hash = this._hash;
            var H = hash.words;
            for (var i = 0; i < 4; i++) {
              var H_i = H[i];
              H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
            }
            return hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        function FF(a, b, c, d, x, s, t) {
          var n = a + (b & c | ~b & d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function GG(a, b, c, d, x, s, t) {
          var n = a + (b & d | c & ~d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function HH(a, b, c, d, x, s, t) {
          var n = a + (b ^ c ^ d) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        function II(a, b, c, d, x, s, t) {
          var n = a + (c ^ (b | ~d)) + x + t;
          return (n << s | n >>> 32 - s) + b;
        }
        C.MD5 = Hasher._createHelper(MD5);
        C.HmacMD5 = Hasher._createHmacHelper(MD5);
      })(Math);
      return CryptoJS2.MD5;
    });
  }
});

// node_modules/crypto-js/sha1.js
var require_sha1 = __commonJS({
  "node_modules/crypto-js/sha1.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var W = [];
        var SHA1 = C_algo.SHA1 = Hasher.extend({
          _doReset: function() {
            this._hash = new WordArray.init([
              1732584193,
              4023233417,
              2562383102,
              271733878,
              3285377520
            ]);
          },
          _doProcessBlock: function(M, offset) {
            var H = this._hash.words;
            var a = H[0];
            var b = H[1];
            var c = H[2];
            var d = H[3];
            var e = H[4];
            for (var i = 0; i < 80; i++) {
              if (i < 16) {
                W[i] = M[offset + i] | 0;
              } else {
                var n = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
                W[i] = n << 1 | n >>> 31;
              }
              var t = (a << 5 | a >>> 27) + e + W[i];
              if (i < 20) {
                t += (b & c | ~b & d) + 1518500249;
              } else if (i < 40) {
                t += (b ^ c ^ d) + 1859775393;
              } else if (i < 60) {
                t += (b & c | b & d | c & d) - 1894007588;
              } else {
                t += (b ^ c ^ d) - 899497514;
              }
              e = d;
              d = c;
              c = b << 30 | b >>> 2;
              b = a;
              a = t;
            }
            H[0] = H[0] + a | 0;
            H[1] = H[1] + b | 0;
            H[2] = H[2] + c | 0;
            H[3] = H[3] + d | 0;
            H[4] = H[4] + e | 0;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            return this._hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        C.SHA1 = Hasher._createHelper(SHA1);
        C.HmacSHA1 = Hasher._createHmacHelper(SHA1);
      })();
      return CryptoJS2.SHA1;
    });
  }
});

// node_modules/crypto-js/sha256.js
var require_sha256 = __commonJS({
  "node_modules/crypto-js/sha256.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function(Math2) {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var H = [];
        var K = [];
        (function() {
          function isPrime(n2) {
            var sqrtN = Math2.sqrt(n2);
            for (var factor = 2; factor <= sqrtN; factor++) {
              if (!(n2 % factor)) {
                return false;
              }
            }
            return true;
          }
          function getFractionalBits(n2) {
            return (n2 - (n2 | 0)) * 4294967296 | 0;
          }
          var n = 2;
          var nPrime = 0;
          while (nPrime < 64) {
            if (isPrime(n)) {
              if (nPrime < 8) {
                H[nPrime] = getFractionalBits(Math2.pow(n, 1 / 2));
              }
              K[nPrime] = getFractionalBits(Math2.pow(n, 1 / 3));
              nPrime++;
            }
            n++;
          }
        })();
        var W = [];
        var SHA256 = C_algo.SHA256 = Hasher.extend({
          _doReset: function() {
            this._hash = new WordArray.init(H.slice(0));
          },
          _doProcessBlock: function(M, offset) {
            var H2 = this._hash.words;
            var a = H2[0];
            var b = H2[1];
            var c = H2[2];
            var d = H2[3];
            var e = H2[4];
            var f = H2[5];
            var g = H2[6];
            var h = H2[7];
            for (var i = 0; i < 64; i++) {
              if (i < 16) {
                W[i] = M[offset + i] | 0;
              } else {
                var gamma0x = W[i - 15];
                var gamma0 = (gamma0x << 25 | gamma0x >>> 7) ^ (gamma0x << 14 | gamma0x >>> 18) ^ gamma0x >>> 3;
                var gamma1x = W[i - 2];
                var gamma1 = (gamma1x << 15 | gamma1x >>> 17) ^ (gamma1x << 13 | gamma1x >>> 19) ^ gamma1x >>> 10;
                W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
              }
              var ch = e & f ^ ~e & g;
              var maj = a & b ^ a & c ^ b & c;
              var sigma0 = (a << 30 | a >>> 2) ^ (a << 19 | a >>> 13) ^ (a << 10 | a >>> 22);
              var sigma1 = (e << 26 | e >>> 6) ^ (e << 21 | e >>> 11) ^ (e << 7 | e >>> 25);
              var t1 = h + sigma1 + ch + K[i] + W[i];
              var t2 = sigma0 + maj;
              h = g;
              g = f;
              f = e;
              e = d + t1 | 0;
              d = c;
              c = b;
              b = a;
              a = t1 + t2 | 0;
            }
            H2[0] = H2[0] + a | 0;
            H2[1] = H2[1] + b | 0;
            H2[2] = H2[2] + c | 0;
            H2[3] = H2[3] + d | 0;
            H2[4] = H2[4] + e | 0;
            H2[5] = H2[5] + f | 0;
            H2[6] = H2[6] + g | 0;
            H2[7] = H2[7] + h | 0;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = Math2.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 15] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            return this._hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        C.SHA256 = Hasher._createHelper(SHA256);
        C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
      })(Math);
      return CryptoJS2.SHA256;
    });
  }
});

// node_modules/crypto-js/sha224.js
var require_sha224 = __commonJS({
  "node_modules/crypto-js/sha224.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_sha256());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha256"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var SHA256 = C_algo.SHA256;
        var SHA224 = C_algo.SHA224 = SHA256.extend({
          _doReset: function() {
            this._hash = new WordArray.init([
              3238371032,
              914150663,
              812702999,
              4144912697,
              4290775857,
              1750603025,
              1694076839,
              3204075428
            ]);
          },
          _doFinalize: function() {
            var hash = SHA256._doFinalize.call(this);
            hash.sigBytes -= 4;
            return hash;
          }
        });
        C.SHA224 = SHA256._createHelper(SHA224);
        C.HmacSHA224 = SHA256._createHmacHelper(SHA224);
      })();
      return CryptoJS2.SHA224;
    });
  }
});

// node_modules/crypto-js/sha512.js
var require_sha512 = __commonJS({
  "node_modules/crypto-js/sha512.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_x64_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var Hasher = C_lib.Hasher;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var X64WordArray = C_x64.WordArray;
        var C_algo = C.algo;
        function X64Word_create() {
          return X64Word.create.apply(X64Word, arguments);
        }
        var K = [
          X64Word_create(1116352408, 3609767458),
          X64Word_create(1899447441, 602891725),
          X64Word_create(3049323471, 3964484399),
          X64Word_create(3921009573, 2173295548),
          X64Word_create(961987163, 4081628472),
          X64Word_create(1508970993, 3053834265),
          X64Word_create(2453635748, 2937671579),
          X64Word_create(2870763221, 3664609560),
          X64Word_create(3624381080, 2734883394),
          X64Word_create(310598401, 1164996542),
          X64Word_create(607225278, 1323610764),
          X64Word_create(1426881987, 3590304994),
          X64Word_create(1925078388, 4068182383),
          X64Word_create(2162078206, 991336113),
          X64Word_create(2614888103, 633803317),
          X64Word_create(3248222580, 3479774868),
          X64Word_create(3835390401, 2666613458),
          X64Word_create(4022224774, 944711139),
          X64Word_create(264347078, 2341262773),
          X64Word_create(604807628, 2007800933),
          X64Word_create(770255983, 1495990901),
          X64Word_create(1249150122, 1856431235),
          X64Word_create(1555081692, 3175218132),
          X64Word_create(1996064986, 2198950837),
          X64Word_create(2554220882, 3999719339),
          X64Word_create(2821834349, 766784016),
          X64Word_create(2952996808, 2566594879),
          X64Word_create(3210313671, 3203337956),
          X64Word_create(3336571891, 1034457026),
          X64Word_create(3584528711, 2466948901),
          X64Word_create(113926993, 3758326383),
          X64Word_create(338241895, 168717936),
          X64Word_create(666307205, 1188179964),
          X64Word_create(773529912, 1546045734),
          X64Word_create(1294757372, 1522805485),
          X64Word_create(1396182291, 2643833823),
          X64Word_create(1695183700, 2343527390),
          X64Word_create(1986661051, 1014477480),
          X64Word_create(2177026350, 1206759142),
          X64Word_create(2456956037, 344077627),
          X64Word_create(2730485921, 1290863460),
          X64Word_create(2820302411, 3158454273),
          X64Word_create(3259730800, 3505952657),
          X64Word_create(3345764771, 106217008),
          X64Word_create(3516065817, 3606008344),
          X64Word_create(3600352804, 1432725776),
          X64Word_create(4094571909, 1467031594),
          X64Word_create(275423344, 851169720),
          X64Word_create(430227734, 3100823752),
          X64Word_create(506948616, 1363258195),
          X64Word_create(659060556, 3750685593),
          X64Word_create(883997877, 3785050280),
          X64Word_create(958139571, 3318307427),
          X64Word_create(1322822218, 3812723403),
          X64Word_create(1537002063, 2003034995),
          X64Word_create(1747873779, 3602036899),
          X64Word_create(1955562222, 1575990012),
          X64Word_create(2024104815, 1125592928),
          X64Word_create(2227730452, 2716904306),
          X64Word_create(2361852424, 442776044),
          X64Word_create(2428436474, 593698344),
          X64Word_create(2756734187, 3733110249),
          X64Word_create(3204031479, 2999351573),
          X64Word_create(3329325298, 3815920427),
          X64Word_create(3391569614, 3928383900),
          X64Word_create(3515267271, 566280711),
          X64Word_create(3940187606, 3454069534),
          X64Word_create(4118630271, 4000239992),
          X64Word_create(116418474, 1914138554),
          X64Word_create(174292421, 2731055270),
          X64Word_create(289380356, 3203993006),
          X64Word_create(460393269, 320620315),
          X64Word_create(685471733, 587496836),
          X64Word_create(852142971, 1086792851),
          X64Word_create(1017036298, 365543100),
          X64Word_create(1126000580, 2618297676),
          X64Word_create(1288033470, 3409855158),
          X64Word_create(1501505948, 4234509866),
          X64Word_create(1607167915, 987167468),
          X64Word_create(1816402316, 1246189591)
        ];
        var W = [];
        (function() {
          for (var i = 0; i < 80; i++) {
            W[i] = X64Word_create();
          }
        })();
        var SHA512 = C_algo.SHA512 = Hasher.extend({
          _doReset: function() {
            this._hash = new X64WordArray.init([
              new X64Word.init(1779033703, 4089235720),
              new X64Word.init(3144134277, 2227873595),
              new X64Word.init(1013904242, 4271175723),
              new X64Word.init(2773480762, 1595750129),
              new X64Word.init(1359893119, 2917565137),
              new X64Word.init(2600822924, 725511199),
              new X64Word.init(528734635, 4215389547),
              new X64Word.init(1541459225, 327033209)
            ]);
          },
          _doProcessBlock: function(M, offset) {
            var H = this._hash.words;
            var H0 = H[0];
            var H1 = H[1];
            var H2 = H[2];
            var H3 = H[3];
            var H4 = H[4];
            var H5 = H[5];
            var H6 = H[6];
            var H7 = H[7];
            var H0h = H0.high;
            var H0l = H0.low;
            var H1h = H1.high;
            var H1l = H1.low;
            var H2h = H2.high;
            var H2l = H2.low;
            var H3h = H3.high;
            var H3l = H3.low;
            var H4h = H4.high;
            var H4l = H4.low;
            var H5h = H5.high;
            var H5l = H5.low;
            var H6h = H6.high;
            var H6l = H6.low;
            var H7h = H7.high;
            var H7l = H7.low;
            var ah = H0h;
            var al = H0l;
            var bh = H1h;
            var bl = H1l;
            var ch = H2h;
            var cl = H2l;
            var dh = H3h;
            var dl = H3l;
            var eh = H4h;
            var el = H4l;
            var fh = H5h;
            var fl = H5l;
            var gh = H6h;
            var gl = H6l;
            var hh = H7h;
            var hl = H7l;
            for (var i = 0; i < 80; i++) {
              var Wil;
              var Wih;
              var Wi = W[i];
              if (i < 16) {
                Wih = Wi.high = M[offset + i * 2] | 0;
                Wil = Wi.low = M[offset + i * 2 + 1] | 0;
              } else {
                var gamma0x = W[i - 15];
                var gamma0xh = gamma0x.high;
                var gamma0xl = gamma0x.low;
                var gamma0h = (gamma0xh >>> 1 | gamma0xl << 31) ^ (gamma0xh >>> 8 | gamma0xl << 24) ^ gamma0xh >>> 7;
                var gamma0l = (gamma0xl >>> 1 | gamma0xh << 31) ^ (gamma0xl >>> 8 | gamma0xh << 24) ^ (gamma0xl >>> 7 | gamma0xh << 25);
                var gamma1x = W[i - 2];
                var gamma1xh = gamma1x.high;
                var gamma1xl = gamma1x.low;
                var gamma1h = (gamma1xh >>> 19 | gamma1xl << 13) ^ (gamma1xh << 3 | gamma1xl >>> 29) ^ gamma1xh >>> 6;
                var gamma1l = (gamma1xl >>> 19 | gamma1xh << 13) ^ (gamma1xl << 3 | gamma1xh >>> 29) ^ (gamma1xl >>> 6 | gamma1xh << 26);
                var Wi7 = W[i - 7];
                var Wi7h = Wi7.high;
                var Wi7l = Wi7.low;
                var Wi16 = W[i - 16];
                var Wi16h = Wi16.high;
                var Wi16l = Wi16.low;
                Wil = gamma0l + Wi7l;
                Wih = gamma0h + Wi7h + (Wil >>> 0 < gamma0l >>> 0 ? 1 : 0);
                Wil = Wil + gamma1l;
                Wih = Wih + gamma1h + (Wil >>> 0 < gamma1l >>> 0 ? 1 : 0);
                Wil = Wil + Wi16l;
                Wih = Wih + Wi16h + (Wil >>> 0 < Wi16l >>> 0 ? 1 : 0);
                Wi.high = Wih;
                Wi.low = Wil;
              }
              var chh = eh & fh ^ ~eh & gh;
              var chl = el & fl ^ ~el & gl;
              var majh = ah & bh ^ ah & ch ^ bh & ch;
              var majl = al & bl ^ al & cl ^ bl & cl;
              var sigma0h = (ah >>> 28 | al << 4) ^ (ah << 30 | al >>> 2) ^ (ah << 25 | al >>> 7);
              var sigma0l = (al >>> 28 | ah << 4) ^ (al << 30 | ah >>> 2) ^ (al << 25 | ah >>> 7);
              var sigma1h = (eh >>> 14 | el << 18) ^ (eh >>> 18 | el << 14) ^ (eh << 23 | el >>> 9);
              var sigma1l = (el >>> 14 | eh << 18) ^ (el >>> 18 | eh << 14) ^ (el << 23 | eh >>> 9);
              var Ki = K[i];
              var Kih = Ki.high;
              var Kil = Ki.low;
              var t1l = hl + sigma1l;
              var t1h = hh + sigma1h + (t1l >>> 0 < hl >>> 0 ? 1 : 0);
              var t1l = t1l + chl;
              var t1h = t1h + chh + (t1l >>> 0 < chl >>> 0 ? 1 : 0);
              var t1l = t1l + Kil;
              var t1h = t1h + Kih + (t1l >>> 0 < Kil >>> 0 ? 1 : 0);
              var t1l = t1l + Wil;
              var t1h = t1h + Wih + (t1l >>> 0 < Wil >>> 0 ? 1 : 0);
              var t2l = sigma0l + majl;
              var t2h = sigma0h + majh + (t2l >>> 0 < sigma0l >>> 0 ? 1 : 0);
              hh = gh;
              hl = gl;
              gh = fh;
              gl = fl;
              fh = eh;
              fl = el;
              el = dl + t1l | 0;
              eh = dh + t1h + (el >>> 0 < dl >>> 0 ? 1 : 0) | 0;
              dh = ch;
              dl = cl;
              ch = bh;
              cl = bl;
              bh = ah;
              bl = al;
              al = t1l + t2l | 0;
              ah = t1h + t2h + (al >>> 0 < t1l >>> 0 ? 1 : 0) | 0;
            }
            H0l = H0.low = H0l + al;
            H0.high = H0h + ah + (H0l >>> 0 < al >>> 0 ? 1 : 0);
            H1l = H1.low = H1l + bl;
            H1.high = H1h + bh + (H1l >>> 0 < bl >>> 0 ? 1 : 0);
            H2l = H2.low = H2l + cl;
            H2.high = H2h + ch + (H2l >>> 0 < cl >>> 0 ? 1 : 0);
            H3l = H3.low = H3l + dl;
            H3.high = H3h + dh + (H3l >>> 0 < dl >>> 0 ? 1 : 0);
            H4l = H4.low = H4l + el;
            H4.high = H4h + eh + (H4l >>> 0 < el >>> 0 ? 1 : 0);
            H5l = H5.low = H5l + fl;
            H5.high = H5h + fh + (H5l >>> 0 < fl >>> 0 ? 1 : 0);
            H6l = H6.low = H6l + gl;
            H6.high = H6h + gh + (H6l >>> 0 < gl >>> 0 ? 1 : 0);
            H7l = H7.low = H7l + hl;
            H7.high = H7h + hh + (H7l >>> 0 < hl >>> 0 ? 1 : 0);
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 128 >>> 10 << 5) + 30] = Math.floor(nBitsTotal / 4294967296);
            dataWords[(nBitsLeft + 128 >>> 10 << 5) + 31] = nBitsTotal;
            data.sigBytes = dataWords.length * 4;
            this._process();
            var hash = this._hash.toX32();
            return hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          },
          blockSize: 1024 / 32
        });
        C.SHA512 = Hasher._createHelper(SHA512);
        C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
      })();
      return CryptoJS2.SHA512;
    });
  }
});

// node_modules/crypto-js/sha384.js
var require_sha384 = __commonJS({
  "node_modules/crypto-js/sha384.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_x64_core(), require_sha512());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core", "./sha512"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var X64WordArray = C_x64.WordArray;
        var C_algo = C.algo;
        var SHA512 = C_algo.SHA512;
        var SHA384 = C_algo.SHA384 = SHA512.extend({
          _doReset: function() {
            this._hash = new X64WordArray.init([
              new X64Word.init(3418070365, 3238371032),
              new X64Word.init(1654270250, 914150663),
              new X64Word.init(2438529370, 812702999),
              new X64Word.init(355462360, 4144912697),
              new X64Word.init(1731405415, 4290775857),
              new X64Word.init(2394180231, 1750603025),
              new X64Word.init(3675008525, 1694076839),
              new X64Word.init(1203062813, 3204075428)
            ]);
          },
          _doFinalize: function() {
            var hash = SHA512._doFinalize.call(this);
            hash.sigBytes -= 16;
            return hash;
          }
        });
        C.SHA384 = SHA512._createHelper(SHA384);
        C.HmacSHA384 = SHA512._createHmacHelper(SHA384);
      })();
      return CryptoJS2.SHA384;
    });
  }
});

// node_modules/crypto-js/sha3.js
var require_sha3 = __commonJS({
  "node_modules/crypto-js/sha3.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_x64_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function(Math2) {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_x64 = C.x64;
        var X64Word = C_x64.Word;
        var C_algo = C.algo;
        var RHO_OFFSETS = [];
        var PI_INDEXES = [];
        var ROUND_CONSTANTS = [];
        (function() {
          var x = 1, y = 0;
          for (var t = 0; t < 24; t++) {
            RHO_OFFSETS[x + 5 * y] = (t + 1) * (t + 2) / 2 % 64;
            var newX = y % 5;
            var newY = (2 * x + 3 * y) % 5;
            x = newX;
            y = newY;
          }
          for (var x = 0; x < 5; x++) {
            for (var y = 0; y < 5; y++) {
              PI_INDEXES[x + 5 * y] = y + (2 * x + 3 * y) % 5 * 5;
            }
          }
          var LFSR = 1;
          for (var i = 0; i < 24; i++) {
            var roundConstantMsw = 0;
            var roundConstantLsw = 0;
            for (var j = 0; j < 7; j++) {
              if (LFSR & 1) {
                var bitPosition = (1 << j) - 1;
                if (bitPosition < 32) {
                  roundConstantLsw ^= 1 << bitPosition;
                } else {
                  roundConstantMsw ^= 1 << bitPosition - 32;
                }
              }
              if (LFSR & 128) {
                LFSR = LFSR << 1 ^ 113;
              } else {
                LFSR <<= 1;
              }
            }
            ROUND_CONSTANTS[i] = X64Word.create(roundConstantMsw, roundConstantLsw);
          }
        })();
        var T = [];
        (function() {
          for (var i = 0; i < 25; i++) {
            T[i] = X64Word.create();
          }
        })();
        var SHA3 = C_algo.SHA3 = Hasher.extend({
          /**
           * Configuration options.
           *
           * @property {number} outputLength
           *   The desired number of bits in the output hash.
           *   Only values permitted are: 224, 256, 384, 512.
           *   Default: 512
           */
          cfg: Hasher.cfg.extend({
            outputLength: 512
          }),
          _doReset: function() {
            var state = this._state = [];
            for (var i = 0; i < 25; i++) {
              state[i] = new X64Word.init();
            }
            this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
          },
          _doProcessBlock: function(M, offset) {
            var state = this._state;
            var nBlockSizeLanes = this.blockSize / 2;
            for (var i = 0; i < nBlockSizeLanes; i++) {
              var M2i = M[offset + 2 * i];
              var M2i1 = M[offset + 2 * i + 1];
              M2i = (M2i << 8 | M2i >>> 24) & 16711935 | (M2i << 24 | M2i >>> 8) & 4278255360;
              M2i1 = (M2i1 << 8 | M2i1 >>> 24) & 16711935 | (M2i1 << 24 | M2i1 >>> 8) & 4278255360;
              var lane = state[i];
              lane.high ^= M2i1;
              lane.low ^= M2i;
            }
            for (var round = 0; round < 24; round++) {
              for (var x = 0; x < 5; x++) {
                var tMsw = 0, tLsw = 0;
                for (var y = 0; y < 5; y++) {
                  var lane = state[x + 5 * y];
                  tMsw ^= lane.high;
                  tLsw ^= lane.low;
                }
                var Tx = T[x];
                Tx.high = tMsw;
                Tx.low = tLsw;
              }
              for (var x = 0; x < 5; x++) {
                var Tx4 = T[(x + 4) % 5];
                var Tx1 = T[(x + 1) % 5];
                var Tx1Msw = Tx1.high;
                var Tx1Lsw = Tx1.low;
                var tMsw = Tx4.high ^ (Tx1Msw << 1 | Tx1Lsw >>> 31);
                var tLsw = Tx4.low ^ (Tx1Lsw << 1 | Tx1Msw >>> 31);
                for (var y = 0; y < 5; y++) {
                  var lane = state[x + 5 * y];
                  lane.high ^= tMsw;
                  lane.low ^= tLsw;
                }
              }
              for (var laneIndex = 1; laneIndex < 25; laneIndex++) {
                var tMsw;
                var tLsw;
                var lane = state[laneIndex];
                var laneMsw = lane.high;
                var laneLsw = lane.low;
                var rhoOffset = RHO_OFFSETS[laneIndex];
                if (rhoOffset < 32) {
                  tMsw = laneMsw << rhoOffset | laneLsw >>> 32 - rhoOffset;
                  tLsw = laneLsw << rhoOffset | laneMsw >>> 32 - rhoOffset;
                } else {
                  tMsw = laneLsw << rhoOffset - 32 | laneMsw >>> 64 - rhoOffset;
                  tLsw = laneMsw << rhoOffset - 32 | laneLsw >>> 64 - rhoOffset;
                }
                var TPiLane = T[PI_INDEXES[laneIndex]];
                TPiLane.high = tMsw;
                TPiLane.low = tLsw;
              }
              var T0 = T[0];
              var state0 = state[0];
              T0.high = state0.high;
              T0.low = state0.low;
              for (var x = 0; x < 5; x++) {
                for (var y = 0; y < 5; y++) {
                  var laneIndex = x + 5 * y;
                  var lane = state[laneIndex];
                  var TLane = T[laneIndex];
                  var Tx1Lane = T[(x + 1) % 5 + 5 * y];
                  var Tx2Lane = T[(x + 2) % 5 + 5 * y];
                  lane.high = TLane.high ^ ~Tx1Lane.high & Tx2Lane.high;
                  lane.low = TLane.low ^ ~Tx1Lane.low & Tx2Lane.low;
                }
              }
              var lane = state[0];
              var roundConstant = ROUND_CONSTANTS[round];
              lane.high ^= roundConstant.high;
              lane.low ^= roundConstant.low;
            }
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            var blockSizeBits = this.blockSize * 32;
            dataWords[nBitsLeft >>> 5] |= 1 << 24 - nBitsLeft % 32;
            dataWords[(Math2.ceil((nBitsLeft + 1) / blockSizeBits) * blockSizeBits >>> 5) - 1] |= 128;
            data.sigBytes = dataWords.length * 4;
            this._process();
            var state = this._state;
            var outputLengthBytes = this.cfg.outputLength / 8;
            var outputLengthLanes = outputLengthBytes / 8;
            var hashWords = [];
            for (var i = 0; i < outputLengthLanes; i++) {
              var lane = state[i];
              var laneMsw = lane.high;
              var laneLsw = lane.low;
              laneMsw = (laneMsw << 8 | laneMsw >>> 24) & 16711935 | (laneMsw << 24 | laneMsw >>> 8) & 4278255360;
              laneLsw = (laneLsw << 8 | laneLsw >>> 24) & 16711935 | (laneLsw << 24 | laneLsw >>> 8) & 4278255360;
              hashWords.push(laneLsw);
              hashWords.push(laneMsw);
            }
            return new WordArray.init(hashWords, outputLengthBytes);
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            var state = clone._state = this._state.slice(0);
            for (var i = 0; i < 25; i++) {
              state[i] = state[i].clone();
            }
            return clone;
          }
        });
        C.SHA3 = Hasher._createHelper(SHA3);
        C.HmacSHA3 = Hasher._createHmacHelper(SHA3);
      })(Math);
      return CryptoJS2.SHA3;
    });
  }
});

// node_modules/crypto-js/ripemd160.js
var require_ripemd160 = __commonJS({
  "node_modules/crypto-js/ripemd160.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function(Math2) {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var Hasher = C_lib.Hasher;
        var C_algo = C.algo;
        var _zl = WordArray.create([
          0,
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          7,
          4,
          13,
          1,
          10,
          6,
          15,
          3,
          12,
          0,
          9,
          5,
          2,
          14,
          11,
          8,
          3,
          10,
          14,
          4,
          9,
          15,
          8,
          1,
          2,
          7,
          0,
          6,
          13,
          11,
          5,
          12,
          1,
          9,
          11,
          10,
          0,
          8,
          12,
          4,
          13,
          3,
          7,
          15,
          14,
          5,
          6,
          2,
          4,
          0,
          5,
          9,
          7,
          12,
          2,
          10,
          14,
          1,
          3,
          8,
          11,
          6,
          15,
          13
        ]);
        var _zr = WordArray.create([
          5,
          14,
          7,
          0,
          9,
          2,
          11,
          4,
          13,
          6,
          15,
          8,
          1,
          10,
          3,
          12,
          6,
          11,
          3,
          7,
          0,
          13,
          5,
          10,
          14,
          15,
          8,
          12,
          4,
          9,
          1,
          2,
          15,
          5,
          1,
          3,
          7,
          14,
          6,
          9,
          11,
          8,
          12,
          2,
          10,
          0,
          4,
          13,
          8,
          6,
          4,
          1,
          3,
          11,
          15,
          0,
          5,
          12,
          2,
          13,
          9,
          7,
          10,
          14,
          12,
          15,
          10,
          4,
          1,
          5,
          8,
          7,
          6,
          2,
          13,
          14,
          0,
          3,
          9,
          11
        ]);
        var _sl = WordArray.create([
          11,
          14,
          15,
          12,
          5,
          8,
          7,
          9,
          11,
          13,
          14,
          15,
          6,
          7,
          9,
          8,
          7,
          6,
          8,
          13,
          11,
          9,
          7,
          15,
          7,
          12,
          15,
          9,
          11,
          7,
          13,
          12,
          11,
          13,
          6,
          7,
          14,
          9,
          13,
          15,
          14,
          8,
          13,
          6,
          5,
          12,
          7,
          5,
          11,
          12,
          14,
          15,
          14,
          15,
          9,
          8,
          9,
          14,
          5,
          6,
          8,
          6,
          5,
          12,
          9,
          15,
          5,
          11,
          6,
          8,
          13,
          12,
          5,
          12,
          13,
          14,
          11,
          8,
          5,
          6
        ]);
        var _sr = WordArray.create([
          8,
          9,
          9,
          11,
          13,
          15,
          15,
          5,
          7,
          7,
          8,
          11,
          14,
          14,
          12,
          6,
          9,
          13,
          15,
          7,
          12,
          8,
          9,
          11,
          7,
          7,
          12,
          7,
          6,
          15,
          13,
          11,
          9,
          7,
          15,
          11,
          8,
          6,
          6,
          14,
          12,
          13,
          5,
          14,
          13,
          13,
          7,
          5,
          15,
          5,
          8,
          11,
          14,
          14,
          6,
          14,
          6,
          9,
          12,
          9,
          12,
          5,
          15,
          8,
          8,
          5,
          12,
          9,
          12,
          5,
          14,
          6,
          8,
          13,
          6,
          5,
          15,
          13,
          11,
          11
        ]);
        var _hl = WordArray.create([0, 1518500249, 1859775393, 2400959708, 2840853838]);
        var _hr = WordArray.create([1352829926, 1548603684, 1836072691, 2053994217, 0]);
        var RIPEMD160 = C_algo.RIPEMD160 = Hasher.extend({
          _doReset: function() {
            this._hash = WordArray.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
          },
          _doProcessBlock: function(M, offset) {
            for (var i = 0; i < 16; i++) {
              var offset_i = offset + i;
              var M_offset_i = M[offset_i];
              M[offset_i] = (M_offset_i << 8 | M_offset_i >>> 24) & 16711935 | (M_offset_i << 24 | M_offset_i >>> 8) & 4278255360;
            }
            var H = this._hash.words;
            var hl = _hl.words;
            var hr = _hr.words;
            var zl = _zl.words;
            var zr = _zr.words;
            var sl = _sl.words;
            var sr = _sr.words;
            var al, bl, cl, dl, el;
            var ar, br, cr, dr, er;
            ar = al = H[0];
            br = bl = H[1];
            cr = cl = H[2];
            dr = dl = H[3];
            er = el = H[4];
            var t;
            for (var i = 0; i < 80; i += 1) {
              t = al + M[offset + zl[i]] | 0;
              if (i < 16) {
                t += f1(bl, cl, dl) + hl[0];
              } else if (i < 32) {
                t += f2(bl, cl, dl) + hl[1];
              } else if (i < 48) {
                t += f3(bl, cl, dl) + hl[2];
              } else if (i < 64) {
                t += f4(bl, cl, dl) + hl[3];
              } else {
                t += f5(bl, cl, dl) + hl[4];
              }
              t = t | 0;
              t = rotl(t, sl[i]);
              t = t + el | 0;
              al = el;
              el = dl;
              dl = rotl(cl, 10);
              cl = bl;
              bl = t;
              t = ar + M[offset + zr[i]] | 0;
              if (i < 16) {
                t += f5(br, cr, dr) + hr[0];
              } else if (i < 32) {
                t += f4(br, cr, dr) + hr[1];
              } else if (i < 48) {
                t += f3(br, cr, dr) + hr[2];
              } else if (i < 64) {
                t += f2(br, cr, dr) + hr[3];
              } else {
                t += f1(br, cr, dr) + hr[4];
              }
              t = t | 0;
              t = rotl(t, sr[i]);
              t = t + er | 0;
              ar = er;
              er = dr;
              dr = rotl(cr, 10);
              cr = br;
              br = t;
            }
            t = H[1] + cl + dr | 0;
            H[1] = H[2] + dl + er | 0;
            H[2] = H[3] + el + ar | 0;
            H[3] = H[4] + al + br | 0;
            H[4] = H[0] + bl + cr | 0;
            H[0] = t;
          },
          _doFinalize: function() {
            var data = this._data;
            var dataWords = data.words;
            var nBitsTotal = this._nDataBytes * 8;
            var nBitsLeft = data.sigBytes * 8;
            dataWords[nBitsLeft >>> 5] |= 128 << 24 - nBitsLeft % 32;
            dataWords[(nBitsLeft + 64 >>> 9 << 4) + 14] = (nBitsTotal << 8 | nBitsTotal >>> 24) & 16711935 | (nBitsTotal << 24 | nBitsTotal >>> 8) & 4278255360;
            data.sigBytes = (dataWords.length + 1) * 4;
            this._process();
            var hash = this._hash;
            var H = hash.words;
            for (var i = 0; i < 5; i++) {
              var H_i = H[i];
              H[i] = (H_i << 8 | H_i >>> 24) & 16711935 | (H_i << 24 | H_i >>> 8) & 4278255360;
            }
            return hash;
          },
          clone: function() {
            var clone = Hasher.clone.call(this);
            clone._hash = this._hash.clone();
            return clone;
          }
        });
        function f1(x, y, z) {
          return x ^ y ^ z;
        }
        function f2(x, y, z) {
          return x & y | ~x & z;
        }
        function f3(x, y, z) {
          return (x | ~y) ^ z;
        }
        function f4(x, y, z) {
          return x & z | y & ~z;
        }
        function f5(x, y, z) {
          return x ^ (y | ~z);
        }
        function rotl(x, n) {
          return x << n | x >>> 32 - n;
        }
        C.RIPEMD160 = Hasher._createHelper(RIPEMD160);
        C.HmacRIPEMD160 = Hasher._createHmacHelper(RIPEMD160);
      })(Math);
      return CryptoJS2.RIPEMD160;
    });
  }
});

// node_modules/crypto-js/hmac.js
var require_hmac = __commonJS({
  "node_modules/crypto-js/hmac.js"(exports, module) {
    (function(root, factory) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var C_enc = C.enc;
        var Utf8 = C_enc.Utf8;
        var C_algo = C.algo;
        var HMAC = C_algo.HMAC = Base.extend({
          /**
           * Initializes a newly created HMAC.
           *
           * @param {Hasher} hasher The hash algorithm to use.
           * @param {WordArray|string} key The secret key.
           *
           * @example
           *
           *     var hmacHasher = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, key);
           */
          init: function(hasher, key) {
            hasher = this._hasher = new hasher.init();
            if (typeof key == "string") {
              key = Utf8.parse(key);
            }
            var hasherBlockSize = hasher.blockSize;
            var hasherBlockSizeBytes = hasherBlockSize * 4;
            if (key.sigBytes > hasherBlockSizeBytes) {
              key = hasher.finalize(key);
            }
            key.clamp();
            var oKey = this._oKey = key.clone();
            var iKey = this._iKey = key.clone();
            var oKeyWords = oKey.words;
            var iKeyWords = iKey.words;
            for (var i = 0; i < hasherBlockSize; i++) {
              oKeyWords[i] ^= 1549556828;
              iKeyWords[i] ^= 909522486;
            }
            oKey.sigBytes = iKey.sigBytes = hasherBlockSizeBytes;
            this.reset();
          },
          /**
           * Resets this HMAC to its initial state.
           *
           * @example
           *
           *     hmacHasher.reset();
           */
          reset: function() {
            var hasher = this._hasher;
            hasher.reset();
            hasher.update(this._iKey);
          },
          /**
           * Updates this HMAC with a message.
           *
           * @param {WordArray|string} messageUpdate The message to append.
           *
           * @return {HMAC} This HMAC instance.
           *
           * @example
           *
           *     hmacHasher.update('message');
           *     hmacHasher.update(wordArray);
           */
          update: function(messageUpdate) {
            this._hasher.update(messageUpdate);
            return this;
          },
          /**
           * Finalizes the HMAC computation.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} messageUpdate (Optional) A final message update.
           *
           * @return {WordArray} The HMAC.
           *
           * @example
           *
           *     var hmac = hmacHasher.finalize();
           *     var hmac = hmacHasher.finalize('message');
           *     var hmac = hmacHasher.finalize(wordArray);
           */
          finalize: function(messageUpdate) {
            var hasher = this._hasher;
            var innerHash = hasher.finalize(messageUpdate);
            hasher.reset();
            var hmac = hasher.finalize(this._oKey.clone().concat(innerHash));
            return hmac;
          }
        });
      })();
    });
  }
});

// node_modules/crypto-js/pbkdf2.js
var require_pbkdf2 = __commonJS({
  "node_modules/crypto-js/pbkdf2.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_sha256(), require_hmac());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha256", "./hmac"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var SHA256 = C_algo.SHA256;
        var HMAC = C_algo.HMAC;
        var PBKDF2 = C_algo.PBKDF2 = Base.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hasher to use. Default: SHA256
           * @property {number} iterations The number of iterations to perform. Default: 250000
           */
          cfg: Base.extend({
            keySize: 128 / 32,
            hasher: SHA256,
            iterations: 25e4
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.PBKDF2.create();
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.PBKDF2.create({ keySize: 8, iterations: 1000 });
           */
          init: function(cfg) {
            this.cfg = this.cfg.extend(cfg);
          },
          /**
           * Computes the Password-Based Key Derivation Function 2.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: function(password, salt) {
            var cfg = this.cfg;
            var hmac = HMAC.create(cfg.hasher, password);
            var derivedKey = WordArray.create();
            var blockIndex = WordArray.create([1]);
            var derivedKeyWords = derivedKey.words;
            var blockIndexWords = blockIndex.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;
            while (derivedKeyWords.length < keySize) {
              var block = hmac.update(salt).finalize(blockIndex);
              hmac.reset();
              var blockWords = block.words;
              var blockWordsLength = blockWords.length;
              var intermediate = block;
              for (var i = 1; i < iterations; i++) {
                intermediate = hmac.finalize(intermediate);
                hmac.reset();
                var intermediateWords = intermediate.words;
                for (var j = 0; j < blockWordsLength; j++) {
                  blockWords[j] ^= intermediateWords[j];
                }
              }
              derivedKey.concat(block);
              blockIndexWords[0]++;
            }
            derivedKey.sigBytes = keySize * 4;
            return derivedKey;
          }
        });
        C.PBKDF2 = function(password, salt, cfg) {
          return PBKDF2.create(cfg).compute(password, salt);
        };
      })();
      return CryptoJS2.PBKDF2;
    });
  }
});

// node_modules/crypto-js/evpkdf.js
var require_evpkdf = __commonJS({
  "node_modules/crypto-js/evpkdf.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_sha1(), require_hmac());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./sha1", "./hmac"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var C_algo = C.algo;
        var MD5 = C_algo.MD5;
        var EvpKDF = C_algo.EvpKDF = Base.extend({
          /**
           * Configuration options.
           *
           * @property {number} keySize The key size in words to generate. Default: 4 (128 bits)
           * @property {Hasher} hasher The hash algorithm to use. Default: MD5
           * @property {number} iterations The number of iterations to perform. Default: 1
           */
          cfg: Base.extend({
            keySize: 128 / 32,
            hasher: MD5,
            iterations: 1
          }),
          /**
           * Initializes a newly created key derivation function.
           *
           * @param {Object} cfg (Optional) The configuration options to use for the derivation.
           *
           * @example
           *
           *     var kdf = CryptoJS.algo.EvpKDF.create();
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8 });
           *     var kdf = CryptoJS.algo.EvpKDF.create({ keySize: 8, iterations: 1000 });
           */
          init: function(cfg) {
            this.cfg = this.cfg.extend(cfg);
          },
          /**
           * Derives a key from a password.
           *
           * @param {WordArray|string} password The password.
           * @param {WordArray|string} salt A salt.
           *
           * @return {WordArray} The derived key.
           *
           * @example
           *
           *     var key = kdf.compute(password, salt);
           */
          compute: function(password, salt) {
            var block;
            var cfg = this.cfg;
            var hasher = cfg.hasher.create();
            var derivedKey = WordArray.create();
            var derivedKeyWords = derivedKey.words;
            var keySize = cfg.keySize;
            var iterations = cfg.iterations;
            while (derivedKeyWords.length < keySize) {
              if (block) {
                hasher.update(block);
              }
              block = hasher.update(password).finalize(salt);
              hasher.reset();
              for (var i = 1; i < iterations; i++) {
                block = hasher.finalize(block);
                hasher.reset();
              }
              derivedKey.concat(block);
            }
            derivedKey.sigBytes = keySize * 4;
            return derivedKey;
          }
        });
        C.EvpKDF = function(password, salt, cfg) {
          return EvpKDF.create(cfg).compute(password, salt);
        };
      })();
      return CryptoJS2.EvpKDF;
    });
  }
});

// node_modules/crypto-js/cipher-core.js
var require_cipher_core = __commonJS({
  "node_modules/crypto-js/cipher-core.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_evpkdf());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./evpkdf"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.lib.Cipher || (function(undefined2) {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var Base = C_lib.Base;
        var WordArray = C_lib.WordArray;
        var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm;
        var C_enc = C.enc;
        var Utf8 = C_enc.Utf8;
        var Base64 = C_enc.Base64;
        var C_algo = C.algo;
        var EvpKDF = C_algo.EvpKDF;
        var Cipher = C_lib.Cipher = BufferedBlockAlgorithm.extend({
          /**
           * Configuration options.
           *
           * @property {WordArray} iv The IV to use for this operation.
           */
          cfg: Base.extend(),
          /**
           * Creates this cipher in encryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createEncryptor(keyWordArray, { iv: ivWordArray });
           */
          createEncryptor: function(key, cfg) {
            return this.create(this._ENC_XFORM_MODE, key, cfg);
          },
          /**
           * Creates this cipher in decryption mode.
           *
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {Cipher} A cipher instance.
           *
           * @static
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.createDecryptor(keyWordArray, { iv: ivWordArray });
           */
          createDecryptor: function(key, cfg) {
            return this.create(this._DEC_XFORM_MODE, key, cfg);
          },
          /**
           * Initializes a newly created cipher.
           *
           * @param {number} xformMode Either the encryption or decryption transormation mode constant.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @example
           *
           *     var cipher = CryptoJS.algo.AES.create(CryptoJS.algo.AES._ENC_XFORM_MODE, keyWordArray, { iv: ivWordArray });
           */
          init: function(xformMode, key, cfg) {
            this.cfg = this.cfg.extend(cfg);
            this._xformMode = xformMode;
            this._key = key;
            this.reset();
          },
          /**
           * Resets this cipher to its initial state.
           *
           * @example
           *
           *     cipher.reset();
           */
          reset: function() {
            BufferedBlockAlgorithm.reset.call(this);
            this._doReset();
          },
          /**
           * Adds data to be encrypted or decrypted.
           *
           * @param {WordArray|string} dataUpdate The data to encrypt or decrypt.
           *
           * @return {WordArray} The data after processing.
           *
           * @example
           *
           *     var encrypted = cipher.process('data');
           *     var encrypted = cipher.process(wordArray);
           */
          process: function(dataUpdate) {
            this._append(dataUpdate);
            return this._process();
          },
          /**
           * Finalizes the encryption or decryption process.
           * Note that the finalize operation is effectively a destructive, read-once operation.
           *
           * @param {WordArray|string} dataUpdate The final data to encrypt or decrypt.
           *
           * @return {WordArray} The data after final processing.
           *
           * @example
           *
           *     var encrypted = cipher.finalize();
           *     var encrypted = cipher.finalize('data');
           *     var encrypted = cipher.finalize(wordArray);
           */
          finalize: function(dataUpdate) {
            if (dataUpdate) {
              this._append(dataUpdate);
            }
            var finalProcessedData = this._doFinalize();
            return finalProcessedData;
          },
          keySize: 128 / 32,
          ivSize: 128 / 32,
          _ENC_XFORM_MODE: 1,
          _DEC_XFORM_MODE: 2,
          /**
           * Creates shortcut functions to a cipher's object interface.
           *
           * @param {Cipher} cipher The cipher to create a helper for.
           *
           * @return {Object} An object with encrypt and decrypt shortcut functions.
           *
           * @static
           *
           * @example
           *
           *     var AES = CryptoJS.lib.Cipher._createHelper(CryptoJS.algo.AES);
           */
          _createHelper: /* @__PURE__ */ (function() {
            function selectCipherStrategy(key) {
              if (typeof key == "string") {
                return PasswordBasedCipher;
              } else {
                return SerializableCipher;
              }
            }
            return function(cipher) {
              return {
                encrypt: function(message, key, cfg) {
                  return selectCipherStrategy(key).encrypt(cipher, message, key, cfg);
                },
                decrypt: function(ciphertext, key, cfg) {
                  return selectCipherStrategy(key).decrypt(cipher, ciphertext, key, cfg);
                }
              };
            };
          })()
        });
        var StreamCipher = C_lib.StreamCipher = Cipher.extend({
          _doFinalize: function() {
            var finalProcessedBlocks = this._process(true);
            return finalProcessedBlocks;
          },
          blockSize: 1
        });
        var C_mode = C.mode = {};
        var BlockCipherMode = C_lib.BlockCipherMode = Base.extend({
          /**
           * Creates this mode for encryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createEncryptor(cipher, iv.words);
           */
          createEncryptor: function(cipher, iv) {
            return this.Encryptor.create(cipher, iv);
          },
          /**
           * Creates this mode for decryption.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @static
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.createDecryptor(cipher, iv.words);
           */
          createDecryptor: function(cipher, iv) {
            return this.Decryptor.create(cipher, iv);
          },
          /**
           * Initializes a newly created mode.
           *
           * @param {Cipher} cipher A block cipher instance.
           * @param {Array} iv The IV words.
           *
           * @example
           *
           *     var mode = CryptoJS.mode.CBC.Encryptor.create(cipher, iv.words);
           */
          init: function(cipher, iv) {
            this._cipher = cipher;
            this._iv = iv;
          }
        });
        var CBC = C_mode.CBC = (function() {
          var CBC2 = BlockCipherMode.extend();
          CBC2.Encryptor = CBC2.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function(words, offset) {
              var cipher = this._cipher;
              var blockSize = cipher.blockSize;
              xorBlock.call(this, words, offset, blockSize);
              cipher.encryptBlock(words, offset);
              this._prevBlock = words.slice(offset, offset + blockSize);
            }
          });
          CBC2.Decryptor = CBC2.extend({
            /**
             * Processes the data block at offset.
             *
             * @param {Array} words The data words to operate on.
             * @param {number} offset The offset where the block starts.
             *
             * @example
             *
             *     mode.processBlock(data.words, offset);
             */
            processBlock: function(words, offset) {
              var cipher = this._cipher;
              var blockSize = cipher.blockSize;
              var thisBlock = words.slice(offset, offset + blockSize);
              cipher.decryptBlock(words, offset);
              xorBlock.call(this, words, offset, blockSize);
              this._prevBlock = thisBlock;
            }
          });
          function xorBlock(words, offset, blockSize) {
            var block;
            var iv = this._iv;
            if (iv) {
              block = iv;
              this._iv = undefined2;
            } else {
              block = this._prevBlock;
            }
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= block[i];
            }
          }
          return CBC2;
        })();
        var C_pad = C.pad = {};
        var Pkcs7 = C_pad.Pkcs7 = {
          /**
           * Pads data using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to pad.
           * @param {number} blockSize The multiple that the data should be padded to.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.pad(wordArray, 4);
           */
          pad: function(data, blockSize) {
            var blockSizeBytes = blockSize * 4;
            var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
            var paddingWord = nPaddingBytes << 24 | nPaddingBytes << 16 | nPaddingBytes << 8 | nPaddingBytes;
            var paddingWords = [];
            for (var i = 0; i < nPaddingBytes; i += 4) {
              paddingWords.push(paddingWord);
            }
            var padding = WordArray.create(paddingWords, nPaddingBytes);
            data.concat(padding);
          },
          /**
           * Unpads data that had been padded using the algorithm defined in PKCS #5/7.
           *
           * @param {WordArray} data The data to unpad.
           *
           * @static
           *
           * @example
           *
           *     CryptoJS.pad.Pkcs7.unpad(wordArray);
           */
          unpad: function(data) {
            var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
            data.sigBytes -= nPaddingBytes;
          }
        };
        var BlockCipher = C_lib.BlockCipher = Cipher.extend({
          /**
           * Configuration options.
           *
           * @property {Mode} mode The block mode to use. Default: CBC
           * @property {Padding} padding The padding strategy to use. Default: Pkcs7
           */
          cfg: Cipher.cfg.extend({
            mode: CBC,
            padding: Pkcs7
          }),
          reset: function() {
            var modeCreator;
            Cipher.reset.call(this);
            var cfg = this.cfg;
            var iv = cfg.iv;
            var mode = cfg.mode;
            if (this._xformMode == this._ENC_XFORM_MODE) {
              modeCreator = mode.createEncryptor;
            } else {
              modeCreator = mode.createDecryptor;
              this._minBufferSize = 1;
            }
            if (this._mode && this._mode.__creator == modeCreator) {
              this._mode.init(this, iv && iv.words);
            } else {
              this._mode = modeCreator.call(mode, this, iv && iv.words);
              this._mode.__creator = modeCreator;
            }
          },
          _doProcessBlock: function(words, offset) {
            this._mode.processBlock(words, offset);
          },
          _doFinalize: function() {
            var finalProcessedBlocks;
            var padding = this.cfg.padding;
            if (this._xformMode == this._ENC_XFORM_MODE) {
              padding.pad(this._data, this.blockSize);
              finalProcessedBlocks = this._process(true);
            } else {
              finalProcessedBlocks = this._process(true);
              padding.unpad(finalProcessedBlocks);
            }
            return finalProcessedBlocks;
          },
          blockSize: 128 / 32
        });
        var CipherParams = C_lib.CipherParams = Base.extend({
          /**
           * Initializes a newly created cipher params object.
           *
           * @param {Object} cipherParams An object with any of the possible cipher parameters.
           *
           * @example
           *
           *     var cipherParams = CryptoJS.lib.CipherParams.create({
           *         ciphertext: ciphertextWordArray,
           *         key: keyWordArray,
           *         iv: ivWordArray,
           *         salt: saltWordArray,
           *         algorithm: CryptoJS.algo.AES,
           *         mode: CryptoJS.mode.CBC,
           *         padding: CryptoJS.pad.PKCS7,
           *         blockSize: 4,
           *         formatter: CryptoJS.format.OpenSSL
           *     });
           */
          init: function(cipherParams) {
            this.mixIn(cipherParams);
          },
          /**
           * Converts this cipher params object to a string.
           *
           * @param {Format} formatter (Optional) The formatting strategy to use.
           *
           * @return {string} The stringified cipher params.
           *
           * @throws Error If neither the formatter nor the default formatter is set.
           *
           * @example
           *
           *     var string = cipherParams + '';
           *     var string = cipherParams.toString();
           *     var string = cipherParams.toString(CryptoJS.format.OpenSSL);
           */
          toString: function(formatter) {
            return (formatter || this.formatter).stringify(this);
          }
        });
        var C_format = C.format = {};
        var OpenSSLFormatter = C_format.OpenSSL = {
          /**
           * Converts a cipher params object to an OpenSSL-compatible string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The OpenSSL-compatible string.
           *
           * @static
           *
           * @example
           *
           *     var openSSLString = CryptoJS.format.OpenSSL.stringify(cipherParams);
           */
          stringify: function(cipherParams) {
            var wordArray;
            var ciphertext = cipherParams.ciphertext;
            var salt = cipherParams.salt;
            if (salt) {
              wordArray = WordArray.create([1398893684, 1701076831]).concat(salt).concat(ciphertext);
            } else {
              wordArray = ciphertext;
            }
            return wordArray.toString(Base64);
          },
          /**
           * Converts an OpenSSL-compatible string to a cipher params object.
           *
           * @param {string} openSSLStr The OpenSSL-compatible string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.OpenSSL.parse(openSSLString);
           */
          parse: function(openSSLStr) {
            var salt;
            var ciphertext = Base64.parse(openSSLStr);
            var ciphertextWords = ciphertext.words;
            if (ciphertextWords[0] == 1398893684 && ciphertextWords[1] == 1701076831) {
              salt = WordArray.create(ciphertextWords.slice(2, 4));
              ciphertextWords.splice(0, 4);
              ciphertext.sigBytes -= 16;
            }
            return CipherParams.create({ ciphertext, salt });
          }
        };
        var SerializableCipher = C_lib.SerializableCipher = Base.extend({
          /**
           * Configuration options.
           *
           * @property {Formatter} format The formatting strategy to convert cipher param objects to and from a string. Default: OpenSSL
           */
          cfg: Base.extend({
            format: OpenSSLFormatter
          }),
          /**
           * Encrypts a message.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key);
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv });
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher.encrypt(CryptoJS.algo.AES, message, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          encrypt: function(cipher, message, key, cfg) {
            cfg = this.cfg.extend(cfg);
            var encryptor = cipher.createEncryptor(key, cfg);
            var ciphertext = encryptor.finalize(message);
            var cipherCfg = encryptor.cfg;
            return CipherParams.create({
              ciphertext,
              key,
              iv: cipherCfg.iv,
              algorithm: cipher,
              mode: cipherCfg.mode,
              padding: cipherCfg.padding,
              blockSize: cipher.blockSize,
              formatter: cfg.format
            });
          },
          /**
           * Decrypts serialized ciphertext.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {WordArray} key The key.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.SerializableCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, key, { iv: iv, format: CryptoJS.format.OpenSSL });
           */
          decrypt: function(cipher, ciphertext, key, cfg) {
            cfg = this.cfg.extend(cfg);
            ciphertext = this._parse(ciphertext, cfg.format);
            var plaintext = cipher.createDecryptor(key, cfg).finalize(ciphertext.ciphertext);
            return plaintext;
          },
          /**
           * Converts serialized ciphertext to CipherParams,
           * else assumed CipherParams already and returns ciphertext unchanged.
           *
           * @param {CipherParams|string} ciphertext The ciphertext.
           * @param {Formatter} format The formatting strategy to use to parse serialized ciphertext.
           *
           * @return {CipherParams} The unserialized ciphertext.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.SerializableCipher._parse(ciphertextStringOrParams, format);
           */
          _parse: function(ciphertext, format) {
            if (typeof ciphertext == "string") {
              return format.parse(ciphertext, this);
            } else {
              return ciphertext;
            }
          }
        });
        var C_kdf = C.kdf = {};
        var OpenSSLKdf = C_kdf.OpenSSL = {
          /**
           * Derives a key and IV from a password.
           *
           * @param {string} password The password to derive from.
           * @param {number} keySize The size in words of the key to generate.
           * @param {number} ivSize The size in words of the IV to generate.
           * @param {WordArray|string} salt (Optional) A 64-bit salt to use. If omitted, a salt will be generated randomly.
           *
           * @return {CipherParams} A cipher params object with the key, IV, and salt.
           *
           * @static
           *
           * @example
           *
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32);
           *     var derivedParams = CryptoJS.kdf.OpenSSL.execute('Password', 256/32, 128/32, 'saltsalt');
           */
          execute: function(password, keySize, ivSize, salt, hasher) {
            if (!salt) {
              salt = WordArray.random(64 / 8);
            }
            if (!hasher) {
              var key = EvpKDF.create({ keySize: keySize + ivSize }).compute(password, salt);
            } else {
              var key = EvpKDF.create({ keySize: keySize + ivSize, hasher }).compute(password, salt);
            }
            var iv = WordArray.create(key.words.slice(keySize), ivSize * 4);
            key.sigBytes = keySize * 4;
            return CipherParams.create({ key, iv, salt });
          }
        };
        var PasswordBasedCipher = C_lib.PasswordBasedCipher = SerializableCipher.extend({
          /**
           * Configuration options.
           *
           * @property {KDF} kdf The key derivation function to use to generate a key and IV from a password. Default: OpenSSL
           */
          cfg: SerializableCipher.cfg.extend({
            kdf: OpenSSLKdf
          }),
          /**
           * Encrypts a message using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {WordArray|string} message The message to encrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {CipherParams} A cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password');
           *     var ciphertextParams = CryptoJS.lib.PasswordBasedCipher.encrypt(CryptoJS.algo.AES, message, 'password', { format: CryptoJS.format.OpenSSL });
           */
          encrypt: function(cipher, message, password, cfg) {
            cfg = this.cfg.extend(cfg);
            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, cfg.salt, cfg.hasher);
            cfg.iv = derivedParams.iv;
            var ciphertext = SerializableCipher.encrypt.call(this, cipher, message, derivedParams.key, cfg);
            ciphertext.mixIn(derivedParams);
            return ciphertext;
          },
          /**
           * Decrypts serialized ciphertext using a password.
           *
           * @param {Cipher} cipher The cipher algorithm to use.
           * @param {CipherParams|string} ciphertext The ciphertext to decrypt.
           * @param {string} password The password.
           * @param {Object} cfg (Optional) The configuration options to use for this operation.
           *
           * @return {WordArray} The plaintext.
           *
           * @static
           *
           * @example
           *
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, formattedCiphertext, 'password', { format: CryptoJS.format.OpenSSL });
           *     var plaintext = CryptoJS.lib.PasswordBasedCipher.decrypt(CryptoJS.algo.AES, ciphertextParams, 'password', { format: CryptoJS.format.OpenSSL });
           */
          decrypt: function(cipher, ciphertext, password, cfg) {
            cfg = this.cfg.extend(cfg);
            ciphertext = this._parse(ciphertext, cfg.format);
            var derivedParams = cfg.kdf.execute(password, cipher.keySize, cipher.ivSize, ciphertext.salt, cfg.hasher);
            cfg.iv = derivedParams.iv;
            var plaintext = SerializableCipher.decrypt.call(this, cipher, ciphertext, derivedParams.key, cfg);
            return plaintext;
          }
        });
      })();
    });
  }
});

// node_modules/crypto-js/mode-cfb.js
var require_mode_cfb = __commonJS({
  "node_modules/crypto-js/mode-cfb.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.mode.CFB = (function() {
        var CFB = CryptoJS2.lib.BlockCipherMode.extend();
        CFB.Encryptor = CFB.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
            this._prevBlock = words.slice(offset, offset + blockSize);
          }
        });
        CFB.Decryptor = CFB.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var thisBlock = words.slice(offset, offset + blockSize);
            generateKeystreamAndEncrypt.call(this, words, offset, blockSize, cipher);
            this._prevBlock = thisBlock;
          }
        });
        function generateKeystreamAndEncrypt(words, offset, blockSize, cipher) {
          var keystream;
          var iv = this._iv;
          if (iv) {
            keystream = iv.slice(0);
            this._iv = void 0;
          } else {
            keystream = this._prevBlock;
          }
          cipher.encryptBlock(keystream, 0);
          for (var i = 0; i < blockSize; i++) {
            words[offset + i] ^= keystream[i];
          }
        }
        return CFB;
      })();
      return CryptoJS2.mode.CFB;
    });
  }
});

// node_modules/crypto-js/mode-ctr.js
var require_mode_ctr = __commonJS({
  "node_modules/crypto-js/mode-ctr.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.mode.CTR = (function() {
        var CTR = CryptoJS2.lib.BlockCipherMode.extend();
        var Encryptor = CTR.Encryptor = CTR.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;
            if (iv) {
              counter = this._counter = iv.slice(0);
              this._iv = void 0;
            }
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);
            counter[blockSize - 1] = counter[blockSize - 1] + 1 | 0;
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }
        });
        CTR.Decryptor = Encryptor;
        return CTR;
      })();
      return CryptoJS2.mode.CTR;
    });
  }
});

// node_modules/crypto-js/mode-ctr-gladman.js
var require_mode_ctr_gladman = __commonJS({
  "node_modules/crypto-js/mode-ctr-gladman.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.mode.CTRGladman = (function() {
        var CTRGladman = CryptoJS2.lib.BlockCipherMode.extend();
        function incWord(word) {
          if ((word >> 24 & 255) === 255) {
            var b1 = word >> 16 & 255;
            var b2 = word >> 8 & 255;
            var b3 = word & 255;
            if (b1 === 255) {
              b1 = 0;
              if (b2 === 255) {
                b2 = 0;
                if (b3 === 255) {
                  b3 = 0;
                } else {
                  ++b3;
                }
              } else {
                ++b2;
              }
            } else {
              ++b1;
            }
            word = 0;
            word += b1 << 16;
            word += b2 << 8;
            word += b3;
          } else {
            word += 1 << 24;
          }
          return word;
        }
        function incCounter(counter) {
          if ((counter[0] = incWord(counter[0])) === 0) {
            counter[1] = incWord(counter[1]);
          }
          return counter;
        }
        var Encryptor = CTRGladman.Encryptor = CTRGladman.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var counter = this._counter;
            if (iv) {
              counter = this._counter = iv.slice(0);
              this._iv = void 0;
            }
            incCounter(counter);
            var keystream = counter.slice(0);
            cipher.encryptBlock(keystream, 0);
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }
        });
        CTRGladman.Decryptor = Encryptor;
        return CTRGladman;
      })();
      return CryptoJS2.mode.CTRGladman;
    });
  }
});

// node_modules/crypto-js/mode-ofb.js
var require_mode_ofb = __commonJS({
  "node_modules/crypto-js/mode-ofb.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.mode.OFB = (function() {
        var OFB = CryptoJS2.lib.BlockCipherMode.extend();
        var Encryptor = OFB.Encryptor = OFB.extend({
          processBlock: function(words, offset) {
            var cipher = this._cipher;
            var blockSize = cipher.blockSize;
            var iv = this._iv;
            var keystream = this._keystream;
            if (iv) {
              keystream = this._keystream = iv.slice(0);
              this._iv = void 0;
            }
            cipher.encryptBlock(keystream, 0);
            for (var i = 0; i < blockSize; i++) {
              words[offset + i] ^= keystream[i];
            }
          }
        });
        OFB.Decryptor = Encryptor;
        return OFB;
      })();
      return CryptoJS2.mode.OFB;
    });
  }
});

// node_modules/crypto-js/mode-ecb.js
var require_mode_ecb = __commonJS({
  "node_modules/crypto-js/mode-ecb.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.mode.ECB = (function() {
        var ECB = CryptoJS2.lib.BlockCipherMode.extend();
        ECB.Encryptor = ECB.extend({
          processBlock: function(words, offset) {
            this._cipher.encryptBlock(words, offset);
          }
        });
        ECB.Decryptor = ECB.extend({
          processBlock: function(words, offset) {
            this._cipher.decryptBlock(words, offset);
          }
        });
        return ECB;
      })();
      return CryptoJS2.mode.ECB;
    });
  }
});

// node_modules/crypto-js/pad-ansix923.js
var require_pad_ansix923 = __commonJS({
  "node_modules/crypto-js/pad-ansix923.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.pad.AnsiX923 = {
        pad: function(data, blockSize) {
          var dataSigBytes = data.sigBytes;
          var blockSizeBytes = blockSize * 4;
          var nPaddingBytes = blockSizeBytes - dataSigBytes % blockSizeBytes;
          var lastBytePos = dataSigBytes + nPaddingBytes - 1;
          data.clamp();
          data.words[lastBytePos >>> 2] |= nPaddingBytes << 24 - lastBytePos % 4 * 8;
          data.sigBytes += nPaddingBytes;
        },
        unpad: function(data) {
          var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
          data.sigBytes -= nPaddingBytes;
        }
      };
      return CryptoJS2.pad.Ansix923;
    });
  }
});

// node_modules/crypto-js/pad-iso10126.js
var require_pad_iso10126 = __commonJS({
  "node_modules/crypto-js/pad-iso10126.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.pad.Iso10126 = {
        pad: function(data, blockSize) {
          var blockSizeBytes = blockSize * 4;
          var nPaddingBytes = blockSizeBytes - data.sigBytes % blockSizeBytes;
          data.concat(CryptoJS2.lib.WordArray.random(nPaddingBytes - 1)).concat(CryptoJS2.lib.WordArray.create([nPaddingBytes << 24], 1));
        },
        unpad: function(data) {
          var nPaddingBytes = data.words[data.sigBytes - 1 >>> 2] & 255;
          data.sigBytes -= nPaddingBytes;
        }
      };
      return CryptoJS2.pad.Iso10126;
    });
  }
});

// node_modules/crypto-js/pad-iso97971.js
var require_pad_iso97971 = __commonJS({
  "node_modules/crypto-js/pad-iso97971.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.pad.Iso97971 = {
        pad: function(data, blockSize) {
          data.concat(CryptoJS2.lib.WordArray.create([2147483648], 1));
          CryptoJS2.pad.ZeroPadding.pad(data, blockSize);
        },
        unpad: function(data) {
          CryptoJS2.pad.ZeroPadding.unpad(data);
          data.sigBytes--;
        }
      };
      return CryptoJS2.pad.Iso97971;
    });
  }
});

// node_modules/crypto-js/pad-zeropadding.js
var require_pad_zeropadding = __commonJS({
  "node_modules/crypto-js/pad-zeropadding.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.pad.ZeroPadding = {
        pad: function(data, blockSize) {
          var blockSizeBytes = blockSize * 4;
          data.clamp();
          data.sigBytes += blockSizeBytes - (data.sigBytes % blockSizeBytes || blockSizeBytes);
        },
        unpad: function(data) {
          var dataWords = data.words;
          var i = data.sigBytes - 1;
          for (var i = data.sigBytes - 1; i >= 0; i--) {
            if (dataWords[i >>> 2] >>> 24 - i % 4 * 8 & 255) {
              data.sigBytes = i + 1;
              break;
            }
          }
        }
      };
      return CryptoJS2.pad.ZeroPadding;
    });
  }
});

// node_modules/crypto-js/pad-nopadding.js
var require_pad_nopadding = __commonJS({
  "node_modules/crypto-js/pad-nopadding.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      CryptoJS2.pad.NoPadding = {
        pad: function() {
        },
        unpad: function() {
        }
      };
      return CryptoJS2.pad.NoPadding;
    });
  }
});

// node_modules/crypto-js/format-hex.js
var require_format_hex = __commonJS({
  "node_modules/crypto-js/format-hex.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function(undefined2) {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var CipherParams = C_lib.CipherParams;
        var C_enc = C.enc;
        var Hex = C_enc.Hex;
        var C_format = C.format;
        var HexFormatter = C_format.Hex = {
          /**
           * Converts the ciphertext of a cipher params object to a hexadecimally encoded string.
           *
           * @param {CipherParams} cipherParams The cipher params object.
           *
           * @return {string} The hexadecimally encoded string.
           *
           * @static
           *
           * @example
           *
           *     var hexString = CryptoJS.format.Hex.stringify(cipherParams);
           */
          stringify: function(cipherParams) {
            return cipherParams.ciphertext.toString(Hex);
          },
          /**
           * Converts a hexadecimally encoded ciphertext string to a cipher params object.
           *
           * @param {string} input The hexadecimally encoded string.
           *
           * @return {CipherParams} The cipher params object.
           *
           * @static
           *
           * @example
           *
           *     var cipherParams = CryptoJS.format.Hex.parse(hexString);
           */
          parse: function(input) {
            var ciphertext = Hex.parse(input);
            return CipherParams.create({ ciphertext });
          }
        };
      })();
      return CryptoJS2.format.Hex;
    });
  }
});

// node_modules/crypto-js/aes.js
var require_aes = __commonJS({
  "node_modules/crypto-js/aes.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        var SBOX = [];
        var INV_SBOX = [];
        var SUB_MIX_0 = [];
        var SUB_MIX_1 = [];
        var SUB_MIX_2 = [];
        var SUB_MIX_3 = [];
        var INV_SUB_MIX_0 = [];
        var INV_SUB_MIX_1 = [];
        var INV_SUB_MIX_2 = [];
        var INV_SUB_MIX_3 = [];
        (function() {
          var d = [];
          for (var i = 0; i < 256; i++) {
            if (i < 128) {
              d[i] = i << 1;
            } else {
              d[i] = i << 1 ^ 283;
            }
          }
          var x = 0;
          var xi = 0;
          for (var i = 0; i < 256; i++) {
            var sx = xi ^ xi << 1 ^ xi << 2 ^ xi << 3 ^ xi << 4;
            sx = sx >>> 8 ^ sx & 255 ^ 99;
            SBOX[x] = sx;
            INV_SBOX[sx] = x;
            var x2 = d[x];
            var x4 = d[x2];
            var x8 = d[x4];
            var t = d[sx] * 257 ^ sx * 16843008;
            SUB_MIX_0[x] = t << 24 | t >>> 8;
            SUB_MIX_1[x] = t << 16 | t >>> 16;
            SUB_MIX_2[x] = t << 8 | t >>> 24;
            SUB_MIX_3[x] = t;
            var t = x8 * 16843009 ^ x4 * 65537 ^ x2 * 257 ^ x * 16843008;
            INV_SUB_MIX_0[sx] = t << 24 | t >>> 8;
            INV_SUB_MIX_1[sx] = t << 16 | t >>> 16;
            INV_SUB_MIX_2[sx] = t << 8 | t >>> 24;
            INV_SUB_MIX_3[sx] = t;
            if (!x) {
              x = xi = 1;
            } else {
              x = x2 ^ d[d[d[x8 ^ x2]]];
              xi ^= d[d[xi]];
            }
          }
        })();
        var RCON = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54];
        var AES = C_algo.AES = BlockCipher.extend({
          _doReset: function() {
            var t;
            if (this._nRounds && this._keyPriorReset === this._key) {
              return;
            }
            var key = this._keyPriorReset = this._key;
            var keyWords = key.words;
            var keySize = key.sigBytes / 4;
            var nRounds = this._nRounds = keySize + 6;
            var ksRows = (nRounds + 1) * 4;
            var keySchedule = this._keySchedule = [];
            for (var ksRow = 0; ksRow < ksRows; ksRow++) {
              if (ksRow < keySize) {
                keySchedule[ksRow] = keyWords[ksRow];
              } else {
                t = keySchedule[ksRow - 1];
                if (!(ksRow % keySize)) {
                  t = t << 8 | t >>> 24;
                  t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
                  t ^= RCON[ksRow / keySize | 0] << 24;
                } else if (keySize > 6 && ksRow % keySize == 4) {
                  t = SBOX[t >>> 24] << 24 | SBOX[t >>> 16 & 255] << 16 | SBOX[t >>> 8 & 255] << 8 | SBOX[t & 255];
                }
                keySchedule[ksRow] = keySchedule[ksRow - keySize] ^ t;
              }
            }
            var invKeySchedule = this._invKeySchedule = [];
            for (var invKsRow = 0; invKsRow < ksRows; invKsRow++) {
              var ksRow = ksRows - invKsRow;
              if (invKsRow % 4) {
                var t = keySchedule[ksRow];
              } else {
                var t = keySchedule[ksRow - 4];
              }
              if (invKsRow < 4 || ksRow <= 4) {
                invKeySchedule[invKsRow] = t;
              } else {
                invKeySchedule[invKsRow] = INV_SUB_MIX_0[SBOX[t >>> 24]] ^ INV_SUB_MIX_1[SBOX[t >>> 16 & 255]] ^ INV_SUB_MIX_2[SBOX[t >>> 8 & 255]] ^ INV_SUB_MIX_3[SBOX[t & 255]];
              }
            }
          },
          encryptBlock: function(M, offset) {
            this._doCryptBlock(M, offset, this._keySchedule, SUB_MIX_0, SUB_MIX_1, SUB_MIX_2, SUB_MIX_3, SBOX);
          },
          decryptBlock: function(M, offset) {
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;
            this._doCryptBlock(M, offset, this._invKeySchedule, INV_SUB_MIX_0, INV_SUB_MIX_1, INV_SUB_MIX_2, INV_SUB_MIX_3, INV_SBOX);
            var t = M[offset + 1];
            M[offset + 1] = M[offset + 3];
            M[offset + 3] = t;
          },
          _doCryptBlock: function(M, offset, keySchedule, SUB_MIX_02, SUB_MIX_12, SUB_MIX_22, SUB_MIX_32, SBOX2) {
            var nRounds = this._nRounds;
            var s0 = M[offset] ^ keySchedule[0];
            var s1 = M[offset + 1] ^ keySchedule[1];
            var s2 = M[offset + 2] ^ keySchedule[2];
            var s3 = M[offset + 3] ^ keySchedule[3];
            var ksRow = 4;
            for (var round = 1; round < nRounds; round++) {
              var t0 = SUB_MIX_02[s0 >>> 24] ^ SUB_MIX_12[s1 >>> 16 & 255] ^ SUB_MIX_22[s2 >>> 8 & 255] ^ SUB_MIX_32[s3 & 255] ^ keySchedule[ksRow++];
              var t1 = SUB_MIX_02[s1 >>> 24] ^ SUB_MIX_12[s2 >>> 16 & 255] ^ SUB_MIX_22[s3 >>> 8 & 255] ^ SUB_MIX_32[s0 & 255] ^ keySchedule[ksRow++];
              var t2 = SUB_MIX_02[s2 >>> 24] ^ SUB_MIX_12[s3 >>> 16 & 255] ^ SUB_MIX_22[s0 >>> 8 & 255] ^ SUB_MIX_32[s1 & 255] ^ keySchedule[ksRow++];
              var t3 = SUB_MIX_02[s3 >>> 24] ^ SUB_MIX_12[s0 >>> 16 & 255] ^ SUB_MIX_22[s1 >>> 8 & 255] ^ SUB_MIX_32[s2 & 255] ^ keySchedule[ksRow++];
              s0 = t0;
              s1 = t1;
              s2 = t2;
              s3 = t3;
            }
            var t0 = (SBOX2[s0 >>> 24] << 24 | SBOX2[s1 >>> 16 & 255] << 16 | SBOX2[s2 >>> 8 & 255] << 8 | SBOX2[s3 & 255]) ^ keySchedule[ksRow++];
            var t1 = (SBOX2[s1 >>> 24] << 24 | SBOX2[s2 >>> 16 & 255] << 16 | SBOX2[s3 >>> 8 & 255] << 8 | SBOX2[s0 & 255]) ^ keySchedule[ksRow++];
            var t2 = (SBOX2[s2 >>> 24] << 24 | SBOX2[s3 >>> 16 & 255] << 16 | SBOX2[s0 >>> 8 & 255] << 8 | SBOX2[s1 & 255]) ^ keySchedule[ksRow++];
            var t3 = (SBOX2[s3 >>> 24] << 24 | SBOX2[s0 >>> 16 & 255] << 16 | SBOX2[s1 >>> 8 & 255] << 8 | SBOX2[s2 & 255]) ^ keySchedule[ksRow++];
            M[offset] = t0;
            M[offset + 1] = t1;
            M[offset + 2] = t2;
            M[offset + 3] = t3;
          },
          keySize: 256 / 32
        });
        C.AES = BlockCipher._createHelper(AES);
      })();
      return CryptoJS2.AES;
    });
  }
});

// node_modules/crypto-js/tripledes.js
var require_tripledes = __commonJS({
  "node_modules/crypto-js/tripledes.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var WordArray = C_lib.WordArray;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        var PC1 = [
          57,
          49,
          41,
          33,
          25,
          17,
          9,
          1,
          58,
          50,
          42,
          34,
          26,
          18,
          10,
          2,
          59,
          51,
          43,
          35,
          27,
          19,
          11,
          3,
          60,
          52,
          44,
          36,
          63,
          55,
          47,
          39,
          31,
          23,
          15,
          7,
          62,
          54,
          46,
          38,
          30,
          22,
          14,
          6,
          61,
          53,
          45,
          37,
          29,
          21,
          13,
          5,
          28,
          20,
          12,
          4
        ];
        var PC2 = [
          14,
          17,
          11,
          24,
          1,
          5,
          3,
          28,
          15,
          6,
          21,
          10,
          23,
          19,
          12,
          4,
          26,
          8,
          16,
          7,
          27,
          20,
          13,
          2,
          41,
          52,
          31,
          37,
          47,
          55,
          30,
          40,
          51,
          45,
          33,
          48,
          44,
          49,
          39,
          56,
          34,
          53,
          46,
          42,
          50,
          36,
          29,
          32
        ];
        var BIT_SHIFTS = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28];
        var SBOX_P = [
          {
            0: 8421888,
            268435456: 32768,
            536870912: 8421378,
            805306368: 2,
            1073741824: 512,
            1342177280: 8421890,
            1610612736: 8389122,
            1879048192: 8388608,
            2147483648: 514,
            2415919104: 8389120,
            2684354560: 33280,
            2952790016: 8421376,
            3221225472: 32770,
            3489660928: 8388610,
            3758096384: 0,
            4026531840: 33282,
            134217728: 0,
            402653184: 8421890,
            671088640: 33282,
            939524096: 32768,
            1207959552: 8421888,
            1476395008: 512,
            1744830464: 8421378,
            2013265920: 2,
            2281701376: 8389120,
            2550136832: 33280,
            2818572288: 8421376,
            3087007744: 8389122,
            3355443200: 8388610,
            3623878656: 32770,
            3892314112: 514,
            4160749568: 8388608,
            1: 32768,
            268435457: 2,
            536870913: 8421888,
            805306369: 8388608,
            1073741825: 8421378,
            1342177281: 33280,
            1610612737: 512,
            1879048193: 8389122,
            2147483649: 8421890,
            2415919105: 8421376,
            2684354561: 8388610,
            2952790017: 33282,
            3221225473: 514,
            3489660929: 8389120,
            3758096385: 32770,
            4026531841: 0,
            134217729: 8421890,
            402653185: 8421376,
            671088641: 8388608,
            939524097: 512,
            1207959553: 32768,
            1476395009: 8388610,
            1744830465: 2,
            2013265921: 33282,
            2281701377: 32770,
            2550136833: 8389122,
            2818572289: 514,
            3087007745: 8421888,
            3355443201: 8389120,
            3623878657: 0,
            3892314113: 33280,
            4160749569: 8421378
          },
          {
            0: 1074282512,
            16777216: 16384,
            33554432: 524288,
            50331648: 1074266128,
            67108864: 1073741840,
            83886080: 1074282496,
            100663296: 1073758208,
            117440512: 16,
            134217728: 540672,
            150994944: 1073758224,
            167772160: 1073741824,
            184549376: 540688,
            201326592: 524304,
            218103808: 0,
            234881024: 16400,
            251658240: 1074266112,
            8388608: 1073758208,
            25165824: 540688,
            41943040: 16,
            58720256: 1073758224,
            75497472: 1074282512,
            92274688: 1073741824,
            109051904: 524288,
            125829120: 1074266128,
            142606336: 524304,
            159383552: 0,
            176160768: 16384,
            192937984: 1074266112,
            209715200: 1073741840,
            226492416: 540672,
            243269632: 1074282496,
            260046848: 16400,
            268435456: 0,
            285212672: 1074266128,
            301989888: 1073758224,
            318767104: 1074282496,
            335544320: 1074266112,
            352321536: 16,
            369098752: 540688,
            385875968: 16384,
            402653184: 16400,
            419430400: 524288,
            436207616: 524304,
            452984832: 1073741840,
            469762048: 540672,
            486539264: 1073758208,
            503316480: 1073741824,
            520093696: 1074282512,
            276824064: 540688,
            293601280: 524288,
            310378496: 1074266112,
            327155712: 16384,
            343932928: 1073758208,
            360710144: 1074282512,
            377487360: 16,
            394264576: 1073741824,
            411041792: 1074282496,
            427819008: 1073741840,
            444596224: 1073758224,
            461373440: 524304,
            478150656: 0,
            494927872: 16400,
            511705088: 1074266128,
            528482304: 540672
          },
          {
            0: 260,
            1048576: 0,
            2097152: 67109120,
            3145728: 65796,
            4194304: 65540,
            5242880: 67108868,
            6291456: 67174660,
            7340032: 67174400,
            8388608: 67108864,
            9437184: 67174656,
            10485760: 65792,
            11534336: 67174404,
            12582912: 67109124,
            13631488: 65536,
            14680064: 4,
            15728640: 256,
            524288: 67174656,
            1572864: 67174404,
            2621440: 0,
            3670016: 67109120,
            4718592: 67108868,
            5767168: 65536,
            6815744: 65540,
            7864320: 260,
            8912896: 4,
            9961472: 256,
            11010048: 67174400,
            12058624: 65796,
            13107200: 65792,
            14155776: 67109124,
            15204352: 67174660,
            16252928: 67108864,
            16777216: 67174656,
            17825792: 65540,
            18874368: 65536,
            19922944: 67109120,
            20971520: 256,
            22020096: 67174660,
            23068672: 67108868,
            24117248: 0,
            25165824: 67109124,
            26214400: 67108864,
            27262976: 4,
            28311552: 65792,
            29360128: 67174400,
            30408704: 260,
            31457280: 65796,
            32505856: 67174404,
            17301504: 67108864,
            18350080: 260,
            19398656: 67174656,
            20447232: 0,
            21495808: 65540,
            22544384: 67109120,
            23592960: 256,
            24641536: 67174404,
            25690112: 65536,
            26738688: 67174660,
            27787264: 65796,
            28835840: 67108868,
            29884416: 67109124,
            30932992: 67174400,
            31981568: 4,
            33030144: 65792
          },
          {
            0: 2151682048,
            65536: 2147487808,
            131072: 4198464,
            196608: 2151677952,
            262144: 0,
            327680: 4198400,
            393216: 2147483712,
            458752: 4194368,
            524288: 2147483648,
            589824: 4194304,
            655360: 64,
            720896: 2147487744,
            786432: 2151678016,
            851968: 4160,
            917504: 4096,
            983040: 2151682112,
            32768: 2147487808,
            98304: 64,
            163840: 2151678016,
            229376: 2147487744,
            294912: 4198400,
            360448: 2151682112,
            425984: 0,
            491520: 2151677952,
            557056: 4096,
            622592: 2151682048,
            688128: 4194304,
            753664: 4160,
            819200: 2147483648,
            884736: 4194368,
            950272: 4198464,
            1015808: 2147483712,
            1048576: 4194368,
            1114112: 4198400,
            1179648: 2147483712,
            1245184: 0,
            1310720: 4160,
            1376256: 2151678016,
            1441792: 2151682048,
            1507328: 2147487808,
            1572864: 2151682112,
            1638400: 2147483648,
            1703936: 2151677952,
            1769472: 4198464,
            1835008: 2147487744,
            1900544: 4194304,
            1966080: 64,
            2031616: 4096,
            1081344: 2151677952,
            1146880: 2151682112,
            1212416: 0,
            1277952: 4198400,
            1343488: 4194368,
            1409024: 2147483648,
            1474560: 2147487808,
            1540096: 64,
            1605632: 2147483712,
            1671168: 4096,
            1736704: 2147487744,
            1802240: 2151678016,
            1867776: 4160,
            1933312: 2151682048,
            1998848: 4194304,
            2064384: 4198464
          },
          {
            0: 128,
            4096: 17039360,
            8192: 262144,
            12288: 536870912,
            16384: 537133184,
            20480: 16777344,
            24576: 553648256,
            28672: 262272,
            32768: 16777216,
            36864: 537133056,
            40960: 536871040,
            45056: 553910400,
            49152: 553910272,
            53248: 0,
            57344: 17039488,
            61440: 553648128,
            2048: 17039488,
            6144: 553648256,
            10240: 128,
            14336: 17039360,
            18432: 262144,
            22528: 537133184,
            26624: 553910272,
            30720: 536870912,
            34816: 537133056,
            38912: 0,
            43008: 553910400,
            47104: 16777344,
            51200: 536871040,
            55296: 553648128,
            59392: 16777216,
            63488: 262272,
            65536: 262144,
            69632: 128,
            73728: 536870912,
            77824: 553648256,
            81920: 16777344,
            86016: 553910272,
            90112: 537133184,
            94208: 16777216,
            98304: 553910400,
            102400: 553648128,
            106496: 17039360,
            110592: 537133056,
            114688: 262272,
            118784: 536871040,
            122880: 0,
            126976: 17039488,
            67584: 553648256,
            71680: 16777216,
            75776: 17039360,
            79872: 537133184,
            83968: 536870912,
            88064: 17039488,
            92160: 128,
            96256: 553910272,
            100352: 262272,
            104448: 553910400,
            108544: 0,
            112640: 553648128,
            116736: 16777344,
            120832: 262144,
            124928: 537133056,
            129024: 536871040
          },
          {
            0: 268435464,
            256: 8192,
            512: 270532608,
            768: 270540808,
            1024: 268443648,
            1280: 2097152,
            1536: 2097160,
            1792: 268435456,
            2048: 0,
            2304: 268443656,
            2560: 2105344,
            2816: 8,
            3072: 270532616,
            3328: 2105352,
            3584: 8200,
            3840: 270540800,
            128: 270532608,
            384: 270540808,
            640: 8,
            896: 2097152,
            1152: 2105352,
            1408: 268435464,
            1664: 268443648,
            1920: 8200,
            2176: 2097160,
            2432: 8192,
            2688: 268443656,
            2944: 270532616,
            3200: 0,
            3456: 270540800,
            3712: 2105344,
            3968: 268435456,
            4096: 268443648,
            4352: 270532616,
            4608: 270540808,
            4864: 8200,
            5120: 2097152,
            5376: 268435456,
            5632: 268435464,
            5888: 2105344,
            6144: 2105352,
            6400: 0,
            6656: 8,
            6912: 270532608,
            7168: 8192,
            7424: 268443656,
            7680: 270540800,
            7936: 2097160,
            4224: 8,
            4480: 2105344,
            4736: 2097152,
            4992: 268435464,
            5248: 268443648,
            5504: 8200,
            5760: 270540808,
            6016: 270532608,
            6272: 270540800,
            6528: 270532616,
            6784: 8192,
            7040: 2105352,
            7296: 2097160,
            7552: 0,
            7808: 268435456,
            8064: 268443656
          },
          {
            0: 1048576,
            16: 33555457,
            32: 1024,
            48: 1049601,
            64: 34604033,
            80: 0,
            96: 1,
            112: 34603009,
            128: 33555456,
            144: 1048577,
            160: 33554433,
            176: 34604032,
            192: 34603008,
            208: 1025,
            224: 1049600,
            240: 33554432,
            8: 34603009,
            24: 0,
            40: 33555457,
            56: 34604032,
            72: 1048576,
            88: 33554433,
            104: 33554432,
            120: 1025,
            136: 1049601,
            152: 33555456,
            168: 34603008,
            184: 1048577,
            200: 1024,
            216: 34604033,
            232: 1,
            248: 1049600,
            256: 33554432,
            272: 1048576,
            288: 33555457,
            304: 34603009,
            320: 1048577,
            336: 33555456,
            352: 34604032,
            368: 1049601,
            384: 1025,
            400: 34604033,
            416: 1049600,
            432: 1,
            448: 0,
            464: 34603008,
            480: 33554433,
            496: 1024,
            264: 1049600,
            280: 33555457,
            296: 34603009,
            312: 1,
            328: 33554432,
            344: 1048576,
            360: 1025,
            376: 34604032,
            392: 33554433,
            408: 34603008,
            424: 0,
            440: 34604033,
            456: 1049601,
            472: 1024,
            488: 33555456,
            504: 1048577
          },
          {
            0: 134219808,
            1: 131072,
            2: 134217728,
            3: 32,
            4: 131104,
            5: 134350880,
            6: 134350848,
            7: 2048,
            8: 134348800,
            9: 134219776,
            10: 133120,
            11: 134348832,
            12: 2080,
            13: 0,
            14: 134217760,
            15: 133152,
            2147483648: 2048,
            2147483649: 134350880,
            2147483650: 134219808,
            2147483651: 134217728,
            2147483652: 134348800,
            2147483653: 133120,
            2147483654: 133152,
            2147483655: 32,
            2147483656: 134217760,
            2147483657: 2080,
            2147483658: 131104,
            2147483659: 134350848,
            2147483660: 0,
            2147483661: 134348832,
            2147483662: 134219776,
            2147483663: 131072,
            16: 133152,
            17: 134350848,
            18: 32,
            19: 2048,
            20: 134219776,
            21: 134217760,
            22: 134348832,
            23: 131072,
            24: 0,
            25: 131104,
            26: 134348800,
            27: 134219808,
            28: 134350880,
            29: 133120,
            30: 2080,
            31: 134217728,
            2147483664: 131072,
            2147483665: 2048,
            2147483666: 134348832,
            2147483667: 133152,
            2147483668: 32,
            2147483669: 134348800,
            2147483670: 134217728,
            2147483671: 134219808,
            2147483672: 134350880,
            2147483673: 134217760,
            2147483674: 134219776,
            2147483675: 0,
            2147483676: 133120,
            2147483677: 2080,
            2147483678: 131104,
            2147483679: 134350848
          }
        ];
        var SBOX_MASK = [
          4160749569,
          528482304,
          33030144,
          2064384,
          129024,
          8064,
          504,
          2147483679
        ];
        var DES = C_algo.DES = BlockCipher.extend({
          _doReset: function() {
            var key = this._key;
            var keyWords = key.words;
            var keyBits = [];
            for (var i = 0; i < 56; i++) {
              var keyBitPos = PC1[i] - 1;
              keyBits[i] = keyWords[keyBitPos >>> 5] >>> 31 - keyBitPos % 32 & 1;
            }
            var subKeys = this._subKeys = [];
            for (var nSubKey = 0; nSubKey < 16; nSubKey++) {
              var subKey = subKeys[nSubKey] = [];
              var bitShift = BIT_SHIFTS[nSubKey];
              for (var i = 0; i < 24; i++) {
                subKey[i / 6 | 0] |= keyBits[(PC2[i] - 1 + bitShift) % 28] << 31 - i % 6;
                subKey[4 + (i / 6 | 0)] |= keyBits[28 + (PC2[i + 24] - 1 + bitShift) % 28] << 31 - i % 6;
              }
              subKey[0] = subKey[0] << 1 | subKey[0] >>> 31;
              for (var i = 1; i < 7; i++) {
                subKey[i] = subKey[i] >>> (i - 1) * 4 + 3;
              }
              subKey[7] = subKey[7] << 5 | subKey[7] >>> 27;
            }
            var invSubKeys = this._invSubKeys = [];
            for (var i = 0; i < 16; i++) {
              invSubKeys[i] = subKeys[15 - i];
            }
          },
          encryptBlock: function(M, offset) {
            this._doCryptBlock(M, offset, this._subKeys);
          },
          decryptBlock: function(M, offset) {
            this._doCryptBlock(M, offset, this._invSubKeys);
          },
          _doCryptBlock: function(M, offset, subKeys) {
            this._lBlock = M[offset];
            this._rBlock = M[offset + 1];
            exchangeLR.call(this, 4, 252645135);
            exchangeLR.call(this, 16, 65535);
            exchangeRL.call(this, 2, 858993459);
            exchangeRL.call(this, 8, 16711935);
            exchangeLR.call(this, 1, 1431655765);
            for (var round = 0; round < 16; round++) {
              var subKey = subKeys[round];
              var lBlock = this._lBlock;
              var rBlock = this._rBlock;
              var f = 0;
              for (var i = 0; i < 8; i++) {
                f |= SBOX_P[i][((rBlock ^ subKey[i]) & SBOX_MASK[i]) >>> 0];
              }
              this._lBlock = rBlock;
              this._rBlock = lBlock ^ f;
            }
            var t = this._lBlock;
            this._lBlock = this._rBlock;
            this._rBlock = t;
            exchangeLR.call(this, 1, 1431655765);
            exchangeRL.call(this, 8, 16711935);
            exchangeRL.call(this, 2, 858993459);
            exchangeLR.call(this, 16, 65535);
            exchangeLR.call(this, 4, 252645135);
            M[offset] = this._lBlock;
            M[offset + 1] = this._rBlock;
          },
          keySize: 64 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        function exchangeLR(offset, mask) {
          var t = (this._lBlock >>> offset ^ this._rBlock) & mask;
          this._rBlock ^= t;
          this._lBlock ^= t << offset;
        }
        function exchangeRL(offset, mask) {
          var t = (this._rBlock >>> offset ^ this._lBlock) & mask;
          this._lBlock ^= t;
          this._rBlock ^= t << offset;
        }
        C.DES = BlockCipher._createHelper(DES);
        var TripleDES = C_algo.TripleDES = BlockCipher.extend({
          _doReset: function() {
            var key = this._key;
            var keyWords = key.words;
            if (keyWords.length !== 2 && keyWords.length !== 4 && keyWords.length < 6) {
              throw new Error("Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.");
            }
            var key1 = keyWords.slice(0, 2);
            var key2 = keyWords.length < 4 ? keyWords.slice(0, 2) : keyWords.slice(2, 4);
            var key3 = keyWords.length < 6 ? keyWords.slice(0, 2) : keyWords.slice(4, 6);
            this._des1 = DES.createEncryptor(WordArray.create(key1));
            this._des2 = DES.createEncryptor(WordArray.create(key2));
            this._des3 = DES.createEncryptor(WordArray.create(key3));
          },
          encryptBlock: function(M, offset) {
            this._des1.encryptBlock(M, offset);
            this._des2.decryptBlock(M, offset);
            this._des3.encryptBlock(M, offset);
          },
          decryptBlock: function(M, offset) {
            this._des3.decryptBlock(M, offset);
            this._des2.encryptBlock(M, offset);
            this._des1.decryptBlock(M, offset);
          },
          keySize: 192 / 32,
          ivSize: 64 / 32,
          blockSize: 64 / 32
        });
        C.TripleDES = BlockCipher._createHelper(TripleDES);
      })();
      return CryptoJS2.TripleDES;
    });
  }
});

// node_modules/crypto-js/rc4.js
var require_rc4 = __commonJS({
  "node_modules/crypto-js/rc4.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var RC4 = C_algo.RC4 = StreamCipher.extend({
          _doReset: function() {
            var key = this._key;
            var keyWords = key.words;
            var keySigBytes = key.sigBytes;
            var S = this._S = [];
            for (var i = 0; i < 256; i++) {
              S[i] = i;
            }
            for (var i = 0, j = 0; i < 256; i++) {
              var keyByteIndex = i % keySigBytes;
              var keyByte = keyWords[keyByteIndex >>> 2] >>> 24 - keyByteIndex % 4 * 8 & 255;
              j = (j + S[i] + keyByte) % 256;
              var t = S[i];
              S[i] = S[j];
              S[j] = t;
            }
            this._i = this._j = 0;
          },
          _doProcessBlock: function(M, offset) {
            M[offset] ^= generateKeystreamWord.call(this);
          },
          keySize: 256 / 32,
          ivSize: 0
        });
        function generateKeystreamWord() {
          var S = this._S;
          var i = this._i;
          var j = this._j;
          var keystreamWord = 0;
          for (var n = 0; n < 4; n++) {
            i = (i + 1) % 256;
            j = (j + S[i]) % 256;
            var t = S[i];
            S[i] = S[j];
            S[j] = t;
            keystreamWord |= S[(S[i] + S[j]) % 256] << 24 - n * 8;
          }
          this._i = i;
          this._j = j;
          return keystreamWord;
        }
        C.RC4 = StreamCipher._createHelper(RC4);
        var RC4Drop = C_algo.RC4Drop = RC4.extend({
          /**
           * Configuration options.
           *
           * @property {number} drop The number of keystream words to drop. Default 192
           */
          cfg: RC4.cfg.extend({
            drop: 192
          }),
          _doReset: function() {
            RC4._doReset.call(this);
            for (var i = this.cfg.drop; i > 0; i--) {
              generateKeystreamWord.call(this);
            }
          }
        });
        C.RC4Drop = StreamCipher._createHelper(RC4Drop);
      })();
      return CryptoJS2.RC4;
    });
  }
});

// node_modules/crypto-js/rabbit.js
var require_rabbit = __commonJS({
  "node_modules/crypto-js/rabbit.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var S = [];
        var C_ = [];
        var G = [];
        var Rabbit = C_algo.Rabbit = StreamCipher.extend({
          _doReset: function() {
            var K = this._key.words;
            var iv = this.cfg.iv;
            for (var i = 0; i < 4; i++) {
              K[i] = (K[i] << 8 | K[i] >>> 24) & 16711935 | (K[i] << 24 | K[i] >>> 8) & 4278255360;
            }
            var X = this._X = [
              K[0],
              K[3] << 16 | K[2] >>> 16,
              K[1],
              K[0] << 16 | K[3] >>> 16,
              K[2],
              K[1] << 16 | K[0] >>> 16,
              K[3],
              K[2] << 16 | K[1] >>> 16
            ];
            var C2 = this._C = [
              K[2] << 16 | K[2] >>> 16,
              K[0] & 4294901760 | K[1] & 65535,
              K[3] << 16 | K[3] >>> 16,
              K[1] & 4294901760 | K[2] & 65535,
              K[0] << 16 | K[0] >>> 16,
              K[2] & 4294901760 | K[3] & 65535,
              K[1] << 16 | K[1] >>> 16,
              K[3] & 4294901760 | K[0] & 65535
            ];
            this._b = 0;
            for (var i = 0; i < 4; i++) {
              nextState.call(this);
            }
            for (var i = 0; i < 8; i++) {
              C2[i] ^= X[i + 4 & 7];
            }
            if (iv) {
              var IV = iv.words;
              var IV_0 = IV[0];
              var IV_1 = IV[1];
              var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
              var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
              var i1 = i0 >>> 16 | i2 & 4294901760;
              var i3 = i2 << 16 | i0 & 65535;
              C2[0] ^= i0;
              C2[1] ^= i1;
              C2[2] ^= i2;
              C2[3] ^= i3;
              C2[4] ^= i0;
              C2[5] ^= i1;
              C2[6] ^= i2;
              C2[7] ^= i3;
              for (var i = 0; i < 4; i++) {
                nextState.call(this);
              }
            }
          },
          _doProcessBlock: function(M, offset) {
            var X = this._X;
            nextState.call(this);
            S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
            S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
            S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
            S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
            for (var i = 0; i < 4; i++) {
              S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
              M[offset + i] ^= S[i];
            }
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function nextState() {
          var X = this._X;
          var C2 = this._C;
          for (var i = 0; i < 8; i++) {
            C_[i] = C2[i];
          }
          C2[0] = C2[0] + 1295307597 + this._b | 0;
          C2[1] = C2[1] + 3545052371 + (C2[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
          C2[2] = C2[2] + 886263092 + (C2[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
          C2[3] = C2[3] + 1295307597 + (C2[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
          C2[4] = C2[4] + 3545052371 + (C2[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
          C2[5] = C2[5] + 886263092 + (C2[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
          C2[6] = C2[6] + 1295307597 + (C2[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
          C2[7] = C2[7] + 3545052371 + (C2[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
          this._b = C2[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
          for (var i = 0; i < 8; i++) {
            var gx = X[i] + C2[i];
            var ga = gx & 65535;
            var gb = gx >>> 16;
            var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
            var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
            G[i] = gh ^ gl;
          }
          X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
          X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
          X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
          X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
          X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
          X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
          X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
          X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0;
        }
        C.Rabbit = StreamCipher._createHelper(Rabbit);
      })();
      return CryptoJS2.Rabbit;
    });
  }
});

// node_modules/crypto-js/rabbit-legacy.js
var require_rabbit_legacy = __commonJS({
  "node_modules/crypto-js/rabbit-legacy.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var StreamCipher = C_lib.StreamCipher;
        var C_algo = C.algo;
        var S = [];
        var C_ = [];
        var G = [];
        var RabbitLegacy = C_algo.RabbitLegacy = StreamCipher.extend({
          _doReset: function() {
            var K = this._key.words;
            var iv = this.cfg.iv;
            var X = this._X = [
              K[0],
              K[3] << 16 | K[2] >>> 16,
              K[1],
              K[0] << 16 | K[3] >>> 16,
              K[2],
              K[1] << 16 | K[0] >>> 16,
              K[3],
              K[2] << 16 | K[1] >>> 16
            ];
            var C2 = this._C = [
              K[2] << 16 | K[2] >>> 16,
              K[0] & 4294901760 | K[1] & 65535,
              K[3] << 16 | K[3] >>> 16,
              K[1] & 4294901760 | K[2] & 65535,
              K[0] << 16 | K[0] >>> 16,
              K[2] & 4294901760 | K[3] & 65535,
              K[1] << 16 | K[1] >>> 16,
              K[3] & 4294901760 | K[0] & 65535
            ];
            this._b = 0;
            for (var i = 0; i < 4; i++) {
              nextState.call(this);
            }
            for (var i = 0; i < 8; i++) {
              C2[i] ^= X[i + 4 & 7];
            }
            if (iv) {
              var IV = iv.words;
              var IV_0 = IV[0];
              var IV_1 = IV[1];
              var i0 = (IV_0 << 8 | IV_0 >>> 24) & 16711935 | (IV_0 << 24 | IV_0 >>> 8) & 4278255360;
              var i2 = (IV_1 << 8 | IV_1 >>> 24) & 16711935 | (IV_1 << 24 | IV_1 >>> 8) & 4278255360;
              var i1 = i0 >>> 16 | i2 & 4294901760;
              var i3 = i2 << 16 | i0 & 65535;
              C2[0] ^= i0;
              C2[1] ^= i1;
              C2[2] ^= i2;
              C2[3] ^= i3;
              C2[4] ^= i0;
              C2[5] ^= i1;
              C2[6] ^= i2;
              C2[7] ^= i3;
              for (var i = 0; i < 4; i++) {
                nextState.call(this);
              }
            }
          },
          _doProcessBlock: function(M, offset) {
            var X = this._X;
            nextState.call(this);
            S[0] = X[0] ^ X[5] >>> 16 ^ X[3] << 16;
            S[1] = X[2] ^ X[7] >>> 16 ^ X[5] << 16;
            S[2] = X[4] ^ X[1] >>> 16 ^ X[7] << 16;
            S[3] = X[6] ^ X[3] >>> 16 ^ X[1] << 16;
            for (var i = 0; i < 4; i++) {
              S[i] = (S[i] << 8 | S[i] >>> 24) & 16711935 | (S[i] << 24 | S[i] >>> 8) & 4278255360;
              M[offset + i] ^= S[i];
            }
          },
          blockSize: 128 / 32,
          ivSize: 64 / 32
        });
        function nextState() {
          var X = this._X;
          var C2 = this._C;
          for (var i = 0; i < 8; i++) {
            C_[i] = C2[i];
          }
          C2[0] = C2[0] + 1295307597 + this._b | 0;
          C2[1] = C2[1] + 3545052371 + (C2[0] >>> 0 < C_[0] >>> 0 ? 1 : 0) | 0;
          C2[2] = C2[2] + 886263092 + (C2[1] >>> 0 < C_[1] >>> 0 ? 1 : 0) | 0;
          C2[3] = C2[3] + 1295307597 + (C2[2] >>> 0 < C_[2] >>> 0 ? 1 : 0) | 0;
          C2[4] = C2[4] + 3545052371 + (C2[3] >>> 0 < C_[3] >>> 0 ? 1 : 0) | 0;
          C2[5] = C2[5] + 886263092 + (C2[4] >>> 0 < C_[4] >>> 0 ? 1 : 0) | 0;
          C2[6] = C2[6] + 1295307597 + (C2[5] >>> 0 < C_[5] >>> 0 ? 1 : 0) | 0;
          C2[7] = C2[7] + 3545052371 + (C2[6] >>> 0 < C_[6] >>> 0 ? 1 : 0) | 0;
          this._b = C2[7] >>> 0 < C_[7] >>> 0 ? 1 : 0;
          for (var i = 0; i < 8; i++) {
            var gx = X[i] + C2[i];
            var ga = gx & 65535;
            var gb = gx >>> 16;
            var gh = ((ga * ga >>> 17) + ga * gb >>> 15) + gb * gb;
            var gl = ((gx & 4294901760) * gx | 0) + ((gx & 65535) * gx | 0);
            G[i] = gh ^ gl;
          }
          X[0] = G[0] + (G[7] << 16 | G[7] >>> 16) + (G[6] << 16 | G[6] >>> 16) | 0;
          X[1] = G[1] + (G[0] << 8 | G[0] >>> 24) + G[7] | 0;
          X[2] = G[2] + (G[1] << 16 | G[1] >>> 16) + (G[0] << 16 | G[0] >>> 16) | 0;
          X[3] = G[3] + (G[2] << 8 | G[2] >>> 24) + G[1] | 0;
          X[4] = G[4] + (G[3] << 16 | G[3] >>> 16) + (G[2] << 16 | G[2] >>> 16) | 0;
          X[5] = G[5] + (G[4] << 8 | G[4] >>> 24) + G[3] | 0;
          X[6] = G[6] + (G[5] << 16 | G[5] >>> 16) + (G[4] << 16 | G[4] >>> 16) | 0;
          X[7] = G[7] + (G[6] << 8 | G[6] >>> 24) + G[5] | 0;
        }
        C.RabbitLegacy = StreamCipher._createHelper(RabbitLegacy);
      })();
      return CryptoJS2.RabbitLegacy;
    });
  }
});

// node_modules/crypto-js/blowfish.js
var require_blowfish = __commonJS({
  "node_modules/crypto-js/blowfish.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_enc_base64(), require_md5(), require_evpkdf(), require_cipher_core());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./enc-base64", "./md5", "./evpkdf", "./cipher-core"], factory);
      } else {
        factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      (function() {
        var C = CryptoJS2;
        var C_lib = C.lib;
        var BlockCipher = C_lib.BlockCipher;
        var C_algo = C.algo;
        const N = 16;
        const ORIG_P = [
          608135816,
          2242054355,
          320440878,
          57701188,
          2752067618,
          698298832,
          137296536,
          3964562569,
          1160258022,
          953160567,
          3193202383,
          887688300,
          3232508343,
          3380367581,
          1065670069,
          3041331479,
          2450970073,
          2306472731
        ];
        const ORIG_S = [
          [
            3509652390,
            2564797868,
            805139163,
            3491422135,
            3101798381,
            1780907670,
            3128725573,
            4046225305,
            614570311,
            3012652279,
            134345442,
            2240740374,
            1667834072,
            1901547113,
            2757295779,
            4103290238,
            227898511,
            1921955416,
            1904987480,
            2182433518,
            2069144605,
            3260701109,
            2620446009,
            720527379,
            3318853667,
            677414384,
            3393288472,
            3101374703,
            2390351024,
            1614419982,
            1822297739,
            2954791486,
            3608508353,
            3174124327,
            2024746970,
            1432378464,
            3864339955,
            2857741204,
            1464375394,
            1676153920,
            1439316330,
            715854006,
            3033291828,
            289532110,
            2706671279,
            2087905683,
            3018724369,
            1668267050,
            732546397,
            1947742710,
            3462151702,
            2609353502,
            2950085171,
            1814351708,
            2050118529,
            680887927,
            999245976,
            1800124847,
            3300911131,
            1713906067,
            1641548236,
            4213287313,
            1216130144,
            1575780402,
            4018429277,
            3917837745,
            3693486850,
            3949271944,
            596196993,
            3549867205,
            258830323,
            2213823033,
            772490370,
            2760122372,
            1774776394,
            2652871518,
            566650946,
            4142492826,
            1728879713,
            2882767088,
            1783734482,
            3629395816,
            2517608232,
            2874225571,
            1861159788,
            326777828,
            3124490320,
            2130389656,
            2716951837,
            967770486,
            1724537150,
            2185432712,
            2364442137,
            1164943284,
            2105845187,
            998989502,
            3765401048,
            2244026483,
            1075463327,
            1455516326,
            1322494562,
            910128902,
            469688178,
            1117454909,
            936433444,
            3490320968,
            3675253459,
            1240580251,
            122909385,
            2157517691,
            634681816,
            4142456567,
            3825094682,
            3061402683,
            2540495037,
            79693498,
            3249098678,
            1084186820,
            1583128258,
            426386531,
            1761308591,
            1047286709,
            322548459,
            995290223,
            1845252383,
            2603652396,
            3431023940,
            2942221577,
            3202600964,
            3727903485,
            1712269319,
            422464435,
            3234572375,
            1170764815,
            3523960633,
            3117677531,
            1434042557,
            442511882,
            3600875718,
            1076654713,
            1738483198,
            4213154764,
            2393238008,
            3677496056,
            1014306527,
            4251020053,
            793779912,
            2902807211,
            842905082,
            4246964064,
            1395751752,
            1040244610,
            2656851899,
            3396308128,
            445077038,
            3742853595,
            3577915638,
            679411651,
            2892444358,
            2354009459,
            1767581616,
            3150600392,
            3791627101,
            3102740896,
            284835224,
            4246832056,
            1258075500,
            768725851,
            2589189241,
            3069724005,
            3532540348,
            1274779536,
            3789419226,
            2764799539,
            1660621633,
            3471099624,
            4011903706,
            913787905,
            3497959166,
            737222580,
            2514213453,
            2928710040,
            3937242737,
            1804850592,
            3499020752,
            2949064160,
            2386320175,
            2390070455,
            2415321851,
            4061277028,
            2290661394,
            2416832540,
            1336762016,
            1754252060,
            3520065937,
            3014181293,
            791618072,
            3188594551,
            3933548030,
            2332172193,
            3852520463,
            3043980520,
            413987798,
            3465142937,
            3030929376,
            4245938359,
            2093235073,
            3534596313,
            375366246,
            2157278981,
            2479649556,
            555357303,
            3870105701,
            2008414854,
            3344188149,
            4221384143,
            3956125452,
            2067696032,
            3594591187,
            2921233993,
            2428461,
            544322398,
            577241275,
            1471733935,
            610547355,
            4027169054,
            1432588573,
            1507829418,
            2025931657,
            3646575487,
            545086370,
            48609733,
            2200306550,
            1653985193,
            298326376,
            1316178497,
            3007786442,
            2064951626,
            458293330,
            2589141269,
            3591329599,
            3164325604,
            727753846,
            2179363840,
            146436021,
            1461446943,
            4069977195,
            705550613,
            3059967265,
            3887724982,
            4281599278,
            3313849956,
            1404054877,
            2845806497,
            146425753,
            1854211946
          ],
          [
            1266315497,
            3048417604,
            3681880366,
            3289982499,
            290971e4,
            1235738493,
            2632868024,
            2414719590,
            3970600049,
            1771706367,
            1449415276,
            3266420449,
            422970021,
            1963543593,
            2690192192,
            3826793022,
            1062508698,
            1531092325,
            1804592342,
            2583117782,
            2714934279,
            4024971509,
            1294809318,
            4028980673,
            1289560198,
            2221992742,
            1669523910,
            35572830,
            157838143,
            1052438473,
            1016535060,
            1802137761,
            1753167236,
            1386275462,
            3080475397,
            2857371447,
            1040679964,
            2145300060,
            2390574316,
            1461121720,
            2956646967,
            4031777805,
            4028374788,
            33600511,
            2920084762,
            1018524850,
            629373528,
            3691585981,
            3515945977,
            2091462646,
            2486323059,
            586499841,
            988145025,
            935516892,
            3367335476,
            2599673255,
            2839830854,
            265290510,
            3972581182,
            2759138881,
            3795373465,
            1005194799,
            847297441,
            406762289,
            1314163512,
            1332590856,
            1866599683,
            4127851711,
            750260880,
            613907577,
            1450815602,
            3165620655,
            3734664991,
            3650291728,
            3012275730,
            3704569646,
            1427272223,
            778793252,
            1343938022,
            2676280711,
            2052605720,
            1946737175,
            3164576444,
            3914038668,
            3967478842,
            3682934266,
            1661551462,
            3294938066,
            4011595847,
            840292616,
            3712170807,
            616741398,
            312560963,
            711312465,
            1351876610,
            322626781,
            1910503582,
            271666773,
            2175563734,
            1594956187,
            70604529,
            3617834859,
            1007753275,
            1495573769,
            4069517037,
            2549218298,
            2663038764,
            504708206,
            2263041392,
            3941167025,
            2249088522,
            1514023603,
            1998579484,
            1312622330,
            694541497,
            2582060303,
            2151582166,
            1382467621,
            776784248,
            2618340202,
            3323268794,
            2497899128,
            2784771155,
            503983604,
            4076293799,
            907881277,
            423175695,
            432175456,
            1378068232,
            4145222326,
            3954048622,
            3938656102,
            3820766613,
            2793130115,
            2977904593,
            26017576,
            3274890735,
            3194772133,
            1700274565,
            1756076034,
            4006520079,
            3677328699,
            720338349,
            1533947780,
            354530856,
            688349552,
            3973924725,
            1637815568,
            332179504,
            3949051286,
            53804574,
            2852348879,
            3044236432,
            1282449977,
            3583942155,
            3416972820,
            4006381244,
            1617046695,
            2628476075,
            3002303598,
            1686838959,
            431878346,
            2686675385,
            1700445008,
            1080580658,
            1009431731,
            832498133,
            3223435511,
            2605976345,
            2271191193,
            2516031870,
            1648197032,
            4164389018,
            2548247927,
            300782431,
            375919233,
            238389289,
            3353747414,
            2531188641,
            2019080857,
            1475708069,
            455242339,
            2609103871,
            448939670,
            3451063019,
            1395535956,
            2413381860,
            1841049896,
            1491858159,
            885456874,
            4264095073,
            4001119347,
            1565136089,
            3898914787,
            1108368660,
            540939232,
            1173283510,
            2745871338,
            3681308437,
            4207628240,
            3343053890,
            4016749493,
            1699691293,
            1103962373,
            3625875870,
            2256883143,
            3830138730,
            1031889488,
            3479347698,
            1535977030,
            4236805024,
            3251091107,
            2132092099,
            1774941330,
            1199868427,
            1452454533,
            157007616,
            2904115357,
            342012276,
            595725824,
            1480756522,
            206960106,
            497939518,
            591360097,
            863170706,
            2375253569,
            3596610801,
            1814182875,
            2094937945,
            3421402208,
            1082520231,
            3463918190,
            2785509508,
            435703966,
            3908032597,
            1641649973,
            2842273706,
            3305899714,
            1510255612,
            2148256476,
            2655287854,
            3276092548,
            4258621189,
            236887753,
            3681803219,
            274041037,
            1734335097,
            3815195456,
            3317970021,
            1899903192,
            1026095262,
            4050517792,
            356393447,
            2410691914,
            3873677099,
            3682840055
          ],
          [
            3913112168,
            2491498743,
            4132185628,
            2489919796,
            1091903735,
            1979897079,
            3170134830,
            3567386728,
            3557303409,
            857797738,
            1136121015,
            1342202287,
            507115054,
            2535736646,
            337727348,
            3213592640,
            1301675037,
            2528481711,
            1895095763,
            1721773893,
            3216771564,
            62756741,
            2142006736,
            835421444,
            2531993523,
            1442658625,
            3659876326,
            2882144922,
            676362277,
            1392781812,
            170690266,
            3921047035,
            1759253602,
            3611846912,
            1745797284,
            664899054,
            1329594018,
            3901205900,
            3045908486,
            2062866102,
            2865634940,
            3543621612,
            3464012697,
            1080764994,
            553557557,
            3656615353,
            3996768171,
            991055499,
            499776247,
            1265440854,
            648242737,
            3940784050,
            980351604,
            3713745714,
            1749149687,
            3396870395,
            4211799374,
            3640570775,
            1161844396,
            3125318951,
            1431517754,
            545492359,
            4268468663,
            3499529547,
            1437099964,
            2702547544,
            3433638243,
            2581715763,
            2787789398,
            1060185593,
            1593081372,
            2418618748,
            4260947970,
            69676912,
            2159744348,
            86519011,
            2512459080,
            3838209314,
            1220612927,
            3339683548,
            133810670,
            1090789135,
            1078426020,
            1569222167,
            845107691,
            3583754449,
            4072456591,
            1091646820,
            628848692,
            1613405280,
            3757631651,
            526609435,
            236106946,
            48312990,
            2942717905,
            3402727701,
            1797494240,
            859738849,
            992217954,
            4005476642,
            2243076622,
            3870952857,
            3732016268,
            765654824,
            3490871365,
            2511836413,
            1685915746,
            3888969200,
            1414112111,
            2273134842,
            3281911079,
            4080962846,
            172450625,
            2569994100,
            980381355,
            4109958455,
            2819808352,
            2716589560,
            2568741196,
            3681446669,
            3329971472,
            1835478071,
            660984891,
            3704678404,
            4045999559,
            3422617507,
            3040415634,
            1762651403,
            1719377915,
            3470491036,
            2693910283,
            3642056355,
            3138596744,
            1364962596,
            2073328063,
            1983633131,
            926494387,
            3423689081,
            2150032023,
            4096667949,
            1749200295,
            3328846651,
            309677260,
            2016342300,
            1779581495,
            3079819751,
            111262694,
            1274766160,
            443224088,
            298511866,
            1025883608,
            3806446537,
            1145181785,
            168956806,
            3641502830,
            3584813610,
            1689216846,
            3666258015,
            3200248200,
            1692713982,
            2646376535,
            4042768518,
            1618508792,
            1610833997,
            3523052358,
            4130873264,
            2001055236,
            3610705100,
            2202168115,
            4028541809,
            2961195399,
            1006657119,
            2006996926,
            3186142756,
            1430667929,
            3210227297,
            1314452623,
            4074634658,
            4101304120,
            2273951170,
            1399257539,
            3367210612,
            3027628629,
            1190975929,
            2062231137,
            2333990788,
            2221543033,
            2438960610,
            1181637006,
            548689776,
            2362791313,
            3372408396,
            3104550113,
            3145860560,
            296247880,
            1970579870,
            3078560182,
            3769228297,
            1714227617,
            3291629107,
            3898220290,
            166772364,
            1251581989,
            493813264,
            448347421,
            195405023,
            2709975567,
            677966185,
            3703036547,
            1463355134,
            2715995803,
            1338867538,
            1343315457,
            2802222074,
            2684532164,
            233230375,
            2599980071,
            2000651841,
            3277868038,
            1638401717,
            4028070440,
            3237316320,
            6314154,
            819756386,
            300326615,
            590932579,
            1405279636,
            3267499572,
            3150704214,
            2428286686,
            3959192993,
            3461946742,
            1862657033,
            1266418056,
            963775037,
            2089974820,
            2263052895,
            1917689273,
            448879540,
            3550394620,
            3981727096,
            150775221,
            3627908307,
            1303187396,
            508620638,
            2975983352,
            2726630617,
            1817252668,
            1876281319,
            1457606340,
            908771278,
            3720792119,
            3617206836,
            2455994898,
            1729034894,
            1080033504
          ],
          [
            976866871,
            3556439503,
            2881648439,
            1522871579,
            1555064734,
            1336096578,
            3548522304,
            2579274686,
            3574697629,
            3205460757,
            3593280638,
            3338716283,
            3079412587,
            564236357,
            2993598910,
            1781952180,
            1464380207,
            3163844217,
            3332601554,
            1699332808,
            1393555694,
            1183702653,
            3581086237,
            1288719814,
            691649499,
            2847557200,
            2895455976,
            3193889540,
            2717570544,
            1781354906,
            1676643554,
            2592534050,
            3230253752,
            1126444790,
            2770207658,
            2633158820,
            2210423226,
            2615765581,
            2414155088,
            3127139286,
            673620729,
            2805611233,
            1269405062,
            4015350505,
            3341807571,
            4149409754,
            1057255273,
            2012875353,
            2162469141,
            2276492801,
            2601117357,
            993977747,
            3918593370,
            2654263191,
            753973209,
            36408145,
            2530585658,
            25011837,
            3520020182,
            2088578344,
            530523599,
            2918365339,
            1524020338,
            1518925132,
            3760827505,
            3759777254,
            1202760957,
            3985898139,
            3906192525,
            674977740,
            4174734889,
            2031300136,
            2019492241,
            3983892565,
            4153806404,
            3822280332,
            352677332,
            2297720250,
            60907813,
            90501309,
            3286998549,
            1016092578,
            2535922412,
            2839152426,
            457141659,
            509813237,
            4120667899,
            652014361,
            1966332200,
            2975202805,
            55981186,
            2327461051,
            676427537,
            3255491064,
            2882294119,
            3433927263,
            1307055953,
            942726286,
            933058658,
            2468411793,
            3933900994,
            4215176142,
            1361170020,
            2001714738,
            2830558078,
            3274259782,
            1222529897,
            1679025792,
            2729314320,
            3714953764,
            1770335741,
            151462246,
            3013232138,
            1682292957,
            1483529935,
            471910574,
            1539241949,
            458788160,
            3436315007,
            1807016891,
            3718408830,
            978976581,
            1043663428,
            3165965781,
            1927990952,
            4200891579,
            2372276910,
            3208408903,
            3533431907,
            1412390302,
            2931980059,
            4132332400,
            1947078029,
            3881505623,
            4168226417,
            2941484381,
            1077988104,
            1320477388,
            886195818,
            18198404,
            3786409e3,
            2509781533,
            112762804,
            3463356488,
            1866414978,
            891333506,
            18488651,
            661792760,
            1628790961,
            3885187036,
            3141171499,
            876946877,
            2693282273,
            1372485963,
            791857591,
            2686433993,
            3759982718,
            3167212022,
            3472953795,
            2716379847,
            445679433,
            3561995674,
            3504004811,
            3574258232,
            54117162,
            3331405415,
            2381918588,
            3769707343,
            4154350007,
            1140177722,
            4074052095,
            668550556,
            3214352940,
            367459370,
            261225585,
            2610173221,
            4209349473,
            3468074219,
            3265815641,
            314222801,
            3066103646,
            3808782860,
            282218597,
            3406013506,
            3773591054,
            379116347,
            1285071038,
            846784868,
            2669647154,
            3771962079,
            3550491691,
            2305946142,
            453669953,
            1268987020,
            3317592352,
            3279303384,
            3744833421,
            2610507566,
            3859509063,
            266596637,
            3847019092,
            517658769,
            3462560207,
            3443424879,
            370717030,
            4247526661,
            2224018117,
            4143653529,
            4112773975,
            2788324899,
            2477274417,
            1456262402,
            2901442914,
            1517677493,
            1846949527,
            2295493580,
            3734397586,
            2176403920,
            1280348187,
            1908823572,
            3871786941,
            846861322,
            1172426758,
            3287448474,
            3383383037,
            1655181056,
            3139813346,
            901632758,
            1897031941,
            2986607138,
            3066810236,
            3447102507,
            1393639104,
            373351379,
            950779232,
            625454576,
            3124240540,
            4148612726,
            2007998917,
            544563296,
            2244738638,
            2330496472,
            2058025392,
            1291430526,
            424198748,
            50039436,
            29584100,
            3605783033,
            2429876329,
            2791104160,
            1057563949,
            3255363231,
            3075367218,
            3463963227,
            1469046755,
            985887462
          ]
        ];
        var BLOWFISH_CTX = {
          pbox: [],
          sbox: []
        };
        function F(ctx, x) {
          let a = x >> 24 & 255;
          let b = x >> 16 & 255;
          let c = x >> 8 & 255;
          let d = x & 255;
          let y = ctx.sbox[0][a] + ctx.sbox[1][b];
          y = y ^ ctx.sbox[2][c];
          y = y + ctx.sbox[3][d];
          return y;
        }
        function BlowFish_Encrypt(ctx, left, right) {
          let Xl = left;
          let Xr = right;
          let temp;
          for (let i = 0; i < N; ++i) {
            Xl = Xl ^ ctx.pbox[i];
            Xr = F(ctx, Xl) ^ Xr;
            temp = Xl;
            Xl = Xr;
            Xr = temp;
          }
          temp = Xl;
          Xl = Xr;
          Xr = temp;
          Xr = Xr ^ ctx.pbox[N];
          Xl = Xl ^ ctx.pbox[N + 1];
          return { left: Xl, right: Xr };
        }
        function BlowFish_Decrypt(ctx, left, right) {
          let Xl = left;
          let Xr = right;
          let temp;
          for (let i = N + 1; i > 1; --i) {
            Xl = Xl ^ ctx.pbox[i];
            Xr = F(ctx, Xl) ^ Xr;
            temp = Xl;
            Xl = Xr;
            Xr = temp;
          }
          temp = Xl;
          Xl = Xr;
          Xr = temp;
          Xr = Xr ^ ctx.pbox[1];
          Xl = Xl ^ ctx.pbox[0];
          return { left: Xl, right: Xr };
        }
        function BlowFishInit(ctx, key, keysize) {
          for (let Row = 0; Row < 4; Row++) {
            ctx.sbox[Row] = [];
            for (let Col = 0; Col < 256; Col++) {
              ctx.sbox[Row][Col] = ORIG_S[Row][Col];
            }
          }
          let keyIndex = 0;
          for (let index = 0; index < N + 2; index++) {
            ctx.pbox[index] = ORIG_P[index] ^ key[keyIndex];
            keyIndex++;
            if (keyIndex >= keysize) {
              keyIndex = 0;
            }
          }
          let Data1 = 0;
          let Data2 = 0;
          let res = 0;
          for (let i = 0; i < N + 2; i += 2) {
            res = BlowFish_Encrypt(ctx, Data1, Data2);
            Data1 = res.left;
            Data2 = res.right;
            ctx.pbox[i] = Data1;
            ctx.pbox[i + 1] = Data2;
          }
          for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 256; j += 2) {
              res = BlowFish_Encrypt(ctx, Data1, Data2);
              Data1 = res.left;
              Data2 = res.right;
              ctx.sbox[i][j] = Data1;
              ctx.sbox[i][j + 1] = Data2;
            }
          }
          return true;
        }
        var Blowfish = C_algo.Blowfish = BlockCipher.extend({
          _doReset: function() {
            if (this._keyPriorReset === this._key) {
              return;
            }
            var key = this._keyPriorReset = this._key;
            var keyWords = key.words;
            var keySize = key.sigBytes / 4;
            BlowFishInit(BLOWFISH_CTX, keyWords, keySize);
          },
          encryptBlock: function(M, offset) {
            var res = BlowFish_Encrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
            M[offset] = res.left;
            M[offset + 1] = res.right;
          },
          decryptBlock: function(M, offset) {
            var res = BlowFish_Decrypt(BLOWFISH_CTX, M[offset], M[offset + 1]);
            M[offset] = res.left;
            M[offset + 1] = res.right;
          },
          blockSize: 64 / 32,
          keySize: 128 / 32,
          ivSize: 64 / 32
        });
        C.Blowfish = BlockCipher._createHelper(Blowfish);
      })();
      return CryptoJS2.Blowfish;
    });
  }
});

// node_modules/crypto-js/index.js
var require_crypto_js = __commonJS({
  "node_modules/crypto-js/index.js"(exports, module) {
    (function(root, factory, undef) {
      if (typeof exports === "object") {
        module.exports = exports = factory(require_core(), require_x64_core(), require_lib_typedarrays(), require_enc_utf16(), require_enc_base64(), require_enc_base64url(), require_md5(), require_sha1(), require_sha256(), require_sha224(), require_sha512(), require_sha384(), require_sha3(), require_ripemd160(), require_hmac(), require_pbkdf2(), require_evpkdf(), require_cipher_core(), require_mode_cfb(), require_mode_ctr(), require_mode_ctr_gladman(), require_mode_ofb(), require_mode_ecb(), require_pad_ansix923(), require_pad_iso10126(), require_pad_iso97971(), require_pad_zeropadding(), require_pad_nopadding(), require_format_hex(), require_aes(), require_tripledes(), require_rc4(), require_rabbit(), require_rabbit_legacy(), require_blowfish());
      } else if (typeof define === "function" && define.amd) {
        define(["./core", "./x64-core", "./lib-typedarrays", "./enc-utf16", "./enc-base64", "./enc-base64url", "./md5", "./sha1", "./sha256", "./sha224", "./sha512", "./sha384", "./sha3", "./ripemd160", "./hmac", "./pbkdf2", "./evpkdf", "./cipher-core", "./mode-cfb", "./mode-ctr", "./mode-ctr-gladman", "./mode-ofb", "./mode-ecb", "./pad-ansix923", "./pad-iso10126", "./pad-iso97971", "./pad-zeropadding", "./pad-nopadding", "./format-hex", "./aes", "./tripledes", "./rc4", "./rabbit", "./rabbit-legacy", "./blowfish"], factory);
      } else {
        root.CryptoJS = factory(root.CryptoJS);
      }
    })(exports, function(CryptoJS2) {
      return CryptoJS2;
    });
  }
});

// node_modules/openai/internal/tslib.mjs
function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m")
    throw new TypeError("Private method is not writable");
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f)
    throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
    throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

// node_modules/openai/internal/utils/uuid.mjs
var uuid4 = function() {
  const { crypto: crypto2 } = globalThis;
  if (crypto2?.randomUUID) {
    uuid4 = crypto2.randomUUID.bind(crypto2);
    return crypto2.randomUUID();
  }
  const u8 = new Uint8Array(1);
  const randomByte = crypto2 ? () => crypto2.getRandomValues(u8)[0] : () => Math.random() * 255 & 255;
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (+c ^ randomByte() & 15 >> +c / 4).toString(16));
};

// node_modules/openai/internal/errors.mjs
function isAbortError(err) {
  return typeof err === "object" && err !== null && // Spec-compliant fetch implementations
  ("name" in err && err.name === "AbortError" || // Expo fetch
  "message" in err && String(err.message).includes("FetchRequestCanceledException"));
}
var castToError = (err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      if (Object.prototype.toString.call(err) === "[object Error]") {
        const error = new Error(err.message, err.cause ? { cause: err.cause } : {});
        if (err.stack)
          error.stack = err.stack;
        if (err.cause && !error.cause)
          error.cause = err.cause;
        if (err.name)
          error.name = err.name;
        return error;
      }
    } catch {
    }
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
};

// node_modules/openai/core/error.mjs
var OpenAIError = class extends Error {
};
var APIError = class _APIError extends OpenAIError {
  constructor(status, error, message, headers) {
    super(`${_APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.requestID = headers?.get("x-request-id");
    this.error = error;
    const data = error;
    this.code = data?.["code"];
    this.param = data?.["param"];
    this.type = data?.["type"];
  }
  static makeMessage(status, error, message) {
    const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse?.["error"];
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }
    return new _APIError(status, error, message, headers);
  }
};
var APIUserAbortError = class extends APIError {
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
};
var APIConnectionError = class extends APIError {
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
};
var APIConnectionTimeoutError = class extends APIConnectionError {
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
};
var BadRequestError = class extends APIError {
};
var AuthenticationError = class extends APIError {
};
var PermissionDeniedError = class extends APIError {
};
var NotFoundError = class extends APIError {
};
var ConflictError = class extends APIError {
};
var UnprocessableEntityError = class extends APIError {
};
var RateLimitError = class extends APIError {
};
var InternalServerError = class extends APIError {
};
var LengthFinishReasonError = class extends OpenAIError {
  constructor() {
    super(`Could not parse response content as the length limit was reached`);
  }
};
var ContentFilterFinishReasonError = class extends OpenAIError {
  constructor() {
    super(`Could not parse response content as the request was rejected by the content filter`);
  }
};
var InvalidWebhookSignatureError = class extends Error {
  constructor(message) {
    super(message);
  }
};

// node_modules/openai/internal/utils/values.mjs
var startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
var isAbsoluteURL = (url) => {
  return startsWithSchemeRegexp.test(url);
};
var isArray = (val) => (isArray = Array.isArray, isArray(val));
var isReadonlyArray = isArray;
function maybeObj(x) {
  if (typeof x !== "object") {
    return {};
  }
  return x ?? {};
}
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function isObj(obj) {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}
var validatePositiveInteger = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new OpenAIError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new OpenAIError(`${name} must be a positive integer`);
  }
  return n;
};
var safeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return void 0;
  }
};

// node_modules/openai/internal/utils/sleep.mjs
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// node_modules/openai/version.mjs
var VERSION = "6.22.0";

// node_modules/openai/internal/detect-platform.mjs
var isRunningInBrowser = () => {
  return (
    // @ts-ignore
    typeof window !== "undefined" && // @ts-ignore
    typeof window.document !== "undefined" && // @ts-ignore
    typeof navigator !== "undefined"
  );
};
function getDetectedPlatform() {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return "deno";
  }
  if (typeof EdgeRuntime !== "undefined") {
    return "edge";
  }
  if (Object.prototype.toString.call(typeof globalThis.process !== "undefined" ? globalThis.process : 0) === "[object process]") {
    return "node";
  }
  return "unknown";
}
var getPlatformProperties = () => {
  const detectedPlatform = getDetectedPlatform();
  if (detectedPlatform === "deno") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": globalThis.process.version
    };
  }
  if (detectedPlatform === "node") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(globalThis.process.platform ?? "unknown"),
      "X-Stainless-Arch": normalizeArch(globalThis.process.arch ?? "unknown"),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": globalThis.process.version ?? "unknown"
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
var normalizeArch = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
};
var normalizePlatform = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
};
var _platformHeaders;
var getPlatformHeaders = () => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};

// node_modules/openai/internal/shims.mjs
function getDefaultFetch() {
  if (typeof fetch !== "undefined") {
    return fetch;
  }
  throw new Error("`fetch` is not defined as a global; Either pass `fetch` to the client, `new OpenAI({ fetch })` or polyfill the global, `globalThis.fetch = fetch`");
}
function makeReadableStream(...args) {
  const ReadableStream = globalThis.ReadableStream;
  if (typeof ReadableStream === "undefined") {
    throw new Error("`ReadableStream` is not defined as a global; You will need to polyfill it, `globalThis.ReadableStream = ReadableStream`");
  }
  return new ReadableStream(...args);
}
function ReadableStreamFrom(iterable) {
  let iter = Symbol.asyncIterator in iterable ? iterable[Symbol.asyncIterator]() : iterable[Symbol.iterator]();
  return makeReadableStream({
    start() {
    },
    async pull(controller) {
      const { done, value } = await iter.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
    async cancel() {
      await iter.return?.();
    }
  });
}
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}
async function CancelReadableStream(stream) {
  if (stream === null || typeof stream !== "object")
    return;
  if (stream[Symbol.asyncIterator]) {
    await stream[Symbol.asyncIterator]().return?.();
    return;
  }
  const reader = stream.getReader();
  const cancelPromise = reader.cancel();
  reader.releaseLock();
  await cancelPromise;
}

// node_modules/openai/internal/request-options.mjs
var FallbackEncoder = ({ headers, body }) => {
  return {
    bodyHeaders: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  };
};

// node_modules/openai/internal/qs/formats.mjs
var default_format = "RFC3986";
var default_formatter = (v) => String(v);
var formatters = {
  RFC1738: (v) => String(v).replace(/%20/g, "+"),
  RFC3986: default_formatter
};
var RFC1738 = "RFC1738";

// node_modules/openai/internal/qs/utils.mjs
var has = (obj, key) => (has = Object.hasOwn ?? Function.prototype.call.bind(Object.prototype.hasOwnProperty), has(obj, key));
var hex_table = /* @__PURE__ */ (() => {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
  }
  return array;
})();
var limit = 1024;
var encode = (str2, _defaultEncoder, charset, _kind, format) => {
  if (str2.length === 0) {
    return str2;
  }
  let string = str2;
  if (typeof str2 === "symbol") {
    string = Symbol.prototype.toString.call(str2);
  } else if (typeof str2 !== "string") {
    string = String(str2);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
    });
  }
  let out = "";
  for (let j = 0; j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];
    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (c === 45 || // -
      c === 46 || // .
      c === 95 || // _
      c === 126 || // ~
      c >= 48 && c <= 57 || // 0-9
      c >= 65 && c <= 90 || // a-z
      c >= 97 && c <= 122 || // A-Z
      format === RFC1738 && (c === 40 || c === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 128) {
        arr[arr.length] = hex_table[c];
        continue;
      }
      if (c < 2048) {
        arr[arr.length] = hex_table[192 | c >> 6] + hex_table[128 | c & 63];
        continue;
      }
      if (c < 55296 || c >= 57344) {
        arr[arr.length] = hex_table[224 | c >> 12] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
        continue;
      }
      i += 1;
      c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hex_table[240 | c >> 18] + hex_table[128 | c >> 12 & 63] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
    }
    out += arr.join("");
  }
  return out;
};
function is_buffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function maybe_map(val, fn) {
  if (isArray(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
}

// node_modules/openai/internal/qs/stringify.mjs
var array_prefix_generators = {
  brackets(prefix) {
    return String(prefix) + "[]";
  },
  comma: "comma",
  indices(prefix, key) {
    return String(prefix) + "[" + key + "]";
  },
  repeat(prefix) {
    return String(prefix);
  }
};
var push_to_array = function(arr, value_or_array) {
  Array.prototype.push.apply(arr, isArray(value_or_array) ? value_or_array : [value_or_array]);
};
var toISOString;
var defaults = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: encode,
  encodeValuesOnly: false,
  format: default_format,
  formatter: default_formatter,
  /** @deprecated */
  indices: false,
  serializeDate(date) {
    return (toISOString ?? (toISOString = Function.prototype.call.bind(Date.prototype.toISOString)))(date);
  },
  skipNulls: false,
  strictNullHandling: false
};
function is_non_nullish_primitive(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
}
var sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  let obj = object;
  let tmp_sc = sideChannel;
  let step = 0;
  let find_flag = false;
  while ((tmp_sc = tmp_sc.get(sentinel)) !== void 0 && !find_flag) {
    const pos = tmp_sc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        find_flag = true;
      }
    }
    if (typeof tmp_sc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate?.(obj);
  } else if (generateArrayPrefix === "comma" && isArray(obj)) {
    obj = maybe_map(obj, function(value) {
      if (value instanceof Date) {
        return serializeDate?.(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? (
        // @ts-expect-error
        encoder(prefix, defaults.encoder, charset, "key", format)
      ) : prefix;
    }
    obj = "";
  }
  if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
    if (encoder) {
      const key_value = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
      return [
        formatter?.(key_value) + "=" + // @ts-expect-error
        formatter?.(encoder(obj, defaults.encoder, charset, "value", format))
      ];
    }
    return [formatter?.(prefix) + "=" + formatter?.(String(obj))];
  }
  const values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  let obj_keys;
  if (generateArrayPrefix === "comma" && isArray(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = maybe_map(obj, encoder);
    }
    obj_keys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (isArray(filter)) {
    obj_keys = filter;
  } else {
    const keys = Object.keys(obj);
    obj_keys = sort ? keys.sort(sort) : keys;
  }
  const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  const adjusted_prefix = commaRoundTrip && isArray(obj) && obj.length === 1 ? encoded_prefix + "[]" : encoded_prefix;
  if (allowEmptyArrays && isArray(obj) && obj.length === 0) {
    return adjusted_prefix + "[]";
  }
  for (let j = 0; j < obj_keys.length; ++j) {
    const key = obj_keys[j];
    const value = (
      // @ts-ignore
      typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key]
    );
    if (skipNulls && value === null) {
      continue;
    }
    const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    const key_prefix = isArray(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjusted_prefix, encoded_key) : adjusted_prefix : adjusted_prefix + (allowDots ? "." + encoded_key : "[" + encoded_key + "]");
    sideChannel.set(object, step);
    const valueSideChannel = /* @__PURE__ */ new WeakMap();
    valueSideChannel.set(sentinel, sideChannel);
    push_to_array(values, inner_stringify(
      value,
      key_prefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      // @ts-ignore
      generateArrayPrefix === "comma" && encodeValuesOnly && isArray(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values;
}
function normalize_stringify_options(opts = defaults) {
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  const charset = opts.charset || defaults.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  let format = default_format;
  if (typeof opts.format !== "undefined") {
    if (!has(formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  const formatter = formatters[format];
  let filter = defaults.filter;
  if (typeof opts.filter === "function" || isArray(opts.filter)) {
    filter = opts.filter;
  }
  let arrayFormat;
  if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  const allowDots = typeof opts.allowDots === "undefined" ? !!opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
    // @ts-ignore
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
    // @ts-ignore
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
  };
}
function stringify(object, opts = {}) {
  let obj = object;
  const options = normalize_stringify_options(opts);
  let obj_keys;
  let filter;
  if (typeof options.filter === "function") {
    filter = options.filter;
    obj = filter("", obj);
  } else if (isArray(options.filter)) {
    filter = options.filter;
    obj_keys = filter;
  }
  const keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
  if (!obj_keys) {
    obj_keys = Object.keys(obj);
  }
  if (options.sort) {
    obj_keys.sort(options.sort);
  }
  const sideChannel = /* @__PURE__ */ new WeakMap();
  for (let i = 0; i < obj_keys.length; ++i) {
    const key = obj_keys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    push_to_array(keys, inner_stringify(
      obj[key],
      key,
      // @ts-expect-error
      generateArrayPrefix,
      commaRoundTrip,
      options.allowEmptyArrays,
      options.strictNullHandling,
      options.skipNulls,
      options.encodeDotInKeys,
      options.encode ? options.encoder : null,
      options.filter,
      options.sort,
      options.allowDots,
      options.serializeDate,
      options.format,
      options.formatter,
      options.encodeValuesOnly,
      options.charset,
      sideChannel
    ));
  }
  const joined = keys.join(options.delimiter);
  let prefix = options.addQueryPrefix === true ? "?" : "";
  if (options.charsetSentinel) {
    if (options.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
}

// node_modules/openai/internal/utils/bytes.mjs
function concatBytes(buffers) {
  let length = 0;
  for (const buffer of buffers) {
    length += buffer.length;
  }
  const output = new Uint8Array(length);
  let index = 0;
  for (const buffer of buffers) {
    output.set(buffer, index);
    index += buffer.length;
  }
  return output;
}
var encodeUTF8_;
function encodeUTF8(str2) {
  let encoder;
  return (encodeUTF8_ ?? (encoder = new globalThis.TextEncoder(), encodeUTF8_ = encoder.encode.bind(encoder)))(str2);
}
var decodeUTF8_;
function decodeUTF8(bytes) {
  let decoder;
  return (decodeUTF8_ ?? (decoder = new globalThis.TextDecoder(), decodeUTF8_ = decoder.decode.bind(decoder)))(bytes);
}

// node_modules/openai/internal/decoders/line.mjs
var _LineDecoder_buffer;
var _LineDecoder_carriageReturnIndex;
var LineDecoder = class {
  constructor() {
    _LineDecoder_buffer.set(this, void 0);
    _LineDecoder_carriageReturnIndex.set(this, void 0);
    __classPrivateFieldSet(this, _LineDecoder_buffer, new Uint8Array(), "f");
    __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
  }
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    __classPrivateFieldSet(this, _LineDecoder_buffer, concatBytes([__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), binaryChunk]), "f");
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(__classPrivateFieldGet(this, _LineDecoder_buffer, "f"), __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
      if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
        continue;
      }
      if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
        lines.push(decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
        __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f")), "f");
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
        continue;
      }
      const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
      const line = decodeUTF8(__classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(0, endIndex));
      lines.push(line);
      __classPrivateFieldSet(this, _LineDecoder_buffer, __classPrivateFieldGet(this, _LineDecoder_buffer, "f").subarray(patternIndex.index), "f");
      __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    return lines;
  }
  flush() {
    if (!__classPrivateFieldGet(this, _LineDecoder_buffer, "f").length) {
      return [];
    }
    return this.decode("\n");
  }
};
_LineDecoder_buffer = /* @__PURE__ */ new WeakMap(), _LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}

// node_modules/openai/internal/utils/log.mjs
var levelNumbers = {
  off: 0,
  error: 200,
  warn: 300,
  info: 400,
  debug: 500
};
var parseLogLevel = (maybeLevel, sourceName, client) => {
  if (!maybeLevel) {
    return void 0;
  }
  if (hasOwn(levelNumbers, maybeLevel)) {
    return maybeLevel;
  }
  loggerFor(client).warn(`${sourceName} was set to ${JSON.stringify(maybeLevel)}, expected one of ${JSON.stringify(Object.keys(levelNumbers))}`);
  return void 0;
};
function noop() {
}
function makeLogFn(fnLevel, logger, logLevel) {
  if (!logger || levelNumbers[fnLevel] > levelNumbers[logLevel]) {
    return noop;
  } else {
    return logger[fnLevel].bind(logger);
  }
}
var noopLogger = {
  error: noop,
  warn: noop,
  info: noop,
  debug: noop
};
var cachedLoggers = /* @__PURE__ */ new WeakMap();
function loggerFor(client) {
  const logger = client.logger;
  const logLevel = client.logLevel ?? "off";
  if (!logger) {
    return noopLogger;
  }
  const cachedLogger = cachedLoggers.get(logger);
  if (cachedLogger && cachedLogger[0] === logLevel) {
    return cachedLogger[1];
  }
  const levelLogger = {
    error: makeLogFn("error", logger, logLevel),
    warn: makeLogFn("warn", logger, logLevel),
    info: makeLogFn("info", logger, logLevel),
    debug: makeLogFn("debug", logger, logLevel)
  };
  cachedLoggers.set(logger, [logLevel, levelLogger]);
  return levelLogger;
}
var formatRequestDetails = (details) => {
  if (details.options) {
    details.options = { ...details.options };
    delete details.options["headers"];
  }
  if (details.headers) {
    details.headers = Object.fromEntries((details.headers instanceof Headers ? [...details.headers] : Object.entries(details.headers)).map(([name, value]) => [
      name,
      name.toLowerCase() === "authorization" || name.toLowerCase() === "cookie" || name.toLowerCase() === "set-cookie" ? "***" : value
    ]));
  }
  if ("retryOfRequestLogID" in details) {
    if (details.retryOfRequestLogID) {
      details.retryOf = details.retryOfRequestLogID;
    }
    delete details.retryOfRequestLogID;
  }
  return details;
};

// node_modules/openai/core/streaming.mjs
var _Stream_client;
var Stream = class _Stream {
  constructor(iterator, controller, client) {
    this.iterator = iterator;
    _Stream_client.set(this, void 0);
    this.controller = controller;
    __classPrivateFieldSet(this, _Stream_client, client, "f");
  }
  static fromSSEResponse(response, controller, client) {
    let consumed = false;
    const logger = client ? loggerFor(client) : console;
    async function* iterator() {
      if (consumed) {
        throw new OpenAIError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const sse of _iterSSEMessages(response, controller)) {
          if (done)
            continue;
          if (sse.data.startsWith("[DONE]")) {
            done = true;
            continue;
          }
          if (sse.event === null || !sse.event.startsWith("thread.")) {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              logger.error(`Could not parse message into JSON:`, sse.data);
              logger.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (data && data.error) {
              throw new APIError(void 0, data.error, void 0, response.headers);
            }
            yield data;
          } else {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (sse.event == "error") {
              throw new APIError(void 0, data.error, data.message, void 0);
            }
            yield { event: sse.event, data };
          }
        }
        done = true;
      } catch (e) {
        if (isAbortError(e))
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    return new _Stream(iterator, controller, client);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(readableStream, controller, client) {
    let consumed = false;
    async function* iterLines() {
      const lineDecoder = new LineDecoder();
      const iter = ReadableStreamToAsyncIterable(readableStream);
      for await (const chunk of iter) {
        for (const line of lineDecoder.decode(chunk)) {
          yield line;
        }
      }
      for (const line of lineDecoder.flush()) {
        yield line;
      }
    }
    async function* iterator() {
      if (consumed) {
        throw new OpenAIError("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const line of iterLines()) {
          if (done)
            continue;
          if (line)
            yield JSON.parse(line);
        }
        done = true;
      } catch (e) {
        if (isAbortError(e))
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    return new _Stream(iterator, controller, client);
  }
  [(_Stream_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const left = [];
    const right = [];
    const iterator = this.iterator();
    const teeIterator = (queue) => {
      return {
        next: () => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift();
        }
      };
    };
    return [
      new _Stream(() => teeIterator(left), this.controller, __classPrivateFieldGet(this, _Stream_client, "f")),
      new _Stream(() => teeIterator(right), this.controller, __classPrivateFieldGet(this, _Stream_client, "f"))
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const self2 = this;
    let iter;
    return makeReadableStream({
      async start() {
        iter = self2[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done)
            return ctrl.close();
          const bytes = encodeUTF8(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
        }
      },
      async cancel() {
        await iter.return?.();
      }
    });
  }
};
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    if (typeof globalThis.navigator !== "undefined" && globalThis.navigator.product === "ReactNative") {
      throw new OpenAIError(`The default react-native fetch implementation does not support streaming. Please use expo/fetch: https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api`);
    }
    throw new OpenAIError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);
    if (sse)
      yield sse;
  }
}
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? encodeUTF8(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
var SSEDecoder = class {
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
};
function partition(str2, delimiter) {
  const index = str2.indexOf(delimiter);
  if (index !== -1) {
    return [str2.substring(0, index), delimiter, str2.substring(index + delimiter.length)];
  }
  return [str2, "", ""];
}

// node_modules/openai/internal/parse.mjs
async function defaultParseResponse(client, props) {
  const { response, requestLogID, retryOfRequestLogID, startTime } = props;
  const body = await (async () => {
    if (props.options.stream) {
      loggerFor(client).debug("response", response.status, response.url, response.headers, response.body);
      if (props.options.__streamClass) {
        return props.options.__streamClass.fromSSEResponse(response, props.controller, client);
      }
      return Stream.fromSSEResponse(response, props.controller, client);
    }
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const mediaType = contentType?.split(";")[0]?.trim();
    const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
    if (isJSON) {
      const contentLength = response.headers.get("content-length");
      if (contentLength === "0") {
        return void 0;
      }
      const json = await response.json();
      return addRequestID(json, response);
    }
    const text = await response.text();
    return text;
  })();
  loggerFor(client).debug(`[${requestLogID}] response parsed`, formatRequestDetails({
    retryOfRequestLogID,
    url: response.url,
    status: response.status,
    body,
    durationMs: Date.now() - startTime
  }));
  return body;
}
function addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("x-request-id"),
    enumerable: false
  });
}

// node_modules/openai/core/api-promise.mjs
var _APIPromise_client;
var APIPromise = class _APIPromise extends Promise {
  constructor(client, responsePromise, parseResponse2 = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse2;
    _APIPromise_client.set(this, void 0);
    __classPrivateFieldSet(this, _APIPromise_client, client, "f");
  }
  _thenUnwrap(transform) {
    return new _APIPromise(__classPrivateFieldGet(this, _APIPromise_client, "f"), this.responsePromise, async (client, props) => addRequestID(transform(await this.parseResponse(client, props), props), props.response));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  asResponse() {
    return this.responsePromise.then((p) => p.response);
  }
  /**
   * Gets the parsed response data, the raw `Response` instance and the ID of the request,
   * returned via the X-Request-ID header which is useful for debugging requests and reporting
   * issues to OpenAI.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` or add `"lib": ["DOM"]`
   * to your `tsconfig.json`.
   */
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response, request_id: response.headers.get("x-request-id") };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then((data) => this.parseResponse(__classPrivateFieldGet(this, _APIPromise_client, "f"), data));
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
};
_APIPromise_client = /* @__PURE__ */ new WeakMap();

// node_modules/openai/core/pagination.mjs
var _AbstractPage_client;
var AbstractPage = class {
  constructor(client, response, body, options) {
    _AbstractPage_client.set(this, void 0);
    __classPrivateFieldSet(this, _AbstractPage_client, client, "f");
    this.options = options;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageRequestOptions() != null;
  }
  async getNextPage() {
    const nextOptions = this.nextPageRequestOptions();
    if (!nextOptions) {
      throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    return await __classPrivateFieldGet(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async *iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
};
var PagePromise = class extends APIPromise {
  constructor(client, request, Page2) {
    super(client, request, async (client2, props) => new Page2(client2, props.response, await defaultParseResponse(client2, props), props.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
};
var Page = class extends AbstractPage {
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.object = body.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  nextPageRequestOptions() {
    return null;
  }
};
var CursorPage = class extends AbstractPage {
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  nextPageRequestOptions() {
    const data = this.getPaginatedItems();
    const id = data[data.length - 1]?.id;
    if (!id) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        after: id
      }
    };
  }
};
var ConversationCursorPage = class extends AbstractPage {
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
    this.last_id = body.last_id || "";
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  nextPageRequestOptions() {
    const cursor = this.last_id;
    if (!cursor) {
      return null;
    }
    return {
      ...this.options,
      query: {
        ...maybeObj(this.options.query),
        after: cursor
      }
    };
  }
};

// node_modules/openai/internal/uploads.mjs
var checkFileSupport = () => {
  if (typeof File === "undefined") {
    const { process: process2 } = globalThis;
    const isOldNode = typeof process2?.versions?.node === "string" && parseInt(process2.versions.node.split(".")) < 20;
    throw new Error("`File` is not defined as a global, which is required for file uploads." + (isOldNode ? " Update to Node 20 LTS or newer, or set `globalThis.File` to `import('node:buffer').File`." : ""));
  }
};
function makeFile(fileBits, fileName, options) {
  checkFileSupport();
  return new File(fileBits, fileName ?? "unknown_file", options);
}
function getName(value) {
  return (typeof value === "object" && value !== null && ("name" in value && value.name && String(value.name) || "url" in value && value.url && String(value.url) || "filename" in value && value.filename && String(value.filename) || "path" in value && value.path && String(value.path)) || "").split(/[\\/]/).pop() || void 0;
}
var isAsyncIterable = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
var maybeMultipartFormRequestOptions = async (opts, fetch2) => {
  if (!hasUploadableValue(opts.body))
    return opts;
  return { ...opts, body: await createForm(opts.body, fetch2) };
};
var multipartFormRequestOptions = async (opts, fetch2) => {
  return { ...opts, body: await createForm(opts.body, fetch2) };
};
var supportsFormDataMap = /* @__PURE__ */ new WeakMap();
function supportsFormData(fetchObject) {
  const fetch2 = typeof fetchObject === "function" ? fetchObject : fetchObject.fetch;
  const cached = supportsFormDataMap.get(fetch2);
  if (cached)
    return cached;
  const promise = (async () => {
    try {
      const FetchResponse = "Response" in fetch2 ? fetch2.Response : (await fetch2("data:,")).constructor;
      const data = new FormData();
      if (data.toString() === await new FetchResponse(data).text()) {
        return false;
      }
      return true;
    } catch {
      return true;
    }
  })();
  supportsFormDataMap.set(fetch2, promise);
  return promise;
}
var createForm = async (body, fetch2) => {
  if (!await supportsFormData(fetch2)) {
    throw new TypeError("The provided fetch function does not support file uploads with the current global FormData class.");
  }
  const form = new FormData();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
};
var isNamedBlob = (value) => value instanceof Blob && "name" in value;
var isUploadable = (value) => typeof value === "object" && value !== null && (value instanceof Response || isAsyncIterable(value) || isNamedBlob(value));
var hasUploadableValue = (value) => {
  if (isUploadable(value))
    return true;
  if (Array.isArray(value))
    return value.some(hasUploadableValue);
  if (value && typeof value === "object") {
    for (const k in value) {
      if (hasUploadableValue(value[k]))
        return true;
    }
  }
  return false;
};
var addFormValue = async (form, key, value) => {
  if (value === void 0)
    return;
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (value instanceof Response) {
    form.append(key, makeFile([await value.blob()], getName(value)));
  } else if (isAsyncIterable(value)) {
    form.append(key, makeFile([await new Response(ReadableStreamFrom(value)).blob()], getName(value)));
  } else if (isNamedBlob(value)) {
    form.append(key, value, getName(value));
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
};

// node_modules/openai/internal/to-file.mjs
var isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
var isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
var isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
async function toFile(value, name, options) {
  checkFileSupport();
  value = await value;
  if (isFileLike(value)) {
    if (value instanceof File) {
      return value;
    }
    return makeFile([await value.arrayBuffer()], value.name);
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop());
    return makeFile(await getBytes(blob), name, options);
  }
  const parts = await getBytes(value);
  name || (name = getName(value));
  if (!options?.type) {
    const type = parts.find((part) => typeof part === "object" && "type" in part && part.type);
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return makeFile(parts, name, options);
}
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(value instanceof Blob ? value : await value.arrayBuffer());
  } else if (isAsyncIterable(value)) {
    for await (const chunk of value) {
      parts.push(...await getBytes(chunk));
    }
  } else {
    const constructor = value?.constructor?.name;
    throw new Error(`Unexpected data type: ${typeof value}${constructor ? `; constructor: ${constructor}` : ""}${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  if (typeof value !== "object" || value === null)
    return "";
  const props = Object.getOwnPropertyNames(value);
  return `; props: [${props.map((p) => `"${p}"`).join(", ")}]`;
}

// node_modules/openai/core/resource.mjs
var APIResource = class {
  constructor(client) {
    this._client = client;
  }
};

// node_modules/openai/internal/utils/path.mjs
function encodeURIPath(str2) {
  return str2.replace(/[^A-Za-z0-9\-._~!$&'()*+,;=:@]+/g, encodeURIComponent);
}
var EMPTY = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.create(null));
var createPathTagFunction = (pathEncoder = encodeURIPath) => function path2(statics, ...params) {
  if (statics.length === 1)
    return statics[0];
  let postPath = false;
  const invalidSegments = [];
  const path3 = statics.reduce((previousValue, currentValue, index) => {
    if (/[?#]/.test(currentValue)) {
      postPath = true;
    }
    const value = params[index];
    let encoded = (postPath ? encodeURIComponent : pathEncoder)("" + value);
    if (index !== params.length && (value == null || typeof value === "object" && // handle values from other realms
    value.toString === Object.getPrototypeOf(Object.getPrototypeOf(value.hasOwnProperty ?? EMPTY) ?? EMPTY)?.toString)) {
      encoded = value + "";
      invalidSegments.push({
        start: previousValue.length + currentValue.length,
        length: encoded.length,
        error: `Value of type ${Object.prototype.toString.call(value).slice(8, -1)} is not a valid path parameter`
      });
    }
    return previousValue + currentValue + (index === params.length ? "" : encoded);
  }, "");
  const pathOnly = path3.split(/[?#]/, 1)[0];
  const invalidSegmentPattern = /(?<=^|\/)(?:\.|%2e){1,2}(?=\/|$)/gi;
  let match;
  while ((match = invalidSegmentPattern.exec(pathOnly)) !== null) {
    invalidSegments.push({
      start: match.index,
      length: match[0].length,
      error: `Value "${match[0]}" can't be safely passed as a path parameter`
    });
  }
  invalidSegments.sort((a, b) => a.start - b.start);
  if (invalidSegments.length > 0) {
    let lastEnd = 0;
    const underline = invalidSegments.reduce((acc, segment) => {
      const spaces = " ".repeat(segment.start - lastEnd);
      const arrows = "^".repeat(segment.length);
      lastEnd = segment.start + segment.length;
      return acc + spaces + arrows;
    }, "");
    throw new OpenAIError(`Path parameters result in path with invalid segments:
${invalidSegments.map((e) => e.error).join("\n")}
${path3}
${underline}`);
  }
  return path3;
};
var path = /* @__PURE__ */ createPathTagFunction(encodeURIPath);

// node_modules/openai/resources/chat/completions/messages.mjs
var Messages = class extends APIResource {
  /**
   * Get the messages in a stored chat completion. Only Chat Completions that have
   * been created with the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatCompletionStoreMessage of client.chat.completions.messages.list(
   *   'completion_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(completionID, query = {}, options) {
    return this._client.getAPIList(path`/chat/completions/${completionID}/messages`, CursorPage, { query, ...options });
  }
};

// node_modules/openai/lib/parser.mjs
function isChatCompletionFunctionTool(tool) {
  return tool !== void 0 && "function" in tool && tool.function !== void 0;
}
function isAutoParsableResponseFormat(response_format) {
  return response_format?.["$brand"] === "auto-parseable-response-format";
}
function isAutoParsableTool(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
function maybeParseChatCompletion(completion, params) {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => {
        assertToolCallsAreChatCompletionFunctionToolCalls(choice.message.tool_calls);
        return {
          ...choice,
          message: {
            ...choice.message,
            parsed: null,
            ...choice.message.tool_calls ? {
              tool_calls: choice.message.tool_calls
            } : void 0
          }
        };
      })
    };
  }
  return parseChatCompletion(completion, params);
}
function parseChatCompletion(completion, params) {
  const choices = completion.choices.map((choice) => {
    if (choice.finish_reason === "length") {
      throw new LengthFinishReasonError();
    }
    if (choice.finish_reason === "content_filter") {
      throw new ContentFilterFinishReasonError();
    }
    assertToolCallsAreChatCompletionFunctionToolCalls(choice.message.tool_calls);
    return {
      ...choice,
      message: {
        ...choice.message,
        ...choice.message.tool_calls ? {
          tool_calls: choice.message.tool_calls?.map((toolCall) => parseToolCall(params, toolCall)) ?? void 0
        } : void 0,
        parsed: choice.message.content && !choice.message.refusal ? parseResponseFormat(params, choice.message.content) : null
      }
    };
  });
  return { ...completion, choices };
}
function parseResponseFormat(params, content) {
  if (params.response_format?.type !== "json_schema") {
    return null;
  }
  if (params.response_format?.type === "json_schema") {
    if ("$parseRaw" in params.response_format) {
      const response_format = params.response_format;
      return response_format.$parseRaw(content);
    }
    return JSON.parse(content);
  }
  return null;
}
function parseToolCall(params, toolCall) {
  const inputTool = params.tools?.find((inputTool2) => isChatCompletionFunctionTool(inputTool2) && inputTool2.function?.name === toolCall.function.name);
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCall.function.arguments) : null
    }
  };
}
function shouldParseToolCall(params, toolCall) {
  if (!params || !("tools" in params) || !params.tools) {
    return false;
  }
  const inputTool = params.tools?.find((inputTool2) => isChatCompletionFunctionTool(inputTool2) && inputTool2.function?.name === toolCall.function.name);
  return isChatCompletionFunctionTool(inputTool) && (isAutoParsableTool(inputTool) || inputTool?.function.strict || false);
}
function hasAutoParseableInput(params) {
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }
  return params.tools?.some((t) => isAutoParsableTool(t) || t.type === "function" && t.function.strict === true) ?? false;
}
function assertToolCallsAreChatCompletionFunctionToolCalls(toolCalls) {
  for (const toolCall of toolCalls || []) {
    if (toolCall.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool calls are supported; Received \`${toolCall.type}\``);
    }
  }
}
function validateInputTools(tools) {
  for (const tool of tools ?? []) {
    if (tool.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``);
    }
    if (tool.function.strict !== true) {
      throw new OpenAIError(`The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
    }
  }
}

// node_modules/openai/lib/chatCompletionUtils.mjs
var isAssistantMessage = (message) => {
  return message?.role === "assistant";
};
var isToolMessage = (message) => {
  return message?.role === "tool";
};

// node_modules/openai/lib/EventStream.mjs
var _EventStream_instances;
var _EventStream_connectedPromise;
var _EventStream_resolveConnectedPromise;
var _EventStream_rejectConnectedPromise;
var _EventStream_endPromise;
var _EventStream_resolveEndPromise;
var _EventStream_rejectEndPromise;
var _EventStream_listeners;
var _EventStream_ended;
var _EventStream_errored;
var _EventStream_aborted;
var _EventStream_catchingPromiseCreated;
var _EventStream_handleError;
var EventStream = class {
  constructor() {
    _EventStream_instances.add(this);
    this.controller = new AbortController();
    _EventStream_connectedPromise.set(this, void 0);
    _EventStream_resolveConnectedPromise.set(this, () => {
    });
    _EventStream_rejectConnectedPromise.set(this, () => {
    });
    _EventStream_endPromise.set(this, void 0);
    _EventStream_resolveEndPromise.set(this, () => {
    });
    _EventStream_rejectEndPromise.set(this, () => {
    });
    _EventStream_listeners.set(this, {});
    _EventStream_ended.set(this, false);
    _EventStream_errored.set(this, false);
    _EventStream_aborted.set(this, false);
    _EventStream_catchingPromiseCreated.set(this, false);
    __classPrivateFieldSet(this, _EventStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet(this, _EventStream_rejectConnectedPromise, reject, "f");
    }), "f");
    __classPrivateFieldSet(this, _EventStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet(this, _EventStream_rejectEndPromise, reject, "f");
    }), "f");
    __classPrivateFieldGet(this, _EventStream_connectedPromise, "f").catch(() => {
    });
    __classPrivateFieldGet(this, _EventStream_endPromise, "f").catch(() => {
    });
  }
  _run(executor) {
    setTimeout(() => {
      executor().then(() => {
        this._emitFinal();
        this._emit("end");
      }, __classPrivateFieldGet(this, _EventStream_instances, "m", _EventStream_handleError).bind(this));
    }, 0);
  }
  _connected() {
    if (this.ended)
      return;
    __classPrivateFieldGet(this, _EventStream_resolveConnectedPromise, "f").call(this);
    this._emit("connect");
  }
  get ended() {
    return __classPrivateFieldGet(this, _EventStream_ended, "f");
  }
  get errored() {
    return __classPrivateFieldGet(this, _EventStream_errored, "f");
  }
  get aborted() {
    return __classPrivateFieldGet(this, _EventStream_aborted, "f");
  }
  abort() {
    this.controller.abort();
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  on(event, listener) {
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener });
    return this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  off(event, listener) {
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
    if (!listeners)
      return this;
    const index = listeners.findIndex((l) => l.listener === listener);
    if (index >= 0)
      listeners.splice(index, 1);
    return this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  once(event, listener) {
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener, once: true });
    return this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * @returns a Promise that resolves the next time given event is triggered,
   * or rejects if an error is emitted.  (If you request the 'error' event,
   * returns a promise that resolves with the error).
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet(this, _EventStream_catchingPromiseCreated, true, "f");
      if (event !== "error")
        this.once("error", reject);
      this.once(event, resolve);
    });
  }
  async done() {
    __classPrivateFieldSet(this, _EventStream_catchingPromiseCreated, true, "f");
    await __classPrivateFieldGet(this, _EventStream_endPromise, "f");
  }
  _emit(event, ...args) {
    if (__classPrivateFieldGet(this, _EventStream_ended, "f")) {
      return;
    }
    if (event === "end") {
      __classPrivateFieldSet(this, _EventStream_ended, true, "f");
      __classPrivateFieldGet(this, _EventStream_resolveEndPromise, "f").call(this);
    }
    const listeners = __classPrivateFieldGet(this, _EventStream_listeners, "f")[event];
    if (listeners) {
      __classPrivateFieldGet(this, _EventStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
      listeners.forEach(({ listener }) => listener(...args));
    }
    if (event === "abort") {
      const error = args[0];
      if (!__classPrivateFieldGet(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
      return;
    }
    if (event === "error") {
      const error = args[0];
      if (!__classPrivateFieldGet(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
    }
  }
  _emitFinal() {
  }
};
_EventStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_endPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_listeners = /* @__PURE__ */ new WeakMap(), _EventStream_ended = /* @__PURE__ */ new WeakMap(), _EventStream_errored = /* @__PURE__ */ new WeakMap(), _EventStream_aborted = /* @__PURE__ */ new WeakMap(), _EventStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _EventStream_instances = /* @__PURE__ */ new WeakSet(), _EventStream_handleError = function _EventStream_handleError2(error) {
  __classPrivateFieldSet(this, _EventStream_errored, true, "f");
  if (error instanceof Error && error.name === "AbortError") {
    error = new APIUserAbortError();
  }
  if (error instanceof APIUserAbortError) {
    __classPrivateFieldSet(this, _EventStream_aborted, true, "f");
    return this._emit("abort", error);
  }
  if (error instanceof OpenAIError) {
    return this._emit("error", error);
  }
  if (error instanceof Error) {
    const openAIError = new OpenAIError(error.message);
    openAIError.cause = error;
    return this._emit("error", openAIError);
  }
  return this._emit("error", new OpenAIError(String(error)));
};

// node_modules/openai/lib/RunnableFunction.mjs
function isRunnableFunctionWithParse(fn) {
  return typeof fn.parse === "function";
}

// node_modules/openai/lib/AbstractChatCompletionRunner.mjs
var _AbstractChatCompletionRunner_instances;
var _AbstractChatCompletionRunner_getFinalContent;
var _AbstractChatCompletionRunner_getFinalMessage;
var _AbstractChatCompletionRunner_getFinalFunctionToolCall;
var _AbstractChatCompletionRunner_getFinalFunctionToolCallResult;
var _AbstractChatCompletionRunner_calculateTotalUsage;
var _AbstractChatCompletionRunner_validateParams;
var _AbstractChatCompletionRunner_stringifyFunctionCallResult;
var DEFAULT_MAX_CHAT_COMPLETIONS = 10;
var AbstractChatCompletionRunner = class extends EventStream {
  constructor() {
    super(...arguments);
    _AbstractChatCompletionRunner_instances.add(this);
    this._chatCompletions = [];
    this.messages = [];
  }
  _addChatCompletion(chatCompletion) {
    this._chatCompletions.push(chatCompletion);
    this._emit("chatCompletion", chatCompletion);
    const message = chatCompletion.choices[0]?.message;
    if (message)
      this._addMessage(message);
    return chatCompletion;
  }
  _addMessage(message, emit = true) {
    if (!("content" in message))
      message.content = null;
    this.messages.push(message);
    if (emit) {
      this._emit("message", message);
      if (isToolMessage(message) && message.content) {
        this._emit("functionToolCallResult", message.content);
      } else if (isAssistantMessage(message) && message.tool_calls) {
        for (const tool_call of message.tool_calls) {
          if (tool_call.type === "function") {
            this._emit("functionToolCall", tool_call.function);
          }
        }
      }
    }
  }
  /**
   * @returns a promise that resolves with the final ChatCompletion, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
   */
  async finalChatCompletion() {
    await this.done();
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (!completion)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return completion;
  }
  /**
   * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalContent() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant ChatCompletionMessage response,
   * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalMessage() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
  }
  /**
   * @returns a promise that resolves with the content of the final FunctionCall, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalFunctionToolCall() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCall).call(this);
  }
  async finalFunctionToolCallResult() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCallResult).call(this);
  }
  async totalUsage() {
    await this.done();
    return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (completion)
      this._emit("finalChatCompletion", completion);
    const finalMessage = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
    if (finalMessage)
      this._emit("finalMessage", finalMessage);
    const finalContent = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
    if (finalContent)
      this._emit("finalContent", finalContent);
    const finalFunctionCall = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCall).call(this);
    if (finalFunctionCall)
      this._emit("finalFunctionToolCall", finalFunctionCall);
    const finalFunctionCallResult = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionToolCallResult).call(this);
    if (finalFunctionCallResult != null)
      this._emit("finalFunctionToolCallResult", finalFunctionCallResult);
    if (this._chatCompletions.some((c) => c.usage)) {
      this._emit("totalUsage", __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this));
    }
  }
  async _createChatCompletion(client, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_validateParams).call(this, params);
    const chatCompletion = await client.chat.completions.create({ ...params, stream: false }, { ...options, signal: this.controller.signal });
    this._connected();
    return this._addChatCompletion(parseChatCompletion(chatCompletion, params));
  }
  async _runChatCompletion(client, params, options) {
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    return await this._createChatCompletion(client, params, options);
  }
  async _runTools(client, params, options) {
    const role = "tool";
    const { tool_choice = "auto", stream, ...restParams } = params;
    const singleFunctionToCall = typeof tool_choice !== "string" && tool_choice.type === "function" && tool_choice?.function?.name;
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
    const inputTools = params.tools.map((tool) => {
      if (isAutoParsableTool(tool)) {
        if (!tool.$callback) {
          throw new OpenAIError("Tool given to `.runTools()` that does not have an associated function");
        }
        return {
          type: "function",
          function: {
            function: tool.$callback,
            name: tool.function.name,
            description: tool.function.description || "",
            parameters: tool.function.parameters,
            parse: tool.$parseRaw,
            strict: true
          }
        };
      }
      return tool;
    });
    const functionsByName = {};
    for (const f of inputTools) {
      if (f.type === "function") {
        functionsByName[f.function.name || f.function.function.name] = f.function;
      }
    }
    const tools = "tools" in params ? inputTools.map((t) => t.type === "function" ? {
      type: "function",
      function: {
        name: t.function.name || t.function.function.name,
        parameters: t.function.parameters,
        description: t.function.description,
        strict: t.function.strict
      }
    } : t) : void 0;
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        tool_choice,
        tools,
        messages: [...this.messages]
      }, options);
      const message = chatCompletion.choices[0]?.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!message.tool_calls?.length) {
        return;
      }
      for (const tool_call of message.tool_calls) {
        if (tool_call.type !== "function")
          continue;
        const tool_call_id = tool_call.id;
        const { name, arguments: args } = tool_call.function;
        const fn = functionsByName[name];
        if (!fn) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name)}. Available options are: ${Object.keys(functionsByName).map((name2) => JSON.stringify(name2)).join(", ")}. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        } else if (singleFunctionToCall && singleFunctionToCall !== name) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        let parsed;
        try {
          parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
        } catch (error) {
          const content2 = error instanceof Error ? error.message : String(error);
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        const rawContent = await fn.function(parsed, this);
        const content = __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
        this._addMessage({ role, tool_call_id, content });
        if (singleFunctionToCall) {
          return;
        }
      }
    }
    return;
  }
};
_AbstractChatCompletionRunner_instances = /* @__PURE__ */ new WeakSet(), _AbstractChatCompletionRunner_getFinalContent = function _AbstractChatCompletionRunner_getFinalContent2() {
  return __classPrivateFieldGet(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this).content ?? null;
}, _AbstractChatCompletionRunner_getFinalMessage = function _AbstractChatCompletionRunner_getFinalMessage2() {
  let i = this.messages.length;
  while (i-- > 0) {
    const message = this.messages[i];
    if (isAssistantMessage(message)) {
      const ret = {
        ...message,
        content: message.content ?? null,
        refusal: message.refusal ?? null
      };
      return ret;
    }
  }
  throw new OpenAIError("stream ended without producing a ChatCompletionMessage with role=assistant");
}, _AbstractChatCompletionRunner_getFinalFunctionToolCall = function _AbstractChatCompletionRunner_getFinalFunctionToolCall2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isAssistantMessage(message) && message?.tool_calls?.length) {
      return message.tool_calls.filter((x) => x.type === "function").at(-1)?.function;
    }
  }
  return;
}, _AbstractChatCompletionRunner_getFinalFunctionToolCallResult = function _AbstractChatCompletionRunner_getFinalFunctionToolCallResult2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isToolMessage(message) && message.content != null && typeof message.content === "string" && this.messages.some((x) => x.role === "assistant" && x.tool_calls?.some((y) => y.type === "function" && y.id === message.tool_call_id))) {
      return message.content;
    }
  }
  return;
}, _AbstractChatCompletionRunner_calculateTotalUsage = function _AbstractChatCompletionRunner_calculateTotalUsage2() {
  const total = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage } of this._chatCompletions) {
    if (usage) {
      total.completion_tokens += usage.completion_tokens;
      total.prompt_tokens += usage.prompt_tokens;
      total.total_tokens += usage.total_tokens;
    }
  }
  return total;
}, _AbstractChatCompletionRunner_validateParams = function _AbstractChatCompletionRunner_validateParams2(params) {
  if (params.n != null && params.n > 1) {
    throw new OpenAIError("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
  }
}, _AbstractChatCompletionRunner_stringifyFunctionCallResult = function _AbstractChatCompletionRunner_stringifyFunctionCallResult2(rawContent) {
  return typeof rawContent === "string" ? rawContent : rawContent === void 0 ? "undefined" : JSON.stringify(rawContent);
};

// node_modules/openai/lib/ChatCompletionRunner.mjs
var ChatCompletionRunner = class _ChatCompletionRunner extends AbstractChatCompletionRunner {
  static runTools(client, params, options) {
    const runner = new _ChatCompletionRunner();
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
  _addMessage(message, emit = true) {
    super._addMessage(message, emit);
    if (isAssistantMessage(message) && message.content) {
      this._emit("content", message.content);
    }
  }
};

// node_modules/openai/_vendor/partial-json-parser/parser.mjs
var STR = 1;
var NUM = 2;
var ARR = 4;
var OBJ = 8;
var NULL = 16;
var BOOL = 32;
var NAN = 64;
var INFINITY = 128;
var MINUS_INFINITY = 256;
var INF = INFINITY | MINUS_INFINITY;
var SPECIAL = NULL | BOOL | INF | NAN;
var ATOM = STR | NUM | SPECIAL;
var COLLECTION = ARR | OBJ;
var ALL = ATOM | COLLECTION;
var Allow = {
  STR,
  NUM,
  ARR,
  OBJ,
  NULL,
  BOOL,
  NAN,
  INFINITY,
  MINUS_INFINITY,
  INF,
  SPECIAL,
  ATOM,
  COLLECTION,
  ALL
};
var PartialJSON = class extends Error {
};
var MalformedJSON = class extends Error {
};
function parseJSON(jsonString, allowPartial = Allow.ALL) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}
var _parseJSON = (jsonString, allow) => {
  const length = jsonString.length;
  let index = 0;
  const markPartialJSON = (msg) => {
    throw new PartialJSON(`${msg} at position ${index}`);
  };
  const throwMalformedError = (msg) => {
    throw new MalformedJSON(`${msg} at position ${index}`);
  };
  const parseAny = () => {
    skipBlank();
    if (index >= length)
      markPartialJSON("Unexpected end of input");
    if (jsonString[index] === '"')
      return parseStr();
    if (jsonString[index] === "{")
      return parseObj();
    if (jsonString[index] === "[")
      return parseArr();
    if (jsonString.substring(index, index + 4) === "null" || Allow.NULL & allow && length - index < 4 && "null".startsWith(jsonString.substring(index))) {
      index += 4;
      return null;
    }
    if (jsonString.substring(index, index + 4) === "true" || Allow.BOOL & allow && length - index < 4 && "true".startsWith(jsonString.substring(index))) {
      index += 4;
      return true;
    }
    if (jsonString.substring(index, index + 5) === "false" || Allow.BOOL & allow && length - index < 5 && "false".startsWith(jsonString.substring(index))) {
      index += 5;
      return false;
    }
    if (jsonString.substring(index, index + 8) === "Infinity" || Allow.INFINITY & allow && length - index < 8 && "Infinity".startsWith(jsonString.substring(index))) {
      index += 8;
      return Infinity;
    }
    if (jsonString.substring(index, index + 9) === "-Infinity" || Allow.MINUS_INFINITY & allow && 1 < length - index && length - index < 9 && "-Infinity".startsWith(jsonString.substring(index))) {
      index += 9;
      return -Infinity;
    }
    if (jsonString.substring(index, index + 3) === "NaN" || Allow.NAN & allow && length - index < 3 && "NaN".startsWith(jsonString.substring(index))) {
      index += 3;
      return NaN;
    }
    return parseNum();
  };
  const parseStr = () => {
    const start = index;
    let escape2 = false;
    index++;
    while (index < length && (jsonString[index] !== '"' || escape2 && jsonString[index - 1] === "\\")) {
      escape2 = jsonString[index] === "\\" ? !escape2 : false;
      index++;
    }
    if (jsonString.charAt(index) == '"') {
      try {
        return JSON.parse(jsonString.substring(start, ++index - Number(escape2)));
      } catch (e) {
        throwMalformedError(String(e));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start, index - Number(escape2)) + '"');
      } catch (e) {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("\\")) + '"');
      }
    }
    markPartialJSON("Unterminated string literal");
  };
  const parseObj = () => {
    index++;
    skipBlank();
    const obj = {};
    try {
      while (jsonString[index] !== "}") {
        skipBlank();
        if (index >= length && Allow.OBJ & allow)
          return obj;
        const key = parseStr();
        skipBlank();
        index++;
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e) {
          if (Allow.OBJ & allow)
            return obj;
          else
            throw e;
        }
        skipBlank();
        if (jsonString[index] === ",")
          index++;
      }
    } catch (e) {
      if (Allow.OBJ & allow)
        return obj;
      else
        markPartialJSON("Expected '}' at end of object");
    }
    index++;
    return obj;
  };
  const parseArr = () => {
    index++;
    const arr = [];
    try {
      while (jsonString[index] !== "]") {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index] === ",") {
          index++;
        }
      }
    } catch (e) {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index++;
    return arr;
  };
  const parseNum = () => {
    if (index === 0) {
      if (jsonString === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        if (Allow.NUM & allow) {
          try {
            if ("." === jsonString[jsonString.length - 1])
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf(".")));
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
          } catch (e2) {
          }
        }
        throwMalformedError(String(e));
      }
    }
    const start = index;
    if (jsonString[index] === "-")
      index++;
    while (jsonString[index] && !",]}".includes(jsonString[index]))
      index++;
    if (index == length && !(Allow.NUM & allow))
      markPartialJSON("Unterminated number literal");
    try {
      return JSON.parse(jsonString.substring(start, index));
    } catch (e) {
      if (jsonString.substring(start, index) === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("e")));
      } catch (e2) {
        throwMalformedError(String(e2));
      }
    }
  };
  const skipBlank = () => {
    while (index < length && " \n\r	".includes(jsonString[index])) {
      index++;
    }
  };
  return parseAny();
};
var partialParse = (input) => parseJSON(input, Allow.ALL ^ Allow.NUM);

// node_modules/openai/lib/ChatCompletionStream.mjs
var _ChatCompletionStream_instances;
var _ChatCompletionStream_params;
var _ChatCompletionStream_choiceEventStates;
var _ChatCompletionStream_currentChatCompletionSnapshot;
var _ChatCompletionStream_beginRequest;
var _ChatCompletionStream_getChoiceEventState;
var _ChatCompletionStream_addChunk;
var _ChatCompletionStream_emitToolCallDoneEvent;
var _ChatCompletionStream_emitContentDoneEvents;
var _ChatCompletionStream_endRequest;
var _ChatCompletionStream_getAutoParseableResponseFormat;
var _ChatCompletionStream_accumulateChatCompletion;
var ChatCompletionStream = class _ChatCompletionStream extends AbstractChatCompletionRunner {
  constructor(params) {
    super();
    _ChatCompletionStream_instances.add(this);
    _ChatCompletionStream_params.set(this, void 0);
    _ChatCompletionStream_choiceEventStates.set(this, void 0);
    _ChatCompletionStream_currentChatCompletionSnapshot.set(this, void 0);
    __classPrivateFieldSet(this, _ChatCompletionStream_params, params, "f");
    __classPrivateFieldSet(this, _ChatCompletionStream_choiceEventStates, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(stream) {
    const runner = new _ChatCompletionStream(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static createChatCompletion(client, params, options) {
    const runner = new _ChatCompletionStream(params);
    runner._run(() => runner._runChatCompletion(client, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
    return runner;
  }
  async _createChatCompletion(client, params, options) {
    super._createChatCompletion;
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    const stream = await client.chat.completions.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const chunk of stream) {
      __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    let chatId;
    for await (const chunk of stream) {
      if (chatId && chatId !== chunk.id) {
        this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
      }
      __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
      chatId = chunk.id;
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  [(_ChatCompletionStream_params = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_choiceEventStates = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_currentChatCompletionSnapshot = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_instances = /* @__PURE__ */ new WeakSet(), _ChatCompletionStream_beginRequest = function _ChatCompletionStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
  }, _ChatCompletionStream_getChoiceEventState = function _ChatCompletionStream_getChoiceEventState2(choice) {
    let state = __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
    if (state) {
      return state;
    }
    state = {
      content_done: false,
      refusal_done: false,
      logprobs_content_done: false,
      logprobs_refusal_done: false,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    };
    __classPrivateFieldGet(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index] = state;
    return state;
  }, _ChatCompletionStream_addChunk = function _ChatCompletionStream_addChunk2(chunk) {
    if (this.ended)
      return;
    const completion = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_accumulateChatCompletion).call(this, chunk);
    this._emit("chunk", chunk, completion);
    for (const choice of chunk.choices) {
      const choiceSnapshot = completion.choices[choice.index];
      if (choice.delta.content != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.content) {
        this._emit("content", choice.delta.content, choiceSnapshot.message.content);
        this._emit("content.delta", {
          delta: choice.delta.content,
          snapshot: choiceSnapshot.message.content,
          parsed: choiceSnapshot.message.parsed
        });
      }
      if (choice.delta.refusal != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.refusal) {
        this._emit("refusal.delta", {
          delta: choice.delta.refusal,
          snapshot: choiceSnapshot.message.refusal
        });
      }
      if (choice.logprobs?.content != null && choiceSnapshot.message?.role === "assistant") {
        this._emit("logprobs.content.delta", {
          content: choice.logprobs?.content,
          snapshot: choiceSnapshot.logprobs?.content ?? []
        });
      }
      if (choice.logprobs?.refusal != null && choiceSnapshot.message?.role === "assistant") {
        this._emit("logprobs.refusal.delta", {
          refusal: choice.logprobs?.refusal,
          snapshot: choiceSnapshot.logprobs?.refusal ?? []
        });
      }
      const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
      if (choiceSnapshot.finish_reason) {
        __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
        if (state.current_tool_call_index != null) {
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
        }
      }
      for (const toolCall of choice.delta.tool_calls ?? []) {
        if (state.current_tool_call_index !== toolCall.index) {
          __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
          if (state.current_tool_call_index != null) {
            __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
          }
        }
        state.current_tool_call_index = toolCall.index;
      }
      for (const toolCallDelta of choice.delta.tool_calls ?? []) {
        const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallDelta.index];
        if (!toolCallSnapshot?.type) {
          continue;
        }
        if (toolCallSnapshot?.type === "function") {
          this._emit("tool_calls.function.arguments.delta", {
            name: toolCallSnapshot.function?.name,
            index: toolCallDelta.index,
            arguments: toolCallSnapshot.function.arguments,
            parsed_arguments: toolCallSnapshot.function.parsed_arguments,
            arguments_delta: toolCallDelta.function?.arguments ?? ""
          });
        } else {
          assertNever(toolCallSnapshot?.type);
        }
      }
    }
  }, _ChatCompletionStream_emitToolCallDoneEvent = function _ChatCompletionStream_emitToolCallDoneEvent2(choiceSnapshot, toolCallIndex) {
    const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (state.done_tool_calls.has(toolCallIndex)) {
      return;
    }
    const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallIndex];
    if (!toolCallSnapshot) {
      throw new Error("no tool call snapshot");
    }
    if (!toolCallSnapshot.type) {
      throw new Error("tool call snapshot missing `type`");
    }
    if (toolCallSnapshot.type === "function") {
      const inputTool = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")?.tools?.find((tool) => isChatCompletionFunctionTool(tool) && tool.function.name === toolCallSnapshot.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: toolCallSnapshot.function.name,
        index: toolCallIndex,
        arguments: toolCallSnapshot.function.arguments,
        parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCallSnapshot.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCallSnapshot.function.arguments) : null
      });
    } else {
      assertNever(toolCallSnapshot.type);
    }
  }, _ChatCompletionStream_emitContentDoneEvents = function _ChatCompletionStream_emitContentDoneEvents2(choiceSnapshot) {
    const state = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (choiceSnapshot.message.content && !state.content_done) {
      state.content_done = true;
      const responseFormat = __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this);
      this._emit("content.done", {
        content: choiceSnapshot.message.content,
        parsed: responseFormat ? responseFormat.$parseRaw(choiceSnapshot.message.content) : null
      });
    }
    if (choiceSnapshot.message.refusal && !state.refusal_done) {
      state.refusal_done = true;
      this._emit("refusal.done", { refusal: choiceSnapshot.message.refusal });
    }
    if (choiceSnapshot.logprobs?.content && !state.logprobs_content_done) {
      state.logprobs_content_done = true;
      this._emit("logprobs.content.done", { content: choiceSnapshot.logprobs.content });
    }
    if (choiceSnapshot.logprobs?.refusal && !state.logprobs_refusal_done) {
      state.logprobs_refusal_done = true;
      this._emit("logprobs.refusal.done", { refusal: choiceSnapshot.logprobs.refusal });
    }
  }, _ChatCompletionStream_endRequest = function _ChatCompletionStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any chunks`);
    }
    __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
    __classPrivateFieldSet(this, _ChatCompletionStream_choiceEventStates, [], "f");
    return finalizeChatCompletion(snapshot, __classPrivateFieldGet(this, _ChatCompletionStream_params, "f"));
  }, _ChatCompletionStream_getAutoParseableResponseFormat = function _ChatCompletionStream_getAutoParseableResponseFormat2() {
    const responseFormat = __classPrivateFieldGet(this, _ChatCompletionStream_params, "f")?.response_format;
    if (isAutoParsableResponseFormat(responseFormat)) {
      return responseFormat;
    }
    return null;
  }, _ChatCompletionStream_accumulateChatCompletion = function _ChatCompletionStream_accumulateChatCompletion2(chunk) {
    var _a3, _b, _c, _d;
    let snapshot = __classPrivateFieldGet(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    const { choices, ...rest } = chunk;
    if (!snapshot) {
      snapshot = __classPrivateFieldSet(this, _ChatCompletionStream_currentChatCompletionSnapshot, {
        ...rest,
        choices: []
      }, "f");
    } else {
      Object.assign(snapshot, rest);
    }
    for (const { delta, finish_reason, index, logprobs = null, ...other } of chunk.choices) {
      let choice = snapshot.choices[index];
      if (!choice) {
        choice = snapshot.choices[index] = { finish_reason, index, message: {}, logprobs, ...other };
      }
      if (logprobs) {
        if (!choice.logprobs) {
          choice.logprobs = Object.assign({}, logprobs);
        } else {
          const { content: content2, refusal: refusal2, ...rest3 } = logprobs;
          assertIsEmpty(rest3);
          Object.assign(choice.logprobs, rest3);
          if (content2) {
            (_a3 = choice.logprobs).content ?? (_a3.content = []);
            choice.logprobs.content.push(...content2);
          }
          if (refusal2) {
            (_b = choice.logprobs).refusal ?? (_b.refusal = []);
            choice.logprobs.refusal.push(...refusal2);
          }
        }
      }
      if (finish_reason) {
        choice.finish_reason = finish_reason;
        if (__classPrivateFieldGet(this, _ChatCompletionStream_params, "f") && hasAutoParseableInput(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f"))) {
          if (finish_reason === "length") {
            throw new LengthFinishReasonError();
          }
          if (finish_reason === "content_filter") {
            throw new ContentFilterFinishReasonError();
          }
        }
      }
      Object.assign(choice, other);
      if (!delta)
        continue;
      const { content, refusal, function_call, role, tool_calls, ...rest2 } = delta;
      assertIsEmpty(rest2);
      Object.assign(choice.message, rest2);
      if (refusal) {
        choice.message.refusal = (choice.message.refusal || "") + refusal;
      }
      if (role)
        choice.message.role = role;
      if (function_call) {
        if (!choice.message.function_call) {
          choice.message.function_call = function_call;
        } else {
          if (function_call.name)
            choice.message.function_call.name = function_call.name;
          if (function_call.arguments) {
            (_c = choice.message.function_call).arguments ?? (_c.arguments = "");
            choice.message.function_call.arguments += function_call.arguments;
          }
        }
      }
      if (content) {
        choice.message.content = (choice.message.content || "") + content;
        if (!choice.message.refusal && __classPrivateFieldGet(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this)) {
          choice.message.parsed = partialParse(choice.message.content);
        }
      }
      if (tool_calls) {
        if (!choice.message.tool_calls)
          choice.message.tool_calls = [];
        for (const { index: index2, id, type, function: fn, ...rest3 } of tool_calls) {
          const tool_call = (_d = choice.message.tool_calls)[index2] ?? (_d[index2] = {});
          Object.assign(tool_call, rest3);
          if (id)
            tool_call.id = id;
          if (type)
            tool_call.type = type;
          if (fn)
            tool_call.function ?? (tool_call.function = { name: fn.name ?? "", arguments: "" });
          if (fn?.name)
            tool_call.function.name = fn.name;
          if (fn?.arguments) {
            tool_call.function.arguments += fn.arguments;
            if (shouldParseToolCall(__classPrivateFieldGet(this, _ChatCompletionStream_params, "f"), tool_call)) {
              tool_call.function.parsed_arguments = partialParse(tool_call.function.arguments);
            }
          }
        }
      }
    }
    return snapshot;
  }, Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("chunk", (chunk) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(chunk);
      } else {
        pushQueue.push(chunk);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
};
function finalizeChatCompletion(snapshot, params) {
  const { id, choices, created, model, system_fingerprint, ...rest } = snapshot;
  const completion = {
    ...rest,
    id,
    choices: choices.map(({ message, finish_reason, index, logprobs, ...choiceRest }) => {
      if (!finish_reason) {
        throw new OpenAIError(`missing finish_reason for choice ${index}`);
      }
      const { content = null, function_call, tool_calls, ...messageRest } = message;
      const role = message.role;
      if (!role) {
        throw new OpenAIError(`missing role for choice ${index}`);
      }
      if (function_call) {
        const { arguments: args, name } = function_call;
        if (args == null) {
          throw new OpenAIError(`missing function_call.arguments for choice ${index}`);
        }
        if (!name) {
          throw new OpenAIError(`missing function_call.name for choice ${index}`);
        }
        return {
          ...choiceRest,
          message: {
            content,
            function_call: { arguments: args, name },
            role,
            refusal: message.refusal ?? null
          },
          finish_reason,
          index,
          logprobs
        };
      }
      if (tool_calls) {
        return {
          ...choiceRest,
          index,
          finish_reason,
          logprobs,
          message: {
            ...messageRest,
            role,
            content,
            refusal: message.refusal ?? null,
            tool_calls: tool_calls.map((tool_call, i) => {
              const { function: fn, type, id: id2, ...toolRest } = tool_call;
              const { arguments: args, name, ...fnRest } = fn || {};
              if (id2 == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].id
${str(snapshot)}`);
              }
              if (type == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].type
${str(snapshot)}`);
              }
              if (name == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.name
${str(snapshot)}`);
              }
              if (args == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.arguments
${str(snapshot)}`);
              }
              return { ...toolRest, id: id2, type, function: { ...fnRest, name, arguments: args } };
            })
          }
        };
      }
      return {
        ...choiceRest,
        message: { ...messageRest, content, role, refusal: message.refusal ?? null },
        finish_reason,
        index,
        logprobs
      };
    }),
    created,
    model,
    object: "chat.completion",
    ...system_fingerprint ? { system_fingerprint } : {}
  };
  return maybeParseChatCompletion(completion, params);
}
function str(x) {
  return JSON.stringify(x);
}
function assertIsEmpty(obj) {
  return;
}
function assertNever(_x) {
}

// node_modules/openai/lib/ChatCompletionStreamingRunner.mjs
var ChatCompletionStreamingRunner = class _ChatCompletionStreamingRunner extends ChatCompletionStream {
  static fromReadableStream(stream) {
    const runner = new _ChatCompletionStreamingRunner(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static runTools(client, params, options) {
    const runner = new _ChatCompletionStreamingRunner(
      // @ts-expect-error TODO these types are incompatible
      params
    );
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
};

// node_modules/openai/resources/chat/completions/completions.mjs
var Completions = class extends APIResource {
  constructor() {
    super(...arguments);
    this.messages = new Messages(this._client);
  }
  create(body, options) {
    return this._client.post("/chat/completions", { body, ...options, stream: body.stream ?? false });
  }
  /**
   * Get a stored chat completion. Only Chat Completions that have been created with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * const chatCompletion =
   *   await client.chat.completions.retrieve('completion_id');
   * ```
   */
  retrieve(completionID, options) {
    return this._client.get(path`/chat/completions/${completionID}`, options);
  }
  /**
   * Modify a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be modified. Currently, the only
   * supported modification is to update the `metadata` field.
   *
   * @example
   * ```ts
   * const chatCompletion = await client.chat.completions.update(
   *   'completion_id',
   *   { metadata: { foo: 'string' } },
   * );
   * ```
   */
  update(completionID, body, options) {
    return this._client.post(path`/chat/completions/${completionID}`, { body, ...options });
  }
  /**
   * List stored Chat Completions. Only Chat Completions that have been stored with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatCompletion of client.chat.completions.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options) {
    return this._client.getAPIList("/chat/completions", CursorPage, { query, ...options });
  }
  /**
   * Delete a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be deleted.
   *
   * @example
   * ```ts
   * const chatCompletionDeleted =
   *   await client.chat.completions.delete('completion_id');
   * ```
   */
  delete(completionID, options) {
    return this._client.delete(path`/chat/completions/${completionID}`, options);
  }
  parse(body, options) {
    validateInputTools(body.tools);
    return this._client.chat.completions.create(body, {
      ...options,
      headers: {
        ...options?.headers,
        "X-Stainless-Helper-Method": "chat.completions.parse"
      }
    })._thenUnwrap((completion) => parseChatCompletion(completion, body));
  }
  runTools(body, options) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runTools(this._client, body, options);
    }
    return ChatCompletionRunner.runTools(this._client, body, options);
  }
  /**
   * Creates a chat completion stream
   */
  stream(body, options) {
    return ChatCompletionStream.createChatCompletion(this._client, body, options);
  }
};
Completions.Messages = Messages;

// node_modules/openai/resources/chat/chat.mjs
var Chat = class extends APIResource {
  constructor() {
    super(...arguments);
    this.completions = new Completions(this._client);
  }
};
Chat.Completions = Completions;

// node_modules/openai/internal/headers.mjs
var brand_privateNullableHeaders = /* @__PURE__ */ Symbol("brand.privateNullableHeaders");
function* iterateHeaders(headers) {
  if (!headers)
    return;
  if (brand_privateNullableHeaders in headers) {
    const { values, nulls } = headers;
    yield* values.entries();
    for (const name of nulls) {
      yield [name, null];
    }
    return;
  }
  let shouldClear = false;
  let iter;
  if (headers instanceof Headers) {
    iter = headers.entries();
  } else if (isReadonlyArray(headers)) {
    iter = headers;
  } else {
    shouldClear = true;
    iter = Object.entries(headers ?? {});
  }
  for (let row of iter) {
    const name = row[0];
    if (typeof name !== "string")
      throw new TypeError("expected header name to be a string");
    const values = isReadonlyArray(row[1]) ? row[1] : [row[1]];
    let didClear = false;
    for (const value of values) {
      if (value === void 0)
        continue;
      if (shouldClear && !didClear) {
        didClear = true;
        yield [name, null];
      }
      yield [name, value];
    }
  }
}
var buildHeaders = (newHeaders) => {
  const targetHeaders = new Headers();
  const nullHeaders = /* @__PURE__ */ new Set();
  for (const headers of newHeaders) {
    const seenHeaders = /* @__PURE__ */ new Set();
    for (const [name, value] of iterateHeaders(headers)) {
      const lowerName = name.toLowerCase();
      if (!seenHeaders.has(lowerName)) {
        targetHeaders.delete(name);
        seenHeaders.add(lowerName);
      }
      if (value === null) {
        targetHeaders.delete(name);
        nullHeaders.add(lowerName);
      } else {
        targetHeaders.append(name, value);
        nullHeaders.delete(lowerName);
      }
    }
  }
  return { [brand_privateNullableHeaders]: true, values: targetHeaders, nulls: nullHeaders };
};

// node_modules/openai/resources/audio/speech.mjs
var Speech = class extends APIResource {
  /**
   * Generates audio from the input text.
   *
   * @example
   * ```ts
   * const speech = await client.audio.speech.create({
   *   input: 'input',
   *   model: 'string',
   *   voice: 'ash',
   * });
   *
   * const content = await speech.blob();
   * console.log(content);
   * ```
   */
  create(body, options) {
    return this._client.post("/audio/speech", {
      body,
      ...options,
      headers: buildHeaders([{ Accept: "application/octet-stream" }, options?.headers]),
      __binaryResponse: true
    });
  }
};

// node_modules/openai/resources/audio/transcriptions.mjs
var Transcriptions = class extends APIResource {
  create(body, options) {
    return this._client.post("/audio/transcriptions", multipartFormRequestOptions({
      body,
      ...options,
      stream: body.stream ?? false,
      __metadata: { model: body.model }
    }, this._client));
  }
};

// node_modules/openai/resources/audio/translations.mjs
var Translations = class extends APIResource {
  create(body, options) {
    return this._client.post("/audio/translations", multipartFormRequestOptions({ body, ...options, __metadata: { model: body.model } }, this._client));
  }
};

// node_modules/openai/resources/audio/audio.mjs
var Audio = class extends APIResource {
  constructor() {
    super(...arguments);
    this.transcriptions = new Transcriptions(this._client);
    this.translations = new Translations(this._client);
    this.speech = new Speech(this._client);
  }
};
Audio.Transcriptions = Transcriptions;
Audio.Translations = Translations;
Audio.Speech = Speech;

// node_modules/openai/resources/batches.mjs
var Batches = class extends APIResource {
  /**
   * Creates and executes a batch from an uploaded file of requests
   */
  create(body, options) {
    return this._client.post("/batches", { body, ...options });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(batchID, options) {
    return this._client.get(path`/batches/${batchID}`, options);
  }
  /**
   * List your organization's batches.
   */
  list(query = {}, options) {
    return this._client.getAPIList("/batches", CursorPage, { query, ...options });
  }
  /**
   * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
   * 10 minutes, before changing to `cancelled`, where it will have partial results
   * (if any) available in the output file.
   */
  cancel(batchID, options) {
    return this._client.post(path`/batches/${batchID}/cancel`, options);
  }
};

// node_modules/openai/resources/beta/assistants.mjs
var Assistants = class extends APIResource {
  /**
   * Create an assistant with a model and instructions.
   *
   * @deprecated
   */
  create(body, options) {
    return this._client.post("/assistants", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Retrieves an assistant.
   *
   * @deprecated
   */
  retrieve(assistantID, options) {
    return this._client.get(path`/assistants/${assistantID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Modifies an assistant.
   *
   * @deprecated
   */
  update(assistantID, body, options) {
    return this._client.post(path`/assistants/${assistantID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Returns a list of assistants.
   *
   * @deprecated
   */
  list(query = {}, options) {
    return this._client.getAPIList("/assistants", CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Delete an assistant.
   *
   * @deprecated
   */
  delete(assistantID, options) {
    return this._client.delete(path`/assistants/${assistantID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
};

// node_modules/openai/resources/beta/realtime/sessions.mjs
var Sessions = class extends APIResource {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API. Can be configured with the same session parameters as the
   * `session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const session =
   *   await client.beta.realtime.sessions.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/sessions", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
};

// node_modules/openai/resources/beta/realtime/transcription-sessions.mjs
var TranscriptionSessions = class extends APIResource {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API specifically for realtime transcriptions. Can be configured with
   * the same session parameters as the `transcription_session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const transcriptionSession =
   *   await client.beta.realtime.transcriptionSessions.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/transcription_sessions", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
};

// node_modules/openai/resources/beta/realtime/realtime.mjs
var Realtime = class extends APIResource {
  constructor() {
    super(...arguments);
    this.sessions = new Sessions(this._client);
    this.transcriptionSessions = new TranscriptionSessions(this._client);
  }
};
Realtime.Sessions = Sessions;
Realtime.TranscriptionSessions = TranscriptionSessions;

// node_modules/openai/resources/beta/chatkit/sessions.mjs
var Sessions2 = class extends APIResource {
  /**
   * Create a ChatKit session
   *
   * @example
   * ```ts
   * const chatSession =
   *   await client.beta.chatkit.sessions.create({
   *     user: 'x',
   *     workflow: { id: 'id' },
   *   });
   * ```
   */
  create(body, options) {
    return this._client.post("/chatkit/sessions", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
    });
  }
  /**
   * Cancel a ChatKit session
   *
   * @example
   * ```ts
   * const chatSession =
   *   await client.beta.chatkit.sessions.cancel('cksess_123');
   * ```
   */
  cancel(sessionID, options) {
    return this._client.post(path`/chatkit/sessions/${sessionID}/cancel`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
    });
  }
};

// node_modules/openai/resources/beta/chatkit/threads.mjs
var Threads = class extends APIResource {
  /**
   * Retrieve a ChatKit thread
   *
   * @example
   * ```ts
   * const chatkitThread =
   *   await client.beta.chatkit.threads.retrieve('cthr_123');
   * ```
   */
  retrieve(threadID, options) {
    return this._client.get(path`/chatkit/threads/${threadID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
    });
  }
  /**
   * List ChatKit threads
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const chatkitThread of client.beta.chatkit.threads.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options) {
    return this._client.getAPIList("/chatkit/threads", ConversationCursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
    });
  }
  /**
   * Delete a ChatKit thread
   *
   * @example
   * ```ts
   * const thread = await client.beta.chatkit.threads.delete(
   *   'cthr_123',
   * );
   * ```
   */
  delete(threadID, options) {
    return this._client.delete(path`/chatkit/threads/${threadID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers])
    });
  }
  /**
   * List ChatKit thread items
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const thread of client.beta.chatkit.threads.listItems(
   *   'cthr_123',
   * )) {
   *   // ...
   * }
   * ```
   */
  listItems(threadID, query = {}, options) {
    return this._client.getAPIList(path`/chatkit/threads/${threadID}/items`, ConversationCursorPage, { query, ...options, headers: buildHeaders([{ "OpenAI-Beta": "chatkit_beta=v1" }, options?.headers]) });
  }
};

// node_modules/openai/resources/beta/chatkit/chatkit.mjs
var ChatKit = class extends APIResource {
  constructor() {
    super(...arguments);
    this.sessions = new Sessions2(this._client);
    this.threads = new Threads(this._client);
  }
};
ChatKit.Sessions = Sessions2;
ChatKit.Threads = Threads;

// node_modules/openai/resources/beta/threads/messages.mjs
var Messages2 = class extends APIResource {
  /**
   * Create a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(threadID, body, options) {
    return this._client.post(path`/threads/${threadID}/messages`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Retrieve a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(messageID, params, options) {
    const { thread_id } = params;
    return this._client.get(path`/threads/${thread_id}/messages/${messageID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Modifies a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(messageID, params, options) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/messages/${messageID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Returns a list of messages for a given thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(threadID, query = {}, options) {
    return this._client.getAPIList(path`/threads/${threadID}/messages`, CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Deletes a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(messageID, params, options) {
    const { thread_id } = params;
    return this._client.delete(path`/threads/${thread_id}/messages/${messageID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
};

// node_modules/openai/resources/beta/threads/runs/steps.mjs
var Steps = class extends APIResource {
  /**
   * Retrieves a run step.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(stepID, params, options) {
    const { thread_id, run_id, ...query } = params;
    return this._client.get(path`/threads/${thread_id}/runs/${run_id}/steps/${stepID}`, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Returns a list of run steps belonging to a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(runID, params, options) {
    const { thread_id, ...query } = params;
    return this._client.getAPIList(path`/threads/${thread_id}/runs/${runID}/steps`, CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
};

// node_modules/openai/internal/utils/base64.mjs
var toFloat32Array = (base64Str) => {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64Str, "base64");
    return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return Array.from(new Float32Array(bytes.buffer));
  }
};

// node_modules/openai/internal/utils/env.mjs
var readEnv = (env) => {
  if (typeof globalThis.process !== "undefined") {
    return globalThis.process.env?.[env]?.trim() ?? void 0;
  }
  if (typeof globalThis.Deno !== "undefined") {
    return globalThis.Deno.env?.get?.(env)?.trim();
  }
  return void 0;
};

// node_modules/openai/lib/AssistantStream.mjs
var _AssistantStream_instances;
var _a;
var _AssistantStream_events;
var _AssistantStream_runStepSnapshots;
var _AssistantStream_messageSnapshots;
var _AssistantStream_messageSnapshot;
var _AssistantStream_finalRun;
var _AssistantStream_currentContentIndex;
var _AssistantStream_currentContent;
var _AssistantStream_currentToolCallIndex;
var _AssistantStream_currentToolCall;
var _AssistantStream_currentEvent;
var _AssistantStream_currentRunSnapshot;
var _AssistantStream_currentRunStepSnapshot;
var _AssistantStream_addEvent;
var _AssistantStream_endRequest;
var _AssistantStream_handleMessage;
var _AssistantStream_handleRunStep;
var _AssistantStream_handleEvent;
var _AssistantStream_accumulateRunStep;
var _AssistantStream_accumulateMessage;
var _AssistantStream_accumulateContent;
var _AssistantStream_handleRun;
var AssistantStream = class extends EventStream {
  constructor() {
    super(...arguments);
    _AssistantStream_instances.add(this);
    _AssistantStream_events.set(this, []);
    _AssistantStream_runStepSnapshots.set(this, {});
    _AssistantStream_messageSnapshots.set(this, {});
    _AssistantStream_messageSnapshot.set(this, void 0);
    _AssistantStream_finalRun.set(this, void 0);
    _AssistantStream_currentContentIndex.set(this, void 0);
    _AssistantStream_currentContent.set(this, void 0);
    _AssistantStream_currentToolCallIndex.set(this, void 0);
    _AssistantStream_currentToolCall.set(this, void 0);
    _AssistantStream_currentEvent.set(this, void 0);
    _AssistantStream_currentRunSnapshot.set(this, void 0);
    _AssistantStream_currentRunStepSnapshot.set(this, void 0);
  }
  [(_AssistantStream_events = /* @__PURE__ */ new WeakMap(), _AssistantStream_runStepSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_finalRun = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContentIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCallIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCall = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentEvent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunStepSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  static fromReadableStream(stream) {
    const runner = new _a();
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    for await (const event of stream) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
  static createToolAssistantStream(runId, runs, params, options) {
    const runner = new _a();
    runner._run(() => runner._runToolAssistantStream(runId, runs, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createToolAssistantStream(run, runId, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.submitToolOutputs(runId, body, {
      ...options,
      signal: this.controller.signal
    });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static createThreadAssistantStream(params, thread, options) {
    const runner = new _a();
    runner._run(() => runner._threadAssistantStream(params, thread, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  static createAssistantStream(threadId, runs, params, options) {
    const runner = new _a();
    runner._run(() => runner._runAssistantStream(threadId, runs, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  currentEvent() {
    return __classPrivateFieldGet(this, _AssistantStream_currentEvent, "f");
  }
  currentRun() {
    return __classPrivateFieldGet(this, _AssistantStream_currentRunSnapshot, "f");
  }
  currentMessageSnapshot() {
    return __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f");
  }
  currentRunStepSnapshot() {
    return __classPrivateFieldGet(this, _AssistantStream_currentRunStepSnapshot, "f");
  }
  async finalRunSteps() {
    await this.done();
    return Object.values(__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f"));
  }
  async finalMessages() {
    await this.done();
    return Object.values(__classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f"));
  }
  async finalRun() {
    await this.done();
    if (!__classPrivateFieldGet(this, _AssistantStream_finalRun, "f"))
      throw Error("Final run was not received.");
    return __classPrivateFieldGet(this, _AssistantStream_finalRun, "f");
  }
  async _createThreadAssistantStream(thread, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await thread.createAndRun(body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  async _createAssistantStream(run, threadId, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.create(threadId, body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static accumulateDelta(acc, delta) {
    for (const [key, deltaValue] of Object.entries(delta)) {
      if (!acc.hasOwnProperty(key)) {
        acc[key] = deltaValue;
        continue;
      }
      let accValue = acc[key];
      if (accValue === null || accValue === void 0) {
        acc[key] = deltaValue;
        continue;
      }
      if (key === "index" || key === "type") {
        acc[key] = deltaValue;
        continue;
      }
      if (typeof accValue === "string" && typeof deltaValue === "string") {
        accValue += deltaValue;
      } else if (typeof accValue === "number" && typeof deltaValue === "number") {
        accValue += deltaValue;
      } else if (isObj(accValue) && isObj(deltaValue)) {
        accValue = this.accumulateDelta(accValue, deltaValue);
      } else if (Array.isArray(accValue) && Array.isArray(deltaValue)) {
        if (accValue.every((x) => typeof x === "string" || typeof x === "number")) {
          accValue.push(...deltaValue);
          continue;
        }
        for (const deltaEntry of deltaValue) {
          if (!isObj(deltaEntry)) {
            throw new Error(`Expected array delta entry to be an object but got: ${deltaEntry}`);
          }
          const index = deltaEntry["index"];
          if (index == null) {
            console.error(deltaEntry);
            throw new Error("Expected array delta entry to have an `index` property");
          }
          if (typeof index !== "number") {
            throw new Error(`Expected array delta entry \`index\` property to be a number but got ${index}`);
          }
          const accEntry = accValue[index];
          if (accEntry == null) {
            accValue.push(deltaEntry);
          } else {
            accValue[index] = this.accumulateDelta(accEntry, deltaEntry);
          }
        }
        continue;
      } else {
        throw Error(`Unhandled record type: ${key}, deltaValue: ${deltaValue}, accValue: ${accValue}`);
      }
      acc[key] = accValue;
    }
    return acc;
  }
  _addRun(run) {
    return run;
  }
  async _threadAssistantStream(params, thread, options) {
    return await this._createThreadAssistantStream(thread, params, options);
  }
  async _runAssistantStream(threadId, runs, params, options) {
    return await this._createAssistantStream(runs, threadId, params, options);
  }
  async _runToolAssistantStream(runId, runs, params, options) {
    return await this._createToolAssistantStream(runs, runId, params, options);
  }
};
_a = AssistantStream, _AssistantStream_addEvent = function _AssistantStream_addEvent2(event) {
  if (this.ended)
    return;
  __classPrivateFieldSet(this, _AssistantStream_currentEvent, event, "f");
  __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleEvent).call(this, event);
  switch (event.event) {
    case "thread.created":
      break;
    case "thread.run.created":
    case "thread.run.queued":
    case "thread.run.in_progress":
    case "thread.run.requires_action":
    case "thread.run.completed":
    case "thread.run.incomplete":
    case "thread.run.failed":
    case "thread.run.cancelling":
    case "thread.run.cancelled":
    case "thread.run.expired":
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleRun).call(this, event);
      break;
    case "thread.run.step.created":
    case "thread.run.step.in_progress":
    case "thread.run.step.delta":
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleRunStep).call(this, event);
      break;
    case "thread.message.created":
    case "thread.message.in_progress":
    case "thread.message.delta":
    case "thread.message.completed":
    case "thread.message.incomplete":
      __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_handleMessage).call(this, event);
      break;
    case "error":
      throw new Error("Encountered an error event in event processing - errors should be processed earlier");
    default:
      assertNever2(event);
  }
}, _AssistantStream_endRequest = function _AssistantStream_endRequest2() {
  if (this.ended) {
    throw new OpenAIError(`stream has ended, this shouldn't happen`);
  }
  if (!__classPrivateFieldGet(this, _AssistantStream_finalRun, "f"))
    throw Error("Final run has not been received");
  return __classPrivateFieldGet(this, _AssistantStream_finalRun, "f");
}, _AssistantStream_handleMessage = function _AssistantStream_handleMessage2(event) {
  const [accumulatedMessage, newContent] = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateMessage).call(this, event, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
  __classPrivateFieldSet(this, _AssistantStream_messageSnapshot, accumulatedMessage, "f");
  __classPrivateFieldGet(this, _AssistantStream_messageSnapshots, "f")[accumulatedMessage.id] = accumulatedMessage;
  for (const content of newContent) {
    const snapshotContent = accumulatedMessage.content[content.index];
    if (snapshotContent?.type == "text") {
      this._emit("textCreated", snapshotContent.text);
    }
  }
  switch (event.event) {
    case "thread.message.created":
      this._emit("messageCreated", event.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      this._emit("messageDelta", event.data.delta, accumulatedMessage);
      if (event.data.delta.content) {
        for (const content of event.data.delta.content) {
          if (content.type == "text" && content.text) {
            let textDelta = content.text;
            let snapshot = accumulatedMessage.content[content.index];
            if (snapshot && snapshot.type == "text") {
              this._emit("textDelta", textDelta, snapshot.text);
            } else {
              throw Error("The snapshot associated with this text delta is not text or missing");
            }
          }
          if (content.index != __classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f")) {
            if (__classPrivateFieldGet(this, _AssistantStream_currentContent, "f")) {
              switch (__classPrivateFieldGet(this, _AssistantStream_currentContent, "f").type) {
                case "text":
                  this._emit("textDone", __classPrivateFieldGet(this, _AssistantStream_currentContent, "f").text, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                  break;
                case "image_file":
                  this._emit("imageFileDone", __classPrivateFieldGet(this, _AssistantStream_currentContent, "f").image_file, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
                  break;
              }
            }
            __classPrivateFieldSet(this, _AssistantStream_currentContentIndex, content.index, "f");
          }
          __classPrivateFieldSet(this, _AssistantStream_currentContent, accumulatedMessage.content[content.index], "f");
        }
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (__classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f") !== void 0) {
        const currentContent = event.data.content[__classPrivateFieldGet(this, _AssistantStream_currentContentIndex, "f")];
        if (currentContent) {
          switch (currentContent.type) {
            case "image_file":
              this._emit("imageFileDone", currentContent.image_file, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
              break;
            case "text":
              this._emit("textDone", currentContent.text, __classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f"));
              break;
          }
        }
      }
      if (__classPrivateFieldGet(this, _AssistantStream_messageSnapshot, "f")) {
        this._emit("messageDone", event.data);
      }
      __classPrivateFieldSet(this, _AssistantStream_messageSnapshot, void 0, "f");
  }
}, _AssistantStream_handleRunStep = function _AssistantStream_handleRunStep2(event) {
  const accumulatedRunStep = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateRunStep).call(this, event);
  __classPrivateFieldSet(this, _AssistantStream_currentRunStepSnapshot, accumulatedRunStep, "f");
  switch (event.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", event.data);
      break;
    case "thread.run.step.delta":
      const delta = event.data.delta;
      if (delta.step_details && delta.step_details.type == "tool_calls" && delta.step_details.tool_calls && accumulatedRunStep.step_details.type == "tool_calls") {
        for (const toolCall of delta.step_details.tool_calls) {
          if (toolCall.index == __classPrivateFieldGet(this, _AssistantStream_currentToolCallIndex, "f")) {
            this._emit("toolCallDelta", toolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
          } else {
            if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
              this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
            }
            __classPrivateFieldSet(this, _AssistantStream_currentToolCallIndex, toolCall.index, "f");
            __classPrivateFieldSet(this, _AssistantStream_currentToolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index], "f");
            if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"))
              this._emit("toolCallCreated", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
          }
        }
      }
      this._emit("runStepDelta", event.data.delta, accumulatedRunStep);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldSet(this, _AssistantStream_currentRunStepSnapshot, void 0, "f");
      const details = event.data.step_details;
      if (details.type == "tool_calls") {
        if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
          this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
          __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0, "f");
        }
      }
      this._emit("runStepDone", event.data, accumulatedRunStep);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, _AssistantStream_handleEvent = function _AssistantStream_handleEvent2(event) {
  __classPrivateFieldGet(this, _AssistantStream_events, "f").push(event);
  this._emit("event", event);
}, _AssistantStream_accumulateRunStep = function _AssistantStream_accumulateRunStep2(event) {
  switch (event.event) {
    case "thread.run.step.created":
      __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      return event.data;
    case "thread.run.step.delta":
      let snapshot = __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
      if (!snapshot) {
        throw Error("Received a RunStepDelta before creation of a snapshot");
      }
      let data = event.data;
      if (data.delta) {
        const accumulated = _a.accumulateDelta(snapshot, data.delta);
        __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = accumulated;
      }
      return __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      break;
  }
  if (__classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id])
    return __classPrivateFieldGet(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
  throw new Error("No snapshot available");
}, _AssistantStream_accumulateMessage = function _AssistantStream_accumulateMessage2(event, snapshot) {
  let newContent = [];
  switch (event.event) {
    case "thread.message.created":
      return [event.data, newContent];
    case "thread.message.delta":
      if (!snapshot) {
        throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      }
      let data = event.data;
      if (data.delta.content) {
        for (const contentElement of data.delta.content) {
          if (contentElement.index in snapshot.content) {
            let currentContent = snapshot.content[contentElement.index];
            snapshot.content[contentElement.index] = __classPrivateFieldGet(this, _AssistantStream_instances, "m", _AssistantStream_accumulateContent).call(this, contentElement, currentContent);
          } else {
            snapshot.content[contentElement.index] = contentElement;
            newContent.push(contentElement);
          }
        }
      }
      return [snapshot, newContent];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (snapshot) {
        return [snapshot, newContent];
      } else {
        throw Error("Received thread message event with no existing snapshot");
      }
  }
  throw Error("Tried to accumulate a non-message event");
}, _AssistantStream_accumulateContent = function _AssistantStream_accumulateContent2(contentElement, currentContent) {
  return _a.accumulateDelta(currentContent, contentElement);
}, _AssistantStream_handleRun = function _AssistantStream_handleRun2(event) {
  __classPrivateFieldSet(this, _AssistantStream_currentRunSnapshot, event.data, "f");
  switch (event.event) {
    case "thread.run.created":
      break;
    case "thread.run.queued":
      break;
    case "thread.run.in_progress":
      break;
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
    case "thread.run.incomplete":
      __classPrivateFieldSet(this, _AssistantStream_finalRun, event.data, "f");
      if (__classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f")) {
        this._emit("toolCallDone", __classPrivateFieldGet(this, _AssistantStream_currentToolCall, "f"));
        __classPrivateFieldSet(this, _AssistantStream_currentToolCall, void 0, "f");
      }
      break;
    case "thread.run.cancelling":
      break;
  }
};
function assertNever2(_x) {
}

// node_modules/openai/resources/beta/threads/runs/runs.mjs
var Runs = class extends APIResource {
  constructor() {
    super(...arguments);
    this.steps = new Steps(this._client);
  }
  create(threadID, params, options) {
    const { include, ...body } = params;
    return this._client.post(path`/threads/${threadID}/runs`, {
      query: { include },
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]),
      stream: params.stream ?? false
    });
  }
  /**
   * Retrieves a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(runID, params, options) {
    const { thread_id } = params;
    return this._client.get(path`/threads/${thread_id}/runs/${runID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Modifies a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(runID, params, options) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Returns a list of runs belonging to a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  list(threadID, query = {}, options) {
    return this._client.getAPIList(path`/threads/${threadID}/runs`, CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Cancels a run that is `in_progress`.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  cancel(runID, params, options) {
    const { thread_id } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}/cancel`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * A helper to create a run an poll for a terminal state. More information on Run
   * lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndPoll(threadId, body, options) {
    const run = await this.create(threadId, body, options);
    return await this.poll(run.id, { thread_id: threadId }, options);
  }
  /**
   * Create a Run stream
   *
   * @deprecated use `stream` instead
   */
  createAndStream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  /**
   * A helper to poll a run status until it reaches a terminal state. More
   * information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async poll(runId, params, options) {
    const headers = buildHeaders([
      options?.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": options?.pollIntervalMs?.toString() ?? void 0
      }
    ]);
    while (true) {
      const { data: run, response } = await this.retrieve(runId, params, {
        ...options,
        headers: { ...options?.headers, ...headers }
      }).withResponse();
      switch (run.status) {
        //If we are in any sort of intermediate state we poll
        case "queued":
        case "in_progress":
        case "cancelling":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        //We return the run in any terminal state.
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return run;
      }
    }
  }
  /**
   * Create a Run stream
   */
  stream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  submitToolOutputs(runID, params, options) {
    const { thread_id, ...body } = params;
    return this._client.post(path`/threads/${thread_id}/runs/${runID}/submit_tool_outputs`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]),
      stream: params.stream ?? false
    });
  }
  /**
   * A helper to submit a tool output to a run and poll for a terminal run state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async submitToolOutputsAndPoll(runId, params, options) {
    const run = await this.submitToolOutputs(runId, params, options);
    return await this.poll(run.id, params, options);
  }
  /**
   * Submit the tool outputs from a previous run and stream the run to a terminal
   * state. More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  submitToolOutputsStream(runId, params, options) {
    return AssistantStream.createToolAssistantStream(runId, this._client.beta.threads.runs, params, options);
  }
};
Runs.Steps = Steps;

// node_modules/openai/resources/beta/threads/threads.mjs
var Threads2 = class extends APIResource {
  constructor() {
    super(...arguments);
    this.runs = new Runs(this._client);
    this.messages = new Messages2(this._client);
  }
  /**
   * Create a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(body = {}, options) {
    return this._client.post("/threads", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Retrieves a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadID, options) {
    return this._client.get(path`/threads/${threadID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Modifies a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadID, body, options) {
    return this._client.post(path`/threads/${threadID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Delete a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  delete(threadID, options) {
    return this._client.delete(path`/threads/${threadID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  createAndRun(body, options) {
    return this._client.post("/threads/runs", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]),
      stream: body.stream ?? false
    });
  }
  /**
   * A helper to create a thread, start a run and then poll for a terminal state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndRunPoll(body, options) {
    const run = await this.createAndRun(body, options);
    return await this.runs.poll(run.id, { thread_id: run.thread_id }, options);
  }
  /**
   * Create a thread and stream the run back
   */
  createAndRunStream(body, options) {
    return AssistantStream.createThreadAssistantStream(body, this._client.beta.threads, options);
  }
};
Threads2.Runs = Runs;
Threads2.Messages = Messages2;

// node_modules/openai/resources/beta/beta.mjs
var Beta = class extends APIResource {
  constructor() {
    super(...arguments);
    this.realtime = new Realtime(this._client);
    this.chatkit = new ChatKit(this._client);
    this.assistants = new Assistants(this._client);
    this.threads = new Threads2(this._client);
  }
};
Beta.Realtime = Realtime;
Beta.ChatKit = ChatKit;
Beta.Assistants = Assistants;
Beta.Threads = Threads2;

// node_modules/openai/resources/completions.mjs
var Completions2 = class extends APIResource {
  create(body, options) {
    return this._client.post("/completions", { body, ...options, stream: body.stream ?? false });
  }
};

// node_modules/openai/resources/containers/files/content.mjs
var Content = class extends APIResource {
  /**
   * Retrieve Container File Content
   */
  retrieve(fileID, params, options) {
    const { container_id } = params;
    return this._client.get(path`/containers/${container_id}/files/${fileID}/content`, {
      ...options,
      headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
      __binaryResponse: true
    });
  }
};

// node_modules/openai/resources/containers/files/files.mjs
var Files = class extends APIResource {
  constructor() {
    super(...arguments);
    this.content = new Content(this._client);
  }
  /**
   * Create a Container File
   *
   * You can send either a multipart/form-data request with the raw file content, or
   * a JSON request with a file ID.
   */
  create(containerID, body, options) {
    return this._client.post(path`/containers/${containerID}/files`, maybeMultipartFormRequestOptions({ body, ...options }, this._client));
  }
  /**
   * Retrieve Container File
   */
  retrieve(fileID, params, options) {
    const { container_id } = params;
    return this._client.get(path`/containers/${container_id}/files/${fileID}`, options);
  }
  /**
   * List Container files
   */
  list(containerID, query = {}, options) {
    return this._client.getAPIList(path`/containers/${containerID}/files`, CursorPage, {
      query,
      ...options
    });
  }
  /**
   * Delete Container File
   */
  delete(fileID, params, options) {
    const { container_id } = params;
    return this._client.delete(path`/containers/${container_id}/files/${fileID}`, {
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
};
Files.Content = Content;

// node_modules/openai/resources/containers/containers.mjs
var Containers = class extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files(this._client);
  }
  /**
   * Create Container
   */
  create(body, options) {
    return this._client.post("/containers", { body, ...options });
  }
  /**
   * Retrieve Container
   */
  retrieve(containerID, options) {
    return this._client.get(path`/containers/${containerID}`, options);
  }
  /**
   * List Containers
   */
  list(query = {}, options) {
    return this._client.getAPIList("/containers", CursorPage, { query, ...options });
  }
  /**
   * Delete Container
   */
  delete(containerID, options) {
    return this._client.delete(path`/containers/${containerID}`, {
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
};
Containers.Files = Files;

// node_modules/openai/resources/conversations/items.mjs
var Items = class extends APIResource {
  /**
   * Create items in a conversation with the given ID.
   */
  create(conversationID, params, options) {
    const { include, ...body } = params;
    return this._client.post(path`/conversations/${conversationID}/items`, {
      query: { include },
      body,
      ...options
    });
  }
  /**
   * Get a single item from a conversation with the given IDs.
   */
  retrieve(itemID, params, options) {
    const { conversation_id, ...query } = params;
    return this._client.get(path`/conversations/${conversation_id}/items/${itemID}`, { query, ...options });
  }
  /**
   * List all items for a conversation with the given ID.
   */
  list(conversationID, query = {}, options) {
    return this._client.getAPIList(path`/conversations/${conversationID}/items`, ConversationCursorPage, { query, ...options });
  }
  /**
   * Delete an item from a conversation with the given IDs.
   */
  delete(itemID, params, options) {
    const { conversation_id } = params;
    return this._client.delete(path`/conversations/${conversation_id}/items/${itemID}`, options);
  }
};

// node_modules/openai/resources/conversations/conversations.mjs
var Conversations = class extends APIResource {
  constructor() {
    super(...arguments);
    this.items = new Items(this._client);
  }
  /**
   * Create a conversation.
   */
  create(body = {}, options) {
    return this._client.post("/conversations", { body, ...options });
  }
  /**
   * Get a conversation
   */
  retrieve(conversationID, options) {
    return this._client.get(path`/conversations/${conversationID}`, options);
  }
  /**
   * Update a conversation
   */
  update(conversationID, body, options) {
    return this._client.post(path`/conversations/${conversationID}`, { body, ...options });
  }
  /**
   * Delete a conversation. Items in the conversation will not be deleted.
   */
  delete(conversationID, options) {
    return this._client.delete(path`/conversations/${conversationID}`, options);
  }
};
Conversations.Items = Items;

// node_modules/openai/resources/embeddings.mjs
var Embeddings = class extends APIResource {
  /**
   * Creates an embedding vector representing the input text.
   *
   * @example
   * ```ts
   * const createEmbeddingResponse =
   *   await client.embeddings.create({
   *     input: 'The quick brown fox jumped over the lazy dog',
   *     model: 'text-embedding-3-small',
   *   });
   * ```
   */
  create(body, options) {
    const hasUserProvidedEncodingFormat = !!body.encoding_format;
    let encoding_format = hasUserProvidedEncodingFormat ? body.encoding_format : "base64";
    if (hasUserProvidedEncodingFormat) {
      loggerFor(this._client).debug("embeddings/user defined encoding_format:", body.encoding_format);
    }
    const response = this._client.post("/embeddings", {
      body: {
        ...body,
        encoding_format
      },
      ...options
    });
    if (hasUserProvidedEncodingFormat) {
      return response;
    }
    loggerFor(this._client).debug("embeddings/decoding base64 embeddings from base64");
    return response._thenUnwrap((response2) => {
      if (response2 && response2.data) {
        response2.data.forEach((embeddingBase64Obj) => {
          const embeddingBase64Str = embeddingBase64Obj.embedding;
          embeddingBase64Obj.embedding = toFloat32Array(embeddingBase64Str);
        });
      }
      return response2;
    });
  }
};

// node_modules/openai/resources/evals/runs/output-items.mjs
var OutputItems = class extends APIResource {
  /**
   * Get an evaluation run output item by ID.
   */
  retrieve(outputItemID, params, options) {
    const { eval_id, run_id } = params;
    return this._client.get(path`/evals/${eval_id}/runs/${run_id}/output_items/${outputItemID}`, options);
  }
  /**
   * Get a list of output items for an evaluation run.
   */
  list(runID, params, options) {
    const { eval_id, ...query } = params;
    return this._client.getAPIList(path`/evals/${eval_id}/runs/${runID}/output_items`, CursorPage, { query, ...options });
  }
};

// node_modules/openai/resources/evals/runs/runs.mjs
var Runs2 = class extends APIResource {
  constructor() {
    super(...arguments);
    this.outputItems = new OutputItems(this._client);
  }
  /**
   * Kicks off a new run for a given evaluation, specifying the data source, and what
   * model configuration to use to test. The datasource will be validated against the
   * schema specified in the config of the evaluation.
   */
  create(evalID, body, options) {
    return this._client.post(path`/evals/${evalID}/runs`, { body, ...options });
  }
  /**
   * Get an evaluation run by ID.
   */
  retrieve(runID, params, options) {
    const { eval_id } = params;
    return this._client.get(path`/evals/${eval_id}/runs/${runID}`, options);
  }
  /**
   * Get a list of runs for an evaluation.
   */
  list(evalID, query = {}, options) {
    return this._client.getAPIList(path`/evals/${evalID}/runs`, CursorPage, {
      query,
      ...options
    });
  }
  /**
   * Delete an eval run.
   */
  delete(runID, params, options) {
    const { eval_id } = params;
    return this._client.delete(path`/evals/${eval_id}/runs/${runID}`, options);
  }
  /**
   * Cancel an ongoing evaluation run.
   */
  cancel(runID, params, options) {
    const { eval_id } = params;
    return this._client.post(path`/evals/${eval_id}/runs/${runID}`, options);
  }
};
Runs2.OutputItems = OutputItems;

// node_modules/openai/resources/evals/evals.mjs
var Evals = class extends APIResource {
  constructor() {
    super(...arguments);
    this.runs = new Runs2(this._client);
  }
  /**
   * Create the structure of an evaluation that can be used to test a model's
   * performance. An evaluation is a set of testing criteria and the config for a
   * data source, which dictates the schema of the data used in the evaluation. After
   * creating an evaluation, you can run it on different models and model parameters.
   * We support several types of graders and datasources. For more information, see
   * the [Evals guide](https://platform.openai.com/docs/guides/evals).
   */
  create(body, options) {
    return this._client.post("/evals", { body, ...options });
  }
  /**
   * Get an evaluation by ID.
   */
  retrieve(evalID, options) {
    return this._client.get(path`/evals/${evalID}`, options);
  }
  /**
   * Update certain properties of an evaluation.
   */
  update(evalID, body, options) {
    return this._client.post(path`/evals/${evalID}`, { body, ...options });
  }
  /**
   * List evaluations for a project.
   */
  list(query = {}, options) {
    return this._client.getAPIList("/evals", CursorPage, { query, ...options });
  }
  /**
   * Delete an evaluation.
   */
  delete(evalID, options) {
    return this._client.delete(path`/evals/${evalID}`, options);
  }
};
Evals.Runs = Runs2;

// node_modules/openai/resources/files.mjs
var Files2 = class extends APIResource {
  /**
   * Upload a file that can be used across various endpoints. Individual files can be
   * up to 512 MB, and each project can store up to 2.5 TB of files in total. There
   * is no organization-wide storage limit.
   *
   * - The Assistants API supports files up to 2 million tokens and of specific file
   *   types. See the
   *   [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools)
   *   for details.
   * - The Fine-tuning API only supports `.jsonl` files. The input also has certain
   *   required formats for fine-tuning
   *   [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input)
   *   or
   *   [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
   *   models.
   * - The Batch API only supports `.jsonl` files up to 200 MB in size. The input
   *   also has a specific required
   *   [format](https://platform.openai.com/docs/api-reference/batch/request-input).
   *
   * Please [contact us](https://help.openai.com/) if you need to increase these
   * storage limits.
   */
  create(body, options) {
    return this._client.post("/files", multipartFormRequestOptions({ body, ...options }, this._client));
  }
  /**
   * Returns information about a specific file.
   */
  retrieve(fileID, options) {
    return this._client.get(path`/files/${fileID}`, options);
  }
  /**
   * Returns a list of files.
   */
  list(query = {}, options) {
    return this._client.getAPIList("/files", CursorPage, { query, ...options });
  }
  /**
   * Delete a file and remove it from all vector stores.
   */
  delete(fileID, options) {
    return this._client.delete(path`/files/${fileID}`, options);
  }
  /**
   * Returns the contents of the specified file.
   */
  content(fileID, options) {
    return this._client.get(path`/files/${fileID}/content`, {
      ...options,
      headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
      __binaryResponse: true
    });
  }
  /**
   * Waits for the given file to be processed, default timeout is 30 mins.
   */
  async waitForProcessing(id, { pollInterval = 5e3, maxWait = 30 * 60 * 1e3 } = {}) {
    const TERMINAL_STATES = /* @__PURE__ */ new Set(["processed", "error", "deleted"]);
    const start = Date.now();
    let file = await this.retrieve(id);
    while (!file.status || !TERMINAL_STATES.has(file.status)) {
      await sleep(pollInterval);
      file = await this.retrieve(id);
      if (Date.now() - start > maxWait) {
        throw new APIConnectionTimeoutError({
          message: `Giving up on waiting for file ${id} to finish processing after ${maxWait} milliseconds.`
        });
      }
    }
    return file;
  }
};

// node_modules/openai/resources/fine-tuning/methods.mjs
var Methods = class extends APIResource {
};

// node_modules/openai/resources/fine-tuning/alpha/graders.mjs
var Graders = class extends APIResource {
  /**
   * Run a grader.
   *
   * @example
   * ```ts
   * const response = await client.fineTuning.alpha.graders.run({
   *   grader: {
   *     input: 'input',
   *     name: 'name',
   *     operation: 'eq',
   *     reference: 'reference',
   *     type: 'string_check',
   *   },
   *   model_sample: 'model_sample',
   * });
   * ```
   */
  run(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/run", { body, ...options });
  }
  /**
   * Validate a grader.
   *
   * @example
   * ```ts
   * const response =
   *   await client.fineTuning.alpha.graders.validate({
   *     grader: {
   *       input: 'input',
   *       name: 'name',
   *       operation: 'eq',
   *       reference: 'reference',
   *       type: 'string_check',
   *     },
   *   });
   * ```
   */
  validate(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/validate", { body, ...options });
  }
};

// node_modules/openai/resources/fine-tuning/alpha/alpha.mjs
var Alpha = class extends APIResource {
  constructor() {
    super(...arguments);
    this.graders = new Graders(this._client);
  }
};
Alpha.Graders = Graders;

// node_modules/openai/resources/fine-tuning/checkpoints/permissions.mjs
var Permissions = class extends APIResource {
  /**
   * **NOTE:** Calling this endpoint requires an [admin API key](../admin-api-keys).
   *
   * This enables organization owners to share fine-tuned models with other projects
   * in their organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const permissionCreateResponse of client.fineTuning.checkpoints.permissions.create(
   *   'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *   { project_ids: ['string'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  create(fineTunedModelCheckpoint, body, options) {
    return this._client.getAPIList(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, Page, { body, method: "post", ...options });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to view all permissions for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.retrieve(
   *     'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   *   );
   * ```
   */
  retrieve(fineTunedModelCheckpoint, query = {}, options) {
    return this._client.get(path`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, {
      query,
      ...options
    });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to delete a permission for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.delete(
   *     'cp_zc4Q7MP6XxulcVzj4MZdwsAB',
   *     {
   *       fine_tuned_model_checkpoint:
   *         'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *     },
   *   );
   * ```
   */
  delete(permissionID, params, options) {
    const { fine_tuned_model_checkpoint } = params;
    return this._client.delete(path`/fine_tuning/checkpoints/${fine_tuned_model_checkpoint}/permissions/${permissionID}`, options);
  }
};

// node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.mjs
var Checkpoints = class extends APIResource {
  constructor() {
    super(...arguments);
    this.permissions = new Permissions(this._client);
  }
};
Checkpoints.Permissions = Permissions;

// node_modules/openai/resources/fine-tuning/jobs/checkpoints.mjs
var Checkpoints2 = class extends APIResource {
  /**
   * List checkpoints for a fine-tuning job.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJobCheckpoint of client.fineTuning.jobs.checkpoints.list(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(fineTuningJobID, query = {}, options) {
    return this._client.getAPIList(path`/fine_tuning/jobs/${fineTuningJobID}/checkpoints`, CursorPage, { query, ...options });
  }
};

// node_modules/openai/resources/fine-tuning/jobs/jobs.mjs
var Jobs = class extends APIResource {
  constructor() {
    super(...arguments);
    this.checkpoints = new Checkpoints2(this._client);
  }
  /**
   * Creates a fine-tuning job which begins the process of creating a new model from
   * a given dataset.
   *
   * Response includes details of the enqueued job including job status and the name
   * of the fine-tuned models once complete.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/model-optimization)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.create({
   *   model: 'gpt-4o-mini',
   *   training_file: 'file-abc123',
   * });
   * ```
   */
  create(body, options) {
    return this._client.post("/fine_tuning/jobs", { body, ...options });
  }
  /**
   * Get info about a fine-tuning job.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/model-optimization)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.retrieve(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  retrieve(fineTuningJobID, options) {
    return this._client.get(path`/fine_tuning/jobs/${fineTuningJobID}`, options);
  }
  /**
   * List your organization's fine-tuning jobs
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJob of client.fineTuning.jobs.list()) {
   *   // ...
   * }
   * ```
   */
  list(query = {}, options) {
    return this._client.getAPIList("/fine_tuning/jobs", CursorPage, { query, ...options });
  }
  /**
   * Immediately cancel a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.cancel(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  cancel(fineTuningJobID, options) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/cancel`, options);
  }
  /**
   * Get status updates for a fine-tuning job.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const fineTuningJobEvent of client.fineTuning.jobs.listEvents(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * )) {
   *   // ...
   * }
   * ```
   */
  listEvents(fineTuningJobID, query = {}, options) {
    return this._client.getAPIList(path`/fine_tuning/jobs/${fineTuningJobID}/events`, CursorPage, { query, ...options });
  }
  /**
   * Pause a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.pause(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  pause(fineTuningJobID, options) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/pause`, options);
  }
  /**
   * Resume a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.resume(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  resume(fineTuningJobID, options) {
    return this._client.post(path`/fine_tuning/jobs/${fineTuningJobID}/resume`, options);
  }
};
Jobs.Checkpoints = Checkpoints2;

// node_modules/openai/resources/fine-tuning/fine-tuning.mjs
var FineTuning = class extends APIResource {
  constructor() {
    super(...arguments);
    this.methods = new Methods(this._client);
    this.jobs = new Jobs(this._client);
    this.checkpoints = new Checkpoints(this._client);
    this.alpha = new Alpha(this._client);
  }
};
FineTuning.Methods = Methods;
FineTuning.Jobs = Jobs;
FineTuning.Checkpoints = Checkpoints;
FineTuning.Alpha = Alpha;

// node_modules/openai/resources/graders/grader-models.mjs
var GraderModels = class extends APIResource {
};

// node_modules/openai/resources/graders/graders.mjs
var Graders2 = class extends APIResource {
  constructor() {
    super(...arguments);
    this.graderModels = new GraderModels(this._client);
  }
};
Graders2.GraderModels = GraderModels;

// node_modules/openai/resources/images.mjs
var Images = class extends APIResource {
  /**
   * Creates a variation of a given image. This endpoint only supports `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.createVariation({
   *   image: fs.createReadStream('otter.png'),
   * });
   * ```
   */
  createVariation(body, options) {
    return this._client.post("/images/variations", multipartFormRequestOptions({ body, ...options }, this._client));
  }
  edit(body, options) {
    return this._client.post("/images/edits", multipartFormRequestOptions({ body, ...options, stream: body.stream ?? false }, this._client));
  }
  generate(body, options) {
    return this._client.post("/images/generations", { body, ...options, stream: body.stream ?? false });
  }
};

// node_modules/openai/resources/models.mjs
var Models = class extends APIResource {
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  retrieve(model, options) {
    return this._client.get(path`/models/${model}`, options);
  }
  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(options) {
    return this._client.getAPIList("/models", Page, options);
  }
  /**
   * Delete a fine-tuned model. You must have the Owner role in your organization to
   * delete a model.
   */
  delete(model, options) {
    return this._client.delete(path`/models/${model}`, options);
  }
};

// node_modules/openai/resources/moderations.mjs
var Moderations = class extends APIResource {
  /**
   * Classifies if text and/or image inputs are potentially harmful. Learn more in
   * the [moderation guide](https://platform.openai.com/docs/guides/moderation).
   */
  create(body, options) {
    return this._client.post("/moderations", { body, ...options });
  }
};

// node_modules/openai/resources/realtime/calls.mjs
var Calls = class extends APIResource {
  /**
   * Accept an incoming SIP call and configure the realtime session that will handle
   * it.
   *
   * @example
   * ```ts
   * await client.realtime.calls.accept('call_id', {
   *   type: 'realtime',
   * });
   * ```
   */
  accept(callID, body, options) {
    return this._client.post(path`/realtime/calls/${callID}/accept`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
  /**
   * End an active Realtime API call, whether it was initiated over SIP or WebRTC.
   *
   * @example
   * ```ts
   * await client.realtime.calls.hangup('call_id');
   * ```
   */
  hangup(callID, options) {
    return this._client.post(path`/realtime/calls/${callID}/hangup`, {
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
  /**
   * Transfer an active SIP call to a new destination using the SIP REFER verb.
   *
   * @example
   * ```ts
   * await client.realtime.calls.refer('call_id', {
   *   target_uri: 'tel:+14155550123',
   * });
   * ```
   */
  refer(callID, body, options) {
    return this._client.post(path`/realtime/calls/${callID}/refer`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
  /**
   * Decline an incoming SIP call by returning a SIP status code to the caller.
   *
   * @example
   * ```ts
   * await client.realtime.calls.reject('call_id');
   * ```
   */
  reject(callID, body = {}, options) {
    return this._client.post(path`/realtime/calls/${callID}/reject`, {
      body,
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
};

// node_modules/openai/resources/realtime/client-secrets.mjs
var ClientSecrets = class extends APIResource {
  /**
   * Create a Realtime client secret with an associated session configuration.
   *
   * @example
   * ```ts
   * const clientSecret =
   *   await client.realtime.clientSecrets.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/client_secrets", { body, ...options });
  }
};

// node_modules/openai/resources/realtime/realtime.mjs
var Realtime2 = class extends APIResource {
  constructor() {
    super(...arguments);
    this.clientSecrets = new ClientSecrets(this._client);
    this.calls = new Calls(this._client);
  }
};
Realtime2.ClientSecrets = ClientSecrets;
Realtime2.Calls = Calls;

// node_modules/openai/lib/ResponsesParser.mjs
function maybeParseResponse(response, params) {
  if (!params || !hasAutoParseableInput2(params)) {
    return {
      ...response,
      output_parsed: null,
      output: response.output.map((item) => {
        if (item.type === "function_call") {
          return {
            ...item,
            parsed_arguments: null
          };
        }
        if (item.type === "message") {
          return {
            ...item,
            content: item.content.map((content) => ({
              ...content,
              parsed: null
            }))
          };
        } else {
          return item;
        }
      })
    };
  }
  return parseResponse(response, params);
}
function parseResponse(response, params) {
  const output = response.output.map((item) => {
    if (item.type === "function_call") {
      return {
        ...item,
        parsed_arguments: parseToolCall2(params, item)
      };
    }
    if (item.type === "message") {
      const content = item.content.map((content2) => {
        if (content2.type === "output_text") {
          return {
            ...content2,
            parsed: parseTextFormat(params, content2.text)
          };
        }
        return content2;
      });
      return {
        ...item,
        content
      };
    }
    return item;
  });
  const parsed = Object.assign({}, response, { output });
  if (!Object.getOwnPropertyDescriptor(response, "output_text")) {
    addOutputText(parsed);
  }
  Object.defineProperty(parsed, "output_parsed", {
    enumerable: true,
    get() {
      for (const output2 of parsed.output) {
        if (output2.type !== "message") {
          continue;
        }
        for (const content of output2.content) {
          if (content.type === "output_text" && content.parsed !== null) {
            return content.parsed;
          }
        }
      }
      return null;
    }
  });
  return parsed;
}
function parseTextFormat(params, content) {
  if (params.text?.format?.type !== "json_schema") {
    return null;
  }
  if ("$parseRaw" in params.text?.format) {
    const text_format = params.text?.format;
    return text_format.$parseRaw(content);
  }
  return JSON.parse(content);
}
function hasAutoParseableInput2(params) {
  if (isAutoParsableResponseFormat(params.text?.format)) {
    return true;
  }
  return false;
}
function isAutoParsableTool2(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
function getInputToolByName(input_tools, name) {
  return input_tools.find((tool) => tool.type === "function" && tool.name === name);
}
function parseToolCall2(params, toolCall) {
  const inputTool = getInputToolByName(params.tools ?? [], toolCall.name);
  return {
    ...toolCall,
    ...toolCall,
    parsed_arguments: isAutoParsableTool2(inputTool) ? inputTool.$parseRaw(toolCall.arguments) : inputTool?.strict ? JSON.parse(toolCall.arguments) : null
  };
}
function addOutputText(rsp) {
  const texts = [];
  for (const output of rsp.output) {
    if (output.type !== "message") {
      continue;
    }
    for (const content of output.content) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }
  rsp.output_text = texts.join("");
}

// node_modules/openai/lib/responses/ResponseStream.mjs
var _ResponseStream_instances;
var _ResponseStream_params;
var _ResponseStream_currentResponseSnapshot;
var _ResponseStream_finalResponse;
var _ResponseStream_beginRequest;
var _ResponseStream_addEvent;
var _ResponseStream_endRequest;
var _ResponseStream_accumulateResponse;
var ResponseStream = class _ResponseStream extends EventStream {
  constructor(params) {
    super();
    _ResponseStream_instances.add(this);
    _ResponseStream_params.set(this, void 0);
    _ResponseStream_currentResponseSnapshot.set(this, void 0);
    _ResponseStream_finalResponse.set(this, void 0);
    __classPrivateFieldSet(this, _ResponseStream_params, params, "f");
  }
  static createResponse(client, params, options) {
    const runner = new _ResponseStream(params);
    runner._run(() => runner._createOrRetrieveResponse(client, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createOrRetrieveResponse(client, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
    let stream;
    let starting_after = null;
    if ("response_id" in params) {
      stream = await client.responses.retrieve(params.response_id, { stream: true }, { ...options, signal: this.controller.signal, stream: true });
      starting_after = params.starting_after ?? null;
    } else {
      stream = await client.responses.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    }
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
  }
  [(_ResponseStream_params = /* @__PURE__ */ new WeakMap(), _ResponseStream_currentResponseSnapshot = /* @__PURE__ */ new WeakMap(), _ResponseStream_finalResponse = /* @__PURE__ */ new WeakMap(), _ResponseStream_instances = /* @__PURE__ */ new WeakSet(), _ResponseStream_beginRequest = function _ResponseStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
  }, _ResponseStream_addEvent = function _ResponseStream_addEvent2(event, starting_after) {
    if (this.ended)
      return;
    const maybeEmit = (name, event2) => {
      if (starting_after == null || event2.sequence_number > starting_after) {
        this._emit(name, event2);
      }
    };
    const response = __classPrivateFieldGet(this, _ResponseStream_instances, "m", _ResponseStream_accumulateResponse).call(this, event);
    maybeEmit("event", event);
    switch (event.type) {
      case "response.output_text.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          maybeEmit("response.output_text.delta", {
            ...event,
            snapshot: content.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          maybeEmit("response.function_call_arguments.delta", {
            ...event,
            snapshot: output.arguments
          });
        }
        break;
      }
      default:
        maybeEmit(event.type, event);
        break;
    }
  }, _ResponseStream_endRequest = function _ResponseStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any events`);
    }
    __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
    const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet(this, _ResponseStream_params, "f"));
    __classPrivateFieldSet(this, _ResponseStream_finalResponse, parsedResponse, "f");
    return parsedResponse;
  }, _ResponseStream_accumulateResponse = function _ResponseStream_accumulateResponse2(event) {
    let snapshot = __classPrivateFieldGet(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      if (event.type !== "response.created") {
        throw new OpenAIError(`When snapshot hasn't been set yet, expected 'response.created' event, got ${event.type}`);
      }
      snapshot = __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
      return snapshot;
    }
    switch (event.type) {
      case "response.output_item.added": {
        snapshot.output.push(event.item);
        break;
      }
      case "response.content_part.added": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        const type = output.type;
        const part = event.part;
        if (type === "message" && part.type !== "reasoning_text") {
          output.content.push(part);
        } else if (type === "reasoning" && part.type === "reasoning_text") {
          if (!output.content) {
            output.content = [];
          }
          output.content.push(part);
        }
        break;
      }
      case "response.output_text.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          content.text += event.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          output.arguments += event.delta;
        }
        break;
      }
      case "response.reasoning_text.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "reasoning") {
          const content = output.content?.[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "reasoning_text") {
            throw new OpenAIError(`expected content to be 'reasoning_text', got ${content.type}`);
          }
          content.text += event.delta;
        }
        break;
      }
      case "response.completed": {
        __classPrivateFieldSet(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
        break;
      }
    }
    return snapshot;
  }, Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((event2) => event2 ? { value: event2, done: false } : { value: void 0, done: true });
        }
        const event = pushQueue.shift();
        return { value: event, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  /**
   * @returns a promise that resolves with the final Response, or rejects
   * if an error occurred or the stream ended prematurely without producing a REsponse.
   */
  async finalResponse() {
    await this.done();
    const response = __classPrivateFieldGet(this, _ResponseStream_finalResponse, "f");
    if (!response)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return response;
  }
};
function finalizeResponse(snapshot, params) {
  return maybeParseResponse(snapshot, params);
}

// node_modules/openai/resources/responses/input-items.mjs
var InputItems = class extends APIResource {
  /**
   * Returns a list of input items for a given response.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const responseItem of client.responses.inputItems.list(
   *   'response_id',
   * )) {
   *   // ...
   * }
   * ```
   */
  list(responseID, query = {}, options) {
    return this._client.getAPIList(path`/responses/${responseID}/input_items`, CursorPage, { query, ...options });
  }
};

// node_modules/openai/resources/responses/input-tokens.mjs
var InputTokens = class extends APIResource {
  /**
   * Get input token counts
   *
   * @example
   * ```ts
   * const response = await client.responses.inputTokens.count();
   * ```
   */
  count(body = {}, options) {
    return this._client.post("/responses/input_tokens", { body, ...options });
  }
};

// node_modules/openai/resources/responses/responses.mjs
var Responses = class extends APIResource {
  constructor() {
    super(...arguments);
    this.inputItems = new InputItems(this._client);
    this.inputTokens = new InputTokens(this._client);
  }
  create(body, options) {
    return this._client.post("/responses", { body, ...options, stream: body.stream ?? false })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
  }
  retrieve(responseID, query = {}, options) {
    return this._client.get(path`/responses/${responseID}`, {
      query,
      ...options,
      stream: query?.stream ?? false
    })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
  }
  /**
   * Deletes a model response with the given ID.
   *
   * @example
   * ```ts
   * await client.responses.delete(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  delete(responseID, options) {
    return this._client.delete(path`/responses/${responseID}`, {
      ...options,
      headers: buildHeaders([{ Accept: "*/*" }, options?.headers])
    });
  }
  parse(body, options) {
    return this._client.responses.create(body, options)._thenUnwrap((response) => parseResponse(response, body));
  }
  /**
   * Creates a model response stream
   */
  stream(body, options) {
    return ResponseStream.createResponse(this._client, body, options);
  }
  /**
   * Cancels a model response with the given ID. Only responses created with the
   * `background` parameter set to `true` can be cancelled.
   * [Learn more](https://platform.openai.com/docs/guides/background).
   *
   * @example
   * ```ts
   * const response = await client.responses.cancel(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  cancel(responseID, options) {
    return this._client.post(path`/responses/${responseID}/cancel`, options);
  }
  /**
   * Compact conversation
   *
   * @example
   * ```ts
   * const compactedResponse = await client.responses.compact({
   *   model: 'gpt-5.2',
   * });
   * ```
   */
  compact(body, options) {
    return this._client.post("/responses/compact", { body, ...options });
  }
};
Responses.InputItems = InputItems;
Responses.InputTokens = InputTokens;

// node_modules/openai/resources/skills/content.mjs
var Content2 = class extends APIResource {
  /**
   * Get Skill Content
   */
  retrieve(skillID, options) {
    return this._client.get(path`/skills/${skillID}/content`, {
      ...options,
      headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
      __binaryResponse: true
    });
  }
};

// node_modules/openai/resources/skills/versions/content.mjs
var Content3 = class extends APIResource {
  /**
   * Get Skill Version Content
   */
  retrieve(version, params, options) {
    const { skill_id } = params;
    return this._client.get(path`/skills/${skill_id}/versions/${version}/content`, {
      ...options,
      headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
      __binaryResponse: true
    });
  }
};

// node_modules/openai/resources/skills/versions/versions.mjs
var Versions = class extends APIResource {
  constructor() {
    super(...arguments);
    this.content = new Content3(this._client);
  }
  /**
   * Create Skill Version
   */
  create(skillID, body = {}, options) {
    return this._client.post(path`/skills/${skillID}/versions`, maybeMultipartFormRequestOptions({ body, ...options }, this._client));
  }
  /**
   * Get Skill Version
   */
  retrieve(version, params, options) {
    const { skill_id } = params;
    return this._client.get(path`/skills/${skill_id}/versions/${version}`, options);
  }
  /**
   * List Skill Versions
   */
  list(skillID, query = {}, options) {
    return this._client.getAPIList(path`/skills/${skillID}/versions`, CursorPage, {
      query,
      ...options
    });
  }
  /**
   * Delete Skill Version
   */
  delete(version, params, options) {
    const { skill_id } = params;
    return this._client.delete(path`/skills/${skill_id}/versions/${version}`, options);
  }
};
Versions.Content = Content3;

// node_modules/openai/resources/skills/skills.mjs
var Skills = class extends APIResource {
  constructor() {
    super(...arguments);
    this.content = new Content2(this._client);
    this.versions = new Versions(this._client);
  }
  /**
   * Create Skill
   */
  create(body = {}, options) {
    return this._client.post("/skills", maybeMultipartFormRequestOptions({ body, ...options }, this._client));
  }
  /**
   * Get Skill
   */
  retrieve(skillID, options) {
    return this._client.get(path`/skills/${skillID}`, options);
  }
  /**
   * Update Skill Default Version
   */
  update(skillID, body, options) {
    return this._client.post(path`/skills/${skillID}`, { body, ...options });
  }
  /**
   * List Skills
   */
  list(query = {}, options) {
    return this._client.getAPIList("/skills", CursorPage, { query, ...options });
  }
  /**
   * Delete Skill
   */
  delete(skillID, options) {
    return this._client.delete(path`/skills/${skillID}`, options);
  }
};
Skills.Content = Content2;
Skills.Versions = Versions;

// node_modules/openai/resources/uploads/parts.mjs
var Parts = class extends APIResource {
  /**
   * Adds a
   * [Part](https://platform.openai.com/docs/api-reference/uploads/part-object) to an
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object.
   * A Part represents a chunk of bytes from the file you are trying to upload.
   *
   * Each Part can be at most 64 MB, and you can add Parts until you hit the Upload
   * maximum of 8 GB.
   *
   * It is possible to add multiple Parts in parallel. You can decide the intended
   * order of the Parts when you
   * [complete the Upload](https://platform.openai.com/docs/api-reference/uploads/complete).
   */
  create(uploadID, body, options) {
    return this._client.post(path`/uploads/${uploadID}/parts`, multipartFormRequestOptions({ body, ...options }, this._client));
  }
};

// node_modules/openai/resources/uploads/uploads.mjs
var Uploads = class extends APIResource {
  constructor() {
    super(...arguments);
    this.parts = new Parts(this._client);
  }
  /**
   * Creates an intermediate
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
   * that you can add
   * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
   * Currently, an Upload can accept at most 8 GB in total and expires after an hour
   * after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
   */
  create(body, options) {
    return this._client.post("/uploads", { body, ...options });
  }
  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(uploadID, options) {
    return this._client.post(path`/uploads/${uploadID}/cancel`, options);
  }
  /**
   * Completes the
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed.
   */
  complete(uploadID, body, options) {
    return this._client.post(path`/uploads/${uploadID}/complete`, { body, ...options });
  }
};
Uploads.Parts = Parts;

// node_modules/openai/lib/Util.mjs
var allSettledWithThrow = async (promises) => {
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === "rejected");
  if (rejected.length) {
    for (const result of rejected) {
      console.error(result.reason);
    }
    throw new Error(`${rejected.length} promise(s) failed - see the above errors`);
  }
  const values = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      values.push(result.value);
    }
  }
  return values;
};

// node_modules/openai/resources/vector-stores/file-batches.mjs
var FileBatches = class extends APIResource {
  /**
   * Create a vector store file batch.
   */
  create(vectorStoreID, body, options) {
    return this._client.post(path`/vector_stores/${vectorStoreID}/file_batches`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Retrieves a vector store file batch.
   */
  retrieve(batchID, params, options) {
    const { vector_store_id } = params;
    return this._client.get(path`/vector_stores/${vector_store_id}/file_batches/${batchID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(batchID, params, options) {
    const { vector_store_id } = params;
    return this._client.post(path`/vector_stores/${vector_store_id}/file_batches/${batchID}/cancel`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const batch = await this.create(vectorStoreId, body);
    return await this.poll(vectorStoreId, batch.id, options);
  }
  /**
   * Returns a list of vector store files in a batch.
   */
  listFiles(batchID, params, options) {
    const { vector_store_id, ...query } = params;
    return this._client.getAPIList(path`/vector_stores/${vector_store_id}/file_batches/${batchID}/files`, CursorPage, { query, ...options, headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]) });
  }
  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(vectorStoreID, batchID, options) {
    const headers = buildHeaders([
      options?.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": options?.pollIntervalMs?.toString() ?? void 0
      }
    ]);
    while (true) {
      const { data: batch, response } = await this.retrieve(batchID, { vector_store_id: vectorStoreID }, {
        ...options,
        headers
      }).withResponse();
      switch (batch.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return batch;
      }
    }
  }
  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(vectorStoreId, { files, fileIds = [] }, options) {
    if (files == null || files.length == 0) {
      throw new Error(`No \`files\` provided to process. If you've already uploaded files you should use \`.createAndPoll()\` instead`);
    }
    const configuredConcurrency = options?.maxConcurrency ?? 5;
    const concurrencyLimit = Math.min(configuredConcurrency, files.length);
    const client = this._client;
    const fileIterator = files.values();
    const allFileIds = [...fileIds];
    async function processFiles(iterator) {
      for (let item of iterator) {
        const fileObj = await client.files.create({ file: item, purpose: "assistants" }, options);
        allFileIds.push(fileObj.id);
      }
    }
    const workers = Array(concurrencyLimit).fill(fileIterator).map(processFiles);
    await allSettledWithThrow(workers);
    return await this.createAndPoll(vectorStoreId, {
      file_ids: allFileIds
    });
  }
};

// node_modules/openai/resources/vector-stores/files.mjs
var Files3 = class extends APIResource {
  /**
   * Create a vector store file by attaching a
   * [File](https://platform.openai.com/docs/api-reference/files) to a
   * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
   */
  create(vectorStoreID, body, options) {
    return this._client.post(path`/vector_stores/${vectorStoreID}/files`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Retrieves a vector store file.
   */
  retrieve(fileID, params, options) {
    const { vector_store_id } = params;
    return this._client.get(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Update attributes on a vector store file.
   */
  update(fileID, params, options) {
    const { vector_store_id, ...body } = params;
    return this._client.post(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Returns a list of vector store files.
   */
  list(vectorStoreID, query = {}, options) {
    return this._client.getAPIList(path`/vector_stores/${vectorStoreID}/files`, CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Delete a vector store file. This will remove the file from the vector store but
   * the file itself will not be deleted. To delete the file, use the
   * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
   * endpoint.
   */
  delete(fileID, params, options) {
    const { vector_store_id } = params;
    return this._client.delete(path`/vector_stores/${vector_store_id}/files/${fileID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Attach a file to the given vector store and wait for it to be processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const file = await this.create(vectorStoreId, body, options);
    return await this.poll(vectorStoreId, file.id, options);
  }
  /**
   * Wait for the vector store file to finish processing.
   *
   * Note: this will return even if the file failed to process, you need to check
   * file.last_error and file.status to handle these cases
   */
  async poll(vectorStoreID, fileID, options) {
    const headers = buildHeaders([
      options?.headers,
      {
        "X-Stainless-Poll-Helper": "true",
        "X-Stainless-Custom-Poll-Interval": options?.pollIntervalMs?.toString() ?? void 0
      }
    ]);
    while (true) {
      const fileResponse = await this.retrieve(fileID, {
        vector_store_id: vectorStoreID
      }, { ...options, headers }).withResponse();
      const file = fileResponse.data;
      switch (file.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = fileResponse.response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "completed":
          return file;
      }
    }
  }
  /**
   * Upload a file to the `files` API and then attach it to the given vector store.
   *
   * Note the file will be asynchronously processed (you can use the alternative
   * polling helper method to wait for processing to complete).
   */
  async upload(vectorStoreId, file, options) {
    const fileInfo = await this._client.files.create({ file, purpose: "assistants" }, options);
    return this.create(vectorStoreId, { file_id: fileInfo.id }, options);
  }
  /**
   * Add a file to a vector store and poll until processing is complete.
   */
  async uploadAndPoll(vectorStoreId, file, options) {
    const fileInfo = await this.upload(vectorStoreId, file, options);
    return await this.poll(vectorStoreId, fileInfo.id, options);
  }
  /**
   * Retrieve the parsed contents of a vector store file.
   */
  content(fileID, params, options) {
    const { vector_store_id } = params;
    return this._client.getAPIList(path`/vector_stores/${vector_store_id}/files/${fileID}/content`, Page, { ...options, headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers]) });
  }
};

// node_modules/openai/resources/vector-stores/vector-stores.mjs
var VectorStores = class extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files3(this._client);
    this.fileBatches = new FileBatches(this._client);
  }
  /**
   * Create a vector store.
   */
  create(body, options) {
    return this._client.post("/vector_stores", {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Retrieves a vector store.
   */
  retrieve(vectorStoreID, options) {
    return this._client.get(path`/vector_stores/${vectorStoreID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Modifies a vector store.
   */
  update(vectorStoreID, body, options) {
    return this._client.post(path`/vector_stores/${vectorStoreID}`, {
      body,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Returns a list of vector stores.
   */
  list(query = {}, options) {
    return this._client.getAPIList("/vector_stores", CursorPage, {
      query,
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Delete a vector store.
   */
  delete(vectorStoreID, options) {
    return this._client.delete(path`/vector_stores/${vectorStoreID}`, {
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
  /**
   * Search a vector store for relevant chunks based on a query and file attributes
   * filter.
   */
  search(vectorStoreID, body, options) {
    return this._client.getAPIList(path`/vector_stores/${vectorStoreID}/search`, Page, {
      body,
      method: "post",
      ...options,
      headers: buildHeaders([{ "OpenAI-Beta": "assistants=v2" }, options?.headers])
    });
  }
};
VectorStores.Files = Files3;
VectorStores.FileBatches = FileBatches;

// node_modules/openai/resources/videos.mjs
var Videos = class extends APIResource {
  /**
   * Create a video
   */
  create(body, options) {
    return this._client.post("/videos", maybeMultipartFormRequestOptions({ body, ...options }, this._client));
  }
  /**
   * Retrieve a video
   */
  retrieve(videoID, options) {
    return this._client.get(path`/videos/${videoID}`, options);
  }
  /**
   * List videos
   */
  list(query = {}, options) {
    return this._client.getAPIList("/videos", ConversationCursorPage, { query, ...options });
  }
  /**
   * Delete a video
   */
  delete(videoID, options) {
    return this._client.delete(path`/videos/${videoID}`, options);
  }
  /**
   * Download video content
   */
  downloadContent(videoID, query = {}, options) {
    return this._client.get(path`/videos/${videoID}/content`, {
      query,
      ...options,
      headers: buildHeaders([{ Accept: "application/binary" }, options?.headers]),
      __binaryResponse: true
    });
  }
  /**
   * Create a video remix
   */
  remix(videoID, body, options) {
    return this._client.post(path`/videos/${videoID}/remix`, maybeMultipartFormRequestOptions({ body, ...options }, this._client));
  }
};

// node_modules/openai/resources/webhooks/webhooks.mjs
var _Webhooks_instances;
var _Webhooks_validateSecret;
var _Webhooks_getRequiredHeader;
var Webhooks = class extends APIResource {
  constructor() {
    super(...arguments);
    _Webhooks_instances.add(this);
  }
  /**
   * Validates that the given payload was sent by OpenAI and parses the payload.
   */
  async unwrap(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
    await this.verifySignature(payload, headers, secret, tolerance);
    return JSON.parse(payload);
  }
  /**
   * Validates whether or not the webhook payload was sent by OpenAI.
   *
   * An error will be raised if the webhook payload was not sent by OpenAI.
   *
   * @param payload - The webhook payload
   * @param headers - The webhook headers
   * @param secret - The webhook secret (optional, will use client secret if not provided)
   * @param tolerance - Maximum age of the webhook in seconds (default: 300 = 5 minutes)
   */
  async verifySignature(payload, headers, secret = this._client.webhookSecret, tolerance = 300) {
    if (typeof crypto === "undefined" || typeof crypto.subtle.importKey !== "function" || typeof crypto.subtle.verify !== "function") {
      throw new Error("Webhook signature verification is only supported when the `crypto` global is defined");
    }
    __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_validateSecret).call(this, secret);
    const headersObj = buildHeaders([headers]).values;
    const signatureHeader = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-signature");
    const timestamp = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-timestamp");
    const webhookId = __classPrivateFieldGet(this, _Webhooks_instances, "m", _Webhooks_getRequiredHeader).call(this, headersObj, "webhook-id");
    const timestampSeconds = parseInt(timestamp, 10);
    if (isNaN(timestampSeconds)) {
      throw new InvalidWebhookSignatureError("Invalid webhook timestamp format");
    }
    const nowSeconds = Math.floor(Date.now() / 1e3);
    if (nowSeconds - timestampSeconds > tolerance) {
      throw new InvalidWebhookSignatureError("Webhook timestamp is too old");
    }
    if (timestampSeconds > nowSeconds + tolerance) {
      throw new InvalidWebhookSignatureError("Webhook timestamp is too new");
    }
    const signatures = signatureHeader.split(" ").map((part) => part.startsWith("v1,") ? part.substring(3) : part);
    const decodedSecret = secret.startsWith("whsec_") ? Buffer.from(secret.replace("whsec_", ""), "base64") : Buffer.from(secret, "utf-8");
    const signedPayload = webhookId ? `${webhookId}.${timestamp}.${payload}` : `${timestamp}.${payload}`;
    const key = await crypto.subtle.importKey("raw", decodedSecret, { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    for (const signature of signatures) {
      try {
        const signatureBytes = Buffer.from(signature, "base64");
        const isValid = await crypto.subtle.verify("HMAC", key, signatureBytes, new TextEncoder().encode(signedPayload));
        if (isValid) {
          return;
        }
      } catch {
        continue;
      }
    }
    throw new InvalidWebhookSignatureError("The given webhook signature does not match the expected signature");
  }
};
_Webhooks_instances = /* @__PURE__ */ new WeakSet(), _Webhooks_validateSecret = function _Webhooks_validateSecret2(secret) {
  if (typeof secret !== "string" || secret.length === 0) {
    throw new Error(`The webhook secret must either be set using the env var, OPENAI_WEBHOOK_SECRET, on the client class, OpenAI({ webhookSecret: '123' }), or passed to this function`);
  }
}, _Webhooks_getRequiredHeader = function _Webhooks_getRequiredHeader2(headers, name) {
  if (!headers) {
    throw new Error(`Headers are required`);
  }
  const value = headers.get(name);
  if (value === null || value === void 0) {
    throw new Error(`Missing required header: ${name}`);
  }
  return value;
};

// node_modules/openai/client.mjs
var _OpenAI_instances;
var _a2;
var _OpenAI_encoder;
var _OpenAI_baseURLOverridden;
var OpenAI = class {
  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
   * @param {string | null | undefined} [opts.webhookSecret=process.env['OPENAI_WEBHOOK_SECRET'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {MergedRequestInit} [opts.fetchOptions] - Additional `RequestInit` options to be passed to `fetch` calls.
   * @param {Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {HeadersLike} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Record<string, string | undefined>} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({ baseURL = readEnv("OPENAI_BASE_URL"), apiKey = readEnv("OPENAI_API_KEY"), organization = readEnv("OPENAI_ORG_ID") ?? null, project = readEnv("OPENAI_PROJECT_ID") ?? null, webhookSecret = readEnv("OPENAI_WEBHOOK_SECRET") ?? null, ...opts } = {}) {
    _OpenAI_instances.add(this);
    _OpenAI_encoder.set(this, void 0);
    this.completions = new Completions2(this);
    this.chat = new Chat(this);
    this.embeddings = new Embeddings(this);
    this.files = new Files2(this);
    this.images = new Images(this);
    this.audio = new Audio(this);
    this.moderations = new Moderations(this);
    this.models = new Models(this);
    this.fineTuning = new FineTuning(this);
    this.graders = new Graders2(this);
    this.vectorStores = new VectorStores(this);
    this.webhooks = new Webhooks(this);
    this.beta = new Beta(this);
    this.batches = new Batches(this);
    this.uploads = new Uploads(this);
    this.responses = new Responses(this);
    this.realtime = new Realtime2(this);
    this.conversations = new Conversations(this);
    this.evals = new Evals(this);
    this.containers = new Containers(this);
    this.skills = new Skills(this);
    this.videos = new Videos(this);
    if (apiKey === void 0) {
      throw new OpenAIError("Missing credentials. Please pass an `apiKey`, or set the `OPENAI_API_KEY` environment variable.");
    }
    const options = {
      apiKey,
      organization,
      project,
      webhookSecret,
      ...opts,
      baseURL: baseURL || `https://api.openai.com/v1`
    };
    if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
    }
    this.baseURL = options.baseURL;
    this.timeout = options.timeout ?? _a2.DEFAULT_TIMEOUT;
    this.logger = options.logger ?? console;
    const defaultLogLevel = "warn";
    this.logLevel = defaultLogLevel;
    this.logLevel = parseLogLevel(options.logLevel, "ClientOptions.logLevel", this) ?? parseLogLevel(readEnv("OPENAI_LOG"), "process.env['OPENAI_LOG']", this) ?? defaultLogLevel;
    this.fetchOptions = options.fetchOptions;
    this.maxRetries = options.maxRetries ?? 2;
    this.fetch = options.fetch ?? getDefaultFetch();
    __classPrivateFieldSet(this, _OpenAI_encoder, FallbackEncoder, "f");
    this._options = options;
    this.apiKey = typeof apiKey === "string" ? apiKey : "Missing Key";
    this.organization = organization;
    this.project = project;
    this.webhookSecret = webhookSecret;
  }
  /**
   * Create a new client instance re-using the same options given to the current client with optional overriding.
   */
  withOptions(options) {
    const client = new this.constructor({
      ...this._options,
      baseURL: this.baseURL,
      maxRetries: this.maxRetries,
      timeout: this.timeout,
      logger: this.logger,
      logLevel: this.logLevel,
      fetch: this.fetch,
      fetchOptions: this.fetchOptions,
      apiKey: this.apiKey,
      organization: this.organization,
      project: this.project,
      webhookSecret: this.webhookSecret,
      ...options
    });
    return client;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  validateHeaders({ values, nulls }) {
    return;
  }
  async authHeaders(opts) {
    return buildHeaders([{ Authorization: `Bearer ${this.apiKey}` }]);
  }
  stringifyQuery(query) {
    return stringify(query, { arrayFormat: "brackets" });
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  makeStatusError(status, error, message, headers) {
    return APIError.generate(status, error, message, headers);
  }
  async _callApiKey() {
    const apiKey = this._options.apiKey;
    if (typeof apiKey !== "function")
      return false;
    let token;
    try {
      token = await apiKey();
    } catch (err) {
      if (err instanceof OpenAIError)
        throw err;
      throw new OpenAIError(
        `Failed to get token from 'apiKey' function: ${err.message}`,
        // @ts-ignore
        { cause: err }
      );
    }
    if (typeof token !== "string" || !token) {
      throw new OpenAIError(`Expected 'apiKey' function argument to return a string but it returned ${token}`);
    }
    this.apiKey = token;
    return true;
  }
  buildURL(path2, query, defaultBaseURL) {
    const baseURL = !__classPrivateFieldGet(this, _OpenAI_instances, "m", _OpenAI_baseURLOverridden).call(this) && defaultBaseURL || this.baseURL;
    const url = isAbsoluteURL(path2) ? new URL(path2) : new URL(baseURL + (baseURL.endsWith("/") && path2.startsWith("/") ? path2.slice(1) : path2));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(options) {
    await this._callApiKey();
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options }) {
  }
  get(path2, opts) {
    return this.methodRequest("get", path2, opts);
  }
  post(path2, opts) {
    return this.methodRequest("post", path2, opts);
  }
  patch(path2, opts) {
    return this.methodRequest("patch", path2, opts);
  }
  put(path2, opts) {
    return this.methodRequest("put", path2, opts);
  }
  delete(path2, opts) {
    return this.methodRequest("delete", path2, opts);
  }
  methodRequest(method, path2, opts) {
    return this.request(Promise.resolve(opts).then((opts2) => {
      return { method, path: path2, ...opts2 };
    }));
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this, this.makeRequest(options, remainingRetries, void 0));
  }
  async makeRequest(optionsInput, retriesRemaining, retryOfRequestLogID) {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = await this.buildRequest(options, {
      retryCount: maxRetries - retriesRemaining
    });
    await this.prepareRequest(req, { url, options });
    const requestLogID = "log_" + (Math.random() * (1 << 24) | 0).toString(16).padStart(6, "0");
    const retryLogStr = retryOfRequestLogID === void 0 ? "" : `, retryOf: ${retryOfRequestLogID}`;
    const startTime = Date.now();
    loggerFor(this).debug(`[${requestLogID}] sending request`, formatRequestDetails({
      retryOfRequestLogID,
      method: options.method,
      url,
      options,
      headers: req.headers
    }));
    if (options.signal?.aborted) {
      throw new APIUserAbortError();
    }
    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    const headersTime = Date.now();
    if (response instanceof globalThis.Error) {
      const retryMessage = `retrying, ${retriesRemaining} attempts remaining`;
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }
      const isTimeout = isAbortError(response) || /timed? ?out/i.test(String(response) + ("cause" in response ? String(response.cause) : ""));
      if (retriesRemaining) {
        loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - ${retryMessage}`);
        loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (${retryMessage})`, formatRequestDetails({
          retryOfRequestLogID,
          url,
          durationMs: headersTime - startTime,
          message: response.message
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID);
      }
      loggerFor(this).info(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} - error; no more retries left`);
      loggerFor(this).debug(`[${requestLogID}] connection ${isTimeout ? "timed out" : "failed"} (error; no more retries left)`, formatRequestDetails({
        retryOfRequestLogID,
        url,
        durationMs: headersTime - startTime,
        message: response.message
      }));
      if (isTimeout) {
        throw new APIConnectionTimeoutError();
      }
      throw new APIConnectionError({ cause: response });
    }
    const specialHeaders = [...response.headers.entries()].filter(([name]) => name === "x-request-id").map(([name, value]) => ", " + name + ": " + JSON.stringify(value)).join("");
    const responseInfo = `[${requestLogID}${retryLogStr}${specialHeaders}] ${req.method} ${url} ${response.ok ? "succeeded" : "failed"} with status ${response.status} in ${headersTime - startTime}ms`;
    if (!response.ok) {
      const shouldRetry = await this.shouldRetry(response);
      if (retriesRemaining && shouldRetry) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        await CancelReadableStream(response.body);
        loggerFor(this).info(`${responseInfo} - ${retryMessage2}`);
        loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage2})`, formatRequestDetails({
          retryOfRequestLogID,
          url: response.url,
          status: response.status,
          headers: response.headers,
          durationMs: headersTime - startTime
        }));
        return this.retryRequest(options, retriesRemaining, retryOfRequestLogID ?? requestLogID, response.headers);
      }
      const retryMessage = shouldRetry ? `error; no more retries left` : `error; not retryable`;
      loggerFor(this).info(`${responseInfo} - ${retryMessage}`);
      const errText = await response.text().catch((err2) => castToError(err2).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      loggerFor(this).debug(`[${requestLogID}] response error (${retryMessage})`, formatRequestDetails({
        retryOfRequestLogID,
        url: response.url,
        status: response.status,
        headers: response.headers,
        message: errMessage,
        durationMs: Date.now() - startTime
      }));
      const err = this.makeStatusError(response.status, errJSON, errMessage, response.headers);
      throw err;
    }
    loggerFor(this).info(responseInfo);
    loggerFor(this).debug(`[${requestLogID}] response start`, formatRequestDetails({
      retryOfRequestLogID,
      url: response.url,
      status: response.status,
      headers: response.headers,
      durationMs: headersTime - startTime
    }));
    return { response, options, controller, requestLogID, retryOfRequestLogID, startTime };
  }
  getAPIList(path2, Page2, opts) {
    return this.requestAPIList(Page2, opts && "then" in opts ? opts.then((opts2) => ({ method: "get", path: path2, ...opts2 })) : { method: "get", path: path2, ...opts });
  }
  requestAPIList(Page2, options) {
    const request = this.makeRequest(options, null, void 0);
    return new PagePromise(this, request, Page2);
  }
  async fetchWithTimeout(url, init, ms, controller) {
    const { signal, method, ...options } = init || {};
    const abort = this._makeAbort(controller);
    if (signal)
      signal.addEventListener("abort", abort, { once: true });
    const timeout = setTimeout(abort, ms);
    const isReadableBody = globalThis.ReadableStream && options.body instanceof globalThis.ReadableStream || typeof options.body === "object" && options.body !== null && Symbol.asyncIterator in options.body;
    const fetchOptions = {
      signal: controller.signal,
      ...isReadableBody ? { duplex: "half" } : {},
      method: "GET",
      ...options
    };
    if (method) {
      fetchOptions.method = method.toUpperCase();
    }
    try {
      return await this.fetch.call(void 0, url, fetchOptions);
    } finally {
      clearTimeout(timeout);
    }
  }
  async shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, requestLogID, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.get("retry-after-ms");
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.get("retry-after");
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1e3)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1, requestLogID);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  async buildRequest(inputOptions, { retryCount = 0 } = {}) {
    const options = { ...inputOptions };
    const { method, path: path2, query, defaultBaseURL } = options;
    const url = this.buildURL(path2, query, defaultBaseURL);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const { bodyHeaders, body } = this.buildBody({ options });
    const reqHeaders = await this.buildHeaders({ options: inputOptions, method, bodyHeaders, retryCount });
    const req = {
      method,
      headers: reqHeaders,
      ...options.signal && { signal: options.signal },
      ...globalThis.ReadableStream && body instanceof globalThis.ReadableStream && { duplex: "half" },
      ...body && { body },
      ...this.fetchOptions ?? {},
      ...options.fetchOptions ?? {}
    };
    return { req, url, timeout: options.timeout };
  }
  async buildHeaders({ options, method, bodyHeaders, retryCount }) {
    let idempotencyHeaders = {};
    if (this.idempotencyHeader && method !== "get") {
      if (!options.idempotencyKey)
        options.idempotencyKey = this.defaultIdempotencyKey();
      idempotencyHeaders[this.idempotencyHeader] = options.idempotencyKey;
    }
    const headers = buildHeaders([
      idempotencyHeaders,
      {
        Accept: "application/json",
        "User-Agent": this.getUserAgent(),
        "X-Stainless-Retry-Count": String(retryCount),
        ...options.timeout ? { "X-Stainless-Timeout": String(Math.trunc(options.timeout / 1e3)) } : {},
        ...getPlatformHeaders(),
        "OpenAI-Organization": this.organization,
        "OpenAI-Project": this.project
      },
      await this.authHeaders(options),
      this._options.defaultHeaders,
      bodyHeaders,
      options.headers
    ]);
    this.validateHeaders(headers);
    return headers.values;
  }
  _makeAbort(controller) {
    return () => controller.abort();
  }
  buildBody({ options: { body, headers: rawHeaders } }) {
    if (!body) {
      return { bodyHeaders: void 0, body: void 0 };
    }
    const headers = buildHeaders([rawHeaders]);
    if (
      // Pass raw type verbatim
      ArrayBuffer.isView(body) || body instanceof ArrayBuffer || body instanceof DataView || typeof body === "string" && // Preserve legacy string encoding behavior for now
      headers.values.has("content-type") || // `Blob` is superset of `File`
      globalThis.Blob && body instanceof globalThis.Blob || // `FormData` -> `multipart/form-data`
      body instanceof FormData || // `URLSearchParams` -> `application/x-www-form-urlencoded`
      body instanceof URLSearchParams || // Send chunked stream (each chunk has own `length`)
      globalThis.ReadableStream && body instanceof globalThis.ReadableStream
    ) {
      return { bodyHeaders: void 0, body };
    } else if (typeof body === "object" && (Symbol.asyncIterator in body || Symbol.iterator in body && "next" in body && typeof body.next === "function")) {
      return { bodyHeaders: void 0, body: ReadableStreamFrom(body) };
    } else {
      return __classPrivateFieldGet(this, _OpenAI_encoder, "f").call(this, { body, headers });
    }
  }
};
_a2 = OpenAI, _OpenAI_encoder = /* @__PURE__ */ new WeakMap(), _OpenAI_instances = /* @__PURE__ */ new WeakSet(), _OpenAI_baseURLOverridden = function _OpenAI_baseURLOverridden2() {
  return this.baseURL !== "https://api.openai.com/v1";
};
OpenAI.OpenAI = _a2;
OpenAI.DEFAULT_TIMEOUT = 6e5;
OpenAI.OpenAIError = OpenAIError;
OpenAI.APIError = APIError;
OpenAI.APIConnectionError = APIConnectionError;
OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError;
OpenAI.APIUserAbortError = APIUserAbortError;
OpenAI.NotFoundError = NotFoundError;
OpenAI.ConflictError = ConflictError;
OpenAI.RateLimitError = RateLimitError;
OpenAI.BadRequestError = BadRequestError;
OpenAI.AuthenticationError = AuthenticationError;
OpenAI.InternalServerError = InternalServerError;
OpenAI.PermissionDeniedError = PermissionDeniedError;
OpenAI.UnprocessableEntityError = UnprocessableEntityError;
OpenAI.InvalidWebhookSignatureError = InvalidWebhookSignatureError;
OpenAI.toFile = toFile;
OpenAI.Completions = Completions2;
OpenAI.Chat = Chat;
OpenAI.Embeddings = Embeddings;
OpenAI.Files = Files2;
OpenAI.Images = Images;
OpenAI.Audio = Audio;
OpenAI.Moderations = Moderations;
OpenAI.Models = Models;
OpenAI.FineTuning = FineTuning;
OpenAI.Graders = Graders2;
OpenAI.VectorStores = VectorStores;
OpenAI.Webhooks = Webhooks;
OpenAI.Beta = Beta;
OpenAI.Batches = Batches;
OpenAI.Uploads = Uploads;
OpenAI.Responses = Responses;
OpenAI.Realtime = Realtime2;
OpenAI.Conversations = Conversations;
OpenAI.Evals = Evals;
OpenAI.Containers = Containers;
OpenAI.Skills = Skills;
OpenAI.Videos = Videos;

// background.js
var import_crypto_js = __toESM(require_crypto_js(), 1);
var SETTINGS_KEY = "web_agent_settings_v1";
var TASK_STATE_KEY = "web_agent_last_task_v1";
var AGENT_MEMORY_KEY = "web_agent_memory_v1";
var AGENT_TOOL_STORAGE_KEY = "web_agent_tool_storage_v1";
var AGENT_CRYPTO_PROFILE_STORAGE_KEY = "web_agent_crypto_profiles_v1";
var ENABLE_TRACE_LOGS = false;
var DEFAULT_SETTINGS = {
  apiKey: "",
  model: "",
  thinkingLevel: "auto",
  baseURL: "https://api.openai.com/v1",
  allowScript: false,
  requestTimeoutSec: 120,
  toolTurnLimit: 0,
  mcpServices: []
};
var runningTask = null;
var keepAliveTimer = null;
var persistTaskTimer = null;
var MAX_MEMORY_ENTRIES = 16;
var MAX_MEMORY_TEXT_CHARS = 1800;
var mcpRpcSeq = 0;
var mcpStreamableSessions = {};
var mcpSSESessions = {};
function createTaskCancelledError(reason = "\u4EFB\u52A1\u5DF2\u505C\u6B62") {
  const err = new Error(String(reason || "\u4EFB\u52A1\u5DF2\u505C\u6B62"));
  err.name = "TaskCancelledError";
  return err;
}
function isTaskCancelledError(err) {
  if (!err) return false;
  if (err?.name === "TaskCancelledError") return true;
  const message = String(err?.message || err || "").toLowerCase();
  return message.includes("taskcancellederror") || message.includes("\u4EFB\u52A1\u5DF2\u505C\u6B62") || message.includes("aborted") || message.includes("abort");
}
function ensureTaskActive(hooks) {
  if (hooks?.cancelSignal?.aborted) {
    throw createTaskCancelledError(hooks?.cancelReason || hooks?.cancelSignal?.reason || "\u4EFB\u52A1\u5DF2\u505C\u6B62");
  }
}
function stopRunningTask(reason = "\u7528\u6237\u5DF2\u505C\u6B62\u4EFB\u52A1") {
  if (!runningTask || runningTask.status !== "running") {
    return { ok: false, error: "\u5F53\u524D\u6CA1\u6709\u53EF\u505C\u6B62\u7684\u8FD0\u884C\u4EFB\u52A1" };
  }
  runningTask.cancelRequested = true;
  runningTask.cancelReason = String(reason || "\u7528\u6237\u5DF2\u505C\u6B62\u4EFB\u52A1");
  runningTask.statusText = "\u505C\u6B62\u4E2D...";
  schedulePersistTaskState(runningTask);
  broadcastTask(runningTask, { type: "status", text: runningTask.statusText });
  try {
    if (runningTask.abortController && !runningTask.abortController.signal.aborted) {
      runningTask.abortController.abort(runningTask.cancelReason);
    }
  } catch (_err) {
  }
  return { ok: true, taskId: runningTask.id, status: "stopping" };
}
function generateTaskID() {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function toTaskPublicState(task) {
  if (!task) return null;
  return {
    id: task.id,
    status: task.status,
    prompt: task.prompt,
    statusText: task.statusText || "",
    assistantText: task.assistantText || "",
    reasoningText: task.reasoningText || "",
    message: task.message || "",
    error: task.error || "",
    cancelRequested: !!task.cancelRequested,
    cancelReason: task.cancelReason || "",
    startedAt: Number(task.startedAt || 0),
    endedAt: Number(task.endedAt || 0)
  };
}
async function persistTaskStateNow(task) {
  try {
    await chrome.storage.local.set({ [TASK_STATE_KEY]: toTaskPublicState(task) });
  } catch (_err) {
  }
}
function schedulePersistTaskState(task) {
  if (persistTaskTimer) {
    clearTimeout(persistTaskTimer);
  }
  persistTaskTimer = setTimeout(() => {
    persistTaskTimer = null;
    void persistTaskStateNow(task);
  }, 250);
}
function broadcastTask(task, message) {
  if (!task?.subscribers || task.subscribers.size === 0) return;
  for (const port of Array.from(task.subscribers)) {
    safePost(port, message);
  }
}
function attachPortToTask(port, task) {
  if (!task || !port) return;
  task.subscribers.add(port);
}
function detachPortFromTask(port, task) {
  if (!task || !port) return;
  task.subscribers.delete(port);
}
function startKeepAlive() {
  if (keepAliveTimer) return;
  keepAliveTimer = setInterval(() => {
    try {
      chrome.runtime.getPlatformInfo(() => {
        void chrome.runtime.lastError;
      });
    } catch (_err) {
    }
  }, 2e4);
}
function stopKeepAliveIfIdle() {
  if (runningTask?.status === "running") return;
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}
async function executeBackgroundTask(task, settings, hooksBuilder) {
  startKeepAlive();
  await persistTaskStateNow(task);
  try {
    const hooks = hooksBuilder(task);
    ensureTaskActive(hooks);
    const result = await runAgent(task.prompt, settings, hooks);
    task.endedAt = Date.now();
    if (result?.cancelled || task.cancelRequested) {
      task.status = "stopped";
      task.message = String(result?.message || task.cancelReason || "\u4EFB\u52A1\u5DF2\u505C\u6B62");
      broadcastTask(task, { type: "stopped", message: task.message });
    } else if (result?.ok) {
      task.status = "done";
      task.message = String(result?.message || "\u6267\u884C\u5B8C\u6210");
      broadcastTask(task, { type: "result", message: task.message });
    } else {
      task.status = "error";
      task.error = String(result?.error || "\u6267\u884C\u5931\u8D25");
      broadcastTask(task, { type: "error", error: task.error });
    }
  } catch (err) {
    task.endedAt = Date.now();
    if (task.cancelRequested || isTaskCancelledError(err)) {
      task.status = "stopped";
      task.message = String(task.cancelReason || "\u4EFB\u52A1\u5DF2\u505C\u6B62");
      broadcastTask(task, { type: "stopped", message: task.message });
    } else {
      task.status = "error";
      task.error = String(err || "\u6267\u884C\u5931\u8D25");
      broadcastTask(task, { type: "error", error: task.error });
    }
  } finally {
    await persistTaskStateNow(task);
    broadcastTask(task, { type: "done" });
    if (runningTask?.id === task.id) {
      runningTask = null;
    }
    stopKeepAliveIfIdle();
  }
}
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message).then((res) => sendResponse(res)).catch((err) => sendResponse({ ok: false, error: String(err) }));
  return true;
});
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "agent_stream") {
    return;
  }
  let subscribedTask = null;
  port.onDisconnect.addListener(() => {
    if (subscribedTask) {
      detachPortFromTask(port, subscribedTask);
      subscribedTask = null;
    }
  });
  port.onMessage.addListener(async (message) => {
    if (!message || typeof message !== "object") {
      return;
    }
    if (message.type === "ATTACH_TASK") {
      const wantedID = String(message?.payload?.taskId || "");
      if (!runningTask || runningTask.status !== "running" || wantedID && runningTask.id !== wantedID) {
        safePost(port, { type: "error", error: "\u672A\u627E\u5230\u53EF\u6302\u8F7D\u7684\u540E\u53F0\u8FD0\u884C\u4EFB\u52A1" });
        safePost(port, { type: "done" });
        return;
      }
      if (subscribedTask) {
        detachPortFromTask(port, subscribedTask);
      }
      subscribedTask = runningTask;
      attachPortToTask(port, subscribedTask);
      safePost(port, { type: "accepted", taskId: subscribedTask.id, resumed: true });
      safePost(port, { type: "task_snapshot", task: toTaskPublicState(subscribedTask) });
      return;
    }
    if (message.type !== "RUN_AGENT_STREAM") {
      return;
    }
    const payload = message?.payload || {};
    if (runningTask && runningTask.status === "running") {
      if (subscribedTask) {
        detachPortFromTask(port, subscribedTask);
      }
      subscribedTask = runningTask;
      attachPortToTask(port, subscribedTask);
      safePost(port, { type: "accepted", taskId: subscribedTask.id, resumed: true });
      safePost(port, { type: "task_snapshot", task: toTaskPublicState(subscribedTask) });
      return;
    }
    const task = {
      id: generateTaskID(),
      status: "running",
      prompt: String(payload.prompt || ""),
      statusText: "",
      assistantText: "",
      reasoningText: "",
      message: "",
      error: "",
      cancelRequested: false,
      cancelReason: "",
      abortController: new AbortController(),
      startedAt: Date.now(),
      endedAt: 0,
      subscribers: /* @__PURE__ */ new Set()
    };
    runningTask = task;
    if (subscribedTask) {
      detachPortFromTask(port, subscribedTask);
    }
    subscribedTask = task;
    attachPortToTask(port, task);
    safePost(port, { type: "accepted", taskId: task.id, resumed: false });
    void executeBackgroundTask(task, payload.settings || {}, (task2) => ({
      onStatus: (text) => {
        task2.statusText = String(text || "");
        schedulePersistTaskState(task2);
        broadcastTask(task2, { type: "status", text });
      },
      onDelta: (delta) => {
        const text = String(delta || "");
        if (!text) return;
        task2.assistantText += text;
        schedulePersistTaskState(task2);
        broadcastTask(task2, { type: "stream_delta", delta: text });
      },
      onReasoning: (delta) => {
        const text = String(delta || "");
        if (!text) return;
        task2.reasoningText += text;
        schedulePersistTaskState(task2);
        broadcastTask(task2, { type: "reasoning_delta", delta: text });
      },
      onDebug: ENABLE_TRACE_LOGS ? (text) => broadcastTask(task2, { type: "debug", text }) : void 0,
      cancelSignal: task2.abortController?.signal,
      cancelReason: task2.cancelReason || "\u4EFB\u52A1\u5DF2\u505C\u6B62"
    }));
  });
});
function safePost(port, data) {
  try {
    port.postMessage(data);
  } catch (_err) {
  }
}
function normalizeMemoryText(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (text.length <= MAX_MEMORY_TEXT_CHARS) return text;
  return `${text.slice(0, MAX_MEMORY_TEXT_CHARS)} ...`;
}
function normalizeMemoryEntry(item) {
  const role = item?.role === "assistant" ? "assistant" : "user";
  const text = normalizeMemoryText(item?.text);
  if (!text) return null;
  return {
    role,
    text,
    ts: Number(item?.ts || Date.now())
  };
}
function normalizeMemoryEntries(items) {
  if (!Array.isArray(items)) return [];
  const list = [];
  for (const item of items) {
    const entry = normalizeMemoryEntry(item);
    if (!entry) continue;
    list.push(entry);
  }
  if (list.length > MAX_MEMORY_ENTRIES) {
    return list.slice(list.length - MAX_MEMORY_ENTRIES);
  }
  return list;
}
function memoryTabKey(tabId) {
  return String(tabId || "");
}
async function loadMemoryStore() {
  const data = await chrome.storage.local.get(AGENT_MEMORY_KEY);
  const raw = data?.[AGENT_MEMORY_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw;
}
async function getConversationMemory(tabId) {
  const key = memoryTabKey(tabId);
  if (!key) return [];
  const store = await loadMemoryStore();
  return normalizeMemoryEntries(store?.[key]);
}
async function appendConversationMemory(tabId, userText, assistantText) {
  const key = memoryTabKey(tabId);
  if (!key) return;
  const user = normalizeMemoryText(userText);
  const assistant = normalizeMemoryText(assistantText);
  if (!user || !assistant) return;
  const store = await loadMemoryStore();
  const current = normalizeMemoryEntries(store?.[key]);
  current.push({ role: "user", text: user, ts: Date.now() });
  current.push({ role: "assistant", text: assistant, ts: Date.now() });
  store[key] = normalizeMemoryEntries(current);
  await chrome.storage.local.set({ [AGENT_MEMORY_KEY]: store });
}
async function clearConversationMemory(tabId) {
  const key = memoryTabKey(tabId);
  if (!key) return;
  const store = await loadMemoryStore();
  if (!Object.prototype.hasOwnProperty.call(store, key)) return;
  delete store[key];
  await chrome.storage.local.set({ [AGENT_MEMORY_KEY]: store });
}
function normalizeToolStorageKey(value) {
  const key = String(value || "").trim();
  if (!key) return "";
  if (key.length > 128) return "";
  if (!/^[a-zA-Z0-9._:-]+$/.test(key)) return "";
  return key;
}
async function loadToolStorageStore() {
  const data = await chrome.storage.local.get(AGENT_TOOL_STORAGE_KEY);
  const raw = data?.[AGENT_TOOL_STORAGE_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  return raw;
}
function ensureJSONSerializable(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_err) {
    return void 0;
  }
}
async function setToolStorage(args) {
  const key = normalizeToolStorageKey(args?.key);
  if (!key) {
    return { ok: false, error: "invalid key: only letters/digits/._:- and max 128 chars" };
  }
  if (!Object.prototype.hasOwnProperty.call(args || {}, "value")) {
    return { ok: false, error: "value is required" };
  }
  const value = ensureJSONSerializable(args.value);
  if (typeof value === "undefined") {
    return { ok: false, error: "value must be JSON serializable" };
  }
  const store = await loadToolStorageStore();
  store[key] = value;
  await chrome.storage.local.set({ [AGENT_TOOL_STORAGE_KEY]: store });
  return { ok: true, key, value };
}
async function getToolStorage(args) {
  const key = normalizeToolStorageKey(args?.key);
  if (!key) {
    return { ok: false, error: "invalid key: only letters/digits/._:- and max 128 chars" };
  }
  const store = await loadToolStorageStore();
  if (!Object.prototype.hasOwnProperty.call(store, key)) {
    return { ok: true, key, exists: false, value: null };
  }
  return { ok: true, key, exists: true, value: store[key] };
}
function normalizeCryptoEncoding(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "utf8" || raw === "utf-8") return "utf8";
  if (raw === "base64" || raw === "hex" || raw === "unicode") return raw;
  return "utf8";
}
function normalizeSymmetricAlgorithm(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "3DES" || raw === "DES3" || raw === "TRIPLEDES") return "DESEDE";
  if (raw === "AES" || raw === "DES" || raw === "DESEDE") return raw;
  return "AES";
}
function normalizeSymmetricMode(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (raw === "ECB" || raw === "CBC") return raw;
  return "ECB";
}
function normalizeSymmetricKeySize(value) {
  const raw = Number(value);
  if (raw === 64 || raw === 128 || raw === 192 || raw === 256) return raw;
  return 128;
}
function normalizeCryptoProfileId(value) {
  const id = String(value || "").trim();
  if (!id) return "";
  if (id.length > 128) return "";
  if (!/^[a-zA-Z0-9._:-]+$/.test(id)) return "";
  return id;
}
function createCryptoProfileId() {
  return `crypto_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function normalizeCryptoProfile(input = {}) {
  const now = Date.now();
  const createdAt = Number(input.createdAt || now);
  const updatedAt = Number(input.updatedAt || now);
  return {
    id: normalizeCryptoProfileId(input.id) || createCryptoProfileId(),
    name: String(input.name || "").trim().slice(0, 80),
    algorithm: normalizeSymmetricAlgorithm(input.algorithm),
    mode: normalizeSymmetricMode(input.mode),
    keySize: normalizeSymmetricKeySize(input.keySize),
    keyEncoding: normalizeCryptoEncoding(input.keyEncoding),
    keyValue: String(input.keyValue || ""),
    ivEncoding: normalizeCryptoEncoding(input.ivEncoding),
    ivValue: String(input.ivValue || ""),
    description: String(input.description || "").trim().slice(0, 500),
    createdAt: Number.isFinite(createdAt) ? createdAt : now,
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : now
  };
}
function normalizeCryptoProfiles(items) {
  if (!Array.isArray(items)) return [];
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const item of items) {
    const one = normalizeCryptoProfile(item);
    if (!one.id || seen.has(one.id)) continue;
    seen.add(one.id);
    out.push(one);
  }
  return out;
}
async function loadCryptoProfiles() {
  const data = await chrome.storage.local.get(AGENT_CRYPTO_PROFILE_STORAGE_KEY);
  const raw = data?.[AGENT_CRYPTO_PROFILE_STORAGE_KEY];
  if (!raw || typeof raw !== "object") return [];
  if (Array.isArray(raw)) return normalizeCryptoProfiles(raw);
  if (Array.isArray(raw.profiles)) return normalizeCryptoProfiles(raw.profiles);
  return [];
}
async function saveCryptoProfiles(list) {
  const profiles = normalizeCryptoProfiles(list);
  await chrome.storage.local.set({
    [AGENT_CRYPTO_PROFILE_STORAGE_KEY]: {
      updatedAt: Date.now(),
      profiles
    }
  });
  return profiles;
}
function bytesToWordArray(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  const words = [];
  for (let i = 0; i < view.length; i += 1) {
    words[i >>> 2] |= view[i] << 24 - i % 4 * 8;
  }
  return import_crypto_js.default.lib.WordArray.create(words, view.length);
}
function wordArrayToBytes(wordArray) {
  const sigBytes = Number(wordArray?.sigBytes || 0);
  const words = wordArray?.words || [];
  const out = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i += 1) {
    out[i] = words[i >>> 2] >>> 24 - i % 4 * 8 & 255;
  }
  return out;
}
function decodeBase64(value) {
  try {
    const text = String(value || "").replace(/\s+/g, "");
    const raw = globalThis.atob(text);
    const out = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      out[i] = raw.charCodeAt(i);
    }
    return out;
  } catch (_err) {
    return null;
  }
}
function encodeBase64(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let raw = "";
  for (const b of view) {
    raw += String.fromCharCode(b);
  }
  return globalThis.btoa(raw);
}
function decodeHex(value) {
  const text = String(value || "").trim().replace(/\s+/g, "");
  if (!text) return new Uint8Array([]);
  if (text.length % 2 !== 0) return null;
  if (!/^[0-9a-fA-F]+$/.test(text)) return null;
  const out = new Uint8Array(text.length / 2);
  for (let i = 0; i < text.length; i += 2) {
    out[i / 2] = parseInt(text.slice(i, i + 2), 16);
  }
  return out;
}
function encodeHex(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let out = "";
  for (const b of view) {
    out += b.toString(16).padStart(2, "0");
  }
  return out;
}
function unicodeEncode(text) {
  let out = "";
  const raw = String(text || "");
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i);
    out += `\\u${code.toString(16).padStart(4, "0")}`;
  }
  return out;
}
function unicodeDecode(text) {
  try {
    return String(text || "").replace(/\\u([0-9a-fA-F]{4})/g, (_m, g1) => String.fromCharCode(parseInt(g1, 16)));
  } catch (_err) {
    return "";
  }
}
function parseBytes(value, encoding, fieldName = "value") {
  const mode = normalizeCryptoEncoding(encoding);
  const text = String(value || "");
  if (mode === "utf8") {
    return { ok: true, bytes: new TextEncoder().encode(text) };
  }
  if (mode === "unicode") {
    return { ok: true, bytes: new TextEncoder().encode(unicodeDecode(text)) };
  }
  if (mode === "base64") {
    const parsed2 = decodeBase64(text);
    if (!parsed2) return { ok: false, error: `${fieldName} is not valid base64` };
    return { ok: true, bytes: parsed2 };
  }
  const parsed = decodeHex(text);
  if (!parsed) return { ok: false, error: `${fieldName} is not valid hex` };
  return { ok: true, bytes: parsed };
}
function formatBytes(bytes, encoding) {
  const mode = normalizeCryptoEncoding(encoding);
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (mode === "base64") return encodeBase64(view);
  if (mode === "hex") return encodeHex(view);
  const text = new TextDecoder().decode(view);
  if (mode === "unicode") return unicodeEncode(text);
  return text;
}
function normalizeToSize(bytes, bitSize) {
  const sizeBytes = Math.max(1, Math.floor(Number(bitSize || 0) / 8));
  const out = new Uint8Array(sizeBytes);
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  out.set(src.slice(0, sizeBytes), 0);
  return out;
}
function resolveKeySpec(algorithm, keySize) {
  const algo = normalizeSymmetricAlgorithm(algorithm);
  const raw = normalizeSymmetricKeySize(keySize);
  if (algo === "DES") {
    return { keySize: 64, note: raw === 64 ? "" : "DES keySize fixed to 64 bits" };
  }
  if (algo === "DESEDE") {
    if (raw === 128 || raw === 192) return { keySize: raw, note: "" };
    if (raw === 64) return { keySize: 128, note: "DESede keySize 64 adjusted to 128 bits" };
    if (raw === 256) return { keySize: 192, note: "DESede keySize 256 adjusted to 192 bits" };
    return { keySize: 192, note: "" };
  }
  if (raw === 128 || raw === 192 || raw === 256) return { keySize: raw, note: "" };
  if (raw === 64) return { keySize: 128, note: "AES keySize 64 adjusted to 128 bits" };
  return { keySize: 128, note: "" };
}
function resolveProfileRef(profiles, args = {}) {
  const id = normalizeCryptoProfileId(args.profileId || args.id);
  const name = String(args.profileName || args.name || "").trim().toLowerCase();
  const index = Number(args.index);
  if (id) {
    return profiles.find((item) => item.id === id) || null;
  }
  if (name) {
    return profiles.find((item) => String(item.name || "").trim().toLowerCase() === name) || null;
  }
  if (Number.isInteger(index) && index >= 0 && index < profiles.length) {
    return profiles[index];
  }
  return null;
}
function resolveProfileRefs(profiles, args = {}) {
  if (!Array.isArray(profiles) || profiles.length === 0) return [];
  if (args.all === true) return profiles.slice();
  const idSet = /* @__PURE__ */ new Set();
  const addById = (value) => {
    const id = normalizeCryptoProfileId(value);
    if (!id) return;
    const found = profiles.find((item) => item.id === id);
    if (found) idSet.add(found.id);
  };
  const addByName = (value) => {
    const name = String(value || "").trim().toLowerCase();
    if (!name) return;
    for (const item of profiles) {
      if (String(item.name || "").trim().toLowerCase() === name) {
        idSet.add(item.id);
      }
    }
  };
  const addByIndex = (value) => {
    const index = Number(value);
    if (!Number.isInteger(index)) return;
    if (index < 0 || index >= profiles.length) return;
    idSet.add(profiles[index].id);
  };
  addById(args.profileId || args.id);
  addByName(args.profileName || args.name);
  addByIndex(args.index);
  if (Array.isArray(args.profileIds)) {
    args.profileIds.forEach(addById);
  }
  if (Array.isArray(args.profileNames)) {
    args.profileNames.forEach(addByName);
  }
  if (Array.isArray(args.indexes)) {
    args.indexes.forEach(addByIndex);
  }
  const query = String(args.query || "").trim().toLowerCase();
  if (query) {
    for (const item of profiles) {
      if (String(item.name || "").trim().toLowerCase().includes(query)) {
        idSet.add(item.id);
      }
    }
  }
  if (idSet.size === 0) {
    const single = resolveProfileRef(profiles, args);
    if (single) idSet.add(single.id);
  }
  return profiles.filter((item) => idSet.has(item.id));
}
function buildSymmetricConfig(args = {}, profile = null) {
  const source = profile || {};
  const algorithm = normalizeSymmetricAlgorithm(args.algorithm || source.algorithm);
  const mode = normalizeSymmetricMode(args.mode || source.mode);
  const keyEncoding = normalizeCryptoEncoding(args.keyEncoding || source.keyEncoding);
  const ivEncoding = normalizeCryptoEncoding(args.ivEncoding || source.ivEncoding);
  const keyValue = Object.prototype.hasOwnProperty.call(args, "key") ? String(args.key || "") : Object.prototype.hasOwnProperty.call(args, "keyValue") ? String(args.keyValue || "") : String(source.keyValue || "");
  const ivValue = Object.prototype.hasOwnProperty.call(args, "iv") ? String(args.iv || "") : Object.prototype.hasOwnProperty.call(args, "ivValue") ? String(args.ivValue || "") : String(source.ivValue || "");
  const keySpec = resolveKeySpec(algorithm, args.keySize || source.keySize);
  return {
    algorithm,
    mode,
    keySize: keySpec.keySize,
    keySizeNote: keySpec.note,
    keyEncoding,
    keyValue,
    ivEncoding,
    ivValue
  };
}
function getCryptoEngine(algorithm) {
  const algo = normalizeSymmetricAlgorithm(algorithm);
  if (algo === "DES") return import_crypto_js.default.DES;
  if (algo === "DESEDE") return import_crypto_js.default.TripleDES;
  return import_crypto_js.default.AES;
}
function getCryptoMode(mode) {
  return normalizeSymmetricMode(mode) === "CBC" ? import_crypto_js.default.mode.CBC : import_crypto_js.default.mode.ECB;
}
function stripPemHeader(value) {
  const raw = String(value || "").trim();
  if (!raw.includes("-----BEGIN")) return raw.replace(/\s+/g, "");
  return raw.replace(/-----BEGIN [^-]+-----/g, "").replace(/-----END [^-]+-----/g, "").replace(/\s+/g, "");
}
function parseRSAKey(value, encoding, fieldName) {
  const mode = String(encoding || "").trim().toLowerCase();
  if (mode === "pem") {
    const body = stripPemHeader(value);
    const parsed = decodeBase64(body);
    if (!parsed) return { ok: false, error: `${fieldName} is not valid PEM/base64` };
    return { ok: true, bytes: parsed };
  }
  return parseBytes(value, mode === "hex" ? "hex" : "base64", fieldName);
}
function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(String(value || ""));
  } catch (_err) {
    return fallback;
  }
}
function toProfileMeta(profile) {
  return {
    id: profile.id,
    name: profile.name,
    algorithm: profile.algorithm,
    mode: profile.mode,
    keySize: profile.keySize,
    keyEncoding: profile.keyEncoding,
    ivEncoding: profile.ivEncoding,
    description: profile.description,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt
  };
}
async function toolCryptoProfileList(args = {}) {
  const profiles = await loadCryptoProfiles();
  const includeSecret = !!args.includeSecret;
  return {
    ok: true,
    count: profiles.length,
    profiles: includeSecret ? profiles : profiles.map((item) => toProfileMeta(item))
  };
}
async function toolCryptoProfileGet(args = {}) {
  const profiles = await loadCryptoProfiles();
  const profile = resolveProfileRef(profiles, args);
  if (!profile) return { ok: false, error: "profile not found" };
  const includeSecret = args.includeSecret !== false;
  return { ok: true, profile: includeSecret ? profile : toProfileMeta(profile) };
}
async function toolCryptoProfileSave(args = {}) {
  const name = String(args.name || "").trim();
  if (!name) return { ok: false, error: "name is required" };
  const profiles = await loadCryptoProfiles();
  const now = Date.now();
  const found = resolveProfileRef(profiles, args);
  const nextProfile = normalizeCryptoProfile({
    ...found,
    ...args,
    id: normalizeCryptoProfileId(args.id) || found?.id || createCryptoProfileId(),
    name,
    createdAt: found?.createdAt || now,
    updatedAt: now
  });
  const next = profiles.filter((item) => item.id !== nextProfile.id);
  next.push(nextProfile);
  const saved = await saveCryptoProfiles(next);
  return { ok: true, profile: nextProfile, count: saved.length };
}
async function toolCryptoProfileDelete(args = {}) {
  const profiles = await loadCryptoProfiles();
  const targets = resolveProfileRefs(profiles, args);
  if (!targets.length) {
    return {
      ok: false,
      error: "profile not found, use id/name/index or profileIds/profileNames/indexes/all/query",
      available: profiles.map((item, idx) => ({ index: idx, id: item.id, name: item.name }))
    };
  }
  const idSet = new Set(targets.map((item) => item.id));
  const next = profiles.filter((item) => !idSet.has(item.id));
  const saved = await saveCryptoProfiles(next);
  return {
    ok: true,
    deleted: targets.length === 1 ? targets[0].id : targets.map((item) => item.id),
    deletedCount: targets.length,
    count: saved.length
  };
}
async function toolCryptoEncrypt(args = {}) {
  const profiles = await loadCryptoProfiles();
  const profile = resolveProfileRef(profiles, args);
  const cfg = buildSymmetricConfig(args, profile);
  if (!cfg.keyValue) return { ok: false, error: "key/keyValue is required" };
  const plainText = String(args.plaintext || args.text || "");
  const plainEncoding = normalizeCryptoEncoding(args.plainEncoding || args.inputEncoding || "utf8");
  const outputEncoding = String(args.outputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  const keyParsed = parseBytes(cfg.keyValue, cfg.keyEncoding, "key");
  if (!keyParsed.ok) return keyParsed;
  const keyBytes = normalizeToSize(keyParsed.bytes, cfg.keySize);
  let ivBytes = new Uint8Array([]);
  if (cfg.mode === "CBC") {
    const ivParsed = parseBytes(cfg.ivValue, cfg.ivEncoding, "iv");
    if (!ivParsed.ok) return ivParsed;
    ivBytes = normalizeToSize(ivParsed.bytes, cfg.algorithm === "AES" ? 128 : 64);
  }
  const plainParsed = parseBytes(plainText, plainEncoding, "plaintext");
  if (!plainParsed.ok) return plainParsed;
  const options = { mode: getCryptoMode(cfg.mode), padding: import_crypto_js.default.pad.Pkcs7 };
  if (cfg.mode === "CBC") {
    options.iv = bytesToWordArray(ivBytes);
  }
  try {
    const engine = getCryptoEngine(cfg.algorithm);
    const encrypted = engine.encrypt(bytesToWordArray(plainParsed.bytes), bytesToWordArray(keyBytes), options);
    const ciphertextBytes = wordArrayToBytes(encrypted.ciphertext);
    return {
      ok: true,
      algorithm: cfg.algorithm,
      mode: cfg.mode,
      keySize: cfg.keySize,
      keySizeNote: cfg.keySizeNote || void 0,
      outputEncoding,
      ciphertext: formatBytes(ciphertextBytes, outputEncoding),
      keyHex: encodeHex(keyBytes),
      ivHex: cfg.mode === "CBC" ? encodeHex(ivBytes) : ""
    };
  } catch (err) {
    return { ok: false, error: `crypto_encrypt failed: ${String(err)}` };
  }
}
async function toolCryptoDecrypt(args = {}) {
  const profiles = await loadCryptoProfiles();
  const profile = resolveProfileRef(profiles, args);
  const cfg = buildSymmetricConfig(args, profile);
  if (!cfg.keyValue) return { ok: false, error: "key/keyValue is required" };
  const cipherText = String(args.ciphertext || args.text || "");
  const cipherEncoding = String(args.cipherEncoding || args.inputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  const outputEncoding = normalizeCryptoEncoding(args.outputEncoding || "utf8");
  const keyParsed = parseBytes(cfg.keyValue, cfg.keyEncoding, "key");
  if (!keyParsed.ok) return keyParsed;
  const keyBytes = normalizeToSize(keyParsed.bytes, cfg.keySize);
  let ivBytes = new Uint8Array([]);
  if (cfg.mode === "CBC") {
    const ivParsed = parseBytes(cfg.ivValue, cfg.ivEncoding, "iv");
    if (!ivParsed.ok) return ivParsed;
    ivBytes = normalizeToSize(ivParsed.bytes, cfg.algorithm === "AES" ? 128 : 64);
  }
  const cipherParsed = parseBytes(cipherText, cipherEncoding, "ciphertext");
  if (!cipherParsed.ok) return cipherParsed;
  const options = { mode: getCryptoMode(cfg.mode), padding: import_crypto_js.default.pad.Pkcs7 };
  if (cfg.mode === "CBC") {
    options.iv = bytesToWordArray(ivBytes);
  }
  try {
    const engine = getCryptoEngine(cfg.algorithm);
    const cp = import_crypto_js.default.lib.CipherParams.create({ ciphertext: bytesToWordArray(cipherParsed.bytes) });
    const plainWordArray = engine.decrypt(cp, bytesToWordArray(keyBytes), options);
    const plainBytes = wordArrayToBytes(plainWordArray);
    return {
      ok: true,
      algorithm: cfg.algorithm,
      mode: cfg.mode,
      keySize: cfg.keySize,
      keySizeNote: cfg.keySizeNote || void 0,
      outputEncoding,
      plaintext: formatBytes(plainBytes, outputEncoding),
      keyHex: encodeHex(keyBytes),
      ivHex: cfg.mode === "CBC" ? encodeHex(ivBytes) : ""
    };
  } catch (err) {
    return { ok: false, error: `crypto_decrypt failed: ${String(err)}` };
  }
}
async function toolCryptoEncryptDirect(args = {}) {
  const next = { ...args };
  delete next.profileId;
  delete next.profileName;
  return toolCryptoEncrypt(next);
}
async function toolCryptoDecryptDirect(args = {}) {
  const next = { ...args };
  delete next.profileId;
  delete next.profileName;
  return toolCryptoDecrypt(next);
}
async function toolRSAEncrypt(args = {}) {
  const keyEncoding = String(args.publicKeyEncoding || "base64").trim().toLowerCase();
  const keyParsed = parseRSAKey(args.publicKey || "", keyEncoding, "publicKey");
  if (!keyParsed.ok) return keyParsed;
  const inputEncoding = normalizeCryptoEncoding(args.inputEncoding || "utf8");
  const outputEncoding = String(args.outputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  const hash = String(args.hash || "SHA-256").trim().toUpperCase();
  const hashName = hash === "SHA-1" || hash === "SHA-384" || hash === "SHA-512" ? hash : "SHA-256";
  const parsedText = parseBytes(String(args.plaintext || args.text || ""), inputEncoding, "plaintext");
  if (!parsedText.ok) return parsedText;
  try {
    const key = await crypto.subtle.importKey(
      "spki",
      keyParsed.bytes.buffer.slice(keyParsed.bytes.byteOffset, keyParsed.bytes.byteOffset + keyParsed.bytes.byteLength),
      { name: "RSA-OAEP", hash: hashName },
      false,
      ["encrypt"]
    );
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, key, parsedText.bytes);
    return {
      ok: true,
      algorithm: "RSA-OAEP",
      hash: hashName,
      outputEncoding,
      ciphertext: formatBytes(new Uint8Array(encrypted), outputEncoding)
    };
  } catch (err) {
    return { ok: false, error: `rsa_encrypt failed: ${String(err)}` };
  }
}
async function toolRSADecrypt(args = {}) {
  const keyEncoding = String(args.privateKeyEncoding || "base64").trim().toLowerCase();
  const keyParsed = parseRSAKey(args.privateKey || "", keyEncoding, "privateKey");
  if (!keyParsed.ok) return keyParsed;
  const inputEncoding = String(args.inputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  const outputEncoding = normalizeCryptoEncoding(args.outputEncoding || "utf8");
  const hash = String(args.hash || "SHA-256").trim().toUpperCase();
  const hashName = hash === "SHA-1" || hash === "SHA-384" || hash === "SHA-512" ? hash : "SHA-256";
  const parsedCipher = parseBytes(String(args.ciphertext || args.text || ""), inputEncoding, "ciphertext");
  if (!parsedCipher.ok) return parsedCipher;
  try {
    const key = await crypto.subtle.importKey(
      "pkcs8",
      keyParsed.bytes.buffer.slice(keyParsed.bytes.byteOffset, keyParsed.bytes.byteOffset + keyParsed.bytes.byteLength),
      { name: "RSA-OAEP", hash: hashName },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, key, parsedCipher.bytes);
    return {
      ok: true,
      algorithm: "RSA-OAEP",
      hash: hashName,
      outputEncoding,
      plaintext: formatBytes(new Uint8Array(decrypted), outputEncoding)
    };
  } catch (err) {
    return { ok: false, error: `rsa_decrypt failed: ${String(err)}` };
  }
}
async function toolRSAEncryptDirect(args = {}) {
  return toolRSAEncrypt(args);
}
async function toolRSADecryptDirect(args = {}) {
  return toolRSADecrypt(args);
}
async function toolRSAGenerateKeypair(args = {}) {
  const modulusLengthRaw = Number(args.modulusLength || 2048);
  const modulusLength = modulusLengthRaw === 1024 || modulusLengthRaw === 3072 || modulusLengthRaw === 4096 ? modulusLengthRaw : 2048;
  const hash = String(args.hash || "SHA-256").trim().toUpperCase();
  const hashName = hash === "SHA-1" || hash === "SHA-384" || hash === "SHA-512" ? hash : "SHA-256";
  const outputEncoding = String(args.outputEncoding || "base64").trim().toLowerCase() === "hex" ? "hex" : "base64";
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: hashName
      },
      true,
      ["encrypt", "decrypt"]
    );
    const spki = new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey));
    const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey));
    return {
      ok: true,
      algorithm: "RSA-OAEP",
      modulusLength,
      hash: hashName,
      outputEncoding,
      publicKey: formatBytes(spki, outputEncoding),
      privateKey: formatBytes(pkcs8, outputEncoding),
      publicKeyBase64: formatBytes(spki, "base64"),
      privateKeyBase64: formatBytes(pkcs8, "base64"),
      publicKeyHex: formatBytes(spki, "hex"),
      privateKeyHex: formatBytes(pkcs8, "hex")
    };
  } catch (err) {
    return { ok: false, error: `rsa_generate_keypair failed: ${String(err)}` };
  }
}
async function toolEncodingConvert(args = {}) {
  const fromEncoding = normalizeCryptoEncoding(args.from || args.fromEncoding || "utf8");
  const toEncoding = normalizeCryptoEncoding(args.to || args.toEncoding || "base64");
  const text = String(args.text || args.input || "");
  const parsed = parseBytes(text, fromEncoding, "input");
  if (!parsed.ok) return parsed;
  return {
    ok: true,
    fromEncoding,
    toEncoding,
    input: text,
    output: formatBytes(parsed.bytes, toEncoding)
  };
}
function normalizeHttpMethod(value) {
  const method = String(value || "GET").trim().toUpperCase();
  if (!method) return "GET";
  return method;
}
function normalizeHttpHeaders(value) {
  if (!value) return {};
  if (typeof value === "string") {
    const parsed = safeJsonParse(value, null);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    return {};
  }
  if (typeof value === "object" && !Array.isArray(value)) return value;
  return {};
}
function buildURLWithQuery(urlText, query) {
  const u = new URL(String(urlText || ""));
  if (!query) return u.toString();
  let queryObj = query;
  if (typeof query === "string") {
    queryObj = safeJsonParse(query, null);
  }
  if (queryObj && typeof queryObj === "object" && !Array.isArray(queryObj)) {
    for (const [k, v] of Object.entries(queryObj)) {
      if (typeof v === "undefined" || v === null) continue;
      u.searchParams.set(k, String(v));
    }
  }
  return u.toString();
}
async function toolHttpRequest(args = {}) {
  const method = normalizeHttpMethod(args.method);
  const rawURL = String(args.url || "").trim();
  if (!rawURL) return { ok: false, error: "url is required" };
  let finalURL = "";
  try {
    finalURL = buildURLWithQuery(rawURL, args.query);
  } catch (err) {
    return { ok: false, error: `invalid url: ${String(err)}` };
  }
  const headers = normalizeHttpHeaders(args.headers);
  const timeoutSecRaw = Number(args.timeoutSec || 30);
  const timeoutSec = Math.min(300, Math.max(3, Number.isFinite(timeoutSecRaw) ? timeoutSecRaw : 30));
  const responseEncoding = normalizeCryptoEncoding(args.responseEncoding || "utf8");
  const responseType = String(args.responseType || "text").trim().toLowerCase();
  const includeResponseHeaders = args.includeResponseHeaders !== false;
  const maxResponseCharsRaw = Number(args.maxResponseChars || 2e5);
  const maxResponseChars = Math.min(1e6, Math.max(512, Number.isFinite(maxResponseCharsRaw) ? Math.floor(maxResponseCharsRaw) : 2e5));
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch (_err) {
    }
  }, timeoutSec * 1e3);
  try {
    const fetchOptions = {
      method,
      headers,
      signal: controller.signal
    };
    if (method !== "GET" && method !== "HEAD") {
      const bodyType = String(args.bodyType || "auto").trim().toLowerCase();
      const body = args.body;
      if (bodyType === "json") {
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body ?? {});
        if (!fetchOptions.headers["Content-Type"] && !fetchOptions.headers["content-type"]) {
          fetchOptions.headers["Content-Type"] = "application/json";
        }
      } else if (typeof body !== "undefined") {
        fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
      }
    }
    const resp = await fetch(finalURL, fetchOptions);
    const respHeaders = {};
    if (includeResponseHeaders) {
      resp.headers.forEach((value, key) => {
        respHeaders[key] = value;
      });
    }
    let output = "";
    if (responseType === "arraybuffer" || responseType === "base64" || responseType === "hex") {
      const buf = new Uint8Array(await resp.arrayBuffer());
      if (responseType === "hex") {
        output = formatBytes(buf, "hex");
      } else {
        output = formatBytes(buf, "base64");
      }
    } else if (responseType === "json") {
      const json = await resp.json().catch(() => null);
      output = JSON.stringify(json, null, 2);
    } else {
      const txt = await resp.text();
      const clipped = txt.length > maxResponseChars ? `${txt.slice(0, maxResponseChars)} ...(truncated ${txt.length - maxResponseChars} chars)` : txt;
      if (responseEncoding === "utf8") {
        output = clipped;
      } else {
        output = formatBytes(new TextEncoder().encode(clipped), responseEncoding);
      }
    }
    return {
      ok: true,
      url: finalURL,
      method,
      status: resp.status,
      statusText: resp.statusText,
      headers: respHeaders,
      body: output
    };
  } catch (err) {
    return { ok: false, error: `http_request failed: ${String(err)}`, url: finalURL, method };
  } finally {
    clearTimeout(timeoutId);
  }
}
function secureRandomUint32() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] >>> 0;
}
function randomIntInRange(min, max) {
  const lo = Math.ceil(Number(min));
  const hi = Math.floor(Number(max));
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo) {
    throw new Error("invalid range");
  }
  const range = hi - lo + 1;
  if (range <= 0) {
    throw new Error("range too large");
  }
  const maxUint = 4294967296;
  const limit2 = maxUint - maxUint % range;
  let x = 0;
  do {
    x = secureRandomUint32();
  } while (x >= limit2);
  return lo + x % range;
}
function randomFloatInRange(min, max) {
  const lo = Number(min);
  const hi = Number(max);
  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo) {
    throw new Error("invalid range");
  }
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const unit = arr[0] / 4294967295;
  return lo + (hi - lo) * unit;
}
function randomBytes(size) {
  const n = Math.max(1, Math.floor(Number(size || 16)));
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}
function bytesToUuidV4(bytes16) {
  const b = bytes16 instanceof Uint8Array ? bytes16.slice(0, 16) : randomBytes(16);
  b[6] = b[6] & 15 | 64;
  b[8] = b[8] & 63 | 128;
  const hex = encodeHex(b);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
function buildRandomCharset(args = {}) {
  const custom = String(args.customChars || args.chars || "");
  if (custom) return custom;
  const type = String(args.charset || "alnum").trim().toLowerCase();
  if (type === "numeric" || type === "number" || type === "digits") return "0123456789";
  if (type === "alpha" || type === "letters") return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (type === "lower") return "abcdefghijklmnopqrstuvwxyz";
  if (type === "upper") return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (type === "hex") return "0123456789abcdef";
  if (type === "base64") return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  if (type === "base64url") return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  return "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
}
async function toolRandomUUID() {
  const value = bytesToUuidV4(randomBytes(16));
  return { ok: true, uuid: value };
}
async function toolRandomUUID32() {
  const value = bytesToUuidV4(randomBytes(16)).replace(/-/g, "");
  return { ok: true, uuid32: value };
}
async function toolRandomString(args = {}) {
  const length = Math.max(1, Math.min(4096, Math.floor(Number(args.length || 16))));
  const chars = buildRandomCharset(args);
  if (!chars) return { ok: false, error: "charset is empty" };
  const uniq = Array.from(new Set(chars.split("")));
  if (uniq.length === 0) return { ok: false, error: "charset is empty" };
  let out = "";
  for (let i = 0; i < length; i += 1) {
    const idx = randomIntInRange(0, uniq.length - 1);
    out += uniq[idx];
  }
  return {
    ok: true,
    length,
    charset: String(args.charset || (args.customChars ? "custom" : "alnum")),
    value: out
  };
}
async function toolRandomNumber(args = {}) {
  const min = Number(Object.prototype.hasOwnProperty.call(args, "min") ? args.min : 0);
  const max = Number(Object.prototype.hasOwnProperty.call(args, "max") ? args.max : 100);
  const integer = args.integer !== false;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    return { ok: false, error: "invalid range: min/max" };
  }
  if (integer) {
    try {
      const value = randomIntInRange(min, max);
      return { ok: true, min, max, integer: true, value };
    } catch (err) {
      return { ok: false, error: `random_number failed: ${String(err)}` };
    }
  }
  const precisionRaw = Number(args.precision);
  const precision = Number.isFinite(precisionRaw) ? Math.max(0, Math.min(12, Math.floor(precisionRaw))) : null;
  try {
    let value = randomFloatInRange(min, max);
    if (precision !== null) {
      value = Number(value.toFixed(precision));
    }
    return { ok: true, min, max, integer: false, precision: precision === null ? void 0 : precision, value };
  } catch (err) {
    return { ok: false, error: `random_number failed: ${String(err)}` };
  }
}
function normalizeDigestAlgorithm(value) {
  const raw = String(value || "").trim().toUpperCase().replace(/-/g, "");
  if (raw === "MD5") return "MD5";
  if (raw === "SHA1") return "SHA1";
  if (raw === "SHA256") return "SHA256";
  if (raw === "SHA512") return "SHA512";
  return "SHA256";
}
function computeDigestWordArray(algorithm, wordArray) {
  const algo = normalizeDigestAlgorithm(algorithm);
  if (algo === "MD5") return import_crypto_js.default.MD5(wordArray);
  if (algo === "SHA1") return import_crypto_js.default.SHA1(wordArray);
  if (algo === "SHA512") return import_crypto_js.default.SHA512(wordArray);
  return import_crypto_js.default.SHA256(wordArray);
}
function computeHmacWordArray(algorithm, messageWordArray, keyWordArray) {
  const algo = normalizeDigestAlgorithm(algorithm);
  if (algo === "MD5") return import_crypto_js.default.HmacMD5(messageWordArray, keyWordArray);
  if (algo === "SHA1") return import_crypto_js.default.HmacSHA1(messageWordArray, keyWordArray);
  if (algo === "SHA512") return import_crypto_js.default.HmacSHA512(messageWordArray, keyWordArray);
  return import_crypto_js.default.HmacSHA256(messageWordArray, keyWordArray);
}
async function toolHashDigest(args = {}) {
  const text = String(args.text || args.input || "");
  const inputEncoding = normalizeCryptoEncoding(args.inputEncoding || "utf8");
  const outputEncoding = String(args.outputEncoding || "hex").trim().toLowerCase() === "base64" ? "base64" : "hex";
  const parsed = parseBytes(text, inputEncoding, "input");
  if (!parsed.ok) return parsed;
  try {
    const digestWordArray = computeDigestWordArray(args.algorithm || "SHA256", bytesToWordArray(parsed.bytes));
    const digestBytes = wordArrayToBytes(digestWordArray);
    return {
      ok: true,
      algorithm: normalizeDigestAlgorithm(args.algorithm || "SHA256"),
      inputEncoding,
      outputEncoding,
      digest: formatBytes(digestBytes, outputEncoding)
    };
  } catch (err) {
    return { ok: false, error: `hash_digest failed: ${String(err)}` };
  }
}
async function toolHmacSign(args = {}) {
  const text = String(args.text || args.input || "");
  const key = String(args.key || "");
  if (!key) return { ok: false, error: "key is required" };
  const inputEncoding = normalizeCryptoEncoding(args.inputEncoding || "utf8");
  const keyEncoding = normalizeCryptoEncoding(args.keyEncoding || "utf8");
  const outputEncoding = String(args.outputEncoding || "hex").trim().toLowerCase() === "base64" ? "base64" : "hex";
  const parsedText = parseBytes(text, inputEncoding, "input");
  if (!parsedText.ok) return parsedText;
  const parsedKey = parseBytes(key, keyEncoding, "key");
  if (!parsedKey.ok) return parsedKey;
  try {
    const macWordArray = computeHmacWordArray(
      args.algorithm || "SHA256",
      bytesToWordArray(parsedText.bytes),
      bytesToWordArray(parsedKey.bytes)
    );
    const macBytes = wordArrayToBytes(macWordArray);
    return {
      ok: true,
      algorithm: normalizeDigestAlgorithm(args.algorithm || "SHA256"),
      inputEncoding,
      keyEncoding,
      outputEncoding,
      hmac: formatBytes(macBytes, outputEncoding)
    };
  } catch (err) {
    return { ok: false, error: `hmac_sign failed: ${String(err)}` };
  }
}
async function toolUrlEncode(args = {}) {
  const text = String(args.text || "");
  const component = args.component !== false;
  try {
    return { ok: true, encoded: component ? encodeURIComponent(text) : encodeURI(text), component };
  } catch (err) {
    return { ok: false, error: `url_encode failed: ${String(err)}` };
  }
}
async function toolUrlDecode(args = {}) {
  const text = String(args.text || "");
  const component = args.component !== false;
  const plusAsSpace = !!args.plusAsSpace;
  try {
    const input = plusAsSpace ? text.replace(/\+/g, "%20") : text;
    return { ok: true, decoded: component ? decodeURIComponent(input) : decodeURI(input), component, plusAsSpace };
  } catch (err) {
    return { ok: false, error: `url_decode failed: ${String(err)}` };
  }
}
function decodeBase64URL(text) {
  const raw = String(text || "").trim().replace(/-/g, "+").replace(/_/g, "/");
  const pad = raw.length % 4 === 0 ? "" : "=".repeat(4 - raw.length % 4);
  return decodeBase64(raw + pad);
}
function parseJsonLoose(text) {
  try {
    return JSON.parse(String(text || ""));
  } catch (_err) {
    return null;
  }
}
async function toolJwtDecode(args = {}) {
  const token = String(args.token || "").trim();
  if (!token) return { ok: false, error: "token is required" };
  const parts = token.split(".");
  if (parts.length < 2) return { ok: false, error: "invalid jwt token" };
  const headerBytes = decodeBase64URL(parts[0]);
  const payloadBytes = decodeBase64URL(parts[1]);
  if (!headerBytes || !payloadBytes) return { ok: false, error: "invalid base64url in jwt" };
  const headerText = new TextDecoder().decode(headerBytes);
  const payloadText = new TextDecoder().decode(payloadBytes);
  return {
    ok: true,
    header: parseJsonLoose(headerText) ?? headerText,
    payload: parseJsonLoose(payloadText) ?? payloadText,
    signature: parts[2] || "",
    validFormat: parts.length >= 3
  };
}
function parseJsonPath(pathText) {
  const path2 = String(pathText || "").trim();
  if (!path2 || path2[0] !== "$") return { ok: false, error: "jsonpath must start with $" };
  const tokens = [];
  let i = 1;
  while (i < path2.length) {
    const ch = path2[i];
    if (ch === ".") {
      i += 1;
      if (path2[i] === "*") {
        tokens.push({ type: "wildcard" });
        i += 1;
        continue;
      }
      let j = i;
      while (j < path2.length && /[A-Za-z0-9_$-]/.test(path2[j])) j += 1;
      if (j === i) return { ok: false, error: `invalid token near . at ${i}` };
      tokens.push({ type: "prop", key: path2.slice(i, j) });
      i = j;
      continue;
    }
    if (ch === "[") {
      i += 1;
      if (path2[i] === "*") {
        i += 1;
        if (path2[i] !== "]") return { ok: false, error: "expected ] after [*]" };
        tokens.push({ type: "wildcard" });
        i += 1;
        continue;
      }
      if (path2[i] === "'" || path2[i] === '"') {
        const quote = path2[i];
        i += 1;
        let j2 = i;
        while (j2 < path2.length && path2[j2] !== quote) j2 += 1;
        if (j2 >= path2.length) return { ok: false, error: "unterminated quoted property" };
        const key = path2.slice(i, j2);
        j2 += 1;
        if (path2[j2] !== "]") return { ok: false, error: "expected ] after quoted property" };
        tokens.push({ type: "prop", key });
        i = j2 + 1;
        continue;
      }
      let j = i;
      while (j < path2.length && /[-0-9]/.test(path2[j])) j += 1;
      const indexText = path2.slice(i, j);
      if (!indexText || !/^-?\d+$/.test(indexText)) return { ok: false, error: `invalid array index near ${i}` };
      if (path2[j] !== "]") return { ok: false, error: "expected ] after index" };
      tokens.push({ type: "index", index: Number(indexText) });
      i = j + 1;
      continue;
    }
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    return { ok: false, error: `unexpected token '${ch}' at ${i}` };
  }
  return { ok: true, tokens };
}
function applyJsonPath(root, tokens) {
  let nodes = [root];
  for (const token of tokens) {
    const next = [];
    for (const node of nodes) {
      if (token.type === "prop") {
        if (node && typeof node === "object" && Object.prototype.hasOwnProperty.call(node, token.key)) {
          next.push(node[token.key]);
        }
      } else if (token.type === "index") {
        if (Array.isArray(node)) {
          const idx = token.index < 0 ? node.length + token.index : token.index;
          if (idx >= 0 && idx < node.length) next.push(node[idx]);
        }
      } else if (token.type === "wildcard") {
        if (Array.isArray(node)) {
          for (const item of node) next.push(item);
        } else if (node && typeof node === "object") {
          for (const value of Object.values(node)) next.push(value);
        }
      }
    }
    nodes = next;
  }
  return nodes;
}
async function toolJsonpathQuery(args = {}) {
  const path2 = String(args.path || "").trim();
  if (!path2) return { ok: false, error: "path is required" };
  let input = args.json;
  if (typeof input === "string") {
    input = safeJsonParse(input, null);
  }
  if (typeof input === "undefined" || input === null) {
    return { ok: false, error: "json input is required" };
  }
  const parsed = parseJsonPath(path2);
  if (!parsed.ok) return parsed;
  const results = applyJsonPath(input, parsed.tokens);
  const firstOnly = !!args.firstOnly;
  return {
    ok: true,
    path: path2,
    count: results.length,
    result: firstOnly ? results[0] ?? null : results
  };
}
async function toolRegexExtract(args = {}) {
  const text = String(args.text || "");
  const pattern = String(args.pattern || "");
  if (!pattern) return { ok: false, error: "pattern is required" };
  const rawFlags = String(args.flags || "").toLowerCase().replace(/[^gimsuy]/g, "");
  const all = args.all !== false;
  const group = Number.isFinite(Number(args.group)) ? Number(args.group) : 0;
  const limitRaw = Number(args.limit || 50);
  const limit2 = Math.max(1, Math.min(500, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 50));
  try {
    if (!all) {
      const reg2 = new RegExp(pattern, rawFlags.replace(/g/g, ""));
      const m2 = reg2.exec(text);
      if (!m2) return { ok: true, matched: false, match: null };
      return {
        ok: true,
        matched: true,
        match: {
          index: m2.index,
          full: m2[0],
          groups: Array.from(m2).slice(1),
          value: typeof m2[group] === "undefined" ? null : m2[group]
        }
      };
    }
    const flags = rawFlags.includes("g") ? rawFlags : `${rawFlags}g`;
    const reg = new RegExp(pattern, flags);
    const list = [];
    let m;
    while ((m = reg.exec(text)) && list.length < limit2) {
      list.push({
        index: m.index,
        full: m[0],
        groups: Array.from(m).slice(1),
        value: typeof m[group] === "undefined" ? null : m[group]
      });
      if (m[0] === "") {
        reg.lastIndex += 1;
      }
    }
    return { ok: true, matched: list.length > 0, count: list.length, matches: list };
  } catch (err) {
    return { ok: false, error: `regex_extract failed: ${String(err)}` };
  }
}
function maskSecret(value) {
  const raw = String(value || "");
  if (!raw) return "";
  if (raw.length <= 8) return "****";
  return `${raw.slice(0, 3)}***${raw.slice(-3)}`;
}
function findMcpServiceByArgs(list, args = {}) {
  const id = String(args.serviceId || args.id || "").trim();
  const name = String(args.serviceName || args.name || "").trim().toLowerCase();
  const index = Number(args.index);
  if (id) {
    const item = list.find((x) => x.id === id);
    if (item) return item;
  }
  if (name) {
    const item = list.find((x) => String(x.name || "").trim().toLowerCase() === name);
    if (item) return item;
  }
  if (Number.isInteger(index) && index >= 0 && index < list.length) {
    return list[index];
  }
  return null;
}
function pickMcpPayload(args = {}) {
  if (args.service && typeof args.service === "object" && !Array.isArray(args.service)) {
    return args.service;
  }
  const out = {};
  const fields = ["id", "name", "enabled", "transport", "baseURL", "apiKey", "mcpHeaders", "headers", "command", "args", "envText"];
  for (const field of fields) {
    if (Object.prototype.hasOwnProperty.call(args, field)) {
      out[field] = args[field];
    }
  }
  return out;
}
async function toolMcpServiceList(args = {}) {
  const settings = await getSettings();
  const includeSecret = !!args.includeSecret;
  const list = normalizeMcpServices(settings.mcpServices || []);
  const services = includeSecret ? list : list.map((item) => ({
    ...item,
    apiKey: maskSecret(item.apiKey),
    mcpHeaders: Array.isArray(item.mcpHeaders) ? item.mcpHeaders.map((h) => ({
      ...h,
      value: maskSecret(h?.value)
    })) : []
  }));
  return { ok: true, count: services.length, services };
}
async function toolMcpServiceUpsert(args = {}) {
  const settings = await getSettings();
  const current = normalizeMcpServices(settings.mcpServices || []);
  const payload = pickMcpPayload(args);
  const found = findMcpServiceByArgs(current, args);
  const requestedName = String(args.serviceName || "").trim();
  const merged = normalizeMcpService({
    ...found || {},
    ...payload,
    name: String(payload.name || requestedName || found?.name || ""),
    id: String(payload.id || found?.id || createMcpServiceId())
  });
  if (!String(merged.name || "").trim()) {
    merged.name = `MCP-${merged.transport}-${merged.id.slice(-6)}`;
  }
  const next = current.filter((item) => item.id !== merged.id);
  next.push(merged);
  await saveSettings({ ...settings || {}, mcpServices: next });
  return { ok: true, action: found ? "updated" : "created", service: merged, count: next.length };
}
async function toolMcpServiceSetEnabled(args = {}) {
  const settings = await getSettings();
  const current = normalizeMcpServices(settings.mcpServices || []);
  const found = findMcpServiceByArgs(current, args);
  if (!found) return { ok: false, error: "mcp service not found" };
  const enabled = args.enabled !== false;
  const next = current.map((item) => item.id === found.id ? { ...item, enabled } : item);
  await saveSettings({ ...settings || {}, mcpServices: next });
  return { ok: true, serviceId: found.id, enabled };
}
async function toolMcpServiceTest(args = {}) {
  const settings = await getSettings();
  const current = normalizeMcpServices(settings.mcpServices || []);
  let service = null;
  if (args.service && typeof args.service === "object") {
    service = normalizeMcpService(args.service);
  } else {
    service = findMcpServiceByArgs(current, args);
  }
  if (!service) return { ok: false, error: "mcp service not found" };
  const result = await fetchMCPToolsForService(service);
  if (!result.ok) {
    return { ok: false, service: { id: service.id, name: service.name, transport: service.transport, baseURL: service.baseURL }, error: result.error || "test failed" };
  }
  const tools = Array.isArray(result.tools) ? result.tools : [];
  return {
    ok: true,
    service: { id: service.id, name: service.name, transport: service.transport, baseURL: service.baseURL },
    toolCount: tools.length,
    toolNames: tools.map((t) => String(t?.name || "").trim()).filter(Boolean).slice(0, 200)
  };
}
async function waitTabComplete(tabId, timeoutMs = 15e3) {
  const timeout = Math.max(1e3, Number(timeoutMs || 0));
  try {
    const current = await chrome.tabs.get(tabId);
    if (current?.status === "complete") {
      return { ok: true, timeout: false };
    }
  } catch (_err) {
  }
  return await new Promise((resolve) => {
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      chrome.tabs.onRemoved.removeListener(onRemoved);
    };
    const finish = (value) => {
      cleanup();
      resolve(value);
    };
    const onUpdated = (updatedTabId, info) => {
      if (updatedTabId !== tabId) return;
      if (info?.status === "complete") {
        finish({ ok: true, timeout: false });
      }
    };
    const onRemoved = (removedTabId) => {
      if (removedTabId !== tabId) return;
      finish({ ok: false, timeout: false, error: "tab was closed" });
    };
    const timer = setTimeout(() => {
      finish({ ok: false, timeout: true, error: `tab load timeout after ${Math.ceil(timeout / 1e3)}s` });
    }, timeout);
    chrome.tabs.onUpdated.addListener(onUpdated);
    chrome.tabs.onRemoved.addListener(onRemoved);
  });
}
async function toolOpenURL(tabId, args = {}) {
  const url = String(args.url || args.href || "").trim();
  if (!url) return { ok: false, error: "url is required" };
  let parsed = null;
  try {
    parsed = new URL(url);
  } catch (_err) {
    return { ok: false, error: "invalid url" };
  }
  const protocol = String(parsed.protocol || "").toLowerCase();
  const allowProtocol = protocol === "http:" || protocol === "https:" || protocol === "file:" || protocol === "about:";
  if (!allowProtocol) {
    return { ok: false, error: `unsupported protocol: ${protocol}` };
  }
  const waitUntilComplete = args.waitUntilComplete !== false;
  const timeoutSec = Number(args.timeoutSec || 20);
  const timeoutMs = Math.max(1e3, Math.min(12e4, Number.isFinite(timeoutSec) ? timeoutSec * 1e3 : 2e4));
  try {
    await chrome.tabs.update(tabId, { url: parsed.toString() });
    if (waitUntilComplete) {
      const waitResult = await waitTabComplete(tabId, timeoutMs);
      if (!waitResult.ok) {
        return { ok: false, error: waitResult.error || "tab load failed", timeout: !!waitResult.timeout, url: parsed.toString() };
      }
    }
    const current = await chrome.tabs.get(tabId);
    return {
      ok: true,
      url: String(current?.url || parsed.toString()),
      title: String(current?.title || ""),
      status: String(current?.status || "")
    };
  } catch (err) {
    return { ok: false, error: String(err || "open_url failed"), url: parsed.toString() };
  }
}
async function sleepMs(ms) {
  const wait = Math.max(0, Number(ms || 0));
  if (!wait) return;
  await new Promise((resolve) => setTimeout(resolve, wait));
}
async function toolWaitForElement(tabId, args = {}) {
  const selector = String(args.selector || "").trim();
  if (!selector) return { ok: false, error: "selector is required" };
  const text = String(args.text || "").trim();
  const exact = !!args.exact;
  const visibleOnly = args.visibleOnly !== false;
  const timeoutSecRaw = Number(args.timeoutSec || 15);
  const timeoutSec = Math.max(1, Math.min(120, Number.isFinite(timeoutSecRaw) ? timeoutSecRaw : 15));
  const intervalMsRaw = Number(args.intervalMs || 250);
  const intervalMs = Math.max(50, Math.min(2e3, Number.isFinite(intervalMsRaw) ? intervalMsRaw : 250));
  const start = Date.now();
  const deadline = start + timeoutSec * 1e3;
  let lastCount = 0;
  while (Date.now() <= deadline) {
    const result = await execOnTab(tabId, (sel, targetText, useExact, onlyVisible) => {
      const normalize = (v) => String(v || "").replace(/\s+/g, " ").trim();
      const isVisible = (el) => {
        if (!onlyVisible) return true;
        const style = window.getComputedStyle(el);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };
      const getText = (el) => normalize(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || "");
      const list = Array.from(document.querySelectorAll(sel)).filter((el) => {
        if (!isVisible(el)) return false;
        if (!targetText) return true;
        const t = getText(el);
        return useExact ? t === targetText : t.includes(targetText);
      });
      const first = list[0] || null;
      return {
        ok: true,
        found: list.length > 0,
        count: list.length,
        first: first ? {
          tag: String(first.tagName || "").toLowerCase(),
          text: getText(first).slice(0, 240)
        } : null
      };
    }, [selector, text, exact, visibleOnly]);
    if (result?.ok && result.found) {
      return {
        ok: true,
        selector,
        count: Number(result.count || 0),
        first: result.first || null,
        elapsedMs: Date.now() - start
      };
    }
    lastCount = Number(result?.count || 0);
    await sleepMs(intervalMs);
  }
  return {
    ok: false,
    error: `wait_for_element timeout after ${timeoutSec}s`,
    selector,
    count: lastCount,
    elapsedMs: Date.now() - start
  };
}
async function toolAssertPageState(tabId, args = {}) {
  const checks = Array.isArray(args.checks) ? args.checks : [];
  if (checks.length === 0) {
    return { ok: false, error: "checks is required and must be non-empty array" };
  }
  const normalizedChecks = checks.slice(0, 50).map((item) => item && typeof item === "object" ? item : {});
  const pageInfo = await execOnTab(tabId, () => ({
    ok: true,
    url: location.href,
    title: document.title || "",
    bodyText: String(document.body?.innerText || "").slice(0, 3e5)
  }));
  const results = [];
  for (const check of normalizedChecks) {
    const type = String(check.type || "").trim().toLowerCase();
    if (type === "selector") {
      const selector = String(check.selector || "").trim();
      if (!selector) {
        results.push({ ok: false, type, error: "selector is required" });
        continue;
      }
      const text = String(check.text || "").trim();
      const exact = !!check.exact;
      const visibleOnly = check.visibleOnly !== false;
      const minCountRaw = Number(check.minCount);
      const maxCountRaw = Number(check.maxCount);
      const minCount = Number.isFinite(minCountRaw) ? Math.max(0, Math.floor(minCountRaw)) : 1;
      const maxCount = Number.isFinite(maxCountRaw) ? Math.max(minCount, Math.floor(maxCountRaw)) : Number.POSITIVE_INFINITY;
      const data = await execOnTab(tabId, (sel, targetText, useExact, onlyVisible) => {
        const normalize = (v) => String(v || "").replace(/\s+/g, " ").trim();
        const isVisible = (el) => {
          if (!onlyVisible) return true;
          const style = window.getComputedStyle(el);
          if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        };
        const getText = (el) => normalize(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || "");
        const list = Array.from(document.querySelectorAll(sel)).filter((el) => {
          if (!isVisible(el)) return false;
          if (!targetText) return true;
          const t = getText(el);
          return useExact ? t === targetText : t.includes(targetText);
        });
        return { ok: true, count: list.length };
      }, [selector, text, exact, visibleOnly]);
      const count = Number(data?.count || 0);
      const pass = count >= minCount && count <= maxCount;
      results.push({
        ok: pass,
        type,
        selector,
        count,
        minCount,
        maxCount: Number.isFinite(maxCount) ? maxCount : null
      });
      continue;
    }
    if (type === "url") {
      const contains = String(check.contains || check.value || "").trim();
      if (!contains) {
        results.push({ ok: false, type, error: "contains is required" });
        continue;
      }
      const current = String(pageInfo?.url || "");
      results.push({ ok: current.includes(contains), type, contains, current });
      continue;
    }
    if (type === "title") {
      const contains = String(check.contains || check.value || "").trim();
      if (!contains) {
        results.push({ ok: false, type, error: "contains is required" });
        continue;
      }
      const current = String(pageInfo?.title || "");
      results.push({ ok: current.includes(contains), type, contains, current });
      continue;
    }
    if (type === "page_text") {
      const contains = String(check.contains || check.value || "").trim();
      if (!contains) {
        results.push({ ok: false, type, error: "contains is required" });
        continue;
      }
      const current = String(pageInfo?.bodyText || "");
      results.push({ ok: current.includes(contains), type, contains, matched: current.includes(contains) });
      continue;
    }
    results.push({ ok: false, type, error: "unsupported check type, use selector/url/title/page_text" });
  }
  const passed = results.filter((item) => item.ok).length;
  const failed = results.length - passed;
  return {
    ok: failed === 0,
    passed,
    failed,
    total: results.length,
    results
  };
}
function toolToolList(args = {}, ctx = {}) {
  const includeParameters = !!args.includeParameters;
  const includeDescription = args.includeDescription !== false;
  const all = buildToolSpecs(!!ctx?.settings?.allowScript, ctx?.mcpRegistry?.toolSpecs || []);
  const tools = all.map((item) => {
    const fn = item?.function || {};
    const row = {
      name: String(fn.name || ""),
      source: String(fn.name || "").startsWith("mcp_") ? "mcp" : "local"
    };
    if (includeDescription) {
      row.description = String(fn.description || "");
    }
    if (includeParameters) {
      row.parameters = fn.parameters || {};
    }
    return row;
  }).filter((item) => item.name);
  return { ok: true, count: tools.length, tools };
}
async function toolBatchExecute(args = {}, ctx = {}) {
  const steps = Array.isArray(args.steps) ? args.steps : [];
  if (!steps.length) return { ok: false, error: "steps is required and must be non-empty array" };
  const stopOnError = args.stopOnError !== false;
  const maxStepsRaw = Number(args.maxSteps || 20);
  const maxSteps = Math.max(1, Math.min(100, Number.isFinite(maxStepsRaw) ? Math.floor(maxStepsRaw) : 20));
  const runList = steps.slice(0, maxSteps);
  const results = [];
  for (let i = 0; i < runList.length; i += 1) {
    const step = runList[i] && typeof runList[i] === "object" ? runList[i] : {};
    const name = String(step.name || step.tool || "").trim();
    let stepArgs = {};
    if (step.args && typeof step.args === "object") {
      stepArgs = step.args;
    } else if (typeof step.args === "string") {
      try {
        const parsed = JSON.parse(step.args);
        if (parsed && typeof parsed === "object") {
          stepArgs = parsed;
        }
      } catch (_err) {
      }
    }
    if (!name) {
      const bad = { ok: false, error: "step.name is required", index: i };
      results.push({ index: i, name: "", result: bad });
      if (stopOnError) break;
      continue;
    }
    if (name === "batch_execute") {
      const bad = { ok: false, error: "nested batch_execute is not allowed", index: i };
      results.push({ index: i, name, result: bad });
      if (stopOnError) break;
      continue;
    }
    const call = {
      id: `batch_${Date.now()}_${i}`,
      function: {
        name,
        arguments: JSON.stringify(stepArgs || {})
      }
    };
    const toolResult = await executeToolCall(call, {
      ...ctx,
      depth: Number(ctx?.depth || 0) + 1
    });
    results.push({ index: i, name, result: toolResult });
    if (stopOnError && !toolResult?.ok) {
      break;
    }
  }
  const failed = results.filter((item) => !item?.result?.ok).length;
  return {
    ok: failed === 0,
    total: runList.length,
    executed: results.length,
    failed,
    results
  };
}
async function toolClickElement(tabId, args = {}) {
  const selector = String(args.selector || "button,a,[role='button'],input[type='button'],input[type='submit']").trim();
  const text = String(args.text || "").trim();
  const exact = !!args.exact;
  const all = !!args.all;
  const index = Math.max(0, Number.isFinite(Number(args.index)) ? Math.floor(Number(args.index)) : 0);
  const visibleOnly = args.visibleOnly !== false;
  if (!selector) return { ok: false, error: "selector is required" };
  return execOnTab(tabId, (sel, targetText, useExact, clickAll, idx, onlyVisible) => {
    const normalize = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const isVisible = (el) => {
      if (!onlyVisible) return true;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };
    const getText = (el) => normalize(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || "");
    const getSelector = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        let part = cur.tagName.toLowerCase();
        if (cur.classList?.length) {
          part += "." + Array.from(cur.classList).slice(0, 2).map((x) => CSS.escape(x)).join(".");
        }
        if (cur.parentElement) {
          const same = Array.from(cur.parentElement.children).filter((n) => n.tagName === cur.tagName);
          if (same.length > 1) part += `:nth-of-type(${same.indexOf(cur) + 1})`;
        }
        parts.unshift(part);
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };
    let list = Array.from(document.querySelectorAll(sel)).filter((el) => isVisible(el));
    if (targetText) {
      list = list.filter((el) => {
        const t = getText(el);
        return useExact ? t === targetText : t.includes(targetText);
      });
    }
    if (!list.length) return { ok: false, error: "no element matched" };
    const targets = clickAll ? list : [list[Math.min(idx, list.length - 1)]];
    let clicked = 0;
    const details = [];
    for (const el of targets) {
      try {
        el.scrollIntoView({ behavior: "auto", block: "center", inline: "center" });
      } catch (_err) {
      }
      try {
        el.click();
        clicked += 1;
        details.push({ tag: el.tagName.toLowerCase(), text: getText(el).slice(0, 200), selector: getSelector(el) });
      } catch (_err) {
      }
    }
    return { ok: true, clicked, matches: list.length, targets: details };
  }, [selector, text, exact, all, index, visibleOnly]);
}
async function toolInputText(tabId, args = {}) {
  const selector = String(args.selector || "").trim();
  const text = String(args.text || "");
  const append = !!args.append;
  const all = !!args.all;
  const index = Math.max(0, Number.isFinite(Number(args.index)) ? Math.floor(Number(args.index)) : 0);
  if (!selector) return { ok: false, error: "selector is required" };
  return execOnTab(tabId, (sel, value, doAppend, inputAll, idx) => {
    const list = Array.from(document.querySelectorAll(sel));
    if (!list.length) return { ok: false, error: "no element matched" };
    const targets = inputAll ? list : [list[Math.min(idx, list.length - 1)]];
    let updated = 0;
    const details = [];
    for (const el of targets) {
      let oldValue = "";
      let nextValue = "";
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        oldValue = String(el.value || "");
        nextValue = doAppend ? oldValue + value : value;
        el.focus();
        el.value = nextValue;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        updated += 1;
      } else if (el && el.isContentEditable) {
        oldValue = String(el.innerText || "");
        nextValue = doAppend ? oldValue + value : value;
        el.focus();
        el.innerText = nextValue;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        updated += 1;
      }
      details.push({
        tag: el?.tagName?.toLowerCase?.() || "",
        oldValue: oldValue.slice(0, 200),
        newValue: nextValue.slice(0, 200)
      });
    }
    return { ok: true, updated, matches: list.length, targets: details };
  }, [selector, text, append, all, index]);
}
async function toolSelectOption(tabId, args = {}) {
  const selector = String(args.selector || "").trim();
  const byValue = Object.prototype.hasOwnProperty.call(args, "value") ? String(args.value || "") : "";
  const byText = Object.prototype.hasOwnProperty.call(args, "text") ? String(args.text || "") : "";
  const byIndex = Number.isFinite(Number(args.optionIndex)) ? Math.floor(Number(args.optionIndex)) : null;
  const all = !!args.all;
  const index = Math.max(0, Number.isFinite(Number(args.index)) ? Math.floor(Number(args.index)) : 0);
  if (!selector) return { ok: false, error: "selector is required" };
  return execOnTab(tabId, (sel, value, text, optionIndex, selectAll, idx) => {
    const list = Array.from(document.querySelectorAll(sel)).filter((el) => el instanceof HTMLSelectElement);
    if (!list.length) return { ok: false, error: "no select matched" };
    const targets = selectAll ? list : [list[Math.min(idx, list.length - 1)]];
    let updated = 0;
    const details = [];
    for (const el of targets) {
      let selectedIndex = -1;
      if (Number.isInteger(optionIndex) && optionIndex >= 0 && optionIndex < el.options.length) {
        selectedIndex = optionIndex;
      } else if (value) {
        selectedIndex = Array.from(el.options).findIndex((opt) => String(opt.value) === value);
      } else if (text) {
        selectedIndex = Array.from(el.options).findIndex((opt) => String(opt.text || "").trim() === text);
      } else {
        selectedIndex = 0;
      }
      if (selectedIndex >= 0) {
        el.selectedIndex = selectedIndex;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        updated += 1;
        const opt = el.options[selectedIndex];
        details.push({
          selectedIndex,
          selectedValue: String(opt?.value || ""),
          selectedText: String(opt?.text || "")
        });
      }
    }
    return { ok: true, updated, matches: list.length, targets: details };
  }, [selector, byValue, byText, byIndex, all, index]);
}
async function toolScrollTo(tabId, args = {}) {
  const selector = String(args.selector || "").trim();
  const top = Number(args.top);
  const left = Number(args.left);
  const behavior = String(args.behavior || "auto").trim().toLowerCase() === "smooth" ? "smooth" : "auto";
  return execOnTab(tabId, (sel, y, x, scrollBehavior) => {
    if (sel) {
      const el = document.querySelector(sel);
      if (!el) return { ok: false, error: "selector not found" };
      el.scrollIntoView({ behavior: scrollBehavior, block: "center", inline: "center" });
      const rect = el.getBoundingClientRect();
      return { ok: true, mode: "element", rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, scroll: { x: window.scrollX, y: window.scrollY } };
    }
    const nextTop = Number.isFinite(y) ? y : window.scrollY;
    const nextLeft = Number.isFinite(x) ? x : window.scrollX;
    window.scrollTo({ top: nextTop, left: nextLeft, behavior: scrollBehavior });
    return { ok: true, mode: "position", scroll: { x: window.scrollX, y: window.scrollY } };
  }, [selector, top, left, behavior]);
}
async function toolQueryByText(tabId, args = {}) {
  const text = String(args.text || "").trim();
  if (!text) return { ok: false, error: "text is required" };
  const selector = String(args.selector || "*").trim() || "*";
  const exact = !!args.exact;
  const ignoreCase = args.ignoreCase !== false;
  const limit2 = Math.max(1, Math.min(200, Number.isFinite(Number(args.limit)) ? Math.floor(Number(args.limit)) : 20));
  return execOnTab(tabId, (targetText, sel, useExact, ci, maxCount) => {
    const norm = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const match = (value) => {
      const a = ci ? norm(value).toLowerCase() : norm(value);
      const b = ci ? targetText.toLowerCase() : targetText;
      return useExact ? a === b : a.includes(b);
    };
    const getSelector = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        let part = cur.tagName.toLowerCase();
        if (cur.classList?.length) {
          part += "." + Array.from(cur.classList).slice(0, 2).map((x) => CSS.escape(x)).join(".");
        }
        parts.unshift(part);
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };
    const skipTags = /* @__PURE__ */ new Set(["script", "style", "noscript"]);
    const out = [];
    const nodes = Array.from(document.querySelectorAll(sel));
    for (const el of nodes) {
      const tag = String(el.tagName || "").toLowerCase();
      if (skipTags.has(tag)) continue;
      const value = norm(el.innerText || el.textContent || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "");
      if (!value) continue;
      if (!match(value)) continue;
      out.push({
        tag,
        text: value.slice(0, 260),
        selector: getSelector(el)
      });
      if (out.length >= maxCount) break;
    }
    return { ok: true, count: out.length, items: out };
  }, [text, selector, exact, ignoreCase, limit2]);
}
async function toolExtractTable(tabId, args = {}) {
  const selector = String(args.selector || "table").trim() || "table";
  const maxTables = Math.max(1, Math.min(20, Number.isFinite(Number(args.maxTables)) ? Math.floor(Number(args.maxTables)) : 5));
  const maxRows = Math.max(1, Math.min(500, Number.isFinite(Number(args.maxRows)) ? Math.floor(Number(args.maxRows)) : 100));
  return execOnTab(tabId, (sel, tableLimit, rowLimit) => {
    const norm = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const getSelector = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        let part = cur.tagName.toLowerCase();
        if (cur.classList?.length) part += "." + Array.from(cur.classList).slice(0, 2).map((x) => CSS.escape(x)).join(".");
        parts.unshift(part);
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };
    const tables = Array.from(document.querySelectorAll(sel)).filter((el) => el.tagName?.toLowerCase() === "table").slice(0, tableLimit);
    const items = tables.map((table) => {
      const headers = Array.from(table.querySelectorAll("thead th")).map((th) => norm(th.innerText || th.textContent || ""));
      const rows = [];
      const trs = Array.from(table.querySelectorAll("tbody tr, tr")).slice(0, rowLimit);
      for (const tr of trs) {
        const cells = Array.from(tr.querySelectorAll("th,td")).map((cell) => norm(cell.innerText || cell.textContent || ""));
        if (cells.length) rows.push(cells);
      }
      return {
        selector: getSelector(table),
        caption: norm(table.querySelector("caption")?.innerText || ""),
        headers,
        rowCount: rows.length,
        rows
      };
    });
    return { ok: true, count: items.length, tables: items };
  }, [selector, maxTables, maxRows]);
}
async function toolExtractFormSchema(tabId, args = {}) {
  const selector = String(args.selector || "form").trim() || "form";
  const maxForms = Math.max(1, Math.min(50, Number.isFinite(Number(args.maxForms)) ? Math.floor(Number(args.maxForms)) : 10));
  const maxFields = Math.max(1, Math.min(1e3, Number.isFinite(Number(args.maxFields)) ? Math.floor(Number(args.maxFields)) : 200));
  const includeHidden = !!args.includeHidden;
  return execOnTab(tabId, (sel, formLimit, fieldLimit, withHidden) => {
    const norm = (v) => String(v || "").replace(/\s+/g, " ").trim();
    const getSelector = (el) => {
      if (el.id) return `#${CSS.escape(el.id)}`;
      const parts = [];
      let cur = el;
      while (cur && cur.nodeType === 1 && parts.length < 6) {
        parts.unshift(cur.tagName.toLowerCase());
        cur = cur.parentElement;
      }
      return parts.join(" > ");
    };
    const forms = Array.from(document.querySelectorAll(sel)).filter((el) => el.tagName?.toLowerCase() === "form").slice(0, formLimit);
    const items = forms.map((form) => {
      const controls = Array.from(form.querySelectorAll("input,textarea,select,button")).filter((el) => withHidden || String(el.type || "").toLowerCase() !== "hidden").slice(0, fieldLimit);
      const fields = controls.map((el) => {
        const isSelect = el.tagName?.toLowerCase() === "select";
        const options = isSelect ? Array.from(el.options || []).slice(0, 120).map((opt) => ({
          value: String(opt.value || ""),
          text: norm(opt.text || "")
        })) : void 0;
        return {
          tag: String(el.tagName || "").toLowerCase(),
          type: String(el.type || "").toLowerCase(),
          name: String(el.name || ""),
          id: String(el.id || ""),
          required: !!el.required,
          placeholder: String(el.placeholder || ""),
          value: String(el.value || ""),
          label: norm(form.querySelector(`label[for="${CSS.escape(el.id || "")}"]`)?.innerText || ""),
          options
        };
      });
      return {
        selector: getSelector(form),
        action: String(form.getAttribute("action") || ""),
        method: String(form.getAttribute("method") || "GET").toUpperCase(),
        fieldCount: fields.length,
        fields
      };
    });
    return { ok: true, count: items.length, forms: items };
  }, [selector, maxForms, maxFields, includeHidden]);
}
async function toolExtractMetaTags(tabId, args = {}) {
  const includeOpenGraph = args.includeOpenGraph !== false;
  const includeTwitter = args.includeTwitter !== false;
  return execOnTab(tabId, (withOG, withTwitter) => {
    const norm = (v) => String(v || "").trim();
    const metas = Array.from(document.querySelectorAll("meta")).map((meta) => ({
      name: norm(meta.getAttribute("name")),
      property: norm(meta.getAttribute("property")),
      httpEquiv: norm(meta.getAttribute("http-equiv")),
      content: norm(meta.getAttribute("content"))
    })).filter((item) => item.content);
    const filtered = metas.filter((item) => {
      const key = (item.property || item.name || "").toLowerCase();
      if (!withOG && key.startsWith("og:")) return false;
      if (!withTwitter && key.startsWith("twitter:")) return false;
      return true;
    });
    return {
      ok: true,
      title: document.title || "",
      canonical: norm(document.querySelector("link[rel='canonical']")?.getAttribute("href")),
      count: filtered.length,
      metas: filtered
    };
  }, [includeOpenGraph, includeTwitter]);
}
async function toolExtractJsonld(tabId, args = {}) {
  const parse = args.parse !== false;
  return execOnTab(tabId, (doParse) => {
    const scripts = Array.from(document.querySelectorAll("script[type='application/ld+json']"));
    const items = scripts.map((script, idx) => {
      const raw = String(script.textContent || "").trim();
      if (!doParse) {
        return { index: idx, raw };
      }
      try {
        return { index: idx, data: JSON.parse(raw) };
      } catch (_err) {
        return { index: idx, raw, parseError: true };
      }
    });
    return { ok: true, count: items.length, items };
  }, [parse]);
}
function buildMemoryMessages(memoryEntries) {
  if (!Array.isArray(memoryEntries) || memoryEntries.length === 0) {
    return [];
  }
  return memoryEntries.map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: String(item.text || "")
  }));
}
function maskAuth(value) {
  const text = String(value || "");
  if (!text) return "";
  const prefix = text.startsWith("Bearer ") ? "Bearer " : "";
  const token = prefix ? text.slice(7) : text;
  if (token.length <= 8) return `${prefix}****`;
  return `${prefix}${token.slice(0, 4)}...${token.slice(-4)}`;
}
function sanitizeDebug(value, depth = 0) {
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 700) return `${value.slice(0, 700)} ...(truncated ${value.length - 700} chars)`;
    return value;
  }
  if (typeof value !== "object") return value;
  if (depth >= 3) return "[Object]";
  if (Array.isArray(value)) {
    const list = value.slice(0, 30).map((item) => sanitizeDebug(item, depth + 1));
    if (value.length > 30) list.push(`...(truncated ${value.length - 30} items)`);
    return list;
  }
  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (k.toLowerCase() === "authorization") {
      out[k] = maskAuth(v);
      continue;
    }
    out[k] = sanitizeDebug(v, depth + 1);
  }
  return out;
}
function toDebugText(title, request, extra = "") {
  const safeReq = sanitizeDebug(request);
  const lines = [
    `[${title}]`,
    `${safeReq.method || "GET"} ${safeReq.url || ""}`,
    `headers: ${JSON.stringify(safeReq.headers || {}, null, 2)}`
  ];
  if (typeof safeReq.body !== "undefined") {
    lines.push(`body: ${JSON.stringify(safeReq.body, null, 2)}`);
  }
  if (extra) {
    lines.push(extra);
  }
  return lines.join("\n");
}
function emitDebug(hooks, title, request, extra = "") {
  if (!ENABLE_TRACE_LOGS) return;
  const text = toDebugText(title, request, extra);
  try {
    console.log(`[WebAgentTrace] ${text}`);
  } catch (_err) {
  }
  if (typeof hooks?.onDebug === "function") {
    hooks.onDebug(text);
  }
}
function headersToObject(headers) {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    const out = {};
    for (const item of headers) {
      if (!Array.isArray(item) || item.length < 2) continue;
      out[String(item[0])] = String(item[1]);
    }
    return out;
  }
  if (typeof headers === "object") {
    return { ...headers };
  }
  return {};
}
function parseBodyForDebug(body) {
  if (typeof body === "undefined" || body === null) return body;
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch (_err) {
      return body;
    }
  }
  return body;
}
function getErrorStatus(err) {
  const status = Number(err?.status || err?.response?.status || 0);
  return Number.isFinite(status) ? status : 0;
}
function formatOpenAIError(err) {
  if (!err) return "unknown error";
  const status = getErrorStatus(err);
  const text = String(err?.error?.message || err?.message || err).trim();
  if (!status) {
    return text || "unknown error";
  }
  return text ? `HTTP ${status}: ${text}` : `HTTP ${status}`;
}
function buildOpenAIBaseURLCandidates(baseURL) {
  const base = normalizeBaseURL(baseURL);
  const baseNoV1 = stripV1Suffix(base);
  return uniqueStrings([base.endsWith("/v1") ? base : `${base}/v1`, base, `${baseNoV1}/v1`]);
}
async function fetchWithTimeout(url, init = {}, timeoutMs = 0) {
  const ms = Number(timeoutMs || 0);
  if (!Number.isFinite(ms) || ms <= 0) {
    return fetch(url, init);
  }
  const controller = new AbortController();
  let timeoutId = null;
  let abortedByOuterSignal = false;
  const outerSignal = init?.signal;
  const abortFromOuter = () => {
    abortedByOuterSignal = true;
    try {
      controller.abort(outerSignal?.reason);
    } catch (_err) {
      controller.abort();
    }
  };
  if (outerSignal) {
    if (outerSignal.aborted) {
      abortFromOuter();
    } else {
      outerSignal.addEventListener("abort", abortFromOuter, { once: true });
    }
  }
  timeoutId = setTimeout(() => {
    try {
      controller.abort(new Error(`Request timeout after ${Math.ceil(ms / 1e3)}s`));
    } catch (_err) {
      controller.abort();
    }
  }, ms);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } catch (err) {
    if (controller.signal.aborted && !abortedByOuterSignal) {
      throw new Error(`\u8BF7\u6C42\u8D85\u65F6(${Math.ceil(ms / 1e3)}\u79D2)`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
    if (outerSignal) {
      outerSignal.removeEventListener("abort", abortFromOuter);
    }
  }
}
function mergeAbortSignals(...signals) {
  const list = signals.filter((sig) => sig && typeof sig === "object");
  if (list.length === 0) return null;
  if (list.length === 1) return list[0];
  const controller = new AbortController();
  const cleanups = [];
  const abortWith = (reason) => {
    if (controller.signal.aborted) return;
    try {
      controller.abort(reason);
    } catch (_err) {
      controller.abort();
    }
    for (const off of cleanups) {
      try {
        off();
      } catch (_err) {
      }
    }
  };
  for (const sig of list) {
    if (sig.aborted) {
      abortWith(sig.reason);
      return controller.signal;
    }
    const onAbort = () => abortWith(sig.reason);
    sig.addEventListener("abort", onAbort, { once: true });
    cleanups.push(() => sig.removeEventListener("abort", onAbort));
  }
  return controller.signal;
}
function createOpenAIClient({ apiKey, baseURL, hooks, timeoutMs }) {
  const requestFetch = async (url, init = {}) => {
    ensureTaskActive(hooks);
    const method = String(init?.method || "GET").toUpperCase();
    const headers = headersToObject(init?.headers);
    const body = parseBodyForDebug(init?.body);
    emitDebug(hooks, "OpenAI SDK Request", {
      method,
      url: String(url || ""),
      headers,
      body,
      timeoutMs: Number(timeoutMs || 0)
    });
    const mergedSignal = mergeAbortSignals(init?.signal, hooks?.cancelSignal);
    const resp = await fetchWithTimeout(url, { ...init, signal: mergedSignal }, timeoutMs);
    emitDebug(hooks, "OpenAI SDK Response", { method, url: String(url || ""), headers }, `status: ${resp.status}`);
    return resp;
  };
  return new OpenAI({
    apiKey,
    baseURL,
    dangerouslyAllowBrowser: true,
    fetch: requestFetch
  });
}
async function tracedFetch(url, init = {}, hooks, title = "HTTP Request") {
  const method = String(init?.method || "GET").toUpperCase();
  const headers = headersToObject(init?.headers);
  const body = parseBodyForDebug(init?.body);
  emitDebug(hooks, title, { method, url: String(url || ""), headers, body });
  const resp = await fetch(url, init);
  emitDebug(hooks, `${title} Response`, { method, url: String(url || ""), headers }, `status: ${resp.status}`);
  return resp;
}
async function handleMessage(message) {
  const type = message?.type;
  const payload = message?.payload || {};
  switch (type) {
    case "GET_SETTINGS":
      return { ok: true, settings: await getSettings() };
    case "GET_AGENT_TASK": {
      if (runningTask && runningTask.status === "running") {
        return { ok: true, task: toTaskPublicState(runningTask) };
      }
      const data = await chrome.storage.local.get(TASK_STATE_KEY);
      return { ok: true, task: data?.[TASK_STATE_KEY] || null };
    }
    case "CLEAR_AGENT_MEMORY": {
      const tab = payload?.tabId ? { id: Number(payload.tabId) } : await getActiveTab();
      if (!tab?.id) {
        return { ok: false, error: "\u672A\u627E\u5230\u5F53\u524D\u6FC0\u6D3B\u6807\u7B7E\u9875" };
      }
      await clearConversationMemory(tab.id);
      return { ok: true };
    }
    case "CLEAR_CHAT_STATE": {
      const tab = payload?.tabId ? { id: Number(payload.tabId) } : await getActiveTab();
      if (tab?.id) {
        await clearConversationMemory(tab.id);
      }
      await chrome.storage.local.remove(TASK_STATE_KEY);
      return { ok: true };
    }
    case "STOP_AGENT_TASK": {
      const wantedID = String(payload?.taskId || "");
      if (wantedID && runningTask && runningTask.id !== wantedID) {
        return { ok: false, error: "\u76EE\u6807\u4EFB\u52A1\u5DF2\u53D8\u5316\u6216\u4E0D\u5B58\u5728" };
      }
      return stopRunningTask(String(payload?.reason || "\u7528\u6237\u624B\u52A8\u505C\u6B62\u4EFB\u52A1"));
    }
    case "SAVE_SETTINGS":
      await saveSettings(payload);
      return { ok: true };
    case "LIST_MODELS":
      return listModels(payload || {});
    case "RUN_AGENT":
      return runAgent(payload.prompt || "", payload.settings || {});
    default:
      return { ok: false, error: `unknown message: ${type}` };
  }
}
async function getSettings() {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  const loaded = data?.[SETTINGS_KEY] || {};
  return normalizeSettings({
    ...DEFAULT_SETTINGS,
    ...loaded
  });
}
function normalizeBaseURL(value) {
  const raw = String(value || "").trim() || DEFAULT_SETTINGS.baseURL;
  return raw.replace(/\/+$/, "");
}
function normalizeRequestTimeoutSec(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return DEFAULT_SETTINGS.requestTimeoutSec;
  }
  return Math.min(600, Math.max(5, Math.floor(raw)));
}
function uniqueStrings(items) {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  for (const v of items) {
    const s = String(v || "");
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}
function stripV1Suffix(base) {
  return String(base || "").replace(/\/v1$/i, "");
}
function normalizeToolTurnLimit(value) {
  const raw = Number(value);
  if (!Number.isFinite(raw)) {
    return DEFAULT_SETTINGS.toolTurnLimit;
  }
  return Math.max(0, Math.floor(raw));
}
function normalizeThinkingLevel(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "low" || raw === "medium" || raw === "high" || raw === "xhigh") {
    return raw;
  }
  return DEFAULT_SETTINGS.thinkingLevel;
}
function createMcpServiceId() {
  const seed = Math.random().toString(36).slice(2, 8);
  return `svc_${Date.now()}_${seed}`;
}
function normalizeMcpTransport(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "cmd") return "stdio";
  if (raw === "http" || raw === "sse" || raw === "stdio" || raw === "streamable_http") {
    return raw;
  }
  return "streamable_http";
}
function normalizeMcpHeaderName(value) {
  const name = String(value || "").trim();
  if (!name) return "";
  if (name.length > 128) return "";
  if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name)) return "";
  return name;
}
function normalizeMcpHeaderValue(value) {
  return String(value ?? "");
}
function normalizeMcpHeaders(input, legacyApiKey = "") {
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const pushOne = (rawName, rawValue, rawEnabled = true) => {
    const name = normalizeMcpHeaderName(rawName);
    if (!name) return;
    const value = normalizeMcpHeaderValue(rawValue);
    const enabled = rawEnabled !== false;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push({ name, value, enabled });
  };
  if (Array.isArray(input)) {
    for (const item of input) {
      if (!item || typeof item !== "object") continue;
      pushOne(item.name || item.key || item.header, item.value, item.enabled);
    }
  } else if (input && typeof input === "object") {
    for (const [name, value] of Object.entries(input)) {
      pushOne(name, value, true);
    }
  } else if (typeof input === "string" && input.trim()) {
    for (const line of input.split(/\r?\n/)) {
      const row = line.trim();
      if (!row) continue;
      const sep = row.indexOf(":");
      if (sep <= 0) continue;
      pushOne(row.slice(0, sep), row.slice(sep + 1), true);
    }
  }
  const legacy = String(legacyApiKey || "");
  if (legacy) {
    const hasAuth = out.some((item) => String(item.name || "").trim().toLowerCase() === "authorization");
    if (!hasAuth) {
      pushOne("Authorization", legacy, true);
    }
  }
  return out;
}
function mcpHeadersToObject(service, extra = {}) {
  const headers = {};
  const list = Array.isArray(service?.mcpHeaders) ? service.mcpHeaders : normalizeMcpHeaders(service?.mcpHeaders, service?.apiKey);
  for (const item of list) {
    if (!item || item.enabled === false) continue;
    const name = normalizeMcpHeaderName(item.name);
    if (!name) continue;
    headers[name] = normalizeMcpHeaderValue(item.value);
  }
  if (!headers.Authorization && String(service?.apiKey || "").trim()) {
    headers.Authorization = String(service.apiKey);
  }
  if (extra.sessionId) {
    headers["MCP-Session-Id"] = String(extra.sessionId);
  }
  return headers;
}
function normalizeMcpService(item = {}) {
  const legacyApiKey = String(item.apiKey || "").trim();
  const headersInput = Object.prototype.hasOwnProperty.call(item, "mcpHeaders") ? item.mcpHeaders : item.headers;
  return {
    id: String(item.id || createMcpServiceId()),
    name: String(item.name || "").trim(),
    enabled: item.enabled !== false,
    transport: normalizeMcpTransport(item.transport),
    baseURL: String(item.baseURL || "").trim().replace(/\/+$/, ""),
    apiKey: legacyApiKey,
    mcpHeaders: normalizeMcpHeaders(headersInput, legacyApiKey),
    command: String(item.command || "").trim(),
    args: String(item.args || "").trim(),
    envText: String(item.envText || "")
  };
}
function normalizeMcpServices(list) {
  if (!Array.isArray(list)) {
    return [];
  }
  return list.map((item) => normalizeMcpService(item));
}
function upgradeLegacyMcpSettings(input = {}) {
  if (Array.isArray(input.mcpServices)) {
    return input.mcpServices;
  }
  if (!input.mcpEnabled || !input.mcpBaseURL) {
    return [];
  }
  return [
    {
      id: createMcpServiceId(),
      name: "Legacy MCP",
      enabled: true,
      transport: "http",
      baseURL: String(input.mcpBaseURL || "").trim(),
      apiKey: String(input.mcpApiKey || "").trim(),
      mcpHeaders: normalizeMcpHeaders([], String(input.mcpApiKey || "").trim()),
      command: "",
      args: "",
      envText: ""
    }
  ];
}
function normalizeSettings(input = {}) {
  const mcpServices = normalizeMcpServices(upgradeLegacyMcpSettings(input));
  return {
    apiKey: String(input.apiKey || "").trim(),
    model: String(input.model || "").trim(),
    thinkingLevel: normalizeThinkingLevel(input.thinkingLevel),
    baseURL: normalizeBaseURL(input.baseURL),
    allowScript: !!input.allowScript,
    requestTimeoutSec: normalizeRequestTimeoutSec(input.requestTimeoutSec),
    toolTurnLimit: normalizeToolTurnLimit(input.toolTurnLimit),
    mcpServices
  };
}
async function saveSettings(input) {
  const merged = normalizeSettings({
    ...await getSettings(),
    ...input
  });
  await chrome.storage.local.set({ [SETTINGS_KEY]: merged });
}
async function listModels(override = {}) {
  const settings = normalizeSettings({
    ...await getSettings(),
    ...override
  });
  if (!settings.apiKey) {
    return { ok: false, error: "\u8BF7\u5148\u586B\u5199 API Key" };
  }
  const baseCandidates = buildOpenAIBaseURLCandidates(settings.baseURL);
  const tried = [];
  let lastError = null;
  for (const candidate of baseCandidates) {
    tried.push(candidate);
    try {
      const client = createOpenAIClient({
        apiKey: settings.apiKey,
        baseURL: candidate,
        timeoutMs: settings.requestTimeoutSec * 1e3
      });
      const page = await client.models.list();
      const list = Array.isArray(page?.data) ? page.data.map((item) => String(item?.id || "").trim()).filter(Boolean).sort((a, b) => a.localeCompare(b)) : [];
      return {
        ok: true,
        models: list,
        debug: `[OpenAI SDK Models]
baseURL: ${candidate}
tried: ${tried.join(" | ")}`
      };
    } catch (err) {
      lastError = err;
      if (getErrorStatus(err) !== 404) {
        return {
          ok: false,
          error: `${formatOpenAIError(err)} (${candidate})`,
          debug: `[OpenAI SDK Models]
baseURL: ${candidate}
tried: ${tried.join(" | ")}`
        };
      }
    }
  }
  const finalBase = baseCandidates[baseCandidates.length - 1] || "";
  return {
    ok: false,
    error: `${formatOpenAIError(lastError) || "HTTP 404"} (${finalBase})`,
    debug: `[OpenAI SDK Models]
baseURL: ${finalBase}
tried: ${tried.join(" | ")}`
  };
}
async function runAgent(prompt, overrideSettings = {}, hooks = {}) {
  ensureTaskActive(hooks);
  const cleanPrompt = String(prompt || "").trim();
  if (!cleanPrompt) {
    return { ok: false, error: "prompt is empty" };
  }
  const settings = normalizeSettings({
    ...await getSettings(),
    ...overrideSettings
  });
  if (!settings.apiKey) {
    return { ok: false, error: "\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199 API Key" };
  }
  if (!settings.model) {
    return { ok: false, error: "\u8BF7\u5148\u83B7\u53D6\u5E76\u9009\u62E9\u6A21\u578B" };
  }
  const tab = await getActiveTab();
  if (!tab?.id) {
    return { ok: false, error: "\u672A\u627E\u5230\u5F53\u524D\u6FC0\u6D3B\u6807\u7B7E\u9875" };
  }
  const tabURL = String(tab.url || "");
  let streamedAssistant = "";
  const agentHooks = {
    ...hooks,
    onDelta: (delta) => {
      if (hooks?.cancelSignal?.aborted) {
        return;
      }
      const text = String(delta || "");
      if (text) {
        streamedAssistant += text;
      }
      hooks.onDelta?.(delta);
    }
  };
  let result;
  ensureTaskActive(agentHooks);
  if (isWholePageTranslateRequest(cleanPrompt)) {
    if (isRestrictedBrowserPage(tabURL)) {
      return { ok: false, error: "\u6D4F\u89C8\u5668\u5185\u90E8\u9875\u9762\u65E0\u6CD5\u8BFB/\u6539 DOM\uFF0C\u6574\u9875\u7FFB\u8BD1\u8BF7\u5728 http/https \u666E\u901A\u7F51\u9875\u6267\u884C" };
    }
    result = await runWholePageTranslate(cleanPrompt, tab.id, settings, agentHooks);
  } else {
    result = await runFunctionCallingAgent(cleanPrompt, tab.id, tabURL, settings, agentHooks);
  }
  ensureTaskActive(agentHooks);
  const finalText = normalizeMemoryText(result?.message || "");
  const partialText = normalizeMemoryText(streamedAssistant);
  const fallbackText = result?.ok ? "\u6267\u884C\u5B8C\u6210" : `\u672A\u5B8C\u6210: ${String(result?.error || "\u672A\u77E5\u9519\u8BEF")}`;
  const memoryText = finalText || partialText || fallbackText;
  if (memoryText) {
    await appendConversationMemory(tab.id, cleanPrompt, memoryText);
  }
  return result;
}
async function runWholePageTranslate(prompt, tabId, settings, hooks) {
  ensureTaskActive(hooks);
  hooks.onStatus?.("\u8BFB\u53D6\u6574\u9875 HTML...");
  const originalHTML = await getWholePageHTML(tabId);
  if (!originalHTML || originalHTML.length < 200) {
    return { ok: false, error: "\u9875\u9762\u5185\u5BB9\u8FC7\u5C11\uFF0C\u65E0\u6CD5\u6267\u884C\u6574\u9875\u7FFB\u8BD1" };
  }
  hooks.onStatus?.("\u6A21\u578B\u7FFB\u8BD1\u4E2D...");
  ensureTaskActive(hooks);
  const translatedHTML = await translateWholePageHTML({
    apiKey: settings.apiKey,
    model: settings.model,
    thinkingLevel: settings.thinkingLevel,
    baseURL: settings.baseURL,
    timeoutMs: settings.requestTimeoutSec * 1e3,
    html: originalHTML,
    userPrompt: prompt,
    stream: typeof hooks.onDelta === "function",
    onDelta: hooks.onDelta,
    onReasoning: hooks.onReasoning,
    hooks
  });
  hooks.onStatus?.("\u66FF\u6362\u9875\u9762\u5185\u5BB9...");
  ensureTaskActive(hooks);
  const replaceRes = await replaceWholePageHTML(tabId, translatedHTML);
  return {
    ok: true,
    message: `\u6574\u9875\u7FFB\u8BD1\u5B8C\u6210\uFF0C\u5DF2\u66FF\u6362\u9875\u9762 HTML\u3002\u5F53\u524D\u6807\u9898\uFF1A${replaceRes?.title || "(unknown)"}`
  };
}
async function runFunctionCallingAgent(prompt, tabId, tabURL, settings, hooks) {
  ensureTaskActive(hooks);
  const attachPageContext = shouldAttachPageContext(prompt);
  if (attachPageContext && isRestrictedBrowserPage(tabURL)) {
    return {
      ok: false,
      error: "\u5F53\u524D\u662F\u6D4F\u89C8\u5668\u5185\u90E8\u9875\u9762(chrome:// / edge://)\uFF0C\u4E0D\u652F\u6301\u9875\u9762\u8BFB\u5199\u5DE5\u5177\u3002\u82E5\u53EA\u9700\u901A\u7528 function calling(\u52A0\u89E3\u5BC6/\u7F16\u89E3\u7801/http/mcp)\u8BF7\u76F4\u63A5\u63CF\u8FF0\u4EFB\u52A1\u3002"
    };
  }
  let snapshot = { title: "", url: "", selectedText: "", nodes: [] };
  if (attachPageContext) {
    hooks.onStatus?.("\u52A0\u8F7D\u9875\u9762\u5FEB\u7167...");
    ensureTaskActive(hooks);
    snapshot = await collectPageSnapshot(tabId);
  } else {
    hooks.onStatus?.("\u8DF3\u8FC7\u9875\u9762\u5FEB\u7167(\u672C\u8F6E\u6309\u9700\u8C03\u7528\u9875\u9762\u5DE5\u5177)...");
  }
  ensureTaskActive(hooks);
  const memoryEntries = await getConversationMemory(tabId);
  return runFunctionCallingAgentLegacy(prompt, tabId, settings, hooks, snapshot, memoryEntries, attachPageContext);
}
function isRestrictedBrowserPage(url) {
  const raw = String(url || "").trim().toLowerCase();
  return raw.startsWith("chrome://") || raw.startsWith("edge://") || raw.startsWith("chrome-extension://");
}
async function runFunctionCallingAgentLegacy(prompt, tabId, settings, hooks, snapshot, memoryEntries, attachPageContext = true) {
  ensureTaskActive(hooks);
  hooks.onStatus?.("\u52A0\u8F7D\u5DE5\u5177\u5217\u8868...");
  const mcpRegistry = await fetchMCPTools(settings);
  const tools = buildToolSpecs(settings.allowScript, mcpRegistry.toolSpecs || []);
  if (Array.isArray(mcpRegistry.errors) && mcpRegistry.errors.length > 0) {
    for (const err of mcpRegistry.errors) {
      hooks.onDelta?.(`
[MCP] ${err}
`);
    }
  }
  if (mcpRegistry.toolSpecs?.length) {
    hooks.onDelta?.(`
[MCP] \u5DF2\u52A0\u8F7D ${mcpRegistry.toolSpecs.length} \u4E2A\u5DE5\u5177
`);
  }
  const messages = [
    {
      role: "system",
      content: buildAgentSystemPrompt(settings.allowScript, !!mcpRegistry.toolSpecs?.length, { attachPageContext })
    },
    ...buildMemoryMessages(memoryEntries),
    {
      role: "user",
      content: JSON.stringify(attachPageContext ? {
        request: prompt,
        page: {
          title: snapshot.title,
          url: snapshot.url,
          selectedText: snapshot.selectedText,
          previewNodes: snapshot.nodes?.slice(0, 40) || []
        }
      } : {
        request: prompt,
        page: {
          attached: false,
          note: "\u672C\u8F6E\u672A\u9884\u8F7D\u9875\u9762\u5FEB\u7167\u3002\u82E5\u4EFB\u52A1\u9700\u8981\u9875\u9762\u4FE1\u606F\uFF0C\u8BF7\u5148\u8C03\u7528 get_page_snapshot/query_elements \u518D\u64CD\u4F5C\u3002"
        }
      })
    }
  ];
  const maxTurns = normalizeToolTurnLimit(settings.toolTurnLimit);
  for (let turn = 1; ; turn += 1) {
    ensureTaskActive(hooks);
    if (maxTurns > 0 && turn > maxTurns) {
      return { ok: false, error: `\u5DE5\u5177\u8C03\u7528\u8F6E\u6B21\u8FBE\u5230\u4E0A\u9650(${maxTurns})\uFF0C\u5EFA\u8BAE\u7F29\u5C0F\u4EFB\u52A1\u8303\u56F4` };
    }
    hooks.onStatus?.("\u6A21\u578B\u601D\u8003\u4E2D...");
    const completion = await callChatCompletion({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      model: settings.model,
      thinkingLevel: settings.thinkingLevel,
      timeoutMs: settings.requestTimeoutSec * 1e3,
      messages,
      tools,
      stream: typeof hooks.onDelta === "function",
      hooks
    });
    const choice = completion?.choices?.[0] || {};
    const assistantMessage = choice?.message || {};
    const assistantText = messageContentToText(assistantMessage?.content);
    if (typeof hooks.onDelta !== "function") {
      const reasoningText = extractReasoningFromCompletion(completion);
      if (reasoningText) {
        hooks.onReasoning?.(reasoningText);
      }
    }
    const toolCalls = Array.isArray(assistantMessage?.tool_calls) ? assistantMessage.tool_calls : [];
    if (toolCalls.length === 0) {
      return { ok: true, message: assistantText || "\u6267\u884C\u5B8C\u6210" };
    }
    messages.push({
      role: "assistant",
      content: assistantText || "",
      tool_calls: toolCalls
    });
    for (const call of toolCalls) {
      ensureTaskActive(hooks);
      const toolResult = await executeToolCall(call, {
        tabId,
        settings,
        mcpRegistry,
        hooks,
        depth: 0
      });
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        name: call?.function?.name || "unknown_tool",
        content: safeJSONString(toolResult)
      });
      hooks.onDelta?.(`
[tool:${call?.function?.name || "unknown"}] ${summarizeToolResult(toolResult)}
`);
    }
  }
}
function shouldAttachPageContext(prompt) {
  const text = String(prompt || "").trim().toLowerCase();
  if (!text) return true;
  const toolCatalogWords = [
    "function calling",
    "function list",
    "tool list",
    "tools list",
    "\u51FD\u6570\u5217\u8868",
    "\u5DE5\u5177\u5217\u8868",
    "\u53EF\u7528\u51FD\u6570",
    "\u6709\u54EA\u4E9B\u51FD\u6570",
    "\u6709\u54EA\u4E9Bfunction",
    "\u6709\u54EA\u4E9Btool",
    "\u6709\u54EA\u4E9Bfunction calling"
  ];
  if (toolCatalogWords.some((item) => text.includes(item))) {
    return false;
  }
  const hardNoPage = [
    "\u4E0D\u8981\u8BFB\u53D6\u9875\u9762",
    "\u65E0\u9700\u9875\u9762",
    "\u53EA\u8C03\u51FD\u6570",
    "\u53EA\u8C03\u7528\u5DE5\u5177",
    "no page",
    "without page context"
  ];
  if (hardNoPage.some((item) => text.includes(item))) {
    return false;
  }
  const pageWords = [
    "\u7F51\u9875",
    "\u9875\u9762",
    "\u5F53\u524D\u9875",
    "dom",
    "\u5143\u7D20",
    "\u6807\u7B7E",
    "\u6309\u94AE",
    "\u94FE\u63A5",
    "a\u6807\u7B7E",
    "html",
    "css",
    "script",
    "\u811A\u672C",
    "\u7FFB\u8BD1",
    "\u6293\u53D6",
    "\u63D0\u53D6",
    "\u603B\u7ED3\u9875\u9762",
    "\u4FEE\u6539\u9875\u9762",
    "query",
    "snapshot",
    "click",
    "input",
    "select",
    "scroll"
  ];
  if (pageWords.some((item) => text.includes(item))) {
    return true;
  }
  const utilityWords = [
    "function",
    "functions",
    "tool",
    "tools",
    "function calling",
    "\u51FD\u6570",
    "\u5DE5\u5177",
    "\u5DE5\u5177\u5217\u8868",
    "\u51FD\u6570\u5217\u8868",
    "\u53EF\u7528\u51FD\u6570",
    "\u52A0\u5BC6",
    "\u89E3\u5BC6",
    "aes",
    "des",
    "desede",
    "rsa",
    "base64",
    "hex",
    "unicode",
    "\u7F16\u7801",
    "\u89E3\u7801",
    "hash",
    "hmac",
    "sha",
    "md5",
    "jwt",
    "jsonpath",
    "\u6B63\u5219",
    "regex",
    "\u968F\u673A",
    "uuid",
    "http",
    "request",
    "mcp",
    "\u914D\u7F6E",
    "profile",
    "storage"
  ];
  if (utilityWords.some((item) => text.includes(item))) {
    return false;
  }
  return false;
}
function buildAgentSystemPrompt(allowScript, hasMCP, options = {}) {
  const attachPageContext = options.attachPageContext !== false;
  return [
    "\u4F60\u662F\u7F51\u9875\u81EA\u52A8\u5316\u4EE3\u7406\u3002\u8BF7\u6309\u7528\u6237\u610F\u56FE\u9009\u62E9\u5DE5\u5177\uFF0C\u4E0D\u8981\u673A\u68B0\u5730\u6BCF\u8F6E\u5148\u8BFB\u9875\u9762\u3002",
    "\u89C4\u5219\uFF1A",
    "1. \u4EC5\u5728\u7528\u6237\u4EFB\u52A1\u660E\u786E\u6D89\u53CA\u7F51\u9875\u5185\u5BB9(\u9605\u8BFB/\u63D0\u53D6/\u4FEE\u6539/DOM/\u7FFB\u8BD1)\u65F6\uFF0C\u624D\u8C03\u7528 get_page_snapshot\u3001query/extract/click/input/select/scroll \u7C7B\u5DE5\u5177\u3002",
    "2. \u5982\u679C\u4EFB\u52A1\u662F\u901A\u7528\u51FD\u6570(\u52A0\u89E3\u5BC6\u3001\u7F16\u89E3\u7801\u3001hash/hmac\u3001\u968F\u673A\u6570\u3001http\u8BF7\u6C42\u3001MCP/\u914D\u7F6E\u7BA1\u7406)\uFF0C\u4E0D\u8981\u4E3B\u52A8\u8BFB\u9875\u9762\uFF0C\u76F4\u63A5\u8C03\u7528\u5BF9\u5E94 function calling \u5DE5\u5177\u3002",
    "3. \u5C40\u90E8\u4FEE\u6539\u4F18\u5148\u4F7F\u7528 query/extract/set/remove \u5DE5\u5177\uFF1B\u6574\u9875\u7FFB\u8BD1\u4F7F\u7528 translate_whole_page_to_zh\u3002",
    "3.5 \u9700\u8981\u8DE8\u8F6E\u6B21\u4FDD\u5B58\u6570\u636E\u65F6\u53EF\u7528 set_storage/get_storage\u3002",
    "3.6 \u52A0\u89E3\u5BC6/\u7F16\u89E3\u7801/\u7F51\u7EDC\u8BF7\u6C42\u8BF7\u4F18\u5148\u4F7F\u7528 crypto_*, rsa_*, encoding_convert, http_request \u5DE5\u5177\u3002",
    "3.7 \u9700\u8981\u4EA4\u4E92\u6216\u7ED3\u6784\u5316\u62BD\u53D6\u65F6\u4F18\u5148\u4F7F\u7528 click/input/select/scroll \u4EE5\u53CA extract_table/extract_form_schema/query_by_text/meta/jsonld \u5DE5\u5177\u3002",
    "3.8 \u505A\u6D4B\u8BD5\u6D41\u7A0B\u65F6\uFF0C\u8BF7\u4F18\u5148\u7EC4\u5408 open_url + wait_for_element + assert_page_state + batch_execute\uFF0C\u6309\u76EE\u6807\u81EA\u52A8\u51B3\u7B56\u4E0B\u4E00\u6B65\u3002",
    allowScript ? "4. execute_script/append_script \u4EC5\u5728\u65E0\u5176\u4ED6\u5DE5\u5177\u53EF\u7528\u4E14\u7528\u6237\u660E\u786E\u8981\u6C42\u6267\u884C\u811A\u672C\u65F6\u624D\u80FD\u8C03\u7528\u3002" : "4. execute_script/append_script \u7981\u7528\uFF0C\u4E0D\u8981\u8C03\u7528\u3002",
    hasMCP ? "5. \u5141\u8BB8\u8C03\u7528 MCP \u5DE5\u5177\u8865\u5145\u80FD\u529B\u3002" : "5. \u5F53\u524D\u65E0 MCP \u5DE5\u5177\u3002",
    attachPageContext ? "6. \u672C\u8F6E\u5DF2\u9644\u5E26\u9875\u9762\u9884\u89C8\u4FE1\u606F\uFF0C\u4EC5\u5728\u4E0D\u8DB3\u65F6\u518D\u8C03\u7528 get_page_snapshot \u8865\u5145\u3002" : "6. \u672C\u8F6E\u672A\u9884\u8F7D\u9875\u9762\u5FEB\u7167\uFF0C\u9664\u975E\u4EFB\u52A1\u5FC5\u987B\u4F9D\u8D56\u9875\u9762\u4FE1\u606F\uFF0C\u5426\u5219\u4E0D\u8981\u8C03\u7528\u9875\u9762\u5DE5\u5177\u3002",
    "\u6700\u540E\u7528\u4E2D\u6587\u56DE\u590D\uFF0C\u8BF4\u660E\u6267\u884C\u6B65\u9AA4\u548C\u7ED3\u679C\u3002"
  ].join("\n");
}
function buildToolSpecs(allowScript, mcpToolSpecs) {
  const local = [
    defineTool("get_page_snapshot", "Get page snapshot", {
      type: "object",
      properties: {},
      additionalProperties: false
    }),
    defineTool("query_elements", "Query elements by selector", {
      type: "object",
      properties: {
        selector: { type: "string" },
        limit: { type: "integer", minimum: 1, maximum: 50 },
        include_html: { type: "boolean" }
      },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("extract_text", "Extract text from selector", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxLength: { type: "integer", minimum: 100, maximum: 2e4 }
      },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("extract_links", "Extract links", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxCount: { type: "integer", minimum: 1, maximum: 200 }
      },
      additionalProperties: false
    }),
    defineTool("extract_all_anchors", "Extract all anchor(a) elements info", {
      type: "object",
      properties: {
        maxCount: { type: "integer", minimum: 1, maximum: 500 },
        includeAttributes: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("extract_elements_by_criteria", "Extract elements by selector/tag/id/class/css attribute", {
      type: "object",
      properties: {
        selector: { type: "string" },
        tag: { type: "string" },
        id: { type: "string" },
        className: { type: "string" },
        attrName: { type: "string" },
        attrValue: { type: "string" },
        maxCount: { type: "integer", minimum: 1, maximum: 200 },
        includeHTML: { type: "boolean" },
        includeAttributes: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("extract_buttons_info", "Extract button and clickable-button attributes", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxCount: { type: "integer", minimum: 1, maximum: 200 },
        includeAttributes: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("set_text", "Set text content", {
      type: "object",
      properties: {
        selector: { type: "string" },
        text: { type: "string" }
      },
      required: ["selector", "text"],
      additionalProperties: false
    }),
    defineTool("set_html", "Set inner HTML", {
      type: "object",
      properties: {
        selector: { type: "string" },
        html: { type: "string" }
      },
      required: ["selector", "html"],
      additionalProperties: false
    }),
    defineTool("set_attribute", "Set attribute", {
      type: "object",
      properties: {
        selector: { type: "string" },
        name: { type: "string" },
        value: { type: "string" }
      },
      required: ["selector", "name", "value"],
      additionalProperties: false
    }),
    defineTool("remove_elements", "Remove elements", {
      type: "object",
      properties: { selector: { type: "string" } },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("set_storage", "Persist value by key in extension storage", {
      type: "object",
      properties: {
        key: { type: "string", description: "Storage key. Allowed: letters, digits, ., _, :, -" },
        value: {
          anyOf: [{ type: "object" }, { type: "array" }, { type: "string" }, { type: "number" }, { type: "boolean" }],
          description: "JSON value to persist"
        }
      },
      required: ["key", "value"],
      additionalProperties: false
    }),
    defineTool("get_storage", "Read value by key from extension storage", {
      type: "object",
      properties: {
        key: { type: "string", description: "Storage key" }
      },
      required: ["key"],
      additionalProperties: false
    }),
    defineTool("crypto_encrypt", "Encrypt text with AES/DES/DESede and ECB/CBC", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        key: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        iv: { type: "string" },
        plaintext: { type: "string" },
        plainEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] }
      },
      required: ["plaintext"],
      additionalProperties: false
    }),
    defineTool("crypto_encrypt_direct", "Encrypt with explicit parameters only (no profile)", {
      type: "object",
      properties: {
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        key: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        iv: { type: "string" },
        plaintext: { type: "string" },
        plainEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] }
      },
      required: ["algorithm", "mode", "keyEncoding", "key", "plaintext"],
      additionalProperties: false
    }),
    defineTool("crypto_decrypt", "Decrypt AES/DES/DESede ciphertext", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        key: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        iv: { type: "string" },
        ciphertext: { type: "string" },
        cipherEncoding: { type: "string", enum: ["base64", "hex"] },
        outputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] }
      },
      required: ["ciphertext"],
      additionalProperties: false
    }),
    defineTool("crypto_decrypt_direct", "Decrypt with explicit parameters only (no profile)", {
      type: "object",
      properties: {
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        key: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        iv: { type: "string" },
        ciphertext: { type: "string" },
        cipherEncoding: { type: "string", enum: ["base64", "hex"] },
        outputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] }
      },
      required: ["algorithm", "mode", "keyEncoding", "key", "ciphertext"],
      additionalProperties: false
    }),
    defineTool("rsa_encrypt", "Encrypt with RSA public key (RSA-OAEP)", {
      type: "object",
      properties: {
        publicKey: { type: "string" },
        publicKeyEncoding: { type: "string", enum: ["base64", "hex", "pem"] },
        plaintext: { type: "string" },
        inputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] }
      },
      required: ["publicKey", "plaintext"],
      additionalProperties: false
    }),
    defineTool("rsa_encrypt_direct", "Encrypt with explicit RSA public key parameters", {
      type: "object",
      properties: {
        publicKey: { type: "string" },
        publicKeyEncoding: { type: "string", enum: ["base64", "hex", "pem"] },
        plaintext: { type: "string" },
        inputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] }
      },
      required: ["publicKey", "publicKeyEncoding", "plaintext"],
      additionalProperties: false
    }),
    defineTool("rsa_decrypt", "Decrypt with RSA private key (RSA-OAEP)", {
      type: "object",
      properties: {
        privateKey: { type: "string" },
        privateKeyEncoding: { type: "string", enum: ["base64", "hex", "pem"] },
        ciphertext: { type: "string" },
        inputEncoding: { type: "string", enum: ["base64", "hex"] },
        outputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] }
      },
      required: ["privateKey", "ciphertext"],
      additionalProperties: false
    }),
    defineTool("rsa_decrypt_direct", "Decrypt with explicit RSA private key parameters", {
      type: "object",
      properties: {
        privateKey: { type: "string" },
        privateKeyEncoding: { type: "string", enum: ["base64", "hex", "pem"] },
        ciphertext: { type: "string" },
        inputEncoding: { type: "string", enum: ["base64", "hex"] },
        outputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] }
      },
      required: ["privateKey", "privateKeyEncoding", "ciphertext"],
      additionalProperties: false
    }),
    defineTool("rsa_generate_keypair", "Generate RSA keypair and return base64/hex keys", {
      type: "object",
      properties: {
        modulusLength: { type: "integer", enum: [1024, 2048, 3072, 4096] },
        hash: { type: "string", enum: ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] },
        outputEncoding: { type: "string", enum: ["base64", "hex"] }
      },
      additionalProperties: false
    }),
    defineTool("encoding_convert", "Convert text between utf8/base64/hex/unicode encodings", {
      type: "object",
      properties: {
        text: { type: "string" },
        from: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        to: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] }
      },
      required: ["text", "from", "to"],
      additionalProperties: false
    }),
    defineTool("http_request", "Send arbitrary HTTP request with method/headers/body/query", {
      type: "object",
      properties: {
        url: { type: "string" },
        method: { type: "string" },
        query: {
          anyOf: [{ type: "object" }, { type: "string" }]
        },
        headers: {
          anyOf: [{ type: "object" }, { type: "string" }]
        },
        body: {
          anyOf: [{ type: "object" }, { type: "string" }, { type: "number" }, { type: "boolean" }]
        },
        bodyType: { type: "string", enum: ["auto", "json", "text"] },
        timeoutSec: { type: "integer", minimum: 3, maximum: 300 },
        responseType: { type: "string", enum: ["text", "json", "base64", "hex", "arraybuffer"] },
        responseEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        includeResponseHeaders: { type: "boolean" },
        maxResponseChars: { type: "integer", minimum: 512, maximum: 1e6 }
      },
      required: ["url"],
      additionalProperties: false
    }),
    defineTool("random_uuid", "Generate random UUID v4", {
      type: "object",
      properties: {},
      additionalProperties: false
    }),
    defineTool("random_uuid32", "Generate random UUID v4 without hyphens (32 chars)", {
      type: "object",
      properties: {},
      additionalProperties: false
    }),
    defineTool("random_string", "Generate random string with given length and charset", {
      type: "object",
      properties: {
        length: { type: "integer", minimum: 1, maximum: 4096 },
        charset: { type: "string", enum: ["alnum", "alpha", "lower", "upper", "numeric", "hex", "base64", "base64url", "custom"] },
        customChars: { type: "string", description: "Used when charset=custom or as direct charset source" }
      },
      additionalProperties: false
    }),
    defineTool("random_number", "Generate random number in range", {
      type: "object",
      properties: {
        min: { type: "number" },
        max: { type: "number" },
        integer: { type: "boolean", description: "default true" },
        precision: { type: "integer", minimum: 0, maximum: 12, description: "only for float" }
      },
      additionalProperties: false
    }),
    defineTool("tool_list", "List all available function calling tools", {
      type: "object",
      properties: {
        includeDescription: { type: "boolean" },
        includeParameters: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("open_url", "Open URL in current tab", {
      type: "object",
      properties: {
        url: { type: "string" },
        waitUntilComplete: { type: "boolean" },
        timeoutSec: { type: "integer", minimum: 1, maximum: 120 }
      },
      required: ["url"],
      additionalProperties: false
    }),
    defineTool("wait_for_element", "Wait until selector appears (optionally with text filter)", {
      type: "object",
      properties: {
        selector: { type: "string" },
        text: { type: "string" },
        exact: { type: "boolean" },
        visibleOnly: { type: "boolean" },
        timeoutSec: { type: "integer", minimum: 1, maximum: 120 },
        intervalMs: { type: "integer", minimum: 50, maximum: 2e3 }
      },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("assert_page_state", "Assert page conditions for automation testing", {
      type: "object",
      properties: {
        checks: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["selector", "url", "title", "page_text"] },
              selector: { type: "string" },
              text: { type: "string" },
              exact: { type: "boolean" },
              visibleOnly: { type: "boolean" },
              minCount: { type: "integer", minimum: 0 },
              maxCount: { type: "integer", minimum: 0 },
              contains: { type: "string" },
              value: { type: "string" }
            },
            required: ["type"],
            additionalProperties: false
          }
        }
      },
      required: ["checks"],
      additionalProperties: false
    }),
    defineTool("batch_execute", "Execute multiple tool calls in one request", {
      type: "object",
      properties: {
        stopOnError: { type: "boolean" },
        maxSteps: { type: "integer", minimum: 1, maximum: 100 },
        steps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              tool: { type: "string" },
              args: { type: "object" }
            },
            additionalProperties: false
          }
        }
      },
      required: ["steps"],
      additionalProperties: false
    }),
    defineTool("click_element", "Click element by selector or text filter", {
      type: "object",
      properties: {
        selector: { type: "string" },
        text: { type: "string" },
        exact: { type: "boolean" },
        all: { type: "boolean" },
        index: { type: "integer", minimum: 0 },
        visibleOnly: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("input_text", "Input text into input/textarea/contentEditable element", {
      type: "object",
      properties: {
        selector: { type: "string" },
        text: { type: "string" },
        append: { type: "boolean" },
        all: { type: "boolean" },
        index: { type: "integer", minimum: 0 }
      },
      required: ["selector", "text"],
      additionalProperties: false
    }),
    defineTool("select_option", "Select option in select element by value/text/index", {
      type: "object",
      properties: {
        selector: { type: "string" },
        value: { type: "string" },
        text: { type: "string" },
        optionIndex: { type: "integer", minimum: 0 },
        all: { type: "boolean" },
        index: { type: "integer", minimum: 0 }
      },
      required: ["selector"],
      additionalProperties: false
    }),
    defineTool("scroll_to", "Scroll page to selector or coordinates", {
      type: "object",
      properties: {
        selector: { type: "string" },
        top: { type: "number" },
        left: { type: "number" },
        behavior: { type: "string", enum: ["auto", "smooth"] }
      },
      additionalProperties: false
    }),
    defineTool("extract_table", "Extract table data", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxTables: { type: "integer", minimum: 1, maximum: 20 },
        maxRows: { type: "integer", minimum: 1, maximum: 500 }
      },
      additionalProperties: false
    }),
    defineTool("extract_form_schema", "Extract form schema and fields", {
      type: "object",
      properties: {
        selector: { type: "string" },
        maxForms: { type: "integer", minimum: 1, maximum: 50 },
        maxFields: { type: "integer", minimum: 1, maximum: 1e3 },
        includeHidden: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("extract_meta_tags", "Extract meta tags and canonical/title info", {
      type: "object",
      properties: {
        includeOpenGraph: { type: "boolean" },
        includeTwitter: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("extract_jsonld", "Extract JSON-LD scripts from page", {
      type: "object",
      properties: {
        parse: { type: "boolean", description: "default true, parse JSON if possible" }
      },
      additionalProperties: false
    }),
    defineTool("query_by_text", "Find elements by visible text", {
      type: "object",
      properties: {
        text: { type: "string" },
        selector: { type: "string" },
        exact: { type: "boolean" },
        ignoreCase: { type: "boolean" },
        limit: { type: "integer", minimum: 1, maximum: 200 }
      },
      required: ["text"],
      additionalProperties: false
    }),
    defineTool("hash_digest", "Compute hash digest: MD5/SHA1/SHA256/SHA512", {
      type: "object",
      properties: {
        text: { type: "string" },
        inputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        algorithm: { type: "string", enum: ["MD5", "SHA1", "SHA256", "SHA512"] },
        outputEncoding: { type: "string", enum: ["hex", "base64"] }
      },
      required: ["text"],
      additionalProperties: false
    }),
    defineTool("hmac_sign", "Compute HMAC signature: MD5/SHA1/SHA256/SHA512", {
      type: "object",
      properties: {
        text: { type: "string" },
        inputEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        key: { type: "string" },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex", "unicode"] },
        algorithm: { type: "string", enum: ["MD5", "SHA1", "SHA256", "SHA512"] },
        outputEncoding: { type: "string", enum: ["hex", "base64"] }
      },
      required: ["text", "key"],
      additionalProperties: false
    }),
    defineTool("url_encode", "URL encode text", {
      type: "object",
      properties: {
        text: { type: "string" },
        component: { type: "boolean", description: "true=encodeURIComponent, false=encodeURI" }
      },
      required: ["text"],
      additionalProperties: false
    }),
    defineTool("url_decode", "URL decode text", {
      type: "object",
      properties: {
        text: { type: "string" },
        component: { type: "boolean", description: "true=decodeURIComponent, false=decodeURI" },
        plusAsSpace: { type: "boolean", description: "decode + as space before decoding" }
      },
      required: ["text"],
      additionalProperties: false
    }),
    defineTool("jwt_decode", "Decode JWT header/payload without verifying signature", {
      type: "object",
      properties: {
        token: { type: "string" }
      },
      required: ["token"],
      additionalProperties: false
    }),
    defineTool("jsonpath_query", "Query JSON by JSONPath (supports $, .prop, [index], ['prop'], [*])", {
      type: "object",
      properties: {
        json: {
          anyOf: [{ type: "object" }, { type: "array" }, { type: "string" }]
        },
        path: { type: "string" },
        firstOnly: { type: "boolean" }
      },
      required: ["json", "path"],
      additionalProperties: false
    }),
    defineTool("regex_extract", "Extract by regex pattern", {
      type: "object",
      properties: {
        text: { type: "string" },
        pattern: { type: "string" },
        flags: { type: "string" },
        all: { type: "boolean" },
        group: { type: "integer", minimum: 0 },
        limit: { type: "integer", minimum: 1, maximum: 500 }
      },
      required: ["text", "pattern"],
      additionalProperties: false
    }),
    defineTool("mcp_service_list", "List MCP services in current settings", {
      type: "object",
      properties: {
        includeSecret: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("mcp_service_upsert", "Add or update MCP service by id/name and config", {
      type: "object",
      properties: {
        serviceId: { type: "string" },
        serviceName: { type: "string" },
        id: { type: "string" },
        name: { type: "string" },
        enabled: { type: "boolean" },
        transport: { type: "string", enum: ["streamable_http", "http", "sse", "stdio"] },
        baseURL: { type: "string" },
        apiKey: { type: "string" },
        mcpHeaders: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              value: { type: "string" },
              enabled: { type: "boolean" }
            },
            required: ["name", "value"],
            additionalProperties: false
          }
        },
        headers: {
          anyOf: [
            {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  value: { type: "string" },
                  enabled: { type: "boolean" }
                },
                required: ["name", "value"],
                additionalProperties: false
              }
            },
            { type: "object" }
          ]
        },
        command: { type: "string" },
        args: { type: "string" },
        envText: { type: "string" },
        service: { type: "object" }
      },
      additionalProperties: false
    }),
    defineTool("mcp_service_set_enabled", "Enable/disable MCP service by id/name/index", {
      type: "object",
      properties: {
        serviceId: { type: "string" },
        serviceName: { type: "string" },
        index: { type: "integer", minimum: 0 },
        enabled: { type: "boolean" }
      },
      required: ["enabled"],
      additionalProperties: false
    }),
    defineTool("mcp_service_test", "Test one MCP service and list available tool names", {
      type: "object",
      properties: {
        serviceId: { type: "string" },
        serviceName: { type: "string" },
        index: { type: "integer", minimum: 0 },
        service: { type: "object" }
      },
      additionalProperties: false
    }),
    defineTool("crypto_profile_list", "List persisted crypto profiles", {
      type: "object",
      properties: {
        includeSecret: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("crypto_profile_get", "Get persisted crypto profile by id/name/index", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        id: { type: "string" },
        name: { type: "string" },
        index: { type: "integer", minimum: 0 },
        includeSecret: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("crypto_profile_save", "Create or update persisted crypto profile", {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        algorithm: { type: "string", enum: ["AES", "DES", "DESede"] },
        mode: { type: "string", enum: ["ECB", "CBC"] },
        keySize: { type: "integer", enum: [64, 128, 192, 256] },
        keyEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        keyValue: { type: "string" },
        ivEncoding: { type: "string", enum: ["utf8", "base64", "hex"] },
        ivValue: { type: "string" },
        description: { type: "string" }
      },
      required: ["name", "algorithm", "mode", "keyEncoding", "keyValue"],
      additionalProperties: false
    }),
    defineTool("crypto_profile_delete", "Delete persisted crypto profile(s) by id/name/index, or bulk delete", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        id: { type: "string" },
        name: { type: "string" },
        index: { type: "integer", minimum: 0 },
        profileIds: { type: "array", items: { type: "string" } },
        profileNames: { type: "array", items: { type: "string" } },
        indexes: { type: "array", items: { type: "integer", minimum: 0 } },
        query: { type: "string" },
        all: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("crypto_profile_delete_many", "Alias of crypto_profile_delete for deleting multiple profiles", {
      type: "object",
      properties: {
        profileId: { type: "string" },
        profileName: { type: "string" },
        id: { type: "string" },
        name: { type: "string" },
        index: { type: "integer", minimum: 0 },
        profileIds: { type: "array", items: { type: "string" } },
        profileNames: { type: "array", items: { type: "string" } },
        indexes: { type: "array", items: { type: "integer", minimum: 0 } },
        query: { type: "string" },
        all: { type: "boolean" }
      },
      additionalProperties: false
    }),
    defineTool("get_whole_html", "Get full page HTML", {
      type: "object",
      properties: {},
      additionalProperties: false
    }),
    defineTool("replace_whole_html", "Replace full page HTML", {
      type: "object",
      properties: { html: { type: "string" } },
      required: ["html"],
      additionalProperties: false
    }),
    defineTool("translate_whole_page_to_zh", "Translate full page to Chinese and replace", {
      type: "object",
      properties: { note: { type: "string" } },
      additionalProperties: false
    })
  ];
  if (allowScript) {
    local.push(
      defineTool("execute_script", "Execute JavaScript in current page and return result (prefer `return ...`)", {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "JavaScript code to execute. Prefer explicit `return ...` to get result."
          },
          awaitPromise: {
            type: "boolean",
            description: "Whether to await Promise result. Default: true."
          }
        },
        required: ["code"],
        additionalProperties: false
      }),
      defineTool("append_script", "Append script", {
        type: "object",
        properties: { code: { type: "string" } },
        required: ["code"],
        additionalProperties: false
      })
    );
  }
  return local.concat(mcpToolSpecs || []);
}
function defineTool(name, description, parameters) {
  return {
    type: "function",
    function: {
      name,
      description,
      parameters
    }
  };
}
async function executeToolCall(call, ctx) {
  ensureTaskActive(ctx?.hooks);
  const name = call?.function?.name || "";
  const args = parseToolArgs(call?.function?.arguments || "{}");
  const depth = Number(ctx?.depth || 0);
  switch (name) {
    case "get_page_snapshot":
      return collectPageSnapshot(ctx.tabId);
    case "query_elements":
      return queryElements(ctx.tabId, args);
    case "extract_text":
      return extractText(ctx.tabId, args);
    case "extract_links":
      return extractLinks(ctx.tabId, args);
    case "extract_all_anchors":
      return extractAllAnchors(ctx.tabId, args);
    case "extract_elements_by_criteria":
      return extractElementsByCriteria(ctx.tabId, args);
    case "extract_buttons_info":
      return extractButtonsInfo(ctx.tabId, args);
    case "set_text":
      return setText(ctx.tabId, args);
    case "set_html":
      return setHTML(ctx.tabId, args);
    case "set_attribute":
      return setAttribute(ctx.tabId, args);
    case "remove_elements":
      return removeElements(ctx.tabId, args);
    case "set_storage":
      return setToolStorage(args);
    case "get_storage":
      return getToolStorage(args);
    case "crypto_encrypt":
      return toolCryptoEncrypt(args);
    case "crypto_encrypt_direct":
      return toolCryptoEncryptDirect(args);
    case "crypto_decrypt":
      return toolCryptoDecrypt(args);
    case "crypto_decrypt_direct":
      return toolCryptoDecryptDirect(args);
    case "rsa_encrypt":
      return toolRSAEncrypt(args);
    case "rsa_encrypt_direct":
      return toolRSAEncryptDirect(args);
    case "rsa_decrypt":
      return toolRSADecrypt(args);
    case "rsa_decrypt_direct":
      return toolRSADecryptDirect(args);
    case "rsa_generate_keypair":
      return toolRSAGenerateKeypair(args);
    case "encoding_convert":
      return toolEncodingConvert(args);
    case "http_request":
      return toolHttpRequest(args);
    case "random_uuid":
      return toolRandomUUID(args);
    case "random_uuid32":
      return toolRandomUUID32(args);
    case "random_string":
      return toolRandomString(args);
    case "random_number":
      return toolRandomNumber(args);
    case "tool_list":
      return toolToolList(args, ctx);
    case "open_url":
      return toolOpenURL(ctx.tabId, args);
    case "wait_for_element":
      return toolWaitForElement(ctx.tabId, args);
    case "assert_page_state":
      return toolAssertPageState(ctx.tabId, args);
    case "batch_execute":
      if (depth >= 1) {
        return { ok: false, error: "nested batch_execute is not allowed" };
      }
      return toolBatchExecute(args, { ...ctx, depth });
    case "click_element":
      return toolClickElement(ctx.tabId, args);
    case "input_text":
      return toolInputText(ctx.tabId, args);
    case "select_option":
      return toolSelectOption(ctx.tabId, args);
    case "scroll_to":
      return toolScrollTo(ctx.tabId, args);
    case "extract_table":
      return toolExtractTable(ctx.tabId, args);
    case "extract_form_schema":
      return toolExtractFormSchema(ctx.tabId, args);
    case "extract_meta_tags":
      return toolExtractMetaTags(ctx.tabId, args);
    case "extract_jsonld":
      return toolExtractJsonld(ctx.tabId, args);
    case "query_by_text":
      return toolQueryByText(ctx.tabId, args);
    case "hash_digest":
      return toolHashDigest(args);
    case "hmac_sign":
      return toolHmacSign(args);
    case "url_encode":
      return toolUrlEncode(args);
    case "url_decode":
      return toolUrlDecode(args);
    case "jwt_decode":
      return toolJwtDecode(args);
    case "jsonpath_query":
      return toolJsonpathQuery(args);
    case "regex_extract":
      return toolRegexExtract(args);
    case "mcp_service_list":
      return toolMcpServiceList(args);
    case "mcp_service_upsert":
      return toolMcpServiceUpsert(args);
    case "mcp_service_set_enabled":
      return toolMcpServiceSetEnabled(args);
    case "mcp_service_test":
      return toolMcpServiceTest(args);
    case "crypto_profile_list":
      return toolCryptoProfileList(args);
    case "crypto_profile_get":
      return toolCryptoProfileGet(args);
    case "crypto_profile_save":
      return toolCryptoProfileSave(args);
    case "crypto_profile_delete":
    case "crypto_profile_delete_many":
    case "crypto_profile_remove":
    case "crypto_delete_profile":
      return toolCryptoProfileDelete(args);
    case "append_script":
      if (!ctx.settings.allowScript) {
        return { ok: false, error: "append_script disabled by settings" };
      }
      return appendScript(ctx.tabId, args);
    case "execute_script":
      if (!ctx.settings.allowScript) {
        return { ok: false, error: "execute_script disabled by settings" };
      }
      return executeScriptWithResult(ctx.tabId, args);
    case "get_whole_html":
      return { ok: true, html: await getWholePageHTML(ctx.tabId) };
    case "replace_whole_html":
      return { ok: true, replaced: await replaceWholePageHTML(ctx.tabId, String(args.html || "")) };
    case "translate_whole_page_to_zh": {
      const html = await getWholePageHTML(ctx.tabId);
      const translated = await translateWholePageHTML({
        apiKey: ctx.settings.apiKey,
        model: ctx.settings.model,
        thinkingLevel: ctx.settings.thinkingLevel,
        baseURL: ctx.settings.baseURL,
        timeoutMs: ctx.settings.requestTimeoutSec * 1e3,
        html,
        userPrompt: "\u628A\u6574\u9875\u5185\u5BB9\u7FFB\u8BD1\u6210\u4E2D\u6587\u5E76\u4FDD\u6301\u7ED3\u6784\u4E0D\u53D8",
        stream: false,
        onReasoning: ctx.hooks?.onReasoning,
        hooks: ctx.hooks
      });
      return { ok: true, replaced: await replaceWholePageHTML(ctx.tabId, translated) };
    }
    default:
      if (name.startsWith("mcp_")) {
        return callMCPToolByAlias(ctx.mcpRegistry, name, args);
      }
      return { ok: false, error: `unknown tool: ${name}` };
  }
}
function parseToolArgs(raw) {
  try {
    const parsed = JSON.parse(String(raw || "{}"));
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch (_err) {
  }
  return {};
}
async function queryElements(tabId, args) {
  const selector = String(args.selector || "").trim();
  const limit2 = Math.min(50, Math.max(1, Number(args.limit || 10)));
  const includeHTML = !!args.include_html;
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel, lim, withHTML) => {
      const nodes = Array.from(document.querySelectorAll(sel)).slice(0, lim);
      return {
        ok: true,
        count: nodes.length,
        items: nodes.map((el) => ({
          tag: el.tagName.toLowerCase(),
          text: (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 300),
          html: withHTML ? String(el.innerHTML || "").slice(0, 1200) : void 0
        }))
      };
    },
    [selector, limit2, includeHTML]
  );
}
async function extractText(tabId, args) {
  const selector = String(args.selector || "").trim();
  const maxLength = Math.min(2e4, Math.max(100, Number(args.maxLength || 2e3)));
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel, maxLen) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      const text = nodes.map((n) => (n.innerText || n.textContent || "").trim()).filter(Boolean).join("\n").slice(0, maxLen);
      return { ok: true, selector: sel, count: nodes.length, text };
    },
    [selector, maxLength]
  );
}
async function extractLinks(tabId, args) {
  const selector = String(args.selector || "a").trim() || "a";
  const maxCount = Math.min(200, Math.max(1, Number(args.maxCount || 30)));
  return execOnTab(
    tabId,
    (sel, maxCnt) => {
      const nodes = Array.from(document.querySelectorAll(sel)).filter((n) => n.tagName === "A").slice(0, maxCnt);
      return {
        ok: true,
        count: nodes.length,
        links: nodes.map((n) => ({
          text: (n.innerText || n.textContent || "").trim(),
          href: n.getAttribute("href") || n.href || ""
        }))
      };
    },
    [selector, maxCount]
  );
}
async function extractAllAnchors(tabId, args) {
  const maxCount = Math.min(500, Math.max(1, Number(args.maxCount || 200)));
  const includeAttributes = !!args.includeAttributes;
  return execOnTab(
    tabId,
    (maxCnt, withAttrs) => {
      const nodes = Array.from(document.querySelectorAll("a")).slice(0, maxCnt);
      return {
        ok: true,
        count: nodes.length,
        items: nodes.map((n) => ({
          text: (n.innerText || n.textContent || "").replace(/\s+/g, " ").trim(),
          href: n.getAttribute("href") || n.href || "",
          title: n.getAttribute("title") || "",
          target: n.getAttribute("target") || "",
          rel: n.getAttribute("rel") || "",
          id: n.id || "",
          className: n.className || "",
          attributes: withAttrs ? Array.from(n.attributes || []).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}) : void 0
        }))
      };
    },
    [maxCount, includeAttributes]
  );
}
async function extractElementsByCriteria(tabId, args) {
  const selector = String(args.selector || "").trim();
  const tag = String(args.tag || "").trim().toLowerCase();
  const id = String(args.id || "").trim();
  const className = String(args.className || "").trim();
  const attrName = String(args.attrName || "").trim();
  const attrValue = String(args.attrValue || "");
  const maxCount = Math.min(200, Math.max(1, Number(args.maxCount || 30)));
  const includeHTML = !!args.includeHTML;
  const includeAttributes = !!args.includeAttributes;
  if (!selector && !tag && !id && !className && !attrName) {
    return { ok: false, error: "selector/tag/id/className/attrName \u81F3\u5C11\u9700\u8981\u4E00\u4E2A" };
  }
  return execOnTab(
    tabId,
    (sel, t, elementId, cls, aName, aValue, maxCnt, withHTML, withAttrs) => {
      const toSafeSelectorById = (v) => {
        if (!v) return "";
        if (window.CSS && typeof window.CSS.escape === "function") {
          return `#${window.CSS.escape(v)}`;
        }
        return `#${String(v).replace(/[^a-zA-Z0-9_-]/g, "")}`;
      };
      const queryBySelector = () => {
        if (sel) return Array.from(document.querySelectorAll(sel));
        if (elementId) return Array.from(document.querySelectorAll(toSafeSelectorById(elementId)));
        let baseSel = t || "*";
        if (cls) {
          if (window.CSS && typeof window.CSS.escape === "function") {
            baseSel += `.${window.CSS.escape(cls)}`;
          } else {
            baseSel += `.${String(cls).replace(/[^a-zA-Z0-9_-]/g, "")}`;
          }
        }
        return Array.from(document.querySelectorAll(baseSel));
      };
      let nodes = queryBySelector();
      if (aName) {
        nodes = nodes.filter((el) => {
          if (!el.hasAttribute(aName)) return false;
          if (aValue === "") return true;
          return (el.getAttribute(aName) || "") === aValue;
        });
      }
      nodes = nodes.slice(0, maxCnt);
      return {
        ok: true,
        count: nodes.length,
        items: nodes.map((el) => ({
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: el.className || "",
          text: (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 500),
          html: withHTML ? String(el.innerHTML || "").slice(0, 2e3) : void 0,
          attributes: withAttrs ? Array.from(el.attributes || []).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}) : void 0
        }))
      };
    },
    [selector, tag, id, className, attrName, attrValue, maxCount, includeHTML, includeAttributes]
  );
}
async function extractButtonsInfo(tabId, args) {
  const selector = String(args.selector || "button, input[type='button'], input[type='submit'], [role='button']").trim();
  const maxCount = Math.min(200, Math.max(1, Number(args.maxCount || 100)));
  const includeAttributes = !!args.includeAttributes;
  return execOnTab(
    tabId,
    (sel, maxCnt, withAttrs) => {
      const nodes = Array.from(document.querySelectorAll(sel)).slice(0, maxCnt);
      return {
        ok: true,
        count: nodes.length,
        items: nodes.map((el) => ({
          tag: el.tagName.toLowerCase(),
          id: el.id || "",
          className: el.className || "",
          type: el.getAttribute("type") || "",
          name: el.getAttribute("name") || "",
          value: el.getAttribute("value") || "",
          role: el.getAttribute("role") || "",
          ariaLabel: el.getAttribute("aria-label") || "",
          title: el.getAttribute("title") || "",
          disabled: !!el.disabled || el.hasAttribute("disabled"),
          text: (el.innerText || el.textContent || el.value || "").replace(/\s+/g, " ").trim(),
          attributes: withAttrs ? Array.from(el.attributes || []).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}) : void 0
        }))
      };
    },
    [selector, maxCount, includeAttributes]
  );
}
async function setText(tabId, args) {
  const selector = String(args.selector || "").trim();
  const text = String(args.text || "");
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel, txt) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) n.textContent = txt;
      return { ok: true, updated: nodes.length };
    },
    [selector, text]
  );
}
async function setHTML(tabId, args) {
  const selector = String(args.selector || "").trim();
  const html = String(args.html || "");
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel, h) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) n.innerHTML = h;
      return { ok: true, updated: nodes.length };
    },
    [selector, html]
  );
}
async function setAttribute(tabId, args) {
  const selector = String(args.selector || "").trim();
  const name = String(args.name || "").trim();
  const value = String(args.value || "");
  if (!selector || !name) {
    return { ok: false, error: "selector and name are required" };
  }
  return execOnTab(
    tabId,
    (sel, attr, val) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) n.setAttribute(attr, val);
      return { ok: true, updated: nodes.length };
    },
    [selector, name, value]
  );
}
async function removeElements(tabId, args) {
  const selector = String(args.selector || "").trim();
  if (!selector) {
    return { ok: false, error: "selector is required" };
  }
  return execOnTab(
    tabId,
    (sel) => {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) n.remove();
      return { ok: true, removed: nodes.length };
    },
    [selector]
  );
}
async function appendScript(tabId, args) {
  const code = String(args.code || "");
  if (!code.trim()) {
    return { ok: false, error: "code is required" };
  }
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [code],
    func: (js) => {
      try {
        const fn = new Function(js);
        const value = fn();
        return { ok: true, mode: "main_world_function", value: typeof value === "undefined" ? null : value };
      } catch (err1) {
        try {
          const value = (0, eval)(js);
          return { ok: true, mode: "main_world_eval", value: typeof value === "undefined" ? null : value };
        } catch (err2) {
          return {
            ok: false,
            error: `script execution blocked or failed: ${String(err2 || err1)}`,
            hint: "\u5F53\u524D\u9875\u9762\u53EF\u80FD\u53D7 CSP \u9650\u5236\u3002\u53EF\u6539\u7528 DOM \u5DE5\u5177\uFF08set_text/set_html/set_attribute/remove_elements\uFF09\u6267\u884C\u64CD\u4F5C\u3002"
          };
        }
      }
    }
  });
  return result?.[0]?.result || { ok: false, error: "no result" };
}
async function executeScriptWithResult(tabId, args) {
  const code = String(args.code || "");
  const awaitPromise = args.awaitPromise !== false;
  if (!code.trim()) {
    return { ok: false, error: "code is required" };
  }
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    args: [code, awaitPromise],
    func: async (js, waitPromise) => {
      const seen = /* @__PURE__ */ new WeakSet();
      const toSerializable = (value, depth = 0) => {
        if (value === null || typeof value === "undefined") return value ?? null;
        const t = typeof value;
        if (t === "string" || t === "number" || t === "boolean") return value;
        if (t === "bigint") return `${value.toString()}n`;
        if (t === "symbol") return String(value);
        if (t === "function") return `[Function ${value.name || "anonymous"}]`;
        if (value instanceof Date) return value.toISOString();
        if (value instanceof Error) {
          return {
            name: String(value.name || "Error"),
            message: String(value.message || ""),
            stack: String(value.stack || "")
          };
        }
        if (typeof Element !== "undefined" && value instanceof Element) {
          return {
            nodeType: "element",
            tag: String(value.tagName || "").toLowerCase(),
            id: String(value.id || ""),
            className: String(value.className || "")
          };
        }
        if (typeof Node !== "undefined" && value instanceof Node) {
          return {
            nodeType: String(value.nodeName || "").toLowerCase(),
            text: String(value.textContent || "").slice(0, 300)
          };
        }
        if (depth >= 4) return "[MaxDepth]";
        if (Array.isArray(value)) {
          return value.slice(0, 80).map((item) => toSerializable(item, depth + 1));
        }
        if (t === "object") {
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
          const out = {};
          let i = 0;
          for (const key of Object.keys(value)) {
            out[key] = toSerializable(value[key], depth + 1);
            i += 1;
            if (i >= 80) break;
          }
          return out;
        }
        return String(value);
      };
      try {
        const fn = new Function(`"use strict"; return (async () => {
${js}
})();`);
        let value = fn();
        if (waitPromise && value && typeof value.then === "function") {
          value = await value;
        }
        if (typeof value === "undefined") {
          try {
            let fallback = (0, eval)(js);
            if (waitPromise && fallback && typeof fallback.then === "function") {
              fallback = await fallback;
            }
            if (typeof fallback !== "undefined") {
              return {
                ok: true,
                mode: "execute_script_eval_fallback",
                value: toSerializable(fallback),
                note: "script block has no return, used eval fallback value"
              };
            }
          } catch (_fallbackErr) {
          }
          return {
            ok: true,
            mode: "execute_script_function",
            value: null,
            note: "script returned undefined, add `return ...` to get explicit value"
          };
        }
        return {
          ok: true,
          mode: "execute_script_function",
          value: toSerializable(value)
        };
      } catch (err1) {
        try {
          let value = (0, eval)(js);
          if (waitPromise && value && typeof value.then === "function") {
            value = await value;
          }
          return {
            ok: true,
            mode: "execute_script_eval",
            value: typeof value === "undefined" ? null : toSerializable(value),
            note: typeof value === "undefined" ? "expression result is undefined, add `return ...`" : void 0
          };
        } catch (err2) {
          return {
            ok: false,
            error: `script execution blocked or failed: ${String(err2 || err1)}`,
            hint: "\u5F53\u524D\u9875\u9762\u53EF\u80FD\u53D7 CSP \u9650\u5236\u3002\u53EF\u6539\u7528 DOM \u5DE5\u5177\uFF08set_text / set_html / set_attribute / remove_elements\uFF09\u3002"
          };
        }
      }
    }
  });
  return result?.[0]?.result || { ok: false, error: "no result" };
}
async function execOnTab(tabId, func, args = []) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    args,
    func
  });
  return result?.[0]?.result || { ok: false, error: "no result" };
}
async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs?.[0] || null;
}
function isWholePageTranslateRequest(prompt) {
  const text = String(prompt || "").toLowerCase();
  const hasPageWord = text.includes("\u6574\u9875") || text.includes("\u6574\u4E2A\u9875\u9762") || text.includes("\u5F53\u524D\u9875\u9762") || text.includes("whole page");
  const hasTranslateWord = text.includes("\u7FFB\u8BD1") || text.includes("\u8BD1\u6210") || text.includes("translate");
  return hasPageWord && hasTranslateWord;
}
async function getWholePageHTML(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const docType = document.doctype ? `<!DOCTYPE ${document.doctype.name}${document.doctype.publicId ? ` PUBLIC "${document.doctype.publicId}"` : ""}${document.doctype.systemId ? ` "${document.doctype.systemId}"` : ""}>` : "<!DOCTYPE html>";
      return `${docType}
${document.documentElement.outerHTML}`;
    }
  });
  return String(result?.[0]?.result || "");
}
async function replaceWholePageHTML(tabId, html) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    args: [String(html || "")],
    func: (newHTML) => {
      document.open();
      document.write(newHTML);
      document.close();
      return { title: document.title || "", url: location.href };
    }
  });
  return result?.[0]?.result || {};
}
function stripCodeFence(text) {
  const raw = String(text || "").trim();
  const match = raw.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : raw;
}
async function translateWholePageHTML({ apiKey, model, thinkingLevel, baseURL, timeoutMs, html, userPrompt, stream, onDelta, onReasoning, hooks }) {
  const systemPrompt = [
    "\u4F60\u662F\u7F51\u9875\u7FFB\u8BD1\u5668\u3002",
    "\u628A\u8F93\u5165 HTML \u4E2D\u53EF\u89C1\u82F1\u6587\u7FFB\u8BD1\u6210\u4E2D\u6587\u3002",
    "\u4FDD\u6301 HTML \u7ED3\u6784\u3001\u6807\u7B7E\u3001\u5C5E\u6027\u3001\u811A\u672C\u548C\u6837\u5F0F\u57FA\u672C\u4E0D\u53D8\u3002",
    "\u53EA\u8F93\u51FA\u5B8C\u6574 HTML\uFF0C\u4E0D\u8981\u89E3\u91CA\u3002"
  ].join("\n");
  const text = await requestModelText({
    apiKey,
    model,
    thinkingLevel,
    baseURL,
    timeoutMs,
    systemPrompt,
    userPayload: { instruction: userPrompt, html },
    stream: !!stream,
    onDelta,
    onReasoning,
    hooks
  });
  const cleaned = stripCodeFence(text);
  if (!cleaned.toLowerCase().includes("<html")) {
    throw new Error("\u6A21\u578B\u672A\u8FD4\u56DE\u5B8C\u6574 HTML\uFF0C\u5DF2\u4E2D\u6B62\u66FF\u6362");
  }
  return cleaned;
}
async function collectPageSnapshot(tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const cssEscape = (value) => {
        if (window.CSS && typeof window.CSS.escape === "function") {
          return window.CSS.escape(value);
        }
        return String(value).replace(/[^a-zA-Z0-9_-]/g, "");
      };
      const getSelector = (el) => {
        if (!el || el.nodeType !== 1) return "";
        if (el.id) return `#${cssEscape(el.id)}`;
        const parts = [];
        let cur = el;
        while (cur && cur.nodeType === 1 && parts.length < 5) {
          let seg = cur.tagName.toLowerCase();
          const classNames = Array.from(cur.classList || []).map((name) => name.trim()).filter(Boolean).slice(0, 2).map((name) => `.${cssEscape(name)}`).join("");
          seg += classNames;
          if (cur.parentElement) {
            const same = Array.from(cur.parentElement.children).filter((n) => n.tagName === cur.tagName);
            if (same.length > 1) {
              seg += `:nth-of-type(${same.indexOf(cur) + 1})`;
            }
          }
          parts.unshift(seg);
          cur = cur.parentElement;
        }
        return parts.join(" > ");
      };
      const pick = Array.from(
        document.querySelectorAll("h1,h2,h3,h4,p,li,a,button,label,span,strong,em,td,th,input,textarea")
      ).filter((el) => {
        const text = el.tagName === "INPUT" || el.tagName === "TEXTAREA" ? el.value || el.placeholder || "" : el.textContent || "";
        return text.trim().length > 0;
      }).slice(0, 180).map((el) => {
        const text = el.tagName === "INPUT" || el.tagName === "TEXTAREA" ? el.value || el.placeholder || "" : el.textContent || "";
        return {
          selector: getSelector(el),
          tag: el.tagName.toLowerCase(),
          text: text.replace(/\s+/g, " ").trim().slice(0, 180),
          href: el.tagName === "A" ? el.getAttribute("href") || "" : ""
        };
      });
      const selectedText = window.getSelection()?.toString().trim() || "";
      const bodyText = (document.body?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 5e3);
      return { title: document.title || "", url: location.href, selectedText, bodyText, nodes: pick };
    }
  });
  return result?.[0]?.result || {};
}
async function fetchMCPTools(settings) {
  const enabledServices = Array.isArray(settings.mcpServices) ? settings.mcpServices.filter((item) => item && item.enabled) : [];
  if (enabledServices.length === 0) {
    return { toolSpecs: [], aliasMap: {}, errors: [] };
  }
  const resolved = await Promise.all(enabledServices.map((service) => fetchMCPToolsForService(service)));
  const toolSpecs = [];
  const aliasMap = {};
  const errors = [];
  for (const item of resolved) {
    if (!item.ok) {
      errors.push(item.error || "\u672A\u77E5 MCP \u9519\u8BEF");
      continue;
    }
    const service = item.service;
    const serviceName = getMCPServiceName(service);
    if (!Array.isArray(item.tools) || item.tools.length === 0) {
      errors.push(toMCPError(service, "\u672A\u8FD4\u56DE\u53EF\u7528\u5DE5\u5177\u5217\u8868\uFF080 \u4E2A tools\uFF09\uFF0C\u8BF7\u68C0\u67E5 transport\u3001URL \u4E0E\u9274\u6743\u914D\u7F6E"));
      continue;
    }
    for (const t of item.tools) {
      const realName = String(t?.name || "").trim();
      if (!realName) {
        continue;
      }
      const alias = toSafeMCPAlias(service.id, realName, aliasMap);
      aliasMap[alias] = {
        serviceId: service.id,
        serviceName,
        transport: service.transport,
        baseURL: service.baseURL,
        apiKey: service.apiKey,
        mcpHeaders: service.mcpHeaders,
        command: service.command,
        args: service.args,
        envText: service.envText,
        realName
      };
      toolSpecs.push(
        defineTool(
          alias,
          `[${serviceName}] ${String(t?.description || `MCP tool: ${realName}`)}`,
          normalizeToolSchema(t?.input_schema || t?.parameters || t?.inputSchema)
        )
      );
    }
  }
  if (toolSpecs.length === 0 && errors.length === 0 && enabledServices.length > 0) {
    errors.push("MCP \u5DF2\u542F\u7528\u4F46\u672A\u52A0\u8F7D\u5230\u4EFB\u4F55\u5DE5\u5177\uFF0C\u8BF7\u68C0\u67E5\u670D\u52A1\u662F\u5426\u8FD4\u56DE tools/list\u3002");
  }
  return { toolSpecs, aliasMap, errors };
}
function getMCPServiceName(service) {
  const name = String(service?.name || "").trim();
  return name || `MCP(${service?.transport || "http"})`;
}
function toMCPError(service, message) {
  return `[${getMCPServiceName(service)}] ${message}`;
}
async function fetchMCPToolsForService(service) {
  if (!service?.baseURL) {
    return { ok: false, service, error: toMCPError(service, "\u672A\u914D\u7F6E Base URL/\u6865\u63A5 URL") };
  }
  if (service.transport === "stdio" && !String(service.command || "").trim()) {
    return { ok: false, service, error: toMCPError(service, "STDIO \u6A21\u5F0F\u7F3A\u5C11 command") };
  }
  try {
    if (service.transport === "streamable_http") {
      const result = await callStreamableHTTP(service, "tools/list");
      const tools2 = parseMCPToolsFromResponse(result?.tools ? result : result?.result || result);
      return { ok: true, service, tools: tools2 };
    }
    if (service.transport === "sse" && isLikelyDirectSSEEndpoint(service)) {
      const result = await callSSEMCP(service, "tools/list", {});
      const tools2 = parseMCPToolsFromResponse(result?.tools ? result : result?.result || result);
      return { ok: true, service, tools: tools2 };
    }
    if (service.transport === "http") {
      const resp2 = await tracedFetch(
        joinURL(service.baseURL, "tools"),
        {
          method: "GET",
          headers: buildMCPHeaders(service)
        },
        null,
        "MCP Tools List"
      );
      const data2 = await resp2.json().catch(() => ({}));
      if (!resp2.ok) {
        return {
          ok: false,
          service,
          error: toMCPError(service, `${data2?.error?.message || `MCP /tools HTTP ${resp2.status}`} (${joinURL(service.baseURL, "tools")})`)
        };
      }
      const tools2 = parseMCPToolsFromResponse(data2);
      return { ok: true, service, tools: tools2 };
    }
    const bridgePayload = buildBridgeTransportPayload(service);
    const resp = await tracedFetch(
      joinURL(service.baseURL, "tools"),
      {
        method: "POST",
        headers: buildMCPHeaders(service),
        body: JSON.stringify(bridgePayload)
      },
      null,
      "MCP Bridge Tools List"
    );
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return {
        ok: false,
        service,
        error: toMCPError(
          service,
          `${data?.error?.message || `MCP bridge /tools HTTP ${resp.status}`} (${joinURL(service.baseURL, "tools")})`
        )
      };
    }
    const tools = parseMCPToolsFromResponse(data);
    return { ok: true, service, tools };
  } catch (err) {
    return { ok: false, service, error: toMCPError(service, String(err)) };
  }
}
function parseMCPToolsFromResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tools)) return data.tools;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}
function buildBridgeTransportPayload(service) {
  if (service.transport === "stdio") {
    return {
      transport: "stdio",
      command: String(service.command || "").trim(),
      args: parseStdioArgs(service.args),
      env: parseStdioEnv(service.envText)
    };
  }
  if (service.transport === "sse") {
    return {
      transport: "sse"
    };
  }
  return {
    transport: String(service.transport || "http")
  };
}
function parseStdioArgs(raw) {
  const text = String(raw || "").trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v));
      }
    } catch (_err) {
    }
  }
  const tokens = text.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  return tokens.map((token) => token.replace(/^['"]|['"]$/g, ""));
}
function parseStdioEnv(raw) {
  const text = String(raw || "").trim();
  if (!text) {
    return {};
  }
  if (text.startsWith("{")) {
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        return obj;
      }
    } catch (_err) {
    }
  }
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const row = line.trim();
    if (!row || row.startsWith("#")) continue;
    const i = row.indexOf("=");
    if (i <= 0) continue;
    const key = row.slice(0, i).trim();
    const value = row.slice(i + 1).trim();
    if (key) env[key] = value;
  }
  return env;
}
function normalizeToolSchema(schema) {
  if (schema && typeof schema === "object") return schema;
  return { type: "object", properties: {}, additionalProperties: true };
}
function toSafeMCPAlias(serviceId, realName, existingMap) {
  const safeServiceId = String(serviceId || "svc").replace(/[^a-zA-Z0-9_]/g, "_");
  const safeName = String(realName || "tool").replace(/[^a-zA-Z0-9_]/g, "_");
  const base = `mcp_${safeServiceId}_${safeName}`;
  let alias = base;
  let idx = 2;
  while (existingMap[alias]) {
    alias = `${base}_${idx}`;
    idx += 1;
  }
  return alias;
}
async function callMCPToolByAlias(mcpRegistry, alias, args) {
  const toolEntry = mcpRegistry?.aliasMap?.[alias];
  if (!toolEntry) {
    return { ok: false, error: `unknown MCP alias: ${alias}` };
  }
  try {
    if (toolEntry.transport === "streamable_http") {
      const result = await callStreamableHTTP(toolEntry, "tools/call", {
        name: toolEntry.realName,
        arguments: args || {}
      });
      return { ok: true, result: typeof result?.result !== "undefined" ? result.result : result };
    }
    if (toolEntry.transport === "sse" && isLikelyDirectSSEEndpoint(toolEntry)) {
      const result = await callSSEMCP(toolEntry, "tools/call", {
        name: toolEntry.realName,
        arguments: args || {}
      });
      return { ok: true, result: typeof result?.result !== "undefined" ? result.result : result };
    }
    if (toolEntry.transport === "http") {
      const resp2 = await tracedFetch(
        joinURL(toolEntry.baseURL, "call"),
        {
          method: "POST",
          headers: buildMCPHeaders(toolEntry),
          body: JSON.stringify({ name: toolEntry.realName, arguments: args || {} })
        },
        null,
        "MCP Tool Call"
      );
      const data2 = await resp2.json().catch(() => ({}));
      if (!resp2.ok) {
        return {
          ok: false,
          error: data2?.error?.message || `[${toolEntry.serviceName}] MCP /call HTTP ${resp2.status} (${joinURL(toolEntry.baseURL, "call")})`
        };
      }
      return { ok: true, result: typeof data2?.result !== "undefined" ? data2.result : data2 };
    }
    const bridgePayload = {
      ...buildBridgeTransportPayload(toolEntry),
      name: toolEntry.realName,
      arguments: args || {}
    };
    const resp = await tracedFetch(
      joinURL(toolEntry.baseURL, "call"),
      {
        method: "POST",
        headers: buildMCPHeaders(toolEntry),
        body: JSON.stringify(bridgePayload)
      },
      null,
      "MCP Bridge Tool Call"
    );
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      return {
        ok: false,
        error: data?.error?.message || `[${toolEntry.serviceName}] MCP bridge /call HTTP ${resp.status} (${joinURL(toolEntry.baseURL, "call")})`
      };
    }
    return { ok: true, result: typeof data?.result !== "undefined" ? data.result : data };
  } catch (err) {
    return { ok: false, error: `[${toolEntry.serviceName}] ${String(err)}` };
  }
}
function isLikelyDirectSSEEndpoint(service) {
  const raw = String(service?.baseURL || "").trim().toLowerCase();
  if (!raw) return false;
  try {
    const url = new URL(raw);
    const path2 = String(url.pathname || "").toLowerCase();
    if (path2.endsWith("/sse") || path2.endsWith("/sse/")) return true;
    if (path2.includes("/sse/")) return true;
    if (path2.endsWith("/events") || path2.endsWith("/event-stream")) return true;
  } catch (_err) {
  }
  return /\/sse(?:\/|\?|$)/.test(raw);
}
function normalizeSSEHandshakeEndpoint(baseURL) {
  const raw = String(baseURL || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    let p = String(u.pathname || "");
    p = p.replace(/\/+$/, "");
    if (/\/sse\/(tools|call)$/i.test(p)) {
      p = p.replace(/\/(tools|call)$/i, "");
      u.pathname = p || "/";
      return u.toString();
    }
    return u.toString();
  } catch (_err) {
    return raw.replace(/\/sse\/(tools|call)(\?|$)/i, "/sse$2");
  }
}
function getMcpSSESessionKey(service) {
  return `${getMcpServiceCacheKey(service)}|sse`;
}
function clearSSESession(service) {
  const key = getMcpSSESessionKey(service);
  if (!Object.prototype.hasOwnProperty.call(mcpSSESessions, key)) {
    return;
  }
  const entry = mcpSSESessions[key];
  try {
    if (entry?.reader && typeof entry.reader.cancel === "function") {
      entry.reader.cancel();
    }
  } catch (_err) {
  }
  try {
    if (entry?.controller && typeof entry.controller.abort === "function") {
      entry.controller.abort();
    }
  } catch (_err) {
  }
  rejectAllSSEPending(entry, "SSE session cleared");
  delete mcpSSESessions[key];
}
function parseSSEBlocks(buffer) {
  const normalized = String(buffer || "");
  const parts = normalized.split(/\r?\n\r?\n/);
  const remain = parts.pop() || "";
  return { blocks: parts, remain };
}
function parseSSEBlock(block) {
  const lines = String(block || "").split(/\r?\n/);
  let event = "";
  const dataLines = [];
  for (const line of lines) {
    const row = String(line || "").trim();
    if (!row) continue;
    if (row.startsWith("event:")) {
      event = row.slice(6).trim();
      continue;
    }
    if (row.startsWith("data:")) {
      dataLines.push(row.slice(5).trim());
    }
  }
  return { event: event.toLowerCase(), data: dataLines.join("\n").trim() };
}
function normalizeRpcID(id) {
  if (typeof id === "string") return id.trim();
  if (typeof id === "number" || typeof id === "bigint") return String(id);
  return "";
}
function rejectAllSSEPending(entry, reason) {
  if (!entry?.pending || typeof entry.pending.forEach !== "function") return;
  const text = String(reason || "SSE session closed");
  entry.pending.forEach((waiter) => {
    try {
      if (waiter?.timerId) clearTimeout(waiter.timerId);
    } catch (_err) {
    }
    try {
      if (typeof waiter?.reject === "function") waiter.reject(new Error(text));
    } catch (_err) {
    }
  });
  try {
    entry.pending.clear();
  } catch (_err) {
  }
}
function consumeSSEInbox(entry, requestId) {
  if (!entry?.inbox || typeof entry.inbox.get !== "function") return null;
  const rid = normalizeRpcID(requestId);
  if (!rid) return null;
  const hit = entry.inbox.get(rid);
  if (typeof hit === "undefined") return null;
  try {
    entry.inbox.delete(rid);
  } catch (_err) {
  }
  return hit;
}
function waitForSSEJsonRpcResponse(entry, requestId, timeoutMs = 15e3) {
  const rid = normalizeRpcID(requestId);
  if (!rid) return Promise.resolve(null);
  const inboxHit = consumeSSEInbox(entry, rid);
  if (inboxHit) return Promise.resolve(inboxHit);
  if (!entry.pending || typeof entry.pending.set !== "function") {
    entry.pending = /* @__PURE__ */ new Map();
  }
  return new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      try {
        entry.pending.delete(rid);
      } catch (_err) {
      }
      reject(new Error(`SSE response timeout for request id=${rid}`));
    }, Math.max(1500, Number(timeoutMs || 0)));
    entry.pending.set(rid, { resolve, reject, timerId });
  });
}
function resolveSSEPostURL(baseURL, rawData) {
  const data = String(rawData || "").trim();
  if (!data) return "";
  if (/^https?:\/\//i.test(data)) return data;
  try {
    return new URL(data, String(baseURL || "")).toString();
  } catch (_err) {
    return "";
  }
}
function extractSessionIdFromURL(urlText) {
  const raw = String(urlText || "").trim();
  if (!raw) return "";
  try {
    const u = new URL(raw);
    const keys = ["session_id", "sessionId", "sid", "session-id"];
    for (const key of keys) {
      const value = String(u.searchParams.get(key) || "").trim();
      if (value) return value;
    }
  } catch (_err) {
  }
  return "";
}
function buildSSEHeaders(service, extra = {}) {
  const headers = {
    Accept: "text/event-stream, application/json",
    ...mcpHeadersToObject(service, { sessionId: extra.sessionId })
  };
  return headers;
}
async function openSSESession(service) {
  const endpoint = normalizeSSEHandshakeEndpoint(service.baseURL);
  const key = getMcpSSESessionKey(service);
  const exists = mcpSSESessions[key];
  if (exists?.postURL && !exists?.closed) {
    return exists;
  }
  if (exists?.openingPromise) {
    return exists.openingPromise;
  }
  const openingPromise = (async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch (_err) {
      }
    }, 8e3);
    try {
      const resp = await fetch(endpoint, {
        method: "GET",
        headers: buildSSEHeaders(service),
        signal: controller.signal
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(txt || `SSE handshake HTTP ${resp.status}`);
      }
      const headerSessionId = readMcpSessionIDFromHeaders(resp.headers);
      let postURL = "";
      let sessionId = headerSessionId;
      let reader = null;
      let decoder = null;
      let remain = "";
      const ctype = String(resp.headers.get("content-type") || "").toLowerCase();
      if (ctype.includes("application/json")) {
        const data = await resp.json().catch(() => ({}));
        postURL = resolveSSEPostURL(endpoint, data?.endpoint || data?.url || data?.postUrl || data?.messageUrl || "");
        sessionId = String(data?.sessionId || data?.session_id || sessionId || "").trim();
      } else if (resp.body && typeof resp.body.getReader === "function") {
        reader = resp.body.getReader();
        decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          remain += decoder.decode(value, { stream: true });
          const parsed = parseSSEBlocks(remain);
          remain = parsed.remain;
          for (const block of parsed.blocks) {
            const evt = parseSSEBlock(block);
            if (!evt.data) continue;
            if (evt.event.includes("endpoint") || evt.event.includes("message")) {
              postURL = resolveSSEPostURL(endpoint, evt.data);
            } else {
              try {
                const asObj = JSON.parse(evt.data);
                if (!postURL) {
                  postURL = resolveSSEPostURL(endpoint, asObj?.endpoint || asObj?.url || asObj?.postUrl || "");
                }
                if (!sessionId) {
                  sessionId = String(asObj?.sessionId || asObj?.session_id || "").trim();
                }
              } catch (_err) {
                if (!postURL && (evt.data.startsWith("/") || /^https?:\/\//i.test(evt.data))) {
                  postURL = resolveSSEPostURL(endpoint, evt.data);
                }
              }
            }
            if (postURL) break;
          }
          if (postURL) break;
        }
      } else {
        const text = await resp.text().catch(() => "");
        const parsed = parseSSEBlock(text);
        postURL = resolveSSEPostURL(endpoint, parsed.data);
      }
      if (!postURL) {
        throw new Error("SSE handshake failed: no endpoint event received");
      }
      if (!sessionId) {
        sessionId = extractSessionIdFromURL(postURL);
      }
      const entry = {
        postURL,
        sessionId,
        initialized: false,
        updatedAt: Date.now(),
        controller,
        reader,
        pending: /* @__PURE__ */ new Map(),
        inbox: /* @__PURE__ */ new Map(),
        closed: false,
        openingPromise: null
      };
      mcpSSESessions[key] = entry;
      if (reader && decoder) {
        void (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              remain += decoder.decode(value, { stream: true });
              const parsed = parseSSEBlocks(remain);
              remain = parsed.remain;
              for (const block of parsed.blocks) {
                const evt = parseSSEBlock(block);
                if (!evt.data) continue;
                try {
                  const asObj = JSON.parse(evt.data);
                  const sid = String(asObj?.sessionId || asObj?.session_id || "").trim();
                  if (sid) {
                    entry.sessionId = sid;
                    entry.updatedAt = Date.now();
                  }
                  if (asObj && typeof asObj === "object" && Object.prototype.hasOwnProperty.call(asObj, "id")) {
                    const rid = normalizeRpcID(asObj.id);
                    if (rid) {
                      const waiter = entry.pending?.get(rid);
                      if (waiter) {
                        try {
                          if (waiter.timerId) clearTimeout(waiter.timerId);
                        } catch (_err) {
                        }
                        try {
                          entry.pending.delete(rid);
                        } catch (_err) {
                        }
                        if (asObj.error) {
                          const detail = extractMcpErrorMessage(asObj) || "SSE RPC error";
                          waiter.reject(createMcpHttpError(400, detail, asObj));
                        } else {
                          waiter.resolve(asObj);
                        }
                      } else if (entry.inbox && typeof entry.inbox.set === "function") {
                        entry.inbox.set(rid, asObj);
                      }
                    }
                  }
                } catch (_err) {
                }
              }
            }
          } catch (_err) {
          } finally {
            entry.closed = true;
            rejectAllSSEPending(entry, "SSE stream closed");
            if (mcpSSESessions[key] === entry) {
              delete mcpSSESessions[key];
            }
          }
        })();
      }
      return entry;
    } finally {
      clearTimeout(timeoutId);
    }
  })();
  mcpSSESessions[key] = { openingPromise };
  try {
    return await openingPromise;
  } catch (err) {
    if (mcpSSESessions[key]?.openingPromise === openingPromise) {
      delete mcpSSESessions[key];
    }
    throw err;
  }
}
async function postSSEJSONRPC(service, session, method, params, options = {}) {
  const payload = {
    jsonrpc: "2.0",
    method: String(method || "")
  };
  let requestId = null;
  if (!options.notification) {
    requestId = nextMcpRpcID();
    payload.id = requestId;
  }
  if (typeof params !== "undefined") {
    payload.params = params;
  }
  const resp = await tracedFetch(
    session.postURL,
    {
      method: "POST",
      headers: {
        ...buildMCPHeaders(service, { sessionId: session.sessionId }),
        Accept: "application/json, text/event-stream"
      },
      body: JSON.stringify(payload)
    },
    null,
    "MCP SSE Call"
  );
  const data = await parseJSONOrSSEResponse(resp);
  const sid = readMcpSessionIDFromHeaders(resp.headers);
  if (sid) {
    session.sessionId = sid;
  }
  if (!resp.ok) {
    const detail = extractMcpErrorMessage(data);
    throw createMcpHttpError(resp.status, detail || `SSE RPC HTTP ${resp.status}`, data);
  }
  if (options.notification) {
    return data;
  }
  if (data && typeof data === "object" && (Object.prototype.hasOwnProperty.call(data, "result") || Object.prototype.hasOwnProperty.call(data, "error"))) {
    return data;
  }
  const rid = normalizeRpcID(requestId);
  if (!rid) {
    return data;
  }
  const streamData = await waitForSSEJsonRpcResponse(
    session,
    rid,
    Math.max(15e3, Number(options.timeoutMs || 0), Number(service?.requestTimeoutSec || 0) * 1e3 || 0)
  );
  if (streamData && typeof streamData === "object" && streamData.error) {
    const detail2 = extractMcpErrorMessage(streamData);
    throw createMcpHttpError(400, detail2 || "SSE RPC error", streamData);
  }
  return streamData || data;
}
async function ensureSSEInitialized(service, session) {
  if (session.initialized) return;
  const initParams = {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "smartpage-agent",
      version: "0.1.0"
    }
  };
  await postSSEJSONRPC(service, session, "initialize", initParams);
  try {
    await postSSEJSONRPC(service, session, "notifications/initialized", {}, { notification: true });
  } catch (_err) {
  }
  session.initialized = true;
}
async function callSSEMCP(service, method, params) {
  const endpoint = String(service.baseURL || "").trim();
  const normalizedParams = method === "tools/list" && params && typeof params === "object" && Object.keys(params).length === 0 ? void 0 : params;
  try {
    let session = await openSSESession(service);
    if (method !== "initialize" && method !== "notifications/initialized") {
      await ensureSSEInitialized(service, session);
    }
    const data = await postSSEJSONRPC(service, session, method, normalizedParams);
    if (data && typeof data === "object" && data.error) {
      const msg = data?.error?.message || JSON.stringify(data.error);
      throw new Error(`SSE RPC error: ${msg}`);
    }
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "result")) {
      return data.result;
    }
    return data;
  } catch (err) {
    const status = Number(err?.status || 0);
    const retriable = status === 400 || status === 401 || status === 403 || status === 404;
    if (retriable) {
      clearSSESession(service);
      try {
        const session2 = await openSSESession(service);
        if (method !== "initialize" && method !== "notifications/initialized") {
          await ensureSSEInitialized(service, session2);
        }
        const data2 = await postSSEJSONRPC(service, session2, method, normalizedParams);
        if (data2 && typeof data2 === "object" && data2.error) {
          const msg2 = data2?.error?.message || JSON.stringify(data2.error);
          throw new Error(`SSE RPC error: ${msg2}`);
        }
        if (data2 && typeof data2 === "object" && Object.prototype.hasOwnProperty.call(data2, "result")) {
          return data2.result;
        }
        return data2;
      } catch (err2) {
        const detail2 = extractMcpErrorMessage(err2?.data) || String(err2?.message || err2);
        throw new Error(`SSE MCP error (${endpoint}): ${detail2}`);
      }
    }
    const detail = extractMcpErrorMessage(err?.data) || String(err?.message || err);
    throw new Error(`SSE MCP error (${endpoint}): ${detail}`);
  }
}
function buildMCPHeaders(service, extra = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    ...mcpHeadersToObject(service, { sessionId: extra.sessionId })
  };
  return headers;
}
function nextMcpRpcID() {
  mcpRpcSeq += 1;
  return mcpRpcSeq;
}
function getMcpServiceCacheKey(service) {
  return `${String(service?.id || service?.serviceId || "")}|${String(service?.baseURL || "")}`;
}
function readMcpSessionIDFromHeaders(headers) {
  if (!headers) return "";
  return String(
    headers.get("mcp-session-id") || headers.get("MCP-Session-Id") || headers.get("x-mcp-session-id") || ""
  ).trim();
}
function extractMcpErrorMessage(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object") {
    if (data.error && typeof data.error === "object" && data.error.message) {
      return String(data.error.message);
    }
    if (typeof data.message === "string" && data.message) {
      return data.message;
    }
    if (typeof data.detail === "string" && data.detail) {
      return data.detail;
    }
    if (typeof data.__raw_text === "string" && data.__raw_text) {
      return data.__raw_text;
    }
  }
  return "";
}
function createMcpHttpError(status, message, data) {
  const err = new Error(message || `HTTP ${status}`);
  err.status = Number(status || 0);
  err.data = data;
  return err;
}
async function postStreamableHTTP(service, method, params, options = {}) {
  const endpoint = String(service.baseURL || "").trim();
  const notification = !!options.notification;
  const payload = {
    jsonrpc: "2.0",
    method: String(method || "")
  };
  if (!notification) {
    payload.id = nextMcpRpcID();
  }
  if (typeof params !== "undefined") {
    payload.params = params;
  }
  const resp = await tracedFetch(
    endpoint,
    {
      method: "POST",
      headers: buildMCPHeaders(service, { sessionId: options.sessionId }),
      body: JSON.stringify(payload)
    },
    null,
    "MCP Streamable HTTP Call"
  );
  const data = await parseJSONOrSSEResponse(resp);
  const sessionId = readMcpSessionIDFromHeaders(resp.headers);
  if (!resp.ok) {
    const detail = extractMcpErrorMessage(data);
    throw createMcpHttpError(
      resp.status,
      detail || `Streamable HTTP ${resp.status} (${endpoint})`,
      data
    );
  }
  return { data, sessionId };
}
async function ensureStreamableHTTPSession(service) {
  const key = getMcpServiceCacheKey(service);
  if (mcpStreamableSessions[key] && mcpStreamableSessions[key].sessionId) {
    return mcpStreamableSessions[key];
  }
  const initParams = {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "smartpage-agent",
      version: "0.1.0"
    }
  };
  try {
    const initResp = await postStreamableHTTP(service, "initialize", initParams);
    const result = initResp?.data?.result && typeof initResp.data.result === "object" ? initResp.data.result : {};
    const sessionId = String(initResp?.sessionId || result?.sessionId || "").trim();
    const entry = {
      sessionId,
      protocolVersion: String(result?.protocolVersion || initParams.protocolVersion || ""),
      updatedAt: Date.now()
    };
    mcpStreamableSessions[key] = entry;
    try {
      await postStreamableHTTP(service, "notifications/initialized", {}, {
        notification: true,
        sessionId: entry.sessionId
      });
    } catch (_err) {
    }
    return entry;
  } catch (_err) {
    return null;
  }
}
function clearStreamableHTTPSession(service) {
  const key = getMcpServiceCacheKey(service);
  if (Object.prototype.hasOwnProperty.call(mcpStreamableSessions, key)) {
    delete mcpStreamableSessions[key];
  }
}
async function callStreamableHTTP(service, method, params) {
  const rpcMethod = String(method || "");
  const needsSession = rpcMethod !== "initialize" && rpcMethod !== "notifications/initialized";
  const endpoint = String(service.baseURL || "").trim();
  let sessionId = "";
  if (needsSession) {
    const entry = await ensureStreamableHTTPSession(service);
    sessionId = String(entry?.sessionId || "").trim();
  }
  const normalizedParams = rpcMethod === "tools/list" && params && typeof params === "object" && Object.keys(params).length === 0 ? void 0 : params;
  try {
    const first = await postStreamableHTTP(service, rpcMethod, normalizedParams, { sessionId });
    if (first.sessionId) {
      mcpStreamableSessions[getMcpServiceCacheKey(service)] = {
        sessionId: first.sessionId,
        protocolVersion: "2024-11-05",
        updatedAt: Date.now()
      };
    }
    const data = first.data;
    if (data && typeof data === "object" && data.error) {
      const msg = data?.error?.message || JSON.stringify(data.error);
      throw new Error(`Streamable HTTP RPC error: ${msg}`);
    }
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "result")) {
      return data.result;
    }
    return data;
  } catch (err) {
    const status = Number(err?.status || 0);
    const retriable = status === 400 || status === 401 || status === 403 || status === 404;
    if (needsSession && retriable) {
      clearStreamableHTTPSession(service);
      const entry2 = await ensureStreamableHTTPSession(service);
      const retrySessionID = String(entry2?.sessionId || "").trim();
      try {
        const second = await postStreamableHTTP(service, rpcMethod, normalizedParams, { sessionId: retrySessionID });
        const data2 = second.data;
        if (data2 && typeof data2 === "object" && data2.error) {
          const msg2 = data2?.error?.message || JSON.stringify(data2.error);
          throw new Error(`Streamable HTTP RPC error: ${msg2}`);
        }
        if (data2 && typeof data2 === "object" && Object.prototype.hasOwnProperty.call(data2, "result")) {
          return data2.result;
        }
        return data2;
      } catch (err2) {
        const detail2 = extractMcpErrorMessage(err2?.data) || String(err2?.message || err2);
        throw new Error(`Streamable HTTP ${status || ""} (${endpoint}) ${detail2}`.trim());
      }
    }
    const detail = extractMcpErrorMessage(err?.data) || String(err?.message || err);
    throw new Error(`Streamable HTTP ${status || ""} (${endpoint}) ${detail}`.trim());
  }
}
async function parseJSONOrSSEResponse(resp) {
  const ctype = String(resp.headers.get("content-type") || "").toLowerCase();
  if (ctype.includes("application/json")) {
    return resp.json().catch(() => ({}));
  }
  const text = await resp.text().catch(() => "");
  if (!text) {
    return {};
  }
  if (ctype.includes("text/event-stream") || text.includes("data:")) {
    let lastObj = null;
    const lines = text.split(/\r?\n/);
    for (const line of lines) {
      const raw = line.trim();
      if (!raw.startsWith("data:")) continue;
      const payload = raw.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        lastObj = JSON.parse(payload);
      } catch (_err) {
      }
    }
    return lastObj || {};
  }
  try {
    return JSON.parse(text);
  } catch (_err) {
    return { __raw_text: text.slice(0, 800) };
  }
}
function joinURL(base, path2) {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path2 || "").replace(/^\/+/, "");
  return `${b}/${p}`;
}
async function callChatCompletion({ apiKey, baseURL, model, thinkingLevel, timeoutMs, messages, tools, stream, hooks }) {
  ensureTaskActive(hooks);
  const body = {
    model,
    messages,
    tools,
    tool_choice: "auto",
    temperature: 0.1,
    stream: !!stream
  };
  const normalizedThinkingLevel = normalizeThinkingLevel(thinkingLevel);
  if (normalizedThinkingLevel !== "auto") {
    body.reasoning_effort = normalizedThinkingLevel;
  }
  const baseCandidates = buildOpenAIBaseURLCandidates(baseURL);
  const tried = [];
  let lastError = "";
  for (const candidate of baseCandidates) {
    ensureTaskActive(hooks);
    tried.push(candidate);
    try {
      const client = createOpenAIClient({
        apiKey,
        baseURL: candidate,
        hooks,
        timeoutMs
      });
      if (!stream) {
        return await client.chat.completions.create(body);
      }
      const streamResp = await client.chat.completions.create(body);
      let fullText = "";
      let fallbackAnswerFull = "";
      let fallbackReasoningFull = "";
      const toolCallMap = /* @__PURE__ */ new Map();
      for await (const chunk of streamResp) {
        ensureTaskActive(hooks);
        const deltaParts = extractDeltaPartsFromChatChunk(chunk);
        if (!deltaParts.answer || !deltaParts.reasoning) {
          const fallbackParts = extractFallbackDeltaPartsFromChatChunk(chunk);
          if (!deltaParts.answer && fallbackParts.answer) {
            const step = textIncrementFromFull(fallbackParts.answer, fallbackAnswerFull);
            fallbackAnswerFull = step.full;
            deltaParts.answer = step.delta;
          } else if (deltaParts.answer) {
            fallbackAnswerFull += deltaParts.answer;
          }
          if (!deltaParts.reasoning && fallbackParts.reasoning) {
            const step = textIncrementFromFull(fallbackParts.reasoning, fallbackReasoningFull);
            fallbackReasoningFull = step.full;
            deltaParts.reasoning = step.delta;
          } else if (deltaParts.reasoning) {
            fallbackReasoningFull += deltaParts.reasoning;
          }
        } else {
          fallbackAnswerFull += deltaParts.answer;
          fallbackReasoningFull += deltaParts.reasoning;
        }
        if (deltaParts.reasoning && typeof hooks?.onReasoning === "function") {
          hooks.onReasoning(deltaParts.reasoning);
        }
        if (deltaParts.answer) {
          fullText += deltaParts.answer;
          if (typeof hooks?.onDelta === "function") {
            hooks.onDelta(deltaParts.answer);
          }
        }
        const toolCallsDelta = chunk?.choices?.[0]?.delta?.tool_calls;
        if (Array.isArray(toolCallsDelta)) {
          for (const tc of toolCallsDelta) {
            const idx = Number.isInteger(tc?.index) ? tc.index : 0;
            const current = toolCallMap.get(idx) || {
              id: "",
              type: "function",
              function: { name: "", arguments: "" }
            };
            if (tc?.id) current.id = tc.id;
            if (tc?.type) current.type = tc.type;
            if (typeof tc?.function?.name === "string" && tc.function.name) {
              if (!current.function.name) {
                current.function.name = tc.function.name;
              } else if (!current.function.name.endsWith(tc.function.name)) {
                current.function.name += tc.function.name;
              }
            }
            if (typeof tc?.function?.arguments === "string") {
              current.function.arguments += tc.function.arguments;
            }
            toolCallMap.set(idx, current);
          }
        }
      }
      const toolCalls = Array.from(toolCallMap.entries()).sort((a, b) => a[0] - b[0]).map(([idx, call]) => ({
        ...call,
        id: call.id || `toolcall_${idx}`
      }));
      if (!fullText && fallbackAnswerFull) {
        fullText = fallbackAnswerFull;
      }
      return {
        choices: [
          {
            message: {
              content: fullText,
              tool_calls: toolCalls
            }
          }
        ]
      };
    } catch (err) {
      if (hooks?.cancelSignal?.aborted || isTaskCancelledError(err)) {
        throw createTaskCancelledError(hooks?.cancelReason || hooks?.cancelSignal?.reason || "\u4EFB\u52A1\u5DF2\u505C\u6B62");
      }
      lastError = formatOpenAIError(err);
      if (getErrorStatus(err) !== 404) {
        throw new Error(`${lastError} (${candidate})`);
      }
    }
  }
  throw new Error(`${lastError || "HTTP 404"} (tried baseURL: ${tried.join(" | ")})`);
}
function messageContentToText(content) {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.map((item) => {
      if (typeof item === "string") return item;
      const partType = String(item?.type || "").toLowerCase();
      if (partType.includes("reasoning")) return "";
      if (typeof item?.text === "string") return item.text;
      return "";
    }).join("\n").trim();
  }
  return "";
}
function anyValueToText(value) {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      if (typeof item?.text === "string") return item.text;
      if (typeof item?.text?.value === "string") return item.text.value;
      if (typeof item?.delta === "string") return item.delta;
      if (typeof item?.value === "string") return item.value;
      if (typeof item?.content === "string") return item.content;
      if (typeof item?.content?.text === "string") return item.content.text;
      if (typeof item?.content?.value === "string") return item.content.value;
      return "";
    }).filter(Boolean).join("\n").trim();
  }
  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text.trim();
    if (typeof value?.text?.value === "string") return value.text.value.trim();
    if (typeof value.delta === "string") return value.delta.trim();
    if (typeof value.value === "string") return value.value.trim();
    if (typeof value.content === "string") return value.content.trim();
    if (typeof value?.content?.text === "string") return value.content.text.trim();
    if (typeof value?.content?.value === "string") return value.content.value.trim();
    if (Array.isArray(value.content)) return anyValueToText(value.content);
  }
  return "";
}
function textIncrementFromFull(nextText, prevText) {
  const next = String(nextText || "");
  const prev = String(prevText || "");
  if (!next || next === prev) {
    return { full: prev, delta: "" };
  }
  if (prev && next.startsWith(prev)) {
    return { full: next, delta: next.slice(prev.length) };
  }
  return { full: next, delta: next };
}
function extractFallbackDeltaPartsFromChatChunk(event) {
  if (!event || typeof event !== "object") {
    return { answer: "", reasoning: "" };
  }
  const choice = event?.choices?.[0] || {};
  const message = choice?.message || {};
  const answerParts = [
    messageContentToText(message?.content),
    anyValueToText(choice?.text),
    anyValueToText(choice?.delta?.text),
    anyValueToText(event?.output_text)
  ].filter(Boolean);
  const reasoningParts = [
    extractReasoningFromContent(message?.content),
    anyValueToText(message?.reasoning),
    anyValueToText(message?.reasoning_content),
    anyValueToText(choice?.reasoning),
    anyValueToText(choice?.reasoning_content),
    anyValueToText(event?.reasoning),
    anyValueToText(event?.reasoning_content)
  ].filter(Boolean);
  return {
    answer: answerParts.join("\n").trim(),
    reasoning: reasoningParts.join("\n").trim()
  };
}
function extractReasoningFromContent(content) {
  if (!Array.isArray(content)) return "";
  return content.map((item) => {
    if (!item || typeof item !== "object") return "";
    const partType = String(item.type || "").toLowerCase();
    if (!partType.includes("reasoning")) return "";
    if (typeof item.text === "string") return item.text;
    if (typeof item.content === "string") return item.content;
    return "";
  }).filter(Boolean).join("\n").trim();
}
function extractReasoningFromCompletion(data) {
  const message = data?.choices?.[0]?.message || {};
  const parts = [
    extractReasoningFromContent(message?.content),
    anyValueToText(message?.reasoning),
    anyValueToText(message?.reasoning_content),
    anyValueToText(message?.reasoningContent)
  ].filter(Boolean);
  return parts.join("\n").trim();
}
function summarizeToolResult(result) {
  if (!result || typeof result !== "object") return String(result || "");
  if (result.error) return `error: ${result.error}`;
  if (typeof result.updated === "number") return `updated: ${result.updated}`;
  if (typeof result.removed === "number") return `removed: ${result.removed}`;
  if (typeof result.count === "number") return `count: ${result.count}`;
  if (typeof result.total === "number") return `total: ${result.total}`;
  if (typeof result.entries === "number") return `entries: ${result.entries}`;
  if (Object.prototype.hasOwnProperty.call(result, "value")) {
    const preview = anyValueToText(result.value).slice(0, 120);
    const note = typeof result.note === "string" && result.note.trim() ? `, ${result.note.trim()}` : "";
    return `value: ${preview || "null"}${note}`;
  }
  if (result.replaced) return "page replaced";
  return "ok";
}
function safeJSONString(value) {
  try {
    return JSON.stringify(value);
  } catch (_err) {
    return JSON.stringify({ ok: false, error: "serialize tool result failed" });
  }
}
async function requestModelText({ apiKey, model, thinkingLevel, baseURL, timeoutMs, systemPrompt, userPayload, stream, onDelta, onReasoning, hooks }) {
  ensureTaskActive(hooks);
  const body = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(userPayload) }
    ],
    temperature: 0.1,
    stream: !!stream
  };
  const normalizedThinkingLevel = normalizeThinkingLevel(thinkingLevel);
  if (normalizedThinkingLevel !== "auto") {
    body.reasoning_effort = normalizedThinkingLevel;
  }
  const baseCandidates = buildOpenAIBaseURLCandidates(baseURL);
  const tried = [];
  let lastError = "";
  for (const candidate of baseCandidates) {
    ensureTaskActive(hooks);
    tried.push(candidate);
    try {
      const client = createOpenAIClient({
        apiKey,
        baseURL: candidate,
        hooks,
        timeoutMs
      });
      if (!stream) {
        const data = await client.chat.completions.create(body);
        const reasoning = extractReasoningFromCompletion(data);
        if (reasoning && typeof onReasoning === "function") {
          onReasoning(reasoning);
        }
        return extractResponseText(data);
      }
      const streamResp = await client.chat.completions.create(body);
      let full = "";
      let reasoningFull = "";
      let fallbackAnswerFull = "";
      let fallbackReasoningFull = "";
      for await (const chunk of streamResp) {
        ensureTaskActive(hooks);
        const deltaParts = extractDeltaPartsFromChatChunk(chunk);
        if (!deltaParts.answer || !deltaParts.reasoning) {
          const fallbackParts = extractFallbackDeltaPartsFromChatChunk(chunk);
          if (!deltaParts.answer && fallbackParts.answer) {
            const step = textIncrementFromFull(fallbackParts.answer, fallbackAnswerFull);
            fallbackAnswerFull = step.full;
            deltaParts.answer = step.delta;
          } else if (deltaParts.answer) {
            fallbackAnswerFull += deltaParts.answer;
          }
          if (!deltaParts.reasoning && fallbackParts.reasoning) {
            const step = textIncrementFromFull(fallbackParts.reasoning, fallbackReasoningFull);
            fallbackReasoningFull = step.full;
            deltaParts.reasoning = step.delta;
          } else if (deltaParts.reasoning) {
            fallbackReasoningFull += deltaParts.reasoning;
          }
        } else {
          fallbackAnswerFull += deltaParts.answer;
          fallbackReasoningFull += deltaParts.reasoning;
        }
        if (deltaParts.reasoning) {
          reasoningFull += deltaParts.reasoning;
          if (typeof onReasoning === "function") {
            onReasoning(deltaParts.reasoning);
          }
        }
        if (deltaParts.answer) {
          full += deltaParts.answer;
          if (typeof onDelta === "function") {
            onDelta(deltaParts.answer);
          }
        }
      }
      if (!full && fallbackAnswerFull) {
        full = fallbackAnswerFull;
      }
      const text = full.trim();
      if (text) {
        return text;
      }
      const fallbackData = await client.chat.completions.create({
        ...body,
        stream: false
      });
      const fallbackReasoning = extractReasoningFromCompletion(fallbackData);
      if (fallbackReasoning && !reasoningFull.trim() && typeof onReasoning === "function") {
        onReasoning(fallbackReasoning);
      }
      return extractResponseText(fallbackData);
    } catch (err) {
      if (hooks?.cancelSignal?.aborted || isTaskCancelledError(err)) {
        throw createTaskCancelledError(hooks?.cancelReason || hooks?.cancelSignal?.reason || "\u4EFB\u52A1\u5DF2\u505C\u6B62");
      }
      lastError = formatOpenAIError(err);
      if (getErrorStatus(err) !== 404) {
        throw new Error(`${lastError} (${candidate})`);
      }
    }
  }
  throw new Error(`${lastError || "HTTP 404"} (tried baseURL: ${tried.join(" | ")})`);
}
function extractDeltaPartsFromChatChunk(event) {
  if (!event || typeof event !== "object") {
    return { answer: "", reasoning: "" };
  }
  const delta = event?.choices?.[0]?.delta || {};
  let answer = "";
  let reasoning = "";
  const content = delta?.content;
  if (typeof content === "string") {
    answer = content;
  } else if (content && typeof content === "object") {
    answer = anyValueToText(content);
  } else if (Array.isArray(content)) {
    for (const item of content) {
      if (!item || typeof item !== "object") continue;
      const partType = String(item.type || "").toLowerCase();
      const text = anyValueToText(item);
      if (!text) continue;
      if (partType.includes("reasoning")) {
        reasoning += text;
      } else {
        answer += text;
      }
    }
  }
  if (!answer) {
    answer = anyValueToText(delta?.text);
  }
  const extraReasoning = [
    anyValueToText(delta?.reasoning),
    anyValueToText(delta?.reasoning_content),
    anyValueToText(delta?.reasoningContent)
  ].filter(Boolean).join("\n");
  if (extraReasoning) {
    reasoning += reasoning ? `
${extraReasoning}` : extraReasoning;
  }
  return { answer, reasoning };
}
function extractResponseText(data) {
  const chatContent = data?.choices?.[0]?.message?.content;
  if (typeof chatContent === "string" && chatContent.trim()) return chatContent.trim();
  if (Array.isArray(chatContent)) {
    const parts = chatContent.map((item) => typeof item?.text === "string" ? item.text : "").filter(Boolean);
    if (parts.length) return parts.join("\n").trim();
  }
  throw new Error("\u6A21\u578B\u672A\u8FD4\u56DE\u53EF\u89E3\u6790\u6587\u672C");
}
/*! Bundled license information:

crypto-js/ripemd160.js:
  (** @preserve
  	(c) 2012 by Cédric Mesnil. All rights reserved.
  
  	Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
  
  	    - Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
  	    - Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
  
  	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  	*)

crypto-js/mode-ctr-gladman.js:
  (** @preserve
   * Counter block mode compatible with  Dr Brian Gladman fileenc.c
   * derived from CryptoJS.mode.CTR
   * Jan Hruby jhruby.web@gmail.com
   *)
*/
