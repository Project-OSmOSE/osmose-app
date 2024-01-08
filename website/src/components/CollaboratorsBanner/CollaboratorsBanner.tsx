import React from "react";
import { Collaborator } from "../../models/collaborator";
import './CollaboratorsBanner.css';

interface CollaboratorsBannerProps {
  collaborators?: Array<Collaborator>
}

export const CollaboratorsBanner: React.FC<CollaboratorsBannerProps> = ({ collaborators }) => {
  if (!collaborators) return <React.Fragment></React.Fragment>;
  return (
    <div id="collaborators-banner-component">
      <h2>Collaborators & Funders</h2>

      <div className="logo-container">
        { collaborators.map(collaborator => {
          console.debug(collaborator)
          const img = (<img key={ collaborator.id }
                            src={ collaborator.thumbnail }
                            alt={ collaborator.name }
                            title={ collaborator.name }/>)
          if (!collaborator.url) return img;
          return (<a href={ collaborator.url }
                     key={ collaborator.id }
                     target="_blank" rel="noreferrer">{ img }</a>)
        }) }
      </div>
    </div>
  )
};
