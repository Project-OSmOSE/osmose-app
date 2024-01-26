import { ToastService } from "./toast.service.tsx";
import { AnnotationType } from "../../../enum/annotation.enum.tsx";
import { DefaultCrudService, useCrud } from "./default-crud.service.tsx";
import { DEFAULT_COMMENT, useAnnotatorContext, useAnnotatorDispatch } from "../annotator.context.tsx";

export const useTags = (toasts: ToastService): DefaultCrudService<string> => {
  const context = useAnnotatorContext();
  const dispatch = useAnnotatorDispatch();

  const crud = useCrud<string>('tags');

  const focus = (item: string) => {
    dispatch!([
      { scope: 'tags', type: 'focus', item },
    ])
    if (context.annotations.focus?.type !== AnnotationType.box) return;
    dispatch!([
      {
        scope: 'annotations',
        type: 'update',
        item: { ...context.annotations.focus, annotation: item }
      },
      {
        scope: 'comments',
        type: 'focus',
        item: context.annotations.focus.result_comments.length > 0 ? context.annotations.focus.result_comments[0] : {
          ...DEFAULT_COMMENT,
          id: context.annotations.focus.id ?? 0
        }
      }
    ]);
    toasts.remove();
  }

  return {
    updateList:crud.updateList,
    update: crud.update,
    add: crud.add,
    remove: crud.remove,
    focus,
    blur: crud.blur
  }
}