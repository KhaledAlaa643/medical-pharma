import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { catchError, of, Subscription, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
const datePipe = new DatePipe('en-EG');
interface Order {
  order_id: number;
  bags: { total: number; received: number };
  fridges: { total: number };
  cartons: { total: number };
}

@Component({
  selector: 'app-electronic-receipt',
  templateUrl: './electronic-receipt.component.html',
  styleUrls: ['./electronic-receipt.component.scss'],
})
export class ElectronicReceiptComponent implements OnInit {
  filterForm!: FormGroup;

  private subscription = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'اختيار',
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
      name: 'الملاحظات',
    },
    {
      name: 'داخل أذن رقم',
    },
    {
      name: 'الحساب السابق',
    },
    {
      name: 'الرصيد الحالي',
    },
    {
      name: 'مندوب البيع ',
    },
    {
      name: 'مراجع القطاعي ',
    },
    {
      name: 'أمر ',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'checkbox',
      type: 'checkbox_receive',
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
      name: 'bags',
      type: 'bags',
    },
    {
      name: 'cartons',
      type: 'bags',
    },
    {
      name: 'fridges',
      type: 'bags',
    },
    {
      name: 'note',
      type: 'normal',
    },
    {
      name: 'order_number',
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
      name: 'sales_name',
      type: 'normal',
    },
    {
      name: 'reviewer_name',
      type: 'normal',
    },
    {
      name: 'receive',
      type: 'receive',
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
    private toastrService: ToastrService,

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
      area_id: [],
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
            this.data = res.data.map((received: any) => {
              return {
                ...received, // Spread the original object to retain all properties
                bags: {
                  received: received['received_bags'],
                  total: received['bags_num'],
                },
                fridges: {
                  received: received['received_fridges'],
                  total: received['fridges_num'],
                },
                cartons: {
                  received: received['received_cartons'],
                  total: received['cartons_num'],
                },
              };
            });

            console.log(this.data);

            this.additional_data = res.additional_data;
          },
        })
    );
  }

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = 'orders/receive';

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
    if (this.filterForm.value.client_id) {
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
              client_name: received.client_name,
              area_name: received.area_name,
              payment_type: received.payment_type.name,
              balance: received.balance,
              bags: `${received.received_bags} / ${received.bags_num}`,
              fridges: `${received.received_fridges} / ${received.fridges_num}`,
              cartons: `${received.received_cartons} / ${received.cartons_num}`,

              cartons_num: received.cartons_num,
              fridges_num: received.received_fridges,
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
          this.printService.setColumnsArray([
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
              name: 'الملاحظات',
            },
            {
              name: 'داخل أذن رقم',
            },
            {
              name: 'الحساب السابق',
            },
            {
              name: 'الرصيد الحالي',
            },
            {
              name: 'مندوب البيع ',
            },
            {
              name: 'مراجع القطاعي ',
            },
          ]);
          this.printService.setColumnsNames([
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
              name: 'bags',
              type: 'bags',
            },
            {
              name: 'cartons_num',
              type: 'normal',
            },
            {
              name: 'fridges_num',
              type: 'normal',
            },
            {
              name: 'note',
              type: 'normal',
            },
            {
              name: 'order_number',
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
              name: 'sales_name',
              type: 'normal',
            },
            {
              name: 'reviewer_name',
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

  filter() {
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
          value == true ? (queryParams[key] = 1) : (queryParams[key] = 0);
        } else if (key == 'time_from' || key == 'time_to') {
          queryParams[key] = `${value}:00`;
        } else {
          queryParams[key] = value;
        }
      }
    }

    return queryParams;
  }
  receiveSelectedIds() {
    this.sendOrder(this.selectedIds);
  }
  selectedIds: any[] = [];
  updateBatchIDs(updatedIDs: any) {
    this.selectedIds = updatedIDs;
  }
  getClickedId(event: any) {
    console.log(event);
    this.selectedIds = [];
    this.selectedIds.push(event);
    this.openDeliveryModal();
  }
  sendOrder(ids: any[]) {
    let message = '';
    this.subscription.add(
      this.http.putReq('orders/receive', { order_ids: ids }).subscribe({
        next: (res) => {
          message = res.message;
        },
        complete: () => {
          this.toastrService.success(message);
          ids.forEach((id) => {
            this.data.forEach((d: any) => {
              if (d.order_id === id) {
                d.bags.received = d.bags.total;
                d.fridges.received = d.fridges.total;
                d.cartons.received = d.cartons.total;
              }
            });
          });
          console.log(this.data);
        },
      })
    );
  }

  totalsForReceiveModel = { bags: 0, fridges: 0, cartons: 0 };

  @ViewChild('receiveOpen') receiveOpen!: ElementRef<HTMLElement>;

  openDeliveryModal() {
    let el: HTMLElement = this.receiveOpen.nativeElement;
    el.click();
    this.totalsForReceiveModel = this.data
      .filter((d: any) => this.selectedIds.includes(d.order_id))
      .reduce(
        (acc: any, d: any) => {
          acc.bags += d.bags_num;
          acc.fridges += d.fridges_num;
          acc.cartons += d.cartons_num;
          return acc;
        },
        { bags: 0, fridges: 0, cartons: 0 }
      );
  }

  private lastKeypressTime = 0;
  private scanTimeout: any;
  scannedData: string = '';
  private buffer: string = '';
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const currentTime = new Date().getTime();

    // Ignore Shift, Ctrl, Alt, and other non-character keys
    if (
      event.key === 'Shift' ||
      event.key === 'Control' ||
      event.key === 'Alt'
    ) {
      return;
    }

    // Check if Enter key is pressed (end of scan)
    if (event.key === 'Enter') {
      if (this.buffer.length >= 2) {
        this.scannedData = this.buffer;
        console.log('Scanned QR Code:', this.scannedData);
        this.sendQrCode(this.scannedData);
        this.buffer = ''; // Reset for next scan
      }
      return;
    }

    // Check if keypresses are happening too slowly (likely manual typing)
    if (currentTime - this.lastKeypressTime > 40) {
      this.buffer = ''; // Reset buffer if typing speed is slow
    }

    this.buffer += event.key; // Add character to buffer
    this.lastKeypressTime = currentTime;

    // Optional: Auto-clear buffer after a timeout
    clearTimeout(this.scanTimeout);
    this.scanTimeout = setTimeout(() => {
      this.buffer = '';
    }, 40);
  }

  sendQrCode(qr_code: string) {
    let message = '';
    this.subscription.add(
      this.http
        .postReq('orders/receive/readQrCode', { qr_code: qr_code })
        .subscribe({
          next: (res) => {
            message = res.message;
            console.log(res);
            this.data.forEach((d: any) => {
              if (d.order_id === res.data.order_id) {
                d.bags.received = res.data.received_bags;
                d.bags.total = res.data.bags_num;
                d.cartons.received = res.data.received_cartons;
                d.cartons.total = res.data.cartons_num;
                d.fridges.received = res.data.received_fridges;
                d.fridges.total = res.data.fridges_num;
              }
            });
          },
          complete: () => {
            this.toastrService.success(message);
          },
        })
    );
  }
}
