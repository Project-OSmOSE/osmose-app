import {PageTitle} from "../../components/PageTitle";
import {CardArticle} from "../../components/CardArticle";

import "./styles.css";

import phoque from "../../img/articles/phoque.png";
import nuitChercheur from "../../img/articles/nuitChercheur.png";
import gabrielConference from "../../img/articles/gabrielConference.png";
import gliderImmersedInENSTA_Bretagne from "../../img/articles/gliderImmersedInENSTA_Bretagne.png";
import oceanMaps from "../../img/articles/oceanMaps.png";
import shoal from "../../img/articles/Walters Shoal.png";
import paulAndAmsterdam from "../../img/articles/St. Paul and Amsterdam islands.png";
import conference_1 from "../../img/articles/conference_1.png";
import conference_2 from "../../img/articles/conference_2.png";
import poster_1 from "../../img/articles/poster_1.jpg";
import poster_2 from "../../img/articles/poster_2.jpg";

export const News: React.FC = () => {
  return (
    <div className="parallax">
      <div className="wrapper ">
        <PageTitle>
          <h1>News</h1>
        </PageTitle>

        <CardArticle
          title="Publication of a scientific paper about marine mammal acoustic presence in the Indian Ocean monitored by an underwater glider"
          stringDate="30/05/2023"
        >
          <div className="d-flex">
            <div>
              <p>
                In October, a scientific paper written by 3 members of the team
                (Julie Beesau, Flore Samaran and Maëlle Torterotot) and a former
                intern (Cécile Perrier de la Bathie) was published in Deep Sea
                Research II - Topical Studies in Oceanography.
              </p>
              <p>
                The aim of this study was to collect new information about
                marine mammal presence around two ecological hotspots in the
                Indian Ocean and to test the feasibility of using an acoustic
                glider to monitor the acoustic soundscape in remote regions.
              </p>
              <p>
                In this study, the Sea Explorer glider developed by ALSEAMAR was
                first deployed around Walters Shoal for 10 days in May 2017 and
                then around St. Paul and Amsterdam islands for about a month in
                March 2019 (Figure 2).
              </p>
            </div>
            <figure>
              <img
                src={gliderImmersedInENSTA_Bretagne}
                alt="A picture of the glider immersed in the ENSTA Bretagne water tank"
                title="A picture of the glider immersed in the ENSTA Bretagne water tank"
              />
              <figcaption>
                Figure 1 : A picture of the glider immersed in the ENSTA
                Bretagne water tank
              </figcaption>
            </figure>
          </div>
          <div className="d-flex">
            <figure>
              <img
                src={oceanMaps}
                alt="Gabriel exchanged with students"
                title="Gabriel exchanged with students"
              />
              <figcaption>
                Figure 2:
                <br />
                a) Map of the southern Indian Ocean. The two studied areas are
                circled in red and zoomed in.
                <br />
                b) Map of Walters Shoal seamount area. Black dots represent the
                glider track.
                <br />
                c) Map of St. Paul and Amsterdam islands area.
                <br />
                Red dots represent the glider track during the first mission.
                Pink dots represent the glider track during the second mission.
              </figcaption>
            </figure>
            <div>
              <p>
                To assess the marine mammal acoustic presence, all the data was
                manually visualised in the form of spectrograms by using the
                annotation platform APLOSE. Two annotation campaigns per dataset
                were organized, one for the low frequency sounds (mostly from
                baleen whales) and the other for high frequency sounds (mostly
                from delphinids, blackfish and sperm whales).
              </p>

              <p>
                The results (Figure 3) show that at both locations, the
                bioacoustic activity is relatively high with 40% of the
                recordings positive to bioacoustic detections in Walters Shoal
                and over 70% around St. Paul and Amsterdam islands. Acoustic
                data adds significant value in identifying the species of large
                baleen whales. Indeed, while visual observations only report the
                presence of unrecognized baleen whales, acoustics reveals the
                presence of multiple blue whale sub-species and acoustic
                populations and of fin whales. This study also confirmed the
                significant presence of sperm whales and killer or pilot whales
                around St. Paul and Amsterdam, and shows a clear difference
                between the high acoustic presence around the islands and the
                low acoustic presence during the journey between both islands,
                that suggests an attractivity of the islands for these species.
              </p>
              <p>
                In the future, if a glider was to be deployed again in the same
                area, it would be interesting to repeat the same track to be
                able to compare the results with the deployment presented here.
                Future glider deployments could also focus on more limited
                areas, for example the southeast of St. Paul island, with a much
                finer spatial sampling. Generally speaking, it would be
                interesting to compare the bioacoustic activity and diversity
                with that of oligotroph offshore remote areas surrounding these
                two regions.
              </p>
            </div>
          </div>
          <div className="d-flex">
            <div>
              <p>
                Recently, the team was trained by Alseamar to deploy and pilot
                the glider on their own. The next mission will likely be
                conducted in June 2023, in the offshore Bay of Biscay.To be
                continued…
              </p>
              <p>
                Reference: <br />
                Torterotot, M., Beesau, J., Perrier de la Bathie, C., & Samaran,
                F. (2022). Assessing marine mammal diversity in remote Indian
                Ocean regions , using an acoustic glider. Deep Sea Research Part
                II: Topical Studies in Oceanography, 206.
                https://doi.org/10.1016/j.dsr2.2022.105204
              </p>
            </div>
            <figure>
              <img
                src={shoal}
                alt="Gabriel exchanged with students"
                title="Gabriel exchanged with students"
              />
              <img
                src={paulAndAmsterdam}
                alt="Gabriel exchanged with students"
                title="Gabriel exchanged with students"
              />
              <figcaption>
                Figure 3: Timeline showing all detections per label during the
                glider deployments around Walters Shoal (up) and the St. Paul
                and Amsterdam islands (down). Each dot represent a positive
                detection of the call names in the y-axes.
              </figcaption>
            </figure>
          </div>
        </CardArticle>

        <CardArticle
          title="Back from the European Cetacean Society conference"
          stringDate="30/05/2023"
        >
          <div className="d-flex">
            <div>
              <br />
              <br />
              <br />
              <br />
              <p>
                The 34th annual conference of the European Cetacean Society was
                held from April 16 to 20, 2023 in O Grove, Galicia, in
                northwestern Spain, on the edge of the Atlantic Ocean. This
                conference is organized by the Bottlenose Dolphin Research
                Institute (BDRI) with the theme: "Our oceans, our future.
                Behavioral ecology of marine mammals & sustainable use of marine
                resources". This year, the conference brought together 600
                participants from 41 different countries. For 4 days,
                conferences, presentations and moments of exchange allowed
                researchers to present their new results, to exchange with each
                other, to create links, to advance scientific knowledge on the
                study of marine mammals and their preservation.
              </p>
              <p>
                Here the &nbsp;
                <a href="https://www.thebdri.com/ecs2023abstractbook.pdf">
                  abstract book
                </a>
              </p>
              <p>
                Part of the OSmOSE team went there to take part in discussions
                and enrich their thoughts. It was also an opportunity for us to
                organize a workshop entitled "Forward-looking discussion on
                passive acoustic monitoring of marine mammals for MSFD D1" with
                the aim of discussing with other EU Member States who are
                considering the use of acoustics as a method for monitoring
                cetaceans in the Marine Strategic Framework Directive (MSFD) and
                how it could be integrated into the assessment of Good
                Environmental Status.
              </p>
            </div>
            <div className="d-flex flex-column">
              <img
                src={conference_1}
                alt="Gabriel exchanged with students"
                title="Gabriel exchanged with students"
              />
              <img
                src={conference_2}
                alt="Gabriel exchanged with students"
                title="Gabriel exchanged with students"
              />
            </div>
          </div>
          <div className="d-flex toggleFlexDirection">
            <img
              src={poster_1}
              alt="Gabriel exchanged with students"
              title="Gabriel exchanged with students"
            />
            <img
              src={poster_2}
              alt="Gabriel exchanged with students"
              title="Gabriel exchanged with students"
            />
            <div>
              <p>
                Mathilde (PhD) and Mathieu (research engineer) were also able to
                present their research work with 2 posters:
                <ul>
                  <li>
                    Using passive acoustics to better understand the behavior of
                    dolphins around fishing nets in the context of bycatch,
                    Mathieu Dupont
                  </li>
                  <li>
                    Less is more? How the choice of a recording duty cycle could
                    affect the monitoring results of passive acoustic studies on
                    cetaceans, Mathilde Michel
                  </li>
                </ul>
              </p>
            </div>
          </div>

          <p>
            Next year, the 35th conference will take place in Catania, Sicily,
            and we will be there!
          </p>

          <p>
            <span className="font-weight-bold">What is ECS?</span> The European
            Cetacean Society (ECS) was established in January 1987 and aims to
            promote and advance the scientific studies and conservation efforts
            of marine mammals and to gather and disseminate information about
            them to members of the Society and the public at large. The ECS is
            coordinated by a Council of 11 members and each year organizes an
            Annual Conference in a European country. In most countries in
            Europe, the ECS is represented by a National Contact Person (NCP).
          </p>
        </CardArticle>

        <CardArticle title="XXIV RNE seminar" stringDate="13/12/2022">
          <p>Attendees : Julie Béesau – Maëlle Torterotot – Mathieu Dupont</p>
          <p>
            The annual RNE (Réseau National Échouage – French Stranding Network)
            seminar was held the 19th and 20th of November in Saint Valéry sur
            Sommes, near the Baie de Somme. The RNE is NGO that keeps track of
            marine mammals strandings along the French coast since 1970. All
            scientific actions are led by Pelagis, a national marine mammals and
            seabirds observatory. This year’ seminary was jointly organised by
            Pelagis, Picardie Nature association, Office Français de la
            Biodiversité (OFB) and gathered more than 120 people from all over
            the country.
          </p>
          <blockquote className="blockquote text-center">
            <p>
              “Every year a seminar is organised by Pelagis, the network leader.
              It is an opportunity to forge links with collaborators from all
              walks of life and to exchange knowledge on the state of marine
              mammal populations in environments as different as Rouzic or
              Martinique.”
            </p>
            <footer className="blockquote-footer">
              Source:{" "}
              <a href="www.observatoire-pelagis.cnrs.fr">
                www.observatoire-pelagis.cnrs.fr
              </a>
            </footer>
          </blockquote>

          <img src={phoque} alt="Faune sauvage" title="Faune sauvage" />
          <p>
            The theme for this seminar was “Anthropic pressures and associated
            impact”. This subject is closely related to the APOCADO project
            (lien page projet). The first results of CETIROISE and APOCADO
            projects and more generally the benefits of passive acoustics to
            monitor marine mammals populations were presented along with
            different presentations from several other speakers from Saturday to
            mid-Sunday. The presentations will be available soon on{" "}
            <a href="https://www.observatoire-pelagis.cnrs.fr/echouages/seminaires-rne/">
              Pelagis website
            </a>
            .
          </p>
          <p>
            On Sunday afternoon we had the chance to go out and watch the
            biggest seal colony in France which is settled in the Baie de
            Sommes, just a short drive from the seminar’s location. We spotted a
            group of Harbor seals (Phoca vitulina) and some Atlantic grey seals
            (Halichoerus grypus) in the distance. They lay on Baie de Somme
            beaches to get some rest, give birth, attend to the pups or shed. It
            was a reminder that one should not get too close from these animals
            as they are easily frightened and one might put the well-being of
            the pups in jeopardy.
          </p>

          <p>
            Thanks to all the participants and to the organisation who put this
            event together!
          </p>
        </CardArticle>

        <CardArticle title="Nuit des chercheurs 2022" stringDate="13/12/2022">
          <p>
            Attendees : Gabriel Dubus – Mathieu Dupont – Dorian Cazau – Mathilde
            Michel and Julie Béesau.
          </p>
          <div className="d-flex">
            <div>
              <p>
                On September 30th 2022, part of the team was involved in the
                18th edition of the nation-wide public exhibition called “Nuit
                des chercheurs”, that took place at Océanopolis in Brest. This
                year’s theme was “the unexpected” and we prepared some
                animations on our stand. Visitors could use a microphone to get
                familiar with spectrogram representation (time vs frequency
                representation of sound). They also discovered a variety of
                underwater sounds through a quiz.
              </p>
              <p>
                Moreover, Gabriel was chosen to be interviewed on his research
                work to dress a portrait of a researcher's daily
                activities.&nbsp;
                <a href="http://www.youtube.com/watch?v=QZodWBCSyR4">
                  Link to GABI’S VIDEO
                </a>
              </p>
            </div>
            <img
              src={nuitChercheur}
              alt="Gabriel exchanged with students"
              title="Gabriel exchanged with students"
            />
          </div>
          <div className="d-flex toggleFlexDirection">
            <figure>
              <img
                src={gabrielConference}
                alt="Gabriel exchanged with students"
                title="Gabriel exchanged with students"
              />
              <figcaption>
                Photo credit : Fabio Perruchet - Océanopolis
              </figcaption>
            </figure>
            <div>
              <p>
                He also exchanged with students from the Harteloire secondary
                school, by sharing with them an unexpected story that happened
                to him during his research (failed experiment, surprising
                result, unanticipated action) but did not tell the end of the
                story! 3 choices of resolution were offered to the students,
                they had to guess the right one. Here is Gabriel’ story and the
                three offered answers. You too can guess which one is the true
                one!
              </p>
              <p>
                During a mission in Hawaï where a conference on passive
                acoustics to monitor cetaceans was held, Gabriel woke up at dawn
                with his colleagues in order to board a ship to do some humpback
                whale watching. After a long waiting period, he and his
                colleagues saw…
              </p>
              <p>
                <span className="font-weight-bold">Answer A:</span> Nothing,
                absolutely nothing although the visibility conditions were
                excellent and the setting perfect, they saw nothing !
              </p>
              <p>
                <span className="font-weight-bold">Answer B:</span> They were
                not aware that militaries were working on mine-sweeping an area
                a few kilometres away. They heard a dull sound then they spotted
                huge water explosions of +10m. Terrifying sight !
              </p>
              <p>
                <span className="font-weight-bold">Answer C:</span> At sunrise,
                a hundred metres from them they saw one, then two, then three
                water bursts getting closer and closer! It was a small group of
                humpback whales passing by. Not frightened by the ship, they
                eventually got next to them and offered quite a unique show.
              </p>
            </div>
          </div>

          <p>
            <span className="font-weight-bold">Solution :</span> The right
            answer was answer A! Indeed, observation of species in its natural
            habitat can be quite unpredictable, one cannot control it!
          </p>
        </CardArticle>

        <div className="end_space"></div>
        {/*<section className="container my-5">
        <CardArticle
          title="XXIV RNE seminar"
          img={phoque}
          imgAlt="Dorian’s portrait."
        >
          <p className="">
            Attendees : Julie Béesau – Maëlle Torterotot – Mathieu Dupont
          </p>
          <p>
            The annual RNE (Réseau National Échouage – French Stranding Network)
            seminar was held the 19th and 20th of November in Saint Valéry sur
            Sommes, near the Baie de Somme. The RNE is NGO that keeps track of
            marine mammals strandings along the French coast since 1970. All
            scientific actions are led by Pelagis, a national marine mammals and
            seabirds observatory. This year’ seminary was jointly organised by
            Pelagis, Picardie Nature association, Office Français de la
            Biodiversité (OFB) and gathered more than 120 people from all over
            the country.
          </p>
          <p className="quote">
            “Every year a seminar is organised by Pelagis, the network leader.
            It is an opportunity to forge links with collaborators from all
            walks of life and to exchange knowledge on the state of marine
            mammal populations in environments as different as Rouzic or
            Martinique.” Source:{" "}
            <a href="www.observatoire-pelagis.cnrs.fr">
              www.observatoire-pelagis.cnrs.fr
            </a>
          </p>
          <p>
            The theme for this seminar was “Anthropic pressures and associated
            impact”. This subject is closely related to the APOCADO project
            (lien page projet). The first results of CETIROISE and APOCADO
            projects and more generally the benefits of passive acoustics to
            monitor marine mammals populations were presented along with
            different presentations from several other speakers from Saturday to
            mid-Sunday. The presentations will be available soon on{" "}
            <a href="https://www.observatoire-pelagis.cnrs.fr/echouages/seminaires-rne/">
              Pelagis website
            </a>
            .
          </p>
          <p>
            On Sunday afternoon we had the chance to go out and watch the
            biggest seal colony in France which is settled in the Baie de
            Sommes, just a short drive from the seminar’s location. We spotted a
            group of Harbor seals (Phoca vitulina) and some Atlantic grey seals
            (Halichoerus grypus) in the distance. They lay on Baie de Somme
            beaches to get some rest, give birth, attend to the pups or shed. It
            was a reminder that one should not get too close from these animals
            as they are easily frightened and one might put the well-being of
            the pups in jeopardy.
          </p>

          <p>
            Thanks to all the participants and to the organisation who put this
            event together!
          </p>
        </CardArticle>
  </section>*/}
      </div>
    </div>
  );
};
