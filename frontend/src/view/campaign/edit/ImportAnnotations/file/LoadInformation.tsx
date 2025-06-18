import React, { Fragment } from "react";
import { useAppSelector } from "@/service/app.ts";
import { IonNote } from "@ionic/react";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";

export const LoadInformation: React.FC = () => {
  const { campaign } = useRetrieveCurrentCampaign();
  const { file } = useAppSelector(state => state.resultImport)

  if (file.state === 'loaded') return <Fragment/>;
  return <IonNote color="medium">
    The imported CSV should only contain annotations related to this campaign
    dataset: { campaign?.datasets.join(', ') }
  </IonNote>
}