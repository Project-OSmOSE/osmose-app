import React, { KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { Link, useHistory, useParams } from 'react-router-dom';
import { ANNOTATOR_GUIDE_URL } from "@/consts/links.ts";
import { IonButton, IonIcon, IonSearchbar, IonSpinner } from "@ionic/react";
import { checkmarkOutline, helpBuoyOutline, informationCircle, playOutline } from "ionicons/icons";
import { useRetrieveCampaignQuery } from '@/service/campaign';
import { FILES_PAGE_SIZE, useListFilesWithPaginationQuery } from '@/service/campaign/annotation-file-range';
import styles from './campaign-task-list.module.scss';
import { Pagination } from '@/components/Pagination/Pagination.tsx';
import { useToast } from '@/services/utils/toast.ts';
import { getErrorMessage } from '@/service/function.ts';

export const AnnotationTaskList: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>();
  const [ page, setPage ] = useState<number>(1);
  const [ search, setSearch ] = useState<string | undefined>();

  // Services
  const history = useHistory();
  const toast = useToast();
  const { data: campaign } = useRetrieveCampaignQuery(campaignID);
  const { data: files, error } = useListFilesWithPaginationQuery({
    campaignID,
    page,
    search
  }, { refetchOnMountOrArgChange: true });
  const maxPage = useMemo(() => {
    if (!files) return 1;
    return Math.ceil(files.count / FILES_PAGE_SIZE)
  }, [ files?.count ])

  useEffect(() => {
    document.body.scrollTo({ top: 0, behavior: 'instant' })
  }, [ campaignID ]);

  useEffect(() => {
    if (error) toast.presentError(getErrorMessage(error))
  }, [ error ]);

  const openGuide = () => {
    window.open(ANNOTATOR_GUIDE_URL, "_blank", "noopener, noreferrer")
  }

  const openInstructions = () => {
    if (!campaign?.instructions_url) return;
    window.open(campaign.instructions_url, "_blank", "noopener, noreferrer")
  }

  const manage = () => history.push(`/annotation-campaign/${ campaignID }`);

  const resume = () => history.push(`/annotation-campaign/${ campaignID }/file/${ files?.resume }`);

  function doSearch(event: KeyboardEvent<HTMLIonSearchbarElement>) {
    if (event.key === 'Enter') setSearch(event.currentTarget.value ?? undefined)
  }

  return (
    <div className={ styles.page }>

      <div className={ styles.head }>
        <h2>{ campaign?.name }</h2>
        <p className={ styles.subtitle }>Annotation files</p>
      </div>

      <div className="d-flex justify-content-center gap-1 flex-wrap">
        <IonSearchbar placeholder="Search file"
                      className={ styles.search }
                      onKeyDown={ doSearch }
                      value={ search }/>
        <IonButton fill="outline" shape="round" onClick={ manage }>
          { campaign?.archive === null ? "Manage" : "Info" }
        </IonButton>
        <IonButton color="warning" shape="round" fill="outline" onClick={ openGuide }>
          User guide
          <IonIcon icon={ helpBuoyOutline } slot="end"/>
        </IonButton>
        { campaign?.instructions_url &&
            <IonButton color="secondary" shape="round" fill="outline" onClick={ openInstructions }>
                <IonIcon icon={ informationCircle } slot="start"/>
                Campaign instructions
            </IonButton> }
        { files?.resume && <IonButton color="primary" shape="round" onClick={ resume }>
            Resume annotation
            <IonIcon icon={ playOutline } slot="end"/>
        </IonButton> }
      </div>

      { !files && <IonSpinner/> }
      { (!files?.results || files.results.length === 0) && "No files to annotate" }
      { files?.results && files.results.length > 0 && <table className="table table-bordered">
          <thead>
          <tr>
              <th>Filename</th>
              <th>Dataset</th>
              <th>Date</th>
              <th>Duration</th>
              <th>Results</th>
              <th>Submitted</th>
              <th>Link</th>
          </tr>
          </thead>
          <tbody>
          { files.results.map((file) => {
            const startDate = new Date(file.start);
            const diffTime = new Date(new Date(file.end).getTime() - startDate.getTime());
            return <tr className={ file.is_submitted ? 'table-success' : '' }
                       key={ file.id }>
              <td>{ file.filename }</td>
              <td>{ file.dataset_name }</td>
              <td>{ startDate.toLocaleString() }</td>
              <td>{ diffTime.toUTCString().split(' ')[4] }</td>
              <td>{ file.results_count }</td>
              <td>
                { file.is_submitted && <IonIcon icon={ checkmarkOutline }/> }
              </td>
              <td><Link to={ `/annotation-campaign/${ campaignID }/file/${ file.id }` }>Task link</Link></td>
            </tr>
          }) }
          </tbody>
      </table> }

      <Pagination currentPage={ page } totalPages={ maxPage } setCurrentPage={ setPage }/>
    </div>
  )
}
