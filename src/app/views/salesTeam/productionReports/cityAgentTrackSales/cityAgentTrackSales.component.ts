import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService } from '@services/http.service';
import * as moment from 'moment';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import { GeneralService } from '@services/general.service';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { DatesService } from '@services/dates.service';
import { AuthService } from '@services/auth.service';
import { city, area } from '@models/pharmacie';
import { Router } from '@angular/router';
const datePipe = new DatePipe('en-EG');

interface agentProduction {
  agentCode?: number;
  agentName?: string;
  numberOfSales?: number;
  sales?: number;
  returns?: number;
  netSales?: number;
  totalSalesPercent?: number;
  agentClientAmount?: number;
  salesClientAmount?: number;
  target?: number;
  targetPercent?: number;
}

@Component({
  selector: 'app-cityAgentTrackSales',
  templateUrl: './cityAgentTrackSales.component.html',
  styleUrls: ['./cityAgentTrackSales.component.scss'],
})
export class CityAgentTrackSalesComponent implements OnInit {
  @ViewChild('calendarTo') calendarTo!: Calendar;
  @ViewChild('calendarFrom') calendarFrom!: Calendar;

  dateTo?: Date;
  dateFrom?: Date;

  tableData: agentProduction[] = [];
  filterForm!: FormGroup;
  private subs = new Subscription();
  trackData: any = [];
  governateData: any = [];

  IsDataAvailable: boolean = false;
  cityCustomerSales: any = [];
  additional_data: any = [];
  cityCustomerSalesNonDeal: any = [];

  columnsArrayTableTwo: columnHeaders[] = [
    {
      name: ' كود العميل    ',
    },
    {
      name: ' اسم العميل    ',
    },
    {
      name: 'المدينة   ',
    },
    {
      name: 'اخر فاتورة بيع   ',
    },
    {
      name: ' التاريخ  ',
    },
  ];
  columnsArray: columnHeaders[] = [
    {
      name: ' كود العميل    ',
    },
    {
      name: ' اسم العميل    ',
    },
    {
      name: 'المدينة   ',
    },
    {
      name: 'مندوب مبيعات   ',
    },
  ];
  columnsNameNon: ColumnValue[] = [
    {
      name: 'code',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'underlined_id_number',
    },
    {
      name: 'area',
      type: 'normal',
    },
    {
      name: 'user',
      type: 'normal',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'code',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'underlined_id_number',
    },
    {
      name: 'area',
      type: 'normal',
    },
    {
      name: 'last_invoice',
      type: 'normal',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
  ];

  cityCustomerSalesNonDealFooter: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private auth: AuthService,
    private router: Router
  ) {}

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

  getTrackData() {
    this.subs.add(
      this.generalService.getTracks().subscribe({
        next: (res) => {
          this.trackData = res.data;
        },
      })
    );
  }
  cities: city[] = [];
  areas: area[] = [];
  getCity() {
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.cities = res.data;
        },
      })
    );
  }

  getArea(dropdown: any) {
    if (!dropdown.overlayVisible) {
      let params = {
        city_id: this.filterForm.controls['city_id'].value,
      };
      this.subs.add(
        this.generalService.getCity(params).subscribe({
          next: (res) => {
            this.areas = res.data[0].areas;
          },
        })
      );
    }
  }
  fieldSelector(index: number, dropdown: any) {
    if (index == 3 && !dropdown.overlayVisible) {
      this.filterForm.controls['area_id'].setValue('');
      this.filterForm.controls['city_id'].setValue('');
    } else if (index == 2 && !dropdown.overlayVisible) {
      this.filterForm.controls['track_id'].setValue('');
      this.filterForm.controls['city_id'].setValue('');
    } else if (index == 1 && !dropdown.overlayVisible) {
      this.filterForm.controls['track_id'].setValue('');
      this.filterForm.controls['area_id'].setValue('');
    }
  }

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
        .getReq('orders/reports/city-customer-sales', { params: queryParams })
        .subscribe({
          next: (res) => {
            this.IsDataAvailable = true;
            this.cityCustomerSales = [];
            this.additional_data = res.additional_data;
            res.data.forEach((element: any) => {
              this.cityCustomerSales.push({
                id: element.pharmacy.id,
                code: element.pharmacy.code,
                name: element.pharmacy.name,
                area: element.pharmacy.area.name,
                last_invoice: element.pharmacy.last_invoice.price,
                created_at: element.pharmacy.last_invoice.created_at,
              });
            });
          },
        })
    );

    this.subs.add(
      this.http
        .getReq('orders/reports/city-customer-sales-non-deal', {
          params: queryParams,
        })
        .subscribe({
          next: (res) => {
            this.IsDataAvailable = true;
            this.cityCustomerSalesNonDeal = [];

            res.data.forEach((element: any) => {
              this.cityCustomerSalesNonDeal.push({
                id: element.id,
                code: element.code,
                name: element.name,
                area: element.area.name,
                user: element?.lists[0]?.users[0]?.name
                  ? element?.lists[0]?.users[0]?.name
                  : '' + ' ' + element?.lists[0]?.users[0]?.name
                  ? element?.lists[0]?.users[0]?.name
                  : '',
              });
            });
          },
        })
    );
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      city_id: [''],
      area_id: [''],
      from: [''],
      to: [''],
      track_id: [''],
    });
    this.getDate();

    this.getTrackData();
    this.getCity();
  }

  navigateToReports(id: number) {
    console.log(id);
    this.router.navigate(['sales-admin/clients/transaction-volume-cash', id]);
  }
}
