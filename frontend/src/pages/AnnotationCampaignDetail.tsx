import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnnotationCampaign, User } from "../services/ApiService.data.tsx";
import { UserApiService } from "../services/UserApiService.tsx";
import { AnnotationCampaignsApiService } from "../services/AnnotationCampaignsApiService.tsx";

type ACDProps = {
  match: {
    params: {
      campaign_id: string
    }
  },
};

type AnnotationStatus = {
  annotator: User;
  progress: string;
}

const AnnotationCampaignDetail: React.FC<ACDProps> = ({ match }) => {
  const [annotationCampaign, setAnnotationCampaign] = useState<AnnotationCampaign | undefined>(undefined);
  const [annotationStatus, setAnnotationStatus] = useState<Array<AnnotationStatus>>([]);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [error, setError] = useState<any | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      UserApiService.shared.isStaff(),
      UserApiService.shared.list(),
      AnnotationCampaignsApiService.shared.retrieve(match.params.campaign_id)
    ]).then(([isStaff, users, data]) => {
      setIsStaff(isStaff)
      setAnnotationCampaign(data.campaign);

      const status = data.tasks
        .filter(task => task.annotator_id)
        .map(task => {
          const userTasks = data.tasks.filter(t => t.annotator_id === task.annotator_id);
          const totalCompleteUserTasks = userTasks.find(t => t.status === 2)?.count ?? 0;
          const totalUserTasks = userTasks.reduce((a, b) => a + b.count, 0);
          return {
            annotator: users[task.annotator_id],
            progress: `${ totalCompleteUserTasks }/${ totalUserTasks }`
          } as AnnotationStatus;
        })
      setAnnotationStatus(status);
    }).catch(setError);

    return () => {
      UserApiService.shared.abortRequests();
      AnnotationCampaignsApiService.shared.abortRequests();
    }
  }, [])


  if (error) {
    return (
      <div className="col-sm-9 border rounded">
        <h1>Annotation Campaign</h1>
        <p className="error-message">{ error.message }</p>
      </div>
    )
  }
  if (!annotationCampaign) {
    return (
      <div className="col-sm-9 border rounded">
        <h6>Loading Annotation Campaign ...</h6>
      </div>
    )
  }
  return (
    <div className="col-sm-9 border rounded">
      <h1 className="text-center">{ annotationCampaign.name }</h1>
      <div className="row justify-content-around">
        <div>
          <div><b>Annotation set:</b> { annotationCampaign.annotation_set.name }</div>
          <div><b>Confidence Indicator
            set:</b> { annotationCampaign.confidence_indicator_set ? annotationCampaign.confidence_indicator_set.name : "-" }
          </div>
        </div>
        <div>
          <div>
            <b>Start:</b> { annotationCampaign.start ? new Date(annotationCampaign.start).toLocaleDateString() : 'N/A' }
          </div>
          <div><b>End:</b> { annotationCampaign.end ? new Date(annotationCampaign.end).toLocaleDateString() : 'N/A' }
          </div>
        </div>
      </div>
      <div className="col-sm-12 border rounder">
        <center><h3>Description</h3></center>
        { annotationCampaign.desc }
      </div>
      <br/>
      { isStaff && <p className="text-center">
          <Link to={ `/annotation_campaign/${ annotationCampaign.id }/edit` }
                className="btn btn-primary">
              Add annotators
          </Link>
      </p> }
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
            <tr key={ status.annotator.id }>
              <td className="text-center">{ status.annotator.email }</td>
              <td className="text-center">{ status.progress }</td>
            </tr>
          );
        }) }
        </tbody>
      </table>
      <p className="text-center">
        <button onClick={ () => AnnotationCampaignsApiService.shared.downloadResult(annotationCampaign) }
                className="btn btn-primary">
          Download CSV results
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={ () => AnnotationCampaignsApiService.shared.downloadResultStatus(annotationCampaign) }
                className="btn btn-primary">
          Download CSV task status
        </button>
      </p>
    </div>
  )
}

export default AnnotationCampaignDetail;
