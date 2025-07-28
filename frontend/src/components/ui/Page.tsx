import React, { ReactNode } from "react";
import styles from './ui.module.scss'
import { IonNote } from "@ionic/react";
import { BackButton } from "@/components/ui/Button.tsx";

export const Head: React.FC<{
  title?: string;
  subtitle?: string;
  content?: ReactNode;
  canGoBack?: boolean;
}> = ({ title, subtitle, content, canGoBack }) => {

  return <div className={ styles.head }>
    <div className={ styles.title }>
      <h2>{ title ?? '' }</h2>
      { subtitle && <IonNote color='medium'>{ subtitle }</IonNote> }
    </div>

    <div className={ styles.content }>
      { content }
    </div>

    { canGoBack && <BackButton/> }

  </div>
}