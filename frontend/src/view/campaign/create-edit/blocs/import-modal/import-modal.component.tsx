import React, { HTMLAttributes, ReactNode, useRef } from "react";
import { IonBreadcrumb, IonBreadcrumbs, IonButton, IonContent, IonIcon, IonModal } from "@ionic/react";
import { Detector } from "@/services/api";
import { chevronForwardOutline } from "ionicons/icons";
import { CSVImportContent } from "./csv-import-content.tsx";
import { DetectorsContent } from "./detectors-content.tsx";
import { useAppDispatch, useAppSelector } from "@/slices/app.ts";
import { importAnnotationsActions } from "@/slices/create-campaign/import-annotations.ts";
import './import-modal.component.css';
import { IonModalCustomEvent } from "@ionic/core/dist/types/components";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { DetectorsConfigContent } from "@/view/campaign/create-edit/blocs/import-modal/detectors-config-content.tsx";

type Props = {
  isOpen: boolean,
  setIsOpen: (value: boolean) => void;
  allDetectors: Array<Detector>,
  onFileImported: (file: File) => void;
} & HTMLAttributes<HTMLIonModalElement>


export const ImportModal: React.FC<Props> = ({
                                               isOpen,
                                               setIsOpen,
                                               allDetectors,
                                               onFileImported,
                                               ...modalArgs
                                             }) => {
  const modal = useRef<HTMLIonModalElement | null>(null);

  // Services
  const dispatch = useAppDispatch();
  const {
    status,
  } = useAppSelector(state => state.createCampaignForm.importAnnotations);

  const onDismiss = (event: IonModalCustomEvent<OverlayEventDetail>) => {
    setIsOpen(false);
    if (event.detail.role === 'validate') {
      dispatch(importAnnotationsActions.setStatus('done'))
    } else
      dispatch(importAnnotationsActions.clear())
  }

  return (
    <IonModal ref={ modal } { ...modalArgs } isOpen={ isOpen } onDidDismiss={ onDismiss }>
      <IonContent id="import-annotations-modal">
        <div id="header">
          <h1>Import annotations</h1>

          <IonBreadcrumbs>
            <IonBreadcrumb active={ [ 'empty', 'loading', 'errors' ].includes(status) }>
              CSV Import
              <IonIcon slot="separator" icon={ chevronForwardOutline }></IonIcon>
            </IonBreadcrumb>
            <IonBreadcrumb active={ status === 'edit-detectors' }>
              Detectors
              <IonIcon slot="separator" icon={ chevronForwardOutline }></IonIcon>
            </IonBreadcrumb>
          </IonBreadcrumbs>
        </div>

        <ImportModalContent allDetectors={ allDetectors }
                            onFileImported={ onFileImported }
                            cancelButton={ <IonButton color="medium"
                                                      onClick={ () => modal.current?.dismiss(undefined, 'cancel') }>Cancel</IonButton> }
                            onDone={ () => modal.current?.dismiss(undefined, 'validate') }/>
      </IonContent>
    </IonModal>
  )
}

interface ImportModalContentProps {
  allDetectors: Array<Detector>,
  onDone: () => void,
  cancelButton: ReactNode,
  onFileImported: (file: File) => void;
}

export const ImportModalContent: React.FC<ImportModalContentProps> = ({
                                                                        allDetectors,
                                                                        cancelButton,
                                                                        onDone,
                                                                        onFileImported
                                                                      }) => {
  // Form data
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(state => state.createCampaignForm.importAnnotations)

  if ([ 'empty', 'loading', 'errors' ].includes(status))
    return <CSVImportContent cancelButton={ cancelButton } onFileImported={ onFileImported }/>

  if (status === 'edit-detectors')
    return <DetectorsContent cancelButton={ cancelButton }
                             allDetectors={ allDetectors }
                             save={ () => {
                               dispatch(importAnnotationsActions.setStatus('edit-detectors-config'))
                             } }/>

  if (status === 'edit-detectors-config')
    return <DetectorsConfigContent cancelButton={ cancelButton }
                                   save={ onDone }/>

  return <div id="buttons">{ cancelButton }</div>
}
