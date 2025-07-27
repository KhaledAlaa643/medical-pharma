import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { ColumnValue, columnHeaders } from '@models/tableData';

@Component({
  selector: 'app-printing-options-popup',
  templateUrl: './printing-options-popup.component.html',
  styleUrls: ['./printing-options-popup.component.scss'],
  standalone:false
})
export class PrintingOptionsPopupComponent implements OnInit {
  columnsArray: columnHeaders[] = [];
  @Input() RowsData: any = [];
  @Input() RowsDataSharedTable: any = [];
  @Input() inSharedTable: boolean = false;
  columnsNames: ColumnValue[] = [];
  @Input() paginated!: boolean;
  @Input() paginatedSharedTable!: boolean;
  selectionArray = new Array(2).fill(false);
  @Output() printData = new EventEmitter<any>();
  @Output() printDataSharedTable = new EventEmitter<any>();

  constructor() {}

  ngOnInit() {
    this.selectionArray[0] = true;
  }

  @ViewChild('closeModal') closeModal!: ElementRef<HTMLElement>;
  closeModalClick() {
    let el: HTMLElement = this.closeModal.nativeElement;
    el.click();
  }

  @ViewChild('PintingOptionsModal')
  PintingOptionsModal!: ElementRef<HTMLElement>;
  @ViewChild('PintingOptionssharedTableModal')
  PintingOptionssharedTableModal!: ElementRef<HTMLElement>;
  openAddModal() {
    let el: HTMLElement = this.PintingOptionsModal.nativeElement;
    el.click();
  }
  opensharedTableModal() {
    let el: HTMLElement = this.PintingOptionssharedTableModal.nativeElement;
    el.click();
  }

  selectType(index: number) {
    this.selectionArray.fill(false);
    this.selectionArray[index] = true;
  }

  emitPrintData(amountOfPrint: number) {
    //amountOfPrint
    //1 for print first page
    //2 for print all data

    //type
    //1 for pdf
    //2 for excel

    if (this.selectionArray[0]) {
      this.printData.emit({ amountOfPrint: amountOfPrint, type: 1 });
    } else {
      this.printData.emit({ amountOfPrint: amountOfPrint, type: 2 });
    }
  }
  emitPrintDataSharedTable(amountOfPrint: number) {
    //amountOfPrint
    //1 for print first page
    //2 for print all data

    //type
    //1 for pdf
    //2 for excel

    if (this.selectionArray[0]) {
      this.printDataSharedTable.emit({ amountOfPrint: amountOfPrint, type: 1 });
    } else {
      this.printDataSharedTable.emit({ amountOfPrint: amountOfPrint, type: 2 });
    }
  }
}
