import React, { Fragment, useCallback, useMemo, useState } from "react";
import styles from './styles.module.scss'
import { PhaseGlobalProgress, PhaseUserProgress, ProgressModalButton } from "@/components/AnnotationCampaign/Phase";
import { IonButton, IonIcon, IonSpinner } from "@ionic/react";
import { AnnotationFile, AnnotationFileRangeAPI } from "@/service/campaign/annotation-file-range";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { ActionBar } from "@/components/layout";
import { checkmarkCircle, chevronForwardOutline, ellipseOutline, playOutline, refreshOutline } from "ionicons/icons";
import { Button, Link, Pagination, Table, TableContent, TableDivider, TableHead, WarningText } from "@/components/ui";
import { setFileFilters } from "@/service/ui";
import { useNavigate } from "react-router-dom";
import { AnnotationCampaign, CampaignAPI } from "@/service/campaign";
import { AnnotationCampaignPhase } from "@/service/campaign/phase";
import { getErrorMessage } from "@/service/function.ts";
import { AnnotationsFilter } from "@/view/campaign/details/filters/AnnotationsFilter.tsx";
import { StatusFilter } from "@/view/campaign/details/filters/StatusFilter.tsx";
import { DateFilter } from "@/view/campaign/details/filters/DateFilter.tsx";

export const AnnotationCampaignPhaseDetail: React.FC = () => {
  const { data: campaign, currentPhase } = CampaignAPI.useRetrieveQuery()
  const navigate = useNavigate()
  const [ page, setPage ] = useState<number>(1);
  const fileFilters = useAppSelector(state => state.ui.fileFilters);
  const dispatch = useAppDispatch();
  AnnotationFileRangeAPI.useListFilesWithPaginationQuery({
    page: 1,
    phaseID: currentPhase!.id,
    filters: {}
  }, { refetchOnMountOrArgChange: true, skip: !currentPhase || !!campaign?.archive });
  const { currentData: files, isFetching, error } = AnnotationFileRangeAPI.useListFilesWithPaginationQuery({
    page,
    phaseID: currentPhase!.id,
    filters: fileFilters
  }, { skip: !currentPhase || !!campaign?.archive });
  const isEmpty = useMemo(() => error || (files && files.count === 0) || campaign?.archive, [ error, files, campaign ])
  const hasFilters = useMemo(() => Object.values(fileFilters).filter(v => v !== undefined).length > 0, [ fileFilters ]);
  const isResumeEnabled = useMemo(() => {
    return fileFilters.withUserAnnotations === undefined && fileFilters.search === undefined && fileFilters.isSubmitted === undefined
  }, [ fileFilters ]);

  const resume = useCallback(() => {
    if (!campaign || !currentPhase || !files) return;
    navigate(`/annotation-campaign/${ campaign.id }/phase/${ currentPhase.id }/file/${ files.resume }`);
  }, [ campaign, currentPhase, files ])

  const updateSearch = useCallback((search: string) => {
    dispatch(setFileFilters({ ...fileFilters, search }))
    setPage(1)
  }, [ fileFilters ])

  const resetFilters = useCallback(() => {
    dispatch(setFileFilters({
      isSubmitted: undefined,
      label: undefined,
      confidence: undefined,
      withUserAnnotations: undefined,
    }))
    setPage(1)
  }, [])

  const onFilterUpdated = useCallback(() => {
    setPage(1)
  }, [])

  if (!campaign || !currentPhase) return <IonSpinner/>
  return <div className={ styles.phase }>

    <div className={ [ styles.tasks, isEmpty ? styles.empty : '' ].join(' ') }>

      <ActionBar search={ fileFilters.search }
                 searchPlaceholder="Search filename"
                 onSearchChange={ updateSearch }
                 actionButton={ <div className={ styles.filterButtons }>

                   { hasFilters && <IonButton fill='clear' color='medium' size='small' onClick={ resetFilters }>
                       <IonIcon icon={ refreshOutline } slot='start'/>
                       Reset
                   </IonButton> }

                   <div className={ styles.progress }>
                     <PhaseUserProgress phase={ currentPhase }/>
                     <PhaseGlobalProgress phase={ currentPhase }/>
                     <ProgressModalButton size='small'/>
                   </div>

                   <Link fill='outline' color='medium' size='small'
                         appPath={ `/annotation-campaign/${ campaign.id }/phase/${ currentPhase.id }/import-annotations` }>
                     Import annotations
                   </Link>

                   { !(error || campaign?.archive) && <Button color="primary" fill='outline' size='small'
                                                              disabled={ !(files && files.count > 0) || !files?.resume || !isResumeEnabled }
                                                              disabledExplanation={ files && files.count > 0 ? 'Cannot resume if filters are activated.' : 'No files to annotate' }
                                                              style={ { pointerEvents: 'unset' } }
                                                              onClick={ resume }>
                       Resume
                       <IonIcon icon={ playOutline } slot="end"/>
                   </Button> }
                 </div> }/>

      { currentPhase.phase === 'Verification' && !currentPhase.has_annotations &&
          <WarningText>
              Your campaign doesn't have any annotations to check
              <Link appPath={ `/annotation-campaign/${ campaign?.id }/phase/${ currentPhase.id }/import-annotations` }>
                  Import annotations
              </Link>
          </WarningText> }

      <Table columns={ currentPhase.phase === 'Verification' ? 7 : 6 } className={ styles.filesTable }>
        <TableHead topSticky isFirstColumn={ true }>
          Filename
        </TableHead>
        <TableHead topSticky>
          Date
          <DateFilter onUpdate={ onFilterUpdated }/>
        </TableHead>
        <TableHead topSticky>
          Duration
        </TableHead>
        <TableHead topSticky>
          Annotations
          <AnnotationsFilter onUpdate={ onFilterUpdated }/>
        </TableHead>
        { currentPhase.phase === 'Verification' && <TableHead topSticky>
            Validated annotations
        </TableHead> }
        <TableHead topSticky>
          Status
          <StatusFilter onUpdate={ onFilterUpdated }/>
        </TableHead>
        <TableHead topSticky>
          Access
        </TableHead>
        <TableDivider/>

        { files?.results.map(file => <TaskItem key={ file.id }
                                               file={ file }
                                               phase={ currentPhase }
                                               campaign={ campaign }/>) }
      </Table>

      { files && files.results.length > 0 &&
          <Pagination currentPage={ page } totalPages={ files.pageCount } setCurrentPage={ setPage }/> }

      { isFetching && <IonSpinner/> }
      { error && <WarningText>{ getErrorMessage(error) }</WarningText> }
      { files && files.count === 0 && <p>You have no files to annotate.</p> }
      { campaign?.archive && <p>The campaign is archived. No more annotation can be done.</p> }

    </div>
  </div>
}

const TaskItem: React.FC<{
  campaign: AnnotationCampaign;
  phase: AnnotationCampaignPhase;
  file: AnnotationFile;
}> = ({ campaign, phase, file }) => {
  const navigate = useNavigate()
  const startDate = useMemo(() => new Date(file.start), [ file.start ]);
  const duration = useMemo(() => new Date(new Date(file.end).getTime() - startDate.getTime()), [ file.end, file.start ]);

  function access() {
    navigate(`/annotation-campaign/${ campaign.id }/phase/${ phase.id }/file/${ file.id }`);
  }

  return <Fragment>
    <TableContent isFirstColumn={ true } disabled={ file.is_submitted }>{ file.filename }</TableContent>
    <TableContent disabled={ file.is_submitted }>{ startDate.toUTCString() }</TableContent>
    <TableContent disabled={ file.is_submitted }>{ duration.toUTCString().split(' ')[4] }</TableContent>
    <TableContent disabled={ file.is_submitted }>{ file.results_count }</TableContent>
    { phase.phase == 'Verification' &&
        <TableContent disabled={ file.is_submitted }>{ file.validated_results_count }</TableContent> }
    <TableContent disabled={ file.is_submitted }>
      { file.is_submitted &&
          <IonIcon icon={ checkmarkCircle } className={ styles.statusIcon } color='primary'/> }
      { !file.is_submitted &&
          <IonIcon icon={ ellipseOutline } className={ styles.statusIcon } color='medium'/> }
    </TableContent>
    <TableContent disabled={ file.is_submitted }>
      <Link color='dark' fill='clear' size='small' className={ styles.submit }
            appPath={ `/annotation-campaign/${ campaign.id }/phase/${ phase.id }/file/${ file.id }` }
            onClick={ access }>
        <IonIcon icon={ chevronForwardOutline } color='primary' slot='icon-only'/>
      </Link>
    </TableContent>
    <TableDivider/>
  </Fragment>
}
