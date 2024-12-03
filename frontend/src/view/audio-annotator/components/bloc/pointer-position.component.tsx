import React, { Fragment } from "react";
import { useAppSelector } from "@/slices/app.ts";
import { formatTime } from '@/service/dataset/spectrogram-configuration/scale';

export const PointerPosition: React.FC = () => {
  const pointerPosition = useAppSelector(state => state.annotator.ui.pointerPosition);

  if (!pointerPosition) return <Fragment/>
  return <p className="workbench-pointer">
    { pointerPosition.frequency.toFixed(2) }Hz / { formatTime(pointerPosition.time, false) }
  </p>
}
