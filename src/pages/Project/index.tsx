import { PageTitle } from '../../components/PageTitle';
import { Card } from '../../components/Card';
import { Banner } from '../../components/Banner';

import './styles.css';
import imgProject from '../../img/illust/pexels-elianne-dipp-4666753_1280_thin.jpg';
import imgNutshell from '../../img/illust/640px-Petit_Minou_Lighthouse_(50691630801)_640_428.webp';
import imgMissions from '../../img/illust/thumbnail_4_Paysage_sonore_800_449.webp';
import logoofb from '../../img/logo/logo_ofb.png';
import logoisblue from '../../img/logo/logo_isblue3.png';
import logothales from '../../img/logo/logo_thales2.png';
import logoFAIR from '../../img/logo/logo_fairlogo.png';

export const Project: React.FC = () => {
  
  return (
<div className="project">

  <PageTitle
  img={imgProject}
  imgAlt="Meet Banner"
  // imgSet=""
  >
    <h1>
      Meet
    </h1>
  </PageTitle>

  <section className="container my-5">
    <Card
    title="In a nutshell"
    img={imgNutshell}
    imgSide="right"
    // imgAlt="Groupe de dauphins"
    // subtitle=""
    url="/people"
    urlDesc="Learn more about our team."
    >
      <p>
      OSmOSE (Open Science meets Ocean Sound Explorers) is a multi-institutional research consortium addressing underwater passive acoustics methodological questions within projects dedicated to ocean sustainability. <br/>
      OSmOSE, composed of marine biologists, acousticians, data scientists and computer professionals, was launched in Brest (France) in 2018.
      </p>
    </Card>
  </section>

  <Banner>
    <p>
      <span className="spring">4</span> <br/>
      partners
    </p>
    <p>
      <span className="spring">7</span> <br/>
      members
    </p>
    <p>
      <span className="spring">3</span> <br/>
      collaborative studies <br/>
    </p>
  </Banner>

  <section className="container my-5">
    <Card
    title="Our missions"
    img={imgMissions}
    imgSide="left"
    imgAlt="Groupe de dauphins"
    // subtitle=""
    // url=""
    // urlDesc=""
    >

        <strong>Technology development</strong> 
        <ul>
          <li>create open-source standalone analysis tools </li> 
          <li> integrate our tools in workflows hosted in a sustainable collaborative platform </li>
        </ul>

        <strong>Scientific expertise</strong>
        <ul>
          <li> build a scientific community and assist the members in the use of data science technologies</li>
          <li> facilitate collaborative interactions between members</li>
          <li>build a scientific community and assist  members in the use of our tools</li>
          <li> perform meta-analysis, disseminated via reviewed reports</li>
          <li> provide consulting expertise for various conservation organizations </li>
        </ul>
    </Card>
  </section>

  <Banner>
    <p>
      <span className="spring">13</span> <br/>
      datasets
    </p>
    <p>
      <span className="spring">13 TB</span> <br/>
      raw data
    </p>
    <p>
      <span className="spring">4</span> <br/>
      annotation campaigns <br/>
    </p>
    <p>
      <span className="spring">10</span> <br/>
      annotation classes <br/>
    </p>
  </Banner>

  <section className="container my-5">
    <Card
    title="Our values"
    img={logoFAIR}
    imgSide="right"
    // imgAlt=""
    // subtitle=""
    // url=""
    // urlDesc=""
    >
      <p>
      We work towards applying open science / FAIR principles to underwater passive acoustics.
      </p>

      <blockquote className="blockquote text-center">
        <p>
          « Open science refers to the unhindered dissemination of results, methods and products from scientific research. It draws on the opportunity provided by recent digital progress to develop open access to publications and - as much as possible - data, source code and research methods. »
        </p>
        <footer className="blockquote-footer"><a href="https://www.ouvrirlascience.fr/second-national-plan-for-open-science/"> ouvrirlascience.fr</a></footer>
      </blockquote>

        {/* Nous nous attachons à développer des solutions facilement réutilisables en suivant les <a href="https://www.go-fair.org/fair-principles/">principes FAIR</a>. <br/>
        Dans cette optique nous mettons à disposition en open source toute notre technologie afin de permettre à tous d'en profiter. */}

    </Card>
  </section>

  <div className="container my-5">
    <h2>Funders</h2>
  </div>

  <Banner>
    <img className="" src={logoofb} alt="AFB logo" title="AFB logo" />
    <img className="" src={logoisblue} alt="ISblue logo" title="ISblue logo" />
    <img className="" src={logothales} alt="Thales Underwater systems logo" title="Thales Underwater systems logo" />
  </Banner>

  {/* Section technologie ?  */}

  {/* Section collaborer ?  */}

</div>
);
}
