import { DetectorListItem, DetectorListItemConfiguration } from '@/services/api';

export interface CSVDetectorItem {
  initialName: string;
  existingDetector?: DetectorListItem;
  editName?: string;
  existingConfiguration?: DetectorListItemConfiguration;
  editConfiguration?: string;
  selected: boolean;
}

export enum AnnotationsCSVError {
  unrecognisedFile = 'unrecognisedFile',
  containsUnrecognizedDataset = 'containsUnrecognizedDataset',
  inconsistentMaxConfidence = 'inconsistentMaxConfidence',
}

export interface CSVColumns {
  required: Array<string>,
  optional: Array<string>
}

export interface AnnotationsCSVRow {
  dataset: string;
  filename: string;
  start_time: number;
  end_time: number;
  start_frequency: number;
  end_frequency: number;
  start_datetime: string;
  end_datetime: string;
  annotation: string;
  detector: string;
  detector_item: CSVDetectorItem;
  is_box: boolean;
  confidence_indicator_label?: string;
  confidence_indicator_level?: number;
  confidence_indicator_max_level?: number;
}

export interface AnnotationsCSV {
  rows: Array<AnnotationsCSVRow>;
  filename: string;
  errors: Array<AnnotationsCSVError>;
}
