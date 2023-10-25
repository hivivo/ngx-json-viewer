import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';

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

  @Input() json: any;
  @Input() expanded = true;
  @Input() depth = -1;

  @Input() _currentDepth = 0;

  @Output() segmentLinkClicked: EventEmitter<string> = new EventEmitter<string>();

  segments: Segment[] = [];

  ngOnChanges() {
    this.segments = [];

    // remove cycles
    this.json = this.decycle(this.json);

    if (typeof this.json === 'object') {
      Object.keys(this.json).forEach(key => {
        this.segments.push(this.parseKeyValue(key, this.json[key]));
      });
    } else {
      this.segments.push(this.parseKeyValue(`(${typeof this.json})`, this.json));
    }
  }

  isExpandable(segment: Segment) {
    return segment.type === 'object' || segment.type === 'array';
  }

  toggle(segment: Segment) {
    if (this.isExpandable(segment)) {
      segment.expanded = !segment.expanded;
    }
  }

  onValueClick(segment: Segment) {
    if (segment.type === 'link') this.segmentLinkClicked.emit(segment.value)
  }

  onSegmentLinkClick(link: string) {
    this.segmentLinkClicked.emit(link)
  }

  private parseKeyValue(key: any, value: any): Segment {
    const segment: Segment = {
      key: key,
      value: value,
      type: undefined,
      description: '' + value,
      expanded: this.isExpanded()
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
        if (this.isLink(segment.value)) {
          segment.type = 'link';
          break;
        }

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
          segment.description = 'Array[' + segment.value.length + '] ' + JSON.stringify(segment.value);
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

  private isLink(value: string): boolean {
    return /.*:\/{2,2}|^\/|.*:[^\/]/gmi.test(value)
  }

  private isExpanded(): boolean {
    return (
      this.expanded &&
      !(this.depth > -1 && this._currentDepth >= this.depth)
    );
  }

  // https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
  private decycle(object: any) {
    const objects = new WeakMap();
    return (function derez(value, path) {
      let old_path;
      let nu: any;

      if (
        typeof value === 'object'
        && value !== null
        && !(value instanceof Boolean)
        && !(value instanceof Date)
        && !(value instanceof Number)
        && !(value instanceof RegExp)
        && !(value instanceof String)
      ) {
        old_path = objects.get(value);
        if (old_path !== undefined) {
          return {$ref: old_path};
        }
        objects.set(value, path);

        if (Array.isArray(value)) {
          nu = [];
          value.forEach(function (element, i) {
            nu[i] = derez(element, path + '[' + i + ']');
          });
        } else {
          nu = {};
          Object.keys(value).forEach(function (name) {
            nu[name] = derez(
              value[name],
              path + '[' + JSON.stringify(name) + ']'
            );
          });
        }
        return nu;
      }
      return value;
    }(object, '$'));
  }
}
