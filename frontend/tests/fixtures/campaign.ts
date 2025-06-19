import { USERS } from './user';
import {
  AnnotationCampaign,
  AnnotationCampaignPhase,
  AnnotationFile,
  AnnotationFileRange,
  ConfidenceIndicator,
  ConfidenceIndicatorSet,
  Detector,
  LabelSet,
  UserGroup
} from '../../src/service/types';
import { DATASET, DATASET_SR } from './dataset';

const deadline = new Date()
deadline.setTime(0)

const classic = 'Rain'
const withFeatures = 'Whistle'
export const LABEL = {
  classic, withFeatures,
  set: {
    id: 1,
    name: 'Test label set',
    labels: [ classic, withFeatures ]
  } satisfies LabelSet
}

const notSure: ConfidenceIndicator = {
  id: 1,
  level: 0,
  is_default: false,
  label: 'not sure'
}
const sure: ConfidenceIndicator = {
  id: 2,
  level: 1,
  is_default: true,
  label: 'sure'
}
export const CONFIDENCE = {
  sure, notSure,
  set: {
    id: 1,
    name: 'Test confidence set',
    desc: 'My test confidence indicator set',
    confidence_indicators: [ notSure, sure ]
  } satisfies ConfidenceIndicatorSet
}

export const CAMPAIGN_PHASE: AnnotationCampaignPhase = {
  id: 1,
  phase: 'Annotation',
  created_by: `${ USERS.creator.first_name } ${ USERS.creator.last_name.toUpperCase() }`,
  created_at: deadline.toISOString().split('T')[0],
  ended_by: null,
  ended_at: null,
  user_progress: 5,
  user_total: 10,
  global_progress: 50,
  global_total: 100,
  has_annotations: true,
  annotation_campaign: 1
}
export const CAMPAIGN = {
  id: 1,
  owner: USERS.creator,
  name: 'Test campaign',
  desc: 'Test campaign description',
  allow_point_annotation: false,
  deadline: deadline.toISOString().split('T')[0],
  files_count: DATASET.files_count,
  created_at: new Date().toISOString(),
  label_set: LABEL.set.id,
  confidence_indicator_set: CONFIDENCE.set.id,
  instructions_url: 'testurl.fr',
  datasets: [ DATASET.name ],
  labels_with_acoustic_features: [ LABEL.withFeatures ],
  archive: null,
  phases: [CAMPAIGN_PHASE.id],
  allow_image_tuning: false,
  allow_colormap_tuning: false,
  colormap_default: null,
  colormap_inverted_default: null,
} satisfies AnnotationCampaign

const start = new Date();
const end = new Date(start.toISOString());
end.setTime(start.getTime() + 10_000);
const duration = end.getTime() - start.getTime()

export const FILE_RANGE = {
  unsubmittedFile: {
    id: 1,
    is_submitted: false,
    results_count: 0,
    dataset_sr: DATASET_SR,
    dataset_name: DATASET.name,
    filename: 'File 2',
    start: start.toISOString(),
    end: end.toISOString(),
    size: 0,
    audio_url: '',
    validated_results_count: 0,
    duration,
    maxFrequency: DATASET_SR / 2
  } satisfies AnnotationFile,
  submittedFile: {
    id: 2,
    is_submitted: true,
    results_count: 2,
    dataset_sr: DATASET_SR,
    dataset_name: DATASET.name,
    filename: 'File 1',
    start: start.toISOString(),
    end: end.toISOString(),
    size: 0,
    audio_url: '',
    validated_results_count: 0,
    duration,
    maxFrequency: DATASET_SR / 2
  } satisfies AnnotationFile,
  range: {
    id: 1,
    files_count: 2,
    first_file_index: 2,
    last_file_index: 3,
    finished_tasks_count: 1,
    annotation_campaign_phase: CAMPAIGN_PHASE.id,
    annotator: USERS.annotator.id
  } satisfies AnnotationFileRange,
}

export const ANNOTATOR_GROUP: UserGroup = {
  id: 1,
  name: 'Staff group',
  annotators: [ USERS.staff ]
}

export const DETECTOR_CONFIGURATION = 'Test configuration';
export const DETECTOR: Detector = {
  name: 'detector1',
  id: 1,
  configurations: [ {
    id: 1,
    configuration: DETECTOR_CONFIGURATION
  } ]
}
