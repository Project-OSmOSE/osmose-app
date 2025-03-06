import React, { useEffect, useMemo } from 'react';
import styles from './Detail.module.scss'
import { useParams } from 'react-router-dom';
import { useRetrieveCampaignQuery } from '@/service/campaign';
import { useGetCurrentUserQuery } from '@/service/user';
import { IonSpinner } from "@ionic/react";
import { FadedText, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { useToast } from "@/service/ui";
import { DetailPageAnnotationTasks } from "./DetailPageAnnotationTasks.tsx";
import { Annotation, Data, Global, Progression } from "@/view/campaign/detail/bloc";

export const CampaignDetail: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const {
    data: campaign,
    isLoading: isLoadingCampaign,
    error: errorLoadingCampaign
  } = useRetrieveCampaignQuery(campaignID);
  const { data: currentUser } = useGetCurrentUserQuery();
  const isOwner = useMemo(() => {
    if (!currentUser) return false;
    return currentUser?.is_staff || currentUser?.is_superuser || campaign?.owner === currentUser?.username
  }, [ currentUser, campaign?.owner ]);

  const toast = useToast();

  useEffect(() => {
    return () => {
      toast.dismiss();
    }
  }, [ campaign?.id ])

  if (isLoadingCampaign) return <IonSpinner/>
  if (errorLoadingCampaign) return <WarningText>{ getErrorMessage(errorLoadingCampaign) }</WarningText>
  if (!campaign) return <WarningText>Fail recovering campaign</WarningText>

  return (
    <div className={ styles.page }>
      <div className={ styles.main }>

        <div className={ styles.header }>
          <h2>{ campaign.name }</h2>
          <FadedText>
            Created on { new Date(campaign.created_at).toLocaleDateString() } by { campaign.owner }
          </FadedText>
        </div>

        { campaign.desc && <div><FadedText>Description</FadedText><p>{ campaign.desc }</p></div> }

        <DetailPageAnnotationTasks campaign={ campaign } isOwner={ isOwner }/>

      </div>

      <div className={ styles.side }>
        <Global/>
        <Data/>
        <Annotation/>
        <Progression/>
      </div>
    </div>
  )
}
