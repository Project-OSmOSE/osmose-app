import React, { Fragment, MutableRefObject, useCallback } from 'react';
import { ExtendedDiv } from '@/components/ui/ExtendedDiv';
import styles from './annotation.module.scss';
import { focusResult, removeResult } from '@/service/annotator';
import { IoChatbubbleEllipses, IoChatbubbleOutline, IoPlayCircle, IoTrashBin } from 'react-icons/io5';
import { useAnnotator } from '@/service/annotator/hook.ts';
import { useAppDispatch } from '@/service/app.ts';
import { AnnotationResult } from '@/service/campaign/result';
import { useAudioService } from '@/services/annotator/audio.service.ts';
import { TooltipOverlay } from "@/components/ui";

export const AnnotationHeader: React.FC<{
  active: boolean;
  top: number;
  onTopMove?(value: number): void;
  onLeftMove?(value: number): void;
  onValidateMove?(): void;
  setIsMouseHover?: (isMouseHover: boolean) => void;
  className?: string;
  annotation: AnnotationResult,
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
}> = ({ active, top, onTopMove, onLeftMove, setIsMouseHover, onValidateMove, className, annotation, audioPlayer }) => {
  const { campaign } = useAnnotator();
  const dispatch = useAppDispatch();
  const _setIsMouseHover = useCallback((value: boolean) => {
    if (!setIsMouseHover) return;
    setIsMouseHover(value);
  }, [ setIsMouseHover, ])
  return <ExtendedDiv draggable={ active && campaign?.usage === 'Create' }
                      onTopMove={ onTopMove } onLeftMove={ onLeftMove }
                      onUp={ onValidateMove }
                      onMouseEnter={ () => _setIsMouseHover(true) }
                      onMouseMove={ () => _setIsMouseHover(true) }
                      onMouseLeave={ () => _setIsMouseHover(false) }
                      className={ [ styles.header, className, top < 24 ? styles.bellow : styles.over, campaign?.usage === 'Create' ? styles.canBeRemoved : '' ].join(' ') }
                      innerClassName={ styles.inner }
                      onClick={ () => dispatch(focusResult(annotation.id)) }>

    <PlayButton annotation={ annotation } audioPlayer={ audioPlayer }/>

    <CommentInfo annotation={annotation}/>

    <p>{ annotation.label }</p>

    <TrashButton annotation={annotation}/>

  </ExtendedDiv>
}

export const PlayButton: React.FC<{
  audioPlayer: MutableRefObject<HTMLAudioElement | null>;
  annotation: AnnotationResult;
}> = ({ annotation, audioPlayer }) => {
  const audioService = useAudioService(audioPlayer);
  return (
    <TooltipOverlay tooltipContent={ <p>Play the audio of the annotation</p> }>
      <IoPlayCircle className={ styles.button } onClick={ () => audioService.play(annotation) }/>
    </TooltipOverlay>
  )
}

export const CommentInfo: React.FC<{ annotation: AnnotationResult; }> = ({ annotation }) => {
  if (annotation.comments.length > 0) return <IoChatbubbleEllipses/>
  else return (
    <TooltipOverlay tooltipContent={ <p>No comments</p> }><IoChatbubbleOutline className={ styles.outlineIcon }/></TooltipOverlay>
  )
}

export const TrashButton: React.FC<{
  annotation: AnnotationResult;
}> = ({ annotation }) => {
  const { campaign } = useAnnotator();
  const dispatch = useAppDispatch();
  if (campaign?.usage !== 'Create') return <Fragment/>;
  return (
    <TooltipOverlay tooltipContent={ <p>Remove the annotation</p> }>
      {/* 'remove-box' class is for playwright tests*/ }
      <IoTrashBin className={ [ styles.button, styles.delete, 'remove-box' ].join(' ') }
                  onClick={ () => dispatch(removeResult(annotation.id)) }/>
    </TooltipOverlay>
  )
}

