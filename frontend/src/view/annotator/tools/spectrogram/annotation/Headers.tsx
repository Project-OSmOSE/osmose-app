import React, { Fragment, MutableRefObject, useCallback, useMemo, useState } from 'react';
import { ExtendedDiv } from '@/components/ui/ExtendedDiv';
import styles from './annotation.module.scss';
import { focusResult, invalidateResult, removeResult } from '@/service/annotator';
import { IoChatbubbleEllipses, IoChatbubbleOutline, IoPlayCircle, IoSwapHorizontal, IoTrashBin } from 'react-icons/io5';
import { useAppDispatch } from '@/service/app.ts';
import { AnnotationResult } from '@/service/campaign/result';
import { useAudioService } from '@/services/annotator/audio.service.ts';
import { TooltipOverlay } from "@/components/ui";
import {
  AnnotationLabelUpdateModal
} from "@/view/annotator/tools/spectrogram/annotation/AnnotationLabelUpdateModal.tsx";
import { CampaignAPI } from "@/service/campaign";

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
  const dispatch = useAppDispatch();
  const _setIsMouseHover = useCallback((value: boolean) => {
    if (!setIsMouseHover) return;
    setIsMouseHover(value);
  }, [ setIsMouseHover, ])
  const label: string = useMemo(() => {
    let label = annotation.label
    if (annotation.updated_to.length > 0) label = annotation.updated_to[0].label;
    return label;
  }, [ annotation ]);
  return <ExtendedDiv draggable={ active }
                      onTopMove={ onTopMove } onLeftMove={ onLeftMove }
                      onUp={ onValidateMove }
                      onMouseEnter={ () => _setIsMouseHover(true) }
                      onMouseMove={ () => _setIsMouseHover(true) }
                      onMouseLeave={ () => _setIsMouseHover(false) }
                      className={ [ styles.header, className, top < 24 ? styles.bellow : styles.over ].join(' ') }
                      innerClassName={ styles.inner }
                      onClick={ () => dispatch(focusResult(annotation.id)) }>

    <PlayButton annotation={ annotation } audioPlayer={ audioPlayer }/>

    <CommentInfo annotation={ annotation }/>

    <p>{ label }</p>

    <UpdateLabelButton annotation={ annotation }/>

    <TrashButton annotation={ annotation }/>

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
    <TooltipOverlay tooltipContent={ <p>No comments</p> }><IoChatbubbleOutline
      className={ styles.outlineIcon }/></TooltipOverlay>
  )
}

export const UpdateLabelButton: React.FC<{ annotation: AnnotationResult; }> = ({ annotation }) => {
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);

  return (<Fragment>
      <TooltipOverlay tooltipContent={ <p>Update the label</p> }>
        {/* 'update-box' class is for playwright tests*/ }
        <IoSwapHorizontal className={ [ styles.button, 'update-box' ].join(' ') }
                          onClick={ () => setIsModalOpen(true) }/>
      </TooltipOverlay>

      <AnnotationLabelUpdateModal annotation={ annotation }
                                  isModalOpen={ isModalOpen }
                                  setIsModalOpen={ setIsModalOpen }/>
    </Fragment>
  )
}

export const TrashButton: React.FC<{ annotation: AnnotationResult; }> = ({ annotation }) => {
  const { currentPhase } = CampaignAPI.useRetrieveQuery()
  const dispatch = useAppDispatch();

  const remove = useCallback(() => {
    switch (currentPhase?.phase) {
      case 'Annotation':
        dispatch(removeResult(annotation.id));
        break;
      case 'Verification':
        dispatch(invalidateResult(annotation.id));
        break;
    }
  }, [ currentPhase, annotation ])

  return (
    <TooltipOverlay tooltipContent={ <p>Remove the annotation</p> }>
      {/* 'remove-box' class is for playwright tests*/ }
      <IoTrashBin className={ [ styles.button, 'remove-box' ].join(' ') }
                  onClick={ remove }/>
    </TooltipOverlay>
  )
}
