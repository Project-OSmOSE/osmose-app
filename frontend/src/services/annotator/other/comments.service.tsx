import { buildErrorMessage } from "../format/format.util.tsx";
import { AnnotationMode, AnnotationType } from "../../../enum/annotation.enum.tsx";
import { ToastService } from "./toast.service.tsx";
import { AnnotationTaskAPIService } from "../../api";
import { AnnotationsService } from "./annotations.service.tsx";
import { ErrorService } from "./errors.service.tsx";
import { AnnotationComment } from "../../../interface/annotation-comment.interface.tsx";
import { Annotation } from "../../../interface/annotation.interface.tsx";
import { DefaultCrudService, useCrud } from "./default-crud.service.tsx";
import { useAnnotatorContext, useAnnotatorDispatch } from "../annotator.context.tsx";
import { AnnotationCommentAPIService } from "../../api/annotation-comment-api.service.tsx";

export interface CommentsService extends DefaultCrudService<AnnotationComment> {
  focusTaskComment: () => void;
  saveFocusComment: () => void;
}

export const useComments = (toasts: ToastService,
                            errors: ErrorService,
                            annotations: AnnotationsService,
                            taskAPI: AnnotationTaskAPIService,
                            commentAPI: AnnotationCommentAPIService): CommentsService => {
  const context = useAnnotatorContext();
  const dispatch = useAnnotatorDispatch();

  const crud = useCrud<AnnotationComment>('comments');

  const focusTaskComment = () => {
    crud.focus(context.comments.taskComment);
  }

  const blur = () => {
    dispatch!([
      { scope: 'comments', type: 'blur' },
      { scope: 'comments', type: 'focus', item: context.comments.taskComment }
    ])
  }

  const checkAnnotations = (annotations: Array<Annotation>) => {
    if (annotations.find(a => !a.annotation.length)) throw 'Make sure all your annotations are tagged.';
    if (context.task?.confidenceIndicatorSet && annotations.find(a => !a.confidenceIndicator?.length)) throw 'Make sure all your annotations have a confidence indicator.';
  }

  const saveFocusComment = async () => {
    if (!context.comments.focus) return;

    let newAnnotationID: number | null = context.comments.focus.annotation_result;
    if (context.comments.focus.newAnnotation) {
      const newAnnotation = context.annotations.array.find(a => a.id === context.comments.focus?.annotation_result);
      if (!newAnnotation) return;

      try {
        checkAnnotations([newAnnotation]);
      } catch (e) {
        return toasts.setDanger(buildErrorMessage(e));
      }

      const now = new Date().getTime();
      const task_start_time = Math.floor((context.start ?? now) / 1000);
      const task_end_time = Math.floor(now / 1000);
      if (context.task?.annotationScope === AnnotationMode.wholeFile) {
        // Save new AnnotationTag in PresenceMode
        const newPresence = context.annotations.array.find(
          a => a.type === AnnotationType.tag && a.annotation === newAnnotation.annotation
            && !a.result_comments.find((c: AnnotationComment) => c.newAnnotation)
        );

        try {
          if (newPresence) {
            const newPresenceNewID = await taskAPI.addAnnotation(context.task!.id, {
              annotation: annotations.prepare(newPresence),
              task_start_time, task_end_time
            });
            annotations.changeItemID(newPresence.id, newPresenceNewID);
          }
          newAnnotationID = await taskAPI.addAnnotation(context.task!.id, {
            annotation: annotations.prepare(newAnnotation),
            task_start_time, task_end_time
          });
          toasts.setSuccess('This Annotation is saved.');
        } catch (e) {
          errors.set(e);
        }
      }
    }

    /** Don't save new empty comment */
    if ((!context.comments.focus?.id || context.comments.focus?.id < 0) && context.comments.focus?.comment === "") return;

    try {
      const response = await commentAPI.create({
        comment_id: !context.comments.focus?.id || context.comments.focus?.id < 0 ? undefined : context.comments.focus?.id,
        annotation_result_id: newAnnotationID,
        annotation_task_id: context.comments.focus?.annotation_task,
        comment: context.comments.focus?.comment
      })
      const comment: AnnotationComment = {
        comment: response.delete ? '' : response.comment,
        annotation_task: context.comments.focus.annotation_task,
        annotation_result: newAnnotationID,
        id: response.delete ? undefined : response.comment_id
      }

      if (comment.annotation_result === null) return dispatch!([{ type: 'setTaskComment', comment }])

      dispatch!([
        { scope: 'comments', type: 'focus', item: comment },
        {
          scope: 'annotations', type: 'update', item: {
            ...context.annotations.focus!,
            id: newAnnotationID ?? undefined,
            result_comments: [comment]
          }
        }
      ])
    } catch (e) {
      return toasts.setDanger(buildErrorMessage(e));
    }
  }

  return {
    updateList:crud.updateList,
    update: crud.update,
    add: crud.add,
    remove: crud.remove,
    focus: crud.focus,
    blur,
    focusTaskComment, saveFocusComment }
}