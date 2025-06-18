import React, { Fragment, MutableRefObject, useState } from "react";
import { useAppSelector } from '@/service/app';
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";
import { SpectrogramRender } from "@/view/annotator/tools/spectrogram/SpectrogramRender.tsx";
import { UserAPI } from "@/service/api/user.ts";
import { useRetrieveAnnotator } from "@/service/api/annotator.ts";

export const SpectrogramDownloadButton: React.FC<{
  render: MutableRefObject<SpectrogramRender | null>
}> = ({ render }) => {
  const { data } = useRetrieveAnnotator()
  const { data: user } = UserAPI.endpoints.getCurrentUser.useQuery();

  const [ isLoading, setIsLoading ] = useState<boolean>(false);

  const {
    userPreferences
  } = useAppSelector(state => state.annotator);

  const download = async () => {
    if (!data) return;
    const link = document.createElement('a');
    setIsLoading(true);
    const canvasData = await render.current?.getCanvasData().catch(e => {
      console.warn(e);
      setIsLoading(false)
    });
    if (!canvasData) return;
    link.href = canvasData;
    link.target = '_blank';
    let pathSplit = data.file.audio_url.split('/')
    pathSplit = pathSplit[pathSplit.length - 1].split('.');
    pathSplit.pop(); // Remove audio file extension
    const filename = pathSplit.join('.');
    link.download = `${ filename }-x${ userPreferences.zoomLevel }.png`;
    link.click();
    setIsLoading(false);
  }

  if (!data || !user?.is_staff) return <Fragment/>
  return <IonButton color='medium' size='small' fill='outline'
                    onClick={ download }>
    <IonIcon icon={ downloadOutline } slot="start"/>
    Download spectrogram (zoom x{ userPreferences.zoomLevel })
    { isLoading && <IonSpinner/> }
  </IonButton>
}