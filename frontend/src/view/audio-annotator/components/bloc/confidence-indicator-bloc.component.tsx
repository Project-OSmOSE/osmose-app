import React, { Fragment } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { selectConfidence } from "@/slices/annotator/annotations.ts";
import { IonChip, IonIcon } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";


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
        <div className="card-body d-flex justify-content-center p-0 pb-2 pt-2">
            { allConfidences.map((confidence, key) => (
              <IonChip key={ key }
                       color="primary"
                       onClick={ () => dispatch(selectConfidence(confidence)) }
                       className={ focusedConfidence === confidence ? 'active m-2' : 'm-2' }>
                  { confidence }
                { focusedConfidence === confidence && <IonIcon src={ checkmarkOutline } color="light"/> }
              </IonChip>
            )) }
        </div>
      </div>
    </OverlayTrigger>
  )
}
