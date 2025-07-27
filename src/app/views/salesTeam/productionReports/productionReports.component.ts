import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-productionReports',
  templateUrl: './productionReports.component.html',
  styleUrls: ['./productionReports.component.scss'],
})
export class ProductionReportsComponent implements OnInit {
  isActiveTapArray: boolean[] = Array(7).fill(false);
  filterForm!: FormGroup;

  constructor(private fb: FormBuilder) {}
  changeActiveTap(index: number) {
    if (index != 10) {
      this.isActiveTapArray.fill(false);
      this.isActiveTapArray[index] = true;
    } else {
      this.isActiveTapArray.fill(false);
    }
  }

  ngOnInit() {
    this.isActiveTapArray[0] = true;

    this.filterForm = this.fb.group({
      agentName: [''],
      dateFrom: [''],
      dateTo: [''],
    });
  }
}
