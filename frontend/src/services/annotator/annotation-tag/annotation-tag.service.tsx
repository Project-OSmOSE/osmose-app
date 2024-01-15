import { useAnnotationTagContext, useAnnotationTagDispatch } from "./annotation-tag.context.tsx";


export const useAnnotationTagService = () => {
  const context = useAnnotationTagContext();
  const dispatch = useAnnotationTagDispatch();

  return {
    context,
    dispatch,
  }
}