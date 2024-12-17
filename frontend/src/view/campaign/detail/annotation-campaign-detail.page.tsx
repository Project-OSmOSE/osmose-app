import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IonButton } from "@ionic/react";
import { DetailCampaignGlobalInformation } from "@/view/campaign/detail/blocs/global-information.component.tsx";
import { DetailCampaignStatus } from "@/view/campaign/detail/blocs/status.component.tsx";
import { DetailCampaignSpectrogramConfiguration } from "@/view/campaign/detail/blocs/spectro-config.component.tsx";
import { DetailCampaignAudioMetadata } from "@/view/campaign/detail/blocs/audio-metadata.component.tsx";
import './annotation-campaign-detail.page.css';
import { getDisplayName, useGetCurrentUserQuery, useListUsersQuery, User } from '@/service/user';
import { selectCurrentCampaign, useRetrieveCampaignQuery } from '@/service/campaign';
import { useListAnnotationFileRangeQuery } from '@/service/campaign/annotation-file-range';
import { useToast } from '@/services/utils/toast.ts';
import { getErrorMessage } from '@/service/function.ts';
import { useAppSelector } from '@/service/app.ts';


export const AnnotationCampaignDetail: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>()

  // State
  const [ annotatorsStatus, setAnnotatorsStatus ] = useState<Map<string, {
    total: number,
    progress: number
  }>>(new Map());
  const [ campaignErrorMessage, setCampaignErrorMessage ] = useState<string | undefined>();
  const campaign = useAppSelector(selectCurrentCampaign)

  // Services
  const history = useHistory();
  const { presentError, dismiss: dismissToast } = useToast();
  const { error: campaignError } = useRetrieveCampaignQuery(campaignID, { refetchOnMountOrArgChange: true });
  const { data: users, error: userError } = useListUsersQuery();
  const { data: currentUser, error: currentUserError } = useGetCurrentUserQuery();
  const {
    data: fileRanges,
    error: fileRangeError
  } = useListAnnotationFileRangeQuery({ campaignID }, { refetchOnMountOrArgChange: true });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isOwner = useMemo(() => {
    return currentUser?.is_staff || currentUser?.is_superuser || campaign?.owner === currentUser?.username
  }, [ currentUser, campaign?.owner ]);
  const isEditionAllowed = useMemo(() => isOwner && !campaign?.archive, [ currentUser, campaign?.owner, campaign?.archive ]);

  useEffect(() => {
    if (!fileRanges) return;
    if (!users) return;
    const map = new Map<string, { total: number, progress: number }>()
    for (const range of fileRanges) {
      const annotator = getDisplayName(users?.find((u: User) => u.id === range.annotator));
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
  }, [ fileRanges, users ]);

  useEffect(() => {
    return () => {
      dismissToast();
    }
  }, []);

  useEffect(() => {
    if (campaignError) setCampaignErrorMessage(getErrorMessage(campaignError))
    if (userError) presentError(getErrorMessage(userError))
    if (currentUserError) presentError(getErrorMessage(currentUserError))
    if (fileRangeError) presentError(getErrorMessage(fileRangeError))
  }, [ campaignError, userError, currentUserError, fileRangeError ]);

  const annotate = () => history.push(`/annotation-campaign/${ campaignID }/file`);

  if (campaignErrorMessage) {
    return (
      <Fragment>
        <h1>Annotation Campaign</h1>
        <p className="error-message">{ campaignErrorMessage }</p>
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

      <DetailCampaignGlobalInformation isEditionAllowed={ isEditionAllowed }
                                       annotatorsStatus={ annotatorsStatus }/>

      <DetailCampaignStatus isOwner={ isOwner }
                            isEditionAllowed={ isEditionAllowed }
                            annotatorsStatus={ annotatorsStatus }/>

      <DetailCampaignSpectrogramConfiguration isOwner={ isOwner }/>

      <DetailCampaignAudioMetadata isOwner={ isOwner }/>

    </div>
  )
}
