import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { product_dropdown, products } from '@models/products';
import { HttpService } from '@services/http.service';
import { Paginator } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import readXlsxFile from 'read-excel-file';
import { excel_locations } from '@models/excel';
import { GeneralService } from '@services/general.service';
import { supplier, suppliers } from '@models/suppliers';
import { LooseObject } from '@models/LooseObject';
import { formatDate } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { commonObject } from '@models/settign-enums';
import { AuthService } from '@services/auth.service';
import * as XLSX from 'xlsx';

export interface supplier_data {
  inputValue: string;
  supplier_product_id: number;
  product_id: number | string;
  isDisabled: boolean;
}
type Cell = string | number | Date | null;
@Component({
  selector: 'app-product-linking',
  templateUrl: './product-linking.component.html',
  styleUrls: ['./product-linking.component.scss'],
})
export class ProductLinkingComponent implements OnInit {
  private subscription = new Subscription();
  products: product_dropdown[] = [];
  suppliers: supplier[] = [];
  status: commonObject[] = [];
  supplier: supplier = {} as supplier;
  activeTap: number = 1;
  isShow: boolean = true;
  showDropdowns: boolean = false;
  showRequiredSupplier: boolean = false;
  showRequiredPharmacy: boolean = false;
  // supplier_products: any[] = Array(30).fill({ inputValue: '', dropdownValue: '',isDisabled:true });
  excelLocations: excel_locations = {} as excel_locations;
  formDataPayLoad = new FormData();
  savedPages: { page: number; saved: boolean }[] = [];

  // supplier_products_connected: supplier_data[] = []
  supplier_products_connected_prev: supplier_data[] = [];
  // supplier_products_not_connected: supplier_data[] = []
  supplier_products: supplier_data[] = [];
  // supplier_products: supplier_data[] = Array.from({ length: 30 }, () => ({
  //   inputValue: '',
  //   dropdownValue: '',
  //   isDisabled: true
  // }));
  // pagination data
  page: number = 1;
  rows!: number;
  total!: number;

  //totals
  total_products: number = 0;
  total_linked: number = 0;
  total_unlinked: number = 0;

  //popup
  cancle_button_name!: string;
  ok_button_name!: string;
  popupMessage!: string;

  file_id: number = 0;

  pharmacies: any;
  type: string = 'supplier';
  pharmacy: supplier = {} as supplier;

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkWindowWidth();
  }

  checkWindowWidth(): void {
    const width = window.innerWidth;
    this.isShow = width > 768;
    // grater that 768 => this.isShow=true => show first
    // less that 768 => this.isShow=false => show secound
  }

  constructor(
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpService,
    private generalService: GeneralService,
    private ActivatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.getDropdownData();
    this.file_id = Number(this.ActivatedRoute.snapshot.paramMap.get('file_id'));
    if (this.file_id != 0) {
      this.scanFile();
    }
  }

  @ViewChild('paginator') paginator!: Paginator;
  processingPageChange: boolean = false; // Flag to avoid infinite loops

  updateCurrentPage(currentPage: number): void {
    this.processingPageChange = true;
    setTimeout(() => this.paginator.changePage(currentPage), 0);
  }

  changePage(event: any) {
    if (this.page != event.page + 1) {
      if (this.processingPageChange) {
        this.processingPageChange = false;
        return;
      }

      let isEmpty = false;
      this.supplier_products.forEach((product: any) => {
        if (product.product_id == '' || product.product_id == null) {
          this.openModel(3);
          isEmpty = true;
          return;
        }
      });
      if (!isEmpty) {
        if (this.activeTap == 1) {
          if (this.savedPages[this.page - 1].saved) {
            this.page = event.page + 1;
            this.router.navigate([], {
              queryParams: { page: this.page },
              queryParamsHandling: 'merge',
            });
            this.getSupplierProducts(
              this.activeTap == 1
                ? [this.status[0].value]
                : [this.status[1].value, this.status[2].value]
            );
          } else {
            this.openModel(2);
            return;
          }
        } else {
          if (
            this.checkEqual(
              this.supplier_products_connected_prev,
              this.supplier_products
            )
          ) {
            this.page = event.page + 1;
            this.router.navigate([], {
              queryParams: { page: this.page },
              queryParamsHandling: 'merge',
            });
            this.getSupplierProducts(
              this.activeTap == 1
                ? [this.status[0].value]
                : [this.status[1].value, this.status[2].value]
            );
          } else {
            this.openModel(2);
            return;
          }
        }
      } else {
        this.updateCurrentPage(this.page - 1);
      }
    }
  }

  //popup events handling
  Popupevent(event: any) {
    if (this.popupType == 2) {
      if (event.ok == true) {
        this.handleSave();
      } else {
        if (!this.savedPages[this.page - 1].saved) {
          this.updateCurrentPage(this.page - 1);
        }
      }
    }
  }
  handleSave() {
    let filterData = new FormData();
    if (this.activeTap == 1) {
      this.supplier_products.forEach(
        (product: supplier_data, index: number) => {
          // filterData[`products[${index}][supplier_product_id]`] = product.supplier_product_id
          // filterData[`products[${index}][not_assigned]`] = product.product_id==''? 1 : undefined
          // filterData[`products[${index}][product_id]`] = product.product_id!=''? product.product_id : undefined
          filterData.append(
            `products[${index}][supplier_product_id]`,
            String(product.supplier_product_id)
          );
          if (product.product_id == 'null') {
            filterData.append(`products[${index}][not_assigned]`, String(1));
          } else {
            filterData.append(
              `products[${index}][product_id]`,
              String(product.product_id)
            );
          }
        }
      );
    } else {
      for (let i = 0; i < this.supplier_products.length; i++) {
        if (
          this.supplier_products_connected_prev[i].product_id !=
          this.supplier_products[i].product_id
        ) {
          filterData.append(
            `products[${i}][supplier_product_id]`,
            String(this.supplier_products[i].supplier_product_id)
          );
          if (this.supplier_products[i].product_id == 'null') {
            filterData.append(`products[${i}][not_assigned]`, String(1));
          } else {
            filterData.append(
              `products[${i}][product_id]`,
              String(this.supplier_products[i].product_id)
            );
          }
        }
      }
    }
    // filterData[`supplier_file_id`] = this.supplier_file_id
    filterData.append(`supplier_file_id`, String(this.supplier_file_id));

    this.subscription.add(
      this.http
        .postReq('purchases/supplier-products/compare-products', filterData)
        .subscribe({
          next: (res) => {
            this.total_products = res.data.file_products_num;
            this.total_linked =
              res.data.compared_products_num +
              res.data.prev_compared_products_num;
            this.total_unlinked = res.data.not_compared_products_num;
          },
          complete: () => {
            this.savedPages[this.page - 1].saved = true;
            this.updateCurrentPage(this.page);
            this.supplier_products.forEach((product) => {
              product.isDisabled = this.activeTap === 2;
            });
            this.getSupplierProducts(
              this.activeTap == 1
                ? [this.status[0].value]
                : [this.status[1].value, this.status[2].value]
            );
          },
        })
    );
  }

  @ViewChild('popupModalOpen') popupModalOpen!: ElementRef<HTMLElement>;
  @ViewChild('confirmFilePopupModalOpen')
  confirmFilePopupModalOpen!: ElementRef<HTMLElement>;
  @ViewChild('errorPopupModalOpen')
  errorPopupModalOpen!: ElementRef<HTMLElement>;
  hover_ok!: boolean;
  popupType!: number;
  openModel(type: number) {
    this.hover_ok = false;
    if (type == 1) {
      this.popupType = 1;
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'حفظ';
      this.popupMessage = 'هل انت متأكد من انهاء طلب المقارنة!';
    } else if (type == 2) {
      this.popupType = 2;
      this.popupMessage = 'هل انت متأكد من حفظ مقارنة الاصناف.';
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = 'حفظ';
    } else {
      this.popupType = 3;
      this.popupMessage =
        'يرجى ربط الاصناف التي في الصفحة الغير مربوطة بأصناف لدينا!';
      this.cancle_button_name = 'الغاء';
      this.ok_button_name = '';
    }
    if (type != 2) {
      let el: HTMLElement = this.popupModalOpen.nativeElement;
      el.click();
      // setTimeout(() => {
      //   this.hover_ok=true
      // }, 500);
    } else {
      if (
        !this.checkEqual(
          this.supplier_products_connected_prev,
          this.supplier_products
        )
      ) {
        let el: HTMLElement = this.popupModalOpen.nativeElement;
        el.click();
      } else {
        this.toastr.error('no data updated');
      }
    }

    setTimeout(() => {
      this.hover_ok = true;
    }, 1000);
  }

  @ViewChild('confirmPagePopupModalClose')
  confirmPagePopupModalClose!: ElementRef<HTMLElement>;
  @ViewChild('confirmFilePopupModalClose')
  confirmFilePopupModalClose!: ElementRef<HTMLElement>;
  @ViewChild('errorPopupModalClose')
  errorPopupModalClose!: ElementRef<HTMLElement>;
  closeModal(type: string) {
    let el: HTMLElement = this.confirmPagePopupModalClose.nativeElement;
    el.click();
  }

  enableDropdown(product_index: any) {
    if (this.activeTap == 2) {
      this.supplier_products[product_index].isDisabled = false;
    }
  }
  changeTab(tab_number: number) {
    this.activeTap = tab_number;
    this.page = 1;
    this.getSupplierProducts(
      this.activeTap == 1
        ? [this.status[0].value]
        : [this.status[1].value, this.status[2].value]
    );
    this.supplier_products.forEach((product) => {
      product.isDisabled = this.activeTap === 2;
    });
  }

  goToNext(dropdown: any, currentIndex: number) {
    let nextIndex = currentIndex + 1;
    if (nextIndex >= this.supplier_products.length) {
      if (!dropdown.overlayVisible) {
        this.focusSave();
      }
    } else {
      if (!dropdown.overlayVisible) {
        const nextDropdown = document.getElementById(
          String(`dropdown-${nextIndex}`)
        ) as HTMLElement;
        if (nextDropdown) {
          const hiddenInput = nextDropdown.querySelector(
            'input'
          ) as HTMLElement;
          if (hiddenInput) {
            hiddenInput.focus();
          }
        }
      }
    }
  }
  getDropdownData() {
    //products
    this.subscription.add(
      this.http.getReq('products/dropdown').subscribe({
        next: (res) => {
          this.products = res.data;
          this.products.splice(0, 0, { id: 'null', name: 'غير مسجل' });
          this.products = this.products.map((obj: any) => {
            return {
              name: obj.name,
              id: obj.id,
              disabled: false,
            };
          });
        },
      })
    );
    this.subscription.add(
      this.http.getReq('pharmacies/dropdown').subscribe({
        next: (res) => {
          this.pharmacies = res.data;
        },
      })
    );
    //suppliers
    this.subscription.add(
      this.generalService.getDropdownData(['suppliers']).subscribe({
        next: (res) => {
          this.suppliers = res.data.suppliers;
        },
      })
    );
    // this.subscription.add(this.generalService.getSettingsEnum().subscribe({
    //   next: res => {
    //     this.status = res.data.supplier_product_status
    //   }
    // }))

    this.status = this.auth.getEnums().supplier_product_status;
  }
  supplier_file_id!: number;
  disableInputs: boolean = false;
  fileName: string = '';
  //get data for first time
  @ViewChild('fileInput') fileInput!: ElementRef;
  scanFile() {
    let url = '';
    let params: any = {};
    this.formDataPayLoad = new FormData();
    if (this.file_id != 0) {
      //when navigate from listing page
      url = 'purchases/supplier-products/report/details';
      params = {
        file_id: this.file_id,
        'status[0]': 0,
      };
    } else {
      //set data for first time file uploaded
      url = 'purchases/supplier-products/import-excel';
      this.formDataPayLoad.append(
        'name_location',
        this.excelLocations.name_location
      );
      this.formDataPayLoad.append(
        'price_location',
        this.excelLocations.price_location
      );
      this.formDataPayLoad.append(
        'discount_location',
        this.excelLocations.discount_location
      );
      this.formDataPayLoad.append('page', String(this.page));
      this.formDataPayLoad.append('file', this.file);

      if (this.type === 'supplier') {
        this.formDataPayLoad.append('supplier_id', String(this.supplier.id));
        this.formDataPayLoad.append('is_supplier', String(1));
      } else if (this.type === 'client') {
        this.formDataPayLoad.append('pharmacy_id', String(this.pharmacy.id));
        this.formDataPayLoad.append('is_supplier', String(0));
      }
    }
    const httpObservable =
      this.file_id != 0
        ? this.http.getReq(url, { params: params })
        : this.http.postReq(url, this.formDataPayLoad);

    this.subscription.add(
      httpObservable.subscribe({
        next: (res) => {
          this.supplier_products = [];
          res.data.forEach((object: any) => {
            if (object.status?.value == 0) {
              this.supplier_products.push({
                inputValue: object.name,
                supplier_product_id: object?.supplier_product_id,
                product_id:
                  object.status?.value == 2 ? 'null' : object.product?.id,
                isDisabled: this.activeTap == 1 ? false : true,
              });
            }
          });

          this.rows = res.meta.per_page;
          this.total = res.meta.total;

          //  this.savedPages=Array().fill({page})
          for (let i = 1; i <= res.meta.last_page; i++) {
            this.savedPages.push({
              page: i,
              saved: false,
            });
          }

          this.fileName = res.additional_data.supplier_file_name;
          this.total_products = res.additional_data.total;
          this.total_linked = res.additional_data.compared;
          this.total_unlinked = res.additional_data.not_compared;
          this.supplier_file_id = res.additional_data.supplier_file_id;
          this.supplier.id = res.data[0]?.supplier?.supplier_id;
        },
        complete: () => {
          this.showDropdowns = true;
          this.disableInputs = true;
          this.closeLinkModal();
        },
        error: () => {
          this.fileInput.nativeElement.value = '';
          this.file = '';
          this.selectedOptions = {};
          this.closeLinkModal();
        },
      })
    );
  }
  //to get data when change tabs
  getSupplierProducts(status: any) {
    let parameters: LooseObject = {};
    parameters = {
      file_id: this.supplier_file_id,
      page: this.page,
    };
    status.forEach((c: any, index: number) => {
      parameters[`status[${index}]`] = c;
    });
    this.subscription.add(
      this.http
        .getReq('purchases/supplier-products/get-by-status', {
          params: parameters,
        })
        .subscribe({
          next: (res) => {
            this.supplier_products = [];
            res.data.forEach((object: any) => {
              this.supplier_products.push({
                inputValue: object.name,
                supplier_product_id: object?.supplier_product_id,
                product_id:
                  object.status?.value == 2 ? 'null' : object.product?.id,
                isDisabled: this.activeTap == 1 ? false : true,
              });
            });

            this.rows = res.meta.per_page;
            this.total = res.meta.total;
          },
          complete: () => {
            if (status.length > 1) {
              this.supplier_products_connected_prev = JSON.parse(
                JSON.stringify(this.supplier_products)
              );
            }
            this.showDropdowns = true;
          },
        })
    );
  }

  @ViewChild('saveBtn') saveBtn!: ElementRef<HTMLElement>;

  focusSave() {
    this.saveBtn.nativeElement.focus();
  }

  viewLinkHeaders: boolean = false;
  
  fileHeaders: { name: Cell; value: string; disabled: boolean }[] = [];
  file: any;
  // fileUpload(event: any) {
  //   this.selectedOptions = {};

  //   this.excelLocations = {} as excel_locations;
  //   this.file = event.target.files[0];

  //   this.viewLinkHeaders = true;
  //   readXlsxFile(this.file).then((rows) => {
  //     if (rows.length === 0) {
  //       console.error('Excel file is empty or missing header row');
  //       return;
  //     }
  //     let headers=[]
  //     headers = rows[0].map((header, index) => {
  //       const columnLabel = this.columnLabel(index);
  //       return {
  //         name: header ? `${columnLabel}-${header}` : `${columnLabel}-`,
  //         value: columnLabel,
  //         disabled:false
  //       };
  //     }).filter((headerObj) => headerObj.name !== null);
  //     this.fileHeaders=[]
  //     this.fileHeaders = headers;
  //     setTimeout(() => {
  //       if(this.supplier.id){
  //         this.openLinkModal()
  //       }
  //       else{
  //         this.showRequiredSupplier=true
  //         this.fileInput.nativeElement.value = '';
  //         this.file=''
  //       }
  //     }, 100);
  //   });
  // }

  fileUpload(event: any) {
    this.selectedOptions = {};
    this.excelLocations = {} as excel_locations;

    this.file = event.target.files[0];

    this.viewLinkHeaders = true;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rows: any = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Get rows as arrays

        if (rows.length === 0) {
          console.error('Excel file is empty or missing header row');
          return;
        }

        // Extract headers from the first row
        const headers = rows[0]
          .map((header: string, index: number) => {
            const columnLabel = this.columnLabel(index); // Custom column labeling function
            return {
              name: header ? `${columnLabel}-${header}` : `${columnLabel}-`,
              value: columnLabel,
              disabled: false,
            };
          })
          .filter((headerObj: any) => headerObj.name !== null);

        this.fileHeaders = headers; // Store the headers

        setTimeout(() => {
          console.log(this.supplier.id, this.pharmacy.id);
          if (this.supplier.id || this.pharmacy.id) {
            this.openLinkModal();
          } else {
            this.showRequiredSupplier = true;
            this.showRequiredPharmacy = true;
            this.fileInput.nativeElement.value = '';
            this.file = '';
          }
        }, 100);
      } catch (error) {
        console.error('Error processing file:', error);
        alert(
          'Failed to process the file. Please ensure it is a valid .xlsx file.'
        );
      }
    };

    reader.readAsArrayBuffer(this.file); // Read the file as ArrayBuffer
  }

  columnLabel(index: number): string {
    let label = '';
    let base = 26; // Number of letters in the English alphabet
    let tempIndex = index;

    do {
      label = String.fromCharCode(65 + (tempIndex % base)) + label;
      tempIndex = Math.floor(tempIndex / base) - 1;
    } while (tempIndex >= 0);

    return label;
  }
  linkHeaders() {}

  @ViewChild('closeLinkModal') closeLinkModalBtn!: ElementRef<HTMLElement>;
  @ViewChild('openLinkModal') openLinkModalBtn!: ElementRef<HTMLElement>;

  closeLinkModal() {
    let el: HTMLElement = this.closeLinkModalBtn.nativeElement;
    el.click();
  }
  openLinkModal() {
    let el: HTMLElement = this.openLinkModalBtn.nativeElement;
    el.click();
  }

  saveProgress() {
    let isEmpty: boolean = false;
    this.supplier_products.forEach((product: any) => {
      if (product.product_id == null) {
        this.openModel(3);
        isEmpty = true;
        return;
      }
    });
    if (!isEmpty) {
      this.openModel(2);
      setTimeout(() => {
        this.hover_ok = true;
      }, 1000);
    }
  }

  checkEqual(array1: supplier_data[], array2: supplier_data[]): boolean {
    if (array1.length !== array2.length) {
      return false;
    }
    for (let i = 0; i < array1.length; i++) {
      if (array1[i].product_id != array2[i].product_id) {
        return false;
      }
    }
    return true;
  }

  selectedOptions: LooseObject = {};
  disableSelected(key: string, value: string) {
    this.selectedOptions[key] = value;

    this.fileHeaders.forEach((header: any) => {
      if (
        this.selectedOptions['name_location'] == header.value ||
        this.selectedOptions['price_location'] == header.value ||
        this.selectedOptions['discount_location'] == header.value
      ) {
        header.disabled = true;
      } else {
        header.disabled = false;
      }
    });
  }
  selectedProductId: number[] = [];
  disableSelectedProduct(product_id: any) {
    //null => غير مسجل
    if (product_id != 'null') {
      this.products = this.products.map((obj: any) => {
        return {
          name: obj.name,
          id: obj.id,
          disabled: false,
        };
      });

      this.supplier_products.forEach((selectedProduct: any) => {
        if (selectedProduct.product_id != 'null') {
          let selected_product = this.products.find(
            (product: any) => product.id == selectedProduct.product_id
          );
          if (selected_product) {
            selected_product.disabled = true;
          }
        }
      });
    }
  }

  checkSupplier() {
    if (this.supplier.id) {
      this.showRequiredSupplier = false;
    } else {
      this.showRequiredSupplier = true;
    }
  }
  checkPharmacy() {
    if (this.pharmacy.id) {
      this.showRequiredPharmacy = false;
    } else {
      this.showRequiredPharmacy = true;
    }
  }

  @ViewChild('typeModel') typeModel!: ElementRef<HTMLElement>;

  openClinetPopup() {
    this.typeModel.nativeElement.click();
  }
}
