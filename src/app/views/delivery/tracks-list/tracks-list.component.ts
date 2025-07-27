import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { catchError, of, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-tracks-list',
  templateUrl: './tracks-list.component.html',
  styleUrls: ['./tracks-list.component.scss'],
})
export class TracksListComponent implements OnInit {
  private subscription = new Subscription();

  columnsArray: columnHeaders[] = [
    {
      name: 'م',
    },
    {
      name: 'اسم خط السير',
    },
    {
      name: 'تاريخ الانشاء',
    },
    {
      name: 'عدد العملاء',
    },
    {
      name: 'عدد الدورات',
    },
    {
      name: 'وقت خروج الدورة',
    },
    {
      name: 'وقت تسجيل الاذن',
    },
    {
      name: 'مندوب خط السير',
    },
    {
      name: 'سائق خط السير',
    },
    {
      name: 'ساعات التوصيل',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'أمر',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'serial',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'pharmacies_count',
      type: 'normal',
    },
    {
      name: 'shifts_name',
      type: 'multiple_values_array',
    },
    {
      name: 'shifts_start_at',
      type: 'multiple_values_array',
    },
    {
      name: 'order_from_to',
      type: 'multiple_values_array',
    },
    {
      name: 'deliveryName',
      type: 'normal',
    },
    {
      name: 'driverName',
      type: 'normal',
    },
    {
      name: 'delivering_time',
      type: 'multiple_values_array',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'edit',
      type: 'edit_track',
    },
  ];
  data: any = [];
  page: number = 1;
  additional_data: any = {};
  rows!: number;
  total!: number;
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpService,
    private generalService: GeneralService
  ) {}
  ngOnInit() {
    this.subscription.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param, true).pipe(
              catchError((error) => {
                return of({ data: [] });
              })
            );
          })
        )
        .subscribe({
          next: (res) => {
            this.total = res.meta.total;
            this.rows = res.meta.per_page;
            this.additional_data = res.additional_data;
            this.data = res.data;
            this.data = res.data.map((data: any, index: number) => {
              data['deliveryName'] = data['delivery'][0]?.name;
              data['driverName'] = data['delivery'][1]?.name;
              data['serial'] = index + 1 + (this.page - 1) * 10;
              return data;
            });
            console.log(this.page);
          },
        })
    );
  }

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    // if (paginated) {
    getUrl = 'tracks';
    // } else {
    //   getUrl = 'tracks/all';
    // }

    return this.http.getReq(getUrl, { params: x });
  }
  changepage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams });
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};

    if (this.page) {
      queryParams['page'] = this.page;
    }

    return queryParams;
  }
  editButton(data: any) {
    console.log(data);
    this.router.navigate(['delivery/edit-track/' + data.id]);
  }
}
