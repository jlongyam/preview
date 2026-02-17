var consoleBox = function() {
  function _arrayLikeToArray(r, a) {
    (null == a || a > r.length) && (a = r.length);
    for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
    return n;
  }
  function _createForOfIteratorHelper(r, e) {
    var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (!t) {
      if (Array.isArray(r) || (t = function(r, a) {
        if (r) {
          if ("string" == typeof r) return _arrayLikeToArray(r, a);
          var t = {}.toString.call(r).slice(8, -1);
          return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
        }
      }(r)) || e) {
        t && (r = t);
        var n = 0, F = function() {};
        return {
          s: F,
          n: function() {
            return n >= r.length ? {
              done: !0
            } : {
              done: !1,
              value: r[n++]
            };
          },
          e: function(r) {
            throw r;
          },
          f: F
        };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var o, a = !0, u = !1;
    return {
      s: function() {
        t = t.call(r);
      },
      n: function() {
        var r = t.next();
        return a = r.done, r;
      },
      e: function(r) {
        u = !0, o = r;
      },
      f: function() {
        try {
          a || null == t.return || t.return();
        } finally {
          if (u) throw o;
        }
      }
    };
  }
  function _typeof(o) {
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
      return typeof o;
    } : function(o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function ansiToHtml(text) {
    for (var match, ansiMap = {
      30: "color: black",
      31: "color: #ef476f",
      32: "color: #06d6a0",
      33: "color: #ffd166",
      34: "color: #118ab2",
      35: "color: #8338ec",
      36: "color: #00b4d8",
      37: "color: white",
      40: "background-color: black",
      41: "background-color: #ef476f",
      42: "background-color: #06d6a0",
      43: "background-color: #ffd166",
      44: "background-color: #118ab2",
      45: "background-color: #8338ec",
      46: "background-color: #00b4d8",
      47: "background-color: white",
      90: "color: rgb(85,85,85)",
      91: "color: rgb(255,85,85)",
      92: "color: rgb(85,255,85)",
      93: "color: rgb(255,255,85)",
      94: "color: rgb(85,85,255)",
      95: "color: rgb(255,85,255)",
      96: "color: rgb(85,255,255)",
      97: "color: rgb(255,255,255)",
      1: "font-weight: bold",
      3: "font-style: italic",
      4: "text-decoration: underline",
      7: "filter: invert(100%)",
      9: "text-decoration: line-through",
      0: "all: initial"
    }, ansiRegex = /\x1b\[([0-9;]*)m/g, html = "", stack = [], lastIndex = 0; null !== (match = ansiRegex.exec(text)); ) {
      html += escapeHtml(text.slice(lastIndex, match.index));
      var codes = match[1].split(";").filter(function(code) {
        return "" !== code;
      });
      0 === codes.length && codes.push("0");
      var _step, _iterator = _createForOfIteratorHelper(codes);
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var code = _step.value;
          if ("0" === code) for (;stack.length > 0; ) html += "</span>", stack.pop(); else ansiMap[code] && (html += '<span style="'.concat(ansiMap[code], '">'), 
          stack.push(code));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      lastIndex = match.index + match[0].length;
    }
    for (html += escapeHtml(text.slice(lastIndex)); stack.length > 0; ) html += "</span>", 
    stack.pop();
    return html;
  }
  function formatArgs(args) {
    if (!args.length) return {
      formatted: [],
      styles: []
    };
    var first = args[0], rest = Array.prototype.slice.call(args, 1), styles = [];
    if ("string" == typeof first && /%[sdifoOc]/.test(first)) {
      for (var match, i = 0, nodes = [], lastIndex = 0, pattern = /%([sdifoOc%])/g, str = first; null !== (match = pattern.exec(str)); ) {
        match.index > lastIndex && nodes.push(document.createTextNode(str.slice(lastIndex, match.index)));
        var type = match[1];
        if ("%" === type) nodes.push(document.createTextNode("%")); else if ("c" === type) styles.push(rest[i++] || ""); else {
          var val = rest[i++];
          nodes.push(formatSingleArg(val));
        }
        lastIndex = match.index + match[0].length;
      }
      for (lastIndex < str.length && nodes.push(document.createTextNode(str.slice(lastIndex))); i < rest.length; i++) nodes.push(document.createTextNode(" ")), 
      nodes.push(formatSingleArg(rest[i]));
      return {
        formatted: nodes,
        styles: styles
      };
    }
    return {
      formatted: Array.prototype.map.call(args, formatSingleArg),
      styles: []
    };
  }
  function formatSingleArg(arg) {
    var span = document.createElement("span"), typeClass = function(arg) {
      if (null === arg) return "js-null";
      if (Array.isArray(arg)) return "js-array";
      switch (_typeof(arg)) {
       case "string":
        return "js-string";

       case "number":
        return "js-number";

       case "boolean":
        return "js-boolean";

       case "undefined":
        return "js-undefined";

       case "function":
        return "js-function";

       case "symbol":
        return "js-symbol";

       case "bigint":
        return "js-bigint";

       case "object":
        return "js-object";

       default:
        return "";
      }
    }(arg);
    if (span.className = typeClass, "js-string" === typeClass) if ("string" == typeof arg && arg.includes("[")) {
      var tempDiv = document.createElement("div");
      for (tempDiv.innerHTML = ansiToHtml(arg); tempDiv.firstChild; ) span.appendChild(tempDiv.firstChild);
    } else span.textContent = arg; else if ("js-null" === typeClass) span.textContent = "null"; else if ("js-undefined" === typeClass) span.textContent = "undefined"; else if ("js-array" === typeClass) try {
      span.textContent = JSON.stringify(arg);
    } catch (e) {
      span.textContent = "[array]";
    } else if ("js-object" === typeClass) try {
      span.textContent = JSON.stringify(arg);
    } catch (e) {
      span.textContent = "[object]";
    } else span.textContent = "js-function" === typeClass || "js-symbol" === typeClass ? arg.toString() : "js-bigint" === typeClass ? arg.toString() + "n" : String(arg);
    return span;
  }
  var timers = {}, counts = {}, groupStack = [];
  function createGroup(label, isCollapsed) {
    var out = document.getElementById("console_out");
    if (out) {
      var targetContainer = out;
      groupStack.length > 0 && (targetContainer = groupStack[groupStack.length - 1].contentDiv);
      var groupWrapper = document.createElement("div");
      groupWrapper.className = "console-group";
      var groupHeader = document.createElement("div");
      groupHeader.className = "console-group-header";
      var toggle = document.createElement("span");
      toggle.className = "dir-toggle", toggle.textContent = isCollapsed ? "▶" : "▼";
      var labelSpan = document.createElement("span");
      labelSpan.className = "console-group-label", labelSpan.innerHTML = ansiToHtml(label), 
      groupHeader.appendChild(toggle), label && groupHeader.appendChild(labelSpan);
      var contentDiv = document.createElement("div");
      contentDiv.className = "console-group-content", isCollapsed && contentDiv.classList.add("dir-hidden"), 
      toggle.addEventListener("click", doToggle), toggle.addEventListener("touchstart", function(e) {
        e.preventDefault(), doToggle(e);
      }), groupWrapper.appendChild(groupHeader), groupWrapper.appendChild(contentDiv), 
      targetContainer.appendChild(groupWrapper), groupStack.push({
        wrapper: groupWrapper,
        contentDiv: contentDiv,
        label: label
      });
    }
    function doToggle(e) {
      e.stopPropagation(), contentDiv.classList.contains("dir-hidden") ? (contentDiv.classList.remove("dir-hidden"), 
      contentDiv.classList.add("dir-expanded"), toggle.textContent = "▼") : (contentDiv.classList.add("dir-hidden"), 
      contentDiv.classList.remove("dir-expanded"), toggle.textContent = "▶");
    }
  }
  function renderTree(obj, depth) {
    depth = depth || 0;
    var container = document.createElement("div");
    if (container.className = "dir-tree dir-indent-" + Math.min(depth, 9), "object" === _typeof(obj) && null !== obj) {
      var keys = Object.getOwnPropertyNames(obj);
      for (var key in obj) -1 === keys.indexOf(key) && keys.push(key);
      keys.sort();
      for (var j = 0; j < keys.length; j++) {
        var val;
        key = keys[j];
        try {
          val = obj[key];
        } catch (e) {
          val = "<access denied>";
        }
        var item = renderTreeEntry(key, val, depth + 1);
        container.appendChild(item);
      }
    } else {
      var valSpan = document.createElement("span");
      valSpan.className = "dir-value", valSpan.textContent = String(obj), container.appendChild(valSpan);
    }
    return container;
  }
  function renderTreeEntry(key, val, depth) {
    var entry = document.createElement("div");
    if (entry.className = "dir-tree-entry dir-indent-" + Math.min(depth, 9), function(val) {
      if (!val || "object" !== _typeof(val)) return !1;
      if (Object.getOwnPropertyNames(val).length > 0) return !0;
      for (var k in val) return !0;
      return !1;
    }(val)) {
      var collapsedLine = document.createElement("div");
      collapsedLine.className = "dir-collapsed-line";
      var toggle = document.createElement("span");
      toggle.className = "dir-toggle", toggle.textContent = "▶", (keySpan = document.createElement("span")).className = "dir-key", 
      keySpan.textContent = key + ": ";
      var expanded, typeSpan = document.createElement("span");
      function doToggle(e) {
        e.stopPropagation(), expanded ? expanded.classList.contains("dir-hidden") ? (expanded.classList.remove("dir-hidden"), 
        expanded.classList.add("dir-expanded"), toggle.textContent = "▼") : (expanded.classList.add("dir-hidden"), 
        expanded.classList.remove("dir-expanded"), toggle.textContent = "▶") : ((expanded = renderTree(val, depth + 1)).classList.add("dir-expanded"), 
        entry.appendChild(expanded), toggle.textContent = "▼");
      }
      typeSpan.className = "dir-type", typeSpan.textContent = Array.isArray(val) && Object.getPrototypeOf(val) !== Object.prototype ? "Array(" + val.length + ")" : val && val.constructor && val.constructor !== Object ? val.constructor.name : "Object", 
      collapsedLine.appendChild(toggle), collapsedLine.appendChild(keySpan), collapsedLine.appendChild(typeSpan), 
      toggle.addEventListener("click", doToggle), toggle.addEventListener("touchstart", function(e) {
        e.preventDefault(), doToggle(e);
      }), entry.appendChild(collapsedLine);
    } else {
      var keySpan;
      (keySpan = document.createElement("span")).className = "dir-key", keySpan.textContent = key + ": ";
      var valSpan = document.createElement("span");
      valSpan.className = "dir-value", valSpan.textContent = String(val), entry.appendChild(keySpan), 
      entry.appendChild(valSpan);
    }
    return entry;
  }
  function consolePrint(type, args, rawObj) {
    var indent = "  ".repeat(0), out = document.getElementById("console_out");
    if (out) {
      var targetContainer = out;
      groupStack.length > 0 && (targetContainer = groupStack[groupStack.length - 1].contentDiv);
      var div = document.createElement("div");
      if (div.className = type, ("log" === type || "info" === type || "warn" === type || "error" === type || "debug" === type) && args.length > 0) {
        var _formatArgs = formatArgs(args), formatted = _formatArgs.formatted, styles = _formatArgs.styles;
        if (styles.length > 0) for (var spanIdx = 0, styleIdx = 0; spanIdx < formatted.length; ) {
          for (var span = document.createElement("span"); spanIdx < formatted.length && (3 !== formatted[spanIdx].nodeType || "" !== formatted[spanIdx].textContent); ) span.appendChild(formatted[spanIdx]), 
          spanIdx++;
          styles[styleIdx] && span.setAttribute("style", styles[styleIdx]), div.appendChild(span), 
          styleIdx++, spanIdx++;
        } else {
          div.appendChild(document.createTextNode(indent));
          for (var i = 0; i < formatted.length; i++) if (i > 0 && div.appendChild(document.createTextNode(" ")), 
          3 === formatted[i].nodeType && formatted[i].textContent.includes("[")) {
            var tempDiv = document.createElement("div");
            for (tempDiv.innerHTML = ansiToHtml(formatted[i].textContent); tempDiv.firstChild; ) div.appendChild(tempDiv.firstChild);
          } else div.appendChild(formatted[i]);
        }
      } else if ("dir" === type && void 0 !== rawObj) {
        var collapsedRoot = document.createElement("div");
        collapsedRoot.className = "dir-collapsed-line";
        var toggle = document.createElement("span");
        toggle.className = "dir-toggle", toggle.textContent = "▶";
        var typeSpan = document.createElement("span");
        typeSpan.className = "dir-type", Array.isArray(rawObj) && Object.getPrototypeOf(rawObj) !== Object.prototype ? typeSpan.textContent = "Array(" + rawObj.length + ")" : rawObj && rawObj.constructor && rawObj.constructor !== Object ? typeSpan.textContent = rawObj.constructor.name : typeSpan.textContent = "Object", 
        collapsedRoot.appendChild(toggle), collapsedRoot.appendChild(typeSpan);
        var tree = renderTree(rawObj, 0);
        function doToggle(e) {
          e.stopPropagation(), tree.classList.contains("dir-hidden") ? (tree.classList.remove("dir-hidden"), 
          tree.classList.add("dir-expanded"), toggle.textContent = "▼") : (tree.classList.add("dir-hidden"), 
          tree.classList.remove("dir-expanded"), toggle.textContent = "▶");
        }
        tree.classList.add("dir-hidden"), toggle.addEventListener("click", doToggle), toggle.addEventListener("touchstart", function(e) {
          e.preventDefault(), doToggle(e);
        }), div.appendChild(collapsedRoot), div.appendChild(tree);
      } else for (formatted = formatArgs(args).formatted, div.appendChild(document.createTextNode(indent)), 
      i = 0; i < formatted.length; i++) if (3 === formatted[i].nodeType && formatted[i].textContent.includes("[")) {
        var _tempDiv = document.createElement("div");
        for (_tempDiv.innerHTML = ansiToHtml(formatted[i].textContent); _tempDiv.firstChild; ) div.appendChild(_tempDiv.firstChild);
      } else div.appendChild(formatted[i]);
      targetContainer.appendChild(div);
    }
  }
  var consoleBox = {
    log: function() {
      consolePrint("log", arguments);
    },
    info: function() {
      consolePrint("info", arguments);
    },
    warn: function() {
      consolePrint("warn", arguments);
    },
    error: function() {
      consolePrint("error", arguments);
    },
    debug: function() {
      consolePrint("debug", arguments);
    },
    assert: function(condition) {
      if (!condition) {
        var args = Array.prototype.slice.call(arguments, 1);
        consolePrint("assert", [ "Assertion failed:" ].concat(args));
      }
    },
    clear: function() {
      var out = document.getElementById("console_out");
      out && (out.innerHTML = "");
    },
    count: function(label) {
      counts[label = label || "default"] = (counts[label] || 0) + 1, consolePrint("count", [ label + ": " + counts[label] ]);
    },
    countReset: function(label) {
      counts[label = label || "default"] = 0;
    },
    group: function(label) {
      createGroup(label || "", !1);
    },
    groupCollapsed: function(label) {
      createGroup(label || "", !0);
    },
    groupEnd: function() {
      groupStack.length > 0 && groupStack.pop();
    },
    time: function(label) {
      timers[label = label || "default"] = Date.now();
    },
    exception: function() {
      consolePrint("error", arguments);
    },
    markTimeline: function() {},
    timeline: function() {},
    timelineEnd: function() {},
    timeStamp: function(label) {
      consolePrint("timeStamp", [ label ? String(label) : "Timestamp: " + (new Date).toISOString() ]);
    },
    context: function() {},
    memory: {},
    timeEnd: function(label) {
      timers[label = label || "default"] && (consolePrint("time", [ label + ": " + (Date.now() - timers[label]) + "ms" ]), 
      delete timers[label]);
    },
    timeLog: function(label) {
      timers[label = label || "default"] && consolePrint("timeLog", [ label + ": " + (Date.now() - timers[label]) + "ms" ]);
    },
    trace: function() {
      var stack = ((new Error).stack || "").split("\n");
      stack.length > 1 && (stack = stack.slice(1)), consolePrint("trace", [ "Trace:", stack.join("\n") ]);
    },
    table: function(data, columns) {
      var out = document.getElementById("console_out");
      if (out) {
        var div = document.createElement("div");
        div.className = "table";
        var formatValue = function(value) {
          if (void 0 === value) return "undefined";
          if (null === value) return "null";
          if ("string" == typeof value) return "'" + value + "'";
          if ("object" === _typeof(value)) {
            if (value.nodeType) return value.outerHTML || value.toString();
            try {
              var json = JSON.stringify(value);
              return "{}" === json ? value.toString() : json;
            } catch (e) {
              return value.toString();
            }
          }
          return String(value);
        }, table = document.createElement("table");
        if (table.className = "console-table", Array.isArray(data)) {
          var headers, isAllArrays = data.length > 0 && data.every(function(item) {
            return Array.isArray(item);
          }), isAllObjects = data.length > 0 && data.every(function(item) {
            return item && "object" === _typeof(item) && !Array.isArray(item);
          });
          if (isAllArrays) {
            var maxLength = Math.max.apply(Math, data.map(function(arr) {
              return Array.isArray(arr) ? arr.length : 0;
            }));
            headers = [ "(index)" ];
            for (var i = 0; i < maxLength; i++) headers.push(String(i));
          } else if (isAllObjects) {
            var allKeys = new Set;
            data.forEach(function(item) {
              item && "object" === _typeof(item) && !Array.isArray(item) && Object.keys(item).forEach(function(k) {
                allKeys.add(k);
              });
            }), headers = [ "(index)" ].concat(Array.from(allKeys).sort());
          } else headers = [ "(index)", "Value" ];
          if (columns && Array.isArray(columns)) {
            var filteredHeaders = [ "(index)" ];
            columns.forEach(function(col) {
              -1 !== headers.indexOf(col) && filteredHeaders.push(col);
            }), headers = filteredHeaders;
          }
          var thead = document.createElement("thead"), headerRow = document.createElement("tr");
          headers.forEach(function(h) {
            var th = document.createElement("th");
            th.textContent = h, headerRow.appendChild(th);
          }), thead.appendChild(headerRow), table.appendChild(thead);
          var tbody = document.createElement("tbody");
          data.forEach(function(item, index) {
            var row = document.createElement("tr"), indexCell = document.createElement("td");
            indexCell.textContent = index, row.appendChild(indexCell), headers.slice(1).forEach(function(header) {
              var value, cell = document.createElement("td");
              if ("Value" === header) value = item; else if (isAllArrays && Array.isArray(item)) {
                var arrayIndex = parseInt(header);
                value = item[arrayIndex];
              } else value = isAllObjects && item && "object" === _typeof(item) ? item[header] : void 0;
              cell.textContent = formatValue(value), row.appendChild(cell);
            }), tbody.appendChild(row);
          }), table.appendChild(tbody);
        } else {
          if ("object" !== _typeof(data) || null === data) return div.textContent = formatValue(data), 
          void out.appendChild(div);
          var props = new Set;
          for (var key in data) props.add(key);
          Object.getOwnPropertyNames(data).forEach(function(prop) {
            props.add(prop);
          }), thead = document.createElement("thead"), headerRow = document.createElement("tr"), 
          [ "(index)", "Value" ].forEach(function(h) {
            var th = document.createElement("th");
            th.textContent = h, headerRow.appendChild(th);
          }), thead.appendChild(headerRow), table.appendChild(thead), tbody = document.createElement("tbody"), 
          Array.from(props).sort().forEach(function(prop) {
            if ("constructor" !== prop) {
              var row = document.createElement("tr"), propCell = document.createElement("td");
              propCell.textContent = prop, row.appendChild(propCell);
              var valueCell = document.createElement("td");
              try {
                valueCell.textContent = formatValue(data[prop]);
              } catch (e) {
                valueCell.textContent = "<access denied>";
              }
              row.appendChild(valueCell), tbody.appendChild(row);
            }
          }), table.appendChild(tbody);
        }
        div.appendChild(table), out.appendChild(div);
      }
    },
    dir: function(obj) {
      consolePrint("dir", [ "" ], obj);
    },
    dirxml: function(obj) {
      if ("object" === _typeof(obj) && obj && obj.nodeType) {
        var out = document.getElementById("console_out");
        if (!out) return;
        var div = document.createElement("div");
        div.className = "dirxml", div.appendChild(function renderDomTree(node, depth) {
          depth = depth || 0;
          var container = document.createElement("div");
          if (container.className = "dir-tree dir-indent-" + Math.min(depth, 9), 1 === node.nodeType) {
            var entry = document.createElement("div");
            entry.className = "dir-tree-entry dir-indent-" + Math.min(depth, 9);
            var collapsedLine = document.createElement("div");
            collapsedLine.className = "dir-collapsed-line";
            var toggle = document.createElement("span");
            toggle.className = "dir-toggle", toggle.textContent = node.childNodes.length > 0 ? "▶" : "";
            var tagSpan = document.createElement("span");
            tagSpan.className = "dir-key", tagSpan.textContent = "<" + node.nodeName.toLowerCase();
            for (var i = 0; i < node.attributes.length; i++) {
              var attr = node.attributes[i];
              tagSpan.textContent += " " + attr.name + '="' + attr.value + '"';
            }
            tagSpan.textContent += ">", toggle.textContent && collapsedLine.appendChild(toggle), 
            collapsedLine.appendChild(tagSpan);
            var expanded = document.createElement("div");
            expanded.className = "dir-hidden";
            for (var j = 0; j < node.childNodes.length; j++) expanded.appendChild(renderDomTree(node.childNodes[j], depth + 1));
            if (node.childNodes.length > 0) {
              var closeTag = document.createElement("div");
              closeTag.className = "dir-tree-entry dir-indent-" + Math.min(depth + 1, 9);
              var closeSpan = document.createElement("span");
              closeSpan.className = "dir-key", closeSpan.textContent = "</" + node.nodeName.toLowerCase() + ">", 
              closeTag.appendChild(closeSpan), expanded.appendChild(closeTag);
            }
            function doToggle(e) {
              e.stopPropagation(), expanded.classList.contains("dir-hidden") ? (expanded.classList.remove("dir-hidden"), 
              expanded.classList.add("dir-expanded"), toggle.textContent = "▼") : (expanded.classList.add("dir-hidden"), 
              expanded.classList.remove("dir-expanded"), toggle.textContent = "▶");
            }
            toggle.textContent && (toggle.addEventListener("click", doToggle), toggle.addEventListener("touchstart", function(e) {
              e.preventDefault(), doToggle(e);
            })), entry.appendChild(collapsedLine), node.childNodes.length > 0 && entry.appendChild(expanded), 
            container.appendChild(entry);
          } else if (3 === node.nodeType) {
            var textContent = node.textContent.trim();
            if (textContent) {
              var textEntry = document.createElement("div");
              textEntry.className = "dir-tree-entry dir-indent-" + Math.min(depth, 9);
              var textSpan = document.createElement("span");
              textSpan.className = "dir-value", textSpan.textContent = textContent, textEntry.appendChild(textSpan), 
              container.appendChild(textEntry);
            }
          } else if (8 === node.nodeType) {
            var commentEntry = document.createElement("div");
            commentEntry.className = "dir-tree-entry dir-indent-" + Math.min(depth, 9);
            var commentSpan = document.createElement("span");
            commentSpan.className = "dir-value", commentSpan.textContent = "\x3c!-- " + node.textContent + " --\x3e", 
            commentEntry.appendChild(commentSpan), container.appendChild(commentEntry);
          } else if (9 === node.nodeType) for (var k = 0; k < node.childNodes.length; k++) container.appendChild(renderDomTree(node.childNodes[k], depth)); else {
            var otherEntry = document.createElement("div");
            otherEntry.className = "dir-tree-entry dir-indent-" + Math.min(depth, 9);
            var otherSpan = document.createElement("span");
            otherSpan.className = "dir-value", otherSpan.textContent = node.nodeName, otherEntry.appendChild(otherSpan), 
            container.appendChild(otherEntry);
          }
          return container;
        }(obj, 0)), out.appendChild(div);
      } else consolePrint("dirxml", [ "" ], obj);
    },
    profile: function(label) {},
    profileEnd: function(label) {}
  }, console_box = document.getElementById("console_box");
  if (!console_box) {
    var fragment = document.createDocumentFragment(), elTemp = document.createElement("div");
    elTemp.innerHTML = '\n    <div id="console_box">\n      <div id="console_output">\n        <div id="console_out"></div>\n      </div>\n      <div id="console_input">\n        <input id="console_in" type="text" autocomplete="off" placeholder="Code ...">\n      </div>\n    </div>\n  ';
    var comp = elTemp.firstElementChild;
    fragment.appendChild(comp), document.body.appendChild(fragment);
  }
  var input = document.getElementById("console_in");
  if (input) {
    var history = [], historyIndex = -1, tempInput = "";
    input.addEventListener("keydown", function(e) {
      if ("Enter" === e.key) {
        e.preventDefault();
        var code = input.value;
        "" !== code.trim() && (0 !== history.length && history[history.length - 1] === code || history.push(code)), 
        historyIndex = history.length, input.value = "", tempInput = "";
        try {
          var result = new Function("return " + code)();
          void 0 !== result && console.log(result);
        } catch (err) {
          if (err instanceof SyntaxError) try {
            new Function(code)();
          } catch (e) {
            console.error(e);
          } else console.error(err);
        }
      } else "ArrowUp" === e.key ? (history.length > 0 && historyIndex > 0 && (historyIndex === history.length && (tempInput = input.value), 
      historyIndex--, input.value = history[historyIndex], setTimeout(function() {
        input.setSelectionRange(input.value.length, input.value.length);
      }, 0)), e.preventDefault()) : "ArrowDown" === e.key && (history.length > 0 && historyIndex < history.length && (++historyIndex === history.length ? input.value = tempInput : input.value = history[historyIndex], 
      setTimeout(function() {
        input.setSelectionRange(input.value.length, input.value.length);
      }, 0)), e.preventDefault());
    }), input.focus();
  }
  var out = document.getElementById("console_out");
  out && new MutationObserver(function() {
    out.scrollTop = out.scrollHeight;
  }).observe(out, {
    childList: !0
  });
  var i_toggle = document.querySelector("#i_toggle");
  return i_toggle && i_toggle.addEventListener("click", function() {
    console_box.classList.toggle("hide"), this.classList.toggle("hide");
  }), Object.defineProperty(consoleBox, "memory", {
    get: function() {
      return {};
    },
    configurable: !0
  }), consoleBox;
}();
