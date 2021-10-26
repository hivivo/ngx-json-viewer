# ngx-json-viewer

JSON formatter and viewer for Angular

Live demo: https://stackblitz.com/edit/ngx-json-viewer

## Install
```bash
npm install ngx-json-viewer
```

or

```bash
yarn add ngx-json-viewer
```

For older Angular:

```bash
# For Angular 4/5/6/7:
npm install ngx-json-viewer@2

# For Angular 2:
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

To collapse all nodes at first:
```html
<ngx-json-viewer [json]="someObject" [expanded]="false"></ngx-json-viewer>
```

To only expand 3 levels:
```html
<ngx-json-viewer [json]="someObject" [depth]="3"></ngx-json-viewer>
```
