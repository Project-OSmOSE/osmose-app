import React, { Fragment, useEffect, useMemo } from "react";
import { FormBloc, Input, Searchbar } from "@/components/form";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { trashBinOutline } from "ionicons/icons";
import styles from './bloc.module.scss';
import { useAppDispatch, useAppSelector } from '@/service/app';
import { getDisplayName, useListUsersQuery, User } from '@/service/user';
import {
  addDraftFileRange,
  removeDraftFileRange,
  selectCurrentCampaign,
  selectDraftCampaign,
  selectDraftFileRange,
  updateDraftFileRange
} from '@/service/campaign';
import { useListAnnotationFileRangeQuery, WriteAnnotationFileRange } from '@/service/campaign/annotation-file-range';
import { useListDatasetQuery } from '@/service/dataset';

export const AnnotatorsRangeBloc: React.FC = () => {

  // State
  const dispatch = useAppDispatch();
  const draftCampaign = useAppSelector(selectDraftCampaign);
  const createdCampaign = useAppSelector(selectCurrentCampaign);
  const draftFileRanges = useAppSelector(selectDraftFileRange);

  // Services
  const { data: users } = useListUsersQuery()
  const { data: initialFileRanges } = useListAnnotationFileRangeQuery({ campaignID: createdCampaign?.id ?? -1 })
  const { data: allDatasets } = useListDatasetQuery();

  // Memo
  const filesCount = useMemo(() => {
    if (createdCampaign?.files_count) return createdCampaign?.files_count;
    if (!draftCampaign.datasets || draftCampaign.datasets.length === 0) return undefined;
    return allDatasets?.find(d => draftCampaign.datasets![0] === d.name)?.files_count;
  }, [ createdCampaign?.files_count, draftCampaign.datasets, allDatasets ]);
  const availableUsers = useMemo(() => {
    if (!filesCount) return users ?? [];
    return users?.filter(u =>
      draftFileRanges
        .filter(r => r.annotator === u.id)
        .reduce((count, range) => {
          const last_index = range.last_file_index ?? filesCount ?? 0;
          const first_index = range.first_file_index ?? 0;
          return count + (last_index - first_index)
        }, 0)
      < filesCount
    ) ?? [];
  }, [ users, filesCount ]);

  // Updates
  useEffect(() => {
    for (const range of initialFileRanges ?? []) {
      dispatch(addDraftFileRange(range))
    }
  }, [ initialFileRanges ]);

  if (!users) return <FormBloc label="Annotators"><IonSpinner/></FormBloc>
  return (
    <FormBloc label="Annotators">

      { draftFileRanges.length > 0 &&
          <Table columns={ 2 }>
              <TableHead isFirstColumn={ true }>Annotator</TableHead>
              <TableHead>
                  File range
                  <small>(between 1 and { filesCount ?? 1 })</small>
                  <small className="disabled"><i>Start and end limits are included</i></small>
              </TableHead>
              <TableHead/>
              <TableDivider/>
            { draftFileRanges.map(range => <AnnotatorRangeLine key={ range.id }
                                                               range={ range }
                                                               annotator={ users.find(u => u.id === range.annotator)! }
                                                               filesCount={ filesCount ?? 0 }
                                                               onFirstIndexChange={ first_file_index => dispatch(updateDraftFileRange({
                                                                 id: range.id,
                                                                 first_file_index
                                                               })) }
                                                               onLastIndexChange={ last_file_index => dispatch(updateDraftFileRange({
                                                                 id: range.id,
                                                                 last_file_index
                                                               })) }
                                                               onDelete={ () => dispatch(removeDraftFileRange(range.id)) }
            />) }
          </Table>
      }

      <Searchbar placeholder="Search annotator..."
                 values={ availableUsers.map(a => ({ value: a.id, label: getDisplayName(a, true) })) }
                 onValueSelected={ item => dispatch(addDraftFileRange({ annotator: item.value as number })) }/>

    </FormBloc>
  )
}

const AnnotatorRangeLine: React.FC<{
  range: Partial<WriteAnnotationFileRange> & { id: number, annotator: number, finished_tasks_count?: number },
  annotator: User,
  filesCount: number,
  onFirstIndexChange: (index: number) => void,
  onLastIndexChange: (index: number) => void,
  onDelete: () => void,
}> = ({ range, annotator, filesCount, onFirstIndexChange, onLastIndexChange, onDelete }) => (
  <Fragment key={ range.id }>
    <TableContent isFirstColumn={ true }>
      { getDisplayName(annotator) }
    </TableContent>
    <TableContent>
      <div className={ styles.fileRangeCell }>
        { range.finished_tasks_count &&
            <span data-tooltip={ 'This user as already started to annotate' }>{ range.first_file_index! + 1 }</span> }
        { !range.finished_tasks_count && <Input type="number"
                                                value={ range.first_file_index }
                                                onChange={ e => onFirstIndexChange(+e.target.value) }
                                                placeholder="1"
                                                min={ 1 } max={ filesCount }
                                                disabled={ filesCount === undefined }/> }
        -
        { range.finished_tasks_count &&
            <span data-tooltip={ 'This user as already started to annotate' }>{ range.last_file_index! + 1 }</span> }
        { !range.finished_tasks_count && <Input type="number"
                                                value={ range.last_file_index }
                                                onChange={ e => onLastIndexChange(+e.target.value) }
                                                placeholder={ filesCount?.toString() }
                                                min={ 1 } max={ filesCount }
                                                disabled={ filesCount === undefined }/> }
      </div>
    </TableContent>
    <TableContent>
      <IonButton disabled={ !!range.finished_tasks_count }
                 color="danger"
                 data-tooltip={ 'This user as already started to annotate' }
                 onClick={ onDelete }>
        <IonIcon icon={ trashBinOutline }/>
      </IonButton>
    </TableContent>
    <TableDivider/>
  </Fragment>
)
