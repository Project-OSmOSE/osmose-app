import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { IonButton, useIonAlert } from "@ionic/react";
import { AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI, useUsersAPI, } from "@/services/api";
import { SpectrogramConfiguration } from "@/types/process-metadata/spectrograms.ts";
import { AudioMetadatum } from "@/types/process-metadata/audio.ts";
import { AnnotationStatus } from "@/types/campaign.ts";

import { DetailCampaignGlobalInformation } from "@/view/campaign/detail/blocs/global-information.component.tsx";
import { DetailCampaignStatus } from "@/view/campaign/detail/blocs/status.component.tsx";
import { DetailCampaignSpectroConfig } from "@/view/campaign/detail/blocs/spectro-config.component.tsx";
import { DetailCampaignAudioMetadata } from "@/view/campaign/detail/blocs/audio-metadata.component.tsx";
import './annotation-campaign-detail.page.css';
import { getDisplayName } from "@/types/user.ts";


export const AnnotationCampaignDetail: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>()
  const history = useHistory();
  const [annotationCampaign, setAnnotationCampaign] = useState<AnnotationCampaignRetrieveCampaign | undefined>(undefined);
  const [annotationStatus, setAnnotationStatus] = useState<Array<AnnotationStatus>>([]);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isCampaignOwner, setIsCampaignOwner] = useState<boolean>(false);
  const [ spectrogramConfigurations, setSpectrogramConfigurations ] = useState<Array<SpectrogramConfiguration>>([]);
  const [audioMetadata, setAudioMetadata] = useState<Array<AudioMetadatum>>([]);

  const isArchived = useMemo(() => !!annotationCampaign?.archive, [annotationCampaign?.archive]);
  const isEditionAllowed = useMemo(() => (isStaff || isCampaignOwner) && !isArchived, [isStaff, isCampaignOwner, isArchived]);

  const campaignService = useAnnotationCampaignAPI();
  const userService = useUsersAPI();
  const [error, setError] = useState<any | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, dismissAlert] = useIonAlert();

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      userService.list(),
      campaignService.retrieve(campaignID),
      userService.isStaff().then(setIsStaff)
    ]).then(([users, data]) => {
      setAnnotationCampaign(data.campaign);

      const status = data.tasks
        .filter(task => task.annotator_id)
        .reduce((array: Array<AnnotationStatus>, value) => {
          const annotator = users.find(u => u.id === value.annotator_id);
          const finished = value.status === 'Finished' ? value.count : 0;
          const total = value.count;
          if (!annotator) return array;
          const currentStatus = array.find(s => s.annotator.id === value.annotator_id);
          if (currentStatus) {
            return [
              ...array.filter(s => s.annotator.id !== value.annotator_id),
              {
                annotator,
                finished: currentStatus.finished + finished,
                total: currentStatus.total + total
              }
            ]
          } else return [...array, { annotator, finished, total }]
        }, [])
      setAnnotationStatus(status);
      setIsCampaignOwner(data.is_campaign_owner);
      setSpectrogramConfigurations(data.spectro_configs);
      setAudioMetadata(data.audio_metadata);
    }).catch(e => {
      if (isCancelled) return;
      setError(e);
    })

    return () => {
      isCancelled = true;
      campaignService.abort();
      userService.abort();
      dismissAlert();
    }
  }, [campaignID])

  const reload = () => {
    campaignService.retrieve(campaignID).then(data => setAnnotationCampaign(data.campaign)).catch(setError);
  }

  const annotate = () => history.push(`/annotation_campaign/${ campaignID }/files`);

  if (error) {
    return (
      <Fragment>
        <h1>Annotation Campaign</h1>
        <p className="error-message">{ error.message }</p>
      </Fragment>
    )
  }
  if (!annotationCampaign) {
    return <h6>Loading Annotation Campaign ...</h6>
  }
  return (
    <div id="detail-campaign">

      <div id="head">
        <h2>{ annotationCampaign.name }</h2>
        { isArchived && <p className="archive-description">Archived
            on { annotationCampaign?.archive?.date.toLocaleDateString() } by { getDisplayName(annotationCampaign?.archive?.by_user) }</p> }
        { !isArchived && annotationCampaign?.my_total > 0 &&
            <IonButton fill="outline" onClick={ annotate }>Annotate</IonButton> }
      </div>

      <DetailCampaignGlobalInformation campaign={ annotationCampaign }
                                       isEditionAllowed={ isEditionAllowed }
                                       annotationStatus={ annotationStatus }
                                       reload={ reload }/>

      <DetailCampaignStatus campaign={ annotationCampaign }
                            setError={ setError }/>

      <DetailCampaignSpectroConfig campaign={ annotationCampaign }
                                   spectroConfigurations={ spectrogramConfigurations }/>

      <DetailCampaignAudioMetadata campaign={ annotationCampaign }
                                   audioMetadata={ audioMetadata }/>

    </div>
  )
}
