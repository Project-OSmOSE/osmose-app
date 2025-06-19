import React, { useEffect, useImperativeHandle, useRef } from "react";
import { formatTime } from '@/service/dataset/spectrogram-configuration/scale';
import { useXAxis, X_HEIGHT } from '@/service/annotator/spectrogram/scale';
import { useSpectrogramDimensions } from '@/service/annotator/spectrogram/hook.ts';
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";

export type AxisRef = {
  toDataURL(type?: string, quality?: any): string | undefined;
}

export const XAxis = React.forwardRef<AxisRef, {
  className?: string;
}>(({ className }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useImperativeHandle(ref, () => ({
    toDataURL: (type?: string, quality?: any) => canvasRef.current?.toDataURL(type, quality)
  }), [ canvasRef.current ]);

  const xAxis = useXAxis()
  const { width } = useSpectrogramDimensions()
  const { data } = useRetrieveAnnotator()

  useEffect(() => {
    display()
  }, [ canvasRef, width ]);

  const getTimeSteps = () => {
    if (!data || data.file.duration <= 60) return { step: 1, bigStep: 5 }
    else if (data.file.duration > 60 && data.file.duration <= 120) return { step: 2, bigStep: 5 }
    else if (data.file.duration > 120 && data.file.duration <= 500) return { step: 4, bigStep: 5 }
    else if (data.file.duration > 500 && data.file.duration <= 1000) return { step: 10, bigStep: 60 }
    else return { step: 30, bigStep: 120 }
  }

  const display = (): void => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !width || !data) return;

    context.clearRect(0, 0, width, X_HEIGHT);

    const steps = getTimeSteps();

    context.fillStyle = 'rgba(0, 0, 0)';
    context.font = "500 10px 'Exo 2'";

    for (let i = 0; i <= data.file.duration; i++) {
      if (i % steps.step === 0) {
        const x: number = xAxis.valueToPosition(i);

        if (i % steps.bigStep === 0) {
          // Bar
          context.fillRect(x <= canvas.width - 2 ? x : canvas.width - 2, 0, 2, 15);

          // Text
          const timeText: string = formatTime(i);
          let xTxt: number = x;
          if (xTxt === 0) {
            context.textAlign = "left"
          } else if (xTxt > (width - timeText.length * 8)) {
            context.textAlign = "right"
            xTxt -= 8;
          } else {
            context.textAlign = "center"
          }
          context.fillText(timeText, xTxt, 25);
        } else {
          // Bar only
          context.fillRect(x, 0, 1, 10);
        }
      }
    }
  }

  return <canvas ref={ canvasRef }
                 width={ width }
                 height={ X_HEIGHT }
                 className={ className }/>
})
