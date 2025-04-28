import React, { Fragment } from "react";
import { useAppSelector } from "@/service/app.ts";
import { IonNote } from "@ionic/react";
import { CampaignAPI } from "@/service/campaign";

export const LoadInformation: React.FC = () => {
  const { data: campaign } = CampaignAPI.useRetrieveQuery();
  const { file } = useAppSelector(state => state.resultImport)

  if (file.state === 'loaded') return <Fragment/>;
  return <IonNote color="medium">
    The imported CSV should only contain annotations related to this campaign
    dataset: { campaign?.datasets.join(', ') }
  </IonNote>
}