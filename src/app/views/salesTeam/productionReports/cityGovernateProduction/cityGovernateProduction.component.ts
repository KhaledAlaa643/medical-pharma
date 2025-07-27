import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { city, track } from '@models/pharmacie';
import { cityGovernateProduction } from '@models/productionReports';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { DatesService } from '@services/dates.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Calendar } from 'primeng/calendar';
import { Dropdown } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface agentProduction {
  GovernateName?: string;
  cityName: string;
  lineNumber: string;
  numberOfSales: number;
  sales: number;
  numberOfReturns: number;
  returns: number;
  totalSalesPercent: 0.12345;
}

@Component({
  selector: 'app-cityGovernateProduction',
  templateUrl: './cityGovernateProduction.component.html',
  styleUrls: ['./cityGovernateProduction.component.scss'],
})
export class CityGovernateProductionComponent implements OnInit {
  @ViewChild('calendarTo') calendarTo!: Calendar;
  @ViewChild('calendarFrom') calendarFrom!: Calendar;
  @ViewChild('cityDropdown') private cityDropdown!: Dropdown;
  cityGovernateProductionAllAdditional: any;

  dateTo?: any;
  dateFrom?: any;
  columnsArray: columnHeaders[] = [
    {
      name: ' اسم المحافظة   ',
    },
    {
      name: ' عدد المبيعات   ',
    },
    {
      name: 'المبيعات  ',
    },
    {
      name: 'عدد المرتجعات  ',
    },
    {
      name: ' المرتجعات  ',
    },
    {
      name: ' النسبة من اجمالي المبيعات   ',
    },
  ];
  columnsName: ColumnValue[] = [
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
      name: 'returns_count',
      type: 'normal',
    },
    {
      name: 'returns',
      type: 'normal',
    },
    {
      name: 'percentage_city_sales',
      type: 'normal',
    },
  ];
  columnsFooters: ColumnValue[] = [
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'orders_count_sum',
      type: 'normal',
    },
    {
      name: 'net_sales_sum',
      type: 'green_text',
    },
    {
      name: 'returns_count',
      type: 'normal',
    },
    {
      name: 'returns_sum',
      type: 'normal',
    },
    {
      name: 'percentage_city_sales_sum',
      type: 'normal',
    },
  ];
  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private auth: AuthService,
    private datesService: DatesService
  ) {
    // const today = new Date();
    // const firstDayOfMonth = datePipe.transform(new Date(today.getFullYear(), today.getMonth(), 1))
    // this.dateFrom = datePipe.transform(firstDayOfMonth, 'yyyy-MM-dd');
    // this.dateTo = datePipe.transform(today, 'yyyy-MM-dd');
  }

  private subs = new Subscription();
  tableData: agentProduction[] = [];
  filterForm!: FormGroup;
  city: city[] = [];
  track: track[] = [];
  area: any = [];
  IsDataAvailable: boolean = false;
  cityPharmacies: any = [];
  cityGovernateProductionFooter: any[] = [];
  // cityGovernateProduction: cityGovernateProduction[] = []
  cityGovernateProduction: any[] = [];

  ngOnInit() {
    this.filterForm = this.fb.group({
      city_id: [''],
      from: [''],
      to: [''],
    });
    this.getDate();
    this.getDropdwonData();
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

  getDropdwonData() {
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.city = res.data;
          this.cityPharmacies = res.additional_data;
        },
      })
    );
    this.getProductionData();
  }
  cityGovernateProductionAll: any;
  getProductionData() {
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
        .getReq('orders/reports/governorate-productivity', {
          params: queryParams,
        })
        .subscribe({
          next: (res) => {
            this.IsDataAvailable = true;
            this.cityGovernateProduction = [];
            this.cityGovernateProductionAll = res.data;
            this.cityGovernateProductionAllAdditional = res.additional_data;
            this.cityGovernateProductionFooter = [];

            res.data.forEach((element: any) => {
              this.cityGovernateProduction.push({
                name: element.city.name,
                orders_count: element.orders_count,
                total: element.total,
                returns: element.returns,
                returns_count: element.returns_count,
                percentage_city_sales: element.percentage_sales,
              });
            });

            this.cityGovernateProductionFooter.push({
              name: 'الاجمالي',
              orders_count_sum: res.additional_data.orders_count_sum,
              net_sales_sum: res.additional_data.sales_sum,
              returns_sum: res.additional_data.returns_sum,
              returns_count: res.additional_data?.returns_count,
              percentage_city_sales_sum:
                res.additional_data.percentage_sales_sum,
            });
          },
        })
    );
  }
}
