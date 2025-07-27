import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { client } from '@models/client';
import { sales } from '@models/sales';
import { SellerSales } from '@models/sellerSaleReport';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { DatesService } from '@services/dates.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';

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
  selector: 'app-clientAgentSales',
  templateUrl: './clientAgentSales.component.html',
  styleUrls: ['./clientAgentSales.component.scss'],
})
export class ClientAgentSalesComponent implements OnInit {
  @ViewChild('calendarTo') calendarTo!: Calendar;
  @ViewChild('calendarFrom') calendarFrom!: Calendar;

  dateTo?: Date;
  dateFrom?: Date;

  private subs = new Subscription();
  tableData: agentProduction[] = [];
  filterForm!: FormGroup;
  sellers: sales[] = [];
  SellerSalesWithHisClients: any[] = [];
  SellerSalesWithoutHisClients: any[] = [];
  IsDataAvailable: boolean = false;
  SellerSalesWithHisClientsFooter: any[] = [];
  SellerSalesWithoutHisClientsFooter: any = [];

  columnsArray: columnHeaders[] = [
    {
      name: ' كود العميل ',
    },
    {
      name: ' اسم العميل ',
    },
    {
      name: 'عدد المبيعات ',
    },
    {
      name: 'المبيعات',
    },
    {
      name: 'المرتجع ',
    },
    {
      name: ' الصافي  ',
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
      type: 'normal',
    },
  ];
  columnsFooters: ColumnValue[] = [
    {
      name: 'code',
      type: 'empty',
    },
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
  ];
  constructor(
    private _FormBuilder: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private auth: AuthService,
    private datesService: DatesService
  ) {}

  ngOnInit() {
    this.filterForm = this._FormBuilder.group({
      sales_id: [''],
      from: [],
      to: [],
    });

    this.getDate();
    this.getSales();
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

  getSales() {
    this.subs.add(
      this.generalService.getUsers().subscribe({
        next: (res) => {
          this.sellers = res.data;
        },
      })
    );
  }
  getSellerSalesWithHisClients() {
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
        .getReq('orders/reports/seller-sales-with-his-clients', {
          params: queryParams,
        })
        .subscribe({
          next: (res) => {
            this.IsDataAvailable = true;
            this.SellerSalesWithHisClients = [];
            this.SellerSalesWithHisClientsFooter = [];

            res.data.forEach((element: any) => {
              this.SellerSalesWithHisClients.push({
                code: element.pharmacy?.code,
                name: element.pharmacy?.name,
                orders_count: element.orders_count,
                total: element.total,
                returns: element.returns,
                net_sales: element.net_sales,
              });
            });

            this.SellerSalesWithHisClientsFooter.push({
              code: '',
              salesmen_count: res.additional_data.salesmen_count,
              orders_count_sum: res.additional_data.orders_count_sum,
              sales_sum: res.additional_data.sales_sum,
              returns_sum: res.additional_data.returns_sum,
              net_sales_sum: res.additional_data.net_sales_sum,
            });
          },
        })
    );
  }
  getSellerSalesWithoutHisClients() {
    let allParams: any = {};
    for (const key in this.filterForm.value) {
      let value = this.filterForm.controls[key].value;
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'from' || key == 'to') {
          allParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          allParams[key] = value;
        }
      }
    }

    this.subs.add(
      this.http
        .getReq('orders/reports/seller-sales-with-non-his-clients', {
          params: allParams,
        })
        .subscribe({
          next: (res) => {
            this.IsDataAvailable = true;
            this.SellerSalesWithoutHisClients = [];
            this.SellerSalesWithoutHisClientsFooter = [];
            res.data.forEach((element: any) => {
              this.SellerSalesWithoutHisClients.push({
                code: element.pharmacy?.code,
                name: element.pharmacy?.name,
                orders_count: element.orders_count,
                total: element.total,
                returns: element.returns,
                net_sales: element.net_sales,
              });
            });

            this.SellerSalesWithoutHisClientsFooter.push({
              code: '',
              salesmen_count: res.additional_data.salesmen_count,
              orders_count_sum: res.additional_data.orders_count_sum,
              sales_sum: res.additional_data.sales_sum,
              returns_sum: res.additional_data.returns_sum,
              net_sales_sum: res.additional_data.net_sales_sum,
            });
          },
        })
    );
  }

  submit() {
    this.getSellerSalesWithHisClients();
    this.getSellerSalesWithoutHisClients();
  }
}
