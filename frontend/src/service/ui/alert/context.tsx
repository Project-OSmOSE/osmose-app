import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Alert as AlertType } from "./type";
import { Alert } from "@/service/ui/alert/alert.tsx";
import { useAppDispatch } from "@/service/app.ts";
import { EventSlice } from "@/service/events";

// Based on https://medium.com/@mayankvishwakarma.dev/building-an-alert-provider-in-react-using-context-and-custom-hooks-7c90931de088

type AlertContext = {
  showAlert: (alert: AlertType) => number;
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
  const [ alerts, setAlerts ] = useState<(AlertType & { id: number })[]>([]);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (alerts.length > 0) {
      dispatch(EventSlice.actions.disableShortcuts())
    } else {
      dispatch(EventSlice.actions.enableShortcuts())
    }
  }, [ alerts ]);

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

      { alerts.map((alert, key) => <Alert alert={ alert } key={ key } hide={ () => hideAlert(alert.id) }/>) }
    </AlertContext.Provider>
  )
}