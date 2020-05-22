# ngx-json-viewer

JSON formatter and viewer for Angular 2/4/5/6/7+

Live demo: https://stackblitz.com/edit/ngx-json-viewer

## Install
```bash
# For Angular 4/5/6/7:
npm install ngx-json-viewer

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

To make the segment clickable

HTML
```html
<ngx-json-viewer [json]="someObject" 
    [isSegmentClickable]="isClickable"
    (segmentClicked)="segmentClickHandler($event)"></ngx-json-viewer>
```
TS
```typescript
const someObject = {users:[{id:123, name:"user1"},{id:234, name:"user2"}]};

function isClickable(segment:NgxJsonSegment):boolean{
    return segment.path === "users.0.id";
}
function segmentClickHandler(segment:NgxJsonSegment){
    if (segment.path === "users.0.id"){
        console.log(`the userId is ${segment.value}`);
    }
}
```

