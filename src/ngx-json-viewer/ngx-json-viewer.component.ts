import {Component, OnChanges, Input, ViewChildren, QueryList}  from '@angular/core';

export interface Segment {
  key: string;
  value: any;
  type: undefined | string;
  description: string;
  expanded: boolean;
}

@Component({
  selector: 'ngx-json-viewer',
  templateUrl: './ngx-json-viewer.component.html',
  styleUrls: ['./ngx-json-viewer.component.scss']
})
export class NgxJsonViewerComponent implements OnChanges {
  @Input() public json: any;
  @Input() public expanded = true;
  @Input() public depth = -1;
  @Input() public key = 'Object';
  // Tracks the length of array types. -1 for other types
  @Input() public length = -1;
  @Input() public restoreExpanded = false;

  @Input() public showTypeHeadings = false;

  @Input() public _currentDepth = -1;
  @Input() public _previouslyOpenKeys?: {[key: string]: any};

  public nextOpenKeys: {[key: string]: any} = {};
  public segments: Segment[] = [];

  // Matches the last underscore in a string
  private underscoreRegex = /_[^_]+$/;

  @ViewChildren(NgxJsonViewerComponent) public childrenComponents: QueryList<
  NgxJsonViewerComponent
  >;

  private getOpenKeysRecursive(): any {
    const openKeys: {[key: string]: any} = {};
    this.childrenComponents.forEach((component : NgxJsonViewerComponent) => {
      // Save key and length - on reload array elements should only be reopened if
      // the array is the same length
      openKeys[component.key + '_' + component.length] = component.getOpenKeysRecursive();
    });

    if (Object.keys(openKeys).length === 0) {
      return;
    }
    return openKeys;
  }

  private openSegments(): void {
    const keys = Object.keys(this._previouslyOpenKeys!);
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

  public ngOnChanges(): void {
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
    } else {
      this.segments.push(this.parseKeyValue(`(${typeof this.json})`, this.json));
    }

    if (!this._previouslyOpenKeys) {
      return;
    } else {
      this.openSegments();
    }
  }

  public isExpandable(segment: Segment): any {
    return segment.type === 'object' || segment.type === 'array';
  }

  public toggle(segment: Segment): any {
    if (this.isExpandable(segment)) {
      segment.expanded = !segment.expanded;
    }
  }

  private parseKeyValue(key: any, value: any): Segment {
    const segment: Segment = {
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
        } else if (Array.isArray(segment.value)) {
          segment.type = 'array';
          segment.description =
            'Array[' + segment.value.length + '] ' + JSON.stringify(segment.value);
        } else if (segment.value instanceof Date) {
          segment.type = 'date';
        } else {
          segment.type = 'object';
          segment.description = 'Object ' + JSON.stringify(segment.value);
        }
        break;
      }
    }

    return segment;
  }

  private isExpanded(): boolean {
    return this.expanded && !(this.depth > -1 && this._currentDepth >= this.depth);
  }

  // https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
  private decycle(object: any): any {
    const objects = new WeakMap();
    return (function derez(value: any, path: any): any {
      let oldPath;
      let nu: any;

      if (
        typeof value === 'object' &&
        value !== null &&
        !(value instanceof Boolean) &&
        !(value instanceof Date) &&
        !(value instanceof Number) &&
        !(value instanceof RegExp) &&
        !(value instanceof String)
      ) {
        oldPath = objects.get(value);
        if (oldPath !== undefined) {
          return {$ref: oldPath};
        }
        objects.set(value, path);

        if (Array.isArray(value)) {
          nu = [];
          value.forEach((element, i) => {
            nu[i] = derez(element, path + '[' + i + ']');
          });
        } else {
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
