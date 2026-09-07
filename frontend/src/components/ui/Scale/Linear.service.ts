import { LinearScaleNode } from '@/api';
import { ScaleService, Step } from './types';

export type LinearScale = Pick<LinearScaleNode, 'minValue' | 'maxValue' | 'ratio'>

export class LinearScaleService implements ScaleService {

    private MIN_SMALL_STEPS_RANGE_PX = 16;
    private MIN_BIG_STEPS_RANGE_PX = 30;

    get minValue(): number {
        return this.scale.minValue;
    }

    get maxValue(): number {
        return this.scale.maxValue;
    }

    get ratio(): number {
        return this.scale.ratio;
    }

    get range(): number {
        return this.scale.maxValue - this.scale.minValue;
    }

    public get height(): number {
        return this.pixelSize;
    }

    constructor(private pixelSize: number,
                public scale: LinearScale,
                private options: {
                    pixelOffset: number;
                    disableValueFloats: boolean;
                    revert: boolean;
                } = {
                    pixelOffset: 0,
                    disableValueFloats: false,
                    revert: false,
                }) {
        if (scale.minValue && scale.minValue > scale.maxValue) throw `Incorrect scale range: min=${ scale.minValue } and max=${ scale.maxValue }`;
    }

    valueToPosition(value: number): number {
        let position = this.options.pixelOffset + this.crossProduct(value - this.scale.minValue, this.range, this.pixelSize)
        if (this.options.revert) position = this.pixelSize - position;
        if (position > (this.pixelSize + this.options.pixelOffset)) position = this.pixelSize + this.options.pixelOffset
        if (position < 0) position = 0
        return position
    }

    valuesToPositionRange(min: number, max: number): number {
        return Math.abs(this.valueToPosition(max) - this.valueToPosition(min));
    }

    positionToValue(position: number): number {
        if (position < 0) position = 0;
        if (this.options.revert) position = this.pixelSize - position;
        let value = this.scale.minValue + this.crossProduct(position - this.options.pixelOffset, this.pixelSize, this.range);
        if (this.options.disableValueFloats) value = Math.floor(value)
        return value;
    }

    positionsToRange(min: number, max: number): number {
        return Math.abs(this.positionToValue(max) - this.positionToValue(min));
    }

    getSteps(regularStepsRange = this.getMinBigStepsRange(),
             smallStepsRange = this.getMinSmallStepsRange(regularStepsRange)): Array<Step> {

        const array = new Array<Step>();

        const innerSteps = Math.max(1, this.getNumber(1, smallStepsRange.toString().length))
        for (let value = Math.floor(this.scale.minValue / innerSteps) * innerSteps;
             value <= Math.round(this.scale.maxValue / innerSteps) * innerSteps; value += innerSteps) {
            if (value < this.scale.minValue || value > this.scale.maxValue) continue;
            const position: number = Math.floor(this.valueToPosition(value));
            if (value % regularStepsRange === 0)
                array.push({ position, value, size: 'regular' })
            else if (smallStepsRange > 0 && value % smallStepsRange === 0)
                array.push({ position, value, size: 'small' })
        }
        if (!array.filter(s => s.size === 'regular').some(s => s.value === this.scale.minValue)) {
            array.push({
                position: Math.floor(this.valueToPosition(this.scale.minValue)),
                value: this.scale.minValue,
                size: 'regular',
            })
        }
        if (!array.filter(s => s.size === 'regular').some(s => s.value === this.scale.maxValue)) {
            array.push({
                position: Math.floor(this.valueToPosition(this.scale.maxValue)),
                value: this.scale.maxValue,
                size: 'regular',
            })
        }
        return array
    }

    isRangeContinuouslyOnScale(min: number, max: number): boolean {
        return min >= this.scale.minValue && max >= this.scale.minValue
            && min <= this.scale.maxValue && max <= this.scale.maxValue
    }

    private getMinBigStepsRange(): number {
        const maxFrequencyStr = Math.ceil(this.range).toString();
        let bigStepsRange = this.getNumber(1, maxFrequencyStr.length - 2);
        while (bigStepsRange * this.pixelSize / this.range < this.MIN_BIG_STEPS_RANGE_PX) {
            switch (+bigStepsRange.toString()[0]) {
                case 1:
                    bigStepsRange *= 2
                    break;
                case 2:
                    bigStepsRange *= 5
                    break;
            }
        }
        return bigStepsRange
    }

    private getMinSmallStepsRange(bigStep: number): number {
        let range: number;
        switch (+bigStep.toString()[0]) {
            case 1:
                range = this.getNumber(2, bigStep.toString().length - 1);
                break;
            case 2:
                range = this.getNumber(5, bigStep.toString().length - 1);
                break;
            default:
                return 0;
        }
        while (range * this.pixelSize / this.range < this.MIN_SMALL_STEPS_RANGE_PX) {
            switch (+range.toString()[0]) {
                case 2:
                    range *= 2.5
                    break;
                case 5:
                    range *= 4
                    break;
            }
        }
        return range;
    }

    private crossProduct(value: number, range: number, maxOtherScale: number): number {
        if (value < 0) return 0;
        if (value > range) return maxOtherScale;
        return value * maxOtherScale / range;
    }

    private getNumber(first: number, length: number) {
        length = Math.max(1, length); // Avoid length to be 0
        const numberArray = Array.from(new Array(length)).map((_, key) => key === 0 ? first : 0)
        return Math.max(0, +numberArray.join(''))
    }

}