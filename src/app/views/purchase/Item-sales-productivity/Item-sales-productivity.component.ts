import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-Item-sales-productivity',
  templateUrl: './Item-sales-productivity.component.html',
  styleUrls: ['./Item-sales-productivity.component.scss']
})
export class ItemSalesProductivityComponent implements OnInit {

  isActiveTapArray:boolean[]=Array(7).fill(false)
  filterForm!: FormGroup ;

  constructor(private fb: FormBuilder) { }
  changeActiveTap(index: number) {
    if (index != 10) {
      this.isActiveTapArray.fill(false)
      this.isActiveTapArray[ index ] = true
    }
    else {
      this.isActiveTapArray.fill(false)
    }
  }

  ngOnInit() {

    this.isActiveTapArray[ 0 ] = true

    this.filterForm = this.fb.group({
      agentName: [ '' ],
      dateFrom: [ '' ],
      dateTo: [ '' ]
    })
  
}
}
