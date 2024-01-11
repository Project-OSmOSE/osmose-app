export enum AnnotationTaskStatus {
  created = 0,
  started = 1,
  finished = 2
}

export enum AnnotationMode {
  boxes = 1,
  wholeFile = 2
}

export enum AnnotationMethod {
  notSelected = -1,
  random = 0,
  sequential = 1
}