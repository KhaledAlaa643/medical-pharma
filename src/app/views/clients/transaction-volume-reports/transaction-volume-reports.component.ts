import {
  Component,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Renderer2,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpService } from '@services/http.service';
import * as moment from 'moment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transaction-volume-reports',
  templateUrl: './transaction-volume-reports.component.html',
  styleUrls: ['./transaction-volume-reports.component.scss'],
})
export class TransactionVolumeReportsComponent implements OnInit, OnDestroy {
  ReportForm!: FormGroup;
  isSmallScreen: boolean = false;
  private subs = new Subscription();
  CashPaymentsData: any = [];
  clientsData: any = [];
  recievedReportData: any = [];
  recievedReportDataLowerArea: any = [];

  recievedReportOweData: any = [];
  recievedReportOweLowerArea: any = [];

  constructor(
    private fb: FormBuilder,
    private renderer: Renderer2,
    private http: HttpService
  ) {}

  @Input() ReportData: any;
  // @Input() ReportLowerArea: any;
  // @Input() ReportOweLowerArea: any;
  @Input() tabIndex: any;

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (this.ReportData) this.recievedReportData = this.ReportData;
  //   if (this.ReportLowerArea)
  //     this.recievedReportDataLowerArea = this.ReportLowerArea;
  //   if (this.recievedReportDataLowerArea) {
  //     this.recievedReportOweLowerArea = this.ReportOweLowerArea;
  //   }

  //   if (changes['tabIndex']) {
  //     this.ReportData = 0;
  //   }
  // }

  ngOnInit() {
    console.log('ReportData', this.ReportData);
    this.ReportForm = this.fb.group({
      ordersTotal: [''],
      purchasesTotal: [''],
      cash_payments_total: [''],
      adjustment_notes_total: [''],
      transferred_balance_to: [''],
      debit: [''],
      returnsTotal: [''],
      purchasesReturnsTotal: [''],
      cash_Receives_total: [''],
      adjustment_note_discount: [''],
      transferred_balance_from: [''],
      credit: [''],
    });
    this.ReportForm.patchValue(this.ReportData);
  }
  getAbsoluteValue(value: number): number {
    return Math.abs(value);
  }

  clearData() {}

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.recievedReportDataLowerArea = [];
    // this.ReportLowerArea = [];
  }
}
