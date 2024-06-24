import React, { HTMLAttributes, ReactNode, useRef } from "react";
import { IonBreadcrumb, IonBreadcrumbs, IonButton, IonContent, IonIcon, IonModal } from "@ionic/react";
import { DetectorList } from "@/services/api";
import { chevronForwardOutline } from "ionicons/icons";
import { CSVImportContent } from "./csv-import-content.tsx";
import { DetectorsContent } from "./detectors-content.tsx";
import { useAppDispatch, useAppSelector } from "@/slices/app";
import { importAnnotationsActions } from "@/slices/create-campaign/import-annotations.ts";
import './import-modal.component.css';
import { createCampaignActions } from "@/slices/create-campaign";
import { IonModalCustomEvent } from "@ionic/core/dist/types/components";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { useImportAnnotations } from "@/services/create-campaign/import-annotations.ts";
import { DetectorsConfigContent } from "@/view/create-campaign/blocs/import-modal/detectors-config-content.tsx";

type Props = {
  isOpen: boolean,
  setIsOpen: (value: boolean) => void;
  allDetectors: DetectorList,
} & HTMLAttributes<HTMLIonModalElement>


export const ImportModal: React.FC<Props> = ({
                                               isOpen,
                                               setIsOpen,
                                               allDetectors,
                                               ...modalArgs
                                             }) => {
  const modal = useRef<HTMLIonModalElement | null>(null);

  // Services
  const status = useAppSelector(state => state.createCampaignForm.importAnnotations.status)
  const service = useImportAnnotations();

  const dispatch = useAppDispatch();

  const onDismiss = (event: IonModalCustomEvent<OverlayEventDetail>) => {
    setIsOpen(false);
    if (event.detail.role === 'validate') {
      dispatch(createCampaignActions.setDetectors(service.distinctDetectors))
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
            <IonBreadcrumb active={ ['empty', 'loading', 'errors'].includes(status) }>
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
                            cancelButton={ <IonButton color="medium"
                                                      onClick={ () => modal.current?.dismiss(undefined, 'cancel') }>Cancel</IonButton> }
                            onDone={ () => modal.current?.dismiss(undefined, 'validate') }/>
      </IonContent>
    </IonModal>
  )
}

interface ImportModalContentProps {
  allDetectors: DetectorList,
  onDone: () => void,
  cancelButton: ReactNode
}

export const ImportModalContent: React.FC<ImportModalContentProps> = ({
                                                                        allDetectors,
                                                                        cancelButton,
                                                                        onDone,
                                                                      }) => {
  // Form data
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => state.createCampaignForm.importAnnotations.status)

  if (['empty', 'loading', 'errors'].includes(status))
    return <CSVImportContent cancelButton={ cancelButton }/>

  if (status === 'edit-detectors')
    return <DetectorsContent cancelButton={ cancelButton }
                             allDetectors={ allDetectors }
                             save={ () => {
                               dispatch(importAnnotationsActions.setStatus('edit-detectors-config'))
                             } }/>

  if (status === 'edit-detectors-config')
    return <DetectorsConfigContent cancelButton={ cancelButton }
                                   allDetectors={ allDetectors }
                                   save={ onDone }/>

  return <div id="buttons">{ cancelButton }</div>
}
