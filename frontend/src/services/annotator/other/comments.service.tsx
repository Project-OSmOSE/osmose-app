import { DefaultCrudService, useCrud } from "./default-crud.service.tsx";
import { AnnotationComment } from "../../../interface/annotation-comment.interface.tsx";
import { useAnnotatorContext } from "../annotator.context.tsx";

export interface CommentsService extends DefaultCrudService<AnnotationComment> {
  focusTaskComment: () => void;
}

export const useComments = (): CommentsService => {
  const context = useAnnotatorContext();

  const crud = useCrud<AnnotationComment>('comments');

  const focusTaskComment = () => {
    crud.focus(context.comments.taskComment);
  }

  const blur = () => {
    crud.blur()
    focusTaskComment();
  }

  return {
    onFocusChanged: crud.onFocusChanged,
    updateList:crud.updateList,
    update: crud.update,
    add: crud.add,
    remove: crud.remove,
    focus: crud.focus,
    blur,
    focusTaskComment
  }
}