(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define('ngx-json-viewer', ['exports', '@angular/core', '@angular/common'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["ngx-json-viewer"] = {}, global.ng.core, global.ng.common));
})(this, (function (exports, core, common) { 'use strict';

    var NgxJsonViewerComponent = /** @class */ (function () {
        function NgxJsonViewerComponent() {
            this.expanded = true;
            this.depth = -1;
            this.restoreExpanded = false;
            this.showTypeHeadings = false;
            // Tracks the length of array types. -1 for other types
            this._length = -1;
            this._key = 'Object';
            this._currentDepth = -1;
            this.nextOpenKeys = {};
            this.segments = [];
            // Matches the last underscore in a string
            this.underscoreRegex = /_[^_]+$/;
        }
        NgxJsonViewerComponent.prototype.getOpenKeysRecursive = function () {
            var openKeys = {};
            this.childrenComponents.forEach(function (component) {
                // Save key and length
                openKeys[component._key] = component.getOpenKeysRecursive();
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
                var foundSegment = _this.segments.find(function (segment) { return segment.key === strippedKey; });
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
        return NgxJsonViewerComponent;
    }());
    NgxJsonViewerComponent.decorators = [
        { type: core.Component, args: [{
                    selector: 'ngx-json-viewer',
                    template: "<section class=\"ngx-json-viewer\">\r\n  <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\r\n    <section\r\n      (click)=\"toggle(segment)\"\r\n      [ngClass]=\"{\r\n        'segment-main': true,\r\n        expandable: isExpandable(segment),\r\n        expanded: segment.expanded\r\n      }\"\r\n    >\r\n      <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\r\n      <span class=\"segment-key\">{{ segment.key }}</span>\r\n      <span class=\"segment-separator\">: </span>\r\n      <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\r\n        segment.description\r\n      }}</span>\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\r\n        class=\"segment-value\"\r\n        >Array[{{ segment.value.length }}]</span\r\n      >\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\r\n        class=\"segment-value\"\r\n        >Object</span\r\n      >\r\n    </section>\r\n    <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\r\n      <ngx-json-viewer\r\n        [json]=\"segment.value\"\r\n        [expanded]=\"expanded\"\r\n        [depth]=\"depth\"\r\n        [_key]=\"segment.key\"\r\n        [_currentDepth]=\"_currentDepth\"\r\n        [_length]=\"segment.type === 'array' ? segment.value.length : -1\"\r\n        [_previouslyOpenKeys]=\"_previouslyOpenKeys && _previouslyOpenKeys[segment.key]\"\r\n      ></ngx-json-viewer>\r\n    </section>\r\n  </section>\r\n</section>\r\n",
                    styles: ["@charset \"UTF-8\";.ngx-json-viewer{font-family:monospace;font-size:1em;width:100%;height:100%;overflow:hidden;position:relative}.ngx-json-viewer .segment{padding:0;margin:0 0 1px 12px}.ngx-json-viewer .segment .segment-main{word-wrap:break-word}.ngx-json-viewer .segment .segment-main .toggler{position:absolute;margin-left:-14px;margin-top:3px;font-size:.8em;line-height:1.2em;vertical-align:middle;color:#787878}.ngx-json-viewer .segment .segment-main .toggler:after{display:inline-block;content:\"\u25BA\";transition:transform .1s ease-in}.ngx-json-viewer .segment .segment-main .segment-key{color:#00008b;word-wrap:break-word;white-space:pre-line}.ngx-json-viewer .segment .segment-main .segment-separator{color:#00008b}.ngx-json-viewer .segment .segment-main .segment-value{color:#000}.ngx-json-viewer .segment .children{margin-left:4px}.ngx-json-viewer .segment-type-string>.segment-main>.segment-value{color:green}.ngx-json-viewer .segment-type-number>.segment-main>.segment-value{color:#00f}.ngx-json-viewer .segment-type-boolean>.segment-main>.segment-value{color:red}.ngx-json-viewer .segment-type-date>.segment-main>.segment-value{color:#05668d}.ngx-json-viewer .segment-type-array>.segment-main>.segment-value,.ngx-json-viewer .segment-type-function>.segment-main>.segment-value,.ngx-json-viewer .segment-type-object>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-null>.segment-main>.segment-value,.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-key{color:#999}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{background-color:#999}.ngx-json-viewer .segment-type-array>.segment-main,.ngx-json-viewer .segment-type-object>.segment-main{white-space:nowrap}.ngx-json-viewer .expanded>.toggler:after{transform:rotate(90deg)}.ngx-json-viewer .expandable>.segment-value{display:inline-block;vertical-align:bottom;text-overflow:ellipsis;overflow:hidden}.ngx-json-viewer .expandable,.ngx-json-viewer .expandable>.toggler{cursor:pointer}"]
                },] }
    ];
    NgxJsonViewerComponent.propDecorators = {
        json: [{ type: core.Input }],
        expanded: [{ type: core.Input }],
        depth: [{ type: core.Input }],
        restoreExpanded: [{ type: core.Input }],
        showTypeHeadings: [{ type: core.Input }],
        _length: [{ type: core.Input }],
        _key: [{ type: core.Input }],
        _previouslyOpenKeys: [{ type: core.Input }],
        _currentDepth: [{ type: core.Input }],
        childrenComponents: [{ type: core.ViewChildren, args: [NgxJsonViewerComponent,] }]
    };

    var NgxJsonViewerModule = /** @class */ (function () {
        function NgxJsonViewerModule() {
        }
        return NgxJsonViewerModule;
    }());
    NgxJsonViewerModule.decorators = [
        { type: core.NgModule, args: [{
                    imports: [
                        common.CommonModule
                    ],
                    declarations: [
                        NgxJsonViewerComponent
                    ],
                    exports: [
                        NgxJsonViewerComponent
                    ]
                },] }
    ];

    /**
     * Generated bundle index. Do not edit.
     */

    exports.NgxJsonViewerComponent = NgxJsonViewerComponent;
    exports.NgxJsonViewerModule = NgxJsonViewerModule;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=ngx-json-viewer.umd.js.map
