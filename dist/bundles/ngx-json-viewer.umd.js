(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('ngx-json-viewer', ['exports', '@angular/core', '@angular/common'], factory) :
    (global = global || self, factory(global['ngx-json-viewer'] = {}, global.ng.core, global.ng.common));
}(this, (function (exports, core, common) { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __createBinding(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }

    function __exportStar(m, exports) {
        for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) exports[p] = m[p];
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var NgxJsonViewerComponent = /** @class */ (function () {
        function NgxJsonViewerComponent() {
            this.expanded = true;
            this.depth = -1;
            this.key = 'Object';
            // Tracks the length of array types. -1 for other types
            this.length = -1;
            this.restoreExpanded = false;
            this.showTypeHeadings = false;
            this._currentDepth = -1;
            this.nextOpenKeys = {};
            this.segments = [];
            // Matches the last underscore in a string
            this.underscoreRegex = /_[^_]+$/;
        }
        NgxJsonViewerComponent_1 = NgxJsonViewerComponent;
        NgxJsonViewerComponent.prototype.getOpenKeysRecursive = function () {
            var openKeys = {};
            this.childrenComponents.forEach(function (component) {
                // Save key and length - on reload array elements should only be reopened if
                // the array is the same length
                openKeys[component.key + '_' + component.length] = component.getOpenKeysRecursive();
            });
            if (Object.keys(openKeys).length === 0) {
                return;
            }
            return openKeys;
        };
        NgxJsonViewerComponent.prototype.openSegments = function () {
            var _this = this;
            var keys = Object.keys(this._previouslyOpenKeys);
            keys.forEach(function (key) {
                // Check to see if the key exists, if so expands it
                var strippedKey = key.replace(_this.underscoreRegex, '');
                var foundSegment = _this.segments.find(function (segment) {
                    return segment.key === strippedKey;
                });
                if (!foundSegment) {
                    return;
                }
                if (!_this.isExpandable(foundSegment)) {
                    return;
                }
                foundSegment.expanded = true;
            });
        };
        NgxJsonViewerComponent.prototype.ngOnChanges = function () {
            var _this = this;
            // Save open keys structure before processing new json
            // Will only run in top level
            if (this.restoreExpanded && this.childrenComponents) {
                this._previouslyOpenKeys = this.getOpenKeysRecursive();
                console.log(this._previouslyOpenKeys);
            }
            this.segments = [];
            // remove cycles
            this.json = this.decycle(this.json);
            this._currentDepth++;
            if (typeof this.json === 'object') {
                Object.keys(this.json).forEach(function (key) {
                    _this.segments.push(_this.parseKeyValue(key, _this.json[key]));
                });
            }
            else {
                this.segments.push(this.parseKeyValue("(" + typeof this.json + ")", this.json));
            }
            if (!this._previouslyOpenKeys) {
                return;
            }
            else {
                this.openSegments();
            }
        };
        NgxJsonViewerComponent.prototype.isExpandable = function (segment) {
            return segment.type === 'object' || segment.type === 'array';
        };
        NgxJsonViewerComponent.prototype.toggle = function (segment) {
            if (this.isExpandable(segment)) {
                segment.expanded = !segment.expanded;
            }
        };
        NgxJsonViewerComponent.prototype.parseKeyValue = function (key, value) {
            var segment = {
                key: key,
                value: value,
                type: undefined,
                description: '' + value,
                expanded: this.isExpanded(),
            };
            switch (typeof segment.value) {
                case 'number': {
                    segment.type = 'number';
                    break;
                }
                case 'boolean': {
                    segment.type = 'boolean';
                    break;
                }
                case 'function': {
                    segment.type = 'function';
                    break;
                }
                case 'string': {
                    segment.type = 'string';
                    segment.description = '"' + segment.value + '"';
                    break;
                }
                case 'undefined': {
                    segment.type = 'undefined';
                    segment.description = 'undefined';
                    break;
                }
                case 'object': {
                    // yea, null is object
                    if (segment.value === null) {
                        segment.type = 'null';
                        segment.description = 'null';
                    }
                    else if (Array.isArray(segment.value)) {
                        segment.type = 'array';
                        segment.description =
                            'Array[' + segment.value.length + '] ' + JSON.stringify(segment.value);
                    }
                    else if (segment.value instanceof Date) {
                        segment.type = 'date';
                    }
                    else {
                        segment.type = 'object';
                        segment.description = 'Object ' + JSON.stringify(segment.value);
                    }
                    break;
                }
            }
            return segment;
        };
        NgxJsonViewerComponent.prototype.isExpanded = function () {
            return this.expanded && !(this.depth > -1 && this._currentDepth >= this.depth);
        };
        // https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
        NgxJsonViewerComponent.prototype.decycle = function (object) {
            var objects = new WeakMap();
            return (function derez(value, path) {
                var oldPath;
                var nu;
                if (typeof value === 'object' &&
                    value !== null &&
                    !(value instanceof Boolean) &&
                    !(value instanceof Date) &&
                    !(value instanceof Number) &&
                    !(value instanceof RegExp) &&
                    !(value instanceof String)) {
                    oldPath = objects.get(value);
                    if (oldPath !== undefined) {
                        return { $ref: oldPath };
                    }
                    objects.set(value, path);
                    if (Array.isArray(value)) {
                        nu = [];
                        value.forEach(function (element, i) {
                            nu[i] = derez(element, path + '[' + i + ']');
                        });
                    }
                    else {
                        nu = {};
                        Object.keys(value).forEach(function (name) {
                            nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
                        });
                    }
                    return nu;
                }
                return value;
            })(object, '$');
        };
        var NgxJsonViewerComponent_1;
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "json", void 0);
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "expanded", void 0);
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "depth", void 0);
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "key", void 0);
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "length", void 0);
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "restoreExpanded", void 0);
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "showTypeHeadings", void 0);
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "_currentDepth", void 0);
        __decorate([
            core.Input()
        ], NgxJsonViewerComponent.prototype, "_previouslyOpenKeys", void 0);
        __decorate([
            core.ViewChildren(NgxJsonViewerComponent_1)
        ], NgxJsonViewerComponent.prototype, "childrenComponents", void 0);
        NgxJsonViewerComponent = NgxJsonViewerComponent_1 = __decorate([
            core.Component({
                selector: 'ngx-json-viewer',
                template: "<section class=\"ngx-json-viewer\">\r\n  <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\r\n    <section\r\n      (click)=\"toggle(segment)\"\r\n      [ngClass]=\"{\r\n        'segment-main': true,\r\n        expandable: isExpandable(segment),\r\n        expanded: segment.expanded\r\n      }\"\r\n    >\r\n      <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\r\n      <span class=\"segment-key\">{{ segment.key }}</span>\r\n      <span class=\"segment-separator\">: </span>\r\n      <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\r\n        segment.description\r\n      }}</span>\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\r\n        class=\"segment-value\"\r\n        >Array[{{ segment.value.length }}]</span\r\n      >\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\r\n        class=\"segment-value\"\r\n        >Object</span\r\n      >\r\n    </section>\r\n    <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\r\n      <ngx-json-viewer\r\n        [json]=\"segment.value\"\r\n        [expanded]=\"expanded\"\r\n        [depth]=\"depth\"\r\n        [_currentDepth]=\"_currentDepth\"\r\n        [key]=\"segment.key\"\r\n        [length]=\"segment.type === 'array' ? segment.value.length : -1\"\r\n        [_previouslyOpenKeys]=\"\r\n          _previouslyOpenKeys &&\r\n          _previouslyOpenKeys[\r\n            segment.type === 'array'\r\n              ? segment.key + '_' + segment.value.length\r\n              : segment.key + '_-1'\r\n          ]\r\n        \"\r\n      ></ngx-json-viewer>\r\n    </section>\r\n  </section>\r\n</section>\r\n",
                styles: ["@charset \"UTF-8\";.ngx-json-viewer{font-family:monospace;font-size:1em;width:100%;height:100%;overflow:hidden;position:relative}.ngx-json-viewer .segment{padding:0;margin:0 0 1px 12px}.ngx-json-viewer .segment .segment-main{word-wrap:break-word}.ngx-json-viewer .segment .segment-main .toggler{position:absolute;margin-left:-14px;margin-top:3px;font-size:.8em;line-height:1.2em;vertical-align:middle;color:#787878}.ngx-json-viewer .segment .segment-main .toggler::after{display:inline-block;content:\"\u25BA\";transition:transform .1s ease-in}.ngx-json-viewer .segment .segment-main .segment-key{color:#00008b;word-wrap:break-word;white-space:pre-line}.ngx-json-viewer .segment .segment-main .segment-separator{color:#00008b}.ngx-json-viewer .segment .segment-main .segment-value{color:#000}.ngx-json-viewer .segment .children{margin-left:4px}.ngx-json-viewer .segment-type-string>.segment-main>.segment-value{color:green}.ngx-json-viewer .segment-type-number>.segment-main>.segment-value{color:#00f}.ngx-json-viewer .segment-type-boolean>.segment-main>.segment-value{color:red}.ngx-json-viewer .segment-type-date>.segment-main>.segment-value{color:#05668d}.ngx-json-viewer .segment-type-array>.segment-main>.segment-value,.ngx-json-viewer .segment-type-function>.segment-main>.segment-value,.ngx-json-viewer .segment-type-object>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-null>.segment-main>.segment-value,.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-key{color:#999}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{background-color:#999}.ngx-json-viewer .segment-type-array>.segment-main,.ngx-json-viewer .segment-type-object>.segment-main{white-space:nowrap}.ngx-json-viewer .expanded>.toggler::after{transform:rotate(90deg)}.ngx-json-viewer .expandable>.segment-value{display:inline-block;vertical-align:bottom;text-overflow:ellipsis;overflow:hidden}.ngx-json-viewer .expandable,.ngx-json-viewer .expandable>.toggler{cursor:pointer}"]
            })
        ], NgxJsonViewerComponent);
        return NgxJsonViewerComponent;
    }());

    var NgxJsonViewerModule = /** @class */ (function () {
        function NgxJsonViewerModule() {
        }
        NgxJsonViewerModule = __decorate([
            core.NgModule({
                imports: [
                    common.CommonModule
                ],
                declarations: [
                    NgxJsonViewerComponent
                ],
                exports: [
                    NgxJsonViewerComponent
                ]
            })
        ], NgxJsonViewerModule);
        return NgxJsonViewerModule;
    }());

    exports.NgxJsonViewerComponent = NgxJsonViewerComponent;
    exports.NgxJsonViewerModule = NgxJsonViewerModule;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ngx-json-viewer.umd.js.map
