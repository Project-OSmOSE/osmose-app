import React, { Fragment } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useAnnotatorService } from "../../../../services/annotator/annotator.service.tsx";


export const ConfidenceIndicatorBloc: React.FC = () => {
  const { context, confidences } = useAnnotatorService();

  if (!context.task?.confidenceIndicatorSet || !context.confidences.focus) return <Fragment/>;

  const tooltip = (
    <div className="card w-50">
      <h3 className={ `card-header p-2 tooltip-header` }>Description</h3>
      <div className="card-body p-1">
        <p>{ context.task?.confidenceIndicatorSet?.desc }</p>
      </div>
    </div>
  )

  return (
    <OverlayTrigger overlay={ tooltip } placement="top">
      <div className="card">
        <h6 className="card-header text-center">Confidence indicator</h6>
        <div className="card-body">
          <div className=" d-flex justify-content-center">
            <ul className="card-text annotation-tags">
              { context.task?.confidenceIndicatorSet?.confidenceIndicators.map((indicator, key) => (
                <li key={ `tag-${ key.toString() }` }>
                  <button
                    id={ `tags_key_shortcuts_${ key.toString() }` }
                    className={ context.confidences.focus === indicator.label ? "btn btn--active" : "btn" }
                    onClick={ () => confidences.focus(indicator.label) }
                    type="button"
                  >{ indicator.label }</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </OverlayTrigger>
  )
}