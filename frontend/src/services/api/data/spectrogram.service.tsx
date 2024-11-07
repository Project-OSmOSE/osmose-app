import { useAuthService } from "../../auth";
import { APIService } from "../api-service.util.tsx";
import { AnnotationCampaign } from "../annotation/campaign.service.tsx";

export interface SpectrogramConfiguration {
  id: number;
  name: string;
  folder_path: string;
  desc: string;
  nfft: number;
  window_size: number;
  overlap: number;
  dataset_sr: number;
  zoom_level: number;
  spectro_normalization: string;
  data_normalization: string;
  zscore_duration: string;
  hp_filter_min_freq: number;
  colormap: string;
  dynamic_min: number;
  dynamic_max: number;
  frequency_resolution: number;
  spectro_duration?: number;
  sensitivity_dB?: number;
  peak_voltage?: number;
  gain_dB?: number;
  temporal_resolution?: number;
  audio_file_dataset_overlap?: number;
  time_resolution_zoom_0: number;
  time_resolution_zoom_1: number;
  time_resolution_zoom_2: number;
  time_resolution_zoom_3: number;
  time_resolution_zoom_4: number;
  time_resolution_zoom_5: number;
  time_resolution_zoom_6: number;
  time_resolution_zoom_7: number;
  time_resolution_zoom_8: number;
  window_type: WindowType;
  linear_frequency_scale: LinearScale | null;
  multi_linear_frequency_scale: MultiLinearScale | null;
}

export interface WindowType {
  id: number;
  name: string;
}

export interface LinearScale {
  name?: string;
  ratio: number;
  min_value: number;
  max_value: number;
}

export interface MultiLinearScale {
  name?: string;
  inner_scales: Array<LinearScale>;
}

export function getScaleName(configuration: SpectrogramConfiguration): string {
  if (configuration.linear_frequency_scale) return configuration.linear_frequency_scale.name ?? 'Linear';
  if (configuration.multi_linear_frequency_scale) return configuration.multi_linear_frequency_scale.name ?? 'Multi-linear';
  return 'Default'
}

class SpectrogramConfigurationAPIService extends APIService<SpectrogramConfiguration, never> {

  listForCampaign(campaignID: string | number): Promise<Array<SpectrogramConfiguration>> {
    return this.list(undefined, {
      annotation_campaigns__id: campaignID
    })
  }

  downloadForCampaign(campaign: AnnotationCampaign): Promise<void> {
    const filename = campaign.name.replace(' ', '_') + '_spectrogram_configuration.csv';
    const url = this.getURLWithQueryParams(`${ this.URI }/export/`, {
      filename
    })
    return this.download(url, filename);
  }

  create(): Promise<never> {
    throw 'Unimplemented';
  }
}

export const useSpectrogramConfigurationAPI = () => {
  const auth = useAuthService();
  return new SpectrogramConfigurationAPIService('/api/spectrogram-configuration', auth);
}
