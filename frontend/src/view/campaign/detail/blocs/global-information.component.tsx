import React, { Fragment } from 'react';
import { useHistory } from 'react-router-dom';
import { IonButton, IonIcon, useIonAlert } from "@ionic/react";
import { archiveOutline, calendarClear, crop, documents, people, pricetag } from "ionicons/icons";
import './blocs.css';
import { AnnotationCampaignRetrieveCampaign, useAnnotationCampaignAPI } from "@/services/api";
import { AnnotationStatus } from "@/types/campaign.ts";

interface Props {
  campaign: AnnotationCampaignRetrieveCampaign,
  isEditionAllowed: boolean,
  annotationStatus: Array<AnnotationStatus>,
  reload: () => void
}

export const DetailCampaignGlobalInformation: React.FC<Props> = ({
                                                                   campaign,
                                                                   isEditionAllowed,
                                                                   annotationStatus,
                                                                   reload,
                                                                 }) => {
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const campaignService = useAnnotationCampaignAPI();

  const archive = async () => {
    if (!campaign) return;
    if (annotationStatus.filter(s => s.finished < s.total).length > 0) {
      // If annotators haven't finished yet, ask for confirmation
      return await presentAlert({
        header: 'Archive',
        message: 'There is still unfinished annotations.\nAre you sure you want to archive this campaign?',
        cssClass: 'danger-confirm-alert',
        buttons: [
          'Cancel',
          {
            text: 'Archive',
            cssClass: 'ion-color-danger',
            handler: async () => {
              await campaignService.archive(campaign.id);
              reload()
            }
          }
        ]
      });
    } else {
      await campaignService.archive(campaign.id);
      reload()
    }
  }

  const openEditCampaign = () => {
    if (!campaign) return;
    history.push(`/annotation_campaign/${ campaign?.id }/edit`)
  }

  return (
    <div id="campaign-detail-global-info" className="bloc">
      <h5>Global information</h5>

      <div className="item">
        <IonIcon className="icon" icon={ pricetag }/>
        <p className="label">Label set:</p>
        <p>{ campaign.label_set.name }</p>
      </div>

      <div className="item">
        { campaign.confidence_indicator_set && <Fragment>
            <i className="icon fa fa-handshake"></i>
            <p className="label">Confidence indicator set:</p>
            <p>{ campaign.confidence_indicator_set.name }</p>
        </Fragment> }
      </div>

      <div className="item">
        <IonIcon className="icon" icon={ documents }/>
        <p className="label">Dataset:</p>
        <p>{ campaign.datasets_name.join(', ') }</p>
      </div>

      <div className="item">
        <IonIcon className="icon" icon={ people }/>
        <p className="label">Annotators:</p>
        <p>{ [...new Set(annotationStatus.map(s => s.annotator))].length }</p>
      </div>

      <div className="item">
        <IonIcon className="icon" icon={ crop }/>
        <p className="label">Mode:</p>
        <p>{ campaign.usage }</p>
      </div>

      <div className="item">
        { campaign.deadline && <Fragment>
            <IonIcon className="icon" icon={ calendarClear }/>
            <p className="label">Deadline:</p>
            <p>{ campaign.deadline.toLocaleDateString() }</p>
        </Fragment> }
      </div>

      { campaign.desc && <div className="description">
          <p className="label">Description:</p>
          <p>{ campaign.desc }</p>
      </div> }

      { isEditionAllowed && <div className="buttons">
          <IonButton color={ "medium" }
                     onClick={ archive }>
              <IonIcon icon={ archiveOutline }/>
              Archive
          </IonButton>
          <IonButton color={ "primary" }
                     onClick={ openEditCampaign }>
              Add annotators
          </IonButton>
      </div> }
    </div>
  )
}
