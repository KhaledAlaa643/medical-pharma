import { users } from "./client"
import { area, city, clients, pharmacie, track } from "./pharmacie"

  export interface sourcePharmacy {
    id: number
    name: string
    address: string
    code: string
    debt_limit: number
    extra_discount: number
    phone_number: string
    optional_phone_number: string
    latitude: string
    longitude: string
    email: string
    doctor: string
    commercial_registration_no: string
    license_no: string
    tax_card_no: string
    target: number
    minimum_target: number
    payment_period: number
    iterate_available_quantity: number
    discount_slat: string
    discount_slat_value: number
    note?: string
    balance: number
    all: number
    days_of_creation: number
    location_url: any
    created_at: string
    pharmacy_media: any[]
    has_client: boolean
    not_has_client_num: number
    last_invoice: any
    call_shift_value: number
    call_shift: string
    active_value: number
    active: string
    status_value: number
    status: string
    follow_up_value: number
    follow_up: string
    type_value: number
    type: string
    payment_type_value: number
    payment_type: string
    clients: clients[]
    lists: List[]
    track: track
    city: city
    area: area
    delivery: Delivery
  }
  
  
  export interface List {
    id: number
    name: string
    type_value: number
    type: string
    pharmacies_number: number
    list_target: number
    users: users[]
    pharmacies: pharmacie[]
  }
 
  
  export interface Shift {
    id: number
    name: string
    from: string
    to: string
  }
  
  
  
  export interface Delivery {
    id: number
    name: string
    role: any
    permissions: any[]
    email: string
    phone: string
    target: any
    has_list: boolean
  }


  