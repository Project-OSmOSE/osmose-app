import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { AxisProps } from "@/components/spectrogram/axis.interface.ts";
import { AbstractScale, ScaleMapping } from "@/services/spectrogram/scale/abstract.scale.ts";
import { LinearScaleService } from "@/services/spectrogram/scale/linear.scale.ts";

export const YAxis = React.forwardRef<ScaleMapping, AxisProps>((props: AxisProps, ref: React.ForwardedRef<ScaleMapping>) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const scaleService: AbstractScale = useMemo(() => {
    if (props.linear_scale) {
      return new LinearScaleService(
        props.height,
        props.linear_scale.max_value,
        props.linear_scale.min_value
      )
    }
    // TODO: MultiLinearScaleService
    return new LinearScaleService(
      props.height,
      props.max_value
    )
  }, [props.linear_scale, props.height, props.max_value]);

  const valueToPosition = (value: number): number => {
    return props.height - scaleService.valueToPosition(value);
  }

  const positionToValue = (position: number): number => {
    if (position < 0) position = 0
    return Math.floor(scaleService.positionToValue(props.height - position));
  }

  const valuesToHeight = (min: number, max: number): number => {
    return Math.abs(valueToPosition(max) - valueToPosition(min));
  }

  const positionsToRange = (min: number, max: number): number => {
    return Math.abs(positionToValue(max) - positionToValue(min));
  }

  useImperativeHandle(ref, (): ScaleMapping => ({
    valueToPosition,
    valuesToHeight,
    positionToValue,
    positionsToRange,
    canvas: canvasRef.current ?? undefined
  }))

  useEffect(() => {
    display()
  }, [canvasRef, props]); // TODO: check height change or scale change does display correct scale

  const display = (): void => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !props.height) return;
    const bounds: DOMRect = canvas.getBoundingClientRect();

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0)';
    context.font = "500 10px 'Exo 2'";

    const steps = scaleService.getSteps();
    for (let [y, _] of steps.smallSteps) {
      context.fillRect(canvas.width - 10, props.height - y, 10, 1);
    }
    for (let [y, value] of steps.bigSteps) {
      y = props.height - y;
      let yBarWidth = 2;
      // if (this.configuration.type === 'multi-linear'
      //   && (Array.from(this.configuration.steps.map(s => s.value)).includes(value)
      //     || value === 0)) {
      //   yBarWidth *= 2
      // }
      const yBar = y >= canvas.height - yBarWidth ? canvas.height - yBarWidth : y;
      context.fillRect(canvas.width - 15, yBar, 15, yBarWidth);

      let yTxt: number = y;
      if (yTxt < (bounds.height - 5))
        // "Top align" all labels but first
        yTxt += 12;

      let text = value.toString();
      if (value >= 1000) {
        let newValue: string |number = value / 1000;
        if (newValue % 1 > 0) newValue = newValue.toFixed(1)
        text = `${ newValue }k`;
      }
      context.fillText(text, 0, yTxt);
    }
  }

  return (
    <canvas ref={ canvasRef }
            width={ props.width }
            height={ props.height }
            style={ props.style }
    ></canvas>
  )
})
