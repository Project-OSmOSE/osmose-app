import {
  AnnotatorCtxAction,
} from "./annotator.context.tsx";
import { Subject } from "rxjs";
import { useAnnotationCommentAPI, useAnnotationTaskAPI } from "../api";
import { COLORS } from "../../consts/colors.const.tsx";
import { AnnotationType } from "../../enum/annotation.enum.tsx";
import { useShortcuts } from "./other/shorcuts.service.tsx";
import { useToasts } from "./other/toast.service.tsx";
import { useAnnotations } from "./other/annotations.service.tsx";
import { useComments } from "./other/comments.service.tsx";
import { useErrors } from "./other/errors.service.tsx";
import { useTasks } from "./other/tasks.service.tsx";
import { useTags } from "./other/tags.service.tsx";
import { useConfidences } from "./other/confidences.service.tsx";
import { useAnnotatorContext, useAnnotatorDispatch } from "./annotator.context.tsx";

export const useAnnotatorService = () => {
  const context = useAnnotatorContext();
  const dispatch = useAnnotatorDispatch();

  const toasts = useToasts();
  const errors = useErrors();

  const taskAPI = useAnnotationTaskAPI();
  const commentAPI = useAnnotationCommentAPI();

  const annotations = useAnnotations();
  const comments = useComments(toasts, errors, annotations, taskAPI, commentAPI);
  const tasks = useTasks(toasts, errors, annotations, taskAPI);
  const tags = useTags(toasts);
  const confidences = useConfidences(toasts);

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
    comments,
    tasks,
    tags,
    confidences,
  }
}