import React, { Fragment, useCallback } from "react";
import { CampaignAPI } from "@/service/campaign";
import { CampaignPhaseAPI } from "@/service/campaign/phase";
import { useModal } from "@/service/ui/modal.ts";
import { useAppDispatch } from "@/service/app.ts";
import { useNavigate } from "react-router-dom";
import { Button, Modal, ModalHeader, WarningText } from "@/components/ui";
import { IonIcon, IonSpinner } from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { createPortal } from "react-dom";
import styles from "@/view/campaign/styles.module.scss";
import { getErrorMessage } from "@/service/function.ts";

export const CreateVerificationButton: React.FC = () => {
  const { data: campaign, isFetching: isFetchingCampaign, refetch } = CampaignAPI.useRetrieveQuery()
  const [ post, { isLoading: isPostingPhase, error } ] = CampaignPhaseAPI.useCreateMutation()
  const modal = useModal();
  const dispatch = useAppDispatch();
  const navigate = useNavigate()

  const create = useCallback(async () => {
    if (!campaign) return;
    const phase = await post({ campaign, phase: 'Verification' }).unwrap()
    await refetch().unwrap()
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ phase.id }`)
  }, [ campaign ])

  const createAndImport = useCallback(async () => {
    if (!campaign) return;
    const phase = await post({ campaign, phase: 'Verification' }).unwrap()
    dispatch(CampaignAPI.util?.invalidateTags([ { type: 'AnnotationCampaign', id: campaign.id } ]));
    navigate(`/annotation-campaign/${ campaign?.id }/phase/${ phase.id }/import-annotations`)
  }, [ campaign ])

  return <Fragment>
    <Button fill='clear' color='medium' onClick={ modal.toggle }>
      Verification
      <IonIcon icon={ addOutline } slot="end"/>
    </Button>

    { modal.isOpen && createPortal(<Modal onClose={ modal.close }>
      <ModalHeader title='New verification phase' onClose={ modal.close }/>
      <p>In a "Verification" phase, you can validate, invalidate, or add missing annotations.</p>
      <p>The annotations you can see come from:</p>
      <ul>
        <li>The "Annotation" phase</li>
        <li>Imported annotations, for exemple the output of an automatic detector</li>
      </ul>
      <p>Do you really want to create a "Verification" phase?</p>

      { error && <WarningText>{ getErrorMessage(error) }</WarningText> }

      <div className={ styles.modalButtons }>
        <Button color="medium" fill='clear' onClick={ modal.close }>
          Cancel
        </Button>

        <div className={ styles.modalButtons }>
          { (isPostingPhase || isFetchingCampaign) && <IonSpinner/> }
          <Button color="primary" fill='clear' onClick={ createAndImport }>
            Create and import annotations
          </Button>
          <Button color="primary" fill='solid' onClick={ create }>
            Create
          </Button>
        </div>
      </div>
    </Modal>, document.body) }
  </Fragment>
}
