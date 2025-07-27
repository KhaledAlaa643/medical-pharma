import { permissions } from "./permissions"

export interface sales {
    id: number | string,
    name: string,
    role?: string[],
    email?: string,
    phone?: string
    target?: number,
    shift_status?: number,
    has_list?: boolean,
    shift?: string,
    disabled?: boolean,
    selected?: boolean
    permissions?:permissions
}

