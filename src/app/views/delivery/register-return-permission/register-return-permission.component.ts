import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { HttpService } from '@services/http.service';
import { Dropdown } from 'primeng/dropdown';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { returns } from '@models/returns';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-register-return-permission',
  templateUrl: './register-return-permission.component.html',
  styleUrls: ['./register-return-permission.component.scss']
})
export class RegisterReturnPermissionComponent implements OnInit {
  returnList:returns[]=[]
  private subs=new Subscription()
  columnsArray:columnHeaders[]= [
    {
     name: 'اسم الصنف ',
    },
    {
     name: 'الكمية',
    },
    { 
      name:' السعر	',
    },
    { 
      name:' الخصم	',
    },
    { 
      name:' التاريخ والتشغيلة	',
    },
    { 
      name:' الاجمالي	',
    },
    { 
      name:' أمر	',
    },
   ]
   columnsName:ColumnValue[]= [
    {
      name:'product_name',
      type:'normal'
    },
    {
      name:'quantity',
      type:'normal'
    },
    {
      name:'price',
      type:'normal'
    },
    {
      name:'discount',
      type:'normal'
    },
    {
      name:'expired_at',
      type:'expired_at/operating_number'
    },
    {
      name:'total',
      type:'normal'
    },
    {
      name:'delete',
      type:'trachIconDelete'
    },
    
   ]
   reasons:{name:string,value:number}[]=[]
   rows!:number
   order_id!:number
   pharmacy_id!:number
   total!:number
   OrderDetailsForm!:FormGroup
   orderProducts:any=[]
   addReturnProductForm!:FormGroup
   warehouse_id!:number

   constructor(private http:HttpService,private fixedDataService:FixedDataService,private router:Router,private activatedRoute:ActivatedRoute,private fb:FormBuilder,private toastr:ToastrService) { }

  ngOnInit() {
    this.order_id=Number(this.activatedRoute.snapshot.paramMap.get('orderId'))
    this.pharmacy_id=Number(this.activatedRoute.snapshot.paramMap.get('pharmacyId'))
    this.OrderDetailsForm=this.fb.group({
      code:[''],
      pharmacy_name:[''],
      created_at:[''],
      order_number:[''],
      warehouse_id:[''],
      sales_id:[''],
      delivery_id:['']
    })
    this.addReturnProductForm=this.fb.group({
      id:[''],
      expired_at:[''],
      operating_number:[''],
      quantity:[''],
      price:[''],
      discount:[''],
      reason:[''],
      total:[''],
      product_name:[''],
      returnable_id:[''],
      returnable_type:[''],
    })
    this.getOrderData()
    this.getDropdownData()
    setTimeout(() => {
      this.focudProducts()
    }, 100);
 
  }
  @ViewChild('productsDropdown') private productsDropdown!: Dropdown;
  focudProducts(){
    if(this.productsDropdown){
      this.productsDropdown?.focus();
    }
  }
  @ViewChild('reasonDropdown') private reasonDropdown!: Dropdown;
  focusReason(){
    if(this.reasonDropdown){
      this.reasonDropdown?.focus();
    }
  }
  @ViewChild('submitbtn') submitbtn!: ElementRef<HTMLElement>;
  focusSubmit(dropdown:any){
    if (!dropdown.overlayVisible) {
      this.submitbtn?.nativeElement.focus();
    }
  }

  getDropdownData(){
     //returns
    this.subs.add(this.fixedDataService.getAllFixedData().subscribe({
      next:res=>{
        this.reasons=res.data.returns_reasons
      }
    }))
  }
 
  getOrderData(){
     let order:any={}
      this.subs.add(this.http.getReq('orders/invoice-content-inventoried',{params:{id:this.order_id,pharmacy_id:this.pharmacy_id}}).subscribe({
        next: res => {
          order = res.data
        },complete:()=>{
          this.OrderDetailsForm.controls['code'].setValue(order?.pharmacy?.code)
          this.OrderDetailsForm.controls['pharmacy_name'].setValue(order?.pharmacy?.name)
          this.OrderDetailsForm.controls['created_at'].setValue(order?.created_at)
          this.OrderDetailsForm.controls['order_number'].setValue(order?.order_number)
          this.OrderDetailsForm.controls['warehouse_id'].setValue(order?.warehouse?.name)
          this.OrderDetailsForm.controls['sales_id'].setValue(order?.created_by?.name)
          this.OrderDetailsForm.controls['delivery_id'].setValue(order?.delivery?.name)
          this.warehouse_id=order.warehouse.id
          this.getOrderProducts(order)
        }
      }))
    
  }
  getOrderProducts(order:any){
    order.cart.forEach((cart:any) => {
        this.orderProducts.push(
          {
            'product_name':cart.product_name,
            'id':cart.product_id,
            'expired_at':cart.expired_at,
            'operating_number':cart.operating_number,
            'quantity':cart.quantity,
            'price':cart.price,
            'discount':cart.discount,
            'total':cart.total,
            'reason':null,
            'batch_id':cart.batch_id,
            'returnable_id':cart.cart_id,
            'returnable_type':'Cart',
            'disabled':false,
            'return_message':cart?.returned_alert_message
          }
        )

    });
  }
  @ViewChild('priceInput') priceInput!: ElementRef<HTMLElement>;

focusPrice(){
  setTimeout(() => {
    
    this.priceInput.nativeElement.focus();
  }, 100);
}
  
  setProductData(dropdown:any){
    if (!dropdown.overlayVisible) {
      const product = this.orderProducts.find((product: any) => product.returnable_id === this.addReturnProductForm.controls['returnable_id'].value);
      if(product){
        this.addReturnProductForm.patchValue(product)
        this.toastr.info(product.return_message)
      }
      this.focusPrice()
    }

  }
  setNewTotal(event?:any){
    const product = this.orderProducts.find((product: any) => product.id === this.addReturnProductForm.controls['id'].value);
    if(product){
      if(this.addReturnProductForm.controls['quantity'].value>0){
        let price_without_discount=this.addReturnProductForm.controls['quantity'].value*this.addReturnProductForm.controls['price'].value
        this.addReturnProductForm.controls['total'].setValue(price_without_discount-(price_without_discount*(this.addReturnProductForm.controls['discount'].value/100)))
      }
      else{
        this.toastr.error('تأكد من الكمية')
      }
      if(event){
        this.focusReason()
        event.preventDefault();
      }

    }
  }

  findProduct(cart_id:number,disable_value:boolean){
    const index = this.orderProducts.findIndex((c:any)=> c.returnable_id == cart_id)

    if (index > -1) {
      this.orderProducts[index].disabled=disable_value
    }
  }

  addReturn(){
    let batch_id:number
    let body:any
    const index = this.orderProducts.findIndex((c:any)=> c.returnable_id == this.addReturnProductForm.controls['returnable_id'].value)
    if (index > -1) {
      batch_id=this.orderProducts[index].batch_id
       body={
        'batch_id':batch_id,
        'cart_id':this.addReturnProductForm.controls['returnable_id'].value,
        'quantity':Number(this.addReturnProductForm.controls['quantity'].value)
      }

    }

    this.subs.add(this.http.postReq('orders/returns/validate-quantity',body).subscribe({
      next:res=>{

      },complete:()=>{
        this.findProduct(this.addReturnProductForm.controls['returnable_id'].value,true)
        this.returnList.push(this.addReturnProductForm.value)
        this.addReturnProductForm.reset()
        this.focudProducts()
      }
    }))
  }
  deleteReturn(returnable_id:any){
    const index = this.returnList.findIndex((c:any)=> c.returnable_id == returnable_id)
    if (index > -1) {
     this.returnList.splice(index,1)
     this.findProduct(returnable_id,false)

    }
  }
  deleteAll(){
    this.returnList=[]
  }

  finishReturnPermission(){
    let products = this.returnList.map((product: any) => {
      const {id, product_name, expired_at, ...rest } = product;
      const [year, month] = expired_at.split('-');
      const expirationDate = datePipe.transform(new Date(year, month - 1, 1), 'yyyy-MM-dd') 
    
      return {
        ...rest,
        expired_at: expirationDate, 
      };
    });

    let body={
      'pharmacy_id':this.pharmacy_id,
      'order_id':this.order_id,
      'warehouse_id':this.warehouse_id,
      'products':products
        }
    this.subs.add(this.http.postReq('orders/returns/create',body).subscribe({
      next:res=>{

      },complete:()=>{
        this.router.navigate([`/warehouse/storekeeper/customer-returns/register-return-permission`])
      }
    }))
  }


}
