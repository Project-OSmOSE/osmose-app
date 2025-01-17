import React, { Fragment, MouseEvent, useMemo } from "react";
import { IonButton, IonIcon, IonNote } from "@ionic/react";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { checkmarkOutline, closeOutline } from "ionicons/icons";
import {
  IoAnalyticsOutline,
  IoChatbubbleEllipses,
  IoChatbubbleOutline,
  IoChevronForwardOutline,
  IoPricetag,
  IoTimeOutline
} from 'react-icons/io5';
import { FaHandshake } from 'react-icons/fa6';
import { RiRobot2Fill } from 'react-icons/ri';
import { AnnotationResult } from '@/service/campaign/result';
import {
  focusResult,
  getResultType,
  invalidateResult,
  ResultType,
  useRetrieveAnnotatorQuery,
  validateResult
} from '@/service/annotator';
import { formatTime } from '@/service/dataset/spectrogram-configuration/scale';
import styles from './bloc.module.scss';
import { Table, TableContent, TableDivider } from "@/components/table/table.tsx";
import { useParams } from "react-router-dom";


export const Results: React.FC = () => {

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

  return <div className={ styles.bloc }>
    <h6 className={ styles.header }>Annotations</h6>
    <div className={ [ styles.body, styles.vertical ].join(' ') }>

      { sorted_results.length > 0 && <Table columns={ 10 }>
        { sorted_results.map((r, index) => <Fragment>
          { index > 0 && <TableDivider/> }
          <Result result={ r } key={ r.id }/>
        </Fragment>) }
      </Table> }

      { sorted_results.length === 0 && <IonNote color="medium">No results</IonNote> }
    </div>
  </div>
}

const Result: React.FC<{
  result: AnnotationResult
}> = ({ result }) => {
  const { focusedResultID } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch()
  const type = useMemo(() => getResultType(result), [ result ]);
  const isActive = useMemo(() => result.id === focusedResultID ? styles.active : undefined, [ result.id, focusedResultID ])
  const onClick = () => dispatch(focusResult(result.id))

  const params: ResultItemProps = { result, type, className: [ styles.item, isActive ].join(' '), onClick }
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
  type: ResultType;
  className?: string;
  onClick: () => void;
}

const ResultTimeInfo: React.FC<ResultItemProps> = ({ result, type, className, onClick }) => {
  if (type === 'presence') return <Fragment/>
  return <TableContent className={ className } onClick={ onClick }>
    <IoTimeOutline/>

    <p>
      { formatTime(result.start_time!) }
      { type === 'box' && <Fragment>
          <IoChevronForwardOutline/> { formatTime(result.end_time!) }
      </Fragment> }
    </p>
  </TableContent>
}

const ResultFrequencyInfo: React.FC<ResultItemProps> = ({ result, type, className, onClick }) => {
  if (type === 'presence') return <Fragment/>
  return <TableContent className={ className } onClick={ onClick }>
    <IoAnalyticsOutline/>

    <p>
      { result.start_frequency?.toFixed(2) }&nbsp;
      { type === 'box' && <Fragment>
          <IoChevronForwardOutline/> { result.end_frequency?.toFixed(2) }
      </Fragment> }
      Hz
    </p>
  </TableContent>
}

const ResultLabelInfo: React.FC<ResultItemProps> = ({ result, type, className, onClick }) => (
  <TableContent className={ [ className, type === 'presence' ? styles.presenceLabel : '' ].join(' ') }
                isFirstColumn={ true }
                onClick={ onClick }>
    <IoPricetag/>

    <p>{ (result.label !== '') ? result.label : '-' }</p>
  </TableContent>
)

const ResultConfidenceInfo: React.FC<ResultItemProps> = ({ result, className, onClick }) => {
  const params = useParams<{ campaignID: string, fileID: string }>();
  const { data } = useRetrieveAnnotatorQuery(params)
  if (!data?.campaign.confidence_indicator_set) return <Fragment/>
  return (
    <TableContent className={ className } onClick={ onClick }>
      <FaHandshake/>
      <p>{ (result.confidence_indicator !== '') ? result.confidence_indicator : '-' }</p>
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
  const { campaign } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch();
  const validation = useMemo(() => {
    return result.validations.length > 0 ? result.validations[0].is_valid : null
  }, [ result.validations ]);

  const onValidate = (event: MouseEvent) => {
    event.stopPropagation()
    dispatch(validateResult(result.id))
  }

  const onInvalidate = (event: MouseEvent) => {
    event.stopPropagation()
    dispatch(invalidateResult(result.id))
  }

  if (campaign?.usage !== 'Check') return <Fragment/>
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
  </TableContent>
}
