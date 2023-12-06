import React, {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";

import {TeamMember} from "../../models/team";
import './styles.css';
import {API_FETCH_INIT} from "../../utils";
import {IonIcon} from "@ionic/react";
import {chevronBackOutline, logoGithub, logoLinkedin, mailOutline} from "ionicons/icons";

const MEMBERS_URL = '/api/members';

export const Member: React.FC = () => {
    const memberID = Number(useParams<{ id: string; }>().id);
    const [member, setMember] = useState<TeamMember>();

    console.debug(memberID)

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await fetch(`${MEMBERS_URL}/${memberID}`, API_FETCH_INIT);
                if (!response.ok) {
                    console.error(`Cannot fetch member ${memberID}, got error: [${response.status}] ${response.statusText}`);
                    return;
                }
                setMember(await response.json())
            } catch (error) {
                console.error(`Cannot fetch member ${memberID}, got error: ${error}`);
            }
        }
        fetchMember();
    }, []);

    useEffect(() => {
        console.debug(member)
    }, [member]);


    return (
        <div id="member-page">
            <Link to="/people" className="back">
                <IonIcon icon={chevronBackOutline}></IonIcon>
                Back to People
            </Link>

            <div className="title">
                <h2>{member?.name}</h2>
                <h5 className="text-muted">{member?.position}</h5>
            </div>

            <img src={member?.picture} alt={member?.name}/>

            <blockquote>❝ {member?.biography} ❞</blockquote>

            <div className="links">
                {member?.researchGateURL && <a href={member.researchGateURL} target="_blank" rel="noreferrer">ResearchGate</a>}

                {member?.personalWebsiteURL && <a href={member.personalWebsiteURL} target="_blank" rel="noreferrer">Personnal website</a>}

                <div className="socials">
                    {member?.githubURL &&
                        <a href={member.githubURL} target="_blank" rel="noreferrer">
                            <IonIcon icon={logoGithub}></IonIcon>
                            Github
                        </a>
                    }

                    {member?.mailAddress &&
                        <a href={`mailto:${member.mailAddress}`} target="_blank" rel="noreferrer">
                            <IonIcon icon={mailOutline}></IonIcon>
                            Mail
                        </a>
                    }

                    {member?.linkedinURL &&
                        <a href={member.linkedinURL} target="_blank" rel="noreferrer">
                            <IonIcon icon={logoLinkedin}></IonIcon>
                            LinkedIn
                        </a>
                    }
                </div>
            </div>
        </div>
    )
}
