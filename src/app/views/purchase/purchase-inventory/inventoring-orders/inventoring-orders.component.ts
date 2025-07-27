import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { products, warehouses } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Paginator } from 'primeng/paginator';
import { catchError, of, Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');


@Component({
  selector: 'app-inventoring-orders',
  templateUrl: './inventoring-orders.component.html',
  styleUrls: ['./inventoring-orders.component.scss']
})
export class InventoringOrdersComponent implements OnInit {
  private subscription = new Subscription()
  warehouses:warehouses[]=[]
  products:products[]=[]
  inventoryData: any[] = []
  filterForm!:FormGroup
  shortage:number=0
  excess:number=0
  total_price:number=0

  columnsArray: columnHeaders[] = [
    {
      name: 'رقم أذن الجرد',
    },
    {
      name: ' كاتب الجرد	',
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
      name: ' موظف الجرد',
    },
    {
      name: 'عدد الاصناف',

    },
    {
      name: ' قيمة العجز',
      sort: true,
      direction: null

    },
    {
      name: ' قيمة الزيادة',
      sort: true,
      direction: null

    },
    {
      name: ' صافي المبلغ	',
    },
    {
      name: ' ملاحظات 	',
    },

  ]
  columnsName: ColumnValue[] = [
    {
      name: 'id',
      type: 'nameClickableBlue'
    },
    {
      name: 'author',
      type: 'normal'
    },
    {
      name: 'warehouse',
      type: 'normal'
    },
    {
      name: 'created_at',
      type: 'normal'
    },
    {
      name: 'inventory_employees',
      type: 'loop'
    },

    {
      name: 'inventory_carts_count',
      type: 'normal'
    },
    {
      name: 'shortage',
      type: 'normal'
    },
    {
      name: 'excess',
      type: 'normal'
    },

    {
      name: 'total_price',
      type: 'normal'
    },
    {
      name: 'notes',
      type: 'normal'
    },

  ]
  rows!:number
  total!:number
  page:number=1
  order_logs:any=[]
  inventoryEmployees:commonObject[]=[]
  constructor(private router:Router,private fb:FormBuilder,private activatedRoute:ActivatedRoute,private printService:PrintService,private http:HttpService,private generalService:GeneralService) { }

  ngOnInit() {
    this.intiatForm()
    this.getDropdownData()
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
        this.shortage=res.additional_data.shortage
        this.excess=res.additional_data.more_quantity
        this.total_price=res.additional_data.total_price
      }
    }));
  }

  intiatForm(){
    this.filterForm=this.fb.group({
      inventory_id:[''],
      warehouse_id:[''],
      author_id:[''],
      inventory_employee_id:[''],
      from:[''],
      to:['']
    })
  }

  getAllData(filters: any,paginated: boolean) {

    let x: LooseObject = {};
    for (const [ key, value ] of Object.entries(filters)) {
      if (value)
        x[ key ] = value
    }
    let getUrl=''
    if (paginated) {
      getUrl = 'warehouses/inventory/orders';
      
      }
      else {
        getUrl = 'warehouses/inventory/orders/all';
      }

    return this.http.getReq(getUrl, { params: x });
  }

  getDropdownData() {
    // this.subscription.add(this.generalService.getDropdownData([ 'suppliers', 'purchases_employees', 'warehouses' ]).subscribe({
    //   next: res => {
    //     // this.created_by = res.data.purchases_employees
    //     this.warehouses = res.data.warehouses
    //   }
    // }))

    this.subscription.add(this.generalService.getWarehouses({ 'inventory': 1 }).subscribe({
      next: res => {
        this.warehouses = res.data
      }
    }))

    this.subscription.add(this.generalService.getInventoryEmployee().subscribe({
      next:res=>{
        this.inventoryEmployees=res.data
      }
    }))

  }

        
  @ViewChild('paginator') paginator!: Paginator
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage),0);
  }

  Filter() {
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
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[ key ].value;
      if (value != null && value != undefined && (value === 0 || value !== '')) {
        if (key == 'from' || key == 'to') {
          queryParams[ key ] = datePipe.transform(value, 'yyyy-MM-dd')
        }
        else {
          queryParams[ key ] = value;

        }
      }
    }

    if (this.page) {
      queryParams[ 'page' ] = this.page;
    }
    if(this.sortData){
      queryParams[ 'sort_by' ] = this.sortData.name;
      queryParams[ 'direction' ] = this.sortData.direction; 
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
        this.printService.setColumnsArray(this.columnsArray)
        this.printService.setColumnsNames(this.columnsName)
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
  sortData:any
  sort(sortData:any){
  this.sortData=sortData
  this.page=1
  this.updateCurrentPage(this.page-1);
  const queryParams = this.getUpdatedQueryParams();
  this.router.navigate([], { queryParams });
  
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = []
    tempArr=data.map((order:any) => ({
      ...order,
      warehouse: order.warehouse_name,
      shortage:order.shortage_quantity,
      excess:order.more_quantity
    }));

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
      this.printService.setColumnsArray(this.columnsArray)
      this.printService.setColumnsNames(this.columnsName)
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

  orderDetails(order_id: any) {
    // this.router.navigate([`/purchases/inventory/inventoring_products/${order_id}`]);
    this.router.navigate(['/purchases/inventory/inventoring_products'], {
      queryParams: { inventory_id: order_id }
    });
  }
}
