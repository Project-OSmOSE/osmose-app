import React, { useEffect, useMemo, useState } from "react";
import { InputChangeEventDetail, IonInput, IonLabel, IonNote } from "@ionic/react";
import { createCampaignActions } from "@/slices/create-campaign";
import { useUsersAPI } from '@/services/api/user.ts';
import { FormBloc, Searchbar, ChipsInput } from "@/components/form";
import { Item } from "@/types/item";
import { User } from '@/types/user';
import { useAppSelector, useAppDispatch } from "@/slices/app";
import { useToast } from "@/services/utils/toast.ts";


export const AnnotatorsBloc: React.FC = () => {

  // API Data
  const [users, setUsers] = useState<Array<User>>([]);
  const usersAPI = useUsersAPI();

  // Services
  const toast = useToast();

  // Form data
  const dispatch = useAppDispatch();
  const {
    annotators,
    annotatorsPerFile,
    dataset
  } = useAppSelector(state => state.createCampaignForm.global);


  useEffect(() => {
    let isCancelled = false;
    usersAPI.list().then(setUsers).catch(e => !isCancelled && toast.presentError(e));

    return () => {
      isCancelled = true;
      usersAPI.abort();
    }
  }, [])

  const onAddAnnotator = (item: Item) => {
    const annotator = users.find(a => a.id === item.value);
    if (!annotator) return;
    dispatch(createCampaignActions.updateAnnotators([...annotators, annotator]))
    dispatch(createCampaignActions.updateAnnotatorsPerFile(annotators.length + 1))
  }

  const onAnnotatorsChange = (array: Array<string | number>) => {
    const newAnnotators = annotators.filter(a => array.includes(a.id))
    dispatch(createCampaignActions.updateAnnotators(newAnnotators));
    dispatch(createCampaignActions.updateAnnotatorsPerFile(newAnnotators.length))
  }

  const onAnnotatorsPerFileChange = (e: CustomEvent<InputChangeEventDetail>) => {
    dispatch(createCampaignActions.updateAnnotatorsPerFile(e.detail.value ? +e.detail.value : undefined))
  }

  // Calculated data
  const annotatedFilesCount = useMemo(() => {
    if (!dataset?.files_count || !annotators.length) return 0;
    return Math.round(dataset.files_count * annotatorsPerFile / annotators.length);
  }, [dataset?.files_count, annotatorsPerFile, annotators.length])
  const annotatedFilesPercent = useMemo(() => {
    if (!dataset?.files_count || !annotatedFilesCount) return 0;
    return Math.round(annotatedFilesCount / dataset?.files_count * 100);
  }, [dataset?.files_count, annotatedFilesCount])

  return (
    <FormBloc label="Annotators">

      <Searchbar placeholder="Search annotator..."
                 values={
                   users.filter(u => !annotators.find(annotator => annotator.id === u.id))
                     .map(a => ({ value: a.id, label: a.display_name }))
                 }
                 onValueSelected={ onAddAnnotator }/>

      <ChipsInput items={ annotators.map(a => ({ value: a.id, label: a.display_name })) }
                  required={ true }
                  activeItemsValues={ annotators.map(a => a.id) }
                  setActiveItemsValues={ onAnnotatorsChange }/>


      <div aria-disabled={ annotators.length <= 0 }>
        <div className="inline">
          <IonLabel>Wanted number of annotators per file</IonLabel>
          <IonInput type="number"
                    maxlength={ 3 }
                    max={ annotators.length ?? 0 }
                    min={ annotators.length > 0 ? 1 : 0 }
                    value={ annotatorsPerFile }
                    onIonChange={ onAnnotatorsPerFileChange }/>
        </div>
        <IonNote>
          Each annotator will annotate { annotatedFilesCount } / { dataset?.files_count ?? 0 } files
          ({ annotatedFilesPercent }%)
        </IonNote>
      </div>
    </FormBloc>
  )
}
