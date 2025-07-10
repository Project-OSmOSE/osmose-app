import React, { useCallback, useMemo } from "react";
import {
  FadedText,
  Modal,
  ModalHeader,
  Table,
  TableContent,
  TableDivider,
  TableHead,
  WarningText
} from "@/components/ui";
import { IonNote, IonSpinner } from "@ionic/react";
import { getErrorMessage } from "@/service/function.ts";
import styles from './styles.module.scss';
import { DatasetAPI } from "@/service/api/dataset.ts";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { API as DeploymentAPI } from "@/features/acquisition/deployment/api";

export const AcquisitionModal: React.FC<{
  onClose?(): void;
}> = ({ onClose }) => {
  const { campaign } = useRetrieveCurrentCampaign()
  const {
    data: datasets,
    isFetching,
    error
  } = DatasetAPI.endpoints.listDataset.useQuery({ campaignID: campaign?.id ?? skipToken })
  const { data: deployments } = DeploymentAPI.endpoints.getAllDeployments.useQuery({
    ids: (datasets ?? []).flatMap(d => d.related_channel_configuration.map(c => c.deployment.toString()))
  })

  const pluralize = useCallback((data: any[]) => data.length > 1 ? 's' : '', [])

  // Memo
  const deploymentNames = useMemo(() => {
    if (!deployments) return [];
    return [ ...new Set(deployments.flatMap((d: any) => d.name)) ]
  }, [ deployments ])
  const projectNames = useMemo(() => {
    if (!deployments) return [];
    return [ ...new Set(deployments.flatMap((d: any) => d.project.name)) ]
  }, [ deployments ])
  const recorders = useMemo(() => {
    if (!datasets) return [];
    return [ ...new Set(datasets.flatMap(d => d.related_channel_configuration.map(c => c.recorder_specification.recorder))) ]
  }, [ datasets ])
  const hydrophones = useMemo(() => {
    if (!datasets) return [];
    return [ ...new Set(datasets.flatMap(d => d.related_channel_configuration.map(c => c.recorder_specification.hydrophone))) ]
  }, [ datasets ])

  return (
    <Modal onClose={ onClose } className={ [ styles.modal, styles.progressModal ].join(' ') }>
      <ModalHeader onClose={ onClose } title='Acquisition information'/>

      { isFetching && <IonSpinner/> }

      { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

      { datasets && datasets.length > 0 &&
      projectNames.length > 0 && deployments && deployments.length > 0 && recorders.length > 0 && hydrophones.length > 0 ?
        <Table columns={ 2 } className={ styles.acquisitionTable }>
          <TableHead isFirstColumn={ true } leftSticky>Project{ pluralize(projectNames) }</TableHead>
          <TableContent>{ projectNames.join(', ') }</TableContent>
          <TableDivider/>

          <TableHead isFirstColumn={ true } leftSticky>Deployment{ pluralize(deployments) }</TableHead>
          <TableContent>{ deploymentNames.join(', ') }</TableContent>
          <TableDivider/>

          <TableHead isFirstColumn={ true } leftSticky>Recorder{ pluralize(recorders) }</TableHead>
          <TableContent>{ recorders.map(r => <div key={ r.id } className={ styles.line }>
            <p>{ r.model }</p>
            <FadedText>({ r.serial_number })</FadedText>
          </div>) }</TableContent>
          <TableDivider/>

          <TableHead isFirstColumn={ true } leftSticky>Hydrophone{ pluralize(hydrophones) }</TableHead>
          <TableContent>{ hydrophones.map(h => <div key={ h.id } className={ styles.line }>
            <p>{ h.model }</p>
            <FadedText>({ h.serial_number })</FadedText>
          </div>) }</TableContent>
          <TableDivider/>

        </Table> : <IonNote>No acquisition information</IonNote> }

    </Modal>
  )
}
