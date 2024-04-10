
export class AudioMetadatum {
  id: number;
  start: Date;
  end: Date;
  channel_count: number;
  dataset_sr: number;
  total_samples: number;
  sample_bits: number;
  gain_db: number;
  gain_rel: number;
  dutycycle_rdm: number;
  dutycycle_rim: number;


  constructor(data: AudioMetadatumDTO) {
    this.id = data.id;
    this.start = new Date(data.start);
    this.end = new Date(data.end);
    this.channel_count = data.channel_count;
    this.dataset_sr = data.dataset_sr;
    this.total_samples = data.total_samples;
    this.sample_bits = data.sample_bits;
    this.gain_db = data.gain_db;
    this.gain_rel = data.gain_rel;
    this.dutycycle_rdm = data.dutycycle_rdm;
    this.dutycycle_rim = data.dutycycle_rim;
  }

  public get DTO(): AudioMetadatumDTO {
    return {
      id: this.id,
      start: this.start.toISOString(),
      end: this.end.toISOString(),
      channel_count: this.channel_count,
      dataset_sr: this.dataset_sr,
      total_samples: this.total_samples,
      sample_bits: this.sample_bits,
      gain_db: this.gain_db,
      gain_rel: this.gain_rel,
      dutycycle_rdm: this.dutycycle_rdm,
      dutycycle_rim: this.dutycycle_rim,
    }
  }
}

export interface AudioMetadatumDTO {
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
