import { User } from "@/types/user.ts";

export type CampaignUsage = 'Create' | 'Check';

export class AnnotationCampaignArchive {
  date: Date;
  by_user: User;

  constructor(data: AnnotationCampaignArchiveDTO) {
    this.date = new Date(data.date);
    this.by_user = data.by_user;
  }

  public get DTO(): AnnotationCampaignArchiveDTO {
    return {
      date: this.date.toISOString(),
      by_user: this.by_user
    }
  }
}

export interface AnnotationCampaignArchiveDTO {
  date: string;
  by_user: User;
}

export type AnnotationStatus = {
  annotator: User;
  finished: number;
  total: number;
}
