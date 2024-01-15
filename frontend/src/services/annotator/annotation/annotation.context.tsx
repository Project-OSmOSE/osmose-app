import { Context, createContext, Dispatch, useContext } from "react";
import { AnnotationTag } from "../../../interface/annotation-tag.interface.tsx";


export interface AnnotationCtx {
  annotations: Array<AnnotationTag>;
  focused?: AnnotationTag;
}
type AnnotationCtxActionType = 'add' | 'remove' | 'update' | 'focus' | 'blur';

export interface AnnotationCtxAction {
  type: AnnotationCtxActionType;
  annotation?: AnnotationTag;
}

export const AnnotationContext: Context<AnnotationCtx> = createContext<AnnotationCtx>({annotations: []});
export const AnnotationDispatchContext: Context<Dispatch<AnnotationCtxAction> | undefined> = createContext<Dispatch<AnnotationCtxAction> | undefined>(undefined);

export const useAnnotationContext = () => useContext(AnnotationContext);
export const useAnnotationDispatch = () => useContext(AnnotationDispatchContext);