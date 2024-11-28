import { useAuthService, } from "../../auth";
import { OldAPIService } from "../api-service.util.tsx";
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
    start: Date; // Send ISO String
    end: Date; // Send ISO String
  },
}

class AnnotatorAPIService extends OldAPIService<AnnotatorData, WriteAnnotatorData> {

  get(campaignID: string | number, fileID: string | number): Promise<AnnotatorData> {
    return super.list(`${ this.URI }/campaign/${ campaignID }/file/${ fileID }/`) as Promise<any>
  }

  post(campaign: AnnotationCampaign, fileID: string | number, data: WriteAnnotatorData): Promise<{
    results: Array<AnnotationResult>,
    task_comments: Array<AnnotationComment>,
  }> {
    if (campaign.usage === 'Check') {
      data.results = data.results.map(r => ({
        ...r,
        validations: r.validations.length > 0 ? r.validations : [ {
          id: null,
          is_valid: false
        } ],
      }))
    }
    return super.create({
      ...data,
      session: {
        start: data.session.start.toISOString() as any,
        end: data.session.start.toISOString() as any,
      }
    }, `${ this.URI }/campaign/${ campaign.id }/file/${ fileID }/`)
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