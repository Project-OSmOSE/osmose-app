import React, { Fragment, MouseEvent, useMemo, useState } from 'react';
import styles from './bloc.module.scss';
import { useAppDispatch, useAppSelector } from '@/service/app.ts';
import { focusTask, getResultType, updateCurrentResultAcousticFeatures } from '@/service/annotator';
import { Table, TableContent, TableDivider, TableHead } from '@/components/table/table.tsx';
import { Input, Select } from '@/components/form';
import { IonCheckbox, IonNote } from '@ionic/react';
import { selectAnnotationFileDuration } from '@/service/dataset';
import { SPECTRO_HEIGHT } from '@/view/audio-annotator/components/spectro-render.component.tsx';
import { Item } from '@/types/item.ts';
import { SignalTrend, SignalTrends } from '@/service/campaign/result/type.ts';
import { IoRemoveCircleOutline } from 'react-icons/io5';
import { useAnnotator } from "@/service/annotator/hook.ts";

export const AcousticFeatures: React.FC = () => {
  const {
    campaign,
  } = useAnnotator();

  const [ top, setTop ] = useState<number>(96);
  const [ right, setRight ] = useState<number>(16);

  const [ isDragging, setIsDragging ] = useState<boolean>(false);

  const {
    results,
    focusedResultID,
    file
  } = useAppSelector(state => state.annotator);
  const duration = useAppSelector(selectAnnotationFileDuration)
  const dispatch = useAppDispatch();

  const currentResult = useMemo(() => results?.find(r => r.id === focusedResultID), [ results, focusedResultID ]);
  const currentResultType = useMemo(() => currentResult ? getResultType(currentResult) : undefined, [ currentResult ]);

  const onMouseDown = (event: MouseEvent) => {
    setIsDragging(true);
    event.stopPropagation();
    event.preventDefault();
  }
  const onMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      setTop(previous => previous + event.movementY);
      setRight(previous => previous - event.movementX);
    }
    event.stopPropagation();
    event.preventDefault();
  }
  const onMouseUp = (event: MouseEvent) => {
    setIsDragging(false);
    event.stopPropagation();
    event.preventDefault();
  }

  function setBad() {
    dispatch(updateCurrentResultAcousticFeatures(null));
  }

  function setGood() {
    if (currentResult?.acoustic_features) return;
    dispatch(updateCurrentResultAcousticFeatures({}));
  }

  if (!currentResult) return;
  if (!campaign?.labels_with_acoustic_features.includes(currentResult.label)) return;
  if (currentResultType !== 'box') return;
  return (
    <div className={ "card ml-2 flex-grow-1 mini-content " + styles.features }
         style={ {
           top, right,
           maxHeight: SPECTRO_HEIGHT - 32,
         } }
         onMouseDown={ e => e.stopPropagation() }
         onMouseUp={ e => e.stopPropagation() }
         onMouseMove={ e => e.stopPropagation() }>
      <h6 className="card-header text-center"
          onMouseDown={ onMouseDown }
          onMouseMove={ onMouseMove }
          onMouseLeave={ onMouseUp }
          onMouseUp={ onMouseUp }>
        Acoustic features
        <IoRemoveCircleOutline onClick={ () => dispatch(focusTask()) }/>
      </h6>
      <div className={ "card-body " + styles.body }>

        <div className={ styles.line }>
          <b>Quality</b>
          <div className={ styles.switch }>
            <div className={ !currentResult?.acoustic_features ? styles.active : undefined }
                 onClick={ setBad }>
              Bad
            </div>
            <div className={ currentResult?.acoustic_features ? styles.active : undefined }
                 onClick={ setGood }>
              Good
            </div>
          </div>
        </div>

        { currentResult.acoustic_features && <Table columns={ 2 } className={ styles.table }>
            <TableHead isFirstColumn={ true }>Feature</TableHead>
            <TableHead>Value</TableHead>

            <NumberRow label="Min frequency"
                       note="In Hz"
                       placeholder={ currentResult.start_frequency }
                       value={ currentResult.acoustic_features?.min_frequency }
                       min={ 0 } max={ file ? file.dataset_sr / 2 : undefined }
                       onUpdate={ min_frequency => dispatch(updateCurrentResultAcousticFeatures({ min_frequency })) }/>

            <NumberRow label="Max frequency"
                       note="In Hz"
                       placeholder={ currentResult.end_frequency }
                       value={ currentResult.acoustic_features?.max_frequency }
                       min={ 0 } max={ file ? file.dataset_sr / 2 : undefined }
                       onUpdate={ max_frequency => dispatch(updateCurrentResultAcousticFeatures({ max_frequency })) }/>

            <NumberRow label="Duration"
                       note="In s"
                       placeholder={ (currentResult.start_time !== null && currentResult.end_time !== null) ? currentResult.end_time - currentResult.start_time : undefined }
                       value={ currentResult.acoustic_features?.level_peak_frequency }
                       min={ 0 } max={ duration }
                       onUpdate={ level_peak_frequency => dispatch(updateCurrentResultAcousticFeatures({ level_peak_frequency })) }/>

            <SelectRow label="Trend"
                       value={ currentResult.acoustic_features?.trend }
                       onUpdate={ (trend: SignalTrend | undefined) => dispatch(updateCurrentResultAcousticFeatures({ trend: trend ?? null })) }
                       options={ SignalTrends }/>

            <NumberRow label="Start frequency"
                       note="In Hz"
                       value={ currentResult.acoustic_features?.start_frequency }
                       min={ 0 } max={ file ? file.dataset_sr / 2 : undefined }
                       onUpdate={ start_frequency => dispatch(updateCurrentResultAcousticFeatures({ start_frequency })) }/>

            <NumberRow label="End frequency"
                       note="In Hz"
                       value={ currentResult.acoustic_features?.end_frequency }
                       min={ 0 } max={ file ? file.dataset_sr / 2 : undefined }
                       onUpdate={ end_frequency => dispatch(updateCurrentResultAcousticFeatures({ end_frequency })) }/>

            <NumberRow label="Median frequency"
                       note="In Hz"
                       value={ currentResult.acoustic_features?.median_frequency }
                       min={ 0 } max={ file ? file.dataset_sr / 2 : undefined }
                       onUpdate={ median_frequency => dispatch(updateCurrentResultAcousticFeatures({ median_frequency })) }/>

            <NumberRow label="Level peak frequency"
                       note="In Hz"
                       min={ 0 } max={ file ? file.dataset_sr / 2 : undefined }
                       value={ currentResult.acoustic_features?.level_peak_frequency }
                       onUpdate={ level_peak_frequency => dispatch(updateCurrentResultAcousticFeatures({ level_peak_frequency })) }/>

            <NumberRow label="Beginning sweep slope"
                       value={ currentResult.acoustic_features?.beginning_sweep_slope }
                       onUpdate={ beginning_sweep_slope => dispatch(updateCurrentResultAcousticFeatures({ beginning_sweep_slope })) }/>

            <NumberRow label="End sweep slope"
                       value={ currentResult.acoustic_features?.end_sweep_slope }
                       onUpdate={ end_sweep_slope => dispatch(updateCurrentResultAcousticFeatures({ end_sweep_slope })) }/>

            <NumberRow label="Steps count"
                       value={ currentResult.acoustic_features?.steps_count }
                       min={ 0 }
                       onUpdate={ steps_count => dispatch(updateCurrentResultAcousticFeatures({ steps_count })) }/>

            <BooleanRow label="Has harmonics"
                        value={ currentResult.acoustic_features?.has_harmonics }
                        onUpdate={ has_harmonics => {
                          dispatch(updateCurrentResultAcousticFeatures({ has_harmonics }))
                          if (!has_harmonics) dispatch(updateCurrentResultAcousticFeatures({ harmonics_count: null }))
                        } }/>

          { currentResult.acoustic_features?.has_harmonics && <NumberRow label="Harmonics count"
                                                                         min={ 0 }
                                                                         value={ currentResult.acoustic_features?.harmonics_count }
                                                                         onUpdate={ harmonics_count => dispatch(updateCurrentResultAcousticFeatures({
                                                                           harmonics_count,
                                                                           has_harmonics: true
                                                                         })) }/> }

            <NumberRow label="Relative peaks count"
                       min={ 0 }
                       value={ currentResult.acoustic_features?.relative_peaks_count }
                       onUpdate={ relative_peaks_count => dispatch(updateCurrentResultAcousticFeatures({ relative_peaks_count })) }/>
        </Table> }
      </div>
    </div>
  )
}

const NumberRow: React.FC<{
  label: string;
  note?: string;
  value?: number | null;
  placeholder?: number | null;
  onUpdate: (value: number) => void;
  min?: number;
  max?: number;
}> = ({ value, label, note, min, max, onUpdate, placeholder }) => {
  return <Fragment>
    <TableDivider/>
    <TableContent isFirstColumn={ true }>
      <p>{ label }</p>
      { note && <IonNote>{ note }</IonNote> }
    </TableContent>
    <TableContent>
      <Input value={ value === null ? undefined : value }
             placeholder={ placeholder === null ? undefined : placeholder?.toString() }
             type="number"
             min={ min }
             max={ max }
             onChange={ e => onUpdate(+e.currentTarget.value) }/>
    </TableContent>
  </Fragment>
}

const BooleanRow: React.FC<{
  label: string;
  note?: string;
  value?: boolean | null;
  onUpdate: (value: boolean) => void;
}> = ({ value, label, note, onUpdate }) => {
  return <Fragment>
    <TableDivider/>
    <TableContent isFirstColumn={ true }>
      <p>{ label }</p>
      { note && <IonNote>{ note }</IonNote> }
    </TableContent>
    <TableContent>
      <IonCheckbox checked={ !!value }
                   onClick={ e => onUpdate(e.currentTarget.checked) }/>
    </TableContent>
  </Fragment>
}

const SelectRow: React.FC<{
  label: string;
  note?: string;
  value?: string | null;
  options: Array<string>;
  onUpdate: (value: string | undefined) => void;
}> = ({ value, label, note, options, onUpdate }) => {
  return <Fragment>
    <TableDivider/>
    <TableContent isFirstColumn={ true }>
      <p>{ label }</p>
      { note && <IonNote>{ note }</IonNote> }
    </TableContent>
    <TableContent>
      <Select options={ options.map(value => ({ label: value, value } satisfies Item)) }
              placeholder="Select a value"
              optionsContainer="popover"
              value={ value === null ? undefined : value }
              onValueSelected={ item => onUpdate(item as string) }/>
    </TableContent>
  </Fragment>
}