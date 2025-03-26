import React, { createContext, Fragment, ReactNode, useCallback, useMemo, useState } from "react";
import { Alert } from "./type";
import { createPortal } from "react-dom";
import { Modal, ModalFooter } from "@/components/ui";
import styles from './style.module.scss';
import { IonButton } from "@ionic/react";

// Based on https://medium.com/@mayankvishwakarma.dev/building-an-alert-provider-in-react-using-context-and-custom-hooks-7c90931de088

type AlertContext = {
  showAlert: (alert: Alert) => number;
  hideAlert: (id: number) => void;
};

type AlertContextProvider = {
  children: ReactNode;
};

export const AlertContext = createContext<AlertContext>({
  showAlert: () => -1,
  hideAlert: () => {
  },
})

export const AlertProvider: React.FC<AlertContextProvider> = ({ children }) => {
  const [ alerts, setAlerts ] = useState<(Alert & { id: number })[]>([]);

  // Function to hide an alert based on its index
  const hideAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter(alert => alert.id != id));
  }, [ setAlerts ]);

  // Context value containing the showAlert function
  const contextValue: AlertContext = useMemo(() => ({
    showAlert: (alert) => {
      const id = Math.max(0, ...alerts.map(a => a.id)) + 1
      setAlerts((prev) => [ ...prev, { ...alert, id } ]);
      return id;
    },
    hideAlert
  }), [ alerts, setAlerts, hideAlert ]);

  return (
    <AlertContext.Provider value={ contextValue }>
      { children }

      { alerts.map(alert => createPortal(<Modal className={ styles.alert }>
        <p>{ alert.message }</p>

        <ModalFooter className={ styles.buttons }>

          { alert.type === 'Success' &&
              <IonButton color="success" fill='clear' onClick={ () => hideAlert(alert.id) }>Ok</IonButton> }

          { alert.type === 'Warning' && <Fragment>
              <IonButton color="medium" fill='clear' onClick={ () => hideAlert(alert.id) }>Cancel</IonButton>
              <IonButton color="warning" fill='clear' onClick={ () => {
                hideAlert(alert.id);
                alert.action.callback()
              } }>{ alert.action.label }</IonButton>
          </Fragment> }

          { alert.type === 'Error' && <Fragment>
              <IonButton color="danger" fill='clear' onClick={ () => {
                hideAlert(alert.id);
                alert.action.callback()
              } }>{ alert.action.label }</IonButton>
              <IonButton color="medium" fill='clear' onClick={ () => hideAlert(alert.id) }>Cancel</IonButton>
          </Fragment> }

        </ModalFooter>
      </Modal>, document.body)) }
    </AlertContext.Provider>
  )
}