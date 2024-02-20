import React, { useState, DragEvent, useImperativeHandle, Fragment } from "react";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { cloudUploadOutline } from "ionicons/icons";
import './drag-n-drop-zone.component.css';

export interface DragNDropRef {
  endLoading: () => void;
  abortImport: () => void;
}

interface Props {
  label: string;
  accept: string;
  onFileLoaded: (file?: File) => void;
}

enum State {
  available = 'available',
  loading = 'loading',
  fileLoaded = 'file-loaded'
}

export const DragNDropZone = React.forwardRef<DragNDropRef, Props>(({
                                                                      label,
                                                                      accept,
                                                                      onFileLoaded
                                                                    }, ref) => {
  const [state, setState] = useState<State>(State.available);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [file, setFile] = useState<File | undefined | null>();

  const handleClick = () => {
    if (state !== State.available) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.click();

    input.oninput = () => handleInput(input.files ?? undefined)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (state !== State.available) return;
    setIsDraggingOver(false);
    handleInput(event.dataTransfer.files)
  }

  const _ref: DragNDropRef = {
    endLoading: () => setState(State.fileLoaded),
    abortImport: () => setState(State.available),
  }
  useImperativeHandle(ref, () => _ref);


  const handleInput = (files?: FileList) => {
    setFile(files?.item(0));
    onFileLoaded(files?.item(0) ?? undefined)
    return;
  }

  return (
    <div id="drag-n-drop-zone"
         onClick={ handleClick }
         onDrop={ handleDrop }
         onDragOver={ event => {
           setIsDraggingOver(true);
           event.preventDefault();
         } }
         onDragEnter={ () => setIsDraggingOver(true) }
         onDragLeave={ () => setIsDraggingOver(false) }
         onDragEnd={ () => setIsDraggingOver(false) }
         className={ `${ state } ${ state === State.available && isDraggingOver ? 'dragging' : '' }` }>

      { state === State.available && <Fragment>
          <IonIcon icon={ cloudUploadOutline }/>
        { label }
      </Fragment> }
      { state === State.loading && <IonSpinner color="primary"/> }
      { state === State.fileLoaded && <Fragment>
        { file?.name }
          <IonButton onClick={ () => {
            setState(State.available);
            setFile(undefined)
            onFileLoaded(undefined);
          } }>
              Import another file
              <IonIcon icon={ cloudUploadOutline } slot="end"/>
          </IonButton>
      </Fragment> }

    </div>
  )
})
