import { AnnotationMode, Usage } from "../../src/types/annotations";
import { DATASET } from "./dataset";
import { USERS } from "./users";
import { ANNOTATION_SET } from "./annotation-set";
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
export const CAMPAIGNS_DATA = {
  [Usage.create]: {
    name: 'My create campaign test',
    description: 'My create campaign test description',
    instructionsURL: 'https://my-create-campaign-description.com',
    start: '2024-02-17',
    end: '2024-02-17',
    dataset: DATASET,
    annotationScope: AnnotationMode.wholeFile,
    annotators: USERS,
    annotationSet: ANNOTATION_SET,
    confidenceSet: CONFIDENCE_SET,
  },
  [Usage.check]: {
    name: 'My check campaign test',
    description: 'My check campaign test description',
    instructionsURL: 'https://my-check-campaign-description.com',
    start: '2024-02-17',
    end: '2024-02-17',
    dataset: DATASET,
    annotationScope: AnnotationMode.wholeFile,
    annotators: USERS,
    annotationSetLabels: [
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
        tag: 'Madagascan pygmy blue whale song',
        min_time: 0, max_time: 3599,
        min_frequency: 0, max_frequency: 120,
        detector: DETECTOR_1.name,
        detector_config: DETECTOR_1.configuration,
      },
      {
        is_box: false,
        dataset: DATASET.name,
        dataset_file: 'sound001.wav',
        confidence: 'confident',
        tag: 'Antarctic blue whale song',
        min_time: 0, max_time: 3599,
        min_frequency: 0, max_frequency: 120,
        detector: DETECTOR_2.name,
        detector_config: DETECTOR_2.configuration,
      },
      {
        is_box: true,
        dataset: DATASET.name,
        dataset_file: 'sound001.wav',
        confidence: 'confident',
        tag: 'Antarctic blue whale song',
        min_time: 1100, max_time: 2000,
        min_frequency: 20, max_frequency: 80,
        detector: DETECTOR_2.name,
        detector_config: DETECTOR_2.configuration,
      },
      {
        is_box: true,
        dataset: DATASET.name,
        dataset_file: 'sound002.wav',
        confidence: 'not confident',
        tag: 'Sri Lanka pygmy blue whale song',
        min_time: 800, max_time: 1400,
        min_frequency: 30, max_frequency: 70,
        detector: DETECTOR_3.name,
        detector_config: DETECTOR_3.configuration,
      },
    ] as Array<CreateResultItem>
  },
}
