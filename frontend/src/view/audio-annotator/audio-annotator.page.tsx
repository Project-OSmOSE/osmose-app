import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { AudioPlayer, AudioPlayerComponent } from './components/audio-player.component.tsx';
import { Workbench } from './components/workbench.component.tsx';

import '../../css/annotator.css';
import { CommentBloc } from "./components/bloc/comment-bloc.component.tsx";
import { AnnotationList } from "./components/bloc/annotation-list.component.tsx";
import { PresenceBloc } from "./components/bloc/presence-bloc.component.tsx";
import { ConfidenceIndicatorBloc } from "./components/bloc/confidence-indicator-bloc.component.tsx";
import { TagListBloc } from "./components/bloc/tag-list-bloc.component.tsx";
import { CurrentAnnotationBloc } from "./components/bloc/current-annotation-bloc.component.tsx";
import { buildErrorMessage, formatTimestamp } from "@/services/utils/format.tsx";
import { Toast } from "../global-components";
import { NavigationButtons, NavigationShortcutOverlay } from "./components/navigation-buttons.component.tsx";
import { useAnnotationTaskAPI } from "@/services/api";
import { Retrieve } from "../../services/api/annotation-task-api.service.tsx";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { Annotation, AnnotationComment, Usage } from "@/types/annotations.ts";
import { ANNOTATOR_GUIDE_URL } from "@/consts/links.ts";
import { IonButton, IonIcon } from "@ionic/react";
import { helpCircle, informationCircle, pause, play } from "ionicons/icons";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { initAnnotator } from "@/slices/annotator/global-annotator.ts";
import { initAnnotations } from "@/slices/annotator/annotations.ts";
import { initSpectro } from "@/slices/annotator/spectro.ts";
import { DetectionList } from "@/view/audio-annotator/components/bloc/detection-list.component.tsx";

// Playback rates
const AVAILABLE_RATES: Array<number> = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0];

export type SpectroUrlsParams = {
  nfft: number,
  winsize: number,
  overlap: number,
  urls: Array<string>,
};

export type AnnotationDto = {
  id?: number,
  annotation: string,
  startTime: number | null,
  endTime: number | null,
  startFrequency: number | null,
  endFrequency: number | null,
  confidenceIndicator?: string,
  result_comments: Array<AnnotationComment>,
};


export type ConfidenceIndicator = {
  id: number,
  label: string,
  level: number,
  isDefault: boolean,
};

export type ConfidenceIndicatorSet = {
  id: number,
  name: string,
  desc: string,
  confidence_indicators: Array<ConfidenceIndicator>,
};

export type AnnotationTask = {
  id: number,
  annotationTags: Array<string>,
  confidenceIndicatorSet?: ConfidenceIndicatorSet,
  taskComment: Array<AnnotationComment>,
  boundaries: TaskBoundaries,
  audioRate: number,
  audioUrl: string,
  spectroUrls: Array<SpectroUrlsParams>,
  prevAnnotations: Array<AnnotationDto>,
  campaignId: number,
  instructions_url?: string,
  annotationScope: number,
  prevAndNextAnnotation: {
    prev: number | string,
    next: number | string,
  },
};

export interface TaskBoundaries {
  startTime: Date,
  endTime: Date,
  startFrequency: number,
  endFrequency: number,
}

export interface KeypressHandler {
  handleKeyPressed: (event: KeyboardEvent) => void;
}


export const AudioAnnotator: React.FC = () => {
  const { id: taskID } = useParams<{ id: string }>();

  const navKeyPress = useRef<KeypressHandler | null>(null);
  const tagsKeyPress = useRef<KeypressHandler | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>();
  const [error, setError] = useState<string | undefined>();
  const [start, setStart] = useState<Date>(new Date());

  const [canChangePlaybackRate, setCanChangePlaybackRate] = useState<boolean>(false);

  const taskAPI = useAnnotationTaskAPI();

  const {
    areShortcutsEnabled,
    instructionsURL,
    campaignId,
    taskId,
    mode,
    toast,
  } = useAppSelector(state => state.annotator.global);
  const {
    focusedResult,
    wholeFileBoundaries,
  } = useAppSelector(state => state.annotator.annotations);
  const {
    time,
    playbackRate,
    isPaused
  } = useAppSelector(state => state.annotator.audio);
  const dispatch = useAppDispatch();

  const audioPlayerRef = useRef<AudioPlayer>(null);

  useEffect(() => {
    document.addEventListener("keydown", e => handleKeyPressed(e));

    return () => {
      document.removeEventListener("keydown", handleKeyPressed);
    }
  }, [])

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setStart(new Date());
    setError(undefined);

    taskAPI.retrieve(taskID)
      .then((task: Retrieve) => {
        if (isCancelled) return;
        if (task.annotationTags.length < 1) return setError('Annotation set is empty');
        if (task.spectroUrls.length < 1) return setError('Cannot retrieve spectrograms');

        dispatch(initSpectro(task))
        dispatch(initAnnotations(task))
        dispatch(initAnnotator(task))

        setError(undefined);
      })
      .catch((e: any) => !isCancelled && setError(buildErrorMessage(e)))
      .finally(() => !isCancelled && setIsLoading(false))

    return () => {
      isCancelled = true;
      taskAPI.abort();
    }
  }, [taskID])

  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!areShortcutsEnabled) return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        playPause(focusedResult);
    }
    navKeyPress.current?.handleKeyPressed(event);
    tagsKeyPress.current?.handleKeyPressed(event);
  }

  const playPause = (annotation?: Annotation) => {
    try {
      if (isPaused) audioPlayerRef.current?.play(annotation);
      else audioPlayerRef.current?.pause();
    } catch (e) {
      console.warn(e);
    }
  }

  const openGuide = () => {
    window.open(ANNOTATOR_GUIDE_URL, "_blank", "noopener, noreferrer")
  }

  const openInstructions = () => {
    if (!instructionsURL) return;
    window.open(instructionsURL, "_blank", "noopener, noreferrer")
  }

  const goBack = () => {
    window.open(`/annotation_tasks/${ campaignId }`, "_self")
  }

  if (isLoading) return <p>Loading...</p>;
  else if (error) return <p>Error while loading task: <code>{ error }</code></p>
  else if (!taskId) return <p>Unknown error while loading task.</p>

  // Rendering
  return (
    <div className="annotator container-fluid ps-0">

      {/* Header */ }
      <div className="row">
        <h1 className="col-sm-6">APLOSE</h1>
        <div className="col-sm-4 annotator-nav align-items-center gap-1">
          <IonButton color="secondary"
                     fill={ "outline" }
                     onClick={ openGuide }>
            <IonIcon icon={ helpCircle } slot="start"/>
            Annotator user guide
          </IonButton>

          { instructionsURL && <IonButton color="secondary"
                                          fill={ "outline" }
                                          onClick={ openInstructions }>
              <IonIcon icon={ informationCircle } slot="start"/>
              Campaign instructions
          </IonButton> }
        </div>
        <ul className="col-sm-2 annotator-nav">
          <li>
            <IonButton color="danger"
                       onClick={ goBack }
                       title="Go back to annotation campaign tasks">
              Back to campaign
            </IonButton>
          </li>
        </ul>
      </div>

      {/* Audio player (hidden) */ }
      <AudioPlayerComponent ref={ ref => {
        // @ts-ignore
        audioPlayerRef.current = ref;
        setCanChangePlaybackRate(!!ref?.canPreservePitch)
      } }/>

      {/* Workbench (spectrogram viz, box drawing) */ }
      <Workbench audioPlayer={ audioPlayerRef.current }/>

      {/* Toolbar (play button, play speed, submit button, timer) */ }
      <div className="row annotator-controls">
        <div className="col-sm-1 d-flex justify-content-end">
          <OverlayTrigger
            overlay={ <Tooltip><NavigationShortcutOverlay shortcut="Space" description="Play/Pause audio"/></Tooltip> }>
            <IonButton color={ "primary" }
                       shape={ "round" }
                       onClick={ () => playPause() }>
              { isPaused && <IonIcon icon={ play } slot={ "icon-only" }/> }
              { !isPaused && <IonIcon icon={ pause } slot={ "icon-only" }/> }
            </IonButton>
          </OverlayTrigger>
        </div>
        <p className="col-sm-1">
          { canChangePlaybackRate &&
              <select className="form-control select-rate"
                      defaultValue={ playbackRate }
                      onChange={ e => audioPlayerRef.current?.setPlaybackRate(+e.target.value) }>
                { AVAILABLE_RATES.map(rate => (
                  <option key={ `rate-${ rate }` } value={ rate.toString() }>{ rate.toString() }x</option>
                )) }
              </select>
          }
        </p>

        <NavigationButtons ref={ navKeyPress } start={ start }/>

        <div className="col-sm-3">
          {/* FIXME: avoid line expansion due to toasts -> absolute IonToast*/ }
          <Toast toastMessage={ toast }/>
        </div>
        <p className="col-sm-2 text-right">
          { formatTimestamp(time) }
          &nbsp;/&nbsp;
          { formatTimestamp(wholeFileBoundaries.duration) }
        </p>
      </div>

      {/* Tag and annotations management */ }
      { mode === 'Create' && <div className="row justify-content-around m-2">
          <CurrentAnnotationBloc/>

          <div className="col-5 flex-shrink-2">
              <TagListBloc/>

              <ConfidenceIndicatorBloc/>
          </div>

          <PresenceBloc ref={ tagsKeyPress }/>
      </div> }


      <div className="row justify-content-center">
        { mode === Usage.create && <AnnotationList/> }
        { mode === Usage.check && <DetectionList/> }

        <CommentBloc/>
      </div>
    </div>
  );
}
