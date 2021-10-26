import { Component, Input, ViewChildren } from '@angular/core';
export class NgxJsonViewerComponent {
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
}
NgxJsonViewerComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-json-viewer',
                template: "<section class=\"ngx-json-viewer\">\r\n  <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\r\n    <section\r\n      (click)=\"toggle(segment)\"\r\n      [ngClass]=\"{\r\n        'segment-main': true,\r\n        expandable: isExpandable(segment),\r\n        expanded: segment.expanded\r\n      }\"\r\n    >\r\n      <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\r\n      <span class=\"segment-key\">{{ segment.key }}</span>\r\n      <span class=\"segment-separator\">: </span>\r\n      <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\r\n        segment.description\r\n      }}</span>\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\r\n        class=\"segment-value\"\r\n        >Array[{{ segment.value.length }}]</span\r\n      >\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\r\n        class=\"segment-value\"\r\n        >Object</span\r\n      >\r\n    </section>\r\n    <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\r\n      <ngx-json-viewer\r\n        [json]=\"segment.value\"\r\n        [expanded]=\"expanded\"\r\n        [depth]=\"depth\"\r\n        [_currentDepth]=\"_currentDepth\"\r\n        [key]=\"segment.key\"\r\n        [length]=\"segment.type === 'array' ? segment.value.length : -1\"\r\n        [_previouslyOpenKeys]=\"\r\n          _previouslyOpenKeys &&\r\n          _previouslyOpenKeys[\r\n            segment.type === 'array'\r\n              ? segment.key + '_' + segment.value.length\r\n              : segment.key + '_-1'\r\n          ]\r\n        \"\r\n      ></ngx-json-viewer>\r\n    </section>\r\n  </section>\r\n</section>\r\n",
                styles: ["@charset \"UTF-8\";.ngx-json-viewer{font-family:monospace;font-size:1em;width:100%;height:100%;overflow:hidden;position:relative}.ngx-json-viewer .segment{padding:0;margin:0 0 1px 12px}.ngx-json-viewer .segment .segment-main{word-wrap:break-word}.ngx-json-viewer .segment .segment-main .toggler{position:absolute;margin-left:-14px;margin-top:3px;font-size:.8em;line-height:1.2em;vertical-align:middle;color:#787878}.ngx-json-viewer .segment .segment-main .toggler:after{display:inline-block;content:\"\u25BA\";transition:transform .1s ease-in}.ngx-json-viewer .segment .segment-main .segment-key{color:#00008b;word-wrap:break-word;white-space:pre-line}.ngx-json-viewer .segment .segment-main .segment-separator{color:#00008b}.ngx-json-viewer .segment .segment-main .segment-value{color:#000}.ngx-json-viewer .segment .children{margin-left:4px}.ngx-json-viewer .segment-type-string>.segment-main>.segment-value{color:green}.ngx-json-viewer .segment-type-number>.segment-main>.segment-value{color:#00f}.ngx-json-viewer .segment-type-boolean>.segment-main>.segment-value{color:red}.ngx-json-viewer .segment-type-date>.segment-main>.segment-value{color:#05668d}.ngx-json-viewer .segment-type-array>.segment-main>.segment-value,.ngx-json-viewer .segment-type-function>.segment-main>.segment-value,.ngx-json-viewer .segment-type-object>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-null>.segment-main>.segment-value,.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-key{color:#999}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{background-color:#999}.ngx-json-viewer .segment-type-array>.segment-main,.ngx-json-viewer .segment-type-object>.segment-main{white-space:nowrap}.ngx-json-viewer .expanded>.toggler:after{transform:rotate(90deg)}.ngx-json-viewer .expandable>.segment-value{display:inline-block;vertical-align:bottom;text-overflow:ellipsis;overflow:hidden}.ngx-json-viewer .expandable,.ngx-json-viewer .expandable>.toggler{cursor:pointer}"]
            },] }
];
NgxJsonViewerComponent.propDecorators = {
    json: [{ type: Input }],
    expanded: [{ type: Input }],
    depth: [{ type: Input }],
    key: [{ type: Input }],
    length: [{ type: Input }],
    restoreExpanded: [{ type: Input }],
    showTypeHeadings: [{ type: Input }],
    _currentDepth: [{ type: Input }],
    _previouslyOpenKeys: [{ type: Input }],
    childrenComponents: [{ type: ViewChildren, args: [NgxJsonViewerComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9uZ3gtanNvbi12aWV3ZXIvbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFhLEtBQUssRUFBRSxZQUFZLEVBQVksTUFBTSxlQUFlLENBQUM7QUFlbkYsTUFBTSxPQUFPLHNCQUFzQjtJQUxuQztRQU9rQixhQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLFVBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNYLFFBQUcsR0FBRyxRQUFRLENBQUM7UUFDL0IsdURBQXVEO1FBQ3ZDLFdBQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNaLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBRXhCLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQUV6QixrQkFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRzVCLGlCQUFZLEdBQXlCLEVBQUUsQ0FBQztRQUN4QyxhQUFRLEdBQWUsRUFBRSxDQUFDO1FBRWpDLDBDQUEwQztRQUNsQyxvQkFBZSxHQUFHLFNBQVMsQ0FBQztJQWlMdEMsQ0FBQztJQTNLUyxvQkFBb0I7UUFDMUIsTUFBTSxRQUFRLEdBQXlCLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBaUMsRUFBRSxFQUFFO1lBQ3BFLDRFQUE0RTtZQUM1RSwrQkFBK0I7WUFDL0IsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUN0RixDQUFDLENBQUMsQ0FBQztRQUVILElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RDLE9BQU87U0FD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QUFLO2tDQUNMLEtBQUs7aUNBUUwsWUFBWSxTQUFDLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBPbkNoYW5nZXMsIElucHV0LCBWaWV3Q2hpbGRyZW4sIFF1ZXJ5TGlzdH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIElTZWdtZW50IHtcclxuICBrZXk6IHN0cmluZztcclxuICB2YWx1ZTogYW55O1xyXG4gIHR5cGU6IHVuZGVmaW5lZCB8IHN0cmluZztcclxuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xyXG4gIGV4cGFuZGVkOiBib29sZWFuO1xyXG59XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ25neC1qc29uLXZpZXdlcicsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL25neC1qc29uLXZpZXdlci5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5zY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIE5neEpzb25WaWV3ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBqc29uOiBhbnk7XHJcbiAgQElucHV0KCkgcHVibGljIGV4cGFuZGVkID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZGVwdGggPSAtMTtcclxuICBASW5wdXQoKSBwdWJsaWMga2V5ID0gJ09iamVjdCc7XHJcbiAgLy8gVHJhY2tzIHRoZSBsZW5ndGggb2YgYXJyYXkgdHlwZXMuIC0xIGZvciBvdGhlciB0eXBlc1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBsZW5ndGggPSAtMTtcclxuICBASW5wdXQoKSBwdWJsaWMgcmVzdG9yZUV4cGFuZGVkID0gZmFsc2U7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93VHlwZUhlYWRpbmdzID0gZmFsc2U7XHJcblxyXG4gIEBJbnB1dCgpIHB1YmxpYyBfY3VycmVudERlcHRoID0gLTE7XHJcbiAgQElucHV0KCkgcHVibGljIF9wcmV2aW91c2x5T3BlbktleXM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcclxuXHJcbiAgcHVibGljIG5leHRPcGVuS2V5czoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcclxuICBwdWJsaWMgc2VnbWVudHM6IElTZWdtZW50W10gPSBbXTtcclxuXHJcbiAgLy8gTWF0Y2hlcyB0aGUgbGFzdCB1bmRlcnNjb3JlIGluIGEgc3RyaW5nXHJcbiAgcHJpdmF0ZSB1bmRlcnNjb3JlUmVnZXggPSAvX1teX10rJC87XHJcblxyXG4gIEBWaWV3Q2hpbGRyZW4oTmd4SnNvblZpZXdlckNvbXBvbmVudCkgcHVibGljIGNoaWxkcmVuQ29tcG9uZW50czogUXVlcnlMaXN0PFxyXG4gIE5neEpzb25WaWV3ZXJDb21wb25lbnRcclxuICA+O1xyXG5cclxuICBwcml2YXRlIGdldE9wZW5LZXlzUmVjdXJzaXZlKCk6IGFueSB7XHJcbiAgICBjb25zdCBvcGVuS2V5czoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcclxuICAgIHRoaXMuY2hpbGRyZW5Db21wb25lbnRzLmZvckVhY2goKGNvbXBvbmVudDogTmd4SnNvblZpZXdlckNvbXBvbmVudCkgPT4ge1xyXG4gICAgICAvLyBTYXZlIGtleSBhbmQgbGVuZ3RoIC0gb24gcmVsb2FkIGFycmF5IGVsZW1lbnRzIHNob3VsZCBvbmx5IGJlIHJlb3BlbmVkIGlmXHJcbiAgICAgIC8vIHRoZSBhcnJheSBpcyB0aGUgc2FtZSBsZW5ndGhcclxuICAgICAgb3BlbktleXNbY29tcG9uZW50LmtleSArICdfJyArIGNvbXBvbmVudC5sZW5ndGhdID0gY29tcG9uZW50LmdldE9wZW5LZXlzUmVjdXJzaXZlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoT2JqZWN0LmtleXMob3BlbktleXMpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3BlbktleXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9wZW5TZWdtZW50cygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9wcmV2aW91c2x5T3BlbktleXMhKTtcclxuICAgIGtleXMuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIGtleSBleGlzdHMsIGlmIHNvIGV4cGFuZHMgaXRcclxuICAgICAgY29uc3Qgc3RyaXBwZWRLZXkgPSBrZXkucmVwbGFjZSh0aGlzLnVuZGVyc2NvcmVSZWdleCwgJycpO1xyXG4gICAgICBjb25zdCBmb3VuZFNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzLmZpbmQoc2VnbWVudCA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHNlZ21lbnQua2V5ID09PSBzdHJpcHBlZEtleTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAoIWZvdW5kU2VnbWVudCkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF0aGlzLmlzRXhwYW5kYWJsZShmb3VuZFNlZ21lbnQpKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3VuZFNlZ21lbnQuZXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgbmdPbkNoYW5nZXMoKTogdm9pZCB7XHJcbiAgICAvLyBTYXZlIG9wZW4ga2V5cyBzdHJ1Y3R1cmUgYmVmb3JlIHByb2Nlc3NpbmcgbmV3IGpzb25cclxuICAgIC8vIFdpbGwgb25seSBydW4gaW4gdG9wIGxldmVsXHJcbiAgICBpZiAodGhpcy5yZXN0b3JlRXhwYW5kZWQgJiYgdGhpcy5jaGlsZHJlbkNvbXBvbmVudHMpIHtcclxuICAgICAgdGhpcy5fcHJldmlvdXNseU9wZW5LZXlzID0gdGhpcy5nZXRPcGVuS2V5c1JlY3Vyc2l2ZSgpO1xyXG4gICAgICBjb25zb2xlLmxvZyh0aGlzLl9wcmV2aW91c2x5T3BlbktleXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VnbWVudHMgPSBbXTtcclxuXHJcbiAgICAvLyByZW1vdmUgY3ljbGVzXHJcbiAgICB0aGlzLmpzb24gPSB0aGlzLmRlY3ljbGUodGhpcy5qc29uKTtcclxuXHJcbiAgICB0aGlzLl9jdXJyZW50RGVwdGgrKztcclxuXHJcbiAgICBpZiAodHlwZW9mIHRoaXMuanNvbiA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgT2JqZWN0LmtleXModGhpcy5qc29uKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShrZXksIHRoaXMuanNvbltrZXldKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShgKCR7dHlwZW9mIHRoaXMuanNvbn0pYCwgdGhpcy5qc29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9wcmV2aW91c2x5T3BlbktleXMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5vcGVuU2VnbWVudHMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0V4cGFuZGFibGUoc2VnbWVudDogSVNlZ21lbnQpOiBhbnkge1xyXG4gICAgcmV0dXJuIHNlZ21lbnQudHlwZSA9PT0gJ29iamVjdCcgfHwgc2VnbWVudC50eXBlID09PSAnYXJyYXknO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvZ2dsZShzZWdtZW50OiBJU2VnbWVudCk6IGFueSB7XHJcbiAgICBpZiAodGhpcy5pc0V4cGFuZGFibGUoc2VnbWVudCkpIHtcclxuICAgICAgc2VnbWVudC5leHBhbmRlZCA9ICFzZWdtZW50LmV4cGFuZGVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXJzZUtleVZhbHVlKGtleTogYW55LCB2YWx1ZTogYW55KTogSVNlZ21lbnQge1xyXG4gICAgY29uc3Qgc2VnbWVudDogSVNlZ21lbnQgPSB7XHJcbiAgICAgIGtleToga2V5LFxyXG4gICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcclxuICAgICAgZGVzY3JpcHRpb246ICcnICsgdmFsdWUsXHJcbiAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoKSxcclxuICAgIH07XHJcblxyXG4gICAgc3dpdGNoICh0eXBlb2Ygc2VnbWVudC52YWx1ZSkge1xyXG4gICAgICBjYXNlICdudW1iZXInOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ251bWJlcic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnYm9vbGVhbic6IHtcclxuICAgICAgICBzZWdtZW50LnR5cGUgPSAnYm9vbGVhbic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnZnVuY3Rpb24nOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdzdHJpbmcnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3N0cmluZyc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICdcIicgKyBzZWdtZW50LnZhbHVlICsgJ1wiJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICd1bmRlZmluZWQnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3VuZGVmaW5lZCc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICd1bmRlZmluZWQnO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ29iamVjdCc6IHtcclxuICAgICAgICAvLyB5ZWEsIG51bGwgaXMgb2JqZWN0XHJcbiAgICAgICAgaWYgKHNlZ21lbnQudmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgIHNlZ21lbnQudHlwZSA9ICdudWxsJztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnbnVsbCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlZ21lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnYXJyYXknO1xyXG4gICAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9XHJcbiAgICAgICAgICAgICdBcnJheVsnICsgc2VnbWVudC52YWx1ZS5sZW5ndGggKyAnXSAnICsgSlNPTi5zdHJpbmdpZnkoc2VnbWVudC52YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWdtZW50LnZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgc2VnbWVudC50eXBlID0gJ2RhdGUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnb2JqZWN0JztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnT2JqZWN0ICcgKyBKU09OLnN0cmluZ2lmeShzZWdtZW50LnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VnbWVudDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNFeHBhbmRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmV4cGFuZGVkICYmICEodGhpcy5kZXB0aCA+IC0xICYmIHRoaXMuX2N1cnJlbnREZXB0aCA+PSB0aGlzLmRlcHRoKTtcclxuICB9XHJcblxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb3VnbGFzY3JvY2tmb3JkL0pTT04tanMvYmxvYi9tYXN0ZXIvY3ljbGUuanNcclxuICBwcml2YXRlIGRlY3ljbGUob2JqZWN0OiBhbnkpOiBhbnkge1xyXG4gICAgY29uc3Qgb2JqZWN0cyA9IG5ldyBXZWFrTWFwKCk7XHJcbiAgICByZXR1cm4gKGZ1bmN0aW9uIGRlcmV6KHZhbHVlOiBhbnksIHBhdGg6IGFueSk6IGFueSB7XHJcbiAgICAgIGxldCBvbGRQYXRoO1xyXG4gICAgICBsZXQgbnU6IGFueTtcclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXHJcbiAgICAgICAgdmFsdWUgIT09IG51bGwgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbikgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyKSAmJlxyXG4gICAgICAgICEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApICYmXHJcbiAgICAgICAgISh2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZylcclxuICAgICAgKSB7XHJcbiAgICAgICAgb2xkUGF0aCA9IG9iamVjdHMuZ2V0KHZhbHVlKTtcclxuICAgICAgICBpZiAob2xkUGF0aCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXR1cm4geyRyZWY6IG9sZFBhdGh9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBvYmplY3RzLnNldCh2YWx1ZSwgcGF0aCk7XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgbnUgPSBbXTtcclxuICAgICAgICAgIHZhbHVlLmZvckVhY2goKGVsZW1lbnQsIGkpID0+IHtcclxuICAgICAgICAgICAgbnVbaV0gPSBkZXJleihlbGVtZW50LCBwYXRoICsgJ1snICsgaSArICddJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbnUgPSB7fTtcclxuICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKG5hbWUgPT4ge1xyXG4gICAgICAgICAgICBudVtuYW1lXSA9IGRlcmV6KHZhbHVlW25hbWVdLCBwYXRoICsgJ1snICsgSlNPTi5zdHJpbmdpZnkobmFtZSkgKyAnXScpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9KShvYmplY3QsICckJyk7XHJcbiAgfVxyXG59XHJcbiJdfQ==