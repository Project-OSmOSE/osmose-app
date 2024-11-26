import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { IonBadge, IonButton, IonIcon, IonProgressBar } from '@ionic/react';
import { crop } from "ionicons/icons";
import { AnnotationCampaign } from "@/services/api";
import './campaign-card.component.css';

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

  const manage = () => history.push(`/annotation-campaign/${ campaign.id }`);
  const annotate = () => history.push(`/annotation-campaign/${ campaign.id }/file`);

  return (
    <div className="campaign-card">

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
        <p className="label">Mode:</p>
        <p>{ campaign.usage }</p>
      </div>

      { campaign.my_total > 0 && <div className="my progression">
          <p>
          <span className="progress-label">
            My progress:
          </span> <span className={ "progress-value ion-color-" + color }>
            { campaign.my_progress }&nbsp;/&nbsp;{ campaign.my_total }
          </span>
          </p>
          <IonProgressBar color={ color }
                          value={ campaign.my_progress / campaign.my_total }/>
      </div> }
      { campaign.total > 0 && <div className="progression">
          <p>
          <span className="progress-label">
            Campaign progress: { campaign.progress }&nbsp;/&nbsp;{ campaign.total }
          </span>
          </p>
          <IonProgressBar color="medium"
                          value={ campaign.progress / campaign.total }/>
      </div> }

      <div id="buttons" className={ campaign.my_total > 0 ? '' : 'fill' }>
        <IonButton fill="outline" onClick={ manage }>
          { campaign.archive ? "Info" : "Manage" }
        </IonButton>
        { !campaign.archive && campaign.my_total > 0 &&
            <IonButton fill="solid" onClick={ annotate }>Annotate</IonButton> }
      </div>
    </div>
  );
}
