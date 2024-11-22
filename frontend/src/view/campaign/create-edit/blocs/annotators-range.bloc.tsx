import React, { Fragment, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { FormBloc, Input, Searchbar } from "@/components/form";
import { getDisplayName, User } from '@/types/user';
import { useToast } from "@/services/utils/toast";
import { AnnotationCampaign, AnnotationFileRange, useAnnotationFileRangeAPI, useUsersAPI } from "@/services/api";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { trashBinOutline } from "ionicons/icons";
import styles from './bloc.module.scss';
import { Item } from "@/types/item.ts";
import { BlocRef } from "./util.bloc.ts";
import { InputRef } from "@/components/form/inputs/utils.ts";
import { InputValue } from "@/components/form/inputs/input.tsx";
import { useAppSelector } from '@/slices/app.ts';

type FileRangeError = { [key in keyof AnnotationFileRange]?: string[] };

export const AnnotatorsRangeBloc = React.forwardRef<BlocRef, {
  campaign?: AnnotationCampaign,
  files_count?: number
}>(({ campaign, files_count }, ref) => {

  // API Data
  // Use negative fileRange id for newly created ones
  const [ fileRanges, setFileRanges ] = useState<Array<AnnotationFileRange>>([]);
  const [ users, setUsers ] = useState<Array<User> | undefined>(undefined);
  const _campaignID = useRef<number | undefined>(campaign?.id);
  const _files_count = useRef<number | undefined>(files_count);
  const {
    campaignID,
  } = useAppSelector(state => state.createCampaignForm.importAnnotations);
  useEffect(() => {
    _campaignID.current = campaign?.id ?? campaignID;
  }, [ campaign, campaignID ]);
  useEffect(() => {
    _files_count.current = files_count;
  }, [ files_count ]);

  const _fileRanges = useRef<Array<AnnotationFileRange>>([]);
  useEffect(() => {
    _fileRanges.current = fileRanges;
    annotatorRowRef.current = annotatorRowRef.current.slice(0, fileRanges.length)
    for (const id in annotatorRowRef.current) {
      annotatorRowRef.current[id]?.setValue(fileRanges[id])
    }
  }, [ fileRanges ]);

  // Services
  const toast = useToast();
  const fileRangeService = useAnnotationFileRangeAPI();
  const userService = useUsersAPI();

  // Ref
  const annotatorRowRef = useRef<Array<InputRef<AnnotationFileRange, FileRangeError> | null>>([]);
  useImperativeHandle(ref, () => ({
    get isValid() {
      try {
        for (const row of annotatorRowRef.current) row?.validate();
        return true;
      } catch {
        return false;
      }
    },
    async submit() {
      if (!_campaignID.current || !_files_count.current) return;
      const data = annotatorRowRef.current.map(ref => ref?.validate()).filter(r => !!r)
      try {
        await fileRangeService.updateForCampaign(_campaignID.current, data.map(r => ({
          id: r.id >= 0 ? r.id : undefined,
          first_file_index: r.first_file_index < 0 ? 0 : r.first_file_index,
          last_file_index: r.last_file_index < 0 ? _files_count.current! - 1 : r.last_file_index,
          annotator: r.annotator
        })))
      } catch (e) {
        if ((e as any).status === 400) {
          const response = (e as any).response.text;
          try {
            const response_errors = JSON.parse(response);
            for (const id in annotatorRowRef.current) {
              annotatorRowRef.current[id]?.setError(response_errors[id])
            }
          } catch (e) {
            console.warn(e)
          }
        }
        throw e
      }
    }
  }), [])

  useEffect(() => {
    let isCancelled = false;

    if (users?.length) return;

    Promise.all([
      campaign ? fileRangeService.listForCampaign(campaign.id).then(setFileRanges) : undefined,
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
    setFileRanges(previous => [ ...previous, {
      id: Math.min(0, ...previous.map(r => r.id)) - 1,
      annotator: value.value as number,
      annotation_campaign: campaign?.id ?? -1,
      last_file_index: -1,
      first_file_index: -1,
      finished_tasks_count: 0,
      files_count: 0
    } ])
  }

  const onFileRangeDelete = (range: AnnotationFileRange) => {
    setFileRanges(previous => previous.filter(r => r.id !== range.id))
  }

  if (!users) return <FormBloc label="Annotators"><IonSpinner/></FormBloc>
  return (
    <FormBloc label="Annotators">

      { fileRanges.length > 0 &&
          <Table columns={ 2 }>
              <TableHead isFirstColumn={ true }>Annotator</TableHead>
              <TableHead>
                  File range
                  <small>(between 1 and { files_count ?? 1 })</small>
                  <small className="disabled"><i>Start and end limits are included</i></small>
              </TableHead>
              <TableHead/>
              <TableDivider/>
            { fileRanges.map((range, index) => <AnnotatorRangeLine key={ index }
                                                                   initialRange={ range }
                                                                   ref={ el => annotatorRowRef.current[index] = el }
                                                                   annotator={ users.find(u => u.id === range.annotator)! }
                                                                   files_count={ files_count }
                                                                   onDelete={ onFileRangeDelete }
            />) }
          </Table>
      }

      <Searchbar placeholder="Search annotator..."
                 values={
                   users.filter(u => fileRanges.filter(range => range.annotator === u.id).reduce((a, b) => a + b.files_count, 0) < (files_count ?? 0))
                     .map(a => ({ value: a.id, label: getDisplayName(a, true) }))
                 }
                 onValueSelected={ onAddAnnotator }/>

    </FormBloc>
  )
})

const AnnotatorRangeLine = React.forwardRef<
  InputRef<AnnotationFileRange, FileRangeError>,
  {
    initialRange: AnnotationFileRange,
    annotator: User;
    files_count?: number;
    onDelete: (range: AnnotationFileRange) => void;
  }
>(({ initialRange, annotator, files_count, onDelete }, ref) => {
  const inputsRef = useRef<{ [key in 'first_file_index' | 'last_file_index']: InputRef<InputValue> | null }>({
    first_file_index: null,
    last_file_index: null
  });
  const [ range, setRange ] = useState<AnnotationFileRange | undefined>()
  const _range = useRef<AnnotationFileRange | undefined>()
  useEffect(() => {
    if (_range.current) return;
    setValue(initialRange);
  }, [ initialRange ]);

  const disabled = useMemo(() => (_range.current?.finished_tasks_count ?? 0) > 0, [ _range.current ])

  const setValue = async (range: AnnotationFileRange) => {
    if (range.finished_tasks_count > 0) return;
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (inputsRef.current.first_file_index && inputsRef.current.last_file_index) {
          resolve(true)
          clearInterval(interval)
        }
      }, 50)
      setTimeout(() => {
        resolve(true)
        clearInterval(interval)
      }, 500)
    })
    inputsRef.current.first_file_index?.setValue(range.first_file_index < 0 ? undefined : range.first_file_index + 1);
    inputsRef.current.last_file_index?.setValue(range.last_file_index < 0 ? undefined : range.last_file_index + 1);
    _range.current = range;
    setRange(range);
  }

  useImperativeHandle(ref, () => ({
    setValue,
    setError(error: FileRangeError) {
      if (error.first_file_index) inputsRef.current.first_file_index?.setError(error.first_file_index.join(' '))
      if (error.last_file_index) inputsRef.current.last_file_index?.setError(error.last_file_index.join(' '))
    },
    validate() {
      if (!_range.current) throw 'Not initialized range.';
      if (disabled) return _range.current;
      let first_file_index = inputsRef.current.first_file_index?.validate();
      first_file_index = first_file_index === undefined ? 0 : +first_file_index - 1;
      let last_file_index = inputsRef.current.last_file_index?.validate();
      last_file_index = last_file_index === undefined ? (files_count ?? 1) - 1 : +last_file_index - 1;
      return {
        ..._range.current!,
        first_file_index, last_file_index,
      }
    }
  }), []);

  if (!range) return <Fragment/>;
  return <Fragment key={ range.id }>
    <TableContent isFirstColumn={ true }>
      { getDisplayName(annotator) }
    </TableContent>
    <TableContent>
      <div className={ styles.fileRangeCell }>
        { disabled &&
            <span data-tooltip={ 'This user as already started to annotate' }>{ range.first_file_index + 1 }</span> }
        { !disabled && <Input type="number" ref={ el => inputsRef.current.first_file_index = el }
                              placeholder="1"
                              min={ 1 } max={ files_count }
                              disabled={ files_count === undefined }/> }
        -
        { disabled &&
            <span data-tooltip={ 'This user as already started to annotate' }>{ range.last_file_index + 1 }</span> }
        { !disabled && <Input type="number" ref={ el => inputsRef.current.last_file_index = el }
                              placeholder={ files_count?.toString() }
                              min={ 1 } max={ files_count }
                              disabled={ files_count === undefined }/> }
      </div>
    </TableContent>
    <TableContent>
      <IonButton disabled={ disabled }
                 color="danger"
                 data-tooltip={ 'This user as already started to annotate' }
                 onClick={ () => onDelete(_range.current!) }>
        <IonIcon icon={ trashBinOutline }/>
      </IonButton>
    </TableContent>
    <TableDivider/>
  </Fragment>
})