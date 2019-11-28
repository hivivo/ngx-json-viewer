import { Component, OnChanges, Input, SimpleChanges } from '@angular/core';
import isEqual from 'deep-equal';

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

  @Input() path: string[] = [];
  @Input() json: any;
  @Input() expanded = true;

  segments: Segment[] = [];
  private readonly expandedChildren = new Set<string>();

  ngOnChanges(changes: SimpleChanges) {
    // Re-parse only if JSON changed & values are not similar (use deep object/array comparison)
    if (!changes.json || isEqual(changes.json.previousValue, changes.json.currentValue)) {
      return;
    }
    const newJson = changes.json.currentValue;

    if (typeof newJson === 'object') {
      this.segments = Object.keys(newJson).map(key => this.parseKeyValue(key, newJson[key]));
    } else {
      this.segments = [this.parseKeyValue(`(${typeof newJson})`, newJson)];
    }

    if (!changes.expanded) {
      // Clean up expanded children keys that no longer exist.
      for (const oldChildSegmentdKey in this.expandedChildren.values()) {
        if (!this.segments.some(s => s.key === oldChildSegmentdKey)) {
          this.expandedChildren.delete(oldChildSegmentdKey);
        }
      }

    } else {
      // Clear the state of individual elements.
      this.expandedChildren.clear();
    }
  }

  isExpandable(segment: Segment) {
    return segment.type === 'object' || segment.type === 'array';
  }

  isChildExpanded(segment: Segment | string) {
    return this.expandedChildren.has(typeof segment === 'string' ? segment : segment.key);
  }

  toggle(segment: Segment) {
    // Check if the given segment is expandable.
    // This check is required to avoid storing useless keys in the expanded children set.
    if (this.isExpandable(segment)) {
      // Add or remove the segment key to the set of opened segments
      if (this.isChildExpanded(segment)) {
        this.expandedChildren.delete(segment.key);
      } else {
        this.expandedChildren.add(segment.key);
      }
    }
  }

  private parseKeyValue(key: any, value: any): Segment {
    const segment: Segment = {
      key,
      value,
      type: undefined,
      description: '' + value,
      // Retrieve the current expand state.
      expanded: this.expanded || this.isChildExpanded(key),
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
