import { AnnotationMode, Usage } from "../../src/types/annotations";
import { DATASET } from "./dataset";
import { USERS } from "./users";
import { LABEL_SET } from "./label-set";
import { CONFIDENCE_SET } from "./confidence-set";
import { CreateResultItem } from "../../src/services/api/annotation-campaign-api.service";


export const DETECTOR_1 = {
  name: 'detector1',
  configuration: 'detector1 parameters'
}
export const DETECTOR_2 = {
  name: 'detector2',
  configuration: 'detector2 parameters'
}
export const DETECTOR_3 = {
  name: 'detector3',
  configuration: 'detector3 parameters'
}

export const DEFAULT_CAMPAIGN_NAME = 'Test Dataset campaign';
export const CAMPAIGNS_DATA = {
  [Usage.create]: {
    id: 6,
    name: 'My create campaign test',
    description: 'My create campaign test description',
    instructionsURL: 'https://my-create-campaign-description.com',
    start: '2024-02-17',
    end: '2024-02-17',
    dataset: DATASET,
    annotationScope: AnnotationMode.wholeFile,
    annotators: USERS,
    labelSet: LABEL_SET,
    confidenceSet: CONFIDENCE_SET,
  },
  [Usage.check]: {
    id: 7,
    name: 'My check campaign test',
    description: 'My check campaign test description',
    instructionsURL: 'https://my-check-campaign-description.com',
    start: '2024-02-17',
    end: '2024-02-17',
    dataset: DATASET,
    annotationScope: AnnotationMode.wholeFile,
    annotators: USERS,
    labelSetLabels: [
      "Madagascan pygmy blue whale song",
      "Antarctic blue whale song",
      "Sri Lanka pygmy blue whale song"
    ],
    confidenceSetIndicators: [
      {
        level: 0,
        label: 'not confident'
      },
      {
        level: 1,
        label: 'confident'
      },
    ],
    detectors: [DETECTOR_1, DETECTOR_2, DETECTOR_3],
    results: [
      {
        is_box: false,
        dataset: DATASET.name,
        dataset_file: 'sound001.wav',
        confidence: 'not confident',
        label: 'Madagascan pygmy blue whale song',
        min_time: 0, max_time: 3599,
        min_frequency: 0, max_frequency: 120,
        detector: DETECTOR_1.name,
        detector_config: DETECTOR_1.configuration,
        start_datetime: "2012-10-03T11:00:00.000000+00:00",
        end_datetime: "2012-10-03T11:15:00.000000+00:00"
      },
      {
        is_box: false,
        dataset: DATASET.name,
        dataset_file: 'sound001.wav',
        confidence: 'confident',
        label: 'Antarctic blue whale song',
        min_time: 0, max_time: 4499,
        min_frequency: 0, max_frequency: 120,
        detector: DETECTOR_2.name,
        detector_config: DETECTOR_2.configuration,
        start_datetime: "2012-10-03T11:00:00.000000+00:00",
        end_datetime: "2012-10-03T12:15:00.000000+00:00"
      },
      {
        is_box: true,
        dataset: DATASET.name,
        dataset_file: 'sound001.wav',
        confidence: 'confident',
        label: 'Antarctic blue whale song',
        min_time: 500, max_time: 2000,
        min_frequency: 2000, max_frequency: 8000,
        detector: DETECTOR_2.name,
        detector_config: DETECTOR_2.configuration,
        start_datetime: "2012-10-03T11:00:00.000000+00:00",
        end_datetime: "2012-10-03T11:15:00.000000+00:00"
      },
      {
        is_box: true,
        dataset: DATASET.name,
        dataset_file: 'sound002.wav',
        confidence: 'not confident',
        label: 'Sri Lanka pygmy blue whale song',
        min_time: 800, max_time: 3800,
        min_frequency: 300, max_frequency: 7000,
        detector: DETECTOR_3.name,
        detector_config: DETECTOR_3.configuration,
        start_datetime: "2012-10-03T11:00:00.000000+00:00",
        end_datetime: "2012-10-03T12:15:00.000000+00:00"
      },
      {
        is_box: false,
        dataset: DATASET.name,
        dataset_file: 'sound003.wav',
        confidence: 'not confident',
        tag: 'Sri Lanka pygmy blue whale song',
        min_time: 0, max_time: 3599,
        min_frequency: 0, max_frequency: 120,
        detector: DETECTOR_3.name,
        detector_config: DETECTOR_3.configuration,
        start_datetime: "2012-10-03T11:20:00.000000+00:00",
        end_datetime: "2012-10-03T11:30:00.000000+00:00"
      },
    ] as Array<CreateResultItem>
  },
}
