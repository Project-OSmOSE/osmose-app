import React, { Fragment, useMemo, useState } from 'react';
import { IonButton, IonIcon, IonProgressBar } from "@ionic/react";
import { caretDown, caretUp, downloadOutline } from "ionicons/icons";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import './blocs.css';
import { useHistory } from "react-router-dom";
import { useAppSelector } from '@/slices/app.ts';
import { selectCurrentCampaign } from '@/service/campaign/function.ts';
import { useDownloadCampaignReportMutation, useDownloadCampaignStatusMutation } from '@/service/campaign';

interface Props {
  isOwner: boolean;
  isEditionAllowed: boolean,
  annotatorsStatus: Map<string, { total: number, progress: number }>;
}

interface Sort {
  entry: 'Annotator' | 'Progress';
  sort: 'ASC' | 'DESC';
}

export const DetailCampaignStatus: React.FC<Props> = ({ isEditionAllowed, annotatorsStatus, isOwner }) => {

  // Services
  const history = useHistory();
  const [ downloadStatus ] = useDownloadCampaignStatusMutation()
  const [ downloadReport ] = useDownloadCampaignReportMutation()

  // State
  const campaign = useAppSelector(selectCurrentCampaign);


  const [ sort, setSort ] = useState<Sort | undefined>({ entry: 'Progress', sort: 'DESC' });
  const status: Array<string> = useMemo(() => {
    if (!sort) return [ ...annotatorsStatus.keys() ];
    return [ ...annotatorsStatus.entries() ].sort((a, b) => {
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
  }, [ sort, annotatorsStatus ]);

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

  const openEditCampaign = () => {
    if (!campaign) return;
    history.push(`/annotation-campaign/${ campaign?.id }/edit`)
  }

  return (
    <div id="campaign-detail-status" className="bloc">
      <div className="head-bloc">
        <h5>Status</h5>
        <div className="buttons">

          { isOwner && campaign && annotatorsStatus.size > 0 && <Fragment>
              <IonButton color="primary" fill="outline"
                         onClick={ () => downloadReport(campaign) }>
                  <IonIcon icon={ downloadOutline } slot="start"/>
                  Results (csv)
              </IonButton>
              <IonButton color="primary" fill="outline"
                         onClick={ () => downloadStatus(campaign) }>
                  <IonIcon icon={ downloadOutline } slot="start"/>
                  Task status (csv)
              </IonButton>
          </Fragment> }
          { annotatorsStatus.size == 0 && 'No annotators' }
          { isEditionAllowed && <IonButton color={ "primary" }
                                           onClick={ openEditCampaign }>
              Manage annotators
          </IonButton> }
        </div>
      </div>


      { annotatorsStatus.size > 0 &&
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
              const data = annotatorsStatus.get(annotator)!
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
          </Table> }
    </div>
  )
}
