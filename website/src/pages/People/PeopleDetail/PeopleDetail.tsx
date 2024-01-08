import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { TeamMember } from "../../../models/team";
import './PeopleDetail.css';
import { useFetchDetail } from "../../../utils";
import { IonIcon } from "@ionic/react";
import { logoGithub, logoLinkedin, mailOutline } from "ionicons/icons";
import { Back } from "../../../components/Back/Back";
import './PeopleDetail.css';

export const PeopleDetail: React.FC = () => {
  const { id: memberID } = useParams<{ id: string; }>();
  const [member, setMember] = useState<TeamMember>();

  const fetchDetail = useFetchDetail<TeamMember>('/people', '/api/members');

  useEffect(() => {
    fetchDetail(memberID).then(setMember);
  }, [memberID]);


  return (
    <div id="member-page">
      <Back path="/people" pageName="People"></Back>

      <div className="title">
        <h2>{ member?.firstname } { member?.lastname }</h2>
        <h5 className="text-muted">{ member?.position }</h5>
      </div>

      <img src={ member?.picture } alt={ `${ member?.firstname } ${ member?.lastname }'s Portrait` }/>

      <blockquote>❝&nbsp;{ member?.biography }&nbsp;❞</blockquote>

      <div className="links">
        { member?.research_gate_url && <a href={ member.research_gate_url } target="_blank"  rel="noreferrer">ResearchGate</a> }

        { member?.personal_website_url &&
            <a href={ member.personal_website_url } target="_blank"  rel="noreferrer">Personal website</a> }

        <div className="socials">
          { member?.github_url &&
              <a href={ member.github_url } target="_blank"  rel="noreferrer">
                  <IonIcon icon={ logoGithub }></IonIcon>
                  Github
              </a>
          }

          { member?.mail_address &&
              <a href={ `mailto:${ member.mail_address }` } target="_blank"  rel="noreferrer">
                  <IonIcon icon={ mailOutline }></IonIcon>
                  Mail
              </a>
          }

          { member?.linkedin_url &&
              <a href={ member.linkedin_url } target="_blank"  rel="noreferrer">
                  <IonIcon icon={ logoLinkedin }></IonIcon>
                  LinkedIn
              </a>
          }
        </div>
      </div>
    </div>
  )
}
