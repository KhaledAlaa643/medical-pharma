import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";




interface BatchID {
  batch_id: number;
  status: number;
  cart_id: number;

}
@Component({
  selector: 'app-warehouse-table',
  templateUrl: './warehouse-table.component.html',
  styleUrls: [ './warehouse-table.componenet.scss' ],
  standalone:false
})




export class WareHouseTable implements OnInit, OnChanges {

  @Input() dummydata: any
  @Input() columns!: any[];
  @Input() AllData!: any
  @Input() IdToHighlight!: any
  @Input() ProductToHighlight!: any
  @Input() productQuantity!: any
  @Input() scanToHighight!: any
  warehouseFilter!: FormGroup
  @Input() showCheckbox!: boolean;
  data: any
  @Output() clickEvent = new EventEmitter<string>();
  constructor(private fb: FormBuilder, private router: Router) { }
  @Output() itemClicked = new EventEmitter<any>()
  @Output() openModalEvent = new EventEmitter<void>();
  //all orders page
  @Output() openInvoiceDetails = new EventEmitter<any>();
  @Output() editOrderEvent = new EventEmitter<any>();

  @Input() modifyBatchCustomStyleButton: any = {};
  @Output() itemUnchecked = new EventEmitter<number>();
  @Output() itemChecked = new EventEmitter<number[]>();
  checkedIds: number[] = [];

  @Output() batchesIDsChanged = new EventEmitter<any[]>();
  @Output() modalButtonClicked = new EventEmitter<any>();
  @Output() returnModalButtonClicked = new EventEmitter<any>();
  @Output() cancelReviewedModalButtonClicked = new EventEmitter<any>();
  @Output() cancelReturnButtonClicked = new EventEmitter<any>();

  @Output() printInvoiceEvent = new EventEmitter<any>();
  @Output() eyeIconClicked: EventEmitter<number> = new EventEmitter<number>();
  @Output() productClickEvent: EventEmitter<any> = new EventEmitter<any>();
  @Input() scannedBarcode: string | null = null;


  sortState: 'asc' | 'desc' = 'asc';
  sortIcon: string = '../../../../assets/images/preparing-single-product/sort-icon.svg';

  onSortIcons(field: string) {
    this.sortState = this.sortState === 'asc' ? 'desc' : 'asc';
    this.sortIcon = this.sortState === 'asc' ? '../../../../assets/images/preparing-single-product/sort-up-arrow.svg' : '../../../../assets/images/preparing-single-product/sort-down-icon.svg';
  }

  handleClickableTextClick(data: any) {
    this.openModalEvent.emit(data);
  }
  handleModalButtonClick(data: any) {
    this.modalButtonClicked.emit(data);
  }
  cancelReturnModalButtonClicked(data: any) {
    this.cancelReturnButtonClicked.emit(data)
  }

  returnCartModalButtonClicked(data: any) {
    this.returnModalButtonClicked.emit(data);

  }
  cancelReviewedModalButtonClick(data: any) {
    this.cancelReviewedModalButtonClicked.emit(data);
  }
  orderDetailsEventEmit(pharmacyId: number, orderId: number) {
    let data = {
      'pharmacyId': pharmacyId,
      'orderId': orderId
    }
    this.openInvoiceDetails.emit(data);
  }
  checkedData: any = []
  checkedDataReview: any = []
  ngOnChanges(changes: SimpleChanges) {
    this.checkedData = []
    if (changes[ "dummydata" ]) {
      this.dummydata.forEach((item: any) => {
        if (item?.checked == true) {
          this.checkedData.push(item)
        }
      })
      this.dummydata.forEach((item: any) => {
        if (item?.completed_at == true) {
          this.checkedDataReview.push(item)
        }
      })
    }

    if (changes[ "dummydata" ] && changes[ "dummydata" ].currentValue) {
      this.dummydata.forEach((item: any) => {
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
        const index = this.batchesIDs.findIndex((c) => c.batch_id === item.id)
        if (!item.completed_at && !item.checked && index == -1)
          this.batchesIDs.push({
            batch_id: item.id,
            status: item.statusChecked ? 2 : 1,
            cart_id: item.cart_id
          });

      });
      this.batchesIDsChanged.emit(this.batchesIDs);
    }
  }
  onCheckboxChange(item: any) {
    if (!item.checked) {
      this.itemUnchecked.emit(item.id);
    }
  }
  batchesIDs: BatchID[] = [];


  onStatusCheckboxChange(i: any) {
    let batch_id = this.dummydata[ i ].id
    const index = this.batchesIDs.findIndex((c: any) => c.batch_id == batch_id)
    if (index > -1) {
      if (this.batchesIDs[ index ].status == 1) {
        this.batchesIDs[ index ].status = 2
      }
      else {
        this.batchesIDs[ index ].status = 1
      }
    }
    this.batchesIDsChanged.emit(this.batchesIDs);
  }


  onUncheckedCheckboxChange(item: any) {

    if (item.unchecked) {
      if (!this.checkedIds.includes(item.id)) {
        this.checkedIds.push(item.id);
      }
    } else {
      const index = this.checkedIds.indexOf(item.id);
      if (index > -1) {
        this.checkedIds.splice(index, 1);
      }
    }
    this.itemChecked.emit(this.checkedIds);
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.onSearchSortClickSearch(input.value);
  }

  sortStates: { [ key: string ]: { state: 'asc' | 'desc', icon: string } } = {};

  onSearchSortClickSort(field: string) {
    Object.keys(this.sortStates).forEach(key => {
      if (key !== field) {
        this.sortStates[ key ] = { state: 'asc', icon: '../../../../assets/images/preparing-single-product/sort-icon.svg' };
      }
    });

    const currentState = this.sortStates[ field ].state;
    this.sortStates[ field ].state = currentState === 'asc' ? 'desc' : 'asc';
    this.sortStates[ field ].icon = currentState === 'asc' ? '../../../../assets/images/preparing-single-product/sort-up-arrow.svg' : '../../../../assets/images/preparing-single-product/sort-down-icon.svg';
    this.sortEvent.emit({ invoice_id: this.clickedId, sort_by: field, direction: this.sortStates[ field ].state });
  }

  onSearchSortClickSearch(searchTerm: string) {
    // Implement search logic or emit event
  }

  onSearchSortClickItemClicked(data: any) {
    this.itemClicked.emit(data);
  }


  emitEvent(eventType: any, orderNumber?: number, pharmacyId?: number) {

    if (eventType == 'orderDetailsEventEmit') {
      let data = {
        'pharmacyId': pharmacyId,
        'orderNumber': orderNumber
      }
      this.openInvoiceDetails.emit(data);
    }
    else if (eventType == 'editOrderEvent') {
      this.editOrderEvent.emit(orderNumber);
    }

  }
  activeURL!: string
  showBlueBorder: boolean = false
  ngOnInit(): void {
    this.activeURL = this.router.url
    if (this.activeURL.includes('/single-products-reviewer') || this.activeURL.includes('/bulk-products-reviewer')) {
      this.showBlueBorder = true
    }
    this.warehouseFilter = this.fb.group({
      name: [ '' ],
      station_id: [ '' ],
      price: [ '' ],
      producer: [ '' ],
      storage_id: [ '' ],
      importer_id: [ '' ],
      returns: [ '' ],
      amount_before_export: [ '' ],
      quantity_recieved: [ '' ],
      amount_after_export: [ '' ],
      export_invoice_number: [ '' ],
      date: [ '' ],
      identification: [ '' ],
    })

    this.columns.forEach(col => {
      if (col.type === 'sortByType' || col.type === 'search-sort-click') {
        this.sortStates[ col.field ] = { state: 'asc', icon: '../../../../assets/images/preparing-single-product/sort-icon.svg' };
      }
    });
  }
  clickEventEmit(data: string) {

    this.clickEvent.emit(data)
  }
  handleEyeIconClick(data: any) {
    this.openModalEvent.emit(data);

    this.eyeIconClicked.emit(data.id);

  }
  eyeIconNavigateToPage(data: any) {
    this.openModalEvent.emit(data);
    this.eyeIconClicked.emit(data.id);
  }

  logId(id: number) {
  }

  @Output() noteClicked = new EventEmitter<string>();
  openNotesModal(note: string): void {

    this.noteClicked.emit(note);
  }

  @Output() sortEvent = new EventEmitter<{ invoice_id: any, sort_by: string, direction: string }>();

  clickedId: any
  onSort(field: string) {

    Object.keys(this.sortStates).forEach(key => {
      if (key !== field) {
        this.sortStates[ key ] = { state: 'asc', icon: '../../../../assets/images/preparing-single-product/sort-icon.svg' };
      }
    });

    if (!this.sortStates[ field ]) {
      this.sortStates[ field ] = { state: 'asc', icon: '../../../../assets/images/preparing-single-product/sort-icon.svg' };
    } else {
      const currentState = this.sortStates[ field ].state;
      this.sortStates[ field ].state = currentState === 'asc' ? 'desc' : 'asc';
      this.sortStates[ field ].icon = currentState === 'asc' ? '../../../../assets/images/preparing-single-product/sort-up-arrow.svg' : '../../../../assets/images/preparing-single-product/sort-down-icon.svg';
    }
    this.sortEvent.emit({ invoice_id: this.clickedId, sort_by: field, direction: this.sortStates[ field ].state });
  }

  sendProductData(data: any) {
    this.productClickEvent.emit(data)
  }



}


