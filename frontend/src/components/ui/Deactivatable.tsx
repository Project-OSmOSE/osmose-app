import React, { ReactNode } from "react";
import styles from './ui.module.scss'
import { IonSpinner } from "@ionic/react";

export const Deactivatable: React.FC<{
  disabled?: boolean,
  loading?: boolean
  children: ReactNode
}> = ({
        disabled = false,
        loading = false,
        children
      }) => <div className={ styles.deactivatable }>
  <div className={ disabled ? styles.disabled : undefined }>{ children }</div>
  { loading && <IonSpinner className={ styles.spinner }/> }
</div>
