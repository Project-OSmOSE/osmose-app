import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getYear, useFetchDetail } from "../../../utils";
import { Project } from "../../../models/project";
import { CollaboratorsBanner } from "../../../components/CollaboratorsBanner/CollaboratorsBanner";
import { ContactList } from "../../../components/ContactList/ContactList";
import { HTMLContent } from "../../../components/HTMLContent/HTMLContent";
import { Back } from "../../../components/Back/Back";
import { DeploymentsMap } from "../../../components/DeploymentsMap";
import './ProjectDetail.css';
import { DeploymentAPI, DeploymentService } from "@PAM-Standardization/metadatax-ts";
import { DeploymentsTimeline } from "../../../components/DeploymentsTimeline";

export const ProjectDetail: React.FC = () => {
  const { id: projectID } = useParams<{ id: string; }>();

  const [ project, setProject ] = useState<Project>();

  const [ deployments, setDeployments ] = useState<Array<DeploymentAPI>>([]);
  const [ selectedDeployment, setSelectedDeployment ] = useState<DeploymentAPI | undefined>();

  const fetchDetail = useFetchDetail<Project>('/projects', '/api/projects');

  useEffect(() => {
    let isMounted = true;
    fetchDetail(projectID).then(project => isMounted && setProject(project));

    DeploymentService.list(`/api/projects/${ projectID }/deployments`)
      .then(deployments => {
        if (!isMounted) return;
        setDeployments(deployments)
      });

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
                       teamMembers={ project.contact }></ContactList>

        </div>
      ) }

      <DeploymentsMap projectID={ +projectID }
                      deployments={ deployments }
                      selectedDeployment={ selectedDeployment }
                      setSelectedDeployment={ setSelectedDeployment }/>

      <DeploymentsTimeline deployments={ deployments }
                           selectedDeployment={ selectedDeployment }
                           setSelectedDeployment={ setSelectedDeployment }/>

      { project?.collaborators && <CollaboratorsBanner collaborators={ project.collaborators }></CollaboratorsBanner> }
    </div>
  )
}
