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
  selector: 'app-inventoring-products',
  templateUrl: './inventoring-products.component.html',
  styleUrls: ['./inventoring-products.component.scss']
})
export class InventoringProductsComponent implements OnInit {
  private subscription=new Subscription()
  warehouses:warehouses[]=[]
  products:products[]=[]
  inventoryEmployees:commonObject[]=[]
  corridors:corridors[]=[]
  manufacturers:commonObject[]=[]

  inventoryData: any[] = []
  filterForm!:FormGroup
  shortage:number=0
  excess:number=0
  total_price:number=0
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
      name: ' كمية المراجعة	',
    },

    {
      name: ' الزيادة',

    },
    {
      name: ' العجز',

    },
    {
      name: ' صافى المبلغ	',
    },

    {
      name:'موظف الجرد'
    },
    {
      name:'كاتب الجرد'
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
    {
      name: ' تم	',
      frozen:true
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
      type: 'normal'
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
      name: 'inventoried_warehouse_quantity',
      type: 'normal'
    },
    {
      name: 'review_quantity',
      type: 'input'
    },
    {
      name: 'more_quantity',
      type: 'normal'
    },
    {
      name: 'shortage_quantity',
      type: 'normal'
    },
    {
      name: 'total_price',
      type: 'normal'
    },
    {
      name: 'inventory_employees',
      type: 'loop'
    },
    {
      name: 'author',
      type: 'normal'
    },
    {
      name: 'warehouse_name',
      type: 'normal'
    },
    {
      name: 'inventory_created_at',
      type: 'normal'
    },
    {
      name: 'notes',
      type: 'normal'
    },
    {
      name: 'done',
      type: 'done',
      frozen:true
    },
  ]
  rows!:number
  total!:number
  page:number=1
  inventory_id!:number
  showData:boolean=false
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
      // this.getAllProducts({inventory_id:this.inventory_id})
    
  }

  intiatForm(){
    this.filterForm=this.fb.group({
      inventory_id:[''],
      warehouse_id:[''],
      product_id:[''],
      author_id:[''],
      corridor_id:[''],
      manufacturer_id:[''],
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

    this.filterForm.controls['inventory_id'].setValue(x['inventory_id']) 
    if (paginated) {
      getUrl = 'warehouses/inventory/carts/not-reviewed';
      
      }
      else {
        getUrl = 'warehouses/inventory/carts/not-reviewed/all';
      }

    return this.http.getReq(getUrl, { params: x });
  }

  getDropdownData() {
    this.subscription.add(this.generalService.getDropdownData(['corridors' ,'manufacturers' ]).subscribe({
      next: res => {
        // this.created_by = res.data.purchases_employees
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
    // this.getAllProducts(queryParams)
  }

  getAllProducts(queryParams:any){
    this.getAllData(queryParams,true).subscribe({
      next:res=>{
        this.inventoryData = []
        this.getData(res.data,true)
        this.total = res.meta.total
        this.rows = res.meta.per_page
        this.shortage=res.additional_data.shortage
        this.excess=res.additional_data.more
        this.total_price=res.additional_data.total
      },complete:()=>{
        this.showData=true
      }
    })
  }


  changepages(event: any) {

    this.page = event.page + 1
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
    // this.getAllProducts(queryParams)
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
        let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'تم');
        let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'done');
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
  sortData:any
  sort(sortData:any){
  this.sortData=sortData
  this.page=1
  this.updateCurrentPage(this.page-1);
  const queryParams = this.getUpdatedQueryParams();
  this.router.navigate([], { queryParams });
  this.getAllData(queryParams,true)
  
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = []
    data.forEach((product:any) => {
      tempArr.push({
        id: product.id,
        location: product.location, 
        product_name: product.product_name,
        expired_opretion: product.batch_expired_at + ' ' + product.batch_operating_number,
        public_price: product.public_price,
        past_warehouse_quantity:product.past_warehouse_quantity,
        inventoried_warehouse_quantity: product.inventoried_warehouse_quantity,
        review_quantity: product.inventoried_warehouse_quantity,
        more_quantity: product.more_quantity ,
        shortage_quantity: product.shortage_quantity, 
        total_price: product.total_price, 
        inventory_employees: product.inventory_employees, 
        author: product.author,
        warehouse_name: product.warehouse_name, 
        is_reviewed:product?.is_reviewed,
        inventory_created_at: product.inventory_created_at,
        notes: product.notes,
      })
    });

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
      let tempColumnsArray = this.columnsArray.filter(column => column.name.trim() !== 'تم');
      let tempColumnsName = this.columnsName.filter(column => column.name.trim() !== 'done');
      this.printService.setColumnsArray(tempColumnsArray)
      this.printService.setColumnsNames(tempColumnsName)
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

  review(id?:any){
    let params:LooseObject={}
    let temp:any=[]
    let formDataPayLoad = new FormData();
    let current_index:number
    if(id){
      const index = this.inventoryData.findIndex(c => c.id == id)
      if(index>-1){
        current_index=index
        temp.push(
          {
            'quantity':this.inventoryData[index].review_quantity,
            'cartItem_id':id
          }
        )
        formDataPayLoad.set(`cartItem_id[]`,id)
      }
    }
    else{
      this.inventoryData.forEach((c:any)=>{
        if(!c.is_reviewed){
          temp.push(
            {
              'quantity':c.review_quantity,
              'cartItem_id':c.id
            }
          )

        }
      })
    }
    params['cartItems']=temp

    this.subscription.add(this.http.postReq('warehouses/inventory/carts/review',params).subscribe({
      next:res=>{

      },complete:()=>{
        if(!id){
          console.log(this.total/this.rows)
          console.log(this.page)
          if(this.page<=(this.total/this.rows)){
            this.changepages({page:this.page})
            this.updateCurrentPage(this.page-1);
          }
          else{
            this.inventoryData = this.inventoryData.map(item => ({
              ...item, 
              is_reviewed: true
            }));
            // this.router.navigate(['/purchases/inventory/inventoring_orders'])
          }
        }
        else{
           this.inventoryData[current_index].is_reviewed=1
        }
      }
    }))

  }
  inputChange(event:any){
   this.inventoryData[event.index].review_quantity=Number(event.input_text)
   let review_quantity=Number(this.inventoryData[event.index].review_quantity)
   let current_Quntity=Number(this.inventoryData[event.index].past_warehouse_quantity)
   let public_price=Number(this.inventoryData[event.index].public_price)
   if(review_quantity>current_Quntity){
     this.inventoryData[event.index].more_quantity=review_quantity-current_Quntity
     this.inventoryData[event.index].shortage_quantity=0
   }
   else if(review_quantity<current_Quntity){
     this.inventoryData[event.index].shortage_quantity=current_Quntity-review_quantity
     this.inventoryData[event.index].more_quantity=0
   }
   else{
     this.inventoryData[event.index].more_quantity=0
     this.inventoryData[event.index].shortage_quantity=0
   }
   this.inventoryData[event.index].total_price=review_quantity*public_price
  
  }
}
