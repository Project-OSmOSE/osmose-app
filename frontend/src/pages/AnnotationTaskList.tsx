import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnnotationCampaignsApiService } from "../services/API/AnnotationCampaignsApiService.tsx";
import { AnnotationTasksApiService } from "../services/API/AnnotationTasksApiService.tsx";
import { AnnotationCampaign, AnnotationTask, TaskStatus } from "../services/API/ApiService.data.tsx";


type AnnotationTaskListProps = {
  match: {
    params: {
      campaign_id: string
    }
  },
};


const AnnotationTaskList: React.FC<AnnotationTaskListProps> = ({ match }) => {
  const [campaign, setCampaign] = useState<AnnotationCampaign | undefined>(undefined);
  const [tasks, setTasks] = useState<Array<AnnotationTask> | undefined>(undefined);
  const [error, setError] = useState<any | undefined>(undefined);

  useEffect(() => {
    const campaignID = match.params.campaign_id;
    AnnotationTasksApiService.shared.listForCampaign(campaignID).then(setTasks).catch(setError);
    AnnotationCampaignsApiService.shared.retrieve(campaignID).then(data => setCampaign(data.campaign)).catch(setError);

    return () => {
      AnnotationCampaignsApiService.shared.abortRequests();
      AnnotationTasksApiService.shared.abortRequests();
    }
  }, []);

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
      <p className="text-center">
        <a className="btn btn-warning"
           href="https://github.com/Project-ODE/FrontApp/blob/master/docs/user_guide_annotator.md"
           rel="noopener noreferrer"
           target="_blank">
          <span className="fa fa-question-circle"></span>&nbsp;Annotator User Guide
        </a>
        &nbsp;
        { campaign?.instructions_url &&
            <a className="btn btn-warning"
               href={ campaign.instructions_url }
               rel="noopener noreferrer"
               target="_blank"
            ><span className="fa fa-info-circle"></span>&nbsp;Campaign instructions</a> }
      </p>
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
          return (<tr className={ task.status === TaskStatus.finished ? 'table-success' : 'table-warning' }
                      key={ task.id }>
            <td>{ task.filename }</td>
            <td>{ task.dataset_name }</td>
            <td>{ startDate.toLocaleDateString() }</td>
            <td>{ diffTime.toUTCString().split(' ')[4] }</td>
            <td>{ task.status }</td>
            <td><Link to={ `/audio-annotator/${task.id}` }>Task link</Link></td>
          </tr>)
        }) }
        </tbody>
      </table>
    </div>
  )
}

export default AnnotationTaskList;
