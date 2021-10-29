import { Component, Input, NgModule, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

class NgxJsonViewerComponent {
    constructor() {
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
    getOpenKeysRecursive() {
        const /** @type {?} */ openKeys = {};
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
    /**
     * @return {?}
     */
    openSegments() {
        const /** @type {?} */ keys = Object.keys(/** @type {?} */ ((this._previouslyOpenKeys)));
        keys.forEach(key => {
            // Check to see if the key exists, if so expands it
            const /** @type {?} */ strippedKey = key.replace(this.underscoreRegex, '');
            const /** @type {?} */ foundSegment = this.segments.find(segment => {
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
    /**
     * @return {?}
     */
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
    /**
     * @param {?} segment
     * @return {?}
     */
    isExpandable(segment) {
        return segment.type === 'object' || segment.type === 'array';
    }
    /**
     * @param {?} segment
     * @return {?}
     */
    toggle(segment) {
        if (this.isExpandable(segment)) {
            segment.expanded = !segment.expanded;
        }
    }
    /**
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    parseKeyValue(key, value) {
        const /** @type {?} */ segment = {
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
    /**
     * @return {?}
     */
    isExpanded() {
        return this.expanded && !(this.depth > -1 && this._currentDepth >= this.depth);
    }
    /**
     * @param {?} object
     * @return {?}
     */
    decycle(object) {
        const /** @type {?} */ objects = new WeakMap();
        return (function derez(value, path) {
            let /** @type {?} */ oldPath;
            let /** @type {?} */ nu;
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
                template: `
    <section class="ngx-json-viewer">
      <section *ngFor="let segment of segments" [ngClass]="['segment', 'segment-type-' + segment.type]">
        <section
          (click)="toggle(segment)"
          [ngClass]="{
            'segment-main': true,
            expandable: isExpandable(segment),
            expanded: segment.expanded
          }"
        >
          <div *ngIf="isExpandable(segment)" class="toggler"></div>
          <span class="segment-key">{{ segment.key }}</span>
          <span class="segment-separator">: </span>
          <span *ngIf="!segment.expanded || !isExpandable(segment)" class="segment-value">{{
            segment.description
          }}</span>
          <span
            *ngIf="showTypeHeadings && segment.expanded && segment.type == 'array'"
            class="segment-value"
            >Array[{{ segment.value.length }}]</span
          >
          <span
            *ngIf="showTypeHeadings && segment.expanded && segment.type == 'object'"
            class="segment-value"
            >Object</span
          >
        </section>
        <section *ngIf="segment.expanded && isExpandable(segment)" class="children">
          <ngx-json-viewer
            [json]="segment.value"
            [expanded]="expanded"
            [depth]="depth"
            [_currentDepth]="_currentDepth"
            [key]="segment.key"
            [length]="segment.type === 'array' ? segment.value.length : -1"
            [_previouslyOpenKeys]="
              _previouslyOpenKeys &&
              _previouslyOpenKeys[
                segment.type === 'array'
                  ? segment.key + '_' + segment.value.length
                  : segment.key + '_-1'
              ]
            "
          ></ngx-json-viewer>
        </section>
      </section>
    </section>
  `,
                styles: [`
    @charset "UTF-8";
    .ngx-json-viewer {
      font-family: monospace;
      font-size: 1em;
      width: 100%;
      height: 100%;
      overflow: hidden;
      position: relative; }
      .ngx-json-viewer .segment {
        padding: 0px;
        margin: 0px 0px 1px 12px; }
        .ngx-json-viewer .segment .segment-main {
          word-wrap: break-word; }
          .ngx-json-viewer .segment .segment-main .toggler {
            position: absolute;
            margin-left: -14px;
            margin-top: 3px;
            font-size: .8em;
            line-height: 1.2em;
            vertical-align: middle;
            color: #787878; }
            .ngx-json-viewer .segment .segment-main .toggler::after {
              display: inline-block;
              content: "►";
              -webkit-transition: -webkit-transform 0.1s ease-in;
              transition: -webkit-transform 0.1s ease-in;
              transition: transform 0.1s ease-in;
              transition: transform 0.1s ease-in, -webkit-transform 0.1s ease-in; }
          .ngx-json-viewer .segment .segment-main .segment-key {
            color: #00008b;
            word-wrap: break-word;
            white-space: pre-line; }
          .ngx-json-viewer .segment .segment-main .segment-separator {
            color: #00008b; }
          .ngx-json-viewer .segment .segment-main .segment-value {
            color: #000; }
        .ngx-json-viewer .segment .children {
          margin-left: 4px; }
      .ngx-json-viewer .segment-type-string > .segment-main > .segment-value {
        color: green; }
      .ngx-json-viewer .segment-type-number > .segment-main > .segment-value {
        color: #0000ff; }
      .ngx-json-viewer .segment-type-boolean > .segment-main > .segment-value {
        color: red; }
      .ngx-json-viewer .segment-type-date > .segment-main > .segment-value {
        color: #05668D; }
      .ngx-json-viewer .segment-type-array > .segment-main > .segment-value {
        color: #999; }
      .ngx-json-viewer .segment-type-object > .segment-main > .segment-value {
        color: #999; }
      .ngx-json-viewer .segment-type-function > .segment-main > .segment-value {
        color: #999; }
      .ngx-json-viewer .segment-type-null > .segment-main > .segment-value {
        color: #855a00; }
      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-value {
        color: #855a00; }
      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-key {
        color: #999; }
      .ngx-json-viewer .segment-type-undefined > .segment-main > .segment-value {
        background-color: #999; }
      .ngx-json-viewer .segment-type-object > .segment-main,
      .ngx-json-viewer .segment-type-array > .segment-main {
        white-space: nowrap; }
      .ngx-json-viewer .expanded > .toggler::after {
        -webkit-transform: rotate(90deg);
                transform: rotate(90deg); }
      .ngx-json-viewer .expandable > .segment-value {
        display: inline-block;
        vertical-align: bottom;
        text-overflow: ellipsis;
        overflow: hidden; }
      .ngx-json-viewer .expandable,
      .ngx-json-viewer .expandable > .toggler {
        cursor: pointer; }
  `]
            },] },
];
/**
 * @nocollapse
 */
NgxJsonViewerComponent.ctorParameters = () => [];
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

class NgxJsonViewerModule {
}
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
NgxJsonViewerModule.ctorParameters = () => [];

/**
 * Generated bundle index. Do not edit.
 */

export { NgxJsonViewerModule, NgxJsonViewerComponent };
//# sourceMappingURL=ngx-json-viewer.js.map
