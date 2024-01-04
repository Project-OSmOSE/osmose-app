export interface Item {
  id: number,
  name: string
}
export type Dataset = {
  id: string,
  name: string,
  type: string,
  folder_name: string,
  conf_folder: string,
  dataset_type_name: string,
  dataset_type_desc: string,
  files_type: string,
  files_count: number,
  location_name: string,
  location_desc: string,
  location_lat: string,
  location_lon: string,
  start_date: string,
  end_date: string,
  created_at: string,
  spectros: Array<SpectrogramConfiguration>
};

export interface SpectrogramConfiguration extends Item {}

export type AnnotationCampaign = {
  id: string,
  name: string,
  created_at: string,
  desc?: string,
  instructions_url?: string,
  annotation_set: AnnotationSet,
  confidence_indicator_set: ConfidenceIndicatorSet,
  files_count: number,
  user_tasks_count: number,
  user_complete_tasks_count: number,
  start: string, //TODO: rename start_date
  end: string, //TODO: rename end_date,
  datasets: Array<Dataset>,
  spectro_configs: Array<SpectrogramConfiguration>
}

export type AnnotationSet = {
  id: number,
  name: string,
  desc: string,
  tags: Array<string>
}

export type ConfidenceIndicatorSet = {
  id: number,
  name: string,
  desc: string,
  confidence_indicators: Array<string>,
  default_confidence_indicator: number,
}

export interface User extends Item {
  email: string;
}

export type AnnotationTaskStatus = {
  annotator_id: number;
  status: number;
  count: number;
}

export type AnnotationTask = {
  id: number;
  status: TaskStatus;
  filename: string;
  dataset_name: string;
  start: string, //TODO: rename start_date
  end: string, //TODO: rename end_date
  campaignId: string;
  instructions_url: string;
  audioUrl: string;
}

export enum TaskStatus {
  created = 'Created',
  started = 'Started',
  finished = 'finished'
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