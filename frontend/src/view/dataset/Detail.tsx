import React, { Fragment } from 'react';
import styles from './styles.module.scss'
import { IonNote } from "@ionic/react";
import { useParams } from "react-router-dom";


export const DatasetDetail: React.FC = () => {
  const { datasetID } = useParams<{ datasetID: string }>()

  return <Fragment>

    <div className={ styles.head }>

      <h2>{ datasetID }</h2>
      <IonNote color='medium'>Dataset</IonNote>

    </div>

  </Fragment>
}