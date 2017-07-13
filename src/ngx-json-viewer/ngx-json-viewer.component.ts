import { Component, OnChanges, Input } from '@angular/core';

@Component({
  selector: 'ngx-json-viewer',
  templateUrl: './ngx-json-viewer.component.html',
  styleUrls: ['./ngx-json-viewer.component.scss']
})
export class NgxJsonViewerComponent implements OnChanges {

  @Input() json: any;

  constructor() { }

  ngOnChanges() { }
}
