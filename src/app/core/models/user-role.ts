import { permissions } from "./permissions.js"
import { roles } from "./roles.js"

  export interface userRole {
    id: number
    name: string
    role: roles
    permissions: permissions[]
    email: string
    phone: string
    target: any
    has_list: boolean
  }
  
  export interface Role {
    id: number
    name: string
    guard_name: string
    created_at: string
    updated_at: string
    pivot?: any
  }
  