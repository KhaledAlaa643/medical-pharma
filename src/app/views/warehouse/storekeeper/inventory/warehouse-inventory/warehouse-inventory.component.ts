import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { products, warehouses } from '@models/products';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { WebSocketService } from '@services/web-socket.service';
import { Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');


@Component({
  selector: 'app-warehouse-inventory',
  templateUrl: './warehouse-inventory.component.html',
  styleUrls: [ './warehouse-inventory.component.scss' ]
})
export class WarehouseInventoryComponent implements OnInit {
  private subscription = new Subscription()
  //table  variable
  inventoryData: any[] = []

  columnsArray: columnHeaders[] = [
    {
      name: 'اسم الصنف',
    },
    {
      name: ' الكاتب	',
      sort: true,
      direction: null
    },
    {
      name: ' المخزن	',
      sort: true,
      direction: null
    },
    {
      name: ' التاريخ	',
      sort: true,
      direction: null
    },
    {
      name: ' سعر الجمهور	',
    },
    {
      name: ' الكمية الفعلية',
      sort: true,
      direction: null
    },
    {
      name: 'كمية الزيادة',
      sort: true,
      direction: null
    },
    {
      name: 'كمية العجز',
      sort: true,
      direction: null
    },
    {
      name: ' التاريخ و التشغيلة	',
    }
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal'
    },
    {
      name: 'user_name',
      type: 'normal'
    },
    {
      name: 'warehouse_name',
      type: 'normal'
    },
    {
      name: 'created_at',
      type: 'normal'
    },
    {
      name: 'price',
      type: 'normal'
    },
    {
      name: 'quantity',
      type: 'normal'
    },
    {
      name: 'excess',
      type: 'normal'
    },
    {
      name: 'shortage',
      type: 'normal'
    },
    {
      name: 'expired_at',
      type: 'normal'
    },
  ]
  total_orders: number = 0
  //pagination data
  rows!: number
  total!: number
  page: number = 0
  //filter form
  inventoryFilterForm!: FormGroup
  //dropdown data
  warehouses: warehouses[] = []
  products: products[] = []
  constructor(private http: HttpService,
    private printService: PrintService,
    private websocketService: WebSocketService,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService) { }

  ngOnInit() {
    this.getDropdownData()

    this.inventoryFilterForm = this.formBuilder.group({
      product_id: [ '' ],
      warehouse_id: [ '' ],
      from: [ '' ],
      to: [ '' ]
    })

    //get data
    this.subscription.add(this.activatedRoute.queryParams.pipe(
      switchMap((param: any) => {
        return this.getAllData(param, true);
      })
    ).subscribe({
      next: res => {
        //table data
        this.inventoryData = []
        this.getData(res.data, true)
        //total values
        this.total_orders = res.additional_data.total_orders
        //pagination data
        this.total = res?.meta.total
        this.rows = res.meta?.per_page
      }
    }));

    //set printing data

    localStorage.setItem('columnsArray', JSON.stringify(this.columnsArray))
    localStorage.setItem('columnsNames', JSON.stringify(this.columnsName))
  }

  getDropdownData() {
    //warehouses
    // this.subscription.add(this.generalService.getDropdownData(['warehouses']).subscribe({
    //   next: res => {
    //     this.warehouses = res.data.warehouses
    //   }
    // }))
    this.subscription.add(this.generalService.getWarehouses({ 'inventory': 1 }).subscribe({
      next: res => {
        this.warehouses = res.data
      }
    }))
    //products
    this.subscription.add(this.http.getReq('products/dropdown').subscribe({
      next: res => {
        this.products = res.data
      }
    }))
  }
  quary: any = {}
  getUpdatedQueryParams(sortData?: any) {
    let queryParams: any = {};
    for (const key in this.inventoryFilterForm.value) {
      let value = this.inventoryFilterForm.value[ key ];
      if (value != null && value != undefined && value != "") {
        if (key == 'from' || key == 'to') {
          queryParams[ key ] = datePipe.transform(new Date(value), 'yyyy-MM-dd');
        }
        else {
          queryParams[ key ] = value;
        }
      }
    }
    if (this.page) {
      queryParams[ 'page' ] = this.page;
    }
    if (sortData) {
      queryParams[ 'sort_by' ] = sortData.name;
      queryParams[ 'direction' ] = sortData.direction;
    }
    this.quary = queryParams
    return queryParams;
  }


  //get all data with params if exist
  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [ key, value ] of Object.entries(filters)) {
      if (value)
        x[ key ] = value
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'warehouses/inventory';
    }
    else {
      getUrl = 'warehouses/inventory/all';
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

  //pagination
  changePage(event: any) {
    this.page = event.page + 1
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: "merge" });

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
      this.getAllbatches(printData.type)
    }
    else {
      this.printService.setColumnsArray(this.columnsArray)
      this.printService.setColumnsNames(this.columnsName)
      this.printService.setRowsData(this.inventoryData)
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
  allPrintBatches: any = []
  getAllbatches(printType: any) {
    this.subscription.add(this.getAllData(this.quary, false).subscribe({
      next: res => {
        this.allPrintBatches = []
        this.getData(res.data, false)
      }, complete: () => {
        this.printService.setColumnsArray(this.columnsArray)
        this.printService.setColumnsNames(this.columnsName)
        this.printService.setRowsData(this.allPrintBatches)
        if (printType == 1) {
          this.printService.downloadPDF()
        }
        else {
          this.printService.downloadCSV()
        }
      }
    }))
  }
  getData(data: any, paginated: boolean) {
    let temp: any = []

    data.forEach((inventory: any) => {
      temp.push(
        {
          'product_name': inventory?.product?.name,
          'user_name': inventory?.user?.name,
          'warehouse_name': inventory?.warehouse?.name,
          'created_at': inventory.created_at,
          'price': inventory?.batch?.batch_price,
          'quantity': inventory?.batch?.real_quantity,
          'excess': inventory?.excess,
          'shortage': inventory?.shortage,
          'expired_at': inventory?.batch?.operating_number + '  ' + inventory?.batch?.expired_at,
        }
      )


    });
    if (paginated) {
      this.inventoryData = temp
    }
    else {
      this.allPrintBatches = temp
    }
  }
  //sorting
  sorting(sortData?: any) {
    const queryParams = this.getUpdatedQueryParams(sortData);
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: "merge"
    });
  }

}
