import React from "react";
import styles from './ui.module.scss'
import { IonProgressBar, IonSkeletonText } from "@ionic/react";
import { Color } from "@ionic/core";
import { FadedText } from "./Text.tsx";

export const SkeletonProgress: React.FC<{
  className?: string;
}> = ({ className }) => (
  <div className={ [ styles.progress, className ].join(' ') }>
    <IonSkeletonText animated style={ { width: 128, height: '1ch' } }/>
    <IonProgressBar color='medium' value={ 0 }/>
  </div>
)

export const Progress: React.FC<{
  className?: string;
  color?: Color;
  label?: string;
  value: number;
  total: number;
}> = ({ className, color = 'medium', label, value, total }) => {
  return (
    <div className={ [ styles.progress, className ].join(' ') }>
      { label && <FadedText>
        { label }: <span className={ `ion-color-${ color }` }>{ value }&nbsp;/&nbsp;{ total }</span>
      </FadedText> }
      <IonProgressBar color={ color }
                      value={ total > 0 ? value / total : total }/>
    </div>
  )
}