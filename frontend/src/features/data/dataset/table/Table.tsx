import React, { Fragment } from "react";
import { IonNote, IonSpinner } from "@ionic/react";
import { getErrorMessage } from "@/service/function.ts";
import { Table, TableContent, TableDivider, TableHead, WarningText } from "@/components/ui";
import styles from "./styles.module.scss";
import { DatasetAPI } from "@/features/data/dataset/api";
import { DatasetNameAccessLink } from "../detail";

export const DatasetTable: React.FC = () => {

  const { data: datasets, isLoading, error } = DatasetAPI.endpoints.getDatasets.useQuery();

  if (isLoading) return <IonSpinner/>
  if (error) <WarningText>{ getErrorMessage(error) }</WarningText>
  if (!datasets || datasets.length === 0) return <IonNote color='medium'>No datasets</IonNote>

  return <Table columns={ 9 } className={ styles.table }>
    <TableHead topSticky isFirstColumn={ true }>Name</TableHead>
    <TableHead topSticky>Created at</TableHead>
    <TableHead topSticky>Number of analysis</TableHead>
    <TableHead topSticky>Number of files</TableHead>
    <TableHead topSticky>Start date</TableHead>
    <TableHead topSticky>End date</TableHead>
    <TableDivider/>

    { datasets.map(d => <Fragment key={ d.name }>
      <TableContent isFirstColumn={ true }>
        <DatasetNameAccessLink dataset={ d }/>
      </TableContent>
      <TableContent>{ new Date(d.createdAt).toLocaleDateString() }</TableContent>
      <TableContent>{ d.analysisCount }</TableContent>
      <TableContent>{ d.filesCount }</TableContent>
      <TableContent>{ new Date(d.start).toDateString() }</TableContent>
      <TableContent>{ new Date(d.end).toDateString() }</TableContent>
      {/*<TableContent>*/ }
      {/*  <AudioMetadataModalButton filename={ d.name.replaceAll(' ', '_') + '_audio_metadata.csv' }*/ }
      {/*                            datasetID={ d.id }*/ }
      {/*                            canDownload={ true }/>*/ }
      {/*</TableContent>*/ }
      {/*<TableContent>*/ }
      {/*  <SpectrogramMetadataModalButton filename={ d.name.replaceAll(' ', '_') + '_spectrogram_configuration.csv' }*/ }
      {/*                                  datasetID={ d.id }*/ }
      {/*                                  canDownload={ true }/>*/ }
      {/*</TableContent>*/ }
      <TableDivider/>
    </Fragment>) }
  </Table>
}