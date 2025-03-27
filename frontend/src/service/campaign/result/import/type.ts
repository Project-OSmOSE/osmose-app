import { ACCEPT_CSV_MIME_TYPE } from "@/consts/csv.ts";
import { Detector, DetectorConfiguration } from "@/service/campaign/detector";

export type ImportSliceState = {
  file: FileState;
  detectors: DetectorState;
  upload: UploadState;
}

type FileState = {
  state: 'initial';
} | {
  state: 'loading',
  name: string;
} | {
  state: 'error';
  name: string;
  error: unknown;
} | {
  state: 'loaded';
  name: string;
  type: string;
  detectors: string[];
  header: string[];
  rows: string[][];
}
type DetectorState = {
  selection: string[],
  mapToKnown: { [key in string]: Detector | undefined };
  mapToConfiguration: { [key in string]: DetectorConfiguration | string | undefined };
}
export const CHUNK_SIZE = 200;
export type ImportInfo = {
  uploaded: number;
  total: number;
  duration: number;
  remainingDurationEstimation?: number; // ms
}
type UploadState =
  { state: 'initial' }
  | (ImportInfo & { state: 'uploading' })
  | (ImportInfo & { state: 'fulfilled' })
  | (ImportInfo & { state: 'paused' })
  | (ImportInfo & { state: 'error', error: string, canForce: boolean })
  | (ImportInfo & { state: 'update file' });

export class UnreadableFileError extends Error {
  message = 'Error reading file, check the file isn\'t corrupted'
}

export class WrongMIMETypeError extends Error {
  constructor(type: string) {
    super(`Wrong MIME Type, found : ${ type } ; but accepted types are: ${ ACCEPT_CSV_MIME_TYPE }`);
  }
}

export class UnsupportedCSVError extends Error {
  message = `The file is empty or it does not contain a string content.`
}

export class EmptyCSVError extends Error {
  message = 'The CSV is empty'
}
