import { cart } from "./cart.js"
import { permissions } from "./permissions.js"
import { clients, pharmacie } from "./pharmacie.js"
import { roles } from "./roles.js"

export interface printingData {
    status_code: number
    message: string
    data: Data
    additional_data: AdditionalData
  }
  export interface AdditionalData {
    totals: Totals
  }
  export interface Totals {
    price: number
    quantity: number
    taxes: number
    items_number: number
    subtotal: number
    total: number
    total_text: string
    net_price: number
    client_discount_difference_value: number
    extra_discount: number
    extra_discount_value: number
    extra_discount_condition: number
    client_net_discount_difference_value: number
    previous_balance: number
    current_balance: number
  }

  export interface Data {
    id: number
    total_quantity: number
    total: number
    order_number: number
    order_status: number
    delivery_received_at: any
    completed_at: string
    closed_at: string
    created_at: string
    client: clients
    pharmacy: pharmacie
    created_by: CreatedBy
    invoice: Invoice
    cart: cart[]
  }

  export interface CreatedBy {
    id: number
    name: string
    role: roles
    permissions: permissions[]
    email: string
    phone: string
    target: any
    has_list: boolean
  }

  export interface Invoice {
    id: number
    bags_num: number
    cartons_num: number
    fridges_num: number
    invoices_num: number
    total: number
    printed_num: number
    printed_at: string
    created_at: string
    qr_code: string
    printed_by: PrintedBy
  }
  export interface PrintedBy {
    id: number
    name: string
    role: any
    permissions: any
    email: string
    phone: string
    target: any
    has_list: boolean
  }