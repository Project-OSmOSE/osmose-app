import React, { useEffect, useMemo, useState } from "react";
import { useAnnotationCampaignAPI, UserList, UserListItem, useUsersAPI } from "../../services/api";
import { IonButton, IonChip, IonIcon, IonInput, IonLabel, IonNote, useIonToast } from "@ionic/react";
import { buildErrorMessage } from "../../services/format/format.util.tsx";
import { closeCircle } from "ionicons/icons";
import { useHistory, useParams } from "react-router-dom";
import { FormBloc } from "../../components/form/bloc/form-bloc.component.tsx";
import { Searchbar } from "../../components/form/searchbar/searchbar.component.tsx";
import './create-edit-campaign.css';

export const EditCampaign: React.FC = () => {
  const { id: campaignID } = useParams<{id: string}>()

  // Annotators
  const [datasetFilesCount, setDatasetFilesCount] = useState<number>(0);
  const [allAnnotators, setAllAnnotators] = useState<UserList>([]);

  const [annotators, setAnnotators] = useState<UserList>([]);
  const [annotatorsPerFile, setAnnotatorsPerFile] = useState<number>(0);
  useEffect(() => setAnnotatorsPerFile(annotators.length), [annotators]);
  const annotatedFilesCount = useMemo(() => {
    if (!datasetFilesCount|| !annotators.length) return 0;
    return Math.round(datasetFilesCount * annotatorsPerFile / annotators.length);
  }, [datasetFilesCount, annotatorsPerFile, annotators.length])
  const annotatedFilesPercent = useMemo(() => {
    if (!datasetFilesCount || !annotatedFilesCount) return 0;
    return Math.round(annotatedFilesCount / datasetFilesCount * 100);
  }, [datasetFilesCount, annotatedFilesCount])

  // API Services
  const usersAPI = useUsersAPI();
  const campaignAPI = useAnnotationCampaignAPI();

  const [presentToast, dismissToast] = useIonToast();

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      campaignAPI.retrieve(campaignID),
      usersAPI.list()
    ]).then(([campaign, users]) => {
      if (isCancelled) return;
      const campaignUsersIDs = campaign.tasks.map(t => t.annotator_id);
      setAllAnnotators(users.filter(u => !campaignUsersIDs.includes(u.id)));
      console.debug(datasetFilesCount, campaign)
      setDatasetFilesCount(campaign.campaign.dataset_files_count);
    }).catch(e => {
      if (isCancelled) return;
      presentToast({
        message: buildErrorMessage(e),
        color: 'danger',
        buttons: [
          {
            icon: closeCircle,
            handler: () => dismissToast()
          }
        ]
      })
    })

    return () => {
      isCancelled = true;
      usersAPI.abort();
      campaignAPI.abort();
    }
  }, [campaignID])

  const showUser = (user: UserListItem): string => {
    if (user.first_name && user.last_name) return `${ user.first_name } ${ user.last_name }`;
    else return user.username;
  }

  const history = useHistory();

  // Submit
  const [canSubmit, setCanSubmit] = useState<boolean>(false);
  useEffect(() => setCanSubmit(annotators.length > 0), [annotators]);

  const handleSubmit = async () => {
    try {
      await campaignAPI.addAnnotators(+campaignID, {
        annotators: annotators.map(a => a.id),
        annotation_goal: annotatorsPerFile
      })

      history.push(`/annotation_campaign/${campaignID}`);
    } catch (e: any) {
      if (e.status && e.response) {
        // Build an error message
        const message = Object
          .entries(e.response.body)
          .map(([key, value]) => Array.isArray(value) ? `${ key }: ${ value.join(' - ') }` : '')
          .join("\n");
        presentToast({
          color: 'danger',
          buttons: ['Ok'],
          message: message.length > 0 ? message : JSON.stringify(e.response.body)
        });
      }
    }
  }

  return (
    <div id="create-campaign-form" className="col-sm-9 border rounded">
      <h1>Edit Annotation Campaign</h1>

      <FormBloc label="Annotators">
        <div>
          <Searchbar placeholder="Search annotator..."
                     values={ allAnnotators.filter(a => !annotators.find(annotator => annotator.id === a.id)) }
                     show={ showUser }
                     onValueSelected={ (annotator: UserListItem) => setAnnotators([...new Set([...annotators, annotator])]) }></Searchbar>
          <div className="chips-container">{ annotators.map(annotator => {
            return (
              <IonChip color="secondary" key={ annotator.id }
                       onClick={ () => setAnnotators(annotators.filter(a => annotator.id !== a.id)) }>
                { showUser(annotator) }
                <IonIcon icon={ closeCircle }/>
              </IonChip>
            )
          }) }</div>
        </div>

        <div aria-disabled={ annotators.length <= 0 }>
          <div className="inline">
            <IonLabel>Wanted number of annotators per file</IonLabel>
            <IonInput type="number"
                      maxlength={ 3 }
                      max={ annotators.length ?? 0 }
                      min={ annotators.length > 0 ? 1 : 0 }
                      value={ annotatorsPerFile } onIonChange={ e => {
              if (!e.detail.value) setAnnotatorsPerFile(0);
              else setAnnotatorsPerFile(+e.detail.value)
            } }></IonInput>
          </div>
          <IonNote>
            Each annotator will annotate { annotatedFilesCount } / { datasetFilesCount ?? 0 } files
            ({ annotatedFilesPercent }%)
          </IonNote>
        </div>
      </FormBloc>

      <IonButton color="primary"
                 disabled={ !canSubmit }
                 aria-disabled={ !canSubmit }
                 onClick={ handleSubmit }>Update campaign</IonButton>
    </div>
  )
}
