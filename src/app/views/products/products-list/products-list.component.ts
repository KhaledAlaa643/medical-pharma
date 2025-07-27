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
import { commonObject, FiltersObject } from '@models/settign-enums';

const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent {
  private subs = new Subscription();

  columnsArray: columnHeaders[] = [
    {
      name: 'موقع الصنف',
    },
    {
      name: 'اسم الصنف',
    },
    {
      name: 'سعر الجمهور',
    },

    {
      name: 'الشركة  المصنعه  ',
    },
    {
      name: 'حالة البيع  ',
    },
    {
      name: 'حالة الشراء  ',
    },
    {
      name: 'تحذير صلاحية الشراء ',
    },
    {
      name: ' مدة الركود ',
    },
    {
      name: ' تعديل',
      frozen: true,
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'location',
      type: 'normal',
    },
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'market_price',
      type: 'normal',
    },

    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'buying_status_name',
      type: 'normal',
    },
    {
      name: 'selling_status_name',
      type: 'normal',
    },
    {
      name: 'purchase_validity_warning',
      type: 'normal',
    },
    {
      name: 'selling_status_name',
      type: 'normal',
    },
    {
      name: 'edit',
      type: 'edit',
      frozen: true,
    },
  ];
  productsData: any = [];
  monthes: commonObject[] = [];
  shelves: any = [];
  stands: any = [];
  allFixedData: any = [];
  productBatchesData: any = [];
  product_name: string = '';
  allPrintProduct: any = [];
  multiple_corridors_enabled!: string;
  quary: any = {};
  permissions: any = [];
  discount_slat: commonObject[] = [];
  supplier_idle_days: commonObject[] = [];

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
    // if (!this.permissions.includes('update_product_permission')) {
    //   this.columnsArray.pop();
    //   this.columnsName.pop();
    // }

    this.getDropdownDataFilter();

    this.productsFilterForm = this.fb.group({
      warehouse_id: [''],
      corridor_id: [''],
      stand: [''],
      id: [''],
      shelf: [''],
      distribution_company_id: [''],
      manufacturer_id: [''],
      product_type: [''],
      manufacturing_type: [''],
      idle_period: [''],
      discount_tier_ids: [''],
      accept_returns: [''],
      return_acceptance_period: [''],
      taxes: [''],
      ingredient_alternative_ids: [''],
      active_ingredient_id: [''],
      parent_company_id: [''],
      for_company_id: [''],
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
            this.productsData = res.data.map((batch: any) => {
              batch['product_id'] = batch!.id;
              batch['buying_status_name'] = batch?.buying_status?.name;
              batch['manufacturer_name'] = batch?.manufacture_company?.name;
              batch['selling_status_name'] = batch?.selling_status?.name;
              return batch;
            });
            console.log(this.productsData);
            this.total = res?.meta?.total;
            this.rows = res?.meta?.per_page;
          },
          complete: () => {},
          error: (err: any) => {},
        })
    );
  }
  warehouses: warehouses[] = [];
  corridors: any = [];
  Manufacturers: any = [];
  products_dropdown: FiltersObject[] = [];
  activeIngredient: FiltersObject[] = [];

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
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products_dropdown = res.data;
        },
      })
    );

    this.subs.add(
      this.http.getReq('products/active-ingredients').subscribe({
        next: (res) => {
          this.activeIngredient = res.data;
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

    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridors = res.data;
        },
      })
    );

    this.subs.add(
      this.http.getReq(`settings/discount-tiers`).subscribe({
        next: (res) => {
          this.discount_slat = res.data;
        },
      })
    );
    this.allFixedData = this.auth.getEnums();

    this.shelves = this.allFixedData?.shelves.map((shelf: string) => ({
      number: shelf,
    }));
    this.stands = this.allFixedData?.stands.map((stand: string) => ({
      number: stand,
    }));
    this.monthes = this.allFixedData.idle_product_months.map(
      (shelf: string) => ({ number: shelf })
    );
    this.supplier_idle_days = this.allFixedData.supplier_idle_days.map(
      (shelf: string) => ({ number: shelf })
    );
  }

  getAllData(filters: any, getPaginated: boolean) {
    let x: LooseObject = {};
    for (const [key, value] of Object.entries(filters)) {
      if (value) x[key] = value;
    }
    let getUrl = '';
    if (getPaginated) {
      getUrl = 'products/list';
    } else {
      getUrl = 'products';
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

  editButton(data: any) {
    this.router.navigate([`products/edit/${data.product_id}`]);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  getUpdatedQueryParams() {
    let queryParams: any = {};
    for (const key in this.productsFilterForm.value) {
      let value = this.productsFilterForm.value[key];
      if (
        value != null &&
        value != undefined &&
        (value === 0 || value !== '')
      ) {
        queryParams[key] = value;
      }
    }
    queryParams['page'] = 1;
    this.paginator.changePage(this.page - 1);

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

  paginated!: boolean;

  @ViewChild('toggleFilter') toggleFilter!: ElementRef<HTMLElement>;
  toggleFilterModal() {
    let el: HTMLElement = this.toggleFilter.nativeElement;
    el.click();
  }

  allPrintData: any = [];
  currentParams: any = {};
  getAllOrders(printType: any) {
    let params = {};
    params = this.currentParams;
    this.subs.add(
      this.getAllData(params, false).subscribe({
        next: (res) => {
          this.allPrintData = res.data;
          this.allPrintData = res.data.map((data: any, index: number) => {
            data['product_id'] = data.id;
            data['buying_status_name'] = data.buying_status.name;
            data['manufacturer_name'] = data.manufacture_company.name;
            data['selling_status_name'] = data.selling_status.name;
            return data;
          });
        },
        complete: () => {
          this.printService.setColumnsArray(this.columnsArray);
          this.printService.setColumnsNames(this.columnsName);
          this.printService.setRowsData(this.allPrintData);
          if (printType == 1) {
            this.printService.downloadPDF();
          } else {
            this.printService.downloadCSV();
          }
        },
      })
    );
  }

  print(printData: any) {
    if (printData.amountOfPrint == 2) {
      this.getAllOrders(printData.type);
    } else {
      this.printService.setColumnsArray(this.columnsArray);
      this.printService.setColumnsNames(this.columnsName);
      this.printService.setRowsData(this.allPrintData);

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

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
}
