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
