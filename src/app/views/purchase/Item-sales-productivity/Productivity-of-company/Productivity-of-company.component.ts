import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { allProductionReports, productionReports } from '@models/production-reports';
import { products } from '@models/products';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { DatesService } from '@services/dates.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface agentProduction {
  agentName?: string;
  numberOfSales?: number;
  sales?: number;
  returns?: number;
  netSales?: number;
  totalSalesPercent?: number;
  agentClientAmount?: number;
  salesClientAmount?: number;
  target?: number
  targetPercent?: number

}

@Component({
  selector: 'app-Productivity-of-company',
  templateUrl: './Productivity-of-company.component.html',
  styleUrls: ['./Productivity-of-company.component.scss']
})
export class ProductivityOfCompanyComponent implements OnInit {

  @ViewChild('calendarTo') calendarTo!: Calendar
  @ViewChild('calendarFrom') calendarFrom!: Calendar

  dateTo?: any;
  dateFrom?: any;
  private subs = new Subscription();
  tableData: agentProduction[] = []
  filterForm!: FormGroup
  isActiveTapArray: boolean[] = Array(7).fill(false)
  products: products[] = []
  IsDataAvailable: boolean = false
  targetValue?: number;
  totalPercentageTarget?: number;
  selectedClientId?: number
  salesmanProductivity: productionReports[] = []
  salesmanProductivityAll!: allProductionReports

  columnsArray: columnHeaders[] = [
    {
      name: 'اسم الصنف',
    },
    {
      name: 'الشركة المصنعه',
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
      name: 'النسبة من اجمالي الشركة',
    },
    {
      name: ' المندوب',
    },
    // {
    //   name: 'التارجت',
    // },
    // {
    //   name: 'تحقيق التارجت',
    // },
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'name',
      type: 'normal'
    },
    {
      name: 'package_count',
      type: 'normal'
    },
    {
      name: 'total_sales',
      type: 'normal'
    },
    {
      name: 'returns_count',
      type: 'normal'
    },
    {
      name: 'returns_total',
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
      name: 'sales_clients_count',
      type: 'normal'
    },
    {
      name: 'returns_clients_count',
      type: 'normal'
    },
    // {
    //   name: 'target',
    //   type: 'normal'
    // },
    // {
    //   name: 'percent_target',
    //   type: 'normal'
    // },
  ]
  columnsFootersName: ColumnValue[] = [
    {
      name: 'orders_count_sum',
      type: 'normal'
    },
    {
      name: 'sales_sum',
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
      name: 'sales_clients_count_sum',
      type: 'normal'
    },
    {
      name: 'returns_clients_count_sum',
      type: 'normal'
    },
    {
      name: 'returns_clients_count_sum',
      type: 'normal'
    },
    {
      name: 'returns_clients_count_sum',
      type: 'normal'
    },
  ]
  columnsFootersArray: columnHeaders[] = [
    {
      name: '',
    },
    {
      name: '',
    },
    {
      name: '',
    },
    {
      name: '',
    },
    {
      name: '',
    },
    {
      name: '',
    },
    {
      name: '',
    },
    {
      name: '',
    },
    {
      name: '',
    },
  ]
  salesmanProductivityData: any[] = [];
  salesmanProductivityFooter: any[] = [{}];

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private datesService: DatesService) {
    this.filterForm = this.fb.group({
      product_id: [ '' ],
      from: [ this.dateFrom ],
      to: [ this.dateTo ],
    })

    this.getAllProducts()
  }




  ngOnInit() {
    this.datesService.getDates().subscribe({
        next: (dates) => {
            this.filterForm = this.fb.group({
                user_id: [''],
                from: [dates.dateFrom],
                to: [dates.dateTo],
            });
        },
        error: (error) => console.error('Error loading dates:', error)
    });
}



  isMergedCell(rowIndex: number): boolean {
    return rowIndex % 2 === 0;
  }

  changeActiveTap(index: number) {
    if (index != 6) {
      this.isActiveTapArray.fill(false)
      this.isActiveTapArray[ index ] = true
    }
    else {
      this.isActiveTapArray.fill(false)
    }
  }



  getAllProducts() {
    this.subs.add(this.generalService.getProducts().subscribe({
      next: (res) => {
        this.products=res.data
      }
    }));
  }
  getClientID(event: any) {

    this.selectedClientId = event.value
    this.filterForm.controls[ 'client_id' ].setValue(this.selectedClientId)
  }

  submitFilterForm() {
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


      // this.subs.add(this.http.getReq('orders/reports/salesman-productivity', { params: queryParams }).subscribe({
      //   next: res => {
      //     this.IsDataAvailable = true
      //     this.salesmanProductivityData = []
      //     this.salesmanProductivityFooter = []
      //     this.salesmanProductivity = res.data
      //     res.data.forEach((element: any) => {
      //       this.salesmanProductivityData.push(
      //         {
      //           name: element.sales != null ? element.sales.name : 'بدون   مندوب',
      //           orders_count: element.orders_count,
      //           total: element.total,
      //           returns: element.returns,
      //           net_sales: element.net_sales,
      //           percentage_sales: element.percentage_sales, //| number:'1.2-2' : ''
      //           related_clients_count: element.related_clients_count,
      //           non_related_clients_count: element.non_related_clients_count,
      //           target: '',
      //           percent_target: '',
      //           // footer area 

      //         }
      //       )
      //     });

      //     this.salesmanProductivityFooter.push({
      //       name: res.additional_data.salesmen_count,
      //       orders_count: res.additional_data.orders_count_sum,
      //       total: res.additional_data.sales_sum,
      //       returns: res.additional_data.returns_sum,
      //       net_sales: res.additional_data.net_sales_sum,
      //       percentage_sales: res.additional_data.percentage_sales_sum,
      //       related_clients_count: res.additional_data.related_clients_count_sum,
      //       non_related_clients_count: res.additional_data.non_related_clients_count_sum,
      //       target: '',
      //       percent_target: ''
      //     })
      //   }
      // }))

    }
    else {
      this.filterForm.markAllAsTouched()
    }


  }
page:number=1
rows!:number
total!:number
  changePage(event:any){

  }
}
