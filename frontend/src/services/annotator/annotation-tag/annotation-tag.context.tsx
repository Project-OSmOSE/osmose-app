import { Context, createContext, Dispatch, useContext } from "react";


export interface AnnotationTagCtx {
  tags: Array<string>;
  focused?: string;
}
type AnnotationTagCtxActionType = 'add' | 'remove' | 'focus' | 'blur';

export interface AnnotationTagCtxAction {
  type: AnnotationTagCtxActionType;
  tag?: string;
}

export const AnnotationTagContext: Context<AnnotationTagCtx> = createContext<AnnotationTagCtx>({tags: []});
export const AnnotationTagDispatchContext: Context<Dispatch<AnnotationTagCtxAction> | undefined> = createContext<Dispatch<AnnotationTagCtxAction> | undefined>(undefined);

export const useAnnotationTagContext = () => useContext(AnnotationTagContext);
export const useAnnotationTagDispatch = () => useContext(AnnotationTagDispatchContext);