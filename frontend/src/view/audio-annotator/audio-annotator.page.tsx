import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAppSelector } from '@/service/app';

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
import { ResultList } from "@/view/audio-annotator/components/bloc/result-list.component.tsx";
import { SpectrogramConfigurationSelect } from "@/view/audio-annotator/components/select/spectrogram-configuration.tsx";
import { ZoomButton } from "@/view/audio-annotator/components/buttons/zoom.tsx";
import { PointerPosition } from "@/view/audio-annotator/components/bloc/pointer-position.component.tsx";
import { WorkbenchInfoBloc } from "@/view/audio-annotator/components/bloc/workbench-info.tsx";
import { selectAnnotationFileDuration } from '@/service/dataset';
import { useRetrieveAnnotatorQuery } from '@/service/annotator';
import { useToast } from '@/services/utils/toast.ts';
import { getErrorMessage } from '@/service/function.ts';
import { formatTime } from '@/service/dataset/spectrogram-configuration/scale';
import { OsmoseBarComponent } from '@/components/Layout';
import { DocumentationButton } from "@/components/Buttons/Documentation-button.tsx";

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

  // Service
  const toast = useToast();
  const { data, isLoading, error: retrieveError } = useRetrieveAnnotatorQuery({
    campaignID,
    fileID
  }, { refetchOnMountOrArgChange: true })

  const navKeyPress = useRef<KeypressHandler | null>(null);
  const labelsKeyPress = useRef<KeypressHandler | null>(null);
  const spectrogramRender = useRef<SpectrogramRender | null>(null);

  const [ error, setError ] = useState<string | undefined>();

  // Ref
  const localIsPaused = useRef<boolean>(true);
  const localAreShortcutsEnabled = useRef<boolean>(true);
  const playerRef = useRef<HTMLAudioElement>(null);

  // Services
  const audioService = useAudioService(playerRef)

  // Slice
  const {
    campaign,
    file,
    ui,
    focusedResultID,
    results,
    audio,
  } = useAppSelector(state => state.annotator)
  const duration = useAppSelector(selectAnnotationFileDuration)

  // Memo
  const focusedResult = useMemo(() => {
    return results?.find(r => r.id === focusedResultID);
  }, [ focusedResultID ])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPressed);

    return () => {
      document.removeEventListener("keydown", handleKeyPressed);
      toast.dismiss();
    }
  }, [])

  useEffect(() => {
    if (retrieveError) setError(getErrorMessage(retrieveError));
  }, [ retrieveError ]);

  useEffect(() => {
    localAreShortcutsEnabled.current = ui.areShortcutsEnabled;
  }, [ ui.areShortcutsEnabled ])

  useEffect(() => {
    localIsPaused.current = audio.isPaused;
  }, [ audio.isPaused ])

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
  else if (!data?.label_set || data.label_set.labels.length === 0) return <p>Error: <code>Label set is empty</code></p>
  else if (!data?.spectrogram_configurations || data.spectrogram_configurations.length === 0) return <p>Error: <code>Cannot
    retrieve spectrograms</code></p>
  else if (!file || file.id !== +fileID) return <p>Unknown error while loading task.</p>

  // Rendering
  return (
    <div id="aplose-annotator" className="annotator container-fluid ps-0">

      {/* Header */ }
      <div id="header">
        <h1>APLOSE</h1>

        <div className="buttons">
          <DocumentationButton/>
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

        <div className="col-sm-3"></div>
        <p className="col-sm-2 text-right">
          { formatTime(audio.time) }
          &nbsp;/&nbsp;
          { formatTime(duration) }
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
