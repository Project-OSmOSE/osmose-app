import { FC, ReactNode, Reducer, useReducer } from "react";
import {
  AnnotationTagCtx,
  AnnotationTagCtxAction,
  AnnotationTagContext,
  AnnotationTagDispatchContext
} from "./annotation-tag.context.tsx";


const annotationTagReducer: Reducer<AnnotationTagCtx, AnnotationTagCtxAction> = (currentContext: AnnotationTagCtx, action: AnnotationTagCtxAction): AnnotationTagCtx => {
  switch (action.type) {
    case "add":
      if (!action.tag) return currentContext;
      return {
        ...currentContext,
        tags: [...currentContext.tags, action.tag],
        focused: action.tag
      }
    case "remove":
      if (!action.tag) return currentContext;
      return {
        ...currentContext,
        tags: currentContext.tags.filter(a => a !== action.tag),
        focused: currentContext.focused === action.tag ? undefined : currentContext.focused
      }
    case "focus":
      return {
        ...currentContext,
        focused: action.tag
      }
    case "blur":
      return {
        ...currentContext,
        focused: undefined
      }
  }
  return currentContext;
}

export const ProvideAnnotationTag: FC<{ children?: ReactNode }> = ({ children }) => {
  const [context, dispatch] = useReducer(annotationTagReducer, {tags: []});

  return (
    <AnnotationTagContext.Provider value={ context }>
      <AnnotationTagDispatchContext.Provider value={ dispatch }>
        { children }
      </AnnotationTagDispatchContext.Provider>
    </AnnotationTagContext.Provider>
  )
}