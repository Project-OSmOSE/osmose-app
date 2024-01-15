import { useTaskContext, useTaskDispatch } from "./task.context.tsx";
import { AnnotationTag } from "../../../interface/annotation-tag.interface.tsx";
import { AnnotationDto, useAnnotationTaskAPIService } from "../../../src/service/api/annotation-task-api.service.tsx";
import { AnnotationMode } from "../../../enum";
import { buildErrorMessage } from "../format/format.util.tsx";
import { useAnnotationContext } from "../annotation/annotation.context.tsx";

export const useTaskService = () => {
  const context = useTaskContext();
  const dispatch = useTaskDispatch();
  const annotationTagContext = useAnnotationContext();
  const taskAPI = useAnnotationTaskAPIService();

  const cleanAnnotation = (annotation: AnnotationTag): AnnotationDto => {
    const startTime = annotation.type === AnnotationMode.boxes ? annotation.startTime : null;
    const endTime = annotation.type === AnnotationMode.boxes ? annotation.endTime : null;
    const startFrequency = annotation.type === AnnotationMode.boxes ? annotation.startFrequency : null;
    const endFrequency = annotation.type === AnnotationMode.boxes ? annotation.endFrequency : null;
    return {
      id: +annotation.id,
      startTime,
      endTime,
      annotation: annotation.annotation,
      startFrequency,
      endFrequency,
      confidenceIndicator: annotation.confidenceIndicator,
      result_comments: annotation.result_comments.filter(c => c.comment.length > 0),
    };
  }

  return {
    context,
    dispatch,
    submit: async () => {
      if (annotationTagContext.annotations.filter(a => a.annotation.length === 0).length > 0)
        throw 'Make sure all your annotations are tagged.';
      if (context.currentTask!.confidenceIndicatorSet && annotationTagContext.annotations.filter(a => a.confidenceIndicator?.length === 0).length > 0)
        throw 'Make sure all your annotations have a confidence indicator.';

      try {
        return await taskAPI.update(context.currentTask!.id, {
          annotations: annotationTagContext.annotations
            .sort((a, b) => a.startTime - b.startTime)
            .map(a => cleanAnnotation(a)),
          task_start_time: Math.floor(context.start!.getTime() / 1000),
          task_end_time: Math.floor(new Date().getTime() / 1000)
        })
      } catch (e: any) {
        dispatch!({
          type: "toast",
          toast: {
            level: "danger",
            messages: [buildErrorMessage(e)]
          }
        })
        throw e;
      } finally {
        dispatch!({ type: 'endLoading' });
      }
    }
  }
}