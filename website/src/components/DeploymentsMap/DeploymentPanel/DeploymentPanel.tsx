import React, { Fragment, useMemo } from "react";
import { DeploymentAPI, Institution } from "@PAM-Standardization/metadatax-ts";
import { IoClose, IoDownloadOutline, IoMailOutline, IoOpenOutline } from "react-icons/io5";
import styles from './panel.module.scss'

export const DeploymentPanel: React.FC<{
  deployment: DeploymentAPI | undefined,
  onClose: () => void,
  disableProjectLink?: boolean;
}> = ({
        deployment,
        onClose,
        disableProjectLink = false,
      }) => {
  const downloadData = useMemo(() => {
    return `data:text/json;charset=utf-8,${ encodeURIComponent(JSON.stringify(deployment)) }`
  }, [ deployment ])

  const isOpenAccess = useMemo(() => deployment?.project.accessibility === 'Open access', [ deployment ]);

  const websiteProject: number = useMemo(() => (deployment?.project as any)?.website_project, [ deployment ]);
  if (!deployment) return <div className={ [ styles.panel, styles.empty ].join(' ') }/>
  return <div className={ styles.panel }>
    <div className={ styles.head }>
      <button onClick={ onClose }><IoClose/></button>
      { isOpenAccess && <a download={ `${ deployment.name }.json` } className={ styles.downloadButton }
                           href={ downloadData }>Download <IoDownloadOutline/></a> }
      { !isOpenAccess && deployment.project.responsible_parties.find(p => p.contact)
        && <a download={ `${ deployment.name }.json` } className={ styles.downloadButton }
              href={ `mailto:${ deployment.project.responsible_parties.map(p => p.contact).join(';') }` }>Request
              access <IoMailOutline/></a> }
    </div>
    <div className={ styles.content }>
      <small>Project</small>
      <p>
        { deployment.project.name }
        { websiteProject && !disableProjectLink && <a href={ `/projects/${ websiteProject }` }> <IoOpenOutline/> </a> }
        { deployment.project.project_goal && <Fragment>
            <br/>
            <small>{ deployment.project.project_goal }</small>
        </Fragment> }
        { deployment.project.responsible_parties && <Fragment>
            <br/>
            <small>({ deployment.project.responsible_parties.map(i => <InstitutionLink institution={ i }
                                                                                       key={ i.id }/>) })</small>
        </Fragment> }
      </p>

      { deployment.site && <Fragment>
          <small>Site</small>
          <p>{ deployment.site.name }</p>
      </Fragment> }

      { deployment.campaign && <Fragment>
          <small>Campaign</small>
          <p>{ deployment.campaign.name }</p>
      </Fragment> }

      <small>Deployment</small>
      <p>
        { deployment.name }
        { deployment.provider && <small>
            <br/>(<InstitutionLink institution={ deployment.provider }/>)
        </small> }
      </p>

      { (deployment.deployment_date || deployment.deployment_vessel) && <Fragment>
          <small>Launch</small>
          <p>
            { deployment.deployment_date }
            { isOpenAccess && ` - ${ deployment.deployment_vessel }` }
          </p>
      </Fragment> }

      { (deployment.recovery_date || deployment.recovery_vessel) && <Fragment>
          <small>Recovery</small>
          <p>
            { deployment.recovery_date }
            { isOpenAccess && ` - ${ deployment.recovery_vessel }` }
          </p>
      </Fragment> }

      <small>Coordinates</small>
      <p>
        { deployment.latitude }, { deployment.longitude }
      </p>

      <small>Bathymetric depth</small>
      <p>
        { deployment.bathymetric_depth }
      </p>

      { isOpenAccess && deployment.platform && <Fragment>
          <small>Platform</small>
          <p>
            { deployment.platform?.name }
          </p>
      </Fragment> }

      { isOpenAccess && deployment.description && <Fragment>
          <small>Description</small>
          <p dangerouslySetInnerHTML={ { __html: deployment.description.split(/[\n\r]/g).filter(e => !!e).join("<br/>") } }/>
      </Fragment> }
    </div>
  </div>
}

const InstitutionLink: React.FC<{ institution: Institution }> = ({ institution }) => {
  console.log(institution)
  if (institution.website) return <a href={ institution.website } target="_blank"
                                     rel="noopener noreferrer">{ institution.name }</a>;
  else return <Fragment>{ institution.name }</Fragment>;
}