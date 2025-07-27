import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city, area } from '@models/pharmacie';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { Subscription, switchMap, catchError, of } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-electronic-received',
  templateUrl: './electronic-received.component.html',
  styleUrls: ['./electronic-received.component.scss'],
})
export class ElectronicReceivedComponent implements OnInit {
  filterForm!: FormGroup;
  private subscription = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'م',
    },
    {
      name: 'رقم الأذن',
    },
    {
      name: 'اسم العميل',
    },
    {
      name: 'المدينة',
    },
    {
      name: 'العنوان',
    },
    {
      name: 'نوع التعامل',
    },
    {
      name: ' اجمالي مبلغ الأذن ',
    },
    {
      name: 'شنطة',
    },
    {
      name: 'كرتونة',
    },
    {
      name: 'ثلاجة',
    },
    {
      name: 'داخل أذن رقم',
    },
    {
      name: 'وقت وتاريخ الاستلام',
    },
    {
      name: 'الملاحظات',
    },
    {
      name: 'الحساب السابق',
    },
    {
      name: 'الرصيد الحالي',
    },
    {
      name: 'مستلم',
    },
    {
      name: 'مراجع القطاعي ',
    },
    {
      name: 'مندوب البيع ',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'serial',
      type: 'normal',
    },
    {
      name: 'order_id',
      type: 'normal',
    },
    {
      name: 'pharmacy_name',
      type: 'normal',
    },
    {
      name: 'area_name',
      type: 'normal',
    },
    {
      name: 'city_name',
      type: 'normal',
    },

    {
      name: 'payment_type',
      type: 'normal',
    },
    {
      name: 'balance',
      type: 'normal',
    },
    {
      name: 'received_bags',
      type: 'normal',
    },
    {
      name: 'received_cartons',
      type: 'normal',
    },
    {
      name: 'received_fridges',
      type: 'normal',
    },
    {
      name: 'order_number',
      type: 'normal',
    },
    {
      name: 'received_at',
      type: 'normal',
    },
    {
      name: 'note',
      type: 'normal',
    },
    {
      name: 'last_balance',
      type: 'normal',
    },
    {
      name: 'current_balance',
      type: 'normal',
    },
    {
      name: 'receiver_name',
      type: 'normal',
    },
    {
      name: 'reviewer_name',
      type: 'normal',
    },
    {
      name: 'sales_name',
      type: 'normal',
    },
  ];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
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
      client_id: [],
      pharmacy_id: [],
      track_id: [],
      warehouse_id: [],
      area_id: [],
      date_from: [],
      time_from: [],
      time_to: [],
      date_to: [],
      orders_from: [],
      orders_to: [],
      reviewer_id: [],
      sales_id: [],
      fast_shipping: [false],
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
            this.data = res.data.map((received: any, index: number) => {
              return {
                serial: index + 1 + (this.page - 1) * 10,
                order_id: received.order_id,
                pharmacy_name: received.pharmacy_name,
                city_name: received.city_name,
                area_name: received.area_name,
                payment_type: received.payment_type.name,
                balance: received.balance,
                received_bags: received.manually_received
                  ? `${received.received_bags} / ${received.bags_num}`
                  : received.received_bags,
                received_cartons: received.manually_received
                  ? `${received.received_cartons} / ${received.cartons_num}`
                  : received.received_cartons,
                received_fridges: received.manually_received
                  ? `${received.received_fridges} / ${received.fridges_num}`
                  : received.received_fridges,
                order_number: received.order_number,
                received_at: received.received_at,
                note: received.note,
                last_balance: received.last_balance,
                current_balance: received.current_balance,
                receiver_name: received.receiver_name,
                reviewer_name: received.reviewer_name,
                sales_name: received.sales_name,
              };
            });
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
      getUrl = 'orders/receive/received';
    } else {
      getUrl = 'orders/receive/received/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }
  receiving_reviewer: supplier[] = [];
  warehouses: supplier[] = [];
  pharmacies: supplier[] = [];
  tracks: supplier[] = [];
  clients: supplier[] = [];
  distributer_employees: supplier[] = [];
  areas: city[] = [];
  getDropdownData() {
    this.subscription.add(
      this.generalService
        .getDropdownData(['sales_auditors ', 'sales ', 'tracks'])
        .subscribe({
          next: (res) => {
            this.receiving_reviewer = res.data.receiving_reviewer;
            this.distributer_employees = res.data.distributer_employees;
            this.tracks = res.data.tracks;
          },
        })
    );
    this.subscription.add(
      this.generalService
        .getWarehousesDropdown({ module: 'delivery' })
        .subscribe({
          next: (res) => {
            this.warehouses = res.data;
          },
          complete: () => {
            // this.initWarehouseDiscounts();
          },
        })
    );

    this.subscription.add(
      this.generalService.getClientsDropdown().subscribe({
        next: (res) => {
          this.clients = res.data;
        },
        complete: () => {
          // this.initWarehouseDiscounts();
        },
      })
    );
    this.subscription.add(
      this.generalService.getArea().subscribe({
        next: (res) => {
          this.areas = res.data;
        },
      })
    );
  }
  getPharmacies() {
    this.subscription.add(
      this.http
        .getReq(`clients?id=${this.filterForm.value.client_id}`)
        .subscribe({
          next: (res) => {
            this.pharmacies = res.data[0].pharmacies;
          },
        })
    );
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
        if (key == 'date_from' || key == 'date_to') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else if (key == 'fast_shipping') {
          value == true ? (queryParams[key] = 1) : '';
        } else if (key == 'time_from' || key == 'time_to') {
          queryParams[key] = `${value}:00`;
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
          this.allPrintData = res.data.map((received: any, index: number) => {
            return {
              serial: index + (this.page - 1) * 10,
              order_id: received.order_id,
              pharmacy_name: received.pharmacy_name,
              city_name: received.city_name,
              area_name: received.area_name,
              payment_type: received.payment_type.name,
              balance: received.balance,
              received_bags: received.manually_received
                ? `${received.received_bags} / ${received.bags_num}`
                : received.received_bags,
              received_cartons: received.manually_received
                ? `${received.received_cartons} / ${received.cartons_num}`
                : received.received_cartons,
              received_fridges: received.manually_received
                ? `${received.received_fridges} / ${received.fridges_num}`
                : received.received_fridges,
              order_number: received.order_number,
              received_at: received.received_at,
              note: received.note,
              last_balance: received.last_balance,
              current_balance: received.current_balance,
              receiver_name: received.receiver_name,
              reviewer_name: received.reviewer_name,
              sales_name: received.sales_name,
            };
          });
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
