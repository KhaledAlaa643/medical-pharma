import { Component, OnInit } from '@angular/core';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-todays-collections',
  templateUrl: './todays-collections.component.html',
  styleUrls: ['./todays-collections.component.scss']
})
export class TodaysCollectionsComponent implements OnInit {
  columnsArray: columnHeaders[] = [
    {
      name: 'كود العميل',
    },
    {
      name: 'اسم العميل',
    },
    {
      name: 'المدينة',
    },
    {
      name: 'العنوان',
    },
    {
      name: 'مبلغ التحصيل',
    },
    {
      name: 'ملاحظات',
    },
    {
      name: 'أمر',
    },
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'code',
      type: 'normal'
    },
    {
      name: 'client_name',
      type: 'normal'
    },
    {
      name: 'city',
      type: 'normal'
    },
    {
      name: 'address',
      type: 'normal'
    },
    {
      name: 'amount',
      type: 'normal'
    },
    {
      name: 'note',
      type: 'normal'
    },
    {
      name: 'collected',
      type: 'collected'
    },
  ]
  Data:any = []
  total!:number
  page!:number
  rows!:number
  constructor() { }

  ngOnInit() {
  }
  changePage(event:any){

  }
}
