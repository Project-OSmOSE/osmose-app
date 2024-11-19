import { useAuthService } from "../../auth";
import { APIService } from "../api-service.util.tsx";
import { AnnotationCampaign } from "../annotation/campaign.service.tsx";

export interface AudioMetadatum {
  id: number;
  start: string;
  end: string;
  channel_count: number;
  dataset_sr: number;
  total_samples: number;
  sample_bits: number;
  gain_db: number;
  gain_rel: number;
  dutycycle_rdm: number;
  dutycycle_rim: number;
}

class AnnotationCampaignAPIService extends APIService<AudioMetadatum, never> {
  downloadForCampaign(campaign: AnnotationCampaign): Promise<void> {
    const filename = campaign.name.replace(' ', '_') + '_audio_metadata.csv';
    const url = this.getURLWithQueryParams(`${ this.URI }/export/`, {
      filename,
      dataset__annotation_campaigns: campaign.id,
    })
    return this.download(url, filename);
  }

  listForCampaign(campaign: AnnotationCampaign): Promise<Array<AudioMetadatum>> {
    return super.list(undefined, {
      dataset__annotation_campaigns: campaign.id,
    })
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useAudioMetadataAPI = () => {
  const auth = useAuthService();
  return new AnnotationCampaignAPIService('/api/audio-metadata', auth);
}
