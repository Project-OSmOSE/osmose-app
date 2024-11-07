import React, { Fragment } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { IonChip, IonIcon } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";
import { AnnotationActions } from "@/slices/annotator/annotations.ts";


export const ConfidenceIndicatorBloc: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    focusedConfidence,
    confidenceSet,
  } = useAppSelector(state => state.annotator.annotations)

  if (!focusedConfidence) return <Fragment/>;

  const tooltip = (
    <div className="card">
      <h3 className={ `card-header p-2 tooltip-header` }>Description</h3>
      <div className="card-body p-1">
        <p>{ confidenceSet?.desc }</p>
      </div>
    </div>
  )

  return (
    <OverlayTrigger overlay={ <Tooltip>{ tooltip }</Tooltip> } placement="top">
      <div className="card">
        <h6 className="card-header text-center">Confidence indicator</h6>
        <div className="card-body d-flex justify-content-center p-0 pb-2 pt-2">
            { confidenceSet?.confidence_indicators.map((confidence, key) => (
              <IonChip key={ key }
                       color="primary"
                       onClick={ () => dispatch(AnnotationActions.selectConfidence(confidence.label)) }
                       className={ focusedConfidence === confidence.label ? 'active m-2' : 'm-2' }>
                  { confidence.label }
                { focusedConfidence === confidence.label && <IonIcon src={ checkmarkOutline } color="light"/> }
              </IonChip>
            )) }
        </div>
      </div>
    </OverlayTrigger>
  )
}
