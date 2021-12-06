import { Component, Input, ViewChildren } from '@angular/core';
export class NgxJsonViewerComponent {
    constructor() {
        this.expanded = true;
        this.depth = -1;
        this.restoreExpanded = false;
        this.showTypeHeadings = false;
        this._currentDepth = -1;
        this.nextOpenKeys = {};
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
NgxJsonViewerComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-json-viewer',
                template: "<section class=\"ngx-json-viewer\">\r\n  <section *ngFor=\"let segment of segments\" [ngClass]=\"['segment', 'segment-type-' + segment.type]\">\r\n    <section\r\n      (click)=\"toggle(segment)\"\r\n      [ngClass]=\"{\r\n        'segment-main': true,\r\n        expandable: isExpandable(segment),\r\n        expanded: segment.expanded\r\n      }\"\r\n    >\r\n      <div *ngIf=\"isExpandable(segment)\" class=\"toggler\"></div>\r\n      <span class=\"segment-key\">{{ segment.key }}</span>\r\n      <span class=\"segment-separator\">: </span>\r\n      <span *ngIf=\"!segment.expanded || !isExpandable(segment)\" class=\"segment-value\">{{\r\n        segment.description\r\n      }}</span>\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'array'\"\r\n        class=\"segment-value\"\r\n        >Array[{{ segment.value.length }}]</span\r\n      >\r\n      <span\r\n        *ngIf=\"showTypeHeadings && segment.expanded && segment.type == 'object'\"\r\n        class=\"segment-value\"\r\n        >Object</span\r\n      >\r\n    </section>\r\n    <section *ngIf=\"segment.expanded && isExpandable(segment)\" class=\"children\">\r\n      <ngx-json-viewer\r\n        [json]=\"segment.value\"\r\n        [expanded]=\"expanded\"\r\n        [depth]=\"depth\"\r\n        [_key]=\"segment.key\"\r\n        [_currentDepth]=\"_currentDepth\"\r\n        [_previouslyOpenKeys]=\"_previouslyOpenKeys && _previouslyOpenKeys[segment.key]\"\r\n      ></ngx-json-viewer>\r\n    </section>\r\n  </section>\r\n</section>\r\n",
                styles: ["@charset \"UTF-8\";.ngx-json-viewer{font-family:monospace;font-size:1em;width:100%;height:100%;overflow:hidden;position:relative}.ngx-json-viewer .segment{padding:0;margin:0 0 1px 12px}.ngx-json-viewer .segment .segment-main{word-wrap:break-word}.ngx-json-viewer .segment .segment-main .toggler{position:absolute;margin-left:-14px;margin-top:3px;font-size:.8em;line-height:1.2em;vertical-align:middle;color:#787878}.ngx-json-viewer .segment .segment-main .toggler:after{display:inline-block;content:\"\u25BA\";transition:transform .1s ease-in}.ngx-json-viewer .segment .segment-main .segment-key{color:#00008b;word-wrap:break-word;white-space:pre-line}.ngx-json-viewer .segment .segment-main .segment-separator{color:#00008b}.ngx-json-viewer .segment .segment-main .segment-value{color:#000}.ngx-json-viewer .segment .children{margin-left:4px}.ngx-json-viewer .segment-type-string>.segment-main>.segment-value{color:green}.ngx-json-viewer .segment-type-number>.segment-main>.segment-value{color:#00f}.ngx-json-viewer .segment-type-boolean>.segment-main>.segment-value{color:red}.ngx-json-viewer .segment-type-date>.segment-main>.segment-value{color:#05668d}.ngx-json-viewer .segment-type-array>.segment-main>.segment-value,.ngx-json-viewer .segment-type-function>.segment-main>.segment-value,.ngx-json-viewer .segment-type-object>.segment-main>.segment-value{color:#999}.ngx-json-viewer .segment-type-null>.segment-main>.segment-value,.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{color:#855a00}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-key{color:#999}.ngx-json-viewer .segment-type-undefined>.segment-main>.segment-value{background-color:#999}.ngx-json-viewer .segment-type-array>.segment-main,.ngx-json-viewer .segment-type-object>.segment-main{white-space:nowrap}.ngx-json-viewer .expanded>.toggler:after{transform:rotate(90deg)}.ngx-json-viewer .expandable>.segment-value{display:inline-block;vertical-align:bottom;text-overflow:ellipsis;overflow:hidden}.ngx-json-viewer .expandable,.ngx-json-viewer .expandable>.toggler{cursor:pointer}"]
            },] }
];
NgxJsonViewerComponent.propDecorators = {
    json: [{ type: Input }],
    expanded: [{ type: Input }],
    depth: [{ type: Input }],
    restoreExpanded: [{ type: Input }],
    showTypeHeadings: [{ type: Input }],
    _key: [{ type: Input }],
    _previouslyOpenKeys: [{ type: Input }],
    _currentDepth: [{ type: Input }],
    childrenComponents: [{ type: ViewChildren, args: [NgxJsonViewerComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9uZ3gtanNvbi12aWV3ZXIvbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUMsU0FBUyxFQUFhLEtBQUssRUFBRSxZQUFZLEVBQVksTUFBTSxlQUFlLENBQUM7QUFlbkYsTUFBTSxPQUFPLHNCQUFzQjtJQUxuQztRQU9rQixhQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLFVBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNYLG9CQUFlLEdBQUcsS0FBSyxDQUFDO1FBQ3hCLHFCQUFnQixHQUFHLEtBQUssQ0FBQztRQUl6QixrQkFBYSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRTVCLGlCQUFZLEdBQXlCLEVBQUUsQ0FBQztRQUN4QyxhQUFRLEdBQWUsRUFBRSxDQUFDO0lBMktuQyxDQUFDO0lBdEtTLG9CQUFvQjtRQUMxQixNQUFNLFFBQVEsR0FBeUIsRUFBRSxDQUFDO1FBQzFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsRUFBRTtZQUM1QyxzQkFBc0I7WUFDdEIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ3RDLE9BQU87U0FDUjtRQUNELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7SUFFTyxZQUFZO1FBQ2xCLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFvQixDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxF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QUFHLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUM7b0JBQy9DLENBQUMsQ0FBQyxDQUFDO2lCQUNKO3FCQUFNO29CQUNMLEVBQUUsR0FBRyxFQUFFLENBQUM7b0JBQ1IsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTt3QkFDbEMsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO29CQUN6RSxDQUFDLENBQUMsQ0FBQztpQkFDSjtnQkFDRCxPQUFPLEVBQUUsQ0FBQzthQUNYO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDZixDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEIsQ0FBQzs7O1lBM0xGLFNBQVMsU0FBQztnQkFDVCxRQUFRLEVBQUUsaUJBQWlCO2dCQUMzQixxaERBQStDOzthQUVoRDs7O21CQUVFLEtBQUs7dUJBQ0wsS0FBSztvQkFDTCxLQUFLOzhCQUNMLEtBQUs7K0JBQ0wsS0FBSzttQkFFTCxLQUFLO2tDQUNMLEtBQUs7NEJBQ0wsS0FBSztpQ0FLTCxZQUFZLFNBQUMsc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIE9uQ2hhbmdlcywgSW5wdXQsIFZpZXdDaGlsZHJlbiwgUXVlcnlMaXN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgSVNlZ21lbnQge1xyXG4gIGtleTogc3RyaW5nO1xyXG4gIHZhbHVlOiBhbnk7XHJcbiAgdHlwZTogdW5kZWZpbmVkIHwgc3RyaW5nO1xyXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmc7XHJcbiAgZXhwYW5kZWQ6IGJvb2xlYW47XHJcbn1cclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnbmd4LWpzb24tdmlld2VyJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vbmd4LWpzb24tdmlld2VyLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9uZ3gtanNvbi12aWV3ZXIuY29tcG9uZW50LnNjc3MnXSxcclxufSlcclxuZXhwb3J0IGNsYXNzIE5neEpzb25WaWV3ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkNoYW5nZXMge1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBqc29uOiBhbnk7XHJcbiAgQElucHV0KCkgcHVibGljIGV4cGFuZGVkID0gdHJ1ZTtcclxuICBASW5wdXQoKSBwdWJsaWMgZGVwdGggPSAtMTtcclxuICBASW5wdXQoKSBwdWJsaWMgcmVzdG9yZUV4cGFuZGVkID0gZmFsc2U7XHJcbiAgQElucHV0KCkgcHVibGljIHNob3dUeXBlSGVhZGluZ3MgPSBmYWxzZTtcclxuXHJcbiAgQElucHV0KCkgcHVibGljIF9rZXk6IHN0cmluZztcclxuICBASW5wdXQoKSBwdWJsaWMgX3ByZXZpb3VzbHlPcGVuS2V5cz86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBfY3VycmVudERlcHRoID0gLTE7XHJcblxyXG4gIHB1YmxpYyBuZXh0T3BlbktleXM6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0ge307XHJcbiAgcHVibGljIHNlZ21lbnRzOiBJU2VnbWVudFtdID0gW107XHJcblxyXG4gIEBWaWV3Q2hpbGRyZW4oTmd4SnNvblZpZXdlckNvbXBvbmVudClcclxuICBwdWJsaWMgY2hpbGRyZW5Db21wb25lbnRzOiBRdWVyeUxpc3Q8Tmd4SnNvblZpZXdlckNvbXBvbmVudD47XHJcblxyXG4gIHByaXZhdGUgZ2V0T3BlbktleXNSZWN1cnNpdmUoKTogYW55IHtcclxuICAgIGNvbnN0IG9wZW5LZXlzOiB7W2tleTogc3RyaW5nXTogYW55fSA9IHt9O1xyXG4gICAgdGhpcy5jaGlsZHJlbkNvbXBvbmVudHMuZm9yRWFjaCgoY29tcG9uZW50KSA9PiB7XHJcbiAgICAgIC8vIFNhdmUga2V5IGFuZCBsZW5ndGhcclxuICAgICAgb3BlbktleXNbY29tcG9uZW50Ll9rZXldID0gY29tcG9uZW50LmdldE9wZW5LZXlzUmVjdXJzaXZlKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoT2JqZWN0LmtleXMob3BlbktleXMpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICByZXR1cm4gb3BlbktleXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIG9wZW5TZWdtZW50cygpOiB2b2lkIHtcclxuICAgIGNvbnN0IGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLl9wcmV2aW91c2x5T3BlbktleXMhKTtcclxuICAgIGtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgIC8vIENoZWNrIHRvIHNlZSBpZiB0aGUga2V5IGV4aXN0cywgaWYgc28gZXhwYW5kcyBpdFxyXG4gICAgICBjb25zdCBmb3VuZFNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzLmZpbmQoKHNlZ21lbnQpID0+IHNlZ21lbnQua2V5ID09PSBrZXkpO1xyXG5cclxuICAgICAgaWYgKCFmb3VuZFNlZ21lbnQpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghdGhpcy5pc0V4cGFuZGFibGUoZm91bmRTZWdtZW50KSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm91bmRTZWdtZW50LmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIG5nT25DaGFuZ2VzKCk6IHZvaWQge1xyXG4gICAgLy8gU2F2ZSBvcGVuIGtleXMgc3RydWN0dXJlIGJlZm9yZSBwcm9jZXNzaW5nIG5ldyBqc29uXHJcbiAgICAvLyBXaWxsIG9ubHkgcnVuIGluIHRvcCBsZXZlbFxyXG4gICAgaWYgKHRoaXMucmVzdG9yZUV4cGFuZGVkICYmIHRoaXMuY2hpbGRyZW5Db21wb25lbnRzKSB7XHJcbiAgICAgIHRoaXMuX3ByZXZpb3VzbHlPcGVuS2V5cyA9IHRoaXMuZ2V0T3BlbktleXNSZWN1cnNpdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNlZ21lbnRzID0gW107XHJcblxyXG4gICAgLy8gcmVtb3ZlIGN5Y2xlc1xyXG4gICAgdGhpcy5qc29uID0gdGhpcy5kZWN5Y2xlKHRoaXMuanNvbik7XHJcblxyXG4gICAgdGhpcy5fY3VycmVudERlcHRoKys7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB0aGlzLmpzb24gPT09ICdvYmplY3QnKSB7XHJcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMuanNvbikuZm9yRWFjaCgoa2V5KSA9PiB7XHJcbiAgICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShrZXksIHRoaXMuanNvbltrZXldKSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHRoaXMucGFyc2VLZXlWYWx1ZShgKCR7dHlwZW9mIHRoaXMuanNvbn0pYCwgdGhpcy5qc29uKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF0aGlzLl9wcmV2aW91c2x5T3BlbktleXMpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5vcGVuU2VnbWVudHMoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHB1YmxpYyBpc0V4cGFuZGFibGUoc2VnbWVudDogSVNlZ21lbnQpOiBhbnkge1xyXG4gICAgcmV0dXJuIHNlZ21lbnQudHlwZSA9PT0gJ29iamVjdCcgfHwgc2VnbWVudC50eXBlID09PSAnYXJyYXknO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHRvZ2dsZShzZWdtZW50OiBJU2VnbWVudCk6IGFueSB7XHJcbiAgICBpZiAodGhpcy5pc0V4cGFuZGFibGUoc2VnbWVudCkpIHtcclxuICAgICAgc2VnbWVudC5leHBhbmRlZCA9ICFzZWdtZW50LmV4cGFuZGVkO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwYXJzZUtleVZhbHVlKGtleTogYW55LCB2YWx1ZTogYW55KTogSVNlZ21lbnQge1xyXG4gICAgY29uc3Qgc2VnbWVudDogSVNlZ21lbnQgPSB7XHJcbiAgICAgIGtleToga2V5LFxyXG4gICAgICB2YWx1ZTogdmFsdWUsXHJcbiAgICAgIHR5cGU6IHVuZGVmaW5lZCxcclxuICAgICAgZGVzY3JpcHRpb246ICcnICsgdmFsdWUsXHJcbiAgICAgIGV4cGFuZGVkOiB0aGlzLmlzRXhwYW5kZWQoKSxcclxuICAgIH07XHJcblxyXG4gICAgc3dpdGNoICh0eXBlb2Ygc2VnbWVudC52YWx1ZSkge1xyXG4gICAgICBjYXNlICdudW1iZXInOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ251bWJlcic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnYm9vbGVhbic6IHtcclxuICAgICAgICBzZWdtZW50LnR5cGUgPSAnYm9vbGVhbic7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgY2FzZSAnZnVuY3Rpb24nOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ2Z1bmN0aW9uJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICdzdHJpbmcnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3N0cmluZyc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICdcIicgKyBzZWdtZW50LnZhbHVlICsgJ1wiJztcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBjYXNlICd1bmRlZmluZWQnOiB7XHJcbiAgICAgICAgc2VnbWVudC50eXBlID0gJ3VuZGVmaW5lZCc7XHJcbiAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9ICd1bmRlZmluZWQnO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIGNhc2UgJ29iamVjdCc6IHtcclxuICAgICAgICAvLyB5ZWEsIG51bGwgaXMgb2JqZWN0XHJcbiAgICAgICAgaWYgKHNlZ21lbnQudmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgIHNlZ21lbnQudHlwZSA9ICdudWxsJztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnbnVsbCc7XHJcbiAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHNlZ21lbnQudmFsdWUpKSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnYXJyYXknO1xyXG4gICAgICAgICAgc2VnbWVudC5kZXNjcmlwdGlvbiA9XHJcbiAgICAgICAgICAgICdBcnJheVsnICsgc2VnbWVudC52YWx1ZS5sZW5ndGggKyAnXSAnICsgSlNPTi5zdHJpbmdpZnkoc2VnbWVudC52YWx1ZSk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZWdtZW50LnZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xyXG4gICAgICAgICAgc2VnbWVudC50eXBlID0gJ2RhdGUnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWdtZW50LnR5cGUgPSAnb2JqZWN0JztcclxuICAgICAgICAgIHNlZ21lbnQuZGVzY3JpcHRpb24gPSAnT2JqZWN0ICcgKyBKU09OLnN0cmluZ2lmeShzZWdtZW50LnZhbHVlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2VnbWVudDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgaXNFeHBhbmRlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0aGlzLmV4cGFuZGVkICYmICEodGhpcy5kZXB0aCA+IC0xICYmIHRoaXMuX2N1cnJlbnREZXB0aCA+PSB0aGlzLmRlcHRoKTtcclxuICB9XHJcblxyXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb3VnbGFzY3JvY2tmb3JkL0pTT04tanMvYmxvYi9tYXN0ZXIvY3ljbGUuanNcclxuICBwcml2YXRlIGRlY3ljbGUob2JqZWN0OiBhbnkpOiBhbnkge1xyXG4gICAgY29uc3Qgb2JqZWN0cyA9IG5ldyBXZWFrTWFwKCk7XHJcbiAgICByZXR1cm4gKGZ1bmN0aW9uIGRlcmV6KHZhbHVlOiBhbnksIHBhdGg6IGFueSk6IGFueSB7XHJcbiAgICAgIGxldCBvbGRQYXRoO1xyXG4gICAgICBsZXQgbnU6IGFueTtcclxuXHJcbiAgICAgIGlmIChcclxuICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXHJcbiAgICAgICAgdmFsdWUgIT09IG51bGwgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgQm9vbGVhbikgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkgJiZcclxuICAgICAgICAhKHZhbHVlIGluc3RhbmNlb2YgTnVtYmVyKSAmJlxyXG4gICAgICAgICEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApICYmXHJcbiAgICAgICAgISh2YWx1ZSBpbnN0YW5jZW9mIFN0cmluZylcclxuICAgICAgKSB7XHJcbiAgICAgICAgb2xkUGF0aCA9IG9iamVjdHMuZ2V0KHZhbHVlKTtcclxuICAgICAgICBpZiAob2xkUGF0aCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICByZXR1cm4geyRyZWY6IG9sZFBhdGh9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBvYmplY3RzLnNldCh2YWx1ZSwgcGF0aCk7XHJcblxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xyXG4gICAgICAgICAgbnUgPSBbXTtcclxuICAgICAgICAgIHZhbHVlLmZvckVhY2goKGVsZW1lbnQsIGkpID0+IHtcclxuICAgICAgICAgICAgbnVbaV0gPSBkZXJleihlbGVtZW50LCBwYXRoICsgJ1snICsgaSArICddJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbnUgPSB7fTtcclxuICAgICAgICAgIE9iamVjdC5rZXlzKHZhbHVlKS5mb3JFYWNoKChuYW1lKSA9PiB7XHJcbiAgICAgICAgICAgIG51W25hbWVdID0gZGVyZXoodmFsdWVbbmFtZV0sIHBhdGggKyAnWycgKyBKU09OLnN0cmluZ2lmeShuYW1lKSArICddJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51O1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH0pKG9iamVjdCwgJyQnKTtcclxuICB9XHJcbn1cclxuIl19