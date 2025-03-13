import React, { useEffect, useState } from "react";
import { CampaignAPI, useHasAdminAccessToCampaign } from "@/service/campaign";
import { useToast } from "@/service/ui";
import { getErrorMessage } from "@/service/function.ts";
import { Modal, ModalFooter, ModalHeader, WarningText } from "@/components/ui";
import { IonButton, IonSpinner } from "@ionic/react";
import styles from './modal.module.scss';
import { LabelSetAPI } from "@/service/campaign/label-set";
import { LabelSetDisplay } from "@/components/campaign/label/LabelSet.tsx";
import { useParams } from "react-router-dom";

export const LabelSetModal: React.FC<{
  onClose?(): void;
}> = ({ onClose }) => {
  const { id: campaignID } = useParams<{ id: string }>();
  const { data: campaign, refetch: refetchCampaign } = CampaignAPI.useRetrieveQuery(campaignID);
  const {
    data: labelSet,
    isFetching, error
  } = LabelSetAPI.useRetrieveQuery(campaign!.label_set, { skip: !campaign });
  const toast = useToast();
  const [ patchCampaign, {
    isLoading: isSubmitting,
    error: patchError,
    isSuccess: isPatchSuccessful
  } ] = CampaignAPI.usePatchMutation();
  const { hasAdminAccess } = useHasAdminAccessToCampaign(campaign)

  const [ labelsWithAcousticFeatures, setLabelsWithAcousticFeatures ] = useState<string[]>(campaign?.labels_with_acoustic_features ?? []);
  const [ disabled, setDisabled ] = useState<boolean>(true);

  useEffect(() => {
    setLabelsWithAcousticFeatures(campaign?.labels_with_acoustic_features ?? []);
  }, [ campaign?.labels_with_acoustic_features ]);

  useEffect(() => {
    if (patchError) toast.presentError(getErrorMessage(patchError));
  }, [ patchError ]);
  useEffect(() => {
    if (isPatchSuccessful) toast.presentSuccess(`Labels successfully updated`);
  }, [ isPatchSuccessful ]);

  async function onSave() {
    try {
      await patchCampaign({
        id: campaignID,
        labels_with_acoustic_features: labelsWithAcousticFeatures,
      }).unwrap();
      await refetchCampaign().unwrap();
    } finally {
      toggleDisabled()
    }
  }

  function toggleDisabled() {
    setDisabled(!disabled);
  }

  return (
    <Modal onClose={ onClose } className={ [styles.modal, styles.label].join(' ') }>
      <ModalHeader onClose={ onClose } title='Label set'/>

      { isFetching && <IonSpinner/> }

      { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

      { labelSet && <LabelSetDisplay set={ labelSet } disabled={ disabled }
                                     labelsWithAcousticFeatures={ labelsWithAcousticFeatures }
                                     setLabelsWithAcousticFeatures={ setLabelsWithAcousticFeatures }/> }
      <ModalFooter>
        { hasAdminAccess && !campaign?.archive && (
          <IonButton fill='outline'
                     onClick={ toggleDisabled }
                     disabled={ isSubmitting || !disabled }>
            Update labels with features
          </IonButton>
        ) }
        { hasAdminAccess && !disabled && (
          <IonButton fill='outline'
                     disabled={ isSubmitting }
                     onClick={ onSave }>
            Save
            { isSubmitting && <IonSpinner slot='end'/> }
          </IonButton>
        ) }
      </ModalFooter>
    </Modal>
  )
}
