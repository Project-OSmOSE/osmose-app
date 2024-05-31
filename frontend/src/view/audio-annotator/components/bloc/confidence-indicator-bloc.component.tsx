import React, { Fragment, useContext } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import {
  AnnotationsContext,
  AnnotationsContextDispatch,
} from "../../../../services/annotator/annotations/annotations.context.tsx";
import { IonChip, IonIcon } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";


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
        <div className="card-body d-flex justify-content-center p-0 pb-2 pt-2">
            { context.allConfidences.map((confidence, key) => (
              <IonChip key={ key }
                       color="primary"
                       onClick={ () => dispatch!({ type: 'selectConfidence', confidence }) }
                       className={ context.focusedConfidence === confidence ? 'active m-2' : 'm-2' }>
                { confidence }
                { context.focusedConfidence === confidence && <IonIcon src={ checkmarkOutline } color="light"/> }
              </IonChip>
            )) }
        </div>
      </div>
    </OverlayTrigger>
  )
}
