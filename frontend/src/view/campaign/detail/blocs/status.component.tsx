import React, { Dispatch, Fragment, useEffect, useMemo, useState } from 'react';
import { IonButton, IonIcon, IonProgressBar } from "@ionic/react";
import {
  AnnotationCampaignRetrieveCampaign,
  useAnnotationCampaignAPI,
  useUsersAPI
} from "@/services/api";
import { caretDown, caretUp, downloadOutline } from "ionicons/icons";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import { getDisplayName } from "@/types/user.ts";
import { useAnnotationFileRangeAPI } from "@/services/api/annotation-file-range-api.service.tsx";
import './blocs.css';

interface Props {
  campaign: AnnotationCampaignRetrieveCampaign;
  setError: Dispatch<any>;
}

interface Sort {
  entry: 'Annotator' | 'Progress';
  sort: 'ASC' | 'DESC';
}

export const DetailCampaignStatus: React.FC<Props> = ({ campaign, setError }) => {

  // State
  const [ annotators, setAnnotators ] = useState<Map<string, { total: number, progress: number }>>(new Map());

  // Services
  const campaignService = useAnnotationCampaignAPI();
  const fileRangeService = useAnnotationFileRangeAPI();
  const userService = useUsersAPI();

  const [ sort, setSort ] = useState<Sort | undefined>({ entry: 'Progress', sort: 'DESC' });
  const status: Array<string> = useMemo(() => {
    if (!sort) return [ ...annotators.keys() ];
    return [ ...annotators.entries() ].sort((a, b) => {
      let comparison = 0;
      switch (sort.entry) {
        case "Annotator":
          comparison = a[0].localeCompare(b[0]);
          break;
        case "Progress":
          comparison = a[1].progress - b[1].progress;
      }
      if (sort.sort === 'ASC') return comparison;
      return -comparison;
    }).map(e => e[0]);
  }, [ sort, annotators ]);

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      fileRangeService.listForCampaign(campaign.id),
      userService.list()
    ]).then(([ranges, users]) => {
      const map = new Map<string, { total: number, progress: number }>()
      for (const range of ranges) {
        const annotator = getDisplayName(users.find(u => u.id === range.annotator));
        if (map.get(annotator)) {
          map.get(annotator)!.total += range.last_file_index - range.first_file_index + 1;
          map.get(annotator)!.progress += range.finished_tasks_count;
        } else {
          map.set(annotator, {
            total: range.last_file_index - range.first_file_index + 1,
            progress: range.finished_tasks_count,
          })
        }
      }
      setAnnotators(map)
    }).catch(e => !isCancelled && setError(e));

    return () => {
      isCancelled = true;
      fileRangeService.abort();
      userService.abort();
    }
  }, [ campaign.id ]);

  const toggleAnnotatorSort = () => {
    if (!sort || sort.entry !== 'Annotator') {
      setSort({ entry: 'Annotator', sort: 'ASC' })
    } else if (sort.sort === 'ASC') {
      setSort({ entry: 'Annotator', sort: 'DESC' })
    } else {
      setSort(undefined)
    }
  }

  const toggleProgressSort = () => {
    if (!sort || sort.entry !== 'Progress') {
      setSort({ entry: 'Progress', sort: 'DESC' })
    } else if (sort.sort === 'DESC') {
      setSort({ entry: 'Progress', sort: 'ASC' })
    } else {
      setSort(undefined)
    }
  }

  return (
    <div id="campaign-detail-status" className="bloc">
      <div className="head-bloc">
        <h5>Status</h5>

        <div className="buttons">
          <IonButton color="primary"
                     onClick={ () => campaignService.downloadResults(campaign) }>
            <IonIcon icon={ downloadOutline } slot="start"/>
            Results (csv)
          </IonButton>
          <IonButton color="primary"
                     onClick={ () => campaignService.downloadStatus(campaign) }>
            <IonIcon icon={ downloadOutline } slot="start"/>
            Task status (csv)
          </IonButton>
        </div>
      </div>

      <Table columns={ 2 }>
        <TableHead isFirstColumn={ true } onClick={ toggleAnnotatorSort }>
          <p>Annotator</p>
          <IonIcon className={ `up ${ sort?.entry === 'Annotator' && sort.sort === 'ASC' ? 'active' : '' }` }
                   icon={ caretUp }/>
          <IonIcon className={ `down ${ sort?.entry === 'Annotator' && sort.sort === 'DESC' ? 'active' : '' }` }
                   icon={ caretDown }/>
        </TableHead>
        <TableHead onClick={ toggleProgressSort }>
          <p>Progress</p>
          <IonIcon className={ `up ${ sort?.entry === 'Progress' && sort.sort === 'ASC' ? 'active' : '' }` }
                   icon={ caretUp }/>
          <IonIcon className={ `down ${ sort?.entry === 'Progress' && sort.sort === 'DESC' ? 'active' : '' }` }
                   icon={ caretDown }/>
        </TableHead>
        { status.map(annotator => {
          const data = annotators.get(annotator)!
          return (
            <Fragment key={ annotator }>
              <TableDivider/>
              <TableContent
                isFirstColumn={ true }>{ annotator }</TableContent>
              <TableContent>
                <p>{ data.progress } / { data.total }</p>
                <IonProgressBar color="medium" value={ data.progress / data.total }/>
              </TableContent>
            </Fragment>
          );
        }) }
      </Table>
    </div>
  )
}
