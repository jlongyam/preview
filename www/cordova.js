; (function () {
  var PLATFORM_VERSION_BUILD_LABEL = '7.0.0';
  var require;
  var define;
  (function () {
    var modules = {};
    var requireStack = [];
    var inProgressModules = {};
    var SEPARATOR = '.';
    function build(module) {
      var factory = module.factory;
      var localRequire = function (id) {
        var resultantId = id;
        if (id.charAt(0) === '.') {
          resultantId = module.id.slice(0, module.id.lastIndexOf(SEPARATOR)) + SEPARATOR + id.slice(2);
        }
        return require(resultantId);
      };
      module.exports = {};
      delete module.factory;
      factory(localRequire, module.exports, module);
      return module.exports;
    }
    require = function (id) {
      if (!modules[id]) {
        throw new Error('module ' + id + ' not found');
      } else if (id in inProgressModules) {
        var cycle = requireStack.slice(inProgressModules[id]).join('->') + '->' + id;
        throw new Error('Cycle in require graph: ' + cycle);
      }
      if (modules[id].factory) {
        try {
          inProgressModules[id] = requireStack.length;
          requireStack.push(id);
          return build(modules[id]);
        } finally {
          delete inProgressModules[id];
          requireStack.pop();
        }
      }
      return modules[id].exports;
    };
    define = function (id, factory) {
      if (Object.prototype.hasOwnProperty.call(modules, id)) {
        throw new Error('module ' + id + ' already defined');
      }
      modules[id] = {
        id: id,
        factory: factory
      };
    };
    define.remove = function (id) {
      delete modules[id];
    };
    define.moduleMap = modules;
  })();
  if (typeof module === 'object' && typeof require === 'function') {
    module.exports.require = require;
    module.exports.define = define;
  }
  define("cordova", function (require, exports, module) {
    if (window.cordova && !(window.cordova instanceof HTMLElement)) {
      throw new Error('cordova already defined');
    }
    var channel = require('cordova/channel');
    var platform = require('cordova/platform');
    var m_document_addEventListener = document.addEventListener;
    var m_document_removeEventListener = document.removeEventListener;
    var m_window_addEventListener = window.addEventListener;
    var m_window_removeEventListener = window.removeEventListener;
    var documentEventHandlers = {};
    var windowEventHandlers = {};
    document.addEventListener = function (evt, handler, capture) {
      var e = evt.toLowerCase();
      if (typeof documentEventHandlers[e] !== 'undefined') {
        documentEventHandlers[e].subscribe(handler);
      } else {
        m_document_addEventListener.call(document, evt, handler, capture);
      }
    };
    window.addEventListener = function (evt, handler, capture) {
      var e = evt.toLowerCase();
      if (typeof windowEventHandlers[e] !== 'undefined') {
        windowEventHandlers[e].subscribe(handler);
      } else {
        m_window_addEventListener.call(window, evt, handler, capture);
      }
    };
    document.removeEventListener = function (evt, handler, capture) {
      var e = evt.toLowerCase();
      if (typeof documentEventHandlers[e] !== 'undefined') {
        documentEventHandlers[e].unsubscribe(handler);
      } else {
        m_document_removeEventListener.call(document, evt, handler, capture);
      }
    };
    window.removeEventListener = function (evt, handler, capture) {
      var e = evt.toLowerCase();
      if (typeof windowEventHandlers[e] !== 'undefined') {
        windowEventHandlers[e].unsubscribe(handler);
      } else {
        m_window_removeEventListener.call(window, evt, handler, capture);
      }
    };
    function createEvent(type, data) {
      var event = document.createEvent('Events');
      event.initEvent(type, false, false);
      if (data) {
        for (var i in data) {
          if (Object.prototype.hasOwnProperty.call(data, i)) {
            event[i] = data[i];
          }
        }
      }
      return event;
    }
    var cordova = {
      define: define,
      require: require,
      version: PLATFORM_VERSION_BUILD_LABEL,
      platformVersion: PLATFORM_VERSION_BUILD_LABEL,
      platformId: platform.id,
      addWindowEventHandler: function (event) {
        return (windowEventHandlers[event] = channel.create(event));
      },
      addStickyDocumentEventHandler: function (event) {
        return (documentEventHandlers[event] = channel.createSticky(event));
      },
      addDocumentEventHandler: function (event) {
        return (documentEventHandlers[event] = channel.create(event));
      },
      removeWindowEventHandler: function (event) {
        delete windowEventHandlers[event];
      },
      removeDocumentEventHandler: function (event) {
        delete documentEventHandlers[event];
      },
      getOriginalHandlers: function () {
        return {
          document: {
            addEventListener: m_document_addEventListener,
            removeEventListener: m_document_removeEventListener
          },
          window: {
            addEventListener: m_window_addEventListener,
            removeEventListener: m_window_removeEventListener
          }
        };
      },
      fireDocumentEvent: function (type, data, bNoDetach) {
        var evt = createEvent(type, data);
        if (typeof documentEventHandlers[type] !== 'undefined') {
          if (bNoDetach) {
            documentEventHandlers[type].fire(evt);
          } else {
            setTimeout(function () {
              if (type === 'deviceready') {
                document.dispatchEvent(evt);
              }
              documentEventHandlers[type].fire(evt);
            }, 0);
          }
        } else {
          document.dispatchEvent(evt);
        }
      },
      fireWindowEvent: function (type, data) {
        var evt = createEvent(type, data);
        if (typeof windowEventHandlers[type] !== 'undefined') {
          setTimeout(function () {
            windowEventHandlers[type].fire(evt);
          }, 0);
        } else {
          window.dispatchEvent(evt);
        }
      },
      callbackId: Math.floor(Math.random() * 2000000000),
      callbacks: {},
      callbackStatus: {
        NO_RESULT: 0,
        OK: 1,
        CLASS_NOT_FOUND_EXCEPTION: 2,
        ILLEGAL_ACCESS_EXCEPTION: 3,
        INSTANTIATION_EXCEPTION: 4,
        MALFORMED_URL_EXCEPTION: 5,
        IO_EXCEPTION: 6,
        INVALID_ACTION: 7,
        JSON_EXCEPTION: 8,
        ERROR: 9
      },
      callbackSuccess: function (callbackId, args) {
        cordova.callbackFromNative(callbackId, true, args.status, [args.message], args.keepCallback);
      },
      callbackError: function (callbackId, args) {
        cordova.callbackFromNative(callbackId, false, args.status, [args.message], args.keepCallback);
      },
      callbackFromNative: function (callbackId, isSuccess, status, args, keepCallback) {
        try {
          var callback = cordova.callbacks[callbackId];
          if (callback) {
            if (isSuccess && status === cordova.callbackStatus.OK) {
              callback.success && callback.success.apply(null, args);
            } else if (!isSuccess) {
              callback.fail && callback.fail.apply(null, args);
            }
            if (!keepCallback) {
              delete cordova.callbacks[callbackId];
            }
          }
        } catch (err) {
          var msg = 'Error in ' + (isSuccess ? 'Success' : 'Error') + ' callbackId: ' + callbackId + ' : ' + err;
          cordova.fireWindowEvent('cordovacallbackerror', { message: msg, error: err });
          throw err;
        }
      },
      addConstructor: function (func) {
        channel.onCordovaReady.subscribe(function () {
          try {
            func();
          } catch (e) {
            console.log('Failed to run constructor: ' + e);
          }
        });
      }
    };
    module.exports = cordova;
  });
  define("cordova/argscheck", function (require, exports, module) {
    var utils = require('cordova/utils');
    var moduleExports = module.exports;
    var typeMap = {
      A: 'Array',
      D: 'Date',
      N: 'Number',
      S: 'String',
      F: 'Function',
      O: 'Object'
    };
    function extractParamName(callee, argIndex) {
      return (/\(\s*([^)]*?)\s*\)/).exec(callee)[1].split(/\s*,\s*/)[argIndex];
    }
    function checkArgs(spec, functionName, args, opt_callee) {
      if (!moduleExports.enableChecks) {
        return;
      }
      var errMsg = null;
      var typeName;
      for (var i = 0; i < spec.length; ++i) {
        var c = spec.charAt(i);
        var cUpper = c.toUpperCase();
        var arg = args[i];
        if (c === '*') {
          continue;
        }
        typeName = utils.typeName(arg);
        if ((arg === null || arg === undefined) && c === cUpper) {
          continue;
        }
        if (typeName !== typeMap[cUpper]) {
          errMsg = 'Expected ' + typeMap[cUpper];
          break;
        }
      }
      if (errMsg) {
        errMsg += ', but got ' + typeName + '.';
        errMsg = 'Wrong type for parameter "' + extractParamName(opt_callee || args.callee, i) + '" of ' + functionName + ': ' + errMsg;
        if (typeof jasmine === 'undefined') {
          console.error(errMsg);
        }
        throw TypeError(errMsg);
      }
    }
    function getValue(value, defaultValue) {
      return value === undefined ? defaultValue : value;
    }
    moduleExports.checkArgs = checkArgs;
    moduleExports.getValue = getValue;
    moduleExports.enableChecks = true;
  });
  define("cordova/base64", function (require, exports, module) {
    var base64 = exports;
    base64.fromArrayBuffer = function (arrayBuffer) {
      return btoa(bufferToBinaryString(arrayBuffer));
    };
    base64.toArrayBuffer = function (str) {
      return binaryStringToBuffer(atob(str));
    };
    function bufferToBinaryString(buffer) {
      var bytes = new Uint8Array(buffer);
      var CHUNK_SIZE = 1 << 15;
      var string = '';
      for (var i = 0; i < bytes.length; i += CHUNK_SIZE) {
        var chunk = bytes.subarray(i, i + CHUNK_SIZE);
        string += String.fromCharCode.apply(null, chunk);
      }
      return string;
    }
    function binaryStringToBuffer(binaryString) {
      var bytes = new Uint8Array(binaryString.length);
      for (var i = 0; i < bytes.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
  });
  define("cordova/builder", function (require, exports, module) {
    var utils = require('cordova/utils');
    function each(objects, func, context) {
      for (var prop in objects) {
        if (Object.prototype.hasOwnProperty.call(objects, prop)) {
          func.apply(context, [objects[prop], prop]);
        }
      }
    }
    function clobber(obj, key, value) {
      var needsProperty = false;
      try {
        obj[key] = value;
      } catch (e) {
        needsProperty = true;
      }
      if (needsProperty || obj[key] !== value) {
        utils.defineGetter(obj, key, function () {
          return value;
        });
      }
    }
    function assignOrWrapInDeprecateGetter(obj, key, value, message) {
      if (message) {
        utils.defineGetter(obj, key, function () {
          console.log(message);
          delete obj[key];
          clobber(obj, key, value);
          return value;
        });
      } else {
        clobber(obj, key, value);
      }
    }
    function include(parent, objects, clobber, merge) {
      each(objects, function (obj, key) {
        try {
          var result = obj.path ? require(obj.path) : {};
          if (clobber) {
            if (typeof parent[key] === 'undefined') {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
            } else if (typeof obj.path !== 'undefined') {
              if (merge) {
                recursiveMerge(parent[key], result);
              } else {
                assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
              }
            }
            result = parent[key];
          } else {
            if (typeof parent[key] === 'undefined') {
              assignOrWrapInDeprecateGetter(parent, key, result, obj.deprecated);
            } else {
              result = parent[key];
            }
          }
          if (obj.children) {
            include(result, obj.children, clobber, merge);
          }
        } catch (e) {
          utils.alert('Exception building Cordova JS globals: ' + e + ' for key "' + key + '"');
        }
      });
    }
    function recursiveMerge(target, src) {
      for (var prop in src) {
        if (Object.prototype.hasOwnProperty.call(src, prop)) {
          if (target.prototype && target.prototype.constructor === target) {
            clobber(target.prototype, prop, src[prop]);
          } else {
            if (typeof src[prop] === 'object' && typeof target[prop] === 'object') {
              recursiveMerge(target[prop], src[prop]);
            } else {
              clobber(target, prop, src[prop]);
            }
          }
        }
      }
    }
    exports.buildIntoButDoNotClobber = function (objects, target) {
      include(target, objects, false, false);
    };
    exports.buildIntoAndClobber = function (objects, target) {
      include(target, objects, true, false);
    };
    exports.buildIntoAndMerge = function (objects, target) {
      include(target, objects, true, true);
    };
    exports.recursiveMerge = recursiveMerge;
    exports.assignOrWrapInDeprecateGetter = assignOrWrapInDeprecateGetter;
  });
  define("cordova/channel", function (require, exports, module) {
    var utils = require('cordova/utils');
    var nextGuid = 1;
    var Channel = function (type, sticky) {
      this.type = type;
      this.handlers = {};
      this.state = sticky ? 1 : 0;
      this.fireArgs = null;
      this.numHandlers = 0;
      this.onHasSubscribersChange = null;
    };
    var channel = {
      join: function (h, c) {
        var len = c.length;
        var i = len;
        var f = function () {
          if (!(--i)) h();
        };
        for (var j = 0; j < len; j++) {
          if (c[j].state === 0) {
            throw Error('Can only use join with sticky channels.');
          }
          c[j].subscribe(f);
        }
        if (!len) h();
      },
      create: function (type) {
        return (channel[type] = new Channel(type, false));
      },
      createSticky: function (type) {
        return (channel[type] = new Channel(type, true));
      },
      deviceReadyChannelsArray: [],
      deviceReadyChannelsMap: {},
      waitForInitialization: function (feature) {
        if (feature) {
          var c = channel[feature] || this.createSticky(feature);
          this.deviceReadyChannelsMap[feature] = c;
          this.deviceReadyChannelsArray.push(c);
        }
      },
      initializationComplete: function (feature) {
        var c = this.deviceReadyChannelsMap[feature];
        if (c) {
          c.fire();
        }
      }
    };
    function checkSubscriptionArgument(argument) {
      if (typeof argument !== 'function' && typeof argument.handleEvent !== 'function') {
        throw new Error(
          'Must provide a function or an EventListener object ' +
          'implementing the handleEvent interface.'
        );
      }
    }
    Channel.prototype.subscribe = function (eventListenerOrFunction, eventListener) {
      checkSubscriptionArgument(eventListenerOrFunction);
      var handleEvent, guid;
      if (eventListenerOrFunction && typeof eventListenerOrFunction === 'object') {
        handleEvent = eventListenerOrFunction.handleEvent;
        eventListener = eventListenerOrFunction;
      } else {
        handleEvent = eventListenerOrFunction;
      }
      if (this.state === 2) {
        handleEvent.apply(eventListener || this, this.fireArgs);
        return;
      }
      guid = eventListenerOrFunction.observer_guid;
      if (typeof eventListener === 'object') {
        handleEvent = utils.close(eventListener, handleEvent);
      }
      if (!guid) {
        guid = '' + nextGuid++;
      }
      handleEvent.observer_guid = guid;
      eventListenerOrFunction.observer_guid = guid;
      if (!this.handlers[guid]) {
        this.handlers[guid] = handleEvent;
        this.numHandlers++;
        if (this.numHandlers === 1) {
          this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
      }
    };
    Channel.prototype.unsubscribe = function (eventListenerOrFunction) {
      checkSubscriptionArgument(eventListenerOrFunction);
      var handleEvent, guid, handler;
      if (eventListenerOrFunction && typeof eventListenerOrFunction === 'object') {
        handleEvent = eventListenerOrFunction.handleEvent;
      } else {
        handleEvent = eventListenerOrFunction;
      }
      guid = handleEvent.observer_guid;
      handler = this.handlers[guid];
      if (handler) {
        delete this.handlers[guid];
        this.numHandlers--;
        if (this.numHandlers === 0) {
          this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
      }
    };
    Channel.prototype.fire = function (e) {
      var fireArgs = Array.prototype.slice.call(arguments);
      if (this.state === 1) {
        this.state = 2;
        this.fireArgs = fireArgs;
      }
      if (this.numHandlers) {
        var toCall = [];
        for (var item in this.handlers) {
          toCall.push(this.handlers[item]);
        }
        for (var i = 0; i < toCall.length; ++i) {
          toCall[i].apply(this, fireArgs);
        }
        if (this.state === 2 && this.numHandlers) {
          this.numHandlers = 0;
          this.handlers = {};
          this.onHasSubscribersChange && this.onHasSubscribersChange();
        }
      }
    };
    channel.createSticky('onDOMContentLoaded');
    channel.createSticky('onNativeReady');
    channel.createSticky('onCordovaReady');
    channel.createSticky('onPluginsReady');
    channel.createSticky('onDeviceReady');
    channel.create('onResume');
    channel.create('onPause');
    channel.waitForInitialization('onCordovaReady');
    channel.waitForInitialization('onDOMContentLoaded');
    module.exports = channel;
  });
  define("cordova/confighelper", function (require, exports, module) {
    let config;
    function Config(xhr) {
      function loadPreferences(xhr) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xhr.responseText, 'application/xml');
        const preferences = doc.getElementsByTagName('preference');
        return Array.prototype.slice.call(preferences);
      }
      this.xhr = xhr;
      this.preferences = loadPreferences(this.xhr);
    }
    function readConfig(success, error) {
      const xhr = new XMLHttpRequest();
      if (typeof config !== 'undefined') {
        success(config);
      }
      function fail(msg) {
        console.error(msg);
        if (error) {
          error(msg);
        }
      }
      const xhrStatusChangeHandler = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200 || xhr.status === 304 || xhr.status === 0) {
            config = new Config(xhr);
            success(config);
          } else {
            fail('[Browser][cordova.js][xhrStatusChangeHandler] Could not XHR config.xml: ' + xhr.statusText);
          }
        }
      };
      xhr.addEventListener('load', xhrStatusChangeHandler);
      try {
        xhr.open('get', 'config.xml', true);
        xhr.send();
      } catch (e) {
        fail('[Browser][cordova.js][readConfig] Could not XHR config.xml: ' + JSON.stringify(e));
      }
    }
    Config.prototype.getPreferenceValue = function getPreferenceValue(preferenceName) {
      const preferenceItem = this.preferences && this.preferences.filter(function (item) {
        return item.attributes.name && item.attributes.name.value === preferenceName;
      });
      if (preferenceItem && preferenceItem[0] && preferenceItem[0].attributes && preferenceItem[0].attributes.value) {
        return preferenceItem[0].attributes.value.value;
      }
    };
    exports.readConfig = readConfig;
  });
  define("cordova/exec", function (require, exports, module) {
    const cordova = require('cordova');
    const execProxy = require('cordova/exec/proxy');
    module.exports = function (success, fail, service, action, args) {
      const proxy = execProxy.get(service, action);
      args = args || [];
      if (proxy) {
        const callbackId = service + cordova.callbackId++;
        if (typeof success === 'function' || typeof fail === 'function') {
          cordova.callbacks[callbackId] = { success, fail };
        }
        try {
          const onSuccess = function (result, callbackOptions) {
            callbackOptions = callbackOptions || {};
            let callbackStatus;
            if (callbackOptions.status !== undefined && callbackOptions.status !== null) {
              callbackStatus = callbackOptions.status;
            } else {
              callbackStatus = cordova.callbackStatus.OK;
            }
            cordova.callbackSuccess(callbackOptions.callbackId || callbackId,
              {
                status: callbackStatus,
                message: result,
                keepCallback: callbackOptions.keepCallback || false
              });
          };
          const onError = function (err, callbackOptions) {
            callbackOptions = callbackOptions || {};
            let callbackStatus;
            if (callbackOptions.status !== undefined && callbackOptions.status !== null) {
              callbackStatus = callbackOptions.status;
            } else {
              callbackStatus = cordova.callbackStatus.OK;
            }
            cordova.callbackError(callbackOptions.callbackId || callbackId,
              {
                status: callbackStatus,
                message: err,
                keepCallback: callbackOptions.keepCallback || false
              });
          };
          proxy(onSuccess, onError, args);
        } catch (e) {
          console.log('Exception calling native with command :: ' + service + ' :: ' + action + ' ::exception=' + e);
        }
      } else {
        console.log('Error: exec proxy not found for :: ' + service + ' :: ' + action);
        if (typeof fail === 'function') {
          fail('Missing Command Error');
        }
      }
    };
  });
  define("cordova/exec/proxy", function (require, exports, module) {
    var CommandProxyMap = {};
    module.exports = {
      add: function (id, proxyObj) {
        console.log('adding proxy for ' + id);
        CommandProxyMap[id] = proxyObj;
        return proxyObj;
      },
      remove: function (id) {
        var proxy = CommandProxyMap[id];
        delete CommandProxyMap[id];
        CommandProxyMap[id] = null;
        return proxy;
      },
      get: function (service, action) {
        return (CommandProxyMap[service] ? CommandProxyMap[service][action] : null);
      }
    };
  });
  define("cordova/init", function (require, exports, module) {
    var channel = require('cordova/channel');
    var cordova = require('cordova');
    var modulemapper = require('cordova/modulemapper');
    var platform = require('cordova/platform');
    var pluginloader = require('cordova/pluginloader');
    var platformInitChannelsArray = [channel.onNativeReady, channel.onPluginsReady];
    function logUnfiredChannels(arr) {
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i].state !== 2) {
          console.log('Channel not fired: ' + arr[i].type);
        }
      }
    }
    window.setTimeout(function () {
      if (channel.onDeviceReady.state !== 2) {
        console.log('deviceready has not fired after 5 seconds.');
        logUnfiredChannels(platformInitChannelsArray);
        logUnfiredChannels(channel.deviceReadyChannelsArray);
      }
    }, 5000);
    if (!window.console) {
      window.console = {
        log: function () { }
      };
    }
    if (!window.console.warn) {
      window.console.warn = function (msg) {
        this.log('warn: ' + msg);
      };
    }
    channel.onPause = cordova.addDocumentEventHandler('pause');
    channel.onResume = cordova.addDocumentEventHandler('resume');
    channel.onActivated = cordova.addDocumentEventHandler('activated');
    channel.onDeviceReady = cordova.addStickyDocumentEventHandler('deviceready');
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      channel.onDOMContentLoaded.fire();
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        channel.onDOMContentLoaded.fire();
      }, false);
    }
    if (window._nativeReady) {
      channel.onNativeReady.fire();
    }
    modulemapper.clobbers('cordova', 'cordova');
    modulemapper.clobbers('cordova/exec', 'cordova.exec');
    modulemapper.clobbers('cordova/exec', 'Cordova.exec');
    platform.bootstrap && platform.bootstrap();
    setTimeout(function () {
      pluginloader.load(function () {
        channel.onPluginsReady.fire();
      });
    }, 0);
    channel.join(function () {
      modulemapper.mapModules(window);
      platform.initialize && platform.initialize();
      channel.onCordovaReady.fire();
      channel.join(function () {
        require('cordova').fireDocumentEvent('deviceready');
      }, channel.deviceReadyChannelsArray);
    }, platformInitChannelsArray);
  });
  define("cordova/modulemapper", function (require, exports, module) {
    var builder = require('cordova/builder');
    var moduleMap = define.moduleMap;
    var symbolList;
    var deprecationMap;
    exports.reset = function () {
      symbolList = [];
      deprecationMap = {};
    };
    function addEntry(strategy, moduleName, symbolPath, opt_deprecationMessage) {
      if (!(moduleName in moduleMap)) {
        throw new Error('Module ' + moduleName + ' does not exist.');
      }
      symbolList.push(strategy, moduleName, symbolPath);
      if (opt_deprecationMessage) {
        deprecationMap[symbolPath] = opt_deprecationMessage;
      }
    }
    exports.clobbers = function (moduleName, symbolPath, opt_deprecationMessage) {
      addEntry('c', moduleName, symbolPath, opt_deprecationMessage);
    };
    exports.merges = function (moduleName, symbolPath, opt_deprecationMessage) {
      addEntry('m', moduleName, symbolPath, opt_deprecationMessage);
    };
    exports.defaults = function (moduleName, symbolPath, opt_deprecationMessage) {
      addEntry('d', moduleName, symbolPath, opt_deprecationMessage);
    };
    exports.runs = function (moduleName) {
      addEntry('r', moduleName, null);
    };
    function prepareNamespace(symbolPath, context) {
      if (!symbolPath) {
        return context;
      }
      return symbolPath.split('.').reduce(function (cur, part) {
        return (cur[part] = cur[part] || {});
      }, context);
    }
    exports.mapModules = function (context) {
      var origSymbols = {};
      context.CDV_origSymbols = origSymbols;
      for (var i = 0, len = symbolList.length; i < len; i += 3) {
        var strategy = symbolList[i];
        var moduleName = symbolList[i + 1];
        var module = require(moduleName);
        if (strategy === 'r') {
          continue;
        }
        var symbolPath = symbolList[i + 2];
        var lastDot = symbolPath.lastIndexOf('.');
        var namespace = symbolPath.substr(0, lastDot);
        var lastName = symbolPath.substr(lastDot + 1);
        var deprecationMsg = symbolPath in deprecationMap ? 'Access made to deprecated symbol: ' + symbolPath + '. ' + deprecationMsg : null;
        var parentObj = prepareNamespace(namespace, context);
        var target = parentObj[lastName];
        if (strategy === 'm' && target) {
          builder.recursiveMerge(target, module);
        } else if ((strategy === 'd' && !target) || (strategy !== 'd')) {
          if (!(symbolPath in origSymbols)) {
            origSymbols[symbolPath] = target;
          }
          builder.assignOrWrapInDeprecateGetter(parentObj, lastName, module, deprecationMsg);
        }
      }
    };
    exports.getOriginalSymbol = function (context, symbolPath) {
      var origSymbols = context.CDV_origSymbols;
      if (origSymbols && (symbolPath in origSymbols)) {
        return origSymbols[symbolPath];
      }
      var parts = symbolPath.split('.');
      var obj = context;
      for (var i = 0; i < parts.length; ++i) {
        obj = obj && obj[parts[i]];
      }
      return obj;
    };
    exports.reset();
  });
  define("cordova/platform", function (require, exports, module) {
    module.exports = {
      id: 'browser',
      cordovaVersion: '4.2.0',
      bootstrap: function () {
        const modulemapper = require('cordova/modulemapper');
        const channel = require('cordova/channel');
        modulemapper.clobbers('cordova/exec/proxy', 'cordova.commandProxy');
        channel.onNativeReady.fire();
        document.addEventListener('visibilitychange', function () {
          if (document.hidden) {
            channel.onPause.fire();
          } else {
            channel.onResume.fire();
          }
        });
      }
    };
  });
  define("cordova/pluginloader", function (require, exports, module) {
    var modulemapper = require('cordova/modulemapper');
    exports.injectScript = function (url, onload, onerror) {
      var script = document.createElement('script');
      script.onload = onload;
      script.onerror = onerror;
      script.src = url;
      document.head.appendChild(script);
    };
    function injectIfNecessary(id, url, onload, onerror) {
      onerror = onerror || onload;
      if (id in define.moduleMap) {
        onload();
      } else {
        exports.injectScript(url, function () {
          if (id in define.moduleMap) {
            onload();
          } else {
            onerror();
          }
        }, onerror);
      }
    }
    function onScriptLoadingComplete(moduleList, finishPluginLoading) {
      for (var i = 0, module; (module = moduleList[i]); i++) {
        if (module.clobbers && module.clobbers.length) {
          for (var j = 0; j < module.clobbers.length; j++) {
            modulemapper.clobbers(module.id, module.clobbers[j]);
          }
        }
        if (module.merges && module.merges.length) {
          for (var k = 0; k < module.merges.length; k++) {
            modulemapper.merges(module.id, module.merges[k]);
          }
        }
        if (module.runs) {
          modulemapper.runs(module.id);
        }
      }
      finishPluginLoading();
    }
    function handlePluginsObject(path, moduleList, finishPluginLoading) {
      var scriptCounter = moduleList.length;
      if (!scriptCounter) {
        finishPluginLoading();
        return;
      }
      function scriptLoadedCallback() {
        if (!--scriptCounter) {
          onScriptLoadingComplete(moduleList, finishPluginLoading);
        }
      }
      for (var i = 0; i < moduleList.length; i++) {
        injectIfNecessary(moduleList[i].id, path + moduleList[i].file, scriptLoadedCallback);
      }
    }
    function findCordovaPath() {
      var path = null;
      var scripts = document.getElementsByTagName('script');
      var term = '/cordova.js';
      for (var n = scripts.length - 1; n > -1; n--) {
        var src = scripts[n].src.replace(/\?.*$/, '');
        if (src.indexOf(term) === (src.length - term.length)) {
          path = src.substring(0, src.length - term.length) + '/';
          break;
        }
      }
      return path;
    }
    exports.load = function (callback) {
      var pathPrefix = findCordovaPath();
      if (pathPrefix === null) {
        console.log('Could not find cordova.js script tag. Plugin loading may fail.');
        pathPrefix = '';
      }
      injectIfNecessary('cordova/plugin_list', pathPrefix + 'cordova_plugins.js', function () {
        var moduleList = require('cordova/plugin_list');
        handlePluginsObject(pathPrefix, moduleList, callback);
      }, callback);
    };
  });
  define("cordova/urlutil", function (require, exports, module) {
    exports.makeAbsolute = function makeAbsolute(url) {
      var anchorEl = document.createElement('a');
      anchorEl.href = url;
      return anchorEl.href;
    };
  });
  define("cordova/utils", function (require, exports, module) {
    var utils = exports;
    utils.defineGetterSetter = function (obj, key, getFunc, opt_setFunc) {
      if (Object.defineProperty) {
        var desc = {
          get: getFunc,
          configurable: true
        };
        if (opt_setFunc) {
          desc.set = opt_setFunc;
        }
        Object.defineProperty(obj, key, desc);
      } else {
        obj.__defineGetter__(key, getFunc);
        if (opt_setFunc) {
          obj.__defineSetter__(key, opt_setFunc);
        }
      }
    };
    utils.defineGetter = utils.defineGetterSetter;
    utils.arrayIndexOf = function (a, item) {
      if (a.indexOf) {
        return a.indexOf(item);
      }
      var len = a.length;
      for (var i = 0; i < len; ++i) {
        if (a[i] === item) {
          return i;
        }
      }
      return -1;
    };
    utils.arrayRemove = function (a, item) {
      var index = utils.arrayIndexOf(a, item);
      if (index !== -1) {
        a.splice(index, 1);
      }
      return index !== -1;
    };
    utils.typeName = function (val) {
      return Object.prototype.toString.call(val).slice(8, -1);
    };
    utils.isArray = Array.isArray ||
      function (a) { return utils.typeName(a) === 'Array'; };
    utils.isDate = function (d) {
      return (d instanceof Date);
    };
    utils.clone = function (obj) {
      if (!obj || typeof obj === 'function' || utils.isDate(obj) || typeof obj !== 'object') {
        return obj;
      }
      var retVal, i;
      if (utils.isArray(obj)) {
        retVal = [];
        for (i = 0; i < obj.length; ++i) {
          retVal.push(utils.clone(obj[i]));
        }
        return retVal;
      }
      retVal = {};
      for (i in obj) {
        if ((!(i in retVal) || retVal[i] !== obj[i]) && typeof obj[i] !== 'undefined' && typeof obj[i] !== 'unknown') {
          retVal[i] = utils.clone(obj[i]);
        }
      }
      return retVal;
    };
    utils.close = function (context, func, params) {
      return function () {
        var args = params || arguments;
        return func.apply(context, args);
      };
    };
    function UUIDcreatePart(length) {
      var uuidpart = '';
      for (var i = 0; i < length; i++) {
        var uuidchar = parseInt((Math.random() * 256), 10).toString(16);
        if (uuidchar.length === 1) {
          uuidchar = '0' + uuidchar;
        }
        uuidpart += uuidchar;
      }
      return uuidpart;
    }
    utils.createUUID = function () {
      return UUIDcreatePart(4) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(2) + '-' +
        UUIDcreatePart(6);
    };
    utils.extend = (function () {
      var F = function () { };
      return function (Child, Parent) {
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.__super__ = Parent.prototype;
        Child.prototype.constructor = Child;
      };
    }());
    utils.alert = function (msg) {
      if (window.alert) {
        window.alert(msg);
      } else if (console && console.log) {
        console.log(msg);
      }
    };
  });
  window.cordova = require('cordova');
  require('cordova/init');
})();
