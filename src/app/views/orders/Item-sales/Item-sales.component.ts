import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChange,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '@services/http.service';
import { Subscription } from 'rxjs';
import { pharmacyService } from '../../../core/services/pharmacy.service';
import { ColumnValue, columnHeaders } from '@models/tableData';

@Component({
  selector: 'app-Item-sales',
  templateUrl: './Item-sales.component.html',
  styleUrls: ['./Item-sales.component.scss'],
})
export class ItemSalesComponent implements OnInit, OnChanges {
  columnsArray1: columnHeaders[] = [
    {
      name: 'الفاتورة ',
    },
    {
      name: 'التاريخ',
    },
    {
      name: ' الكمية	',
    },
    {
      name: ' الخصم	',
    },
    {
      name: ' السعر	',
    },
  ];
  columnsName1: ColumnValue[] = [
    {
      name: 'cart_number',
      type: 'normal',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'discount',
      type: 'normal',
    },
    {
      name: 'price',
      type: 'normal',
    },
  ];
  columnsArray2: columnHeaders[] = [
    {
      name: 'الفاتورة ',
    },
    {
      name: 'التاريخ',
    },
    {
      name: 'الصنف',
    },
    {
      name: ' الكمية	',
    },
    {
      name: ' الخصم	',
    },
    {
      name: ' السعر	',
    },
  ];
  columnsName2: ColumnValue[] = [
    {
      name: 'cart_number',
      type: 'normal',
    },
    {
      name: 'created_at',
      type: 'normal',
    },
    {
      name: 'product',
      type: 'normal.name',
    },
    {
      name: 'quantity',
      type: 'normal',
    },
    {
      name: 'discount',
      type: 'normal',
    },
    {
      name: 'price',
      type: 'normal',
    },
  ];
  activeTap1: boolean = true;
  activeTap2: boolean = false;
  items1 = [];
  items2 = [];
  productDataArray: any;
  constructor(
    private http: HttpService,
    private pharmacyService: pharmacyService
  ) {}

  private subs = new Subscription();

  @Input() clientID: any;
  @Input() productID: any;

  RecievedClientId: any;
  RecievedProductId: any;
  RecievedPharmacyId: any;

  getproductdata() {
    let param = {
      client_id: this.RecievedClientId,
      product_id: this.RecievedProductId,
      pharmacy_id: this.RecievedPharmacyId,
      sort_by: 'created_at',
      direction: 'DESC',
    };

    let getUrl = 'carts/sales';
    this.subs.add(
      this.http.getReq(getUrl, { params: param }).subscribe({
        next: (res) => {
          this.productDataArray = res.data;
        },
      })
    );
  }

  ngOnInit() {
    if (this.pharmacyService.getPharmacyID()) {
      this.RecievedPharmacyId = this.pharmacyService.getPharmacyID();
    } else {
      this.RecievedPharmacyId = null;
    }
    this.getproductdata();
  }

  changeTab(index: number) {
    if (index == 1) {
      this.activeTap1 = true;
      this.activeTap2 = false;
      this.getproductdata();
    } else {
      this.activeTap2 = true;
      this.activeTap1 = false;
      this.getdata();
    }
  }

  clientProductArray: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientID']) {
      this.RecievedClientId = this.clientID;
    }
    if (changes['productID']) {
      this.RecievedProductId = this.productID;
    }
  }

  getdata() {
    let param = {
      client_id: this.RecievedClientId,
      sort_by: 'created_at',
      direction: 'DESC',
    };
    let getUrl = 'carts/client-product';
    this.subs.add(
      this.http.getReq(getUrl, { params: param }).subscribe({
        next: (res) => {
          this.clientProductArray = res.data;
        },
      })
    );
  }
}
