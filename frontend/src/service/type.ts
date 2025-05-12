export type ID = string | number;


type BaseType = string | number | boolean
export type QueryParams = { [key in string]: BaseType | Array<BaseType> }

export type Optionable<T> = {
  [P in keyof T]?: T[P];
}

export type Paginated<T> = {
  count: number;
  pageCount: number;
  next: string;
  previous: string;
  results: Array<T>;
}