import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { DragNDropRef, DragNDropZone } from "../../../components/form/drag-n-drop/drag-n-drop-zone.component.tsx";
import { IonButton, IonCheckbox, IonRadio, IonRadioGroup } from "@ionic/react";
import { formatCSV } from "../../../services/format/format.util.tsx";
import { DatasetListItem } from "../../../services/api";
import { WarningMessage } from "../../../components/warning/warning-message.component.tsx";
import { FormBloc } from "../../../components/form/bloc/form-bloc.component.tsx";
import { CreateResultItem } from "../../../services/api/annotation-campaign-api.service.tsx";


const ACCEPT_MIME_TYPE = 'text/csv';
const ACCEPT_CSV_SEPARATOR = [','];

const COLUMNS = [
  'dataset',
  'filename',
  'start_time',
  'end_time',
  'start_frequency',
  'end_frequency',
  'start_datetime',
  'end_datetime',
  'annotation',
  'annotator',
  'is_box',
  'confidence_indicator_label',
  'confidence_indicator_level'
]
const OPTIONAL_COLUMNS = [
  'confidence_indicator_label',
  'confidence_indicator_level'
]

export interface Detector {
  detectorId?: number;
  detectorName: string;
  configurationId?: number;
  configuration: string
}

class CSVItem {
  dataset: string;
  filename: string;
  start_time: number;
  end_time: number;
  start_frequency: number;
  end_frequency: number;
  start_datetime: Date;
  end_datetime: Date;
  annotation: string;
  detector: string;
  detector_item?: Detector;
  is_box: boolean;
  confidence_indicator_label?: string;
  confidence_indicator_level?: number;
  confidence_indicator_max_level?: number;

  constructor(data: any) {
    this.dataset = data.dataset;
    this.filename = data.filename;
    this.start_time = +data.start_time;
    this.end_time = +data.end_time;
    this.start_frequency = +data.start_frequency;
    this.end_frequency = +data.end_frequency;
    this.start_datetime = new Date(data.start_datetime);
    this.end_datetime = new Date(data.end_datetime);
    this.annotation = data.annotation;
    this.detector = data.annotator;
    this.is_box = !!+data.is_box;
    const levels = data.confidence_indicator_level ? data.confidence_indicator_level.split('/') : [];
    this.confidence_indicator_level = levels.length > 0 ? +levels[0] : undefined;
    this.confidence_indicator_max_level = levels.length > 1 ? +levels[1] : undefined;
  }
}

export class CSVData {
  protected items: Array<CSVItem> = [];
  protected search?: DatasetListItem;

  protected constructor() {
  }

  public static get(data: Array<any>, searchedDataset: DatasetListItem): CSVData {
    const csvData = new CSVData();
    csvData.items = data.map(d => new CSVItem(d))
    csvData.search = searchedDataset;
    return csvData;
  }

  public static merge(data1?: CSVData, data2?: CSVData, search?: DatasetListItem): CSVData {
    const csvData = new CSVData();
    csvData.search = search;
    csvData.items = []
    if (data1) csvData.items.push(...data1.items);
    if (data2) csvData.items.push(...data2.items);
    return csvData;
  }

  get datasetNames(): Array<string> {
    return [...new Set(this.items.map(d => d.dataset))]
  }

  get allMaxConfidenceLevels(): Map<number, number> {
    const itemsMax = this.items.map(d => d.confidence_indicator_max_level);
    const allMax = [...new Set(itemsMax)].filter(n => n !== undefined) as Array<number>;
    return new Map(
      allMax.map(max => [
        max,
        itemsMax.reduce((a: number, b) => a + (b === max ? 1 : 0), 0)
      ])
    )
  }

  get detectorNames(): Array<string> {
    return [...new Set(this.items.map(d => d.detector))]
  }

  get detectors(): Array<Detector> {
    return [...new Set(this.items.map(d => d.detector_item).filter(d => !!d))] as Array<Detector>;
  }

  get labels(): Array<string> {
    return [...new Set(this.items.map(d => d.annotation))]
  }

  get confidence_indicators(): Array<[string, number]> {
    return [...new Set(this.items.map(d => {
      if (!d.confidence_indicator_label || d.confidence_indicator_level) return undefined;
      return [d.confidence_indicator_label, d.confidence_indicator_level]
    }))].filter(d => !!d) as Array<[string, number]>
  }

  get results(): Array<CreateResultItem> {
    return this.items.map(i => ({
      is_box: i.is_box,
      confidence: i.confidence_indicator_label,
      tag: i.annotation,
      min_time: i.start_time,
      max_time: i.end_time,
      min_frequency: i.start_frequency,
      max_frequency: i.end_frequency,
      dataset_file: i.filename,
      dataset: i.dataset,
      detector: i.detector_item!.detectorName!,
      detector_config: i.detector_item!.configuration
    }))
  }

  filterDetectors(detectors: Array<string>): CSVData {
    const csvData = new CSVData();
    csvData.search = this.search;
    csvData.items = this.items?.filter(i => detectors.includes(i.detector));
    return csvData;
  }

  confirmDatasets(datasets: Array<string>): CSVData {
    this.items = this.items?.filter(i => {
      if (i.dataset === this.search?.name) return true;
      return datasets.includes(i.dataset);
    }).map(i => {
      i.dataset = this.search!.name
      return i;
    })
    const csvData = new CSVData();
    csvData.items = this.items;
    csvData.search = this.search;
    return csvData;
  }

  confirmConfidenceMaxLevel(level: number): CSVData {
    this.items = this.items?.map(i => {
      i.confidence_indicator_max_level = level
      return i;
    })
    const csvData = new CSVData();
    csvData.items = this.items;
    csvData.search = this.search;
    return csvData;
  }

  confirmDetectors(detectors: Map<string, Detector>): CSVData {
    const csvData = new CSVData();
    csvData.search = this.search;

    csvData.items = this.items?.filter(i => !!detectors.get(i.detector))
      .map(item => ({
        ...item,
        detector_item: detectors.get(item.detector)
      }))

    return csvData;
  }
}


interface Props {
  searchedDataset: DatasetListItem;
  data?: CSVData;
  setData: (data?: CSVData) => void;
  onValidated: () => void;
  onDismiss: (data?: CSVData) => void;
}


export const CsvImport: React.FC<Props> = ({ onDismiss, searchedDataset, data, setData, onValidated }) => {
  const [unrecognizedFileError, setUnrecognizedFileError] = useState<boolean>(false);
  const dragRef = useRef<DragNDropRef | null>(null);

  const onFileLoaded = (file?: File) => {
    if (!file) {
      setUnrecognizedFileError(false)
      setData(undefined);
      return;
    }
    if (!file?.type || !ACCEPT_MIME_TYPE.includes(file?.type)) return handleUnrecognizedImport()

    // Read file!
    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onerror = handleUnrecognizedImport;
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result || typeof result !== 'string') return handleUnrecognizedImport();

      try {
        const data = formatCSV(result, ACCEPT_CSV_SEPARATOR, COLUMNS, OPTIONAL_COLUMNS);
        setData(CSVData.get(data, searchedDataset))
        if (!data) return handleUnrecognizedImport();
      } catch (e) {
        return handleUnrecognizedImport();
      }

      dragRef.current?.endLoading();
    }
  }

  const handleUnrecognizedImport = () => {
    setUnrecognizedFileError(true)
    dragRef.current?.endLoading();
  }

  return <Fragment>

    <DragNDropZone label="Import annotations (csv)"
                   accept={ ACCEPT_MIME_TYPE }
                   onFileLoaded={ onFileLoaded }
                   ref={ dragRef }/>

    <ImportContent searchedDataset={ searchedDataset }
                   isUnrecognizedFile={ unrecognizedFileError }
                   data={ data }
                   onDismiss={ onDismiss }
                   onValidated={ onValidated }
                   setData={ setData }></ImportContent>

  </Fragment>
}

interface ImportContentProps {
  searchedDataset: DatasetListItem;
  isUnrecognizedFile: boolean;
  data?: CSVData;
  setData: (data?: CSVData) => void;
  onDismiss: () => void;
  onValidated: () => void;
}

const ImportContent: React.FC<ImportContentProps> = ({
                                                       searchedDataset,
                                                       isUnrecognizedFile,
                                                       data,
                                                       setData,
                                                       onDismiss,
                                                       onValidated
                                                     }) => {
  const [datasetSelection, setDatasetSelection] = useState<Map<string, boolean>>(new Map());
  const canValidateDatasets = useMemo(() => [...datasetSelection.values()].includes(true), [datasetSelection]);

  const [confidenceMaxLevel, setConfidenceMaxLevel] = useState<number>(0);

  useEffect(() => {
    setDatasetSelection(new Map(
      data?.datasetNames.map(d => [d, true])
    ))
    if (data) setConfidenceMaxLevel(Math.max(...data.allMaxConfidenceLevels.keys(), 0))
    else setConfidenceMaxLevel(0)

    if (!data) return;
    if (data.datasetNames.find(d => d != searchedDataset.name)) return;
    if (data.allMaxConfidenceLevels.size > 1) return;
    onValidated();
  }, [data])

  const cancelButton = <IonButton color="medium" onClick={ () => onDismiss() }>Cancel</IonButton>;

  if (isUnrecognizedFile) {
    return (
      <Fragment>
        <div id="content">
          <WarningMessage>
            <p>Unrecognized file.<br/>Check the file is a CSV and has the correct format and separator</p>
          </WarningMessage>
          <p>The file should have the following columns: { COLUMNS.join(', ') }</p>
          <p>The file can have additional optional columns: { OPTIONAL_COLUMNS.join(', ') }</p>
          <p>The accepted separators are: { ACCEPT_CSV_SEPARATOR.map((s, i) => (
            <span key={ i }>
                  <span className="bold">{ s }</span>
              { i < ACCEPT_CSV_SEPARATOR.length - 1 && " " }
                </span>
          )) }</p>
        </div>
        <div id="buttons">
          { cancelButton }
        </div>
      </Fragment>
    )
  } else if (!!data && data.datasetNames.filter(d => d !== searchedDataset.name).length > 0) {
    // Handle unrecognized dataset in CSV file
    return (
      <Fragment>
        <div id="content">
          <WarningMessage>
            { !data.datasetNames.find(d => d === searchedDataset.name) &&
                <p>Cannot find dataset "{ searchedDataset.name }" in the selected file</p> }
            { data.datasetNames.find(d => d === searchedDataset.name) &&
                <p>The selected file contains multiple datasets</p> }
          </WarningMessage>
          <FormBloc label="Dataset founds">
            { [...datasetSelection.entries()].map(([dataset, checked]) => (
              <IonCheckbox labelPlacement="end" justify="start"
                           checked={ checked }
                           key={ dataset }
                           onIonChange={ event => {
                             const map = datasetSelection;
                             map.set(dataset, event.detail.checked)
                             setDatasetSelection(new Map(map));
                           } }>
                { dataset }
              </IonCheckbox>
            )) }
          </FormBloc>
        </div>
        <div id="buttons">
          { cancelButton }

          <IonButton disabled={ !canValidateDatasets }
                     aria-disabled={ !canValidateDatasets }
                     onClick={ () => {
                       setData(data.confirmDatasets([...datasetSelection.entries()].filter(([, checked]) => checked).map(([dataset]) => dataset)));
                     } }>
            Use selected datasets as "{ searchedDataset.name }"
          </IonButton>
        </div>
      </Fragment>
    )
  } else if (!!data && data.allMaxConfidenceLevels.size > 1) {
    // Handle inconsistent confidence indicator max level in CSV file
    return (
      <Fragment>
        <div id="content">
          <WarningMessage>
            <p>
              Inconsistent confidence indicator max level:
              <br/>
              found { data.allMaxConfidenceLevels.size } different max
            </p>
          </WarningMessage>
          <FormBloc label="Confidence indicator max level">
            <IonRadioGroup value={ confidenceMaxLevel } onIonChange={ e => setConfidenceMaxLevel(e.detail.value) }>
              { [...data.allMaxConfidenceLevels.entries()].map(([max, occurrences]) => (
                <IonRadio value={ max } key={ max } labelPlacement="end" justify="start">
                  { max } ({ occurrences } occurrences)
                </IonRadio>
              )) }
            </IonRadioGroup>
          </FormBloc>
        </div>
        <div id="buttons">
          { cancelButton }

          <IonButton disabled={ !confidenceMaxLevel }
                     aria-disabled={ !confidenceMaxLevel }
                     onClick={ () => {
                       setData(data.confirmConfidenceMaxLevel(confidenceMaxLevel));
                     } }>
            Use { confidenceMaxLevel } as maximum for confidence level
          </IonButton>
        </div>
      </Fragment>
    )
  }
  return <div id="buttons">{ cancelButton }</div>
}
