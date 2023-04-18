import {PageTitle} from "../../components/PageTitle";
import {CardArticle} from "../../components/CardArticle";

import "./styles.css";

import phoque from "../../img/articles/phoque.png";
import nuitChercheur from "../../img/articles/nuitChercheur.png";
import gabrielConference from "../../img/articles/gabrielConference.png";

export const News: React.FC = () => {
  return (
    <div className="parallax">
      <div className="wrapper ">
        <PageTitle>
          <h1>News</h1>
        </PageTitle>

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
                work to dress a portrait of a researcher's daily activities.&nbsp;
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
            school, by sharing with them an unexpected story that happened to
            him during his research (failed experiment, surprising result,
            unanticipated action) but did not tell the end of the story! 3
            choices of resolution were offered to the students, they had to
            guess the right one. Here is Gabriel’ story and the three offered
            answers. You too can guess which one is the true one!
          </p>
          <p>
            During a mission in Hawaï where a conference on passive acoustics to
            monitor cetaceans was held, Gabriel woke up at dawn with his
            colleagues in order to board a ship to do some humpback whale
            watching. After a long waiting period, he and his colleagues saw…
          </p>
          <p>
            <span className="font-weight-bold">Answer A:</span> Nothing,
            absolutely nothing although the visibility conditions were excellent
            and the setting perfect, they saw nothing !
          </p>
          <p>
            <span className="font-weight-bold">Answer B:</span> They were not
            aware that militaries were working on mine-sweeping an area a few
            kilometres away. They heard a dull sound then they spotted huge
            water explosions of +10m. Terrifying sight !
          </p>
          <p>
            <span className="font-weight-bold">Answer C:</span> At sunrise, a
            hundred metres from them they saw one, then two, then three water
            bursts getting closer and closer! It was a small group of humpback
            whales passing by. Not frightened by the ship, they eventually got
            next to them and offered quite a unique show.
          </p>
            </div>
                  </div>

          <p>
            <span className="font-weight-bold">Solution :</span> The right answer
            was answer A! Indeed, observation of species in its natural habitat
            can be quite unpredictable, one cannot control it!
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
