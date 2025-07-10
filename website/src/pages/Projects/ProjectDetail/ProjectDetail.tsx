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
import { gql } from "graphql-request";

export type Deployment = {
  id: string;
  name: number;
  latitude: number;
  longitude: number;
  project: {
    id: string;
    name: number;
    accessibility: string;
    projectGoal: string;
    contacts: {
      edges: {
        node: {
          id: string;
          role: string;
          contact: {
            id: string;
            name: string;
            website: string;
          }
        }
      }[]
    }
  }
  site: {
    id: string;
    name: string;
  }
  campaign: {
    id: string;
    name: string;
  }
  platform: {
    id: string;
    name: string;
  }
  deploymentDate: string;
  deploymentVessel: string;
  recoveryDate: string;
  recoveryVessel: string;
  bathymetricDepth: number;
  description: string;
  contacts: {
    edges: {
      node: {
        id: string;
        role: string;
        contact: {
          id: string;
          name: string;
          website: string;
        }
      }
    }[]
  }
  channelConfigurations: {
    edges: {
      node: {
        id: string;
        recorderSpecification: {
          id: string;
          samplingFrequency: number;
        }
      }
    }[]
  }
}

export const ProjectDetail: React.FC = () => {
  const { id: projectID } = useParams<{ id: string; }>();

  const [ project, setProject ] = useState<Project>();

  const [ deployments, setDeployments ] = useState<Array<Deployment>>([]);
  const [ selectedDeployment, setSelectedDeployment ] = useState<any | undefined>();

  const fetchDetail = useFetchDetail<Project>('/projects', '/api/projects');
    const fetchDeployments = useFetchGql<{ allDeployments?: { results: Deployment[] } }>(gql`
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
      setDeployments((data?.allDeployments?.results ?? []).filter((d: any) => !!d) as Deployment[])
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

          <DeploymentsTimeline deployments={ deployments as any }
                               selectedDeployment={ selectedDeployment as any }
                               setSelectedDeployment={ setSelectedDeployment }/>
      </Fragment> }

      { project?.collaborators && <CollaboratorsBanner collaborators={ project.collaborators }></CollaboratorsBanner> }
    </div>
  )
}
