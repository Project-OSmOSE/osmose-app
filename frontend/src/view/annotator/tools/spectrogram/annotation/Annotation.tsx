import React, { Fragment, MutableRefObject, useMemo } from "react";
import { AnnotationResult } from "@/service/campaign/result";
import { Box } from "@/view/annotator/tools/spectrogram/annotation/Box.tsx";
import { Point } from '@/view/annotator/tools/spectrogram/annotation/Point.tsx';
import { useAppSelector } from "@/service/app.ts";

export const Annotation: React.FC<{
  annotation: AnnotationResult,
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
}> = ({ annotation, audioPlayer }) => {
  const { hiddenLabels } = useAppSelector(state => state.annotator.ui);
  const isHidden = useMemo(() => hiddenLabels.includes(annotation.label), [ hiddenLabels, annotation ])
  if (isHidden) return <Fragment/>
  return <Fragment>
    { annotation.type === 'Box' && <Box annotation={ annotation } audioPlayer={ audioPlayer }/> }
    { annotation.type === 'Point' && <Point annotation={ annotation } audioPlayer={ audioPlayer }/> }
  </Fragment>
}