import React, { DragEvent, Fragment, useState } from "react";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { cloudUploadOutline, refreshOutline } from "ionicons/icons";
import './drag-n-drop-file-input.css';

type Props = {
  state: 'loading';
  filename?: undefined;
  label?: undefined;
  accept?: undefined;
  onReset?: undefined;
  onFileImported?: undefined;
} | {
  state: 'available';
  label: string;
  accept: string;
  onFileImported: (file: File) => void;
  filename?: undefined;
  onReset?: undefined;
} | {
  state: 'file-loaded';
  filename: string;
  onReset: () => void;
  label?: undefined;
  accept?: undefined;
  onFileImported?: undefined;
}

export enum DragNDropState {
  available = 'available',
  loading = 'loading',
  fileLoaded = 'file-loaded'
}

export const DragNDropFileInput: React.FC<Props> = ({
                                                      state,
                                                      accept,
                                                      label,
                                                      filename,
                                                      onReset,
                                                      onFileImported
                                                    }) => {
  const [isDraggingHover, setIsDraggingHover] = useState<boolean>(false);


  const handleClick = () => {
    if (state !== 'available') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.click();

    input.oninput = () => handleInput(input.files ?? undefined)
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (state !== 'available') return;
    setIsDraggingHover(false);
    handleInput(event.dataTransfer.files)
  }

  const handleInput = (files?: FileList) => {
    const _file = files?.item(0);
    if (!_file || !onFileImported) return;
    if (!accept.includes(_file.type)) return;
    onFileImported(_file)
  }

  return (
    <div id="drag-n-drop-zone"
         onClick={ handleClick }
         onDrop={ handleDrop }
         onDragOver={ event => {
           setIsDraggingHover(true);
           event.preventDefault();
         } }
         onDragEnter={ () => setIsDraggingHover(true) }
         onDragLeave={ () => setIsDraggingHover(false) }
         onDragEnd={ () => setIsDraggingHover(false) }
         className={ dragZoneClass.join(' ') }>

      { state === 'available' && <Fragment>
          <IonIcon icon={ cloudUploadOutline }/>
        { label }
      </Fragment> }

      { state === 'loading' && <IonSpinner color="primary"/> }

      { state === 'file-loaded' && <Fragment>
          <p>{ filename }</p>

          <IonButton onClick={ onReset } className='ion-text-wrap'>
              Reset
              <IonIcon icon={ refreshOutline } slot="end"/>
          </IonButton>
      </Fragment> }

    </div>
  )
}
