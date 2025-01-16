import React, { useMemo } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { COLORS } from "@/consts/colors.const.tsx";
import Tooltip from "react-bootstrap/Tooltip";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { focusLabel, getPresenceLabels, useRetrieveAnnotatorQuery } from '@/service/annotator';
import { IonChip, IonIcon } from '@ionic/react';
import { checkmarkOutline } from 'ionicons/icons';
import { useParams } from "react-router-dom";
import styles from './bloc.module.scss';
import { TooltipComponent } from "@/view/audio-annotator/components/tooltip.component.tsx";


export const LabelList: React.FC = () => {
  const params = useParams<{ campaignID: string, fileID: string }>();

  const {
    results,
    focusedLabel
  } = useAppSelector(state => state.annotator);
  const { data } = useRetrieveAnnotatorQuery(params)
  const presenceLabels = useMemo(() => getPresenceLabels(results), [ results ])
  const dispatch = useAppDispatch()

  return (
    <div className={ styles.bloc }>
      <h6 className={ styles.header }>Labels list</h6>
      <div className={ styles.body }>
        { data?.label_set.labels.map((label, key) => {
          const color = (data?.label_set.labels.indexOf(label) % 10).toString();
          const style = {
            inactive: {
              '--background': '#f6f6f6',
              '--color': COLORS[+color],
            },
            disabled: {
              '--background': 'transparent',
              '--color': '#aaa',
            },
            active: {
              '--background': COLORS[+color],
              '--color': 'white',
            },
          };
          return (
            <OverlayTrigger
              overlay={ <Tooltip hidden={ !presenceLabels.includes(label) }><TooltipComponent id={ key }/></Tooltip> }
              key={ key } placement="top">
              <IonChip
                style={ focusedLabel === label ? style.active : presenceLabels.includes(label) ? style.inactive : style.disabled }
                onClick={ () => dispatch(focusLabel(label)) }
                disabled={ !presenceLabels.includes(label) }>
                { label }
                { focusedLabel === label && <IonIcon src={ checkmarkOutline } color="light"/> }
              </IonChip>
            </OverlayTrigger>
          )
        }) }
      </div>
    </div>
  )
}
