import React, { Fragment, ReactNode, useState } from "react";
import { WarningMessage } from "@/components/warning/warning-message.component";
import { DragNDropFileInput, DragNDropState } from "@/components/form";
import { useAppDispatch, useAppSelector } from '@/service/app';
import { ACCEPT_CSV_MIME_TYPE, ACCEPT_CSV_SEPARATOR, IMPORT_ANNOTATIONS_COLUMNS } from "@/consts/csv.ts";
import { clearImport, loadFile } from '@/service/campaign';

interface Props {
  cancelButton: ReactNode;
  onFileImported: (file: File) => void;
}

export const CSVImportContent: React.FC<Props> = ({ cancelButton, onFileImported: _onFileImported }) => {

  // State
  const dispatch = useAppDispatch();
  const [ file, setFile ] = useState<File | undefined>();
  const {
    fileData,
    error,
    isLoading,
  } = useAppSelector(state => state.campaign.resultImport)

  const onFileImported = (file: File) => {
    dispatch(loadFile(file));
    setFile(file);
    _onFileImported(file);
  }

  if (isLoading) {
    return <Fragment>
      <DragNDropFileInput state={ DragNDropState.loading }/>

      <div id="buttons">{ cancelButton }</div>
    </Fragment>
  }
  // No file has been given
  if (error) {
    return <UnrecognizedCSVError cancelButton={ cancelButton }
                                 filename={ file!.name }
                                 error={ error }/>;
  }
  if (!fileData) {
    return (
      <Fragment>
        <DragNDropFileInput state={ DragNDropState.available }
                            label="Import annotations (csv)"
                            accept={ ACCEPT_CSV_MIME_TYPE }
                            onFileImported={ onFileImported }/>

        <div id="buttons">{ cancelButton }</div>
      </Fragment>
    )
  }
  return <Fragment/>
}

interface ContentProps {
  cancelButton: ReactNode;
  filename: string;
}

const UnrecognizedCSVError: React.FC<ContentProps & { error: string; }> = ({ cancelButton, filename, error }) => {
  const dispatch = useAppDispatch();
  return <Fragment>
    <div id="content">
      <DragNDropFileInput state={ DragNDropState.fileLoaded }
                          filename={ filename ?? '' }
                          onReset={ () => dispatch(clearImport()) }/>
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
}

