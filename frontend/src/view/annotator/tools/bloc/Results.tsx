import React, { Fragment, MouseEvent, useCallback, useMemo, useState } from "react";
import { IonButton, IonIcon, IonNote } from "@ionic/react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import { IoChatbubbleEllipses, IoChatbubbleOutline } from 'react-icons/io5';
import { RiRobot2Fill } from 'react-icons/ri';
import { AnnotationResult } from '@/service/types';
import styles from './bloc.module.scss';
import { Button, Modal, ModalHeader, Table, TableContent, TableDivider } from "@/components/ui";
import { createPortal } from "react-dom";
import {
  AnnotationLabelUpdateModal
} from "@/view/annotator/tools/spectrogram/annotation/AnnotationLabelUpdateModal.tsx";
import { ConfidenceInfo, FrequencyInfo, LabelInfo, TimeInfo } from "@/view/annotator/tools/bloc/Annotation.tsx";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { AnnotatorSlice } from "@/service/slices/annotator.ts";


export const Results: React.FC<{
  onSelect: (annotation: AnnotationResult) => void;
}> = ({ onSelect }) => {

  const {
    results
  } = useAppSelector(state => state.annotator);

  const sorted_results: Array<AnnotationResult> = useMemo(
    () => {
      // Need the spread to sort this readonly array
      return [ ...(results ?? []) ].sort((a, b) => {
        if (a.label !== b.label) {
          return a.label.localeCompare(b.label);
        }
        return (a.start_time ?? 0) - (b.start_time ?? 0);
      })
    },
    [ results ])

  // 'results' class is for playwright tests
  return <div className={ [ styles.bloc, styles.results, 'results' ].join(' ') }>
    <h6 className={ styles.header }>Annotations</h6>
    <div className={ [ styles.body, styles.vertical ].join(' ') }>

      { sorted_results.length > 0 && <Table columns={ 10 }>
        { sorted_results.map((r, index) => <Fragment key={ index }>
          { index > 0 && <TableDivider/> }
          <Result result={ r } onSelect={ onSelect }/>
        </Fragment>) }
      </Table> }

      { sorted_results.length === 0 && <IonNote color="medium">No results</IonNote> }
    </div>
  </div>
}

const Result: React.FC<{
  result: AnnotationResult;
  onSelect: (annotation: AnnotationResult) => void;
}> = ({ result, onSelect }) => {
  const { focusedResultID } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch()
  const isActive = useMemo(() => result.id === focusedResultID ? styles.active : undefined, [ result.id, focusedResultID ])
  const onClick = () => {
    dispatch(AnnotatorSlice.actions.focusResult(result.id))
    onSelect(result)
  }

  const params: ResultItemProps = { result, className: [ styles.item, isActive ].join(' '), onClick }
  return <Fragment>
    <ResultLabelInfo { ...params }/>
    <ResultTimeInfo { ...params }/>
    <ResultFrequencyInfo { ...params }/>
    <ResultConfidenceInfo { ...params }/>
    <ResultDetectorInfo { ...params }/>
    <ResultCommentInfo { ...params }/>
    <ResultValidationButton { ...params }/>
  </Fragment>
}

type ResultItemProps = {
  result: AnnotationResult;
  className?: string;
  onClick: () => void;
}

const ResultTimeInfo: React.FC<ResultItemProps> = ({ result, className, onClick }) => {
  if (result.type === 'Weak') return <Fragment/>
  return <TableContent className={ className } onClick={ onClick }>
    <TimeInfo annotation={ result }/>
  </TableContent>
}

const ResultFrequencyInfo: React.FC<ResultItemProps> = ({ result, className, onClick }) => {
  if (result.type === 'Weak') return <Fragment/>
  return <TableContent className={ className } onClick={ onClick }>
    <FrequencyInfo annotation={ result }/>
  </TableContent>
}

const ResultLabelInfo: React.FC<ResultItemProps> = ({ result, className, onClick }) => (
  <TableContent
    className={ [ className, result.type === 'Weak' ? styles.presenceLabel : styles.strongLabel ].join(' ') }
    isFirstColumn={ true }
    onClick={ onClick }>
    <LabelInfo annotation={ result }/>
  </TableContent>
)

const ResultConfidenceInfo: React.FC<ResultItemProps> = ({ result, className, onClick }) => {
  const { campaign } = useRetrieveCurrentCampaign()
  if (!campaign?.confidence_indicator_set) return <Fragment/>
  return (
    <TableContent className={ className } onClick={ onClick }>
      <ConfidenceInfo annotation={ result }/>
    </TableContent>
  )
}

const ResultDetectorInfo: React.FC<ResultItemProps> = ({ result, className, onClick }) => {
  if (!result.detector_configuration) return <Fragment/>
  return <TableContent className={ className } onClick={ onClick }>
    <RiRobot2Fill/>

    <p>{ result.detector_configuration?.detector }</p>
  </TableContent>
}

const ResultCommentInfo: React.FC<ResultItemProps> = ({ result, className, onClick }) => (
  <TableContent className={ className } onClick={ onClick }>
    {
      result.comments.filter(c => c.comment).length > 0 ?
        <IoChatbubbleEllipses/> : <IoChatbubbleOutline/>
    }
  </TableContent>
)

const ResultValidationButton: React.FC<ResultItemProps> = ({ result, className, onClick }) => {
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
  const [ isLabelModalOpen, setIsLabelModalOpen ] = useState<boolean>(false);
  const { phase } = useRetrieveCurrentPhase()
  const dispatch = useAppDispatch();
  const validation = useMemo(() => {
    if (result.validations.length === 0) return true;
    else return result.validations[0].is_valid;
  }, [ result.validations ]);

  const onValidate = (event: MouseEvent) => {
    event.stopPropagation()
    dispatch(AnnotatorSlice.actions.validateResult(result.id))
  }

  const onInvalidate = (event: MouseEvent) => {
    event.stopPropagation()
    setIsModalOpen(true)
  }

  const move = useCallback(() => {
    setIsModalOpen(false);
  }, [ setIsModalOpen ]);

  const updateLabel = useCallback(() => {
    setIsModalOpen(false);
    setIsLabelModalOpen(true)
  }, [ setIsModalOpen, setIsLabelModalOpen ]);

  const remove = useCallback(() => {
    setIsModalOpen(false);
    dispatch(AnnotatorSlice.actions.invalidateResult(result.id))
  }, [ setIsModalOpen ]);

  if (phase?.phase !== 'Verification') return <Fragment/>
  return <TableContent className={ [ className ].join(' ') } onClick={ onClick }>
    <IonButton className="validate"
               color={ validation ? 'success' : 'medium' }
               fill={ validation ? 'solid' : 'outline' }
               onClick={ onValidate }>
      <IonIcon slot="icon-only" icon={ checkmarkOutline }/>
    </IonButton>
    <IonButton className="invalidate"
               color={ validation ? 'medium' : 'danger' }
               fill={ validation ? 'outline' : 'solid' }
               onClick={ onInvalidate }>
      <IonIcon slot="icon-only" icon={ closeOutline }/>
    </IonButton>

    { isModalOpen && createPortal(<Modal className={ styles.invalidateModal } onClose={ () => setIsModalOpen(false) }>
      <ModalHeader title="Invalidate a result" onClose={ () => setIsModalOpen(false) }/>
      <h5>Why do you want to invalidate this result?</h5>

      <div>
        { result.type !== 'Weak' && <Fragment>
            <p>The position or dimension of the annotation is incorrect</p>
            <Button fill='outline' onClick={ move }>
                Move or resize
            </Button>
        </Fragment> }
      </div>
      <div>
        <p>The label is incorrect</p>
        <Button fill='outline' onClick={ updateLabel }>
          Change the label
        </Button>
      </div>
      <div>
        <p>The annotation shouldn't exist</p>
        <Button fill='outline' onClick={ remove }>
          Remove
        </Button>
      </div>

    </Modal>, document.body) }

    { isLabelModalOpen && <AnnotationLabelUpdateModal annotation={ result } isModalOpen={ isLabelModalOpen }
                                                      setIsModalOpen={ setIsLabelModalOpen }/> }
  </TableContent>
}
