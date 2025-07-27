import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { client } from '@models/client';
import { permissions } from '@models/permissions.js';
import { listings } from '@modules/create-client-list/create-client-list.component.js';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, switchMap } from 'rxjs';
@Component({
  selector: 'app-Sales-man-clients',
  templateUrl: './Sales-man-clients.component.html',
  styleUrls: ['./Sales-man-clients.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class SalesManClientsComponent implements OnInit {
  activeButton!: number;
  lists: listings[] = [];
  totalItems!: number;
  rows!: number;
  currentPageIndex: number = 0;
  listsNum!: number;
  private sub = new Subscription();
  canDelete: boolean = true;
  permissions: string[] = [];

  constructor(
    private http: HttpService,
    private router: Router,
    private toster: ToastrService,
    private activatedRoute: ActivatedRoute,
    private auth: AuthService
  ) {
    this.router.navigate([], {
      queryParams: { page: 1, pagination_number: 10 },
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit() {
    this.permissions = this.auth.getUserPermissions();
    this.sub.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param);
          })
        )
        .subscribe({
          next: (res) => {
            this.lists = res.data;
            this.listsNum = res?.meta?.total;
            this.rows = res.meta?.per_page;
          },
        })
    );
  }

  changeTab(btnNum: number) {
    this.activeButton = btnNum;
  }

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    x['sort_by'] = 'created_at';
    x['direction'] = 'DESC';
    let getUrl = 'listings';
    return this.http.getReq(getUrl, { params: x });
  }

  changePage(event: any) {
    this.sub.add(this.http.getReq('listings').subscribe({}));
    this.currentPageIndex = event.page + 1;
    this.lists = [];
    this.router.navigate([], {
      queryParams: { page: this.currentPageIndex },
      queryParamsHandling: 'merge',
    });
  }

  @ViewChild('deleteOpen') deleteOpen!: ElementRef<HTMLElement>;
  deleteId?: number | null;
  openDeleteModal(list_id: number) {
    this.deleteId = list_id;
    let el: HTMLElement = this.deleteOpen.nativeElement;
    el.click();
  }

  deleteList() {
    if (!this.canDelete) {
      return;
    }

    this.canDelete = false;
    setTimeout(() => (this.canDelete = true), 3000);
    let params = {
      listing_id: this.deleteId,
    };

    let message = '';
    this.sub.add(
      this.http.deleteReq('listings/delete', { params: params }).subscribe({
        next: (res) => {
          message = res.message;
        },
        complete: () => {
          const index = this.lists.findIndex(
            (c: any) => c.id === this.deleteId
          );
          if (index > -1) {
            this.lists.splice(index, 1);
            this.toster.info(message);
            this.listsNum = this.lists.length;
          }
          this.deleteId = null;
        },
      })
    );
  }
}
