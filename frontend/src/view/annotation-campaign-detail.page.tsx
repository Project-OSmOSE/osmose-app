import React, { useEffect, useState, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import {
  AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI,
} from "../services/api";
import { AnnotationTaskStatus } from "@/types/annotations.ts";
import { IonButton } from "@ionic/react";

import { User } from '@/types/userInterface.ts';
import { useUsersAPI } from '@/services/api';

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
    window.open(`/app/annotation_campaign/${ annotationCampaign?.id }/edit`, "_self")
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
    <Fragment>
      <h1 className="text-center">{ annotationCampaign.name }</h1>
      <div className="row justify-content-around">
        <div>
          <div>
            <b>Annotation set:</b> { annotationCampaign.annotation_set.name }
          </div>
          <div>
            <b>Confidence Indicator
              set:</b> { annotationCampaign.confidence_indicator_set ? annotationCampaign.confidence_indicator_set.name : "-" }
          </div>
        </div>
        <div>
          <div>
            <b>Start:</b> { annotationCampaign.start ? new Date(annotationCampaign.start).toLocaleDateString() : 'N/A' }
          </div>
          <div>
            <b>End:</b> { annotationCampaign.end ? new Date(annotationCampaign.end).toLocaleDateString() : 'N/A' }
          </div>
        </div>
      </div>
      <div className="col-sm-12 border rounder">
        <center><h3>Description</h3></center>
        { annotationCampaign.desc }
      </div>
      <br/>
      { isStaff && <div className="d-flex justify-content-center">
          <IonButton color={ "primary" }
                     onClick={ openEditCampaign }>
              Add annotators
          </IonButton>
      </div> }
      <table className="table table-bordered">
        <thead className="text-center">
        <tr>
          <th>Annotator</th>
          <th>Progress</th>
        </tr>
        </thead>
        <tbody>
        { annotationStatus.map(status => {
          return (
            <tr key={ status.annotator?.id }>
              <td className="text-center">{ status.annotator?.email }</td>
              <td className="text-center">{ status.finished } / { status.total }</td>
            </tr>
          );
        }) }
        </tbody>
      </table>

      <div className="d-flex justify-content-center gap-1 flex-wrap">
        <IonButton color="primary"
                   onClick={ () => campaignService.downloadResults(annotationCampaign) }>
          Download CSV results
        </IonButton>
        <IonButton color="primary"
                   onClick={ () => campaignService.downloadStatus(annotationCampaign) }>
          Download CSV task status
        </IonButton>
      </div>
    </Fragment>
  )
}
