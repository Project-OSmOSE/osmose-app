import React, { Fragment } from "react";
import styles from "@/view/annotator/tools/annotator-tools.module.scss";
import { useAppSelector } from "@/service/app.ts";
import { useSpectrogramDimensions } from '@/service/annotator/spectrogram/hook.ts';
import { useAnnotatorFile } from "@/service/annotator/hook.ts";

export const TimeBar: React.FC = () => {
  // Data
  const { time } = useAppSelector(state => state.annotator.audio)

  // Memo
  const { width } = useSpectrogramDimensions()
  const file = useAnnotatorFile()

  if (!file) return <Fragment/>
  return (
    <div className={ styles.timeBar } style={ { left: time * width / file.duration } }/>
  )
}