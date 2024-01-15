import { Dispatch, useEffect } from "react";
import {
  AnnotationTaskAPIService,
  AnnotationTaskRetrieve,
  AnnotationTaskRetrieveAnnotation,
  AnnotationTaskRetrieveComment,
  AnnotationTaskRetrieveConfidenceIndicator,
  useAnnotationTaskAPI
} from "../../../services/api";
import { AnnotationTask, TYPE_BOX } from "../../AudioAnnotator/AudioAnnotator.tsx";
import { Auth, AuthAction, useAuthService } from "../../../services/auth";
import { COLORS } from "../../../consts/colors.const.tsx";

export type Annotation = {
  type: string,
  id?: number,
  annotation: string,
  startTime: number,
  endTime: number,
  startFrequency: number,
  endFrequency: number,
  active: boolean,
  confidenceIndicator?: string,
  result_comments: Array<Comment>,
};

export interface LoadResult {
  task: AnnotationTaskRetrieve,
  duration: number;
  frequencyRange: number;
  annotations: Array<Annotation>;
  presences: Set<string>;
  taskComment: AnnotationTaskRetrieveComment;
  tagColors: Map<string, string>;
  defaultConfidence?: AnnotationTaskRetrieveConfidenceIndicator;
}

export interface AddAnnotationData {
  task: AnnotationTask,
  annotation: Annotation,
  taskStartTime: number
}

export interface AddAnnotationData {
  task: AnnotationTask,
  annotation: Annotation,
  taskStartTime: number
}

interface SubmitData {
  annotations: Annotation[]
}

class AnnotationService {

  public auth?: Auth;
  public authDispatch?: Dispatch<AuthAction>;

  constructor(private taskAPI: AnnotationTaskAPIService) {
  }

  public async loadTask(id: string): Promise<LoadResult> {
    const task = await this.taskAPI.retrieve(id);

    if (task.annotationTags.length < 1) throw new Error('Annotation set is empty');
    if (task.spectroUrls.length < 1) throw new Error('Cannot retrieve spectrograms');

    return {
      task,
      duration: (task.boundaries.endTime.getTime() - task.boundaries.startTime.getTime()) / 1000,
      frequencyRange: task.boundaries.endFrequency - task.boundaries.startFrequency,
      annotations: task.prevAnnotations.map(a => {
        const isBoxAnnotation = this.isBoxAnnotation(a);
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
          type: isBoxAnnotation ? 'box' : 'tag',
          id: a.id,
          annotation: a.annotation,
          startTime: isBoxAnnotation ? a.startTime ?? 0 : -1,
          endTime: isBoxAnnotation ? a.endTime ?? 0 : -1,
          startFrequency: isBoxAnnotation ? a.startFrequency ?? 0 : -1,
          endFrequency: isBoxAnnotation ? a.endFrequency ?? 0 : -1,
          active: false,
          result_comments: comments
      }
      }),
      presences: new Set(task.prevAnnotations.map(a => a.annotation)),
      taskComment: task.taskComment[0] ?? {
        comment: '',
        annotation_result: null,
        annotation_task: task.id
      },
      tagColors: new Map(task.annotationTags.map((t, i) => [t, COLORS[i % COLORS.length]])),
      defaultConfidence: task.confidenceIndicatorSet.confidenceIndicators.find(c => c.isDefault)
    }
  }

  /**
   *
   * @param task
   * @param annotation
   * @param taskStartTime
   * @return {number}: new annotation id
   */
  public async addAnnotation({ task, annotation, taskStartTime }: AddAnnotationData): Promise<number> {
    return await this.taskAPI.addAnnotation(task.id, {
      annotation: this.transformAnnotationForAPI(annotation),
      task_start_time: Math.floor(taskStartTime / 1000),
      task_end_time: Math.floor((new Date()).getTime() / 1000)
    });
  }

  public abort() {
    this.taskAPI.abort();
  }

  private isBoxAnnotation(a: AnnotationTaskRetrieveAnnotation) {
    return (typeof a.startTime === 'number') &&
      (typeof a.endTime === 'number') &&
      (typeof a.startFrequency === 'number') &&
      (typeof a.endFrequency === 'number');
  }

  private transformAnnotationForAPI(annotation: Annotation): AnnotationTaskDto {
    const startTime = annotation.type === TYPE_BOX ? annotation.startTime : null;
    const endTime = annotation.type === TYPE_BOX ? annotation.endTime : null;
    const startFrequency = annotation.type === TYPE_BOX ? annotation.startFrequency : null;
    const endFrequency = annotation.type === TYPE_BOX ? annotation.endFrequency : null;
    const result_comments = annotation.result_comments.filter(c => c.comment.length > 0);
    return {
      id: annotation.id,
      startTime,
      endTime,
      annotation: annotation.annotation,
      startFrequency,
      endFrequency,
      confidenceIndicator: annotation.confidenceIndicator,
      result_comments: result_comments,
    };
  }

  public submit({ annotations }: SubmitData) {
    if (annotations.filter(a => a.annotation.length < 1).length > 0) throw 'Make sure all your annotations are tagged'

  }
}

export const useAnnotationService = () => {
  const {context, dispatch} = useAuthService();

  const taskAPI = useAnnotationTaskAPI();

  const service = new AnnotationService(taskAPI);
  service.auth = context;
  service.authDispatch = dispatch;

  useEffect(() => {
    service.auth = context;
  }, [context])

  useEffect(() => {
    service.authDispatch = dispatch;
  }, [dispatch])

  return service;
}