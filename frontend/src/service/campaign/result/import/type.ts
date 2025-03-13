import { ACCEPT_CSV_MIME_TYPE } from "@/consts/csv.ts";
import { Detector, DetectorConfiguration } from "@/service/campaign/detector";

export type ImportState = {
  file: FileState;
  detectors: DetectorState;
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

export type FileLoadingError = UnreadableFileError | WrongMIMETypeError | UnsupportedCSVError | CannotFormatCSVError;

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

export class CannotFormatCSVError extends Error {
  message = 'Cannot format the file data'
}

export class EmptyCSVError extends Error {
  message = 'The CSV is empty'
}

export interface DetectorSelection {
  initialName: string;
  isNew: boolean;
  knownDetector?: Detector; // isNew = false
  isNewConfiguration?: boolean;
  knownConfiguration?: DetectorConfiguration; // isNewConfiguration = false
  newConfiguration?: string; // isNewConfiguration = true
}