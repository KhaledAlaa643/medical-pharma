import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { warehouses } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { supplier } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';

import { Subscription, catchError, of, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-return-orders-list',
  templateUrl: './return-orders-list.component.html',
  styleUrls: ['./return-orders-list.component.scss']
})
export class ReturnOrdersListComponent implements OnInit {
  private subscription = new Subscription()
  popupFilterForm!: FormGroup
  searchForm!: FormGroup
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم أذن المرتجع',
    },
    {
      name: 'اسم المورد',
    },
    {
      name: 'التاريخ والوقت',
    },
    {
      name: 'عدد الأصناف المرتجعه',
    },
    {
      name: 'مراجع الاستلامات',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'حالة الطلب',
    },
    {
      name: 'أمر',
    },

  ]
  columnsName: ColumnValue[] = [
    {
      name: 'number',
      type: 'location'
    },
    {
      name: 'supplier_name',
      type: 'normal'
    },
    {
      name: 'created_at',
      type: 'normal'
    },
    {
      name: 'items_count',
      type: 'normal'
    },
    {
      name: 'receiving_auditor',
      type: 'normal'
    },
    {
      name: 'created_by',
      type: 'normal'
    },
    {
      name: 'status',
      type: 'normal'
    },
    {
      name: 'eyeIcon',
      type: 'eyeIcon_id'
    },

  ]
  order_logs: any = []
  totalOrders:number=0
  created_by:commonObject[]=[]
  receiving_reviewer:commonObject[]=[]
  status:commonObject[]=[]
  constructor( private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private generalService: GeneralService,
    private auth:AuthService,
    private printService:PrintService) { }

  ngOnInit() {
    this.getDropdownData()
    this.popupFilterForm = this.fb.group({
      product_name: [ '' ],
      created_by: [ '' ],
      reviewed_by:[''],
      from:[''],
      to:[''],
      status: [ '' ],
    })
    this.searchForm = this.fb.group({
      supplier_id: [ '' ],
      warehouse_id: [ '' ],
    })
    this.subscription.add(this.activatedRoute.queryParams.pipe(
      switchMap((param: any) => {
        return this.getAllData(param,true).pipe(
          catchError((error) => {
            return of({ data: [] });
          })
        );
      }),
    ).subscribe({
      next: res => {
        this.order_logs = []
        this.getData(res.data,true)
        this.total = res.meta.total
        this.rows = res.meta.per_page
        this.totalOrders=res.meta.total
      }
    }));
  }

  getAllData(filters: any,paginated: boolean) {

    let x: LooseObject = {};
    for (const [ key, value ] of Object.entries(filters)) {
      if (value)
        x[ key ] = value
    }
    let getUrl=''
    if (paginated) {
      getUrl = 'purchases/returns/requests-report';
      
      }
      else {
        getUrl = 'purchases/returns/requests-report/print';
      }

    return this.http.getReq(getUrl, { params: x });
  }
  suppliers:supplier[]=[]
  warehouses:warehouses[]=[]
  getDropdownData() {
    this.subscription.add(this.generalService.getDropdownData([ 'suppliers', 'purchases_employees','receiving_reviewer', 'purchases_managers','purchases_employees' ]).subscribe({
      next: res => {
        this.suppliers = res.data.suppliers
        this.receiving_reviewer=res.data.receiving_reviewer
        this.created_by=[...res.data.purchases_managers, ...res.data.purchases_employees];

      }
    }))

    this.subscription.add(this.generalService.getWarehouses({ 'purchases_return': 1 }).subscribe({
      next: res => {
        this.warehouses = res.data
      }
    }))
    // this.subscription.add(this.generalService.getSettingsEnum().subscribe({
    //   next: res => {
    //     this.status = res.data.purchase_returns_status
    //   }
    // }))
    this.status=this.auth.getEnums().purchase_returns_status

  }

  rows!:number
  total!:number
  page!:number
  @ViewChild('paginator') paginator!: Paginator
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage),0);
  }

  filter() {
    this.page=1
    this.updateCurrentPage(this.page-1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }


  changepage(event: any) {

    this.page = event.page + 1
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }


  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.popupFilterForm.value) {
      let value = this.popupFilterForm.controls[ key ].value;
      if (value != null && value != undefined && (value === 0 || value !== '')) {
        if (key == 'from' || key == 'to' ) {
          queryParams[ key ] = datePipe.transform(value, 'yyyy-MM-dd')
        }
        else {
          queryParams[ key ] = value;

        }
      }
    }
    for (const key in this.searchForm.value) {
      let value = this.searchForm.controls[ key ].value;
      if (value != null && value != undefined && (value === 0 || value !== '')) {
          queryParams[ key ] = value;
      }
    }

    if (this.page) {
      queryParams[ 'page' ] = this.page;
    }

    return queryParams;
  }

  //printing
  allPrintOrders: any = []
  currentParams: any = {}
  getAllOrders(printType: any) {
    let params = {}
    params = this.currentParams
    this.subscription.add(this.getAllData(params, false).subscribe({
      next: res => {
        this.allPrintOrders = []
        this.getData(res.data, false)
      }, complete: () => {
        let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
        let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'eyeIcon');
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
    data.forEach((request: any) => {
      tempArr.push(
      {
          'return_id':request.id,
          'number':request.id,
          'supplier_name':request.purchase.supplier.name,
          'created_at':request.created_at,
          'items_count':request.total_returned_items,
          'receiving_auditor':request.reviewed_by.name,
          'status':request.status.name,
          'created_by':request.created_by.name
        }
      )


    });


    if (pagiated == true) {
      this.order_logs = tempArr
    }
    else {
      this.allPrintOrders = tempArr
    }
  }

  print(printData: any) {

    if (printData.amountOfPrint == 2) {
      this.getAllOrders(printData.type)
    }
    else {
      let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'أمر');
      let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'eyeIcon');
      this.printService.setColumnsArray(tempColumnsArray)
      this.printService.setColumnsNames(tempColumnsName)
      this.printService.setRowsData(this.order_logs)

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

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

  goToDetails(purchases_return_id:any){
    this.router.navigate(['/purchases/returns/details/'+purchases_return_id])
  }
}
