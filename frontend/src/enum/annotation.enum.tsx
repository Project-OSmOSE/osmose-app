export enum AnnotationTaskStatus {
  created = 0,
  started = 1,
  finished = 2
}

export enum AnnotationMode {
  wholeFile = 1,
  boxes = 2,
}

export enum Usage {
  create = 1,
  check = 2,
}

export enum AnnotationType {
  box = 'box',
  tag = "tag"
}

export enum AnnotationMethod {
  notSelected = -1,
  random = 0,
  sequential = 1
}
