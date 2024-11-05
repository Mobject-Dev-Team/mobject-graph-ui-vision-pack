/**
 * MIT License
 *
 * Copyright (c) 2024 benhar-dev
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
 * Third Party Licenses
 * --------------------
 *
 * MIT License
 * Copyright (c) 2020 Egor Nepomnyaschih
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('mobject-graph-ui')) :
  typeof define === 'function' && define.amd ? define(['exports', 'mobject-graph-ui'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.MobjectGraphUiVisionPack = {}, global.MobjectGraphUi));
})(this, (function (exports, mobjectGraphUi) { 'use strict';

  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _arrayWithHoles(r) {
    if (Array.isArray(r)) return r;
  }
  function _assertThisInitialized(e) {
    if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return e;
  }
  function _callSuper(t, o, e) {
    return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e));
  }
  function _classCallCheck(a, n) {
    if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
  }
  function _defineProperties(e, r) {
    for (var t = 0; t < r.length; t++) {
      var o = r[t];
      o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
    }
  }
  function _createClass(e, r, t) {
    return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
      writable: !1
    }), e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
      value: t,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }) : e[r] = t, e;
  }
  function _getPrototypeOf(t) {
    return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) {
      return t.__proto__ || Object.getPrototypeOf(t);
    }, _getPrototypeOf(t);
  }
  function _inherits(t, e) {
    if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
    t.prototype = Object.create(e && e.prototype, {
      constructor: {
        value: t,
        writable: !0,
        configurable: !0
      }
    }), Object.defineProperty(t, "prototype", {
      writable: !1
    }), e && _setPrototypeOf(t, e);
  }
  function _isNativeReflectConstruct() {
    try {
      var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    } catch (t) {}
    return (_isNativeReflectConstruct = function () {
      return !!t;
    })();
  }
  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _possibleConstructorReturn(t, e) {
    if (e && ("object" == typeof e || "function" == typeof e)) return e;
    if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
    return _assertThisInitialized(t);
  }
  function _setPrototypeOf(t, e) {
    return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) {
      return t.__proto__ = e, t;
    }, _setPrototypeOf(t, e);
  }
  function _slicedToArray(r, e) {
    return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _unsupportedIterableToArray(r, a) {
    if (r) {
      if ("string" == typeof r) return _arrayLikeToArray(r, a);
      var t = {}.toString.call(r).slice(8, -1);
      return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
    }
  }

  function deepEqual(object1, object2) {
    if (object1 === object2) {
      return true;
    }
    if (object1 == null || object2 == null || _typeof(object1) !== "object" || _typeof(object2) !== "object") {
      return false;
    }
    var keys1 = Object.keys(object1);
    var keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (var _i = 0, _keys = keys1; _i < _keys.length; _i++) {
      var key = _keys[_i];
      if (!keys2.includes(key) || !deepEqual(object1[key], object2[key])) {
        return false;
      }
    }
    return true;
  }

  /* Example of data
  ---------------------------
  {
      imageInfo: {
          nImageSize: 75,
          nWidth: 5,
          nHeight: 5,
          nXPadding: 0,
          nYPadding: 0,
          stPixelFormat: {
              bSupported: true,
              bSigned: false,
              bPlanar: false,
              bFloat: false,
              nChannels: 3,
              ePixelEncoding: "TCVN_PE_NONE",
              ePixelPackMode: "TCVN_PPM_NONE",
              nElementSize: 8,
              nTotalSize: 24,
          },
      },
      imageData:
          "7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk",
  };
  */

  function loadITcVnImageToImg(img, itcvnimage) {
    if (!itcvnimage) return;
    var _itcvnimage$imageInfo = itcvnimage.imageInfo,
      nWidth = _itcvnimage$imageInfo.nWidth,
      nHeight = _itcvnimage$imageInfo.nHeight,
      stPixelFormat = _itcvnimage$imageInfo.stPixelFormat,
      imageData = itcvnimage.imageData;

    // Convert base64 to binary data
    var binaryData = decodeBase64ToBinary(imageData);

    // Determine the correct bytes per pixel and channels
    var nChannels = stPixelFormat.nChannels,
      nElementSize = stPixelFormat.nElementSize;

    // Process the binary data based on channel information
    var processedBytes = processImageData(binaryData, nWidth, nHeight, nChannels, nElementSize);

    // Create and draw the image on the canvas
    drawImageOnCanvas(img, processedBytes, nWidth, nHeight);
  }
  function decodeBase64ToBinary(base64String) {
    var binaryString = window.atob(base64String);
    return new Uint8Array(binaryString.split("").map(function (_char) {
      return _char.charCodeAt(0);
    }));
  }
  function processImageData(binaryData, width, height, channels, bitDepth) {
    var bytesPerPixel = channels * bitDepth / 8;
    var outputBytes = new Uint8Array(width * height * 4);
    var j = 0;
    for (var i = 0; i < binaryData.length; i += bytesPerPixel) {
      var r = void 0,
        g = void 0,
        b = void 0,
        a = 255; // Default alpha value

      if (bitDepth === 8) {
        if (channels === 1) {
          r = g = b = binaryData[i];
        } else if (channels === 3) {
          r = binaryData[i];
          g = binaryData[i + 1];
          b = binaryData[i + 2];
        } else if (channels === 4) {
          r = binaryData[i];
          g = binaryData[i + 1];
          b = binaryData[i + 2];
          a = binaryData[i + 3];
        }
      } else if (bitDepth === 16) {
        if (channels === 1) {
          r = g = b = binaryData[i] + binaryData[i + 1] * 256 >> 8; // Assume little endian
        } else if (channels === 3) {
          r = binaryData[i] + binaryData[i + 1] * 256 >> 8;
          g = binaryData[i + 2] + binaryData[i + 3] * 256 >> 8;
          b = binaryData[i + 4] + binaryData[i + 5] * 256 >> 8;
        } else if (channels === 4) {
          r = binaryData[i] + binaryData[i + 1] * 256 >> 8;
          g = binaryData[i + 2] + binaryData[i + 3] * 256 >> 8;
          b = binaryData[i + 4] + binaryData[i + 5] * 256 >> 8;
          a = binaryData[i + 6] + binaryData[i + 7] * 256 >> 8;
        }
      }

      // Set the RGBA values in the output buffer
      outputBytes.set([r, g, b, a], j);
      j += 4;
    }
    return outputBytes;
  }
  function drawImageOnCanvas(imgElement, imageDataBytes, width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var imageData = new ImageData(new Uint8ClampedArray(imageDataBytes), width, height);
    ctx.putImageData(imageData, 0, 0);
    imgElement.src = canvas.toDataURL("image/png");
  }

  /*
  MIT License
  Copyright (c) 2020 Egor Nepomnyaschih
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
  */

  var base64abc = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/"];
  function bytesToBase64(bytes) {
    var result = "",
      i,
      l = bytes.length;
    for (i = 2; i < l; i += 3) {
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[(bytes[i - 2] & 0x03) << 4 | bytes[i - 1] >> 4];
      result += base64abc[(bytes[i - 1] & 0x0f) << 2 | bytes[i] >> 6];
      result += base64abc[bytes[i] & 0x3f];
    }
    if (i === l + 1) {
      // 1 octet yet to write
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[(bytes[i - 2] & 0x03) << 4];
      result += "==";
    }
    if (i === l) {
      // 2 octets yet to write
      result += base64abc[bytes[i - 2] >> 2];
      result += base64abc[(bytes[i - 2] & 0x03) << 4 | bytes[i - 1] >> 4];
      result += base64abc[(bytes[i - 1] & 0x0f) << 2];
      result += "=";
    }
    return result;
  }

  var ITcVnImageDisplayWidget = /*#__PURE__*/function (_DisplayWidget) {
    function ITcVnImageDisplayWidget(name, parent, options) {
      var _this;
      _classCallCheck(this, ITcVnImageDisplayWidget);
      _this = _callSuper(this, ITcVnImageDisplayWidget, [name, parent, options]);
      _this.image = new Image();
      _this.previousValue = null;
      return _this;
    }
    _inherits(ITcVnImageDisplayWidget, _DisplayWidget);
    return _createClass(ITcVnImageDisplayWidget, [{
      key: "onContentUpdate",
      value: function onContentUpdate(value) {
        if (deepEqual(value, this.previousValue)) return;
        loadITcVnImageToImg(this.image, value);
        this.previousValue = value;
      }
    }, {
      key: "computeSize",
      value: function computeSize() {
        return new Float32Array([60, 60]);
      }
    }, {
      key: "draw",
      value: function draw(ctx, node, widget_width, y, H) {
        this.margin = 5;
        var drawWidth = widget_width - this.margin * 2 + 1;
        var drawHeight = node.size[1] - this.margin - y;

        // draw the background
        ctx.fillStyle = "#303030";
        ctx.fillRect(this.margin, y, drawWidth, drawHeight);

        // create a rectangular clipping path
        ctx.beginPath();
        ctx.rect(this.margin, y, drawWidth, drawHeight);
        ctx.clip();

        // draw the checkerboard pattern
        var blockHeight = 10;
        var blockWidth = 10;
        var nRow = drawHeight / blockHeight;
        var nCol = drawWidth / blockWidth;
        ctx.beginPath();
        for (var i = 0; i < nRow; ++i) {
          for (var j = 0, col = nCol / 2; j < col; ++j) {
            ctx.rect(2 * j * blockWidth + (i % 2 ? 0 : blockWidth) + this.margin, i * blockHeight + y, blockWidth, blockHeight);
          }
        }
        ctx.fillStyle = "#303030";
        ctx.fill();

        // draw the outline
        ctx.strokeStyle = this.outline_color;
        ctx.strokeRect(this.margin, y, drawWidth, drawHeight);

        // draw the no image text
        if (!this.image) {
          ctx.textAlign = "center";
          ctx.fillStyle = this.secondary_text_color;
          ctx.font = "italic 10pt Sans-serif";
          ctx.fillText("No image", widget_width * 0.5, y + drawHeight * 0.5);
          return;
        }

        // draw the image
        ctx.drawImage(this.image, this.margin, y, drawWidth, drawHeight);
      }
    }]);
  }(mobjectGraphUi.DisplayWidget);
  var ITcVnImageControlWidget = /*#__PURE__*/function (_ControlWidget) {
    function ITcVnImageControlWidget(name, property, parameter, content) {
      var _this2;
      _classCallCheck(this, ITcVnImageControlWidget);
      _this2 = _callSuper(this, ITcVnImageControlWidget, [name, property, parameter, content]);
      _this2._url = null;
      _this2._img = null;
      _this2._size = ITcVnImageControlWidget.DEFAULT_SIZE;
      _this2._offscreenCanvas = null;
      _this2.setDefaultValue(_this2.getDefaultImageData());
      return _this2;
    }
    _inherits(ITcVnImageControlWidget, _ControlWidget);
    return _createClass(ITcVnImageControlWidget, [{
      key: "onDisplayValueChanged",
      value: function onDisplayValueChanged(newValue, oldValue) {
        console.log(newValue);
      }
    }, {
      key: "computeSize",
      value: function computeSize(width) {
        return this._size;
      }
    }, {
      key: "mouse",
      value: function mouse(event, pos, node) {
        // Mouse interaction handling
      }
    }, {
      key: "draw",
      value: function draw(ctx, node, widget_width, y, H) {
        var margin = 5;
        var drawWidth = widget_width - 2 * margin;
        var drawHeight = node.size[1] - margin - y;
        this.drawBackground(ctx, margin, y, drawWidth, drawHeight);
        this.drawOutline(ctx, margin, y, drawWidth, drawHeight);
        this.drawImageOrPlaceholder(ctx, margin, widget_width, y, drawWidth, drawHeight);
      }
    }, {
      key: "onDropFile",
      value: function onDropFile(file) {
        if (!this.isSupportedFileType(file)) {
          console.error("Unsupported file type:", file.type);
          return false;
        }
        if (this._url) URL.revokeObjectURL(this._url);
        this._url = URL.createObjectURL(file);
        this.loadImage(this._url);
        return true;
      }
    }, {
      key: "isSupportedFileType",
      value: function isSupportedFileType(file) {
        return ITcVnImageControlWidget.SUPPORTED_TYPES.includes(file.type);
      }
    }, {
      key: "loadImage",
      value: function loadImage(url) {
        var img = new Image();
        img.src = url;
        img.onload = this.handleImageLoad.bind(this, img);
        img.onerror = function () {
          return console.error("Error loading the image: ".concat(url));
        };
      }
    }, {
      key: "handleImageLoad",
      value: function handleImageLoad(img) {
        var _this$calculateNewDim = this.calculateNewDimensions(img),
          _this$calculateNewDim2 = _slicedToArray(_this$calculateNewDim, 2),
          newWidth = _this$calculateNewDim2[0],
          newHeight = _this$calculateNewDim2[1];
        this._size = new Float32Array([newWidth, newHeight]);
        this.setupOffscreenCanvas(img);
        this.setValue(this.serializeOffscreenCanvas());
        this.triggerParentResetSize();
      }
    }, {
      key: "calculateNewDimensions",
      value: function calculateNewDimensions(img) {
        var originalWidth = img.width;
        var originalHeight = img.height;
        var newHeight = 300;
        var aspectRatio = originalWidth / originalHeight;
        var newWidth = newHeight * aspectRatio;
        return [newWidth, newHeight];
      }
    }, {
      key: "setupOffscreenCanvas",
      value: function setupOffscreenCanvas(img) {
        this._offscreenCanvas = new OffscreenCanvas(img.width, img.height);
        var ctx = this._offscreenCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0, img.width, img.height);
      }
    }, {
      key: "serializeOffscreenCanvas",
      value: function serializeOffscreenCanvas() {
        var ctx = this._offscreenCanvas.getContext("2d");
        var imageData = ctx.getImageData(0, 0, this._offscreenCanvas.width, this._offscreenCanvas.height);
        var image = {
          imageInfo: {
            nImageSize: imageData.data.length,
            nWidth: this._offscreenCanvas.width,
            nHeight: this._offscreenCanvas.height,
            nXPadding: 0,
            nYPadding: 0,
            stPixelFormat: {
              bSupported: true,
              bSigned: false,
              bPlanar: false,
              bFloat: false,
              nChannels: 4,
              ePixelEncoding: "TCVN_PE_NONE",
              ePixelPackMode: "TCVN_PPM_NONE",
              nElementSize: 8,
              nTotalSize: 24
            }
          },
          imageData: bytesToBase64(imageData.data)
        };

        // console.log("Serialized Image Data:", image);
        return image;
      }
    }, {
      key: "drawBackground",
      value: function drawBackground(ctx, margin, y, width, height) {
        ctx.fillStyle = ITcVnImageControlWidget.BACKGROUND_COLOR;
        ctx.fillRect(margin, y, width, height);
      }
    }, {
      key: "drawOutline",
      value: function drawOutline(ctx, margin, y, width, height) {
        ctx.strokeStyle = ITcVnImageControlWidget.OUTLINE_COLOR;
        ctx.strokeRect(margin, y, width, height);
      }
    }, {
      key: "drawImageOrPlaceholder",
      value: function drawImageOrPlaceholder(ctx, margin, widgetWidth, y, width, height) {
        if (this._offscreenCanvas) {
          ctx.drawImage(this._offscreenCanvas, margin, y, width, height);
        } else {
          ctx.textAlign = "center";
          ctx.fillStyle = ITcVnImageControlWidget.TEXT_COLOR;
          ctx.font = "italic 10pt Sans-serif";
          ctx.fillText("Drag image here...", widgetWidth * 0.5, y + height * 0.5);
        }
      }
    }, {
      key: "getDefaultImageData",
      value: function getDefaultImageData() {
        var image = {
          imageInfo: {
            nImageSize: 0,
            nWidth: 0,
            nHeight: 0,
            nXPadding: 0,
            nYPadding: 0,
            stPixelFormat: {
              bSupported: true,
              bSigned: false,
              bPlanar: false,
              bFloat: false,
              nChannels: 4,
              ePixelEncoding: "TCVN_PE_NONE",
              ePixelPackMode: "TCVN_PPM_NONE",
              nElementSize: 0,
              nTotalSize: 0
            }
          },
          imageData: ""
        };
        return image;
      }
    }]);
  }(mobjectGraphUi.ControlWidget);

  /* Example of data
  ---------------------------
  {
      imageInfo: {
          nImageSize: 75,
          nWidth: 5,
          nHeight: 5,
          nXPadding: 0,
          nYPadding: 0,
          stPixelFormat: {
              bSupported: true,
              bSigned: false,
              bPlanar: false,
              bFloat: false,
              nChannels: 3,
              ePixelEncoding: "TCVN_PE_NONE",
              ePixelPackMode: "TCVN_PPM_NONE",
              nElementSize: 8,
              nTotalSize: 24,
          },
      },
      imageData:
          "7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk7Rwk",
  };
  */
  _defineProperty(ITcVnImageControlWidget, "SUPPORTED_TYPES", ["image/jpeg", "image/png", "image/bmp"]);
  _defineProperty(ITcVnImageControlWidget, "DEFAULT_SIZE", new Float32Array([100, 100]));
  _defineProperty(ITcVnImageControlWidget, "OUTLINE_COLOR", "#000");
  // default outline color
  _defineProperty(ITcVnImageControlWidget, "BACKGROUND_COLOR", "#303030");
  _defineProperty(ITcVnImageControlWidget, "TEXT_COLOR", "#FFF");

  var VisionPack = /*#__PURE__*/function () {
    function VisionPack() {
      _classCallCheck(this, VisionPack);
    }
    return _createClass(VisionPack, null, [{
      key: "install",
      value: function install() {
        var graphFramework = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new mobjectGraphUi.GraphFramework();
        this.registerWidgets(graphFramework);
        this.registerFileAssociation(graphFramework);
      }
    }, {
      key: "registerWidgets",
      value: function registerWidgets(graphFramework) {
        graphFramework.registerWidgetType(ITcVnImageControlWidget, "INTERFACE", "ITcVnImage");
        graphFramework.registerWidgetType(ITcVnImageDisplayWidget, "INTERFACE", "ITcVnImage");
      }
    }, {
      key: "registerFileAssociation",
      value: function registerFileAssociation(graphFramework) {
        graphFramework.registerFileAssociation(["jpg", "png", "bmp"], "Literal/ITcVnImage", "value");
      }
    }]);
  }();

  exports.VisionPack = VisionPack;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
