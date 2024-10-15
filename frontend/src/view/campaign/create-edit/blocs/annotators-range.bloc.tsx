import React, { ChangeEvent, Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { FormBloc, Input, Searchbar } from "@/components/form";
import { getDisplayName, User } from '@/types/user';
import { useToast } from "@/services/utils/toast";
import { AnnotationFileRange, useAnnotationFileRangeAPI, useUsersAPI } from "@/services/api";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { trashBinOutline } from "ionicons/icons";
import styles from './bloc.module.scss';
import { BasicCampaign } from "@/services/api/annotation-file-range-api.service.tsx";
import { Item } from "@/types/item.ts";
import { BlocRef } from "./util.bloc.ts";

export const AnnotatorsRangeBloc = React.forwardRef<BlocRef, {
  campaign: BasicCampaign | undefined
}>(({ campaign }, ref) => {

  // API Data
  // Use negative fileRange id for newly created ones
  const [ fileRanges, setFileRanges ] = useState<Array<AnnotationFileRange>>([]);
  const [ users, setUsers ] = useState<Array<User> | undefined>(undefined);

  // Services
  const toast = useToast();
  const fileRangeService = useAnnotationFileRangeAPI();
  const userService = useUsersAPI();

  // Ref
  const annotatorRowRef = useRef<Array<AnnotatorRowRef | null>>([]);
  useImperativeHandle(ref, () => {
    const array = annotatorRowRef.current.filter(ref => !!ref) as Array<AnnotatorRowRef>;
    return {
      isValid: array.reduce((previous, current) => previous && current.isValid, true),
      getErrorMessage(): string {
        const invalidEntry = array.find(r => !r.isValid)
        if (!invalidEntry) return "Unknown error";
        return `${ getDisplayName(invalidEntry.annotator) } file ranges are incorrect`;
      },
      async submit() {
        if (!campaign) return;
        await fileRangeService.send(campaign.id, fileRanges, campaign?.files_count - 1)
      }
    }
  }, [])

  useEffect(() => {
    if (!campaign) return;
    let isCancelled = false;

    Promise.all([
      fileRangeService.listForCampaign(campaign.id).then(setFileRanges),
      userService.list().then(setUsers)
    ]).catch(e => !isCancelled && toast.presentError(e));

    return () => {
      isCancelled = true;
      fileRangeService.abort();
      userService.abort();
    }
  }, [ campaign ])

  useEffect(() => {
    if (!fileRanges) annotatorRowRef.current = [];
    else annotatorRowRef.current = annotatorRowRef.current.slice(0, fileRanges.length);
  }, [ fileRanges ]);

  const onAddAnnotator = (value: Item) => {
    if (!campaign) return;
    setFileRanges(previous => [ ...previous, {
      annotator: value.value as number,
      annotation_campaign: campaign.id,
      last_file_index: -1,
      first_file_index: -1,
      finished_tasks_count: 0,
      id: Math.min(0, ...previous.map(r => r.id)) - 1
    } ])
  }

  const onFileRangeChange = (range: AnnotationFileRange) => {
    setFileRanges(previous => previous.map(r => {
      if (r.id === range.id) return range;
      return r
    }))
  }

  const onFileRangeDelete = (range: AnnotationFileRange) => {
    setFileRanges(previous => previous.filter(r => r.id !== range.id))
  }

  if (!campaign || !users) return <IonSpinner/>
  return (
    <FormBloc label="Annotators">

      <Table columns={ 2 }>
        <TableHead isFirstColumn={ true }>Annotator</TableHead>
        <TableHead>
          File range
          <small>(between 0 and { campaign.files_count - 1 })</small>
        </TableHead>
        <TableHead/>
        <TableDivider/>
        { fileRanges.map((range, index) => <AnnotatorRangeLine key={ index }
                                                               ref={ el => annotatorRowRef.current[index] = el }
                                                               range={ range }
                                                               annotator={ users.find(u => u.id === range.annotator)! }
                                                               campaign={ campaign }
                                                               onUpdate={ onFileRangeChange }
                                                               onDelete={ onFileRangeDelete }
        />) }
      </Table>

      <Searchbar placeholder="Search annotator..."
                 values={
                   users.filter(u => !fileRanges.find(range => range.annotator === u.id))
                     .map(a => ({ value: a.id, label: getDisplayName(a, true) }))
                 }
                 onValueSelected={ onAddAnnotator }/>

    </FormBloc>
  )
})

type AnnotatorRowRef = {
  isValid: boolean;
  annotator: User;
}

const AnnotatorRangeLine = React.forwardRef<
  AnnotatorRowRef,
  {
    range: AnnotationFileRange;
    annotator: User;
    campaign: BasicCampaign;
    onUpdate: (range: AnnotationFileRange) => void;
    onDelete: (range: AnnotationFileRange) => void;
  }
>(({ range, annotator, campaign, onUpdate, onDelete }, ref) => {
  const onFirstFileIndexChange = (event: ChangeEvent<HTMLInputElement>, range: AnnotationFileRange) => {
    onUpdate({
      ...range,
      first_file_index: +event.target.value,
    })
  }

  const onLastFileIndexChange = (event: ChangeEvent<HTMLInputElement>, range: AnnotationFileRange) => {
    onUpdate({
      ...range,
      last_file_index: +event.target.value,
    })
  }

  const disabled = useMemo(() => range.finished_tasks_count > 0, [ range.finished_tasks_count ])
  const max = useMemo(() => campaign.files_count - 1, [ campaign.files_count ])

  const isValid = useMemo(() => {
    const max = campaign.files_count - 1;
    if (range.first_file_index > max || range.last_file_index > max) return false;
    return range.first_file_index <= range.last_file_index;
  }, [ range.first_file_index, range.last_file_index ]);

  useImperativeHandle(ref, () => ({
    isValid,
    annotator
  }), [ range.first_file_index, range.last_file_index, annotator ]);

  return <Fragment key={ range.id }>
    <TableContent isFirstColumn={ true }>
      { getDisplayName(annotator) }
    </TableContent>
    <TableContent>
      <div className={ styles.fileRangeCell }>
        { disabled && <span>{ range.first_file_index }</span> }
        { !disabled && <Input type="number"
                              aria-invalid={ range.last_file_index < range.first_file_index || range.first_file_index >= campaign.files_count }
                              value={ range.first_file_index < 0 ? undefined : range.first_file_index }
                              placeholder="0"
                              min={ 0 } max={ max }
                              onChange={ event => onFirstFileIndexChange(event, range) }/> }
        -
        { disabled && <span>{ range.last_file_index }</span> }
        { !disabled && <Input type="number"
                              aria-invalid={ range.last_file_index < range.first_file_index || range.last_file_index >= campaign.files_count }
                              value={ range.last_file_index < 0 ? undefined : range.last_file_index }
                              placeholder={ max.toString() }
                              min={ 0 } max={ max }
                              onChange={ event => onLastFileIndexChange(event, range) }/> }
      </div>
    </TableContent>
    <TableContent>
      <IonButton disabled={ disabled }
                 color="danger"
                 onClick={() => onDelete(range)}>
        <IonIcon icon={ trashBinOutline }/>
      </IonButton>
    </TableContent>
    <TableDivider/>
  </Fragment>
})