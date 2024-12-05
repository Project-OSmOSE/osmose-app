export type ID = string | number;


type BaseType = string | number | boolean
export type QueryParams = { [key in string]: BaseType | Array<BaseType> }

export type Errors<T>= {
  [P in keyof T]?: string;
}
