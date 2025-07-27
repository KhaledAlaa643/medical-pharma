import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColumnValue, columnHeaders } from '@models/tableData.js';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { DatesService } from '@services/dates.service';

import * as moment from 'moment';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import { AuthService } from '@services/auth.service';
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
  selector: 'app-citySales',
  templateUrl: './citySales.component.html',
  styleUrls: [ './citySales.component.scss' ]
})
export class CitySalesComponent implements OnInit {

  @ViewChild('calendarTo') calendarTo!: Calendar
  @ViewChild('calendarFrom') calendarFrom!: Calendar

  dateTo?: Date;
  dateFrom?: Date

  tableData: agentProduction[] = []
  filterForm!: FormGroup;
  private subs = new Subscription();
  IsDataAvailable: boolean = false
  citySalesData: any = []
  governateData: any = []
  citiesData: any = []
  selectedCityId: any;
  trackData: any = []
  citySalesDataFooter: any = []
  governateDataTotal: any = []
  citySalesDataTotal: any;

  constructor(private fb: FormBuilder,
    private http: HttpService,
    private auth:AuthService,
    private generalService: GeneralService,) {}
  columnsArray: columnHeaders[] = [
    {
      name: ' اسم المدينة      ',
    },
    {
      name: ' عدد المبيعات   ',
    },
    {
      name: 'المبيعات ',
    },
    {
      name: 'عدد المرتجعات ',
    },
    {
      name: 'المرتجعات ',
    },
    {
      name: ' النسبة من  مبيعات المحافظة   ',
    },
    {
      name: '  النسبة من  اجمالي المبيعات  ',
    },
  ]
  columnsName: ColumnValue[] = [
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
      type: 'green_text'
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
      name: 'percentage_city_sales',
      type: 'normal'
    },
    {
      name: 'percentage_sales',
      type: 'normal'
    },

  ]
  columnsFooters: ColumnValue[] = [
    {
      name: 'name',
      type: 'normal'
    },
    {
      name: 'orders_count_sum',
      type: 'normal'
    },
    {
      name: 'sales_sum',
      type: 'green_text'
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
      name: 'percentage_city_sales_sum',
      type: 'normal'
    },
    {
      name: 'percentage_sales_sum',
      type: 'normal'
    },
  ]

  submitFilterForm() {
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


    this.subs.add(this.http.getReq('orders/reports/city-productivity', { params: queryParams }).subscribe({
      next: res => {
        this.IsDataAvailable = true

        this.citySalesData = []
        this.citySalesDataFooter = []
        this.citySalesDataTotal = res.additional_data

        res.data.forEach((element: any) => {
          this.citySalesData.push(
            {
              name: element.area.name,
              orders_count: element.orders_count,
              total: element.total,
              returns_count: element.returns_count,
              returns: element.returns,
              percentage_city_sales: element.percentage_city_sales,
              percentage_sales: element.percentage_sales,
            }
          )
        });

        this.citySalesDataFooter.push({
          name: 'إجمالي',
          orders_count_sum: res.additional_data.orders_count_sum,
          sales_sum: res.additional_data.sales_sum,
          returns_count: res.additional_data.returns_count,
          returns_sum: res.additional_data.returns_sum,
          percentage_city_sales_sum: res.additional_data.percentage_city_sales_sum,
          percentage_sales_sum: res.additional_data.percentage_sales_sum,

        })
      }
    }))
  }

  getGovernate() {
    this.subs.add(this.generalService.getCity().subscribe({
      next: (res) => {
        this.governateData = res.data
        this.governateDataTotal = res.additional_data


      }
    }))
  }
  getCityID() {
    let param = {
      city_id: this.filterForm.controls[ 'city_id' ].value
    }
    this.subs.add(this.generalService.getCity(param).subscribe({
      next: (res) => {
        this.citiesData = res.data[ 0 ].areas

      }
    }))
  }

  getTrackData() {
    this.subs.add(this.generalService.getTracks().subscribe({
      next: (res) => {
        this.trackData = res.data

      }
    }))


  }




  ngOnInit() {
    this.filterForm = this.fb.group({
      city_id: [ '' ],
      from: [''],
      to: [''],
    });
    this.getDate()
    this.getGovernate()

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


}










