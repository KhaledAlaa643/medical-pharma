import { Component, OnInit } from '@angular/core';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-collections-list',
  templateUrl: './collections-list.component.html',
  styleUrls: ['./collections-list.component.scss']
})
export class CollectionsListComponent implements OnInit {
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
      name: 'تاريخ التحصيل',
    },
    {
      name: 'مبلغ التحصيل',
    },
    {
      name: 'المبلغ المحصل',
    },
    {
      name: 'خط السير',
    },
    {
      name: 'ملاحظات',
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
      name: 'collected_at',
      type: 'normal'
    },
    {
      name: 'amount',
      type: 'normal'
    },
    {
      name: 'collected_amount',
      type: 'normal'
    },
    {
      name: 'track',
      type: 'normal'
    },
    {
      name: 'note',
      type: 'normal'
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
