import React, { Fragment, useMemo, useState } from "react";
import { DeploymentAPI } from "@pam-standardization/metadatax-ts";
import { IoCaretUp, IoClose, IoDownloadOutline, IoMailOutline, IoOpenOutline } from "react-icons/io5";
import { InstitutionLink } from "../InstitutionLink";
import styles from './panel.module.scss'

export const DeploymentPanel: React.FC<{
  deployment: DeploymentAPI & { annotated_labels?: { [key in string]: number } } | undefined,
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
      <ContactAction project={ deployment.project }/>
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

      { isOpenAccess && <Labels annotated_labels={ deployment.annotated_labels }/> }

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

const ContactAction: React.FC<{ project: DeploymentAPI['project'] }> = ({ project }) => {
  const href: string | null = useMemo(() => {
    const contacts = project.responsible_parties.filter(p => p.contact).map(p => p.contact);
    if (contacts.length === 0) return null;
    const subject = `Request information for ${ project.name }`;
    const message = `Dear OSmOSE team,
    
    I am reaching out to request specific information regarding the ${ project.name } project.
    
    Thank you for your help!
    
    [Your name]
    [Your institution]`;
    return `mailto:${ contacts.join(';') }?subject=${ subject }&body=${ encodeURIComponent(message) }`;
  }, [ project.name, project.responsible_parties ])
  if (!href) return <Fragment/>;
  return <a className={ styles.downloadButton }
            href={ href }>
    Contact <IoMailOutline/>
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

const Labels: React.FC<{ annotated_labels?: { [key in string]: number } }> = ({ annotated_labels }) => {
  if (!annotated_labels || Object.keys(annotated_labels).length === 0) return <Fragment/>
  return <Fragment>
    <small>Labels</small>
    { Object.entries(annotated_labels).map(([ label, count ]) => <p key={ label }>
      { label } ({ count })
    </p>) }
  </Fragment>
}

const Description: React.FC<{ description: DeploymentAPI['description'] }> = ({ description }) => {
  const [ isOpen, setIsOpen ] = useState<boolean>(false);
  if (!description) return <Fragment/>
  return <Fragment>
    <small onClick={ _ => setIsOpen(!isOpen) }>
      Description
      <IoCaretUp className={ isOpen ? '' : styles.dropDownClosed }/>
    </small>
    <p onClick={ _ => isOpen ? null : setIsOpen(true) }
       className={ isOpen ? '' : styles.dropDownClosed }
       dangerouslySetInnerHTML={ { __html: description.split(/[\n\r]/g).filter(e => !!e).join("<br/>") } }/>
  </Fragment>
}