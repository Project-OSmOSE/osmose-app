import React, { Fragment } from "react";
import { CampaignAPI } from "@/service/campaign";
import { Link } from "@/components/ui";

export const ImportAnnotationsButton: React.FC = () => {
  const {data: campaign, currentPhase} = CampaignAPI.useRetrieveQuery();

  if (!campaign || !currentPhase) return <Fragment/>
  if (campaign.archive) return <Fragment/>
  return <Link fill='outline' color='medium' size='small'
               appPath={ `/annotation-campaign/${ campaign.id }/phase/${ currentPhase.id }/import-annotations` }>
    Import annotations
  </Link>
}