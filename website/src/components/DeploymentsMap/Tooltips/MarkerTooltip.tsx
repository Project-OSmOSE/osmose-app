import React from "react";
import { DeploymentAPI } from '@PAM-Standardization/metadatax-ts';
import styles from './Tooltip.module.scss';

export const MarkerTooltip: React.FC<{ deployment: DeploymentAPI }> = ({ deployment }) => {
  return (
    <div className={ styles.tooltip }>
      <p><small>Project:</small> { deployment.project.name }</p>
      { deployment.site && <p><small>Site:</small> { deployment.site.name }</p> }
      { deployment.campaign && <p><small>Campaign:</small> { deployment.campaign.name }</p> }
      <p><small>Deployment:</small> { deployment.name }</p>
      { deployment.provider && <p><small>Provider:</small> { deployment.provider.name }</p> }
      { deployment.deployment_date && <p><small>Launch:</small> { deployment.deployment_date }</p> }
      { deployment.recovery_date && <p><small>Recovery:</small> { deployment.recovery_date }</p> }
    </div>
  )
}