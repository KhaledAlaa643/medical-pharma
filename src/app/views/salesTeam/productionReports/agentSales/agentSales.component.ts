import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { client } from '@models/client';
import { area } from '@models/pharmacie';
import { allProductionReports, productionReports } from '@models/production-reports';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { DatesService } from '@services/dates.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import * as moment from 'moment';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface agentProduction {
  agentCode: number
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
  selector: 'app-agentSales',
  templateUrl: './agentSales.component.html',
  styleUrls: [ './agentSales.component.scss' ]
})
export class AgentSalesComponent implements OnInit {
  @ViewChild('calendarTo') calendarTo!: Calendar
  @ViewChild('calendarFrom') calendarFrom!: Calendar

  dateTo?: Date;
  dateFrom?: Date


  private subs = new Subscription();
  tableData: agentProduction[] = []
  clientData: client[] = []
  IsDataAvailable: boolean = false
  filterForm!: FormGroup
  agentSales: any[] = []
  selectedClientId: any;
  areaData: area[] = [];
  agentSalesFooter: any[] = []
  columnsArray: columnHeaders[] = [
    {
      name: 'كود العميل  ',
    },
    {
      name: 'اسم العميل ',
    },
    {
      name: 'عدد المبيعات',
    },
    {
      name: 'المبيعات',
    },
    {
      name: 'المرتجعات ',
    },
    {
      name: ' صافي المبيعات ',
    },
    {
      name: ' النسبة من مبيعات المندوب  ',
    },

    {
      name: 'النسبة من اجمالي المبيعات',
    },
  ]
  columnsName: ColumnValue[] = [
    {
      name: 'code',
      type: 'normal'
    },
    {
      name: 'name',
      type: 'normal'
    },
    {
      name: 'orders_count',
      type: 'normal'
    },
    {
      name: 'total',
      type: 'normal'
    },
    {
      name: 'returns',
      type: 'green_text'
    },
    {
      name: 'net_sales',
      type: 'green_text'
    },
    {
      name: 'client_sales_percentage',
      type: 'normal'
    },
    {
      name: 'percentage_sales',
      type: 'normal'
    },

  ]
  columnsFooters: ColumnValue[] = [
    {
      name: 'code',
      type: 'empty'
    },
    {
      name: 'salesmen_count',
      type: 'normal'
    },
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
      type: 'green_text'
    },
    {
      name: 'net_sales_sum',
      type: 'green_text'
    },
    {
      name: 'client_sales_percentage_sum',
      type: 'normal'
    },
    {
      name: 'percentage_sales_sum',
      type: 'normal'
    },
  ]

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private datesService: DatesService,
    private auth:AuthService
  ) {



  }
  getDate(){
    // this.generalService.getSettingsEnum().subscribe({
    //   next:res => {
    //     this.dateFrom=res.data.sales_report.from
    //     this.dateTo=res.data.sales_report.to
    //   },complete:()=> {
    //     this.filterForm.controls['from'].setValue(datePipe.transform(this.dateFrom, 'yyyy-MM-dd'))
    //     this.filterForm.controls['to'].setValue(datePipe.transform(this.dateTo, 'yyyy-MM-dd'))
    //   }
    // })
  
    
    this.dateFrom=this.auth.getEnums().sales_report.from
    this.dateTo=this.auth.getEnums().sales_report.to
  
    this.filterForm.controls['from'].setValue(datePipe.transform(this.dateFrom, 'yyyy-MM-dd'))
    this.filterForm.controls['to'].setValue(datePipe.transform(this.dateTo, 'yyyy-MM-dd'))
  }
  getUserSales() {
    this.subs.add(this.generalService.getUsers().subscribe({
      next: (res) => {
        this.clientData = res.data

      }
    }))
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
      this.subs.add(this.http.getReq('orders/reports/salesman-sales', { params: queryParams }).subscribe({
        next: res => {
          this.IsDataAvailable = true
          this.agentSales = []
          this.agentSalesFooter = []

          res.data.forEach((element: any) => {
            this.agentSales.push(
              {
                code: element.pharmacy?.code,
                name: element.pharmacy?.name,
                orders_count: element.orders_count,
                total: element.total,
                returns: element.returns,
                net_sales: element.net_sales,
                client_sales_percentage: element.client_sales_percentage, //| number:'1.2-2' : ''
                percentage_sales: element.percentage_sales,

              }
            )
          });

          this.agentSalesFooter.push({
            code: '',
            salesmen_count: res.additional_data.rows_count,
            orders_count_sum: res.additional_data.orders_count_sum,
            sales_sum: res.additional_data.sales_sum,
            returns_sum: res.additional_data.returns_sum,
            net_sales_sum: res.additional_data.net_sales_sum,
            client_sales_percentage_sum: res.additional_data.client_sales_percentage_sum,
            percentage_sales_sum: res.additional_data.percentage_sales_sum,
          })
        }
      }))

    }
    else {
      this.filterForm.markAllAsTouched()
    }
  }

  ngOnInit() {
    this.getUserSales()

        this.filterForm = this.fb.group({
          user_id: [ '' ],
          from: [],
          to: [],
        });
        this.getDate()

  }


}
