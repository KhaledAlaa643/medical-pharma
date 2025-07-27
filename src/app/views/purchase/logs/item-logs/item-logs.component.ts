import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { manufacturers } from '@models/manufacturers';
import { products, warehouses } from '@models/products';
import { receiversAuditor } from '@models/receiver-auditors.js';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Paginator } from 'primeng/paginator';
import { Subscription, catchError, of, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-item-logs',
  templateUrl: './item-logs.component.html',
  styleUrls: ['./item-logs.component.scss'],
})
export class ItemLogsComponent implements OnInit {
  filterForm!: FormGroup;
  searchForm!: FormGroup;
  private subscription = new Subscription();
  suppliers: supplier[] = [];
  warehouses: warehouses[] = [];
  created_by: any[] = [];
  items_logs: any[] = [];
  receiving_auditors!: receiversAuditor[];
  manufacturers!: manufacturers[];
  products: products[] = [];
  statuses: commonObject[] = [];
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم الطلب   ',
    },
    {
      name: 'اسم الصنف ',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم المورد',
      sort: true,
      direction: null,
    },
    {
      name: 'الكمية  ',
    },
    {
      name: 'سعر الجمهور   ',
    },
    {
      name: 'الخصم   ',
    },
    {
      name: 'الاجمالي ',
    },
    {
      name: ' حالة الطلب ',
      sort: true,
      direction: null,
    },
    {
      name: 'تصنيع شركة',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'مراجع الاستلامات',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'purchase_id',
      type: 'normal',
    },
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'supplier_name',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'price',
      type: 'normal',
    },
    {
      name: 'discount',
      type: 'normal',
    },
    {
      name: 'total',
      type: 'normal',
    },
    {
      name: 'status',
      type: 'normal',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'receiving_auditor_name',
      type: 'normal',
    },
  ];
  // pagination data
  page: number = 1;
  rows!: number;
  total!: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    // private printService: PrintService,
    private generalService: GeneralService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.getDropdownData();
    this.filterForm = this.fb.group({
      product_name: [''],
      created_by: [''],
      manufactured_by: [''],
      supplier_id: [''],
      price_from: [''],
      price_to: [''],
      discount_from: [''],
      discount_to: [''],
      warehouse_id: [''],
      reviewed_by: [''],
    });
    this.searchForm = this.fb.group({
      product_id: [''],
      purchase_status: [''],
      created_at: [''],
    });
    this.subscription.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );

    this.subscription.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param).pipe(
              catchError((error) => {
                return of({ data: [] });
              })
            );
          })
        )
        .subscribe({
          next: (res) => {
            this.items_logs = [];
            res.data.forEach((purchase_item: any) => {
              this.items_logs.push({
                purchase_id: purchase_item.purchase.id,
                product_name: purchase_item.product_name,
                supplier_name: purchase_item.purchase.supplier.name,
                quantity: purchase_item.quantity,
                price: purchase_item.public_price,
                discount: purchase_item.discount,
                total: purchase_item.total,
                status: purchase_item.purchase.status.name,
                manufacturer_name: purchase_item.product.manufactured_by.name,
                created_by: purchase_item.created_by.name,
                receiving_auditor_name:
                  purchase_item?.purchase?.reviewed_by?.name,
              });
            });
            this.total = res.meta.total;
            this.rows = res.meta.per_page;
          },
        })
    );
  }

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }

    let getUrl = 'purchases/supply-request/items';

    return this.http.getReq(getUrl, { params: x });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData([
          'suppliers',
          'purchases_employees',
          'static_manufacturers',
          'receiving_reviewer',
        ])
        .subscribe({
          next: (res) => {
            this.suppliers = res.data.suppliers;
            this.created_by = res.data.purchases_employees;
            this.manufacturers = res.data.static_manufacturers;
            this.receiving_auditors = res.data.receiving_reviewer;
          },
        })
    );

    this.subscription.add(
      this.generalService
        .getWarehousesDropdown({ purchases: 1, module: 'purchases' })
        .subscribe({
          next: (res) => {
            this.warehouses = res.data;
          },
        })
    );

    // this.subscription.add(this.generalService.getSettingsEnum().subscribe({
    //     next: res => {

    //         this.statuses = res.data.purchase_status

    //     }
    // }))
    this.statuses = this.auth.getEnums().purchase_status;
  }

  filter() {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }
  sortData: any;
  sort(sortData: any) {
    this.sortData = sortData;
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        queryParams[key] = value;
      }
    }
    for (const key in this.searchForm.value) {
      let value = this.searchForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'created_at') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }

    if (this.sortData) {
      queryParams['sort_by'] = this.sortData.name;
      queryParams['direction'] = this.sortData.direction;
    }

    if (this.page) {
      queryParams['page'] = this.page;
    }
    return queryParams;
  }

  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }
}
