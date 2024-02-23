import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IonButton,
  IonChip,
  IonIcon,
  IonInput,
  IonLabel,
  IonNote,
  IonTextarea,
  useIonToast
} from "@ionic/react";
import {
  AnnotationSetList,
  AnnotationSetListItem,
  ConfidenceSetList,
  ConfidenceSetListItem,
  DatasetList,
  DatasetListItem,
  DatasetListItemSpectros,
  DetectorList,
  useAnnotationCampaignAPI,
  useAnnotationSetAPI,
  useConfidenceSetAPI,
  useDatasetsAPI,
  useDetectorsAPI,
  UserList,
  UserListItem,
  useUsersAPI
} from "../../services/api";
import { closeCircle } from "ionicons/icons";
import { Searchbar } from "../../components/form/searchbar/searchbar.component.tsx";
import { buildErrorMessage } from "../../services/format/format.util.tsx";
import { AnnotationBloc } from "./annotation-bloc/annotation-bloc.component.tsx";
import { InputRef } from "../../components/form/interface.tsx";
import { Select } from "../../components/form/select/select.component.tsx";
import { FormBloc } from "../../components/form/bloc/form-bloc.component.tsx";
import { AnnotationMode, Usage } from "../../enum/annotation.enum.tsx";
import { CSVData } from "./import-annotations-modal/csv-import.tsx";
import { useHistory } from "react-router-dom";
import './create-edit-campaign.css';
import { Input } from "../../components/form/input/input.tsx";

export const CreateCampaign: React.FC = () => {

  // Global infos
  const [name, setName] = useState<string | null>();
  const [description, setDescription] = useState<string | null>();
  const [instructionURL, setInstructionURL] = useState<string | null>();
  const [startDate, setStartDate] = useState<string | null>();
  const [endDate, setEndDate] = useState<string | null>();

  // Data
  const [allDatasets, setAllDatasets] = useState<DatasetList>([]);
  const [dataset, setDataset] = useState<DatasetListItem | undefined>(undefined);
  const [datasetSpectroConfig, setDatasetSpectroConfig] = useState<Array<DatasetListItemSpectros>>([]);
  useEffect(() => {
    setDatasetSpectroConfig(dataset?.spectros ?? [])
    setActiveSpectroIDs(dataset?.spectros.map(s => s.id) ?? [])
  }, [dataset]);
  const [activeSpectroIDs, setActiveSpectroIDs] = useState<Array<number>>([]);
  const datasetRef = useRef<InputRef | null>(null);

  // Annotators
  const [allAnnotators, setAllAnnotators] = useState<UserList>([]);
  const [annotators, setAnnotators] = useState<UserList>([]);
  const [annotatorsPerFile, setAnnotatorsPerFile] = useState<number>(0);
  useEffect(() => setAnnotatorsPerFile(annotators.length), [annotators]);
  const annotatedFilesCount = useMemo(() => {
    if (!dataset?.files_count || !annotators.length) return 0;
    return Math.round(dataset.files_count * annotatorsPerFile / annotators.length);
  }, [dataset?.files_count, annotatorsPerFile, annotators.length])
  const annotatedFilesPercent = useMemo(() => {
    if (!dataset?.files_count || !annotatedFilesCount) return 0;
    return Math.round(annotatedFilesCount / dataset?.files_count * 100);
  }, [dataset?.files_count, annotatedFilesCount])

  // API Services
  const datasetsAPI = useDatasetsAPI();
  const usersAPI = useUsersAPI();
  const annotationSetAPI = useAnnotationSetAPI();
  const confidenceSetAPI = useConfidenceSetAPI();
  const detectorsAPI = useDetectorsAPI();
  const campaignAPI = useAnnotationCampaignAPI();

  const [presentToast, dismissToast] = useIonToast();

  // Annotations
  const annotationRef = useRef<InputRef | null>(null);
  const [allAnnotationSets, setAllAnnotationSets] = useState<AnnotationSetList>([]);
  const [allConfidenceSets, setAllConfidenceSets] = useState<ConfidenceSetList>([]);
  const [allDetectors, setAllDetectors] = useState<DetectorList>([]);
  const [mode, setMode] = useState<Usage | undefined>();
  const [annotationSet, setAnnotationSet] = useState<AnnotationSetListItem | undefined>();
  const [confidenceSet, setConfidenceSet] = useState<ConfidenceSetListItem | undefined>();
  const [data, setData] = useState<CSVData | undefined>();

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      datasetsAPI.list('.wav').then(setAllDatasets),
      usersAPI.list().then(setAllAnnotators),
      annotationSetAPI.list().then(setAllAnnotationSets),
      confidenceSetAPI.list().then(setAllConfidenceSets),
      detectorsAPI.list().then(setAllDetectors),
    ]).catch(e => {
      if (isCancelled) return;
      presentToast({
        message: buildErrorMessage(e),
        color: 'danger',
        buttons: [
          {
            icon: closeCircle,
            handler: () => dismissToast()
          }
        ]
      })
    })

    document.addEventListener('click', handleClicks)
    return () => {
      isCancelled = true;
      datasetsAPI.abort();
      usersAPI.abort();
      annotationSetAPI.abort();
      confidenceSetAPI.abort();
      detectorsAPI.abort();
      campaignAPI.abort();
      document.removeEventListener('click', handleClicks);
    }
  }, [])

  const handleClicks = (e: MouseEvent) => {
    datasetRef.current?.blur(e);
    annotationRef.current?.blur(e);
  }

  const showUser = (user: UserListItem): string => {
    if (user.first_name && user.last_name) return `${ user.first_name } ${ user.last_name }`;
    else return user.username;
  }

  const history = useHistory();

  // Submit

  const handleSubmit = async () => {
    try {
      switch (mode) {
        case Usage.create:
          await campaignAPI.create({
            name: name!.trim(),
            desc: description?.trim(),
            datasets: [dataset!.id],
            spectro_configs: activeSpectroIDs,
            annotation_set_id: annotationSet?.id,
            confidence_indicator_set_id: confidenceSet?.id,
            annotation_scope: AnnotationMode.wholeFile,
            annotators: annotators.map(a => a.id),
            annotation_goal: annotatorsPerFile,
            instructions_url: instructionURL?.trim(),
            start: startDate ? startDate.trim() + 'T00:00' : undefined,
            end: endDate ? endDate.trim() + 'T00:00' : undefined,
            usage: mode
          });
          break;
        case Usage.check:
          await campaignAPI.create({
            name: name!.trim(),
            desc: description?.trim(),
            datasets: [dataset!.id],
            detectors: data!.detectors,
            spectro_configs: activeSpectroIDs,
            annotation_set_labels: data!.labels.filter(l => !!l),
            confidence_set_indicators: data!.confidence_indicators,
            annotation_scope: AnnotationMode.wholeFile,
            annotators: annotators.map(a => a.id),
            annotation_goal: annotatorsPerFile,
            instructions_url: instructionURL?.trim(),
            start: startDate ? startDate.trim() + 'T00:00' : undefined,
            end: endDate ? endDate.trim() + 'T00:00' : undefined,
            usage: mode,
            results: data!.results.filter(r => !!r.tag)
          });
          break;
      }

      history.push('/annotation-campaigns');
    } catch (e: any) {
      if (e.status && e.response) {
        // Build an error message
        const message = Object
          .entries(e.response.body)
          .map(([key, value]) => Array.isArray(value) ? `${ key }: ${ value.join(' - ') }` : '')
          .join("\n");
        presentToast({
          color: 'danger',
          buttons: ['Ok'],
          message: message.length > 0 ? message : JSON.stringify(e.response.body)
        });
      }
    }
  }

  return (
    <div id="create-campaign-form" className="col-sm-9 border rounded">
      <h1>Create Annotation Campaign</h1>

      <FormBloc>
        <Input/>
        <div>
          <IonLabel className="mandatory">Name*</IonLabel>
          <IonInput placeholder="Campaign name" required={ true } type="text"
                    value={ name } onIonInput={ e => setName(e.detail.value) }></IonInput>
        </div>

        <div>
          <IonLabel>Description</IonLabel>
          <IonTextarea placeholder="Enter your campaign description"
                       autoGrow={ true }
                       value={ description } onIonChange={ e => setDescription(e.detail.value) }></IonTextarea>
        </div>

        <div>
          <IonLabel>Instruction URL</IonLabel>
          <IonInput placeholder="url" type="url"
                    value={ instructionURL } onIonChange={ e => setInstructionURL(e.detail.value) }></IonInput>
        </div>

        <div id="dates-input">
          <div>
            <IonLabel>Start</IonLabel>
            <IonInput type="date"
                      value={ startDate } onIonChange={ e => setStartDate(e.detail.value) }></IonInput>
          </div>

          <div>
            <IonLabel>End</IonLabel>
            <IonInput type="date"
                      value={ endDate } onIonChange={ e => setEndDate(e.detail.value) }></IonInput>
          </div>
        </div>
      </FormBloc>

      <FormBloc label="Data">
        <Select label="Dataset"
                ref={ datasetRef }
                required={ true }
                placeholder="Select a dataset"
                options={ allDatasets.map(d => ({ id: d.id, label: d.name })) }
                optionsContainer="alert"
                value={ dataset?.id }
                onValueSelected={ value => setDataset(allDatasets.find(d => d.id === value)) }/>

        <div aria-disabled={ datasetSpectroConfig.length <= 0 }>
          <IonLabel className="mandatory">Spectrogram configurations</IonLabel>
          <div className="chips-container">
            { datasetSpectroConfig.map(c => {
              const isActive = activeSpectroIDs.includes(c.id);
              return (
                <IonChip color="secondary" outline={ !isActive } key={ c.id }
                         onClick={ () => {
                           if (isActive) setActiveSpectroIDs(activeSpectroIDs.filter(id => id !== c.id));
                           else setActiveSpectroIDs([...activeSpectroIDs, c.id]);
                         } }>
                  { c.name }
                  { isActive && <IonIcon icon={ closeCircle }/> }
                </IonChip>
              )
            }) }
          </div>
          { !dataset &&
              <IonNote color="danger">You must select a dataset to choose the spectrogram configurations you want to
                  annotate</IonNote> }
        </div>
      </FormBloc>

      <AnnotationBloc ref={ annotationRef }
                      allAnnotationSets={ allAnnotationSets }
                      allConfidenceSets={ allConfidenceSets }
                      detectors={ allDetectors }
                      dataset={ dataset }
                      setData={ setData }
                      mode={ mode } setMode={ setMode }
                      annotationSet={ annotationSet } setAnnotationSet={ setAnnotationSet }
                      confidenceSet={ confidenceSet } setConfidenceSet={ setConfidenceSet }/>

      <FormBloc label="Annotators">
        <div>
          <Searchbar placeholder="Search annotator..."
                     values={ allAnnotators.filter(a => !annotators.find(annotator => annotator.id === a.id)) }
                     show={ showUser }
                     onValueSelected={ (annotator: UserListItem) => setAnnotators([...new Set([...annotators, annotator])]) }></Searchbar>
          <div className="chips-container">{ annotators.map(annotator => {
            return (
              <IonChip color="secondary" key={ annotator.id }
                       onClick={ () => setAnnotators(annotators.filter(a => annotator.id !== a.id)) }>
                { showUser(annotator) }
                <IonIcon icon={ closeCircle }/>
              </IonChip>
            )
          }) }</div>
        </div>

        <div aria-disabled={ annotators.length <= 0 }>
          <div className="inline">
            <IonLabel>Wanted number of annotators per file</IonLabel>
            <IonInput type="number"
                      maxlength={ 3 }
                      max={ annotators.length ?? 0 }
                      min={ annotators.length > 0 ? 1 : 0 }
                      value={ annotatorsPerFile } onIonChange={ e => {
              if (!e.detail.value) setAnnotatorsPerFile(0);
              else setAnnotatorsPerFile(+e.detail.value)
            } }></IonInput>
          </div>
          <IonNote>
            Each annotator will annotate { annotatedFilesCount } / { dataset?.files_count ?? 0 } files
            ({ annotatedFilesPercent }%)
          </IonNote>
        </div>
      </FormBloc>

      <IonButton color="primary"
                 onClick={ handleSubmit }>Create campaign</IonButton>
    </div>
  )
}
