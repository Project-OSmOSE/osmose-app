import { PageTitle } from '../../components/PageTitle';
import { Card } from '../../components/Card';
import { Banner } from '../../components/Banner';

import imgProject from '../../img/illust/pexels-elianne-dipp-4666753_1280_thin.jpg';
import imgNutshell from '../../img/illust/640px-Petit_Minou_Lighthouse_(50691630801)_640_428.webp';
import imgMissions from '../../img/illust/thumbnail_4_Paysage_sonore_800_449.webp';
import logoFAIR from '../../img/logo/logo_fairlogo.png';

import logoofb from '../../img/logo/logo_ofb.png';
import sorbonneLogo from '../../img/logo/Logo-Sorbonne-Universite-300x122.png';	
import enstalogo from '../../img/logo/logo-ensta-bretagne.png';	
import ubologo from '../../img/logo/logo-ubo.png';	
import labsticlogo from '../../img/logo/logo-lab-sticc.png';	
import iuemLogo from '../../img/logo/iuem.jpeg';
import cebcLogo from '../../img/logo/cebc.png';


export const Home: React.FC = () => {

  return (
<div id="homepage">

  <PageTitle
  img={imgProject}
  imgAlt="Meet Banner"
  // imgSet=""
  >
    <h1>
      Open Science meets Ocean Sound Explorers
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

  {/* <Banner>
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
  </Banner> */}

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

  {/* <Banner>
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
  </Banner> */}

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

      <blockquote className="text-center">
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
    <h2>Collaborators & Funders</h2>
  </div>
  <Banner>
    <img className="" src={enstalogo} alt="Ensta Bretagne logo" title="Ensta Bretagne logo" />
    {/* <img className="" src={ifremerlogo} alt="IFREMER logo" title="IFREMER logo" /> */}
    <img className="" src={labsticlogo} alt="Lab-Stic logo" title="Lab-Stic logo" />
    <img className="" src={ubologo} alt="UBO logo" title="UBO logo" />
    <img className="" src={iuemLogo} alt="IUEM logo" title="IUEM logo" />	
    <img className="" src={sorbonneLogo} alt="Sorbonne Université logo" title="Sorbonne Université logo" />	
    <img className="" src={cebcLogo} alt="CEBC logo" title="CEBC logo" />
    <img className="" src={logoofb} alt="AFB logo" title="AFB logo" />
  </Banner>

</div>
);
}
