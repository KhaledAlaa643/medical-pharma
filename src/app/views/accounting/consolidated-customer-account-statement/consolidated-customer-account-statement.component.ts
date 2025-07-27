import { DatePipe } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city, area } from '@models/pharmacie';
import { commonObject, FiltersObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue, colSpanArray } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap, catchError, of } from 'rxjs';
const datePipe = new DatePipe('en-EG');
interface additional_data {
  pharmacies_count: number;
  debit: string;
  credit: number;
  net_balance: string;
}
@Component({
  selector: 'app-consolidated-customer-account-statement',
  templateUrl: './consolidated-customer-account-statement.component.html',
  styleUrls: ['./consolidated-customer-account-statement.component.scss'],
})
export class ConsolidatedCustomerAccountStatementComponent {
  filterForm!: FormGroup;
  private subscription = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'كود العميل',
    },
    {
      name: 'اسم العميل',
    },
    {
      name: 'تاريخ اخر عملية بيع',
    },
    {
      name: 'تاريخ اخر استلام نقدية',
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
      name: 'id',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'ClickableBlue',
    },
    {
      name: 'last_order_created_at',
      type: 'normal',
    },
    {
      name: 'last_cash_receive_created_at',
      type: 'normal',
    },
    {
      name: 'first_transaction_balance_debit',
      type: 'normal',
    },
    {
      name: 'first_transaction_balance_credit',
      type: 'normal',
    },
    {
      name: 'last_transaction_balance_debit',
      type: 'normal',
    },
    {
      name: 'last_transaction_balance_credit',
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
      colSpan: 1,
      name: '',
    },
    {
      colSpan: 2,
      name: 'رصيد اول المدة',
    },
    {
      colSpan: 2,
      name: 'رصيد اخر المدة',
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
      pharmacy_id: [''],
      client_id: [''],
      status: [''], //check
      date_from: [''],
      date_to: [''],
      balance_from: [''],
      balance_to: [''],
      pharmacy_status: [''],
      city_id: [''],
      area_id: [''],
      type: [''],
      products_type: [''],
      has_taxes: [''],
      discount_tier: [''],

      delivery_id: [''],
      idle_days: [''],
      quota_repeat: [''],
      sales_id: [''],
      ex_discount_value: [''],
      balance_type: [''],
      track_id: [''],
      payment_period: [''],
      payment_type: [''],
      last_order_date: [''],
      last_cash_receive_date: [''],
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
      getUrl = 'accounting/client-volume/totals';
    } else {
      getUrl = 'accounting/client-volume/totals/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }
  clients: supplier[] = [];
  selected_pharmacy: supplier = {} as supplier;
  pharmacy_status: commonObject[] = [];
  pharmacies: supplier[] = [];
  cities: city[] = [];
  areas: area[] = [];
  products_type: commonObject[] = [];
  discount_tier: commonObject[] = [];
  balance_status: any[] = [];
  tracks: FiltersObject[] = [];
  payment_type: commonObject[] = [];
  cash_discount = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  payment_periods: commonObject[] = [];
  ListingType: commonObject[] = [];
  sales: FiltersObject[] = [];
  deliveries: FiltersObject[] = [];
  supplier_idle_days: commonObject[] = [];
  types: commonObject[] = [];
  has_taxes: commonObject[] = [];
  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['clients', 'deliveries', 'tracks', 'sales'])
        .subscribe({
          next: (res) => {
            this.clients = res.data.clients;
            this.sales = res.data.sales;
            this.deliveries = res.data.deliveries;
            this.tracks = res.data.tracks;
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
    this.pharmacy_status = this.auth.getEnums().pharmacy_status;
    this.discount_tier = this.auth.getEnums().discount_slats;
    this.payment_type = this.auth.getEnums().payment_types;
    this.types = this.auth.getEnums().supplier_type;
    this.has_taxes = this.auth.getEnums().has_taxes;
    this.payment_periods = this.auth.getEnums().payment_periods;
    this.ListingType = this.auth.getEnums().ListingType;
    const balanceStatus = this.auth.getEnums().balance_status;
    console.log(balanceStatus);
    this.balance_status = Object.entries(balanceStatus).map(([key, value]) => ({
      value: key,
      name: value,
    }));
    console.log(this.balance_status);

    this.supplier_idle_days = this.auth
      .getEnums()
      .supplier_idle_days.map((shelf: string) => ({ number: shelf }));
  }

  fetchClientData(params: any): void {
    this.pharmacies = [];
    if (params.id) {
      this.subscription.add(
        this.http.getReq('clients/dropdown', { params }).subscribe({
          next: (res) => {
            this.pharmacies = res.data[0]?.pharmacies;
          },
        })
      );
    }
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
        if (
          key == 'date_from' ||
          key == 'date_to' ||
          key == 'last_cash_receive_date' ||
          key == 'last_order_date'
        ) {
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

  goToAccountStatement(data: any) {
    this.router.navigate([`/accounting/customer-account-statement/${data.id}`]);
  }
}
