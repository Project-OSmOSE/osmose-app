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
import { Deployment, Hydrophone, Project, Recorder } from "@pam-standardization/metadatax-ts";
import { IonNote, IonSpinner } from "@ionic/react";
import { getErrorMessage } from "@/service/function.ts";
import styles from './styles.module.scss';
import { DatasetAPI } from "@/service/api/dataset.ts";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";

export const AcquisitionModal: React.FC<{
  onClose?(): void;
}> = ({ onClose }) => {
  const { campaign } = useRetrieveCurrentCampaign()
  const { data: datasets, isFetching, error } = DatasetAPI.endpoints.listDataset.useQuery({ campaignID: campaign?.id ?? skipToken })

  const pluralize = useCallback((data: any[]) => data.length > 1 ? 's' : '', [])

  // Memo
  const deployments: Array<Deployment> = useMemo(() => {
    if (!datasets) return [];
    return [ ...new Set(datasets.flatMap(d => d.related_channel_configuration.map(c => c.deployment))) ]
  }, [ datasets ])
  const projects: Array<Project> = useMemo(() => {
    return [ ...new Set(deployments.flatMap(d => d.project)) ]
  }, [ deployments ])
  const recorders: Array<Recorder> = useMemo(() => {
    if (!datasets) return [];
    return [ ...new Set(datasets.flatMap(d => d.related_channel_configuration.map(c => c.recorder))) ]
  }, [ datasets ])
  const hydrophones: Array<Hydrophone> = useMemo(() => {
    if (!datasets) return [];
    return [ ...new Set(datasets.flatMap(d => d.related_channel_configuration.map(c => c.hydrophone))) ]
  }, [ datasets ])

  return (
    <Modal onClose={ onClose } className={ [ styles.modal, styles.progressModal ].join(' ') }>
      <ModalHeader onClose={ onClose } title='Acquisition information'/>

      { isFetching && <IonSpinner/> }

      { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

      { datasets && datasets.length > 0 &&
        projects.length > 0 && deployments.length > 0 && recorders.length > 0 && hydrophones.length > 0 ?
          <Table columns={ 2 }>
          <TableHead isFirstColumn={ true }>Project{ pluralize(projects) }</TableHead>
          <TableContent>{ projects.map(p => p.name).join(', ') }</TableContent>
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Deployment{ pluralize(deployments) }</TableHead>
          <TableContent>{ deployments.map(d => d.name).join(', ') }</TableContent>
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Recorder{ pluralize(recorders) }</TableHead>
          <TableContent>{ recorders.map(r => <div key={ r.id } className={ styles.line }>
            <p>{ r.model.name }</p>
            <FadedText>({ r.serial_number })</FadedText>
          </div>) }</TableContent>
          <TableDivider/>

          <TableHead isFirstColumn={ true }>Hydrophone{ pluralize(hydrophones) }</TableHead>
          <TableContent>{ hydrophones.map(h => <div key={ h.id } className={ styles.line }>
            <p>{ h.model.name }</p>
            <FadedText>({ h.serial_number })</FadedText>
          </div>) }</TableContent>
          <TableDivider/>

      </Table> : <IonNote>No acquisition information</IonNote> }

    </Modal>
  )
}
