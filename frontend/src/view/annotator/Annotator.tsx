import React, { Fragment, useEffect, useMemo, useRef } from "react";
import styles from './annotator.module.scss';
import { IonSpinner } from "@ionic/react";
import { FadedText, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { AudioPlayer } from "@/view/annotator/tools/AudioPlayer.tsx";
import { AudioDownloadButton } from "@/view/annotator/tools/buttons/AudioDownload.tsx";
import { useAppSelector } from "@/service/app.ts";
import { formatTime } from "@/service/dataset/spectrogram-configuration/scale";
import { NFFTSelect } from "@/view/annotator/tools/select/NFFTSelect.tsx";
import { ColormapConfiguration } from '@/view/annotator/tools/select/ColormapConfiguration.tsx';
import { SpectrogramImage } from '@/view/annotator/tools/input/SpectrogramImage.tsx';
import { ZoomButton } from "@/view/annotator/tools/buttons/Zoom.tsx";
import { SpectrogramRender } from "@/view/annotator/tools/spectrogram/SpectrogramRender.tsx";
import { SpectrogramDownloadButton } from "@/view/annotator/tools/buttons/SpectrogramDownload.tsx";
import { PlayPauseButton } from "@/view/annotator/tools/buttons/PlayPause.tsx";
import { NavigationButtons } from "@/view/annotator/tools/buttons/Navigation.tsx";
import { CurrentAnnotation } from "@/view/annotator/tools/bloc/CurrentAnnotation.tsx";
import { Comment } from "@/view/annotator/tools/bloc/Comment.tsx";
import { ConfidenceIndicator } from "@/view/annotator/tools/bloc/ConfidenceIndicator.tsx";
import { Results } from "@/view/annotator/tools/bloc/Results.tsx";
import { PlaybackRateSelect } from "@/view/annotator/tools/select/PlaybackRate.tsx";
import { useCurrentConfiguration } from '@/service/annotator/spectrogram';
import { Labels } from "@/view/annotator/tools/bloc/Labels.tsx";
import { Colormap } from '@/service/ui/color.ts';
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useRetrieveCurrentPhase } from "@/service/api/campaign-phase.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";

export const Annotator: React.FC = () => {
  const { campaign } = useRetrieveCurrentCampaign()
  const { phase } = useRetrieveCurrentPhase()
  const { colormap } = useAppSelector(state => state.annotator.userPreferences);
  const currentConfiguration = useCurrentConfiguration();
  const { isFetching, error, data } = useRetrieveAnnotator()
  const colormapClass: Colormap = useMemo(() => {
    if (!currentConfiguration) return "Greys";
    if (currentConfiguration.colormap !== "Greys") return currentConfiguration.colormap;
    return colormap ?? "Greys";
  }, [ colormap, currentConfiguration ]);

  // State
  const pointerPosition = useAppSelector(state => state.annotator.ui.pointerPosition);
  const audio = useAppSelector(state => state.annotator.audio)
  const isEditable = useMemo(() => !campaign?.archive && !phase?.ended_by && data?.is_assigned, [ campaign, phase, data ])

  // Refs
  const localIsPaused = useRef<boolean>(true);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const spectrogramRenderRef = useRef<SpectrogramRender | null>(null);

  useEffect(() => {
    localIsPaused.current = audio.isPaused;
  }, [ audio.isPaused ])

  return <div className={ [ styles.annotator, colormapClass ].join(' ') }>

    { isFetching && <IonSpinner/> }
    { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

    <AudioPlayer ref={ audioPlayerRef }/>

    { !isFetching && data && <Fragment>
        <div className={ styles.spectrogramContainer }>
            <div className={ styles.spectrogramData }>
                <div className={ styles.spectrogramInfo }>
                    <NFFTSelect/>
                    <ColormapConfiguration/>
                    <SpectrogramImage/>
                    <ZoomButton/>
                </div>

                <div className={ styles.pointerInfo }>
                  { pointerPosition && <Fragment>
                      <FadedText>Pointer</FadedText>
                      <p>{ pointerPosition.frequency.toFixed(2) }Hz
                          / { formatTime(pointerPosition.time, data.file.duration < 60) }</p>

                  </Fragment> }
                </div>

                <div className={ styles.campaignInfo }>
                    <div>
                        <FadedText>Sampling:</FadedText>
                        <p>{ data.file.dataset_sr }Hz</p>
                    </div>
                    <div>
                        <FadedText>Date:</FadedText>
                        <p>{ new Date(data.file.start).toUTCString() }</p>
                    </div>
                </div>
            </div>

            <SpectrogramRender ref={ spectrogramRenderRef } audioPlayer={ audioPlayerRef }/>

            <div className={ styles.spectrogramNavigation }>
                <div className={ styles.audioNavigation }>
                    <PlayPauseButton player={ audioPlayerRef }/>
                    <PlaybackRateSelect player={ audioPlayerRef }/>
                </div>

                <NavigationButtons/>

                <p>{ formatTime(audio.time, data.file.duration < 60) }&nbsp;/&nbsp;{ formatTime(data.file.duration) }</p>
            </div>
        </div>

        <div
            className={ styles.blocContainer }>
          { isEditable && <Fragment>
              <CurrentAnnotation/>
              <Labels/>
              <ConfidenceIndicator/>
              <Comment/>
              <Results onSelect={ r => spectrogramRenderRef.current?.onResultSelected(r) }/>
          </Fragment> }
        </div>

        <div className={ styles.downloadButtons }>
            <AudioDownloadButton/>
            <SpectrogramDownloadButton render={ spectrogramRenderRef }/>
        </div>
    </Fragment> }

  </div>
}