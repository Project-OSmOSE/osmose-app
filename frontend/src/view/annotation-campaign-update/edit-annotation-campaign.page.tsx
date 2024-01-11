import React, { FormEvent, useEffect, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { AnnotationMethod } from "../../enum";
import {
  AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI,
  UserList, useUsersAPI
} from "../../services/api";
import { AnnotatorsSelectComponent } from "./annotators-select.component.tsx";
import { AnnotationGoalEditInputComponent } from "./annotation-goal-edit-input.component.tsx";
import { AnnotationMethodSelectComponent } from "./annotation-method-select.component.tsx";


export const EditAnnotationCampaign: React.FC = () => {
  const { id: campaignID } = useParams<{id: string}>()
  const history = useHistory();
  const [campaign, setCampaign] = useState<AnnotationCampaignRetrieveCampaign | undefined>(undefined);
  const [annotators, setAnnotators] = useState<UserList>([]);
  const [annotationGoal, setAnnotationGoal] = useState<number>(0);
  const [annotationMethod, setAnnotationMethod] = useState<AnnotationMethod>(AnnotationMethod.notSelected);
  const [users, setUsers] = useState<UserList>([]);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [error, setError] = useState<any | undefined>(undefined);

  const campaignService = useAnnotationCampaignAPI();
  const userService = useUsersAPI();

  useEffect(() => {
    let isCancelled  = false;

    Promise.all([
      campaignService.retrieve(campaignID),
      userService.list(),
      userService.isStaff().then(setIsStaff)
    ]).then(([data, users]) => {
      const annotatorIds = [...new Set(data.tasks.map(t => t.annotator_id))];
      const annotatorList = annotatorIds.map(id => users.find(u => u.id === id)).filter(u => u !== undefined) as UserList;
      setAnnotators(annotatorList);
      setCampaign(data.campaign);
      setUsers(users.filter(u => annotatorList.indexOf(u) < 0));
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    if (!campaign) return;
    try {
      await campaignService.addAnnotators(campaign.id, {
        annotators: annotators.map(a => a.id),
        annotation_method: annotationMethod,
        annotation_goal: annotationGoal === 0 ? undefined : annotationGoal
      });
      history.push(`/annotation_campaign/${ campaign.id }`);
    } catch (e: any) {
      if (e.status && e.response) {
        // Build an error message
        const message = Object
          .entries(e.response.body)
          .map(([key, value]) => Array.isArray(value) ? `${ key }: ${ value.join(' - ') }` : '')
          .join("\n");
        setError({
          status: e.status,
          message: message
        });
      }
    }
  }


  if (!isStaff) {
    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">Edit Annotation Campaign</h1>
        <br/>
        <p className="error-message">You are not allowed to access this page</p>
      </div>
    )
  }

  if (users.length < 0 && annotators.length < 0) {
    return (
      <div className="col-sm-9 border rounded">
        <h1 className="text-center">Edit Annotation Campaign</h1>
        <br/>
        <p className="alert alert-info">Every possible annotator has been added to this campaign. If you want to create
          new users, use the administration backend.</p>
        <br/>
        { campaign &&
            <p className="text-center"><Link to={ `/annotation_campaign/${ campaign.id }` }>Go back to annotation
                campaign details</Link></p> }
      </div>
    );
  }

  return (
    <div className="col-sm-9 border rounded">
      <h1 className="text-center">Edit Annotation Campaign</h1>
      <br/>
      { error && <p className="error-message">{ error.message }</p> }
      <form onSubmit={ handleSubmit }>
        <AnnotatorsSelectComponent users={users}
                                   setUsers={setUsers}
                                   annotators={annotators}
                                   setAnnotators={setAnnotators}
                                   annotationGoal={annotationGoal}
                                   setAnnotationGoal={setAnnotationGoal}/>

        <AnnotationGoalEditInputComponent annotationGoal={annotationGoal}
                                          setAnnotationGoal={setAnnotationGoal}/>

        <AnnotationMethodSelectComponent annotationMethod={annotationMethod}
                                         setAnnotationMethod={setAnnotationMethod}/>

        <div className="text-center">
          <input className="btn btn-primary" type="submit" value="Submit"/>
        </div>
      </form>
    </div>
  );
}