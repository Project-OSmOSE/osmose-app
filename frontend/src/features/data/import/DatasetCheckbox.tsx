import React, { useCallback, useMemo } from "react";
import styles from './styles.module.scss'
import { ImportAnalysis, ImportDataset } from '@/features/data/dataset/api'
import { IonCheckbox, IonNote } from "@ionic/react";
import { AnalysisCheckbox } from "./AnalysisCheckbox.tsx";
import { useSearchedData } from "@/service/ui/search.ts";

export const DatasetCheckbox: React.FC<{
  dataset: ImportDataset,
  selected?: string[]
  search?: string;
  disabled?: boolean
  onSelect: (dataset: ImportDataset) => void
  onUnSelect: (dataset: ImportDataset) => void
}> = ({ dataset, selected, search, disabled, onSelect, onUnSelect }) => {

  const isSelected = useMemo(() => selected && dataset.analysis.length === selected.length, [ selected, dataset ])

  const searchAnalysis = useSearchedData({
    items: dataset.analysis,
    search,
    sortField: 'name',
    mapping: (analysis: ImportAnalysis) => [ analysis.name, analysis.path ]
  })

  const toggle = useCallback(() => {
    if (isSelected) onUnSelect(dataset)
    else onSelect(dataset)
  }, [ isSelected, dataset, onSelect, onUnSelect ])

  const onSelectAnalysis = useCallback((analysis: ImportAnalysis) => {
    onSelect({ ...dataset, analysis: [ analysis ] })
  }, [ dataset, onSelect ])

  const onUnSelectAnalysis = useCallback((analysis: ImportAnalysis) => {
    onUnSelect({ ...dataset, analysis: [ analysis ] })
  }, [ dataset, onUnSelect ])

  return <div className={ styles.dataset } onClick={ toggle }>
    <IonCheckbox className={ styles.checkbox } checked={ isSelected } disabled={ disabled }/>
    <span>
      <span><b>{ dataset.name }</b><IonNote>{ search && ` (${ searchAnalysis.length }/${ dataset.analysis.length } analysis)` }</IonNote></span>
      <p>{ dataset.path }</p>
    </span>

    { searchAnalysis.map(a => <AnalysisCheckbox key={ a.name }
                                                analysis={ a }
                                                selected={ selected?.includes(a.name) }
                                                disabled={ disabled }
                                                onSelect={ onSelectAnalysis }
                                                onUnSelect={ onUnSelectAnalysis }/>) }
  </div>
}