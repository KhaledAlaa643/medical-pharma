import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cart } from '@models/cart';


@Injectable({
  providedIn: 'root'
})
export class invoiceService {
  invoiceCart!:cart 

  constructor(private http: HttpClient) { }

  setInvoiceCart(invoiceCart:cart){
    this.invoiceCart=invoiceCart
  }
  getInvoiceCart(){
    return this.invoiceCart
  }

}
