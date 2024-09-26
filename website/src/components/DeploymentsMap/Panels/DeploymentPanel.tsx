import React, { Fragment, useMemo } from "react";
import { DeploymentAPI } from "@PAM-Standardization/metadatax-ts";
import { IoClose, IoDownloadOutline, IoMailOutline, IoOpenOutline } from "react-icons/io5";
import styles from './panel.module.scss'
import { InstitutionLink } from "../InstitutionLink";

export const DeploymentPanel: React.FC<{
  deployment: DeploymentAPI | undefined,
  onClose: () => void,
  disableProjectLink?: boolean;
}> = ({
        deployment,
        onClose,
        disableProjectLink = false,
      }) => {

  const isOpenAccess = useMemo(() => deployment?.project.accessibility === 'Open access', [ deployment ]);

  if (!deployment) return <div className={ [ styles.panel, styles.empty, styles.deployment ].join(' ') }/>

  return <div className={ styles.panel + ' ' + styles.deployment }>
    <div className={ styles.head }>
      <button onClick={ onClose }><IoClose/></button>
      { isOpenAccess && <DownloadAction deployment={ deployment }/> }
      { !isOpenAccess && <ContactAction parties={ deployment.project.responsible_parties }/> }
    </div>
    <div className={ styles.content }>
      <Project project={ deployment.project }
               disableProjectLink={ disableProjectLink }/>

      <CampaignSite label="Site"
                    data={ deployment.site }/>

      <CampaignSite label="Campaign"
                    data={ deployment.campaign }/>

      <Deployment deployment={ deployment }/>

      <DateAndVessel label="Launch"
                     date={ deployment.deployment_date }
                     vessel={ isOpenAccess ? deployment.deployment_vessel : null }/>

      <DateAndVessel label="Recovery"
                     date={ deployment.recovery_date }
                     vessel={ isOpenAccess ? deployment.recovery_vessel : null }/>

      <Coordinates lat={ deployment.latitude }
                   lon={ deployment.longitude }/>

      <BathymetricDepth depth={ deployment.bathymetric_depth }/>

      { isOpenAccess && <Platform platform={ deployment.platform }/> }

      { isOpenAccess && <Description description={ deployment.description }/> }
    </div>
  </div>
}

const DownloadAction: React.FC<{ deployment: DeploymentAPI }> = ({ deployment }) => {
  const downloadData = useMemo(() => {
    return `data:text/json;charset=utf-8,${ encodeURIComponent(JSON.stringify(deployment)) }`
  }, [ deployment ])
  return <a download={ `${ deployment.name }.json` }
            className={ styles.downloadButton }
            href={ downloadData }>
    Download <IoDownloadOutline/>
  </a>
}

const ContactAction: React.FC<{ parties: DeploymentAPI['project']['responsible_parties'] }> = ({ parties }) => {
  const href: string | null = useMemo(() => {
    const contacts = parties.filter(p => p.contact).map(p => p.contact);
    if (contacts.length === 0) return null;
    return `mailto:${ contacts.join(';') }`
  }, [ parties ])
  if (!href) return <Fragment/>;
  return <a className={ styles.downloadButton }
            href={ href }>
    Request access <IoMailOutline/>
  </a>
}

const Project: React.FC<{ project: DeploymentAPI['project'], disableProjectLink: boolean }> = ({
                                                                                                 project,
                                                                                                 disableProjectLink
                                                                                               }) => {
  const websiteProject: number | null = useMemo(() => disableProjectLink ? null : (project as any).website_project, [ project, disableProjectLink ]);
  return <Fragment>
    <small>Project</small>
    <p>
      { project.name }
      { websiteProject !== null && <a href={ `/projects/${ websiteProject }` }> <IoOpenOutline/> </a> }
      { project.project_goal && <Fragment>
          <br/>
          <small>{ project.project_goal }</small>
      </Fragment> }
      { project.responsible_parties && <Fragment>
          <br/>
          <small>({ project.responsible_parties.map(i => <InstitutionLink institution={ i }
                                                                          key={ i.id }/>) })</small>
      </Fragment> }
    </p>
  </Fragment>
}

const CampaignSite: React.FC<{
  label: 'Campaign' | 'Site',
  data: DeploymentAPI['campaign'] | DeploymentAPI['site']
}> = ({ label, data }) => {
  if (!data) return <Fragment/>
  return <Fragment>
    <small>{ label }</small>
    <p>{ data.name }</p>
  </Fragment>
}

const Deployment: React.FC<{ deployment: DeploymentAPI }> = ({ deployment }) => (
  <Fragment>
    <small>Deployment</small>
    <p>
      { deployment.name }
      { deployment.provider && <small>
          <br/>(<InstitutionLink institution={ deployment.provider }/>)
      </small> }
    </p>
  </Fragment>
)

const DateAndVessel: React.FC<{
  label: 'Launch' | 'Recovery',
  date: DeploymentAPI['deployment_date'] | DeploymentAPI['recovery_date'],
  vessel: DeploymentAPI['deployment_vessel'] | DeploymentAPI['recovery_vessel']
}> = ({ label, date, vessel }) => {
  if (!date && !vessel) return <Fragment/>
  return <Fragment>
    <small>{ label }</small>
    <p>{ [ date, vessel ].join(' - ') }</p>
  </Fragment>
}

const Coordinates: React.FC<{ lat: DeploymentAPI['latitude'], lon: DeploymentAPI['longitude'] }> = ({ lat, lon }) => (
  <Fragment>
    <small>Coordinates</small>
    <p>{ lat }, { lon }</p>
  </Fragment>
)

const BathymetricDepth: React.FC<{ depth: DeploymentAPI['bathymetric_depth'] }> = ({ depth }) => (
  <Fragment>
    <small>Bathymetric depth</small>
    <p>{ depth }</p>
  </Fragment>
)

const Platform: React.FC<{ platform: DeploymentAPI['platform'] }> = ({ platform }) => {
  if (!platform) return <Fragment/>
  return <Fragment>
    <small>Platform</small>
    <p>{ platform.name }</p>
  </Fragment>
}

const Description: React.FC<{ description: DeploymentAPI['description'] }> = ({ description }) => {
  if (!description) return <Fragment/>
  return <Fragment>
    <small>Description</small>
    <p dangerouslySetInnerHTML={ { __html: description.split(/[\n\r]/g).filter(e => !!e).join("<br/>") } }/>
  </Fragment>
}