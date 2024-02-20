import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnnotationCampaignAPI, AnnotationCampaignList as List } from "../services/api";


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

  if (error) return (
    <div className="col-sm-10 border rounded">
      <h1>Annotation Campaigns</h1>
      <p className="error-message">{ error.message }</p>
    </div>
  )

  return (
    <div className="col-sm-10 border rounded">
      <h1 className="text-center">Annotation Campaigns</h1>
      <p className="text-center">
        <a className="btn btn-warning"
           href="https://github.com/Project-ODE/FrontApp/blob/master/docs/user_guide_annotator.md"
           rel="noopener noreferrer"
           target="_blank">
          <span className="fa fa-question-circle"></span>&nbsp;Annotator User Guide</a>
      </p>

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

      <p className="text-center">
        <Link to="/create-annotation-campaign"
              className="btn btn-primary">
          New annotation campaign
        </Link>
      </p>
    </div>
  )
}
