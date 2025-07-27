import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { products, warehouses } from '@models/products';
import { settlement } from '@models/settlement';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { WebSocketService } from '@services/web-socket.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-unsettled',
  templateUrl: './unsettled.component.html',
  styleUrls: ['./unsettled.component.scss'],
})
export class UnsettledComponent implements OnInit, OnDestroy {
  private subscription = new Subscription();
  //filter variable
  unsetteledFilterForm!: FormGroup;
  settlementForm!: FormGroup;
  //table  variable
  unsettledData: settlement[] = [];
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم الأذن ',
    },
    {
      name: 'اسم الصنف',
    },
    {
      name: ' المخزن المسوي منه	',
    },
    {
      name: ' كمية التسوية	',
    },
    {
      name: 'الكمية المردوده',
    },
    {
      name: ' التاريخ و التشغيلة	',
    },
    {
      name: ' اسم العميل	',
    },
    {
      name: ' التاريخ	',
    },
    {
      name: ' الكاتب	',
    },
    {
      name: ' أمر	',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'order_id',
      type: 'normal',
    },
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'from_warehouse_name',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'returned_quantity',
      type: 'normal',
    },
    {
      name: 'date_operatingNumber',
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
      name: 'reviewed_by',
      type: 'normal',
    },
    {
      name: 'view',
      type: 'settlement',
    },
  ];
  total_batches: number = 0;
  total_orders: number = 0;
  //pagination variable
  page: number = 1;
  total!: number;
  rows!: number;
  //settlement popup
  product_name!: string;
  //dropdown variables
  groupPharmacies: any = [];
  warehouses: warehouses[] = [];
  products: products[] = [];
  auditor: any = [];
  settled: boolean = false;
  activeURL!: string;
  last_order_id!: number;
  constructor(
    private http: HttpService,
    private webSocketService: WebSocketService,
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    private auth: AuthService,
    private printService: PrintService
  ) {}

  ngOnInit() {
    //check routes (unsettled,settled)
    this.activeURL = this.router.url;

    if (this.activeURL.includes('/settled')) {
      this.settled = true;
      this.columnsName.pop();
      this.columnsName.push({
        name: 'status',
        type: 'normal',
      });
      this.columnsArray.pop();
      this.columnsArray.push({ name: 'الحالة' });
    } else {
      this.settled = false;
      const columnsArray_index = this.columnsArray.findIndex(
        (c) => c.name == 'الكمية المردوده'
      );
      if (columnsArray_index > -1) {
        this.columnsArray.splice(columnsArray_index, 1);
      }
      const columnsName_index = this.columnsName.findIndex(
        (c) => c.name == 'returned_quantity'
      );
      if (columnsName_index > -1) {
        this.columnsName.splice(columnsName_index, 1);
      }
      // this.webSocketService.connect()
      // this.webSocketService.getNewMessageSettledProducts().subscribe((message: any) => {
      //   if (message.settlement_batches) {

      //     if (message.action == "removed") {
      //       const index = this.unsettledData.findIndex((c: any) => c.batch_id == message.settlement_batches[ 0 ]?.id)
      //       if (index > -1) {
      //         this.unsettledData.splice(index, 1)
      //         this.total_batches--
      //         const index_order = this.unsettledData.findIndex((c: any) => c.order_id == message.settlement_batches[ 0 ]?.order_id)
      //         if (index_order == -1) {
      //           this.total_orders--
      //         }
      //       }
      //     }
      //     else {
      //       let onAdded: boolean = false
      //       message.settlement_batches.forEach((batch: any) => {
      //         const index_batch = this.unsettledData.findIndex((c: any) => c.batch_id == batch.id)
      //         if (index_batch == -1) {
      //           onAdded = true
      //           this.unsettledData.push(
      //             {
      //               'order_id': batch.order_id,
      //               'product_name': batch.product.name,
      //               'from_warehouse_name': batch.from_warehouse.name,
      //               'quantity': batch.quantity,
      //               'returned_quantity': batch.returned_quantity,
      //               'date_operatingNumber': batch.batch.operating_number + '  ' + batch.batch.expired_at,
      //               'pharmacy_name': batch.pharmacy.name,
      //               'created_at': batch?.created_at,
      //               'reviewed_by': batch.reviewed_by.name,
      //               'batch_id': batch.batch_id,
      //               'cart_id': batch.cart_id,
      //               'status': batch?.status
      //             }
      //           )
      //         }
      //       });
      //       if (onAdded != false) {
      //         this.total_batches += message.settlement_batches.length
      //         this.total_orders++
      //       }
      //     }

      //   }

      // })
    }
    //call get filter dropdown data
    this.getDropdownData();
    //initialize filter form
    this.unsetteledFilterForm = this.formBuilder.group({
      product_id: [''],
      warehouse_id: [''],
      pharmacy_id: [''],
      reviewed_by: [''],
      from: [''],
      to: [''],
    });
    this.settlementForm = this.formBuilder.group({
      quantity: [''],
      batch_id: [''],
      cart_id: [''],
    });

    //get data
    this.subscription.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param, true);
          })
        )
        .subscribe({
          next: (res) => {
            //table data
            this.unsettledData = [];
            this.getData(res.data, true);
            //total values
            this.total_batches = res.additional_data.total_batches;
            this.total_orders = res.additional_data.total_orders;
            //pagination data
            this.total = res?.meta.total;
            this.rows = res.meta?.per_page;
          },
        })
    );
  }
  quary: any = {};
  //get all data with params if exist
  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    this.quary = x;
    let getUrl = '';
    if (this.settled == true) {
      if (paginated) {
        getUrl = 'warehouses/settlement/finished';
      } else {
        getUrl = 'warehouses/settlement/finished/all';
      }
    } else {
      if (paginated) {
        getUrl = 'warehouses/settlement';
      } else {
        getUrl = 'warehouses/settlement/all';
      }
    }

    return this.http.getReq(getUrl, { params: x });
  }

  //filter
  filter() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
  }

  //get updated params
  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.unsetteledFilterForm.value) {
      let value = this.unsetteledFilterForm.value[key];
      if (value != null && value != undefined && value != '') {
        if (key == 'from' || key == 'to') {
          queryParams[key] = datePipe.transform(new Date(value), 'yyyy-MM-dd');
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

  //pagination
  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }
  //open printing modal
  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
  //print function
  allPrintBatches: any;
  getAllbatches(printType: any) {
    this.subscription.add(
      this.getAllData(this.quary, false).subscribe({
        next: (res) => {
          this.allPrintBatches = [];
          this.getData(res.data, false);
        },
        complete: () => {
          let tempColumnsArray = this.columnsArray.filter(
            (column) => column.name.trim() !== 'أمر'
          );
          let tempColumnsName = this.columnsName.filter(
            (column) => column.name.trim() !== 'view'
          );
          this.printService.setColumnsArray(tempColumnsArray);
          this.printService.setColumnsNames(tempColumnsName);
          this.printService.setRowsData(this.allPrintBatches);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
          setTimeout(() => {
            this.openModal();
          }, 100);
        },
      })
    );
  }

  print(printData: any) {
    let tempColumnsArray = this.columnsArray.filter(
      (column) => column.name.trim() !== 'أمر'
    );
    let tempColumnsName = this.columnsName.filter(
      (column) => column.name.trim() !== 'view'
    );
    if (printData.amountOfPrint == 2) {
      this.getAllbatches(printData.type);
    } else {
      localStorage.setItem('RowsData', JSON.stringify(this.unsettledData));
      localStorage.setItem('columnsArray', JSON.stringify(tempColumnsArray));
      localStorage.setItem('columnsNames', JSON.stringify(tempColumnsName));
      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
      setTimeout(() => {
        this.openModal();
      }, 100);
    }
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = [];
    data.forEach((batch: any) => {
      tempArr.push({
        order_id: batch.order_id,
        product_name: batch.product.name,
        from_warehouse_name: batch.from_warehouse.name,
        quantity: batch.quantity,
        returned_quantity: batch.returned_quantity,
        date_operatingNumber:
          batch.batch.operating_number + '  ' + batch.batch.expired_at,
        pharmacy_name: batch.pharmacy.name,
        created_at: batch?.created_at,
        reviewed_by: batch.reviewed_by.name,
        cart_id: batch.cart_id,
        batch_id: batch.batch_id,
        status: batch?.status,
      });
    });
    if (pagiated == true) {
      this.unsettledData = tempArr;
    } else {
      this.allPrintBatches = tempArr;
    }
  }

  //settlement popup
  @ViewChild('settlementOpen') settlementOpen!: ElementRef<HTMLElement>;

  openSettlementPopUp(product: any) {
    // this.settlementForm.controls[ 'id' ].setValue(product.id)
    this.settlementForm.controls['batch_id'].setValue(product.batch_id);
    this.settlementForm.controls['cart_id'].setValue(product.cart_id);
    this.product_name = product.name;
    setTimeout(() => {
      let el: HTMLElement = this.settlementOpen.nativeElement;
      el.click();
    }, 100);
  }

  settlement() {
    let additional_data: any = {};
    let sucessMessage: string = '';
    this.subscription.add(
      this.http
        .postReq('warehouses/settlement/update', this.settlementForm.value)
        .subscribe({
          next: (res) => {
            sucessMessage = res.message;
            additional_data = res.additional_data;
          },
          complete: () => {
            this.toastr.success(sucessMessage);
            this.total_batches =
              this.total_batches + additional_data.total_batches_difference;
            this.total_orders =
              this.total_orders + additional_data.total_orders_difference;
            const index = this.unsettledData.findIndex(
              (c: any) =>
                c.batch_id == this.settlementForm.controls['batch_id'].value
            );
            if (index > -1) {
              this.unsettledData.splice(index, 1);
            }
            //close modal
            setTimeout(() => {
              let el: HTMLElement = this.settlementOpen.nativeElement;
              el.click();
            }, 50);
          },
        })
    );
  }
  //get dropdown data
  getDropdownData() {
    //pharamcy
    let clients: any = [];
    this.subscription.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          clients = res.data;
        },
        complete: () => {
          clients.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.groupPharmacies.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
                client_id: client?.name,
              });
            });
          });
        },
      })
    );

    //products
    this.subscription.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );

    this.subscription.add(
      this.generalService
        .getDropdownData(['warehouses', 'retail_sales_auditors'])
        .subscribe({
          next: (res) => {
            this.warehouses = res.data.warehouses;
            this.auditor = res.data.retail_sales_auditors;
          },
        })
    );

    //  this.generalService.getSettingsEnum().subscribe({
    //     next: res => {
    //       this.created_by = res.data.transfer_by;
    //     }
    //   });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
