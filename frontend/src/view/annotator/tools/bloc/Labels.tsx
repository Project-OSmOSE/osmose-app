import React, { Fragment, MouseEvent, ReactElement, useCallback, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import {
  addPresenceResult,
  AnnotatorSlice,
  focusLabel,
  focusTask,
  getPresenceLabels,
  removePresence
} from '@/service/annotator';
import { IonChip, IonIcon } from '@ionic/react';
import { checkmarkOutline, closeCircle, eyeOffOutline, eyeOutline } from 'ionicons/icons';
import styles from './bloc.module.scss';
import { useAlert } from "@/service/ui";
import { KEY_DOWN_EVENT } from "@/service/events";
import { AlphanumericKeys } from "@/consts/shorcuts.const.tsx";
import { Button, Kbd, TooltipOverlay } from "@/components/ui";
import { useGetLabelSetForCurrentCampaign } from "@/service/api/label-set.ts";
import { LabelSet } from "@/service/types";


export const Labels: React.FC = () => {
  const { labelSet } = useGetLabelSetForCurrentCampaign();

  const {
    results,
    focusedLabel,
    ui
  } = useAppSelector(state => state.annotator);
  const presenceLabels = useMemo(() => getPresenceLabels(results), [ results ])
  const dispatch = useAppDispatch()

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

  const _labelSet = useRef<LabelSet | undefined>(labelSet);
  useEffect(() => {
    _labelSet.current = labelSet;
  }, [ labelSet ]);


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

  const showAll = useCallback(() => {
    dispatch(AnnotatorSlice.actions.showAllLabels())
  }, [])

  // 'label' class is for playwright tests
  return (
    <div className={ [ styles.bloc, styles.labels, 'label' ].join(' ') }>
      <h6 className={ styles.header }>
        Labels
        { ui.hiddenLabels.length > 0 && <Button onClick={ showAll }
                                                fill="clear"
                                                className={ styles.showButton }>Show all</Button> }
      </h6>
      <div className={ styles.body }>
        { labelSet?.labels.map((label, key) => <LabelItem label={ label } key={ key } index={ key }/>) }
      </div>
    </div>
  )
}

export const LabelItem: React.FC<{ label: string, index: number }> = ({ label, index }) => {
  const { labelSet } = useGetLabelSetForCurrentCampaign();
  const {
    results,
    focusedLabel,
    ui
  } = useAppSelector(state => state.annotator);
  const isUsed = useMemo(() => getPresenceLabels(results).includes(label), [ results, label ])
  const isHidden = useMemo(() => ui.hiddenLabels.includes(label), [ ui.hiddenLabels, label ])
  const color = useMemo(() => (index % 10).toString(), [ index ])
  const buttonColor = useMemo(() => focusedLabel === label ? undefined : color, [ color, focusedLabel, label ])
  const dispatch = useAppDispatch()
  const alert = useAlert();

  const select = useCallback(() => {
    if (isUsed) {
      dispatch(focusLabel(label));
    } else {
      dispatch(addPresenceResult(label));
      dispatch(focusLabel(label));
    }
  }, [ label ])

  const hideAllButCurrent = useCallback(() => {
    dispatch(AnnotatorSlice.actions.hideLabels(labelSet?.labels ?? []));
    dispatch(AnnotatorSlice.actions.showLabel(label));
  }, [ label, labelSet ])

  const show = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    if (event.ctrlKey) hideAllButCurrent()
    else dispatch(AnnotatorSlice.actions.showLabel(label));
  }, [ label, hideAllButCurrent ])

  const hide = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    if (event.ctrlKey) hideAllButCurrent()
    else dispatch(AnnotatorSlice.actions.hideLabel(label));
  }, [ label, hideAllButCurrent ])

  const remove = useCallback((event: MouseEvent) => {
    event.stopPropagation();
    if (!isUsed || !results) return;
    // if annotations exists with this label: wait for confirmation
    alert.showAlert({
      type: 'Warning',
      message: `You are about to remove ${ results.filter(r => r.label === label).length } annotations using "${ label }" label. Are you sure?`,
      actions: [ {
        label: `Remove "${ label }" annotations`,
        callback: () => dispatch(removePresence(label))
      } ]
    })
  }, [ label, isUsed, results ])

  return (
    <IonChip outline={ !isUsed }
             className={ focusedLabel === label ? styles.activeLabel : '' }
             onClick={ select }
             color={ color }>
      { focusedLabel === label && <IonIcon src={ checkmarkOutline }/> }
      <LabelTooltipOverlay id={ index }><p>{ label }</p></LabelTooltipOverlay>

      { isUsed && <div className={ styles.labelButtons }>
          <TooltipOverlay
              tooltipContent={ <Fragment>
                <p>{ isHidden ? 'Show' : 'Hide' } corresponding annotations on spectrogram</p>
                <p>Press <Kbd keys={ 'ctrl' }/> to show only this labels annotations</p>
              </Fragment> }>
            { isHidden ?
              <IonIcon icon={ eyeOffOutline } onClick={ show } color={ buttonColor }/> :
              <IonIcon icon={ eyeOutline } onClick={ hide } color={ buttonColor }/> }
          </TooltipOverlay>

          <TooltipOverlay
              tooltipContent={ <p>Remove corresponding annotations</p> }>
              <IonIcon icon={ closeCircle } onClick={ remove } color={ buttonColor }/>
          </TooltipOverlay>
      </div> }
    </IonChip>
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
                                                                         className={ `ion-color-${ id }` }/> : Choose
                        this
                        label
                      </p>
                    </Fragment> }/>
  )
}
