import React, { Fragment, useMemo } from 'react';
import { useParams } from "react-router-dom";
import { DatasetAPI, DatasetImportNote, DatasetTimeInfo } from "@/features/data/dataset";
import { Head } from "@/components/ui/Page.tsx";
import { IonSpinner } from "@ionic/react";
import { WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { SpectrogramAnalysisTable } from "@/features/data/spectrogramAnalysis";


export const DatasetDetail: React.FC = () => {
  const { datasetID } = useParams<{ datasetID: string }>()

  const { data: dataset, isLoading, error } = DatasetAPI.endpoints.getDatasetByID.useQuery({
    id: datasetID ?? '',
  }, { skip: !datasetID })

  const head = useMemo(() => (
    <Head title={ dataset?.name }
          subtitle={ dataset?.path }
          canGoBack>
      { dataset?.description && <p>{ dataset.description }</p> }
      { dataset && <DatasetTimeInfo dataset={ dataset }/> }
    </Head>
  ), [ dataset ]);

  if (isLoading) return <Fragment>
    { head }
    <IonSpinner/>
  </Fragment>

  if (error) return <Fragment>
    { head }
    <WarningText>{ getErrorMessage(error) }</WarningText>
  </Fragment>

  if (!dataset) return <Fragment>
    { head }
    <WarningText>Dataset not found</WarningText>
  </Fragment>

  return <Fragment>
    { head }

    <div style={ { overflowX: 'hidden' } }>

      <SpectrogramAnalysisTable datasetID={ datasetID }/>
    </div>

    <DatasetImportNote dataset={ dataset }/>
  </Fragment>
}