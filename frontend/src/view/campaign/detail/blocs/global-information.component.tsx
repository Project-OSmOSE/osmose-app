import React, { Fragment, useEffect } from 'react';
import { IonButton, IonIcon, useIonAlert } from "@ionic/react";
import { archiveOutline, calendarClear, crop, documents, people, pricetag } from "ionicons/icons";
import { useAppSelector } from '@/service/app';
import { selectCurrentCampaign, useArchiveCampaignMutation } from '@/service/campaign';
import { useToast } from '@/services/utils/toast.ts';
import { useRetrieveLabelSetQuery } from '@/service/campaign/label-set';
import { getErrorMessage } from '@/service/function.ts';
import { useRetrieveConfidenceSetQuery } from '@/service/campaign/confidence-set';
import './blocs.css';

interface Props {
  isEditionAllowed: boolean,
  annotatorsStatus: Map<string, { total: number, progress: number }>,
}

export const DetailCampaignGlobalInformation: React.FC<Props> = ({
                                                                   isEditionAllowed,
                                                                   annotatorsStatus,
                                                                 }) => {
  // State
  const campaign = useAppSelector(selectCurrentCampaign);

  // Service
  const [ presentAlert ] = useIonAlert();
  const { presentError, dismiss: dismissToast } = useToast();
  const { data: labelSet, error: labelSetError } = useRetrieveLabelSetQuery(campaign!.label_set)
  const {
    data: confidenceSet,
    error: confidenceSetError
  } = useRetrieveConfidenceSetQuery(campaign!.confidence_indicator_set ?? -1, {
    skip: !campaign?.confidence_indicator_set
  })
  const [ archiveCampaign ] = useArchiveCampaignMutation()

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, [])

  useEffect(() => {
    if (labelSetError) presentError(getErrorMessage(labelSetError));
  }, [ labelSetError ]);

  useEffect(() => {
    if (confidenceSetError) presentError(getErrorMessage(confidenceSetError));
  }, [ confidenceSetError ]);

  const archive = async () => {
    if (!campaign) return;
    if ([ ...annotatorsStatus.values() ].filter(s => s.progress < s.total).length > 0) {
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
            handler: () => archiveCampaign(campaign.id)
          }
        ]
      });
    } else archiveCampaign(campaign.id)
  }

  return (
    <div id="campaign-detail-global-info" className="bloc">
      <h5>Global information</h5>

      <div className="item">
        <IonIcon className="icon" icon={ pricetag }/>
        <p className="label">Label set:</p>
        <p>{ labelSet?.name }</p>
      </div>

      <div className="item">
        { confidenceSet && <Fragment>
            <i className="icon fa fa-handshake"></i>
            <p className="label">Confidence indicator set:</p>
            <p>{ confidenceSet?.name }</p>
        </Fragment> }
      </div>

      { campaign?.labels_with_acoustic_features && campaign.labels_with_acoustic_features.length > 0 && <Fragment>
          <div className="item double-line">
              <IonIcon className="icon" icon={ pricetag }/>
              <p className="label">Acoustic features on labels:</p>
              <p>{ campaign.labels_with_acoustic_features.join(', ') }</p>
          </div>
          <div className="item"></div>
      </Fragment> }

      <div className="item">
        <IonIcon className="icon" icon={ documents }/>
        <p className="label">Dataset:</p>
        <p>{ campaign?.datasets.join(', ') }</p>
      </div>
      <div className="item"></div>

      <div className="item">
        <IonIcon className="icon" icon={ crop }/>
        <p className="label">Mode:</p>
        <p>{ campaign?.usage }</p>
      </div>

      <div className="item">
        <IonIcon className="icon" icon={ people }/>
        <p className="label">Annotators:</p>
        <p>{ [ ...new Set(annotatorsStatus.keys()) ].length }</p>
      </div>

      <div className="item">
        { campaign?.deadline && <Fragment>
            <IonIcon className="icon" icon={ calendarClear }/>
            <p className="label">Deadline:</p>
            <p>{ new Date(campaign?.deadline).toLocaleDateString() }</p>
        </Fragment> }
      </div>

      { campaign?.desc && <div className="faded">
          <p className="label">Description:</p>
          <p>{ campaign?.desc }</p>
      </div> }

      { isEditionAllowed && <div className="buttons">
          <IonButton color={ "medium" }
                     onClick={ archive }>
              <IonIcon icon={ archiveOutline }/>
              Archive
          </IonButton>
      </div> }
    </div>
  )
}
