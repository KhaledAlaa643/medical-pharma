import { Component, OnInit } from '@angular/core';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-deliveries-log',
  templateUrl: './deliveries-log.component.html',
  styleUrls: ['./deliveries-log.component.scss']
})
export class DeliveriesLogComponent implements OnInit {
  popupTabs:boolean[]= new Array(3).fill(false)
  columnsArray: columnHeaders[] = [

    {
        name: 'م ترتيب',
    },
    {
        name: 'رقم الأذن',

    },
    {
        name: 'اسم العميل',
    },
    {
      name: 'التاريخ',
   },
    {
        name: 'المدينة',

    },
    {
        name: 'العنوان',
    },
    {
        name: 'نوع التعامل',
    },
    {
        name: 'اجمالي مبلغ الأذن',
    },
    {
        name: 'شنطة',
    },
    {
        name: 'باكت',
    },
    {
        name: 'ثلاجة',
    },
    {
        name: 'داخل أذن رقم',
    },

]
columnsName: ColumnValue[] = [
    {
        name: 'location',
        type: 'normal'
    },
    {
        name: 'product_name',
        type: 'normal'
    },
    {
        name: 'client_name',
        type: 'normal'
    },
    {
        name: 'quantity',
        type: 'normal'
    },
    {
        name: 'warehouse_name',
        type: 'normal'
    },
    {
        name: 'expiration_operation',
        type: 'normal'
    },
    {
        name: 'created_by',
        type: 'normal'
    },
    {
        name: 'reason',
        type: 'normal'
    },
    {
        name: 'options',
        type: 'two_btn'
    },

]
data:any=[]

rows!:number
total!:number
page:number=1
  constructor() { }

  ngOnInit() {
    this.popupTabs[0]=true
  }
changeTab(index:number){
  this.popupTabs.fill(false)
  this.popupTabs[index]=true
}

changePage(event:any){

}
}
