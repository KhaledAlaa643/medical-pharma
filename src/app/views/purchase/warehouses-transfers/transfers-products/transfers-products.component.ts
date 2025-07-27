import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { corridors } from '@models/corridors';
import { manufacturers } from '@models/manufacturers';
import { products, warehouses } from '@models/products';
import { commonObject } from '@models/settign-enums';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Subscription, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';

const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-transfers-products',
  templateUrl: './transfers-products.component.html',
  styleUrls: ['./transfers-products.component.scss'],
})
export class TransfersProductsComponent implements OnInit {
  private subs = new Subscription();
  transferBetweenWarehouses!: FormGroup;
  total: number = 0;
  rows!: number;
  page!: number;
  columnsArray: columnHeaders[] = [
    {
      name: 'رقم أمر التحويل',
    },
    {
      name: 'الموقع ',
    },
    {
      name: 'اسم الصنف',
    },
    {
      name: 'التاريخ   والتشغيلة',
    },
    {
      name: 'الكمية',
    },
    {
      name: 'المخزن   المحول   منه ',
    },
    {
      name: 'المخزن    المحول    اليه',
    },
    {
      name: 'تاريخ و وقت التنفيذ',
    },
    {
      name: 'الكاتب',
    },
    {
      name: 'سعر  الجمهور',
    },
    {
      name: 'تصنيع شركة',
    },
    {
      name: 'التصنيف',
    },
  ];

  columnsName: ColumnValue[] = [
    {
      name: 'transfer_id',
      type: 'normal',
    },
    {
      name: 'product_location',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'exp_operating',
      type: 'normal',
    },
    {
      name: 'transfer_quantity',
      type: 'normal',
    },
    {
      name: 'transfer_from_warehouse',
      type: 'normal',
    },
    {
      name: 'transfer_to_warehouse',
      type: 'normal',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'created_by',
      type: 'normal',
    },
    {
      name: 'public_price',
      type: 'normal',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'product_type',
      type: 'normal',
    },
  ];
  warehouses: warehouses[] = [];
  products: products[] = [];
  Manufacturers: manufacturers[] = [];
  corridors: corridors[] = [];
  transfer_id!: number;
  total_batches: number = 0;
  created_by: commonObject[] = [];
  products_type: commonObject[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private fixedData: FixedDataService,
    private printService: PrintService,
    private generalService: GeneralService
  ) {}

  ngOnInit(): void {
    this.fixedData.getAllFixedData().subscribe({
      next: (res) => {
        this.created_by = res.data.transfer_by;
        this.products_type = res.data.product_manufacturing_types;
      },
    });
    this.getDropdownData();
    this.transfer_id = Number(
      this.activatedRoute.snapshot.paramMap.get('transfer_id')
    );
    this.transferBetweenWarehouses = this.fb.group({
      product_id: [''],
      transfer_from_warehouse_id: [''],
      transfer_to_warehouse_id: [''],
      from_date: [''],
      to_date: [''],
      created_by: [''],
      corridor_id: [''],
      manufactured_by: [''],
      transfer_id: [''],
      manufacturing_type: [''],
    });
    if (this.transfer_id) {
      this.transferBetweenWarehouses.controls['transfer_id'].setValue(
        this.transfer_id
      );
    }
    this.subs.add(
      this.activatedRoute.queryParams
        .pipe(
          switchMap((param: any) => {
            let quaryParams: any = {};
            quaryParams = this.getUpdatedQueryParams();
            return this.getAllData(quaryParams, true).pipe(
              catchError((error) => {
                return of({ data: [] });
              })
            );
          })
        )
        .subscribe({
          next: (res) => {
            this.trasnferredProductBasedBody = [];
            this.getData(res.data, true);
            this.total = res?.meta.total;
            this.rows = res.meta?.per_page;
            this.total_batches = res.meta.total_batches;
          },
          complete: () => {},
        })
    );

    localStorage.setItem('columnsArray', JSON.stringify(this.columnsArray));
    localStorage.setItem('columnsNames', JSON.stringify(this.columnsName));
  }

  trasnferredProductBasedBody: any = [];

  getAllData(filters: any, paginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (paginated) {
      getUrl = 'purchases/transfers/products';
    } else {
      getUrl = 'purchases/transfers/products/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }
  allPrintProducts: any = [];
  getAllProducts(printType: any) {
    this.subs.add(
      this.getAllData(this.currentParams, false).subscribe({
        next: (res) => {
          this.allPrintProducts = [];
          this.getData(res.data, false);
        },
        complete: () => {
          this.printService.setColumnsArray(this.columnsArray);
          this.printService.setColumnsNames(this.columnsName);
          this.printService.setRowsData(this.allPrintProducts);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
        },
      })
    );
  }

  getData(data: any, pagiated: boolean) {
    let tempArr: any = [];
    data.forEach((transfer: any) => {
      tempArr.push({
        transfer_id: transfer.transfer.id,
        product_location:
          transfer.batch.main_location?.number +
          '/' +
          transfer.batch.main_location?.stand +
          '-' +
          transfer.batch.main_location?.shelf,
        id: transfer.transfer.id,
        name: transfer.batch.product.name,
        exp_operating:
          transfer.batch.expired_at + ' ' + transfer.batch.operating_number,
        transfer_quantity: transfer.quantity_transferred,
        transfer_from_warehouse: transfer.transfer.transfer_from_warehouse.name,
        transfer_to_warehouse: transfer.transfer.transfer_to_warehouse.name,
        created_at: transfer.transferred_at,
        created_by: transfer.transfer.created_by.name,
        public_price: transfer.batch.product.price,
        manufacturer_name: transfer.batch.product.manufactured_by?.name,
        product_type: transfer.batch.product.manufacturing_type?.name,
      });
    });
    if (pagiated == true) {
      this.trasnferredProductBasedBody = tempArr;
    } else {
      this.allPrintProducts = tempArr;
    }
  }

  changePage(event: any) {
    this.page = event.page + 1;
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  filterTransfer() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
  }
  currentParams: any = {};
  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.transferBetweenWarehouses.value) {
      let value = this.transferBetweenWarehouses.value[key];
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'from_date' || key == 'to_date') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    if (this.page) {
      queryParams['page'] = this.page;
    }

    this.currentParams = queryParams;
    return queryParams;
  }

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllProducts(printData.type);
    } else {
      this.printService.setColumnsArray(this.columnsArray);
      this.printService.setColumnsNames(this.columnsName);
      this.printService.setRowsData(this.trasnferredProductBasedBody);
      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
    }

    setTimeout(() => {
      this.openModal();
    }, 100);
  }

  navigateToDetails(id: any) {
    this.router.navigate([
      `/warehouse/storekeeper/warehouse-transfers/transferred-product-based/${id}`,
    ]);
  }

  getDropdownData() {
    this.subs.add(
      this.generalService.getDropdownData(['static_manufacturers']).subscribe({
        next: (res) => {
          // this.warehouses = res.data.warehouses
          this.Manufacturers = res.data.static_manufacturers;
        },
      })
    );
    this.subs.add(
      this.generalService.getWarehouses({ transfers: 1 }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
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

    //corridore
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridors = res.data;
        },
      })
    );
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
