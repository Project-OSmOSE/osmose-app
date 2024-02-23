import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnnotationCampaignAPI, AnnotationCampaignList as List } from "../services/api";
import { ANNOTATOR_GUIDE_URL } from "../consts/links.const.tsx";
import { IonButton, IonIcon } from "@ionic/react";
import { addOutline, helpCircle } from "ionicons/icons";


export const AnnotationCampaignList: React.FC = () => {
  const [annotationCampaigns, setAnnotationCampaigns] = useState<List>([]);

  const campaignService = useAnnotationCampaignAPI();
  const [error, setError] = useState<any | undefined>(undefined);

  useEffect(() => {
    let isCanceled = false;

    setError(undefined);
    campaignService.list().then(setAnnotationCampaigns).catch(e => {
      if (isCanceled) return;
      setError(e);
      throw e
    })

    return () => {
      isCanceled = true;
      campaignService.abort();
    }
  }, []);

  const openGuide = () => {
    window.open(ANNOTATOR_GUIDE_URL, "_blank", "noopener, noreferrer")
  }

  const openNewCampaign = () => {
    window.open("/create-annotation-campaign", "_self")
  }

  if (error) return (
    <div className="col-sm-10 border rounded">
      <h1>Annotation Campaigns</h1>
      <p className="error-message">{ error.message }</p>
    </div>
  )

  return (
    <div className="col-sm-10 border rounded">
      <h1 className="text-center">Annotation Campaigns</h1>

      <div className="d-flex justify-content-center gap-1 flex-wrap">
        <IonButton color="primary" onClick={ openNewCampaign }>
          <IonIcon icon={ addOutline } slot="start"/>
          New annotation campaign
        </IonButton>
        <IonButton color="warning" onClick={ openGuide }>
          <IonIcon icon={ helpCircle } slot="start"/>
          Annotator user guide
        </IonButton>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
          <tr>
            <th>Name</th>
            <th>Created at</th>
            <th>Annotation Set</th>
            <th>Confidence indicator Set</th>
            <th>Number of files</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Progress</th>
            <th>Mode</th>
            <th>Annotation Link</th>
          </tr>
          </thead>
          <tbody>
          { annotationCampaigns.map(campaign => (
            <tr key={ campaign.id }>
              <td><Link to={ `/annotation_campaign/${ campaign.id }` }>{ campaign.name }</Link></td>
              <td>{ campaign.created_at.toDateString() }</td>
              <td>{ campaign.annotation_set_name ?? "-" }</td>
              <td>{ campaign.confidence_indicator_set_name ?? "-" }</td>
              <td>{ campaign.files_count }</td>
              <td>{ campaign.start?.toDateString() ?? 'N/A' }</td>
              <td>{ campaign.end?.toDateString() ?? 'N/A' }</td>
              <td>{ campaign.user_complete_tasks_count } / { campaign.user_tasks_count }</td>
              <td>{ campaign.mode }</td>
              <td><Link to={ `/annotation_tasks/${ campaign.id }` }>My tasks</Link></td>
            </tr>
          )) }
          </tbody>
        </table>
      </div>
    </div>
  )
}
