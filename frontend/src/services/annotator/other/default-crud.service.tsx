import { AnnotatorCtxActionsScope, useAnnotatorDispatch } from "../annotator.context.tsx";

export interface DefaultCrudService<T> {
  updateList: (array: Array<T>) => void;
  update: (item: T) => void;
  add: (item: T) => void;
  remove: (item: T) => void;
  focus: (item: T) => void;
  blur: () => void;
}

export function useCrud<T>(scope: AnnotatorCtxActionsScope): DefaultCrudService<T> {
  const dispatch = useAnnotatorDispatch();

  const updateList = (array: Array<T>) => {
    dispatch!([{ scope, type: 'updateList', array: array as any }])
  }

  const update = (item: T) => {
    dispatch!([{ scope, type: 'update', item: item as any }])
  }

  const add = (item: T) => {
    dispatch!([{ scope, type: 'add', item: item as any }])
  }

  const remove = (item: T) => {
    dispatch!([{ scope, type: 'remove', item: item as any }])
  }

  const focus = (item: T) => {
    dispatch!([{ scope, type: 'focus', item: item as any }]);
  }

  const blur = () => {
    dispatch!([{ scope: 'tags', type: 'blur' }])
  }

  return { updateList, update, add, remove, focus, blur }
}