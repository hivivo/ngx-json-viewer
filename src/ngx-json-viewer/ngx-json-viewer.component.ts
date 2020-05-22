import {Component, OnChanges, Input, Output, EventEmitter} from '@angular/core';

export interface NgxJsonSegment {
  parent: NgxJsonSegment | undefined;
  key: string;
  value: any;
  type: undefined | string;
  description: string;
  expanded: boolean;
  path: string;
}

type IsSegmentClickableFn = (segment: NgxJsonSegment) => boolean;

@Component({
  selector: 'ngx-json-viewer',
  templateUrl: './ngx-json-viewer.component.html',
  styleUrls: ['./ngx-json-viewer.component.scss']
})
export class NgxJsonViewerComponent implements OnChanges {

  @Input() json: any;
  @Input() expanded = true;
  /**
   * @deprecated It will be always true and deleted in version 3.0.0
   */
  @Input() cleanOnChange = true;
  @Input() isSegmentClickable: IsSegmentClickableFn;
  @Input() _parent: NgxJsonSegment | undefined = undefined;
  @Output() segmentClicked = new EventEmitter<NgxJsonSegment>();

  segments: NgxJsonSegment[] = [];

  ngOnChanges() {
    if (this.cleanOnChange) {
      this.segments = [];
    }

    if (typeof this.json === 'object') {
      Object.keys(this.json).forEach(key => {
        this.segments.push(this.parseKeyValue(key, this.json[key]));
      });
    } else {
      this.segments.push(this.parseKeyValue(`(${typeof this.json})`, this.json));
    }
  }

  isExpandable(segment: NgxJsonSegment) {
    return segment.type === 'object' || segment.type === 'array';
  }

  toggle(segment: NgxJsonSegment) {
    if (this.isExpandable(segment)) {
      segment.expanded = !segment.expanded;
    }
  }

  segmentClickHandler(segment: NgxJsonSegment) {
    this.segmentClicked.emit(segment);
  }

  isClickable(segment: NgxJsonSegment): boolean {
    return this.isSegmentClickable && this.isSegmentClickable(segment);
  }

  private parseKeyValue(key: any, value: any): NgxJsonSegment {
    const segment: NgxJsonSegment = {
      parent: this._parent,
      path: this._parent ? `${this._parent.path}.${key}` : key,
      key: key,
      value: value,
      type: undefined,
      description: '' + value,
      expanded: this.expanded
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
}
