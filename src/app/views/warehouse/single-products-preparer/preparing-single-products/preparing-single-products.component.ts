import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { invoice, order } from '@models/order';
import { warehouses } from '@models/products';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToggleModal } from '@services/toggleModal.service';
import { WebSocketService } from '@services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-preparing-single-products',
  templateUrl: './preparing-single-products.component.html',
  styleUrls: ['./preparing-single-products.component.scss'],
})
export class PreparingSingleProducts implements OnInit, OnDestroy {
  basketSearch!: FormGroup;
  warehouseFilter!: FormGroup;
  addNewBasketNumber!: FormGroup;
  isActiveTapArray: boolean[] = Array(6).fill(false);
  @ViewChild('AddModal') AddModal!: ElementRef<HTMLElement>;
  showModal: boolean = false;
  allInvoices: invoice[] = [];
  private subs = new Subscription();
  total: number = 0;
  orderContentList: order[] = [];
  invoiceId!: number;
  allOrderContentData: any;
  OrderContentListNumber!: number;
  batchIDs: number[] = [];
  corridorNumber!: number;
  usedBaskets: { id: number; number: number }[] = [];
  batchStatus: { id: number; status: number; cart_id?: number }[] = [];
  corridorsUsed: {
    id: number;
    number: any;
    color: string;
    is_main_corridor: boolean;
    count: number;
  }[] = [];
  basketsByCorridor: { corridor: string; baskets: number[] }[] = [];
  currentCorridorID!: number;
  itemsCount!: number;
  warehouses: warehouses[] = [];
  bulkId!: number;
  multiple_corridors_enabled!: string;

  columnsArrayAll: columnHeaders[] = [
    {
      name: ' مسلسل',
    },
    {
      name: 'وقت و تاريخ غلق الأذن ',
    },
    {
      name: '  اسم العميل  ',
    },
    {
      name: ' رقم اذن ',
    },
    {
      name: 'محتويات الأذن ',
    },
  ];
  columnsNameAll: ColumnValue[] = [
    {
      name: 'number',
      type: 'normal',
    },
    {
      name: 'closed_at',
      type: 'normal',
    },
    {
      name: 'PharmacyName',
      type: 'normal',
    },
    {
      name: 'order_number',
      type: 'normal',
    },
    {
      name: 'order_contents',
      type: 'order_content',
    },
  ];
  columnsArrayPopup: columnHeaders[] = [
    {
      name: ' تحديد',
    },
    {
      name: ' مسلسل ',
    },
    {
      name: 'موقع الصنف',
      sort: true,
      direction: null,
    },
    {
      name: '  الاسم عربي ',
      sort: true,
      direction: null,
    },
    {
      name: '    الصلاحية والتشغيلة',
    },
    {
      name: ' الكمية المطلوبة ',
    },
    {
      name: 'السعر',
    },
    {
      name: ' الشركة المصنعه',
    },
    {
      name: ' باكت ',
    },
    {
      name: ' كرتونة ',
    },
  ];
  columnsNamePopup: ColumnValue[] = [
    {
      name: 'checkbox',
      type: 'checkbox',
    },
    {
      name: 'number',
      type: 'normal',
    },
    {
      name: 'corridor',
      type: 'normal',
    },
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'expiredAt_operatingNumber',
      type: 'normal',
    },
    {
      name: 'order_quantity',
      type: 'highlight_quantity',
    },
    {
      name: 'price',
      type: 'highlight_price',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'items_number_in_packet',
      type: 'normal',
    },
    {
      name: 'packets_number_in_package',
      type: 'normal',
    },
  ];

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private WebSocketService: WebSocketService,
    public toggleModal: ToggleModal,
    private fixedData: FixedDataService,
    private generalService: GeneralService
  ) {
    window.addEventListener('mouseup', (e: any) => {
      if (e.target.classList.contains('modalContent')) {
        this.toggleModal.showModal = false;
      }
    });
  }

  updateBatchIDs(updatedIDs: any) {
    this.batchStatus = updatedIDs;
  }

  ngOnInit() {
    //check multipe corridors
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
      if (this.multiple_corridors_enabled == 'false') {
        const location_index_name = this.columnsNamePopup.findIndex(
          (c: any) => c.name == 'corridor'
        );
        const location_index_array = this.columnsArrayPopup.findIndex(
          (c: any) => c.name == 'موقع الصنف'
        );
        if (location_index_name > -1) {
          this.columnsNamePopup.splice(location_index_name, 1);
        }
        if (location_index_array > -1) {
          this.columnsArrayPopup.splice(location_index_array, 1);
        }
      }
    }
    //get warehouse id to send with preparing api
    this.subs.add(
      this.fixedData.getAllFixedData().subscribe({
        next: (res) => {
          this.warehouses = res.data.warehouse_type;
          let bulkWrehouse: any = this.warehouses.find(
            (c: any) => c.name == 'قطاعي'
          );
          if (bulkWrehouse) {
            this.bulkId = bulkWrehouse.value;
          }
        },
        complete: () => {
          this.getAllCorridores();
        },
      })
    );

    //real time actions
    this.realTimeAction();

    this.addNewBasketNumber = this.fb.group({
      basket_id: [''],
    });
    this.basketSearch = this.fb.group({
      basket_value: [''],
    });
  }

  realTimeAction() {
    this.WebSocketService.setupConnectionHandlers();
    this.WebSocketService.getNewMessagePreparing().subscribe((message: any) => {
      if (message.action == 'added') {
        const isCorridorIdPresent = message.orders_count.some(
          (corridor: any) => corridor.corridor_id === this.currentCorridorID
        );
        if (isCorridorIdPresent) {
          this.allInvoices.push({
            number: this.allInvoices.length + 1,
            closed_at: message.order.closed_at,
            PharmacyName: message.order?.pharmacy?.name,
            order_number: message.order.order_number,
            order_id: message.order.id,
          });
        }
      } else {
        const orderIndex = this.allInvoices.findIndex(
          (c: any) => c.order_id == message.order.id
        );
        if (orderIndex > -1) {
          this.allInvoices.splice(orderIndex, 1);
        }
      }
      this.corridorsUsed.map((item1) => {
        let match = message.orders_count.find(
          (item2: any) => item2.corridor_id == item1.id
        );
        if (match) {
          item1.count = match?.count;
        }
      });

      this.itemsCount = message;
    });
  }

  getAllCorridores() {
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridorsUsed = res.data;
          const index = this.corridorsUsed.findIndex(
            (c: any) => c.is_main_corridor
          );
          if (index > -1) {
            this.allCorridorId = Number(this.corridorsUsed[index].id);
          }
        },
        complete: () => {
          if (localStorage.getItem('activeTab')) {
            this.changeActiveTap(Number(localStorage.getItem('activeTab')));
          } else {
            this.changeActiveTap(0);
          }
        },
      })
    );
  }

  changeActiveTap(index: number) {
    //set in local storage active tab so when reload page stay on the same tab
    localStorage.setItem('activeTab', String(index));
    //update highlight
    this.isActiveTapArray.fill(false);
    this.isActiveTapArray[index] = true;

    const corridor = this.corridorsUsed.findIndex(
      (c: any) => c.number == Number(index)
    );
    if (corridor > -1) {
      this.currentCorridorID = this.corridorsUsed[corridor].id;
      this.getInvoicesList(this.currentCorridorID, index);
      //highlighted corridor id
    }
  }
  corridorCount: any;
  getInvoicesList(corridorID?: any, number?: any) {
    this.allInvoices = [];

    let params: any;
    params = {
      warehouse_type: 'retail',
    };
    if (corridorID) {
      this.corridorNumber = number;
      this.currentCorridorID = corridorID;
      if (number != 0) {
        params = {
          corridor_id: corridorID,
          warehouse_type: 'retail',
        };
      }

      this.subs.add(
        this.http
          .getReq('warehouses/orders/unprepared', { params: params })
          .subscribe({
            next: (res) => {
              this.corridorCount = res.additional_data.counts;
              this.itemsCount = res.data.length;

              res?.data?.forEach((element: any, index: number) => {
                this.allInvoices.push({
                  number: index + 1,
                  closed_at: element.closed_at,
                  PharmacyName: element.pharmacy.name,
                  order_number: element.order_number,
                  order_id: element.id,
                });
              });
              this.total = this.allInvoices.length;
            },
            complete: () => {
              this.corridorsUsed.map((item1) => {
                let match = this.corridorCount.find(
                  (item2: any) => item2.corridor_id === item1.id
                );
                item1.count = match.count;
              });
            },
          })
      );
    }
  }

  savedDataForSort: any;
  savedDataforOrderNumber: any;
  invoiceBaskets: any = [];
  allCorridorId: any;
  orderId: any;
  sorted: boolean = false;
  openModal(
    invoice_id: any,
    orderNumber?: any,
    sort_by?: string,
    direction?: string
  ) {
    this.basketsByCorridor = [];
    this.toggleModal.showModal = true;
    this.invoiceId = invoice_id;
    this.orderContentList = [];
    this.OrderContentListNumber = 1;
    this.savedDataForSort = invoice_id;
    this.savedDataforOrderNumber = orderNumber;

    let params = {};

    const hasSortParams = sort_by && direction;
    if (hasSortParams) {
      this.sorted = true;
    } else {
      this.sorted = false;
    }

    params = {
      invoice_id: this.invoiceId,
      ...(hasSortParams ? { sort_by: sort_by, direction: direction } : {}),
      ...(this.corridorNumber != 0
        ? { corridor_id: this.currentCorridorID }
        : {}),
    };

    this.subs.add(
      this.http
        .getReq('warehouses/orders/retail/view-unprepared', { params: params })
        .subscribe({
          next: (res) => {
            this.orderContentList = [];
            this.allOrderContentData = res.data;
            this.orderId = res.data.id;
            this.OrderContentListNumber = 1;
            res?.data?.cart.forEach((cartItem: any) => {
              let checked: any;
              let currentIndex = this.batchStatus.findIndex(
                (c: any) => c.batch_id == cartItem.batch_id
              );

              if (
                cartItem.status.value == 1 ||
                this.batchStatus[currentIndex]?.status == 1
              ) {
                checked = false;
              } else if (
                cartItem.status.value == 2 ||
                this.batchStatus[currentIndex]?.status == 2
              ) {
                checked = true;
              } else {
                checked = false;
              }

              this.orderContentList.push({
                cart_id: cartItem.cart_id,
                id: cartItem.batch_id,
                number: this.OrderContentListNumber,
                corridor: cartItem.location,
                product_name: cartItem.product_name,
                expiredAt_operatingNumber: `${cartItem.expired_at} - ${cartItem.operating_number}`,
                orderedQuantity: cartItem.quantity,
                order_quantity: cartItem.quantity + cartItem.bonus,
                items_number_in_packet: cartItem.packet,
                packets_number_in_package: cartItem.package,
                manufacturer_name: cartItem.manufacturer_name,
                price: cartItem.price,
                completed_at: cartItem?.completed_at != null ? true : false,
                checked: checked,
                price_color: cartItem.price_color,
              });

              this.batchIDs?.push(cartItem.batch_id);

              this.OrderContentListNumber++;
            });

            const corridorMapping: { [corridor: number]: any } = {};
            this.corridorsUsed.forEach((element, index: any) => {
              corridorMapping[element.number] = {
                corridor: element.number,
                baskets: [],
              };
            });
            this.invoiceBaskets = [];

            res.data.corridors.forEach((corridor: any) => {
              if (corridorMapping[corridor.number]) {
                corridor.baskets.forEach((basket: any) => {
                  this.invoiceBaskets.push({
                    basket_number: basket.number,
                    corridor_id: corridor.id,
                    basket_id: basket.id,
                    corridor_number: corridor.number,
                  });
                  if (
                    !corridorMapping[corridor.number].baskets.includes(
                      basket.number
                    )
                  ) {
                    corridorMapping[corridor.number].baskets.push(
                      basket.number
                    );
                  }
                });
              }
            });
            this.basketsByCorridor = Object.values(corridorMapping);
          },
          complete: () => {
            this.batchIDs = [];
            for (let i = 0; i < this.orderContentList.length; i++) {
              this.batchIDs.push(this.orderContentList[i].id);
            }
          },
        })
    );
  }

  createBasket() {
    let param: any;
    param = {
      number: this.addNewBasketNumber.controls['basket_id'].value,
      corridor_id:
        this.corridorNumber == 0 ? this.allCorridorId : this.currentCorridorID,
      order_id: this.orderId,
    };

    this.subs.add(
      this.http.postReq('warehouses/baskets/create', param).subscribe({
        next: (res) => {
          const newBasket = {
            basket_number: res.data.number,
            corridor_id: this.currentCorridorID,
            basket_id: res.data.id,
            corridor_number: this.corridorNumber,
          };
          this.invoiceBaskets.push({
            basket_number: res.data.number,
            corridor_id: this.currentCorridorID,
            basket_id: res.data.id,
            corridor_number: this.corridorNumber,
          });

          const corridorData = this.basketsByCorridor.find(
            (corridor) =>
              corridor.corridor === newBasket.corridor_number.toString()
          );
          if (corridorData) {
            corridorData.baskets.push(newBasket.basket_number);
          } else {
            this.basketsByCorridor.push({
              corridor: newBasket.corridor_number.toString(),
              baskets: [newBasket.basket_number],
            });
          }
        },
      })
    );
  }

  removeBasket(basketId: number) {
    this.subs.add(
      this.http.deleteReq(`warehouses/baskets/${basketId}/delete`).subscribe({
        next: (res) => {
          const invoiceBasketIndex = this.invoiceBaskets.findIndex(
            (basket: any) => basket.basket_id === basketId
          );
          if (invoiceBasketIndex > -1) {
            const removedBasket = this.invoiceBaskets[invoiceBasketIndex];
            this.invoiceBaskets.splice(invoiceBasketIndex, 1);
            const corridorData = this.basketsByCorridor.find(
              (corridor) =>
                corridor.corridor === removedBasket.corridor_number.toString()
            );
            if (corridorData) {
              const basketIndexInCorridor = corridorData.baskets.findIndex(
                (basketNumber: any) =>
                  basketNumber === removedBasket.basket_number
              );
              if (basketIndexInCorridor > -1) {
                corridorData.baskets.splice(basketIndexInCorridor, 1);
              }
            }
          }
        },
        complete: () => {},
      })
    );
  }

  completeInvoice() {
    const basketIds = this.invoiceBaskets.map(
      (basket: any) => basket.basket_id
    );
    let param: any;
    let idToRemove: any = [];
    this.batchStatus.forEach((batch, i: any) => {
      const index = this.allOrderContentData.cart.findIndex(
        (cartItem: any) => cartItem.id == batch.cart_id
      );
      if (index > -1) {
        if (this.allOrderContentData.cart[index].completed_at != null) {
          idToRemove.push({ id: i });
        }
      }
    });
    idToRemove.forEach((element: any) => {
      this.batchStatus.splice(element.id, 1);
    });
    param = {
      order_id: this.invoiceId,
      batch_ids: this.batchStatus,
    };

    param.basket_ids = basketIds;
    param.corridor_id =
      this.corridorNumber >= 1 ? this.currentCorridorID : this.allCorridorId;

    this.subs.add(
      this.http.postReq('warehouses/orders/retail/complete', param).subscribe({
        next: (res) => {},
        complete: () => {
          this.usedBaskets = [];
          this.toggleModal.showModal = false;
          this.addNewBasketNumber.controls['basket_id'].setValue('');

          let confirmation1Model: HTMLElement =
            this.openConfirmation1Model.nativeElement;
          confirmation1Model.click();
          this.invoiceId = 0;
        },
      })
    );
  }

  getSearchByBasket() {
    //more clean code use the spread operator to conditionally add properties to the object
    const basketValue = this.basketSearch.controls['basket_value']?.value;
    const params = {
      warehouse_type: 'retail',

      ...(basketValue ? { basket_number: basketValue } : {}),
      ...(this.corridorNumber > 1
        ? { corridor_id: this.currentCorridorID }
        : {}),
    };

    this.subs.add(
      this.http
        .getReq('warehouses/orders/unprepared', { params: params })
        .subscribe({
          next: (res) => {
            this.allInvoices = [];
            res?.data?.forEach((element: any, index: number) => {
              this.allInvoices.push({
                number: index + 1,
                closed_at: element.closed_at,
                PharmacyName: element.pharmacy.name,
                order_number: element.order_number,
                order_id: element.id,
              });
            });
            this.total = this.allInvoices.length;
          },
        })
    );
  }

  onSortEvent(event: any) {
    this.openModal(
      this.savedDataForSort,
      this.savedDataforOrderNumber,
      event.name,
      event.direction
    );
  }

  @ViewChild('openConfirmation1Model')
  openConfirmation1Model!: ElementRef<HTMLElement>;

  finalizeAndPrint() {
    let confirmation1Model: HTMLElement =
      this.openConfirmation1Model.nativeElement;
    this.closeModalClick();
    setTimeout(() => {
      confirmation1Model.click();
    }, 200);
  }

  @ViewChild('closeModal') closeModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeModal.nativeElement;
    el.click();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.WebSocketService.close();
    this.usedBaskets = [];
  }
}
