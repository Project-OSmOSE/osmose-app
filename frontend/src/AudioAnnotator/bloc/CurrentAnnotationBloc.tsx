import React from "react";
import * as utils from "../../utils.tsx";
import { Annotation, TaskBoundaries } from "../AudioAnnotator.tsx";

interface Props {
  annotation: Annotation | undefined,
  taskBoundaries: TaskBoundaries,
  hasConfidence: boolean
}

export const CurrentAnnotationBloc: React.FC<Props> = ({
                                                         annotation,
                                                         taskBoundaries,
                                                         hasConfidence
                                                       }) => {

  if (!annotation) return (
    <div className="card mr-2  selected_annotation mini-content">
      <h6 className="card-header text-center">Selected annotation</h6>
      <div className="card-body">
        <p className="card-text text-center">-</p>
      </div>
    </div>
  )


  let max_time = "00:00.000";
  if (annotation?.endTime === -1) {
    const timeInSeconds = (Date.parse(taskBoundaries.endTime) - Date.parse(taskBoundaries.startTime)) / 1000
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
          { annotation.startTime === -1 ? "00:00.000" : utils.formatTimestamp(annotation.startTime) }&nbsp;&gt;&nbsp;
          { annotation.endTime === -1 ? max_time : utils.formatTimestamp(annotation.endTime) }<br/>
          <i className="fa fa-arrow-up"></i> :&nbsp;
          { annotation.startFrequency === -1 ? taskBoundaries.startFrequency : annotation.startFrequency.toFixed(2) }&nbsp;&gt;&nbsp;
          { annotation.endFrequency === -1 ? taskBoundaries.endFrequency : annotation.endFrequency.toFixed(2) } Hz<br/>
          <i className="fa fa-tag"></i> :&nbsp;{ annotation.annotation ? annotation.annotation : "None" }<br/>
          { hasConfidence && <span><i className="fa fa-handshake"></i> :&nbsp; { annotation.confidenceIndicator ?? "None" }<br/></span> }
        </p>
      </div>
    </div>
  )
}