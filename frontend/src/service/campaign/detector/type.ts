export interface Detector {
  id: number;
  name: string;
  configurations: Array<DetectorConfiguration>;
}

export interface DetectorConfiguration {
  id: number;
  configuration: string;
}
