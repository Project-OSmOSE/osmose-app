import React, { useEffect, useMemo, useState } from 'react';
import { IonButton, IonChip, IonIcon, IonNote, IonSearchbar, IonSpinner } from "@ionic/react";
import { addOutline, closeCircle, helpBuoyOutline, swapHorizontal } from "ionicons/icons";
import { AnnotationCampaign, AnnotationCampaignUsage, useAnnotationCampaignAPI } from "@/services/api";
import { useToast } from "@/services/utils/toast.ts";
import { ANNOTATOR_GUIDE_URL } from "@/consts/links.ts";
import { searchFilter } from "@/services/utils/search.ts";
import { CampaignCard } from "@/view/campaign/list/campaign-card/campaign-card.component.tsx";
import './annotation-campaign-list.page.css'


export const AnnotationCampaignList: React.FC = () => {

  // State
  const [annotationCampaigns, setAnnotationCampaigns] = useState<Array<AnnotationCampaign>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string | undefined>();
  const [showArchivedFilter, setShowArchivedFilter] = useState<boolean>(false);
  const [modeFilter, setModeFilter] = useState<AnnotationCampaignUsage | undefined>();

  // Memo
  const showCampaigns = useMemo(() => {
    const baseCampaigns = annotationCampaigns
      .filter(c => (c.archive !== null) === showArchivedFilter)
      .filter(c => !modeFilter || c.usage === modeFilter);
    if (!search) return baseCampaigns;
    const results = searchFilter(
      baseCampaigns.map(c => ({
        value: c.id,
        label: c.name
      })),
      search
    );
    return baseCampaigns.filter(c => results.find(r => r.value === c.id));
  }, [annotationCampaigns, search, showArchivedFilter, modeFilter]);
  const canAccessArchive = useMemo(() => annotationCampaigns.filter(c => c.archive !== null).length > 0, [annotationCampaigns]);

  // Services
  const campaignService = useAnnotationCampaignAPI();
  const toast = useToast();

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    campaignService.list()
      .then(setAnnotationCampaigns)
      .catch(e => {
        if (isCancelled) return;
        toast.presentError(e);
      })
      .finally(() => !isCancelled && setIsLoading(false))

    return () => {
      isCancelled = true;
      campaignService.abort();
      setIsLoading(false);
      toast.dismiss();
    }
  }, []);

  const openGuide = () => {
    window.open(ANNOTATOR_GUIDE_URL, "_blank", "noopener, noreferrer")
  }

  const openNewCampaign = () => {
    window.open("/app/annotation-campaign/create", "_self")
  }

  const toggleArchivedFilter = () => {
    setShowArchivedFilter(!showArchivedFilter);
  }

  const toggleModeFilter = () => {
    switch (modeFilter) {
      case undefined:
        setModeFilter('Create');
        break;
      case 'Create':
        setModeFilter('Check');
        break;
      case 'Check':
        setModeFilter(undefined);
        break;
    }
  }

  return (
    <div id="campaign-list">
      <h2>Annotation Campaigns</h2>

      <div id="head">
        <div id="search-zone">
          <IonSearchbar placeholder="Search campaign"
                        onIonInput={ e => setSearch(e.detail.value ?? undefined) }
                        value={ search }/>

          { canAccessArchive &&
              <IonChip className={ showArchivedFilter ? 'active' : 'inactive' }
                       color="medium"
                       onClick={ toggleArchivedFilter }>
                  Show archived
                { showArchivedFilter && <IonIcon icon={ closeCircle }/> }
              </IonChip> }

          <IonChip className={ modeFilter ? 'active' : 'inactive' }
                   color="medium"
                   onClick={ toggleModeFilter }>
            Campaign mode filter{ modeFilter && `: ${ modeFilter }` }
            { modeFilter === 'Create' && <IonIcon icon={ swapHorizontal }/> }
            { modeFilter === 'Check' && <IonIcon icon={ closeCircle }/> }
          </IonChip>
        </div>

        <div id="actions">
          <IonButton color="warning" shape="round" fill="outline" onClick={ openGuide }>
            User guide
            <IonIcon icon={ helpBuoyOutline } slot="end"/>
          </IonButton>

          <IonButton color="primary" onClick={ openNewCampaign }>
            <IonIcon icon={ addOutline } slot="start"/>
            New annotation campaign
          </IonButton>
        </div>
      </div>

      <div id="content">
        { showCampaigns.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())).map(c => <CampaignCard campaign={ c } key={ c.id }/>) }
        { !isLoading && showCampaigns.length === 0 && <IonNote color="medium">No campaigns</IonNote> }
      </div>

      { isLoading && <div className="d-flex justify-content-center"><IonSpinner/></div> }
    </div>
  )
}
