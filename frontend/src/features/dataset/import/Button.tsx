import React, { Fragment } from "react";
import { useModal } from "@/service/ui/modal.ts";
import { IonButton, IonIcon } from "@ionic/react";
import { downloadOutline } from "ionicons/icons";
import { createPortal } from "react-dom";
import { ImportDatasetModal } from "./Modal";

export const ImportDatasetButton: React.FC = () => {
  const modal = useModal();

  return <Fragment>
    <IonButton color='primary' fill='outline'
               style={ { zIndex: 2 } }
               onClick={ modal.toggle }>
      <IonIcon icon={ downloadOutline } slot='start'/>
      Import dataset
    </IonButton>

    { modal.isOpen && createPortal(<ImportDatasetModal onClose={ modal.close }/>, document.body) }
  </Fragment>
}
