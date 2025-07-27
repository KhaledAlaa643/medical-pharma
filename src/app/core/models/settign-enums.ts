export interface enums {
  batch_remaining_expiry: commonObject;
  cart_batch_status: commonObject;
  discount_slats: commonObject;
  extra_discount: commonObject;
  listing_type: commonObject;
  offer_type: commonObject;
  order_status: commonObject;
  payment_periods: commonObject;
  payment_types: commonObject;
  pharmacy_active: commonObject;
  pharmacy_follow_up: commonObject;
  pharmacy_shifts: commonObject;
  transfer_by: transfer_by;

  pharmacy_status: commonObject;
  pharmacy_types: commonObject;
  product_buying_status: commonObject;
  product_manufacturing_types: commonObject;
  product_selling_status: commonObject;
  product_type: commonObject;
  purchase_status: commonObject;
  returns_reasons: commonObject;
  shipping_types: commonObject;
  slat_types: commonObject;
  warehouse_type: commonObject[];
  shelves: string[];
  stands: string[];
  quantity_more_than_zero: commonObject;
}
export interface commonObject {
  name: string;
  value: number;
  payment_period?: number;
  ALL?: any;
  quantity_equal_zero?: number;
  quantity_more_than_zero?: number;
}

export interface FiltersObject {
  id: number;
  name: string;
}

export interface transfer_by {
  client_id: number;
  created_at: string;
  deleted_at: string;
  email: string;
  email_verified_at: string;
  id: number;
  is_active: number;
  name: string;
  phone: string;
  shift?: any; //TODO Find The Typ of Shift
  updated_at: string;
}
