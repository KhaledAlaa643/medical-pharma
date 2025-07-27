import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { products } from '@models/products';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-drug-info',
  templateUrl: './drug-info.component.html',
  styleUrls: ['./drug-info.component.scss'],
})
export class DrugInfoComponent implements OnInit, OnChanges, OnDestroy {
  columnsArray: columnHeaders[] = [
    {
      name: 'الاسم عربي',
      sort: true,
    },
    {
      name: 'الصلاحية والتشغيلة',
    },
    {
      name: 'البونص',
    },
    {
      name: 'السعر',
    },
    {
      name: 'الضريبة',
    },
    {
      name: 'الخصم',
    },
  ];
  columnsName: ColumnValue[] = [
    {
      name: 'name',
      type: 'normal',
    },
    {
      name: 'expired_at',
      type: 'batches_expired_at',
    },
    {
      name: 'quantity',
      type: 'offers_quantity',
    },
    {
      name: 'price',
      type: 'normal',
    },
    {
      name: 'taxes',
      type: 'normal',
    },
    {
      name: 'normal_discount',
      type: 'normal',
    },
  ];
  alternative!: boolean;
  product: products = {} as products;
  warehouseQuantity!: number;
  totalWarehouseQuantity!: number;
  typeIndex = 2;
  relatedTotalItems!: number;
  relatedRows!: number;
  relatedCurrentPage!: number;
  previousPage = 1;
  manufacture_company_name: string = '';
  private subs = new Subscription();

  @Input() productID!: number;
  @Input() warehouseId!: number;
  @Input() quantityInWarehouse: any = 0;
  @Input() totalQuantity!: number;
  RecievedProductId!: number;
  productDataArray!: number;
  relatedProductDataArray: any;
  alternativeProductDataArray: any = [];
  relatedCurrentPageIndex: any;
  currentPage!: number;
  relatedProductArray: any = [];
  currentPageIndex: number = 0;
  rows!: number;
  totalItems!: number;

  activeTap1: boolean = true;
  activeTap2: boolean = true;
  RecievedWarehouseID!: number;
  productData!: FormGroup;

  constructor(
    private http: HttpService,
    private _router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this._router.navigate([], {
      queryParams: { alternativepage: null, relatedpage: null, index: null },
      queryParamsHandling: 'merge',
    });
  }

  ngOnInit() {
    this.productData = this.fb.group({
      name: [''],
      manufacture_company_name: [''],
      product_type: [''],
      price: [''],
      normal_discount: [''],
      taxes: [''],
      items_number_in_packet: [''],
      packets_number_in_package: [''],
      warehouseQuantity: [''],
      totalWarehouseQuantity: [''],
    });
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (this.activeTap2) {
        if (params.hasOwnProperty('alternativepage')) {
          this.getRelatedData(params);
        }
      } else {
        if (params.hasOwnProperty('relatedpage')) {
          this.getAlternativeData(params);
        }
      }
    });
  }

  getAlternativeData(paramData: any) {
    let param = {
      id: this.RecievedProductId,
      page: paramData['alternativepage'],
    };
    let getUrl = 'products/medication-alternatives';
    this.subs.add(
      this.http.getReq(getUrl, { params: param }).subscribe({
        next: (res) => {
          this.alternativeProductDataArray = res.data;
          this.totalItems = res.meta.total;
          this.rows = res.meta.per_page;
        },
      })
    );
  }

  getRelatedData(paramData: any) {
    let param = {
      id: this.RecievedProductId,
      page: paramData['relatedpage'],
    };
    let getUrl = 'products/related-active-ingredient';
    this.subs.add(
      this.http.getReq(getUrl, { params: param }).subscribe({
        next: (res) => {
          this.relatedProductArray = res.data;
          this.relatedTotalItems = res.meta.total;
          this.relatedRows = res.meta.per_page;
        },
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productID'] || changes['warehouseID']) {
      this.RecievedProductId = this.productID;
      this.RecievedWarehouseID = this.warehouseId;
      this.getProduct(this.RecievedProductId, this.RecievedWarehouseID);
    }
    if (changes['quantityInWarehouse'] && this.productData) {
      this.productData.controls['warehouseQuantity'].setValue(
        this.quantityInWarehouse
      );
    }
    if (changes['totalQuantity'] && this.productData) {
      this.productData.controls['totalWarehouseQuantity'].setValue(
        this.totalQuantity
      );
    }
    if (this.RecievedProductId) {
      this._router.navigate([], {
        queryParams: {
          alternativepage: 1,
          relatedpage: 1,
          index: this.typeIndex,
        },
        queryParamsHandling: 'merge',
      });
    }
  }
  getProduct(productId: number, warehouseId: number) {
    let params = {
      product_id: productId,
      warehouse_id: warehouseId,
    };
    this.subs.add(
      this.http.getReq('products/view', { params: params }).subscribe({
        next: (res) => {
          this.productData.patchValue(res.data);
          // this.manufacture_company_name = res.data.manufacture_company?.name
          this.productData.controls['manufacture_company_name'].setValue(
            res.data.manufactured_by?.name
          );
          this.productData.controls['product_type'].setValue(
            res.data.type.name
          );
        },
      })
    );
  }

  onPageChangeAlternative(event: any) {
    this.currentPageIndex = event.page + 1;
    this._router.navigate([], {
      queryParams: { alternativepage: this.currentPageIndex },
      queryParamsHandling: 'merge',
    });
  }

  onPageChangeRelated(event: any) {
    this.relatedCurrentPageIndex = event.page + 1;
    this._router.navigate([], {
      queryParams: { relatedpage: this.relatedCurrentPageIndex },
      queryParamsHandling: 'merge',
    });
  }

  changeTab(index: number) {
    if (index == 1) {
      this.activeTap1 = true;
      this.activeTap2 = false;
      this.typeIndex = index;
    } else {
      this.activeTap2 = true;
      this.activeTap1 = false;
      this.typeIndex = index;
    }

    this._router.navigate([], {
      queryParams: { index: this.typeIndex },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this._router.navigate([], {
      queryParams: { alternativepage: null, relatedpage: null, page: null },
    });
  }
}
