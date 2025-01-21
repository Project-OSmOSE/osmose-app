import React, { Fragment, MutableRefObject, useMemo } from "react";
import { AnnotationResult } from "@/service/campaign/result";
import { getResultType } from "@/service/annotator";
import { Box } from "@/view/annotator/tools/spectrogram/annotation/Box.tsx";
import { ScaleMapping } from "@/service/dataset/spectrogram-configuration/scale";

export const Annotation: React.FC<{
  annotation: AnnotationResult,
  yAxis: MutableRefObject<ScaleMapping | null>;
  xAxis: MutableRefObject<ScaleMapping | null>;
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
}> = (props) => {
  const type = useMemo(() => getResultType(props.annotation), [ props.annotation ]);

  switch (type) {
    case "box":
      return <Box { ...props }/>
    default:
      return <Fragment/>
  }
}