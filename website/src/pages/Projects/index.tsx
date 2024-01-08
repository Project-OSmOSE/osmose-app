import {PageTitle} from "../../components/PageTitle";

import imgTitle from '../../img/illust/sperm-whale-tail_1920_thin.webp';

import './styles.css';

// APOCADO imgs
import soundtrapImg from '../../img/projects/soundtrap.png';
import apocadoImg from '../../img/projects/apocado.png';
// CETIROISE imgs
import franceRelanceImg from '../../img/projects/france-relance.png';
import cetiroiseImg from '../../img/projects/cetiroise.webp';
import shortMooringImg from '../../img/projects/short-mooring.jpg';
import mooringLineImg from '../../img/projects/mooring-line.png';
import logoofb from "../../img/logo/logo_ofb.png";
import logoPnmIroise from "../../img/logo/logo_pnm_iroise.png";
import logoCNES from "../../img/logo/logo_cnes.jpg";
import React from "react";


export const Projects: React.FC = () => {
  return (
    <div id="projects-page">
      <PageTitle img={imgTitle} imgAlt="Project Banner">
          PROJECTS
      </PageTitle>

      <div className="container">
        <article>

          <h2>APOCADO - Studying the interactions between common dolphins and fishing nets with passive acoustic monitoring</h2>
          <small className="text-muted">2021-2023</small>
          <figure>
            <img
                src={logoofb}
                alt="AFB logo"
                className="logo rounded mx-auto d-block img-fluid"
            />
          </figure>
          {/* <p>
            Le phénomène de captures accidentelles de delphinidés par les engins de pêche est connu des professionnels mais peu de données sont disponibles. Cette méconnaissance rend la mise en place des solutions techniques efficaces et adaptées au comportement du dauphin très difficile. L’objectif du projet APOCADO est d’acquérir de la connaissance sur cette interaction en utilisant l’acoustique passive. Il s’agit de placer des enregistreurs sur les filets des pêcheurs et d’enregistrer en continu les interactions delphinidé/filet en mer d’Iroise. Certains critères seront analysés tels que le type de filet utilisé, la saison et la zone de pêche par exemple. Les odontocètes produisent plusieurs sortes de cris, parmi eux figurent les sifflements qui sont généralement assimilés à des comportements sociaux ou encore les clics et buzzs qui correspondent typiquement à des comportements de chasse.  Nous espérons qu’étudier tous ces critères nous aidera à mieux comprendre les circonstances des captures accidentelles afin de mieux éviter ce phénomène. 
          </p> */}

          <p>
            Bycatch due to fishery interactions is considered as the main threat to common dolphins (Delphinus delphis) in European waters. Some solutions are being investigated such as the use of pingers to prevent incidental captures. However, little is known as for the nature of these interactions and more interestingly on the circumstances of captures. This lack of knowledge implies a more challenging implementation of appropriate and effective means for mitigation of small cetaceans. Passive Acoustic Monitoring (PAM) represents a cost-effective and reliable solution to monitor how small cetaceans behave around nets using their acoustic behaviour.
          </p>
          <p>
            The aim of the APOCADO project is to address this question and to provide an insight on interactions between delphinids and fishing nets in the Iroise Sea (Brittany, France). Acoustic data was collected using Soundtraps (ST300 / ST400) directly deployed on the fishing nets. They were recording continuously at a sampling frequency of 144 kHz. Currently, four recording campaigns involving two different fishing vessels and different type of fishing nets have been conducted from May to September, cumulating more than 2400 hours of data. More instruments are to be deployed with more voluntary fishermen, data will be collected until the end of summer 2023.
          </p>
          <figure>
            <img
              src={soundtrapImg}
              alt=""
              className="rounded mx-auto d-block img-fluid img-thumbnail"
            />
            <figcaption className="small fst-italic text-center">
              SoundTrap ST400HF used in APOCADO protocol
            </figcaption>
          </figure>
          <p>
            Various whistles, clicks and buzzes are reported throughout the recordings. Whistles are typically associated with communication behaviour whilst clics and buzzes are associated with foraging behaviour. This acoustic presence around the nets is to be compared with other criteria such as the type of net used (gillnet, trammel), the location of the fisheries or the season of the catches. In addition, the data will be correlated with relevant auxiliary data such as tidal coefficients, ambient noise or night-time/daytime periods to draw additional conclusions.
          </p>
          <figure>
            <img
              src={apocadoImg}
              alt=""
              className="rounded mx-auto d-block img-fluid img-thumbnail"
            />
            <figcaption className="small fst-italic text-center">
              Position of net equipped with acoustic recorders during APOCADO protocol from June 2022 to June 2023
            </figcaption>
          </figure>
        </article>

        <article>
          <h2>CETIROISE - A one-year passive acoustic observatory in the Iroise natural marine Park to study marine mammal occurrence</h2>
          <small className="text-muted">2021-2023</small>

          <div className="d-flex flex-row align-items-center justify-content-center flex-wrap">
              <figure>
                <img
                    src={franceRelanceImg}
                    alt="France relance"
                    className="logo rounded mx-auto d-block img-fluid"
                />
              </figure>
            <figure>
              <img
                  src={logoofb}
                  alt="Office Français de la Biodiversité"
                  className="logo rounded mx-auto d-block img-fluid"
              />
            </figure>
            <figure>
              <img
                  src={logoPnmIroise}
                  alt="Parc naturel marin Iroise"
                  className="logo rounded mx-auto d-block img-fluid"
              />
            </figure>
          </div>
          {/*<figure>*/}
          {/*  <img*/}
          {/*    src={sponsoCetiroiseImg}*/}
          {/*    alt=""*/}
          {/*    className="rounded mx-auto d-block img-fluid"*/}
          {/*  />*/}
          {/*</figure>*/}

          <p>
            The Iroise Natural Marine Park hosts 2 coastal bottlenose dolphin populations, but it is also an important area for other cetacean species such as common dolphins, harbour porpoises, fin whales, risso’s dolphins and minke whales. These species are threatened by bycatch, human disturbances, noise pollution, ship strikes, etc. Knowledge on these species is still difficult to acquire. It is also almost non-existent for large cetaceans, which seem to be more and more present in the offshore part of the marine park. A good understanding of the key role of this area for cetaceans requires the deployment of different monitoring tools simultaneously. Passive acoustic monitoring allows a spatial and temporal study of different cetacean species by recording and analysing the sounds they emit. Moreover, the Iroise sector has been identified as a target sector for the study of coastal marine mammal populations by passive acoustics in the proposals for the second cycle of the European strategy for the marine environment monitoring program.
          </p>
          <p>
            In order to improve knowledge about the occurrence and seasonal distribution of cetaceans in the Iroise sea, the Iroise Marine Natural Park and ENSTA Bretagne have launched, in 2021, the CETIROISE program funded under the French economic recovery plan, with the financial support from the European Union - NextGenerationEU and the French Biodiversity Office  (OFB, Office Français de la Biodiversité).
          </p>
          <p>
            CETIROISE plans to deploy 7 autonomous instruments with hydrophones in the northern sector of the park for a full year of recording starting in May 2022. Each site will be equipped with a mooring system which includes 2 types of instruments, one dedicated small cetaceans (echolocation clicks loggers) and the second allowing the recording of all species (broadband recorder). This is the first time that the occurrences of large cetaceans such as minke whales, fin whales or humpback whales will be monitored in the Iroise sea, which seems to be a migratory crossroads for these species.
          </p>
          <figure>
            <img
              src={cetiroiseImg}
              alt=""
              className="rounded mx-auto d-block img-fluid img-thumbnail"
            />
            <figcaption className="small fst-italic text-center">
              Positions of the 7 recording points within the perimeter of the Iroise Marine Natural Park (red points A-B-C-D-G: autonomous mooring lines with acoustic release and ballast placed on the bottom and points E-F: permanent mooring systems placed on the bottom with the intervention of divers).
            </figcaption>
          </figure>
          <figure>
            <img
              src={shortMooringImg}
              alt=""
              className="rounded mx-auto d-block img-fluid img-thumbnail"
            />
            <figcaption className="small fst-italic text-center">
              Short mooring line equipped with 2 instruments (intervention by divers). <b>@Yannis Turpin – PNMI</b>
            </figcaption>
          </figure>
          <figure>
            <img
              src={mooringLineImg}
              alt=""
              className="rounded mx-auto d-block img-fluid img-thumbnail"
            />
            <figcaption className="small fst-italic text-center">
              Autonomous mooring line equipped with the 2 instruments (recovery by acoustic release).
            </figcaption>
          </figure>
        </article>

        <article>
          <h2>Optimisation du Suivie des Cétacés par Acoustique Passive (OSCAP)</h2>
          {/* <h2>Optimisation du Suivie des Cétacés par Acoustique Passive (OSCAP)</h2> */}
          {/* <p>
            L’ENSTA Bretagne effectue des suivis par acoustique passive des populations de cétacés à travers différents projets (nationaux et internationaux) et utilise la plateforme OSmOSE – Open Science meets Ocean Sound Explorers pour le traitement et l’analyse des données d’acoustique passive. Ces études sont indispensables pour améliorer les connaissances des espèces, plus particulièrement les espèces difficilement observables par les méthodes de suivis visuels classiques ou dont les densités sont actuellement faibles (e.g. la baleine bleue). 
          </p>
          <p>
            Dans le contexte de la Directive européenne Cadre Stratégie pour le Milieu Marin (DCSMM, 2008/56/CE) pour le Descripteur 1 (D1) « Biodiversité Mammifères marins – tortues marines », l’ENSTA Bretagne a élaboré en 2020 pour l’Office Français de la Biodiversité (OFB) une stratégie de suivi des populations de cétacés par acoustique passive reposant sur la mise en place d’observatoires acoustiques. 
          </p>
          <p>
            Dans ce contexte, le premier axe de cette thèse vise à développer des indicateurs de Bon État Écologique (BEE) issus de données acoustiques. Ces indicateurs découlent de métriques descriptives reposant sur la présence de signaux bio acoustiques émis par les cétacés (vocalises, clics ou sifflement). Ces métriques peuvent être le nombre de détections de signaux par période de temps, la période de temps avec au moins une détection ou encore l’intensité du signal dans la bande de fréquences des signaux acoustiques de cétacés. Elles varient le plus souvent selon les études, selon les espèces d’intérêts mais aussi selon les capacités de traitement et d’analyse. 
          </p>
          <p>
            Le second axe de cette thèse est de vérifier que le sous-échantillonnage temporel des données pour augmenter les durées de déploiement ne dégrade pas l’interprétation finale des résultats. Actuellement, les enregistreurs acoustiques permettent d’effectuer des enregistrements en continu ou par cycle de durées variables (e.g. enregistrements par cycle d’une minute sur deux, ou de dix minutes sur 20 minutes) afin d’économiser leurs batteries et permettre ainsi un relevé plus tardif des instruments. Or, si la perspective d’observatoires low-energy peut être appréciable, cette thèse s’assurera que l’information importante pour la mesure du BEE est conservée grâce au déploiement de stratégies de sous-échantillonnage temporelles optimales. 
          </p> */}
          <p className="fw-bold">
            PhD Mathilde MICHEL
          </p>
          <small className="text-muted">2022-2025</small>
          <figure>
            <img
                src={logoCNES}
                alt="AFB logo"
                className="logo rounded mx-auto d-block img-fluid"
            />
          </figure>

          <p>
            ENSTA Bretagne conducts passive acoustic monitoring of cetacean populations through various projects (national and international) and uses the OSmOSE platform - Open Science meets Ocean Sound Explorers - to process and analyze passive acoustic data. These studies are essential to improve the knowledge of species, especially species that are difficult to observe by conventional visual monitoring methods or whose densities are currently low (e.g. the blue whale).
          </p>
          <p>
            In the context of the European Marine Strategy Framework Directive (MSFD, 2008/56/EC) for Descriptor 1 (D1) "Biodiversity Marine Mammals - Marine Turtles", ENSTA Bretagne has developed in 2020 for the French Office of Biodiversity (OFB) a strategy for monitoring cetacean populations by passive acoustics based on the establishment of acoustic observatories.
          </p>
          <p>
            In this context, the first axis of this thesis aims to develop Good Ecological Status (GES) indicators based on acoustic data. These indicators are derived from descriptive metrics based on the presence of bio-acoustic signals emitted by cetaceans (vocalizations, clicks or whistles). These metrics can be the number of signal detections per time period, the time period with at least one detection, or the signal strength in the frequency band of cetacean acoustic signals. These vary most often between studies, between species of interest, but also between processing and analysis capabilities.
          </p>
          <p>
            The second axis of this thesis is to verify that temporal subsampling of data to increase deployment times does not degrade the final interpretation of results. Currently, acoustic recorders allow for continuous recording or recording in cycles of variable duration (e.g., recording in cycles of one minute over two minutes, or ten minutes over 20 minutes) in order to save battery power and allow for later instrument readings. However, while the prospect of low-energy observatories may be appreciable, this thesis will ensure that information important to the measurement of BEE is preserved through the deployment of optimal temporal subsampling strategies.
          </p>
        </article>

      </div>
    </div>
  );
};
