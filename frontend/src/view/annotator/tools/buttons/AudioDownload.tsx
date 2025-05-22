import React, { Fragment } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";
import { UserAPI } from "@/service/api/user.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";

export const AudioDownloadButton: React.FC = () => {
  const { data } = useRetrieveAnnotator()
  const { data: user } = UserAPI.endpoints.getCurrentUser.useQuery();

  const download = () => {
    if (!data) return;
    const link = document.createElement('a');
    link.href = data.file.audio_url;
    link.target = '_blank';
    const pathSplit = data.file.audio_url.split('/')
    link.download = pathSplit[pathSplit.length - 1];
    link.click();
  }

  if (!data || !user?.is_staff) return <Fragment/>
  return <IonButton color='medium' size='small' fill='outline'
                    onClick={ download }>
    <IonIcon icon={ downloadOutline } slot="start"/>
    Download audio
  </IonButton>
}