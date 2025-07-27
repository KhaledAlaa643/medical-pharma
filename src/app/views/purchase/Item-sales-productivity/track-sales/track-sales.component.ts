import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { DatesService } from '@services/dates.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import * as moment from 'moment';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface agentProduction {
  agentCode: number,
  agentName: string,
  totalSales: number,
  sales: number,
  returns: number,
  netSales: number,
  salesPercent: number,
  totalSalesPercent: number,
}

@Component({
  selector: 'app-track-sales',
  templateUrl: './track-sales.component.html',
  styleUrls: ['./track-sales.component.scss']
})
export class TrackSalesComponent implements OnInit {


  @ViewChild('calendarTo') calendarTo!: Calendar
  @ViewChild('calendarFrom') calendarFrom!: Calendar

  dateTo?: any;
  dateFrom?: any;
  firstDayOfMonth = moment().startOf('month').toDate();
  today = moment().toDate();

  tableData: agentProduction[] = []
  filterForm!: FormGroup;
  private subs = new Subscription();
  IsDataAvailable: boolean = false
  citySalesData: any = []
  governateData: any = []
  citiesData: any = []
  selectedCityId: any;
  trackData: any = []
  citySalesDataTotal: any = []
  governateDataTotal: any = []
  citiesDataTotal: any = []
citySalesDataFooter:any[]= []


columnsArray: columnHeaders[] = [
  {
    name: 'اسم خط السير',
  },
  {
    name: ' المدينة',
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
    name: 'الصافي',
  },
  {
    name: 'النسبة من اجمالي مبيعات المدينة',
  },
  {
    name: 'النسبة من اجمالي المبيعات',
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

footerData: any = [{}]
page:number=1
rows!:number
total!:number
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


      this.subs.add(this.http.getReq('orders/reports/city-sales', { params: queryParams }).subscribe({
        next: res => {
          this.IsDataAvailable = true

          this.citySalesData =[ ]
          this.citySalesDataTotal = res.additional_data
          this.citySalesDataFooter = []
          res.data.forEach((element: any) => {
            this.citySalesData.push(
              {
                code: element.pharmacy?.code,
                name: element.pharmacy?.name,
                orders_count:element.orders_count,
                total: element.total,
                returns:element.returns ,
                net_sales: element.net_sales,
                client_sales_percentage: element.client_sales_percentage, //| number:'1.2-2' : ''
                percentage_sales:element.percentage_sales ,

              }
            )
          });

          this.citySalesDataFooter.push({
            code:'إجمالي',
            name: res.additional_data.salesmen_count,
            orders_count: res.additional_data.orders_count_sum,
            total: res.additional_data.sales_sum,
            returns: res.additional_data.returns_sum,
            net_sales: res.additional_data.net_sales_sum,
            client_sales_percentage: res.additional_data.client_sales_percentage_sum,
            percentage_sales: res.additional_data.percentage_sales_sum,
          }) 

        }
      }))

    }
    else {
      this.filterForm.markAllAsTouched()
    }
  }

  getGovernate() {
    this.subs.add(this.generalService.getArea().subscribe({
      next: (res) => {
        this.governateData = res.data
        this.governateDataTotal = res.additional_data

      }
    }))
    this.subs.add(this.generalService.getCity().subscribe({
      next: (res) => {
        this.citiesData = res.data
        this.citiesDataTotal = res.additional_data
      }
    }))
  }
  getCityID() {
    let param = {
      area_id: this.filterForm.controls[ 'area' ].value
    }
    this.subs.add(this.generalService.getCity(param).subscribe({
      next: (res) => {
        this.citiesData = res.data[ 0 ].areas

      }
    }))
  }

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private datesService:DatesService) {
    // const today = new Date();
    // const firstDayOfMonth = datePipe.transform(new Date(today.getFullYear(), today.getMonth(), 1))

    // this.dateFrom = datePipe.transform(firstDayOfMonth, 'yyyy-MM-dd');
    // this.dateTo = datePipe.transform(today, 'yyyy-MM-dd');

    this.filterForm = this.fb.group({
      area_id: [ '' ],
      from: [ this.dateFrom ],
      to: [ this.dateTo ],
    })
  }
  ngOnInit() {
    this.getGovernate()
    this.datesService.getDates().subscribe({
      next: (dates) => {
        this.filterForm = this.fb.group({
          area_id: [ '' ],
          from: [ dates.dateFrom ],
          to: [ dates.dateTo ],
        });
      },
      error: (error) => console.error('Error loading dates:', error)
    });

  }
  changePage(event: any) {}

}
