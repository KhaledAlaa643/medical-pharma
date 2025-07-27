import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { corridors } from '@models/corridors';
import { manufacturers } from '@models/manufacturers';
import { warehouses } from '@models/products';
import { receiversAuditor } from '@models/receiver-auditors';
import { suppliers } from '@models/suppliers';
import { ColumnValue, columnHeaders } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { WebSocketService } from '@services/web-socket.service';
import { ToastrService } from 'ngx-toastr';
import { CheckboxModule } from 'primeng/checkbox/checkbox';
import { Subscription } from 'rxjs';

interface todaysHousingData {
  id: number;
  location: any;
  product_name: string;
  price: number;
  quantity_recieved: number;
  storage_name: string;
  amount_pre_import: number;
  amount_post_import: number;
  receiver_auditor: string;
  expiredAt_operatingNumber: string;
  order_number: number;
  reciever: string;
  created_at: string;
  supply_authorization_number: any;
  supply_authorization_name: any;
  supplied_at: string;
  purchase_id: number;
}
const datePipe = new DatePipe('en-EG');

@Component({
  selector: 'app-todays-housing',
  templateUrl: './todays-housing.component.html',
  styleUrls: ['./todays-housing.component.scss'],
})
export class TodaysHousingComponent implements OnInit {
  private subs = new Subscription();
  todaysHousingFilter!: FormGroup;
  isActiveTapArray: boolean[] = Array(7).fill(false);
  @ViewChild('myModal') myModal!: ElementRef;
  @ViewChild('Listmodel') Listmodel!: ElementRef<HTMLElement>;
  total: number = 0;
  todaysHousingData!: todaysHousingData[];
  corridors!: corridors[];
  warehouses!: warehouses[];
  suppliers!: suppliers[];
  receiversAuditor!: receiversAuditor[];
  manufacturers!: manufacturers[];
  activetab!: number;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private WebSocketService: WebSocketService,
    private toastr: ToastrService,
    private generalService: GeneralService
  ) {}

  // todayHousingHeader = [
  //   { field: 'received', header: 'تم الاستلام', type: "UncheckedBox" },
  //   { field: 'location', header: 'موقع الصنف', type: "normal" },
  //   { field: 'product_name', header: 'اسم الصنف', type: "normal" },
  //   { field: 'price', header: 'السعر', type: "normal" },
  //   { field: 'quantity_recieved', header: 'الكمية المستلمة', type: "normal" },
  //   { field: 'storage_name', header: 'اسم المخزن', type: "normal" },
  //   { field: 'amount_pre_import', header: 'الكمية قبل التوريد', type: "normal" },
  //   { field: 'amount_post_import', header: 'الكمية بعد التوريد', type: "normal" },
  //   { field: 'receiver_auditor', header: 'عامل توزيع الاستلامات', type: "normal" },
  //   { field: 'expiredAt_operatingNumber', header: 'التاريخ والتشغيلة', type: "normal" },
  //   { field: 'supply_authorization_number', header: 'رقم إذن التوريد ', type: "normal" },
  //   { field: 'supply_authorization_name', header: ' إسم المورد    ', type: "normal" },
  //   { field: 'supplied_at', header: 'وقت وتاريخ التوريد  ', type: "normal" }
  // ];

  columnsArray: columnHeaders[] = [
    {
      name: 'تم الاستلام',
    },
    {
      name: 'موقع الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'اسم الصنف',
      sort: true,
      direction: null,
    },
    {
      name: 'السعر',
    },
    {
      name: 'الكمية المستلمة',
    },
    {
      name: 'اسم المخزن',
    },
    {
      name: 'الكمية قبل التوريد',
    },
    {
      name: 'الكمية بعد التوريد',
    },
    {
      name: 'عامل توزيع الاستلامات',
    },
    {
      name: 'التاريخ والتشغيلة',
    },
    {
      name: 'رقم إذن التوريد ',
    },
    {
      name: 'إسم المورد ',
    },
    {
      name: ' وقت وتاريخ التوريد ',
    },
  ];

  columnsName: ColumnValue[] = [
    {
      name: 'received',
      type: 'UncheckedBox',
    },
    {
      name: 'location',
      type: 'normal',
    },
    {
      name: 'product_name',
      type: 'normal',
    },
    {
      name: 'price',
      type: 'normal',
    },
    {
      name: 'quantity_recieved',
      type: 'normal',
    },
    {
      name: 'storage_name',
      type: 'normal',
    },
    {
      name: 'amount_pre_import',
      type: 'normal',
    },
    {
      name: 'amount_post_import',
      type: 'normal',
    },
    {
      name: 'receiver_auditor',
      type: 'normal',
    },
    {
      name: 'expiredAt_operatingNumber',
      type: 'normal',
    },
    {
      name: 'supply_authorization_number',
      type: 'normal',
    },
    {
      name: 'supply_authorization_name',
      type: 'normal',
    },
    {
      name: 'supplied_at',
      type: 'normal',
    },
  ];

  productType = [
    { id: 0, name: 'سائل', en: 'Liquid' },
    { id: 1, name: 'قرص', en: 'Tablet' },
    { id: 2, name: 'الحقن', en: 'Injections' },
    { id: 3, name: 'كبسولات', en: 'Capsules' },
    { id: 4, name: 'قطرة', en: 'drops' },
    { id: 5, name: 'لبوس', en: 'suppository' },
  ];

  getCorridorData() {
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridors = res.data;
          this.corridors.unshift({ id: 0, number: ' كل' });
        },
      })
    );
  }
  // getWarehouseData() {
  //   this.subs.add(this.generalService.getWarehouses().subscribe({
  //     next: res => {
  //       this.warehouses = res.data

  //     }
  //   }))
  // }
  // getSupplierData() {
  //   this.subs.add(this.generalService.getSuppliers().subscribe({
  //     next: res => {
  //       this.suppliers = res.data

  //     }
  //   }))
  // }
  // getReceiverAuditorData() {
  //   this.subs.add(this.generalService.getReceiverAuditor().subscribe({
  //     next: res => {
  //       this.receiversAuditor = res.data

  //     }
  //   }))
  // }
  // getManufactuereData() {
  //   this.subs.add(this.generalService.getManufacturers().subscribe({
  //     next: res => {
  //       this.manufacturers = res.data
  //       this.suppliers = res.data.suppliers
  //       this.warehouses=res.data.warehouses
  //       this.receiversAuditor=res.data.receiving_auditors

  //     }
  //   }))
  // }

  getDropdownData() {
    let params = [
      'warehouses',
      'suppliers',
      'manufacturers',
      'receiving_reviewer',
    ];
    this.subs.add(
      this.generalService.getDropdownData(params).subscribe({
        next: (res) => {
          this.warehouses = res.data.warehouses;
          this.suppliers = res.data.suppliers;
          this.manufacturers = res.data.manufacturers;
          this.receiversAuditor = res.data.receiving_reviewer;
        },
      })
    );
  }

  multiple_corridors_enabled!: string;
  ngOnInit() {
    this.multiple_corridors_enabled = String(
      localStorage.getItem('multiple_corridors_enabled')
    );
    if (this.multiple_corridors_enabled == 'false') {
      const location_index_array = this.columnsArray.findIndex(
        (c: any) => c.field == 'موقع الصنف'
      );
      const location_index_name = this.columnsName.findIndex(
        (c: any) => c.field == 'location'
      );
      if (location_index_array > -1) {
        this.columnsArray.splice(location_index_array, 1);
      }
      if (location_index_name > -1) {
        this.columnsName.splice(location_index_name, 1);
      }
    }
    this.getAllCorridores();
    this.isActiveTapArray[0] = true;
    // this.WebSocketService.connect();
    // this.WebSocketService.getNewMessageHousing().subscribe((message: any) => {
    //   if(message.action=="added"){
    //     let tempArr=[]
    //     tempArr.push(message.order)
    //     this.setDataInTable(tempArr)
    //   }
    //   else{
    //     const orderIndex=this.todaysHousingData.findIndex((c:any)=>c.order_id==message.order.id)
    //     if(orderIndex>-1){
    //       this.todaysHousingData.splice(orderIndex,1)
    //     }
    //   }

    // })
    this.WebSocketService.setupConnectionHandlers();

    this.WebSocketService.getNewMessageHousing().subscribe((message: any) => {
      let tempArr: any = [];

      if (message.action == 'added') {
        const isCorridorIdPresent = message.batches_count.some(
          (corridor: any) => corridor.corridor_id === this.activeCorridorId
        );
        if (isCorridorIdPresent) {
          message.batches_count.forEach((order: any) => {
            order.batches.forEach((batch: any) => {
              tempArr.push(batch);
            });
          });
          this.setDataInTable(tempArr);
        }
      } else {
        message.batches_count.forEach((order: any) => {
          order.batches.forEach((batch: any) => {
            const orderIndex = this.todaysHousingData.findIndex(
              (c: any) => c.id == message.id
            );
            if (orderIndex > -1) {
              this.todaysHousingData.splice(orderIndex, 1);
            }
          });
        });
      }
      this.corridorsUsed.map((item1: any) => {
        let match = message.batches_count.find(
          (item2: any) => item2.corridor_id == item1.id
        );
        if (match) {
          item1.count = match?.count;
        }
      });
    });

    this.todaysHousingFilter = this.fb.group({
      product_name: [''],
      corridor_id: [''],
      receiver_auditor_id: [''],
      price: [''],
      manufacturer_id: [''],
      warehouse_id: [''],
      supplier_id: [''],
      product_type: [''],
      quantity_before_supplying: [''],
      quantity: [''],
      quantity_after_supplying: [''],
      code: [''],
      supplied_at: [''],
      date_inventory: [''],
    });
    this.todaysHousingFilter.controls['supplied_at'].setValue(new Date());
    this.todaysHousingFilter.controls['corridor_id'].setValue(
      Number(localStorage.getItem('activeTab'))
    );
  }

  getFilterDropdownData() {
    // this.getReceiverAuditorData()
    // this.getSupplierData()
    // this.getWarehouseData()
    // this.getManufactuereData()
    this.getDropdownData();
    this.getCorridorData();
  }
  lastClickedTab: number | null = null;
  clickedTabs: boolean[] = [];
  disableCorridorsDropdown = false;
  activeCorridorId!: number;
  changeActiveTap(index: number) {
    this.setActiveTabNumber(index);

    this.activetab = index;
    this.clickedTabs[index] = true;
    this.lastClickedTab = index;

    localStorage.setItem('activeTab', String(index));
    if (index != 6) {
      this.isActiveTapArray.fill(false);
      this.isActiveTapArray[index] = true;
    } else {
      this.isActiveTapArray.fill(false);
    }

    const corridor = this.corridorsUsed.findIndex(
      (c: any) => c.number == Number(index)
    );

    if (corridor > -1) {
      this.activeCorridorId = this.corridorsUsed[corridor].id;
      if (this.corridorsUsed[corridor].id != this.allCorridorId) {
        this.disableCorridorsDropdown = true;
      } else {
        this.disableCorridorsDropdown = false;
      }
      this.getTodaysHousingData(this.corridorsUsed[corridor].id);
      this.todaysHousingFilter?.controls['corridor_id']?.setValue(
        this.corridorsUsed[corridor].id
      );
    }
  }

  setActiveTabNumber(index: any) {
    localStorage.setItem('activeTab', index);
  }

  getTodaysHousingFilteredData(sortData?: any) {
    if (this.multiple_corridors_enabled == 'false') {
      this.todaysHousingFilter.removeControl('corridor_id');
    }
    let formatted_supplied_at = datePipe.transform(
      this.todaysHousingFilter.controls['supplied_at'].value,
      'yyyy-MM-dd'
    );
    const params: any = {};

    for (const key in this.todaysHousingFilter.value) {
      const value = this.todaysHousingFilter.value[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key == 'corridor_id') {
          if (Number(value) != Number(this.allCorridorId)) {
            params[key] = value;
          }
        } else if (key == 'supplied_at') {
          params[key] = formatted_supplied_at;
        } else {
          params[key] = value;
        }
      }
    }
    if (sortData) {
      params['sort_by'] = sortData.name;
      params['direction'] = sortData.direction;
    }
    this.subs.add(
      this.http
        .getReq('warehouses/batches/storing', { params: params })
        .subscribe({
          next: (res) => {
            this.todaysHousingData = [];
            this.setDataInTable(res?.data);
            this.total = this.todaysHousingData.length;
          },
          complete: () => {
            this.lastClickedTab =
              this.todaysHousingFilter?.controls?.['corridor_id']?.value;

            const corridor_index = this.corridorsDropDownData.findIndex(
              (c: any) =>
                c.id ==
                this.todaysHousingFilter?.controls?.['corridor_id']?.value
            );
            if (corridor_index > -1) {
              this.isActiveTapArray.fill(false);
              this.isActiveTapArray[corridor_index] = true;
              this.activetab = corridor_index;
            }
            setTimeout(() => {
              this.closeModalClick();
            }, 200);
          },
        })
    );
  }

  setDataInTable(data: any) {
    data?.forEach((element: any) => {
      this.todaysHousingData.push({
        id: element.id,
        location: `${element?.corridor?.number} / ${element.stand} - ${element.shelf}`,
        product_name: element.product.name,
        purchase_id: element.purchase.id,
        price: element.batch_price,
        quantity_recieved: element.quantity,
        storage_name: element.warehouse.name,
        amount_pre_import: element?.quantity_before_supplying,
        amount_post_import: element.quantity_after_supplying,
        receiver_auditor: element.receiver_auditor.name,
        expiredAt_operatingNumber: `${element.expired_at} - ${element.operating_number}`,
        order_number: element.code,
        reciever: element?.supplier?.name,
        created_at: element.created_at,
        supply_authorization_number: element?.purchase?.purchase_number,
        supply_authorization_name: element?.supplier?.name,
        supplied_at: element.supplied_at,
      });
    });
  }

  @ViewChild('closeModal') closeModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeModal.nativeElement;
    el.click();
  }

  getTodaysHousingData(corridorNum?: any) {
    this.todaysHousingData = [];
    let corridorsCount: any = [];
    let params = {};
    if (corridorNum != this.allCorridorId) {
      params = {
        corridor_id: corridorNum,
      };
    } else {
      params = {};
    }
    this.subs.add(
      this.http
        .getReq('warehouses/batches/storing', { params: params })
        .subscribe({
          next: (res) => {
            corridorsCount = res.additional_data.counts;

            res?.data?.forEach((element: any) => {
              let corridor_stand_shelf = `${element?.corridor?.number} / ${element.stand} - ${element.shelf}`;
              let productName = element.product.name;
              let price = element.batch_price;
              let quantity = element.quantity;
              let warehouseName = element.warehouse.name;
              let amountPreImport = element?.quantity_before_supplying;
              let amountPostImport = quantity + amountPreImport;
              let receiverAuditor = element.receiver_auditor.name;
              let expiredAt_operatingNumber = `${element.expired_at} - ${element.operating_number}`;
              let order_number = element.code;
              let reciever = element?.supplier?.name;
              let createdAt = element.created_at;
              let supply_authorization_number =
                element.purchase.purchase_number;
              let supply_authorization_name = element?.supplier?.name;
              let supplied_at = element.supplied_at;

              this.todaysHousingData.push({
                id: element.id,
                location: corridor_stand_shelf,
                product_name: productName,
                purchase_id: element.purchase.id,
                price: price,
                quantity_recieved: quantity,
                storage_name: warehouseName,
                amount_pre_import: amountPreImport,
                amount_post_import: amountPostImport,
                receiver_auditor: receiverAuditor,
                expiredAt_operatingNumber: expiredAt_operatingNumber,
                order_number: order_number,
                reciever: reciever,
                created_at: createdAt,
                supply_authorization_number: supply_authorization_number,
                supply_authorization_name: supply_authorization_name,
                supplied_at: supplied_at,
              });
            });
            this.total = this.todaysHousingData.length;
          },
          complete: () => {
            this.corridorsUsed.map((item1: any) => {
              let match = corridorsCount.find(
                (item2: any) => item2.corridor_id == item1.id
              );
              if (match) {
                item1.count = match?.count;
              }
            });
          },
        })
    );
  }

  selectedIds: number[] = [];

  handleCheckboxChange(updatedIds: number[]) {
    this.selectedIds = updatedIds;
  }

  storedItems() {
    let param = new FormData();
    this.selectedIds.forEach((item: any, index: number) => {
      param.set(`batch_ids[${index}][batch_id]`, String(item.batch_id));
      param.set(`batch_ids[${index}][purchase_id]`, String(item.purchase_id));
    });
    let message = '';
    this.subs.add(
      this.http
        .postReq('warehouses/batches/complete-storing', param)
        .subscribe({
          next: (res) => {
            message = res.message;
          },
          complete: () => {
            this.toastr.success(message);
            setTimeout(() => {
              window.location.reload();
            }, 500);
          },
          error: () => {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          },
        })
    );
  }

  corridorsUsed: any = [];
  allCorridorId!: number;
  corridorsDropDownData: corridors[] = [];
  getAllCorridores() {
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridorsUsed = res.data;
          this.isActiveTapArray = new Array(res.data.length).fill(false);
          let corridors = res.data;
          res.data.forEach((c: any) => {
            if (c.is_main_corridor) {
              this.corridorsDropDownData.push({
                name: 'كل',
                id: c.id,
                number: c.number,
                is_main_corridor: c.is_main_corridor,
              });
            } else {
              this.corridorsDropDownData.push({
                name: c.number,
                id: c.id,
                number: c.number,
                is_main_corridor: c.is_main_corridor,
              });
            }
          });
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
}
