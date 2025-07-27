import { Component,Input, OnInit} from '@angular/core';
import { ColumnValue, columnHeaders } from '@models/tableData';


@Component({
  selector: 'app-print-table',
  templateUrl: './print-table.component.html',
  styleUrls: ['./print-table.component.scss'],
  standalone:false
})
export class PrintTableComponent implements OnInit {
 columnsArray:columnHeaders[]= []
 columnsNames:ColumnValue[]= []
 RowsData:any = [];
 type!:number
 showFooter:number=0

  constructor() {
    const columnsArray = localStorage.getItem('columnsArray');
    const columnsNames = localStorage.getItem('columnsNames');
    const RowsData = localStorage.getItem('RowsData');
    const type:any = localStorage.getItem('type');
    const showFooter:any = localStorage.getItem('showFooter');
    if (columnsArray) {
      this.columnsArray = JSON.parse(columnsArray)
    }
    if(RowsData){
      this.RowsData = JSON.parse(RowsData)
    }
    if(columnsNames){
      this.columnsNames = JSON.parse(columnsNames)
    }
    if(type){
      this.type=Number(JSON.parse(type))
    }
    if(showFooter){
      this.showFooter=Number(JSON.parse(showFooter))
    }
    setTimeout(() => {
      window.print()
    }, 50);
   }

  ngOnInit() {
    this.setupPrintStyles()
    window.addEventListener('afterprint', () => {
      if (localStorage.getItem('RowsData') && localStorage.getItem('columnsArray') && localStorage.getItem('columnsNames')) {
        localStorage.removeItem('RowsData')
        localStorage.removeItem('columnsArray')
        localStorage.removeItem('columnsNames')
        localStorage.removeItem('type')
        localStorage.removeItem('showFooter')
      }
      window.close();
    });

  }



  setupPrintStyles(): void {
    const beforePrint = () => {
      const css = '@page { size: 210mm 297mm; }',
        head = document.head || document.getElementsByTagName('head')[ 0 ],
        style = document.createElement('style');

      style.type = 'text/css';
      style.media = 'print';

      const cssText = document.createTextNode(css);
      style.appendChild(cssText);
      head.appendChild(style);
    };
  }


}
