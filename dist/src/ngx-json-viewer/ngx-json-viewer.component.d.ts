import { OnChanges, QueryList } from '@angular/core';
export interface ISegment {
    key: string;
    value: any;
    type: undefined | string;
    description: string;
    expanded: boolean;
}
export declare class NgxJsonViewerComponent implements OnChanges {
    json: any;
    expanded: boolean;
    depth: number;
    key: string;
    length: number;
    restoreExpanded: boolean;
    showTypeHeadings: boolean;
    _currentDepth: number;
    _previouslyOpenKeys?: {
        [key: string]: any;
    };
    nextOpenKeys: {
        [key: string]: any;
    };
    segments: ISegment[];
    private underscoreRegex;
    childrenComponents: QueryList<NgxJsonViewerComponent>;
    private getOpenKeysRecursive();
    private openSegments();
    ngOnChanges(): void;
    isExpandable(segment: ISegment): any;
    toggle(segment: ISegment): any;
    private parseKeyValue(key, value);
    private isExpanded();
    private decycle(object);
}
