import { AnnotationCampaign } from '@/service/campaign';
import { DatasetFile } from '@/service/dataset';
import { User } from '@/service/user';
import { AnnotationResult, WriteAnnotationResult } from '@/service/campaign/result';
import { AnnotationComment } from '@/services/api';
import { LabelSet } from '@/service/campaign/label-set';
import { ConfidenceIndicatorSet } from '@/service/campaign/confidence-set';
import { SpectrogramConfiguration } from '@/service/dataset/spectrogram-configuration';
import { WriteAnnotationComment } from '@/services/api/annotation/comment.service.tsx';

export type AnnotatorState = Partial<AnnotatorData> & {
  focusedResultID?: number,
  focusedCommentID?: number,
  focusedLabel?: string,
  focusedConfidenceLabel?: string,
  hasChanged: boolean,
  labelColors: { [key: string]: string };
  userPreferences: {
    audioSpeed: number;
    spectrogramConfigurationID: number;
    zoomLevel: number;
  },
  ui: {
    areShortcutsEnabled: boolean;
    pointerPosition?: { time: number, frequency: number },
    zoomOrigin?: { x: number, y: number },
  },
  audio: {
    time: number;
    isPaused: boolean;
    stopTime?: number;
  },
  sessionStart: number;
}


export type AnnotatorData = {
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

export type WriteAnnotatorData = {
  results: Array<WriteAnnotationResult>;
  task_comments: Array<WriteAnnotationComment>;
  session: {
    start: Date; // Send ISO String
    end: Date; // Send ISO String
  },
}

export type ResultType = 'presence' | 'point' | 'box';
