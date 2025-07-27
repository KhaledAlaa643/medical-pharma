import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ColumnValue, colSpanArray, columnHeaders } from '@models/tableData';
import { DeleteDataModalService } from '@services/delete-data-modal.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Progress_barService } from '@services/progress_bar.service';
import { ToastrService } from 'ngx-toastr';
import { MenuItem } from 'primeng/api';
import { BehaviorSubject, Subscription, debounceTime } from 'rxjs';

interface FooterData {
  [key: string]: number | string | undefined; // for additional dynamic keys
}

@Component({
  selector: 'app-shared_table',
  templateUrl: './shared_table.component.html',
  styleUrls: ['./shared_table.component.scss'],
  standalone:false
})
export class Shared_tableComponent implements OnInit, OnChanges {
  @Input() columnsArray: columnHeaders[] = [];
  @Input() columnsNames: ColumnValue[] = [];
  @Input() colSpanArray: colSpanArray[] = [];
  @Input() componentSearch: boolean = true;
  @Input() showActionsArray!: boolean;
  @Input() showActionsArrayType!: number;
  @Input() showTotal!: boolean;
  @Input() equalColumns: boolean = false;
  showMore: boolean = false;
  items: MenuItem[] = [];
  @Input() footerData: any[] = [];
  @Input() columnsFooterName: ColumnValue[] = [];
  @Input() RowsData: any = [];
  @Input() resetSort!: boolean;
  @Input() IdToHighlight!: any;
  @Input() ProductToHighlight!: any;
  @Input() scanToHighight!: any;

  searchWord: string = '';

  @Output() sendSearchDataEvent = new EventEmitter<string>();
  @Output() productClickEvent = new EventEmitter<any>();
  @Output() productClickToReview = new EventEmitter<string>();
  @Output() productClickEventOfReturn = new EventEmitter<string>();
  @Output() openModalEvent = new EventEmitter<any>();
  @Output() openModalOfCancelReturnEvent = new EventEmitter<any>();
  @Output() itemChecked = new EventEmitter<number[]>();
  @Output() itemClicked = new EventEmitter<number[]>();

  @Output() deleteEvent = new EventEmitter<any>();
  @Output() navigateEvent = new EventEmitter<any>();
  @Output() dropdownCheck = new EventEmitter<any>();
  @Output() editOrderEvent = new EventEmitter<any>();
  @Output() orderClickEvent = new EventEmitter<any>();
  @Output() supplierNameClickEvent = new EventEmitter<any>();
  @Output() printInvoiceEvent = new EventEmitter<any>();
  @Output() inputChangeEvent = new EventEmitter<any>();

  @Output() sortEvent = new EventEmitter<{ name: string; direction: string }>();

  public sortedColumn: string | null = null;
  private subs = new Subscription();
  batchesIDs: any = [];
  checkedData: any = [];
  activeURL: string = '';
  showBlueBorder: boolean = false;
  isDataInitialized: boolean = false;
  arrayLength: any = null;
  noData: boolean = false;
  selected_supply_request_id!: number;
  selected_shortage_index!: number;
  selected_shortage_id!: number;
  selected_delivery_index!: number;

  ActionsArray: any[] = [
    {
      label: 'طباعة',
      command: () => {
        this.openModal();
      },
    },
    {
      label: 'تعديل',
      command: () => {
        this.editSupplyRequest();
      },
    },
    {
      label: 'عرض',
      command: () => {
        this.viewSupplyRequest();
      },
    },
    {
      label: 'حذف',
      command: () => {
        this.openPopupModel();
      },
    },
  ];
  ActionsArrayNoDelete: any[] = [
    {
      label: 'طباعة',
      command: () => {
        this.openModal();
      },
    },
    {
      label: 'تعديل',
      command: () => {
        this.editSupplyRequest();
      },
    },
    {
      label: 'عرض',
      command: () => {
        this.viewSupplyRequest();
      },
    },
  ];
  ActionsArray1: any[] = [
    {
      label: 'تعديل',
      command: () => {
        this.emitOpenModalEvent({ index: this.selected_shortage_index });
      },
    },

    {
      label: 'الغاء',
      command: () => {
        this.updateActiveStatus();
      },
    },
  ];
  ActionsArray4: any[] = [
    {
      label: 'تعديل',
      command: () => {
        this.emitOpenModalEvent({ index: this.selected_shortage_index });
      },
    },

    {
      label: 'الغاء',
      command: () => {
        this.updateActiveStatusOffers();
      },
    },
  ];
  ActionsArray3: any[] = [
    {
      label: 'تعديل',
      command: () => {
        this.emitOpenModalEvent({ index: this.selected_shortage_index });
      },
    },

    {
      label: 'الغاء',
      command: () => {
        this.updateActiveStatusBonus();
      },
    },
  ];
  ActionsArray2: any[] = [
    {
      label: 'تأجيل',
      command: () => {
        this.emitOpenModalEvent({
          id: this.selected_delivery_index,
          name: 'تأجيل',
        });
      },
    },

    {
      label: 'مرتجع',
      command: () => {
        this.emitOpenModalEvent({
          id: this.selected_delivery_index,
          name: 'مرتجع',
        });
      },
    },
  ];

  updateActiveStatus() {
    let message: string = '';
    let product: any;
    this.subs.add(
      this.http
        .postReq(`products/shortage/${this.selected_shortage_id}/cancel`)
        .subscribe({
          next: (res) => {
            message = res.message;
            product = res.data;
          },
          complete: () => {
            this.toastr.success(message);
            this.RowsData[this.selected_shortage_index] = product;
          },
        })
    );
  }

  updateActiveStatusBonus() {
    let message: string = '';
    let product: any;
    this.subs.add(
      this.http
        .putReq(`products/bonus/${this.selected_shortage_id}/cancel`)
        .subscribe({
          next: (res) => {
            message = res.message;
            product = res.data;
          },
          complete: () => {
            this.toastr.success(message);
            // this.RowsData[this.selected_shortage_index] = product;
          },
        })
    );
  }
  updateActiveStatusOffers() {
    let message: string = '';
    let product: any;
    this.subs.add(
      this.http
        .putReq(`products/offers/${this.selected_shortage_id}/cancel`)
        .subscribe({
          next: (res) => {
            message = res.message;
            product = res.data;
          },
          complete: () => {
            this.toastr.success(message);
            // this.RowsData[this.selected_shortage_index] = product;
          },
        })
    );
  }

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private printService: PrintService,
    private http: HttpService,
    public loaderService: Progress_barService,
    public deleteDataModalService: DeleteDataModalService
  ) {}

  checkedDataReview: any = [];
  ngOnChanges(changes: SimpleChanges) {
    if (this.resetSort == true) {
      this.columnsArray.forEach((col) => {
        col.direction = null;
      });
    }
    this.checkedData = [];
    if (changes['RowsData']) {
      const currentArray = changes['RowsData'].currentValue;
      this.arrayLength = currentArray ? currentArray.length : 0;

      // this.isDataInitialized=true

      this.RowsData?.forEach((item: any) => {
        if (item?.checked == true) {
          this.checkedData.push(item);
        }
      });
      this.RowsData?.forEach((item: any) => {
        if (item?.completed_at == true) {
          this.checkedDataReview.push(item);
        }
      });
    }
    if (changes['RowsData'] && changes['RowsData'].currentValue) {
      this.isDataInitialized = true;
      this.RowsData.forEach((item: any) => {
        if (typeof item.checked === 'undefined') {
          item.checked = false;
        }
        if (typeof item.uncheckedBoxValue === 'undefined') {
          item.unchecked = false;
        }
        if (typeof item.statusChecked === 'undefined') {
          item.statusChecked = false;
        }

        //2 checked
        //1 unchecked
        const index = this.batchesIDs.findIndex(
          (c: any) => c.batch_id === item.id
        );
        if (!item.completed_at && !item.checked && index == -1)
          this.batchesIDs.push({
            batch_id: item.id,
            status: item.statusChecked ? 2 : 1,
            cart_id: item.cart_id,
          });
      });
      this.dropdownCheck.emit(this.batchesIDs);
    }
  }

  ngOnInit() {
    this.activeURL = this.router.url;
    if (
      this.activeURL.includes('/single-products-reviewer') ||
      this.activeURL.includes('/bulk-products-reviewer')
    ) {
      this.showBlueBorder = true;
    }
  }

  searchInput$ = new BehaviorSubject('');
  emitSearchData() {
    if (this.componentSearch) {
      this.subs.add(
        this.searchInput$.pipe(debounceTime(2000)).subscribe({
          next: () => {
            let searchParam =
              this.searchWord.length == 0 ? '' : this.searchWord;
            return this.router.navigate([], {
              queryParams: { page: 1, product_name: searchParam },
              queryParamsHandling: 'merge',
            });
          },
          complete: () => {},
        })
      );
      this.searchInput$.next(this.searchWord);
    }
    this.sendSearchDataEvent.emit(this.searchWord);
  }
  emitProductId(productId: any) {
    this.productClickEvent.emit(productId);
  }
  emitProductData(productData: any) {
    this.productClickEvent.emit(productData);
  }
  emitOpenModalEvent(data?: any) {
    this.openModalEvent.emit(data);
  }
  emitDeleteEvent(id?: number) {
    this.deleteEvent.emit(id);
  }
  emitnavigatEvent(data?: number) {
    this.navigateEvent.emit(data);
  }
  emitItemClickEvent(data?: any) {
    this.itemClicked.emit(data);
  }
  emitSupplierClickEvent(data: any) {
    this.supplierNameClickEvent.emit(data);
  }

  emitReviewProducts(toReviewProduct: any) {
    this.productClickToReview.emit(toReviewProduct);
  }
  // this method is used for a special case where two button are in the same type and it is required
  // to emit toe each button without having to emit to both buttons
  // in SupplyOrderDetails in receiving-auditor.
  emitProductDataOfReturn(productData: any) {
    this.productClickEventOfReturn.emit(productData);
  }

  // this method is used for a special case where the cancel  button is in the same table and it is required
  // to emit to each button without having to emit to both buttons
  // in SupplyOrderDetails in receiving-auditor.
  emitCancelReturnModal(returnData: any) {
    this.openModalOfCancelReturnEvent.emit(returnData);
  }
  orderClickEventEmit(data: string) {
    this.orderClickEvent.emit(data);
  }

  sortColumn(column: columnHeaders, index: number): void {
    this.resetSort = false;
    if (!column.sort) {
      return;
    }
    if (this.sortedColumn === this.columnsNames[index].name) {
      column.direction = column.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedColumn = this.columnsNames[index].name;
      column.direction = 'asc';
    }

    this.columnsArray.forEach((col) => {
      if (col.name !== column.name) {
        col.direction = null;
      }
    });
    this.sortEvent.emit({
      name: this.sortedColumn,
      direction: column.direction,
    });
  }

  onStatusCheckboxChange(i: any) {
    let batch_id = this.RowsData[i].id;
    const index = this.batchesIDs.findIndex((c: any) => c.batch_id == batch_id);
    if (index > -1) {
      if (this.batchesIDs[index].status == 1) {
        this.batchesIDs[index].status = 2;
      } else {
        this.batchesIDs[index].status = 1;
      }
    }
    this.dropdownCheck.emit(this.batchesIDs);
  }
  onOrderCheckboxChange(i: any) {
    let order_id = this.RowsData[i].order_id;
    let index = this.checkedIds.indexOf(order_id);

    if (index !== -1) {
      this.checkedIds.splice(index, 1);
    } else {
      this.checkedIds.push(order_id);
    }
    console.log(this.checkedIds);
    this.itemChecked.emit(this.checkedIds);
  }
  checkedIds: any = [];

  onUncheckedCheckboxChange(item: any) {
    if (item.unchecked) {
      if (!this.checkedIds.includes(item.id)) {
        this.checkedIds.push({
          batch_id: item.id,
          purchase_id: item.purchase_id,
        });
      }
    } else {
      const index = this.checkedIds.indexOf({
        batch_id: item.id,
        purchase_id: item.purchase_id,
      });
      if (index > -1) {
        this.checkedIds.splice(index, 1);
      }
    }
    this.itemChecked.emit(this.checkedIds);
  }

  emitAllOrdersEvent(eventType: any, orderNumber?: any, pharmacyId?: number) {
    if (eventType == 'orderDetailsEventEmit') {
      let data: any = {
        pharmacyId: pharmacyId,
        orderNumber: orderNumber,
      };
      this.productClickEvent.emit(data);
    } else if (eventType == 'editOrderEvent') {
      this.editOrderEvent.emit(orderNumber);
    }
  }

  // Action Area
  performAction(action: any, rowData: any) {
    switch (action.action) {
      case 'edit':
        // Navigate to edit route
        this.router.navigate([
          action.route.path,
          rowData[action.route.attribute],
        ]);
        break;
      case 'delete':
        // Open delete confirmation modal
        // this.openDeleteModal(rowData[action.route.attribute]);
        break;
      case 'view':
        // Navigate to view route
        this.router.navigate([
          action.route.path,
          rowData[action.route.attribute],
        ]);
        break;
      default:
        console.error('Action not supported:', action.action);
    }
  }
  dropdownOpen: any[] = [];
  toggleDropdown(index: number) {
    this.dropdownOpen = this.dropdownOpen.map((state, i) =>
      i === index ? !state : false
    );
  }

  supply_request_content: any = [];
  printSupplyRequest(printData: any) {
    let supplyColumnsArray: columnHeaders[] = [
      {
        name: 'اسم الصنف',
      },
      {
        name: 'رقم التشغيلة',
      },
      {
        name: 'التاريخ والتشغيلة',
      },
      {
        name: 'الكمية',
      },
      {
        name: 'السعر',
      },
      {
        name: 'الخصم',
      },
      {
        name: 'الضريبة',
      },
      {
        name: 'الصافي',
      },
      {
        name: 'الملاحظات',
      },
    ];
    let supplyColumnsName: ColumnValue[] = [
      {
        name: 'product_name',
        type: 'normal',
      },
      {
        name: 'operating_number',
        type: 'normal',
      },
      {
        name: 'expired_operating',
        type: 'normal',
      },
      {
        name: 'quantity',
        type: 'normal',
      },
      {
        name: 'price',
        type: 'normal',
      },
      {
        name: 'discount',
        type: 'normal',
      },
      {
        name: 'taxes',
        type: 'normal',
      },
      {
        name: 'total',
        type: 'normal',
      },
      {
        name: 'note',
        type: 'normal',
      },
    ];
    let param = {
      purchase_id: this.selected_supply_request_id,
    };
    if (this.selected_supply_request_id) {
      this.subs.add(
        this.http
          .getReq('purchases/supply-request/get-cart-items', { params: param })
          .subscribe({
            next: (res) => {
              this.supply_request_content = [];
              res.data.cart.forEach((item: any) => {
                this.supply_request_content.push({
                  product_name: item.product.name,
                  note: item.note,
                  operating_number: item.operating_number,
                  order_note: res.data.note,
                  expired_operating: item?.expired_at,
                  quantity: item?.quantity,
                  price: item.product.price,
                  discount: item.discount,
                  taxes: item.taxes,
                  total: item.total,
                  supplier: res.data.supplier.name,
                  warehouse: res.data.warehouse.name,
                  total_cart_items: res.additional_data.total_products,
                  total_price: res.additional_data.total_public_price,
                  total_tax: res.additional_data?.total_taxes,
                  total_supply_price: res.additional_data.total_supply_price,
                });
              });
            },
            complete: () => {
              localStorage.setItem('showFooter', JSON.stringify(1));
              this.printService.setColumnsArray(supplyColumnsArray);
              this.printService.setColumnsNames(supplyColumnsName);
              this.printService.setRowsData(this.supply_request_content);

              if (printData.type == 1) {
                this.printService.downloadPDF();
              } else {
                this.printService.downloadCSV();
              }
              setTimeout(() => {
                this.openModal();
              }, 100);
            },
            error: () => {
              setTimeout(() => {
                this.openModal();
              }, 100);
            },
          })
      );
    }
  }
  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }
  editSupplyRequest() {
    const index = this.RowsData.findIndex(
      (c: any) => c.id == this.selected_supply_request_id
    );
    if (index > -1) {
      if (
        this.RowsData[index].status_id == 2 ||
        this.RowsData[index].status_id == 3
      ) {
        this.router.navigate([
          '/purchases/supply/edit/supply-request/' +
            this.selected_supply_request_id,
        ]);
      } else if (this.RowsData[index].status_id == 1) {
        this.router.navigate([
          `/purchases/supply/edit/${this.selected_supply_request_id}/supply-request`,
        ]);
      } else {
        this.toastr.error('هذا الطلب لا يمكن التعديل علية');
      }
    }
  }
  viewSupplyRequest() {
    this.router.navigate([
      '/purchases/supply/view/supply-request/' +
        this.selected_supply_request_id,
    ]);
  }
  updates: boolean = true;
  deleteSupplyRequest() {
    let message: string = '';
    let all_params = {
      purchase_id: this.selected_supply_request_id,
    };
    this.subs.add(
      this.http
        .deleteReq('purchases/supply-request/delete-all-cart', {
          params: all_params,
        })
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            let index = this.RowsData.findIndex(
              (c: any) => c.id == this.selected_supply_request_id
            );
            if (index > -1) {
              this.RowsData.splice(index, 1);
            }
            this.toastr.success(message);
            this.closePopupModel();
            this.updates = !this.updates;
            this.router.navigate([], { queryParams: { update: this.updates } });
          },
          error: () => {
            this.closePopupModel();
          },
        })
    );
  }

  @ViewChild('OpenModalBtn') OpenModalBtn!: ElementRef<HTMLElement>;
  @ViewChild('closeModalBtn') closeModalBtn!: ElementRef<HTMLElement>;

  openPopupModel() {
    let el: HTMLElement = this.OpenModalBtn.nativeElement;
    el.click();
  }
  closePopupModel() {
    let el: HTMLElement = this.closeModalBtn.nativeElement;
    el.click();
  }

  onInputChanged(data: any) {
    this.inputChangeEvent.emit({
      input_text: data.input_text,
      index: data.index,
    });
  }
}
