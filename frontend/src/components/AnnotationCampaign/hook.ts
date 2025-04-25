import { AnnotationCampaign } from "@/service/campaign";
import { useMemo } from "react";
import { Color } from "@ionic/core";

type State = 'archived' | 'due date' | 'open';

export const useCampaignState = (campaign: AnnotationCampaign) => {
  const deadline: Date | undefined = useMemo(() => campaign.deadline ? new Date(campaign.deadline) : undefined, [ campaign.deadline ]);
  const state: State = useMemo(() => {
    if (campaign.archive) return 'archived';
    if (deadline && (deadline.getTime() - 7 * 24 * 60 * 60 * 1000) <= Date.now()) return 'due date'
    return 'open';
  }, [ campaign.deadline, campaign.archive ]);

  const color: Color = useMemo(() => {
    switch (state) {
      case 'open':
        return 'secondary';
      case 'due date':
        return 'warning';
      case 'archived':
        return 'medium';
    }
  }, [ state ]);

  return { state, color, deadline }
}
