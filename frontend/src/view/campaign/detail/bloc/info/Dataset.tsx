import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { FadedText, Modal, ModalHeader } from "@/components/ui";
import { IonButton, IonSpinner } from "@ionic/react";
import styles from './info.module.scss';
import { DatasetAPI } from "@/service/dataset";
import { useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { Deployment, Hydrophone, Project, Recorder } from "@pam-standardization/metadatax-ts";
import { useToast } from "@/service/ui";


export const Dataset: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: datasets, isFetching, error } = DatasetAPI.useListQuery({ campaign: campaignID })
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
  const toast = useToast();

  const onOpen = useCallback(() => setIsModalOpen(true), [])
  const onClose = useCallback(() => setIsModalOpen(false), [])
  const pluralize = useCallback((data: any[]) => data.length > 1 ? 's' : '', [])

  useEffect(() => {
    if (error) toast.presentError(error);
  }, [ error ]);

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

  if (isFetching) return <IonSpinner/>
  if (!datasets || datasets.length === 0) return <div><FadedText>Dataset</FadedText><p>No dataset</p></div>
  return (
    <Fragment>
      <div>
        <FadedText>Dataset{ pluralize(datasets) }</FadedText>
        <p>{ datasets.map(d => d.name).join(', ') }</p>
      </div>

      <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ onOpen }>
        Acquisition information
      </IonButton>

      { isModalOpen && createPortal(
        <Modal onClose={ onClose } className={ [ styles.modal, styles.progressModal ].join(' ') }>
          <ModalHeader onClose={ onClose } title='Acquisition information'/>

          <Table columns={ 2 }>
            <TableHead isFirstColumn={ true }>Project{ pluralize(projects) }</TableHead>
            <TableContent>{ projects.map(p => p.name).join(', ') }</TableContent>
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Deployment{ pluralize(deployments) }</TableHead>
            <TableContent>{ deployments.map(d => d.name).join(', ') }</TableContent>
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Recorder{ pluralize(recorders) }</TableHead>
            <TableContent>{ recorders.map(r => <div key={ r.id } className={styles.line}>
              <p>{ r.model.name }</p>
              <FadedText>({ r.serial_number })</FadedText>
            </div>) }</TableContent>
            <TableDivider/>

            <TableHead isFirstColumn={ true }>Hydrophone{ pluralize(hydrophones) }</TableHead>
            <TableContent>{ hydrophones.map(h => <div key={ h.id } className={styles.line}>
              <p>{ h.model.name }</p>
              <FadedText>({ h.serial_number })</FadedText>
            </div>) }</TableContent>
            <TableDivider/>

          </Table>

        </Modal>, document.body) }

    </Fragment>
  )
}
