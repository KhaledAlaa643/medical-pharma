import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { LooseObject } from "@models/LooseObject";
import { warehouses } from "@models/products";
import { ColumnValue, columnHeaders } from "@models/tableData";
import { FixedDataService } from "@services/fixed-data.service";
import { GeneralService } from "@services/general.service";
import { HttpService } from "@services/http.service";
import { PrintService } from "@services/print.service";
import { Subscription, catchError, of, switchMap } from "rxjs";
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-transfers-orders',
  templateUrl: './transfers-orders.component.html',
  styleUrls: ['./transfers-orders.component.scss']
})
export class TransfersOrdersComponent implements OnInit {
  transferBetweenWarehouses!: FormGroup
  private subs = new Subscription()
  trasnferredOrderBasedBody: any = []
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم أمر التحويل',
    },
    {
      name: 'المخزن   المحول   منه ',
    },
    {
      name: 'المخزن    المحول    اليه'
    },
    {
      name: 'عدد الأصناف المحولة',
    },
    {
      name: 'تاريخ ووقت التحويل',
    },
    {
      name: 'تاريخ ووقت التنفيذ',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'اجمالي امر التحويل',
    },
    {
      name: 'أمر'
    },
  ]

  columnsName: ColumnValue[] = [
    {
      name: 'transfer_id',
      type: 'normal'
    },
    {
      name: 'transfer_from_warehouse',
      type: 'normal'
    },
    {
      name: 'transfer_to_warehouse',
      type: 'normal'
    },
    {
      name: 'product_number',
      type: 'normal'
    },
    {
      name: 'created_at',
      type: 'normal'
    },
    {
      name: 'transfered_at',
      type: 'normal'
    },
    {
      name: 'transfered_by',
      type: 'normal'
    },
    {
      name: 'total',
      type: 'normal'
    },
    {
      name: 'view',
      type: 'eyeIcon_transfer'
    },
  ]
  page: number = 1
  rows!: number
  total: number = 0
  warehouses: warehouses[] = []
  created_by: any = []
  constructor(
    private http: HttpService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fixedData: FixedDataService,
    private printService: PrintService,
    private generalService: GeneralService
  ) {

  }


  ngOnInit(): void {
    this.fixedData.getAllFixedData().subscribe({
      next: res => {
        this.created_by = res.data.transfer_by;
      }
    });
    this.getDropdownData()
    this.transferBetweenWarehouses = this.formBuilder.group({
      transfer_id: [ '' ],
      transfer_from_warehouse_id: [ '' ],
      transfer_to_warehouse_id: [ '' ],
      from_date: [ '' ],
      to_date: [ '' ],
      created_by: [ '' ],
    })

    this.subs.add(this.activatedRoute.queryParams.pipe(
      switchMap((param: any) => {
        return this.getAllData(param, true).pipe(
          catchError((error) => {
            return of({ data: [] });
          })
        );
      })
    ).subscribe({
      next: res => {
        this.trasnferredOrderBasedBody = []
        this.getData(res.data, true)
        this.total = res?.meta.total
        this.rows = res.meta?.per_page
      }

    }));


  }






  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [ key, value ] of Object.entries(filters)) {
      if (value)
        x[ key ] = value
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'purchases/transfers/orders'
    }
    else {
      getUrl = 'purchases/transfers/orders/all'
    }

    return this.http.getReq(getUrl, { params: x });
  }

  allPrintOrders: any = []
  getAllOrders(printType: any) {
    this.subs.add(this.getAllData(this.currentParams, false).subscribe({
      next: res => {
        this.allPrintOrders = []
        this.getData(res.data, false)
      }, complete: () => {
        let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
        let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'view');
        this.printService.setColumnsArray(tempColumnsArray)
        this.printService.setColumnsNames(tempColumnsName)
        this.printService.setRowsData(this.allPrintOrders)
        if (printType == 1) {
          this.printService.downloadPDF()
        }
        else {
          this.printService.downloadCSV()
        }

      }
    }))
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = []
    data.forEach((transfer: any) => {
      let total = 0
      let latestTransferredAt = ''

      // transfer.batches.forEach((batch: any) => {
      //   total += batch.product.price;
      //   const transferredAt = batch.batch_transfer.transferred_at;
      //   if (latestTransferredAt < transferredAt) {
      //     latestTransferredAt = transferredAt;
      //   }
      // });

      tempArr.push(
        {
          'id': transfer.id,
          'transfer_id': transfer.id,
          'transfer_from_warehouse': transfer.transfer_from_warehouse.name,
          'transfer_to_warehouse': transfer.transfer_to_warehouse.name,
          'product_number': transfer.total_batch_transferred,
          'transfered_at': transfer.last_transferred_at,
          'created_at': transfer.batch_transferred[0].created_at,
          'transfered_by': transfer.created_by.name,
          'total':transfer.total_transfer_price
        }
      )

    });
    if (pagiated == true) {
      this.trasnferredOrderBasedBody = tempArr
    }
    else {
      this.allPrintOrders = tempArr
    }
  }



  changePage(event: any) {
    this.page = event.page + 1
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: "merge" });

  }

  filterTransfer() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
  }
  currentParams: any = {}
  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.transferBetweenWarehouses.value) {
      let value = this.transferBetweenWarehouses.value[ key ];
      if (value != null && value != undefined && value != "") {
        if (key == 'from_date' || key == 'to_date') {
          queryParams[ key ] = datePipe.transform(value, 'yyyy-MM-dd');
        }
        else {
          queryParams[ key ] = value;

        }
      }
    }
    if (this.page) {
      queryParams[ 'page' ] = this.page;
    }
    this.currentParams = queryParams
    return queryParams;
  }


  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllOrders(printData.type)

    }
    else {
      let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
      let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'view');
      this.printService.setColumnsArray(tempColumnsArray)
      this.printService.setColumnsNames(tempColumnsName)
      this.printService.setRowsData(this.trasnferredOrderBasedBody)
      if (printData.type == 1) {
        this.printService.downloadPDF()
      }
      else {
        this.printService.downloadCSV()
      }
    }


    setTimeout(() => {
      this.openModal()
    }, 100);
  }


  navigateToDetails(id: any) {
    this.router.navigate([ `/purchases/transfers/transferd-products/${id}` ])
  }

  getDropdownData() {
    //warehouses
    this.subs.add(this.generalService.getWarehouses({'transfers':1}).subscribe({
      next: res => {
        this.warehouses = res.data
      }
    }))

  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }






  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }
}
