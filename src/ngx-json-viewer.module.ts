import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxJsonViewerComponent } from './ngx-json-viewer/ngx-json-viewer.component';

@NgModule({
  imports: [
    BrowserModule
  ],
  declarations: [
    NgxJsonViewerComponent
  ],
  exports: [
    NgxJsonViewerComponent
  ]
})
export class NgxJsonViewerModule { }
