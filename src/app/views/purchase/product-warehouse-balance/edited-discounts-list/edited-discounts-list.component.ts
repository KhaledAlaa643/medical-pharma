import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { PrintService } from '@services/print.service';

@Component({
  selector: 'app-edited-discounts-list',
  templateUrl: './edited-discounts-list.component.html',
  styleUrls: ['./edited-discounts-list.component.scss']
})
export class EditedDiscountsListComponent implements OnInit {
  columnsArray: columnHeaders[] = [
    {
      name: 'اسم الصنف',
      sort: true,
      direction: null,
      search:true
    },
    {
      name: 'خصم 1',
    },
    {
      name: 'خصم 2',
    },
    {
      name: 'خصم 3',
    },
    {
      name: 'خصم 4',
    },
    {
      name: 'خصم 5',
    },
    {
      name: 'خصم 6',
    },
    {
      name: 'خصم 7',
    },
    {
      name: 'التاريخ',
    },
    {
      name: 'الكاتب',
    },

  ]
  columnsName: ColumnValue[] = [
    {
      name: 'name_ar',
      type: 'nameClickableBlue'
    },
    {
      name: 'discount1',
      type: 'normal'
    },
    {
      name: 'discount2',
      type: 'normal'
    },
    {
      name: 'discount3',
      type: 'normal'
    },
    {
      name: 'discount4',
      type: 'normal'
    },
    {
      name: 'discount5',
      type: 'normal'
    },
    {
      name: 'discount6',
      type: 'normal'
    },
    {
      name: 'discount7',
      type: 'normal'
    },
    {
      name: 'created_at',
      type: 'normal'
    },
    {
      name: 'created_by',
      type: 'normal'
    },

  ]
  productsData: any = []

  total!: number
  rows!: number
  page: number = 1
  productsFilterForm!: FormGroup
  constructor(private fb:FormBuilder,private printService:PrintService,private router:Router) { }

  ngOnInit() {
    this.productsFilterForm = this.fb.group({
      warehouse_id: [ '' ],
      corridor_id: [ '' ],
      stand: [ '' ],
      shelf: [ '' ],
      manufacturer_id: [ '' ],
      product_type: [ '' ],
      supplied_at: [ '' ],
      quantity_more_than_zero: [ '' ],
      buying_status: [ '' ],
      selling_status: [ '' ],
      price_from: [ '' ],
      price_to: [ '' ],

      types: [ '' ]
    })
  }

  
  sorting(sortData?: any) {
    // const queryParams = this.getUpdatedQueryParams(sortData);
    // this.router.navigate([], {
    //   queryParams,
    //   queryParamsHandling: "merge"
    // });
  }
  printType: string = ''
  printMain(printData: any) {
  }
  openModal(event:any){

  }
  changePage(event: any) {
    this.page = event.page + 1
    return this.router.navigate([], { queryParams: { page: this.page }, queryParamsHandling: 'merge' });

  }

}
