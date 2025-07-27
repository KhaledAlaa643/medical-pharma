import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { client } from '@models/client';
import { pharmacy_client } from '@models/pharmacie';
import { products } from '@models/products';
import { purchase_return, returns } from '@models/returns';
import { supplier } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');


@Component({
  selector: 'app-create-purchase-returns',
  templateUrl: './create-purchase-returns.component.html',
  styleUrls: [ './create-purchase-returns.component.scss' ]
})
export class CreatePurchaseReturnsComponent implements OnInit {
  private subs = new Subscription()
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم فاتورة الشراء ',
    },
    {
      name: 'اسم المورد',
    },
    {
      name: ' التاريخ والوقت	',
    },
    {
      name: ' مراجع الاستلامات	',
    },
    {
      name: ' الكاتب	',
    },
    {
      name: ' أمر	',
    },
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'purchase_id',
      type: 'normal'
    },
    {
      name: 'supplier_name',
      type: 'normal'
    },
    {
      name: 'time_date',
      type: 'normal'
    },
    {
      name: 'reciving_auditor',
      type: 'normal'
    },
    {
      name: 'created_by',
      type: 'normal'
    },
    {
      name: 'return',
      type: 'purchase_return'
    },
  ]

  ClientInvoices: purchase_return[] = []
  rows: number = 1
  total: number = 10
  page: number = 1
  suppliers: supplier[] = []
  supplier:supplier={} as supplier
  clientFilter!: FormGroup
  productFilter!: FormGroup
  products: products[] = []
  loaderBooleanCode = false
  loaderBooleanId = false
  constructor(private http: HttpService, 
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private fb: FormBuilder,
    private generalService:GeneralService) { }

  ngOnInit() {
    this.getDropdownData()
    this.clientFilter = this.fb.group({
      code: [ '' ],
      supplier_id: [ '' ],
      from: [ '' ]
    })
    this.productFilter = this.fb.group({
      product_id: [ '' ],
      expired_at: [ '' ],
      operating_number: [ '' ]
    })
  }

  client!: client

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [ key, value ] of Object.entries(filters)) {
      if (value)
        x[ key ] = value
    }
    x[ 'status' ] = 4
    let getUrl = 'purchases/supply-request/index';

    return this.http.getReq(getUrl, { params: x });
  }

  loadDataWithFilter(filterParams: any, filterType: number) {
    this.subs.add(
      this.getAllData(filterParams).subscribe({
        next: res => {
          this.ClientInvoices = [];
          res.data.forEach((element: any) => {
            const allBatchesQuantityZero = element.cart.every((cartItem: any) =>
              cartItem.quantity == 0
            );

            this.ClientInvoices.push({
              'purchase_id': element.id,
              'supplier_name': element?.supplier.name,
              'created_by': element?.created_by?.name,
              'reciving_auditor': element?.reviewed_by?.name,
              'time_date': element.created_at,
              'backGround_red': allBatchesQuantityZero && filterParams[ 'product_id' ] ? true : false
            })

          })
          this.total = res?.meta.total;
          this.rows = res.meta?.per_page;
        }
      })
    );
  }

  filterPharmacies(filterType: number) {
    const queryParams = this.getUpdatedQueryParams(filterType);
    this.loadDataWithFilter(queryParams, filterType)
  }
  filterType!: number
  getUpdatedQueryParams(filterType: number) {
    this.filterType = filterType
    let queryParams: any = {};

    for (const key in this.productFilter.value) {
      let value = this.productFilter.value[ key ];
      if (value != null && value != undefined && value != "") {
        if (key == 'created_at') {
          queryParams[ key ] = datePipe.transform(value, 'yyyy-MM-dd')
        }
        else {
          queryParams[ key ] = value;
        }
      }
    }


    for (const key in this.clientFilter.value) {
      let value = this.clientFilter.value[ key ];
      if (value != null && value != undefined && value != "") {
        if (key == 'from') {
          queryParams[ key ] = datePipe.transform(value, 'yyyy-MM-dd')
        }
        else if (key != 'code') {
          queryParams[ key ] = value;
        }
      }
    }



    if (this.page && Object.keys(queryParams).length > 0) {
      queryParams[ 'page' ] = this.page;
    }
    if (Object.keys(queryParams).length > 0) {
      return queryParams;
    }
    else {
      this.ClientInvoices = []
    }
  }



  changePage(event: any) {
    this.page = event.page + 1
    const queryParams = this.getUpdatedQueryParams(this.filterType);
    this.loadDataWithFilter(queryParams, this.filterType)
  }

  getDropdownData() {

     //products
     this.subs.add(this.http.getReq('products/dropdown').subscribe({
      next:res=>{
        this.products=res.data
      }
    }))

    //suppliers
    this.subs.add(this.generalService.getDropdownData(['suppliers']).subscribe({
      next:res=>{
        this.suppliers=res.data.suppliers
      }
    }))
  }

  viewReturnDetails(purchase_id: number) {
    this.router.navigate([ `/purchases/returns/create/purchase-returns/${purchase_id}` ])
  }

}
