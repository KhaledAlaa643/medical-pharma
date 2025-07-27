import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { corridors } from '@models/corridors';
import { LooseObject } from '@models/LooseObject';
import { manufacturers } from '@models/manufacturers';
import { products, warehouses } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface batch{
  product_name:string,
  expired_at:string,
  operating_number:string,
  public_price:any,
  quantity:any,
  inventoried_quantity:any,
  excess:any,
  shortage:any,
  total:any,
  batch_id:any
}

@Component({
  selector: 'app-create-inventory',
  templateUrl: './create-inventory.component.html',
  styleUrls: ['./create-inventory.component.scss']
})
export class CreateInventoryComponent implements OnInit {
  private subscription=new Subscription()
  filterForm!:FormGroup
  addProductForm!:FormGroup
  products:products[]=[]
  warehouses:warehouses[]=[]
  corridors:corridors[]=[]
  Manufacturers:manufacturers[]=[]
  inventoryEmployees:commonObject[]=[]
  reviewers:number[]=[]
  stands:any=[]
  shelves:any=[]
  Data:batch[]=[]
  inventored_data:any=[]

   total_excess:number = 0;
 total_shortage:number = 0;
 total_price:number =  0
 total_Quantity:number =  0
 activateAddBatch:boolean=false
 note!:string
 totalProductsQuantity:number=0
 popupTabs:boolean[]= new Array(1).fill(false)
 disableWarehouse:boolean=false
 disableProducts:boolean=false
  constructor(private http:HttpService,private toastr:ToastrService,private generalService:GeneralService,private auth:AuthService,private fb:FormBuilder) { }

  ngOnInit() {
    this.filterForm=this.fb.group({
      manufacturer_id:[''],
      warehouse_id:[''],
      product_id:[''],
      corridor_id:[''],
      stand:[''],
      shelf:[''],
      price_from:[''],
      price_to:[''],
      more_than_zero:[''],
      accurate_quantity:[''],
      inaccurate_quantity:[''],
      not_inventoried:[''],
      from:[''],
      to:['']
    })
    this.addProductForm=this.fb.group({
      warehouse_id:['',Validators.required],
      product_id:['',Validators.required],
      location:[''],
      manufacturer_name:[''],
      public_price:[''],
      totalWarehousesQuantity:['']
    })
    this.popupTabs[0]=true
    this.getDropdownData()
  }
  getDropdownData(){
   this.subscription.add(this.generalService.getDropdownData(['manufacturers','corridors']).subscribe({
     next:res=>{
       this.Manufacturers=res.data.manufacturers
       this.corridors=res.data.corridors
     }
   }))

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
 
   this.shelves = this.auth.getEnums().shelves.map((shelf: string) => ({ number: shelf }));
   this.stands = this.auth.getEnums().stands.map((stand: string) => ({ number: stand }));


  }

  getProducts(){
    let warehouse_id=this.addProductForm.controls['warehouse_id'].value
    if(warehouse_id){
            let all_params:LooseObject={}
            for (const key in this.filterForm.value) {
              let value = this.filterForm.controls[ key ].value;
              if (value != null && value != undefined && (value === 0 || value !== '')) {
                if(key!='product_id'){
                  if(key=='from' || key=='to'){
                    all_params[ key ] = datePipe.transform(value, 'yyyy-MM-dd')
                  }
                  else if((key=='accurate_quantity' || key=='inaccurate_quantity' || key=='not_inventoried')){
                    if(value==true){
                      all_params[ key ] = 1;
                    }
                  }
                  else{
                    all_params[ key ] = value;

                  }
              }
            }
          }
        
            all_params[ 'warehouse_id' ] = this.addProductForm.controls['warehouse_id'].value;
            
        
            this.subscription.add(this.http.getReq('products/warehouse',{params:all_params}).subscribe({
              next:res=>{
                this.products=res.data
              },complete:()=>{

              }
            }))
          
            
          

    }
    else{
      this.products=[]
    }

}
addProduct(){
  let all_params:LooseObject={}
  let warehouse_id=this.addProductForm.controls['warehouse_id'].value
  let product_id=this.addProductForm.controls['product_id'].value

  all_params[ 'warehouse_id' ] = warehouse_id
  all_params[ 'product_id' ] = product_id
          
      
  this.subscription.add(this.http.getReq('warehouses/inventory/batches',{params:all_params}).subscribe({
    next:res=>{
      this.addProductForm.patchValue(res.additional_data)
      this.total_Quantity=res.additional_data.totalBatchesQuantity
      this.Data=res.data
      this.activateAddBatch=true
    },complete:()=>{
      this.disableProducts=true
      this.disableWarehouse=true
    }
  }))
        
}

calcBatchData(index:number){
  let inventoried_quantity=Number(this.Data[index].inventoried_quantity)
  let current_Quntity=Number(this.Data[index].quantity)
  let public_price=Number(this.Data[index].public_price)

  if(inventoried_quantity>=0){
    if(inventoried_quantity>current_Quntity){
      this.Data[index].excess=inventoried_quantity-current_Quntity
      this.Data[index].shortage=0
    }
    else if(inventoried_quantity<current_Quntity){
      this.Data[index].shortage=current_Quntity-inventoried_quantity
      this.Data[index].excess=0
    }
    else{
      this.Data[index].shortage=0
      this.Data[index].excess=0
    }
    this.Data[index].total=inventoried_quantity*public_price
  }
  else{
    this.Data[index].inventoried_quantity=0
    this.Data[index].shortage=0
    this.Data[index].excess=0
    this.Data[index].total=0
  }
  this.getTotals(index)
}


getTotals(index:number){
  if(this.Data[index].inventoried_quantity<0){
    this.toastr.error('الكمية غير صحيحة');
    this.Data[index].inventoried_quantity=0
    this.Data[index].shortage=0
    this.Data[index].excess=0
    this.Data[index].total=0
  }
  this.total_excess=0
  this.total_shortage=0
  this.total_price=0
  for (const item of this.Data) {
    if(item?.excess>=0){
      this.total_excess += item?.excess;
      
    }
    if(item?.shortage>=0){
      this.total_shortage += item?.shortage;

    }
    if(item?.total>=0){
      this.total_price += item?.total;

    }
  }

}

deleteProduct(index:number){
  this.Data.splice(index, 1);
}

addNewBatch(){
  if(this.activateAddBatch){
    let newItem={
      product_name:this.Data[0].product_name,
      expired_at:'',
      operating_number:'',
      public_price:'',
      quantity:0,
      inventoried_quantity:'',
      excess:'',
      shortage:'',
      total:'',
      batch_id:''
    }
    this.Data.splice(0, 0, newItem);
  }
}
//inventory
inventory_id!:any
inventory(){
 let formDataPayLoad = new FormData();
if(this.addProductForm.valid){
  let warehouse_id=this.addProductForm.controls['warehouse_id'].value
  let product_id=this.addProductForm.controls['product_id'].value
  formDataPayLoad.set('warehouse_id',warehouse_id)
  formDataPayLoad.set('product_id',product_id)
}
if(this.inventory_id){
  formDataPayLoad.set('inventory_id',this.inventory_id)
}

  this.Data.forEach((item, index) => {
    for (const [key, value] of Object.entries(item)) {
      if(key != 'excess' && key != 'shortage' && key != 'total' && key != 'product_name'){ 
        if (value != null && value != undefined && (value === 0 || value !== '')) {
          formDataPayLoad.set(`batches[${index}][${key}]`, value);
        } 
      }
    }
  });

  
this.reviewers.forEach((item: any,index:any) => {
  formDataPayLoad.set(`reviewers[${index}]`, item);
})

this.subscription.add(this.http.postReq('warehouses/inventory/carts/create',formDataPayLoad).subscribe({
  next:res=>{
  this.inventory_id=res.data[0].inventory_id
  this.totalProductsQuantity=res.additional_data.cartCount

  },complete:()=>{
   this.disableProducts=false
   const warehouseIdValue = this.addProductForm.get('warehouse_id')?.value;
   // Reset the form while preserving warehouse_id
   this.addProductForm.reset({
     warehouse_id: warehouseIdValue,
   });
    this.getPendingInventory()
    this.Data=[]
  }
}))
}
tabData1:any=[]
tabData2:any=[]
getPendingInventory(){
  if(this.addProductForm.controls['warehouse_id'].value){
    let all_params:LooseObject={}
    if(this.inventory_id){
      all_params['inventory_id']=this.inventory_id
    }
    if(this.addProductForm.controls['warehouse_id'].value){
      all_params['warehouse_id']=this.addProductForm.controls['warehouse_id'].value
    }
    this.subscription.add(this.http.getReq('warehouses/inventory/carts/pending',{params:all_params}).subscribe({
      next:res=>{
       this.tabData1=res.data.more_or_less
       this.tabData2=res.data.accurate
       this.changeTab(0)
       if(res.additional_data.inventory_id!=null){
        this.inventory_id=res.additional_data.inventory_id
       }
       this.totalProductsQuantity=res.additional_data.count
      },complete:()=>{
      }
    }))
  }
}
closeInventory(){
  let all_params:LooseObject={}

if(this.note){
  all_params[ 'notes' ] = this.note
}

this.subscription.add(this.http.postReq(`warehouses/inventory/${this.inventory_id}/close`,all_params).subscribe({
  next:res=>{

  },complete:()=>{
    this.filterForm.reset()
    this.addProductForm.reset()
    this.Data=[]
    this.inventored_data=[]
    this.products=[]
    this.note=''
    this.total_shortage=0
    this.total_excess=0
    this.total_price=0
    this.total_Quantity=0
    this.totalProductsQuantity=0
    this.inventory_id=null
    this.reviewers=[]
    this.disableWarehouse=false
    this.disableProducts=false
    this.tabData1=[]
    this.tabData2=[]
  }
}))

}

changeTab(index:number){
  this.popupTabs.fill(false)
  this.popupTabs[index]=true
  if(index==0){
    this.inventored_data=this.tabData1
  }
  else{
    this.inventored_data=this.tabData2
  }
}
@ViewChild('popupModalOpen') popupModalOpen!: ElementRef<HTMLElement>;
@ViewChild('PopupModalClose') PopupModalClose!: ElementRef<HTMLElement>;
delete_product_index!:number
cancle_button_name!:string
ok_button_name!:string
popupMessage!:string
openModel(){
    this.ok_button_name ='غلق'
    this.cancle_button_name='حذف'
    this.popupMessage='هل انت متأكد من الغلق للمراجعة !'
  

  let el: HTMLElement = this.popupModalOpen.nativeElement;
  el.click();
}

closePopup(){
  let el: HTMLElement = this.PopupModalClose.nativeElement;
  el.click(); 
}


Popupevent(event:any){
    if(event.ok==true){
      this.closeInventory()
    }
    else{
      this.closePopup()
    }

}

}
