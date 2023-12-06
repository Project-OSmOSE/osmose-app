import { PageTitle } from "../../components/PageTitle";

import imgTitle from '../../img/illust/sperm-whale-tail_1920_thin.webp';

import './styles.css';

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchPage, getYear } from "../../utils";
import { Project } from "../../models/project";
import { IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle } from "@ionic/react";
import { Pagination } from "../../components/Pagination";

const PROJECTS_URL = '/api/projects';


export const Projects: React.FC = () => {
    const pageSize = 6;

    const location = useLocation();
    const currentPage: number = +(new URLSearchParams(location.search).get('page') ?? 1);

    const [projectsTotal, setProjectsTotal] = useState<number>(0);
    const [projects, setProjects] = useState<Array<Project>>([]);
    useEffect(() => {
        fetchPage(PROJECTS_URL, { currentPage, pageSize })
            .then(data => {
                setProjectsTotal(data.count);
                setProjects(data.results);
            })
    }, [currentPage]);

    return (
        <div id="projects-page">
            <PageTitle img={ imgTitle } imgAlt="Project Banner">
                PROJECTS
            </PageTitle>

          <div className="content">
            { projects.map(data => (
              <IonCard key={ data.id } href={ `/projects/${ data.id }` }>
                { data.thumbnail && <img src={ data.thumbnail } alt={ data.title }/> }

                <IonCardHeader>
                  <IonCardTitle>{ data.title }</IonCardTitle>
                  { (data.start || data.end) &&
                      <IonCardSubtitle>
                        { getYear(data.start) ?? '...'} - { getYear(data.end) ?? '...'}
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
