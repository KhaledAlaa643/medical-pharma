import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { supplier } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { uploaded_file } from '@models/uploaded-files';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Subscription, catchError, of, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');


@Component({
  selector: 'app-linked-files',
  templateUrl: './linked-files.component.html',
  styleUrls: ['./linked-files.component.scss']
})
export class LinkedFilesComponent implements OnInit {
  private subscription=new Subscription()
  filterForm!:FormGroup
  suppliers:supplier[]=[]
  supplier:supplier={} as supplier
  created_by:any[]=[]
  files:uploaded_file[]=[]
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم طلب المقارنة ',
    },
    {
      name: 'كود المورد',
    },
    {
      name: 'اسم المورد',
      sort:true,
      direction:null
    },
    {
      name: 'تاريخ التسجيل',
    },
    {
      name: 'عدد أصناف الملف',
    },
    {
      name: 'تم المقارنة',
    },
    {
      name: 'لم يتم المقارنة',
    },
    {
      name: 'مقارن من قبل',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'أمر',
    },

  ]
  columnsName: ColumnValue[] = [
    {
      name: 'file_id',
      type: 'normal'
    },
    {
      name: 'supplier_code',
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
      name: 'file_products_num',
      type: 'normal'
    },
    {
      name: 'compared_products_num',
      type: 'normal'
    },
    {
      name: 'not_compared_products_num',
      type: 'normal'
    },
    {
      name: 'prev_compared_products_num',
      type: 'normal'
    },
    {
      name: 'created_by',
      type: 'normal'
    },
    {
      name: 'view',
      type: 'view_file'
    },
  ]
    // pagination data 
    page:number=1
    rows!:number
    total!:number
  constructor(private router:Router,private fb:FormBuilder,private http:HttpService,private activatedRoute:ActivatedRoute,private generalService:GeneralService) { }

  ngOnInit() {
    this.getDropdownData()
    this.filterForm=this.fb.group({
      supplier_id:[''],
      created_by:[''],
      from:[''],
      to:[''],
    })
    this.subscription.add(this.activatedRoute.queryParams.pipe(
      switchMap((param: any) => {
        return this.getAllData(param).pipe(
          catchError((error) => {
            return of({ data: [] });
          })
        );
      }),
    ).subscribe({
      next: res => {
        this.files=[]
        res.data.forEach((file:any) => {
          this.files.push({
            file_id:file?.supplier_file_id ,
            supplier: {
              name: file?.supplier?.name,
              code: file?.supplier?.code
            },
            supplier_code:file?.supplier?.code,
            supplier_name:file?.supplier?.name,
            created_by:file?.created_by?.name,
            created_at: file?.created_at,
            file_products_num: file?.total,
            compared_products_num: file?.compared,
            not_compared_products_num: file?.not_compared,
            prev_compared_products_num: file?.prev_compared_products_num
          })
        });
        this.total = res.meta?.total
        this.rows = res.meta?.per_page
      }
    }));
  }

  getAllData(filters: any) {

    let x: LooseObject = {};
    for (const [ key, value ] of Object.entries(filters)) {
      if (value)
        x[ key ] = value
    }

    let getUrl = 'purchases/supplier-products/report';

    return this.http.getReq(getUrl, { params: x });
  }

  getDropdownData(){
    this.subscription.add(this.generalService.getDropdownData(['suppliers','purchases_employees']).subscribe({
      next:res=>{
        this.suppliers=res.data.suppliers
        this.created_by=res.data.purchases_employees
      }
    }))
  }


  filter(){
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }


  changePage(event: any) {
    this.page = event.page + 1
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  sortBySupplier(sortData:any){
    const queryParams = this.getUpdatedQueryParams(sortData);
    this.router.navigate([], { queryParams });  
  }

  changes:boolean=false
  getUpdatedQueryParams(sortData?:any) {
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

    queryParams['changes']=this.changes
    this.changes=!this.changes

    if (sortData) {
      queryParams[ 'sort_by' ] = sortData.name;
      queryParams[ 'direction' ] = sortData.direction;
  }
    if (this.page) {
      queryParams[ 'page' ] = this.page;
    }
    return queryParams;
  }
}
