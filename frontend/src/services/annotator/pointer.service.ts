import { MouseEvent, MutableRefObject, PointerEvent, WheelEvent } from "react";
import { ScaleMapping } from "@/services/spectrogram";

export const usePointerService = (
  canvas: MutableRefObject<HTMLCanvasElement | null>,
  xAxis: MutableRefObject<ScaleMapping | null>,
  yAxis: MutableRefObject<ScaleMapping | null>,
) => {

  function isInCanvas(event: PointerEvent<HTMLDivElement> | MouseEvent) {
    const bounds = canvas.current?.getBoundingClientRect();
    if (!bounds) return false;
    if (event.clientX < bounds.x) return false;
    if (event.clientY < bounds.y) return false;
    if (event.clientX > (bounds.x + bounds.width)) return false;
    return event.clientY <= (bounds.y + bounds.height);
  }

  function getCoords(e: PointerEvent | WheelEvent | MouseEvent): { x: number, y: number } | undefined {
    if (!canvas.current) return;
    const bounds = canvas.current.getBoundingClientRect();
    return {
      y: e.clientY - bounds.y,
      x: e.clientX - bounds.x,
    }
  }

  function getFreqTime(e: PointerEvent<HTMLDivElement> | MouseEvent): { frequency: number, time: number } | undefined {
    if (!isInCanvas(e)) return;
    if (!yAxis.current || !xAxis.current) return;
    const coords = getCoords(e);
    if (!coords) return;
    return {
      frequency: yAxis.current.positionToValue(coords.y),
      time: xAxis.current.positionToValue(coords.x),
    }
  }

  return { getCoords, getFreqTime, isInCanvas }
}