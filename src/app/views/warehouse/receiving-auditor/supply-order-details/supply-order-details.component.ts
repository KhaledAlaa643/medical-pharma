import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '@services/http.service';
import { ToggleModal } from '@services/toggleModal.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, map, pairwise, startWith } from 'rxjs';
import { QRCodeStickerComponent } from '@modules/QR-code-sticker/QR-code-sticker.component';
import { PharmacyInvoiceTemplateComponent } from '@modules/pharmacy-invoice-template/pharmacy-invoice-template.component';
import { suppliers } from '@models/suppliers';
import { LooseObject } from '@models/LooseObject.js';
import { GeneralService } from '@services/general.service';
import {
  notReviewedSupplyOrderDetails,
  reviewedSupplyOrderDetails,
  viewInvoice,
} from '@models/SupplyOrderDetails';
import { batch, products, warehouses } from '@models/products';
import { setting } from '@models/settings.js';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
const datePipe = new DatePipe('en-EG');

export interface scannedProduct {
  id: number;
  created_by: number;
  updated_by?: any;
  name: string;
  name_en: string;
  name_ar: string;
  description: string;
  sku: string;
  barcode: string;
  total_quantity: number;
  is_limited: number;
  limited_quantity: number;
  normal_discount: number;
  market_price: number;
  price: number;
  color?: any;
  taxes: number;
  type: Alternative;
  items_number_in_packet: number;
  packets_number_in_package: number;
  quantity_sum_in_warehouses: number;
  quantity_in_warehouse: number;
  has_offer: boolean;
  has_bonus: boolean;
  manufacturing_type: Alternative;
  selling_status: Alternative;
  buying_status: Alternative;
  note: string;
  created_at: string;
  updated_at: string;
  manufacture_company: Alternative;
  activeIngredients: Alternative[];
  alternatives: Alternative[];
  batches: batch[];
  offers: any[];
  warehouses: warehouses[];
}
export interface Alternative {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  value?: number;
}

export interface ConsolidatedObject {
  purchase_id: number | undefined;
  cart_purchase_ids: number[];
}

export interface returningItemsData {
  cart_purchase_id: number;
  purchase_id: number;
  purchase_return_id: number | undefined;
  quantity: number;
}
export interface cancelReturningItemsData {
  cart_purchase_id: number;
  purchases_return_id: number;
}

@Component({
  selector: 'app-supply-order-details',
  templateUrl: './supply-order-details.component.html',
  styleUrls: ['./supply-order-details.component.scss'],
})
export class SupplyOrderDetailsComponent implements OnInit, OnDestroy {
  suppliers!: suppliers[];
  warehouseFilter!: FormGroup;
  notReviewed: notReviewedSupplyOrderDetails[] = [];
  reviewed: reviewedSupplyOrderDetails[] = [];
  invoiceId: string = '';
  productCode!: FormGroup;
  private subs = new Subscription();
  editOrder!: FormGroup;
  data:
    | notReviewedSupplyOrderDetails[]
    | reviewedSupplyOrderDetails[]
    | viewInvoice[] = [];
  allProducts: viewInvoice[] = [];
  editBarcode!: FormGroup;
  packagingData!: FormGroup;
  returnsForm!: FormGroup;
  isActiveTapArray: boolean[] = Array(3).fill(false);
  barcodeBuffer: string = '';
  lastKeyPressTime = 0;
  lastKeyValue = '';
  normalTyping: boolean = false;
  firsttime: boolean = true;
  previousFocusedInput!: HTMLInputElement;

  activeProductId!: string;
  ProductId: number | null = null;
  scannedProduct!: scannedProduct[];
  products: products[] = [];
  cartPurchaseId!: number;
  returnStatusInNotReviewed!: number;
  settings!: setting[];
  returningItemsData!: returningItemsData;
  toCancelReviewedBatchId: number = 0;
  purchase_id!: number;
  cancelReturningItemsData!: cancelReturningItemsData;
  addNewOperatingNumber: boolean = false;
  total_inventoried_cart_items!: number;
  total_non_inventoried_cart_items!: number;
  total_purchase_price: number = 0;
  warehouse_name: string = '';
  consolidatedObject!: ConsolidatedObject;

  @ViewChild('quantityInput') private quantityInput!: ElementRef;
  @ViewChild('monthInput') private monthInput!: ElementRef;
  @ViewChild('yearInput') private yearInput!: ElementRef;
  @ViewChild('operatingNumber') private operatingNumber!: ElementRef;
  @ViewChild('barcodeInput', { read: ElementRef }) barcodeInput!: ElementRef;
  @ViewChild('barCode') barCode!: ElementRef;
  @ViewChild('openEditConfigrations')
  openEditConfigrations!: ElementRef<HTMLElement>;
  @ViewChild('openEditBarcode') openEditBarcode!: ElementRef<HTMLElement>;
  @ViewChild('downloadBtn') downloadBtn!: ElementRef<HTMLElement>;
  @ViewChild('downloadSticker') downloadSticker!: ElementRef<HTMLElement>;
  @ViewChild('Sticker') Sticker!: QRCodeStickerComponent;
  @ViewChild('pharmacyInvoiceTemplate')
  pharmacyInvoiceTemplate!: PharmacyInvoiceTemplateComponent;
  @ViewChild('confirmBtn') confirmBtn!: ElementRef<HTMLElement>;
  @ViewChild('openConfirmation1Model')
  openConfirmation1Model!: ElementRef<HTMLElement>;
  @ViewChild('openConfirmation2Model')
  openConfirmation2Model!: ElementRef<HTMLElement>;
  @ViewChild('returnCartButton') returnCartButton!: ElementRef<HTMLElement>;
  @ViewChild('cancelReturnCartButton')
  cancelReturnCartButton!: ElementRef<HTMLElement>;
  @ViewChild('cancelReviewed') cancelReviewed!: ElementRef<HTMLElement>;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    public toggleModal: ToggleModal,
    private http: HttpService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private generalService: GeneralService,
    private auth: AuthService
  ) {
    window.addEventListener('mouseup', (e: any) => {
      if (e?.target?.classList?.contains('editOrderModal')) {
        this.toggleModal.showModal = false;
      }
    });
  }

  getSettings() {
    // this.generalService.getSettingsEnum().subscribe({
    //     next: (res) => {
    //         this.settings = res.data.returns_reasons
    //     }
    // })
    this.settings = this.auth.getEnums().returns_reasons;
  }

  activateAdd(event: any) {
    this.monthInput.nativeElement?.focus();
  }

  barcodeInput1: string = '';
  lastKeypressTime: number = 0;
  scanBuffer: string = '';

  @HostListener('document:keypress', ['$event'])
  handleKeyPress(event: KeyboardEvent) {
    if (event.key !== 'Enter') {
      const now = Date.now();
      if (now - this.lastKeypressTime > 20) {
        this.scanBuffer = '';
      } else {
        this.clearFocusedInputIfNotBarcode();
        this.blurAllInputs();
        this.barCode.nativeElement.focus();
      }
      this.scanBuffer += event.key;
      this.lastKeypressTime = now;
    }
  }
  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      if (Date.now() - this.lastKeypressTime < 10) {
        // Fast input suggests barcode scan
        this.processBarcode(this.scanBuffer);
        this.scanBuffer = '';
      } else {
      }
      this.lastKeypressTime = 0;
    }
  }

  clearFocusedInputIfNotBarcode() {
    const focusedElement = document.activeElement;
    if (
      focusedElement &&
      focusedElement.tagName === 'INPUT' &&
      focusedElement.id !== 'barcode'
    ) {
      (focusedElement as HTMLInputElement).value = '';
    }
  }

  removeNonNumericChars(inputString: string) {
    return inputString.replace(/[^0-9]/g, '');
  }
  blurAllInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach((input) => this.renderer.selectRootElement(input).blur());
  }

  onFocus(event: FocusEvent) {
    this.previousFocusedInput = event.target as HTMLInputElement;
  }
  // getFocusedInput(): HTMLInputElement {
  //     return this.elementRef.nativeElement.ownerDocument.activeElement as HTMLInputElement;
  // }
  ngOnInit(): void {
    // this.setupInputTimingObservable();
    this.getSettings();
    this.invoiceId = String(this.activeRoute.snapshot.paramMap.get('id'));
    this.isActiveTapArray[0] = true;
    this.getSupplierData();
    this.productCode = this.fb.group({
      price: [''],
      barcode: [''],
      quantity: [''],
      month: [''],
      year: [''],
      operating_number: [''],
      items_number_in_packet: [''],
      packets_number_in_package: [''],
      batch_id: [''],
      cart_id: [''],
    });

    this.returnsForm = this.fb.group({
      reason: ['', Validators.required],
      global_reason: ['', Validators.required],
    });
    this.warehouseFilter = this.fb.group({
      invoice_number: [''],
      invoice_id: [''],
      created_at: [''],
      supplier_id: [''],
      basket_number: [''],
      auditor_name: [''],
    });

    this.editOrder = this.fb.group({
      product_name: [''],
      batch_id: [''],
      cart_id: [''],
      expired_at: ['', Validators.required],
      operating_number: ['', Validators.required],
      order_quantity: [''],
    });
    this.editBarcode = this.fb.group({
      barcode: [''],
      product_id: [''],
    });

    if (this.invoiceId != 'null') {
      this.loadInvoiceDetails();
    }
    this.changeActiveTab(0);
  }
  getSupplierData() {
    this.subs.add(
      this.generalService.getDropdownData(['suppliers']).subscribe({
        next: (res) => {
          this.suppliers = res.data.suppliers;
        },
      })
    );
  }
  getAllProducts() {
    this.subs.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
        },
      })
    );
  }

  supplyOrderDetailsHeaders = [
    { field: 'name', header: ' اسم الصنف', type: 'productNavNameNoBatches' },
    { field: 'inventoried_quantity', header: ' كمية مجرودة', type: 'normal' },
    { field: 'invoice_quantity', header: ' كمية    الفاتورة ', type: 'normal' },
    { field: 'quantity_difference', header: 'الفرق ', type: 'normal' },
    { field: 'public_price', header: '  سعر الجمهور', type: 'normal' },
    { field: 'supply_price', header: 'سعر   التوريد ', type: 'normal' },
    { field: 'notes_on_item', header: 'ملاحظات   علي الصنف ', type: 'normal' },
    { field: 'return', header: 'أمر ', type: 'modifyBatch' },
  ];

  columnsArray: columnHeaders[] = [
    { name: ' اسم الصنف' },
    { name: ' كمية مجرودة' },
    { name: ' كمية    الفاتورة ' },
    { name: 'الفرق ' },
    { name: '  سعر الجمهور' },
    { name: 'سعر   التوريد ' },
    { name: 'ملاحظات   علي الصنف ' },
    { name: 'أمر ' },
  ];
  columnsName: ColumnValue[] = [
    { name: 'name', type: 'normal' }, //productNavNameNoBatches
    { name: 'inventoried_quantity', type: 'normal' },
    { name: 'invoice_quantity', type: 'normal' },
    { name: 'quantity_difference', type: 'normal' },
    { name: 'public_price', type: 'normal' },
    { name: 'supply_price', type: 'normal' },
    { name: 'notes_on_item', type: 'normal' },
    { name: 'return', type: 'returnBatch' }, //modifyBatch
  ];

  headersToPrint = [
    { field: 'location', header: 'موقع الصنف', type: 'normal' },
    { field: 'name', header: ' اسم الصنف', type: 'productNavName' },
    { field: 'company', header: 'الشركة المصنعه', type: 'normal' },
    { field: 'order_quantity', header: '  الكمية', type: 'normal' },
    { field: 'price', header: 'السعر ', type: 'normal' },
    { field: 'expired_at', header: 'التاريخ والتشغيلة', type: 'normal' },
  ];
  //cart will be splited into two arrays intentered and not intentered
  loadInvoiceDetails() {
    let Data: any;
    if (this.warehouseFilter.controls['created_at'].value) {
      this.warehouseFilter.controls['created_at'].setValue(
        datePipe.transform(
          this.warehouseFilter.controls['created_at'].value,
          'yyyy-MM-dd'
        )
      );
    }
    if (this.invoiceId != 'null') {
      this.warehouseFilter.controls['invoice_id'].setValue(this.invoiceId);
    } else {
      this.warehouseFilter.removeControl('invoice_id');
    }
    if (this.warehouseFilter.controls['invoice_number'].value) {
      this.invoiceId = 'null';
      this.warehouseFilter.removeControl('invoice_id');
    }
    let params: any = {};
    for (const key in this.warehouseFilter.value) {
      const value = this.warehouseFilter.value[key];
      if (value !== null && value !== undefined && value !== '') {
        params[key] = value;
      }
    }
    if (
      this.invoiceId != 'null' ||
      (this.warehouseFilter.controls['invoice_number'].value &&
        this.warehouseFilter.controls['created_at'].value &&
        this.warehouseFilter.controls['supplier_id'].value)
    ) {
      this.activeRoute.snapshot.params['id'];
      this.subs.add(
        this.http
          .getReq(`purchases/${this.activeRoute.snapshot.params['id']}`)
          .subscribe({
            next: (res) => {
              this.total_inventoried_cart_items =
                res.data?.total_inventoried_cart_items;
              this.total_non_inventoried_cart_items =
                res.data?.total_non_inventoried_cart_items;
              this.warehouse_name = res.data.warehouse.name;
              this.purchase_id = res.data.id;
              Data = res?.status_value;
              this.warehouseFilter.controls['invoice_number'].setValue(
                res?.data?.id
              );
              this.warehouseFilter.controls['invoice_number'].disable();
              this.warehouseFilter.controls['supplier_id'].setValue(
                res.data?.supplier?.id
              );
              this.warehouseFilter.controls['supplier_id'].disable();
              this.warehouseFilter.controls['created_at'].setValue(
                datePipe.transform(
                  res.data.created_at.split(' ')[0],
                  'yyyy-MM-dd'
                )
              );
              this.warehouseFilter.controls['created_at'].disable();
              this.reviewed = [];
              //set all arrays data
              this.setData(
                res.data.cart.inventoried,
                res?.data?.cart?.not_inventoried,
                res.data.cart.all
              );
            },
            complete: () => {
              this.changeActiveTab(0);
            },
            error: (error) => {},
          })
      );
    }
  }

  active_index!: number;
  changeActiveTab(index: any) {
    this.active_index = index;
    this.isActiveTapArray.fill(false);
    this.isActiveTapArray[index] = true;
    if (index == 0) {
      this.addNewOperatingNumber = true;
      this.data = this.notReviewed;
      (this.columnsArray = [
        { name: 'اسم الصنف' },
        { name: 'كمية مجرودة' },
        { name: 'كمية الفاتورة' },
        { name: 'الفرق' },
        { name: 'سعر الجمهور' },
        { name: 'سعر التوريد' },
        { name: 'ملاحظات علي الصنف' },
        { name: 'أمر' },
      ]),
        (this.columnsName = [
          { name: 'name', type: 'clickOnProduct' },
          { name: 'inventoried_quantity', type: 'normal' },
          { name: 'invoice_quantity', type: 'normal' },
          { name: 'quantity_difference', type: 'normal' },
          { name: 'public_price', type: 'normal' },
          { name: 'supply_price', type: 'normal' },
          { name: 'notes_on_item', type: 'normal' },
          { name: 'return', type: 'returnBatch' },
        ]);

      this.supplyOrderDetailsHeaders = [
        {
          field: 'name',
          header: ' اسم الصنف',
          type: 'productNavNameNoBatches',
        },
        {
          field: 'inventoried_quantity',
          header: ' كمية مجرودة',
          type: 'normal',
        },
        {
          field: 'invoice_quantity',
          header: ' كمية    الفاتورة ',
          type: 'normal',
        },
        { field: 'quantity_difference', header: 'الفرق ', type: 'normal' },
        { field: 'public_price', header: '  سعر الجمهور', type: 'normal' },
        { field: 'supply_price', header: 'سعر   التوريد ', type: 'normal' },
        {
          field: 'notes_on_item',
          header: 'ملاحظات   علي الصنف ',
          type: 'normal',
        },
        { field: 'return', header: 'أمر ', type: 'returnCart' },
      ];
    } else if (index == 1) {
      this.addNewOperatingNumber = false;

      this.data = this.allProducts;
      (this.columnsArray = [
        { name: 'اسم الصنف' },
        { name: 'كمية الفاتورة' },
        { name: 'سعر الجمهور' },
        { name: 'سعر التوريد' },
        { name: 'ملاحظات علي الصنف' },
      ]),
        (this.columnsName = [
          { name: 'name', type: 'normal' },
          { name: 'invoice_quantity', type: 'normal' },
          { name: 'public_price', type: 'normal' },
          { name: 'supply_price', type: 'normal' },
          { name: 'notes_on_item', type: 'normal' },
        ]);
      this.supplyOrderDetailsHeaders = [
        { field: 'name', header: ' اسم الصنف', type: 'normal' },
        {
          field: 'invoice_quantity',
          header: ' كمية    الفاتورة ',
          type: 'normal',
        },
        { field: 'public_price', header: '  سعر الجمهور', type: 'normal' },
        { field: 'supply_price', header: 'سعر   التوريد ', type: 'normal' },
        {
          field: 'notes_on_item',
          header: 'ملاحظات   علي الصنف ',
          type: 'normal',
        },
      ];
    } else {
      this.addNewOperatingNumber = false;
      this.data = this.reviewed;

      (this.columnsArray = [
        { name: 'اسم الصنف' },
        { name: 'كمية مجرودة' },
        { name: 'كمية الفاتورة' },
        { name: 'الفرق' },
        { name: 'سعر الجمهور' },
        { name: 'سعر التوريد' },
        { name: 'التاريخ والتشغيلة' },

        { name: 'ملاحظات علي الصنف' },
        { name: 'أمر' },
      ]),
        (this.columnsName = [
          { name: 'name', type: 'normal' },
          { name: 'inventoried_quantity', type: 'normal' },
          { name: 'invoice_quantity', type: 'normal' },
          { name: 'quantity_difference', type: 'normal' },
          { name: 'public_price', type: 'normal' },
          { name: 'supply_price', type: 'normal' },
          { name: 'expiry_operation', type: 'normal' },
          { name: 'notes_on_item', type: 'normal' },
          { name: 'return', type: 'cancelBatch' },
        ]);
      this.supplyOrderDetailsHeaders = [
        { field: 'name', header: ' اسم الصنف', type: 'normal' },
        {
          field: 'inventoried_quantity',
          header: ' كمية مجرودة',
          type: 'normal',
        },
        {
          field: 'invoice_quantity',
          header: ' كمية    الفاتورة ',
          type: 'normal',
        },
        { field: 'quantity_difference', header: 'الفرق ', type: 'normal' },
        { field: 'public_price', header: '  سعر الجمهور', type: 'normal' },
        { field: 'supply_price', header: 'سعر   التوريد ', type: 'normal' },
        {
          field: 'expiry_operation',
          header: 'التاريخ والتشغيلة',
          type: 'normal',
        },
        {
          field: 'notes_on_item',
          header: 'ملاحظات   علي الصنف ',
          type: 'normal',
        },
        { field: 'return', header: 'أمر ', type: 'cancelBatch' },
      ];
    }
  }
  showModal(data: any) {
    this.toggleModal.showModal = true;
  }
  closeFinalConfirm() {
    let confirmation1Model: HTMLElement =
      this.openConfirmation1Model.nativeElement;
    confirmation1Model.click();
  }
  openConfirmPopup() {
    let allCartPurchaseIds: any[] = [];
    this.notReviewed.forEach(
      (item: { return_data: any; purchase_id: any; cart_purchase_id: any }) => {
        if (item.return_data != null) {
          if (this.consolidatedObject) {
            this.consolidatedObject.cart_purchase_ids.push(
              item.return_data.cart_purchase_id
            );
          } else {
            this.consolidatedObject = {
              purchase_id: item.purchase_id,
              cart_purchase_ids: [item.return_data.cart_purchase_id],
            };
          }
        } else {
          allCartPurchaseIds.push(item.cart_purchase_id);
        }
      }
    );

    if (allCartPurchaseIds.length > 0) {
      if (this.consolidatedObject) {
        this.consolidatedObject.cart_purchase_ids =
          this.consolidatedObject.cart_purchase_ids.concat(allCartPurchaseIds);
      } else {
        this.consolidatedObject = {
          purchase_id: this.notReviewed[0].purchase_id,
          cart_purchase_ids: allCartPurchaseIds,
        };
      }
    }

    let confirmation1Model: HTMLElement =
      this.openConfirmation1Model.nativeElement;
    let confirmation2Model: HTMLElement =
      this.openConfirmation2Model.nativeElement;

    let hasReturnData = this.notReviewed.every(
      (item: { return_data: any }) =>
        item.return_data && Object.keys(item.return_data).length > 0
    );

    if (this.notReviewed.length > 0) {
      if (hasReturnData) {
        this.openFinalConfirmation();
      } else {
        confirmation2Model.click();
      }
    } else {
      this.openFinalConfirmation();
    }
  }
  openFinalConfirmation() {
    let confirmation1Model: HTMLElement =
      this.openConfirmation1Model.nativeElement;
    confirmation1Model.click();
  }
  openCloseBarcode() {
    this.barcodeBuffer = '';
    this.productCode.controls['barcode'].setValue('');
    let openEditBarcode: HTMLElement = this.openEditBarcode.nativeElement;
    openEditBarcode.click();
  }

  activateQuantity() {
    this.quantityInput.nativeElement?.focus();
  }
  activateMonth() {
    this.monthInput.nativeElement?.focus();
  }
  activateYear() {
    this.yearInput.nativeElement?.focus();
  }
  activateOperatingNumber() {
    this.operatingNumber.nativeElement?.focus();
  }
  activateCloseButton(event: any) {
    this.confirmBtn.nativeElement?.focus();
    event.preventDefault();
  }

  openEditOperationModel(data: any) {
    this.editOrder.patchValue(data);
    this.editOrder.controls['expired_at'].setValue(data.expired_At);
    this.editOrder.controls['order_quantity'].setValue(data.order_quantity);
    const index = this.allProducts.findIndex(
      (c: any) => c.batch_id == data.batch_id
    );
    if (index > -1) {
      this.editOrder.controls['product_name'].setValue(
        this.allProducts[index].name
      );
      this.editOrder.controls['expired_at'].setValue(
        this.allProducts[index].expired_at
      );
      this.editOrder.controls['operating_number'].setValue(
        this.allProducts[index].operating_number
      );
    }
    setTimeout(() => {
      let editConfigrationBtn: HTMLElement =
        this.openEditConfigrations.nativeElement;
      editConfigrationBtn.click();
    }, 400);
  }

  openReturnCartModal(event: any) {
    this.getSettings();
    let returnCartModal1: HTMLElement = this.returnCartButton.nativeElement;
    returnCartModal1.click();
    this.returningItemsData = event;
  }
  openCancelReturnModal(event: any) {
    let cancelReturnCartModal1: HTMLElement =
      this.cancelReturnCartButton.nativeElement;
    cancelReturnCartModal1.click();
    this.cancelReturningItemsData = event;
  }
  toCancelReviewedPurchaseId!: number;
  cart_purchase_id!: number;
  openCancelReviewedModal() {
    let cancelReviewedModal: HTMLElement = this.cancelReviewed.nativeElement;
    cancelReviewedModal.click();
  }
  cancleReviewPopupText: string = '';
  checkBeforCancleReview(event: any) {
    this.cart_purchase_id = event.cart_purchase_id;
    const index = this.notReviewed.findIndex(
      (c: any) => c.id == event.product_id
    );
    if (index > -1) {
      if (this.notReviewed[index].status_value == 2) {
        this.cancleReviewPopupText =
          'يرجى العلم انه سيتم الغاء المرتجع المسجل على الصنف لإمكانية الغاء جرده!';
      } else {
        this.cancleReviewPopupText = 'هل أنت متأكد من إلغاء جرد الأصناف ؟';
      }
    } else {
      this.cancleReviewPopupText = 'هل أنت متأكد من إلغاء جرد الأصناف ؟';
    }
    this.openCancelReviewedModal();
  }

  setProductData(productData: any) {
    this.productCode.reset();
    const indexProductId = this.allProducts.findIndex(
      (c: any) => c.id == productData.id
    );
    this.activeProductId = productData.batch_id;
    this.ProductId = productData.id;

    this.productCode.controls['batch_id'].setValue(productData.batch_id);
    if (indexProductId > -1) {
      this.ProductId = productData.id;
      this.cartPurchaseId = productData.cart_purchase_id;
      this.productCode.controls['price'].setValue(
        this.allProducts[indexProductId].price
      );
      this.productCode.controls['barcode'].setValue(
        this.allProducts[indexProductId].barcode
      );
      this.productCode.controls['items_number_in_packet'].setValue(
        this.allProducts[indexProductId].items_number_in_packet
      );
      this.productCode.controls['packets_number_in_package'].setValue(
        this.allProducts[indexProductId].packets_number_in_package
      );
      this.activateQuantity();
    }
  }

  handleBarcodeScan(scannedData: any) {
    this.barcodeBuffer = '';
    this.productCode.controls['barcode'].setValue('');
    this.productCode.controls['quantity'].setValue('');
    this.productCode.controls['barcode'].setValue(scannedData);
    for (let i = 0; i < this.notReviewed.length; i++) {
      const element = this.notReviewed[i];
      if (element.barcode == scannedData) {
        this.ProductId = element.id;
        this.cartPurchaseId = element.cart_purchase_id;
        this.productCode.controls['batch_id'].setValue(element.batch_id);
        this.productCode.controls['price'].setValue(element.price);
        this.productCode.controls['cart_id'].setValue(element.cart_id);
        this.productCode.controls['barcode'].setValue(element.barcode);
        this.productCode.controls['items_number_in_packet'].setValue(
          element.items_number_in_packet
        );
        this.productCode.controls['packets_number_in_package'].setValue(
          element.packets_number_in_package
        );
        break;
      }
    }
    this.activateQuantity();
  }

  barcodeFocus() {
    this.barCode.nativeElement.focus();
  }

  processBarcode(scannedData: any) {
    this.barcodeInput1 = scannedData;
    this.barcodeFocus();
    let param = {};
    param = {
      barcode: scannedData,
    };
    this.subs.add(
      this.http
        .getReq('products/view-by-barcode', { params: param })
        .subscribe({
          next: (res) => {
            this.barcodeFocus();
            this.scannedProduct = res.data;
            this.toastr.info(res.message);
          },
          complete: () => {
            if (this.scannedProduct.length != 0) {
              this.handleBarcodeScan(scannedData);
            } else {
              this.barcodeBuffer = '';
              this.productCode.controls['barcode'].setValue('');
              this.productCode.controls[''];
              this.ProductId = null;
              this.getAllProducts();
              this.editBarcode.controls['barcode'].setValue(scannedData);
              setTimeout(() => {
                this.openCloseBarcode();
              }, 300);
            }
          },
        })
    );
  }

  confirmReview() {
    this.productCode.controls['quantity'].setValue(
      Number(this.productCode.controls['quantity'].value)
    );
    let params: { [key: string]: any } = {};
    let monthValue: string | null = null;
    let yearValue: string | null = null;
    const warehouse_id = this.activeRoute.snapshot.params['warehouse_id'];

    for (const key in this.productCode.value) {
      const value = this.productCode.value[key];
      if (key !== 'barcode' && key !== 'price') {
        if (value !== null && value !== undefined && value !== '') {
          if (key === 'month') {
            monthValue = value;
          } else if (key === 'year') {
            yearValue = value;
          } else {
            params[key] = value;
          }
        }
      }
    }
    if (monthValue && yearValue) {
      const expiredAt = `${yearValue}-${monthValue.padStart(2, '0')}`;
      params['expired_at'] = expiredAt;
    }
    // if (warehouse_id) {
    //     params[ 'warehouse_id' ] = +warehouse_id
    // }
    if (this.ProductId) {
      params['product_id'] = this.ProductId;
    }
    params['cart_purchase_id'] = this.cartPurchaseId;
    // params[ 'purchase_id' ] = this.activeRoute.snapshot.params[ 'id' ];
    // params[ 'supplier_id' ] = this.warehouseFilter.controls[ 'supplier_id' ].value
    if (this.cartPurchaseId) {
      this.subs.add(
        this.http.postReq('purchases/cart/inventorying', params).subscribe({
          next: (res) => {
            this.setData(res.data.inventoried, res?.data?.not_inventoried);
            this.changeActiveTab(this.active_index);
            this.total_purchase_price =
              res.additional_data?.total_purchase_price;
            this.total_non_inventoried_cart_items =
              res.additional_data?.total_non_inventoried_cart_items;
            this.total_inventoried_cart_items =
              res.additional_data?.total_inventoried_cart_items;
          },
          complete: () => {
            // this.notReviewed.forEach((element: any) => {
            //     if (element.barcode == this.productCode.controls[ 'barcode' ].value) {
            //         element.indexOfHighlight = element.indexOfHighlight - 1
            //     }
            // });
            // this.activeProductId = ''
            this.productCode.reset();
            this.activeProductId = '';
            this.ProductId = null;
          },
        })
      );
    }
  }

  setData(inventoried: any, notInventoried: any, allData?: any) {
    this.reviewed = [];
    this.notReviewed = [];
    //loop ofer all order products
    if (allData) {
      allData.forEach((cart: any, index: number) => {
        this.allProducts.push({
          id: cart.product.id,
          cart_purchase_id: cart.id,
          purchases_return_id: cart?.return[0]?.purchases_return_id,
          barcode: cart.product.barcode,
          name: cart.product.name,
          invoice_quantity: cart.ordered_quantity,
          quantity_difference: cart.quantity_difference,
          public_price: cart.public_price,
          price: cart.product.price,
          supply_price: cart.supply_price,
          notes_on_item: cart.note,
          status_value: cart.status.value,
          return: cart?.status.name == 'مرتجع' ? 'مرتجع' : 'الغاء المرتجع',
          items_number_in_packet: cart.product.items_number_in_packet,
          packets_number_in_package: cart.product.packets_number_in_package,
          hasHighlight: false,
        });
      });
    }

    //loop over not inventoried
    notInventoried.forEach((cart: any, index: number) => {
      this.returnStatusInNotReviewed = cart.return.length;

      this.notReviewed.push({
        id: cart.product.id,
        cart_purchase_id: cart.id,
        purchases_return_id: cart?.return[0]?.purchases_return_id,
        purchase_id: this.purchase_id,
        barcode: cart.product.barcode,
        name: cart.product.name,
        inventoried_quantity: cart.inventoried_quantity,
        invoice_quantity: cart.ordered_quantity,
        quantity_difference: cart.quantity_difference,
        public_price: cart.public_price,
        price: cart.product.price,
        supply_price: cart.supply_price,
        notes_on_item: cart.note,
        status_value: cart.status.value,
        return: cart?.status.value != 2 ? 'مرتجع' : 'الغاء المرتجع',
        return_data:
          cart?.status.value == 2 ? { cart_purchase_id: cart.id } : null,
        items_number_in_packet: cart.product.items_number_in_packet,
        packets_number_in_package: cart.product.packets_number_in_package,
        indexOfHighlight: index,
        hasHighlight: true,
      });
    });

    //loop over inventoried
    inventoried.forEach((batch: any) => {
      this.reviewed.push({
        id: batch.product.id,
        batch_purchase_id: batch.id,
        cart_purchase_id: batch.id,
        purchase_id: this.purchase_id,
        name: batch.product.name,
        inventoried_quantity: batch.quantity,
        invoice_quantity: batch.ordered_quantity,
        price: batch.product.price,
        quantity_difference: batch.quantity_difference,
        public_price: batch.public_price,
        supply_price: batch.supply_price,
        notes_on_item: batch.note,
        expiry_operation: batch.expired_at + ' ' + batch.operating_number,
        status_value: batch.status.value,
        return: batch?.return == 0 ? '' : 'الغاء ',
        items_number_in_packet: batch.product.items_number_in_packet,
        packets_number_in_package: batch.product.packets_number_in_package,
      });
    });
  }

  changeBatchData() {
    if (this.editOrder.valid && this.editOrder.dirty) {
      let params: any = {};
      for (const key in this.editOrder.value) {
        const value = this.editOrder.value[key];
        if (key != 'product_name') {
          if (value !== null && value !== undefined && value !== '') {
            if (key == 'expired_at') {
              params[key] = datePipe.transform(
                this.editOrder.controls['expired_at'].value,
                'yyyy-MM-dd'
              );
            } else {
              params[key] = value;
            }
          }
        }
      }
      this.subs.add(
        this.http.postReq('warehouses/batches/duplicate', params).subscribe({
          next: (res) => {},
          complete: () => {
            const index = this.data.findIndex(
              (row: any) =>
                row.batch_id == this.editOrder.controls['batch_id'].value
            );
            if (index > -1) {
              this.data[index].expired_at =
                this.editOrder.controls['expired_at'].value +
                ' ' +
                this.editOrder.controls['operating_number'].value;
            }
            setTimeout(() => {
              let editConfigrationBtn: HTMLElement =
                this.openEditConfigrations.nativeElement;
              editConfigrationBtn.click();
            }, 400);
          },
        })
      );
    } else {
      this.editOrder.markAllAsTouched();
    }
  }
  changeBarecodeData() {
    let params: any = {};
    for (const key in this.editBarcode.value) {
      const value = this.editBarcode.value[key];
      if (key != 'product_id') {
        if (value !== null && value !== undefined && value !== '') {
          params[key] = value;
        }
      }
    }
    this.subs.add(
      this.http
        .postReq(
          `products/update/${this.editBarcode.controls['product_id'].value}`,
          params
        )
        .subscribe({
          next: (res) => {
            this.ProductId = this.editBarcode.controls['product_id'].value;
          },
          complete: () => {
            const index = this.notReviewed.findIndex(
              (c: any) => c.id == this.editBarcode.controls['product_id'].value
            );
            if (index > -1) {
              this.notReviewed[index].barcode = String(
                this.editBarcode.controls['barcode'].value
              );
            }
            this.openCloseBarcode();
            this.barcodeBuffer = '';
            this.productCode.controls['barcode'].setValue('');
          },
        })
    );
  }
  downloadPdfBtn() {
    let el: HTMLElement = this.downloadBtn.nativeElement;
    el.click();
  }
  ReturnReason() {
    let x: LooseObject = {
      cart_purchase_id: this.returningItemsData.cart_purchase_id,
      reason: this.returnsForm.controls['reason'].value,
    };
    for (const [key, value] of Object.entries(x)) {
      if (value === undefined || value === null || value === '') {
        delete x[key];
      }
    }
    this.subs.add(
      this.http.postReq('purchases/returns/reviewer-store', x).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
          // const index = this.notReviewed.findIndex((item: { cart_purchase_id: any; }) => item.cart_purchase_id === (res.data.id));
          // if (index !== -1) {
          //     this.notReviewed[ index ].return_data = { cart_purchase_id: res.data.id };
          // }
          // this.notReviewed = [ ...this.notReviewed ];

          this.setData(res.data.inventoried, res?.data?.not_inventoried);
          this.changeActiveTab(this.active_index);
        },
        complete: () => {},
        error: (err) => {
          this.toastr.error(err.message);
        },
      })
    );
  }
  cancelReturn() {
    let x: LooseObject = {
      cart_purchase_id: this.cancelReturningItemsData.cart_purchase_id,
    };
    for (const [key, value] of Object.entries(x)) {
      if (value === undefined || value === null || value === '') {
        delete x[key];
      }
    }
    this.subs.add(
      this.http
        .getReq('purchases/returns/reviewer-cancel', { params: x })
        .subscribe({
          next: (res) => {
            // const index = this.notReviewed.findIndex((item: { cart_purchase_id: any; }) => item.cart_purchase_id === (res.data.id));
            // if (index !== -1) {
            //     this.notReviewed[ index ].return_data = null;
            //     this.notReviewed[ index ].return = (res.data.status?.value!= 2) ? 'مرتجع' : 'الغاء المرتجع';
            //     // this.notReviewed[ index ].status_value = res.data.status.value;
            // }
            // // this.notReviewed = [ ...this.notReviewed ];
            // console.log(this.notReviewed)

            this.setData(res.data.inventoried, res?.data?.not_inventoried);
            this.changeActiveTab(this.active_index);
          },
          complete() {},
        })
    );
  }

  cancelReviewedItems() {
    let x: LooseObject = {
      cart_purchase_id: this.cart_purchase_id,
    };
    for (const [key, value] of Object.entries(x)) {
      if (value === undefined || value === null || value === '') {
        delete x[key];
      }
    }
    this.subs.add(
      this.http.postReq('purchases/cart/remove-inventoried', x).subscribe({
        next: (res) => {
          // const index = this.reviewed.findIndex((item: { batch_purchase_id: number; }) => item.batch_purchase_id === res.data.id);
          // if (index !== -1) {
          //     this.reviewed.splice(index, 1);
          // }

          // const indexNotReviewed = this.notReviewed.findIndex((item: any) => item.cart_purchase_id === res.data.id)
          // if (indexNotReviewed != -1) {
          //     this.notReviewed[ indexNotReviewed ].inventoried_quantity = res.data.inventoried_quantity
          //     this.notReviewed[ indexNotReviewed ].quantity_difference = res.data.quantity_difference
          // } else {
          //     this.notReviewed.unshift(
          //         {
          //             'id': res.data.product.id,
          //             'cart_purchase_id': res.data.id,
          //             'purchases_return_id': res.data?.return[ 0 ]?.purchases_return_id,
          //             'purchase_id': res.data.id,
          //             'barcode': res.data.product.barcode,
          //             'name': res.data.product.name,
          //             'inventoried_quantity': res.data.inventoried_quantity,
          //             'invoice_quantity': res.data.ordered_quantity,
          //             'quantity_difference': res.data.quantity_difference,
          //             'public_price': res.data.public_price,
          //             'price': res.data.product.price,
          //             'supply_price': res.data.supply_price,
          //             'notes_on_item': res.data.note,
          //             'status_value': res.data.status_value,
          //             'return': (res.data?.return.length == 0) ? 'مرتجع' : 'الغاء المرتجع',
          //             'return_data': (res.data?.return.length > 0) ? res.data.return[ 0 ] : null,
          //             'items_number_in_packet': res.data.product.items_number_in_packet,
          //             'packets_number_in_package': res.data.product.packets_number_in_package,
          //             'indexOfHighlight': index,
          //             'hasHighlight': true
          //         }
          //     )
          // }

          // this.total_inventoried_cart_items = res.data.purchase.total_inventoried_cart_items
          // this.total_non_inventoried_cart_items = res.data.purchase.total_non_inventoried_cart_items
          // this.total_purchase_price = res.data.purchase.total_purchase_price
          this.setData(res.data.inventoried, res?.data?.not_inventoried);
          this.changeActiveTab(this.active_index);
          this.total_purchase_price = res.additional_data?.total_purchase_price;
          this.total_non_inventoried_cart_items =
            res.additional_data?.total_non_inventoried_cart_items;
          this.total_inventoried_cart_items =
            res.additional_data?.total_inventoried_cart_items;
        },
        complete: () => {},
      })
    );
  }

  // finalizeAndPrint() {
  //     let params = {
  //         purchase_id: this.consolidatedObject.purchase_id,
  //         reason: this.returnsForm.controls[ 'global_reason' ].value,
  //     }

  //     params.cart_purchase_ids = params.cart_purchase_ids.filter((cart_purchase_id: any, index: number, self: any[]) => {
  //         const item = this.notReviewed.find((item: { cart_purchase_id: any; }) => item.cart_purchase_id === cart_purchase_id);
  //         return self.indexOf(cart_purchase_id) === index && (!item || item.return_data === null);
  //     });
  //     if (params.cart_purchase_ids.length === 0) {
  //         this.convertToPurchaseInvoice(params.purchase_id);
  //         return;
  //     } else {
  //         this.subs.add(this.http.postReq('purchases/returns/store', params).subscribe({
  //             next: (res) => {
  //             }, complete: () => {
  //                 this.convertToPurchaseInvoice(params.purchase_id)
  //             }
  //         }))
  //     }
  // }
  convertToPurchaseInvoice() {
    let body: any = {
      purchase_id: this.purchase_id,
    };
    let reason = this.returnsForm.controls['global_reason'].value;
    if (
      reason !== null &&
      reason !== undefined &&
      (reason === 0 || reason !== '')
    ) {
      body['reason'] = this.returnsForm.controls['global_reason'].value;
    }
    this.subs.add(
      this.http.postReq('purchases/reviewing', body).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
        },
        complete: () => {
          this.router.navigate([
            '/warehouse/receiving-auditor/supply-order-list',
          ]);
        },
        error: (err) => {},
      })
    );
  }

  ReviewItems() {
    let body: any = {
      purchase_id: this.purchase_id,
    };
    this.subs.add(
      this.http.postReq('purchases/mark-as-reviewed', body).subscribe({
        next: (res) => {
          this.toastr.success(res.message);
        },
        complete: () => {
          this.closeInventingModel();
          this.router.navigate([
            '/warehouse/receiving-auditor/supply-order-list',
          ]);
        },
        error: (err) => {
          this.closeInventingModel();
        },
      })
    );
  }
  @ViewChild('confirmReviewModalBtn')
  confirmReviewModalBtn!: ElementRef<HTMLElement>;
  @ViewChild('closeConfirmReviewModalBtn')
  closeConfirmReviewModalBtn!: ElementRef<HTMLElement>;

  openInventingModel() {
    let confirmReviewModalBtn: HTMLElement =
      this.confirmReviewModalBtn.nativeElement;
    confirmReviewModalBtn.click();
  }
  closeInventingModel() {
    let closeConfirmReviewModalBtn: HTMLElement =
      this.closeConfirmReviewModalBtn.nativeElement;
    closeConfirmReviewModalBtn.click();
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
