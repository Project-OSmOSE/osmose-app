import React, { Fragment } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";
import { useParams } from "react-router-dom";
import { useRetrieveAnnotatorQuery } from "@/service/annotator";
import { useGetCurrentUserQuery } from "@/service/user";

export const AudioDownloadButton: React.FC = () => {
  const params = useParams<{ campaignID: string, fileID: string }>();
  const { data } = useRetrieveAnnotatorQuery(params)
  const { data: user } = useGetCurrentUserQuery()

  const download = () => {
    if (!data?.file.audio_url) return;
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