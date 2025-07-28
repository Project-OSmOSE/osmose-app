import React, { ReactNode } from "react";
import styles from './ui.module.scss'
import { IonNote } from "@ionic/react";
import { BackButton } from "@/components/ui/Button.tsx";

export const Head: React.FC<{
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  canGoBack?: boolean;
}> = ({ title, subtitle, children, canGoBack }) => {

  return <div className={ styles.head }>
    <div className={ styles.title }>
      <h2>{ title ?? '' }</h2>
      { subtitle && <IonNote color='medium'>{ subtitle }</IonNote> }

      { canGoBack && <BackButton/> }
    </div>

    <div className={ styles.content }>
      { children }
    </div>

  </div>
}