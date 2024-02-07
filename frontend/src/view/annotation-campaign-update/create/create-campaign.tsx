import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IonButton,
  IonChip,
  IonIcon,
  IonInput,
  IonLabel,
  IonNote,
  IonTextarea, useIonToast
} from "@ionic/react";
import {
  DatasetListItem,
  DatasetList,
  useDatasetsAPI,
  DatasetListItemSpectros,
  useUsersAPI, UserList, UserListItem, useAnnotationSetAPI,
  AnnotationSetList, useConfidenceSetAPI, ConfidenceSetList
} from "../../../services/api";
import { closeCircle } from "ionicons/icons";
import { Searchbar } from "../../../components/form/searchbar/searchbar.component.tsx";
import { buildErrorMessage } from "../../../services/annotator/format/format.util.tsx";
import { AnnotationBloc } from "./annotation-bloc/annotation-bloc.component.tsx";
import { InputRef } from "../../../components/form/interface.tsx";
import { Select } from "../../../components/form/select/select.component.tsx";
import './create-campaign.css';

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

  const [presentToast, dismissToast] = useIonToast();

  // Annotations
  const annotationRef = useRef<InputRef | null>(null);
  const [allAnnotationSets, setAllAnnotationSets] = useState<AnnotationSetList>([]);
  const [allConfidenceSets, setAllConfidenceSets] = useState<ConfidenceSetList>([]);


  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      datasetsAPI.list('.wav').then(setAllDatasets),
      usersAPI.list().then(setAllAnnotators),
      annotationSetAPI.list().then(setAllAnnotationSets),
      confidenceSetAPI.list().then(setAllConfidenceSets)
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
      // campaignService.abort();
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

  return (
    <div id="create-campaign-form" className="col-sm-9 border rounded">
      <h1>Create Annotation Campaign</h1>

      <div className="bloc global-info">
        <div className="input-item">
          <IonLabel className="mandatory">Name</IonLabel>
          <IonInput placeholder="Campaign name" required={ true } type="text"
                    value={ name } onIonChange={ e => setName(e.detail.value) }></IonInput>
        </div>

        <div className="input-item">
          <IonLabel>Description</IonLabel>
          <IonTextarea placeholder="Enter your campaign description"
                       autoGrow={ true }
                       value={ description } onIonChange={ e => setDescription(e.detail.value) }></IonTextarea>
        </div>

        <div className="input-item">
          <IonLabel>Instruction URL</IonLabel>
          <IonInput placeholder="url" type="url"
                    value={ instructionURL } onIonChange={ e => setInstructionURL(e.detail.value) }></IonInput>
        </div>

        <div className="input-item date">
          <IonLabel>Start</IonLabel>
          <IonInput type="date"
                    value={ startDate } onIonChange={ e => setStartDate(e.detail.value) }></IonInput>
        </div>

        <div className="input-item date">
          <IonLabel>End</IonLabel>
          <IonInput type="date"
                    value={ endDate } onIonChange={ e => setEndDate(e.detail.value) }></IonInput>
        </div>
      </div>

      <div className="bloc data">
        <div className="separator">
          <div></div>
          Data
          <div></div>
        </div>

        <div className="input-item inline">
          <Select label="Dataset"
                  ref={ datasetRef }
                  required={ true }
                  placeholder="Select a dataset"
                  options={ allDatasets.map(d => ({ id: d.id, label: d.name })) }
                  optionsContainer="alert"
                  value={ dataset?.id }
                  onValueSelected={ value => setDataset(allDatasets.find(d => d.id === value)) }/>
        </div>

        <div className="input-item chips-selection" aria-disabled={ datasetSpectroConfig.length <= 0 }>
          <IonLabel className="mandatory">Spectrogram
            configurations</IonLabel>
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
          { !dataset &&
              <IonNote color="danger">You must select a dataset to choose the spectrogram configurations you want to
                  annotate</IonNote> }
        </div>
      </div>

      <AnnotationBloc ref={ annotationRef }
                      allAnnotationSets={ allAnnotationSets }
                      allConfidenceSets={ allConfidenceSets }
      />

      <div className="bloc annotators">
        <div className="separator">
          <div></div>
          Annotators
          <div></div>
        </div>

        <div className="input-item chips-selection">
          <Searchbar placeholder="Search annotator..."
                     values={ allAnnotators.filter(a => !annotators.find(annotator => annotator.id === a.id)) }
                     show={ showUser }
                     onValueSelected={ (annotator: UserListItem) => setAnnotators([...new Set([...annotators, annotator])]) }></Searchbar>
          { annotators.map(annotator => {
            return (
              <IonChip color="secondary" key={ annotator.id }
                       onClick={ () => setAnnotators(annotators.filter(a => annotator.id !== a.id)) }>
                { showUser(annotator) }
                <IonIcon icon={ closeCircle }/>
              </IonChip>
            )
          }) }
        </div>

        <div className="input-item inline" aria-disabled={ annotators.length <= 0 }>
          <IonLabel>Wanted number of annotators per file</IonLabel>
          <IonInput type="number"
                    maxlength={ 3 }
                    max={ annotators.length ?? 0 }
                    min={ annotators.length > 0 ? 1 : 0 }
                    value={ annotatorsPerFile } onIonChange={ e => {
            if (!e.detail.value) setAnnotatorsPerFile(0);
            else setAnnotatorsPerFile(+e.detail.value)
          } }></IonInput>
          <IonNote>
            Each annotator will annotate { annotatedFilesCount } / { dataset?.files_count ?? 0 } files
            ({ annotatedFilesPercent }%)
          </IonNote>
        </div>
      </div>

      <IonButton color="primary">Create campaign</IonButton>
    </div>
  )
}
