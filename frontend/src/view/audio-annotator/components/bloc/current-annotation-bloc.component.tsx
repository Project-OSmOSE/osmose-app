import React, { Fragment } from "react";
import { useAnnotatorService } from "../../../../services/annotator/annotator.service.tsx";
import { formatTimestamp } from "../../../../services/annotator/format/format.util.tsx";


export const CurrentAnnotationBloc: React.FC = () => {
  const { context } = useAnnotatorService();

  if (!context.task) return <Fragment/>;
  
  if (!context.annotations.focus) return (
    <div className="card mr-2  selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body">
        <p className="card-text text-center">-</p>
      </div>
    </div>
  )


  let max_time = "00:00.000";
  if (context.annotations.focus?.endTime === -1) {
    const timeInSeconds = (context.task.boundaries.endTime.getTime() - context.task.boundaries.startTime.getTime()) / 1000
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
          { context.annotations.focus.startTime === -1 ? "00:00.000" : formatTimestamp(context.annotations.focus.startTime) }&nbsp;&gt;&nbsp;
          { context.annotations.focus.endTime === -1 ? max_time : formatTimestamp(context.annotations.focus.endTime) }<br/>
          <i className="fa fa-arrow-up"></i> :&nbsp;
          { context.annotations.focus.startFrequency === -1 ? context.task.boundaries.startFrequency : context.annotations.focus.startFrequency.toFixed(2) }&nbsp;&gt;&nbsp;
          { context.annotations.focus.endFrequency === -1 ? context.task.boundaries.endFrequency : context.annotations.focus.endFrequency.toFixed(2) } Hz<br/>
          <i className="fa fa-tag"></i> :&nbsp;{ context.annotations.focus.annotation ? context.annotations.focus.annotation : "None" }<br/>
          { context.task.confidenceIndicatorSet && <span><i className="fa fa-handshake"></i> :&nbsp; { context.annotations.focus.confidenceIndicator ?? "None" }<br/></span> }
        </p>
      </div>
    </div>
  )
}