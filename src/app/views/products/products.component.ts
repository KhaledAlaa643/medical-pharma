import { Component, OnInit } from '@angular/core';
import { Progress_barService } from '@services/progress_bar.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  showSide!:boolean

  constructor(public progressBarLoader:Progress_barService) { }

  ngOnInit() {
  }
  handleShowSideChange(showSide: boolean) {
    this.showSide = showSide;
  }

  get mainDivClass(): string {
    // Return the appropriate class based on the showSide value
    return this.showSide ? 'MainDiv' : 'MainDiv-full';
  }

}
