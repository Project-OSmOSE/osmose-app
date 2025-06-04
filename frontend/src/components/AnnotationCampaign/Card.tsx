import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonBadge, IonIcon, IonSkeletonText } from '@ionic/react';
import { crop } from "ionicons/icons";
import { AnnotationCampaign, AnnotationCampaignPhase } from '@/service/types';
import { pluralize } from "@/service/function.ts";
import { CampaignBadge, CampaignGlobalProgress, CampaignUserProgress } from "@/components/AnnotationCampaign";
import styles from './styles.module.scss'
import { SkeletonProgress } from "@/components/ui";

export const SkeletonCampaignCard: React.FC = () => (
  <div className={ styles.card }>

    <div className={ styles.head }>
      <IonBadge color='light'>
        <IonSkeletonText animated style={ { width: 64 } }/>
      </IonBadge>
      <IonSkeletonText className={ styles.campaign } animated style={ { width: 128, height: '1ch' } }/>
      <IonSkeletonText className={ styles.dataset } animated style={ { width: 192, height: '1ch' } }/>
    </div>

    <div className={ styles.property }>
      <IonIcon className={ styles.icon } icon={ crop }/>
      <IonSkeletonText animated style={ { width: 128, height: '1ch' } }/>
    </div>

    <SkeletonProgress className={ styles.userProgression }/>
    <SkeletonProgress className={ styles.progression }/>
  </div>
)

export const CampaignCard: React.FC<{
  campaign: AnnotationCampaign,
  phases: AnnotationCampaignPhase[],
}> = ({ campaign, phases }) => {
  const navigate = useNavigate();
  const link = useMemo(() => {
    if (phases.length > 0)
      return `/annotation-campaign/${ campaign.id }/phase/${ phases[0].id }`;
    return `/annotation-campaign/${ campaign.id }`
  }, [ campaign, phases ])

  const accessDetail = useCallback(() => navigate(link), [ link ]);
  const accessAuxDetail = useCallback(() => window.open(`/app${ link }`, '_blank'), [ link ]);

  return (
    // campaign-card classname for test purpose
    <div className={ [ styles.card, 'campaign-card' ].join(' ') } onClick={ accessDetail }
         onAuxClick={ accessAuxDetail }>

      <div className={ styles.head }>
        <CampaignBadge campaign={ campaign }/>
        <p className={ styles.campaign }>{ campaign.name }</p>
        <p className={ styles.dataset }>{ campaign.datasets.join(', ') }</p>
      </div>

      <div className={ styles.property }>
        <IonIcon className={ styles.icon } icon={ crop }/>
        <p className={ styles.label }>Phase{ pluralize(phases ?? []) }:</p>
        <p>{ phases && phases.length > 0 ?
          phases.map(p => p.phase).join(', ') :
          'No phase' }</p>
      </div>

      <CampaignUserProgress campaign={ campaign } phases={ phases } className={ styles.userProgression }/>

      <CampaignGlobalProgress phases={ phases } className={ styles.progression }/>
    </div>
  );
}
