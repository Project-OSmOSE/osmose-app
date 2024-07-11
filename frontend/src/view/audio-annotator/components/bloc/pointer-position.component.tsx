import React, { Fragment } from "react";
import { formatTimestamp } from "@/services/utils/format.tsx";
import { useAppSelector } from "@/slices/app.ts";

export const PointerPosition: React.FC = () => {
  const {
    pointerPosition,
  } = useAppSelector(state => state.annotator.spectro);

  if (!pointerPosition) return <Fragment/>
  return <p className="workbench-pointer">
    { pointerPosition.frequency.toFixed(2) }Hz / { formatTimestamp(pointerPosition.time, false) }
  </p>
}
