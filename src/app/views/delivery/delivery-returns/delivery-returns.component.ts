import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-delivery-returns',
  templateUrl: './delivery-returns.component.html',
  styleUrls: ['./delivery-returns.component.scss']
})
export class DeliveryReturnsComponent implements OnInit {
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
        name: 'سبب عدم التسليم',
  
    },
    {
        name: 'المندوب',
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
        name: 'داخل اذن رقم',
    },
    {
        name: 'أمر',
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
        name: 'reason',
        type: 'normal'
    },
    {
        name: 'delivery',
        type: 'normal'
    },
    {
        name: 'bag',
        type: 'normal'
    },
    {
        name: 'packet',
        type: 'normal'
    },
    {
        name: 'frindg',
        type: 'normal'
    },
    {
        name: 'main_order_number',
        type: 'normal'
    },
    {
        name: 'assign',
        type: 'assign_btn'
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

  @ViewChild('openAssignModalBtn') private openAssignModalBtn!: ElementRef;

  openAssignModal(event:any){
    this.openAssignModalBtn.nativeElement.click()

  }
}
