import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { manufacturers } from '@models/manufacturers';
import { batch, products } from '@models/products';
import { receiversAuditor } from '@models/receiver-auditors';
import { commonObject } from '@models/settign-enums';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Modal } from 'bootstrap';
import { Paginator } from 'primeng/paginator';
import { Subscription, catchError, of, switchMap } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-edit-date-operation',
  templateUrl: './edit-date-operation.component.html',
  styleUrls: ['./edit-date-operation.component.scss'],
})
export class EditDateOperationComponent implements OnInit, OnDestroy {
  private subs = new Subscription();
  columnsArray: columnHeaders[] = [
    {
      name: 'الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'التاريخ والتشغيلة القديم',
    },
    {
      name: 'التاريخ والتشغيلة الجديد',
    },
    {
      name: 'تصنيع شركة',
      sort: true,
      direction: null,
    },
    {
      name: ' اسم المورد	',
    },
    {
      name: ' تاريخ التوريد	',
    },
    {
      name: ' الكاتب	',
    },
    {
      name: ' الكمية	',
    },
    {
      name: ' أمر	',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'old_operation',
      type: 'normal',
    },
    {
      name: 'new_operation',
      type: 'green_text',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'supplied_by',
      type: 'normal',
    },
    {
      name: 'supplied_at',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'edit',
      type: 'editOperation',
    },
  ];
  allFixedData: any = [];
  batches: batch[] = [];
  page: number = 1;
  batchesFilter!: FormGroup;
  editOperation!: FormGroup;
  product_name: string = '';
  product_quantity: number = 0;
  product_total_quantity: number = 0;
  total!: number;
  rows!: number;
  Manufacturers: manufacturers[] = [];
  products: products[] = [];
  receiversAuditor!: receiversAuditor[];
  suppliers: commonObject[] = [];
  auditor: any = [];

  constructor(
    private fixedData: FixedDataService,
    private router: Router,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private generalService: GeneralService
  ) {}

  ngOnInit() {
    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
    this.subs.add(
      this.fixedData.getAllFixedData().subscribe({
        next: (res) => {
          this.allFixedData = res.data;
        },
      })
    );

    this.getDropdownDataFilter();
    this.batchesFilter = this.formBuilder.group({
      product_id: [''],
      old_expired_at: [''],
      old_operating_number: [''],
      manufacturer_id: [''],
      supplied_at: [''],
      supplier_id: [''],
      quantity_more_than_zero: [''],
      created_by_id: [''],
    });
    this.editOperation = this.formBuilder.group({
      quantity: ['', Validators.required],
      expired_at: ['', Validators.required],
      operating_number: ['', Validators.required],
      sub_batch_id: [''],
    });
    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            return this.getAllData(param).pipe(
              catchError((error) => {
                return of({ data: [] });
              })
            );
          })
        )
        .subscribe({
          next: (res) => {
            this.batches = [];
            res.data.forEach((batch: any) => {
              this.batches.push({
                product_name: batch?.product_name,
                old_operation:
                  batch?.old_expired_at && batch?.old_operating_number
                    ? batch?.old_expired_at + ' ' + batch?.old_operating_number
                    : ' ',
                new_operation:
                  batch?.expired_at + ' ' + batch?.operating_number,
                manufacturer_name: batch?.manufacturer_name,
                supplied_by:
                  batch?.supplier_name != null ? batch?.supplier_name : 'مرتجع',
                supplied_at:
                  batch?.supplier_name != null
                    ? batch?.supplied_at
                    : batch?.created_at,
                created_by: batch?.created_by_name,
                quantity: batch?.quantity,
                sub_batch_id: batch.id,
                total_quantity: batch?.product_quantity,
              });
            });
            this.total = res?.meta.total;
            this.rows = res.meta?.per_page;
          },
        })
    );
  }

  getAllData(filters: any) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = 'products/batches/paginate';

    return this.http.getReq(getUrl, { params: x });
  }

  getDropdownDataFilter() {
    //manufacturers
    this.subs.add(
      this.generalService.getManufacturers().subscribe({
        next: (res) => {
          this.Manufacturers = res.data;
        },
      })
    );
    //products
    this.subs.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );

    //supplier
    this.subs.add(
      this.generalService.getReceiverAuditor().subscribe({
        next: (res) => {
          this.receiversAuditor = res.data;
        },
      })
    );

    //created_by
    this.subs.add(
      this.generalService.getRetailSalesAuditor().subscribe({
        next: (res) => {
          this.auditor = res.data;
        },
      })
    );

    let params = ['manufacturers', 'receiving_reviewer', 'suppliers'];
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.Manufacturers = res.data.manufacturers;
          this.suppliers = res.data.suppliers;
          this.auditor = res.data.retail_sales_auditors;
        },
      })
    );
  }

  //pagination
  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  //open filter modal
  @ViewChild('OpenFilter') OpenFilter!: ElementRef<HTMLElement>;
  @ViewChild('openConfirmation1Model')
  openConfirmation1Model!: ElementRef<HTMLElement>;

  openFilterModel() {
    let confirmation1Model: HTMLElement =
      this.openConfirmation1Model.nativeElement;
    confirmation1Model.click();
  }
  batch_index!: number;
  uneditable_total_quantity: number = 0;
  uneditable_quantity: number = 0;
  @ViewChild('OpenEditOperation') OpenEditOperation!: ElementRef<HTMLElement>;
  openeditOperationModel(batch_id: any) {
    setTimeout(() => {
      let el: HTMLElement = this.OpenEditOperation.nativeElement;
      el.click();
    }, 100);
    this.batch_index = this.batches.findIndex(
      (c: any) => c.sub_batch_id == batch_id
    );
    if (this.batch_index > -1) {
      this.product_name = this.batches[this.batch_index].product_name;
      this.product_quantity = this.batches[this.batch_index].quantity;
      this.uneditable_quantity = this.batches[this.batch_index].quantity;
      this.uneditable_total_quantity =
        this.batches[this.batch_index].total_quantity;
      this.product_total_quantity =
        this.batches[this.batch_index].total_quantity;
      this.editOperation.controls['sub_batch_id'].setValue(batch_id);
    }
  }

  getUpdatedQueryParams(sortData?: any) {
    let queryParams: any = {};
    for (const key in this.batchesFilter.value) {
      let value = this.batchesFilter.value[key];
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'old_expired_at') {
          queryParams[key] = datePipe.transform(new Date(value), 'yyyy-MM');
        } else if (key == 'supplied_at') {
          queryParams[key] = datePipe.transform(new Date(value), 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    if (this.page) {
      queryParams['page'] = this.page;
    }
    if (sortData) {
      queryParams['sort_by'] = sortData.name;
      queryParams['direction'] = sortData.direction;
    }

    return queryParams;
  }

  sorting(sortData?: any) {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams(sortData);
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
  @ViewChild('paginator') paginator!: Paginator;
  updateCurrentPage(currentPage: number): void {
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }
  filter() {
    this.page = 1;
    this.updateCurrentPage(this.page - 1);
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
    this.openFilterModel();
  }
  updateQuantity() {
    this.product_quantity = Number(this.uneditable_quantity);
    this.product_total_quantity = Number(this.uneditable_total_quantity);
    if (this.editOperation.controls['quantity'].value) {
      this.product_quantity -= Number(
        this.editOperation.controls['quantity'].value
      );
      this.product_total_quantity -= Number(
        this.editOperation.controls['quantity'].value
      );
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  editoperation() {
    let new_batch: any;
    let queryParams: any = {};
    for (const key in this.editOperation.value) {
      let value = this.editOperation.value[key];
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'expired_at') {
          queryParams[key] = datePipe.transform(new Date(value), 'yyyy-MM');
        } else {
          queryParams[key] = value;
        }
      }
    }
    this.subs.add(
      this.http.postReq('products/batches/update', queryParams).subscribe({
        next: (res) => {
          new_batch = res.data;
        },
        complete: () => {
          let newBatch: any = {
            product_name: new_batch?.product_name,
            old_operation:
              new_batch?.old_expired_at && new_batch?.old_operating_number
                ? new_batch?.old_expired_at +
                  ' ' +
                  new_batch?.old_operating_number
                : ' ',
            new_operation:
              new_batch?.expired_at + ' ' + new_batch?.operating_number,
            manufacturer_name: new_batch?.manufacturer_name,
            supplied_by:
              new_batch?.supplier_name != null
                ? new_batch?.supplier_name
                : 'مرتجع',
            supplied_at:
              new_batch?.supplier_name != null
                ? new_batch?.supplied_at
                : new_batch?.created_at,
            created_by: new_batch?.created_by_name,
            quantity: new_batch?.quantity,
            sub_batch_id: new_batch.id,
            total_quantity: new_batch?.product_quantity,
          };
          this.batches.splice(this.batch_index + 1, 0, newBatch);
          this.batches[this.batch_index].quantity =
            this.batches[this.batch_index].quantity -
            this.editOperation.controls['quantity'].value;

          let el: HTMLElement = this.OpenEditOperation.nativeElement;
          el.click();
          this.editOperation.reset();
          this.product_name = '';
          this.product_quantity = 0;
          this.product_total_quantity = 0;
          this.uneditable_quantity = 0;
          this.uneditable_total_quantity = 0;
        },
      })
    );
  }
}
