import React, { Fragment, useMemo } from "react";
import styles from './bloc.module.scss';
import { useCurrentAnnotation } from '@/service/annotator/spectrogram';
import { IonNote } from "@ionic/react";
import { ConfidenceInfo, FrequencyInfo, LabelInfo, TimeInfo } from "@/view/annotator/tools/bloc/Annotation.tsx";


export const CurrentAnnotation: React.FC = () => {
  const { annotation } = useCurrentAnnotation();

  const isRemoved = useMemo(() => {
    if (!annotation) return false;
    if (annotation.updated_to.length > 0) return false;
    return annotation.validations.some(validation => !validation.is_valid)
  }, [ annotation ])

  return (
    <div className={ [ styles.bloc, styles.current ].join(' ') }>
      <h6 className={ styles.header }>Selected annotation</h6>
      <div
        className={ [ styles.body, styles.small, styles.vertical, annotation ? styles.currentAnnotation : styles.empty ].join(' ') }>
        { !annotation && <p>-</p> }

        { annotation && <Fragment>

          { isRemoved && <IonNote>You removed this annotation</IonNote> }

            <LabelInfo annotation={ annotation }/>
            <ConfidenceInfo annotation={ annotation }/>
            <TimeInfo annotation={ annotation }/>
            <FrequencyInfo annotation={ annotation }/>

        </Fragment> }
      </div>
    </div>
  )
}
