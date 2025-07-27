import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { area, city } from '@models/pharmacie';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { colSpanArray, columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface additional_data {
  totalSuppliersNumber: number;
  debit: string;
  credit: number;
  net_balance: string;
}

@Component({
  selector: 'app-suppliers-grouped-account-statement',
  templateUrl: './suppliers-grouped-account-statement.component.html',
  styleUrls: ['./suppliers-grouped-account-statement.component.scss'],
})
export class SuppliersGroupedAccountStatementComponent implements OnInit {
  filterForm!: FormGroup;
  private subscription = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'كود المورد',
    },
    {
      name: 'اسم المورد',
    },
    {
      name: 'تاريخ اخر عملية  ',
    },
    {
      name: 'مدين ',
    },
    {
      name: 'دائن',
    },
    {
      name: 'مدين',
    },
    {
      name: 'دائن',
    },
    {
      name: 'مدين',
    },
    {
      name: 'دائن',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'supplier_id',
      type: 'normal',
    },
    {
      name: 'supplier_name',
      type: 'ClickableBlueSupplier',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'amount_debit',
      type: 'normal',
    },
    {
      name: 'amount_credit',
      type: 'normal',
    },
    {
      name: 'balance_before_debit',
      type: 'normal',
    },
    {
      name: 'balance_before_credit',
      type: 'normal',
    },
    {
      name: 'balance_after_debit',
      type: 'blueBackgroundWithoutLine',
    },
    {
      name: 'balance_after_credit',
      type: 'blueBackgroundWithoutLine',
    },
  ];
  colSpanArray: colSpanArray[] = [
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 2,
      name: 'الحركات الحالية',
    },
    {
      colSpan: 2,
      name: 'الحساب السابق',
    },
    {
      colSpan: 2,
      name: 'الرصيد الحالي',
    },
  ];
  data: any = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: additional_data = {} as additional_data;
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private printService: PrintService,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    this.getDropdownData();
    this.filterForm = this.fb.group({
      supplier_id: [''],
      status: [''], //check
      from: [''],
      to: [''],
      balance_from: [''],
      balance_to: [''],
      balance_status: [''],
      city_id: [''],
      area_id: [''],
      type: [''],
      products_type: [''],
      has_taxes: [''],
      discount_tier: [''],
      grace_period_from: [''],
      grace_period_to: [''],
      idle_days: [''],
      quota_repeat: [''],
      quota_days: [''],
      call_shift: [''],
    });
    this.subscription.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param, true).pipe(
              catchError((error) => {
                return of({ data: [] });
              })
            );
          })
        )
        .subscribe({
          next: (res) => {
            this.data = res.data;
            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.additional_data = res.additional_data;
            // this.totalPriceSum=res.additional_data.total_price_sum
          },
        })
    );
  }
  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'suppliers/suppliers-reports';
    } else {
      getUrl = 'suppliers/suppliers-reports/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }
  suppliers: supplier[] = [];
  selected_supplier: supplier = {} as supplier;
  balance_status: commonObject[] = [];
  cities: city[] = [];
  areas: area[] = [];
  products_type: commonObject[] = [];
  discount_tier: commonObject[] = [];
  payment_type: commonObject[] = [];
  supplier_idle_days: commonObject[] = [];
  types: commonObject[] = [];
  has_taxes: commonObject[] = [];
  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['suppliers', 'purchases_employees', 'warehouses'])
        .subscribe({
          next: (res) => {
            this.suppliers = res.data.suppliers;
            // this.created_by = res.data.purchases_employees
            // this.warehouses = res.data.warehouses
          },
        })
    );
    this.subscription.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
    this.balance_status = this.auth.getEnums().balance_status;
    this.discount_tier = this.auth.getEnums().discount_slats;
    this.payment_type = this.auth.getEnums().payment_types;
    this.types = this.auth.getEnums().supplier_type;
    this.has_taxes = this.auth.getEnums().has_taxes;
    this.supplier_idle_days = this.auth
      .getEnums()
      .supplier_idle_days.map((shelf: string) => ({ number: shelf }));
    // this.subscription.add(this.http.getReq('products/dropdown').subscribe({
    //   next:res=>{
    //     this.products=res.data
    //   }
    // }))
  }

  getArea(dropdown: any) {
    if (!dropdown.overlayVisible) {
      if (this.filterForm.controls['city_id'].value) {
        let params = {
          city_id: this.filterForm.controls['city_id'].value,
        };
        this.subscription.add(
          this.generalService.getCity(params).subscribe({
            next: (res) => {
              this.areas = res.data[0].areas;
            },
          })
        );
      } else {
        this.areas = [];
      }
    }
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
        if (key == 'from' || key == 'to') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
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

  //printing
  allPrintData: any = [];
  currentParams: any = {};
  getAllOrders(printType: any) {
    let params = {};
    params = this.currentParams;
    this.subscription.add(
      this.getAllData(params, false).subscribe({
        next: (res) => {
          this.allPrintData = res.data;
        },
        complete: () => {
          this.printService.setColumnsArray(this.columnsArray);
          this.printService.setColumnsNames(this.columnsName);
          this.printService.setRowsData(this.allPrintData);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
        },
      })
    );
  }
  sortData: any;
  sort(sortData: any) {
    this.sortData = sortData;
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = [];
    data.forEach((request: any) => {
      tempArr.push({
        order_num: request.id,
        supplier_name: request.supplier.name,
        created_by: request.created_by.name,
        created_at: request.created_at,
        reviewed_at: request.reviewed_at,
        products_num: request.total_cart_items,
        total: request.total_price,
        warehouse_name: request.warehouse.name,
        status: request.status.name,
      });
    });

    if (pagiated == true) {
      this.data = tempArr;
    } else {
      this.allPrintData = tempArr;
    }
  }

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllOrders(printData.type);
    } else {
      this.printService.setColumnsArray(this.columnsArray);
      this.printService.setColumnsNames(this.columnsName);
      this.printService.setRowsData(this.data);

      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
    }

    setTimeout(() => {
      this.openModal();
    }, 100);
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

  goToAccountStatement(id: any) {
    this.router.navigate([`/purchases/supply/account-statement/${id}`]);
  }
}
