import React from "react";
import styles from './Tooltip.module.scss';
import { Deployment } from "../../../pages/Projects/ProjectDetail/ProjectDetail";


export const MarkerTooltip: React.FC<{ deployment: Deployment }> = ({ deployment }) => {

  return (
    <div className={ styles.tooltip }>
      <p><small>Project:</small> { deployment.project.name }</p>
      { deployment.site && <p><small>Site:</small> { deployment.site.name }</p> }
      { deployment.campaign && <p><small>Campaign:</small> { deployment.campaign.name }</p> }
      <p><small>Deployment:</small> { deployment.name }</p>
      { deployment.contacts.edges.filter(e => !!e && !!e.node).map(e => (
        <p key={ e!.node!.id }><small>{ e!.node!.role }:</small> { e!.node!.contact.name }</p>
      )) }
      { deployment.deploymentDate && <p><small>Launch:</small> { deployment.deploymentDate }</p> }
      { deployment.recoveryDate && <p><small>Recovery:</small> { deployment.recoveryDate }</p> }
    </div>
  )
}