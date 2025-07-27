import { Injectable } from '@angular/core';
import { ColumnValue, columnHeaders } from '@models/tableData';

@Injectable({
  providedIn: 'root',
})
export class PrintService {
  private columnsArray: columnHeaders[] = [];
  private columnsNames: ColumnValue[] = [];
  private RowsData: any = [];
  constructor() {}
  //download pdf
  downloadPDF() {
    setTimeout(() => {
      window.open('ToPrint/Data', '_blank');
    }, 100);
  }

  //download excel
  generateCSV(): string {
    let csvContent = '';
    const header = this.columnsArray.map((col) => col.name).join(',');

    csvContent += header + '\n';
    // Adding rows
    this.RowsData.forEach((row: any) => {
      let rowData: any = [];
      this.columnsNames.forEach((column) => {
        rowData.push(row[column.name]); // Accessing the row data by column name
      });
      csvContent += rowData.join(',') + '\n'; // Joining row data with commas
    });

    return csvContent;
  }

  downloadCSV(): void {
    const data = this.generateCSV();
    const blob = new Blob(['\ufeff' + data], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.csv';
    link.click();

    URL.revokeObjectURL(url);
    setTimeout(() => {
      if (localStorage.getItem('columnsArray')) {
        localStorage.removeItem('columnsArray');
      }
      if (localStorage.getItem('columnsNames')) {
        localStorage.removeItem('columnsNames');
      }
      if (localStorage.getItem('RowsData')) {
        localStorage.removeItem('RowsData');
      }
      if (localStorage.getItem('type')) {
        localStorage.removeItem('type');
      }
      if (localStorage.getItem('showFooter')) {
        localStorage.removeItem('showFooter');
      }
    }, 100);
  }

  public setColumnsArray(columnsArray: columnHeaders[]) {
    this.columnsArray = columnsArray;
    localStorage.setItem('columnsArray', JSON.stringify(this.columnsArray));
  }
  public setColumnsNames(columnsNames: ColumnValue[]) {
    this.columnsNames = columnsNames;
    localStorage.setItem('columnsNames', JSON.stringify(this.columnsNames));
  }
  public setRowsData(rowData: any) {
    this.RowsData = rowData;
    localStorage.setItem('RowsData', JSON.stringify(this.RowsData));
  }
  public getColumnsArray() {
    return this.columnsArray;
  }
  public getColumnsNames() {
    return this.columnsNames;
  }
  public getRowsData() {
    return this.RowsData;
  }
  public printForm(htmlElementId: string): void {
    const originalForm = document.getElementById(htmlElementId);
    if (!originalForm) return;

    // Clone the form
    const clonedForm = originalForm.cloneNode(true) as HTMLElement;

    // Fill in values from original form
    const originalInputs = originalForm.querySelectorAll(
      'input, select, textarea'
    );
    const clonedInputs = clonedForm.querySelectorAll('input, select, textarea');

    originalInputs.forEach((input, index) => {
      const clonedInput = clonedInputs[index] as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;

      if (
        input instanceof HTMLInputElement ||
        input instanceof HTMLTextAreaElement
      ) {
        clonedInput.value = input.value;
        clonedInput.setAttribute('value', input.value);
      }

      if (input instanceof HTMLSelectElement) {
        clonedInput.innerHTML = input.innerHTML;
        clonedInput.value = input.value;
      }

      // Make sure all fields are disabled so they're visible and not editable
      clonedInput.disabled = true;
    });

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html lang="ar" >
          <head>
            <title>طباعة النموذج</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
            <style>
              body {
                padding: 20px;
                font-family: Arial, sans-serif;
              }
                input , select, textarea,label {
                direction: rtl !important;
                text-align: right; !important;}
              .form-control[disabled], .form-control:disabled {
                background-color: #f8f9fa;
                color: #212529;
                border: 1px solid #ced4da;
              }
              .d-flex, .gap-2, .flex-wrap, .align-items-end, .my-3 {
                margin-bottom: 1rem;
                display: flex;
                gap: .5rem;
                flex-wrap: wrap;
                align-items: flex-end;
              }
              .width-15 { width: 15%; }
              .width-20 { width: 20%; }
              .flex-fill { flex: 1 1 auto; }
              .borderRadius_15px { border-radius: 15px; }
              .boxShadow-15 { box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${clonedForm.outerHTML}
          </body>
        </html>
      `);
      // printWindow.document.close();
    }
  }
}
