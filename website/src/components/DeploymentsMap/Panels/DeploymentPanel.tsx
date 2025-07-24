import React, { Fragment, useEffect, useMemo, useState } from "react";
import { IoCaretUp, IoClose, IoDownloadOutline, IoOpenOutline } from "react-icons/io5";
import styles from './panel.module.scss'
import { useFetchGql } from "../../../utils";
import { gql } from "graphql-request";
import { Deployment } from '../../../pages/Projects/ProjectDetail/ProjectDetail'
import { ContactLink, InstitutionLink } from "../ContactLink";

export const DeploymentPanel: React.FC<{
  deployment: Deployment | undefined,
  onClose: () => void,
  disableProjectLink?: boolean;
}> = ({
        deployment,
        onClose,
        disableProjectLink = false,
      }) => {

  const [ labels, setLabels ] = useState<Array<any>>([]);
  const isOpenAccess = useMemo(() => deployment?.project.accessibility === 'Open access', [ deployment ]);
    const fetchLabels = useFetchGql(gql`
        query {
            allApiLabels(annotationresult_AnnotationCampaignPhase_AnnotationCampaign_Datasets_RelatedChannelConfiguration_DeploymentId: ${ deployment?.id }, orderBy: "id") {
                results {
                    id
                    name
                    annotationresultSet(annotationCampaignPhase_AnnotationCampaign_Datasets_RelatedChannelConfiguration_DeploymentId: ${deployment?.id}) {
                        totalCount
                    }
                }
            }
        }
    `)

  useEffect(() => {
    if (!deployment) return;
    fetchLabels().then((data: any) => {
      setLabels((data?.allApiLabels?.results ?? []).filter((d: any) => !!d) as Deployment[])
    })
  }, [ deployment ]);

  if (!deployment) return <div className={ [ styles.panel, styles.empty, styles.deployment ].join(' ') }/>

  return <div className={ styles.panel + ' ' + styles.deployment }>
    <div className={ styles.head }>
      <button onClick={ onClose }><IoClose/></button>
      { isOpenAccess && <DownloadAction deployment={ deployment }/> }
      {/*<ContactAction project={ deployment.project }/> TODO: remove or not??? */ }
    </div>
    <div className={ styles.content }>
      <Project project={ deployment.project }
               disableProjectLink={ disableProjectLink }/>

      <CampaignSite label="Site"
                    data={ deployment.site }/>

      <CampaignSite label="Campaign"
                    data={ deployment.campaign }/>

      <DeploymentInfo deployment={ deployment }/>

      <DateAndVessel label="Launch"
                     date={ deployment.deploymentDate }
                     vessel={ isOpenAccess ? deployment.deploymentVessel : null }/>

      <DateAndVessel label="Recovery"
                     date={ deployment.recoveryDate }
                     vessel={ isOpenAccess ? deployment.recoveryVessel : null }/>

      <Coordinates lat={ deployment.latitude }
                   lon={ deployment.longitude }/>

      <BathymetricDepth depth={ deployment.bathymetricDepth }/>

      { isOpenAccess && <Platform platform={ deployment.platform }/> }

      { isOpenAccess && <Labels labels={ labels }/> }

      { isOpenAccess && <Description description={ deployment.description }/> }
    </div>
  </div>
}

const DownloadAction: React.FC<{ deployment: Deployment }> = ({ deployment }) => {
  const downloadData = useMemo(() => {
    return `data:text/json;charset=utf-8,${ encodeURIComponent(JSON.stringify(deployment)) }`
  }, [ deployment ])
  return <a download={ `${ deployment.name }.json` }
            className={ styles.downloadButton }
            href={ downloadData }>
    Download <IoDownloadOutline/>
  </a>
}

const Project: React.FC<{ project: Deployment['project'], disableProjectLink: boolean }> = ({
                                                                                              project,
                                                                                              disableProjectLink
                                                                                            }) => {
  return <Fragment>
    <small>Project</small>
    <p>
      { project.name }
      { !!(project as any).websiteProject &&
          <a href={ `/projects/${ (project as any).websiteProject.id }` }> <IoOpenOutline/> </a> }
      { project.projectGoal && <Fragment>
          <br/>
          <small>{ project.projectGoal }</small>
      </Fragment> }
      { project.contacts.edges.map(e => <Fragment key={ e!.node!.id }>
        <br/>
        <small>({ e!.node!.role }:
          { e!.node!.contact && <ContactLink contact={ e!.node!.contact! }/> }
          { e!.node!.institution && <InstitutionLink institution={ e!.node!.institution! }/> }
          )</small>
      </Fragment>) }
    </p>
  </Fragment>
}

const CampaignSite: React.FC<{
  label: 'Campaign' | 'Site',
  data: Deployment['campaign'] | Deployment['site']
}> = ({ label, data }) => {
  if (!data) return <Fragment/>
  return <Fragment>
    <small>{ label }</small>
    <p>{ data.name }</p>
  </Fragment>
}

const DeploymentInfo: React.FC<{ deployment: Deployment }> = ({ deployment }) => (
  <Fragment>
    <small>Deployment</small>
    <p>
      { deployment.name }
      { deployment.contacts.edges.map(e => <small key={ e!.node!.id }>
        <br/>({ e!.node!.role }:
        { e!.node!.contact && <ContactLink contact={ e!.node!.contact! }/> }
        { e!.node!.institution && <InstitutionLink institution={ e!.node!.institution! }/> }
      </small>) }
    </p>
  </Fragment>
)

const DateAndVessel: React.FC<{
  label: 'Launch' | 'Recovery',
  date: Deployment['deploymentDate'] | Deployment['recoveryDate'],
  vessel: Deployment['deploymentVessel'] | Deployment['recoveryVessel'] | null
}> = ({ label, date, vessel }) => {
  if (!date && !vessel) return <Fragment/>
  return <Fragment>
    <small>{ label }</small>
    <p>{ [ date, vessel ].join(' - ') }</p>
  </Fragment>
}

const Coordinates: React.FC<{ lat: Deployment['latitude'], lon: Deployment['longitude'] }> = ({ lat, lon }) => (
  <Fragment>
    <small>Coordinates</small>
    <p>{ lat }, { lon }</p>
  </Fragment>
)

const BathymetricDepth: React.FC<{ depth: Deployment['bathymetricDepth'] }> = ({ depth }) => (
  <Fragment>
    <small>Bathymetric depth</small>
    <p>{ depth }</p>
  </Fragment>
)

const Platform: React.FC<{ platform: Deployment['platform'] }> = ({ platform }) => {
  if (!platform) return <Fragment/>
  return <Fragment>
    <small>Platform</small>
    <p>{ platform.name }</p>
  </Fragment>
}

const Labels: React.FC<{ labels?: any[] }> = ({ labels }) => {
  if (!labels || labels.length === 0) return <Fragment/>
  return <Fragment>
    <small>Labels</small>
    <p>
      { labels.map((label: any) => <span key={ label.id }>
        { label.name } ({ label.annotationresultSet.totalCount })
        <br/>
      </span>) }
    </p>
  </Fragment>
}

const Description: React.FC<{ description: Deployment['description'] }> = ({ description }) => {
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