import React from "react";
import { useAnnotationService } from "../../services/annotator/annotation";
import { useTaskService } from "../../services/annotator/task";
import { formatTimestamp } from "../../services/annotator/format/format.util.tsx";

export const CurrentAnnotationBloc: React.FC = () => {
  const { context: annotationCtx } = useAnnotationService();
  const { context: taskCtx } = useTaskService();


  if (!annotationCtx.focused || !taskCtx.currentTask) return (
    <div className="card mr-2  selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body">
        <p className="card-text text-center">-</p>
      </div>
    </div>
  )


  let max_time = "00:00.000";
  if (annotationCtx.focused?.endTime === -1) {
    const timeInSeconds = (taskCtx.currentTask.boundaries.endTime.getTime() - taskCtx.currentTask.boundaries.startTime.getTime()) / 1000
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
          { annotationCtx.focused.startTime === -1 ? "00:00.000" : formatTimestamp(annotationCtx.focused.startTime) }&nbsp;&gt;&nbsp;
          { annotationCtx.focused.endTime === -1 ? max_time : formatTimestamp(annotationCtx.focused.endTime) }<br/>
          <i className="fa fa-arrow-up"></i> :&nbsp;
          { annotationCtx.focused.startFrequency === -1 ? taskCtx.currentTask.boundaries.startFrequency : annotationCtx.focused.startFrequency.toFixed(2) }&nbsp;&gt;&nbsp;
          { annotationCtx.focused.endFrequency === -1 ? taskCtx.currentTask.boundaries.endFrequency : annotationCtx.focused.endFrequency.toFixed(2) } Hz<br/>
          <i className="fa fa-tag"></i> :&nbsp;{ annotationCtx.focused.annotation ? annotationCtx.focused.annotation : "None" }<br/>
          { taskCtx.currentTask.confidenceIndicatorSet && <span><i className="fa fa-handshake"></i> :&nbsp; { annotationCtx.focused.confidenceIndicator ?? "None" }<br/></span> }
        </p>
      </div>
    </div>
  )
}