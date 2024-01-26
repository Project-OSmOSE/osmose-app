import { ToastService } from "./toast.service.tsx";
import { DefaultCrudService, useCrud } from "./default-crud.service.tsx";
import { useAnnotatorContext, useAnnotatorDispatch } from "../annotator.context.tsx";

export const useConfidences = (toasts: ToastService): DefaultCrudService<string> => {
  const context = useAnnotatorContext();
  const dispatch = useAnnotatorDispatch();

  const crud = useCrud<string>('confidences');

  const focus = (item: string) => {
    dispatch!([
      { scope: 'confidences', type: 'focus', item },
    ])
    if (!context.annotations.focus) return;
    dispatch!([
      {
        scope: 'annotations',
        type: 'update',
        item: { ...context.annotations.focus, confidenceIndicator: item }
      },
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