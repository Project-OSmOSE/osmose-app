import { Step } from './types';
import { useCallback, useEffect } from 'react';

export const useAxis = ({ canvas, steps, orientation, pixelSize, valueToString, displaySmallStepValue }: {
  canvas?: HTMLCanvasElement | null,
  steps: Step[],
  orientation: 'horizontal' | 'vertical',
  pixelSize: number,
  valueToString: (value: number) => string;
  displaySmallStepValue: boolean;
}) => {

  const draw = useCallback(async () => {
    const context = canvas?.getContext('2d');
    if (!canvas || !context || !pixelSize) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0)';
    const font = '400 10px "Space Mono"'
    await document.fonts.load(font)
    context.font = font;

    const scaleSteps = steps.sort((a: Step, b: Step) => (a.correspondingRatio ?? 0) - (b.correspondingRatio ?? 0));
    const realSteps = new Array<Step>();
    for (const step of scaleSteps) {
      const position = Math.round(pixelSize - step.position);
      const existingStep = realSteps.find(s => s.position === position)
      if (existingStep) {
        existingStep.additionalValue = step.value;
      } else {
        realSteps.push({ ...step, position })
      }
    }
    for (const step of realSteps) {
      let position = step.position;
      switch (orientation) {
        case 'horizontal':
          position = canvas.width - position;
          break;
        case 'vertical':
          position = canvas.height - position
          break;
      }

      // Tick
      let tickLength = 10;
      let tickWidth = 1;
      switch (step.size) {
        case 'regular':
          tickLength = 15;
          tickWidth = 2;
          break;
        case 'big':
          tickLength = 15;
          tickWidth = 4;
          break;
      }
      let tickPosition = position;
      if (pixelSize - tickWidth < tickPosition) tickPosition = pixelSize - tickWidth

      switch (orientation) {
        case 'vertical':
          context.fillRect(canvas.width - tickLength, tickPosition, tickLength, tickWidth);
          break;
        case 'horizontal':
          context.fillRect(tickPosition <= canvas.width - 2 ? tickPosition : canvas.width - 2, 0, tickWidth, tickLength);
          break;
      }

      // Text
      if (step.size === 'small' && !displaySmallStepValue) continue;
      if (step.additionalValue) {
        const min = Math.min(step.value, step.additionalValue)
        const max = step.value === min ? step.additionalValue : step.value;
        switch (orientation) {
          case 'vertical':
            context.textBaseline = 'top'
            break;
          case 'horizontal':
            context.textAlign = 'right'
            break;
        }
        context.fillText(valueToString(min), 0, position);
        switch (orientation) {
          case 'vertical':
            context.textBaseline = 'bottom'
            break;
          case 'horizontal':
            context.textAlign = 'left'
            break;
        }
        context.fillText(valueToString(max), 0, position);
      } else {
        let textPosition = position;
        const text = valueToString(step.value)
        switch (orientation) {
          case 'vertical':
            // "Top align" all labels but first
            if (textPosition < (pixelSize - 5)) {
              context.textBaseline = 'top'
            } else {
              context.textBaseline = 'bottom'
            }
            context.fillText(text, 0, textPosition);
            break;
          case 'horizontal':
            if (textPosition === 0) {
              context.textAlign = 'left'
            } else if (textPosition > (pixelSize - text.length * 8)) {
              context.textAlign = 'right'
              textPosition -= 8;
            } else {
              context.textAlign = 'center'
            }
            context.fillText(text, textPosition, 25);
            break;
        }
      }
    }
  }, [ canvas, steps, orientation, pixelSize, valueToString, displaySmallStepValue ])

  useEffect(() => {
    draw()
  }, [ canvas, pixelSize, valueToString, orientation, steps ]);

}