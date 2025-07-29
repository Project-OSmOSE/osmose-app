import React, { useMemo } from "react";
import styles from './styles.module.scss'
import { DetailedDataset } from "@/features/data/dataset/index.ts";
import { IonNote } from "@ionic/react";
import { Calendar } from '@solar-icons/react'
import { datetimeToString, dateToString } from "@/service/function.ts";

export const DatasetTimeInfo: React.FC<{
  dataset: DetailedDataset;
}> = ({ dataset }) => (
  <div className={ styles.info }>
    <Calendar/>
    <IonNote>Start:</IonNote>
    <p>{ datetimeToString(dataset.start) }</p>
    <IonNote>End:</IonNote>
    <p>{ datetimeToString(dataset.end) }</p>
  </div>
)


export const DatasetImportNote: React.FC<{
  dataset: DetailedDataset;
}> = ({ dataset }) => {
  const createdAt = useMemo(() => new Date(dataset.createdAt), [ dataset ])

  return <IonNote className={ styles.importNote } color='medium'>
    Dataset imported on { dateToString(createdAt) } by { dataset.owner.displayName }
  </IonNote>
}