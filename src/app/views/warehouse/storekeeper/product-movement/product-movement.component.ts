import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { pharmacie } from '@models/pharmacie';
import { products, warehouses } from '@models/products';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');
@Component({
  selector: 'app-product-movement',
  templateUrl: './product-movement.component.html',
  styleUrls: ['./product-movement.component.scss'],
})
export class ProductMovementComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'اجمالي المبيعات',
    },
    {
      name: 'اجمالي مرتجعات البيع   ',
    },
    {
      name: 'اجمالي المشتريات',
    },
    {
      name: 'اجمالي مرتجعات الشراء ',
    },
    {
      name: ' اجمالي الزيادة الجردية ',
    },
    {
      name: 'اجمالي العجز الجردي',
    },
    {
      name: ' اجمالي المحول من المخزن  ',
    },
    {
      name: 'اجمالي المحول الي المخزن',
    },
    {
      name: '',
    },
    {
      name: 'اسم المخزن',
    },
    {
      name: 'المخزن الرئيسي',
    },
    {
      name: 'مخزن الجملة',
    },
    {
      name: 'مخزن القطاعي',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'sales',
      type: 'normal',
    },
    {
      name: 'sales_returns',
      type: 'normal',
    },
    {
      name: 'purchases',
      type: 'normal',
    },
    {
      name: 'purchases_returns',
      type: 'normal',
    },
    {
      name: 'excess',
      type: 'normal',
    },
    {
      name: 'shortage',
      type: 'normal',
    },
    {
      name: 'transfers_outgoing',
      type: 'normal',
    },
    {
      name: 'transfers_incoming',
      type: 'normal',
    },
    {
      name: '',
      type: '',
    },
    {
      name: 'q',
      type: 'normal',
    },
    {
      name: 'quantity1',
      type: 'normal',
    },
    {
      name: 'quantity2',
      type: 'normal',
    },
    {
      name: 'quantity3',
      type: 'normal',
    },
  ];
  productMovementfilter!: FormGroup;
  summeryForm!: FormGroup;
  warehouses: warehouses[] = [];
  products: products[] = [];
  clients: { name: string; id: number }[] = [];
  suppliers: any = [];
  url: string = '';
  page!: number;
  total: number = 0;
  rows!: number;
  total_orders: number = 0;
  allprintData: any = [];
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpService,
    private printService: PrintService,
    private generalService: GeneralService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.getDropdownData();
    this.url = 'products/reports/summary';
    this.isActiveTapArray[0] = true;
    this.productMovementfilter = this.fb.group({
      product_id: ['', Validators.required],
      warehouse_id: [''],
      from: [''],
      to: [''],
      pharmacy_id: [''],
      user_id: [''],
    });

    this.summeryForm = this.fb.group({
      sales: [''],
      sales_returns: [''],
      purchases: [''],
      purchases_returns: [''],
      inventory_excess: [''],
      inventory_shortage: [''],
      transfers_incoming: [''],
      transfers_outgoing: [''],
    });
    this.getLastMonthData();
  }
  getLastMonthData() {
    let dateFrom = this.auth.getEnums().dates.from;
    let dateTo = this.auth.getEnums().dates.to;

    this.productMovementfilter.controls['from'].setValue(
      datePipe.transform(dateFrom, 'yyyy-MM-dd')
    );
    this.productMovementfilter.controls['to'].setValue(
      datePipe.transform(dateTo, 'yyyy-MM-dd')
    );
  }
  paginated!: boolean;
  isActiveTapArray: boolean[] = Array(7).fill(false);
  changeActiveTap(index: number) {
    if (this.productMovementfilter.controls['product_id'].value) {
      this.url = '';
      if (index == 1 || index == 2) {
        this.paginated = true;

        this.columnsArray = [
          {
            name: 'رقم الأذن ',
          },
          {
            name: 'اسم العميل   ',
            sort: true,
            direction: null,
          },
          {
            name: 'التاريخ',
            sort: true,
            direction: null,
          },
          {
            name: 'سعر   الجمهور ',
          },
          {
            name: ' الكمية   قبل ',
            sort: true,
            direction: null,
          },
          {
            name: 'الكمية  المباعة    ',
            sort: true,
            direction: null,
          },
          {
            name: ' الكمية   بعد  ',
            sort: true,
            direction: null,
          },
          {
            name: 'التاريخ   والتشغيلة',
          },
          {
            name: 'المندوب   ',
            sort: true,
            direction: null,
          },
          {
            name: 'اسم   المخزن   ',
          },
        ];
        this.columnsName = [
          {
            name: 'order_number',
            type: 'normal',
          },
          {
            name: 'pharmacy_name',
            type: 'normal',
          },
          {
            name: 'created_at',
            type: 'normal',
          },
          {
            name: 'price',
            type: 'normal',
          },
          {
            name: 'quantity_before',
            type: 'normal',
          },
          {
            name: 'amount',
            type: 'normal',
          },
          {
            name: 'quantity_after',
            type: 'normal',
          },
          {
            name: 'expired_at',
            type: 'normal',
          },
          {
            name: 'user_name',
            type: 'normal',
          },
          {
            name: 'warehouse_name',
            type: 'normal',
          },
        ];
        this.url =
          index == 1
            ? 'products/reports/sales'
            : 'products/reports/sales-returns';
      } else if (index == 0) {
        this.columnsArray = [
          {
            name: 'اجمالي المبيعات',
          },
          {
            name: 'اجمالي مرتجعات البيع   ',
          },
          {
            name: 'اجمالي المشتريات',
          },
          {
            name: 'اجمالي مرتجعات الشراء ',
          },
          {
            name: ' اجمالي الزيادة الجردية ',
          },
          {
            name: 'اجمالي العجز الجردي',
          },
          {
            name: ' اجمالي المحول من المخزن  ',
          },
          {
            name: 'اجمالي المحول الي المخزن',
          },
          {
            name: '',
          },
          {
            name: 'اسم المخزن',
          },
          {
            name: 'المخزن الرئيسي',
          },
          {
            name: 'مخزن الجملة',
          },
          {
            name: 'مخزن القطاعي',
          },
        ];
        this.columnsName = [
          {
            name: 'sales',
            type: 'normal',
          },
          {
            name: 'sales_returns',
            type: 'normal',
          },
          {
            name: 'purchases',
            type: 'normal',
          },
          {
            name: 'purchases_returns',
            type: 'normal',
          },
          {
            name: 'excess',
            type: 'normal',
          },
          {
            name: 'shortage',
            type: 'normal',
          },
          {
            name: 'transfers_outgoing',
            type: 'normal',
          },
          {
            name: 'transfers_incoming',
            type: 'normal',
          },
          {
            name: '',
            type: '',
          },
          {
            name: 'q',
            type: 'normal',
          },
          {
            name: 'quantity1',
            type: 'normal',
          },
          {
            name: 'quantity2',
            type: 'normal',
          },
          {
            name: 'quantity3',
            type: 'normal',
          },
        ];
        this.url = 'products/reports/summary';
        this.paginated = false;
      } else if (index == 3 || index == 4) {
        this.paginated = true;

        this.columnsArray = [
          {
            name: 'رقم الأذن ',
          },
          {
            name: 'اسم المورد',
            sort: true,
            direction: null,
          },
          {
            name: 'التاريخ',
            sort: true,
            direction: null,
          },
          {
            name: 'سعر   الجمهور قبل',
          },
          {
            name: ' سعر   الجمهور    بعد ',
          },
          {
            name: ' الكمية   قبل ',
            sort: true,
            direction: null,
          },
          {
            name: index == 3 ? 'الكمية المشتراه' : 'الكمية المردودة',
            sort: true,
            direction: null,
          },
          {
            name: ' الكمية   بعد  ',
            sort: true,
            direction: null,
          },
          {
            name: 'التاريخ   والتشغيلة',
          },
          {
            name: 'الكاتب',
            sort: true,
            direction: null,
          },
          {
            name: 'اسم   المخزن   ',
            sort: true,
            direction: null,
          },
        ];
        this.columnsName = [
          {
            name: 'order_number',
            type: 'normal',
          },
          {
            name: 'supplier_name',
            type: 'normal',
          },
          {
            name: 'created_at',
            type: 'normal',
          },
          {
            name: 'price_befor',
            type: 'normal',
          },
          {
            name: 'price_after',
            type: 'normal',
          },
          {
            name: 'quantity_before',
            type: 'normal',
          },
          {
            name: 'amount',
            type: 'normal',
          },
          {
            name: 'quantity_after',
            type: 'normal',
          },
          {
            name: 'expired_at',
            type: 'normal',
          },
          {
            name: 'user_name',
            type: 'normal',
          },
          {
            name: 'warehouse_name',
            type: 'normal',
          },
        ];
        if (index == 4) {
          this.columnsArray.push({
            name: 'سبب المرتجع',
          });
          this.columnsName.push({
            name: 'reason',
            type: 'normal',
          });
        }
        this.url =
          index == 3
            ? 'products/reports/purchases'
            : 'products/reports/purchases-returns';
      } else if (index == 5) {
        this.paginated = true;

        this.columnsArray = [
          {
            name: 'الكاتب',
            sort: true,
            direction: null,
          },
          {
            name: 'المخزن',
            sort: true,
            direction: null,
          },
          {
            name: 'التاريخ',
            sort: true,
            direction: null,
          },
          {
            name: 'سعر   الجمهور ',
          },
          {
            name: ' الكمية   قبل ',
            sort: true,
            direction: null,
          },
          {
            name: 'الزيادة',
            sort: true,
            direction: null,
          },
          {
            name: 'العجز',
            sort: true,
            direction: null,
          },
          {
            name: ' الكمية   بعد  ',
            sort: true,
            direction: null,
          },
          {
            name: 'التاريخ   والتشغيلة',
          },
        ];
        this.columnsName = [
          {
            name: 'user_name',
            type: 'normal',
          },
          {
            name: 'warehouse_name',
            type: 'normal',
          },
          {
            name: 'created_at',
            type: 'normal',
          },
          {
            name: 'price',
            type: 'normal',
          },
          {
            name: 'quantity_before',
            type: 'normal',
          },
          {
            name: 'excess',
            type: 'normal',
          },
          {
            name: 'shortage',
            type: 'normal',
          },
          {
            name: 'quantity_after',
            type: 'normal',
          },
          {
            name: 'expired_at',
            type: 'normal',
          },
        ];
        this.url = 'products/reports/inventory';
      } else if (index == 6) {
        this.paginated = true;

        this.columnsArray = [
          {
            name: 'المخزن المحول منه',
            sort: true,
            direction: null,
          },
          {
            name: 'المخزن المحول اليه    ',
            sort: true,
            direction: null,
          },
          {
            name: 'التاريخ',
            sort: true,
            direction: null,
          },
          {
            name: 'سعر   الجمهور ',
          },
          {
            name: ' الكمية   قبل ',
            sort: true,
            direction: null,
          },
          {
            name: ' الكمية   المحولة    ',
            sort: true,
            direction: null,
          },
          {
            name: ' الكمية   بعد  ',
            sort: true,
            direction: null,
          },
          {
            name: 'الكاتب',
            sort: true,
            direction: null,
          },
          {
            name: 'التاريخ   والتشغيلة',
          },
        ];
        this.columnsName = [
          {
            name: 'from_warehouse_name',
            type: 'normal',
          },
          {
            name: 'to_warehouse_name',
            type: 'normal',
          },
          {
            name: 'created_at',
            type: 'normal',
          },
          {
            name: 'price',
            type: 'normal',
          },
          {
            name: 'quantity_before',
            type: 'normal',
          },
          {
            name: 'amount',
            type: 'normal',
          },
          {
            name: 'quantity_after',
            type: 'normal',
          },
          {
            name: 'user_name',
            type: 'normal',
          },
          {
            name: 'expired_at',
            type: 'normal',
          },
        ];
        this.url = 'products/reports/transfers';
      }
      if (index != 10) {
        this.isActiveTapArray.fill(false);
        this.isActiveTapArray[index] = true;
      } else {
        this.isActiveTapArray.fill(false);
      }

      this.getUpdatedParams();
    } else {
      this.toastr.error('اختر الصنف اولا');
    }
    this.printService.setColumnsArray(this.columnsArray);
    this.printService.setColumnsNames(this.columnsName);
  }

  productMovementData: any = [];

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getDropdownData() {
    //products
    this.subs.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );
    //clients
    let pharmaciesData: any = [];
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          pharmaciesData = res.data;
          pharmaciesData.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.clients.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
              });
            });
          });
        },
      })
    );

    let params = ['warehouses', 'suppliers'];
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.warehouses = res.data.warehouses;
          this.suppliers = res.data.suppliers;
        },
      })
    );
  }
  currentQuery: any = {};
  getUpdatedParams(sortData?: any) {
    let queryParams: any = {};

    for (const key in this.productMovementfilter.value) {
      let value = this.productMovementfilter.value[key];
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
    if (sortData) {
      queryParams['sort_by'] = sortData.name;
      queryParams['direction'] = sortData.direction;
    }
    this.currentQuery = queryParams;
    this.getData(queryParams);
  }
  resetSort: boolean = false;

  changePage(event: any) {
    this.page = event.page + 1;
    this.getUpdatedParams();
  }
  data: any = {};
  quantity1: number = 0;
  quantity2: number = 0;
  quantity3: number = 0;
  total_quantity: number = 0;
  getData(queryParams: any, printData?: any) {
    this.data = {};
    this.total_quantity = 0;
    this.total_orders = 0;
    this.total = 0;
    this.quantity1 = 0;
    this.quantity2 = 0;
    this.quantity3 = 0;
    let responce: any = [];
    if (!printData) {
      this.productMovementData = [];
    }
    let params: any = queryParams;
    let tempArr: any = [];
    let tempurl = this.url;
    if (printData && !this.isActiveTapArray[0]) {
      tempurl = this.url + '/all';
    } else {
      tempurl = this.url;
    }
    this.subs.add(
      this.http.getReq(tempurl, { params: params }).subscribe({
        next: (res) => {
          this.data = res.data;
          responce = res;
        },
        complete: () => {
          this.resetSort = false;
          if (this.isActiveTapArray[0]) {
            this.summeryForm.patchValue(this.data.totals);
            this.data?.quantity_per_warehouse.forEach((warehouse: any) => {
              if (warehouse.name == 'تسويه') {
                this.quantity1 = warehouse?.quantity;
              } else if (warehouse.name == 'جملة') {
                this.quantity2 = warehouse?.quantity;
              } else {
                this.quantity3 = warehouse?.quantity;
              }
            });
            tempArr.push({
              sales: this.summeryForm.controls['sales'].value,
              sales_returns: this.summeryForm.controls['sales_returns'].value,
              purchases: this.summeryForm.controls['purchases'].value,
              purchases_returns:
                this.summeryForm.controls['purchases_returns'].value,
              excess: this.summeryForm.controls['inventory_excess'].value,
              shortage: this.summeryForm.controls['inventory_shortage'].value,
              transfers_incoming:
                this.summeryForm.controls['transfers_incoming'].value,
              transfers_outgoing:
                this.summeryForm.controls['transfers_outgoing'].value,
              quantity1: this.quantity1,
              quantity2: this.quantity2,
              quantity3: this.quantity3,
            });
            if (this.paginated) {
              this.productMovementData = tempArr;
            } else {
              this.allprintData = tempArr;
            }
          } else if (this.isActiveTapArray[1] || this.isActiveTapArray[2]) {
            this.data.forEach((item: any) => {
              tempArr.push({
                order_number: item.id,
                pharmacy_name: item.pharmacy?.name,
                created_at: item.created_at,
                price: item.batch.batch_price,
                quantity_before: item.quantity_before,
                amount: item.amount,
                quantity_after: item.quantity_after,
                expired_at:
                  item.batch.expired_at + ' / ' + item.batch.operating_number,
                user_name: item.user.name,
                warehouse_name: item.batch.warehouse.name,
              });
            });
            if (!printData) {
              this.rows = responce.meta.per_page;
              this.total = responce.meta.total;
            }
            this.total_orders = responce.additional_data.total_orders;
            this.total_quantity = responce.additional_data.total_quantity;
          } else if (this.isActiveTapArray[3] || this.isActiveTapArray[4]) {
            this.data.forEach((item: any) => {
              tempArr.push({
                order_number: item.id,
                supplier_name: item.supplier?.name,
                created_at: item.created_at,
                price_befor: item.price_before,
                price_after: item.price_after,
                quantity_before: item.quantity_before,
                amount: item.amount,
                quantity_after: item.quantity_after,
                expired_at:
                  item?.batch != null
                    ? item.batch?.expired_at +
                      ' / ' +
                      item.batch?.operating_number
                    : '',
                user_name: item.user.name,
                warehouse_name: item.warehouse.name,
                reason: item.reason,
              });
            });
            if (!printData) {
              this.rows = responce.meta.per_page;
              this.total = responce.meta.total;
            }
            this.total_orders = responce.additional_data.total_orders;
            this.total_quantity = responce.additional_data.total_quantity;
          } else if (this.isActiveTapArray[5]) {
            this.data.forEach((item: any) => {
              tempArr.push({
                user_name: item.user.name,
                warehouse_name: item.batch.warehouse.name,
                created_at: item.created_at,
                price: item.batch.batch_price,
                quantity_before: item.quantity_before,
                excess: item.excess,
                shortage: item.shortage,
                quantity_after: item.quantity_after,
                expired_at:
                  item.batch.expired_at + ' / ' + item.batch.operating_number,
              });
            });
            if (!printData) {
              this.rows = responce.meta.per_page;
              this.total = responce.meta.total;
            }
            this.total_orders = responce.additional_data.total_orders;
          } else if (this.isActiveTapArray[6]) {
            this.data.forEach((item: any) => {
              tempArr.push({
                from_warehouse_name: item.from_warehouse.name,
                to_warehouse_name: item.to_warehouse.name,
                created_at: item.created_at,
                price: item.batch.batch_price,
                quantity_before: item.quantity_before,
                amount: item.amount,
                quantity_after: item.quantity_after,
                user_name: item.user.name,
                expired_at:
                  item.batch.expired_at + ' / ' + item.batch.operating_number,
              });
            });
            this.total_orders = responce.additional_data.total_orders;
            this.total_quantity = responce.additional_data.total_quantity;
            if (!printData) {
              this.rows = responce.meta.per_page;
              this.total = responce.meta.total;
            }
          }

          if (!printData) {
            this.productMovementData = tempArr;
          } else {
            this.allprintData = tempArr;
          }
          setTimeout(() => {
            if (printData) {
              this.printService.setColumnsArray(this.columnsArray);
              this.printService.setColumnsNames(this.columnsName);
              this.printService.setRowsData(this.allprintData);
              if (printData.type == 1) {
                this.printService.downloadPDF();
              } else {
                this.printService.downloadCSV();
              }
            }
          }, 50);
        },
      })
    );
  }

  //open printing modal
  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
  //print function

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      if (this.isActiveTapArray[0] == true) {
        localStorage.setItem('type', JSON.stringify(2));
        this.printService.setColumnsArray(this.columnsArray);
        this.printService.setColumnsNames(this.columnsName);
        this.printService.setRowsData(this.productMovementData);
        if (printData.type == 1) {
          this.printService.downloadPDF();
        } else {
          this.printService.downloadCSV();
        }
      } else {
        this.getData(this.currentQuery, printData);
      }
    } else {
      this.printService.setColumnsArray(this.columnsArray);
      this.printService.setColumnsNames(this.columnsName);
      this.printService.setRowsData(this.productMovementData);
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
}
