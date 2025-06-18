import React, { Fragment, useMemo } from "react";
import { AnnotationResult } from "@/service/campaign/result";
import styles from "@/view/annotator/tools/bloc/bloc.module.scss";
import { IoAnalyticsOutline, IoChevronForwardOutline, IoPricetagOutline, IoTimeOutline } from "react-icons/io5";
import { formatTime } from "@/service/dataset/spectrogram-configuration/scale";
import { FaHandshake } from "react-icons/fa6";

export const LabelInfo: React.FC<{
  annotation: AnnotationResult
}> = ({ annotation }) => {
  const corrected_label = useMemo(() => {
    if (!annotation) return undefined
    if (annotation.updated_to.length > 0 && annotation.updated_to[0].label !== annotation.label) return annotation.updated_to[0].label;
    return undefined
  }, [ annotation ])
  return <div className={ styles.bounds }>
    <IoPricetagOutline className={ styles.mainIcon }/>

    <p className={ corrected_label ? 'disabled' : undefined }>
      { annotation.label }
      <span>{ annotation.type === 'Weak' ? ` (Weak)` : '' }</span>
    </p>

    { corrected_label && <p>{ corrected_label }</p> }
  </div>
}

export const TimeInfo: React.FC<{
  annotation: AnnotationResult
}> = ({ annotation }) => {
  const corrected_start_time = useMemo(() => {
    if (!annotation) return undefined
    if (annotation.updated_to.length > 0 && annotation.updated_to[0].start_time !== annotation.start_time) return annotation.updated_to[0].start_time;
    return undefined
  }, [ annotation ])
  const corrected_end_time = useMemo(() => {
    if (!annotation) return undefined
    if (annotation.updated_to.length > 0 && annotation.updated_to[0].end_time !== annotation.end_time) return annotation.updated_to[0].end_time;
    return undefined
  }, [ annotation ])
  const isCorrected = useMemo(() => corrected_start_time || corrected_end_time, [ corrected_start_time, corrected_end_time ])

  if (annotation.type === 'Weak') return <Fragment/>
  return <div className={ styles.bounds }>
    <IoTimeOutline className={ styles.mainIcon }/>

    <p className={ isCorrected ? 'disabled' : undefined }>
      { formatTime(annotation.start_time, true) }
      { annotation.type === 'Box' && <Fragment>
          &nbsp;<IoChevronForwardOutline/> { formatTime(annotation.end_time, true) }
      </Fragment> }
    </p>

    { isCorrected && <p>
      { formatTime(corrected_start_time ?? annotation.start_time, true) }
      { annotation.type === 'Box' && <Fragment>
          &nbsp;<IoChevronForwardOutline/> { formatTime(corrected_end_time ?? annotation.end_time, true) }
      </Fragment> }
    </p> }
  </div>
}

export const FrequencyInfo: React.FC<{
  annotation: AnnotationResult
}> = ({ annotation }) => {
  const corrected_start_frequency = useMemo(() => {
    if (!annotation) return undefined
    if (annotation.updated_to.length > 0 && annotation.updated_to[0].start_frequency !== annotation.start_frequency) return annotation.updated_to[0].start_frequency;
    return undefined
  }, [ annotation ])
  const corrected_end_frequency = useMemo(() => {
    if (!annotation) return undefined
    if (annotation.updated_to.length > 0 && annotation.updated_to[0].end_frequency !== annotation.end_frequency) return annotation.updated_to[0].end_frequency;
    return undefined
  }, [ annotation ])
  const isCorrected = useMemo(() => corrected_start_frequency || corrected_end_frequency, [ corrected_start_frequency, corrected_end_frequency ])

  if (annotation.type === 'Weak') return <Fragment/>
  return <div className={ styles.bounds }>
    <IoAnalyticsOutline className={ styles.mainIcon }/>

    <p className={ isCorrected ? 'disabled' : undefined }>
      { annotation.start_frequency?.toFixed(2) }Hz
      { annotation.type === 'Box' && <Fragment>
          &nbsp;<IoChevronForwardOutline/> { annotation.end_frequency.toFixed(2) }Hz
      </Fragment> }
    </p>

    { isCorrected && <p>
      { (corrected_start_frequency ?? annotation.start_frequency)?.toFixed(2) }Hz
      { annotation.type === 'Box' && <Fragment>
          &nbsp;<IoChevronForwardOutline/> { (corrected_end_frequency ?? annotation.end_frequency).toFixed(2) }Hz
      </Fragment> }
    </p> }
  </div>
}

export const ConfidenceInfo: React.FC<{annotation: AnnotationResult}> = ({annotation}) => ( <div className={ styles.bounds }>
    <FaHandshake className={ styles.mainIcon }/>
    <p>{ (annotation.confidence_indicator !== '') ? annotation.confidence_indicator : '-' }</p>
  </div>
)
