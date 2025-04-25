import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAlert, useToast } from "@/service/ui";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { getErrorMessage, getNewItemID } from "@/service/function.ts";
import { getDisplayName, User, UserAPI } from "@/service/user";
import { AnnotatorGroupAPI } from "@/service/annotator-group";
import { AnnotationFileRangeAPI, WriteAnnotationFileRange } from "@/service/campaign/annotation-file-range";
import { QueryStatus } from "@reduxjs/toolkit/query";
import { Table, TableContent, TableDivider, TableHead, WarningText } from "@/components/ui";
import { FormBloc, Input, Searchbar } from "@/components/form";
import { lockClosedOutline, trashBinOutline } from "ionicons/icons";
import { Item } from "@/types/item.ts";
import styles from './edit.module.scss';
import { usePagePhase } from "@/service/routing";
import { CampaignAPI } from "@/service/campaign";

type SearchItem = {
  type: 'user' | 'group';
  id: number;
  display: string;
}

export const EditAnnotators: React.FC = () => {
  const { campaignID } = useParams<{ campaignID: string }>();
  const {
    data: campaign,
    isFetching: isFetchingCampaign,
    error: errorLoadingCampaign
  } = CampaignAPI.useRetrieveQuery(campaignID!, { skip: !campaignID });
  const phase = usePagePhase()
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { data: allUsers, isFetching: isFetchingUsers, error: errorLoadingUsers } = UserAPI.useListQuery()
  const { data: allGroups, isFetching: isFetchingGroups, error: errorLoadingGroups } = AnnotatorGroupAPI.useListQuery();
  const {
    data: initialFileRanges,
    isFetching: isFetchingFileRanges,
    error: errorLoadingFileRanges
  } = AnnotationFileRangeAPI.useListQuery({ phaseID: phase?.id })
  const [ postFileRanges, {
    isLoading: isSubmitting,
    error: errorSubmitting,
    status: submissionStatus
  } ] = AnnotationFileRangeAPI.usePostMutation()

  useEffect(() => {
    if (!campaign || !location.state) return;
    if ((location.state as any).fromCreateCampaign) toast.presentSuccess(`Campaign '${ campaign.name }' was successfully created`)
    if ((location.state as any).fromImportAnnotations) toast.presentSuccess(`Annotations for campaign '${ campaign.name }' were successfully imported`)
  }, [ location, campaign ]);

  // File ranges
  const [ fileRanges, setFileRanges ] = useState<Array<Partial<WriteAnnotationFileRange> & {
    id: number,
    annotator: number,
    finished_tasks_count?: number
  }>>([]);
  const availableUsers: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [];
    if (allUsers) {
      items.push(...allUsers.filter(u => {
        if (!campaign) return true;
        const count = fileRanges
          .filter(f => f.annotator === u.id)
          .reduce((count, range) => {
            const last_index = range.last_file_index ?? campaign?.files_count ?? 0;
            const first_index = range.first_file_index ?? 0;
            return count + (last_index - first_index)
          }, 0) + 1
        return count < campaign.files_count
      }).map(u => ({ id: u.id, display: getDisplayName(u, true), type: 'user' } satisfies SearchItem)));
    }
    if (allGroups) {
      items.push(...allGroups.map(g => ({ id: g.id, display: g.name, type: 'group' } satisfies SearchItem)))
    }
    return items;
  }, [ allUsers, campaign, fileRanges, allGroups ]);
  const [ isForced, setIsForced ] = useState<boolean | undefined>();
  useEffect(() => {
    if (initialFileRanges) setFileRanges(initialFileRanges);
  }, [ initialFileRanges ]);
  const addFileRange = useCallback((item: Item) => {
    if (!allUsers || !allGroups) return;
    const [ type, id ] = (item.value as string).split('-');
    const users = []
    switch (type!) {
      case 'user':
        users.push(allUsers.find(u => u.id === +id)!);
        break;
      case 'group':
        users.push(...allGroups.find(g => g.id === +id)!.annotators.filter(u => availableUsers.find(a => a.type === 'user' && a.id === u.id)));
        break
    }
    for (const newUser of users) {
      setFileRanges(prev => [ ...prev, { id: getNewItemID(prev), annotator: newUser.id, } ])
    }
  }, [ allUsers, allGroups ])
  const updateFileRange = useCallback((fileRange: Partial<WriteAnnotationFileRange> & { id: number }) => {
    setFileRanges(prev => prev.map(f => {
      if (f.id !== fileRange.id) return f;
      return { ...f, ...fileRange }
    }))
  }, [])
  const removeFileRange = useCallback((fileRange: Partial<WriteAnnotationFileRange> & { id: number }) => {
    setFileRanges(prev => prev.filter(f => f.id !== fileRange.id))
  }, [])

  // Navigation
  const back = useCallback(() => {
    if (campaign) navigate(`/annotation-campaign/${ campaign.id }`)
  }, [ campaign ])

  // Submit
  const submit = useCallback(() => {
    if (!phase || !campaign) return;
    postFileRanges({
      phaseID: phase.id,
      filesCount: campaign.files_count,
      data: fileRanges,
      force: isForced
    })
  }, [ fileRanges, phase, campaign, isForced ])
  useEffect(() => {
    if (errorSubmitting) toast.presentError(errorSubmitting)
  }, [ errorSubmitting ]);
  useEffect(() => {
    if (submissionStatus === QueryStatus.fulfilled) back()
  }, [ submissionStatus ]);

  return <Fragment>
    <div className={ styles.title }>
      <h2>Manage annotators</h2>
      { campaign && <h5>{ campaign.name }</h5> }
    </div>

    <FormBloc className={ styles.annotators }>

      {/* Loading */ }
      { (isFetchingCampaign || isFetchingUsers || isFetchingGroups || isFetchingFileRanges) && <IonSpinner/> }
      { errorLoadingCampaign &&
          <WarningText>Fail loading campaign:<br/>{ getErrorMessage(errorLoadingCampaign) }</WarningText> }
      { errorLoadingUsers &&
          <WarningText>Fail loading users:<br/>{ getErrorMessage(errorLoadingUsers) }</WarningText> }
      { errorLoadingGroups &&
          <WarningText>Fail loading groups:<br/>{ getErrorMessage(errorLoadingGroups) }</WarningText> }
      { errorLoadingFileRanges &&
          <WarningText>Fail loading file ranges:<br/>{ getErrorMessage(errorLoadingFileRanges) }</WarningText> }

      { fileRanges && campaign && allUsers && allGroups && fileRanges.length > 0 &&
          <Table columns={ 3 }>
              <TableHead isFirstColumn={ true }>Annotator</TableHead>
              <TableHead className={styles.fileRangeHead}>
                  File range
                  <small>(between 1 and { campaign.files_count })</small>
                  <small className="disabled"><i>Start and end limits are included</i></small>
              </TableHead>
              <TableHead/>
              <TableDivider/>
            { fileRanges.map(range => <AnnotatorRangeLine key={ range.id }
                                                          range={ range }
                                                          setIsForced={ setIsForced }
                                                          annotator={ allUsers.find(u => u.id === range.annotator)! }
                                                          filesCount={ campaign.files_count }
                                                          onFirstIndexChange={ first_file_index => updateFileRange({
                                                            id: range.id,
                                                            first_file_index
                                                          }) }
                                                          onLastIndexChange={ last_file_index => updateFileRange({
                                                            id: range.id,
                                                            last_file_index
                                                          }) }
                                                          onDelete={ () => removeFileRange(range) }
            />) }
          </Table>
      }

      <Searchbar placeholder="Search annotator..."
                 values={ availableUsers.map(a => ({ value: `${ a.type }-${ a.id }`, label: a.display })) }
                 onValueSelected={ addFileRange }/>

      <div className={ styles.buttons }>
        <IonButton color='medium' fill='outline' onClick={ back }>
          Back to campaign
        </IonButton>
        { isSubmitting && <IonSpinner/> }
        <IonButton disabled={ isSubmitting } onClick={ submit }>
          Update annotators
        </IonButton>
      </div>

    </FormBloc>
  </Fragment>
}

const AnnotatorRangeLine: React.FC<{
  range: Partial<WriteAnnotationFileRange> & { id: number, annotator: number, finished_tasks_count?: number },
  annotator: User,
  filesCount: number,
  onFirstIndexChange: (index: number) => void,
  onLastIndexChange: (index: number) => void,
  onDelete: () => void,
  setIsForced?: (value: true) => void
}> = ({ range, annotator, filesCount, onFirstIndexChange, onLastIndexChange, onDelete, setIsForced }) => {
  const [ isLocked, setIsLocked ] = useState<boolean>(!!range.finished_tasks_count);
  const alert = useAlert();

  function unlock() {
    alert.showAlert({
      type: 'Warning',
      message: `This annotator has already started to annotated. By updating its file range you could remove some annotations he/she made. Are you sure?`,
      actions: [
        {
          label: `Update file range`,
          callback: () => {
            setIsLocked(false)
            if (setIsForced) setIsForced(true)
          }
        },
      ]
    })
  }

  return (
    <Fragment key={ range.id }>
      <TableContent isFirstColumn={ true }>
        { getDisplayName(annotator) }
      </TableContent>
      <TableContent>
        <div className={ styles.fileRangeCell }>
          <Input type="number"
                 value={ range.first_file_index ?? '' }
                 onChange={ e => onFirstIndexChange(+e.target.value) }
                 placeholder="1"
                 min={ 1 } max={ filesCount }
                 disabled={ filesCount === undefined || isLocked }/>
          -
          <Input type="number"
                 value={ range.last_file_index ?? '' }
                 onChange={ e => onLastIndexChange(+e.target.value) }
                 placeholder={ filesCount?.toString() }
                 min={ 1 } max={ filesCount }
                 disabled={ filesCount === undefined || isLocked }/>
        </div>
      </TableContent>
      <TableContent>
        { isLocked ? <IonButton color='medium' fill='outline'
                                data-tooltip={ 'This user as already started to annotate' }
                                className={ [ styles.annotatorButton, 'tooltip-right' ].join(' ') }
                                onClick={ unlock }>
          <IonIcon icon={ lockClosedOutline }/>
        </IonButton> : <IonButton color="danger"
                                  className={ styles.annotatorButton }
                                  onClick={ onDelete }>
          <IonIcon icon={ trashBinOutline }/>
        </IonButton> }
      </TableContent>
      <TableDivider/>
    </Fragment>
  )
}
