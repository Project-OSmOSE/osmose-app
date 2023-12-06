import React, { useEffect, useState } from "react";
import { PageTitle } from '../../components/PageTitle';
import { CardMember } from '../../components/CardMember/CardMember';
import imgTitle from '../../img/illust/pexels-daniel-torobekov-5901263_1280_thin.jpg';
import { TeamMember } from "../../models/team";
import { fetchPage } from "../../utils";

import './People.css';

const MEMBERS_URL = '/api/members';

export const People: React.FC = () => {

  const [members, setMembers] = useState<Array<TeamMember>>([])

  useEffect(() => {
    fetchPage(MEMBERS_URL)
      .then(data => setMembers(data));
  }, []);

  return (
    <div id="people-page">

      <PageTitle img={ imgTitle } imgAlt="People Banner">
          OUR TEAM
      </PageTitle>

      <section>
        <div className="members-grid">
          {
            members.filter(member => !member.is_former_member)
              .map(member => (<CardMember key={ member.id } member={ member }></CardMember>))
          }
        </div>
        <h2>Former members</h2>
        <div className="members-grid">
          {
            members.filter(member => member.is_former_member)
              .map(member => (<CardMember key={ member.id } member={ member }></CardMember>))
          }
        </div>
      </section>

    </div>
  );
}
