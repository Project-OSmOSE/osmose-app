import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getYear, useFetchDetail, useFetchGql } from "../../../utils";
import { Project } from "../../../models/project";
import { CollaboratorsBanner } from "../../../components/CollaboratorsBanner/CollaboratorsBanner";
import { ContactList } from "../../../components/ContactList/ContactList";
import { HTMLContent } from "../../../components/HTMLContent/HTMLContent";
import { Back } from "../../../components/Back/Back";
import { DeploymentsMap } from "../../../components/DeploymentsMap";
import { DeploymentsTimeline } from "../../../components/DeploymentsTimeline";
import './ProjectDetail.css';
import { DeploymentNode, DeploymentNodeNodeConnection } from "../../../../../../metadatax-ts/src";
import { gql } from "graphql-request";

export const ProjectDetail: React.FC = () => {
  const { id: projectID } = useParams<{ id: string; }>();

  const [ project, setProject ] = useState<Project>();

  const [ deployments, setDeployments ] = useState<Array<DeploymentNode>>([]);
  const [ selectedDeployment, setSelectedDeployment ] = useState<DeploymentNode | undefined>();

  const fetchDetail = useFetchDetail<Project>('/projects', '/api/projects');
    const fetchDeployments = useFetchGql<{ allDeployments?: DeploymentNodeNodeConnection }>(gql`
        query {
            allDeployments(project_WebsiteProject_Id: ${projectID}) {
                results {
                    id,
                    name
                    latitude,
                    longitude
                    project {
                        id
                        name
                        accessibility
                        projectGoal
                    }
                    site {
                        id
                        name
                    }
                    campaign {
                        id
                        name
                    }
                    deploymentDate
                    deploymentVessel
                    recoveryDate
                    recoveryVessel
                    bathymetricDepth
                    platform {
                        id
                        name
                    }
                    description
                    contacts {
                        edges {
                            node {
                                id
                                role
                                contact {
                                    id
                                    name
                                }
                            }
                        }
                    }
                    channelConfigurations {
                        edges {
                            node {
                                id
                                recorderSpecification {
                                    id
                                    samplingFrequency
                                }
                            }
                        }
                    }
                }
            }
        }
    `)

  useEffect(() => {
    let isMounted = true;
    fetchDetail(projectID).then(project => isMounted && setProject(project));

    fetchDeployments().then(data => {
      if (!isMounted) return;
      console.log(data)
      setDeployments(((data as any)?.allDeployments?.results ?? []).filter((d: any) => !!d) as DeploymentNode[])
    })

    return () => {
      isMounted = false;
    }
  }, [ projectID ]);

  return (
    <div id="project-detail">
      <Back path="/projects" pageName="Projects"/>

      { project && (
        <div id="project">
          <div className="project-head">
            <h1>{ project.title }</h1>
            { (project.start || project.end) &&
                <p className="text-muted">
                  { getYear(project.start) ?? '...' } - { getYear(project.end) ?? '...' }
                </p> }
          </div>

          <HTMLContent content={ project.body }></HTMLContent>

          <ContactList label="Contact"
                       teamMembers={ project.osmose_member_contacts }
                       namedMembers={ project.other_contacts }></ContactList>

        </div>
      ) }

      { deployments.length > 0 && <Fragment>
          <DeploymentsMap projectID={ +projectID }
                          level='deployment'
                          allDeployments={ deployments }
                          selectedDeployment={ selectedDeployment }
                          setSelectedDeployment={ setSelectedDeployment }/>

          <DeploymentsTimeline deployments={ deployments }
                               selectedDeployment={ selectedDeployment }
                               setSelectedDeployment={ setSelectedDeployment }/>
      </Fragment> }

      { project?.collaborators && <CollaboratorsBanner collaborators={ project.collaborators }></CollaboratorsBanner> }
    </div>
  )
}
