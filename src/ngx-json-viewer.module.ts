import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgxJsonViewerComponent } from './ngx-json-viewer/ngx-json-viewer.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    NgxJsonViewerComponent
  ],
  exports: [
    NgxJsonViewerComponent
  ]
})
export class NgxJsonViewerModule { }
