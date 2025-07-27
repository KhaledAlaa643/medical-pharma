import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LooseObject } from '@models/LooseObject.js';
import { complain } from '@models/complain';
import { HttpService } from '@services/http.service';
import { Subscription, switchMap } from 'rxjs';

import * as moment from 'moment';
import 'moment/locale/ar';
import { ColumnValue, columnHeaders } from '@models/tableData';

@Component({
  selector: 'app-all-complains',
  templateUrl: './all-complains.component.html',
  styleUrls: ['./all-complains.component.scss'],
})
export class AllComplainsComponent implements OnInit {
  private subs = new Subscription();
  allComplaintsArray: any[] = [];
  per_page = 0;
  total_rec = 0;
  complainType: string = '';
  page = 1;
  unsolvedComplaintsRows: any;

  columnsArray: columnHeaders[] = [];
  columnsName: ColumnValue[] = [];

  constructor(
    private http: HttpService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    moment.locale('ar');
    this.router.navigate([], {
      queryParams: { page: 1, pagination_number: 10 },
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit() {
    if (this.router.url.includes('log')) {
      this.complainType = 'log';
      this.columnsArray = [
        {
          name: ' مسلسل',
        },
        {
          name: ' كود العميل ',
        },
        {
          name: 'اسم العميل	',
        },
        {
          name: 'القسم',
        },
        {
          name: 'اسم كاتب الشكوي	',
        },
        {
          name: 'محتوي الشكوي ',
        },
        {
          name: ' الموظف المشكو في حقه ',
        },
        {
          name: ' تاريخ ووقت التسجيل  ',
        },
        {
          name: 'وقت انتظار الشكوي',
        },
      ];
      this.columnsName = [
        {
          name: 'number',
          type: 'normal',
        },
        {
          name: 'code',
          type: 'normal',
        },
        {
          name: 'client_name',
          type: 'normal',
        },
        {
          name: 'department',
          type: 'normal',
        },
        {
          name: 'created_by',
          type: 'normal',
        },
        {
          name: 'content',
          type: 'viewComplain',
        },
        {
          name: 'created_for',
          type: 'normal',
        },
        {
          name: 'created_at',
          type: 'normal',
        },
        {
          name: 'waiting_time',
          type: 'timeFormat',
        },
      ];
    } else {
      this.complainType = 'previous';
      this.columnsArray = [
        {
          name: ' مسلسل',
        },
        {
          name: ' كود العميل ',
        },
        {
          name: 'اسم العميل	',
        },
        {
          name: 'اسم كاتب الشكوي	',
        },
        {
          name: 'القسم',
        },
        {
          name: 'محتوي الشكوي ',
        },
        {
          name: 'تم الحل بواسطة',
        },
        {
          name: ' تاريخ ووقت التسجيل  ',
        },
        {
          name: 'وقت حل الشكوى	',
        },
      ];
      this.columnsName = [
        {
          name: 'number',
          type: 'normal',
        },
        {
          name: 'code',
          type: 'normal',
        },
        {
          name: 'client_name',
          type: 'normal',
        },
        {
          name: 'created_by',
          type: 'normal',
        },
        {
          name: 'department',
          type: 'normal',
        },
        {
          name: 'content',
          type: 'viewComplain',
        },
        {
          name: 'solved_by',
          type: 'normal',
        },
        {
          name: 'created_at',
          type: 'normal',
        },
        {
          name: 'solved_at',
          type: 'timeFormat',
        },
      ];
    }
    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param);
          })
        )
        .subscribe({
          next: (res) => {
            this.allComplaintsArray = [];
            res.data.forEach((complain: any) => {
              this.allComplaintsArray.push({
                number: complain.id,
                id: complain.id,
                code: complain.client.code,
                client_name: complain.client.name,
                created_by: complain?.created_by?.name,
                department: complain?.department?.name,
                solved_by: complain?.solver?.name,
                created_for: complain?.user?.name,
                created_at: complain?.created_at,
                solved_at: complain?.solved_duration,
                waiting_time: complain?.minutes_waited,
              });
            });
            if (res.meta.total) {
              this.total_rec = res.meta.total;
              this.per_page = res.meta.per_page;
            } else {
              this.total_rec = 1;
              this.per_page = 1;
            }
          },
        })
    );
  }

  viewComplainContent(complain_id: any) {
    if (this.router.url.includes('log')) {
      this.router.navigate([
        `/complains/complain-details/unsolved/+${complain_id}`,
      ]);
    } else {
      this.router.navigate([
        `/complains/complain-details/solved/+${complain_id}`,
      ]);
    }
  }

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    x['sort_by'] = 'created_at';
    x['direction'] = 'DESC';
    let getUrl = '';
    if (this.complainType == 'log') {
      getUrl = 'settings/complains/unsolved-complains';
    } else {
      getUrl = 'settings/complains/solved-complains';
    }
    return this.http.getReq(getUrl, { params: x });
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.router.navigate([], {
      queryParams: { page: this.page },
      queryParamsHandling: 'merge',
    });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
