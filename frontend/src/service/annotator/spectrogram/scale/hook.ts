import { useCurrentConfiguration, useSpectrogramDimensions } from '../hook.ts';
import { useCallback, useMemo } from 'react';
import { LinearScaleService } from './linear.service.ts';
import { MultiLinearScaleService } from '@/service/annotator/spectrogram/scale/multi-linear.service.ts';
import { AbstractScale } from '@/service/dataset/spectrogram-configuration/scale';
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";

export const useXAxis = (): AbstractScale => {
  const { width } = useSpectrogramDimensions()
  const { data } = useRetrieveAnnotator()
  return useMemo(() => new LinearScaleService(width, data?.file.duration ?? 0), [ width, data?.file ])
}

export const useYAxis = (): AbstractScale => {
  const currentConfiguration = useCurrentConfiguration()
  const { height } = useSpectrogramDimensions()
  const { data } = useRetrieveAnnotator()
  const scale = useMemo(() => {
    if (currentConfiguration?.linear_frequency_scale) {
      return new LinearScaleService(
        height,
        currentConfiguration?.linear_frequency_scale.max_value,
        currentConfiguration?.linear_frequency_scale.min_value
      )
    }
    if (currentConfiguration?.multi_linear_frequency_scale) {
      return new MultiLinearScaleService(
        height,
        currentConfiguration?.multi_linear_frequency_scale.inner_scales
      )
    }
    return new LinearScaleService(height, data?.file.maxFrequency ?? 0)
  }, [
    currentConfiguration?.linear_frequency_scale,
    currentConfiguration?.multi_linear_frequency_scale,
    data?.file.maxFrequency,
    height
  ]);

  const valueToPosition = useCallback((value: number) => {
    let position = height - scale.valueToPosition(value);
    if (position > height) position = height
    if (position < 0) position = 0
    return position
  }, [ scale ])

  const positionToValue = useCallback((position: number) => {
    if (position < 0) position = 0
    return Math.floor(scale.positionToValue(height - position));
  }, [ scale ])

  const valuesToPositionRange = useCallback((min: number, max: number) => {
    return Math.abs(valueToPosition(max) - valueToPosition(min));
  }, [ scale ])

  const positionsToRange = useCallback((min: number, max: number) => {
    return Math.abs(positionToValue(max) - positionToValue(min));
  }, [ scale ])

  const isRangeContinuouslyOnScale = useCallback(scale.isRangeContinuouslyOnScale.bind(scale), [ scale ])
  const getSteps = useCallback(scale.getSteps.bind(scale), [ scale ])
  
  return useMemo(() => ({
    valueToPosition,
    valuesToPositionRange,
    positionToValue,
    positionsToRange,
    isRangeContinuouslyOnScale,
    getSteps
  }), [ scale ])
}

export const useAxis = () => {
  return {
    xAxis: useXAxis(),
    yAxis: useYAxis()
  }
}