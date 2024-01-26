export enum AnnotationTaskStatus {
  created = 0,
  started = 1,
  finished = 2
}

export enum AnnotationMode {
  boxes = 0,
  wholeFile = 1
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