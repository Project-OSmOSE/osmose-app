import React, { Fragment, useCallback, useEffect } from "react";
import { Alert as AlertType, AlertAction } from "./type";

import styles from './style.module.scss';
import { createPortal } from "react-dom";
import { Modal, ModalFooter } from "@/components/ui";
import { IonButton } from "@ionic/react";
import { NON_FILTERED_KEY_DOWN_EVENT } from "@/service/events";

export const Alert: React.FC<{
  alert: AlertType & { id: number }
  hide: () => void;
}> = ({ alert, hide }) => {

  useEffect(() => {
    NON_FILTERED_KEY_DOWN_EVENT.add(onKbdEvent);

    return () => {
      NON_FILTERED_KEY_DOWN_EVENT.remove(onKbdEvent);
    }
  }, []);

  const onKbdEvent = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Enter' || event.code === 'NumpadEnter') {
      switch (alert.type) {
        case 'Success':
          hide();
          break;
        case 'Warning':
          if (alert.actions.length === 1) onAction(alert.actions[0]);
          break;
        case 'Error':
          // Do nothing
          break;
      }
    }
  }, [ hide, alert ]);

  const onAction = useCallback((action: AlertAction) => {
    if (alert.type === 'Success') return;
    hide();
    action.callback()
  }, [ alert, hide ])

  return createPortal(<Modal className={ styles.alert }>
    <p>{ alert.message }</p>

    <ModalFooter className={ styles.buttons }>
      { alert.type === 'Success' &&
          <IonButton color="success" fill='clear' onClick={ hide }>Ok</IonButton> }

      { alert.type === 'Warning' && <Fragment>
          <IonButton color="medium" fill='clear' onClick={ hide }>Cancel</IonButton>
        { alert.actions.map(action =>
          <IonButton color="warning" fill='clear' onClick={ () => onAction(action) }>{ action.label }</IonButton>) }
      </Fragment> }

      { alert.type === 'Error' && <Fragment>
        { alert.actions.map(action =>
          <IonButton color="danger" fill='clear' onClick={ () => onAction(action) }>{ action.label }</IonButton>) }
          <IonButton color="medium" fill='clear' onClick={ hide }>Cancel</IonButton>
      </Fragment> }
    </ModalFooter>
  </Modal>, document.body)
}