import { useEffect, useRef } from 'react';
import { useSpectrogramDimensions } from '@/service/annotator/spectrogram';
import { useAxis } from '@/service/annotator/spectrogram/scale';
import { AbstractScale } from "@/service/dataset/spectrogram-configuration/scale";

type Position = { clientX: number, clientY: number }

export const usePointerService = () => {

  const { xAxis, yAxis } = useAxis();
  const { height, width } = useSpectrogramDimensions();

  const _xAxis = useRef<AbstractScale>(xAxis);
  useEffect(() => {
    _xAxis.current = xAxis
  }, [xAxis]);

  const _yAxis = useRef<AbstractScale>(yAxis);
  useEffect(() => {
    _yAxis.current = yAxis
  }, [yAxis]);

  const _width = useRef<number>(width);
  useEffect(() => {
    _width.current = width
  }, [width]);

  const _height = useRef<number>(height);
  useEffect(() => {
    _height.current = height
  }, [height]);

  function getCanvas(e: Position): HTMLCanvasElement | undefined {
    return document.elementsFromPoint(e.clientX, e.clientY).find(element => {
      return element instanceof HTMLCanvasElement
        && element.height === _height.current && element.width === _width.current
    }) as HTMLCanvasElement;
  }

  function getCoords(e: Position): { x: number, y: number } | undefined {
    const canvas = getCanvas(e);
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    return {
      y: e.clientY - bounds.y,
      x: e.clientX - bounds.x,
    }
  }

  function getFreqTime(e: Position): { frequency: number, time: number } | undefined {
    const coords = getCoords(e);
    if (!coords) return;
    return {
      frequency: _yAxis.current.positionToValue(coords.y),
      time: _xAxis.current.positionToValue(coords.x),
    }
  }

  return { getCoords, getFreqTime }
}