import * as tslib_1 from "tslib";
import { Component, Input, ViewChildren } from '@angular/core';
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
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "json", void 0);
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "expanded", void 0);
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "depth", void 0);
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "key", void 0);
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "length", void 0);
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "restoreExpanded", void 0);
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "showTypeHeadings", void 0);
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "_currentDepth", void 0);
    tslib_1.__decorate([
        Input()
    ], NgxJsonViewerComponent.prototype, "_previouslyOpenKeys", void 0);
    tslib_1.__decorate([
        ViewChildren(NgxJsonViewerComponent_1)
    ], NgxJsonViewerComponent.prototype, "childrenComponents", void 0);
    NgxJsonViewerComponent = NgxJsonViewerComponent_1 = tslib_1.__decorate([
        Component({
            selector: 'ngx-json-viewer',
            template: "<section class=\"ngx-json-viewer\">\r\n  <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\r\n    <section\r\n      (click)=\"toggle(segment)\"\r\n      [ngClass]=\"{\r\n        'segment-main': true,\r\n        expandable: isExpandable(segment),\r\n        expanded: segment.expanded\r\n      }\"\r\n    >\r\n      <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\r\n      <span class=\"segment-key\">{{ segment.key }}</span>\r\n      <span class=\"segment-separator\">: </span>\r\n      <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\r\n        segment.description\r\n      }}</span>\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\r\n        class=\"segment-value\"\r\n        >Array[{{ segment.value.length }}]</span\r\n      >\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\r\n        class=\"segment-value\"\r\n        >Object</span\r\n      >\r\n    </section>\r\n    <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\r\n      <ngx-json-viewer\r\n        [json]=\"segment.value\"\r\n        [expanded]=\"expanded\"\r\n        [depth]=\"depth\"\r\n        [_currentDepth]=\"_currentDepth\"\r\n        [key]=\"segment.key\"\r\n        [length]=\"segment.type === 'array' ? segment.value.length : -1\"\r\n        [_previouslyOpenKeys]=\"\r\n          _previouslyOpenKeys &&\r\n          _previouslyOpenKeys[\r\n            segment.type === 'array'\r\n              ? segment.key + '_' + segment.value.length\r\n              : segment.key + '_-1'\r\n          ]\r\n        \"\r\n      ></ngx-json-viewer>\r\n    </section>\r\n  </section>\r\n</section>\r\n",
            styles: ["@charset \"UTF-8\";.ngx-json-viewer{font-family:monospace;font-size:1em;width:100%;height:100%;overflow:hidden;position:relative}.ngx-json-viewer .segment{padding:0;margin:0 0 1px 12px}.ngx-json-viewer .segment .segment-main{word-wrap:break-word}.ngx-json-viewer .segment .segment-main .toggler{position:absolute;margin-left:-14px;margin-top:3px;font-size:.8em;line-height:1.2em;vertical-align:middle;color:#787878}.ngx-json-viewer .segment .segment-main .toggler::after{display:inline-block;content:\"\u25BA\";transition:transform .1s ease-in}.ngx-json-viewer .segment .segment-main .segment-key{color:#00008b;word-wrap:break-word;white-space:pre-line}.ngx-json-viewer .segment .segment-main .segment-separator{color:#00008b}.ngx-json-viewer .segment .segment-main .segment-value{color:#000}.ngx-json-viewer .segment .children{margin-left:4px}.ngx-json-viewer .segment-type-string>.segment-main>.segment-value{color:green}.ngx-json-viewer .segment-type-number>.segment-main>.segment-value{color:#00f}.ngx-json-viewer .segment-type-boolean>.segment-main>.segment-value{color:red}.ngx-json-viewer .segment-type-date>.segment-main>.segment-value{color:#05668d}.ngx-json-viewer .segment-type-array>.segment-main>.segment-value,.ngx-json-viewer .segment-type-function>.segment-main>.segment-value,.ngx-json-viewer .segment-type-object>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-null>.segment-main>.segment-value,.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-key{color:#999}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{background-color:#999}.ngx-json-viewer .segment-type-array>.segment-main,.ngx-json-viewer .segment-type-object>.segment-main{white-space:nowrap}.ngx-json-viewer .expanded>.toggler::after{transform:rotate(90deg)}.ngx-json-viewer .expandable>.segment-value{display:inline-block;vertical-align:bottom;text-overflow:ellipsis;overflow:hidden}.ngx-json-viewer .expandable,.ngx-json-viewer .expandable>.toggler{cursor:pointer}"]
        })
    ], NgxJsonViewerComponent);
    return NgxJsonViewerComponent;
}());
export { NgxJsonViewerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1qc29uLXZpZXdlci8iLCJzb3VyY2VzIjpbInNyYy9uZ3gtanNvbi12aWV3ZXIvbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFDLFNBQVMsRUFBYSxLQUFLLEVBQUUsWUFBWSxFQUFZLE1BQU0sZUFBZSxDQUFDO0FBZW5GO0lBTEE7UUFPa0IsYUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixVQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWCxRQUFHLEdBQUcsUUFBUSxDQUFDO1FBQy9CLHVEQUF1RDtRQUN2QyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWixvQkFBZSxHQUFHLEtBQUssQ0FBQztRQUV4QixxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFFekIsa0JBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUc1QixpQkFBWSxHQUF5QixFQUFFLENBQUM7UUFDeEMsYUFBUSxHQUFlLEVBQUUsQ0FBQztRQUVqQywwQ0FBMEM7UUFDbEMsb0JBQWUsR0FBRyxTQUFTLENBQUM7SUFpTHRDLENBQUM7K0JBbk1ZLHNCQUFzQjtJQXdCekIscURBQW9CLEdBQTVCO1FBQ0UsSUFBTSxRQUFRLEdBQXlCLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFVBQUMsU0FBaUM7WUFDaEUsNEVBQTRFO1lBQzVFLCtCQUErQjtZQUMvQixRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3RGLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7WUFDdEMsT0FBTztTQUNSO1FBQ0QsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQztJQUVPLDZDQUFZLEdBQXBCO1FBQUEsaUJBbUJDO1FBbEJDLElBQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFvQixDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7WUFDZCxtREFBbUQ7WUFDbkQsSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzFELElBQU0sWUFBWSxHQUFHLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQUEsT0FBTztnQkFDN0MsT0FBTyxPQUFPLENBQUMsR0FBRyxLQUFLLFdBQVcsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2pCLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNwQyxPQUFPO2FBQ1I7WUFFRCxZQUFZLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSw0Q0FBVyxHQUFsQjtRQUFBLGlCQTRCQztRQTNCQyxzREFBc0Q7UUFDdEQsNkJBQTZCO1FBQzdCLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDbkQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1lBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7U0FDdkM7UUFFRCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUVuQixnQkFBZ0I7UUFDaEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVwQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO1lBQ2pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEdBQUc7Z0JBQ2hDLEtBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEtBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlELENBQUMsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLE1BQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUM1RTtRQUVELElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUU7WUFDN0IsT0FBTztTQUNSO2FBQU07WUFDTCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDckI7SUFDSCxDQUFDO0lBRU0sNkNBQVksR0FBbkIsVUFBb0IsT0FBaUI7UUFDbkMsT0FBTyxPQUFPLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLE9BQU8sQ0FBQztJQUMvRCxDQUFDO0lBRU0sdUNBQU0sR0FBYixVQUFjLE9BQWlCO1FBQzdCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUM5QixPQUFPLENBQUMsUUFBUSxHQUFHLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztTQUN0QztJQUNILENBQUM7SUFFTyw4Q0FBYSxHQUFyQixVQUFzQixHQUFRLEVBQUUsS0FBVTtRQUN4QyxJQUFNLE9BQU8sR0FBYTtZQUN4QixHQUFHLEVBQUUsR0FBRztZQUNSLEtBQUssRUFBRSxLQUFLO1lBQ1osSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsRUFBRSxHQUFHLEtBQUs7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7U0FDNUIsQ0FBQztRQUVGLFFBQVEsT0FBTyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQzVCLEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7Z0JBQ3hCLE1BQU07YUFDUDtZQUNELEtBQUssU0FBUyxDQUFDLENBQUM7Z0JBQ2QsT0FBTyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ3pCLE1BQU07YUFDUDtZQUNELEtBQUssVUFBVSxDQUFDLENBQUM7Z0JBQ2YsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7Z0JBQzFCLE1BQU07YUFDUDtZQUNELEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxXQUFXLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNoRCxNQUFNO2FBQ1A7WUFDRCxLQUFLLFdBQVcsQ0FBQyxDQUFDO2dCQUNoQixPQUFPLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQztnQkFDM0IsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7Z0JBQ2xDLE1BQU07YUFDUDtZQUNELEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ2Isc0JBQXNCO2dCQUN0QixJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO29CQUMxQixPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztvQkFDdEIsT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7aUJBQzlCO3FCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3ZDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO29CQUN2QixPQUFPLENBQUMsV0FBVzt3QkFDakIsUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDMUU7cUJBQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxZQUFZLElBQUksRUFBRTtvQkFDeEMsT0FBTyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNMLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO29CQUN4QixPQUFPLENBQUMsV0FBVyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDakU7Z0JBQ0QsTUFBTTthQUNQO1NBQ0Y7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRU8sMkNBQVUsR0FBbEI7UUFDRSxPQUFPLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELG1FQUFtRTtJQUMzRCx3Q0FBTyxHQUFmLFVBQWdCLE1BQVc7UUFDekIsSUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM5QixPQUFPLENBQUMsU0FBUyxLQUFLLENBQUMsS0FBVSxFQUFFLElBQVM7WUFDMUMsSUFBSSxPQUFPLENBQUM7WUFDWixJQUFJLEVBQU8sQ0FBQztZQUVaLElBQ0UsT0FBTyxLQUFLLEtBQUssUUFBUTtnQkFDekIsS0FBSyxLQUFLLElBQUk7Z0JBQ2QsQ0FBQyxDQUFDLEtBQUssWUFBWSxPQUFPLENBQUM7Z0JBQzNCLENBQUMsQ0FBQyxLQUFLLFlBQVksSUFBSSxDQUFDO2dCQUN4QixDQUFDLENBQUMsS0FBSyxZQUFZLE1BQU0sQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLEtBQUssWUFBWSxNQUFNLENBQUM7Z0JBQzFCLENBQUMsQ0FBQyxLQUFLLFlBQVksTUFBTSxDQUFDLEVBQzFCO2dCQUNBLE9BQU8sR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3QixJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7b0JBQ3pCLE9BQU8sRUFBQyxJQUFJLEVBQUUsT0FBTyxFQUFDLENBQUM7aUJBQ3hCO2dCQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUV6QixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3hCLEVBQUUsR0FBRyxFQUFFLENBQUM7b0JBQ1IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxDQUFDO3dCQUN2QixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDL0MsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7cUJBQU07b0JBQ0wsRUFBRSxHQUFHLEVBQUUsQ0FBQztvQkFDUixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7d0JBQzdCLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDekUsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7Z0JBQ0QsT0FBTyxFQUFFLENBQUM7YUFDWDtZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLENBQUM7O0lBak1RO1FBQVIsS0FBSyxFQUFFO3dEQUFrQjtJQUNqQjtRQUFSLEtBQUssRUFBRTs0REFBd0I7SUFDdkI7UUFBUixLQUFLLEVBQUU7eURBQW1CO0lBQ2xCO1FBQVIsS0FBSyxFQUFFO3VEQUF1QjtJQUV0QjtRQUFSLEtBQUssRUFBRTswREFBb0I7SUFDbkI7UUFBUixLQUFLLEVBQUU7bUVBQWdDO0lBRS9CO1FBQVIsS0FBSyxFQUFFO29FQUFpQztJQUVoQztRQUFSLEtBQUssRUFBRTtpRUFBMkI7SUFDMUI7UUFBUixLQUFLLEVBQUU7dUVBQW1EO0lBUXJCO1FBQXJDLFlBQVksQ0FBQyx3QkFBc0IsQ0FBQztzRUFFbkM7SUF0QlMsc0JBQXNCO1FBTGxDLFNBQVMsQ0FBQztZQUNULFFBQVEsRUFBRSxpQkFBaUI7WUFDM0Isc3hEQUErQzs7U0FFaEQsQ0FBQztPQUNXLHNCQUFzQixDQW1NbEM7SUFBRCw2QkFBQztDQUFBLEFBbk1ELElBbU1DO1NBbk1ZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBPbkNoYW5nZXMsIElucHV0LCBWaWV3Q2hpbGRyZW4sIFF1ZXJ5TGlzdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElTZWdtZW50IHtcclxuICBrZXk6IHN0cmluZztcclxuICB2YWx1ZTogYW55O1xyXG4gIHR5cGU6IHVuZGVmaW5lZCB8IHN0cmluZztcclxuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xyXG4gIGV4cGFuZGVkOiBib29sZWFuO1xyXG59XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1qc29uLXZpZXdlcicsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL25neC1qc29uLXZpZXdlci5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5zY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIE5neEpzb25WaWV3ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBqc29uOiBhbnk7XHJcbiAgQElucHV0KCkgcHVibGljIGV4cGFuZGVkID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZGVwdGggPSAtMTtcclxuICBASW5wdXQoKSBwdWJsaWMga2V5ID0gJ09iamVjdCc7XHJcbiAgLy8gVHJhY2tzIHRoZSBsZW5ndGggb2YgYXJyYXkgdHlwZXMuIC0xIGZvciBvdGhlciB0eXBlc1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBsZW5ndGggPSAtMTtcclxuICBASW5wdXQoKSBwdWJsaWMgcmVzdG9yZUV4cGFuZGVkID0gZmFsc2U7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93VHlwZUhlYWRpbmdzID0gZmFsc2U7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBfY3VycmVudERlcHRoID0gLTE7XHJcbiAgQElucHV0KCkgcHVibGljIF9wcmV2aW91c2x5T3BlbktleXM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcclxuXHJcbiAgcHVibGljIG5leHRPcGVuS2V5czoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcclxuICBwdWJsaWMgc2VnbWVudHM6IElTZWdtZW50W10gPSBbXTtcclxuXHJcbiAgLy8gTWF0Y2hlcyB0aGUgbGFzdCB1bmRlcnNjb3JlIGluIGEgc3RyaW5nXHJcbiAgcHJpdmF0ZSB1bmRlcnNjb3JlUmVnZXggPSAvX1teX10rJC87XHJcblxyXG4gIEBWaWV3Q2hpbGRyZW4oTmd4SnNvblZpZXdlckNvbXBvbmVudCkgcHVibGljIGNoaWxkcmVuQ29tcG9uZW50czogUXVlcnlMaXN0PFxyXG4gIE5neEpzb25WaWV3ZXJDb21wb25lbnRcclxuICA+O1xyXG5cclxuICBwcml2YXRlIGdldE9wZW5LZXlzUmVjdXJzaXZlKCk6IGFueSB7XHJcbiAgICBjb25zdCBvcGVuS2V5czoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcclxuICAgIHRoaXMuY2hpbGRyZW5Db21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudDogTmd4SnNvblZpZXdlckNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAvLyBTYXZlIGtleSBhbmQgbGVuZ3RoIC0gb24gcmVsb2FkIGFycmF5IGVsZW1lbnRzIHNob3VsZCBvbmx5IGJlIHJlb3BlbmVkIGlmXHJcbiAgICAgIC8vIHRoZSBhcnJheSBpcyB0aGUgc2FtZSBsZW5ndGhcclxuICAgICAgb3BlbktleXNbY29tcG9uZW50LmtleSArICdfJyArIGNvbXBvbmVudC5sZW5ndGhdID0gY29tcG9uZW50LmdldE9wZW5LZXlzUmVjdXJzaXZlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoT2JqZWN0LmtleXMob3BlbktleXMpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3BlbktleXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9wZW5TZWdtZW50cygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9wcmV2aW91c2x5T3BlbktleXMhKTtcclxuICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGtleSBleGlzdHMsIGlmIHNvIGV4cGFuZHMgaXRcclxuICAgICAgY29uc3Qgc3RyaXBwZWRLZXkgPSBrZXkucmVwbGFjZSh0aGlzLnVuZGVyc2NvcmVSZWdleCwgJycpO1xyXG4gICAgICBjb25zdCBmb3VuZFNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzLmZpbmQoc2VnbWVudCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHNlZ21lbnQua2V5ID09PSBzdHJpcHBlZEtleTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoIWZvdW5kU2VnbWVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0aGlzLmlzRXhwYW5kYWJsZShmb3VuZFNlZ21lbnQpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3VuZFNlZ21lbnQuZXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbmdPbkNoYW5nZXMoKTogdm9pZCB7XHJcbiAgICAvLyBTYXZlIG9wZW4ga2V5cyBzdHJ1Y3R1cmUgYmVmb3JlIHByb2Nlc3NpbmcgbmV3IGpzb25cclxuICAgIC8vIFdpbGwgb25seSBydW4gaW4gdG9wIGxldmVsXHJcbiAgICBpZiAodGhpcy5yZXN0b3JlRXhwYW5kZWQgJiYgdGhpcy5jaGlsZHJlbkNvbXBvbmVudHMpIHtcclxuICAgICAgdGhpcy5fcHJldmlvdXNseU9wZW5LZXlzID0gdGhpcy5nZXRPcGVuS2V5c1JlY3Vyc2l2ZSgpO1xyXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLl9wcmV2aW91c2x5T3BlbktleXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VnbWVudHMgPSBbXTtcclxuXHJcbiAgICAvLyByZW1vdmUgY3ljbGVzXHJcbiAgICB0aGlzLmpzb24gPSB0aGlzLmRlY3ljbGUodGhpcy5qc29uKTtcclxuXHJcbiAgICB0aGlzLl9jdXJyZW50RGVwdGgrKztcclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuanNvbiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgT2JqZWN0LmtleXModGhpcy5qc29uKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShrZXksIHRoaXMuanNvbltrZXldKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShgKCR7dHlwZW9mIHRoaXMuanNvbn0pYCwgdGhpcy5qc29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9wcmV2aW91c2x5T3BlbktleXMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5vcGVuU2VnbWVudHMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0V4cGFuZGFibGUoc2VnbWVudDogSVNlZ21lbnQpOiBhbnkge1xyXG4gICAgcmV0dXJuIHNlZ21lbnQudHlwZSA9PT0gJ29iamVjdCcgfHwgc2VnbWVudC50eXBlID09PSAnYXJyYXknO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvZ2dsZShzZWdtZW50OiBJU2VnbWVudCk6IGFueSB7XHJcbiAgICBpZiAodGhpcy5pc0V4cGFuZGFibGUoc2VnbWVudCkpIHtcclxuICAgICAgc2VnbWVudC5leHBhbmRlZCA9ICFzZWdtZW50LmV4cGFuZGVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXJzZUtleVZhbHVlKGtleTogYW55LCB2YWx1ZTogYW55KTogSVNlZ21lbnQge1xyXG4gICAgY29uc3Qgc2VnbWVudDogSVNlZ21lbnQgPSB7XHJcbiAgICAgIGtleToga2V5LFxyXG4gICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcclxuICAgICAgZGVzY3JpcHRpb246ICcnICsgdmFsdWUsXHJcbiAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoKSxcclxuICAgIH07XHJcblxyXG4gICAgc3dpdGNoICh0eXBlb2Ygc2VnbWVudC52YWx1ZSkge1xyXG4gICAgICBjYXNlICdudW1iZXInOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ251bWJlcic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnYm9vbGVhbic6IHtcclxuICAgICAgICBzZWdtZW50LnR5cGUgPSAnYm9vbGVhbic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnZnVuY3Rpb24nOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdzdHJpbmcnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3N0cmluZyc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICdcIicgKyBzZWdtZW50LnZhbHVlICsgJ1wiJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICd1bmRlZmluZWQnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3VuZGVmaW5lZCc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICd1bmRlZmluZWQnO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ29iamVjdCc6IHtcclxuICAgICAgICAvLyB5ZWEsIG51bGwgaXMgb2JqZWN0XHJcbiAgICAgICAgaWYgKHNlZ21lbnQudmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgIHNlZ21lbnQudHlwZSA9ICdudWxsJztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnbnVsbCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlZ21lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnYXJyYXknO1xyXG4gICAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9XHJcbiAgICAgICAgICAgICdBcnJheVsnICsgc2VnbWVudC52YWx1ZS5sZW5ndGggKyAnXSAnICsgSlNPTi5zdHJpbmdpZnkoc2VnbWVudC52YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWdtZW50LnZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgc2VnbWVudC50eXBlID0gJ2RhdGUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnb2JqZWN0JztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnT2JqZWN0ICcgKyBKU09OLnN0cmluZ2lmeShzZWdtZW50LnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VnbWVudDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNFeHBhbmRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmV4cGFuZGVkICYmICEodGhpcy5kZXB0aCA+IC0xICYmIHRoaXMuX2N1cnJlbnREZXB0aCA+PSB0aGlzLmRlcHRoKTtcclxuICB9XHJcblxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb3VnbGFzY3JvY2tmb3JkL0pTT04tanMvYmxvYi9tYXN0ZXIvY3ljbGUuanNcclxuICBwcml2YXRlIGRlY3ljbGUob2JqZWN0OiBhbnkpOiBhbnkge1xyXG4gICAgY29uc3Qgb2JqZWN0cyA9IG5ldyBXZWFrTWFwKCk7XHJcbiAgICByZXR1cm4gKGZ1bmN0aW9uIGRlcmV6KHZhbHVlOiBhbnksIHBhdGg6IGFueSk6IGFueSB7XHJcbiAgICAgIGxldCBvbGRQYXRoO1xyXG4gICAgICBsZXQgbnU6IGFueTtcclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXHJcbiAgICAgICAgdmFsdWUgIT09IG51bGwgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbikgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyKSAmJlxyXG4gICAgICAgICEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApICYmXHJcbiAgICAgICAgISh2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZylcclxuICAgICAgKSB7XHJcbiAgICAgICAgb2xkUGF0aCA9IG9iamVjdHMuZ2V0KHZhbHVlKTtcclxuICAgICAgICBpZiAob2xkUGF0aCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXR1cm4geyRyZWY6IG9sZFBhdGh9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBvYmplY3RzLnNldCh2YWx1ZSwgcGF0aCk7XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgbnUgPSBbXTtcclxuICAgICAgICAgIHZhbHVlLmZvckVhY2goKGVsZW1lbnQsIGkpID0+IHtcclxuICAgICAgICAgICAgbnVbaV0gPSBkZXJleihlbGVtZW50LCBwYXRoICsgJ1snICsgaSArICddJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbnUgPSB7fTtcclxuICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKG5hbWUgPT4ge1xyXG4gICAgICAgICAgICBudVtuYW1lXSA9IGRlcmV6KHZhbHVlW25hbWVdLCBwYXRoICsgJ1snICsgSlNPTi5zdHJpbmdpZnkobmFtZSkgKyAnXScpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9KShvYmplY3QsICckJyk7XHJcbiAgfVxyXG59XHJcbiJdfQ==