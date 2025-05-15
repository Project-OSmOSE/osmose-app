import { useMemo } from "react";

export const useSearchedData = <T>({ items, search, fields, sortField, sortDirection }: {
  items: T[],
  search?: string,
  fields: (keyof T)[]
  sortField?: keyof T,
  sortDirection?: 'ASC' | 'DESC'
}): T[] => {
  return useMemo(() => {
    let result = items.filter(item => {
      if (!search) return true;
      const searchItems = search.toLowerCase().split(' ')
      return searchItems.reduce((previous, searchItem) => {
        let actual = false;
        for (const field of fields) {
          actual = actual || `${ item[field] }`.toLowerCase().includes(searchItem);
        }
        return previous && actual
      }, true)
    })
    if (sortField) {
      result = result.sort((a, b) => {
        let first = a, second = b;
        if (sortDirection == 'DESC') {
          first = b
          second = a
        }
        return `${ first[sortField] }`.toLowerCase().localeCompare(`${ second[sortField] }`.toLowerCase())
      });
    }
    return result
  }, [ fields, items, search, sortField, sortDirection ])
}
