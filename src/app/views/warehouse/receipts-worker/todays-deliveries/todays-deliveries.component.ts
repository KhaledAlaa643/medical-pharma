import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { warehouses } from '@models/products';
import { suppliers } from '@models/suppliers';
import { receiversAuditor } from '@models/receiver-auditors';
import { AuthService } from '@services/auth.service';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';
import { manufacturers } from '@models/manufacturers';
import { DatePipe } from '@angular/common';
import { corridors } from '@models/corridors';
import { WebSocketService } from '@services/web-socket.service';
import { GeneralService } from '@services/general.service';
import { ColumnValue, columnHeaders } from '@models/tableData';
const datePipe = new DatePipe('en-EG');

interface todaysDeliveriesData {
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
  supplied_at: string;
  distributor_received_at: string;
}

@Component({
  selector: 'app-todays-deliveries',
  templateUrl: './todays-deliveries.component.html',
  styleUrls: ['./todays-deliveries.component.scss'],
})
export class TodaysDeliveriesComponent implements OnInit {
  todaysDeliveriesFilter!: FormGroup;
  isActiveTapArray: boolean[] = Array(7).fill(false);
  @ViewChild('myModal') myModal!: ElementRef;
  @ViewChild('Listmodel') Listmodel!: ElementRef<HTMLElement>;
  private subs = new Subscription();
  todaysDeliveriesData: todaysDeliveriesData[] = [];
  total: number = 0;
  corridors!: corridors[];
  warehouses!: warehouses[];
  suppliers!: suppliers[];
  receiversAuditor!: receiversAuditor[];
  manufacturers!: manufacturers[];
  currentCorridorNumber!: number;
  activetab!: number;

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private WebSocketService: WebSocketService,
    private generalService: GeneralService
  ) {}

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
    {
      name: 'وقت و تاريخ الاستلام',
    },
  ];

  columnsName: ColumnValue[] = [
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
    {
      name: 'distributor_received_at',
      type: 'normal',
    },
  ];
  corridorsUsed: any = [];
  allCorridorId: any;
  corridorsDropDownData: any = [];
  disableCorridorsDropdown = false;

  getAllCorridores() {
    this.subs.add(
      this.generalService.getCorridor().subscribe({
        next: (res) => {
          this.corridorsUsed = res.data;
          this.isActiveTapArray = new Array(res.data.length).fill(false);
          let corridors = res.data;
          console.log(this.corridorsUsed);
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

  multiple_corridors_enabled!: string;
  ngOnInit() {
    this.multiple_corridors_enabled = String(
      localStorage.getItem('multiple_corridors_enabled')
    );
    if (this.multiple_corridors_enabled == 'false') {
      const location_index_name = this.columnsName.findIndex(
        (c: any) => c.name == 'location'
      );
      const location_index_array = this.columnsArray.findIndex(
        (c: any) => c.name == 'موقع الصنف'
      );
      if (location_index_name > -1) {
        this.columnsName.splice(location_index_name, 1);
      }
      if (location_index_array > -1) {
        this.columnsArray.splice(location_index_array, 1);
      }
    }

    this.isActiveTapArray[0] = true;
    this.getAllCorridores();
    this.getFilterDropdownData();

    this.todaysDeliveriesFilter = this.fb.group({
      product_name: [''],
      corridor_id: [''],
      receiver_auditor_id: [''],
      price: [''],
      manufacturer_id: [''],
      warehouse_id: [''],
      supplier_id: [''],
      quantity_before_supplying: [''],
      quantity: [''],
      quantity_after_supplying: [''],
      code: [''],
      date: [''],
      date_inventory: [''],
      product_type: [''],
    });
    this.todaysDeliveriesFilter.controls['date_inventory'].setValue(new Date());
    this.todaysDeliveriesFilter.controls['corridor_id'].setValue(
      Number(localStorage.getItem('activeTab'))
    );
  }

  lastClickedTab: number | null = null;
  clickedTabs: boolean[] = [];
  activeCorridorId!: number;
  changeActiveTap(index: number) {
    this.setActiveTabNumber(index);

    this.clickedTabs[index] = true;
    this.activetab = index;
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
      if (this.corridorsUsed[corridor].id != this.allCorridorId) {
        this.disableCorridorsDropdown = true;
      } else {
        this.disableCorridorsDropdown = false;
      }
      this.activeCorridorId = this.corridorsUsed[corridor].id;
      this.getTodaysDeliveriesData(this.corridorsUsed[corridor].id);
    }
  }
  setActiveTabNumber(index: any) {
    localStorage.setItem('activeTab', index);
    this.todaysDeliveriesFilter?.controls['corridor_id']?.setValue(
      Number(localStorage.getItem('activeTab'))
    );
  }

  getTodaysDeliveriesData(corridorNum?: any) {
    let corridorsCount: any = [];
    this.currentCorridorNumber = corridorNum;

    let params: any = {};
    if (corridorNum != this.allCorridorId) {
      params = {
        corridor_id: corridorNum,
      };
    }
    this.todaysDeliveriesFilter?.controls['corridor_id']?.setValue(
      this.currentCorridorNumber
    );
    this.subs.add(
      this.http
        .getReq('warehouses/batches/received', { params: params })
        .subscribe({
          next: (res) => {
            corridorsCount = res.additional_data.counts;
            this.todaysDeliveriesData = [];
            this.setData(res.data);

            this.total = this.todaysDeliveriesData.length;
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

  setData(data: any) {
    data?.forEach((element: any) => {
      this.todaysDeliveriesData.push({
        id: element.id,
        location: `${element.corridor.number} / ${element.stand} - ${element.shelf}`,
        product_name: element.product.name,
        price: element.batch_price,
        quantity_recieved: element.quantity,
        storage_name: element.warehouse.name,
        amount_pre_import: element?.quantity_before_supplying,
        amount_post_import: element?.quantity_after_supplying,
        receiver_auditor: element.receiver_auditor.name,
        expiredAt_operatingNumber: `${element.expired_at} - ${element.operating_number}`,
        order_number: element?.purchase_number,
        reciever: element?.supplier?.name,
        created_at: element?.created_at,
        supplied_at: element?.supplied_at,
        distributor_received_at: element.distributor_received_at,
      });
    });
  }

  getTodaysDeliveriesFilteredData() {
    let formatteddate = datePipe.transform(
      this.todaysDeliveriesFilter.controls['date'].value,
      'yyyy-MM-dd'
    );
    let formatteddate_inventory = datePipe.transform(
      this.todaysDeliveriesFilter.controls['date_inventory'].value,
      'yyyy-MM-dd'
    );
    // this.todaysDeliveriesFilter.controls[ 'date_inventory' ].setValue(formatteddate_inventory)
    if (this.multiple_corridors_enabled == 'false') {
      this.todaysDeliveriesFilter.removeControl('corridor_id');
    }
    const params: any = {};

    for (const key in this.todaysDeliveriesFilter.value) {
      const value = this.todaysDeliveriesFilter.value[key];
      if (value !== null && value !== undefined && value !== '') {
        if (key == 'date_inventory') {
          params[key] = formatteddate_inventory;
        } else if (key == 'date') {
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
        .getReq('warehouses/batches/received', { params: params })
        .subscribe({
          next: (res) => {
            this.todaysDeliveriesData = [];

            res?.data?.forEach((element: any) => {
              this.todaysDeliveriesData.push({
                id: element.id,
                location: `${element.corridor.number} / ${element.stand} - ${element.shelf}`,
                product_name: element.product.name,
                price: element.batch_price,
                quantity_recieved: element.quantity,
                storage_name: element.warehouse.name,
                amount_pre_import: element?.quantity_before_supplying,
                amount_post_import:
                  element.quantity + element?.quantity_before_supplying,
                receiver_auditor: element.receiver_auditor.name,
                expiredAt_operatingNumber: `${element.expired_at} - ${element.operating_number}`,
                order_number: element?.purchase_number,
                reciever: element?.supplier.name,
                created_at: element?.created_at,
                supplied_at: element?.supplied_at,
                distributor_received_at: element.distributor_received_at,
              });
              this.total = this.todaysDeliveriesData.length;
            });
          },
          complete: () => {
            this.lastClickedTab =
              this.todaysDeliveriesFilter?.controls?.['corridor_id']?.value;

            const corridor_index = this.corridorsDropDownData.findIndex(
              (c: any) =>
                c.id ==
                this.todaysDeliveriesFilter?.controls?.['corridor_id']?.value
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
  @ViewChild('closeModal') closeModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeModal.nativeElement;
    el.click();
  }
}
