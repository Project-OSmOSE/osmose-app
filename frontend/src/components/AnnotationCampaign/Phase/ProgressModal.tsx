import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/service/ui";
import { getErrorMessage } from "@/service/function.ts";
import {
  Modal,
  ModalFooter,
  ModalHeader,
  Table,
  TableContent,
  TableDivider,
  TableHead,
  WarningText
} from "@/components/ui";
import { IonButton, IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { caretDown, caretUp, downloadOutline } from "ionicons/icons";
import { AnnotationFileRange, User } from "@/service/types";
import styles from './styles.module.scss';
import { Progress } from "@/components/ui/Progress.tsx";
import { useNavigate } from "react-router-dom";
import { useModal } from "@/service/ui/modal.ts";
import { createPortal } from "react-dom";
import { UserAPI } from "@/service/api/user.ts";
import { useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { CampaignPhaseAPI } from "@/service/api/campaign-phase.ts";
import { useListFileRangesForCurrentPhase } from "@/service/api/annotation-file-range.ts";

type Progression = {
  user: User;
  ranges: Array<AnnotationFileRange>;
  progress: number; // [0-1]
}

type Sort = {
  entry: 'Annotator' | 'Progress';
  sort: 'ASC' | 'DESC';
}

export const ProgressModalButton: React.FC<{ size?: 'small' | 'default' | 'large' }> = ({ size }) => {
  const modal = useModal()
  return <Fragment>
    <IonButton fill='outline' color='medium' size={ size } className='ion-text-wrap' onClick={ modal.toggle }>
      Detailed progression
    </IonButton>
    { modal.isOpen && createPortal(<ProgressModal onClose={ modal.toggle }/>, document.body) }
  </Fragment>
}

export const ProgressModal: React.FC<{
  onClose?(): void;
}> = ({ onClose }) => {
  const { campaign, currentPhase, hasAdminAccess } = useRetrieveCurrentCampaign()
  const toast = useToast();
  const navigate = useNavigate();
  const { data: users, isFetching: isLoadingUsers, error: userError } = UserAPI.endpoints.listUser.useQuery();
  const { fileRanges, isFetching: isLoadingFileRanges, error: fileRangeError } = useListFileRangesForCurrentPhase();
  const [ downloadStatus, { error: statusError } ] = CampaignPhaseAPI.endpoints.downloadCampaignPhaseStatus.useMutation()
  const [ downloadReport, { error: reportError } ] = CampaignPhaseAPI.endpoints.downloadCampaignPhaseReport.useMutation()
  const isEditable = useMemo(() => !campaign?.archive && !currentPhase?.ended_by, [ campaign, currentPhase ])

  const [ progress, setProgress ] = useState<Array<Progression>>([]);
  const [ sort, setSort ] = useState<Sort>({ entry: 'Progress', sort: 'DESC' });

  useEffect(() => {
    if (!fileRanges || !users) return;
    const progression = new Array<Progression>();
    for (const range of fileRanges) {
      let progress: Progression | undefined = progression.find(p => p.user.id === range.annotator);
      if (progress) {
        progress.ranges.push(range);
      } else {
        const user = users.find(u => u.id === range.annotator)!
        progress = {
          user,
          ranges: [ range ],
          progress: 0
        }
        progression.push(progress)
      }
    }
    setProgress(progression.map(p => {
      const totalFinished = p.ranges.reduce((v, r) => v + r.finished_tasks_count, 0);
      const total = p.ranges.reduce((v, r) => v + r.files_count, 0);
      return { ...p, progress: total > 0 ? Math.trunc(100 * totalFinished / total) : 0 }
    }));
  }, [ fileRanges, users ]);

  useEffect(() => {
    if (statusError) toast.presentError(statusError);
    if (reportError) toast.presentError(reportError);
  }, [ statusError, reportError ]);

  function toggleAnnotatorSort() {
    if (!sort || sort.entry !== 'Annotator' || sort.sort === 'DESC') {
      setSort({ entry: 'Annotator', sort: 'ASC' })
    } else {
      setSort({ entry: 'Annotator', sort: 'DESC' })
    }
  }

  function toggleProgressSort() {
    if (!sort || sort.entry !== 'Progress' || sort.sort === 'ASC') {
      setSort({ entry: 'Progress', sort: 'DESC' })
    } else {
      setSort({ entry: 'Progress', sort: 'ASC' })
    }
  }

  function onDownloadStatus() {
    if (currentPhase && campaign) downloadStatus({
      phaseID: currentPhase.id,
      filename: campaign.name.replaceAll(' ', '_') + '_results.csv'
    })
  }

  function onDownloadReport() {
    if (currentPhase && campaign) downloadReport({
      phaseID: currentPhase.id,
      filename: campaign.name.replaceAll(' ', '_') + '_results.csv'
    })
  }

  function manageAnnotator() {
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ currentPhase?.id }/edit-annotators`);
  }

  const sortProgress = useCallback((a: Progression, b: Progression) => {
    let comparison = 0;
    switch (sort.entry) {
      case "Annotator":
        comparison = a.user.display_name_with_expertise.toLowerCase().localeCompare(b.user.display_name_with_expertise.toLowerCase());
        break;
      case "Progress":
        comparison = a.progress - b.progress;
    }
    if (sort.sort === 'ASC') return comparison;
    return -comparison;
  }, [ sort ])

  return (
    <Modal onClose={ onClose } className={ styles.modal }>
      <ModalHeader onClose={ onClose } title='Annotators progression'/>

      { (isLoadingUsers || isLoadingFileRanges) && <IonSpinner/> }

      { userError && <WarningText>{ getErrorMessage(userError) }</WarningText> }
      { fileRangeError && <WarningText>{ getErrorMessage(fileRangeError) }</WarningText> }

      { (!isLoadingUsers && !isLoadingFileRanges) && progress.length === 0 && <IonNote>No annotators</IonNote> }

      { progress.length > 0 &&
          <Table columns={ 2 } className={ styles.table }>
              <TableHead isFirstColumn={ true } className={ [ styles.sortedHead, styles.stickyHead ].join(' ') }
                         onClick={ toggleAnnotatorSort }>
                  <p>Annotator</p>
                  <IonIcon
                      className={ [ styles.up, sort?.entry === 'Annotator' && sort.sort === 'ASC' ? styles.active : '' ].join(' ') }
                      icon={ caretUp }/>
                  <IonIcon
                      className={ [ styles.down, sort?.entry === 'Annotator' && sort.sort === 'DESC' ? styles.active : '' ].join(' ') }
                      icon={ caretDown }/>
              </TableHead>
              <TableHead className={ [ styles.sortedHead, styles.stickyHead ].join(' ') }
                         onClick={ toggleProgressSort }>
                  <p>Progress</p>
                  <IonIcon
                      className={ [ styles.up, sort?.entry === 'Progress' && sort.sort === 'ASC' ? styles.active : '' ].join(' ') }
                      icon={ caretUp }/>
                  <IonIcon
                      className={ [ styles.down, sort?.entry === 'Progress' && sort.sort === 'DESC' ? styles.active : '' ].join(' ') }
                      icon={ caretDown }/>
              </TableHead>

            { progress.sort(sortProgress).map(p => {
              return (
                <Fragment key={ p.user.display_name_with_expertise }>
                  <TableDivider/>
                  <TableContent
                    isFirstColumn={ true }>{ p.user.display_name_with_expertise }</TableContent>
                  <TableContent className={ styles.progressContent }>
                    <div>
                      { p.ranges.map(r => (
                        <Fragment key={ r.id }>
                          <p>{ r.first_file_index }</p>
                          <Progress value={ r.finished_tasks_count } total={ r.files_count }
                                    color={ r.finished_tasks_count === r.files_count ? 'success' : 'medium' }/>
                          <p>{ r.last_file_index }</p>
                        </Fragment>
                      )) }
                      <p className={ styles.total }>{ p.progress }%</p>
                    </div>
                  </TableContent>
                </Fragment>
              );
            }) }
          </Table> }

      { hasAdminAccess && users && fileRanges && (
        <ModalFooter className={ styles.footer }>
          <div className={ styles.buttons }>
            { progress.length > 0 && <Fragment>
                <IonButton fill='outline' onClick={ onDownloadReport }>
                    <IonIcon icon={ downloadOutline } slot='start'/>
                    Results (csv)
                </IonButton>

                <IonButton fill='outline' onClick={ onDownloadStatus }>
                    <IonIcon icon={ downloadOutline } slot='start'/>
                    Status (csv)
                </IonButton>
            </Fragment> }
          </div>

          { isEditable && <IonButton onClick={ manageAnnotator }>Manage annotators</IonButton> }
        </ModalFooter>
      )
      }
    </Modal>
  )
}
