import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city } from '@models/pharmacie';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { switchMap, catchError, of, Subscription } from 'rxjs';

@Component({
  selector: 'app-delivered-to-delegates',
  templateUrl: './delivered-to-delegates.component.html',
  styleUrls: ['./delivered-to-delegates.component.scss'],
})
export class DeliveredToDelegatesComponent implements OnInit {
  isActiveTapArray: boolean[] = Array(4).fill(false);
  private subscription = new Subscription();
  searchForm!: FormGroup;
  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];
  page: number = 1;
  rows!: number;
  total!: number;
  additional_data: any = {};
  data: any = [];
  receiving_reviewer: supplier[] = [];
  warehouses: supplier[] = [];
  pharmacies: supplier[] = [];
  tracks: supplier[] = [];
  clients: supplier[] = [];
  distributer_employees: supplier[] = [];
  cities: city[] = [];
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
    this.isActiveTapArray[0] = true;
    this.columnsArray = [
      {
        name: 'م',
      },

      {
        name: ' رقم الأذن	',
      },

      {
        name: 'اسم العميل',
      },
      {
        name: 'المدينة',
      },
      {
        name: ' العنوان	',
      },
      {
        name: 'نوع التعامل',
      },
      {
        name: 'اجمالي مبلغ الأذن',
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
        name: 'تاريخ الاستلام',
      },
      {
        name: 'طريقة التسليم',
      },
      {
        name: 'تاريخ التسليم',
      },
    ];
    this.columnsName = [
      {
        name: 'serial',
        type: 'normal',
      },
      {
        name: 'order_id',
        type: 'normal',
      },

      {
        name: 'client_name',
        type: 'normal',
      },
      {
        name: 'city_name',
        type: 'normal',
      },
      {
        name: 'area_name',
        type: 'normal',
      },
      {
        name: 'payment_type',
        type: 'normal.name',
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
        name: 'shipping_type',
        type: 'multiple_values_array',
      },
      {
        name: 'delivered_at',
        type: 'normal',
      },
    ];
    this.initForm();
    this.ConnectToParams();
    this.getDropdownData();
  }

  initForm() {
    this.searchForm = this.fb.group({
      track_id: [''],
      city_id: [''],
      client_id: [''],
      pharmacy_id: [''],
      delivery_id: [''],
    });
  }

  getDropdownData() {
    this.subscription.add(
      this.generalService.getDropdownData(['deliveries', 'tracks']).subscribe({
        next: (res) => {
          this.distributer_employees = res.data.deliveries;
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
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
  }
  getPharmacies() {
    this.subscription.add(
      this.http
        .getReq(`clients?id=${this.searchForm.value.client_id}`)
        .subscribe({
          next: (res) => {
            this.pharmacies = res.data[0].pharmacies;
          },
        })
    );
  }

  ConnectToParams() {
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
            this.data = res.data.map((data: any, index: number) => {
              data['shipping_type'] = [];
              data.is_directly_received
                ? data['shipping_type'].push(data.directly_receiver_name)
                : data['shipping_type'].push(
                    data.driver_name,
                    data.delivery_name
                  );
              data['serial'] = index + 1 + (this.page - 1) * 10;
              return data;
            });
            console.log(this.data);
            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.additional_data = res.additional_data;
            // this.totalPriceSum=res.additional_data.total_price_sum
          },
        })
    );
  }
  changeActiveTap(index: number) {
    this.isActiveTapArray.fill(false);
    this.isActiveTapArray[index] = true;
    if (index == 0) {
      this.columnsArray = [
        {
          name: 'م',
        },

        {
          name: ' رقم الأذن	',
        },

        {
          name: 'اسم العميل',
        },
        {
          name: 'المدينة',
        },
        {
          name: ' العنوان	',
        },
        {
          name: 'نوع التعامل',
        },
        {
          name: 'اجمالي مبلغ الأذن',
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
          name: 'تاريخ الاستلام',
        },
        {
          name: 'طريقة التسليم',
        },
        {
          name: 'تاريخ التسليم',
        },
      ];
      this.columnsName = [
        {
          name: 'serial',
          type: 'normal',
        },
        {
          name: 'order_id',
          type: 'normal',
        },

        {
          name: 'client_name',
          type: 'normal',
        },
        {
          name: 'city_name',
          type: 'normal',
        },
        {
          name: 'area_name',
          type: 'normal',
        },
        {
          name: 'payment_type',
          type: 'normal.name',
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
          name: 'shipping_type',
          type: 'multiple_values_array',
        },
        {
          name: 'delivered_at',
          type: 'normal',
        },
      ];
      this.ConnectToParams();
    } else if (index == 1) {
      this.columnsArray = [
        {
          name: 'م',
        },

        {
          name: ' رقم الأذن	',
        },

        {
          name: 'اسم العميل',
        },
        {
          name: 'المدينة',
        },
        {
          name: ' العنوان	',
        },
        {
          name: 'نوع التعامل',
        },
        {
          name: 'اجمالي مبلغ الأذن',
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
          name: 'تاريخ الاستلام',
        },
        {
          name: 'طريقة التسليم',
        },

        {
          name: 'تاريخ التأجيل',
        },
      ];
      this.columnsName = [
        {
          name: 'serial',
          type: 'normal',
        },
        {
          name: 'order_id',
          type: 'normal',
        },

        {
          name: 'client_name',
          type: 'normal',
        },
        {
          name: 'city_name',
          type: 'normal',
        },
        {
          name: 'area_name',
          type: 'normal',
        },
        {
          name: 'payment_type',
          type: 'normal.name',
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
          name: 'shipping_type',
          type: 'multiple_values_array',
        },
        {
          name: 'delayed_to',
          type: 'normal',
        },
      ];
      this.ConnectToParams();
    } else if (index == 2) {
      this.columnsArray = [
        {
          name: 'م',
        },

        {
          name: ' رقم الأذن	',
        },

        {
          name: 'اسم العميل',
        },
        {
          name: 'المدينة',
        },
        {
          name: ' العنوان	',
        },
        {
          name: 'نوع التعامل',
        },
        {
          name: 'اجمالي مبلغ الأذن',
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
          name: 'تاريخ الاستلام',
        },

        {
          name: 'تاريخ التسليم',
        },
      ];
      this.columnsName = [
        {
          name: 'serial',
          type: 'normal',
        },
        {
          name: 'order_id',
          type: 'normal',
        },

        {
          name: 'client_name',
          type: 'normal',
        },
        {
          name: 'city_name',
          type: 'normal',
        },
        {
          name: 'area_name',
          type: 'normal',
        },
        {
          name: 'payment_type',
          type: 'normal.name',
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
          name: 'delivered_at',
          type: 'normal',
        },
      ];
      this.ConnectToParams();
    }
  }
  index_to_update!: number;

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (this.isActiveTapArray[0]) {
      if (paginated) {
        getUrl = 'orders/delivery';
      } else {
        getUrl = 'orders/delivery/all';
      }
    } else if (this.isActiveTapArray[1]) {
      if (paginated) {
        getUrl = 'orders/delivery/delayed';
      } else {
        getUrl = 'orders/delivery/delayed/all';
      }
    } else if (this.isActiveTapArray[2]) {
      if (paginated) {
        getUrl = 'orders/delivery/fast';
      } else {
        getUrl = 'orders/delivery/fast/all';
      }
    }

    return this.http.getReq(getUrl, { params: x });
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

  allPrintData: any = [];
  currentParams: any = {};
  getAllOrders(printType: any) {
    let params = {};
    params = this.currentParams;
    this.subscription.add(
      this.getAllData(params, false).subscribe({
        next: (res) => {
          this.allPrintData = res.data;
          this.allPrintData = res.data.map((data: any, index: number) => {
            data['shipping_type'] = [];
            data.is_directly_received
              ? data['shipping_type'].push(data.directly_receiver_name)
              : data['shipping_type'].push(
                  data.driver_name,
                  data.delivery_name
                );
            data['serial'] = index + 1 + (this.page - 1) * 10;
            return data;
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

  filter() {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.searchForm.value) {
      let value = this.searchForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        queryParams[key] = value;
      }
    }

    if (this.page) {
      queryParams['page'] = this.page;
    }

    return queryParams;
  }

  changepage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }
}
