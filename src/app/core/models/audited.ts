export interface auditedData {
    name: string,
    inventoried_quantity: number,
    quantity: number,
    quantity_difference: number,
    public_price: number,
    supply_price: number,
    note: string,
}
export interface reviewedData {
    name: string,
    exp: string,
    inventoried_quantity: number,
    quantity: number,
    quantity_difference: number,
    public_price: number,
    supply_price: number,
    note: string,
}

export interface allData {
    name: string,
    exp?: string,
    inventoried_quantity: number,
    quantity: number,
    quantity_difference: number,
    public_price: number,
    supply_price: number,
    note: string,

}