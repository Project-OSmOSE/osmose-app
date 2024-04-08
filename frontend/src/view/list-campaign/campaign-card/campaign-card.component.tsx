import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { IonBadge, IonButton, IonProgressBar } from '@ionic/react';
import { ListItem } from "@/services/api/annotation-campaign-api.service.tsx";
import './campaign-card.component.css';

interface Props {
  campaign: ListItem
}

enum State {
  dueDate,
  open,
  archived
}

export const CampaignCard: React.FC<Props> = ({ campaign }) => {
  const history = useHistory();

  const state = useMemo(() => {
    if (campaign.deadline && (campaign.deadline.getTime() - 7 * 24 * 60 * 60 * 1000) <= Date.now()) return State.dueDate;
    console.debug(campaign.deadline?.toLocaleDateString(), campaign.deadline?.getTime())
    return State.open;
  }, [campaign.deadline]);

  const color = useMemo(() => state === State.open ? 'secondary' : 'warning', [state]);

  const manage = () => history.push(`/annotation_campaign/${ campaign.id }`);
  const annotate = () => history.push(`/annotation_tasks/${ campaign.id }`);

  return (
    <div id="campaign-card" className="campaign-card">

      <div id="head">
        { state === State.open && <IonBadge color="secondary">Open</IonBadge> }
        { state === State.dueDate &&
            <IonBadge color="warning">Due date: { campaign.deadline?.toLocaleDateString() }</IonBadge> }

        <p id="campaign-name">{ campaign.name }</p>
        <p id="dataset-name">{ campaign.datasets_name }</p>
      </div>

      <div className="progression">
        <p>
          <span className="progress-label">
            My progress:
          </span> <span className={ "progress-value ion-color-" + color }>
            { campaign.my_progress }&nbsp;/&nbsp;{ campaign.my_total }
          </span>
        </p>
        <IonProgressBar color={ color }
                        value={ campaign.my_progress / campaign.my_total }/>
      </div>
      <div className="progression">
        <p>
          <span className="progress-label">
            Campaign progress:
          </span> <span className="progress-value">
            { campaign.progress }&nbsp;/&nbsp;{ campaign.total }
          </span>
        </p>
        <IonProgressBar color="medium"
                        value={ campaign.progress / campaign.total }/>
      </div>

      <div id="buttons">
        <IonButton fill="outline" onClick={ manage }>Manage</IonButton>
        <IonButton fill="solid" onClick={ annotate }>Annotate</IonButton>
      </div>
    </div>
  );
}
