import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { products } from '@models/products';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Paginator } from 'primeng/paginator';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');


@Component({
  selector: 'app-product-sales-productivity',
  templateUrl: './product-sales-productivity.component.html',
  styleUrls: ['./product-sales-productivity.component.scss']
})
export class ProductSalesProductivityComponent implements OnInit {
  private subs = new Subscription();
  tableData: any = []
  tableFooter:any=[]
  filterForm!: FormGroup
  products:products[]=[]
  page: number = 1
  rows!: number
  total: number=0


  columnsArray: columnHeaders[] = [
    {
      name: 'اسم الصنف',
    },
    {
      name: 'عدد العبوات',
    },
    {
      name: 'قيمة المبيعات',
    },
    {
      name: 'عدد المرتجعات',
    },
    {
      name: 'قيمة المرتجعات',
    },
    {
      name: 'صافي المبيعات',
    },
    {
      name: 'النسبة من اجمالي المبيعات',
    },
    {
      name: 'عدد عملاء المبيعات',
    },
    {
      name: 'عدد عملاء المرتجع',
    }
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'product',
      type: 'normal.name'
    },
    {
      name: 'quantity',
      type: 'normal'
    },
    {
      name: 'total',
      type: 'normal'
    },
    {
      name: 'returns_count',
      type: 'normal'
    },
    {
      name: 'returns',
      type: 'normal'
    },
    {
      name: 'net_sales',
      type: 'green_text'
    },
    {
      name: 'percentage_sales',
      type: 'normal'
    },
    {
      name: 'pharmacies_count',
      type: 'normal'
    },
    {
      name: 'returns_pharmacies_count',
      type: 'normal'
    },
  ]
  columnsFooters: ColumnValue[] = [

    {
      name: 'rows_count',
      type: 'normal'
    },
    {
      name: 'total_quantity_sum',
      type: 'normal'
    },
    {
      name: 'sales_sum',
      type: 'normal'
    },
    {
      name: 'returns_count',
      type: 'normal'
    },
    {
      name: 'returns_sum',
      type: 'normal'
    },
    {
      name: 'net_sales_sum',
      type: 'green_text'
    },
    {
      name: 'percentage_sales_sum',
      type: 'normal'
    },
    {
      name: 'pharmacies_count_sum',
      type: 'normal'
    },
    {
      name: 'returns_pharmacies_count',
      type: 'normal'
    },

  ]


  constructor(private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private auth:AuthService,
    private generalService: GeneralService,) {}




  ngOnInit() {
    this.filterForm = this.fb.group({
      product_id: [''],
      from: [],
      to: [],
  });
  this.getDate()
  this.getProducts()
  this.getReportData()
}

getDate(){
  let dateFrom=this.auth.getEnums().sales_report.from
  let dateTo=this.auth.getEnums().sales_report.to

  this.filterForm.controls['from'].setValue(datePipe.transform(dateFrom, 'yyyy-MM-dd'))
  this.filterForm.controls['to'].setValue(datePipe.transform(dateTo, 'yyyy-MM-dd'))
}

  @ViewChild('paginator') paginator!: Paginator
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage),0);
  }


changepage(event: any) {
  this.page = event.page + 1
  this.router.navigate([], { queryParams: { page: this.page }, queryParamsHandling: 'merge' });
}


  getProducts() {
    this.subs.add(this.generalService.getProducts().subscribe({
      next: (res) => {
        this.products = res.data;
      }
    }));
  }

  filter(){
    this.page=1
    this.updateCurrentPage(this.page-1);
    this.getReportData()
  }

  getReportData() {
    if (this.filterForm.valid) {
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

      queryParams['page'] = this.page


      this.subs.add(this.http.getReq('products/reports/product-productivity', { params: queryParams }).subscribe({
        next: res => {
           this.tableData=res.data
           this.tableFooter=[{...res.additional_data}]

           this.total=res.meta.total
           this.rows=res.meta.per_page
        }
      }))

    }
    else {
      this.filterForm.markAllAsTouched()
    }


  }


}
