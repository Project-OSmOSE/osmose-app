import React, { HTMLAttributes, ReactNode, useRef } from "react";
import { IonBreadcrumb, IonBreadcrumbs, IonButton, IonContent, IonIcon, IonModal } from "@ionic/react";
import { chevronForwardOutline } from "ionicons/icons";
import { CSVImportContent } from "./csv-import-content.tsx";
import { DetectorsContent } from "./detectors-content.tsx";
import { useAppDispatch, useAppSelector } from '@/service/app';
import './import-modal.component.css';
import { IonModalCustomEvent } from "@ionic/core/dist/types/components";
import { OverlayEventDetail } from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import { DetectorsConfigContent } from "@/view/campaign/create-edit/blocs/import-modal/detectors-config-content.tsx";
import { DatasetChoice } from '@/view/campaign/create-edit/blocs/import-modal/dataset-choice.tsx';
import { clearImport } from '@/service/campaign';

type Props = {
  isOpen: boolean,
  setIsOpen: (value: boolean) => void;
  onFileImported: (file: File) => void;
} & HTMLAttributes<HTMLIonModalElement>


export const ImportModal: React.FC<Props> = ({
                                               isOpen,
                                               setIsOpen,
                                               onFileImported,
                                               ...modalArgs
                                             }) => {
  const modal = useRef<HTMLIonModalElement | null>(null);

  // Services
  const dispatch = useAppDispatch();
  const {
    fileData,
  } = useAppSelector(state => state.campaign.resultImport)

  const onDismiss = (event: IonModalCustomEvent<OverlayEventDetail>) => {
    setIsOpen(false);
    if (event.detail.role !== 'validate')
      dispatch(clearImport())
  }

  return (
    <IonModal ref={ modal } { ...modalArgs } isOpen={ isOpen } onDidDismiss={ onDismiss }>
      <IonContent id="import-annotations-modal">
        <div id="header">
          <h1>Import annotations</h1>

          <IonBreadcrumbs>
            <IonBreadcrumb active={ !fileData }>
              CSV Import
              <IonIcon slot="separator" icon={ chevronForwardOutline }></IonIcon>
            </IonBreadcrumb>
            <IonBreadcrumb active={ !!fileData }>
              Detectors
              <IonIcon slot="separator" icon={ chevronForwardOutline }></IonIcon>
            </IonBreadcrumb>
          </IonBreadcrumbs>
        </div>

        <ImportModalContent onFileImported={ onFileImported }
                            cancelButton={ <IonButton color="medium"
                                                      onClick={ () => modal.current?.dismiss(undefined, 'cancel') }>Cancel</IonButton> }
                            onDone={ () => modal.current?.dismiss(undefined, 'validate') }/>
      </IonContent>
    </IonModal>
  )
}

interface ImportModalContentProps {
  onDone: () => void,
  cancelButton: ReactNode,
  onFileImported: (file: File) => void;
}

export const ImportModalContent: React.FC<ImportModalContentProps> = ({
                                                                        cancelButton,
                                                                        onDone,
                                                                        onFileImported
                                                                      }) => {
  // Form data
  const {
    fileData,
    filterDatasets,
    detectors,
  } = useAppSelector(state => state.campaign.resultImport)
  const {
    datasets
  } = useAppSelector(state => state.campaign.draftCampaign)

  if (!fileData)
    return <CSVImportContent cancelButton={ cancelButton } onFileImported={ onFileImported }/>

  if (fileData.datasets.some(d => !datasets?.includes(d)) && !filterDatasets)
    return <DatasetChoice cancelButton={ cancelButton }/>

  if (!detectors)
    return <DetectorsContent cancelButton={ cancelButton }/>

  if (detectors?.some(d => !d.knownConfiguration && !d.newConfiguration))
    return <DetectorsConfigContent cancelButton={ cancelButton }
                                   save={ onDone }/>

  return <div id="buttons">{ cancelButton }</div>
}
