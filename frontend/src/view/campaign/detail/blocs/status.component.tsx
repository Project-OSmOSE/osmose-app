import React, { Fragment, useMemo, useState } from 'react';
import { IonButton, IonIcon, IonProgressBar } from "@ionic/react";
import { AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI } from "@/services/api";
import { AnnotationStatus } from "@/types/campaign.ts";
import { caretDown, caretUp, downloadOutline } from "ionicons/icons";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import './blocs.css';
import { getDisplayName } from "@/types/user.ts";

interface Props {
  campaign: AnnotationCampaignRetrieveCampaign;
  annotationStatus: Array<AnnotationStatus>;
}

interface Sort {
  entry: 'Annotator' | 'Progress';
  sort: 'ASC' | 'DESC';
}

export const DetailCampaignStatus: React.FC<Props> = ({
                                                        campaign,
                                                        annotationStatus
                                                      }) => {
  const campaignService = useAnnotationCampaignAPI();
  const [sort, setSort] = useState<Sort | undefined>({ entry: 'Progress', sort: 'DESC' });
  const status = useMemo(() => {
    if (!sort) return annotationStatus;
    return annotationStatus.sort((a, b) => {
      let comparison = 0;
      switch (sort.entry) {
        case "Annotator":
          comparison = getDisplayName(a.annotator).localeCompare(getDisplayName(b.annotator));
          break;
        case "Progress":
          comparison = a.finished - b.finished;
      }
      if (sort.sort === 'ASC') return comparison;
      return -comparison;
    });
  }, [sort, annotationStatus]);

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
        { status.map(status => {
          return (
            <Fragment key={ status.annotator?.id }>
              <TableDivider/>
              <TableContent
                isFirstColumn={ true }>{ `${ getDisplayName(status.annotator) } (${ status.annotator.expertise_level })` }</TableContent>
              <TableContent>
                <p>{ status.finished } / { status.total }</p>
                <IonProgressBar color="medium" value={ status.finished / status.total }/>
              </TableContent>
            </Fragment>
          );
        }) }
      </Table>
    </div>
  )
}
