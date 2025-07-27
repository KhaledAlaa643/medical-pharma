import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { warehouses } from '@models/products';
import { receiversAuditor } from '@models/receiver-auditors';
import { manufacturers } from '@models/manufacturers';
import { suppliers } from '@models/suppliers';
import { HttpService } from '@services/http.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { corridors } from '@models/corridors';
import { WebSocketService } from '@services/web-socket.service';
import { GeneralService } from '@services/general.service';
import { ColumnValue, columnHeaders } from '@models/tableData';
const datePipe = new DatePipe('en-EG');

interface todaysReceiptsData {
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
  supplied_at: string;
  auditor_received_at: string;
  purchase_id: number;
}

@Component({
  selector: 'app-todays-receipts',
  templateUrl: './todays-receipts.component.html',
  styleUrls: ['./todays-receipts.component.scss'],
})
export class TodaysReceiptsComponent implements OnInit {
  private subs = new Subscription();
  todaysReceiptsFilter!: FormGroup;
  isActiveTapArray: boolean[] = Array(6).fill(false);
  @ViewChild('myModal') myModal!: ElementRef;
  @ViewChild('Listmodel') Listmodel!: ElementRef<HTMLElement>;
  showCheckbox?: boolean;
  todaysReceiptsData: todaysReceiptsData[] = [];
  total: number = 0;
  corridors!: corridors[];

  warehouses!: warehouses[];
  suppliers!: suppliers[];
  receiversAuditor!: receiversAuditor[];
  manufacturers!: manufacturers[];
  currentCorridorNumber!: number;
  activetab!: number;
  multiple_corridors_enabled!: string;

  constructor(
    private http: HttpService,
    private WebSocketService: WebSocketService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private generalService: GeneralService
  ) {}

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

  getFilterDropdownData() {
    this.getDropdownData();
  }

  productType = [
    { id: 0, name: 'سائل', en: 'Liquid' },
    { id: 1, name: 'قرص', en: 'Tablet' },
    { id: 2, name: 'الحقن', en: 'Injections' },
    { id: 3, name: 'كبسولات', en: 'Capsules' },
    { id: 4, name: 'قطرة', en: 'drops' },
    { id: 5, name: 'لبوس', en: 'suppository' },
  ];

  columnsArray: columnHeaders[] = [
    {
      name: 'تم الاستلام',
    },
    {
      name: 'موقع الصنف',
    },
    {
      name: 'اسم الصنف',
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
      name: 'مراجع الاستلام',
    },
    {
      name: 'التاريخ والتشغيلة',
    },
    {
      name: 'رقم اذن التوريد',
    },
    {
      name: 'اسم المورد ',
    },
    {
      name: 'وقت و تاريخ التوريد',
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
      name: 'order_number',
      type: 'normal',
    },
    {
      name: 'reciever',
      type: 'normal',
    },
    {
      name: 'supplied_at',
      type: 'normal',
    },
  ];

  ngOnInit() {
    this.multiple_corridors_enabled = String(
      localStorage.getItem('multiple_corridors_enabled')
    );
    if (this.multiple_corridors_enabled == 'false') {
      const location_index_array = this.columnsArray.findIndex(
        (c: any) => c.name == 'موقع الصنف'
      );
      const location_index_name = this.columnsName.findIndex(
        (c: any) => c.name == 'location'
      );
      if (location_index_array > -1) {
        this.columnsArray.splice(location_index_array, 1);
      }
      if (location_index_name > -1) {
        this.columnsName.splice(location_index_name, 1);
      }
    }
    this.getFilterDropdownData();
    this.getAllCorridores();

    this.isActiveTapArray[0] = true;

    this.todaysReceiptsFilter = this.fb.group({
      product_name: [''],
      corridor_id: [''],
      price: [''],
      manufacturer_id: [''],
      warehouse_id: [''],
      supplier_id: [''],
      receiver_reviewer_id: [''],
      quantity_before_supplying: [''],
      quantity: [''],
      quantity_after_supplying: [''],
      code: [''],
      supplied_at: [''],
      product_type: [''],
    });
    this.todaysReceiptsFilter.controls['supplied_at'].setValue(new Date());
    this.todaysReceiptsFilter.controls['corridor_id'].setValue(
      Number(localStorage.getItem('activeTab'))
    );
  }
  corridorsUsed: any;
  allCorridorId: any;
  corridorsDropDownData: any = [];
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

  activeCorridorId!: number;
  lastClickedTab: number | null = null;
  clickedTabs: boolean[] = [];
  disableCorridorsDropdown = false;
  changeActiveTap(index: number) {
    this.setActiveTabNumber(index);
    this.clickedTabs[index] = true;
    this.lastClickedTab = index;
    this.activetab = index;
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
      this.getTodaysReceiptsData(this.corridorsUsed[corridor].id);
    }
  }

  setActiveTabNumber(index: any) {
    localStorage.setItem('activeTab', index);
    this.todaysReceiptsFilter?.controls['corridor_id']?.setValue(
      Number(localStorage.getItem('activeTab'))
    );
  }

  getTodaysReceiptsFilteredData() {
    let formatteddate = datePipe.transform(
      this.todaysReceiptsFilter.controls['supplied_at'].value,
      'yyyy-MM-dd'
    );
    // if (formatteddate !== null) {
    //   this.todaysReceiptsFilter.controls[ 'supplied_at' ].setValue(formatteddate)
    // }
    // else {
    //   this.todaysReceiptsFilter.controls[ 'supplied_at' ].setValue('')
    // }
    if (this.multiple_corridors_enabled == 'false') {
      this.todaysReceiptsFilter.removeControl('corridor_id');
    }
    if (!this.todaysReceiptsFilter.controls['supplied_at'].value) {
    }

    const params: any = {};
    for (const key in this.todaysReceiptsFilter.value) {
      const value = this.todaysReceiptsFilter.value[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key == 'supplied_at') {
          params[key] = formatteddate;
        } else if (key != 'corridor_id') {
          params[key] = value;
        } else {
          if (Number(value) != Number(this.allCorridorId)) {
            params[key] = value;
          }
        }
      }
    }
    this.subs.add(
      this.http
        .getReq('warehouses/batches/receiving', { params: params })
        .subscribe({
          next: (res) => {
            this.todaysReceiptsData = [];
            res?.data?.forEach((element: any) => {
              this.todaysReceiptsData.push({
                id: element.id,
                location: `${element.corridor?.number} / ${element.stand} - ${element.shelf}`,
                product_name: element.product.name,
                price: element.batch_price,
                purchase_id: element.purchase.id,
                quantity_recieved: element?.quantity,
                storage_name: element.warehouse.name,
                amount_pre_import: element?.quantity_before_supplying,
                amount_post_import:
                  element?.quantity + element?.quantity_before_supplying,
                receiver_auditor: element.receiver_auditor.name,
                expiredAt_operatingNumber: `${element.expired_at} - ${element.operating_number}`,
                order_number: element?.purchase_number,
                reciever: element?.supplier?.name,
                supplied_at: element.supplied_at,
                auditor_received_at: element.auditor_received_at,
              });
            });
            this.total = this.todaysReceiptsData.length;
          },
          complete: () => {
            const corridor_index = this.corridorsDropDownData.findIndex(
              (c: any) =>
                c.id ==
                this.todaysReceiptsFilter?.controls?.['corridor_id']?.value
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

  corridorsCount: any = [];
  getTodaysReceiptsData(corridorNum?: any) {
    this.currentCorridorNumber = corridorNum;
    let params: any = {};
    if (corridorNum != this.allCorridorId) {
      params = {
        corridor_id: corridorNum,
      };
    }
    params['supplied_at'] = datePipe.transform(Date.now(), 'yyyy-MM-dd');
    this.todaysReceiptsFilter?.controls['corridor_id']?.setValue(
      this.currentCorridorNumber
    );
    this.subs.add(
      this.http
        .getReq('warehouses/batches/receiving', { params: params })
        .subscribe({
          next: (res) => {
            this.todaysReceiptsData = [];
            this.corridorsCount = res.additional_data.counts;
            this.setData(res.data);
            this.total = this.todaysReceiptsData.length;
          },
          complete: () => {
            this.corridorsUsed.map((item1: any) => {
              let match = this.corridorsCount.find(
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

  setData(data: any) {
    data?.forEach((element: any) => {
      this.todaysReceiptsData.push({
        id: element.id,
        purchase_id: element.purchase.id,
        location: `${element.corridor?.number} / ${element.stand} - ${element.shelf}`,
        product_name: element.product.name,
        price: element.batch_price,
        quantity_recieved: element?.quantity,
        storage_name: element.warehouse.name,
        amount_pre_import: element?.quantity_before_supplying,
        amount_post_import: element?.quantity_after_supplying,
        receiver_auditor: element.receiver_auditor.name,
        expiredAt_operatingNumber: `${element.expired_at} - ${element.operating_number}`,
        order_number: element?.purchase_number,
        reciever: element?.supplier?.name,
        supplied_at: element.supplied_at,
        auditor_received_at: element.auditor_received_at,
      });
    });
  }

  selectedIds: number[] = [];

  handleCheckboxChange(updatedIds: number[]) {
    this.selectedIds = updatedIds;
  }

  recievedItems() {
    // let param = {
    //   batch_ids: this.selectedIds
    // }
    let param = new FormData();
    this.selectedIds.forEach((item: any, index: number) => {
      param.set(`batch_ids[${index}][batch_id]`, String(item.batch_id));
      param.set(`batch_ids[${index}][purchase_id]`, String(item.purchase_id));
    });
    let message = '';
    this.subs.add(
      this.http
        .postReq('warehouses/batches/complete-receiving', param)
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
          error: () => {},
        })
    );
  }

  // setCancelledInvoice(event: any) {
  //   this.invoiceService.setCancelledInvoices(event)
  // }

  @ViewChild('closeModal') closeModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeModal.nativeElement;
    el.click();
  }
}
