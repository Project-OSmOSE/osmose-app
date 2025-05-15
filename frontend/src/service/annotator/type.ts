import {
  AnnotationComment,
  AnnotationResult,
  ConfidenceIndicator,
  DatasetFile,
  SpectrogramConfiguration
} from '@/service/types';
import { Colormap } from '@/services/utils/color';

export type AnnotatorState = Partial<AnnotatorData> & {
  spectrogram_configurations: SpectrogramConfiguration[];
  focusedResultID?: number,
  focusedCommentID?: number,
  focusedLabel?: string,
  focusedConfidenceLabel?: string,
  hasChanged: boolean,
  userPreferences: {
    audioSpeed: number;
    spectrogramConfigurationID: number;
    zoomLevel: number;
    colormap?: Colormap;
    colormapInverted?: boolean;
    brightness: number;
    contrast: number;
  },
  ui: {
    pointerPosition?: { time: number, frequency: number },
    zoomOrigin?: { x: number, y: number },
    hiddenLabels: string[]
  },
  didSeeAllFile: boolean,
  audio: {
    time: number;
    isPaused: boolean;
    stopTime?: number;
  },
  sessionStart: number;
  confidenceIndicators?: ConfidenceIndicator[];
  canAddAnnotations?: boolean;
}


export type AnnotatorData = {
  is_submitted: boolean;
  is_assigned: boolean; // Is the user allowed to edit this file
  campaignID: number;
  userID: number
  file: DatasetFile;
  results: Array<AnnotationResult>;
  task_comments: Array<AnnotationComment>;
  previous_file_id: number | null;
  next_file_id: number | null;

  current_task_index: number;
  total_tasks: number;
  current_task_index_in_filter: number;
  total_tasks_in_filter: number;
}
