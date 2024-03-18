import React, { Fragment } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { selectConfidence } from "@/slices/annotator/annotations.ts";


export const ConfidenceIndicatorBloc: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    focusedConfidence,
    confidenceDescription,
    allConfidences
  } = useAppSelector(state => state.annotator.annotations)

  if (!focusedConfidence) return <Fragment/>;

  const tooltip = (
    <div className="card">
      <h3 className={ `card-header p-2 tooltip-header` }>Description</h3>
      <div className="card-body p-1">
        <p>{ confidenceDescription }</p>
      </div>
    </div>
  )

  return (
    <OverlayTrigger overlay={ <Tooltip>{ tooltip }</Tooltip> } placement="top">
      <div className="card">
        <h6 className="card-header text-center">Confidence indicator</h6>
        <div className="card-body">
          <div className=" d-flex justify-content-center">
            <ul className="card-text annotation-tags">
              { allConfidences.map((confidence, key) => (
                <li key={ `tag-${ key }` }>
                  <button id={ `tags_key_shortcuts_${ key }` }
                          className={ focusedConfidence === confidence ? "btn btn--active" : "btn" }
                          onClick={ () => dispatch(selectConfidence(confidence)) }
                          type="button">
                    { confidence }
                  </button>
                </li>
              )) }
            </ul>
          </div>
        </div>
      </div>
    </OverlayTrigger>
  )
}
