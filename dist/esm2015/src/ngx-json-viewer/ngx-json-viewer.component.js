import { Component, Input, ViewChildren } from '@angular/core';
export class NgxJsonViewerComponent {
    constructor() {
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
            const strippedKey = key.replace(this.underscoreRegex, '');
            const foundSegment = this.segments.find((segment) => segment.key === strippedKey);
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
NgxJsonViewerComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-json-viewer',
                template: "<section class=\"ngx-json-viewer\">\r\n  <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\r\n    <section\r\n      (click)=\"toggle(segment)\"\r\n      [ngClass]=\"{\r\n        'segment-main': true,\r\n        expandable: isExpandable(segment),\r\n        expanded: segment.expanded\r\n      }\"\r\n    >\r\n      <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\r\n      <span class=\"segment-key\">{{ segment.key }}</span>\r\n      <span class=\"segment-separator\">: </span>\r\n      <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\r\n        segment.description\r\n      }}</span>\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\r\n        class=\"segment-value\"\r\n        >Array[{{ segment.value.length }}]</span\r\n      >\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\r\n        class=\"segment-value\"\r\n        >Object</span\r\n      >\r\n    </section>\r\n    <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\r\n      <ngx-json-viewer\r\n        [json]=\"segment.value\"\r\n        [expanded]=\"expanded\"\r\n        [depth]=\"depth\"\r\n        [_key]=\"segment.key\"\r\n        [_currentDepth]=\"_currentDepth\"\r\n        [_length]=\"segment.type === 'array' ? segment.value.length : -1\"\r\n        [_previouslyOpenKeys]=\"_previouslyOpenKeys && _previouslyOpenKeys[segment.key]\"\r\n      ></ngx-json-viewer>\r\n    </section>\r\n  </section>\r\n</section>\r\n",
                styles: ["@charset \"UTF-8\";.ngx-json-viewer{font-family:monospace;font-size:1em;width:100%;height:100%;overflow:hidden;position:relative}.ngx-json-viewer .segment{padding:0;margin:0 0 1px 12px}.ngx-json-viewer .segment .segment-main{word-wrap:break-word}.ngx-json-viewer .segment .segment-main .toggler{position:absolute;margin-left:-14px;margin-top:3px;font-size:.8em;line-height:1.2em;vertical-align:middle;color:#787878}.ngx-json-viewer .segment .segment-main .toggler:after{display:inline-block;content:\"\u25BA\";transition:transform .1s ease-in}.ngx-json-viewer .segment .segment-main .segment-key{color:#00008b;word-wrap:break-word;white-space:pre-line}.ngx-json-viewer .segment .segment-main .segment-separator{color:#00008b}.ngx-json-viewer .segment .segment-main .segment-value{color:#000}.ngx-json-viewer .segment .children{margin-left:4px}.ngx-json-viewer .segment-type-string>.segment-main>.segment-value{color:green}.ngx-json-viewer .segment-type-number>.segment-main>.segment-value{color:#00f}.ngx-json-viewer .segment-type-boolean>.segment-main>.segment-value{color:red}.ngx-json-viewer .segment-type-date>.segment-main>.segment-value{color:#05668d}.ngx-json-viewer .segment-type-array>.segment-main>.segment-value,.ngx-json-viewer .segment-type-function>.segment-main>.segment-value,.ngx-json-viewer .segment-type-object>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-null>.segment-main>.segment-value,.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-key{color:#999}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{background-color:#999}.ngx-json-viewer .segment-type-array>.segment-main,.ngx-json-viewer .segment-type-object>.segment-main{white-space:nowrap}.ngx-json-viewer .expanded>.toggler:after{transform:rotate(90deg)}.ngx-json-viewer .expandable>.segment-value{display:inline-block;vertical-align:bottom;text-overflow:ellipsis;overflow:hidden}.ngx-json-viewer .expandable,.ngx-json-viewer .expandable>.toggler{cursor:pointer}"]
            },] }
];
NgxJsonViewerComponent.propDecorators = {
    json: [{ type: Input }],
    expanded: [{ type: Input }],
    depth: [{ type: Input }],
    restoreExpanded: [{ type: Input }],
    showTypeHeadings: [{ type: Input }],
    _length: [{ type: Input }],
    _key: [{ type: Input }],
    _previouslyOpenKeys: [{ type: Input }],
    _currentDepth: [{ type: Input }],
    childrenComponents: [{ type: ViewChildren, args: [NgxJsonViewerComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9uZ3gtanNvbi12aWV3ZXIvbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFhLEtBQUssRUFBRSxZQUFZLEVBQVksTUFBTSxlQUFlLENBQUM7QUFlbkYsTUFBTSxPQUFPLHNCQUFzQjtJQUxuQztRQU9rQixhQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLFVBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNYLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQUV6Qyx1REFBdUQ7UUFDdkMsWUFBTyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2IsU0FBSSxHQUFHLFFBQVEsQ0FBQztRQUVoQixrQkFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTVCLGlCQUFZLEdBQXlCLEVBQUUsQ0FBQztRQUN4QyxhQUFRLEdBQWUsRUFBRSxDQUFDO1FBRWpDLDBDQUEwQztRQUNsQyxvQkFBZSxHQUFHLFNBQVMsQ0FBQztJQTRLdEMsQ0FBQztJQXZLUyxvQkFBb0I7UUFDMUIsTUFBTSxRQUFRLEdBQXlCLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUU7WUFDNUMsc0JBQXNCO1lBQ3RCLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsU0FBUyxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN0QyxPQUFPO1NBQ1I7UUFDRCxPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRU8sWUFBWTtR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Q2hpbGRyZW4sIFF1ZXJ5TGlzdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElTZWdtZW50IHtcclxuICBrZXk6IHN0cmluZztcclxuICB2YWx1ZTogYW55O1xyXG4gIHR5cGU6IHVuZGVmaW5lZCB8IHN0cmluZztcclxuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xyXG4gIGV4cGFuZGVkOiBib29sZWFuO1xyXG59XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1qc29uLXZpZXdlcicsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL25neC1qc29uLXZpZXdlci5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5zY3NzJ10sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBOZ3hKc29uVmlld2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcclxuICBASW5wdXQoKSBwdWJsaWMganNvbjogYW55O1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBleHBhbmRlZCA9IHRydWU7XHJcbiAgQElucHV0KCkgcHVibGljIGRlcHRoID0gLTE7XHJcbiAgQElucHV0KCkgcHVibGljIHJlc3RvcmVFeHBhbmRlZCA9IGZhbHNlO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93VHlwZUhlYWRpbmdzID0gZmFsc2U7XHJcblxyXG4gIC8vIFRyYWNrcyB0aGUgbGVuZ3RoIG9mIGFycmF5IHR5cGVzLiAtMSBmb3Igb3RoZXIgdHlwZXNcclxuICBASW5wdXQoKSBwdWJsaWMgX2xlbmd0aCA9IC0xO1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBfa2V5ID0gJ09iamVjdCc7XHJcbiAgQElucHV0KCkgcHVibGljIF9wcmV2aW91c2x5T3BlbktleXM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcclxuICBASW5wdXQoKSBwdWJsaWMgX2N1cnJlbnREZXB0aCA9IC0xO1xyXG5cclxuICBwdWJsaWMgbmV4dE9wZW5LZXlzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xyXG4gIHB1YmxpYyBzZWdtZW50czogSVNlZ21lbnRbXSA9IFtdO1xyXG5cclxuICAvLyBNYXRjaGVzIHRoZSBsYXN0IHVuZGVyc2NvcmUgaW4gYSBzdHJpbmdcclxuICBwcml2YXRlIHVuZGVyc2NvcmVSZWdleCA9IC9fW15fXSskLztcclxuXHJcbiAgQFZpZXdDaGlsZHJlbihOZ3hKc29uVmlld2VyQ29tcG9uZW50KVxyXG4gIHB1YmxpYyBjaGlsZHJlbkNvbXBvbmVudHM6IFF1ZXJ5TGlzdDxOZ3hKc29uVmlld2VyQ29tcG9uZW50PjtcclxuXHJcbiAgcHJpdmF0ZSBnZXRPcGVuS2V5c1JlY3Vyc2l2ZSgpOiBhbnkge1xyXG4gICAgY29uc3Qgb3BlbktleXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XHJcbiAgICB0aGlzLmNoaWxkcmVuQ29tcG9uZW50cy5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcclxuICAgICAgLy8gU2F2ZSBrZXkgYW5kIGxlbmd0aFxyXG4gICAgICBvcGVuS2V5c1tjb21wb25lbnQuX2tleV0gPSBjb21wb25lbnQuZ2V0T3BlbktleXNSZWN1cnNpdmUoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGlmIChPYmplY3Qua2V5cyhvcGVuS2V5cykubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHJldHVybiBvcGVuS2V5cztcclxuICB9XHJcblxyXG4gIHByaXZhdGUgb3BlblNlZ21lbnRzKCk6IHZvaWQge1xyXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuX3ByZXZpb3VzbHlPcGVuS2V5cyEpO1xyXG4gICAga2V5cy5mb3JFYWNoKChrZXkpID0+IHtcclxuICAgICAgLy8gQ2hlY2sgdG8gc2VlIGlmIHRoZSBrZXkgZXhpc3RzLCBpZiBzbyBleHBhbmRzIGl0XHJcbiAgICAgIGNvbnN0IHN0cmlwcGVkS2V5ID0ga2V5LnJlcGxhY2UodGhpcy51bmRlcnNjb3JlUmVnZXgsICcnKTtcclxuICAgICAgY29uc3QgZm91bmRTZWdtZW50ID0gdGhpcy5zZWdtZW50cy5maW5kKChzZWdtZW50KSA9PiBzZWdtZW50LmtleSA9PT0gc3RyaXBwZWRLZXkpO1xyXG5cclxuICAgICAgaWYgKCFmb3VuZFNlZ21lbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdGhpcy5pc0V4cGFuZGFibGUoZm91bmRTZWdtZW50KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm91bmRTZWdtZW50LmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xyXG4gICAgLy8gU2F2ZSBvcGVuIGtleXMgc3RydWN0dXJlIGJlZm9yZSBwcm9jZXNzaW5nIG5ldyBqc29uXHJcbiAgICAvLyBXaWxsIG9ubHkgcnVuIGluIHRvcCBsZXZlbFxyXG4gICAgaWYgKHRoaXMucmVzdG9yZUV4cGFuZGVkICYmIHRoaXMuY2hpbGRyZW5Db21wb25lbnRzKSB7XHJcbiAgICAgIHRoaXMuX3ByZXZpb3VzbHlPcGVuS2V5cyA9IHRoaXMuZ2V0T3BlbktleXNSZWN1cnNpdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlZ21lbnRzID0gW107XHJcblxyXG4gICAgLy8gcmVtb3ZlIGN5Y2xlc1xyXG4gICAgdGhpcy5qc29uID0gdGhpcy5kZWN5Y2xlKHRoaXMuanNvbik7XHJcblxyXG4gICAgdGhpcy5fY3VycmVudERlcHRoKys7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmpzb24gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuanNvbikuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShrZXksIHRoaXMuanNvbltrZXldKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShgKCR7dHlwZW9mIHRoaXMuanNvbn0pYCwgdGhpcy5qc29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9wcmV2aW91c2x5T3BlbktleXMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5vcGVuU2VnbWVudHMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0V4cGFuZGFibGUoc2VnbWVudDogSVNlZ21lbnQpOiBhbnkge1xyXG4gICAgcmV0dXJuIHNlZ21lbnQudHlwZSA9PT0gJ29iamVjdCcgfHwgc2VnbWVudC50eXBlID09PSAnYXJyYXknO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvZ2dsZShzZWdtZW50OiBJU2VnbWVudCk6IGFueSB7XHJcbiAgICBpZiAodGhpcy5pc0V4cGFuZGFibGUoc2VnbWVudCkpIHtcclxuICAgICAgc2VnbWVudC5leHBhbmRlZCA9ICFzZWdtZW50LmV4cGFuZGVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXJzZUtleVZhbHVlKGtleTogYW55LCB2YWx1ZTogYW55KTogSVNlZ21lbnQge1xyXG4gICAgY29uc3Qgc2VnbWVudDogSVNlZ21lbnQgPSB7XHJcbiAgICAgIGtleToga2V5LFxyXG4gICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcclxuICAgICAgZGVzY3JpcHRpb246ICcnICsgdmFsdWUsXHJcbiAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoKSxcclxuICAgIH07XHJcblxyXG4gICAgc3dpdGNoICh0eXBlb2Ygc2VnbWVudC52YWx1ZSkge1xyXG4gICAgICBjYXNlICdudW1iZXInOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ251bWJlcic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnYm9vbGVhbic6IHtcclxuICAgICAgICBzZWdtZW50LnR5cGUgPSAnYm9vbGVhbic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnZnVuY3Rpb24nOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdzdHJpbmcnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3N0cmluZyc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICdcIicgKyBzZWdtZW50LnZhbHVlICsgJ1wiJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICd1bmRlZmluZWQnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3VuZGVmaW5lZCc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICd1bmRlZmluZWQnO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ29iamVjdCc6IHtcclxuICAgICAgICAvLyB5ZWEsIG51bGwgaXMgb2JqZWN0XHJcbiAgICAgICAgaWYgKHNlZ21lbnQudmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgIHNlZ21lbnQudHlwZSA9ICdudWxsJztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnbnVsbCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlZ21lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnYXJyYXknO1xyXG4gICAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9XHJcbiAgICAgICAgICAgICdBcnJheVsnICsgc2VnbWVudC52YWx1ZS5sZW5ndGggKyAnXSAnICsgSlNPTi5zdHJpbmdpZnkoc2VnbWVudC52YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWdtZW50LnZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgc2VnbWVudC50eXBlID0gJ2RhdGUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnb2JqZWN0JztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnT2JqZWN0ICcgKyBKU09OLnN0cmluZ2lmeShzZWdtZW50LnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VnbWVudDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNFeHBhbmRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmV4cGFuZGVkICYmICEodGhpcy5kZXB0aCA+IC0xICYmIHRoaXMuX2N1cnJlbnREZXB0aCA+PSB0aGlzLmRlcHRoKTtcclxuICB9XHJcblxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb3VnbGFzY3JvY2tmb3JkL0pTT04tanMvYmxvYi9tYXN0ZXIvY3ljbGUuanNcclxuICBwcml2YXRlIGRlY3ljbGUob2JqZWN0OiBhbnkpOiBhbnkge1xyXG4gICAgY29uc3Qgb2JqZWN0cyA9IG5ldyBXZWFrTWFwKCk7XHJcbiAgICByZXR1cm4gKGZ1bmN0aW9uIGRlcmV6KHZhbHVlOiBhbnksIHBhdGg6IGFueSk6IGFueSB7XHJcbiAgICAgIGxldCBvbGRQYXRoO1xyXG4gICAgICBsZXQgbnU6IGFueTtcclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXHJcbiAgICAgICAgdmFsdWUgIT09IG51bGwgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbikgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyKSAmJlxyXG4gICAgICAgICEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApICYmXHJcbiAgICAgICAgISh2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZylcclxuICAgICAgKSB7XHJcbiAgICAgICAgb2xkUGF0aCA9IG9iamVjdHMuZ2V0KHZhbHVlKTtcclxuICAgICAgICBpZiAob2xkUGF0aCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXR1cm4geyRyZWY6IG9sZFBhdGh9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBvYmplY3RzLnNldCh2YWx1ZSwgcGF0aCk7XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgbnUgPSBbXTtcclxuICAgICAgICAgIHZhbHVlLmZvckVhY2goKGVsZW1lbnQsIGkpID0+IHtcclxuICAgICAgICAgICAgbnVbaV0gPSBkZXJleihlbGVtZW50LCBwYXRoICsgJ1snICsgaSArICddJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbnUgPSB7fTtcclxuICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIG51W25hbWVdID0gZGVyZXoodmFsdWVbbmFtZV0sIHBhdGggKyAnWycgKyBKU09OLnN0cmluZ2lmeShuYW1lKSArICddJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0pKG9iamVjdCwgJyQnKTtcclxuICB9XHJcbn1cclxuIl19