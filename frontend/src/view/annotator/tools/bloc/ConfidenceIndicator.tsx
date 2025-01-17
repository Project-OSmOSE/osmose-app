import React from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { IonChip, IonIcon } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";
import { focusConfidence, useRetrieveAnnotatorQuery } from '@/service/annotator';
import { useParams } from "react-router-dom";
import styles from './bloc.module.scss';
import { TooltipOverlay } from "@/components/ui";


export const ConfidenceIndicator: React.FC = () => {
  const params = useParams<{ campaignID: string, fileID: string }>();

  const dispatch = useAppDispatch();
  const {
    focusedConfidenceLabel,
  } = useAppSelector(state => state.annotator)
  const { data } = useRetrieveAnnotatorQuery(params)

  if (!data?.confidence_set) return <div/>;

  return (
    <TooltipOverlay title='Description' tooltipContent={ <p>{ data.confidence_set.desc }</p> }>
      <div className={ styles.bloc }>
        <h6 className={ styles.header }>Confidence indicator</h6>
        <div className={ [styles.body, styles.center].join(' ') }>
          { data.confidence_set.confidence_indicators.map((confidence, key) => (
            <IonChip key={ key } color="primary"
                     onClick={ () => dispatch(focusConfidence(confidence.label)) }
                     className={ focusedConfidenceLabel === confidence.label ? styles.active : '' }>
              { confidence.label }
              { focusedConfidenceLabel === confidence.label && <IonIcon src={ checkmarkOutline } color="light"/> }
            </IonChip>
          )) }
        </div>
      </div>
    </TooltipOverlay>
  )
}
