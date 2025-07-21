import React, { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { IonChip, IonIcon } from "@ionic/react";
import { checkmarkOutline } from "ionicons/icons";
import styles from './bloc.module.scss';
import { TooltipOverlay } from "@/components/ui";
import { useGetConfidenceSetForCurrentCampaign } from "@/service/api/confidence-set.ts";
import { AnnotatorSlice } from "@/service/slices/annotator.ts";
import { ConfidenceIndicator as Confidence } from "@/service/types";


export const ConfidenceIndicator: React.FC = () => {
  const { confidenceSet } = useGetConfidenceSetForCurrentCampaign();

  if (!confidenceSet) return <div/>;

  return (
    <TooltipOverlay title='Description' tooltipContent={ <p>{ confidenceSet.desc }</p> }>
      <div className={ [ styles.bloc, styles.confidence ].join(' ') }>
        <h6 className={ styles.header }>Confidence indicator</h6>
        <div className={ [ styles.body, styles.center ].join(' ') }>
          { confidenceSet.confidence_indicators.map((confidence, key) => (
            <Indicator key={ key } indicator={ confidence }/>
          )) }
        </div>
      </div>
    </TooltipOverlay>
  )
}

const Indicator: React.FC<{ indicator: Confidence }> = ({ indicator }) => {


  const dispatch = useAppDispatch();
  const {
    focusedConfidenceLabel,
  } = useAppSelector(state => state.annotator)

  const [ active, setActive ] = useState<boolean>(focusedConfidenceLabel === indicator.label);
  useEffect(() => {
    setActive(focusedConfidenceLabel === indicator.label)
  }, [ focusedConfidenceLabel ]);

  const onClick = useCallback(() => {
    dispatch(AnnotatorSlice.actions.focusConfidence(indicator.label))
  }, [ indicator ])

  return <IonChip color="primary"
                  onClick={ onClick }
                  className={ active ? styles.active : 'void' }> {/* 'void' className need to be sure the className change when item is not active anymore */ }
    { indicator.label }
    { active && <IonIcon src={ checkmarkOutline } color="light"/> }
  </IonChip>
}
