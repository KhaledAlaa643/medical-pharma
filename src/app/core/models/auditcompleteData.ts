import { warehouses } from "./products.js"

export interface auditCompleteData{
    id:number
    serial_number:number 
    reviewed_at?: string
    supplier_name: string,
    purchase_number: number
    total_cart_items:number
    warehouse: warehouses[]
    created_by: string
    reviewed_by: string
    supplied_at?:string
    note: string
    show_order: string
    status:string
}