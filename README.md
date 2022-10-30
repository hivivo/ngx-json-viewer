# ngx-json-viewer

JSON formatter and viewer for Angular

Live demo:
- Angular 14: https://stackblitz.com/edit/angular-14-ngx-json-viewer
- Angular 5: https://stackblitz.com/edit/ngx-json-viewer

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
# For Angular 4/5/6/7+:
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

### Theming

Theming can be done with CSS variables

* --ngx-json-string : color of string values
* --ngx-json-number : color of number values
* --ngx-json-boolean : color of boolean values
* --ngx-json-date : color of date values
* --ngx-json-array : color of array values
* --ngx-json-object : color of object values
* --ngx-json-function : color of function values
* --ngx-json-null : color of null values
* --ngx-json-null-bg : background color of null values
* --ngx-json-undefined : color of undefined values
* --ngx-json-toggler : color of toggler
* --ngx-json-key : color of keys
* --ngx-json-separator : color of separators
* --ngx-json-value : color of values
* --ngx-json-undefined-key : color for key of undefined values
* --ngx-json-font-family : font-family 
* --ngx-json-font-family : font-size 
