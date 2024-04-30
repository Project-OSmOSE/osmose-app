
export enum AnnotationTaskStatus {
  created = 0,
  started = 1,
  finished = 2
}

export enum AnnotationMode {
  boxes = 1,
  wholeFile = 2,
}

export enum Usage {
  create = 'Create',
  check = 'Check',
}

export enum AnnotationType {
  box = 'box',
  tag = "tag"
}


export type Annotation = {
  id?: number,
  newId?: number, // Used only in front side - used for new annotations not saved yet
  confidenceIndicator?: string,
  label: string,
  startTime: number,
  endTime: number,
  type: AnnotationType,
  startFrequency: number,
  endFrequency: number,
  result_comments: Array<AnnotationComment>,
  validation: boolean | null,
};

export interface AnnotationComment {
  id?: number,
  comment: string,
  annotation_task: number,
  annotation_result: number | null,
  annotation_result_new_id?: number | null, // Used only in front side - used for new annotations not saved yet
}
export const DEFAULT_COMMENT: AnnotationComment = {
  comment: '',
  annotation_task: -1,
  annotation_result: null
}

