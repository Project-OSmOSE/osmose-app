import React from 'react';
import { Card } from '../../components/Card';

import './styles.css';
import logo from '../../images/logo_OSmOSE_neg.png'
import projectImg from '../../images/logo_project.png';
import peopleImg from '../../images/logo_people.png';

export const Home: React.FC = () => {
  return (
    <div className="home">
      <img src={logo} alt="OSmOSE logo: Open Science meets Ocean Sound Explorers" />
      <section>
        <Card title="Project Overview" detailsUrl="/project" img={projectImg}>
          <p>OSmOSE aims to facilitate interactions between the different <strong>Underwater Passive Acoustics (UPA)</strong> actors, to achieve more collaborative works, i.e. tend to the FAIR principles.</p>
          <p>How? Through open sciences and active collaboration on one (Science) side, and developing big data oriented and web based tools on the other (Technology) side.</p>
        </Card>
      </section>
      <section>
        <Card title="People" detailsUrl="/people" img={peopleImg} imgSide="right">
          <p>OSmOSE is made of several teams working togeter:</p>
          <ul>
            <li><strong>ODE (Ocean Data Explorer)</strong>: develop all the computer technology used to manage and process Data (at scale with speed and in context, naturally Big)</li>
            <li><strong>AIe</strong>: Develop all the computer technology used to mage computers learn and recognize ocean sounds like humans</li>
            <li><strong>Underwater Passive Acoustics sciences</strong>: do all the ocean science based on UPA (mainly about whale monitoring and conservation for the moment)</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}
