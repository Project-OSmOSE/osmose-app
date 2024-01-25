import React, { useEffect, useState } from 'react';

import { PageTitle } from '../../components/PageTitle';
import { Card } from '../../components/Card';
import { Carousel } from '../../components/Carousel/Carousel';

import './HomePage.css';
import imgTitle from '../../img/illust/dolphin_1920_thin.webp';
import imgGlider from '../../img/illust/glider_640.webp';
import imgMissions from '../../img/illust/thumbnail_4_Paysage_sonore_800_449.webp';
import logoFAIR from '../../img/logo/logo_fairlogo.png';
import { CollaboratorsBanner } from "../../components/CollaboratorsBanner/CollaboratorsBanner";
import { useFetchArray } from "../../utils";
import { Collaborator } from "../../models/collaborator";

export const HomePage: React.FC = () => {

  const [collaborators, setCollaborators] = useState<Array<Collaborator> | undefined>();

  const fetchCollaborators = useFetchArray<Array<Collaborator>>('/api/collaborators/on_home/');

  useEffect(() => {
    let isMounted = true;
    fetchCollaborators().then(collaborators => isMounted && setCollaborators(collaborators));

    return () => {
      isMounted = false;
    }
  }, [])

  return (
    <div id="home-page">

      <PageTitle img={ imgTitle } imgAlt="Homepage Banner">
        Open Science meets Ocean Sound Explorers
      </PageTitle>

      <section className="container my-5">
        <Carousel/>
      </section>

      <section className="container my-5">
        <Card title="In a nutshell"
              img={ imgGlider }
              imgSide="right"
              imgAlt="Glider"
              url="/people">
          <p>
            Hello, we are OSmOSE ; a consortium of data scientists and ocean researchers developing open source tools
            and services for underwater passive acoustics. It all started in Brest (French Brittany) in 2018, with the
            diagnosis that our community was lacking a common ground to compare our methods and highlight our results.
            To address this situation, our data processing tools aim to standardize and provide easy access to various
            routine tasks, from manual annotation to related AI workflows for detection and classification of sounds
            events. This is the cornerstone of most underwater passive acoustic applications.
          </p>
        </Card>
      </section>

      <section className="container my-5">
        <Card title="Our missions"
              img={ imgMissions }
              imgSide="left"
              imgAlt="Groupe de dauphins">
          <strong>Technology development</strong>
          <ul>
            <li> create open-source standalone analysis tools</li>
            <li> integrate our tools in workflows hosted in a sustainable collaborative platform</li>
          </ul>

          <strong>Scientific expertise</strong>
          <ul>
            <li> build a scientific community and assist the members in the use of data science technologies</li>
            <li> facilitate collaborative interactions between members</li>
            <li> build a scientific community and assist members in the use of our tools</li>
            <li> perform meta-analysis, disseminated via reviewed reports</li>
            <li> provide consulting expertise for various conservation organizations</li>
          </ul>
        </Card>
      </section>

      <section className="container my-5">
        <Card title="Our values"
              img={ logoFAIR }
              imgSide="right">
          <p>
            We work towards applying open science / FAIR principles to underwater passive acoustics.
          </p>

          <blockquote className="text-center">
            <p>
              « Open science refers to the unhindered dissemination of results, methods and products from scientific
              research. It draws on the opportunity provided by recent digital progress to develop open access to
              publications and - as much as possible - data, source code and research methods. »
            </p>
            <footer className="blockquote-footer"><a
              href="https://www.ouvrirlascience.fr/second-national-plan-for-open-science/"> ouvrirlascience.fr</a>
            </footer>
          </blockquote>
        </Card>
      </section>

      <CollaboratorsBanner collaborators={collaborators}></CollaboratorsBanner>

    </div>
  )
}
