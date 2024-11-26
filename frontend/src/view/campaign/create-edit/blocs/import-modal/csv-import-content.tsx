import React, { Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import { IonButton, IonCheckbox } from "@ionic/react";
import { WarningMessage } from "@/components/warning/warning-message.component";
import { DragNDropFileInput, DragNDropState, FormBloc } from "@/components/form";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { ACCEPT_CSV_MIME_TYPE, ACCEPT_CSV_SEPARATOR, IMPORT_ANNOTATIONS_COLUMNS } from "@/consts/csv.ts";
import { importAnnotationsActions } from "@/slices/create-campaign/import-annotations.ts";
import { useImportAnnotations } from "@/services/create-campaign/import-annotations.ts";
import { buildErrorMessage } from "@/services/utils/format.tsx";

interface Props {
  cancelButton: ReactNode;
  onFileImported: (file: File) => void;
}

export const CSVImportContent: React.FC<Props> = ({ cancelButton, onFileImported: _onFileImported }) => {

  // Form data
  const dispatch = useAppDispatch();
  const {
    filename,
    errors,
    status
  } = useAppSelector(state => state.createCampaignForm.importAnnotations);

  // Services
  const { loadFile } = useImportAnnotations();

  const onFileImported = (file: File) => {
    loadFile(file);
    _onFileImported(file);
  }

  const dragNDropLoaded =
    <DragNDropFileInput state={ DragNDropState.fileLoaded }
                        filename={ filename ?? '' }
                        onReset={ () => dispatch(importAnnotationsActions.clear()) }/>

  const loadingContent =
    <Fragment>
      <DragNDropFileInput state={ DragNDropState.loading }/>

      <div id="buttons">{ cancelButton }</div>
    </Fragment>


  const errorsTypes = useMemo(() => errors.map(e => e.type), [ errors ]);
  switch (status) {
    case 'empty':
      return (
        <Fragment>
          <DragNDropFileInput state={ DragNDropState.available }
                              label="Import annotations (csv)"
                              accept={ ACCEPT_CSV_MIME_TYPE }
                              onFileImported={ onFileImported }/>

          <div id="buttons">{ cancelButton }</div>
        </Fragment>
      )
    case 'loading':
      return loadingContent
    case 'errors':
      if (errorsTypes.includes('unrecognised file')) {
        const e = errors.find(e => e.type === 'unrecognised file')?.error ?? ''
        return <UnrecognizedCSVError dragNDrop={ dragNDropLoaded }
                                     cancelButton={ cancelButton }
                                     error={ buildErrorMessage(e) }/>;
      }
      if (errorsTypes.includes('contains unrecognized dataset'))
        return <UnrecognizedDatasetWithButtons dragNDrop={ dragNDropLoaded } cancelButton={ cancelButton }/>
      return;
    case 'edit-detectors':
      return loadingContent;
  }
}

interface ContentProps {
  dragNDrop: ReactNode;
  cancelButton: ReactNode;
}

const UnrecognizedCSVError: React.FC<ContentProps & { error: string; }> = ({ cancelButton, dragNDrop, error }) => (
  <Fragment>
    <div id="content">
      { dragNDrop }
      <WarningMessage>
        <p>
          Unrecognized file.
          <br/>
          { error }
        </p>
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
  const [ datasetSelection, setDatasetSelection ] = useState<Map<string, boolean>>(new Map());
  const canValidateDatasets = useMemo(() => [ ...datasetSelection.values() ].includes(true), [ datasetSelection ]);

  // Form data
  const { datasetName, initialRows } = useAppSelector(state => state.createCampaignForm.importAnnotations);
  const dispatch = useAppDispatch();

  useEffect(() => {
    setDatasetSelection(new Map(initialRows.map(r => [ r.dataset, true ])))
  }, [ initialRows ])

  const save = () => {
    const selection: string[] = [ ...datasetSelection.entries() ]
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([ _, isSelected ]) => isSelected)
      .map(([ dataset ]) => dataset);
    dispatch(importAnnotationsActions.setSelectedDatasets(selection))
  }

  return (
    <Fragment>
      <div id="content">
        { dragNDrop }
        <WarningMessage>
          <p>The selected file contains unrecognized dataset{ datasetSelection.size > 0 && 's' }</p>
        </WarningMessage>
        <FormBloc label="Dataset founds">
          { [ ...datasetSelection.entries() ].map(([ dataset, checked ]) => (
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

