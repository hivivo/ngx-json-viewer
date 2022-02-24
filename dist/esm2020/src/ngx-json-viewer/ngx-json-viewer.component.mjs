import { Component, Input, ViewChildren } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
export class NgxJsonViewerComponent {
    constructor() {
        this.expanded = true;
        this.depth = -1;
        this.restoreExpanded = false;
        this.showTypeHeadings = false;
        this._currentDepth = -1;
        this.segments = [];
    }
    getOpenKeysRecursive() {
        const openKeys = {};
        this.childrenComponents.forEach((component) => {
            // Save key and length
            openKeys[component._key] = component.getOpenKeysRecursive();
        });
        if (Object.keys(openKeys).length === 0) {
            return;
        }
        return openKeys;
    }
    openSegments() {
        const keys = Object.keys(this._previouslyOpenKeys);
        keys.forEach((key) => {
            // Check to see if the key exists, if so expands it
            const foundSegment = this.segments.find((segment) => segment.key === key);
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
        }
        this.segments = [];
        // remove cycles
        this.json = this.decycle(this.json);
        this._currentDepth++;
        if (typeof this.json === 'object') {
            Object.keys(this.json).forEach((key) => {
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
                    Object.keys(value).forEach((name) => {
                        nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
                    });
                }
                return nu;
            }
            return value;
        })(object, '$');
    }
}
NgxJsonViewerComponent.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.2.4", ngImport: i0, type: NgxJsonViewerComponent, deps: [], target: i0.ɵɵFactoryTarget.Component });
NgxJsonViewerComponent.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "12.0.0", version: "13.2.4", type: NgxJsonViewerComponent, selector: "ngx-json-viewer", inputs: { json: "json", expanded: "expanded", depth: "depth", restoreExpanded: "restoreExpanded", showTypeHeadings: "showTypeHeadings", _key: "_key", _previouslyOpenKeys: "_previouslyOpenKeys", _currentDepth: "_currentDepth" }, viewQueries: [{ propertyName: "childrenComponents", predicate: NgxJsonViewerComponent, descendants: true }], usesOnChanges: true, ngImport: i0, template: "<section class=\"ngx-json-viewer\">\r\n  <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\r\n    <section\r\n      (click)=\"toggle(segment)\"\r\n      [ngClass]=\"{\r\n        'segment-main': true,\r\n        expandable: isExpandable(segment),\r\n        expanded: segment.expanded\r\n      }\"\r\n    >\r\n      <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\r\n      <span class=\"segment-key\">{{ segment.key }}</span>\r\n      <span class=\"segment-separator\">: </span>\r\n      <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\r\n        segment.description\r\n      }}</span>\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\r\n        class=\"segment-value\"\r\n        >Array[{{ segment.value.length }}]</span\r\n      >\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\r\n        class=\"segment-value\"\r\n        >Object</span\r\n      >\r\n    </section>\r\n    <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\r\n      <ngx-json-viewer\r\n        [json]=\"segment.value\"\r\n        [expanded]=\"expanded\"\r\n        [depth]=\"depth\"\r\n        [showTypeHeadings]=\"showTypeHeadings\"\r\n        [_key]=\"segment.key\"\r\n        [_currentDepth]=\"_currentDepth\"\r\n        [_previouslyOpenKeys]=\"_previouslyOpenKeys && _previouslyOpenKeys[segment.key]\"\r\n      ></ngx-json-viewer>\r\n    </section>\r\n  </section>\r\n</section>\r\n", styles: ["@charset \"UTF-8\";.ngx-json-viewer{font-family:monospace;font-size:1em;width:100%;height:100%;overflow:hidden;position:relative}.ngx-json-viewer .segment{padding:0;margin:0 0 1px 12px}.ngx-json-viewer .segment .segment-main{word-wrap:break-word}.ngx-json-viewer .segment .segment-main .toggler{position:absolute;margin-left:-14px;margin-top:3px;font-size:.8em;line-height:1.2em;vertical-align:middle;color:#787878}.ngx-json-viewer .segment .segment-main .toggler:after{display:inline-block;content:\"\\25ba\";transition:transform .1s ease-in}.ngx-json-viewer .segment .segment-main .segment-key{color:#00008b;word-wrap:break-word;white-space:pre-line}.ngx-json-viewer .segment .segment-main .segment-separator{color:#00008b}.ngx-json-viewer .segment .segment-main .segment-value{color:#000}.ngx-json-viewer .segment .children{margin-left:4px}.ngx-json-viewer .segment-type-string>.segment-main>.segment-value{color:green}.ngx-json-viewer .segment-type-number>.segment-main>.segment-value{color:#00f}.ngx-json-viewer .segment-type-boolean>.segment-main>.segment-value{color:red}.ngx-json-viewer .segment-type-date>.segment-main>.segment-value{color:#05668d}.ngx-json-viewer .segment-type-array>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-object>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-function>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-null>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-key{color:#999}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{background-color:#999}.ngx-json-viewer .segment-type-object>.segment-main,.ngx-json-viewer .segment-type-array>.segment-main{white-space:nowrap}.ngx-json-viewer .expanded>.toggler:after{transform:rotate(90deg)}.ngx-json-viewer .expandable>.segment-value{display:inline-block;vertical-align:bottom;text-overflow:ellipsis;overflow:hidden}.ngx-json-viewer .expandable,.ngx-json-viewer .expandable>.toggler{cursor:pointer}\n"], components: [{ type: NgxJsonViewerComponent, selector: "ngx-json-viewer", inputs: ["json", "expanded", "depth", "restoreExpanded", "showTypeHeadings", "_key", "_previouslyOpenKeys", "_currentDepth"] }], directives: [{ type: i1.NgForOf, selector: "[ngFor][ngForOf]", inputs: ["ngForOf", "ngForTrackBy", "ngForTemplate"] }, { type: i1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { type: i1.NgIf, selector: "[ngIf]", inputs: ["ngIf", "ngIfThen", "ngIfElse"] }] });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.2.4", ngImport: i0, type: NgxJsonViewerComponent, decorators: [{
            type: Component,
            args: [{ selector: 'ngx-json-viewer', template: "<section class=\"ngx-json-viewer\">\r\n  <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\r\n    <section\r\n      (click)=\"toggle(segment)\"\r\n      [ngClass]=\"{\r\n        'segment-main': true,\r\n        expandable: isExpandable(segment),\r\n        expanded: segment.expanded\r\n      }\"\r\n    >\r\n      <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\r\n      <span class=\"segment-key\">{{ segment.key }}</span>\r\n      <span class=\"segment-separator\">: </span>\r\n      <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\r\n        segment.description\r\n      }}</span>\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\r\n        class=\"segment-value\"\r\n        >Array[{{ segment.value.length }}]</span\r\n      >\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\r\n        class=\"segment-value\"\r\n        >Object</span\r\n      >\r\n    </section>\r\n    <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\r\n      <ngx-json-viewer\r\n        [json]=\"segment.value\"\r\n        [expanded]=\"expanded\"\r\n        [depth]=\"depth\"\r\n        [showTypeHeadings]=\"showTypeHeadings\"\r\n        [_key]=\"segment.key\"\r\n        [_currentDepth]=\"_currentDepth\"\r\n        [_previouslyOpenKeys]=\"_previouslyOpenKeys && _previouslyOpenKeys[segment.key]\"\r\n      ></ngx-json-viewer>\r\n    </section>\r\n  </section>\r\n</section>\r\n", styles: ["@charset \"UTF-8\";.ngx-json-viewer{font-family:monospace;font-size:1em;width:100%;height:100%;overflow:hidden;position:relative}.ngx-json-viewer .segment{padding:0;margin:0 0 1px 12px}.ngx-json-viewer .segment .segment-main{word-wrap:break-word}.ngx-json-viewer .segment .segment-main .toggler{position:absolute;margin-left:-14px;margin-top:3px;font-size:.8em;line-height:1.2em;vertical-align:middle;color:#787878}.ngx-json-viewer .segment .segment-main .toggler:after{display:inline-block;content:\"\\25ba\";transition:transform .1s ease-in}.ngx-json-viewer .segment .segment-main .segment-key{color:#00008b;word-wrap:break-word;white-space:pre-line}.ngx-json-viewer .segment .segment-main .segment-separator{color:#00008b}.ngx-json-viewer .segment .segment-main .segment-value{color:#000}.ngx-json-viewer .segment .children{margin-left:4px}.ngx-json-viewer .segment-type-string>.segment-main>.segment-value{color:green}.ngx-json-viewer .segment-type-number>.segment-main>.segment-value{color:#00f}.ngx-json-viewer .segment-type-boolean>.segment-main>.segment-value{color:red}.ngx-json-viewer .segment-type-date>.segment-main>.segment-value{color:#05668d}.ngx-json-viewer .segment-type-array>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-object>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-function>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-null>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-key{color:#999}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{background-color:#999}.ngx-json-viewer .segment-type-object>.segment-main,.ngx-json-viewer .segment-type-array>.segment-main{white-space:nowrap}.ngx-json-viewer .expanded>.toggler:after{transform:rotate(90deg)}.ngx-json-viewer .expandable>.segment-value{display:inline-block;vertical-align:bottom;text-overflow:ellipsis;overflow:hidden}.ngx-json-viewer .expandable,.ngx-json-viewer .expandable>.toggler{cursor:pointer}\n"] }]
        }], propDecorators: { json: [{
                type: Input
            }], expanded: [{
                type: Input
            }], depth: [{
                type: Input
            }], restoreExpanded: [{
                type: Input
            }], showTypeHeadings: [{
                type: Input
            }], _key: [{
                type: Input
            }], _previouslyOpenKeys: [{
                type: Input
            }], _currentDepth: [{
                type: Input
            }], childrenComponents: [{
                type: ViewChildren,
                args: [NgxJsonViewerComponent]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9uZ3gtanNvbi12aWV3ZXIvbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC50cyIsIi4uLy4uLy4uLy4uL3NyYy9uZ3gtanNvbi12aWV3ZXIvbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBQyxTQUFTLEVBQWEsS0FBSyxFQUFFLFlBQVksRUFBWSxNQUFNLGVBQWUsQ0FBQzs7O0FBZW5GLE1BQU0sT0FBTyxzQkFBc0I7SUFMbkM7UUFPa0IsYUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixVQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDWCxvQkFBZSxHQUFHLEtBQUssQ0FBQztRQUN4QixxQkFBZ0IsR0FBRyxLQUFLLENBQUM7UUFJekIsa0JBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUU1QixhQUFRLEdBQWUsRUFBRSxDQUFDO0tBMktsQztJQXRLUyxvQkFBb0I7UUFDMUIsTUFBTSxRQUFRLEdBQXlCLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDNUMsc0JBQXNCO1lBQ3RCLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QyxPQUFPO1NBQ1I7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRU8sWUFBWTtRQUNsQixNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBb0IsQ0FBQyxDQUFDO1FBQ3BELElB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d0NoaWxkcmVuLCBRdWVyeUxpc3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBJU2VnbWVudCB7XHJcbiAga2V5OiBzdHJpbmc7XHJcbiAgdmFsdWU6IGFueTtcclxuICB0eXBlOiB1bmRlZmluZWQgfCBzdHJpbmc7XHJcbiAgZGVzY3JpcHRpb246IHN0cmluZztcclxuICBleHBhbmRlZDogYm9vbGVhbjtcclxufVxyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICduZ3gtanNvbi12aWV3ZXInLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9uZ3gtanNvbi12aWV3ZXIuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogWycuL25neC1qc29uLXZpZXdlci5jb21wb25lbnQuc2NzcyddLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgTmd4SnNvblZpZXdlckNvbXBvbmVudCBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XHJcbiAgQElucHV0KCkgcHVibGljIGpzb246IGFueTtcclxuICBASW5wdXQoKSBwdWJsaWMgZXhwYW5kZWQgPSB0cnVlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBkZXB0aCA9IC0xO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyByZXN0b3JlRXhwYW5kZWQgPSBmYWxzZTtcclxuICBASW5wdXQoKSBwdWJsaWMgc2hvd1R5cGVIZWFkaW5ncyA9IGZhbHNlO1xyXG5cclxuICBASW5wdXQoKSBwdWJsaWMgX2tleTogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBfcHJldmlvdXNseU9wZW5LZXlzPzoge1trZXk6IHN0cmluZ106IGFueX07XHJcbiAgQElucHV0KCkgcHVibGljIF9jdXJyZW50RGVwdGggPSAtMTtcclxuXHJcbiAgcHVibGljIHNlZ21lbnRzOiBJU2VnbWVudFtdID0gW107XHJcblxyXG4gIEBWaWV3Q2hpbGRyZW4oTmd4SnNvblZpZXdlckNvbXBvbmVudClcclxuICBwdWJsaWMgY2hpbGRyZW5Db21wb25lbnRzOiBRdWVyeUxpc3Q8Tmd4SnNvblZpZXdlckNvbXBvbmVudD47XHJcblxyXG4gIHByaXZhdGUgZ2V0T3BlbktleXNSZWN1cnNpdmUoKTogYW55IHtcclxuICAgIGNvbnN0IG9wZW5LZXlzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xyXG4gICAgdGhpcy5jaGlsZHJlbkNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgIC8vIFNhdmUga2V5IGFuZCBsZW5ndGhcclxuICAgICAgb3BlbktleXNbY29tcG9uZW50Ll9rZXldID0gY29tcG9uZW50LmdldE9wZW5LZXlzUmVjdXJzaXZlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoT2JqZWN0LmtleXMob3BlbktleXMpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3BlbktleXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9wZW5TZWdtZW50cygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9wcmV2aW91c2x5T3BlbktleXMhKTtcclxuICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUga2V5IGV4aXN0cywgaWYgc28gZXhwYW5kcyBpdFxyXG4gICAgICBjb25zdCBmb3VuZFNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzLmZpbmQoKHNlZ21lbnQpID0+IHNlZ21lbnQua2V5ID09PSBrZXkpO1xyXG5cclxuICAgICAgaWYgKCFmb3VuZFNlZ21lbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdGhpcy5pc0V4cGFuZGFibGUoZm91bmRTZWdtZW50KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm91bmRTZWdtZW50LmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xyXG4gICAgLy8gU2F2ZSBvcGVuIGtleXMgc3RydWN0dXJlIGJlZm9yZSBwcm9jZXNzaW5nIG5ldyBqc29uXHJcbiAgICAvLyBXaWxsIG9ubHkgcnVuIGluIHRvcCBsZXZlbFxyXG4gICAgaWYgKHRoaXMucmVzdG9yZUV4cGFuZGVkICYmIHRoaXMuY2hpbGRyZW5Db21wb25lbnRzKSB7XHJcbiAgICAgIHRoaXMuX3ByZXZpb3VzbHlPcGVuS2V5cyA9IHRoaXMuZ2V0T3BlbktleXNSZWN1cnNpdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlZ21lbnRzID0gW107XHJcblxyXG4gICAgLy8gcmVtb3ZlIGN5Y2xlc1xyXG4gICAgdGhpcy5qc29uID0gdGhpcy5kZWN5Y2xlKHRoaXMuanNvbik7XHJcblxyXG4gICAgdGhpcy5fY3VycmVudERlcHRoKys7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmpzb24gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuanNvbikuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShrZXksIHRoaXMuanNvbltrZXldKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShgKCR7dHlwZW9mIHRoaXMuanNvbn0pYCwgdGhpcy5qc29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9wcmV2aW91c2x5T3BlbktleXMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5vcGVuU2VnbWVudHMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0V4cGFuZGFibGUoc2VnbWVudDogSVNlZ21lbnQpOiBhbnkge1xyXG4gICAgcmV0dXJuIHNlZ21lbnQudHlwZSA9PT0gJ29iamVjdCcgfHwgc2VnbWVudC50eXBlID09PSAnYXJyYXknO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvZ2dsZShzZWdtZW50OiBJU2VnbWVudCk6IGFueSB7XHJcbiAgICBpZiAodGhpcy5pc0V4cGFuZGFibGUoc2VnbWVudCkpIHtcclxuICAgICAgc2VnbWVudC5leHBhbmRlZCA9ICFzZWdtZW50LmV4cGFuZGVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXJzZUtleVZhbHVlKGtleTogYW55LCB2YWx1ZTogYW55KTogSVNlZ21lbnQge1xyXG4gICAgY29uc3Qgc2VnbWVudDogSVNlZ21lbnQgPSB7XHJcbiAgICAgIGtleToga2V5LFxyXG4gICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcclxuICAgICAgZGVzY3JpcHRpb246ICcnICsgdmFsdWUsXHJcbiAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoKSxcclxuICAgIH07XHJcblxyXG4gICAgc3dpdGNoICh0eXBlb2Ygc2VnbWVudC52YWx1ZSkge1xyXG4gICAgICBjYXNlICdudW1iZXInOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ251bWJlcic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnYm9vbGVhbic6IHtcclxuICAgICAgICBzZWdtZW50LnR5cGUgPSAnYm9vbGVhbic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnZnVuY3Rpb24nOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdzdHJpbmcnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3N0cmluZyc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICdcIicgKyBzZWdtZW50LnZhbHVlICsgJ1wiJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICd1bmRlZmluZWQnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3VuZGVmaW5lZCc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICd1bmRlZmluZWQnO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ29iamVjdCc6IHtcclxuICAgICAgICAvLyB5ZWEsIG51bGwgaXMgb2JqZWN0XHJcbiAgICAgICAgaWYgKHNlZ21lbnQudmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgIHNlZ21lbnQudHlwZSA9ICdudWxsJztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnbnVsbCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlZ21lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnYXJyYXknO1xyXG4gICAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9XHJcbiAgICAgICAgICAgICdBcnJheVsnICsgc2VnbWVudC52YWx1ZS5sZW5ndGggKyAnXSAnICsgSlNPTi5zdHJpbmdpZnkoc2VnbWVudC52YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWdtZW50LnZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgc2VnbWVudC50eXBlID0gJ2RhdGUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnb2JqZWN0JztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnT2JqZWN0ICcgKyBKU09OLnN0cmluZ2lmeShzZWdtZW50LnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VnbWVudDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNFeHBhbmRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmV4cGFuZGVkICYmICEodGhpcy5kZXB0aCA+IC0xICYmIHRoaXMuX2N1cnJlbnREZXB0aCA+PSB0aGlzLmRlcHRoKTtcclxuICB9XHJcblxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb3VnbGFzY3JvY2tmb3JkL0pTT04tanMvYmxvYi9tYXN0ZXIvY3ljbGUuanNcclxuICBwcml2YXRlIGRlY3ljbGUob2JqZWN0OiBhbnkpOiBhbnkge1xyXG4gICAgY29uc3Qgb2JqZWN0cyA9IG5ldyBXZWFrTWFwKCk7XHJcbiAgICByZXR1cm4gKGZ1bmN0aW9uIGRlcmV6KHZhbHVlOiBhbnksIHBhdGg6IGFueSk6IGFueSB7XHJcbiAgICAgIGxldCBvbGRQYXRoO1xyXG4gICAgICBsZXQgbnU6IGFueTtcclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXHJcbiAgICAgICAgdmFsdWUgIT09IG51bGwgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbikgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyKSAmJlxyXG4gICAgICAgICEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApICYmXHJcbiAgICAgICAgISh2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZylcclxuICAgICAgKSB7XHJcbiAgICAgICAgb2xkUGF0aCA9IG9iamVjdHMuZ2V0KHZhbHVlKTtcclxuICAgICAgICBpZiAob2xkUGF0aCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXR1cm4geyRyZWY6IG9sZFBhdGh9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBvYmplY3RzLnNldCh2YWx1ZSwgcGF0aCk7XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgbnUgPSBbXTtcclxuICAgICAgICAgIHZhbHVlLmZvckVhY2goKGVsZW1lbnQsIGkpID0+IHtcclxuICAgICAgICAgICAgbnVbaV0gPSBkZXJleihlbGVtZW50LCBwYXRoICsgJ1snICsgaSArICddJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbnUgPSB7fTtcclxuICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIG51W25hbWVdID0gZGVyZXoodmFsdWVbbmFtZV0sIHBhdGggKyAnWycgKyBKU09OLnN0cmluZ2lmeShuYW1lKSArICddJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0pKG9iamVjdCwgJyQnKTtcclxuICB9XHJcbn1cclxuIiwiPHNlY3Rpb24gY2xhc3M9XCJuZ3gtanNvbi12aWV3ZXJcIj5cclxuICA8c2VjdGlvbiAqbmdGb3I9XCJsZXQgc2VnbWVudCBvZiBzZWdtZW50c1wiIFtuZ0NsYXNzXT1cIlsnc2VnbWVudCcsICdzZWdtZW50LXR5cGUtJyArIHNlZ21lbnQudHlwZV1cIj5cclxuICAgIDxzZWN0aW9uXHJcbiAgICAgIChjbGljayk9XCJ0b2dnbGUoc2VnbWVudClcIlxyXG4gICAgICBbbmdDbGFzc109XCJ7XHJcbiAgICAgICAgJ3NlZ21lbnQtbWFpbic6IHRydWUsXHJcbiAgICAgICAgZXhwYW5kYWJsZTogaXNFeHBhbmRhYmxlKHNlZ21lbnQpLFxyXG4gICAgICAgIGV4cGFuZGVkOiBzZWdtZW50LmV4cGFuZGVkXHJcbiAgICAgIH1cIlxyXG4gICAgPlxyXG4gICAgICA8ZGl2ICpuZ0lmPVwiaXNFeHBhbmRhYmxlKHNlZ21lbnQpXCIgY2xhc3M9XCJ0b2dnbGVyXCI+PC9kaXY+XHJcbiAgICAgIDxzcGFuIGNsYXNzPVwic2VnbWVudC1rZXlcIj57eyBzZWdtZW50LmtleSB9fTwvc3Bhbj5cclxuICAgICAgPHNwYW4gY2xhc3M9XCJzZWdtZW50LXNlcGFyYXRvclwiPjogPC9zcGFuPlxyXG4gICAgICA8c3BhbiAqbmdJZj1cIiFzZWdtZW50LmV4cGFuZGVkIHx8ICFpc0V4cGFuZGFibGUoc2VnbWVudClcIiBjbGFzcz1cInNlZ21lbnQtdmFsdWVcIj57e1xyXG4gICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb25cclxuICAgICAgfX08L3NwYW4+XHJcbiAgICAgIDxzcGFuXHJcbiAgICAgICAgKm5nSWY9XCJzaG93VHlwZUhlYWRpbmdzICYmIHNlZ21lbnQuZXhwYW5kZWQgJiYgc2VnbWVudC50eXBlID09ICdhcnJheSdcIlxyXG4gICAgICAgIGNsYXNzPVwic2VnbWVudC12YWx1ZVwiXHJcbiAgICAgICAgPkFycmF5W3t7IHNlZ21lbnQudmFsdWUubGVuZ3RoIH19XTwvc3BhblxyXG4gICAgICA+XHJcbiAgICAgIDxzcGFuXHJcbiAgICAgICAgKm5nSWY9XCJzaG93VHlwZUhlYWRpbmdzICYmIHNlZ21lbnQuZXhwYW5kZWQgJiYgc2VnbWVudC50eXBlID09ICdvYmplY3QnXCJcclxuICAgICAgICBjbGFzcz1cInNlZ21lbnQtdmFsdWVcIlxyXG4gICAgICAgID5PYmplY3Q8L3NwYW5cclxuICAgICAgPlxyXG4gICAgPC9zZWN0aW9uPlxyXG4gICAgPHNlY3Rpb24gKm5nSWY9XCJzZWdtZW50LmV4cGFuZGVkICYmIGlzRXhwYW5kYWJsZShzZWdtZW50KVwiIGNsYXNzPVwiY2hpbGRyZW5cIj5cclxuICAgICAgPG5neC1qc29uLXZpZXdlclxyXG4gICAgICAgIFtqc29uXT1cInNlZ21lbnQudmFsdWVcIlxyXG4gICAgICAgIFtleHBhbmRlZF09XCJleHBhbmRlZFwiXHJcbiAgICAgICAgW2RlcHRoXT1cImRlcHRoXCJcclxuICAgICAgICBbc2hvd1R5cGVIZWFkaW5nc109XCJzaG93VHlwZUhlYWRpbmdzXCJcclxuICAgICAgICBbX2tleV09XCJzZWdtZW50LmtleVwiXHJcbiAgICAgICAgW19jdXJyZW50RGVwdGhdPVwiX2N1cnJlbnREZXB0aFwiXHJcbiAgICAgICAgW19wcmV2aW91c2x5T3BlbktleXNdPVwiX3ByZXZpb3VzbHlPcGVuS2V5cyAmJiBfcHJldmlvdXNseU9wZW5LZXlzW3NlZ21lbnQua2V5XVwiXHJcbiAgICAgID48L25neC1qc29uLXZpZXdlcj5cclxuICAgIDwvc2VjdGlvbj5cclxuICA8L3NlY3Rpb24+XHJcbjwvc2VjdGlvbj5cclxuIl19