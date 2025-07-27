import { cart } from "./cart.js";
import { permissions } from "./permissions.js";
import { pharmacie } from "./pharmacie.js";
import { roles } from "./roles.js";

// interface data {
//     status_code: number;
//     message: string;
//     data: data[];
//     additional_data?: any;
//   }
 export interface inventoried_invoices {
    id: number;
    total_quantity: number;
    total: number;
    order_number: number;
    order_status: number;
    delivery_received_at?: any;
    completed_at: string;
    closed_at: string;
    created_at: string;
    pharmacy: pharmacie;
    reviewed_by: Reviewedby;
    invoice: Invoice;
    cart: cart;
  }

  export interface reviewedInvoices {
  
    serial: number,
    show_order_content:string,
    items_count: number
    date_and_time: string,
    reviewer:string,
    client_name: string,
    order_number:number,
    invoice_id: number

}

//   interface Cart {
//     id: number;
//     quantity: number;
//     taxes: number;
//     total: number;
//     price: number;
//     client_discount_difference: number;
//     status: string;
//     bonus: number;
//     discount: number;
//     cart_number: number;
//     completed_at: string;
//     color: string;
//     created_at: string;
//   }
  interface Invoice {
    id: number;
    bags_num: number;
    cartons_num: number;
    fridges_num: number;
    invoices_num: number;
    total: number;
    printed_num: number;
    printed_at: string;
    created_at: string;
    qr_code: string;
    printed_by: Reviewedby;
  }
  interface Reviewedby {
    id: number;
    name: string;
    role: roles;
    permissions?: permissions[];
    email: string;
    phone: string;
    target?: any;
    has_list: boolean;
  }

//   interface Role {
//     id: number;
//     name: string;
//     guard_name: string;
//     created_at: string;
//     updated_at: string;
//     pivot: Pivot;
// //   }
//   interface Pivot {
//     model_id: number;
//     role_id: number;
//     model_type: string;
//   }
