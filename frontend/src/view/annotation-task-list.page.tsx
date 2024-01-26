import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI,
  AnnotationTaskList as List, useAnnotationTaskAPI
} from "../services/api";
import { AnnotationTaskStatus } from "../enum/annotation.enum.tsx";

export const AnnotationTaskList: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<AnnotationCampaignRetrieveCampaign | undefined>(undefined);
  const [tasks, setTasks] = useState<List | undefined>(undefined);

  const taskService = useAnnotationTaskAPI();
  const campaignService = useAnnotationCampaignAPI();
  const [error, setError] = useState<any | undefined>(undefined);

  useEffect(() => {
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
  }, [campaignID, campaignService, taskService]);

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
          return (<tr className={ task.status === AnnotationTaskStatus.finished ? 'table-success' : 'table-warning' }
                      key={ task.id }>
            <td>{ task.filename }</td>
            <td>{ task.dataset_name }</td>
            <td>{ startDate.toLocaleDateString() }</td>
            <td>{ diffTime.toUTCString().split(' ')[4] }</td>
            <td>{ task.status }</td>
            <td><Link to={ `/audio-annotator/${ task.id }` }>Task link</Link></td>
          </tr>)
        }) }
        </tbody>
      </table>
    </div>
  )
}
