import { Component, OnInit } from '@angular/core';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-offers-list',
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.scss']
})
export class OffersListComponent implements OnInit {

  columnsArray: columnHeaders[] = [
    {
      name: 'الصنف',
    },
    {
      name: ' نوع البيان	',
    },
    {
      name: ' الكمية	',
    },
    {
      name: ' الكوتة	',
    },
    {
      name: ' كل',
    },
    {
      name: 'يضاف للخصم',

    },
    {
      name: 'البونص',
    },
    {
      name: ' التاريخ	',
    },
    {
      name:'الشركةالمصنعه'
    },
    {
      name:'الكاتب'
    },
    {
      name:'أمر'
    },
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal'
    },
    {
      name: 'type',
      type: 'normal'
    },
    {
      name: 'quantity',
      type: 'normal'
    },
    {
      name: 'quantity',
      type: 'normal'
    },
    {
      name: 'all',
      type: 'normal'
    },
    {
      name: 'add_to_discount',
      type: 'normal'
    },
    {
      name: 'bonus',
      type: 'normal'
    },
    {
      name: 'created_at',
      type: 'normal'
    },
    {
      name: 'manufacturer',
      type: 'normal'
    },
    {
      name: 'delete',
      type: 'trash_icon'
    },
  ]
  offerData: any[] = []
  rows!:number
  total!:number
  constructor() { }

  ngOnInit() {
  }

  
  sorting(sortData?: any) {}
  changePage(event: any) {}
}
