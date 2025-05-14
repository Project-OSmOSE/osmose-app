import React, { Fragment, useEffect, useState } from 'react';
import { IonButton, IonChip, IonIcon, IonNote, IonSpinner } from "@ionic/react";
import { addOutline, closeCircle, refreshOutline, swapHorizontal } from "ionicons/icons";
import { useToast } from "@/service/ui";
import { ActionBar } from "@/components/layout";
import { Link } from "@/components/ui";
import styles from './styles.module.scss'
import { CampaignCard } from "@/components/AnnotationCampaign";
import { UserAPI } from "@/service/api/user.ts";
import { Phase } from "@/service/types";
import { CampaignAPI } from "@/service/api/campaign.ts";


export const AnnotationCampaignList: React.FC = () => {

  // State
  const [ search, setSearch ] = useState<string | undefined>();
  const [ showArchivedFilter, setShowArchivedFilter ] = useState<boolean>(false);
  const [ modeFilter, setModeFilter ] = useState<Phase | undefined>();
  const [ myWorkFilter, setMyWorkFilter ] = useState<boolean>(true);
  const [ onlyMineFilter, setonlyMineFilter ] = useState<boolean>(false);
  const { presentError, dismiss: dismissToast } = useToast()

  // Services
  const { data: currentUser } = UserAPI.endpoints.getCurrentUser.useQuery();
  const { data: campaigns, isFetching, error } = CampaignAPI.endpoints.listCampaign.useQuery({
    onlyArchived: showArchivedFilter,
    phase: modeFilter,
    search,
    owner: onlyMineFilter ? currentUser?.id : undefined,
    annotator: myWorkFilter ? currentUser?.id : undefined,
  }, {
    skip: !currentUser
  })

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, []);

  useEffect(() => {
    if (error) presentError(error);
  }, [ error ]);

  const toggleModeFilter = () => {
    switch (modeFilter) {
      case undefined:
        setModeFilter('Annotation');
        break;
      case 'Annotation':
        setModeFilter('Verification');
        break;
      case 'Verification':
        setModeFilter(undefined);
        break;
    }
  }

  function toggleArchiveFilter() {
    setShowArchivedFilter(prev => !prev)
  }

  function toggleOnlyMineFilter() {
    setonlyMineFilter(prev => !prev)
  }

  function toggleMyWorkFilter() {
    setMyWorkFilter(prev => !prev)
  }

  function resetFilters() {
    setMyWorkFilter(false);
    setonlyMineFilter(false);
    setShowArchivedFilter(false);
    setModeFilter(undefined);
  }

  return <Fragment>
      <h2>Annotation Campaigns</h2>

      <ActionBar search={ search }
                 searchPlaceholder="Search campaign name"
                 onSearchChange={ setSearch }
                 actionButton={ <Link color='primary' fill='outline' appPath='/annotation-campaign/new'>
                   <IonIcon icon={ addOutline } slot="start"/>
                   New annotation campaign
                 </Link> }>

        <IonChip outline={ !myWorkFilter }
                 onClick={ toggleMyWorkFilter }
                 color={ myWorkFilter ? 'primary' : 'medium' }>
          My work
          { myWorkFilter && <IonIcon icon={ closeCircle } color='primary'/> }
        </IonChip>

        <IonChip outline={ !showArchivedFilter }
                 onClick={ toggleArchiveFilter }
                 color={ showArchivedFilter ? 'primary' : 'medium' }>
          Only archived
          { showArchivedFilter && <IonIcon icon={ closeCircle } color='primary'/> }
        </IonChip>

        <IonChip outline={ !modeFilter }
                 onClick={ toggleModeFilter }
                 color={ modeFilter ? 'primary' : 'medium' }>
          Campaign mode filter{ modeFilter && `: ${ modeFilter }` }
          { modeFilter === 'Annotation' && <IonIcon icon={ swapHorizontal }/> }
          { modeFilter === 'Verification' && <IonIcon icon={ closeCircle }/> }
        </IonChip>

        <IonChip outline={ !onlyMineFilter }
                 onClick={ toggleOnlyMineFilter }
                 color={ onlyMineFilter ? 'primary' : 'medium' }>
          Owned campaigns
          { onlyMineFilter && <IonIcon icon={ closeCircle } color='primary'/> }
        </IonChip>

        { (onlyMineFilter || modeFilter || showArchivedFilter || myWorkFilter) &&
            <IonButton fill='clear' color='medium' onClick={ resetFilters }>
                <IonIcon icon={ refreshOutline } slot='start'/>
                Reset
            </IonButton> }
      </ActionBar>

      { isFetching && <IonSpinner/> }
      <div className={ styles.campaignCardsGrid }>
        { campaigns?.map(c => <CampaignCard
          campaign={ c } key={ c.id }/>) }
        { !isFetching && campaigns?.length === 0 && <IonNote color="medium">No campaigns</IonNote> }
      </div>
  </Fragment>
}
