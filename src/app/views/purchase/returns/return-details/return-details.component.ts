import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Location } from '@angular/common';
import { Subscription, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-return-details',
  templateUrl: './return-details.component.html',
  styleUrls: ['./return-details.component.scss']
})
export class ReturnDetailsComponent implements OnInit {
  ReturnDetailsForm!:FormGroup
  acceptReturnForm!:FormGroup
  private subs=new Subscription()
  returnProductsList:any=[]
  return_id!:number
  columnsArray:columnHeaders[]= [
    {
     name: ' الصنف ',
    }, 
    {
     name: 'الكمية',
    },
    { 
      name:' الخصم	',
    },
    { 
      name:' السعر	',
    },
    { 
      name:' الاجمالي	',
    },
    { 
      name:' سبب المرتجع	',
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
      name:'discount',
      type:'normal'
    },
    {
      name:'price',
      type:'normal'
    },
    {
      name:'total',
      type:'normal'
    },
    {
      name:'reason',
      type:'normal'
    },
    
   ]
  constructor(private fb:FormBuilder,private toastr:ToastrService,private location:Location,private activatedRoute:ActivatedRoute,private printService:PrintService,private http:HttpService) { }

  ngOnInit() {
    this.return_id=Number(this.activatedRoute.snapshot.paramMap.get('return_id'))
      
    this.ReturnDetailsForm=this.fb.group({
      supplier_code:[''],
      supplier_name:[''],
      created_at:[''],
      return_id:[''],
      warehouse_name:[''],
      reviewed_by:[''],
      created_by:[''],
      status:['']
    })
    this.acceptReturnForm=this.fb.group({
      purchases_return_id:[''],
      receiver_name:['',Validators.required],
      national_id:['',Validators.required],
      note:['']
    })

    this.getreturnData()    

    this.acceptReturnForm.controls['purchases_return_id'].setValue(this.return_id)

  }

  return_status!:number
  returnData:any={}
  getreturnData(){
    this.subs.add(this.http.getReq('purchases/returns/requests-report',{params:{'purchases_return_id':this.return_id}}).subscribe({
      next:res=>{
        this.ReturnDetailsForm.get('status')?.setValue(res.data[0].status.name);
       this.returnData=res.data[0]
      },complete:()=>{
          this.returnData.returned_items.forEach((returnable:any) => {
            this.returnProductsList.push({
              'product_name':returnable?.return[0].product_name,
              'quantity':returnable?.return[0].quantity,
              'discount':returnable?.discount,
              'price':returnable?.public_price,
              'total':returnable?.total,
              'reason':returnable?.return[0].reason.name

            })
        });
        
          this.ReturnDetailsForm.controls['supplier_code'].setValue(this.returnData.purchase.supplier.id)
          this.ReturnDetailsForm.controls['supplier_name'].setValue(this.returnData.purchase.supplier.name)
          this.ReturnDetailsForm.controls['created_at'].setValue(this.returnData.created_at)
          this.ReturnDetailsForm.controls['return_id'].setValue(this.returnData.id)
          this.ReturnDetailsForm.controls['warehouse_name'].setValue(this.returnData?.purchase?.warehouse?.name)
          this.ReturnDetailsForm.controls['reviewed_by'].setValue(this.returnData.purchase.reviewed_by.name)
          this.ReturnDetailsForm.controls['created_by'].setValue(this.returnData?.created_by?.name)
          this.ReturnDetailsForm.controls['status'].setValue(this.returnData.status?.name)
          this.return_status=this.returnData.status?.value

          if(this.return_status==3 || this.returnData.receiver_name){
            this.acceptReturnForm.patchValue(this.returnData)
          }
      }
    }))
  }

  acceptReturn(){
    let message:string=''
    this.subs.add(this.http.postReq('purchases/returns/received',this.acceptReturnForm.value).subscribe({
      next:res=>{
        message=res.message
      },complete:()=>{
        this.toastr.success(message)
        this.location.back();
      }
    }))
  }


  ngOnDestroy(): void {
    this.subs.unsubscribe()
    this.openModal()
  }

  changeStatus(){
    this.subs.add(this.http.postReq('purchases/returns/printed',{purchases_return_id:this.return_id}).subscribe({
      next:res=>{
        
      },complete:()=>{
        if(this.ReturnDetailsForm.controls['status'].value!='تم الطباعة'){
          this.return_status=2
          this.ReturnDetailsForm.controls['status'].setValue('تم الطباعة')
        }
      }
    }))
  }

  print(printData:any){

  
    this.printService.setColumnsArray(this.columnsArray)
    this.printService.setColumnsNames(this.columnsName)
    this.printService.setRowsData(this.returnProductsList)
  
    if(printData.type==1){
      this.printService.downloadPDF()
    }
    else{
      this.printService.downloadCSV()
    }
    if(this.return_status!=3){
      this.changeStatus()
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
