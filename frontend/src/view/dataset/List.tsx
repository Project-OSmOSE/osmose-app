import React, { Fragment } from 'react';
import styles from './styles.module.scss'
import { DatasetTable, ImportDatasetButton } from "@/features/data/dataset";


export const DatasetList: React.FC = () => (<Fragment>

    <div className={ styles.head }>

      <h2>Datasets</h2>
      <ImportDatasetButton/>

    </div>

    <DatasetTable/>

  </Fragment>
)