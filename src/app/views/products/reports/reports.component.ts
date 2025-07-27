import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  isActiveTapArray:boolean[]=Array(9).fill(false)

  constructor() { }
  changeActiveTap(index: number) {

      this.isActiveTapArray.fill(false)
      this.isActiveTapArray[ index ] = true

  }

  ngOnInit() {

    this.isActiveTapArray[ 0 ] = true

  }
}
