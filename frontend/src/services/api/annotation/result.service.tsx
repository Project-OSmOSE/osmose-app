import { OldAPIService } from "../api-service.util.tsx";
import { DetectorConfiguration } from "./detector.service";
import { AnnotationComment, WriteAnnotationComment } from "./comment.service";
import { DatasetListItem } from '@/services/api';
import { DetectorSelection } from '@/slices/create-campaign/import-annotations.ts';

export interface AnnotationResultValidations {
  id: number;
  annotator: number; // pk - read only
  result: number; // pk - read only
  is_valid: boolean;
}

export interface AnnotationResultBounds {
  start_time: number | null; // null for presence
  end_time: number | null; // null for presence or point
  start_frequency: number | null; // null for presence
  end_frequency: number | null; // null for presence or point
}

export interface AnnotationResult extends AnnotationResultBounds {
  id: number;
  label: string;
  confidence_indicator: string | null;
  annotation_campaign: number; // pk - read only
  annotator: number; // pk - read only
  dataset_file: number; // pk - read only
  detector_configuration: DetectorConfiguration & { detector: string } | null;
  comments: Array<AnnotationComment>;
  validations: Array<AnnotationResultValidations>;
}

export const DEFAULT_PRESENCE_RESULT: AnnotationResult = {
  id: -1,
  label: "",
  confidence_indicator: null,
  start_time: null,
  end_time: null,
  start_frequency: null,
  end_frequency: null,
  comments: [],
  validations: [],
  detector_configuration: null,
  dataset_file: -1,
  annotator: -1,
  annotation_campaign: -1,
}

export type WriteAnnotationResult =
  Omit<AnnotationResult, "id" | "comments" | "validations" | "annotation_campaign" | "dataset_file" | "annotator">
  & {
  id: number | null;
  comments: Array<WriteAnnotationComment>;
  validations: Array<Omit<AnnotationResultValidations, "id" | "annotator" | "result"> & { id: number | null }>;
};

export interface ImportAnnotationResult {
  is_box: boolean;
  dataset: string;
  detector: string;
  detector_config: string;
  start_datetime: string; // datetime
  end_datetime: string; // datetime
  min_frequency: number;
  max_frequency: number;
  label: string;
  confidence_indicator: string | null;
}


export class AnnotationResultAPIService extends OldAPIService<AnnotationResult, WriteAnnotationResult> {
  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  importAnnotations(campaignID: string | number,
                    file: File,
                    dataset: DatasetListItem,
                    detectors: Array<DetectorSelection>,
                    force: boolean = false): Promise<Array<AnnotationResult>> {
    const detectors_map: { [key in string]: { detector: string, configuration: string } } = {}
    for (const d of detectors) {
      detectors_map[d.initialName] = {
        detector: d.knownDetector?.name ?? d.initialName,
        configuration: d.knownConfiguration?.configuration ?? d.newConfiguration ?? ''
      }
    }
    const data = new FormData()
    data.append('file', file)
    return super.create(data as any, `${ this.URI }/campaign/${ campaignID }/import/`, {
      dataset_name: dataset.name,
      detectors_map: JSON.stringify(detectors_map),
      force
    }) as Promise<any>
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}


export const useAnnotationResultAPI = () => {
  return new AnnotationResultAPIService('/api/annotation-result');
}
