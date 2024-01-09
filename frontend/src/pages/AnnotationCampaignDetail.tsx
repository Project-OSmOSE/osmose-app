import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth, useCatch401 } from "../utils/auth.tsx";
import * as Campaign from '../utils/api/annotation-campaign.tsx';
import * as User from '../utils/api/user.tsx';
import { Request } from '../utils/requests.tsx';

type ACDProps = {
  match: {
    params: {
      campaign_id: string
    }
  },
};

type AnnotationStatus = {
  annotator: User.ListItem;
  progress: string;
}

const AnnotationCampaignDetail: React.FC<ACDProps> = () => {
  const { id: campaignID } = useParams<{ id: string }>()
  const [annotationCampaign, setAnnotationCampaign] = useState<Campaign.RetrieveCampaign | undefined>(undefined);
  const [annotationStatus, setAnnotationStatus] = useState<Array<AnnotationStatus>>([]);
  const [isStaff, setIsStaff] = useState<boolean>(false);

  const auth = useAuth();
  const catch401 = useCatch401();
  const [error, setError] = useState<any | undefined>(undefined);
  const [retrieveCampaignRequest, setRetrieveCampaignRequest] = useState<Request | undefined>()
  const [listUserRequest, setListUserRequest] = useState<Request | undefined>()
  const [isStaffRequest, setIsStaffRequest] = useState<Request | undefined>()
  const [dlResultRequest, setDlResultRequest] = useState<Request | undefined>()
  const [dlStatusRequest, setDlStatusRequest] = useState<Request | undefined>()


  useEffect(() => {
    const campaign = Campaign.retrieve(campaignID, auth.bearer!);
    setRetrieveCampaignRequest(campaign.request);
    const users = User.list(auth.bearer!);
    setListUserRequest(users.request);
    const isStaff = User.isStaff(auth.bearer!);
    setIsStaffRequest(isStaff.request);

    Promise.all([
      users.response,
      campaign.response,
      isStaff.response.then(setIsStaff),
    ]).then(([users, data]) => {
      setAnnotationCampaign(data.campaign);

      const status = data.tasks
        .filter(task => task.annotator_id)
        .map(task => {
          const userTasks = data.tasks.filter(t => t.annotator_id === task.annotator_id);
          const totalCompleteUserTasks = userTasks.find(t => t.status === 2)?.count ?? 0;
          const totalUserTasks = userTasks.reduce((a, b) => a + b.count, 0);
          return {
            annotator: users.find(u => u.id === task.annotator_id),
            progress: `${ totalCompleteUserTasks }/${ totalUserTasks }`
          } as AnnotationStatus;
        })
      setAnnotationStatus(status);
    }).catch(catch401).catch(setError)

    return () => {
      retrieveCampaignRequest?.abort();
      listUserRequest?.abort();
      isStaffRequest?.abort();
      dlResultRequest?.abort();
      dlStatusRequest?.abort();
    }
  }, [campaignID])

  const downloadResult = () => {
    if (!annotationCampaign) return;
    setDlResultRequest(Campaign.downloadResults(annotationCampaign, auth.bearer!).request);
  }

  const downloadStatus = () => {
    if (!annotationCampaign) return;
    setDlStatusRequest(Campaign.downloadStatus(annotationCampaign, auth.bearer!).request);
  }

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
            <tr key={ status.annotator?.id }>
              <td className="text-center">{ status.annotator?.email }</td>
              <td className="text-center">{ status.progress }</td>
            </tr>
          );
        }) }
        </tbody>
      </table>
      <p className="text-center">
        <button onClick={ downloadResult }
                className="btn btn-primary">
          Download CSV results
        </button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={ downloadStatus }
                className="btn btn-primary">
          Download CSV task status
        </button>
      </p>
    </div>
  )
}

export default AnnotationCampaignDetail;
