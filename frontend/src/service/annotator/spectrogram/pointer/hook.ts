import { MouseEvent, PointerEvent, WheelEvent } from 'react';
import { useSpectrogramDimensions } from '@/service/annotator/spectrogram';
import { useAxis } from '@/service/annotator/spectrogram/scale';

type Event = PointerEvent<any> | MouseEvent | WheelEvent

export const usePointerService = () => {

  const { xAxis, yAxis } = useAxis();
  const { height, width } = useSpectrogramDimensions();

  function getCanvas(e: MouseEvent): HTMLCanvasElement | undefined {
    return document.elementsFromPoint(e.clientX, e.clientY).find(element => {
      return element instanceof HTMLCanvasElement
        && element.height === height && element.width === width
    }) as HTMLCanvasElement;
  }

  function getCoords(e: Event): { x: number, y: number } | undefined {
    const canvas = getCanvas(e);
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    return {
      y: e.clientY - bounds.y,
      x: e.clientX - bounds.x,
    }
  }

  function getFreqTime(e: Event): { frequency: number, time: number } | undefined {
    const coords = getCoords(e);
    if (!coords) return;
    return {
      frequency: yAxis.positionToValue(coords.y),
      time: xAxis.positionToValue(coords.x),
    }
  }

  return { getCoords, getFreqTime }
}