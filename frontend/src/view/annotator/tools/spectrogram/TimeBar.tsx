import React, { useMemo } from "react";
import styles from "@/view/annotator/tools/annotator-tools.module.scss";
import { SPECTRO_WIDTH } from "@/view/annotator/tools/spectrogram/SpectrogramRender.tsx";
import { useAppSelector } from "@/service/app.ts";
import { getDuration } from "@/service/dataset";
import { useAnnotator } from "@/service/annotator/hook.ts";

export const TimeBar: React.FC = () => {
  // Data
  const { zoomLevel } = useAppSelector(state => state.annotator.userPreferences)
  const { annotatorData } = useAnnotator();
  const {
    audio: { time }
  } = useAppSelector(state => state.annotator)

  // Memo
  const timeWidth = useMemo(() => SPECTRO_WIDTH / window.devicePixelRatio * zoomLevel, [ zoomLevel, window.devicePixelRatio ]);
  const duration = useMemo(() => getDuration(annotatorData?.file), [ annotatorData?.file ])

  return (
    <div className={ styles.timeBar } style={ { left: time * timeWidth / duration } }/>
  )
}