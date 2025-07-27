import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject.js';
import { corridors } from '@models/corridors';
import { manufacturers } from '@models/manufacturers';
import { operatingExpiryReportData } from '@models/operating-expiry-report-data';
import { enums } from '@models/settign-enums.js';
import { suppliers } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-expirations-and-operations-reports',
  templateUrl: './expirations-and-operations-reports.component.html',
  styleUrls: ['./expirations-and-operations-reports.component.scss'],
})
export class ExpirationsAndOperationsReportsComponent implements OnInit {
  columnsArray: columnHeaders[] = [
    {
      name: 'الصنف',
      sort: true,
      direction: null,
    },
    { name: 'التاريخ   والتشغيلة ' },
    { name: 'المخزن ' },
    {
      name: 'تصنيع شركة',
      sort: true,
      direction: null,
    },
    { name: ' اسم المورد' },
    {
      name: '  المحطة',
      sort: true,
      direction: null,
    },
    { name: 'تاريخ التوريد' },
    { name: 'الكمية ' },
    { name: 'عدد الشهور المتبقية للانتهاء' },
  ];
  columnsName: ColumnValue[] = [
    { name: 'product_name', type: 'normal' },
    { name: 'exp', type: 'normal' },
    { name: 'warehouse_name', type: 'normal' },
    { name: 'manufacturer_name', type: 'normal' },
    { name: 'supplier_name', type: 'normal' },
    { name: 'location', type: 'normal' },
    { name: 'supplied_at', type: 'normal' },
    { name: 'quantity', type: 'normal' },
    { name: 'expiry_status', type: 'redbackground' },
  ];
  operatingExpiryReportFilter!: FormGroup;
  private subs = new Subscription();
  total!: number;
  rows!: number;
  page: number = 1;
  first: number = 1;
  operatingExpiryReportData: operatingExpiryReportData[] = [];
  suppliers: suppliers[] = [];
  manufacturers: manufacturers[] = [];
  corridors: corridors[] = [];
  remainingExpiry: enums[] = [];
  monthsLeft: any;
  multiple_corridors_enabled!: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    private auth: AuthService
  ) {}

  getCorridorData() {
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridors = res.data;
        },
      })
    );
  }

  getRemainingExpiry() {
    // this.subs.add(this.generalService.getSettingsEnum().subscribe({
    //     next: res => {
    //         this.remainingExpiry = res.data.batch_remaining_expiry

    //     }
    // }))
    this.remainingExpiry = this.auth.getEnums().batch_remaining_expiry;
  }

  getDropdownData() {
    this.subs.add(
      this.generalService
        .getDropdownData(['static_manufacturers', 'suppliers'])
        .subscribe({
          next: (res) => {
            this.manufacturers = res.data.static_manufacturers;
            this.suppliers = res.data.suppliers;
          },
        })
    );
  }

  ngOnInit(): void {
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
      if (this.multiple_corridors_enabled == 'false') {
        const location_index_header = this.columnsArray.findIndex(
          (c: any) => c.field == 'المحطة'
        );
        const location_index_value = this.columnsName.findIndex(
          (c: any) => c.field == 'location'
        );
        if (location_index_header > -1) {
          this.columnsArray.splice(location_index_header, 1);
        }
        if (location_index_value > -1) {
          this.columnsArray.splice(location_index_value, 1);
        }
      }
    }
    this.operatingExpiryReportFilter = this.fb.group({
      product_name: [''],
      manufactured_by: [''],
      supplier_id: [''],
      supplied_at: [''],
      real_quantity: [''],
      remaining_expiry: [''],
      corridor_id: [''],
    });

    this.getCorridorData();
    this.getRemainingExpiry();
    this.getDropdownData();

    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getOperatingExpiryReportFilter(param);
          })
        )
        .subscribe({
          next: (res) => {
            this.operatingExpiryReportData = [];
            res.data.forEach((element: any, index: number) => {
              this.operatingExpiryReportData.push({
                id: element.id,
                product_name: element.product.name,
                exp: element.expired_at + ' ' + element.operating_number,
                warehouse_name: element.warehouse.name,
                manufacturer_name: element.product.manufactured_by.name,
                supplier_name:
                  element?.supplier != null ? element?.supplier?.name : 'مرتجع',
                location:
                  element?.corridor?.number +
                  ' / ' +
                  element?.shelf +
                  ' ' +
                  element?.stand,
                created_by: element?.created_by?.name,
                supplied_at:
                  element?.supplied_at != null
                    ? element.supplied_at.split(' ')[0]
                    : element.created_at.split(' ')[0],
                quantity: element.real_quantity,
                expiry_status: element.expiry_status,
              });
            });
            this.total = res?.meta.total;
            this.rows = res.meta?.per_page;
          },
        })
    );
  }

  getOperatingExpiryReportFilter(filter: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value) {
        x[key] = value;
      }
    }
    if (
      x['sort_by'] == null ||
      x['sort_by'] == '' ||
      x['sort_by'] == undefined
    ) {
      x['sort_by'] = 'expired_at';
    }
    if (
      x['direction'] == null ||
      x['direction'] == '' ||
      x['direction'] == undefined
    ) {
      x['direction'] = 'desc';
    }
    return this.http.getReq('products/batches/almost-expired', { params: x });
  }
  @ViewChild('paginator') paginator: Paginator | undefined;

  filter() {
    this.page = 1;

    const queryParamsObject = this.getUpdatedQueryParams();

    for (const [key, value] of Object.entries(queryParamsObject)) {
      if (value === '' || value === null || value === undefined) {
        queryParamsObject[key] = null;
      }
    }
    this.router
      .navigate([], {
        queryParams: queryParamsObject,
        queryParamsHandling: 'merge',
      })
      .then(() => {
        if (this.paginator) {
          this.paginator.first = 0;
        }
      });
  }

  getUpdatedQueryParams(sorting_data?: any) {
    let queryParams: any = {};
    for (const key in this.operatingExpiryReportFilter.value) {
      let value = this.operatingExpiryReportFilter.value[key];
      if (value === '' || value === null || value === undefined) {
        queryParams[key] = null;
      } else {
        queryParams[key] = value;
      }
    }

    if (this.page) {
      queryParams['page'] = this.page;
    }
    if (sorting_data) {
      queryParams['sort_by'] = sorting_data.name;
      queryParams['direction'] = sorting_data.direction;
    }

    if (this.operatingExpiryReportFilter.controls['supplied_at'].value) {
      queryParams['supplied_at'] = datePipe.transform(
        new Date(
          this.operatingExpiryReportFilter.controls['supplied_at'].value
        ),
        'yyyy-MM-dd'
      );
    }
    return queryParams;
  }

  sorting(sortingData: any) {
    let queryParams = this.getUpdatedQueryParams(sortingData);
    this.router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }
  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
