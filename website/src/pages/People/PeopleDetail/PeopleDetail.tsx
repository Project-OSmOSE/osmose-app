import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SiGithub, SiLinkedin, SiResearchgate } from "react-icons/si";
import { IoMailOutline } from "react-icons/io5";
import { useFetchDetail } from "../../../utils";
import { TeamMember } from "../../../models/team";
import { Back } from "../../../components/Back/Back";
import './PeopleDetail.css';

export const PeopleDetail: React.FC = () => {
  const { id: memberID } = useParams<{ id: string; }>();
  const [member, setMember] = useState<TeamMember>();

  const fetchDetail = useFetchDetail<TeamMember>('/people', '/api/members');

  useEffect(() => {
    let isMounted = true;
    fetchDetail(memberID).then(member => isMounted && setMember(member));

    return () => {
      isMounted = false;
    }
  }, [memberID]);


  return (
    <div id="member-page">
      <Back path="/people" pageName="People"></Back>

      <div className="title">
        <h2>{ member?.firstname } { member?.lastname }</h2>
        <h5 className="text-muted">{ member?.position }</h5>
      </div>

      <img src={ member?.picture } alt={ `${ member?.firstname } ${ member?.lastname }'s Portrait` }/>

      { member?.biography && <blockquote>❝&nbsp;{ member?.biography }&nbsp;❞</blockquote> }

      <div className="links">

        { member?.personal_website_url &&
            <a href={ member.personal_website_url } target="_blank" rel="noreferrer">Personal website</a> }

        { member?.research_gate_url &&
            <a href={ member.research_gate_url } target="_blank" rel="noreferrer">
                <SiResearchgate/>
                ResearchGate
            </a> }

        <div className="socials">
          { member?.github_url &&
              <a href={ member.github_url } target="_blank" rel="noreferrer">
                  <SiGithub/>
                  Github
              </a>
          }

          { member?.mail_address &&
              <a href={ `mailto:${ member.mail_address }` } target="_blank" rel="noreferrer">
                  <IoMailOutline/>
                  Mail
              </a>
          }

          { member?.linkedin_url &&
              <a href={ member.linkedin_url } target="_blank" rel="noreferrer">
                  <SiLinkedin/>
                  LinkedIn
              </a>
          }
        </div>
      </div>
    </div>
  )
}
