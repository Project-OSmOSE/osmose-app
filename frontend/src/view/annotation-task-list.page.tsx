import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AnnotationCampaignRetrieveCampaign,
  AnnotationTaskList as List,
  useAnnotationCampaignAPI,
  useAnnotationTaskAPI
} from "../services/api";
import { AnnotationTaskStatus } from "../enum/annotation.enum.tsx";
import { ANNOTATOR_GUIDE_URL } from "../consts/links.const.tsx";
import { IonButton, IonIcon } from "@ionic/react";
import { helpCircle, informationCircle } from "ionicons/icons";

export const AnnotationTaskList: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<AnnotationCampaignRetrieveCampaign | undefined>(undefined);
  const [tasks, setTasks] = useState<List | undefined>(undefined);

  const taskService = useAnnotationTaskAPI();
  const campaignService = useAnnotationCampaignAPI();
  const [error, setError] = useState<any | undefined>(undefined);

  useEffect(() => {
    document.body.scrollTo({ top: 0, behavior: 'instant' })
    let isCanceled = false;

    setError(undefined);
    Promise.all([
      taskService.list(campaignID).then(setTasks),
      campaignService.retrieve(campaignID).then(data => setCampaign(data.campaign)),
    ]).catch(e => {
      if (isCanceled) return;
      setError(e);
      throw e
    })

    return () => {
      isCanceled = true;
      taskService.abort();
      campaignService.abort();
    }
  }, [campaignID]);

  const openGuide = () => {
    window.open(ANNOTATOR_GUIDE_URL, "_blank", "noopener, noreferrer")
  }

  const openInstructions = () => {
    if (!campaign?.instructions_url) return;
    window.open(campaign.instructions_url, "_blank", "noopener, noreferrer")
  }


  if (error) {
    return (
      <div className="col-sm-9 border rounded">
        <h1>Annotation Tasks</h1>
        <p className="error-message">{ error.message }</p>
      </div>
    )
  }

  return (
    <div className="col-sm-9 border rounded">
      <h1 className="text-center">Annotation Tasks</h1>

      <div className="d-flex justify-content-center gap-1 flex-wrap">
        <IonButton color="warning" onClick={ openGuide }>
          <IonIcon icon={ helpCircle } slot="start"/>
          Annotator user guide
        </IonButton>
        { campaign?.instructions_url && <IonButton color="warning" onClick={ openInstructions }>
            <IonIcon icon={ informationCircle } slot="start"/>
            Campaign instructions
        </IonButton> }
      </div>
      <table className="table table-bordered">
        <thead>
        <tr>
          <th>Filename</th>
          <th>Dataset</th>
          <th>Date</th>
          <th>Duration</th>
          <th>Status</th>
          <th>Link</th>
        </tr>
        </thead>
        <tbody>
        { tasks?.map(task => {
          const startDate = new Date(task.start);
          const diffTime = new Date(new Date(task.end).getTime() - startDate.getTime());
          return (<tr className={ task.status === AnnotationTaskStatus.finished ? 'table-success' : 'table-warning' }
                      key={ task.id }>
            <td>{ task.filename }</td>
            <td>{ task.dataset_name }</td>
            <td>{ startDate.toLocaleDateString() }</td>
            <td>{ diffTime.toUTCString().split(' ')[4] }</td>
            <td>{ task.status === AnnotationTaskStatus.finished ? 'Finished' : (task.status === AnnotationTaskStatus.started ? 'Started' : 'Created') }</td>
            <td><Link to={ `/audio-annotator/${ task.id }` }>Task link</Link></td>
          </tr>)
        }) }
        </tbody>
      </table>
    </div>
  )
}
