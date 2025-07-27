export interface OrderDetails {
    data: {
        id: number;
        total_price: number;
        total_quantity: number;
        total_taxes: number;
        total: number;
        note: string;
        extra_discount: number;
        order_number: number;
        returns: number;
        created_at: string;
        closed_at: string;
        order_status: number;
        total_after_extra_discount: number;
        status: string;
        shipping_type: string;
        pharmacy: {
            id: number;
            name: string;
            address: string;
        };
        client: {
            id: number;
            name: string;
            code: string;
            type_value: number
        };
        delivery: any; 
        created_by: {
            id: number;
            name: string;
        };
        invoice: {
            id: number;
            bags_num: number;
            cartons_num: number;
            fridges_num: number;
            invoices_num: number;
            total: number;
            printed_at: string;
            created_at: string;
            qr_code_image: string | null;
            qr_code: string | null;
            printed_num: number
            printed_by: {
                name: string
            }
        };
        cart: [ {
            id: number;
            quantity: number;
            taxes: number;
            total: number;
            price: number;
            client_discount_difference: number;
            status: string;
            bonus: number;
            discount: number;
            cart_number: number;
            completed_at: string;
            color: string | null;
            created_at: string;
            location: string;
            expired_at: string;
            operating_number: string;
            product_name:string
            corridor: {
                color: string;
                completed_at: string
                id: number
                is_main_corridor: number
                number: string
            }
            product: {
                id: number;
                created_by: number;
                updated_by: number | null;
                name: string;
                description: string;
                sku: string;
                barcode: string;
                total_quantity: number;
                is_limited: number;
                limited_quantity: number;
                normal_discount: number;
                market_price: number;
                color: string | null;
                taxes: number;
                type: string;
                items_number_in_packet: number;
                packets_number_in_package: number;
                quantity_sum_in_warehouses: number;
                quantity_in_warehouse: number;
                has_offer: boolean;
                has_bonus: boolean;
                created_at: string;
                updated_at: string | null;
            };
            batches: {
                id: number;
                quantity: number;
                real_quantity: number;
                packet: number;
                package: number;
                expired_at: string;
                operating_number: string;
                production_date: string;
                code: string;
                shelf: string;
                stand: string;
                distributor_received_at: string;
                auditor_received_at: string;
                stored_at: string | null;
                supplied_at: string;
                created_at: string;
                batch_info: {
                    cart_batch_id: number;
                    ordered_quantity: number;
                    cart_batch_status: string;
                    cart_batch_status_value: number;
                    price: number;
                    total: number;
                    bonus: number;
                    inventoried: boolean;
                    inventoried_at: string;
                };
                corridor: {
                    id: number;
                    number: string;
                    color: string;
                    is_main_corridor: number;
                    completed_at: string | null;
                };
            }[];
        } ];
    };
    additional_data: {
        qr_code: string;
        totals: {
            price: number;
            quantity: number;
            taxes: number;
            items_number: number;
            subtotal: number;
            total: number;
            total_text: string;
            calculate_inventoried_items_number_in_batches:number
            net_price: number;
            client_discount_difference_value: number;
            extra_discount: number;
            extra_discount_value: number;
            previous_balance: number;
            inventoried_items_number:number;
            current_balance: number;
        };
    };
}
