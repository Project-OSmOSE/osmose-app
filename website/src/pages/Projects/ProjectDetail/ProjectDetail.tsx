import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Project } from "../../../models/project";
import { getYear, useFetchDetail } from "../../../utils";
import { IonIcon } from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { ContactList } from "../../../components/ContactList/ContactList";
import { HTMLContent } from "../../../components/HTMLContent/HTMLContent";
import './ProjectDetail.css';
import { CollaboratorsBanner } from "../../../components/CollaboratorsBanner/CollaboratorsBanner";
import { News } from "../../../models/news";

export const ProjectDetail: React.FC = () => {
  const { id: projectID } = useParams<{ id: string; }>();

  const [project, setProject] = useState<Project>();

  const fetchDetail = useFetchDetail<Project>('/projects', '/api/projects');

  useEffect(() => {
    fetchDetail(projectID).then(setProject);
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