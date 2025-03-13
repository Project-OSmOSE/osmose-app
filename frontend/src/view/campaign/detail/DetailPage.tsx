import React, { Fragment, useCallback, useEffect, useMemo } from 'react';
import styles from './Detail.module.scss'
import { useParams } from 'react-router-dom';
import { useRetrieveCampaignQuery } from '@/service/campaign';
import { getDisplayName, useGetCurrentUserQuery } from '@/service/user';
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { FadedText, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { useToast } from "@/service/ui";
import { DetailPageAnnotationTasks } from "./DetailPageAnnotationTasks.tsx";
import { Annotation, Data, Global, Progression } from "@/view/campaign/detail/bloc";
import { mailOutline } from "ionicons/icons";

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
    return currentUser?.is_staff || currentUser?.is_superuser || campaign?.owner?.id === currentUser?.id
  }, [ currentUser, campaign?.owner ]);

  const toast = useToast();

  useEffect(() => {
    return () => {
      toast.dismiss();
    }
  }, [ campaign?.id ])

  const copyOwnerMail = useCallback(async () => {
    if (!campaign) return;
    await navigator.clipboard.writeText(campaign.owner.email)
    toast.presentSuccess(`Successfully copy ${getDisplayName(campaign.owner)} email address into the clipboard`)
  }, [ campaign?.owner.email ])

  if (isLoadingCampaign) return <IonSpinner/>
  if (errorLoadingCampaign) return <WarningText>{ getErrorMessage(errorLoadingCampaign) }</WarningText>
  if (!campaign) return <WarningText>Fail recovering campaign</WarningText>

  return (
    <div className={ styles.page }>
      <div className={ styles.main }>

        <div className={ styles.header }>
          <h2>{ campaign.name }</h2>
          <FadedText>
            Created on { new Date(campaign.created_at).toLocaleDateString() } by { getDisplayName(campaign.owner) }
            { campaign.owner.email && <Fragment>
                &nbsp;
                <IonButton fill='clear' color='medium' size='small'
                           onClick={ copyOwnerMail } data-tooltip={ campaign.owner.email }>
                    <IonIcon icon={ mailOutline } slot='icon-only'/>
                </IonButton>
            </Fragment> }
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
