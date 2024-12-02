import { Detector, DetectorConfiguration } from '@/service/campaign/detector';

export interface CSVDetectorItem {
  initialName: string;
  existingDetector?: Detector;
  existingConfiguration?: DetectorConfiguration;
  editConfiguration?: string;
  selected: boolean;
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
