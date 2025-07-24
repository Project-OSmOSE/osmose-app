import { PageTitle } from "../../components/PageTitle";

import imgTitle from '../../img/illust/sperm-whale-tail_1920_thin.webp';

import './Projects.css';

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getYear, useFetchArray, useFetchGql } from "../../utils";
import { Project } from "../../models/project";
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";
import { Pagination } from "../../components/Pagination/Pagination";
import { DeploymentsMap } from "../../components/DeploymentsMap";
import { gql } from "graphql-request";
import { Deployment } from "./ProjectDetail/ProjectDetail";


export const Projects: React.FC = () => {
  const pageSize = 6;

  const location = useLocation();
  const currentPage: number = +(new URLSearchParams(location.search).get('page') ?? 1);

  const [ projectsTotal, setProjectsTotal ] = useState<number>(0);
  const [ projects, setProjects ] = useState<Array<Project>>([]);

  const [ deployments, setDeployments ] = useState<Array<Deployment>>([]);
  const [ selectedDeployment, setSelectedDeployment ] = useState<Deployment | undefined>();

  const fetchProjects = useFetchArray<{ count: number, results: Array<Project> }>('/api/projects');
    const fetchDeployments = useFetchGql<{ allDeployments?: { results: Deployment[] } }>(gql`
        query {
            allDeployments {
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
                        contacts {
                            edges {
                                node {
                                    id
                                    contact {
                                        id
                                        firstName
                                        lastName
                                        website
                                    }
                                    role
                                }
                            }
                        }
                        websiteProject {
                            id
                        }
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
                                    firstName
                                    lastName
                                    website
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
    fetchProjects({ page: currentPage, page_size: pageSize }).then(data => {
      if (!isMounted) return;
      setProjectsTotal(data?.count ?? 0);
      setProjects(data?.results ?? []);
    });

    fetchDeployments().then(data => {
      if (!isMounted) return;
      setDeployments((data?.allDeployments?.results ?? []).filter(d => !!d) as Deployment[])
    })

    return () => {
      isMounted = false;
    }
  }, [ currentPage ]);

  return (
    <div id="projects-page">
      <PageTitle img={ imgTitle } imgAlt="Project Banner">
        PROJECTS
      </PageTitle>

      <div className="content">

        <DeploymentsMap allDeployments={ deployments }
                        level='project'
                        selectedDeployment={ selectedDeployment }
                        setSelectedDeployment={ setSelectedDeployment }/>

        { projects.map(data => (
          <IonCard key={ data.id } href={ `/projects/${ data.id }` }>
            { data.thumbnail && <img src={ data.thumbnail } alt={ data.title }/> }

            <IonCardHeader>
              <IonCardTitle>{ data.title }</IonCardTitle>
              { (data.start || data.end) &&
                  <IonCardSubtitle>
                    { getYear(data.start) ?? '...' } - { getYear(data.end) ?? '...' }
                  </IonCardSubtitle> }
            </IonCardHeader>

            <IonCardContent>{ data.intro }</IonCardContent>
          </IonCard>
        )) }
      </div>

      <Pagination totalCount={ projectsTotal }
                  currentPage={ currentPage }
                  pageSize={ pageSize }
                  path="/projects"/>
    </div>
  );
};
