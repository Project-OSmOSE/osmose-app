import React, { Fragment, useEffect, useMemo, useState } from "react";
import { AnnotationCampaign } from "@/service/campaign";
import { FILES_PAGE_SIZE, useListFilesWithPaginationQuery } from "@/service/campaign/annotation-file-range";
import { IonChip, IonIcon, IonSpinner } from "@ionic/react";
import styles from './Detail.module.scss'
import { checkmarkCircle, chevronForwardOutline, closeCircle, ellipseOutline, playOutline } from "ionicons/icons";
import { Link, useHistory } from "react-router-dom";
import { Button, WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { Pagination } from "@/components/Pagination/Pagination.tsx";
import { ActionBar } from "@/components/ActionBar/ActionBar.tsx";
import { useAppDispatch, useAppSelector } from "@/service/app.ts";
import { resetFileFilters, setFileFilters } from "@/service/ui";

export const DetailPageAnnotationTasks: React.FC<{
  campaign: AnnotationCampaign;
  isOwner: boolean;
}> = ({ campaign, }) => {
  const history = useHistory();
  const [ page, setPage ] = useState<number>(1);

  const fileFilters = useAppSelector(state => state.ui.fileFilters);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (fileFilters.campaignID !== campaign?.id)
      dispatch(resetFileFilters())
  }, []);

  useListFilesWithPaginationQuery({
    campaignID: campaign.id,
    page: 1,
  }, { refetchOnMountOrArgChange: true });
  const { currentData: files, isFetching, error } = useListFilesWithPaginationQuery({
    ...fileFilters,
    campaignID: campaign.id,
    page,
  });
  const maxPage = useMemo(() => {
    if (!files) return 1;
    return Math.ceil(files.count / FILES_PAGE_SIZE)
  }, [ files?.count ])

  const isResumeEnabled = useMemo(() => {
    return fileFilters.withUserAnnotations === undefined && fileFilters.search === undefined && fileFilters.isSubmitted === undefined
  }, [ fileFilters ]);

  function resume() {
    history.push(`/annotation-campaign/${ campaign.id }/file/${ files?.resume }`);
  }

  function toggleNonSubmittedFilter() {
    dispatch(setFileFilters({
      ...fileFilters,
      campaignID: campaign.id,
      isSubmitted: fileFilters.isSubmitted === undefined ? false : undefined,
    }))
    setPage(1)
  }

  function toggleWithAnnotationsFilter() {
    dispatch(setFileFilters({
      ...fileFilters,
      campaignID: campaign.id,
      withUserAnnotations: fileFilters.withUserAnnotations === undefined ? true : undefined,
    }))
    setPage(1)
  }

  function updateSearch(search: string) {
    dispatch(setFileFilters({
      ...fileFilters,
      campaignID: campaign.id,
      search,
    }))
    setPage(1)
  }


  return <Fragment>

    <ActionBar search={ fileFilters.search }
               searchPlaceholder="Search filename"
               onSearchChange={ updateSearch }
               actionButton={ <Button color="primary" fill='outline'
                                      disabled={ !files?.resume || !isResumeEnabled }
                                      disabledExplanation='Cannot resume if filters are activated.'
                                      style={ { pointerEvents: 'unset' } }
                                      onClick={ resume }>
                 Resume annotation
                 <IonIcon icon={ playOutline } slot="end"/>
               </Button> }>

      <IonChip outline={ fileFilters.isSubmitted === undefined }
               onClick={ toggleNonSubmittedFilter }
               color={ fileFilters.isSubmitted === false ? 'primary' : 'medium' }>
        Non submitted
        { fileFilters.isSubmitted === false && <IonIcon icon={ closeCircle } color='primary'/> }
      </IonChip>
      <IonChip outline={ !fileFilters.withUserAnnotations }
               onClick={ toggleWithAnnotationsFilter }
               color={ fileFilters.withUserAnnotations ? 'primary' : 'medium' }>
        With annotations
        { fileFilters.withUserAnnotations && <IonIcon icon={ closeCircle } color='primary'/> }
      </IonChip>
    </ActionBar>

    { isFetching && <IonSpinner/> }
    { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

    { files && files.count === 0 && <p>You have no files to annotate.</p> }

    { files && files.results.length > 0 && <Fragment>
        <Table columns={ 6 } className={ styles.filesTable }>
            <TableHead topSticky isFirstColumn={ true }>Filename</TableHead>
            <TableHead topSticky>Date</TableHead>
            <TableHead topSticky>Duration</TableHead>
            <TableHead topSticky>Annotations</TableHead>
            <TableHead topSticky>Status</TableHead>
            <TableHead topSticky>Access</TableHead>
            <TableDivider/>

          { files.results.map(file => {
            const startDate = new Date(file.start);
            const diffTime = new Date(new Date(file.end).getTime() - startDate.getTime());
            return <Fragment key={ file.id }>
              <TableContent isFirstColumn={ true } disabled={ file.is_submitted }>{ file.filename }</TableContent>
              <TableContent disabled={ file.is_submitted }>{ startDate.toLocaleString() }</TableContent>
              <TableContent disabled={ file.is_submitted }>{ diffTime.toUTCString().split(' ')[4] }</TableContent>
              <TableContent disabled={ file.is_submitted }>{ file.results_count }</TableContent>
              <TableContent disabled={ file.is_submitted }>
                { file.is_submitted &&
                    <IonIcon icon={ checkmarkCircle } className={ styles.statusIcon } color='primary'/> }
                { !file.is_submitted &&
                    <IonIcon icon={ ellipseOutline } className={ styles.statusIcon } color='medium'/> }
              </TableContent>
              <TableContent disabled={ file.is_submitted } className={ styles.accessLink }>
                <Link to={ `/annotation-campaign/${ campaign.id }/file/${ file.id }` }>
                  <IonIcon icon={ chevronForwardOutline } color='primary'/>
                </Link>
              </TableContent>
              <TableDivider/>
            </Fragment>
          }) }
        </Table>

      { files.results.length > 0 &&
          <Pagination currentPage={ page } totalPages={ maxPage } setCurrentPage={ setPage }/> }
    </Fragment> }

  </Fragment>
}