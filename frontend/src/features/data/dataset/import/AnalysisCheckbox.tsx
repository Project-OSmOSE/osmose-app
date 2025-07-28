import React, { MouseEvent, useCallback } from "react";
import styles from './styles.module.scss'
import { IonCheckbox } from "@ionic/react";
import { ImportAnalysis } from "@/features/data/dataset/api";

export const AnalysisCheckbox: React.FC<{
  analysis: ImportAnalysis,
  selected?: boolean
  disabled?: boolean
  onSelect: (analysis: ImportAnalysis) => void
  onUnSelect: (analysis: ImportAnalysis) => void
}> = ({ analysis, selected, disabled, onSelect, onUnSelect }) => {

  const toggle = useCallback((event: MouseEvent) => {
    event.stopPropagation()
    if (selected) onUnSelect(analysis)
    else onSelect(analysis)
  }, [ selected, analysis, onSelect, onUnSelect ])

  return <div className={ styles.analysis } onClick={ toggle }>
    <IonCheckbox className={ styles.checkbox } checked={ selected } disabled={ disabled }/>
    <span>
      <b>{ analysis.name }</b>
      <p>{ analysis.path }</p>
    </span>
  </div>
}