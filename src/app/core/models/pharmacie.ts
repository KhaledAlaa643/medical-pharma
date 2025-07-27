import { FiltersObject } from './settign-enums';

export interface pharmacie {
  delivery: any;
  id: number;
  name: string;
  remaining_debt_limit: number;
  address: string;
  code: string | null;
  city: city;
  current_sales: FiltersObject;
  area: area;
  phone_number: string;
  optional_phone_number: string;
  latitude: string;
  longitude: string;
  payment_type: any;
  track: track;
  debt_limit: number;
  extra_discount: number;
  type: string;
  clients: clients[];
  lists: any;
  active_value: number;
  status_value: number;
  follow_up_value: number;
  call_to: string;
  call_from: string;
  call_shift: string;
  call_shift_value: string;
  payment_type_value: number;
  pharmacy_media: string[];
  days_of_creation?: number;
  discount_slat_value?: number;
  note?: string;
  discount_tier: { title: string; id: number };
}
export interface groupedPharmacy {
  name: string;
  id: number;
  code?: string | null;
  client_id?: any;
}

export interface track {
  id: number;
  name: string | '';
  delivery?: any;
  shifts: shifts[];
}

export interface shifts {
  id: number;
  from: string;
  to: string;
  order_from: string;
  order_to: string;
  name: string;
}

export interface pharmacieInvoiceData {
  pharmacy_id: number;
  note: string;
  pharmaciesAdress: string;
  payment_type: string;
  phone_number: string;
  optional_phone_number: string;
  track: track;
  sales_id: number;
  shift?: shifts;
}

export interface city {
  id: number;
  name: string;
}
export interface area {
  id: number;
  name: string;
}

export interface clients {
  id: number;
  name: string;
  code: string;
  type_value?: number;
  iterate_available_quantity: number;
  type: string;
}
export interface pharmacyData {
  PharmacyId: number;
  trackId: number;
  shiftId: number;
  cityId: number;
  areaId: number;
  discount_tier_id?: number;
  pharmacy_note: string;
}

export interface pharmacy_client {
  name: string;
  id: number;
  code?: string;
  client_id?: string;
  pharmacy_id?: number;
}
