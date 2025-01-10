import React, { Fragment, useMemo, useState } from "react";
import { AnnotationCampaign } from "@/service/campaign";
import { FILES_PAGE_SIZE, useListFilesWithPaginationQuery } from "@/service/campaign/annotation-file-range";
import { IonButton, IonChip, IonIcon, IonSpinner } from "@ionic/react";
import styles from './Detail.module.scss'
import { checkmarkCircle, chevronForwardOutline, closeCircle, ellipseOutline, playOutline } from "ionicons/icons";
import { Link, useHistory } from "react-router-dom";
import { WarningText } from "@/components/ui";
import { getErrorMessage } from "@/service/function.ts";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { Pagination } from "@/components/Pagination/Pagination.tsx";
import { ActionBar } from "@/components/ActionBar/ActionBar.tsx";

export const DetailPageAnnotationTasks: React.FC<{
  campaign: AnnotationCampaign;
  isOwner: boolean;
}> = ({ campaign, }) => {
  const history = useHistory();
  const [ page, setPage ] = useState<number>(1);
  const [ search, setSearch ] = useState<string | undefined>();
  const [ nonSubmittedFilter, setNonSubmittedFilter ] = useState<true | undefined>();
  const [ withAnnotationsFilter, setWithAnnotationsFilter ] = useState<true | undefined>();

  const { data: files, isLoading, error } = useListFilesWithPaginationQuery({
    campaignID: campaign.id,
    page,
    search,
    isSubmitted: nonSubmittedFilter === undefined ? undefined : false,
    withUserAnnotations: withAnnotationsFilter
  }, { refetchOnMountOrArgChange: true });
  const maxPage = useMemo(() => {
    if (!files) return 1;
    return Math.ceil(files.count / FILES_PAGE_SIZE)
  }, [ files?.count ])

  function resume() {
    history.push(`/annotation-campaign/${ campaign.id }/file/${ files?.resume }`);
  }

  function toggleNonSubmittedFilter() {
    if (nonSubmittedFilter)
      setNonSubmittedFilter(undefined)
    else
      setNonSubmittedFilter(true)
    setPage(1)
  }

  function toggleWithAnnotationsFilter() {
    if (withAnnotationsFilter)
      setWithAnnotationsFilter(undefined)
    else
      setWithAnnotationsFilter(true)
    setPage(1)
  }


  return <Fragment>

    <ActionBar search={ search }
               searchPlaceholder="Search filename"
               onSearchChange={ value => {
                 setSearch(value);
                 setPage(1)
               } }
               actionButton={ <IonButton color="primary" fill='outline' disabled={ !files?.resume }
                                         onClick={ resume }>
                 Resume annotation
                 <IonIcon icon={ playOutline } slot="end"/>
               </IonButton> }>
      <IonChip outline={ !nonSubmittedFilter }
               onClick={ toggleNonSubmittedFilter }
               color={ nonSubmittedFilter ? 'primary' : 'medium' }>
        Non submitted
        { nonSubmittedFilter && <IonIcon icon={ closeCircle } color='primary'/> }
      </IonChip>
      <IonChip outline={ !withAnnotationsFilter }
               onClick={ toggleWithAnnotationsFilter }
               color={ withAnnotationsFilter ? 'primary' : 'medium' }>
        With annotations
        { withAnnotationsFilter && <IonIcon icon={ closeCircle } color='primary'/> }
      </IonChip>
    </ActionBar>

    { isLoading && <IonSpinner/> }
    { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

    { files && files.results.length === 0 && <p>You have no files to annotate.</p> }

    { files && files.results.length > 0 && <Fragment>
        <Table columns={ 6 } className={ styles.filesTable }>
            <TableHead isFirstColumn={ true }>Filename</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Annotations</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Access</TableHead>
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
              <TableContent disabled={ file.is_submitted }>
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