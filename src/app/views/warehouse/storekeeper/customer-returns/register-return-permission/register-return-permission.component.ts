import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { client } from '@models/client';
import { pharmacy_client } from '@models/pharmacie';
import { products } from '@models/products';
import { returns } from '@models/returns';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-register-return-permission',
  templateUrl: './register-return-permission.component.html',
  styleUrls: ['./register-return-permission.component.scss'],
})
export class RegisterReturnPermissionComponent implements OnInit {
  private subs = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم الأذن ',
    },
    {
      name: 'اسم العميل',
    },
    {
      name: ' التاريخ والوقت	',
    },
    {
      name: ' أمر	',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'order_number',
      type: 'normal',
    },
    {
      name: 'client_name',
      type: 'normal',
    },
    {
      name: 'time_date',
      type: 'normal',
    },
    {
      name: 'return',
      type: 'return',
    },
  ];

  ClientInvoices: returns[] = [];
  rows: number = 1;
  total: number = 10;
  page: number = 1;
  groupPharmacies: pharmacy_client[] = [];
  clientFilter!: FormGroup;
  productFilter!: FormGroup;
  products: products[] = [];
  loaderBooleanCode = false;
  loaderBooleanId = false;
  constructor(
    private http: HttpService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    this.getDropdownData();
    this.clientFilter = this.fb.group({
      code: [''],
      pharmacy_id: [''],
      created_at: [''],
    });
    this.productFilter = this.fb.group({
      product_id: [''],
      expired_at: [''],
      operating_number: [''],
    });
  }

  client!: client;
  getClientidFromCode(param: string) {
    let params;
    if (param == 'code' && this.clientFilter.controls['code'].value) {
      this.loaderBooleanCode = true;
      params = {
        code: this.clientFilter.controls['code'].value,
      };

      this.clientFilter.controls['pharmacy_id'].setValue(null);
    } else if (
      param == 'clientId' &&
      this.clientFilter.controls['pharmacy_id'].value
    ) {
      this.loaderBooleanId = true;

      this.clientFilter.controls['pharmacy_id'].setValue(
        this.clientFilter.controls['pharmacy_id'].value
      );
      params = { pharmacy_id: this.clientFilter.controls['pharmacy_id'].value };
      this.clientFilter.controls['code'].setValue('');
    }
    if (params) {
      this.subs.add(
        this.generalService.getPharmacies(params).subscribe({
          next: (res) => {
            this.client = res.data[0];

            if (param == 'code' && this.clientFilter.controls['code'].value) {
              this.clientFilter.controls['pharmacy_id'].setValue(
                res.data[0]?.id
              );
            }
            if (this.client?.code)
              this.clientFilter.controls['code'].setValue(
                String(this.client?.code)
              );
            else this.clientFilter.controls['pharmacy_id'].setValue(null);
          },
          complete: () => {
            this.loaderBooleanCode = false;
            this.loaderBooleanId = false;
          },
        })
      );
    } else {
      this.clientFilter.controls['pharmacy_id'].setValue(null);
      this.clientFilter.controls['code '].setValue('');
    }
  }

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    x['status'] = 3;
    let getUrl = 'orders/inventoried';

    return this.http.getReq(getUrl, { params: x });
  }

  loadDataWithFilter(filterParams: any, filterType: number) {
    this.subs.add(
      this.getAllData(filterParams).subscribe({
        next: (res) => {
          this.ClientInvoices = [];
          res.data.forEach((element: any) => {
            const allBatchesQuantityZero = element.cart.every(
              (cartItem: any) => cartItem.quantity == 0
            );

            this.ClientInvoices.push({
              order_number: element.order_number,
              client_name:
                element?.client?.name + ' ' + element?.pharmacy?.name,
              time_date: element.created_at,
              id: element.id,
              pharmacy_id: element?.pharmacy?.id,
              backGround_red:
                allBatchesQuantityZero && filterParams['product_id']
                  ? true
                  : false,
            });
          });
          this.total = res?.meta.total;
          this.rows = res.meta?.per_page;
        },
      })
    );
  }

  filterPharmacies(filterType: number) {
    const queryParams = this.getUpdatedQueryParams(filterType);
    this.loadDataWithFilter(queryParams, filterType);
  }
  filterType!: number;
  getUpdatedQueryParams(filterType: number) {
    this.filterType = filterType;
    let queryParams: any = {};

    for (const key in this.productFilter.value) {
      let value = this.productFilter.value[key];
      if (value != null && value != undefined && value != '') {
        if (key == 'created_at') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }

    for (const key in this.clientFilter.value) {
      let value = this.clientFilter.value[key];
      if (value != null && value != undefined && value != '') {
        if (key == 'created_at') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else if (key != 'code') {
          queryParams[key] = value;
        }
      }
    }

    if (this.page && Object.keys(queryParams).length > 0) {
      queryParams['page'] = this.page;
    }
    if (Object.keys(queryParams).length > 0) {
      return queryParams;
    } else {
      this.ClientInvoices = [];
    }
  }

  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams(this.filterType);
    this.loadDataWithFilter(queryParams, this.filterType);
  }

  getDropdownData() {
    //pharamcy
    let pharmacies: any = [];

    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          pharmacies = res.data;
          pharmacies.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.groupPharmacies.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
                pharmacy_id: client?.name,
              });
            });
          });
        },
      })
    );

    //products
    this.subs.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );
  }

  viewReturnDetails(ids: any) {
    this.router.navigate([
      `/warehouse/storekeeper/customer-returns/register-return-permission/${ids.id}/${ids.pharmacy_id}`,
    ]);
  }
}
