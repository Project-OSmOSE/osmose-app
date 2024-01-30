import { AnnotatorCtxActionsScope, useAnnotatorDispatch } from "../annotator.context.tsx";
import { Subject } from "rxjs";

export interface DefaultCrudService<T> {
  onFocusChanged: Subject<T | undefined>;
  updateList: (array: Array<T>) => void;
  update: (item: T) => void;
  add: (item: T) => void;
  remove: (item: T) => void;
  focus: (item: T) => void;
  blur: () => void;
}

export function useCrud<T>(scope: AnnotatorCtxActionsScope): DefaultCrudService<T> {
  const dispatch = useAnnotatorDispatch();
  const onFocusChanged = new Subject<T | undefined>();

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
    dispatch!([
      { scope, type: 'update', item: item as any },
      { scope, type: 'focus', item: item as any },
    ]);
    onFocusChanged.next(item);
  }

  const blur = () => {
    dispatch!([{ scope: 'tags', type: 'blur' }])
    onFocusChanged.next(undefined);
  }

  return { onFocusChanged, updateList, update, add, remove, focus, blur }
}