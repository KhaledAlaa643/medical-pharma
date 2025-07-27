import { client } from './client';
import { person_data } from './complain';
import { area, city, pharmacie, shifts, track } from './pharmacie';
import { products } from './products';
import { FiltersObject } from './settign-enums';

export interface cart {
  id: number;
  total_price: number;
  total_quantity: number;
  total_taxes: number;
  total: number;
  note: string;
  extra_discount: number;
  created_at: string;
  status: string;
  order_status: number;
  current_sales: FiltersObject;
  shipping_type: string;
  cart: cartData[];
  totals: totalData;
  pharmacy: pharmacie;
  sales: person_data;
  client: client;
  created_by: person_data;
  delivery: FiltersObject;
  city: city;
  area: area;
  track: track;
  shift: shifts;
  latitude: string;
  longitude: string;
}

export interface totalData {
  price: number;
  quantity: number;
  taxes: number;
  total: number;
  items_number: number;
  extra_discount: number;
  previous_balance: number;
  current_balance: number;
  net_price: number;
  extra_discount_value?: number;
  subtotal?: number;
  client_net_discount_difference_value?: any;
}

export interface cartData {
  id: number;
  product: products;
  quantity: string;
  taxes: number;
  total: number;
  price: number;
  client_discount_difference: string;
  status: string;
  bonus: number | null;
  discount: number | null;
  batches: batches[];
  batch: batch;
  cart_number: number;
  created_at: string;
  client: client;
}

export interface batches {
  expired_at: string;
  operating_number: string;
}
export interface order_data {
  client_id: number;
  sales_id?: number;
  total_quantity: number;
  total_price: number;
  total_taxes: number;
  total_after_extra_discount: number;
  total: number;
  pharmacy_id?: number;
  extra_discount: number;
  status?: number;
  shipping_type: number;
  cart?: number[];
  note: string;
  cart_number?: number;
  track_id: number;
  shift_id: number;
  city_id: number;
  area_id: number;
  order_id: number;
  order_number?: number;
  current_balance?: number;
  last_balance?: number;
  extra_discount_condition?: number;
}

export interface batch {
  id: number;
  quantity: number;
  expired_at: string;
  operating_number: string;
  production_date: string;
  discount: number;
  code: string;
  created_at: string;
}

export interface cart_number_data {
  cart_number: number;
  code: string;
}
