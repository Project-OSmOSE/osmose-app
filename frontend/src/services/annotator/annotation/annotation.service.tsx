import { useAnnotationContext, useAnnotationDispatch } from "./annotation.context.tsx";


export const useAnnotationService = () => {
  const context = useAnnotationContext();
  const dispatch = useAnnotationDispatch();

  return {
    context,
    dispatch,
  }
}