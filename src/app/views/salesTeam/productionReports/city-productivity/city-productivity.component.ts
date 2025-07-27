import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  agentCode: number;
  agentName: string;
  totalSales: number;
  sales: number;
  returns: number;
  netSales: number;
  salesPercent: number;
  totalSalesPercent: number;
}

@Component({
  selector: 'app-city-productivity',
  templateUrl: './city-productivity.component.html',
  styleUrls: ['./city-productivity.component.scss'],
})
export class CityProductivityComponent implements OnInit {
  @ViewChild('calendarTo') calendarTo!: Calendar;
  @ViewChild('calendarFrom') calendarFrom!: Calendar;

  dateTo?: any;
  dateFrom?: any;
  firstDayOfMonth = moment().startOf('month').toDate();
  today = moment().toDate();

  tableData: agentProduction[] = [];
  filterForm!: FormGroup;
  private subs = new Subscription();
  IsDataAvailable: boolean = false;
  citySalesData: any = [];
  governateData: any = [];
  citiesData: any = [];
  selectedCityId: any;
  trackData: any = [];
  citySalesDataTotal: any = [];
  governateDataTotal: any = [];
  citiesDataTotal: any = [];
  citySalesDataFooter: any[] = [];

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
      name: 'النسبة من مبيعات المدينة',
    },

    {
      name: 'النسبة من اجمالي المبيعات',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'code',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'orders_count',
      type: 'normal',
    },
    {
      name: 'total',
      type: 'green_text',
    },
    {
      name: 'returns',
      type: 'normal',
    },
    {
      name: 'net_sales',
      type: 'normal',
    },
    {
      name: 'client_sales_percentage',
      type: 'normal',
    },
    {
      name: 'percentage_sales',
      type: 'normal',
    },
  ];
  columnsFooters: ColumnValue[] = [
    {
      name: 'code',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'empty',
    },
    {
      name: 'orders_count_sum',
      type: 'normal',
    },
    {
      name: 'sales_sum',
      type: 'green_text',
    },
    {
      name: 'returns_sum',
      type: 'normal',
    },
    {
      name: 'net_sales_sum',
      type: 'normal',
    },
    {
      name: 'client_sales_percentage_sum',
      type: 'normal',
    },
    {
      name: 'percentage_sales_sum',
      type: 'normal',
    },
  ];

  submitFilterForm() {
    if (this.filterForm.valid) {
      let queryParams: any = {};
      for (const key in this.filterForm.value) {
        let value = this.filterForm.controls[key].value;
        if (
          value != null &&
          value != undefined &&
          (value === 0 || value !== '')
        ) {
          if (key == 'from' || key == 'to') {
            queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
          } else {
            queryParams[key] = value;
          }
        }
      }

      this.subs.add(
        this.http
          .getReq('orders/reports/city-sales', { params: queryParams })
          .subscribe({
            next: (res) => {
              this.IsDataAvailable = true;

              this.citySalesData = [];
              this.citySalesDataTotal = res.additional_data;
              this.citySalesDataFooter = [];
              res.data.forEach((element: any) => {
                this.citySalesData.push({
                  code: element.pharmacy?.code,
                  name: element.pharmacy?.name,
                  orders_count: element.orders_count,
                  total: element.total,
                  returns_count: element.returns_count,
                  returns: element.returns,
                  net_sales: element.net_sales,
                  client_sales_percentage: element.percentage_city_sales, //| number:'1.2-2' : ''
                  percentage_sales: element.percentage_sales,
                });
              });

              this.citySalesDataFooter.push({
                code: 'إجمالي',
                name: '',
                orders_count_sum: res.additional_data.orders_count_sum,
                sales_sum: res.additional_data.sales_sum,
                returns_sum: res.additional_data.returns_sum,
                net_sales_sum: res.additional_data.net_sales_sum,
                client_sales_percentage_sum:
                  res.additional_data.percentage_area_sales_sum,
                percentage_sales_sum: res.additional_data.percentage_sales_sum,
              });
            },
          })
      );
    } else {
      this.filterForm.markAllAsTouched();
    }
  }

  getGovernate() {
    this.subs.add(
      this.generalService.getArea().subscribe({
        next: (res) => {
          this.governateData = res.data;
          this.governateDataTotal = res.additional_data;
        },
      })
    );
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.citiesData = res.data;
          this.citiesDataTotal = res.additional_data;
        },
      })
    );
  }
  getCityID() {
    let param = {
      area_id: this.filterForm.controls['area'].value,
    };
    this.subs.add(
      this.generalService.getCity(param).subscribe({
        next: (res) => {
          this.citiesData = res.data[0].areas;
        },
      })
    );
  }

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private datesService: DatesService,
    private auth: AuthService
  ) {
    // const today = new Date();
    // const firstDayOfMonth = datePipe.transform(new Date(today.getFullYear(), today.getMonth(), 1))
    // this.dateFrom = datePipe.transform(firstDayOfMonth, 'yyyy-MM-dd');
    // this.dateTo = datePipe.transform(today, 'yyyy-MM-dd');
  }

  getDate() {
    // this.generalService.getSettingsEnum().subscribe({
    //   next:res => {
    //     this.dateFrom=res.data.sales_report.from
    //     this.dateTo=res.data.sales_report.to
    //   },complete:()=> {
    //     this.filterForm.controls['from'].setValue(datePipe.transform(this.dateFrom, 'yyyy-MM-dd'))
    //     this.filterForm.controls['to'].setValue(datePipe.transform(this.dateTo, 'yyyy-MM-dd'))
    //   }
    // })

    this.dateFrom = this.auth.getEnums().sales_report.from;
    this.dateTo = this.auth.getEnums().sales_report.to;

    this.filterForm.controls['from'].setValue(
      datePipe.transform(this.dateFrom, 'yyyy-MM-dd')
    );
    this.filterForm.controls['to'].setValue(
      datePipe.transform(this.dateTo, 'yyyy-MM-dd')
    );
  }
  ngOnInit() {
    this.getGovernate();
    this.filterForm = this.fb.group({
      area_id: [''],
      from: [],
      to: [],
    });
    this.getDate();
  }
}
