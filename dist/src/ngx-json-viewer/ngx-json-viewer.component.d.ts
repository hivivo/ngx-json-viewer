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
    restoreExpanded: boolean;
    showTypeHeadings: boolean;
    _length: number;
    _key: string;
    _previouslyOpenKeys?: {
        [key: string]: any;
    };
    _currentDepth: number;
    nextOpenKeys: {
        [key: string]: any;
    };
    segments: ISegment[];
    private underscoreRegex;
    childrenComponents: QueryList<NgxJsonViewerComponent>;
    private getOpenKeysRecursive;
    private openSegments;
    ngOnChanges(): void;
    isExpandable(segment: ISegment): any;
    toggle(segment: ISegment): any;
    private parseKeyValue;
    private isExpanded;
    private decycle;
}
