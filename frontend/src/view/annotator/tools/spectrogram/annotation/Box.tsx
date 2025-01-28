import React, { Fragment, MutableRefObject, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '@/service/app';
import { useAudioService } from "@/services/annotator/audio.service.ts";
import { AnnotationResult } from '@/service/campaign/result';
import { focusResult, removeResult, updateFocusResultBounds } from '@/service/annotator';
import { ScaleMapping } from '@/service/dataset/spectrogram-configuration/scale';
import { IoChatbubbleEllipses, IoChatbubbleOutline, IoPlayCircle, IoTrashBin } from "react-icons/io5";
import { useAnnotator } from "@/service/annotator/hook.ts";
import styles from '../../annotator-tools.module.scss'
import { ResizableDiv } from "@/components/ui";
import { Coords } from "@/components/ui/Tools/ResizableDiv.tsx";

type RegionProps = {
  annotation: AnnotationResult,
  yAxis: MutableRefObject<ScaleMapping | null>;
  xAxis: MutableRefObject<ScaleMapping | null>;
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
};


export const Box: React.FC<RegionProps> = ({
                                             annotation,
                                             yAxis, xAxis,
                                             audioPlayer
                                           }) => {
  // Data
  const { label_set, campaign } = useAnnotator();
  const { focusedResultID } = useAppSelector(state => state.annotator);
  const dispatch = useAppDispatch();

  // Memo
  const x1: number | undefined = useMemo(() => xAxis.current?.valueToPosition(annotation.start_time!), [ xAxis.current ]);
  const x2: number | undefined = useMemo(() => xAxis.current?.valueToPosition(annotation.end_time!), [ xAxis.current ]);
  const y1: number | undefined = useMemo(() => yAxis.current?.valueToPosition(annotation.start_frequency!), [ yAxis.current ]);
  const y2: number | undefined = useMemo(() => yAxis.current?.valueToPosition(annotation.end_frequency!), [ yAxis.current ]);
  const colorClassName: string = useMemo(() => label_set ? `ion-color-${ label_set.labels.indexOf(annotation.label) }` : '', [ label_set, annotation.label ]);
  const isActive = useMemo(() => annotation.id === focusedResultID, [ annotation.id, focusedResultID ]);

  // Service
  const audioService = useAudioService(audioPlayer);

  // Methods
  function onResize(newCoords: Coords) {
    if (!yAxis.current || !xAxis.current) return;
    dispatch(updateFocusResultBounds({
      start_frequency: yAxis.current.positionToValue(newCoords.y1),
      end_frequency: yAxis.current.positionToValue(newCoords.y2),
      start_time: xAxis.current.positionToValue(newCoords.x1),
      end_time: xAxis.current.positionToValue(newCoords.x2),
    }))
  }

  if (!x1 || !x2 || !y1 || !y2) return <Fragment/>
  return (
    <ResizableDiv x1={ x1 } x2={ x2 } y1={ y1 } y2={ y2 }
                  disabled={ !isActive || campaign?.usage !== 'Create' }
                  onResize={ onResize }
                  minX={ 0 }
                  minY={ 0 }
                  maxX={ xAxis.current?.canvas?.width }
                  maxY={ yAxis.current?.canvas?.height }
                  className={ [ colorClassName, isActive ? '' : 'disabled' ].join(' ') }>

      <div
        className={ [ styles.boxHeader, colorClassName, campaign?.usage === 'Create' ? styles.canBeRemoved : '' ].join(' ') }
        onClick={ () => dispatch(focusResult(annotation.id)) }>

        <IoPlayCircle className={ styles.button } onClick={ () => audioService.play(annotation) }/>

        <p>{ annotation.label }</p>

        { annotation.comments.length > 0 ?
          <IoChatbubbleEllipses/> :
          <IoChatbubbleOutline className={ styles.outlineIcon }/> }

        { campaign?.usage === 'Create' && (
          <IoTrashBin className={ [ styles.button, styles.delete ].join(' ') }
                      onClick={ () => dispatch(removeResult(annotation.id)) }/>
        ) }
      </div>

    </ResizableDiv>
  )
}
