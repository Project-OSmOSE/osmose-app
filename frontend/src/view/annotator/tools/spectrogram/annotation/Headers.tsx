import React, { Fragment, MutableRefObject, useCallback, useEffect, useState } from 'react';
import { ExtendedDiv } from '@/components/ui/ExtendedDiv';
import styles from './annotation.module.scss';
import { AnnotatorSlice, focusResult, removeResult } from '@/service/annotator';
import { IoChatbubbleEllipses, IoChatbubbleOutline, IoPlayCircle, IoSwapHorizontal, IoTrashBin } from 'react-icons/io5';
import { useAnnotator } from '@/service/annotator/hook.ts';
import { useAppDispatch } from '@/service/app.ts';
import { AnnotationResult } from '@/service/campaign/result';
import { useAudioService } from '@/services/annotator/audio.service.ts';
import { Button, Kbd, Modal, ModalHeader, TooltipOverlay } from "@/components/ui";
import { createPortal } from "react-dom";
import { IonNote } from "@ionic/react";
import { NON_FILTERED_KEY_DOWN_EVENT } from "@/service/events";

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

    <CommentInfo annotation={ annotation }/>

    <p>{ annotation.label }</p>

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

  const updateLabel = useCallback((newLabel: string) => {
    dispatch(AnnotatorSlice.actions.updateLabel(newLabel))
    setIsModalOpen(false)
  }, []);

  const { campaign, label_set } = useAnnotator();
  const dispatch = useAppDispatch();
  if (campaign?.usage !== 'Create') return <Fragment/>;

  return (<Fragment>
      <TooltipOverlay tooltipContent={ <p>Update the label</p> }>
        {/* 'update-box' class is for playwright tests*/ }
        <IoSwapHorizontal className={ [ styles.button, styles.delete, 'update-box' ].join(' ') }
                          onClick={ () => setIsModalOpen(true) }/>
      </TooltipOverlay>

      { isModalOpen && createPortal(<Modal onClose={ () => setIsModalOpen(false) }>
        <ModalHeader title="Update annotation label" onClose={ () => setIsModalOpen(false) }/>
        <IonNote>Choose a new label</IonNote>
        <div className={ styles.labelsButtons }>
          { label_set?.labels.map((label, index) => <Button key={ label }
                                                            fill='outline'
                                                            disabled={ label === annotation.label }
                                                            className={ `ion-color-${ index % 10 }` }
                                                            onClick={ () => updateLabel(label) }>
            { label }
          </Button>) }
        </div>
      </Modal>, document.body) }
    </Fragment>
  )
}

export const TrashButton: React.FC<{ annotation: AnnotationResult; }> = ({ annotation }) => {
  const { campaign } = useAnnotator();
  const dispatch = useAppDispatch();

  useEffect(() => {
    NON_FILTERED_KEY_DOWN_EVENT.add(onKbdEvent);
    return () => {
      NON_FILTERED_KEY_DOWN_EVENT.remove(onKbdEvent);
    }
  }, []);

  const onKbdEvent = useCallback((event: KeyboardEvent) => {
    switch (event.code) {
      case 'Delete':
        remove()
        break;
    }
  }, [])


  const remove = useCallback(() => {
    dispatch(removeResult(annotation.id))
  }, [ annotation ])

  if (campaign?.usage !== 'Create') return <Fragment/>;
  return (
    <TooltipOverlay tooltipContent={ <p><Kbd keys='delete'/> Remove the annotation</p> }>
      {/* 'remove-box' class is for playwright tests*/ }
      <IoTrashBin className={ [ styles.button, styles.delete, 'remove-box' ].join(' ') } onClick={ remove }/>
    </TooltipOverlay>
  )
}
