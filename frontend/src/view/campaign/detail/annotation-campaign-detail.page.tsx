import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IonButton, useIonAlert } from "@ionic/react";
import {
  AnnotationCampaign,
  useAnnotationCampaignAPI,
  useAnnotationFileRangeAPI,
  User,
  useUsersAPI,
} from "@/services/api";

import { DetailCampaignGlobalInformation } from "@/view/campaign/detail/blocs/global-information.component.tsx";
import { DetailCampaignStatus } from "@/view/campaign/detail/blocs/status.component.tsx";
import { DetailCampaignSpectrogramConfiguration } from "@/view/campaign/detail/blocs/spectro-config.component.tsx";
import { DetailCampaignAudioMetadata } from "@/view/campaign/detail/blocs/audio-metadata.component.tsx";
import { getDisplayName } from "@/types/user.ts";
import './annotation-campaign-detail.page.css';


export const AnnotationCampaignDetail: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>()

  // State
  const [ campaign, setCampaign ] = useState<AnnotationCampaign | undefined>(undefined);
  const [ currentUser, setCurrentUser ] = useState<User | undefined>(undefined);
  const [ annotatorsStatus, setAnnotatorsStatus ] = useState<Map<string, {
    total: number,
    progress: number
  }>>(new Map());

  // Services
  const history = useHistory();
  const isOwner = useMemo(() => {
    return currentUser?.is_staff || currentUser?.is_superuser || campaign?.owner === currentUser?.username
  }, [ currentUser, campaign?.owner ]);
  const isEditionAllowed = useMemo(() => isOwner && !campaign?.archive, [ currentUser, campaign?.owner ]);

  const campaignService = useAnnotationCampaignAPI();
  const userService = useUsersAPI();
  const fileRangeService = useAnnotationFileRangeAPI();
  const [ error, setError ] = useState<any | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ _, dismissAlert ] = useIonAlert();

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      fileRangeService.listForCampaign(campaignID),
      userService.list(),
      campaignService.retrieve(campaignID).then(setCampaign),
      userService.self().then(setCurrentUser)
    ]).then(([ ranges, users ]) => {
      const map = new Map<string, { total: number, progress: number }>()
      for (const range of ranges) {
        const annotator = getDisplayName(users.find((u: User) => u.id === range.annotator));
        if (map.get(annotator)) {
          map.get(annotator)!.total += range.last_file_index - range.first_file_index + 1;
          map.get(annotator)!.progress += range.finished_tasks_count;
        } else {
          map.set(annotator, {
            total: range.last_file_index - range.first_file_index + 1,
            progress: range.finished_tasks_count,
          })
        }
      }
      setAnnotatorsStatus(map)
    }).catch(e => !isCancelled && setError(e));

    return () => {
      isCancelled = true;
      campaignService.abort();
      userService.abort();
      dismissAlert();
    }
  }, [ campaignID ])

  const annotate = () => history.push(`/annotation-campaign/${ campaignID }/file`);

  if (error) {
    return (
      <Fragment>
        <h1>Annotation Campaign</h1>
        <p className="error-message">{ error.message }</p>
      </Fragment>
    )
  }
  if (!campaign) {
    return <h6>Loading Annotation Campaign ...</h6>
  }
  return (
    <div id="detail-campaign">

      <div id="head">
        <h2>{ campaign.name }</h2>
        { campaign.archive && <p className="archive-description">Archived
            on { new Date(campaign.archive.date).toLocaleDateString() } by { getDisplayName(campaign?.archive?.by_user) }</p> }
        { !campaign.archive && <p className="archive-description">Created
            on { new Date(campaign.created_at).toLocaleDateString() } by { campaign?.owner }</p> }
        { !campaign.archive && campaign?.my_total > 0 &&
            <IonButton fill="outline" onClick={ annotate }>Annotate</IonButton> }
      </div>

      <DetailCampaignGlobalInformation campaign={ campaign }
                                       isEditionAllowed={ isEditionAllowed }
                                       annotatorsStatus={ annotatorsStatus }
                                       setCampaign={ setCampaign }
                                       setError={ setError }/>

      <DetailCampaignStatus campaign={ campaign }
                            isOwner={ isOwner }
                            isEditionAllowed={ isEditionAllowed }
                            annotatorsStatus={ annotatorsStatus }/>

      <DetailCampaignSpectrogramConfiguration isOwner={ isOwner } campaign={ campaign } setError={ setError }/>

      <DetailCampaignAudioMetadata isOwner={ isOwner } campaign={ campaign } setError={ setError }/>

    </div>
  )
}
