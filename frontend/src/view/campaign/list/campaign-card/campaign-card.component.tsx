import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { IonBadge, IonIcon } from '@ionic/react';
import { crop } from "ionicons/icons";
import { AnnotationCampaign } from '@/service/campaign';
import { Progress } from "@/components/ui/Progress.tsx";
import './campaign-card.component.css';
import { pluralize } from "@/service/function.ts";

interface Props {
  campaign: AnnotationCampaign
}

enum State {
  dueDate,
  open,
  archived
}

export const CampaignCard: React.FC<Props> = ({ campaign }) => {
  const history = useHistory();

  const deadline: Date | undefined = useMemo(() => campaign.deadline ? new Date(campaign.deadline) : undefined, [ campaign.deadline ]);

  const state = useMemo(() => {
    if (campaign.archive) return State.archived;
    if (deadline && (deadline.getTime() - 7 * 24 * 60 * 60 * 1000) <= Date.now()) return State.dueDate
    return State.open;
  }, [ campaign.deadline, campaign.archive ]);

  const user_total = useMemo(() => {
    return campaign.phases.reduce((previousValue, p) => previousValue + p.user_total, 0);
  }, [ campaign.phases ]);

  const user_progress = useMemo(() => {
    return campaign.phases.reduce((previousValue, p) => previousValue + p.user_progress, 0);
  }, [ campaign.phases ]);

  const global_total = useMemo(() => {
    return campaign.phases.reduce((previousValue, p) => previousValue + p.global_total, 0);
  }, [ campaign.phases ]);

  const global_progress = useMemo(() => {
    return campaign.phases.reduce((previousValue, p) => previousValue + p.global_progress, 0);
  }, [ campaign.phases ]);

  const color = useMemo(() => {
    switch (state) {
      case State.open:
        return 'secondary';
      case State.dueDate:
        return 'warning';
      case State.archived:
        return 'medium';
    }
  }, [ state ]);

  const accessDetail = () => history.push(`/annotation-campaign/${ campaign.id }`);
  const accessAuxDetail = () => window.open(`/app/annotation-campaign/${ campaign.id }`, '_blank');

  return (
    <div className="campaign-card" onClick={ accessDetail } onAuxClick={ accessAuxDetail }>

      <div id="head">
        { state === State.open && <IonBadge color="secondary">Open</IonBadge> }
        { state === State.dueDate &&
            <IonBadge color="warning">Due date: { deadline?.toLocaleDateString() }</IonBadge> }
        { state === State.archived && <IonBadge color="medium">Archived</IonBadge> }

        <p id="campaign-name">{ campaign.name }</p>
        <p id="dataset-name">{ campaign.datasets.join(', ') }</p>
      </div>

      <div className="property">
        <IonIcon className="icon" icon={ crop }/>
        <p className="label">Phase{ pluralize(campaign.phases) }:</p>
        <p>{ campaign.phases.map(p => p.phase).join(', ') }</p>
      </div>

      { user_total > 0 ? <Progress label='My progress' color={ color }
                                   value={ user_progress } total={ user_total }/> : <div/> }

      { global_total > 0 ? <Progress label='Global progress'
                                     value={ global_progress } total={ global_total }/> : <div/> }
    </div>
  );
}
