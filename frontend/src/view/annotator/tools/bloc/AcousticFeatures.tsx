import React, { Fragment, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppDispatch } from '@/service/app.ts';
import { Table, TableContent, TableDivider, TableHead } from "@/components/ui";
import { Input, Select } from '@/components/form';
import { IonButton, IonCheckbox, IonIcon, IonNote } from '@ionic/react';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import styles from './bloc.module.scss';
import { createOutline } from 'ionicons/icons';
import { ExtendedDiv } from '@/components/ui/ExtendedDiv';
import { CLICK_EVENT } from '@/service/events';
import { usePointerService } from '@/service/annotator/spectrogram/pointer/';
import { useCurrentAnnotation } from '@/service/annotator/spectrogram';
import { SignalTrends } from '@/service/types';
import { Item } from '@/types/item.ts';
import { useXAxis } from '@/service/annotator/spectrogram/scale';
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { AnnotatorSlice } from "@/service/slices/annotator.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";

export const AcousticFeatures: React.FC = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  const { phase } = useRetrieveCurrentPhase()
  const { data } = useRetrieveAnnotator()
  const xAxis = useXAxis();

  const initialLeft = useMemo(() => window.innerWidth - 500, [])

  const [ top, setTop ] = useState<number>(128);
  const _top = useRef<number>(128);
  const [ left, setLeft ] = useState<number>(initialLeft);
  const _left = useRef<number>(initialLeft);

  useEffect(() => {
    setTop(_top.current)
  }, [ _top.current ]);
  useEffect(() => {
    setLeft(_left.current)
  }, [ _left.current ]);

  const dispatch = useAppDispatch();

  const { annotation, duration } = useCurrentAnnotation()

  useEffect(() => {
    if (!annotation?.end_time) return;
    const newLeft = xAxis.valueToPosition(annotation.end_time) + 80;
    _left.current = newLeft;
    setLeft(newLeft);
  }, [ annotation?.id ]);

  function setBad() {
    dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures(null));
  }

  function setGood() {
    if (annotation?.acoustic_features) return;
    dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures({}));
  }

  function updateMinFrequency(value: number) {
    if (annotation?.type !== 'Box' || !phase) return;
    if (data?.file) value = Math.min(value, data.file.dataset_sr)
    value = Math.max(value, 0)
    dispatch(AnnotatorSlice.actions.updateFocusResultBounds({
      newBounds: {
        type: annotation.type,
        start_frequency: value,
        end_frequency: Math.max(annotation.end_frequency ?? 0, value),
        start_time: annotation.start_time,
        end_time: annotation.end_time,
      },
      phase: phase.phase
    }))
  }

  function updateMaxFrequency(value: number) {
    if (annotation?.type !== 'Box' || !phase) return;
    if (data?.file) value = Math.min(value, data.file.dataset_sr)
    value = Math.max(value, 0)
    dispatch(AnnotatorSlice.actions.updateFocusResultBounds({
      newBounds: {
        type: annotation.type,
        start_frequency: Math.min(annotation.start_frequency ?? 0, value),
        end_frequency: value,
        start_time: annotation.start_time,
        end_time: annotation.end_time,
      },
      phase: phase.phase
    }))
  }

  function updateDuration(value: number) {
    if (annotation?.type !== 'Box' || !phase || !data?.file) return;
    if (duration) value = Math.min(value, data.file.duration)
    value = Math.max(value, 0)
    dispatch(AnnotatorSlice.actions.updateFocusResultBounds({
      newBounds: {
        type: annotation.type,
        start_frequency: annotation.start_frequency,
        end_frequency: annotation.end_frequency,
        start_time: annotation.start_time,
        end_time: annotation.start_time + value,
      },
      phase: phase.phase
    }))
  }

  function onTopMove(move: number) {
    setTop(prev => {
      _top.current = prev + move
      return prev + move
    })
  }

  function onLeftMove(move: number) {
    setLeft(prev => {
      _left.current = prev + move
      return prev + move
    })
  }

  if (!annotation) return;
  if (!campaign?.labels_with_acoustic_features.includes(annotation.label)) return;
  if (annotation.type !== 'Box') return;
  // @ts-expect-error: --left isn't recognized
  return <div style={ { top, '--left': `${ left }px` } }
              className={ [ styles.bloc, styles.features ].join(' ') }
              onMouseDown={ e => e.stopPropagation() }>
    <ExtendedDiv draggable={ true } onTopMove={ onTopMove } onLeftMove={ onLeftMove }
                 className={ styles.header }><h6>
      Acoustic features
      <IoRemoveCircleOutline onClick={ () => dispatch(AnnotatorSlice.actions.focusPresence(annotation.label)) }/>
    </h6></ExtendedDiv>
    <div className={ styles.body }>

      <div className={ styles.line }>
        <b>Quality</b>
        <div className={ styles.switch }>
          <div className={ !annotation?.acoustic_features ? styles.active : undefined }
               onClick={ setBad }>
            Bad
          </div>
          <div className={ annotation?.acoustic_features ? styles.active : undefined }
               onClick={ setGood }>
            Good
          </div>
        </div>
      </div>

      { annotation.acoustic_features && <Table columns={ 3 } className={ styles.table } size='small'>
          <TableHead isFirstColumn={ true } className={ styles.span2ColsStart }>Feature</TableHead>
          <TableHead>Value</TableHead>

        {/* Frequencies */ }
          <TableDivider/>
          <TableContent isFirstColumn={ true } className={ styles.frequencyCell }>Frequency</TableContent>

          <TableContent>Min</TableContent>
          <TableContent className={ styles.cell }>
              <Input value={ annotation.start_frequency } type="number"
                     min={ 0 } max={ data?.file.maxFrequency }
                     disabled={ phase?.phase === 'Verification' }
                     onChange={ e => updateMinFrequency(+e.currentTarget.value) }/>
              <IonNote>Hz</IonNote>
          </TableContent>

          <TableDivider className={ styles.span2ColsEnd }/>
          <TableContent>Max</TableContent>
          <TableContent className={ styles.cell }>
              <Input value={ annotation.end_frequency } type="number"
                     min={ 0 } max={ data?.file.maxFrequency }
                     disabled={ phase?.phase === 'Verification' }
                     onChange={ e => updateMaxFrequency(+e.currentTarget.value) }/>
              <IonNote>Hz</IonNote>
          </TableContent>

          <TableDivider className={ styles.span2ColsEnd }/>
          <TableContent>Range</TableContent>
          <TableContent><IonNote>{ annotation.end_frequency - annotation.start_frequency } Hz</IonNote></TableContent>

          <SelectableFrequencyRow label='Start'
                                  value={ annotation.acoustic_features.start_frequency ?? undefined }
                                  max={ data?.file.maxFrequency }
                                  onChange={ v => dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures({ start_frequency: v })) }/>

          <SelectableFrequencyRow label='End'
                                  value={ annotation.acoustic_features.end_frequency ?? undefined }
                                  max={ data?.file.maxFrequency }
                                  onChange={ v => dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures({ end_frequency: v })) }/>

        {/* Time */ }
          <TableDivider/>
          <TableContent isFirstColumn={ true } className={ styles.span2ColsStart }>Duration</TableContent>
          <TableContent className={ styles.cell }>
              <Input value={ duration } type="number"
                     step={ 0.001 }
                     min={ 0.01 } max={ data?.file?.duration ?? 0 }
                     disabled={ phase?.phase === 'Verification' }
                     onChange={ e => updateDuration(+e.currentTarget.value) }/>
              <IonNote>s</IonNote>
          </TableContent>

        {/* Trend */ }
          <TableDivider/>
          <TableContent isFirstColumn={ true } className={ styles.trendCell }>Trend</TableContent>

          <TableContent>General</TableContent>
          <TableContent>
              <Select options={ SignalTrends.map(value => ({ label: value, value } satisfies Item)) }
                      placeholder="Select a value"
                      optionsContainer="popover"
                      value={ annotation.acoustic_features?.trend ?? undefined }
                      onValueSelected={ item => dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures({ trend: (item as string) ?? null })) }/>
          </TableContent>

          <TableDivider className={ styles.span2ColsEnd }/>
          <TableContent>Relative min count</TableContent>
          <TableContent>
              <Input value={ annotation.acoustic_features?.relative_min_frequency_count ?? undefined }
                     type="number" min={ 0 } placeholder="0"
                     onChange={ e => dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures({ relative_min_frequency_count: +e.currentTarget.value })) }/>
          </TableContent>

          <TableDivider className={ styles.span2ColsEnd }/>
          <TableContent>Relative max count</TableContent>
          <TableContent>
              <Input value={ annotation.acoustic_features?.relative_max_frequency_count ?? undefined }
                     type="number" min={ 0 } placeholder="0"
                     onChange={ e => dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures({ relative_max_frequency_count: +e.currentTarget.value })) }/>
          </TableContent>

          <TableDivider className={ styles.span2ColsEnd }/>
          <TableContent>Inflection count</TableContent>
          <TableContent><IonNote>{ (annotation.acoustic_features?.relative_min_frequency_count ?? 0)
            + (annotation.acoustic_features?.relative_max_frequency_count ?? 0) }</IonNote></TableContent>

          <TableDivider className={ styles.span2ColsEnd }/>
          <TableContent>Steps count</TableContent>
          <TableContent>
              <Input value={ annotation.acoustic_features?.steps_count ?? undefined }
                     type="number" min={ 0 } placeholder="0"
                     onChange={ e => dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures({ steps_count: +e.currentTarget.value })) }/>
          </TableContent>


          <TableDivider className={ styles.span2ColsEnd }/>
          <TableContent>Has harmonics</TableContent>
          <TableContent>
              <IonCheckbox checked={ !!annotation.acoustic_features?.has_harmonics }
                           onClick={ e => dispatch(AnnotatorSlice.actions.updateCurrentResultAcousticFeatures({ has_harmonics: e.currentTarget.checked })) }/>
          </TableContent>

      </Table> }
    </div>
  </div>
}

const SelectableFrequencyRow: React.FC<{
  label: string;
  value: number | undefined;
  max: number | undefined;
  onChange: (value: number | undefined) => void;
}> = ({ label, value, max, onChange }) => {
  const [ isSelecting, setIsSelecting ] = useState<boolean>(false);
  const dispatch = useAppDispatch()

  const pointer = usePointerService()

  const select = useCallback(() => {
    setTimeout(() => CLICK_EVENT.add(onClick), 500);
    setIsSelecting(true)
    dispatch(AnnotatorSlice.actions.enableFrequencySelection())
  }, [ onClick ])

  const unselect = useCallback(() => {
    CLICK_EVENT.remove(onClick)
    setIsSelecting(false)
    dispatch(AnnotatorSlice.actions.disableFrequencySelection())
  }, [ onClick ])

  function toggleSelection() {
    if (isSelecting) unselect()
    else select()
  }

  function onClick(event: MouseEvent) {
    event.stopPropagation()
    const position = pointer.getFreqTime(event)
    if (position) onChange(position.frequency)
    unselect()
  }

  return <Fragment>
    <TableDivider className={ styles.span2ColsEnd }/>
    <TableContent>{ label }</TableContent>
    <TableContent className={ styles.cellButton }>
      <Input value={ value ?? '' } type="number" min={ 0 } max={ max }
             onChange={ e => onChange(+e.currentTarget.value) }/>
      <IonNote>Hz</IonNote>
      <IonButton size='small' fill='clear'
                 className={ isSelecting ? styles.selectedButton : undefined }
                 onClick={ toggleSelection }>
        <IonIcon icon={ createOutline } slot='icon-only'/>
      </IonButton>
    </TableContent>
  </Fragment>
}
