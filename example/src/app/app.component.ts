import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data = {
    'simple key': 'simple value',
    'numbers': 1234567,
    'simple list': [
      'value1',
      22222,
      'value3'
    ],
    'owner': null,
    'simple obect': {
      'simple key': 'simple value',
      'numbers': 1234567,
      'simple list': [
        'value1',
        22222,
        'value3'
      ],
      'deep object': {
        'key1': {
          'deeper': [
            1,
            2,
            3,
          ],
        },
      },
      'simple obect': {
        'key1': 'value1',
        'key2': 22222,
        'key3': 'value3'
      }
    }
  };

  cyclicData = {
    list: [
      1,
      2,
      3,
    ] as any[],
  };

  constructor() {
    this.cyclicData.list.push(
      this.cyclicData,
      this.cyclicData,
      this.cyclicData.list,
    );
  }
}
