import React, { Fragment, useMemo, useState } from "react";
import { FormBloc, Input, Searchbar } from "@/components/form";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { lockClosedOutline, trashBinOutline } from "ionicons/icons";
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
import { WriteAnnotationFileRange } from '@/service/campaign/annotation-file-range';
import { useListDatasetQuery } from '@/service/dataset';
import { useAlert } from "@/service/ui";
import { AnnotatorGroupAPI } from "@/service/annotator-group";
import { Item } from "@/types/item.ts";

type SearchItem = {
  type: 'user' | 'group';
  id: number;
  display: string;
}

export const AnnotatorsRangeBloc: React.FC<{
  setIsForced?: (value: true) => void
}> = ({ setIsForced }) => {

  // State
  const dispatch = useAppDispatch();
  const draftCampaign = useAppSelector(selectDraftCampaign);
  const currentCampaign = useAppSelector(selectCurrentCampaign);
  const draftFileRanges = useAppSelector(selectDraftFileRange);

  // Services
  const { data: users } = useListUsersQuery()
  const { data: groups } = AnnotatorGroupAPI.useListQuery();
  const { data: allDatasets } = useListDatasetQuery(undefined, { skip: !!currentCampaign });

  // Memo
  const filesCount = useMemo(() => {
    if (currentCampaign?.files_count) return currentCampaign.files_count;
    if (!draftCampaign.datasets || draftCampaign.datasets.length === 0) return undefined;
    const dataset = allDatasets?.find(d => draftCampaign.datasets![0] === d.name);
    if (!dataset) return undefined;
    return dataset.files_count;
  }, [ currentCampaign?.files_count, draftCampaign.datasets, allDatasets ]);

  const availableUsers: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [];
    if (users) {
      items.push(...users.filter(u => {
        if (!filesCount) return true;
        const count = draftFileRanges
          .filter(r => r.annotator === u.id)
          .reduce((count, range) => {
            const last_index = range.last_file_index ?? filesCount ?? 0;
            const first_index = range.first_file_index ?? 0;
            return count + (last_index - first_index)
          }, 0) + 1
        return count < filesCount
      }).map(u => ({ id: u.id, display: getDisplayName(u, true), type: 'user' } satisfies SearchItem)));
    }
    if (groups) {
      items.push(...groups.map(g => ({ id: g.id, display: g.name, type: 'group' } satisfies SearchItem)))
    }
    return items;
  }, [ users, filesCount, draftFileRanges, groups ]);

  function onAddItem(item: Item) {
    const [type, id] = (item.value as string).split('-');
    if (type === 'user') dispatch(addDraftFileRange({ annotator: +id }))
    else if (type === 'group') {
      const group = groups?.find(g => g.id === +id)
      for (const user of group?.annotators ?? [] ) {
        if (availableUsers.find(a => a.type === 'user' && a.id === user.id)) {
          dispatch(addDraftFileRange({ annotator: user.id }))
        }
      }
    }
  }

  if (!users) return <FormBloc label="Annotators"><IonSpinner/></FormBloc>
  return (
    <FormBloc label="Annotators">

      { draftFileRanges.length > 0 &&
          <Table columns={ 3 }>
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
                                                               setIsForced={ setIsForced }
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
                 values={ availableUsers.map(a => ({ value: `${ a.type }-${ a.id }`, label: a.display })) }
                 onValueSelected={ onAddItem }/>

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
  setIsForced?: (value: true) => void
}> = ({ range, annotator, filesCount, onFirstIndexChange, onLastIndexChange, onDelete, setIsForced }) => {
  const [ isLocked, setIsLocked ] = useState<boolean>(!!range.finished_tasks_count);
  const alert = useAlert();

  function unlock() {
    alert.present({
      message: `This annotator has already started to annotated. By updating its file range you could remove some annotations he/she made. Are you sure?`,
      cssClass: 'danger-confirm-alert',
      buttons: [
        {
          text: `Update file range`,
          cssClass: 'ion-color-danger',
          handler: () => {
            setIsLocked(false)
            if (setIsForced) setIsForced(true)
          }
        },
        'Cancel',
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
