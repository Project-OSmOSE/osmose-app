import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import ListChooser from '../components/ListChooser.tsx';
import { DatasetApiService } from "../services/API/DatasetApiService.tsx";
import {
  AnnotationMethod,
  AnnotationMode,
  AnnotationSet,
  ConfidenceIndicatorSet,
  Dataset,
  SpectrogramConfiguration,
  User
} from "../services/API/ApiService.data.tsx";
import { AnnotationSetApiService } from "../services/API/AnnotationSetApiService.tsx";
import { UserApiService } from "../services/API/UserApiService.tsx";
import { ConfidenceSetApiService } from "../services/API/ConfidenceSetApiService.tsx";
import { AnnotationCampaignsApiService } from "../services/API/AnnotationCampaignsApiService.tsx";
import { useHistory } from "react-router-dom";


type ShowAnnotationSetProps = {
  annotation_sets: Array<AnnotationSet>,
  onSelectionChange: (selected: AnnotationSet | undefined) => void
};

const ShowAnnotationSet: React.FC<ShowAnnotationSetProps> = ({ annotation_sets, onSelectionChange }) => {
  const [selected, setSelected] = useState<AnnotationSet | undefined>(undefined);

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
  confidence_indicator_sets: Array<ConfidenceIndicatorSet>,
  onSelectionChange: (selected: ConfidenceIndicatorSet | undefined) => void
};

const ShowConfidenceIndicatorSet: React.FC<ShowConfidenceIndicatorSetProps> = ({
                                                                                 confidence_indicator_sets,
                                                                                 onSelectionChange
                                                                               }) => {
  const [selected, setSelected] = useState<ConfidenceIndicatorSet | null | undefined>(undefined);

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
            { selected.confidence_indicators.map((confidence_indicator: any) => {
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

type CACProps = {
  history: {
    push: (url: string) => void
  }
};

const CreateAnnotationCampaign: React.FC<CACProps> = () => {
  const [name, setName] = useState<string | undefined>(undefined);
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [start, setStart] = useState<string | undefined>(undefined);
  const [end, setEnd] = useState<string | undefined>(undefined);
  const [selectedSpectrogramConfigurations, setSelectedSpectrogramConfigurations] = useState<Array<SpectrogramConfiguration>>([]);
  const [selectedAnnotators, setSelectedAnnotators] = useState<Array<User>>([]);
  const [instructionURL, setInstructionURL] = useState<string | undefined>(undefined);
  const [selectedConfidenceIndicatorSet, setSelectedConfidenceIndicatorSet] = useState<ConfidenceIndicatorSet | undefined>(undefined);
  const [selectedAnnotationSet, setSelectedAnnotationSet] = useState<AnnotationSet | undefined>(undefined);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | undefined>(undefined);
  const [annotationMethod, setAnnotationMethod] = useState<AnnotationMethod>(AnnotationMethod.notSelected);
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>(AnnotationMode.boxes);
  const [annotationGoal, setAnnotationGoal] = useState<number>(0);

  const [confidenceIndicatorSets, setConfidenceIndicatorSets] = useState<Array<ConfidenceIndicatorSet>>([]);
  const [users, setUsers] = useState<Array<User>>([]);
  const [annotationSets, setAnnotationSets] = useState<Array<AnnotationSet>>([]);
  const [spectrogramConfigurations, setSpectrogramConfigurations] = useState<Array<SpectrogramConfiguration> | undefined>(undefined);
  const [datasets, setDatasets] = useState<Array<Dataset> | undefined>(undefined);
  const [error, setError] = useState<any | undefined>(undefined);

  const history = useHistory();

//   postAnnotationCampaign!
// :
//   SuperAgentRequest;

  useEffect(() => {
    Promise.all([
      DatasetApiService.shared.list().then(datasets =>
        setDatasets(datasets.filter(d => d.files_type === '.wav'))),
      AnnotationSetApiService.shared.list().then(setAnnotationSets),
      UserApiService.shared.list().then(setUsers),
      ConfidenceSetApiService.shared.list().then(setConfidenceIndicatorSets)
    ]).catch(setError);

    return () => {
      DatasetApiService.shared.abortRequests();
      AnnotationSetApiService.shared.abortRequests();
      UserApiService.shared.abortRequests();
      ConfidenceSetApiService.shared.abortRequests();
    }
  }, [])

  const handleDatasetChanged = (event: ChangeEvent<HTMLSelectElement>) => {
    const dataset = datasets?.find(d => d.id === event.target.value)
    setSelectedDataset(dataset);
    setSpectrogramConfigurations(dataset?.spectros);
    setSelectedSpectrogramConfigurations([]);
  }

  const handleAddSpectro = (id: number) => {
    const config = spectrogramConfigurations?.find(s => s.id !== id);
    if (!config) return;
    setSelectedSpectrogramConfigurations([...(selectedSpectrogramConfigurations ?? []), config])
    setSpectrogramConfigurations(spectrogramConfigurations?.filter(s => s.id !== id))
  }

  const handleRemoveSpectro = (id: number) => {
    const config = selectedSpectrogramConfigurations?.find(s => s.id !== id);
    if (!config) return;
    setSelectedSpectrogramConfigurations(selectedSpectrogramConfigurations?.filter(s => s.id !== id))
    setSpectrogramConfigurations([...(selectedSpectrogramConfigurations ?? []), config])
  }

  const handleAddAnnotator = (id: number) => {
    const user = users?.find(u => u.id !== id);
    if (!user) return;
    setSelectedAnnotators([...(selectedAnnotators ?? []), user])
    setUsers(users?.filter(u => u.id !== id))
    setAnnotationGoal(Math.max(1, annotationGoal))
  }

  const handleRemoveAnnotator = (id: number) => {
    const user = selectedAnnotators?.find(u => u.id !== id);
    if (!user) return;
    setSelectedAnnotators(selectedAnnotators?.filter(u => u.id !== id))
    setUsers([...(users ?? []), user])
    setAnnotationGoal(Math.min(annotationGoal, selectedAnnotators.length));
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined)
    try {
      await AnnotationCampaignsApiService.shared.create({
        name: name?.trim() || 'Unnamed Campaign',
        desc: description?.trim(),
        datasets: selectedDataset ? [selectedDataset] : [],
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
      });
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
          message: message
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
                             choices_list={ spectrogramConfigurations }
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
                       choices_list={ users }
                       chosen_list={ selectedAnnotators }
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
                  Each annotator will annotate at least { files_per_person } files in the campaign (${ Math.round(files_per_person / selectedDataset?.files_count * 100) }%), which contains ${ selectedDataset?.files_count } files in total
              </p>}
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
