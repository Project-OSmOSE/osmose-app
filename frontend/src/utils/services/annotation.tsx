import { Auth, AuthAction, useAuth, useAuthDispatch } from "../auth.tsx";
import { Dispatch, useEffect } from "react";
import {
  AnnotationTaskAPIService,
  Retrieve as TaskRetrieve, RetrieveAnnotation, RetrieveComment,
  RetrieveConfidenceIndicator,
  useAnnotationTaskAPI
} from "../api/annotation-task.tsx";
import { AnnotationTask, Comment, TYPE_BOX } from "../../AudioAnnotator/AudioAnnotator.tsx";

const COLORS = ['#00b1b9', '#a23b72', '#f18f01', '#c73e1d', '#bb7e5d', '#eac435', '#98ce00', '#2a2d34', '#6761a8', '#009b72'];

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
  task: TaskRetrieve,
  duration: number;
  frequencyRange: number;
  annotations: Array<Annotation>;
  presences: Set<string>;
  taskComment: RetrieveComment;
  tagColors: Map<string, string>;
  defaultConfidence?: RetrieveConfidenceIndicator;
}

export interface AddAnnotationData {
  task: AnnotationTask,
  annotation: Annotation,
  taskStartTime: number
}

export type AnnotationDto = {
  id?: number,
  annotation: string,
  startTime: number | null,
  endTime: number | null,
  startFrequency: number | null,
  endFrequency: number | null,
  confidenceIndicator?: string,
  result_comments: Array<Comment>,
};

export interface AddAnnotationData {
  task: AnnotationTask,
  annotation: Annotation,
  taskStartTime: number
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

  private isBoxAnnotation(a: RetrieveAnnotation) {
    return (typeof a.startTime === 'number') &&
      (typeof a.endTime === 'number') &&
      (typeof a.startFrequency === 'number') &&
      (typeof a.endFrequency === 'number');
  }

  private transformAnnotationForAPI(annotation: Annotation): AnnotationDto {
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
}

export const useAnnotationService = () => {
  const auth = useAuth();
  const authDispatch = useAuthDispatch();

  const taskAPI = useAnnotationTaskAPI();

  const service = new AnnotationService(taskAPI);
  service.auth = auth;
  service.authDispatch = authDispatch;

  useEffect(() => {
    service.auth = auth;
  }, [auth])

  useEffect(() => {
    service.authDispatch = authDispatch;
  }, [authDispatch])

  return service;
}