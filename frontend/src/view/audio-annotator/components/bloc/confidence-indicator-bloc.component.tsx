import React, { Fragment, useContext } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {
  AnnotationsContext,
  AnnotationsContextDispatch,
} from "../../../../services/annotator/annotations/annotations.context.tsx";


export const ConfidenceIndicatorBloc: React.FC = () => {

  const context = useContext(AnnotationsContext);
  const dispatch = useContext(AnnotationsContextDispatch);

  if (!context.focusedConfidence) return <Fragment/>;

  const tooltip = (
    <div className="card">
      <h3 className={ `card-header p-2 tooltip-header` }>Description</h3>
      <div className="card-body p-1">
        <p>{ context.confidenceDescription }</p>
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
              { context.allConfidences.map((confidence, key) => (
                <li key={ `tag-${ key }` }>
                  <button id={ `tags_key_shortcuts_${ key }` }
                          className={ context.focusedConfidence === confidence ? "btn btn--active" : "btn" }
                          onClick={ () => dispatch!({ type: 'selectConfidence', confidence}) }
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