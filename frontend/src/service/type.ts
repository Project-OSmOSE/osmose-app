export type ID = string | number;


type BaseType = string | number | boolean
export type QueryParams = { [key in string]: BaseType | Array<BaseType> }
