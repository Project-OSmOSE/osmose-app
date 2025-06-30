import React, { useMemo } from "react";
import styles from './Tooltip.module.scss';
import { DeploymentNode } from "../../../../../../metadatax-ts/src";

export const ClusterTooltip: React.FC<{ deployments: Array<DeploymentNode> }> = ({ deployments }) => {
  const projects = useMemo(() => [ ...new Set(deployments.map(d => d.project.name)) ], [ deployments ]);
  const sites = useMemo(() => [ ...new Set(deployments.map(d => d.site?.name).filter(e => !!e)) ], [ deployments ]);
  const campaigns = useMemo(() => [ ...new Set(deployments.map(d => d.campaign?.name).filter(e => !!e)) ], [ deployments ]);
  if (projects.length > 1) {
    return (
      <div className={ styles.tooltip }>
        <p><small>Projects:</small> { projects.join(', ') }</p>
      </div>
    )
  }
  return (
    <div className={ styles.tooltip }>
      <p><small>Project:</small> { projects.join(', ') }</p>
      { sites.length > 0 && <p><small>Sites:</small> { sites.join(', ') }</p> }
      { campaigns.length > 0 && <p><small>Campaigns:</small> { campaigns.join(', ') }</p> }
    </div>
  )
}