export interface ScaleMapping {

  valueToPosition(value: number): number;
  valuesToPositionRange(min: number, max: number): number;

  positionToValue(position: number): number;
  positionsToRange(min: number, max: number): number;

  isRangeContinuouslyOnScale(min: number, max: number): boolean;

  canvas?: HTMLCanvasElement;
}
export interface AbstractScale extends ScaleMapping{
  getSteps(): Array<Step>;
}

export interface Steps {
  /**
   * Map <position to value>
   */
  smallSteps: Map<number, number>;

  /**
   * Map <position to value>
   */
  bigSteps: Map<number, number>;

  /**
   * Map <position to value>
   */
  dualBigSteps?: Map<number, { n1: number, n2: number }>;
}


export interface Step {
  position: number;
  importance: 'small' | 'big';
  value: number;
  additionalValue?: number;
  correspondingRatio?: number;
}
