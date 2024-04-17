import React, { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { IonButton, IonCheckbox, IonRadio, IonRadioGroup } from "@ionic/react";
import { WarningMessage } from "@/components/warning/warning-message.component.tsx";
import { FormBloc, DragNDropFileInput, DragNDropState } from "@/components/form";
import { useAppSelector, useAppDispatch } from "@/slices/app.ts";
import { ACCEPT_CSV_MIME_TYPE, ACCEPT_CSV_SEPARATOR, IMPORT_ANNOTATIONS_COLUMNS } from "@/consts/csv.ts";
import { importAnnotationsActions } from "@/slices/create-campaign/import-annotations.ts";
import { useImportAnnotations } from "@/services/create-campaign/import-annotations.ts";

interface Props {
  cancelButton: ReactNode;
}

export const CSVImportContent: React.FC<Props> = ({ cancelButton }) => {

  // Form data
  const dispatch = useAppDispatch();
  const {
    filename,
    errors,
    status
  } = useAppSelector(state => state.createCampaignForm.importAnnotations);

  // Services
  const service = useImportAnnotations();

  const dragNDropLoaded =
    <DragNDropFileInput state={ DragNDropState.fileLoaded }
                        filename={ filename ?? '' }
                        onReset={ () => dispatch(importAnnotationsActions.clear()) }/>

  const loadingContent =
    <Fragment>
      <DragNDropFileInput state={ DragNDropState.loading }/>

      <div id="buttons">{ cancelButton }</div>
    </Fragment>

  switch (status) {
    case 'empty':
      return (
        <Fragment>
          <DragNDropFileInput state={ DragNDropState.available }
                              label="Import annotations (csv)"
                              accept={ ACCEPT_CSV_MIME_TYPE }
                              onFileImported={ file => service.loadFile(file) }/>

          <div id="buttons">{ cancelButton }</div>
        </Fragment>
      )
    case 'loading':
      return loadingContent
    case 'errors':
      if (errors.includes('unrecognised file'))
        return <UnrecognizedCSVError dragNDrop={ dragNDropLoaded } cancelButton={ cancelButton }/>;
      if (errors.includes('contains unrecognized dataset'))
        return <UnrecognizedDatasetWithButtons dragNDrop={ dragNDropLoaded } cancelButton={ cancelButton }/>
      if (errors.includes('inconsistent max confidence'))
        return <InconsistentMaxConfidenceWithButtons dragNDrop={ dragNDropLoaded } cancelButton={ cancelButton }/>
      return;
    case 'edit-detectors':
      return loadingContent;
  }
}

interface ContentProps {
  dragNDrop: ReactNode;
  cancelButton: ReactNode;
}

const UnrecognizedCSVError: React.FC<ContentProps> = ({ cancelButton, dragNDrop }) => (
  <Fragment>
    <div id="content">
      { dragNDrop }
      <WarningMessage>
        <p>Unrecognized file.<br/>Check the file is a CSV and has the correct format and separator</p>
      </WarningMessage>

      <p>
        The file should have the following columns: { IMPORT_ANNOTATIONS_COLUMNS.required.map(c => (
        <Fragment key={ c }>
          <span className="bold">{ c }</span>
          <span className="separator">, </span>
        </Fragment>
      )) }
      </p>

      <p>
        The file can have additional optional columns: { IMPORT_ANNOTATIONS_COLUMNS.optional.map(c => (
        <Fragment key={ c }>
          <span className="bold">{ c }</span>
          <span className="separator">, </span>
        </Fragment>
      )) }
      </p>

      <p>The accepted separator is: <span className="bold">{ ACCEPT_CSV_SEPARATOR }</span></p>
    </div>
    <div id="buttons">{ cancelButton }</div>
  </Fragment>
)

const UnrecognizedDatasetWithButtons: React.FC<ContentProps> = ({ cancelButton, dragNDrop }) => {
  const [datasetSelection, setDatasetSelection] = useState<Map<string, boolean>>(new Map());
  const canValidateDatasets = useMemo(() => [...datasetSelection.values()].includes(true), [datasetSelection]);

  // Form data
  const { datasetName, rows } = useAppSelector(state => state.createCampaignForm.importAnnotations);

  // Services
  const service = useImportAnnotations();

  useEffect(() => {
    setDatasetSelection(new Map(service.distinctDatasets.map(d => [d, true])))
  }, [rows])

  const save = () => {
    const selection = []
    for (const entry of datasetSelection.entries()) {
      if (entry[1]) selection.push(entry[0]);
    }

    service.keepDatasets(selection);
  }

  return (
    <Fragment>
      <div id="content">
        { dragNDrop }
        <WarningMessage>
          <p>The selected file contains unrecognized dataset{ datasetSelection.size > 0 && 's' }</p>
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
                   className="ion-text-wrap"
                   onClick={ save }>
          Use selected datasets as "{ datasetName }"
        </IonButton>
      </div>
    </Fragment>
  )
}

const InconsistentMaxConfidenceWithButtons: React.FC<ContentProps> = ({ cancelButton, dragNDrop }) => {
  const [confidenceMaxLevel, setConfidenceMaxLevel] = useState<number>(0);

  // Services
  const service = useImportAnnotations();

  const save = () => {
    service.keepMaxConfidence(confidenceMaxLevel)
  }

  return (
    <Fragment>
      <div id="content">
        { dragNDrop }
        <WarningMessage>
          <p>
            Inconsistent confidence indicator max level:
            <br/>
            found { service.distinctMaxConfidence.size } different max
          </p>
        </WarningMessage>
        <FormBloc label="Confidence indicator max level">
          <IonRadioGroup value={ confidenceMaxLevel } onIonChange={ e => setConfidenceMaxLevel(e.detail.value) }>
            { [...service.distinctMaxConfidence.entries()].map(([max, occurrences]) => (
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
                   onClick={ save }>
          Use { confidenceMaxLevel } as maximum for confidence level
        </IonButton>
      </div>
    </Fragment>
  )
}
