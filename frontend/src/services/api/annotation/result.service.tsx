import { OldAPIService } from "../api-service.util.tsx";
import { DetectorSelection } from '@/slices/create-campaign/import-annotations.ts';
import { Dataset } from '@/service/dataset';
import { AnnotationResult, WriteAnnotationResult } from '@/service/campaign/result';


export class AnnotationResultAPIService extends OldAPIService<AnnotationResult, WriteAnnotationResult> {
  retrieve(): Promise<never> {
    throw 'Unimplemented';
  }

  importAnnotations(campaignID: string | number,
                    file: File,
                    dataset: Dataset,
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
