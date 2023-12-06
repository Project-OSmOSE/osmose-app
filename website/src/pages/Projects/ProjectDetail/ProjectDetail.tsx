import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Project } from "../../../models/project";
import { fetchPage, getYear } from "../../../utils";
import { IonIcon } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { ContactList } from "../../../components/ContactList/ContactList";
import { HTMLContent } from "../../../components/HTMLContent/HTMLContent";
import './ProjectDetail.css';
import { CollaboratorsBanner } from "../../../components/CollaboratorsBanner/CollaboratorsBanner";

const PROJECT_DETAIL_URL = '/api/projects';

export const ProjectDetail: React.FC = () => {
  const urlParams: any = useParams();
  const projectID = Number(urlParams.id);

  const [project, setProject] = useState<Project>();
  useEffect(() => {
    fetchPage(`${ PROJECT_DETAIL_URL }/${ projectID }`)
      .then(data => setProject(data));
  }, [projectID]);

  return (
    <div id="project-detail">
      <Link to="/projects" className="back">
        <IonIcon icon={ chevronBackOutline }></IonIcon>
        Back to Project
      </Link>

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

      { project?.collaborators && <CollaboratorsBanner collaborators={ project.collaborators }></CollaboratorsBanner>}
    </div>
  )
}