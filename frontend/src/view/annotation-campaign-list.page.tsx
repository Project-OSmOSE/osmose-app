import React, { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { addOutline, helpCircle } from "ionicons/icons";
import { useAnnotationCampaignAPI, AnnotationCampaignList as List } from "@/services/api";
import { useToast } from "@/services/utils/toast";
import { ANNOTATOR_GUIDE_URL } from "@/consts/links";


export const AnnotationCampaignList: React.FC = () => {
  const [annotationCampaigns, setAnnotationCampaigns] = useState<List>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Services
  const campaignService = useAnnotationCampaignAPI();
  const toast = useToast();

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    campaignService.list()
      .then(setAnnotationCampaigns)
      .catch(e => {
        if (isCancelled) return;
        toast.presentError(e);
      })
      .finally(() => !isCancelled && setIsLoading(false))

    return () => {
      isCancelled = true;
      campaignService.abort();
      setIsLoading(false);
      toast.dismiss();
    }
  }, []);

  const openGuide = () => {
    window.open(ANNOTATOR_GUIDE_URL, "_blank", "noopener, noreferrer")
  }

  const openNewCampaign = () => {
    window.open("/app/create-annotation-campaign", "_self")
  }

  return (
    <Fragment>
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

      { isLoading && <div className="d-flex justify-content-center"><IonSpinner/></div> }
    </Fragment>
  )
}
