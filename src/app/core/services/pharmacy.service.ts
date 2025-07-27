import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cart } from '@models/cart';


@Injectable({
  providedIn: 'root'
})
export class pharmacyService {
  pharmacyID!:number

  constructor(private http: HttpClient) { }

  

  setPharmacyID(pharmacyID:number){
    this.pharmacyID=pharmacyID
  }
  getPharmacyID(){
    return this.pharmacyID
  }

}
