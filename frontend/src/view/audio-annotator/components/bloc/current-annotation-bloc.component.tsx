import React, { useContext } from "react";
import { formatTimestamp } from "../../../../services/annotator/format/format.util.tsx";
import { AnnotationsContext } from "../../../../services/annotator/annotations/annotations.context.tsx";


export const CurrentAnnotationBloc: React.FC = () => {

  const context = useContext(AnnotationsContext);

  if (!context.focusedResult) return (
    <div className="card mr-2  selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body">
        <p className="card-text text-center">-</p>
      </div>
    </div>
  )

  let max_time = "00:00.000";
  if (context.focusedResult?.endTime === -1) {
    const timeInSeconds = (context.wholeFileBoundaries.endTime.getTime() - context.wholeFileBoundaries.startTime.getTime()) / 1000
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds - minutes * 60;
    max_time = `${ minutes.toFixed().padStart(2, "0") }:${ seconds.toFixed().padStart(2, "0") }:000`;
  }

  return (
    <div className="card mr-2 selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body d-flex justify-content-between">
        <p className="card-text">
          <i className="fa fa-clock"></i> :&nbsp;
          { context.focusedResult.startTime === -1 ? "00:00.000" : formatTimestamp(context.focusedResult.startTime) }&nbsp;&gt;&nbsp;
          { context.focusedResult.endTime === -1 ? max_time : formatTimestamp(context.focusedResult.endTime) }<br/>
          <i className="fa fa-arrow-up"></i> :&nbsp;
          { context.focusedResult.startFrequency === -1 ? context.wholeFileBoundaries.startFrequency : context.focusedResult.startFrequency.toFixed(2) }&nbsp;&gt;&nbsp;
          { context.focusedResult.endFrequency === -1 ? context.wholeFileBoundaries.endFrequency : context.focusedResult.endFrequency.toFixed(2) } Hz<br/>
          <i
            className="fa fa-tag"></i> :&nbsp;{ context.focusedResult.annotation ? context.focusedResult.annotation : "None" }<br/>
          { context.focusedResult.confidenceIndicator && <span><i
              className="fa fa-handshake"></i> :&nbsp; { context.focusedResult.confidenceIndicator }<br/></span> }
        </p>
      </div>
    </div>
  )
}