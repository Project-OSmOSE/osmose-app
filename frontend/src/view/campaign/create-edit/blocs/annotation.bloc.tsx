import React, { useEffect } from "react";
import { FormBloc, Select } from "@/components/form";
import { LabelSetSelect } from "@/view/campaign/create-edit/blocs/input/label-set.select.tsx";
import { ConfidenceSetSelect } from "@/view/campaign/create-edit/blocs/input/confidence-set.select.tsx";
import { CheckAnnotationsInputs } from "@/view/campaign/create-edit/blocs/input/check-annotations.tsx";
import { useAppDispatch, useAppSelector } from '@/service/app';
import {
  selectCampaignSubmissionErrors,
  selectCurrentCampaign,
  selectDraftCampaign,
  updateCampaignSubmissionErrors,
  updateDraftCampaign,
} from '@/service/campaign';
import { DatasetAPI } from '@/service/dataset';
import { IonCheckbox } from "@ionic/react";
import styles from './bloc.module.scss'

export const AnnotationBloc: React.FC<{
  onFileImported: (file: File) => void,
  onFileRemoved: () => void,
}> = ({ onFileImported, onFileRemoved }) => {
  // Services
  const dispatch = useAppDispatch();
  const { data: allDatasets } = DatasetAPI.useListQuery({});

  // State
  const draftCampaign = useAppSelector(selectDraftCampaign)
  const createdCampaign = useAppSelector(selectCurrentCampaign)
  const errors = useAppSelector(selectCampaignSubmissionErrors)

  // Loading
  useEffect(() => {
    if (allDatasets && allDatasets.length === 0)
      dispatch(updateCampaignSubmissionErrors({ datasets: "You should first import a dataset." }));
  }, [ allDatasets ]);

  function togglePointAnnotation() {
    dispatch(updateDraftCampaign({ allow_point_annotation: !draftCampaign.allow_point_annotation }))
  }

  return <FormBloc label="Annotation">
    <Select required={ true }
            error={ errors.usage }
            label="Annotation mode" placeholder="Select an annotation mode"
            options={ [
              { value: 'Create', label: 'Create annotations' },
              { value: 'Check', label: 'Check annotations' },
            ] }
            optionsContainer="popover"
            value={ draftCampaign.usage }
            disabled={ !!createdCampaign }
            onValueSelected={ value => dispatch(updateDraftCampaign({ usage: value as 'Create' | 'Check' | undefined })) }/>

    { draftCampaign.usage === 'Create' &&
        <LabelSetSelect/> }

    { draftCampaign.usage === 'Create' &&
        <ConfidenceSetSelect/> }

    { draftCampaign.usage === 'Create' &&
        <div className={styles.checkbox} onClick={ togglePointAnnotation }>
            <IonCheckbox checked={ draftCampaign.allow_point_annotation }
                         disabled={ !!createdCampaign }/>
            <span>Allow annotations of type "Point"</span>
        </div> }

    { draftCampaign.usage === 'Check' &&
        <CheckAnnotationsInputs onFileImported={ onFileImported }
                                onFileRemoved={ onFileRemoved }/> }
  </FormBloc>
}
