import React, { useMemo } from "react";
import { formatTimestamp } from "@/services/utils/format.tsx";
import { useAppSelector } from "@/slices/app";
import { getFileDuration } from '@/service/dataset';


export const CurrentAnnotationBloc: React.FC = () => {

  const {
    focusedResult,
    confidenceSet,
  } = useAppSelector(state => state.annotator.annotations);
  const {
    file
  } = useAppSelector(state => state.annotator.global);

  const startTime = useMemo(() => {
    if (!focusedResult) return "-"
    if (focusedResult.start_time === null) return "00:00.000";
    return formatTimestamp(focusedResult.start_time);
  }, [focusedResult?.start_time])

  const endTime = useMemo(() => {
    if (!focusedResult) return "-"
    if (focusedResult.end_time === null) return formatTimestamp(getFileDuration(file));
    return formatTimestamp(focusedResult.end_time);
  }, [focusedResult?.end_time])

  const startFrequency = useMemo(() => {
    if (!focusedResult) return "-"
    if (focusedResult.start_frequency === null) return "0";
    return focusedResult.start_frequency.toFixed(2);
  }, [focusedResult?.start_frequency])

  const endFrequency = useMemo(() => {
    if (!focusedResult) return "-"
    if (focusedResult.end_frequency === null) return ((file?.dataset_sr ?? 0) / 2).toFixed(2);
    return focusedResult.end_frequency.toFixed(2);
  }, [focusedResult?.end_frequency])

  const label = useMemo(() => {
    if (!focusedResult?.label) return "-"
    return focusedResult.label;
  }, [focusedResult?.end_frequency])

  const confidence = useMemo(() => {
    if (!focusedResult?.label) return "-"
    return focusedResult.label;
  }, [focusedResult?.end_frequency])

  if (!focusedResult) return (
    <div className="card mr-2  selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body">
        <p className="card-text text-center">-</p>
      </div>
    </div>
  )

  return (
    <div className="card mr-2 selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body d-flex justify-content-between">
        <p className="card-text">
          <i className="fa fa-clock"></i> :&nbsp;
          { startTime }&nbsp;&gt;&nbsp;
          { endTime }<br/>
          <i className="fa fa-arrow-up"></i> :&nbsp;
          { startFrequency }&nbsp;&gt;&nbsp;
          { endFrequency } Hz<br/>
          <i
            className="fa fa-tag"></i> :&nbsp;{ label }<br/>
          { confidenceSet && <span><i
              className="fa fa-handshake"></i> :&nbsp; { confidence }<br/></span> }
        </p>
      </div>
    </div>
  )
}
