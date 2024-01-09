import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as AnnotationCampaign from "../utils/api/annotation-campaign.tsx";
import { useAuth, useCatch401 } from "../utils/auth.tsx";
import { Request } from '../utils/requests.tsx';


const AnnotationCampaignList: React.FC = () => {
  const [annotationCampaigns, setAnnotationCampaigns] = useState<AnnotationCampaign.List>([]);

  const auth = useAuth();
  const catch401 = useCatch401();
  const [error, setError] = useState<any | undefined>(undefined);
  const [listRequest, setListRequest] = useState<Request | undefined>()


  useEffect(() => {
    const { request, response } = AnnotationCampaign.list(auth.bearer!);
    setListRequest(request);
    response.then(setAnnotationCampaigns).catch(catch401).catch(setError);

    return () => {
      listRequest?.abort();
    }
  }, [])

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
            <th>Campaign instructions</th>
            <th>Annotation Link</th>
          </tr>
          </thead>
          <tbody>
          { annotationCampaigns.map(campaign => (
            <tr key={ campaign.id }>
              <td><Link to={ `/annotation_campaign/${ campaign.id }` }>{ campaign.name }</Link></td>
              <td>{ campaign.created_at.toDateString() }</td>
              <td>{ campaign.annotation_set.name ?? "-" }</td>
              <td>{ campaign.confidence_indicator_set?.name ?? "-" }</td>
              <td>{ campaign.files_count }</td>
              <td>{ campaign.start?.toDateString() ?? 'N/A' }</td>
              <td>{ campaign.end?.toDateString() ?? 'N/A' }</td>
              <td>{ campaign.user_complete_tasks_count } / { campaign.user_tasks_count }</td>
              <td>{ campaign.instructions_url ?
                (<a href={ campaign.instructions_url }
                    title="Instructions on how to annotate tasks for this campaign"
                    rel="noopener noreferrer"
                    target="_blank">Instructions</a>)
                : "-" }</td>
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

export default AnnotationCampaignList;
