# ngx-json-viewer

JSON formatter and viewer for Angular 2/4/5+

Live demo: https://stackblitz.com/edit/ngx-json-viewer

## Install
```bash
# For Angular 5:
npm install ngx-json-viewer

# For Angular 2/4:
npm install ngx-json-viewer@1
```
NPM Package: https://www.npmjs.com/package/ngx-json-viewer

## Usage

In your `app.module.ts` import `NgxJsonViewerModule` like
```js
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@NgModule({
  ...,
  imports: [
    ...,
    NgxJsonViewerModule,
    ...
  ],
  ...
})
export class AppModule { }
```

In your component:
```html
<ngx-json-viewer [json]="someObject"></ngx-json-viewer>
```
