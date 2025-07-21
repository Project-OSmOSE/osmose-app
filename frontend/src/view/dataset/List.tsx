import React, { Fragment } from 'react';
import styles from './styles.module.scss'
import { ImportDatasetButton } from "@/features/dataset/import";
import { DatasetTable } from "@/features/dataset";


export const DatasetList: React.FC = () => (<Fragment>

    <div className={ styles.head }>

      <h2>Datasets</h2>
      <ImportDatasetButton/>

    </div>

    <DatasetTable/>

  </Fragment>
)