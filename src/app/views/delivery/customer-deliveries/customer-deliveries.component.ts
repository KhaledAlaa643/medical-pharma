import { Component, OnInit } from '@angular/core';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-customer-deliveries',
  templateUrl: './customer-deliveries.component.html',
  styleUrls: ['./customer-deliveries.component.scss']
})
export class CustomerDeliveriesComponent implements OnInit {
    popupTabs:boolean[]= new Array(3).fill(false)
  columnsArray: columnHeaders[] = [

    {
        name: 'م',
    },
    {
        name: 'رقم الأذن',

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
        name: 'نوع التعامل',
    },
    {
        name: 'اجمالي الفاتورة',
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
    {
        name: 'التاريخ',
    },
    {
        name: 'الحساب السابق',
    },
    {
        name: 'نوع التعامل',
    },
    {
        name: 'أمر ',
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
  constructor() { }

  ngOnInit() {
    this.popupTabs[0]=true
  }
changeTab(index:number){
  this.popupTabs.fill(false)
  this.popupTabs[index]=true
}
}
