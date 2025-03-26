import React, { Fragment, useCallback } from "react";
import { Alert as AlertType } from "./type";

import styles from './style.module.scss';
import { createPortal } from "react-dom";
import { Modal, ModalFooter } from "@/components/ui";
import { IonButton } from "@ionic/react";

export const Alert: React.FC<{
  alert: AlertType & { id: number }
  hide: () => void;
}> = ({ alert, hide }) => {

  const onAction = useCallback(() => {
    if (alert.type === 'Success') return;
    hide();
    alert.action.callback()
  }, [alert, hide])

  return createPortal(<Modal className={ styles.alert }>
    <p>{ alert.message }</p>

    <ModalFooter className={ styles.buttons }>
      { alert.type === 'Success' &&
          <IonButton color="success" fill='clear' onClick={ hide }>Ok</IonButton> }

      { alert.type === 'Warning' && <Fragment>
          <IonButton color="medium" fill='clear' onClick={ hide }>Cancel</IonButton>
          <IonButton color="warning" fill='clear' onClick={ onAction }>{ alert.action.label }</IonButton>
      </Fragment> }

      { alert.type === 'Error' && <Fragment>
          <IonButton color="danger" fill='clear' onClick={ onAction }>{ alert.action.label }</IonButton>
          <IonButton color="medium" fill='clear' onClick={ hide }>Cancel</IonButton>
      </Fragment> }
    </ModalFooter>
  </Modal>, document.body)
}