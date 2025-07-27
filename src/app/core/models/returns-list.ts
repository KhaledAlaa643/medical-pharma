export interface returnsList {
    id: number,
    purchase_id: number,
    serial_number: number,
    created_at: string,
    supplier_name: string,
    purchase_number: number,
    total_returned_items: number,
    warehouse: string,
    created_by: string,
    reviewed_by: string,
    note: string,
    warehouse_id: number,
    show_order: string
}

export interface returnListDetails {
    id: number,
    purchase_id: number,
    serial_number: number,
    product_name: string,
    quantity_difference:number,
    price: number,
    total: number,
    return_reason: number
}