export interface supplyOrder {
    id: number
    serial_number: number,
    created_at: string,
    supplier_name: string,
    purchase_number: number,
    total_items: number,
    warehouse: string,
    created_by: string,
    note?: string,
    warehouse_id?: number,
    show_order?: string,
    print?: string
    status:string
}




export interface selectedInvoice {

    id: number,
    product_id: number,
    barcode: string | number,
    name: string,
    quantified_amount: number,
    invoice_quantity: number,
    quantity_difference: number,
    public_price: number,
    supply_price: number,
    notes_on_item: string,
    items_number_in_packet: number,
    packets_number_in_package: number,
    indexOfHighlight: number,
}