import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { AxisProps } from "@/components/spectrogram/axis.interface.ts";
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
      const annotatedScales = multi_linear_scale.inner_scales.map(s => ({
        ...s,
        rangeRatio: s.ratio - Math.max(0, ...multi_linear_scale.inner_scales.filter(o => o.ratio < s.ratio).map(s => s.ratio))
      }))
      return new MultiLinearScaleService(
        height,
        multi_linear_scale.inner_scales.map(s => ({
          ...s,
          ratio: annotatedScales.find(a => a.ratio === s.ratio)!.rangeRatio
            + annotatedScales.filter(o => o.ratio > s.ratio).map(o => o.rangeRatio).reduce((a, b) => a + b, 0)
        }))
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
    canvas: canvasRef.current ?? undefined
  }))

  useEffect(() => {
    console.debug('[useEffect]', linear_scale?.name, multi_linear_scale?.name)
    display()
  }, [canvasRef, scaleService]);

  const display = (): void => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !height) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0)';
    context.font = "500 10px 'Exo 2'";

    const steps = scaleService.getSteps();
    for (let [y, _] of steps.smallSteps) {
      context.fillRect(canvas.width - 10, height - y, 10, 1);
    }
    for (let [y, value] of steps.bigSteps) {
      y = height - y;
      const yBarWidth = getBigTickWidth(value);
      const yBar = y >= canvas.height - yBarWidth ? canvas.height - yBarWidth : y;
      context.fillRect(canvas.width - 15, yBar - yBarWidth / 2, 15, yBarWidth);

      // "Top align" all labels but first
      if (y < (height - 5)) context.textBaseline = 'top'
      else context.textBaseline = 'bottom'

      context.fillText(frequencyToString(value), 0, y);
    }
    if (!steps.dualBigSteps) return;
    for (let [y, { n1, n2 }] of steps.dualBigSteps) {
      y = height - y;
      const yBarWidth = Math.max(getBigTickWidth(n1), getBigTickWidth(n2));
      const yBar = y >= canvas.height - yBarWidth ? canvas.height - yBarWidth : y;
      context.fillRect(canvas.width - 15, yBar - yBarWidth / 2, 15, yBarWidth);

      context.textBaseline = 'top'
      context.fillText(frequencyToString(Math.min(n1, n2)), 0, y);
      context.textBaseline = 'bottom'
      context.fillText(frequencyToString(Math.max(n1, n2)), 0, y);
    }
  }

  const getBigTickWidth = (value: number): number => {
    const allBorders = multi_linear_scale?.inner_scales.flatMap(s => [s.min_value, s.max_value]) ?? []
    return allBorders.includes(value) ? 4 : 2;
  }

  const frequencyToString = (value: number): string =>  {
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
