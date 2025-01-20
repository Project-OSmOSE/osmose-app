import React, { Fragment, useEffect, useMemo, useRef } from "react";
import styles from './annotator.module.scss';
import { useParams } from "react-router-dom";
import { useRetrieveAnnotatorQuery } from "@/service/annotator";
import { IonSpinner } from "@ionic/react";
import { FadedText, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { AudioPlayer } from "@/view/annotator/tools/AudioPlayer.tsx";
import { AudioDownloadButton } from "@/view/annotator/tools/buttons/AudioDownload.tsx";
import { useAppSelector } from "@/service/app.ts";
import { formatTime } from "@/service/dataset/spectrogram-configuration/scale";
import { NFFTSelect } from "@/view/annotator/tools/select/NFFTSelect.tsx";
import { ZoomButton } from "@/view/annotator/tools/buttons/Zoom.tsx";
import { SpectrogramRender } from "@/view/annotator/tools/spectrogram/SpectrogramRender.tsx";
import { SpectrogramDownloadButton } from "@/view/annotator/tools/buttons/SpectrogramDownload.tsx";
import { PlayPauseButton } from "@/view/annotator/tools/buttons/PlayPause.tsx";
import { getDuration } from "@/service/dataset";
import { KeypressHandler, NavigationButtons } from "@/view/annotator/tools/buttons/Navigation.tsx";
import { PresenceAbsence } from "@/view/annotator/tools/bloc/PresenceAbsence.tsx";
import { LabelList } from "@/view/annotator/tools/bloc/LabelList.tsx";
import { CurrentAnnotation } from "@/view/annotator/tools/bloc/CurrentAnnotation.tsx";
import { Comment } from "@/view/annotator/tools/bloc/Comment.tsx";
import { ConfidenceIndicator } from "@/view/annotator/tools/bloc/ConfidenceIndicator.tsx";
import { Results } from "@/view/annotator/tools/bloc/Results.tsx";
import { PlaybackRateSelect } from "@/view/annotator/tools/select/PlaybackRate.tsx";
import { useToast } from "@/services/utils/toast.ts";
import { useAudioService } from "@/services/annotator/audio.service.ts";

export const Annotator: React.FC = () => {
  const { campaignID, fileID } = useParams<{ campaignID: string, fileID: string }>();
  const { isFetching, error, data } = useRetrieveAnnotatorQuery({
    campaignID,
    fileID
  }, { refetchOnMountOrArgChange: true })

  // State
  const pointerPosition = useAppSelector(state => state.annotator.ui.pointerPosition);
  const audio = useAppSelector(state => state.annotator.audio)
  const duration = useMemo(() => getDuration(data?.file), [ data?.file ]);

  // Refs
  const localAreShortcutsEnabled = useRef<boolean>(true);
  const localIsPaused = useRef<boolean>(true);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const spectrogramRenderRef = useRef<SpectrogramRender | null>(null);
  const navigationRef = useRef<KeypressHandler | null>(null);
  const presenceAbsenceRef = useRef<KeypressHandler | null>(null);

  // Services
  const audioService = useAudioService(audioPlayerRef)
  const toast = useToast();

  // Slice
  const {
    ui,
    focusedResultID,
    results
  } = useAppSelector(state => state.annotator)

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
    navigationRef.current?.handleKeyPressed(event);
    presenceAbsenceRef.current?.handleKeyPressed(event);
  }

  return <div className={ styles.annotator }>

    { isFetching && <IonSpinner/> }
    { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

    <AudioPlayer ref={ audioPlayerRef }/>

    { !isFetching && data && <Fragment>
        <div className={ styles.spectrogramContainer }>
            <div className={ styles.spectrogramData }>
                <div className={ styles.spectrogramInfo }>
                    <NFFTSelect/>
                    <ZoomButton/>
                </div>

                <div className={ styles.pointerInfo }>
                  { pointerPosition && <Fragment>
                      <FadedText>Pointer</FadedText>
                      <p>{ pointerPosition.frequency.toFixed(2) }Hz / { formatTime(pointerPosition.time, false) }</p>

                  </Fragment> }
                </div>

                <div className={ styles.campaignInfo }>
                    <div>
                        <FadedText>Sampling:</FadedText>
                        <p>{ data.file.dataset_sr }Hz</p>
                    </div>
                    <div>
                        <FadedText>Date:</FadedText>
                        <p>{ new Date(data.file.start).toLocaleString() }</p>
                    </div>
                </div>
            </div>

            <SpectrogramRender ref={ spectrogramRenderRef } audioPlayer={ audioPlayerRef }/>

            <div className={ styles.spectrogramNavigation }>
                <div className={ styles.audioNavigation }>
                    <PlayPauseButton player={ audioPlayerRef }/>
                    <PlaybackRateSelect player={ audioPlayerRef }/>
                </div>

                <NavigationButtons ref={ navigationRef }/>

                <p>{ formatTime(audio.time) }&nbsp;/&nbsp;{ formatTime(duration) }</p>
            </div>
        </div>

        <div className={ styles.blocContainer }>
          { data?.campaign.usage === 'Create' && <Fragment>
              <CurrentAnnotation/>
              <PresenceAbsence ref={ presenceAbsenceRef }/>
              <LabelList/>
              <Comment/>
              <Results/>
              <ConfidenceIndicator/>
          </Fragment> }
          { data?.campaign.usage === 'Check' && <Fragment>
              <CurrentAnnotation/>
              <Comment/>
              <Results/>
          </Fragment> }
        </div>

        <div className={ styles.downloadButtons }>
            <AudioDownloadButton/>
            <SpectrogramDownloadButton render={ spectrogramRenderRef }/>
        </div>
    </Fragment> }

  </div>
}