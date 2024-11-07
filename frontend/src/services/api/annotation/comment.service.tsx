import { useAuthService } from "../../auth";
import { APIService } from "../api-service.util.tsx";

export interface AnnotationComment {
  id: number;
  annotation_result: number | null; // pk
  annotation_campaign: number; // pk
  author: number; // pk
  dataset_file: number; // pk
  comment: string;
}

export type WriteAnnotationComment = Omit<AnnotationComment, "id" | "annotation_result" | "annotation_campaign" | "author" | "dataset_file"> & {id: number | null;}


class AnnotationCommentAPIService extends APIService<AnnotationComment, WriteAnnotationComment> {

  listGlobalCommentForCampaignFile(campaignID: string | number, fileID: string | number): Promise<Array<AnnotationComment>> {
    return this.list(undefined, {
      annotation_result__isnull: true,
      annotation_campaign:campaignID,
      dataset_file:fileID
    })
  }

  createForAnnotator(data: WriteAnnotationComment, campaignID: string | number, fileID: string | number): Promise<AnnotationComment> {
    return super.create(data, `${ this.URI }/campaign/${ campaignID }/file/${ fileID }/global`);
  }

  create(): Promise<AnnotationComment> {
    throw 'unimplemented';
  }

  mapForWriting(c: AnnotationComment): WriteAnnotationComment {
    return {
      id: c.id > -1 ? c.id : null,
      comment: c.comment
    }
  }
}

export const useAnnotationCommentAPI = () => {
  const auth = useAuthService();
  return new AnnotationCommentAPIService('/api/annotation-comment', auth);
}
