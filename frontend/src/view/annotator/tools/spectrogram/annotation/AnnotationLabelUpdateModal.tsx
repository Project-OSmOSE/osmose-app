import React, { Fragment, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { Button, Modal, ModalHeader } from "@/components/ui";
import { IonNote } from "@ionic/react";
import styles from "@/view/annotator/tools/spectrogram/annotation/annotation.module.scss";
import { useAnnotator } from "@/service/annotator/hook.ts";
import { AnnotationResult } from "@/service/campaign/result";
import { AnnotatorSlice } from "@/service/annotator";
import { useAppDispatch } from "@/service/app.ts";

export const AnnotationLabelUpdateModal: React.FC<{
  annotation: AnnotationResult,
  isModalOpen: boolean,
  setIsModalOpen: (value: boolean) => void
}> = ({ annotation, isModalOpen, setIsModalOpen }) => {
  const { campaign, label_set } = useAnnotator();
  const dispatch = useAppDispatch();

  const updateLabel = useCallback((newLabel: string) => {
    if (!campaign) return;
    dispatch(AnnotatorSlice.actions.updateLabel({ label: newLabel, usage: campaign.usage }))
    setIsModalOpen(false)
  }, []);

  const currentLabel = useMemo(() => {
    if (annotation.updated_to.length > 0) return annotation.updated_to[0].label;
    return annotation.label
  }, [annotation])

  if (!isModalOpen) return <Fragment/>
  return createPortal(<Modal onClose={ () => setIsModalOpen(false) }>
    <ModalHeader title="Update annotation label" onClose={ () => setIsModalOpen(false) }/>
    <IonNote>Choose a new label</IonNote>
    <div className={ styles.labelsButtons }>
      { label_set?.labels.map((label, index) => <Button key={ label }
                                                        fill='outline'
                                                        disabled={ label === currentLabel }
                                                        className={ `ion-color-${ index % 10 }` }
                                                        onClick={ () => updateLabel(label) }>
        { label }
      </Button>) }
    </div>
  </Modal>, document.body)
}