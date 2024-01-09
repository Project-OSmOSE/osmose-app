import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import ListChooser from '../components/ListChooser.tsx';
import { useHistory } from "react-router-dom";
import { useAuth, useCatch401 } from "../utils/auth.tsx";
import * as Dataset from "../utils/api/dataset.tsx";
import * as User from "../utils/api/user.tsx";
import * as AnnotationSet from "../utils/api/annotation-set.tsx";
import * as ConfidenceSet from "../utils/api/confidence-set.tsx";
import * as AnnotationCampaign from "../utils/api/annotation-campaign.tsx";
import { AnnotationMethod, AnnotationMode } from "../utils/api/annotation-campaign.tsx";
import { Request } from '../utils/requests.tsx';


type ShowAnnotationSetProps = {
  annotation_sets: AnnotationSet.List,
  onSelectionChange: (selected: AnnotationSet.ListItem | undefined) => void
};

const ShowAnnotationSet: React.FC<ShowAnnotationSetProps> = ({ annotation_sets, onSelectionChange }) => {
  const [selected, setSelected] = useState<AnnotationSet.ListItem | undefined>(undefined);

  const handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const set = annotation_sets.find(s => s.id === +event.currentTarget.value);
    setSelected(set);
    onSelectionChange(set);
  }

  return (
    <div className="form-group">
      <div className="col-sm-4 offset-sm-4">
        <select id="cac-annotation-set"
                value={ selected?.id ?? 0 }
                className="form-control"
                onChange={ handleOnChange }>
          <option value={ 0 } disabled>Select an annotation set</option>
          { annotation_sets.map(set => (
            <option key={ set.id } value={ set.id }>{ set.name }</option>
          )) }
        </select>
      </div>

      { selected &&
          <div className="col-sm-12 border rounded">
              <p>{ selected.desc }</p>
              <p><b>Tags: </b>{ selected.tags.join(', ') }</p>
          </div>
      }
    </div>
  )
}


type ShowConfidenceIndicatorSetProps = {
  confidence_indicator_sets: ConfidenceSet.List,
  onSelectionChange: (selected: ConfidenceSet.ListItem | undefined) => void
};

const ShowConfidenceIndicatorSet: React.FC<ShowConfidenceIndicatorSetProps> = ({
                                                                                 confidence_indicator_sets,
                                                                                 onSelectionChange
                                                                               }) => {
  const [selected, setSelected] = useState<ConfidenceSet.ListItem | null | undefined>(undefined);

  const handleOnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.currentTarget.value === "no-confidence-indicator-set") {
      setSelected(null)
      onSelectionChange(undefined);
      return;
    }
    const set = confidence_indicator_sets.find(s => s.id === +event.currentTarget.value);
    setSelected(set);
    onSelectionChange(set);
  }

  return (
    <div className="form-group">
      <div className="col-sm-4 offset-sm-4">
        <select id="cac-confidence-indicator-set"
                value={ selected === null ? 'null-confidence-indicators' : selected?.id ?? 0 } className="form-control"
                onChange={ handleOnChange }>
          <option value={ 0 } disabled>Select a confidence indicator set</option>
          <option key="null-confidence-indicators" value="no-confidence-indicator-set">No Confidence Indicator Set
          </option>
          { confidence_indicator_sets.map(set => (
            <option key={ set.id } value={ set.id }>{ set.name }</option>
          )) }
        </select>
      </div>
      { selected &&
          <div className="col-sm-12 border rounded">
              <p>{ selected.desc }</p>
            { selected.confidenceIndicators.map((confidence_indicator: any) => {
              return (
                <p key={ "confidence" + confidence_indicator.level + "_" + confidence_indicator.label }>
                  <b>{ confidence_indicator.level }: </b> { confidence_indicator.label }</p>
              )
            }) }
          </div>
      }
    </div>
  )
}

const CreateAnnotationCampaign: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [selectedSpectrogramConfigurations, setSelectedSpectrogramConfigurations] = useState<Array<Dataset.ListItemSpectros>>([]);
  const [selectedAnnotators, setSelectedAnnotators] = useState<User.List>([]);
  const [instructionURL, setInstructionURL] = useState<string>('');
  const [selectedConfidenceIndicatorSet, setSelectedConfidenceIndicatorSet] = useState<ConfidenceSet.ListItem | undefined>(undefined);
  const [selectedAnnotationSet, setSelectedAnnotationSet] = useState<AnnotationSet.ListItem | undefined>(undefined);
  const [selectedDataset, setSelectedDataset] = useState<Dataset.ListItem | undefined>(undefined);
  const [annotationMethod, setAnnotationMethod] = useState<AnnotationMethod>(AnnotationMethod.notSelected);
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>(AnnotationMode.boxes);
  const [annotationGoal, setAnnotationGoal] = useState<number>(0);

  const [confidenceIndicatorSets, setConfidenceIndicatorSets] = useState<ConfidenceSet.List>([]);
  const [users, setUsers] = useState<User.List>([]);
  const [annotationSets, setAnnotationSets] = useState<AnnotationSet.List>([]);
  const [spectrogramConfigurations, setSpectrogramConfigurations] = useState<Array<Dataset.ListItemSpectros> | undefined>(undefined);
  const [datasets, setDatasets] = useState<Dataset.List>([]);
  const [error, setError] = useState<any | undefined>(undefined);

  const history = useHistory();
  const auth = useAuth();
  const catch401 = useCatch401();
  const [listDatasetRequest, setListDatasetRequest] = useState<Request | undefined>()
  const [listAnnotationSetRequest, setListAnnotationSetRequest] = useState<Request | undefined>()
  const [listUserRequest, setListUserRequest] = useState<Request | undefined>()
  const [listConfidenceSetRequest, setListConfidenceSetRequest] = useState<Request | undefined>()
  const [postCampaignRequest, setPostCampaignRequest] = useState<Request | undefined>()


  useEffect(() => {
    const dataset = Dataset.list(auth.bearer!, '.wav');
    setListDatasetRequest(dataset.request);
    const user = User.list(auth.bearer!);
    setListUserRequest(user.request);
    const annotationSet = AnnotationSet.list(auth.bearer!);
    setListAnnotationSetRequest(annotationSet.request);
    const confidenceSet = ConfidenceSet.list(auth.bearer!);
    setListConfidenceSetRequest(confidenceSet.request);


    Promise.all([
      dataset.response.then(setDatasets),
      user.response.then(setUsers),
      annotationSet.response.then(setAnnotationSets),
      confidenceSet.response.then(setConfidenceIndicatorSets)
    ]).catch(catch401).catch(setError)

    return () => {
      listDatasetRequest?.abort();
      listUserRequest?.abort();
      listAnnotationSetRequest?.abort();
      listConfidenceSetRequest?.abort();
      postCampaignRequest?.abort();
    }
  }, [])

  const handleDatasetChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    const dataset = datasets?.find(d => d.id === +event.target.value)
    setSelectedDataset(dataset);
    setSpectrogramConfigurations(dataset?.spectros);
    setSelectedSpectrogramConfigurations([]);
  }

  const handleAddSpectro = (id: number) => {
    const config = spectrogramConfigurations?.find(s => s.id === id);
    if (!config) return;
    setSelectedSpectrogramConfigurations([...(selectedSpectrogramConfigurations ?? []), config])
    setSpectrogramConfigurations(spectrogramConfigurations?.filter(s => s.id !== id))
  }

  const handleRemoveSpectro = (id: number) => {
    const config = selectedSpectrogramConfigurations?.find(s => s.id === id);
    if (!config) return;
    setSelectedSpectrogramConfigurations(selectedSpectrogramConfigurations?.filter(s => s.id !== id))
    setSpectrogramConfigurations([...(spectrogramConfigurations ?? []), config])
  }

  const handleAddAnnotator = (id: number) => {
    const user = users?.find(u => u.id === id);
    if (!user) return;
    setSelectedAnnotators([...(selectedAnnotators ?? []), user])
    setUsers(users?.filter(u => u.id !== id))
    setAnnotationGoal(Math.max(1, annotationGoal))
  }

  const handleRemoveAnnotator = (id: number) => {
    const user = selectedAnnotators?.find(u => u.id === id);
    if (!user) return;
    setSelectedAnnotators(selectedAnnotators?.filter(u => u.id !== id))
    setUsers([...(users ?? []), user])
    setAnnotationGoal(Math.min(annotationGoal, selectedAnnotators.length));
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined)
    try {
      console.debug( selectedDataset ? [selectedDataset] : [])
      const { request, response } = AnnotationCampaign.create({
        name: name?.trim() || 'Unnamed Campaign',
        desc: description?.trim(),
        datasets: selectedDataset ? [selectedDataset.id] : [],
        spectro_configs: selectedSpectrogramConfigurations.map(s => s.id),
        annotation_set_id: selectedAnnotationSet?.id,
        confidence_indicator_set_id: selectedConfidenceIndicatorSet?.id,
        annotation_scope: annotationMode.valueOf(),
        annotators: selectedAnnotators.map(a => a.id),
        annotation_goal: annotationGoal,
        annotation_method: annotationMethod.valueOf(),
        instructions_url: instructionURL?.trim(),
        start: start ? start.trim() + 'T00:00' : undefined,
        end: end ? end.trim() + 'T00:00' : undefined
      }, auth.bearer!);
      setPostCampaignRequest(request);

      await response;
      history.push('/annotation-campaigns');
    } catch (e: any) {
      if (e.status && e.response) {
        // Build an error message
        const message = Object
          .entries(e.response.body)
          .map(([key, value]) => Array.isArray(value) ? `${ key }: ${ value.join(' - ') }` : '')
          .join("\n");
        setError({
          status: e.status,
          message: message.length > 0 ? message : JSON.stringify(e.response.body)
        });
      }
    }
  }


  let files_per_person;
  if (selectedDataset) files_per_person = Math.floor(selectedDataset?.files_count * annotationGoal / selectedAnnotators.length);

  return (
    <div className="col-sm-9 border rounded">
      <h1 className="text-center">Create Annotation Campaign</h1>
      <br/>
      { error && <p className="error-message">{ error.message }</p> }
      <form onSubmit={ handleSubmit }>
        <div className="form-group">
          <input id="cac-name"
                 className="form-control"
                 type="text"
                 value={ name }
                 onChange={ (e) => setName(e.currentTarget.value) }
                 placeholder="Campaign Name"/>
        </div>

        <div className="form-group">
          <textarea id="cac-desc"
                    className="form-control"
                    value={ description }
                    onChange={ (e) => setDescription(e.currentTarget.value) }
                    placeholder="Description"/>
        </div>

        <div className="form-group">
          <select id="cac-dataset"
                  className="form-control"
                  onChange={ handleDatasetChanged }>
            <option key="dataset-void" value="">Select a dataset</option>
            { datasets?.map(dataset => (
              <option key={ `dataset-${ dataset.id }` } value={ dataset.id.toString() }>{ dataset.name }</option>
            )) }
          </select>
        </div>

        { spectrogramConfigurations &&
            <div className="form-group">
                <ListChooser choice_type="spectro"
                             choices_list={ [...new Set(spectrogramConfigurations.sort((a, b) => a.name.localeCompare(b.name)))] }
                             chosen_list={ selectedSpectrogramConfigurations }
                             onSelectChange={ handleAddSpectro }
                             onDelClick={ handleRemoveSpectro }/>
            </div>
        }

        <div className="form-group row">
          <div className="col-sm-6">
            <input id="cac-start"
                   className="form-control"
                   type="text"
                   value={ start }
                   onChange={ (e) => setStart(e.currentTarget.value) }
                   placeholder="Start Date (YYYY-MM-DD)"/>
          </div>
          <div className="col-sm-6">
            <input id="cac-end"
                   className="form-control"
                   type="text"
                   value={ end }
                   onChange={ (e) => setEnd(e.currentTarget.value) }
                   placeholder="End Date (YYYY-MM-DD)"/>
          </div>
        </div>

        <div className="form-group">
          <ShowAnnotationSet annotation_sets={ annotationSets }
                             onSelectionChange={ setSelectedAnnotationSet }/>

          <ShowConfidenceIndicatorSet confidence_indicator_sets={ confidenceIndicatorSets }
                                      onSelectionChange={ setSelectedConfidenceIndicatorSet }/>
        </div>

        <div className="form-group">
          <label className="col-sm-7 col-form-label">Annotation mode</label>
          <select id="cac-annotation-mode"
                  value={ annotationMode }
                  className="form-control"
                  onChange={ (e) => setAnnotationMode(+e.currentTarget.value) }>
            <option value={ AnnotationMode.boxes }>Boxes</option>
            <option value={ AnnotationMode.wholeFile }>Whole file</option>
          </select>
        </div>

        <div className="form-group">
          <label>Choose annotators:</label>
          <ListChooser choice_type="user"
                       choices_list={ [...new Set(users.map(u => ({ ...u, name: u.username })).sort((a, b) => a.name.localeCompare(b.name)))] }
                       chosen_list={ selectedAnnotators.map(u => ({ ...u, name: u.username })) }
                       onSelectChange={ handleAddAnnotator }
                       onDelClick={ handleRemoveAnnotator }/>
        </div>

        <div className="form-group">
          <input id="cac-instructions"
                 className="form-control"
                 type="text"
                 value={ instructionURL }
                 onChange={ e => setInstructionURL(e.currentTarget.value) }
                 placeholder="Campaign instructions URL"/>
        </div>

        <div className="form-group row">
          <label className="col-sm-5 col-form-label">Wanted number of annotators per file:</label>
          <div className="col-sm-2">
            <input id="cac-annotation-goal" className="form-control" type="number" min={ 0 }
                   value={ annotationGoal }
                   onChange={ e => {
                     setAnnotationGoal(Math.min(selectedAnnotators.length, Math.max(+e.currentTarget.value, 1)));
                   } }/>
          </div>
          { selectedDataset && selectedAnnotators.length > 0 && files_per_person &&
              <p className="col-sm-5">
                  Each annotator will annotate at least { files_per_person } files in the campaign
                  (${ Math.round(files_per_person / selectedDataset?.files_count * 100) }%), which contains
                  ${ selectedDataset?.files_count } files in total
              </p> }
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

export default CreateAnnotationCampaign;
export { ShowAnnotationSet };
