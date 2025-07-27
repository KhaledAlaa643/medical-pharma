import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { groupedPharmacy, pharmacie } from '@models/pharmacie.js';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToggleModal } from '@services/toggleModal.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

interface toReviewOrders {
  invoice_id: number;
  serial: number;
  created_at: string;
  client_name: string;
  reviewer_name: string;
  order_number: number;
  items_count: string;
  notPrepared: boolean;
}

@Component({
  selector: 'app-preparing-list',
  templateUrl: './preparing-list.component.html',
  styleUrls: ['./preparing-list.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class PreparingListComponent implements OnInit, OnDestroy {
  preparingListFilter!: FormGroup;
  private subs = new Subscription();
  preparingListData: toReviewOrders[] = [];
  toReviewOrders: toReviewOrders[] = [];
  listNumber!: number;
  selectedStorageId: number | null = null;
  showNotPrepared: boolean = false;

  columnsArray: columnHeaders[] = [
    {
      name: 'مسلسل ',
    },
    {
      name: 'التاريخ والوقت',
    },
    {
      name: ' اسم العميل',
    },

    {
      name: ' رقم الأذن',
    },
    {
      name: ' عدد الأصناف',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'serial',
      type: 'normal',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'client_name',
      type: 'normal',
    },

    {
      name: 'order_number',
      type: 'normal',
    },
    {
      name: 'items_count',
      type: 'normal',
    },
  ];
  containsBulk!: boolean;
  page: number = 1;
  rows!: number;
  total!: number;
  permission: string[] = [];
  pharmacies: pharmacie[] = [];
  groupPharmacied: groupedPharmacy[] = [];
  formattedDate!: string | null;

  constructor(
    private http: HttpService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService,
    public toggleModal: ToggleModal,
    private generalService: GeneralService
  ) {
    this.permission = this.auth.getUserPermissions();
  }

  currentPageNumber: number = 1;

  ngOnInit(): void {
    this.containsBulk = this.route.snapshot.url.join('/').includes('bulk');

    this.preparingListFilter = this.fb.group({
      storage_id: [''],
      from: [''],
      invoice_number: [''],
      client_id: [''],
    });

    let clients: any = [];
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          clients = res.data;
          clients.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.groupPharmacied.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
              });
            });
          });
        },
      })
    );

    this.preparingListFilter.controls['storage_id'].setValue(1);
    this.getPreparingListData(
      this.preparingListFilter.controls['storage_id'].value
    );
  }
  dropdownOptions = [
    { name: 'تم التحضير ', id: 1 },
    { name: ' لم يتم التحضير ', id: 0 },
  ];

  onSearchButtonClick() {
    if (this.preparingListFilter.controls['storage_id'].value !== null) {
      if (this.preparingListFilter.controls['storage_id'].value == 0) {
        this.showNotPrepared = true;
        this.columnsArray.pop();
        this.columnsName.pop();
      } else {
        this.showNotPrepared = false;
        const columnArrayIndex = this.columnsArray.findIndex(
          (item) => item.name === ' عرض محتويات الطلب'
        );
        if (columnArrayIndex == -1) {
          this.columnsArray.push({
            name: ' عرض محتويات الطلب',
            canHide: this.showNotPrepared,
          });
          this.columnsName.push({
            name: 'eyeIcon',
            type: 'ViewPreparedOrders',
          });
        }
      }
    } else {
      this.toastr.error('Please select filter first');
    }
  }

  getPreparingListData(order_type?: number) {
    this.onSearchButtonClick();
    this.formattedDate = '';
    if (this.preparingListFilter.controls['from'].value) {
      this.formattedDate = datePipe.transform(
        new Date(this.preparingListFilter.controls['from'].value),
        'yyyy-MM-dd'
      );
    }

    this.listNumber = 1;
    let endpoint = '';
    if (order_type === 1) {
      endpoint = 'warehouses/orders/retail/listing-reviewing';
      if (this.containsBulk) {
        endpoint = 'warehouses/orders/bulk/listing-reviewing';
      }
    }

    let param: any = {};
    let final_params: any = {};

    if (order_type === 0) {
      endpoint = 'warehouses/orders/unprepared';
      final_params['warehouse_type'] = this.containsBulk ? 'bulk' : 'retail';
    }
    if (
      this.containsBulk &&
      this.route.snapshot.url.join('/').includes('bulk')
    ) {
      param = {
        invoice_number:
          this.preparingListFilter.controls['invoice_number'].value,
        created_at: this.formattedDate,
        pharmacy_id: this.preparingListFilter.controls['client_id'].value,
      };
    }

    Object.keys(param).forEach((key) => {
      if (
        param[key] != null &&
        param[key] != undefined &&
        (param[key] === 0 || param[key] !== '')
      ) {
        final_params[key] = param[key];
      }
    });

    this.subs.add(
      this.http.getReq(endpoint, { params: final_params }).subscribe({
        next: (res) => {
          this.toReviewOrders = [];
          this.preparingListData = [];
          const itemsPerPage = res.meta?.per_page;
          res.data.forEach((element: any, index: number) => {
            this.toReviewOrders.push({
              invoice_id: element.id,
              serial: index + 1,
              created_at: element.created_at,
              client_name: element.pharmacy.name,
              reviewer_name: element.batch,
              order_number: element.order_number,
              items_count: element.total_quantity,
              notPrepared: this.showNotPrepared,
            });
          });
          this.total = this.toReviewOrders.length;
          this.rows = res.meta?.per_page;
        },
      })
    );
  }

  ViewOrderDetails(id: number) {
    if (!this.containsBulk) {
      this.router.navigate([
        `/warehouse/products-sales-reviewer/single-products-reviewer/${id}`,
      ]);
    } else {
      this.router.navigate([
        `/warehouse/products-sales-reviewer/bulk-products-reviewer/${id}`,
      ]);
    }
  }

  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  filterPharmacies() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.preparingListFilter.value) {
      let value = this.preparingListFilter.value[key];
      if (value != null && value != undefined && value != '') {
        queryParams[key] = value;
      }
    }
    if (this.page) {
      queryParams['page'] = this.page;
    }
    return queryParams;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
