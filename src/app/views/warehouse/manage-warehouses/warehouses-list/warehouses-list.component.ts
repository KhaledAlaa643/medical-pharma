import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city } from '@models/pharmacie';
import { warehouses } from '@models/products';
import { commonObject, enums } from '@models/settign-enums';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-warehouses-list',
  templateUrl: './warehouses-list.component.html',
  styleUrls: ['./warehouses-list.component.scss'],
})
export class WarehousesListComponent implements OnInit {
  private subscription = new Subscription();
  warehouses_count: number = 2000;
  warehouses: warehouses[] = [];
  cities: city[] = [];
  area: commonObject[] = [];
  columnsArray: columnHeaders[] = [
    {
      name: 'الكود',
    },
    {
      name: 'اسم المخزن',
    },
    {
      name: 'شاشات الظهور',
    },
    {
      name: 'رقم الهاتف',
    },
    {
      name: 'العنوان',
    },
    {
      name: 'المحافظة',
    },
    {
      name: 'المدينة',
    },
    {
      name: 'حالة المخزن',
    },
    {
      name: 'ملاحظة علي المخزن',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'id',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'nameClickableBlue',
    },
    {
      name: 'screens',
      type: 'multiple_values_double',
    },
    {
      name: 'phone_number',
      type: 'normal',
    },
    {
      name: 'address',
      type: 'normal',
    },
    {
      name: 'city',
      type: 'normal.name',
    },
    {
      name: 'area',
      type: 'normal.name',
    },
    {
      name: 'status',
      type: 'normal.name',
    },
    {
      name: 'notes',
      type: 'normal',
    },
  ];
  filterForm!: FormGroup;
  warehouseStatus: any;
  warehouses_all: warehouses[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private router: Router,
    private generalService: GeneralService,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.getCities();
    this.warehouseStatus = this.auth.getEnums().warehouse_status;

    this.filterForm = this.fb.group({
      id: [''],
      warehouse_id: [''],
      city_id: [''],
      area_id: [''],
      retail_sales: [''],
      bulk_sales: [''],
      is_main: [''],
      sales_return: [''],
      purchases: [''],
      purchases_return: [''],
      transfers: [''],
      inventory: [''],
      status: [''],
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
            this.warehouses = [];
            res.data.forEach((warehouse: any) => {
              let screens: any = [];
              if (warehouse.retail_sales) {
                screens.push({ name: 'مبيعات قطاعي' });
              }
              if (warehouse.bulk_sales) {
                screens.push({ name: 'مبيعات جملة' });
              }
              if (warehouse.is_main) {
                screens.push({ name: 'افتراضي في المبيعات' });
              }
              if (warehouse.sales_return) {
                screens.push({ name: 'مردود مبيعات' });
              }
              if (warehouse.purchases) {
                screens.push({ name: 'مشتريات' });
              }
              if (warehouse.purchases_return) {
                screens.push({ name: 'مردود مشتريات' });
              }
              if (warehouse.transfers) {
                screens.push({ name: 'تحويلات' });
              }
              if (warehouse.inventory) {
                screens.push({ name: 'جرد' });
              }
              this.warehouses.push({ ...warehouse, screens: screens });
            });
            this.warehouses_count = res.meta.total;

            this.rows = res.meta.per_page;
          },
        })
    );
  }

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value && value != 0) x[key] = value;
    }
    let getUrl = 'warehouses';

    return this.http.getReq(getUrl, { params: x });
  }
  getArea(dropdown: any) {
    if (!dropdown.overlayVisible) {
      let params = {
        city_id: this.filterForm.controls['city_id'].value,
      };
      this.subscription.add(
        this.generalService.getCity(params).subscribe({
          next: (res) => {
            this.area = res.data[0].areas;
          },
        })
      );
    }
  }

  getCities() {
    this.subscription.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
  }

  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

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

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (
          key === 'bulk_sales' ||
          key === 'inventory' ||
          key === 'is_main' ||
          key === 'purchases' ||
          key === 'purchases_return' ||
          key === 'retail_sales' ||
          key === 'sales_return' ||
          key === 'transfers'
        ) {
          queryParams[key] = value == true ? 1 : 0;
        } else {
          queryParams[key] = value;
        }
      }
    }

    if (this.page) {
      queryParams['page'] = this.page;
    }
    return queryParams;
  }

  navigateToEdit(id: any) {
    this.router.navigate([`/warehouse/manage-warehouses/edit/${id}`]);
  }
}
