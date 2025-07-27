import { Component, OnInit } from '@angular/core';
import { warehouses } from '@models/products';

@Component({
  selector: 'app-create-offer',
  templateUrl: './create-offer.component.html',
  styleUrls: ['./create-offer.component.scss']
})
export class CreateOfferComponent implements OnInit {
  offersViewArray = Array.from({ length: 5 }, () => ({ show: false, disabled: false }));
  warehouses:warehouses[]=[]

  constructor() { }

  ngOnInit() {
  }

  show(index:any){
    this.offersViewArray[index].show=!this.offersViewArray[index].show

  }

}
