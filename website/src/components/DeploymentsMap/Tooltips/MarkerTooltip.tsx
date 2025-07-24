import React, { Fragment, useEffect } from "react";
import styles from './Tooltip.module.scss';
import { ContactRole, Deployment } from "../../../pages/Projects/ProjectDetail/ProjectDetail";


export const MarkerTooltip: React.FC<{ deployment: Deployment }> = ({ deployment }) => {
  useEffect(() => {
    console.log(deployment);
  }, [ deployment ]);
  return (
    <div className={ styles.tooltip }>
      <p><small>Project:</small> { deployment.project.name }</p>
      { deployment.site && <p><small>Site:</small> { deployment.site.name }</p> }
      { deployment.campaign && <p><small>Campaign:</small> { deployment.campaign.name }</p> }
      <p><small>Deployment:</small> { deployment.name }</p>
      { deployment.contacts.edges.map((e, i) => <ContactInfo key={ i } node={ e?.node }/>) }
      { deployment.deploymentDate && <p><small>Launch:</small> { deployment.deploymentDate }</p> }
      { deployment.recoveryDate && <p><small>Recovery:</small> { deployment.recoveryDate }</p> }
    </div>
  )
}

const ContactInfo: React.FC<{ node?: ContactRole }> = ({ node }) => {
  if (node?.contact) {
    return <p><small>{ node.role }:</small> { node.contact.firstName } { node.contact.lastName }</p>
  }
  if (node?.institution) {
    return <p><small>{ node.role }:</small> { node.institution.name }</p>
  }
  return <Fragment/>
}