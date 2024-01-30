import { ToastService } from "./toast.service.tsx";
import { DefaultCrudService, useCrud } from "./default-crud.service.tsx";

export interface TagsService extends DefaultCrudService<string> {
}

export const useTags = (toasts: ToastService): TagsService => {

  const crud = useCrud<string>('tags');

  const focus = (item: string) => {
    crud.focus(item);
    toasts.remove();
  }

  return {
    onFocusChanged: crud.onFocusChanged,
    updateList:crud.updateList,
    update: crud.update,
    add: crud.add,
    remove: crud.remove,
    focus,
    blur: crud.blur
  }
}