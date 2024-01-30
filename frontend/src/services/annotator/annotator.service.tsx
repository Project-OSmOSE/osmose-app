import {
  AnnotatorCtxAction,
} from "./annotator.context.tsx";
import { Subject } from "rxjs";
import { useAnnotationCommentAPI, useAnnotationTaskAPI } from "../api";
import { COLORS } from "../../consts/colors.const.tsx";
import { AnnotationMode, AnnotationType } from "../../enum/annotation.enum.tsx";
import { useShortcuts } from "./other/shorcuts.service.tsx";
import { useToasts } from "./other/toast.service.tsx";
import { useAnnotations } from "./other/annotations.service.tsx";
import { useComments } from "./other/comments.service.tsx";
import { useErrors } from "./other/errors.service.tsx";
import { useTasks } from "./other/tasks.service.tsx";
import { useTags } from "./other/tags.service.tsx";
import { useConfidences } from "./other/confidences.service.tsx";
import { useAnnotatorContext, useAnnotatorDispatch } from "./annotator.context.tsx";
import { buildErrorMessage } from "./format/format.util.tsx";
import { AnnotationComment } from "../../interface/annotation-comment.interface.tsx";

export const useAnnotatorService = () => {
  const context = useAnnotatorContext();
  const dispatch = useAnnotatorDispatch();

  const toasts = useToasts();
  const errors = useErrors();

  const taskAPI = useAnnotationTaskAPI();
  const commentAPI = useAnnotationCommentAPI();

  const comments = useComments();
  const tags = useTags(toasts);
  const confidences = useConfidences(toasts);
  const annotations = useAnnotations(comments, tags, confidences);
  const tasks = useTasks(toasts, errors, annotations, taskAPI);

  const keyPressedSubject = new Subject<KeyboardEvent>();
  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!context.areShortcutsEnabled) return;
    keyPressedSubject.next(event);
  }

  const isBoxAnnotation = (a: any): boolean => {
    return (typeof a.startTime === 'number') &&
      (typeof a.endTime === 'number') &&
      (typeof a.startFrequency === 'number') &&
      (typeof a.endFrequency === 'number');
  }

  const saveFocusComment = async () => {
    if (!context.comments.focus) return;

    let newAnnotationID: number | null = context.comments.focus.annotation_result;
    if (context.comments.focus.newAnnotation) {
      const newAnnotation = context.annotations.array.find(a => a.id === context.comments.focus?.annotation_result);
      if (!newAnnotation) return;

      try {
        annotations.check([newAnnotation]);
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
      comments.focus(comment);
      annotations.update({
        ...context.annotations.focus!,
        id: newAnnotationID ?? undefined,
        result_comments: [comment]
      });
    } catch (e) {
      return toasts.setDanger(buildErrorMessage(e));
    }
  }


  return {
    context,

    keyPressedSubject,

    abort: () => {
      document.removeEventListener("keydown", handleKeyPressed);
      taskAPI.abort();
      commentAPI.abort();
    },
    load: async (taskID: string) => {
      dispatch!([
        { type: 'setLoading', state: true },
        { type: 'setStart', start: new Date() }
      ])
      document.addEventListener("keydown", handleKeyPressed);
      const task = await taskAPI.retrieve(taskID);
      if (task.annotationTags.length < 1) throw new Error('Annotation set is empty');
      if (task.spectroUrls.length < 1) throw new Error('Cannot retrieve spectrograms');

      const taskComment = task.taskComment[0] ?? {
        comment: '',
        annotation_result: null,
        annotation_task: task.id
      }
      const actions: AnnotatorCtxAction = [
        {
          type: 'setTask',
          task: { ...task, duration: (task.boundaries.endTime.getTime() - task.boundaries.startTime.getTime()) / 1000 }
        },
        { type: 'setError', error: undefined },
        { scope: 'comments', type: 'focus', item: taskComment },
        { scope: 'tags', type: 'updateList', array: task.prevAnnotations.map(a => a.annotation) },
        { type: 'setTaskComment', comment: taskComment },
        { type: 'setTagColors', map: new Map(task.annotationTags.map((t, i) => [t, COLORS[i % COLORS.length]])) },
        {
          type: 'updateList', scope: 'annotations', array: task.prevAnnotations.map(a => {
            const isBox = isBoxAnnotation(a);
            const comments = a.result_comments;
            if (comments.length < 1) {
              comments.push({
                id: -1,
                comment: "",
                annotation_task: task.id,
                annotation_result: a.id ?? null
              });
            }
            return {
              type: isBox ? AnnotationType.box : AnnotationType.tag,
              id: a.id,
              annotation: a.annotation,
              startTime: isBox ? a.startTime ?? 0 : -1,
              endTime: isBox ? a.endTime ?? 0 : -1,
              startFrequency: isBox ? a.startFrequency ?? 0 : -1,
              endFrequency: isBox ? a.endFrequency ?? 0 : -1,
              result_comments: comments
            }
          })
        }
      ];
      const defaultConfidence = task.confidenceIndicatorSet.confidenceIndicators.find(c => c.isDefault)
      if (defaultConfidence) actions.push({ scope: 'confidences', type: 'focus', item: defaultConfidence.label })
      dispatch!(actions);
    },
    endLoading: () => dispatch!([{ type: 'setLoading', state: false }]),

    shortcuts: useShortcuts(),
    toasts, errors,
    annotations,
    comments, saveFocusComment,
    tasks,
    tags,
    confidences,
  }
}