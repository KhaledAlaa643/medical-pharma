import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { HttpService } from '@services/http.service';
import { Subscription, catchError, of, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { NotesModalComponent } from '@modules/notes-modal/notes-modal.component';
import { receiversAuditorStoreKeepers } from '@models/receivers-auditor-store-keepers';
import { manufacturers } from '@models/manufacturers';
import { products } from '@models/products.js';
import { prohibitedBatchData } from '@models/prohibited-batch-data';
import { GeneralService } from '@services/general.service';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-prohibited-expirations',
  templateUrl: './prohibited-expirations.component.html',
  styleUrls: ['./prohibited-expirations.component.scss'],
})
export class ProhibitedExpirationsComponent implements OnInit {
  private subs = new Subscription();
  total!: number;
  rows!: number;
  page: number = 1;
  prohibitedBatchFilter!: FormGroup;
  AddprohibitedBatch!: FormGroup;
  prohibitedBatchData: prohibitedBatchData[] = [];
  receiversAuditorStoreKeepers: receiversAuditorStoreKeepers[] = [];
  product: products[] = [];
  Manufacturers: manufacturers[] = [];
  notesData: string = '';
  columnsArray: columnHeaders[] = [
    { name: 'الصنف' },
    { name: 'التاريخ والتشغيلة  المحظورة' },
    { name: 'تصنيع شركة' },
    { name: ' الكاتب ' },
    { name: '   تاريخ   التسجيل ' },
    { name: 'رقم   المنشور  ' },
    { name: 'سبب المنشور ' },
  ];
  columnsName: ColumnValue[] = [
    { name: 'product_name', type: 'normal' },
    { name: 'exp', type: 'normal' },
    { name: 'manufacturer_name', type: 'normal' },
    { name: 'receiving_reviewer', type: 'normal' },
    { name: 'created_at', type: 'normal' },
    { name: 'post_number', type: 'normal' },
    { name: 'post_reason', type: 'showdatanotes' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private generalService: GeneralService
  ) {}

  getProductData() {
    this.subs.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.product = res.data;
        },
      })
    );
  }
  getReceiversAuditorStoreKeepers() {
    this.subs.add(
      this.generalService.getReceiversAuditorStoreKeepers().subscribe({
        next: (res) => {
          this.receiversAuditorStoreKeepers = res.data;
        },
      })
    );
  }
  getManufacturers() {
    this.subs.add(
      this.generalService.getDropdownData(['static_manufacturers']).subscribe({
        next: (res) => {
          this.Manufacturers = res.data.static_manufacturers;
        },
      })
    );
  }

  ngOnInit(): void {
    this.getProductData();
    this.getReceiversAuditorStoreKeepers();
    this.getManufacturers();

    this.prohibitedBatchFilter = this.fb.group({
      product_id: [''],
      expiry_date: [''],
      operating_number: [''],
      post_number: [''],
      post_reason: [''],
    });

    this.AddprohibitedBatch = this.fb.group({
      product_name: [''],
      manufactured_by: [''],
      expiry_date: [''],
      operating_number: [''],
      created_at: [''],
      post_reason: [''],
      created_by: [''],
      post_number: [''],
    });

    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getProhibitedBatchFilter(param).pipe(
              catchError((error) => {
                console.error('Error in API call:', error);
                return of({ data: [] });
              })
            );
          })
        )
        .subscribe({
          next: (res) => {
            this.prohibitedBatchData = [];
            res.data.forEach((element: any, index: number) => {
              this.prohibitedBatchData.push({
                id: element.id,
                product_name: element.product.name,
                exp: element?.expiry_date + ' ' + element?.operating_number,
                manufacturer_name: element?.product?.manufacture_company?.name,
                receiving_reviewer: element?.created_by?.name,
                created_at: element?.created_at.split(' ')[0],
                post_number: element?.post_number,
                post_reason: element?.post_reason,
                total: res.meta.total,
              });
            });
            this.total = res?.meta.total;
            this.rows = res.meta?.per_page;
          },
        })
    );
  }

  addProhibitedBatch() {
    let expiry_date = this.prohibitedBatchFilter.controls['expiry_date'].value;
    this.prohibitedBatchFilter.controls['expiry_date'].setValue(
      datePipe.transform(expiry_date, 'yyyy-MM')
    );

    this.subs.add(
      this.http
        .postReq(
          'products/batches/prohibited/store',
          this.prohibitedBatchFilter.value
        )
        .subscribe({
          next: (res) => {
            this.toastr.success(res.message);
          },
          complete: () => {
            window.location.reload();
          },
        })
    );
  }

  getProhibitedBatchFilter(filter: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filter)) {
      if (value) {
        x[key] = value;
      }
    }
    return this.http.getReq('products/batches/prohibited', { params: x });
  }
  filter() {
    const queryParamsObject = this.getUpdatedQueryParams();

    for (const [key, value] of Object.entries(queryParamsObject)) {
      if (value === '' || value === null || value === undefined) {
        queryParamsObject[key] = null;
      } else {
        queryParamsObject[key] = value;
      }
    }
    if (this.AddprohibitedBatch.controls['created_at'].value) {
      queryParamsObject['created_at'] = datePipe.transform(
        new Date(this.AddprohibitedBatch.controls['created_at'].value),
        'yyyy-MM-dd'
      );
    }
    if (this.AddprohibitedBatch.controls['expiry_date'].value) {
      queryParamsObject['expiry_date'] = datePipe.transform(
        new Date(this.AddprohibitedBatch.controls['expiry_date'].value),
        'yyyy-MM-dd'
      );
    }
    this.router.navigate([], {
      queryParams: queryParamsObject,
      queryParamsHandling: 'merge',
    });
  }

  getUpdatedQueryParams(sorting_data?: any) {
    let queryParams: any = {};

    for (const key in this.AddprohibitedBatch.value) {
      let value = this.AddprohibitedBatch.value[key];
      if (value === '' || value === null || value === undefined) {
        queryParams[key] = null;
      } else {
        queryParams[key] = value;
      }
    }

    if (this.page) {
      queryParams['page'] = this.page;
    }
    if (sorting_data) {
      queryParams['sort_by'] = sorting_data.name;
      queryParams['direction'] = sorting_data.direction;
    }

    return queryParams;
  }

  sorting(sortingData: any) {
    let queryParams = this.getUpdatedQueryParams(sortingData);
    this.router.navigate([], {
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });
  }
  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  @ViewChild(NotesModalComponent)
  private notesModalComponent!: NotesModalComponent;
  showNotesModalWithData(id: any): void {
    const foundItem = this.prohibitedBatchData.find((item) => item.id === id);
    const noteData = foundItem ? foundItem.post_reason : null;
    this.notesModalComponent.notesModalData = noteData;
    this.notesModalComponent.openModal();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
