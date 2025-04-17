import React, { Fragment, useMemo } from "react";
import { formatTime } from '@/service/dataset/spectrogram-configuration/scale';
import styles from './bloc.module.scss';
import { IoAnalyticsOutline, IoChevronForwardOutline, IoPricetagOutline, IoTimeOutline } from "react-icons/io5";
import { FaHandshake } from "react-icons/fa6";
import { useAnnotator } from "@/service/annotator/hook.ts";
import { useCurrentAnnotation } from '@/service/annotator/spectrogram';
import { IonNote } from "@ionic/react";


export const CurrentAnnotation: React.FC = () => {
  const { campaign } = useAnnotator();

  const { annotation } = useCurrentAnnotation();

  const startTime = useMemo(() => {
    if (!annotation || annotation.type === 'Weak') return "-"
    let start_time = annotation.start_time
    if (annotation.updated_to.length > 0) start_time = annotation.updated_to[0].start_time ?? start_time;
    return formatTime(start_time, true);
  }, [ annotation ])

  const endTime = useMemo(() => {
    if (!annotation || annotation.type !== 'Box') return "-"
    let end_time = annotation.end_time
    if (annotation.updated_to.length > 0) end_time = annotation.updated_to[0].end_time ?? end_time;
    return formatTime(end_time, true);
  }, [ annotation ])

  const startFrequency = useMemo(() => {
    if (!annotation || annotation.type === 'Weak') return "-"
    let start_frequency = annotation.start_frequency
    if (annotation.updated_to.length > 0) start_frequency = annotation.updated_to[0].start_frequency ?? start_frequency;
    return (start_frequency).toFixed(2);
  }, [ annotation ])

  const endFrequency = useMemo(() => {
    if (!annotation || annotation.type !== 'Box') return "-"
    let end_frequency = annotation.end_frequency
    if (annotation.updated_to.length > 0) end_frequency = annotation.updated_to[0].end_frequency ?? end_frequency;
    return (end_frequency).toFixed(2);
  }, [ annotation ])

  const label = useMemo(() => {
    if (!annotation) return '-'
    if (annotation.updated_to.length > 0) return annotation.updated_to[0].label;
    return annotation.label;
  }, [ annotation ])

  const isRemoved = useMemo(() => {
    if (!annotation) return false;
    if (annotation.updated_to.length > 0) return false;
    return annotation.validations.some(validation => !validation.is_valid)
  }, [ annotation ])
  const confidence = useMemo(() => annotation?.confidence_indicator ?? '-', [ annotation?.confidence_indicator ])

  return (
    <div className={ [ styles.bloc, styles.current ].join(' ') }>
      <h6 className={ styles.header }>Selected annotation</h6>
      <div
        className={ [ styles.body, styles.small, styles.vertical, annotation ? styles.currentAnnotation : styles.empty ].join(' ') }>
        { !annotation && <p>-</p> }

        { annotation && <Fragment>

          { isRemoved && <IonNote>You removed this annotation</IonNote> }

            <IoPricetagOutline/>
            <p>
                <span>{ label }</span>
            </p>

          { campaign?.confidence_indicator_set && <Fragment>
              <FaHandshake/>
              <p><span>{ confidence }</span></p>
          </Fragment> }

          { annotation.type !== 'Weak' && <Fragment>
              <IoTimeOutline/>
              <p>
                  <span>{ startTime }</span>
                { annotation.type === 'Box' && <Fragment>
                    <IoChevronForwardOutline/>
                    <span>{ endTime }</span>
                </Fragment> }
              </p>

              <IoAnalyticsOutline/>
              <p>
                  <span>{ startFrequency }</span>
                { annotation.type === 'Box' && <Fragment>
                    <IoChevronForwardOutline/>
                    <span>{ endFrequency }</span>
                </Fragment> }
                  <span>Hz</span>
              </p>
          </Fragment>
          }

        </Fragment> }
      </div>
    </div>
  )
}
