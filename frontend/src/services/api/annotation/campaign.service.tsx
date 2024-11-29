import { OldAPIService } from "../api-service.util.tsx";
import { User } from '@/service/user';

export type AnnotationCampaignUsage = 'Create' | 'Check';

export interface AnnotationCampaignArchive {
  id: number;
  date: string; // Date
  by_user: User
}

export type BaseAnnotationCampaign = {
  name: string;
  desc: string | null;
  instructions_url: string | null;
  deadline: string | null; // Date
  datasets: Array<string>; // name
  spectro_configs: Array<number>; //pk
}

/**
 * Read interface
 */
export type AnnotationCampaign = BaseAnnotationCampaign & {
  id: number;
  created_at: string; // Date
  label_set: number; // pk
  usage: AnnotationCampaignUsage;
  owner: string; // username
  confidence_indicator_set: number | null; // pk
  archive: AnnotationCampaignArchive | null; // read_only

  files_count: number; // read_only
  my_progress: number; // read_only
  my_total: number; // read_only
  progress: number; // read_only
  total: number; // read_only
}

/**
 * Write interface for 'Create annotations' usage
 */
export type WriteCreateAnnotationCampaign = BaseAnnotationCampaign & {
  usage: 'Create';
  label_set: number; // pk
  confidence_indicator_set: number | null; // pk
}

/**
 * Write interface for 'Check annotations' usage
 */
export type WriteCheckAnnotationCampaign = BaseAnnotationCampaign & {
  usage: 'Check';
}
export type WriteAnnotationCampaign = WriteCheckAnnotationCampaign | WriteCreateAnnotationCampaign

class AnnotationCampaignAPIService extends OldAPIService<AnnotationCampaign, WriteAnnotationCampaign> {

  downloadReport(campaign: AnnotationCampaign): Promise<void> {
    const filename = campaign.name.replace(' ', '_') + '_results.csv';
    const url = this.getURLWithQueryParams(`${ this.URI }/${ campaign.id }/report/`, {
      filename
    })
    return this.download(url, filename);
  }

  downloadStatus(campaign: AnnotationCampaign): Promise<void> {
    const filename = campaign.name.replace(' ', '_') + '_status.csv';
    const url = this.getURLWithQueryParams(`${ this.URI }/${ campaign.id }/report-status/`, {
      filename
    })
    return this.download(url, filename);
  }

  archive(campaignId: number): Promise<AnnotationCampaign> {
    return this.create({} as any, `${ this.URI }/${ campaignId }/archive/`)
  }
}

export const useAnnotationCampaignAPI = () => {
  return new AnnotationCampaignAPIService('/api/annotation-campaign');
}
