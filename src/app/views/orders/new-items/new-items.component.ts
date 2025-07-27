import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { newItems } from '@models/new-items';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { HttpService } from '@services/http.service';
import { Calendar } from 'primeng/calendar';
import { BehaviorSubject, Subscription, debounceTime, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-new-items',
  templateUrl: './new-items.component.html',
  styleUrls: ['./new-items.component.scss']
})
export class NewItemsComponent implements OnInit ,OnDestroy {
  items:newItems[] = []
  @Output() newProductEvent = new EventEmitter<number>()
  selectedValue!:any
  created_at:any = '';
  allNewItemsData:newItems[]=[]
  columnsArray: columnHeaders[] = [
    {
      name: 'الصنف',
    },
    {
      name:  'الخصم',
    },
    {
      name: 'الكمية',
    },
    {
      name: 'السعر',
    },
    {
      name:  'المخزن',
    },

  ]
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'nameClickableBlue'
    },
    {
      name: 'discount',
      type: 'normal'
    },
    {
      name: 'quantity',
      type: 'normal'
    },
    {
      name: 'Product_price',
      type: 'normal'
    },
    {
      name: 'warehouse_name',
      type: 'normal'
    }
  ]

  searchInput$ = new BehaviorSubject('');
  private subs = new Subscription();
  constructor(private router:Router,private http:HttpService,private activatedRoute: ActivatedRoute) {
    this.router.navigate([], { queryParams: {created_at :null}, queryParamsHandling: 'merge' })  

   }

  ngOnInit() {
    this.subs.add(this.activatedRoute.queryParams.pipe(
      switchMap((param: any) => {
        return this.getAllData(param);
      })
    ).subscribe({
      next:res=>{
        this.items=[]
        this.allNewItemsData=res.data
        res.data.forEach((item:any)=>{
         this.items.push(
          {
            'product_name':item.name,
            'discount':item.normal_discount,
            'quantity':item.latest_batch.quantity,
            'Product_price':item.price,
            'warehouse_name':item.latest_batch.warehouse.name,
            'id':item.id
          }
         )
        })
      }
    }));
  }
  getAllData(filters : any){
    let x :LooseObject ={}; 
    for (const [key , value] of Object.entries(filters) ) {
      if(value)
        x[key] = value
    }
    let getUrl = 'products/batches/latest';

   return this.http.getReq(getUrl,{params:x}); 
 }
  formattedDate:any
 search(){
  let date = new Date(this.created_at);
  this.formattedDate = datePipe.transform(date, 'yyyy-MM-dd');



  this.subs.add(this.searchInput$.pipe(
    debounceTime(2000),
  ).subscribe(
    {
      next:() => {
        return this.router.navigate([], { queryParams: {created_at: this.formattedDate}, queryParamsHandling: 'merge' });
      },complete:()=>{

      }
    }
  ));
  this.searchInput$.next(this.created_at);
}

clearCalendar() {
   this.created_at=''
   this.formattedDate=''

   return this.router.navigate([], { queryParams: {created_at: null}, queryParamsHandling: 'merge' });
}



getproductId(id: any) {
  this.newProductEvent.emit(id);
}

ngOnDestroy() {
  this.subs.unsubscribe();

}
}
