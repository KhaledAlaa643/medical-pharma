import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-table-component',
  templateUrl: './table-component.component.html',
  styleUrls: ['./table-component.component.scss'],
})
export class TableComponentComponent implements OnInit, OnDestroy {
  @Input() apidata: any;
  @Input() title?: string;
  @Input() firstLowerTab?: string;
  @Input() secondLowerTab?: string;
  @Input() thirdLowerTab?: string;
  @Input() fourthLowerTab?: string;
  @Input() borderFix?: any;
  @Input() isLeft: boolean = false;
  @Input() lowerData?: any;
  @Input() lowerDataTwo?: any;
  @Input() TabPage: any;

  @Input() cashRecievedTotal!: number;
  @Input() currentPageRecieved!: number;
  @Input() cashPaymentTotal!: number;
  @Input() currentPagePayment!: number;

  @Input() salesTotal!: number;
  @Input() currentPageSales!: number;

  @Input() returnSalesTotal!: number;
  @Input() currentPageReturnSales!: number;

  @Input() purchaseTotal!: number;
  @Input() currentPagePurchase!: number;

  @Input() returnPurchaseTotal!: number;
  @Input() currentPageReturnPurchase!: number;

  @Input() notificationDisountTotal!: number;
  @Input() notificationDisountCurrentPage!: number;

  @Input() NotifiationAdditionTotal!: number;
  @Input() notificationAdditionCurrentPage!: number;

  @Input() BalanceReceivedTotal!: number;
  @Input() BalanceReceivedTotalCurrentPage!: number;

  @Input() balanceTransferredDataTotal!: number;
  @Input() balanceTransferredDataCurrentPage!: number;

  @Output() openInvoiceDetails = new EventEmitter<any>();

  currentNumber: number = 1;
  clientDataForm!: FormGroup;
  isDataAvailable: boolean = true;

  constructor(private fb: FormBuilder) {}
  ngOnInit() {
    this.clientDataForm = this.fb.group({
      client_id: [''],
      pharmacy_id: [''],
      sales_id: [''],
      complaintBox: [''],
      client_name: [''],
      role_id: [''],
      userID: [''],
    });
  }

  ngOnDestroy() {}

  emitOpenEvent(data: any) {
    this.openInvoiceDetails.emit(data);
  }
}
