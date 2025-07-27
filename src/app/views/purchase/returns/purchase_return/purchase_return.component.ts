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
  selector: 'app-purchase_return',
  templateUrl: './purchase_return.component.html',
  styleUrls: ['./purchase_return.component.scss']
})
export class Purchase_returnComponent implements OnInit {
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
   purchase_id!:number
   pharmacy_id!:number
   total!:number
   OrderDetailsForm!:FormGroup
   orderProducts:any=[]
   addReturnProductForm!:FormGroup
   warehouse_id!:number

   constructor(private http:HttpService,private fixedDataService:FixedDataService,private router:Router,private activatedRoute:ActivatedRoute,private fb:FormBuilder,private toastr:ToastrService) { }

  ngOnInit() {
    this.purchase_id=Number(this.activatedRoute.snapshot.paramMap.get('purchase_id'))
    this.OrderDetailsForm=this.fb.group({
      code:[''],
      supplier_name:[''],
      created_at:[''],
      purchase_id:[''],
      warehouse_id:[''],
      sales_id:[''],
      reviewed_by:['']
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
     let purchase:any={}
      this.subs.add(this.http.getReq('purchases/supply-request/get-cart-items',{params:{'purchase_id':this.purchase_id}}).subscribe({
        next: res => {
          purchase = res.data
        },complete:()=>{
          this.OrderDetailsForm.controls['code'].setValue(purchase?.supplier?.id)
          this.OrderDetailsForm.controls['supplier_name'].setValue(purchase?.supplier?.name)
          this.OrderDetailsForm.controls['created_at'].setValue(purchase?.created_at)
          this.OrderDetailsForm.controls['purchase_id'].setValue(purchase?.id)
          this.OrderDetailsForm.controls['warehouse_id'].setValue(purchase?.warehouse?.name)
          this.OrderDetailsForm.controls['sales_id'].setValue(purchase?.created_by?.name)
          this.OrderDetailsForm.controls['reviewed_by'].setValue(purchase?.reviewed_by?.name)
          this.warehouse_id=purchase.warehouse.id
          this.getOrderProducts(purchase)
        }
      }))
    
  } 
  getOrderProducts(order:any){
    order.cart.forEach((cart:any) => {
      if(cart.status.value==1)
        this.orderProducts.push(
          {
            'product_name':cart.product.name,
            'id':cart.product.id,
            'expired_at':cart.expired_at,
            'operating_number':cart.operating_number,
            'quantity':cart.quantity,
            'price':cart.public_price,
            'discount':cart.discount,
            'total':cart.total,
            'reason':null,
            'batch_id':cart.batch_id,
            'returnable_id':cart.id,
            'returnable_type':'CartBatch',
            'disabled':false,
            'return_message':cart.returned_alert_message
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
  cart_data:any=[]
  findProduct(cart_batch_id:number,disable_value:boolean){
    const index = this.orderProducts.findIndex((c:any)=> c.returnable_id == cart_batch_id)

    if (index > -1) {
      this.orderProducts[index].disabled=disable_value
    }
  }

  addReturn(){
    let body:any

       body={
        'cart_purchases_id':Number(this.addReturnProductForm.controls['returnable_id'].value),
        'quantity':Number(this.addReturnProductForm.controls['quantity'].value),
        'discount':Number(this.addReturnProductForm.controls['discount'].value)
      }

    

    this.subs.add(this.http.postReq('purchases/returns/validate-quantity',body).subscribe({
      next:res=>{

      },complete:()=>{
        this.findProduct(this.addReturnProductForm.controls['returnable_id'].value,true)
        this.returnList.push(this.addReturnProductForm.value)
        this.cart_data.push({
          'cart_purchase_id':this.addReturnProductForm.controls['returnable_id'].value,
          'reason':this.addReturnProductForm.controls['reason'].value,
          'quantity':Number(this.addReturnProductForm.controls['quantity'].value),

        })
        this.addReturnProductForm.reset()
        this.focudProducts()
      }
    }))
  }
  deleteReturn(returnable_id:any){
    const index = this.returnList.findIndex((c:any)=> c.returnable_id == returnable_id)
    if (index > -1) {
     this.returnList.splice(index,1)
     this.cart_data.splice(index,1)
     this.findProduct(returnable_id,false)

    }
  }
  deleteAll(){
    this.returnList=[]
    this.cart_data=[]
    this.orderProducts.forEach((product: any) => {
      this.findProduct(product.returnable_id,false)
    })
  }

  finishReturnPermission(){
    // let products = this.returnList.map((product: any) => {
    //   const {id, product_name, expired_at, ...rest } = product;
    //   const [year, month] = expired_at.split('-');
    //   const expirationDate = datePipe.transform(new Date(year, month - 1, 1), 'yyyy-MM-dd') 
    
    //   return {
    //     ...rest,
    //     expired_at: expirationDate, 
    //   };
    // });

    let body={
      'cart':this.cart_data
       }
    this.subs.add(this.http.postReq('purchases/returns/warehouse',body).subscribe({
      next:res=>{

      },complete:()=>{
        this.router.navigate([`/purchases/returns/search-purchases`])
      }
    }))
  }

}
