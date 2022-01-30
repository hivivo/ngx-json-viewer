import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, NgxJsonViewerModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
