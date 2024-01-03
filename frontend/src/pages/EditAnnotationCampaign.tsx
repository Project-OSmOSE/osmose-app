import React, { FormEvent, useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import ListChooser from '../ListChooser.tsx';
import { AnnotationCampaignsApiService } from "../services/AnnotationCampaignsApiService.tsx";
import { AnnotationCampaign, AnnotationMethod, User } from "../services/ApiService.data.tsx";
import { UserApiService } from "../services/UserApiService.tsx";

type EACProps = {
  match: {
    params: {
      campaign_id: string
    }
  },
}

const EditAnnotationCampaign: React.FC<EACProps> = ({ match }) => {
  const history = useHistory();
  const [campaign, setCampaign] = useState<AnnotationCampaign | undefined>(undefined);
  const [annotators, setAnnotators] = useState<Array<User>>([]);
  const [annotationGoal, setAnnotationGoal] = useState<number>(0);
  const [annotationMethod, setAnnotationMethod] = useState<AnnotationMethod>(AnnotationMethod.notSelected);
  const [users, setUsers] = useState<Array<User>>([]);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [error, setError] = useState<any | undefined>(undefined);

  useEffect(() => {
    Promise.all([
      AnnotationCampaignsApiService.shared.retrieve(match.params.campaign_id),
      UserApiService.shared.list(),
      UserApiService.shared.isStaff().then(setIsStaff),
    ]).then(([data, users]) => {
      const annotatorIds = [...new Set(data.tasks.map(t => t.annotator_id))];
      const annotatorList = annotatorIds.map(id => users.find(u => u.id === id)).filter(u => u !== undefined) as Array<User>;
      setAnnotators(annotatorList);
      setCampaign(data.campaign);
      setUsers(users.filter(u => annotatorList.indexOf(u) < 0));
    }).catch(setError)
    return () => {
      AnnotationCampaignsApiService.shared.abortRequests();
      UserApiService.shared.abortRequests();
    }
  }, [])

  const handleAddAnnotator = (id: number) => {
    const user = users?.find(u => u.id !== id);
    if (!user) return;
    setAnnotators([...(annotators ?? []), user])
    setUsers(users?.filter(u => u.id !== id))
    setAnnotationGoal(Math.max(1, annotationGoal))
  }

  const handleRemoveAnnotator = (id: number) => {
    const user = annotators?.find(u => u.id !== id);
    if (!user) return;
    setAnnotators(annotators?.filter(u => u.id !== id))
    setUsers([...(users ?? []), user])
    setAnnotationGoal(Math.min(annotationGoal, annotators.length));
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    if (!campaign) return;
    try {
      await AnnotationCampaignsApiService.shared.addAnnotators(campaign.id, {
        annotators: annotators.map(a => a.id),
        annotation_method: annotationMethod,
        annotation_goal: annotationGoal === 0 ? undefined : { annotation_goal: annotationGoal }
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
        <div className="form-group">
          <label>Choose annotators:</label>
          <ListChooser choice_type="user"
                       choices_list={ users }
                       chosen_list={ annotators }
                       onSelectChange={ handleAddAnnotator }
                       onDelClick={ handleRemoveAnnotator }/>
        </div>

        <div className="form-group row">
          <label className="col-sm-5 col-form-label">Wanted number of files to annotate<br/>(0 for all files):</label>
          <div className="col-sm-2">
            <input id="cac-annotation-goal"
                   className="form-control"
                   type="number"
                   min={ 0 }
                   value={ annotationGoal }
                   onChange={ e => setAnnotationGoal(+e.currentTarget.value) }/>
          </div>
        </div>

        <div className="form-group row">
          <label className="col-sm-7 col-form-label">Wanted distribution method for files amongst annotators:</label>
          <div className="col-sm-3">
            <select id="cac-annotation-method"
                    value={ annotationMethod }
                    className="form-control"
                    onChange={ e => setAnnotationMethod(+e.currentTarget.value) }>
              <option value={ AnnotationMethod.notSelected } disabled>Select a method</option>
              <option value={ AnnotationMethod.random }>Random</option>
              <option value={ AnnotationMethod.sequential }>Sequential</option>
            </select>
          </div>
        </div>

        <div className="text-center">
          <input className="btn btn-primary" type="submit" value="Submit"/>
        </div>
      </form>
    </div>
  );
}

export default EditAnnotationCampaign;
