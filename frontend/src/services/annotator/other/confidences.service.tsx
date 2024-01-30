import { ToastService } from "./toast.service.tsx";
import { DefaultCrudService, useCrud } from "./default-crud.service.tsx";

export interface ConfidencesService extends DefaultCrudService<string> {
}

export const useConfidences = (toasts: ToastService): ConfidencesService => {
  const crud = useCrud<string>('confidences');

  const focus = (item: string) => {
    crud.focus(item);
    toasts.remove();
  }

  return {
    updateList: crud.updateList,
    update: crud.update,
    add: crud.add,
    remove: crud.remove,
    focus,
    blur: crud.blur,
    onFocusChanged: crud.onFocusChanged,
  }
}