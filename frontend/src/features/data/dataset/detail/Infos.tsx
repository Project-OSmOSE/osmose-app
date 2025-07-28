import React, { useMemo } from "react";
import styles from './styles.module.scss'
import { DetailedDataset } from "@/features/data/dataset";
import { IonNote } from "@ionic/react";
import { Calendar } from '@solar-icons/react'

export const DatasetTimeInfo: React.FC<{
  dataset: DetailedDataset;
}> = ({ dataset }) => {
  const start = useMemo(() => new Date(dataset.start), [ dataset ])
  const end = useMemo(() => new Date(dataset.end), [ dataset ])

  return <div className={ styles.info }>
    <Calendar/>
    <IonNote>Start:</IonNote>
    <p>{ start.toLocaleString() }</p>
    <IonNote>End:</IonNote>
    <p>{ end.toLocaleString() }</p>
  </div>
}

export const DatasetImportNote: React.FC<{
  dataset: DetailedDataset;
}> = ({ dataset }) => {
  const createdAt = useMemo(() => new Date(dataset.createdAt), [ dataset ])

  return <IonNote className={ styles.importNote } color='medium'>
    Imported on { createdAt.toLocaleString() } by { dataset.owner.displayName }
  </IonNote>
}