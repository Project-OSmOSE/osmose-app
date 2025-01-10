import React, { Fragment, useRef } from "react";
import styles from './annotator.module.scss';
import { useParams } from "react-router-dom";
import { useRetrieveAnnotatorQuery } from "@/service/annotator";
import { IonSpinner } from "@ionic/react";
import { FadedText, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { AudioPlayer } from "@/view/annotator/tools/AudioPlayer.tsx";
import { AudioDownloadButton } from "@/view/annotator/tools/buttons/audio-download.tsx";
import { SpectroRender } from "@/view/annotator/tools/spectrogram/SpectrogramRender.tsx";
import { useAppSelector } from "@/service/app.ts";
import { formatTime } from "@/service/dataset/spectrogram-configuration/scale";
import { NFFTSelect } from "@/view/annotator/tools/select/NFFTSelect.tsx";

export const Annotator: React.FC = () => {
  const { campaignID, fileID } = useParams<{ campaignID: string, fileID: string }>();
  const { isFetching, error, data } = useRetrieveAnnotatorQuery({
    campaignID,
    fileID
  }, { refetchOnMountOrArgChange: true })

  // State
  const pointerPosition = useAppSelector(state => state.annotator.ui.pointerPosition);

  // Refs
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  return <div className={ styles.annotator }>

    { isFetching && <IonSpinner/> }
    { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

    <AudioPlayer ref={ audioPlayerRef }/>

    { !isFetching && data && <Fragment>
        <div className={ styles.spectrogramContainer }>
            <div className={ styles.spectrogramData }>
                <div className={ styles.spectrogramInfo }>
                    <NFFTSelect/>
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

            <SpectroRender audioPlayer={ audioPlayerRef }/>

            <div className={ styles.spectrogramNavigation }></div>
        </div>

        <div className={ styles.downloadButtons }>
            <AudioDownloadButton/>
        </div>
    </Fragment> }

  </div>
}