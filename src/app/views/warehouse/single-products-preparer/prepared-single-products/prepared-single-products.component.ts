import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { LooseObject } from '@models/LooseObject';
import { corridors } from '@models/corridors';
import { pharmacie, pharmacy_client } from '@models/pharmacie';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { FixedDataService } from '@services/fixed-data.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { ToggleModal } from '@services/toggleModal.service';
import { Subscription } from 'rxjs';
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-prepared-single-products',
  templateUrl: './prepared-single-products.component.html',
  styleUrls: ['./prepared-single-products.component.scss'],
})
export class PreparedSingleProducts implements OnInit, OnDestroy {
  private subs = new Subscription();
  warehouseFilter!: FormGroup;
  pharmacies: pharmacie[] = [];
  groupPharmacied: pharmacy_client[] = [];
  isActiveTapArray: boolean[] = Array(6).fill(false);
  showModal: boolean = false;
  listNumber = 1;
  total = 0;
  allInvoices: LooseObject[] = [];

  corridorsUsed: corridors[] = [];
  @ViewChild('AddModal') AddModal!: ElementRef<HTMLElement>;
  @ViewChild('ContentModal') ContentModal!: ElementRef;

  constructor(
    private http: HttpService,
    private router: Router,
    private fb: FormBuilder,
    private generalService: GeneralService,
    private auth: AuthService,
    public toggleModal: ToggleModal,
    private fixedData: FixedDataService
  ) {
    window.addEventListener('mouseup', (e: any) => {
      if (e.target.classList.contains('modalContent')) {
        this.toggleModal.showModal = false;
      }
    });
  }

  columnsArrayAll: columnHeaders[] = [
    {
      name: ' مسلسل',
    },
    {
      name: 'وقت و تاريخ غلق الأذن ',
    },
    {
      name: 'وقت و تاريخ التحضير',
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
      name: 'completed_at',
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
  columnsArraySingle: columnHeaders[] = [
    {
      name: ' مسلسل',
    },
    {
      name: 'وقت و تاريخ غلق الأذن ',
    },
    {
      name: 'وقت و تاريخ التحضير',
    },
    {
      name: '  اسم العميل  ',
    },
    {
      name: ' رقم اذن ',
    },
    {
      name: 'المحضر',
    },
    {
      name: 'محتويات الأذن ',
    },
  ];
  columnsNameSingle: ColumnValue[] = [
    {
      name: 'number',
      type: 'normal',
    },
    {
      name: 'closed_at',
      type: 'normal',
    },
    {
      name: 'completed_at',
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
      name: 'preparer',
      type: 'normal',
    },
    {
      name: 'order_contents',
      type: 'order_content',
    },
  ];
  columnsArrayContent: columnHeaders[] = [
    {
      name: 'مسلسل',
    },
    {
      name: 'موقع الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'الاسم عربي',
      sort: true,
      direction: null,
    },
    {
      name: 'الصلاحية والتشغيلة',
    },
    {
      name: 'الكمية المطلوبة',
    },
    {
      name: 'السعر',
    },
    {
      name: ' باكت',
    },
    {
      name: 'كرتونة',
    },
    {
      name: 'الشركة المصنعه',
      sort: true,
      direction: null,
    },
  ];
  columnsNameContent: ColumnValue[] = [
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
      name: 'expired_at',
      type: 'normal',
    },
    {
      name: 'order_quantity',
      type: 'normal',
    },
    {
      name: 'price',
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
    {
      name: 'manufacturer_name',
      type: 'normal',
    },
  ];

  totalItemsNumber = 0;
  activeTab: any;
  statinsNumber: any;
  roleId!: number;
  warehouses: any;
  bulkId!: number;
  multiple_corridors_enabled!: string;
  ngOnInit() {
    if (localStorage.getItem('multiple_corridors_enabled')) {
      this.multiple_corridors_enabled = String(
        localStorage.getItem('multiple_corridors_enabled')
      );
      if (this.multiple_corridors_enabled == 'false') {
        const location_index_name = this.columnsNameContent.findIndex(
          (c: any) => c.name == 'corridor'
        );
        const location_index_array = this.columnsArrayContent.findIndex(
          (c: any) => c.name == 'موقع الصنف'
        );
        if (location_index_name > -1) {
          this.columnsNameContent.splice(location_index_name, 1);
        }
        if (location_index_array > -1) {
          this.columnsArrayContent.splice(location_index_array, 1);
        }
      }
    }
    this.subs.add(
      this.fixedData.getAllFixedData().subscribe({
        next: (res) => {
          this.warehouses = res.data.warehouse_type;
          let bulkWrehouse = this.warehouses.find(
            (c: any) => c.name == 'قطاعي'
          );
          console.log(bulkWrehouse);
          if (bulkWrehouse) {
            this.bulkId = bulkWrehouse.value;
          }
        },
        complete: () => {
          this.getPreparer();
          this.getstationsNumber();
        },
      })
    );

    this.roleId = this.auth.getUserObj().role.id;

    this.getData();

    let element = document.getElementById('subscription');

    this.warehouseFilter = this.fb.group({
      invoice_number: [''],
      created_at: [''],
      pharmacy_id: [''],
      corridor_id: [''],
      prepared_by: [''],
    });
  }

  getAllCorridores() {
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridorsUsed = res.data;
          let corridors = res.data;
          const index = corridors.findIndex((c: any) => c.is_main_corridor);
          if (index > -1) {
            this.allCorridorId = Number(corridors[index].id);
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
  activeCorridorId!: number;
  changeActiveTap(index: number) {
    localStorage.setItem('activeTab', String(index));
    this.activeTab = index;
    this.isActiveTapArray.fill(false);
    this.isActiveTapArray[index] = true;

    const corridor = this.corridorsUsed.findIndex(
      (c: any) => c.number == index
    );
    if (corridor > -1) {
      this.activeCorridorId = this.corridorsUsed[corridor].id;
      this.getInvoicesList(
        this.corridorsUsed[corridor].id,
        Number(this.corridorsUsed[corridor].number)
      );
    }

    this.allData = [];
    this.listNumber = 1;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  invoiceDetailsNumber = 1;
  InvoiceData: any[] = [];
  corridors: any;
  displayData: any;
  savedDataForSort: any;
  openModal(data: any, sort_by?: string, direction?: string) {
    this.savedDataForSort = data;
    this.toggleModal.showModal = true;
    this.InvoiceData = [];
    let params: any = { invoice_id: data };

    if (sort_by && direction) {
      params = { ...params, sort_by: sort_by, direction: direction };
    }

    if (this.activeTab != 0) {
      params = { ...params, corridor_id: this.activeCorridorId };
    }
    this.subs.add(
      this.http
        .getReq('warehouses/orders/retail/view-prepared', { params: params })
        .subscribe({
          next: (res) => {
            this.InvoiceData = [];
            this.invoiceDetailsNumber = 1;
            this.corridors = res?.data?.corridors;
            res?.data?.cart.forEach((cart: any) => {
              this.InvoiceData.push({
                number: this.invoiceDetailsNumber,
                corridor: cart?.location,
                product_name: cart.product_name,
                order_quantity: cart.quantity + cart.bonus,
                price: cart.price,
                expired_at: cart.expired_at + ' ' + cart.operating_number,
                manufacturer_name: cart.manufacturer_name,
                packet: cart.packet,
                package: cart.package,
              });
              this.invoiceDetailsNumber++;
            });

            this.totalItemsNumber = res.data.total_quantity;
            const dataFromApi = this.corridors;
            const totalCorridors = this.statinsNumber;

            this.displayData = Array.from(
              { length: totalCorridors },
              (_, index) => {
                const corridorData = dataFromApi.find(
                  (corridor: { number: string }) =>
                    corridor.number === index.toString()
                );
                return {
                  number: index,
                  baskets: corridorData ? corridorData.baskets : [],
                };
              }
            );

            this.displayData = this.displayData;
          },
        })
    );
  }
  corridorNumber: any;
  getcorridorNumber() {
    this.subs.add(
      this.http.getReq('warehouses/settings').subscribe({
        next: (res) => {
          this.corridorNumber = res.data.corridors_number;
        },
      })
    );
  }

  closeModal() {
    this.toggleModal.showModal = false;
  }

  allData: any;
  corridorsCount: any = [];
  getInvoicesList(corridorID?: any, corridorNum?: any) {
    this.allInvoices = [];
    let params: any = {};

    if (corridorNum != 0) {
      params = {
        corridor_id: corridorID,
      };
    }

    this.subs.add(
      this.http
        .getReq('warehouses/orders/retail/listing-prepared', { params: params })
        .subscribe({
          next: (res) => {
            this.allData = res.data;
            this.corridorsCount = res.additional_data.counts;

            if (corridorNum != 0) {
              this.handleResponseForNonZeroCorridorNum(res);
            } else {
              this.handleResponseForZeroCorridorNum(res);
            }
          },
          complete: () => {
            this.updateCorridorsUsedCount();
          },
        })
    );
  }

  handleResponseForNonZeroCorridorNum(res: any) {
    res?.data?.forEach((element: any) => {
      let startDate = new Date(element.closed_at);
      let endDate = new Date(element.corridors[0]?.completed_at);
      let differenceInMilliseconds;

      if (isNaN(endDate.getTime())) {
        differenceInMilliseconds = 0;
      } else {
        differenceInMilliseconds = Number(endDate) - Number(startDate);
      }

      let differenceInMinutes = differenceInMilliseconds / (1000 * 60);
      const roundedTimestamp = Math.ceil(differenceInMinutes);
      this.allInvoices.push({
        number: this.listNumber,
        closed_at: element.closed_at,
        completed_at: roundedTimestamp,
        preparer: element.cart[0]?.prepared_by?.name,
        PharmacyName: element.pharmacy.name,
        order_number: element.order_number,
        order_id: element.id,
        order_contents: 'محتويات الأذن',
        print: 'طباعة',
      });

      this.listNumber++;
    });
    this.total = this.allInvoices.length;
  }

  handleResponseForZeroCorridorNum(res: any) {
    res?.data?.forEach((element: any) => {
      this.allInvoices.push({
        number: this.listNumber,
        closed_at: element.closed_at,
        completed_at: element?.completed_at,
        PharmacyName: element?.pharmacy.name,
        order_number: element?.order_number,
        order_id: element?.id,
      });

      this.listNumber++;
    });
    this.total = this.allInvoices.length;
    this.allData.forEach((element: any, index: any) => {
      element.corridors.forEach((corridor: any, corridorindex: any) => {
        let startDate = new Date(element.closed_at);
        let endDate = new Date(corridor.completed_at);

        if (isNaN(endDate.getTime())) {
          this.allInvoices[index][`corridor${corridor.number}`] = 0;
        } else {
          let differenceInMilliseconds = Number(endDate) - Number(startDate);
          let differenceInMinutes = differenceInMilliseconds / (1000 * 60);
          const roundedTimestamp = Math.ceil(differenceInMinutes);
          this.allInvoices[index][`corridor${corridor.number}`] =
            roundedTimestamp;
        }
      });
    });
  }

  updateCorridorsUsedCount() {
    this.corridorsUsed.map((item1: any) => {
      let match = this.corridorsCount.find(
        (item2: any) => item2?.corridor_id == item1?.id
      );
      if (match) {
        item1.count = match?.count;
      }
    });
  }

  allCorridorId: any;
  allCorridorsData: { id: number; number: any }[] = [];
  getstationsNumber() {
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridorsUsed = res.data;
          this.statinsNumber = this.corridorsUsed.length;
          this.allCorridorsData = res.data;
          const index = this.allCorridorsData.findIndex(
            (c: any) => c.number == '0'
          );
          if (index > -1) {
            this.allCorridorId = Number(this.allCorridorsData[index].id);
          }
        },
        complete: () => {
          let indexToInsertArrayAll = 3;
          let indexToInsertNameAll = 3;
          for (let index = 0; index < this.allCorridorsData.length; index++) {
            if (this.allCorridorsData[index].number == '0') {
              this.columnsArrayAll.splice(indexToInsertArrayAll++, 0, {
                name: `الكل`,
              });
              this.columnsNameAll.splice(indexToInsertNameAll++, 0, {
                name: `corridor${0}`,
                type: 'normal',
              });
            } else {
              if (this.multiple_corridors_enabled == 'true') {
                this.columnsArrayAll.splice(indexToInsertArrayAll++, 0, {
                  name: `وقت م ${this.allCorridorsData[index].number}`,
                });
                this.columnsNameAll.splice(indexToInsertNameAll++, 0, {
                  name: `corridor${this.allCorridorsData[index].number}`,
                  type: 'normal',
                });
              }
            }
          }
          setTimeout(() => {
            if (localStorage.getItem('activeTab')) {
              this.changeActiveTap(Number(localStorage.getItem('activeTab')));
              this.activeTab = Number(localStorage.getItem('activeTab'));
            } else {
              this.changeActiveTap(0);
              this.activeTab = 0;
            }
          }, 200);
        },
      })
    );
  }
  getData() {
    let clients: any = [];
    this.subs.add(
      this.http.getReq('clients/dropdown').subscribe({
        next: (res) => {
          clients = res.data;
          clients.forEach((client: any) => {
            client.pharmacies.forEach((pharamcy: any) => {
              this.groupPharmacied.push({
                name: client?.name + '-' + pharamcy.name,
                id: pharamcy?.id,
              });
            });
          });
        },
      })
    );
  }

  filter() {
    if (Number(localStorage.getItem('activeTab')) != 0) {
      this.warehouseFilter.controls['corridor_id'].setValue(
        Number(localStorage.getItem('activeTab'))
      );
    }
    let date = this.warehouseFilter.controls['created_at'].value;
    let formatedDate = datePipe.transform(
      this.warehouseFilter.controls['created_at'].value,
      'yyyy-MM-dd'
    );
    const params: any = {};
    params['warehouse_type'] = this.bulkId;
    for (const key in this.warehouseFilter.value) {
      let value = this.warehouseFilter.controls[key].value;
      if (value != null && value != undefined && value != '') {
        if (key == 'created_at') {
          params[key] = formatedDate;
        } else {
          params[key] = value;
        }
      }
    }
    this.subs.add(
      this.http
        .getReq('warehouses/orders/retail/listing-prepared', { params: params })
        .subscribe({
          next: (res) => {
            this.allData = res.data;
            this.allInvoices = [];
            const isActiveTabNonZero =
              Number(localStorage.getItem('activeTab')) != 0;

            res?.data?.forEach((element: any) => {
              let completed_at;

              if (isActiveTabNonZero) {
                let startDate = new Date(element.closed_at);
                let endDate = new Date(element.corridors[0].completed_at);
                let differenceInMilliseconds =
                  Number(endDate) - Number(startDate);
                let differenceInMinutes =
                  differenceInMilliseconds / (1000 * 60);
                completed_at = Math.ceil(differenceInMinutes);
              } else {
                completed_at = element.completed_at;
              }

              this.allInvoices.push({
                number: this.listNumber,
                closed_at: element.closed_at,
                completed_at: completed_at,
                preparer: isActiveTabNonZero
                  ? element?.cart[0]?.storing_worker?.name
                  : undefined,
                PharmacyName: element.pharmacy.name,
                order_number: element.order_number,
                order_id: element.id,
                order_contents: 'محتويات الأذن',
              });

              this.listNumber++;
            });

            this.total = this.allInvoices.length;
          },
          complete: () => {
            if (this.warehouseFilter.controls['created_at']) {
              this.warehouseFilter.controls['created_at'].setValue(date);
            }
            if (Number(localStorage.getItem('activeTab')) == 0) {
              this.allData.forEach((element: any, index: any) => {
                element.corridors.forEach(
                  (corridor: any, corridorindex: any) => {
                    let startDate = new Date(element.closed_at);
                    let endDate = new Date(corridor.completed_at);
                    let differenceInMilliseconds =
                      Number(endDate) - Number(startDate);
                    let differenceInMinutes =
                      differenceInMilliseconds / (1000 * 60);
                    const roundedTimestamp = Math.ceil(differenceInMinutes);
                    this.allInvoices[index][`corridor${corridor.number}`] =
                      roundedTimestamp;
                  }
                );
              });
            }
            setTimeout(() => {
              this.closeModalClick();
            }, 300);
          },
        })
    );
  }
  preparer: any;
  getPreparer() {
    this.subs.add(
      this.generalService.getRetailPreparation().subscribe({
        next: (res) => {
          this.preparer = res.data;
        },
      })
    );
  }

  @ViewChild('closeModal') closeFilterModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeFilterModal.nativeElement;
    el.click();
  }

  onSortEvent(event: any) {
    this.openModal(this.savedDataForSort, event.name, event.direction);
  }
}
