import React, { Fragment } from 'react';
import { IonButton, IonIcon, IonProgressBar } from "@ionic/react";
import { AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI } from "@/services/api";
import { AnnotationStatus } from "@/types/campaign.ts";
import { downloadOutline } from "ionicons/icons";
import { Table, TableContent, TableDivider, TableHead } from "@/components/table/table.tsx";
import './blocs.css';

interface Props {
  campaign: AnnotationCampaignRetrieveCampaign;
  annotationStatus: Array<AnnotationStatus>;
}

export const DetailCampaignStatus: React.FC<Props> = ({
                                                        campaign,
                                                        annotationStatus
                                                      }) => {
  const campaignService = useAnnotationCampaignAPI();

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
        <TableHead isFirstColumn={ true }>Annotator</TableHead>
        <TableHead>Progress</TableHead>
        { annotationStatus.map(status => {
          return (
            <Fragment key={ status.annotator?.id }>
              <TableDivider/>
              <TableContent isFirstColumn={ true }>{ status.annotator?.display_name }</TableContent>
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
