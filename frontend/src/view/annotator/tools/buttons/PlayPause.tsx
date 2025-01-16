import React, { MutableRefObject } from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import { useAppSelector } from '@/service/app';
import { useAudioService } from "@/services/annotator/audio.service.ts";
import { IonButton, IonIcon } from "@ionic/react";
import { pause, play } from "ionicons/icons";
import { Kbd } from "@/components/ui/Kbd.tsx";
import Tooltip from "react-bootstrap/Tooltip";

export const PlayPauseButton: React.FC<{ player: MutableRefObject<HTMLAudioElement | null> }> = ({ player }) => {
  const {
    isPaused,
  } = useAppSelector(state => state.annotator.audio);
  const audioService = useAudioService(player)

  return <OverlayTrigger overlay={ <Tooltip><Kbd keys='space' /></Tooltip> }>
    <IonButton color={ "primary" }
               shape={ "round" }
               onClick={ () => audioService.playPause() }>
      { isPaused && <IonIcon icon={ play } slot={ "icon-only" }/> }
      { !isPaused && <IonIcon icon={ pause } slot={ "icon-only" }/> }
    </IonButton>
  </OverlayTrigger>
}