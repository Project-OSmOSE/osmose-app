import React, { useImperativeHandle, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/service/app.ts';
import {
  addPresenceResult,
  disableShortcuts,
  enableShortcuts,
  focusLabel,
  getPresenceLabels,
  removePresence,
  useRetrieveAnnotatorQuery
} from '@/service/annotator';
import styles from './bloc.module.scss';
import { KeypressHandler } from "@/view/audio-annotator/audio-annotator.page.tsx";
import { AlphanumericKeys } from "@/consts/shorcuts.const.tsx";
import { useParams } from "react-router-dom";
import { IonChip, IonIcon, useIonAlert } from "@ionic/react";
import { closeCircle } from "ionicons/icons";
import { LabelTooltipOverlay } from "@/view/annotator/tools/bloc/LabelTooltipOverlay.tsx";

export const PresenceAbsence = React.forwardRef<KeypressHandler, any>((_, ref) => {
  const params = useParams<{ campaignID: string, fileID: string }>();

  const {
    ui,
    results,
    focusedLabel,
  } = useAppSelector(state => state.annotator);
  const { data } = useRetrieveAnnotatorQuery(params)
  const dispatch = useAppDispatch()
  const [ presentAlert ] = useIonAlert();

  const presenceLabels = useMemo(() => getPresenceLabels(results), [ results ]);

  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!ui.areShortcutsEnabled || !data) return;
    const active_alphanumeric_keys = AlphanumericKeys[0].slice(0, data?.label_set.labels.length);

    if (event.key === "'") {
      event.preventDefault();
    }

    for (const i in active_alphanumeric_keys) {
      if (event.key !== AlphanumericKeys[0][i] && event.key !== AlphanumericKeys[1][i]) continue;

      const calledLabel = data.label_set.labels[i];
      if (presenceLabels.includes(calledLabel) && focusedLabel !== calledLabel) {
        dispatch(focusLabel(calledLabel))
      } else toggle(calledLabel);
    }
  }

  useImperativeHandle(ref,
    () => ({ handleKeyPressed }),
    [ ui.areShortcutsEnabled, data?.label_set.labels ]
  );

  const toggle = async (label: string) => {
    if (presenceLabels.includes(label)) {
      // Remove presence
      if (results?.find(a => a.label === label)) {
        // if annotations exists with this label: wait for confirmation
        dispatch(disableShortcuts())
        await presentAlert({
          message: `You are about to remove ${ results.filter(r => r.label === label).length } annotations using "${ label }" label. Are you sure?`,
          cssClass: 'danger-confirm-alert',
          buttons: [
            'Cancel',
            {
              text: `Remove "${ label }" annotations`,
              cssClass: 'ion-color-danger',
              handler: () => dispatch(removePresence(label))
            }
          ]
        })
        dispatch(enableShortcuts())
      }
    } else {
      // Add presence
      dispatch(addPresenceResult(label));
    }
  }

  return (
    <div className={ styles.bloc }>
      <h6 className={ styles.header }>Presence / Absence</h6>
      <div className={ styles.body }>
        { data?.label_set.labels.map((label, key) => {
          const color = (key % 10).toString();
          return (
            <LabelTooltipOverlay id={ key } key={ key }>
              <IonChip outline={ !presenceLabels.includes(label) }
                       onClick={ () => toggle(label) }
                       color={ color }>
                { label }
                { presenceLabels.includes(label) && <IonIcon icon={ closeCircle } color={ color }/> }
              </IonChip>
            </LabelTooltipOverlay>
          )
        }) }
      </div>
    </div>
  )
})
