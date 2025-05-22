import React from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { IonChip, IonIcon } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";
import styles from './bloc.module.scss';
import { TooltipOverlay } from "@/components/ui";
import { useGetConfidenceSetForCurrentCampaign } from "@/service/api/confidence-set.ts";
import { AnnotatorSlice } from "@/service/slices/annotator.ts";


export const ConfidenceIndicator: React.FC = () => {
  const { confidenceSet } = useGetConfidenceSetForCurrentCampaign();

  const dispatch = useAppDispatch();
  const {
    focusedConfidenceLabel,
  } = useAppSelector(state => state.annotator)

  if (!confidenceSet) return <div/>;

  return (
    <TooltipOverlay title='Description' tooltipContent={ <p>{ confidenceSet.desc }</p> }>
      <div className={ [ styles.bloc, styles.confidence ].join(' ') }>
        <h6 className={ styles.header }>Confidence indicator</h6>
        <div className={ [ styles.body, styles.center ].join(' ') }>
          { confidenceSet.confidence_indicators.map((confidence, key) => (
            <IonChip key={ key } color="primary"
                     onClick={ () => dispatch(AnnotatorSlice.actions.focusConfidence(confidence.label)) }
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
