import { PageTitle } from "../../components/PageTitle";

import imgTitle from '../../img/illust/sperm-whale-tail_1920_thin.webp';

import './Projects.css';

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getYear, useFetchArray } from "../../utils";
import { Project } from "../../models/project";
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";
import { Pagination } from "../../components/Pagination/Pagination";
import { DeploymentsMap } from "../../components/DeploymentsMap";
import { DeploymentAPI, DeploymentService } from "@PAM-Standardization/metadatax-ts";


export const Projects: React.FC = () => {
  const pageSize = 6;

  const location = useLocation();
  const currentPage: number = +(new URLSearchParams(location.search).get('page') ?? 1);

  const [ projectsTotal, setProjectsTotal ] = useState<number>(0);
  const [ projects, setProjects ] = useState<Array<Project>>([]);

  const [ deployments, setDeployments ] = useState<Array<DeploymentAPI>>([]);
  const [ selectedDeployment, setSelectedDeployment ] = useState<DeploymentAPI | undefined>();

  const fetchProjects = useFetchArray<{ count: number, results: Array<Project> }>('/api/projects');

  useEffect(() => {
    let isMounted = true;
    fetchProjects({ currentPage, pageSize }).then(data => {
      if (!isMounted) return;
      setProjectsTotal(data?.count ?? 0);
      setProjects(data?.results ?? []);
    });

    DeploymentService.list(`/api/projects/deployments`)
      .then(deployments => {
        if (!isMounted) return;
        setDeployments(deployments)
      });

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
