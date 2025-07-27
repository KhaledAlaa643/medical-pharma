export interface ColumnValue{
    name:string,
    type:string,
    frozen?:boolean
  }
  export interface columnHeaders{ 
    nameAR?:String,
    nameEN?:string,
    name:string,
    search?:boolean
    sort?:boolean
    canHide?:string |boolean
    direction?:string|null
    frozen?:boolean
  }

  export interface colSpanArray{
    colSpan:number,
    name:string
  }