import React, { Fragment } from "react";
import { IonNote, IonSpinner } from "@ionic/react";
import { dateToString, getErrorMessage } from "@/service/function.ts";
import { Table, TableContent, TableDivider, TableHead, WarningText } from "@/components/ui";
import { DatasetAPI } from "@/features/data/dataset/api";
import { DatasetNameAccessLink } from "./NameAccessLink";

export const DatasetTable: React.FC = () => {

  const { data: datasets, isLoading, error } = DatasetAPI.endpoints.getDatasets.useQuery();

  if (isLoading) return <IonSpinner/>
  if (error) <WarningText>{ getErrorMessage(error) }</WarningText>
  if (!datasets || datasets.length === 0) return <IonNote color='medium'>No datasets</IonNote>

  return <Table columns={ 9 }>
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
      <TableContent>{ dateToString(d.createdAt) }</TableContent>
      <TableContent>{ d.analysisCount }</TableContent>
      <TableContent>{ d.filesCount }</TableContent>
      <TableContent>{ dateToString(d.start) }</TableContent>
      <TableContent>{ dateToString(d.end) }</TableContent>
      <TableDivider/>
    </Fragment>) }
  </Table>
}