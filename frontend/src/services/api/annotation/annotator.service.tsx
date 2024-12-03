import { OldAPIService } from "../api-service.util.tsx";
import { AnnotationCampaign } from '@/service/campaign';
import { AnnotationResult } from '@/service/campaign/result';
import { AnnotatorData, WriteAnnotatorData } from '@/service/annotator/type.ts';
import { AnnotationComment } from '@/service/campaign/comment';


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
  return new AnnotatorAPIService('/api/annotator');
}
