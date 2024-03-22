import React, { useEffect, useState, FormEvent } from "react";
import { useAnnotationCampaignAPI, useUsersAPI } from "@/services/api";
import { IonButton } from "@ionic/react";
import { useHistory, useParams } from "react-router-dom";
import { ChipsInput, FormBloc, Input, Searchbar } from "@/components/form";
import { User } from '@/types/user.ts';
import { Item } from "@/types/item.ts";
import { useToast } from "@/services/utils/toast.ts";
import './create-edit-campaign.css';


export const EditCampaign: React.FC = () => {
  const { id: campaignID } = useParams<{ id: string }>()

  // API Data
  const [users, setUsers] = useState<Array<User>>([]);
  const [campaignFilesCount, setCampaignFilesCount] = useState<number>(0);
  const usersAPI = useUsersAPI();
  const campaignAPI = useAnnotationCampaignAPI();

  // Form data
  const [annotators, setAnnotators] = useState<Array<User>>([]);
  const [filesToAnnotate, setFilesToAnnotate] = useState<number>(1);
  useEffect(() => setFilesToAnnotate(campaignFilesCount), [campaignFilesCount]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Services
  const toast = useToast();
  const history = useHistory();

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      campaignAPI.retrieve(campaignID),
      usersAPI.list()
    ]).then(([campaign, users]) => {
      if (isCancelled) return;
      const campaignUsersIDs = campaign.tasks.map(t => t.annotator_id);
      setUsers(users.filter(u => !campaignUsersIDs.includes(u.id)));
      setCampaignFilesCount(campaign.campaign.dataset_files_count)
    }).catch(e => !isCancelled && toast.presentError(e));

    return () => {
      isCancelled = true;
      usersAPI.abort();
      campaignAPI.abort();
      toast.dismiss();
    }
  }, [campaignID])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await campaignAPI.addAnnotators(+campaignID, {
        annotators: annotators.map(a => a.id),
        annotation_goal: filesToAnnotate
      })

      history.push(`/annotation_campaign/${ campaignID }`);
    } catch (e: any) {
      toast.presentError(e)
    } finally {
      setIsSubmitting(false);
    }
  }

  const onAddAnnotator = (item: Item) => {
    const annotator = users.find(a => a.id === item.value);
    if (!annotator) return;
    setAnnotators([...annotators, annotator])
  }

  const onAnnotatorsChange = (array: Array<string | number>) => {
    const newAnnotators = annotators.filter(a => array.includes(a.id))
    setAnnotators(newAnnotators)
  }

  const handleChipsSubmission = (e: FormEvent<HTMLInputElement>) => {
    if (annotators.length <= 0)
      e.currentTarget.setCustomValidity('Annotators are required')
  }

  return (
    <form id="create-campaign-form"
          onSubmit={ handleSubmit }
          className="col-sm-9 border rounded">
      <h1>Edit Annotation Campaign</h1>

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
                    onInvalid={ handleChipsSubmission }
                    setActiveItemsValues={ onAnnotatorsChange }/>

        <Input disabled={ annotators.length <= 0 }
               label="Wanted number of files to annotate"
               type="number"
               max={ campaignFilesCount }
               min={ 1 }
               value={ filesToAnnotate }
               onChange={ e => {
                 if (!e.target.value) setFilesToAnnotate(0);
                 else setFilesToAnnotate(+e.target.value)
               } }
               note={ `Each new annotator will annotate ${ filesToAnnotate === 0 ? campaignFilesCount : filesToAnnotate } / ${ campaignFilesCount } files.` }/>
      </FormBloc>

      <IonButton color="primary"
                 disabled={ isSubmitting }
                 type="submit">
        Update campaign
      </IonButton>
    </form>
  )
}
