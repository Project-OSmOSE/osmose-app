import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { TeamMember } from "../../../models/team";
import './PeopleDetail.css';
import { API_FETCH_INIT } from "../../../utils";
import { IonIcon } from "@ionic/react";
import { logoGithub, logoLinkedin, mailOutline } from "ionicons/icons";
import { Back } from "../../../components/Back/Back";

const MEMBERS_URL = '/api/members';

export const PeopleDetail: React.FC = () => {
  const memberID = Number(useParams<{ id: string; }>().id);
  const [member, setMember] = useState<TeamMember>();

  console.debug(memberID)

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`${ MEMBERS_URL }/${ memberID }`, API_FETCH_INIT);
        if (!response.ok) {
          console.error(`Cannot fetch member ${ memberID }, got error: [${ response.status }] ${ response.statusText }`);
          return;
        }
        setMember(await response.json())
      } catch (error) {
        console.error(`Cannot fetch member ${ memberID }, got error: ${ error }`);
      }
    }
    fetchMember();
  }, []);

  useEffect(() => {
    console.debug(member)
  }, [member]);


  return (
    <div id="member-page">
      <Back path="/people" pageName="People"></Back>

      <div className="title">
        <h2>{ member?.name }</h2>
        <h5 className="text-muted">{ member?.position }</h5>
      </div>

      <img src={ member?.picture } alt={ member?.name }/>

      <blockquote>❝ { member?.biography } ❞</blockquote>

      <div className="links">
        { member?.research_gate_url && <a href={ member.research_gate_url } target="_blank">ResearchGate</a> }

        { member?.personal_website_url &&
            <a href={ member.personal_website_url } target="_blank">Personnal website</a> }

        <div className="socials">
          { member?.github_url &&
              <a href={ member.github_url } target="_blank">
                  <IonIcon icon={ logoGithub }></IonIcon>
                  Github
              </a>
          }

          { member?.mail_address &&
              <a href={ `mailto:${ member.mail_address }` } target="_blank">
                  <IonIcon icon={ mailOutline }></IonIcon>
                  Mail
              </a>
          }

          { member?.linkedin_url &&
              <a href={ member.linkedin_url } target="_blank">
                  <IonIcon icon={ logoLinkedin }></IonIcon>
                  LinkedIn
              </a>
          }
        </div>
      </div>
    </div>
  )
}
