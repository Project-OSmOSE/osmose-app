import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { buildErrorMessage, formatTimestamp } from "@/services/utils/format.tsx";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { AnnotatorActions } from "@/slices/annotator/global-annotator.ts";
import { AnnotationActions } from "@/slices/annotator/annotations.ts";
import { OsmoseBarComponent } from "@/view/global-components/osmose-bar/osmose-bar.component.tsx";

import { Toast } from "../global-components";
import { AudioPlayerComponent } from './components/audio-player.component.tsx';
import { SpectrogramRender, SpectroRenderComponent } from "./components/spectro-render.component.tsx";
import { CommentBloc } from "./components/bloc/comment-bloc.component.tsx";
import { PresenceBloc } from "./components/bloc/presence-bloc.component.tsx";
import { ConfidenceIndicatorBloc } from "./components/bloc/confidence-indicator-bloc.component.tsx";
import { LabelListBloc } from "./components/bloc/label-list-bloc.component.tsx";
import { CurrentAnnotationBloc } from "./components/bloc/current-annotation-bloc.component.tsx";
import { NavigationButtons } from "./components/navigation-buttons.component.tsx";

import '../../css/annotator.css';
import { useAudioService } from "@/services/annotator/audio.service.ts";
import { PlayPauseButton } from "@/view/audio-annotator/components/buttons/play-pause.tsx";
import { PlaybackRateSelect } from "@/view/audio-annotator/components/select/playback-rate.tsx";
import { AudioDownloadButton } from "@/view/audio-annotator/components/buttons/audio-download.tsx";
import { BackButton } from "@/view/audio-annotator/components/buttons/back.tsx";
import { CampaignInstructionsButton } from "@/view/audio-annotator/components/buttons/campaign-instructions.tsx";
import { SpectrogramDownloadButton } from "@/view/audio-annotator/components/buttons/spectrogram-download.tsx";
import { UserGuideButton } from "@/view/audio-annotator/components/buttons/user-guide.tsx";
import { SpectrogramActions } from "@/slices/annotator/spectro.ts";
import { useAnnotatorAPI } from "@/services/api/annotation/annotator.service.tsx";
import { ResultList } from "@/view/audio-annotator/components/bloc/result-list.component.tsx";
import { getFileDuration } from "@/services/utils/annotator.ts";
import { SpectrogramConfigurationSelect } from "@/view/audio-annotator/components/select/spectrogram-configuration.tsx";
import { ZoomButton } from "@/view/audio-annotator/components/buttons/zoom.tsx";
import { PointerPosition } from "@/view/audio-annotator/components/bloc/pointer-position.component.tsx";
import { WorkbenchInfoBloc } from "@/view/audio-annotator/components/bloc/workbench-info.tsx";

// Component dimensions constants
export const SPECTRO_CANVAS_HEIGHT: number = 512;
const SPECTRO_CANVAS_WIDTH: number = 1813;
const CONTROLS_AREA_SIZE: number = 80;
const TIME_AXIS_SIZE: number = 30;
const FREQ_AXIS_SIZE: number = 35;
const SCROLLBAR_RESERVED: number = 20;

export interface KeypressHandler {
  handleKeyPressed: (event: KeyboardEvent) => void;
}

export const AudioAnnotator: React.FC = () => {
  const { campaignID, fileID } = useParams<{ campaignID: string, fileID: string }>();

  const navKeyPress = useRef<KeypressHandler | null>(null);
  const labelsKeyPress = useRef<KeypressHandler | null>(null);
  const spectrogramRender = useRef<SpectrogramRender | null>(null);

  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [ error, setError ] = useState<string | undefined>();

  // Ref
  const localIsPaused = useRef<boolean>(true);
  const localAreShortcutsEnabled = useRef<boolean>(true);
  const playerRef = useRef<HTMLAudioElement>(null);

  // Services
  const API = useAnnotatorAPI();
  const audioService = useAudioService(playerRef)

  // Slice
  const {
    file,
    campaign,
    areShortcutsEnabled,
    toast,
  } = useAppSelector(state => state.annotator.global);
  const {
    focusedResult,
  } = useAppSelector(state => state.annotator.annotations);
  const {
    time,
    isPaused
  } = useAppSelector(state => state.annotator.audio);
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPressed);

    return () => {
      document.removeEventListener("keydown", handleKeyPressed);
    }
  }, [])

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(undefined);

    API.get(campaignID, fileID)
      .then(data => {
        if (isCancelled) return;
        if (!data.label_set || data.label_set.labels.length < 1) return setError('Label set is empty');
        if (data.spectrogram_configurations.length < 1) return setError('Cannot retrieve spectrograms');

        dispatch(AnnotationActions.init(data))
        dispatch(AnnotatorActions.init(data))
        dispatch(SpectrogramActions.init(data))

        setError(undefined);
      })
      .catch((e: any) => !isCancelled && setError(buildErrorMessage(e)))
      .finally(() => !isCancelled && setIsLoading(false))

    return () => {
      isCancelled = true;
      API.abort();
    }
  }, [ campaignID, fileID ])

  useEffect(() => {
    localAreShortcutsEnabled.current = areShortcutsEnabled;
  }, [ areShortcutsEnabled ])

  useEffect(() => {
    localIsPaused.current = isPaused;
  }, [ isPaused ])

  const handleKeyPressed = (event: KeyboardEvent) => {
    if (!localAreShortcutsEnabled.current) return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        audioService.playPause(focusedResult);
    }
    navKeyPress.current?.handleKeyPressed(event);
    labelsKeyPress.current?.handleKeyPressed(event);
  }

  if (isLoading) return <p>Loading...</p>;
  else if (error) return <p>Error while loading task: <code>{ error }</code></p>
  else if (!file || file.id !== +fileID) return <p>Unknown error while loading task.</p>

  // Rendering
  return (
    <div id="aplose-annotator" className="annotator container-fluid ps-0">

      {/* Header */ }
      <div id="header">
        <h1>APLOSE</h1>

        <div className="buttons">
          <UserGuideButton/>
          <CampaignInstructionsButton/>
        </div>

        <BackButton campaignID={ campaignID }/>
      </div>

      {/* Audio player (hidden) */ }
      <AudioPlayerComponent ref={ playerRef }/>

      {/* Workbench (spectrogram viz, box drawing) */ }
      <div className="workbench rounded"
           style={ {
             height: `${ CONTROLS_AREA_SIZE + SPECTRO_CANVAS_HEIGHT + TIME_AXIS_SIZE + SCROLLBAR_RESERVED }px`,
             width: `${ FREQ_AXIS_SIZE + SPECTRO_CANVAS_WIDTH }px`,
           } }>
        <p className="workbench-controls">
          <SpectrogramConfigurationSelect/>
          <ZoomButton/>
        </p>

        <PointerPosition/>

        <WorkbenchInfoBloc/>

        <SpectroRenderComponent audioPlayer={ playerRef } ref={ spectrogramRender }/>
      </div>

      {/* Toolbar (play button, play speed, submit button, timer) */ }
      <div className="row align-items-start annotator-controls">
        <div className="col-sm-1 d-flex justify-content-end">
          <PlayPauseButton player={ playerRef }/>
        </div>
        <p className="col-sm-1">
          <PlaybackRateSelect player={ playerRef }/>
        </p>

        <NavigationButtons ref={ navKeyPress } campaignID={ campaignID }/>

        <div className="col-sm-3">
          <Toast toastMessage={ toast }/>
        </div>
        <p className="col-sm-2 text-right">
          { formatTimestamp(time) }
          &nbsp;/&nbsp;
          { formatTimestamp(getFileDuration(file)) }
        </p>
      </div>

      {/* Label and annotations management */ }
      { campaign?.usage === 'Create' && <div className="row justify-content-around m-2">
          <CurrentAnnotationBloc/>

          <div className="col-5 flex-shrink-2">
              <LabelListBloc/>

              <ConfidenceIndicatorBloc/>
          </div>

          <PresenceBloc ref={ labelsKeyPress }/>
      </div> }

      <div className="row justify-content-center">
        <ResultList/>
        <CommentBloc/>
      </div>

      <div className="justify-content-center buttons">
        <AudioDownloadButton/>
        <SpectrogramDownloadButton render={ spectrogramRender }/>
      </div>

      <div className="row justify-content-center">
        <OsmoseBarComponent/>
      </div>
    </div>
  );
}
