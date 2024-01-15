import { FC, ReactNode, Reducer, useReducer } from "react";
import { AnnotationCtx, AnnotationCtxAction, AnnotationContext, AnnotationDispatchContext } from "./annotation.context.tsx";


const annotationReducer: Reducer<AnnotationCtx, AnnotationCtxAction> = (currentContext: AnnotationCtx, action: AnnotationCtxAction): AnnotationCtx => {
  switch (action.type) {
    case "add":
      if (!action.annotation) return currentContext;
      return {
        ...currentContext,
        annotations: [...currentContext.annotations, action.annotation]
      }
    case "remove":
      if (!action.annotation) return currentContext;
      return {
        ...currentContext,
        annotations: currentContext.annotations.filter(a => a.id !== action.annotation?.id),
        focused: currentContext.focused?.id === action.annotation.id ? undefined : currentContext.focused
      }
    case "update":
      if (!action.annotation) return currentContext;
      return {
        ...currentContext,
        annotations: currentContext.annotations.map(a => {
          if (a.id !== action.annotation?.id) return a;
          return action.annotation
        }),
        focused: currentContext.focused?.id === action.annotation.id ? action.annotation : currentContext.focused
      }
    case "focus":
      return {
        ...currentContext,
        focused: action.annotation
      }
    case "blur":
      return {
        ...currentContext,
        focused: undefined
      }
  }
  return currentContext;
}

export const ProvideAnnotation: FC<{ children?: ReactNode }> = ({ children }) => {
  const [context, dispatch] = useReducer(annotationReducer, {annotations: []});

  return (
    <AnnotationContext.Provider value={ context }>
      <AnnotationDispatchContext.Provider value={ dispatch }>
        { children }
      </AnnotationDispatchContext.Provider>
    </AnnotationContext.Provider>
  )
}