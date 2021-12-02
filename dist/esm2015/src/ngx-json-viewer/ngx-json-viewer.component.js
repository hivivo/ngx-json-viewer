var NgxJsonViewerComponent_1;
import * as tslib_1 from "tslib";
import { Component, Input, ViewChildren } from '@angular/core';
let NgxJsonViewerComponent = NgxJsonViewerComponent_1 = class NgxJsonViewerComponent {
    constructor() {
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
    getOpenKeysRecursive() {
        const openKeys = {};
        this.childrenComponents.forEach((component) => {
            // Save key and length - on reload array elements should only be reopened if
            // the array is the same length
            openKeys[component.key + '_' + component.length] = component.getOpenKeysRecursive();
        });
        if (Object.keys(openKeys).length === 0) {
            return;
        }
        return openKeys;
    }
    openSegments() {
        const keys = Object.keys(this._previouslyOpenKeys);
        keys.forEach(key => {
            // Check to see if the key exists, if so expands it
            const strippedKey = key.replace(this.underscoreRegex, '');
            const foundSegment = this.segments.find(segment => {
                return segment.key === strippedKey;
            });
            if (!foundSegment) {
                return;
            }
            if (!this.isExpandable(foundSegment)) {
                return;
            }
            foundSegment.expanded = true;
        });
    }
    ngOnChanges() {
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
            Object.keys(this.json).forEach(key => {
                this.segments.push(this.parseKeyValue(key, this.json[key]));
            });
        }
        else {
            this.segments.push(this.parseKeyValue(`(${typeof this.json})`, this.json));
        }
        if (!this._previouslyOpenKeys) {
            return;
        }
        else {
            this.openSegments();
        }
    }
    isExpandable(segment) {
        return segment.type === 'object' || segment.type === 'array';
    }
    toggle(segment) {
        if (this.isExpandable(segment)) {
            segment.expanded = !segment.expanded;
        }
    }
    parseKeyValue(key, value) {
        const segment = {
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
    }
    isExpanded() {
        return this.expanded && !(this.depth > -1 && this._currentDepth >= this.depth);
    }
    // https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
    decycle(object) {
        const objects = new WeakMap();
        return (function derez(value, path) {
            let oldPath;
            let nu;
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
                    value.forEach((element, i) => {
                        nu[i] = derez(element, path + '[' + i + ']');
                    });
                }
                else {
                    nu = {};
                    Object.keys(value).forEach(name => {
                        nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
                    });
                }
                return nu;
            }
            return value;
        })(object, '$');
    }
};
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
export { NgxJsonViewerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1qc29uLXZpZXdlci8iLCJzb3VyY2VzIjpbInNyYy9uZ3gtanNvbi12aWV3ZXIvbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQWEsS0FBSyxFQUFFLFlBQVksRUFBWSxNQUFNLGVBQWUsQ0FBQztBQWVuRixJQUFhLHNCQUFzQiw4QkFBbkMsTUFBYSxzQkFBc0I7SUFMbkM7UUFPa0IsYUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixVQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWCxRQUFHLEdBQUcsUUFBUSxDQUFDO1FBQy9CLHVEQUF1RDtRQUN2QyxXQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWixvQkFBZSxHQUFHLEtBQUssQ0FBQztRQUV4QixxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFFekIsa0JBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUc1QixpQkFBWSxHQUF5QixFQUFFLENBQUM7UUFDeEMsYUFBUSxHQUFlLEVBQUUsQ0FBQztRQUVqQywwQ0FBMEM7UUFDbEMsb0JBQWUsR0FBRyxTQUFTLENBQUM7SUFpTHRDLENBQUM7SUEzS1Msb0JBQW9CO1FBQzFCLE1BQU0sUUFBUSxHQUF5QixFQUFFLENBQUM7UUFDMUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQWlDLEVBQUUsRUFBRTtZQUNwRSw0RUFBNEU7WUFDNUUsK0JBQStCO1lBQy9CLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDdEYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QyxPQUFPO1NBQ1I7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRU8sWUFBWTtRQUNsQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBb0IsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDakIsbURBQW1EO1lBQ25ELE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUMxRCxNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRTtnQkFDaEQsT0FBTyxPQUFPLENBQUMsR0FBRyxLQUFLLFdBQVcsQ0FBQztZQUNyQyxDQUFDLENBQUMsQ0FBQztZQUVILElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ2pCLE9BQU87YUFDUjtZQUVELElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxFQUFFO2dCQUNwQyxPQUFPO2FBQ1I7WUFFRCxZQUFZLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUMvQixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxXQUFXO1FBQ2hCLHNEQUFzRDtRQUN0RCw2QkFBNkI7UUFDN0IsSUFBSSxJQUFJLENBQUMsZUFBZSxJQUFJLElBQUksQ0FBQyxrQkFBa0IsRUFBRTtZQUNuRCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUM7WUFDdkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQztTQUN2QztRQUVELElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1FBRW5CLGdCQUFnQjtRQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXBDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixJQUFJLE9BQU8sSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7WUFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5RCxDQUFDLENBQUMsQ0FBQztTQUNKO2FBQU07WUFDTCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDNUU7UUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFO1lBQzdCLE9BQU87U0FDUjthQUFNO1lBQ0wsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3JCO0lBQ0gsQ0FBQztJQUVNLFlBQVksQ0FBQyxPQUFpQjtRQUNuQyxPQUFPLE9BQU8sQ0FBQyxJQUFJLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDO0lBQy9ELENBQUM7SUFFTSxNQUFNLENBQUMsT0FBaUI7UUFDN0IsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQzlCLE9BQU8sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDO1NBQ3RDO0lBQ0gsQ0FBQztJQUVPLGFBQWEsQ0FBQyxHQUFRLEVBQUUsS0FBVTtRQUN4QyxNQUFNLE9BQU8sR0FBYTtZQUN4QixHQUFHLEVBQUUsR0FBRztZQUNSLEtBQUssRUFBRSxLQUFLO1lBQ1osSUFBSSxFQUFFLFNBQVM7WUFDZixXQUFXLEVBQUUsRUFBRSxHQUFHLEtBQUs7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUU7U0FDNUIsQ0FBQztRQUVGLFFBQVEsT0FBTyxPQUFPLENBQUMsS0FBSyxFQUFFO1lBQzVCLEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7Z0JBQ3hCLE1BQU07YUFDUDtZQUNELEtBQUssU0FBUyxDQUFDLENBQUM7Z0JBQ2QsT0FBTyxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7Z0JBQ3pCLE1BQU07YUFDUDtZQUNELEtBQUssVUFBVSxDQUFDLENBQUM7Z0JBQ2YsT0FBTyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7Z0JBQzFCLE1BQU07YUFDUDtZQUNELEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ2IsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUM7Z0JBQ3hCLE9BQU8sQ0FBQyxXQUFXLEdBQUcsR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO2dCQUNoRCxNQUFNO2FBQ1A7WUFDRCxLQUFLLFdBQVcsQ0FBQyxDQUFDO2dCQUNoQixPQUFPLENBQUMsSUFBSSxHQUFHLFdBQVcsQ0FBQztnQkFDM0IsT0FBTyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7Z0JBQ2xDLE1BQU07YUFDUDtZQUNELEtBQUssUUFBUSxDQUFDLENBQUM7Z0JBQ2Isc0JBQXNCO2dCQUN0QixJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO29CQUMxQixPQUFPLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztvQkFDdEIsT0FBTyxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUM7aUJBQzlCO3FCQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7b0JBQ3ZDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDO29CQUN2QixPQUFPLENBQUMsV0FBVzt3QkFDakIsUUFBUSxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDMUU7cUJBQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxZQUFZLElBQUksRUFBRTtvQkFDeEMsT0FBTyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7aUJBQ3ZCO3FCQUFNO29CQUNMLE9BQU8sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO29CQUN4QixPQUFPLENBQUMsV0FBVyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztpQkFDakU7Z0JBQ0QsTUFBTTthQUNQO1NBQ0Y7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDO0lBRU8sVUFBVTtRQUNoQixPQUFPLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELG1FQUFtRTtJQUMzRCxPQUFPLENBQUMsTUFBVztRQUN6QixNQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQzlCLE9BQU8sQ0FBQyxTQUFTLEtBQUssQ0FBQyxLQUFVLEVBQUUsSUFBUztZQUMxQyxJQUFJLE9BQU8sQ0FBQztZQUNaLElBQUksRUFBTyxDQUFDO1lBRVosSUFDRSxPQUFPLEtBQUssS0FBSyxRQUFRO2dCQUN6QixLQUFLLEtBQUssSUFBSTtnQkFDZCxDQUFDLENBQUMsS0FBSyxZQUFZLE9BQU8sQ0FBQztnQkFDM0IsQ0FBQyxDQUFDLEtBQUssWUFBWSxJQUFJLENBQUM7Z0JBQ3hCLENBQUMsQ0FBQyxLQUFLLFlBQVksTUFBTSxDQUFDO2dCQUMxQixDQUFDLENBQUMsS0FBSyxZQUFZLE1BQU0sQ0FBQztnQkFDMUIsQ0FBQyxDQUFDLEtBQUssWUFBWSxNQUFNLENBQUMsRUFDMUI7Z0JBQ0EsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdCLElBQUksT0FBTyxLQUFLLFNBQVMsRUFBRTtvQkFDekIsT0FBTyxFQUFDLElBQUksRUFBRSxPQUFPLEVBQUMsQ0FBQztpQkFDeEI7Z0JBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBRXpCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtvQkFDeEIsRUFBRSxHQUFHLEVBQUUsQ0FBQztvQkFDUixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxFQUFFO3dCQUMzQixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDL0MsQ0FBQyxDQUFDLENBQUM7aUJBQ0o7cUJBQU07b0JBQ0wsRUFBRSxHQUFHLEVBQUUsQ0FBQztvQkFDUixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTt3QkFDaEMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO29CQUN6RSxDQUFDLENBQUMsQ0FBQztpQkFDSjtnQkFDRCxPQUFPLEVBQUUsQ0FBQzthQUNYO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQztDQUNGLENBQUE7QUFsTVU7SUFBUixLQUFLLEVBQUU7b0RBQWtCO0FBQ2pCO0lBQVIsS0FBSyxFQUFFO3dEQUF3QjtBQUN2QjtJQUFSLEtBQUssRUFBRTtxREFBbUI7QUFDbEI7SUFBUixLQUFLLEVBQUU7bURBQXVCO0FBRXRCO0lBQVIsS0FBSyxFQUFFO3NEQUFvQjtBQUNuQjtJQUFSLEtBQUssRUFBRTsrREFBZ0M7QUFFL0I7SUFBUixLQUFLLEVBQUU7Z0VBQWlDO0FBRWhDO0lBQVIsS0FBSyxFQUFFOzZEQUEyQjtBQUMxQjtJQUFSLEtBQUssRUFBRTttRUFBbUQ7QUFRckI7SUFBckMsWUFBWSxDQUFDLHdCQUFzQixDQUFDO2tFQUVuQztBQXRCUyxzQkFBc0I7SUFMbEMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixzeERBQStDOztLQUVoRCxDQUFDO0dBQ1csc0JBQXNCLENBbU1sQztTQW5NWSxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgT25DaGFuZ2VzLCBJbnB1dCwgVmlld0NoaWxkcmVuLCBRdWVyeUxpc3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU2VnbWVudCB7XHJcbiAga2V5OiBzdHJpbmc7XHJcbiAgdmFsdWU6IGFueTtcclxuICB0eXBlOiB1bmRlZmluZWQgfCBzdHJpbmc7XHJcbiAgZGVzY3JpcHRpb246IHN0cmluZztcclxuICBleHBhbmRlZDogYm9vbGVhbjtcclxufVxyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICduZ3gtanNvbi12aWV3ZXInLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9uZ3gtanNvbi12aWV3ZXIuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL25neC1qc29uLXZpZXdlci5jb21wb25lbnQuc2NzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hKc29uVmlld2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcclxuICBASW5wdXQoKSBwdWJsaWMganNvbjogYW55O1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBleHBhbmRlZCA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGRlcHRoID0gLTE7XHJcbiAgQElucHV0KCkgcHVibGljIGtleSA9ICdPYmplY3QnO1xyXG4gIC8vIFRyYWNrcyB0aGUgbGVuZ3RoIG9mIGFycmF5IHR5cGVzLiAtMSBmb3Igb3RoZXIgdHlwZXNcclxuICBASW5wdXQoKSBwdWJsaWMgbGVuZ3RoID0gLTE7XHJcbiAgQElucHV0KCkgcHVibGljIHJlc3RvcmVFeHBhbmRlZCA9IGZhbHNlO1xyXG5cclxuICBASW5wdXQoKSBwdWJsaWMgc2hvd1R5cGVIZWFkaW5ncyA9IGZhbHNlO1xyXG5cclxuICBASW5wdXQoKSBwdWJsaWMgX2N1cnJlbnREZXB0aCA9IC0xO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBfcHJldmlvdXNseU9wZW5LZXlzPzoge1trZXk6IHN0cmluZ106IGFueX07XHJcblxyXG4gIHB1YmxpYyBuZXh0T3BlbktleXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XHJcbiAgcHVibGljIHNlZ21lbnRzOiBJU2VnbWVudFtdID0gW107XHJcblxyXG4gIC8vIE1hdGNoZXMgdGhlIGxhc3QgdW5kZXJzY29yZSBpbiBhIHN0cmluZ1xyXG4gIHByaXZhdGUgdW5kZXJzY29yZVJlZ2V4ID0gL19bXl9dKyQvO1xyXG5cclxuICBAVmlld0NoaWxkcmVuKE5neEpzb25WaWV3ZXJDb21wb25lbnQpIHB1YmxpYyBjaGlsZHJlbkNvbXBvbmVudHM6IFF1ZXJ5TGlzdDxcclxuICBOZ3hKc29uVmlld2VyQ29tcG9uZW50XHJcbiAgPjtcclxuXHJcbiAgcHJpdmF0ZSBnZXRPcGVuS2V5c1JlY3Vyc2l2ZSgpOiBhbnkge1xyXG4gICAgY29uc3Qgb3BlbktleXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XHJcbiAgICB0aGlzLmNoaWxkcmVuQ29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQ6IE5neEpzb25WaWV3ZXJDb21wb25lbnQpID0+IHtcclxuICAgICAgLy8gU2F2ZSBrZXkgYW5kIGxlbmd0aCAtIG9uIHJlbG9hZCBhcnJheSBlbGVtZW50cyBzaG91bGQgb25seSBiZSByZW9wZW5lZCBpZlxyXG4gICAgICAvLyB0aGUgYXJyYXkgaXMgdGhlIHNhbWUgbGVuZ3RoXHJcbiAgICAgIG9wZW5LZXlzW2NvbXBvbmVudC5rZXkgKyAnXycgKyBjb21wb25lbnQubGVuZ3RoXSA9IGNvbXBvbmVudC5nZXRPcGVuS2V5c1JlY3Vyc2l2ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKE9iamVjdC5rZXlzKG9wZW5LZXlzKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG9wZW5LZXlzO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBvcGVuU2VnbWVudHMoKTogdm9pZCB7XHJcbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXModGhpcy5fcHJldmlvdXNseU9wZW5LZXlzISk7XHJcbiAgICBrZXlzLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBrZXkgZXhpc3RzLCBpZiBzbyBleHBhbmRzIGl0XHJcbiAgICAgIGNvbnN0IHN0cmlwcGVkS2V5ID0ga2V5LnJlcGxhY2UodGhpcy51bmRlcnNjb3JlUmVnZXgsICcnKTtcclxuICAgICAgY29uc3QgZm91bmRTZWdtZW50ID0gdGhpcy5zZWdtZW50cy5maW5kKHNlZ21lbnQgPT4ge1xyXG4gICAgICAgIHJldHVybiBzZWdtZW50LmtleSA9PT0gc3RyaXBwZWRLZXk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKCFmb3VuZFNlZ21lbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdGhpcy5pc0V4cGFuZGFibGUoZm91bmRTZWdtZW50KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm91bmRTZWdtZW50LmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xyXG4gICAgLy8gU2F2ZSBvcGVuIGtleXMgc3RydWN0dXJlIGJlZm9yZSBwcm9jZXNzaW5nIG5ldyBqc29uXHJcbiAgICAvLyBXaWxsIG9ubHkgcnVuIGluIHRvcCBsZXZlbFxyXG4gICAgaWYgKHRoaXMucmVzdG9yZUV4cGFuZGVkICYmIHRoaXMuY2hpbGRyZW5Db21wb25lbnRzKSB7XHJcbiAgICAgIHRoaXMuX3ByZXZpb3VzbHlPcGVuS2V5cyA9IHRoaXMuZ2V0T3BlbktleXNSZWN1cnNpdmUoKTtcclxuICAgICAgY29uc29sZS5sb2codGhpcy5fcHJldmlvdXNseU9wZW5LZXlzKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlZ21lbnRzID0gW107XHJcblxyXG4gICAgLy8gcmVtb3ZlIGN5Y2xlc1xyXG4gICAgdGhpcy5qc29uID0gdGhpcy5kZWN5Y2xlKHRoaXMuanNvbik7XHJcblxyXG4gICAgdGhpcy5fY3VycmVudERlcHRoKys7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmpzb24gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuanNvbikuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAgIHRoaXMuc2VnbWVudHMucHVzaCh0aGlzLnBhcnNlS2V5VmFsdWUoa2V5LCB0aGlzLmpzb25ba2V5XSkpO1xyXG4gICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuc2VnbWVudHMucHVzaCh0aGlzLnBhcnNlS2V5VmFsdWUoYCgke3R5cGVvZiB0aGlzLmpzb259KWAsIHRoaXMuanNvbikpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghdGhpcy5fcHJldmlvdXNseU9wZW5LZXlzKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMub3BlblNlZ21lbnRzKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgaXNFeHBhbmRhYmxlKHNlZ21lbnQ6IElTZWdtZW50KTogYW55IHtcclxuICAgIHJldHVybiBzZWdtZW50LnR5cGUgPT09ICdvYmplY3QnIHx8IHNlZ21lbnQudHlwZSA9PT0gJ2FycmF5JztcclxuICB9XHJcblxyXG4gIHB1YmxpYyB0b2dnbGUoc2VnbWVudDogSVNlZ21lbnQpOiBhbnkge1xyXG4gICAgaWYgKHRoaXMuaXNFeHBhbmRhYmxlKHNlZ21lbnQpKSB7XHJcbiAgICAgIHNlZ21lbnQuZXhwYW5kZWQgPSAhc2VnbWVudC5leHBhbmRlZDtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgcGFyc2VLZXlWYWx1ZShrZXk6IGFueSwgdmFsdWU6IGFueSk6IElTZWdtZW50IHtcclxuICAgIGNvbnN0IHNlZ21lbnQ6IElTZWdtZW50ID0ge1xyXG4gICAgICBrZXk6IGtleSxcclxuICAgICAgdmFsdWU6IHZhbHVlLFxyXG4gICAgICB0eXBlOiB1bmRlZmluZWQsXHJcbiAgICAgIGRlc2NyaXB0aW9uOiAnJyArIHZhbHVlLFxyXG4gICAgICBleHBhbmRlZDogdGhpcy5pc0V4cGFuZGVkKCksXHJcbiAgICB9O1xyXG5cclxuICAgIHN3aXRjaCAodHlwZW9mIHNlZ21lbnQudmFsdWUpIHtcclxuICAgICAgY2FzZSAnbnVtYmVyJzoge1xyXG4gICAgICAgIHNlZ21lbnQudHlwZSA9ICdudW1iZXInO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ2Jvb2xlYW4nOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ2Jvb2xlYW4nO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ2Z1bmN0aW9uJzoge1xyXG4gICAgICAgIHNlZ21lbnQudHlwZSA9ICdmdW5jdGlvbic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnc3RyaW5nJzoge1xyXG4gICAgICAgIHNlZ21lbnQudHlwZSA9ICdzdHJpbmcnO1xyXG4gICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnXCInICsgc2VnbWVudC52YWx1ZSArICdcIic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAndW5kZWZpbmVkJzoge1xyXG4gICAgICAgIHNlZ21lbnQudHlwZSA9ICd1bmRlZmluZWQnO1xyXG4gICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAndW5kZWZpbmVkJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdvYmplY3QnOiB7XHJcbiAgICAgICAgLy8geWVhLCBudWxsIGlzIG9iamVjdFxyXG4gICAgICAgIGlmIChzZWdtZW50LnZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnbnVsbCc7XHJcbiAgICAgICAgICBzZWdtZW50LmRlc2NyaXB0aW9uID0gJ251bGwnO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShzZWdtZW50LnZhbHVlKSkge1xyXG4gICAgICAgICAgc2VnbWVudC50eXBlID0gJ2FycmF5JztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPVxyXG4gICAgICAgICAgICAnQXJyYXlbJyArIHNlZ21lbnQudmFsdWUubGVuZ3RoICsgJ10gJyArIEpTT04uc3RyaW5naWZ5KHNlZ21lbnQudmFsdWUpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoc2VnbWVudC52YWx1ZSBpbnN0YW5jZW9mIERhdGUpIHtcclxuICAgICAgICAgIHNlZ21lbnQudHlwZSA9ICdkYXRlJztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc2VnbWVudC50eXBlID0gJ29iamVjdCc7XHJcbiAgICAgICAgICBzZWdtZW50LmRlc2NyaXB0aW9uID0gJ09iamVjdCAnICsgSlNPTi5zdHJpbmdpZnkoc2VnbWVudC52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNlZ21lbnQ7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGlzRXhwYW5kZWQoKTogYm9vbGVhbiB7XHJcbiAgICByZXR1cm4gdGhpcy5leHBhbmRlZCAmJiAhKHRoaXMuZGVwdGggPiAtMSAmJiB0aGlzLl9jdXJyZW50RGVwdGggPj0gdGhpcy5kZXB0aCk7XHJcbiAgfVxyXG5cclxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vZG91Z2xhc2Nyb2NrZm9yZC9KU09OLWpzL2Jsb2IvbWFzdGVyL2N5Y2xlLmpzXHJcbiAgcHJpdmF0ZSBkZWN5Y2xlKG9iamVjdDogYW55KTogYW55IHtcclxuICAgIGNvbnN0IG9iamVjdHMgPSBuZXcgV2Vha01hcCgpO1xyXG4gICAgcmV0dXJuIChmdW5jdGlvbiBkZXJleih2YWx1ZTogYW55LCBwYXRoOiBhbnkpOiBhbnkge1xyXG4gICAgICBsZXQgb2xkUGF0aDtcclxuICAgICAgbGV0IG51OiBhbnk7XHJcblxyXG4gICAgICBpZiAoXHJcbiAgICAgICAgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxyXG4gICAgICAgIHZhbHVlICE9PSBudWxsICYmXHJcbiAgICAgICAgISh2YWx1ZSBpbnN0YW5jZW9mIEJvb2xlYW4pICYmXHJcbiAgICAgICAgISh2YWx1ZSBpbnN0YW5jZW9mIERhdGUpICYmXHJcbiAgICAgICAgISh2YWx1ZSBpbnN0YW5jZW9mIE51bWJlcikgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSAmJlxyXG4gICAgICAgICEodmFsdWUgaW5zdGFuY2VvZiBTdHJpbmcpXHJcbiAgICAgICkge1xyXG4gICAgICAgIG9sZFBhdGggPSBvYmplY3RzLmdldCh2YWx1ZSk7XHJcbiAgICAgICAgaWYgKG9sZFBhdGggIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgcmV0dXJuIHskcmVmOiBvbGRQYXRofTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb2JqZWN0cy5zZXQodmFsdWUsIHBhdGgpO1xyXG5cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICAgIG51ID0gW107XHJcbiAgICAgICAgICB2YWx1ZS5mb3JFYWNoKChlbGVtZW50LCBpKSA9PiB7XHJcbiAgICAgICAgICAgIG51W2ldID0gZGVyZXooZWxlbWVudCwgcGF0aCArICdbJyArIGkgKyAnXScpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG51ID0ge307XHJcbiAgICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZSkuZm9yRWFjaChuYW1lID0+IHtcclxuICAgICAgICAgICAgbnVbbmFtZV0gPSBkZXJleih2YWx1ZVtuYW1lXSwgcGF0aCArICdbJyArIEpTT04uc3RyaW5naWZ5KG5hbWUpICsgJ10nKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnU7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgfSkob2JqZWN0LCAnJCcpO1xyXG4gIH1cclxufVxyXG4iXX0=