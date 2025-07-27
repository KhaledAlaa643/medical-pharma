import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { DatesService } from '@services/dates.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
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
  selector: 'app-trackSales',
  templateUrl: './trackSales.component.html',
  styleUrls: ['./trackSales.component.scss'],
})
export class TrackSalesComponent implements OnInit {
  @ViewChild('calendarTo') calendarTo!: Calendar;
  @ViewChild('calendarFrom') calendarFrom!: Calendar;

  dateTo?: Date;
  dateFrom?: Date;

  tableData: agentProduction[] = [];
  filterForm!: FormGroup;
  private subs = new Subscription();
  IsDataAvailable: boolean = false;
  citySalesData: any = [];
  governateData: any = [];
  citiesData: any = [];
  selectedCityId: any;
  trackData: any = [];
  additional_data: any = [];
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
      name: ' النسبة من مبيعات خط السير  ',
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
      type: 'normal',
    },
    {
      name: 'returns',
      type: 'green_text',
    },
    {
      name: 'net_sales',
      type: 'green_text',
    },
    {
      name: 'percentage_track_sales',
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
      name: 'percentage_track_sales_sum',
      type: 'normal',
    },
    {
      name: 'percentage_sales_sum',
      type: 'normal',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private http: HttpService,
    private generalService: GeneralService,
    private datesService: DatesService
  ) {}

  submitFilterForm() {
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
        .getReq('orders/reports/track-sales', { params: queryParams })
        .subscribe({
          next: (res) => {
            this.IsDataAvailable = true;

            this.citySalesData = [];
            this.additional_data = res.additional_data;
            this.citySalesDataFooter = [];

            res.data.forEach((element: any) => {
              this.citySalesData.push({
                code: element.pharmacy?.code,
                name: element.pharmacy?.name,
                orders_count: element.orders_count,
                total: element.total,
                returns: element.returns,
                net_sales: element.net_sales,
                percentage_track_sales: element.percentage_track_sales, //| number:'1.2-2' : ''
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
              percentage_track_sales_sum:
                res.additional_data.percentage_track_sales_sum,
              percentage_sales_sum: res.additional_data.percentage_sales_sum,
            });
          },
        })
    );
  }

  getGovernate() {
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.governateData = res.data;
        },
      })
    );
  }
  getCityID() {
    let param = {
      city_id: this.filterForm.controls['city_id'].value,
    };
    this.subs.add(
      this.generalService.getCity(param).subscribe({
        next: (res) => {
          this.citiesData = res.data[0].areas;
        },
      })
    );
  }

  getTrackData() {
    this.subs.add(
      this.generalService.getTracks().subscribe({
        next: (res) => {
          this.trackData = res.data;
        },
      })
    );
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      track_id: [''],
      from: [],
      to: [],
    });

    this.getTrackData();
    this.getDate();
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
}
