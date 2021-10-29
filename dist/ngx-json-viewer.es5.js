import { Component, Input, NgModule, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
var NgxJsonViewerComponent = /** @class */ (function () {
    function NgxJsonViewerComponent() {
        this.expanded = true;
        this.depth = -1;
        this.key = 'Object';
        this.length = -1;
        this.restoreExpanded = false;
        this.showTypeHeadings = false;
        this._currentDepth = -1;
        this.nextOpenKeys = {};
        this.segments = [];
        this.underscoreRegex = /_[^_]+$/;
    }
    /**
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.getOpenKeysRecursive = function () {
        var /** @type {?} */ openKeys = {};
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
    /**
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.openSegments = function () {
        var _this = this;
        var /** @type {?} */ keys = Object.keys(/** @type {?} */ ((this._previouslyOpenKeys)));
        keys.forEach(function (key) {
            // Check to see if the key exists, if so expands it
            var /** @type {?} */ strippedKey = key.replace(_this.underscoreRegex, '');
            var /** @type {?} */ foundSegment = _this.segments.find(function (segment) {
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
    /**
     * @return {?}
     */
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
    /**
     * @param {?} segment
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.isExpandable = function (segment) {
        return segment.type === 'object' || segment.type === 'array';
    };
    /**
     * @param {?} segment
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.toggle = function (segment) {
        if (this.isExpandable(segment)) {
            segment.expanded = !segment.expanded;
        }
    };
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.parseKeyValue = function (key, value) {
        var /** @type {?} */ segment = {
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
    /**
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.isExpanded = function () {
        return this.expanded && !(this.depth > -1 && this._currentDepth >= this.depth);
    };
    /**
     * @param {?} object
     * @return {?}
     */
    NgxJsonViewerComponent.prototype.decycle = function (object) {
        var /** @type {?} */ objects = new WeakMap();
        return (function derez(value, path) {
            var /** @type {?} */ oldPath;
            var /** @type {?} */ nu;
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
    { type: Component, args: [{
                selector: 'ngx-json-viewer',
                template: "\n    <section class=\"ngx-json-viewer\">\n      <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\n        <section\n          (click)=\"toggle(segment)\"\n          [ngClass]=\"{\n            'segment-main': true,\n            expandable: isExpandable(segment),\n            expanded: segment.expanded\n          }\"\n        >\n          <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\n          <span class=\"segment-key\">{{ segment.key }}</span>\n          <span class=\"segment-separator\">: </span>\n          <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\n            segment.description\n          }}</span>\n          <span\n            *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\n            class=\"segment-value\"\n            >Array[{{ segment.value.length }}]</span\n          >\n          <span\n            *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\n            class=\"segment-value\"\n            >Object</span\n          >\n        </section>\n        <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\n          <ngx-json-viewer\n            [json]=\"segment.value\"\n            [expanded]=\"expanded\"\n            [depth]=\"depth\"\n            [_currentDepth]=\"_currentDepth\"\n            [key]=\"segment.key\"\n            [length]=\"segment.type === 'array' ? segment.value.length : -1\"\n            [_previouslyOpenKeys]=\"\n              _previouslyOpenKeys &&\n              _previouslyOpenKeys[\n                segment.type === 'array'\n                  ? segment.key + '_' + segment.value.length\n                  : segment.key + '_-1'\n              ]\n            \"\n          ></ngx-json-viewer>\n        </section>\n      </section>\n    </section>\n  ",
                styles: ["\n    @charset \"UTF-8\";\n    .ngx-json-viewer {\n      font-family: monospace;\n      font-size: 1em;\n      width: 100%;\n      height: 100%;\n      overflow: hidden;\n      position: relative; }\n      .ngx-json-viewer .segment {\n        padding: 0px;\n        margin: 0px 0px 1px 12px; }\n        .ngx-json-viewer .segment .segment-main {\n          word-wrap: break-word; }\n          .ngx-json-viewer .segment .segment-main .toggler {\n            position: absolute;\n            margin-left: -14px;\n            margin-top: 3px;\n            font-size: .8em;\n            line-height: 1.2em;\n            vertical-align: middle;\n            color: #787878; }\n            .ngx-json-viewer .segment .segment-main .toggler::after {\n              display: inline-block;\n              content: \"\u25BA\";\n              -webkit-transition: -webkit-transform 0.1s ease-in;\n              transition: -webkit-transform 0.1s ease-in;\n              transition: transform 0.1s ease-in;\n              transition: transform 0.1s ease-in, -webkit-transform 0.1s ease-in; }\n          .ngx-json-viewer .segment .segment-main .segment-key {\n            color: #00008b;\n            word-wrap: break-word;\n            white-space: pre-line; }\n          .ngx-json-viewer .segment .segment-main .segment-separator {\n            color: #00008b; }\n          .ngx-json-viewer .segment .segment-main .segment-value {\n            color: #000; }\n        .ngx-json-viewer .segment .children {\n          margin-left: 4px; }\n      .ngx-json-viewer .segment-type-string > .segment-main > .segment-value {\n        color: green; }\n      .ngx-json-viewer .segment-type-number > .segment-main > .segment-value {\n        color: #0000ff; }\n      .ngx-json-viewer .segment-type-boolean > .segment-main > .segment-value {\n        color: red; }\n      .ngx-json-viewer .segment-type-date > .segment-main > .segment-value {\n        color: #05668D; }\n      .ngx-json-viewer .segment-type-array > .segment-main > .segment-value {\n        color: #999; }\n      .ngx-json-viewer .segment-type-object > .segment-main > .segment-value {\n        color: #999; }\n      .ngx-json-viewer .segment-type-function > .segment-main > .segment-value {\n        color: #999; }\n      .ngx-json-viewer .segment-type-null > .segment-main > .segment-value {\n        color: #855a00; }\n      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-value {\n        color: #855a00; }\n      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-key {\n        color: #999; }\n      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-value {\n        background-color: #999; }\n      .ngx-json-viewer .segment-type-object > .segment-main,\n      .ngx-json-viewer .segment-type-array > .segment-main {\n        white-space: nowrap; }\n      .ngx-json-viewer .expanded > .toggler::after {\n        -webkit-transform: rotate(90deg);\n                transform: rotate(90deg); }\n      .ngx-json-viewer .expandable > .segment-value {\n        display: inline-block;\n        vertical-align: bottom;\n        text-overflow: ellipsis;\n        overflow: hidden; }\n      .ngx-json-viewer .expandable,\n      .ngx-json-viewer .expandable > .toggler {\n        cursor: pointer; }\n  "]
            },] },
];
/**
 * @nocollapse
 */
NgxJsonViewerComponent.ctorParameters = function () { return []; };
NgxJsonViewerComponent.propDecorators = {
    'json': [{ type: Input },],
    'expanded': [{ type: Input },],
    'depth': [{ type: Input },],
    'key': [{ type: Input },],
    'length': [{ type: Input },],
    'restoreExpanded': [{ type: Input },],
    'showTypeHeadings': [{ type: Input },],
    '_currentDepth': [{ type: Input },],
    '_previouslyOpenKeys': [{ type: Input },],
    'childrenComponents': [{ type: ViewChildren, args: [NgxJsonViewerComponent,] },],
};
var NgxJsonViewerModule = /** @class */ (function () {
    function NgxJsonViewerModule() {
    }
    return NgxJsonViewerModule;
}());
NgxJsonViewerModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule
                ],
                declarations: [
                    NgxJsonViewerComponent
                ],
                exports: [
                    NgxJsonViewerComponent
                ]
            },] },
];
/**
 * @nocollapse
 */
NgxJsonViewerModule.ctorParameters = function () { return []; };
/**
 * Generated bundle index. Do not edit.
 */
export { NgxJsonViewerModule, NgxJsonViewerComponent };
//# sourceMappingURL=ngx-json-viewer.es5.js.map
