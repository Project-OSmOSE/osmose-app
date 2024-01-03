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
};

export type AnnotationCampaign = {
  id: string,
  name: string,
  created_at: string,
  desc: string,
  instructions_url: string,
  annotation_set: AnnotationSet,
  confidence_indicator_set: ConfidenceIndicatorSet,
  files_count: number,
  user_tasks_count: number,
  user_complete_tasks_count: number,
  start: string, //TODO: rename start_date
  end: string, //TODO: rename end_date
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

export type User = {
  id: string,
  email: string,
}

export type AnnotationTask = {
  annotator_id: number;
  status: number;
  count: number;
}