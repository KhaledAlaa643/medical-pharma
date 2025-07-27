import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { FixedDataService } from '@services/fixed-data.service';
import { HttpService } from '@services/http.service';
import { WebSocketService } from '@services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-preparding',
  templateUrl: './preparding.component.html',
  styleUrls: ['./preparding.component.scss'],
})
export class PrepardingComponent implements OnInit {
  private subs = new Subscription();
  printingdata: any;
  urlToInvoice: any;
  allData: any = [];
  allOrders: any = [];
  popUpData = [];
  orderContentData: any = [];
  orderContentListNumber!: number;
  orderContentList: any = [];
  batchIDs: any = [];
  invoiceId!: number;
  batchStatus: { id: number; status: number; cart_id?: number }[] = [];

  columnsArrayAll: columnHeaders[] = [
    {
      name: ' مسلسل',
    },
    {
      name: ' التاريخ والوقت',
    },
    {
      name: '  اسم العميل  ',
    },
    {
      name: ' رقم اذن ',
    },
    {
      name: 'تحضير الأذن',
    },
    {
      name: 'طباعة',
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
      name: 'order_content',
      type: 'GreenTextOpen',
    },
    {
      name: 'print',
      type: 'printButton',
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
      name: ' الكمية المطلوبة ',
    },
    {
      name: 'السعر',
    },
    {
      name: '    الصلاحية والتشغيلة',
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
      type: 'statusCheckbox',
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
      name: 'order_quantity',
      type: 'highlight_quantity',
    },
    {
      name: 'price',
      type: 'highlight_price',
    },
    {
      name: 'expiredAt_operatingNumber',
      type: 'normal',
    },
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
    {
      name: 'packet',
      type: 'normal',
    },
    {
      name: 'package',
      type: 'normal',
    },
  ];

  totalQuantity: any;

  constructor(
    private http: HttpService,
    private router: Router,
    private fixedData: FixedDataService,
    private WebSocketService: WebSocketService
  ) {}
  warehouses: any = [];
  AllCount: number = 0;
  multiple_corridors_enabled!: string;
  ngOnInit() {
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
      if (this.multiple_corridors_enabled == 'false') {
        const location_index_array = this.columnsArrayPopup.findIndex(
          (c: any) => c.name == 'موقع الصنف'
        );
        const location_index_name = this.columnsNamePopup.findIndex(
          (c: any) => c.name == 'corridor'
        );
        if (location_index_array > -1) {
          this.columnsArrayPopup.splice(location_index_array, 1);
        }
        if (location_index_name > -1) {
          this.columnsNamePopup.splice(location_index_name, 1);
        }
      }
    }
    this.getOrders();

    this.WebSocketService.setupConnectionHandlers();
    this.WebSocketService.getNewMessagePreparingBulk().subscribe(
      (message: any) => {
        if (message.action == 'added') {
          this.allOrders.push({
            number: this.allOrders.length + 1,
            closed_at: message.order.closed_at,
            PharmacyName: message.order?.pharmacy?.name,
            order_number: message.order.order_number,
            order_id: message.order.id,
            order_content: 'محتويات الأذن',
            print: 'طباعة وتحضير',
          });
          this.allData.push(message.order);
        } else {
          const orderIndex = this.allOrders.findIndex(
            (c: any) => c.order_id == message.order.id
          );
          if (orderIndex > -1) {
            this.allOrders.splice(orderIndex, 1);
          }
        }

        this.AllCount = message.orders_count;
      }
    );
  }

  invoiceDetailsID!: number;
  @ViewChild('openInfoModel') openInfoModel!: ElementRef<HTMLElement>;
  openModel(event: any) {
    this.invoiceDetailsID = event;
    let el: HTMLElement = this.openInfoModel.nativeElement;
    el.click();
    setTimeout(() => {
      this.openOrderDetails(event);
    }, 200);
  }
  getOrders() {
    this.allOrders = [];
    let params = {
      warehouse_type: 'bulk',
    };
    this.subs.add(
      this.http
        .getReq('warehouses/orders/unprepared', { params: params })
        .subscribe({
          next: (res) => {
            this.allData = res.data;
            this.AllCount = res.additional_data.counts;
            this.allData?.forEach((element: any, index: number) => {
              this.allOrders.push({
                number: index + 1,
                closed_at: element.closed_at,
                PharmacyName: element.pharmacy.name,
                order_number: element.order_number,
                order_id: element.id,
                order_content: ' تحضير الأذن ',
                print: 'طباعة وتحضير',
              });
            });
          },
        })
    );
  }

  //get order content
  openOrderDetails(invoiceId: any, sort_by?: string, direction?: string) {
    this.invoiceId = invoiceId;
    let params = {};

    if (sort_by && direction) {
      params = {
        invoice_id: invoiceId,
        sort_by: sort_by,
        direction: direction,
      };
    } else {
      params = {
        invoice_id: invoiceId,
      };
    }

    this.subs.add(
      this.http
        .getReq('warehouses/orders/retail/view-unprepared', { params: params })
        .subscribe({
          next: (res) => {
            this.orderContentList = [];
            this.orderContentData = res.data;
            this.totalQuantity = res.data.total_quantity;
            this.orderContentListNumber = 1;
            res?.data?.cart.forEach((cartItem: any) => {
              let cart_id = cartItem.cart_id;
              let idOfRow = cartItem.batch_id;
              let corridor = cartItem.location;
              let expiredAt_operatingNumber = `${cartItem.expired_at} - ${cartItem.operating_number}`;
              let orderedQuantity = cartItem.quantity;
              let bonus = cartItem.bonus;
              let packet = cartItem.packet;
              let medPackage = cartItem.package;
              let productName = cartItem.product_name;
              let manufactureName = cartItem.manufacturer_name;
              let price = cartItem.price;
              let price_color = cartItem.price_color;
              let checked: any;
              if (cartItem.status.value == 1) {
                checked = false;
              } else if (cartItem.status.value == 2) {
                checked = true;
              } else {
                checked = false;
              }

              this.orderContentList.push({
                cart_id: cart_id,
                id: idOfRow,
                number: this.orderContentListNumber,
                corridor: corridor,
                product_name: productName,
                orderedQuantity: orderedQuantity,
                order_quantity: orderedQuantity + bonus,
                expiredAt_operatingNumber: expiredAt_operatingNumber,
                packet: packet,
                package: medPackage,
                manufacturer_name: manufactureName,
                price: price,
                completed_at: cartItem?.completed_at != null ? true : false,
                checked: checked,
                price_color: price_color,
              });

              this.batchIDs?.push(idOfRow);
              this.orderContentListNumber++;
            });
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

  //get checked batches id
  updateBatchIDs(updatedIDs: any[]) {
    this.batchStatus = updatedIDs;
  }
  //handle sort event

  //complete preraring order
  completeInvoice(sortingOptions?: any) {
    let param: any;
    let idToRemove: any = [];
    this.batchStatus.forEach((batch, i: any) => {
      const index = this.orderContentData.cart.findIndex(
        (cartItem: any) => cartItem.id == batch.cart_id
      );
      if (index > -1) {
        if (this.orderContentData.cart[index].completed_at != null) {
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

    if (sortingOptions) {
      param.sort_by = sortingOptions.sort_by;
      param.direction = sortingOptions.direction;
    }

    this.subs.add(
      this.http.postReq('warehouses/orders/prepare', param).subscribe({
        next: (res) => {},
        complete: () => {
          const index = this.allData.findIndex(
            (c: any) => c.id === this.invoiceId
          );
          if (index > -1) {
            this.allOrders.splice(index, 1);
          }

          let confirmation1Model: HTMLElement =
            this.confirmationModel.nativeElement;
          confirmation1Model.click();
        },
      })
    );
  }
  getPrintedInvoiceData(order_id: number) {
    let body = {
      order_id: order_id,
    };
    this.subs.add(
      this.http.postReq('warehouses/orders/bulk/complete', body).subscribe({
        next: (res) => {
          this.printingdata = res;
        },
        complete: () => {
          const index = this.allOrders.findIndex(
            (c: any) => c.order_id === order_id
          );
          if (index > -1) {
            this.allOrders.splice(index, 1);
          }

          this.navigateToInvoicePrint();
        },
      })
    );
  }
  sortInvoiceContent(data: any) {
    let queryParams: any = {};
    queryParams['sort_by'] = data.name;
    queryParams['direction'] = data.direction;
    this.openOrderDetails(
      this.invoiceDetailsID,
      queryParams.sort_by,
      queryParams.direction
    );
  }

  navigateToInvoicePrint() {
    const serializedSalesInvoiceData = JSON.stringify(this.printingdata);
    localStorage.setItem('PharmacyInvoiceData', serializedSalesInvoiceData);

    if (this.printingdata.data.client.type_value == 0) {
      this.urlToInvoice = this.router.serializeUrl(
        this.router.createUrlTree(['ToPrint/pharmacy-invoice'], {
          queryParams: { shouldPrint: 'true' },
        })
      );
    } else if (this.printingdata.data.client.type_value == 1) {
      this.urlToInvoice = this.router.serializeUrl(
        this.router.createUrlTree(['ToPrint/sales-invoice'], {
          queryParams: { shouldPrint: 'true' },
        })
      );
    }
    setTimeout(() => {
      window.open(this.urlToInvoice, '_blank');
    }, 100);
  }

  //confirmation model
  @ViewChild('confirmationModel') confirmationModel!: ElementRef<HTMLElement>;

  finalizeAndPrint() {
    let confirmation1Model: HTMLElement = this.confirmationModel.nativeElement;
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
}
