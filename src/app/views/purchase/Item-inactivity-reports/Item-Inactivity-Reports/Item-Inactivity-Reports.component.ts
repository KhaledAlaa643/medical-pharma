import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { commonObject } from '@models/settign-enums';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-Item-Inactivity-Reports',
  templateUrl: './Item-Inactivity-Reports.component.html',
  styleUrls: ['./Item-Inactivity-Reports.component.scss'],
})
export class ItemInactivityReportsComponent implements OnInit {
  private subscription = new Subscription();
  inactiveProducts: any = [];
  filterForm!: FormGroup;
  columnsArray: columnHeaders[] = [
    {
      name: 'الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'التاريخ والتشغيلة',
    },
    {
      name: 'تصنيع شركة',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم المورد ',
    },
    {
      name: 'المحطة ',
    },
    {
      name: 'تاريخ التوريد ',
    },
    {
      name: 'الكمية ',
    },
    {
      name: 'سبب الركود ',
    },
    {
      name: 'عدد شهور الركود ',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'exp',
      type: 'normal',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'supplier_name',
      type: 'normal',
    },
    {
      name: 'location',
      type: 'normal',
    },
    {
      name: 'supplied_at',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'idle_reason',
      type: 'normal',
    },

    {
      name: 'idle_months',
      type: 'redbackground',
    },
  ];
  constructor(
    private http: HttpService,
    private generalService: GeneralService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {}
  multiple_corridors_enabled!: string;

  ngOnInit() {
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
    }

    this.getDropdownData();
    this.filterForm = this.fb.group({
      product_name: [''],
      manufactured_by: [''],
      supplier_id: [''],
      supplied_at: [''],
      quantity_more: [''],
      quantity: [''],
      idle_months: [''],
      corridor_id: [''],
      warehouse_id: [''],
    });

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
            this.inactiveProducts = [];
            res.data.forEach((products: any) => {
              this.inactiveProducts.push({
                product_name: products.product_name,
                exp: products.operating_number + ' ' + products?.expired_at,
                manufacturer_name: products.manufacturer_name,
                supplier_name: products.supplier_name,
                location: products.location,
                supplied_at: products.supplied_at,
                quantity: products.quantity,
                idle_reason: 'لم يتم بيع منذ' + ' ' + products.idle_reason,
                idle_months: products.idle_months,
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

    let getUrl = 'products/idle';

    return this.http.getReq(getUrl, { params: x });
  }
  page: number = 1;
  total!: number;
  rows!: number;

  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  filter() {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  changepage(event: any) {
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
        if (key == 'supplied_at') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    if (this.page) {
      queryParams['page'] = this.page;
    }
    if (this.sortData) {
      queryParams['sort_by'] = this.sortData.name;
      queryParams['direction'] = this.sortData.direction;
    }
    return queryParams;
  }

  sortData: any;
  sort(sortData: any) {
    this.sortData = sortData;
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }
  manufacturers: commonObject[] = [];
  suppliers: commonObject[] = [];
  warehouses: commonObject[] = [];
  corridors: commonObject[] = [];
  monthes: any = [];
  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['static_manufacturers', 'suppliers', 'corridors'])
        .subscribe({
          next: (res) => {
            this.manufacturers = res.data.static_manufacturers;
            this.suppliers = res.data.suppliers;
          },
        })
    );

    this.subscription.add(
      this.generalService
        .getWarehousesDropdown({ module: 'purchases', purchases: 1 })
        .subscribe({
          next: (res) => {
            this.warehouses = res.data;
          },
        })
    );

    this.monthes = this.auth
      .getEnums()
      .idle_product_months.map((shelf: string) => ({ number: shelf }));

    //corridore
    this.subscription.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridors = res.data;
        },
      })
    );
  }
}
