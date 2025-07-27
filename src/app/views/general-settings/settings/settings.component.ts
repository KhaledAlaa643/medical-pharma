import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { setting } from '@models/settings';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  settingsViewArray = Array.from({ length: 5 }, () => ({ show: false, disabled: false }));
  private subs=new Subscription()
  corridorsSetting!:FormGroup
  basketSettings!:FormGroup
  highPriceSettings!:FormGroup
  expirationDateSettings!:FormGroup
  warehouseSettings!:FormGroup
  addCorridor=true
  damagedBaskets:any=[]
  multiple_corridors_enabled_boolean!:string
  monthes=[
    {
      name:'1 شهر',
      value:1
    },
    {
      name:'2 شهر',
      value:2
    },
    {
      name:'3 شهر',
      value:3
    },
    {
      name:'4 شهر',
      value:4
    },
    {
      name:'5 شهر',
      value:5
    },
    {
      name:'6 شهر',
      value:6
    },
    {
      name:'7 شهر',
      value:7
    },
    {
      name:'8 شهر',
      value:8
    },
    {
      name:'9 شهر',
      value:9
    },
    {
      name:'10 شهر',
      value:10
    },
    {
      name:'11 شهر',
      value:11
    },
    {
      name:'12 شهر',
      value:12
    },
    {
      name:'13 شهر',
      value:13
    },
    {
      name:'14 شهر',
      value:14
    },
    {
      name:'15 شهر',
      value:15
    },
    {
      name:'16 شهر',
      value:16
    },
    {
      name:'17 شهر',
      value:17
    },
    {
      name:'18 شهر',
      value:18
    },
  ]
  multiple_corridors_enabled=[
    {
      name:'المخزن الواحد',
      value:0
    },
    {
      name:'محطات',
      value:1
    }
  ]
  default_sorting=[
    {
      name:'اسم الصنف',
      value:'product_name'
    },
    {
      name:' الشركة المصنعه',
      value:'manufacturer_name'
    }
  ]

permissions:any=[]
settingsData:setting={} as setting
  constructor(private auth:AuthService,private http:HttpService,private fb:FormBuilder,private toastr:ToastrService) { }

  ngOnInit() {
    if(localStorage.getItem('multiple_corridors_enabled')){
      this.multiple_corridors_enabled_boolean=String(localStorage.getItem('multiple_corridors_enabled'))
    }
    this.permissions=this.auth.getUserPermissions()
    this.getSettingsData()
    this.checkDisabled()
    this.corridorsSetting=this.fb.group({
      number:[''],
      id:['']
    })
    this.basketSettings=this.fb.group({
      baskets_number:[''],
      damaged_baskets:[''],
      available_baskets:['']
    })
    this.highPriceSettings=this.fb.group({
      price:['',Validators.required]
    })
    this.expirationDateSettings=this.fb.group({
      months:['',Validators.required]
    })
    this.warehouseSettings=this.fb.group({
      multiple_corridors_enabled:['',Validators.required],
      default_sorting:['',Validators.required]
    })
  }
  checkDisabled(){
    if(this.multiple_corridors_enabled_boolean=='false'){
      this.settingsViewArray[2].disabled=true
      this.settingsViewArray[1].disabled=true
    }
  }
  enableAll(){
      this.settingsViewArray.forEach((c:any)=>c.disabled=false)
  }
  show(index:any){
    if(!this.settingsViewArray[index].disabled){
      this.settingsViewArray[index].show=!this.settingsViewArray[index].show
    }
  }
  getSettingsData(){
    this.subs.add(this.http.getReq('settings/warehouses').subscribe({
      next:res=>{
         this.settingsData=res.data
         //set basket data
         this.damagedBaskets=this.settingsData.damaged_baskets
         this.basketSettings.controls['baskets_number'].setValue(this.settingsData.baskets_number)
         this.basketSettings.controls['damaged_baskets'].setValue(this.settingsData.damaged_baskets.length)
         this.basketSettings.controls['available_baskets'].setValue(this.basketSettings.controls['baskets_number'].value - this.basketSettings.controls['damaged_baskets'].value)
         this.highPriceSettings.controls['price'].setValue(this.settingsData.high_price)
         this.expirationDateSettings.controls['months'].setValue(this.settingsData.remaining_months_for_expiration)
         if(this.multiple_corridors_enabled_boolean=='false'){
            this.warehouseSettings.controls['multiple_corridors_enabled'].setValue(0)
         }
         else{
          this.warehouseSettings.controls['multiple_corridors_enabled'].setValue(1)
         }
        //untill first section in finished
        // this.warehouseSettings.controls['multiple_corridors_enabled'].setValue(1)
        this.warehouseSettings.controls['default_sorting'].setValue(this.settingsData.default_sorting)
      }
    }))
  }
  corridorSettings(actionType:string){
    let url=''
    let sucessMessage=''
    let corridor:any={}
    let body={
      'number':this.corridorsSetting.controls['number'].value
    }
    if(actionType=='add'){
        url='settings/warehouses/corridors/create'
    }
    else{
        url=`settings/warehouses/corridors/${this.corridorsSetting.controls['id'].value}/update`
    }
    this.subs.add(this.http.postReq(url,body).subscribe({
      next:res=>{
        sucessMessage=res.message
        corridor=res.data.corridor
        
      },complete:()=>{
        this.toastr.success(sucessMessage)
        if(actionType=='add'){
          this.settingsData.corridors.push(corridor)
        }
        else{
        const corridor_index = this.settingsData.corridors.findIndex((c:any)=> c.id ==this.corridorsSetting.controls['id'].value)
        if(corridor_index>-1){
          this.settingsData.corridors[corridor_index].number=this.corridorsSetting.controls['number'].value
        }
        }
        this.corridorsSetting.reset()
      }
    }))
  }
  basketsSettings(){
    let sucessmessge=''
    let param={
      count:Number(this.basketSettings.controls['baskets_number'].value)
    }
    this.subs.add(this.http.postReq('settings/warehouses/baskets/set-total-count',param).subscribe({
      next:res=>{
        sucessmessge=res.message
      },complete:()=>{
        this.toastr.success(sucessmessge)
        this.updateBasketsValue()
      }
    }))
  }
  damagedBasket!:string
updateBasketsValue(){
  this.basketSettings.controls['damaged_baskets'].setValue(this.damagedBaskets.length)
  this.basketSettings.controls['available_baskets'].setValue(this.basketSettings.controls['baskets_number'].value - this.basketSettings.controls['damaged_baskets'].value)
}
  addDamagedBasket(){
    let sucessMessage=''
    let basket:any={}
    this.subs.add(this.http.postReq('settings/warehouses/baskets/mark-damaged',{'number':Number(this.damagedBasket)}).subscribe({
      next:res=>{
        sucessMessage=res.message
        basket=res.data.basket
      },complete:()=>{
        this.damagedBaskets.push(basket)
        this.toastr.success(sucessMessage)
        this.updateBasketsValue()
        this.damagedBasket=''
      }
    }))
  }
  removeDamagedBasket(index:number,id:number){
    let sucessMessage=''
    this.subs.add(this.http.postReq(`settings/warehouses/baskets/${id}/restore`).subscribe({
      next:res=>{
        sucessMessage=res.message
      },complete:()=>{

        this.damagedBaskets.splice(index,1)
        this.toastr.success(sucessMessage)
        this.updateBasketsValue()

      }
    }))
  }

  editHighPrice(){
    let sucessMessage=''
    if(this.highPriceSettings.valid){
      this.subs.add(this.http.postReq('settings/warehouses/high-price',this.highPriceSettings.value).subscribe({
        next:res=>{
         sucessMessage=res.message
        },complete:()=>{
          this.toastr.success(sucessMessage)
        }
      }))

    }
    else{
      this.highPriceSettings.markAllAsTouched()
    }
  }
  editExpirationDate(){
    let sucessMessage=''
    if(this.expirationDateSettings.valid){
      this.subs.add(this.http.postReq('settings/warehouses/expiration-warning',this.expirationDateSettings.value).subscribe({
        next:res=>{
         sucessMessage=res.message
        },complete:()=>{
          this.toastr.success(sucessMessage)
        }
      }))
    }
    else{
      this.expirationDateSettings.markAllAsTouched()
    }
  }

  updateWarehouseSettings(){
    let sucessMessage=''
    if(this.warehouseSettings.valid){
       this.subs.add(this.http.postReq('settings/warehouses/system',this.warehouseSettings.value).subscribe({
        next:res=>{
          sucessMessage=res.message
        },complete:()=>{
          this.toastr.success(sucessMessage)
          if(localStorage.getItem('multiple_corridors_enabled')){
            if(this.warehouseSettings.controls['multiple_corridors_enabled'].value){
              localStorage.setItem('multiple_corridors_enabled','true')
              this.multiple_corridors_enabled_boolean='true'
              this.enableAll()
            }
            else{
              localStorage.setItem('multiple_corridors_enabled','false') 
              this.multiple_corridors_enabled_boolean='false'
              this.checkDisabled()

            } 
          }
        }
       }))
    }
    else{
      this.warehouseSettings.markAllAsTouched()
    }
  }
}
