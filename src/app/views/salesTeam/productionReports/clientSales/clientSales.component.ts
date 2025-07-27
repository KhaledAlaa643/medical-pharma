import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { client } from '@models/client';
// import { clientSales, clientSalesTotal } from '@models/client-sales';
import { pharmacie } from '@models/pharmacie';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { DatesService } from '@services/dates.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface agentProduction {
  dateAndItem?: string;
  recieptNumber?: number;
  sales?: number;
  returns?: number;
  netSales?: number;
}

@Component({
  selector: 'app-clientSales',
  templateUrl: './clientSales.component.html',
  styleUrls: ['./clientSales.component.scss'],
})
export class ClientSalesComponent implements OnInit {
  @ViewChild('calendarTo') calendarTo!: Calendar;
  @ViewChild('calendarFrom') calendarFrom!: Calendar;

  dateTo?: Date;
  dateFrom?: Date;

  tableData: agentProduction[] = [];
  filterForm!: FormGroup;
  IsDataAvailable: boolean = false;
  clientSalesData: any[] = [];
  clientData: client[] = [];
  selectedClientId?: number;
  clientID: any;
  pharmacies: pharmacie[] = [];
  updatedPharmacyNames: any = [];
  pharmaciesData: any = [];
  selectedPharmacyID: any;
  clientSalesFooter: any[] = [];

  private subs = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'التاريخ والوقت  ',
    },
    {
      name: 'رقم الفاتورة   ',
    },
    {
      name: 'المبيعات ',
    },
    {
      name: 'المرتجعات',
    },
    {
      name: ' صافي  المبيعات  ',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'order_number',
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
  ];
  columnsFooters: ColumnValue[] = [
    {
      name: 'created_at',
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
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private generalService: GeneralService,
    private auth: AuthService,
    private datesService: DatesService
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

  getClientID(event: any) {
    this.selectedClientId = event.value;
    this.filterForm.controls['client_id'].setValue(this.selectedClientId);
  }
  getPharmacyId(event: any) {
    this.selectedPharmacyID = event.value;
    this.filterForm.controls['pharmacy_id'].setValue(this.selectedPharmacyID);
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
        .getReq('orders/reports/client-sales', { params: queryParams })
        .subscribe({
          next: (res) => {
            this.IsDataAvailable = true;

            this.clientSalesData = [];
            this.clientSalesFooter = [];
            res.data.forEach((element: any) => {
              this.clientSalesData.push({
                created_at: element.created_at,
                order_number: element.order_number,
                total: element.total,
                returns: element.returns,
                net_sales: element.net_sales,
              });
            });

            this.clientSalesFooter.push({
              created_at: 'إجمالي',
              orders_count_sum: res.additional_data.orders_count_sum,
              sales_sum: res.additional_data.sales_sum,
              returns_sum: res.additional_data.returns_sum,
              net_sales_sum: res.additional_data.net_sales_sum,
            });
          },
        })
    );
  }

  getPharmacyData(id?: any) {
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          this.pharmacies = res.data;
        },
        complete: () => {
          this.pharmacies.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.updatedPharmacyNames.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
              });
            });
          });
        },
      })
    );
    // this.subs.add(this.generalService.getPharmacies().subscribe({
    //   next: (res) => {
    //     this.pharmaciesData = res.data

    //     this.updatedPharmacyNames = this.pharmaciesData.map((pharmacy: pharmacie) => {
    //       const clientName = pharmacy.clients[ 0 ]?.name;
    //       return {
    //         name: `${clientName} - ${pharmacy.name}`,
    //         id: pharmacy.id
    //       }

    //     });
    //   }
    // }))
  }
  onPharmacySelect(event: any): void {
    const chosenPharmacyId = event.value;
  }

  getPharmacyID(event: any) {
    this.selectedPharmacyID = event.value;
    this.filterForm.controls['pharmacy_id'].setValue(this.selectedPharmacyID);
  }

  ngOnInit() {
    this.filterForm = this.fb.group({
      client_id: [''],
      pharmacy_id: [''],
      from: [],
      to: [],
    });
    this.getDate();
    this.getPharmacyData();
  }
}
