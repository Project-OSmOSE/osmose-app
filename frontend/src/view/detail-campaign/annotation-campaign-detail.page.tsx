import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI, useUsersAPI, } from "@/services/api";
import { AnnotationTaskStatus } from "@/types/annotations.ts";
import { IonButton, IonIcon, IonProgressBar } from "@ionic/react";
import { archiveOutline, calendarClear, crop, documents, downloadOutline, people, pricetag } from "ionicons/icons";

import { User } from '@/types/user.ts';

import './annotation-campaign-detail.page.css';

type AnnotationStatus = {
  annotator: User;
  finished: number;
  total: number;
}

export const AnnotationCampaignDetail: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>()
  const [annotationCampaign, setAnnotationCampaign] = useState<AnnotationCampaignRetrieveCampaign | undefined>(undefined);
  const [annotationStatus, setAnnotationStatus] = useState<Array<AnnotationStatus>>([]);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isCampaignOwner, setIsCampaignOwner] = useState<boolean>(false);

  const isArchived = useMemo(() => !!annotationCampaign?.archive, [annotationCampaign?.archive]);
  const isEditionAllowed = useMemo(() => isStaff && isCampaignOwner && !isArchived, [isStaff, isCampaignOwner, isArchived]);

  const campaignService = useAnnotationCampaignAPI();
  const userService = useUsersAPI();
  const [error, setError] = useState<any | undefined>(undefined);

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
          const finished = value.status === AnnotationTaskStatus.finished ? value.count : 0;
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
    }).catch(e => {
      if (isCancelled) return;
      setError(e);
    })

    return () => {
      isCancelled = true;
      campaignService.abort();
      userService.abort();
    }
  }, [campaignID])

  const openEditCampaign = () => {
    if (!annotationCampaign) return;
    window.open(`/annotation_campaign/${ annotationCampaign?.id }/edit`, "_self")
  }

  const archive = async () => {
    if (!annotationCampaign) return;
    await campaignService.archive(annotationCampaign.id);
    window.location.reload();
  }

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
            on { annotationCampaign?.archive?.date.toLocaleDateString() } by { annotationCampaign?.archive?.by_user.display_name }</p> }
      </div>

      <div id="global-info" className="bloc">
        <h5>Global information</h5>

        <div className="item">
          <IonIcon className="icon" icon={ pricetag }/>
          <p className="label">Label set:</p>
          <p>{ annotationCampaign.annotation_set.name }</p>
        </div>

        <div className="item">
          { annotationCampaign.confidence_indicator_set && <Fragment>
              <i className="icon fa fa-handshake"></i>
              <p className="label">Confidence indicator set:</p>
              <p>{ annotationCampaign.confidence_indicator_set.name }</p>
          </Fragment> }
        </div>

        <div className="item">
          <IonIcon className="icon" icon={ documents }/>
          <p className="label">Dataset:</p>
          <p>{ annotationCampaign.datasets_name.join(', ') }</p>
        </div>

        <div className="item">
          <IonIcon className="icon" icon={ people }/>
          <p className="label">Annotators:</p>
          <p>{ [...new Set(annotationStatus.map(s => s.annotator))].length }</p>
        </div>

        <div className="item">
          <IonIcon className="icon" icon={ crop }/>
          <p className="label">Mode:</p>
          <p>{ annotationCampaign.usage }</p>
        </div>

        <div className="item">
          { annotationCampaign.deadline && <Fragment>
              <IonIcon className="icon" icon={ calendarClear }/>
              <p className="label">Deadline:</p>
              <p>{ annotationCampaign.deadline.toLocaleDateString() }</p>
          </Fragment> }
        </div>

        { annotationCampaign.desc && <div className="description">
            <p className="label">Description:</p>
            <p>{ annotationCampaign.desc }</p>
        </div> }

        { isEditionAllowed && <div className="buttons">
            <IonButton color={ "medium" }
                       onClick={ archive }>
                <IonIcon icon={ archiveOutline }/>
                Archive
            </IonButton>
            <IonButton color={ "primary" }
                       onClick={ openEditCampaign }>
                Add annotators
            </IonButton>
        </div> }
      </div>

      <div id="status" className="bloc">
        <div className="head-bloc">
          <h5>Status</h5>

          <div className="buttons">
            <IonButton color="primary"
                       onClick={ () => campaignService.downloadResults(annotationCampaign) }>
              <IonIcon icon={ downloadOutline } slot="start"/>
              Results (csv)
            </IonButton>
            <IonButton color="primary"
                       onClick={ () => campaignService.downloadStatus(annotationCampaign) }>
              <IonIcon icon={ downloadOutline } slot="start"/>
              Task status (csv)
            </IonButton>
          </div>
        </div>

        <div className="table-bloc">
          <div className="table-bloc-head">
            Annotator
          </div>
          <div className="table-bloc-head">
            Annotator
          </div>
          { annotationStatus.map(status => {
            return (
              <Fragment key={ status.annotator?.id }>
                <div className="divider"/>
                <div className="table-bloc-content">{ status.annotator?.display_name }</div>
                <div className="table-bloc-content">
                  <p>{ status.finished } / { status.total }</p>
                  <IonProgressBar color="medium" value={ status.finished / status.total }/>
                </div>
              </Fragment>
            );
          }) }
        </div>
      </div>

    </div>
  )
}
