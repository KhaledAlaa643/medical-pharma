export interface reviewedSupplyOrderDetails {
    id: number,
    batch_purchase_id: number,
    cart_purchase_id?: number,
    batch_id?: number,
    name: string,
    barcode?: number,
    inventoried_quantity: number,
    invoice_quantity: number,
    price: number,
    expired_at?: string
    quantity_difference: number,
    public_price: number
    supply_price: number,
    notes_on_item: string,
    expiry_operation: string,
    status_value: number,
    return: string,
    items_number_in_packet: number,
    packets_number_in_package: number,
    purchase_id?:number
}
export interface notReviewedSupplyOrderDetails {
    id: number,
    cart_purchase_id: number,
    purchases_return_id: number,
    batch_id?: number,
    cart_id?: number,
    purchase_id: number,
    barcode: string,
    name: string,
    inventoried_quantity: number,
    invoice_quantity: number,
    quantity_difference: number,
    public_price: number,
    price: number,
    expired_at?: string
    supply_price: number,
    notes_on_item: string,
    status_value: number,
    return: string,
    return_data: return_data | null, // do the interface for return_data
    items_number_in_packet: number,
    packets_number_in_package: number,
    indexOfHighlight: number,
    hasHighlight: boolean
}
interface return_data{
    cart_purchase_id: number;
}
interface Reason {
    key: number;
    value: string;
  }

export interface viewInvoice {
    id: number,
    cart_purchase_id: number,
    purchases_return_id: number,
    barcode: string,
    name: string,
    invoice_quantity: number,
    quantity_difference: number,
    public_price: number,
    operating_number?: number
    expired_at?: any
    price: number,
    supply_price: number,
    notes_on_item: number,
    status_value: number,
    return: string,
    items_number_in_packet: number,
    packets_number_in_package: number,
    hasHighlight: boolean
}
