import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { crop } from "ionicons/icons";
import { AnnotationCampaign } from '@/service/campaign';
import { pluralize } from "@/service/function.ts";
import { CampaignBadge, CampaignGlobalProgress, CampaignUserProgress } from "@/components/AnnotationCampaign";
import styles from './styles.module.scss'

export const CampaignCard: React.FC<{
  campaign: AnnotationCampaign
}> = ({ campaign }) => {
  const navigate = useNavigate();
  const link = useMemo(() => {
    if (campaign.phases.length > 0)
      return `/annotation-campaign/${ campaign.id }/phase/${campaign.phases[0].id}`;
    return `/annotation-campaign/${ campaign.id }`
  }, [campaign])

  const accessDetail = useCallback(() => navigate(link), [ link ]);
  const accessAuxDetail = useCallback(() => window.open(`/app${ link }`, '_blank'), [ link ]);

  return (
    <div className={ styles.card } onClick={ accessDetail } onAuxClick={ accessAuxDetail }>

      <div className={ styles.head }>
        <CampaignBadge campaign={ campaign }/>
        <p className={ styles.campaign }>{ campaign.name }</p>
        <p className={ styles.dataset }>{ campaign.datasets.join(', ') }</p>
      </div>

      <div className={ styles.property }>
        <IonIcon className={ styles.icon } icon={ crop }/>
        <p className={ styles.label }>Phase{ pluralize(campaign.phases) }:</p>
        <p>{ campaign.phases.map(p => p.phase).join(', ') }</p>
      </div>

      <CampaignUserProgress campaign={ campaign } className={ styles.userProgression }/>

      <CampaignGlobalProgress campaign={ campaign } className={ styles.progression }/>
    </div>
  );
}
