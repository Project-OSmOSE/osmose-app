import React, { Fragment, MouseEvent, ReactElement, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { addPresenceResult, focusLabel, focusTask, getPresenceLabels, removePresence } from '@/service/annotator';
import { IonChip, IonIcon } from '@ionic/react';
import { checkmarkOutline, closeCircle } from 'ionicons/icons';
import styles from './bloc.module.scss';
import { useAnnotator } from "@/service/annotator/hook.ts";
import { useAlert } from "@/service/ui";
import { KEY_DOWN_EVENT } from "@/service/events";
import { AlphanumericKeys } from "@/consts/shorcuts.const.tsx";
import { LabelSet } from "@/service/campaign/label-set";
import { Kbd, TooltipOverlay } from "@/components/ui";


export const Labels: React.FC = () => {
  const {
    label_set,
  } = useAnnotator();

  const {
    results,
    focusedLabel,
  } = useAppSelector(state => state.annotator);
  const presenceLabels = useMemo(() => getPresenceLabels(results), [ results ])
  const dispatch = useAppDispatch()
  const alert = useAlert();

  useEffect(() => {
    KEY_DOWN_EVENT.add(onKbdEvent);
    return () => {
      KEY_DOWN_EVENT.remove(onKbdEvent);
    }
  }, []);
  const _focused = useRef<string | undefined>(focusedLabel);
  useEffect(() => {
    _focused.current = focusedLabel;
  }, [ focusedLabel ]);

  const _labelSet = useRef<LabelSet | undefined>(label_set);
  useEffect(() => {
    _labelSet.current = label_set;
  }, [ label_set ]);


  const _presenceLabels = useRef<string[]>(presenceLabels);
  useEffect(() => {
    _presenceLabels.current = presenceLabels;
  }, [ presenceLabels ]);

  function onKbdEvent(event: KeyboardEvent) {
    if (!_labelSet.current) return;
    const active_alphanumeric_keys = AlphanumericKeys[0].slice(0, _labelSet.current.labels.length);

    if (event.key === "'") {
      event.preventDefault();
    }

    for (const i in active_alphanumeric_keys) {
      if (event.key !== AlphanumericKeys[0][i] && event.key !== AlphanumericKeys[1][i]) continue;

      const calledLabel = _labelSet.current.labels[i];
      if (_focused.current === calledLabel) continue;
      if (!_presenceLabels.current.includes(calledLabel)) {
        dispatch(addPresenceResult(calledLabel));
      } else {
        dispatch(focusTask())
        dispatch(focusLabel(calledLabel))
      }
    }
  }

  function selectLabel(label: string) {
    if (presenceLabels.includes(label)) {
      dispatch(focusLabel(label));
    } else {
      dispatch(addPresenceResult(label));
      dispatch(focusLabel(label));
    }
  }

  async function removeLabel(event: MouseEvent, label: string) {
    event.stopPropagation();
    if (!presenceLabels.includes(label) || !results) return;
    // if annotations exists with this label: wait for confirmation
    alert.showAlert({
      type: 'Warning',
      message: `You are about to remove ${ results.filter(r => r.label === label).length } annotations using "${ label }" label. Are you sure?`,
      actions: [{
        label: `Remove "${ label }" annotations`,
        callback: () => dispatch(removePresence(label))
      }]
    })
  }

  // 'label' class is for playwright tests
  return (
    <div className={ [ styles.bloc, styles.labels, 'label' ].join(' ') }>
      <h6 className={ styles.header }>Labels</h6>
      <div className={ styles.body }>
        { label_set?.labels.map((label, key) => {
          const color = (key % 10).toString();
          return (
            <LabelTooltipOverlay id={ key } key={ key }>
              <IonChip outline={ !presenceLabels.includes(label) }
                       className={ focusedLabel === label ? styles.activeLabel : '' }
                       onClick={ () => selectLabel(label) }
                       color={ color }>
                { focusedLabel === label && <IonIcon src={ checkmarkOutline }/> }
                { label }
                { presenceLabels.includes(label) &&
                    <IonIcon icon={ closeCircle } onClick={ e => removeLabel(e, label) }
                             color={ focusedLabel === label ? undefined : color }/> }
              </IonChip>
            </LabelTooltipOverlay>
          )
        }) }
      </div>
    </div>
  )
}

export const LabelTooltipOverlay: React.FC<{ id: number, children: ReactElement }> = ({ id, children }) => {
  const number = AlphanumericKeys[1][id];
  const key = AlphanumericKeys[0][id];
  if (id >= 9) return children;
  return (
    <TooltipOverlay title='Shortcut'
                    children={ children }
                    tooltipContent={ <Fragment>
                      <p>
                        <Kbd keys={ number }
                             className={ `ion-color-${ id }` }/> or <Kbd keys={ key }
                                                                         className={ `ion-color-${ id }` }/> : Choose this
                        label
                      </p>
                    </Fragment> }/>
  )
}
