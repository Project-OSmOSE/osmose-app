import { useAuthService, } from "../../auth";
import { APIService } from "../api-service.util.tsx";
import { AnnotationCampaign } from "./campaign.service";
import { AnnotationComment, WriteAnnotationComment } from "./comment.service";
import { AnnotationResult, WriteAnnotationResult } from "./result.service";
import { ConfidenceIndicatorSet } from "./confidence-set.service";
import { LabelSet } from "./label-set.service";
import { User } from "../user.service";
import { SpectrogramConfiguration } from "../data/spectrogram.service";
import { DatasetFile } from "../data/file.service";

type AnnotatorData = {
  campaign: AnnotationCampaign;
  file: DatasetFile;
  user: User;
  results: Array<AnnotationResult>;
  task_comments: Array<AnnotationComment>;
  label_set: LabelSet;
  confidence_set: ConfidenceIndicatorSet | null;
  spectrogram_configurations: Array<SpectrogramConfiguration>;
  previous_file_id: number | null;
  next_file_id: number | null;
}
type WriteAnnotatorData = {
  results: Array<WriteAnnotationResult>;
  task_comments: Array<WriteAnnotationComment>;
  session: {
    start: number; // seconds
    end: number; // seconds
  },
}

class AnnotatorAPIService extends APIService<AnnotatorData, WriteAnnotatorData> {

  get(campaignID: string | number, fileID: string | number): Promise<AnnotatorData> {
    return super.list(`${ this.URI }/campaign/${ campaignID }/file/${ fileID }/`) as Promise<any>
  }
  post(campaignID: string | number, fileID: string | number, data: WriteAnnotatorData): Promise<AnnotatorData> {
    return super.create(data, `${ this.URI }/campaign/${ campaignID }/file/${ fileID }/`)
  }

  list(): Promise<Array<AnnotatorData>> {
    throw 'unimplemented';
  }

  retrieve(): Promise<AnnotatorData> {
    throw 'unimplemented';
  }

  create(): Promise<AnnotatorData> {
    throw 'unimplemented';
  }
}

export const useAnnotatorAPI = () => {
  const auth = useAuthService();
  return new AnnotatorAPIService('/api/annotator', auth);
}
