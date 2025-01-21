import React, { Fragment, useMemo } from "react";
import { useAppSelector } from '@/service/app';
import { getDuration } from '@/service/dataset';
import { formatTime } from '@/service/dataset/spectrogram-configuration/scale';
import styles from './bloc.module.scss';
import { IoAnalyticsOutline, IoChevronForwardOutline, IoPricetagOutline, IoTimeOutline } from "react-icons/io5";
import { FaHandshake } from "react-icons/fa6";
import { useAnnotator } from "@/service/annotator/hook.ts";


export const CurrentAnnotation: React.FC = () => {
  const {
    annotatorData,
    campaign,
  } = useAnnotator();

  const {
    focusedResultID,
    results
  } = useAppSelector(state => state.annotator);
  const duration = useMemo(() => getDuration(annotatorData?.file), [ annotatorData?.file ]);
  const focusedResult = useMemo(() => results?.find(r => r.id === focusedResultID), [ focusedResultID, results ]);

  const startTime = useMemo(() => {
    if (!focusedResult) return "-"
    if (focusedResult.start_time === null) return "00:00.000";
    return formatTime(focusedResult.start_time);
  }, [ focusedResult?.start_time ])

  const endTime = useMemo(() => {
    if (!focusedResult) return "-"
    if (focusedResult.end_time === null) return formatTime(duration);
    return formatTime(focusedResult.end_time);
  }, [ focusedResult?.end_time ])

  const startFrequency = useMemo(() => {
    if (!focusedResult) return "-"
    if (focusedResult.start_frequency === null) return "0";
    return focusedResult.start_frequency.toFixed(2);
  }, [ focusedResult?.start_frequency ])

  const endFrequency = useMemo(() => {
    if (!focusedResult) return "-"
    if (focusedResult.end_frequency === null) return ((annotatorData?.file.dataset_sr ?? 0) / 2).toFixed(2);
    return focusedResult.end_frequency.toFixed(2);
  }, [ focusedResult?.end_frequency ])

  const label = useMemo(() => {
    if (!focusedResult?.label) return "-"
    return focusedResult.label;
  }, [ focusedResult?.label ])

  const confidence = useMemo(() => {
    if (!focusedResult?.confidence_indicator) return "-"
    return focusedResult.confidence_indicator;
  }, [ focusedResult?.confidence_indicator ])

  return (
    <div className={ styles.bloc }>
      <h6 className={ styles.header }>Selected annotation</h6>
      <div
        className={ [ styles.body, styles.small, styles.vertical, focusedResult ? styles.currentAnnotation : styles.empty ].join(' ') }>
        { !focusedResult && <p>-</p> }

        { focusedResult && <Fragment>

            <IoTimeOutline/>
            <p>
                <span>{ startTime }</span>
                <IoChevronForwardOutline/>
                <span>{ endTime }</span>
            </p>

            <IoAnalyticsOutline/>
            <p>
                <span>{ startFrequency }</span>
                <IoChevronForwardOutline/>
                <span>{ endFrequency } Hz</span>
            </p>

            <IoPricetagOutline/>
            <p>
                <span>{ label }</span>
            </p>

          { campaign?.confidence_indicator_set && <Fragment>
              <FaHandshake/>
              <p><span>{ confidence }</span></p>
          </Fragment> }

        </Fragment> }
      </div>
    </div>
  )
}
