import React, { Fragment } from 'react';
import { DatasetTable, ImportDatasetButton } from "@/features/data/dataset";
import { Head } from "@/components/ui/Page.tsx";


export const DatasetList: React.FC = () => (<Fragment>
    <Head title='Datasets'
          content={ <ImportDatasetButton/> }/>

    <DatasetTable/>

  </Fragment>
)