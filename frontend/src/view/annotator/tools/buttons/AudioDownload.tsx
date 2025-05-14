import React, { Fragment } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";
import { useAnnotatorFile } from "@/service/annotator/hook.ts";
import { UserAPI } from "@/service/api/user.ts";

export const AudioDownloadButton: React.FC = () => {
  const file = useAnnotatorFile()
  const { data: user } = UserAPI.endpoints.getCurrentUser.useQuery();

  const download = () => {
    if (!file?.audio_url) return;
    const link = document.createElement('a');
    link.href = file.audio_url;
    link.target = '_blank';
    const pathSplit = file.audio_url.split('/')
    link.download = pathSplit[pathSplit.length - 1];
    link.click();
  }

  if (!file || !user?.is_staff) return <Fragment/>
  return <IonButton color='medium' size='small' fill='outline'
                    onClick={ download }>
    <IonIcon icon={ downloadOutline } slot="start"/>
    Download audio
  </IonButton>
}