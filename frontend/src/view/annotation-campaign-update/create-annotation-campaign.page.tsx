import { FC, FormEvent, useCallback, useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import {
  useAnnotationCampaignAPI,
  ConfidenceSetList, ConfidenceSetListItem, useConfidenceSetAPI,
  AnnotationSetList, AnnotationSetListItem, useAnnotationSetAPI,
  UserList, useUsersAPI,
  DatasetList, DatasetListItem, DatasetListItemSpectros, useDatasetsAPI
} from "../../services/api";
import { AnnotationMethod, AnnotationMode } from '../../enum/annotation.enum.tsx';
import { AnnotationMethodSelectComponent } from "./annotation-method-select.component.tsx";
import { AnnotationGoalCreateInputComponent } from "./annotation-goal-create-input.component.tsx";
import { AnnotatorsSelectComponent } from "./annotators-select.component.tsx";
import { InstructionUrlInputComponent } from "./instruction-url-input.component.tsx";
import { AnnotationModeSelectComponent } from "./annotation-mode-select.component.tsx";
import { ConfidenceSetSelectComponent } from "./confidence-set-select.component.tsx";
import { AnnotationSetSelectComponent } from "./annotation-set-select.component.tsx";
import { SpectroConfigurationsSelectComponent } from "./spectro-configurations-select.component.tsx";
import { DatasetsSelectComponent } from "./datasets-select.component.tsx";


export const CreateAnnotationCampaign: FC = () => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [selectedSpectrogramConfigurations, setSelectedSpectrogramConfigurations] = useState<Array<DatasetListItemSpectros>>([]);
  const [selectedAnnotators, setSelectedAnnotators] = useState<UserList>([]);
  const [instructionURL, setInstructionURL] = useState<string>('');
  const [selectedConfidenceIndicatorSet, setSelectedConfidenceIndicatorSet] = useState<ConfidenceSetListItem | undefined>(undefined);
  const [selectedAnnotationSet, setSelectedAnnotationSet] = useState<AnnotationSetListItem | undefined>(undefined);
  const [selectedDataset, setSelectedDataset] = useState<DatasetListItem | undefined>(undefined);
  const [annotationMethod, setAnnotationMethod] = useState<AnnotationMethod>(AnnotationMethod.notSelected);
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>(AnnotationMode.boxes);
  const [annotationGoal, setAnnotationGoal] = useState<number>(0);

  const [confidenceIndicatorSets, setConfidenceIndicatorSets] = useState<ConfidenceSetList>([]);
  const [users, setUsers] = useState<UserList>([]);
  const [annotationSets, setAnnotationSets] = useState<AnnotationSetList>([]);
  const [spectrogramConfigurations, setSpectrogramConfigurations] = useState<Array<DatasetListItemSpectros> | undefined>(undefined);
  const [datasets, setDatasets] = useState<DatasetList>([]);
  const [error, setError] = useState<any | undefined>(undefined);

  const history = useHistory();
  const campaignService = useAnnotationCampaignAPI();
  const confidenceSetService = useConfidenceSetAPI();
  const annotationSetService = useAnnotationSetAPI();
  const userService = useUsersAPI();
  const datasetService = useDatasetsAPI();

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      datasetService.list('.wav').then(setDatasets),
      userService.list().then(setUsers),
      annotationSetService.list().then(setAnnotationSets),
      confidenceSetService.list().then(setConfidenceIndicatorSets)
    ]).catch(e => {
      if (isCancelled) return;
      setError(e);
    })

    return () => {
      isCancelled = true;
      campaignService.abort();
      datasetService.abort();
      userService.abort();
      annotationSetService.abort();
      confidenceSetService.abort();
    }
  }, [])

  useCallback(() => {
    setSpectrogramConfigurations(selectedDataset?.spectros);
    setSelectedSpectrogramConfigurations([]);
  }, [selectedDataset]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined)
    try {
      console.debug(selectedDataset ? [selectedDataset] : [])

      await campaignService.create({
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
      })
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

        <DatasetsSelectComponent availableDatasets={datasets}
                                 setSelectedDataset={setSelectedDataset}/>

        <SpectroConfigurationsSelectComponent availableSpectroConfigurations={spectrogramConfigurations}
                                              setAvailableSpectroConfigurations={setSpectrogramConfigurations}
                                              selectedSpectroConfigurations={selectedSpectrogramConfigurations}
                                              setSelectedSpectroConfigurations={setSelectedSpectrogramConfigurations}/>

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

        <AnnotationSetSelectComponent annotationSets={ annotationSets }
                                      selectAnnotationSet={ setSelectedAnnotationSet }/>

        <ConfidenceSetSelectComponent confidenceSets={ confidenceIndicatorSets }
                                      selectConfidence={ setSelectedConfidenceIndicatorSet }/>

        <AnnotationModeSelectComponent annotationMode={ annotationMode }
                                       setAnnotationMode={ setAnnotationMode }/>

        <AnnotatorsSelectComponent users={ users }
                                   setUsers={ setUsers }
                                   annotators={ selectedAnnotators }
                                   setAnnotators={ setSelectedAnnotators }
                                   annotationGoal={ annotationGoal }
                                   setAnnotationGoal={ setAnnotationGoal }/>

        <InstructionUrlInputComponent instructionURL={ instructionURL }
                                      setInstructionURL={ setInstructionURL }/>

        <AnnotationGoalCreateInputComponent annotationGoal={ annotationGoal }
                                            setAnnotationGoal={ setAnnotationGoal }
                                            annotators={ selectedAnnotators }
                                            filesCounts={ selectedDataset?.files_count }/>

        <AnnotationMethodSelectComponent annotationMethod={ annotationMethod }
                                         setAnnotationMethod={ setAnnotationMethod }/>

        <div className="text-center">
          <input className="btn btn-primary" type="submit" value="Submit"/>
        </div>
      </form>
    </div>
  );
}
