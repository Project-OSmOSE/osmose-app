import React, { Fragment, useCallback, useEffect } from 'react';
import { IonButton, IonChip, IonIcon, IonNote } from "@ionic/react";
import { addOutline, closeCircle, refreshOutline, swapHorizontal } from "ionicons/icons";
import { useToast } from "@/service/ui";
import { ActionBar } from "@/components/layout";
import { Link } from "@/components/ui";
import styles from './styles.module.scss'
import { CampaignCard, SkeletonCampaignCard } from "@/components/AnnotationCampaign";
import { UserAPI } from "@/service/api/user.ts";
import { CampaignAPI } from "@/service/api/campaign.ts";
import { CampaignPhaseAPI } from "@/service/api/campaign-phase.ts";
import { Deactivatable } from "@/components/ui/Deactivatable.tsx";
import { useCampaignFilters } from "@/service/slices/filter.ts";


export const AnnotationCampaignList: React.FC = () => {
  const { params, updateParams } = useCampaignFilters()

  // State
  const { presentError, dismiss: dismissToast } = useToast()

  // Services
  const { data: currentUser } = UserAPI.endpoints.getCurrentUser.useQuery();
  const {
    data: campaigns,
    isFetching,
    error
  } = CampaignAPI.endpoints.listCampaign.useQuery(params, { skip: !currentUser })
  const {
    data: phases,
    isFetching: isFetchingPhases,
    error: phasesError
  } = CampaignPhaseAPI.endpoints.listCampaignPhase.useQuery({ campaigns }, { skip: !campaigns })

  useEffect(() => {
    return () => {
      dismissToast()
    }
  }, []);

  useEffect(() => {
    if (error) presentError(error);
  }, [ error ]);

  useEffect(() => {
    if (phasesError) presentError(phasesError);
  }, [ phasesError ]);

  const toggleModeFilter = useCallback(() => {
    switch (params.phases__phase) {
      case undefined:
        updateParams({ phases__phase: 'A' })
        break;
      case 'A':
        updateParams({ phases__phase: 'V' })
        break;
      case 'V':
        updateParams({ phases__phase: undefined })
        break;
    }
  }, [ params ])

  const toggleArchiveFilter = useCallback(() => {
    switch (params.archive__isnull) {
      case undefined:
        updateParams({ archive__isnull: true })
        break;
      case false:
        updateParams({ archive__isnull: undefined })
        break;
      case true:
        updateParams({ archive__isnull: false })
        break;
    }
  }, [ params ])

  const toggleOnlyMineFilter = useCallback(() => {
    if (params.owner) {
      updateParams({ owner: undefined })
    } else {
      updateParams({ owner: currentUser?.id })
    }
  }, [ params ])

  const toggleMyWorkFilter = useCallback(() => {
    if (params.phases__file_ranges__annotator_id) {
      updateParams({ phases__file_ranges__annotator_id: undefined })
    } else {
      updateParams({ phases__file_ranges__annotator_id: currentUser?.id })
    }
  }, [ params, currentUser ])

  const resetFilters = useCallback(() => {
    updateParams({
      search: undefined,
      archive__isnull: false,
      phases__phase: undefined,
      phases__file_ranges__annotator_id: undefined,
      owner: undefined,
    })
  }, [ params ])

  return <Fragment>
    <h2>Annotation Campaigns</h2>

    <ActionBar search={ params.search }
               searchPlaceholder="Search campaign name"
               onSearchChange={ search => updateParams({ search }) }
               actionButton={ <Link color='primary' fill='outline' appPath='/annotation-campaign/new'>
                 <IonIcon icon={ addOutline } slot="start"/>
                 New annotation campaign
               </Link> }>

      <IonChip outline={ !params.phases__file_ranges__annotator_id }
               onClick={ toggleMyWorkFilter }
               color={ params.phases__file_ranges__annotator_id ? 'primary' : 'medium' }>
        My work
        { params.phases__file_ranges__annotator_id && <IonIcon icon={ closeCircle } color='primary'/> }
      </IonChip>

      <IonChip outline={ params.archive__isnull === undefined }
               onClick={ toggleArchiveFilter }
               color={ params.archive__isnull !== undefined ? 'primary' : 'medium' }>
        Archived{ params.archive__isnull !== undefined && `: ${ params.archive__isnull ? 'False' : 'True' }` }
        { params.archive__isnull === true && <IonIcon icon={ swapHorizontal }/> }
        { params.archive__isnull === false && <IonIcon icon={ closeCircle }/> }
      </IonChip>

      <IonChip outline={ !params.phases__phase }
               onClick={ toggleModeFilter }
               color={ params.phases__phase ? 'primary' : 'medium' }>
        Campaign mode
        filter{ params.phases__phase && `: ${ params.phases__phase === 'A' ? 'Annotation' : 'Verification' }` }
        { params.phases__phase === 'A' && <IonIcon icon={ swapHorizontal }/> }
        { params.phases__phase === 'V' && <IonIcon icon={ closeCircle }/> }
      </IonChip>

      <IonChip outline={ !params.owner }
               onClick={ toggleOnlyMineFilter }
               color={ params.owner ? 'primary' : 'medium' }>
        Owned campaigns
        { params.owner && <IonIcon icon={ closeCircle } color='primary'/> }
      </IonChip>

      { (params.owner || params.phases__phase || params.archive__isnull || params.phases__file_ranges__annotator_id) &&
          <IonButton fill='clear' color='medium' onClick={ resetFilters }>
              <IonIcon icon={ refreshOutline } slot='start'/>
              Reset
          </IonButton> }
    </ActionBar>

    <Deactivatable disabled={ isFetching || isFetchingPhases }
                   loading={ isFetching || isFetchingPhases }>
      <div className={ styles.campaignCardsGrid }>

        { (isFetching || isFetchingPhases) && (!phases || !campaigns) && Array.from(new Array(7)).map((_, i) =>
          <SkeletonCampaignCard key={ i }/>) }

        { phases && campaigns?.map(c => <CampaignCard key={ c.id }
                                                      phases={ phases.filter(p => p.annotation_campaign === c.id) }
                                                      campaign={ c }/>) }
        { !isFetching && campaigns?.length === 0 && <IonNote color="medium">No campaigns</IonNote> }
      </div>
    </Deactivatable>
  </Fragment>
}
