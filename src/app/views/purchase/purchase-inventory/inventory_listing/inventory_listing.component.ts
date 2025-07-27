import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { corridors } from '@models/corridors';
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
  selector: 'app-inventory_listing',
  templateUrl: './inventory_listing.component.html',
  styleUrls: ['./inventory_listing.component.scss']
})
export class Inventory_listingComponent implements OnInit {

  warehouses:warehouses[]=[]
  products:products[]=[]
  inventoryData: any[] = []
  columnsArray: columnHeaders[] = [
    {
      name: 'الموقع',
    },
    {
      name: ' اسم الصنف	',
      sort: true,
      direction: null
    },
    {
      name: ' التاريخ والتشغيلة	',

    },
    {
      name: ' السعر	',

    },
    {
      name: ' كمية المخزن	',
    },
    {
      name: ' كمية الجرد	',
    },

    {
      name: ' العجز',

    },
    {
      name: ' الزيادة',

    },
    {
      name: ' صافى المبلغ	',
    },

    {
      name:'مراجع الجرد'
    },
    {
      name:'كاتب الجرد'
    },
    {
      name:'موظف الجرد'
    },
    {
      name: ' المخزن	',

    },
    {
      name: ' التاريخ	',
    },
    {
      name: ' الملاحظات	',
    },
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'location',
      type: 'normal'
    },
    {
      name: 'product_name',
      type: 'normal'
    },
    {
      name: 'expired_opretion',
      type: 'batch_expired_at/operating_number'
    },
    {
      name: 'public_price',
      type: 'normal'
    },
    {
      name: 'past_warehouse_quantity',
      type: 'normal'
    },
    {
      name: 'reviewed_warehouse_quantity',
      type: 'normal'
    },
    {
      name: 'shortage_quantity',
      type: 'normal'
    },
    {
      name: 'more_quantity',
      type: 'normal'
    },
    {
      name: 'total_price',
      type: 'normal'
    },
    {
      name: 'reviewed_by',
      type: 'normal'
    },
    {
      name: 'author',
      type: 'normal'
    },
    {
      name: 'inventory_employees',
      type: 'loop'
    },
    {
      name: 'warehouse_name',
      type: 'normal'
    },
    {
      name: 'reviewed_at',
      type: 'normal'
    },
    {
      name: 'notes',
      type: 'normal'
    },
  ]
  private subscription=new Subscription()
  inventoryEmployees:commonObject[]=[]
  corridors:corridors[]=[]
  manufacturers:commonObject[]=[]

  filterForm!:FormGroup
  shortage:number=0
  excess:number=0
  total_price:number=0

  rows!:number
  total!:number
  page:number=1
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
        this.inventoryData = []
        this.getData(res.data,true)
        this.total = res.meta.total
        this.rows = res.meta.per_page
        this.shortage=res.additional_data.shortage
        this.excess=res.additional_data.more
        this.total_price=res.additional_data.total
      }
    }));
  }

  intiatForm(){
    this.filterForm=this.fb.group({
      inventory_id:[''],
      warehouse_id:[''],
      product_id:[''],
      author_id:[''],
      manufacturer_id:[''],
      inventory_employee_id:[''],
      reviewed_by:[''],
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
      getUrl = 'warehouses/inventory/carts/reviewed';
      
      }
      else {
        getUrl = 'warehouses/inventory/carts/reviewed/all';
      }

    return this.http.getReq(getUrl, { params: x });

  }

  getDropdownData() {
    this.subscription.add(this.generalService.getDropdownData(['corridors' ,'manufacturers' ]).subscribe({
      next: res => {
        // this.created_by = res.data.purchases_employees
        // this.warehouses = res.data.warehouses
        this.corridors=res.data.corridors
        this.manufacturers=res.data.manufacturers
      }
    }))

    this.subscription.add(this.generalService.getWarehouses({ 'inventory': 1 }).subscribe({
      next: res => {
        this.warehouses = res.data
      }
    }))

    this.subscription.add(this.generalService.getProducts().subscribe({
      next:res=>{
        this.products=res.data
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
        if (key == 'from' || key == 'to' || key =='supplied_from' || key=='supplied_to') {
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
    // data.forEach((request: any) => {
    //   tempArr.push(
    //     {
    //       order_num: request.id,
    //       supplier_name: request.supplier.name,
    //       created_by: request.created_by.name,
    //       created_at: request.created_at,
    //       reviewed_at:request.reviewed_at,
    //       products_num: request.total_cart_items,
    //       total:request.total_price,
    //       warehouse_name: request.warehouse.name,
    //       status: request.status.name,
    //     }
    //   )


    // });

     tempArr=data

    if (pagiated == true) {
      this.inventoryData = tempArr
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

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

}
