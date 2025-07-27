export interface returns {
  order_number?: number;
  id?: number;
  client_name?: string;
  time_date?: string;
  return_count?: number;
  pharmacy_id?: number;
  backGround_red?: boolean;
  cart_purchase_id?: number;

  expired_at?: string;
  operating_number?: string;
  quantity?: number;
  price?: number;
  discount?: number;
  reason?: number;
  status?: {
    name: string;
    id: number;
  };
  total?: number;
  product_name?: string;
  returnable_id?: number;
  returnable_type?: string;
}
export interface purchase_return {
  purchase_number?: number;
  purchase_id?: number;
  id?: number;
  supplier_name?: string;
  reciving_auditor: string;
  created_by: string;
  time_date?: string;
  return_count?: number;
  pharmacy_id?: number;
  backGround_red?: boolean;

  expired_at?: string;
  operating_number?: string;
  quantity?: number;
  price?: number;
  discount?: number;
  reason?: number;
  total?: number;
  product_name?: string;
  returnable_id?: number;
  returnable_type?: string;
}
