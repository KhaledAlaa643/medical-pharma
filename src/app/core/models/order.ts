export interface order{
    cart_id: number,
    id: number,
    number: number,
    corridor: string,
    product_name: string,
    expiredAt_operatingNumber: string,
    orderedQuantity: number,
    order_quantity: number,
    items_number_in_packet: number,
    packets_number_in_package: number,
    manufacturer_name: string,
    price: number,
    completed_at:boolean,
    checked: boolean,
    price_color: string
}

export interface invoice{
    number: number,
    closed_at: string,
    PharmacyName: string,
    order_number: string,
    order_id: number,
}