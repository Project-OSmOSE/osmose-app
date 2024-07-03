import { AbstractScale, Steps } from "./abstract.scale.ts";
import { LinearScale, LinearScaleService } from "./linear.scale.ts";


export interface MultiLinearScale {
  name?: string;
  inner_scales: Array<LinearScale>;
}

export class MultiLinearScaleService implements AbstractScale {

  private innerScales: Array<{ service: LinearScaleService, scale: LinearScale }> = [];

  constructor(private pixelHeight: number,
              innerScales: Array<LinearScale>,) {
    let previousRatio = 0
    const data = [...innerScales].sort((a, b) => a.ratio - b.ratio)
    for (const scale of data) {
      // Go through scale with ascending ratio (since ratio correspond to the scale max frequency position)
      if (innerScales.some(otherScale => otherScale.min_value < scale.min_value && otherScale.max_value > scale.min_value))
        throw new Error('Given scales are conflicting!')
      if (innerScales.some(otherScale => otherScale.min_value < scale.max_value && otherScale.max_value > scale.max_value))
        throw new Error('Given scales are conflicting!')
      if (scale.ratio === 0)
        throw new Error('Cannot have a ratio of 0!')

      this.innerScales.push({
        scale,
        service: new LinearScaleService(
          pixelHeight * (scale.ratio - previousRatio),
          scale.max_value,
          scale.min_value
        )
      })
      previousRatio = scale.ratio;
    }
  }

  private getScaleForValue(value: number): LinearScaleService {
    // Scale including value
    let correspondingScale = this.innerScales.find(s => s.scale.min_value <= value && s.scale.max_value >= value);

    if (!correspondingScale) {
      // Search out of the scale
      const absoluteMin = Math.min(...this.innerScales.map(s => s.scale.min_value))
      const absoluteMax = Math.max(...this.innerScales.map(s => s.scale.max_value))
      if (value < absoluteMin) {
        correspondingScale = this.innerScales.find(s => s.scale.min_value === absoluteMin);
      } else if (value > absoluteMax)
        correspondingScale = this.innerScales.find(s => s.scale.max_value === absoluteMax);
      else {
        // Value between 2 scales
        const directUp = Math.min(...this.innerScales.filter(s => s.scale.min_value > value).map(s => s.scale.min_value))
        correspondingScale = this.innerScales.find(s => s.scale.max_value === directUp);
      }
    }

    return correspondingScale!.service;
  }

  private getScaleForPosition(position: number): LinearScaleService {
    const ratio = position / this.pixelHeight;
    const minUpperRatio = Math.min(...this.innerScales.filter(s => s.scale.ratio > ratio).map(s => s.scale.ratio))
    return this.innerScales.find(s => s.scale.ratio === minUpperRatio)!.service;
  }

  valueToPosition(value: number): number {
    return this.getScaleForValue(value).valueToPosition(value);
  }

  valuesToHeight(min: number, max: number): number {
    return Math.abs(
      this.getScaleForValue(min).valueToPosition(min)
      - this.getScaleForValue(max).valueToPosition(max)
    )
  }

  positionToValue(position: number): number {
    return this.getScaleForPosition(position).positionToValue(position);
  }

  positionsToRange(min: number, max: number): number {
    return Math.abs(
      this.getScaleForPosition(min).positionToValue(min)
      - this.getScaleForPosition(max).positionToValue(max)
    )
  }

  getSteps(): Steps {
    const steps: Steps = {
      bigSteps: new Map<number, number>(),
      smallSteps: new Map<number, number>(),
      dualBigSteps: new Map<number, {n1: number; n2: number}>()
    }
    for (const scale of this.innerScales.sort(s => s.scale.ratio)) {
      const scaleSteps = scale.service.getSteps();
      for (const [y, value] of scaleSteps.bigSteps) {
        if (Array.from(steps.bigSteps.values()).includes(value)) continue;
        const realY = y + (1 - scale.scale.ratio) * this.pixelHeight;

        if (value === scale.scale.max_value && this.innerScales.some(s => s.scale.min_value === scale.scale.max_value)) {
          steps.dualBigSteps!.set(realY, {n1: value, n2: value})
          continue;
        }
        if (value === scale.scale.min_value && this.innerScales.some(s => s.scale.max_value === scale.scale.min_value)) continue;
        if (steps.bigSteps.has(realY)) {
          steps.dualBigSteps!.set(realY, {
            n1: steps.bigSteps.get(realY)!,
            n2: value
          })
          steps.bigSteps.delete(realY)
        } else {
          steps.bigSteps.set(
            realY,
            value
          )
        }
      }
      console.debug(steps.bigSteps)
      for (const [y, value] of scaleSteps.smallSteps) {
        if (Array.from(steps.smallSteps.values()).includes(value)) continue;
        steps.smallSteps.set(
          y + (1 - scale.scale.ratio) * this.pixelHeight,
          value
        )
      }
    }
    return steps;
  }
}
