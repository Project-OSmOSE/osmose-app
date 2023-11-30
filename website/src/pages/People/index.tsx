import React, { useEffect, useState } from "react";
import { PageTitle } from '../../components/PageTitle';
import { CardMember } from '../../components/CardMember';
import imgTitle from '../../img/illust/pexels-daniel-torobekov-5901263_1280_thin.jpg';
import { TeamMember } from "../../models/team";
import { API_FETCH_INIT } from "../../utils";

import './styles.css';

const MEMBERS_URL = '/api/members';

export const People: React.FC = () => {

    const [members, setMembers] = useState<Array<TeamMember>>([])

    useEffect(() => {
        const fetchMembers = async () => {
            const response = await fetch(MEMBERS_URL, API_FETCH_INIT);
            if (!response.ok) throw new Error(`[${ response.status }] ${ response.statusText }`);
            setMembers(await response.json());
        }
        fetchMembers().catch(error => console.error(`Cannot fetch members, got error: ${ error }`));
    }, []);

    return (
        <div id="people-page">

            <PageTitle img={ imgTitle } imgAlt="People Banner">
                PEOPLE
            </PageTitle>

            <section>
                <div className="members-grid">
                    {
                        members.filter(member => !member.isFormerMember)
                            .map(member => (<CardMember key={ member.id } member={ member }></CardMember>))
                    }
                </div>
                <h2>Former members</h2>
                <div className="members-grid">
                    {
                        members.filter(member => member.isFormerMember)
                            .map(member => (<CardMember key={ member.id } member={ member }></CardMember>))
                    }
                </div>
            </section>

        </div>
    );
}
