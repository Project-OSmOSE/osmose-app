export type UIState = {
  fileFilters: FileFilters
}

export type FileFilters = {
  search?: string;
  isSubmitted?: boolean;
  withUserAnnotations?: boolean;
  label?: string;
  confidence?: string;
  detector?: string;
  hasAcousticFeatures?: boolean;
  minDate?: string;
  maxDate?: string;
}