import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { commonObject, FiltersObject } from '@models/settign-enums';
import { columnHeaders, ColumnValue } from '@models/tableData';
import { AuthService } from '@services/auth.service';
import { ArabicNumberConverterService } from '@services/convert-num-to-words.service';
import { GeneralService } from '@services/general.service';
import { HttpService } from '@services/http.service';
import { PrintService } from '@services/print.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-show-cash-receipt',
  templateUrl: './show-cash-receipt.component.html',
  styleUrls: ['./show-cash-receipt.component.scss'],
})
export class ShowCashReceiptComponent {
  sub: Subscription = new Subscription();
  receiptId!: string;

  columnsArray: columnHeaders[] = [];
  data: any = [];

  pharmacy: any;
  receiveForm!: FormGroup;
  additional_data: any;
  columnsName: ColumnValue[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private auth: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpService,
    private printService: PrintService,
    private arabicConverter: ArabicNumberConverterService
  ) {}

  ngOnInit(): void {
    this.receiptId = this.activatedRoute.snapshot.paramMap.get('id')!;

    this.initForm();
    this.columnsArray = [
      {
        name: 'رقم الإذن',
      },
      {
        name: 'كود العميل',
      },

      {
        name: 'اسم العميل',
      },

      {
        name: 'المبلغ',
      },

      {
        name: ' خط السير',
      },

      {
        name: 'اسم المندوب',
      },

      {
        name: 'التاريخ',
      },
    ];
    this.columnsName = [
      {
        name: 'id',
        type: 'nameClickableBlue',
      },
      {
        name: 'account_id',
        type: 'normal',
      },

      {
        name: 'account_name',
        type: 'normal',
      },

      {
        name: 'amount',
        type: 'normal',
      },
      {
        name: 'track_name',
        type: 'normal',
      },
      {
        name: 'delivery_name',
        type: 'normal',
      },

      {
        name: 'created_at',
        type: 'normal',
      },
    ];

    this.getById();
  }

  initForm() {
    this.receiveForm = this.fb.group({
      created_at: [null],
      pharmacy: [null],
      safe: [null],
      amount: [null],
      amount_in_words: [null],
      note: [null],
      balance: [null],
      balance_after: [null],
      dateAndTime: [],
      receipt_number: [null],
      driver: [],
      sales: [],
      delivery: [],
      safe_number: [],
      code: [],
      receipt: [null],
      track: [null],
      account: [null],
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getById() {
    this.sub.add(
      this.http
        .getReq('accounting/cash-receipts/show-collection/' + this.receiptId)
        .subscribe({
          next: (res) => {
            console.log(res);
            this.additional_data = res.additional_data;
            this.data = res.data;
          },
          complete: () => {
            this.data = this.data.map((data: any, index: number) => {
              data['delivery_name'] = data?.delivery?.name;
              data['track_name'] = data?.track?.name;
              data['account_id'] = data?.account?.id;
              data['account_name'] = data?.account?.name;
              data['created_by_name'] = data?.created_by?.name;

              return data;
            });
          },
        })
    );
  }

  getReceiptFromId(event: any) {
    let selectedReceipt = this.data.find((receipt: any) => {
      return event == receipt.id;
    });
    console.log(selectedReceipt);

    this.receiveForm.patchValue({
      code: selectedReceipt.account.id,
      note: selectedReceipt.note,
      created_at: selectedReceipt.created_at,
      amount: selectedReceipt.amount,
      delivery: selectedReceipt?.delivery?.name,
      driver: selectedReceipt?.driver?.name,
      receipt: selectedReceipt.receipt,
      pharmacy: selectedReceipt?.account?.name,
      sales: selectedReceipt?.pharmacy?.delivery?.name,
      track: selectedReceipt?.track?.name,
      safe: selectedReceipt?.safe?.name,
      safe_number: selectedReceipt?.safe?.id,
      balance: selectedReceipt?.pharmacy?.balance,
      balance_after:
        selectedReceipt?.pharmacy?.balance - selectedReceipt.amount,
      amount_in_words: this.arabicConverter.convert(selectedReceipt.amount),
    });
  }

  print(printData: any) {
    this.printService.setColumnsArray(this.columnsArray);
    this.printService.setColumnsNames(this.columnsName);
    this.printService.setRowsData(this.data);

    if (printData.type == 1) {
      this.printService.downloadPDF();
    } else {
      this.printService.downloadCSV();
    }

    setTimeout(() => {
      this.openModal();
    }, 100);
  }

  @ViewChild('OpenOptionsModal') OpenOptionsModal!: ElementRef<HTMLElement>;
  openModal() {
    let el: HTMLElement = this.OpenOptionsModal.nativeElement;
    el.click();
  }

  onPrintForm() {
    this.printService.printForm('print-section');
  }
}
