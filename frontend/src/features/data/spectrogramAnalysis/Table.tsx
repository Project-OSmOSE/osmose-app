import React, { Fragment } from "react";
import { IonNote, IonSpinner } from "@ionic/react";
import { dateToString, getErrorMessage } from "@/service/function.ts";
import { Table, TableContent, TableDivider, TableHead, WarningText } from "@/components/ui";
import { SpectrogramAnalysisAPI } from "@/features/data/spectrogramAnalysis/api";
import { GetSpectrogramAnalysisQueryVariables } from "@/features/data/spectrogramAnalysis/api/api.generated.ts";

export const SpectrogramAnalysisTable: React.FC<GetSpectrogramAnalysisQueryVariables> = (option) => {

  const { data: analysis, isLoading, error } = SpectrogramAnalysisAPI.endpoints.getSpectrogramAnalysis.useQuery(option);

  if (isLoading) return <IonSpinner/>
  if (error) <WarningText>{ getErrorMessage(error) }</WarningText>
  if (!analysis || analysis.length === 0) return <IonNote color='medium'>No spectrogram analysis</IonNote>

  return <Table columns={ 11 }>
    <TableHead topSticky isFirstColumn={ true }>Analysis</TableHead>
    <TableHead topSticky>Type</TableHead>
    <TableHead topSticky>Created at</TableHead>
    <TableHead topSticky>Number of files</TableHead>
    <TableHead topSticky>Start date</TableHead>
    <TableHead topSticky>End date</TableHead>
    <TableHead topSticky>File duration</TableHead>
    <TableHead topSticky>Sampling frequency</TableHead>
    <TableHead topSticky>NFFT</TableHead>
    <TableHead topSticky>Window size</TableHead>
    <TableHead topSticky>Overlap</TableHead>
    <TableDivider/>

    { analysis.map(a => <Fragment key={ a.name }>
      <TableContent isFirstColumn={ true }>{ a.name }</TableContent>
      <TableContent>Spectrogram</TableContent>
      <TableContent>{ dateToString(a.createdAt) }</TableContent>
      <TableContent>{ a.filesCount }</TableContent>
      <TableContent>{ dateToString(a.start) }</TableContent>
      <TableContent>{ dateToString(a.end) }</TableContent>
      <TableContent>{ a.dataDuration }</TableContent>
      <TableContent>{ a.fft.samplingFrequency }</TableContent>
      <TableContent>{ a.fft.nfft }</TableContent>
      <TableContent>{ a.fft.windowSize }</TableContent>
      <TableContent>{ a.fft.overlap }</TableContent>
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