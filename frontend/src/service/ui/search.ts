import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { QueryParams } from "@/service/type.ts";

export const useSearchedData = <T>({ items, search, mapping, sortField, sortDirection }: {
  items: T[],
  search?: string,
  mapping: (data: T) => string[],
  sortField?: keyof T,
  sortDirection?: 'ASC' | 'DESC'
}): T[] => {
  return useMemo(() => {
    let result = items.filter(item => {
      if (!search) return true;
      const searchItems = search.toLowerCase().split(' ')
      return searchItems.reduce((previous, searchItem) => {
        let actual = false;
        for (const str of mapping(item)) {
          actual = actual || str.toLowerCase().includes(searchItem);
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
  }, [ mapping, items, search, sortField, sortDirection ])
}

export const useAppSearchParams = <T extends QueryParams>(): {
  updateParams: (update: Partial<T>) => void;
  clearParams: () => void;
  params: T
} => {
  const [ searchParams, setSearchParams ] = useSearchParams();

  const params = useMemo(() => {
    const params = {} as any
    for (const [ key, value ] of searchParams.entries()) {
      try {
        params[key] = JSON.parse(value);
      } catch {
        params[key] = value;
      }
    }
    return params
  }, [ searchParams ])

  const updateParams = useCallback((update: Partial<T>) => {
    setSearchParams(prev => {
      for (const [ key, value ] of Object.entries(update)) {
        if (value !== undefined) prev.set(key, value);
        else prev.delete(key);
      }
      return prev
    })
  }, [ setSearchParams ])

  const clearParams = useCallback(() => {
    setSearchParams(prev => {
      for (const key of prev.keys()) {
        prev.delete(key);
      }
      return prev
    })
  }, [ setSearchParams ])

  return { params, updateParams, clearParams }
}
