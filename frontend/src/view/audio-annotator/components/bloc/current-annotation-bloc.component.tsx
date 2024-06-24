import React from "react";
import { formatTimestamp } from "@/services/utils/format.tsx";
import { useAppSelector } from "@/slices/app";


export const CurrentAnnotationBloc: React.FC = () => {

  const {
    focusedResult,
    wholeFileBoundaries
  } = useAppSelector(state => state.annotator.annotations);

  if (!focusedResult) return (
    <div className="card mr-2  selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body">
        <p className="card-text text-center">-</p>
      </div>
    </div>
  )

  let max_time = "00:00.000";
  if (focusedResult?.endTime === -1) {
    const minutes = Math.floor(wholeFileBoundaries.duration / 60);
    const seconds = wholeFileBoundaries.duration - minutes * 60;
    max_time = `${ minutes.toFixed().padStart(2, "0") }:${ seconds.toFixed().padStart(2, "0") }:000`;
  }

  return (
    <div className="card mr-2 selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body d-flex justify-content-between">
        <p className="card-text">
          <i className="fa fa-clock"></i> :&nbsp;
          { focusedResult.startTime === -1 ? "00:00.000" : formatTimestamp(focusedResult.startTime) }&nbsp;&gt;&nbsp;
          { focusedResult.endTime === -1 ? max_time : formatTimestamp(focusedResult.endTime) }<br/>
          <i className="fa fa-arrow-up"></i> :&nbsp;
          { focusedResult.startFrequency === -1 ? wholeFileBoundaries.startFrequency : focusedResult.startFrequency.toFixed(2) }&nbsp;&gt;&nbsp;
          { focusedResult.endFrequency === -1 ? wholeFileBoundaries.endFrequency : focusedResult.endFrequency.toFixed(2) } Hz<br/>
          <i
            className="fa fa-tag"></i> :&nbsp;{ focusedResult.label ? focusedResult.label : "None" }<br/>
          { focusedResult.confidenceIndicator && <span><i
              className="fa fa-handshake"></i> :&nbsp; { focusedResult.confidenceIndicator }<br/></span> }
        </p>
      </div>
    </div>
  )
}
