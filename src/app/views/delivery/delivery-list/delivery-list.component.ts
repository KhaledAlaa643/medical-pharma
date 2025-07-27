import { Component, OnInit } from '@angular/core';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-delivery-list',
  templateUrl: './delivery-list.component.html',
  styleUrls: ['./delivery-list.component.scss']
})
export class DeliveryListComponent implements OnInit {
tracks:any=[{name:'خط 1',number:0},{name:'خط 2',number:1},{name:'خط 3',number:2},{name:'خط 4',number:3},{name:'خط 5',number:4},{name:'خط 6',number:5},{name:'توصيل سريع',number:6}]
isActiveTapArray:boolean[]=Array(7).fill(false)
popupTabs:boolean[]= new Array(3).fill(false)


columnsArray: columnHeaders[] = [

  {
      name: 'اختيار',
  },

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
  {
      name: 'أمر ',
  },

]
columnsName: ColumnValue[] = [
  {
      name: 'checkbox',
      type: 'checkbox'
  },
  {
      name: 'location',
      type: 'normal'
  },
  {
      name: 'order_number',
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
      name: 'payment_type',
      type: 'normal'
  },
  {
      name: 'total',
      type: 'normal'
  },
  {
      name: 'bag',
      type: 'normal'
  },
  {
      name: 'package',
      type: 'normal'
  },
  {
      name: 'fridge',
      type: 'normal'
  },
  {
      name: 'main_order_number',
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
    this.isActiveTapArray[0]=true
    this.popupTabs[0]=true
  }
  changeActiveTap(index:number){
    this.isActiveTapArray.fill(false)
    this.isActiveTapArray[index]=true
  }
  changePopupTab(index:number){
    this.popupTabs.fill(false)
    this.popupTabs[index]=true
  }
  
}
