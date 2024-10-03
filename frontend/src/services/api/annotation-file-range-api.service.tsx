import { useAuthService } from "../auth";
import { APIService } from "./api-service.util.tsx";
import { User } from "@/types/user.ts";

export type AnnotationFileRange = {
  id: number;
  annotator: User;
  annotation_campaign: BasicCampaign;
  first_file_index: number;
  last_file_index: number;
}

export type BasicCampaign = {
  id: number;
  name: string,
  desc: string,
  instructions_url: string,
  deadline: null | string,
  annotation_scope: number,
  usage: number,
  label_set: number,
  owner: number,
  confidence_indicator_set: null | number,
  archive: null | number,
  datasets: Array<number>
}

class AnnotationFileRangeAPIService extends APIService<Array<AnnotationFileRange>, AnnotationFileRange, never> {

  public listForCampaign(campaignID: number): Promise<Array<AnnotationFileRange>> {
    return this.list(undefined, { annotation_campaign: campaignID })
  }

  public listForCampaignWithFinishedCount(campaignID: number): Promise<Array<AnnotationFileRange & {
    finished_count: number
  }>> {
    return this.list(undefined, { annotation_campaign: campaignID, with_finish_count: true }) as any
  }

}

export const useAnnotationFileRangeAPI = () => {
  const auth = useAuthService();
  return new AnnotationFileRangeAPIService('/api/annotation-file-range', auth);
}
