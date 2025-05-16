import React, { Fragment, useEffect, useState } from "react";
import { useToast } from "@/service/ui";
import { getErrorMessage } from "@/service/function.ts";
import { Modal, ModalFooter, ModalHeader, WarningText } from "@/components/ui";
import { IonButton, IonSpinner } from "@ionic/react";
import styles from './styles.module.scss';
import { LabelSetDisplay } from "@/components/AnnotationCampaign";
import { useModal } from "@/service/ui/modal.ts";
import { createPortal } from "react-dom";
import { CampaignAPI, useRetrieveCurrentCampaign } from "@/service/api/campaign.ts";
import { useGetLabelSetForCurrentCampaign } from "@/service/api/label-set.ts";


export const LabelSetModalButton: React.FC = () => {
  const modal = useModal()
  return <Fragment>
    <IonButton fill='outline' color='medium' className='ion-text-wrap' onClick={ modal.toggle }>
      Update labels with features
    </IonButton>
    { modal.isOpen && createPortal(<LabelSetModal onClose={ modal.toggle }/>, document.body) }
  </Fragment>
}

export const LabelSetModal: React.FC<{
  onClose?(): void;
}> = ({ onClose }) => {
  const { campaign, hasAdminAccess } = useRetrieveCurrentCampaign()
  const { labelSet, isFetching, error } = useGetLabelSetForCurrentCampaign();
  const toast = useToast();
  const [ patchCampaign, {
    isLoading: isSubmitting,
    error: patchError,
    isSuccess: isPatchSuccessful
  } ] = CampaignAPI.endpoints.patchCampaign.useMutation();

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
    if (!campaign) return;
    try {
      await patchCampaign({
        id: campaign.id,
        labels_with_acoustic_features: labelsWithAcousticFeatures,
      }).unwrap();
    } finally {
      toggleDisabled()
    }
  }

  function toggleDisabled() {
    setDisabled(!disabled);
  }

  return (
    <Modal onClose={ onClose } className={ [ styles.modal ].join(' ') }>
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
