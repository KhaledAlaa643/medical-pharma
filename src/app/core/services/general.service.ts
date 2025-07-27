import { Injectable, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from './http.service';
import { HttpParams } from '@angular/common/http';
import { LooseObject } from '@models/LooseObject';

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  constructor(private router: Router, private http: HttpService) {}

  getCities() {
    return this.http.getReq('api/v2/cities');
  }
  getCategories() {
    return this.http.getReq('api/v2/categories');
  }
  getSubCategories() {
    return this.http.getReq('api/v2/sub-categories');
  }
  getProduct(params: any) {
    return this.http.getReq('products', { params: params });
  }
  //!--------------------------- Recent Changes in Apis ---------------------------------------

  getCity(param?: any) {
    return this.http.getReq('cities', { params: param });
  }
  getTracks(param?: any) {
    return this.http.getReq('tracks', { params: param });
  }

  getWarehouses(param?: any) {
    return this.http.getReq('warehouses', { params: param });
  }
  getWarehousesDropdown(param?: any) {
    return this.http.getReq('warehouses/dropdown', { params: param });
  }
  getTrackDropdown(param?: any) {
    return this.http.getReq('tracks/dropdown', { params: param });
  }
  getProducts(param?: any) {
    return this.http.getReq('products/dropdown', { params: param });
  }

  getUsers(param?: any) {
    return this.http.getReq('users/sales', { params: param });
  }

  getClients(param?: any) {
    return this.http.getReq('clients', { params: param });
  }
  getClientsDropdown(param?: any) {
    return this.http.getReq('clients/dropdown', { params: param });
  }

  getPharmacies(param?: any) {
    return this.http.getReq('pharmacies', { params: param });
  }

  getRoles(param?: any) {
    return this.http.getReq('users/roles', { params: param });
  }

  getUserRoles(param?: any) {
    return this.http.getReq('users/roles/users', { params: param });
  }

  getUserDepartments(param?: any) {
    return this.http.getReq('users/user-department', { params: param });
  }

  getManufacturers(param?: any) {
    return this.http.getReq('products/manufacturers', { params: param });
  }

  getSuppliers(param?: any) {
    return this.http.getReq('users/suppliers', { params: param });
  }

  getCorridor(param?: any) {
    return this.http.getReq('warehouses/corridors', { params: param });
  }

  getReceiverAuditor(param?: any) {
    return this.http.getReq('users/receivers-auditor', { params: param });
  }

  getArea(param?: any) {
    return this.http.getReq('areas', { params: param });
  }
  getReceiversAuditorStoreKeepers(param?: any) {
    return this.http.getReq('users/receivers-auditor-store-keepers', {
      params: param,
    });
  }
  getRetailSalesAuditor(param?: any) {
    return this.http.getReq('users/retail-sales-auditor', { params: param });
  }

  getSettingsEnum(param?: any) {
    return this.http.getReq('settings/enums', { params: param });
  }

  getRetailPreparation(param?: any) {
    return this.http.getReq('users/retail-preparation', { params: param });
  }
  uploadFile(param?: any) {
    return this.http.postReq('files/upload', param);
  }

  getDropdownData(paramsList: any) {
    let filterData: LooseObject = {};
    paramsList.forEach((element: any, index: number) => {
      filterData[`filters[${index}][name]`] = element;
    });

    return this.http.getReq('settings/filters', { params: filterData });
  }
  getInventoryEmployee() {
    return this.http.getReq('users/warehouse');
  }
}
