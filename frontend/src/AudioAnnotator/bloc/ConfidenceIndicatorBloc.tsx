import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { ConfidenceIndicatorSet } from "../AudioAnnotator.tsx";

interface Props {
  set: ConfidenceIndicatorSet,
  currentIndicator: string,
  onIndicatorSelected: (indicator: string) => void
}

export const ConfidenceIndicatorBloc: React.FC<Props> = ({set, currentIndicator, onIndicatorSelected}) => {
  const tooltip = (
    <div className="card w-50">
      <h3 className={ `card-header p-2 tooltip-header` }>Description</h3>
      <div className="card-body p-1">
        <p>{ set.desc }</p>
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
              { set.confidenceIndicators.map((indicator, key) => (
                <li key={ `tag-${ key.toString() }` }>
                  <button
                    id={ `tags_key_shortcuts_${ key.toString() }` }
                    className={ currentIndicator === indicator.label ? "btn btn--active" : "btn" }
                    onClick={ () => onIndicatorSelected(indicator.label) }
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