import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { warehouses } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Dropdown } from 'primeng/dropdown';
import { BehaviorSubject, catchError, debounceTime, of, Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

export interface totals{
  total_count:number
  total_public_price:number
  total_supply_price:number
  diff_discount:number
}

@Component({
  selector: 'app-register-new',
  templateUrl: './register-new.component.html',
  styleUrls: ['./register-new.component.scss']
})
export class RegisterNewComponent implements OnInit {
  private subscription = new Subscription()
  filterForm!:FormGroup
  addProductForm!:FormGroup
  statisticsForm!:FormGroup
  transferRequestTotals:totals={} as totals
  searchInput$ = new BehaviorSubject('');
  showDiscountInput:boolean=false


  columnsArray1: columnHeaders[] = [
    {
      name: 'رقم الطلب',
    },
    {
      name: 'اسم المورد',
    },
    {
      name: 'التاريخ',
    },
    {
      name: 'الكمية',
    },
    {
      name: 'الخصم',
    },
    {
      name: 'الكاتب',
    },
  ]
  columnsName1: ColumnValue[] = [
    {
      name: 'order_number',
      type: 'normal'
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
      name: 'quantity',
      type: 'normal'
    },
    {
      name: 'discount',
      type: 'normal'
    },
    {
      name: 'created_by',
      type: 'normal'
    },
  ]
  products:commonObject[]=[]
  warehouses:warehouses[]=[]
  lastSupplyRequest:any=[]
  cartData:any=[]
  direction:string=''
  searchWord:string=''
  transfer_id!:any
  disableWarehouse!:boolean
  product_batches:any=[]
  constructor(private http:HttpService,private auth:AuthService,private activatedRoute:ActivatedRoute,private router:Router,private generalService:GeneralService,private fb:FormBuilder,private toastr:ToastrService) { }

  ngOnInit() {
    this.getProducts()
    let fromDate=new Date()
    let toDate=new Date()
    fromDate.setDate(toDate.getDate() - 30);
  
    this.filterForm=this.fb.group({
      warehouse_from_id:['',Validators.required],
      warehouse_to_id:['',Validators.required],
      from:['',Validators.required],
      to:[''],
    })
    this.getDate()
    this.addProductForm=this.fb.group({
      product_id:[''],
      quantity:[''],
      batch_id:[''],
      warehouse_from_quantity:[''],
      warehouse_from_price:[''],
      warehouse_from_discount:[''],
      warehouse_to_discount:[''],
      warehouse_to_quantity:[''],
      weighted_discount:[''],
      discount_difference:[''],
      transfer_id:[''],
    })
    this.statisticsForm=this.fb.group({
      
      total_quantity_sold:[''],
      total_quantity_returned: [''],
      total_quantity_cleared_sold: [''],
      total_warehouses_quantity: [''],
      warehouse_quantity:[''],
      total_quantity_purchase: [''],
      manufacturer_name:[''],
      total_quantity_purchase_returns:[],
      last_invoice: [''],
      last_notInvoiced: [''],
      highest_discount: [''],
      public_price: [''],
      after_discount_price: [''],
      items_number_in_packet: [''],
      packets_number_in_package: [''],
      note: [''],
      suggested_discount: [''],
      last_discount:['']
  
  })

  //search in table
  let searchResult:any
  this.subscription.add(this.activatedRoute.queryParams.pipe(
    switchMap((param: any) => {
      if(this.searchWord || this.direction){
        return this.getallData(param).pipe(
          catchError((error) => {
            return of({ data: [] });
          })
        );
      }
      else{
        if(this.transfer_id){
          return this.getallData().pipe(
            catchError((error) => {
              return of({ data: [] });
            })
          );
        }
      }
      return []
    })
  ).subscribe({
    next: res => {
      searchResult=res
      this.setCartData(searchResult)
    },complete: () => {
    }
  }));
  }

  
  getProducts(){
   this.subscription.add(this.generalService.getProducts().subscribe({
    next:res=>{
      this.products=res.data
    }
   }))
  //  this.subscription.add(this.generalService.getDropdownData(['warehouses']).subscribe({
  //   next:res=>{
  //     this.warehouses=res.data.warehouses
  //   }
  //  }))

   this.subscription.add(this.generalService.getWarehouses({ 'transfers': 1 }).subscribe({
    next: res => {
      this.warehouses = res.data
    }
  }))

  }
  dateFrom:any
  dateTo:any
  getDate(){
    // this.generalService.getSettingsEnum().subscribe({
    //   next:res => {
    //     this.dateFrom=res.data.sales_report.from
    //     this.dateTo=res.data.sales_report.to
    //   },complete:()=> {
    //     this.filterForm.controls['from'].setValue(datePipe.transform(this.dateFrom, 'yyyy-MM-dd'))
    //     this.filterForm.controls['to'].setValue(datePipe.transform(this.dateTo, 'yyyy-MM-dd'))
    //   }
    // })

    this.dateFrom=this.auth.getEnums().dates.from
    this.dateTo=this.auth.getEnums().dates.to

    this.filterForm.controls['from'].setValue(datePipe.transform(this.dateFrom, 'yyyy-MM-dd'))
    this.filterForm.controls['to'].setValue(datePipe.transform(this.dateTo, 'yyyy-MM-dd'))
  }

//upper filter 
//TODO update last supply request when it's response is done
  filter(){
    let all_params:LooseObject={}
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[ key ].value;
      if (value != null && value != undefined && (value === 0 || value !== '')) {
        if (key == 'from' || key == 'to') {
          all_params[ key ] = datePipe.transform(value, 'yyyy-MM-dd')
        }
        else {
          all_params[ key ] = value;

        }
      }
    }  

    let product_id=this.addProductForm.controls['product_id'].value
    if(product_id!=null && product_id!=undefined && product_id!=''){
      all_params['product_id']=product_id
    }
    if(this.filterForm.valid && this.filterForm.touched){
      this.subscription.add(this.http.getReq('purchases/transfers/searching',{params:all_params}).subscribe({
        next:res=>{
          this.statisticsForm.reset()
          this.statisticsForm.patchValue(res.data)
          this.statisticsForm.controls['last_discount'].setValue(res.data.last_supply_request?.last_discount)
          this.lastSupplyRequest=[]
          if(res.data.last_supply_request){
            this.lastSupplyRequest.push(
              {
                'order_number':res.data.last_supply_request?.id,
                'supplier_name':res.data.last_supply_request?.supllier_name,
                'created_at':res.data.last_supply_request?.created_at,
                'quantity':res.data.last_supply_request?.total_quantity,
                'discount':res.data.last_supply_request?.last_discount,
                'created_by':res.data.last_supply_request?.createdBy,
              }
            )
          }
        }
      }))
    }
  }

  productChangeEvent(dropdown?: any) { 
    if (!dropdown.overlayVisible) {
      this.showDiscountInput=false
      this.getProductDetails()
      if(this.addProductForm.controls['product_id'].value){
        this.filter()
      }
      dropdown?.close();
    }
  }
   product:any={}
   main_from_discount!:number
  getProductDetails(){
    this.product={}
    let product_id=this.addProductForm.controls['product_id'].value
    if(product_id){
      let all_params:LooseObject={
        product_id:product_id,
      }
      //check is warehouse_from_id and warehouse_to_id should be sent and required
      if(this.filterForm.controls['warehouse_from_id'].value){
        all_params['warehouse_from_id']=this.filterForm.controls['warehouse_from_id'].value
      }
      if(this.filterForm.controls['warehouse_to_id'].value){
        all_params['warehouse_to_id']=this.filterForm.controls['warehouse_to_id'].value
      }
      this.subscription.add(this.http.getReq('purchases/transfers/product-details',{params:all_params}).subscribe({
        next:res=>{
         this.product=res.data
         this.product_batches=[]
         res.data.batches.forEach((batch:any) => {
          this.product_batches.push({
            'name':batch.expired_at+' '+batch.operating_number,
            'id':batch.id,
            'quantity':batch.quantity,
            'batch_price':batch.batch_price
          })
         });
         5280

        },complete:()=>{
          // this.addProductForm.patchValue(product)
          this.main_from_discount=this.product.warehouse_from.discount
          this.addProductForm.controls['warehouse_from_quantity'].setValue(this.product.warehouse_from.quantity)
          this.addProductForm.controls['warehouse_from_price'].setValue(this.product.warehouse_from.price)
          this.addProductForm.controls['warehouse_from_discount'].setValue(this.product.warehouse_from.discount)
          this.addProductForm.controls['warehouse_to_quantity'].setValue(this.product.warehouse_to.quantity)
          this.addProductForm.controls['warehouse_to_discount'].setValue(this.product.warehouse_to.discount)
          this.focus('batchesDropdown')

          this.calcWeightedDiscount()

        }
      }))
    }
    else{
      this.resetAddProductForm()
      this.product_batches=[]
    }
  }
 
  //transfer product
  addProductToCart(){
    let body:LooseObject={}
    for (const key in this.addProductForm.value) {
      let value = this.addProductForm.controls[ key ].value;
      if (value != null && value != undefined && (value === 0 || value !== '')) {
        if(key!='warehouse_from_discount' && key!='warehouse_to_discount' && key!='warehouse_from_quantity' && key!='warehouse_to_quantity' && key!='weighted_discount' && key!='warehouse_from_price' && key!='discount_difference'){
          body[ key ] = value;
        }
        else if(key=='warehouse_from_discount'){
          body['discount']=value
        }
        else if(key=='warehouse_from_price'){
          body['price']=value
        }
      }
    }
    if(this.filterForm.controls['warehouse_from_id'].value){
      body['transfer_from_warehouse_id'] = this.filterForm.controls['warehouse_from_id'].value
    }
    if(this.filterForm.controls['warehouse_to_id'].value){
      body['transfer_to_warehouse_id'] = this.filterForm.controls['warehouse_to_id'].value
    }
    let cartProduct:any={}
    this.subscription.add(this.http.postReq('purchases/transfers/add-batch',body).subscribe({
      next:res=>{
        cartProduct=res
      },complete:()=>{
        //get transfer id for first item added to cart
        this.transfer_id=cartProduct.data.id
        this.addProductForm.controls['transfer_id'].setValue(this.transfer_id)
        this.setCartData(cartProduct)
        this.disableWarehouse=true
        this.transferRequestTotals=cartProduct.additional_data
        this.resetAddProductForm()
        this.focus('productsDropdown')
        }
      
    }))
  }

  setCartData(res:any){
    this.cartData=[]
    res.data.grouped_batch_transferred.forEach((batch:any) => {
      this.cartData.push({ 
        'batch_transfer_id':batch.batch_transfer_id,
        'product_name':batch.product_name,
        'expiration_operation':batch.batch.expired_at+' '+batch.batch.operating_number,
        'price':batch.price,
        'total_price':batch.total_price,
        'discount':batch.discount,
        'total':batch.supply_price,
        'quantity_before_transfer':batch.quantity_before_transfer,
        'quantity_transferred':batch.quantity_transferred,
        'weighted_discount':batch.weighted_discount,
        'diff_discount':batch.diff_discount
      })
    
    })
  }
  resetAddProductForm(){
    for (const key in this.addProductForm.value) {
      if(key!='transfer_id'){
        this.addProductForm.controls[key].reset()
      }
    } 
  }
  //search in table
  product_search() {
    this.subscription.add(this.searchInput$.pipe(
      debounceTime(2000),
    ).subscribe(
      {
        next: () => {
          return this.router.navigate([], { queryParams: { product_name: this.searchWord }, queryParamsHandling: 'merge' });

        }, complete: () => {

        }
      }
    ));

    this.searchInput$.next(this.searchWord);
      
  }

  sortByName() {
    if (this.cartData.length > 0) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc';
      setTimeout(() => {
        return this.router.navigate([], { queryParams: { sort_by: 'product_name', direction: this.direction }, queryParamsHandling: 'merge' });
      }, 50);
    }
  }


  getallData(filters?: any) {

    let x: LooseObject = {};
    if(filters){
      for (const [ key, value ] of Object.entries(filters)) {
        if (value)
          x[ key ] = value
      }
    }
    x['transfer_id']=this.transfer_id
    let getUrl = 'purchases/transfers/get-batches';
    return this.http.getReq(getUrl, { params: x });
  }

  //delete item
  deleteProduct(product_index:number){
    let message:string=''
    let additional_data:any={}
    let all_params={
      'batch_transfer_id':this.cartData[product_index].batch_transfer_id 
    }
    this.subscription.add(this.http.deleteReq('purchases/transfers/delete-batch',{params:all_params}).subscribe({
      next:res=>{
       message=res.message
       additional_data=res.additional_data
      },complete:()=>{
        this.transferRequestTotals=additional_data
        this.toastr.info(message)
        this.cartData.splice(product_index,1)
        if(this.cartData.length==0){
          this.disableWarehouse=false
          this.transfer_id=null
          this.addProductForm.controls['transfer_id'].setValue(null)
        }
      },error:()=>{
        this.closePopup()
      }
    }))

  }

  //popup open and close
  popupType!:number
@ViewChild('popupModalOpen') popupModalOpen!: ElementRef<HTMLElement>;
@ViewChild('PopupModalClose') PopupModalClose!: ElementRef<HTMLElement>;
delete_product_index!:number
cancle_button_name!:string
ok_button_name!:string
popupMessage!:string
openModel(type:number,product_index?:number){

  if(type==1){
    this.popupType=1
    this.popupMessage='هل انت متأكد من حذف الصنف !'
    this.cancle_button_name='الغاء'
    this.ok_button_name='حذف'
    this.delete_product_index=Number(product_index)
  }
  else if(type==2){
    this.popupType=2
    this.popupMessage='هل انت متأكد من تحويل الكل !'
    this.cancle_button_name='الغاء'
    this.ok_button_name='تحويل'
  }
  let el: HTMLElement = this.popupModalOpen.nativeElement;
  el.click();
}
closePopup(){
  let el: HTMLElement = this.PopupModalClose.nativeElement;
  el.click(); 
}

Popupevent(event:any){
  if(this.popupType==1){
    if(event.ok==true){
      this.deleteProduct(this.delete_product_index)
    }
    else{
      this.closePopup()
    }
  }
  else{
    if(event.ok==true){
      this.completeTransfer()
    }
    else{
      this.closePopup()
    }
  }
}

completeTransfer(){
  let formDataPayLoad =new FormData();
  let message:string='';
  this.cartData.forEach((cart_item:any,index:number)=>{
    formDataPayLoad.set(`batches[${index}][batch_transfer_id]`,String(cart_item.batch_transfer_id))
  })
  if(this.transfer_id){
    formDataPayLoad.set(`transfer_id`,String(this.transfer_id))

  }
  this.subscription.add(this.http.postReq('purchases/transfers/submit',formDataPayLoad).subscribe({
    next:res=>{
      message=res.message
      this.closePopup()
     },complete:()=>{
       this.toastr.info(message)
         this.resetPage()
  
     },error:()=>{
       this.closePopup()
     }
  }))
}
batch_price!:number
getQuantityOfWarehouse(){
  this.showDiscountInput=false
  if(this.addProductForm.controls['batch_id'].value){
    const index=this.product_batches.findIndex((c:any) => c.id == this.addProductForm.controls['batch_id'].value)
    this.addProductForm.controls['warehouse_from_quantity'].setValue(this.product_batches[index].quantity)
    this.batch_price=this.product_batches[index].batch_price
  }
  else{
    this.addProductForm.controls['warehouse_from_quantity'].setValue(this.product.warehouse_from.quantity) 
  }
}

resetPage(){
  this.addProductForm.reset()
  this.filterForm.reset()
  this.statisticsForm.reset()
  this.lastSupplyRequest=[]
  this.cartData=[]
  this.transferRequestTotals={} as totals
  this.transfer_id=0
  this.disableWarehouse=false
  this.getDate()
  this.product_batches=[]
}
@ViewChild('productsDropdown') private productsDropdown!: Dropdown;;
@ViewChild('batchesDropdown') private batchesDropdown!: Dropdown;;

focus(next:string,event?:any){

  const nextInput = document.getElementById(next) as HTMLElement;
  if(next!='productsDropdown' && next!='batchesDropdown'){
    if(nextInput){
      if(!this.productsDropdown?.overlayVisible && !this.batchesDropdown?.overlayVisible){
        event?.preventDefault()
        nextInput.focus()
      }
    }
  }
  else if(next=='productsDropdown'){
    if(!this.productsDropdown?.overlayVisible){

    }
    this.productsDropdown?.focus();
  }
  else{
    this.batchesDropdown?.focus();

  }

}

calcDifference(){
  if(this.addProductForm.controls['warehouse_from_discount'].value>0 &&
     this.addProductForm.controls['warehouse_from_discount'].value<this.main_from_discount &&
     this.addProductForm.controls['quantity'].value){
      console.log(this.main_from_discount)
      console.log(this.addProductForm.controls['warehouse_from_discount'].value)
      console.log( this.batch_price)
      let value:number=((this.main_from_discount-this.addProductForm.controls['warehouse_from_discount'].value)/100) * this.addProductForm.controls['quantity'].value * this.batch_price
      let rounded:number=Math.round(value * 100) / 100
    this.addProductForm.controls['discount_difference'].setValue(rounded)
  }
  else{
    this.addProductForm.controls['discount_difference'].setValue(0)

  }
}

calcWeightedDiscount(){
  if(this.addProductForm.controls['quantity'].value){
   let to_warehouse=this.addProductForm.controls['warehouse_to_discount'].value*this.addProductForm.controls['warehouse_to_quantity'].value
   let from_warehouse=this.addProductForm.controls['warehouse_from_discount'].value*this.addProductForm.controls['quantity'].value
   let total_quantity=this.addProductForm.controls['warehouse_to_quantity'].value+this.addProductForm.controls['quantity'].value
   let weighted_discount=(to_warehouse+from_warehouse)/total_quantity
   let rouded_weighted_discount=Math.round(weighted_discount * 100) / 100
   this.addProductForm.controls['weighted_discount'].setValue(rouded_weighted_discount)
  }
  else{
    this.addProductForm.controls['weighted_discount'].setValue(0)
  }
}
}
