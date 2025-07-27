export interface permissions {
    id: number
    name: string
    guard_name: string
    created_at: string
    updated_at: string
    pivot: Pivot
}

interface Pivot {
    role_id?: number
    permission_id?: number
    model_id?: number
    model_type?: string
}

