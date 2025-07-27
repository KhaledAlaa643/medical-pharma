import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  allProductionReports,
  productionReports,
} from '@models/production-reports';
import { sales } from '@models/sales';
import { FiltersObject } from '@models/settign-enums';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
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
  target?: number;
  targetPercent?: number;
}

@Component({
  selector: 'app-agent-productivity',
  templateUrl: './agent-productivity.component.html',
  styleUrls: ['./agent-productivity.component.scss'],
})
export class AgentProductivityComponent implements OnInit {
  @ViewChild('calendarTo') calendarTo!: Calendar;
  @ViewChild('calendarFrom') calendarFrom!: Calendar;

  dateTo?: any;
  dateFrom?: any;
  private subs = new Subscription();
  tableData: agentProduction[] = [];
  filterForm!: FormGroup;
  isActiveTapArray: boolean[] = Array(7).fill(false);
  clientData: sales[] = [];
  IsDataAvailable: boolean = false;
  differentClientsCountMsg: string = '';
  targetValue?: number;
  totalPercentageTarget?: number;
  selectedClientId?: number;
  salesmanProductivity: productionReports[] = [];
  salesmanProductivityAll!: allProductionReports;
  areas: FiltersObject[] = [];
  columnsArray: columnHeaders[] = [
    {
      name: 'اسم المندوب',
    },
    {
      name: 'عدد المبيعات',
    },
    {
      name: 'المبيعات',
    },
    {
      name: 'المرتجعات',
    },
    {
      name: 'صافي المبيعات',
    },
    {
      name: 'النسبة من اجمالي المبيعات',
    },
    {
      name: 'عدد عملاء المندوب',
    },
    {
      name: 'عدد عملاء المبيعات',
    },
    {
      name: 'التارجت',
    },
    {
      name: 'تحقيق التارجت',
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
      type: 'normal',
    },
    {
      name: 'returns',
      type: 'normal',
    },
    {
      name: 'net_sales',
      type: 'green_text',
    },
    {
      name: 'percentage_sales',
      type: 'normal',
    },
    {
      name: 'related_clients_count',
      type: 'normal',
    },
    {
      name: 'non_related_clients_count',
      type: 'normal',
    },
    {
      name: 'target',
      type: 'normal',
    },
    {
      name: 'percentage_target',
      type: 'normal',
    },
  ];
  columnsFooters: ColumnValue[] = [
    {
      name: 'salesmen_count',
      type: 'normal',
    },
    {
      name: 'orders_count_sum',
      type: 'normal',
    },
    {
      name: 'sales_sum',
      type: 'normal',
    },
    {
      name: 'returns_sum',
      type: 'normal',
    },
    {
      name: 'net_sales_sum',
      type: 'green_text',
    },
    {
      name: 'percentage_sales_sum',
      type: 'normal',
    },
    {
      name: 'related_clients_count_sum',
      type: 'normal',
    },
    {
      name: 'non_related_clients_count_sum',
      type: 'hovered_title',
    },
    {
      name: 'target_sum',
      type: 'normal',
    },
    {
      name: 'target_percentage_sum',
      type: 'normal',
    },
  ];
  salesmanProductivityData: any[] = [];
  salesmanProductivityFooter: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private auth: AuthService,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    this.filterForm = this.fb.group({
      user_id: [''],
      area_id: [''],
      from: [],
      to: [],
    });
    this.getDate();
    this.getSalesMen();
    this.submitFilterForm();
    this.getArea();
  }

  getDate() {
    this.dateFrom = this.auth.getEnums().sales_report.from;
    this.dateTo = this.auth.getEnums().sales_report.to;
    this.differentClientsCountMsg =
      this.auth.getEnums().different_clients_count_msg;
    this.filterForm.controls['from'].setValue(
      datePipe.transform(this.dateFrom, 'yyyy-MM-dd')
    );
    this.filterForm.controls['to'].setValue(
      datePipe.transform(this.dateTo, 'yyyy-MM-dd')
    );
  }

  getArea() {
    this.subs.add(
      this.generalService.getCity().subscribe({
        next: (res) => {
          this.areas = res.data;
        },
      })
    );
  }

  isMergedCell(rowIndex: number): boolean {
    return rowIndex % 2 === 0;
  }

  changeActiveTap(index: number) {
    if (index != 6) {
      this.isActiveTapArray.fill(false);
      this.isActiveTapArray[index] = true;
    } else {
      this.isActiveTapArray.fill(false);
    }
  }

  getSalesMen() {
    this.subs.add(
      this.generalService.getUsers().subscribe({
        next: (res) => {
          this.clientData = res.data;
          this.clientData.unshift({
            id: 'without-salesman',
            name: 'بدون مندوب',
          });
        },
      })
    );
  }
  getClientID(event: any) {
    this.selectedClientId = event.value;
    this.filterForm.controls['client_id'].setValue(this.selectedClientId);
  }

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
          .getReq('orders/reports/salesman-productivity', {
            params: queryParams,
          })
          .subscribe({
            next: (res) => {
              this.IsDataAvailable = true;
              this.salesmanProductivityData = [];
              this.salesmanProductivityFooter = [];
              this.salesmanProductivity = res.data;
              res.data.forEach((element: any) => {
                this.salesmanProductivityData.push({
                  name:
                    element.sales != null ? element.sales.name : 'بدون   مندوب',
                  orders_count: element.orders_count,
                  total: element.total,
                  returns: element.returns,
                  net_sales: element.net_sales,
                  percentage_sales: element.percentage_sales, //| number:'1.2-2' : ''
                  related_clients_count: element.related_clients_count,
                  non_related_clients_count: element.non_related_clients_count,
                  target: element?.target,
                  percentage_target: element.percentage_target,
                  // footer area
                });
              });

              this.salesmanProductivityFooter.push({
                salesmen_count: res.additional_data.rows_count,
                orders_count_sum: res.additional_data.orders_count_sum,
                sales_sum: res.additional_data.sales_sum,
                returns_sum: res.additional_data.returns_sum,
                net_sales_sum: res.additional_data.net_sales_sum,
                percentage_sales_sum: res.additional_data.percentage_sales_sum,
                related_clients_count_sum:
                  res.additional_data.related_clients_count_sum,
                non_related_clients_count_sum:
                  res.additional_data.non_related_clients_count_sum,
                target_sum: res.additional_data.target_sum,
                target_percentage_sum:
                  res.additional_data.target_percentage_sum,

                differentClientsCountMsg: this.differentClientsCountMsg,
              });
              console.log(this.differentClientsCountMsg);
            },
          })
      );
    } else {
      this.filterForm.markAllAsTouched();
    }
  }
}
