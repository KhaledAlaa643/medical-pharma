import { warehouses } from "./products.js"

export interface receivingCompleted {
    id: number
    serial_number: number,
    created_at: string,
    supplier_name: string,
    purchase_number: number,
    warehouse: string,
    created_by: string,
    purchase_id: number,
    total_cart_items: number,
    reviewed_by: number,
    note?: string,
    warehouse_id?: number,
    show_order?: string,
    print?: string
}

export interface receivingCompletedData {
    id: number,
    purchase_id: number
    serial_number: number,
    created_at: number,
    supplier_name: string,
    purchase_number: number,
    total_cart_items: number,
    warehouse: number,
    created_by: string,
    reviewed_by: string,
    note: string,
    warehouse_id: string,
    show_order: "",
}




