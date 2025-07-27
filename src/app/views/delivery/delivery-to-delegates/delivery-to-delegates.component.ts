import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { city } from '@models/pharmacie';
import { supplier } from '@models/suppliers';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, of, Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-delivery-to-delegates',
  templateUrl: './delivery-to-delegates.component.html',
  styleUrls: ['./delivery-to-delegates.component.scss'],
})
export class DeliveryToDelegatesComponent implements OnInit {
  isActiveTapArray: boolean[] = Array(4).fill(false);
  private subscription = new Subscription();
  searchForm!: FormGroup;
  deliveryForm!: FormGroup;
  returnForm!: FormGroup;
  delayForm!: FormGroup;
  columnsArray: columnHeaders[] = [
    {
      name: 'اختيار',
    },
    {
      name: ' م ترتيب	',
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
      name: 'تسليم',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'check_value',
      type: 'checkbox_receive',
    },
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
      name: 'delivery',
      type: 'delivery',
    },
  ];
  additional_data: any = {};
  data: any = [];
  receiving_reviewer: supplier[] = [];
  warehouses: supplier[] = [];
  pharmacies: supplier[] = [];
  tracks: supplier[] = [];
  clients: supplier[] = [];
  reasons: any[] = [];
  distributer_employees: supplier[] = [];
  cities: city[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,

    private http: HttpService,
    private printService: PrintService,
    private generalService: GeneralService
  ) {}
  ngOnInit() {
    this.isActiveTapArray[0] = true;
    this.getDropdownData();
    this.searchForm = this.fb.group({
      track_id: [''],
      city_id: [''],
      client_id: [''],
      pharmacy_id: [''],
      delivery_id: [''],
    });
    this.deliveryForm = this.fb.group({
      delivery_id: [''],
      delivery_name: [''],
      delivery_with_mate_id: [''],
      driver_id: [''],
      directly_received: [false],
    });
    this.returnForm = this.fb.group({
      reason: [''],
      note: [''],
    });
    this.delayForm = this.fb.group({
      delayed_to: [''],
      client_name: [''],
      delayed_reason: [''],
      note: [''],
    });
    this.ConnectToParams();
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
              data['serial'] = index + 1;

              return data;
            });

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
    if (this.isActiveTapArray[0]) {
      getUrl = 'orders/distribution';
    } else if (this.isActiveTapArray[1]) {
      getUrl = 'orders/distribution/delayed';
    } else if (this.isActiveTapArray[2]) {
      getUrl = 'orders/distribution/fast';
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
      this.openPrintModal();
    }, 100);
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openPrintModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
  index_to_update!: number;
  @ViewChild('updateShortageModelbtn')
  updateShortageModelbtn!: ElementRef<HTMLElement>;

  openModal(event: any) {
    this.index_to_update = event.index;
    let el: HTMLElement = this.updateShortageModelbtn.nativeElement;
    el.click();
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
    this.reasons = this.auth.getEnums().delay_reasons;
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
  filter() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
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

    return queryParams;
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
            data['serial'] = index + 1;

            return data;
          });
        },
        complete: () => {
          this.printService.setColumnsArray([
            {
              name: ' م ترتيب	',
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
          ]);
          this.printService.setColumnsNames([
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
          ]);
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

  selectedIds: any[] = [];
  updateBatchIDs(updatedIDs: any) {
    this.selectedIds = updatedIDs;
  }

  openDeliveryModalAll() {
    let el: HTMLElement = this.deliveryOpen.nativeElement;
    el.click();
  }

  sendOrder(ids: any[]) {
    let message = '';
    let queryParams: any = {};
    for (const key in this.deliveryForm.value) {
      let value = this.deliveryForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'directly_received') {
          value == true ? (queryParams[key] = 1) : '';
        } else {
          queryParams[key] = value;
        }
      }
    }
    this.subscription.add(
      this.http
        .putReq('orders/distribution/dispatch', {
          orders: ids,
          ...queryParams,
        })
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.toastrService.success(message);
          },
        })
    );
  }
  changeActiveTap(index: number) {
    this.isActiveTapArray.fill(false);
    this.isActiveTapArray[index] = true;
    if (index == 0) {
      this.ConnectToParams();
    } else if (index == 1) {
      this.ConnectToParams();
    } else if (index == 2) {
      this.ConnectToParams();
    }
  }
  selectedId: any;
  @ViewChild('deliveryOpen') deliveryOpen!: ElementRef<HTMLElement>;
  @ViewChild('returnOpen') returnOpen!: ElementRef<HTMLElement>;
  @ViewChild('delayOpen') delayOpen!: ElementRef<HTMLElement>;
  openDeliveryModal(event: any) {
    console.log(event);
    if (event.name == 'تأجيل') {
      this.selectedId = event.id;

      let el: HTMLElement = this.delayOpen.nativeElement;
      el.click();
    } else if (event.name == 'مرتجع') {
      this.selectedId = event.id;
      let el: HTMLElement = this.returnOpen.nativeElement;
      el.click();
    } else {
      this.selectedIds = [event];
      let el: HTMLElement = this.deliveryOpen.nativeElement;
      el.click();
    }
  }

  returnOrder(id: any) {
    let message = '';
    let queryParams: any = {};
    for (const key in this.returnForm.value) {
      let value = this.returnForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        queryParams[key] = value;
      }
    }
    this.subscription.add(
      this.http
        .postReq('orders/distribution/return', {
          order_id: id,
          ...queryParams,
        })
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.toastrService.success(message);
          },
        })
    );
  }

  delayOrder(id: any) {
    let message = '';
    let queryParams: any = {};
    for (const key in this.delayForm.value) {
      let value = this.delayForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'delayed_to') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    this.subscription.add(
      this.http
        .putReq('orders/distribution/delay', {
          order_id: id,
          ...queryParams,
        })
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.toastrService.success(message);
          },
        })
    );
  }
}
