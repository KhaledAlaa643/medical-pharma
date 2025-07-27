import { Component, OnInit } from '@angular/core';
import { products, warehouses } from '@models/products';
import { columnHeaders, ColumnValue } from '@models/tableData';

@Component({
  selector: 'app-inventored-orders',
  templateUrl: './inventored-orders.component.html',
  styleUrls: ['./inventored-orders.component.scss']
})
export class InventoredOrdersComponent implements OnInit {
  warehouses:warehouses[]=[]
  products:products[]=[]
  inventoryData: any[] = []

  columnsArray: columnHeaders[] = [
    {
      name: 'رقم أذن المراجعة',
    },
    {
      name: ' كاتب المراجع	',
      sort: true,
      direction: null
    },
    {
      name: ' المخزن	',
      sort: true,
      direction: null
    },
    {
      name: ' التاريخ	',
      sort: true,
      direction: null
    },
    {
      name: ' الكمية الفعلية',
      sort: true,
      direction: null
    },
    {
      name: 'قيمة الزيادة بالتكلفة',
      sort: true,
      direction: null
    },
    {
      name: 'قيمة العجز بالتكلفة',
      sort: true,
      direction: null
    },
    {
      name: ' صافي التكلفة	',
    },
    {
      name:'كاتب الجرد'
    }
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'number',
      type: 'normal'
    },
    {
      name: 'created_by',
      type: 'normal'
    },
    {
      name: 'warehouse_name',
      type: 'normal'
    },
    {
      name: 'created_at',
      type: 'normal'
    },
    {
      name: 'real_quantity',
      type: 'normal'
    },
    {
      name: 'excess',
      type: 'normal'
    },
    {
      name: 'shortage',
      type: 'normal'
    },
    {
      name: 'total',
      type: 'normal'
    },
    {
      name: 'invenored_by',
      type: 'normal'
    },
  ]
  rows!:number
  total!:number
  constructor() { }

  ngOnInit() {
  }

  
  sorting(sortData?: any) {}
  changePage(event: any) {}

}
