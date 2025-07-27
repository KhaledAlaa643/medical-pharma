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
import { products, warehouses } from '@models/products';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { NotesModalComponent } from '@modules/notes-modal/notes-modal.component';
import { FixedDataService } from '@services/fixed-data.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import * as bootstrap from 'bootstrap';
import { Paginator } from 'primeng/paginator';
import { BehaviorSubject, Subscription, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { GeneralService } from '@services/general.service';
import { AuthService } from '@services/auth.service';

const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-inventory-and-stock-balance',
  templateUrl: './inventory-and-stock-balance.component.html',
  styleUrls: ['./inventory-and-stock-balance.component.scss'],
})
export class InventoryAndStockBalanceComponent implements OnInit {
  private subs = new Subscription();
  searchInput$ = new BehaviorSubject('');

  columnsArray: columnHeaders[] = [
    {
      name: 'موقع الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم الصنف',
      sort: true,
      search: true,
      direction: null,
    },
    {
      name: 'السعر  ',
      sort: true,
      direction: null,
    },
    {
      name: 'الكمية ',
      sort: true,
      direction: null,
    },
    {
      name: ' اسم المخزن',
    },
    {
      name: 'الشركة  المصنعه  ',
      sort: true,
      direction: null,
    },
    {
      name: 'تاريخ التوريد  ',
    },
    {
      name: 'التاريخ   والتشغيلة',
    },
    {
      name: ' تعديل',
      frozen: true,
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'location',
      type: 'location',
    },
    {
      name: 'name',
      type: 'nameClickableBlue',
    },
    {
      name: 'price',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'warehouse_id',
      type: 'normal',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'supply_date',
      type: 'normal',
    },
    {
      name: 'batch_date',
      type: 'normal',
    },
    {
      name: 'edit',
      type: 'edit',
      frozen: true,
    },
  ];
  productsData: any = [];

  columnsArrayPopup: columnHeaders[] = [
    {
      name: 'الموقع',
    },
    {
      name: 'اسم المورد',
    },
    {
      name: 'التاريخ   والتشغيلة',
    },
    {
      name: 'الكمية ',
    },
    {
      name: 'تاريخ التوريد  ',
    },
  ];
  columnsNamePopup: ColumnValue[] = [
    {
      name: 'location',
      type: 'location',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'batch_date',
      type: 'normal',
    },
    {
      name: 'amount',
      type: 'normal',
    },
    {
      name: 'supply_date',
      type: 'normal',
    },
  ];
  shelves: any = [];
  stands: any = [];
  allFixedData: any = [];
  productBatchesData: any = [];
  product_name: string = '';
  allPrintProduct: any = [];
  multiple_corridors_enabled!: string;
  quary: any = {};
  permissions: any = [];

  total!: number;
  rows!: number;
  page: number = 1;
  productsFilterForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private http: HttpService,
    private fixedData: FixedDataService,
    private printService: PrintService,
    private auth: AuthService,
    private generalService: GeneralService
  ) {}

  @ViewChild('paginator') paginator!: Paginator;

  ngOnInit(): void {
    this.permissions = this.auth.getUserPermissions();
    if (!this.permissions.includes('update_product_permission')) {
      this.columnsArray.pop();
      this.columnsName.pop();
    }
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
      if (this.multiple_corridors_enabled === 'false') {
        const location_index_header = this.columnsArray.findIndex(
          (c: any) => c.name == 'موقع الصنف'
        );
        const location_index_value = this.columnsName.findIndex(
          (c: any) => c.name == 'location'
        );
        const location_index_popup_header = this.columnsArrayPopup.findIndex(
          (c: any) => c.name == 'الموقع'
        );
        const location_index_popup_value = this.columnsNamePopup.findIndex(
          (c: any) => c.name == 'location'
        );
        if (location_index_header > -1) {
          this.columnsArray.splice(location_index_header, 1);
        }
        if (location_index_value > -1) {
          this.columnsName.splice(location_index_value, 1);
        }
        if (location_index_popup_header > -1) {
          this.columnsArrayPopup.splice(location_index_popup_header, 1);
        }
        if (location_index_popup_value > -1) {
          this.columnsNamePopup.splice(location_index_popup_value, 1);
        }
      }
    }

    this.router.navigate([], {
      queryParams: {},
      replaceUrl: true,
    });
    this.subs.add(
      this.fixedData.getAllFixedData().subscribe({
        next: (res) => {
          this.allFixedData = res.data;
          this.shelves = this.allFixedData.shelves.map((shelf: string) => ({
            number: shelf,
          }));
          this.stands = this.allFixedData.stands.map((stand: string) => ({
            number: stand,
          }));
        },
      })
    );

    this.getDropdownDataFilter();

    this.productsFilterForm = this.fb.group({
      warehouse_id: [''],
      corridor_id: [''],
      stand: [''],
      shelf: [''],
      manufacturer_id: [''],
      product_type: [''],
      supplied_at: [''],
      quantity_more_than_zero: [''],
      buying_status: [''],
      selling_status: [''],
      price_from: [''],
      price_to: [''],
      types: [''],
    });

    this.subs.add(
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
            this.productsData = [];
            res.data.forEach((batch: any) => {
              this.productsData.push({
                id: batch?.id,
                product_id: batch?.id,
                location: batch?.location,
                name: batch?.name,
                price: batch?.last_batch?.batch_price,
                total_warehouse_quantity: batch?.total_warehouse_quantity,
                quantity: batch?.total_warehouse_quantity,
                quantity_sum_in_warehouses: batch?.total_warehouse_quantity,
                warehouse_id: batch?.last_batch?.warehouse?.name,
                manufacturer_name: batch.manufacture_company.name,
                supply_date: batch.last_batch?.supplied_at,
                batch_date:
                  batch.last_batch?.operating_number +
                  ' ' +
                  batch.last_batch?.expired_at,
                edit: 'تعديل',
                batches: batch.batches,
              });
            });
            console.log(this.productsData);
            this.total = res?.meta?.total;
            this.rows = res?.meta?.per_page;
          },
          complete: () => {
            const modalInstance = new bootstrap.Modal(this.modal.nativeElement);
            modalInstance.hide();
          },
          error: (err: any) => {
            this.router.navigate([], { queryParams: {} });
          },
        })
    );
  }
  warehouses: warehouses[] = [];
  corridors: any = [];
  Manufacturers: any = [];
  type = [
    { name_ar: 'سائل', name_en: 'Liquid', id: 0 },
    { name_ar: 'الحقن', name_en: 'Injections', id: 2 },
    { name_ar: 'قرص', name_en: 'Tablet', id: 1 },
    { name_ar: 'كبسولات', name_en: 'Capsules', id: 3 },
  ];
  getDropdownDataFilter() {
    this.subs.add(
      this.generalService.getDropdownData(['manufacturers']).subscribe({
        next: (res) => {
          this.Manufacturers = res.data.manufacturers;
          // this.warehouses = res.data.warehouses
        },
      })
    );

    this.subs.add(
      this.generalService.getWarehouses({ inventory: 1 }).subscribe({
        next: (res) => {
          this.warehouses = res.data;
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

  getAllData(filters: any, getPaginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (getPaginated) {
      getUrl = 'products/stock';
    } else {
      getUrl = 'products/stock/all';
    }

    return this.http.getReq(getUrl, { params: x });
  }

  changePage(event: any) {
    this.page = event.page + 1;
    return this.router.navigate([], {
      queryParams: { page: this.page },
      queryParamsHandling: 'merge',
    });
  }

  @ViewChild('operatingAndDateDetailsModal') modal!: ElementRef;
  openModal(product_id: any) {
    const modalInstance = new bootstrap.Modal(this.modal.nativeElement);
    modalInstance.show();
    this.getSingleProductBatches(product_id);
  }
  productQuantitySum: number = 0;
  getSingleProductBatches(product_id: any) {
    this.productBatchesData = [];
    this.productQuantitySum = 0;
    const product = this.productsData.find(
      (product: any) => product.id === product_id
    );
    this.product_name = product.name;
    product.batches.forEach((batch: any) => {
      this.productBatchesData.push({
        id: batch?.id,
        location:
          batch?.corridor?.number + '/' + batch?.stand + '-' + batch?.shelf,
        name: batch?.supplier?.name,
        supply_date: batch?.supplied_at,
        batch_date: batch?.operating_number + '/' + batch?.expired_at,
        amount: batch?.real_quantity,
      });
      this.productQuantitySum = product.quantity_sum_in_warehouses;
    });
  }

  editButton(data: any) {
    this.router.navigate([
      `warehouse/storekeeper/Inventory-of-Items-and-Warehouses/inventory-and-stock-balance-details/${data.product_id}`,
    ]);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getUpdatedQueryParams(sortData?: any) {
    let queryParams: any = {};
    for (const key in this.productsFilterForm.value) {
      let value = this.productsFilterForm.value[key];
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        if (key == 'supplied_at') {
          queryParams[key] = datePipe.transform(value, 'yyyy-MM-dd');
        } else {
          queryParams[key] = value;
        }
      }
    }
    queryParams['page'] = 1;
    this.paginator.changePage(this.page - 1);

    if (sortData) {
      queryParams['sort_by'] = sortData.name;
      queryParams['direction'] = sortData.direction;
    }

    this.quary = queryParams;

    return queryParams;
  }

  filter() {
    const queryParams = this.getUpdatedQueryParams();
    this.router.navigate([], {
      queryParams,
    });
    this.toggleFilterModal();
  }
  getAllproducts(printType: any) {
    this.subs.add(
      this.getAllData(this.quary, false).subscribe({
        next: (res) => {
          this.allPrintProduct = [];
          res.data.forEach((batch: any) => {
            this.allPrintProduct.push({
              id: batch?.id,
              location: batch.location,
              name: batch?.name,
              price: batch?.price,
              quantity: batch.batches[batch.batches.length - 1]?.quantity,
              warehouse_id:
                batch.batches[batch.batches.length - 1]?.warehouse?.name,
              manufacturer_name: batch.manufacture_company.name,
              supply_date: batch.batches[batch.batches.length - 1]?.supplied_at,
              batch_date:
                batch.batches[batch.batches.length - 1]?.operating_number +
                ' ' +
                batch.batches[batch.batches.length - 1]?.expired_at,
              edit: 'تعديل',
              batches: batch.batches,
            });
          });
        },
        complete: () => {
          let tempColumnsArray: any = [];
          let tempColumnsName: any = [];
          tempColumnsArray = this.columnsArray.filter(
            (column) => column.name.trim() !== 'تعديل'
          );
          tempColumnsName = this.columnsName.filter(
            (column) => column.name.trim() !== 'edit'
          );
          this.printService.setColumnsArray(tempColumnsArray);
          this.printService.setColumnsNames(tempColumnsName);
          this.printService.setRowsData(this.allPrintProduct);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
        },
      })
    );
  }

  sorting(sortData?: any) {
    const queryParams = this.getUpdatedQueryParams(sortData);
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge',
    });
  }
  printType: string = '';
  printMain(printData: any) {
    if (printData.amountOfPrint == 2) {
      if (this.printType == 'main') {
        this.getAllproducts(printData.type);
      } else {
        this.printService.setColumnsArray(this.columnsArrayPopup);
        this.printService.setColumnsNames(this.columnsNamePopup);
        this.printService.setRowsData(this.productBatchesData);
        if (printData.type == 1) {
          this.printService.downloadPDF();
        } else {
          this.printService.downloadCSV();
        }
      }
    } else {
      if (this.printType == 'main') {
        let tempColumnsArray = this.columnsArray.filter(
          (column) => column.name.trim() !== 'تعديل'
        );
        let tempColumnsName = this.columnsName.filter(
          (column) => column.name.trim() !== 'edit'
        );
        this.printService.setColumnsArray(tempColumnsArray);
        this.printService.setColumnsNames(tempColumnsName);
        this.printService.setRowsData(this.productsData);
      } else {
        this.printService.setColumnsArray(this.columnsArrayPopup);
        this.printService.setColumnsNames(this.columnsNamePopup);
        this.printService.setRowsData(this.productBatchesData);
      }

      if (printData.type == 1) {
        this.printService.downloadPDF();
      } else {
        this.printService.downloadCSV();
      }
    }

    setTimeout(() => {
      this.closeModal();
    }, 100);
  }

  paginated!: boolean;

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openOptionsModal(type: string, paginated: boolean) {
    this.paginated = paginated;
    this.printType = type;
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
  closeModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

  @ViewChild('toggleFilter') toggleFilter!: ElementRef<HTMLElement>;
  toggleFilterModal() {
    let el: HTMLElement = this.toggleFilter.nativeElement;
    el.click();
  }
}
