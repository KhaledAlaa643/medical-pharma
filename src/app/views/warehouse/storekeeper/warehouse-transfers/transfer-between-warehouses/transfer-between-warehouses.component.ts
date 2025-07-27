import { DatePipe } from "@angular/common";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { LooseObject } from "@models/LooseObject";
import { corridors } from "@models/corridors";
import { manufacturers } from "@models/manufacturers";
import { products, warehouses } from "@models/products";
import { ColumnValue, columnHeaders } from "@models/tableData";
import { FixedDataService } from "@services/fixed-data.service";
import { GeneralService } from "@services/general.service";
import { HttpService } from "@services/http.service";
import { PrintService } from "@services/print.service";
import { WebSocketService } from "@services/web-socket.service";
import { ToastrService } from "ngx-toastr";
import { Subscription, switchMap } from "rxjs";
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-transfer-between-warehouses',
  templateUrl: './transfer-between-warehouses.component.html',
  styleUrls: [ './transfer-between-warehouses.component.scss' ]
})

export class TransferBetweenWarehousesComponent implements OnInit, OnDestroy {
  transferBetweenWarehouses!: FormGroup
  private subs = new Subscription()
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم أمر التحويل',
    },
    {
      name: 'موقع الصنف',
    },
    {
      name: 'اسم الصنف',
    },
    {
      name: 'الشركة المصنعه',
    },
    {
      name: 'التاريخ   والتشغيلة',
    },
    {
      name: 'الكمية  المحولة',
    },
    {
      name: 'المخزن   المحول   منه ',
    },
    {
      name: 'المخزن    المحول    اليه'
    },
    {
      name: 'تاريخ و وقت التحويل'
    },
    {
      name: 'كاتب المشتريات'
    },
    {
      name: 'سعر  الجمهور'
    },
    {
      name: 'أمر',
      frozen: true
    },
  ]

  columnsName: ColumnValue[] = [
    {
      name: 'transfer_id',
      type: 'normal'
    },
    {
      name: 'product_location',
      type: 'normal'
    },
    {
      name: 'name',
      type: 'normal'
    },
    {
      name: 'company_name',
      type: 'normal'
    },
    {
      name: 'exp_operating',
      type: 'normal'
    },
    {
      name: 'transfer_quantity',
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
      name: 'transfered_at',
      type: 'normal'
    },
    {
      name: 'created_by',
      type: 'normal'
    },
    {
      name: 'public_price',
      type: 'normal'
    },
    {
      name: 'order',
      type: 'transfer',
      frozen:true
    },
  ]
  page: number = 1
  rows!: number
  total: number = 0
  warehouses: warehouses[] = []
  products: products[] = []
  manufacturers: manufacturers[] = []
  corridors: corridors[] = []
  created_by: any = []


  transferredBetweenWarehousesBody: any = []
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private printService: PrintService,
    private fixedData: FixedDataService,
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
    this.transferBetweenWarehouses = this.fb.group({
      product_id: [ '' ],
      manufacturer_id: [ '' ],
      corridor_id: [ '' ],
      transfer_from_warehouse_id: [ '' ],
      transfer_to_warehouse_id: [ '' ],
      from_date: [ '' ],
      to_date: [ '' ],
      created_by: [ '' ],
      transfer_number: [ '' ]
    })
    this.subs.add(this.activatedRoute.queryParams.pipe(
      switchMap((param: any) => {
        return this.getAllData(param, true);
      })
    ).subscribe({
      next: res => {
        this.transferredBetweenWarehousesBody = []

        res.data.forEach((product: any) => {
          this.transferredBetweenWarehousesBody.push(
            {
              'transfer_id': product.transfer.id,
              'product_location': product.main_location?.number + '/' + product.main_location.stand + '-' + product.main_location.shelf,
              'id': product.batch_transfer_id,
              'name': product.batch.product.name,
              'company_name': product.batch.product.manufacture_company.name,
              'exp_operating': product.batch.expired_at + ' ' + product.batch.operating_number,
              'transfer_quantity': product.quantity_transferred,
              'transfer_from_warehouse': product.transfer.transfer_from_warehouse.name,
              'transfer_to_warehouse': product.transfer.transfer_to_warehouse.name,
              'transfered_at': product?.created_at,
              'created_by': product.transfer.created_by.name,
              'public_price': product.batch.product.price,
              'order': "تحويل"
            }
          )


        });
        this.total = res?.meta?.total
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
      getUrl = 'warehouses/transfers/unconfirmed-transfers';

    }
    else {
      getUrl = 'warehouses/transfers/unconfirmed-transfers/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }

  allPrintOrders: any = []
  currentParams: any = {}
  getAllOrders(printType: any, transferAll?: boolean) {
    let params = {}
    if (!transferAll) {
      params = this.currentParams
    }
    this.subs.add(this.getAllData(params, false).subscribe({
      next: res => {
        this.allPrintOrders = []
        this.getData(res.data, false)
      }, complete: () => {
        let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
        let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'order');
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
    data.forEach((product: any) => {
      tempArr.push(
        {
          'transfer_id': product?.transfer?.transfer_number,
          'product_location': product.main_location?.number + '/' + product.main_location.stand + '-' + product.main_location.shelf,
          'id': product.batch_transfer_id,
          'name': product.batch.product.name,
          'company_name': product.batch.product.manufacture_company.name,
          'exp_operating': product.batch.expired_at + ' ' + product.batch.operating_number,
          'transfer_quantity': product.quantity_transferred,
          'transfer_from_warehouse': product.transfer.transfer_from_warehouse.name,
          'transfer_to_warehouse': product.transfer.transfer_to_warehouse.name,
          'transfered_at': product?.created_at,
          'created_by': product.transfer.created_by.name,
          'public_price': product.batch.batch_price,
          'order': "تحويل"
        }
      )


    });


    if (pagiated == true) {
      this.transferredBetweenWarehousesBody = tempArr
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

    return queryParams;
  }

  print(printData: any) {

    if (printData.amountOfPrint == 2) {
      this.getAllOrders(printData.type, false)
    }
    else {
      let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
      let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'order');
      this.printService.setColumnsArray(tempColumnsArray)
      this.printService.setColumnsNames(tempColumnsName)
      this.printService.setRowsData(this.transferredBetweenWarehousesBody)

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

  transfer(id?: any) {
    let message: any = ''
    let body: any = {}
    if (id) {
      body[ 'batch_transfer_id' ] = id
    }
    else {
      this.getAllOrders(1, true)
    }
    this.subs.add(this.http.postReq('warehouses/transfers/confirmed-transfers', body).subscribe({
      next: res => {
        message = res.message
      }, complete: () => {
        this.toastr.success(message)
        const index = this.transferredBetweenWarehousesBody.findIndex((c: any) => c.id == id)
        if (index > -1) {
          this.transferredBetweenWarehousesBody.splice(index, 1)
          this.total--
        }
        if (!id) {
          this.transferredBetweenWarehousesBody = []
          this.total = 0
        }
      }
    }))
  }

  getDropdownData() {
    //warehouses
    this.subs.add(this.generalService.getDropdownData(['manufacturers']).subscribe({
     next: res => {
       this.manufacturers=res.data.manufacturers
     }
   })) 
   this.subs.add(this.generalService.getWarehouses({ 'transfers': 1}).subscribe({
    next: res => {
      this.warehouses = res.data
    }
  }))
      //corridore
      this.subs.add(this.http.getReq('warehouses/corridors').subscribe({
        next:res=>{
          this.corridors=res.data
        }
      }))
      this.subs.add(this.generalService.getProducts().subscribe({
        next:res=>{
          this.products=res.data
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
    this.router.navigate([], { queryParamsHandling: "merge" });

  }
}