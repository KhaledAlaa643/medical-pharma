import { Component, OnInit } from '@angular/core';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-track-order-delivery',
  templateUrl: './track-order-delivery.component.html',
  styleUrls: ['./track-order-delivery.component.scss']
})
export class TrackOrderDeliveryComponent implements OnInit {
  tracks:any=[{name:'خط 1',number:0},{name:'خط 2',number:1},{name:'خط 3',number:2},{name:'خط 4',number:3},{name:'خط 5',number:4},{name:'خط 6',number:5}]
  isActiveTapArray:boolean[]=Array(6).fill(false)
  columnsArray: columnHeaders[] = [
    {
        name: 'رقم الأذن',
  
    },
    {
        name: 'كود العميل',
    },
    {
        name: 'اسم العميل',
    },
    {
        name: 'حالة الطلب',
  
    },
    {
        name: 'المختص بحالة الطلب',
    },
    {
        name: 'خط السير',
    },
    {
        name: 'وقت خروج خط السير',
    },



  
  ]
  columnsName: ColumnValue[] = [
    {
        name: 'order_number',
        type: 'normal'
    },
    {
        name: 'client_code',
        type: 'normal'
    },
    {
        name: 'client_name',
        type: 'normal'
    },
    {
        name: 'status',
        type: 'normal'
    },
    {
        name: 'delivery',
        type: 'blueTextOpen'
    },
    {
        name: 'track',
        type: 'normal'
    },
    {
        name: 'delivered_at',
        type: 'normal'
    },

  
  ]
  data:any=[]
  constructor() { }

  ngOnInit() {
    this.isActiveTapArray[0]=true
  }
  changeActiveTap(index:number){
    this.isActiveTapArray.fill(false)
    this.isActiveTapArray[index]=true
  }
}
