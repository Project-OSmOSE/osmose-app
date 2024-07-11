import React, { Fragment, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { AxisProps } from "@/components/spectrogram/axis.utils.ts";
import { AbstractScale, ScaleMapping } from "@/services/spectrogram/scale/abstract.scale.ts";
import { LinearScaleService } from "@/services/spectrogram/scale/linear.scale.ts";
import { MultiLinearScaleService } from "@/services/spectrogram";

export const YAxis = React.forwardRef<ScaleMapping, AxisProps>(({
                                                                  width,
                                                                  height,
                                                                  linear_scale,
                                                                  multi_linear_scale,
                                                                  max_value,
                                                                  style
                                                                }: AxisProps, ref: React.ForwardedRef<ScaleMapping>) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scaleService: AbstractScale = useMemo(() => {
    if (linear_scale) {
      return new LinearScaleService(
        height,
        linear_scale.max_value,
        linear_scale.min_value
      )
    }
    if (multi_linear_scale) {
      return new MultiLinearScaleService(
        height,
        multi_linear_scale.inner_scales
      )
    }
    return new LinearScaleService(
      height,
      max_value
    )
  }, [linear_scale, multi_linear_scale, max_value, height]);

  const valueToPosition = (value: number): number => {
    return height - scaleService.valueToPosition(value);
  }

  const positionToValue = (position: number): number => {
    if (position < 0) position = 0
    return Math.floor(scaleService.positionToValue(height - position));
  }

  const valuesToPositionRange = (min: number, max: number): number => {
    return Math.abs(valueToPosition(max) - valueToPosition(min));
  }

  const positionsToRange = (min: number, max: number): number => {
    return Math.abs(positionToValue(max) - positionToValue(min));
  }

  useImperativeHandle(ref, (): ScaleMapping => ({
    valueToPosition,
    valuesToPositionRange,
    positionToValue,
    positionsToRange,
    isRangeContinuouslyOnScale: scaleService.isRangeContinuouslyOnScale.bind(scaleService),
    canvas: canvasRef.current ?? undefined
  }), [scaleService, canvasRef.current])

  useEffect(() => {
    display()
  }, [canvasRef, scaleService]);

  const display = (): void => {
    return;
    // const canvas = canvasRef.current
    // const context = canvas?.getContext('2d');
    // if (!canvas || !context || !height) return;
    //
    // context.clearRect(0, 0, canvas.width, canvas.height);
    // context.fillStyle = 'rgba(0, 0, 0)';
    // context.font = "500 10px 'Exo 2'";
    //
    // let previousRatio = 0;
    // let offset = 0;
    // const steps = scaleService.getSteps().sort((a, b) => (a.correspondingRatio ?? 0) - (b.correspondingRatio ?? 0));
    // const maxRatio = Math.max(...steps.map(s => s.correspondingRatio ?? 0));
    // for (const step of steps) {
    //   if (step.correspondingRatio) {
    //     if (step.correspondingRatio !== previousRatio) {
    //       offset = previousRatio / maxRatio * height;
    //       previousRatio = step.correspondingRatio
    //     }
    //   }
    //   const y = height - (offset + step.position);
    //
    //   // Tick
    //   let tickWidth = 10;
    //   let tickHeight = 1;
    //   if (step.importance === 'big') {
    //     tickWidth = 15;
    //     tickHeight = 2;
    //   }
    //   const allBorders = multi_linear_scale?.inner_scales.flatMap(s => [s.min_value, s.max_value]) ?? []
    //   if (allBorders.includes(step.value)) {
    //     tickHeight = 4;
    //     tickWidth = 15;
    //   }
    //   let yTick = y;
    //   if (height - tickHeight < yTick) yTick = height - tickHeight
    //   context.fillRect(canvas.width - tickWidth, yTick, tickWidth, tickHeight);
    //
    //   // Text
    //   if (step.additionalValue) {
    //     context.textBaseline = 'top'
    //     context.fillText(frequencyToString(Math.min(step.value, step.additionalValue)), 0, y);
    //     context.textBaseline = 'bottom'
    //     context.fillText(frequencyToString(Math.max(step.value, step.additionalValue)), 0, y);
    //   } else {
    //     // "Top align" all labels but first
    //     if (y < (height - 5)) context.textBaseline = 'top'
    //     else context.textBaseline = 'bottom'
    //     context.fillText(frequencyToString(step.value), 0, y);
    //   }
    // }
  }

  const frequencyToString = (value: number): string => {
    if (value < 1000) return value.toString()
    let newValue: string | number = value / 1000;
    if (newValue % 1 > 0) newValue = newValue.toFixed(1)
    return `${ newValue }k`;
  }

  return (
    <canvas ref={ canvasRef }
            width={ width }
            height={ height }
            style={ style }
    ></canvas>
  )
})
